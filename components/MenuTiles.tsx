
import React, { useState, useEffect } from 'react';
import { 
  FormIcon, ChartIcon, HistoryIcon, PassbookIcon, 
  CogIcon, TargetIcon, BookOpenIcon, CalendarIcon,
  CalendarDaysIcon,
  UserGroupIcon, ListBulletIcon, DocumentChartBarIcon, 
  CalculatorIcon, SlidersHorizontalIcon, UserPlusIcon, RecycleBinIcon,
  ListChecksIcon, ClipboardDocumentCheckIcon, SparklesIcon,
  CreditCardIcon, DevicePhoneMobileIcon, UpiIcon, DocumentArrowUpIcon, PhotoIcon,
  ChevronDownIcon, DatabaseIcon, BanknotesIcon, ShieldCheckIcon
} from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import { SectionKey, Role, AppMode, TileConfig, MenuGroup } from '../types';
import { ADMIN_ONLY_SECTIONS } from '../constants'; 

interface MenuTilesProps {
  visibleSections: Set<SectionKey>;
  showSection: (section: SectionKey) => void;
  loggedInRole: Role | null; 
  userViewFeatureSettings: any;
  userMenuGroupSettings: any;
  activeMode: AppMode;
  activeAccountId: string | null;
  accountSettings: any;
}

const ALL_MODES = [AppMode.FINANCE, AppMode.ATTENDANCE, AppMode.EMI, AppMode.TODO, AppMode.REPORTS];

export const MENU_GROUPS: MenuGroup[] = [
  {
    id: "finance_entry",
    title: "Entry & Cash",
    icon: FormIcon,
    roles: [Role.USER, Role.ADMIN],
    modes: [AppMode.FINANCE],
    tiles: [
      { key: 'form', label: 'Transaction', icon: FormIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.FINANCE] },
      { key: 'upiPayment', label: 'UPI Sim', icon: UpiIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.FINANCE] },
      { key: 'pdfImporter', label: 'AI Import', icon: DocumentArrowUpIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.FINANCE] },
      { key: 'appLockSettings', label: 'Security', icon: ShieldCheckIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.FINANCE] },
      { key: 'documentVault', label: 'Vault', icon: PhotoIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.FINANCE] },
      { key: 'digitalIdVault', label: 'ID Vault', icon: CreditCardIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.FINANCE] },
    ]
  },
  {
    id: "finance_views",
    title: "Analysis",
    icon: ChartIcon,
    roles: [Role.USER, Role.ADMIN],
    modes: [AppMode.FINANCE],
    tiles: [
      { key: 'snapshot', label: 'Dashboard', icon: ChartIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.FINANCE] },
      { key: 'history', label: 'Logbook', icon: HistoryIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.FINANCE] },
      { key: 'passbook', label: 'Passbook', icon: PassbookIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.FINANCE] },
      { key: 'financialCalendar', label: 'Calendar', icon: CalendarIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.FINANCE] },
      { key: 'charts', label: 'Analytics', icon: ChartIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.FINANCE] },
      { key: 'dailySummary', label: 'Daily Summary', icon: CalendarIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.FINANCE] },
      { key: 'monthlySummary', label: 'Monthly Summary', icon: DocumentChartBarIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.FINANCE] },
      { key: 'miniStatement', label: 'Statement', icon: ListBulletIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.FINANCE] },
      { key: 'yearlySnapshot', label: 'Snapshots', icon: TargetIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.FINANCE] },
      { key: 'notificationHistory', label: 'Alerts', icon: ShieldCheckIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.FINANCE] },
    ]
  },
  {
    id: "finance_mgmt",
    title: "Management",
    icon: CogIcon,
    roles: [Role.USER, Role.ADMIN],
    modes: [AppMode.FINANCE],
    tiles: [
      { key: 'categoryManagement', label: 'Categories', icon: CogIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.FINANCE] },
      { key: 'budgets', label: 'Limits', icon: TargetIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.FINANCE] },
      { key: 'accountSpecificSettings', label: 'Custom View', icon: SlidersHorizontalIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.FINANCE] },
    ]
  },
  {
      id: "attendance_group",
      title: "Work Tracker",
      icon: UserGroupIcon,
      roles: [Role.USER, Role.ADMIN],
      modes: [AppMode.ATTENDANCE], 
      tiles: [
          { key: 'attendanceList', label: 'Log', icon: FormIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.ATTENDANCE] },
          { key: 'attendanceView', label: 'Review', icon: ListBulletIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.ATTENDANCE] },
          { key: 'attendanceCalendar', label: 'Grid', icon: CalendarIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.ATTENDANCE] },
          { key: 'attendanceReports', label: 'Reports', icon: ChartIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.ATTENDANCE] },
          { key: 'salaryReport', label: 'Payslip', icon: BanknotesIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.ATTENDANCE] },
          { key: 'attendanceConfigReport', label: 'Setup', icon: CogIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.ATTENDANCE] },
      ]
  },
  {
      id: "planner_group",
      title: "Planner",
      icon: ListChecksIcon,
      roles: [Role.USER, Role.ADMIN],
      modes: [AppMode.TODO],
      tiles: [
          { key: 'todoList', label: 'Tasks', icon: ListChecksIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.TODO] },
          { key: 'dayPlanner', label: 'Timeline', icon: ClipboardDocumentCheckIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.TODO] },
          { key: 'horoscope', label: 'Stars', icon: SparklesIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.TODO] },
          { key: 'subscriptionTracker', label: 'Subs', icon: CreditCardIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.TODO] },
          { key: 'rechargeTracker', label: 'Recharges', icon: DevicePhoneMobileIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.TODO] },
          { key: 'menuItemManagement', label: 'Catalog', icon: ListBulletIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.TODO] },
      ]
  },
  {
      id: "emi_group",
      title: "Loans",
      icon: CalculatorIcon,
      roles: [Role.USER, Role.ADMIN],
      modes: [AppMode.EMI],
      tiles: [
          { key: 'amortizationSchedule', label: 'Calc', icon: CalculatorIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.EMI] },
          { key: 'emiDashboard', label: 'Stats', icon: ChartIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.EMI] },
          { key: 'emiCalendar', label: 'View', icon: CalendarIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.EMI] },
      ]
  },
  {
      id: "reports_group",
      title: "Dashboard",
      icon: DocumentChartBarIcon,
      roles: [Role.USER, Role.ADMIN],
      modes: [AppMode.REPORTS],
      tiles: [
          { key: 'yearlySnapshot', label: 'Executive View', icon: SparklesIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.REPORTS] },
          { key: 'reportsDashboard', label: 'Analytics', icon: ChartIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.REPORTS] },
          { key: 'dailySummary', label: 'Daily Summary', icon: CalendarIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.REPORTS] },
          { key: 'attendanceReports', label: 'Attendance', icon: DocumentChartBarIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.REPORTS] },
          { key: 'salaryReport', label: 'Payslips', icon: BanknotesIcon, roles: [Role.ADMIN, Role.USER], modes: [AppMode.REPORTS] },
      ]
  }
];

