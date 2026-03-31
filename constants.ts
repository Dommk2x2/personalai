

import React from 'react';
import { ExpenseCategory, IncomeCategory, AttendanceStatus, UserFeatureKey, SectionKey, Role, ConfigurableUserFeatureGroup, IconProps } from './types';
import { 
  PassbookIcon, ClipboardListIcon, ChartIcon, CalendarIcon, CalculatorIcon, 
  HomeIcon, FormIcon, HistoryIcon, CogIcon, BookOpenIcon, TargetIcon, BellIcon, 
  CalendarDaysIcon, UserGroupIcon, ListBulletIcon, DocumentChartBarIcon, DatabaseIcon,
  BanknotesIcon, ShieldCheckIcon, SlidersHorizontalIcon, TypeIcon, LogoutIcon, UserPlusIcon,
  RecycleBinIcon,
  UsersIcon, 
  ListChecksIcon, 
  ClipboardDocumentCheckIcon, 
  SparklesIcon, 
  CreditCardIcon, 
  DevicePhoneMobileIcon,
  UpiIcon, 
  DocumentArrowUpIcon,
  PhotoIcon,
  BookOpenIcon as ManualIcon
} from './components/Icons'; 

export const EXPENSE_CATEGORIES: string[] = Object.values(ExpenseCategory).sort((a, b) => a.localeCompare(b));
export const INCOME_CATEGORIES: string[] = Object.values(IncomeCategory).filter(cat => cat !== IncomeCategory.INITIAL_BALANCE).sort((a, b) => a.localeCompare(b)); 
export const ATTENDANCE_STATUSES: string[] = Object.values(AttendanceStatus).sort((a, b) => a.localeCompare(b));

export const TRANSFER_CATEGORY = "Internal Transfer"; 

