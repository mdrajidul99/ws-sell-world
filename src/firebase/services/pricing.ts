import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth, isUserAdmin } from '../config';
import { PricingConfig, WorkRequest } from '../types';
import { handleFirestoreError, OperationType } from '../errorHandling';
import { recordAdminAuditLog } from './admin';

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  defaultBdtPrice: 100,
  defaultUsdtPrice: 1.0,
  minBdtPrice: 20,
  minUsdtPrice: 0.20,
  tiers: [
    { id: 'tier_fresh', label: '1 - 30 Days Line', minAgeDays: 0, bdtPrice: 80, usdtPrice: 0.8 },
    { id: 'tier_standard', label: '30 - 90 Days Line', minAgeDays: 30, bdtPrice: 120, usdtPrice: 1.2 },
    { id: 'tier_aged', label: '90 - 365 Days Line', minAgeDays: 90, bdtPrice: 180, usdtPrice: 1.8 },
    { id: 'tier_veteran', label: '1+ Year Aged Line', minAgeDays: 365, bdtPrice: 250, usdtPrice: 2.5 },
  ],
  notes: 'Official WS Sell World baseline pricing',
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

/**
 * Get the current Pricing Configuration from Firestore (or fallback defaults)
 */
export async function getPricingConfig(): Promise<PricingConfig> {
  const docRef = doc(db, 'appConfig', 'pricing');
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as PricingConfig;
    }
    return DEFAULT_PRICING_CONFIG;
  } catch (err) {
    console.warn('Failed to load pricing config, using defaults:', err);
    return DEFAULT_PRICING_CONFIG;
  }
}

/**
 * Admin: Update Global Pricing Configuration
 */
export async function updatePricingConfig(newConfig: Partial<PricingConfig>): Promise<void> {
  const admin = auth.currentUser;
  if (!admin || !isUserAdmin(admin.uid, admin.email)) {
    throw new Error('UNAUTHORIZED_ADMIN');
  }

  const docRef = doc(db, 'appConfig', 'pricing');
  const payload: PricingConfig = {
    ...DEFAULT_PRICING_CONFIG,
    ...newConfig,
    updatedAt: new Date().toISOString(),
    updatedBy: admin.uid,
  };

  try {
    await setDoc(docRef, payload, { merge: true });
    await recordAdminAuditLog({
      action: 'UPDATE_PRICING_CONFIG',
      targetType: 'balance_adjustment',
      targetId: 'appConfig_pricing',
      details: `Updated default BDT rate to ৳${payload.defaultBdtPrice}, USDT rate to $${payload.defaultUsdtPrice}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'appConfig/pricing');
  }
}

/**
 * Admin: Set or adjust the specific price for an individual Work Request
 */
export async function assignWorkRequestPrice(params: {
  requestId: string;
  price: number;
  currency: 'BDT' | 'USDT';
  notes?: string;
}): Promise<void> {
  const admin = auth.currentUser;
  if (!admin || !isUserAdmin(admin.uid, admin.email)) {
    throw new Error('UNAUTHORIZED_ADMIN');
  }

  if (params.price <= 0) {
    throw new Error('Price must be greater than zero.');
  }

  const reqRef = doc(db, 'workRequests', params.requestId);
  const snap = await getDoc(reqRef);
  if (!snap.exists()) {
    throw new Error('WORK_REQUEST_NOT_FOUND');
  }

  const data = snap.data() as WorkRequest;
  if (data.status === 'approved') {
    throw new Error('CANNOT_CHANGE_PRICE_ON_APPROVED_REQUEST');
  }

  const existingHistory = data.priceHistory || [];
  const newHistoryEntry = {
    price: params.price,
    currency: params.currency,
    updatedAt: new Date().toISOString(),
    setBy: admin.uid,
    notes: params.notes || '',
  };

  try {
    await updateDoc(reqRef, {
      assignedPrice: params.price,
      assignedCurrency: params.currency,
      priceSetBy: admin.uid,
      priceSetAt: new Date().toISOString(),
      priceHistory: [...existingHistory, newHistoryEntry],
      updatedAt: new Date().toISOString(),
    });

    await recordAdminAuditLog({
      action: 'SET_WORK_REQUEST_PRICE',
      targetType: 'work_request',
      targetId: params.requestId,
      details: `Set price for #${params.requestId.slice(-6)} to ${params.price} ${params.currency}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `workRequests/${params.requestId}`);
  }
}
