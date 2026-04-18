import React, { useMemo } from 'react';
import { 
  Transaction, AttendanceEntry, DayPlannerEntry, TodoItem, 
  TransactionType, Account, ActivityLogEntry, SubscriptionPlan, RechargePlan 
} from '../types';
import { 
  formatDateDisplay, 
  formatDateToYYYYMMDD 
} from '../utils/dateUtils';
import { useTheme } from '../contexts/ThemeContext';
import { 
  BanknotesIcon, 
  ClipboardListIcon, 
  ClockIcon, 
  CheckCircleIcon,
  CreditCardIcon,
  CalendarIcon,
  UserGroupIcon,
  CogIcon,
  RefreshCwIcon as RechargeIcon,
  BellIcon
} from './Icons';
import { hexToRgba } from '../utils/colorUtils';

interface DailySummaryViewProps {
  selectedDate: Date;
  transactions: Transaction[];
  attendanceEntries: AttendanceEntry[];
  dayPlannerEntries: DayPlannerEntry[];
  todoItems: TodoItem[];
  accounts: Account[];
  activityLogs?: ActivityLogEntry[];
  subscriptionPlans?: SubscriptionPlan[];
  rechargePlans?: RechargePlan[];
  activeAccountId: string | null;
  onEditTransaction?: (tx: Transaction) => void;
  formatCurrency: (amount: number) => string;
}

