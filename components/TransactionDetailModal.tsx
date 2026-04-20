import React, { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Transaction, 
  TransactionType, 
  PdfTableTheme, 
  AttendanceEntry, 
  SavedAmortizationSchedule, 
  TodoItem, 
  RechargePlan, 
  SubscriptionPlan,
  AttendanceStatus
} from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { 
  XIcon, 
  DownloadIcon, 
  PlusIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  BellIcon,
  ListChecksIcon,
  CreditCardIcon
} from './Icons';
import { LOCAL_STORAGE_PROFILE_PICTURE_KEY } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';
import { lightenHexColor } from '../utils/colorUtils';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  transactions: Transaction[];
  allTransactions?: Transaction[];
  attendanceEntries?: AttendanceEntry[];
  schedules?: SavedAmortizationSchedule[];
  todos?: TodoItem[];
  rechargePlans?: RechargePlan[];
  subscriptionPlans?: SubscriptionPlan[];
  accountName?: string;
  appTitle: string;
  showDownloadButton: boolean;
  onAddTransaction: (date: string) => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  date,
  transactions,
  allTransactions = [],
  attendanceEntries = [],
  schedules = [],
  todos = [],
  rechargePlans = [],
  subscriptionPlans = [],
  accountName,
  appTitle,
  showDownloadButton,
  onAddTransaction,
}) => {
  const { currentThemeColors } = useTheme();
  const [profilePicture] = useLocalStorage<string | null>(LOCAL_STORAGE_PROFILE_PICTURE_KEY, null);
  const [pdfStyle, setPdfStyle] = useState<PdfTableTheme>('striped');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const formattedDate = useMemo(() => {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [date]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };
  
  const handleDownloadBill = () => {
    const doc = new jsPDF();
    if (profilePicture) {
      try {
          const imageType = profilePicture.startsWith('data:image/png') ? 'PNG' : 'JPEG';
          let imgWidth = 15;
          let imgHeight = 15;
          try {
              const imgProps = doc.getImageProperties(profilePicture);
              const aspectRatio = imgProps.width / imgProps.height;
              if (aspectRatio > 1) { // Landscape
                  imgHeight = 15 / aspectRatio;
              } else { // Portrait
                  imgWidth = 15 * aspectRatio;
              }
          } catch(e) {
              console.warn("Could not get image properties for PDF, using default 1:1 aspect ratio.", e);
          }
          const xPos = doc.internal.pageSize.width - 14 - imgWidth;
          doc.addImage(profilePicture, imageType, xPos, 14, imgWidth, imgHeight);
      } catch (e) {
          console.error("Could not add profile picture to PDF:", e);
      }
    }
    const reportTitle = `${appTitle} - Transactions`;
    
    doc.setFontSize(16);
    doc.text(reportTitle, 14, 18);
    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text(`Date: ${formattedDate}`, 14, 24);
    if (accountName) {
      doc.text(`Account: ${accountName}`, 14, 29);
    }

    const tableColumn = ["Description", "Type", "Amount (INR)"];
    const tableRows: (string | number)[][] = [];

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(tx => {
        tableRows.push([
            tx.description,
            tx.type,
            formatCurrency(tx.amount).replace('₹', '').trim()
        ]);
        if (tx.type === TransactionType.INCOME) {
            totalIncome += tx.amount;
        } else {
            totalExpense += tx.amount;
        }
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: pdfStyle === 'financial' ? 'plain' : pdfStyle,
        headStyles: { fillColor: currentThemeColors.brandPrimary },
        didParseCell: (data: any) => {
          if (data.section === 'body') {
              const tx = transactions[data.row.index];
              if (pdfStyle === 'financial' && tx) {
                const isCredit = tx.type === TransactionType.INCOME;
                data.cell.styles.fillColor = isCredit ? lightenHexColor(currentThemeColors.income, 0.1) : lightenHexColor(currentThemeColors.expense, 0.1);
              }
          }
        }
    });

    let finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(11);
    doc.text(`Total Income: ${formatCurrency(totalIncome).replace('₹', '').trim()}`, 14, finalY);
    doc.text(`Total Expense: ${formatCurrency(totalExpense).replace('₹', '').trim()}`, 120, finalY);
    finalY += 6;
    doc.setFont(undefined, 'bold');
    doc.text(`Net Flow: ${formatCurrency(totalIncome - totalExpense).replace('₹', '').trim()}`, 14, finalY);

    doc.save(`Transactions_${date}_${accountName || 'account'}.pdf`);
  };

  const dayData = useMemo(() => {
    // Attendance
    const attendance = (attendanceEntries || []).find(e => e.date === date);

    // EMIs
    const dayEmis: { loanName: string; amount: number; isPaid: boolean }[] = [];
    (schedules || []).filter(s => !s.isDeleted).forEach(s => {
      s.schedule.forEach(entry => {
        if (entry.paymentDate === date) {
          dayEmis.push({
            loanName: s.loanName,
            amount: entry.emi,
            isPaid: (s.paymentStatus || {})[entry.month] || false
          });
        }
      });
    });

    // Todos
    const dayTodos = (todos || []).filter(t => !t.isDeleted && (
      (t.reminderDateTime && t.reminderDateTime.split('T')[0] === date) ||
      (!t.reminderDateTime && t.createdAt.split('T')[0] === date)
    ));

    // Reminders
    const dayReminders: { name: string; type: 'recharge' | 'subscription'; amount: number; period?: string }[] = [];
    (rechargePlans || []).filter(p => !p.isDeleted && (p.nextDueDate === date || p.lastRechargeDate === date)).forEach(p => {
      const isStart = p.lastRechargeDate === date;
      const periodStr = p.lastRechargeDate ? `Validity: ${p.lastRechargeDate} to ${p.nextDueDate}` : `Due: ${p.nextDueDate}`;
      dayReminders.push({ 
        name: p.provider + (isStart ? ' (Start)' : ' (Due)'), 
        type: 'recharge', 
        amount: p.price,
        period: periodStr
      });
    });
    (subscriptionPlans || []).filter(p => !p.isDeleted && (p.nextDueDate === date || p.lastPaymentDate === date)).forEach(p => {
      const isStart = p.lastPaymentDate === date;
      const periodStr = p.lastPaymentDate ? `Validity: ${p.lastPaymentDate} to ${p.nextDueDate}` : `Due: ${p.nextDueDate}`;
      dayReminders.push({ 
        name: p.name + (isStart ? ' (Start)' : ' (Due)'), 
        type: 'subscription', 
        amount: p.price,
        period: periodStr
      });
    });
    
    // Inferred Reminders from All Transactions
    allTransactions.filter(t => !t.isDeleted).forEach(tx => {
      const cat = tx.category?.toLowerCase() || '';
      const isRecharge = cat.includes('mobile') || cat.includes('recharge');
      const isSubscription = cat.includes('subscription') || cat.includes('renewal');

      if (isRecharge || isSubscription) {
          const startDateStr = tx.date;
          let endDateStr = startDateStr;
          
          if (tx.validityDays && tx.validityDays > 0) {
              const startDate = new Date(tx.date + 'T00:00:00');
              const endDate = new Date(startDate);
              endDate.setDate(startDate.getDate() + tx.validityDays);
              endDateStr = endDate.toISOString().split('T')[0];
          }

          if (date === startDateStr || date === endDateStr) {
              const type = isRecharge ? 'recharge' : 'subscription';
              const isStart = date === startDateStr;
              const periodStr = tx.validityDays ? `Validity: ${startDateStr} to ${endDateStr}` : `Date: ${startDateStr}`;
              
              dayReminders.push({
                  name: tx.description + (isStart ? ' (Started)' : ' (Ends)'),
                  type,
                  amount: tx.amount,
                  period: periodStr
              });
          }
      }
    });

    return { attendance, dayEmis, dayTodos, dayReminders };
  }, [date, transactions, allTransactions, attendanceEntries, schedules, todos, rechargePlans, subscriptionPlans]);

  const getAttendanceStats = () => {
    if (!dayData.attendance) return null;
    const status = dayData.attendance.status;
    switch (status) {
      case AttendanceStatus.PRESENT: return { label: 'Present', color: currentThemeColors.income, bg: `${currentThemeColors.income}15` };
      case AttendanceStatus.ABSENT: return { label: 'Absent', color: currentThemeColors.expense, bg: `${currentThemeColors.expense}15` };
      case AttendanceStatus.WEEKLY_OFF: return { label: 'Weekly Off', color: currentThemeColors.textMuted, bg: currentThemeColors.bgAccent };
      default: return { label: status, color: currentThemeColors.brandPrimary, bg: `${currentThemeColors.brandPrimary}15` };
    }
  };

  const attendanceInfo = getAttendanceStats();

  const { totalIncome, totalExpenses, netTotal } = useMemo(() => {
    const income = transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netTotal: income - expenses
    };
  }, [transactions]);

  const hasAnyData = transactions.length > 0 || dayData.attendance || dayData.dayEmis.length > 0 || dayData.dayTodos.length > 0 || dayData.dayReminders.length > 0;

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[100] transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-detail-modal-title"
    >
      <div
        className="bg-bg-secondary-themed p-5 sm:p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modalEnter flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 id="transaction-detail-modal-title" className="text-xl font-black text-text-base-themed uppercase tracking-tight">
              Insights for {formattedDate}
            </h2>
            {accountName && <p className="text-sm font-bold text-brand-primary uppercase tracking-widest mt-1">Account: {accountName}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted-themed hover:bg-bg-accent-themed hover:text-text-base-themed transition-all"
            aria-label="Close details"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 space-y-6 custom-scrollbar">
          {/* Attendance Section */}
          {attendanceInfo && (
            <section className="bg-bg-primary-themed p-4 rounded-2xl border border-border-secondary">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-text-muted-themed flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-brand-primary" />
                  Attendance Status
                </h3>
                <span 
                  className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                  style={{ backgroundColor: attendanceInfo.bg, color: attendanceInfo.color }}
                >
                  {attendanceInfo.label}
                </span>
              </div>
              {dayData.attendance?.note && (
                <p className="text-sm text-text-base-themed mt-2 italic">"{dayData.attendance.note}"</p>
              )}
            </section>
          )}

          {/* Transactions Section */}
          <section>
            <h3 className="text-xs font-black uppercase tracking-widest text-text-muted-themed flex items-center gap-2 mb-3">
              <BanknotesIcon className="w-4 h-4 text-brand-primary" />
              Transactions ({transactions.length})
            </h3>
            {transactions.length > 0 ? (
              <ul className="grid gap-3">
                {transactions.map(tx => (
                  <li key={tx.id} className="p-3 bg-bg-primary-themed rounded-xl border border-border-secondary group hover:border-brand-primary transition-all">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-text-base-themed">{tx.description}</p>
                        <p className="text-[10px] font-bold text-text-muted-themed uppercase tracking-widest">{tx.category || 'Uncategorized'}</p>
                      </div>
                      <span
                        className={`text-sm font-black transition-transform group-hover:scale-110`}
                        style={{ color: tx.type === 'income' ? currentThemeColors.income : currentThemeColors.expense }}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-border-secondary text-center">
                <p className="text-xs text-text-muted-themed font-bold uppercase tracking-widest">No financial activity</p>
              </div>
            )}
          </section>

          {/* EMI Section */}
          {dayData.dayEmis.length > 0 && (
            <section>
              <h3 className="text-xs font-black uppercase tracking-widest text-text-muted-themed flex items-center gap-2 mb-3">
                <CreditCardIcon className="w-4 h-4 text-brand-primary" />
                EMI Payments
              </h3>
              <ul className="grid gap-3">
                {dayData.dayEmis.map((emi, i) => (
                  <li key={i} className="p-3 bg-bg-primary-themed rounded-xl border border-border-secondary flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-text-base-themed">{emi.loanName}</p>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${emi.isPaid ? 'text-income' : 'text-brand-primary'}`}>
                        {emi.isPaid ? 'Paid Successfully' : 'Payment Due'}
                      </span>
                    </div>
                    <p className="text-sm font-black text-text-base-themed">{formatCurrency(emi.amount)}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Todos Section */}
          {dayData.dayTodos.length > 0 && (
            <section>
              <h3 className="text-xs font-black uppercase tracking-widest text-text-muted-themed flex items-center gap-2 mb-3">
                <ListChecksIcon className="w-4 h-4 text-brand-primary" />
                Tasks & Todos
              </h3>
              <ul className="grid gap-2">
                {dayData.dayTodos.map(todo => (
                  <li key={todo.id} className="p-3 bg-bg-primary-themed rounded-xl border border-border-secondary flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${todo.completed ? 'bg-income' : 'bg-brand-secondary'}`} />
                    <p className={`text-sm ${todo.completed ? 'line-through text-text-muted-themed' : 'text-text-base-themed font-medium'}`}>
                      {todo.text}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Reminders Section */}
          {dayData.dayReminders.length > 0 && (
            <section>
              <h3 className="text-xs font-black uppercase tracking-widest text-text-muted-themed flex items-center gap-2 mb-3">
                <BellIcon className="w-4 h-4 text-amber-500" />
                Reminders
              </h3>
              <ul className="grid gap-3">
                {dayData.dayReminders.map((rem, i) => (
                  <li key={i} className="p-3 bg-bg-primary-themed rounded-xl border border-border-secondary flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-text-base-themed">{rem.name}</p>
                      <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">{rem.type}</p>
                      {rem.period && <p className="text-[9px] text-text-muted-themed font-bold mt-1">{rem.period}</p>}
                    </div>
                    <p className="text-sm font-black text-text-base-themed">{formatCurrency(rem.amount)}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!hasAnyData && (
             <div className="py-12 text-center">
                <div className="w-16 h-16 bg-bg-accent-themed rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                    <ClockIcon className="w-8 h-8 text-text-muted-themed" />
                </div>
                <p className="text-text-muted-themed font-bold uppercase tracking-widest text-sm">No data recorded for this day</p>
             </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-border-secondary flex flex-col gap-4">
          {transactions.length > 0 && (
            <div className="bg-bg-primary-themed p-4 rounded-2xl flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted-themed">Daily Balance</p>
                <div className="flex gap-4">
                  <span className="text-xs font-black" style={{ color: currentThemeColors.income }}>In: {formatCurrency(totalIncome)}</span>
                  <span className="text-xs font-black" style={{ color: currentThemeColors.expense }}>Out: {formatCurrency(totalExpenses)}</span>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-lg font-black" style={{ color: netTotal >= 0 ? currentThemeColors.income : currentThemeColors.expense }}>
                   {formatCurrency(netTotal)}
                 </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onAddTransaction(date)}
              className="flex-1 flex items-center justify-center px-6 py-3.5 bg-brand-primary text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Record
            </button>
            {showDownloadButton && transactions.length > 0 && (
              <div className="flex gap-2">
                <select
                    value={pdfStyle}
                    onChange={(e) => setPdfStyle(e.target.value as PdfTableTheme)}
                    className="px-2 py-1 text-xs border rounded-xl focus:outline-none"
                    style={{
                        backgroundColor: currentThemeColors.bgPrimary,
                        borderColor: currentThemeColors.borderPrimary,
                        color: currentThemeColors.textBase
                    } as React.CSSProperties}
                >
                    <option value="striped">Striped</option>
                    <option value="grid">Grid</option>
                    <option value="plain">Plain</option>
                    <option value="financial">Financial</option>
                </select>
                <button
                  onClick={handleDownloadBill}
                  className="flex-1 flex items-center justify-center px-6 py-3.5 bg-cyan-500 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <DownloadIcon className="w-5 h-5 mr-2" />
                  Export
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes modalEnter {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modalEnter {
          animation: modalEnter 0.3s forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default TransactionDetailModal;