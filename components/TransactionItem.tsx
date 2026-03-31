import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { TrashIcon, EditIcon, ClockIcon, ClipboardListIcon, ChevronDownIcon, ChevronUpIcon, DocumentIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme
import { getCategoryIcon } from './Icons'; // Import the new helper
import ConfirmationModal from './ConfirmationModal';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  onUpdate: (transaction: Transaction) => void;
  isNew?: boolean;
  isExiting?: boolean;
}

// A simple hash function to get a number from a string for consistent color selection
const stringToHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};


const CategoryPill: React.FC<{ category?: string; type?: TransactionType }> = ({ category, type }) => {
  const { currentThemeColors } = useTheme();
  if (!category) return null;

  let pillStyle: React.CSSProperties = {};

  if (type === TransactionType.INCOME) {
    // Use a subtle version of the income color for income category pills
    const incomeColor = currentThemeColors.income;
    pillStyle = {
      backgroundColor: `${incomeColor}20`, // Adding low alpha for background
      color: incomeColor,
    };
  } else {
    // For expense categories, generate a consistent color from the category name
    const hash = stringToHash(category);
    const accentColor = currentThemeColors.categoryPillAccents[hash % currentThemeColors.categoryPillAccents.length];
    pillStyle = {
      backgroundColor: `${accentColor}30`, // Adding low alpha for background
      color: accentColor,
    };
  }
  
  const Icon = getCategoryIcon(category);

  return (
    <span style={pillStyle} className="inline-flex items-center gap-x-1.5 px-2 py-0.5 text-xs font-medium rounded-full">
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {category}
    </span>
  );
};


