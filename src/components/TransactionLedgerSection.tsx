import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getUserTransactions } from '../firebase/services/ledger';
import { TransactionLedgerItem } from '../firebase/types';
import {
  FileText,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  Filter
} from 'lucide-react';

export const TransactionLedgerSection: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [transactions, setTransactions] = useState<TransactionLedgerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currencyFilter, setCurrencyFilter] = useState<'ALL' | 'BDT' | 'USDT'>('ALL');

  const loadLedger = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await getUserTransactions(user.uid);
      setTransactions(list);
    } catch (err) {
      console.warn('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, [user]);

  const filtered = transactions.filter((tx) => {
    if (currencyFilter !== 'ALL' && tx.currency !== currencyFilter) return false;
    return true;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'approved_earning':
        return t.typeApprovedEarning;
      case 'withdrawal_reserved':
        return t.typeWithdrawalReserved;
      case 'withdrawal_paid':
        return t.typeWithdrawalPaid;
      case 'withdrawal_refund':
        return t.typeWithdrawalRefund;
      case 'authorized_adjustment':
        return t.typeAuthorizedAdjustment;
      default:
        return type;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Filter Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>{t.transactionLedgerTitle}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete cryptographic audit ledger of approved earnings, reservations, payments, and refunds.
          </p>
        </div>

        {/* Currency Filter Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
          {(['ALL', 'BDT', 'USDT'] as const).map((curr) => (
            <button
              key={curr}
              onClick={() => setCurrencyFilter(curr)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                currencyFilter === curr
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading ledger records...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
            <p>{t.noTransactionsYet}</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-3 font-semibold">Tx ID</th>
                <th className="pb-3 font-semibold">{t.date}</th>
                <th className="pb-3 font-semibold">{t.transactionType}</th>
                <th className="pb-3 font-semibold">Description / Reference</th>
                <th className="pb-3 font-semibold text-right">{t.amount}</th>
                <th className="pb-3 font-semibold text-right">{t.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((tx) => {
                const isCredit = tx.type === 'approved_earning' || tx.type === 'withdrawal_refund';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {tx.id.slice(0, 14)}...
                    </td>
                    <td className="py-3 text-slate-500 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {getTypeLabel(tx.type)}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="py-3 font-mono font-bold text-right whitespace-nowrap">
                      <span
                        className={
                          isCredit
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }
                      >
                        {isCredit ? '+' : '-'} {tx.currency === 'BDT' ? '৳' : '$'}{' '}
                        {Number(tx.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tx.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
