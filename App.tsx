
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { showNotification, requestNotificationPermission } from './utils/notificationUtils';
import { db } from './firebase';
import { doc, getDocFromServer } from 'firebase/firestore';
import {
  Account, Transaction, TransactionType, BudgetSetting, ToastInfo, IncomeCategory, ToastType,
  AddTransactionFormPayload, IncomeExpenseTransactionDetails, TransferTransactionDetails,
  SectionKey, SavedAmortizationSchedule, AmortizationEntry, Role,
  UserFeatureKey, UserViewFeatureSettings, UserCredential, RecyclableItemType, RecyclableItem,
  MenuGroupKey, UserMenuGroupSettings, TodoItem, AppMode, UpcomingPayment,
  CustomReminder, BudgetPeriod, DayPlannerEntry, AutoBackupSettings,
  SalaryDeduction, DefaultViewSettings, SubscriptionPlan, AccountSpecificSettingsData,
  MenuItem, FestiveDate, RechargePlan, PillNotificationInfo, VaultItem, TransferUpdateDetails,
  AttendanceEntry, AttendanceHistoryEntry, AttendanceActionType, ModeLayout, AppModeLayouts,
  ExpenseCategory, OverlayContent, OverlaySettings, OverlayContentType
} from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { useFirestoreCollectionSync } from './hooks/useFirestoreCollectionSync';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useFirestoreDocumentSync } from './hooks/useFirestoreDocumentSync';
import { useLanguage } from './contexts/LanguageContext';
import {
  LOCAL_STORAGE_APP_TITLE_KEY, LOCAL_STORAGE_KEY, LOCAL_STORAGE_ACCOUNTS_KEY,
  LOCAL_STORAGE_ACTIVE_ACCOUNT_ID_KEY, LOCAL_STORAGE_EXPENSE_CATEGORIES_KEY,
  LOCAL_STORAGE_INCOME_CATEGORIES_KEY, LOCAL_STORAGE_BUDGETS_KEY,
  LOCAL_STORAGE_NOTIFICATION_HISTORY_KEY, EXPENSE_CATEGORIES as DEFAULT_EXPENSE_CATEGORIES,
  INCOME_CATEGORIES as DEFAULT_INCOME_CATEGORIES, LOCAL_STORAGE_THEME_KEY,
  TRANSFER_CATEGORY, ATTENDANCE_STATUSES, LOCAL_STORAGE_ATTENDANCE_KEY,
  LOCAL_STORAGE_ATTENDANCE_HISTORY_KEY, LOCAL_STORAGE_MONTHLY_SALARY_KEY,
  LOCAL_STORAGE_SELECTED_WEEKLY_OFF_DAY_KEY, LOCAL_STORAGE_PROFILE_PICTURE_KEY,
  LOCAL_STORAGE_MONTHLY_OFF_LIMIT_KEY, LOCAL_STORAGE_APP_PIN_KEY,
  LOCAL_STORAGE_APP_LOCK_TYPE_KEY, LOCAL_STORAGE_APP_PATTERN_KEY,
  LOCAL_STORAGE_FINANCIAL_MONTH_START_DAY_KEY, LOCAL_STORAGE_FINANCIAL_MONTH_END_DAY_KEY,
  LOCAL_STORAGE_FINANCIAL_YEAR_START_MONTH_KEY, LOCAL_STORAGE_FINANCIAL_YEAR_START_DAY_KEY,
  LOCAL_STORAGE_FINANCIAL_YEAR_END_MONTH_KEY, LOCAL_STORAGE_FINANCIAL_YEAR_END_DAY_KEY,
  LOCAL_STORAGE_HEADER_BACKGROUND_IMAGE_KEY, LOCAL_STORAGE_SAVED_AMORTIZATION_SCHEDULES_KEY,
  SESSION_TIMEOUT_DURATION_SECONDS as DEFAULT_SESSION_TIMEOUT_DURATION_SECONDS,
  LOCAL_STORAGE_SESSION_TIMEOUT_DURATION_KEY, LOCAL_STORAGE_USER_VIEW_FEATURE_SETTINGS_KEY,
  CONFIGURABLE_USER_FEATURES, LOCAL_STORAGE_USE_DIGITAL_FONT_KEY,
  LOCAL_STORAGE_DEFAULT_VIEWS_KEY, LOCAL_STORAGE_USER_CREDENTIALS_KEY,
  ADMIN_ONLY_SECTIONS, allSectionKeysWithConfig, LOCAL_STORAGE_USER_MENU_GROUP_SETTINGS_KEY,
  CONFIGURABLE_MENU_GROUPS, LOCAL_STORAGE_TODOS_KEY, LOCAL_STORAGE_DAY_PLANNER_ENTRIES_KEY,
  LOCAL_STORAGE_RECURRING_REMINDERS_KEY, LOCAL_STORAGE_SUBSCRIPTION_PLANS_KEY,
  LOCAL_STORAGE_RECHARGE_PLANS_KEY, LOCAL_STORAGE_BALANCE_VISIBLE_KEY,
  TIME_BASED_MESSAGES, WEEKDAY_OPTIONS, LOCAL_STORAGE_AUTO_BACKUP_SETTINGS_KEY,
  LOCAL_STORAGE_LAST_BACKUP_TIMESTAMP_KEY, LOCAL_STORAGE_BACKUP_REMINDER_DISMISSED_KEY,
  LOCAL_STORAGE_PILL_NOTIFICATION_ENABLED_KEY, LOCAL_STORAGE_VAULT_ITEMS_KEY,
  LOCAL_STORAGE_MENU_ITEMS_KEY, LOCAL_STORAGE_SALARY_DEDUCTIONS_KEY,
  LOCAL_STORAGE_DEFAULT_DASHBOARD_PERIOD_KEY, LOCAL_STORAGE_ACCOUNT_SPECIFIC_SETTINGS_KEY,
  LOCAL_STORAGE_FESTIVE_DATES_KEY, LOCAL_STORAGE_HOME_PAGE_LAYOUT_KEY, LOCAL_STORAGE_MODE_LAYOUTS_KEY,
  LOCAL_STORAGE_OVERLAY_SETTINGS_KEY
} from './constants';

// Component Imports
import HorizontalPager from './components/HorizontalPager';
import TransactionForm from './components/TransactionForm';
import { PassbookView } from './components/PassbookView';
import { BenefitPassbook } from './components/BenefitPassbook';
import { MenuTiles } from './components/MenuTiles';
import CategoryManager from './components/CategoryManager';
import { BudgetManager } from './components/BudgetManager';
import ToastNotification from './components/ToastNotification';
import AccountManager from './components/AccountManager';
import AccountSelector from './components/AccountSelector';
import { AmortizationSchedule } from './components/AmortizationSchedule';
import { EmiDashboard } from './components/EmiReports';
import EmiCalendarView from './components/EmiCalendarView';
import AttendanceListComponent from './components/AttendanceListComponent';
import TransactionList from './components/TransactionList';
import AttendanceViewComponent from './components/AttendanceViewComponent';
import { AttendanceReportComponent } from './components/AttendanceReportComponent';
import AttendanceCalendarViewComponent from './components/AttendanceCalendarViewComponent';
import FinancialCalendarViewComponent from './components/FinancialCalendarViewComponent';
import { SalaryReportComponent } from './components/SalaryReportComponent';
import AttendanceConfigReport from './components/AttendanceConfigReport';
import LockScreen from './components/LockScreen';
import LoginPage from './components/LoginPage';
import UserManagement from './components/UserManagement';
import { DataManagementComponent } from './components/DataManagementComponent';
import { AppSettingsComponent } from './components/AppSettingsComponent';
import { RecycleBinComponent } from './components/RecycleBinComponent';
import AccountSpecificSettings from './components/AccountSpecificSettings';
import TodoListComponent from './components/TodoListComponent'; 
import DayPlannerComponent from './components/DayPlannerComponent';
import Horoscope from './components/Horoscope';
import SubscriptionTracker from './components/SubscriptionTracker'; 
import RechargeTracker from './components/RechargeTracker';
import MenuItemManager from './components/MenuItemManager';
import Sidebar from './components/Sidebar';
import ReminderBell from './components/ReminderBell';
import HeaderTimer from './components/HeaderTimer';
import HeaderMenu from './components/HeaderMenu';
import SessionTimerDisplay from './components/SessionTimerDisplay';
import ProfilePicture from './components/ProfilePicture';
import TransactionDetailModal from './components/TransactionDetailModal';
import { AccountContext } from './contexts/AccountContext';
import { useTheme } from './contexts/ThemeContext';
import { 
  BanknotesIcon, UserGroupIcon, CalculatorIcon, 
  ListChecksIcon, DocumentChartBarIcon, 
  ListBulletIcon, CalendarIcon, ChartIcon, XIcon,
  ChevronLeftIcon, ChevronRightIcon
} from './components/Icons'; 
import { formatDateToYYYYMMDD, formatDateDisplay, getFinancialMonthIdentifier, getPeriodDateRange } from './utils/dateUtils';
import DateFilter, { FilterPeriod } from './components/DateFilter';
import TransactionImporter from './components/TransactionImporter';
import UpiPayment from './components/UpiPayment';
import DocumentVault from './components/DocumentVault';
import EmiSuccessModal from './components/EmiSuccessModal';
import { DigitalIDVault } from './components/DigitalIDVault/DigitalIDVault';
import { ViewRawLocalStorageTable } from './components/ViewRawLocalStorageTable';
import NotificationHistory from './components/NotificationHistory';
import AppLockSettings from './components/PinSetup';
import { MiniStatement } from './components/MiniStatement';
import BudgetPerformanceDashboard from './components/BudgetPerformanceDashboard';
import ReportsDashboard from './components/ReportsDashboard';
import BarChartComponent from './components/BarChartComponent';
import PieChartComponent from './components/PieChartComponent';
import LineChartComponent from './components/LineChartComponent';
import CategoryBarChartComponent from './components/CategoryBarChartComponent';
import IncomePieChartComponent from './components/IncomePieChartComponent';
import RepeatedTransactionsReport from './components/RepeatedTransactionsReport';
import { SnapshotsStack } from './components/Snapshots';
import { UserManual } from './components/UserManual';
import Dashboard from './components/Dashboard';
import MonthlySummaryView from './components/MonthlySummaryView';
import FloatingOverlay from './components/FloatingOverlay';
import { ArrowsPointingOutIcon } from './components/Icons';

