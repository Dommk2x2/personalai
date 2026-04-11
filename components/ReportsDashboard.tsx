import React, { useState, useMemo, useCallback } from 'react';
import { 
    ResponsiveContainer, LineChart, Line, AreaChart, Area, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    PieChart, Pie, Cell, Label
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { 
    Transaction, 
    TodoItem, 
    AttendanceEntry, 
    SavedAmortizationSchedule,
    Account,
    BudgetSetting,
    TransactionType,
    UpcomingPayment,
    AppMode,
    CustomReminder,
    PdfTableTheme
} from '../types';
import { 
    DocumentChartBarIcon, 
    BanknotesIcon, 
    CreditCardIcon,
    ChartIcon,
    CalculatorIcon,
    TargetIcon,
    HistoryIcon,
    CalendarDaysIcon,
    Squares2X2Icon,
    XIcon,
    ClockIcon,
    DownloadIcon,
    HomeIcon
} from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import { formatDateToYYYYMMDD, formatDateDisplay } from '../utils/dateUtils';
import DateFilter, { FilterPeriod } from './DateFilter';
import { hexToRgba, lightenHexColor } from '../utils/colorUtils';
import YearlyReports from './YearlyReports';

interface ReportsDashboardProps {
    transactions: Transaction[];
    accounts: Account[];
    activeAccount?: Account;
    todos?: TodoItem[];
    attendanceEntries?: AttendanceEntry[];
    monthlySalary?: number | null;
    savedAmortizationSchedules?: SavedAmortizationSchedule[];
    activeAccountName?: string;
    recurringReminders?: CustomReminder[];
    upcomingPayments?: UpcomingPayment[];
    appTitle: string;
    budgetSettings: BudgetSetting[];
    financialMonthStartDay: number;
    financialMonthEndDay: number;
    incomeCategories: string[];
    expenseCategories: string[];
    selectedWeeklyOffDay?: number;
    activeMode?: AppMode;
    defaultDashboardPeriod?: FilterPeriod;
    onGoHome?: () => void;
}

type ReportSubView = 'finance' | 'attendance' | 'emi' | 'todo' | 'yearly';

const MetricBox: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => {
    return (
        <div className="bg-bg-secondary-themed rounded-xl shadow-md overflow-hidden border border-border-primary flex flex-col h-full min-h-[160px] justify-center items-center relative">
            <div className="absolute top-0 left-0 w-full h-[6px] rounded-t-xl" style={{ backgroundColor: color }}></div>
            <div className="p-4 flex flex-col items-center justify-center text-center">
                <p className="text-3xl font-black text-text-base-themed mb-2 leading-none">{value}</p>
                <p className="text-[11px] font-bold text-text-muted-themed uppercase tracking-[0.15em] leading-none">{label}</p>
            </div>
        </div>
    );
};

const NavBox: React.FC<{ label: string; icon: React.FC<any>; active: boolean; onClick: () => void }> = ({ label, icon: Icon, active, onClick }) => {
    const { currentThemeColors } = useTheme();
    return (
        <button 
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                active 
                ? 'bg-brand-primary text-white border-brand-primary shadow-lg scale-105' 
                : 'bg-bg-secondary-themed text-text-muted-themed border-border-primary hover:border-brand-primary/50'
            }`}
        >
            <Icon className={`w-6 h-6 mb-2 ${active ? 'text-white' : 'text-brand-primary'}`} />
            <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        </button>
    );
};

const DrillDownModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    transactions: Transaction[];
    formatCurrency: (amount: number) => string;
    appTitle: string;
}> = ({ isOpen, onClose, title, transactions, formatCurrency, appTitle }) => {
    const { currentThemeColors } = useTheme();
    const [pdfStyle, setPdfStyle] = useState<PdfTableTheme>('financial');

    if (!isOpen) return null;

    const safeTxs = transactions ?? [];
    const totalAmount = safeTxs.reduce((sum, tx) => sum + tx.amount, 0);

    const handleDownloadPdf = () => {
        try {
            const doc = new jsPDF();
            const reportTitle = `${appTitle} - Breakdown for ${title}`;
            const generatedDateTime = new Date().toLocaleString('en-IN', { 
                year: 'numeric', month: 'long', day: 'numeric', 
                hour: '2-digit', minute: '2-digit', hour12: true 
            });

            doc.setFontSize(18);
            doc.text(reportTitle, 14, 20);
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated: ${generatedDateTime}`, 14, 26);

            const tableColumn = ["Date", "Description", "Category", "Amount (INR)"];
            const tableRows = safeTxs.map(tx => [
                formatDateDisplay(tx.date),
                tx.description,
                tx.category || '-',
                formatCurrency(tx.amount).replace('₹', '').trim()
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 32,
                theme: pdfStyle === 'financial' ? 'plain' : pdfStyle,
                headStyles: { fillColor: currentThemeColors.brandPrimary },
                didParseCell: (data: any) => {
                    if (data.section === 'body' && pdfStyle === 'financial') {
                        data.cell.styles.fillColor = lightenHexColor(currentThemeColors.expense, 0.1);
                    }
                },
                columnStyles: {
                    3: { halign: 'right' }
                }
            });

            const finalY = (doc as any).lastAutoTable.finalY + 10;
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`Aggregate Spent: Rs ${formatCurrency(totalAmount).replace('₹', '').trim()}`, 14, finalY);
            doc.text(`Total Transactions: ${safeTxs.length}`, 14, finalY + 6);

            doc.save(`Breakdown_${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (e) {
            console.error("Error generating PDF:", e);
            alert("Error generating PDF report.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-bg-secondary-themed w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-modal-enter border border-border-primary"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-border-secondary flex justify-between items-center bg-bg-primary-themed">
                    <div>
                        <h3 className="text-xl font-black text-text-base-themed uppercase tracking-tight">{title}</h3>
                        <p className="text-xs text-text-muted-themed font-bold uppercase tracking-widest mt-1">Transaction Breakdown</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2">
                            <select
                                value={pdfStyle}
                                onChange={(e) => setPdfStyle(e.target.value as PdfTableTheme)}
                                className="px-2 py-1 text-[10px] font-bold uppercase border rounded-lg focus:outline-none focus:ring-1 bg-bg-secondary-themed border-border-secondary text-text-muted-themed"
                            >
                                <option value="striped">Striped</option>
                                <option value="grid">Grid</option>
                                <option value="plain">Plain</option>
                                <option value="financial">Financial</option>
                            </select>
                            <button 
                                onClick={handleDownloadPdf}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase rounded-lg text-white bg-brand-secondary shadow-sm hover:opacity-90 transition-opacity"
                            >
                                <DownloadIcon className="w-3.5 h-3.5" />
                                PDF
                            </button>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-bg-accent-themed rounded-full transition-colors text-text-muted-themed hover:text-text-base-themed">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    {safeTxs.length > 0 ? (
                        safeTxs.map(tx => (
                            <div key={tx.id} className="flex justify-between items-center p-4 rounded-xl bg-bg-primary-themed border border-border-secondary hover:border-brand-primary/30 transition-all group">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="p-2.5 bg-bg-secondary-themed rounded-lg shadow-sm border border-border-secondary text-text-muted-themed group-hover:text-brand-primary transition-colors">
                                        <ClockIcon className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-text-base-themed truncate">{tx.description}</p>
                                        <p className="text-[11px] font-bold text-text-muted-themed uppercase tracking-wider">{formatDateDisplay(tx.date)}</p>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <p className="text-base font-black text-rose-500">-{formatCurrency(tx.amount)}</p>
                                    <p className="text-[10px] font-bold text-text-muted-themed uppercase tracking-widest">{tx.category}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center">
                            <DocumentChartBarIcon className="w-16 h-16 mx-auto text-text-muted-themed mb-4 opacity-50" />
                            <p className="text-text-muted-themed font-bold uppercase tracking-widest">No transactions found</p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-bg-primary-themed border-t border-border-secondary flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black text-text-muted-themed uppercase tracking-widest">Total Count</p>
                        <p className="text-lg font-black text-text-base-themed">{safeTxs.length} Items</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-text-muted-themed uppercase tracking-widest">Aggregate Spent</p>
                        <p className="text-2xl font-black text-rose-500">₹{formatCurrency(totalAmount)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReportsDashboard: React.FC<ReportsDashboardProps> = (props) => {
    const {
        transactions: allTransactions,
        accounts,
        activeAccount,
        budgetSettings,
        financialMonthStartDay,
        financialMonthEndDay,
        defaultDashboardPeriod,
        activeMode,
        incomeCategories,
        expenseCategories,
        appTitle,
        attendanceEntries,
        onGoHome
    } = props;

    const { currentThemeColors, theme } = useTheme();
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [activeSubView, setActiveSubView] = useState<ReportSubView>('finance');
    
    // State for Drill Down Modal
    const [drillDownInfo, setDrillDownInfo] = useState<{ title: string; type: 'category' | 'supplier'; value: string } | null>(null);

    const handleDateRangeChange = useCallback((start: string | null, end: string | null) => {
        setStartDate(start);
        setEndDate(end);
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'decimal', minimumFractionDigits: 0 }).format(Math.round(Math.abs(amount)));
    };

    const safeAllTransactions = allTransactions ?? [];

    const filteredTransactionsForDrillDown = useMemo(() => {
        if (!drillDownInfo) return [];
        return safeAllTransactions.filter(tx => {
            const matchesAccount = !activeAccount || tx.accountId === activeAccount.id;
            const matchesDate = (!startDate || tx.date >= startDate) && (!endDate || tx.date <= endDate);
            const matchesDeleted = !tx.isDeleted;
            const matchesType = tx.type === 'expense';
            
            let matchesCriteria = false;
            if (drillDownInfo.type === 'category') {
                matchesCriteria = (tx.category || 'Other') === drillDownInfo.value;
            } else {
                matchesCriteria = tx.description === drillDownInfo.value;
            }

            return matchesAccount && matchesDate && matchesDeleted && matchesType && matchesCriteria;
        }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    }, [safeAllTransactions, activeAccount, startDate, endDate, drillDownInfo]);

    const dashboardData = useMemo(() => {
        const filteredTxs = safeAllTransactions.filter(tx => {
            const matchesAccount = !activeAccount || tx.accountId === activeAccount.id;
            const matchesDate = (!startDate || tx.date >= startDate) && (!endDate || tx.date <= endDate);
            return matchesAccount && matchesDate && !tx.isDeleted;
        });

        const totalIncome = (filteredTxs ?? []).filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpenses = (filteredTxs ?? []).filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        
        const netBalance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;
        const percentSpent = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

        const monthlyMap: Record<string, number> = {};
        (filteredTxs ?? []).filter(t => t.type === 'expense').forEach(tx => {
            const m = tx.date.substring(0, 7);
            monthlyMap[m] = (monthlyMap[m] || 0) + tx.amount;
        });
        const monthlyTrend = Object.entries(monthlyMap).map(([m, val]) => ({
            name: new Date(m + '-02').toLocaleString('default', { month: 'short' }),
            value: val
        })).sort((a,b) => (a.name || '').localeCompare(b.name || ''));

        const catMap: Record<string, number> = {};
        (filteredTxs ?? []).filter(t => t.type === 'expense').forEach(tx => {
            const c = tx.category || 'Other';
            catMap[c] = (catMap[c] || 0) + tx.amount;
        });
        const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

        const supplierMap: Record<string, number> = {};
        (filteredTxs ?? []).filter(t => t.type === 'expense').forEach(tx => {
            supplierMap[tx.description] = (supplierMap[tx.description] || 0) + tx.amount;
        });
        const supplierData = Object.entries(supplierMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

        return {
            totalIncome, totalExpenses, netBalance, savingsRate, percentSpent,
            monthlyTrend, categoryData, supplierData
        };
    }, [safeAllTransactions, activeAccount, startDate, endDate]);

    const handleBarClick = (data: any, type: 'category' | 'supplier') => {
        if (data && data.name) {
            setDrillDownInfo({
                title: data.name,
                type: type,
                value: data.name
            });
        }
    };

    const panelHeaderClasses = "text-[10px] font-black text-text-muted-themed uppercase tracking-[0.2em] flex items-center gap-2 mb-8";

    const attendanceStats = useMemo(() => {
        if (!attendanceEntries || attendanceEntries.length === 0) return null;
        
        const filtered = attendanceEntries.filter(e => {
            const matchesDate = (!startDate || e.date >= startDate) && (!endDate || e.date <= endDate);
            return matchesDate && !e.isDeleted;
        });

        const present = filtered.filter(e => e.status === 'Present').length;
        const absent = filtered.filter(e => e.status === 'Absent').length;
        const leave = filtered.filter(e => e.status === 'Leave').length;
        const halfDay = filtered.filter(e => e.status === 'Half Day').length;
        const weeklyOff = filtered.filter(e => e.status === 'Weekly Off').length;
        const holiday = filtered.filter(e => e.status === 'Holiday').length;

        const totalWorkingDays = present + halfDay;
        const attendanceRate = filtered.length > 0 ? (totalWorkingDays / (filtered.length - weeklyOff - holiday)) * 100 : 0;

        const statusData = [
            { name: 'Present', value: present, color: '#22c55e' },
            { name: 'Absent', value: absent, color: '#ef4444' },
            { name: 'Leave', value: leave, color: '#f59e0b' },
            { name: 'Half Day', value: halfDay, color: '#3b82f6' },
            { name: 'Weekly Off', value: weeklyOff, color: '#94a3b8' },
            { name: 'Holiday', value: holiday, color: '#8b5cf6' }
        ].filter(d => d.value > 0);

        return { present, absent, leave, halfDay, weeklyOff, holiday, attendanceRate, statusData, totalCount: filtered.length };
    }, [attendanceEntries, startDate, endDate]);

    const emiStats = useMemo(() => {
        if (!props.savedAmortizationSchedules || props.savedAmortizationSchedules.length === 0) return null;
        
        const activeSchedules = props.savedAmortizationSchedules.filter(s => !s.isDeleted);
        const totalLoanAmount = activeSchedules.reduce((sum, s) => sum + s.loanAmount, 0);
        const totalInterest = activeSchedules.reduce((sum, s) => sum + s.totalInterest, 0);
        const totalRepayment = totalLoanAmount + totalInterest;
        
        let totalPaid = 0;
        activeSchedules.forEach(s => {
            const paidEntries = s.schedule.filter(e => e.isPaid);
            totalPaid += paidEntries.reduce((sum, e) => sum + e.emiAmount, 0);
        });

        const progress = totalRepayment > 0 ? (totalPaid / totalRepayment) * 100 : 0;

        return { totalLoanAmount, totalInterest, totalRepayment, totalPaid, progress, count: activeSchedules.length };
    }, [props.savedAmortizationSchedules]);

    const todoStats = useMemo(() => {
        if (!props.todos || props.todos.length === 0) return null;
        
        const activeTodos = props.todos.filter(t => !t.isDeleted);
        const completed = activeTodos.filter(t => t.isCompleted).length;
        const pending = activeTodos.length - completed;
        const completionRate = activeTodos.length > 0 ? (completed / activeTodos.length) * 100 : 0;

        const priorityMap: Record<string, number> = {};
        activeTodos.forEach(t => {
            const p = t.priority || 'Normal';
            priorityMap[p] = (priorityMap[p] || 0) + 1;
        });
        const priorityData = Object.entries(priorityMap).map(([name, value]) => ({ name, value }));

        return { total: activeTodos.length, completed, pending, completionRate, priorityData };
    }, [props.todos]);

    const renderView = () => {
        switch (activeSubView) {
            case 'finance':
                return (
                    <div className="space-y-6 animate-fade-in">
                        {/* Top Metrics Row */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <MetricBox label="Total Income" value={formatCurrency(dashboardData.totalIncome)} color="#22c55e" />
                            <MetricBox label="Total Expenses" value={formatCurrency(dashboardData.totalExpenses)} color="#ef4444" />
                            
                            {/* Central Gauge */}
                            <div className="bg-bg-secondary-themed rounded-xl shadow-md border border-border-primary p-4 flex flex-col items-center justify-center relative min-h-[160px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[{ value: dashboardData.percentSpent }, { value: Math.max(0, 100 - dashboardData.percentSpent) }]}
                                            innerRadius="70%" outerRadius="90%" paddingAngle={0} dataKey="value" startAngle={90} endAngle={-270}
                                            stroke="none"
                                        >
                                            <Cell fill={currentThemeColors.brandPrimary} />
                                            <Cell fill={theme.mode === 'dark' ? '#334155' : '#f1f5f9'} />
                                            <Label 
                                                value={`${Math.round(dashboardData.percentSpent)}%`} 
                                                position="center" 
                                                className="font-black text-2xl fill-text-base-themed" 
                                                style={{ fontSize: '24px', fontWeight: '900' }} 
                                            />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="mt-2 text-[10px] font-bold text-text-muted-themed uppercase tracking-widest">% Income Spent</div>
                            </div>

                            <MetricBox label="Net Balance" value={formatCurrency(dashboardData.netBalance)} color={dashboardData.netBalance >= 0 ? "#22c55e" : "#ef4444"} />
                            <MetricBox label="Savings Rate" value={`${Math.round(dashboardData.savingsRate)}%`} color="#3b82f6" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-bg-secondary-themed p-8 rounded-xl shadow-md border border-border-primary">
                                <h3 className={panelHeaderClasses}><HistoryIcon className="w-4 h-4 text-brand-primary" />Monthly Project Expenses</h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={dashboardData.monthlyTrend}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.mode === 'dark' ? '#334155' : '#f1f5f9'} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                            <Line type="monotone" dataKey="value" stroke={currentThemeColors.brandPrimary} strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-bg-secondary-themed p-8 rounded-xl shadow-md border border-border-primary">
                                <h3 className={panelHeaderClasses}><BanknotesIcon className="w-4 h-4 text-brand-primary" />Balance Trend</h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={dashboardData.monthlyTrend}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.mode === 'dark' ? '#334155' : '#f1f5f9'} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                            <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-bg-secondary-themed p-8 rounded-xl shadow-md border border-border-primary min-h-[400px]">
                                <h3 className={panelHeaderClasses}><TargetIcon className="w-4 h-4 text-brand-primary" />Expense by Category</h3>
                                <div className="overflow-y-auto max-h-[500px] pr-2">
                                    <ResponsiveContainer width="100%" height={Math.max(300, dashboardData.categoryData.length * 40)}>
                                        <BarChart layout="vertical" data={dashboardData.categoryData} margin={{ left: 40, right: 80 }}>
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} width={100} />
                                            <Tooltip cursor={{ fill: 'transparent' }} formatter={(v: number) => ['₹' + formatCurrency(v), 'Total']} />
                                            <Bar 
                                                dataKey="value" 
                                                fill="#4285f4" 
                                                radius={[0, 6, 6, 0]} 
                                                barSize={12} 
                                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={(data) => handleBarClick(data, 'category')}
                                                label={{ 
                                                    position: 'right', 
                                                    formatter: (v: number) => '₹' + formatCurrency(v), 
                                                    fontSize: 11, 
                                                    fill: '#4285f4', 
                                                    fontWeight: '900',
                                                    offset: 10
                                                }} 
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-[9px] text-center text-text-muted-themed font-bold uppercase tracking-widest mt-4">Tip: Click on a bar to see transaction list</p>
                            </div>

                            <div className="bg-bg-secondary-themed p-8 rounded-xl shadow-md border border-border-primary min-h-[400px]">
                                <h3 className={panelHeaderClasses}><CalculatorIcon className="w-4 h-4 text-brand-primary" />Expense by Supplier</h3>
                                <div className="overflow-y-auto max-h-[500px] pr-2">
                                    <ResponsiveContainer width="100%" height={Math.max(300, dashboardData.supplierData.length * 40)}>
                                        <BarChart layout="vertical" data={dashboardData.supplierData} margin={{ left: 40, right: 80 }}>
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} width={100} />
                                            <Tooltip cursor={{ fill: 'transparent' }} formatter={(v: number) => ['₹' + formatCurrency(v), 'Total']} />
                                            <Bar 
                                                dataKey="value" 
                                                fill="#ea4335" 
                                                radius={[0, 6, 6, 0]} 
                                                barSize={12} 
                                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={(data) => handleBarClick(data, 'supplier')}
                                                label={{ 
                                                    position: 'right', 
                                                    formatter: (v: number) => '₹' + formatCurrency(v), 
                                                    fontSize: 11, 
                                                    fill: '#ea4335', 
                                                    fontWeight: '900',
                                                    offset: 10
                                                }} 
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-[9px] text-center text-text-muted-themed font-bold uppercase tracking-widest mt-4">Tip: Click on a bar to see transaction list</p>
                            </div>
                        </div>
                    </div>
                );
            case 'attendance':
                return (
                    <div className="space-y-6 animate-fade-in">
                        {attendanceStats ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <MetricBox label="Present Days" value={attendanceStats.present.toString()} color="#22c55e" />
                                    <MetricBox label="Absent Days" value={attendanceStats.absent.toString()} color="#ef4444" />
                                    <MetricBox label="Leave Days" value={attendanceStats.leave.toString()} color="#f59e0b" />
                                    <MetricBox label="Attendance Rate" value={`${Math.round(attendanceStats.attendanceRate)}%`} color="#3b82f6" />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-bg-secondary-themed p-8 rounded-xl shadow-md border border-border-primary">
                                        <h3 className={panelHeaderClasses}><CalendarDaysIcon className="w-4 h-4 text-brand-primary" />Attendance Distribution</h3>
                                        <div className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={attendanceStats.statusData}
                                                        cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                                                        paddingAngle={5} dataKey="value"
                                                    >
                                                        {attendanceStats.statusData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-4 mt-4">
                                            {attendanceStats.statusData.map((d, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                                                    <span className="text-[10px] font-bold text-text-muted-themed uppercase">{d.name}: {d.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-bg-secondary-themed p-8 rounded-xl shadow-md border border-border-primary">
                                        <h3 className={panelHeaderClasses}><ChartIcon className="w-4 h-4 text-brand-primary" />Attendance Summary</h3>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-bg-primary-themed rounded-lg border border-border-secondary">
                                                <p className="text-xs font-bold text-text-muted-themed uppercase tracking-widest mb-1">Total Tracked Days</p>
                                                <p className="text-2xl font-black text-text-base-themed">{attendanceStats.totalCount}</p>
                                            </div>
                                            <div className="p-4 bg-bg-primary-themed rounded-lg border border-border-secondary">
                                                <p className="text-xs font-bold text-text-muted-themed uppercase tracking-widest mb-1">Weekly Offs</p>
                                                <p className="text-2xl font-black text-slate-500">{attendanceStats.weeklyOff}</p>
                                            </div>
                                            <div className="p-4 bg-bg-primary-themed rounded-lg border border-border-secondary">
                                                <p className="text-xs font-bold text-text-muted-themed uppercase tracking-widest mb-1">Public Holidays</p>
                                                <p className="text-2xl font-black text-purple-500">{attendanceStats.holiday}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="py-20 text-center bg-bg-secondary-themed rounded-xl border border-border-primary">
                                <CalendarDaysIcon className="w-16 h-16 mx-auto text-text-muted-themed mb-4 opacity-50" />
                                <p className="text-text-muted-themed font-bold uppercase tracking-widest">No attendance data found for this period</p>
                            </div>
                        )}
                    </div>
                );
            case 'emi':
                return (
                    <div className="space-y-6 animate-fade-in">
                        {emiStats ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <MetricBox label="Total Loan Amount" value={formatCurrency(emiStats.totalLoanAmount)} color="#3b82f6" />
                                    <MetricBox label="Total Interest" value={formatCurrency(emiStats.totalInterest)} color="#f59e0b" />
                                    <MetricBox label="Total Paid" value={formatCurrency(emiStats.totalPaid)} color="#22c55e" />
                                    <MetricBox label="Repayment Progress" value={`${Math.round(emiStats.progress)}%`} color="#8b5cf6" />
                                </div>
                                <div className="bg-bg-secondary-themed p-8 rounded-xl shadow-md border border-border-primary">
                                    <h3 className={panelHeaderClasses}><CalculatorIcon className="w-4 h-4 text-brand-primary" />Repayment Overview</h3>
                                    <div className="h-[300px] flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Paid', value: emiStats.totalPaid },
                                                        { name: 'Remaining', value: emiStats.totalRepayment - emiStats.totalPaid }
                                                    ]}
                                                    cx="50%" cy="50%" innerRadius={80} outerRadius={120}
                                                    paddingAngle={5} dataKey="value"
                                                >
                                                    <Cell fill="#22c55e" />
                                                    <Cell fill={theme.mode === 'dark' ? '#334155' : '#f1f5f9'} />
                                                    <Label 
                                                        value={`${Math.round(emiStats.progress)}%`} 
                                                        position="center" 
                                                        className="font-black text-3xl fill-text-base-themed" 
                                                    />
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="text-center mt-4">
                                        <p className="text-sm font-bold text-text-muted-themed uppercase tracking-widest">Active Loan Schedules: {emiStats.count}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="py-20 text-center bg-bg-secondary-themed rounded-xl border border-border-primary">
                                <CalculatorIcon className="w-16 h-16 mx-auto text-text-muted-themed mb-4 opacity-50" />
                                <p className="text-text-muted-themed font-bold uppercase tracking-widest">No active EMI schedules found</p>
                            </div>
                        )}
                    </div>
                );
            case 'todo':
                return (
                    <div className="space-y-6 animate-fade-in">
                        {todoStats ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <MetricBox label="Total Tasks" value={todoStats.total.toString()} color="#3b82f6" />
                                    <MetricBox label="Completed" value={todoStats.completed.toString()} color="#22c55e" />
                                    <MetricBox label="Pending" value={todoStats.pending.toString()} color="#f59e0b" />
                                    <MetricBox label="Completion Rate" value={`${Math.round(todoStats.completionRate)}%`} color="#8b5cf6" />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-bg-secondary-themed p-8 rounded-xl shadow-md border border-border-primary">
                                        <h3 className={panelHeaderClasses}><TargetIcon className="w-4 h-4 text-brand-primary" />Task Priority Distribution</h3>
                                        <div className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={todoStats.priorityData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.mode === 'dark' ? '#334155' : '#f1f5f9'} />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                    <Tooltip />
                                                    <Bar dataKey="value" fill={currentThemeColors.brandPrimary} radius={[6, 6, 0, 0]} barSize={40} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div className="bg-bg-secondary-themed p-8 rounded-xl shadow-md border border-border-primary">
                                        <h3 className={panelHeaderClasses}><ChartIcon className="w-4 h-4 text-brand-primary" />Task Productivity</h3>
                                        <div className="flex items-center justify-center h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: 'Completed', value: todoStats.completed },
                                                            { name: 'Pending', value: todoStats.pending }
                                                        ]}
                                                        cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                                                        paddingAngle={5} dataKey="value"
                                                    >
                                                        <Cell fill="#22c55e" />
                                                        <Cell fill="#f59e0b" />
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="py-20 text-center bg-bg-secondary-themed rounded-xl border border-border-primary">
                                <TargetIcon className="w-16 h-16 mx-auto text-text-muted-themed mb-4 opacity-50" />
                                <p className="text-text-muted-themed font-bold uppercase tracking-widest">No task data found</p>
                            </div>
                        )}
                    </div>
                );
            case 'yearly':
                return (
                    <div className="bg-bg-secondary-themed p-6 rounded-xl shadow-md border border-border-primary animate-fade-in">
                        <YearlyReports 
                            allTransactions={safeAllTransactions}
                            accounts={accounts ?? []}
                            attendanceEntries={attendanceEntries ?? []}
                            incomeCategories={incomeCategories ?? []}
                            expenseCategories={expenseCategories ?? []}
                            appTitle={appTitle}
                            startDate={startDate}
                            endDate={endDate}
                            periodLabel={dashboardData.totalExpenses > 0 ? 'Custom Range' : 'All Time'}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
            {/* Header / Filter Row */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-bg-secondary-themed p-4 rounded-xl shadow-sm border border-border-primary">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onGoHome}
                        className="p-2 hover:bg-bg-accent-themed rounded-lg transition-colors text-text-muted-themed group"
                        title="Back to Finance Home"
                    >
                        <HomeIcon className="w-6 h-6 group-hover:text-brand-primary" />
                    </button>
                    <div className="p-2 bg-brand-primary/10 rounded-lg">
                        <DocumentChartBarIcon className="w-6 h-6 text-brand-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-text-base-themed">Professional Analytics Dashboard</h2>
                </div>
                <DateFilter 
                    onDateRangeChange={handleDateRangeChange}
                    defaultPeriod={defaultDashboardPeriod}
                    financialMonthStartDay={financialMonthStartDay}
                    financialMonthEndDay={financialMonthEndDay}
                    financialYearStartMonth={1}
                    financialYearStartDay={1}
                    financialYearEndMonth={12}
                    financialYearEndDay={31}
                    activeMode={activeMode}
                />
            </div>

            {/* Sub-Navigation Row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-4xl mx-auto">
                <NavBox label="Finance" icon={BanknotesIcon} active={activeSubView === 'finance'} onClick={() => setActiveSubView('finance')} />
                <NavBox label="Attendance" icon={CalendarDaysIcon} active={activeSubView === 'attendance'} onClick={() => setActiveSubView('attendance')} />
                <NavBox label="EMI/Loans" icon={CalculatorIcon} active={activeSubView === 'emi'} onClick={() => setActiveSubView('emi')} />
                <NavBox label="Tasks" icon={TargetIcon} active={activeSubView === 'todo'} onClick={() => setActiveSubView('todo')} />
                <NavBox label="Yearly" icon={HistoryIcon} active={activeSubView === 'yearly'} onClick={() => setActiveSubView('yearly')} />
            </div>

            {/* Active View Content */}
            {renderView()}

            {/* Drill Down Modal */}
            <DrillDownModal 
                isOpen={!!drillDownInfo}
                onClose={() => setDrillDownInfo(null)}
                title={drillDownInfo?.title || ''}
                transactions={filteredTransactionsForDrillDown}
                formatCurrency={formatCurrency}
                appTitle={appTitle}
            />

            <footer className="pt-8 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    Analytics System v2.5 | {activeSubView.toUpperCase()} MODE ACTIVE
                </p>
            </footer>
        </div>
    );
};

export default ReportsDashboard;