export const LOCAL_STORAGE_APP_TITLE_KEY = 'financeTrackerAppTitle';
export const LOCAL_STORAGE_KEY = 'financeTrackerTransactions';
export const LOCAL_STORAGE_THEME_KEY = 'financeTrackerAppTheme'; 
export const LOCAL_STORAGE_ACCOUNTS_KEY = 'financeTrackerAccounts'; 
export const LOCAL_STORAGE_ACTIVE_ACCOUNT_ID_KEY = 'financeTrackerActiveAccountId'; 
export const LOCAL_STORAGE_EXPENSE_CATEGORIES_KEY = 'financeTrackerExpenseCategories';
export const LOCAL_STORAGE_INCOME_CATEGORIES_KEY = 'financeTrackerIncomeCategories';
export const LOCAL_STORAGE_BUDGETS_KEY = 'financeTrackerBudgets';
export const LOCAL_STORAGE_NOTIFICATION_HISTORY_KEY = 'financeTrackerNotificationHistory';
export const LOCAL_STORAGE_ATTENDANCE_KEY = 'financeTrackerAttendance';
export const LOCAL_STORAGE_ATTENDANCE_HISTORY_KEY = 'financeTrackerAttendanceHistory';
export const LOCAL_STORAGE_MONTHLY_SALARY_KEY = 'financeTrackerMonthlySalary'; 
export const LOCAL_STORAGE_SELECTED_WEEKLY_OFF_DAY_KEY = 'financeTrackerSelectedWeeklyOffDay';
export const LOCAL_STORAGE_PROFILE_PICTURE_KEY = 'financeTrackerProfilePicture';
export const LOCAL_STORAGE_LOCK_SCREEN_PICTURE_KEY = 'financeTrackerLockScreenPicture';
export const LOCAL_STORAGE_MONTHLY_OFF_LIMIT_KEY = 'financeTrackerMonthlyOffLimit'; 
export const LOCAL_STORAGE_APP_PIN_KEY = 'financeTrackerAppPin'; 
// FIX: Added missing constant exports for app lock type and pattern.
export const LOCAL_STORAGE_APP_LOCK_TYPE_KEY = 'financeTrackerAppLockType';
export const LOCAL_STORAGE_APP_PATTERN_KEY = 'financeTrackerAppPattern';
export const LOCAL_STORAGE_FINANCIAL_MONTH_START_DAY_KEY = 'financeTrackerFinancialMonthStartDay';
export const LOCAL_STORAGE_FINANCIAL_MONTH_END_DAY_KEY = 'financeTrackerFinancialMonthEndDay';
export const LOCAL_STORAGE_FINANCIAL_YEAR_START_MONTH_KEY = 'financeTrackerFinancialYearStartMonth';
export const LOCAL_STORAGE_FINANCIAL_YEAR_START_DAY_KEY = 'financeTrackerFinancialYearStartDay';
export const LOCAL_STORAGE_FINANCIAL_YEAR_END_MONTH_KEY = 'financeTrackerFinancialYearEndMonth';
export const LOCAL_STORAGE_FINANCIAL_YEAR_END_DAY_KEY = 'financeTrackerFinancialYearEndDay';
export const LOCAL_STORAGE_HEADER_BACKGROUND_IMAGE_KEY = 'financeTrackerHeaderBackgroundImage';
export const LOCAL_STORAGE_SAVED_AMORTIZATION_SCHEDULES_KEY = 'financeTrackerSavedAmortizationSchedules';
export const LOCAL_STORAGE_SESSION_TIMEOUT_DURATION_KEY = 'financeTrackerSessionTimeoutDuration';
export const LOCAL_STORAGE_USER_VIEW_FEATURE_SETTINGS_KEY = 'financeTrackerUserViewFeatureSettings';
export const LOCAL_STORAGE_USER_MENU_GROUP_SETTINGS_KEY = 'financeTrackerUserMenuGroupSettings'; 
export const LOCAL_STORAGE_USE_DIGITAL_FONT_KEY = 'financeTrackerUseDigitalFont';
export const LOCAL_STORAGE_DEFAULT_VIEWS_KEY = 'financeTrackerDefaultViews';
export const LOCAL_STORAGE_HOME_PAGE_LAYOUT_KEY = 'financeTrackerHomePageLayout';
export const LOCAL_STORAGE_MODE_LAYOUTS_KEY = 'financeTrackerModeLayouts';
export const LOCAL_STORAGE_DEFAULT_DASHBOARD_PERIOD_KEY = 'financeTrackerDefaultDashboardPeriod';
export const LOCAL_STORAGE_USER_CREDENTIALS_KEY = 'financeTrackerUserCredentials';
export const LOCAL_STORAGE_TODOS_KEY = 'financeTrackerTodos'; 
export const LOCAL_STORAGE_DAY_PLANNER_ENTRIES_KEY = 'financeTrackerDayPlannerEntries'; 
export const LOCAL_STORAGE_RECURRING_REMINDERS_KEY = 'financeTrackerRecurringReminders'; 
export const LOCAL_STORAGE_SUBSCRIPTION_PLANS_KEY = 'financeTrackerSubscriptionPlans'; 
export const LOCAL_STORAGE_RECHARGE_PLANS_KEY = 'financeTrackerRechargePlans';
export const LOCAL_STORAGE_SUBSCRIPTION_HISTORY_KEY = 'financeTrackerSubscriptionHistory'; 
export const LOCAL_STORAGE_MENU_ITEMS_KEY = 'financeTrackerMenuItems'; 
export const LOCAL_STORAGE_SALARY_DEDUCTIONS_KEY = 'financeTrackerSalaryDeductions';
export const LOCAL_STORAGE_BALANCE_VISIBLE_KEY = 'financeTrackerBalanceVisible';
export const LOCAL_STORAGE_HIDDEN_SECTIONS_KEY = 'financeTrackerHiddenSections';
export const LOCAL_STORAGE_VISIBLE_SECTIONS_KEY = 'financeTrackerVisibleSections';
export const LOCAL_STORAGE_LOGIN_BACKGROUND_KEY = 'financeTrackerLoginBackground';
export const LOCAL_STORAGE_AUTO_BACKUP_SETTINGS_KEY = 'financeTrackerAutoBackupSettings';
export const LOCAL_STORAGE_LAST_BACKUP_TIMESTAMP_KEY = 'financeTrackerLastBackupTimestamp';
export const LOCAL_STORAGE_BACKUP_REMINDER_DISMISSED_KEY = 'financeTrackerBackupReminderDismissedTimestamp';
export const LOCAL_STORAGE_ACCOUNT_SPECIFIC_SETTINGS_KEY = 'financeTrackerAccountSpecificSettings';
export const LOCAL_STORAGE_SINGLE_COLUMN_VIEW_KEY = 'financeTrackerSingleColumnView';
export const LOCAL_STORAGE_FESTIVE_DATES_KEY = 'financeTrackerFestiveDates';
export const LOCAL_STORAGE_PILL_NOTIFICATION_ENABLED_KEY = 'financeTrackerPillNotificationEnabled';
export const LOCAL_STORAGE_CELEBRATIONS_ENABLED_KEY = 'financeTrackerCelebrationsEnabled';
export const LOCAL_STORAGE_STORED_RECEIPTS_KEY = 'financeTrackerStoredReceipts';
export const LOCAL_STORAGE_UNREAD_RECEIPTS_COUNT_KEY = 'financeTrackerUnreadReceiptsCount';
export const LOCAL_STORAGE_VAULT_ITEMS_KEY = 'financeTrackerVaultItems';
export const LOCAL_STORAGE_OVERLAY_SETTINGS_KEY = 'financeTrackerOverlaySettings';
export const LOCAL_STORAGE_DATABASE_PASSWORD_KEY = 'financeTrackerMasterDatabaseKey';

// Timer Specific Keys
export const LOCAL_STORAGE_TIMER_TITLE_KEY = 'financeTrackerTimerTitle';
export const LOCAL_STORAGE_TIMER_BG_COLOR_KEY = 'financeTrackerTimerBgColor';
export const LOCAL_STORAGE_TIMER_RUNNING_COLOR_KEY = 'financeTrackerTimerRunningColor';


export const SESSION_TIMEOUT_DURATION_SECONDS = 0; 

export const CASH_IN_HAND_ACCOUNT_ID = 'cash_in_hand_account';
export const CASH_IN_HAND_ACCOUNT_NAME = 'Cash In Hand';
export const LOW_CASH_THRESHOLD = 500;

export const MOTIVATIONAL_QUOTES: string[] = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Strive not to be a success, but rather to be of value. - Albert Einstein",
  "The mind is everything. What you think you become. - Buddha",
  "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
  "The best way to predict the future is to create it. - Peter Drucker",
  "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "Act as if what you do makes a difference. It does. - William James",
  "The only limit to our realization of tomorrow will be our doubts of today. - Franklin D. Roosevelt",
  "It does not matter how slowly you go as long as you do not stop. - Confucius",
  "The journey of a thousand miles begins with a single step. - Lao Tzu",
  "Either you run the day, or the day runs you. - Jim Rohn",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "Well done is better than well said. - Benjamin Franklin"
];

export interface TimeBasedMessage {
  greeting: string;
  icon?: string; 
}

export const TIME_BASED_MESSAGES: Record<string, TimeBasedMessage> = {
  morning: { greeting: "Good Morning" },
  afternoon: { greeting: "Good Afternoon" },
  evening: { greeting: "Good Evening" },
  night: { greeting: "Good Night" }, 
};

export const WEEKDAY_OPTIONS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export interface ConfigurableUserFeature {
  key: UserFeatureKey | SectionKey; 
  label: string;
  description: string;
  icon: React.FC<IconProps>;
  defaultEnabled: boolean; 
}


