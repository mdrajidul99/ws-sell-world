export type Language = 'en' | 'bn';

export interface Translations {
  // Brand & Header
  brandName: string;
  tagline: string;
  home: string;
  dashboard: string;
  sellWhatsApp: string;
  withdraw: string;
  transactions: string;
  adminPanel: string;
  login: string;
  register: string;
  logout: string;
  theme: string;
  system: string;
  light: string;
  dark: string;
  language: string;

  // Auth
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  usernameOrEmail: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  forgotPassword: string;
  sendResetLink: string;
  backToLogin: string;
  signInWithGoogle: string;
  registerNow: string;
  loginNow: string;
  loggingIn: string;
  registering: string;
  passwordsDoNotMatch: string;
  usernameRequired: string;
  usernameInvalid: string;
  usernameTaken: string;
  emailInvalid: string;
  passwordTooShort: string;
  resetLinkSent: string;

  // Verification
  verificationRequiredTitle: string;
  verificationRequiredDesc: string;
  resendVerificationEmail: string;
  resendCooldown: string;
  refreshVerificationStatus: string;
  verificationEmailSent: string;
  accountVerifiedSuccess: string;
  accountStillUnverified: string;
  unverifiedBannerMessage: string;

  // Dashboard Overview
  welcomeBack: string;
  accountStatus: string;
  verified: string;
  unverified: string;
  active: string;
  suspended: string;
  availableBalanceBDT: string;
  availableBalanceUSDT: string;
  pendingBalanceBDT: string;
  pendingBalanceUSDT: string;
  totalApprovedEarnings: string;
  totalWithdrawn: string;
  quickActions: string;
  recentWorkRequests: string;
  recentWithdrawals: string;
  noRequestsYet: string;
  noWithdrawalsYet: string;
  viewAll: string;

  // WhatsApp / Work Requests
  chatToSellWhatsApp: string;
  chatLanguagePromptTitle: string;
  chatLanguagePromptDesc: string;
  selectEnglishChat: string;
  selectBengaliChat: string;
  startChatButton: string;
  whatsappRequestTitle: string;
  whatsappCountryCode: string;
  whatsappPhoneNumber: string;
  whatsappAccountAge: string;
  whatsappNotes: string;
  submitRequestButton: string;
  requestSubmittedSuccess: string;
  statusPending: string;
  statusApproved: string;
  statusRejected: string;
  statusPaid: string;
  statusRefunded: string;
  safetyDisclaimerTitle: string;
  safetyDisclaimerDesc: string;
  liveChatWithAdmin: string;
  typeYourMessage: string;
  sendMessage: string;
  emptyConversation: string;
  requestStatusLabel: string;
  rejectionReasonLabel: string;
  adminNotesLabel: string;

  // Withdrawals
  withdrawFunds: string;
  selectMethod: string;
  bangladeshLocalMethods: string;
  internationalCryptoMethods: string;
  methodBkash: string;
  methodNagad: string;
  cryptoUSDT: string;
  selectCryptoNetwork: string;
  minWithdrawalNote: string;
  withdrawalAmount: string;
  recipientPhone: string;
  recipientPhonePlaceholder: string;
  walletAddress: string;
  walletAddressPlaceholder: string;
  confirmWithdrawal: string;
  confirmWithdrawalDesc: string;
  submitWithdrawalButton: string;
  submittingWithdrawal: string;
  withdrawalCreatedSuccess: string;
  insufficientBalance: string;
  amountBelowMinimum: string;
  invalidPhoneNumber: string;
  invalidWalletAddress: string;
  withdrawalHistory: string;
  txHashOrId: string;
  date: string;
  method: string;
  amount: string;
  status: string;

  // Ledger
  transactionLedgerTitle: string;
  transactionType: string;
  currency: string;
  reference: string;
  typeApprovedEarning: string;
  typeWithdrawalReserved: string;
  typeWithdrawalPaid: string;
  typeWithdrawalRefund: string;
  typeAuthorizedAdjustment: string;
  noTransactionsYet: string;

