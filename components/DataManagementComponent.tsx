// components/DataManagementComponent.tsx
// This component has been redesigned to be a more comprehensive Backup & Restore page.
import React, { useState } from 'react';
import { DatabaseIcon, DownloadIcon, FolderOpenIcon as UploadIcon, AlertTriangleIcon, ShareIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import { ToastType } from '../types';
import { hexToRgba } from '../utils/colorUtils';
import ConfirmationModal from './ConfirmationModal';

interface DataManagementComponentProps {
  onExportAllData: () => void;
  onImportData: () => void;
  onClearAllData: () => void;
  addToast: (message: string, type: ToastType) => void;
}

const ActionCard: React.FC<{
  title: string;
  description: string;
  buttonText: string;
  onAction: () => void;
  icon: React.FC<any>;
  color: string;
  textColor: string;
}> = ({ title, description, buttonText, onAction, icon: Icon, color, textColor }) => {
  const { currentThemeColors } = useTheme();

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 rounded-lg text-center" style={{ backgroundColor: currentThemeColors.bgAccent }}>
      <div className="p-3 rounded-full mb-3" style={{ backgroundColor: hexToRgba(color, 0.15) }}>
        <Icon className="w-8 h-8" style={{ color }} />
      </div>
      <h4 className="font-semibold text-lg mb-2" style={{ color: currentThemeColors.textBase }}>{title}</h4>
      <p className="text-sm text-text-muted-themed flex-grow mb-4">{description}</p>
      <button
        onClick={onAction}
        className="w-full max-w-xs flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out hover:shadow-lg"
        style={{
          backgroundColor: color,
          color: textColor,
          '--focus-ring-color': color,
          '--focus-ring-offset-color': currentThemeColors.bgPrimary
        } as React.CSSProperties}
      >
        <Icon className="w-5 h-5 mr-2" />
        {buttonText}
      </button>
    </div>
  );
};

export const DataManagementComponent: React.FC<DataManagementComponentProps> = ({
  onExportAllData,
  onImportData,
  onClearAllData,
}) => {
  const { currentThemeColors } = useTheme();
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  return (
    <div className="p-4 sm:p-6 rounded-xl shadow-lg" style={{ backgroundColor: currentThemeColors.bgSecondary }}>
      <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center flex items-center justify-center" style={{ color: currentThemeColors.textBase }}>
        <DatabaseIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 text-brand-primary" />
        Backup, Restore & Reset
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActionCard
          title="Create Full Backup"
          description="Download a complete backup of all data (accounts, transactions, settings) as a single JSON file. Store this file in a safe place."
          buttonText="Export Data"
          onAction={onExportAllData}
          icon={DownloadIcon}
          color={currentThemeColors.brandPrimary}
          textColor={currentThemeColors.textInverted}
        />
        <ActionCard
          title="Restore from Backup"
          description="Upload a previously saved backup file (.json). This will overwrite all current data in the application."
          buttonText="Import Data"
          onAction={() => setIsImportModalOpen(true)}
          icon={UploadIcon}
          color={currentThemeColors.brandSecondary}
          textColor={currentThemeColors.textInverted}
        />
      </div>

      <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: currentThemeColors.bgAccent }}>
        <h4 className="font-semibold text-lg mb-3 flex items-center" style={{ color: currentThemeColors.textBase }}>
          <ShareIcon className="w-5 h-5 mr-2" style={{color: currentThemeColors.brandSecondary}} />
          Cloud Drive Backup Guide (Manual)
        </h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-text-muted-themed">
          <li>Click <strong>"Export Data"</strong> to download your backup file.</li>
          <li>Open your preferred cloud storage (e.g., Google Drive, Dropbox, OneDrive).</li>
          <li>Upload the downloaded <code>.json</code> file to a secure folder in your cloud storage.</li>
          <li>To restore, download the file from your cloud storage to your device, then use the <strong>"Import Data"</strong> option here.</li>
        </ol>
      </div>

      <div className="mt-8 p-4 rounded-lg border-2" style={{ borderColor: hexToRgba(currentThemeColors.expense, 0.4) }}>
        <h4 className="font-semibold text-lg mb-2 flex items-center" style={{ color: currentThemeColors.expense }}>
          <AlertTriangleIcon className="w-5 h-5 mr-2" />
          Danger Zone
        </h4>
        <p className="text-sm mb-4" style={{ color: currentThemeColors.textMuted }}>
          This action is irreversible and will permanently delete all application data from your browser.
        </p>
        <button
          onClick={() => setIsClearModalOpen(true)}
          className="w-full max-w-xs flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out"
          style={{
            backgroundColor: currentThemeColors.expense,
            color: currentThemeColors.textInverted,
            '--focus-ring-color': currentThemeColors.expense,
            '--focus-ring-offset-color': currentThemeColors.bgPrimary
          } as React.CSSProperties}
        >
          <AlertTriangleIcon className="w-5 h-5 mr-2" />
          Reset Application Data
        </button>
      </div>

      <ConfirmationModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={() => {
          onClearAllData();
          setIsClearModalOpen(false);
        }}
        title="Reset Application Data"
        message="Are you absolutely sure you want to reset all application data? This will permanently delete all your accounts, transactions, budgets, categories, and settings. This action cannot be undone."
        confirmText="Reset Everything"
        type="danger"
      />

      <ConfirmationModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onConfirm={() => {
          setIsImportModalOpen(false);
          onImportData();
        }}
        title="Restore from Backup"
        message="This will overwrite all current application data with the data from the backup file you select. Are you sure you want to proceed?"
        confirmText="Proceed to Select File"
        type="warning"
      />
    </div>
  );
};
