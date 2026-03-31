
import React, { useMemo, useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { ChartIcon } from './Icons';

interface IncomeCategoryMonitorProps {
  transactions: Transaction[];
  incomeCategories: string[];
  startDate: string | null;
  endDate: string | null;
}

const IncomeCategoryMonitor: React.FC<IncomeCategoryMonitorProps> = ({ transactions, incomeCategories, startDate, endDate }) => {
  const { currentThemeColors } = useTheme();
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const allCategories = useMemo(() => {
    const categorySet = new Set<string>();
    transactions.forEach(tx => {
        if (tx.type === TransactionType.INCOME && tx.category) {
            categorySet.add(tx.category);
        }
    });
    // Filter against the master list of income categories for consistency
    return incomeCategories.filter(cat => categorySet.has(cat));
  }, [transactions, incomeCategories]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => allCategories.slice(0, 5));
  
  const areAllSelected = useMemo(() => allCategories.length > 0 && selectedCategories.length === allCategories.length, [allCategories, selectedCategories]);

  const handleSelectAllToggle = () => {
    if (areAllSelected) {
        setSelectedCategories([]);
    } else {
        setSelectedCategories(allCategories);
    }
  };

  const totalsForSelected = useMemo(() => {
    if (selectedCategories.length === 0) {
      return { sum: 0, avg: 0 };
    }
    const selectedSet = new Set(selectedCategories);
    const filtered = transactions
      .filter(tx => tx.type === TransactionType.INCOME && tx.category && selectedSet.has(tx.category));
    
    const sum = filtered.reduce((s, tx) => s + tx.amount, 0);
    const avg = filtered.length > 0 ? sum / filtered.length : 0;
    
    return { sum, avg };
  }, [transactions, selectedCategories]);

  const chartData = useMemo(() => {
    // 1. Filter for income transactions with a category, excluding 'Initial Balance'
    const incomeTransactions = transactions.filter(
      tx => tx.type === TransactionType.INCOME && tx.category && tx.category !== 'Initial Balance'
    );

    if (incomeTransactions.length === 0) return [];

    const monthlyData: Record<string, Record<string, { totalAmount: number; count: number }>> = {};
    let isYearlyView = false;
    
    // Check if the date range suggests a yearly view and create a 12-month skeleton if so
    if (startDate && endDate) {
        const minDate = new Date(startDate + 'T00:00:00');
        const maxDate = new Date(endDate + 'T00:00:00');
        const dateRangeDays = (maxDate.getTime() - minDate.getTime()) / (1000 * 3600 * 24);

        if (dateRangeDays > 300) { // Heuristic for a yearly view
            isYearlyView = true;
            const startMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
            for (let i = 0; i < 12; i++) {
                const currentMonthDate = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
                const monthKey = `${currentMonthDate.getFullYear()}-${String(currentMonthDate.getMonth() + 1).padStart(2, '0')}`;
                monthlyData[monthKey] = {};
            }
        }
    }

    // 2. Group by month and then by category
    incomeTransactions.forEach(tx => {
      const monthKey = tx.date.substring(0, 7); // YYYY-MM
      
      // If it's a yearly view, only process transactions that fall within our 12-month skeleton.
      // Otherwise, create month keys on the fly.
      const shouldProcess = isYearlyView ? monthlyData.hasOwnProperty(monthKey) : true;
      
      if (shouldProcess) {
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {};
        }
        if (!monthlyData[monthKey][tx.category!]) {
            monthlyData[monthKey][tx.category!] = { totalAmount: 0, count: 0 };
        }
        monthlyData[monthKey][tx.category!].totalAmount += tx.amount;
        monthlyData[monthKey][tx.category!].count += 1;
      }
    });

    // 3. Calculate average transaction amount and format for chart
    const formattedData = Object.entries(monthlyData).map(([monthKey, categories]) => {
      const dataPoint: { name: string; [key: string]: number | string } = {
        name: new Date(monthKey + '-02T00:00:00').toLocaleString('default', { month: 'short', year: 'numeric' }),
      };
      for (const category in categories) {
        const { totalAmount, count } = categories[category];
        if (count > 0) {
          dataPoint[category] = parseFloat((totalAmount / count).toFixed(2));
        }
      }
      return dataPoint;
    });
    
    return formattedData.sort((a,b) => new Date(a.name as string).getTime() - new Date(b.name as string).getTime());
  }, [transactions, startDate, endDate]);
  
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const colors = currentThemeColors.categoryPillAccents.slice().reverse(); // Use different colors than expense monitor

  if (chartData.length === 0) {
     return (
      <div className="bg-bg-secondary-themed p-6 rounded-xl shadow-lg text-center text-text-muted-themed h-full flex flex-col justify-center items-center min-h-[500px]">
        <ChartIcon className="w-16 h-16 mx-auto mb-4 text-text-disabled" />
        <p>No categorized income data found for this period.</p>
        <p className="text-sm">Add income transactions to monitor average category income.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary-themed p-4 sm:p-6 rounded-xl shadow-lg h-[500px]">
      <div className="flex justify-between items-start">
         <div>
          <h2 className="text-lg font-semibold text-text-base-themed">Income Source Monitor</h2>
          <p className="text-xs text-text-muted-themed -mt-1 mb-4">Tracks the average transaction amount per income source over time.</p>
        </div>
        <div className="flex items-center gap-4">
            {selectedCategories.length > 0 && (
                <div className="text-right">
                    <p className="text-xs font-medium text-text-muted-themed">Period Average</p>
                    <p className="font-bold text-lg" style={{ color: currentThemeColors.income }} title={`Average transaction of selected categories for the period`}>
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalsForSelected.avg)}
                    </p>
                    <p className="text-xs text-text-muted-themed -mt-1" title={`Sum of selected categories for the period`}>
                        Total: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalsForSelected.sum)}
                    </p>
                </div>
            )}
            <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: currentThemeColors.bgPrimary }}>
                <button onClick={() => setChartType('line')} className={`px-2 py-1 text-xs font-semibold rounded ${chartType === 'line' ? 'bg-brand-primary text-white shadow' : 'text-text-muted-themed'}`}>Line</button>
                <button onClick={() => setChartType('bar')} className={`px-2 py-1 text-xs font-semibold rounded ${chartType === 'bar' ? 'bg-brand-primary text-white shadow' : 'text-text-muted-themed'}`}>Bar</button>
            </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
          {allCategories.length > 0 && (
            <button
                onClick={handleSelectAllToggle}
                className="px-3 py-1.5 rounded-full cursor-pointer font-semibold transition-colors"
                style={{ 
                    backgroundColor: areAllSelected ? currentThemeColors.expense + '20' : currentThemeColors.income + '20',
                    color: areAllSelected ? currentThemeColors.expense : currentThemeColors.income,
                    border: `1px solid ${areAllSelected ? currentThemeColors.expense : currentThemeColors.income}`
                }}
            >
                {areAllSelected ? 'Deselect All' : 'Select All'}
            </button>
          )}
          {allCategories.map(category => (
              <label key={category} className="flex items-center gap-1.5 px-2 py-1 rounded-full cursor-pointer" style={{ backgroundColor: selectedCategories.includes(category) ? currentThemeColors.bgAccent : currentThemeColors.bgPrimary, border: `1px solid ${currentThemeColors.borderSecondary}`}}>
                  <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="h-3 w-3 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                  />
                  {category}
              </label>
          ))}
      </div>
      <ResponsiveContainer width="100%" height="75%">
        {chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={currentThemeColors.chartGridColor} />
            <XAxis dataKey="name" tick={{ fill: currentThemeColors.chartAxisColor, fontSize: 12 }} dy={5} />
            <YAxis tickFormatter={(tick) => `₹${tick}`} tick={{ fill: currentThemeColors.chartAxisColor, fontSize: 12 }} dx={-5} />
            <Tooltip
                formatter={(value: number, name: string) => [`₹${value.toFixed(2)} (Avg Txn)`, name]}
                contentStyle={{ backgroundColor: currentThemeColors.chartTooltipBg, borderRadius: '0.5rem', border: `1px solid ${currentThemeColors.borderPrimary}` }}
                itemStyle={{ color: currentThemeColors.chartTooltipText }}
                labelStyle={{ color: currentThemeColors.chartTooltipText, marginBottom: '4px', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: currentThemeColors.chartLegendText }} />
            {selectedCategories.map((category, index) => (
                <Line
                key={category}
                type="monotone"
                dataKey={category}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls
                />
            ))}
            </LineChart>
        ) : (
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={currentThemeColors.chartGridColor} />
                <XAxis dataKey="name" tick={{ fill: currentThemeColors.chartAxisColor, fontSize: 12 }} dy={5} />
                <YAxis tickFormatter={(tick) => `₹${tick}`} tick={{ fill: currentThemeColors.chartAxisColor, fontSize: 12 }} dx={-5} />
                <Tooltip
                    formatter={(value: number, name: string) => [`₹${value.toFixed(2)} (Avg Txn)`, name]}
                    contentStyle={{ backgroundColor: currentThemeColors.chartTooltipBg, borderRadius: '0.5rem', border: `1px solid ${currentThemeColors.borderPrimary}` }}
                    itemStyle={{ color: currentThemeColors.chartTooltipText }}
                    labelStyle={{ color: currentThemeColors.chartTooltipText, marginBottom: '4px', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: currentThemeColors.chartLegendText }} />
                {selectedCategories.map((category, index) => (
                <Bar
                    key={category}
                    dataKey={category}
                    fill={colors[index % colors.length]}
                    radius={[4, 4, 0, 0]}
                />
                ))}
            </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeCategoryMonitor;
