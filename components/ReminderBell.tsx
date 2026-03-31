import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { BellIcon, CheckCircleIcon, ListChecksIcon, ClipboardDocumentCheckIcon, CreditCardIcon, DevicePhoneMobileIcon, SparklesIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import { UpcomingPayment, Transaction, CustomReminder, SavedAmortizationSchedule } from '../types';
import { formatDateDisplay, formatDateToYYYYMMDD } from '../utils/dateUtils';

interface ReminderBellProps {
  upcomingPayments: UpcomingPayment[];
  onViewEmiDashboard: () => void;
  onViewTodoList: () => void;
  onViewDayPlanner: () => void;
  onViewSubscriptionTracker: () => void;
  onViewRechargeTracker: () => void;
  transactions: Transaction[];
  recurringReminders: CustomReminder[];
  savedAmortizationSchedules: SavedAmortizationSchedule[];
}

const ReminderBell: React.FC<ReminderBellProps> = ({ 
    upcomingPayments, 
    onViewEmiDashboard, 
    onViewTodoList, 
    onViewDayPlanner, 
    onViewSubscriptionTracker,
    onViewRechargeTracker,
    transactions
}) => {
    const { currentThemeColors } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<'monthly' | 'yearly'>('monthly');

    const getDaysRemainingInfo = useCallback((dueDate: string): { text: string; color: string } | null => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate.split('T')[0] + 'T00:00:00');
        if (isNaN(due.getTime())) return null;

        const diffTime = due.getTime() - today.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (days < 0) {
            return { text: `Overdue by ${Math.abs(days)}d`, color: currentThemeColors.expense };
        } else if (days === 0) {
            return { text: 'Due Today', color: currentThemeColors.expense };
        } else if (days === 1) {
            return { text: 'Tomorrow', color: currentThemeColors.brandSecondary };
        } else {
            return { text: `${days} days left`, color: currentThemeColors.brandSecondary };
        }
    }, [currentThemeColors]);

    const paymentsWithStatus = useMemo(() => {
        return upcomingPayments
            .filter(p => p.type === 'emi' || p.type === 'custom')
            .map(item => {
                let isPaid = false;
                if (item.type === 'emi') {
                    isPaid = (item.schedule?.paymentStatus || {})[item.entry?.month] || false;
                } else if (item.type === 'custom' && item.incomeOrExpense === 'expense') {
                    const dueDate = new Date(item.dueDate + 'T00:00:00');
                    const year = dueDate.getFullYear();
                    const month = dueDate.getMonth();
                    
                    const startOfMonth = new Date(year, month, 1);
                    const endOfMonth = new Date(year, month + 1, 0);

                    const startOfMonthStr = formatDateToYYYYMMDD(startOfMonth);
                    const endOfMonthStr = formatDateToYYYYMMDD(endOfMonth);
                    
                    isPaid = transactions.some(tx => 
                        tx.type === 'expense' &&
                        tx.description === item.name &&
                        tx.amount === item.amount &&
                        tx.date >= startOfMonthStr &&
                        tx.date <= endOfMonthStr
                    );
                }
                return { ...item, isPaid };
            });
    }, [upcomingPayments, transactions]);
    
    const todoReminders = useMemo(() => upcomingPayments.filter(p => p.type === 'todo'), [upcomingPayments]);
    const dayPlannerReminders = useMemo(() => upcomingPayments.filter(p => p.type === 'dayPlanner'), [upcomingPayments]);
    const subscriptionReminders = useMemo(() => upcomingPayments.filter(p => p.type === 'subscription').sort((a,b) => a.dueDate.localeCompare(b.dueDate)), [upcomingPayments]);
    const rechargeReminders = useMemo(() => upcomingPayments.filter(p => p.type === 'recharge').sort((a,b) => a.dueDate.localeCompare(b.dueDate)), [upcomingPayments]);
    const festiveReminders = useMemo(() => upcomingPayments.filter(p => p.type === 'festive').sort((a,b) => a.dueDate.localeCompare(b.dueDate)), [upcomingPayments]);

    const hasReminders = useMemo(() => upcomingPayments.length > 0, [upcomingPayments]);

    const urgencyStatus = useMemo(() => {
        if (!hasReminders) {
            return { color: currentThemeColors.textMuted };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const unpaidPayments = paymentsWithStatus.filter(p => !p.isPaid);
        const otherReminders = upcomingPayments.filter(p => p.type === 'todo' || p.type === 'dayPlanner' || p.type === 'subscription' || p.type === 'recharge' || p.type === 'festive');
        const allUpcomingUnpaidItems = [...unpaidPayments, ...otherReminders];

        if (allUpcomingUnpaidItems.length === 0) {
            return { color: currentThemeColors.textMuted };
        }

        allUpcomingUnpaidItems.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
        const soonestItem = allUpcomingUnpaidItems[0];
        
        const dueDate = new Date(soonestItem.dueDate.split('T')[0] + 'T00:00:00');
        const diffTime = dueDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysRemaining <= 0) return { color: currentThemeColors.expense };
        if (daysRemaining <= 3) return { color: currentThemeColors.brandSecondary };
        
        return { color: currentThemeColors.income };

    }, [hasReminders, upcomingPayments, paymentsWithStatus, currentThemeColors]);
    
    const paymentRemindersByMonth = useMemo(() => {
        const groups: Record<string, (UpcomingPayment & { isPaid: boolean })[]> = {};
        paymentsWithStatus.forEach(item => {
            const monthKey = new Date(item.dueDate.split('T')[0] + 'T00:00:00').toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!groups[monthKey]) groups[monthKey] = [];
            groups[monthKey].push(item);
        });
        Object.values(groups).forEach(group => group.sort((a, b) => a.dueDate.localeCompare(b.dueDate)));
        const sortedMonthKeys = Object.keys(groups).sort((a, b) => new Date(`01 ${a}`).getTime() - new Date(`01 ${b}`).getTime());
        return sortedMonthKeys.reduce((acc, key) => ({ ...acc, [key]: groups[key] }), {});
    }, [paymentsWithStatus]);
    
    const { paymentsForCurrentMonth, totalDueForCurrentMonth } = useMemo(() => {
        const now = new Date();
        const currentMonthKey = now.toLocaleString('default', { month: 'long', year: 'numeric' });
        const items = paymentRemindersByMonth[currentMonthKey] || [];
        const totalDue = items.filter(item => !item.isPaid && item.incomeOrExpense !== 'income').reduce((sum, item) => sum + (item.amount || 0), 0);
        return { paymentsForCurrentMonth: items, totalDueForCurrentMonth: totalDue };
    }, [paymentRemindersByMonth]);

    const sortedMonthKeys = useMemo(() => Object.keys(paymentRemindersByMonth), [paymentRemindersByMonth]);

    useEffect(() => {
        if (!isOpen) setActiveTab('monthly');
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBellClick = () => {
        if (hasReminders) setIsOpen(prev => !prev);
    };
    
    const formatCurrency = (amount?: number) => {
        if (amount === undefined) return '';
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    };
    
    const formatReminderDate = (dueDate: string, type: string) => {
        if (type === 'todo' || type === 'dayPlanner') {
             try {
                return new Date(dueDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
            } catch { return 'Invalid Date'; }
        }
        if (type === 'festive') {
            return formatDateDisplay(dueDate.split('T')[0]);
        }
        return formatDateDisplay(dueDate);
    };

    const renderPaymentReminderItem = (item: (UpcomingPayment & { isPaid: boolean })) => {
        const daysRemainingInfo = !item.isPaid ? getDaysRemainingInfo(item.dueDate) : null;
        
        // Calculate EMI installment number
        let emiInstallmentInfo = "";
        if (item.type === 'emi' && item.entry && item.schedule) {
            const currentInstallment = item.entry.month;
            const totalInstallments = item.schedule.schedule.length;
            emiInstallmentInfo = ` (${currentInstallment}/${totalInstallments})`;
        }

        return (
            <li 
                key={`${item.originalId}-${item.dueDate}`}
                onClick={() => {
                    if(item.type === 'emi' || item.type === 'custom') onViewEmiDashboard();
                    setIsOpen(false);
                }}
                className="p-2.5 rounded-lg hover:bg-bg-accent-themed cursor-pointer transition-colors"
            >
                <div className="flex justify-between items-start">
                    <div className="flex items-center flex-grow min-w-0">
                        {item.isPaid && <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" style={{ color: currentThemeColors.income }} />}
                        <div className="min-w-0">
                            <span className={`text-sm font-medium text-text-base-themed truncate pr-2 ${item.isPaid ? 'line-through' : ''}`} title={item.name}>
                                {item.name}{emiInstallmentInfo}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-text-muted-themed">
                                    Due: {formatReminderDate(item.dueDate, item.type)}
                                </p>
                                {daysRemainingInfo && (
                                    <p className="text-xs font-semibold" style={{ color: daysRemainingInfo.color }}>
                                        ({daysRemainingInfo.text})
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    {item.amount !== undefined && (
                        <span className={`text-sm font-bold flex-shrink-0 ${item.isPaid ? 'line-through' : ''}`} style={{ color: item.incomeOrExpense === 'income' ? currentThemeColors.income : currentThemeColors.brandSecondary }}>
                            {formatCurrency(item.amount)}
                        </span>
                    )}
                </div>
            </li>
        );
    };

    const renderOtherReminderItem = (item: UpcomingPayment) => {
        const daysRemainingInfo = getDaysRemainingInfo(item.dueDate);
        return (
          <li
            key={`${item.originalId}-${item.dueDate}`}
            onClick={() => {
              if (item.type === 'todo') onViewTodoList();
              else if (item.type === 'dayPlanner') onViewDayPlanner();
              else if (item.type === 'subscription') onViewSubscriptionTracker();
              else if (item.type === 'recharge') onViewRechargeTracker();
              setIsOpen(false);
            }}
            className="p-2.5 rounded-lg hover:bg-bg-accent-themed cursor-pointer transition-colors"
          >
            <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-text-base-themed truncate pr-2" title={item.name}>{item.name}</p>
                {item.amount !== undefined && (item.type === 'subscription' || item.type === 'recharge') &&
                    <span className="text-sm font-bold flex-shrink-0" style={{ color: currentThemeColors.brandSecondary }}>
                        {formatCurrency(item.amount)}
                    </span>
                }
                {item.type === 'festive' && <SparklesIcon className="w-4 h-4 text-amber-500" />}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-text-muted-themed">Due: {formatReminderDate(item.dueDate, item.type)}</p>
                {daysRemainingInfo && (
                    <p className="text-xs font-semibold" style={{ color: daysRemainingInfo.color }}>
                        ({daysRemainingInfo.text})
                    </p>
                )}
            </div>
          </li>
        );
      };

    return (
        <div ref={wrapperRef} className="relative inline-block">
            <button
                onClick={handleBellClick}
                className="p-2 rounded-lg hover:bg-bg-accent-themed focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 dark:focus:ring-offset-bg-primary transition-all duration-200 ease-in-out shadow-sm hover:shadow-md relative"
                style={{ color: hasReminders ? urgencyStatus.color : currentThemeColors.textMuted }}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="View reminders"
            >
                <BellIcon className="w-6 h-6" />
                {hasReminders && (
                    <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full ring-2"
                        style={{ backgroundColor: urgencyStatus.color, borderColor: currentThemeColors.bgSecondary, '--tw-ring-color': currentThemeColors.bgSecondary } as React.CSSProperties} 
                    />
                )}
            </button>

            {isOpen && hasReminders && (
                <div 
                    className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-white/30 backdrop-blur-sm animate-modal-enter"
                    onClick={() => setIsOpen(false)}
                    role="dialog" aria-modal="true" aria-labelledby="reminders-modal-title"
                >
                    <div 
                        className="w-full max-w-md max-h-[80vh] rounded-xl shadow-2xl overflow-hidden flex flex-col"
                        style={{ backgroundColor: currentThemeColors.bgPrimary, border: `1px solid ${currentThemeColors.borderPrimary}`}}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex border-b border-border-secondary">
                            <button onClick={() => setActiveTab('monthly')} className={`px-4 py-2 text-sm font-medium w-1/2 ${activeTab === 'monthly' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-text-muted-themed hover:bg-bg-accent-themed/50'}`}>This Month</button>
                            <button onClick={() => setActiveTab('yearly')} className={`px-4 py-2 text-sm font-medium w-1/2 ${activeTab === 'yearly' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-text-muted-themed hover:bg-bg-accent-themed/50'}`}>Yearly View</button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-2">
                            {activeTab === 'monthly' && (
                                <div className="animate-fade-in">
                                    {paymentsForCurrentMonth.length > 0 && <h4 className="px-2 pt-1 pb-2 text-xs font-semibold uppercase text-text-muted-themed">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>}
                                    {paymentsForCurrentMonth.length > 0 ? (
                                        <ul className="space-y-1 mt-1">{paymentsForCurrentMonth.map(renderPaymentReminderItem)}</ul>
                                    ) : (
                                        <p className="px-2 py-4 text-center text-xs text-text-muted-themed">No payments due this month.</p>
                                    )}
                                    {totalDueForCurrentMonth > 0 && (
                                        <div className="mt-2 pt-2 border-t border-border-secondary text-right pr-2">
                                            <span className="text-sm font-semibold text-text-muted-themed">Total Due: </span>
                                            <span className="font-bold" style={{ color: currentThemeColors.brandSecondary }}>{formatCurrency(totalDueForCurrentMonth)}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {activeTab === 'yearly' && (
                                <div className="animate-fade-in">
                                    {sortedMonthKeys.map(monthKey => {
                                        const itemsForMonth = paymentRemindersByMonth[monthKey];
                                        const totalDueForMonth = itemsForMonth.filter(item => !item.isPaid && item.incomeOrExpense !== 'income').reduce((sum, item) => sum + (item.amount || 0), 0);
                                        return (
                                            <div key={monthKey} className="mb-3">
                                                <h4 className="px-2 pt-1 pb-2 text-xs font-semibold uppercase text-text-muted-themed border-b" style={{borderColor: currentThemeColors.borderSecondary}}>{monthKey}</h4>
                                                <ul className="space-y-1 mt-1">{itemsForMonth.map(renderPaymentReminderItem)}</ul>
                                                {totalDueForMonth > 0 && (
                                                    <div className="mt-1 pt-1 border-t border-border-secondary/50 text-right pr-2">
                                                        <span className="text-xs font-semibold text-text-muted-themed">Total Due: </span>
                                                        <span className="text-xs font-bold" style={{ color: currentThemeColors.brandSecondary }}>{formatCurrency(totalDueForMonth)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            
                            {/* Other Reminders (always visible, below tabs) */}
                            <hr style={{borderColor: currentThemeColors.borderSecondary}} className="my-2"/>
                            
                            {rechargeReminders.length > 0 && (
                                 <section className="mb-2">
                                    <h3 className="p-2 text-[10px] font-black uppercase tracking-widest text-text-muted-themed flex items-center bg-slate-50 dark:bg-black/20 rounded-lg"><DevicePhoneMobileIcon className="w-3.5 h-3.5 mr-2 text-brand-primary"/>Recharges ({rechargeReminders.length})</h3>
                                    <ul className="space-y-1 mt-1">{rechargeReminders.map(renderOtherReminderItem)}</ul>
                                </section>
                            )}
                            {subscriptionReminders.length > 0 && (
                                 <section className="mb-2">
                                    <h3 className="p-2 text-[10px] font-black uppercase tracking-widest text-text-muted-themed flex items-center bg-slate-50 dark:bg-black/20 rounded-lg"><CreditCardIcon className="w-3.5 h-3.5 mr-2 text-brand-primary"/>Subscriptions ({subscriptionReminders.length})</h3>
                                    <ul className="space-y-1 mt-1">{subscriptionReminders.map(renderOtherReminderItem)}</ul>
                                </section>
                            )}
                            {todoReminders.length > 0 && (
                                <section className="mb-2">
                                    <h3 className="p-2 text-[10px] font-black uppercase tracking-widest text-text-muted-themed flex items-center bg-slate-50 dark:bg-black/20 rounded-lg"><ListChecksIcon className="w-3.5 h-3.5 mr-2 text-brand-primary"/>To-dos ({todoReminders.length})</h3>
                                    <ul className="space-y-1 mt-1">{todoReminders.map(renderOtherReminderItem)}</ul>
                                </section>
                            )}
                            {dayPlannerReminders.length > 0 && (
                                <section>
                                    <h3 className="p-2 text-[10px] font-black uppercase tracking-widest text-text-muted-themed flex items-center bg-slate-50 dark:bg-black/20 rounded-lg"><ClipboardDocumentCheckIcon className="w-3.5 h-3.5 mr-2 text-brand-primary"/>Planner ({dayPlannerReminders.length})</h3>
                                    <ul className="space-y-1 mt-1">{dayPlannerReminders.map(renderOtherReminderItem)}</ul>
                                </section>
                            )}
                            {festiveReminders.length > 0 && (
                                <section className="mt-2">
                                    <h3 className="p-2 text-[10px] font-black uppercase tracking-widest text-text-muted-themed flex items-center bg-slate-50 dark:bg-black/20 rounded-lg"><SparklesIcon className="w-3.5 h-3.5 mr-2 text-amber-500"/>Festivals ({festiveReminders.length})</h3>
                                    <ul className="space-y-1 mt-1">{festiveReminders.map(renderOtherReminderItem)}</ul>
                                </section>
                            )}
                        </div>
                        <div className="p-4 border-t border-border-secondary">
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="w-full px-4 py-2 text-sm font-medium rounded-lg shadow-sm"
                                style={{ backgroundColor: currentThemeColors.bgAccent, color: currentThemeColors.textBase }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReminderBell;