
import React, { useState, useEffect } from 'react';
import { UserGroupIcon, SaveIcon } from '../Icons';
import { useTheme } from '../../contexts/ThemeContext';
import { WEEKDAY_OPTIONS } from '../../constants';
import { ToastType } from '../../types';

interface AttendanceLeaveSettingsProps {
  selectedWeeklyOffDay: number;
  onSetSelectedWeeklyOffDay: (day: number) => void;
  monthlyOffLimits: Record<string, number>;
  onSetMonthlyOffLimit: (monthYear: string, limit: number) => void;
  addToast: (message: string, type: ToastType) => void;
}

const AttendanceLeaveSettings: React.FC<AttendanceLeaveSettingsProps> = ({
  selectedWeeklyOffDay, onSetSelectedWeeklyOffDay,
  monthlyOffLimits, onSetMonthlyOffLimit,
  addToast
}) => {
  const { currentThemeColors } = useTheme();
  const [currentSelectedWeeklyOffDayInput, setCurrentSelectedWeeklyOffDayInput] = useState<string>(String(selectedWeeklyOffDay));
  const [selectedMonthForOffLimit, setSelectedMonthForOffLimit] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [currentMonthlyOffLimitInput, setCurrentMonthlyOffLimitInput] = useState<string>('');

  useEffect(() => { setCurrentSelectedWeeklyOffDayInput(String(selectedWeeklyOffDay)); }, [selectedWeeklyOffDay]);

  useEffect(() => {
    const safeLimits = monthlyOffLimits ?? {};
    const manualLimit = safeLimits[selectedMonthForOffLimit];

    if (manualLimit !== undefined) {
      // A specific limit is set (could be 0 for unlimited), so display it.
      setCurrentMonthlyOffLimitInput(String(manualLimit));
    } else {
      // No specific limit, so calculate and display the default.
      const [year, month] = selectedMonthForOffLimit.split('-').map(Number);
      if (!year || !month) {
        setCurrentMonthlyOffLimitInput(''); // Handle invalid month string
        return;
      }
      const daysInMonth = new Date(year, month, 0).getDate();
      let weeklyOffDayCount = 0;
      
      const offDayIndex = selectedWeeklyOffDay;

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month - 1, day);
        if (currentDate.getDay() === offDayIndex) {
          weeklyOffDayCount++;
        }
      }
      setCurrentMonthlyOffLimitInput(String(weeklyOffDayCount));
    }
  }, [selectedMonthForOffLimit, monthlyOffLimits, selectedWeeklyOffDay]);


  const handleSaveSelectedWeeklyOffDay = () => {
    const dayValue = parseInt(currentSelectedWeeklyOffDayInput, 10);
    if (!isNaN(dayValue) && dayValue >= 0 && dayValue <= 6) {
      onSetSelectedWeeklyOffDay(dayValue);
    } else {
      addToast("Invalid day selection.", "warning");
    }
  };

  const handleSaveMonthlyOffLimit = () => {
    const limitValue = parseInt(currentMonthlyOffLimitInput, 10);
    // Allow saving blank or 0 for unlimited, or any positive number
    if (currentMonthlyOffLimitInput.trim() === '' || (!isNaN(limitValue) && limitValue >= 0)) {
        onSetMonthlyOffLimit(selectedMonthForOffLimit, isNaN(limitValue) ? 0 : limitValue);
    } else {
        addToast("Invalid limit. Enter a positive number or leave blank/0 for unlimited.", "warning");
    }
  };

  const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-bg-primary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-text-base-themed placeholder-text-muted-themed dark:[color-scheme:light]";
  const labelBaseClasses = "block text-sm font-medium text-text-muted-themed";
  const saveButtonClasses = "w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-text-inverted bg-brand-secondary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 dark:focus:ring-offset-bg-secondary-themed transition-all";

  return (
    <div className="space-y-6">
      <h4 className="text-md font-semibold mb-3 text-left flex items-center" style={{ color: currentThemeColors.textBase }}>
        <UserGroupIcon className="w-5 h-5 mr-2 text-brand-primary" /> Attendance & Leave Configuration
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="selectedWeeklyOffDay" className={labelBaseClasses}>Standard Weekly Off Day</label>
          <select
            id="selectedWeeklyOffDay"
            value={currentSelectedWeeklyOffDayInput}
            onChange={(e) => setCurrentSelectedWeeklyOffDayInput(e.target.value)}
            className={`${inputBaseClasses} mb-3`}
            aria-label="Select standard weekly off day"
          >
            {WEEKDAY_OPTIONS.map(day => (
              <option key={day.value} value={day.value} className="text-text-base-themed bg-bg-secondary-themed">{day.label}</option>
            ))}
          </select>
          <button onClick={handleSaveSelectedWeeklyOffDay} className={saveButtonClasses}>
            <SaveIcon className="w-4 h-4 mr-2" /> Save Weekly Off Day
          </button>
        </div>
        <div>
          <label htmlFor="selectMonthForOffLimit" className={labelBaseClasses}>Month for "Weekly Off" Limit</label>
          <input
            type="month"
            id="selectMonthForOffLimit"
            value={selectedMonthForOffLimit}
            onChange={(e) => setSelectedMonthForOffLimit(e.target.value)}
            className={`${inputBaseClasses} mb-2`}
            aria-label="Select month for weekly off limit"
          />
          <label htmlFor="monthlyOffLimitInput" className={labelBaseClasses}>
            Max "Weekly Offs" for {selectedMonthForOffLimit ? new Date(selectedMonthForOffLimit + '-02T00:00:00').toLocaleString('default', { month: 'long', year: 'numeric' }) : 'Selected Month'}
          </label>
          <input
            type="number"
            id="monthlyOffLimitInput"
            value={currentMonthlyOffLimitInput}
            onChange={(e) => setCurrentMonthlyOffLimitInput(e.target.value)}
            className={`${inputBaseClasses} mb-3`}
            placeholder="e.g., 4 (0 or blank for unlimited)"
            min="0"
            aria-label="Maximum weekly offs for selected month"
          />
          <button onClick={handleSaveMonthlyOffLimit} className={saveButtonClasses} disabled={!selectedMonthForOffLimit}>
            <SaveIcon className="w-4 h-4 mr-2" /> Save Monthly Limit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceLeaveSettings;
