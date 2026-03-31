import React from 'react';
import { GlassCard } from './GlassCard';

interface TransactionCardProps {
  transaction: {
    description: string;
    amount: number;
    date: string;
    type: 'Expense' | 'Income';
    category: string;
    maskedCardNumber: string;
  };
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
  const front = (
    <div className="h-full flex flex-col justify-between">
      <div className="flex justify-between">
        <h3 className="text-lg font-bold">{transaction.description}</h3>
        <span className={`px-2 py-1 rounded-full text-xs ${transaction.type === 'Income' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          {transaction.type}
        </span>
      </div>
      <p className="text-sm opacity-80">{transaction.category}</p>
      <div className="flex justify-between items-end">
        <p className="text-2xl font-bold">₹{transaction.amount}</p>
        <p className="text-sm font-mono opacity-60">{transaction.maskedCardNumber}</p>
      </div>
    </div>
  );

  const back = (
    <div className="h-full flex flex-col justify-center items-center">
      <p className="text-sm opacity-80">Date</p>
      <p className="text-lg font-bold">{transaction.date}</p>
    </div>
  );

  return <GlassCard frontContent={front} backContent={back} className="from-slate-700 to-slate-900" />;
};
