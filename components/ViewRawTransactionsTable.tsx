
import React from 'react';
import { Transaction, TransactionType, Account } from '../types';
import { HistoryIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import { formatDateDisplay } from '../utils/dateUtils'; // Assuming formatDateDisplay exists
import { hexToRgba } from '../utils/colorUtils';

interface ViewAllTransactionsTableProps {
  allTransactions: Transaction[];
  accounts: Account[]; // To resolve accountId to name
}

export const ViewAllTransactionsTable: React.FC<ViewAllTransactionsTableProps> = ({
  allTransactions,
  accounts,
}) => {
  const { currentThemeColors } = useTheme();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const getAccountName = (accountId?: string): string => {
    if (!accountId) return 'N/A';
    const account = (accounts || []).find(acc => acc.id === accountId);
    return account ? account.name : 'Unknown Account';
  };

  const tableBaseClasses = "w-full text-sm text-left";
  const thClasses = "px-3 sm:px-4 py-2 sm:py-3 text-xs uppercase sticky top-0 z-10";
  const tdClasses = "px-3 sm:px-4 py-2 sm:py-3 border-b";
  const monoFontClass = "font-mono text-xs";
  const tableContainerClasses = "overflow-x-auto max-h-[300px] sm:max-h-[400px] rounded-lg border relative";
  
  // Sort transactions by date descending for display
  const sortedTransactions = React.useMemo(() => 
    [...allTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [allTransactions]
  );

  return (
    <div className="p-3 sm:p-4 rounded-lg" style={{ backgroundColor: currentThemeColors.bgSecondary }}>
      <h3 className="text-md sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 flex items-center" style={{ color: currentThemeColors.textBase }}>
        <HistoryIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-brand-primary" />
        All Transactions Data ({sortedTransactions.length})
      </h3>
      {sortedTransactions.length > 0 ? (
        <div className={tableContainerClasses} style={{ borderColor: currentThemeColors.borderSecondary }}>
          <table className={tableBaseClasses} style={{ color: currentThemeColors.textMuted }}>
            <thead style={{ backgroundColor: currentThemeColors.bgAccent }}>
              <tr>
                <th scope="col" className={`${thClasses} ${monoFontClass}`} style={{ color: currentThemeColors.textBase }}>ID</th>
                <th scope="col" className={thClasses} style={{ color: currentThemeColors.textBase }}>Account</th>
                <th scope="col" className={thClasses} style={{ color: currentThemeColors.textBase }}>Date</th>
                <th scope="col" className={thClasses} style={{ color: currentThemeColors.textBase }}>Type</th>
                <th scope="col" className={thClasses} style={{ color: currentThemeColors.textBase }}>Description</th>
                <th scope="col" className={thClasses} style={{ color: currentThemeColors.textBase }}>Category</th>
                <th scope="col" className={`${thClasses} text-right`} style={{ color: currentThemeColors.textBase }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((tx, index) => (
                <tr key={tx.id} style={{ backgroundColor: index % 2 === 0 ? currentThemeColors.bgSecondary : hexToRgba(currentThemeColors.bgAccent, 0.5) }}>
                  <td className={`${tdClasses} ${monoFontClass}`} style={{ borderColor: currentThemeColors.borderSecondary }}>{tx.id.substring(0, 8)}...</td>
                  <td className={tdClasses} style={{ borderColor: currentThemeColors.borderSecondary, color: currentThemeColors.textBase }}>{getAccountName(tx.accountId)}</td>
                  <td className={tdClasses} style={{ borderColor: currentThemeColors.borderSecondary }}>{formatDateDisplay(tx.date)}</td>
                  <td className={tdClasses} style={{ borderColor: currentThemeColors.borderSecondary, color: tx.type === TransactionType.INCOME ? currentThemeColors.income : currentThemeColors.expense }}>
                    {tx.type}
                  </td>
                  <td className={tdClasses} style={{ borderColor: currentThemeColors.borderSecondary, color: currentThemeColors.textBase }} title={tx.description}>
                    {tx.description.length > 25 ? `${tx.description.substring(0, 22)}...` : tx.description}
                  </td>
                  <td className={tdClasses} style={{ borderColor: currentThemeColors.borderSecondary }}>{tx.category || 'N/A'}</td>
                  <td className={`${tdClasses} text-right`} style={{ borderColor: currentThemeColors.borderSecondary, color: tx.type === TransactionType.INCOME ? currentThemeColors.income : currentThemeColors.expense }}>
                    {formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: currentThemeColors.textMuted }} className="text-center">No transactions to display.</p>
      )}
    </div>
  );
};
