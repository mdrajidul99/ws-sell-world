import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { resendVerificationEmail, checkEmailVerifiedStatus } from '../firebase/auth';
import { Mail, RefreshCw, CheckCircle2, AlertTriangle, Send } from 'lucide-react';

export const VerificationBanner: React.FC = () => {
  const { user, isVerified, refreshProfile } = useAuth();
  const { t, formatText } = useLanguage();
  const [cooldown, setCooldown] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!user || isVerified) {
    return null;
  }

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    setFeedback(null);
    try {
      await resendVerificationEmail();
      setCooldown(60);
      setFeedback({
        message: t.verificationEmailSent,
        type: 'success',
      });
    } catch (e: any) {
      setFeedback({
        message: e.message || 'Failed to resend verification email. Please try again shortly.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const verified = await checkEmailVerifiedStatus();
      if (verified) {
        await refreshProfile();
        setFeedback({
          message: t.accountVerifiedSuccess,
          type: 'success',
        });
      } else {
        setFeedback({
          message: t.accountStillUnverified,
          type: 'info',
        });
      }
    } catch (e: any) {
      setFeedback({
        message: e.message || 'Failed to refresh status.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-3 text-amber-900 dark:text-amber-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <span className="font-semibold">{t.verificationRequiredTitle}: </span>
            <span>{t.unverifiedBannerMessage} ({user.email})</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || loading}
            className="px-3 py-1.5 rounded-md font-medium text-amber-900 dark:text-amber-100 bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {cooldown > 0
                ? formatText(t.resendCooldown, { seconds: cooldown })
                : t.resendVerificationEmail}
            </span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-1.5 rounded-md font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t.refreshVerificationStatus}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="max-w-7xl mx-auto mt-2 text-[11px] font-medium">
          <span
            className={
              feedback.type === 'success'
                ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                : feedback.type === 'error'
                ? 'text-rose-700 dark:text-rose-400'
                : 'text-amber-800 dark:text-amber-300'
            }
          >
            {feedback.message}
          </span>
        </div>
      )}
    </div>
  );
};
