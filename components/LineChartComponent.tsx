import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

interface LineChartComponentProps {
  transactions: Transaction[];
  filter?: 'income' | 'expense' | 'all';
}

const LineChartComponent: React.FC<LineChartComponentProps> = ({ transactions, filter = 'all' }) => {
  const { currentThemeColors, theme } = useTheme(); // Use theme.mode for cursor fill logic

  const processedData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }
    const aggregatedData: Record<string, { date: string; income: number; expenses: number }> = {};
    (transactions ?? []).forEach(tx => {
      const date = tx.date; 
      if (!aggregatedData[date]) {
        aggregatedData[date] = { date, income: 0, expenses: 0 };
      }
      if (tx.type === TransactionType.INCOME) {
        aggregatedData[date].income += tx.amount;
      } else {
        aggregatedData[date].expenses += tx.amount;
      }
    });
    return Object.values(aggregatedData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);

  const formatCurrencyTick = (tickItem: number): string => {
    if (tickItem >= 10000000) return `₹${(tickItem / 10000000).toFixed(1)}Cr`; // Crores
    if (tickItem >= 100000) return `₹${(tickItem / 100000).toFixed(1)}L`; // Lakhs
    if (tickItem >= 1000) return `₹${(tickItem / 1000).toFixed(0)}K`;
    return `₹${tickItem}`;
  };

  const formatDateTick = (dateString: string): string => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const currencyFormatter = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const incomeData = (payload || []).find((p: any) => p.dataKey === 'income');
      const expenseData = (payload || []).find((p: any) => p.dataKey === 'expenses');
      
      const incomeValue = incomeData ? incomeData.value : 0;
      const expenseValue = expenseData ? expenseData.value : 0;
      const netFlow = incomeValue - expenseValue;

      return (
        <div 
          className="p-3 rounded-lg shadow-lg"
          style={{ 
            backgroundColor: currentThemeColors.chartTooltipBg, 
            border: `1px solid ${currentThemeColors.borderSecondary}` 
          }}
        >
          <p className="font-semibold mb-2 text-sm" style={{color: currentThemeColors.chartTooltipText}}>{formatDateTick(label)}</p>
          {incomeData && (
            <p className="text-xs" style={{color: currentThemeColors.chartIncome}}>
              Income: {currencyFormatter(incomeValue)}
            </p>
          )}
           {expenseData && (
            <p className="text-xs" style={{color: currentThemeColors.chartExpense}}>
              Expenses: {currencyFormatter(expenseValue)}
            </p>
          )}
          {filter === 'all' && (
            <div className="mt-2 pt-2 border-t" style={{borderColor: currentThemeColors.chartGridColor}}>
              <p className="text-xs font-semibold" style={{color: netFlow >= 0 ? currentThemeColors.chartIncome : currentThemeColors.chartExpense}}>
                Net Flow: {currencyFormatter(netFlow)}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (processedData.length === 0) {
    return (
      <div className="bg-bg-secondary-themed p-6 rounded-xl shadow-lg text-center text-text-muted-themed h-full flex flex-col justify-center items-center min-h-[400px]">
        <img src="https://picsum.photos/seed/linechartempty/300/200?grayscale" alt="Line chart placeholder" className="mx-auto mb-4 rounded-lg w-32 h-24 sm:w-40 sm:h-32 md:w-48 md:h-32 object-cover opacity-70 dark:opacity-50" />
        <p>No transaction data for trend chart.</p>
        <p className="text-sm">Add transactions to see daily trends.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary-themed p-4 sm:p-6 rounded-xl shadow-lg h-[450px]">
      <h2 className="text-base font-semibold text-text-base-themed mb-3">Transaction Trends</h2>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={processedData} margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={currentThemeColors.chartGridColor} />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDateTick} 
            tick={{ fill: currentThemeColors.chartAxisColor, fontSize: 10 }} 
            dy={5}
            minTickGap={20}
          />
          <YAxis 
            tickFormatter={formatCurrencyTick} 
            tick={{ fill: currentThemeColors.chartAxisColor, fontSize: 10 }}
            dx={-5}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3', stroke: theme.mode === 'dark' ? '#4b5563' : '#a0aec0' }}
            content={<CustomTooltip />}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: currentThemeColors.chartLegendText }} />
          {(filter === 'all' || filter === 'income') && (
            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke={currentThemeColors.chartIncome}
              strokeWidth={2}
              dot={{ r: 4, fill: currentThemeColors.chartIncome }}
              activeDot={{ r: 6 }}
            />
          )}
          {(filter === 'all' || filter === 'expense') && (
            <Line
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke={currentThemeColors.chartExpense}
              strokeWidth={2}
              dot={{ r: 4, fill: currentThemeColors.chartExpense }}
              activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;