import React, { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, TransactionType, PdfTableTheme } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { XIcon, DownloadIcon, PlusIcon } from './Icons';
import { LOCAL_STORAGE_PROFILE_PICTURE_KEY } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';
import { lightenHexColor } from '../utils/colorUtils';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  transactions: Transaction[];
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
  accountName,
  appTitle,
  showDownloadButton,
  onAddTransaction,
}) => {
  const { currentThemeColors } = useTheme();
  const [profilePicture] = useLocalStorage<string | null>(LOCAL_STORAGE_PROFILE_PICTURE_KEY, null);
  const [pdfStyle, setPdfStyle] = useState<PdfTableTheme>('striped');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const formattedDate = useMemo(() => {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [date]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
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

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-[100] transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-detail-modal-title"
    >
      <div
        className="bg-bg-secondary-themed p-5 sm:p-6 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modalEnter flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 id="transaction-detail-modal-title" className="text-lg font-semibold text-text-base-themed">
              Transactions for {formattedDate}
            </h2>
            {accountName && <p className="text-sm text-text-muted-themed">Account: {accountName}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-text-muted-themed hover:bg-bg-accent-themed hover:text-text-base-themed focus:outline-none focus:ring-1 focus:ring-brand-primary"
            aria-label="Close transaction details"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {transactions.length > 0 ? (
          <>
            <div className="flex-grow overflow-y-auto pr-2 mb-4" style={{maxHeight: '60vh'}}>
                <ul className="space-y-3">
                {transactions.map(tx => (
                    <li key={tx.id} className="p-2 bg-bg-primary-themed rounded-md">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-text-base-themed">{tx.description}</p>
                                <p className="text-xs text-text-muted-themed">{tx.category || 'Uncategorized'}</p>
                            </div>
                            <span
                                className={`text-sm font-semibold ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}
                                style={{ color: tx.type === 'income' ? currentThemeColors.income : currentThemeColors.expense }}
                            >
                                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </span>
                        </div>
                        {tx.items && tx.items.length > 0 && (
                            <div className="pl-4 mt-2 text-xs border-l-2 ml-2" style={{borderColor: currentThemeColors.borderSecondary}}>
                                <ul className="space-y-1">
                                    {tx.items.map((item, index) => (
                                        <li key={index} className="text-text-muted-themed flex justify-between">
                                            <span>{item.quantity} x {item.name} (@{formatCurrency(item.price)})</span>
                                            <span className="font-medium text-text-base-themed">{formatCurrency(item.quantity * item.price)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </li>
                ))}
                </ul>
            </div>
            
            <div className="mt-auto pt-4 border-t border-border-secondary">
                <div className="space-y-1 text-sm mb-4">
                    <div className="flex justify-between">
                        <span className="text-text-muted-themed">Total Income:</span>
                        <span className="font-semibold" style={{ color: currentThemeColors.income }}>{formatCurrency(totalIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-muted-themed">Total Expenses:</span>
                        <span className="font-semibold" style={{ color: currentThemeColors.expense }}>{formatCurrency(totalExpenses)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base">
                        <span className="text-text-base-themed">Net Total:</span>
                        <span style={{ color: netTotal >= 0 ? currentThemeColors.income : currentThemeColors.expense }}>{formatCurrency(netTotal)}</span>
                    </div>
                </div>

                 <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                        onClick={() => onAddTransaction(date)}
                        className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-md text-text-inverted hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out"
                        style={{ backgroundColor: currentThemeColors.brandPrimary, '--focus-ring-color': currentThemeColors.brandPrimary, '--focus-ring-offset-color': currentThemeColors.bgSecondary } as React.CSSProperties}
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Add Transaction for this Day
                    </button>
                    {showDownloadButton && (
                         <div className="w-full flex items-center gap-2">
                            <select
                                value={pdfStyle}
                                onChange={(e) => setPdfStyle(e.target.value as PdfTableTheme)}
                                className="px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-1"
                                style={{
                                    backgroundColor: currentThemeColors.bgPrimary,
                                    borderColor: currentThemeColors.borderPrimary,
                                    color: currentThemeColors.textBase,
                                    '--focus-ring-color': currentThemeColors.brandPrimary
                                } as React.CSSProperties}
                            >
                                <option value="striped">Striped</option>
                                <option value="grid">Grid</option>
                                <option value="plain">Plain</option>
                                <option value="financial">Financial</option>
                            </select>
                            <button
                                onClick={handleDownloadBill}
                                className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all"
                            >
                                <DownloadIcon className="w-5 h-5 mr-2" />
                                Download Bill
                            </button>
                        </div>
                    )}
                </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-text-muted-themed">No transactions recorded for this day.</p>
            <button
                onClick={() => onAddTransaction(date)}
                className="mt-4 inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-md text-text-inverted hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out"
                style={{ backgroundColor: currentThemeColors.brandPrimary, '--focus-ring-color': currentThemeColors.brandPrimary, '--focus-ring-offset-color': currentThemeColors.bgSecondary } as React.CSSProperties}
            >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add First Transaction
            </button>
          </div>
        )}
      </div>
       <style>{`
        @keyframes modalEnter {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modalEnter {
          animation: modalEnter 0.3s forwards;
        }
      `}</style>
    </div>
  );
};

export default TransactionDetailModal;