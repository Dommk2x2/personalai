import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, TransactionType, PdfTableTheme, PdfPageSize, PdfPageOrientation, PdfTableOverflow, Account } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { PassbookIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon, EyeIcon, XIcon, DocumentChartBarIcon } from './Icons';
import { LOCAL_STORAGE_PROFILE_PICTURE_KEY } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';
import { lightenHexColor, hexToRgba } from '../utils/colorUtils';

interface PassbookViewProps {
  transactions: Transaction[]; // Should be pre-filtered for the active account
  activeAccount?: Account;
  appTitle: string;
  openingBalance: number;
  periodLabel: string;
}

interface PassbookDisplayEntry {
  id: string;
  date: string;
  description: string;
  category?: string;
  debit?: number;
  credit?: number;
  previousBalance: number;
  runningBalance: number;
}

const ITEMS_PER_PAGE = 15;

const PortraitIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);

const LandscapeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 0a2.25 2.25 0 0 1-2.25-2.25V5.625c0-.621.504-1.125 1.125-1.125h12.75c.621 0 1.125.504 1.125 1.125V7.5a2.25 2.25 0 0 1 2.25 2.25m-19.5 0v10.125c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125V9.75M12 9.75v11.25" />
    </svg>
);

export const PassbookView: React.FC<PassbookViewProps> = ({ transactions, activeAccount, appTitle, openingBalance, periodLabel }) => {
  const { currentThemeColors } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [profilePicture] = useLocalStorage<string | null>(LOCAL_STORAGE_PROFILE_PICTURE_KEY, null);
  const [pdfStyle, setPdfStyle] = useState<PdfTableTheme>('striped');
  const [pdfPageSize, setPdfPageSize] = useState<PdfPageSize>('a4');
  const [pdfOrientation, setPdfOrientation] = useState<PdfPageOrientation>('portrait');
  const [pdfOverflow, setPdfOverflow] = useState<PdfTableOverflow>('shrink');

  const accountName = activeAccount?.name;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Math.abs(amount));
  };
  
  const formatCurrencyForPdfTable = (amount?: number): string => {
    if (typeof amount !== 'number') return '-';
    let formatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    return formatted.replace('₹', '').trim();
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString + 'T00:00:00').toLocaleDateString(undefined, options);
  };

  const chronologicalTransactionsWithBalance: PassbookDisplayEntry[] = useMemo(() => {
    const sortedTransactions = [...transactions].sort((a, b) => {
      const dateA = new Date(a.date + 'T00:00:00').getTime();
      const dateB = new Date(b.date + 'T00:00:00').getTime();
      
      if (dateA !== dateB) {
        return dateA - dateB; 
      }

      if (a.type !== b.type) {
        return a.type === 'income' ? -1 : 1;
      }

      if (a.description !== b.description) {
          return a.description.localeCompare(b.description);
      }

      return a.id.localeCompare(b.id);
    });

    let currentBalance = openingBalance;
    return sortedTransactions.map(tx => {
      const previousBalance = currentBalance;
      if (tx.type === TransactionType.INCOME) {
        currentBalance += tx.amount;
        return {
          id: tx.id,
          date: tx.date,
          description: tx.description,
          category: tx.category, 
          credit: tx.amount,
          debit: undefined,
          previousBalance,
          runningBalance: currentBalance,
        };
      } else { 
        currentBalance -= tx.amount;
        return {
          id: tx.id,
          date: tx.date,
          description: tx.description,
          category: tx.category,
          credit: undefined,
          debit: tx.amount,
          previousBalance,
          runningBalance: currentBalance,
        };
      }
    });
  }, [transactions, openingBalance]);

  const displayOrderTransactions = useMemo(() => 
    [...chronologicalTransactionsWithBalance].reverse(), 
    [chronologicalTransactionsWithBalance]
  );
  
  const totalPages = Math.ceil(displayOrderTransactions.length / ITEMS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  useEffect(() => {
    setCurrentPage(1);
  }, [transactions]); 

  const handleDownloadPdf = () => {
    if (displayOrderTransactions.length === 0) {
      alert("No transactions in the passbook to download.");
      return;
    }

    try {
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
        } catch (e) { console.error("Could not add profile picture to PDF:", e); }
      }
      const reportTitle = `${appTitle} - Passbook Statement`;
      const accountSubTitle = `Account: ${accountName || 'All Accounts'}`;
      const generatedDateTime = new Date().toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

      doc.setFontSize(16); doc.text(reportTitle, 14, 18); doc.setFontSize(11); doc.setTextColor(50);
      doc.text(accountSubTitle, 14, 23); doc.setFontSize(10); doc.setTextColor(100);
      doc.text(`Report Generated: ${generatedDateTime}`, 14, 28); 
      
      let yPos = 35;
      const tableColumn = ["Date", "Description", "Debit", "Credit", "Balance"];
      const tableRows = displayOrderTransactions.map(tx => [
        formatDate(tx.date), tx.description,
        tx.debit ? formatCurrencyForPdfTable(tx.debit) : '-',
        tx.credit ? formatCurrencyForPdfTable(tx.credit) : '-',
        formatCurrencyForPdfTable(tx.runningBalance)
      ]);

      autoTable(doc, {
        head: [tableColumn], body: tableRows, startY: yPos,
        theme: pdfStyle === 'financial' ? 'plain' : pdfStyle,
        headStyles: { fillColor: currentThemeColors.brandPrimary },
        styles: { fontSize: 8, cellPadding: 1.5, overflow: pdfOverflow === 'wrap' ? 'linebreak' : 'ellipsize' },
        didParseCell: (data: any) => {
            if(data.section === 'body' && data.row.index >= 0) {
                const tx = displayOrderTransactions[data.row.index];
                if (pdfStyle === 'financial' && tx) {
                  data.cell.styles.fillColor = !!tx.credit ? lightenHexColor(currentThemeColors.income, 0.1) : lightenHexColor(currentThemeColors.expense, 0.1);
                }
            }
        },
      });
      
      doc.save(`Passbook_${accountName?.replace(/\s+/g, '_') || 'Account'}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) { console.error("Error generating PDF:", e); alert(`Error: ${e}`); }
  };

  const toggleOrientation = () => {
    setPdfOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  };

  if (transactions.length === 0 && periodLabel === 'All time') {
    return (
      <div className="bg-bg-secondary-themed p-6 rounded-xl shadow-lg text-center">
        <img src="https://picsum.photos/seed/passbookempty/300/200?grayscale" alt="Empty passbook" className="mx-auto mb-4 rounded-lg w-32 h-24 sm:w-40 sm:h-32 md:w-48 md:h-32 object-cover opacity-70 dark:opacity-50" />
        <p className="text-text-base-themed text-lg">No transactions for {accountName || "this account"}.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary-themed p-4 sm:p-6 rounded-xl shadow-lg transition-all duration-300 overflow-hidden">
      <div className="mb-4 sm:mb-6 border-b border-border-secondary pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-text-base-themed flex items-center min-w-0">
            <PassbookIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-brand-primary flex-shrink-0" />
            <span className="truncate">Passbook Statement</span>
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
              <button
                  onClick={toggleOrientation}
                  className="flex items-center justify-center p-2 rounded-lg bg-bg-primary-themed border border-border-secondary text-text-muted-themed hover:text-brand-primary transition-all shadow-sm"
                  title={`Switch to ${pdfOrientation === 'portrait' ? 'Landscape' : 'Portrait'} mode`}
              >
                  {pdfOrientation === 'portrait' ? <PortraitIcon className="w-4 h-4" /> : <LandscapeIcon className="w-4 h-4" />}
              </button>
              <button
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="flex items-center px-3 py-1.5 text-xs font-black uppercase rounded-lg shadow-sm bg-brand-primary text-text-inverted hover:opacity-90 transition-all"
              >
                  <EyeIcon className="w-4 h-4 mr-1.5" /> Preview
              </button>
              <button
                  onClick={handleDownloadPdf}
                  className="flex items-center px-3 py-1.5 text-xs font-black uppercase rounded-lg shadow-sm bg-slate-600 text-text-inverted hover:opacity-90 transition-all"
              >
                  <DownloadIcon className="w-4 h-4 mr-1.5" /> PDF
              </button>
          </div>
        </div>
        <div className="mt-3 text-sm text-text-muted-themed">
            <span className="font-bold text-text-base-themed">{accountName || 'All Accounts'}</span>
            <span className="mx-2 text-border-primary">|</span>
            <span className="font-medium">{periodLabel}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-text-muted-themed border-collapse">
          <thead className="hidden sm:table-header-group text-xs text-text-base-themed uppercase bg-bg-accent-themed">
            <tr>
              <th scope="col" className="px-5 py-3"><div className="flex items-center gap-2"><div className="w-1" />Date</div></th>
              <th scope="col" className="px-5 py-3">Description</th>
              <th scope="col" className="px-5 py-3 text-right">Debit</th>
              <th scope="col" className="px-5 py-3 text-right">Credit</th>
              <th scope="col" className="px-5 py-3 text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="block sm:table-row-group">
            {displayOrderTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((tx, index) => {
              const isIncome = !!tx.credit;
              const isExpense = !!tx.debit;
              const indicatorColor = isIncome ? currentThemeColors.income : isExpense ? currentThemeColors.expense : currentThemeColors.brandPrimary;
              
              return (
                <tr key={tx.id} className={`block sm:table-row border-b border-border-secondary ${index % 2 === 0 ? 'bg-bg-secondary-themed' : 'bg-bg-accent-themed/50'} hover:bg-bg-accent-themed transition-colors p-3 sm:p-0 mb-3 sm:mb-0 rounded-xl sm:rounded-none shadow-sm sm:shadow-none`}>
                  <td className="px-5 py-2 sm:py-3 sm:table-cell whitespace-nowrap flex justify-between items-center gap-2 align-middle">
                    <span className="sm:hidden font-black text-text-muted-themed uppercase text-[10px] tracking-widest">Date</span>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-6 rounded-full" style={{ backgroundColor: indicatorColor }} />
                      {formatDate(tx.date)}
                    </div>
                  </td>
                  <td className="px-5 py-2 sm:py-3 sm:table-cell font-medium text-text-base-themed max-w-xs sm:max-w-none flex justify-between items-center align-middle">
                    <span className="sm:hidden font-black text-text-muted-themed uppercase text-[10px] tracking-widest">Description</span>
                    <span className="truncate text-right sm:text-left w-full sm:w-auto ml-4 sm:ml-0">{tx.description}</span>
                  </td>
                  <td className="px-5 py-2 sm:py-3 sm:table-cell text-right font-black flex justify-between items-center align-middle" style={{color: currentThemeColors.expense}}>
                    <span className="sm:hidden font-black text-text-muted-themed uppercase text-[10px] tracking-widest">Debit</span>
                    {tx.debit ? formatCurrency(tx.debit) : '–'}
                  </td>
                  <td className="px-5 py-2 sm:py-3 sm:table-cell text-right font-black flex justify-between items-center align-middle" style={{color: currentThemeColors.income}}>
                    <span className="sm:hidden font-black text-text-muted-themed uppercase text-[10px] tracking-widest">Credit</span>
                    {tx.credit ? formatCurrency(tx.credit) : '–'}
                  </td>
                  <td className="px-5 py-2 sm:py-3 sm:table-cell text-right font-black flex justify-between items-center align-middle" style={{color: tx.runningBalance < 0 ? currentThemeColors.expense : currentThemeColors.textBase}}>
                    <span className="sm:hidden font-black text-text-muted-themed uppercase text-[10px] tracking-widest">Balance</span>
                    {formatCurrency(tx.runningBalance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center text-sm">
          <button onClick={handlePreviousPage} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg shadow-sm flex items-center transition-all disabled:opacity-50" style={{backgroundColor: currentThemeColors.bgAccent, color: currentThemeColors.textBase, border: `1px solid ${currentThemeColors.borderSecondary}`}}><ChevronLeftIcon className="w-4 h-4 mr-1" /> Previous</button>
          <span className="text-text-muted-themed">Page {currentPage} of {totalPages}</span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg shadow-sm flex items-center transition-all disabled:opacity-50" style={{backgroundColor: currentThemeColors.bgAccent, color: currentThemeColors.textBase, border: `1px solid ${currentThemeColors.borderSecondary}`}}>Next <ChevronRightIcon className="w-4 h-4 ml-1" /></button>
        </div>
      )}

      {isPreviewModalOpen && (
          <ReportPreviewModal 
            isOpen={isPreviewModalOpen} 
            onClose={() => setIsPreviewModalOpen(false)} 
            entries={displayOrderTransactions} 
            title={`${appTitle} - Passbook Preview`} 
            onDownload={handleDownloadPdf}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            pdfOrientation={pdfOrientation}
          />
      )}
    </div>
  );
};

const ReportPreviewModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    entries: PassbookDisplayEntry[];
    title: string;
    onDownload: () => void;
    formatCurrency: (amount: number) => string;
    formatDate: (d: string) => string;
    pdfOrientation: PdfPageOrientation;
}> = ({ isOpen, onClose, entries, title, onDownload, formatCurrency, formatDate, pdfOrientation }) => {
    const { currentThemeColors } = useTheme();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className={`bg-white dark:bg-slate-900 w-full ${pdfOrientation === 'landscape' ? 'max-w-6xl' : 'max-w-4xl'} max-h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-modal-enter overflow-hidden border border-slate-200 dark:border-slate-800`} onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <DocumentChartBarIcon className="w-6 h-6 text-brand-primary" />
                        <div>
                            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{title}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Layout: {pdfOrientation}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"><XIcon className="w-5 h-5 text-slate-500" /></button>
                </div>
                <div className="flex-grow overflow-auto p-4">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead className="hidden sm:table-header-group sticky top-0 bg-bg-accent-themed z-10">
                            <tr>
                                <th className="pl-6 pr-4 py-3 border-b border-border-secondary">Date</th>
                                <th className="px-4 py-3 border-b border-border-secondary">Description</th>
                                <th className="px-4 py-3 border-b border-border-secondary text-right">Debit</th>
                                <th className="px-4 py-3 border-b border-border-secondary text-right">Credit</th>
                                <th className="pl-4 pr-10 py-3 border-b border-border-secondary text-right">Running Balance</th>
                            </tr>
                        </thead>
                        <tbody className="block sm:table-row-group">
                            {entries.map(tx => (
                                <tr key={tx.id} className="block sm:table-row hover:bg-bg-accent-themed/30 border-b border-border-secondary p-3 sm:p-0 mb-2 sm:mb-0 rounded-lg sm:rounded-none">
                                    <td className="pl-6 pr-4 py-2 sm:p-3 sm:table-cell font-medium whitespace-nowrap flex justify-between items-center">
                                        <span className="sm:hidden font-black text-text-muted-themed uppercase text-[9px] tracking-widest">Date</span>
                                        {formatDate(tx.date)}
                                    </td>
                                    <td className="px-4 py-2 sm:p-3 sm:table-cell text-text-base-themed flex justify-between items-center">
                                        <span className="sm:hidden font-black text-text-muted-themed uppercase text-[9px] tracking-widest">Description</span>
                                        <span className="truncate text-right sm:text-left w-full sm:w-auto ml-4 sm:ml-0">{tx.description}</span>
                                    </td>
                                    <td className="px-4 py-2 sm:p-3 sm:table-cell text-right font-bold text-expense flex justify-between items-center">
                                        <span className="sm:hidden font-black text-text-muted-themed uppercase text-[9px] tracking-widest">Debit</span>
                                        {tx.debit ? formatCurrency(tx.debit) : '-'}
                                    </td>
                                    <td className="px-4 py-2 sm:p-3 sm:table-cell text-right font-bold text-income flex justify-between items-center">
                                        <span className="sm:hidden font-black text-text-muted-themed uppercase text-[9px] tracking-widest">Credit</span>
                                        {tx.credit ? formatCurrency(tx.credit) : '-'}
                                    </td>
                                    <td className="pl-4 pr-10 py-2 sm:p-3 sm:table-cell text-right font-black flex justify-between items-center">
                                        <span className="sm:hidden font-black text-text-muted-themed uppercase text-[9px] tracking-widest">Balance</span>
                                        {formatCurrency(tx.runningBalance)}
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
