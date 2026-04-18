
import { BudgetPeriod } from '../types';

// Helper to get the ISO week number for a date
function getWeekNumber(d: Date): number {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // @ts-ignore
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
}

export function getDayIdentifier(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getWeekIdentifier(date: Date): string {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

export function getMonthIdentifier(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

// New function to determine the correct YYYY-MM identifier based on financial month start day
export function getFinancialMonthIdentifier(date: Date, financialMonthStartDay: number): string {
    let dateForIdentifier = new Date(date);
    if (dateForIdentifier.getDate() < financialMonthStartDay) {
        // If current day is before start day, financial month belongs to previous calendar month
        dateForIdentifier.setMonth(dateForIdentifier.getMonth() - 1);
    }
    return getMonthIdentifier(dateForIdentifier);
}


// New function to format a local Date object to YYYY-MM-DD string
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is 0-indexed
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}


// Type for financial month config, if passed
export interface FinancialMonthConfig {
  startDay: number;
  endDay: number;
}

export function getPeriodDateRange(
  period: BudgetPeriod,
  identifier: string,
  financialMonthConfig?: FinancialMonthConfig // Pass this only for MONTHLY period
): { start: Date; end: Date } {
  const now = new Date(); // Fallback for safety
  let start: Date, end: Date;

  switch (period) {
    case BudgetPeriod.DAILY:
      start = new Date(identifier + 'T00:00:00'); 
      end = new Date(identifier + 'T23:59:59.999');
      break;
    case BudgetPeriod.WEEKLY: {
      const [yearStr, weekStr] = identifier.split('-W');
      const year = parseInt(yearStr, 10);
      const week = parseInt(weekStr, 10);
      
      const firstDayOfYear = new Date(year, 0, 1);
      const daysOffset = (week - 1) * 7;
      start = new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + daysOffset - (firstDayOfYear.getDay() || 7) + 1)); 
      start.setHours(0,0,0,0);

      end = new Date(start);
      end.setDate(start.getDate() + 6); 
      end.setHours(23,59,59,999);
      break;
    }
    case BudgetPeriod.MONTHLY: {
      const [yearStr, monthStr] = identifier.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1; // 0-indexed month

      if (financialMonthConfig) {
        start = new Date(year, month, financialMonthConfig.startDay, 0, 0, 0, 0);

        let endCalYear = year;
        let endCalMonth = month;

        if (financialMonthConfig.endDay < financialMonthConfig.startDay) {
          // End day is in the next calendar month
          endCalMonth = month + 1;
          if (endCalMonth > 11) { // Month wrapped to next year
            endCalMonth = 0;
            endCalYear = year + 1;
          }
        }
        
        // Determine the number of days in the calculated end month
        const daysInEndMonth = new Date(endCalYear, endCalMonth + 1, 0).getDate();
        // Use the configured end day, but don't exceed the actual number of days in that month
        const actualEndDay = Math.min(financialMonthConfig.endDay, daysInEndMonth);
        
        end = new Date(endCalYear, endCalMonth, actualEndDay, 23, 59, 59, 999);
      } else {
        // Fallback to calendar month if financial days are not provided
        console.warn("getPeriodDateRange called for MONTHLY without financialMonthConfig. Defaulting to calendar month.");
        start = new Date(year, month, 1, 0, 0, 0, 0);
        end = new Date(year, month + 1, 0, 23, 59, 59, 999); // Last day of the calendar month
      }
      break;
    }
    default:
      start = now;
      end = now;
  }
  return { start, end };
}

