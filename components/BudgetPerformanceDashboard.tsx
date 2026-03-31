import React, { useState, useMemo } from 'react';
import { BudgetSetting, BudgetPeriod, Transaction, TransactionType } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { TargetIcon, ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from './Icons';
import { getPeriodDateRange, getCurrentPeriodIdentifier, getPreviousPeriodIdentifier, getNextPeriodIdentifier, getDisplayPeriodName, formatDateToYYYYMMDD, formatDateDisplay } from '../utils/dateUtils';

interface BudgetPerformanceDashboardProps {
  budgetSettings: BudgetSetting[];
  transactions: Transaction[]; // Unfiltered transactions for the account
  expenseCategories: string[];
  financialMonthStartDay: number;
  financialMonthEndDay: number;
}

const BudgetPerformanceDashboard: React.FC<BudgetPerformanceDashboardProps> = ({
  budgetSettings,
  transactions,
  expenseCategories,
  financialMonthStartDay,
  financialMonthEndDay,
}) => {
  const { currentThemeColors } = useTheme();
  const [periodIdentifier, setPeriodIdentifier] = useState<string>(() => 
    getCurrentPeriodIdentifier(BudgetPeriod.MONTHLY, new Date(), financialMonthStartDay)
  );
  
  const finConfig = { startDay: financialMonthStartDay, endDay: financialMonthEndDay };

  const navigatePeriod = (direction: 'prev' | 'next' | 'current') => {
    if (direction === 'current') {
        setPeriodIdentifier(getCurrentPeriodIdentifier(BudgetPeriod.MONTHLY, new Date(), financialMonthStartDay));
    } else {
        const newIdentifier = direction === 'prev' 
            ? getPreviousPeriodIdentifier(BudgetPeriod.MONTHLY, periodIdentifier)
            : getNextPeriodIdentifier(BudgetPeriod.MONTHLY, periodIdentifier);
        setPeriodIdentifier(newIdentifier);
    }
  };

  const budgetPerformanceData = useMemo(() => {
    const periodRange = getPeriodDateRange(BudgetPeriod.MONTHLY, periodIdentifier, finConfig);
    const startDateStr = formatDateToYYYYMMDD(periodRange.start);
    const endDateStr = formatDateToYYYYMMDD(periodRange.end);

    const budgetsForPeriod = (budgetSettings ?? []).filter(b => 
      b.period === BudgetPeriod.MONTHLY && b.periodIdentifier === periodIdentifier
    );

    const totalAllocated = budgetsForPeriod.reduce((sum, b) => sum + b.allocated, 0);

    const transactionsInPeriod = (transactions ?? []).filter(tx => 
      tx.date >= startDateStr && tx.date <= endDateStr && tx.type === TransactionType.EXPENSE && tx.category
    );

    const spendingByCategory: Record<string, number> = {};
    transactionsInPeriod.forEach(tx => {
      spendingByCategory[tx.category!] = (spendingByCategory[tx.category!] || 0) + tx.amount;
    });

    const totalSpent = transactionsInPeriod.reduce((sum, tx) => sum + tx.amount, 0);

    const budgetItems = budgetsForPeriod.map(budget => {
      const spent = spendingByCategory[budget.category] || 0;
      return {
        category: budget.category,
        allocated: budget.allocated,
        spent: spent,
        remaining: budget.allocated - spent,
      };
    }).sort((a,b) => b.allocated - a.allocated);

    const totalSpentInBudgetedCategories = budgetItems.reduce((sum, item) => sum + item.spent, 0);
    const totalRemaining = totalAllocated - totalSpentInBudgetedCategories;
    const utilization = totalAllocated > 0 ? (totalSpentInBudgetedCategories / totalAllocated) * 100 : 0;
    
    const unbudgetedSpending = Object.entries(spendingByCategory)
      .filter(([category]) => !budgetsForPeriod.some(b => b.category === category))
      .sort((a,b) => b[1] - a[1]);

    return {
      totalAllocated,
      totalSpent,
      totalRemaining,
      utilization,
      budgetItems,
      unbudgetedSpending,
    };
  }, [budgetSettings, transactions, periodIdentifier, finConfig]);
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const MetricCard: React.FC<{ title: string; value: string; color?: string }> = ({ title, value, color }) => (
    <div className="bg-bg-primary-themed p-4 rounded-lg shadow-md text-center">
      <p className="text-sm text-text-muted-themed">{title}</p>
      <p className="text-2xl font-bold" style={{ color: color || currentThemeColors.textBase }}>{value}</p>
    </div>
  );
  
  if (budgetSettings.length === 0 && budgetPerformanceData.unbudgetedSpending.length === 0 && budgetPerformanceData.totalSpent === 0) {
      return (
        <div className="text-center py-8 text-text-muted-themed">
          <TargetIcon className="w-16 h-16 mx-auto mb-4 text-text-disabled" />
          <p>No budget settings or spending found for this period.</p>
          <p className="text-sm">Set budgets in 'Manage Budgets' to see performance here.</p>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="p-3 sm:p-4 bg-bg-accent-themed/50 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="font-semibold text-text-base-themed">Budget Period:</h3>
        <div className="flex items-center space-x-2">
            <button onClick={() => navigatePeriod('prev')} className="p-2 rounded-lg hover:bg-bg-accent-themed text-text-muted-themed"><ChevronLeftIcon /></button>
            <span className="font-semibold text-brand-primary text-center w-48">{getDisplayPeriodName(BudgetPeriod.MONTHLY, periodIdentifier, finConfig)}</span>
            <button onClick={() => navigatePeriod('next')} className="p-2 rounded-lg hover:bg-bg-accent-themed text-text-muted-themed"><ChevronRightIcon /></button>
            <button onClick={() => navigatePeriod('current')} className="p-2 rounded-lg hover:bg-bg-accent-themed text-text-muted-themed" title="Go to Current Period"><CalendarDaysIcon /></button>
        </div>
        <div className="text-[10px] font-bold text-text-muted-themed uppercase tracking-widest">
            {formatDateDisplay(formatDateToYYYYMMDD(getPeriodDateRange(BudgetPeriod.MONTHLY, periodIdentifier, finConfig).start))} - {formatDateDisplay(formatDateToYYYYMMDD(getPeriodDateRange(BudgetPeriod.MONTHLY, periodIdentifier, finConfig).end))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Budgeted" value={formatCurrency(budgetPerformanceData.totalAllocated)} color={currentThemeColors.brandPrimary} />
        <MetricCard title="Total Spent" value={formatCurrency(budgetPerformanceData.totalSpent)} color={budgetPerformanceData.totalSpent > budgetPerformanceData.totalAllocated ? currentThemeColors.expense : undefined} />
        <MetricCard title="Remaining" value={formatCurrency(budgetPerformanceData.totalRemaining)} color={budgetPerformanceData.totalRemaining < 0 ? currentThemeColors.expense : currentThemeColors.income} />
        <MetricCard title="Utilization" value={`${budgetPerformanceData.utilization.toFixed(1)}%`} color={currentThemeColors.brandSecondary} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budgeted Categories */}
        <div className="bg-bg-primary-themed p-4 rounded-lg shadow-md">
            <h4 className="font-semibold text-lg mb-3 text-text-base-themed">Budgeted Categories</h4>
            <div className="space-y-4 max-h-[25rem] overflow-y-auto pr-2">
                {budgetPerformanceData.budgetItems.map(({ category, allocated, spent, remaining }) => {
                    const progress = allocated > 0 ? (spent / allocated) * 100 : 0;
                    const isOverBudget = progress > 100;
                    const progressWidth = Math.min(progress, 100);
                    return (
                        <div key={category}>
                            <div className="flex justify-between items-center text-sm mb-1">
                                <span className="font-medium text-text-base-themed">{category}</span>
                                <span className={isOverBudget ? 'text-expense font-semibold' : 'text-text-muted-themed'}>
                                    {formatCurrency(spent)} / {formatCurrency(allocated)}
                                </span>
                            </div>
                            <div className="w-full bg-bg-secondary-themed rounded-full h-2.5">
                                <div className="h-2.5 rounded-full transition-all" style={{ width: `${progressWidth}%`, backgroundColor: isOverBudget ? currentThemeColors.expense : currentThemeColors.brandSecondary }}></div>
                            </div>
                            <p className={`text-xs text-right mt-1 ${remaining < 0 ? 'text-expense' : 'text-income'}`}>
                                Remaining: {formatCurrency(remaining)}
                            </p>
                        </div>
                    );
                })}
                {budgetPerformanceData.budgetItems.length === 0 && <p className="text-sm text-text-muted-themed text-center pt-4">No budgets set for this period.</p>}
            </div>
        </div>

        {/* Unbudgeted Spending */}
        <div className="bg-bg-primary-themed p-4 rounded-lg shadow-md">
            <h4 className="font-semibold text-lg mb-3 text-text-base-themed">Unbudgeted Spending</h4>
             <div className="space-y-2 max-h-[25rem] overflow-y-auto pr-2">
                {budgetPerformanceData.unbudgetedSpending.map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center text-sm p-2 bg-bg-secondary-themed rounded">
                        <span className="font-medium text-text-base-themed">{category}</span>
                        <span className="font-semibold" style={{color: currentThemeColors.expense}}>{formatCurrency(amount)}</span>
                    </div>
                ))}
                {budgetPerformanceData.unbudgetedSpending.length === 0 && <p className="text-sm text-text-muted-themed text-center pt-4">No spending in unbudgeted categories for this period.</p>}
             </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPerformanceDashboard;
