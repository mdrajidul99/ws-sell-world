import React, { useState } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { loginWithUsernameOrEmail, loginWithGoogle, logout } from '../firebase/auth';
import { ShieldCheck, Lock, Mail, User, AlertCircle, ArrowLeft, LogOut, ArrowRight, ExternalLink } from 'lucide-react';

interface AdminLoginProps {
  onExit: () => void;
  onSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onExit, onSuccess }) => {
  const { user, isAdmin, refreshProfile } = useAuth();
  const { language, t } = useLanguage();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDomainError, setIsDomainError] = useState(false);

  const LOGO_URL = 'https://raw.githubusercontent.com/mdrajidul99/mrs-engineers-assets/main/WS%20Sell%20World%20Logo.png';

  const handleAdminEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsDomainError(false);

    if (!identifier.trim() || !password) {
      setError(language === 'bn' ? 'ইউজারনেম/ইমেইল এবং পাসওয়ার্ড আবশ্যক।' : 'Identifier and password are required.');
      return;
    }

    setLoading(true);
    try {
      await loginWithUsernameOrEmail(identifier, password);
      await refreshProfile();
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminGoogleLogin = async () => {
    setError(null);
    setIsDomainError(false);
    setLoading(true);
    try {
      await loginWithGoogle(language);
      await refreshProfile();
      onSuccess();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      if (
        err.code === 'auth/unauthorized-domain' ||
        (err.message && err.message.toLowerCase().includes('unauthorized domain'))
      ) {
        setIsDomainError(true);
        setError(
          language === 'bn'
            ? 'GitHub Pages ডোমেইন (mdrajidul99.github.io) এখনো Firebase Console-এ অনুমোদিত নয়। অনুগ্রহ করে Firebase Console > Authentication > Settings > Authorized domains-এ "mdrajidul99.github.io" যোগ করুন। বিকল্প হিসেবে অ্যাডমিন ইমেইল ও পাসওয়ার্ড দিয়ে নিচে সরাসরি লগইন করুন।'
            : 'The domain (mdrajidul99.github.io) is not yet authorized in Firebase Console. Please add "mdrajidul99.github.io" in Firebase Console > Authentication > Settings > Authorized domains. Meanwhile, log in directly using the Admin Email & Password below.'
        );
      } else {
        setError(err.message || 'Google authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    try {
      await logout();
      setError(null);
      setIsDomainError(false);
      setIdentifier('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to sign out.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 selection:bg-amber-500 selection:text-black">
      {/* Isolated Admin Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={LOGO_URL}
            alt="WS Sell World"
            className="w-8 h-8 object-contain rounded"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-white">WS Sell World</span>
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                ADMIN GATEWAY
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">/Admin_19384</span>
          </div>
        </div>

        <button
          onClick={onExit}
          className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.userPortal}</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-slate-950/70 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Brand & Title */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {t.adminSecurityGateway}
            </h1>
            <p className="text-xs text-slate-400">
              {language === 'bn'
                ? 'অনুমোদিত অ্যাডমিনিস্ট্রেটর ক্রেডেনশিয়াল দিয়ে প্রবেশ করুন।'
                : 'Restricted administrative console for WS Sell World operations.'}
            </p>
          </div>

          {/* If already signed in as a non-admin user */}
          {user && !isAdmin ? (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{t.accessDeniedAdminOnly}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  {language === 'bn'
                    ? `আপনি "${user.email || user.uid}" হিসেবে লগইন আছেন, তবে এই অ্যাকাউন্টে অ্যাডমিন পারমিশন নেই।`
                    : `You are currently logged in as "${user.email || user.uid}", but this account lacks root administrative privileges.`}
                </p>
                <div className="font-mono text-[10px] bg-slate-900/90 p-2 rounded border border-slate-800 text-slate-400">
                  Target Admin: mrs.engineers.bd26@gmail.com
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleSwitchAccount}
                  className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'অ্যাকাউন্ট পরিবর্তন / সাইন আউট' : 'Sign Out & Switch Account'}</span>
                </button>

                <button
                  onClick={onExit}
                  className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t.userPortal}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Unauthenticated Admin Login Form */
            <div className="space-y-4">
              {error && (
                <div className={`p-3.5 rounded-lg border text-xs leading-relaxed space-y-2 ${
                  isDomainError
                    ? 'bg-amber-950/50 border-amber-800 text-amber-200'
                    : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                }`}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                  {isDomainError && (
                    <div className="text-[11px] text-amber-300/90 pl-6 border-t border-amber-800/40 pt-1.5">
                      Tip: Use administrator email & password directly below to bypass domain restriction.
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleAdminEmailLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'bn' ? 'অ্যাডমিন ইমেইল বা ইউজারনেম' : 'Admin Email or Username'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="mrs.engineers.bd26@gmail.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : (language === 'bn' ? 'অ্যাডমিন লগইন করুন' : 'Sign In as Administrator')}
                  {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </form>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-mono">
                  <span className="bg-slate-950 px-2 text-slate-500">OR GOOGLE AUTH</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAdminGoogleLogin}
                disabled={loading}
                className="w-full py-2 px-4 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-200 font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{language === 'bn' ? 'অ্যাডমিন Google অ্যাকাউন্ট দিয়ে লগইন' : 'Sign in with Admin Google Account'}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onExit}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t.userPortal}</span>
                </button>
              </div>
            </div>
          )}

          {/* Security Notice Footer Badge */}
          <div className="pt-2 border-t border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 font-mono">
              Authorized Root UID: <span className="text-slate-400">ZMNTSLxjJWOBEK3DlnqxUXQycAO2</span>
            </span>
          </div>
        </div>
      </div>

      {/* Clean Admin-Only Footer */}
      <footer className="border-t border-slate-800 py-3 text-center text-xs text-slate-500 font-mono">
        WS Sell World Management Portal · Root Access Encrypted
      </footer>
    </div>
  );
};
