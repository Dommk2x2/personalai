
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, Account, SavedAmortizationSchedule, UserCredential, TodoItem, RecyclableItemType, RecyclableItem, Role, DayPlannerEntry, SubscriptionPlan, MenuItem, RechargePlan, VaultItem } from '../types';
import { TrashIcon as PageIcon, RestoreIcon, TrashIcon as DeleteIcon, AlertTriangleIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import { formatDateDisplay, formatTimestamp } from '../utils/dateUtils';
import { hexToRgba } from '../utils/colorUtils';
import ConfirmationModal from './ConfirmationModal';

interface RecycleBinProps {
  allTransactions: Transaction[];
  allAccounts: Account[];
  allSchedules: SavedAmortizationSchedule[];
  allUserCredentials: UserCredential[];
  allTodos: TodoItem[];
  allDayPlannerEntries: DayPlannerEntry[];
  allSubscriptionPlans: SubscriptionPlan[];
  allRechargePlans: RechargePlan[];
  allMenuItems: MenuItem[];
  allVaultItems: VaultItem[];
  onRestoreItem: (itemId: string, itemType: RecyclableItemType) => void;
  onPermanentlyDeleteItem: (itemId: string, itemType: RecyclableItemType) => void;
  onEmptyRecycleBin: (itemType: RecyclableItemType) => void;
  loggedInRole: Role | null;
}

const ITEMS_PER_PAGE = 10;

export const RecycleBinComponent: React.FC<RecycleBinProps> = ({
  allTransactions,
  allAccounts,
  allSchedules,
  allUserCredentials,
  allTodos,
  allDayPlannerEntries,
  allSubscriptionPlans,
  allRechargePlans,
  allMenuItems,
  allVaultItems,
  onRestoreItem,
  onPermanentlyDeleteItem,
  onEmptyRecycleBin,
  loggedInRole,
}) => {
  const { currentThemeColors } = useTheme();
  const [activeTab, setActiveTab] = useState<RecyclableItemType>('transaction');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingItem, setDeletingItem] = useState<{ id: string, type: RecyclableItemType, name: string } | null>(null);
  const [isEmptyingBin, setIsEmptyingBin] = useState(false);

  const deletedItems = useMemo(() => {
    let items: RecyclableItem[] = [];
    switch (activeTab) {
      case 'transaction':
        items = (allTransactions ?? []).filter(tx => tx.isDeleted);
        break;
      case 'account':
        items = (allAccounts ?? []).filter(acc => acc.isDeleted);
        break;
      case 'schedule':
        items = (allSchedules ?? []).filter(sch => sch.isDeleted);
        break;
      case 'userCredential':
        items = (allUserCredentials ?? []).filter(usr => usr.isDeleted && !(usr.username === 'admin' && usr.role === Role.ADMIN));
        break;
      case 'todoItem':
        items = (allTodos ?? []).filter(todo => todo.isDeleted);
        break;
      case 'dayPlannerEntry':
        items = (allDayPlannerEntries ?? []).filter(entry => entry.isDeleted);
        break;
      case 'subscriptionPlan':
        items = (allSubscriptionPlans ?? []).filter(plan => plan.isDeleted);
        break;
      case 'rechargePlan':
        items = (allRechargePlans ?? []).filter(plan => plan.isDeleted);
        break;
      case 'menuItem':
        items = (allMenuItems ?? []).filter(item => item.isDeleted);
        break;
      case 'vaultItem':
        items = (allVaultItems ?? []).filter(photo => photo.isDeleted);
        break;
    }
    return items.sort((a, b) => {
        const dateA = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
        const dateB = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
        return dateB - dateA; // Most recently deleted first
    });
  }, [activeTab, allTransactions, allAccounts, allSchedules, allUserCredentials, allTodos, allDayPlannerEntries, allSubscriptionPlans, allRechargePlans, allMenuItems, allVaultItems]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return deletedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [deletedItems, currentPage]);

  const totalPages = Math.ceil(deletedItems.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, deletedItems.length]);

  const handleTabChange = (tab: RecyclableItemType) => {
    setActiveTab(tab);
  };

  const getItemName = (item: RecyclableItem, type: RecyclableItemType): string => {
    switch (type) {
      case 'transaction': return (item as Transaction).description;
      case 'account': return (item as Account).name;
      case 'schedule': return (item as SavedAmortizationSchedule).loanName;
      case 'userCredential': return (item as UserCredential).username;
      case 'todoItem': return (item as TodoItem).text;
      case 'dayPlannerEntry': return (item as DayPlannerEntry).title;
      case 'subscriptionPlan': return (item as SubscriptionPlan).name;
      case 'rechargePlan': return (item as RechargePlan).provider;
      case 'menuItem': return (item as MenuItem).name;
      case 'vaultItem': return (item as VaultItem).name;
      default: return 'Unknown Item';
    }
  };
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const renderItemDetails = (item: RecyclableItem) => {
    const name = getItemName(item, activeTab);
    let detailsParts: string[] = [];
    detailsParts.push(`Name/Text: ${name.length > 50 ? name.substring(0,47) + '...' : name}`);
    
    if (item.deletedAt) {
      detailsParts.push(`Deleted: ${formatTimestamp(item.deletedAt)}`);
    }

    if ('amount' in item) {
      detailsParts.push(`Amount: ${formatCurrency(item.amount as number)}`);
    }
    if ('username' in item) {
      detailsParts.push(`Role: ${(item as UserCredential).role}`);
    }
    if ('date' in item) {
        detailsParts.push(`Date: ${formatDateDisplay((item as any).date)}`);
    }

    return (
      <p className="text-xs text-text-muted-themed truncate" title={detailsParts.join(' | ')}>
        {detailsParts.join(' | ')}
      </p>
    );
  };
  
  const TABS: { key: RecyclableItemType, label: string }[] = [
    { key: 'transaction', label: 'Transactions' },
    { key: 'account', label: 'Accounts' },
    { key: 'schedule', label: 'EMI Schedules' },
    { key: 'userCredential', label: 'Users' },
    { key: 'todoItem', label: 'To-dos' },
    { key: 'dayPlannerEntry', label: 'Planner Entries' },
    { key: 'subscriptionPlan', label: 'Subscriptions' },
    { key: 'rechargePlan', label: 'Recharges' },
    { key: 'menuItem', label: 'Menu Items' },
    { key: 'vaultItem', label: 'Vault Items' },
  ];

  if (loggedInRole !== Role.ADMIN) {
    return (
      <div className="bg-bg-secondary-themed p-6 rounded-xl shadow-lg text-center text-text-muted-themed">
        <AlertTriangleIcon className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
        <p className="font-semibold">Access Denied</p>
        <p className="text-sm">You do not have permission to view the Recycle Bin.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 rounded-xl shadow-xl" style={{ backgroundColor: currentThemeColors.bgSecondary }}>
      <h2 className="text-xl sm:text-2xl font-semibold text-text-base-themed mb-4 text-center flex items-center justify-center">
        <PageIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 text-brand-primary" />
        Recycle Bin
      </h2>
      
      <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-border-secondary pb-3">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors duration-200 ${
              activeTab === tab.key
                ? 'bg-brand-primary text-white shadow-md'
                : 'bg-bg-accent-themed text-text-muted-themed hover:bg-bg-primary-themed hover:text-text-base-themed'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsEmptyingBin(true)}
          disabled={deletedItems.length === 0}
          className="flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-sm text-expense bg-expense/10 hover:bg-expense/20 focus:outline-none focus:ring-1 focus:ring-expense transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DeleteIcon className="w-4 h-4 mr-1.5" />
          Empty {TABS.find(t => t.key === activeTab)?.label} Bin
        </button>
      </div>

      {paginatedItems.length > 0 ? (
        <div className="space-y-3">
          {paginatedItems.map(item => (
            <div key={item.id} className="p-3 bg-bg-primary-themed rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex-grow min-w-0 pr-4">
                  <p className="font-medium text-text-base-themed truncate" title={getItemName(item, activeTab)}>
                    {getItemName(item, activeTab)}
                  </p>
                  {renderItemDetails(item)}
                </div>
                <div className="flex-shrink-0 flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => onRestoreItem(item.id, activeTab)}
                    className="p-1.5 text-text-muted-themed hover:text-income hover:bg-income/10 rounded-full transition-all"
                    aria-label="Restore item"
                    title="Restore"
                  >
                    <RestoreIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingItem({ id: item.id, type: activeTab, name: getItemName(item, activeTab) })}
                    className="p-1.5 text-text-muted-themed hover:text-expense hover:bg-expense/10 rounded-full transition-all"
                    aria-label="Permanently delete item"
                    title="Permanently Delete"
                  >
                    <DeleteIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-text-muted-themed py-8">
          The recycle bin for {TABS.find(t => t.key === activeTab)?.label} is empty.
        </p>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center text-sm">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg shadow-sm flex items-center disabled:opacity-50"
            style={{backgroundColor: currentThemeColors.bgAccent, color: currentThemeColors.textBase, border: `1px solid ${currentThemeColors.borderSecondary}`}}
          >
            <ChevronLeftIcon className="w-4 h-4 mr-1" /> Prev
          </button>
          <span className="text-text-muted-themed">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg shadow-sm flex items-center disabled:opacity-50"
            style={{backgroundColor: currentThemeColors.bgAccent, color: currentThemeColors.textBase, border: `1px solid ${currentThemeColors.borderSecondary}`}}
          >
            Next <ChevronRightIcon className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}

      {deletingItem && (
        <ConfirmationModal
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          onConfirm={() => {
            if (deletingItem) {
              onPermanentlyDeleteItem(deletingItem.id, deletingItem.type);
              setDeletingItem(null);
            }
          }}
          title="Permanently Delete Item"
          message={`Are you sure you want to permanently delete "${deletingItem.name}"? This action cannot be undone.`}
          confirmText="Permanently Delete"
          type="danger"
        />
      )}

      {isEmptyingBin && (
        <ConfirmationModal
          isOpen={isEmptyingBin}
          onClose={() => setIsEmptyingBin(false)}
          onConfirm={() => {
            onEmptyRecycleBin(activeTab);
            setIsEmptyingBin(false);
          }}
          title={`Empty ${TABS.find(t => t.key === activeTab)?.label} Bin`}
          message={`Are you sure you want to permanently delete ALL items in the ${TABS.find(t => t.key === activeTab)?.label} bin? This action cannot be undone.`}
          confirmText="Empty Bin"
          type="danger"
        />
      )}
    </div>
  );
};
