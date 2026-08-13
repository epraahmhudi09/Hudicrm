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

  account: string;
  signedInAs: string;
  editProfile: string;
  signOut: string;

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

  export: string;

  actionHistory: string;
  historyTitle: string;
  historyEmpty: string;
  addNote: string;
  notePlaceholder: string;

  activityCreated: string;
  activityUpdated: string;
  activityStatusChanged: (status: string) => string;
  activityCalled: (phone: string) => string;

  notifTitle: string;
  notifEnable: string;
  notifEnabled: string;
  notifDenied: string;
  notifUnsupported: string;
  notifError: string;

  navCustomers: string;
  navDebtCustomers: string;
  toggleSidebar: string;

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
  topSpendersTitle: string;
  lowSpendersTitle: string;
  totalTopupVolume: string;
  customersWithTopups: string;
  avgTopupPerCustomer: string;
  noTopupsYet: string;
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

    account: "Account",
    signedInAs: "Signed in as",
    editProfile: "Edit Profile",
    signOut: "Sign out",

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

    importTitle: "Import Customers",
    importInstructions:
      "Upload an Excel (.xlsx) or CSV file to bulk-add customers. The first row must contain column headers — Name, Main Phone, Backup Phone, Bundle, Status, and Created Date are recognized automatically.",
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

    export: "Export",

    actionHistory: "History",
    historyTitle: "Customer History",
    historyEmpty: "No activity yet.",
    addNote: "Add Note",
    notePlaceholder: "Write a note...",

    activityCreated: "Customer created.",
    activityUpdated: "Customer details updated.",
    activityStatusChanged: (status) => `Status changed to ${status}.`,
    activityCalled: (phone) => `Called ${phone}.`,

    notifTitle: "Push Notifications",
    notifEnable: "Enable Notifications",
    notifEnabled: "Notifications enabled on this device",
    notifDenied:
      "Notifications are blocked for this site. Tap the lock/info icon next to the address bar, open Site settings, and set Notifications to Allow, then try again.",
    notifUnsupported: "Push notifications aren't supported in this browser.",
    notifError: "Couldn't enable notifications. Please try again.",

    navCustomers: "Customers",
    navDebtCustomers: "Debt Customers",
    toggleSidebar: "Toggle menu",

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
    topSpendersTitle: "Top Spenders",
    lowSpendersTitle: "Lowest Spenders",
    totalTopupVolume: "Total Top-up Volume",
    customersWithTopups: "Customers With Top-ups",
    avgTopupPerCustomer: "Avg. per Customer",
    noTopupsYet: "No top-ups recorded yet.",
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

    account: "Account",
    signedInAs: "Waxaad ku gashantahay",
    editProfile: "Wax ka beddel Profile-ka",
    signOut: "Ka bax",

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

    importTitle: "Soo Deji Macaamiisha",
    importInstructions:
      "Soo geli fayl Excel (.xlsx) ah ama CSV ah si aad tiro badan oo macaamiil ah u darto. Safka koowaad waa inuu ka kooban yahay magacyada tiirarka — Magaca, Telefoonka Koowaad, Telefoonka Labaad, Baaqiga, Xaaladda, iyo Taariikhda waa la aqoonsan doonaa si toos ah.",
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

    export: "Dejiso (Export)",

    actionHistory: "Taariikhda",
    historyTitle: "Taariikhda Macmiilka",
    historyEmpty: "Weli wax dhaqdhaqaaq ah ma jiraan.",
    addNote: "Ku Dar Qoraal",
    notePlaceholder: "Qor faallo...",

    activityCreated: "Macmiilka waa la abuuray.",
    activityUpdated: "Macluumaadka macmiilka waa la cusboonaysiiyay.",
    activityStatusChanged: (status) => `Xaaladda waxaa loo beddelay ${status}.`,
    activityCalled: (phone) => `Waxaa la wacay ${phone}.`,

    notifTitle: "Ogeysiisyada (Notifications)",
    notifEnable: "Shid Ogeysiisyada",
    notifEnabled: "Ogeysiisyada waa la shiday device-kan",
    notifDenied:
      "Ogeysiisyada waa laga xanibay site-kan. Riix icon-ka lock/info-ga ee agagaarka address bar-ka, fur Site settings, ka dhig Notifications 'Allow', kadibna mar kale isku day.",
    notifUnsupported: "Ogeysiisyada lama taageerin browser-kan.",
    notifError: "Ogeysiisyada lama shidi karin. Fadlan mar kale isku day.",

    navCustomers: "Macaamiisha",
    navDebtCustomers: "Macaamiisha Deynta",
    toggleSidebar: "Furfur menu-ga",

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
    topSpendersTitle: "Kuwa Ugu Shubashada Badan",
    lowSpendersTitle: "Kuwa Ugu Shubashada Yar",
    totalTopupVolume: "Wadarta Lacagta la Shubtay",
    customersWithTopups: "Macaamiisha Wax Shubay",
    avgTopupPerCustomer: "Celceliska Macmiil Kasta",
    noTopupsYet: "Weli lacag lama shubin.",
  },
};

export type Language = keyof typeof translations;
