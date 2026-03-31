
import React, { useState, useEffect, useMemo } from 'react';
import { AttendanceEntry, AttendanceStatus, AttendanceHistoryEntry, AttendanceActionType } from '../types';
import { ATTENDANCE_STATUSES } from '../constants';
import { CalendarDaysIcon, PlusIcon, HistoryIcon } from './Icons'; 
import { useTheme } from '../contexts/ThemeContext';

interface AttendanceListComponentProps {
  attendanceEntries: AttendanceEntry[];
  onSaveEntry: (entry: AttendanceEntry) => void;
  attendanceHistory: AttendanceHistoryEntry[]; 
  monthlyOffLimits: Record<string, number>; // Updated: Max weekly offs per month (YYYY-MM: limit)
}

const AttendanceListComponent: React.FC<AttendanceListComponentProps> = ({ 
  attendanceEntries, 
  onSaveEntry,
  attendanceHistory,
  monthlyOffLimits 
}) => {
  const { currentThemeColors } = useTheme();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentStatus, setCurrentStatus] = useState<AttendanceStatus>(AttendanceStatus.PRESENT);
  const [currentNotes, setCurrentNotes] = useState<string>('');

  const existingEntryForSelectedDate = useMemo(() => 
    // FIX: Use Array.isArray for robust handling.
    (Array.isArray(attendanceEntries) ? attendanceEntries : []).find(e => e.date === selectedDate),
    [selectedDate, attendanceEntries]
  );

  const { currentMonthLimit, currentMonthWeeklyOffCount, disableWeeklyOffOption } = useMemo(() => {
    const yearMonthKey = selectedDate.substring(0, 7); // YYYY-MM
    const safeLimits = monthlyOffLimits ?? {};
    const limitForMonth = safeLimits[yearMonthKey] ?? 0; // Default to 0 (unlimited) if not set

    // FIX: Use Array.isArray for robust handling.
    const weeklyOffsInSelectedMonth = (Array.isArray(attendanceEntries) ? attendanceEntries : []).filter(
      e => e.date.startsWith(yearMonthKey) && e.status === AttendanceStatus.WEEKLY_OFF
    ).length;

    const isSelectedDayAlreadyWeeklyOff = existingEntryForSelectedDate?.status === AttendanceStatus.WEEKLY_OFF;
    
    const shouldDisable = 
      limitForMonth > 0 &&
      weeklyOffsInSelectedMonth >= limitForMonth &&
      !isSelectedDayAlreadyWeeklyOff;
      
    return { 
      currentMonthLimit: limitForMonth,
      currentMonthWeeklyOffCount: weeklyOffsInSelectedMonth,
      disableWeeklyOffOption: shouldDisable
    };
  }, [selectedDate, attendanceEntries, monthlyOffLimits, existingEntryForSelectedDate]);


  useEffect(() => {
    if (existingEntryForSelectedDate) {
      setCurrentStatus(existingEntryForSelectedDate.status);
      setCurrentNotes(existingEntryForSelectedDate.notes || '');
    } else {
      // If "Weekly Off" is disabled for the new month and was the current status, reset to PRESENT
      if (disableWeeklyOffOption && currentStatus === AttendanceStatus.WEEKLY_OFF) {
        setCurrentStatus(AttendanceStatus.PRESENT);
      } else if (!existingEntryForSelectedDate) { // Only reset to PRESENT if it's truly a new entry for the date
        setCurrentStatus(AttendanceStatus.PRESENT);
      }
      setCurrentNotes('');
    }
  }, [selectedDate, existingEntryForSelectedDate, disableWeeklyOffOption]); // currentStatus removed from deps to prevent potential loops when it's programmatically set

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveEntry({ date: selectedDate, status: currentStatus, notes: currentNotes.trim() });
    alert(`Attendance for ${selectedDate} saved as ${currentStatus}.`);
  };
  
  const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-bg-secondary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-text-base-themed placeholder-text-muted-themed dark:[color-scheme:light]";
  const labelBaseClasses = "block text-sm font-medium text-text-muted-themed mb-1";

  const getStatusColor = (status: AttendanceStatus | undefined) => {
    if (!status) return currentThemeColors.textMuted;
    switch (status) {
      case AttendanceStatus.PRESENT:
        return currentThemeColors.income;
      case AttendanceStatus.ABSENT:
      case AttendanceStatus.SICK_LEAVE:
      case AttendanceStatus.CASUAL_LEAVE:
        return currentThemeColors.expense;
      case AttendanceStatus.HALF_DAY_PRESENT:
        return '#25b9c5';
      case AttendanceStatus.WORK_FROM_HOME:
        return '#3b82f6';
      case AttendanceStatus.WEEKLY_OFF:
        return currentThemeColors.textMuted;
      default:
        return currentThemeColors.textMuted;
    }
  };
  
  const historyForSelectedDate = (attendanceHistory ?? [])
    .filter(h => h.dateOfAttendance === selectedDate)
    .sort((a, b) => b.timestamp - a.timestamp); 

  const formatHistoryTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', { 
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' 
    });
  };

  const displayLimitText = currentMonthLimit > 0 ? currentMonthLimit : "Unlimited";

  return (
    <div className="bg-bg-secondary-themed p-4 sm:p-6 rounded-xl shadow-lg relative pb-24">
      <h2 className="text-xl sm:text-2xl font-semibold text-text-base-themed mb-6 flex items-center">
        <CalendarDaysIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 text-brand-primary" />
        Daily Work Attendance
      </h2>
      <p className="text-xs text-text-muted-themed mb-3 text-center">
          Weekly Offs for {new Date(selectedDate + 'T00:00:00').toLocaleString('default', { month: 'long', year: 'numeric' })}: {currentMonthWeeklyOffCount} / {displayLimitText}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4" id="attendance-form">
        <div>
          <label htmlFor="attendance-date" className={labelBaseClasses}>Select Date:</label>
          <input
            type="date"
            id="attendance-date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={inputBaseClasses}
            required
            aria-label="Select attendance date"
          />
        </div>
        <div>
          <label htmlFor="attendance-status" className={labelBaseClasses}>Status:</label>
          <select
            id="attendance-status"
            value={currentStatus}
            onChange={(e) => setCurrentStatus(e.target.value as AttendanceStatus)}
            className={inputBaseClasses}
            required
            aria-label="Select attendance status"
          >
            {ATTENDANCE_STATUSES.map(statusValue => (
              <option 
                key={statusValue} 
                value={statusValue} 
                className="text-text-base-themed bg-bg-secondary-themed"
                disabled={statusValue === AttendanceStatus.WEEKLY_OFF && disableWeeklyOffOption}
              >
                {statusValue.replace(/_/g, ' ')} 
                {statusValue === AttendanceStatus.WEEKLY_OFF && disableWeeklyOffOption && " (Limit Reached)"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="attendance-notes" className={labelBaseClasses}>Notes (Optional):</label>
          <textarea
            id="attendance-notes"
            value={currentNotes}
            onChange={(e) => setCurrentNotes(e.target.value)}
            rows={3}
            className={inputBaseClasses}
            placeholder="e.g., WFH, Team meeting, Client visit, etc."
            aria-label="Attendance notes"
          />
        </div>
      </form>

      <button 
          type="submit" 
          form="attendance-form"
          className="absolute bottom-6 right-6 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-bg-secondary-themed"
          style={{ backgroundColor: currentThemeColors.brandPrimary, color: currentThemeColors.textInverted, '--focus-ring-color': currentThemeColors.brandPrimary } as React.CSSProperties}
          aria-label="Save Attendance"
      >
          <PlusIcon className="w-8 h-8" />
      </button>

      {existingEntryForSelectedDate && (
        <div className="mt-6 p-3 bg-bg-accent-themed rounded-lg">
          <p className="text-sm text-text-base-themed">
            Current saved status for {selectedDate}:
            <span className="font-semibold ml-1" style={{color: getStatusColor(existingEntryForSelectedDate.status)}}>
               {existingEntryForSelectedDate.status.replace(/_/g, ' ')}
            </span>
            {existingEntryForSelectedDate.notes && <span className="text-text-muted-themed text-xs block mt-0.5">Notes: {existingEntryForSelectedDate.notes}</span>}
          </p>
        </div>
      )}

      {historyForSelectedDate.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border-secondary">
          <h3 className="text-md font-semibold text-text-base-themed mb-3 flex items-center">
            <HistoryIcon className="w-5 h-5 mr-2 text-brand-primary" />
            History for {selectedDate}
          </h3>
          <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {historyForSelectedDate.map(log => (
              <li key={log.id} className="p-2 bg-bg-accent-themed/50 rounded-md text-xs">
                <div className="flex justify-between items-center mb-0.5">
                    <span className="font-semibold" style={{color: currentThemeColors.textBase}}>
                        {log.actionType === AttendanceActionType.CREATED ? "Entry Created" : "Entry Updated"}
                    </span>
                    <span className="text-text-muted-themed">{formatHistoryTimestamp(log.timestamp)}</span>
                </div>
                {log.actionType === AttendanceActionType.UPDATED && log.previousStatus !== log.newStatus && (
                    <p>
                        Status: <span style={{color: getStatusColor(log.previousStatus)}}>{log.previousStatus?.replace(/_/g, ' ') || 'N/A'}</span> 
                        ➔ <span style={{color: getStatusColor(log.newStatus)}}>{log.newStatus.replace(/_/g, ' ')}</span>
                    </p>
                )}
                {log.actionType === AttendanceActionType.CREATED && (
                    <p>Status Set: <span style={{color: getStatusColor(log.newStatus)}}>{log.newStatus.replace(/_/g, ' ')}</span></p>
                )}
                
                {log.previousNotes !== log.newNotes && (
                    <p>
                        Notes: 
                        {log.actionType === AttendanceActionType.UPDATED && log.previousNotes && <span className="line-through text-text-muted-themed mr-1">"{log.previousNotes}"</span>}
                        {log.newNotes ? <span className="text-text-base-themed">"{log.newNotes}"</span> : <span className="text-text-muted-themed italic">cleared</span>}
                    </p>
                )}
                 {log.actionType === AttendanceActionType.CREATED && log.newNotes && (
                    <p>Notes Added: <span className="text-text-base-themed">"{log.newNotes}"</span></p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AttendanceListComponent;
