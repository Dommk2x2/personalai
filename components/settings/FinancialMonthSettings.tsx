
import React, { useState, useEffect } from 'react';
import { CalendarDaysIcon, SaveIcon } from '../Icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ToastType } from '../../types';

interface FinancialMonthSettingsProps {
  financialMonthStartDay: number;
  onSetFinancialMonthStartDay: (day: number) => void;
  financialMonthEndDay: number;
  onSetFinancialMonthEndDay: (day: number) => void;
  financialYearStartMonth: number;
  financialYearStartDay: number;
  financialYearEndMonth: number;
  financialYearEndDay: number;
  onSetFinancialYear: (startMonth: number, startDay: number, endMonth: number, endDay: number) => void;
  addToast: (message: string, type: ToastType) => void;
}

const FinancialMonthSettings: React.FC<FinancialMonthSettingsProps> = ({
  financialMonthStartDay, onSetFinancialMonthStartDay,
  financialMonthEndDay, onSetFinancialMonthEndDay,
  financialYearStartMonth, financialYearStartDay,
  financialYearEndMonth, financialYearEndDay,
  onSetFinancialYear,
  addToast
}) => {
  const { currentThemeColors } = useTheme();
  
  // Local state for all inputs
  const [startDayInput, setStartDayInput] = useState<string>(String(financialMonthStartDay));
  const [yearStartMonthInput, setYearStartMonthInput] = useState<string>(String(financialYearStartMonth));
  const [yearStartDayInput, setYearStartDayInput] = useState<string>(String(financialYearStartDay));
  const [yearEndMonthInput, setYearEndMonthInput] = useState<string>(String(financialYearEndMonth));
  const [yearEndDayInput, setYearEndDayInput] = useState<string>(String(financialYearEndDay));

  // Sync local state when props change
  useEffect(() => { setStartDayInput(String(financialMonthStartDay)); }, [financialMonthStartDay]);
  useEffect(() => { setYearStartMonthInput(String(financialYearStartMonth)); }, [financialYearStartMonth]);
  useEffect(() => { setYearStartDayInput(String(financialYearStartDay)); }, [financialYearStartDay]);
  useEffect(() => { setYearEndMonthInput(String(financialYearEndMonth)); }, [financialYearEndMonth]);
  useEffect(() => { setYearEndDayInput(String(financialYearEndDay)); }, [financialYearEndDay]);

  const daysInMonth = (year: number, month: number): number => {
    return new Date(year, month, 0).getDate();
  };

  const handleSaveAll = () => {
    let hasChanges = false;
    let hasErrors = false;

    // Validate and update monthly period
    const startDayValue = parseInt(startDayInput, 10);
    
    if (!isNaN(startDayValue) && startDayValue >= 1 && startDayValue <= 28) {
        const newEndDayValue = startDayValue === 1 ? 31 : startDayValue - 1; // 31 acts as a proxy for "end of calendar month"
        if (startDayValue !== financialMonthStartDay || newEndDayValue !== financialMonthEndDay) {
            onSetFinancialMonthStartDay(startDayValue);
            onSetFinancialMonthEndDay(newEndDayValue);
            hasChanges = true;
        }
    } else {
      addToast("Monthly Start Day must be between 1 and 28.", "warning");
      hasErrors = true;
    }

    // Validate and update yearly period
    const yearStartMonthValue = parseInt(yearStartMonthInput, 10);
    const yearStartDayValue = parseInt(yearStartDayInput, 10);
    const yearEndMonthValue = parseInt(yearEndMonthInput, 10);
    const yearEndDayValue = parseInt(yearEndDayInput, 10);
    
    // Check start date
    const maxDaysInStartMonth = daysInMonth(2024, yearStartMonthValue); // Use a leap year for Feb max day check
    if (isNaN(yearStartMonthValue) || yearStartMonthValue < 1 || yearStartMonthValue > 12) {
      addToast("Yearly Start Month is invalid.", "warning");
      hasErrors = true;
    } else if (isNaN(yearStartDayValue) || yearStartDayValue < 1 || yearStartDayValue > maxDaysInStartMonth) {
      addToast(`Yearly Start Day for the selected month must be between 1 and ${maxDaysInStartMonth}.`, "warning");
      hasErrors = true;
    }
    
    // Check end date
    const maxDaysInEndMonth = daysInMonth(2024, yearEndMonthValue); // Use a leap year for Feb max day check
    if (isNaN(yearEndMonthValue) || yearEndMonthValue < 1 || yearEndMonthValue > 12) {
      addToast("Yearly End Month is invalid.", "warning");
      hasErrors = true;
    } else if (isNaN(yearEndDayValue) || yearEndDayValue < 1 || yearEndDayValue > maxDaysInEndMonth) {
      addToast(`Yearly End Day for the selected month must be between 1 and ${maxDaysInEndMonth}.`, "warning");
      hasErrors = true;
    }


    // If no validation errors so far, check for changes and call the handler
    if (!hasErrors) {
        if (
            yearStartMonthValue !== financialYearStartMonth ||
            yearStartDayValue !== financialYearStartDay ||
            yearEndMonthValue !== financialYearEndMonth ||
            yearEndDayValue !== financialYearEndDay
        ) {
          onSetFinancialYear(yearStartMonthValue, yearStartDayValue, yearEndMonthValue, yearEndDayValue);
          hasChanges = true;
        }
    }

    if (hasChanges && !hasErrors) {
      addToast("Financial period settings saved.", "success");
    } else if (!hasChanges && !hasErrors) {
      addToast("No changes to save.", "info");
    }
  };


  const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-bg-primary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-text-base-themed placeholder-text-muted-themed";
  const labelBaseClasses = "block text-sm font-medium text-text-muted-themed";
  const saveButtonClasses = "w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-md text-text-inverted bg-brand-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 dark:focus:ring-offset-bg-secondary-themed transition-all";

  const monthOptions = [
    { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
    { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
    { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" },
  ];

  return (
    <div className="space-y-6">
      {/* Monthly Period Section */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold mb-3 text-left flex items-center" style={{ color: currentThemeColors.textBase }}>
          <CalendarDaysIcon className="w-5 h-5 mr-2 text-brand-primary" /> Financial Period Configuration
        </h4>
        <p className="text-xs text-text-muted-themed -mt-2 mb-3">
          Defines the start day for monthly financial reporting. The end day will be set automatically (e.g., a start day of 5 sets an end day of 4 on the next month). A start day of 1 uses the calendar month.
        </p>
        <div>
            <label htmlFor="financialMonthStartDay" className={labelBaseClasses}>Start Day of Financial Period (1-28)</label>
            <input
              type="number"
              id="financialMonthStartDay"
              value={startDayInput}
              onChange={(e) => setStartDayInput(e.target.value)}
              className={inputBaseClasses}
              placeholder="e.g., 5"
              min="1" max="28"
              aria-label="Financial month start day"
            />
        </div>
      </div>

      {/* Yearly Period Section */}
      <div className="space-y-4 pt-6 border-t border-border-secondary">
        <h4 className="text-md font-semibold mb-3 text-left flex items-center" style={{ color: currentThemeColors.textBase }}>
          <CalendarDaysIcon className="w-5 h-5 mr-2 text-brand-primary" /> Financial Year Configuration
        </h4>
        <p className="text-xs text-text-muted-themed -mt-2 mb-3">
          Defines the start and end dates for annual financial reporting.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="financialYearStartMonth" className={labelBaseClasses}>Start Month</label>
            <select
              id="financialYearStartMonth"
              value={yearStartMonthInput}
              onChange={(e) => setYearStartMonthInput(e.target.value)}
              className={inputBaseClasses}
              aria-label="Financial year start month"
            >
              {monthOptions.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="financialYearStartDay" className={labelBaseClasses}>Start Day</label>
            <input
              type="number"
              id="financialYearStartDay"
              value={yearStartDayInput}
              onChange={(e) => setYearStartDayInput(e.target.value)}
              className={inputBaseClasses}
              placeholder="e.g., 1"
              min="1" max="31"
              aria-label="Financial year start day"
            />
          </div>
          <div>
            <label htmlFor="financialYearEndMonth" className={labelBaseClasses}>End Month</label>
            <select
              id="financialYearEndMonth"
              value={yearEndMonthInput}
              onChange={(e) => setYearEndMonthInput(e.target.value)}
              className={inputBaseClasses}
              aria-label="Financial year end month"
            >
              {monthOptions.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="financialYearEndDay" className={labelBaseClasses}>End Day</label>
            <input
              type="number"
              id="financialYearEndDay"
              value={yearEndDayInput}
              onChange={(e) => setYearEndDayInput(e.target.value)}
              className={inputBaseClasses}
              placeholder="e.g., 31"
              min="1" max="31"
              aria-label="Financial year end day"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-border-secondary">
        <button onClick={handleSaveAll} className={saveButtonClasses}>
          <SaveIcon className="w-4 h-4 mr-2" /> Save All Settings
        </button>
      </div>

    </div>
  );
};

export default FinancialMonthSettings;