const TransactionItem: React.FC<TransactionItemProps & { itemIndex: number }> = ({ transaction, onDelete, onEdit, onUpdate, itemIndex, isNew, isExiting }) => {
  const { currentThemeColors } = useTheme();
  const { id, type, description, amount: currentAmount, date, category, items, attachment, cashbackAmount, couponAmount } = transaction;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editedAmount, setEditedAmount] = useState(currentAmount.toString());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isIncome = type === TransactionType.INCOME;
  
  const amountStyle: React.CSSProperties = {
    color: isIncome ? currentThemeColors.income : currentThemeColors.expense,
  };
  const sign = isIncome ? '+' : '-';

  const handleAmountSave = () => {
    const newAmount = parseFloat(editedAmount);
    if (!isNaN(newAmount)) {
        onUpdate({ ...transaction, amount: newAmount });
    }
    setIsEditingAmount(false);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString + 'T00:00:00').toLocaleDateString(undefined, options);
  };
  
  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num);
  };

  const animationClass = isNew ? 'animate-transaction-add' : isExiting ? 'animate-transaction-delete' : '';

  const hasItems = items && items.length > 0;

  const handleViewAttachment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (attachment?.data) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`<iframe src="${attachment.data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        newWindow.document.title = attachment.name;
      } else {
        // Fallback for popup blockers
        const a = document.createElement('a');
        a.href = attachment.data;
        a.download = attachment.name;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }
  };


  const getBorderColor = () => {
    if (type === TransactionType.INCOME) return `${currentThemeColors.income}40`;
    if (type === TransactionType.EXPENSE) return `${currentThemeColors.expense}40`;
    if (type === TransactionType.TRANSFER) return `${currentThemeColors.brandPrimary}40`;
    return 'transparent';
  };

  const getBgColor = () => {
    if (type === TransactionType.INCOME) return `${currentThemeColors.income}05`;
    if (type === TransactionType.EXPENSE) return `${currentThemeColors.expense}05`;
    if (type === TransactionType.TRANSFER) return `${currentThemeColors.brandPrimary}05`;
    return currentThemeColors.bgSecondary;
  };

  return (
    <li 
      className={`p-3 rounded-xl shadow-sm hover:shadow-md dark:hover:shadow-slate-700/50 transition-all duration-300 flex flex-col border-2 ${animationClass}`}
      style={{ 
        borderColor: getBorderColor(),
        backgroundColor: getBgColor(),
      }}
    >
      <div className="flex justify-between items-start space-x-3">
        <div className="flex flex-col items-center shrink-0">
          <div className="flex items-center justify-center">
            {isEditingAmount ? (
              <input 
                type="number" 
                value={editedAmount} 
                onChange={(e) => setEditedAmount(e.target.value)}
                onBlur={handleAmountSave}
                onKeyDown={(e) => e.key === 'Enter' && handleAmountSave()}
                onClick={(e) => e.stopPropagation()}
                className="w-20 bg-transparent border-b border-brand-primary focus:outline-none font-semibold text-base text-center"
                style={amountStyle}
                autoFocus
              />
            ) : (
              <button
                className={`font-semibold text-base cursor-pointer`}
                style={amountStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingAmount(true);
                }}
              >
                {sign}{formatCurrency(currentAmount)}
              </button>
            )}
          </div>
          <div className="flex space-x-1 mt-1">
            <button
              onClick={() => onEdit(transaction)}
              className="p-1 text-text-muted-themed hover:text-brand-primary dark:hover:text-indigo-400 hover:bg-bg-accent-themed rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-brand-primary"
              aria-label="Edit transaction"
            >
              <EditIcon className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-1 text-text-muted-themed hover:text-expense dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-expense"
              aria-label="Delete transaction"
            >
              <TrashIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-base-themed font-medium truncate" title={description}>{description}</p>
          <div className="text-xs text-text-muted-themed mt-1 flex items-center space-x-2 flex-wrap gap-y-1">
            <span>Paid: {formatDate(date)}</span>
            {category && <CategoryPill category={category} type={type} />}
            {hasItems && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="inline-flex items-center gap-x-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full hover:bg-bg-accent-themed"
                style={{color: currentThemeColors.brandPrimary}}
              >
                <ClipboardListIcon className="w-3 h-3" />
                {items.length} item{items.length > 1 ? 's' : ''}
                {isExpanded ? <ChevronUpIcon className="w-2.5 h-2.5"/> : <ChevronDownIcon className="w-2.5 h-2.5"/>}
              </button>
            )}
            {attachment && (
              <button 
                onClick={handleViewAttachment} 
                className="inline-flex items-center gap-x-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full hover:bg-bg-accent-themed"
                style={{color: currentThemeColors.brandPrimary}}
              >
                <DocumentIcon className="w-3 h-3" />
                View Bill
              </button>
            )}
          </div>
          {(cashbackAmount || couponAmount) && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {cashbackAmount && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                  Cashback: {formatCurrency(cashbackAmount)}
                </span>
              )}
              {couponAmount && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                  Coupon: {formatCurrency(couponAmount)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => {
            onDelete(id);
            setIsDeleteModalOpen(false);
          }}
          title="Delete Transaction"
          message={`Are you sure you want to delete this transaction for ₹${currentAmount}? This action cannot be undone.`}
          confirmText="Delete"
          type="danger"
        />
      )}
      {isExpanded && hasItems && (
        <div className="w-full mt-3 pt-3 border-t" style={{borderColor: currentThemeColors.borderSecondary}}>
          <h4 className="text-xs font-semibold uppercase text-text-muted-themed mb-2">Item Details</h4>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-text-muted-themed">
                <th className="font-medium pb-1 pl-2">Item</th>
                <th className="font-medium pb-1 text-center">Qty</th>
                <th className="font-medium pb-1 text-right">Price</th>
                <th className="font-medium pb-1 text-right pr-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b" style={{borderColor: `${currentThemeColors.borderSecondary}80`}}>
                  <td className="py-1 pl-2 text-text-base-themed">{item.name}</td>
                  <td className="py-1 text-center">{item.quantity}</td>
                  <td className="py-1 text-right">{formatCurrency(item.price)}</td>
                  <td className="py-1 text-right pr-2 font-medium text-text-base-themed">{formatCurrency(item.quantity * item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </li>
  );
};

export default TransactionItem;