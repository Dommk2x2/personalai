import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Transaction, Account, AttendanceEntry, DayPlannerEntry, SavedAmortizationSchedule,
  AttendanceStatus, ExpenseCategory, TransactionType, BudgetSetting, TodoItem,
  SubscriptionPlan, RechargePlan
} from '../types';
import YearlyFinancialGrid from './YearlyFinancialGrid';
import { useTheme } from '../contexts/ThemeContext';
import { 
  CalculatorIcon, 
  UsersIcon, 
  ListChecksIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChartIcon,
  DocumentChartBarIcon,
  BanknotesIcon,
  CalendarIcon,
  HandThumbUpIcon,
  TrophyIcon,
  ShoppingBagIcon
} from './Icons';

interface MonthlySummaryViewProps {
  transactions: Transaction[];
  accounts: Account[];
  activeAccountId: string | null;
  incomeCategories: string[];
  expenseCategories: string[];
  appTitle: string;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  attendanceEntries?: AttendanceEntry[];
  dayPlannerEntries?: DayPlannerEntry[];
  savedAmortizationSchedules?: SavedAmortizationSchedule[];
  budgets?: BudgetSetting[];
  todos?: TodoItem[];
  subscriptionPlans?: SubscriptionPlan[];
  rechargePlans?: RechargePlan[];
}

