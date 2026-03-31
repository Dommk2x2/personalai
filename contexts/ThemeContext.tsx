
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { LOCAL_STORAGE_THEME_KEY } from '../constants';
import { themes, DEFAULT_THEME_NAME, ThemeDefinition, ColorPalette } from '../themes'; // Import themes
// FIX: Import AppTheme and ThemeMode from types.ts to break circular dependency
import type { AppTheme, ThemeMode } from '../types';

// FIX: Re-export types so other files don't need to change their imports
export type { AppTheme, ThemeMode };

interface ThemeContextType {
  theme: AppTheme;
  toggleThemeMode: () => ThemeMode; // Updated signature
  selectTheme: (themeName: string) => void;
  availableThemes: ThemeDefinition[];
  currentThemeColors: ColorPalette;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<AppTheme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedThemeValue = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
        if (storedThemeValue) {
          const parsedTheme = JSON.parse(storedThemeValue) as AppTheme;
          // Validate parsed theme by finding a theme definition with a matching display name
          const themeDefinitionFound = Object.values(themes).find(td => td.name === parsedTheme.name);
          if (parsedTheme && themeDefinitionFound && (parsedTheme.mode === 'light' || parsedTheme.mode === 'dark')) {
            return parsedTheme;
          }
        }
      } catch (error) {
        console.error("Error reading theme from localStorage:", error);
      }
    }
    // Default theme name should be the display name from the default theme definition
    return { name: themes[DEFAULT_THEME_NAME].name, mode: 'light' }; 
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Find theme definition by display name stored in theme.name
    const themeDefToApply = Object.values(themes).find(td => td.name === theme.name) || themes[DEFAULT_THEME_NAME];
    const currentColors = themeDefToApply[theme.mode];

    // Apply CSS variables
    Object.entries(currentColors).forEach(([key, value]) => {
      if (typeof value === 'string') { 
         const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
         root.style.setProperty(cssVarName, value);
      }
    });
    
    // Apply custom overrides from localStorage if they exist
    const customBrandColor = localStorage.getItem('financeTrackerCustomBrandColor');
    if (customBrandColor && customBrandColor !== 'null') {
      root.style.setProperty('--color-brand-primary', customBrandColor.replace(/"/g, ''));
    }

    const customBgColor = localStorage.getItem('financeTrackerCustomBgColor');
    if (customBgColor && customBgColor !== 'null') {
      root.style.setProperty('--color-bg-primary', customBgColor.replace(/"/g, ''));
    }

    if (theme.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, JSON.stringify(theme));
  }, [theme]);


  const toggleThemeMode = useCallback(() => {
    let newModeValue: ThemeMode = 'light';
    setTheme(prevTheme => {
      newModeValue = prevTheme.mode === 'light' ? 'dark' : 'light';
      return {
        ...prevTheme,
        mode: newModeValue
      };
    });
    return newModeValue; // Return the new mode
  }, []);

  const selectTheme = useCallback((themeDisplayName: string) => {
    // Check if a theme with the given display name exists
    const themeDefinitionExists = Object.values(themes).find(td => td.name === themeDisplayName);
    if (themeDefinitionExists) {
      setTheme(prevTheme => ({
        ...prevTheme, 
        name: themeDisplayName
      }));
    } else {
      console.warn(`Theme "${themeDisplayName}" not found. Defaulting to ${themes[DEFAULT_THEME_NAME].name}.`);
      setTheme(prevTheme => ({
        ...prevTheme,
        name: themes[DEFAULT_THEME_NAME].name // Set to default theme's display name
      }));
    }
  }, []);
  
  // Deriving currentThemeColors based on theme.name (display name)
  const currentThemeDefinition = Object.values(themes).find(td => td.name === theme.name) || themes[DEFAULT_THEME_NAME];
  const currentThemeColorsPalette = currentThemeDefinition[theme.mode];
  const availableThemesList = Object.values(themes);

  return (
    <ThemeContext.Provider value={{ theme, toggleThemeMode, selectTheme, availableThemes: availableThemesList, currentThemeColors: currentThemeColorsPalette }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};