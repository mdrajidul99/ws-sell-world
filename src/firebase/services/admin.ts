import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  orderBy,
  limit,
  updateDoc
} from 'firebase/firestore';
import { db, auth, isUserAdmin } from '../config';
import { AdminAuditLog, UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../errorHandling';

/**
 * Record an audit log for an administrator action
 */
export async function recordAdminAuditLog(params: {
  action: string;
  targetType: 'work_request' | 'withdrawal' | 'user' | 'balance_adjustment';
  targetId: string;
  details: string;
}): Promise<void> {
  const admin = auth.currentUser;
  if (!admin) return;

  const logId = 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const logRef = doc(db, 'adminAuditLogs', logId);

  const logEntry: AdminAuditLog = {
    id: logId,
    actorUid: admin.uid,
    actorEmail: admin.email || 'admin',
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    details: params.details,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(logRef, logEntry);
  } catch (err) {
    console.warn('Failed to record admin audit log:', err);
  }
}

/**
 * Fetch recent admin audit logs
 */
export async function getAdminAuditLogs(maxCount = 50): Promise<AdminAuditLog[]> {
  const admin = auth.currentUser;
  if (!admin || !isUserAdmin(admin.uid, admin.email)) {
    throw new Error('UNAUTHORIZED_ADMIN');
  }

  const colRef = collection(db, 'adminAuditLogs');
  try {
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(maxCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as AdminAuditLog);
  } catch {
    try {
      const snap = await getDocs(colRef);
      const list = snap.docs.map((d) => d.data() as AdminAuditLog);
      return list
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, maxCount);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'adminAuditLogs');
    }
  }
}

/**
 * Admin: Fetch all registered users
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  const admin = auth.currentUser;
  if (!admin || !isUserAdmin(admin.uid, admin.email)) {
    throw new Error('UNAUTHORIZED_ADMIN');
  }

  const colRef = collection(db, 'users');
  try {
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data() as UserProfile);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'users');
  }
}

/**
 * Admin: Toggle user status between active and suspended
 */
export async function toggleUserStatus(targetUid: string, currentStatus: 'active' | 'suspended'): Promise<void> {
  const admin = auth.currentUser;
  if (!admin || !isUserAdmin(admin.uid, admin.email)) {
    throw new Error('UNAUTHORIZED_ADMIN');
  }

  const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
  const userRef = doc(db, 'users', targetUid);

  try {
    await updateDoc(userRef, { status: newStatus });
    await recordAdminAuditLog({
      action: 'TOGGLE_USER_STATUS',
      targetType: 'user',
      targetId: targetUid,
      details: `Changed user status from ${currentStatus} to ${newStatus}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
  }
}
