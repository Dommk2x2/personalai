import React, { useState, useCallback } from 'react';
import { CalculatorIcon, AlertTriangleIcon as ErrorIcon } from './Icons'; // Assuming a calculator icon exists or will be added
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme

interface EmiResult {
  emi: number;
  totalInterest: number;
  totalPayment: number;
}

const EmiCalculator: React.FC = () => {
  const { currentThemeColors } = useTheme(); // Get theme colors
  const [principal, setPrincipal] = useState<string>('');
  const [annualRate, setAnnualRate] = useState<string>('');
  const [tenureYears, setTenureYears] = useState<string>('');
  const [emiResult, setEmiResult] = useState<EmiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number): string => {
    // Using INR as it's common in the app, but can be made dynamic if needed
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  const calculateEmi = useCallback(() => {
    setError(null);
    setEmiResult(null);

    const p = parseFloat(principal);
    const rAnnual = parseFloat(annualRate);
    const tYears = parseFloat(tenureYears);

    if (isNaN(p) || p <= 0) {
      setError('Please enter a valid loan amount.');
      return;
    }
    if (isNaN(rAnnual) || rAnnual <= 0) {
      setError('Please enter a valid annual interest rate.');
      return;
    }
    if (isNaN(tYears) || tYears <= 0) {
      setError('Please enter a valid loan tenure in years.');
      return;
    }

    const rMonthly = rAnnual / 12 / 100;
    const nMonths = tYears * 12;

    if (rMonthly === 0) { // Handle zero interest rate case
        const emi = p / nMonths;
        setEmiResult({
            emi: emi,
            totalInterest: 0,
            totalPayment: p,
        });
        return;
    }

    // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    const emi = (p * rMonthly * Math.pow(1 + rMonthly, nMonths)) / (Math.pow(1 + rMonthly, nMonths) - 1);
    
    if (isNaN(emi) || !isFinite(emi)) {
        setError('Could not calculate EMI. Please check your inputs. Rate or tenure might be too small.');
        return;
    }

    const totalPayment = emi * nMonths;
    const totalInterest = totalPayment - p;

    setEmiResult({
      emi: emi,
      totalInterest: totalInterest,
      totalPayment: totalPayment,
    });
  }, [principal, annualRate, tenureYears]);

  const handleReset = useCallback(() => {
    setPrincipal('');
    setAnnualRate('');
    setTenureYears('');
    setEmiResult(null);
    setError(null);
  }, []);

  const inputClasses = "mt-1 block w-full px-3 py-2 bg-bg-secondary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-text-base-themed placeholder-text-muted-themed";
  const labelClasses = "block text-sm font-medium text-text-muted-themed";

  return (
    <div className="bg-bg-secondary-themed p-6 rounded-xl shadow-lg mb-8">
      <h2 className="text-2xl font-semibold text-text-base-themed mb-6 text-center">
        <CalculatorIcon className="w-7 h-7 inline-block mr-2 -mt-1 text-brand-primary" />
        EMI Calculator
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label htmlFor="principal" className={labelClasses}>Loan Amount (Principal)</label>
            <input
              type="number"
              id="principal"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className={inputClasses}
              placeholder="e.g., 100000"
              aria-describedby="principal-error"
            />
          </div>
          <div>
            <label htmlFor="annualRate" className={labelClasses}>Annual Interest Rate (%)</label>
            <input
              type="number"
              id="annualRate"
              value={annualRate}
              onChange={(e) => setAnnualRate(e.target.value)}
              className={inputClasses}
              placeholder="e.g., 7.5"
              step="0.01"
              aria-describedby="rate-error"
            />
          </div>
          <div>
            <label htmlFor="tenureYears" className={labelClasses}>Loan Tenure (Years)</label>
            <input
              type="number"
              id="tenureYears"
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
              className={inputClasses}
              placeholder="e.g., 5"
              step="0.1"
              aria-describedby="tenure-error"
            />
          </div>
          {error && ( // Error display is part of the input section for flow
            <div 
              className="p-3 rounded-md border text-sm flex items-center" 
              style={{ 
                backgroundColor: currentThemeColors.bgAccent, 
                borderColor: currentThemeColors.expense,
                color: currentThemeColors.expense 
              }}
              role="alert"
            >
                <ErrorIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                {error}
            </div>
          )}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={calculateEmi}
              className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-text-inverted bg-brand-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-bg-secondary-themed"
            >
              Calculate EMI
            </button>
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center px-4 py-2.5 border border-border-primary text-sm font-medium rounded-md shadow-sm text-text-base-themed bg-bg-accent-themed hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-border-focus dark:focus:ring-offset-bg-secondary-themed"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Result Section */}
        {emiResult && (
          <div className="bg-bg-accent-themed p-6 rounded-lg space-y-4">
            <h3 className="text-xl font-semibold text-text-base-themed mb-3">Loan Details:</h3>
            <div>
              <p className="text-sm text-text-muted-themed">Monthly EMI</p>
              <p className="text-2xl font-bold text-brand-primary">{formatCurrency(emiResult.emi)}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted-themed">Total Interest Payable</p>
              <p className="text-lg font-medium" style={{ color: currentThemeColors.expense }}>{formatCurrency(emiResult.totalInterest)}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted-themed">Total Payment (Principal + Interest)</p>
              <p className="text-lg font-medium text-text-base-themed">{formatCurrency(emiResult.totalPayment)}</p>
            </div>
            <p className="text-xs text-text-muted-themed pt-2">
              *Calculations are approximate and for illustrative purposes only.
            </p>
          </div>
        )}
        {!emiResult && !error && (
             <div className="bg-bg-accent-themed p-6 rounded-lg flex flex-col items-center justify-center text-center">
                <CalculatorIcon className="w-16 h-16 text-text-disabled mb-4" />
                <p className="text-text-muted-themed">Enter loan details to calculate your EMI.</p>
            </div>
        )}
         {error && !emiResult && ( // This specific styling for error in the results panel will be overridden by the general error display in the input section if that's preferred.
                                  // For now, keeping it distinct. If error should only show once, then this block can be removed.
             <div 
                className="bg-bg-accent-themed p-6 rounded-lg flex flex-col items-center justify-center text-center border"
                style={{borderColor: currentThemeColors.expense}}
             >
                <ErrorIcon className="w-12 h-12 mb-3" style={{color: currentThemeColors.expense}}/>
                <p className="font-medium" style={{color: currentThemeColors.expense}}>Calculation Error</p>
                <p className="text-sm mt-1" style={{color: currentThemeColors.expense}}>{error}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default EmiCalculator;