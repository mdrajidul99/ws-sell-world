import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  runTransaction,
  updateDoc
} from 'firebase/firestore';
import { db, auth, isUserAdmin } from '../config';
import {
  PaymentMethod,
  UsdtNetwork,
  WithdrawalRequest,
  WithdrawalStatus,
  TransactionLedgerItem
} from '../types';
import { handleFirestoreError, OperationType } from '../errorHandling';
import { recordAdminAuditLog } from './admin';

// Minimum requirements configuration
export const WITHDRAWAL_MINIMUMS = {
  bKash: { min: 15, currency: 'BDT' as const },
  Nagad: { min: 15, currency: 'BDT' as const },
  'BSC (BEP20)': { min: 10, currency: 'USDT' as const },
  'Polygon PoS': { min: 1, currency: 'USDT' as const },
  APTOS: { min: 0.20, currency: 'USDT' as const },
  'Mantle Network (USDT0)': { min: 0.30, currency: 'USDT' as const },
};

export function getMinimumForMethod(method: PaymentMethod, network?: UsdtNetwork): { min: number; currency: 'BDT' | 'USDT' } {
  if (method === 'bKash') return WITHDRAWAL_MINIMUMS.bKash;
  if (method === 'Nagad') return WITHDRAWAL_MINIMUMS.Nagad;
  if (network && WITHDRAWAL_MINIMUMS[network]) {
    return WITHDRAWAL_MINIMUMS[network];
  }
  return { min: 1, currency: 'USDT' };
}

export function validateBangladeshPhone(phone: string): boolean {
  const clean = phone.replace(/[\s\-]/g, '');
  return /^01[3-9]\d{8}$/.test(clean);
}

export function validateCryptoAddress(network: UsdtNetwork, address: string): boolean {
  const clean = address.trim();
  if (network === 'BSC (BEP20)' || network === 'Polygon PoS' || network === 'Mantle Network (USDT0)') {
    // EVM: 0x followed by 40 hex chars = 42 chars
    return /^0x[a-fA-F0-9]{40}$/.test(clean);
  }
  if (network === 'APTOS') {
    // Aptos: 0x followed by 64 hex chars = 66 chars (or variable 0x[0-9a-fA-F]{1,64})
    return /^0x[a-fA-F0-9]{64}$/.test(clean) || /^0x[a-fA-F0-9]{1,64}$/.test(clean);
  }
  return clean.length >= 26;
}

/**
 * Creates a withdrawal request and atomically reserves the balance
 */
export async function createWithdrawalRequest(params: {
  method: PaymentMethod;
  network?: UsdtNetwork;
  amount: number;
  recipientMobileNumber?: string;
  walletAddress?: string;
}): Promise<WithdrawalRequest> {
  const user = auth.currentUser;
  if (!user) throw new Error('NOT_AUTHENTICATED');

  const { min, currency } = getMinimumForMethod(params.method, params.network);

  if (params.amount < min) {
    throw new Error(`AMOUNT_BELOW_MINIMUM:${min}:${currency}`);
  }

  if (params.method === 'bKash' || params.method === 'Nagad') {
    if (!params.recipientMobileNumber || !validateBangladeshPhone(params.recipientMobileNumber)) {
      throw new Error('INVALID_PHONE_NUMBER');
    }
  } else if (params.method === 'USDT') {
    if (!params.network) throw new Error('NETWORK_REQUIRED');
    if (!params.walletAddress || !validateCryptoAddress(params.network, params.walletAddress)) {
      throw new Error('INVALID_WALLET_ADDRESS');
    }
  }

  const withdrawalId = 'wd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const userRef = doc(db, 'users', user.uid);
  const withdrawalRef = doc(db, 'withdrawals', withdrawalId);
  const txId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const ledgerRef = doc(db, 'transactions', txId);

  let createdRequest: WithdrawalRequest;

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) {
      throw new Error('USER_NOT_FOUND');
    }

    const userData = userSnap.data();
    const finances = userData.finances || {
      balanceBDT: 0,
      pendingBDT: 0,
      balanceUSDT: 0,
      pendingUSDT: 0,
    };

    if (currency === 'BDT') {
      if ((finances.balanceBDT || 0) < params.amount) {
        throw new Error('INSUFFICIENT_BALANCE');
      }
      finances.balanceBDT -= params.amount;
      finances.pendingBDT = (finances.pendingBDT || 0) + params.amount;
    } else {
      if ((finances.balanceUSDT || 0) < params.amount) {
        throw new Error('INSUFFICIENT_BALANCE');
      }
      finances.balanceUSDT -= params.amount;
      finances.pendingUSDT = (finances.pendingUSDT || 0) + params.amount;
    }

    createdRequest = {
      id: withdrawalId,
      userId: user.uid,
      userEmail: user.email || '',
      username: userData.username || user.displayName || 'User',
      method: params.method,
      currency,
      network: params.network,
      amount: params.amount,
      recipientMobileNumber: params.recipientMobileNumber ? params.recipientMobileNumber.trim() : undefined,
      walletAddress: params.walletAddress ? params.walletAddress.trim() : undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const ledgerItem: TransactionLedgerItem = {
      id: txId,
      userId: user.uid,
      userEmail: user.email || '',
      type: 'withdrawal_reserved',
      currency,
      amount: params.amount,
      referenceId: withdrawalId,
      description: `Withdrawal reserved via ${params.method}${params.network ? ' (' + params.network + ')' : ''}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      actorId: user.uid,
    };

    transaction.update(userRef, { finances });
    transaction.set(withdrawalRef, createdRequest);
    transaction.set(ledgerRef, ledgerItem);
  });

  return createdRequest!;
}

/**
 * Fetch withdrawals for current user
 */
export async function getUserWithdrawals(userId: string): Promise<WithdrawalRequest[]> {
  const colRef = collection(db, 'withdrawals');
  try {
    const q = query(colRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as WithdrawalRequest);
  } catch {
    try {
      const fallbackQ = query(colRef, where('userId', '==', userId));
      const fallbackSnap = await getDocs(fallbackQ);
      const list = fallbackSnap.docs.map((d) => d.data() as WithdrawalRequest);
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'withdrawals');
    }
  }
}

/**
 * Admin: Fetch all withdrawals
 */
export async function getAllWithdrawals(statusFilter?: WithdrawalStatus): Promise<WithdrawalRequest[]> {
  const admin = auth.currentUser;
  if (!admin || !isUserAdmin(admin.uid, admin.email)) {
    throw new Error('UNAUTHORIZED_ADMIN');
  }

  const colRef = collection(db, 'withdrawals');
  try {
    const snap = await getDocs(colRef);
    let list = snap.docs.map((d) => d.data() as WithdrawalRequest);
    if (statusFilter) {
      list = list.filter((w) => w.status === statusFilter);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'withdrawals');
  }
}

/**
 * Admin: Mark withdrawal as Paid/Completed
 */
export async function approveAndMarkPaidWithdrawal(params: {
  withdrawalId: string;
  transactionReference: string;
  adminNotes?: string;
}): Promise<void> {
  const admin = auth.currentUser;
  if (!admin || !isUserAdmin(admin.uid, admin.email)) {
    throw new Error('UNAUTHORIZED_ADMIN');
  }

  if (!params.transactionReference.trim()) {
    throw new Error('TRANSACTION_REF_REQUIRED');
  }

  const withdrawalRef = doc(db, 'withdrawals', params.withdrawalId);

  await runTransaction(db, async (transaction) => {
    const wdSnap = await transaction.get(withdrawalRef);
    if (!wdSnap.exists()) {
      throw new Error('WITHDRAWAL_NOT_FOUND');
    }

    const wdData = wdSnap.data() as WithdrawalRequest;
    if (wdData.status === 'paid') {
      throw new Error('ALREADY_PAID');
    }
    if (wdData.status === 'refunded' || wdData.status === 'rejected') {
      throw new Error('CANNOT_PAY_REJECTED_WITHDRAWAL');
    }

    const userRef = doc(db, 'users', wdData.userId);
    const userSnap = await transaction.get(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const finances = userData.finances || {};
      if (wdData.currency === 'BDT') {
        finances.pendingBDT = Math.max(0, (finances.pendingBDT || 0) - wdData.amount);
      } else {
        finances.pendingUSDT = Math.max(0, (finances.pendingUSDT || 0) - wdData.amount);
      }
      transaction.update(userRef, { finances });
    }

    // Ledger item
    const txId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const ledgerRef = doc(db, 'transactions', txId);
    const ledgerItem: TransactionLedgerItem = {
      id: txId,
      userId: wdData.userId,
      userEmail: wdData.userEmail,
      type: 'withdrawal_paid',
      currency: wdData.currency,
      amount: wdData.amount,
      referenceId: wdData.id,
      description: `Withdrawal paid via ${wdData.method}. Ref: ${params.transactionReference.trim()}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      actorId: admin.uid,
    };

    transaction.update(withdrawalRef, {
      status: 'paid',
      transactionReference: params.transactionReference.trim(),
      adminNotes: params.adminNotes || wdData.adminNotes || '',
      updatedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      processedBy: admin.uid,
    });

    transaction.set(ledgerRef, ledgerItem);
  });

  await recordAdminAuditLog({
    action: 'MARK_WITHDRAWAL_PAID',
    targetType: 'withdrawal',
    targetId: params.withdrawalId,
    details: `Marked withdrawal #${params.withdrawalId} as paid with ref: ${params.transactionReference}`,
  });
}

