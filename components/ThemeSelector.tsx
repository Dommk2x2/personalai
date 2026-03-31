
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Squares2X2Icon, ChevronDownIcon, CheckCircleIcon } from './Icons';

const ThemeSelector: React.FC = () => {
  const { theme, selectTheme, availableThemes, currentThemeColors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleThemeChange = (themeName: string) => {
    selectTheme(themeName);
    setIsOpen(false);
  };

  const closePopover = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closePopover();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePopover();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, closePopover]);

  const buttonClasses = `p-2 rounded-lg text-text-muted-themed hover:bg-bg-accent-themed focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 dark:focus:ring-offset-bg-primary-themed transition-all duration-200 ease-in-out shadow-sm hover:shadow-md flex items-center`;

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
        style={{
          backgroundColor: currentThemeColors.bgSecondary,
          borderColor: currentThemeColors.borderPrimary,
          borderWidth: '1px',
          color: currentThemeColors.textMuted,
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select application theme"
        id="theme-selector-button"
      >
        <Squares2X2Icon className="w-5 h-5 mr-1.5" style={{ color: currentThemeColors.textBase }}/>
        <span className="hidden sm:inline text-sm font-medium" style={{color: currentThemeColors.textBase}}>Theme</span>
        <ChevronDownIcon className={`w-4 h-4 ml-1 sm:ml-1.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ color: currentThemeColors.textMuted }} />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute right-0 mt-2 w-60 origin-top-right rounded-lg shadow-xl z-50 overflow-hidden border"
          style={{
            backgroundColor: currentThemeColors.bgSecondary,
            borderColor: currentThemeColors.borderPrimary,
          }}
          role="listbox"
          aria-labelledby="theme-selector-button"
        >
          <ul className="max-h-72 overflow-y-auto">
            {availableThemes.map((themeOption) => (
              <li key={themeOption.name}>
                <button
                  onClick={() => handleThemeChange(themeOption.name)}
                  className="w-full text-left px-3 py-2.5 text-sm flex items-center justify-between transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-inset"
                  style={{
                    color: theme.name === themeOption.name ? currentThemeColors.brandPrimary : currentThemeColors.textBase,
                    backgroundColor: theme.name === themeOption.name ? currentThemeColors.bgAccent : 'transparent',
                    //@ts-ignore
                    '--focus-ring-color': currentThemeColors.brandPrimary,
                  }}
                  onMouseEnter={(e) => { if (theme.name !== themeOption.name) e.currentTarget.style.backgroundColor = currentThemeColors.bgAccent+'BF'; }}
                  onMouseLeave={(e) => { if (theme.name !== themeOption.name) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  role="option"
                  aria-selected={theme.name === themeOption.name}
                >
                  <div className="flex items-center">
                    <div className="flex mr-2.5 h-4 w-9 rounded-sm overflow-hidden border" style={{borderColor: currentThemeColors.borderSecondary}}> {/* Container for the color strip */}
                        <span 
                            className="block w-3 h-full" 
                            style={{ backgroundColor: themeOption.light.brandPrimary }}
                            title={`Primary: ${themeOption.light.brandPrimary}`}
                        ></span>
                        <span 
                            className="block w-3 h-full" 
                            style={{ backgroundColor: themeOption.light.brandSecondary }}
                            title={`Secondary: ${themeOption.light.brandSecondary}`}
                        ></span>
                        <span 
                            className="block w-3 h-full" 
                            style={{ backgroundColor: themeOption.light.bgAccent }}
                            title={`Accent BG: ${themeOption.light.bgAccent}`}
                        ></span>
                    </div>
                    {themeOption.name}
                  </div>
                  {theme.name === themeOption.name && (
                    <CheckCircleIcon className="w-4 h-4 text-brand-primary" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
