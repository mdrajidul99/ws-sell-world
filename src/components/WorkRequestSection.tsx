import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
  createWorkRequest,
  getUserWorkRequests
} from '../firebase/services/workRequests';
import {
  sendChatMessage,
  subscribeToChatMessages
} from '../firebase/services/chat';
import { WorkRequest, ChatMessage } from '../firebase/types';
import {
  MessageSquare,
  Send,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Globe,
  Phone,
  FileText,
  User,
  ArrowRight
} from 'lucide-react';

export const WorkRequestSection: React.FC = () => {
  const { user, isVerified } = useAuth();
  const { language, t, formatText } = useLanguage();

  const [requests, setRequests] = useState<WorkRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal / Form state for new request
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [chosenLanguage, setChosenLanguage] = useState<'en' | 'bn'>('en');

  const [countryCode, setCountryCode] = useState('+880');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [accountAgeDays, setAccountAgeDays] = useState<number>(30);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedRequest = requests.find((r) => r.id === selectedRequestId);

  const loadRequests = async () => {
    if (!user) return;
    try {
      const list = await getUserWorkRequests(user.uid);
      setRequests(list);
      if (list.length > 0 && !selectedRequestId) {
        setSelectedRequestId(list[0].id);
      }
    } catch (err) {
      console.warn('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  // Subscribe to chat messages when selectedRequest changes
  useEffect(() => {
    if (!selectedRequest) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToChatMessages(selectedRequest.conversationId, (newMsgs) => {
      setMessages(newMsgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [selectedRequest?.conversationId]);

  const handleStartNewFlow = () => {
    setShowLanguageModal(true);
  };

  const handleLanguageChosen = (lang: 'en' | 'bn') => {
    setChosenLanguage(lang);
    setShowLanguageModal(false);
    setShowNewRequestForm(true);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.length < 8) {
      setFormError('Please enter a valid WhatsApp phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createWorkRequest({
        preferredLanguage: chosenLanguage,
        accountCountryCode: countryCode,
        whatsappNumber: cleanNumber,
        accountAgeDays: Number(accountAgeDays) || 0,
        notes: notes.trim(),
      });

      // Send initial welcome/greeting in chat
      const welcomeGreeting =
        chosenLanguage === 'bn'
          ? `নমস্কার! আমি WhatsApp অ্যাকাউন্ট পর্যালোচনার অনুরোধ জমা দিয়েছি (${countryCode} ${cleanNumber})।`
          : `Hello! I have submitted a WhatsApp account review request (${countryCode} ${cleanNumber}).`;

      await sendChatMessage({
        conversationId: created.conversationId,
        text: welcomeGreeting,
        preferredLanguage: chosenLanguage,
      });

      await loadRequests();
      setSelectedRequestId(created.id);
      setShowNewRequestForm(false);
      setWhatsappNumber('');
      setNotes('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedRequest || sendingMsg) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSendingMsg(true);

    try {
      await sendChatMessage({
        conversationId: selectedRequest.conversationId,
        text: textToSend,
        preferredLanguage: selectedRequest.preferredLanguage,
      });
    } catch (err: any) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title & Entry Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>{t.chatToSellWhatsApp}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time verification, transparent evaluation, and verified earnings with the administrator.
          </p>
        </div>

        <button
          onClick={handleStartNewFlow}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Review Request</span>
        </button>
      </div>

      {/* Safety & Credential Protection Warning Card */}
      <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-900 dark:text-emerald-200">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold">{t.safetyDisclaimerTitle}</h4>
          <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
            {t.safetyDisclaimerDesc}
          </p>
        </div>
      </div>

      {/* Main Grid: Request List on Left, Active Chat & Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        
        {/* Left Column: Request List */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col h-full shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Your Requests ({requests.length})
            </span>
          </div>

          <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <p>{t.noRequestsYet}</p>
                <button
                  onClick={handleStartNewFlow}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-600 border border-emerald-500/30 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                >
                  Create First Request
                </button>
              </div>
            ) : (
              requests.map((req) => {
                const active = req.id === selectedRequestId;
                return (
                  <button
                    key={req.id}
                    onClick={() => setSelectedRequestId(req.id)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-colors cursor-pointer ${
                      active
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500/50 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">
                        {req.accountCountryCode} {req.whatsappNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : req.status === 'rejected'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                        }`}
                      >
                        {req.status === 'approved'
                          ? t.statusApproved
                          : req.status === 'rejected'
                          ? t.statusRejected
                          : t.statusPending}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                      <span className="uppercase text-[10px] font-semibold">{req.preferredLanguage}</span>
                    </div>

                    {req.approvedEarnings && (
                      <div className="mt-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        Earned: +{req.approvedCurrency === 'BDT' ? '৳' : '$'} {req.approvedEarnings}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat & Status Panel */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col h-[600px] shadow-xs overflow-hidden">
          {selectedRequest ? (
            <>
              {/* Top Chat Bar: Request Info & Status */}
              <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    WS
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{selectedRequest.accountCountryCode} {selectedRequest.whatsappNumber}</span>
                      <span className="text-slate-400 font-normal">·</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        #{selectedRequest.id.slice(-6)}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Chat Language: <strong className="uppercase">{selectedRequest.preferredLanguage}</strong> · Age: {selectedRequest.accountAgeDays} days
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 ${
                      selectedRequest.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                        : selectedRequest.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                    }`}
                  >
                    {selectedRequest.status === 'approved' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : selectedRequest.status === 'rejected' ? (
                      <XCircle className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {selectedRequest.status === 'approved'
                        ? t.statusApproved
                        : selectedRequest.status === 'rejected'
                        ? t.statusRejected
                        : t.statusPending}
                    </span>
                  </span>
                </div>
              </div>

              {/* Notice if Rejected with user-visible explanation */}
              {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                <div className="bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/50 p-3 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">{t.rejectionReasonLabel}: </span>
                    <span>{selectedRequest.rejectionReason}</span>
                  </div>
                </div>
              )}

              {/* Notice if Approved */}
              {selectedRequest.status === 'approved' && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-900/50 p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>This request has been approved and credited to your available balance.</span>
                  </div>
                  {selectedRequest.approvedEarnings && (
                    <span className="font-bold font-mono text-sm">
                      +{selectedRequest.approvedCurrency === 'BDT' ? '৳' : '$'} {selectedRequest.approvedEarnings}
                    </span>
                  )}
                </div>
              )}

              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-400 p-6 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                    <p>{t.emptyConversation}</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderUid === user?.uid;
                    const isAdminSender = msg.senderRole === 'admin';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            {isAdminSender ? 'WS Admin' : msg.senderName}
                          </span>
                          <span>·</span>
                          <span>
                            {new Date(
                              typeof msg.timestamp === 'number' ? msg.timestamp : Date.now()
                            ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div
                          className={`max-w-[85%] sm:max-w-[70%] px-3.5 py-2 rounded-xl text-xs leading-relaxed break-words ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-tr-xs shadow-xs'
                              : isAdminSender
                              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-xs shadow-xs'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-tl-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t.typeYourMessage}
                  maxLength={1000}
                  className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sendingMsg}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.sendMessage}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No Request Selected
              </h3>
              <p className="text-xs max-w-sm">
                Select an existing WhatsApp review request from the left list or submit a new request to start live chat.
              </p>
              <button
                onClick={handleStartNewFlow}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
              >
                Start New Request
              </button>
            </div>
          )}
        </div>
      </div>

      {/* STEP 1: CHAT LANGUAGE SELECTION MODAL */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.chatLanguagePromptTitle}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.chatLanguagePromptDesc}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleLanguageChosen('en')}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-left transition-colors cursor-pointer group"
              >
                <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">
                  {t.selectEnglishChat}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Chat with admin in English
                </div>
              </button>

              <button
                onClick={() => handleLanguageChosen('bn')}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-left transition-colors cursor-pointer group"
              >
                <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">
                  {t.selectBengaliChat}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  অ্যাডমিনের সাথে বাংলায় চ্যাট করুন
                </div>
              </button>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowLanguageModal(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: SUBMIT WORK REQUEST FORM MODAL */}
      {showNewRequestForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>{t.whatsappRequestTitle}</span>
              </h3>
              <span className="text-[11px] uppercase font-bold text-emerald-600 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40">
                Lang: {chosenLanguage}
              </span>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.whatsappCountryCode}
                  </label>
                  <input
                    type="text"
                    required
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    placeholder="+880"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.whatsappPhoneNumber}
                  </label>
                  <input
                    type="text"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g. 01700000000"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.whatsappAccountAge}
                </label>
                <input
                  type="number"
                  min="1"
                  value={accountAgeDays}
                  onChange={(e) => setAccountAgeDays(Number(e.target.value))}
                  placeholder="30"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.whatsappNotes}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any details about account status, history, or country registration..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Safety notice in form */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Reminder: You must be the rightful owner of this phone line. Never disclose WhatsApp OTPs or SMS PINs in this system.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewRequestForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : t.submitRequestButton}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
