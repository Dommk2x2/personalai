// FIX: Import from types.ts to break circular dependency
import { ThemeMode } from './types';

export interface ColorPalette {
  brandPrimary: string;
  brandSecondary: string;
  income: string;
  expense: string;
  
  textBase: string;
  textMuted: string;
  textDisabled: string;
  textInverted: string; // For text on primary/secondary backgrounds
  textLink: string;

  bgPrimary: string; // Main page background
  bgSecondary: string; // Card backgrounds, component backgrounds
  bgAccent: string; // Hover states, active states, subtle backgrounds
  bgDisabled: string;

  borderPrimary: string;
  borderSecondary: string; // Lighter/subtler borders
  borderFocus: string;

  // Chart specific colors (can be same as brand/income/expense or specific)
  chartIncome: string;
  chartExpense: string;
  chartAxisColor: string;
  chartGridColor: string;
  chartTooltipBg: string;
  chartTooltipText: string;
  chartLegendText: string;

  // Category Pill specific colors - a list of accent colors
  categoryPillAccents: string[];
}

export interface ThemeDefinition {
  name: string;
  light: ColorPalette;
  dark: ColorPalette;
}

export const themes: Record<string, ThemeDefinition> = {
  defaultIndigo: {
    name: "Modern Light",
    light: {
      brandPrimary: '#396cf0', 
      brandSecondary: '#25b9c5', 
      income: '#25b9c5',
      expense: '#f50057', 

      textBase: '#263238',
      textMuted: '#546e7a',
      textDisabled: '#90a4ae',
      textInverted: '#ffffff',
      textLink: '#396cf0',

      bgPrimary: '#f8faff', 
      bgSecondary: '#ffffff', 
      bgAccent: '#eef2ff', 
      bgDisabled: '#f1f5f9',

      borderPrimary: '#e2e8f0',
      borderSecondary: '#f1f5f9',
      borderFocus: '#396cf0',

      chartIncome: '#25b9c5',
      chartExpense: '#f50057',
      chartAxisColor: '#546e7a',
      chartGridColor: '#e2e8f0',
      chartTooltipBg: '#ffffff',
      chartTooltipText: '#263238',
      chartLegendText: '#263238',
      categoryPillAccents: ['#E364B5', '#25A9C5', '#F5B841', '#4BC0C0', '#9966FF', '#FF9F40'],
    },
    dark: {
      brandPrimary: '#5a8aff', 
      brandSecondary: '#4dd1e1', 
      income: '#4dd1e1',
      expense: '#ff4081', 

      textBase: '#e2e8f0', 
      textMuted: '#94a3b8', 
      textDisabled: '#475569',
      textInverted: '#ffffff',
      textLink: '#5a8aff',

      bgPrimary: '#1e293b', 
      bgSecondary: '#334155', 
      bgAccent: '#475569', 
      bgDisabled: '#334155',

      borderPrimary: '#475569', 
      borderSecondary: '#334155',
      borderFocus: '#5a8aff',
      
      chartIncome: '#4dd1e1',
      chartExpense: '#ff4081',
      chartAxisColor: '#94a3b8',
      chartGridColor: 'rgba(148, 163, 184, 0.2)',
      chartTooltipBg: '#334155',
      chartTooltipText: '#e2e8f0',
      chartLegendText: '#e2e8f0',
      categoryPillAccents: ['#F279D2', '#76D6F9', '#F5B841', '#4BC0C0', '#A076F9', '#FF9F40'],
    }
  },
  forestGreen: {
    name: "Forest Green",
    light: {
      brandPrimary: '#15803d', // Green 700
      brandSecondary: '#ca8a04', // Amber 600
      income: '#22c55e', // Green 500
      expense: '#dc2626', // Red 600

      textBase: '#1f2937',
      textMuted: '#4b5563',
      textDisabled: '#9ca3af',
      textInverted: '#FFFFFF',
      textLink: '#15803d',

      bgPrimary: '#f0fdf4', // Green 50
      bgSecondary: '#FFFFFF',
      bgAccent: '#dcfce7', // Green 100
      bgDisabled: '#f3f4f6',

      borderPrimary: '#bbf7d0', // Green 200
      borderSecondary: '#d1d5db',
      borderFocus: '#15803d',

      chartIncome: '#22c55e',
      chartExpense: '#dc2626',
      chartAxisColor: '#4b5563',
      chartGridColor: '#dcfce7',
      chartTooltipBg: '#FFFFFF',
      chartTooltipText: '#1f2937',
      chartLegendText: '#14532d', // Green 900
      categoryPillAccents: ['#FF8A80', '#8C9EFF', '#FFEA00', '#00E5FF', '#D500F9', '#FF9100'],
    },
    dark: {
      brandPrimary: '#22c55e', // Green 500
      brandSecondary: '#f59e0b', // Amber 500
      income: '#4ade80', // Green 400
      expense: '#ef4444', // Red 500

      textBase: '#dcfce7', // Green 100
      textMuted: '#86efac', // Green 300
      textDisabled: '#4ade80', // Green 400
      textInverted: '#052e16', // Green 950
      textLink: '#4ade80',

      bgPrimary: '#052e16', // Green 950
      bgSecondary: '#064e3b', // Green 900
      bgAccent: '#047857', // Green 800
      bgDisabled: '#14532d', // Green 900

      borderPrimary: '#14532d', // Green 900
      borderSecondary: '#064e3b',
      borderFocus: '#22c55e',

      chartIncome: '#4ade80',
      chartExpense: '#ef4444',
      chartAxisColor: '#86efac',
      chartGridColor: '#064e3b',
      chartTooltipBg: '#064e3b',
      chartTooltipText: '#dcfce7',
      chartLegendText: '#bbf7d0', // Green 200
      categoryPillAccents: ['#FFCDD2', '#C5CAE9', '#FFF9C4', '#B2EBF2', '#E1BEE7', '#FFCCBC'],
    }
  },
  oceanBlue: {
    name: "Ocean Blue",
    light: {
      brandPrimary: '#0284c7', // Sky 600
      brandSecondary: '#f97316', // Orange 500
      income: '#0ea5e9', // Sky 500
      expense: '#f43f5e', // Rose 500

      textBase: '#1e293b', // Slate 800
      textMuted: '#64748b', // Slate 500
      textDisabled: '#94a3b8', // Slate 400
      textInverted: '#FFFFFF',
      textLink: '#0284c7',

      bgPrimary: '#f0f9ff', // Sky 50
      bgSecondary: '#FFFFFF',
      bgAccent: '#e0f2fe', // Sky 100
      bgDisabled: '#f1f5f9', // Slate 100

      borderPrimary: '#bae6fd', // Sky 200
      borderSecondary: '#e2e8f0', // Slate 200
      borderFocus: '#0284c7',

      chartIncome: '#0ea5e9',
      chartExpense: '#f43f5e',
      chartAxisColor: '#64748b',
      chartGridColor: '#e0f2fe',
      chartTooltipBg: '#FFFFFF',
      chartTooltipText: '#1e293b',
      chartLegendText: '#0c4a6e', // Sky 900
      categoryPillAccents: ['#FF80AB', '#82B1FF', '#FFEB3B', '#00BCD4', '#CE93D8', '#FFB74D'],
    },
    dark: {
      brandPrimary: '#38bdf8', // Sky 400
      brandSecondary: '#fb923c', // Orange 400
      income: '#7dd3fc', // Sky 300
      expense: '#fb7185', // Rose 400

      textBase: '#e0f2fe', // Sky 100
      textMuted: '#7dd3fc', // Sky 300
      textDisabled: '#38bdf8', // Sky 400
      textInverted: '#082f49', // Sky 950
      textLink: '#7dd3fc',

      bgPrimary: '#082f49', // Sky 950
      bgSecondary: '#075985', // Sky 800
      bgAccent: '#0369a1', // Sky 700
      bgDisabled: '#0c4a6e', // Sky 900

      borderPrimary: '#0c4a6e', // Sky 900
      borderSecondary: '#075985',
      borderFocus: '#38bdf8',

      chartIncome: '#7dd3fc',
      chartExpense: '#fb7185',
      chartAxisColor: '#7dd3fc',
      chartGridColor: '#075985',
      chartTooltipBg: '#075985',
      chartTooltipText: '#e0f2fe',
      chartLegendText: '#bae6fd', // Sky 200
      categoryPillAccents: ['#F8BBD0', '#BBDEFB', '#FFF59D', '#80DEEA', '#E1BEE7', '#FFCC80'],
    }
  },
  sunsetOrange: {
    name: "Sunset Orange",
    light: {
      brandPrimary: '#f97316', // Orange 500
      brandSecondary: '#7c3aed', // Violet 600
      income: '#fb923c', // Orange 400
      expense: '#e11d48', // Rose 600

      textBase: '#334155', // Slate 700
      textMuted: '#64748b', // Slate 500
      textDisabled: '#94a3b8', // Slate 400
      textInverted: '#FFFFFF',
      textLink: '#f97316',

      bgPrimary: '#fff7ed', // Orange 50
      bgSecondary: '#FFFFFF',
      bgAccent: '#ffedd5', // Orange 100
      bgDisabled: '#f1f5f9', // Slate 100

      borderPrimary: '#fed7aa', // Orange 200
      borderSecondary: '#e2e8f0', // Slate 200
      borderFocus: '#f97316',

      chartIncome: '#fb923c',
      chartExpense: '#e11d48',
      chartAxisColor: '#64748b',
      chartGridColor: '#ffedd5',
      chartTooltipBg: '#FFFFFF',
      chartTooltipText: '#334155',
      chartLegendText: '#7c2d12', // Orange 900
      categoryPillAccents: ['#C51162', '#304FFE', '#FFD600', '#00B8D4', '#AA00FF', '#FF6D00'],
    },
    dark: {
      brandPrimary: '#fb923c', // Orange 400
      brandSecondary: '#a78bfa', // Violet 400
      income: '#fdba74', // Orange 300
      expense: '#f472b6', // Rose 400

      textBase: '#ffedd5', // Orange 100
      textMuted: '#fdba74', // Orange 300
      textDisabled: '#fb923c', // Orange 400
      textInverted: '#431407', // Orange 950
      textLink: '#fdba74',

      bgPrimary: '#431407', // Orange 950
      bgSecondary: '#7c2d12', // Orange 900
      bgAccent: '#9a3412', // Orange 800
      bgDisabled: '#7c2d12', // Orange 900

      borderPrimary: '#7c2d12', // Orange 900
      borderSecondary: '#9a3412',
      borderFocus: '#fb923c',

      chartIncome: '#fdba74',
      chartExpense: '#f472b6',
      chartAxisColor: '#fdba74',
      chartGridColor: '#7c2d12',
      chartTooltipBg: '#7c2d12',
      chartTooltipText: '#ffedd5',
      chartLegendText: '#fed7aa', // Orange 200
      categoryPillAccents: ['#F06292', '#7986CB', '#FFF176', '#4DD0E1', '#BA68C8', '#FF8A65'],
    }
  },
  cyberpunk: {
    name: "Cyberpunk",
    light: { // Keeping light mode as a fallback, but dark is the focus
      brandPrimary: '#8b5cf6',
      brandSecondary: '#06b6d4',
      income: '#22c55e',
      expense: '#ef4444',
      
      textBase: '#111827',
      textMuted: '#4b5563',
      textDisabled: '#9ca3af',
      textInverted: '#FFFFFF',
      textLink: '#8b5cf6',

      bgPrimary: '#f3f4f6',
      bgSecondary: '#FFFFFF',
      bgAccent: '#eef2ff',
      bgDisabled: '#f3f4f6',

      borderPrimary: '#d1d5db',
      borderSecondary: '#e5e7eb',
      borderFocus: '#8b5cf6',

      chartIncome: '#22c55e',
      chartExpense: '#ef4444',
      chartAxisColor: '#6b7280',
      chartGridColor: '#e5e7eb',
      chartTooltipBg: '#FFFFFF',
      chartTooltipText: '#1f2937',
      chartLegendText: '#374151',
      categoryPillAccents: ['#f472b6', '#38bdf8', '#fbbf24', '#34d399', '#a78bfa', '#fb923c'],
    },
    dark: {
      brandPrimary: '#a78bfa', // Brighter Purple
      brandSecondary: '#22d3ee', // Brighter Cyan
      income: '#4ade80', // Vibrant Green
      expense: '#f472b6', // Vibrant Pink
      
      textBase: '#e5e7eb',
      textMuted: '#9ca3af',
      textDisabled: '#4b5563',
      textInverted: '#000000',
      textLink: '#a78bfa',

      bgPrimary: '#0d0c1b', // Very dark blue/purple
      bgSecondary: '#1c1a2e', // Slightly lighter card background
      bgAccent: '#2a2744', // Hover states
      bgDisabled: '#374151',

      borderPrimary: 'rgba(167, 139, 250, 0.2)', // Purple transparent border
      borderSecondary: 'rgba(167, 139, 250, 0.1)',
      borderFocus: '#a78bfa',

      chartIncome: '#4ade80',
      chartExpense: '#f472b6',
      chartAxisColor: '#9ca3af',
      chartGridColor: 'rgba(167, 139, 250, 0.1)',
      chartTooltipBg: '#1c1a2e',
      chartTooltipText: '#e5e7eb',
      chartLegendText: '#d1d5db',
      categoryPillAccents: ['#f472b6', '#38bdf8', '#fbbf24', '#34d399', '#a78bfa', '#fb923c'],
    }
  },
};

export const DEFAULT_THEME_NAME = 'defaultIndigo';

export function getThemePalette(themeName: string, mode: ThemeMode): ColorPalette {
  const themeDefinition = themes[themeName] || themes[DEFAULT_THEME_NAME];
  return themeDefinition[mode];
}