import React, { useState, useEffect, useCallback } from 'react';
import { TodoItem } from '../types';
import { PlusIcon, TrashIcon, ListChecksIcon, CheckCircleIcon, CircleIcon, ClockIcon, EditIcon, SaveIcon, XIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationModal from './ConfirmationModal';

interface TodoListComponentProps {
  todos: TodoItem[];
  onAddTodo: (text: string, reminderDateTime: string | null) => void;
  onEditTodo: (id: string, updates: { text: string; reminderDateTime: string | null }) => void;
  onToggleComplete: (id: string) => void;
  onDeleteTodo: (id: string) => void;
}

const TodoListComponent: React.FC<TodoListComponentProps> = ({
  todos,
  onAddTodo,
  onEditTodo,
  onToggleComplete,
  onDeleteTodo,
}) => {
  const { currentThemeColors } = useTheme();
  const [newTodoText, setNewTodoText] = useState('');
  const [addReminder, setAddReminder] = useState(false);
  const [newReminderDateTime, setNewReminderDateTime] = useState('');

  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const [editedReminderDateTime, setEditedReminderDateTime] = useState<string>('');
  const [deletingTodo, setDeletingTodo] = useState<TodoItem | null>(null);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const calculateTimeLeft = useCallback((isoString: string | null | undefined): { text: string; color: string } => {
    if (!isoString) return { text: '', color: '' };

    const now = currentTime;
    const reminderDate = new Date(isoString);
    const diff = reminderDate.getTime() - now.getTime();

    if (diff <= 0) {
        return { text: 'Overdue', color: currentThemeColors.expense };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    let text = '';
    let color = currentThemeColors.textMuted;

    if (days > 1) {
        text = `in ${days} days`;
        color = days <= 3 ? currentThemeColors.brandSecondary : currentThemeColors.textMuted;
    } else if (days === 1) {
        text = 'in 1 day';
        color = currentThemeColors.brandSecondary;
    } else if (hours > 0) {
        text = `in ${hours} hr${hours > 1 ? 's' : ''}`;
        color = currentThemeColors.brandSecondary;
    } else if (minutes > 0) {
        text = `in ${minutes} min${minutes > 1 ? 's' : ''}`;
        color = currentThemeColors.expense;
    } else {
        text = 'Due now';
        color = currentThemeColors.expense;
    }
    
    return { text, color };
  }, [currentTime, currentThemeColors]);


  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim() === '') return;
    const reminder = addReminder && newReminderDateTime ? new Date(newReminderDateTime).toISOString() : null;
    onAddTodo(newTodoText.trim(), reminder);
    setNewTodoText('');
    setAddReminder(false);
    setNewReminderDateTime('');
  };

  const handleStartEdit = (todo: TodoItem) => {
    setEditingTodoId(todo.id);
    setEditedText(todo.text);
    let reminderForInput = '';
    if (todo.reminderDateTime) {
      const localDate = new Date(todo.reminderDateTime);
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');
      const hours = String(localDate.getHours()).padStart(2, '0');
      const minutes = String(localDate.getMinutes()).padStart(2, '0');
      reminderForInput = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    setEditedReminderDateTime(reminderForInput);
  };
  
  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setEditedText('');
    setEditedReminderDateTime('');
  };

  const handleSaveEdit = () => {
    if (!editingTodoId || editedText.trim() === '') return;
    onEditTodo(editingTodoId, {
      text: editedText.trim(),
      reminderDateTime: editedReminderDateTime ? new Date(editedReminderDateTime).toISOString() : null,
    });
    handleCancelEdit();
  };

  const formatReminderDate = (isoString: string | null | undefined): string => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const safeTodos = todos ?? [];
  const activeTodos = safeTodos.filter(todo => !todo.completed).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const completedTodos = safeTodos.filter(todo => todo.completed).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const renderTodoItem = (todo: TodoItem) => {
    const isEditing = editingTodoId === todo.id;
    const timeLeft = calculateTimeLeft(todo.reminderDateTime);

    if (isEditing) {
      return (
        <li
          key={todo.id}
          className="p-3 rounded-xl shadow-md border-2"
          style={{ backgroundColor: currentThemeColors.bgAccent, borderColor: currentThemeColors.brandPrimary }}
        >
          <div className="flex items-center gap-2 mb-2">
            <input 
              type="text"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="flex-grow px-3 py-2 bg-bg-primary-themed border border-border-primary rounded-lg text-sm"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2 mb-3">
             <ClockIcon className="w-4 h-4 text-text-muted-themed" />
             <input
                type="datetime-local"
                value={editedReminderDateTime}
                onChange={(e) => setEditedReminderDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="flex-grow px-3 py-2 bg-bg-primary-themed border border-border-primary rounded-lg text-sm text-text-muted-themed dark:[color-scheme:dark]"
             />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={handleCancelEdit} className="px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg bg-bg-accent-themed">Cancel</button>
            <button onClick={handleSaveEdit} className="px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg bg-brand-primary text-white shadow-lg">Save</button>
          </div>
        </li>
      );
    }

    return (
      <li
        key={todo.id}
        className="flex flex-col items-start p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-150 border border-border-primary"
        style={{ backgroundColor: todo.completed ? `${currentThemeColors.bgAccent}50` : 'white' }}
      >
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center flex-grow min-w-0">
                <button
                onClick={() => onToggleComplete(todo.id)}
                className="p-1 mr-2 sm:mr-3 rounded-full hover:opacity-75 transition-opacity"
                style={{ color: todo.completed ? currentThemeColors.income : currentThemeColors.textMuted }}
                aria-label={todo.completed ? `Mark task "${todo.text}" as incomplete` : `Mark task "${todo.text}" as complete`}
                >
                {todo.completed ? <CheckCircleIcon className="w-6 h-6"/> : <CircleIcon className="w-6 h-6"/>}
                </button>
                <span
                className={`text-sm sm:text-base font-bold tracking-tight truncate ${todo.completed ? 'line-through text-text-muted-themed' : 'text-text-base-themed'}`}
                title={todo.text}
                >
                {todo.text}
                </span>
            </div>
            <div className="flex items-center flex-shrink-0">
                {!todo.completed && <button onClick={() => handleStartEdit(todo)} className="p-1.5 ml-2 text-text-muted-themed hover:text-brand-primary transition-colors"><EditIcon className="w-4 h-4" /></button>}
                <button onClick={() => setDeletingTodo(todo)} className="p-1.5 ml-1 text-text-muted-themed hover:text-expense transition-colors" aria-label={`Delete task: ${todo.text}`}><TrashIcon className="w-4 h-4" /></button>
            </div>
        </div>
        {todo.reminderDateTime && !todo.completed && (
            <div className="flex items-center text-[10px] font-black uppercase tracking-widest mt-2 pl-10">
                <ClockIcon className="w-3.5 h-3.5 mr-1.5" style={{color: currentThemeColors.brandSecondary}}/>
                <span style={{color: currentThemeColors.brandSecondary}}>{formatReminderDate(todo.reminderDateTime)}</span>
                {timeLeft.text && (
                    <span className="ml-2" style={{ color: timeLeft.color }}>
                        [{timeLeft.text}]
                    </span>
                )}
            </div>
        )}
      </li>
    );
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl shadow-lg border border-border-primary bg-bg-secondary-themed">
      <h2 className="text-xl sm:text-2xl font-black text-text-base-themed mb-8 text-center flex items-center justify-center uppercase tracking-tighter">
        <div className="p-2 bg-brand-primary/10 rounded-lg mr-3">
            <ListChecksIcon className="w-6 h-6 text-brand-primary" />
        </div>
        Quest Log
      </h2>

      <form 
        onSubmit={handleAddTodo} 
        className="mb-8 p-4 sm:p-6 rounded-2xl border relative overflow-hidden"
        style={{ 
            backgroundColor: `${currentThemeColors.brandPrimary}08`, 
            borderColor: `${currentThemeColors.brandPrimary}20`,
            backgroundImage: `linear-gradient(135deg, ${currentThemeColors.brandPrimary}05 0%, ${currentThemeColors.brandPrimary}15 100%)`
        }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
            <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="What needs doing today?"
                className="flex-grow px-4 py-3 bg-bg-primary-themed border border-border-primary rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm font-bold placeholder-text-muted-themed"
                aria-label="New to-do task"
            />
            <button
                type="submit"
                className="px-6 py-3 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center"
                style={{ backgroundColor: currentThemeColors.brandPrimary, boxShadow: `0 10px 15px -3px ${currentThemeColors.brandPrimary}40` }}
            >
                <PlusIcon className="w-5 h-5 mr-2" /> Add Task
            </button>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label htmlFor="add-reminder-checkbox" className="flex items-center space-x-3 cursor-pointer group">
                <input
                    id="add-reminder-checkbox"
                    type="checkbox"
                    checked={addReminder}
                    onChange={(e) => setAddReminder(e.target.checked)}
                    className="sr-only peer"
                />
                <div 
                    className="w-6 h-6 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary group-hover:scale-110"
                    style={{ borderColor: currentThemeColors.borderPrimary }}
                >
                    <svg className="w-4 h-4 text-white hidden peer-checked:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted-themed">Set Alert</span>
            </label>
            {addReminder && (
                <input
                    type="datetime-local"
                    value={newReminderDateTime}
                    onChange={(e) => setNewReminderDateTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="flex-grow px-3 py-2 bg-bg-primary-themed border border-border-primary rounded-lg shadow-sm text-xs font-bold text-text-muted-themed dark:[color-scheme:dark]"
                />
            )}
        </div>
      </form>

      <div className="space-y-6">
          {activeTodos.length > 0 ? (
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted-themed mb-3 ml-1">Current Quests ({activeTodos.length})</h3>
              <ul className="space-y-2">
                {activeTodos.map(renderTodoItem)}
              </ul>
            </div>
          ) : safeTodos.length > 0 && activeTodos.length === 0 ? (
              <div className="text-center py-6">
                  <CheckCircleIcon className="w-10 h-10 mx-auto text-income opacity-30 mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted-themed">All tasks completed! Nice work.</p>
              </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-2xl border-border-primary">
                <ListChecksIcon className="w-12 h-12 mx-auto text-text-muted-themed mb-2 opacity-50" />
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted-themed">Your list is clear</p>
            </div>
          )}

          {completedTodos.length > 0 && (
            <div className="pt-6 border-t border-border-primary">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted-themed mb-3 ml-1 opacity-50">Archive ({completedTodos.length})</h3>
              <ul className="space-y-2">
                {completedTodos.map(renderTodoItem)}
              </ul>
            </div>
          )}
      </div>

      {deletingTodo && (
        <ConfirmationModal
          isOpen={!!deletingTodo}
          onClose={() => setDeletingTodo(null)}
          onConfirm={() => {
            if (deletingTodo) {
              onDeleteTodo(deletingTodo.id);
              setDeletingTodo(null);
            }
          }}
          title="Delete Task"
          message={`Are you sure you want to delete the task "${deletingTodo.text}"?`}
          confirmText="Delete"
          type="danger"
        />
      )}
    </div>
  );
};

export default TodoListComponent;