  // Admin
  adminTitle: string;
  adminOverview: string;
  adminWorkRequests: string;
  adminLiveChat: string;
  adminWithdrawals: string;
  adminUsers: string;
  adminAuditHistory: string;
  totalUsersCount: string;
  verifiedUsersCount: string;
  pendingRequestsCount: string;
  pendingWithdrawalsCount: string;
  totalBdtPaidOut: string;
  totalUsdtPaidOut: string;
  searchUsersPlaceholder: string;
  approveRequest: string;
  rejectRequest: string;
  keepPending: string;
  enterEarningAmount: string;
  enterRejectionReason: string;
  enterTxIdForPayment: string;
  markAsPaid: string;
  refundWithdrawal: string;
  paymentApprovedSuccess: string;
  requestRejectedSuccess: string;
  withdrawalRefundedSuccess: string;
  actionConfirm: string;
  cancel: string;
  confirm: string;
  close: string;
  accessDeniedAdminOnly: string;

  // Pricing & Admin login additions
  pricingManagement: string;
  pricingOverview: string;
  defaultBdtPriceLabel: string;
  defaultUsdtPriceLabel: string;
  savePricingConfig: string;
  setPriceForRequest: string;
  assignedPriceLabel: string;
  pricingUpdatedSuccess: string;
  unauthorizedDomainTitle: string;
  unauthorizedDomainDesc: string;
  adminLoginTitle: string;
  adminLoginDesc: string;
  adminLoginButton: string;
  returnToUserSite: string;
  userPortal: string;
  adminSecurityGateway: string;
  savePricingChanges: string;
  notAuthorizedAdminDesc: string;
  switchAccount: string;
  loginTab: string;
  registerTab: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    brandName: "WS Sell World",
    tagline: "Professional WhatsApp Account Review & Instant Withdrawal Platform",
    home: "Home",
    dashboard: "Dashboard",
    sellWhatsApp: "Sell WhatsApp",
    withdraw: "Withdraw",
    transactions: "Transactions",
    adminPanel: "Admin Panel",
    login: "Log In",
    register: "Register",
    logout: "Log Out",
    theme: "Theme",
    system: "System",
    light: "Light",
    dark: "Dark",
    language: "Language",

    username: "Username",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    usernameOrEmail: "Username or Email",
    alreadyHaveAccount: "Already have an account? Sign In",
    dontHaveAccount: "Don't have an account? Register",
    forgotPassword: "Forgot Password?",
    sendResetLink: "Send Password Reset Link",
    backToLogin: "Back to Login",
    signInWithGoogle: "Continue with Google",
    registerNow: "Create Account",
    loginNow: "Log In",
    loggingIn: "Logging in...",
    registering: "Creating account...",
    passwordsDoNotMatch: "Passwords do not match.",
    usernameRequired: "Username is required (alphanumeric, 3-20 characters).",
    usernameInvalid: "Username may only contain letters, numbers, and underscores (3-20 chars).",
    usernameTaken: "This username is already taken. Please choose another.",
    emailInvalid: "Please enter a valid email address.",
    passwordTooShort: "Password must be at least 6 characters long.",
    resetLinkSent: "Password reset link sent! Please check your email inbox.",

    verificationRequiredTitle: "Email Verification Required",
    verificationRequiredDesc: "To protect account balances and prevent unauthorized activity, your email address must be verified before accessing the dashboard, chat, or withdrawals.",
    resendVerificationEmail: "Resend Verification Email",
    resendCooldown: "Please wait {seconds}s before requesting another email.",
    refreshVerificationStatus: "I Have Verified (Refresh Status)",
    verificationEmailSent: "Verification link sent to your email! Please click the link in your inbox.",
    accountVerifiedSuccess: "Email verified successfully! Welcome to your dashboard.",
    accountStillUnverified: "Email is not verified yet. Please check your spam folder or click resend.",
    unverifiedBannerMessage: "Your account is unverified. Please check your email inbox to verify your account and unlock balance withdrawals.",

