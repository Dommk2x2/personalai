

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from './Icons';

const ThemeToggleButton: React.FC = () => {
  const { theme, toggleThemeMode } = useTheme();

  return (
    <button
      onClick={toggleThemeMode}
      className="p-2 rounded-lg text-text-muted-themed hover:bg-bg-accent-themed focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 dark:focus:ring-offset-bg-secondary-themed transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
      aria-label={theme.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme.mode === 'dark' ? (
        <SunIcon className="w-6 h-6 text-yellow-400" />
      ) : (
        <MoonIcon className="w-6 h-6" /> 
      )}
    </button>
  );
};

export default ThemeToggleButton;
