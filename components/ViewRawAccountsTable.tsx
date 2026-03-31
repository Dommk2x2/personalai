
import React from 'react';
import { useAccounts } from '../contexts/AccountContext';
import { BookOpenIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import { formatTimestamp } from '../utils/dateUtils';
import { hexToRgba } from '../utils/colorUtils';

export const ViewRawAccountsTable: React.FC = () => {
  const { accounts } = useAccounts();
  const { currentThemeColors } = useTheme();

  const tableBaseClasses = "w-full text-sm text-left";
  const thClasses = "px-3 sm:px-4 py-2 sm:py-3 text-xs uppercase sticky top-0 z-10";
  const tdClasses = "px-3 sm:px-4 py-2 sm:py-3 border-b";
  const monoFontClass = "font-mono text-xs";
  const tableContainerClasses = "overflow-x-auto max-h-[300px] sm:max-h-[400px] rounded-lg border relative";

  return (
    <div className="p-3 sm:p-4 rounded-lg" style={{ backgroundColor: currentThemeColors.bgSecondary }}>
      <h3 className="text-md sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 flex items-center" style={{ color: currentThemeColors.textBase }}>
        <BookOpenIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-brand-primary" />
        Accounts Data ({accounts.length})
      </h3>
      {accounts.length > 0 ? (
        <div className={tableContainerClasses} style={{ borderColor: currentThemeColors.borderSecondary }}>
          <table className={tableBaseClasses} style={{ color: currentThemeColors.textMuted }}>
            <thead style={{ backgroundColor: currentThemeColors.bgAccent }}>
              <tr>
                <th scope="col" className={`${thClasses} ${monoFontClass}`} style={{ color: currentThemeColors.textBase }}>Account ID</th>
                <th scope="col" className={thClasses} style={{ color: currentThemeColors.textBase }}>Name</th>
                <th scope="col" className={thClasses} style={{ color: currentThemeColors.textBase }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account, index) => (
                <tr key={account.id} style={{ backgroundColor: index % 2 === 0 ? currentThemeColors.bgSecondary : hexToRgba(currentThemeColors.bgAccent, 0.5) }}>
                  <td className={`${tdClasses} ${monoFontClass}`} style={{ borderColor: currentThemeColors.borderSecondary }}>{account.id}</td>
                  <td className={tdClasses} style={{ borderColor: currentThemeColors.borderSecondary, color: currentThemeColors.textBase }}>{account.name}</td>
                  <td className={tdClasses} style={{ borderColor: currentThemeColors.borderSecondary }}>{formatTimestamp(account.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: currentThemeColors.textMuted }} className="text-center">No accounts to display.</p>
      )}
    </div>
  );
};
