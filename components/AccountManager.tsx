import React, { useState, useMemo } from 'react';
import { useAccounts } from '../contexts/AccountContext';
import { Account, Transaction, TransactionType } from '../types';
import { PlusIcon, EditIcon, TrashIcon, BookOpenIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationModal from './ConfirmationModal';

interface AccountManagerProps {
  transactions: Transaction[]; 
}

const AccountManager: React.FC<AccountManagerProps> = ({ transactions }) => {
  const { accounts, addAccount, editAccount, deleteAccount } = useAccounts();
  const { currentThemeColors } = useTheme();
  const [newAccountName, setNewAccountName] = useState('');
  const [initialBalance, setInitialBalance] = useState<string>('');
  const [newUserDate, setNewUserDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedBalance, setEditedBalance] = useState<string>('');
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const accountBalancesAndLastActivity = useMemo(() => {
    const data: Record<string, { balance: number; lastActivityDate?: string }> = {};
    accounts.forEach(acc => {
      const accountTransactions = transactions.filter(tx => tx.accountId === acc.id && !tx.isDeleted);
      const balance = accountTransactions
        .reduce((sum, tx) => sum + (tx.type === TransactionType.INCOME ? tx.amount : -tx.amount), 0);
      
      let lastActivityDate: string | undefined = undefined;
      if (accountTransactions.length > 0) {
        const sortedTx = [...accountTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        lastActivityDate = sortedTx[0].date;
      }
      data[acc.id] = { balance, lastActivityDate };
    });
    return data;
  }, [accounts, transactions]);

  const handleAddAccount = () => {
    const trimmedName = newAccountName.trim();
    if (!trimmedName) return;
    const balance = parseFloat(initialBalance);
    addAccount(trimmedName, isNaN(balance) || balance < 0 ? 0 : balance, newUserDate);
    setNewAccountName('');
    setInitialBalance('');
    setNewUserDate(new Date().toISOString().split('T')[0]);
  };

  const startEdit = (account: Account) => {
    setEditingAccount(account);
    setEditedName(account.name);
    setEditedBalance(account.initialBalance?.toString() || '0');
  };

  const handleSaveEdit = () => {
    if (editingAccount && editedName.trim()) {
      const balance = parseFloat(editedBalance);
      editAccount(editingAccount.id, { 
        name: editedName.trim(),
        initialBalance: isNaN(balance) ? 0 : balance
      });
      setEditingAccount(null);
    }
  };
  
  const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-bg-secondary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary sm:text-sm text-text-base-themed placeholder-text-muted-themed";
  const labelBaseClasses = "block text-[11px] font-bold text-text-muted-themed uppercase tracking-wider mb-1";

  return (
    <div className="bg-bg-secondary-themed p-3 sm:p-6 rounded-xl shadow-xl border border-border-primary">
      <div className="flex items-center justify-center gap-2 mb-6">
        <BookOpenIcon className="w-6 h-6 text-brand-primary" />
        <h2 className="text-xl font-bold text-text-base-themed uppercase tracking-tighter">Account Center</h2>
      </div>

      <div 
        className="mb-8 p-4 sm:p-6 border rounded-2xl relative overflow-hidden" 
        style={{ 
            backgroundColor: `${currentThemeColors.brandPrimary}08`, 
            borderColor: `${currentThemeColors.brandPrimary}20`,
            backgroundImage: `linear-gradient(135deg, ${currentThemeColors.brandPrimary}05 0%, ${currentThemeColors.brandPrimary}15 100%)`
        }}
      >
        <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-bg-secondary-themed shadow-sm">
                <PlusIcon className="w-4 h-4 text-brand-primary" />
            </div>
            <h3 className="text-sm font-black text-text-base-themed uppercase tracking-tight">Create New Account</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="newAccountName" className={labelBaseClasses}>Account Name</label>
            <input
              type="text"
              id="newAccountName"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              placeholder="e.g., Personal Savings"
              className={inputBaseClasses}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="initialBalance" className={labelBaseClasses}>Starting Balance</label>
                <input
                type="number"
                id="initialBalance"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="0.00"
                className={inputBaseClasses}
                />
            </div>
            <div>
                <label htmlFor="newUserDate" className={labelBaseClasses}>Creation Date</label>
                <input
                type="date"
                id="newUserDate"
                value={newUserDate}
                onChange={(e) => setNewUserDate(e.target.value)}
                className={inputBaseClasses}
                />
            </div>
          </div>
          
          <button
            onClick={handleAddAccount}
            disabled={!newAccountName.trim()}
            className="w-full flex items-center justify-center py-3 bg-brand-primary text-white rounded-xl shadow-lg shadow-brand-primary/20 font-black uppercase text-xs tracking-widest transition-all disabled:opacity-50 hover:opacity-90 active:scale-95"
          >
            <PlusIcon className="w-4 h-4 mr-2" /> Initialize Account
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className={labelBaseClasses}>Existing Records ({accounts.length})</h3>
        {accounts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {accounts.map(acc => (
              <div key={acc.id} className="p-4 bg-bg-primary-themed border border-border-primary rounded-xl flex justify-between items-center transition-all hover:shadow-md hover:border-brand-primary/30 group">
                <div className="min-w-0">
                    <p className="font-bold text-text-base-themed truncate">{acc.name}</p>
                    <p className="text-xs font-black text-brand-secondary mt-0.5">{formatCurrency(accountBalancesAndLastActivity[acc.id]?.balance || 0)}</p>
                </div>
                <div className="flex gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(acc)} className="p-2 text-text-muted-themed hover:text-brand-primary transition-colors"><EditIcon className="w-4 h-4"/></button>
                    <button onClick={() => setDeletingAccountId(acc.id)} className="p-2 text-text-muted-themed hover:text-expense transition-colors"><TrashIcon className="w-4 h-4"/></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 rounded-2xl bg-bg-primary-themed border-2 border-dashed border-border-primary">
              <BookOpenIcon className="w-10 h-10 mx-auto text-text-muted-themed mb-2" />
              <p className="text-text-muted-themed font-bold uppercase text-[10px] tracking-widest">No accounts found</p>
          </div>
        )}
      </div>
      
      {deletingAccountId && (
        <ConfirmationModal
          isOpen={!!deletingAccountId}
          onClose={() => setDeletingAccountId(null)}
          onConfirm={() => {
            if (deletingAccountId) {
              deleteAccount(deletingAccountId);
              setDeletingAccountId(null);
            }
          }}
          title="Delete Account"
          message={`Are you sure you want to delete the account "${accounts.find(a => a.id === deletingAccountId)?.name}"? This will delete all associated transactions and cannot be undone.`}
          confirmText="Delete Account"
          type="danger"
        />
      )}
      
      {editingAccount && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={() => setEditingAccount(null)}>
          <div className="bg-bg-secondary-themed p-6 rounded-2xl shadow-2xl w-full max-w-sm animate-modal-enter border border-brand-primary/20" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-text-base-themed mb-4 uppercase tracking-tight">Edit Account</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="editedAccountName" className={labelBaseClasses}>Account Name</label>
                <input type="text" id="editedAccountName" value={editedName} onChange={(e) => setEditedName(e.target.value)} className={inputBaseClasses} autoFocus />
              </div>
              <div>
                <label htmlFor="editedInitialBalance" className={labelBaseClasses}>Initial Balance (Edit One Time)</label>
                <input type="number" id="editedInitialBalance" value={editedBalance} onChange={(e) => setEditedBalance(e.target.value)} className={inputBaseClasses} placeholder="0.00" />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setEditingAccount(null)} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-text-muted-themed bg-bg-accent-themed rounded-xl">Cancel</button>
              <button onClick={handleSaveEdit} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-white bg-brand-primary rounded-xl shadow-lg">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManager;