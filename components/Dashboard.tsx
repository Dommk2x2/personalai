

import React, { useMemo } from 'react';
import { Account, Transaction, TransactionType, AttendanceEntry, AttendanceStatus, SectionKey, BudgetSetting, BudgetPeriod, TodoItem, RechargePlan, SubscriptionPlan, SavedAmortizationSchedule } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import UnifiedDashboardCalendar from './UnifiedDashboardCalendar';
import { 
  BanknotesIcon, 
  CreditCardIcon, 
  HistoryIcon,
  ChartIcon,
  TargetIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from './Icons';
import { formatDateDisplay, formatDateToYYYYMMDD, getCurrentPeriodIdentifier } from '../utils/dateUtils';
import { FilterPeriod } from './DateFilter';
import { WEEKDAY_OPTIONS } from '../constants';


interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
  attendanceEntries: AttendanceEntry[];
  schedules: SavedAmortizationSchedule[];
  todos: TodoItem[];
  rechargePlans: RechargePlan[];
  subscriptionPlans: SubscriptionPlan[];
  allTransactions: Transaction[];
  allAttendanceEntries: AttendanceEntry[];
  allSchedules: SavedAmortizationSchedule[];
  allTodos: TodoItem[];
  allRechargePlans: RechargePlan[];
  allSubscriptionPlans: SubscriptionPlan[];
  activeAccount: Account | undefined;
  onEditTransaction: (transaction: Transaction) => void;
  openingBalance: number;
  onShowSection: (section: SectionKey) => void;
  budgetSettings: BudgetSetting[];
  financialMonthStartDay: number;
  financialMonthEndDay: number;
  isBalanceVisible: boolean;
  setIsBalanceVisible: (visible: boolean) => void;
  startDate: string | null;
  endDate: string | null;
  formatCurrency: (amount: number) => string;
  onDateSelect: (date: string) => void;
  onOpenDateDetails: (date: string) => void;
  calendarDate: Date;
  onCalendarDateChange: (date: Date) => void;
  calendarViewMode: 'monthly' | 'yearly';
  onCalendarViewModeChange: (mode: 'monthly' | 'yearly') => void;
  primaryAccountId: string | null;
}

