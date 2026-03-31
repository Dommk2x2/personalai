
import React from 'react';
import { UserFeatureKey, UserViewFeatureSettings, MenuGroupKey, UserMenuGroupSettings, ConfigurableUserFeatureGroup, Role } from '../types'; // Added Role
import { ConfigurableUserFeature, CONFIGURABLE_USER_FEATURES, CONFIGURABLE_MENU_GROUPS } from '../constants';
import { SlidersHorizontalIcon, EyeIcon, EyeSlashIcon, UsersIcon } from './Icons'; // Added UsersIcon or similar for groups
import { useTheme } from '../contexts/ThemeContext';

interface UserFeatureControlPanelProps {
  settings: UserViewFeatureSettings;
  onToggleFeature: (featureKey: UserFeatureKey, isEnabled: boolean) => void;
  userMenuGroupSettings: UserMenuGroupSettings; // New prop
  onToggleUserMenuGroup: (groupKey: MenuGroupKey, isEnabled: boolean) => void; // New prop
}

const UserFeatureControlPanel: React.FC<UserFeatureControlPanelProps> = ({ 
  settings, 
  onToggleFeature,
  userMenuGroupSettings,
  onToggleUserMenuGroup
}) => {
  const { currentThemeColors } = useTheme();

  const renderToggleSwitch = (
    id: string, 
    checked: boolean, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    label: string
  ) => (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        id={id}
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
        aria-label={`Toggle ${label}`}
      />
      <div 
        className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary dark:peer-focus:ring-indigo-500 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
        style={checked ? { backgroundColor: currentThemeColors.brandPrimary } : {}}
      ></div>
      <span className="sr-only">Toggle {label}</span>
    </label>
  );

  return (
    <div className="p-4 sm:p-6 rounded-xl shadow-xl" style={{ backgroundColor: currentThemeColors.bgSecondary }}>
      <h2 className="text-xl sm:text-2xl font-semibold text-text-base-themed mb-6 text-center flex items-center justify-center">
        <SlidersHorizontalIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 text-brand-primary" />
        User View Customization
      </h2>
      
      {/* Individual Feature Toggles */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-text-base-themed mb-4">Individual Feature Visibility</h3>
        <p className="text-sm text-text-muted-themed mb-4">
          Enable or disable specific features within menu groups for the User view. These settings apply if the parent menu group is also enabled.
        </p>
        <div className="space-y-4 max-w-2xl mx-auto">
          {CONFIGURABLE_USER_FEATURES.map((feature: ConfigurableUserFeature) => (
            <div 
              key={feature.key} 
              className="flex items-center justify-between p-3 sm:p-4 rounded-lg shadow-sm"
              style={{ backgroundColor: currentThemeColors.bgAccent }}
            >
              <div className="flex items-center">
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-[var(--color-brand-secondary)]" />
                <div>
                  <h4 className="text-sm sm:text-base font-medium" style={{ color: currentThemeColors.textBase }}>{feature.label}</h4>
                  <p className="text-xs text-text-muted-themed hidden sm:block">{feature.description}</p>
                </div>
              </div>
              {renderToggleSwitch(
                `toggle-feature-${feature.key}`,
                settings[feature.key as UserFeatureKey] ?? feature.defaultEnabled,
                (e) => onToggleFeature(feature.key as UserFeatureKey, e.target.checked),
                feature.label
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Menu Group Toggles */}
      <div className="border-t border-border-secondary pt-6 mt-6">
        <h3 className="text-lg font-medium text-text-base-themed mb-4">Menu Group Visibility for Users</h3>
        <p className="text-sm text-text-muted-themed mb-4">
          Control the visibility of entire menu groups for the User view. Hiding a group here will hide all its features, regardless of individual feature settings above.
        </p>
        <div className="space-y-4 max-w-2xl mx-auto">
          {CONFIGURABLE_MENU_GROUPS.filter(group => group.roles?.includes(Role.USER)).map((group: ConfigurableUserFeatureGroup) => (
            <div 
              key={group.key} 
              className="flex items-center justify-between p-3 sm:p-4 rounded-lg shadow-sm"
              style={{ backgroundColor: currentThemeColors.bgAccent }}
            >
              <div className="flex items-center">
                <group.icon className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-[var(--color-brand-primary)]" />
                <div>
                  <h4 className="text-sm sm:text-base font-medium" style={{ color: currentThemeColors.textBase }}>{group.label}</h4>
                  <p className="text-xs text-text-muted-themed hidden sm:block">{group.description}</p>
                </div>
              </div>
              {renderToggleSwitch(
                `toggle-group-${group.key}`,
                userMenuGroupSettings[group.key] ?? group.defaultEnabled,
                (e) => onToggleUserMenuGroup(group.key, e.target.checked),
                group.label
              )}
            </div>
          ))}
        </div>
      </div>

       <p className="text-xs text-text-muted-themed mt-8 text-center">
        Core features like Dashboard and Transaction Form cannot be disabled completely from this panel if their parent groups are visible.
      </p>
    </div>
  );
};

export default UserFeatureControlPanel;