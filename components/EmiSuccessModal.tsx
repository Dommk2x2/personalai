
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SavedAmortizationSchedule } from '../types';
import { XIcon, CheckCircleIcon, CalculatorIcon, CalendarIcon, BanknotesIcon } from './Icons';

interface EmiSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    schedule: SavedAmortizationSchedule;
    amount: number;
    isFullPayment: boolean;
  } | null;
  formatCurrency: (amount: number) => string;
}

const EmiSuccessModal: React.FC<EmiSuccessModalProps> = ({ isOpen, onClose, data, formatCurrency }) => {
  if (!data) return null;

  const { schedule, amount, isFullPayment } = data;
  const totalMonths = schedule.schedule.length;
  const paidMonths = Object.values(schedule.paymentStatus || {}).filter(Boolean).length;
  
  // Calculate remaining balance
  const firstUnpaidIndex = schedule.schedule.findIndex((_, index) => !schedule.paymentStatus?.[index + 1]);
  const remainingBalance = firstUnpaidIndex !== -1 ? schedule.schedule[firstUnpaidIndex].beginningBalance : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Header with Success Animation */}
            <div className="relative h-32 bg-brand-primary flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                className="relative z-10 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
              >
                <CheckCircleIcon className="w-10 h-10 text-brand-primary" />
              </motion.div>
              
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 text-center">
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">
                {isFullPayment ? 'Loan Fully Paid!' : 'EMI Payment Recorded'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8">
                Your transaction for <span className="text-brand-primary font-bold">{schedule.loanName}</span> has been successfully recorded.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <BanknotesIcon className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount Paid</span>
                  </div>
                  <div className="text-lg font-black text-slate-700 dark:text-slate-200">
                    {formatCurrency(amount)}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <CalculatorIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Remaining</span>
                  </div>
                  <div className="text-lg font-black text-slate-700 dark:text-slate-200">
                    {formatCurrency(remainingBalance)}
                  </div>
                </div>
              </div>

              {!isFullPayment && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Progress</span>
                    <span className="text-[10px] font-black uppercase text-brand-primary tracking-widest">{paidMonths} / {totalMonths} Months</span>
                  </div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(paidMonths / totalMonths) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                      className="h-full bg-brand-primary rounded-full shadow-[0_0_10px_rgba(var(--color-brand-primary-rgb),0.3)]"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:opacity-90 transition-all active:scale-[0.98]"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EmiSuccessModal;
