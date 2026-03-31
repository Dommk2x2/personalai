import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';

interface NewFinancialCalendarProps {
  transactions: Transaction[];
  formatCurrency: (amount: number) => string;
  financialMonthStartDay: number;
  financialMonthEndDay: number;
  accountName?: string;
  onDateSelect: (date: string) => void;
  onOpenDateDetails: (date: string) => void;
  onOpenDateDetailsForDownload: (date: string) => void;
}

const NewFinancialCalendar: React.FC<NewFinancialCalendarProps> = ({
  transactions,
  formatCurrency,
  financialMonthStartDay,
  financialMonthEndDay,
  accountName,
  onDateSelect,
  onOpenDateDetails,
  onOpenDateDetailsForDownload,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Simplified logic for now
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="bg-black text-white min-h-screen p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Personal</h1>
        <div className="text-xl">...</div>
      </div>

      {/* Navigation */}
      <div className="flex justify-around mb-4 border-b border-gray-700 pb-2">
        <span>HOME</span>
        <span className="text-blue-500 border-b-2 border-blue-500">CALENDAR</span>
        <span>NOTEBOOK</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-gray-500">{day}</div>
        ))}
        {days.map(day => (
          <div key={day} className="border border-gray-700 rounded-lg p-2 h-24 flex flex-col justify-between">
            <span className="text-sm">{day}</span>
            <div className="text-xs">
              <p className="text-green-500">+100</p>
              <p className="text-red-500">-50</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Summary */}
      <div className="mt-6 border border-gray-700 rounded-lg p-4 flex justify-between">
        <div className="text-green-500">Total Income: 21,250</div>
        <div className="text-red-500">Total Expense: 18,157</div>
        <div className="text-blue-500">Balance: 3,093</div>
      </div>
    </div>
  );
};

export default NewFinancialCalendar;
