export interface Translations {
  loginHeroTitle: string;
  loginHeroSubtitle: string;
  loginCopyright: (year: number) => string;
  welcomeBack: string;
  signInSubtitle: string;
  emailAddress: string;
  password: string;
  signIn: string;
  signingIn: string;
  accessRestricted: string;
  authErrorInvalidEmail: string;
  authErrorUserDisabled: string;
  authErrorWrongCredentials: string;
  authErrorTooManyRequests: string;
  authErrorConfigNotFound: string;
  authErrorNetwork: string;
  authErrorGeneric: string;

  forgotPasswordLink: string;
  forgotPasswordTitle: string;
  forgotPasswordSubtitle: string;
  sendResetLink: string;
  backToSignIn: string;
  resetEmailSentTitle: string;
  resetEmailSentSubtitle: (email: string) => string;

  account: string;
  signedInAs: string;
  editProfile: string;
  signOut: string;
  accountNotSetUp: string;
  profileLoadFailed: string;

  editProfileTitle: string;
  uploading: string;
  avatarUpdated: string;
  displayName: string;
  yourName: string;
  save: string;
  nameUpdated: string;
  changePassword: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  updatePassword: string;
  passwordUpdated: string;

  totalCustomers: string;
  loyalCustomers: string;
  normalCustomers: string;
  newThisMonth: string;
  loyaltyDistribution: string;
  newCustomersChart: string;

  searchPlaceholder: string;
  filterAll: string;
  filterLoyalOnly: string;
  filterNormalOnly: string;
  import: string;
  addCustomer: string;

  statusLoyal: string;
  statusNormal: string;

  editCustomer: string;
  fieldName: string;
  fieldNamePlaceholder: string;
  fieldMainPhone: string;
  fieldMainPhonePlaceholder: string;
  fieldBackupPhone: string;
  fieldBackupPhonePlaceholder: string;
  fieldBundle: string;
  fieldBundlePlaceholder: string;
  fieldStatus: string;
  fieldCreatedDate: string;
  fieldCreatedDateHelper: string;
  cancel: string;
  saveChanges: string;
  nameRequired: string;
  mainPhoneRequired: string;
  phoneInvalid: string;
  duplicatePhone: (name: string) => string;
  bundleRequired: string;

  colName: string;
  colMainPhone: string;
  colBackupPhone: string;
  colBundle: string;
  colStatus: string;
  colCreated: string;
  colActions: string;
  actionToggle: string;
  actionEdit: string;
  actionDelete: string;
  actionMarkNormal: string;
  actionMarkLoyal: string;

  emptyFilteredTitle: string;
  emptyFilteredSubtitle: string;
  emptyTitle: string;
  emptySubtitle: string;

  deleteCustomerTitle: string;
  deleteCustomerMessage: (name: string) => string;
  delete: string;

  couldntLoadCustomers: string;
  couldntLoadTopups: string;

  importTitle: string;
  importInstructions: string;
  importChooseFile: string;
  importFileTypes: string;
  importDownloadTemplate: string;
  importFileInfo: (fileName: string, rows: number) => string;
  importChooseDifferent: string;
  importReadyToImport: (n: number) => string;
  importWillBeSkipped: (n: number) => string;
  importColName: string;
  importColMainPhone: string;
  importColBundle: string;
  importColBundleExpiry: string;
  importColAssignedBundle: string;
  importAssignedBundleNotMatched: string;
  importColStatus: string;
  importColRow: string;
  importValid: string;
  importDone: (n: number) => string;
  importDoneSubtitle: string;
  importButtonImporting: string;
  importButton: (n: number) => string;
  doneLabel: string;

  fieldBundleExpiry: string;
  fieldBundleExpiryHelper: string;
  fieldAssignedBundle: string;
  fieldAssignedBundleNone: string;
  fieldAssignedBundleHelper: string;
  expiryBadgeExpired: string;
  expiryBadgeDays: (n: number) => string;
  statsExpiringSoon: string;
  filterExpiring: string;
  filterAlphabetical: string;
  filterByExpiry: string;

  export: string;

  actionHistory: string;
  actionCall: string;
  clearOverdueTitle: string;
  clearOverdueMessage: (name: string) => string;
  historyTitle: string;
  historyEmpty: string;
  addNote: string;
  notePlaceholder: string;

  activityCreated: string;
  activityUpdated: string;
  activityStatusChanged: (status: string) => string;
  activityCalled: (phone: string) => string;

  notifTitle: string;
  smsAutomationTitle: string;
  biometricTitle: string;
  biometricDesc: string;
  biometricEnable: string;
  biometricDisable: string;
  biometricEnabledOnDevice: string;
  biometricSetupFailed: string;
  biometricLockedTitle: string;
  biometricFailed: string;
  biometricTryAgain: string;
  biometricUsePasswordInstead: string;
  biometricAutoLockTitle: string;
  biometricAutoLockImmediately: string;
  biometricAutoLock1Min: string;
  biometricAutoLock30Min: string;
  notifEnable: string;
  notifEnabled: string;
  notifDenied: string;
  notifUnsupported: string;
  notifError: string;

  navCustomers: string;
  navDebtCustomers: string;
  toggleSidebar: string;
  installApp: string;

  debtCustomersTitle: string;
  debtCustomersSubtitle: string;
  totalDebt: string;
  addDebtCustomer: string;
  editDebtCustomer: string;
  fieldPhone: string;
  fieldPhonePlaceholder: string;
  fieldAmount: string;
  fieldAmountPlaceholder: string;
  phoneRequired: string;
  amountRequired: string;
  amountInvalid: string;
  debtColName: string;
  debtColPhone: string;
  debtColBackupPhone: string;
  debtColAmount: string;
  debtColCreated: string;
  debtColActions: string;
  debtEmptyTitle: string;
  debtEmptySubtitle: string;
  debtEmptyFilteredTitle: string;
  debtEmptyFilteredSubtitle: string;
  deleteDebtCustomerTitle: string;
  deleteDebtCustomerMessage: (name: string) => string;
  couldntLoadDebtCustomers: string;
  debtSearchPlaceholder: string;

  navBundles: string;
  navExpiredBundles: string;
  navAnalytics: string;
  navDashboard: string;
  dashboardTitle: string;
  dashboardSubtitle: string;
  topCustomerLabel: string;
  recentTopupsTitle: string;

  navSettings: string;
  settingsTitle: string;
  settingsSubtitle: string;
  settingsLanguage: string;

  bundlesTitle: string;
  bundlesSubtitle: string;
  addBundle: string;
  editBundle: string;
  fieldBundleName: string;
  fieldBundleNamePlaceholder: string;
  fieldPrice: string;
  fieldPricePlaceholder: string;
  fieldDurationValue: string;
  fieldDurationValuePlaceholder: string;
  fieldDurationUnit: string;
  durationUnitHours: string;
  durationUnitDays: string;
  durationUnitMonths: string;
  bundleColName: string;
  bundleColPrice: string;
  bundleColDuration: string;
  bundleColActions: string;
  bundleEmptyTitle: string;
  bundleEmptySubtitle: string;
  loadDefaultPricing: string;
  loadTanaadBulaalPricing: string;
  deleteBundleTitle: string;
  deleteBundleMessage: (name: string) => string;
  couldntLoadBundles: string;
  priceRequired: string;
  priceInvalid: string;
  durationRequired: string;
  durationInvalid: string;

  expiredBundlesTitle: string;
  expiredBundlesSubtitle: string;
  colDaysOverdue: string;
  daysOverdue: (n: number) => string;
  expiredEmptyTitle: string;
  expiredEmptySubtitle: string;

  analyticsTitle: string;
  analyticsSubtitle: string;
  periodToday: string;
  periodWeek: string;
  periodMonth: string;
  periodAll: string;
  topSpendersTitle: string;
  lowSpendersTitle: string;
  totalTopupVolume: string;
  customersWithTopups: string;
  avgTopupPerCustomer: string;
  noTopupsYet: string;

  navSmsReminders: string;
  smsRemindersTitle: string;
  smsRemindersSubtitle: string;
  colSentAt: string;
  viewMessage: string;
  smsMessageNotFound: string;
  smsStatusSent: string;
  smsStatusPending: string;
  smsRemindersEmptyTitle: string;
  smsRemindersEmptySubtitle: string;

  navEscalations: string;
  escalationsTitle: string;
  escalationsSubtitle: string;
  colEscalatedAt: string;
  escalationsEmptyTitle: string;
  escalationsEmptySubtitle: string;

  navFraudAlerts: string;
  fraudAlertsTitle: string;
  fraudAlertsSubtitle: string;
  fraudAlertsEmptyTitle: string;
  fraudAlertsEmptySubtitle: string;
  colPhone: string;
  colAmount: string;
  colDetectedAt: string;
  colReason: string;
  actionMarkReviewed: string;
  fraudReasonDuplicateTransaction: string;
  fraudReasonBalanceIncreasedAfterSale: string;
  fraudReasonBackdatedTimestamp: string;

  navBroadcast: string;
  broadcastTitle: string;
  broadcastSubtitle: string;
  broadcastMessageLabel: string;
  broadcastMessageHint: string;
  broadcastProspectMessageLabel: string;
  broadcastProspectMessageHint: string;
  broadcastProspectTag: string;
  broadcastConverted: string;
  broadcastProgress: (sent: number, total: number) => string;
  broadcastImportButton: string;
  broadcastImportNoRows: string;
  broadcastImportFailed: string;
  broadcastEmptyTitle: string;
  broadcastEmptySubtitle: string;
  broadcastSent: string;
  broadcastNotSent: string;
  broadcastSendAction: string;
  broadcastResend: string;
  broadcastDeleteTitle: string;
  broadcastDeleteMessage: (name: string) => string;

  navDownloadApps: string;
  downloadAppsTitle: string;
  downloadAppsSubtitle: string;
  downloadAppCrmTitle: string;
  downloadAppCrmDesc: string;
  downloadAppCrmInstalled: string;
  installManualLabel: string;
  installStepIosShare: string;
  installStepIosAdd: string;
  installStepIosConfirm: string;
  installStepAndroidMenu: string;
  installStepAndroidInstall: string;
  installStepDesktopIcon: string;
  installStepDesktopInstall: string;
  downloadAppFdroidTitle: string;
  downloadAppFdroidDesc: string;
  downloadAppTermuxApiTitle: string;
  downloadAppTermuxApiDesc: string;
  downloadAppTermuxTitle: string;
  downloadAppTermuxDesc: string;
  downloadAppCronJobTitle: string;
  downloadAppCronJobDesc: string;
  downloadOpen: string;

  navUsers: string;
  usersTitle: string;
  usersSubtitle: string;
  addUser: string;
  colBusinessName: string;
  colOwnerName: string;
  colEmail: string;
  colCustomers: string;
  colJoined: string;
  statusActive: string;
  statusDisabled: string;
  actionDisable: string;
  actionEnable: string;
  actionDeleteUser: string;
  fieldOwnerName: string;
  fieldBusinessName: string;
  fieldEmail: string;
  fieldPassword: string;
  fieldSupportPhone: string;
  fieldSupportPhoneBackup: string;
  userCreatedTitle: string;
  userCreatedSubtitle: string;
  webhookTokenLabel: string;
  webhookUrlsLabel: string;
  downloadForwarderScriptLabel: string;
  copyToClipboard: string;
  copied: string;
  usersEmptyTitle: string;
  usersEmptySubtitle: string;
  deleteUserTitle: string;
  deleteUserMessage: (name: string) => string;
  couldntLoadUsers: string;
  userCreateFailed: string;
}

