import React from 'react';
import BudgetPerformanceDashboard from './BudgetPerformanceDashboard';
import BarChartComponent from './BarChartComponent';
import LineChartComponent from './LineChartComponent';
import PieChartComponent from './PieChartComponent';
import IncomePieChartComponent from './IncomePieChartComponent';
import CategoryBarChartComponent from './CategoryBarChartComponent';
import RepeatedTransactionsReport from './RepeatedTransactionsReport';
import { Transaction, BudgetSetting, IncomeCategory } from '../types';

interface AnalyticsSidebarProps {
  transactions: Transaction[];
  budgetSettings: BudgetSetting[];
  expenseCategories: string[];
  incomeCategories: string[];
  financialMonthStartDay: number;
  financialMonthEndDay: number;
  activeAccountId: string | null;
  accountName?: string;
}

const AnalyticsSidebar: React.FC<AnalyticsSidebarProps> = ({
  transactions,
  budgetSettings,
  expenseCategories,
  incomeCategories,
  financialMonthStartDay,
  financialMonthEndDay,
  activeAccountId,
  accountName
}) => {
  const currentPeriodTransactions = transactions.filter(t => !t.isDeleted && (!activeAccountId || t.accountId === activeAccountId));

  return (
    <div className="space-y-6 p-4 bg-slate-900/50 rounded-2xl border border-white/5">
      <BudgetPerformanceDashboard 
        budgetSettings={budgetSettings} 
        transactions={currentPeriodTransactions} 
        expenseCategories={expenseCategories} 
        financialMonthStartDay={financialMonthStartDay} 
        financialMonthEndDay={financialMonthEndDay} 
      />
      <div className="grid grid-cols-1 gap-6">
        <BarChartComponent transactions={currentPeriodTransactions} />
        <LineChartComponent transactions={currentPeriodTransactions} />
        <PieChartComponent transactions={currentPeriodTransactions} expenseCategories={expenseCategories} />
        <IncomePieChartComponent transactions={currentPeriodTransactions} incomeCategories={incomeCategories} />
        <CategoryBarChartComponent transactions={currentPeriodTransactions} onBack={() => {}} onClose={() => {}} />
        <RepeatedTransactionsReport transactions={currentPeriodTransactions} />
      </div>
    </div>
  );
};

export default AnalyticsSidebar;
