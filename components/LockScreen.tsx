import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { LockClosedIcon, UserCircleIcon, KeyIcon } from './Icons';
import useLocalStorage from '../hooks/useLocalStorage';
import { LOCAL_STORAGE_LOCK_SCREEN_PICTURE_KEY } from '../constants';

interface LockScreenProps {
  onUnlock: (pin: string) => boolean; // Returns true if unlock successful
  onRecover?: (password: string) => boolean; // For recovery
  appTitle: string;
  username: string;
  timeLeft?: number;
  isRunning?: boolean;
  timerTitle?: string;
}

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock, onRecover, appTitle, username, timeLeft, isRunning, timerTitle }) => {
  const { currentThemeColors } = useTheme();
  const [enteredPin, setEnteredPin] = useState('');
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const storageKey = `${LOCAL_STORAGE_LOCK_SCREEN_PICTURE_KEY}_${username}`;
  const [profilePicture] = useLocalStorage<string | null>(storageKey, null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId); // Cleanup on unmount
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });


  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPin = e.target.value;
    if (/^\d*$/.test(newPin) && newPin.length <= 6) {
      setEnteredPin(newPin);
    }
  };

  useEffect(() => {
    if (enteredPin.length >= 4 && enteredPin.length <= 6) {
      setIsProcessing(true);
      const success = onUnlock(enteredPin);
      if (!success) {
        setError('Incorrect PIN. Please try again.');
      } else {
        setError(null);
      }
      setIsProcessing(false);
    } else {
      setError(null);
    }
  }, [enteredPin, onUnlock]);

  const renderLockScreenProfile = () => {
    if (!profilePicture) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-bg-primary-themed/20 rounded-full">
          <UserCircleIcon className="w-16 h-16 text-text-disabled" />
        </div>
      );
    }

    if (profilePicture.startsWith('emoji:')) {
      const emoji = profilePicture.split(':')[1];
      return (
        <div className="w-full h-full flex items-center justify-center bg-bg-primary-themed rounded-full text-5xl shadow-lg border-4" style={{ borderColor: currentThemeColors.bgAccent }}>
          {emoji}
        </div>
      );
    }

    if (profilePicture.startsWith('initials:')) {
      const parts = profilePicture.split(':');
      const text = parts[1];
      const color = parts[2] || '#3b82f6';
      return (
        <div 
          className="w-full h-full flex items-center justify-center font-black text-white rounded-full text-3xl shadow-lg border-4" 
          style={{ backgroundColor: color, borderColor: currentThemeColors.bgAccent }}
        >
          {text}
        </div>
      );
    }

    return <img src={profilePicture} alt="Profile" className="rounded-full w-full h-full object-cover shadow-lg border-4" style={{ borderColor: currentThemeColors.bgAccent }} />;
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onRecover) return;
    
    setIsProcessing(true);
    const success = onRecover(recoveryPassword);
    if (!success) {
      setError('Invalid recovery password.');
    } else {
      setError(null);
    }
    setIsProcessing(false);
  };

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out animate-modal-enter"
      style={{ backgroundColor: currentThemeColors.bgPrimary }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lock-screen-title"
    >
      <div 
        className="w-full max-w-xs sm:max-w-sm p-6 sm:p-8 rounded-xl shadow-2xl text-center"
        style={{ backgroundColor: currentThemeColors.bgSecondary }}
      >
        <div className="mx-auto mb-4 w-24 h-24">
          {renderLockScreenProfile()}
        </div>

        <p className="text-5xl font-light mb-4" style={{ color: currentThemeColors.textBase }}>
            {formattedTime}
        </p>

        {isRunning && timeLeft !== undefined && (
            <div className="mb-6 p-4 rounded-lg bg-bg-accent-themed border border-border-primary">
                <p className="text-xs font-black uppercase tracking-widest text-text-muted-themed mb-1">{timerTitle || 'Timer'}</p>
                <p className="text-3xl font-black" style={{ color: currentThemeColors.brandSecondary }}>
                    {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{ (timeLeft % 60).toString().padStart(2, '0')}
                </p>
            </div>
        )}

        <div className="flex items-center justify-center gap-2 mb-2">
            <LockClosedIcon className="w-5 h-5 text-text-muted-themed" />
            <h2 id="lock-screen-title" className="text-xl sm:text-2xl font-semibold" style={{ color: currentThemeColors.textBase }}>
                {appTitle} Locked
            </h2>
        </div>
        <p className="text-sm text-text-muted-themed mb-6">
          {isRecoveryMode ? 'Enter recovery password to unlock.' : 'Enter your PIN to unlock.'}
        </p>

        <div className="space-y-4">
          {!isRecoveryMode ? (
            <div>
              <label htmlFor="pin-input" className="sr-only">Enter PIN</label>
              <input
                type="password"
                id="pin-input"
                value={enteredPin}
                onChange={handlePinChange}
                className={`block w-full px-4 py-3 text-center bg-bg-primary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary sm:text-lg text-text-base-themed placeholder-text-muted-themed tracking-[0.3em] ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
                placeholder="••••"
                maxLength={6} 
                autoFocus
                aria-describedby={error ? "pin-error" : undefined}
                disabled={isProcessing}
                aria-busy={isProcessing}
                inputMode="numeric"
              />
            </div>
          ) : (
            <form onSubmit={handleRecovery} className="space-y-4">
              <input
                type="password"
                value={recoveryPassword}
                onChange={(e) => setRecoveryPassword(e.target.value)}
                className="block w-full px-4 py-3 text-center bg-bg-primary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-text-base-themed"
                placeholder="Recovery Password"
                autoFocus
                disabled={isProcessing}
              />
              <button
                type="submit"
                className="w-full py-2 bg-brand-primary text-white rounded-lg font-bold hover:bg-brand-primary/90 transition-all"
                disabled={isProcessing}
              >
                Unlock with Recovery
              </button>
            </form>
          )}

          {error && (
            <p id="pin-error" className="text-xs text-center" style={{ color: currentThemeColors.expense }} role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {onRecover && (
            <button
              onClick={() => { setIsRecoveryMode(!isRecoveryMode); setError(null); }}
              className="text-xs font-bold uppercase tracking-widest text-brand-primary hover:underline"
            >
              {isRecoveryMode ? 'Back to PIN' : 'Forgot PIN?'}
            </button>
          )}
          <p className="text-[10px] text-text-muted-themed">
              PIN is stored locally. If forgotten, clearing browser data for this site might be necessary, which could also clear your financial data if not backed up.
          </p>
        </div>
      </div>
       <style>{`
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal-enter {
          animation: modalEnter 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default LockScreen;