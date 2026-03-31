import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, ChevronDownIcon, XIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import { getFinancialMonthIdentifier, getPeriodDateRange, formatDateToYYYYMMDD, formatDateDisplay } from '../utils/dateUtils';
import { BudgetPeriod, AppMode } from '../types';

export type FilterPeriod = 'All time' | 'Yearly' | 'Monthly' | 'Weekly' | 'Daily' | 'Last Month' | 'Last 3 Months' | 'Last 6 Months' | 'Custom';

interface DateFilterProps {
  onDateRangeChange: (startDate: string | null, endDate: string | null, period: FilterPeriod) => void;
  defaultPeriod: FilterPeriod;
  financialMonthStartDay: number;
  financialMonthEndDay: number;
  financialYearStartMonth: number;
  financialYearStartDay: number;
  financialYearEndMonth: number;
  financialYearEndDay: number;
  activeMode: AppMode;
}

const DateFilter: React.FC<DateFilterProps> = ({ 
  onDateRangeChange,
  defaultPeriod,
  financialMonthStartDay,
  financialMonthEndDay,
  financialYearStartMonth,
  financialYearStartDay,
  financialYearEndMonth,
  financialYearEndDay,
  activeMode,
}) => {
  const { currentThemeColors } = useTheme();
  const [activePeriod, setActivePeriod] = useState<FilterPeriod>(defaultPeriod);
  const [targetDate, setTargetDate] = useState(new Date());
  
  // Custom date state
  const [customStartDate, setCustomStartDate] = useState(formatDateToYYYYMMDD(new Date()));
  const [customEndDate, setCustomEndDate] = useState(formatDateToYYYYMMDD(new Date()));

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActivePeriod(defaultPeriod);
  }, [defaultPeriod]);

  const getFinancialYearStartYear = (date: Date, startMonth: number, startDay: number): number => {
    const startOfFinYearInCurrentYear = new Date(date.getFullYear(), startMonth - 1, startDay);
    if (date < startOfFinYearInCurrentYear) {
        return date.getFullYear() - 1;
    } else {
        return date.getFullYear();
    }
  };

  const calculateDateRange = useCallback((period: FilterPeriod, date: Date): [string | null, string | null] => {
    switch (period) {
      case 'All time': return [null, null];
      case 'Custom': return [customStartDate, customEndDate];
      case 'Monthly': {
        const identifier = getFinancialMonthIdentifier(date, financialMonthStartDay);
        const { start, end } = getPeriodDateRange(BudgetPeriod.MONTHLY, identifier, { startDay: financialMonthStartDay, endDay: financialMonthEndDay });
        return [formatDateToYYYYMMDD(start), formatDateToYYYYMMDD(end)];
      }
      case 'Weekly': {
        const d = new Date(date);
        const diff = d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1);
        const start = new Date(d.setDate(diff));
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return [formatDateToYYYYMMDD(start), formatDateToYYYYMMDD(end)];
      }
      case 'Daily': return [formatDateToYYYYMMDD(date), formatDateToYYYYMMDD(date)];
      case 'Yearly': {
          const startYear = getFinancialYearStartYear(date, financialYearStartMonth, financialYearStartDay);
          const start = new Date(startYear, financialYearStartMonth - 1, financialYearStartDay);
          const end = new Date(startYear, financialYearEndMonth - 1, financialYearEndDay);
          
          // If end date is before start date, it means the financial year spans across two calendar years
          if (end < start) {
              end.setFullYear(end.getFullYear() + 1);
          }
          return [formatDateToYYYYMMDD(start), formatDateToYYYYMMDD(end)];
      }
      default: return [null, null];
    }
  }, [financialMonthStartDay, financialMonthEndDay, financialYearStartMonth, financialYearStartDay, financialYearEndMonth, financialYearEndDay, customStartDate, customEndDate]);
  
  useEffect(() => {
    const [start, end] = calculateDateRange(activePeriod, targetDate);
    onDateRangeChange(start, end, activePeriod);
  }, [activePeriod, targetDate, customStartDate, customEndDate, onDateRangeChange, calculateDateRange]);
  
  const handleDateNavigate = (amount: number) => {
    setTargetDate(current => {
      const next = new Date(current);
      if (activePeriod === 'Monthly') next.setMonth(next.getMonth() + amount, 15);
      else if (activePeriod === 'Weekly') next.setDate(next.getDate() + (amount * 7));
      else if (activePeriod === 'Yearly') next.setFullYear(next.getFullYear() + amount);
      else next.setDate(next.getDate() + amount);
      return next;
    });
  };

  const navDateDisplay = useMemo(() => {
    if (activePeriod === 'All time') return 'All Time';
    if (activePeriod === 'Custom') return `${formatDateDisplay(customStartDate)} - ${formatDateDisplay(customEndDate)}`;
    
    const [start, end] = calculateDateRange(activePeriod, targetDate);
    if (start && end) {
        if (activePeriod === 'Daily') return formatDateDisplay(start);
        return `${formatDateDisplay(start)} - ${formatDateDisplay(end)}`;
    }
    
    return targetDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric', day: activePeriod === 'Daily' ? 'numeric' : undefined });
  }, [activePeriod, targetDate, customStartDate, customEndDate, calculateDateRange, financialYearStartMonth, financialYearStartDay]);

  const isCustom = activePeriod === 'Custom';

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between gap-1 p-1 bg-slate-100 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-slate-800">
        {(['Daily', 'Weekly', 'Monthly'] as FilterPeriod[]).map(p => (
            <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-tighter rounded-lg transition-all duration-300 ${activePeriod === p ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm scale-105' : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
            >
                {p}
            </button>
        ))}
        <div className="relative" ref={dropdownRef}>
             <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-tighter rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/50 flex items-center gap-1 ${['Yearly', 'All time', 'Custom'].includes(activePeriod) ? 'text-brand-primary' : 'text-slate-500'}`}
            >
                {['Yearly', 'All time', 'Custom'].includes(activePeriod) ? activePeriod : 'More'}
                <ChevronDownIcon className="w-3 h-3" />
            </button>
            {isMoreOpen && (
                <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 p-2 animate-modal-enter">
                    <button onClick={() => {setActivePeriod('Yearly'); setIsMoreOpen(false);}} className="w-full text-left py-2 px-3 text-[10px] font-black uppercase hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg mb-1">Yearly</button>
                    <button onClick={() => {setActivePeriod('All time'); setIsMoreOpen(false);}} className="w-full text-left py-2 px-3 text-[10px] font-black uppercase hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg mb-1">All Time</button>
                    <button onClick={() => {setActivePeriod('Custom'); setIsMoreOpen(false);}} className="w-full text-left py-2 px-3 text-[10px] font-black uppercase hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" style={{ color: currentThemeColors.brandSecondary }}>Custom Range</button>
                </div>
            )}
        </div>
      </div>
      
      {activePeriod !== 'All time' && !isCustom && (
          <div className="flex items-center justify-between p-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 animate-fade-in">
              <button onClick={() => handleDateNavigate(-1)} className="p-1.5 text-slate-400 hover:text-brand-primary transition-colors"><ChevronLeftIcon className="w-4 h-4"/></button>
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <CalendarIcon className="w-3.5 h-3.5 text-brand-primary" />
                  {navDateDisplay}
              </span>
              <button onClick={() => handleDateNavigate(1)} className="p-1.5 text-slate-400 hover:text-brand-primary transition-colors"><ChevronRightIcon className="w-4 h-4"/></button>
          </div>
      )}

      {isCustom && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 animate-fade-in">
              <div className="flex flex-col px-2 py-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Start Date</span>
                  <input 
                    type="date" 
                    value={customStartDate} 
                    onChange={e => setCustomStartDate(e.target.value)}
                    className="bg-transparent text-[10px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none dark:[color-scheme:dark]"
                  />
              </div>
              <div className="flex flex-col px-2 py-1 border-l border-slate-200 dark:border-slate-800">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">End Date</span>
                  <input 
                    type="date" 
                    value={customEndDate} 
                    onChange={e => setCustomEndDate(e.target.value)}
                    className="bg-transparent text-[10px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none dark:[color-scheme:dark]"
                  />
              </div>
          </div>
      )}
    </div>
  );
};

export default DateFilter;