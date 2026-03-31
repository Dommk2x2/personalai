
import React, { useState, useMemo } from 'react';
import { SavedAmortizationSchedule, AmortizationEntry } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, CheckCircleIcon, XCircleIcon } from './Icons';
import { formatDateToYYYYMMDD } from '../utils/dateUtils';

interface EmiCalendarViewProps {
  schedules: SavedAmortizationSchedule[];
}

interface EmiDayEntry {
    loanName: string;
    amount: number;
    isPaid: boolean;
    monthIndex: number;
}

const EmiCalendarView: React.FC<EmiCalendarViewProps> = ({ schedules }) => {
  const { currentThemeColors } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const daysInMonth = (month: number, year: number): number => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number): number => new Date(year, month, 1).getDay();

  const emiDataMap = useMemo(() => {
    const map = new Map<string, EmiDayEntry[]>();
    // FIX: Use Array.isArray for robust handling of potentially corrupted localStorage data.
    const safeSchedules = (Array.isArray(schedules) ? schedules : []).filter(s => !s.isDeleted);

    safeSchedules.forEach(schedule => {
        schedule.schedule.forEach(entry => {
            const dateStr = entry.paymentDate; // YYYY-MM-DD
            const [y, m, d] = dateStr.split('-').map(Number);
            
            // Only care about entries in current month/year for better performance, 
            // though we map everything for general use if needed.
            if (y === currentYear && (m - 1) === currentMonth) {
                const dayEntries = map.get(dateStr) || [];
                dayEntries.push({
                    loanName: schedule.loanName,
                    amount: entry.emi,
                    isPaid: (schedule.paymentStatus || {})[entry.month] || false,
                    monthIndex: entry.month
                });
                map.set(dateStr, dayEntries);
            }
        });
    });
    return map;
  }, [schedules, currentMonth, currentYear]);

  const monthSummary = useMemo(() => {
    let totalDue = 0;
    let totalPaid = 0;
    
    emiDataMap.forEach(entries => {
        entries.forEach(e => {
            totalDue += e.amount;
            if (e.isPaid) totalPaid += e.amount;
        });
    });
    
    return { totalDue, totalPaid, totalPending: totalDue - totalPaid };
  }, [emiDataMap]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const renderDays = () => {
    const totalDays = daysInMonth(currentMonth, currentYear);
    const startingDay = firstDayOfMonth(currentMonth, currentYear);
    const daysArray = [];

    // Empty cells for padding
    for (let i = 0; i < startingDay; i++) {
      daysArray.push(<div key={`empty-${i}`} className="h-24 sm:h-32 border border-border-secondary bg-slate-50/30 dark:bg-black/5"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEntries = emiDataMap.get(dateStr) || [];
      const isToday = formatDateToYYYYMMDD(new Date()) === dateStr;

      daysArray.push(
        <div 
          key={day} 
          className={`h-24 sm:h-32 p-1.5 border border-border-secondary flex flex-col items-start gap-1 overflow-y-auto no-scrollbar transition-all hover:bg-bg-accent-themed/20 ${isToday ? 'is-today ring-1 ring-inset ring-brand-primary/30' : ''}`}
        >
          <span className={`text-[10px] font-black ${isToday ? 'text-brand-primary' : 'text-text-muted-themed'}`}>{day}</span>
          {dayEntries.map((e, idx) => (
              <div 
                key={idx} 
                className={`w-full p-1 rounded text-[8px] font-bold border truncate leading-tight shadow-sm`}
                style={{ 
                    backgroundColor: e.isPaid ? `${currentThemeColors.income}15` : `${currentThemeColors.brandPrimary}10`,
                    borderColor: e.isPaid ? `${currentThemeColors.income}30` : `${currentThemeColors.brandPrimary}30`,
                    color: e.isPaid ? currentThemeColors.income : currentThemeColors.brandPrimary
                }}
                title={`${e.loanName}: ${formatCurrency(e.amount)} (${e.isPaid ? 'Paid' : 'Pending'})`}
              >
                  <div className="flex justify-between items-center mb-0.5">
                      <span className="truncate max-w-[70%]">{e.loanName}</span>
                      {e.isPaid ? <CheckCircleIcon className="w-2 h-2"/> : <CalendarIcon className="w-2 h-2"/>}
                  </div>
                  <span className="opacity-80">{formatCurrency(e.amount)}</span>
              </div>
          ))}
        </div>
      );
    }

    // Fill remaining cells
    const remaining = 42 - daysArray.length;
    for (let i = 0; i < remaining; i++) {
        daysArray.push(<div key={`end-empty-${i}`} className="h-24 sm:h-32 border border-border-secondary bg-slate-50/30 dark:bg-black/5"></div>);
    }

    return daysArray;
  };

  return (
    <div className="bg-bg-secondary-themed rounded-2xl shadow-xl border border-border-secondary overflow-hidden animate-fade-in">
      {/* Calendar Header */}
      <div className="p-4 sm:p-6 bg-bg-primary-themed border-b border-border-secondary flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-border-secondary transition-all">
                <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div className="text-center min-w-[140px]">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-white">
                    {currentDate.toLocaleString('default', { month: 'long' })}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{currentYear}</p>
            </div>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-border-secondary transition-all">
                <ChevronRightIcon className="w-5 h-5" />
            </button>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
            <div className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-border-secondary shadow-sm text-center">
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Monthly Total</p>
                <p className="text-sm font-black text-slate-800 dark:text-white">{formatCurrency(monthSummary.totalDue)}</p>
            </div>
            <div className="flex-1 px-4 py-2 bg-income/5 rounded-xl border border-income/20 shadow-sm text-center">
                <p className="text-[8px] font-black uppercase text-income tracking-widest mb-0.5">Paid</p>
                <p className="text-sm font-black text-income">{formatCurrency(monthSummary.totalPaid)}</p>
            </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b border-border-secondary">
        {weekdays.map(day => (
          <div key={day} className="py-3 text-[9px] font-black uppercase tracking-[0.2em] text-center text-slate-400 bg-slate-50/50 dark:bg-black/20">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {renderDays()}
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-slate-50 dark:bg-black/20 flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-t border-border-secondary">
          <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-brand-primary/20 border border-brand-primary/40"></div>
              Scheduled EMI
          </div>
          <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-income/20 border border-income/40"></div>
              Paid EMI
          </div>
          {schedules.length === 0 && <span className="ml-auto text-rose-500">No active loans found. Create one in the calculator!</span>}
      </div>
    </div>
  );
};

export default EmiCalendarView;
