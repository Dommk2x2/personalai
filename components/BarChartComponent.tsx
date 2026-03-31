import React from 'react';
import { Transaction, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

interface BarChartComponentProps {
  transactions: Transaction[];
}

const BarChartComponent: React.FC<BarChartComponentProps> = ({ transactions }) => {
  const { currentThemeColors, theme } = useTheme(); // Use theme.mode for cursor fill logic

  const totalIncome = (transactions ?? [])
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = (transactions ?? [])
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const data = [
    { name: 'Income', value: totalIncome, fill: currentThemeColors.brandSecondary },
    { name: 'Expenses', value: totalExpenses, fill: currentThemeColors.brandPrimary },
  ];
  
  const formatCurrencyTick = (tickItem: number) => {
    if (tickItem >= 10000000) return `₹${(tickItem / 10000000).toFixed(1)}Cr`; // Crores
    if (tickItem >= 100000) return `₹${(tickItem / 100000).toFixed(1)}L`; // Lakhs
    if (tickItem >= 1000) return `₹${(tickItem / 1000).toFixed(0)}K`;
    return `₹${tickItem}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div 
          className="p-2 rounded-lg shadow-xl border backdrop-blur-md"
          style={{ 
            backgroundColor: `${currentThemeColors.chartTooltipBg}EE`, 
            borderColor: currentThemeColors.borderPrimary 
          }}
        >
          <p className="font-bold text-[10px] uppercase tracking-tight" style={{color: data.payload.fill}}>{`${data.name}`}</p>
          <p className="text-sm font-black" style={{color: currentThemeColors.chartTooltipText}}>
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!transactions || transactions.length === 0) {
    return (
        <div className="bg-bg-secondary-themed p-6 rounded-xl shadow-lg text-center text-text-muted-themed h-full flex flex-col justify-center items-center border border-dashed" style={{ borderColor: currentThemeColors.borderSecondary }}>
             <img src="https://picsum.photos/seed/barchart/300/200?grayscale" alt="Chart placeholder" className="mx-auto mb-4 rounded-lg w-32 h-24 sm:w-40 sm:h-32 md:w-48 md:h-32 object-cover opacity-70 dark:opacity-50" />
            <p className="font-medium">No data available for chart.</p>
            <p className="text-xs opacity-70">Add some transactions to see a summary here.</p>
        </div>
    );
  }

  return (
    <div className="bg-bg-secondary-themed p-4 sm:p-5 rounded-xl shadow-md h-full border" style={{ borderColor: currentThemeColors.borderSecondary }}>
      <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted-themed mb-4">Income vs. Expenses</h2>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="2 2" vertical={false} stroke={currentThemeColors.chartGridColor} />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: currentThemeColors.chartAxisColor, fontSize: 9, fontWeight: 600 }} 
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tickFormatter={formatCurrencyTick} 
            tick={{ fill: currentThemeColors.chartAxisColor, fontSize: 9, fontWeight: 600 }} 
          />
          <Tooltip
            cursor={{ fill: theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }} 
            content={<CustomTooltip />}
           />
          <Legend 
            verticalAlign="top" 
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: '20px' }} 
          />
          <Bar dataKey="value" barSize={40} radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.9} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;