/**
 * Admin: Reject withdrawal and refund reserved amount
 */
export async function rejectAndRefundWithdrawal(params: {
  withdrawalId: string;
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

  const withdrawalRef = doc(db, 'withdrawals', params.withdrawalId);

  await runTransaction(db, async (transaction) => {
    const wdSnap = await transaction.get(withdrawalRef);
    if (!wdSnap.exists()) {
      throw new Error('WITHDRAWAL_NOT_FOUND');
    }

    const wdData = wdSnap.data() as WithdrawalRequest;
    if (wdData.status === 'refunded' || wdData.status === 'rejected') {
      throw new Error('ALREADY_REFUNDED');
    }
    if (wdData.status === 'paid') {
      throw new Error('CANNOT_REFUND_PAID_WITHDRAWAL');
    }

    const userRef = doc(db, 'users', wdData.userId);
    const userSnap = await transaction.get(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const finances = userData.finances || {};
      if (wdData.currency === 'BDT') {
        finances.pendingBDT = Math.max(0, (finances.pendingBDT || 0) - wdData.amount);
        finances.balanceBDT = (finances.balanceBDT || 0) + wdData.amount;
      } else {
        finances.pendingUSDT = Math.max(0, (finances.pendingUSDT || 0) - wdData.amount);
        finances.balanceUSDT = (finances.balanceUSDT || 0) + wdData.amount;
      }
      transaction.update(userRef, { finances });
    }

    // Ledger Item for refund
    const txId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const ledgerRef = doc(db, 'transactions', txId);
    const ledgerItem: TransactionLedgerItem = {
      id: txId,
      userId: wdData.userId,
      userEmail: wdData.userEmail,
      type: 'withdrawal_refund',
      currency: wdData.currency,
      amount: wdData.amount,
      referenceId: wdData.id,
      description: `Withdrawal refunded: ${params.rejectionReason.trim()}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      actorId: admin.uid,
    };

    transaction.update(withdrawalRef, {
      status: 'rejected',
      rejectionReason: params.rejectionReason.trim(),
      adminNotes: params.adminNotes || wdData.adminNotes || '',
      updatedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      processedBy: admin.uid,
    });

    transaction.set(ledgerRef, ledgerItem);
  });

  await recordAdminAuditLog({
    action: 'REJECT_AND_REFUND_WITHDRAWAL',
    targetType: 'withdrawal',
    targetId: params.withdrawalId,
    details: `Rejected withdrawal #${params.withdrawalId} with reason: ${params.rejectionReason}`,
  });
}
