


import React, { useState, useEffect, useCallback } from 'react';
import { MOTIVATIONAL_QUOTES } from '../constants';
import { RefreshCwIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';

const MotivationalQuote: React.FC = () => {
  const { currentThemeColors } = useTheme();
  const [quote, setQuote] = useState<string>('');

  const getRandomQuote = useCallback(() => {
    if (MOTIVATIONAL_QUOTES.length === 0) return "No quotes available.";
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return MOTIVATIONAL_QUOTES[randomIndex];
  }, []);

  useEffect(() => {
    setQuote(getRandomQuote());
  }, [getRandomQuote]);

  const handleRefreshQuote = () => {
    setQuote(getRandomQuote());
  };

  return (
    <div 
        className="flex items-center space-x-2 p-2.5 rounded-lg shadow-md h-auto min-h-[3rem] w-auto min-w-[190px] max-w-xs sm:max-w-sm md:max-w-md transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
        style={{ backgroundColor: currentThemeColors.bgAccent, color: currentThemeColors.textBase }}
    >
      <div className="flex-grow overflow-hidden">
        <p className="text-xs italic truncate text-center" style={{ color: currentThemeColors.textMuted }} title={quote}>
          "{quote}"
        </p>
      </div>
      <button 
        onClick={handleRefreshQuote} 
        className="p-1.5 rounded-lg hover:opacity-80 transition-all duration-200 ease-in-out flex-shrink-0 shadow-sm hover:shadow-md focus:outline-none focus:ring-1 focus:ring-brand-primary"
        style={{ color: currentThemeColors.textMuted, backgroundColor: `${currentThemeColors.bgSecondary}80`}} // 80 for some alpha
        aria-label="Refresh quote"
        title="Refresh quote"
      >
        <RefreshCwIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default MotivationalQuote;
