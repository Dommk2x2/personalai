
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { Account, Transaction, TransactionType, IncomeCategory, AddTransactionFormPayload, IncomeExpenseTransactionDetails, TransferTransactionDetails, Item, MenuItem, ExpenseCategory, TransferUpdateDetails, BudgetSetting, BudgetPeriod, ToastType, SavedAmortizationSchedule } from '../types';
import { PlusIcon, EditIcon, SaveIcon, XIcon, TrashIcon, ChevronRightIcon, ChevronLeftIcon, DownloadIcon, EyeIcon, FolderOpenIcon, FolderPlusIcon, DocumentIcon, XCircleIcon, SwitchHorizontalIcon, HistoryIcon, CalendarIcon, ClipboardDocumentCheckIcon, ChevronDownIcon, IncomeIcon, ExpenseIcon, ArrowUturnLeftIcon, TargetIcon, ChartIcon, TrendingUpIcon } from './Icons';
import CategoryBarChartComponent from './CategoryBarChartComponent';
import TrendsChartComponent from './TrendsChartComponent';
import { BudgetManager } from './BudgetManager';
import TransactionItem from './TransactionItem';
import { PassbookView } from './PassbookView';
import { useAccounts } from '../contexts/AccountContext';
import { useTheme } from '../contexts/ThemeContext';
import { TRANSFER_CATEGORY, LOCAL_STORAGE_STORED_RECEIPTS_KEY, LOCAL_STORAGE_UNREAD_RECEIPTS_COUNT_KEY } from '../constants';
import { formatDateToYYYYMMDD, formatDateDisplay, getWeekIdentifier, getMonthIdentifier, getFinancialMonthIdentifier, getPeriodDateRange } from '../utils/dateUtils';
import { hexToRgba } from '../utils/colorUtils';
import useLocalStorage from '../hooks/useLocalStorage';

interface TransactionFormProps {
  addTransaction: (transactionData: AddTransactionFormPayload) => void;
  addRecurringReminder: (transactionData: {description: string, amount: number, type: 'income' | 'expense', date: string, accountId: string}) => void;
  editTransaction: (transaction: Transaction) => void;
  editTransfer: (details: TransferUpdateDetails) => void;
  transactionToEdit: Transaction | null;
  clearEdit: () => void;
  incomeCategories: string[];
  expenseCategories: string[];
  allTransactions: Transaction[];
  suggestedTransactionToFill: Partial<Transaction> | null;
  clearSuggestedTransaction: () => void;
  menuItems: MenuItem[];
  onOpenCalendar: () => void;
  onOpenBudgets: () => void;
  onOpenCharts: () => void;
  onBack: () => void;
  onTypeConfirmed: (confirmed: boolean) => void;
  budgetSettings: BudgetSetting[];
  financialMonthStartDay: number;
  financialMonthEndDay: number;
  accounts: Account[];
  activeAccountId: string | null;
  onSetBudget: (budget: BudgetSetting) => void;
  onDeleteBudget: (category: string, period: BudgetPeriod, identifier: string, accountId: string) => void;
  addToast: (message: string, type: ToastType) => void;
  addExpenseCategory: (name: string) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onOpenPassbook: () => void;
  emiSchedules: SavedAmortizationSchedule[];
  totalCashbackBalance?: number;
  appTitle: string;
  onOpenGlobalFilter?: () => void;
  globalStartDate?: string | null;
  globalEndDate?: string | null;
  globalPeriodLabel?: string;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = (props) => {
  const {
    addTransaction,
    addRecurringReminder,
    editTransaction,
    editTransfer,
    transactionToEdit,
    clearEdit,
    incomeCategories,
    expenseCategories,
    allTransactions,
    suggestedTransactionToFill,
    clearSuggestedTransaction,
    menuItems,
    onOpenCalendar,
    onOpenBudgets,
    onOpenCharts,
    onBack,
    onTypeConfirmed,
    budgetSettings,
    financialMonthStartDay,
    financialMonthEndDay,
    accounts,
    onSetBudget,
    onDeleteBudget,
    addToast,
    addExpenseCategory,
    activeAccountId,
    onDeleteTransaction,
    onUpdateTransaction,
    onOpenPassbook,
    emiSchedules,
    totalCashbackBalance = 0,
    appTitle,
    onOpenGlobalFilter,
    globalStartDate,
    globalEndDate,
    globalPeriodLabel,
    onPrevMonth,
    onNextMonth,
  } = props;
  const { currentThemeColors } = useTheme();

  const [type, setType] = useState<TransactionType | null>(null);
  const [isTypeConfirmed, setIsTypeConfirmed] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState(formatDateToYYYYMMDD(new Date()));
  const [category, setCategory] = useState<string | undefined>('');
  const [validityDays, setValidityDays] = useState<string>('');
  const [emiId, setEmiId] = useState<string>('');
  const [isFullEmiPayment, setIsFullEmiPayment] = useState(false);
  const [cashbackAmount, setCashbackAmount] = useState<string>('');
  const [couponUsed, setCouponUsed] = useState<string>('');
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showTrends, setShowTrends] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [showPassbookInline, setShowPassbookInline] = useState(false);
  const [isBudgetedFlipped, setIsBudgetedFlipped] = useState(false);
  const [isUnbudgetedFlipped, setIsUnbudgetedFlipped] = useState(false);
  
  const filteredTransactions = useMemo(() => {
    const start = globalStartDate || (date.substring(0, 7) + '-01');
    const end = globalEndDate || (date.substring(0, 7) + '-31'); // Rough end for month

    return allTransactions.filter(tx => {
        const matchesAccount = activeAccountId ? tx.accountId === activeAccountId : true;
        const matchesDate = tx.date >= start && tx.date <= end;
        return matchesAccount && matchesDate && !tx.isDeleted;
    });
  }, [allTransactions, activeAccountId, date, globalStartDate, globalEndDate]);
  