export const CONFIGURABLE_USER_FEATURES: ConfigurableUserFeature[] = [
  { 
    key: 'form', 
    label: 'Transaction Form', 
    description: 'Add new income, expense, or transfer transactions.',
    icon: FormIcon, 
    defaultEnabled: true 
  },
  { 
    key: 'pdfImporter', 
    label: 'Import from PDF', 
    description: 'Upload a PDF bank statement to import transactions.',
    icon: DocumentArrowUpIcon, 
    defaultEnabled: true 
  },
  { 
    key: 'upiPayment',
    label: 'UPI Payment',
    description: 'Simulate a UPI payment from your cash-in-hand.',
    icon: UpiIcon,
    defaultEnabled: true,
  },
  { 
    key: 'charts', 
    label: 'Summary Charts', 
    description: 'Visual charts for income, expenses, and trends.',
    icon: ChartIcon, 
    defaultEnabled: true 
  },
  { 
    key: 'monthlySummary', 
    label: 'Monthly Summary', 
    description: 'View monthly opening balance, income, expenses, and closing balance.',
    icon: DocumentChartBarIcon, 
    defaultEnabled: true 
  },
  { 
    key: 'history', 
    label: 'Transaction History', 
    description: 'Paginated list of all your transactions.',
    icon: HistoryIcon, 
    defaultEnabled: true 
  },
  { 
    key: 'passbook', 
    label: 'Passbook View', 
    description: 'Detailed statement view with running balances.',
    icon: PassbookIcon, 
    defaultEnabled: true 
  },
  { 
    key: 'miniStatement', 
    label: 'Mini Statement', 
    description: 'Quick view of the last few transactions.',
    icon: ClipboardListIcon, 
    defaultEnabled: true 
  },
  {
    key: 'snapshot',
    label: 'Dashboard',
    description: 'Main overview dashboard with account balances and recent activity.',
    icon: ChartIcon,
    defaultEnabled: true,
  },
  { 
    key: 'financialCalendar', 
    label: 'Financial Calendar', 
    description: 'Calendar view of daily financial activities.',
    icon: CalendarIcon, 
    defaultEnabled: true 
  },
  { 
    key: 'todoList',
    label: 'To-do List', 
    description: 'Manage your tasks and to-do items.',
    icon: ListChecksIcon, 
    defaultEnabled: true 
  },
  { 
    key: 'dayPlanner',
    label: 'Day Planner',
    description: 'Schedule your day with a visual timeline.',
    icon: ClipboardDocumentCheckIcon, 
    defaultEnabled: true 
  },
  {
    key: 'horoscope',
    label: 'Daily Horoscope',
    description: 'Get your daily financial horoscope from Gemini.',
    icon: SparklesIcon,
    defaultEnabled: true,
  },
  {
    key: 'subscriptionTracker',
    label: 'Subscription Tracker',
    description: 'Track your subscriptions like Netflix, Spotify, etc.',
    icon: CreditCardIcon,
    defaultEnabled: true,
  },
  {
    key: 'rechargeTracker',
    label: 'Recharge Tracker',
    description: 'Track your mobile/DTH recharge plans.',
    icon: DevicePhoneMobileIcon,
    defaultEnabled: true,
  },
  {
    key: 'newYearCountdown',
    label: 'New Year Countdown',
    description: 'Displays a countdown to the New Year.',
    icon: SparklesIcon,
    defaultEnabled: true,
  },
  {
    key: 'documentVault',
    label: 'Document Vault',
    description: 'Securely upload and manage photos and documents with privacy options.',
    icon: PhotoIcon,
    defaultEnabled: true,
  },
  {
    key: 'digitalIdVault',
    label: 'Digital ID Vault',
    description: 'Securely manage your personal identity cards.',
    icon: CreditCardIcon,
    defaultEnabled: true,
  },
  { 
    key: 'categoryManagement', 
    label: 'Manage Categories', 
    description: 'Add, edit, or delete income and expense categories.',
    icon: CogIcon, 
    defaultEnabled: false 
  },
  {
    key: 'menuItemManagement',
    label: 'Manage Item Menu',
    description: 'Create a list of frequently used items with prices for quick entry.',
    icon: ClipboardListIcon,
    defaultEnabled: true,
  },
  { 
    key: 'accountManagement', 
    label: 'Manage Accounts', 
    description: 'Create new accounts, edit existing ones, or set active account.',
    icon: BookOpenIcon, 
    defaultEnabled: false 
  },
  {
    key: 'accountSpecificSettings',
    label: 'Account View Settings',
    description: 'Customize which menu items are visible for each account.',
    icon: SlidersHorizontalIcon,
    defaultEnabled: true,
  },
  { 
    key: 'budgets', 
    label: 'Manage Budgets', 
    description: 'Set and track budgets for different expense categories.',
    icon: TargetIcon, 
    defaultEnabled: false 
  },
  { 
    key: 'notificationHistory', 
    label: 'Notification History', 
    description: 'View a log of past transaction notifications.',
    icon: BellIcon, 
    defaultEnabled: false 
  },
  { 
    key: 'amortizationSchedule', 
    label: 'EMI Calculator', 
    description: 'Calculate and save loan amortization schedules.',
    icon: CalendarDaysIcon, 
    defaultEnabled: false 
  },
  { 
    key: 'emiDashboard', 
    label: 'EMI Dashboard', 
    description: 'View loan summaries, progress, and details.',
    icon: ChartIcon, 
    defaultEnabled: false 
  },
  { 
    key: 'emiCalendar', 
    label: 'EMI Calendar', 
    description: 'View all your scheduled EMI payments on a monthly calendar.',
    icon: CalendarIcon, 
    defaultEnabled: true 
  },
  { 
    key: 'attendanceList', 
    label: 'Log Attendance', 
    description: 'Log daily work attendance entries.',
    icon: UserGroupIcon, 
    defaultEnabled: false 
  },
  { 
    key: 'attendanceView', 
    label: 'View Attendance Log', 
    description: 'View a list of all attendance entries.',
    icon: ListBulletIcon, 
    defaultEnabled: false 
  },
  { 
    key: 'attendanceReports', 
    label: 'Attendance Reports', 
    description: 'Generate summary reports for attendance data.',
    icon: DocumentChartBarIcon, 
    defaultEnabled: false 
  },
  { 
    key: 'attendanceCalendar', 
    label: 'Attendance Calendar', 
    description: 'View attendance data in a calendar format.',
    icon: CalendarIcon, 
    defaultEnabled: false 
  },
  { 
    key: 'salaryReport', 
    label: 'Salary Report', 
    description: 'Generate salary slips based on attendance and configuration.',
    icon: BanknotesIcon, 
    defaultEnabled: false 
  },
  { 
    key: 'attendanceConfigReport', 
    label: 'View Attendance Config', 
    description: 'View current attendance configuration settings.',
    icon: CogIcon, 
    defaultEnabled: false 
  },
  {
    key: 'reportsDashboard',
    label: 'Reports Dashboard',
    description: 'A comprehensive analytics dashboard for all your financial data.',
    icon: ChartIcon,
    defaultEnabled: true,
  },
  { 
    key: 'appLockSettings', 
    label: 'App Lock Settings', 
    description: 'Set up or manage the application PIN lock.',
    icon: ShieldCheckIcon, 
    defaultEnabled: false 
  },
  {
    key: 'userManual',
    label: 'User Manual',
    description: 'A comprehensive guide on how to use the application and its features.',
    icon: ManualIcon,
    defaultEnabled: true,
  }
];

