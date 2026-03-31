import React, { useEffect } from 'react';
import { ToastType } from '../types';
import { CheckCircleIcon, XCircleIcon, AlertTriangleIcon, BellIcon as InfoIcon, ArrowUturnLeftIcon, XIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';

interface ToastNotificationProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onClose: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ message, type, visible, onClose, onAction, actionLabel }) => {
  const { currentThemeColors } = useTheme();
  
  useEffect(() => {
    if (visible && type !== 'undo') {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose, type]);

  let Icon;
  let bgColor, textColor;

  switch (type) {
    case 'success':
    case 'income':
      Icon = CheckCircleIcon;
      bgColor = currentThemeColors.income;
      textColor = currentThemeColors.textInverted;
      break;
    case 'error':
    case 'expense':
      Icon = XCircleIcon;
      bgColor = currentThemeColors.expense;
      textColor = currentThemeColors.textInverted;
      break;
    case 'warning':
      Icon = AlertTriangleIcon;
      bgColor = '#f59e0b'; // amber-500
      textColor = '#ffffff';
      break;
    case 'undo':
      Icon = ArrowUturnLeftIcon;
      bgColor = currentThemeColors.brandSecondary;
      textColor = currentThemeColors.textInverted;
      break;
    case 'info':
    default:
      Icon = InfoIcon;
      bgColor = currentThemeColors.bgAccent;
      textColor = currentThemeColors.textBase;
      break;
  }

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    onClose();
  };
  
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      role="alert"
      aria-live="assertive"
    >
      <div 
        className="max-w-sm w-full rounded-lg shadow-lg flex items-center p-4"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <div className="flex-shrink-0">
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex items-center">
          {onAction && type === 'undo' && (
            <button
              onClick={handleAction}
              className="mr-2 inline-flex text-sm font-semibold focus:outline-none hover:opacity-80"
            >
              {actionLabel || 'Undo'}
            </button>
          )}
          <button
            onClick={onClose}
            className="inline-flex rounded-md p-1.5 focus:outline-none hover:bg-black/10"
          >
            <span className="sr-only">Close</span>
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;