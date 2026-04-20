
import React, { useState, useEffect } from 'react';
import { BanknotesIcon, CalendarDaysIcon, UserGroupIcon, LockClosedIcon as SessionLockIcon, TypeIcon, SaveIcon, DatabaseIcon as AutoBackupIcon, SparklesIcon, TypeIcon as IdentityIcon, LayoutIcon, ArrowsPointingOutIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
// FIX: Rename imported type to avoid conflict with component name
import { ToastType, AppSettingSectionKey, Role, AutoBackupSettings as AutoBackupSettingsType, SalaryDeduction, SectionKey, DefaultViewSettings, FestiveDate, OverlaySettings as OverlaySettingsType, Account } from '../types'; // Added Role and Account
import { FilterPeriod } from './DateFilter';

import SalarySettings from './settings/SalarySettings';
import FinancialMonthSettings from './settings/FinancialMonthSettings';
import AttendanceLeaveSettings from './settings/AttendanceLeaveSettings';
import SessionSettings from './settings/SessionSettings';
import DisplaySettings from './settings/DisplaySettings';
import AutoBackupSettings from './settings/AutoBackupSettings';
import CelebrationSettings from './settings/CelebrationSettings';
import HomeLayoutSettings from './settings/HomeLayoutSettings';
import OverlaySettings from './settings/OverlaySettings';
import { AppModeLayouts } from '../types';


interface AppSettingsComponentProps {
  appTitle: string;
  setAppTitle: (title: string) => void;
  customBrandColor: string | null;
  setCustomBrandColor: (color: string | null) => void;
  customBgColor: string | null;
  setCustomBgColor: (color: string | null) => void;
  monthlySalary: number | null;
  onSetMonthlySalary: (salary: number | null) => void;
  selectedWeeklyOffDay: number;
  onSetSelectedWeeklyOffDay: (day: number) => void;
  monthlyOffLimits: Record<string, number>;
  onSetMonthlyOffLimit: (monthYear: string, limit: number) => void;
  financialMonthStartDay: number;
  onSetFinancialMonthStartDay: (day: number) => void;
  financialMonthEndDay: number;
  onSetFinancialMonthEndDay: (day: number) => void;
  financialYearStartMonth: number;
  financialYearStartDay: number;
  financialYearEndMonth: number;
  financialYearEndDay: number;
  onSetFinancialYear: (startMonth: number, startDay: number, endMonth: number, endDay: number) => void;
  sessionTimeoutDurationSeconds: number;
  setSessionTimeoutDurationSeconds: (duration: number) => void;
  useDigitalFontForTimers: boolean;
  setUseDigitalFontForTimers: (value: boolean) => void;
  isDynamicIslandEnabled: boolean;
  onSetIsDynamicIslandEnabled: (value: boolean) => void;
  defaultViews: DefaultViewSettings;
  onSetDefaultViews: React.Dispatch<React.SetStateAction<DefaultViewSettings>>;
  defaultDashboardPeriod: FilterPeriod;
  onSetDefaultDashboardPeriod: React.Dispatch<React.SetStateAction<FilterPeriod>>;
  addToast: (message: string, type: ToastType) => void;
  loggedInRole: Role | null;
  onChangeAdminPassword: (currentPasswordAttempt: string, newPasswordAttempt: string) => boolean;
  // FIX: Use the aliased type
  autoBackupSettings: AutoBackupSettingsType;
  setAutoBackupSettings: (settings: AutoBackupSettingsType) => void;
  lastBackupTimestamp: number | null;
  onBackupNow: () => void;
  salaryDeductions: SalaryDeduction[];
  onAddSalaryDeduction: (name: string, amount: number) => void;
  onDeleteSalaryDeduction: (id: string) => void;
  festiveDates: FestiveDate[];
  onAddFestiveDate: (date: string, name: string) => void;
  onDeleteFestiveDate: (id: string) => void;
  modeLayouts: AppModeLayouts;
  onSetModeLayouts: (layouts: AppModeLayouts) => void;
  username: string;
  overlaySettings: OverlaySettingsType;
  onSetOverlaySettings: (settings: OverlaySettingsType) => void;
  accounts: Account[];
  primaryAccountId: string | null;
  onSetPrimaryAccountId: (id: string | null) => void;
}

export const AppSettingsComponent: React.FC<AppSettingsComponentProps> = (props) => {
  const { currentThemeColors } = useTheme();
  const [activeSettingSection, setActiveSettingSection] = useState<AppSettingSectionKey>('financialMonth');

  const menuItems: { key: AppSettingSectionKey; label: string; icon: React.FC<any> }[] = [
    { key: 'salary', label: 'Salary', icon: BanknotesIcon },
    { key: 'financialMonth', label: 'Financial Period', icon: CalendarDaysIcon },
    { key: 'attendanceLeave', label: 'Attendance & Leave', icon: UserGroupIcon },
    { key: 'session', label: 'Session & Security', icon: SessionLockIcon },
    { key: 'display', label: 'Display & Identity', icon: IdentityIcon },
    { key: 'backup', label: 'Auto Backup', icon: AutoBackupIcon },
    { key: 'celebrations', label: 'Celebrations', icon: SparklesIcon },
    { key: 'layout', label: 'Home Layout', icon: LayoutIcon },
    { key: 'overlay', label: 'Floating Overlay', icon: ArrowsPointingOutIcon },
  ];

  const renderActiveSection = () => {
    switch (activeSettingSection) {
      case 'salary':
        return (
          <SalarySettings
            monthlySalary={props.monthlySalary}
            onSetMonthlySalary={props.onSetMonthlySalary}
            addToast={props.addToast}
            salaryDeductions={props.salaryDeductions}
            onAddSalaryDeduction={props.onAddSalaryDeduction}
            onDeleteSalaryDeduction={props.onDeleteSalaryDeduction}
          />
        );
      case 'financialMonth':
        return (
          <FinancialMonthSettings
            financialMonthStartDay={props.financialMonthStartDay}
            onSetFinancialMonthStartDay={props.onSetFinancialMonthStartDay}
            financialMonthEndDay={props.financialMonthEndDay}
            onSetFinancialMonthEndDay={props.onSetFinancialMonthEndDay}
            financialYearStartMonth={props.financialYearStartMonth}
            financialYearStartDay={props.financialYearStartDay}
            financialYearEndMonth={props.financialYearEndMonth}
            financialYearEndDay={props.financialYearEndDay}
            onSetFinancialYear={props.onSetFinancialYear}
            addToast={props.addToast}
          />
        );
      case 'attendanceLeave':
        return (
          <AttendanceLeaveSettings
            selectedWeeklyOffDay={props.selectedWeeklyOffDay}
            onSetSelectedWeeklyOffDay={props.onSetSelectedWeeklyOffDay}
            monthlyOffLimits={props.monthlyOffLimits}
            onSetMonthlyOffLimit={props.onSetMonthlyOffLimit}
            addToast={props.addToast}
          />
        );
      case 'session':
        return (
          <SessionSettings
            sessionTimeoutDurationSeconds={props.sessionTimeoutDurationSeconds}
            setSessionTimeoutDurationSeconds={props.setSessionTimeoutDurationSeconds}
            addToast={props.addToast}
            loggedInRole={props.loggedInRole}
            onChangeAdminPassword={props.onChangeAdminPassword}
          />
        );
      case 'display':
        return (
          <DisplaySettings
            appTitle={props.appTitle}
            setAppTitle={props.setAppTitle}
            customBrandColor={props.customBrandColor}
            setCustomBrandColor={props.setCustomBrandColor}
            customBgColor={props.customBgColor}
            setCustomBgColor={props.setCustomBgColor}
            useDigitalFontForTimers={props.useDigitalFontForTimers}
            setUseDigitalFontForTimers={props.setUseDigitalFontForTimers}
            isDynamicIslandEnabled={props.isDynamicIslandEnabled}
            onSetIsDynamicIslandEnabled={props.onSetIsDynamicIslandEnabled}
            defaultViews={props.defaultViews}
            onSetDefaultViews={props.onSetDefaultViews}
            defaultDashboardPeriod={props.defaultDashboardPeriod}
            onSetDefaultDashboardPeriod={props.onSetDefaultDashboardPeriod}
            modeLayouts={props.modeLayouts}
            onSetModeLayouts={props.onSetModeLayouts}
            addToast={props.addToast}
            username={props.username}
            accounts={props.accounts}
            primaryAccountId={props.primaryAccountId}
            onSetPrimaryAccountId={props.onSetPrimaryAccountId}
          />
        );
      case 'backup':
          return (
            <AutoBackupSettings
                autoBackupSettings={props.autoBackupSettings}
                setAutoBackupSettings={props.setAutoBackupSettings}
                lastBackupTimestamp={props.lastBackupTimestamp}
                onBackupNow={props.onBackupNow}
                addToast={props.addToast}
            />
          );
      case 'celebrations':
          return (
              <CelebrationSettings
                  festiveDates={props.festiveDates}
                  onAddFestiveDate={props.onAddFestiveDate}
                  onDeleteFestiveDate={props.onDeleteFestiveDate}
              />
          );
      case 'layout':
          return (
              <HomeLayoutSettings
                  modeLayouts={props.modeLayouts}
                  onSetModeLayouts={props.onSetModeLayouts}
                  addToast={props.addToast}
              />
          );
      case 'overlay':
          return (
              <OverlaySettings
                  settings={props.overlaySettings}
                  onUpdate={props.onSetOverlaySettings}
              />
          );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0">
        <nav className="space-y-1">
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveSettingSection(item.key)}
              className={`w-full flex items-center p-3 text-sm font-medium rounded-lg text-left transition-colors ${
                activeSettingSection === item.key
                  ? 'bg-brand-primary text-white shadow'
                  : 'text-text-muted-themed hover:bg-bg-accent-themed'
              }`}
            >
              <item.icon
                className={`w-5 h-5 mr-3 ${activeSettingSection === item.key ? 'text-white' : 'text-brand-primary'}`}
              />
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="w-full md:w-3/4 lg:w-4/5 p-4 rounded-lg shadow-inner" style={{ backgroundColor: currentThemeColors.bgPrimary }}>
        {renderActiveSection()}
      </div>
    </div>
  );
};