export const CONFIGURABLE_MENU_GROUPS: ConfigurableUserFeatureGroup[] = [
  {
    key: 'entry_tools',
    label: 'Entry & Management Tools',
    description: 'Toggle visibility of core data entry forms and management sections like Accounts, Categories, Budgets, To-dos.',
    icon: FormIcon, 
    defaultEnabled: true,
    roles: [Role.USER] 
  },
  {
    key: 'loan_tools',
    label: 'Loan & EMI Tools',
    description: 'Toggle visibility of loan amortization schedule calculator and reports.',
    icon: CalculatorIcon, 
    defaultEnabled: false, 
    roles: [Role.USER]
  },
  {
    key: 'views',
    label: 'Data Views & Summaries',
    description: 'Toggle visibility of various data views like Dashboard, History, Passbook, Charts, etc.',
    icon: ChartIcon, 
    defaultEnabled: true,
    roles: [Role.USER]
  },
  {
    key: 'attendance_group',
    label: 'Attendance Tracking',
    description: 'Toggle visibility of all attendance-related features.',
    icon: UserGroupIcon,
    defaultEnabled: false, 
    roles: [Role.USER]
  },
  {
    key: 'reports_group',
    label: 'Financial & Other Reports',
    description: 'Toggle visibility of downloadable reports and salary reports.',
    icon: DocumentChartBarIcon, 
    defaultEnabled: false,
    roles: [Role.USER]
  }
];