    welcomeBack: "Welcome back",
    accountStatus: "Account Status",
    verified: "Verified",
    unverified: "Unverified",
    active: "Active",
    suspended: "Suspended",
    availableBalanceBDT: "Available BDT",
    availableBalanceUSDT: "Available USDT",
    pendingBalanceBDT: "Pending BDT",
    pendingBalanceUSDT: "Pending USDT",
    totalApprovedEarnings: "Total Approved Earnings",
    totalWithdrawn: "Total Withdrawn",
    quickActions: "Quick Actions",
    recentWorkRequests: "Recent Work Requests",
    recentWithdrawals: "Recent Withdrawals",
    noRequestsYet: "No work requests submitted yet.",
    noWithdrawalsYet: "No withdrawal records found.",
    viewAll: "View All",

    chatToSellWhatsApp: "Chat to Sell WhatsApp",
    chatLanguagePromptTitle: "Choose Your Preferred Chat Language",
    chatLanguagePromptDesc: "Select your preferred language for communicating with the WS Sell World administrator.",
    selectEnglishChat: "English",
    selectBengaliChat: "বাংলা (Bengali)",
    startChatButton: "Start Conversation",
    whatsappRequestTitle: "Submit WhatsApp Account Review Request",
    whatsappCountryCode: "Country Code",
    whatsappPhoneNumber: "WhatsApp Phone Number",
    whatsappAccountAge: "Account Age (in days / months)",
    whatsappNotes: "Additional Details / Account Description",
    submitRequestButton: "Submit Review Request & Open Chat",
    requestSubmittedSuccess: "Request created successfully! You can now chat directly with the administrator.",
    statusPending: "Pending Review",
    statusApproved: "Approved",
    statusRejected: "Rejected",
    statusPaid: "Paid / Completed",
    statusRefunded: "Refunded",
    safetyDisclaimerTitle: "Mandatory Safety & Credential Protection Notice",
    safetyDisclaimerDesc: "WS Sell World NEVER requests, stores, or transfers your WhatsApp OTP, verification codes, 2-factor PIN, or account passwords. All transfers require verified ownership and mutual consent. Do not post confidential login credentials in chat.",
    liveChatWithAdmin: "Live Chat with Administrator",
    typeYourMessage: "Type a message to the administrator...",
    sendMessage: "Send",
    emptyConversation: "No messages yet. Send a greeting to initiate the conversation.",
    requestStatusLabel: "Request Status",
    rejectionReasonLabel: "Rejection Reason",
    adminNotesLabel: "Admin Note",

    withdrawFunds: "Withdraw Available Balance",
    selectMethod: "Select Withdrawal Method",
    bangladeshLocalMethods: "Bangladesh Local Mobile Banking",
    internationalCryptoMethods: "International Crypto (USDT Only)",
    methodBkash: "bKash (Min: 15 BDT)",
    methodNagad: "Nagad (Min: 15 BDT)",
    cryptoUSDT: "USDT Transfer",
    selectCryptoNetwork: "Select USDT Blockchain Network",
    minWithdrawalNote: "Minimum withdrawal for {method}: {min} {currency}",
    withdrawalAmount: "Withdrawal Amount",
    recipientPhone: "Recipient Mobile Number",
    recipientPhonePlaceholder: "e.g. 01700000000 (11 digits)",
    walletAddress: "Recipient Wallet Address",
    walletAddressPlaceholder: "Enter compatible recipient address",
    confirmWithdrawal: "Confirm Withdrawal Request",
    confirmWithdrawalDesc: "Please verify your payment details carefully. Funds will be deducted from your available balance immediately and processed upon review.",
    submitWithdrawalButton: "Confirm & Request Withdrawal",
    submittingWithdrawal: "Processing withdrawal...",
    withdrawalCreatedSuccess: "Withdrawal request submitted successfully! Funds are reserved pending administrative transfer.",
    insufficientBalance: "Insufficient available balance for this withdrawal amount.",
    amountBelowMinimum: "The entered amount is lower than the minimum requirement ({min} {currency}).",
    invalidPhoneNumber: "Please provide a valid 11-digit Bangladesh mobile number (e.g. 01XXXXXXXXX).",
    invalidWalletAddress: "Invalid wallet address format for the chosen network.",
    withdrawalHistory: "Withdrawal History",
    txHashOrId: "Transaction Ref / Hash",
    date: "Date & Time",
    method: "Method / Network",
    amount: "Amount",
    status: "Status",

