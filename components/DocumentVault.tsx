
import React, { useState, useRef, useMemo } from 'react';
import { VaultItem, ToastType } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { PhotoIcon, ArrowUpTrayIcon as UploadIcon, TrashIcon, XIcon, DocumentIcon, ShieldCheckIcon, ArrowsPointingOutIcon } from './Icons';
import { formatDateDisplay } from '../utils/dateUtils';
import ConfirmationModal from './ConfirmationModal';

interface DocumentVaultProps {
  vaultItems: VaultItem[];
  onAddItem: (name: string, dataUrl: string, mimeType: string, isPrivate: boolean) => void;
  onDeleteItem: (id: string) => void;
  addToast: (message: string, type: ToastType) => void;
  onUnlockRequest: (onSuccess: () => void) => void;
  isVaultUnlocked: boolean;
  appPin: string | null;
  onPopOut?: (title: string, component: React.ReactNode) => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const TARGET_IMAGE_DIMENSION = 800; // Resize to max 800px on the longest side

const DocumentVault: React.FC<DocumentVaultProps> = ({
  vaultItems,
  onAddItem,
  onDeleteItem,
  addToast,
  onUnlockRequest,
  isVaultUnlocked,
  appPin,
  onPopOut
}) => {
  const { currentThemeColors } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrivateUpload, setIsPrivateUpload] = useState(false);
  const [filter, setFilter] = useState<'all' | 'photos' | 'documents'>('all');
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];

    if (file.size > MAX_FILE_SIZE_BYTES) {
      addToast(`File is too large. Max size is ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`, "error");
      return;
    }
    
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        if (file.type.startsWith('image/')) {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                if (width > height) {
                    if (width > TARGET_IMAGE_DIMENSION) {
                        height = Math.round(height * (TARGET_IMAGE_DIMENSION / width));
                        width = TARGET_IMAGE_DIMENSION;
                    }
                } else {
                    if (height > TARGET_IMAGE_DIMENSION) {
                        width = Math.round(width * (TARGET_IMAGE_DIMENSION / height));
                        height = TARGET_IMAGE_DIMENSION;
                    }
                }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                    onAddItem(file.name, resizedDataUrl, 'image/jpeg', isPrivateUpload);
                }
                setIsLoading(false);
            };
            img.src = dataUrl;
        } else {
            // For non-image files, just save the original dataUrl
            onAddItem(file.name, dataUrl, file.type, isPrivateUpload);
            setIsLoading(false);
        }
    };
    reader.onerror = () => {
        addToast("Error reading file.", "error");
        setIsLoading(false);
    }
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleItemClick = (item: VaultItem) => {
    if (item.isPrivate && !isVaultUnlocked) {
      addToast("PIN required to view private files.", "info");
      onUnlockRequest(() => setSelectedItem(item));
    } else {
      setSelectedItem(item);
    }
  };
  
  const handlePrivacyToggleClick = () => {
    if (!appPin) {
        addToast("Please set an App PIN in Settings to use the private vault feature.", "info");
    }
  };

  const filteredItems = useMemo(() => {
    return (vaultItems ?? [])
      .filter(item => {
        if (filter === 'all') return true;
        if (filter === 'photos') return item.mimeType.startsWith('image/');
        if (filter === 'documents') return !item.mimeType.startsWith('image/');
        return false;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [vaultItems, filter]);

  return (
    <div className="p-4 sm:p-6 rounded-xl shadow-lg" style={{ backgroundColor: currentThemeColors.bgSecondary }}>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-text-base-themed flex items-center">
          <PhotoIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 text-brand-primary" />
          Document Vault
        </h2>
        <div className="flex items-center gap-2">
            <label 
                className="flex items-center gap-2 text-sm cursor-pointer" 
                title={!appPin ? "Set an App PIN in Settings to enable privacy." : ""}
                onClick={handlePrivacyToggleClick}
            >
                <input
                    type="checkbox"
                    checked={isPrivateUpload}
                    onChange={(e) => setIsPrivateUpload(e.target.checked)}
                    disabled={!appPin}
                    className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary disabled:opacity-50"
                    style={{ pointerEvents: !appPin ? 'none' : 'auto' }}
                />
                <span className={`flex items-center gap-1 ${!appPin ? 'opacity-50' : ''}`}>
                    <ShieldCheckIcon className="w-4 h-4"/> Make Private
                </span>
            </label>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg shadow-md text-text-inverted hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: currentThemeColors.brandPrimary }}
            >
                {isLoading ? 'Processing...' : <><UploadIcon className="w-5 h-5 mr-2" /> Upload File</>}
            </button>
        </div>
      </div>
      
      <div className="mb-4 border-b border-border-secondary flex items-center gap-4">
        {(['all', 'photos', 'documents'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`py-2 px-1 text-sm font-medium border-b-2 capitalize ${filter === f ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-muted-themed hover:border-border-primary'}`}>
                {f}
            </button>
        ))}
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-lg overflow-hidden shadow-md cursor-pointer bg-bg-primary-themed flex items-center justify-center"
              onClick={() => handleItemClick(item)}
            >
              {item.mimeType.startsWith('image/') ? (
                <img src={item.dataUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
              ) : (
                <DocumentIcon className="w-16 h-16 text-text-muted-themed"/>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              {item.isPrivate && (
                <div className="absolute top-2 left-2 p-1 bg-black/50 rounded-full" title="Private">
                    <ShieldCheckIcon className="w-4 h-4 text-white"/>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onPopOut && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onPopOut(item.name, (
                        <div className="flex items-center justify-center p-4">
                          {item.mimeType.startsWith('image/') ? (
                            <img src={item.dataUrl} alt={item.name} className="max-w-full h-auto rounded-lg shadow-lg" />
                          ) : item.mimeType === 'application/pdf' ? (
                            <iframe src={item.dataUrl} className="w-full h-[500px] border-0 rounded-lg" title={item.name} />
                          ) : (
                            <div className="flex flex-col items-center gap-4 py-10">
                              <DocumentIcon className="w-20 h-20 text-slate-300" />
                              <p className="text-sm text-slate-500">Preview not available for this file type.</p>
                              <a href={item.dataUrl} download={item.name} className="px-4 py-2 bg-brand-primary text-white rounded-lg text-xs font-bold uppercase tracking-widest">Download</a>
                            </div>
                          )}
                        </div>
                      ));
                    }}
                    className="p-1.5 bg-white/90 dark:bg-slate-800/90 text-brand-primary rounded-lg shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    title="Pop Out"
                  >
                    <ArrowsPointingOutIcon className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); setDeletingItemId(item.id); }}
                  className="p-1.5 bg-white/90 dark:bg-slate-800/90 text-red-500 rounded-lg shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                <p className="text-xs font-semibold truncate" title={item.name}>{item.name}</p>
                <p className="text-[10px] opacity-80">{formatDateDisplay(item.date)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed rounded-xl" style={{ borderColor: currentThemeColors.borderSecondary }}>
          <PhotoIcon className="w-16 h-16 mx-auto text-text-disabled mb-4" />
          <p className="text-lg font-semibold text-text-base-themed">This space is empty</p>
          <p className="text-sm text-text-muted-themed">Upload some files to get started.</p>
        </div>
      )}

      {selectedItem && (
        <FileViewerModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onDelete={(id) => setDeletingItemId(id)} 
        />
      )}

      {deletingItemId && (
        <ConfirmationModal
          isOpen={!!deletingItemId}
          onClose={() => setDeletingItemId(null)}
          onConfirm={() => {
            if (deletingItemId) {
              onDeleteItem(deletingItemId);
              setDeletingItemId(null);
              setSelectedItem(null);
            }
          }}
          title="Delete Document"
          message={`Are you sure you want to delete "${vaultItems.find(i => i.id === deletingItemId)?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          type="danger"
        />
      )}
    </div>
  );
};

const FileViewerModal: React.FC<{item: VaultItem, onClose: () => void, onDelete: (id: string) => void}> = ({ item, onClose, onDelete }) => {
    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-modal-enter" onClick={onClose}>
            <div className="relative max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {item.mimeType.startsWith('image/') ? (
                    <img src={item.dataUrl} alt={item.name} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
                ) : (
                    <div className="bg-bg-secondary p-8 rounded-lg shadow-2xl text-center">
                        <DocumentIcon className="w-24 h-24 mx-auto text-text-muted-themed mb-4"/>
                        <a href={item.dataUrl} download={item.name} className="px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:opacity-90">
                            Download "{item.name}"
                        </a>
                    </div>
                )}
                <div className="flex justify-between items-center p-4 bg-black/50 rounded-b-lg text-white">
                    <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-sm opacity-90">{formatDateDisplay(item.date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {item.isPrivate && <div title="This file is private"><ShieldCheckIcon className="w-5 h-5" /></div>}
                        <button onClick={() => { onDelete(item.id); onClose(); }} className="p-2 bg-red-500/80 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                        <button onClick={onClose} className="p-2 bg-white/20 rounded-full"><XIcon className="w-5 h-5"/></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentVault;
