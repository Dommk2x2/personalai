
import React, { useState, useEffect } from 'react';
import { LockClosedIcon as SessionLockIcon, SaveIcon, KeyIcon, EyeIcon, EyeSlashIcon } from '../Icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ToastType, Role } from '../../types';

interface SessionSettingsProps {
  sessionTimeoutDurationSeconds: number;
  setSessionTimeoutDurationSeconds: (duration: number) => void;
  addToast: (message: string, type: ToastType) => void;
  loggedInRole: Role | null; // Added
  onChangeAdminPassword: (currentPasswordAttempt: string, newPasswordAttempt: string) => boolean; // Added
}

const SessionSettings: React.FC<SessionSettingsProps> = ({
  sessionTimeoutDurationSeconds, setSessionTimeoutDurationSeconds,
  addToast,
  loggedInRole, // Destructure new props
  onChangeAdminPassword
}) => {
  const { currentThemeColors } = useTheme();
  const [currentSessionTimeoutInput, setCurrentSessionTimeoutInput] = useState<string>(String(sessionTimeoutDurationSeconds));

  // State for Admin Password Change
  const [currentAdminPass, setCurrentAdminPass] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmNewAdminPass, setConfirmNewAdminPass] = useState('');
  const [showAdminPasswords, setShowAdminPasswords] = useState(false);
  const [adminPassError, setAdminPassError] = useState<string | null>(null);

  useEffect(() => { setCurrentSessionTimeoutInput(String(sessionTimeoutDurationSeconds)); }, [sessionTimeoutDurationSeconds]);

  const handleSaveSessionTimeout = () => {
    const duration = parseInt(currentSessionTimeoutInput, 10);
    if (!isNaN(duration) && duration >= 0) {
      setSessionTimeoutDurationSeconds(duration);
      addToast("Session timeout duration saved.", "success");
    } else {
      addToast("Invalid duration. Please enter a non-negative number.", "warning");
    }
  };
  
  const handleChangeAdminPasswordSubmit = () => {
    setAdminPassError(null);
    if (newAdminPass.length < 6) {
        setAdminPassError("New password must be at least 6 characters.");
        return;
    }
    if (newAdminPass !== confirmNewAdminPass) {
        setAdminPassError("New passwords do not match.");
        return;
    }
    const success = onChangeAdminPassword(currentAdminPass, newAdminPass);
    if (success) {
        setCurrentAdminPass('');
        setNewAdminPass('');
        setConfirmNewAdminPass('');
        setShowAdminPasswords(false);
        // Success toast is handled in App.tsx's onChangeAdminPassword
    } else {
        // Error toast is handled in App.tsx's onChangeAdminPassword,
        // but we can set a local error if needed, or rely on the toast.
        // For now, let's assume App.tsx handles all direct feedback for this action.
    }
  };


  const sessionTimeoutOptions = [
    { label: "Never (Disable Auto-Lock)", value: 0 },
    { label: "1 Minute", value: 60 },
    { label: "5 Minutes", value: 300 },
    { label: "15 Minutes", value: 900 },
    { label: "30 Minutes", value: 1800 },
    { label: "1 Hour", value: 3600 },
    { label: "2 Hours", value: 7200 },
  ];
  
  const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-bg-primary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-text-base-themed placeholder-text-muted-themed dark:[color-scheme:light]";
  const labelBaseClasses = "block text-sm font-medium text-text-muted-themed";
  const saveButtonClasses = "w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-text-inverted bg-brand-secondary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 dark:focus:ring-offset-bg-secondary-themed transition-all";

  return (
    <div className="space-y-6"> {/* Increased spacing between sections */}
      <div>
        <h4 className="text-md font-semibold mb-3 text-left flex items-center" style={{ color: currentThemeColors.textBase }}>
          <SessionLockIcon className="w-5 h-5 mr-2 text-brand-primary" /> Session Inactivity Timer
        </h4>
        <div>
          <label htmlFor="sessionTimeoutDuration" className={labelBaseClasses}>Auto-Lock After</label>
          <select
            id="sessionTimeoutDuration"
            value={currentSessionTimeoutInput}
            onChange={(e) => setCurrentSessionTimeoutInput(e.target.value)}
            className={`${inputBaseClasses} mb-3`}
            aria-label="Auto-lock inactivity timer"
          >
            {sessionTimeoutOptions.map(option => (
              <option key={option.value} value={option.value} className="text-text-base-themed bg-bg-secondary-themed">
                {option.label}
              </option>
            ))}
          </select>
          <button onClick={handleSaveSessionTimeout} className={saveButtonClasses}>
            <SaveIcon className="w-4 h-4 mr-2" /> Save Timer Setting
          </button>
        </div>
        <p className="text-xs text-text-muted-themed pt-2">
          This setting determines how long the app can be inactive before it automatically locks (if a PIN is set).
        </p>
      </div>

      {/* Admin Password Change Section - Conditionally Rendered */}
      {loggedInRole === Role.ADMIN && (
        <div className="pt-4 border-t border-border-secondary">
            <h4 className="text-md font-semibold mb-3 text-left flex items-center" style={{ color: currentThemeColors.textBase }}>
                <KeyIcon className="w-5 h-5 mr-2 text-brand-primary" /> Admin Account Security
            </h4>
            <div className="space-y-3">
                <div>
                    <label htmlFor="currentAdminPass" className={labelBaseClasses}>Current Admin Password</label>
                    <input type="password" id="currentAdminPass" value={currentAdminPass} onChange={e => setCurrentAdminPass(e.target.value)} className={inputBaseClasses} />
                </div>
                <div className="relative">
                    <label htmlFor="newAdminPass" className={labelBaseClasses}>New Admin Password (min. 6 chars)</label>
                    <input type={showAdminPasswords ? "text" : "password"} id="newAdminPass" value={newAdminPass} onChange={e => setNewAdminPass(e.target.value)} className={inputBaseClasses} />
                </div>
                <div className="relative">
                    <label htmlFor="confirmNewAdminPass" className={labelBaseClasses}>Confirm New Admin Password</label>
                    <input type={showAdminPasswords ? "text" : "password"} id="confirmNewAdminPass" value={confirmNewAdminPass} onChange={e => setConfirmNewAdminPass(e.target.value)} className={inputBaseClasses} />
                </div>
                 <button
                    type="button"
                    onClick={() => setShowAdminPasswords(!showAdminPasswords)}
                    className="text-xs flex items-center mt-1"
                    style={{ color: currentThemeColors.textLink }}
                >
                    {showAdminPasswords ? <EyeSlashIcon className="h-4 w-4 mr-1" /> : <EyeIcon className="h-4 w-4 mr-1" />}
                    {showAdminPasswords ? "Hide" : "Show"} Passwords
                </button>
                {adminPassError && <p className="text-xs mt-1" style={{color: currentThemeColors.expense}}>{adminPassError}</p>}
                <button onClick={handleChangeAdminPasswordSubmit} className={`${saveButtonClasses} bg-brand-primary mt-2`}>
                    <SaveIcon className="w-4 h-4 mr-2"/> Change Admin Password
                </button>
            </div>
            <p className="text-xs text-text-muted-themed pt-2">
                Changing the admin password updates the credential used for the 'admin' login.
            </p>
        </div>
      )}
    </div>
  );
};

export default SessionSettings;
