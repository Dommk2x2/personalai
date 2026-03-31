

import React, { useState, useEffect } from 'react';
import { BanknotesIcon, SaveIcon, PlusIcon, TrashIcon } from '../Icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ToastType, SalaryDeduction } from '../../types';

interface SalarySettingsProps {
  monthlySalary: number | null;
  onSetMonthlySalary: (salary: number | null) => void;
  addToast: (message: string, type: ToastType) => void;
  salaryDeductions: SalaryDeduction[];
  onAddSalaryDeduction: (name: string, amount: number) => void;
  onDeleteSalaryDeduction: (id: string) => void;
}

const SalarySettings: React.FC<SalarySettingsProps> = ({ 
  monthlySalary, 
  onSetMonthlySalary, 
  addToast,
  salaryDeductions,
  onAddSalaryDeduction,
  onDeleteSalaryDeduction
}) => {
  const { currentThemeColors } = useTheme();
  const [currentMonthlySalaryInput, setCurrentMonthlySalaryInput] = useState<string>(monthlySalary !== null ? String(monthlySalary) : '');
  const [deductionName, setDeductionName] = useState('');
  const [deductionAmount, setDeductionAmount] = useState('');

  useEffect(() => {
    setCurrentMonthlySalaryInput(monthlySalary !== null ? String(monthlySalary) : '');
  }, [monthlySalary]);

  const handleSaveSalary = () => {
    const salaryValue = parseFloat(currentMonthlySalaryInput);
    if (currentMonthlySalaryInput.trim() === '') {
      onSetMonthlySalary(null);
    } else if (!isNaN(salaryValue) && salaryValue >= 0) {
      onSetMonthlySalary(salaryValue);
    } else {
      addToast("Invalid salary amount. Please enter a positive number or leave blank.", "warning");
    }
  };

  const handleAddDeduction = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(deductionAmount);
    onAddSalaryDeduction(deductionName, amount);
    setDeductionName('');
    setDeductionAmount('');
  };
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-bg-primary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-text-base-themed placeholder-text-muted-themed";
  const labelBaseClasses = "block text-sm font-medium text-text-muted-themed";
  const saveButtonClasses = "w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-text-inverted bg-brand-secondary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 dark:focus:ring-offset-bg-secondary-themed transition-all";

  return (
    <div className="space-y-6">
      <h4 className="text-md font-semibold mb-3 text-left flex items-center" style={{ color: currentThemeColors.textBase }}>
        <BanknotesIcon className="w-5 h-5 mr-2 text-brand-primary" /> Salary Configuration
      </h4>
      <div>
        <label htmlFor="monthlySalary" className={labelBaseClasses}>Base Monthly Salary (INR)</label>
        <input
          type="number"
          id="monthlySalary"
          value={currentMonthlySalaryInput}
          onChange={(e) => setCurrentMonthlySalaryInput(e.target.value)}
          className={`${inputBaseClasses} mb-3`}
          placeholder="e.g., 50000 (leave blank to unset)"
          min="0"
          step="100"
          aria-label="Base Monthly Salary"
        />
        <button onClick={handleSaveSalary} className={saveButtonClasses}>
          <SaveIcon className="w-4 h-4 mr-2" /> Save Salary
        </button>
      </div>

      <div className="pt-6 border-t border-border-secondary">
        <h4 className="text-md font-semibold mb-3 text-left" style={{ color: currentThemeColors.textBase }}>Standard Monthly Deductions</h4>
        <form onSubmit={handleAddDeduction} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-4">
          <div className="sm:col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="deductionName" className={labelBaseClasses}>Deduction Name</label>
              <input type="text" id="deductionName" value={deductionName} onChange={e => setDeductionName(e.target.value)} className={inputBaseClasses} placeholder="e.g., Provident Fund" />
            </div>
            <div>
              <label htmlFor="deductionAmount" className={labelBaseClasses}>Amount (INR)</label>
              <input type="number" id="deductionAmount" value={deductionAmount} onChange={e => setDeductionAmount(e.target.value)} className={inputBaseClasses} placeholder="e.g., 1800" min="0.01" step="0.01" />
            </div>
          </div>
          <button type="submit" className={`${saveButtonClasses} bg-brand-primary`} disabled={!deductionName.trim() || !deductionAmount}>
            <PlusIcon className="w-4 h-4 mr-2" /> Add Deduction
          </button>
        </form>

        <div className="space-y-2">
          {salaryDeductions.length > 0 ? (
            salaryDeductions.map(deduction => (
              <div key={deduction.id} className="flex justify-between items-center p-2.5 bg-bg-primary-themed rounded-lg shadow-sm">
                <div>
                  <p className="font-medium text-text-base-themed">{deduction.name}</p>
                  <p className="text-sm" style={{ color: currentThemeColors.expense }}>-{formatCurrency(deduction.amount)}</p>
                </div>
                <button
                  onClick={() => onDeleteSalaryDeduction(deduction.id)}
                  className="p-1.5 text-text-muted-themed hover:text-expense hover:bg-expense/10 rounded-lg transition-all"
                  aria-label={`Delete deduction ${deduction.name}`}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-text-muted-themed text-center py-2">No standard deductions added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalarySettings;