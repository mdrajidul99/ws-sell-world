import React, { useState } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
  registerWithEmailAndPassword,
  loginWithUsernameOrEmail,
  loginWithGoogle,
  requestPasswordReset,
  isValidUsernameFormat
} from '../firebase/auth';
import { X, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'forgot_password';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const { refreshProfile } = useAuth();
  const { language, t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>(initialMode);
  const [isDomainError, setIsDomainError] = useState(false);

  // Sync mode whenever initialMode or isOpen changes
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMessage(null);
      setIsDomainError(false);
    }
  }, [initialMode, isOpen]);

  // Form states
  const [username, setUsername] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setError(null);
    setSuccessMessage(null);
    setIsDomainError(false);
    setPassword('');
    setConfirmPassword('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsDomainError(false);

    const cleanUser = username.trim();
    if (!cleanUser) {
      setError(t.usernameRequired);
      return;
    }
    if (!isValidUsernameFormat(cleanUser)) {
      setError(t.usernameInvalid);
      return;
    }
    if (!email.includes('@')) {
      setError(t.emailInvalid);
      return;
    }
    if (password.length < 6) {
      setError(t.passwordTooShort);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }

    setLoading(true);
    try {
      await registerWithEmailAndPassword(cleanUser, email, password, language);
      await refreshProfile();
      setSuccessMessage(t.verificationEmailSent);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      if (err.message === 'USERNAME_TAKEN') {
        setError(t.usernameTaken);
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already registered. Please log in.');
      } else if (err.code === 'auth/invalid-email') {
        setError(t.emailInvalid);
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsDomainError(false);

    if (!identifier.trim()) {
      setError(t.usernameOrEmail + ' is required.');
      return;
    }
    if (!password) {
      setError(t.password + ' is required.');
      return;
    }

    setLoading(true);
    try {
      await loginWithUsernameOrEmail(identifier, password);
      await refreshProfile();
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.message === 'USER_NOT_FOUND' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid username/email or password.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again or reset your password.');
      } else {
        setError(err.message || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsDomainError(false);
    setLoading(true);
    try {
      await loginWithGoogle(language);
      await refreshProfile();
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        // User voluntarily closed popup
        return;
      }
      if (
        err.code === 'auth/unauthorized-domain' ||
        (err.message && err.message.toLowerCase().includes('unauthorized domain'))
      ) {
        setIsDomainError(true);
        setError(
          language === 'bn'
            ? 'GitHub Pages ডোমেইন (mdrajidul99.github.io) এখনো Firebase Console-এ অনুমোদিত হয়নি। অনুগ্রহ করে Firebase Console > Authentication > Settings > Authorized domains-এ "mdrajidul99.github.io" যোগ করুন। বিকল্প হিসেবে আপনি এখনই সাধারণ Email & Password দিয়ে লগইন বা একাউন্ট খুলতে পারেন।'
            : 'The domain (mdrajidul99.github.io) is not yet authorized in Firebase Authentication. Please add "mdrajidul99.github.io" under Firebase Console > Authentication > Settings > Authorized domains. Meanwhile, you can register or sign in instantly with Email & Password below.'
        );
      } else {
        setError(err.message || 'Google authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsDomainError(false);

    if (!email || !email.includes('@')) {
      setError(t.emailInvalid);
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSuccessMessage(t.resetLinkSent);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <img
              src="https://raw.githubusercontent.com/mdrajidul99/mrs-engineers-assets/main/WS%20Sell%20World%20Logo.png"
              alt="Logo"
              className="w-7 h-7 object-contain rounded"
              referrerPolicy="no-referrer"
            />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {mode === 'login'
                ? t.login
                : mode === 'register'
                ? t.register
                : t.forgotPassword}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Segmented Navigation Tabs */}
        {mode !== 'forgot_password' && (
          <div className="grid grid-cols-2 p-1 mx-6 mt-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setMode('login');
              }}
              className={`py-2 rounded-md transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t.login}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setMode('register');
              }}
              className={`py-2 rounded-md transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t.register}
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 pt-4">
          {error && (
            <div className={`mb-4 p-3.5 rounded-lg border flex flex-col gap-2 text-xs leading-relaxed ${
              isDomainError
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300'
            }`}>
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-inherit" />
                <span>{error}</span>
              </div>
              {isDomainError && (
                <div className="pt-2 border-t border-amber-200 dark:border-amber-900/50 flex flex-wrap items-center gap-2">
                  <span className="font-semibold">Quick Solution:</span>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setMode('register');
                    }}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold cursor-pointer"
                  >
                    {t.register} with Email
                  </button>
                </div>
              )}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.usernameOrEmail}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Username or your email address"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t.password}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setMode('forgot_password');
                    }}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {t.forgotPassword}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? t.loggingIn : t.loginNow}
                {!loading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2 px-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{t.signInWithGoogle}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setMode('register');
                  }}
                  className="text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  {t.dontHaveAccount}
                </button>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.username}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. rajidul_99 (letters, numbers, _)"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.email}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.password}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.confirmPassword}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? t.registering : t.registerNow}
                {!loading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2 px-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{t.signInWithGoogle}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setMode('login');
                  }}
                  className="text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  {t.alreadyHaveAccount}
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.email}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Sending link...' : t.sendResetLink}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setMode('login');
                  }}
                  className="text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  {t.backToLogin}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