const SummaryCard: React.FC<{ title: string; value: string; icon: React.FC<any>; color: string; isBalanceVisible: boolean; onClick?: () => void; progress?: number; subtitle?: string }> = ({ title, value, icon: Icon, color, isBalanceVisible, onClick, progress, subtitle }) => (
  <div className={`bg-bg-secondary-themed p-4 sm:p-5 rounded-xl shadow-lg flex flex-col h-full transition-transform duration-300 hover:scale-105 hover:shadow-xl ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
    <div className="flex items-center mb-3">
      <div className="p-2.5 rounded-full mr-4" style={{ backgroundColor: `${color}20`}}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted-themed truncate">{title}</p>
        <p className="text-lg sm:text-xl font-black truncate" style={{ color }}>
          {isBalanceVisible ? value : '••••'}
        </p>
        {subtitle && <p className="text-[9px] font-bold text-text-muted-themed truncate mt-0.5">{subtitle}</p>}
      </div>
    </div>
    
progress !== undefined && (
      <div className="mt-auto pt-2">
        <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500" 
            style={{ 
              backgroundColor: color,
              width: `${Math.min(Math.max(0, progress), 100)}%`
            }} 
          />
        </div>
      </div>
    )
  </div>
);

const DashboardPanel: React.FC<{ title: string; icon: React.FC<any>; children: React.ReactNode; }> = ({ title, icon: Icon, children }) => (
  <div className="bg-bg-secondary-themed p-4 sm:p-5 rounded-xl shadow-lg h-full flex flex-col">
    <h3 className="text-md sm:text-lg font-semibold text-text-base-themed mb-3 flex items-center">
      <Icon className="w-5 h-5 mr-2 text-brand-primary" />
      {title}
    </h3>
    <div className="flex-grow">
      {children}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ 
    accounts, 
    transactions,
    attendanceEntries,
    schedules,
    todos,
    rechargePlans,
    subscriptionPlans,
    allTransactions,
    allAttendanceEntries,
    allSchedules,
    allTodos,
    allRechargePlans,
    allSubscriptionPlans,
    activeAccount,
    onEditTransaction,
    openingBalance,
    onShowSection,
    budgetSettings,
    financialMonthStartDay,
    financialMonthEndDay,
    isBalanceVisible,
    setIsBalanceVisible,
    startDate,
    endDate,
    formatCurrency,
    onDateSelect,
    onOpenDateDetails,
    calendarDate,
    onCalendarDateChange,
    calendarViewMode,
    onCalendarViewModeChange,
    primaryAccountId,
}) => {
  const { currentThemeColors } = useTheme();

  const { summary, recentTransactions, accountBalancesList, budgetSummary, perDayExpense, dateRangeLabel } = useMemo(() => {
    // Calculate Budget Summary for current period
    const currentPeriodId = getCurrentPeriodIdentifier(BudgetPeriod.MONTHLY, new Date(), financialMonthStartDay);
    const periodBudgets = (budgetSettings ?? []).filter(b => b.period === BudgetPeriod.MONTHLY && b.periodIdentifier === currentPeriodId);
    const totalBudgeted = periodBudgets.reduce((sum, b) => sum + (b.amount || 0), 0);
    const budgetedCategories = new Set(periodBudgets.map(b => b.category));

    // Calculate per day expense
    const start = startDate ? new Date(startDate + 'T00:00:00') : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate + 'T23:59:59') : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    const dateRange = `${formatDateDisplay(start.toISOString().split('T')[0])} - ${formatDateDisplay(end.toISOString().split('T')[0])}`;

    if (activeAccount) {
      // Single account view
      const accountTransactions = (transactions ?? []).filter(tx => tx.accountId === activeAccount.id && !tx.isDeleted);
      
      const balance = accountTransactions.reduce((sum, tx) => sum + (tx.type === 'income' ? tx.amount : -tx.amount), 0);
      const income = accountTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = accountTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      const budgetedExpenses = accountTransactions.filter(t => t.type === 'expense' && t.category && budgetedCategories.has(t.category)).reduce((sum, t) => sum + t.amount, 0);
      const unbudgetedExpenses = accountTransactions.filter(t => t.type === 'expense' && t.category && !budgetedCategories.has(t.category)).reduce((sum, t) => sum + t.amount, 0);

      return {
        summary: { netWorth: balance + openingBalance, allTimeIncome: income, allTimeExpenses: expenses },
        recentTransactions: accountTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
        accountBalancesList: [],
        budgetSummary: { totalBudgeted, budgetedExpenses, unbudgetedExpenses },
        perDayExpense: expenses / diffDays,
        dateRangeLabel: dateRange
      };
    } else {
      // "All Accounts" view
      const accountBalances = new Map<string, number>();
      (accounts ?? []).forEach(acc => accountBalances.set(acc.name, 0));

      let income = 0;
      let expenses = 0;
      let budgetedExpenses = 0;
      let unbudgetedExpenses = 0;

      (transactions ?? []).forEach(tx => {
        if (tx.isDeleted) return;
        const account = (accounts ?? []).find(a => a.id === tx.accountId);
        if (tx.type === TransactionType.INCOME) {
          income += tx.amount;
          if (account) accountBalances.set(account.name, (accountBalances.get(account.name) || 0) + tx.amount);
        } else if (tx.type === TransactionType.EXPENSE) {
          expenses += tx.amount;
          if (account) accountBalances.set(account.name, (accountBalances.get(account.name) || 0) - tx.amount);
          
          if (tx.category) {
            if (budgetedCategories.has(tx.category)) {
              budgetedExpenses += tx.amount;
            } else {
              unbudgetedExpenses += tx.amount;
            }
          }
        }
      });
      
      const totalNetWorth = Array.from(accountBalances.values()).reduce((sum, bal) => sum + bal, 0);

      return {
        summary: { netWorth: totalNetWorth + openingBalance, allTimeIncome: income, allTimeExpenses: expenses },
        recentTransactions: (transactions ?? []).filter(tx => !tx.isDeleted).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
        accountBalancesList: Array.from(accountBalances.entries()).sort((a, b) => b[1] - a[1]),
        budgetSummary: { totalBudgeted, budgetedExpenses, unbudgetedExpenses },
        perDayExpense: expenses / diffDays,
        dateRangeLabel: dateRange
      };
    }
  }, [accounts, transactions, activeAccount, openingBalance, budgetSettings, financialMonthStartDay, startDate, endDate]);
  
  const { filteredTransactions, filteredAttendance, filteredSchedules, filteredTodos, filteredRecharges, filteredSubscriptions } = useMemo(() => {
    // Determine if we are in a "Main" context (All Accounts OR account matches primaryAccountId)
    const isMainContext = !activeAccount || activeAccount.id === primaryAccountId;

    // Filter transactions by account if activeAccount is set
    const txs = activeAccount 
      ? allTransactions.filter(tx => tx.accountId === activeAccount.id && !tx.isDeleted)
      : allTransactions.filter(tx => !tx.isDeleted);

    // If it's a side account, user requested "only transactions"
    return {
      filteredTransactions: txs,
      filteredAttendance: isMainContext ? allAttendanceEntries : [],
      filteredSchedules: isMainContext ? allSchedules : [], // EMI follow main account or side only tx? "side account will target on only transaction"
      filteredTodos: isMainContext ? allTodos : [],
      filteredRecharges: isMainContext ? allRechargePlans : [],
      filteredSubscriptions: isMainContext ? allSubscriptionPlans : [],
    };
  }, [activeAccount, allTransactions, allAttendanceEntries, allSchedules, allTodos, allRechargePlans, allSubscriptionPlans]);

  const SummaryCard: React.FC<{ title: string; value: string; icon: React.FC<any>; color: string; onClick?: () => void; progress?: number; subtitle?: string }> = ({ title, value, icon: Icon, color, onClick, progress, subtitle }) => (
    <div className={`bg-bg-secondary-themed p-4 sm:p-5 rounded-xl shadow-lg flex flex-col h-full transition-transform duration-300 hover:scale-105 hover:shadow-xl ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <div className="flex items-center mb-3">
        <div className="p-2.5 rounded-full mr-4" style={{ backgroundColor: `${color}20`}}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted-themed truncate">{title}</p>
          <p className="text-lg sm:text-xl font-black truncate" style={{ color }}>
            {isBalanceVisible ? value : '••••'}
          </p>
          {subtitle && <p className="text-[9px] font-bold text-text-muted-themed truncate mt-0.5">{subtitle}</p>}
        </div>
      </div>
      
      {progress !== undefined && (
        <div className="mt-auto pt-2">
          <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500" 
              style={{ 
                backgroundColor: color,
                width: `${Math.min(Math.max(0, progress), 100)}%`
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );

  const DashboardPanel: React.FC<{ title: string; icon: React.FC<any>; children: React.ReactNode; }> = ({ title, icon: Icon, children }) => (
    <div className="bg-bg-secondary-themed p-4 sm:p-5 rounded-xl shadow-lg h-full flex flex-col">
      <h3 className="text-md sm:text-lg font-semibold text-text-base-themed mb-3 flex items-center">
        <Icon className="w-5 h-5 mr-2 text-brand-primary" />
        {title}
      </h3>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
  
  const gridColsClass = !activeAccount ? 'lg:grid-cols-2' : 'lg:grid-cols-1';

  return (
    <div className="space-y-6">
      {/* Unified Insights Calendar */}
      <DashboardPanel title="Unified Insights Calendar" icon={CalendarIcon}>
        <UnifiedDashboardCalendar 
          currentDate={calendarDate}
          onCurrentDateChange={onCalendarDateChange}
          transactions={filteredTransactions}
          attendanceEntries={filteredAttendance}
          schedules={filteredSchedules}
          todos={filteredTodos}
          rechargePlans={filteredRecharges}
          subscriptionPlans={filteredSubscriptions}
          financialMonthStartDay={financialMonthStartDay}
          financialMonthEndDay={financialMonthEndDay}
          formatCurrency={formatCurrency}
          onDateSelect={onDateSelect}
          onOpenDateDetails={onOpenDateDetails}
          viewMode={calendarViewMode}
          onViewModeChange={onCalendarViewModeChange}
        />
      </DashboardPanel>

      {/* Detailed Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard title="Opening Balance" value={formatCurrency(openingBalance, 0)} icon={BanknotesIcon} color={currentThemeColors.textBase} isBalanceVisible={isBalanceVisible} />
        <SummaryCard title="Total Income" value={formatCurrency(summary.allTimeIncome, 0)} icon={BanknotesIcon} color={currentThemeColors.chartIncome} isBalanceVisible={isBalanceVisible} />
        <SummaryCard title="Total Expense" value={formatCurrency(summary.allTimeExpenses, 0)} icon={BanknotesIcon} color={currentThemeColors.chartExpense} isBalanceVisible={isBalanceVisible} progress={summary.allTimeIncome > 0 ? (summary.allTimeExpenses / summary.allTimeIncome) * 100 : 0} />
        <SummaryCard title="Net Balance" value={formatCurrency(summary.netWorth, 0)} icon={BanknotesIcon} color={currentThemeColors.brandPrimary} isBalanceVisible={isBalanceVisible} progress={summary.allTimeIncome > 0 ? (summary.netWorth / (summary.allTimeIncome + openingBalance)) * 100 : 0} />
        
        {/* Budget Summary Card */}
        <SummaryCard 
          title="Budget Performance" 
          value={`${formatCurrency(budgetSummary.budgetedExpenses, 0)} / ${formatCurrency(budgetSummary.totalBudgeted, 0)}`}
          subtitle={`Unbudgeted: ${formatCurrency(budgetSummary.unbudgetedExpenses, 0)}`}
          icon={TargetIcon} 
          color={budgetSummary.budgetedExpenses > budgetSummary.totalBudgeted ? currentThemeColors.expense : currentThemeColors.brandSecondary} 
          isBalanceVisible={isBalanceVisible}
          progress={budgetSummary.totalBudgeted > 0 ? (budgetSummary.budgetedExpenses / budgetSummary.totalBudgeted) * 100 : 0}
          onClick={() => onShowSection('budget_performance')}
        />

        <div className="hidden md:block">
            <SummaryCard title="Analytics" value="View Charts" icon={ChartIcon} color={currentThemeColors.brandPrimary} isBalanceVisible={isBalanceVisible} onClick={() => onShowSection('charts')} />
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className={`grid grid-cols-1 ${gridColsClass} gap-6`}>
        
        {/* Account Balances (only for all accounts view) */}
        {!activeAccount && (
            <DashboardPanel title="Account Balances" icon={BanknotesIcon}>
            {accountBalancesList.length > 0 ? (
                <ul className="space-y-2">
                {accountBalancesList.map(([name, balance]) => (
                    <li key={name} className="flex justify-between items-center bg-bg-primary-themed p-2.5 rounded-md">
                    <span className="text-sm font-medium text-text-base-themed">{name}</span>
                    <span className={`text-sm font-semibold ${balance < 0 ? 'text-expense' : 'text-text-base-themed'}`}>{formatCurrency(balance)}</span>
                    </li>
                ))}
                </ul>
            ) : (
                <p className="text-sm text-text-muted-themed text-center pt-8">No accounts found.</p>
            )}
            </DashboardPanel>
        )}
        
        {/* Recent Transactions */}
        <DashboardPanel title="Recent Transactions" icon={HistoryIcon}>
          {recentTransactions.length > 0 ? (
            <ul className="space-y-2">
              {recentTransactions.map(tx => {
                const account = (accounts ?? []).find(a => a.id === tx.accountId);
                return (
                  <li key={tx.id} onClick={() => onEditTransaction(tx)} className="flex justify-between items-center bg-bg-primary-themed p-2.5 rounded-md cursor-pointer hover:bg-bg-accent-themed">
                    <div>
                      <p className="text-sm font-medium text-text-base-themed truncate" title={tx.description}>{tx.description}</p>
                      <p className="text-xs text-text-muted-themed">{formatDateDisplay(tx.date)} ({account?.name})</p>
                      {(tx.cashbackAmount || tx.couponAmount) && (
                        <div className="flex gap-1 mt-1">
                          {tx.cashbackAmount && <span className="text-[8px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 px-1 rounded">CB</span>}
                          {tx.couponAmount && <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-1 rounded">CP</span>}
                        </div>
                      )}
                    </div>
                    <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-text-muted-themed text-center pt-8">No transactions yet.</p>
          )}
        </DashboardPanel>

      </div>
    </div>
  );
};

export default Dashboard;