  // Suggestion State
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const descriptionInputRef = useRef<HTMLInputElement>(null);
  const suggestionBoxRef = useRef<HTMLUListElement>(null);

  const resetForm = useCallback((options?: { keepDate?: boolean, keepType?: boolean }) => {
    if (!options?.keepType) {
        setType(null);
        setIsTypeConfirmed(false);
    }
    setDescription('');
    setAmount('');
    setCategory('');
    if (!options?.keepDate) setDate(formatDateToYYYYMMDD(new Date()));
    setEmiId('');
    setIsFullEmiPayment(false);
    setCashbackAmount('');
    setCouponUsed('');
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  useEffect(() => {
    onTypeConfirmed(isTypeConfirmed);
  }, [isTypeConfirmed, onTypeConfirmed]);

  useEffect(() => {
    if (transactionToEdit) {
      setIsEditing(true);
      setDescription(transactionToEdit.description);
      setAmount(String(transactionToEdit.amount));
      setDate(transactionToEdit.date);
      setType(transactionToEdit.type);
      setCategory(transactionToEdit.category || '');
      setValidityDays(transactionToEdit.validityDays ? String(transactionToEdit.validityDays) : '');
      setEmiId(transactionToEdit.emiId || '');
      setIsFullEmiPayment(transactionToEdit.isFullEmiPayment || false);
      setCashbackAmount(transactionToEdit.cashbackAmount ? String(transactionToEdit.cashbackAmount) : '');
      setCouponUsed(transactionToEdit.couponUsed ? String(transactionToEdit.couponUsed) : '');
      setIsTypeConfirmed(true);
    } else {
        setIsEditing(false);
    }
  }, [transactionToEdit]);

  // Sync with suggestions (e.g. from Calendar)
  useEffect(() => {
    if (suggestedTransactionToFill && !isEditing) {
      if (suggestedTransactionToFill.date) setDate(suggestedTransactionToFill.date);
      if (suggestedTransactionToFill.description) setDescription(suggestedTransactionToFill.description);
      if (suggestedTransactionToFill.type) {
          setType(suggestedTransactionToFill.type);
          setIsTypeConfirmed(true);
      }
      if (suggestedTransactionToFill.amount) setAmount(String(suggestedTransactionToFill.amount));
      if (suggestedTransactionToFill.category) setCategory(suggestedTransactionToFill.category);
      if (suggestedTransactionToFill.validityDays) setValidityDays(String(suggestedTransactionToFill.validityDays));
      if (suggestedTransactionToFill.emiId) setEmiId(suggestedTransactionToFill.emiId);
      if (suggestedTransactionToFill.isFullEmiPayment) setIsFullEmiPayment(suggestedTransactionToFill.isFullEmiPayment);
    }
  }, [suggestedTransactionToFill, isEditing]);

  // Handle Description Change & Suggestions
  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    if (val.trim().length > 1 && !isEditing) {
        const uniqueMatches = Array.from(new Set(
            allTransactions
                .filter(tx => 
                    !tx.isDeleted && 
                    tx.description.toLowerCase().includes(val.toLowerCase())
                )
                .map(tx => tx.description)
        )).slice(0, 5);
        setSuggestions(uniqueMatches);
        setShowSuggestions(uniqueMatches.length > 0);
    } else {
        setShowSuggestions(false);
    }
  };

  const selectSuggestion = (desc: string) => {
    setDescription(desc);
    setShowSuggestions(false);
    
    const lastMatch = allTransactions
        .filter(tx => !tx.isDeleted && tx.description === desc)
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0];
    
    if (lastMatch) {
        setCategory(lastMatch.category);
        if (lastMatch.type) setType(lastMatch.type);
    }
  };

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
        if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(e.target as Node) && !descriptionInputRef.current?.contains(e.target as Node)) {
            setShowSuggestions(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Math.abs(parseFloat(amount));
    const numericCashback = Math.max(0, parseFloat(cashbackAmount) || 0);
    const numericCouponUsed = Math.max(0, parseFloat(couponUsed) || 0);
    if (!type || !description || isNaN(numericAmount) || numericAmount <= 0) return;

    if (isEditing && transactionToEdit) {
        const updatedTx: Transaction = { 
            ...transactionToEdit, 
            description, 
            amount: numericAmount, 
            date, 
            category, 
            validityDays: validityDays ? parseInt(validityDays) : undefined, 
            emiId: emiId || undefined, 
            isFullEmiPayment,
            cashbackAmount: numericCashback || undefined,
            couponUsed: numericCouponUsed || undefined
        };
        onUpdateTransaction(updatedTx);
    } else {
        addTransaction({ 
            type: type!, 
            description, 
            amount: numericAmount, 
            date, 
            category, 
            validityDays: validityDays ? parseInt(validityDays) : undefined, 
            emiId: emiId || undefined, 
            isFullEmiPayment, 
            accountId: activeAccountId || undefined,
            cashbackAmount: numericCashback || undefined,
            couponUsed: numericCouponUsed || undefined
        });
    }
    resetForm({ keepDate: true, keepType: true });
    if (isEditing) clearEdit();
    if (suggestedTransactionToFill) clearSuggestedTransaction();
  };
  
  const inputBaseClasses = "w-full p-2 bg-bg-primary-themed border border-border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm font-bold text-text-base-themed";
  const labelClasses = "text-[10px] font-black uppercase text-text-muted-themed tracking-widest mb-1.5 block px-1";


  const getFormBorderColor = () => {
    if (type === TransactionType.INCOME) return `${currentThemeColors.income}40`;
    if (type === TransactionType.EXPENSE) return `${currentThemeColors.expense}40`;
    if (type === TransactionType.TRANSFER) return `${currentThemeColors.brandPrimary}40`;
    return 'transparent';
  };

  const formatCurrency = (amount: number, minimumFractionDigits = 2) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits, maximumFractionDigits: 2 }).format(amount);
  };

  const summaryData = useMemo(() => {
    const identifier = getFinancialMonthIdentifier(new Date(date), financialMonthStartDay);
    const { start: startRange, end: endRange } = getPeriodDateRange(BudgetPeriod.MONTHLY, identifier, { startDay: financialMonthStartDay, endDay: financialMonthEndDay });
    
    const startDate = globalStartDate || formatDateToYYYYMMDD(startRange);
    const endDate = globalEndDate || formatDateToYYYYMMDD(endRange);
    
    // Calculate opening balance before startDate
    const calculatedOpeningBalance = allTransactions
      .filter(t => !t.isDeleted && (!activeAccountId || t.accountId === activeAccountId) && t.date < startDate)
      .reduce((sum, t) => {
        if (t.type === TransactionType.INCOME) return sum + t.amount;
        if (t.type === TransactionType.EXPENSE) {
          const usedBenefits = t.couponUsed || 0;
          return sum - (t.amount - usedBenefits);
        }
        return sum;
      }, 0);
    
    const filtered = allTransactions.filter(tx => {
        const matchesAccount = activeAccountId ? tx.accountId === activeAccountId : true;
        const matchesDate = tx.date >= startDate && tx.date <= endDate;
        return matchesAccount && matchesDate && !tx.isDeleted;
    });
    
    const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = filtered.filter(t => t.type === 'expense').reduce((sum, t) => {
        const usedBenefits = t.couponUsed || 0;
        return sum + (t.amount - usedBenefits);
    }, 0);
    
    const formDate = new Date(date);
    formDate.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    let daysLeft = Math.ceil((end.getTime() - formDate.getTime()) / (1000 * 60 * 60 * 24));
    const isPast = daysLeft < 0;
    if (daysLeft < 1) daysLeft = 1;
    
    const allActiveEmis = emiSchedules.filter(s => {
        if (s.isDeleted) return false;
        const totalMonths = s.schedule.length;
        const paidMonths = Object.values(s.paymentStatus || {}).filter(Boolean).length;
        return paidMonths < totalMonths;
    });

    const activeEmis = allActiveEmis.filter(s => {
        // Find next unpaid installment
        const nextUnpaid = s.schedule.find((_, idx) => !s.paymentStatus?.[idx + 1]);
        if (!nextUnpaid) return false;

        const dueDate = new Date(nextUnpaid.paymentDate);
        dueDate.setHours(0, 0, 0, 0);
        
        // Calculate difference in days (Due Date - Selected Date)
        const diffTime = dueDate.getTime() - formDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        // User request: "DUE DATE 5 TODAY MAR 31 SO I EMI WILL NOT OPEN ON THAT DAY"
        // 31st to 5th is 5 days. If it "will not open", then diffDays must be less than 5.
        return diffDays < 5;
    });

    const net = calculatedOpeningBalance + income - expenses;
    const perDaySuggestion = isPast ? 0 : Math.max(0, net / daysLeft);

    return { 
      income, 
      expenses, 
      net, 
      startDate, 
      endDate, 
      openingBalance: calculatedOpeningBalance,
      perDaySuggestion,
      isPast,
      activeEmis,
      allActiveEmis,
      filteredTransactions: filtered,
      budgetedExpenses: filtered
        .filter(t => t.type === TransactionType.EXPENSE && budgetSettings.some(b => b.category === t.category && b.period === BudgetPeriod.MONTHLY && b.periodIdentifier === identifier && (!activeAccountId || b.accountId === activeAccountId)))
        .reduce((sum, t) => sum + (t.amount - (t.couponUsed || 0)), 0),
      totalBudgetAllocated: budgetSettings
        .filter(b => b.period === BudgetPeriod.MONTHLY && b.periodIdentifier === identifier && (!activeAccountId || b.accountId === activeAccountId))
        .reduce((sum, b) => sum + b.allocated, 0),
      unbudgetedExpenses: filtered
        .filter(t => t.type === TransactionType.EXPENSE && !budgetSettings.some(b => b.category === t.category && b.period === BudgetPeriod.MONTHLY && b.periodIdentifier === identifier && (!activeAccountId || b.accountId === activeAccountId)))
        .reduce((sum, t) => sum + (t.amount - (t.couponUsed || 0)), 0),
      unbudgetedCategories: Array.from(new Set(filtered
        .filter(t => t.type === TransactionType.EXPENSE && !budgetSettings.some(b => b.category === t.category && b.period === BudgetPeriod.MONTHLY && b.periodIdentifier === identifier && (!activeAccountId || b.accountId === activeAccountId)))
        .map(t => t.category || 'Other')
      )),
      budgetedCategoryBreakdown: budgetSettings
        .filter(b => b.period === BudgetPeriod.MONTHLY && b.periodIdentifier === identifier && (!activeAccountId || b.accountId === activeAccountId))
        .reduce((acc, b) => {
          const cat = b.category;
          const spent = filtered
            .filter(t => t.type === TransactionType.EXPENSE && t.category === cat)
            .reduce((sum, t) => sum + (t.amount - (t.couponUsed || 0)), 0);
          acc[cat] = { spent, allocated: b.allocated };
          return acc;
        }, {} as Record<string, { spent: number, allocated: number }>),
      unbudgetedCategoryBreakdown: filtered
        .filter(t => t.type === TransactionType.EXPENSE && !budgetSettings.some(b => b.category === t.category && b.period === BudgetPeriod.MONTHLY && b.periodIdentifier === identifier && (!activeAccountId || b.accountId === activeAccountId)))
        .reduce((acc, t) => {
          const cat = t.category || 'Other';
          const amount = t.amount - (t.couponUsed || 0);
          acc[cat] = (acc[cat] || 0) + amount;
          return acc;
        }, {} as Record<string, number>)
    };
  }, [allTransactions, activeAccountId, date, financialMonthStartDay, financialMonthEndDay, emiSchedules, budgetSettings]);

  useEffect(() => {
    if (type === TransactionType.EXPENSE && category === ExpenseCategory.EMI) {
        if (summaryData.activeEmis.length === 0) {
            setAmount('');
            setEmiId('');
            setIsFullEmiPayment(false);
        }
    }
  }, [category, type, summaryData.activeEmis.length]);

  const handleTypeSelect = (t: TransactionType) => {
    setType(t);
    setIsTypeConfirmed(true);
  };

  const handleEmiSelect = (id: string, fullPayment?: boolean) => {
    setEmiId(id);
    // User request: "emi trasaction i want to take current date"
    // When selecting an EMI, default to today's date
    setDate(formatDateToYYYYMMDD(new Date()));
    
    const selected = emiSchedules.find(s => s.id === id);
    if (selected) {
        const totalMonths = selected.schedule.length;
        const paidMonths = Object.values(selected.paymentStatus || {}).filter(Boolean).length;
        const currentInstallment = paidMonths + 1;
        
        // Calculate outstanding
        const firstUnpaidIndex = selected.schedule.findIndex((_, index) => !selected.paymentStatus?.[index + 1]);
        const outstanding = firstUnpaidIndex !== -1 ? selected.schedule[firstUnpaidIndex].beginningBalance : 0;
        
        const isFull = fullPayment !== undefined ? fullPayment : isFullEmiPayment;
        
        if (isFull) {
            setDescription(`Full Payment: ${selected.loanName}`);
            setAmount(String(outstanding.toFixed(2)));
        } else {
            setDescription(`EMI: ${selected.loanName} (${currentInstallment}/${totalMonths})`);
            setAmount(String(selected.calculatedEmi));
        }
    }
  };

  const toggleFullEmiPayment = () => {
    const nextValue = !isFullEmiPayment;
    setIsFullEmiPayment(nextValue);
    if (emiId) {
        handleEmiSelect(emiId, nextValue);
    }
  };

  return (
    <div className="space-y-6">
        <div 
            className="p-5 sm:p-8 rounded-3xl shadow-xl border-2 animate-fade-in bg-bg-secondary-themed transition-all duration-500"
            style={{ borderColor: getFormBorderColor() }}
        >
            <div className="flex flex-wrap justify-between items-center gap-y-4 mb-8">
                <div className="flex items-center gap-4">
                    <div 
                        className={`p-2 rounded-xl bg-brand-primary/10 transition-all ${(!isTypeConfirmed || !type) ? 'cursor-pointer hover:bg-brand-primary/20 active:scale-95' : ''}`}
                        onClick={() => {
                            if (!isTypeConfirmed || !type) {
                                console.log('Global filter area clicked');
                                onOpenGlobalFilter?.();
                            }
                        }}
                        title={(!isTypeConfirmed || !type) ? "Open Global Date Filter" : undefined}
                    >
                        {isTypeConfirmed && type ? (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isEditing) setIsTypeConfirmed(false);
                                }}
                                className="p-1 hover:bg-bg-accent-themed rounded-lg transition-colors"
                                title="Change Type"
                                disabled={isEditing}
                            >
                                <ArrowUturnLeftIcon className="w-5 h-5 text-brand-primary" />
                            </button>
                        ) : (
                            <PlusIcon className="w-6 h-6 text-brand-primary" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-text-base-themed uppercase tracking-tight leading-none">
                            {isEditing ? 'Update Entry' : (isTypeConfirmed ? `New ${type}` : 'Record Transaction')}
                        </h2>
                        <p className="text-[10px] font-bold text-text-muted-themed uppercase tracking-widest mt-1">
                            {isTypeConfirmed ? 'Enter details below' : 'Select transaction type'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                </div>
            </div>

            {!isTypeConfirmed ? (
                <div className="grid grid-cols-3 gap-2 animate-fade-in">
                    <button 
                        type="button" 
                        onClick={() => handleTypeSelect(TransactionType.EXPENSE)}
                        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border-2 border-rose-100 dark:border-rose-500/20 hover:border-rose-500 transition-all group"
                    >
                        <div className="p-2 rounded-xl bg-rose-500 text-white shadow-lg shadow-rose-500/30 mb-2">
                            <ExpenseIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight">Expense</span>
                    </button>

                    <button 
                        type="button" 
                        onClick={() => handleTypeSelect(TransactionType.INCOME)}
                        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-100 dark:border-emerald-500/20 hover:border-emerald-500 transition-all group"
                    >
                        <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 mb-2">
                            <IncomeIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">Income</span>
                    </button>

                    <button 
                        type="button" 
                        onClick={() => handleTypeSelect(TransactionType.TRANSFER)}
                        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border-2 border-blue-100 dark:border-blue-500/20 hover:border-blue-500 transition-all group"
                    >
                        <div className="p-2 rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/30 mb-2">
                            <SwitchHorizontalIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tight">Transfer</span>
                    </button>
                </div>
            ) : (
                <form onSubmit={handleFormSubmit} className="space-y-6 animate-fade-in">
                    <div className="flex p-1.5 bg-bg-primary-themed rounded-2xl gap-1.5">
                        {([TransactionType.EXPENSE, TransactionType.INCOME, TransactionType.TRANSFER] as const).map(t => {
                            const active = type === t;
                            let activeStyle = '';
                            if (active) {
                                if (t === TransactionType.INCOME) activeStyle = 'bg-bg-secondary-themed text-green-500 shadow-sm';
                                else if (t === TransactionType.EXPENSE) activeStyle = 'bg-bg-secondary-themed text-red-500 shadow-sm';
                                else activeStyle = 'bg-bg-secondary-themed text-blue-500 shadow-sm';
                            }
                            return (
                                <button 
                                    key={t} 
                                    type="button" 
                                    onClick={() => !isEditing && setType(t)} 
                                    className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${active ? activeStyle : 'text-text-muted-themed hover:bg-bg-accent-themed'}`}
                                    disabled={isEditing}
                                >
                                    {t}
                                </button>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClasses}>Amount (INR)</label>
                            <input 
                                type="number" 
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)} 
                                required 
                                readOnly={type === TransactionType.EXPENSE && category === ExpenseCategory.EMI && summaryData.activeEmis.length === 0}
                                className={`${inputBaseClasses} ${type === TransactionType.EXPENSE && category === ExpenseCategory.EMI && summaryData.activeEmis.length === 0 ? 'opacity-50 cursor-not-allowed bg-bg-primary-themed' : ''}`} 
                                placeholder="0.00"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>Date</label>
                            <div className="relative">
                                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={`${inputBaseClasses} dark:[color-scheme:dark] pr-10`} />
                                <CalendarIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-text-muted-themed pointer-events-none"/>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <label className={labelClasses}>Description</label>
                        <input 
                            ref={descriptionInputRef}
                            type="text" 
                            value={description} 
                            onChange={e => handleDescriptionChange(e.target.value)} 
                            onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
                            required 
                            className={inputBaseClasses} 
                            placeholder="What is this for?" 
                        />
                        
                        {showSuggestions && (
                            <ul 
                                ref={suggestionBoxRef}
                                className="absolute z-50 w-full mt-2 bg-bg-secondary-themed border border-border-primary rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
                            >
                                <li className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-text-muted-themed bg-bg-primary-themed border-b border-border-primary flex items-center gap-2">
                                    <HistoryIcon className="w-3 h-3" />
                                    Recent
                                </li>
                                {suggestions.map((s, i) => (
                                    <li 
                                        key={i}
                                        onClick={() => selectSuggestion(s)}
                                        className="px-4 py-3 text-sm font-bold text-text-base-themed hover:bg-brand-primary/5 hover:text-brand-primary cursor-pointer transition-colors"
                                    >
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {type === TransactionType.EXPENSE && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
                            <div className="p-4 rounded-2xl bg-green-50/50 dark:bg-green-900/10 border border-green-100/50 dark:border-green-900/20">
                                <label className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest mb-2 block">Cashback (Received)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={cashbackAmount} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '' || parseFloat(val) >= 0) {
                                                setCashbackAmount(val);
                                            }
                                        }} 
                                        className={`${inputBaseClasses} border-green-200 dark:border-green-900/30 focus:ring-green-500/20`} 
                                        placeholder="0.00"
                                    />
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Received</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block">Coupon (Discount)</label>
                                    <span className="text-[9px] font-bold text-blue-500 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">
                                        Avail: ₹{(
                                            totalCashbackBalance 
                                            - (parseFloat(couponUsed) || 0) 
                                            + (isEditing && transactionToEdit ? (transactionToEdit.couponUsed || 0) : 0)
                                            + (parseFloat(cashbackAmount) || 0)
                                            - (isEditing && transactionToEdit ? (transactionToEdit.cashbackAmount || 0) : 0)
                                        ).toFixed(2)}
                                    </span>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={couponUsed} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '' || parseFloat(val) >= 0) {
                                                setCouponUsed(val);
                                            }
                                        }} 
                                        className={`${inputBaseClasses} border-blue-200 dark:border-blue-900/30 focus:ring-blue-500/20`} 
                                        placeholder="0.00"
                                    />
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Discount</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {type === TransactionType.TRANSFER ? (
                        <div className="text-center p-6 bg-bg-primary-themed rounded-2xl border border-dashed border-border-primary text-text-muted-themed font-bold text-xs uppercase tracking-widest">
                            Transfer functionality coming soon
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <label className={labelClasses}>Category</label>
                            <div className="relative">
                                <select 
                                    value={category} 
                                    onChange={e => {
                                        const newCat = e.target.value;
                                        setCategory(newCat);
                                        // User request: "emi trasaction i want to take current date"
                                        if (newCat === ExpenseCategory.EMI && type === TransactionType.EXPENSE) {
                                            setDate(formatDateToYYYYMMDD(new Date()));
                                        }
                                    }} 
                                    required 
                                    className={`${inputBaseClasses} appearance-none pr-10`}
                                >
                                    <option value="">Select a Category</option>
                                    {[...(type === TransactionType.EXPENSE ? expenseCategories : incomeCategories)].sort((a, b) => (a || '').localeCompare(b || '')).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <ChevronDownIcon className="w-5 h-5 text-text-muted-themed" />
                                </div>
                            </div>
                        </div>
                    )}

                    {type === TransactionType.EXPENSE && category === ExpenseCategory.MOBILE && (
                        <div className="animate-fade-in">
                            <label className={labelClasses}>Validity (Days)</label>
                            <input 
                                type="number" 
                                value={validityDays} 
                                onChange={(e) => setValidityDays(e.target.value)} 
                                className={inputBaseClasses} 
                                placeholder="Enter validity in days"
                            />
                        </div>
                    )}

                    {type === TransactionType.EXPENSE && category === ExpenseCategory.EMI && (
                        <div className="animate-fade-in space-y-4">
                            {summaryData.activeEmis.length > 0 ? (
                                <>
                                    <div>
                                        <label className={labelClasses}>Select Active EMI</label>
                                        <div className="relative">
                                            <select 
                                                value={emiId} 
                                                onChange={e => handleEmiSelect(e.target.value)} 
                                                className={`${inputBaseClasses} appearance-none pr-10`}
                                            >
                                                <option value="">Select an EMI</option>
                                                {[...summaryData.activeEmis].sort((a, b) => (a.loanName || '').localeCompare(b.loanName || '')).map(emi => {
                                                    const firstUnpaidIndex = emi.schedule.findIndex((_, index) => !emi.paymentStatus?.[index + 1]);
                                                    const outstanding = firstUnpaidIndex !== -1 ? emi.schedule[firstUnpaidIndex].beginningBalance : 0;
                                                    return (
                                                        <option key={emi.id} value={emi.id}>
                                                            {emi.loanName} (EMI: {formatCurrency(emi.calculatedEmi)} | Out: {formatCurrency(outstanding)})
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <ChevronDownIcon className="w-5 h-5 text-text-muted-themed" />
                                            </div>
                                        </div>
                                    </div>

                                    {emiId && (
                                        <div className="flex items-center gap-3 p-3 bg-bg-primary-themed rounded-2xl border border-border-primary transition-all">
                                            <button 
                                                type="button"
                                                onClick={toggleFullEmiPayment}
                                                className={`w-10 h-5 rounded-full relative transition-all duration-300 ${isFullEmiPayment ? 'bg-brand-primary' : 'bg-bg-accent-themed'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${isFullEmiPayment ? 'left-6' : 'left-1'}`} />
                                            </button>
                                            <span className="text-xs font-bold text-text-muted-themed uppercase tracking-wider">Pay Total Outstanding</span>
                                        </div>
                                    )}
                                </>
                            ) : summaryData.allActiveEmis.length > 0 ? (
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-2xl text-center">
                                    <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-widest">
                                        No EMIs due within the next 5 days.
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 bg-bg-primary-themed border border-border-primary rounded-2xl text-center">
                                    <p className="text-xs font-bold text-text-muted-themed uppercase tracking-widest">
                                        No active EMI schedules found.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-4">
                        {isEditing && (
                            <button 
                                type="button" 
                                onClick={() => { resetForm(); clearEdit(); }}
                                className="flex-1 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-text-muted-themed bg-bg-accent-themed rounded-2xl shadow-xl transition-all active:scale-[0.98] hover:opacity-90"
                            >
                                Cancel
                            </button>
                        )}
                        <button 
                            type="submit" 
                            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white rounded-2xl shadow-xl transition-all active:scale-[0.98] hover:opacity-90 bg-brand-primary`}
                            style={{ boxShadow: `0 12px 20px -8px ${hexToRgba(currentThemeColors.brandPrimary, 0.5)}`}}
                        >
                            {isEditing ? 'Update Entry' : 'Record Entry'}
                        </button>
                    </div>
                </form>
            )}
        </div>

        <div className="bg-bg-secondary-themed p-5 rounded-2xl shadow-lg border border-border-primary relative">
            <div className="flex justify-between items-center mb-3">
                <div className="flex-1"></div>
                <div className="text-center text-[10px] font-bold text-text-muted-themed uppercase tracking-widest">
                    {formatDateDisplay(summaryData.startDate)} - {formatDateDisplay(summaryData.endDate)}
                </div>
                <div className="flex-1 text-right">
                    {!summaryData.isPast && (
                        <div className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                            Per Day: <span className="text-xs">{formatCurrency(summaryData.perDaySuggestion)}</span>
                        </div>
                    )}
                </div>
            </div>
            <table className="w-full text-sm text-center">
                <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                        <th className="py-2 font-bold text-text-base-themed border-r border-border-primary">Opening Balance</th>
                        <th className="py-2 font-bold text-green-600 dark:text-green-400 border-r border-slate-200 dark:border-slate-800">Total Income</th>
                        <th className="py-2 font-bold text-red-600 dark:text-red-400 border-r border-slate-200 dark:border-slate-800">Total Expense</th>
                        <th className="py-2 font-bold text-text-base-themed">Net Balance</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="py-2 font-bold border-r border-slate-200 dark:border-slate-800">{formatCurrency(summaryData.openingBalance)}</td>
                        <td className="py-2 font-bold text-green-500 border-r border-slate-200 dark:border-slate-800">+{formatCurrency(summaryData.income)}</td>
                        <td className="py-2 font-bold text-red-500 border-r border-slate-200 dark:border-slate-800">-{formatCurrency(summaryData.expenses)}</td>
                        <td className="py-2 font-black">{formatCurrency(summaryData.net)}</td>
                    </tr>
                </tbody>
            </table>

            {summaryData.income > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                    <div className="flex justify-between items-end mb-1.5">
                        <span className="text-[9px] font-black text-text-muted-themed uppercase tracking-widest">Expense Ratio</span>
                        <span className="text-[10px] font-bold text-text-muted-themed">
                            {((summaryData.expenses / summaryData.income) * 100).toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-bg-accent-themed rounded-full overflow-hidden">
                        <div 
                            className="h-full rounded-full transition-all duration-1000" 
                            style={{ 
                                width: `${Math.min((summaryData.expenses / summaryData.income) * 100, 100)}%`,
                                backgroundColor: currentThemeColors.expense
                            }} 
                        />
                    </div>
                </div>
            )}

            {summaryData.expenses > 0 && (
                <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 items-stretch">
                        {/* Budgeted Card */}
                        <div 
                            className="relative min-h-[180px] h-full w-full perspective-1000 cursor-pointer group"
                            onClick={() => setIsBudgetedFlipped(!isBudgetedFlipped)}
                        >
                            <motion.div 
                                className="w-full h-full relative preserve-3d transition-all duration-500 grid"
                                animate={{ rotateY: isBudgetedFlipped ? 180 : 0 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                            >
                                {/* Front */}
                                <div className="col-start-1 row-start-1 backface-hidden p-3 bg-bg-primary-themed rounded-2xl border border-border-primary flex flex-col h-full overflow-hidden">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[8px] font-black text-text-muted-themed uppercase tracking-widest">Budgeted</span>
                                        <span className="text-[9px] font-bold text-brand-primary">{((summaryData.budgetedExpenses / summaryData.expenses) * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="text-sm font-black text-text-base-themed flex items-baseline gap-1">
                                        <span>{formatCurrency(summaryData.budgetedExpenses)}</span>
                                        <span className="text-text-muted-themed text-[10px] font-bold">/ {formatCurrency(summaryData.totalBudgetAllocated)}</span>
                                    </div>
                                    <div className="w-full h-1 bg-bg-accent-themed rounded-full mt-2 overflow-hidden">
                                        <div 
                                            className="h-full bg-brand-primary" 
                                            style={{ width: `${(summaryData.budgetedExpenses / summaryData.expenses) * 100}%` }}
                                        />
                                    </div>
                                    
                                    <div className="mt-3 flex-grow">
                                        {Object.keys(summaryData.budgetedCategoryBreakdown).length > 0 ? (
                                            <div className="space-y-1.5">
                                                {Object.entries(summaryData.budgetedCategoryBreakdown).slice(0, 3).map(([cat, data]: [string, any]) => (
                                                    <div key={cat} className="flex flex-col gap-0.5">
                                                        <div className="flex justify-between items-center text-[9px]">
                                                            <span className="text-text-muted-themed font-bold truncate pr-2">{cat}</span>
                                                            <span className="text-text-base-themed font-black whitespace-nowrap">{formatCurrency(data.spent, 0)}</span>
                                                        </div>
                                                        <div className="w-full h-0.5 bg-bg-accent-themed rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full ${data.spent > data.allocated ? 'bg-rose-500' : 'bg-brand-primary/50'}`}
                                                                style={{ width: `${Math.min(100, (data.spent / data.allocated) * 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[9px] text-text-muted-themed text-center mt-4">No budgets set</p>
                                        )}
                                    </div>
                                    <div className="mt-4 pt-1 text-center">
                                        <span className="text-[7px] font-black text-brand-primary/40 uppercase tracking-tighter">Click to Flip</span>
                                    </div>
                                </div>

                                {/* Back: Mini Statement */}
                                <div className="col-start-1 row-start-1 backface-hidden p-3 bg-bg-primary-themed rounded-2xl border border-border-primary flex flex-col rotate-y-180 h-full overflow-hidden">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest">Mini Statement</span>
                                        <HistoryIcon className="w-3 h-3 text-brand-primary" />
                                    </div>
                                    <div className="flex-grow">
                                        {[...summaryData.filteredTransactions]
                                            .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || '').localeCompare(a.createdAt || ''))
                                            .slice(0, 7)
                                            .map((tx, idx) => {
                                                const isIncome = tx.type === TransactionType.INCOME;
                                                return (
                                                    <div key={tx.id || idx} className="flex justify-between items-center py-1 border-b border-border-primary/30 last:border-0">
                                                        <div className="min-w-0 flex-1 mr-2">
                                                            <p className="text-[9px] font-bold text-text-base-themed truncate">{tx.description}</p>
                                                            <p className="text-[7px] text-text-muted-themed uppercase font-black tracking-tighter">{formatDateDisplay(tx.date)}</p>
                                                        </div>
                                                        <span className={`text-[9px] font-black ${isIncome ? 'text-income' : 'text-expense'}`}>
                                                            {isIncome ? '+' : '-'}{formatCurrency(tx.amount, 0)}
                                                        </span>
                                                    </div>
                                                );
                                            })
                                        }
                                        {summaryData.filteredTransactions.length === 0 && (
                                            <p className="text-[9px] text-text-muted-themed text-center mt-8">No recent transactions</p>
                                        )}
                                    </div>
                                    <div className="mt-4 pt-1 text-center">
                                        <span className="text-[7px] font-black text-brand-primary/40 uppercase tracking-tighter">Click to Flip</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                        
                        {/* Unbudgeted Card */}
                        <div 
                            className="relative min-h-[180px] h-full w-full perspective-1000 cursor-pointer group"
                            onClick={() => setIsUnbudgetedFlipped(!isUnbudgetedFlipped)}
                        >
                            <motion.div 
                                className="w-full h-full relative preserve-3d transition-all duration-500 grid"
                                animate={{ rotateY: isUnbudgetedFlipped ? 180 : 0 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                            >
                                {/* Front */}
                                <div className="col-start-1 row-start-1 backface-hidden p-3 bg-bg-primary-themed rounded-2xl border border-border-primary flex flex-col h-full overflow-hidden">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[8px] font-black text-text-muted-themed uppercase tracking-widest">Unbudgeted</span>
                                        <span className="text-[9px] font-bold text-text-muted-themed">{((summaryData.unbudgetedExpenses / summaryData.expenses) * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="text-sm font-black text-text-base-themed">{formatCurrency(summaryData.unbudgetedExpenses)}</div>
                                    <div className="w-full h-1 bg-bg-accent-themed rounded-full mt-2 overflow-hidden">
                                        <div 
                                            className="h-full bg-slate-400" 
                                            style={{ width: `${(summaryData.unbudgetedExpenses / summaryData.expenses) * 100}%` }}
                                        />
                                    </div>

                                    <div className="mt-3 flex-grow">
                                        {Object.keys(summaryData.unbudgetedCategoryBreakdown).length > 0 ? (
                                            <div className="space-y-1.5">
                                                {Object.entries(summaryData.unbudgetedCategoryBreakdown).map(([cat, amt]) => (
                                                    <div key={cat} className="flex justify-between items-center text-[9px]">
                                                        <span className="text-text-muted-themed font-bold truncate pr-2">{cat}</span>
                                                        <span className="text-text-base-themed font-black whitespace-nowrap">{formatCurrency(amt as number, 0)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[9px] text-text-muted-themed text-center mt-4">No unbudgeted spending</p>
                                        )}
                                    </div>
                                    <div className="mt-4 pt-1 text-center">
                                        <span className="text-[7px] font-black text-slate-400/60 uppercase tracking-tighter">Click to Flip</span>
                                    </div>
                                </div>

                                {/* Back: Bar Chart */}
                                <div className="col-start-1 row-start-1 backface-hidden p-3 bg-bg-primary-themed rounded-2xl border border-border-primary flex flex-col rotate-y-180 h-full overflow-hidden">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Unbudgeted Breakdown</span>
                                        <ChartIcon className="w-3 h-3 text-slate-500" />
                                    </div>
                                    <div className="flex-grow flex items-end gap-1.5 px-1 pb-1 min-h-[120px]">
                                        {Object.entries(summaryData.unbudgetedCategoryBreakdown).length > 0 ? (
                                            Object.entries(summaryData.unbudgetedCategoryBreakdown).map(([cat, amt], idx) => {
                                                const max = Math.max(...Object.values(summaryData.unbudgetedCategoryBreakdown) as number[]);
                                                const height = (amt as number / max) * 100;
                                                const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];
                                                const barColor = colors[idx % colors.length];
                                                
                                                return (
                                                    <div key={cat} className="flex-1 min-w-[12px] flex flex-col items-center gap-1 group/bar h-full justify-end">
                                                        <div className="relative w-full flex flex-col items-center justify-end flex-grow">
                                                            <div 
                                                                className="w-full rounded-t-md transition-all duration-500 group-hover/bar:brightness-110 shadow-sm"
                                                                style={{ 
                                                                    height: `${Math.max(height, 5)}%`, 
                                                                    backgroundColor: barColor,
                                                                    opacity: 0.8
                                                                }}
                                                            />
                                                            <span className="absolute -top-4 text-[7px] font-black text-text-base-themed opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap bg-bg-secondary-themed px-1 rounded shadow-sm border border-border-primary z-10">
                                                                {formatCurrency(amt as number, 0)}
                                                            </span>
                                                        </div>
                                                        <span className="text-[7px] font-bold text-text-muted-themed truncate w-full text-center mt-1" title={cat}>{cat}</span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-[9px] text-text-muted-themed text-center w-full mb-8">No data</p>
                                        )}
                                    </div>
                                    <div className="mt-4 pt-1 text-center">
                                        <span className="text-[7px] font-black text-slate-400/60 uppercase tracking-tighter">Click to Flip</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="flex justify-center mt-4 -mb-6">
                <button 
                    type="button"
                    onClick={() => setShowPassbookInline(!showPassbookInline)}
                    className="w-10 h-10 bg-bg-secondary-themed border border-border-primary rounded-full flex items-center justify-center shadow-md hover:bg-bg-accent-themed transition-all z-10 group"
                    title={showPassbookInline ? "Hide Passbook View" : "Open Passbook View"}
                >
                    <ChevronDownIcon className={`w-5 h-5 text-text-muted-themed group-hover:text-brand-primary transition-transform duration-300 ${showPassbookInline ? 'rotate-180' : ''}`} />
                </button>
            </div>
        </div>

        <AnimatePresence>
            {showPassbookInline && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="pt-8">
                        <PassbookView 
                            transactions={summaryData.filteredTransactions}
                            activeAccount={accounts.find(a => a.id === activeAccountId)}
                            appTitle={appTitle}
                            openingBalance={summaryData.openingBalance}
                            periodLabel={globalPeriodLabel || (formatDateDisplay(summaryData.startDate) + ' - ' + formatDateDisplay(summaryData.endDate))}
                            onPrevMonth={onPrevMonth}
                            onNextMonth={onNextMonth}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {showChart && (
            <div className="animate-fade-in">
                <CategoryBarChartComponent 
                    transactions={filteredTransactions} 
                    onBack={() => setShowChart(false)} 
                    initialView="categories"
                />
            </div>
        )}

        {showTrends && (
            <div className="animate-fade-in">
                <TrendsChartComponent 
                    transactions={filteredTransactions} 
                    onBack={() => setShowTrends(false)} 
                />
            </div>
        )}

        {showBudget && (
            <div className="animate-fade-in bg-bg-secondary-themed rounded-3xl shadow-xl border border-border-primary overflow-hidden">
                <BudgetManager 
                    budgetSettings={budgetSettings} 
                    onSetBudget={onSetBudget} 
                    onDeleteBudget={onDeleteBudget} 
                    accounts={accounts} 
                    activeAccountId={activeAccountId} 
                    expenseCategories={expenseCategories} 
                    transactions={allTransactions} 
                    financialMonthStartDay={financialMonthStartDay} 
                    financialMonthEndDay={financialMonthEndDay} 
                    addExpenseCategory={addExpenseCategory} 
                    addToast={addToast} 
                    onBack={() => setShowBudget(false)} 
                />
            </div>
        )}
    </div>
  );
};

export default TransactionForm;
