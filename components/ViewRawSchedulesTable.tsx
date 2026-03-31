
import React from 'react';
import { SavedAmortizationSchedule, ToastType } from '../types';
import { CalendarDaysIcon, EyeIcon, TrashIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import { formatDateDisplay, formatTimestamp } from '../utils/dateUtils';
import { hexToRgba } from '../utils/colorUtils';

interface ViewRawSchedulesTableProps {
  savedAmortizationSchedules: SavedAmortizationSchedule[];
  setSavedAmortizationSchedules: React.Dispatch<React.SetStateAction<SavedAmortizationSchedule[]>>; // Kept for potential direct ops if needed, but delete flows via App.tsx
  onLoadSchedule: (scheduleId: string) => void;
  addToast: (message: string, type: ToastType) => void;
  onDeleteSchedule: (scheduleId: string) => void; // New prop for soft deletion
}

export const ViewRawSchedulesTable: React.FC<ViewRawSchedulesTableProps> = ({
  savedAmortizationSchedules,
  setSavedAmortizationSchedules,
  onLoadSchedule,
  addToast,
  onDeleteSchedule,
}) => {
  const { currentThemeColors } = useTheme();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const nonDeletedSchedules = React.useMemo(() => {
    return (savedAmortizationSchedules ?? []).filter(s => !s.isDeleted);
  }, [savedAmortizationSchedules]);


  const tableBaseClasses = "w-full text-sm text-left";
  const thClasses = "px-3 sm:px-4 py-2 sm:py-3 text-xs uppercase sticky top-0 z-10";
  const tdClasses = "px-3 sm:px-4 py-2 sm:py-3 border-b";
  const tableContainerClasses = "overflow-x-auto max-h-[300px] sm:max-h-[400px] rounded-lg border relative";

  return (
    <div className="p-3 sm:p-4 rounded-lg" style={{ backgroundColor: currentThemeColors.bgSecondary }}>
      <h3 className="text-md sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 flex items-center" style={{ color: currentThemeColors.textBase }}>
        <CalendarDaysIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-brand-primary" />
        Saved EMI Schedules ({nonDeletedSchedules.length})
      </h3>
      {nonDeletedSchedules.length > 0 ? (
        <div className={tableContainerClasses} style={{ borderColor: currentThemeColors.borderSecondary }}>
          <table className={tableBaseClasses} style={{ color: currentThemeColors.textMuted }}>
            <thead style={{ backgroundColor: currentThemeColors.bgAccent }}>
              <tr>
                <th scope="col" className={thClasses} style={{ color: currentThemeColors.textBase }}>Loan Name</th>
                <th scope="col" className={`${thClasses} text-right`} style={{ color: currentThemeColors.textBase }}>Principal</th>
                <th scope="col" className={`${thClasses} text-right`} style={{ color: currentThemeColors.textBase }}>EMI</th>
                <th scope="col" className={thClasses} style={{ color: currentThemeColors.textBase }}>Tenure</th>
                <th scope="col" className={thClasses} style={{ color: currentThemeColors.textBase }}>Start Date</th>
                <th scope="col" className={thClasses} style={{ color: currentThemeColors.textBase }}>Saved At</th>
                <th scope="col" className={thClasses} style={{ color: currentThemeColors.textBase }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {nonDeletedSchedules.map((schedule, index) => (
                <tr key={schedule.id} style={{ backgroundColor: index % 2 === 0 ? currentThemeColors.bgSecondary : hexToRgba(currentThemeColors.bgAccent, 0.5) }}>
                  <td className={tdClasses} style={{ borderColor: currentThemeColors.borderSecondary, color: currentThemeColors.textBase }}>{schedule.loanName}</td>
                  <td className={`${tdClasses} text-right`} style={{ borderColor: currentThemeColors.borderSecondary, color: currentThemeColors.textBase }}>{formatCurrency(schedule.principal)}</td>
                  <td className={`${tdClasses} text-right`} style={{ borderColor: currentThemeColors.borderSecondary, color: currentThemeColors.brandPrimary }}>{formatCurrency(schedule.calculatedEmi)}</td>
                  <td className={tdClasses} style={{ borderColor: currentThemeColors.borderSecondary }}>{schedule.tenureValue} {schedule.tenureUnit}</td>
                  <td className={tdClasses} style={{ borderColor: currentThemeColors.borderSecondary }}>{formatDateDisplay(schedule.startDate)}</td>
                  <td className={tdClasses} style={{ borderColor: currentThemeColors.borderSecondary }}>{formatTimestamp(schedule.createdAt)}</td>
                  <td className={tdClasses} style={{ borderColor: currentThemeColors.borderSecondary }}>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onLoadSchedule(schedule.id)}
                        className="p-1.5 text-text-muted-themed hover:text-brand-primary hover:bg-bg-accent-themed rounded-lg"
                        title="View/Load Saved Schedule"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteSchedule(schedule.id)}
                        className="p-1.5 text-text-muted-themed hover:text-expense hover:bg-red-500/10 rounded-lg"
                        title="Delete Saved Schedule"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: currentThemeColors.textMuted }} className="text-center">No EMI schedules saved yet.</p>
      )}
    </div>
  );
};