export function getDisplayPeriodName(
  period: BudgetPeriod,
  identifier: string,
  financialMonthConfig?: FinancialMonthConfig
): string {
  
  switch (period) {
    case BudgetPeriod.DAILY:
      const dailyDate = new Date(identifier + 'T00:00:00');
      return dailyDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    case BudgetPeriod.WEEKLY:
      const { start: weekStart, end: weekEnd } = getPeriodDateRange(BudgetPeriod.WEEKLY, identifier); // No financial config needed for weekly
      return `Week of ${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    case BudgetPeriod.MONTHLY:
      const primaryMonthDateForDisplay = new Date(identifier + '-01T00:00:00'); // Base for primary month name
      const primaryMonthName = primaryMonthDateForDisplay.toLocaleDateString(undefined, {month: 'long', year: 'numeric'});
      if (financialMonthConfig) {
        const { start: finStart, end: finEnd } = getPeriodDateRange(BudgetPeriod.MONTHLY, identifier, financialMonthConfig);
        const startFormatted = finStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const endFormatted = finEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        return `Fin. Month (${primaryMonthName}): ${startFormatted} - ${endFormatted}`;
      } else {
        return primaryMonthName; // Fallback to calendar month name
      }
    default:
      return identifier;
  }
}


export function getPreviousPeriodIdentifier(period: BudgetPeriod, currentIdentifier: string): string {
    // For monthly, identifier is YYYY-MM. We need financialMonthConfig to get the *actual* start date
    // if the current getPeriodDateRange is used. However, for merely getting the previous *identifier*,
    // we can operate on YYYY-MM directly. The actual range is derived later.
    let dateToProcess: Date;
    if (period === BudgetPeriod.MONTHLY) {
        const [year, month] = currentIdentifier.split('-').map(Number);
        dateToProcess = new Date(year, month - 1, 1); // Use 1st day for month manipulation
    } else {
         // For daily/weekly, getPeriodDateRange without financialConfig is fine
        dateToProcess = getPeriodDateRange(period, currentIdentifier).start;
    }
   

    let prevDate;
    switch (period) {
        case BudgetPeriod.DAILY:
            prevDate = new Date(dateToProcess.setDate(dateToProcess.getDate() - 1));
            return getDayIdentifier(prevDate);
        case BudgetPeriod.WEEKLY:
            prevDate = new Date(dateToProcess.setDate(dateToProcess.getDate() - 7));
            return getWeekIdentifier(prevDate);
        case BudgetPeriod.MONTHLY:
            prevDate = new Date(dateToProcess.setMonth(dateToProcess.getMonth() - 1));
            return getMonthIdentifier(prevDate);
    }
}

export function getNextPeriodIdentifier(period: BudgetPeriod, currentIdentifier: string): string {
    let dateToProcess: Date;
     if (period === BudgetPeriod.MONTHLY) {
        const [year, month] = currentIdentifier.split('-').map(Number);
        dateToProcess = new Date(year, month - 1, 1);
    } else {
        dateToProcess = getPeriodDateRange(period, currentIdentifier).start;
    }

    let nextDate;
    switch (period) {
        case BudgetPeriod.DAILY:
            nextDate = new Date(dateToProcess.setDate(dateToProcess.getDate() + 1));
            return getDayIdentifier(nextDate);
        case BudgetPeriod.WEEKLY:
            nextDate = new Date(dateToProcess.setDate(dateToProcess.getDate() + 7));
            return getWeekIdentifier(nextDate);
        case BudgetPeriod.MONTHLY:
            nextDate = new Date(dateToProcess.setMonth(dateToProcess.getMonth() + 1));
            return getMonthIdentifier(nextDate);
    }
}

export function getCurrentPeriodIdentifier(period: BudgetPeriod, date: Date = new Date(), financialMonthStartDay?: number): string {
    switch (period) {
        case BudgetPeriod.DAILY: return getDayIdentifier(date);
        case BudgetPeriod.WEEKLY: return getWeekIdentifier(date);
        case BudgetPeriod.MONTHLY: 
            if (financialMonthStartDay) {
                return getFinancialMonthIdentifier(date, financialMonthStartDay);
            }
            return getMonthIdentifier(date);
    }
}

// Formats YYYY-MM-DD to "Mon DD, YYYY" or similar
export const formatDateDisplay = (dateInput?: string | Date): string => {
    if (!dateInput) return 'N/A'; 
    let dateString = '';
    try {
        if (dateInput instanceof Date) {
            dateString = formatDateToYYYYMMDD(dateInput);
        } else {
            dateString = dateInput;
        }

        // Assuming dateString is YYYY-MM-DD or includes time.
        // Take only the date part and append T00:00:00 to parse as local midnight.
        const localDate = new Date(dateString.split('T')[0] + 'T00:00:00');
        
        if (isNaN(localDate.getTime())) return 'Invalid Date';
        
        return localDate.toLocaleDateString(undefined, { 
            year: 'numeric',
            month: 'short',
            day: 'numeric'
            // No timeZone: 'UTC' here, formats the local date in the user's locale preferences
        });
    } catch(e) {
        console.error("Error formatting date string:", dateString, e);
        return 'Invalid Date';
    }
};

// Formats ISO string to "Mon DD, YYYY, HH:MM AM/PM"
// FIX: Update parameter type to accept string, number, or null for flexibility.
export const formatTimestamp = (timestamp?: string | number | null): string => {
  if (!timestamp) return 'N/A';
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch (e) {
    console.error("Error formatting timestamp:", timestamp, e);
    return 'Invalid Date';
  }
};
