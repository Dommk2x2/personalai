
import React, { useState } from 'react';
import { UserCredential, Role } from '../types';
import { UserPlusIcon, TrashIcon, EyeIcon, EyeSlashIcon, KeyIcon, SaveIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationModal from './ConfirmationModal';

interface UserManagementProps {
  users: UserCredential[]; // This will be pre-filtered in App.tsx to exclude admin
  onAddUser: (username: string, pass: string) => boolean;
  onDeleteUser: (userId: string) => void;
  onEditPassword: (userId: string, newPassword: string) => boolean;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onDeleteUser, onEditPassword }) => {
  const { currentThemeColors } = useTheme();
  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  const [showEditPasswordFields, setShowEditPasswordFields] = useState(false);
  const [editPasswordError, setEditPasswordError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);


  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError(null);
    if (!newUsername.trim()) {
      setAddUserError("Username cannot be empty.");
      return;
    }
    if (newUserPassword.length < 6) {
      setAddUserError("Password must be at least 6 characters long.");
      return;
    }
    const success = onAddUser(newUsername.trim(), newUserPassword);
    if (success) {
      setNewUsername('');
      setNewUserPassword('');
      setShowNewUserPassword(false);
    }
  };

  const handleEditPasswordClick = (userId: string) => {
    setEditingUserId(userId);
    setEditNewPassword('');
    setEditConfirmPassword('');
    setShowEditPasswordFields(false); // Reset show/hide state
    setEditPasswordError(null);
  };

  const handleSavePassword = (userId: string) => {
    setEditPasswordError(null);
    if (editNewPassword.length < 6) {
      setEditPasswordError("New password must be at least 6 characters long.");
      return;
    }
    if (editNewPassword !== editConfirmPassword) {
      setEditPasswordError("New passwords do not match.");
      return;
    }
    const success = onEditPassword(userId, editNewPassword);
    if (success) {
      setEditingUserId(null); // Close the form
    }
    // Error messages for onEditPassword failure are handled by App.tsx via toast
  };

  const handleCancelEditPassword = () => {
    setEditingUserId(null);
    setEditNewPassword('');
    setEditConfirmPassword('');
    setShowEditPasswordFields(false);
    setEditPasswordError(null);
  };


  const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-bg-secondary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-text-base-themed placeholder-text-muted-themed";
  const labelBaseClasses = "block text-sm font-medium text-text-muted-themed mb-1";

  // Filter out the admin user if it's accidentally passed (though App.tsx should pre-filter)
  const displayableUsers = users.filter(user => !(user.username === 'admin' && user.role === Role.ADMIN));


  return (
    <div className="p-4 sm:p-6 rounded-xl shadow-xl" style={{ backgroundColor: currentThemeColors.bgSecondary }}>
      <h2 className="text-xl sm:text-2xl font-semibold text-text-base-themed mb-6 text-center flex items-center justify-center">
        <UserPlusIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 text-brand-primary" />
        User Management
      </h2>

      {/* Add User Form */}
      <div className="mb-8 p-4 border border-border-secondary rounded-lg" style={{ backgroundColor: currentThemeColors.bgAccent + '33' }}>
        <h3 className="text-lg font-semibold text-text-base-themed mb-3">Add New User</h3>
        <form onSubmit={handleAddUserSubmit} className="space-y-4">
          <div>
            <label htmlFor="newUsername" className={labelBaseClasses}>Username</label>
            <input
              type="text"
              id="newUsername"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className={inputBaseClasses}
              placeholder="Enter new username"
              required
              aria-label="New username"
            />
          </div>
          <div className="relative">
            <label htmlFor="newUserPassword" className={labelBaseClasses}>Password</label>
            <input
              type={showNewUserPassword ? "text" : "password"}
              id="newUserPassword"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              className={inputBaseClasses}
              placeholder="Min. 6 characters"
              required
              aria-label="New user password"
            />
            <button
              type="button"
              onClick={() => setShowNewUserPassword(!showNewUserPassword)}
              className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5"
              aria-label={showNewUserPassword ? "Hide password" : "Show password"}
              style={{ color: currentThemeColors.textMuted }}
            >
              {showNewUserPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          {addUserError && <p className="text-xs" style={{ color: currentThemeColors.expense }}>{addUserError}</p>}
          <button
            type="submit"
            className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-md text-text-inverted hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-bg-secondary-themed transition-all"
            style={{ backgroundColor: currentThemeColors.brandPrimary }}
            aria-label="Add new user"
          >
            <UserPlusIcon className="w-5 h-5 mr-2" /> Add User
          </button>
        </form>
      </div>

      {/* User List */}
      <div>
        <h3 className="text-lg font-semibold text-text-base-themed mb-4">Existing Users</h3>
        {displayableUsers.length > 0 ? (
          <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {displayableUsers.map(user => (
              <li key={user.id} className="p-3 bg-bg-accent-themed rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-text-base-themed">{user.username}</span>
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: currentThemeColors.brandSecondary+'33', color: currentThemeColors.brandSecondary }}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditPasswordClick(user.id)}
                      className="p-1.5 text-text-muted-themed hover:text-brand-secondary hover:bg-brand-secondary/10 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-brand-secondary"
                      aria-label={`Edit password for user ${user.username}`}
                      title="Edit Password"
                    >
                      <KeyIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingUserId(user.id)}
                      className="p-1.5 text-text-muted-themed hover:text-expense hover:bg-expense/10 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-expense"
                      aria-label={`Delete user ${user.username}`}
                      title="Delete User"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {editingUserId === user.id && (
                  <div className="mt-3 pt-3 border-t border-border-secondary space-y-3">
                    <h4 className="text-sm font-medium text-text-muted-themed">Change Password for {user.username}</h4>
                    <div className="relative">
                      <label htmlFor={`edit-new-password-${user.id}`} className={labelBaseClasses}>New Password</label>
                      <input
                        type={showEditPasswordFields ? "text" : "password"}
                        id={`edit-new-password-${user.id}`}
                        value={editNewPassword}
                        onChange={(e) => setEditNewPassword(e.target.value)}
                        className={inputBaseClasses}
                        placeholder="Min. 6 characters"
                        aria-label={`New password for ${user.username}`}
                      />
                    </div>
                    <div className="relative">
                      <label htmlFor={`edit-confirm-password-${user.id}`} className={labelBaseClasses}>Confirm New Password</label>
                      <input
                        type={showEditPasswordFields ? "text" : "password"}
                        id={`edit-confirm-password-${user.id}`}
                        value={editConfirmPassword}
                        onChange={(e) => setEditConfirmPassword(e.target.value)}
                        className={inputBaseClasses}
                        placeholder="Confirm new password"
                        aria-label={`Confirm new password for ${user.username}`}
                      />
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowEditPasswordFields(!showEditPasswordFields)}
                        className="mt-1 text-xs flex items-center"
                        style={{ color: currentThemeColors.textLink }}
                        aria-label={showEditPasswordFields ? "Hide new passwords" : "Show new passwords"}
                      >
                        {showEditPasswordFields ? <EyeSlashIcon className="h-4 w-4 mr-1" /> : <EyeIcon className="h-4 w-4 mr-1" />}
                        {showEditPasswordFields ? "Hide" : "Show"} Passwords
                    </button>

                    {editPasswordError && <p className="text-xs mt-1" style={{ color: currentThemeColors.expense }}>{editPasswordError}</p>}
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleSavePassword(user.id)}
                        className="flex-1 flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-text-inverted hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-secondary dark:focus:ring-offset-bg-accent-themed transition-all"
                        style={{ backgroundColor: currentThemeColors.brandSecondary }}
                        aria-label={`Save new password for ${user.username}`}
                      >
                        <SaveIcon className="w-4 h-4 mr-1" /> Save Password
                      </button>
                      <button
                        onClick={handleCancelEditPassword}
                        className="flex-1 flex items-center justify-center px-3 py-2 border border-border-primary text-xs font-medium rounded-md shadow-sm text-text-base-themed bg-bg-primary-themed hover:bg-bg-secondary-themed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-border-focus dark:focus:ring-offset-bg-accent-themed transition-all"
                        aria-label="Cancel password change"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-text-muted-themed py-4">No dynamically created users yet.</p>
        )}
      </div>

      {deletingUserId && (
        <ConfirmationModal
          isOpen={!!deletingUserId}
          onClose={() => setDeletingUserId(null)}
          onConfirm={() => {
            if (deletingUserId) {
              onDeleteUser(deletingUserId);
              setDeletingUserId(null);
            }
          }}
          title="Delete User"
          message={`Are you sure you want to delete the user "${users.find(u => u.id === deletingUserId)?.username}"? This action cannot be undone.`}
          confirmText="Delete"
          type="danger"
        />
      )}
    </div>
  );
};

export default UserManagement;