const App: React.FC = () => {
  // --- Persistent Storage State ---
  const [appTitle, setAppTitle] = useFirestoreDocumentSync<string>('settings/appTitle', LOCAL_STORAGE_APP_TITLE_KEY, 'Personal AI');
  const [customBrandColor, setCustomBrandColor] = useFirestoreDocumentSync<string | null>('settings/customBrandColor', 'financeTrackerCustomBrandColor', null);
  const [transactions, setTransactions] = useFirestoreCollectionSync<Transaction>('transactions', LOCAL_STORAGE_KEY, [], item => item.id);
  const [accounts, setAccounts] = useFirestoreCollectionSync<Account>('accounts', LOCAL_STORAGE_ACCOUNTS_KEY, [], item => item.id);
  const [activeAccountId, setActiveAccountIdState] = useFirestoreDocumentSync<string | null>('settings/activeAccountId', LOCAL_STORAGE_ACTIVE_ACCOUNT_ID_KEY, null);
  const [expenseCategories, setExpenseCategories] = useFirestoreDocumentSync<string[]>('settings/expenseCategories', LOCAL_STORAGE_EXPENSE_CATEGORIES_KEY, DEFAULT_EXPENSE_CATEGORIES);
  const [incomeCategoriesList, setIncomeCategoriesList] = useFirestoreDocumentSync<string[]>('settings/incomeCategoriesList', LOCAL_STORAGE_INCOME_CATEGORIES_KEY, DEFAULT_INCOME_CATEGORIES);
  const [budgetSettings, setBudgetSettings] = useFirestoreCollectionSync<BudgetSetting>('budgetSettings', LOCAL_STORAGE_BUDGETS_KEY, [], item => `${item.accountId}_${item.category}_${item.periodIdentifier}`);
  const [notificationHistory, setNotificationHistory] = useFirestoreDocumentSync<ToastInfo[]>('settings/notificationHistory', LOCAL_STORAGE_NOTIFICATION_HISTORY_KEY, []);
  const [attendanceEntries, setAttendanceEntries] = useFirestoreCollectionSync<AttendanceEntry>('attendanceEntries', LOCAL_STORAGE_ATTENDANCE_KEY, [], item => item.date);
  const [attendanceHistory, setAttendanceHistory] = useFirestoreCollectionSync<AttendanceHistoryEntry>('attendanceHistory', LOCAL_STORAGE_ATTENDANCE_HISTORY_KEY, [], item => item.id);
  const [monthlySalary, setMonthlySalary] = useFirestoreDocumentSync<number | null>('settings/monthlySalary', LOCAL_STORAGE_MONTHLY_SALARY_KEY, null);
  const [selectedWeeklyOffDay, setSelectedWeeklyOffDay] = useFirestoreDocumentSync<number>('settings/selectedWeeklyOffDay', LOCAL_STORAGE_SELECTED_WEEKLY_OFF_DAY_KEY, 0);
  const [monthlyOffLimits, setMonthlyOffLimits] = useFirestoreDocumentSync<Record<string, number>>('settings/monthlyOffLimits', LOCAL_STORAGE_MONTHLY_OFF_LIMIT_KEY, {});
  const [financialMonthStartDay, setFinancialMonthStartDay] = useFirestoreDocumentSync<number>('settings/financialMonthStartDay', LOCAL_STORAGE_FINANCIAL_MONTH_START_DAY_KEY, 5);
  const [financialMonthEndDay, setFinancialMonthEndDay] = useFirestoreDocumentSync<number>('settings/financialMonthEndDay', LOCAL_STORAGE_FINANCIAL_MONTH_END_DAY_KEY, 4);
  const [financialYearStartMonth, setFinancialYearStartMonth] = useFirestoreDocumentSync<number>('settings/financialYearStartMonth', LOCAL_STORAGE_FINANCIAL_YEAR_START_MONTH_KEY, 1);
  const [financialYearStartDay, setFinancialYearStartDay] = useFirestoreDocumentSync<number>('settings/financialYearStartDay', LOCAL_STORAGE_FINANCIAL_YEAR_START_DAY_KEY, 1);
  const [financialYearEndMonth, setFinancialYearEndMonth] = useFirestoreDocumentSync<number>('settings/financialYearEndMonth', LOCAL_STORAGE_FINANCIAL_YEAR_END_MONTH_KEY, 12);
  const [financialYearEndDay, setFinancialYearEndDay] = useFirestoreDocumentSync<number>('settings/financialYearEndDay', LOCAL_STORAGE_FINANCIAL_YEAR_END_DAY_KEY, 31);
  const [savedAmortizationSchedules, setSavedAmortizationSchedules] = useFirestoreCollectionSync<SavedAmortizationSchedule>('savedAmortizationSchedules', LOCAL_STORAGE_SAVED_AMORTIZATION_SCHEDULES_KEY, [], item => item.id);
  const [sessionTimeoutDurationSeconds, setSessionTimeoutDurationSeconds] = useFirestoreDocumentSync<number>('settings/sessionTimeoutDurationSeconds', LOCAL_STORAGE_SESSION_TIMEOUT_DURATION_KEY, DEFAULT_SESSION_TIMEOUT_DURATION_SECONDS);
  const [useDigitalFontForTimers, setUseDigitalFontForTimers] = useFirestoreDocumentSync<boolean>('settings/useDigitalFontForTimers', LOCAL_STORAGE_USE_DIGITAL_FONT_KEY, false);
  const [userCredentials, setUserCredentials] = useFirestoreCollectionSync<UserCredential>('userCredentials', LOCAL_STORAGE_USER_CREDENTIALS_KEY, [], item => item.id);
  const [todos, setTodos] = useFirestoreCollectionSync<TodoItem>('todos', LOCAL_STORAGE_TODOS_KEY, [], item => item.id);
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.FINANCE);
  const [dayPlannerEntries, setDayPlannerEntries] = useFirestoreCollectionSync<DayPlannerEntry>('dayPlannerEntries', LOCAL_STORAGE_DAY_PLANNER_ENTRIES_KEY, [], item => item.id);
  const [subscriptionPlans, setSubscriptionPlans] = useFirestoreCollectionSync<SubscriptionPlan>('subscriptionPlans', LOCAL_STORAGE_SUBSCRIPTION_PLANS_KEY, [], item => item.id);
  const [rechargePlans, setRechargePlans] = useFirestoreCollectionSync<RechargePlan>('rechargePlans', LOCAL_STORAGE_RECHARGE_PLANS_KEY, [], item => item.id);
  const [menuItems, setMenuItems] = useFirestoreCollectionSync<MenuItem>('menuItems', LOCAL_STORAGE_MENU_ITEMS_KEY, [], item => item.id);
  const [salaryDeductions, setSalaryDeductions] = useFirestoreCollectionSync<SalaryDeduction>('salaryDeductions', LOCAL_STORAGE_SALARY_DEDUCTIONS_KEY, [], item => item.id);
  const [festiveDates, setFestiveDates] = useFirestoreCollectionSync<FestiveDate>('festiveDates', LOCAL_STORAGE_FESTIVE_DATES_KEY, [], item => item.id);
  const [isBalanceVisible, setIsBalanceVisible] = useFirestoreDocumentSync<boolean>('settings/isBalanceVisible', LOCAL_STORAGE_BALANCE_VISIBLE_KEY, true);
  const [autoBackupSettings, setAutoBackupSettings] = useFirestoreDocumentSync<AutoBackupSettings>('settings/autoBackupSettings', LOCAL_STORAGE_AUTO_BACKUP_SETTINGS_KEY, { enabled: true, frequency: 'weekly' });
  const [lastBackupTimestamp, setLastBackupTimestamp] = useFirestoreDocumentSync<number | null>('settings/lastBackupTimestamp', LOCAL_STORAGE_LAST_BACKUP_TIMESTAMP_KEY, null);
  const [defaultViews, setDefaultViews] = useFirestoreDocumentSync<DefaultViewSettings>('settings/defaultViews', LOCAL_STORAGE_DEFAULT_VIEWS_KEY, { finance: 'form', attendance: 'attendanceList', emi: 'emiDashboard', todo: 'todoList' });
  const [defaultDashboardPeriod] = useFirestoreDocumentSync<FilterPeriod>('settings/defaultDashboardPeriod', LOCAL_STORAGE_DEFAULT_DASHBOARD_PERIOD_KEY, 'Monthly');
  const [accountSpecificSettings, setAccountSpecificSettings] = useFirestoreDocumentSync<Record<string, Partial<AccountSpecificSettingsData>>>('settings/accountSpecificSettings', LOCAL_STORAGE_ACCOUNT_SPECIFIC_SETTINGS_KEY, {});
  const [vaultItems, setVaultItems] = useFirestoreCollectionSync<VaultItem>('vaultItems', LOCAL_STORAGE_VAULT_ITEMS_KEY, [], item => item.id);
  const [modeLayouts, setModeLayouts] = useFirestoreDocumentSync<AppModeLayouts>('settings/modeLayouts', LOCAL_STORAGE_MODE_LAYOUTS_KEY, {
    [AppMode.FINANCE]: [
      { id: 'f1', title: 'Record Transaction', sectionKey: 'form', isDefault: true },
      { id: 'f2', title: 'Charts & Trends', sectionKey: 'charts' },
      { id: 'f3', title: 'Budgets', sectionKey: 'budgets' },
      { id: 'f4', title: 'Financial Calendar', sectionKey: 'financialCalendar' }
    ],
    [AppMode.ATTENDANCE]: [
      { id: 'a1', title: 'Log Attendance', sectionKey: 'attendanceList', isDefault: true },
      { id: 'a2', title: 'Attendance Calendar', sectionKey: 'attendanceCalendar' },
      { id: 'a3', title: 'Attendance Reports', sectionKey: 'attendanceReports' }
    ],
    [AppMode.EMI]: [
      { id: 'e1', title: 'EMI Dashboard', sectionKey: 'emiDashboard', isDefault: true },
      { id: 'e2', title: 'EMI Calendar', sectionKey: 'emiCalendar' },
      { id: 'e3', title: 'EMI Calculator', sectionKey: 'amortizationSchedule' }
    ],
    [AppMode.TODO]: [
      { id: 't1', title: 'To-do List', sectionKey: 'todoList', isDefault: true },
      { id: 't2', title: 'Day Planner', sectionKey: 'dayPlanner' }
    ]
  });
  const [isLeftSidebarVisible, setIsLeftSidebarVisible] = useFirestoreDocumentSync<boolean>('settings/isLeftSidebarVisible', 'isLeftSidebarVisible', true);
  const [loggedInUser, setLoggedInUser] = useLocalStorage<UserCredential | null>('financeTrackerLoggedInUser', null); // Keep local for auth

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Check if the user is the designated admin
        const isAdmin = user.email === 'manialone002@gmail.com';
        
        // If user is logged in via Firebase, set them as loggedInUser
        setLoggedInUser({
          id: user.uid,
          username: user.displayName || user.email?.split('@')[0] || 'User',
          role: isAdmin ? Role.ADMIN : Role.USER,
        });
      } else {
        // If user logs out of Firebase, clear loggedInUser
        // Only clear if the current user is a Firebase user (not local admin)
        setLoggedInUser((prev) => {
          if (prev && prev.id !== 'admin' && !userCredentials.find(u => u.id === prev.id)) {
            return null;
          }
          return prev;
        });
      }
    });
    return () => unsubscribe();
  }, [setLoggedInUser, userCredentials]);
  const [appPin, setAppPin, isAppPinLoading] = useFirestoreDocumentSync<string | null>('settings/appPin', LOCAL_STORAGE_APP_PIN_KEY, null);
  const [lockType, setLockType, isLockTypeLoading] = useFirestoreDocumentSync<'pin' | 'pattern'>('settings/lockType', LOCAL_STORAGE_APP_LOCK_TYPE_KEY, 'pin');
  const [appPattern, setAppPattern, isAppPatternLoading] = useFirestoreDocumentSync<string | null>('settings/appPattern', LOCAL_STORAGE_APP_PATTERN_KEY, null);

  const currentLayout = useMemo(() => modeLayouts[activeMode] || [], [modeLayouts, activeMode]);

  // --- UI State ---
  const { currentThemeColors } = useTheme();
  const { t } = useLanguage();
  const [visibleSections, setVisibleSections] = useState<Set<SectionKey>>(new Set([defaultViews.finance || 'form']));
  const [toastInfo, setToastInfo] = useState<ToastInfo | null>(null);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [scheduleToEdit, setScheduleToEdit] = useState<SavedAmortizationSchedule | null>(null);
  const [suggestedTransactionToFill, setSuggestedTransactionToFill] = useState<Partial<Transaction> | null>(null);
  const [currentGreeting, setCurrentGreeting] = useState('');
  const [currentDateTimeString, setCurrentDateTimeString] = useState('');
  const [dashboardStartDate, setDashboardStartDate] = useState<string | null>(() => {
      const identifier = getFinancialMonthIdentifier(new Date(), financialMonthStartDay);
      const { start } = getPeriodDateRange(BudgetPeriod.MONTHLY, identifier, { startDay: financialMonthStartDay, endDay: financialMonthEndDay });
      return formatDateToYYYYMMDD(start);
  });
  const [dashboardEndDate, setDashboardEndDate] = useState<string | null>(() => {
      const identifier = getFinancialMonthIdentifier(new Date(), financialMonthStartDay);
      const { end } = getPeriodDateRange(BudgetPeriod.MONTHLY, identifier, { startDay: financialMonthStartDay, endDay: financialMonthEndDay });
      return formatDateToYYYYMMDD(end);
  });
  const [activePeriodLabel, setActivePeriodLabel] = useState<FilterPeriod>('Monthly');
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const [initialCashbackBalance, setInitialCashbackBalance] = useFirestoreDocumentSync<number>('settings/initialCashbackBalance', 'initial_cashback_balance', 0);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTransactionTypeConfirmed, setIsTransactionTypeConfirmed] = useState(false);

  useEffect(() => {
    if (activePeriodLabel === 'Monthly') {
      const identifier = getFinancialMonthIdentifier(new Date(), financialMonthStartDay);
      const config = { startDay: financialMonthStartDay, endDay: financialMonthEndDay };
      const { start, end } = getPeriodDateRange(BudgetPeriod.MONTHLY, identifier, config);
      setDashboardStartDate(formatDateToYYYYMMDD(start));
      setDashboardEndDate(formatDateToYYYYMMDD(end));
    }
  }, [financialMonthStartDay, financialMonthEndDay, activePeriodLabel]);
  
  // Detail Modal State
  const [selectedDetailDate, setSelectedDetailDate] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [pagerIndex, setPagerIndex] = useState(0);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isBenefitPassbookOpen, setIsBenefitPassbookOpen] = useState(false);
  const [emiSuccessData, setEmiSuccessData] = useState<{ schedule: SavedAmortizationSchedule, amount: number, isFullPayment: boolean } | null>(null);
  
  const [overlaySettings, setOverlaySettings] = useFirestoreDocumentSync<OverlaySettings>('settings/overlaySettings', LOCAL_STORAGE_OVERLAY_SETTINGS_KEY, {
    enabledFeatures: ['passbook', 'documentVault']
  });
  const [isFloatingOverlayOpen, setIsFloatingOverlayOpen] = useState(false);
  const [floatingOverlayContent, setFloatingOverlayContent] = useState<OverlayContent | null>(null);

  const loggedInRole = useMemo(() => loggedInUser?.role || null, [loggedInUser]);

  useEffect(() => {
    requestNotificationPermission();

    // Test Firestore connection
    async function testConnection() {
      try {
        console.log("Testing Firestore connection...");
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log("Firestore connection successful.");
      } catch (error) {
        console.error("Firestore connection test failed:", error);
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        } else if (error instanceof Error && error.message.includes('permission-denied')) {
          console.error("Permission denied to test connection. Check firestore.rules.");
        }
      }
    }
    testConnection();
  }, []);

  const [shownNotifications, setShownNotifications] = useState<Set<string>>(new Set());
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number>(sessionTimeoutDurationSeconds);
  const sessionEndTimeRef = useRef<number>(Date.now() + sessionTimeoutDurationSeconds * 1000);

  const upcomingPayments: UpcomingPayment[] = useMemo(() => {
    const reminders: UpcomingPayment[] = [];
    const today = new Date();
    (savedAmortizationSchedules ?? []).filter(s => !s.isDeleted).forEach(schedule => {
        const paymentStatus = schedule.paymentStatus || {};
        (schedule.schedule ?? []).filter(entry => !paymentStatus[entry.month]).forEach(entry => {
            const dueDate = new Date(entry.paymentDate);
            if (dueDate >= today || Math.abs(today.getTime() - dueDate.getTime()) < 30 * 24 * 60 * 60 * 1000) {
                reminders.push({ type: 'emi', name: schedule.loanName, amount: entry.emi, dueDate: entry.paymentDate, originalId: schedule.id, schedule, entry });
            }
        });
    });
    (subscriptionPlans ?? []).filter(p => !p.isDeleted).forEach(plan => {
        reminders.push({ type: 'subscription', name: plan.name, provider: plan.provider, amount: plan.price, dueDate: plan.nextDueDate, originalId: plan.id });
    });
    (rechargePlans ?? []).filter(p => !p.isDeleted).forEach(plan => {
        reminders.push({ type: 'recharge', name: `${plan.provider} Recharge`, provider: plan.provider, amount: plan.price, dueDate: plan.nextDueDate, originalId: plan.id });
    });
    (todos ?? []).filter(t => !t.isDeleted && !t.completed && t.reminderDateTime).forEach(todo => {
        reminders.push({ type: 'todo', name: todo.text, dueDate: todo.reminderDateTime!, originalId: todo.id });
    });
    (dayPlannerEntries ?? []).filter(e => !e.isDeleted && !e.completed && e.reminderDateTime).forEach(entry => {
        reminders.push({ type: 'dayPlanner', name: entry.title, dueDate: entry.reminderDateTime!, originalId: entry.id });
    });
    (festiveDates ?? []).forEach(festive => {
        // Assume festive dates are due at 00:00:00 of that day
        const dateStr = `${festive.date}T00:00:00`;
        reminders.push({ type: 'festive', name: festive.name, dueDate: dateStr, originalId: festive.id });
    });
    return reminders.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [savedAmortizationSchedules, subscriptionPlans, rechargePlans, todos, dayPlannerEntries, festiveDates]);

  // Update session timeout on user activity
  useEffect(() => {
    const handleActivity = () => {
      sessionEndTimeRef.current = Date.now() + sessionTimeoutDurationSeconds * 1000;
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [sessionTimeoutDurationSeconds]);

  // Session timeout interval
  useEffect(() => {
    if (sessionTimeoutDurationSeconds <= 0) return; // 0 means disabled

    const intervalId = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((sessionEndTimeRef.current - now) / 1000));
      setSessionTimeLeft(diff);

      if (diff === 0 && !isAppLocked && (appPin || appPattern)) {
        setIsAppLocked(true);
        showNotification('Session Expired', 'Your session has timed out for security.');
      } else if (diff === 60 && !isAppLocked) {
        showNotification('Session Expiring', 'Your session will expire in 1 minute.');
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isAppLocked, appPin, appPattern, sessionTimeoutDurationSeconds]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const nowStr = now.toISOString();
      
      upcomingPayments.forEach(payment => {
        const dueTime = new Date(payment.dueDate).getTime();
        const diff = dueTime - now.getTime();
        
        // If due in the next minute and not already shown
        if (diff > -60000 && diff < 60000 && !shownNotifications.has(payment.originalId + payment.dueDate)) {
          showNotification('Reminder Due', `${payment.name} is due now!`);
          setShownNotifications(prev => new Set(prev).add(payment.originalId + payment.dueDate));
        }
      });
    };

    const intervalId = setInterval(checkReminders, 30000); // Check every 30 seconds
    return () => clearInterval(intervalId);
  }, [upcomingPayments, shownNotifications]);

  const addToast = useCallback((message: string, type: ToastType) => {
    setToastInfo({ id: crypto.randomUUID(), message, type, visible: true, timestamp: Date.now() });
    
    // Also show system notification for important types
    if (type === 'success' || type === 'warning' || type === 'error') {
      const title = type.charAt(0).toUpperCase() + type.slice(1);
      showNotification(title, message);
    }
  }, []);

  const handleLoginAttempt = useCallback((usernameAttempt: string, passwordAttempt: string): boolean => {
    if (usernameAttempt === 'admin' && passwordAttempt === 'admin123') {
      setLoggedInUser({ id: 'admin', username: 'admin', password: 'admin123', role: Role.ADMIN });
      return true;
    }
    if (usernameAttempt === 'google_user' && passwordAttempt === 'google_auth') {
      // The onAuthStateChanged listener will set the user
      return true;
    }
    const foundUser = (userCredentials ?? []).find(
      u => u.username === usernameAttempt && u.password === passwordAttempt && !u.isDeleted
    );
    if (foundUser) {
      setLoggedInUser(foundUser);
      return true;
    }
    return false;
  }, [userCredentials, setLoggedInUser]);

  const handleRecoverLock = useCallback((password: string): boolean => {
    if (loggedInUser && password === loggedInUser.password) {
        setAppPin(null);
        setAppPattern(null);
        setIsAppLocked(false);
        sessionEndTimeRef.current = Date.now() + sessionTimeoutDurationSeconds * 1000;
        addToast("Security lock reset successfully.", "success");
        return true;
    }
    return false;
  }, [loggedInUser, setAppPin, setAppPattern, addToast, sessionTimeoutDurationSeconds]);

  // Apply custom brand color override
  useEffect(() => {
    if (customBrandColor) {
      document.documentElement.style.setProperty('--color-brand-primary', customBrandColor);
    }
  }, [customBrandColor]);

  // Ensure default categories are present for existing users
  useEffect(() => {
    const defaultCategories = Object.values(ExpenseCategory) as string[];
    const safeCategories = expenseCategories || [];
    const missingCategories = defaultCategories.filter(cat => !safeCategories.includes(cat));
    if (missingCategories.length > 0) {
      setExpenseCategories(prev => {
        const uniquePrev = Array.from(new Set(prev || []));
        const newCats = missingCategories.filter(cat => !uniquePrev.includes(cat));
        if (newCats.length === 0) return prev;
        return [...uniquePrev, ...newCats];
      });
    }
  }, [expenseCategories, setExpenseCategories]);

  // --- Data Management Functions ---
  const handleExportAllData = useCallback(() => {
    const backupData = {
      appTitle, customBrandColor, transactions, accounts, activeAccountId, expenseCategories, incomeCategoriesList,
      budgetSettings, notificationHistory, attendanceEntries, attendanceHistory, monthlySalary,
      selectedWeeklyOffDay, monthlyOffLimits, financialMonthStartDay, financialMonthEndDay,
      financialYearStartMonth, financialYearStartDay, financialYearEndMonth, financialYearEndDay,
      savedAmortizationSchedules, sessionTimeoutDurationSeconds, useDigitalFontForTimers,
      userCredentials, todos, dayPlannerEntries, subscriptionPlans, rechargePlans,
      menuItems, salaryDeductions, festiveDates, isBalanceVisible, autoBackupSettings,
      lastBackupTimestamp: Date.now(), defaultViews, accountSpecificSettings, vaultItems, appPin, lockType, appPattern,
      modeLayouts,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_${appTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setLastBackupTimestamp(Date.now());
    addToast('All data exported successfully!', 'success');
  }, [appTitle, customBrandColor, transactions, accounts, activeAccountId, expenseCategories, incomeCategoriesList, budgetSettings, notificationHistory, attendanceEntries, attendanceHistory, monthlySalary, selectedWeeklyOffDay, monthlyOffLimits, financialMonthStartDay, financialMonthEndDay, financialYearStartMonth, financialYearStartDay, financialYearEndMonth, financialYearEndDay, savedAmortizationSchedules, sessionTimeoutDurationSeconds, useDigitalFontForTimers, userCredentials, todos, dayPlannerEntries, subscriptionPlans, rechargePlans, menuItems, salaryDeductions, festiveDates, isBalanceVisible, autoBackupSettings, defaultViews, accountSpecificSettings, vaultItems, appPin, lockType, appPattern, modeLayouts, setLastBackupTimestamp, addToast]);

  const handleImportData = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const data = JSON.parse(content);
          console.log("Import data:", data);
          if (!data.transactions && !data.accounts && !data.todos) {
            throw new Error("Invalid backup file structure.");
          }
          if (data.appTitle) setAppTitle(data.appTitle);
          if (data.customBrandColor !== undefined) setCustomBrandColor(data.customBrandColor);
          if (data.transactions) setTransactions(data.transactions);
          if (data.accounts) setAccounts(data.accounts);
          if (data.activeAccountId !== undefined) setActiveAccountIdState(data.activeAccountId);
          if (data.expenseCategories) setExpenseCategories(data.expenseCategories);
          if (data.incomeCategoriesList) setIncomeCategoriesList(data.incomeCategoriesList);
          if (data.budgetSettings) setBudgetSettings(data.budgetSettings);
          if (data.notificationHistory) setNotificationHistory(data.notificationHistory);
          if (data.attendanceEntries) setAttendanceEntries(data.attendanceEntries);
          if (data.attendanceHistory) setAttendanceHistory(data.attendanceHistory);
          if (data.monthlySalary !== undefined) setMonthlySalary(data.monthlySalary);
          if (data.selectedWeeklyOffDay !== undefined) setSelectedWeeklyOffDay(data.selectedWeeklyOffDay);
          if (data.monthlyOffLimits) setMonthlyOffLimits(data.monthlyOffLimits);
          if (data.financialMonthStartDay !== undefined) setFinancialMonthStartDay(data.financialMonthStartDay);
          if (data.financialMonthEndDay !== undefined) setFinancialMonthEndDay(data.financialMonthEndDay);
          if (data.savedAmortizationSchedules) setSavedAmortizationSchedules(data.savedAmortizationSchedules);
          if (data.todos) setTodos(data.todos);
          if (data.dayPlannerEntries) setDayPlannerEntries(data.dayPlannerEntries);
          if (data.subscriptionPlans) setSubscriptionPlans(data.subscriptionPlans);
          if (data.rechargePlans) setRechargePlans(data.rechargePlans);
          if (data.menuItems) setMenuItems(data.menuItems);
          if (data.vaultItems) setVaultItems(data.vaultItems);
          if (data.appPin !== undefined) setAppPin(data.appPin);
          if (data.modeLayouts) setModeLayouts(data.modeLayouts);
          addToast("Data imported successfully!", "success");
          setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
          console.error("Import failed:", err);
          addToast("Failed to import data. The file might be corrupted or incompatible.", "error");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [setAppTitle, setCustomBrandColor, setTransactions, setAccounts, setActiveAccountIdState, setExpenseCategories, setIncomeCategoriesList, setBudgetSettings, setNotificationHistory, setAttendanceEntries, setAttendanceHistory, setMonthlySalary, setSelectedWeeklyOffDay, setMonthlyOffLimits, setFinancialMonthStartDay, setFinancialMonthEndDay, setSavedAmortizationSchedules, setTodos, setDayPlannerEntries, setSubscriptionPlans, setRechargePlans, setMenuItems, setVaultItems, setAppPin, setModeLayouts, addToast]);

  const handleClearAllData = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

  const hasCheckedLock = useRef(false);
  useEffect(() => {
    hasCheckedLock.current = false;
  }, [loggedInUser]);

  useEffect(() => {
    if (!isAppPinLoading && !isLockTypeLoading && !isAppPatternLoading && !hasCheckedLock.current) {
      const hasLock = lockType === 'pin' ? !!appPin : !!appPattern;
      if (hasLock && !isAppLocked) setIsAppLocked(true);
      hasCheckedLock.current = true;
    }
  }, [isAppPinLoading, isLockTypeLoading, isAppPatternLoading, appPin, appPattern, lockType, isAppLocked, loggedInUser]);

  const safeTransactions = transactions ?? [];
  const safeAccounts = accounts ?? [];
  const safeTodos = todos ?? [];
  const safeAttendanceEntries = attendanceEntries ?? [];
  const safeSavedAmortizationSchedules = savedAmortizationSchedules ?? [];
  const safeMenuItems = menuItems ?? [];
  const safeSubscriptionPlans = subscriptionPlans ?? [];
  const safeRechargePlans = rechargePlans ?? [];
  const safeVaultItems = vaultItems ?? [];
  const safeNotificationHistory = notificationHistory ?? [];
  const safeSalaryDeductions = salaryDeductions ?? [];
  const safeUserCredentials = userCredentials ?? [];
  const safeDayPlannerEntries = dayPlannerEntries ?? [];
  const safeMonthlyOffLimits = monthlyOffLimits ?? {};
  const safeFestiveDates = festiveDates ?? [];
  const safeBudgetSettings = budgetSettings ?? [];

  const activeAccount = useMemo(() => safeAccounts.find(a => a.id === activeAccountId), [safeAccounts, activeAccountId]);

  const activeAccountBalance = useMemo(() => {
    if (!activeAccount) {
        return safeAccounts.reduce((sum, acc) => {
            const txs = safeTransactions.filter(t => !t.isDeleted && t.accountId === acc.id);
            const balance = txs.reduce((s, t) => {
                if (t.type === TransactionType.INCOME) return s + t.amount;
                if (t.type === TransactionType.EXPENSE) return s - t.amount;
                return s;
            }, acc.initialBalance || 0);
            return sum + balance;
        }, 0);
    }
    const accountTransactions = safeTransactions.filter(t => !t.isDeleted && t.accountId === activeAccount.id);
    return accountTransactions.reduce((acc, t) => {
      if (t.type === TransactionType.INCOME) return acc + t.amount;
      if (t.type === TransactionType.EXPENSE) return acc - t.amount;
      return acc;
    }, activeAccount.initialBalance || 0);
  }, [activeAccount, safeAccounts, safeTransactions]);

  const cashInHandAccount = useMemo(() => safeAccounts.find(a => a.name.toLowerCase().includes('cash') && a.name.toLowerCase().includes('hand')), [safeAccounts]);

  const cashInHandBalance = useMemo(() => {
    if (!cashInHandAccount) return 0;
    
    const accountTransactions = safeTransactions.filter(t => !t.isDeleted && t.accountId === cashInHandAccount.id);
    return accountTransactions.reduce((acc, t) => {
      if (t.type === TransactionType.INCOME) return acc + t.amount;
      if (t.type === TransactionType.EXPENSE) {
        return acc - t.amount;
      }
      return acc;
    }, cashInHandAccount.initialBalance || 0);
  }, [cashInHandAccount, safeTransactions]);

  const totalCashbackBalance = useMemo(() => {
    return safeTransactions.filter(t => !t.isDeleted).reduce((acc, t) => acc + (t.cashbackAmount || 0) - (t.couponUsed || 0), initialCashbackBalance);
  }, [safeTransactions, initialCashbackBalance]);

  const totalCouponsUsed = useMemo(() => {
    return safeTransactions.filter(t => !t.isDeleted).reduce((acc, t) => acc + (t.couponUsed || 0), 0);
  }, [safeTransactions]);

  const currentPeriodTransactions = useMemo(() => {
    return safeTransactions.filter(t => {
        if (t.isDeleted) return false;
        if (activeAccountId && t.accountId !== activeAccountId) return false;
        if (dashboardStartDate && t.date < dashboardStartDate) return false;
        if (dashboardEndDate && t.date > dashboardEndDate) return false;
        return true;
    });
  }, [safeTransactions, activeAccountId, dashboardStartDate, dashboardEndDate]);

  const openingBalanceForPassbook = useMemo(() => {
    console.log('DEBUG: dashboardStartDate:', dashboardStartDate);
    if (!dashboardStartDate) return 0;
    const balance = safeTransactions
      .filter(t => !t.isDeleted && (!activeAccountId || t.accountId === activeAccountId) && t.date < dashboardStartDate)
      .reduce((sum, t) => {
        if (t.type === TransactionType.INCOME) return sum + t.amount;
        if (t.type === TransactionType.EXPENSE) {
          return sum - t.amount;
        }
        return sum;
      }, 0);
    console.log('DEBUG: openingBalanceForPassbook:', balance);
    return balance;
  }, [safeTransactions, activeAccountId, dashboardStartDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) setIsAdminMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSetMonthlyOffLimit = useCallback((monthYear: string, limit: number) => {
    setMonthlyOffLimits(prev => ({ ...prev, [monthYear]: limit }));
  }, [setMonthlyOffLimits]);

  const handleSaveAttendanceEntry = useCallback((entry: AttendanceEntry) => {
    setAttendanceEntries(prev => {
        const existingIndex = (prev ?? []).findIndex(e => e.date === entry.date);
        const existingEntry = (prev ?? [])[existingIndex];
        
        const historyEntry: AttendanceHistoryEntry = {
            id: crypto.randomUUID(),
            dateOfAttendance: entry.date,
            timestamp: Date.now(),
            actionType: existingIndex > -1 ? AttendanceActionType.UPDATED : AttendanceActionType.CREATED,
            previousStatus: existingEntry?.status,
            newStatus: entry.status,
            previousNotes: existingEntry?.notes,
            newNotes: entry.notes
        };
        
        setAttendanceHistory(h => [historyEntry, ...(h ?? [])]);

        if (existingIndex > -1) {
            const updated = [...(prev ?? [])];
            updated[existingIndex] = entry;
            return updated;
        }
        return [...(prev ?? []), entry];
    });
    addToast(`Attendance for ${entry.date} saved.`, 'success');
  }, [setAttendanceEntries, setAttendanceHistory, addToast]);

  const handleSetFinancialYear = useCallback((sm: number, sd: number, em: number, ed: number) => {
    setFinancialYearStartMonth(sm);
    setFinancialYearStartDay(sd);
    setFinancialYearEndMonth(em);
    setFinancialYearEndDay(ed);
  }, [setFinancialYearStartMonth, setFinancialYearStartDay, setFinancialYearEndMonth, setFinancialYearEndDay]);

  const addAccount = useCallback(async (name: string, initialBalance: number, userDate?: string, accountNumber?: string, ifscCode?: string) => {
    const newId = crypto.randomUUID();
    const newAccount: Account = { id: newId, name, createdAt: new Date().toISOString(), isDeleted: false, accountNumber, ifscCode };
    setAccounts(prev => [...(prev ?? []), newAccount]);
    if (initialBalance > 0) {
        const initialTx: Transaction = {
            id: crypto.randomUUID(), accountId: newId, amount: initialBalance, date: userDate || formatDateToYYYYMMDD(new Date()),
            description: `Initial Balance - ${name}`, type: TransactionType.INCOME, category: IncomeCategory.INITIAL_BALANCE, isDeleted: false
        };
        setTransactions(prev => [...(prev ?? []), initialTx]);
    }
    setActiveAccountIdState(newId);
    addToast(`Account "${name}" created successfully!`, 'success');
  }, [setAccounts, setTransactions, setActiveAccountIdState, addToast]);

  const editAccount = useCallback(async (id: string, updates: Partial<Omit<Account, 'id' | 'createdAt'>>) => {
    setAccounts(prev => (prev ?? []).map(a => a.id === id ? { ...a, ...updates } : a));
    addToast("Account updated successfully.", "success");
  }, [setAccounts, addToast]);

  const deleteAccount = useCallback(async (id: string) => {
    setAccounts(prev => (prev ?? []).map(a => a.id === id ? { ...a, isDeleted: true, deletedAt: new Date().toISOString() } : a));
    if (activeAccountId === id) setActiveAccountIdState(null);
    addToast("Account moved to recycle bin.", "info");
  }, [activeAccountId, setActiveAccountIdState, setAccounts, addToast]);

  const handleModeChange = useCallback((newMode: AppMode) => {
    setActiveMode(newMode);
    let sections: SectionKey[] = [];
    if (newMode === AppMode.REPORTS) {
      sections = ['reportsDashboard', 'charts'];
      setPagerIndex(0);
    } else {
      const layout = modeLayouts[newMode] || [];
      const defaultPage = layout.find(p => p.isDefault) || layout[0];
      sections = [defaultPage?.sectionKey || defaultViews[newMode] || 'form'];
      
      const defaultPageIndex = layout.findIndex(p => p.isDefault);
      setPagerIndex(defaultPageIndex !== -1 ? defaultPageIndex : 0);
    }
    setVisibleSections(new Set(sections));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [defaultViews, modeLayouts]);

  const handleShowSection = useCallback((section: SectionKey) => {
    setVisibleSections(new Set([section]));
    setIsAdminMenuOpen(false); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update pager index if it's a pager section
    const pageIndex = currentLayout.findIndex(p => p.sectionKey === section);
    if (pageIndex !== -1) {
      setPagerIndex(pageIndex);
    }
  }, [currentLayout]);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  const syncRechargeTracker = useCallback((provider: string, allTransactions: Transaction[]) => {
    const rechargeTx = allTransactions
      .filter(t => !t.isDeleted && t.type === TransactionType.EXPENSE && t.category === ExpenseCategory.MOBILE && t.description === provider && t.validityDays)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setRechargePlans(prev => {
      const existingPlanIndex = (prev ?? []).findIndex(p => p.provider === provider && !p.isDeleted);
      if (rechargeTx.length > 0) {
        const latest = rechargeTx[0];
        const validity = parseInt(String(latest.validityDays));
        const nextDueDateObj = new Date(latest.date);
        nextDueDateObj.setDate(nextDueDateObj.getDate() + validity);
        const nextDueDate = nextDueDateObj.toISOString().split('T')[0];

        if (existingPlanIndex > -1) {
          const updated = [...prev];
          updated[existingPlanIndex] = {
            ...updated[existingPlanIndex],
            price: latest.amount,
            validityDays: validity,
            lastRechargeDate: latest.date,
            nextDueDate: nextDueDate
          };
          return updated;
        } else {
          const newPlan: RechargePlan = {
            id: crypto.randomUUID(),
            accountId: latest.accountId || activeAccountId || 'default',
            provider: latest.description,
            price: latest.amount,
            validityDays: validity,
            lastRechargeDate: latest.date,
            nextDueDate: nextDueDate,
            isDeleted: false
          };
          return [...(prev ?? []), newPlan];
        }
      } else if (existingPlanIndex > -1) {
        const updated = [...prev];
        updated[existingPlanIndex] = {
          ...updated[existingPlanIndex],
          lastRechargeDate: '',
          nextDueDate: ''
        };
        return updated;
      }
      return prev;
    });
  }, [setRechargePlans, activeAccountId]);

  const syncEmiSchedule = useCallback((emiId: string, allTransactions: Transaction[]) => {
    setSavedAmortizationSchedules(prev => {
      const scheduleIndex = prev.findIndex(s => s.id === emiId);
      if (scheduleIndex > -1) {
        const schedule = prev[scheduleIndex];
        const emiTx = allTransactions
          .filter(t => t.emiId === emiId && !t.isDeleted && t.category === ExpenseCategory.EMI)
          .sort((a, b) => a.date.localeCompare(b.date));
        
        const hasFullPayment = emiTx.some(t => t.isFullEmiPayment);
        const newStatus: Record<number, boolean> = {};
        const newSchedule = [...schedule.schedule];
        
        const startDate = new Date(schedule.startDate);
        const startDayNum = startDate.getDate();

        if (hasFullPayment) {
          const fullPaymentTx = emiTx.find(t => t.isFullEmiPayment);
          const paymentDate = fullPaymentTx?.date || '';
          newSchedule.forEach((entry, index) => {
            newStatus[index + 1] = true;
            newSchedule[index] = { ...entry, paymentDate };
          });
        } else {
          newSchedule.forEach((entry, index) => {
            const tx = emiTx[index];
            if (tx) {
              newStatus[index + 1] = true;
              newSchedule[index] = { ...entry, paymentDate: tx.date };
            } else {
              newStatus[index + 1] = false;
              // Re-calculate planned date for this month
              const plannedDate = new Date(startDate);
              plannedDate.setMonth(startDate.getMonth() + (index + 1));
              // Adjust for month end if needed
              if (plannedDate.getDate() !== startDayNum) plannedDate.setDate(0);
              newSchedule[index] = { ...entry, paymentDate: formatDateToYYYYMMDD(plannedDate) };
            }
          });
        }
        
        // Only update if something changed
        const paidCount = Object.values(newStatus).filter(Boolean).length;
        const totalCount = newSchedule.length;
        const isClosed = paidCount === totalCount && totalCount > 0;
        
        let updatedGreeting = schedule.completionGreeting;
        if (!isClosed) {
            updatedGreeting = null;
        } else if (isClosed && !updatedGreeting) {
            updatedGreeting = `Hooray! You have officially cleared your ${schedule.loanName} on ${new Date().toLocaleDateString('en-IN')}. Your financial discipline has paid off!`;
        }

        const statusChanged = JSON.stringify(newStatus) !== JSON.stringify(schedule.paymentStatus);
        const scheduleChanged = JSON.stringify(newSchedule) !== JSON.stringify(schedule.schedule);
        const greetingChanged = updatedGreeting !== schedule.completionGreeting;
        
        if (!statusChanged && !scheduleChanged && !greetingChanged) return prev;

        const updated = [...prev];
        updated[scheduleIndex] = { ...schedule, paymentStatus: newStatus, schedule: newSchedule, completionGreeting: updatedGreeting };
        return updated;
      }
      return prev;
    });
  }, [setSavedAmortizationSchedules]);

  // Sync all EMI schedules when transactions change or on mount
  useEffect(() => {
    const activeSchedules = safeSavedAmortizationSchedules.filter(s => !s.isDeleted);
    activeSchedules.forEach(s => {
      syncEmiSchedule(s.id, safeTransactions);
    });
  }, [safeTransactions, safeSavedAmortizationSchedules.length, syncEmiSchedule]);

  const renderOverlayContent = () => {
    if (!floatingOverlayContent) return null;

    switch (floatingOverlayContent.type) {
      case 'passbook':
        return (
          <PassbookView 
            transactions={currentPeriodTransactions} 
            activeAccount={safeAccounts.find(a => a.id === activeAccountId)} 
            appTitle={appTitle} 
            openingBalance={openingBalanceForPassbook} 
            periodLabel={activePeriodLabel} 
          />
        );
      case 'vault_item':
        const item = floatingOverlayContent.data as VaultItem;
        return (
          <div className="flex items-center justify-center p-4">
            {item.mimeType.startsWith('image/') ? (
              <img src={item.dataUrl} alt={item.name} className="max-w-full h-auto rounded-lg shadow-lg" />
            ) : item.mimeType === 'application/pdf' ? (
              <iframe src={item.dataUrl} className="w-full h-[500px] border-0 rounded-lg" title={item.name} />
            ) : (
              <div className="flex flex-col items-center gap-4 py-10">
                <DocumentChartBarIcon className="w-20 h-20 text-slate-300" />
                <p className="text-sm text-slate-500">Preview not available for this file type.</p>
                <a href={item.dataUrl} download={item.name} className="px-4 py-2 bg-brand-primary text-white rounded-lg text-xs font-bold uppercase tracking-widest">Download</a>
              </div>
            )}
          </div>
        );
      case 'mini_statement':
        return (
          <MiniStatement 
            transactions={currentPeriodTransactions} 
            accountName={safeAccounts.find(a => a.id === activeAccountId)?.name} 
            appTitle={appTitle} 
          />
        );
      case 'reports_dashboard':
        return (
          <ReportsDashboard 
            transactions={safeTransactions} 
            accounts={safeAccounts} 
            activeAccount={safeAccounts.find(a => a.id === activeAccountId)} 
            incomeCategories={incomeCategoriesList} 
            expenseCategories={expenseCategories} 
            financialMonthStartDay={financialMonthStartDay} 
            financialMonthEndDay={financialMonthEndDay} 
            budgetSettings={safeBudgetSettings} 
            appTitle={appTitle} 
            attendanceEntries={safeAttendanceEntries} 
          />
        );
      case 'todo_list':
        return (
          <TodoListComponent 
            todos={safeTodos.filter(t => !t.isDeleted)} 
            onAddTodo={handleAddTodo} 
            onEditTodo={handleEditTodo}
            onToggleComplete={handleToggleTodoComplete} 
            onDeleteTodo={handleDeleteTodo} 
          />
        );
      case 'day_planner':
        return (
          <DayPlannerComponent 
            entries={safeDayPlannerEntries.filter(e => !e.isDeleted)} 
            onAddEntry={handleAddDayPlannerEntry} 
            onEditEntry={handleEditDayPlannerEntry} 
            onToggleComplete={handleToggleDayPlannerComplete} 
            onDeleteEntry={handleDeleteDayPlannerEntry} 
            appTitle={appTitle} 
          />
        );
      case 'emi_calendar':
        return (
          <EmiCalendarView 
            schedules={safeSavedAmortizationSchedules} 
          />
        );
      default:
        return null;
    }
  };

  const addTransactionHandler = useCallback((data: any) => {
    const txId = crypto.randomUUID();
    let couponIncomeId: string | undefined;
    const newTransactions: Transaction[] = [...(transactions ?? [])];
    
    // If coupon is used, create a linked income transaction
    if (data.type === TransactionType.EXPENSE && data.couponUsed && data.couponUsed > 0) {
      couponIncomeId = crypto.randomUUID();
      const incomeTx: Transaction = {
        id: couponIncomeId,
        accountId: data.accountId || activeAccountId || 'default',
        type: TransactionType.INCOME,
        category: IncomeCategory.UPI_TRANSFER,
        amount: data.couponUsed,
        date: data.date,
        description: `Coupon Discount for ${data.description || 'Expense'}`,
        isDeleted: false,
        createdAt: new Date().toISOString()
      };
      newTransactions.push(incomeTx);
    }

    const newTx = { ...data, id: txId, couponIncomeId, isDeleted: false, createdAt: new Date().toISOString() };
    newTransactions.push(newTx);
    
    setTransactions(newTransactions);
    
    if (data.type === TransactionType.EXPENSE && data.category === ExpenseCategory.MOBILE && data.validityDays) {
      syncRechargeTracker(data.description, newTransactions);
      addToast('Transaction recorded and Recharge Tracker updated.', 'success');
    } else if (data.type === TransactionType.EXPENSE && data.category === ExpenseCategory.EMI && data.emiId) {
      syncEmiSchedule(data.emiId, newTransactions);
      
      // Trigger Success Modal
      const currentSchedules = savedAmortizationSchedules || [];
      const schedule = currentSchedules.find(s => s.id === data.emiId);
      if (schedule) {
        setEmiSuccessData({
          schedule: schedule,
          amount: data.amount,
          isFullPayment: !!data.isFullEmiPayment
        });
      }
      
      addToast(data.isFullEmiPayment ? 'Loan fully paid and Dashboard updated.' : 'EMI payment recorded and Dashboard updated.', 'success');
    } else {
      addToast('Transaction recorded.', 'success');
    }
  }, [addToast, setTransactions, transactions, syncRechargeTracker, syncEmiSchedule, activeAccountId, savedAmortizationSchedules]);

  const handleDateRangeChange = useCallback((s: string | null, e: string | null, label: FilterPeriod) => {
    setDashboardStartDate(s);
    setDashboardEndDate(e);
    setActivePeriodLabel(label);
  }, []);

  const handleLoadSchedule = useCallback((id: string) => {
    const found = safeSavedAmortizationSchedules.find(s => s.id === id);
    if (found) {
      setScheduleToEdit(found);
      handleShowSection('amortizationSchedule');
    }
  }, [safeSavedAmortizationSchedules, handleShowSection]);

  const handleDeleteSchedule = useCallback((id: string) => {
    setSavedAmortizationSchedules(prev => (prev || []).map(s => s.id === id ? { ...s, isDeleted: true, deletedAt: new Date().toISOString() } : s));
    addToast("Loan schedule moved to recycle bin.", "info");
  }, [setSavedAmortizationSchedules, addToast]);

  const handleDeleteRechargePlan = useCallback((id: string) => {
    setRechargePlans(prev => (prev || []).map(p => p.id === id ? { ...p, isDeleted: true, deletedAt: new Date().toISOString() } : p));
    addToast("Recharge plan moved to recycle bin.", "info");
  }, [setRechargePlans, addToast]);

  const handleEditRechargePlan = useCallback((id: string, updates: Partial<Omit<RechargePlan, 'id'>>) => {
    setRechargePlans(prev => (prev || []).map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates };
        // Recalculate nextDueDate if lastRechargeDate or validityDays changed
        if (updates.lastRechargeDate || updates.validityDays) {
          const nextDueDateObj = new Date(updated.lastRechargeDate);
          nextDueDateObj.setDate(nextDueDateObj.getDate() + updated.validityDays);
          updated.nextDueDate = nextDueDateObj.toISOString().split('T')[0];
        }
        return updated;
      }
      return p;
    }));
    addToast("Recharge plan updated.", "success");
  }, [setRechargePlans, addToast]);

  const handleAddRechargePlan = useCallback((plan: Omit<RechargePlan, 'id' | 'accountId' | 'nextDueDate' | 'isDeleted' | 'deletedAt'>) => {
    const nextDueDateObj = new Date(plan.lastRechargeDate);
    nextDueDateObj.setDate(nextDueDateObj.getDate() + plan.validityDays);
    const nextDueDate = nextDueDateObj.toISOString().split('T')[0];

    const newPlan: RechargePlan = {
      ...plan,
      id: crypto.randomUUID(),
      accountId: activeAccountId || 'default',
      nextDueDate: nextDueDate,
      isDeleted: false
    };
    setRechargePlans(prev => [...prev, newPlan]);
    addToast("Recharge plan added.", "success");
  }, [setRechargePlans, activeAccountId, addToast]);

  const handleImportTransactions = useCallback((importedTransactions: AddTransactionFormPayload[]) => {
      const newTransactions: Transaction[] = importedTransactions.map(payload => ({
          ...payload,
          id: crypto.randomUUID(),
          accountId: (payload as any).accountId || activeAccountId || 'default',
          isDeleted: false
      })) as Transaction[];

      const updatedTransactions = [...(transactions || []), ...newTransactions];
      setTransactions(updatedTransactions);
      
      // Sync recharge tracker for any imported mobile transactions
      const mobileProviders = new Set(newTransactions
        .filter(t => t.type === TransactionType.EXPENSE && t.category === ExpenseCategory.MOBILE)
        .map(t => t.description)
      );
      mobileProviders.forEach(provider => {
        syncRechargeTracker(provider, updatedTransactions);
      });

      addToast(`Successfully imported ${newTransactions.length} transactions.`, "success");
      handleShowSection('history'); 
  }, [activeAccountId, transactions, syncRechargeTracker, setTransactions, addToast, handleShowSection]);

  const handleSetBudget = useCallback((newBudget: BudgetSetting) => {
    setBudgetSettings(prev => {
      const existingIndex = (prev ?? []).findIndex(b => 
        b.accountId === newBudget.accountId && 
        b.category === newBudget.category && 
        b.period === newBudget.period && 
        b.periodIdentifier === newBudget.periodIdentifier
      );
      
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = newBudget;
        return updated;
      }
      return [...(prev ?? []), newBudget];
    });
  }, [setBudgetSettings]);

  const handleDeleteBudget = useCallback((category: string, period: BudgetPeriod, identifier: string, accountId: string) => {
    setBudgetSettings(prev => (prev ?? []).filter(b => 
      !(b.category === category && b.period === period && b.periodIdentifier === identifier && b.accountId === accountId)
    ));
  }, [setBudgetSettings]);

  const handleAddIncomeCategory = useCallback((name: string) => {
    setIncomeCategoriesList(prev => [...(prev || []), name]);
  }, [setIncomeCategoriesList]);

  const handleEditIncomeCategory = useCallback((oldName: string, newName: string) => {
    setIncomeCategoriesList(prev => (prev || []).map(c => c === oldName ? newName : c));
  }, [setIncomeCategoriesList]);

  const handleDeleteIncomeCategory = useCallback((name: string) => {
    setIncomeCategoriesList(prev => (prev || []).filter(c => c !== name));
  }, [setIncomeCategoriesList]);

  const handleAddExpenseCategory = useCallback((name: string) => {
    setExpenseCategories(prev => [...(prev || []), name]);
  }, [setExpenseCategories]);

  const handleEditExpenseCategory = useCallback((oldName: string, newName: string) => {
    setExpenseCategories(prev => (prev || []).map(c => c === oldName ? newName : c));
  }, [setExpenseCategories]);

  const handleDeleteExpenseCategory = useCallback((name: string) => {
    setExpenseCategories(prev => (prev || []).filter(c => c !== name));
  }, [setExpenseCategories]);

  const handleUpdateTransaction = useCallback((updatedTx: Transaction) => {
    const safeTxList = transactions || [];
    const oldTx = safeTxList.find(t => t.id === updatedTx.id);
    
    let nextTransactions = [...safeTxList];
    let finalUpdatedTx = { ...updatedTx };

    // Handle linked coupon income
    if (updatedTx.type === TransactionType.EXPENSE) {
      const oldCouponIncomeId = oldTx?.couponIncomeId;
      const newCouponUsed = updatedTx.couponUsed || 0;

      if (newCouponUsed > 0) {
        if (oldCouponIncomeId) {
          // Update existing income
          nextTransactions = nextTransactions.map(t => 
            t.id === oldCouponIncomeId 
              ? { ...t, amount: newCouponUsed, date: updatedTx.date, description: `Coupon Discount for ${updatedTx.description || 'Expense'}` } 
              : t
          );
        } else {
          // Create new income
          const newIncomeId = crypto.randomUUID();
          const incomeTx: Transaction = {
            id: newIncomeId,
            accountId: updatedTx.accountId || activeAccountId || 'default',
            type: TransactionType.INCOME,
            category: IncomeCategory.UPI_TRANSFER,
            amount: newCouponUsed,
            date: updatedTx.date,
            description: `Coupon Discount for ${updatedTx.description || 'Expense'}`,
            isDeleted: false,
            createdAt: new Date().toISOString()
          };
          nextTransactions.push(incomeTx);
          finalUpdatedTx.couponIncomeId = newIncomeId;
        }
      } else if (oldCouponIncomeId) {
        // Delete existing income if coupon is removed
        nextTransactions = nextTransactions.map(t => 
          t.id === oldCouponIncomeId 
            ? { ...t, isDeleted: true, deletedAt: new Date().toISOString() } 
            : t
        );
        finalUpdatedTx.couponIncomeId = undefined;
      }
    }

    const newTransactions = nextTransactions.map(t => t.id === finalUpdatedTx.id ? finalUpdatedTx : t);
    setTransactions(newTransactions);
    
    if (finalUpdatedTx.type === TransactionType.EXPENSE && finalUpdatedTx.category === ExpenseCategory.MOBILE && finalUpdatedTx.validityDays) {
      syncRechargeTracker(finalUpdatedTx.description, newTransactions);
    } else if (oldTx?.category === ExpenseCategory.MOBILE) {
      // If category changed from MOBILE, sync the old provider
      syncRechargeTracker(oldTx.description, newTransactions);
    }

    // Sync EMI payment status if needed
    const emiIdToSync = finalUpdatedTx.emiId || oldTx?.emiId;
    if (emiIdToSync && (finalUpdatedTx.category === ExpenseCategory.EMI || oldTx?.category === ExpenseCategory.EMI)) {
        syncEmiSchedule(emiIdToSync, newTransactions);
    }

    addToast("Transaction updated.", "success");
  }, [setTransactions, transactions, syncRechargeTracker, syncEmiSchedule, setRechargePlans, activeAccountId, addToast, setSavedAmortizationSchedules]);

  const handleDeleteTransaction = useCallback((id: string) => {
    const safeTxList = transactions || [];
    const txToDelete = safeTxList.find(t => t.id === id);
    
    let nextTransactions = safeTxList.map(t => t.id === id ? { ...t, isDeleted: true, deletedAt: new Date().toISOString() } : t);
    
    // If it has a linked coupon income, delete that too
    if (txToDelete?.couponIncomeId) {
      nextTransactions = nextTransactions.map(t => 
        t.id === txToDelete.couponIncomeId 
          ? { ...t, isDeleted: true, deletedAt: new Date().toISOString() } 
          : t
      );
    }

    setTransactions(nextTransactions);

    if (txToDelete && txToDelete.category === ExpenseCategory.MOBILE) {
        syncRechargeTracker(txToDelete.description, nextTransactions);
    }

    if (txToDelete && txToDelete.category === ExpenseCategory.EMI && txToDelete.emiId) {
        syncEmiSchedule(txToDelete.emiId, nextTransactions);
    }

    addToast("Transaction deleted.", "success");
  }, [setTransactions, transactions, syncRechargeTracker, syncEmiSchedule, addToast, setSavedAmortizationSchedules]);

  // --- Todo Handlers ---
  const handleAddTodo = useCallback((text: string, reminderDateTime: string | null) => {
    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      accountId: activeAccountId || 'default',
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      reminderDateTime,
      isDeleted: false
    };
    setTodos(prev => [...(prev || []), newTodo]);
    addToast("To-do item added.", "success");
  }, [setTodos, addToast]);

  const handleEditTodo = useCallback((id: string, updates: { text: string; reminderDateTime: string | null }) => {
    setTodos(prev => (prev || []).map(t => t.id === id ? { ...t, ...updates } : t));
    addToast("To-do item updated.", "success");
  }, [setTodos, addToast]);

  const handleToggleTodoComplete = useCallback((id: string) => {
    setTodos(prev => (prev || []).map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, [setTodos]);

  const handleDeleteTodo = useCallback((id: string) => {
    setTodos(prev => (prev || []).map(t => t.id === id ? { ...t, isDeleted: true, deletedAt: new Date().toISOString() } : t));
    addToast("To-do item moved to recycle bin.", "info");
  }, [setTodos, addToast]);

  // --- Day Planner Handlers ---
  const handleAddDayPlannerEntry = useCallback((entryData: Omit<DayPlannerEntry, 'id' | 'accountId' | 'completed' | 'createdAt' | 'isDeleted' | 'deletedAt'>) => {
    const newEntry: DayPlannerEntry = {
      ...entryData,
      id: crypto.randomUUID(),
      accountId: activeAccountId || 'default',
      completed: false,
      createdAt: new Date().toISOString(),
      isDeleted: false
    };
    setDayPlannerEntries(prev => [...(prev || []), newEntry]);
    addToast("Planner entry added.", "success");
  }, [setDayPlannerEntries, activeAccountId, addToast]);

  const handleEditDayPlannerEntry = useCallback((id: string, updates: Partial<Omit<DayPlannerEntry, 'id' | 'createdAt'>>) => {
    setDayPlannerEntries(prev => (prev || []).map(e => e.id === id ? { ...e, ...updates } : e));
    addToast("Planner entry updated.", "success");
  }, [setDayPlannerEntries, addToast]);

  const handleToggleDayPlannerComplete = useCallback((id: string) => {
    setDayPlannerEntries(prev => (prev || []).map(e => e.id === id ? { ...e, completed: !e.completed } : e));
  }, [setDayPlannerEntries]);

  const handleDeleteDayPlannerEntry = useCallback((id: string) => {
    setDayPlannerEntries(prev => (prev || []).map(e => e.id === id ? { ...e, isDeleted: true, deletedAt: new Date().toISOString() } : e));
    addToast("Planner entry moved to recycle bin.", "info");
  }, [setDayPlannerEntries, addToast]);

  // --- Subscription Handlers ---
  const handleAddSubscriptionPlan = useCallback((plan: Omit<SubscriptionPlan, 'id' | 'accountId' | 'nextDueDate' | 'isDeleted' | 'deletedAt'>) => {
    const newPlan: SubscriptionPlan = {
      ...plan,
      id: crypto.randomUUID(),
      accountId: activeAccountId || 'default',
      nextDueDate: new Date(Date.now() + plan.validityDays * 24 * 60 * 60 * 1000).toISOString(),
      isDeleted: false
    };
    setSubscriptionPlans(prev => [...(prev || []), newPlan]);
    addToast("Subscription plan added.", "success");
  }, [setSubscriptionPlans, activeAccountId, addToast]);

  const handleEditSubscriptionPlan = useCallback((id: string, updates: Partial<Omit<SubscriptionPlan, 'id'>>) => {
    setSubscriptionPlans(prev => (prev || []).map(p => p.id === id ? { ...p, ...updates } : p));
    addToast("Subscription plan updated.", "success");
  }, [setSubscriptionPlans, addToast]);

  const handleDeleteSubscriptionPlan = useCallback((id: string) => {
    setSubscriptionPlans(prev => (prev || []).map(p => p.id === id ? { ...p, isDeleted: true, deletedAt: new Date().toISOString() } : p));
    addToast("Subscription plan moved to recycle bin.", "info");
  }, [setSubscriptionPlans, addToast]);

  // --- Menu Item Handlers ---
  const handleAddMenuItem = useCallback((accountId: string, name: string, price: number) => {
    const newItem: MenuItem = {
      id: crypto.randomUUID(),
      accountId,
      name,
      price,
      isDeleted: false
    };
    setMenuItems(prev => [...(prev || []), newItem]);
    addToast("Menu item added.", "success");
  }, [setMenuItems, addToast]);

  const handleEditMenuItem = useCallback((id: string, updates: Partial<Omit<MenuItem, 'id' | 'accountId'>>) => {
    setMenuItems(prev => (prev || []).map(m => m.id === id ? { ...m, ...updates } : m));
    addToast("Menu item updated.", "success");
  }, [setMenuItems, addToast]);

  const handleDeleteMenuItem = useCallback((id: string) => {
    setMenuItems(prev => (prev || []).map(m => m.id === id ? { ...m, isDeleted: true, deletedAt: new Date().toISOString() } : m));
    addToast("Menu item moved to recycle bin.", "info");
  }, [setMenuItems, addToast]);

  // --- User Management Handlers ---
  const handleAddUser = useCallback((username: string, pass: string): boolean => {
    if (userCredentials.some(u => u.username === username && !u.isDeleted)) {
      return false;
    }
    const newUser: UserCredential = {
      id: crypto.randomUUID(),
      username,
      password: pass,
      role: Role.USER,
      isDeleted: false
    };
    setUserCredentials(prev => [...(prev || []), newUser]);
    addToast(`User "${username}" added.`, "success");
    return true;
  }, [userCredentials, setUserCredentials, addToast]);

  const handleEditUserPassword = useCallback((userId: string, newPassword: string): boolean => {
    setUserCredentials(prev => (prev || []).map(u => u.id === userId ? { ...u, password: newPassword } : u));
    addToast("User password updated.", "success");
    return true;
  }, [setUserCredentials, addToast]);

  const handleDeleteUser = useCallback((userId: string) => {
    setUserCredentials(prev => (prev || []).map(u => u.id === userId ? { ...u, isDeleted: true, deletedAt: new Date().toISOString() } : u));
    addToast("User moved to recycle bin.", "info");
  }, [setUserCredentials, addToast]);

  // --- Vault Handlers ---
  const handleAddVaultItem = useCallback((name: string, dataUrl: string, mimeType: string, isPrivate: boolean) => {
    const newItem: VaultItem = {
      id: crypto.randomUUID(),
      name,
      dataUrl,
      mimeType,
      isPrivate,
      date: new Date().toISOString(),
      isDeleted: false
    };
    setVaultItems(prev => [...(prev || []), newItem]);
    addToast("Document added to vault.", "success");
  }, [setVaultItems, addToast]);

  const handleDeleteVaultItem = useCallback((id: string) => {
    setVaultItems(prev => (prev || []).map(v => v.id === id ? { ...v, isDeleted: true, deletedAt: new Date().toISOString() } : v));
    addToast("Document moved to recycle bin.", "info");
  }, [setVaultItems, addToast]);

  // --- Salary Deduction Handlers ---
  const handleAddSalaryDeduction = useCallback((deduction: Omit<SalaryDeduction, 'id'>) => {
    const newDeduction: SalaryDeduction = {
      ...deduction,
      id: crypto.randomUUID()
    };
    setSalaryDeductions(prev => [...(prev || []), newDeduction]);
    addToast("Salary deduction added.", "success");
  }, [setSalaryDeductions, addToast]);

  const handleDeleteSalaryDeduction = useCallback((id: string) => {
    setSalaryDeductions(prev => (prev || []).filter(d => d.id !== id));
    addToast("Salary deduction deleted.", "success");
  }, [setSalaryDeductions, addToast]);

  // --- Festive Date Handlers ---
  const handleAddFestiveDate = useCallback((festive: Omit<FestiveDate, 'id'>) => {
    const newFestive: FestiveDate = {
      ...festive,
      id: crypto.randomUUID()
    };
    setFestiveDates(prev => [...(prev || []), newFestive]);
    addToast("Festive date added.", "success");
  }, [setFestiveDates, addToast]);

  const handleDeleteFestiveDate = useCallback((id: string) => {
    setFestiveDates(prev => (prev || []).filter(f => f.id !== id));
    addToast("Festive date deleted.", "success");
  }, [setFestiveDates, addToast]);

  const handleRestoreItem = useCallback((itemId: string, itemType: RecyclableItemType) => {
    switch (itemType) {
      case 'transaction': {
        const safeTxList = transactions || [];
        const txToRestore = safeTxList.find(t => t.id === itemId);
        const newTransactions = safeTxList.map(t => t.id === itemId ? { ...t, isDeleted: false, deletedAt: undefined } : t);
        setTransactions(newTransactions);
        
        if (txToRestore && txToRestore.category === ExpenseCategory.MOBILE) {
            syncRechargeTracker(txToRestore.description, newTransactions);
        }

        if (txToRestore && txToRestore.category === ExpenseCategory.EMI && txToRestore.emiId) {
            syncEmiSchedule(txToRestore.emiId, newTransactions);
        }
        break;
      }
      case 'account':
        setAccounts(prev => (prev || []).map(a => a.id === itemId ? { ...a, isDeleted: false, deletedAt: undefined } : a));
        break;
      case 'todoItem':
        setTodos(prev => (prev || []).map(t => t.id === itemId ? { ...t, isDeleted: false, deletedAt: null } : t));
        break;
      case 'dayPlannerEntry':
        setDayPlannerEntries(prev => (prev || []).map(e => e.id === itemId ? { ...e, isDeleted: false, deletedAt: null } : e));
        break;
      case 'subscriptionPlan':
        setSubscriptionPlans(prev => (prev || []).map(p => p.id === itemId ? { ...p, isDeleted: false, deletedAt: undefined } : p));
        break;
      case 'rechargePlan':
        setRechargePlans(prev => (prev || []).map(p => p.id === itemId ? { ...p, isDeleted: false, deletedAt: undefined } : p));
        break;
      case 'menuItem':
        setMenuItems(prev => (prev || []).map(m => m.id === itemId ? { ...m, isDeleted: false, deletedAt: undefined } : m));
        break;
      case 'vaultItem':
        setVaultItems(prev => (prev || []).map(v => v.id === itemId ? { ...v, isDeleted: false, deletedAt: undefined } : v));
        break;
      case 'userCredential':
        setUserCredentials(prev => (prev || []).map(u => u.id === itemId ? { ...u, isDeleted: false, deletedAt: undefined } : u));
        break;
      case 'schedule':
        setSavedAmortizationSchedules(prev => (prev || []).map(s => s.id === itemId ? { ...s, isDeleted: false, deletedAt: undefined } : s));
        break;
    }
    addToast("Item restored.", "success");
  }, [setTransactions, transactions, syncRechargeTracker, syncEmiSchedule, setAccounts, setTodos, setDayPlannerEntries, setSubscriptionPlans, setRechargePlans, setMenuItems, setVaultItems, setUserCredentials, setSavedAmortizationSchedules, addToast]);

  const handlePermanentlyDeleteItem = useCallback((itemId: string, itemType: RecyclableItemType) => {
    switch (itemType) {
      case 'transaction':
        setTransactions(prev => (prev || []).filter(t => t.id !== itemId));
        break;
      case 'account':
        setAccounts(prev => (prev || []).filter(a => a.id !== itemId));
        break;
      case 'todoItem':
        setTodos(prev => (prev || []).filter(t => t.id !== itemId));
        break;
      case 'dayPlannerEntry':
        setDayPlannerEntries(prev => (prev || []).filter(e => e.id !== itemId));
        break;
      case 'subscriptionPlan':
        setSubscriptionPlans(prev => (prev || []).filter(p => p.id !== itemId));
        break;
      case 'rechargePlan':
        setRechargePlans(prev => (prev || []).filter(p => p.id !== itemId));
        break;
      case 'menuItem':
        setMenuItems(prev => (prev || []).filter(m => m.id !== itemId));
        break;
      case 'vaultItem':
        setVaultItems(prev => (prev || []).filter(v => v.id !== itemId));
        break;
      case 'userCredential':
        setUserCredentials(prev => (prev || []).filter(u => u.id !== itemId));
        break;
      case 'schedule':
        setSavedAmortizationSchedules(prev => (prev || []).filter(s => s.id !== itemId));
        break;
    }
    addToast("Item permanently deleted.", "success");
  }, [setTransactions, setAccounts, setTodos, setDayPlannerEntries, setSubscriptionPlans, setRechargePlans, setMenuItems, setVaultItems, setUserCredentials, setSavedAmortizationSchedules, addToast]);

  const handleEmptyRecycleBin = useCallback((itemType: RecyclableItemType) => {
    switch (itemType) {
      case 'transaction':
        setTransactions(prev => (prev || []).filter(t => !t.isDeleted));
        break;
      case 'account':
        setAccounts(prev => (prev || []).filter(a => !a.isDeleted));
        break;
      case 'todoItem':
        setTodos(prev => (prev || []).filter(t => !t.isDeleted));
        break;
      case 'dayPlannerEntry':
        setDayPlannerEntries(prev => (prev || []).filter(e => !e.isDeleted));
        break;
      case 'subscriptionPlan':
        setSubscriptionPlans(prev => (prev || []).filter(p => !p.isDeleted));
        break;
      case 'rechargePlan':
        setRechargePlans(prev => (prev || []).filter(p => !p.isDeleted));
        break;
      case 'menuItem':
        setMenuItems(prev => (prev || []).filter(m => !m.isDeleted));
        break;
      case 'vaultItem':
        setVaultItems(prev => (prev || []).filter(v => !v.isDeleted));
        break;
      case 'userCredential':
        setUserCredentials(prev => (prev || []).filter(u => !u.isDeleted));
        break;
      case 'schedule':
        setSavedAmortizationSchedules(prev => (prev || []).filter(s => !s.isDeleted));
        break;
    }
    addToast("Recycle bin emptied.", "success");
  }, [setTransactions, setAccounts, setTodos, setDayPlannerEntries, setSubscriptionPlans, setRechargePlans, setMenuItems, setVaultItems, setUserCredentials, setSavedAmortizationSchedules, addToast]);

  const handleResetLiquidityBalances = useCallback(() => {
    setTransactions(prev => {
      const safePrev = prev || [];
      return safePrev.map(t => {
        // Just zero out the benefit fields, don't delete any transactions
        if (t.cashbackAmount || t.couponUsed) {
          return { ...t, cashbackAmount: 0, couponUsed: 0 };
        }
        return t;
      });
    });
    setInitialCashbackBalance(0);
    addToast("Liquidity counters (Cashback & Coupons) have been reset.", "success");
  }, [setTransactions, setInitialCashbackBalance, addToast]);

  const appSections: { key: SectionKey; modes: AppMode[]; component: React.ReactNode }[] = useMemo(() => [
      { key: 'form', modes: [AppMode.FINANCE], component: <TransactionForm addTransaction={addTransactionHandler} transactionToEdit={transactionToEdit} clearEdit={() => setTransactionToEdit(null)} incomeCategories={incomeCategoriesList} expenseCategories={expenseCategories} allTransactions={safeTransactions} suggestedTransactionToFill={suggestedTransactionToFill} clearSuggestedTransaction={() => setSuggestedTransactionToFill(null)} menuItems={safeMenuItems} onOpenCalendar={() => handleShowSection('financialCalendar')} onOpenBudgets={() => handleShowSection('budgets')} onOpenCharts={() => handleShowSection('charts')} onBack={() => handleShowSection('snapshot')} onTypeConfirmed={setIsTransactionTypeConfirmed} budgetSettings={safeBudgetSettings} financialMonthStartDay={financialMonthStartDay} financialMonthEndDay={financialMonthEndDay} accounts={safeAccounts} activeAccountId={activeAccountId} onSetBudget={handleSetBudget} onDeleteBudget={handleDeleteBudget} addToast={addToast} addExpenseCategory={handleAddExpenseCategory} addRecurringReminder={()=>{}} editTransaction={setTransactionToEdit} editTransfer={()=>{}} onDeleteTransaction={handleDeleteTransaction} onUpdateTransaction={handleUpdateTransaction} onOpenPassbook={() => handleShowSection('passbook')} emiSchedules={safeSavedAmortizationSchedules} totalCashbackBalance={totalCashbackBalance} appTitle={appTitle}/> },
    { key: 'history', modes: [AppMode.FINANCE], component: (
        <div className="space-y-4">
            <DateFilter onDateRangeChange={handleDateRangeChange} defaultPeriod={activePeriodLabel} financialMonthStartDay={financialMonthStartDay} financialMonthEndDay={financialMonthEndDay} financialYearStartMonth={financialYearStartMonth} financialYearStartDay={financialYearStartDay} financialYearEndMonth={financialYearEndMonth} financialYearEndDay={financialYearEndDay} activeMode={activeMode} />
            <TransactionList transactions={currentPeriodTransactions} onDeleteTransaction={handleDeleteTransaction} onEditTransaction={(tx) => { setTransactionToEdit(tx); handleShowSection('form'); }} onUpdateTransaction={handleUpdateTransaction} />
        </div>
    ) },
    { key: 'passbook', modes: [AppMode.FINANCE], component: (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <DateFilter onDateRangeChange={handleDateRangeChange} defaultPeriod={activePeriodLabel} financialMonthStartDay={financialMonthStartDay} financialMonthEndDay={financialMonthEndDay} financialYearStartMonth={financialYearStartMonth} financialYearStartDay={financialYearStartDay} financialYearEndMonth={financialYearEndMonth} financialYearEndDay={financialYearEndDay} activeMode={activeMode} />
                {overlaySettings.enabledFeatures.includes('passbook') && (
                  <button 
                    onClick={() => {
                      setFloatingOverlayContent({
                        type: 'passbook',
                        title: "Passbook View"
                      });
                      setIsFloatingOverlayOpen(true);
                    }}
                    className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary/20 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                  >
                    <ArrowsPointingOutIcon className="w-4 h-4" />
                    Pop Out
                  </button>
                )}
            </div>
            <PassbookView transactions={currentPeriodTransactions} activeAccount={safeAccounts.find(a => a.id === activeAccountId)} appTitle={appTitle} openingBalance={openingBalanceForPassbook} periodLabel={activePeriodLabel} />
        </div>
    ) },
    { key: 'financialCalendar', modes: [AppMode.FINANCE], component: <FinancialCalendarViewComponent transactions={safeTransactions.filter(t => !t.isDeleted && (!activeAccountId || t.accountId === activeAccountId))} formatCurrency={formatCurrency} financialMonthStartDay={financialMonthStartDay} financialMonthEndDay={financialMonthEndDay} onDateSelect={(date) => { setSuggestedTransactionToFill({ date }); handleShowSection('form'); }} onOpenDateDetails={(date) => { setSelectedDetailDate(date); setIsDetailModalOpen(true); }} onOpenDateDetailsForDownload={(date) => { setSelectedDetailDate(date); setIsDetailModalOpen(true); }} /> },
    { key: 'upiPayment', modes: [AppMode.FINANCE], component: <UpiPayment cashInHandBalance={activeAccountBalance} activeAccountName={activeAccount?.name || 'All Accounts'} totalCashbackBalance={totalCashbackBalance} totalCouponBalance={totalCouponsUsed} transactions={safeTransactions} onClose={() => handleShowSection('form' as SectionKey)} initialCashbackBalance={initialCashbackBalance} onUpdateInitialCashback={setInitialCashbackBalance} onShowBenefitReport={() => setIsBenefitPassbookOpen(true)} onResetBalances={handleResetLiquidityBalances} /> },
    { key: 'pdfImporter', modes: [AppMode.FINANCE], component: <TransactionImporter onImportTransactions={handleImportTransactions} incomeCategories={incomeCategoriesList} expenseCategories={expenseCategories} /> },
    { key: 'accountManagement', modes: [AppMode.FINANCE], component: <AccountManager transactions={safeTransactions} /> },
    { key: 'categoryManagement', modes: [AppMode.FINANCE], component: <CategoryManager incomeCategories={incomeCategoriesList} expenseCategories={expenseCategories} onAddIncomeCategory={handleAddIncomeCategory} onEditIncomeCategory={handleEditIncomeCategory} onDeleteIncomeCategory={handleDeleteIncomeCategory} onAddExpenseCategory={handleAddExpenseCategory} onEditExpenseCategory={handleEditExpenseCategory} onDeleteExpenseCategory={handleDeleteExpenseCategory} /> },
    { key: 'documentVault', modes: [AppMode.FINANCE], component: <DocumentVault vaultItems={safeVaultItems.filter(v => !v.isDeleted)} onAddItem={handleAddVaultItem} onDeleteItem={handleDeleteVaultItem} addToast={addToast} onUnlockRequest={(onSuccess) => onSuccess()} isVaultUnlocked={true} appPin={appPin} onPopOut={overlaySettings.enabledFeatures.includes('documentVault') ? (title, item) => { setFloatingOverlayContent({ type: 'vault_item', title, data: item }); setIsFloatingOverlayOpen(true); } : undefined} /> },
    { key: 'digitalIdVault', modes: [AppMode.FINANCE], component: <DigitalIDVault /> },
    { key: 'notificationHistory', modes: [AppMode.FINANCE], component: <NotificationHistory notifications={safeNotificationHistory} onClearHistory={() => setNotificationHistory([])} accounts={safeAccounts} upcomingPayments={[]} onViewSchedule={() => {}} appTitle={appTitle} />},
    { key: 'appLockSettings', modes: [AppMode.FINANCE, AppMode.ATTENDANCE, AppMode.EMI, AppMode.TODO], component: <AppLockSettings currentPin={appPin} onPinSet={setAppPin} onPinRemoved={() => setAppPin(null)} onPinChanged={(old, next) => { if(old === String(appPin)) { setAppPin(next); return true; } return false; }} addToast={addToast} username={loggedInUser?.username || 'Guest'} /> },
    { key: 'miniStatement', modes: [AppMode.FINANCE], component: (
      <div className="space-y-4">
        {overlaySettings.enabledFeatures.includes('miniStatement') && (
          <div className="flex justify-end">
            <button onClick={() => { setFloatingOverlayContent({ type: 'mini_statement', title: "Mini Statement" }); setIsFloatingOverlayOpen(true); }} className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary/20 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <ArrowsPointingOutIcon className="w-4 h-4" /> Pop Out
            </button>
          </div>
        )}
        <MiniStatement transactions={currentPeriodTransactions} accountName={safeAccounts.find(a => a.id === activeAccountId)?.name} appTitle={appTitle} />
      </div>
    ) },
    { key: 'budgets', modes: [AppMode.FINANCE], component: <BudgetManager budgetSettings={safeBudgetSettings} onSetBudget={handleSetBudget} onDeleteBudget={handleDeleteBudget} accounts={safeAccounts} activeAccountId={activeAccountId} expenseCategories={expenseCategories} transactions={safeTransactions} financialMonthStartDay={financialMonthStartDay} financialMonthEndDay={financialMonthEndDay} addExpenseCategory={(name) => setExpenseCategories(prev => [...prev, name])} addToast={addToast} onBack={() => handleShowSection('form')} /> },
    { key: 'reportsDashboard', modes: [AppMode.REPORTS], component: (
      <div className="space-y-4">
        {overlaySettings.enabledFeatures.includes('reportsDashboard') && (
          <div className="flex justify-end">
            <button onClick={() => { setFloatingOverlayContent({ type: 'reports_dashboard', title: "Reports Dashboard" }); setIsFloatingOverlayOpen(true); }} className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary/20 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <ArrowsPointingOutIcon className="w-4 h-4" /> Pop Out
            </button>
          </div>
        )}
        <ReportsDashboard transactions={safeTransactions} accounts={safeAccounts} activeAccount={safeAccounts.find(a => a.id === activeAccountId)} incomeCategories={incomeCategoriesList} expenseCategories={expenseCategories} financialMonthStartDay={financialMonthStartDay} financialMonthEndDay={financialMonthEndDay} budgetSettings={safeBudgetSettings} appTitle={appTitle} attendanceEntries={safeAttendanceEntries} />
      </div>
    ) },
    { key: 'accountSpecificSettings', modes: [AppMode.FINANCE], component: <AccountSpecificSettings accounts={safeAccounts.filter(a => !a.isDeleted)} accountSettings={accountSpecificSettings} onUpdateSettings={(id, settings) => setAccountSpecificSettings(prev => ({ ...prev, [id]: settings }))} addToast={addToast} /> },
    { key: 'charts', modes: [AppMode.FINANCE, AppMode.REPORTS], component: (
        <div className="space-y-4 sm:space-y-6">
            <BudgetPerformanceDashboard budgetSettings={safeBudgetSettings} transactions={safeTransactions.filter(t => !t.isDeleted && (!activeAccountId || t.accountId === activeAccountId))} expenseCategories={expenseCategories} financialMonthStartDay={financialMonthStartDay} financialMonthEndDay={financialMonthEndDay} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <BarChartComponent transactions={currentPeriodTransactions} />
                <LineChartComponent transactions={currentPeriodTransactions} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <PieChartComponent transactions={currentPeriodTransactions} expenseCategories={expenseCategories} />
                <IncomePieChartComponent transactions={currentPeriodTransactions} incomeCategories={incomeCategoriesList} />
            </div>
            <CategoryBarChartComponent transactions={currentPeriodTransactions} onBack={() => handleShowSection('snapshot')} onClose={() => handleShowSection('snapshot')} />
            <RepeatedTransactionsReport transactions={currentPeriodTransactions} />
        </div>
    ) },
    { key: 'monthlySummary', modes: [AppMode.FINANCE], component: <MonthlySummaryView transactions={safeTransactions.filter(t => !t.isDeleted)} accounts={safeAccounts.filter(a => !a.isDeleted)} activeAccountId={activeAccountId} incomeCategories={incomeCategoriesList} expenseCategories={expenseCategories} appTitle={appTitle} onEditTransaction={(tx) => { setTransactionToEdit(tx); handleShowSection('form'); }} onDeleteTransaction={handleDeleteTransaction} onUpdateTransaction={handleUpdateTransaction} /> },
    { key: 'attendanceList', modes: [AppMode.ATTENDANCE], component: <AttendanceListComponent attendanceEntries={safeAttendanceEntries} onSaveEntry={handleSaveAttendanceEntry} attendanceHistory={attendanceHistory} monthlyOffLimits={safeMonthlyOffLimits} /> },
    { key: 'attendanceView', modes: [AppMode.ATTENDANCE], component: <AttendanceViewComponent attendanceEntries={safeAttendanceEntries} /> },
    { key: 'attendanceReports', modes: [AppMode.ATTENDANCE, AppMode.REPORTS], component: <AttendanceReportComponent attendanceEntries={safeAttendanceEntries} attendanceStatuses={ATTENDANCE_STATUSES} appTitle={appTitle} /> },
    { key: 'attendanceCalendar', modes: [AppMode.ATTENDANCE], component: <AttendanceCalendarViewComponent attendanceEntries={safeAttendanceEntries} /> },
    { key: 'salaryReport', modes: [AppMode.ATTENDANCE, AppMode.REPORTS], component: <SalaryReportComponent monthlySalary={monthlySalary} attendanceEntries={safeAttendanceEntries} accounts={safeAccounts} appTitle={appTitle} salaryDeductions={safeSalaryDeductions} /> },
    { key: 'attendanceConfigReport', modes: [AppMode.ATTENDANCE], component: <AttendanceConfigReport monthlySalary={monthlySalary} selectedWeeklyOffDay={selectedWeeklyOffDay} monthlyOffLimits={safeMonthlyOffLimits} /> },
    { key: 'amortizationSchedule', modes: [AppMode.EMI], component: <AmortizationSchedule activeAccountId={activeAccountId} savedAmortizationSchedules={safeSavedAmortizationSchedules} setSavedAmortizationSchedules={setSavedAmortizationSchedules} addToast={addToast} scheduleToLoad={scheduleToEdit} clearLoadedSchedule={() => setScheduleToEdit(null)} /> },
    { key: 'emiDashboard', modes: [AppMode.EMI], component: <EmiDashboard schedules={safeSavedAmortizationSchedules} onLoadSchedule={handleLoadSchedule} onDeleteSchedule={handleDeleteSchedule} appTitle={appTitle} /> },
    { key: 'emiCalendar', modes: [AppMode.EMI], component: (
      <div className="space-y-4">
        {overlaySettings.enabledFeatures.includes('emiCalendar') && (
          <div className="flex justify-end">
            <button onClick={() => { setFloatingOverlayContent({ type: 'emi_calendar', title: "EMI Calendar" }); setIsFloatingOverlayOpen(true); }} className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary/20 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <ArrowsPointingOutIcon className="w-4 h-4" /> Pop Out
            </button>
          </div>
        )}
        <EmiCalendarView schedules={safeSavedAmortizationSchedules} />
      </div>
    ) },
    { key: 'todoList', modes: [AppMode.TODO], component: (
      <div className="space-y-4">
        {overlaySettings.enabledFeatures.includes('todoList') && (
          <div className="flex justify-end">
            <button onClick={() => { setFloatingOverlayContent({ type: 'todo_list', title: "Todo List" }); setIsFloatingOverlayOpen(true); }} className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary/20 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <ArrowsPointingOutIcon className="w-4 h-4" /> Pop Out
            </button>
          </div>
        )}
        <TodoListComponent todos={safeTodos.filter(t => !t.isDeleted)} onAddTodo={handleAddTodo} onEditTodo={handleEditTodo} onToggleComplete={handleToggleTodoComplete} onDeleteTodo={handleDeleteTodo} />
      </div>
    ) },
    { key: 'dayPlanner', modes: [AppMode.TODO], component: (
      <div className="space-y-4">
        {overlaySettings.enabledFeatures.includes('dayPlanner') && (
          <div className="flex justify-end">
            <button onClick={() => { setFloatingOverlayContent({ type: 'day_planner', title: "Day Planner" }); setIsFloatingOverlayOpen(true); }} className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary/20 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <ArrowsPointingOutIcon className="w-4 h-4" /> Pop Out
            </button>
          </div>
        )}
        <DayPlannerComponent entries={safeDayPlannerEntries.filter(e => !e.isDeleted)} onAddEntry={handleAddDayPlannerEntry} onEditEntry={handleEditDayPlannerEntry} onToggleComplete={handleToggleDayPlannerComplete} onDeleteEntry={handleDeleteDayPlannerEntry} appTitle={appTitle} />
      </div>
    ) },
    { key: 'horoscope', modes: [AppMode.TODO], component: <Horoscope /> },
    { key: 'subscriptionTracker', modes: [AppMode.TODO], component: <SubscriptionTracker subscriptionPlans={safeSubscriptionPlans.filter(p => !p.isDeleted)} onAddPlan={handleAddSubscriptionPlan} onEditPlan={handleEditSubscriptionPlan} onDeletePlan={handleDeleteSubscriptionPlan} addToast={addToast} appTitle={appTitle} /> },
    { key: 'rechargeTracker', modes: [AppMode.TODO], component: <RechargeTracker rechargePlans={safeRechargePlans} allTransactions={safeTransactions} onAddPlan={handleAddRechargePlan} onEditPlan={handleEditRechargePlan} onDeletePlan={handleDeleteRechargePlan} addToast={addToast} appTitle={appTitle} /> },
    { key: 'menuItemManagement', modes: [AppMode.TODO], component: <MenuItemManager menuItems={safeMenuItems.filter(m => !m.isDeleted)} onAddMenuItem={handleAddMenuItem} onEditMenuItem={handleEditMenuItem} onDeleteMenuItem={handleDeleteMenuItem} activeAccountId={activeAccountId} activeAccountName={safeAccounts.find(a => a.id === activeAccountId)?.name} appTitle={appTitle} addToast={addToast} /> },
    { key: 'userManual', modes: [AppMode.FINANCE, AppMode.ATTENDANCE, AppMode.EMI, AppMode.TODO], component: <UserManual appTitle={appTitle} /> },
    { key: 'userManagement', modes: [AppMode.FINANCE, AppMode.ATTENDANCE, AppMode.EMI, AppMode.TODO], component: <UserManagement users={safeUserCredentials.filter(u => !u.isDeleted && u.id !== 'admin')} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} onEditPassword={handleEditUserPassword} /> },
    { key: 'dataManagement', modes: [AppMode.FINANCE, AppMode.ATTENDANCE, AppMode.EMI, AppMode.TODO], component: <DataManagementComponent onExportAllData={handleExportAllData} onImportData={handleImportData} onClearAllData={handleClearAllData} addToast={addToast} /> },
    { key: 'appSettings', modes: [AppMode.FINANCE, AppMode.ATTENDANCE, AppMode.EMI, AppMode.TODO], component: <AppSettingsComponent appTitle={appTitle} setAppTitle={setAppTitle} customBrandColor={customBrandColor} setCustomBrandColor={setCustomBrandColor} monthlySalary={monthlySalary} onSetMonthlySalary={setMonthlySalary} selectedWeeklyOffDay={selectedWeeklyOffDay} onSetSelectedWeeklyOffDay={setSelectedWeeklyOffDay} monthlyOffLimits={safeMonthlyOffLimits} onSetMonthlyOffLimit={handleSetMonthlyOffLimit} financialMonthStartDay={financialMonthStartDay} onSetFinancialMonthStartDay={setFinancialMonthStartDay} financialMonthEndDay={financialMonthEndDay} onSetFinancialMonthEndDay={setFinancialMonthEndDay} financialYearStartMonth={financialYearStartMonth} financialYearStartDay={financialYearStartDay} financialYearEndMonth={financialYearEndMonth} financialYearEndDay={financialYearEndDay} onSetFinancialYear={handleSetFinancialYear} sessionTimeoutDurationSeconds={sessionTimeoutDurationSeconds} setSessionTimeoutDurationSeconds={setSessionTimeoutDurationSeconds} useDigitalFontForTimers={useDigitalFontForTimers} setUseDigitalFontForTimers={setUseDigitalFontForTimers} isDynamicIslandEnabled={false} onSetIsDynamicIslandEnabled={() => {}} defaultViews={defaultViews} onSetDefaultViews={setDefaultViews} defaultDashboardPeriod={'Daily'} onSetDefaultDashboardPeriod={() => {}} addToast={addToast} loggedInRole={loggedInRole} onChangeAdminPassword={() => true} autoBackupSettings={autoBackupSettings} setAutoBackupSettings={setAutoBackupSettings} lastBackupTimestamp={lastBackupTimestamp} onBackupNow={handleExportAllData} salaryDeductions={safeSalaryDeductions} onAddSalaryDeduction={handleAddSalaryDeduction} onDeleteSalaryDeduction={handleDeleteSalaryDeduction} festiveDates={safeFestiveDates} onAddFestiveDate={handleAddFestiveDate} onDeleteFestiveDate={handleDeleteFestiveDate} modeLayouts={modeLayouts} onSetModeLayouts={setModeLayouts} username={loggedInUser?.username || 'User'} overlaySettings={overlaySettings} onSetOverlaySettings={setOverlaySettings} /> },
    { key: 'recycleBin', modes: [AppMode.FINANCE, AppMode.ATTENDANCE, AppMode.EMI, AppMode.TODO], component: <RecycleBinComponent allTransactions={safeTransactions} allAccounts={safeAccounts} allSchedules={safeSavedAmortizationSchedules} allUserCredentials={safeUserCredentials} allTodos={safeTodos} allDayPlannerEntries={safeDayPlannerEntries} allSubscriptionPlans={safeSubscriptionPlans} allRechargePlans={safeRechargePlans} allMenuItems={safeMenuItems} allVaultItems={safeVaultItems} onRestoreItem={handleRestoreItem} onPermanentlyDeleteItem={handlePermanentlyDeleteItem} onEmptyRecycleBin={handleEmptyRecycleBin} loggedInRole={loggedInRole} /> },
    { key: 'viewRawLocalStorageTable', modes: [AppMode.FINANCE, AppMode.ATTENDANCE, AppMode.EMI, AppMode.TODO], component: <ViewRawLocalStorageTable /> },
    { key: 'snapshot', modes: [AppMode.FINANCE], component: <Dashboard accounts={safeAccounts} transactions={currentPeriodTransactions} activeAccount={safeAccounts.find(a => a.id === activeAccountId)} onEditTransaction={(tx) => { setTransactionToEdit(tx); handleShowSection('form'); }} budgetSettings={safeBudgetSettings} financialMonthStartDay={financialMonthStartDay} financialMonthEndDay={financialMonthEndDay} openingBalance={openingBalanceForPassbook} onShowSection={handleShowSection} /> }
  ], [safeTransactions, currentPeriodTransactions, safeAccounts, activeAccountId, safeMenuItems, suggestedTransactionToFill, transactionToEdit, scheduleToEdit, safeSavedAmortizationSchedules, safeTodos, safeDayPlannerEntries, safeAttendanceEntries, attendanceHistory, safeMonthlyOffLimits, monthlySalary, safeSalaryDeductions, safeSubscriptionPlans, safeRechargePlans, safeVaultItems, safeNotificationHistory, safeFestiveDates, safeUserCredentials, appTitle, customBrandColor, setAppTitle, setCustomBrandColor, addToast, addTransactionHandler, handleShowSection, selectedWeeklyOffDay, financialMonthStartDay, financialMonthEndDay, financialYearStartMonth, financialYearStartDay, financialYearEndMonth, financialYearEndDay, sessionTimeoutDurationSeconds, useDigitalFontForTimers, defaultViews, autoBackupSettings, handleSetMonthlyOffLimit, handleSetFinancialYear, loggedInRole, setMonthlySalary, setSelectedWeeklyOffDay, setFinancialMonthStartDay, setFinancialMonthEndDay, setSessionTimeoutDurationSeconds, setUseDigitalFontForTimers, setDefaultViews, setAutoBackupSettings, incomeCategoriesList, expenseCategories, accountSpecificSettings, handleExportAllData, handleImportData, handleClearAllData, handleResetLiquidityBalances, lastBackupTimestamp, handleLoadSchedule, handleDeleteSchedule, dashboardStartDate, dashboardEndDate, activePeriodLabel, openingBalanceForPassbook, handleImportTransactions, appPin, lockType, appPattern, handleRecoverLock, safeBudgetSettings, handleSetBudget, handleDeleteBudget, handleAddIncomeCategory, handleEditIncomeCategory, handleDeleteIncomeCategory, handleAddExpenseCategory, handleEditExpenseCategory, handleDeleteExpenseCategory, handleUpdateTransaction, handleDeleteTransaction, pagerIndex, setPagerIndex, overlaySettings, setOverlaySettings]);

  useEffect(() => {
    const update = () => {
        const now = new Date();
        setCurrentDateTimeString(now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' }));
        const h = now.getHours();
        if (h < 12) setCurrentGreeting(t('good_morning'));
        else if (h < 18) setCurrentGreeting(t('good_afternoon'));
        else setCurrentGreeting(t('good_evening'));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [t]);

  const handleUnlock = useCallback((secret: string) => {
      if (lockType === 'pin') {
          if (secret === String(appPin)) {
              setIsAppLocked(false);
              sessionEndTimeRef.current = Date.now() + sessionTimeoutDurationSeconds * 1000;
              return true;
          }
      } else {
          if (secret === String(appPattern)) {
              setIsAppLocked(false);
              sessionEndTimeRef.current = Date.now() + sessionTimeoutDurationSeconds * 1000;
              return true;
          }
      }
      return false;
  }, [lockType, appPin, appPattern, sessionTimeoutDurationSeconds]);

  if (!loggedInUser) return <LoginPage onLoginAttempt={handleLoginAttempt} appTitle={appTitle} />;
  if ((lockType === 'pin' ? !!appPin : !!appPattern) && isAppLocked) return <LockScreen onUnlock={handleUnlock} onRecover={handleRecoverLock} appTitle={appTitle} username={loggedInUser.username} />;

  const greetingParts = currentGreeting.split(' ');
  const greetingTop = greetingParts[0] || 'GOOD';
  const greetingBottom = greetingParts[1] || 'DAY';

  return (
    <AccountContext.Provider value={{ accounts: safeAccounts.filter(a => !a.isDeleted), allAccounts: safeAccounts, activeAccountId, setAccounts, setActiveAccountId: setActiveAccountIdState, addAccount, editAccount, deleteAccount, getAccountById: (id) => safeAccounts.find(a => a.id === id), activeAccount: safeAccounts.find(a => a.id === activeAccountId) }}>
      <div className="h-screen flex bg-bg-primary-themed overflow-hidden relative">
        <Sidebar 
            activeMode={activeMode} 
            onModeChange={handleModeChange}
            visibleSections={visibleSections} 
            showSection={handleShowSection} 
            onLogout={() => { auth.signOut(); setLoggedInUser(null); }} 
            appTitle={appTitle} 
            userName={loggedInUser.username}
            userRole={loggedInUser.role}
            loggedInRole={loggedInRole}
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            financialMonthStartDay={financialMonthStartDay}
            financialMonthEndDay={financialMonthEndDay}
            financialYearStartMonth={financialYearStartMonth}
            financialYearStartDay={financialYearStartDay}
            financialYearEndMonth={financialYearEndMonth}
            financialYearEndDay={financialYearEndDay}
            activeAccountId={activeAccountId}
            onAccountChange={setActiveAccountIdState}
            onAddAccountClick={() => { handleShowSection('accountManagement'); setIsMobileMenuOpen(false); }}
            transactions={safeTransactions}
            accounts={safeAccounts}
            isBalanceVisible={isBalanceVisible}
            setIsBalanceVisible={setIsBalanceVisible}
            formatCurrency={formatCurrency}
            attendanceEntries={safeAttendanceEntries}
            savedAmortizationSchedules={safeSavedAmortizationSchedules}
            todos={safeTodos}
            startDate={dashboardStartDate}
            endDate={dashboardEndDate}
        />

        <div className="flex-grow flex flex-col min-w-0 transition-all duration-500 overflow-hidden">
          {loggedInUser && (
            <div className="bg-bg-secondary-themed px-6 py-2 border-b border-border-primary flex justify-between items-center animate-fade-in overflow-hidden flex-shrink-0">
                <div className="flex items-center gap-4">
                    <span className="text-xl">
                        {new Date().getHours() < 12 ? '☀️' : new Date().getHours() < 18 ? '🌤️' : '🌙'}
                    </span>
                    <div>
                        <h2 className="text-sm font-black text-text-base-themed uppercase tracking-tight leading-none">
                            {currentGreeting}, {loggedInUser.username}!
                        </h2>
                        <p className="text-[9px] font-bold text-text-muted-themed uppercase tracking-widest mt-1 flex items-center gap-2">
                            <CalendarIcon className="w-3 h-3" />
                            {currentDateTimeString}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-[8px] font-black text-text-muted-themed uppercase tracking-widest">Active Mode</p>
                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-tighter">{activeMode}</p>
                    </div>
                    <ProfilePicture username={loggedInUser.username} size="w-8 h-8" />
                </div>
            </div>
          )}
          <header className="px-4 bg-bg-secondary-themed border-b border-border-primary flex justify-between items-center z-50 h-14 flex-shrink-0">
            <div className="flex items-center gap-4 h-full">
                <button 
                   onClick={() => setIsMobileMenuOpen(true)}
                   className="lg:hidden flex items-center justify-center h-[36px] w-[36px] rounded-xl bg-bg-secondary-themed border border-border-primary hover:bg-bg-accent-themed transition-all shadow-lg active:scale-95 flex-shrink-0"
                >
                   <ListBulletIcon className="w-6 h-6 text-white/70" />
                </button>
                <button 
                   onClick={() => setIsLeftSidebarVisible(!isLeftSidebarVisible)}
                   className="hidden lg:flex items-center justify-center h-[36px] w-[36px] rounded-xl bg-bg-secondary-themed border border-border-primary hover:bg-bg-accent-themed transition-all shadow-sm active:scale-95 flex-shrink-0"
                   title={isLeftSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
                >
                   {isLeftSidebarVisible ? <ChevronLeftIcon className="w-5 h-5 text-text-muted-themed" /> : <ChevronRightIcon className="w-5 h-5 text-text-muted-themed" />}
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
                        <BanknotesIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-black uppercase tracking-tighter text-text-base-themed truncate">{appTitle}</span>
                </div>
                
                <div className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-2xl bg-bg-secondary-themed border border-border-primary ml-6">
                {[
                  { mode: AppMode.FINANCE, icon: BanknotesIcon, label: t('finance') }, 
                  { mode: AppMode.ATTENDANCE, icon: UserGroupIcon, label: t('attendance') }, 
                  { mode: AppMode.EMI, icon: CalculatorIcon, label: t('emi_tools') }, 
                  { mode: AppMode.TODO, icon: ListChecksIcon, label: t('planner') }, 
                  { mode: AppMode.REPORTS, icon: DocumentChartBarIcon, label: 'Reports' },
                ].map(m => (
                    <button key={m.mode} onClick={() => handleModeChange(m.mode)} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ activeMode === m.mode ? 'bg-bg-primary-themed text-brand-primary shadow-md scale-105' : 'text-text-muted-themed hover:bg-bg-accent-themed' }`}>
                        <m.icon className={`w-4 h-4 ${activeMode === m.mode ? 'text-brand-primary' : ''}`} />
                        <span className="hidden xl:inline">{m.label}</span>
                    </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 h-full">
              <div className="flex items-center gap-2 h-full">
                  {sessionTimeLeft < sessionTimeoutDurationSeconds && (
                    <SessionTimerDisplay timeLeft={sessionTimeLeft} useDigitalFont={useDigitalFontForTimers} />
                  )}
                  <HeaderTimer useDigitalFont={useDigitalFontForTimers} />
                  <button 
                    onClick={() => setIsFloatingOverlayOpen(!isFloatingOverlayOpen)}
                    className={`p-2 rounded-xl transition-all ${isFloatingOverlayOpen ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-text-muted-themed hover:bg-bg-accent-themed'}`}
                    title="Toggle Floating Overlay"
                  >
                    <ArrowsPointingOutIcon className="w-5 h-5" />
                  </button>
                  <ReminderBell 
                    upcomingPayments={upcomingPayments} 
                    onViewEmiDashboard={() => { handleModeChange(AppMode.EMI); handleShowSection('emiDashboard'); }} 
                    onViewTodoList={() => { handleModeChange(AppMode.TODO); handleShowSection('todoList'); }} 
                    onViewDayPlanner={() => { handleModeChange(AppMode.TODO); handleShowSection('dayPlanner'); }} 
                    onViewSubscriptionTracker={() => { handleModeChange(AppMode.TODO); handleShowSection('subscriptionTracker'); }} 
                    onViewRechargeTracker={() => { handleModeChange(AppMode.TODO); handleShowSection('rechargeTracker'); }}
                    transactions={safeTransactions} 
                    recurringReminders={[]} 
                    savedAmortizationSchedules={safeSavedAmortizationSchedules} 
                    onViewHistory={() => { handleModeChange(AppMode.FINANCE); handleShowSection('notificationHistory'); }}
                  />
                  <HeaderMenu 
                    onLock={() => setIsAppLocked(true)} 
                    onLogout={() => { auth.signOut(); setLoggedInUser(null); }} 
                    hasPin={(lockType === 'pin' ? !!appPin : !!appPattern)} 
                    onShowSection={handleShowSection}
                    loggedInRole={loggedInRole}
                  />
              </div>
            </div>
          </header>
          <main className="flex-grow p-3 sm:p-6 overflow-y-auto no-scrollbar bg-bg-primary-themed">
             <div className="max-w-[1600px] mx-auto space-y-6">
                <div className={`grid gap-6 grid-cols-1 ${isLeftSidebarVisible ? 'lg:grid-cols-[18rem_1fr] xl:grid-cols-[20rem_1fr_24rem]' : 'lg:grid-cols-1 xl:grid-cols-[1fr_24rem]'}`}>
                    {/* Left Sidebar */}
                    {isLeftSidebarVisible && (
                        <div className="hidden lg:flex flex-col gap-6 overflow-y-auto no-scrollbar pb-6">
                            <div className="bg-bg-secondary-themed p-5 rounded-3xl border border-border-primary shadow-xl">
                                <p className="text-[10px] font-black text-text-muted-themed uppercase tracking-[0.2em] mb-4 px-1">Select Account</p>
                                <AccountSelector 
                                  selectedAccountId={activeAccountId}
                                  onAccountChange={setActiveAccountIdState}
                                  onAddAccountClick={() => { handleShowSection('accountManagement'); }}
                                />
                            </div>
                            <div className="bg-bg-secondary-themed p-2.5 rounded-3xl border border-border-primary shadow-xl">
                                <p className="text-[10px] font-black text-text-muted-themed uppercase tracking-[0.2em] my-4 px-4">Menu Actions</p>
                                <MenuTiles visibleSections={visibleSections} showSection={handleShowSection} loggedInRole={loggedInRole} userViewFeatureSettings={{}} userMenuGroupSettings={{}} activeMode={activeMode} activeAccountId={activeAccountId} accountSettings={accountSpecificSettings} />
                            </div>
                        </div>
                    )}

                    {/* Center Content */}
                    <div className="space-y-6 min-w-0">
                         <div className="block lg:hidden space-y-3 animate-fade-in" style={{ display: (visibleSections.has('form') && isTransactionTypeConfirmed) ? 'none' : undefined }}>
                             <div className="p-3 rounded-2xl bg-bg-secondary-themed border border-border-primary shadow-sm">
                                 <p className="text-[9px] font-black text-text-muted-themed uppercase tracking-[0.15em] mb-3 px-1 text-center">Navigation Mode</p>
                                 <div className="flex justify-between items-center gap-2 px-1 pb-1 overflow-x-auto no-scrollbar">
                                     {[
                                        { mode: AppMode.FINANCE, icon: BanknotesIcon, label: t('finance').substring(0, 3) },
                                        { mode: AppMode.ATTENDANCE, icon: UserGroupIcon, label: t('attendance').substring(0, 3) },
                                        { mode: AppMode.EMI, icon: CalculatorIcon, label: 'EMI' },
                                        { mode: AppMode.TODO, icon: ListChecksIcon, label: 'Plan' },
                                        { mode: AppMode.REPORTS, icon: DocumentChartBarIcon, label: 'Rep' },
                                     ].map(m => (
                                        <button 
                                            key={m.mode} 
                                            onClick={() => handleModeChange(m.mode)} 
                                            className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${activeMode === m.mode ? 'bg-brand-primary text-white shadow-lg scale-105' : 'text-text-muted-themed hover:bg-bg-accent-themed'}`}
                                        >
                                            <m.icon className={`w-5 h-5 mb-1 ${activeMode === m.mode ? 'text-white' : ''}`} />
                                            <span className="text-[8px] font-black uppercase tracking-tighter">{m.label}</span>
                                        </button>
                                     ))}
                                 </div>
                             </div>
                         </div>
                        {currentLayout.length > 0 && (currentLayout.some(p => visibleSections.has(p.sectionKey))) ? (
                            <HorizontalPager 
                                page={pagerIndex} 
                                onPageChange={(idx) => {
                                    const page = currentLayout[idx];
                                    if (page) {
                                        handleShowSection(page.sectionKey);
                                    }
                                }}
                            >
                                {currentLayout.map((page) => (
                                    <div key={page.id} className="animate-modal-enter">
                                        <div className={page.sectionKey === 'form' ? 'flex justify-center' : ''}>
                                            {page.sectionKey === 'form' ? (
                                                <div className="w-full max-w-2xl">
                                                    {appSections.find(s => s.key === 'form')?.component}
                                                </div>
                                            ) : (
                                                appSections.find(s => s.key === page.sectionKey)?.component
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </HorizontalPager>
                        ) : (
                            appSections.filter(s => s.modes.includes(activeMode) && visibleSections.has(s.key)).map(s => (
                                <div key={s.key} className={`animate-modal-enter ${s.key === 'form' ? 'flex justify-center' : ''}`}>
                                    {s.key === 'form' ? <div className="w-full max-w-2xl">{s.component}</div> : s.component}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="hidden xl:flex flex-col gap-6 overflow-y-auto no-scrollbar pb-6">
                        {activeMode !== AppMode.FINANCE && (
                          <>
                            <p className="text-[10px] font-black text-text-muted-themed uppercase tracking-[0.2em] px-1">Performance Snapshots</p>
                            <SnapshotsStack 
                              activeMode={activeMode} 
                              transactions={safeTransactions} 
                              accounts={safeAccounts} 
                              activeAccountId={activeAccountId} 
                              isBalanceVisible={isBalanceVisible} 
                              setIsBalanceVisible={setIsBalanceVisible} 
                              formatCurrency={formatCurrency} 
                              attendanceEntries={safeAttendanceEntries} 
                              savedAmortizationSchedules={safeSavedAmortizationSchedules} 
                              handleModeChange={handleModeChange} 
                              handleShowSection={handleShowSection} 
                              todos={safeTodos} 
                              startDate={null} 
                              endDate={null}
                              openingBalance={0}
                            />
                          </>
                        )}
                    </div>
                </div>
             </div>
          </main>
        </div>
        {toastInfo && <ToastNotification {...toastInfo} onClose={() => setToastInfo(null)} />}
        
        {/* Transaction Detail Modal for Calendar Drill-down */}
        {selectedDetailDate && (
            <TransactionDetailModal 
                isOpen={isDetailModalOpen} 
                onClose={() => setIsDetailModalOpen(false)} 
                date={selectedDetailDate} 
                transactions={safeTransactions.filter(t => t.date === selectedDetailDate && !t.isDeleted && (!activeAccountId || t.accountId === activeAccountId))} 
                accountName={safeAccounts.find(a => a.id === activeAccountId)?.name} 
                appTitle={appTitle} 
                showDownloadButton={true} 
                onAddTransaction={(date) => { setSuggestedTransactionToFill({ date }); handleShowSection('form'); setIsDetailModalOpen(false); }} 
            />
        )}

        {/* Calendar Modal */}
        {isCalendarModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-bg-secondary-themed w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden border border-border-primary animate-slide-up flex flex-col">
                    <div className="p-6 border-b border-border-primary flex justify-between items-center">
                        <h3 className="text-lg font-black text-text-base-themed uppercase tracking-tight">Financial Calendar</h3>
                        <button onClick={() => setIsCalendarModalOpen(false)} className="p-2 text-text-muted-themed hover:bg-bg-accent-themed rounded-full transition-colors">
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto">
                        <FinancialCalendarViewComponent transactions={safeTransactions.filter(t => !t.isDeleted && (!activeAccountId || t.accountId === activeAccountId))} formatCurrency={formatCurrency} financialMonthStartDay={financialMonthStartDay} financialMonthEndDay={financialMonthEndDay} onDateSelect={(date) => { setSuggestedTransactionToFill({ date }); setIsCalendarModalOpen(false); }} onOpenDateDetails={(date) => { setSelectedDetailDate(date); setIsDetailModalOpen(true); }} onOpenDateDetailsForDownload={(date) => { setSelectedDetailDate(date); setIsDetailModalOpen(true); }} />
                    </div>
                </div>
            </div>
        )}
      </div>
      <EmiSuccessModal 
        isOpen={!!emiSuccessData} 
        onClose={() => setEmiSuccessData(null)} 
        data={emiSuccessData} 
        formatCurrency={formatCurrency} 
      />
      {isBenefitPassbookOpen && (
        <BenefitPassbook 
          transactions={safeTransactions} 
          appTitle={appTitle} 
          initialCashback={initialCashbackBalance} 
          onClose={() => setIsBenefitPassbookOpen(false)} 
        />
      )}

      <FloatingOverlay 
        isOpen={isFloatingOverlayOpen} 
        onClose={() => setIsFloatingOverlayOpen(false)} 
        title={floatingOverlayContent?.title || "Floating Window"}
      >
        {renderOverlayContent() || (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center space-y-4">
            <ArrowsPointingOutIcon className="w-12 h-12 text-slate-200 dark:text-slate-800" />
            <p className="text-xs text-text-muted-themed font-medium max-w-[200px]">
              No content selected. Open Passbook, PDF, or Images to view them here.
            </p>
          </div>
        )}
      </FloatingOverlay>
    </AccountContext.Provider>
  );
};

export default App;
