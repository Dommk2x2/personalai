import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronDownIcon, ChevronUpIcon } from './Icons';
import { formatDateDisplay } from '../utils/dateUtils';

interface RepeatedTransactionsReportProps {
  transactions: Transaction[];
}

interface RepeatedTransactionGroup {
  description: string;
  count: number;
  totalAmount: number;
  avgAmount: number;
  firstDate: string;
  lastDate: string;
  type: TransactionType;
  transactions: Transaction[];
}

const RepeatedTransactionsReport: React.FC<RepeatedTransactionsReportProps> = ({ transactions }) => {
    const { currentThemeColors } = useTheme();
    const [minOccurrences, setMinOccurrences] = useState(2);
    const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

    const repeatedTransactionsData = useMemo(() => {
        const groups: Record<string, Transaction[]> = {};

        transactions.forEach(tx => {
            if (typeFilter !== 'all' && tx.type !== typeFilter) return;

            const key = tx.description.toLowerCase().trim();
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(tx);
        });

        const result: RepeatedTransactionGroup[] = [];
        for (const key in groups) {
            const group = groups[key];
            if (group.length >= minOccurrences) {
                const totalAmount = group.reduce((sum, tx) => sum + tx.amount, 0);
                const sortedByDate = group.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                
                result.push({
                    description: group[0].description,
                    count: group.length,
                    totalAmount,
                    avgAmount: totalAmount / group.length,
                    firstDate: sortedByDate[0].date,
                    lastDate: sortedByDate[sortedByDate.length - 1].date,
                    type: group[0].type, // Assumes all in group have same type
                    transactions: sortedByDate,
                });
            }
        }

        return result.sort((a, b) => b.count - a.count || b.totalAmount - a.totalAmount);
    }, [transactions, minOccurrences, typeFilter]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 p-3 rounded-lg bg-bg-primary-themed border border-border-secondary">
                <div>
                    <label htmlFor="min-occurrences" className="text-sm font-medium text-text-muted-themed">Min. Occurrences:</label>
                    <input
                        id="min-occurrences"
                        type="number"
                        value={minOccurrences}
                        onChange={e => setMinOccurrences(Math.max(2, parseInt(e.target.value) || 2))}
                        className="ml-2 w-20 p-1.5 border rounded-md bg-bg-secondary-themed border-border-primary"
                        min="2"
                    />
                </div>
                <div>
                    <label htmlFor="type-filter" className="text-sm font-medium text-text-muted-themed">Transaction Type:</label>
                    <select
                        id="type-filter"
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value as any)}
                        className="ml-2 p-1.5 border rounded-md bg-bg-secondary-themed border-border-primary"
                    >
                        <option value="all">All</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>
            </div>

            {repeatedTransactionsData.length > 0 ? (
                <div className="space-y-3">
                    {repeatedTransactionsData.map((group) => (
                        <div key={group.description} className="bg-bg-primary-themed rounded-lg shadow-sm">
                            <div className="p-3 cursor-pointer" onClick={() => setExpandedGroup(expandedGroup === group.description ? null : group.description)}>
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-text-base-themed truncate" title={group.description}>{group.description}</p>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${group.type === 'income' ? 'bg-income/20 text-income' : 'bg-expense/20 text-expense'}`}>
                                            {group.count} times
                                        </span>
                                        <span className="font-bold text-lg" style={{color: group.type === 'income' ? currentThemeColors.income : currentThemeColors.expense}}>
                                            {formatCurrency(group.totalAmount)}
                                        </span>
                                        {expandedGroup === group.description ? <ChevronUpIcon/> : <ChevronDownIcon/>}
                                    </div>
                                </div>
                                <div className="text-xs text-text-muted-themed mt-1">
                                    Avg: {formatCurrency(group.avgAmount)} | First: {formatDateDisplay(group.firstDate)} | Last: {formatDateDisplay(group.lastDate)}
                                </div>
                            </div>
                            {expandedGroup === group.description && (
                                <div className="border-t border-border-secondary p-3">
                                    <ul className="space-y-1 text-xs">
                                        {group.transactions.map(tx => (
                                            <li key={tx.id} className="flex justify-between">
                                                <span>{formatDateDisplay(tx.date)}</span>
                                                <span className="font-mono">{formatCurrency(tx.amount)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-text-muted-themed">
                    <p>No repeated transactions found with the current filters.</p>
                </div>
            )}
        </div>
    );
};

export default RepeatedTransactionsReport;
