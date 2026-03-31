
import React, { useState, useMemo } from 'react';
import { AttendanceEntry, AttendanceStatus } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon as PageIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';

interface AttendanceCalendarViewComponentProps {
  attendanceEntries: AttendanceEntry[];
}

const AttendanceCalendarViewComponent: React.FC<AttendanceCalendarViewComponentProps> = ({ attendanceEntries }) => {
  const { currentThemeColors } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const daysInMonth = (month: number, year: number): number => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number): number => new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)

  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceEntry>();
    attendanceEntries.forEach(entry => map.set(entry.date, entry));
    return map;
  }, [attendanceEntries]);

  const getStatusColorInfo = (status: AttendanceStatus | undefined): { bgColor: string; textColor: string; shortCode: string } => {
    if (!status) return { bgColor: 'transparent', textColor: currentThemeColors.textMuted, shortCode: '' };
    
    let bgColor = 'transparent';
    let textColor = currentThemeColors.textBase;
    let shortCode = '';

    switch (status) {
      case AttendanceStatus.PRESENT:
        bgColor = `${currentThemeColors.income}33`; // Light green (alpha ~0.2)
        textColor = currentThemeColors.income;
        shortCode = 'P';
        break;
      case AttendanceStatus.ABSENT:
        bgColor = `${currentThemeColors.expense}4D`; // Light red (alpha ~0.3)
        textColor = currentThemeColors.expense;
        shortCode = 'A';
        break;
      case AttendanceStatus.SICK_LEAVE:
        bgColor = `${currentThemeColors.expense}4D`; 
        textColor = currentThemeColors.expense;
        shortCode = 'SL';
        break;
      case AttendanceStatus.CASUAL_LEAVE:
        bgColor = `${currentThemeColors.expense}4D`; 
        textColor = currentThemeColors.expense;
        shortCode = 'CL';
        break;
      case AttendanceStatus.HALF_DAY_PRESENT:
        bgColor = '#25b9c533';
        textColor = '#25b9c5';
        shortCode = 'HD';
        break;
      case AttendanceStatus.WORK_FROM_HOME:
        bgColor = '#3b82f633';
        textColor = '#3b82f6';
        shortCode = 'WFH';
        break;
      case AttendanceStatus.WEEKLY_OFF:
        bgColor = currentThemeColors.bgAccent;
        textColor = currentThemeColors.textMuted;
        shortCode = 'WO';
        break;
      default:
        bgColor = currentThemeColors.bgAccent;
        textColor = currentThemeColors.textMuted;
        shortCode = '?';
        break;
    }
    return { bgColor, textColor, shortCode };
  };

  const renderCalendarDays = () => {
    const totalDays = daysInMonth(currentMonth, currentYear);
    const startingDay = firstDayOfMonth(currentMonth, currentYear);
    const daysArray = [];

    for (let i = 0; i < startingDay; i++) {
      daysArray.push(<div key={`empty-start-${i}`} className="border border-border-secondary h-20 sm:h-24"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entry = attendanceMap.get(dateStr);
      const { bgColor, textColor, shortCode } = getStatusColorInfo(entry?.status);
      const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();

      daysArray.push(
        <div 
          key={day} 
          className={`p-1.5 sm:p-2 border h-20 sm:h-24 flex flex-col items-center justify-start relative transition-all duration-150 ease-in-out hover:shadow-md ${isToday ? 'is-today' : ''}`}
          style={{ 
            borderColor: currentThemeColors.borderSecondary,
            backgroundColor: bgColor,
          }}
          title={entry ? `${entry.status.replace(/_/g, ' ')}${entry.notes ? ` - ${entry.notes}` : ''}` : 'No entry'}
        >
          <span className={`day-number text-xs sm:text-sm font-medium ${isToday ? 'text-brand-primary' : 'text-text-base-themed'}`}>{day}</span>
          {entry && (
            <span className="mt-1 text-xs sm:text-sm font-semibold" style={{ color: textColor }}>
              {shortCode || entry.status.substring(0,1)}
            </span>
          )}
          {entry && entry.notes && (
            <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full" style={{backgroundColor: textColor, opacity: 0.7}} title={`Notes: ${entry.notes}`}></div>
          )}
        </div>
      );
    }
    
    const totalCells = daysArray.length > 35 ? 42 : 35;
    while(daysArray.length < totalCells) {
        daysArray.push(<div key={`empty-end-${daysArray.length}`} className="border border-border-secondary h-20 sm:h-24"></div>);
    }

    return daysArray;
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + offset, 1));
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-bg-secondary-themed p-4 sm:p-6 rounded-xl shadow-lg">
      <h2 className="text-xl sm:text-2xl font-semibold text-text-base-themed mb-4 flex items-center">
        <PageIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 text-brand-primary" />
        Attendance Calendar View
      </h2>
      <div className="flex justify-between items-center mb-4">
        <button 
            onClick={() => changeMonth(-1)} 
            className="p-2 rounded-lg hover:bg-bg-accent-themed transition-colors duration-150"
            style={{color: currentThemeColors.textMuted}}
            aria-label="Previous month"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <h3 className="text-lg sm:text-xl font-semibold" style={{color: currentThemeColors.textBase}}>
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <button 
            onClick={() => changeMonth(1)} 
            className="p-2 rounded-lg hover:bg-bg-accent-themed transition-colors duration-150"
            style={{color: currentThemeColors.textMuted}}
            aria-label="Next month"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-px text-center text-xs sm:text-sm font-medium" style={{backgroundColor: currentThemeColors.borderSecondary}}>
        {weekdays.map(day => (
          <div key={day} className="py-2" style={{backgroundColor: currentThemeColors.bgAccent, color: currentThemeColors.textMuted}}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px" style={{backgroundColor: currentThemeColors.borderSecondary}}>
        {renderCalendarDays()}
      </div>
       {attendanceEntries.length === 0 && (
        <p className="text-center text-text-muted-themed mt-6">
          No attendance data recorded yet. Please log entries in the "Log Attendance" section.
        </p>
      )}
    </div>
  );
};

export default AttendanceCalendarViewComponent;
