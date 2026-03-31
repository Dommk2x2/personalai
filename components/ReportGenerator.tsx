import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; 
import { Transaction, TransactionType, IncomeCategory as DefaultIncomeCategoriesEnum, BudgetPeriod, BudgetSetting } from '../types';
import { LOCAL_STORAGE_PROFILE_PICTURE_KEY } from '../constants';
import { useTheme } from '../contexts/ThemeContext';
import { ClipboardListIcon, ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon, DownloadIcon, EyeIcon, XIcon } from './Icons';
import { getPeriodDateRange, formatDateToYYYYMMDD, getCurrentPeriodIdentifier, getPreviousPeriodIdentifier, getNextPeriodIdentifier, getDisplayPeriodName } from '../utils/dateUtils';
import useLocalStorage from '../hooks/useLocalStorage';
import { lightenHexColor } from '../utils/colorUtils';

interface ReportGeneratorProps {
  transactions: Transaction[]; 
  allTransactions: Transaction[]; 
  accountName?: string;
  incomeCategories: string[];
  expenseCategories: string[];
  financialMonthStartDay: number;
  financialMonthEndDay: number;
  budgetSettings: BudgetSetting[];
  appTitle: string;
}

type ReportOptionType = 'transactions' | 'category' | 'financialMonthly' | 'budgetPerformance';
type CategoryReportGrouping = 'byCategory' | 'byDate';
type PdfTableTheme = 'striped' | 'grid' | 'plain' | 'financial';


