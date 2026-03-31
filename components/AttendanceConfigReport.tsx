
import React from 'react';
import { CogIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import { WEEKDAY_OPTIONS } from '../constants';

interface AttendanceConfigReportProps {
  monthlySalary: number | null;
  selectedWeeklyOffDay: number;
  monthlyOffLimits: Record<string, number>;
}

const AttendanceConfigReport: React.FC<AttendanceConfigReportProps> = ({
  monthlySalary,
  selectedWeeklyOffDay,
  monthlyOffLimits,
}) => {
  const { currentThemeColors } = useTheme();

  const formatCurrency = (amount: number | null): string => {
    if (amount === null) return 'Not Set';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const getDayName = (dayValue: number): string => {
    const dayOption = (WEEKDAY_OPTIONS ?? []).find(d => d.value === dayValue);
    return dayOption ? dayOption.label : 'Not Set';
  };

  // Filter out months with 0 (unlimited) limit and sort by month-year
  const safeLimits = monthlyOffLimits ?? {};
  const sortedMonthlyOffLimits = Object.entries(safeLimits)
    .filter(([, limit]) => (limit as number) > 0) // Only display months where a specific limit > 0 is set
    .sort(([monthYearA], [monthYearB]) => monthYearA.localeCompare(monthYearB));

  const configItemClass = "py-3 px-4 border-b flex justify-between items-center";
  const labelClass = "text-sm font-medium";
  const valueClass = "text-sm font-semibold";

  return (
    <div className="p-4 sm:p-6 rounded-xl shadow-lg" style={{backgroundColor: currentThemeColors.bgSecondary}}>
      <h2 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center" style={{color: currentThemeColors.textBase}}>
        <span style={{ color: currentThemeColors.brandPrimary }} className="mr-2">
          <CogIcon className="w-6 h-6 sm:w-7 sm:h-7" />
        </span>
        Attendance & Leave Configuration Summary
      </h2>

      <div className="space-y-3 divide-y" style={{borderColor: currentThemeColors.borderSecondary}}>
        <div className={configItemClass} style={{borderTopColor: currentThemeColors.borderSecondary, borderTopWidth: '1px'}}>
          <span className={labelClass} style={{color: currentThemeColors.textMuted}}>Base Monthly Salary:</span>
          <span className={valueClass} style={{color: monthlySalary !== null ? currentThemeColors.income : currentThemeColors.textMuted}}>
            {formatCurrency(monthlySalary)}
          </span>
        </div>

        <div className={configItemClass}>
          <span className={labelClass} style={{color: currentThemeColors.textMuted}}>Standard Weekly Off Day:</span>
          <span className={valueClass} style={{color: currentThemeColors.brandSecondary}}>{getDayName(selectedWeeklyOffDay)}</span>
        </div>

        <div>
          <h3 className="text-md font-semibold mt-6 mb-2 pt-3 border-t" style={{color: currentThemeColors.textBase, borderColor: currentThemeColors.borderSecondary}}>Monthly "Weekly Off" Limits:</h3>
          {sortedMonthlyOffLimits.length > 0 ? (
            <ul className="divide-y rounded-lg border overflow-hidden" style={{borderColor: currentThemeColors.borderSecondary}}>
              {sortedMonthlyOffLimits.map(([monthYear, limit]) => {
                const dateFromMonthYear = new Date(monthYear + '-02T00:00:00'); // Use a neutral day like 2nd for formatting
                const monthName = dateFromMonthYear.toLocaleString('default', { month: 'long', year: 'numeric' });
                return (
                  <li key={monthYear} className="py-2 px-3 flex justify-between items-center text-sm" style={{backgroundColor: currentThemeColors.bgAccent+'1A', borderColor: currentThemeColors.borderSecondary}}>
                    <span style={{color: currentThemeColors.textMuted}}>{monthName}:</span>
                    <span className="font-medium" style={{color: currentThemeColors.textBase}}>
                      {`${limit} day(s)`}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-center py-3 border rounded-lg" style={{color: currentThemeColors.textMuted, borderColor: currentThemeColors.borderSecondary, backgroundColor: currentThemeColors.bgAccent+'1A'}}>
              No specific monthly "Weekly Off" limits have been configured (defaults to unlimited).
            </p>
          )}
        </div>
      </div>
      <p className="text-xs mt-6 text-center" style={{color: currentThemeColors.textMuted}}>
        These settings are configured in the "Database Tools" section. This page provides a read-only summary.
      </p>
    </div>
  );
};

export default AttendanceConfigReport;
