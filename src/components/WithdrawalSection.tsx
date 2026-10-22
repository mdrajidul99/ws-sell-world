import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
  PaymentMethod,
  UsdtNetwork,
  WithdrawalRequest
} from '../firebase/types';
import {
  createWithdrawalRequest,
  getUserWithdrawals,
  getMinimumForMethod,
  validateBangladeshPhone,
  validateCryptoAddress
} from '../firebase/services/withdrawals';
import {
  ArrowDownCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Coins
} from 'lucide-react';

export const WithdrawalSection: React.FC = () => {
  const { user, profile } = useAuth();
  const { t, formatText } = useLanguage();

  const [method, setMethod] = useState<PaymentMethod>('bKash');
  const [network, setNetwork] = useState<UsdtNetwork>('BSC (BEP20)');
  const [amount, setAmount] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const finances = profile?.finances || {
    balanceBDT: 0,
    pendingBDT: 0,
    balanceUSDT: 0,
    pendingUSDT: 0,
  };

  const { min: currentMin, currency: currentCurrency } = getMinimumForMethod(
    method,
    method === 'USDT' ? network : undefined
  );

  const availableBalanceForMethod =
    currentCurrency === 'BDT' ? finances.balanceBDT || 0 : finances.balanceUSDT || 0;

  const loadHistory = async () => {
    if (!user) return;
    try {
      const list = await getUserWithdrawals(user.uid);
      setWithdrawals(list);
    } catch (err) {
      console.warn('Failed to fetch withdrawals:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid withdrawal amount.');
      return;
    }

    if (numericAmount < currentMin) {
      setError(
        formatText(t.amountBelowMinimum, {
          min: currentMin,
          currency: currentCurrency,
        })
      );
      return;
    }

    if (numericAmount > availableBalanceForMethod) {
      setError(t.insufficientBalance);
      return;
    }

    if (method === 'bKash' || method === 'Nagad') {
      if (!validateBangladeshPhone(recipientPhone)) {
        setError(t.invalidPhoneNumber);
        return;
      }
    } else if (method === 'USDT') {
      if (!validateCryptoAddress(network, walletAddress)) {
        setError(t.invalidWalletAddress);
        return;
      }
    }

    setShowConfirmModal(true);
  };

  const handleExecuteWithdrawal = async () => {
    setShowConfirmModal(false);
    setError(null);
    setSubmitting(true);

    const numericAmount = parseFloat(amount);

    try {
      await createWithdrawalRequest({
        method,
        network: method === 'USDT' ? network : undefined,
        amount: numericAmount,
        recipientMobileNumber: method !== 'USDT' ? recipientPhone.trim() : undefined,
        walletAddress: method === 'USDT' ? walletAddress.trim() : undefined,
      });

      setSuccess(t.withdrawalCreatedSuccess);
      setAmount('');
      setRecipientPhone('');
      setWalletAddress('');
      await loadHistory();
    } catch (err: any) {
      setError(err.message || 'Failed to submit withdrawal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <ArrowDownCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <span>{t.withdrawFunds}</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Instant withdrawal to Bangladesh local mobile wallets (bKash, Nagad) or International USDT on supported chains.
        </p>
      </div>

      {/* Available Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t.availableBalanceBDT}
            </span>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              ৳ {Number(finances.balanceBDT || 0).toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-amber-500 font-bold block">Reserved: ৳ {Number(finances.pendingBDT || 0).toFixed(2)}</span>
            <span className="text-[11px] text-slate-400">bKash / Nagad</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t.availableBalanceUSDT}
            </span>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              $ {Number(finances.balanceUSDT || 0).toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-amber-500 font-bold block">Reserved: $ {Number(finances.pendingUSDT || 0).toFixed(2)}</span>
            <span className="text-[11px] text-slate-400">USDT Web3</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Withdrawal Form & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs h-fit space-y-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Submit Withdrawal Request</span>
          </h2>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handlePreSubmit} className="space-y-4">
            {/* Method Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.selectMethod}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('bKash')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    method === 'bKash'
                      ? 'bg-pink-500/10 border-pink-500 text-pink-600 dark:text-pink-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  bKash
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('Nagad')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    method === 'Nagad'
                      ? 'bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Nagad
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('USDT')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    method === 'USDT'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  USDT (Crypto)
                </button>
              </div>
            </div>

            {/* If USDT is selected, pick from 4 strictly supported networks */}
            {method === 'USDT' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.selectCryptoNetwork}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['BSC (BEP20)', 'Polygon PoS', 'APTOS', 'Mantle Network (USDT0)'] as UsdtNetwork[]).map(
                    (net) => {
                      const netMin = getMinimumForMethod('USDT', net).min;
                      return (
                        <button
                          key={net}
                          type="button"
                          onClick={() => setNetwork(net)}
                          className={`p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                            network === net
                              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="font-semibold">{net}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Min: {netMin} USDT
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* Recipient Details: Phone or Crypto Address */}
            {method !== 'USDT' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.recipientPhone} ({method})
                </label>
                <input
                  type="text"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder={t.recipientPhonePlaceholder}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Must be an active personal 11-digit mobile account.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.walletAddress} ({network})
                </label>
                <input
                  type="text"
                  required
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder={`Enter ${network} USDT wallet address`}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Double check network compatibility to prevent loss of funds.
                </p>
              </div>
            )}

            {/* Amount Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.withdrawalAmount} ({currentCurrency})
                </label>
                <button
                  type="button"
                  onClick={() => setAmount(String(availableBalanceForMethod))}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  Max: {availableBalanceForMethod} {currentCurrency}
                </button>
              </div>
              <input
                type="number"
                step="any"
                required
                min={currentMin}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Minimum ${currentMin} ${currentCurrency}`}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Minimum Note Badge */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>Required Minimum:</span>
              <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                {currentMin} {currentCurrency}
              </strong>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? t.submittingWithdrawal : t.submitWithdrawalButton}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Withdrawal History Column */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.withdrawalHistory}
            </h2>
            <span className="text-xs text-slate-400">
              Total records: {withdrawals.length}
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {loadingHistory ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading history...</div>
            ) : withdrawals.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                <ArrowDownCircle className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                <p>{t.noWithdrawalsYet}</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-2 font-semibold">{t.date}</th>
                    <th className="pb-2 font-semibold">{t.method}</th>
                    <th className="pb-2 font-semibold">{t.amount}</th>
                    <th className="pb-2 font-semibold">Recipient / Address</th>
                    <th className="pb-2 font-semibold">{t.status}</th>
                    <th className="pb-2 font-semibold">{t.txHashOrId}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 text-slate-500 whitespace-nowrap">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {w.method} {w.network ? `(${w.network})` : ''}
                      </td>
                      <td className="py-3 font-mono font-bold whitespace-nowrap text-slate-900 dark:text-white">
                        {w.currency === 'BDT' ? '৳' : '$'} {w.amount}
                      </td>
                      <td className="py-3 font-mono text-[11px] text-slate-500 max-w-[140px] truncate">
                        {w.recipientMobileNumber || w.walletAddress || '—'}
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
                          {w.status === 'paid'
                            ? t.statusPaid
                            : w.status === 'refunded'
                            ? t.statusRefunded
                            : w.status === 'rejected'
                            ? t.statusRejected
                            : t.statusPending}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[11px] text-slate-400 max-w-[120px] truncate">
                        {w.transactionReference || (w.rejectionReason ? `Reason: ${w.rejectionReason}` : 'Pending')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>{t.confirmWithdrawal}</span>
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.confirmWithdrawalDesc}
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Method:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {method} {method === 'USDT' ? `(${network})` : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {amount} {currentCurrency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                  {recipientPhone || walletAddress}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleExecuteWithdrawal}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
