import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  EllipsisVerticalIcon, LockClosedIcon, MoonIcon, SunIcon, LogoutIcon,
  CogIcon, DatabaseIcon, RecycleBinIcon, UserPlusIcon, 
  SlidersHorizontalIcon, BookOpenIcon
} from './Icons';
import { Role, SectionKey } from '../types';

interface HeaderMenuProps {
  onLock: () => void;
  onLogout: () => void;
  hasPin: boolean;
  onShowSection: (section: SectionKey) => void;
  loggedInRole: Role | null;
}

const HeaderMenu: React.FC<HeaderMenuProps> = ({ onLock, onLogout, hasPin, onShowSection, loggedInRole }) => {
  const { theme, toggleThemeMode, currentThemeColors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const menuItemClasses = "w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors hover:bg-slate-100 dark:hover:bg-slate-800";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
        aria-label="Settings and Account"
      >
        <CogIcon className="w-6 h-6" />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl z-[100] animate-modal-enter overflow-hidden border border-slate-200 dark:border-slate-800"
          style={{ backgroundColor: currentThemeColors.bgSecondary }}
        >
          <div className="py-1">
            {/* Theme Toggle */}
            <button 
              onClick={() => { toggleThemeMode(); setIsOpen(false); }}
              className={menuItemClasses}
              style={{ color: currentThemeColors.textBase }}
            >
              {theme.mode === 'dark' ? (
                <><SunIcon className="w-5 h-5 text-yellow-500" /> <span>Light Appearance</span></>
              ) : (
                <><MoonIcon className="w-5 h-5 text-indigo-500" /> <span>Dark Appearance</span></>
              )}
            </button>

            {/* App Lock */}
            {hasPin && (
              <button 
                onClick={() => { onLock(); setIsOpen(false); }}
                className={menuItemClasses}
                style={{ color: currentThemeColors.textBase }}
              >
                <LockClosedIcon className="w-5 h-5 text-slate-500" />
                <span>Lock Application</span>
              </button>
            )}

            {/* System & Admin Sections (Admin Only) */}
            {loggedInRole === Role.ADMIN && (
              <>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">System & Admin</div>
                
                <button onClick={() => { onShowSection('appSettings'); setIsOpen(false); }} className={menuItemClasses} style={{ color: currentThemeColors.textBase }}>
                  <CogIcon className="w-5 h-5 text-blue-500" /> <span>Settings</span>
                </button>
                <button onClick={() => { onShowSection('dataManagement'); setIsOpen(false); }} className={menuItemClasses} style={{ color: currentThemeColors.textBase }}>
                  <DatabaseIcon className="w-5 h-5 text-emerald-500" /> <span>Backup & Data</span>
                </button>
                <button onClick={() => { onShowSection('recycleBin'); setIsOpen(false); }} className={menuItemClasses} style={{ color: currentThemeColors.textBase }}>
                  <RecycleBinIcon className="w-5 h-5 text-orange-500" /> <span>Recycle Bin</span>
                </button>
                <button onClick={() => { onShowSection('userManagement'); setIsOpen(false); }} className={menuItemClasses} style={{ color: currentThemeColors.textBase }}>
                  <UserPlusIcon className="w-5 h-5 text-indigo-500" /> <span>User Management</span>
                </button>
                <button onClick={() => { onShowSection('userFeatureControl'); setIsOpen(false); }} className={menuItemClasses} style={{ color: currentThemeColors.textBase }}>
                  <SlidersHorizontalIcon className="w-5 h-5 text-purple-500" /> <span>Permissions</span>
                </button>
                <button onClick={() => { onShowSection('viewRawLocalStorageTable'); setIsOpen(false); }} className={menuItemClasses} style={{ color: currentThemeColors.textBase }}>
                  <DatabaseIcon className="w-5 h-5 text-slate-500" /> <span>DB Inspector</span>
                </button>
              </>
            )}

            {/* User Manual (Available to all) */}
            <button onClick={() => { onShowSection('userManual'); setIsOpen(false); }} className={menuItemClasses} style={{ color: currentThemeColors.textBase }}>
              <BookOpenIcon className="w-5 h-5 text-amber-500" /> <span>User Manual</span>
            </button>

            {/* Separator */}
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>

            {/* Logout */}
            <button 
              onClick={() => { onLogout(); setIsOpen(false); }}
              className={`${menuItemClasses} text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20`}
            >
              <LogoutIcon className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderMenu;