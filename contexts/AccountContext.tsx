

import React, { createContext, useContext } from 'react';
import { Account } from '../types';

interface AccountContextType {
  accounts: Account[]; // This will now provide non-deleted accounts
  allAccounts: Account[]; // Provides all accounts including deleted ones
  activeAccountId: string | null;
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>; // Manages the full list
  setActiveAccountId: (id: string | null) => void;
  addAccount: (name: string, initialBalance: number, userDate?: string, accountNumber?: string, ifscCode?: string) => Promise<void>;
  editAccount: (id: string, updates: Partial<Omit<Account, 'id' | 'createdAt'>>) => Promise<void>;
  // deleteAccount will now trigger a soft delete flow in App.tsx
  deleteAccount: (id: string) => Promise<void>; 
  getAccountById: (id: string | null) => Account | undefined; // Should fetch from allAccounts
  activeAccount: Account | undefined; // Should be based on non-deleted accounts
}

export const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const useAccounts = (): AccountContextType => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  // context.accounts is ALREADY filtered for current user and non-deleted.

  const activeAccount = context.activeAccountId 
    ? (context.accounts ?? []).find(acc => acc.id === context.activeAccountId)
    : undefined;

  return {
    ...context,
    activeAccount, // This is now correctly derived from the user-specific list.
    getAccountById: (id: string | null) => id ? (context.allAccounts ?? []).find(acc => acc.id === id) : undefined,
  };
};