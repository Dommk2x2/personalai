
import React from 'react';
import { LockClosedIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';

interface SessionTimerDisplayProps {
  timeLeft: number; // in seconds
  useDigitalFont: boolean;
}

const SessionTimerDisplay: React.FC<SessionTimerDisplayProps> = ({ timeLeft, useDigitalFont }) => {
  const { currentThemeColors } = useTheme();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const isCriticalTime = timeLeft <= 60; // Highlight if 1 minute or less remaining
  const displayColor = isCriticalTime ? currentThemeColors.expense : currentThemeColors.textMuted;
  const blinkClass = isCriticalTime && timeLeft <= 10 ? 'animate-blink' : ''; // Blink if 10 seconds or less
  const timerFontClass = useDigitalFont ? 'font-digital-7' : 'font-sans';

  return (
    <div 
      className={`flex items-center text-xs px-2 py-1 rounded-md shadow-sm ${blinkClass} ${timerFontClass}`}
      style={{ backgroundColor: currentThemeColors.bgAccent, color: displayColor }}
      title={`App locks in ${formatTime(timeLeft)}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <LockClosedIcon className="w-3 h-3 mr-1" style={{ color: displayColor }}/>
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
};

export default SessionTimerDisplay;
