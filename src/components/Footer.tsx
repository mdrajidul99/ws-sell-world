import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs">
      {/* Credential Safety Notice Banner */}
      <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border-b border-slate-200 dark:border-slate-800 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {t.safetyDisclaimerTitle}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-2xl">
            {t.safetyDisclaimerDesc}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="https://raw.githubusercontent.com/mdrajidul99/mrs-engineers-assets/main/WS%20Sell%20World%20Logo.png"
                alt="WS Sell World"
                className="w-7 h-7 object-contain rounded-md"
                referrerPolicy="no-referrer"
              />
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                WS Sell World
              </span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              {t.tagline}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">
              Payment Methods
            </h4>
            <ul className="space-y-2 text-slate-500 text-xs">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>bKash (Min: 15 BDT)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Nagad (Min: 15 BDT)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>USDT - BSC BEP20 (10 USDT)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>USDT - Polygon, APTOS, Mantle</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">
              Security & Compliance
            </h4>
            <ul className="space-y-2 text-slate-500 text-xs">
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Firebase ABAC Rule Enforced</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Zero Password Storage</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Encrypted Session Persistence</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Admin Transaction Ledger</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <div className="flex flex-col space-y-2 text-slate-500 text-xs">
              <button onClick={() => onNavigate('home')} className="hover:text-emerald-500 text-left">
                {t.home}
              </button>
              <button onClick={() => onNavigate('sell_whatsapp')} className="hover:text-emerald-500 text-left">
                {t.sellWhatsApp}
              </button>
              <button onClick={() => onNavigate('withdraw')} className="hover:text-emerald-500 text-left">
                {t.withdraw}
              </button>
              <button onClick={() => onNavigate('transactions')} className="hover:text-emerald-500 text-left">
                {t.transactions}
              </button>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} WS Sell World. All rights reserved.</p>
          <p>Operated by MRS Engineers BD (mrs.engineers.bd26@gmail.com)</p>
        </div>
      </div>
    </footer>
  );
};
