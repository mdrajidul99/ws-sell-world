/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './firebase/AuthContext';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { ThemeProvider } from './theme/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { VerificationBanner } from './components/VerificationBanner';
import { AuthModal } from './components/AuthModal';
import { HomeHero } from './components/HomeHero';
import { DashboardOverview } from './components/DashboardOverview';
import { WorkRequestSection } from './components/WorkRequestSection';
import { WithdrawalSection } from './components/WithdrawalSection';
import { TransactionLedgerSection } from './components/TransactionLedgerSection';
import { AdminPanel } from './components/AdminPanel';
import { ShieldAlert, Mail, RefreshCw, Lock } from 'lucide-react';
import { checkEmailVerifiedStatus, resendVerificationEmail } from './firebase/auth';

function MainApp() {
  const { user, loading, isAdmin, isVerified, refreshProfile } = useAuth();
  const { t, formatText } = useLanguage();

  const [currentView, setCurrentView] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Cooldown for verification view
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifFeedback, setVerifFeedback] = useState<string | null>(null);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (resendCooldown > 0) {
      t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // URL route parsing: supports GitHub Pages path (/ws-sell-world/Admin_19384), direct path (/Admin_19384), and hash (#/Admin_19384)
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      if (path.includes('Admin_19384') || hash.includes('Admin_19384') || hash === '#admin') {
        setCurrentView('admin');
      } else if (hash === '#/dashboard' || hash === '#dashboard') {
        setCurrentView('dashboard');
      } else if (hash === '#/sell_whatsapp' || hash === '#sell_whatsapp') {
        setCurrentView('sell_whatsapp');
      } else if (hash === '#/withdraw' || hash === '#withdraw') {
        setCurrentView('withdraw');
      } else if (hash === '#/transactions' || hash === '#transactions') {
        setCurrentView('transactions');
      } else if (path.endsWith('/') || path.endsWith('/ws-sell-world') || path.endsWith('/ws-sell-world/')) {
        // Keep default or current
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, []);

  const navigateTo = (view: string) => {
    setCurrentView(view);
    const basePath = window.location.pathname.startsWith('/ws-sell-world') ? '/ws-sell-world' : '';

    if (view === 'admin') {
      window.history.pushState(null, '', `${basePath}/Admin_19384`);
    } else if (view === 'home') {
      window.history.pushState(null, '', `${basePath}/`);
    } else {
      window.location.hash = `#/${view}`;
    }
  };

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleResendInGate = async () => {
    if (resendCooldown > 0) return;
    try {
      await resendVerificationEmail();
      setResendCooldown(60);
      setVerifFeedback(t.verificationEmailSent);
    } catch (e: any) {
      setVerifFeedback(e.message || 'Failed to send verification email.');
    }
  };

  const handleCheckInGate = async () => {
    const verified = await checkEmailVerifiedStatus();
    if (verified) {
      await refreshProfile();
      setVerifFeedback(t.accountVerifiedSuccess);
    } else {
      setVerifFeedback(t.accountStillUnverified);
    }
  };

  const isProtectedView = ['dashboard', 'sell_whatsapp', 'withdraw', 'transactions'].includes(currentView);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenAuth={openAuth}
      />

      <VerificationBanner />

      <main className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-xs text-slate-400">
            Loading WS Sell World...
          </div>
        ) : currentView === 'admin' ? (
          <AdminPanel />
        ) : isProtectedView && !user ? (
          <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-xs space-y-4">
            <Lock className="w-10 h-10 text-emerald-600 mx-auto" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Authentication Required
            </h2>
            <p className="text-xs text-slate-500">
              Please sign in or register to access this section of WS Sell World.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => openAuth('login')}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
              >
                {t.login}
              </button>
              <button
                onClick={() => openAuth('register')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                {t.register}
              </button>
            </div>
          </div>
        ) : isProtectedView && user && !isVerified ? (
          /* Hard gate for unverified email/password accounts as strictly mandated by Section 6A */
          <div className="max-w-lg mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/60 text-center shadow-lg space-y-5">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.verificationRequiredTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.verificationRequiredDesc}
              </p>
              <div className="inline-block font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md">
                {user.email}
              </div>
            </div>

            {verifFeedback && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-xs font-medium text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900/50">
                {verifFeedback}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleResendInGate}
                disabled={resendCooldown > 0}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-amber-950/70 hover:bg-amber-200 rounded-lg cursor-pointer disabled:opacity-50"
              >
                {resendCooldown > 0
                  ? formatText(t.resendCooldown, { seconds: resendCooldown })
                  : t.resendVerificationEmail}
              </button>

              <button
                onClick={handleCheckInGate}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t.refreshVerificationStatus}</span>
              </button>
            </div>
          </div>
        ) : currentView === 'dashboard' ? (
          <DashboardOverview onNavigate={navigateTo} />
        ) : currentView === 'sell_whatsapp' ? (
          <WorkRequestSection />
        ) : currentView === 'withdraw' ? (
          <WithdrawalSection />
        ) : currentView === 'transactions' ? (
          <TransactionLedgerSection />
        ) : (
          <HomeHero onNavigate={navigateTo} onOpenAuth={openAuth} />
        )}
      </main>

      <Footer onNavigate={navigateTo} />

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          if (!isProtectedView) {
            navigateTo('dashboard');
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
