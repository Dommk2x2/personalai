
import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, TransactionType } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, XCircleIcon } from './Icons';
import TransactionList from './TransactionList';

interface YearlyFinancialGridProps {
  allTransactions: Transaction[];
  incomeCategories: string[];
  expenseCategories: string[];
  appTitle: string;
  startDate: string | null;
  showCategories?: boolean;
  onEditTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onUpdateTransaction?: (transaction: Transaction) => void;
}

const YearlyFinancialGrid: React.FC<YearlyFinancialGridProps> = ({ 
  allTransactions, 
  incomeCategories, 
  expenseCategories, 
  appTitle, 
  startDate, 
  showCategories = true,
  onEditTransaction,
  onDeleteTransaction,
  onUpdateTransaction
}) => {
  const { currentThemeColors } = useTheme();
  
  const initialYear = useMemo(() => 
    startDate ? new Date(startDate + 'T00:00:00').getFullYear() : new Date().getFullYear(),
    [startDate]
  );
  
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [selectedCell, setSelectedCell] = useState<{ category: string, monthIndex: number, type: 'income' | 'expense' | 'transfer' } | null>(null);
  const TRANSFER_CATEGORY = "Internal Transfer";

  const handleCellClick = (category: string, monthIndex: number, type: 'income' | 'expense' | 'transfer') => {
    setSelectedCell({ category, monthIndex, type });
  };

  const closeModal = () => {
    setSelectedCell(null);
  };

  const cellTransactions = useMemo(() => {
    if (!selectedCell) return [];
    return allTransactions.filter(tx => {
      const txDate = new Date(tx.date + 'T00:00:00');
      const isSameYear = txDate.getFullYear() === currentYear;
      const isSameMonth = txDate.getMonth() === selectedCell.monthIndex;
      
      if (selectedCell.type === 'transfer') {
        return isSameYear && isSameMonth && tx.category === TRANSFER_CATEGORY;
      }
      
      return isSameYear && isSameMonth && tx.type === selectedCell.type && tx.category === selectedCell.category;
    });
  }, [allTransactions, selectedCell, currentYear]);

  useEffect(() => {
    setCurrentYear(initialYear);
  }, [initialYear]);

  // Filter transactions to only the calendar year being displayed.
  const transactionsForCurrentCalendarYear = useMemo(() => {
      return (allTransactions ?? []).filter(tx => new Date(tx.date + 'T00:00:00').getFullYear() === currentYear);
  }, [allTransactions, currentYear]);


  const { yearlyOverview } = useMemo(() => {
    const totalIncome = transactionsForCurrentCalendarYear
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);
        
    const totalExpenses = transactionsForCurrentCalendarYear
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);

    return {
        yearlyOverview: {
            totalIncome,
            totalExpenses,
            netSavings: totalIncome - totalExpenses,
        }
    };
  }, [transactionsForCurrentCalendarYear]);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    const isNegative = amount < 0;
    const value = Math.abs(amount);

    if (value === 0) return '-';

    const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);

    return isNegative ? `-${formatted}` : formatted;
  };
  
  const formatCurrencyForPdf = (amount: number | null) => {
    if (amount === null || amount === 0) return '-';
    return new Intl.NumberFormat('en-IN', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
  };

  const { 
      incomeGridData, expenseGridData, transferGridData,
      incomeRowTotals, expenseRowTotals, transferRowTotals,
      incomeColTotals, expenseColTotals, transferColTotals,
      incomeGrandTotal, expenseGrandTotal, transferGrandTotal,
      netColTotals,
      hasData 
  } = useMemo(() => {
    const incomeData: Record<string, number[]> = {};
    (incomeCategories ?? []).forEach(cat => incomeData[cat] = Array(12).fill(0));
    const expenseData: Record<string, number[]> = {};
    (expenseCategories ?? []).forEach(cat => expenseData[cat] = Array(12).fill(0));
    const transferData: Record<string, number[]> = { [TRANSFER_CATEGORY]: Array(12).fill(0) };

    const yearTransactions = transactionsForCurrentCalendarYear.filter(tx => tx.category);
    
    yearTransactions.forEach(tx => {
        const monthIndex = new Date(tx.date + 'T00:00:00').getMonth();
        if (tx.type === 'income' && tx.category && incomeData[tx.category]) {
            incomeData[tx.category][monthIndex] += tx.amount;
        } else if (tx.type === 'expense' && tx.category) {
            if (tx.category === TRANSFER_CATEGORY) {
                transferData[TRANSFER_CATEGORY][monthIndex] += tx.amount;
            } else if (expenseData[tx.category]) {
                expenseData[tx.category][monthIndex] += tx.amount;
            }
        }
    });

    const calcRowTotals = (data: Record<string, number[]>) => Object.fromEntries(Object.entries(data).map(([cat, amounts]) => [cat, amounts.reduce((s, a) => s + a, 0)]));
    const incomeRowTotals = calcRowTotals(incomeData);
    const expenseRowTotals = calcRowTotals(expenseData);
    const transferRowTotals = calcRowTotals(transferData);

    const calcColTotals = (data: Record<string, number[]>, cats: string[]) => {
        const totals = Array(12).fill(0);
        (cats ?? []).forEach(cat => {
            if (data[cat]) {
                for (let i = 0; i < 12; i++) {
                    totals[i] += data[cat][i];
                }
            }
        });
        return totals;
    };
    const incomeColTotals = calcColTotals(incomeData, incomeCategories);
    const expenseColTotals = calcColTotals(expenseData, expenseCategories);
    const transferColTotals = transferData[TRANSFER_CATEGORY];

    const incomeGrandTotal = incomeColTotals.reduce((s, t) => s + t, 0);
    const expenseGrandTotal = expenseColTotals.reduce((s, t) => s + t, 0);
    const transferGrandTotal = transferColTotals.reduce((s, t) => s + t, 0);
    
    const netColTotals = incomeColTotals.map((inc, i) => inc - expenseColTotals[i]);

    return { 
        incomeGridData: incomeData, 
        expenseGridData: expenseData,
        transferGridData: transferData,
        incomeRowTotals, expenseRowTotals, transferRowTotals,
        incomeColTotals, expenseColTotals, transferColTotals,
        incomeGrandTotal, expenseGrandTotal, transferGrandTotal,
        netColTotals,
        hasData: incomeGrandTotal > 0 || expenseGrandTotal > 0 || transferGrandTotal > 0
    };
  }, [transactionsForCurrentCalendarYear, incomeCategories, expenseCategories, TRANSFER_CATEGORY]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const currentIncomeCategories = useMemo(() => 
    (incomeCategories ?? [])
      .filter(cat => incomeRowTotals[cat] > 0)
      .sort((a, b) => incomeRowTotals[b] - incomeRowTotals[a]), 
    [incomeCategories, incomeRowTotals]
  );

  const currentExpenseCategories = useMemo(() => 
    (expenseCategories ?? [])
      .filter(cat => expenseRowTotals[cat] > 0)
      .sort((a, b) => expenseRowTotals[b] - expenseRowTotals[a]), 
    [expenseCategories, expenseRowTotals]
  );
  
  const { monthlySummary, ytdOpeningBalance, ytdClosingBalance } = useMemo(() => {
    let openingBalance = 0;
    const startOfYear = new Date(currentYear, 0, 1).getTime();
    
    (allTransactions ?? []).forEach(tx => {
        const txDate = new Date(tx.date + 'T00:00:00').getTime();
        if (txDate < startOfYear) {
            if (tx.type === 'income') openingBalance += tx.amount;
            else if (tx.type === 'expense') openingBalance -= tx.amount;
        }
    });

    const summary: { openingBalance: number | null, income: number, expense: number, closingBalance: number | null }[] = Array(12).fill(null).map(() => ({
        openingBalance: null,
        income: 0,
        expense: 0,
        closingBalance: null
    }));

    transactionsForCurrentCalendarYear.forEach(tx => {
        const monthIndex = new Date(tx.date + 'T00:00:00').getMonth();
        if (tx.type === 'income') summary[monthIndex].income += tx.amount;
        else if (tx.type === 'expense') summary[monthIndex].expense += tx.amount;
    });

    let currentBalance = openingBalance;
    const today = new Date();
    const currentYearActual = today.getFullYear();
    const currentMonthIndex = today.getMonth();

    for (let i = 0; i < 12; i++) {
        const isFutureMonth = currentYear > currentYearActual || (currentYear === currentYearActual && i > currentMonthIndex);
        
        if (!isFutureMonth) {
            summary[i].openingBalance = currentBalance;
            currentBalance = currentBalance + summary[i].income - summary[i].expense;
            summary[i].closingBalance = currentBalance;
        }
    }

    return { monthlySummary: summary, ytdOpeningBalance: openingBalance, ytdClosingBalance: currentBalance };
  }, [allTransactions, currentYear, transactionsForCurrentCalendarYear]);

  const isCurrentMonth = (index: number) => currentYear === new Date().getFullYear() && index === new Date().getMonth();
  const getCellBg = (index: number) => isCurrentMonth(index) ? `${currentThemeColors.brandPrimary}10` : undefined;

  // ... (rest of component)
  const hasTransfers = transferGrandTotal > 0;

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const reportTitle = `${appTitle} - ${currentYear} Financial Summary`;
    
    doc.setFontSize(16); doc.text(reportTitle, 14, 15);
    doc.setFontSize(10); doc.setTextColor(100); doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 20);

    let yPos = 25;
    
    doc.setFontSize(12); doc.text('Yearly Financial Overview', 14, yPos); yPos += 7;
    autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Amount (INR)']],
        body: [
            ['Total Income', formatCurrencyForPdf(yearlyOverview.totalIncome)],
            ['Total Expenses', formatCurrencyForPdf(yearlyOverview.totalExpenses)],
            ['Net Savings', formatCurrencyForPdf(yearlyOverview.netSavings)],
        ],
        theme: 'striped', headStyles: { fillColor: currentThemeColors.brandPrimary },
        didParseCell: (data: any) => {
            if (data.section === 'body') {
                if (data.row.index === 0) data.cell.styles.textColor = currentThemeColors.income;
                if (data.row.index === 1) data.cell.styles.textColor = currentThemeColors.expense;
                if (data.row.index === 2) data.cell.styles.textColor = yearlyOverview.netSavings >= 0 ? currentThemeColors.income : currentThemeColors.expense;
            }
        }
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;

    const head = [['Category', ...monthNames, 'YTD Total']];
    
    const incomeBody = [
      ...currentIncomeCategories.map(cat => [
          cat,
          ...incomeGridData[cat].map(amount => formatCurrencyForPdf(amount)),
          formatCurrencyForPdf(incomeRowTotals[cat])
      ])
    ];

    const expenseBody = [
      ...currentExpenseCategories.map(cat => [
          cat,
          ...expenseGridData[cat].map(amount => formatCurrencyForPdf(amount)),
          formatCurrencyForPdf(expenseRowTotals[cat])
      ])
    ];

    const transferBody = [[
        'Internal Transfer',
        ...transferGridData['Internal Transfer'].map(amount => formatCurrencyForPdf(amount)),
        formatCurrencyForPdf(transferRowTotals['Internal Transfer'])
    ]];

    const netSavingsGrandTotal = incomeGrandTotal - expenseGrandTotal;

    if (showCategories) {
        // Income Table
        autoTable(doc, {
          startY: yPos, head: [[{ content: 'Income Breakdown', colSpan: 14, styles: { halign: 'center', fillColor: currentThemeColors.income, textColor: '#fff' } }]], theme: 'plain'
        });
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY, head, body: incomeBody, foot: [['Total Income', ...incomeColTotals.map(t => formatCurrencyForPdf(t)), formatCurrencyForPdf(incomeGrandTotal)]],
          theme: 'grid', styles: { fontSize: 7, halign: 'right', cellPadding: 1.5 },
          headStyles: { fillColor: currentThemeColors.income, halign: 'center' }, footStyles: { fillColor: currentThemeColors.bgAccent, textColor: currentThemeColors.textBase, fontStyle: 'bold' },
          columnStyles: { 0: { fontStyle: 'bold', halign: 'left' } },
          didParseCell: (data: any) => {
              if (data.column.index > 0 && data.column.index <= 12) {
                  const monthIndex = data.column.index - 1;
                  if (isCurrentMonth(monthIndex)) {
                      data.cell.styles.fillColor = '#f0f4f8';
                  }
              }
          }
        });
        yPos = (doc as any).lastAutoTable.finalY + 10;
        
        // Expense Table
        autoTable(doc, {
          startY: yPos, head: [[{ content: 'Expense Breakdown', colSpan: 14, styles: { halign: 'center', fillColor: currentThemeColors.expense, textColor: '#fff' } }]], theme: 'plain'
        });
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY, head, body: expenseBody, foot: [['Total Expenses', ...expenseColTotals.map(t => formatCurrencyForPdf(t)), formatCurrencyForPdf(expenseGrandTotal)]],
          theme: 'grid', styles: { fontSize: 7, halign: 'right', cellPadding: 1.5 },
          headStyles: { fillColor: currentThemeColors.expense, halign: 'center' }, footStyles: { fillColor: currentThemeColors.bgAccent, textColor: currentThemeColors.textBase, fontStyle: 'bold' },
          columnStyles: { 0: { fontStyle: 'bold', halign: 'left' } },
          didParseCell: (data: any) => {
              if (data.column.index > 0 && data.column.index <= 12) {
                  const monthIndex = data.column.index - 1;
                  if (isCurrentMonth(monthIndex)) {
                      data.cell.styles.fillColor = '#f0f4f8';
                  }
              }
          }
        });
        yPos = (doc as any).lastAutoTable.finalY + 10;
        
        // Transfer Table
        if(hasTransfers) {
            autoTable(doc, {
              startY: yPos, head: [[{ content: 'Transfers Out Breakdown', colSpan: 14, styles: { halign: 'center', fillColor: currentThemeColors.brandSecondary, textColor: '#fff' } }]], theme: 'plain'
            });
            autoTable(doc, {
              startY: (doc as any).lastAutoTable.finalY, head, body: transferBody, foot: [['Total Transfers Out', ...transferColTotals.map(t => formatCurrencyForPdf(t)), formatCurrencyForPdf(transferGrandTotal)]],
              theme: 'grid', styles: { fontSize: 7, halign: 'right', cellPadding: 1.5 },
              headStyles: { fillColor: currentThemeColors.brandSecondary, halign: 'center' }, footStyles: { fillColor: currentThemeColors.bgAccent, textColor: currentThemeColors.textBase, fontStyle: 'bold' },
              columnStyles: { 0: { fontStyle: 'bold', halign: 'left' } },
              didParseCell: (data: any) => {
                  if (data.column.index > 0 && data.column.index <= 12) {
                      const monthIndex = data.column.index - 1;
                      if (isCurrentMonth(monthIndex)) {
                          data.cell.styles.fillColor = '#f0f4f8';
                      }
                  }
              }
            });
            yPos = (doc as any).lastAutoTable.finalY + 10;
        }
        
        // Net Savings Summary
        autoTable(doc, {
            startY: yPos,
            head: [['Summary', ...monthNames, 'YTD Total']],
            body: [
                ['Total Outflow (Exp+Tfr)', ...expenseColTotals.map((t, i) => formatCurrencyForPdf(t + transferColTotals[i])), formatCurrencyForPdf(expenseGrandTotal + transferGrandTotal)],
                ['Net Savings (Inc-Exp)', ...netColTotals.map(t => formatCurrencyForPdf(t)), formatCurrencyForPdf(netSavingsGrandTotal)]
            ],
            theme: 'grid', headStyles: { fillColor: currentThemeColors.brandPrimary },
            styles: { fontSize: 8, halign: 'right', fontStyle: 'bold'}, columnStyles: { 0: { halign: 'left'}},
            didParseCell: (data: any) => {
                if (data.section === 'body') {
                    const isOutflowRow = data.row.index === 0;
                    const netValue = data.cell.raw; // This will be the formatted string
                    
                    if (isOutflowRow && data.column.index > 0) {
                         data.cell.styles.textColor = currentThemeColors.expense;
                    } else if (!isOutflowRow && data.column.index > 0 && typeof netValue === 'string' && netValue.includes('-')) {
                        data.cell.styles.textColor = currentThemeColors.expense;
                    } else if (!isOutflowRow && data.column.index > 0) {
                        data.cell.styles.textColor = currentThemeColors.income;
                    }
                    
                    if (data.column.index > 0 && data.column.index <= 12) {
                        const monthIndex = data.column.index - 1;
                        if (isCurrentMonth(monthIndex)) {
                            data.cell.styles.fillColor = '#f0f4f8';
                        }
                    }
                }
            }
        });
        yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Monthly Summary (Opening, Income, Expense, Closing)
    autoTable(doc, {
      startY: yPos, head: [[{ content: 'Monthly Summary', colSpan: 14, styles: { halign: 'center', fillColor: currentThemeColors.brandPrimary, textColor: '#fff' } }]], theme: 'plain'
    });
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY,
      head: [['Metric', ...monthNames, 'YTD Total']],
      body: [
          ['Opening Balance', ...monthlySummary.map(m => formatCurrencyForPdf(m.openingBalance)), formatCurrencyForPdf(ytdOpeningBalance)],
          ['Income', ...monthlySummary.map(m => formatCurrencyForPdf(m.income)), formatCurrencyForPdf(yearlyOverview.totalIncome)],
          ['Expense', ...monthlySummary.map(m => formatCurrencyForPdf(m.expense)), formatCurrencyForPdf(yearlyOverview.totalExpenses)],
          ['Closing Balance', ...monthlySummary.map(m => formatCurrencyForPdf(m.closingBalance)), formatCurrencyForPdf(ytdClosingBalance)]
      ],
      theme: 'grid', styles: { fontSize: 7, halign: 'right', cellPadding: 1.5 },
      headStyles: { fillColor: currentThemeColors.brandPrimary, halign: 'center' },
      columnStyles: { 0: { fontStyle: 'bold', halign: 'left' } },
      didParseCell: (data: any) => {
          if (data.section === 'body') {
              if (data.row.index === 1 && data.column.index > 0) data.cell.styles.textColor = currentThemeColors.income;
              if (data.row.index === 2 && data.column.index > 0) data.cell.styles.textColor = currentThemeColors.expense;
              
              if (data.column.index > 0 && data.column.index <= 12) {
                  const monthIndex = data.column.index - 1;
                  if (isCurrentMonth(monthIndex)) {
                      data.cell.styles.fillColor = '#f0f4f8';
                  }
              }
          }
      }
    });

    doc.save(`Yearly_Financial_Summary_${currentYear}.pdf`);
  };
  
  const YearlyOverviewCards = () => {
    const MetricBox = ({ title, value, color, bgColor, progress }: { title: string, value: string, color: string, bgColor: string, progress?: number }) => (
        <div className="p-4 rounded-xl shadow-sm border transition-all hover:shadow-md" style={{ backgroundColor: bgColor, borderColor: `${color}30` }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: `${color}CC` }}>{title}</p>
            <p className="text-2xl font-black" style={{ color }}>{value}</p>
            {progress !== undefined && (
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase" style={{ color: `${color}AA` }}>Usage</span>
                  <span className="text-[10px] font-bold" style={{ color }}>{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ 
                      backgroundColor: color,
                      width: `${Math.min(progress, 100)}%`
                    }} 
                  />
                </div>
              </div>
            )}
        </div>
    );

    const expensePercentage = yearlyOverview.totalIncome > 0 
      ? (yearlyOverview.totalExpenses / yearlyOverview.totalIncome) * 100 
      : 0;

    const savingsPercentage = yearlyOverview.totalIncome > 0
      ? (yearlyOverview.netSavings / yearlyOverview.totalIncome) * 100
      : 0;

    return (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricBox 
              title="YTD INCOME" 
              value={formatCurrency(yearlyOverview.totalIncome)} 
              color={currentThemeColors.income} 
              bgColor={`${currentThemeColors.income}10`} 
            />
            <MetricBox 
              title="YTD EXPENSES" 
              value={formatCurrency(yearlyOverview.totalExpenses)} 
              color={currentThemeColors.expense} 
              bgColor={`${currentThemeColors.expense}10`}
              progress={expensePercentage}
            />
            <MetricBox 
              title="NET SAVINGS" 
              value={formatCurrency(yearlyOverview.netSavings)} 
              color={yearlyOverview.netSavings >= 0 ? currentThemeColors.brandPrimary : currentThemeColors.expense} 
              bgColor={`${yearlyOverview.netSavings >= 0 ? currentThemeColors.brandPrimary : currentThemeColors.expense}10`}
              progress={savingsPercentage > 0 ? savingsPercentage : 0}
            />
        </div>
    );
  };


  const { minYear, maxYear } = useMemo(() => {
    if (!allTransactions || allTransactions.length === 0) {
      const current = new Date().getFullYear();
      return { minYear: current, maxYear: current };
    }
    const years = allTransactions.map(tx => new Date(tx.date + 'T00:00:00').getFullYear());
    const current = new Date().getFullYear();
    return {
      minYear: Math.min(...years, current),
      maxYear: Math.max(...years, current)
    };
  }, [allTransactions]);

  const handlePrevYear = () => {
    if (currentYear > minYear) setCurrentYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    if (currentYear < maxYear) setCurrentYear(prev => prev + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={handlePrevYear} 
            disabled={currentYear <= minYear} 
            className={`p-2 rounded-full ${currentYear <= minYear ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <ChevronLeftIcon />
          </button>
          <span className="text-xl font-bold text-brand-primary">{currentYear}</span>
          <button 
            onClick={handleNextYear} 
            disabled={currentYear >= maxYear} 
            className={`p-2 rounded-full ${currentYear >= maxYear ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <ChevronRightIcon />
          </button>
        </div>
        <button
          onClick={handleDownloadPdf}
          disabled={!hasData}
          className="flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-md text-text-inverted bg-brand-secondary hover:opacity-90 disabled:opacity-50"
        >
          <DownloadIcon className="w-4 h-4 mr-2" /> Download PDF
        </button>
      </div>

      <YearlyOverviewCards />

      {!hasData ? (
        <div className="text-center py-10 text-text-muted-themed h-64 flex flex-col justify-center items-center">
            <p>No financial data found for {currentYear}.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg" style={{ borderColor: currentThemeColors.borderPrimary }}>
            <table className="min-w-full text-[10px] sm:text-[11px] text-right border-collapse">
            <thead className="sticky top-0 z-10" style={{ backgroundColor: currentThemeColors.bgAccent }}>
                <tr>
                    <th className="sticky left-0 p-1.5 sm:p-2 border-r border-b text-left font-semibold" style={{ backgroundColor: currentThemeColors.bgAccent, borderColor: currentThemeColors.borderSecondary }}>Category</th>
                    {monthNames.map((month, index) => {
                        return (
                            <th key={month} className={`p-1.5 sm:p-2 border-l border-b font-semibold ${isCurrentMonth(index) ? 'bg-brand-primary text-text-inverted' : ''}`} style={{ borderColor: currentThemeColors.borderSecondary }}>
                                {month}
                            </th>
                        );
                    })}
                    <th className="p-1.5 sm:p-2 border-l border-b font-semibold" style={{ borderColor: currentThemeColors.borderSecondary, backgroundColor: `${currentThemeColors.brandPrimary}15` }}>YTD Total</th>
                </tr>
            </thead>
            <tbody>
              {/* Monthly Summary Section */}
              <tr className="font-semibold text-xs" style={{ backgroundColor: `${currentThemeColors.brandPrimary}15` }}>
                <td colSpan={14} className="sticky left-0 p-1.5 sm:p-2 text-left" style={{ color: currentThemeColors.textBase }}>Monthly Summary</td>
              </tr>
              <tr className="border-t" style={{ borderColor: currentThemeColors.borderSecondary }}>
                  <td className="sticky left-0 font-semibold p-1.5 sm:p-2 border-r text-left" style={{ backgroundColor: currentThemeColors.bgAccent, borderColor: currentThemeColors.borderSecondary }}>Opening Balance</td>
                  {monthlySummary.map((data, i) => (
                      <td key={i} className="p-1.5 sm:p-2 border-l" style={{ borderColor: currentThemeColors.borderSecondary, backgroundColor: getCellBg(i), color: currentThemeColors.textBase }}>{formatCurrency(data.openingBalance)}</td>
                  ))}
                  <td className="p-1.5 sm:p-2 border-l font-semibold" style={{ borderColor: currentThemeColors.borderSecondary, backgroundColor: `${currentThemeColors.brandPrimary}05`, color: currentThemeColors.textBase }}>{formatCurrency(ytdOpeningBalance)}</td>
              </tr>
              <tr className="border-t" style={{ borderColor: currentThemeColors.borderSecondary }}>
                  <td className="sticky left-0 font-semibold p-1.5 sm:p-2 border-r text-left" style={{ backgroundColor: currentThemeColors.bgAccent, borderColor: currentThemeColors.borderSecondary }}>Income</td>
                  {monthlySummary.map((data, i) => (
                      <td key={i} className="p-1.5 sm:p-2 border-l" style={{ borderColor: currentThemeColors.borderSecondary, backgroundColor: getCellBg(i), color: data.income > 0 ? currentThemeColors.income : currentThemeColors.textMuted }}>{formatCurrency(data.income)}</td>
                  ))}
                  <td className="p-1.5 sm:p-2 border-l font-semibold" style={{ borderColor: currentThemeColors.borderSecondary, backgroundColor: `${currentThemeColors.brandPrimary}05`, color: currentThemeColors.income }}>{formatCurrency(yearlyOverview.totalIncome)}</td>
              </tr>
              <tr className="border-t" style={{ borderColor: currentThemeColors.borderSecondary }}>
                  <td className="sticky left-0 font-semibold p-1.5 sm:p-2 border-r text-left" style={{ backgroundColor: currentThemeColors.bgAccent, borderColor: currentThemeColors.borderSecondary }}>Expense</td>
                  {monthlySummary.map((data, i) => (
                      <td key={i} className="p-1.5 sm:p-2 border-l" style={{ borderColor: currentThemeColors.borderSecondary, backgroundColor: getCellBg(i), color: data.expense > 0 ? currentThemeColors.expense : currentThemeColors.textMuted }}>{formatCurrency(data.expense)}</td>
                  ))}
                  <td className="p-1.5 sm:p-2 border-l font-semibold" style={{ borderColor: currentThemeColors.borderSecondary, backgroundColor: `${currentThemeColors.brandPrimary}05`, color: currentThemeColors.expense }}>{formatCurrency(yearlyOverview.totalExpenses)}</td>
              </tr>
              <tr className="border-t" style={{ borderColor: currentThemeColors.borderSecondary }}>
                  <td className="sticky left-0 font-semibold p-1.5 sm:p-2 border-r text-left" style={{ backgroundColor: currentThemeColors.bgAccent, borderColor: currentThemeColors.borderSecondary }}>Closing Balance</td>
                  {monthlySummary.map((data, i) => (
                      <td key={i} className="p-1.5 sm:p-2 border-l" style={{ borderColor: currentThemeColors.borderSecondary, backgroundColor: getCellBg(i), color: currentThemeColors.textBase }}>{formatCurrency(data.closingBalance)}</td>
                  ))}
                  <td className="p-1.5 sm:p-2 border-l font-semibold" style={{ borderColor: currentThemeColors.borderSecondary, backgroundColor: `${currentThemeColors.brandPrimary}05`, color: currentThemeColors.textBase }}>{formatCurrency(ytdClosingBalance)}</td>
              </tr>
              <tr className="border-t" style={{ borderColor: currentThemeColors.borderSecondary }}>
                  <td className="sticky left-0 font-semibold p-1.5 sm:p-2 border-r text-left" style={{ backgroundColor: currentThemeColors.bgAccent, borderColor: currentThemeColors.borderSecondary }}>Savings Rate</td>
                  {monthlySummary.map((data, i) => {
                      const rate = data.income > 0 ? ((data.income - data.expense) / data.income) * 100 : 0;
                      return (
                        <td key={i} className="p-1.5 sm:p-2 border-l" style={{ borderColor: currentThemeColors.borderSecondary, backgroundColor: getCellBg(i) }}>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[9px] font-bold" style={{ color: rate >= 0 ? currentThemeColors.income : currentThemeColors.expense }}>
                              {rate > 0 ? `${rate.toFixed(0)}%` : '-'}
                            </span>
                            {rate > 0 && (
                              <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ backgroundColor: currentThemeColors.income, width: `${Math.min(rate, 100)}%` }} />
                              </div>
                            )}
                          </div>
                        </td>
                      );
                  })}
                  <td className="p-1.5 sm:p-2 border-l font-semibold" style={{ borderColor: currentThemeColors.borderSecondary, backgroundColor: `${currentThemeColors.brandPrimary}05` }}>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] font-bold" style={{ color: (yearlyOverview.totalIncome - yearlyOverview.totalExpenses) >= 0 ? currentThemeColors.income : currentThemeColors.expense }}>
                        {yearlyOverview.totalIncome > 0 ? `${((yearlyOverview.totalIncome - yearlyOverview.totalExpenses) / yearlyOverview.totalIncome * 100).toFixed(1)}%` : '-'}
                      </span>
                    </div>
                  </td>
              </tr>

            {/* Income Section */}
            {showCategories && (
              <>
                <tr className="font-semibold text-xs" style={{ backgroundColor: `${currentThemeColors.income}15` }}>
                  <td colSpan={14} className="sticky left-0 p-1.5 sm:p-2 text-left" style={{ color: currentThemeColors.income }}>Income Categories</td>
                </tr>
                {currentIncomeCategories.map(cat => (
                <tr key={cat} className="border-t hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: currentThemeColors.borderSecondary }}>
                    <td className="sticky left-0 font-semibold p-1.5 sm:p-2 border-r text-left" style={{ backgroundColor: currentThemeColors.bgAccent, borderColor: currentThemeColors.borderSecondary }}>{cat}</td>
                    {(incomeGridData[cat] ?? []).map((amount, monthIndex) => (
                    <td 
                      key={monthIndex} 
                      className={`p-1.5 sm:p-2 border-l ${amount > 0 ? 'cursor-pointer hover:bg-black/10 dark:hover:bg-white/10' : ''}`} 
                      style={{ borderColor: currentThemeColors.borderSecondary, backgroundColor: getCellBg(monthIndex), color: amount > 0 ? currentThemeColors.textBase : currentThemeColors.textMuted }}
                      onClick={() => amount > 0 && handleCellClick(cat, monthIndex, 'income')}
                    >
                        {formatCurrency(amount)}
                    </td>
                    ))}
                    <td className="font-bold p-1.5 sm:p-2 border-l" style={{ borderColor: currentThemeColors.borderSecondary, backgroundColor: `${currentThemeColors.income}10` }}>{formatCurrency(incomeRowTotals[cat])}</td>
                </tr>
                ))}
                <tr className="font-bold border-t-2" style={{ backgroundColor: currentThemeColors.bgAccent, borderColor: currentThemeColors.borderPrimary }}>
                  <td className="sticky left-0 p-1.5 sm:p-2 border-r text-left" style={{ backgroundColor: currentThemeColors.bgAccent, borderColor: currentThemeColors.borderSecondary, color: currentThemeColors.income }}>Total Income</td>
                  {incomeColTotals.map((total, i) => <td key={i} className="p-1.5 sm:p-2 border-l" style={{borderColor: currentThemeColors.borderSecondary, backgroundColor: getCellBg(i), color: currentThemeColors.income}}>{formatCurrency(total)}</td>)}
                  <td className="p-1.5 sm:p-2 border-l" style={{borderColor: currentThemeColors.borderSecondary, backgroundColor: `${currentThemeColors.income}20`, color: currentThemeColors.income}}>{formatCurrency(incomeGrandTotal)}</td>
                </tr>
              </>
            )}
            </tbody>
            {/* Expense Section */}
            {showCategories && (
              <tbody>
                <tr className="font-semibold text-xs" style={{ backgroundColor: `${currentThemeColors.expense}15` }}>
                  <td colSpan={14} className="sticky left-0 p-1.5 sm:p-2 text-left" style={{ color: currentThemeColors.expense }}>Expense Categories</td>
                </tr>
                {currentExpenseCategories.map(cat => (
                <tr key={cat} className="border-t hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: currentThemeColors.borderSecondary }}>
                    <td className="sticky left-0 font-semibold p-1.5 sm:p-2 border-r text-left" style={{ backgroundColor: currentThemeColors.bgAccent, borderColor: currentThemeColors.borderSecondary }}>{cat}</td>
                    {(expenseGridData[cat] ?? []).map((amount, monthIndex) => (
                    <td 
                      key={monthIndex} 
                      className={`p-1.5 sm:p-2 border-l ${amount > 0 ? 'cursor-pointer hover:bg-black/10 dark:hover:bg-white/10' : ''}`} 
                      style={{ borderColor: currentThemeColors.borderSecondary, backgroundColor: getCellBg(monthIndex), color: amount > 0 ? currentThemeColors.textBase : currentThemeColors.textMuted }}
                      onClick={() => amount > 0 && handleCellClick(cat, monthIndex, 'expense')}
                    >
                        {formatCurrency(amount)}
                    </td>
                    ))}
                    <td className="font-bold p-1.5 sm:p-2 border-l" style={{ borderColor: currentThemeColors.borderSecondary, backgroundColor: `${currentThemeColors.expense}10` }}>{formatCurrency(expenseRowTotals[cat])}</td>
                </tr>
                ))}
                <tr className="font-bold border-t-2" style={{ backgroundColor: currentThemeColors.bgAccent, borderColor: currentThemeColors.borderPrimary }}>
                  <td className="sticky left-0 p-1.5 sm:p-2 border-r text-left" style={{ backgroundColor: currentThemeColors.bgAccent, borderColor: currentThemeColors.borderSecondary, color: currentThemeColors.expense }}>Total Expenses</td>
                  {expenseColTotals.map((total, i) => <td key={i} className="p-1.5 sm:p-2 border-l" style={{borderColor: currentThemeColors.borderSecondary, backgroundColor: getCellBg(i), color: currentThemeColors.expense}}>{formatCurrency(total)}</td>)}
                  <td className="p-1.5 sm:p-2 border-l" style={{borderColor: currentThemeColors.borderSecondary, backgroundColor: `${currentThemeColors.expense}20`, color: currentThemeColors.expense}}>{formatCurrency(expenseGrandTotal)}</td>
                </tr>
              </tbody>
            )}
            {/* Transfers Section */}
            {showCategories && hasTransfers && (
                <tbody>
                    <tr className="font-semibold text-xs" style={{ backgroundColor: `${currentThemeColors.brandSecondary}15` }}>
                        <td colSpan={14} className="sticky left-0 p-1.5 sm:p-2 text-left" style={{ color: currentThemeColors.brandSecondary }}>Transfers Out</td>
                    </tr>
                    <tr className="border-t hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: currentThemeColors.borderSecondary }}>
                        <td className="sticky left-0 font-semibold p-1.5 sm:p-2 border-r text-left" style={{ backgroundColor: currentThemeColors.bgAccent, borderColor: currentThemeColors.borderSecondary }}>Internal Transfer</td>
                        {(transferGridData['Internal Transfer'] ?? []).map((amount, monthIndex) => (
                            <td 
                              key={monthIndex} 
                              className={`p-1.5 sm:p-2 border-l ${amount > 0 ? 'cursor-pointer hover:bg-black/10 dark:hover:bg-white/10' : ''}`} 
                              style={{ borderColor: currentThemeColors.borderSecondary, backgroundColor: getCellBg(monthIndex), color: amount > 0 ? currentThemeColors.textBase : currentThemeColors.textMuted }}
                              onClick={() => amount > 0 && handleCellClick('Internal Transfer', monthIndex, 'transfer')}
                            >
                                {formatCurrency(amount)}
                            </td>
                        ))}
                        <td className="font-bold p-1.5 sm:p-2 border-l" style={{ borderColor: currentThemeColors.borderSecondary, backgroundColor: `${currentThemeColors.brandSecondary}10` }}>{formatCurrency(transferRowTotals['Internal Transfer'])}</td>
                    </tr>
                </tbody>
            )}
            {/* Net Savings Footer */}
            {showCategories && (
              <tfoot className="sticky bottom-0 font-bold" style={{ backgroundColor: currentThemeColors.bgAccent }}>
                  <tr className="border-t-2" style={{ borderColor: currentThemeColors.borderPrimary }}>
                      <td className="sticky left-0 p-1.5 sm:p-2 border-r text-left" style={{ backgroundColor: currentThemeColors.bgAccent, borderColor: currentThemeColors.borderSecondary, color: currentThemeColors.expense }}>Total Outflow (Exp + Tfr)</td>
                      {expenseColTotals.map((total, i) => (
                          <td key={i} className="p-1.5 sm:p-2 border-l" style={{borderColor: currentThemeColors.borderSecondary, backgroundColor: getCellBg(i), color: currentThemeColors.expense}}>{formatCurrency(total + transferColTotals[i])}</td>
                      ))}
                      <td className="p-1.5 sm:p-2 border-l" style={{borderColor: currentThemeColors.borderSecondary, backgroundColor: `${currentThemeColors.expense}20`, color: currentThemeColors.expense }}>{formatCurrency(expenseGrandTotal + transferGrandTotal)}</td>
                  </tr>
                  <tr className="border-t-2" style={{ borderColor: currentThemeColors.borderPrimary }}>
                      <td className="sticky left-0 p-1.5 sm:p-2 border-r text-left" style={{ backgroundColor: currentThemeColors.bgAccent, borderColor: currentThemeColors.borderSecondary }}>Net Savings (Inc - Exp)</td>
                      {netColTotals.map((total, monthIndex) => (
                          <td key={monthIndex} className="p-1.5 sm:p-2 border-l" style={{ borderColor: currentThemeColors.borderSecondary, backgroundColor: getCellBg(monthIndex), color: total >= 0 ? currentThemeColors.income : currentThemeColors.expense }}>{formatCurrency(total)}</td>
                      ))}
                      <td className="p-1.5 sm:p-2 border-l" style={{ borderColor: currentThemeColors.borderSecondary, backgroundColor: currentThemeColors.bgPrimary, color: (incomeGrandTotal - expenseGrandTotal) >= 0 ? currentThemeColors.income : currentThemeColors.expense }}>{formatCurrency(incomeGrandTotal - expenseGrandTotal)}</td>
                  </tr>
              </tfoot>
            )}
            </table>
        </div>
      )}

      {selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {selectedCell.category} - {monthNames[selectedCell.monthIndex]} {currentYear}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <XCircleIcon />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {cellTransactions.length > 0 ? (
                <TransactionList 
                  transactions={cellTransactions} 
                  onDeleteTransaction={onDeleteTransaction || (() => {})} 
                  onEditTransaction={(tx) => {
                    if (onEditTransaction) onEditTransaction(tx);
                    closeModal();
                  }} 
                  onUpdateTransaction={onUpdateTransaction || (() => {})} 
                  hideFilters={true}
                />
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No transactions found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YearlyFinancialGrid;
