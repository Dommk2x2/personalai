import React from 'react';
import { useAccounts } from '../contexts/AccountContext';
import { ChevronDownIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';

interface AccountSelectorProps {
  id?: string;
  selectedAccountId: string | null;
  onAccountChange: (id: string | null) => void;
  onAddAccountClick?: () => void;
  size?: 'small' | 'normal';
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  id = 'account-selector',
  selectedAccountId,
  onAccountChange,
  onAddAccountClick,
  size = 'normal',
}) => {
  const { accounts } = useAccounts(); 
  const { currentThemeColors } = useTheme();

  const sortedAccounts = React.useMemo(() => {
    return [...accounts].sort((a, b) => a.name.localeCompare(b.name));
  }, [accounts]);
  
  // Standardizing text size to match icons better
  const sizeClasses = 'text-[10px] sm:text-xs'; 

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '__ADD_NEW__') {
      onAddAccountClick?.();
      // Revert the value of the select so it doesn't stay on "Add New"
      e.target.value = selectedAccountId === null ? '__ALL__' : selectedAccountId;
    } else {
      onAccountChange(value === '__ALL__' ? null : value);
    }
  };

  return (
    <div className="w-full">
      <div className="relative w-full">
        <select
          id={id}
          value={selectedAccountId === null ? '__ALL__' : selectedAccountId}
          onChange={handleChange}
          className={`block w-full h-[36px] font-black uppercase tracking-widest rounded-xl border border-border-primary bg-bg-primary-themed focus:outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none transition-all duration-200 ease-in-out cursor-pointer ${sizeClasses} px-4 pr-10 truncate`}
          style={{
            color: currentThemeColors.brandPrimary,
            lineHeight: '1',
          }}
          aria-label="Select an account to view"
        >
          <option value="__ALL__">All Accounts</option>
          {sortedAccounts.map(account => (
            <option 
                key={account.id} 
                value={account.id}
            >
              {account.name}
            </option>
          ))}
          {onAddAccountClick && (
            <optgroup label="Actions">
              <option value="__ADD_NEW__">+ Add New Account...</option>
            </optgroup>
          )}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3" style={{color: currentThemeColors.brandPrimary}}>
          <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};

export default AccountSelector;