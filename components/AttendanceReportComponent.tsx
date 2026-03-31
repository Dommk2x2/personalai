import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AttendanceEntry, AttendanceStatus, PdfTableTheme } from '../types';
import { DocumentChartBarIcon, DownloadIcon, EyeIcon, XIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import { LOCAL_STORAGE_PROFILE_PICTURE_KEY } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';
import { lightenHexColor } from '../utils/colorUtils';

interface AttendanceReportComponentProps {
  attendanceEntries: AttendanceEntry[];
  attendanceStatuses: string[];
  appTitle: string;
}

type ReportType = 'monthlySummary' | 'dateRangeSummary';

interface ReportData {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  summaryText?: string;
}

// Converting to named export to fix default import errors in App.tsx
export const AttendanceReportComponent: React.FC<AttendanceReportComponentProps> = ({ attendanceEntries, attendanceStatuses, appTitle }) => {
  const { currentThemeColors } = useTheme();
  const [profilePicture] = useLocalStorage<string | null>(LOCAL_STORAGE_PROFILE_PICTURE_KEY, null);
  const [reportType, setReportType] = useState<ReportType>('monthlySummary');
  const [selectedMonth, setSelectedMonth] = useState<string>(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [pdfStyle, setPdfStyle] = useState<PdfTableTheme>('striped');

  const handleGenerateReport = () => {
    let reportData: ReportData | null = null;
    if (reportType === 'monthlySummary') {
      if (!selectedMonth) return;
      const [year, month] = selectedMonth.split('-').map(Number);
      const entries = (attendanceEntries ?? []).filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      });
      if (entries.length === 0) { alert("No data found."); return; }
      const counts: Record<string, number> = {};
      attendanceStatuses.forEach(s => counts[s] = 0);
      entries.forEach(e => counts[e.status] = (counts[e.status] || 0) + 1);
      reportData = {
        title: `Monthly Attendance - ${new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        headers: ["Status", "Count"],
        rows: attendanceStatuses.map(s => [s.replace(/_/g, ' '), counts[s] || 0]),
        summaryText: `Total Days Recorded: ${entries.length}`
      };
    } else {
      if (!startDate || !endDate) return;
      const entries = (attendanceEntries ?? []).filter(e => {
        const d = new Date(e.date + "T00:00:00");
        return d >= new Date(startDate + "T00:00:00") && d <= new Date(endDate + "T23:59:59");
      });
      if (entries.length === 0) { alert("No data found."); return; }
      const counts: Record<string, number> = {};
      attendanceStatuses.forEach(s => counts[s] = 0);
      entries.forEach(e => counts[e.status] = (counts[e.status] || 0) + 1);
      reportData = {
        title: `Attendance - ${startDate} to ${endDate}`,
        headers: ["Status", "Count"],
        rows: attendanceStatuses.map(s => [s.replace(/_/g, ' '), counts[s] || 0]),
        summaryText: `Total Days in Range: ${entries.length}`
      };
    }
    setGeneratedReport(reportData);
    setIsPreviewModalOpen(true);
  };
  
  const handleDownloadPdf = () => {
    if (!generatedReport) return;
    const doc = new jsPDF();
    autoTable(doc, {
        head: [generatedReport.headers], body: generatedReport.rows, startY: 40,
        theme: pdfStyle === 'financial' ? 'plain' : pdfStyle,
        headStyles: { fillColor: currentThemeColors.brandPrimary }
    });
    doc.save(`Attendance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="bg-bg-secondary-themed p-4 sm:p-6 rounded-xl shadow-lg">
      <h2 className="text-lg sm:text-xl font-semibold text-text-base-themed mb-4 flex items-center">
        <DocumentChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-brand-primary" /> Attendance Reports
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium text-text-muted-themed mb-1">Report Type</label>
          <select value={reportType} onChange={e => setReportType(e.target.value as ReportType)} className="w-full p-2 border rounded-md bg-bg-primary-themed">
            <option value="monthlySummary">Monthly Summary</option>
            <option value="dateRangeSummary">Date Range Summary</option>
          </select>
        </div>
        {reportType === 'monthlySummary' ? (
          <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="p-2 border rounded-md bg-bg-primary-themed" />
        ) : (
          <div className="flex gap-2"><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded-md bg-bg-primary-themed w-1/2" /><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded-md bg-bg-primary-themed w-1/2" /></div>
        )}
      </div>
      <button onClick={handleGenerateReport} className="w-full sm:w-auto px-6 py-2.5 bg-brand-primary text-text-inverted rounded-lg shadow-md hover:opacity-90 transition-all font-bold">
          <EyeIcon className="w-5 h-5 mr-2 inline-block"/> Preview & Generate Report
      </button>

      {isPreviewModalOpen && generatedReport && (
          <ReportPreviewModal 
            isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} 
            data={generatedReport} title={`${appTitle} - Attendance Preview`} 
            onDownload={handleDownloadPdf}
          />
      )}
    </div>
  );
};

const ReportPreviewModal: React.FC<{
    isOpen: boolean; onClose: () => void; data: ReportData; title: string; onDownload: () => void;
}> = ({ isOpen, onClose, data, title, onDownload }) => {
    const { currentThemeColors } = useTheme();
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-modal-enter overflow-hidden border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <DocumentChartBarIcon className="w-6 h-6 text-brand-primary" />
                        <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{title}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"><XIcon className="w-5 h-5 text-slate-500" /></button>
                </div>
                <div className="flex-grow overflow-auto p-6">
                    <h4 className="text-center font-bold text-lg mb-4">{data.title}</h4>
                    {data.summaryText && <p className="text-center text-sm text-slate-400 mb-6 font-black uppercase tracking-widest">{data.summaryText}</p>}
                    <table className="w-full text-xs text-left border-collapse">
                        <thead className="bg-bg-accent-themed">
                            <tr>{data.headers.map(h => <th key={h} className="p-3 border-b border-border-secondary">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {data.rows.map((row, i) => (
                                <tr key={i} className="hover:bg-bg-accent-themed/30 border-b border-border-secondary">
                                    {row.map((cell, j) => <td key={j} className="p-3">{cell}</td>)}
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