export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ 
    transactions: activeAccountTransactions, 
    allTransactions, 
    accountName,
    incomeCategories,
    expenseCategories,
    financialMonthStartDay,
    financialMonthEndDay,
    budgetSettings,
    appTitle
}) => {
  const { currentThemeColors } = useTheme(); 
  const [profilePicture] = useLocalStorage<string | null>(LOCAL_STORAGE_PROFILE_PICTURE_KEY, null);
  const [reportOption, setReportOption] = useState<ReportOptionType>('transactions');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [financialMonthYear, setFinancialMonthYear] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [categoryReportType, setCategoryReportType] = useState<TransactionType.INCOME | TransactionType.EXPENSE>(TransactionType.EXPENSE);
  const [selectedCategoryForReport, setSelectedCategoryForReport] = useState<string>("ALL");
  const [categoryReportGrouping, setCategoryReportGrouping] = useState<CategoryReportGrouping>('byCategory');
  const [budgetReportPeriod, setBudgetReportPeriod] = useState<BudgetPeriod>(BudgetPeriod.MONTHLY);
  const [budgetReportIdentifier, setBudgetReportIdentifier] = useState<string>(() => getCurrentPeriodIdentifier(BudgetPeriod.MONTHLY, new Date(), financialMonthStartDay));
  const [pdfStyle, setPdfStyle] = useState<PdfTableTheme>('striped');

  // State for new filters
  const [filterType, setFilterType] = useState<'all' | TransactionType.INCOME | TransactionType.EXPENSE>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // State for report preview
  const [previewData, setPreviewData] = useState<Transaction[] | null>(null);

  // Memoized category options for the filter dropdown
  const categoryOptions = useMemo(() => {
    const incomeCats = incomeCategories.filter(cat => cat !== DefaultIncomeCategoriesEnum.INITIAL_BALANCE);
    if (filterType === TransactionType.INCOME) {
        return incomeCats.sort((a, b) => a.localeCompare(b)).map(cat => <option key={`income-${cat}`} value={cat}>{cat}</option>);
    }
    if (filterType === TransactionType.EXPENSE) {
        return expenseCategories.sort((a, b) => a.localeCompare(b)).map(cat => <option key={`expense-${cat}`} value={cat}>{cat}</option>);
    }
    // 'all' types
    return (
        <>
            <optgroup label="Income">
                {[...incomeCats].sort((a, b) => a.localeCompare(b)).map(cat => <option key={`income-${cat}`} value={cat}>{cat}</option>)}
            </optgroup>
            <optgroup label="Expense">
                {[...expenseCategories].sort((a, b) => a.localeCompare(b)).map(cat => <option key={`expense-${cat}`} value={cat}>{cat}</option>)}
            </optgroup>
        </>
    );
  }, [filterType, incomeCategories, expenseCategories]);

  // Handler for changing type filter, which resets category if invalid
  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'all' | TransactionType.INCOME | TransactionType.EXPENSE;
    setFilterType(newType);
    
    const currentList = newType === TransactionType.INCOME ? incomeCategories : expenseCategories;
    if (newType !== 'all' && !currentList.includes(filterCategory)) {
        setFilterCategory('all');
    }
  };

  const addProfilePictureToDoc = (doc: jsPDF) => {
    if (profilePicture) {
        try {
            const imageType = profilePicture.startsWith('data:image/png') ? 'PNG' : 'JPEG';
            let imgWidth = 15;
            let imgHeight = 15;
            try {
                const imgProps = doc.getImageProperties(profilePicture);
                const aspectRatio = (imgProps.width as number) / (imgProps.height as number);
                if (aspectRatio > 1) {
                    imgHeight = 15 / aspectRatio;
                } else {
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
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const formatCurrencyForPdfTable = (amount: number): string => {
    let formatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    return formatted.replace('₹', '').trim();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDayMonthYear = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  const getReportPeriodText = (
    reportType: ReportOptionType,
    start?: string,
    end?: string,
    finMonthYear?: string,
    finStartDay?: number,
    finEndDay?: number
  ): string => {
    if (reportType === 'financialMonthly' && finMonthYear && finStartDay && finEndDay) {
      const [year, monthOneIndexed] = finMonthYear.split('-').map(Number);
      
      const { start: actualFinPeriodStart, end: actualFinPeriodEnd } = getPeriodDateRange(
        BudgetPeriod.MONTHLY, 
        finMonthYear,
        { startDay: finStartDay, endDay: finEndDay }
      );
      
      return `Financial Month: ${new Date(year, monthOneIndexed - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })} (Covers ${formatDayMonthYear(formatDateToYYYYMMDD(actualFinPeriodStart))} to ${formatDayMonthYear(formatDateToYYYYMMDD(actualFinPeriodEnd))})`;
    }
    if (start && end) return `Period: ${formatDate(start)} to ${formatDate(end)}`;
    if (start) return `From: ${formatDate(start)}`;
    if (end) return `Until: ${formatDate(end)}`;
    return 'All Transactions for Account';
  };

  const filterTransactionsByDateRange = (
    sourceTransactions: Transaction[], 
    start?: string,
    end?: string
  ): Transaction[] => {
    let filtered = sourceTransactions;
    if (start) {
      filtered = filtered.filter(tx => tx.date >= start);
    }
    if (end) {
      filtered = filtered.filter(tx => tx.date <= end);
    }
    return filtered;
  };
  
  const addPdfFooter = (doc: jsPDF, title: string) => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
      doc.text(title, 14, doc.internal.pageSize.height - 10);
    }
  };

  const handleEndDateChange = (newEndDate: string) => {
    setEndDate(newEndDate);
    if (newEndDate) {
      const newEndDateObj = new Date(newEndDate + 'T00:00:00');
      if (!isNaN(newEndDateObj.getTime())) {
        const currentStartDateObj = startDate ? new Date(startDate + 'T00:00:00') : null;
        if (!currentStartDateObj || (currentStartDateObj && currentStartDateObj > newEndDateObj)) {
          const year = newEndDateObj.getFullYear();
          const month = newEndDateObj.getMonth() + 1;
          const firstDayOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
          setStartDate(firstDayOfMonth);
        }
      }
    }
  };

  const getFilteredTransactions = useCallback(() => {
    let reportStartDate = startDate;
    let reportEndDate = endDate;
    let isFinancialMonthReport = false;

    if (reportOption === 'financialMonthly') {
        if (!financialMonthYear) {
            alert("Please select a financial month.");
            return null;
        }
        isFinancialMonthReport = true;
        const { start, end } = getPeriodDateRange(
            BudgetPeriod.MONTHLY,
            financialMonthYear,
            { startDay: financialMonthStartDay, endDay: financialMonthEndDay }
        );

        reportStartDate = formatDateToYYYYMMDD(start);
        reportEndDate = formatDateToYYYYMMDD(end);

    } else if (reportOption === 'transactions') {
        if (startDate && endDate && startDate > endDate) {
          alert("Start date cannot be after end date. Please select a valid date range.");
          return null;
        }
    }

    let transactionsFilteredByDate = filterTransactionsByDateRange(activeAccountTransactions, reportStartDate, reportEndDate);
    
    if (reportOption === 'transactions' || reportOption === 'financialMonthly') {
      if (filterType !== 'all') {
        transactionsFilteredByDate = transactionsFilteredByDate.filter(tx => tx.type === filterType);
      }
      if (filterCategory !== 'all') {
        transactionsFilteredByDate = transactionsFilteredByDate.filter(tx => tx.category === filterCategory);
      }
    }
    
    return {
        transactions: transactionsFilteredByDate,
        reportStartDateUsed: reportStartDate,
        reportEndDateUsed: reportEndDate,
        isFinancialReport: isFinancialMonthReport,
        finMonthForTitle: financialMonthYear,
    };
  }, [activeAccountTransactions, startDate, endDate, reportOption, financialMonthYear, filterType, filterCategory, financialMonthStartDay, financialMonthEndDay]);
  
  const handlePreviewReport = () => {
    const result = getFilteredTransactions();
    if (!result) return;
    
    if (result.transactions.length === 0) {
        alert("No transactions found for the selected filters to preview.");
        setPreviewData(null);
    } else {
        const sorted = [...result.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPreviewData(sorted);
    }
  };

  const handleClosePreview = () => {
    setPreviewData(null);
  };

  const handleGenerateReport = () => {
    if (!accountName) {
        alert("Please select an account first.");
        return;
    }
    
    if (reportOption === 'transactions' || reportOption === 'financialMonthly') {
        const result = getFilteredTransactions();
        if (!result) return;
        
        const { transactions: transactionsToReport, reportStartDateUsed, reportEndDateUsed, isFinancialReport, finMonthForTitle } = result;

        if (transactionsToReport.length === 0 && (reportStartDateUsed || reportEndDateUsed || filterType !== 'all' || filterCategory !== 'all')) {
            alert(`No transactions found for account "${accountName}" with the selected filters.`);
            return;
        }
        if (activeAccountTransactions.length === 0 && !reportStartDateUsed && !reportEndDateUsed && reportOption !== 'financialMonthly') {
            alert(`No transactions available for account "${accountName}" to generate a report.`);
            return;
        }
        const reportAccountId = activeAccountTransactions.length > 0 ? activeAccountTransactions[0].accountId : null;
        const allTransactionsForReportAccount = reportAccountId
            ? allTransactions.filter(tx => tx.accountId === reportAccountId)
            : [];
        generateTransactionsPdfReport(allTransactionsForReportAccount, transactionsToReport, reportStartDateUsed, reportEndDateUsed, isFinancialReport, finMonthForTitle, filterType, filterCategory);
    
    } else if (reportOption === 'category') {
        if (startDate && endDate && startDate > endDate) {
          alert("Start date cannot be after end date.");
          return;
        }
        let categorySpecificTransactions = filterTransactionsByDateRange(activeAccountTransactions, startDate, endDate)
            .filter(tx => tx.type === categoryReportType);
        
        if (selectedCategoryForReport !== "ALL") {
            categorySpecificTransactions = categorySpecificTransactions.filter(tx => tx.category === selectedCategoryForReport);
        }

        if (categorySpecificTransactions.length === 0) {
            const forCategoryText = selectedCategoryForReport === "ALL" ? "" : `for category "${selectedCategoryForReport}"`;
            alert(`No ${categoryReportType} transactions found for account "${accountName}" ${forCategoryText} in the selected date range to generate a category report.`);
            return;
        }
        if (categoryReportGrouping === 'byCategory') {
            generateCategoryTotalsPdfReport(categorySpecificTransactions, categoryReportType, selectedCategoryForReport, startDate, endDate);
        } else {
            generateCategoryDetailsPdfReport(categorySpecificTransactions, categoryReportType, selectedCategoryForReport, startDate, endDate);
        }
    } else if (reportOption === 'budgetPerformance') {
        const accountId = activeAccountTransactions[0]?.accountId || budgetSettings[0]?.accountId;
        if (!accountId) {
             alert('Cannot determine account for budget report.');
             return;
        }
        const accountBudgets = budgetSettings.filter(b => b.accountId === accountId);
        generateBudgetPdfReport(budgetReportPeriod, budgetReportIdentifier, activeAccountTransactions, accountBudgets);
    }
  };

  const generateTransactionsPdfReport = (
    accountAllTransactions: Transaction[], 
    reportTransactionsScoped: Transaction[], 
    reportStartDateUsed?: string,
    reportEndDateUsed?: string,
    isFinancialReport: boolean = false,
    finMonthForTitle?: string,
    filterTypeUsed?: 'all' | TransactionType.INCOME | TransactionType.EXPENSE,
    filterCategoryUsed?: string
  ) => {
    try {
      const doc = new jsPDF();
      addProfilePictureToDoc(doc);
      const baseReportTitle = `${appTitle} - ${isFinancialReport ? 'Financial Monthly Report' : 'Standard Transactions Report'}`;
      const accountSubTitle = `Account: ${accountName || 'N/A'}`;
      
      const reportPeriod = getReportPeriodText(
        isFinancialReport ? 'financialMonthly' : 'transactions',
        reportStartDateUsed,
        reportEndDateUsed,
        finMonthForTitle,
        financialMonthStartDay,
        financialMonthEndDay
      );
      const generatedDateTime = new Date().toLocaleString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

      doc.setFontSize(18);
      doc.text(baseReportTitle, 14, 18); 
      doc.setFontSize(12);
      doc.setTextColor(50);
      doc.text(accountSubTitle, 14, 23); 
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Report Generated: ${generatedDateTime}`, 14, 28); 
      doc.text(reportPeriod, 14, 33); 

      let yPos = 33; 

      let filterSubtitle = 'Filters: ';
      const activeFilters = [];
      if(filterTypeUsed && filterTypeUsed !== 'all') {
          activeFilters.push(`Type: ${filterTypeUsed}`);
      }
      if(filterCategoryUsed && filterCategoryUsed !== 'all') {
          activeFilters.push(`Category: ${filterCategoryUsed}`);
      }

      if(activeFilters.length > 0) {
          yPos += 5;
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(filterSubtitle + activeFilters.join(', '), 14, yPos);
      }
      yPos += 9; 

      const openingBalanceForPeriod = reportStartDateUsed
        ? accountAllTransactions 
            .filter(tx => tx.date < reportStartDateUsed!) 
            .reduce((acc, curr) => acc + (curr.type === TransactionType.INCOME ? curr.amount : -curr.amount), 0)
        : 0; 

      const currentPeriodTransactions = reportTransactionsScoped;
      const totalIncomeForPeriod = currentPeriodTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
      const totalExpensesForPeriod = currentPeriodTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
      const netChangeForPeriod = totalIncomeForPeriod - totalExpensesForPeriod;
      const closingBalance = openingBalanceForPeriod + netChangeForPeriod;

      // Summary Table
      autoTable(doc, {
          startY: yPos,
          head: [['Summary Metric', 'Amount (INR)']],
          body: [
              [`Opening Balance (as of ${reportStartDateUsed ? formatDate(reportStartDateUsed) : 'start'})`, formatCurrencyForPdfTable(openingBalanceForPeriod)],
              ['Total Income for Period', formatCurrencyForPdfTable(totalIncomeForPeriod)],
              ['Total Expenses for Period', formatCurrencyForPdfTable(totalExpensesForPeriod)],
              ['Net Change for Period', formatCurrencyForPdfTable(netChangeForPeriod)],
              ['Closing Balance', formatCurrencyForPdfTable(closingBalance)],
          ],
          theme: pdfStyle === 'financial' ? 'plain' : pdfStyle,
          headStyles: { fillColor: currentThemeColors.brandPrimary, fontSize: 10 },
          bodyStyles: { fontSize: 9 },
          didParseCell: (data: any) => {
              if (pdfStyle === 'financial' && data.section === 'body') {
                  const metric = data.row.raw[0];
                  if (typeof metric === 'string') {
                      if (metric.includes('Income')) data.cell.styles.fillColor = lightenHexColor(currentThemeColors.income, 0.1);
                      else if (metric.includes('Expenses')) data.cell.styles.fillColor = lightenHexColor(currentThemeColors.expense, 0.1);
                      else if (metric.includes('Net Change')) {
                          data.cell.styles.fillColor = netChangeForPeriod >= 0 ? lightenHexColor(currentThemeColors.income, 0.1) : lightenHexColor(currentThemeColors.expense, 0.1);
                      } else if (metric.includes('Closing Balance')) {
                          data.cell.styles.fillColor = closingBalance >= 0 ? lightenHexColor(currentThemeColors.income, 0.1) : lightenHexColor(currentThemeColors.expense, 0.1);
                      }
                  }
              }
          },
          didDrawPage: (data: any) => { yPos = data.cursor.y; }
      });
      yPos = (doc as any).lastAutoTable.finalY + 10;

      // Expense Breakdown Table
      const expenseTransactionsForBreakdown = reportTransactionsScoped.filter(tx => tx.type === TransactionType.EXPENSE);
      if (expenseTransactionsForBreakdown.length > 0) {
          doc.setFontSize(14);
          doc.text("Expense Breakdown by Category", 14, yPos);
          yPos += 7;

          const categoryExpenseTotals: Record<string, number> = {};
          expenseTransactionsForBreakdown.forEach(tx => {
              const category = tx.category || 'Uncategorized';
              categoryExpenseTotals[category] = (categoryExpenseTotals[category] || 0) + tx.amount;
          });
          
          const totalExpensesForPie = Object.values(categoryExpenseTotals).reduce((sum, amount) => sum + amount, 0);
          const sortedCategoriesForTable = Object.entries(categoryExpenseTotals).sort((a, b) => b[1] - a[1]);
          
          const breakdownTableRows = sortedCategoriesForTable.map(([category, amount]) => {
              const percentage = totalExpensesForPie > 0 ? `${((amount / totalExpensesForPie) * 100).toFixed(1)}%` : '0.0%';
              return [category, formatCurrencyForPdfTable(amount), percentage];
          });

          autoTable(doc, {
              startY: yPos,
              head: [['Category', 'Amount (INR)', '% of Total']],
              body: breakdownTableRows,
              theme: 'grid',
              headStyles: { fillColor: currentThemeColors.expense, fontSize: 10 },
              bodyStyles: { fontSize: 9 },
              didParseCell: (data: any) => {
                if (pdfStyle === 'financial' && data.section === 'body') {
                    data.cell.styles.fillColor = lightenHexColor(currentThemeColors.expense, 0.1);
                }
              },
              didDrawPage: (data: any) => { yPos = data.cursor.y; }
          });
          yPos = (doc as any).lastAutoTable.finalY + 10;
      }

      // Transaction Details Table
      doc.setFontSize(14);
      doc.text("Transaction Details", 14, yPos);
      yPos += 7; 

      const tableColumn = ["Date", "Description", "Category", "Debit", "Credit", "Running Balance"];
      const tableRows: (string | number)[][] = [];
      let runningBalance = openingBalanceForPeriod;
      const sortedReportTransactions = [...currentPeriodTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      sortedReportTransactions.forEach(tx => {
        runningBalance += (tx.type === TransactionType.INCOME ? tx.amount : -tx.amount);
        tableRows.push([
          formatDate(tx.date),
          tx.description,
          tx.category || '-',
          tx.type === TransactionType.EXPENSE ? formatCurrencyForPdfTable(tx.amount) : '-',
          tx.type === TransactionType.INCOME ? formatCurrencyForPdfTable(tx.amount) : '-',
          formatCurrencyForPdfTable(runningBalance)
        ]);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yPos,
        theme: pdfStyle === 'financial' ? 'plain' : pdfStyle,
        headStyles: { fillColor: currentThemeColors.brandPrimary, fontSize: 9 }, 
        styles: { fontSize: 8, cellPadding: 1.5 },
        columnStyles: {
          3: { halign: 'right' },
          4: { halign: 'right' },
          5: { halign: 'right' },
        },
        didParseCell: (data: any) => {
            if (pdfStyle === 'financial' && data.section === 'body') {
                const tx = sortedReportTransactions[data.row.index];
                if (tx) {
                    data.cell.styles.fillColor = tx.type === TransactionType.INCOME 
                        ? lightenHexColor(currentThemeColors.income, 0.1) 
                        : lightenHexColor(currentThemeColors.expense, 0.1);
                }
            }
        }
      });
      
      addPdfFooter(doc, `${baseReportTitle} - ${accountName || 'Account'}`);
      const dateSuffix = isFinancialReport 
        ? `FinMonth_${finMonthForTitle || 'Current'}`
        : `${reportStartDateUsed || 'All'}_to_${reportEndDateUsed || 'End'}`;
      doc.save(`Financial_Report_${accountName?.replace(/\s+/g, '_') || 'Account'}_${dateSuffix}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      console.error("Error generating Transactions PDF report:", e);
      alert(`Error generating PDF: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const generateCategoryTotalsPdfReport = (
    reportTransactions: Transaction[], 
    selectedType: TransactionType.INCOME | TransactionType.EXPENSE,
    selectedCategoryName: string,
    reportStartDate?: string,
    reportEndDate?: string
  ) => {
    try {
        const doc = new jsPDF();
        addProfilePictureToDoc(doc);
        const typeLabel = selectedType === TransactionType.INCOME ? "Income" : "Expense";
        const reportMainTitle = `${appTitle} - Category ${typeLabel} Totals`;

        const accountSubTitle = `Account: ${accountName || 'N/A'}`;
        const reportPeriod = getReportPeriodText('category', reportStartDate, reportEndDate);
        const generatedDateTime = new Date().toLocaleString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

        doc.setFontSize(18); doc.text(reportMainTitle, 14, 18);
        doc.setFontSize(12); doc.setTextColor(50); doc.text(accountSubTitle, 14, 23);
        doc.setFontSize(11); doc.setTextColor(100); doc.text(`Report Generated: ${generatedDateTime}`, 14, 28);
        doc.text(reportPeriod, 14, 33);

        let yPos = 39;
        
        const categoryTotals: Record<string, number> = {};
        let totalOverallAmount = 0;
        reportTransactions.forEach(tx => {
            const categoryKey = tx.category || "Uncategorized";
            categoryTotals[categoryKey] = (categoryTotals[categoryKey] || 0) + tx.amount;
            totalOverallAmount += tx.amount;
        });

        doc.setFontSize(12); doc.setFont(undefined, 'bold');
        doc.text(`Total ${typeLabel} for Period: ${formatCurrencyForPdfTable(totalOverallAmount)}`, 14, yPos);
        yPos += 7; doc.setFont(undefined, 'normal');

        const tableColumn = [`${typeLabel} Category`, `Total ${selectedType === TransactionType.INCOME ? "Received" : "Spent"}`, `% of Total ${typeLabel}`];
        const tableRows: (string | number)[][] = [];
        
        const sortedCategories = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);
        sortedCategories.forEach(([category, total]) => {
            const percentage = totalOverallAmount > 0 ? ((total / totalOverallAmount) * 100).toFixed(2) + '%' : '0.00%';
            tableRows.push([category, formatCurrencyForPdfTable(total), percentage]);
        });
        
        autoTable(doc, {
            head: [tableColumn], body: tableRows, startY: yPos, theme: pdfStyle === 'financial' ? 'plain' : pdfStyle,
            headStyles: { fillColor: selectedType === TransactionType.INCOME ? currentThemeColors.income : currentThemeColors.expense },
            styles: { fontSize: 9, cellPadding: 1.5 },
            bodyStyles: {
                fillColor: pdfStyle === 'financial' 
                    ? (selectedType === TransactionType.INCOME ? lightenHexColor(currentThemeColors.income, 0.1) : lightenHexColor(currentThemeColors.expense, 0.1))
                    : undefined
            },
            columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 40 }, 2: { cellWidth: 40 } }
        });

        addPdfFooter(doc, `${reportMainTitle} - ${accountName || 'Account'}`);
        doc.save(`Category_Totals_${typeLabel}_Report_${accountName?.replace(/\s+/g, '_') || 'Account'}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
        console.error("Error generating Category Totals PDF report:", e);
        alert(`Error generating PDF: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const generateCategoryDetailsPdfReport = (
    reportTransactions: Transaction[], 
    selectedType: TransactionType.INCOME | TransactionType.EXPENSE,
    selectedCategoryName: string,
    reportStartDate?: string,
    reportEndDate?: string
  ) => {
    try {
        const doc = new jsPDF();
        addProfilePictureToDoc(doc);
        const typeLabel = selectedType === TransactionType.INCOME ? "Income" : "Expense";
        const categoryLabel = selectedCategoryName === "ALL" ? "All Categories" : selectedCategoryName;
        const reportMainTitle = `${appTitle} - Detailed ${typeLabel} Report for ${categoryLabel}`;
        
        const accountSubTitle = `Account: ${accountName || 'N/A'}`;
        const reportPeriod = getReportPeriodText('category', reportStartDate, reportEndDate);
        const generatedDateTime = new Date().toLocaleString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
        
        doc.setFontSize(18); doc.text(reportMainTitle, 14, 18);
        doc.setFontSize(12); doc.setTextColor(50); doc.text(accountSubTitle, 14, 23);
        doc.setFontSize(11); doc.setTextColor(100); doc.text(`Report Generated: ${generatedDateTime}`, 14, 28);
        doc.text(reportPeriod, 14, 33);
        
        let yPos = 39;
        
        const totalForCategory = reportTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        doc.setFontSize(12); doc.setFont(undefined, 'bold');
        doc.text(`Total ${typeLabel} for "${categoryLabel}": ${formatCurrencyForPdfTable(totalForCategory)}`, 14, yPos);
        yPos += 7; doc.setFont(undefined, 'normal');

        const tableColumn = ["Date", "Description", "Category", "Amount"];
        const tableRows: (string | number)[][] = [];
        const sortedTransactionsForCategory = [...reportTransactions].sort((a, b) => new Date(a.date + 'T00:00:00').getTime() - new Date(b.date + 'T00:00:00').getTime());

        sortedTransactionsForCategory.forEach(tx => {
            tableRows.push([formatDate(tx.date), tx.description, tx.category || '-', formatCurrencyForPdfTable(tx.amount)]);
        });

        autoTable(doc, {
            head: [tableColumn], body: tableRows, startY: yPos, theme: pdfStyle === 'financial' ? 'plain' : pdfStyle,
            headStyles: { fillColor: selectedType === TransactionType.INCOME ? currentThemeColors.income : currentThemeColors.expense },
            styles: { fontSize: 9, cellPadding: 1.5 },
            bodyStyles: {
                fillColor: pdfStyle === 'financial' 
                    ? (selectedType === TransactionType.INCOME ? lightenHexColor(currentThemeColors.income, 0.1) : lightenHexColor(currentThemeColors.expense, 0.1))
                    : undefined
            },
            columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 40 }, 3: { cellWidth: 30, halign: 'right' } }
        });

        addPdfFooter(doc, `${reportMainTitle} - ${accountName || 'Account'}`);
        doc.save(`Category_Details_${typeLabel}_Report_${accountName?.replace(/\s+/g, '_') || 'Account'}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
        console.error("Error generating Category Details PDF report:", e);
        alert(`Error generating PDF: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const generateBudgetPdfReport = (
    reportPeriod: BudgetPeriod,
    reportIdentifier: string,
    accountTransactions: Transaction[],
    accountBudgets: BudgetSetting[],
  ) => {
    try {
        const doc = new jsPDF();
        addProfilePictureToDoc(doc);
        const finConfig = { startDay: financialMonthStartDay, endDay: financialMonthEndDay };
        const periodDisplayName = getDisplayPeriodName(reportPeriod, reportIdentifier, reportPeriod === BudgetPeriod.MONTHLY ? finConfig : undefined);
        const reportTitle = `${appTitle} - Budget Performance Report`;
        
        doc.setFontSize(16); doc.text(reportTitle, 14, 18);
        doc.setFontSize(11); doc.setTextColor(50);
        doc.text(`Account: ${accountName || 'N/A'}`, 14, 24);
        doc.text(`Period: ${periodDisplayName}`, 14, 29);
        doc.setFontSize(10); doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 34);

        const { start, end } = getPeriodDateRange(reportPeriod, reportIdentifier, reportPeriod === BudgetPeriod.MONTHLY ? finConfig : undefined);
        const transactionsInPeriod = accountTransactions.filter(tx => tx.date >= formatDateToYYYYMMDD(start) && tx.date <= formatDateToYYYYMMDD(end));
        
        const spendingByCategory: Record<string, number> = {};
        transactionsInPeriod.filter(tx => tx.type === TransactionType.EXPENSE).forEach(tx => {
            if (tx.category) spendingByCategory[tx.category] = (spendingByCategory[tx.category] || 0) + tx.amount;
        });
        
        const budgetsForPeriod = accountBudgets.filter(b => b.period === reportPeriod && b.periodIdentifier === reportIdentifier);
        const budgetByCategory: Record<string, number> = {};
        budgetsForPeriod.forEach(b => { budgetByCategory[b.category] = b.allocated; });

        const allCategoriesInReport = Array.from(new Set([...Object.keys(spendingByCategory), ...Object.keys(budgetByCategory)]));
        
        const tableRows: (string | number)[][] = [];
        let totalAllocated = 0, totalSpent = 0;

        allCategoriesInReport.sort().forEach(category => {
            const allocated = budgetByCategory[category] || 0;
            const spent = spendingByCategory[category] || 0;
            const remaining = allocated - spent;
            totalAllocated += allocated;
            totalSpent += spent;
            tableRows.push([
                category,
                formatCurrencyForPdfTable(allocated),
                formatCurrencyForPdfTable(spent),
                formatCurrencyForPdfTable(remaining)
            ]);
        });
        
        let yPos = 40;
        doc.setFontSize(12); doc.setFont(undefined, 'bold'); doc.text("Overall Summary", 14, yPos); yPos += 6;
        doc.setFontSize(10); doc.setFont(undefined, 'normal');
        doc.text(`Total Budget Allocated: ${formatCurrencyForPdfTable(totalAllocated)}`, 14, yPos); yPos += 5;
        doc.text(`Total Spending: ${formatCurrencyForPdfTable(totalSpent)}`, 14, yPos); yPos += 5;
        doc.setFont(undefined, 'bold');
        doc.text(`Overall Remaining: ${formatCurrencyForPdfTable(totalAllocated - totalSpent)}`, 14, yPos); yPos += 8;

        autoTable(doc, {
            head: [['Category', 'Allocated (INR)', 'Spent (INR)', 'Remaining (INR)']],
            body: tableRows, startY: yPos, theme: pdfStyle === 'financial' ? 'plain' : 'grid',
            headStyles: { fillColor: currentThemeColors.brandPrimary },
            didParseCell: (data: any) => {
                if (data.section === 'body') {
                    const remainingValue = parseFloat(String(data.row.raw[3]).replace(/,/g, ''));
                    if (!isNaN(remainingValue)) {
                        const isNegative = remainingValue < 0;
                        if (data.column.index === 3) { // Only color text in 'Remaining' column
                            data.cell.styles.textColor = isNegative ? currentThemeColors.expense : currentThemeColors.income;
                        }

                        if (pdfStyle === 'financial') {
                            data.cell.styles.fillColor = isNegative ? lightenHexColor(currentThemeColors.expense, 0.1) : lightenHexColor(currentThemeColors.income, 0.1);
                        }
                    }
                }
            }
        });

        addPdfFooter(doc, `${reportTitle} - ${accountName}`);
        doc.save(`Budget_Report_${accountName?.replace(/\s+/g, '_')}_${reportIdentifier}.pdf`);
    } catch (e) {
        console.error("Error generating Budget PDF report:", e);
        alert(`Error generating PDF: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const clearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  const currentCategoryList = useMemo(() => {
    const list = categoryReportType === TransactionType.INCOME 
      ? incomeCategories.filter(cat => cat !== DefaultIncomeCategoriesEnum.INITIAL_BALANCE) 
      : expenseCategories;
    return [...list].sort((a, b) => a.localeCompare(b));
  }, [categoryReportType, incomeCategories, expenseCategories]);

  const handleBudgetPeriodTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPeriodType = event.target.value as BudgetPeriod;
    setBudgetReportPeriod(newPeriodType);
    setBudgetReportIdentifier(getCurrentPeriodIdentifier(newPeriodType, new Date(), financialMonthStartDay));
  };

  const navigateBudgetPeriod = (direction: 'prev' | 'next' | 'current') => {
    if (direction === 'current') {
        setBudgetReportIdentifier(getCurrentPeriodIdentifier(budgetReportPeriod, new Date(), financialMonthStartDay));
    } else {
        const newIdentifier = direction === 'prev' 
            ? getPreviousPeriodIdentifier(budgetReportPeriod, budgetReportIdentifier)
            : getNextPeriodIdentifier(budgetReportPeriod, budgetReportIdentifier);
        setBudgetReportIdentifier(newIdentifier);
    }
  };


  const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-bg-secondary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-text-base-themed dark:[color-scheme:light] placeholder-text-muted-themed";
  const labelBaseClasses = "block text-sm font-medium text-text-muted-themed mb-1";
  const finConfig = { startDay: financialMonthStartDay, endDay: financialMonthEndDay };


  return (
    <div className="bg-bg-secondary-themed p-4 sm:p-6 rounded-xl shadow-lg border border-border-secondary">
      <h2 className="text-lg sm:text-xl font-semibold text-text-base-themed mb-1 flex items-center">
        <ClipboardListIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-brand-primary" />
        Generate Reports {accountName && <span className="text-sm sm:text-base font-normal text-text-muted-themed ml-1">({accountName})</span>}
      </h2>
      
      <div className="my-4">
        <label htmlFor="reportOption" className={labelBaseClasses}>Report Type</label>
        <select id="reportOption" value={reportOption} onChange={(e) => setReportOption(e.target.value as ReportOptionType)} className={inputBaseClasses}>
          <option value="transactions">Standard Transactions Report</option>
          <option value="financialMonthly">Financial Monthly Report</option>
          <option value="category">Category-wise Report</option>
          <option value="budgetPerformance">Budget Performance Report</option>
        </select>
      </div>

      <div className="space-y-4 p-3 rounded-md bg-bg-primary-themed border border-border-secondary">
        {reportOption === 'transactions' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label htmlFor="startDate-std" className={labelBaseClasses}>Start Date</label>
                    <input type="date" id="startDate-std" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputBaseClasses}/>
                </div>
                <div>
                    <label htmlFor="endDate-std" className={labelBaseClasses}>End Date</label>
                    <input type="date" id="endDate-std" value={endDate} onChange={e => handleEndDateChange(e.target.value)} className={inputBaseClasses}/>
                </div>
                <div>
                    <label htmlFor="filterType" className={labelBaseClasses}>Transaction Type</label>
                    <select id="filterType" value={filterType} onChange={handleTypeFilterChange} className={inputBaseClasses}>
                        <option value="all">All Types</option>
                        <option value={TransactionType.INCOME}>Income</option>
                        <option value={TransactionType.EXPENSE}>Expense</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="filterCategory" className={labelBaseClasses}>Category</label>
                    <select id="filterCategory" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={inputBaseClasses}>
                        <option value="all">All Categories</option>
                        {categoryOptions}
                    </select>
                </div>
            </div>
        )}
        {reportOption === 'financialMonthly' && (
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                    <label htmlFor="finMonth" className={labelBaseClasses}>Select Financial Month</label>
                    <input type="month" id="finMonth" value={financialMonthYear} onChange={e => setFinancialMonthYear(e.target.value)} className={inputBaseClasses}/>
                </div>
                <div>
                    <label htmlFor="filterType" className={labelBaseClasses}>Transaction Type</label>
                    <select id="filterType" value={filterType} onChange={handleTypeFilterChange} className={inputBaseClasses}>
                        <option value="all">All Types</option>
                        <option value={TransactionType.INCOME}>Income</option>
                        <option value={TransactionType.EXPENSE}>Expense</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="filterCategory" className={labelBaseClasses}>Category</label>
                    <select id="filterCategory" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={inputBaseClasses}>
                        <option value="all">All Categories</option>
                        {categoryOptions}
                    </select>
                </div>
            </div>
        )}

        {reportOption === 'category' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label htmlFor="startDate-cat" className={labelBaseClasses}>Start Date</label><input type="date" id="startDate-cat" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputBaseClasses}/></div>
              <div><label htmlFor="endDate-cat" className={labelBaseClasses}>End Date</label><input type="date" id="endDate-cat" value={endDate} onChange={e => handleEndDateChange(e.target.value)} className={inputBaseClasses}/></div>
            </div>
            <div>
              <label className={labelBaseClasses}>Transaction Type</label>
              <div className="flex gap-4 mt-2"><label className="flex items-center gap-2 text-sm"><input type="radio" value="expense" checked={categoryReportType === 'expense'} onChange={() => setCategoryReportType(TransactionType.EXPENSE)} className="h-4 w-4 text-brand-primary focus:ring-brand-primary" style={{accentColor: currentThemeColors.brandPrimary}}/>Expense</label><label className="flex items-center gap-2 text-sm"><input type="radio" value="income" checked={categoryReportType === 'income'} onChange={() => setCategoryReportType(TransactionType.INCOME)} className="h-4 w-4 text-brand-primary focus:ring-brand-primary" style={{accentColor: currentThemeColors.brandPrimary}}/>Income</label></div>
            </div>
            <div>
              <label htmlFor="categorySelect" className={labelBaseClasses}>Category</label>
              <select id="categorySelect" value={selectedCategoryForReport} onChange={e => setSelectedCategoryForReport(e.target.value)} className={inputBaseClasses}><option value="ALL">All Categories</option>{currentCategoryList.map(c => <option key={c} value={c}>{c}</option>)}</select>
            </div>
            <div>
                <label className={labelBaseClasses}>Report Format</label>
                <div className="flex gap-4 mt-2"><label className="flex items-center gap-2 text-sm"><input type="radio" value="byCategory" checked={categoryReportGrouping === 'byCategory'} onChange={() => setCategoryReportGrouping('byCategory')} className="h-4 w-4 text-brand-primary focus:ring-brand-primary" style={{accentColor: currentThemeColors.brandPrimary}}/>Totals by Category</label><label className="flex items-center gap-2 text-sm"><input type="radio" value="byDate" checked={categoryReportGrouping === 'byDate'} onChange={() => setCategoryReportGrouping('byDate')} className="h-4 w-4 text-brand-primary focus:ring-brand-primary" style={{accentColor: currentThemeColors.brandPrimary}}/>Details by Date</label></div>
            </div>
          </div>
        )}

        {reportOption === 'budgetPerformance' && (
          <div className="space-y-4">
            <div><label htmlFor="budgetPeriod" className={labelBaseClasses}>Period</label><select id="budgetPeriod" value={budgetReportPeriod} onChange={handleBudgetPeriodTypeChange} className={inputBaseClasses}>{Object.values(BudgetPeriod).sort((a, b) => a.localeCompare(b)).map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            <div>
              <p className={`${labelBaseClasses} text-center mb-2`}>{getDisplayPeriodName(budgetReportPeriod, budgetReportIdentifier, finConfig)}</p>
              <div className="flex justify-center items-center space-x-2"><button onClick={() => navigateBudgetPeriod('prev')} className="p-2 rounded-lg hover:bg-bg-accent-themed text-text-muted-themed"><ChevronLeftIcon/></button><button onClick={() => navigateBudgetPeriod('current')} className="p-2 rounded-lg hover:bg-bg-accent-themed text-text-muted-themed"><CalendarDaysIcon/></button><button onClick={() => navigateBudgetPeriod('next')} className="p-2 rounded-lg hover:bg-bg-accent-themed text-text-muted-themed"><ChevronRightIcon/></button></div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-border-secondary pt-4 flex flex-col sm:flex-row items-center gap-2">
            <button
                onClick={handlePreviewReport}
                disabled={reportOption !== 'transactions' && reportOption !== 'financialMonthly'}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-md text-text-inverted bg-brand-secondary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-bg-secondary-themed transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                style={{'--focus-ring-color': currentThemeColors.brandSecondary} as React.CSSProperties}
            >
                <EyeIcon className="w-5 h-5 mr-2" />
                Preview Report
            </button>
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
                    aria-label="Select PDF table style"
                >
                    <option value="striped">Striped</option>
                    <option value="grid">Grid</option>
                    <option value="plain">Plain</option>
                    <option value="financial">Financial</option>
                </select>
                <button onClick={handleGenerateReport} className="w-full flex items-center justify-center px-4 py-2.5 bg-brand-primary text-text-inverted rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:ring-offset-2 dark:focus:ring-offset-bg-secondary-themed transition-all duration-200 ease-in-out">
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    Generate & Download PDF
                </button>
            </div>
      </div>

      {previewData && (
        <div className="mt-6 border-t border-border-secondary pt-4 animate-fade-in">
          <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-text-base-themed">Report Preview ({previewData.length} transactions)</h3>
              <button onClick={handleClosePreview} className="flex items-center px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm text-expense bg-expense/10 hover:bg-expense/20 focus:outline-none focus:ring-1 focus:ring-expense transition-colors">
                  <XIcon className="w-4 h-4 mr-1.5" />
                  Close Preview
              </button>
          </div>
          <div className="overflow-x-auto max-h-96 rounded-lg border border-border-secondary">
              <table className="w-full text-sm text-left text-text-muted-themed">
                  <thead className="text-xs text-text-base-themed uppercase bg-bg-accent-themed sticky top-0">
                      <tr>
                          <th scope="col" className="px-6 py-3">Date</th>
                          <th scope="col" className="px-6 py-3">Description</th>
                          <th scope="col" className="px-6 py-3">Category</th>
                          <th scope="col" className="px-6 py-3 text-right">Debit</th>
                          <th scope="col" className="px-6 py-3 text-right">Credit</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-border-secondary">
                      {previewData.map(tx => (
                          <tr key={tx.id} className="hover:bg-bg-accent-themed/50">
                              <td className="px-6 py-2 whitespace-nowrap">{formatDate(tx.date)}</td>
                              <td className="px-6 py-2 text-text-base-themed max-w-xs truncate" title={tx.description}>{tx.description}</td>
                              <td className="px-6 py-2">{tx.category || '–'}</td>
                              <td className="px-6 py-2 text-right font-medium" style={{color: tx.type === 'expense' ? currentThemeColors.expense : 'inherit'}}>
                                  {tx.type === 'expense' ? formatCurrency(tx.amount) : '–'}
                              </td>
                              <td className="px-6 py-2 text-right font-medium" style={{color: tx.type === 'income' ? currentThemeColors.income : 'inherit'}}>
                                  {tx.type === 'income' ? formatCurrency(tx.amount) : '–'}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
        </div>
      )}
    </div>
  );
};