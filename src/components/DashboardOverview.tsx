import React, { useEffect, useState } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getUserWorkRequests } from '../firebase/services/workRequests';
import { getUserWithdrawals } from '../firebase/services/withdrawals';
import { WorkRequest, WithdrawalRequest } from '../firebase/types';
import {
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowDownCircle,
  FileText,
  ShieldCheck,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface DashboardOverviewProps {
  onNavigate: (view: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const { user, profile, isVerified } = useAuth();
  const { t } = useLanguage();

  const [requests, setRequests] = useState<WorkRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const [reqs, wds] = await Promise.all([
          getUserWorkRequests(user.uid),
          getUserWithdrawals(user.uid),
        ]);
        setRequests(reqs.slice(0, 5));
        setWithdrawals(wds.slice(0, 5));
      } catch (err) {
        console.warn('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const finances = profile?.finances || {
    balanceBDT: 0,
    pendingBDT: 0,
    balanceUSDT: 0,
    pendingUSDT: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Account Identity Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {t.welcomeBack}, {profile?.username || user?.displayName || 'Partner'}
            </h1>
            {isVerified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                {t.verified}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-3 h-3" />
                {t.unverified}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {user?.email} · UID: <span className="font-mono">{user?.uid.slice(0, 10)}...</span>
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('sell_whatsapp')}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t.sellWhatsApp}</span>
          </button>
          <button
            onClick={() => onNavigate('withdraw')}
            className="px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ArrowDownCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t.withdraw}</span>
          </button>
          <button
            onClick={() => onNavigate('transactions')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{t.transactions}</span>
          </button>
        </div>
      </div>

      {/* Financial Balances Grid (BDT & USDT Strictly Separated) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available BDT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span>{t.availableBalanceBDT}</span>
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              BDT
            </span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            ৳ {Number(finances.balanceBDT || 0).toFixed(2)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Available for instant bKash & Nagad withdrawal
          </p>
        </div>

        {/* Pending BDT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span>{t.pendingBalanceBDT}</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-700 dark:text-slate-300">
            ৳ {Number(finances.pendingBDT || 0).toFixed(2)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Reserved in pending withdrawal requests
          </p>
        </div>

        {/* Available USDT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span>{t.availableBalanceUSDT}</span>
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              USDT
            </span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            $ {Number(finances.balanceUSDT || 0).toFixed(2)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Eligible for BSC, Polygon, APTOS, Mantle
          </p>
        </div>

        {/* Pending USDT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span>{t.pendingBalanceUSDT}</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-700 dark:text-slate-300">
            $ {Number(finances.pendingUSDT || 0).toFixed(2)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Reserved in pending crypto transfers
          </p>
        </div>
      </div>

      {/* Two Column Section: Recent Work Requests & Recent Withdrawals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Work Requests */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.recentWorkRequests}
            </h2>
            <button
              onClick={() => onNavigate('sell_whatsapp')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>{t.viewAll}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <p>{t.noRequestsYet}</p>
              <button
                onClick={() => onNavigate('sell_whatsapp')}
                className="mt-2 px-3 py-1.5 text-xs font-semibold text-emerald-600 border border-emerald-500/30 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              >
                {t.sellWhatsApp}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {requests.map((req) => (
                <div key={req.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {req.accountCountryCode} {req.whatsappNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : req.status === 'rejected'
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}
                      >
                        {req.status === 'approved'
                          ? t.statusApproved
                          : req.status === 'rejected'
                          ? t.statusRejected
                          : t.statusPending}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(req.createdAt).toLocaleDateString()} · Lang: {req.preferredLanguage.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    {req.approvedEarnings ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        +{req.approvedCurrency === 'BDT' ? '৳' : '$'} {req.approvedEarnings}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px] font-mono">Reviewing</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Withdrawals */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.recentWithdrawals}
            </h2>
            <button
              onClick={() => onNavigate('withdraw')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>{t.viewAll}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading withdrawals...</div>
          ) : withdrawals.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
              <ArrowDownCircle className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <p>{t.noWithdrawalsYet}</p>
              <button
                onClick={() => onNavigate('withdraw')}
                className="mt-2 px-3 py-1.5 text-xs font-semibold text-emerald-600 border border-emerald-500/30 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              >
                {t.withdraw}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {withdrawals.map((wd) => (
                <div key={wd.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {wd.method} {wd.network ? `(${wd.network})` : ''}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          wd.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : wd.status === 'rejected' || wd.status === 'refunded'
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}
                      >
                        {wd.status === 'paid'
                          ? t.statusPaid
                          : wd.status === 'refunded'
                          ? t.statusRefunded
                          : wd.status === 'rejected'
                          ? t.statusRejected
                          : t.statusPending}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      {wd.recipientMobileNumber || (wd.walletAddress ? wd.walletAddress.slice(0, 14) + '...' : '')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      {wd.currency === 'BDT' ? '৳' : '$'} {wd.amount}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {new Date(wd.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
