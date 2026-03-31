
import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
// FIX: Changed PillNotificationInfo to ToastInfo as it has the required properties
import { Account, ToastInfo, PillNotificationType, TransactionType, UpcomingPayment } from '../types';
import { BellIcon, CheckCircleIcon, TrashIcon, DownloadIcon, ChevronLeftIcon, ChevronRightIcon, BanknotesIcon, EyeIcon, AlertTriangleIcon, XCircleIcon, ArrowUturnLeftIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext'; 
import ConfirmationModal from './ConfirmationModal';

interface NotificationHistoryProps {
  notifications: ToastInfo[];
  onClearHistory: () => void;
  accounts: Account[];
  upcomingPayments: UpcomingPayment[];
  onViewSchedule: (scheduleId: string) => void;
  appTitle: string;
}

const ITEMS_PER_PAGE = 5;

const getNotificationIcon = (type: PillNotificationType): React.FC<any> => {
    switch(type) {
        case 'income':
        case 'success':
            return CheckCircleIcon;
        case 'expense':
            return BellIcon;
        case 'warning':
            return AlertTriangleIcon;
        case 'error':
            return XCircleIcon;
        case 'undo':
            return ArrowUturnLeftIcon;
        case 'info':
        case 'transfer':
        default:
            return BellIcon;
    }
};

const NotificationHistory: React.FC<NotificationHistoryProps> = ({ notifications, onClearHistory, accounts, upcomingPayments, onViewSchedule, appTitle }) => {
  const { currentThemeColors } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // FIX: Use Array.isArray for robust handling of potentially corrupted localStorage data.
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const safeUpcomingPayments = Array.isArray(upcomingPayments) ? upcomingPayments : [];

  const totalPages = Math.ceil(safeNotifications.length / ITEMS_PER_PAGE);

  const currentDisplayNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return safeNotifications.slice(startIndex, endIndex);
  }, [safeNotifications, currentPage]);

  useEffect(() => {
    setCurrentPage(1); 
  }, [safeNotifications.length]);

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
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString + 'T00:00:00').toLocaleDateString(undefined, options);
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };
  
  const getAccountName = (accountId?: string): string => {
    if (!accountId) return 'General';
    // FIX: Use Array.isArray for robust handling of the accounts prop.
    const account = (Array.isArray(accounts) ? accounts : []).find(acc => acc.id === accountId);
    return account ? account.name : 'Unknown Account';
  };

  const totalUpcomingAmount = useMemo(() => {
    return safeUpcomingPayments.reduce((sum, item) => {
      if (item.type === 'custom' && item.incomeOrExpense === 'income') return sum;
      return sum + (item.amount || 0);
    }, 0);
  }, [safeUpcomingPayments]);

  const groupedPayments = useMemo(() => {
    const groups: Record<string, UpcomingPayment[]> = {};
    safeUpcomingPayments.forEach(item => {
        const dateKey = item.dueDate;
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(item);
    });
    return groups;
  }, [safeUpcomingPayments]);


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

  const handleDownloadPdf = () => {
    if (safeNotifications.length === 0) {
      alert("No notifications to download.");
      return;
    }

    const doc = new jsPDF();
    const reportTitle = `${appTitle} - Notification History`;
    const generatedDateTime = new Date().toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

    doc.setFontSize(18);
    doc.text(reportTitle, 14, 20); 
    doc.setFontSize(11);
    doc.setTextColor(100); 
    doc.text(`Report Generated: ${generatedDateTime}`, 14, 26); 

    const tableColumn = ["Date & Time", "Account", "Type", "Details", "Balance After"];
    const tableRows: (string | number)[][] = [];

    safeNotifications.forEach(notification => {
      let balanceAfterString = '-';
      if (notification.balanceAtNotification !== undefined) {
        const formattedBalance = formatCurrency(notification.balanceAtNotification);
        balanceAfterString = "Rs " + formattedBalance.replace('₹', '').trim();
      }

      const detailsMessage = notification.message.replace(/₹/g, 'Rs ');

      tableRows.push([
        formatTimestamp(notification.timestamp),
        getAccountName(notification.accountId),
        notification.type.charAt(0).toUpperCase() + notification.type.slice(1), 
        detailsMessage, 
        balanceAfterString,
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 26 + 10, 
      theme: 'striped',
      headStyles: { fillColor: currentThemeColors.brandPrimary }, 
      styles: { fontSize: 8, cellPadding: 1.5 }, 
      columnStyles: {
        0: { cellWidth: 35 }, 
        1: { cellWidth: 25 }, 
        2: { cellWidth: 18 }, 
        3: { cellWidth: 'auto' }, 
        4: { cellWidth: 28, halign: 'right' }, 
      }
    });
    
    addPdfFooter(doc, reportTitle);
    doc.save(`Notification_History_${new Date().toISOString().split('T')[0]}.pdf`);
  };


  return (
    <div className="bg-bg-secondary-themed p-4 sm:p-6 rounded-xl shadow-lg">
        <div className="mb-6 pb-6 border-b border-border-secondary">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
                <h3 className="text-md sm:text-lg font-semibold text-text-base-themed flex items-center">
                    <BanknotesIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-brand-secondary" />
                    Upcoming Payments & Reminders
                </h3>
                {safeUpcomingPayments.length > 0 && (
                    <p className="text-sm font-medium text-text-muted-themed mt-1 sm:mt-0 text-left sm:text-right">
                        Total Due: <span className="font-bold" style={{color: currentThemeColors.brandSecondary}}>{formatCurrency(totalUpcomingAmount)}</span>
                    </p>
                )}
            </div>
            {safeUpcomingPayments.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {Object.entries(groupedPayments).map(([date, itemsOnDate]) => (
                        <div key={date}>
                        <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: currentThemeColors.brandPrimary }}></div>
                            <h4 className="font-semibold text-sm" style={{ color: currentThemeColors.textBase }}>
                            {formatDate(date)}
                            </h4>
                        </div>
                        <ul className="space-y-1.5 mt-2 pl-4 border-l-2" style={{ borderColor: currentThemeColors.borderSecondary }}>
                            {(itemsOnDate as UpcomingPayment[]).map((item) => (
                            <li key={`${item.originalId}-${item.dueDate}`} className="p-2 bg-bg-primary-themed rounded-md flex justify-between items-center">
                                <div className="flex-grow">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                    {item.type}
                                  </span>
                                  <p className="font-medium text-sm" style={{ color: currentThemeColors.textBase }}>{item.name}</p>
                                </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                <p className="text-sm font-bold" style={{ color: item.incomeOrExpense === 'income' ? currentThemeColors.income : currentThemeColors.brandSecondary }}>
                                  {item.amount !== undefined ? formatCurrency(item.amount) : ''}
                                </p>
                                {item.type === 'emi' && (
                                <button 
                                    onClick={() => onViewSchedule(item.originalId)}
                                    className="p-1.5 text-text-muted-themed hover:text-brand-primary hover:bg-bg-accent-themed rounded-lg transition-all"
                                    title="View Full Schedule"
                                >
                                    <EyeIcon className="w-4 h-4" />
                                </button>
                                )}
                                </div>
                            </li>
                            ))}
                        </ul>
                        </div>
                    ))}
                </div>
            ) : (
            <p className="text-sm text-text-muted-themed text-center py-4">No upcoming unpaid EMIs or custom reminders found.</p>
            )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline mb-4 sm:mb-6 gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-text-base-themed min-w-0 flex items-center">
          <BellIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-brand-primary" />
          Notification History
        </h2>
        {safeNotifications.length > 0 && (
          <div className="flex space-x-2 flex-shrink-0">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-bg-secondary-themed transition-all duration-200 ease-in-out hover:shadow-md bg-brand-secondary text-text-inverted hover:opacity-90"
              aria-label="Download notification history as PDF"
            >
              <DownloadIcon className="w-3.5 h-3.5 mr-1.5" />
              Download PDF
            </button>
            <button
              onClick={() => setIsClearModalOpen(true)}
              className="flex items-center px-3 py-1.5 border text-xs font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-bg-secondary-themed transition-all duration-200 ease-in-out hover:shadow-md"
              style={{
                borderColor: currentThemeColors.expense, color: currentThemeColors.expense,
                backgroundColor: currentThemeColors.bgSecondary,
                // @ts-ignore
                '--focus-ring-color': currentThemeColors.expense,
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = `${currentThemeColors.expense}2A`}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = currentThemeColors.bgSecondary}
              aria-label="Clear all notifications"
            >
              <TrashIcon className="w-3.5 h-3.5 mr-1.5" />
              Clear All
            </button>
          </div>
        )}
      </div>

      {safeNotifications.length === 0 ? (
        <div className="text-center py-10">
          <img
            src="https://picsum.photos/seed/notificationempty/300/200?grayscale"
            alt="Empty notifications illustration"
            className="mx-auto mb-4 rounded-lg w-32 h-24 sm:w-40 sm:h-32 md:w-48 md:h-32 object-cover opacity-70 dark:opacity-50"
            aria-hidden="true"
          />
          <p className="text-text-base-themed text-lg">No notifications recorded.</p>
          <p className="text-sm text-text-muted-themed">Transaction notifications will appear here.</p>
        </div>
      ) : (
        <>
          <ul className="space-y-3 min-h-[280px]"> 
            {currentDisplayNotifications.map(notification => {
              const IconComponent = getNotificationIcon(notification.type);
              
              let titleText = notification.type.charAt(0).toUpperCase() + notification.type.slice(1);
              let iconColorStyle, titleColorStyle, borderStyleColor;

              switch (notification.type) {
                case 'income':
                case 'success':
                  iconColorStyle = titleColorStyle = borderStyleColor = currentThemeColors.income;
                  break;
                case 'expense':
                case 'error':
                  iconColorStyle = titleColorStyle = borderStyleColor = currentThemeColors.expense;
                  break;
                case 'warning':
                  iconColorStyle = titleColorStyle = borderStyleColor = '#F59E0B';
                  break;
                case 'info':
                  iconColorStyle = titleColorStyle = borderStyleColor = currentThemeColors.brandPrimary;
                  break;
                case 'undo':
                   iconColorStyle = titleColorStyle = borderStyleColor = currentThemeColors.brandSecondary;
                   break;
                default:
                  iconColorStyle = titleColorStyle = borderStyleColor = currentThemeColors.textMuted;
              }

              const accountName = getAccountName(notification.accountId);

              return (
                <li key={`${notification.id}-${notification.timestamp}`} className="p-3 bg-bg-accent-themed rounded-lg shadow-sm border-l-4"
                  style={{ borderColor: borderStyleColor }}
                  role="listitem"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 mt-0.5`} style={{ color: iconColorStyle }}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                          <p className={`text-sm font-semibold`} style={{color: titleColorStyle}}>{titleText} {notification.accountId ? `to ${accountName}`: ''}</p>
                          <p className="text-xs text-text-muted-themed mt-0.5">
                              {formatTimestamp(notification.timestamp)}
                          </p>
                      </div>
                      <p className="text-sm text-text-base-themed mt-1 leading-relaxed">
                        {notification.message}
                      </p>
                      {typeof notification.balanceAtNotification === 'number' && notification.accountId && (
                         <p className="text-xs text-text-muted-themed mt-1">
                           Balance for {accountName} after: <span className={`font-medium`} style={{ color: notification.balanceAtNotification < 0 ? currentThemeColors.expense : currentThemeColors.textBase}}>{formatCurrency(notification.balanceAtNotification)}</span>
                         </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center text-sm">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg shadow-sm flex items-center transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1 dark:focus:ring-offset-bg-secondary-themed"
                style={{
                    backgroundColor: currentThemeColors.bgAccent, 
                    color: currentThemeColors.textBase,
                    border: `1px solid ${currentThemeColors.borderSecondary}`
                }}
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" /> Previous
              </button>
              <span className="text-text-muted-themed">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg shadow-sm flex items-center transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1 dark:focus:ring-offset-bg-secondary-themed"
                style={{
                    backgroundColor: currentThemeColors.bgAccent, 
                    color: currentThemeColors.textBase,
                    border: `1px solid ${currentThemeColors.borderSecondary}`
                }}
              >
                Next <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmationModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={() => {
          onClearHistory();
          setIsClearModalOpen(false);
        }}
        title="Clear Notification History"
        message="Are you sure you want to clear all notification history? This action cannot be undone."
        confirmText="Clear All"
        type="danger"
      />
    </div>
  );
};

export default NotificationHistory;
