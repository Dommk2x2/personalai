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
import { motion } from 'motion/react';

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

  const [activeTab, setActiveTab] = useState<'transactions' | 'reminders' | 'summary'>('transactions');

  const checkHasReminders = (date: string, schedules: SavedAmortizationSchedule[], rechargePlans: RechargePlan[], subscriptionPlans: SubscriptionPlan[]) => {
      // EMIs
      let hasEmis = false;
      schedules.forEach(s => {
          if (s.isDeleted) return;
          s.schedule.forEach(entry => {
              if (entry.paymentDate === date) hasEmis = true;
          });
      });
      if (hasEmis) return true;

      // Recharges/Subscriptions
      const hasRecharge = rechargePlans.some(p => !p.isDeleted && (p.nextDueDate === date || p.lastRechargeDate === date));
      if (hasRecharge) return true;
      
      const hasSubscription = subscriptionPlans.some(p => !p.isDeleted && (p.nextDueDate === date || p.lastPaymentDate === date));
      if (hasSubscription) return true;

      return false;
  };

  const hasInitializedRef = React.useRef(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      
      if (!hasInitializedRef.current) {
          // Logic: prioritize reminders, otherwise transactions
          const hasReminders = checkHasReminders(date, schedules, rechargePlans, subscriptionPlans);
          setActiveTab(hasReminders ? 'reminders' : 'transactions');
          hasInitializedRef.current = true;
      }
    } else {
        hasInitializedRef.current = false;
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, date, schedules, rechargePlans, subscriptionPlans]);

  const formattedDate = useMemo(() => {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).toUpperCase();
  }, [date]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
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
      className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center p-4 z-[100] transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-detail-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-bg-secondary-themed rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="p-6 pb-2 shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 id="transaction-detail-modal-title" className="text-xl sm:text-2xl font-black text-text-base-themed uppercase tracking-tight">
                Insights for {formattedDate}
              </h2>
              {accountName && (
                <p className="text-sm font-black text-brand-primary uppercase tracking-widest mt-1">
                  Account: {accountName}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted-themed hover:bg-bg-accent-themed hover:text-text-base-themed transition-all"
              aria-label="Close details"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border-secondary px-6 shrink-0 bg-white/50 dark:bg-black/20 backdrop-blur-sm sticky top-0 z-10">
          <button 
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-4 px-4 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all relative z-20 ${activeTab === 'transactions' ? 'text-brand-primary' : 'text-text-muted-themed hover:text-text-base-themed'}`}
          >
            <BanknotesIcon className="w-4 h-4" />
            <span>Transactions</span>
            {activeTab === 'transactions' && (
              <motion.div 
                layoutId="detailTab" 
                className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary rounded-full pointer-events-none"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('reminders')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-4 px-4 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all relative z-20 ${activeTab === 'reminders' ? 'text-brand-primary' : 'text-text-muted-themed hover:text-text-base-themed'}`}
          >
            <BellIcon className="w-4 h-4" />
            <span>Reminders</span>
            {activeTab === 'reminders' && (
              <motion.div 
                layoutId="detailTab" 
                className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary rounded-full pointer-events-none"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-4 px-4 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all relative z-20 ${activeTab === 'summary' ? 'text-brand-primary' : 'text-text-muted-themed hover:text-text-base-themed'}`}
          >
            <ListChecksIcon className="w-4 h-4" />
            <span>Summary</span>
            {activeTab === 'summary' && (
              <motion.div 
                layoutId="detailTab" 
                className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary rounded-full pointer-events-none"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {activeTab === 'transactions' && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-text-muted-themed">Daily Transactions</h3>
                <span className="text-[10px] font-black text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-md">{transactions.length} items</span>
              </div>
              {transactions.length > 0 ? (
                <ul className="grid gap-3">
                  {transactions.map(tx => (
                    <li key={tx.id} className="p-4 bg-bg-primary-themed rounded-2xl border border-border-secondary group hover:border-brand-primary transition-all shadow-sm">
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
                <div className="py-12 text-center bg-bg-primary-themed rounded-2xl border border-dashed border-border-secondary">
                  <div className="w-12 h-12 bg-bg-accent-themed rounded-full flex items-center justify-center mx-auto mb-3">
                    <BanknotesIcon className="w-6 h-6 text-text-muted-themed" />
                  </div>
                  <p className="text-xs text-text-muted-themed font-bold uppercase tracking-widest">No transactions recorded</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'reminders' && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* EMI Section */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-text-muted-themed mb-4">EMI Payments</h3>
                {dayData.dayEmis.length > 0 ? (
                  <ul className="grid gap-3">
                    {dayData.dayEmis.map((emi, i) => (
                      <li key={i} className="p-4 bg-bg-primary-themed rounded-2xl border border-border-secondary flex justify-between items-center shadow-sm">
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
                ) : <p className="text-xs text-text-muted-themed text-center py-4 bg-bg-primary-themed rounded-xl border border-dashed border-border-secondary font-bold uppercase tracking-widest">No EMIs for today</p>}
              </div>

              {/* Reminders Section */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-text-muted-themed mb-4">Bills & Renewals</h3>
                {dayData.dayReminders.length > 0 ? (
                  <ul className="grid gap-3">
                    {dayData.dayReminders.map((rem, i) => (
                      <li key={i} className="p-4 bg-bg-primary-themed rounded-2xl border border-border-secondary flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${rem.type === 'recharge' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                            <BellIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-text-base-themed">{rem.name}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-70">{rem.type}</p>
                            {rem.period && <p className="text-[9px] text-text-muted-themed font-bold mt-1">{rem.period}</p>}
                          </div>
                        </div>
                        <p className="text-sm font-black text-text-base-themed">{formatCurrency(rem.amount)}</p>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-text-muted-themed text-center py-4 bg-bg-primary-themed rounded-xl border border-dashed border-border-secondary font-bold uppercase tracking-widest">No reminders for today</p>}
              </div>
            </motion.div>
          )}

          {activeTab === 'summary' && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Attendance Summary */}
              <div className="bg-bg-primary-themed p-5 rounded-2xl border border-border-secondary shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-text-muted-themed">Attendance</h3>
                  {attendanceInfo ? (
                    <span 
                      className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                      style={{ backgroundColor: attendanceInfo.bg, color: attendanceInfo.color }}
                    >
                      {attendanceInfo.label}
                    </span>
                  ) : <span className="text-[10px] font-black text-text-muted-themed uppercase tracking-widest">No Entry</span>}
                </div>
                {dayData.attendance?.note && (
                  <div className="p-3 bg-bg-accent-themed rounded-xl border border-border-primary">
                    <p className="text-sm text-text-base-themed italic">"{dayData.attendance.note}"</p>
                  </div>
                )}
              </div>

              {/* Todo List Summary */}
              <div className="bg-bg-primary-themed p-5 rounded-2xl border border-border-secondary shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-text-muted-themed mb-4">Tasks Status</h3>
                {dayData.dayTodos.length > 0 ? (
                  <ul className="space-y-3">
                    {dayData.dayTodos.map(todo => (
                      <li key={todo.id} className="flex items-center gap-3">
                        <div className={`w-1.5 h-6 rounded-full ${todo.completed ? 'bg-income' : 'bg-brand-secondary'}`} />
                        <p className={`text-sm ${todo.completed ? 'line-through text-text-muted-themed' : 'text-text-base-themed font-bold'}`}>
                          {todo.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-text-muted-themed text-center py-4 font-bold uppercase tracking-widest">No tasks for today</p>}
              </div>

              {/* Financial Snapshot */}
              {transactions.length > 0 && (
                <div className="bg-brand-primary/5 p-5 rounded-2xl border border-brand-primary/20 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary mb-4">Financial Flow</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/40 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-1">Income</p>
                      <p className="text-xl font-black text-green-600">{formatCurrency(totalIncome)}</p>
                    </div>
                    <div className="bg-white/40 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Expense</p>
                      <p className="text-xl font-black text-red-600">{formatCurrency(totalExpenses)}</p>
                    </div>
                    <div className="col-span-2 bg-brand-primary/10 p-4 rounded-xl text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-1">Net Position</p>
                      <p className="text-2xl font-black" style={{ color: netTotal >= 0 ? currentThemeColors.income : currentThemeColors.expense }}>
                        {formatCurrency(netTotal)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="p-6 bg-bg-secondary-themed border-t border-border-secondary flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onAddTransaction(date)}
              className="flex-1 flex items-center justify-center px-6 py-4 bg-brand-primary text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all shadow-brand-primary/20"
            >
              <PlusIcon className="w-5 h-5 mr-3" />
              Add Activity
            </button>
            {showDownloadButton && transactions.length > 0 && (
              <div className="flex flex-1 gap-2">
                <select
                    value={pdfStyle}
                    onChange={(e) => setPdfStyle(e.target.value as PdfTableTheme)}
                    className="flex-grow px-3 py-4 text-xs font-bold uppercase border rounded-2xl focus:outline-none shadow-sm transition-all text-center"
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
                  className="flex-grow flex items-center justify-center px-6 py-4 bg-cyan-500 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all shadow-cyan-500/20"
                >
                  <DownloadIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 20px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
        }
      `}</style>
    </div>
  );
};

export default TransactionDetailModal;