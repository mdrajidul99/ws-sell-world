import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db, auth, isUserAdmin } from '../config';
import { WorkRequest, WorkRequestStatus, TransactionLedgerItem } from '../types';
import { handleFirestoreError, OperationType } from '../errorHandling';
import { recordAdminAuditLog } from './admin';

/**
 * Creates a WhatsApp account review request
 */
export async function createWorkRequest(params: {
  preferredLanguage: 'en' | 'bn';
  accountCountryCode: string;
  whatsappNumber: string;
  accountAgeDays?: number;
  notes?: string;
}): Promise<WorkRequest> {
  const user = auth.currentUser;
  if (!user) throw new Error('NOT_AUTHENTICATED');

  // Verify phone number format
  const cleanNumber = params.whatsappNumber.replace(/[^0-9]/g, '');
  if (cleanNumber.length < 8 || cleanNumber.length > 15) {
    throw new Error('INVALID_PHONE_NUMBER');
  }

  const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const conversationId = requestId; // 1-to-1 conversation per work request

  const newRequest: WorkRequest = {
    id: requestId,
    userId: user.uid,
    userEmail: user.email || '',
    username: user.displayName || user.email?.split('@')[0] || 'User',
    preferredLanguage: params.preferredLanguage,
    accountCountryCode: params.accountCountryCode || '+880',
    whatsappNumber: cleanNumber,
    accountAgeDays: params.accountAgeDays || 0,
    status: 'pending',
    conversationId,
    adminNotes: params.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const reqDocRef = doc(db, 'workRequests', requestId);
  try {
    await setDoc(reqDocRef, newRequest);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `workRequests/${requestId}`);
  }

  return newRequest;
}

/**
 * Fetches current user's work requests
 */
export async function getUserWorkRequests(userId: string): Promise<WorkRequest[]> {
  const colRef = collection(db, 'workRequests');
  const q = query(
    colRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  try {
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as WorkRequest);
  } catch (err) {
    // If composite index is pending, fallback query without orderBy
    try {
      const fallbackQ = query(colRef, where('userId', '==', userId));
      const fallbackSnap = await getDocs(fallbackQ);
      const list = fallbackSnap.docs.map((d) => d.data() as WorkRequest);
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (fallbackErr) {
      handleFirestoreError(fallbackErr, OperationType.LIST, 'workRequests');
    }
  }
}

/**
 * Admin: Get all work requests
 */
export async function getAllWorkRequests(statusFilter?: WorkRequestStatus): Promise<WorkRequest[]> {
  const user = auth.currentUser;
  if (!user || !isUserAdmin(user.uid, user.email)) {
    throw new Error('UNAUTHORIZED_ADMIN');
  }

  const colRef = collection(db, 'workRequests');
  try {
    const snap = await getDocs(colRef);
    let list = snap.docs.map((d) => d.data() as WorkRequest);
    if (statusFilter) {
      list = list.filter((r) => r.status === statusFilter);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'workRequests');
  }
}

/**
 * Admin: Approve a work request and award earnings atomically
 */
export async function approveWorkRequest(params: {
  requestId: string;
  earningAmount: number;
  currency: 'BDT' | 'USDT';
  adminNotes?: string;
}): Promise<void> {
  const admin = auth.currentUser;
  if (!admin || !isUserAdmin(admin.uid, admin.email)) {
    throw new Error('UNAUTHORIZED_ADMIN');
  }

  if (params.earningAmount <= 0) {
    throw new Error('INVALID_EARNING_AMOUNT');
  }

  const requestRef = doc(db, 'workRequests', params.requestId);

  await runTransaction(db, async (transaction) => {
    const reqSnap = await transaction.get(requestRef);
    if (!reqSnap.exists()) {
      throw new Error('REQUEST_NOT_FOUND');
    }

    const reqData = reqSnap.data() as WorkRequest;
    if (reqData.status === 'approved') {
      throw new Error('ALREADY_APPROVED');
    }

    const userRef = doc(db, 'users', reqData.userId);
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) {
      throw new Error('USER_NOT_FOUND');
    }

    const userData = userSnap.data();
    const currentFinances = userData.finances || {
      balanceBDT: 0,
      pendingBDT: 0,
      balanceUSDT: 0,
      pendingUSDT: 0,
    };

    // Update user finances
    const updatedFinances = { ...currentFinances };
    if (params.currency === 'BDT') {
      updatedFinances.balanceBDT = (updatedFinances.balanceBDT || 0) + params.earningAmount;
    } else {
      updatedFinances.balanceUSDT = (updatedFinances.balanceUSDT || 0) + params.earningAmount;
    }

    // Ledger Transaction ID
    const txId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const ledgerRef = doc(db, 'transactions', txId);

    const ledgerItem: TransactionLedgerItem = {
      id: txId,
      userId: reqData.userId,
      userEmail: reqData.userEmail,
      type: 'approved_earning',
      currency: params.currency,
      amount: params.earningAmount,
      referenceId: params.requestId,
      description: `Earning approved for WhatsApp request #${params.requestId.slice(-6)}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      actorId: admin.uid,
    };

    // Commit writes in transaction
    transaction.update(requestRef, {
      status: 'approved',
      approvedEarnings: params.earningAmount,
      approvedCurrency: params.currency,
      adminNotes: params.adminNotes || reqData.adminNotes || '',
      updatedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      reviewedBy: admin.uid,
    });

    transaction.update(userRef, {
      finances: updatedFinances,
    });

    transaction.set(ledgerRef, ledgerItem);
  });

  // Log audit
  await recordAdminAuditLog({
    action: 'APPROVE_WORK_REQUEST',
    targetType: 'work_request',
    targetId: params.requestId,
    details: `Approved request #${params.requestId} with ${params.earningAmount} ${params.currency}`,
  });
}

/**
 * Admin: Reject a work request
 */
export async function rejectWorkRequest(params: {
  requestId: string;
  rejectionReason: string;
  adminNotes?: string;
}): Promise<void> {
  const admin = auth.currentUser;
  if (!admin || !isUserAdmin(admin.uid, admin.email)) {
    throw new Error('UNAUTHORIZED_ADMIN');
  }

  if (!params.rejectionReason.trim()) {
    throw new Error('REJECTION_REASON_REQUIRED');
  }

  const requestRef = doc(db, 'workRequests', params.requestId);
  const snap = await getDoc(requestRef);
  if (!snap.exists()) {
    throw new Error('REQUEST_NOT_FOUND');
  }

  await updateDoc(requestRef, {
    status: 'rejected',
    rejectionReason: params.rejectionReason.trim(),
    adminNotes: params.adminNotes || snap.data()?.adminNotes || '',
    updatedAt: new Date().toISOString(),
    reviewedAt: new Date().toISOString(),
    reviewedBy: admin.uid,
  });

  await recordAdminAuditLog({
    action: 'REJECT_WORK_REQUEST',
    targetType: 'work_request',
    targetId: params.requestId,
    details: `Rejected request #${params.requestId}: ${params.rejectionReason}`,
  });
}
