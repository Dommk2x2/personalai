import React, { useState } from 'react';
import { EditIcon, TrashIcon, PlusIcon, CogIcon, IncomeIcon, ExpenseIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme
import ConfirmationModal from './ConfirmationModal';

interface CategoryManagerProps {
  incomeCategories: string[];
  expenseCategories: string[];
  onAddIncomeCategory: (name: string) => void;
  onEditIncomeCategory: (oldName: string, newName: string) => void;
  onDeleteIncomeCategory: (name: string) => void;
  onAddExpenseCategory: (name: string) => void;
  onEditExpenseCategory: (oldName: string, newName: string) => void;
  onDeleteExpenseCategory: (name: string) => void;
}

type CategoryType = 'income' | 'expense';

const CategoryManager: React.FC<CategoryManagerProps> = ({
  incomeCategories,
  expenseCategories,
  onAddIncomeCategory,
  onEditIncomeCategory,
  onDeleteIncomeCategory,
  onAddExpenseCategory,
  onEditExpenseCategory,
  onDeleteExpenseCategory,
}) => {
  const { currentThemeColors } = useTheme();
  const [newIncomeCategory, setNewIncomeCategory] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ type: CategoryType; name: string } | null>(null);
  const [editedName, setEditedName] = useState('');
  const [deletingCategory, setDeletingCategory] = useState<{ type: CategoryType; name: string } | null>(null);

  const handleAddCategory = (type: CategoryType) => {
    if (type === 'income') {
      if (newIncomeCategory.trim() && !incomeCategories.includes(newIncomeCategory.trim())) {
        onAddIncomeCategory(newIncomeCategory.trim());
        setNewIncomeCategory('');
      } else if (incomeCategories.includes(newIncomeCategory.trim())) {
        alert('This income category already exists.');
      }
    } else {
      if (newExpenseCategory.trim() && !expenseCategories.includes(newExpenseCategory.trim())) {
        onAddExpenseCategory(newExpenseCategory.trim());
        setNewExpenseCategory('');
      } else if (expenseCategories.includes(newExpenseCategory.trim())) {
        alert('This expense category already exists.');
      }
    }
  };

  const startEdit = (type: CategoryType, name: string) => {
    setEditingCategory({ type, name });
    setEditedName(name);
  };

  const handleEditCategory = () => {
    if (!editingCategory || !editedName.trim()) return;

    const { type, name: oldName } = editingCategory;
    const newName = editedName.trim();

    if (newName === oldName) {
      setEditingCategory(null);
      return;
    }

    const currentList = type === 'income' ? incomeCategories : expenseCategories;
    if (currentList.includes(newName)) {
      alert(`Category "${newName}" already exists.`);
      return;
    }

    if (type === 'income') {
      onEditIncomeCategory(oldName, newName);
    } else {
      onEditExpenseCategory(oldName, newName);
    }
    setEditingCategory(null);
  };

  const handleDeleteCategory = (type: CategoryType, name: string) => {
    setDeletingCategory({ type, name });
  };

  const confirmDeleteCategory = () => {
    if (!deletingCategory) return;
    const { type, name } = deletingCategory;
    if (type === 'income') {
      onDeleteIncomeCategory(name);
    } else {
      onDeleteExpenseCategory(name);
    }
    setDeletingCategory(null);
  };

  const inputBaseClasses = "flex-grow mt-1 block w-full px-3 py-2 bg-bg-secondary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-text-base-themed placeholder-text-muted-themed";
  
  const renderCategoryList = (type: CategoryType, categories: string[]) => (
    <ul className="space-y-2 mt-4">
      {[...categories].sort((a, b) => a.localeCompare(b)).map(cat => (
        <li key={cat} className="flex justify-between items-center p-2.5 bg-bg-secondary-themed rounded-xl shadow-sm border border-border-primary transition-all hover:shadow-md">
          <span className="text-text-base-themed text-xs font-black uppercase tracking-tight">{cat}</span>
          <div className="flex gap-1">
            <button
              onClick={() => startEdit(type, cat)}
              className="p-1.5 text-text-muted-themed hover:text-brand-primary transition-colors"
              aria-label={`Edit category ${cat}`}
            >
              <EditIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteCategory(type, cat)}
              className="p-1.5 text-text-muted-themed hover:text-expense transition-colors"
              aria-label={`Delete category ${cat}`}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </li>
      ))}
      {categories.length === 0 && <p className="text-[10px] font-black uppercase text-text-muted-themed text-center py-4">No categories added</p>}
    </ul>
  );

  return (
    <div className="bg-bg-secondary-themed p-4 sm:p-6 rounded-xl shadow-lg border border-border-secondary">
      <h2 className="text-xl sm:text-2xl font-black text-text-base-themed mb-8 text-center flex items-center justify-center uppercase tracking-tighter">
        <div className="p-2 bg-brand-primary/10 rounded-lg mr-3">
            <CogIcon className="w-6 h-6 text-brand-primary" />
        </div>
        Category Management
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Categories Section */}
        <div className="space-y-4 p-4 sm:p-6 border rounded-2xl transition-all" style={{ backgroundColor: `${currentThemeColors.income}08`, borderColor: `${currentThemeColors.income}20` }}>
          <div className="flex items-center gap-3 mb-2">
             <div className="p-1.5 bg-bg-secondary-themed rounded-lg shadow-sm">
                <IncomeIcon className="w-5 h-5" style={{ color: currentThemeColors.income }} />
             </div>
             <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: currentThemeColors.income }}>Income Sources</h3>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newIncomeCategory}
              onChange={(e) => setNewIncomeCategory(e.target.value)}
              placeholder="Source Name"
              className={inputBaseClasses}
            />
            <button
              onClick={() => handleAddCategory('income')}
              className="px-4 py-2 text-white rounded-xl shadow-lg hover:opacity-90 transition-all flex-shrink-0"
              style={{ backgroundColor: currentThemeColors.income }}
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
          {renderCategoryList('income', incomeCategories)}
        </div>

        {/* Expense Categories Section */}
        <div className="space-y-4 p-4 sm:p-6 border rounded-2xl transition-all" style={{ backgroundColor: `${currentThemeColors.expense}08`, borderColor: `${currentThemeColors.expense}20` }}>
          <div className="flex items-center gap-3 mb-2">
             <div className="p-1.5 bg-bg-secondary-themed rounded-lg shadow-sm">
                <ExpenseIcon className="w-5 h-5" style={{ color: currentThemeColors.expense }} />
             </div>
             <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: currentThemeColors.expense }}>Spending types</h3>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newExpenseCategory}
              onChange={(e) => setNewExpenseCategory(e.target.value)}
              placeholder="Category Name"
              className={inputBaseClasses}
            />
            <button
              onClick={() => handleAddCategory('expense')}
              className="px-4 py-2 text-white rounded-xl shadow-lg hover:opacity-90 transition-all flex-shrink-0"
              style={{ backgroundColor: currentThemeColors.expense }}
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
          {renderCategoryList('expense', expenseCategories)}
        </div>
      </div>

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[200] transition-opacity">
          <div className="bg-bg-secondary-themed p-6 rounded-2xl shadow-2xl w-full max-w-md border border-brand-primary/20 animate-modal-enter">
            <h3 className="text-lg font-black text-text-base-themed mb-6 uppercase tracking-tight flex items-center gap-2">
              <EditIcon className="w-5 h-5 text-brand-primary" />
              Edit Category
            </h3>
            <div className="space-y-4">
                <p className="text-xs font-bold text-text-muted-themed uppercase tracking-widest">Renaming: "{editingCategory.name}"</p>
                <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className={inputBaseClasses}
                    autoFocus
                />
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={() => setEditingCategory(null)} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-text-muted-themed bg-bg-accent-themed rounded-xl">Cancel</button>
              <button onClick={handleEditCategory} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-white bg-brand-primary rounded-xl shadow-lg">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {deletingCategory && (
        <ConfirmationModal
          isOpen={!!deletingCategory}
          onClose={() => setDeletingCategory(null)}
          onConfirm={confirmDeleteCategory}
          title="Delete Category"
          message={`Are you sure you want to delete the category "${deletingCategory.name}"? This action cannot be undone and might affect existing transactions.`}
          confirmText="Delete"
          type="danger"
        />
      )}
    </div>
  );
};

export default CategoryManager;