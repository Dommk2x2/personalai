import React, { useState, useMemo, useEffect } from 'react';
import { Account, SectionKey, MenuGroupKey, AccountSpecificSettingsData, Role, AppMode } from '../types';
import { CONFIGURABLE_MENU_GROUPS, CONFIGURABLE_USER_FEATURES } from '../constants';
import { SlidersHorizontalIcon, EyeIcon, EyeSlashIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import AccountSelector from './AccountSelector';

interface AccountSpecificSettingsProps {
  accounts: Account[]; // All non-deleted accounts for the current user
  accountSettings: Record<string, Partial<AccountSpecificSettingsData>>;
  onUpdateSettings: (accountId: string, newSettings: Partial<AccountSpecificSettingsData>) => void;
  addToast: (message: string, type: 'info' | 'success' | 'warning') => void;
}

const AccountSpecificSettings: React.FC<AccountSpecificSettingsProps> = ({
  accounts,
  accountSettings,
  onUpdateSettings,
  addToast,
}) => {
  const { currentThemeColors } = useTheme();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(accounts[0]?.id || null);

  const configurableAppModes = [
    { key: AppMode.FINANCE, label: 'Finance' },
    { key: AppMode.ATTENDANCE, label: 'Attendance' },
    { key: AppMode.EMI, label: 'EMI Tools' },
    { key: AppMode.TODO, label: 'Planner' },
    { key: AppMode.REPORTS, label: 'Reports' },
  ];

  const handleToggleAppMode = (modeKey: AppMode, isEnabled: boolean) => {
    if (!selectedAccountId) return;

    // Default to all modes being enabled if no setting exists
    const allModeKeys = configurableAppModes.map(m => m.key);
    const currentModes = accountSettings[selectedAccountId]?.enabledAppModes ?? allModeKeys;

    let newModes: AppMode[];
    if (isEnabled) {
      newModes = [...currentModes, modeKey];
    } else {
      newModes = currentModes.filter(key => key !== modeKey);
    }

    onUpdateSettings(selectedAccountId, { ...accountSettings[selectedAccountId], enabledAppModes: [...new Set(newModes)] });
    addToast('Settings updated for this account.', 'info');
  };

  const handleToggleFeature = (featureKey: SectionKey, isEnabled: boolean) => {
    if (!selectedAccountId) return;
    
    // If settings for this account don't exist yet, initialize them from defaults before making a change.
    const allFeatureKeys = CONFIGURABLE_USER_FEATURES.map(f => f.key as SectionKey);
    const currentFeatures = accountSettings[selectedAccountId]?.enabledFeatures ?? allFeatureKeys;
    
    let newFeatures: SectionKey[];
    if (isEnabled) {
      newFeatures = [...currentFeatures, featureKey];
    } else {
      newFeatures = currentFeatures.filter(key => key !== featureKey);
    }
    
    onUpdateSettings(selectedAccountId, { ...accountSettings[selectedAccountId], enabledFeatures: [...new Set(newFeatures)] });
    addToast('Settings updated for this account.', 'info');
  };
  
  const handleToggleGroup = (groupKey: MenuGroupKey, isEnabled: boolean) => {
    if (!selectedAccountId) return;

    const allGroupKeys = CONFIGURABLE_MENU_GROUPS.map(g => g.key);
    const currentGroups = accountSettings[selectedAccountId]?.enabledMenuGroups ?? allGroupKeys;

    let newGroups: MenuGroupKey[];
    if (isEnabled) {
        newGroups = [...currentGroups, groupKey];
    } else {
        newGroups = currentGroups.filter(key => key !== groupKey);
    }

    onUpdateSettings(selectedAccountId, { ...accountSettings[selectedAccountId], enabledMenuGroups: [...new Set(newGroups)] });
    addToast('Settings updated for this account.', 'info');
  };

  const handleResetSettings = () => {
    if (!selectedAccountId) return;
    if (window.confirm(`Are you sure you want to reset all view settings for account "${(accounts || []).find(a => a.id === selectedAccountId)?.name}" to their default state?`)) {
        const { [selectedAccountId]: _, ...rest } = accountSettings;
        onUpdateSettings(selectedAccountId, {}); // Effectively removes the specific settings
        addToast('Settings for this account have been reset to default.', 'success');
    }
  };


  const renderToggleSwitch = (
    id: string, 
    checked: boolean, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    label: string
  ) => (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" id={id} className="sr-only peer" checked={checked} onChange={onChange} aria-label={`Toggle ${label}`} />
      <div 
        className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
        style={{
            backgroundColor: checked ? currentThemeColors.brandPrimary : undefined,
            '--focus-ring-color': currentThemeColors.brandPrimary,
        } as React.CSSProperties}
      ></div>
      <span className="sr-only">Toggle {label}</span>
    </label>
  );

  const accountHasSettings = selectedAccountId && accountSettings[selectedAccountId] && (accountSettings[selectedAccountId].enabledFeatures || accountSettings[selectedAccountId].enabledMenuGroups || accountSettings[selectedAccountId].enabledAppModes);

  return (
    <div className="p-4 sm:p-6 rounded-xl shadow-xl" style={{ backgroundColor: currentThemeColors.bgSecondary }}>
      <h2 className="text-xl sm:text-2xl font-semibold text-text-base-themed mb-4 text-center flex items-center justify-center">
        <SlidersHorizontalIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 text-brand-primary" />
        Account-Specific View Settings
      </h2>

      <div className="max-w-xl mx-auto mb-6 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4" style={{ backgroundColor: currentThemeColors.bgAccent+'33' }}>
        <div className="flex-grow">
            <label htmlFor="account-select-for-settings" className="block text-sm font-medium text-text-muted-themed mb-1">
                Select an account to customize its view:
            </label>
            <AccountSelector
                id="account-select-for-settings"
                selectedAccountId={selectedAccountId}
                onAccountChange={setSelectedAccountId}
                size="normal"
            />
        </div>
        {accountHasSettings && (
             <button
                onClick={handleResetSettings}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg shadow-sm text-expense bg-expense/10 hover:bg-expense/20 focus:outline-none focus:ring-1 focus:ring-expense transition-colors"
                aria-label="Reset settings for selected account"
            >
                Reset to Default
            </button>
        )}
      </div>

      {!selectedAccountId && (
        <p className="text-center text-text-muted-themed">Please select an account to begin customization.</p>
      )}

      {selectedAccountId && (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium text-text-base-themed mb-3">Main Navigation Visibility</h3>
                <div className="space-y-3">
                    {configurableAppModes.map(mode => {
                        // If no settings exist for enabledAppModes, default to enabled (true).
                        const isEnabled = accountSettings[selectedAccountId]?.enabledAppModes
                            ? accountSettings[selectedAccountId]!.enabledAppModes!.includes(mode.key)
                            : true;
                        return (
                             <div key={mode.key} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: currentThemeColors.bgAccent }}>
                                <h4 className="text-sm font-medium">{mode.label}</h4>
                                {renderToggleSwitch(`toggle-mode-${mode.key}`, isEnabled, (e) => handleToggleAppMode(mode.key, e.target.checked), mode.label)}
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div>
                <h3 className="text-lg font-medium text-text-base-themed mb-3">Menu Group Visibility</h3>
                <div className="space-y-3">
                    {CONFIGURABLE_MENU_GROUPS.map(group => {
                        const isEnabled = accountSettings[selectedAccountId]?.enabledMenuGroups
                            ? accountSettings[selectedAccountId]!.enabledMenuGroups!.includes(group.key)
                            : true; // Default to enabled if no settings exist for the group array
                        return (
                             <div key={group.key} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: currentThemeColors.bgAccent }}>
                                <div className="flex items-center">
                                    <group.icon className="w-5 h-5 mr-3" style={{ color: currentThemeColors.brandPrimary }} />
                                    <div>
                                        <h4 className="text-sm font-medium">{group.label}</h4>
                                        <p className="text-xs text-text-muted-themed hidden sm:block">{group.description}</p>
                                    </div>
                                </div>
                                {renderToggleSwitch(`toggle-group-${group.key}`, isEnabled, (e) => handleToggleGroup(group.key, e.target.checked), group.label)}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-text-base-themed mb-3">Individual Feature Visibility</h3>
                 <div className="space-y-3">
                     {CONFIGURABLE_USER_FEATURES.map(feature => {
                        const isEnabled = accountSettings[selectedAccountId]?.enabledFeatures
                            ? accountSettings[selectedAccountId]!.enabledFeatures!.includes(feature.key as SectionKey)
                            : true; // Default to enabled if no settings exist for the feature array
                        return (
                            <div key={feature.key} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: currentThemeColors.bgAccent }}>
                                <div className="flex items-center">
                                    <feature.icon className="w-5 h-5 mr-3" style={{ color: currentThemeColors.brandSecondary }}/>
                                    <div>
                                        <h4 className="text-sm font-medium">{feature.label}</h4>
                                        <p className="text-xs text-text-muted-themed hidden sm:block">{feature.description}</p>
                                    </div>
                                </div>
                                {renderToggleSwitch(`toggle-feature-${feature.key}`, isEnabled, (e) => handleToggleFeature(feature.key as SectionKey, e.target.checked), feature.label)}
                            </div>
                        );
                    })}
                 </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AccountSpecificSettings;