const MonthlySummaryView: React.FC<MonthlySummaryViewProps> = ({
  transactions,
  accounts,
  activeAccountId,
  incomeCategories,
  expenseCategories,
  appTitle,
  onEditTransaction,
  onDeleteTransaction,
  onUpdateTransaction,
  attendanceEntries = [],
  dayPlannerEntries = [],
  savedAmortizationSchedules = [],
  budgets = [],
  todos = [],
  subscriptionPlans = [],
  rechargePlans = []
}) => {
  const { currentThemeColors } = useTheme();
  const [showCategories, setShowCategories] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isExporting, setIsExporting] = useState(false);
  
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const filteredTransactions = useMemo(() => activeAccountId 
    ? transactions.filter(tx => tx.accountId === activeAccountId)
    : transactions
  , [transactions, activeAccountId]);

  const activeAccountName = activeAccountId 
    ? accounts.find(a => a.id === activeAccountId)?.name 
    : 'All Accounts';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Aggregated Monthly Stats
  const monthlyStats = useMemo(() => {
    const stats: Record<number, { 
      emiCount: number, 
      emiTotal: number, 
      attendance: Record<string, number>,
      planner: { completed: number, total: number },
      financial: { income: number, expense: number, initialBalance: number },
      rechargeCount: number,
      subscriptionCount: number,
      todoCount: { completed: number, total: number }
    }> = {};

    for (let i = 0; i < 12; i++) {
      stats[i] = {
        emiCount: 0,
        emiTotal: 0,
        attendance: {},
        planner: { completed: 0, total: 0 },
        financial: { income: 0, expense: 0, initialBalance: 0 },
        rechargeCount: 0,
        subscriptionCount: 0,
        todoCount: { completed: 0, total: 0 }
      };
    }

    // Sort Transactions for Balance calculation
    const currentYearTransactions = filteredTransactions.filter(tx => {
      const date = new Date(tx.date + 'T00:00:00');
      return date.getFullYear() === currentYear;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate Initial Balance for each month
    const totalInitialBalanceAcrossAccounts = accounts.filter(a => !activeAccountId || a.id === activeAccountId).reduce((sum, acc) => sum + acc.initialBalance, 0);
    const transactionsBeforeYear = filteredTransactions.filter(tx => new Date(tx.date + 'T00:00:00').getFullYear() < currentYear);
    
    let runningBalance = totalInitialBalanceAcrossAccounts;
    transactionsBeforeYear.forEach(tx => {
      if (tx.type === TransactionType.INCOME) runningBalance += tx.amount;
      else if (tx.type === TransactionType.EXPENSE) runningBalance -= tx.amount;
    });

    for (let m = 0; m < 12; m++) {
      stats[m].financial.initialBalance = runningBalance;
      
      const monthTxs = currentYearTransactions.filter(tx => new Date(tx.date + 'T00:00:00').getMonth() === m);
      monthTxs.forEach(tx => {
        if (tx.type === TransactionType.INCOME) {
          stats[m].financial.income += tx.amount;
          runningBalance += tx.amount;
        } else if (tx.type === TransactionType.EXPENSE) {
          stats[m].financial.expense += tx.amount;
          runningBalance -= tx.amount;
          
          const desc = tx.description.toLowerCase();
          if (tx.category === ExpenseCategory.EMI || tx.category === 'EMI') {
            stats[m].emiCount++;
            stats[m].emiTotal += tx.amount;
          }
          if (tx.category === 'Recharge' || desc.includes('recharge')) {
            stats[m].rechargeCount++;
          }
          if (tx.category === 'Subscription' || desc.includes('subscription') || desc.includes('netflix') || desc.includes('spotify') || desc.includes('prime')) {
            stats[m].subscriptionCount++;
          }
        }
      });
    }

    // Process Attendance
    attendanceEntries.forEach(entry => {
      const date = new Date(entry.date + 'T00:00:00');
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth();
        const status = entry.status;
        stats[month].attendance[status] = (stats[month].attendance[status] || 0) + 1;
      }
    });

    // Process Day Planner
    dayPlannerEntries.forEach(entry => {
      const date = new Date(entry.date + 'T00:00:00');
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth();
        stats[month].planner.total++;
        if (entry.completed) {
          stats[month].planner.completed++;
        }
      }
    });

    // Process Todos
    todos.forEach(todo => {
        if (!todo.createdAt) return;
        const date = new Date(todo.createdAt);
        if (date.getFullYear() === currentYear) {
            const month = date.getMonth();
            stats[month].todoCount.total++;
            if (todo.completed) stats[month].todoCount.completed++;
        }
    });

    return stats;
  }, [filteredTransactions, currentYear, attendanceEntries, dayPlannerEntries, accounts, activeAccountId, todos]);

  // Yearly Highlights Calcs
  const highlights = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalEmi = 0;
    let totalTasksTotal = 0;
    let totalTasksComp = 0;
    let totalPresent = 0;
    let totalRecharges = 0;
    let totalSubs = 0;
    let totalTodoTotal = 0;
    let totalTodoComp = 0;

    (Object.values(monthlyStats) as any[]).forEach(s => {
      totalIncome += s.financial.income;
      totalExpense += s.financial.expense;
      totalEmi += s.emiTotal;
      totalTasksTotal += s.planner.total;
      totalTasksComp += s.planner.completed;
      totalPresent += (s.attendance[AttendanceStatus.PRESENT] || 0) + (s.attendance[AttendanceStatus.WORK_FROM_HOME] || 0);
      totalRecharges += s.rechargeCount;
      totalSubs += s.subscriptionCount;
      totalTodoTotal += s.todoCount.total;
      totalTodoComp += s.todoCount.completed;
    });

    return {
      netSavings: totalIncome - totalExpense,
      emiTotal: totalEmi,
      taskRate: totalTasksTotal > 0 ? (totalTasksComp / totalTasksTotal * 100).toFixed(0) : '0',
      totalPresent,
      totalRecharges,
      totalSubs,
      todoRate: totalTodoTotal > 0 ? (totalTodoComp / totalTodoTotal * 100).toFixed(0) : '0'
    };
  }, [monthlyStats]);

  const handleDownloadPdf = () => {
    setIsExporting(true);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Helper for currency in PDF
    const formatPdfCurrency = (val: number) => `Rs ${val.toLocaleString('en-IN')}`;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text(`${appTitle} - Monthly Summary Report`, pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(`Year: ${currentYear} | Account: ${activeAccountName}`, pageWidth / 2, 28, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 35, { align: 'center' });

    // Section 1: Financial Summary
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('I. Financial Flow Summary', 14, 50);
    
    const financialData = monthNames.map((month, idx) => {
      const s = monthlyStats[idx].financial;
      const closing = s.initialBalance + s.income - s.expense;
      return [
        month,
        formatPdfCurrency(s.initialBalance),
        formatPdfCurrency(s.income),
        formatPdfCurrency(s.expense),
        formatPdfCurrency(closing)
      ];
    });

    autoTable(doc, {
      startY: 55,
      head: [['Month', 'Opening Balance', 'Total Income', 'Total Expense', 'Closing Balance']],
      body: financialData,
      theme: 'grid',
      headStyles: { fillColor: [57, 108, 240], textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right', textColor: [37, 185, 197] },
        3: { halign: 'right', textColor: [245, 0, 87] },
        4: { halign: 'right', fontStyle: 'bold' }
      }
    });

    // Section 2: Attendance Audit
    const finalY1 = (doc as any).lastAutoTable.finalY + 15;
    if (finalY1 > 250) doc.addPage();
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('II. Attendance & Leave Audit', 14, finalY1 || 50);

    const attendanceData = monthNames.map((month, idx) => {
      const stats = monthlyStats[idx].attendance;
      const leaves = (stats[AttendanceStatus.SICK_LEAVE] || 0) + (stats[AttendanceStatus.CASUAL_LEAVE] || 0);
      return [
        month,
        stats[AttendanceStatus.PRESENT] || 0,
        stats[AttendanceStatus.ABSENT] || 0,
        stats[AttendanceStatus.WORK_FROM_HOME] || 0,
        leaves
      ];
    });

    autoTable(doc, {
      startY: (finalY1 || 50) + 5,
      head: [['Month', 'Present', 'Absent', 'WFH', 'Total Leaves']],
      body: attendanceData,
      theme: 'grid',
      headStyles: { fillColor: [37, 185, 197] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center', fontStyle: 'bold' }
      }
    });

    // Section 3: EMI & Tasks
    const finalY2 = (doc as any).lastAutoTable.finalY + 15;
    if (finalY2 > 230) doc.addPage();

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('III. EMI & Task Productivity', 14, finalY2 || 50);

    const emiTaskData = monthNames.map((month, idx) => {
      const s = monthlyStats[idx];
      const rateMonth = s.planner.total > 0 ? ((s.planner.completed / s.planner.total) * 100).toFixed(0) + '%' : '0%';
      return [
        month,
        s.emiCount,
        formatPdfCurrency(s.emiTotal),
        `${s.planner.completed} / ${s.planner.total}`,
        rateMonth
      ];
    });

    autoTable(doc, {
      startY: (finalY2 || 50) + 5,
      head: [['Month', 'EMI Tx', 'EMI Total', 'Tasks (Comp/Total)', 'Success Rate']],
      body: emiTaskData,
      theme: 'grid',
      headStyles: { fillColor: [245, 184, 65] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'center' },
        4: { halign: 'center', fontStyle: 'bold' }
      }
    });

    // Footer
    const finalPageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= finalPageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${finalPageCount} | Generated by ${appTitle}`, 14, doc.internal.pageSize.getHeight() - 10);
    }

    doc.save(`${appTitle}_Full_Report_${currentYear}.pdf`);
    setIsExporting(false);
  };

  const handlePrevYear = () => setCurrentYear(prev => prev - 1);
  const handleNextYear = () => setCurrentYear(prev => prev + 1);

  const SectionHeader = ({ title, icon: Icon, color }: { title: string, icon: any, color: string }) => (
    <div className="flex items-center gap-2 mb-4 p-2 border-b" style={{ borderColor: `${color}40` }}>
      <Icon className="w-5 h-5" style={{ color }} />
      <h3 className="font-bold uppercase tracking-widest text-sm" style={{ color }}>{title}</h3>
    </div>
  );

  const SummaryCard = ({ title, value, subtext, icon: Icon, color }: { title: string, value: string, subtext: string, icon: any, color: string }) => (
    <div className="bg-bg-primary-themed p-4 rounded-xl shadow border transition-all hover:shadow-md hover:-translate-y-1" style={{ borderColor: `${color}30` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{title}</span>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-black truncate" style={{ color: currentThemeColors.textBase }}>{value}</span>
        <span className="text-[10px] font-medium opacity-60 tracking-tight h-4 overflow-hidden">{subtext}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Year Selector */}
      <div className="bg-bg-primary-themed p-6 rounded-2xl shadow-xl border overflow-hidden relative" style={{ borderColor: currentThemeColors.borderSecondary }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary opacity-5 blur-3xl -mr-16 -mt-16 rounded-full" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-2" style={{ color: currentThemeColors.textBase }}>
              Monthly Summary Snapshot
            </h2>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                {activeAccountName}
              </span>
              <p className="text-sm font-medium" style={{ color: currentThemeColors.textMuted }}>
                Yearly audit of Finance, Attendance & Productivity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-text-inverted rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg font-bold text-xs uppercase tracking-widest disabled:opacity-50"
            >
              <DocumentChartBarIcon className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Full Report PDF'}
            </button>

            <div className="flex items-center gap-4 bg-bg-accent-themed p-2 rounded-xl border border-dashed" style={{ borderColor: currentThemeColors.borderSecondary }}>
              <button 
                onClick={handlePrevYear}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                style={{ color: currentThemeColors.textBase }}
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <span className="text-2xl font-black text-brand-primary min-w-[80px] text-center">{currentYear}</span>
              <button 
                onClick={handleNextYear}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                style={{ color: currentThemeColors.textBase }}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Yearly Summary Cards - The "Snapshot" Option */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <SummaryCard 
          title="Transactions" 
          value={formatCurrency(highlights.netSavings)} 
          subtext="Total Net Savings" 
          icon={BanknotesIcon} 
          color={highlights.netSavings >= 0 ? currentThemeColors.income : currentThemeColors.expense} 
        />
        <SummaryCard 
          title="EMI Tracker" 
          value={formatCurrency(highlights.emiTotal)} 
          subtext="Total Amount Paid" 
          icon={CalculatorIcon} 
          color={currentThemeColors.expense} 
        />
        <SummaryCard 
          title="Attendance" 
          value={`${highlights.totalPresent}D`} 
          subtext="Present / WFH total" 
          icon={UsersIcon} 
          color={currentThemeColors.brandSecondary} 
        />
        <SummaryCard 
          title="Budget Plan" 
          value={formatCurrency(budgets.reduce((sum, b) => sum + b.allocated, 0))} 
          subtext="Monthly allocation total" 
          icon={ChartIcon} 
          color={currentThemeColors.brandPrimary} 
        />
        <SummaryCard 
          title="To-do Task" 
          value={`${highlights.todoRate}%`} 
          subtext="General Todo List" 
          icon={HandThumbUpIcon} 
          color={currentThemeColors.brandPrimary} 
        />
        <SummaryCard 
          title="Planner" 
          value={`${highlights.taskRate}%`} 
          subtext="Day Planner rate" 
          icon={ListChecksIcon} 
          color={currentThemeColors.brandPrimary} 
        />
        <SummaryCard 
          title="Recharge" 
          value={`${highlights.totalRecharges}`} 
          subtext="Mobile / DTH bills" 
          icon={ShoppingBagIcon} 
          color={currentThemeColors.brandPrimary} 
        />
        <SummaryCard 
          title="Subscription" 
          value={`${highlights.totalSubs}`} 
          subtext="Active streaming etc." 
          icon={TrophyIcon} 
          color={currentThemeColors.brandSecondary} 
        />
      </div>

      {/* Financial Summary Grid */}
      <div className="bg-bg-primary-themed p-6 rounded-2xl shadow-lg border" style={{ borderColor: currentThemeColors.borderSecondary }}>
        <div className="flex justify-between items-center mb-6">
          <SectionHeader title="Financial Flow" icon={ChartIcon} color={currentThemeColors.brandPrimary} />
          <div className="flex bg-bg-accent-themed rounded-lg p-1 border" style={{ borderColor: currentThemeColors.borderSecondary }}>
            <button
              onClick={() => setShowCategories(false)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${!showCategories ? 'bg-brand-primary text-text-inverted shadow-lg' : 'text-text-muted-themed hover:text-text-base-themed'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setShowCategories(true)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${showCategories ? 'bg-brand-primary text-text-inverted shadow-lg' : 'text-text-muted-themed hover:text-text-base-themed'}`}
            >
              Details
            </button>
          </div>
        </div>
        
        <YearlyFinancialGrid
          allTransactions={filteredTransactions}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
          appTitle={appTitle}
          startDate={`${currentYear}-01-01`}
          showCategories={showCategories}
          onEditTransaction={onEditTransaction}
          onDeleteTransaction={onDeleteTransaction}
          onUpdateTransaction={onUpdateTransaction}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Summary */}
        <div className="bg-bg-primary-themed p-6 rounded-2xl shadow-lg border" style={{ borderColor: currentThemeColors.borderSecondary }}>
          <SectionHeader title="Attendance Audit" icon={UsersIcon} color={currentThemeColors.brandSecondary} />
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b" style={{ borderColor: currentThemeColors.borderSecondary }}>
                  <th className="py-3 px-2 font-black uppercase tracking-widest opacity-50">Month</th>
                  <th className="py-3 px-2 font-black uppercase tracking-widest text-center" style={{ color: currentThemeColors.income }}>Pres</th>
                  <th className="py-3 px-2 font-black uppercase tracking-widest text-center" style={{ color: currentThemeColors.expense }}>Abs</th>
                  <th className="py-3 px-2 font-black uppercase tracking-widest text-center" style={{ color: currentThemeColors.brandSecondary }}>WFH</th>
                  <th className="py-3 px-2 font-black uppercase tracking-widest text-center">Leave</th>
                </tr>
              </thead>
              <tbody>
                {monthNames.map((month, idx) => {
                  const stats = monthlyStats[idx].attendance;
                  const leaves = (stats[AttendanceStatus.SICK_LEAVE] || 0) + (stats[AttendanceStatus.CASUAL_LEAVE] || 0);
                  const hasData = (Object.values(stats) as number[]).some(v => v > 0);

                  return (
                    <tr key={month} className={`border-b border-dashed last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${!hasData ? 'opacity-30' : ''}`} style={{ borderColor: currentThemeColors.borderSecondary }}>
                      <td className="py-3 px-2 font-bold" style={{ color: currentThemeColors.textBase }}>{month}</td>
                      <td className="py-3 px-2 text-center font-mono font-black" style={{ color: currentThemeColors.income }}>{stats[AttendanceStatus.PRESENT] || '-'}</td>
                      <td className="py-3 px-2 text-center font-mono font-black" style={{ color: currentThemeColors.expense }}>{stats[AttendanceStatus.ABSENT] || '-'}</td>
                      <td className="py-3 px-2 text-center font-mono font-black" style={{ color: currentThemeColors.brandSecondary }}>{stats[AttendanceStatus.WORK_FROM_HOME] || '-'}</td>
                      <td className="py-3 px-2 text-center font-mono font-black" style={{ color: currentThemeColors.textBase }}>{leaves || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* EMI & Productivity Recap */}
        <div className="space-y-8">
          {/* EMI Summary */}
          <div className="bg-bg-primary-themed p-6 rounded-2xl shadow-lg border" style={{ borderColor: currentThemeColors.borderSecondary }}>
            <SectionHeader title="EMI Tracker" icon={CalculatorIcon} color={currentThemeColors.expense} />
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b" style={{ borderColor: currentThemeColors.borderSecondary }}>
                    <th className="py-3 px-2 font-black uppercase tracking-widest opacity-50">Month</th>
                    <th className="py-3 px-2 font-black uppercase tracking-widest text-center">Count</th>
                    <th className="py-3 px-2 font-black uppercase tracking-widest text-right">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {monthNames.map((month, idx) => {
                    const stats = monthlyStats[idx];
                    const hasData = stats.emiCount > 0;

                    return (
                      <tr key={month} className={`border-b border-dashed last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${!hasData ? 'opacity-30' : ''}`} style={{ borderColor: currentThemeColors.borderSecondary }}>
                        <td className="py-3 px-2 font-bold" style={{ color: currentThemeColors.textBase }}>{month}</td>
                        <td className="py-3 px-2 text-center font-mono" style={{ color: currentThemeColors.textBase }}>{stats.emiCount || '-'}</td>
                        <td className="py-3 px-2 text-right font-mono font-black" style={{ color: stats.emiTotal > 0 ? currentThemeColors.expense : undefined }}>
                          {stats.emiTotal > 0 ? formatCurrency(stats.emiTotal) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Productivity Stats (Recharge, Subscription, Tasks) */}
          <div className="bg-bg-primary-themed p-6 rounded-2xl shadow-lg border" style={{ borderColor: currentThemeColors.borderSecondary }}>
            <SectionHeader title="Productivity & Recurring" icon={ListChecksIcon} color={currentThemeColors.brandPrimary} />
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b" style={{ borderColor: currentThemeColors.borderSecondary }}>
                    <th className="py-3 px-2 font-black uppercase tracking-widest opacity-50">Month</th>
                    <th className="py-3 px-2 font-black uppercase tracking-widest text-center">Tasks</th>
                    <th className="py-3 px-2 font-black uppercase tracking-widest text-center">Rec/Sub</th>
                    <th className="py-3 px-2 font-black uppercase tracking-widest text-right">Todo%</th>
                  </tr>
                </thead>
                <tbody>
                  {monthNames.map((month, idx) => {
                    const stats = monthlyStats[idx];
                    const hasData = stats.planner.total > 0 || stats.rechargeCount > 0 || stats.subscriptionCount > 0 || stats.todoCount.total > 0;
                    const plannerRate = stats.planner.total > 0 ? (stats.planner.completed / stats.planner.total) * 100 : 0;
                    const todoRate = stats.todoCount.total > 0 ? (stats.todoCount.completed / stats.todoCount.total) * 100 : 0;

                    return (
                      <tr key={month} className={`border-b border-dashed last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${!hasData ? 'opacity-30' : ''}`} style={{ borderColor: currentThemeColors.borderSecondary }}>
                        <td className="py-3 px-2 font-bold" style={{ color: currentThemeColors.textBase }}>{month}</td>
                        <td className="py-3 px-2 text-center font-mono">
                          <span className="text-brand-primary font-black">{stats.planner.completed}</span>
                          <span className="opacity-30 mx-1">/</span>
                          <span className="opacity-50 font-bold">{stats.planner.total}</span>
                        </td>
                        <td className="py-3 px-2 text-center font-mono">
                          <span className="text-brand-primary">{stats.rechargeCount}</span>
                          <span className="mx-1 opacity-20">|</span>
                          <span className="text-brand-secondary">{stats.subscriptionCount}</span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className="font-mono font-black" style={{ color: todoRate >= 70 ? currentThemeColors.income : todoRate >= 40 ? currentThemeColors.brandSecondary : currentThemeColors.expense }}>
                            {stats.todoCount.total > 0 ? `${todoRate.toFixed(0)}%` : '-'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlySummaryView;