export const translations: Record<"en" | "so", Translations> = {
  en: {
    loginHeroTitle: "Manage every customer relationship in one place.",
    loginHeroSubtitle:
      "Track subscriptions, loyalty status, and contact details for every Amtel customer — in real time.",
    loginCopyright: (year) => `© ${year} Amtel. All rights reserved.`,
    welcomeBack: "Welcome back",
    signInSubtitle: "Sign in to access the Amtel CRM dashboard.",
    emailAddress: "Email address",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in...",
    accessRestricted: "Access is restricted to authorized Amtel staff.",
    authErrorInvalidEmail: "That email address doesn't look right.",
    authErrorUserDisabled: "This account has been disabled.",
    authErrorWrongCredentials: "Incorrect email or password.",
    authErrorTooManyRequests: "Too many attempts. Please wait a moment and try again.",
    authErrorConfigNotFound:
      "Email/Password sign-in isn't enabled for this Firebase project yet. Enable it in the Firebase Console under Authentication → Sign-in method.",
    authErrorNetwork: "Network error. Check your connection and try again.",
    authErrorGeneric: "Sign in failed. Please try again.",

    forgotPasswordLink: "Forgot password?",
    forgotPasswordTitle: "Reset your password",
    forgotPasswordSubtitle: "Enter your email and we'll send you a link to reset your password.",
    sendResetLink: "Send Reset Link",
    backToSignIn: "Back to sign in",
    resetEmailSentTitle: "Check your email",
    resetEmailSentSubtitle: (email) => `We sent a password reset link to ${email}. Open it on this device to set a new password.`,

    account: "Account",
    signedInAs: "Signed in as",
    editProfile: "Edit Profile",
    signOut: "Sign out",
    accountNotSetUp:
      "Your account isn't fully set up yet. Please contact the person who created your login.",
    profileLoadFailed: "Couldn't load your account. Check your connection and try again.",

    editProfileTitle: "Edit Profile",
    uploading: "Uploading...",
    avatarUpdated: "Avatar updated",
    displayName: "Display Name",
    yourName: "Your name",
    save: "Save",
    nameUpdated: "Name updated",
    changePassword: "Change Password",
    currentPassword: "Current password",
    newPassword: "New password (min. 6 characters)",
    confirmNewPassword: "Confirm new password",
    updatePassword: "Update Password",
    passwordUpdated: "Password updated",

    totalCustomers: "Total Customers",
    loyalCustomers: "Loyal Customers",
    normalCustomers: "Normal Customers",
    newThisMonth: "New This Month",
    loyaltyDistribution: "Loyalty Distribution",
    newCustomersChart: "New Customers (Last 6 Months)",

    searchPlaceholder: "Search name or phone...",
    filterAll: "All Customers",
    filterLoyalOnly: "Loyal Only",
    filterNormalOnly: "Normal Only",
    import: "Import",
    addCustomer: "Add Customer",

    statusLoyal: "Loyal",
    statusNormal: "Normal",

    editCustomer: "Edit Customer",
    fieldName: "Name",
    fieldNamePlaceholder: "e.g. John Doe",
    fieldMainPhone: "Main Phone",
    fieldMainPhonePlaceholder: "+1 555 123 4567",
    fieldBackupPhone: "Backup Phone",
    fieldBackupPhonePlaceholder: "Optional",
    fieldBundle: "Bundle / Plan",
    fieldBundlePlaceholder: "e.g. Monthly 20GB, VIP Pro",
    fieldStatus: "Status",
    fieldCreatedDate: "Created Date",
    fieldCreatedDateHelper: "Defaults to today. Backdate this for historical or imported records.",
    cancel: "Cancel",
    saveChanges: "Save Changes",
    nameRequired: "Name is required.",
    mainPhoneRequired: "Main phone is required.",
    phoneInvalid: "Enter a valid phone number.",
    duplicatePhone: (name) => `This phone number is already registered to ${name}.`,
    bundleRequired: "Bundle / plan is required.",

    colName: "Name",
    colMainPhone: "Main Phone",
    colBackupPhone: "Backup Phone",
    colBundle: "Bundle",
    colStatus: "Status",
    colCreated: "Created",
    colActions: "Actions",
    actionToggle: "Toggle",
    actionEdit: "Edit",
    actionDelete: "Delete",
    actionMarkNormal: "Mark as Normal",
    actionMarkLoyal: "Mark as Loyal",

    emptyFilteredTitle: "No customers found",
    emptyFilteredSubtitle: "Try adjusting your search term or filter to find what you're looking for.",
    emptyTitle: "No customers yet",
    emptySubtitle: "Get started by adding your first customer record.",

    deleteCustomerTitle: "Delete customer?",
    deleteCustomerMessage: (name) =>
      `This will permanently remove "${name}" from your customer list. This action cannot be undone.`,
    delete: "Delete",

    couldntLoadCustomers: "Couldn't load customers",
    couldntLoadTopups: "Couldn't load top-up data",

    importTitle: "Import Customers",
    importInstructions:
      "Upload an Excel (.xlsx) or CSV file to bulk-add customers. The first row must contain column headers — Name, Main Phone, Backup Phone, Bundle, Status, Created Date, Bundle Expiry, and Assigned Bundle are recognized automatically. Bundle Expiry accepts a date (e.g. 2026-09-15). Assigned Bundle should exactly match a package name from the Bundles page (used for SMS auto-renewal matching); leave either blank to skip.",
    importChooseFile: "Click to choose a file",
    importFileTypes: ".xlsx or .csv",
    importDownloadTemplate: "Download a template spreadsheet",
    importFileInfo: (fileName, rows) => `${fileName} · ${rows} rows`,
    importChooseDifferent: "Choose different file",
    importReadyToImport: (n) => `${n} ready to import`,
    importWillBeSkipped: (n) => `${n} will be skipped`,
    importColName: "Name",
    importColMainPhone: "Main Phone",
    importColBundle: "Bundle",
    importColBundleExpiry: "Bundle Expiry",
    importColAssignedBundle: "Assigned Bundle",
    importAssignedBundleNotMatched: "Not matched",
    importColStatus: "Status",
    importColRow: "Row",
    importValid: "Valid",
    importDone: (n) => `Imported ${n} customer${n === 1 ? "" : "s"}`,
    importDoneSubtitle: "They'll appear in your customer list right away.",
    importButtonImporting: "Importing...",
    importButton: (n) => `Import ${n} Customer${n === 1 ? "" : "s"}`,
    doneLabel: "Done",

    fieldBundleExpiry: "Bundle Expiry",
    fieldBundleExpiryHelper: "Optional. Used to flag upcoming or lapsed renewals.",
    fieldAssignedBundle: "Assigned Bundle (for auto-renewal)",
    fieldAssignedBundleNone: "Unassigned",
    fieldAssignedBundleHelper:
      "Several packages can share the same price, so this pins which one this customer is on — needed for the SMS top-up automation to renew the right bundle.",
    expiryBadgeExpired: "Expired",
    expiryBadgeDays: (n) => (n === 0 ? "Expires today" : `Expires in ${n}d`),
    statsExpiringSoon: "Expiring Soon",
    filterExpiring: "Expiring Soon",
    filterAlphabetical: "Sort A–Z",
    filterByExpiry: "Sort by Expiry",

    export: "Export",

    actionHistory: "History",
    actionCall: "Call",
    clearOverdueTitle: "Clear overdue status?",
    clearOverdueMessage: (name) =>
      `Removes ${name} from this list — use this when they've actually paid but the automation missed it (e.g. the forwarder was down). Clears their expiry tracking; their next real top-up sets a fresh one normally.`,
    historyTitle: "Customer History",
    historyEmpty: "No activity yet.",
    addNote: "Add Note",
    notePlaceholder: "Write a note...",

    activityCreated: "Customer created.",
    activityUpdated: "Customer details updated.",
    activityStatusChanged: (status) => `Status changed to ${status}.`,
    activityCalled: (phone) => `Called ${phone}.`,

    notifTitle: "Push Notifications",
    smsAutomationTitle: "SMS Automation",
    biometricTitle: "Biometric Unlock",
    biometricDesc:
      "Use Face ID, Touch ID, or fingerprint to unlock the app on this device instead of typing your password every time. Confirm your password once to turn it on.",
    biometricEnable: "Enable Biometric Unlock",
    biometricDisable: "Turn Off",
    biometricEnabledOnDevice: "Enabled on this device.",
    biometricSetupFailed: "Couldn't set up biometric unlock. Please try again.",
    biometricLockedTitle: "Unlock with Face ID / Fingerprint to continue.",
    biometricFailed: "Couldn't verify. Try again, or sign in with your password instead.",
    biometricTryAgain: "Try Again",
    biometricUsePasswordInstead: "Use password instead",
    biometricAutoLockTitle: "Automatically lock",
    biometricAutoLockImmediately: "Immediately",
    biometricAutoLock1Min: "After 1 minute",
    biometricAutoLock30Min: "After 30 minutes",
    notifEnable: "Enable Notifications",
    notifEnabled: "Notifications enabled on this device",
    notifDenied:
      "Notifications are blocked for this site. Tap the lock/info icon next to the address bar, open Site settings, and set Notifications to Allow, then try again.",
    notifUnsupported: "Push notifications aren't supported in this browser.",
    notifError: "Couldn't enable notifications. Please try again.",

    navCustomers: "Customers",
    navDebtCustomers: "Debt Customers",
    toggleSidebar: "Toggle menu",
    installApp: "Install App",

    debtCustomersTitle: "Debt Customers",
    debtCustomersSubtitle: "Track customers who owe money and how much they still need to pay.",
    totalDebt: "Total Debt",
    addDebtCustomer: "Add Debt Customer",
    editDebtCustomer: "Edit Debt Customer",
    fieldPhone: "Phone",
    fieldPhonePlaceholder: "+1 555 123 4567",
    fieldAmount: "Amount Owed",
    fieldAmountPlaceholder: "0.00",
    phoneRequired: "Phone number is required.",
    amountRequired: "Amount is required.",
    amountInvalid: "Enter a valid amount.",
    debtColName: "Name",
    debtColPhone: "Phone",
    debtColBackupPhone: "Backup Phone",
    debtColAmount: "Amount Owed",
    debtColCreated: "Created",
    debtColActions: "Actions",
    debtEmptyTitle: "No debt customers yet",
    debtEmptySubtitle: "Add a customer who owes money to start tracking their debt.",
    debtEmptyFilteredTitle: "No debt customers found",
    debtEmptyFilteredSubtitle: "Try adjusting your search term to find what you're looking for.",
    deleteDebtCustomerTitle: "Delete debt record?",
    deleteDebtCustomerMessage: (name) =>
      `This will permanently remove "${name}" from your debt customer list. This action cannot be undone.`,
    couldntLoadDebtCustomers: "Couldn't load debt customers",
    debtSearchPlaceholder: "Search name or phone...",

    navBundles: "Bundles",
    navExpiredBundles: "Expired Bundles",
    navAnalytics: "Analytics",
    navDashboard: "Dashboard",
    dashboardTitle: "Dashboard",
    dashboardSubtitle: "A quick look at how the business is doing right now.",
    topCustomerLabel: "Top Customer",
    recentTopupsTitle: "Recent Top-ups",

    navSettings: "Settings",
    settingsTitle: "Settings",
    settingsSubtitle: "Manage your profile, password, notifications, and language.",
    settingsLanguage: "Language",

    bundlesTitle: "Bundles",
    bundlesSubtitle:
      "Manage the pricing tiers used to auto-renew customer bundles from EVC top-up SMS.",
    addBundle: "Add Bundle",
    editBundle: "Edit Bundle",
    fieldBundleName: "Package Name",
    fieldBundleNamePlaceholder: "e.g. Unlimited",
    fieldPrice: "Price ($)",
    fieldPricePlaceholder: "0.25",
    fieldDurationValue: "Duration",
    fieldDurationValuePlaceholder: "10",
    fieldDurationUnit: "Unit",
    durationUnitHours: "Hours",
    durationUnitDays: "Days",
    durationUnitMonths: "Months",
    bundleColName: "Package",
    bundleColPrice: "Price",
    bundleColDuration: "Duration",
    bundleColActions: "Actions",
    bundleEmptyTitle: "No bundles registered yet",
    bundleEmptySubtitle: "Add pricing tiers, or load the current defaults to get started.",
    loadDefaultPricing: "Load Default Pricing",
    loadTanaadBulaalPricing: "Load Tanaad & Bulaal Lite Pricing",
    deleteBundleTitle: "Delete bundle?",
    deleteBundleMessage: (name) =>
      `This will permanently remove "${name}" from your bundle list. Top-ups at this price will no longer auto-renew until you add it back. This action cannot be undone.`,
    couldntLoadBundles: "Couldn't load bundles",
    priceRequired: "Price is required.",
    priceInvalid: "Enter a valid price.",
    durationRequired: "Duration is required.",
    durationInvalid: "Enter a valid duration.",

    expiredBundlesTitle: "Expired Bundles",
    expiredBundlesSubtitle: "Customers whose bundle has lapsed and who haven't topped up since.",
    colDaysOverdue: "Overdue",
    daysOverdue: (n) => (n === 0 ? "Expired today" : n === 1 ? "1 day overdue" : `${n} days overdue`),
    expiredEmptyTitle: "No expired bundles",
    expiredEmptySubtitle: "Every customer with a tracked bundle is currently up to date.",

    analyticsTitle: "Analytics",
    analyticsSubtitle: "See who's topping up the most — and who might need a nudge.",
    periodToday: "Today",
    periodWeek: "This Week",
    periodMonth: "This Month",
    periodAll: "All Time",
    topSpendersTitle: "Top Spenders",
    lowSpendersTitle: "Lowest Spenders",
    totalTopupVolume: "Total Top-up Volume",
    customersWithTopups: "Customers With Top-ups",
    avgTopupPerCustomer: "Avg. per Customer",
    noTopupsYet: "No top-ups recorded yet.",

    navSmsReminders: "SMS Reminders Sent",
    smsRemindersTitle: "SMS Reminders Sent",
    smsRemindersSubtitle:
      "Customers who were sent the 24h expiry reminder text and still haven't renewed.",
    colSentAt: "Sent At",
    viewMessage: "View",
    smsMessageNotFound: "No message found for this customer yet.",
    smsStatusSent: "Sent",
    smsStatusPending: "Pending",
    smsRemindersEmptyTitle: "No reminders sent yet",
    smsRemindersEmptySubtitle: "Customers appear here once they've been sent the 24h expiry SMS.",

    navEscalations: "48h Call Escalations",
    escalationsTitle: "48h Call Escalations",
    escalationsSubtitle:
      "Customers 48h+ overdue who still haven't renewed — call them directly.",
    colEscalatedAt: "Flagged At",
    escalationsEmptyTitle: "No escalations right now",
    escalationsEmptySubtitle: "Customers appear here once they're 48h+ overdue without renewing.",

    navFraudAlerts: "Fraud Alerts",
    fraudAlertsTitle: "Fraud Alerts",
    fraudAlertsSubtitle:
      "Top-ups that looked unusual — a replayed message, an implausible balance, or an out-of-order timestamp.",
    fraudAlertsEmptyTitle: "No alerts right now",
    fraudAlertsEmptySubtitle: "Suspicious top-ups will show up here automatically.",
    colPhone: "Phone",
    colAmount: "Amount",
    colDetectedAt: "Detected At",
    colReason: "Reason",
    actionMarkReviewed: "Mark reviewed",
    fraudReasonDuplicateTransaction: "Duplicate transaction",
    fraudReasonBalanceIncreasedAfterSale: "Balance rose after a sale",
    fraudReasonBackdatedTimestamp: "Backdated timestamp",

    navBroadcast: "WhatsApp Broadcast",
    broadcastTitle: "WhatsApp Broadcast",
    broadcastSubtitle:
      "Send a one-off message to a list of contacts via WhatsApp — one tap per contact, no API or approval needed.",
    broadcastMessageLabel: "Message (customers — 907-series numbers)",
    broadcastMessageHint: "Use {{name}} anywhere you want the contact's name filled in.",
    broadcastProspectMessageLabel: "Message (prospects — 906-series numbers)",
    broadcastProspectMessageHint:
      "Used automatically for contacts whose Main Phone starts with 906 — no name/\"Customer\" greeting.",
    broadcastProspectTag: "906",
    broadcastConverted: "Now a customer",
    broadcastProgress: (sent, total) => `${sent} / ${total} sent`,
    broadcastImportButton: "Import Contacts",
    broadcastImportNoRows:
      "No rows found. Make sure the file has Name and Phone columns.",
    broadcastImportFailed: "Couldn't read that file. Try a .xlsx or .csv export.",
    broadcastEmptyTitle: "No contacts yet",
    broadcastEmptySubtitle: "Import a list (Name + Phone) to get started.",
    broadcastSent: "Sent",
    broadcastNotSent: "Not sent",
    broadcastSendAction: "Send WhatsApp",
    broadcastResend: "Resend",
    broadcastDeleteTitle: "Remove contact?",
    broadcastDeleteMessage: (name) => `This removes ${name} from the broadcast list.`,

    navDownloadApps: "Download Apps",
    downloadAppsTitle: "Download Apps",
    downloadAppsSubtitle:
      "Everything you need to run the CRM and its automation on a phone or PC.",
    downloadAppCrmTitle: "HD CRM App",
    downloadAppCrmDesc: "Install this CRM on your device for quick, full-screen access.",
    downloadAppCrmInstalled: "Already installed on this device.",
    installManualLabel: "How to install",
    installStepIosShare: "Tap the Share icon in Safari's toolbar.",
    installStepIosAdd: "Scroll down and tap \"Add to Home Screen\".",
    installStepIosConfirm: "Tap \"Add\" in the top-right corner.",
    installStepAndroidMenu: "Tap the ⋮ menu in the top-right corner.",
    installStepAndroidInstall: "Tap \"Install app\" (or \"Add to Home screen\"), then confirm.",
    installStepDesktopIcon: "Click the install icon (⊕) in the address bar, or open the ⋮ menu.",
    installStepDesktopInstall: "Click \"Install HD CRM\", then confirm.",
    downloadAppFdroidTitle: "F-Droid",
    downloadAppFdroidDesc:
      "App store needed to install Termux and Termux:API below (they're not on Google Play). Install this first.",
    downloadAppTermuxApiTitle: "Termux:API",
    downloadAppTermuxApiDesc:
      "Lets Termux read and send SMS — required for the EVC top-up forwarder. Opens its F-Droid page; install F-Droid first.",
    downloadAppTermuxTitle: "Termux",
    downloadAppTermuxDesc:
      "Terminal app that runs the forwarder script on the phone receiving EVC SMS. Opens its F-Droid page; install F-Droid first.",
    downloadAppCronJobTitle: "Cron-job.org",
    downloadAppCronJobDesc: "Free scheduler that triggers the 24h/48h reminder checks automatically.",
    downloadOpen: "Open",

    navUsers: "Users",
    usersTitle: "Users",
    usersSubtitle: "Create and manage logins for other businesses using this CRM.",
    addUser: "Add User",
    colBusinessName: "Business",
    colOwnerName: "Owner",
    colEmail: "Email",
    colCustomers: "Customers",
    colJoined: "Joined",
    statusActive: "Active",
    statusDisabled: "Disabled",
    actionDisable: "Disable",
    actionEnable: "Enable",
    actionDeleteUser: "Delete",
    fieldOwnerName: "Owner Name",
    fieldBusinessName: "Business Name",
    fieldEmail: "Email",
    fieldPassword: "Password",
    fieldSupportPhone: "Support Phone",
    fieldSupportPhoneBackup: "Support Phone (Backup)",
    userCreatedTitle: "Account created",
    userCreatedSubtitle:
      "Share these with them so they can set up their own SMS automation (Termux + cron-job.org).",
    webhookTokenLabel: "Webhook token",
    webhookUrlsLabel: "Endpoint URLs",
    downloadForwarderScriptLabel: "Download forwarder script (.sh)",
    copyToClipboard: "Copy",
    copied: "Copied",
    usersEmptyTitle: "No users yet",
    usersEmptySubtitle: "Add a user to give another business its own login and isolated data.",
    deleteUserTitle: "Delete this user?",
    deleteUserMessage: (name) =>
      `This permanently deletes ${name}'s login and their business's data. This can't be undone.`,
    couldntLoadUsers: "Couldn't load users.",
    userCreateFailed: "Couldn't create that user. Please try again.",
  },
  so: {
    loginHeroTitle: "Ka maamul dhammaan xiriirka macaamiisha meel keliya.",
    loginHeroSubtitle:
      "La soco baaqiyaha (bundle-ka), xaaladda daacadnimada, iyo macluumaadka xiriirka ee macmiil kasta oo Amtel ah — waqtiga dhabta ah.",
    loginCopyright: (year) => `© ${year} Amtel. Dhammaan xuquuqda way dhawrsan yihiin.`,
    welcomeBack: "Soo dhawoow mar kale",
    signInSubtitle: "Gal si aad u gasho dashboard-ka Amtel CRM.",
    emailAddress: "Ciwaanka Email-ka",
    password: "Furaha sirta ah",
    signIn: "Gal",
    signingIn: "Waa la galayaa...",
    accessRestricted: "Gelitaanka waxaa u xaddidan shaqaalaha Amtel ee la ogolaaday.",
    authErrorInvalidEmail: "Ciwaanka email-ku sax ma aha.",
    authErrorUserDisabled: "Account-kan waa la joojiyay.",
    authErrorWrongCredentials: "Email-ka ama furaha sirta ah waa khalad.",
    authErrorTooManyRequests: "Isku day badan ayaad samaysay. Fadlan sug wax yar oo mar kale isku day.",
    authErrorConfigNotFound:
      "Email/Password gelitaanka weli lagama shaqaal geliyay project-kan Firebase. Ka shaqaal geli Firebase Console → Authentication → Sign-in method.",
    authErrorNetwork: "Cilad network ah. Hubi xiriirkaaga internet-ka kadibna isku day.",
    authErrorGeneric: "Gelitaanku wuu fashilmay. Fadlan mar kale isku day.",

    forgotPasswordLink: "Furaha sirta ah ma illowday?",
    forgotPasswordTitle: "Dib u deji furahaaga sirta ah",
    forgotPasswordSubtitle: "Geli email-kaaga waxaanan kuu diri doonaa link aad kaga dib-u-dejin karto furaha sirta ah.",
    sendResetLink: "Dir Link Dib-u-dejinta",
    backToSignIn: "Ku laabo gelitaanka",
    resetEmailSentTitle: "Hubi email-kaaga",
    resetEmailSentSubtitle: (email) =>
      `Waxaanu kuu dirnay link dib-u-dejinta furaha sirta ah ${email}. Ka fur device-kan si aad furo sirta ah cusub u dejiso.`,

    account: "Account",
    signedInAs: "Waxaad ku gashantahay",
    editProfile: "Wax ka beddel Profile-ka",
    signOut: "Ka bax",
    accountNotSetUp:
      "Akoonkaaga weli si buuxda looma dejin. Fadlan la xiriir qofka ku sameeyay login-kaaga.",
    profileLoadFailed: "Akoonkaaga lama soo geli karin. Hubi internet-ka kadibna mar kale isku day.",

    editProfileTitle: "Wax ka beddel Profile-ka",
    uploading: "Waa la soo gelinayaa...",
    avatarUpdated: "Sawirka waa la cusboonaysiiyay",
    displayName: "Magaca la muujiyo",
    yourName: "Magacaaga",
    save: "Keydi",
    nameUpdated: "Magaca waa la cusboonaysiiyay",
    changePassword: "Beddel Furaha Sirta ah",
    currentPassword: "Furaha sirta ah ee hadda",
    newPassword: "Furaha sirta ah ee cusub (ugu yaraan 6 xaraf)",
    confirmNewPassword: "Xaqiiji furaha sirta ah ee cusub",
    updatePassword: "Cusboonaysii Furaha Sirta ah",
    passwordUpdated: "Furaha sirta ah waa la cusboonaysiiyay",

    totalCustomers: "Wadarta Macaamiisha",
    loyalCustomers: "Macaamiisha Daacadka ah",
    normalCustomers: "Macaamiisha Caadiga ah",
    newThisMonth: "Kuwa Cusub Bishan",
    loyaltyDistribution: "Qaybinta Daacadnimada",
    newCustomersChart: "Macaamiisha Cusub (6-dii Bilood ee ugu Dambeeyay)",

    searchPlaceholder: "Raadi magaca ama telefoonka...",
    filterAll: "Dhammaan Macaamiisha",
    filterLoyalOnly: "Kuwa Daacadka ah Kaliya",
    filterNormalOnly: "Kuwa Caadiga ah Kaliya",
    import: "Soo Deji",
    addCustomer: "Ku Dar Macmiil",

    statusLoyal: "Daacad",
    statusNormal: "Caadi",

    editCustomer: "Wax ka Beddel Macmiilka",
    fieldName: "Magaca",
    fieldNamePlaceholder: "tusaale: Cali Xasan",
    fieldMainPhone: "Telefoonka Ugu Muhiimsan",
    fieldMainPhonePlaceholder: "+252 61 234 5678",
    fieldBackupPhone: "Telefoonka Labaad",
    fieldBackupPhonePlaceholder: "Ikhtiyaari",
    fieldBundle: "Baaqiga / Qorshaha",
    fieldBundlePlaceholder: "tusaale: Bishii 20GB, VIP Pro",
    fieldStatus: "Xaaladda",
    fieldCreatedDate: "Taariikhda la Sameeyay",
    fieldCreatedDateHelper:
      "Waxay caadiga ahaan tahay maanta. Bedel taariikhda haddii ay tahay xog hore ama la soo dejiyay.",
    cancel: "Jooji",
    saveChanges: "Keydi Isbeddellada",
    nameRequired: "Magaca waa lagama maarmaan.",
    mainPhoneRequired: "Telefoonka ugu muhiimsan waa lagama maarmaan.",
    phoneInvalid: "Geli lambar telefoon sax ah.",
    duplicatePhone: (name) => `Lambarkan telefoonka horey ayaa loogu diiwaan geliyay ${name}.`,
    bundleRequired: "Baaqiga / qorshaha waa lagama maarmaan.",

    colName: "Magaca",
    colMainPhone: "Telefoonka Koowaad",
    colBackupPhone: "Telefoonka Labaad",
    colBundle: "Baaqiga",
    colStatus: "Xaaladda",
    colCreated: "La Sameeyay",
    colActions: "Ficillada",
    actionToggle: "Beddel",
    actionEdit: "Wax ka Beddel",
    actionDelete: "Tirtir",
    actionMarkNormal: "U calaamadi Caadi",
    actionMarkLoyal: "U calaamadi Daacad",

    emptyFilteredTitle: "Macmiil lama helin",
    emptyFilteredSubtitle: "Isku day inaad bedesho ereyga raadinta ama filter-ka si aad u hesho waxaad raadinaysid.",
    emptyTitle: "Weli macmiil ma jiro",
    emptySubtitle: "Bilow adiga oo ku darya macmiilkaaga ugu horreeya.",

    deleteCustomerTitle: "Macmiilka tirtir?",
    deleteCustomerMessage: (name) =>
      `Tan waxay si joogto ah uga saarayaa "${name}" liiska macaamiishaada. Ficilkan lama soo celin karo.`,
    delete: "Tirtir",

    couldntLoadCustomers: "Macaamiisha lama soo geli karin",
    couldntLoadTopups: "Xogta shubashada lama soo geli karin",

    importTitle: "Soo Deji Macaamiisha",
    importInstructions:
      "Soo geli fayl Excel (.xlsx) ah ama CSV ah si aad tiro badan oo macaamiil ah u darto. Safka koowaad waa inuu ka kooban yahay magacyada tiirarka — Magaca, Telefoonka Koowaad, Telefoonka Labaad, Baaqiga, Xaaladda, Taariikhda, Bundle Expiry, iyo Assigned Bundle waa la aqoonsan doonaa si toos ah. Bundle Expiry waxaa la geliyaa taariikh (tusaale 2026-09-15). Assigned Bundle waa in ay si sax ah ula mid tahay magaca baakadda ee bogga Bundles (waxaa loo isticmaalaa automation-ka SMS-ka) — labaduba ka madhi haddii aadan rabin.",
    importChooseFile: "Riix si aad fayl u doorato",
    importFileTypes: ".xlsx ama .csv",
    importDownloadTemplate: "Soo deji tijaabo spreadsheet ah",
    importFileInfo: (fileName, rows) => `${fileName} · ${rows} saf`,
    importChooseDifferent: "Dooro fayl kale",
    importReadyToImport: (n) => `${n} diyaar u ah in la soo dejiyo`,
    importWillBeSkipped: (n) => `${n} waa la dhaafi doonaa`,
    importColName: "Magaca",
    importColMainPhone: "Telefoonka Koowaad",
    importColBundle: "Baaqiga",
    importColBundleExpiry: "Dhicitaanka Bundle-ka",
    importColAssignedBundle: "Assigned Bundle",
    importAssignedBundleNotMatched: "Lama helin",
    importColStatus: "Xaaladda",
    importColRow: "Saf",
    importValid: "Sax",
    importDone: (n) => `${n} macmiil ayaa la soo dejiyay`,
    importDoneSubtitle: "Waxay isla markiiba ka muuqan doonaan liiska macaamiishaada.",
    importButtonImporting: "Waa la soo dejinayaa...",
    importButton: (n) => `Soo Deji ${n} Macmiil`,
    doneLabel: "Dhammaystir",

    fieldBundleExpiry: "Dhicitaanka Bundle-ka",
    fieldBundleExpiryHelper: "Ikhtiyaari. Waxaa loo isticmaalaa in lagu ogaado dib-u-cusboonaysiin soo socota ama dhacday.",
    fieldAssignedBundle: "Bundle-ka Loo Xilsaaray (auto-renewal)",
    fieldAssignedBundleNone: "Lama xilsaarin",
    fieldAssignedBundleHelper:
      "Dhowr xirmo ayaa isku qiime yeelan kara, sidaas darteed tan waxay cadaynaysaa kee ka mid ah uu customer-kani qaato — waana lagama maarmaan si automation-ka SMS-ku uu si sax ah bundle-ka ugu cusboonaysiiyo.",
    expiryBadgeExpired: "Way Dhacday",
    expiryBadgeDays: (n) => (n === 0 ? "Maanta ayay dhacaysaa" : `${n} maalmood ayay ku dhacaysaa`),
    statsExpiringSoon: "Dhawaan Dhici Doona",
    filterExpiring: "Dhawaan Dhici Doona",
    filterAlphabetical: "Kala Sooc A–Z",
    filterByExpiry: "Kala Sooc Dhicitaanka",

    export: "Dejiso (Export)",

    actionHistory: "Taariikhda",
    actionCall: "Wac",
    clearOverdueTitle: "Ka saar xaaladda dhaqsan?",
    clearOverdueMessage: (name) =>
      `Waxay ka saarayaan ${name} liiskan — isticmaal marka ay dhab ahaan lacag bixiyeen laakiin automation-ku uu ka tagay (tusaale: forwarder-ku wuu joogsanaa). Waxay nadiifinaysaa tracking-ka expiry-gooda; top-up-kooda xiga si caadi ah ayuu mid cusub u dhigayaa.`,
    historyTitle: "Taariikhda Macmiilka",
    historyEmpty: "Weli wax dhaqdhaqaaq ah ma jiraan.",
    addNote: "Ku Dar Qoraal",
    notePlaceholder: "Qor faallo...",

    activityCreated: "Macmiilka waa la abuuray.",
    activityUpdated: "Macluumaadka macmiilka waa la cusboonaysiiyay.",
    activityStatusChanged: (status) => `Xaaladda waxaa loo beddelay ${status}.`,
    activityCalled: (phone) => `Waxaa la wacay ${phone}.`,

    notifTitle: "Ogeysiisyada (Notifications)",
    smsAutomationTitle: "SMS Automation",
    biometricTitle: "Furitaanka Biometric-ka",
    biometricDesc:
      "Isticmaal Face ID, Touch ID, ama fingerprint si aad app-ka ugu furto device-kan halkii aad password-ka mar walba qori lahayd. Xaqiiji password-kaaga hal mar si aad u shiddo.",
    biometricEnable: "Shid Furitaanka Biometric-ka",
    biometricDisable: "Dami",
    biometricEnabledOnDevice: "Waa la shiday device-kan.",
    biometricSetupFailed: "Furitaanka biometric-ka lama dejin karin. Fadlan mar kale isku day.",
    biometricLockedTitle: "Ku fur Face ID / Fingerprint si aad u sii socoto.",
    biometricFailed: "Lama xaqiijin karin. Mar kale isku day, ama password-kaaga ku gal.",
    biometricTryAgain: "Mar Kale Isku Day",
    biometricUsePasswordInstead: "Isticmaal password-ka",
    biometricAutoLockTitle: "Si toos ah u xidh",
    biometricAutoLockImmediately: "Isla markiiba",
    biometricAutoLock1Min: "1 daqiiqo kadib",
    biometricAutoLock30Min: "30 daqiiqo kadib",
    notifEnable: "Shid Ogeysiisyada",
    notifEnabled: "Ogeysiisyada waa la shiday device-kan",
    notifDenied:
      "Ogeysiisyada waa laga xanibay site-kan. Riix icon-ka lock/info-ga ee agagaarka address bar-ka, fur Site settings, ka dhig Notifications 'Allow', kadibna mar kale isku day.",
    notifUnsupported: "Ogeysiisyada lama taageerin browser-kan.",
    notifError: "Ogeysiisyada lama shidi karin. Fadlan mar kale isku day.",

    navCustomers: "Macaamiisha",
    navDebtCustomers: "Macaamiisha Deynta",
    toggleSidebar: "Furfur menu-ga",
    installApp: "Rakib App-ka",

    debtCustomersTitle: "Macaamiisha Deynta",
    debtCustomersSubtitle: "La soco macaamiisha lacag ku leh iyo intay ku hartay inay bixiyaan.",
    totalDebt: "Wadarta Deynta",
    addDebtCustomer: "Ku Dar Macmiil Deyn Leh",
    editDebtCustomer: "Wax ka Beddel Macmiilka Deynta",
    fieldPhone: "Telefoonka",
    fieldPhonePlaceholder: "+252 61 234 5678",
    fieldAmount: "Lacagta La Leeyahay",
    fieldAmountPlaceholder: "0.00",
    phoneRequired: "Lambarka telefoonka waa lagama maarmaan.",
    amountRequired: "Lacagta waa lagama maarmaan.",
    amountInvalid: "Geli lacag sax ah.",
    debtColName: "Magaca",
    debtColPhone: "Telefoonka",
    debtColBackupPhone: "Telefoonka Labaad",
    debtColAmount: "Lacagta La Leeyahay",
    debtColCreated: "La Sameeyay",
    debtColActions: "Ficillada",
    debtEmptyTitle: "Weli macmiil deyn leh ma jiro",
    debtEmptySubtitle: "Ku dar macmiil lacag ku leh si aad u bilowdo la socodka deyntiisa.",
    debtEmptyFilteredTitle: "Macmiil deyn leh lama helin",
    debtEmptyFilteredSubtitle: "Isku day inaad bedesho ereyga raadinta si aad u hesho waxaad raadinaysid.",
    deleteDebtCustomerTitle: "Xogta deynta tirtir?",
    deleteDebtCustomerMessage: (name) =>
      `Tan waxay si joogto ah uga saarayaa "${name}" liiska macaamiisha deynta. Ficilkan lama soo celin karo.`,
    couldntLoadDebtCustomers: "Macaamiisha deynta lama soo geli karin",
    debtSearchPlaceholder: "Raadi magaca ama telefoonka...",

    navBundles: "Bundle-yada",
    navExpiredBundles: "Bundle-yada Dhacay",
    navAnalytics: "Falanqaynta",
    navDashboard: "Dashboard",
    dashboardTitle: "Dashboard",
    dashboardSubtitle: "Aragtida degdegga ah ee xaaladda ganacsigaaga hadda.",
    topCustomerLabel: "Macmiilka Ugu Sarreeya",
    recentTopupsTitle: "Shubashada Ugu Dambeeyay",

    navSettings: "Settings-ka",
    settingsTitle: "Settings-ka",
    settingsSubtitle: "Maamul profile-kaaga, furaha sirta ah, ogeysiisyada, iyo luqadda.",
    settingsLanguage: "Luqadda",

    bundlesTitle: "Bundle-yada",
    bundlesSubtitle:
      "Maamul heerarka qiimaha ee si toos ah loogu cusboonaysiiyo bundle-ka macaamiisha marka SMS-ka EVC-ka la helo.",
    addBundle: "Ku Dar Bundle",
    editBundle: "Wax ka Beddel Bundle-ka",
    fieldBundleName: "Magaca Baakadda",
    fieldBundleNamePlaceholder: "tusaale: Unlimited",
    fieldPrice: "Qiimaha ($)",
    fieldPricePlaceholder: "0.25",
    fieldDurationValue: "Muddada",
    fieldDurationValuePlaceholder: "10",
    fieldDurationUnit: "Cabbirka",
    durationUnitHours: "Saacadood",
    durationUnitDays: "Maalmood",
    durationUnitMonths: "Bilood",
    bundleColName: "Baakadda",
    bundleColPrice: "Qiimaha",
    bundleColDuration: "Muddada",
    bundleColActions: "Ficillada",
    bundleEmptyTitle: "Weli bundle lama diiwaan gelin",
    bundleEmptySubtitle: "Ku dar heerarka qiimaha, ama soo rar qiimayaasha hadda jira si aad u bilowdo.",
    loadDefaultPricing: "Soo Rar Qiimayaasha Hadda Jira",
    loadTanaadBulaalPricing: "Soo Rar Qiimaha Tanaad & Bulaal Lite",
    deleteBundleTitle: "Bundle-ka tirtir?",
    deleteBundleMessage: (name) =>
      `Tan waxay si joogto ah uga saarayaa "${name}" liiska bundle-yadaada. Lacagaha qiimahan lagu shubto mar dambe si toos ah uma cusboonaysiin doonaan ilaa aad mar kale ku darto. Ficilkan lama soo celin karo.`,
    couldntLoadBundles: "Bundle-yada lama soo geli karin",
    priceRequired: "Qiimaha waa lagama maarmaan.",
    priceInvalid: "Geli qiime sax ah.",
    durationRequired: "Muddada waa lagama maarmaan.",
    durationInvalid: "Geli muddo sax ah.",

    expiredBundlesTitle: "Bundle-yada Dhacay",
    expiredBundlesSubtitle: "Macaamiisha bundle-kooda dhacay oo aan tan iyo markaas wax lagu shubin.",
    colDaysOverdue: "Dhacay",
    daysOverdue: (n) =>
      n === 0 ? "Maanta ayay dhacday" : n === 1 ? "1 maalin ayay dhacday" : `${n} maalmood ayay dhacday`,
    expiredEmptyTitle: "Bundle dhacay ma jiraan",
    expiredEmptySubtitle: "Dhammaan macaamiisha bundle-ka leh waa la cusboonaysiiyay.",

    analyticsTitle: "Falanqaynta",
    analyticsSubtitle: "Arag cida ugu badan shubasho — iyo cida u baahan xasuusin.",
    periodToday: "Maanta",
    periodWeek: "Toddobaadkan",
    periodMonth: "Bishan",
    periodAll: "Waqtiga Oo Dhan",
    topSpendersTitle: "Kuwa Ugu Shubashada Badan",
    lowSpendersTitle: "Kuwa Ugu Shubashada Yar",
    totalTopupVolume: "Wadarta Lacagta la Shubtay",
    customersWithTopups: "Macaamiisha Wax Shubay",
    avgTopupPerCustomer: "Celceliska Macmiil Kasta",
    noTopupsYet: "Weli lacag lama shubin.",

    navSmsReminders: "SMS-yada Xasuusinta la Diray",
    smsRemindersTitle: "SMS-yada Xasuusinta la Diray",
    smsRemindersSubtitle:
      "Macaamiisha loo diray qoraalka xasuusinta 24h ee bundle-ka dhacay oo aan weli cusboonaysiin.",
    colSentAt: "Waqtiga la Diray",
    viewMessage: "Fiiri",
    smsMessageNotFound: "Wali fariin uma helin macmiilkan.",
    smsStatusSent: "La diray",
    smsStatusPending: "Sugaya",
    smsRemindersEmptyTitle: "Weli xasuusin lama dirin",
    smsRemindersEmptySubtitle:
      "Macaamiisha waxay halkan ka muuqan doonaan marka loo diro SMS-ka xasuusinta 24h.",

    navEscalations: "Wicitaanka 48h",
    escalationsTitle: "Wicitaanka 48h",
    escalationsSubtitle:
      "Macaamiisha 48h+ ka dhacay oo aan weli cusboonaysiin — si toos ah ula xiriir.",
    colEscalatedAt: "Waqtiga la Calaamadiyay",
    escalationsEmptyTitle: "Hadda wicitaan lama baahna",
    escalationsEmptySubtitle:
      "Macaamiisha waxay halkan ka muuqan doonaan marka ay 48h+ ka dhacaan iyagoo aan cusboonaysiin.",

    navFraudAlerts: "Digniinaha Khiyaanada",
    fraudAlertsTitle: "Digniinaha Khiyaanada",
    fraudAlertsSubtitle:
      "Top-up-yo aan caadi ahayn — fariin la celceliyay, balance aan macquul ahayn, ama waqti khaldan.",
    fraudAlertsEmptyTitle: "Hadda digniin lama baahna",
    fraudAlertsEmptySubtitle: "Top-up-yada shakiga leh ayaa halkan si toos ah uga muuqan doona.",
    colPhone: "Telefoonka",
    colAmount: "Qadarka",
    colDetectedAt: "Waqtiga la Ogaaday",
    colReason: "Sababta",
    actionMarkReviewed: "Calaamadi la eegay",
    fraudReasonDuplicateTransaction: "Transaction la celceliyay",
    fraudReasonBalanceIncreasedAfterSale: "Balance-ku wuu kordhay kadib iib",
    fraudReasonBackdatedTimestamp: "Waqti dib-dhac ah",

    navBroadcast: "WhatsApp Xayeysiin",
    broadcastTitle: "WhatsApp Xayeysiin",
    broadcastSubtitle:
      "Fariin hal-mar ah u dir liis contacts ah WhatsApp — hal-taabasho qof kasta, wax API ama ansixin ah looma baahna.",
    broadcastMessageLabel: "Fariinta (macaamiisha — numberada 907)",
    broadcastMessageHint: "Isticmaal {{name}} meel kasta oo aad rabto in magaca macmiilku ku beddelmo.",
    broadcastProspectMessageLabel: "Fariinta (prospects — numberada 906)",
    broadcastProspectMessageHint:
      "Si otomaatig ah ayaa loo isticmaalayaa contacts-ka Main Phone-kooda ku bilaabma 906 — magac/\"Macmiil\" lama isticmaalo.",
    broadcastProspectTag: "906",
    broadcastConverted: "Hadda waa macmiil",
    broadcastProgress: (sent, total) => `${sent} / ${total} waa la diray`,
    broadcastImportButton: "Soo Deji Contacts",
    broadcastImportNoRows: "Safaf lama helin. Hubi in file-ku leeyahay column-ka Name iyo Phone.",
    broadcastImportFailed: "Ma akhriyi karin file-kaas. Isku day .xlsx ama .csv.",
    broadcastEmptyTitle: "Weli contact lama darin",
    broadcastEmptySubtitle: "Soo deji liis (Name + Phone) si aad u bilowdo.",
    broadcastSent: "La diray",
    broadcastNotSent: "Lama dirin",
    broadcastSendAction: "WhatsApp u dir",
    broadcastResend: "Mar kale dir",
    broadcastDeleteTitle: "Ka saar contact-ka?",
    broadcastDeleteMessage: (name) => `Tani waxay ka saarataa ${name} liiska xayeysiinta.`,

    navDownloadApps: "Soo Deji Apps-ka",
    downloadAppsTitle: "Soo Deji Apps-ka",
    downloadAppsSubtitle:
      "Dhammaan waxa aad u baahan tahay si aad u shaqaysiiso CRM-ka iyo automation-kiisa taleefan ama kombuyuutar.",
    downloadAppCrmTitle: "HD CRM App",
    downloadAppCrmDesc: "Ku rakib CRM-kan taleefankaaga si aad ugu geli dhaqso oo shaashad buuxa ah.",
    downloadAppCrmInstalled: "Horey ayaa loogu rakibay device-kan.",
    installManualLabel: "Sida loo rakibo",
    installStepIosShare: "Taabo calaamadda Share ee toolbar-ka Safari.",
    installStepIosAdd: "Hoos u dhaadhac oo taabo \"Add to Home Screen\".",
    installStepIosConfirm: "Taabo \"Add\" ee geeska sare ee midig.",
    installStepAndroidMenu: "Taabo menu-ga ⋮ ee geeska sare ee midig.",
    installStepAndroidInstall: "Taabo \"Install app\" (ama \"Add to Home screen\"), kadibna xaqiiji.",
    installStepDesktopIcon: "Riix icon-ka install-ka (⊕) ee address bar-ka, ama fur menu-ga ⋮.",
    installStepDesktopInstall: "Riix \"Install HD CRM\", kadibna xaqiiji.",
    downloadAppFdroidTitle: "F-Droid",
    downloadAppFdroidDesc:
      "App store loo baahan yahay si aad u rakibto Termux iyo Termux:API ee hoose (kuma jiraan Google Play). Marka hore kan rakib.",
    downloadAppTermuxApiTitle: "Termux:API",
    downloadAppTermuxApiDesc:
      "Wuxuu u oggolaadaa Termux inuu akhriyo oo diro SMS — waa lagama maarmaan forwarder-ka EVC top-up. Wuxuu furayaa bogga F-Droid; marka hore rakib F-Droid.",
    downloadAppTermuxTitle: "Termux",
    downloadAppTermuxDesc:
      "App terminal ah oo ku shaqaynaya script-ka forwarder-ka taleefanka helaya SMS-ka EVC. Wuxuu furayaa bogga F-Droid; marka hore rakib F-Droid.",
    downloadAppCronJobTitle: "Cron-job.org",
    downloadAppCronJobDesc: "Scheduler bilaash ah oo si toos ah u kiciya hubinta xasuusinta 24h/48h.",
    downloadOpen: "Fur",

    navUsers: "Isticmaalayaasha",
    usersTitle: "Isticmaalayaasha",
    usersSubtitle: "Samee oo maamul login-ka ganacsiyada kale ee isticmaala CRM-kan.",
    addUser: "Ku Dar Isticmaale",
    colBusinessName: "Ganacsiga",
    colOwnerName: "Milkiilaha",
    colEmail: "Email-ka",
    colCustomers: "Macaamiisha",
    colJoined: "Ku Biiray",
    statusActive: "Firfircoon",
    statusDisabled: "La Joojiyay",
    actionDisable: "Joojii",
    actionEnable: "Dib u Shaqaysii",
    actionDeleteUser: "Tirtir",
    fieldOwnerName: "Magaca Milkiilaha",
    fieldBusinessName: "Magaca Ganacsiga",
    fieldEmail: "Email-ka",
    fieldPassword: "Password-ka",
    fieldSupportPhone: "Telefoonka Taageerada",
    fieldSupportPhoneBackup: "Telefoonka Taageerada (Labaad)",
    userCreatedTitle: "Akoonka waa la abuuray",
    userCreatedSubtitle:
      "La wadaag kuwan si uu u qabsado automation-kiisa SMS (Termux + cron-job.org).",
    webhookTokenLabel: "Webhook token-ka",
    webhookUrlsLabel: "URL-yada Endpoint-ka",
    downloadForwarderScriptLabel: "Soo deji script-ka (.sh)",
    copyToClipboard: "Koobi",
    copied: "Waa la koobiyay",
    usersEmptyTitle: "Weli isticmaale lama darin",
    usersEmptySubtitle: "Ku dar isticmaale si aad ganacsi kale u siiso login gaarkiisa iyo xog gooni ah.",
    deleteUserTitle: "Ma tirtirtaa isticmaalahan?",
    deleteUserMessage: (name) =>
      `Tani si joogto ah ayay u tirtiraysaa login-ka ${name} iyo xogta ganacsigiisa. Lama soo celin karo.`,
    couldntLoadUsers: "Isticmaalayaasha lama soo geli karin.",
    userCreateFailed: "Isticmaalahan lama abuuri karin. Fadlan mar kale isku day.",
  },
};

export type Language = keyof typeof translations;
