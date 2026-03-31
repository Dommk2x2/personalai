import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AttendanceEntry, AttendanceStatus, Account, PdfTableTheme, SalaryDeduction } from '../types';
import { ATTENDANCE_STATUSES, LOCAL_STORAGE_PROFILE_PICTURE_KEY } from '../constants';
import { BanknotesIcon, DownloadIcon, AlertTriangleIcon, EyeIcon, XIcon, DocumentChartBarIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { lightenHexColor } from '../utils/colorUtils';

interface SalaryReportComponentProps {
  monthlySalary: number | null;
  attendanceEntries: AttendanceEntry[];
  accounts: Account[];
  activeAccountName?: string;
  appTitle: string;
  salaryDeductions: SalaryDeduction[];
}

interface SalaryReportData {
  selectedMonthYear: string;
  baseMonthlySalary: number;
  daysInMonth: number;
  attendanceSummary: Record<AttendanceStatus, number>;
  totalPresentDays: number;
  totalHalfDays: number;
  totalWorkFromHomeDays: number;
  totalWeeklyOffDays: number;
  totalLeaveDays: number;
  totalAbsentDays: number;
  payableDays: number;
  calculatedGrossSalary: number;
  totalDeductions: number;
  netSalaryPayable: number;
}

// Converting to named export for consistency and to fix default import errors in App.tsx
export const SalaryReportComponent: React.FC<SalaryReportComponentProps> = ({
  monthlySalary,
  attendanceEntries,
  accounts,
  activeAccountName,
  appTitle,
  salaryDeductions,
}) => {
  const { currentThemeColors } = useTheme();
  const [profilePicture] = useLocalStorage<string | null>(LOCAL_STORAGE_PROFILE_PICTURE_KEY, null);
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [generatedReportData, setGeneratedReportData] = useState<SalaryReportData | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [pdfStyle, setPdfStyle] = useState<PdfTableTheme>('grid');

  const calculateSalaryData = (): SalaryReportData | null => {
    if (monthlySalary === null || monthlySalary <= 0) return null;
    const [year, month] = selectedMonthYear.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const entries = (attendanceEntries ?? []).filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
    if (entries.length === 0) { alert("No data found for selected month."); return null; }
    const summary: Record<AttendanceStatus, number> = {} as any;
    ATTENDANCE_STATUSES.forEach(s => (summary[s as AttendanceStatus] = 0));
    entries.forEach(e => summary[e.status]++);
    const payableDays = summary[AttendanceStatus.PRESENT] + summary[AttendanceStatus.WORK_FROM_HOME] + summary[AttendanceStatus.WEEKLY_OFF] + (summary[AttendanceStatus.HALF_DAY_PRESENT] * 0.5);
    const gross = (monthlySalary / daysInMonth) * payableDays;
    const deductions = salaryDeductions.reduce((s, d) => s + d.amount, 0);
    return {
      selectedMonthYear, baseMonthlySalary: monthlySalary, daysInMonth, attendanceSummary: summary,
      totalPresentDays: summary[AttendanceStatus.PRESENT], totalHalfDays: summary[AttendanceStatus.HALF_DAY_PRESENT],
      totalWorkFromHomeDays: summary[AttendanceStatus.WORK_FROM_HOME], totalWeeklyOffDays: summary[AttendanceStatus.WEEKLY_OFF],
      totalLeaveDays: summary[AttendanceStatus.SICK_LEAVE] + summary[AttendanceStatus.CASUAL_LEAVE],
      totalAbsentDays: summary[AttendanceStatus.ABSENT], payableDays, calculatedGrossSalary: gross,
      totalDeductions: deductions, netSalaryPayable: gross - deductions
    };
  };
  
  const handleGenerateReport = () => {
    const data = calculateSalaryData();
    if (data) setGeneratedReportData(data);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const handleDownloadPdf = () => {
    if (!generatedReportData) return;
    const doc = new jsPDF();
    autoTable(doc, {
        startY: 40, head: [['Salary Item', 'Amount']],
        body: [
            ['Gross Salary', formatCurrency(generatedReportData.calculatedGrossSalary)],
            ['Total Deductions', `-${formatCurrency(generatedReportData.totalDeductions)}`],
            ['Net Payable', formatCurrency(generatedReportData.netSalaryPayable)]
        ],
        theme: 'striped', headStyles: { fillColor: currentThemeColors.brandPrimary }
    });
    doc.save(`Salary_Slip_${generatedReportData.selectedMonthYear}.pdf`);
  };

  if (monthlySalary === null || monthlySalary <= 0) {
    return (
      <div className="bg-bg-secondary-themed p-6 rounded-xl shadow-lg text-center">
        <p className="text-text-base-themed">Salary Not Configured</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary-themed p-4 sm:p-6 rounded-xl shadow-lg">
      <h2 className="text-lg sm:text-xl font-semibold text-text-base-themed mb-4 flex items-center">
        <BanknotesIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-brand-primary" /> Salary Report
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-end">
        <input type="month" value={selectedMonthYear} onChange={e => setSelectedMonthYear(e.target.value)} className="p-2 border rounded-md bg-bg-primary-themed" />
        <div className="flex gap-2">
            <button onClick={handleGenerateReport} className="flex-grow px-4 py-2.5 bg-brand-primary text-text-inverted rounded-lg shadow-md hover:opacity-90 transition-all">Generate Summary</button>
            {generatedReportData && (
                <button onClick={() => setIsPreviewModalOpen(true)} className="px-4 py-2.5 bg-brand-secondary text-text-inverted rounded-lg shadow-md hover:opacity-90 transition-all">
                    <EyeIcon className="w-5 h-5"/>
                </button>
            )}
        </div>
      </div>

      {generatedReportData && (
        <div className="mt-6 border-t border-border-secondary pt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Report Summary</h3>
                <button onClick={handleDownloadPdf} className="flex items-center px-4 py-2 text-sm bg-slate-600 text-white rounded-lg"><DownloadIcon className="w-4 h-4 mr-2"/> PDF</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-bg-accent-themed rounded-xl text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase">Gross</p>
                    <p className="text-xl font-black text-brand-primary">{formatCurrency(generatedReportData.calculatedGrossSalary)}</p>
                </div>
                <div className="p-4 bg-bg-accent-themed rounded-xl text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase">Deductions</p>
                    <p className="text-xl font-black text-expense">-{formatCurrency(generatedReportData.totalDeductions)}</p>
                </div>
                <div className="p-4 bg-bg-accent-themed rounded-xl text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase">Net Payable</p>
                    <p className="text-xl font-black text-income">{formatCurrency(generatedReportData.netSalaryPayable)}</p>
                </div>
            </div>
        </div>
      )}

      {isPreviewModalOpen && generatedReportData && (
          <ReportPreviewModal 
            isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} 
            data={generatedReportData} title={`${appTitle} - Salary Slip Preview`} 
            onDownload={handleDownloadPdf} formatCurrency={formatCurrency}
            salaryDeductions={salaryDeductions}
          />
      )}
    </div>
  );
};

const ReportPreviewModal: React.FC<{
    isOpen: boolean; onClose: () => void; data: SalaryReportData; title: string; 
    onDownload: () => void; formatCurrency: (amount: number) => string;
    salaryDeductions: SalaryDeduction[];
}> = ({ isOpen, onClose, data, title, onDownload, formatCurrency, salaryDeductions }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-modal-enter border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <DocumentChartBarIcon className="w-6 h-6 text-brand-primary" />
                        <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{title}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"><XIcon className="w-5 h-5 text-slate-500" /></button>
                </div>
                <div className="flex-grow overflow-auto p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-4">Earnings</h4>
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-sm font-medium">Gross Salary (Payable Days: {data.payableDays.toFixed(1)})</span>
                                <span className="text-sm font-black text-income">{formatCurrency(data.calculatedGrossSalary)}</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-4">Deductions</h4>
                            {salaryDeductions.map(d => (
                                <div key={d.id} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-sm font-medium">{d.name}</span>
                                    <span className="text-sm font-black text-expense">-{formatCurrency(d.amount)}</span>
                                </div>
                            ))}
                            {salaryDeductions.length === 0 && <p className="text-xs text-slate-400 italic">No deductions defined.</p>}
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Net Payable</p>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">{formatCurrency(data.netSalaryPayable)}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Days Recorded</p>
                             <p className="text-lg font-bold">{data.daysInMonth} Days</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl bg-slate-200 dark:bg-slate-800">Close</button>
                    <button onClick={() => { onDownload(); onClose(); }} className="px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl bg-brand-primary text-white shadow-lg">Download PDF</button>
                </div>
            </div>
        </div>
    );
};