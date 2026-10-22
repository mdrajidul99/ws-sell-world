export type UserRole = 'user' | 'admin';

export interface UserFinances {
  balanceBDT: number;
  pendingBDT: number;
  balanceUSDT: number;
  pendingUSDT: number;
}

export interface UserProfile {
  uid: string;
  username: string;
  normalizedUsername: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  emailVerified: boolean;
  role: UserRole;
  languagePreference: 'en' | 'bn';
  themePreference: 'system' | 'light' | 'dark';
  finances: UserFinances;
  status: 'active' | 'suspended';
}

export type WorkRequestStatus = 'pending' | 'approved' | 'rejected';

export interface WorkRequest {
  id: string;
  userId: string;
  userEmail: string;
  username: string;
  preferredLanguage: 'en' | 'bn';
  accountCountryCode: string; // e.g. +880, +1, etc.
  whatsappNumber: string;
  accountAgeDays?: number;
  expectedEarningsBDT?: number;
  expectedEarningsUSDT?: number;
  assignedPrice?: number;
  assignedCurrency?: 'BDT' | 'USDT';
  priceSetBy?: string;
  priceSetAt?: string;
  priceHistory?: Array<{
    price: number;
    currency: 'BDT' | 'USDT';
    updatedAt: string;
    setBy: string;
    notes?: string;
  }>;
  approvedEarnings?: number;
  approvedCurrency?: 'BDT' | 'USDT';
  status: WorkRequestStatus;
  rejectionReason?: string;
  adminNotes?: string;
  conversationId: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface PricingTier {
  id: string;
  label: string;
  minAgeDays: number;
  bdtPrice: number;
  usdtPrice: number;
}

export interface PricingConfig {
  defaultBdtPrice: number;
  defaultUsdtPrice: number;
  minBdtPrice: number;
  minUsdtPrice: number;
  tiers: PricingTier[];
  notes?: string;
  updatedAt: string;
  updatedBy: string;
}

export type PaymentMethod = 'bKash' | 'Nagad' | 'USDT';
export type UsdtNetwork = 'BSC (BEP20)' | 'Polygon PoS' | 'APTOS' | 'Mantle Network (USDT0)';
export type WithdrawalStatus = 'pending' | 'paid' | 'rejected' | 'refunded';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail: string;
  username: string;
  method: PaymentMethod;
  currency: 'BDT' | 'USDT';
  network?: UsdtNetwork;
  amount: number;
  recipientMobileNumber?: string;
  walletAddress?: string;
  status: WithdrawalStatus;
  transactionReference?: string; // TxID or crypto TxHash
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  processedBy?: string;
}

export type TransactionType =
  | 'approved_earning'
  | 'withdrawal_reserved'
  | 'withdrawal_paid'
  | 'withdrawal_refund'
  | 'authorized_adjustment';

export interface TransactionLedgerItem {
  id: string;
  userId: string;
  userEmail: string;
  type: TransactionType;
  currency: 'BDT' | 'USDT';
  amount: number;
  referenceId: string; // work request ID or withdrawal ID
  description: string;
  status: 'completed' | 'pending' | 'reversed';
  createdAt: string;
  actorId: string; // user UID or admin UID
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderUid: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  text: string;
  timestamp: number | string;
}

export interface AdminAuditLog {
  id: string;
  actorUid: string;
  actorEmail: string;
  action: string;
  targetType: 'work_request' | 'withdrawal' | 'user' | 'balance_adjustment';
  targetId: string;
  details: string;
  createdAt: string;
}
