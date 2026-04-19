import React, { useMemo, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  Transaction, AttendanceEntry, DayPlannerEntry, BudgetSetting, TodoItem,
  SubscriptionPlan, RechargePlan, AttendanceStatus, TransactionType, ExpenseCategory
} from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { 
  CalculatorIcon, 
  UsersIcon, 
  ListChecksIcon, 
  BanknotesIcon,
  TrophyIcon,
  ShoppingBagIcon,
  ChartIcon,
  HandThumbUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon
} from './Icons';

interface SnapshotReportProps {
  transactions: Transaction[];
  attendanceEntries: AttendanceEntry[];
  dayPlannerEntries: DayPlannerEntry[];
  budgets: BudgetSetting[];
  todos: TodoItem[];
  subscriptionPlans: SubscriptionPlan[];
  rechargePlans: RechargePlan[];
  activeAccountId: string | null;
  appTitle?: string;
  username?: string;
  initialYear?: number;
}

type ReportViewMode = 'yearly' | 'monthly';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const SnapshotReport: React.FC<SnapshotReportProps> = ({
  transactions,
  attendanceEntries,
  dayPlannerEntries,
  budgets,
  todos,
  subscriptionPlans,
  rechargePlans,
  activeAccountId,
  appTitle = "Finance Tracker",
  username = "User",
  initialYear = new Date().getFullYear()
}) => {
  const { currentThemeColors } = useTheme();
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [viewMode, setViewMode] = useState<ReportViewMode>('yearly');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const parseYear = (dateStr: string) => {
    try {
      return new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`).getFullYear();
    } catch {
      return -1;
    }
  };

  const parseMonth = (dateStr: string) => {
    try {
      return new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`).getMonth();
    } catch {
      return -1;
    }
  };

  const stats = useMemo(() => {
    const filteredTxs = activeAccountId 
      ? transactions.filter(tx => tx.accountId === activeAccountId)
      : transactions;

    const periodTxs = filteredTxs.filter(tx => {
      if (tx.isDeleted) return false;
      const txYear = parseYear(tx.date);
      if (viewMode === 'yearly') return txYear === currentYear;
      return txYear === currentYear && parseMonth(tx.date) === currentMonth;
    });
    
    let totalIncome = 0;
    let totalExpense = 0;
    let totalEmi = 0;
    let rechargeCount = 0;
    let subscriptionCount = 0;

    periodTxs.forEach(tx => {
      if (tx.type === TransactionType.INCOME) totalIncome += tx.amount;
      else if (tx.type === TransactionType.EXPENSE) {
        totalExpense += tx.amount;
        const desc = tx.description.toLowerCase();
        if (tx.category === ExpenseCategory.EMI || tx.category === 'EMI') totalEmi += tx.amount;
        if (tx.category === 'Recharge' || desc.includes('recharge')) rechargeCount++;
        if (tx.category === 'Subscription' || desc.includes('subscription')) subscriptionCount++;
      }
    });

    const periodAttendance = attendanceEntries.filter(e => {
      const eYear = parseYear(e.date);
      if (viewMode === 'yearly') return eYear === currentYear;
      return eYear === currentYear && parseMonth(e.date) === currentMonth;
    });
    const presentDays = periodAttendance.filter(e => e.status === AttendanceStatus.PRESENT || e.status === AttendanceStatus.WORK_FROM_HOME).length;

    const periodPlanner = dayPlannerEntries.filter(e => {
      if (e.isDeleted) return false;
      const eYear = parseYear(e.date);
      if (viewMode === 'yearly') return eYear === currentYear;
      return eYear === currentYear && parseMonth(e.date) === currentMonth;
    });
    const plannerComp = periodPlanner.filter(e => e.completed).length;
    const plannerRate = periodPlanner.length > 0 ? (plannerComp / periodPlanner.length * 100).toFixed(0) : '0';

    const periodTodos = todos.filter(t => {
      if (t.isDeleted || !t.createdAt) return false;
      const tYear = parseYear(t.createdAt);
      if (viewMode === 'yearly') return tYear === currentYear;
      return tYear === currentYear && parseMonth(t.createdAt) === currentMonth;
    });
    const todoComp = periodTodos.filter(t => t.completed).length;
    const todoRate = periodTodos.length > 0 ? (todoComp / periodTodos.length * 100).toFixed(0) : '0';

    const filteredBudgets = activeAccountId 
      ? budgets.filter(b => b.accountId === activeAccountId)
      : budgets;

    return {
      netSavings: totalIncome - totalExpense,
      totalEmi,
      presentDays,
      plannerRate,
      todoRate,
      rechargeCount,
      subscriptionCount,
      totalBudget: filteredBudgets.reduce((sum, b) => sum + b.allocated, 0)
    };
  }, [transactions, attendanceEntries, dayPlannerEntries, budgets, todos, currentYear, currentMonth, viewMode, activeAccountId]);

  const handleExportPDF = async () => {
    if (!reportRef.current || isExporting) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Slightly reduced scale for better memory handling
        useCORS: true,
        backgroundColor: currentThemeColors.bgPrimary,
        onclone: (clonedDoc) => {
          // html2canvas fails on modern CSS color functions like oklch/oklab (used by Tailwind 4)
          // We inject a style block to override problematic styles for the export
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            * {
              /* Remove complex shadows that use modern color spaces */
              box-shadow: none !important;
              text-shadow: none !important;
              --tw-shadow: 0 0 #0000 !important;
              --tw-ring-color: rgba(59, 130, 246, 0.5) !important;
            }
            .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important; }
            .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important; }
            .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important; }
            /* Force clear colors for common elements */
            .bg-brand-primary { background-color: ${currentThemeColors.brandPrimary} !important; }
          `;
          clonedDoc.head.appendChild(style);
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Snapshot_Report_${viewMode === 'monthly' ? MONTH_NAMES[currentMonth] + '_' : ''}${currentYear}_${username}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const SummaryCard = ({ title, value, subtext, icon: Icon, color }: { title: string, value: string, subtext: string, icon: any, color: string }) => (
    <div className="bg-bg-primary-themed p-6 rounded-2xl shadow-lg border transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden relative" style={{ borderColor: `${color}30` }}>
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5 blur-2xl -mr-8 -mt-8 rounded-full" style={{ backgroundColor: color }} />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-xs font-black uppercase tracking-widest opacity-50">{title}</span>
        <div className="p-3 rounded-xl shadow-inner" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <div className="flex flex-col relative z-10">
        <span className="text-3xl font-black mb-1" style={{ color: currentThemeColors.textBase }}>{value}</span>
        <span className="text-xs font-semibold opacity-60 tracking-tight">{subtext}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 no-print">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black tracking-tighter" style={{ color: currentThemeColors.textBase }}>
            Executive Snapshot <span className="text-brand-primary">{viewMode === 'monthly' ? MONTH_NAMES[currentMonth] : 'Yearly'}</span>
          </h2>
          <p className="text-lg font-medium opacity-60">High-impact summary reports for performance tracking.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-bg-accent-themed p-1 rounded-2xl border border-border-primary">
            <button 
              onClick={() => setViewMode('yearly')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'yearly' ? 'bg-brand-primary text-white shadow-lg' : 'text-text-muted-themed hover:bg-black/5'}`}
            >
              Yearly
            </button>
            <button 
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'monthly' ? 'bg-brand-primary text-white shadow-lg' : 'text-text-muted-themed hover:bg-black/5'}`}
            >
              Monthly
            </button>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center gap-3 bg-bg-secondary-themed p-1.5 rounded-2xl border border-border-primary shadow-sm overflow-hidden">
            {viewMode === 'monthly' && (
              <div className="flex items-center gap-1.5 px-2 border-r border-border-primary mr-1">
                <button 
                  onClick={() => setCurrentMonth(prev => prev === 0 ? 11 : prev - 1)}
                  className="p-1.5 hover:bg-black/5 rounded-lg text-text-muted-themed"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 min-w-[100px] justify-center">
                  <CalendarDaysIcon className="w-4 h-4 text-brand-primary" />
                  <span className="text-[11px] font-black uppercase tracking-tight">{MONTH_NAMES[currentMonth].substring(0, 3)}</span>
                </div>
                <button 
                  onClick={() => setCurrentMonth(prev => prev === 11 ? 0 : prev + 1)}
                  className="p-1.5 hover:bg-black/5 rounded-lg text-text-muted-themed"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-1.5 px-2">
              <button 
                onClick={() => setCurrentYear(prev => prev - 1)}
                className="p-1.5 hover:bg-black/5 rounded-lg text-text-muted-themed"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-black text-brand-primary min-w-[60px] text-center">{currentYear}</span>
              <button 
                onClick={() => setCurrentYear(prev => prev + 1)}
                className="p-1.5 hover:bg-black/5 rounded-lg text-text-muted-themed"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {isExporting ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <ArrowDownTrayIcon className="w-4 h-4" />}
            Download PDF
          </button>
        </div>
      </div>

      {/* Report Area */}
      <div ref={reportRef} className="p-8 bg-bg-primary-themed rounded-[2.5rem] border-4 border-double shadow-2xl relative overflow-hidden" 
           style={{ borderColor: `${currentThemeColors.brandPrimary}20`, backgroundColor: currentThemeColors.bgPrimary }}>
        
        {/* Fancy Header for PDF */}
        <div className="mb-12 border-b-2 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6" style={{ borderColor: `${currentThemeColors.brandPrimary}10` }}>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-brand-primary flex items-center justify-center rotate-3 shadow-lg" style={{ backgroundColor: currentThemeColors.brandPrimary }}>
              <ChartIcon className="w-10 h-10 text-white -rotate-3" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter" style={{ color: currentThemeColors.textBase }}>{appTitle}</h1>
              <p className="text-xs font-bold uppercase tracking-widest opacity-40">System Audit Identity: {username}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="px-4 py-1.5 rounded-full border" style={{ backgroundColor: `${currentThemeColors.brandPrimary}15`, borderColor: `${currentThemeColors.brandPrimary}30` }}>
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: currentThemeColors.brandPrimary }}>
                {viewMode === 'monthly' ? `${MONTH_NAMES[currentMonth].toUpperCase()} ${currentYear}` : `FISCAL YEAR ${currentYear}`}
              </span>
            </div>
            <p className="text-[10px] font-semibold opacity-40">Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <SummaryCard 
            title="Finance Balance" 
            value={formatCurrency(stats.netSavings)} 
            subtext={viewMode === 'monthly' ? "Monthly Net Savings" : "Yearly Net Savings"} 
            icon={BanknotesIcon} 
            color={stats.netSavings >= 0 ? currentThemeColors.income : currentThemeColors.expense} 
          />
          <SummaryCard 
            title="Active Budget" 
            value={formatCurrency(stats.totalBudget)} 
            subtext="Allocated Limit" 
            icon={ChartIcon} 
            color={currentThemeColors.brandPrimary} 
          />
          <SummaryCard 
            title="EMI Installments" 
            value={formatCurrency(stats.totalEmi)} 
            subtext="Total Paid" 
            icon={CalculatorIcon} 
            color={currentThemeColors.expense} 
          />
          <SummaryCard 
            title="Attendance" 
            value={`${stats.presentDays} Days`} 
            subtext="Total Present/WFH" 
            icon={UsersIcon} 
            color={currentThemeColors.brandSecondary} 
          />
          <SummaryCard 
            title="Day Planner" 
            value={`${stats.plannerRate}%`} 
            subtext="Task Success Rate" 
            icon={ListChecksIcon} 
            color={currentThemeColors.brandPrimary} 
          />
          <SummaryCard 
            title="Productivity" 
            value={`${stats.todoRate}%`} 
            subtext="Todo Completion" 
            icon={HandThumbUpIcon} 
            color={currentThemeColors.brandSecondary} 
          />
          <SummaryCard 
            title="Utility Bills" 
            value={`${stats.rechargeCount}`} 
            subtext="Mobile/DTH Records" 
            icon={ShoppingBagIcon} 
            color={currentThemeColors.brandPrimary} 
          />
          <SummaryCard 
            title="Digital Items" 
            value={`${stats.subscriptionCount}`} 
            subtext="Subscription Tracking" 
            icon={TrophyIcon} 
            color={currentThemeColors.brandSecondary} 
          />
        </div>

        {/* Decorative Footer */}
        <div className="mt-12 flex justify-center no-print">
            <div className="px-8 py-3 bg-bg-accent-themed rounded-2xl border border-dashed text-xs font-bold opacity-50" style={{ borderColor: currentThemeColors.borderSecondary }}>
              OFFICIAL SYSTEM GENERATED REPORT CARD • SNAPSHOT AUDIT
            </div>
        </div>
      </div>

      <div className="bg-bg-accent-themed p-8 rounded-3xl border border-dashed text-center flex flex-col items-center justify-center gap-4 no-print" style={{ borderColor: currentThemeColors.borderSecondary }}>
         <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center">
            <HandThumbUpIcon className="w-8 h-8 text-brand-primary" />
         </div>
         <div className="max-w-md">
            <h3 className="text-xl font-black mb-2">Executive Overview</h3>
            <p className="text-sm opacity-60">This view provides high-level KPIs for quick analysis. To review specific transactions or granular breakdowns, please switch to the Detailed Logs.</p>
         </div>
      </div>
    </div>
  );
};

export default SnapshotReport;
