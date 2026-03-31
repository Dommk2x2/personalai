import React from 'react';
import { BanknotesIcon, CreditCardIcon, ClipboardListIcon, ChartIcon, HistoryIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import { hexToRgba } from '../utils/colorUtils';

interface SummaryProps {
  periodLabel: string;
  income: number;
  expenses: number;
  closingBalance: number;
  transactionCount: number;
  openingBalance?: number;
}

const Summary: React.FC<SummaryProps> = ({ periodLabel, income, expenses, closingBalance, transactionCount, openingBalance }) => {
  const { currentThemeColors } = useTheme();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'decimal' }).format(amount);
  };

  const openingBalanceLabel = periodLabel === 'All-Time' ? 'Previous Month Balance' : 'Opening Balance';
  const closingBalanceLabel = periodLabel === 'All-Time' ? 'Current Net Worth' : 'Closing Balance';

  const summaryCards = [
    { title: `${periodLabel} Income`, value: formatCurrency(income), Icon: BanknotesIcon, color: currentThemeColors.income },
    { title: `${periodLabel} Expenses`, value: formatCurrency(expenses), Icon: CreditCardIcon, color: currentThemeColors.expense, progress: income > 0 ? (expenses / income) * 100 : 0 },
    (openingBalance !== undefined)
      ? { title: openingBalanceLabel, value: formatCurrency(openingBalance), Icon: HistoryIcon, color: '#8b5cf6' }
      : { title: `${periodLabel} Transactions`, value: transactionCount.toLocaleString('en-IN'), Icon: ClipboardListIcon, color: '#8b5cf6' },
    { title: closingBalanceLabel, value: formatCurrency(closingBalance), Icon: ChartIcon, color: '#f59e0b', progress: income > 0 ? ((income - expenses) / income) * 100 : 0 }
  ];


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {summaryCards.map((card, index) => (
        <div key={index} className="bg-bg-secondary-themed p-4 rounded-xl shadow-md flex flex-col transition-transform duration-200 hover:scale-105 hover:shadow-lg border border-transparent hover:border-bg-accent-themed">
          <div className="flex items-center mb-3">
            <div
              className="p-2.5 rounded-lg mr-4"
              style={{ backgroundColor: hexToRgba(card.color, 0.15) }}
            >
              <card.Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: card.color }}/>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted-themed">{card.title}</p>
              <p className="text-lg sm:text-xl font-black" style={{ color: card.color }}>{card.value}</p>
            </div>
          </div>
          
          {card.progress !== undefined && (
            <div className="mt-auto pt-2">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-bold uppercase opacity-60" style={{ color: card.color }}>Ratio</span>
                <span className="text-[9px] font-bold" style={{ color: card.color }}>{Math.max(0, card.progress).toFixed(1)}%</span>
              </div>
              <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ 
                    backgroundColor: card.color,
                    width: `${Math.min(Math.max(0, card.progress), 100)}%`
                  }} 
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Summary;