
import React, { useMemo, useState } from 'react';
import { Transaction, AttendanceEntry, Account } from '../types';
import YearlyAttendanceGrid from './YearlyAttendanceGrid';
import YearlyFinancialGrid from './YearlyFinancialGrid';
import { useTheme } from '../contexts/ThemeContext';
import { CalendarDaysIcon, BanknotesIcon, ChevronDownIcon } from './Icons';

interface YearlyReportsProps {
  allTransactions: Transaction[];
  accounts: Account[];
  attendanceEntries: AttendanceEntry[];
  incomeCategories: string[];
  expenseCategories: string[];
  appTitle: string;
  startDate: string | null;
  endDate: string | null;
  periodLabel: string;
}

const Section: React.FC<{ title: string; icon: React.FC<any>; children: React.ReactNode }> = ({ title, icon: Icon, children }) => {
    const { currentThemeColors } = useTheme();
    return (
        <div className="bg-bg-primary-themed p-4 rounded-xl shadow-md border" style={{ borderColor: currentThemeColors.borderSecondary }}>
            <h3 className="text-xl font-semibold mb-4 flex items-center" style={{ color: currentThemeColors.textBase }}>
                <Icon className="w-6 h-6 mr-3" style={{ color: currentThemeColors.brandPrimary }} />
                {title}
            </h3>
            {children}
        </div>
    );
};

const AccountFinancialReport: React.FC<{
  account: Account;
  transactions: Transaction[];
  incomeCategories: string[];
  expenseCategories: string[];
  appTitle: string;
  startDate: string | null;
}> = ({ account, transactions, incomeCategories, expenseCategories, appTitle, startDate }) => {
    const { currentThemeColors } = useTheme();
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="p-4 border rounded-xl shadow-inner" style={{ borderColor: currentThemeColors.borderSecondary, backgroundColor: currentThemeColors.bgPrimary }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left"
            >
                <h4 className="text-lg font-bold" style={{ color: currentThemeColors.brandSecondary }}>
                    {account.name}
                </h4>
                <ChevronDownIcon className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} style={{ color: currentThemeColors.textMuted }} />
            </button>
            <div className={`transition-all duration-500 ease-in-out grid ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <YearlyFinancialGrid
                        allTransactions={transactions}
                        incomeCategories={incomeCategories}
                        expenseCategories={expenseCategories}
                        appTitle={appTitle}
                        startDate={startDate}
                    />
                </div>
            </div>
        </div>
    );
};

const YearlyReports: React.FC<YearlyReportsProps> = ({
  allTransactions,
  accounts,
  attendanceEntries,
  incomeCategories,
  expenseCategories,
  appTitle,
  startDate,
  endDate,
  periodLabel,
}) => {
  const { currentThemeColors } = useTheme();
  
  const safeAllTransactions = useMemo(() => allTransactions ?? [], [allTransactions]);

  const transactionsForPeriod = useMemo(() => {
    if (!startDate && !endDate) return safeAllTransactions;
    return safeAllTransactions.filter(tx => {
      if (startDate && tx.date < startDate) return false;
      if (endDate && tx.date > endDate) return false;
      return true;
    });
  }, [safeAllTransactions, startDate, endDate]);

  const transactionsByAccount = useMemo(() => {
    const grouped: Record<string, Transaction[]> = {};
    transactionsForPeriod.forEach(tx => {
      if (!tx.accountId) return; 

      if (!grouped[tx.accountId]) {
        grouped[tx.accountId] = [];
      }
      grouped[tx.accountId].push(tx);
    });
    return grouped;
  }, [transactionsForPeriod]);

  const sortedAccountIds = useMemo(() => {
    return Object.keys(transactionsByAccount).sort((aId, bId) => {
      const accountA = (accounts ?? []).find(acc => acc.id === aId);
      const accountB = (accounts ?? []).find(acc => acc.id === bId);
      return (accountA?.name || '').localeCompare(accountB?.name || '');
    });
  }, [transactionsByAccount, accounts]);

  return (
    <div className="space-y-8">
      <div className="text-center p-3 rounded-lg bg-bg-accent-themed border" style={{ borderColor: currentThemeColors.borderSecondary }}>
        <p className="text-sm text-text-muted-themed">
          Financial data reflects the selected period: <span className="font-semibold text-brand-primary">{periodLabel}</span>, split by account.
        </p>
        <p className="text-xs text-text-muted-themed mt-1">
          Attendance data always shows a full calendar year (Jan 1 - Dec 31). Use the controls within each report to navigate years.
        </p>
      </div>

      <Section title="Yearly Attendance Summary" icon={CalendarDaysIcon}>
        <YearlyAttendanceGrid
            attendanceEntries={attendanceEntries}
            appTitle={appTitle}
            startDate={startDate}
        />
      </Section>

      <Section title="Yearly Financial Summary" icon={BanknotesIcon}>
        {sortedAccountIds.length > 0 ? (
          <div className="space-y-6">
            {sortedAccountIds.map((accountId) => {
              const account = (accounts ?? []).find(acc => acc.id === accountId);
              const accountTransactions = transactionsByAccount[accountId];
              if (!account) return null;

              return (
                <AccountFinancialReport
                  key={accountId}
                  account={account}
                  transactions={accountTransactions}
                  incomeCategories={incomeCategories}
                  expenseCategories={expenseCategories}
                  appTitle={appTitle}
                  startDate={startDate}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-center text-text-muted-themed py-8">
            No financial data found for the selected period.
          </p>
        )}
      </Section>
    </div>
  );
};

export default YearlyReports;