    transactionLedgerTitle: "Account Transaction Ledger",
    transactionType: "Transaction Type",
    currency: "Currency",
    reference: "Reference ID",
    typeApprovedEarning: "Approved Earning",
    typeWithdrawalReserved: "Withdrawal Reserved",
    typeWithdrawalPaid: "Withdrawal Completed",
    typeWithdrawalRefund: "Withdrawal Refund",
    typeAuthorizedAdjustment: "Authorized Balance Adjustment",
    noTransactionsYet: "No transactions recorded yet.",

    adminTitle: "Administrator Portal",
    adminOverview: "System Overview",
    adminWorkRequests: "Work Requests",
    adminLiveChat: "Real-Time User Chats",
    adminWithdrawals: "Withdrawal Requests",
    adminUsers: "User Directory",
    adminAuditHistory: "Audit Trail",
    totalUsersCount: "Total Users",
    verifiedUsersCount: "Verified Users",
    pendingRequestsCount: "Pending Work Requests",
    pendingWithdrawalsCount: "Pending Withdrawals",
    totalBdtPaidOut: "Total BDT Paid",
    totalUsdtPaidOut: "Total USDT Paid",
    searchUsersPlaceholder: "Search users by username, email, or UID...",
    approveRequest: "Approve Request",
    rejectRequest: "Reject Request",
    keepPending: "Keep Pending",
    enterEarningAmount: "Award Earning Amount",
    enterRejectionReason: "Reason for Rejection (Visible to User)",
    enterTxIdForPayment: "Payment Transaction ID / Hash (Required)",
    markAsPaid: "Mark Payment as Sent & Completed",
    refundWithdrawal: "Reject & Refund Reserved Funds",
    paymentApprovedSuccess: "Payment recorded successfully with transaction reference!",
    requestRejectedSuccess: "Work request rejected and user notified.",
    withdrawalRefundedSuccess: "Withdrawal rejected and reserved funds refunded to user balance.",
    actionConfirm: "Confirm Action",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
    accessDeniedAdminOnly: "Access Denied: Only authorized administrators may view this panel.",

