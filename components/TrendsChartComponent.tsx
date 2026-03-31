
import React, { useMemo, useState } from 'react';
import { Transaction } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronLeftIcon, XIcon } from './Icons';
import LineChartComponent from './LineChartComponent';

interface TrendsChartComponentProps {
  transactions: Transaction[];
  onBack?: () => void;
  onClose?: () => void;
}

const TrendsChartComponent: React.FC<TrendsChartComponentProps> = ({ transactions, onBack, onClose }) => {
  const { currentThemeColors } = useTheme();
  const [filter, setFilter] = useState<'income' | 'expense' | 'all'>('all');

  if (transactions.length === 0) {
    return (
      <div className="bg-bg-secondary-themed p-6 rounded-xl shadow-lg text-center text-text-muted-themed h-full flex flex-col justify-center items-center min-h-[400px]">
        <img src="https://picsum.photos/seed/trendschart/300/200?grayscale" alt="Trends chart placeholder" className="mx-auto mb-4 rounded-lg w-32 h-24 sm:w-40 sm:h-32 md:w-48 md:h-32 object-cover opacity-70 dark:opacity-50" />
        <p>No transaction data for trends chart.</p>
        <p className="text-sm">Add transactions to see daily trends.</p>
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
                Spending Trends
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

      <div className="h-[350px]">
          <LineChartComponent transactions={transactions} filter={filter} />
      </div>
    </div>
  );
};

export default TrendsChartComponent;
