import React, { useState } from 'react';
import { FestiveDate } from '../../types';
import { SparklesIcon, PlusIcon, TrashIcon } from '../Icons';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDateDisplay } from '../../utils/dateUtils';

interface CelebrationSettingsProps {
    festiveDates: FestiveDate[];
    onAddFestiveDate: (date: string, name: string) => void;
    onDeleteFestiveDate: (id: string) => void;
}

const CelebrationSettings: React.FC<CelebrationSettingsProps> = ({
    festiveDates,
    onAddFestiveDate,
    onDeleteFestiveDate,
}) => {
    const { currentThemeColors } = useTheme();
    const [newDate, setNewDate] = useState('');
    const [newName, setNewName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddFestiveDate(newDate, newName);
        setNewDate('');
        setNewName('');
    };
    
    const sortedDates = [...festiveDates].sort((a,b) => a.date.localeCompare(b.date));

    const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-bg-primary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-text-base-themed placeholder-text-muted-themed dark:[color-scheme:light]";
    const labelBaseClasses = "block text-sm font-medium text-text-muted-themed";

    return (
        <div className="space-y-6">
            <h4 className="text-md font-semibold mb-3 text-left flex items-center" style={{ color: currentThemeColors.textBase }}>
                <SparklesIcon className="w-5 h-5 mr-2 text-brand-primary" /> Custom Celebration Dates
            </h4>
            <p className="text-xs text-text-muted-themed -mt-4">
                Set custom dates to show a festive animation in the header. Great for birthdays, anniversaries, or personal holidays!
            </p>

            <form onSubmit={handleSubmit} className="p-4 border border-border-secondary rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="sm:col-span-1">
                    <label htmlFor="celebration-date" className={labelBaseClasses}>Date</label>
                    <input type="date" id="celebration-date" value={newDate} onChange={e => setNewDate(e.target.value)} className={inputBaseClasses} required/>
                </div>
                <div className="sm:col-span-1">
                    <label htmlFor="celebration-name" className={labelBaseClasses}>Celebration Name</label>
                    <input type="text" id="celebration-name" value={newName} onChange={e => setNewName(e.target.value)} className={inputBaseClasses} placeholder="e.g., Happy Birthday!" required />
                </div>
                <button type="submit" className="w-full flex items-center justify-center px-4 py-2.5 bg-brand-primary text-text-inverted rounded-lg shadow-md hover:opacity-90">
                    <PlusIcon className="w-5 h-5 mr-2"/> Add
                </button>
            </form>

            <div>
                <h5 className="text-sm font-semibold mb-2 text-text-muted-themed">Scheduled Celebrations</h5>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {sortedDates.length > 0 ? (
                        sortedDates.map(d => (
                            <div key={d.id} className="flex justify-between items-center p-2.5 bg-bg-primary-themed rounded-lg shadow-sm">
                                <div>
                                    <p className="font-medium text-text-base-themed">{d.name}</p>
                                    <p className="text-sm" style={{ color: currentThemeColors.brandSecondary }}>{formatDateDisplay(d.date)}</p>
                                </div>
                                <button
                                    onClick={() => onDeleteFestiveDate(d.id)}
                                    className="p-1.5 text-text-muted-themed hover:text-expense hover:bg-expense/10 rounded-lg"
                                    aria-label={`Delete celebration ${d.name}`}
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-text-muted-themed text-center py-4">No custom celebrations scheduled.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CelebrationSettings;
