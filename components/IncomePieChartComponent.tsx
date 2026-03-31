
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { Transaction, TransactionType, IncomeCategory } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { TRANSFER_CATEGORY } from '../constants';

interface IncomePieChartComponentProps {
  transactions: Transaction[];
  incomeCategories: string[];
  openingBalance?: number | null;
}

const CustomCenterLabel = ({ viewBox, value, openingBalance }: { viewBox?: any, value: number, openingBalance?: number | null }) => {
    const { cx, cy } = viewBox;
    const { currentThemeColors } = useTheme();

    const formatCurrencyForLabel = (num: number) => new Intl.NumberFormat('en-IN', { style: 'decimal' }).format(Math.round(num));

    if (openingBalance === null || openingBalance === undefined || openingBalance <= 0 || value === 0) {
        return (
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill={currentThemeColors.textBase} fontSize="1.25rem" fontWeight="600">
                {formatCurrencyForLabel(value)}
            </text>
        );
    }
    
    const percentageOfBalance = (value / openingBalance) * 100;

    return (
        <g>
            <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="central" fill={currentThemeColors.textBase} fontSize="1.1rem" fontWeight="600">
                {formatCurrencyForLabel(value)}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="central" fill={currentThemeColors.textMuted} fontSize="0.65rem" fontWeight="500">
                ({percentageOfBalance.toFixed(1)}% of opening bal.)
            </text>
        </g>
    );
};


const IncomePieChartComponent: React.FC<IncomePieChartComponentProps> = ({ transactions, incomeCategories, openingBalance }) => {
  const { currentThemeColors } = useTheme();
  
  const categoryColors = useMemo(() => {
    const colors: Record<string, string> = {};
    const themeAccentColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#82E0AA', '#F1948A', '#85C1E9',
      '#F8C471', '#73C6B6', '#D7BDE2', '#F0B27A', '#A9CCE3'
    ];
    let accentIndex = 0;
    incomeCategories.forEach(cat => {
      colors[cat] = themeAccentColors[accentIndex % themeAccentColors.length];
      accentIndex++;
    });
    if (!colors['Other Income']) {
        colors['Other Income'] = themeAccentColors[accentIndex % themeAccentColors.length];
    }
    // Add a specific color for transfers to make them distinct
    colors[TRANSFER_CATEGORY] = currentThemeColors.brandPrimary;
    return colors;
  }, [incomeCategories, currentThemeColors.brandPrimary]);
  
  const incomeData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    
    (transactions ?? []).forEach(tx => {
      if (tx.type === TransactionType.INCOME && tx.category && tx.category !== IncomeCategory.INITIAL_BALANCE) {
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
      }
    });

    return Object.entries(categoryMap).map(([name, value]) => ({
      name: name,
      value,
    })).sort((a,b) => b.value - a.value); 
  }, [transactions]);

  const totalIncome = useMemo(() => incomeData.reduce((sum, item) => sum + item.value, 0), [incomeData]);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-IN', { style: 'decimal' }).format(value);

  const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload; 
      const percentage = totalIncome > 0 ? ((data.value / totalIncome) * 100).toFixed(2) : 0;
      return (
        <div 
            className="p-3 rounded-lg shadow-lg"
            style={{ 
                backgroundColor: currentThemeColors.chartTooltipBg, 
                border: `1px solid ${currentThemeColors.borderSecondary}` 
            }}
        >
          <p className="font-semibold text-sm" style={{color: currentThemeColors.chartTooltipText}}>{`${data.name}`}</p>
          <p className="text-xs" style={{color: currentThemeColors.textMuted}}>{`Amount: ${formatCurrency(data.value)}`}</p>
          <p className="text-xs" style={{color: currentThemeColors.textMuted}}>{`Percentage: ${percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  if (incomeData.length === 0) {
    return (
      <div className="bg-bg-secondary-themed p-6 rounded-xl shadow-lg text-center text-text-muted-themed h-full flex flex-col justify-center items-center min-h-[400px]">
        <img src="https://picsum.photos/seed/incomepieempty/300/200?grayscale" alt="Pie chart placeholder" className="mx-auto mb-4 rounded-lg w-32 h-24 sm:w-40 sm:h-32 md:w-48 md:h-32 object-cover opacity-70 dark:opacity-50" />
        <p>No income data for category breakdown.</p>
        <p className="text-sm">Add income transactions with categories to see a pie chart.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary-themed p-4 sm:p-6 rounded-xl shadow-lg h-[450px]"> 
      <h2 className="text-base font-semibold text-text-base-themed mb-3 text-center">Total Income</h2>
      <div className="flex h-[90%] w-full items-center">
        {/* Legend on the left */}
        <div className="w-1/2 pr-4 overflow-y-auto h-full">
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="text-xs font-semibold text-text-base-themed">Categories</h3>
            <span className="text-[10px] text-text-muted-themed">Total: {incomeData.length}</span>
          </div>
          <ul className="space-y-1">
            {incomeData.map((entry, index) => (
              <li key={`item-${index}`} className="flex justify-between items-center text-xs gap-2 py-0.5">
                 <div className="flex items-center truncate">
                  <span className="text-text-muted-themed text-[10px] w-5 flex-shrink-0 text-right mr-1">{index + 1}.</span>
                  <span className="w-2.5 h-2.5 rounded-full mr-1.5 flex-shrink-0" style={{ backgroundColor: categoryColors[entry.name] || '#ccc' }}></span>
                  <span className="text-text-base-themed truncate text-[11px]" title={entry.name}>{entry.name}</span>
                </div>
                 <div className="flex-shrink-0 flex items-baseline gap-1.5">
                    <span className="font-semibold text-text-base-themed text-[10px] text-right w-10">
                        {totalIncome > 0 ? `${((entry.value / totalIncome) * 100).toFixed(1)}%` : '0.0%'}
                    </span>
                    <span className="font-medium text-text-muted-themed text-right w-16 font-mono text-[11px]">{formatCurrency(entry.value)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Pie chart on the right */}
        <div className="w-1/2 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={incomeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius="80%"
                innerRadius="60%"
                fill="#82ca9d"
                dataKey="value"
                nameKey="name"
                isAnimationActive={false}
              >
                {incomeData.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={categoryColors[entry.name] || '#ccc'} />
                ))}
                 <Label
                  content={<CustomCenterLabel value={totalIncome} openingBalance={openingBalance} />}
                  position="center"
                />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default IncomePieChartComponent;
