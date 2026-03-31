import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MenuItem, ToastType, PdfPageSize, PdfPageOrientation, PdfTableOverflow } from '../types';
import { EditIcon, TrashIcon, PlusIcon, SaveIcon, XIcon, ClipboardListIcon, DownloadIcon, EyeIcon, DocumentChartBarIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { LOCAL_STORAGE_PROFILE_PICTURE_KEY } from '../constants';
import ConfirmationModal from './ConfirmationModal';

interface MenuItemManagerProps {
  menuItems: MenuItem[];
  onAddMenuItem: (accountId: string, name: string, price: number) => void;
  onEditMenuItem: (id: string, updates: Partial<Omit<MenuItem, 'id' | 'accountId'>>) => void;
  onDeleteMenuItem: (id: string) => void;
  activeAccountId: string | null;
  activeAccountName?: string;
  addToast: (message: string, type: ToastType) => void;
  // Added missing appTitle prop
  appTitle: string;
}

const MenuItemManager: React.FC<MenuItemManagerProps> = ({
  menuItems,
  onAddMenuItem,
  onEditMenuItem,
  onDeleteMenuItem,
  activeAccountId,
  activeAccountName,
  addToast,
  // Destructured appTitle from props to fix the error on line 197
  appTitle,
}) => {
  const { currentThemeColors } = useTheme();
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedPrice, setEditedPrice] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);

  const [pdfPageSize, setPdfPageSize] = useState<PdfPageSize>('a4');
  const [pdfOrientation, setPdfOrientation] = useState<PdfPageOrientation>('portrait');
  const [pdfOverflow, setPdfOverflow] = useState<PdfTableOverflow>('shrink');
  const [profilePicture] = useLocalStorage<string | null>(LOCAL_STORAGE_PROFILE_PICTURE_KEY, null);
  
  const itemsForCurrentAccount = menuItems.filter(item => item.accountId === activeAccountId);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAccountId) {
      addToast("Please select an account first.", "warning");
      return;
    }
    const price = parseFloat(newItemPrice);
    if (newItemName.trim() && !isNaN(price) && price >= 0) {
      onAddMenuItem(activeAccountId, newItemName.trim(), price);
      setNewItemName('');
      setNewItemPrice('');
    } else {
      addToast("Please enter a valid name and a non-negative price.", "warning");
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingItem(item);
    setEditedName(item.name);
    setEditedPrice(String(item.price));
  };

  const handleEditItem = () => {
    if (!editingItem) return;
    const price = parseFloat(editedPrice);
    if (editedName.trim() && !isNaN(price) && price >= 0) {
      onEditMenuItem(editingItem.id, { name: editedName.trim(), price });
      setEditingItem(null);
    } else {
      addToast("Please enter a valid name and price for the item.", "warning");
    }
  };
  
  const handleDeleteItem = (item: MenuItem) => {
      onDeleteMenuItem(item.id);
  };

  const addPdfFooter = (doc: jsPDF, title: string) => {
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
      doc.text(title, 14, doc.internal.pageSize.height - 10);
    }
  };

  const handleDownloadPdf = () => {
    if (itemsForCurrentAccount.length === 0) {
      addToast('No menu items to export.', 'info');
      return;
    }

    const doc = new jsPDF({
      orientation: pdfOrientation,
      unit: 'mm',
      format: pdfPageSize,
    });
    
    if (profilePicture) {
        try {
            const imageType = profilePicture.startsWith('data:image/png') ? 'PNG' : 'JPEG';
            let imgWidth = 15;
            let imgHeight = 15;
            try {
                const imgProps = doc.getImageProperties(profilePicture);
                const aspectRatio = imgProps.width / imgProps.height;
                if (aspectRatio > 1) { imgHeight = 15 / aspectRatio; } else { imgWidth = 15 * aspectRatio; }
            } catch(e) {
                console.warn("Could not get image properties for PDF, using default 1:1 aspect ratio.", e);
            }
            const xPos = doc.internal.pageSize.width - 14 - imgWidth;
            doc.addImage(profilePicture, imageType, xPos, 14, imgWidth, imgHeight);
        } catch (e) {
            console.error("Could not add profile picture to PDF:", e);
        }
    }

    const reportTitle = `Item Menu for ${activeAccountName || 'Selected Account'}`;
    const generatedOn = `Generated on: ${new Date().toLocaleString()}`;

    doc.setFontSize(16);
    doc.text(reportTitle, 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(generatedOn, 14, 23);

    const tableColumn = ["Item Name", "Price (INR)"];
    const tableRows = itemsForCurrentAccount.map(item => [
      item.name,
      new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.price),
    ]);

    let columnStyles = {};
    if (pdfOverflow === 'wrap') {
      columnStyles = { 0: { cellWidth: 'auto' }, 1: { cellWidth: 40 } };
    }

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: currentThemeColors.brandPrimary },
      columnStyles,
    });

    addPdfFooter(doc, reportTitle);

    const fileNameSafeAccountName = (activeAccountName || 'menu').replace(/\s+/g, '_');
    doc.save(`Item_Menu_${fileNameSafeAccountName}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const inputBaseClasses = "flex-grow mt-1 block w-full px-3 py-2 bg-bg-secondary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-text-base-themed placeholder-text-muted-themed";

  if (!activeAccountId) {
    return (
      <div className="bg-bg-secondary-themed p-6 rounded-xl shadow-lg text-center">
        <p className="text-text-muted-themed">Please select an account to manage its item menu.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary-themed p-4 sm:p-6 rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-text-base-themed flex items-center justify-center">
          <ClipboardListIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 text-brand-primary" />
          Manage Item Menu
        </h2>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => setIsPreviewModalOpen(true)}
            className="flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-md text-text-inverted hover:opacity-90"
            style={{ backgroundColor: currentThemeColors.brandSecondary }}
          >
            <EyeIcon className="w-4 h-4 mr-1" /> Preview
          </button>
          <button onClick={handleDownloadPdf} className="p-2.5 rounded-lg shadow-md text-text-inverted hover:opacity-90" style={{ backgroundColor: '#475569' }} title="Download as PDF">
              <DownloadIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Add New Item Form */}
      <form onSubmit={handleAddItem} className="mb-8 p-4 border border-border-secondary rounded-lg flex flex-col sm:flex-row items-start gap-4">
        <div className="flex-grow w-full">
            <label htmlFor="newItemName" className="block text-sm font-medium text-text-muted-themed">Item Name</label>
            <input
                type="text"
                id="newItemName"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g., Coffee"
                className={inputBaseClasses}
            />
        </div>
        <div className="w-full sm:w-48">
            <label htmlFor="newItemPrice" className="block text-sm font-medium text-text-muted-themed">Default Price</label>
            <input
                type="number"
                id="newItemPrice"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={inputBaseClasses}
            />
        </div>
        <button
            type="submit"
            className="w-full sm:w-auto mt-2 sm:mt-6 px-4 py-2.5 text-text-inverted rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 dark:focus:ring-offset-bg-secondary-themed transition-all"
            style={{ backgroundColor: currentThemeColors.brandPrimary }}
        >
            <PlusIcon className="w-5 h-5" />
        </button>
      </form>

      {/* Item List */}
      <div className="space-y-3">
        {itemsForCurrentAccount.map(item => (
            <div key={item.id} className="p-3 bg-bg-accent-themed/50 rounded-lg shadow-sm">
                {editingItem?.id === item.id ? (
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                        <input type="text" value={editedName} onChange={e => setEditedName(e.target.value)} className={`${inputBaseClasses} flex-grow`} />
                        <input type="number" value={editedPrice} onChange={e => setEditedPrice(e.target.value)} className={`${inputBaseClasses} w-32`} min="0" step="0.01" />
                        <div className="flex gap-2">
                            <button onClick={handleEditItem} className="p-2 text-income hover:bg-income/10 rounded-lg"><SaveIcon className="w-4 h-4"/></button>
                            <button onClick={() => setEditingItem(null)} className="p-2 text-text-muted-themed hover:bg-bg-secondary-themed rounded-lg"><XIcon className="w-4 h-4"/></button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-text-base-themed font-medium">{item.name}</p>
                            <p className="text-sm" style={{color: currentThemeColors.brandSecondary}}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.price)}</p>
                        </div>
                        <div className="space-x-2">
                            <button onClick={() => startEdit(item)} className="p-1.5 text-text-muted-themed hover:text-brand-primary hover:bg-bg-accent-themed rounded-lg"><EditIcon className="w-4 h-4" /></button>
                            <button onClick={() => setDeletingItem(item)} className="p-1.5 text-text-muted-themed hover:text-expense hover:bg-red-500/10 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
            </div>
        ))}
        {itemsForCurrentAccount.length === 0 && (
            <p className="text-center text-text-muted-themed py-4">No menu items defined for this account yet.</p>
        )}
      </div>

      {isPreviewModalOpen && (
          <ReportPreviewModal
            isOpen={isPreviewModalOpen}
            onClose={() => setIsPreviewModalOpen(false)}
            items={itemsForCurrentAccount}
            title={`${appTitle} - Item Catalog Preview`}
            onDownload={handleDownloadPdf}
            accountName={activeAccountName}
          />
      )}
      <ConfirmationModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => {
          if (deletingItem) {
            onDeleteMenuItem(deletingItem.id);
            setDeletingItem(null);
            addToast(`Item "${deletingItem.name}" deleted.`, "success");
          }
        }}
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

const ReportPreviewModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    items: MenuItem[];
    title: string;
    onDownload: () => void;
    accountName?: string;
}> = ({ isOpen, onClose, items, title, onDownload, accountName }) => {
    const { currentThemeColors } = useTheme();
    if (!isOpen) return null;

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-modal-enter overflow-hidden border border-slate-200 dark:border-slate-800"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <DocumentChartBarIcon className="w-6 h-6 text-brand-primary" />
                        <div>
                            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{title}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{accountName || 'Catalogue'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <XIcon className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="flex-grow overflow-auto p-4">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead className="sticky top-0 bg-bg-accent-themed z-10">
                            <tr>
                                <th className="p-3 border-b border-border-secondary">Item Name</th>
                                <th className="p-3 border-b border-border-secondary text-right">Default Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id} className="hover:bg-bg-accent-themed/30 border-b border-border-secondary transition-colors">
                                    <td className="p-3 font-bold text-text-base-themed">{item.name}</td>
                                    <td className="p-3 text-right font-black text-brand-secondary">{formatCurrency(item.price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">Close</button>
                    <button onClick={() => { onDownload(); onClose(); }} className="px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
                        <DownloadIcon className="w-4 h-4 mr-2 inline-block"/> Download as PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuItemManager;