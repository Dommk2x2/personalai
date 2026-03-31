import React, { useMemo } from 'react';
import { Transaction, AppMode, Account, SavedAmortizationSchedule, TodoItem, SectionKey } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { EyeIcon, EyeSlashIcon, BanknotesIcon, UserGroupIcon } from './Icons';

export const FinanceSnapshot: React.FC<{
    transactionsForSnapshot: Transaction[];
    activeAccount?: Account;
    isBalanceVisible: boolean;
    setIsBalanceVisible: (visible: boolean) => void;
    formatCurrency: (amount: number) => string;
    isAllTime: boolean;
    openingBalance: number;
}> = ({ transactionsForSnapshot, activeAccount, isBalanceVisible, setIsBalanceVisible, formatCurrency, isAllTime, openingBalance }) => {
    const { currentThemeColors } = useTheme();
    
    const balance = useMemo(() => 
        (transactionsForSnapshot ?? []).reduce((sum: number, tx: Transaction) => 
            sum + (tx.type === 'income' ? (tx.amount || 0) : -(tx.amount || 0)), 0
        ) + (openingBalance || 0), [transactionsForSnapshot, openingBalance]);

    return (
        <div className="bg-bg-secondary-themed p-5 xl:p-8 rounded-3xl shadow-xl border border-border-primary transition-all duration-300 w-full">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-brand-primary/10">
                        <BanknotesIcon className="w-5 h-5 text-brand-primary" />
                    </div>
                    <h3 className="font-black text-[10px] xl:text-[12px] uppercase tracking-[0.2em] text-text-muted-themed">Balance</h3>
                </div>
                <button onClick={() => setIsBalanceVisible(!isBalanceVisible)} className="text-text-muted-themed hover:text-brand-primary transition-colors p-1.5 bg-bg-primary-themed rounded-lg">
                    {isBalanceVisible ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
            </div>
            
            <div className="flex items-baseline gap-2">
                <p className="text-3xl sm:text-4xl xl:text-5xl font-black truncate leading-tight tracking-tighter" style={{ color: balance >= 0 ? currentThemeColors.income : currentThemeColors.expense }}>
                    {isBalanceVisible ? formatCurrency(balance) : '••••••'}
                </p>
                {isBalanceVisible && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted-themed opacity-60 mb-1">INR</span>
                )}
            </div>
        </div>
    );
};

export const AttendanceSnapshot: React.FC<{ attendanceEntries: any[]; isAllTime: boolean }> = ({ attendanceEntries, isAllTime }) => {
    const { currentThemeColors } = useTheme();
    const presentCount = useMemo(() => 
        (attendanceEntries ?? []).filter((e: any) => e.status === 'Present').length,
    [attendanceEntries]);

    return (
        <div className="bg-bg-secondary-themed p-5 xl:p-8 rounded-3xl shadow-xl border border-border-primary transition-all duration-300 w-full">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-brand-primary/10">
                    <UserGroupIcon className="w-5 h-5 text-brand-primary" />
                </div>
                <h3 className="font-black text-[10px] xl:text-[12px] uppercase tracking-[0.2em] text-text-muted-themed">Attendance</h3>
            </div>
            <p className="text-3xl sm:text-4xl xl:text-5xl font-black text-brand-primary leading-tight tracking-tighter">{presentCount} Days</p>
            <div className="mt-6 pt-4 border-t border-border-primary">
                <p className="text-[8px] xl:text-[10px] font-black uppercase tracking-[0.2em] text-text-muted-themed">
                    {isAllTime ? 'Total Present' : 'Days in Period'}
                </p>
            </div>
        </div>
    );
};

export const AnalyticsSnapshot: React.FC<{
    transactions: Transaction[];
    formatCurrency: (amount: number) => string;
}> = ({ transactions, formatCurrency }) => {
    const totalExpenses = useMemo(() => 
        (transactions ?? []).filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0),
    [transactions]);

    return (
        <div className="bg-bg-secondary-themed p-5 xl:p-8 rounded-3xl shadow-xl border border-border-primary transition-all duration-300 w-full">
            <h3 className="font-black text-[10px] xl:text-[12px] uppercase tracking-[0.2em] text-text-muted-themed mb-4">Total Expenses</h3>
            <p className="text-3xl sm:text-4xl xl:text-5xl font-black text-rose-500 leading-tight tracking-tighter">{formatCurrency(totalExpenses)}</p>
        </div>
    );
};

