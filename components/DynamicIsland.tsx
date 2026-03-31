import React, { useEffect, useState } from 'react';
import { PillNotificationInfo } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { 
    IncomeIcon, 
    ExpenseIcon, 
    BanknotesIcon as TransferIcon, 
    BellIcon as InfoIcon, 
    CheckCircleIcon, 
    AlertTriangleIcon, 
    XCircleIcon, 
    ArrowUturnLeftIcon,
    XIcon,
    ClockIcon
} from './Icons';

interface PillNotificationProps {
  info: PillNotificationInfo | null;
  onClose: () => void;
}

const PillNotification: React.FC<PillNotificationProps> = ({ info, onClose }) => {
  const { currentThemeColors, theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  const isUndoPrompt = info?.type === 'undo' && info.onAction;

  useEffect(() => {
    if (info) {
      setIsVisible(true);
      const duration = isUndoPrompt ? 5000 : 4000;

      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [info, onClose, isUndoPrompt]);

  if (!info) {
    return null;
  }

  const formatCurrency = (amount?: number) => {
    if (typeof amount !== 'number') return '';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };
  
  if (info.type === 'days_remaining') {
    return (
        <div className={`pill-notification ${isVisible ? 'visible' : ''}`} role="alert">
            <div 
                className="pill-notification-content items-center !p-1.5" 
                style={{ 
                    backgroundColor: theme.mode === 'dark' ? '#000000' : '#111827', // Use black or near-black for the island
                    color: '#FFFFFF' // White text
                }}
            >
                <div 
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                    style={{ backgroundColor: '#000000' }} // Inner circle is pure black
                >
                    {info.amount}
                </div>
                <span className="text-sm font-medium flex-grow px-2 truncate">{info.message}</span>
                <button
                    onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                    }}
                    className="p-1 rounded-full hover:bg-white/10"
                    aria-label="Close notification"
                >
                    <XIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
  }

  
  let IconComponent;
  let bgColor, textColor, content;
  
  const warningColorLight = '#F59E0B'; 
  const warningColorDark = '#FCD34D'; 
  const undoColor = theme.mode === 'dark' ? '#A78BFA' : '#7C3AED';

  switch (info.type) {
    case 'income':
      IconComponent = IncomeIcon;
      bgColor = currentThemeColors.income;
      textColor = currentThemeColors.textInverted;
      content = `+ ${formatCurrency(info.amount)}`;
      break;
    case 'expense':
      IconComponent = ExpenseIcon;
      bgColor = currentThemeColors.expense;
      textColor = currentThemeColors.textInverted;
      content = `- ${formatCurrency(info.amount)}`;
      break;
    case 'transfer':
        IconComponent = TransferIcon;
        bgColor = currentThemeColors.brandSecondary;
        textColor = currentThemeColors.textInverted;
        content = `Transfer: ${formatCurrency(info.amount)}`;
        break;
    case 'success':
      IconComponent = CheckCircleIcon;
      bgColor = currentThemeColors.income;
      textColor = currentThemeColors.textInverted;
      content = info.message;
      break;
    case 'warning':
      IconComponent = AlertTriangleIcon;
      bgColor = theme.mode === 'dark' ? warningColorDark : warningColorLight;
      textColor = theme.mode === 'dark' ? currentThemeColors.bgPrimary : currentThemeColors.textInverted;
      content = info.message;
      break;
    case 'error':
      IconComponent = XCircleIcon;
      bgColor = currentThemeColors.expense;
      textColor = currentThemeColors.textInverted;
      content = info.message;
      break;
    case 'undo':
      IconComponent = ArrowUturnLeftIcon;
      bgColor = undoColor;
      textColor = currentThemeColors.textInverted;
      content = info.message;
      break;
    default: // 'info' and others
      IconComponent = InfoIcon;
      bgColor = currentThemeColors.bgAccent;
      textColor = currentThemeColors.textBase;
      content = info.message;
  }

  return (
    <div className={`pill-notification ${isVisible ? 'visible' : ''}`} role="alert">
        <div className="pill-notification-content" style={{ backgroundColor: bgColor, color: textColor }}>
            <IconComponent className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium pill-notification-text">{content}</span>
            {isUndoPrompt && (
                <button
                    onClick={(e) => {
                    e.stopPropagation();
                    info.onAction!();
                    onClose();
                    }}
                    className="ml-2 px-3 py-1 text-xs font-bold rounded-full border border-white/30 hover:bg-white/20 transition-colors"
                    style={{ color: textColor }}
                >
                    {info.actionLabel || 'Undo'}
                </button>
            )}
             <button
                onClick={(e) => {
                e.stopPropagation();
                onClose();
                }}
                className="p-1 rounded-full hover:bg-white/10"
                aria-label="Close notification"
            >
                <XIcon className="w-4 h-4" />
            </button>
        </div>
    </div>
  );
};

export default PillNotification;