import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { AlertTriangleIcon } from './Icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) => {
  const { currentThemeColors } = useTheme();
  
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const confirmButtonColor = variant === 'danger' ? currentThemeColors.expense : currentThemeColors.brandPrimary;
  const confirmButtonTextColor = currentThemeColors.textInverted;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-modal-enter"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
    >
      <div 
        className="w-full max-w-md p-6 rounded-xl shadow-2xl" 
        style={{ backgroundColor: currentThemeColors.bgSecondary }} 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start">
            <div 
                className="mr-4 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full"
                style={{ backgroundColor: `${confirmButtonColor}2A`}}
            >
                <AlertTriangleIcon className="h-6 w-6" style={{ color: confirmButtonColor }}/>
            </div>
            <div>
                <h3 id="confirmation-modal-title" className="text-lg font-semibold" style={{ color: currentThemeColors.textBase }}>
                    {title}
                </h3>
                <p className="text-sm mt-2" style={{ color: currentThemeColors.textMuted }}>
                    {message}
                </p>
            </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t" style={{borderColor: currentThemeColors.borderSecondary}}>
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium rounded-lg shadow-sm hover:opacity-80" 
            style={{ backgroundColor: currentThemeColors.bgAccent, color: currentThemeColors.textBase }}
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            onClick={handleConfirm} 
            className="px-4 py-2 text-sm font-medium rounded-lg shadow-md hover:opacity-90" 
            style={{ backgroundColor: confirmButtonColor, color: confirmButtonTextColor }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