export const MenuTiles: React.FC<MenuTilesProps> = ({ 
  visibleSections, 
  showSection, 
  loggedInRole,
  activeMode
}) => {
  const { currentThemeColors } = useTheme();
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);

  useEffect(() => {
    const firstGroupForMode = (MENU_GROUPS ?? []).find(group => group.modes.includes(activeMode));
    if (firstGroupForMode) setOpenGroupId(firstGroupForMode.id);
  }, [activeMode]);

  const isTileVisible = (tile: TileConfig) => {
    if (loggedInRole !== Role.ADMIN && ADMIN_ONLY_SECTIONS.includes(tile.key)) return false;
    return tile.modes.includes(activeMode);
  };

  const isGroupVisible = (group: MenuGroup) => {
    if (!group.modes.includes(activeMode)) return false;
    if (loggedInRole === Role.ADMIN) return true;
    return group.roles.includes(Role.USER);
  };

  const toggleGroup = (groupId: string) => {
      setOpenGroupId(prev => prev === groupId ? null : groupId);
  };

  return (
    <div className="flex flex-col gap-3">
      {MENU_GROUPS.filter(isGroupVisible).map(group => {
        const isOpen = openGroupId === group.id;
        const visibleTiles = group.tiles.filter(isTileVisible);
        
        if (visibleTiles.length === 0) return null;

        return (
          <div key={group.id} className="rounded-2xl overflow-hidden border border-border-primary bg-bg-primary-themed">
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full flex justify-between items-center p-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
              style={{ color: currentThemeColors.textMuted }}
            >
              <span className="flex items-center gap-2.5">
                <group.icon className="w-4 h-4" style={{ color: currentThemeColors.brandPrimary }} />
                {group.title}
                <span className="ml-1.5 px-2 py-0.5 rounded-md bg-bg-accent-themed text-[9px] font-black opacity-80">
                  {visibleTiles.length}
                </span>
              </span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100 p-2.5 pt-0' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <div className="grid grid-cols-3 gap-2.5">
                    {visibleTiles.map(tile => {
                        const isActive = visibleSections.has(tile.key);
                        return (
                            <button
                                key={tile.key}
                                onClick={() => showSection(tile.key)}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 aspect-square ${
                                    isActive 
                                    ? 'bg-brand-primary text-white shadow-lg scale-105 z-10' 
                                    : 'bg-bg-primary-themed text-text-muted-themed hover:bg-bg-accent-themed border border-border-primary'
                                }`}
                            >
                                <tile.icon className={`w-6 h-6 mb-2 ${isActive ? 'text-white' : 'text-brand-primary'}`} />
                                <span className="text-[9px] font-black uppercase tracking-tight text-center truncate w-full">{tile.label}</span>
                            </button>
                        );
                    })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};