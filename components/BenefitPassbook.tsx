
import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, PdfTableTheme, PdfPageSize, PdfPageOrientation, PdfTableOverflow } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { HistoryIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon, EyeIcon, XIcon, DocumentChartBarIcon } from './Icons';
import { LOCAL_STORAGE_PROFILE_PICTURE_KEY } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';
import { lightenHexColor } from '../utils/colorUtils';

interface BenefitPassbookProps {
  transactions: Transaction[];
  appTitle: string;
  initialCashback: number;
  onClose: () => void;
}

interface BenefitEntry {
  id: string;
  date: string;
  description: string;
  category?: string;
  cashback?: number;
  coupon?: number;
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 0a2.25 2.25 0 0 1-2.25-2.25V5.625c0-.621.504-1.125h12.75c.621 0 1.125.504 1.125 1.125V7.5a2.25 2.25 0 0 1 2.25 2.25m-19.5 0v10.125c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125V9.75M12 9.75v11.25" />
    </svg>
);

export const BenefitPassbook: React.FC<BenefitPassbookProps> = ({ transactions, appTitle, initialCashback, onClose }) => {
  const { currentThemeColors } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [profilePicture] = useLocalStorage<string | null>(LOCAL_STORAGE_PROFILE_PICTURE_KEY, null);
  const [pdfStyle, setPdfStyle] = useState<PdfTableTheme>('striped');
  const [pdfPageSize, setPdfPageSize] = useState<PdfPageSize>('a4');
  const [pdfOrientation, setPdfOrientation] = useState<PdfPageOrientation>('portrait');
  const [pdfOverflow, setPdfOverflow] = useState<PdfTableOverflow>('shrink');

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

  const benefitEntries: BenefitEntry[] = useMemo(() => {
    const filtered = transactions.filter(t => !t.isDeleted && ((t.cashbackAmount && t.cashbackAmount > 0) || (t.couponUsed && t.couponUsed > 0)));
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date + 'T00:00:00').getTime();
      const dateB = new Date(b.date + 'T00:00:00').getTime();
      if (dateA !== dateB) return dateA - dateB;
      
      if (a.createdAt && b.createdAt) {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return (a.id || '').localeCompare(b.id || '');
    });

    let currentBalance = initialCashback;
    return sorted.map(tx => {
      if (tx.cashbackAmount) currentBalance += tx.cashbackAmount;
      if (tx.couponUsed) currentBalance -= tx.couponUsed;
      
      return {
        id: tx.id,
        date: tx.date,
        description: tx.description,
        category: tx.category,
        cashback: tx.cashbackAmount,
        coupon: tx.couponUsed,
        runningBalance: currentBalance
      };
    });
  }, [transactions, initialCashback]);

  const displayEntries = useMemo(() => [...benefitEntries], [benefitEntries]);
  const totalPages = Math.ceil(displayEntries.length / ITEMS_PER_PAGE);

  const handleDownloadPdf = () => {
    if (displayEntries.length === 0) {
      alert("No benefits to download.");
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
      
      doc.setFontSize(16); doc.text(`${appTitle} - Benefit Passbook`, 14, 18); doc.setFontSize(11); doc.setTextColor(50);
      doc.text(`Initial Cashback: ${formatCurrency(initialCashback)}`, 14, 25);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30); 
      
      const tableColumn = ["Date", "Description", "Coupon (-)", "Cashback (+)", "Balance"];
      const tableRows = [
        ["Opening", "Initial Cashback Balance", "-", "-", formatCurrencyForPdfTable(initialCashback)],
        ...displayEntries.map(tx => [
          formatDate(tx.date), tx.description,
          tx.coupon ? formatCurrencyForPdfTable(tx.coupon) : '-',
          tx.cashback ? formatCurrencyForPdfTable(tx.cashback) : '-',
          formatCurrencyForPdfTable(tx.runningBalance)
        ])
      ];

      autoTable(doc, {
        head: [tableColumn], body: tableRows, startY: 35,
        theme: pdfStyle === 'financial' ? 'plain' : pdfStyle,
        headStyles: { fillColor: currentThemeColors.brandPrimary },
        styles: { fontSize: 8, cellPadding: 1.5 },
        didParseCell: (data: any) => {
            if(data.section === 'body' && data.row.index > 0) {
                const tx = displayEntries[data.row.index - 1];
                if (pdfStyle === 'financial' && tx) {
                  data.cell.styles.fillColor = !!tx.cashback ? lightenHexColor(currentThemeColors.income, 0.1) : lightenHexColor(currentThemeColors.expense, 0.1);
                }
            } else if (data.section === 'body' && data.row.index === 0) {
                if (pdfStyle === 'financial') {
                  data.cell.styles.fillColor = lightenHexColor('#f8fafc', 0.1);
                }
            }
        },
      });
      
      doc.save(`Benefit_Passbook_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) { console.error("Error generating PDF:", e); alert(`Error: ${e}`); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-bg-secondary-themed w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-modal-enter overflow-hidden border border-border-secondary">
        <div className="p-4 border-b border-border-secondary flex justify-between items-center bg-bg-accent-themed">
          <div className="flex items-center gap-3">
            <HistoryIcon className="w-6 h-6 text-brand-primary" />
            <div>
              <h3 className="font-black text-text-base-themed uppercase tracking-tight">Benefit Passbook</h3>
              <p className="text-[10px] font-bold text-text-muted-themed uppercase tracking-widest">Cashback & Coupons History</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPdfOrientation(o => o === 'portrait' ? 'landscape' : 'portrait')} className="p-2 hover:bg-bg-primary-themed rounded-lg transition-colors">
                {pdfOrientation === 'portrait' ? <PortraitIcon className="w-4 h-4" /> : <LandscapeIcon className="w-4 h-4" />}
            </button>
            <button onClick={handleDownloadPdf} className="p-2 hover:bg-bg-primary-themed rounded-lg transition-colors text-brand-primary">
                <DownloadIcon className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-bg-primary-themed rounded-lg transition-colors"><XIcon className="w-5 h-5 text-text-muted-themed" /></button>
          </div>
        </div>

        <div className="flex-grow overflow-auto p-4 sm:p-6">
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-bg-primary-themed rounded-xl border border-border-secondary">
              <p className="text-[9px] font-black text-text-muted-themed uppercase tracking-widest mb-1">Initial Cashback</p>
              <p className="text-lg font-bold text-text-base-themed">{formatCurrency(initialCashback)}</p>
            </div>
            <div className="p-4 bg-bg-primary-themed rounded-xl border border-border-secondary">
              <p className="text-[9px] font-black text-text-muted-themed uppercase tracking-widest mb-1">Total Benefits Used</p>
              <p className="text-lg font-bold text-expense">{formatCurrency(benefitEntries.reduce((acc, e) => acc + (e.coupon || 0), 0))}</p>
            </div>
            <div className="p-4 bg-bg-primary-themed rounded-xl border border-border-secondary">
              <p className="text-[9px] font-black text-text-muted-themed uppercase tracking-widest mb-1">Current Benefit Balance</p>
              <p className="text-lg font-bold text-income">{formatCurrency(initialCashback + benefitEntries.reduce((acc, e) => acc + (e.cashback || 0) - (e.coupon || 0), 0))}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="sticky top-0 bg-bg-accent-themed z-10">
                <tr className="text-[10px] font-black text-text-muted-themed uppercase tracking-widest">
                  <th className="px-4 py-3 border-b border-border-secondary w-[120px]">Date</th>
                  <th className="px-4 py-3 border-b border-border-secondary">Description</th>
                  <th className="px-4 py-3 border-b border-border-secondary text-right w-[100px]">Coupon (-)</th>
                  <th className="px-4 py-3 border-b border-border-secondary text-right w-[100px]">Cashback (+)</th>
                  <th className="px-4 py-3 border-b border-border-secondary text-right w-[120px]">Balance</th>
                </tr>
              </thead>
              <tbody>
                {currentPage === 1 && (
                  <tr className="bg-bg-accent-themed/10 border-b border-border-secondary italic">
                    <td className="px-4 py-3 whitespace-nowrap text-text-muted-themed italic">Opening</td>
                    <td className="px-4 py-3 font-medium text-text-muted-themed">Initial Cashback Balance</td>
                    <td className="px-4 py-3 text-right">-</td>
                    <td className="px-4 py-3 text-right">-</td>
                    <td className="px-4 py-3 text-right font-black text-text-base-themed">{formatCurrency(initialCashback)}</td>
                  </tr>
                )}
                {displayEntries.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(tx => (
                  <tr key={tx.id} className="hover:bg-bg-accent-themed/30 border-b border-border-secondary group transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-text-muted-themed">{formatDate(tx.date)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-base-themed">{tx.description}</p>
                      <p className="text-[9px] font-bold text-text-muted-themed uppercase tracking-tighter">{tx.category}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-expense">{tx.coupon ? `-${formatCurrency(tx.coupon)}` : '-'}</td>
                    <td className="px-4 py-3 text-right font-bold text-income">{tx.cashback ? `+${formatCurrency(tx.cashback)}` : '-'}</td>
                    <td className="px-4 py-3 text-right font-black text-text-base-themed">{formatCurrency(tx.runningBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-border-secondary flex justify-between items-center bg-bg-accent-themed">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 disabled:opacity-30"><ChevronLeftIcon className="w-5 h-5" /></button>
            <span className="text-xs font-bold text-text-muted-themed uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 disabled:opacity-30"><ChevronRightIcon className="w-5 h-5" /></button>
          </div>
        )}

        <div className="p-4 border-t border-border-secondary bg-bg-secondary-themed sm:hidden">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-brand-primary text-white font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-transform"
          >
            Close Passbook
          </button>
        </div>
      </div>
    </div>
  );
};
