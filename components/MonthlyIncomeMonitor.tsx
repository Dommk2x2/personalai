import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, DotProps } from 'recharts';
import { Transaction, TransactionType } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface MonthlyIncomeMonitorProps {
  transactions: Transaction[]; // Expects all transactions for the user
  year: number;
}

interface ChartData {
  month: string;
  income: number;
  change: number; // percentage change
}

const MonthlyIncomeMonitor: React.FC<MonthlyIncomeMonitorProps> = ({ transactions, year }) => {
  const { currentThemeColors } = useTheme();

  const monthlyIncomeData = useMemo(() => {
    const incomeByMonth: Record<string, number> = {};
    const currentYear = year;

    // Initialize all months of the current year to 0
    for (let i = 0; i < 12; i++) {
        const monthKey = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
        incomeByMonth[monthKey] = 0;
    }

    transactions.forEach(tx => {
      if (tx.type === TransactionType.INCOME && tx.date.startsWith(String(currentYear))) {
        const monthKey = tx.date.substring(0, 7); // YYYY-MM
        incomeByMonth[monthKey] = (incomeByMonth[monthKey] || 0) + tx.amount;
      }
    });

    const chartData: ChartData[] = Object.entries(incomeByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, income], index, arr) => {
        const prevMonthIncome = index > 0 ? arr[index - 1][1] : 0;
        let change = 0;
        if (prevMonthIncome > 0) {
          change = ((income - prevMonthIncome) / prevMonthIncome) * 100;
        } else if (income > 0) {
          change = 100; // From 0 to positive is a 100% gain for display
        }
        return {
          month: new Date(monthKey + '-02T00:00:00').toLocaleString('default', { month: 'short' }),
          income,
          change,
        };
      });

    return chartData;
  }, [transactions, year]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

  const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const changeText = data.change > 0 ? `+${data.change.toFixed(1)}%` : `${data.change.toFixed(1)}%`;
      return (
        <div className="p-3 rounded-lg shadow-lg" style={{ backgroundColor: currentThemeColors.chartTooltipBg, border: `1px solid ${currentThemeColors.borderSecondary}` }}>
          <p className="font-semibold" style={{ color: currentThemeColors.chartTooltipText }}>{data.month}</p>
          <p style={{ color: currentThemeColors.income }}>Income: {formatCurrency(data.income)}</p>
          <p style={{ color: data.change >= 0 ? currentThemeColors.income : currentThemeColors.expense }}>
            Change: {changeText}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomizedDot: React.FC<DotProps & { payload?: ChartData }> = (props) => {
    const { cx, cy, payload } = props;
    if (payload && payload.change !== 0) {
      const color = payload.change > 0 ? currentThemeColors.income : currentThemeColors.expense;
      return <circle cx={cx} cy={cy} r={5} stroke={color} strokeWidth={2} fill={currentThemeColors.bgSecondary} />;
    }
    return <circle cx={cx} cy={cy} r={4} fill={currentThemeColors.brandPrimary} />;
  };
  
  // Check if there is any income data to display.
  const hasIncomeData = monthlyIncomeData.some(d => d.income > 0);

  if (!hasIncomeData) {
    return (
      <div className="bg-bg-secondary-themed p-6 rounded-xl shadow-lg text-center text-text-muted-themed h-full flex flex-col justify-center items-center min-h-[400px]">
        <p>No income data available for {year} to display trends.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary-themed p-4 sm:p-6 rounded-xl shadow-lg h-[450px]">
      <h2 className="text-lg font-semibold text-text-base-themed mb-4">Monthly Income Monitor (All Accounts, {year})</h2>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={monthlyIncomeData} margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={currentThemeColors.chartGridColor} />
          <XAxis dataKey="month" tick={{ fill: currentThemeColors.chartAxisColor, fontSize: 12 }} dy={5} />
          <YAxis tickFormatter={(tick) => `₹${(tick / 1000).toFixed(0)}k`} tick={{ fill: currentThemeColors.chartAxisColor, fontSize: 12 }} dx={-5} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="income"
            stroke={currentThemeColors.brandPrimary}
            strokeWidth={2}
            dot={<CustomizedDot />}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyIncomeMonitor;