import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { UpiIcon, ArrowUpTrayIcon as PayIcon, LockClosedIcon, CheckCircleIcon, XCircleIcon, CalendarIcon, HistoryIcon } from './Icons';
import { Transaction, TransactionType } from '../types';

interface UpiPaymentProps {
    cashInHandBalance: number;
    activeAccountName?: string;
    totalCashbackBalance?: number;
    totalCouponBalance?: number;
    transactions: Transaction[];
    onClose: () => void;
    initialCashbackBalance: number;
    onUpdateInitialCashback: (value: number) => void;
    onShowBenefitReport: () => void;
    onResetBalances: () => void;
}

const UpiPayment: React.FC<UpiPaymentProps> = ({ 
    cashInHandBalance, 
    activeAccountName = 'Cash In Hand',
    totalCashbackBalance = 0, 
    totalCouponBalance = 0, 
    transactions, 
    onClose,
    initialCashbackBalance,
    onUpdateInitialCashback,
    onShowBenefitReport,
    onResetBalances
}) => {
    const { currentThemeColors } = useTheme();
    const [isEditingInitial, setIsEditingInitial] = useState(false);
    const [tempInitial, setTempInitial] = useState(initialCashbackBalance.toString());
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Filter transactions that have cashback or coupon usage
    const benefitHistory = transactions
        .filter(t => !t.isDeleted && ((t.cashbackAmount && t.cashbackAmount > 0) || (t.couponUsed && t.couponUsed > 0)))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="upi-container" style={{ backgroundColor: currentThemeColors.bgSecondary }}>
            <div className="upi-screen">
                <div className="upi-header">
                    <UpiIcon className="w-10 h-10" style={{ color: currentThemeColors.brandPrimary }} />
                    <h3 className="upi-title">Liquidity Overview</h3>
                </div>

                <div className="upi-content animate-fade-in space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-inner">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">Current Liquidity</p>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">{activeAccountName}</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(cashInHandBalance)}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center ml-3">
                                    <PayIcon className="w-5 h-5 text-brand-primary" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-green-50/50 dark:bg-green-900/10 rounded-2xl border border-green-100/50 dark:border-green-900/20">
                                    <p className="text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">Cashback Balance</p>
                                    <p className="text-lg font-bold text-green-700 dark:text-green-300">{formatCurrency(totalCashbackBalance)}</p>
                                </div>
                                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20">
                                    <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Coupons Used</p>
                                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatCurrency(totalCouponBalance)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 text-center relative group">
                        <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-1">Available Cashback Benefits</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                            {formatCurrency(totalCashbackBalance)}
                        </p>
                        <button 
                            onClick={() => setIsEditingInitial(!isEditingInitial)}
                            className="absolute top-2 right-2 p-1 text-brand-primary/40 hover:text-brand-primary transition-colors"
                            title="Set Initial Cashback"
                        >
                            <HistoryIcon className="w-3 h-3" />
                        </button>
                        
                        {isEditingInitial && (
                            <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-brand-primary/20 shadow-lg animate-fade-in">
                                <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Initial Cashback Balance</p>
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        value={tempInitial}
                                        onChange={(e) => setTempInitial(e.target.value)}
                                        className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-brand-primary outline-none"
                                        placeholder="0.00"
                                    />
                                    <button 
                                        onClick={() => {
                                            onUpdateInitialCashback(parseFloat(tempInitial) || 0);
                                            setIsEditingInitial(false);
                                        }}
                                        className="px-3 py-1.5 bg-brand-primary text-white text-[10px] font-bold rounded-lg uppercase"
                                    >
                                        Set
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={onShowBenefitReport}
                        className="flex items-center justify-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group"
                    >
                        <HistoryIcon className="w-4 h-4 text-brand-primary group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">View Full Benefit Report</span>
                    </button>

                    {showResetConfirm ? (
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 animate-fade-in">
                            <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-2 text-center">Confirm Reset All Balances?</p>
                            <p className="text-[9px] text-red-500 dark:text-red-400/70 mb-3 text-center leading-relaxed">This will clear all transactions and reset your initial cashback to zero. This action cannot be undone.</p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setShowResetConfirm(false)}
                                    className="flex-1 p-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        onResetBalances();
                                        setShowResetConfirm(false);
                                    }}
                                    className="flex-1 p-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-red-600/20"
                                >
                                    Reset Now
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setShowResetConfirm(true)}
                            className="flex items-center justify-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all group"
                        >
                            <XCircleIcon className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Reset All Balances</span>
                        </button>
                    )}

                    {/* Benefit History Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-2">
                            <HistoryIcon className="w-4 h-4 text-slate-400" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Benefit History</p>
                        </div>
                        
                        <div className="space-y-2">
                            {benefitHistory.length > 0 ? (
                                benefitHistory.map(t => (
                                    <div key={t.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{t.description || t.category}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-medium text-slate-400 flex items-center">
                                                    <CalendarIcon className="w-2.5 h-2.5 mr-1" />
                                                    {formatDate(t.date)}
                                                </span>
                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-bold tracking-tighter">
                                                    {t.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-3">
                                            {t.cashbackAmount && t.cashbackAmount > 0 && (
                                                <p className="text-xs font-black text-green-600 dark:text-green-400">
                                                    +{formatCurrency(t.cashbackAmount)} <span className="text-[8px] uppercase tracking-tighter opacity-70">CB</span>
                                                </p>
                                            )}
                                            {t.couponUsed && t.couponUsed > 0 && (
                                                <p className="text-xs font-black text-blue-600 dark:text-blue-400">
                                                    -{formatCurrency(t.couponUsed)} <span className="text-[8px] uppercase tracking-tighter opacity-70">CPN</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <p className="text-xs text-slate-400">No benefit history found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <button onClick={onClose} className="upi-button mt-4">Back to Dashboard</button>
                </div>
            </div>
            <style>{`
                .upi-container { width: 100%; max-width: 400px; margin: auto; border-radius: 1.5rem; padding: 1rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); }
                .upi-screen { background-color: ${currentThemeColors.bgPrimary}; border-radius: 1rem; padding: 1.5rem; display: flex; flex-direction: column; color: ${currentThemeColors.textBase}; max-height: 90vh; }
                .upi-header { display: flex; align-items: center; justify-content: center; gap: 0.75rem; border-bottom: 1px solid ${currentThemeColors.borderSecondary}; padding-bottom: 1rem; margin-bottom: 1rem; flex-shrink: 0; }
                .upi-title { font-size: 1.25rem; font-weight: bold; }
                .upi-content { display: flex; flex-direction: column; gap: 1rem; }
                .upi-button { width: 100%; padding: 0.8rem; border-radius: 0.5rem; background-color: ${currentThemeColors.brandPrimary}; color: white; font-weight: bold; border: none; cursor: pointer; transition: background-color 0.2s; flex-shrink: 0; }
                .upi-button:hover { opacity: 0.9; }
                .animate-fade-in { animation: fadeIn 0.3s ease-out; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: ${currentThemeColors.borderSecondary}; border-radius: 10px; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default UpiPayment;
