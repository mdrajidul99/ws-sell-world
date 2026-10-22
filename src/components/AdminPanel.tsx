import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
  getAllWorkRequests,
  approveWorkRequest,
  rejectWorkRequest
} from '../firebase/services/workRequests';
import {
  getAllWithdrawals,
  approveAndMarkPaidWithdrawal,
  rejectAndRefundWithdrawal
} from '../firebase/services/withdrawals';
import {
  getAllUsers,
  getAdminAuditLogs,
  toggleUserStatus
} from '../firebase/services/admin';
import {
  subscribeToChatMessages,
  sendChatMessage
} from '../firebase/services/chat';
import {
  getPricingConfig,
  updatePricingConfig,
  assignWorkRequestPrice
} from '../firebase/services/pricing';
import {
  WorkRequest,
  WithdrawalRequest,
  UserProfile,
  AdminAuditLog,
  ChatMessage,
  PricingConfig,
  PricingTier
} from '../firebase/types';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  Clock,
  ArrowDownCircle,
  MessageSquare,
  Search,
  Filter,
  DollarSign,
  Send,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  History,
  Lock,
  Tag,
  Edit3,
  Save,
  ArrowLeft,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

interface AdminPanelProps {
  onExit?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onExit }) => {
  const { user, isAdmin } = useAuth();
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'withdrawals' | 'users' | 'chat' | 'audit' | 'pricing'>('overview');

  // Data states
  const [workRequests, setWorkRequests] = useState<WorkRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
  const [editingPricing, setEditingPricing] = useState<PricingConfig | null>(null);
  const [savingPricing, setSavingPricing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [withdrawalFilter, setWithdrawalFilter] = useState<'all' | 'pending' | 'paid' | 'rejected'>('all');

  // Modals for admin actions
  const [selectedReqForAction, setSelectedReqForAction] = useState<WorkRequest | null>(null);
  const [earningAmount, setEarningAmount] = useState<string>('50');
  const [earningCurrency, setEarningCurrency] = useState<'BDT' | 'USDT'>('BDT');
  const [actionNotes, setActionNotes] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showApproveReqModal, setShowApproveReqModal] = useState(false);
  const [showRejectReqModal, setShowRejectReqModal] = useState(false);

  // Price adjustment modal per work request
  const [showAssignPriceModal, setShowAssignPriceModal] = useState(false);
  const [reqForPriceAssign, setReqForPriceAssign] = useState<WorkRequest | null>(null);
  const [targetPriceInput, setTargetPriceInput] = useState<string>('100');
  const [targetCurrencyInput, setTargetCurrencyInput] = useState<'BDT' | 'USDT'>('BDT');
  const [priceAssignNotes, setPriceAssignNotes] = useState<string>('');
  const [savingRequestPrice, setSavingRequestPrice] = useState(false);

  // Withdrawal action modals
  const [selectedWdForAction, setSelectedWdForAction] = useState<WithdrawalRequest | null>(null);
  const [txRefInput, setTxRefInput] = useState<string>('');
  const [wdRejectReason, setWdRejectReason] = useState<string>('');
  const [showApproveWdModal, setShowApproveWdModal] = useState(false);
  const [showRejectWdModal, setShowRejectWdModal] = useState(false);

  // Live Chat Management
  const [selectedChatReq, setSelectedChatReq] = useState<WorkRequest | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadAllAdminData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [reqs, wds, users, logs, pConfig] = await Promise.all([
        getAllWorkRequests(),
        getAllWithdrawals(),
        getAllUsers(),
        getAdminAuditLogs(50),
        getPricingConfig(),
      ]);
      setWorkRequests(reqs);
      setWithdrawals(wds);
      setUsersList(users);
      setAuditLogs(logs);
      setPricingConfig(pConfig);
      setEditingPricing(JSON.parse(JSON.stringify(pConfig)));

      if (reqs.length > 0 && !selectedChatReq) {
        setSelectedChatReq(reqs[0]);
      }
    } catch (err) {
      console.warn('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllAdminData();
    }
  }, [isAdmin]);

  // Subscribe to chat messages if chat tab or chat preview is active
  useEffect(() => {
    if (!selectedChatReq) return;
    const unsub = subscribeToChatMessages(selectedChatReq.conversationId, (msgs) => {
      setChatMessages(msgs);
    });
    return () => unsub();
  }, [selectedChatReq?.conversationId]);

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {t.accessDeniedAdminOnly}
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          This portal is strictly reserved for the designated administrator (UID: ZMNTSLxjJWOBEK3DlnqxUXQycAO2).
        </p>
      </div>
    );
  }

  // Handle Approve Request
  const handleApproveWork = async () => {
    if (!selectedReqForAction) return;
    const amountNum = parseFloat(earningAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setActionFeedback({ message: 'Please enter a valid positive earning amount.', type: 'error' });
      return;
    }

    try {
      await approveWorkRequest({
        requestId: selectedReqForAction.id,
        earningAmount: amountNum,
        currency: earningCurrency,
        adminNotes: actionNotes.trim(),
      });
      setShowApproveReqModal(false);
      setSelectedReqForAction(null);
      setActionNotes('');
      setActionFeedback({ message: t.paymentApprovedSuccess, type: 'success' });
      await loadAllAdminData();
    } catch (err: any) {
      setActionFeedback({ message: err.message || 'Approval failed.', type: 'error' });
    }
  };

  // Handle Reject Request
  const handleRejectWork = async () => {
    if (!selectedReqForAction || !rejectionReason.trim()) {
      setActionFeedback({ message: 'Rejection reason is required.', type: 'error' });
      return;
    }

    try {
      await rejectWorkRequest({
        requestId: selectedReqForAction.id,
        rejectionReason: rejectionReason.trim(),
        adminNotes: actionNotes.trim(),
      });
      setShowRejectReqModal(false);
      setSelectedReqForAction(null);
      setRejectionReason('');
      setActionNotes('');
      setActionFeedback({ message: t.requestRejectedSuccess, type: 'success' });
      await loadAllAdminData();
    } catch (err: any) {
      setActionFeedback({ message: err.message || 'Rejection failed.', type: 'error' });
    }
  };

  // Handle Mark Withdrawal Paid
  const handleApproveWithdrawal = async () => {
    if (!selectedWdForAction || !txRefInput.trim()) {
      setActionFeedback({ message: 'Transaction ID or TxHash is required.', type: 'error' });
      return;
    }

    try {
      await approveAndMarkPaidWithdrawal({
        withdrawalId: selectedWdForAction.id,
        transactionReference: txRefInput.trim(),
        adminNotes: actionNotes.trim(),
      });
      setShowApproveWdModal(false);
      setSelectedWdForAction(null);
      setTxRefInput('');
      setActionNotes('');
      setActionFeedback({ message: t.paymentApprovedSuccess, type: 'success' });
      await loadAllAdminData();
    } catch (err: any) {
      setActionFeedback({ message: err.message || 'Payment update failed.', type: 'error' });
    }
  };

  // Handle Reject & Refund Withdrawal
  const handleRejectWithdrawal = async () => {
    if (!selectedWdForAction || !wdRejectReason.trim()) {
      setActionFeedback({ message: 'Rejection reason is required for refunding.', type: 'error' });
      return;
    }

    try {
      await rejectAndRefundWithdrawal({
        withdrawalId: selectedWdForAction.id,
        rejectionReason: wdRejectReason.trim(),
        adminNotes: actionNotes.trim(),
      });
      setShowRejectWdModal(false);
      setSelectedWdForAction(null);
      setWdRejectReason('');
      setActionNotes('');
      setActionFeedback({ message: t.withdrawalRefundedSuccess, type: 'success' });
      await loadAllAdminData();
    } catch (err: any) {
      setActionFeedback({ message: err.message || 'Refund failed.', type: 'error' });
    }
  };

  // Handle Save Dynamic Pricing Configuration
  const handleSavePricing = async () => {
    if (!editingPricing) return;
    setSavingPricing(true);
    try {
      await updatePricingConfig(editingPricing);
      setPricingConfig(JSON.parse(JSON.stringify(editingPricing)));
      setActionFeedback({
        message: language === 'bn' ? 'মূল্য নির্ধারণ সেটিংস সফলভাবে সংরক্ষিত হয়েছে।' : 'Pricing configuration successfully saved and published.',
        type: 'success'
      });
      await loadAllAdminData();
    } catch (err: any) {
      setActionFeedback({
        message: err.message || 'Failed to save pricing configuration.',
        type: 'error'
      });
    } finally {
      setSavingPricing(false);
    }
  };

  // Handle Save Price for a Specific Work Request
  const handleSaveRequestPrice = async () => {
    if (!reqForPriceAssign) return;
    const priceNum = parseFloat(targetPriceInput);
    if (isNaN(priceNum) || priceNum <= 0) {
      setActionFeedback({ message: 'Price must be greater than zero.', type: 'error' });
      return;
    }

    setSavingRequestPrice(true);
    try {
      await assignWorkRequestPrice({
        requestId: reqForPriceAssign.id,
        price: priceNum,
        currency: targetCurrencyInput,
        notes: priceAssignNotes.trim(),
      });
      setShowAssignPriceModal(false);
      setReqForPriceAssign(null);
      setPriceAssignNotes('');
      setActionFeedback({
        message: language === 'bn' ? 'অনুরোধের নির্ধারিত মূল্য সফলভাবে আপডেট করা হয়েছে।' : 'Target request price updated successfully.',
        type: 'success'
      });
      await loadAllAdminData();
    } catch (err: any) {
      setActionFeedback({ message: err.message || 'Failed to assign price.', type: 'error' });
    } finally {
      setSavingRequestPrice(false);
    }
  };

  // Admin send reply in chat
  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedChatReq || sendingReply) return;

    const text = adminReplyText.trim();
    setAdminReplyText('');
    setSendingReply(true);
    try {
      await sendChatMessage({
        conversationId: selectedChatReq.conversationId,
        text,
      });
    } catch (err) {
      console.warn('Failed to send admin reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  // Calculations for overview
  const totalUsers = usersList.length;
  const verifiedUsers = usersList.filter((u) => u.emailVerified || u.role === 'admin').length;
  const pendingRequests = workRequests.filter((r) => r.status === 'pending').length;
  const pendingWds = withdrawals.filter((w) => w.status === 'pending').length;
  const totalBdtPaid = withdrawals
    .filter((w) => w.status === 'paid' && w.currency === 'BDT')
    .reduce((sum, w) => sum + w.amount, 0);
  const totalUsdtPaid = withdrawals
    .filter((w) => w.status === 'paid' && w.currency === 'USDT')
    .reduce((sum, w) => sum + w.amount, 0);

  const filteredRequests = workRequests.filter((r) => {
    if (requestFilter === 'all') return true;
    return r.status === requestFilter;
  });

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (withdrawalFilter === 'all') return true;
    return w.status === withdrawalFilter;
  });

  const filteredUsers = usersList.filter((u) => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.uid.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Admin Top Bar with Exit to User Portal */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <img
            src="https://raw.githubusercontent.com/mdrajidul99/mrs-engineers-assets/main/WS%20Sell%20World%20Logo.png"
            alt="WS Sell World"
            className="w-7 h-7 object-contain rounded"
            referrerPolicy="no-referrer"
          />
          <span className="font-bold text-sm tracking-wide text-slate-900 dark:text-white">
            WS Sell World Management Console
          </span>
        </div>
        {onExit && (
          <button
            onClick={onExit}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.userPortal}</span>
          </button>
        )}
      </div>

      {/* Subheader and Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {t.adminTitle}
            </h1>
            <span className="text-[11px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded">
              ROOT ADMIN
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Logged in as {user?.email} · UID: <span className="font-mono">{user?.uid}</span>
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.adminOverview}
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1.5 rounded-md cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.adminWorkRequests} ({pendingRequests})
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-3 py-1.5 rounded-md cursor-pointer ${
              activeTab === 'withdrawals'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.adminWithdrawals} ({pendingWds})
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-3 py-1.5 rounded-md cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pricing'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t.pricingManagement || 'Pricing'}</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-md cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.adminLiveChat}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-md cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.adminUsers}
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-md cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.adminAuditHistory}
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200'
          }`}
        >
          <span>{actionFeedback.message}</span>
          <button onClick={() => setActionFeedback(null)} className="text-xs font-bold px-2 py-0.5">
            ✕
          </button>
        </div>
      )}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{t.totalUsersCount}</span>
                <Users className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {totalUsers}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                {verifiedUsers} verified accounts
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{t.pendingRequestsCount}</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                {pendingRequests}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Total requests: {workRequests.length}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{t.pendingWithdrawalsCount}</span>
                <ArrowDownCircle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                {pendingWds}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Total withdrawals: {withdrawals.length}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Payouts Disbursed</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1">
                ৳ {totalBdtPaid.toFixed(2)}
              </div>
              <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                $ {totalUsdtPaid.toFixed(2)} USDT
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Pending Requests Review */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Pending Work Review Queue
                </h3>
                <button
                  onClick={() => setActiveTab('requests')}
                  className="text-xs text-emerald-600 font-semibold hover:underline"
                >
                  Manage All
                </button>
              </div>

              {workRequests.filter((r) => r.status === 'pending').length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No pending work requests.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {workRequests
                    .filter((r) => r.status === 'pending')
                    .slice(0, 5)
                    .map((r) => (
                      <div key={r.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {r.accountCountryCode} {r.whatsappNumber}
                          </span>
                          <p className="text-[11px] text-slate-400">User: {r.username} ({r.userEmail})</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedReqForAction(r);
                            setShowApproveReqModal(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md cursor-pointer"
                        >
                          Review & Approve
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Quick Pending Withdrawals Queue */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Pending Withdrawal Processing
                </h3>
                <button
                  onClick={() => setActiveTab('withdrawals')}
                  className="text-xs text-emerald-600 font-semibold hover:underline"
                >
                  Manage All
                </button>
              </div>

              {withdrawals.filter((w) => w.status === 'pending').length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No pending withdrawals.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {withdrawals
                    .filter((w) => w.status === 'pending')
                    .slice(0, 5)
                    .map((w) => (
                      <div key={w.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {w.currency === 'BDT' ? '৳' : '$'} {w.amount} via {w.method} {w.network ? `(${w.network})` : ''}
                          </span>
                          <p className="text-[11px] font-mono text-slate-400">
                            {w.recipientMobileNumber || w.walletAddress}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedWdForAction(w);
                            setShowApproveWdModal(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md cursor-pointer"
                        >
                          Mark Sent (TxID)
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. WORK REQUESTS TAB */}
      {activeTab === 'requests' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              All WhatsApp Review Requests ({workRequests.length})
            </h2>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setRequestFilter(st)}
                  className={`px-3 py-1 rounded-md font-semibold capitalize cursor-pointer ${
                    requestFilter === st
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2 font-semibold">Request ID</th>
                  <th className="pb-2 font-semibold">User</th>
                  <th className="pb-2 font-semibold">WhatsApp Number</th>
                  <th className="pb-2 font-semibold">Age</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold">Target Price</th>
                  <th className="pb-2 font-semibold">Approved Earnings</th>
                  <th className="pb-2 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      #{r.id.slice(-6)}
                    </td>
                    <td className="py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">{r.username}</div>
                      <div className="text-[10px] text-slate-400">{r.userEmail}</div>
                    </td>
                    <td className="py-3 font-mono font-semibold whitespace-nowrap">
                      {r.accountCountryCode} {r.whatsappNumber}
                    </td>
                    <td className="py-3 text-slate-500 whitespace-nowrap">
                      {r.accountAgeDays} days
                    </td>
                    <td className="py-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : r.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono whitespace-nowrap">
                      {r.assignedPrice ? (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {r.assignedCurrency === 'BDT' ? '৳' : '$'}{r.assignedPrice} {r.assignedCurrency || 'BDT'}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Auto / Default</span>
                      )}
                    </td>
                    <td className="py-3 font-mono font-semibold whitespace-nowrap">
                      {r.approvedEarnings ? `+${r.approvedEarnings} ${r.approvedCurrency}` : '—'}
                    </td>
                    <td className="py-3 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => {
                          setSelectedChatReq(r);
                          setActiveTab('chat');
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded cursor-pointer"
                      >
                        Chat
                      </button>
                      {r.status === 'pending' && (
                        <button
                          onClick={() => {
                            setReqForPriceAssign(r);
                            setTargetPriceInput(r.assignedPrice ? r.assignedPrice.toString() : '100');
                            setTargetCurrencyInput(r.assignedCurrency || 'BDT');
                            setPriceAssignNotes(r.adminNotes || '');
                            setShowAssignPriceModal(true);
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 rounded border border-amber-200 dark:border-amber-800 cursor-pointer"
                          title="Set Custom Price for this WhatsApp Request"
                        >
                          Set Price
                        </button>
                      )}
                      {r.status !== 'approved' && (
                        <button
                          onClick={() => {
                            setSelectedReqForAction(r);
                            setEarningAmount(r.assignedPrice ? r.assignedPrice.toString() : '100');
                            setEarningCurrency(r.assignedCurrency || 'BDT');
                            setShowApproveReqModal(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {r.status !== 'rejected' && (
                        <button
                          onClick={() => {
                            setSelectedReqForAction(r);
                            setShowRejectReqModal(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded cursor-pointer"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. WITHDRAWALS TAB */}
      {activeTab === 'withdrawals' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Withdrawal Queue ({withdrawals.length})
            </h2>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
              {(['all', 'pending', 'paid', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setWithdrawalFilter(st)}
                  className={`px-3 py-1 rounded-md font-semibold capitalize cursor-pointer ${
                    withdrawalFilter === st
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2 font-semibold">User</th>
                  <th className="pb-2 font-semibold">Method & Network</th>
                  <th className="pb-2 font-semibold">Amount</th>
                  <th className="pb-2 font-semibold">Recipient Mobile / Address</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold">TxID / Hash</th>
                  <th className="pb-2 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredWithdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">{w.username}</div>
                      <div className="text-[10px] text-slate-400">{w.userEmail}</div>
                    </td>
                    <td className="py-3 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
                      {w.method} {w.network ? `(${w.network})` : ''}
                    </td>
                    <td className="py-3 font-mono font-bold whitespace-nowrap text-slate-900 dark:text-white">
                      {w.currency === 'BDT' ? '৳' : '$'} {w.amount}
                    </td>
                    <td className="py-3 font-mono text-[11px] text-slate-500 max-w-xs truncate">
                      {w.recipientMobileNumber || w.walletAddress}
                    </td>
                    <td className="py-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          w.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : w.status === 'refunded'
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                            : w.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-slate-500 max-w-[120px] truncate">
                      {w.transactionReference || '—'}
                    </td>
                    <td className="py-3 text-right whitespace-nowrap space-x-1.5">
                      {w.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedWdForAction(w);
                              setShowApproveWdModal(true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded cursor-pointer"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => {
                              setSelectedWdForAction(w);
                              setShowRejectWdModal(true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 rounded cursor-pointer"
                          >
                            Reject & Refund
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. LIVE CHAT TAB */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          {/* Threads list */}
          <div className="lg:col-span-4 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 pb-3 border-b border-slate-100 dark:border-slate-800">
              User Conversations
            </h3>
            <div className="mt-3 flex-1 overflow-y-auto space-y-2">
              {workRequests.map((r) => {
                const active = selectedChatReq?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedChatReq(r)}
                    className={`w-full text-left p-3 rounded-lg border text-xs cursor-pointer ${
                      active
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {r.accountCountryCode} {r.whatsappNumber}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      User: {r.username} ({r.userEmail})
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active conversation */}
          <div className="lg:col-span-8 flex flex-col h-full">
            {selectedChatReq ? (
              <>
                <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedChatReq.accountCountryCode} {selectedChatReq.whatsappNumber}
                    </span>
                    <span className="text-slate-400 ml-2">Lang: {selectedChatReq.preferredLanguage.toUpperCase()}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">
                    Request ID: #{selectedChatReq.id.slice(-6)}
                  </span>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40 dark:bg-slate-950/20">
                  {chatMessages.map((msg) => {
                    const isAdminMsg = msg.senderRole === 'admin';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}
                      >
                        <div className="text-[10px] text-slate-400 mb-0.5">
                          {isAdminMsg ? 'You (Admin)' : msg.senderName}
                        </div>
                        <div
                          className={`max-w-[70%] px-3.5 py-2 rounded-xl text-xs ${
                            isAdminMsg
                              ? 'bg-emerald-600 text-white rounded-tr-xs'
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-tl-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form
                  onSubmit={handleSendAdminReply}
                  className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    placeholder="Type reply as Administrator..."
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={!adminReplyText.trim() || sendingReply}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. USERS DIRECTORY TAB */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Registered Users ({usersList.length})
            </h2>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder={t.searchUsersPlaceholder}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2 font-semibold">User</th>
                  <th className="pb-2 font-semibold">UID</th>
                  <th className="pb-2 font-semibold">Email Verified</th>
                  <th className="pb-2 font-semibold">Balance BDT</th>
                  <th className="pb-2 font-semibold">Balance USDT</th>
                  <th className="pb-2 font-semibold">Role</th>
                  <th className="pb-2 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">{u.username}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {u.uid.slice(0, 12)}...
                    </td>
                    <td className="py-3 whitespace-nowrap">
                      {u.emailVerified ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-amber-500 font-medium">Unverified</span>
                      )}
                    </td>
                    <td className="py-3 font-mono whitespace-nowrap">
                      ৳ {Number(u.finances?.balanceBDT || 0).toFixed(2)}
                    </td>
                    <td className="py-3 font-mono whitespace-nowrap">
                      $ {Number(u.finances?.balanceUSDT || 0).toFixed(2)}
                    </td>
                    <td className="py-3 uppercase text-[10px] font-bold text-slate-500">
                      {u.role}
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => toggleUserStatus(u.uid, u.status || 'active').then(loadAllAdminData)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                          u.status === 'suspended'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60'
                        }`}
                      >
                        {u.status || 'active'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. AUDIT TRAIL TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              <span>Administrative Audit Trail ({auditLogs.length})</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2 font-semibold">Timestamp</th>
                  <th className="pb-2 font-semibold">Actor Email</th>
                  <th className="pb-2 font-semibold">Action</th>
                  <th className="pb-2 font-semibold">Target</th>
                  <th className="pb-2 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {log.actorEmail}
                    </td>
                    <td className="py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-3 text-slate-500 whitespace-nowrap">
                      {log.targetType} #{log.targetId.slice(-6)}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. DYNAMIC PRICING MANAGEMENT TAB */}
      {activeTab === 'pricing' && editingPricing && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-emerald-600" />
                  <span>{t.pricingManagement || 'Dynamic WhatsApp Pricing Management'}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Configure baseline purchase prices and tier pricing across account ages. Changes update live user estimates.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSavePricing}
                disabled={savingPricing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingPricing ? 'Saving Changes...' : (t.savePricingChanges || 'Save & Apply Pricing')}</span>
              </button>
            </div>

            {/* Baseline Settings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Default BDT Price (৳)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={editingPricing.defaultBdtPrice}
                    onChange={(e) =>
                      setEditingPricing({
                        ...editingPricing,
                        defaultBdtPrice: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400">Standard payout for unaged line</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Default USDT Price ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="0.1"
                    step="0.05"
                    value={editingPricing.defaultUsdtPrice}
                    onChange={(e) =>
                      setEditingPricing({
                        ...editingPricing,
                        defaultUsdtPrice: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400">Equivalent baseline in USDT</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Minimum BDT Price (৳)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={editingPricing.minBdtPrice || 20}
                    onChange={(e) =>
                      setEditingPricing({
                        ...editingPricing,
                        minBdtPrice: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400">Floor price permitted</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Minimum USDT Price ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="0.05"
                    step="0.05"
                    value={editingPricing.minUsdtPrice || 0.2}
                    onChange={(e) =>
                      setEditingPricing({
                        ...editingPricing,
                        minUsdtPrice: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400">Floor price permitted</span>
              </div>
            </div>

            {/* Account Age Tiers Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Tiered Rates by Account Age
              </h3>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Tier Label</th>
                      <th className="py-2.5 px-4 font-semibold">Min Age (Days)</th>
                      <th className="py-2.5 px-4 font-semibold">BDT Payout (৳)</th>
                      <th className="py-2.5 px-4 font-semibold">USDT Payout ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {editingPricing.tiers.map((tier, idx) => (
                      <tr key={tier.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          <input
                            type="text"
                            value={tier.label}
                            onChange={(e) => {
                              const updatedTiers = [...editingPricing.tiers];
                              updatedTiers[idx].label = e.target.value;
                              setEditingPricing({ ...editingPricing, tiers: updatedTiers });
                            }}
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          <input
                            type="number"
                            min="0"
                            value={tier.minAgeDays}
                            onChange={(e) => {
                              const updatedTiers = [...editingPricing.tiers];
                              updatedTiers[idx].minAgeDays = Number(e.target.value) || 0;
                              setEditingPricing({ ...editingPricing, tiers: updatedTiers });
                            }}
                            className="w-20 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                          />
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          <div className="flex items-center gap-1">
                            <span>৳</span>
                            <input
                              type="number"
                              min="1"
                              value={tier.bdtPrice}
                              onChange={(e) => {
                                const updatedTiers = [...editingPricing.tiers];
                                updatedTiers[idx].bdtPrice = Number(e.target.value) || 0;
                                setEditingPricing({ ...editingPricing, tiers: updatedTiers });
                              }}
                              className="w-28 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          <div className="flex items-center gap-1">
                            <span>$</span>
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={tier.usdtPrice}
                              onChange={(e) => {
                                const updatedTiers = [...editingPricing.tiers];
                                updatedTiers[idx].usdtPrice = Number(e.target.value) || 0;
                                setEditingPricing({ ...editingPricing, tiers: updatedTiers });
                              }}
                              className="w-24 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes / Instructions */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Pricing Guidelines & Admin Memo
              </label>
              <textarea
                rows={2}
                value={editingPricing.notes || ''}
                onChange={(e) => setEditingPricing({ ...editingPricing, notes: e.target.value })}
                placeholder="Official notes regarding pricing updates..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Last updated: {new Date(editingPricing.updatedAt).toLocaleString()}</span>
                <span>Editor: {editingPricing.updatedBy}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPROVE WORK REQUEST */}
      {showApproveReqModal && selectedReqForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Approve WhatsApp Request #{selectedReqForAction.id.slice(-6)}
            </h3>

            <p className="text-xs text-slate-500">
              Account: {selectedReqForAction.accountCountryCode} {selectedReqForAction.whatsappNumber} ({selectedReqForAction.username})
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Currency
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEarningCurrency('BDT')}
                    className={`p-2 rounded-lg border text-xs font-semibold ${
                      earningCurrency === 'BDT'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    BDT (৳)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEarningCurrency('USDT')}
                    className={`p-2 rounded-lg border text-xs font-semibold ${
                      earningCurrency === 'USDT'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    USDT ($)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Award Earning Amount ({earningCurrency})
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={earningAmount}
                  onChange={(e) => setEarningAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Admin Internal Note (Optional)
                </label>
                <input
                  type="text"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Verification confirmed"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowApproveReqModal(false)}
                className="px-3 py-1.5 text-xs text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveWork}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
              >
                Confirm Approval & Credit Balance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT WORK REQUEST */}
      {showRejectReqModal && selectedReqForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Reject WhatsApp Request #{selectedReqForAction.id.slice(-6)}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rejection Reason (Visible to user)
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Account does not meet minimum age criteria or unverified phone line."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectReqModal(false)}
                className="px-3 py-1.5 text-xs text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectWork}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MARK WITHDRAWAL PAID */}
      {showApproveWdModal && selectedWdForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Confirm Payment Sent for #{selectedWdForAction.id.slice(-6)}
            </h3>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg text-xs space-y-1">
              <div>
                <strong>Amount:</strong> {selectedWdForAction.currency === 'BDT' ? '৳' : '$'}{' '}
                {selectedWdForAction.amount} ({selectedWdForAction.method})
              </div>
              <div className="truncate font-mono">
                <strong>Recipient:</strong>{' '}
                {selectedWdForAction.recipientMobileNumber || selectedWdForAction.walletAddress}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Transaction ID / TxHash (Required)
              </label>
              <input
                type="text"
                required
                value={txRefInput}
                onChange={(e) => setTxRefInput(e.target.value)}
                placeholder="e.g. bKash TrxID or Blockchain TxHash"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowApproveWdModal(false)}
                className="px-3 py-1.5 text-xs text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveWithdrawal}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
              >
                Mark Paid & Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT & REFUND WITHDRAWAL */}
      {showRejectWdModal && selectedWdForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Reject & Refund Withdrawal #{selectedWdForAction.id.slice(-6)}
            </h3>

            <p className="text-xs text-slate-500">
              The reserved amount ({selectedWdForAction.amount} {selectedWdForAction.currency}) will be returned immediately to user&apos;s available balance.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason for Rejection
              </label>
              <textarea
                rows={3}
                required
                value={wdRejectReason}
                onChange={(e) => setWdRejectReason(e.target.value)}
                placeholder="e.g. Invalid account number or network mismatch"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectWdModal(false)}
                className="px-3 py-1.5 text-xs text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectWithdrawal}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Confirm Rejection & Refund Funds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN / ADJUST WORK REQUEST PRICE */}
      {showAssignPriceModal && reqForPriceAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>Set Target Price for Request #{reqForPriceAssign.id.slice(-6)}</span>
            </h3>

            <p className="text-xs text-slate-500">
              Account: {reqForPriceAssign.accountCountryCode} {reqForPriceAssign.whatsappNumber} ({reqForPriceAssign.username})
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Currency
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetCurrencyInput('BDT')}
                    className={`p-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                      targetCurrencyInput === 'BDT'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    BDT (৳)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetCurrencyInput('USDT')}
                    className={`p-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                      targetCurrencyInput === 'USDT'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    USDT ($)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Price ({targetCurrencyInput})
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={targetPriceInput}
                  onChange={(e) => setTargetPriceInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason / Notes for Price (Optional)
                </label>
                <input
                  type="text"
                  value={priceAssignNotes}
                  onChange={(e) => setPriceAssignNotes(e.target.value)}
                  placeholder="e.g. Premium active business account / high activity bonus"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAssignPriceModal(false)}
                className="px-3 py-1.5 text-xs text-slate-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRequestPrice}
                disabled={savingRequestPrice}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer disabled:opacity-50"
              >
                {savingRequestPrice ? 'Saving...' : 'Save Price'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