export const SnapshotsStack: React.FC<{
    activeMode: AppMode;
    transactions: Transaction[];
    accounts: Account[];
    activeAccountId: string | null;
    isBalanceVisible: boolean;
    setIsBalanceVisible: (visible: boolean) => void;
    formatCurrency: (amount: number) => string;
    attendanceEntries: any[];
    savedAmortizationSchedules: SavedAmortizationSchedule[];
    handleModeChange: (mode: AppMode) => void;
    handleShowSection: (section: SectionKey) => void;
    todos: TodoItem[];
    startDate: string | null;
    endDate: string | null;
    openingBalance: number;
    visibleSections?: Set<SectionKey>;
}> = ({ 
    activeMode, transactions, accounts, activeAccountId, 
    isBalanceVisible, setIsBalanceVisible, formatCurrency, 
    attendanceEntries, savedAmortizationSchedules, 
    handleModeChange, handleShowSection, todos,
    startDate, endDate, openingBalance, visibleSections
}) => {
    const isAllTime = !startDate && !endDate;

    const filteredTransactions = useMemo(() => {
        return (transactions ?? []).filter(tx => {
            if (tx.isDeleted) return false;
            if (activeAccountId && tx.accountId !== activeAccountId) return false;
            // Removed date filtering for snapshot
            return true;
        });
    }, [transactions, activeAccountId]);

    const filteredAttendance = useMemo(() => {
        return (attendanceEntries ?? []).filter(entry => {
            // Removed date filtering for snapshot
            return true;
        });
    }, [attendanceEntries]);
    
    return (
        <div className="space-y-4 sm:space-y-6">
            {activeMode === AppMode.FINANCE && visibleSections?.has('charts') && (
                <AnalyticsSnapshot 
                    transactions={filteredTransactions}
                    formatCurrency={formatCurrency}
                />
            )}
            {activeMode === AppMode.FINANCE && !visibleSections?.has('charts') && (
                <FinanceSnapshot 
                    transactionsForSnapshot={filteredTransactions} 
                    activeAccount={(accounts || []).find(a => a.id === activeAccountId)} 
                    isBalanceVisible={isBalanceVisible} 
                    setIsBalanceVisible={setIsBalanceVisible} 
                    formatCurrency={formatCurrency} 
                    isAllTime={isAllTime}
                    openingBalance={openingBalance}
                />
            )}
            {activeMode === AppMode.ATTENDANCE && (
                <AttendanceSnapshot 
                    attendanceEntries={filteredAttendance} 
                    isAllTime={isAllTime}
                />
            )}
            {activeMode === AppMode.EMI && (
                <div className="bg-bg-secondary-themed p-5 xl:p-8 rounded-3xl shadow-xl border border-border-primary flex flex-col justify-between items-center text-center transition-all duration-300">
                    <h3 className="font-black text-[10px] xl:text-[12px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-4">Saved EMI Plans</h3>
                    <p className="text-3xl sm:text-4xl xl:text-5xl font-black text-brand-secondary leading-tight tracking-tighter mb-6">{(savedAmortizationSchedules ?? []).filter(s => !s.isDeleted).length}</p>
                    <button onClick={() => handleModeChange(AppMode.EMI)} className="w-full py-2 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:opacity-90 transition-opacity">View Tools</button>
                </div>
            )}
            {activeMode === AppMode.TODO && (
                <div className="bg-bg-secondary-themed p-5 xl:p-8 rounded-3xl shadow-xl border border-border-primary flex flex-col justify-between items-center text-center transition-all duration-300">
                    <h3 className="font-black text-[10px] xl:text-[12px] uppercase tracking-[0.2em] text-text-muted-themed mb-4">Tasks Outstanding</h3>
                    <p className="text-3xl sm:text-4xl xl:text-5xl font-black text-rose-500 leading-tight tracking-tighter mb-6">{(todos ?? []).filter(t => !t.completed && !t.isDeleted).length}</p>
                    <button onClick={() => { handleModeChange(AppMode.TODO); handleShowSection('todoList' as SectionKey); }} className="w-full py-2 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:opacity-90 transition-opacity">Manage Planner</button>
                </div>
            )}
        </div>
    );
};