const DailySummaryView: React.FC<DailySummaryViewProps> = ({
  selectedDate,
  transactions,
  attendanceEntries,
  dayPlannerEntries,
  todoItems,
  accounts,
  activityLogs = [],
  subscriptionPlans = [],
  rechargePlans = [],
  activeAccountId,
  onEditTransaction,
  formatCurrency
}) => {
  const { currentThemeColors } = useTheme();
  const dateStr = formatDateToYYYYMMDD(selectedDate);

  // Filter Data for the specific day
  const dailyTransactions = useMemo(() => {
    return transactions.filter(t => 
      !t.isDeleted && 
      t.date === dateStr && 
      (!activeAccountId || t.accountId === activeAccountId)
    );
  }, [transactions, dateStr, activeAccountId]);

  const dailyAttendance = useMemo(() => {
    return attendanceEntries.find(e => e.date === dateStr);
  }, [attendanceEntries, dateStr]);

  const dailyPlanner = useMemo(() => {
    return dayPlannerEntries.filter(e => !e.isDeleted && e.date === dateStr);
  }, [dayPlannerEntries, dateStr]);

  const dailyTodos = useMemo(() => {
    return todoItems.filter(t => 
      !t.isDeleted && 
      (t.createdAt.startsWith(dateStr) || (t.reminderDateTime && t.reminderDateTime.startsWith(dateStr)))
    );
  }, [todoItems, dateStr]);

  const dailyLogs = useMemo(() => {
    return activityLogs.filter(log => log.timestamp.startsWith(dateStr));
  }, [activityLogs, dateStr]);

  const dailySubscriptions = useMemo(() => {
    return subscriptionPlans.filter(p => !p.isDeleted && p.lastPaymentDate === dateStr);
  }, [subscriptionPlans, dateStr]);

  const dailyRecharges = useMemo(() => {
    return rechargePlans.filter(p => !p.isDeleted && p.lastRechargeDate === dateStr);
  }, [rechargePlans, dateStr]);

  // Financial Stats
  const income = dailyTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = dailyTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + (t.amount - (t.couponUsed || 0)), 0);

  const net = income - expenses;

  const dataCards = [
    { label: 'Today\'s Income', value: formatCurrency(income), color: currentThemeColors.income, icon: BanknotesIcon },
    { label: 'Today\'s Expense', value: formatCurrency(expenses), color: currentThemeColors.expense, icon: CreditCardIcon },
    { label: 'Daily Net', value: formatCurrency(net), color: net >= 0 ? currentThemeColors.income : currentThemeColors.expense, icon: net >= 0 ? CheckCircleIcon : ClockIcon },
    { label: 'Activities', value: (dailyTransactions.length + dailyLogs.length + dailySubscriptions.length + dailyRecharges.length).toString(), color: '#8b5cf6', icon: BanknotesIcon },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-secondary-themed p-6 rounded-2xl shadow-sm border border-transparent hover:border-bg-accent-themed transition-all">
        <div>
          <h2 className="text-2xl font-black tracking-tight" style={{ color: currentThemeColors.textBase }}>
            Daily Summary
          </h2>
          <p className="text-sm font-medium opacity-60 flex items-center gap-2" style={{ color: currentThemeColors.textMuted }}>
            <CalendarIcon className="w-4 h-4" />
            {formatDateDisplay(selectedDate)}
          </p>
        </div>
        <div className="flex gap-2">
          {dailyAttendance && (
            <span 
              className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary"
            >
              Status: {dailyAttendance.status}
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dataCards.map((card, i) => (
          <div key={i} className="bg-bg-secondary-themed p-4 rounded-xl border border-transparent hover:border-bg-accent-themed shadow-sm group">
            <div className="flex items-center gap-4">
              <div 
                className="p-3 rounded-xl transition-all group-hover:scale-110"
                style={{ backgroundColor: hexToRgba(card.color, 0.15) }}
              >
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted-themed opacity-60">
                  {card.label}
                </p>
                <p className="text-lg font-black" style={{ color: card.color }}>
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions */}
        <section className="bg-bg-secondary-themed rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: currentThemeColors.textBase }}>
            <BanknotesIcon className="w-5 h-5 text-brand-primary" />
            Transactions
          </h3>
          {dailyTransactions.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-bg-accent-themed">
              {dailyTransactions.map(tx => (
                <div 
                  key={tx.id} 
                  onClick={() => onEditTransaction?.(tx)}
                  className="flex items-center justify-between p-3 rounded-xl bg-bg-primary-themed border border-transparent hover:border-brand-primary/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={tx.type === TransactionType.INCOME ? "text-emerald-500" : "text-rose-500"}>
                      {tx.type === TransactionType.INCOME ? "+" : "-"}
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-tight line-clamp-1">{tx.description}</p>
                      <p className="text-[10px] opacity-50 font-bold uppercase tracking-widest">{tx.category || 'Uncategorized'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p 
                      className="text-sm font-black" 
                      style={{ color: tx.type === TransactionType.INCOME ? currentThemeColors.income : currentThemeColors.expense }}
                    >
                      {formatCurrency(tx.amount)}
                    </p>
                    <p className="text-[9px] opacity-40 font-bold uppercase">
                      {accounts.find(a => a.id === tx.accountId)?.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center opacity-40 italic text-sm">No transactions logged for this day</div>
          )}
        </section>

        {/* Activity Logs (Settings, Timer, etc.) */}
        <section className="bg-bg-secondary-themed rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: currentThemeColors.textBase }}>
            <CogIcon className="w-5 h-5 text-brand-primary" />
            Activities & Settings
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-bg-accent-themed">
            {/* Logs from activityLogs */}
            {dailyLogs.map(log => (
              <div key={log.id} className="p-3 rounded-xl bg-bg-primary-themed border border-transparent flex items-start gap-3">
                <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary shrink-0">
                  {log.type === 'settings' ? <CogIcon className="w-4 h-4" /> : 
                   log.type === 'timer' ? <ClockIcon className="w-4 h-4" /> : 
                   <BellIcon className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-bold">{log.message}</p>
                  <p className="text-[10px] font-bold opacity-60 tracking-widest uppercase">
                    {new Date(log.timestamp).toLocaleTimeString()} • {log.type}
                  </p>
                  {log.details && <p className="text-[11px] opacity-50 mt-1">{log.details}</p>}
                </div>
              </div>
            ))}

            {/* Subscription activities */}
            {dailySubscriptions.map(p => (
              <div key={p.id} className="p-3 rounded-xl bg-bg-primary-themed border border-transparent flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                  <CreditCardIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold">Subscription Paid: {p.name}</p>
                  <p className="text-[10px] font-bold opacity-60 tracking-widest uppercase">
                    {p.provider} • ₹{p.price}
                  </p>
                </div>
              </div>
            ))}

            {/* Recharge activities */}
            {dailyRecharges.map(p => (
              <div key={p.id} className="p-3 rounded-xl bg-bg-primary-themed border border-transparent flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                  <RechargeIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold">Mobile Recharge: {p.provider}</p>
                  <p className="text-[10px] font-bold opacity-60 tracking-widest uppercase">
                    ₹{p.price} • {p.validityDays} days validity
                  </p>
                </div>
              </div>
            ))}

            {dailyLogs.length === 0 && dailySubscriptions.length === 0 && dailyRecharges.length === 0 && (
              <div className="py-12 text-center opacity-40 italic text-sm">No activity logs for this day</div>
            )}
          </div>
        </section>

        {/* Day Planner */}
        <section className="bg-bg-secondary-themed rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: currentThemeColors.textBase }}>
            <ClipboardListIcon className="w-5 h-5 text-brand-primary" />
            Day Planner
          </h3>
          {dailyPlanner.length > 0 ? (
            <div className="space-y-3">
              {dailyPlanner.sort((a,b) => a.startTime.localeCompare(b.startTime)).map(entry => (
                <div key={entry.id} className="p-3 rounded-xl bg-bg-primary-themed border border-transparent flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary shrink-0">
                    <ClockIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold ${entry.completed ? 'line-through opacity-40' : ''}`}>{entry.title}</p>
                      {entry.completed && <CheckCircleIcon className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <p className="text-[10px] font-bold opacity-60 tracking-widest uppercase">
                      {entry.startTime} - {entry.endTime}
                    </p>
                    {entry.notes && <p className="text-[11px] opacity-50 mt-1">{entry.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center opacity-40 italic text-sm">Free day! No planner entries found</div>
          )}
        </section>

        {/* Attendance (if relevant) */}
        {dailyAttendance && (
          <section className="bg-bg-secondary-themed rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: currentThemeColors.textBase }}>
              <UserGroupIcon className="w-5 h-5 text-brand-primary" />
              Attendance Trace
            </h3>
            <div className="p-4 rounded-xl bg-bg-primary-themed flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-bg-accent-themed pb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Status</p>
                <p className="text-sm font-black text-brand-primary">{dailyAttendance.status}</p>
              </div>
              <div className="flex justify-between items-center border-b border-bg-accent-themed pb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Check-in</p>
                <p className="text-sm font-black">{dailyAttendance.checkInTime || 'N/A'}</p>
              </div>
              <div className="flex justify-between items-center border-b border-bg-accent-themed pb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Check-out</p>
                <p className="text-sm font-black">{dailyAttendance.checkOutTime || 'N/A'}</p>
              </div>
              {dailyAttendance.notes && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Notes</p>
                  <p className="text-xs opacity-70 italic">{dailyAttendance.notes}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default DailySummaryView;
