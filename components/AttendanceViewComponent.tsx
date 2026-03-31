
import React, { useState, useMemo, useEffect } from 'react';
import { AttendanceEntry, AttendanceStatus } from '../types';
import { ListBulletIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';

interface AttendanceViewComponentProps {
  attendanceEntries: AttendanceEntry[];
}

const ITEMS_PER_PAGE = 10;

const AttendanceViewComponent: React.FC<AttendanceViewComponentProps> = ({ attendanceEntries }) => {
  const { currentThemeColors } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);

  const sortedEntries = useMemo(() => 
    [...attendanceEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [attendanceEntries]
  );

  const totalPages = Math.ceil(sortedEntries.length / ITEMS_PER_PAGE);

  const currentPagedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedEntries.slice(startIndex, endIndex);
  }, [sortedEntries, currentPage]);

  useEffect(() => {
    setCurrentPage(1); 
  }, [attendanceEntries]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString + 'T00:00:00').toLocaleDateString(undefined, options);
  };

  const getStatusInfo = (status: AttendanceStatus): { color: string, bgColor: string } => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return { color: currentThemeColors.income, bgColor: `${currentThemeColors.income}33` };
      case AttendanceStatus.ABSENT:
      case AttendanceStatus.SICK_LEAVE:
      case AttendanceStatus.CASUAL_LEAVE:
        return { color: currentThemeColors.expense, bgColor: `${currentThemeColors.expense}4D` };
      case AttendanceStatus.HALF_DAY_PRESENT:
        return { color: '#25b9c5', bgColor: '#25b9c533' };
      case AttendanceStatus.WORK_FROM_HOME:
        return { color: '#3b82f6', bgColor: '#3b82f633' };
      case AttendanceStatus.WEEKLY_OFF:
        return { color: currentThemeColors.textMuted, bgColor: currentThemeColors.bgAccent };
      default:
        return { color: currentThemeColors.textMuted, bgColor: currentThemeColors.bgAccent };
    }
  };
  
  if (attendanceEntries.length === 0) {
    return (
      <div className="bg-bg-secondary-themed p-6 rounded-xl shadow-lg text-center">
        <img 
          src="https://picsum.photos/seed/attendanceempty/300/200?grayscale" 
          alt="Empty attendance list illustration" 
          className="mx-auto mb-4 rounded-lg w-32 h-24 sm:w-40 sm:h-32 md:w-48 md:h-32 object-cover opacity-70 dark:opacity-50" 
        />
        <p className="text-text-base-themed text-lg">No attendance records yet.</p>
        <p className="text-sm text-text-muted-themed">Use "Log Attendance" to add your daily entries.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary-themed p-4 sm:p-6 rounded-xl shadow-lg">
      <h2 className="text-lg sm:text-xl font-semibold text-text-base-themed mb-4 flex items-center">
        <ListBulletIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-brand-primary" />
        Attendance Log
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm text-left text-text-muted-themed">
          <thead className="text-xs text-text-base-themed uppercase bg-bg-accent-themed">
            <tr>
              <th scope="col" className="px-4 py-3">Date</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {currentPagedEntries.map((entry, index) => {
              const { color, bgColor } = getStatusInfo(entry.status);
              return (
                <tr key={`${entry.date}-${index}`} className={`border-b border-border-secondary ${index % 2 === 0 ? 'bg-bg-secondary-themed' : 'bg-bg-accent-themed/50'} hover:bg-bg-accent-themed`}>
                  <td className="px-4 py-3 font-medium text-text-base-themed whitespace-nowrap">{formatDate(entry.date)}</td>
                  <td className="px-4 py-3">
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-semibold" 
                      style={{ 
                          backgroundColor: bgColor,
                          color: color 
                      }}
                    >
                      {entry.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-base-themed truncate max-w-xs" title={entry.notes}>{entry.notes || '–'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center text-sm">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg shadow-sm flex items-center transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1 dark:focus:ring-offset-bg-secondary-themed"
            style={{
                backgroundColor: currentThemeColors.bgAccent, 
                color: currentThemeColors.textBase,
                border: `1px solid ${currentThemeColors.borderSecondary}`
            }}
            onMouseOver={(e) => { if(currentPage !== 1) e.currentTarget.style.backgroundColor = `${currentThemeColors.bgAccent}E6`; e.currentTarget.classList.add('hover:shadow-md');}}
            onMouseOut={(e) => { if(currentPage !== 1) e.currentTarget.style.backgroundColor = currentThemeColors.bgAccent; e.currentTarget.classList.remove('hover:shadow-md');}}
          >
            <ChevronLeftIcon className="w-4 h-4 mr-1" /> Previous
          </button>
          <span className="text-text-muted-themed">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg shadow-sm flex items-center transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1 dark:focus:ring-offset-bg-secondary-themed"
            style={{
                backgroundColor: currentThemeColors.bgAccent, 
                color: currentThemeColors.textBase,
                border: `1px solid ${currentThemeColors.borderSecondary}`
            }}
            onMouseOver={(e) => { if(currentPage !== totalPages) e.currentTarget.style.backgroundColor = `${currentThemeColors.bgAccent}E6`; e.currentTarget.classList.add('hover:shadow-md');}}
            onMouseOut={(e) => { if(currentPage !== totalPages) e.currentTarget.style.backgroundColor = currentThemeColors.bgAccent; e.currentTarget.classList.remove('hover:shadow-md');}}
          >
            Next <ChevronRightIcon className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceViewComponent;