    pricingManagement: "Pricing Management",
    pricingOverview: "WhatsApp Lines Pricing Model",
    defaultBdtPriceLabel: "Default Rate (BDT)",
    defaultUsdtPriceLabel: "Default Rate (USDT)",
    savePricingConfig: "Save Pricing Rules",
    setPriceForRequest: "Set Request Price",
    assignedPriceLabel: "Assigned Price",
    pricingUpdatedSuccess: "Pricing rules updated and published successfully!",
    savePricingChanges: "Save & Apply Pricing",
    unauthorizedDomainTitle: "Firebase Authorized Domain Required",
    unauthorizedDomainDesc: "Google Sign-In failed because this domain is not authorized in your Firebase Project. Please add mdrajidul99.github.io to Firebase Console > Authentication > Settings > Authorized domains.",
    adminLoginTitle: "Administrator Portal Login",
    adminSecurityGateway: "Administrator Security Gateway",
    adminLoginDesc: "Sign in with authorized administrator credentials to manage work requests, live chat, pricing, and payouts.",
    adminLoginButton: "Sign In as Administrator",
    userPortal: "User Portal",
    returnToUserSite: "Back to User Portal",
    notAuthorizedAdminDesc: "Your account is signed in but does not have administrator privileges. Please switch to the designated administrator account.",
    switchAccount: "Sign Out & Switch Account",
    loginTab: "Log In",
    registerTab: "Create Account"
  },
  bn: {
    brandName: "WS Sell World",
    tagline: "প্রফেশনাল হোয়াটসঅ্যাপ অ্যাকাউন্ট রিভিউ ও তাৎক্ষণিক উইথড্র প্ল্যাটফর্ম",
    home: "হোম",
    dashboard: "ড্যাশবোর্ড",
    sellWhatsApp: "হোয়াটসঅ্যাপ বিক্রি",
    withdraw: "উইথড্র",
    transactions: "লেনদেন",
    adminPanel: "অ্যাডমিন প্যানেল",
    login: "লগইন",
    register: "রেজিস্ট্রেশন",
    logout: "লগআউট",
    theme: "থিম",
    system: "সিস্টেম",
    light: "লাইট",
    dark: "ডার্ক",
    language: "ভাষা",

    username: "ইউজারনেম",
    email: "ইমেইল অ্যাড্রেস",
    password: "পাসওয়ার্ড",
    confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
    usernameOrEmail: "ইউজারনেম অথবা ইমেইল",
    alreadyHaveAccount: "ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন",
    dontHaveAccount: "অ্যাকাউন্ট নেই? নতুন অ্যাকাউন্ট তৈরি করুন",
    forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
    sendResetLink: "পাসওয়ার্ড রিসেট লিংক পাঠান",
    backToLogin: "লগইনে ফিরে যান",
    signInWithGoogle: "গুগল দিয়ে প্রবেশ করুন",
    registerNow: "অ্যাকাউন্ট তৈরি করুন",
    loginNow: "লগইন করুন",
    loggingIn: "লগইন হচ্ছে...",
    registering: "অ্যাকাউন্ট তৈরি হচ্ছে...",
    passwordsDoNotMatch: "উভয় পাসওয়ার্ড মিলছে না।",
    usernameRequired: "ইউজারনেম প্রয়োজন (ইংরেজি অক্ষর ও সংখ্যা, ৩-২০ অক্ষর)।",
    usernameInvalid: "ইউজারনেমে কেবল অক্ষর, সংখ্যা ও আন্ডারস্কোর থাকতে পারে।",
    usernameTaken: "এই ইউজারনেমটি ইতিমধ্যে নেওয়া হয়েছে। অন্য একটি নির্বাচন করুন।",
    emailInvalid: "অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা প্রদান করুন।",
    passwordTooShort: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।",
    resetLinkSent: "পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে!",

    verificationRequiredTitle: "ইমেইল ভেরিফিকেশন প্রয়োজন",
    verificationRequiredDesc: "অ্যাকাউন্টের নিরাপত্তা ও সুরক্ষিত ব্যালেন্স নিশ্চিত করতে ড্যাশবোর্ড, চ্যাট বা উইথড্র ব্যবহারের আগে আপনার ইমেইল যাচাই করা আবশ্যক।",
    resendVerificationEmail: "ভেরিফিকেশন ইমেইল পুনরায় পাঠান",
    resendCooldown: "অনুগ্রহ করে পুনরায় পাঠাতে {seconds} সেকেন্ড অপেক্ষা করুন।",
    refreshVerificationStatus: "আমি ভেরিফাই করেছি (স্ট্যাটাস চেক)",
    verificationEmailSent: "আপনার ইমেইলে ভেরিফিকেশন লিংক পাঠানো হয়েছে! ইনবক্স চেক করে লিংকে ক্লিক করুন।",
    accountVerifiedSuccess: "ইমেইল সফলভাবে ভেরিফাইড হয়েছে! ড্যাশবোর্ডে স্বাগতম।",
    accountStillUnverified: "ইমেইল এখনো ভেরিফাই হয়নি। স্প্যাম ফোল্ডার দেখুন অথবা পুনরায় পাঠান।",
    unverifiedBannerMessage: "আপনার অ্যাকাউন্ট এখনো ভেরিফাইড হয়নি। ব্যালেন্স উইথড্র ও সুরক্ষা নিশ্চিত করতে অনুগ্রহ করে ইমেইল ভেরিফাই করুন।",

    welcomeBack: "স্বাগতম",
    accountStatus: "অ্যাকাউন্ট স্ট্যাটাস",
    verified: "ভেরিফাইড",
    unverified: "আনভেরিফাইড",
    active: "সক্রিয়",
    suspended: "স্থগিত",
    availableBalanceBDT: "উইথড্রযোগ্য ব্যালেন্স (BDT)",
    availableBalanceUSDT: "উইথড্রযোগ্য ব্যালেন্স (USDT)",
    pendingBalanceBDT: "অপেক্ষারত ব্যালেন্স (BDT)",
    pendingBalanceUSDT: "অপেক্ষারত ব্যালেন্স (USDT)",
    totalApprovedEarnings: "মোট অনুমোদিত আয়",
    totalWithdrawn: "মোট উইথড্র করা হয়েছে",
    quickActions: "দ্রুত লিঙ্ক",
    recentWorkRequests: "সাম্প্রতিক কাজের অনুরোধ",
    recentWithdrawals: "সাম্প্রতিক উইথড্র রেকর্ড",
    noRequestsYet: "এখনো কোনো অনুরোধ জমা দেওয়া হয়নি।",
    noWithdrawalsYet: "এখনো কোনো উইথড্র রেকর্ড নেই।",
    viewAll: "সব দেখুন",

    chatToSellWhatsApp: "হোয়াটসঅ্যাপ বিক্রির জন্য চ্যাট করুন",
    chatLanguagePromptTitle: "আপনার পছন্দের চ্যাট ভাষা নির্বাচন করুন",
    chatLanguagePromptDesc: "অ্যাডমিনের সাথে যোগাযোগের জন্য আপনার পছন্দের ভাষা নির্বাচন করুন।",
    selectEnglishChat: "English",
    selectBengaliChat: "বাংলা",
    startChatButton: "কথোপকথন শুরু করুন",
    whatsappRequestTitle: "হোয়াটসঅ্যাপ রিভিউ অনুরোধ জমা দিন",
    whatsappCountryCode: "কান্ট্রি কোড",
    whatsappPhoneNumber: "হোয়াটসঅ্যাপ মোবাইল নম্বর",
    whatsappAccountAge: "অ্যাকাউন্টের বয়স (দিন / মাস)",
    whatsappNotes: "অ্যাকাউন্ট সম্পর্কিত অতিরিক্ত তথ্য",
    submitRequestButton: "অনুরোধ জমা দিন এবং চ্যাট খুলুন",
    requestSubmittedSuccess: "অনুরোধ সফলভাবে গৃহীত হয়েছে! এখন অ্যাডমিনের সাথে সরাসরি চ্যাট করতে পারেন।",
    statusPending: "পর্যালোচনায় আছে",
    statusApproved: "অনুমোদিত",
    statusRejected: "প্রত্যাখ্যাত",
    statusPaid: "পেইড / সম্পন্ন",
    statusRefunded: "রিফান্ডকৃত",
    safetyDisclaimerTitle: "বাধ্যতামূলক নিরাপত্তা ও তথ্য সুরক্ষা সতর্কতা",
    safetyDisclaimerDesc: "WS Sell World কখনোই আপনার হোয়াটসঅ্যাপ ওটিপি (OTP), এসএমএস কোড, টু-স্টেপ পিন অথবা পাসওয়ার্ড চায় না এবং সংরক্ষণ করে না। সমস্ত প্রক্রিয়া মালিকানার সম্মতি সাপেক্ষে পরিচালিত হয়। চ্যাটে কখনো সংবেদনশীল কোড দেবেন না।",
    liveChatWithAdmin: "অ্যাডমিনের সাথে লাইভ চ্যাট",
    typeYourMessage: "অ্যাডমিনকে মেসেজ লিখুন...",
    sendMessage: "পাঠান",
    emptyConversation: "এখনো কোনো বার্তা নেই। কথোপকথন শুরু করতে একটি মেসেজ পাঠান।",
    requestStatusLabel: "অনুরোধের অবস্থা",
    rejectionReasonLabel: "প্রত্যাখ্যানের কারণ",
    adminNotesLabel: "অ্যাডমিন নোট",

    withdrawFunds: "ব্যালেন্স উইথড্র করুন",
    selectMethod: "উইথড্র মাধ্যম নির্বাচন করুন",
    bangladeshLocalMethods: "বাংলাদেশের লোকাল মোবাইল ব্যাংকিং",
    internationalCryptoMethods: "আন্তর্জাতিক ক্রিপ্টো (শুধুমাত্র USDT)",
    methodBkash: "বিকাশ (ন্যূনতম ১৫ টাকা)",
    methodNagad: "নগদ (ন্যূনতম ১৫ টাকা)",
    cryptoUSDT: "ইউএসডিটি (USDT) ট্রান্সফার",
    selectCryptoNetwork: "USDT নেটওয়ার্ক নির্বাচন করুন",
    minWithdrawalNote: "{method}-এর জন্য সর্বনিম্ন উইথড্র: {min} {currency}",
    withdrawalAmount: "উইথড্র পরিমাণ",
    recipientPhone: "প্রাপকের মোবাইল নম্বর",
    recipientPhonePlaceholder: "যেমন: 01700000000 (১১ ডিজিট)",
    walletAddress: "প্রাপকের ওয়ালেট অ্যাড্রেস",
    walletAddressPlaceholder: "সঠিক ওয়ালেট ঠিকানা দিন",
    confirmWithdrawal: "উইথড্র অনুরোধ নিশ্চিত করুন",
    confirmWithdrawalDesc: "পেমেন্টের বিবরণ যত্নসহকারে পরীক্ষা করুন। উইথড্র করার সাথে সাথে ব্যালেন্স সংরক্ষিত হবে এবং অ্যাডমিন পর্যালোচনার পর পাঠানো হবে।",
    submitWithdrawalButton: "উইথড্র অনুরোধ নিশ্চিত করুন",
    submittingWithdrawal: "অনুরোধ প্রক্রিয়াকরণ হচ্ছে...",
    withdrawalCreatedSuccess: "উইথড্র অনুরোধ সফলভাবে জমা হয়েছে! অ্যাডমিন পেমেন্ট পাঠানোর পর আপডেট পাবেন।",
    insufficientBalance: "আপনার পর্যাপ্ত ব্যালেন্স নেই।",
    amountBelowMinimum: "প্রদত্ত পরিমাণ সর্বনিম্ন সীমার ({min} {currency}) চেয়ে কম।",
    invalidPhoneNumber: "১১ ডিজিটের সঠিক মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)।",
    invalidWalletAddress: "নির্বাচিত নেটওয়ার্কের জন্য ওয়ালেট ঠিকানাটি সঠিক নয়।",
    withdrawalHistory: "উইথড্র হিস্ট্রি",
    txHashOrId: "ট্রানজ্যাকশন আইডি / রেফারেন্স",
    date: "তারিখ ও সময়",
    method: "মাধ্যম / নেটওয়ার্ক",
    amount: "পরিমাণ",
    status: "স্ট্যাটাস",

    transactionLedgerTitle: "লেনদেনের খতিয়ান (লেজার)",
    transactionType: "লেনদেনের ধরণ",
    currency: "কারেন্সি",
    reference: "রেফারেন্স আইডি",
    typeApprovedEarning: "অনুমোদিত আয়",
    typeWithdrawalReserved: "উইথড্রর জন্য সংরক্ষিত",
    typeWithdrawalPaid: "উইথড্র সম্পন্ন",
    typeWithdrawalRefund: "উইথড্র রিফান্ড",
    typeAuthorizedAdjustment: "অনুমোদিত ব্যালেন্স সমন্বয়",
    noTransactionsYet: "এখনো কোনো লেনদেন রেকর্ড নেই।",

    adminTitle: "অ্যাডমিনিস্ট্রেটর পোর্টাল",
    adminOverview: "সার্বিক তথ্য",
    adminWorkRequests: "কাজের অনুরোধসমূহ",
    adminLiveChat: "লাইভ ইউজার চ্যাট",
    adminWithdrawals: "উইথড্র অনুরোধসমূহ",
    adminUsers: "ইউজার ডিরেক্টরি",
    adminAuditHistory: "অডিট ট্রেইল",
    totalUsersCount: "মোট ইউজার",
    verifiedUsersCount: "ভেরিফাইড ইউজার",
    pendingRequestsCount: "অপেক্ষারত অনুরোধ",
    pendingWithdrawalsCount: "অপেক্ষারত উইথড্র",
    totalBdtPaidOut: "মোট বিডিটি পরিশোধ",
    totalUsdtPaidOut: "মোট ইউএসডিটি পরিশোধ",
    searchUsersPlaceholder: "ইউজারনেম, ইমেইল বা ইউআইডি দিয়ে খুঁজুন...",
    approveRequest: "অনুরোধ অনুমোদন করুন",
    rejectRequest: "অনুরোধ প্রত্যাখ্যান করুন",
    keepPending: "অপেক্ষারত রাখুন",
    enterEarningAmount: "আয়ের পরিমাণ নির্ধারণ করুন",
    enterRejectionReason: "প্রত্যাখ্যানের কারণ লিখুন (ইউজার দেখতে পাবেন)",
    enterTxIdForPayment: "পেমেন্ট ট্রানজ্যাকশন আইডি / হ্যাশ (বাধ্যতামূলক)",
    markAsPaid: "পেমেন্ট পাঠানো হয়েছে চিহ্নিত করুন",
    refundWithdrawal: "প্রত্যাখ্যান করে ব্যালেন্স রিফান্ড করুন",
    paymentApprovedSuccess: "পেমেন্ট রেফারেন্স সহ সফলভাবে সংরক্ষিত হয়েছে!",
    requestRejectedSuccess: "অনুরোধ প্রত্যাখ্যান করা হয়েছে।",
    withdrawalRefundedSuccess: "উইথড্র বাতিল করে ইউজারের ব্যালেন্সে অর্থ ফেরত দেওয়া হয়েছে।",
    actionConfirm: "পদক্ষেপ নিশ্চিত করুন",
    cancel: "বাতিল",
    confirm: "নিশ্চিত করুন",
    close: "বন্ধ করুন",
    accessDeniedAdminOnly: "প্রবেশাধিকার নিষিদ্ধ: কেবল অনুমোদিত অ্যাডমিন এই প্যানেল দেখতে পারেন।",

    pricingManagement: "মূল্য নির্ধারণ ব্যবস্থাপনা",
    pricingOverview: "হোয়াটসঅ্যাপ লাইনের স্ট্যান্ডার্ড মূল্য কাঠামো",
    defaultBdtPriceLabel: "ডিফল্ট রেট (BDT)",
    defaultUsdtPriceLabel: "ডিফল্ট রেট (USDT)",
    savePricingConfig: "মূল্য নিয়মাবলী সংরক্ষণ করুন",
    setPriceForRequest: "অনুরোধের মূল্য নির্ধারণ করুন",
    assignedPriceLabel: "নির্ধারিত মূল্য",
    pricingUpdatedSuccess: "মূল্য কাঠামো সফলভাবে আপডেট ও সংরক্ষিত হয়েছে!",
    savePricingChanges: "মূল্য পরিবর্তন সংরক্ষণ করুন",
    unauthorizedDomainTitle: "ফায়ারবেস অনুমোদিত ডোমেন প্রয়োজন",
    unauthorizedDomainDesc: "গুগল সাইন-ইন সম্পন্ন করা যায়নি কারণ আপনার ফায়ারবেস প্রজেক্টে এই ডোমেনটি অনুমোদিত তালিকায় নেই। অনুগ্রহ করে Firebase Console > Authentication > Settings > Authorized domains-এ mdrajidul99.github.io যুক্ত করুন।",
    adminLoginTitle: "অ্যাডমিনিস্ট্রেটর পোর্টাল লগইন",
    adminSecurityGateway: "অ্যাডমিন সিকিউরিটি গেটওয়ে",
    adminLoginDesc: "কাজের অনুরোধ, লাইভ চ্যাট, মূল্য নির্ধারণ ও পেমেন্ট পরিচালনার জন্য নির্ধারিত অ্যাডমিন তথ্য দিয়ে প্রবেশ করুন।",
    adminLoginButton: "অ্যাডমিন হিসেবে লগইন করুন",
    userPortal: "ইউজার পোর্টাল",
    returnToUserSite: "মূল ইউজার পোর্টালে ফিরুন",
    notAuthorizedAdminDesc: "আপনার অ্যাকাউন্টটি সাধারণ ব্যবহারকারী হিসেবে লগইন করা রয়েছে। অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করতে অনুগ্রহ করে অনুমোদিত অ্যাডমিন অ্যাকাউন্টে সুইচ করুন।",
    switchAccount: "লগআউট করে অ্যাকাউন্ট পরিবর্তন করুন",
    loginTab: "লগইন",
    registerTab: "নতুন অ্যাকাউন্ট তৈরি"
  }
};
