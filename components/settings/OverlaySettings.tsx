import React from 'react';
import { OverlaySettings, UserFeatureKey } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { CONFIGURABLE_USER_FEATURES } from '../../constants';
import { ArrowsPointingOutIcon } from '../Icons';

interface OverlaySettingsProps {
  settings: OverlaySettings;
  onUpdate: (settings: OverlaySettings) => void;
}

const OVERLAY_CAPABLE_FEATURES: UserFeatureKey[] = [
  'passbook', 
  'documentVault', 
  'miniStatement', 
  'reportsDashboard', 
  'todoList', 
  'dayPlanner', 
  'emiCalendar'
];

const OverlaySettingsComponent: React.FC<OverlaySettingsProps> = ({ settings, onUpdate }) => {
  const { currentThemeColors } = useTheme();

  const toggleFeature = (key: UserFeatureKey) => {
    const newEnabled = settings.enabledFeatures.includes(key)
      ? settings.enabledFeatures.filter(f => f !== key)
      : [...settings.enabledFeatures, key];
    onUpdate({ ...settings, enabledFeatures: newEnabled });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-brand-primary/10 rounded-lg">
          <ArrowsPointingOutIcon className="w-5 h-5 text-brand-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-text-base-themed uppercase tracking-wider">Floating Overlay Settings</h3>
          <p className="text-[10px] text-text-muted-themed">Choose which features can be "Popped Out" into the floating window.</p>
        </div>
      </div>

      <div className="grid gap-3">
        {CONFIGURABLE_USER_FEATURES.filter(f => OVERLAY_CAPABLE_FEATURES.includes(f.key as UserFeatureKey)).map(feature => (
          <div 
            key={feature.key}
            className="flex items-center justify-between p-4 rounded-xl border transition-all"
            style={{ 
              backgroundColor: currentThemeColors.bgPrimary,
              borderColor: currentThemeColors.borderSecondary
            }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <feature.icon className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-base-themed">{feature.label}</p>
                <p className="text-[10px] text-text-muted-themed">{feature.description}</p>
              </div>
            </div>
            <button
              onClick={() => toggleFeature(feature.key as UserFeatureKey)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                settings.enabledFeatures.includes(feature.key as UserFeatureKey) ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enabledFeatures.includes(feature.key as UserFeatureKey) ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
        <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed">
          <strong>Note:</strong> The Floating Overlay allows you to view reference data (like your Passbook or a PDF) while you work on other tasks like entering expenses. Timely updates are ensured by dynamic rendering.
        </p>
      </div>
    </div>
  );
};

export default OverlaySettingsComponent;
