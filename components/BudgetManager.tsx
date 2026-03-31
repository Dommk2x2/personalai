import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BudgetSetting, BudgetPeriod, Transaction, TransactionType, Account, ToastType } from '../types';
import { 
    PlusIcon, SaveIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon, TargetIcon, XIcon
} from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationModal from './ConfirmationModal';
import { 
    getPeriodDateRange, 
    getDisplayPeriodName,
    getPreviousPeriodIdentifier,
    getNextPeriodIdentifier,
    getCurrentPeriodIdentifier,
    FinancialMonthConfig,
    formatDateToYYYYMMDD
} from '../utils/dateUtils';

interface BudgetManagerProps {
  activeAccountId: string | null; 
  accounts: Account[]; 
  expenseCategories: string[];
  budgetSettings: BudgetSetting[];
  onSetBudget: (budget: BudgetSetting) => void;
  onDeleteBudget: (category: string, period: BudgetPeriod, periodIdentifier: string, accountId: string) => void; 
  transactions: Transaction[];
  financialMonthStartDay: number;
  financialMonthEndDay: number;
  addExpenseCategory: (name: string) => void;
  addToast: (message: string, type: ToastType) => void;
  onBack: () => void;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  activeAccountId,
  accounts,
  expenseCategories,
  budgetSettings,
  onSetBudget,
  onDeleteBudget,
  transactions,
  financialMonthStartDay,
  financialMonthEndDay,
  addToast,
  onBack,
}) => {
  const { currentThemeColors } = useTheme();
  const [selectedPeriodType, setSelectedPeriodType] = useState<BudgetPeriod>(BudgetPeriod.MONTHLY);
  const [currentPeriodIdentifier, setCurrentPeriodIdentifier] = useState<string>(() => getCurrentPeriodIdentifier(BudgetPeriod.MONTHLY, new Date(), financialMonthStartDay));
  const [periodBudgetInputs, setPeriodBudgetInputs] = useState<Record<string, string>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState<{ category: string; period: BudgetPeriod; periodIdentifier: string; accountId: string } | null>(null);

  const finConfig: FinancialMonthConfig = useMemo(() => ({
    startDay: financialMonthStartDay,
    endDay: financialMonthEndDay
  }), [financialMonthStartDay, financialMonthEndDay]);

  const activeAccount = useMemo(() => (accounts ?? []).find(acc => acc.id === activeAccountId), [accounts, activeAccountId]);
  
  const budgetsForCurrentPeriod = useMemo(() => {
    if (!activeAccountId) return [];
    return (budgetSettings ?? []).filter(
        b => b.accountId === activeAccountId &&
             b.period === selectedPeriodType &&
             b.periodIdentifier === currentPeriodIdentifier
    );
  }, [budgetSettings, activeAccountId, selectedPeriodType, currentPeriodIdentifier]);

  const { budgetDisplayData, totalAllocated, totalSpent, totalRemaining, totalDailySuggestion, daysRemaining } = useMemo(() => {
    const { start, end } = getPeriodDateRange(selectedPeriodType, currentPeriodIdentifier, finConfig);
    const startDateStr = formatDateToYYYYMMDD(start);
    const endDateStr = formatDateToYYYYMMDD(end);

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const periodEnd = new Date(end);
    periodEnd.setHours(23, 59, 59, 999);

    let daysRemaining = 0;
    if (now <= periodEnd) {
      const effectiveStart = now > start ? now : start;
      const diffTime = periodEnd.getTime() - effectiveStart.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const transactionsInPeriod = (transactions ?? []).filter(tx =>
      tx.date >= startDateStr &&
      tx.date <= endDateStr &&
      tx.type === TransactionType.EXPENSE &&
      (!activeAccountId || tx.accountId === activeAccountId)
    );

    const spendingByCategory: Record<string, number> = {};
    transactionsInPeriod.forEach(tx => {
      if (tx.category) {
        spendingByCategory[tx.category] = (spendingByCategory[tx.category] || 0) + tx.amount;
      }
    });

    const displayData = budgetsForCurrentPeriod.map(budget => {
      const spent = spendingByCategory[budget.category] || 0;
      const remaining = budget.allocated - spent;
      const dailySuggestion = daysRemaining > 0 && remaining > 0 ? remaining / daysRemaining : 0;

      return {
        category: budget.category,
        allocated: budget.allocated,
        spent,
        remaining,
        dailySuggestion
      };
    }).sort((a,b) => a.category.localeCompare(b.category));
    
    const tAllocated = budgetsForCurrentPeriod.reduce((s, b) => s + b.allocated, 0);
    const tSpent = Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0);
    const tRemaining = tAllocated - tSpent;
    const totalDailySuggestion = daysRemaining > 0 && tRemaining > 0 ? tRemaining / daysRemaining : 0;

    return {
        budgetDisplayData: displayData,
        totalAllocated: tAllocated,
        totalSpent: tSpent,
        totalRemaining: tRemaining,
        totalDailySuggestion,
        daysRemaining
    };
  }, [budgetsForCurrentPeriod, transactions, selectedPeriodType, currentPeriodIdentifier, finConfig, activeAccountId]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  if (!activeAccountId) return <div className="p-10 text-center text-text-muted-themed italic">Select an account to manage budgets</div>;

  return (
    <div className="bg-bg-secondary-themed p-3 sm:p-6 rounded-xl shadow-xl border border-border-primary">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="p-2 text-text-muted-themed hover:bg-bg-accent-themed rounded-full transition-colors">
            <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
            <TargetIcon className="w-6 h-6 text-brand-primary" />
            <h2 className="text-xl font-bold text-text-base-themed">Budget Planner</h2>
        </div>
        <div className="w-9"></div> {/* Spacer for alignment */}
      </div>
      
      <div className="p-3 bg-bg-primary-themed rounded-xl mb-6">
          <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase text-text-muted-themed">Target Period</span>
              <select value={selectedPeriodType} onChange={e => setSelectedPeriodType(e.target.value as BudgetPeriod)} className="text-xs font-bold bg-transparent outline-none text-brand-primary">
                  {Object.values(BudgetPeriod).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
          </div>
          <div className="flex justify-between items-center gap-2">
            <button onClick={() => setCurrentPeriodIdentifier(getPreviousPeriodIdentifier(selectedPeriodType, currentPeriodIdentifier))} className="p-2 text-text-muted-themed"><ChevronLeftIcon className="w-5 h-5"/></button>
            <span className="text-xs font-black uppercase text-text-base-themed text-center flex-grow">{getDisplayPeriodName(selectedPeriodType, currentPeriodIdentifier, finConfig)}</span>
            <button onClick={() => setCurrentPeriodIdentifier(getNextPeriodIdentifier(selectedPeriodType, currentPeriodIdentifier))} className="p-2 text-text-muted-themed"><ChevronRightIcon className="w-5 h-5"/></button>
          </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-6">
          <div className="p-3 bg-brand-primary/10 rounded-xl border border-brand-primary/10">
              <p className="text-[9px] font-black text-text-muted-themed uppercase tracking-widest mb-1">Limit</p>
              <p className="text-lg font-black text-brand-primary leading-none">{formatCurrency(totalAllocated)}</p>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/10">
              <p className="text-[9px] font-black text-text-muted-themed uppercase tracking-widest mb-1">Spent</p>
              <p className="text-lg font-black text-rose-500 leading-none">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="p-3 bg-bg-accent-themed rounded-xl border border-border-primary">
              <p className="text-[9px] font-black text-text-muted-themed uppercase tracking-widest mb-1">Balance</p>
              <p className="text-lg font-black text-text-base-themed leading-none">{formatCurrency(totalRemaining)}</p>
          </div>
          <div className="p-3 bg-bg-accent-themed rounded-xl border border-border-primary">
              <p className="text-[9px] font-black text-text-muted-themed uppercase tracking-widest mb-1">Days Left</p>
              <p className="text-lg font-black text-text-base-themed leading-none">{daysRemaining}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/10">
              <p className="text-[9px] font-black text-text-muted-themed uppercase tracking-widest mb-1">Daily Sug.</p>
              <p className="text-lg font-black text-emerald-600 leading-none">{formatCurrency(totalDailySuggestion)}</p>
          </div>
      </div>

      {/* Total Progress Bar */}
      {totalAllocated > 0 && (
        <div className="mb-8 p-4 bg-bg-primary-themed rounded-2xl border border-border-primary">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <p className="text-[10px] font-black text-text-muted-themed uppercase tracking-widest">Total Budget Progress</p>
                    <p className="text-sm font-black text-text-base-themed">
                        {Math.round((totalSpent / totalAllocated) * 100)}% Consumed
                    </p>
                </div>
                <p className="text-[10px] font-black text-text-muted-themed uppercase">
                    {formatCurrency(totalSpent)} / {formatCurrency(totalAllocated)}
                </p>
            </div>
            <div className="w-full h-3 bg-bg-accent-themed rounded-full overflow-hidden shadow-inner">
                <div 
                    className={`h-full transition-all duration-1000 ease-out ${totalSpent > totalAllocated ? 'bg-rose-500' : 'bg-brand-primary'}`} 
                    style={{ width: `${Math.min(100, (totalSpent / totalAllocated) * 100)}%` }}
                >
                    {totalSpent > totalAllocated * 0.1 && (
                        <div className="w-full h-full opacity-20 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[progress-bar-stripes_1s_linear_infinite]"></div>
                    )}
                </div>
            </div>
            <div className="flex justify-between mt-2">
                <p className="text-[9px] font-bold text-text-muted-themed uppercase">
                    {totalSpent > totalAllocated ? 'Budget Exceeded' : `${formatCurrency(totalRemaining)} Remaining`}
                </p>
                <p className="text-[9px] font-bold text-text-muted-themed uppercase">
                    {daysRemaining} Days Left
                </p>
            </div>
        </div>
      )}

      <div className="space-y-3">
        {budgetDisplayData.map(item => (
            <div key={item.category} className="p-3 bg-bg-primary-themed border border-border-primary rounded-xl">
                <div className="flex justify-between items-baseline mb-2">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-text-base-themed">{item.category}</span>
                        <button 
                            onClick={() => setDeletingBudget({ category: item.category, period: selectedPeriodType, periodIdentifier: currentPeriodIdentifier, accountId: activeAccountId })}
                            className="p-1 text-text-muted-themed hover:text-rose-500 transition-colors"
                        >
                            <TrashIcon className="w-3 h-3" />
                        </button>
                    </div>
                    <span className="text-[10px] font-black text-text-muted-themed uppercase">{formatCurrency(item.spent)} / {formatCurrency(item.allocated)}</span>
                </div>
                <div className="w-full h-1.5 bg-bg-accent-themed rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${item.spent > item.allocated ? 'bg-rose-500' : 'bg-brand-primary'}`} 
                        style={{ width: `${Math.min(100, (item.spent / item.allocated) * 100)}%` }}
                    ></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                    {item.spent > item.allocated ? (
                        <p className="text-[9px] font-bold text-rose-500 uppercase">Over budget by {formatCurrency(item.spent - item.allocated)}</p>
                    ) : (
                        <p className="text-[9px] font-bold text-text-muted-themed uppercase">Remaining: {formatCurrency(item.remaining)}</p>
                    )}
                    {item.dailySuggestion > 0 && (
                        <div className="flex items-center gap-1.5 bg-brand-primary/5 px-2 py-0.5 rounded-full border border-brand-primary/10">
                            <span className="text-[8px] font-black text-text-muted-themed uppercase tracking-tighter">Daily Limit:</span>
                            <span className="text-[9px] font-black text-brand-primary">{formatCurrency(item.dailySuggestion)}</span>
                        </div>
                    )}
                </div>
            </div>
        ))}
        {budgetDisplayData.length === 0 && <p className="text-center py-10 text-text-muted-themed italic text-sm">No budgets defined for this period</p>}
      </div>

      {deletingBudget && (
        <ConfirmationModal
          isOpen={!!deletingBudget}
          onClose={() => setDeletingBudget(null)}
          onConfirm={() => {
            if (deletingBudget) {
              onDeleteBudget(deletingBudget.category, deletingBudget.period, deletingBudget.periodIdentifier, deletingBudget.accountId);
              setDeletingBudget(null);
              addToast(`Budget for ${deletingBudget.category} deleted`, "success");
            }
          }}
          title="Delete Budget"
          message={`Are you sure you want to delete the budget for "${deletingBudget.category}" in this period?`}
          confirmText="Delete"
          type="danger"
        />
      )}

      <button onClick={() => setIsAddModalOpen(true)} className="w-full mt-6 py-3 bg-bg-accent-themed text-text-base-themed font-black uppercase text-xs tracking-widest rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg">
          <PlusIcon className="w-4 h-4"/> Set Category Budget
      </button>

      {/* Add/Edit Budget Modal */}
      {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-bg-secondary-themed w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border-primary animate-slide-up">
                  <div className="p-6 border-b border-border-primary flex justify-between items-center">
                      <h3 className="text-lg font-black text-text-base-themed uppercase tracking-tight">Set Budget</h3>
                      <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-text-muted-themed hover:bg-bg-accent-themed rounded-full transition-colors">
                          <XIcon className="w-5 h-5" />
                      </button>
                  </div>
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const category = formData.get('category') as string;
                      const amount = parseFloat(formData.get('amount') as string);
                      
                      if (!category || isNaN(amount) || amount <= 0) {
                          addToast("Please enter a valid category and amount", "error");
                          return;
                      }

                      onSetBudget({
                          accountId: activeAccountId,
                          category,
                          allocated: amount,
                          period: selectedPeriodType,
                          periodIdentifier: currentPeriodIdentifier
                      });
                      
                      addToast(`Budget set for ${category}`, "success");
                      setIsAddModalOpen(false);
                  }} className="p-6 space-y-4">
                      <div>
                          <label className="text-[10px] font-black uppercase text-text-muted-themed tracking-widest mb-1.5 block">Category</label>
                          <select name="category" required className="w-full p-3 bg-bg-primary-themed border border-border-primary rounded-xl text-sm font-bold text-text-base-themed outline-none focus:ring-2 focus:ring-brand-primary/20">
                              <option value="">Select Category</option>
                              {[...(expenseCategories ?? [])].sort((a, b) => a.localeCompare(b)).map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                              ))}
                          </select>
                      </div>
                      <div>
                          <label className="text-[10px] font-black uppercase text-text-muted-themed tracking-widest mb-1.5 block">Budget Amount (INR)</label>
                          <input 
                            name="amount" 
                            type="number" 
                            step="0.01" 
                            required 
                            placeholder="0.00"
                            className="w-full p-3 bg-bg-primary-themed border border-border-primary rounded-xl text-sm font-bold text-text-base-themed outline-none focus:ring-2 focus:ring-brand-primary/20"
                          />
                      </div>
                      <div className="pt-4">
                          <button type="submit" className="w-full py-3 bg-brand-primary text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-brand-primary/30 hover:opacity-90 transition-all">
                              Save Budget
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default BudgetManager;