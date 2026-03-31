
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import TransactionItem from './TransactionItem';
import { HistoryIcon, ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon, TagIcon, MagnifyingGlassIcon, XCircleIcon, ChevronDownIcon, TargetIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';

interface TransactionListProps {
  transactions: Transaction[]; // Should be pre-filtered for the active account
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  newlyAddedTxId?: string | null;
  exitingTransactionIds?: Set<string>;
  hideFilters?: boolean;
}

const ITEMS_PER_PAGE = 20; // Increased for better grouping view

const getRelativeDateDisplay = (dateString: string): string => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const [year, month, day] = dateString.split('-').map(Number);
    const transactionDate = new Date(year, month - 1, day);

    if (today.toDateString() === transactionDate.toDateString()) {
        return 'Today';
    }
    if (yesterday.toDateString() === transactionDate.toDateString()) {
        return 'Yesterday';
    }
    return transactionDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const TransactionList: React.FC<TransactionListProps> = ({ 
    transactions, 
    onDeleteTransaction, 
    onEditTransaction, 
    onUpdateTransaction,
    newlyAddedTxId, 
    exitingTransactionIds, 
    hideFilters = false,
}) => {
  const { currentThemeColors } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // FIX: Use Array.isArray for robust handling of potentially corrupted localStorage data.
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const isFilterActive = searchQuery !== '' || yearFilter !== 'all' || monthFilter !== 'all' || categoryFilter !== 'all';

  const handleClearFilters = () => {
    setSearchQuery('');
    setYearFilter('all');
    setMonthFilter('all');
    setCategoryFilter('all');
  };

  const { availableYears, availableCategories } = useMemo(() => {
    const yearSet = new Set<string>();
    const categorySet = new Set<string>();

    safeTransactions.forEach(tx => {
      yearSet.add(tx.date.substring(0, 4));
      if (tx.category) {
        categorySet.add(tx.category);
      }
    });

    const sortedYears = Array.from(yearSet).sort((a, b) => b.localeCompare(a));
    const sortedCategories = Array.from(categorySet).sort((a, b) => a.localeCompare(b));

    return { availableYears: sortedYears, availableCategories: sortedCategories };
  }, [safeTransactions]);

  const monthOptions = useMemo(() => [
    { value: '1', label: 'January' }, { value: '2', label: 'February' },
    { value: '3', label: 'March' }, { value: '4', label: 'April' },
    { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' },
    { value: '9', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' },
  ], []);

  const formatCurrency = (amount: number, withSign: boolean = false) => {
    const options: Intl.NumberFormatOptions = {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    };
    const formatted = new Intl.NumberFormat('en-IN', options).format(Math.abs(amount));
    
    if (withSign) {
        const sign = amount >= 0 ? '+' : '-';
        return `${sign} ₹${formatted}`;
    }
    return `₹${formatted}`;
  };

  const filteredAndSortedTransactions = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    
    const filtered = safeTransactions.filter(tx => {
        const categoryMatch = categoryFilter === 'all' || tx.category === categoryFilter;
        const searchMatch = searchQuery === '' ||
            tx.description.toLowerCase().includes(lowercasedQuery) ||
            (tx.category && tx.category.toLowerCase().includes(lowercasedQuery));
        
        const yearMatch = yearFilter === 'all' || tx.date.substring(0, 4) === yearFilter;
        const monthMatch = monthFilter === 'all' || tx.date.substring(5, 7) === String(monthFilter).padStart(2, '0');
        
        return categoryMatch && searchMatch && yearMatch && monthMatch;
    });

    return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [safeTransactions, searchQuery, yearFilter, monthFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE);

  const currentPagedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSortedTransactions.slice(startIndex, endIndex);
  }, [filteredAndSortedTransactions, currentPage]);

  const groupedTransactions = useMemo(() => {
    const groups = new Map<string, {
        transactions: Transaction[];
        totalIncome: number;
        totalExpense: number;
    }>();

    currentPagedTransactions.forEach(tx => {
        const date = tx.date;
        if (!groups.has(date)) {
            groups.set(date, {
                transactions: [],
                totalIncome: 0,
                totalExpense: 0,
            });
        }
        const group = groups.get(date)!;
        group.transactions.push(tx);
        if (tx.type === TransactionType.INCOME) {
            group.totalIncome += tx.amount;
        } else if (tx.type === TransactionType.EXPENSE) {
            group.totalExpense += tx.amount;
        }
    });
    return groups;
  }, [currentPagedTransactions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [safeTransactions.length, searchQuery, yearFilter, monthFilter, categoryFilter]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  if (safeTransactions.length === 0) {
    return (
      <div className="bg-bg-secondary-themed p-6 rounded-xl shadow-lg text-center h-full flex flex-col justify-center items-center">
        <img src="https://picsum.photos/seed/emptybox/300/200?grayscale" alt="Empty box illustration" className="mx-auto mb-4 rounded-lg w-32 h-24 sm:w-40 sm:h-32 md:w-48 md:h-32 object-cover opacity-70 dark:opacity-50" />
        <p className="text-text-base-themed text-lg">No transactions for this account yet.</p>
        <p className="text-sm text-text-muted-themed">Add one using the form or check another account!</p>
      </div>
    );
  }

  return (
    <div className={`${hideFilters ? 'flex flex-col h-full' : 'bg-bg-secondary-themed p-4 sm:p-5 rounded-xl shadow-lg flex flex-col h-[80vh]'}`}>
      {!hideFilters && (
        <>
          <h2 className="text-base sm:text-lg font-semibold flex items-center mb-3" style={{ color: currentThemeColors.brandPrimary }}>
            <HistoryIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Transaction History
          </h2>
          
          <div className="mb-3 p-3 rounded-lg border" style={{ 
            backgroundColor: `${currentThemeColors.brandPrimary}10`, 
            borderColor: `${currentThemeColors.brandPrimary}20` 
          }}>
            <div className="flex flex-wrap items-end gap-2">
                {/* Year Filter */}
                <div className="w-full sm:w-24">
                    <label htmlFor="year-filter" className="flex items-center text-[9px] font-black uppercase mb-1" style={{ color: currentThemeColors.textMuted }}>
                        <CalendarDaysIcon className="w-3 h-3 mr-1" />
                        Year
                    </label>
                    <div className="relative">
                        <select 
                            id="year-filter"
                            value={yearFilter} 
                            onChange={e => setYearFilter(e.target.value)} 
                            className="w-full pl-2 pr-6 py-1 text-[11px] rounded-md shadow-sm focus:outline-none focus:ring-1 appearance-none transition-colors"
                            style={{ 
                                backgroundColor: currentThemeColors.bgPrimary, 
                                color: currentThemeColors.textBase,
                                borderColor: currentThemeColors.borderSecondary,
                                borderWidth: '1px'
                            }}
                        >
                            <option value="all">All</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <ChevronDownIcon className="w-3 h-3" style={{ color: currentThemeColors.textMuted }} />
                        </div>
                    </div>
                </div>

                {/* Month Filter */}
                <div className="w-full sm:w-28">
                    <label htmlFor="month-filter" className="flex items-center text-[9px] font-black uppercase mb-1" style={{ color: currentThemeColors.textMuted }}>
                        <CalendarDaysIcon className="w-3 h-3 mr-1" />
                        Month
                    </label>
                    <div className="relative">
                        <select 
                            id="month-filter"
                            value={monthFilter} 
                            onChange={e => setMonthFilter(e.target.value)} 
                            className="w-full pl-2 pr-6 py-1 text-[11px] rounded-md shadow-sm focus:outline-none focus:ring-1 appearance-none transition-colors"
                            style={{ 
                                backgroundColor: currentThemeColors.bgPrimary, 
                                color: currentThemeColors.textBase,
                                borderColor: currentThemeColors.borderSecondary,
                                borderWidth: '1px'
                            }}
                        >
                            <option value="all">All</option>
                            {monthOptions.map(month => (
                                <option key={month.value} value={month.value}>{month.label}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <ChevronDownIcon className="w-3 h-3" style={{ color: currentThemeColors.textMuted }} />
                        </div>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="w-full sm:w-36">
                    <label htmlFor="category-filter" className="flex items-center text-[9px] font-black uppercase mb-1" style={{ color: currentThemeColors.textMuted }}>
                        <TagIcon className="w-3 h-3 mr-1" />
                        Category
                    </label>
                    <div className="relative">
                        <select 
                            id="category-filter"
                            value={categoryFilter} 
                            onChange={e => setCategoryFilter(e.target.value)} 
                            className="w-full pl-2 pr-6 py-1 text-[11px] rounded-md shadow-sm focus:outline-none focus:ring-1 appearance-none transition-colors"
                            style={{ 
                                backgroundColor: currentThemeColors.bgPrimary, 
                                color: currentThemeColors.textBase,
                                borderColor: currentThemeColors.borderSecondary,
                                borderWidth: '1px'
                            }}
                        >
                            <option value="all">All Categories</option>
                            {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <ChevronDownIcon className="w-3 h-3" style={{ color: currentThemeColors.textMuted }} />
                        </div>
                    </div>
                </div>

                {/* Search Filter */}
                <div className="flex-grow min-w-[150px]">
                    <label htmlFor="search-filter" className="flex items-center text-[9px] font-black uppercase mb-1" style={{ color: currentThemeColors.textMuted }}>
                        <MagnifyingGlassIcon className="w-3 h-3 mr-1" />
                        Search
                    </label>
                    <div className="relative">
                        <input
                            id="search-filter"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="By description or category..."
                            className="w-full pl-3 pr-4 py-1 text-[11px] rounded-md shadow-sm focus:outline-none focus:ring-1 transition-colors placeholder-opacity-50"
                            style={{ 
                                backgroundColor: currentThemeColors.bgPrimary, 
                                color: currentThemeColors.textBase,
                                borderColor: currentThemeColors.borderSecondary,
                                borderWidth: '1px'
                            }}
                        />
                    </div>
                </div>

                {isFilterActive && (
                    <button 
                        onClick={handleClearFilters}
                        className="p-1.5 text-[10px] font-black uppercase rounded-md transition-colors flex items-center justify-center h-[26px]"
                        style={{ 
                            backgroundColor: `${currentThemeColors.expense}20`,
                            color: currentThemeColors.expense 
                        }}
                        aria-label="Clear all filters"
                        title="Clear Filters"
                    >
                        <XCircleIcon className="w-3.5 h-3.5"/>
                    </button>
                )}
            </div>
          </div>
        </>
      )}
      
      {filteredAndSortedTransactions.length === 0 ? (
        <div className="text-center py-10 flex-grow flex flex-col justify-center items-center">
            <p className="text-text-base-themed text-lg">No transactions match your filters.</p>
            <p className="text-sm text-text-muted-themed">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <>
            <div className="flex-grow space-y-4 overflow-y-auto pr-2">
              {Array.from(groupedTransactions.entries()).map(([date, groupData]) => {
                const netFlow = groupData.totalIncome - groupData.totalExpense;
                return (
                <div key={date} className="relative">
                  <div className="sticky top-0 z-10 py-2" style={{ backgroundColor: currentThemeColors.bgSecondary }}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-1" style={{borderColor: currentThemeColors.borderSecondary}}>
                          <h3 className="text-sm font-semibold text-text-muted-themed pl-1 tracking-wide mb-1 sm:mb-0">
                              {getRelativeDateDisplay(date)}
                          </h3>
                          <div className="flex items-center space-x-2 sm:space-x-3 text-xs pr-1">
                              <span style={{ color: currentThemeColors.income }}>
                                  In: <strong>{formatCurrency(groupData.totalIncome)}</strong>
                              </span>
                              <span style={{ color: currentThemeColors.expense }}>
                                  Out: <strong>{formatCurrency(groupData.totalExpense)}</strong>
                              </span>
                              <span style={{ color: netFlow >= 0 ? currentThemeColors.income : currentThemeColors.expense }}>
                                  Net: <strong>{formatCurrency(netFlow, true)}</strong>
                              </span>
                          </div>
                      </div>
                  </div>
                  <ul className="space-y-3 mt-1">
                      {groupData.transactions.map(transaction => {
                          const originalIndex = filteredAndSortedTransactions.findIndex(t => t.id === transaction.id);
                          return (
                              <TransactionItem
                                  key={transaction.id}
                                  transaction={transaction}
                                  onDelete={onDeleteTransaction}
                                  onEdit={onEditTransaction}
                                  onUpdate={onUpdateTransaction}
                                  itemIndex={originalIndex}
                                  isNew={transaction.id === newlyAddedTxId}
                                  isExiting={exitingTransactionIds?.has(transaction.id)}
                              />
                          );
                      })}
                  </ul>
                </div>
                );
              })}
            </div>
            {totalPages > 1 && (
                <div className="mt-6 flex justify-between items-center text-sm">
                <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg shadow-sm flex items-center transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1 dark:focus:ring-offset-bg-secondary-themed"
                    style={{
                        backgroundColor: currentThemeColors.bgAccent, 
                        color: currentThemeColors.textBase,
                        border: `1px solid ${currentThemeColors.borderSecondary}`
                    }}
                >
                    <ChevronLeftIcon className="w-4 h-4 mr-1" /> Previous
                </button>
                <span className="text-text-muted-themed">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg shadow-sm flex items-center transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1 dark:focus:ring-offset-bg-secondary-themed"
                    style={{
                        backgroundColor: currentThemeColors.bgAccent, 
                        color: currentThemeColors.textBase,
                        border: `1px solid ${currentThemeColors.borderSecondary}`
                    }}
                >
                    Next <ChevronRightIcon className="w-4 h-4 ml-1" />
                </button>
            </div>
            )}
        </>
      )}
    </div>
  );
};

export default TransactionList;
