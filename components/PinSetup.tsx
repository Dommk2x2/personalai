import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ShieldCheckIcon, LockClosedIcon, EditIcon, TrashIcon, SaveIcon, UserCircleIcon } from './Icons';
import { ToastType } from '../types'; // Import ToastType
import ProfilePicture from './ProfilePicture';
import ConfirmationModal from './ConfirmationModal';

interface PinSetupProps {
  currentPin: string | null;
  onPinSet: (newPin: string) => void;
  onPinRemoved: () => void;
  onPinChanged: (oldPin: string, newPin: string) => boolean; // Returns true on success
  addToast: (message: string, type: ToastType) => void;
  username?: string;
}

const PinSetup: React.FC<PinSetupProps> = ({ currentPin, onPinSet, onPinRemoved, onPinChanged, addToast, username = 'User' }) => {
  const { currentThemeColors } = useTheme();
  
  const [inputCurrentPin, setInputCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'set' | 'change' | 'remove'>(currentPin ? 'change' : 'set'); // Default mode
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  useEffect(() => {
    // Reset fields when mode changes or currentPin status changes
    setInputCurrentPin('');
    setNewPin('');
    setConfirmNewPin('');
    setError(null);
    setMode(currentPin ? 'change' : 'set'); // Default to 'change' if PIN exists, else 'set'
  }, [currentPin]);

  const handleNumericChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setter(value);
      setError(null);
    }
  };

  const validatePin = (pin: string): boolean => {
    if (!/^\d{4,6}$/.test(pin)) { // Basic validation: 4-6 digits
      setError("PIN must be 4 to 6 digits.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSetPin = () => {
    if (!validatePin(newPin)) return;
    if (newPin !== confirmNewPin) {
      setError("New PINs do not match.");
      return;
    }
    onPinSet(newPin);
    addToast("PIN set successfully!", "success");
    // State will reset due to useEffect on currentPin change
  };

  const handleChangePin = () => {
    if (inputCurrentPin !== String(currentPin)) {
      setError("Incorrect current PIN.");
      return;
    }
    if (!validatePin(newPin)) return;
    if (newPin !== confirmNewPin) {
      setError("New PINs do not match.");
      return;
    }
    const success = onPinChanged(inputCurrentPin, newPin);
    if (success) {
      addToast("PIN changed successfully!", "success");
    }
    // State will reset
  };

  const handleRemovePin = () => {
    if (inputCurrentPin !== String(currentPin)) {
      setError("Incorrect current PIN to remove.");
      return;
    }
    setIsRemoveModalOpen(true);
  };

  const confirmRemovePin = () => {
    setIsRemoveModalOpen(false);
    onPinRemoved();
    addToast("PIN removed successfully.", "info");
  };

  const inputBaseClasses = "mt-1 block w-full px-3 py-2.5 bg-bg-primary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-text-base-themed placeholder-text-muted-themed";
  const labelBaseClasses = "block text-sm font-medium text-text-muted-themed";
  const buttonBaseClasses = "w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-bg-secondary-themed transition-all duration-200 ease-in-out disabled:opacity-60";
  
  const renderSetMode = () => (
    <>
      <h3 className="text-md font-semibold mb-3" style={{ color: currentThemeColors.textBase }}>Set New PIN</h3>
      <div>
        <label htmlFor="new-pin" className={labelBaseClasses}>New PIN (4-6 digits)</label>
        <input 
          type="password" 
          id="new-pin" 
          value={newPin} 
          onChange={handleNumericChange(setNewPin)} 
          className={inputBaseClasses} 
          maxLength={6} 
          inputMode="numeric"
        />
      </div>
      <div>
        <label htmlFor="confirm-new-pin" className={labelBaseClasses}>Confirm New PIN</label>
        <input 
          type="password" 
          id="confirm-new-pin" 
          value={confirmNewPin} 
          onChange={handleNumericChange(setConfirmNewPin)} 
          className={inputBaseClasses} 
          maxLength={6} 
          inputMode="numeric"
        />
      </div>
      <button onClick={handleSetPin} className={`${buttonBaseClasses} text-text-inverted`} style={{ backgroundColor: currentThemeColors.brandPrimary }}>
        <LockClosedIcon className="w-5 h-5 mr-2"/> Set PIN
      </button>
    </>
  );

  const renderChangeRemoveMode = () => (
    <>
      <h3 className="text-md font-semibold mb-3" style={{ color: currentThemeColors.textBase }}>Manage Your PIN</h3>
      <div>
        <label htmlFor="current-pin" className={labelBaseClasses}>Current PIN</label>
        <input 
          type="password" 
          id="current-pin" 
          value={inputCurrentPin} 
          onChange={handleNumericChange(setInputCurrentPin)} 
          className={inputBaseClasses} 
          maxLength={6} 
          inputMode="numeric"
        />
      </div>
      
      <div className="my-4 border-t border-border-secondary pt-4">
          <h4 className="text-sm font-medium mb-2" style={{ color: currentThemeColors.textMuted }}>Change PIN:</h4>
          <div>
            <label htmlFor="change-new-pin" className={labelBaseClasses}>New PIN (4-6 digits)</label>
            <input 
              type="password" 
              id="change-new-pin" 
              value={newPin} 
              onChange={handleNumericChange(setNewPin)} 
              className={inputBaseClasses} 
              maxLength={6} 
              inputMode="numeric"
            />
          </div>
          <div className="mt-2">
            <label htmlFor="change-confirm-new-pin" className={labelBaseClasses}>Confirm New PIN</label>
            <input 
              type="password" 
              id="change-confirm-new-pin" 
              value={confirmNewPin} 
              onChange={handleNumericChange(setConfirmNewPin)} 
              className={inputBaseClasses} 
              maxLength={6} 
              inputMode="numeric"
            />
          </div>
          <button onClick={handleChangePin} className={`${buttonBaseClasses} mt-3 text-text-inverted`} style={{ backgroundColor: currentThemeColors.brandSecondary }}>
            <EditIcon className="w-5 h-5 mr-2"/> Change PIN
          </button>
      </div>

      <div className="my-4 border-t border-border-secondary pt-4">
          <h4 className="text-sm font-medium mb-2" style={{ color: currentThemeColors.textMuted }}>Remove PIN:</h4>
          <button onClick={handleRemovePin} className={`${buttonBaseClasses} text-text-inverted`} style={{ backgroundColor: currentThemeColors.expense }}>
            <TrashIcon className="w-5 h-5 mr-2"/> Remove PIN
          </button>
      </div>
    </>
  );


  return (
    <div className="p-4 sm:p-6 rounded-xl shadow-xl" style={{ backgroundColor: currentThemeColors.bgSecondary }}>
      <h2 className="text-xl sm:text-2xl font-semibold text-text-base-themed mb-6 text-center flex items-center justify-center">
        <ShieldCheckIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 text-brand-primary" />
        App Lock Settings
      </h2>

      <div className="max-w-md mx-auto space-y-6">
        <div className="flex flex-col items-center justify-center p-4 bg-bg-primary-themed/30 rounded-2xl border border-border-secondary">
          <div className="relative group">
            <ProfilePicture username={username} type="lockscreen" size="w-24 h-24 sm:w-32 h-32" className="ring-4 ring-brand-primary/20 hover:ring-brand-primary/40 transition-all shadow-2xl" />
            <div className="absolute -bottom-2 -right-2 bg-brand-primary text-white p-2 rounded-full shadow-lg pointer-events-none">
              <EditIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-lg font-black text-text-base-themed uppercase tracking-tight">{username}</h3>
            <p className="text-[10px] font-bold text-text-muted-themed uppercase tracking-widest mt-1">Tap image to change lock screen picture</p>
          </div>
        </div>

        {error && (
          <p className="text-xs text-center p-2 rounded-md" style={{ color: currentThemeColors.expense, backgroundColor: `${currentThemeColors.expense}2A` }} role="alert">
            {error}
          </p>
        )}

        {!currentPin ? renderSetMode() : renderChangeRemoveMode()}
        
        <p className="text-xs text-text-muted-themed mt-4 text-center">
            The App Lock PIN provides a basic layer of privacy and is stored locally in your browser.
            It is not a high-security feature.
        </p>
      </div>
      <ConfirmationModal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        onConfirm={confirmRemovePin}
        title="Remove App Lock PIN"
        message="Are you sure you want to remove the App Lock PIN? The app will no longer be locked."
        confirmText="Remove PIN"
        type="danger"
      />
    </div>
  );
};

export default PinSetup;