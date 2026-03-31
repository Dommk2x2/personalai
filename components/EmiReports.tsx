
import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SavedAmortizationSchedule, PdfTableTheme } from '../types';
import { EditIcon, TrashIcon, ChartIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ChevronDownIcon, DownloadIcon, EyeIcon, XIcon, DocumentChartBarIcon, SparklesIcon, CheckCircleIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import { formatDateDisplay } from '../utils/dateUtils';
import useLocalStorage from '../hooks/useLocalStorage';
import { LOCAL_STORAGE_PROFILE_PICTURE_KEY } from '../constants';
import { lightenHexColor } from '../utils/colorUtils';
import ConfirmationModal from './ConfirmationModal';

interface EmiDashboardProps {
  schedules: SavedAmortizationSchedule[];
  onLoadSchedule: (scheduleId: string) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  appTitle: string;
}

type SortableKeys = 'loanName' | 'startDate' | 'principal' | 'calculatedEmi' | 'createdAt';

// Converting to named export to match project conventions and fix default import errors
export const EmiDashboard: React.FC<EmiDashboardProps> = ({ schedules, onLoadSchedule, onDeleteSchedule, appTitle }) => {
    const { currentThemeColors } = useTheme();
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'asc' | 'desc' } | null>({ key: 'createdAt', direction: 'desc' });
    const [pdfStyle, setPdfStyle] = useState<PdfTableTheme>('grid');
    const [profilePicture] = useLocalStorage<string | null>(LOCAL_STORAGE_PROFILE_PICTURE_KEY, null);

    const nonDeletedSchedules = useMemo(() => {
        // FIX: Use Array.isArray for robust handling of potentially corrupted localStorage data.
        return (Array.isArray(schedules) ? schedules : []).filter(s => !s.isDeleted);
    }, [schedules]);
    
    const sortedSchedules = useMemo(() => {
        let sortableItems = [...nonDeletedSchedules];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [nonDeletedSchedules, sortConfig]);

    const filteredSchedules = useMemo(() => {
        if (!searchTerm) return sortedSchedules;
        return sortedSchedules.filter(s => s.loanName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [sortedSchedules, searchTerm]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
    };
    
    const getLoanStatus = (schedule: SavedAmortizationSchedule) => {
        const paidCount = Object.values(schedule.paymentStatus || {}).filter(Boolean).length;
        const totalCount = (schedule.schedule ?? []).length;
        if (totalCount === 0) return 'DRAFT';
        if (paidCount === totalCount && totalCount > 0) return 'CLOSED';
        return paidCount > 0 ? 'IN PROGRESS' : 'ACTIVE';
    };

    const getLoanBalance = (schedule: SavedAmortizationSchedule) => {
        const paymentStatus = schedule.paymentStatus || {};
        const paidMonths = Object.keys(paymentStatus).filter(m => paymentStatus[parseInt(m)]).map(m => parseInt(m)).sort((a,b) => b-a);
        if (paidMonths.length === 0) return schedule.principal;
        const lastPaidMonth = paidMonths[0];
        const lastPaidEntry = (schedule.schedule || []).find(entry => entry.month === lastPaidMonth);
        return lastPaidEntry ? lastPaidEntry.endingBalance : schedule.principal;
    };

    const handleDownloadReport = () => {
        if (nonDeletedSchedules.length === 0) return;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        doc.setFontSize(18); doc.text(appTitle, pageWidth / 2, 20, { align: 'center' });
        doc.setFontSize(14); doc.text("EMI Comprehensive Report", pageWidth / 2, 30, { align: 'center' });
        
        let yPos = 40;
        
        autoTable(doc, {
            startY: yPos, head: [['Metric', 'Value']],
            body: [
                ['Total Loans', String(nonDeletedSchedules.length)],
                ['Total Outstanding', formatCurrency(nonDeletedSchedules.reduce((s, sch) => s + getLoanBalance(sch), 0))],
            ],
            theme: 'striped', headStyles: { fillColor: currentThemeColors.brandPrimary }
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 15;

        // Detail table columns
        const tableColumn = ["Loan Name", "Status", "Original Amt", "Outstanding", "Milestone Greeting"];
        const tableRows = nonDeletedSchedules.map(s => [
            s.loanName,
            getLoanStatus(s),
            formatCurrency(s.principal).replace('₹', '').trim(),
            formatCurrency(getLoanBalance(s)).replace('₹', '').trim(),
            (s.completionGreeting && getLoanStatus(s) === 'CLOSED') ? s.completionGreeting : '-'
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [tableColumn],
            body: tableRows,
            theme: pdfStyle === 'financial' ? 'plain' : pdfStyle,
            headStyles: { fillColor: currentThemeColors.brandPrimary },
            styles: { fontSize: 8 },
            didParseCell: (data: any) => {
                if (data.section === 'body' && data.column.index === 1) {
                    if (data.cell.raw === 'CLOSED') {
                        data.cell.styles.textColor = currentThemeColors.income;
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
                if (data.section === 'body' && data.column.index === 4 && data.cell.raw !== '-') {
                    data.cell.styles.fontStyle = 'italic';
                    data.cell.styles.textColor = [100, 100, 100];
                }
            }
        });

        doc.save(`EMI_Summary_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const activeSchedules = useMemo(() => {
        return filteredSchedules.filter(s => getLoanStatus(s) !== 'CLOSED');
    }, [filteredSchedules]);

    const closedSchedules = useMemo(() => {
        return filteredSchedules.filter(s => getLoanStatus(s) === 'CLOSED');
    }, [filteredSchedules]);

    const renderTable = (items: SavedAmortizationSchedule[], title: string, icon: React.ReactNode) => (
        <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-text-muted-themed flex items-center gap-2 px-2">
                {icon} {title} ({items.length})
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <table className="w-full min-w-[1024px] text-sm text-left">
                    <thead className="text-xs uppercase" style={{backgroundColor: currentThemeColors.bgAccent, color: currentThemeColors.textBase}}>
                        <tr>
                            <th className="px-6 py-3 text-center">#</th>
                            <th className="px-6 py-3 text-left">Loan Name</th>
                            <th className="px-6 py-3 text-right">Principal</th>
                            <th className="px-6 py-3 text-right">Monthly EMI</th>
                            <th className="px-6 py-3 text-right">Current Balance</th>
                            <th className="px-6 py-3 text-center">Status</th>
                            <th className="px-6 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((schedule, idx) => (
                            <tr key={schedule.id} className="border-b hover:bg-bg-accent-themed/50 transition-colors" style={{borderColor: currentThemeColors.borderSecondary}}>
                                <td className="px-6 py-3 text-center font-mono text-xs text-slate-400">{idx + 1}</td>
                                <td className="px-6 py-3 font-medium">
                                    <div className="flex flex-col">
                                        <span className="text-text-base-themed">{schedule.loanName}</span>
                                        {schedule.completionGreeting && getLoanStatus(schedule) === 'CLOSED' && (
                                            <span className="text-[9px] text-income font-bold flex items-center gap-1 mt-0.5">
                                                <SparklesIcon className="w-2.5 h-2.5" /> Milestone Logged
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-3 text-right text-slate-600 dark:text-slate-400">{formatCurrency(schedule.principal)}</td>
                                <td className="px-6 py-3 text-right text-slate-600 dark:text-slate-400">{formatCurrency(schedule.calculatedEmi)}</td>
                                <td className="px-6 py-3 text-right font-bold text-brand-primary">{formatCurrency(getLoanBalance(schedule))}</td>
                                <td className="px-6 py-3 text-center">
                                    <span className={`px-2 py-0.5 text-[10px] font-black tracking-widest uppercase rounded-full ${getLoanStatus(schedule) === 'CLOSED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                        {getLoanStatus(schedule)}
                                    </span>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button onClick={() => onLoadSchedule(schedule.id)} className="p-1.5 text-blue-500 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors" title="Edit Schedule"><EditIcon className="w-4 h-4"/></button>
                                        <button onClick={() => setDeletingScheduleId(schedule.id)} className="p-1.5 text-red-500 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors" title="Delete Schedule"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-10 text-center text-slate-400 italic">No {title.toLowerCase()} loans found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="p-4 sm:p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800" style={{ backgroundColor: currentThemeColors.bgSecondary }}>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <ChartIcon className="w-7 h-7 text-brand-primary" /> EMI Stats & Summary
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search loans..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                            />
                            <ChartIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                        <button onClick={() => setIsPreviewModalOpen(true)} className="flex items-center px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl shadow-lg text-white bg-brand-primary hover:opacity-90 transition-all">
                            <EyeIcon className="w-4 h-4 mr-2" /> Preview
                        </button>
                        <button onClick={handleDownloadReport} className="flex items-center px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl shadow-lg text-white bg-slate-600 hover:opacity-90 transition-all">
                            <DownloadIcon className="w-4 h-4 mr-2"/> PDF
                        </button>
                    </div>
                </div>

                <div className="space-y-10">
                    {renderTable(activeSchedules, "Active Loans", <SparklesIcon className="w-4 h-4 text-brand-primary" />)}
                    {renderTable(closedSchedules, "Closed Loans", <CheckCircleIcon className="w-4 h-4 text-green-500" />)}
                </div>
            </div>
            {isPreviewModalOpen && (
                <ReportPreviewModal 
                    isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} 
                    schedules={nonDeletedSchedules} title={`${appTitle} - EMI Summary Preview`} 
                    onDownload={handleDownloadReport} formatCurrency={formatCurrency}
                    getLoanBalance={getLoanBalance} getLoanStatus={getLoanStatus}
                />
            )}
            <ConfirmationModal
                isOpen={!!deletingScheduleId}
                onClose={() => setDeletingScheduleId(null)}
                onConfirm={() => {
                    if (deletingScheduleId) {
                        onDeleteSchedule(deletingScheduleId);
                        setDeletingScheduleId(null);
                    }
                }}
                title="Delete EMI Schedule"
                message="Are you sure you want to delete this EMI schedule? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
};

const ReportPreviewModal: React.FC<{
    isOpen: boolean; onClose: () => void; schedules: SavedAmortizationSchedule[]; title: string; 
    onDownload: () => void; formatCurrency: (amount: number) => string;
    getLoanBalance: (s: SavedAmortizationSchedule) => number; getLoanStatus: (s: SavedAmortizationSchedule) => string;
}> = ({ isOpen, onClose, schedules, title, onDownload, formatCurrency, getLoanBalance, getLoanStatus }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-modal-enter overflow-hidden border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <DocumentChartBarIcon className="w-6 h-6 text-brand-primary" />
                        <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{title}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"><XIcon className="w-5 h-5 text-slate-500" /></button>
                </div>
                <div className="flex-grow overflow-auto p-4">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead className="sticky top-0 bg-bg-accent-themed z-10">
                            <tr>
                                <th className="px-6 py-3 border-b border-border-secondary">Loan Name</th>
                                <th className="px-6 py-3 border-b border-border-secondary text-right">Principal</th>
                                <th className="px-6 py-3 border-b border-border-secondary text-right">Balance</th>
                                <th className="px-6 py-3 border-b border-border-secondary text-center">Status</th>
                                <th className="px-6 py-3 border-b border-border-secondary">Milestone Remark</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map(s => (
                                <tr key={s.id} className="hover:bg-bg-accent-themed/30 border-b border-border-secondary transition-colors">
                                    <td className="px-6 py-3 font-bold text-text-base-themed">{s.loanName}</td>
                                    <td className="px-6 py-3 text-right">{formatCurrency(s.principal)}</td>
                                    <td className="px-6 py-3 text-right font-black text-brand-primary">{formatCurrency(getLoanBalance(s))}</td>
                                    <td className="px-6 py-3 text-center uppercase font-black text-[10px] tracking-widest">{getLoanStatus(s)}</td>
                                    <td className="px-6 py-3 text-[10px] italic text-text-muted-themed max-w-xs">{(s.completionGreeting && getLoanStatus(s) === 'CLOSED') ? s.completionGreeting : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl bg-slate-200 dark:bg-slate-800">Close</button>
                    <button onClick={() => { onDownload(); onClose(); }} className="px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl bg-brand-primary text-white shadow-lg">Download PDF</button>
                </div>
            </div>
        </div>
    );
};
