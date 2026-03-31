import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RechargePlan, ToastType, PdfTableTheme, PdfPageSize, PdfPageOrientation, Transaction, TransactionType, ExpenseCategory } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { PlusIcon, EditIcon, TrashIcon, XIcon, SaveIcon, DevicePhoneMobileIcon, RefreshCwIcon as RechargeNowIcon, EyeIcon, DownloadIcon, DocumentChartBarIcon, HistoryIcon } from './Icons';
import { formatDateToYYYYMMDD, formatDateDisplay } from '../utils/dateUtils';
import { hexToRgba, lightenHexColor } from '../utils/colorUtils';
import useLocalStorage from '../hooks/useLocalStorage';
import { LOCAL_STORAGE_PROFILE_PICTURE_KEY } from '../constants';
import ConfirmationModal from './ConfirmationModal';

interface RechargeTrackerProps {
  rechargePlans: RechargePlan[];
  allTransactions: Transaction[];
  onAddPlan: (plan: Omit<RechargePlan, 'id' | 'accountId' | 'nextDueDate' | 'isDeleted' | 'deletedAt'>) => void;
  onEditPlan: (id: string, updates: Partial<Omit<RechargePlan, 'id'>>) => void;
  onDeletePlan: (id: string) => void;
  addToast: (message: string, type: ToastType) => void;
  appTitle: string;
  activeAccountName?: string;
}

const RechargeTracker: React.FC<RechargeTrackerProps> = ({
  rechargePlans,
  allTransactions,
  onAddPlan,
  onEditPlan,
  onDeletePlan,
  addToast,
  appTitle,
  activeAccountName,
}) => {
  const { currentThemeColors } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<RechargePlan | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [historyPlan, setHistoryPlan] = useState<RechargePlan | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  
  const [profilePicture] = useLocalStorage<string | null>(LOCAL_STORAGE_PROFILE_PICTURE_KEY, null);
  const [pdfStyle, setPdfStyle] = useState<PdfTableTheme>('grid');
  const [pdfPageSize, setPdfPageSize] = useState<PdfPageSize>('a4');
  const [pdfOrientation, setPdfOrientation] = useState<PdfPageOrientation>('portrait');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const handleOpenModal = (plan: RechargePlan | null = null) => {
    setPlanToEdit(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPlanToEdit(null);
  };

  const handleSave = (formData: Omit<RechargePlan, 'id' | 'accountId' | 'nextDueDate' | 'isDeleted' | 'deletedAt'>) => {
    if (planToEdit) {
      onEditPlan(planToEdit.id, formData);
    } else {
      onAddPlan(formData);
    }
    handleCloseModal();
  };

  const handleLogPayment = (plan: RechargePlan) => {
    if (window.confirm(`Log recharge for "${plan.provider}" as of today? This will update the last recharge date.`)) {
      onEditPlan(plan.id, { lastRechargeDate: formatDateToYYYYMMDD(new Date()) });
      addToast(`Recharge for "${plan.provider}" logged!`, 'success');
    }
  };

  const calculateDaysRemaining = (nextDueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(nextDueDate + 'T00:00:00');
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  const sortedPlans = useMemo(() => {
    return [...rechargePlans].filter(p => !p.isDeleted).sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  }, [rechargePlans]);

  const getPlanHistory = useCallback((provider: string) => {
    return allTransactions.filter(t => 
      !t.isDeleted && 
      t.type === TransactionType.EXPENSE && 
      t.category === ExpenseCategory.MOBILE && 
      t.description === provider
    ).sort((a, b) => b.date.localeCompare(a.date));
  }, [allTransactions]);

  const handleDownloadPdf = () => {
    if (sortedPlans.length === 0) {
      addToast('No plans to export.', 'info');
      return;
    }

    try {
        const doc = new jsPDF({
            orientation: pdfOrientation,
            unit: 'mm',
            format: pdfPageSize,
        });
        
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

        const reportTitle = `${appTitle} - Mobile & DTH Recharge Report`;
        const accountSubTitle = `Account: ${activeAccountName || 'All Accounts'}`;
        const generatedOn = `Generated on: ${new Date().toLocaleString()}`;

        doc.setFontSize(16);
        doc.text(reportTitle, 14, 18);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(accountSubTitle, 14, 24);
        doc.text(generatedOn, 14, 29);

        const tableColumn = ["Provider", "Plan Price (INR)", "Validity", "Last Recharge", "Next Due Date", "Days Remaining"];
        const tableRows = sortedPlans.map(plan => [
            plan.provider,
            new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(plan.price),
            `${plan.validityDays} days`,
            formatDateDisplay(plan.lastRechargeDate),
            formatDateDisplay(plan.nextDueDate),
            String(calculateDaysRemaining(plan.nextDueDate))
        ]);

        autoTable(doc, {
            startY: 35,
            head: [tableColumn],
            body: tableRows,
            theme: pdfStyle === 'financial' ? 'plain' : pdfStyle,
            headStyles: { fillColor: currentThemeColors.brandPrimary },
            didParseCell: (data: any) => {
                if (data.section === 'body' && typeof data.row.index === 'number') {
                  const plan = sortedPlans[data.row.index];
                  if (!plan) return;
                  const daysRemaining = calculateDaysRemaining(plan.nextDueDate);
          
                  if (pdfStyle === 'financial') {
                    let rowColor;
                    if (daysRemaining <= 3) {
                      rowColor = lightenHexColor(currentThemeColors.expense, 0.1);
                    } else if (daysRemaining <= 7) {
                      rowColor = lightenHexColor(currentThemeColors.brandSecondary, 0.1);
                    } else {
                      rowColor = lightenHexColor(currentThemeColors.income, 0.1);
                    }
                    if (rowColor) {
                      data.row.styles.fillColor = rowColor;
                    }
                  }
                  
                  if (data.column.index === 5) { // Days Remaining column
                    if (daysRemaining <= 3) {
                      data.cell.styles.textColor = currentThemeColors.expense;
                    } else if (daysRemaining <= 7) {
                      data.cell.styles.textColor = currentThemeColors.brandSecondary;
                    } else {
                      data.cell.styles.textColor = currentThemeColors.income;
                    }
                  }
                }
            }
        });

        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
            doc.text(reportTitle, 14, doc.internal.pageSize.height - 10);
        }

        const fileNameSafeAccountName = (activeAccountName || 'All_Accounts').replace(/\s+/g, '_');
        doc.save(`Recharge_Report_${fileNameSafeAccountName}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
        console.error("Error generating PDF for Recharge Tracker:", e);
        addToast(`Error generating PDF: ${e instanceof Error ? e.message : String(e)}`, 'error');
    }
  };

  const selectClasses = "text-xs p-1.5 border rounded-md bg-bg-primary-themed border-border-primary text-text-base-themed";

  return (
    <div className="p-4 sm:p-6 rounded-xl shadow-lg" style={{ backgroundColor: currentThemeColors.bgSecondary }}>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-text-base-themed flex items-center">
          <DevicePhoneMobileIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 text-brand-primary" />
          Mobile/DTH Recharge Tracker
        </h2>
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-md text-text-inverted hover:opacity-90"
            style={{ backgroundColor: currentThemeColors.brandPrimary }}
          >
            <PlusIcon className="w-5 h-5 mr-2" /> Add New
          </button>
          <button
            onClick={() => setIsPreviewModalOpen(true)}
            className="flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-md text-text-inverted hover:opacity-90"
            style={{ backgroundColor: currentThemeColors.brandSecondary }}
          >
            <EyeIcon className="w-5 h-5 mr-2" /> Preview
          </button>
          <button onClick={handleDownloadPdf} className="p-2.5 rounded-lg shadow-md text-text-inverted hover:opacity-90" style={{ backgroundColor: '#475569' }} title="Download as PDF">
              <DownloadIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {sortedPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPlans.map(plan => {
            const daysRemaining = calculateDaysRemaining(plan.nextDueDate);
            const progress = Math.max(0, (daysRemaining / plan.validityDays) * 100);
            const history = getPlanHistory(plan.provider);
            const rechargeCount = history.length;
            let progressBarColor = currentThemeColors.income;
            if (daysRemaining <= 7) progressBarColor = currentThemeColors.brandSecondary;
            if (daysRemaining <= 3) progressBarColor = currentThemeColors.expense;

            return (
              <div 
                key={plan.id} 
                className="p-4 rounded-xl shadow-lg flex flex-col h-full relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                style={{ 
                    background: `linear-gradient(135deg, ${hexToRgba(progressBarColor, 0.15)}, ${hexToRgba(progressBarColor, 0.05)} 70%)`,
                    border: `1px solid ${hexToRgba(progressBarColor, 0.2)}`
                }}
              >
                <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-lg text-text-base-themed leading-tight">{plan.provider}</h3>
                        {rechargeCount > 0 && (
                            <span className="w-fit px-2 py-0.5 text-[10px] font-black rounded-full bg-brand-primary/20 text-brand-primary uppercase tracking-tighter">
                                {rechargeCount} recharges
                            </span>
                        )}
                    </div>
                </div>

                <div className="text-center my-4 flex-grow">
                    <p className="text-6xl font-bold" style={{ color: progressBarColor, textShadow: `0 0 10px ${hexToRgba(progressBarColor, 0.5)}` }}>{daysRemaining}</p>
                    <p className="text-sm text-text-muted-themed">days remaining</p>
                    <p className="text-lg font-semibold mt-1" style={{ color: currentThemeColors.textBase }}>
                        {formatCurrency(plan.price)}
                    </p>
                    
                    <div className="flex items-center justify-center gap-3 mt-4">
                        <button 
                            onClick={() => setHistoryPlan(plan)} 
                            className="p-2 rounded-xl bg-white/10 text-text-muted-themed hover:text-brand-primary hover:bg-white/20 transition-all border border-white/5" 
                            title="View History"
                        >
                            <HistoryIcon className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleOpenModal(plan)} 
                            className="p-2 rounded-xl bg-white/10 text-text-muted-themed hover:text-brand-primary hover:bg-white/20 transition-all border border-white/5" 
                            title="Edit Plan"
                        >
                            <EditIcon className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setDeletingPlanId(plan.id)} 
                            className="p-2 rounded-xl bg-white/10 text-text-muted-themed hover:text-expense hover:bg-white/20 transition-all border border-white/5" 
                            title="Delete Plan"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <div className="w-full bg-black/20 rounded-full h-2">
                        <div className="h-2 rounded-full" style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: progressBarColor, transition: 'width 0.5s ease-in-out' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-text-muted-themed">
                        <p>Last: <span className="font-medium text-text-base-themed">{formatDateDisplay(plan.lastRechargeDate)}</span></p>
                        <p>Next: <span className="font-medium text-text-base-themed">{formatDateDisplay(plan.nextDueDate)}</span></p>
                    </div>
                </div>

                <div className="mt-4">
                    <button onClick={() => handleLogPayment(plan)} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: progressBarColor }}>
                        <RechargeNowIcon className="w-4 h-4"/>Log Recharge
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed rounded-xl" style={{ borderColor: currentThemeColors.borderSecondary }}>
          <DevicePhoneMobileIcon className="w-16 h-16 mx-auto text-text-disabled mb-4" />
          <p className="text-lg font-semibold text-text-base-themed">No Recharge Plans Added Yet</p>
          <p className="text-sm text-text-muted-themed max-w-sm mx-auto mb-6">Track your mobile or DTH recharges to stay ahead of due dates.</p>
          <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-md text-text-inverted hover:opacity-90"
              style={{ backgroundColor: currentThemeColors.brandPrimary }}
            >
              <PlusIcon className="w-5 h-5 mr-2" /> Add Your First Recharge Plan
            </button>
        </div>
      )}

      {isModalOpen && (
        <PlanModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          plan={planToEdit}
        />
      )}

      {isPreviewModalOpen && (
          <ReportPreviewModal
            isOpen={isPreviewModalOpen}
            onClose={() => setIsPreviewModalOpen(false)}
            plans={sortedPlans}
            title={`${appTitle} - Recharge Report`}
            onDownload={handleDownloadPdf}
            calculateDaysRemaining={calculateDaysRemaining}
          />
      )}

      {historyPlan && (
          <HistoryModal
            isOpen={!!historyPlan}
            onClose={() => setHistoryPlan(null)}
            plan={historyPlan}
            history={getPlanHistory(historyPlan.provider)}
          />
      )}

      <ConfirmationModal
        isOpen={!!deletingPlanId}
        onClose={() => setDeletingPlanId(null)}
        onConfirm={() => {
          if (deletingPlanId) {
            onDeletePlan(deletingPlanId);
            setDeletingPlanId(null);
            addToast('Recharge plan deleted successfully', 'success');
          }
        }}
        title="Delete Recharge Plan"
        message="Are you sure you want to delete this recharge plan? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

const PlanModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<RechargePlan, 'id' | 'accountId' | 'nextDueDate' | 'isDeleted' | 'deletedAt'>) => void;
  plan: RechargePlan | null;
}> = ({ isOpen, onClose, onSave, plan }) => {
    const { currentThemeColors } = useTheme();
    const providers = useMemo(() => ['Jio', 'Airtel', 'Vodafone', 'Bsnl', 'Other'].sort((a, b) => {
        if (a === 'Other') return 1;
        if (b === 'Other') return -1;
        return a.localeCompare(b);
    }), []);
    const [provider, setProvider] = useState('Jio');
    const [otherProvider, setOtherProvider] = useState('');
    const [price, setPrice] = useState('');
    const [validityDays, setValidityDays] = useState('');
    const [lastRechargeDate, setLastRechargeDate] = useState(formatDateToYYYYMMDD(new Date()));

    useEffect(() => {
        if (plan) {
            const isOther = !providers.includes(plan.provider);
            setProvider(isOther ? 'Other' : plan.provider);
            setOtherProvider(isOther ? plan.provider : '');
            setPrice(String(plan.price));
            setValidityDays(String(plan.validityDays));
            setLastRechargeDate(plan.lastRechargeDate);
        } else {
            setProvider('Jio');
            setOtherProvider('');
            setPrice('');
            setValidityDays('');
            setLastRechargeDate(formatDateToYYYYMMDD(new Date()));
        }
    }, [plan]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalProvider = provider === 'Other' ? otherProvider.trim() : provider;
        const validity = parseInt(validityDays);
        const priceNum = parseFloat(price);

        if (!finalProvider || isNaN(validity) || validity <= 0 || !price || isNaN(priceNum) || priceNum < 0) {
            alert("Please fill all fields with valid data (positive validity and price).");
            return;
        }

        onSave({ provider: finalProvider, validityDays: validity, lastRechargeDate, price: priceNum });
    };

    if (!isOpen) return null;

    const inputClasses = "mt-1 block w-full px-3 py-2 bg-bg-primary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-text-base-themed dark:[color-scheme:light]";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-modal-enter" onClick={onClose}>
            <div className="w-full max-w-md p-6 rounded-xl shadow-2xl" style={{ backgroundColor: currentThemeColors.bgSecondary }} onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-semibold mb-4">{plan ? 'Edit Recharge Plan' : 'Add New Recharge Plan'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Provider</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {providers.map(p => (
                                <button type="button" key={p} onClick={() => setProvider(p)} className={`px-3 py-1.5 text-sm rounded-full ${provider === p ? 'bg-brand-primary text-white' : 'bg-bg-accent-themed'}`}>{p}</button>
                            ))}
                        </div>
                        {provider === 'Other' && (
                             <input type="text" value={otherProvider} onChange={e => setOtherProvider(e.target.value)} className={`${inputClasses} mt-2`} required placeholder="Enter provider name"/>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium">Plan Price</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted-themed">₹</span>
                                <input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} className={`${inputClasses} pl-7`} required min="0" placeholder="e.g., 299"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="validity" className="block text-sm font-medium">Validity (Days)</label>
                            <input id="validity" type="number" value={validityDays} onChange={e => setValidityDays(e.target.value)} className={inputClasses} required min="1" placeholder="e.g., 28"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="lastRecharge" className="block text-sm font-medium">Last Recharge Date</label>
                        <input id="lastRecharge" type="date" value={lastRechargeDate} onChange={e => setLastRechargeDate(e.target.value)} className={inputClasses} required />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg" style={{backgroundColor: currentThemeColors.bgAccent}}>Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm rounded-lg text-text-inverted" style={{backgroundColor: currentThemeColors.brandPrimary}}>
                            <SaveIcon className="w-4 h-4 inline-block mr-1.5" />{plan ? 'Save Changes' : 'Add Plan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ReportPreviewModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    plans: RechargePlan[];
    title: string;
    onDownload: () => void;
    calculateDaysRemaining: (nextDueDate: string) => number;
}> = ({ isOpen, onClose, plans, title, onDownload, calculateDaysRemaining }) => {
    const { currentThemeColors } = useTheme();
    if (!isOpen) return null;

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-modal-enter overflow-hidden border border-slate-200 dark:border-slate-800"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <DocumentChartBarIcon className="w-6 h-6 text-brand-primary" />
                        <div>
                            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{title}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tabular Preview Mode</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <XIcon className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="flex-grow overflow-auto p-4">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead className="sticky top-0 bg-bg-accent-themed z-10">
                            <tr>
                                <th className="p-3 border-b border-border-secondary">Provider</th>
                                <th className="p-3 border-b border-border-secondary text-right">Price</th>
                                <th className="p-3 border-b border-border-secondary text-center">Validity</th>
                                <th className="p-3 border-b border-border-secondary text-center">Next Due</th>
                                <th className="p-3 border-b border-border-secondary text-center">Days Remaining</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map(plan => {
                                const days = calculateDaysRemaining(plan.nextDueDate);
                                const statusColor = days <= 3 ? currentThemeColors.expense : days <= 7 ? currentThemeColors.brandSecondary : currentThemeColors.income;
                                return (
                                    <tr key={plan.id} className="hover:bg-bg-accent-themed/30 border-b border-border-secondary transition-colors">
                                        <td className="p-3 font-bold text-text-base-themed">{plan.provider}</td>
                                        <td className="p-3 text-right font-black">{formatCurrency(plan.price)}</td>
                                        <td className="p-3 text-center text-text-muted-themed">{plan.validityDays}d</td>
                                        <td className="p-3 text-center text-text-base-themed font-medium">{formatDateDisplay(plan.nextDueDate)}</td>
                                        <td className="p-3 text-center font-black" style={{ color: statusColor }}>{days}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">Close</button>
                    <button onClick={() => { onDownload(); onClose(); }} className="px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
                        <DownloadIcon className="w-4 h-4 mr-2 inline-block"/> Download as PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

const HistoryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    plan: RechargePlan;
    history: Transaction[];
}> = ({ isOpen, onClose, plan, history }) => {
    const { currentThemeColors } = useTheme();
    if (!isOpen) return null;

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col animate-modal-enter overflow-hidden border border-slate-200 dark:border-slate-800"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <HistoryIcon className="w-6 h-6 text-brand-primary" />
                        <div>
                            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{plan.provider} History</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total {history.length} recharges found</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <XIcon className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="flex-grow overflow-auto p-4">
                    {history.length > 0 ? (
                        <div className="space-y-3">
                            {history.map((tx, idx) => (
                                <div 
                                    key={tx.id} 
                                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center group hover:border-brand-primary/30 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black text-xs">
                                            {history.length - idx}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white">{formatDateDisplay(tx.date)}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                Validity: {tx.validityDays || 'N/A'} days
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-lg text-brand-primary">{formatCurrency(tx.amount)}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Successful</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <HistoryIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500 font-bold">No recharge history found for this provider.</p>
                            <p className="text-xs text-slate-400 mt-1">History is tracked from your recorded transactions.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20">Close History</button>
                </div>
            </div>
        </div>
    );
};

export default RechargeTracker;