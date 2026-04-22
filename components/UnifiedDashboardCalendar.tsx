
import React, { useState, useMemo } from 'react';
import { 
  Transaction, 
  AttendanceEntry, 
  SavedAmortizationSchedule, 
  TodoItem, 
  RechargePlan, 
  SubscriptionPlan,
  TransactionType,
  AttendanceStatus,
  BudgetPeriod
} from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { 
  getPeriodDateRange, 
  getFinancialMonthIdentifier, 
  formatDateToYYYYMMDD,
} from '../utils/dateUtils';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CheckCircleIcon, 
  PlusIcon,
  ClockIcon,
  BellIcon,
  ListChecksIcon,
  BanknotesIcon,
  CreditCardIcon,
} from './Icons';

interface UnifiedDashboardCalendarProps {
  currentDate: Date;
  onCurrentDateChange: (date: Date) => void;
  transactions: Transaction[];
  attendanceEntries: AttendanceEntry[];
  schedules: SavedAmortizationSchedule[];
  todos: TodoItem[];
  rechargePlans: RechargePlan[];
  subscriptionPlans: SubscriptionPlan[];
  financialMonthStartDay: number;
  financialMonthEndDay: number;
  formatCurrency: (amount: number) => string;
  onDateSelect: (date: string) => void;
  onOpenDateDetails: (date: string) => void;
  viewMode: 'monthly' | 'yearly';
  onViewModeChange: (mode: 'monthly' | 'yearly') => void;
}

