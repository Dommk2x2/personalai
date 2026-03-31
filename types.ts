import React from 'react';

export type ThemeMode = 'light' | 'dark';

export interface AppTheme {
  name: string;
  mode: ThemeMode;
}

export interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

export interface Account {
  id: string;
  name: string;
  createdAt: string;
  accountNumber?: string;
  ifscCode?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  userId?: string;
  initialBalance?: number;
}

export enum AppMode {
  FINANCE = 'finance',
  ATTENDANCE = 'attendance',
  EMI = 'emi',
  TODO = 'todo',
  REPORTS = 'reports',
  GALLERY = 'gallery',
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export enum IncomeCategory {
  SALARY = 'Salary',
  BONUS = 'Bonus',
  FREELANCE = 'Freelance Income',
  INVESTMENTS = 'Investment Income',
  GIFTS_RECEIVED = 'Gifts Received',
  INITIAL_BALANCE = 'Initial Balance',
  UPI_TRANSFER = 'UPI Transfer',
  OTHER = 'Other Income',
}

export enum ExpenseCategory {
  FOOD = 'Food & Dining',
  TRANSPORT = 'Transportation',
  UTILITIES = 'Utilities',
  ENTERTAINMENT = 'Entertainment',
  HEALTHCARE = 'Healthcare',
  HOUSING = 'Housing',
  EDUCATION = 'Education',
  SAVINGS = 'Savings & Investments',
  PERSONAL_CARE = 'Personal Care',
  GIFTS_DONATIONS = 'Gifts & Donations',
  MOBILE = 'Mobile',
  UPI = 'UPI Payment',
  ACCOUNT_TRANSFER = 'Account Transfer',
  EMI = 'EMI',
  OTHER = 'Other',
}

export interface Item {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  category?: string;
  validityDays?: number;
  emiId?: string;
  isFullEmiPayment?: boolean;
  transferId?: string;
  items?: Item[];
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt?: string;
  denominations?: Record<string, string>;
  cashbackAmount?: number;
  couponUsed?: number;
  couponIncomeId?: string;
  attachment?: {
    name: string;
    type: 'pdf';
    data: string;
  };
}

export interface IncomeExpenseTransactionDetails {
  type: TransactionType.INCOME | TransactionType.EXPENSE;
  description: string;
  amount: number;
  date: string;
  category?: string;
  validityDays?: number;
  emiId?: string;
  isFullEmiPayment?: boolean;
  accountId?: string;
  cashbackAmount?: number;
  couponUsed?: number;
  couponIncomeId?: string;
  setReminder?: boolean;
  reminderDate?: string;
  items?: Item[];
  attachment?: {
    name: string;
    type: 'pdf';
    data: string;
  };
  denominations?: Record<string, string>;
}

export interface TransferTransactionDetails {
  type: TransactionType.TRANSFER;
  description: string;
  amount: number;
  date: string;
  fromAccountId: string;
  toAccountId: string;
}

export type AddTransactionFormPayload = IncomeExpenseTransactionDetails | TransferTransactionDetails;

export enum BudgetPeriod {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
}

export interface BudgetSetting {
  accountId: string;
  category: string;
  allocated: number;
  period: BudgetPeriod;
  periodIdentifier: string;
}

export type ToastType = 'income' | 'expense' | 'warning' | 'info' | 'error' | 'undo' | 'success';

export interface ToastInfo {
  id: string;
  message: string;
  type: ToastType;
  visible: boolean;
  timestamp: number;
  accountId?: string;
  balanceAtNotification?: number;
}

export type PillNotificationType = 'income' | 'expense' | 'transfer' | 'info' | 'success' | 'warning' | 'error' | 'undo' | 'days_remaining';

export interface PillNotificationInfo {
  id: string;
  type: PillNotificationType;
  message?: string;
  visible: boolean;
  amount?: number;
  onAction?: () => void;
  actionLabel?: string;
}

export interface UserCredential {
  id: string;
  username: string;
  password: string;
  role: Role;
  isDeleted?: boolean;
  deletedAt?: string;
}

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export interface TodoItem {
  id: string;
  accountId: string;
  text: string;
  completed: boolean;
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  reminderDateTime: string | null;
}

export interface DayPlannerEntry {
  id: string;
  accountId: string;
  title: string;
  notes?: string;
  date: string;
  startTime: string;
  endTime: string;
  completed: boolean;
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  reminderDateTime: string | null;
}

export interface SubscriptionPlan {
  id: string;
  accountId: string;
  name: string;
  provider: string;
  price: number;
  validityDays: number;
  lastPaymentDate: string;
  nextDueDate: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

export interface RechargePlan {
  id: string;
  accountId: string;
  provider: string;
  price: number;
  validityDays: number;
  lastRechargeDate: string;
  nextDueDate: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

export interface MenuItem {
  id: string;
  accountId: string;
  name: string;
  price: number;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

export interface VaultItem {
  id: string;
  name: string;
  date: string;
  dataUrl: string;
  mimeType: string;
  isPrivate: boolean;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

export interface AmortizationEntry {
  month: number;
  paymentDate: string;
  beginningBalance: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
}

export interface ScheduleResult {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  schedule: AmortizationEntry[];
}

export interface SavedAmortizationSchedule {
  id: string;
  accountId: string;
  loanName: string;
  principal: number;
  annualRate: number;
  tenureValue: number;
  tenureUnit: 'years' | 'months';
  startDate: string;
  calculatedEmi: number;
  totalInterest: number;
  totalPayment: number;
  schedule: AmortizationEntry[];
  paymentStatus: Record<number, boolean>;
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
  productImage?: string | null;
  completionGreeting?: string | null;
}

export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  SICK_LEAVE = 'Sick Leave',
  CASUAL_LEAVE = 'Casual Leave',
  HALF_DAY_PRESENT = 'Half Day Present',
  WORK_FROM_HOME = 'Work From Home',
  WEEKLY_OFF = 'Weekly Off',
}

export interface AttendanceEntry {
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

export enum AttendanceActionType {
  CREATED = 'created',
  UPDATED = 'updated',
}

export interface AttendanceHistoryEntry {
  id: string;
  timestamp: number;
  dateOfAttendance: string;
  actionType: AttendanceActionType;
  previousStatus?: AttendanceStatus;
  newStatus: AttendanceStatus;
  previousNotes?: string;
  newNotes?: string;
}

export type UserFeatureKey =
  | 'form' | 'charts' | 'history' | 'passbook' | 'miniStatement' | 'reports' | 'reportsDashboard' | 'snapshot'
  | 'categoryManagement' | 'accountManagement' | 'budgets' | 'notificationHistory'
  | 'amortizationSchedule' | 'emiDashboard' | 'emiCalendar' | 'attendanceList' | 'attendanceView'
  | 'attendanceReports' | 'attendanceCalendar' | 'financialCalendar' | 'salaryReport'
  | 'attendanceConfigReport' | 'appLockSettings' | 'todoList' | 'dayPlanner' | 'horoscope'
  | 'subscriptionTracker' | 'rechargeTracker' | 'accountSpecificSettings' | 'menuItemManagement'
  | 'upiPayment' | 'pdfImporter' | 'newYearCountdown' | 'documentVault' | 'digitalIdVault' | 'userManual' | 'monthlySummary' | 'benefitPassbook';

export type SectionKey = UserFeatureKey | 'userFeatureControl' | 'userManagement' | 'dataManagement' | 'appSettings' | 'viewAccountsTable' | 'viewSchedulesTable' | 'viewAllTransactionsTable' | 'recycleBin' | 'snapshot' | 'viewRawLocalStorageTable';

export type MenuGroupKey = 'entry_tools' | 'loan_tools' | 'views' | 'attendance_group' | 'reports_group';

export interface ConfigurableUserFeatureGroup {
  key: MenuGroupKey;
  label: string;
  description: string;
  icon: React.FC<IconProps>;
  defaultEnabled: boolean;
  roles?: Role[];
}

export type UserViewFeatureSettings = Record<UserFeatureKey, boolean>;
export type UserMenuGroupSettings = Record<MenuGroupKey, boolean>;

export type RecyclableItemType = 'transaction' | 'account' | 'schedule' | 'userCredential' | 'todoItem' | 'dayPlannerEntry' | 'subscriptionPlan' | 'rechargePlan' | 'menuItem' | 'vaultItem';
export type RecyclableItem = Transaction | Account | SavedAmortizationSchedule | UserCredential | TodoItem | DayPlannerEntry | SubscriptionPlan | RechargePlan | MenuItem | VaultItem;

export interface CustomReminder {
  id: string;
  accountId: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  reminderDay: number;
  startDate: string;
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface UpcomingEmiPayment {
  type: 'emi';
  name: string;
  amount: number;
  dueDate: string;
  originalId: string;
  schedule: SavedAmortizationSchedule;
  entry: AmortizationEntry;
  incomeOrExpense?: 'income' | 'expense';
}

export type UpcomingPayment = UpcomingEmiPayment | any;

export interface TileConfig {
  key: SectionKey;
  label: string;
  icon: React.FC<IconProps>;
  roles: Role[];
  modes: AppMode[];
}

export interface MenuGroup {
  id: string;
  title: string;
  icon: React.FC<IconProps>;
  roles: Role[];
  modes: AppMode[];
  tiles: TileConfig[];
}

export interface AutoBackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
}

export interface SalaryDeduction {
  id: string;
  name: string;
  amount: number;
}

export type DefaultViewSettings = Partial<Record<AppMode, SectionKey>>;

export interface AccountSpecificSettingsData {
  enabledMenuGroups?: MenuGroupKey[];
  enabledFeatures?: SectionKey[];
  enabledAppModes?: AppMode[];
}

export interface FestiveDate {
  id: string;
  date: string;
  name: string;
  createdAt: string;
}

export type PdfTableTheme = 'striped' | 'grid' | 'plain' | 'financial';
export type PdfPageSize = 'a4' | 'a3' | 'letter' | 'legal';
export type PdfPageOrientation = 'portrait' | 'landscape';
export type PdfTableOverflow = 'shrink' | 'wrap';

export type AppSettingSectionKey = 'salary' | 'financialMonth' | 'attendanceLeave' | 'session' | 'display' | 'backup' | 'celebrations' | 'layout' | 'overlay';

export interface ModePageConfig {
  id: string;
  title: string;
  sectionKey: SectionKey;
  isDefault?: boolean;
}

export type ModeLayout = ModePageConfig[];

export type AppModeLayouts = Partial<Record<AppMode, ModeLayout>>;

export interface TransferUpdateDetails {
  transferId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  description: string;
}

export type OverlayContentType = 'passbook' | 'vault_item' | 'mini_statement' | 'reports_dashboard' | 'todo_list' | 'day_planner' | 'emi_calendar' | 'none';

export interface OverlayContent {
  type: OverlayContentType;
  title: string;
  data?: any;
}

export interface OverlaySettings {
  enabledFeatures: UserFeatureKey[];
}
