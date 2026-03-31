import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, TransactionType, PdfTableTheme, PdfPageSize, PdfPageOrientation, PdfTableOverflow } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { ClipboardListIcon, DownloadIcon, ClockIcon, EyeIcon, XIcon, DocumentChartBarIcon } from './Icons';
import { LOCAL_STORAGE_PROFILE_PICTURE_KEY } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';
import { lightenHexColor } from '../utils/colorUtils';

interface MiniStatementProps {
  transactions: Transaction[]; 
  accountName?: string;
  appTitle: string;
}

// Converting to named export to resolve import errors in App.tsx and align with project structure
export const MiniStatement: React.FC<MiniStatementProps> = ({ transactions, accountName, appTitle }) => {
  const { currentThemeColors } = useTheme();
  const [profilePicture] = useLocalStorage<string | null>(LOCAL_STORAGE_PROFILE_PICTURE_KEY, null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [pdfStyle, setPdfStyle] = useState<PdfTableTheme>('striped');
  const [pdfPageSize, setPdfPageSize] = useState<PdfPageSize>('a4');
  const [pdfOrientation, setPdfOrientation] = useState<PdfPageOrientation>('portrait');
  const [pdfOverflow, setPdfOverflow] = useState<PdfTableOverflow>('shrink');


  const formatCurrencyForDisplay = (amount: number, withSign: boolean = false) => {
    const formatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Math.abs(amount));
    if (withSign) {
      const sign = amount >= 0 ? '+' : '-';
      return `${sign}${formatted.substring(1)}`; 
    }
    return formatted;
  };
  
  const formatCurrencyForPdf = (amount: number) => {
    let formatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    return formatted.replace('₹', '').trim();
  };


  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString + 'T00:00:00').toLocaleDateString(undefined, options);
  };

  const recentTransactions = [...transactions] 
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  const handleDownloadPdf = () => {
    try {
      if (recentTransactions.length === 0) return;
      const doc = new jsPDF({ orientation: pdfOrientation, format: pdfPageSize });
      if (profilePicture) {
        try {
            const imageType = profilePicture.startsWith('data:image/png') ? 'PNG' : 'JPEG';
            let imgWidth = 15; let imgHeight = 15;
            const imgProps = doc.getImageProperties(profilePicture);
            const aspectRatio = imgProps.width / imgProps.height;
            if (aspectRatio > 1) { imgHeight = 15 / aspectRatio; } else { imgWidth = 15 * aspectRatio; }
            const xPos = doc.internal.pageSize.width - 14 - imgWidth;
            doc.addImage(profilePicture, imageType, xPos, 14, imgWidth, imgHeight);
        } catch (e) { console.error(e); }
      }
      const reportTitle = `${appTitle} - Mini Statement`;
      const accountSubTitle = `Account: ${accountName || 'N/A'}`;
      doc.setFontSize(16); doc.text(reportTitle, 14, 18); doc.setFontSize(11); doc.setTextColor(50); doc.text(accountSubTitle, 14, 23);
      const tableColumn = ["Payment Date", "Description", "Debit", "Credit"];
      const tableRows = recentTransactions.map(tx => {
        return [
          formatDate(tx.date), tx.description,
          tx.type === TransactionType.EXPENSE ? formatCurrencyForPdf(tx.amount) : '–',
          tx.type === TransactionType.INCOME ? formatCurrencyForPdf(tx.amount) : '–'
        ];
      });
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 30, theme: pdfStyle === 'financial' ? 'plain' : pdfStyle, headStyles: { fillColor: currentThemeColors.brandPrimary } });
      doc.save(`Mini_Statement_${accountName?.replace(/\s+/g, '_') || 'Account'}.pdf`);
    } catch (e) { console.error(e); }
  };

  if (recentTransactions.length === 0) {
    return (
      <div className="bg-bg-secondary-themed p-6 rounded-xl shadow-lg text-center">
        <p className="text-text-base-themed text-lg">No recent transactions for {accountName || "this account"}.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary-themed p-4 sm:p-6 rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-text-base-themed flex items-center min-w-0">
          <ClipboardListIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-brand-primary flex-shrink-0" />
          <span>Mini Statement</span>
        </h2>
        <div className="flex items-center gap-2">
            <button onClick={() => setIsPreviewModalOpen(true)} className="flex items-center px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm bg-brand-primary text-text-inverted hover:opacity-90 transition-all">
                <EyeIcon className="w-3.5 h-3.5 mr-1.5" /> Preview
            </button>
            <button onClick={handleDownloadPdf} className="flex items-center px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm bg-slate-600 text-text-inverted hover:opacity-90 transition-all">
                <DownloadIcon className="w-3.5 h-3.5 mr-1.5" /> PDF
            </button>
        </div>
      </div>
      <ul className="space-y-2">
        {recentTransactions.map(tx => {
            const isIncome = tx.type === TransactionType.INCOME;
            const isExpense = tx.type === TransactionType.EXPENSE;
            const borderColor = isIncome ? currentThemeColors.income : isExpense ? currentThemeColors.expense : currentThemeColors.brandPrimary;
            
            return (
              <li 
                key={tx.id} 
                className="flex justify-between items-center py-2.5 px-3 border-l-4 rounded-r-lg bg-bg-primary-themed shadow-sm hover:bg-bg-accent-themed/50 transition-all duration-200"
                style={{ borderLeftColor: borderColor }}
              >
                <div className="min-w-0 flex-grow mr-4">
                  <p className="text-sm text-text-base-themed font-bold truncate">{tx.description}</p>
                  <p className="text-[10px] text-text-muted-themed uppercase font-black tracking-widest">{formatDate(tx.date)}</p>
                </div>
                <span className={`text-sm font-black`} style={{ color: borderColor }}>
                  {isIncome ? '+' : isExpense ? '-' : ''}{formatCurrencyForDisplay(tx.amount)}
                </span>
              </li>
            );
        })}
      </ul>

      {isPreviewModalOpen && (
          <ReportPreviewModal 
            isOpen={isPreviewModalOpen} 
            onClose={() => setIsPreviewModalOpen(false)} 
            entries={recentTransactions} 
            title={`${appTitle} - Mini Statement Preview`} 
            onDownload={handleDownloadPdf}
            formatCurrency={formatCurrencyForDisplay}
            formatDate={formatDate}
          />
      )}
    </div>
  );
};

const ReportPreviewModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    entries: Transaction[];
    title: string;
    onDownload: () => void;
    formatCurrency: (amount: number, withSign?: boolean) => string;
    formatDate: (d: string) => string;
}> = ({ isOpen, onClose, entries, title, onDownload, formatCurrency, formatDate }) => {
    const { currentThemeColors } = useTheme();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-modal-enter overflow-hidden border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
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
                                <th className="p-3 border-b border-border-secondary">Date</th>
                                <th className="p-3 border-b border-border-secondary">Description</th>
                                <th className="p-3 border-b border-border-secondary">Category</th>
                                <th className="p-3 border-b border-border-secondary text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map(tx => (
                                <tr key={tx.id} className="hover:bg-bg-accent-themed/30 border-b border-border-secondary">
                                    <td className="p-3 font-medium whitespace-nowrap">{formatDate(tx.date)}</td>
                                    <td className="p-3 text-text-base-themed">{tx.description}</td>
                                    <td className="p-3 text-text-muted-themed">{tx.category || '-'}</td>
                                    <td className="p-3 text-right font-black" style={{ color: tx.type === 'income' ? currentThemeColors.income : currentThemeColors.expense }}>
                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl bg-slate-200 dark:bg-slate-800">Close</button>
                    <button onClick={() => { onDownload(); onClose(); }} className="px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl bg-brand-primary text-white shadow-lg">
                        <DownloadIcon className="w-4 h-4 mr-2 inline-block"/> Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};