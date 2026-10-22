import React from 'react';
import { useAuth } from '../firebase/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
  MessageSquare,
  ShieldCheck,
  ArrowDownCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Zap,
  Globe
} from 'lucide-react';

interface HomeHeroProps {
  onNavigate: (view: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ onNavigate, onOpenAuth }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const LOGO_URL = 'https://raw.githubusercontent.com/mdrajidul99/mrs-engineers-assets/main/WS%20Sell%20World%20Logo.png';

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Split Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Official WhatsApp Verification & Payout Hub</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Secure WhatsApp Review & Direct Payouts
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              WS Sell World provides verified account assessment, real-time live chat with administrators, and immediate withdrawals to bKash, Nagad, and USDT.
            </p>

            {/* Credential Safety Notice Highlight */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
              <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 dark:text-white mb-0.5">Strict Privacy Guarantee</strong>
                <span>We never ask for WhatsApp OTPs, SMS codes, or account passwords. Account review is conducted transparently with full consent.</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {user ? (
                <>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>{t.dashboard}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('sell_whatsapp')}
                    className="px-5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>{t.sellWhatsApp}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onOpenAuth('register')}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>{t.registerNow}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>{t.login}</span>
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span>English & বাংলা</span>
              <span>·</span>
              <span>Min. 15 BDT Withdrawal</span>
              <span>·</span>
              <span>Web3 USDT Support</span>
            </div>
          </div>

          {/* Right Brand Showcase Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <img
                  src={LOGO_URL}
                  alt="WS Sell World"
                  className="w-12 h-12 object-contain rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">WS Sell World</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Verified Partner Platform</p>
                </div>
              </div>

              {/* Supported Payout Channels */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Supported Payout Channels</span>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <div className="font-bold text-pink-600 dark:text-pink-400">bKash</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Min: 15 BDT</div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <div className="font-bold text-orange-600 dark:text-orange-400">Nagad</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Min: 15 BDT</div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">USDT BSC</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Min: 10 USDT</div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <div className="font-bold text-blue-600 dark:text-blue-400">Polygon / APTOS</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Min: 0.20 - 1 USDT</div>
                  </div>
                </div>
              </div>

              {/* Process steps */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>1. Register and verify your email</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>2. Choose chat language (EN/BN) & submit request</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>3. Chat in real-time & get balance approved</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>4. Instant withdrawal to bKash, Nagad or USDT</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3 Step Workflow Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            How WS Sell World Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simple, honest, and mathematically auditable accounting ledger.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Choose Language & Request</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Select English or Bengali to initiate a private conversation with the authorized administrator and enter your line details.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Live Admin Assessment</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Communicate directly with the administrator in real-time chat. Approved requests credit your balance with a recorded ledger entry.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Direct Balance Withdrawal</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Withdraw instantly via bKash (min 15 BDT), Nagad (min 15 BDT), or USDT across BSC, Polygon, APTOS, and Mantle.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
