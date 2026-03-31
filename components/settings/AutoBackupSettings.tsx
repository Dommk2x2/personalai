
import React, { useState, useEffect } from 'react';
import { DatabaseIcon, SaveIcon } from '../Icons';
import { useTheme } from '../../contexts/ThemeContext';
import { AutoBackupSettings as AutoBackupSettingsType, ToastType } from '../../types';
import { formatTimestamp } from '../../utils/dateUtils';

interface AutoBackupSettingsProps {
  autoBackupSettings: AutoBackupSettingsType;
  setAutoBackupSettings: (settings: AutoBackupSettingsType) => void;
  lastBackupTimestamp: number | null;
  onBackupNow: () => void;
  addToast: (message: string, type: ToastType) => void;
}

const AutoBackupSettings: React.FC<AutoBackupSettingsProps> = ({
  autoBackupSettings,
  setAutoBackupSettings,
  lastBackupTimestamp,
  onBackupNow,
  addToast
}) => {
  const { currentThemeColors } = useTheme();
  const [localSettings, setLocalSettings] = useState<AutoBackupSettingsType>(autoBackupSettings);

  useEffect(() => {
    setLocalSettings(autoBackupSettings);
  }, [autoBackupSettings]);

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSettings(prev => ({ ...prev, enabled: e.target.checked }));
  };

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalSettings(prev => ({ ...prev, frequency: e.target.value as AutoBackupSettingsType['frequency'] }));
  };

  const handleSave = () => {
    setAutoBackupSettings(localSettings);
    addToast('Auto backup settings saved.', 'success');
  };

  const lastBackupText = lastBackupTimestamp
    ? `Last backup: ${formatTimestamp(lastBackupTimestamp)}`
    : 'No backup has been made yet.';

  const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-bg-primary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-text-base-themed placeholder-text-muted-themed";
  const labelBaseClasses = "block text-sm font-medium text-text-muted-themed";
  const saveButtonClasses = "w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-text-inverted bg-brand-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 dark:focus:ring-offset-bg-secondary-themed transition-all";

  return (
    <div className="space-y-6">
      <h4 className="text-md font-semibold mb-3 text-left flex items-center" style={{ color: currentThemeColors.textBase }}>
        <DatabaseIcon className="w-5 h-5 mr-2 text-brand-primary" /> Auto Backup Settings
      </h4>
      <div className="p-3 rounded-lg" style={{backgroundColor: currentThemeColors.bgAccent+'33'}}>
        <p className="text-sm text-text-muted-themed">
          This feature helps you remember to back up your data. It will display a non-intrusive reminder on the main screen if a backup hasn't been performed within your selected frequency.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <label htmlFor="autoBackupToggle" className={labelBaseClasses}>Enable Backup Reminders</label>
        <div className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="autoBackupToggle"
            className="sr-only peer"
            checked={localSettings.enabled}
            onChange={handleToggle}
          />
          <div
            className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
            style={localSettings.enabled ? { backgroundColor: currentThemeColors.brandPrimary } : {}}
          ></div>
        </div>
      </div>
      
      {localSettings.enabled && (
        <div>
          <label htmlFor="backupFrequency" className={labelBaseClasses}>Reminder Frequency</label>
          <select
            id="backupFrequency"
            value={localSettings.frequency}
            onChange={handleFrequencyChange}
            className={inputBaseClasses}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      )}
      
      <div className="pt-4 border-t border-border-secondary space-y-3">
        <button onClick={handleSave} className={saveButtonClasses}>
          <SaveIcon className="w-4 h-4 mr-2" /> Save Settings
        </button>
        <div className="text-center">
            <p className="text-xs text-text-muted-themed">{lastBackupText}</p>
            <button
                onClick={onBackupNow}
                className="mt-2 text-sm font-medium"
                style={{ color: currentThemeColors.brandSecondary }}
            >
                Create a backup now
            </button>
        </div>
      </div>
    </div>
  );
};

export default AutoBackupSettings;
