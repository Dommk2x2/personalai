
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, BudgetPeriod } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import { getPeriodDateRange, getFinancialMonthIdentifier, formatDateToYYYYMMDD } from '../utils/dateUtils';

interface FinancialCalendarViewComponentProps {
  transactions: Transaction[];
  formatCurrency: (amount: number) => string;
  financialMonthStartDay: number;
  financialMonthEndDay: number;
  accountName?: string;
  onDateSelect: (date: string) => void;
  onOpenDateDetails: (date: string) => void;
  onOpenDateDetailsForDownload: (date: string) => void;
}

const FinancialCalendarViewComponent: React.FC<FinancialCalendarViewComponentProps> = ({
  transactions,
  formatCurrency,
  financialMonthStartDay,
  financialMonthEndDay,
  onDateSelect,
  onOpenDateDetails,
  onOpenDateDetailsForDownload,
}) => {
  const { currentThemeColors } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  const dailyFinancialsMap = useMemo(() => {
    const map = new Map<string, { income: number; expenses: number; count: number }>();
    transactions.forEach(tx => {
      const dayData = map.get(tx.date) || { income: 0, expenses: 0, count: 0 };
      if (tx.type === TransactionType.INCOME) {
        dayData.income += tx.amount;
      } else if (tx.type === TransactionType.EXPENSE) {
        dayData.expenses += tx.amount;
      }
      dayData.count += 1;
      map.set(tx.date, dayData);
    });
    return map;
  }, [transactions]);

  const { finPeriodStart, finPeriodEnd, gridStartDate, gridEndDate } = useMemo(() => {
    const identifier = getFinancialMonthIdentifier(currentDate, financialMonthStartDay);
    const { start, end } = getPeriodDateRange(BudgetPeriod.MONTHLY, identifier, { startDay: financialMonthStartDay, endDay: financialMonthEndDay });

    const gridStart = new Date(start);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());
    gridStart.setHours(0, 0, 0, 0);

    const gridEnd = new Date(end);
    gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));
    gridEnd.setHours(23, 59, 59, 999);

    return {
      finPeriodStart: start,
      finPeriodEnd: end,
      gridStartDate: gridStart,
      gridEndDate: gridEnd,
    };
  }, [currentDate, financialMonthStartDay, financialMonthEndDay]);

  const changeFinancialPeriod = (offset: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + offset, 15);
      return newDate;
    });
  };

  const formatDateForHeader = (date: Date): string => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
  };

  const renderCalendarGrid = () => {
    const daysArray: React.ReactNode[] = [];
    let loopDate = new Date(gridStartDate);
    const todayStr = formatDateToYYYYMMDD(new Date());

    while (loopDate <= gridEndDate) {
      const dateStr = formatDateToYYYYMMDD(loopDate);
      const day = loopDate.getDate();
      const isWithinFinancialPeriod = loopDate >= finPeriodStart && loopDate <= finPeriodEnd;
      const financials = dailyFinancialsMap.get(dateStr);
      const isToday = dateStr === todayStr;

      const cellClasses = [
        "group relative aspect-square p-2 flex flex-col justify-between text-left border transition-all duration-200 overflow-hidden",
        isWithinFinancialPeriod ? "bg-white dark:bg-slate-900 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50" : "bg-slate-50 dark:bg-black/20 opacity-40",
        "border-slate-100 dark:border-slate-800",
        isToday ? "ring-1 ring-inset ring-brand-primary/30" : ""
      ].join(" ");

      daysArray.push(
        <div
          key={dateStr}
          className={cellClasses}
          onContextMenu={(e) => {
            if (isWithinFinancialPeriod && financials) {
                e.preventDefault();
                onOpenDateDetailsForDownload(dateStr);
            }
          }}
          onClick={() => {
            if (isWithinFinancialPeriod) {
              if (financials) {
                onOpenDateDetails(dateStr);
              } else {
                onDateSelect(dateStr);
              }
            }
          }}
        >
          <div className="flex justify-between items-start z-10">
            <span className={`day-number text-xs font-black ${isToday ? 'text-brand-primary' : (isWithinFinancialPeriod ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400')}`}>{day}</span>
            
            {/* Quick Record Button */}
            {isWithinFinancialPeriod && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDateSelect(dateStr);
                    }}
                    className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-brand-primary hover:text-white text-brand-primary transition-all duration-200"
                    title="Record Transaction"
                >
                    <PlusIcon className="w-3.5 h-3.5" />
                </button>
            )}
          </div>

          {financials && isWithinFinancialPeriod && (
            <div className="text-[8px] sm:text-[10px] space-y-0.5 mt-auto">
              {financials.income > 0 && <p className="font-black break-all" style={{ color: currentThemeColors.income }}>+{formatCurrency(financials.income)}</p>}
              {financials.expenses > 0 && <p className="font-black break-all" style={{ color: currentThemeColors.expense }}>-{formatCurrency(financials.expenses)}</p>}
              {financials.count > 1 && <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-widest">{financials.count} items</p>}
            </div>
          )}
          
          {/* Subtle watermark background for today */}
          {isToday && (
              <div className="absolute -bottom-2 -right-2 opacity-5 pointer-events-none">
                  <PlusIcon className="w-16 h-16 text-brand-primary rotate-12" />
              </div>
          )}
        </div>
      );
      loopDate.setDate(loopDate.getDate() + 1);
    }
    return daysArray;
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in">
      <div className="p-4 sm:p-6 bg-bg-primary-themed border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
          onClick={() => changeFinancialPeriod(-1)}
          className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-800 transition-all"
        >
          <ChevronLeftIcon className="w-5 h-5 text-slate-500" />
        </button>
        <div className="text-center min-w-[200px]">
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-white">
                Financial Ledger
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
                {formatDateForHeader(finPeriodStart)} — {formatDateForHeader(finPeriodEnd)}
            </p>
        </div>
        <button
          onClick={() => changeFinancialPeriod(1)}
          className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-800 transition-all"
        >
          <ChevronRightIcon className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
        {weekdays.map(day => (
          <div key={day} className="py-3 text-[9px] font-black uppercase tracking-[0.2em] text-center text-slate-400 bg-slate-50/50 dark:bg-black/20">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {renderCalendarGrid()}
      </div>
      
      <div className="p-4 bg-slate-50 dark:bg-black/20 flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentThemeColors.income }}></div>
              Daily Credits
          </div>
          <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentThemeColors.expense }}></div>
              Daily Debits
          </div>
          <div className="ml-auto flex items-center gap-1.5">
              <PlusIcon className="w-3 h-3 text-brand-primary" />
              Hover date for quick record
          </div>
      </div>
    </div>
  );
};

export default FinancialCalendarViewComponent;
