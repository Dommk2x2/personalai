import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SectionKey } from '../types';
import { XIcon, PinIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, ChevronUpIcon, ChevronDownIcon } from './Icons';

// A simple Icon for when a section is pinned. We can use a "pin slash" or just a different color. For now, let's just use PinIcon and color it.
const PinnedIcon: React.FC<any> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M16.5 3.75a.75.75 0 01.75.75v11.19l3.47 3.47a.75.75 0 01-1.06 1.06l-3.47-3.47H8.28l-3.47 3.47a.75.75 0 01-1.06-1.06l3.47-3.47V4.5a.75.75 0 01.75-.75h9zM15 5.25H9v10.5H5.25a.75.75 0 01-.75-.75V8.06l2.22 2.22a.75.75 0 11-1.06-1.06L3.44 6.94A2.25 2.25 0 015.25 4.5H9V5.25z" clipRule="evenodd" />
    </svg>
);


interface HideableSectionProps {
  title: string;
  sectionKey: SectionKey;
  children: React.ReactNode;
  onHide: (sectionKey: SectionKey) => void;
  isVisible: boolean;
  isPinned: boolean;
  onTogglePin: (sectionKey: SectionKey) => void;
  isMaximized: boolean;
  onToggleMaximize: (sectionKey: SectionKey) => void;
  className?: string;
  isRearrangeMode: boolean;
  onMove: (direction: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
}

const HideableSection: React.FC<HideableSectionProps> = ({ 
  title, 
  sectionKey, 
  children, 
  onHide, 
  isVisible,
  isPinned,
  onTogglePin,
  isMaximized,
  onToggleMaximize,
  className = '',
  isRearrangeMode,
  onMove,
  isFirst,
  isLast
}) => {
  const { currentThemeColors } = useTheme();

  if (!isVisible) {
    return null;
  }

  const PinIconComponent = isPinned ? PinnedIcon : PinIcon;
  const MaximizeIconComponent = isMaximized ? ArrowsPointingInIcon : ArrowsPointingOutIcon;
  const controlButtonClasses = "p-1.5 rounded-full bg-bg-secondary-themed/60 backdrop-blur-sm hover:bg-bg-accent-themed transition-all duration-200";

  return (
    <div className={`relative group/section border rounded-xl transition-colors duration-300 ${isPinned ? 'border-brand-primary/50' : 'border-transparent'} ${className}`}>
      <div className={`absolute top-2 right-2 z-30 flex items-center space-x-1 transition-opacity duration-200 ${isRearrangeMode ? 'opacity-100' : 'opacity-0 group-hover/section:opacity-100 focus-within:opacity-100'}`}>
        {isRearrangeMode && (
            <>
            <button
                onClick={() => onMove('up')}
                disabled={isFirst}
                className={`${controlButtonClasses} text-text-muted-themed hover:text-brand-primary disabled:opacity-30 disabled:cursor-not-allowed`}
                title="Move Up"
            >
                <ChevronUpIcon className="w-4 h-4" />
            </button>
            <button
                onClick={() => onMove('down')}
                disabled={isLast}
                className={`${controlButtonClasses} text-text-muted-themed hover:text-brand-primary disabled:opacity-30 disabled:cursor-not-allowed`}
                title="Move Down"
            >
                <ChevronDownIcon className="w-4 h-4" />
            </button>
            </>
        )}
        <button
          onClick={() => onToggleMaximize(sectionKey)}
          className={`${controlButtonClasses} text-text-muted-themed hover:text-brand-secondary`}
          aria-label={isMaximized ? 'Restore section size' : 'Resize section to fit view'}
          title={isMaximized ? 'Restore Size' : 'Fit to View'}
        >
          <MaximizeIconComponent className="w-4 h-4" />
        </button>
        <button
          onClick={() => onTogglePin(sectionKey)}
          className={`${controlButtonClasses} ${isPinned ? 'text-brand-primary' : 'text-text-muted-themed hover:text-brand-primary'}`}
          aria-label={isPinned ? 'Unpin section' : 'Pin section'}
          title={isPinned ? 'Unpin' : 'Pin'}
        >
          <PinIconComponent className="w-4 h-4" />
        </button>
        <button
          onClick={() => onHide(sectionKey)}
          className={`${controlButtonClasses} text-text-muted-themed hover:text-expense`}
          aria-label={`Hide ${title} section`}
          title={`Hide`}
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
      {children}
    </div>
  );
};

export default HideableSection;
