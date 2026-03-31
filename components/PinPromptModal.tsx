import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { LockClosedIcon } from './Icons';

interface PinPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
  title?: string;
}

const PinPromptModal: React.FC<PinPromptModalProps> = ({ isOpen, onClose, onConfirm, title = "Enter PIN" }) => {
  const { currentThemeColors } = useTheme();
  const [pin, setPin] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setPin(value);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length >= 4) {
      onConfirm(pin);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-[150] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pin-prompt-title"
    >
      <div
        className="w-full max-w-xs p-6 rounded-xl shadow-2xl text-center"
        style={{ backgroundColor: currentThemeColors.bgSecondary }}
        onClick={(e) => e.stopPropagation()}
      >
        <LockClosedIcon className="w-10 h-10 mx-auto mb-3 text-brand-primary" />
        <h3 id="pin-prompt-title" className="text-lg font-semibold text-text-base-themed">{title}</h3>
        <p className="text-sm text-text-muted-themed mt-1 mb-4">Please enter your 4-6 digit PIN to continue.</p>
        
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="password"
            value={pin}
            onChange={handlePinChange}
            className="block w-full px-4 py-3 text-center bg-bg-primary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-base-themed tracking-[0.5em] text-2xl"
            maxLength={6}
            autoComplete="off"
            aria-label="PIN Input"
            inputMode="numeric"
          />
          <div className="flex justify-end gap-3 pt-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg shadow-sm"
              style={{ backgroundColor: currentThemeColors.bgAccent, color: currentThemeColors.textBase }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pin.length < 4}
              className="px-4 py-2 text-sm font-medium rounded-lg shadow-md text-text-inverted disabled:opacity-50"
              style={{ backgroundColor: currentThemeColors.brandPrimary }}
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinPromptModal;