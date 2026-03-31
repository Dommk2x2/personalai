import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalendarDaysIcon, AlertTriangleIcon, CheckCircleIcon, XCircleIcon, DownloadIcon, SaveIcon, RefreshCwIcon, XIcon, SparklesIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import { formatDateDisplay, formatDateToYYYYMMDD } from '../utils/dateUtils';
import { AmortizationEntry, ScheduleResult, SavedAmortizationSchedule, ToastType } from '../types'; 
import useLocalStorage from '../hooks/useLocalStorage';
import { LOCAL_STORAGE_PROFILE_PICTURE_KEY } from '../constants';
import { lightenHexColor, hexToRgba } from '../utils/colorUtils';

interface AmortizationScheduleProps {
  activeAccountId: string | null;
  savedAmortizationSchedules: SavedAmortizationSchedule[];
  setSavedAmortizationSchedules: React.Dispatch<React.SetStateAction<SavedAmortizationSchedule[]>>;
  addToast: (message: string, type: ToastType, accountId?: string, balanceAtNotification?: number) => void;
  scheduleToLoad: SavedAmortizationSchedule | null;
  clearLoadedSchedule: () => void;
}

type PdfTableTheme = 'striped' | 'grid' | 'plain' | 'financial';

export const AmortizationSchedule: React.FC<AmortizationScheduleProps> = ({
  activeAccountId,
  savedAmortizationSchedules,
  setSavedAmortizationSchedules,
  addToast,
  scheduleToLoad,
  clearLoadedSchedule
}) => {
  const { currentThemeColors } = useTheme();
  const [profilePicture] = useLocalStorage<string | null>(LOCAL_STORAGE_PROFILE_PICTURE_KEY, null);
  const [loanName, setLoanName] = useState<string>('');
  const [principal, setPrincipal] = useState<string>('');
  const [annualRate, setAnnualRate] = useState<string>('');
  const [tenureValue, setTenureValue] = useState<string>('');
  const [tenureUnit, setTenureUnit] = useState<'years' | 'months'>('years');
  const [startDate, setStartDate] = useState<string>(formatDateToYYYYMMDD(new Date()));
  const [scheduleResult, setScheduleResult] = useState<ScheduleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<Record<number, boolean>>({});
  const [isViewingSaved, setIsViewingSaved] = useState<boolean>(false);
  const [loadedScheduleName, setLoadedScheduleName] = useState<string>('');
  const [loadedScheduleId, setLoadedScheduleId] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [pdfStyle, setPdfStyle] = useState<PdfTableTheme>('grid');
  const [completionGreeting, setCompletionGreeting] = useState<string | null>(null);
  
  // Celebration State
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (scheduleToLoad) {
      setLoanName(scheduleToLoad.loanName);
      setPrincipal(String(scheduleToLoad.principal));
      setAnnualRate(String(scheduleToLoad.annualRate));
      setTenureValue(String(scheduleToLoad.tenureValue));
      setTenureUnit(scheduleToLoad.tenureUnit);
      setStartDate(scheduleToLoad.startDate);
      setProductImage(scheduleToLoad.productImage || null);
      setCompletionGreeting(scheduleToLoad.completionGreeting || null);
      setScheduleResult({
        emi: scheduleToLoad.calculatedEmi,
        totalInterest: scheduleToLoad.totalInterest,
        totalPayment: scheduleToLoad.totalPayment,
        schedule: scheduleToLoad.schedule,
      });
      setPaymentStatus(scheduleToLoad.paymentStatus || {});
      setError(null);
      setIsViewingSaved(true);
      setLoadedScheduleName(scheduleToLoad.loanName);
      setLoadedScheduleId(scheduleToLoad.id);
      clearLoadedSchedule();
    }
  }, [scheduleToLoad, clearLoadedSchedule]);

  useEffect(() => {
    if (loadedScheduleId) {
      const updatedSchedule = savedAmortizationSchedules.find(s => s.id === loadedScheduleId);
      if (updatedSchedule) {
        setScheduleResult({
          emi: updatedSchedule.calculatedEmi,
          totalInterest: updatedSchedule.totalInterest,
          totalPayment: updatedSchedule.totalPayment,
          schedule: updatedSchedule.schedule,
        });
        setPaymentStatus(updatedSchedule.paymentStatus || {});
        setCompletionGreeting(updatedSchedule.completionGreeting || null);
      }
    }
  }, [savedAmortizationSchedules, loadedScheduleId]);

  const formatCurrency = (amount: number, forPdf: boolean = false): string => {
    let formatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    if (forPdf) return formatted.replace('₹', '').trim();
    return formatted;
  };

  const isLoanFullyPaid = useMemo(() => {
      if (!scheduleResult) return false;
      const totalInstallments = scheduleResult.schedule.length;
      const paidCount = Object.values(paymentStatus).filter(Boolean).length;
      return totalInstallments > 0 && paidCount === totalInstallments;
  }, [scheduleResult, paymentStatus]);

  const calculateSchedule = useCallback(() => {
    setError(null);
    setScheduleResult(null);
    setPaymentStatus({});
    setCompletionGreeting(null);

    const p = parseFloat(principal);
    const rAnnual = parseFloat(annualRate);
    const tValue = parseFloat(tenureValue);

    if (isNaN(p) || p <= 0) { setError('Please enter a valid loan amount.'); return; }
    if (isNaN(rAnnual) || rAnnual < 0) { setError('Please enter a valid annual interest rate (0 or positive).'); return; }
    if (isNaN(tValue) || tValue <= 0) { setError(`Please enter a valid loan tenure in ${tenureUnit}.`); return; }
    if (!startDate || isNaN(new Date(startDate).getTime())) { setError('Please enter a valid loan start date.'); return; }

    const nMonths = tenureUnit === 'years' ? Math.round(tValue * 12) : Math.round(tValue);
    if (nMonths <= 0) { setError(`Calculated tenure in months is invalid.`); return; }
    if (nMonths > 720) { setError('Loan tenure is too long (max 60 years / 720 months).'); return; }

    const rMonthly = rAnnual / 12 / 100;
    let emiValue: number;
    if (rMonthly === 0) emiValue = p / nMonths;
    else emiValue = (p * rMonthly * Math.pow(1 + rMonthly, nMonths)) / (Math.pow(1 + rMonthly, nMonths) - 1);

    if (isNaN(emiValue) || !isFinite(emiValue) || (emiValue <= 0 && p > 0)) {
        setError('Could not calculate EMI. Please check your inputs.');
        return;
    }

    const schedule: AmortizationEntry[] = [];
    let beginningBalance = p;
    const [startYear, startMonth, startDayNum] = startDate.split('-').map(Number);
    const baseDateForPayments = new Date(startYear, startMonth - 1, startDayNum);

    for (let month = 1; month <= nMonths; month++) {
      let currentEmi = emiValue;
      const interestForMonth = beginningBalance * rMonthly;
      let principalForMonth = currentEmi - interestForMonth;

      if (month === nMonths) {
        principalForMonth = beginningBalance;
        currentEmi = beginningBalance + interestForMonth;
      }
      
      const endingBalance = beginningBalance - principalForMonth;
      const targetMonth = baseDateForPayments.getMonth() + month;
      const paymentDate = new Date(baseDateForPayments.getFullYear(), targetMonth, startDayNum);
      // If the day doesn't exist in the target month (e.g., Jan 31st -> Feb 31st), roll back to the last day of the intended month
      if (paymentDate.getMonth() !== (targetMonth % 12)) {
        paymentDate.setDate(0);
      }
      schedule.push({
        month,
        paymentDate: formatDateToYYYYMMDD(paymentDate),
        beginningBalance: parseFloat(String(beginningBalance.toFixed(2))),
        emi: parseFloat(String(currentEmi.toFixed(2))),
        principalPaid: parseFloat(String(principalForMonth.toFixed(2))),
        interestPaid: parseFloat(String(interestForMonth.toFixed(2))),
        endingBalance: parseFloat(Math.abs(endingBalance) < 0.005 ? "0" : String(endingBalance.toFixed(2))), 
      });
      beginningBalance = endingBalance;
      if (beginningBalance <= 0.005 && month < nMonths && p > 0) break;
    }
    
    const finalTotalPayment = schedule.reduce((sum, entry) => sum + entry.emi, 0);
    const actualTotalInterestPaid = finalTotalPayment - p;

    setScheduleResult({
      emi: parseFloat(String(emiValue.toFixed(2))), 
      totalInterest: parseFloat(String(actualTotalInterestPaid.toFixed(2))),
      totalPayment: parseFloat(String(finalTotalPayment.toFixed(2))),
      schedule: schedule,
    });
  }, [principal, annualRate, tenureValue, tenureUnit, startDate]);

  const handleReset = useCallback(() => {
    setLoanName('');
    setPrincipal('');
    setAnnualRate('');
    setTenureValue('');
    setTenureUnit('years');
    setStartDate(formatDateToYYYYMMDD(new Date()));
    setScheduleResult(null);
    setError(null);
    setPaymentStatus({});
    setIsViewingSaved(false);
    setLoadedScheduleName('');
    setLoadedScheduleId(null);
    setProductImage(null);
    setCompletionGreeting(null);
    clearLoadedSchedule();
  }, [clearLoadedSchedule]);
  
  const getDaysDifference = (d1Str: string, d2Str: string) => {
    const d1 = new Date(d1Str);
    const d2 = new Date(d2Str);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    const diffTime = d1.getTime() - d2.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDueDateForMonth = (month: number, start: string) => {
    if (!start) return new Date();
    const [year, m, d] = start.split('-').map(Number);
    const baseDate = new Date(year, m - 1, d);
    const dueDate = new Date(baseDate);
    dueDate.setMonth(baseDate.getMonth() + month);
    if (dueDate.getDate() !== d) dueDate.setDate(0);
    return dueDate;
  };

  const togglePaymentStatus = (monthNumber: number) => {
    const isNowPaid = !paymentStatus[monthNumber];
    const newStatus = { ...paymentStatus, [monthNumber]: isNowPaid };
    setPaymentStatus(newStatus);
    
    // Check if this was the last payment to trigger celebration
    if (isNowPaid && scheduleResult) {
        const totalInstallments = scheduleResult.schedule.length;
        const paidCount = Object.values(newStatus).filter(Boolean).length;
        
        if (paidCount === totalInstallments) {
            const greeting = `Hooray! You have officially cleared your ${loanName || 'loan'} on ${new Date().toLocaleDateString('en-IN')}. Your financial discipline has paid off!`;
            setCompletionGreeting(greeting);
            setShowCelebration(true);
        } else {
            setCompletionGreeting(null);
        }
    } else {
        setCompletionGreeting(null);
    }
  };
  
  const handleDownloadPdf = async () => {
    if (!scheduleResult || scheduleResult.schedule.length === 0) { alert("No schedule data to download."); return; }
    try {
      const doc = new jsPDF('l'); 
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // CELEBRATORY BOKEH BACKGROUND (Requested for fully paid loans)
      if (isLoanFullyPaid) {
          // 1. Solid Dark Base (Slate 900)
          doc.setFillColor(15, 23, 42); 
          doc.rect(0, 0, pageWidth, pageHeight, 'F');
          
          // 2. Bubbles / Bokeh Effect
          const bubbleColors = [
              [0, 188, 212],  // Cyan
              [233, 30, 99],  // Pink
              [139, 195, 74], // Lime
              [255, 152, 0],  // Orange
              [103, 58, 183], // Deep Purple
              [255, 235, 59]  // Yellow
          ];

          doc.saveGraphicsState();
          // Draw 35-40 random circles with transparency
          for (let i = 0; i < 40; i++) {
              const color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
              const x = Math.random() * pageWidth;
              const y = Math.random() * pageHeight;
              const radius = 10 + Math.random() * 45;
              const opacity = 0.1 + Math.random() * 0.25;

              doc.setGState(new (doc as any).GState({ opacity }));
              doc.setFillColor(color[0], color[1], color[2]);
              doc.circle(x, y, radius, 'F');
          }
          doc.restoreGraphicsState();

          // 3. Semi-transparent "Glass" Container for readability
          doc.saveGraphicsState();
          doc.setGState(new (doc as any).GState({ opacity: 0.85 }));
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 5, 5, 'F');
          doc.restoreGraphicsState();

          // 4. PAID IN FULL Stamp (Background)
          doc.saveGraphicsState();
          doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
          doc.setTextColor(34, 197, 94);
          doc.setFontSize(100);
          doc.setFont(undefined, 'bold');
          doc.text("PAID IN FULL", pageWidth / 2, pageHeight / 2 + 20, { align: 'center', angle: 25 });
          doc.restoreGraphicsState();
      }

      const reportTitle = `Loan Repayment Certificate - ${loanName || 'Untitled Loan'}`;
      doc.setFontSize(22);
      doc.setTextColor(31, 41, 55); // Dark text for contrast on glass
      doc.setFont(undefined, 'bold');
      doc.text(reportTitle, 14, 22);
      
      let yPos = 45;

      // Profile Picture at top right
      if (profilePicture) {
        try {
            const imageType = profilePicture.startsWith('data:image/png') ? 'PNG' : 'JPEG';
            doc.addImage(profilePicture, imageType, 265, 14, 15, 15);
        } catch (e) { console.warn("Failed to add profile pic to PDF", e); }
      }

      // Add product image if available
      if (productImage) {
        try {
            const imgType = productImage.startsWith('data:image/png') ? 'PNG' : 'JPEG';
            doc.addImage(productImage, imgType, 220, 22, 35, 35);
        } catch (e) { console.warn("Failed to add product pic to PDF", e); }
      }

      // Add completion greeting banner
      if (completionGreeting) {
          doc.setFontSize(14);
          doc.setTextColor(22, 101, 52); 
          doc.setFont(undefined, 'bold');
          
          // Greeting Banner Background
          doc.setFillColor(187, 247, 208); 
          doc.rect(14, 30, 190, 12, 'F');
          
          doc.text(completionGreeting, 16, 38, { maxWidth: 185 });
          
          doc.setTextColor(31, 41, 55);
          doc.setFont(undefined, 'normal');
          yPos = 58;
      }

      autoTable(doc, {
        head: [["Month", "Payment Date", "Principal", "Interest", "EMI", "Status"]],
        body: scheduleResult.schedule.map(e => [
            e.month, 
            formatDateDisplay(e.paymentDate), 
            formatCurrency(e.principalPaid, true), 
            formatCurrency(e.interestPaid, true), 
            formatCurrency(e.emi, true), 
            paymentStatus[e.month] ? 'PAID' : 'PENDING'
        ]),
        startY: yPos, 
        theme: isLoanFullyPaid ? 'striped' : (pdfStyle === 'financial' ? 'plain' : pdfStyle),
        headStyles: { fillColor: isLoanFullyPaid ? [34, 197, 94] : currentThemeColors.brandPrimary },
        styles: { fontSize: 9 },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 5) {
                if (data.cell.raw === 'PAID') {
                    data.cell.styles.textColor = [22, 101, 52];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        }
      });

      const fileName = isLoanFullyPaid ? `Certificate_${loanName.replace(/\s+/g, '_')}` : `Schedule_${loanName.replace(/\s+/g, '_')}`;
      doc.save(`${fileName}.pdf`);
    } catch (e) { console.error(e); }
  };

  const handleSaveSchedule = () => {
    if (!activeAccountId || !scheduleResult) return;
    const trimmedLoanName = loanName.trim();
    if (!trimmedLoanName) { addToast("Loan name cannot be empty.", "warning"); return; }
    const isNameTaken = savedAmortizationSchedules.some(s => !s.isDeleted && s.loanName.toLowerCase() === trimmedLoanName.toLowerCase() && s.id !== loadedScheduleId);
    if (isNameTaken) { addToast(`A schedule with the name "${trimmedLoanName}" already exists.`, "error"); return; }
    const scheduleData = { 
        accountId: activeAccountId, 
        loanName: trimmedLoanName, 
        principal: parseFloat(principal), 
        annualRate: parseFloat(annualRate), 
        tenureValue: parseFloat(tenureValue), 
        tenureUnit: tenureUnit, 
        startDate: startDate, 
        calculatedEmi: scheduleResult.emi, 
        totalInterest: scheduleResult.totalInterest, 
        totalPayment: scheduleResult.totalPayment, 
        schedule: scheduleResult.schedule, 
        paymentStatus: paymentStatus, 
        productImage: productImage,
        completionGreeting: completionGreeting
    };
    if (isViewingSaved && loadedScheduleId) {
      setSavedAmortizationSchedules(prev => prev.map(s => s.id === loadedScheduleId ? { ...scheduleData, id: loadedScheduleId, createdAt: s.createdAt } : s));
      addToast(`Schedule "${trimmedLoanName}" updated!`, "success");
    } else {
      setSavedAmortizationSchedules(prev => [...prev, { ...scheduleData, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]);
      addToast(`Schedule "${trimmedLoanName}" saved!`, "success");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        setProductImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const inputClasses = "mt-1 block w-full px-3 py-2 bg-bg-secondary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-text-base-themed placeholder-text-muted-themed dark:[color-scheme:light]";
  const labelClasses = "block text-sm font-medium text-text-muted-themed";

  return (
    <div className="p-4 sm:p-6 rounded-xl shadow-lg" style={{ backgroundColor: currentThemeColors.bgSecondary }}>
      <h2 className="text-xl sm:text-2xl font-semibold text-text-base-themed mb-6 text-center flex items-center justify-center">
        <CalendarDaysIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 text-brand-primary" />
        Loan Amortization Schedule
      </h2>

      {isViewingSaved && (
        <div className="mb-4 p-3 rounded-md text-sm flex items-center justify-between" style={{backgroundColor: currentThemeColors.bgAccent, color: currentThemeColors.textBase}}>
            <span>
                <AlertTriangleIcon className="w-4 h-4 inline-block mr-1.5 -mt-0.5" style={{color: currentThemeColors.brandPrimary}}/> 
                Viewing/Editing saved schedule: <strong>{loadedScheduleName}</strong>
            </span>
            <button onClick={handleReset} className="text-xs font-medium py-1 px-2 rounded hover:opacity-80" style={{color: currentThemeColors.brandPrimary, border: `1px solid ${currentThemeColors.brandPrimary}`}}>Start New</button>
        </div>
      )}

      {completionGreeting && (
          <div className="mb-6 p-4 rounded-xl border-2 flex items-center gap-4 animate-fade-in shadow-inner" style={{ backgroundColor: `${currentThemeColors.income}10`, borderColor: `${currentThemeColors.income}40` }}>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg ring-4 ring-yellow-400/20">
                  <SparklesIcon className="w-8 h-8 text-yellow-500 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase text-income tracking-widest mb-1">Loan Milestone</p>
                  <p className="text-sm font-black text-text-base-themed uppercase tracking-tight italic leading-relaxed">
                      {completionGreeting}
                  </p>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-6 mb-6 sm:mb-8">
        <div className="space-y-3 sm:space-y-4">
          <div><label htmlFor="loanName-amort" className={labelClasses}>Loan Name</label><input type="text" id="loanName-amort" value={loanName} onChange={(e) => setLoanName(e.target.value)} className={inputClasses} placeholder="e.g., Home Loan" /></div>
          
          <div className="flex items-center gap-4">
             <div className="flex-1">
                <label htmlFor="principal-amort" className={labelClasses}>Loan Amount</label>
                <input type="number" id="principal-amort" value={principal} onChange={(e) => setPrincipal(e.target.value)} className={inputClasses} placeholder="e.g., 100000" />
             </div>
             <div className="w-24">
                <label className={labelClasses}>Asset Pic</label>
                <div className="relative group w-full h-10 mt-1 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden border-border-secondary transition-all hover:border-brand-primary">
                    {productImage ? (
                        <img src={productImage} className="w-full h-full object-cover" />
                    ) : (
                        <SparklesIcon className="w-5 h-5 text-slate-300" />
                    )}
                    <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
             </div>
          </div>

          <div><label htmlFor="annualRate-amort" className={labelClasses}>Annual Interest Rate (%)</label><input type="number" id="annualRate-amort" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} className={inputClasses} step="0.01" /></div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div><label htmlFor="tenureValue-amort" className={labelClasses}>Loan Tenure</label><input type="number" id="tenureValue-amort" value={tenureValue} onChange={(e) => setTenureValue(e.target.value)} className={inputClasses} step="1" /></div>
            <div><label htmlFor="tenureUnit-amort" className={labelClasses}>Tenure Unit</label><select id="tenureUnit-amort" value={tenureUnit} onChange={(e) => setTenureUnit(e.target.value as 'years' | 'months')} className={inputClasses}><option value="years">Years</option><option value="months">Months</option></select></div>
          </div>
          <div><label htmlFor="startDate-amort" className={labelClasses}>Loan Start Date</label><input type="date" id="startDate-amort" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClasses} /></div>
        </div>

        <div className="space-y-3 sm:space-y-4 flex flex-col justify-end">
            {error && <div className="p-3 rounded-md border text-sm flex items-center" style={{ backgroundColor: currentThemeColors.bgAccent, borderColor: currentThemeColors.expense, color: currentThemeColors.expense }}><AlertTriangleIcon className="w-5 h-5 mr-2" />{error}</div>}
            <button onClick={calculateSchedule} className="w-full py-2.5 bg-brand-primary text-text-inverted rounded-lg font-bold shadow-md hover:opacity-90">Calculate Schedule</button>
            {scheduleResult && !error && (
                <div className="space-y-3">
                    <button onClick={handleSaveSchedule} className="w-full py-2.5 bg-brand-secondary text-text-inverted rounded-lg font-bold shadow-md hover:opacity-90"><SaveIcon className="w-4 h-4 mr-2 inline-block"/>{isViewingSaved ? 'Update Schedule' : 'Save Schedule'}</button>
                    <div className="p-4 rounded-lg space-y-1.5 text-sm" style={{backgroundColor: currentThemeColors.bgAccent}}>
                        <h3 className="font-semibold text-text-base-themed">Summary:</h3>
                        <div className="flex justify-between"><span>Monthly EMI:</span><span className="font-bold text-brand-primary">{formatCurrency(scheduleResult.emi)}</span></div>
                        <div className="flex justify-between"><span>Total Payment:</span><span className="font-bold text-text-base-themed">{formatCurrency(scheduleResult.totalPayment)}</span></div>
                    </div>
                </div>
            )}
            {scheduleResult && !error && (
                <button onClick={handleDownloadPdf} className="w-full py-2.5 border-2 border-slate-200 dark:border-slate-700 text-text-base-themed rounded-lg font-black uppercase text-xs tracking-widest shadow-sm hover:bg-bg-accent-themed transition-colors"><DownloadIcon className="w-4 h-4 mr-2 inline-block"/> {isLoanFullyPaid ? 'Download Certificate' : 'Download Schedule'}</button>
            )}
        </div>
      </div>

      {scheduleResult && !error && (
        <div className="mt-6 sm:mt-8 overflow-x-auto rounded-lg border shadow-inner" style={{borderColor: currentThemeColors.borderSecondary}}>
            <table className="w-full min-w-[800px] text-xs text-left text-text-muted-themed">
              <thead className="sticky top-0 z-10" style={{backgroundColor: currentThemeColors.bgAccent}}>
                <tr>
                  <th className="px-3 py-2">#</th><th className="px-3 py-2">Payment Date</th><th className="px-3 py-2 text-right">Principal</th><th className="px-3 py-2 text-right">Interest</th><th className="px-3 py-2 text-right">EMI</th><th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {scheduleResult.schedule.map((entry, index) => (
                  <tr key={entry.month} style={{backgroundColor: index % 2 === 0 ? currentThemeColors.bgSecondary : currentThemeColors.bgAccent+'33'}} className="hover:bg-bg-accent-themed/20">
                    <td className="px-3 py-2 font-bold">{entry.month}</td>
                    <td className="px-3 py-2">
                      <div className="font-bold">{formatDateDisplay(entry.paymentDate)}</div>
                      {(() => {
                        const isPaid = paymentStatus[entry.month];
                        const plannedDate = getDueDateForMonth(entry.month, startDate);
                        const plannedDateStr = formatDateToYYYYMMDD(plannedDate);
                        const todayStr = formatDateToYYYYMMDD(new Date());
                        
                        if (isPaid) {
                          const diff = getDaysDifference(entry.paymentDate, plannedDateStr);
                          if (diff < 0) return <span className="text-[9px] font-black uppercase text-green-500">Paid {Math.abs(diff)}d early</span>;
                          if (diff > 0) return <span className="text-[9px] font-black uppercase text-red-500">Paid {diff}d late</span>;
                          return <span className="text-[9px] font-black uppercase text-blue-400">Paid on time</span>;
                        } else {
                          const diff = getDaysDifference(plannedDateStr, todayStr);
                          if (diff < 0) return <span className="text-[9px] font-black uppercase text-orange-500">Overdue {Math.abs(diff)}d</span>;
                          if (diff === 0) return <span className="text-[9px] font-black uppercase text-yellow-500">Due today</span>;
                          return <span className="text-[9px] font-black uppercase text-slate-400">Due in {diff}d</span>;
                        }
                      })()}
                    </td>
                    <td className="px-3 py-2 text-right">{formatCurrency(entry.principalPaid)}</td>
                    <td className="px-3 py-2 text-right" style={{color: currentThemeColors.expense}}>{formatCurrency(entry.interestPaid)}</td>
                    <td className="px-3 py-2 text-right font-bold" style={{color: currentThemeColors.brandPrimary}}>{formatCurrency(entry.emi)}</td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => togglePaymentStatus(entry.month)} className="p-1 rounded-full transition-all hover:scale-110" style={{ color: paymentStatus[entry.month] ? currentThemeColors.income : currentThemeColors.expense }}>
                        {paymentStatus[entry.month] ? <CheckCircleIcon className="w-5 h-5"/> : <XCircleIcon className="w-5 h-5"/>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in overflow-hidden">
            {/* Blast Effect Container */}
            <div className="festive-overlay absolute inset-0 pointer-events-none">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div 
                        key={i} 
                        className="firework" 
                        style={{
                            top: `${Math.random() * 80 + 10}%`,
                            left: `${Math.random() * 80 + 10}%`,
                            animationDelay: `${Math.random() * 1.5}s`,
                            animationDuration: `${1.5 + Math.random()}s`,
                            backgroundImage: `radial-gradient(circle, #fff 0%, ${['#ff0', '#f90', '#0ff', '#f0f', '#0f0'][i % 5]} 40%, ${['#f90', '#ea4335', '#4285f4', '#34a853'][i % 4]} 70%, transparent 100%)`
                        }} 
                    />
                ))}
            </div>

            <div className="relative z-10 w-full max-w-lg text-center animate-modal-enter">
                <div className="mb-6 inline-flex p-5 rounded-full bg-white/10 ring-8 ring-white/5 animate-pulse">
                    {productImage ? (
                        <img src={productImage} className="w-20 h-20 rounded-full object-cover border-4 border-yellow-400" />
                    ) : (
                        <SparklesIcon className="w-20 h-20 text-yellow-400" />
                    )}
                </div>
                <h2 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-4 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">
                    Debt Free!
                </h2>
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl mb-8 backdrop-blur-sm">
                    <p className="text-xl font-bold text-white mb-2">Congratulations!</p>
                    <p className="text-slate-300 leading-relaxed">
                        You have successfully completed all installments for <span className="text-brand-secondary font-black">{loanName || 'your loan'}</span>. 
                        This is a huge milestone in your financial journey!
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => { handleSaveSchedule(); setShowCelebration(false); }}
                        className="px-10 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto w-full max-w-xs"
                    >
                        <SaveIcon className="w-5 h-5" />
                        Save Record & Milestone
                    </button>
                    <button 
                        onClick={() => setShowCelebration(false)}
                        className="px-10 py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase tracking-widest rounded-2xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto w-full max-w-xs"
                    >
                        <CheckCircleIcon className="w-6 h-6" />
                        Great Achievement!
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
