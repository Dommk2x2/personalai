
import React, { useState, useMemo } from 'react';
import { AppModeLayouts, ModeLayout, SectionKey, ToastType, ModePageConfig, AppMode } from '../../types';
import { allSectionKeysWithConfig } from '../../constants';
import { useTheme } from '../../contexts/ThemeContext';
import { PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, LayoutIcon, PinIcon } from '../Icons';

interface HomeLayoutSettingsProps {
  modeLayouts: AppModeLayouts;
  onSetModeLayouts: (layouts: AppModeLayouts) => void;
  addToast: (message: string, type: ToastType) => void;
}

const HomeLayoutSettings: React.FC<HomeLayoutSettingsProps> = ({
  modeLayouts,
  onSetModeLayouts,
  addToast
}) => {
  const { currentThemeColors } = useTheme();
  const [selectedMode, setSelectedMode] = useState<AppMode>(AppMode.FINANCE);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSection, setNewPageSection] = useState<SectionKey>('form');

  const currentLayout = modeLayouts[selectedMode] || [];

  const updateLayout = (newLayout: ModeLayout) => {
    onSetModeLayouts({
      ...modeLayouts,
      [selectedMode]: newLayout
    });
  };

  const availableSections = useMemo(() => allSectionKeysWithConfig.filter(s => 
    !['userFeatureControl', 'userManagement', 'dataManagement', 'appSettings', 'viewAccountsTable', 'viewSchedulesTable', 'viewAllTransactionsTable', 'recycleBin', 'viewRawLocalStorageTable'].includes(s.key)
  ).sort((a, b) => a.label.localeCompare(b.label)), []);

  const handleAddPage = () => {
    if (!newPageTitle.trim()) {
      addToast("Please enter a page title.", "error");
      return;
    }

    const newPage: ModePageConfig = {
      id: crypto.randomUUID(),
      title: newPageTitle.trim(),
      sectionKey: newPageSection,
      isDefault: currentLayout.length === 0
    };

    updateLayout([...currentLayout, newPage]);
    setNewPageTitle('');
    addToast(`Page "${newPage.title}" added to ${selectedMode} layout.`, "success");
  };

  const handleRemovePage = (id: string) => {
    if (currentLayout.length <= 1) {
      addToast("You must have at least one page.", "warning");
      return;
    }
    const removedPage = currentLayout.find(p => p.id === id);
    const filtered = currentLayout.filter(p => p.id !== id);
    
    // If we removed the default page, set the first remaining page as default
    if (removedPage?.isDefault && filtered.length > 0) {
      filtered[0].isDefault = true;
    }
    
    updateLayout(filtered);
    addToast("Page removed from layout.", "info");
  };

  const handleMovePage = (index: number, direction: 'up' | 'down') => {
    const newLayout = [...currentLayout];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newLayout.length) return;

    [newLayout[index], newLayout[targetIndex]] = [newLayout[targetIndex], newLayout[index]];
    updateLayout(newLayout);
  };

  const handleUpdatePage = (id: string, updates: Partial<ModePageConfig>) => {
    const updated = currentLayout.map(p => p.id === id ? { ...p, ...updates } : p);
    updateLayout(updated);
  };

  const handleSetDefault = (id: string) => {
    const updated = currentLayout.map(p => ({
      ...p,
      isDefault: p.id === id
    }));
    updateLayout(updated);
    addToast("Default page updated.", "success");
  };

  const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-bg-primary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-text-base-themed placeholder-text-muted-themed";
  const labelBaseClasses = "block text-sm font-medium text-text-muted-themed";

  return (
    <div className="space-y-6">
      <h4 className="text-md font-semibold mb-3 text-left flex items-center" style={{ color: currentThemeColors.textBase }}>
        <LayoutIcon className="w-5 h-5 mr-2 text-brand-primary" /> Multi-Menu Layout Settings
      </h4>

      <p className="text-xs text-text-muted-themed mb-4">
        Customize the swipeable pages for each menu mode. You can add new pages and choose which feature each page displays.
      </p>

      {/* Mode Selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.values(AppMode).map(mode => (
          <button
            key={mode}
            onClick={() => setSelectedMode(mode)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedMode === mode 
                ? 'bg-brand-primary text-white shadow-lg' 
                : 'bg-bg-accent-themed text-text-muted-themed hover:bg-bg-accent-themed/80'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Add New Page */}
      <div className="p-4 rounded-2xl bg-bg-accent-themed/30 border border-border-secondary space-y-4">
        <h5 className="text-sm font-bold uppercase tracking-widest text-brand-primary">Add New Page</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelBaseClasses}>Page Title</label>
            <input 
              type="text" 
              value={newPageTitle}
              onChange={e => setNewPageTitle(e.target.value)}
              className={inputBaseClasses}
              placeholder="e.g. My Summary"
            />
          </div>
          <div>
            <label className={labelBaseClasses}>Select Feature</label>
            <select 
              value={newPageSection}
              onChange={e => setNewPageSection(e.target.value as SectionKey)}
              className={inputBaseClasses}
            >
              {availableSections.map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
        <button 
          onClick={handleAddPage}
          className="w-full flex items-center justify-center gap-2 py-2 bg-brand-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          <PlusIcon className="w-4 h-4" /> Add Page to Layout
        </button>
      </div>

      {/* Current Layout */}
      <div className="space-y-3">
        <h5 className="text-sm font-bold uppercase tracking-widest text-text-base-themed">Current Pages for {selectedMode}</h5>
        {currentLayout.map((page, index) => (
          <div 
            key={page.id} 
            className="flex items-center gap-3 p-3 rounded-xl bg-bg-primary-themed border border-border-primary shadow-sm group"
          >
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => handleMovePage(index, 'up')}
                disabled={index === 0}
                className="p-1 text-text-muted-themed hover:text-brand-primary disabled:opacity-30"
              >
                <ChevronUpIcon className="w-3 h-3" />
              </button>
              <button 
                onClick={() => handleMovePage(index, 'down')}
                disabled={index === currentLayout.length - 1}
                className="p-1 text-text-muted-themed hover:text-brand-primary disabled:opacity-30"
              >
                <ChevronDownIcon className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={page.title}
                  onChange={e => handleUpdatePage(page.id, { title: e.target.value })}
                  className="flex-1 px-2 py-1 text-sm font-bold bg-transparent border-b border-transparent focus:border-brand-primary focus:outline-none text-text-base-themed"
                />
                <button
                  onClick={() => handleSetDefault(page.id)}
                  className={`p-1 rounded-lg transition-all ${
                    page.isDefault 
                      ? 'bg-brand-primary text-white shadow-sm' 
                      : 'text-text-muted-themed hover:bg-bg-accent-themed'
                  }`}
                  title={page.isDefault ? "Default Page" : "Set as Default"}
                >
                  <PinIcon className="w-3.5 h-3.5" />
                </button>
              </div>
              <select 
                value={page.sectionKey}
                onChange={e => handleUpdatePage(page.id, { sectionKey: e.target.value as SectionKey })}
                className="px-2 py-1 text-xs bg-transparent border-b border-transparent focus:border-brand-primary focus:outline-none text-text-muted-themed"
              >
                {availableSections.map(s => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => handleRemovePage(page.id)}
              className="p-2 text-text-muted-themed hover:text-expense transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
        {currentLayout.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-border-secondary rounded-2xl">
            <p className="text-xs font-bold text-text-muted-themed uppercase tracking-widest">No pages configured for this mode</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeLayoutSettings;
