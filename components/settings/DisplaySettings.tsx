
import React, { useMemo, useState, useEffect } from 'react';
import { TypeIcon, SparklesIcon, BellIcon, ArrowPathIcon, PhotoIcon, ShieldCheckIcon } from '../Icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ToastType, SectionKey, AppMode, DefaultViewSettings, AppModeLayouts } from '../../types';
import { allSectionKeysWithConfig } from '../../constants';
import { FilterPeriod } from '../DateFilter';
import ProfilePicture from '../ProfilePicture';

interface DisplaySettingsProps {
  appTitle: string;
  setAppTitle: (title: string) => void;
  customBrandColor: string | null;
  setCustomBrandColor: (color: string | null) => void;
  customBgColor: string | null;
  setCustomBgColor: (color: string | null) => void;
  useDigitalFontForTimers: boolean;
  setUseDigitalFontForTimers: (value: boolean) => void;
  isDynamicIslandEnabled: boolean;
  onSetIsDynamicIslandEnabled: (value: boolean) => void;
  defaultViews: DefaultViewSettings;
  onSetDefaultViews: React.Dispatch<React.SetStateAction<DefaultViewSettings>>;
  defaultDashboardPeriod: FilterPeriod;
  onSetDefaultDashboardPeriod: React.Dispatch<React.SetStateAction<FilterPeriod>>;
  modeLayouts: AppModeLayouts;
  onSetModeLayouts: (layouts: AppModeLayouts) => void;
  addToast: (message: string, type: ToastType) => void;
  username: string;
}

