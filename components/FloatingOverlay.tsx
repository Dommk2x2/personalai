import React from 'react';
import { motion } from 'motion/react';
import { XIcon, ArrowsPointingOutIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';

interface FloatingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const FloatingOverlay: React.FC<FloatingOverlayProps> = ({ isOpen, onClose, title, children }) => {
  const { currentThemeColors } = useTheme();

  if (!isOpen) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.9, x: 20, y: 20 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        position: 'fixed',
        top: '100px',
        right: '20px',
        zIndex: 9999,
        width: '350px',
        maxHeight: '500px',
        backgroundColor: currentThemeColors.bgPrimary,
        border: `1px solid ${currentThemeColors.borderSecondary}`,
        borderRadius: '1rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: 'grab',
      }}
      whileDrag={{ cursor: 'grabbing', scale: 1.02 }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 border-b"
        style={{ borderColor: currentThemeColors.borderSecondary, backgroundColor: currentThemeColors.bgSecondary }}
      >
        <div className="flex items-center gap-2">
          <ArrowsPointingOutIcon className="w-4 h-4 text-brand-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {title}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        {children}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${currentThemeColors.borderSecondary}; border-radius: 10px; }
      `}</style>
    </motion.div>
  );
};

export default FloatingOverlay;
