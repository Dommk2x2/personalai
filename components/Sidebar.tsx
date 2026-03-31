import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
    Squares2X2Icon, ChevronLeftIcon, ChevronRightIcon, BanknotesIcon, UserGroupIcon, CalculatorIcon, ListChecksIcon, DocumentChartBarIcon, UserIcon
} from './Icons';
import { SectionKey, AppMode, Role, Transaction, Account, AttendanceEntry, SavedAmortizationSchedule, TodoItem } from '../types';
import { MenuTiles } from './MenuTiles';
import ProfilePicture from './ProfilePicture';
import { SnapshotsStack } from './Snapshots';
import AccountSelector from './AccountSelector';
import { LogoutIcon, CogIcon } from './Icons';

interface SidebarProps {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  visibleSections: Set<SectionKey>;
  showSection: (section: SectionKey) => void;
  onLogout: () => void;
  appTitle: string;
  userName: string;
  userRole: string;
  loggedInRole: Role | null;
  isOpen: boolean;
  onClose: () => void;
  financialMonthStartDay: number;
  financialMonthEndDay: number;
  // Snapshot Data Props
  transactions: Transaction[];
  accounts: Account[];
  activeAccountId: string | null;
  isBalanceVisible: boolean;
  setIsBalanceVisible: (visible: boolean) => void;
  formatCurrency: (amount: number) => string;
  attendanceEntries: AttendanceEntry[];
  savedAmortizationSchedules: SavedAmortizationSchedule[];
  todos: TodoItem[];
  startDate: string | null;
  endDate: string | null;
  onAccountChange: (id: string) => void;
  onAddAccountClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeMode,
  onModeChange,
  visibleSections,
  showSection,
  onLogout,
  appTitle,
  userName,
  userRole,
  loggedInRole,
  isOpen,
  onClose,
  financialMonthStartDay,
  financialMonthEndDay,
  transactions,
  accounts,
  activeAccountId,
  isBalanceVisible,
  setIsBalanceVisible,
  formatCurrency,
  attendanceEntries,
  savedAmortizationSchedules,
  todos,
  startDate,
  endDate,
  onAccountChange,
  onAddAccountClick
}) => {
  const { currentThemeColors } = useTheme();

  return (
    <>
      {/* Overlay Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Content - Right Aligned Drawer */}
      <div 
          className={`fixed right-0 top-0 h-full z-[100] transition-all duration-500 ease-in-out flex flex-col shadow-2xl lg:hidden w-72 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ backgroundColor: '#11101d' }}
      >
        {/* Top Branding Area */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/10 rounded-lg">
               <Squares2X2Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-black text-lg tracking-tighter truncate uppercase">{appTitle}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area within Sidebar */}
        <div className="flex-grow overflow-y-auto no-scrollbar flex flex-col">
            {/* Account Selector - Added for Mobile */}
            <div className="px-3 py-5 border-b border-white/5">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-3 px-1">Select Account</p>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <AccountSelector 
                        selectedAccountId={activeAccountId}
                        onAccountChange={(id) => { onAccountChange(id); onClose(); }}
                        onAddAccountClick={() => { onAddAccountClick(); onClose(); }}
                    />
                </div>
            </div>

            {/* Overall Balance / Snapshots */}
            {activeMode !== AppMode.FINANCE && (
              <div className="px-3 py-4 border-b border-white/5 bg-white/5">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-3 px-1">Performance Summary</p>
                  <SnapshotsStack 
                      activeMode={activeMode}
                      transactions={transactions}
                      accounts={accounts}
                      activeAccountId={activeAccountId}
                      isBalanceVisible={isBalanceVisible}
                      setIsBalanceVisible={setIsBalanceVisible}
                      formatCurrency={formatCurrency}
                      attendanceEntries={attendanceEntries}
                      savedAmortizationSchedules={savedAmortizationSchedules}
                      handleModeChange={onModeChange}
                      handleShowSection={showSection}
                      todos={todos}
                      startDate={startDate}
                      endDate={endDate}
                  />
              </div>
            )}

            {/* Grouped Menu List */}
            <nav className="px-3 py-4 space-y-2">
               <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-3 px-1">Menu Actions</p>
               <MenuTiles 
                    visibleSections={visibleSections} 
                    showSection={(key) => { showSection(key); onClose(); }} 
                    loggedInRole={loggedInRole} 
                    userViewFeatureSettings={{}} 
                    userMenuGroupSettings={{}} 
                    activeMode={activeMode} 
                    activeAccountId={null} 
                    accountSettings={{}} 
                />
            </nav>
        </div>

        {/* Profile Footer */}
        <div className="p-3 mt-auto border-t border-white/5 bg-white/5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 overflow-hidden">
                <ProfilePicture username={userName} size="w-10 h-10" />
                <div className="min-w-0">
                    <p className="text-white text-sm font-black truncate">{userName}</p>
                    <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest truncate">{userRole}</p>
                </div>
              </div>
              <button 
                onClick={() => { showSection('appSettings'); onClose(); }}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
                title="Settings"
              >
                <CogIcon className="w-5 h-5" />
              </button>
            </div>
            
            <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all border border-rose-500/20"
            >
                <LogoutIcon className="w-4 h-4" />
                Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;