export type ConfigurableUserFeatureOrGroup = ConfigurableUserFeature | ConfigurableUserFeatureGroup;

export const allSectionKeysWithConfig: ConfigurableUserFeatureOrGroup[] = [
    ...CONFIGURABLE_USER_FEATURES,
    { 
        key: 'userFeatureControl' as SectionKey, 
        label: 'User View Customization', 
        description: 'Control which features are visible to users.',
        icon: SlidersHorizontalIcon, 
        defaultEnabled: false 
    },
    { 
        key: 'userManagement' as SectionKey, 
        label: 'User Management', 
        description: 'Create and manage user accounts.',
        icon: UserPlusIcon, 
        defaultEnabled: false 
    },
    { 
        key: 'dataManagement' as SectionKey, 
        label: 'Backup & Restore', 
        description: 'Backup, restore, or reset application data.',
        icon: DatabaseIcon, 
        defaultEnabled: false 
    },
    { 
        key: 'appSettings' as SectionKey, 
        label: 'Application Settings', 
        description: 'Configure salary, financial month, attendance, session, and display settings.',
        icon: CogIcon, 
        defaultEnabled: false 
    },
    { 
        key: 'viewAccountsTable' as SectionKey, 
        label: 'View Accounts Data', 
        description: 'View a table of all accounts.',
        icon: BookOpenIcon, 
        defaultEnabled: false 
    },
    { 
        key: 'viewSchedulesTable' as SectionKey, 
        label: 'View Schedules Data', 
        description: 'View a table of saved EMI schedules.',
        icon: CalendarDaysIcon, 
        defaultEnabled: false 
    },
    { 
        key: 'viewAllTransactionsTable' as SectionKey, 
        label: 'View All Transactions', 
        description: 'View a table of all transactions across accounts.',
        icon: HistoryIcon, 
        defaultEnabled: false 
    },
    { 
        key: 'recycleBin' as SectionKey, 
        label: 'Recycle Bin', 
        description: 'Manage deleted items.',
        icon: RecycleBinIcon, 
        defaultEnabled: false 
    },
    { 
        key: 'viewRawLocalStorageTable' as SectionKey, 
        label: 'Database Inspector', 
        description: 'Inspect and edit raw localStorage data.',
        icon: DatabaseIcon,
        defaultEnabled: false 
    },
];


const allToggleableSectionKeys: UserFeatureKey[] = [
  'form', 'charts', 'history', 'passbook', 'miniStatement', 
  'categoryManagement', 'accountManagement', 'budgets', 'notificationHistory', 
  'amortizationSchedule', 'emiDashboard', 'emiCalendar', 'attendanceList', 'attendanceView', 
  'attendanceReports', 'attendanceCalendar', 'financialCalendar', 'salaryReport', 
  'attendanceConfigReport', 'reportsDashboard', 'snapshot', 'appLockSettings', 'todoList', 'dayPlanner', 'horoscope',
  'subscriptionTracker', 'rechargeTracker', 'accountSpecificSettings', 'menuItemManagement',
  'upiPayment', 'pdfImporter', 'newYearCountdown', 'documentVault', 'digitalIdVault', 'userManual',
];

allToggleableSectionKeys.forEach(key => {
  if (!CONFIGURABLE_USER_FEATURES.find(f => f.key === key)) {
    console.warn(`WARNING: UserFeatureKey "${key}" is missing from CONFIGURABLE_USER_FEATURES. It may not be toggleable in User View Customization.`);
  }
});

export const ADMIN_ONLY_SECTIONS: SectionKey[] = [
  'userFeatureControl', 
  'userManagement',
  'dataManagement', 
  'appSettings', 
  'viewAccountsTable', 
  'viewSchedulesTable', 
  'viewAllTransactionsTable',
  'recycleBin',
  'viewRawLocalStorageTable',
];


export const ADMIN_ONLY_MENU_GROUP_KEYS: string[] = [
    'system_data_tools_finance',
    'settings_admin_group_finance',
    'emi_admin_tools'
];