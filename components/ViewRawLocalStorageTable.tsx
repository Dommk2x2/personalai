
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { DatabaseIcon, TrashIcon, RestoreIcon, EditIcon, SaveIcon, XIcon, DownloadIcon, LockClosedIcon, KeyIcon, ShieldCheckIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import { hexToRgba } from '../utils/colorUtils';
import { LOCAL_STORAGE_DATABASE_PASSWORD_KEY } from '../constants';

const APP_KEY_PREFIX = 'financeTracker';

interface ViewRawLocalStorageTableProps {
    dbMasterKey: string | null;
    setDbMasterKey: (key: string | null) => void;
}

export const ViewRawLocalStorageTable: React.FC<ViewRawLocalStorageTableProps> = ({ dbMasterKey, setDbMasterKey }) => {
    const { currentThemeColors, theme } = useTheme();
    const [isUnlocked, setIsUnlocked] = useState(false);
    
    // Auth State
    const [inputKey, setInputKey] = useState('');
    const [authError, setAuthError] = useState(false);
    
    // Table State
    const [storageItems, setStorageItems] = useState<{ key: string, value: string, size: number }[]>([]);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [viewingKey, setViewingKey] = useState<string | null>(null);

    const refreshStorage = useCallback(() => {
        const items = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith(APP_KEY_PREFIX) || key === 'financeTrackerLoggedInUser')) {
                const value = localStorage.getItem(key) || '';
                items.push({
                    key,
                    value,
                    size: new Blob([value]).size
                });
            }
        }
        setStorageItems(items.sort((a, b) => a.key.localeCompare(b.key)));
    }, []);

    useEffect(() => {
        if (isUnlocked) {
            refreshStorage();
        }
    }, [isUnlocked, refreshStorage]);

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (dbMasterKey === null) {
            // First time setup
            if (inputKey.length >= 6) {
                setDbMasterKey(inputKey);
                setIsUnlocked(true);
            } else {
                setAuthError(true);
            }
        } else {
            // Standard check
            if (inputKey === dbMasterKey) {
                setIsUnlocked(true);
                setAuthError(false);
            } else {
                setAuthError(true);
                setTimeout(() => setAuthError(false), 500);
            }
        }
    };

    const handleEditClick = (key: string, value: string) => {
        setEditingKey(key);
        setEditValue(value);
    };

    const handleSaveEdit = () => {
        if (!editingKey) return;
        try {
            JSON.parse(editValue); // Basic validation
            localStorage.setItem(editingKey, editValue);
            setEditingKey(null);
            refreshStorage();
            alert(`Key "${editingKey}" updated successfully.`);
        } catch (e) {
            alert("Invalid JSON data. Please check your formatting.");
        }
    };

    const handleDeleteKey = (key: string) => {
        if (window.confirm(`Are you sure you want to PERMANENTLY delete the storage key "${key}"? This will cause immediate data loss for that feature.`)) {
            localStorage.removeItem(key);
            refreshStorage();
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const totalSize = useMemo(() => storageItems.reduce((sum, item) => sum + item.size, 0), [storageItems]);

    // --- RENDER LOGIN SCREEN ---
    if (!isUnlocked) {
        return (
            <div className="p-4 sm:p-12 rounded-xl shadow-2xl flex flex-col items-center justify-center min-h-[400px]" 
                 style={{ backgroundColor: theme.mode === 'dark' ? '#0f172a' : '#f1f5f9' }}>
                <div className={`p-4 rounded-full mb-6 ${authError ? 'animate-shake' : ''}`} 
                     style={{ backgroundColor: authError ? hexToRgba(currentThemeColors.expense, 0.2) : hexToRgba(currentThemeColors.brandPrimary, 0.1) }}>
                    <ShieldCheckIcon className="w-16 h-16" style={{ color: authError ? currentThemeColors.expense : currentThemeColors.brandPrimary }} />
                </div>
                
                <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: currentThemeColors.textBase }}>
                    {dbMasterKey === null ? 'Create Master Database Key' : 'Database Authentication'}
                </h2>
                <p className="text-sm text-text-muted-themed mb-8 text-center max-w-sm">
                    {dbMasterKey === null 
                        ? 'Set a master key (min 6 characters) to restrict access to the raw application tables.'
                        : 'Please enter your Master Key to inspect the back-end tables.'}
                </p>

                <form onSubmit={handleAuth} className="w-full max-w-xs space-y-4">
                    <div className="relative">
                        <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted-themed" />
                        <input 
                            type="password" 
                            value={inputKey}
                            onChange={e => setInputKey(e.target.value)}
                            placeholder={dbMasterKey === null ? "New Master Key" : "Enter Master Key"}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border-2 bg-bg-primary-themed focus:outline-none focus:ring-2"
                            style={{ 
                                borderColor: authError ? currentThemeColors.expense : currentThemeColors.borderPrimary,
                                color: currentThemeColors.textBase,
                                '--focus-ring-color': currentThemeColors.brandPrimary
                            } as any}
                            autoFocus
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full py-3 rounded-lg font-bold text-white shadow-lg transition-all active:scale-95"
                        style={{ backgroundColor: currentThemeColors.brandPrimary }}
                    >
                        {dbMasterKey === null ? 'Set Key & Enter' : 'Unlock System'}
                    </button>
                    <p className="text-[10px] uppercase tracking-widest text-center text-text-muted-themed">
                        Hardware Encrypted Session
                    </p>
                </form>

                <style>{`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-5px); }
                        75% { transform: translateX(5px); }
                    }
                    .animate-shake { animation: shake 0.2s ease-in-out infinite; }
                `}</style>
            </div>
        );
    }

    // --- RENDER MAIN TABLE ---
    return (
        <div className="p-4 sm:p-6 rounded-xl shadow-lg animate-fade-in" style={{ backgroundColor: currentThemeColors.bgSecondary }}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold flex items-center" style={{ color: currentThemeColors.textBase }}>
                    <DatabaseIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 text-brand-primary" />
                    Advanced Database Inspector
                </h2>
                <button 
                    onClick={() => setIsUnlocked(false)}
                    className="flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-text-muted-themed hover:bg-bg-accent-themed"
                >
                    <LockClosedIcon className="w-4 h-4 mr-1.5"/>
                    Lock Table
                </button>
            </div>

            <div className="mb-6 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4" style={{ backgroundColor: currentThemeColors.bgAccent }}>
                <div>
                    <p className="text-sm text-text-muted-themed">Total Application Data Stored</p>
                    <p className="text-2xl font-bold" style={{ color: currentThemeColors.brandPrimary }}>{formatSize(totalSize)}</p>
                </div>
                <button 
                    onClick={refreshStorage}
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-sm text-text-inverted bg-brand-secondary hover:opacity-90"
                >
                    <RestoreIcon className="w-4 h-4 mr-2" />
                    Refresh Data
                </button>
            </div>

            <div className="overflow-x-auto border rounded-lg" style={{ borderColor: currentThemeColors.borderSecondary }}>
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase" style={{ backgroundColor: currentThemeColors.bgAccent, color: currentThemeColors.textBase }}>
                        <tr>
                            <th className="px-4 py-3">Storage Key</th>
                            <th className="px-4 py-3 text-right">Size</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {storageItems.map((item) => (
                            <tr key={item.key} className="border-b hover:bg-bg-accent-themed/30" style={{ borderColor: currentThemeColors.borderSecondary }}>
                                <td className="px-4 py-3 font-mono text-xs text-text-base-themed">{item.key}</td>
                                <td className="px-4 py-3 text-right text-text-muted-themed">{formatSize(item.size)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => setViewingKey(viewingKey === item.key ? null : item.key)}
                                            className="p-1.5 text-text-muted-themed hover:text-brand-primary"
                                            title="View Raw Data"
                                        >
                                            <DatabaseIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleEditClick(item.key, item.value)}
                                            className="p-1.5 text-text-muted-themed hover:text-brand-secondary"
                                            title="Manual Restore / Edit"
                                        >
                                            <EditIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteKey(item.key)}
                                            className="p-1.5 text-text-muted-themed hover:text-expense"
                                            title="Delete Key"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Viewing Modal/Panel */}
            {viewingKey && (
                <div className="mt-6 p-4 rounded-lg border-2 animate-fade-in" style={{ borderColor: currentThemeColors.brandPrimary }}>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-sm">Raw JSON: {viewingKey}</h4>
                        <button onClick={() => setViewingKey(null)} className="text-text-muted-themed hover:text-expense"><XIcon className="w-5 h-5"/></button>
                    </div>
                    <pre className="p-3 bg-black text-green-500 rounded-md text-xs overflow-auto max-h-60 whitespace-pre-wrap font-mono">
                        {localStorage.getItem(viewingKey)}
                    </pre>
                </div>
            )}

            {/* Editing Modal */}
            {editingKey && (
                <div className="fixed inset-0 bg-black/60 z-[250] flex items-center justify-center p-4 animate-modal-enter">
                    <div className="w-full max-w-2xl p-6 rounded-xl shadow-2xl flex flex-col" style={{ backgroundColor: currentThemeColors.bgSecondary }}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Edit/Restore Storage Key</h3>
                            <button onClick={() => setEditingKey(null)}><XIcon className="w-6 h-6"/></button>
                        </div>
                        <p className="text-sm text-text-muted-themed mb-4">
                            <strong>Key:</strong> <span className="font-mono text-brand-primary">{editingKey}</span>
                            <br/>
                            Warning: Manually editing data can crash the application if the JSON structure is invalid.
                        </p>
                        <textarea 
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="flex-grow min-h-[300px] p-3 font-mono text-xs bg-bg-primary-themed border rounded-lg focus:outline-none focus:ring-2"
                            style={{ borderColor: currentThemeColors.borderPrimary, '--focus-ring-color': currentThemeColors.brandPrimary } as any}
                            placeholder="Paste JSON here for recovery..."
                        />
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setEditingKey(null)} className="px-4 py-2 text-sm rounded-lg" style={{ backgroundColor: currentThemeColors.bgAccent }}>Cancel</button>
                            <button onClick={handleSaveEdit} className="px-6 py-2 text-sm font-bold text-white rounded-lg shadow-md" style={{ backgroundColor: currentThemeColors.brandSecondary }}>
                                <SaveIcon className="w-4 h-4 mr-2 inline-block"/>
                                Commit Changes to Storage
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
