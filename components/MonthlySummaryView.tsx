import React, { useState } from 'react';
import { Transaction, Account } from '../types';
import YearlyFinancialGrid from './YearlyFinancialGrid';
import { useTheme } from '../contexts/ThemeContext';

interface MonthlySummaryViewProps {
  transactions: Transaction[];
  accounts: Account[];
  activeAccountId: string | null;
  incomeCategories: string[];
  expenseCategories: string[];
  appTitle: string;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
}

const MonthlySummaryView: React.FC<MonthlySummaryViewProps> = ({
  transactions,
  accounts,
  activeAccountId,
  incomeCategories,
  expenseCategories,
  appTitle,
  onEditTransaction,
  onDeleteTransaction,
  onUpdateTransaction
}) => {
  const { currentThemeColors } = useTheme();
  const [showCategories, setShowCategories] = useState(false);
  
  const filteredTransactions = activeAccountId 
    ? transactions.filter(tx => tx.accountId === activeAccountId)
    : transactions;

  const activeAccountName = activeAccountId 
    ? accounts.find(a => a.id === activeAccountId)?.name 
    : 'All Accounts';

  return (
    <div className="space-y-6">
      <div className="bg-bg-primary-themed p-4 rounded-xl shadow-md border" style={{ borderColor: currentThemeColors.borderSecondary }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: currentThemeColors.textBase }}>
              Monthly Summary - {activeAccountName}
            </h2>
            <p className="text-sm" style={{ color: currentThemeColors.textMuted }}>
              View opening balance, income, expenses, and closing balance for each month.
            </p>
          </div>
          <div className="flex bg-bg-accent-themed rounded-lg p-1 border" style={{ borderColor: currentThemeColors.borderSecondary }}>
            <button
              onClick={() => setShowCategories(false)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${!showCategories ? 'bg-brand-primary text-text-inverted shadow-sm' : 'text-text-muted-themed hover:text-text-base-themed'}`}
            >
              Without Category
            </button>
            <button
              onClick={() => setShowCategories(true)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${showCategories ? 'bg-brand-primary text-text-inverted shadow-sm' : 'text-text-muted-themed hover:text-text-base-themed'}`}
            >
              With Category
            </button>
          </div>
        </div>
        <YearlyFinancialGrid
          allTransactions={filteredTransactions}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
          appTitle={appTitle}
          startDate={null}
          showCategories={showCategories}
          onEditTransaction={onEditTransaction}
          onDeleteTransaction={onDeleteTransaction}
          onUpdateTransaction={onUpdateTransaction}
        />
      </div>
    </div>
  );
};

export default MonthlySummaryView;
