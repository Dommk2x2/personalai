
import React, { useMemo, useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronLeftIcon, XIcon } from './Icons';

interface CategoryBarChartComponentProps {
  transactions: Transaction[];
  onBack?: () => void;
  onClose?: () => void;
}

const CategoryBarChartComponent: React.FC<CategoryBarChartComponentProps> = ({ transactions, onBack, onClose }) => {
  const { currentThemeColors, theme } = useTheme();
  const [filter, setFilter] = useState<'income' | 'expense' | 'all'>('all');

  const data = useMemo(() => {
    const categoryData: Record<string, { income: number; expense: number }> = {};

    transactions.forEach(tx => {
      // Exclude transfers and initial balance from this chart for clarity
      if (!tx.category || tx.category === 'Internal Transfer' || tx.category === 'Initial Balance') return;

      if (!categoryData[tx.category]) {
        categoryData[tx.category] = { income: 0, expense: 0 };
      }
      
      if (tx.type === TransactionType.INCOME) {
        categoryData[tx.category].income += tx.amount;
      } else if (tx.type === TransactionType.EXPENSE) {
        categoryData[tx.category].expense += tx.amount;
      }
    });
    
    return Object.entries(categoryData)
      .map(([name, values]) => ({ name, ...values }))
      .filter(item => item.income > 0 || item.expense > 0) // Only show categories with transactions
      .sort((a, b) => (b.income + b.expense) - (a.income + a.expense)); // Sort by total amount desc
  }, [transactions]);

  const filteredData = useMemo(() => {
    if (filter === 'income') return data.filter(item => item.income > 0);
    if (filter === 'expense') return data.filter(item => item.expense > 0);
    return data;
  }, [data, filter]);

  const formatCurrencyTick = (tickItem: number) => {
    if (tickItem >= 10000000) return `${(tickItem / 10000000).toFixed(1)}Cr`;
    if (tickItem >= 100000) return `${(tickItem / 100000).toFixed(1)}L`;
    if (tickItem >= 1000) return `${(tickItem / 1000).toFixed(0)}K`;
    return `${tickItem}`;
  };
  
  const currencyFormatter = (value: number) => new Intl.NumberFormat('en-IN', { style: 'decimal' }).format(value);

  if (data.length === 0) {
    return (
      <div className="bg-bg-secondary-themed p-6 rounded-xl shadow-lg text-center text-text-muted-themed h-full flex flex-col justify-center items-center min-h-[400px]">
        <img src="https://picsum.photos/seed/categorybarchart/300/200?grayscale" alt="Bar chart placeholder" className="mx-auto mb-4 rounded-lg w-32 h-24 sm:w-40 sm:h-32 md:w-48 md:h-32 object-cover opacity-70 dark:opacity-50" />
        <p>No categorized data for bar chart.</p>
        <p className="text-sm">Add transactions with categories to see a summary here.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary-themed p-4 sm:p-6 pt-12 rounded-xl shadow-lg min-h-[450px]">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
            {onBack && (
                <button onClick={onBack} className="p-1 hover:bg-bg-primary-themed rounded-full text-text-muted-themed">
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
            )}
            <h2 className="text-sm sm:text-lg font-semibold text-text-base-themed">
                Category Breakdown
            </h2>
        </div>
        <div className="flex items-center gap-2">
            <div className="flex gap-1 sm:gap-2 mr-2">
                {(['all', 'income', 'expense'] as const).map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-2 py-1 text-[10px] sm:text-xs font-bold uppercase rounded-lg transition-colors ${filter === f ? 'bg-brand-primary text-white' : 'bg-bg-primary-themed text-text-muted-themed hover:text-brand-primary'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {onClose && (
                <button onClick={onClose} className="p-1 hover:bg-bg-primary-themed rounded-full text-text-muted-themed">
                    <XIcon className="w-5 h-5" />
                </button>
            )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
          <BarChart
          data={filteredData}
          margin={{
              top: 20,
              right: 15,
              left: -10,
              bottom: 80, // Increased bottom margin for angled labels
          }}
          >
          <CartesianGrid strokeDasharray="3 3" stroke={currentThemeColors.chartGridColor} />
          <XAxis 
              dataKey="name" 
              tick={{ fill: currentThemeColors.chartAxisColor, fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={70} // Explicit height for safety
              interval={0} // Ensure all labels are shown
          />
          <YAxis tickFormatter={formatCurrencyTick} tick={{ fill: currentThemeColors.chartAxisColor, fontSize: 10 }} dx={-5} />
          <Tooltip
              formatter={(value: number, name: string) => [currencyFormatter(value), name.charAt(0).toUpperCase() + name.slice(1)]}
              cursor={{ fill: theme.mode === 'dark' ? 'rgba(200,200,200,0.05)' : 'rgba(200,200,200,0.1)' }} 
              contentStyle={{ backgroundColor: currentThemeColors.chartTooltipBg, borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', borderColor: currentThemeColors.chartGridColor, fontSize: '12px' }}
              itemStyle={{ color: currentThemeColors.chartTooltipText }}
              labelStyle={{ color: currentThemeColors.chartTooltipText, marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', color: currentThemeColors.chartLegendText }} verticalAlign="top" align="right" />
          {(filter === 'all' || filter === 'income') && <Bar dataKey="income" fill={currentThemeColors.chartIncome} name="Income" radius={[4, 4, 0, 0]} />}
          {(filter === 'all' || filter === 'expense') && <Bar dataKey="expense" fill={currentThemeColors.chartExpense} name="Expense" radius={[4, 4, 0, 0]} />}
          </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryBarChartComponent;