const DisplaySettings: React.FC<DisplaySettingsProps> = ({
  appTitle, setAppTitle,
  customBrandColor, setCustomBrandColor,
  customBgColor, setCustomBgColor,
  useDigitalFontForTimers, setUseDigitalFontForTimers,
  isDynamicIslandEnabled, onSetIsDynamicIslandEnabled,
  defaultViews, onSetDefaultViews,
  defaultDashboardPeriod, onSetDefaultDashboardPeriod,
  modeLayouts, onSetModeLayouts,
  addToast,
  username
}) => {
  const { currentThemeColors } = useTheme();
  const [notifPermission, setNotifPermission] = useState<string>(Notification.permission);
  const [localTitle, setLocalTitle] = useState(appTitle);
  const [localColor, setLocalColor] = useState(customBrandColor || '#4F46E5');
  const [localBgColor, setLocalBgColor] = useState(customBgColor || '#f8fafc');

  useEffect(() => {
    setLocalTitle(appTitle);
  }, [appTitle]);

  useEffect(() => {
    if (customBrandColor) setLocalColor(customBrandColor);
  }, [customBrandColor]);

  useEffect(() => {
    if (customBgColor) setLocalBgColor(customBgColor);
  }, [customBgColor]);

  const handleTitleBlur = () => {
    if (localTitle.trim() && localTitle !== appTitle) {
        setAppTitle(localTitle.trim());
        addToast("Application title updated.", "success");
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setLocalColor(newColor);
    setCustomBrandColor(newColor);
  };

  const handleBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setLocalBgColor(newColor);
    setCustomBgColor(newColor);
  };

  const handleResetBrand = () => {
    setCustomBrandColor(null);
    setCustomBgColor(null);
    setAppTitle('Personal AI');
    addToast("Identity reset to default.", "info");
  };

  const handleToggleDigitalFont = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = e.target.checked;
    setUseDigitalFontForTimers(isEnabled);
    addToast(`Digital font for timers ${isEnabled ? 'enabled' : 'disabled'}.`, "info");
  };

  const handleToggleDynamicIsland = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = e.target.checked;
    onSetIsDynamicIslandEnabled(isEnabled);
    addToast(`Dynamic Island notifications ${isEnabled ? 'enabled' : 'disabled'}.`, "info");
  };
  
  const handleDefaultPeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPeriod = e.target.value as FilterPeriod;
    onSetDefaultDashboardPeriod(newPeriod);
    addToast(`Default dashboard period set to "${newPeriod}".`, "info");
  };

  const handleRequestNotifs = async () => {
    if (!('Notification' in window)) {
      addToast("Notifications not supported by this browser.", "error");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
    if (permission === 'granted') {
      new Notification(appTitle, { 
        body: "Push notifications are now enabled! We'll keep you posted.",
        icon: "https://cdn-icons-png.flaticon.com/512/192/192161.png"
      });
      addToast("Notifications enabled!", "success");
    }
  };

  const handleDefaultViewChange = (mode: AppMode, sectionKey: SectionKey) => {
    // Update defaultViews state
    onSetDefaultViews(prev => ({ ...prev, [mode]: sectionKey }));
    
    // Also update modeLayouts if the section exists in the layout
    const currentLayout = modeLayouts[mode] || [];
    const pageIndex = currentLayout.findIndex(p => p.sectionKey === sectionKey);
    
    if (pageIndex !== -1) {
      const updatedLayout = currentLayout.map((p, idx) => ({
        ...p,
        isDefault: idx === pageIndex
      }));
      onSetModeLayouts({
        ...modeLayouts,
        [mode]: updatedLayout
      });
    }
    
    addToast(`Default view for ${mode} updated.`, "info");
  };

  const getLabel = (key: SectionKey) => (allSectionKeysWithConfig ?? []).find(c => c.key === key)?.label || key;

  const defaultViewOptions: { mode: AppMode; label: string; keys: SectionKey[] }[] = [
    {
      mode: AppMode.FINANCE,
      label: 'Finance Mode',
      keys: ['form', 'history', 'passbook', 'financialCalendar', 'accountManagement', 'categoryManagement', 'budgets', 'horoscope']
    },
    {
      mode: AppMode.ATTENDANCE,
      label: 'Attendance Mode',
      keys: ['attendanceList', 'attendanceView', 'attendanceCalendar', 'attendanceReports', 'salaryReport']
    },
    {
      mode: AppMode.EMI,
      label: 'EMI Mode',
      keys: ['amortizationSchedule', 'emiDashboard']
    },
    {
      mode: AppMode.TODO,
      label: 'To-do Mode',
      keys: ['todoList', 'dayPlanner']
    }
  ];

  const defaultPeriodOptions: FilterPeriod[] = ['Daily', 'Weekly', 'Monthly'];

  const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-bg-primary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-text-base-themed placeholder-text-muted-themed";
  const labelBaseClasses = "block text-sm font-medium text-text-muted-themed";

  return (
    <div className="space-y-6">
      <h4 className="text-md font-semibold mb-3 text-left flex items-center" style={{ color: currentThemeColors.textBase }}>
        <TypeIcon className="w-5 h-5 mr-2 text-brand-primary" /> Identity & Visual Branding
      </h4>
      
      {/* Brand Identity Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-bg-accent-themed/30 border border-border-secondary">
          <div>
              <label htmlFor="app-title-edit" className={labelBaseClasses}>Application Title</label>
              <input 
                id="app-title-edit"
                type="text" 
                value={localTitle}
                onChange={e => setLocalTitle(e.target.value)}
                onBlur={handleTitleBlur}
                className={inputBaseClasses}
                placeholder="Enter custom app name"
              />
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">Appears in header & PDFs</p>
          </div>
          <div>
              <label htmlFor="brand-color-picker" className={labelBaseClasses}>Primary Brand Color</label>
              <div className="flex gap-2 items-center">
                  <div 
                    className="w-10 h-10 rounded-lg shadow-inner flex-shrink-0 border-2 border-white dark:border-slate-800" 
                    style={{ backgroundColor: localColor }}
                  >
                      <input 
                        id="brand-color-picker"
                        type="color" 
                        value={localColor}
                        onChange={handleColorChange}
                        className="opacity-0 w-full h-full cursor-pointer"
                      />
                  </div>
                  <input 
                    type="text" 
                    value={localColor} 
                    onChange={e => { setLocalColor(e.target.value); if(/^#[0-9A-F]{6}$/i.test(e.target.value)) setCustomBrandColor(e.target.value); }}
                    className={`${inputBaseClasses} font-mono uppercase text-center`}
                  />
                  <button onClick={handleResetBrand} className="p-2 text-slate-400 hover:text-expense transition-colors" title="Reset branding">
                      <ArrowPathIcon className="w-5 h-5" />
                  </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">Main accent color globally</p>
          </div>
          <div>
              <label htmlFor="bg-color-picker" className={labelBaseClasses}>Custom Background Color</label>
              <div className="flex gap-2 items-center">
                  <div 
                    className="w-10 h-10 rounded-lg shadow-inner flex-shrink-0 border-2 border-white dark:border-slate-800" 
                    style={{ backgroundColor: localBgColor }}
                  >
                      <input 
                        id="bg-color-picker"
                        type="color" 
                        value={localBgColor}
                        onChange={handleBgColorChange}
                        className="opacity-0 w-full h-full cursor-pointer"
                      />
                  </div>
                  <input 
                    type="text" 
                    value={localBgColor} 
                    onChange={e => { setLocalBgColor(e.target.value); if(/^#[0-9A-F]{6}$/i.test(e.target.value)) setCustomBgColor(e.target.value); }}
                    className={`${inputBaseClasses} font-mono uppercase text-center`}
                  />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">Primary background override</p>
          </div>
      </div>

      {/* Profile Pictures Section */}
      <h4 className="text-md font-semibold mt-8 mb-3 text-left flex items-center" style={{ color: currentThemeColors.textBase }}>
        <PhotoIcon className="w-5 h-5 mr-2 text-brand-primary" /> Profile & Lock Screen Pictures
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-bg-accent-themed/30 border border-border-secondary">
          <div className="flex flex-col items-center p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-border-primary shadow-sm">
              <label className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Main Profile Picture</label>
              <ProfilePicture username={username} size="w-24 h-24" type="general" />
              <p className="text-[10px] text-slate-400 mt-4 text-center uppercase font-bold tracking-tighter">Click to change. Appears in header and sidebar.</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-border-primary shadow-sm">
              <label className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Lock Screen Picture</label>
              <ProfilePicture username={username} size="w-24 h-24" type="lockscreen" />
              <p className="text-[10px] text-slate-400 mt-4 text-center uppercase font-bold tracking-tighter">Click to change. Appears on the app lock screen.</p>
          </div>
      </div>

      {/* PWA Notifications */}
      <div className="p-3 rounded-lg" style={{backgroundColor: currentThemeColors.bgAccent+'33'}}>
        <div className="flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-sm font-medium text-text-base-themed flex items-center">
                    <BellIcon className="w-4 h-4 mr-2 text-brand-primary" />
                    Push Notifications
                </span>
                <p className="text-xs text-text-muted-themed">Current Status: <span className="font-bold capitalize">{notifPermission}</span></p>
            </div>
            <button 
                onClick={handleRequestNotifs}
                disabled={notifPermission === 'granted'}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${notifPermission === 'granted' ? 'bg-income/20 text-income opacity-50 cursor-not-allowed' : 'bg-brand-primary text-white shadow-lg active:scale-95'}`}
            >
                {notifPermission === 'granted' ? 'Enabled' : 'Enable Notifs'}
            </button>
        </div>
      </div>

      <div className="p-3 rounded-lg" style={{backgroundColor: currentThemeColors.bgAccent+'33'}}>
        <div className="flex items-center justify-between">
            <label htmlFor="digitalFontToggle" className="text-sm text-text-base-themed">
            Use Digital Font for Timers
            <p className="text-xs text-text-muted-themed">Applies to countdown timer displays in the header.</p>
            </label>
            <div className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                id="digitalFontToggle"
                className="sr-only peer"
                checked={useDigitalFontForTimers}
                onChange={handleToggleDigitalFont}
            />
            <div
                className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={useDigitalFontForTimers ? { backgroundColor: currentThemeColors.brandPrimary } : {}}
            ></div>
            </div>
        </div>
      </div>

      <div className="p-3 rounded-lg" style={{backgroundColor: currentThemeColors.bgAccent+'33'}}>
        <div className="flex items-center justify-between">
            <label htmlFor="dynamicIslandToggle" className="text-sm text-text-base-themed">
              Enable Dynamic Island UI
              <p className="text-xs text-text-muted-themed">Show a brief notification at the top when a transaction is added.</p>
            </label>
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="dynamicIslandToggle"
                className="sr-only peer"
                checked={isDynamicIslandEnabled}
                onChange={handleToggleDynamicIsland}
              />
              <div
                className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={isDynamicIslandEnabled ? { backgroundColor: currentThemeColors.brandPrimary } : {}}
              ></div>
            </div>
        </div>
      </div>

      <div className="pt-6 border-t border-border-secondary">
        <h5 className="text-md font-semibold mb-2" style={{ color: currentThemeColors.textBase }}>Default Dashboard Period</h5>
        <div>
            <label htmlFor="default-dashboard-period" className={labelBaseClasses}>Default Period</label>
            <select
                id="default-dashboard-period"
                value={defaultDashboardPeriod}
                onChange={handleDefaultPeriodChange}
                className={inputBaseClasses}
            >
                {defaultPeriodOptions.map(period => (
                    <option key={period} value={period}>{period}</option>
                ))}
            </select>
        </div>
      </div>

      <div className="pt-6 border-t border-border-secondary">
        <h5 className="text-md font-semibold mb-2" style={{ color: currentThemeColors.textBase }}>Default Menu Views</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {defaultViewOptions.map(setting => (
            <div key={setting.mode}>
              <label htmlFor={`default-view-${setting.mode}`} className={labelBaseClasses}>
                {setting.label}
              </label>
              <select
                id={`default-view-${setting.mode}`}
                value={defaultViews[setting.mode] || ''}
                onChange={(e) => handleDefaultViewChange(setting.mode, e.target.value as SectionKey)}
                className={inputBaseClasses}
              >
                {setting.keys.sort((a, b) => getLabel(a).localeCompare(getLabel(b))).map(key => (
                    <option key={key} value={key}>{getLabel(key)}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DisplaySettings;