const UnifiedDashboardCalendar: React.FC<UnifiedDashboardCalendarProps> = ({
  currentDate,
  onCurrentDateChange,
  transactions,
  attendanceEntries,
  schedules,
  todos,
  rechargePlans,
  subscriptionPlans,
  financialMonthStartDay,
  financialMonthEndDay,
  formatCurrency,
  onDateSelect,
  onOpenDateDetails,
  viewMode,
  onViewModeChange,
}) => {
  const { currentThemeColors } = useTheme();

  // Aggregate all data by date
  const unifiedDataMap = useMemo(() => {
    const map = new Map<string, {
      finance?: { income: number; expenses: number; count: number };
      attendance?: AttendanceEntry;
      emis: { loanName: string; amount: number; isPaid: boolean }[];
      todos: { text: string; completed: boolean }[];
      reminders: { name: string; type: 'recharge' | 'subscription'; amount: number }[];
    }>();

    const getDayData = (date: string) => {
      if (!map.has(date)) {
        map.set(date, { emis: [], todos: [], reminders: [] });
      }
      return map.get(date)!;
    };

    // Finance
    transactions.filter(t => !t.isDeleted).forEach(tx => {
      const data = getDayData(tx.date);
      if (!data.finance) data.finance = { income: 0, expenses: 0, count: 0 };
      if (tx.type === TransactionType.INCOME) data.finance.income += tx.amount;
      else if (tx.type === TransactionType.EXPENSE) data.finance.expenses += tx.amount;
      data.finance.count++;

      // Check if this transaction should also count as a recharge/subscription reminder indicator
      const cat = tx.category?.toLowerCase() || '';
      const isRecharge = cat.includes('mobile') || cat.includes('recharge');
      const isSubscription = cat.includes('subscription') || cat.includes('renewal');

      if (isRecharge || isSubscription) {
        const type = isRecharge ? 'recharge' : 'subscription';
        // Add start marker
        data.reminders.push({ name: `${tx.description} (Started)`, type, amount: tx.amount });

        // If validityDays is present, add end marker
        if (tx.validityDays && tx.validityDays > 0) {
          const startDate = new Date(tx.date + 'T00:00:00');
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + tx.validityDays);
          const endDateStr = formatDateToYYYYMMDD(endDate);
          
          const endData = getDayData(endDateStr);
          endData.reminders.push({ name: `${tx.description} (Ends)`, type, amount: tx.amount });
        }
      }
    });

    // Attendance
    attendanceEntries.forEach(entry => {
      const data = getDayData(entry.date);
      data.attendance = entry;
    });

    // EMIs
    schedules.filter(s => !s.isDeleted).forEach(s => {
      s.schedule.forEach(entry => {
        const data = getDayData(entry.paymentDate);
        data.emis.push({
          loanName: s.loanName,
          amount: entry.emi,
          isPaid: (s.paymentStatus || {})[entry.month] || false
        });
      });
    });

    // Todos
    todos.filter(t => !t.isDeleted).forEach(t => {
      const date = t.reminderDateTime ? t.reminderDateTime.split('T')[0] : t.createdAt.split('T')[0];
      const data = getDayData(date);
      data.todos.push({ text: t.text, completed: t.completed });
    });

    // Recharges
    rechargePlans.filter(p => !p.isDeleted).forEach(p => {
      // End date reminder
      const endData = getDayData(p.nextDueDate);
      endData.reminders.push({ name: `${p.provider} (Due)`, type: 'recharge', amount: p.price });
      
      // Start date reminder (last recharge)
      if (p.lastRechargeDate) {
        const startData = getDayData(p.lastRechargeDate);
        startData.reminders.push({ name: `${p.provider} (Started)`, type: 'recharge', amount: p.price });
      }
    });

    // Subscriptions
    subscriptionPlans.filter(p => !p.isDeleted).forEach(p => {
      // End date reminder
      const endData = getDayData(p.nextDueDate);
      endData.reminders.push({ name: `${p.name} (Due)`, type: 'subscription', amount: p.price });
      
      // Start date reminder (last payment)
      if (p.lastPaymentDate) {
        const startData = getDayData(p.lastPaymentDate);
        startData.reminders.push({ name: `${p.name} (Started)`, type: 'subscription', amount: p.price });
      }
    });

    return map;
  }, [transactions, attendanceEntries, schedules, todos, rechargePlans, subscriptionPlans]);

  const changeFinancialPeriod = (offset: number) => {
    const newDate = new Date(currentDate);
    // Use 15th to avoid issues with different month lengths when transitioning
    newDate.setMonth(newDate.getMonth() + offset, 15);
    onCurrentDateChange(newDate);
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getAttendanceStyle = (status: AttendanceStatus) => {
    const s = status.toLowerCase();
    if (s.includes('present') || s.includes('home') || s.includes('work')) {
        return { color: currentThemeColors.income, bg: `${currentThemeColors.income}15`, label: s.includes('present') ? 'P' : 'W' };
    }
    if (s.includes('absent') || s.includes('leave') || s.includes('off')) {
        return { color: currentThemeColors.expense, bg: `${currentThemeColors.expense}15`, label: s.includes('absent') ? 'A' : (s.includes('off') ? 'OFF' : 'L') };
    }
    return { color: currentThemeColors.brandPrimary, bg: `${currentThemeColors.brandPrimary}15`, label: 'L' };
  };

  const getMonthGrid = (date: Date) => {
    const identifier = getFinancialMonthIdentifier(date, financialMonthStartDay);
    const { start, end } = getPeriodDateRange(BudgetPeriod.MONTHLY, identifier, { startDay: financialMonthStartDay, endDay: financialMonthEndDay });

    const gridStart = new Date(start);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());
    gridStart.setHours(0, 0, 0, 0);

    const gridEnd = new Date(end);
    gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));
    gridEnd.setHours(23, 59, 59, 999);

    return { finStart: start, finEnd: end, gStart: gridStart, gEnd: gridEnd, identifier };
  };

  const renderMonthCells = (monthDate: Date, isYearly = false) => {
    const cells = [];
    const { finStart, finEnd, gStart, gEnd } = getMonthGrid(monthDate);
    let loopDate = new Date(gStart);
    const todayStr = formatDateToYYYYMMDD(new Date());
    let safetyCounter = 0;

    while (loopDate <= gEnd && safetyCounter < 50) {
      safetyCounter++;
      const dateStr = formatDateToYYYYMMDD(loopDate);
      const isWithinFin = loopDate >= finStart && loopDate <= finEnd;
      const data = unifiedDataMap.get(dateStr);
      const isToday = dateStr === todayStr;

      const attendanceStatus = data?.attendance?.status;
      let attendanceBg = '';
      if (isWithinFin && attendanceStatus) {
        const s = attendanceStatus.toLowerCase();
        if (s.includes('present') || s.includes('home') || s.includes('work')) {
          attendanceBg = 'bg-green-50/50 dark:bg-green-900/20 border-green-200/50 dark:border-green-800/30';
        } else if (s.includes('absent') || s.includes('leave') || s.includes('off')) {
          attendanceBg = 'bg-red-50/50 dark:bg-red-900/20 border-red-200/50 dark:border-red-800/30';
        }
      }

      cells.push(
        <div 
          key={dateStr}
          className={`group relative ${isYearly ? 'min-h-[40px] p-0.5' : 'min-h-[100px] p-1'} border border-border-secondary flex flex-col gap-0.5 transition-all hover:bg-bg-accent-themed/20 ${!isWithinFin ? 'opacity-30 bg-slate-50/50 dark:bg-black/10' : attendanceBg || 'bg-bg-secondary-themed'} ${isToday ? 'ring-2 ring-inset ring-brand-primary z-10' : ''} cursor-pointer`}
          onClick={() => isWithinFin && onOpenDateDetails(dateStr)}
        >
          {/* Day Header */}
          <div className="flex justify-between items-start">
            <span className={`${isYearly ? 'text-[7px]' : 'text-[10px]'} font-black ${isToday ? 'text-brand-primary' : 'text-text-muted-themed'}`}>
              {loopDate.getDate()}
            </span>
            
            <div className="flex items-center gap-1 mb-1">
              {/* Income/Expense dots */}
              {!isYearly && data?.finance && (
                <div className="flex gap-0.5">
                  {data.finance.income > 0 && <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_2px_rgba(0,0,0,0.1)]" style={{ backgroundColor: currentThemeColors.income }} title="Income" />}
                  {data.finance.expenses > 0 && <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_2px_rgba(0,0,0,0.1)]" style={{ backgroundColor: currentThemeColors.expense }} title="Expense" />}
                </div>
              )}

              {!isYearly && data?.attendance && (
                <div 
                  className="px-1 py-0.5 rounded-[4px] text-[7px] font-black uppercase tracking-tighter"
                  style={{ backgroundColor: getAttendanceStyle(data.attendance.status).bg, color: getAttendanceStyle(data.attendance.status).color }}
                >
                  {getAttendanceStyle(data.attendance.status).label}
                </div>
              )}
            </div>
          </div>

          {/* Indicators row simplified for yearly */}
          <div className={`mt-auto flex flex-wrap gap-0.5 ${isYearly ? 'min-h-[4px]' : 'min-h-[14px]'}`}>
              {isYearly ? (
                <>
                  {data?.finance && (
                    <div className="flex gap-0.5">
                      {data.finance.income > 0 && <div className="w-1 h-1 rounded-full" style={{ backgroundColor: currentThemeColors.income }} />}
                      {data.finance.expenses > 0 && <div className="w-1 h-1 rounded-full" style={{ backgroundColor: currentThemeColors.expense }} />}
                    </div>
                  )}
                  {data?.attendance && (
                    <div 
                      className="w-1 h-1 rounded-full" 
                      style={{ backgroundColor: getAttendanceStyle(data.attendance.status).color }} 
                    />
                  )}
                  {data?.emis.length ? <div className="w-1 h-1 rounded-full bg-blue-500" /> : null}
                </>
             ) : (
                <>
                  {/* Finance Amounts */}
                  {data?.finance && (
                    <div className="space-y-0 text-[7px] font-black leading-tight mb-auto w-full">
                      {data.finance.income > 0 && <p style={{ color: currentThemeColors.income }}>+{formatCurrency(data.finance.income)}</p>}
                      {data.finance.expenses > 0 && <p style={{ color: currentThemeColors.expense }}>-{formatCurrency(data.finance.expenses)}</p>}
                    </div>
                  )}

                  {/* EMI Indicator */}
                  {data?.emis.map((emi, i) => (
                    <div 
                      key={i} 
                      className="w-3 h-3 rounded-full flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: emi.isPaid ? currentThemeColors.income : currentThemeColors.brandPrimary, color: 'white' }}
                      title={`EMI: ${emi.loanName} (${emi.isPaid ? 'Paid' : 'Due'})`}
                    >
                      <BanknotesIcon className="w-2 h-2" />
                    </div>
                  ))}

                  {/* Todo Indicator */}
                  {data?.todos.length ? (
                    <div 
                      className="w-3 h-3 rounded-full flex items-center justify-center bg-brand-secondary text-white shadow-sm"
                      title={`${data.todos.filter(t => !t.completed).length} items pending`}
                    >
                      <ListChecksIcon className="w-2.5 h-2.5" />
                    </div>
                  ) : null}

                  {/* Reminders */}
                  {data?.reminders.length ? (
                    <div 
                      className="w-3 h-3 rounded-full flex items-center justify-center bg-amber-500 text-white shadow-sm"
                      title={`${data.reminders.length} Recharge/Sub due`}
                    >
                      <BellIcon className="w-2.5 h-2.5" />
                    </div>
                  ) : null}
                </>
             )}
          </div>

          {!isYearly && isWithinFin && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDateSelect(dateStr); }}
              className="absolute top-1 right-1 p-0.5 rounded bg-brand-primary text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <PlusIcon className="w-3 h-3" />
            </button>
          )}
        </div>
      );

      loopDate.setDate(loopDate.getDate() + 1);
    }
    return cells;
  };

  const renderYearlyView = () => {
    const months = [];
    const year = currentDate.getFullYear();
    
    for (let m = 0; m < 12; m++) {
      const monthDate = new Date(year, m, 15);
      const mName = monthDate.toLocaleString('default', { month: 'long' });
      
      months.push(
        <div key={`${year}-${m}`} className="bg-bg-primary-themed/40 rounded-xl border border-border-secondary overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="py-2 px-3 border-b border-border-secondary bg-bg-accent-themed/10 flex justify-between items-center">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-primary">{mName}</h4>
             <p className="text-[8px] font-bold text-text-muted-themed">{year}</p>
          </div>
          <div className="grid grid-cols-7 text-center py-1 border-b border-border-secondary bg-bg-accent-themed/20">
            {weekdays.map(d => <div key={d} className="text-[6px] font-black text-text-muted-themed uppercase">{d[0]}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {renderMonthCells(monthDate, true)}
          </div>
        </div>
      );
    }
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 p-4">{months}</div>;
  };

  const renderCells = () => renderMonthCells(currentDate, false);

  return (
    <div className="bg-bg-secondary-themed rounded-2xl shadow-xl border border-border-secondary overflow-hidden mt-6">
      <div className="p-4 sm:p-5 border-b border-border-secondary flex flex-col sm:flex-row justify-between items-center gap-4 bg-bg-primary-themed">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); changeFinancialPeriod(viewMode === 'monthly' ? -1 : -12); }} 
            className="p-1.5 rounded-lg border border-border-secondary hover:bg-bg-accent-themed transition-all active:scale-95"
          >
             <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <div className="text-center min-w-[120px]">
            <h3 className="text-sm font-black uppercase tracking-tight">
              {viewMode === 'monthly' 
                ? currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
                : currentDate.getFullYear()}
            </h3>
            <p className="text-[8px] font-black text-text-muted-themed uppercase tracking-widest leading-none">Financial Insights</p>
          </div>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); changeFinancialPeriod(viewMode === 'monthly' ? 1 : 12); }} 
            className="p-1.5 rounded-lg border border-border-secondary hover:bg-bg-accent-themed transition-all active:scale-95"
          >
             <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center bg-bg-accent-themed p-1 rounded-xl border border-border-secondary relative" style={{ zIndex: 1000 }}>
          <button
            type="button"
            onClick={() => onViewModeChange('monthly')}
            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer select-none ${viewMode === 'monthly' ? 'bg-brand-primary text-white shadow-lg' : 'text-text-muted-themed hover:text-text-base-themed hover:bg-bg-primary-themed'}`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('yearly')}
            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer select-none ${viewMode === 'yearly' ? 'bg-brand-primary text-white shadow-lg' : 'text-text-muted-themed hover:text-text-base-themed hover:bg-bg-primary-themed'}`}
          >
            Yearly
          </button>
        </div>
        
        <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-text-muted-themed hidden xl:flex">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentThemeColors.income }}></div> Income</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentThemeColors.expense }}></div> Expense</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> EMI</div>
        </div>
      </div>

      {viewMode === 'monthly' ? (
        <>
          <div className="grid grid-cols-7 border-b border-border-secondary">
            {weekdays.map(day => (
              <div key={day} className="py-2 text-[8px] font-black uppercase tracking-widest text-center text-text-muted-themed bg-bg-accent-themed/20">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {renderCells()}
          </div>
        </>
      ) : (
        renderYearlyView()
      )}
    </div>
  );
};

export default UnifiedDashboardCalendar;
