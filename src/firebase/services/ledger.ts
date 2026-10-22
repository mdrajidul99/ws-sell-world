import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db, auth, isUserAdmin } from '../config';
import { TransactionLedgerItem } from '../types';
import { handleFirestoreError, OperationType } from '../errorHandling';

/**
 * Fetch transaction history for current user
 */
export async function getUserTransactions(userId: string): Promise<TransactionLedgerItem[]> {
  const colRef = collection(db, 'transactions');
  try {
    const q = query(colRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as TransactionLedgerItem);
  } catch {
    try {
      const fallbackQ = query(colRef, where('userId', '==', userId));
      const snap = await getDocs(fallbackQ);
      const list = snap.docs.map((d) => d.data() as TransactionLedgerItem);
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'transactions');
    }
  }
}

/**
 * Admin: Fetch all transaction records
 */
export async function getAllTransactions(): Promise<TransactionLedgerItem[]> {
  const admin = auth.currentUser;
  if (!admin || !isUserAdmin(admin.uid, admin.email)) {
    throw new Error('UNAUTHORIZED_ADMIN');
  }

  const colRef = collection(db, 'transactions');
  try {
    const snap = await getDocs(colRef);
    const list = snap.docs.map((d) => d.data() as TransactionLedgerItem);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'transactions');
  }
}
