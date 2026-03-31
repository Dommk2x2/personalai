
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DayPlannerEntry, PdfTableTheme, PdfPageSize, PdfPageOrientation, PdfTableOverflow } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { PlusIcon, EditIcon, TrashIcon, CheckCircleIcon, CircleIcon, ChevronLeftIcon, ChevronRightIcon, XIcon, SaveIcon, ClipboardDocumentCheckIcon, ClockIcon, ViewColumnsIcon, DownloadIcon } from './Icons';
import { formatDateToYYYYMMDD } from '../utils/dateUtils';
import useLocalStorage from '../hooks/useLocalStorage';
import { LOCAL_STORAGE_PROFILE_PICTURE_KEY } from '../constants';
import { lightenHexColor } from '../utils/colorUtils';
import ConfirmationModal from './ConfirmationModal';

interface DayPlannerComponentProps {
  entries: DayPlannerEntry[];
  onAddEntry: (entryData: Omit<DayPlannerEntry, 'id' | 'accountId' | 'completed' | 'createdAt' | 'isDeleted' | 'deletedAt'>) => void;
  onEditEntry: (id: string, updates: Partial<Omit<DayPlannerEntry, 'id' | 'createdAt'>>) => void;
  onToggleComplete: (id: string) => void;
  onDeleteEntry: (id: string) => void;
  appTitle: string;
  activeAccountName?: string;
}

type PlannerView = 'day' | '3-day' | 'week';
const PIXELS_PER_HOUR = 64;
const TIMELINE_START_HOUR = 6;
const TOTAL_HOURS = 18;

const DayPlannerComponent: React.FC<DayPlannerComponentProps> = ({
  entries,
  onAddEntry,
  onEditEntry,
  onToggleComplete,
  onDeleteEntry,
  appTitle,
  activeAccountName,
}) => {
  const { currentThemeColors } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<DayPlannerEntry | null>(null);
  const [view, setView] = useState<PlannerView>('day');
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [profilePicture] = useLocalStorage<string | null>(LOCAL_STORAGE_PROFILE_PICTURE_KEY, null);
  const [pdfStyle, setPdfStyle] = useState<PdfTableTheme>('grid');
  const [pdfPageSize, setPdfPageSize] = useState<PdfPageSize>('a4');
  const [pdfOrientation, setPdfOrientation] = useState<PdfPageOrientation>('portrait');
  const [pdfOverflow, setPdfOverflow] = useState<PdfTableOverflow>('shrink');

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

  const visibleDates = useMemo(() => {
    const start = new Date(currentDate);
    if (view === 'week') {
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
    }
    const dates: Date[] = [];
    const count = view === 'day' ? 1 : view === '3-day' ? 3 : 7;
    for (let i = 0; i < count; i++) {
      const newDate = new Date(start);
      newDate.setDate(start.getDate() + i);
      dates.push(newDate);
    }
    return dates;
  }, [currentDate, view]);

  const visibleDateStrings = useMemo(() => visibleDates.map(formatDateToYYYYMMDD), [visibleDates]);

  const entriesForView = useMemo(() => {
    const dateSet = new Set(visibleDateStrings);
    return (entries ?? []).filter(entry => dateSet.has(entry.date) && !entry.isDeleted);
  }, [entries, visibleDateStrings]);

  const changeDate = (offset: number) => {
    const multiplier = view === 'day' ? 1 : view === '3-day' ? 3 : 7;
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (offset * multiplier));
      return newDate;
    });
  };

  const handleOpenModal = (entry: DayPlannerEntry | null = null, date?: Date) => {
    setEntryToEdit(entry);
    if (!entry && date) {
      setCurrentDate(date);
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEntryToEdit(null);
  };

  const handleSaveEntry = (formData: Omit<DayPlannerEntry, 'id' | 'accountId' | 'completed' | 'createdAt' | 'isDeleted' | 'deletedAt'>) => {
    if (entryToEdit) {
      onEditEntry(entryToEdit.id, formData);
    } else {
      onAddEntry(formData);
    }
    handleCloseModal();
  };
  
  const headerDateDisplay = useMemo(() => {
    if (visibleDates.length === 0) return '';
    if (view === 'day') {
      return visibleDates[0].toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    const start = visibleDates[0];
    const end = visibleDates[visibleDates.length - 1];
    return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }, [visibleDates, view]);

  const handleDownloadPdf = () => {
    if (entriesForView.length === 0) {
      alert("No entries in the current view to download.");
      return;
    }

    const doc = new jsPDF({ orientation: pdfOrientation, format: pdfPageSize });

    if (profilePicture) {
        try {
            const imageType = profilePicture.startsWith('data:image/png') ? 'PNG' : 'JPEG';
            let imgWidth = 15; let imgHeight = 15;
            const imgProps = doc.getImageProperties(profilePicture);
            const aspectRatio = imgProps.width / imgProps.height;
            if (aspectRatio > 1) { imgHeight = 15 / aspectRatio; } else { imgWidth = 15 * aspectRatio; }
            const xPos = doc.internal.pageSize.width - 14 - imgWidth;
            doc.addImage(profilePicture, imageType, xPos, 14, imgWidth, imgHeight);
        } catch (e) { console.error("Could not add profile picture to PDF:", e); }
    }
    const reportTitle = `${appTitle} - Day Planner`;
    const dateSubTitle = `Period: ${headerDateDisplay}`;
    const generatedDateTime = new Date().toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

    doc.setFontSize(16);
    doc.text(reportTitle, 14, 18);
    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text(dateSubTitle, 14, 24);
    if (activeAccountName) { doc.text(`Account: ${activeAccountName}`, 14, 29); }
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Report Generated: ${generatedDateTime}`, 14, 34);

    const tableColumn = ["Date", "Start Time", "End Time", "Title", "Notes", "Status"];
    const tableRows: string[][] = [];

    const sortedEntriesForPdf = [...entriesForView].sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.startTime);
        const dateB = new Date(b.date + 'T' + b.startTime);
        return dateA.getTime() - dateB.getTime();
    });

    sortedEntriesForPdf.forEach(entry => {
        tableRows.push([
            formatDateToYYYYMMDD(new Date(entry.date + 'T00:00:00')),
            entry.startTime,
            entry.endTime,
            entry.title,
            entry.notes || '-',
            entry.completed ? 'Completed' : 'Pending'
        ]);
    });

    let columnStyles: { [key: number]: any } = {
        0: { cellWidth: 25 }, 1: { cellWidth: 20 }, 2: { cellWidth: 20 }, 5: { cellWidth: 20 },
    };
    if (pdfOverflow === 'wrap') {
        columnStyles[3] = { cellWidth: 40 };
        columnStyles[4] = { cellWidth: 'wrap' };
    } else {
        columnStyles[3] = { cellWidth: 'auto' };
        columnStyles[4] = { cellWidth: 'auto' };
    }


    autoTable(doc, {
        head: [tableColumn], body: tableRows, startY: 40,
        theme: pdfStyle === 'financial' ? 'plain' : pdfStyle,
        headStyles: { fillColor: currentThemeColors.brandPrimary },
        styles: { overflow: pdfOverflow === 'wrap' ? 'linebreak' : 'ellipsize' },
        columnStyles: columnStyles,
        didParseCell: (data: any) => {
            if (data.section === 'body') {
                const entry = sortedEntriesForPdf[data.row.index];
                if (pdfStyle === 'financial' && entry?.completed) {
                    data.cell.styles.fillColor = lightenHexColor(currentThemeColors.income, 0.1);
                }
                if (data.column.index === 5) {
                    data.cell.styles.textColor = data.cell.raw === 'Completed' ? currentThemeColors.income : currentThemeColors.expense;
                }
            }
        }
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8); doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
        doc.text(reportTitle, 14, doc.internal.pageSize.height - 10);
    }

    doc.save(`DayPlanner_${headerDateDisplay.replace(/ /g, '_')}.pdf`);
  };

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i + TIMELINE_START_HOUR);

  const timeToPixels = (time: string): number => {
      const [hour, minute] = time.split(':').map(Number);
      const totalMinutes = (hour - TIMELINE_START_HOUR) * 60 + minute;
      return (totalMinutes / 60) * PIXELS_PER_HOUR;
  };

  const durationToPixels = (startTime: string, endTime: string): number => {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
      return Math.max(0, (durationMinutes / 60) * PIXELS_PER_HOUR);
  };

  const selectClasses = "text-xs p-1.5 border rounded-md bg-bg-primary-themed border-border-primary text-text-base-themed";

  return (
    <div className="p-4 sm:p-6 rounded-xl shadow-lg flex flex-col" style={{ backgroundColor: currentThemeColors.bgSecondary }}>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-bg-accent-themed"><ChevronLeftIcon /></button>
            <span className="font-semibold text-base sm:text-lg text-center">{headerDateDisplay}</span>
            <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-bg-accent-themed"><ChevronRightIcon /></button>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            {(['day', '3-day', 'week'] as PlannerView[]).map(v => (
                 <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-xs rounded-full ${view === v ? 'bg-brand-primary text-white' : 'bg-bg-accent-themed hover:opacity-80'}`}>{v}</button>
            ))}
            <button onClick={() => handleOpenModal(null, currentDate)} className="ml-2 flex items-center px-3 py-1.5 text-sm font-medium rounded-lg shadow-md text-text-inverted hover:opacity-90" style={{ backgroundColor: currentThemeColors.brandPrimary }}>
                <PlusIcon className="w-4 h-4 mr-1" /> Add
            </button>
            <select value={pdfPageSize} onChange={e => setPdfPageSize(e.target.value as PdfPageSize)} className={selectClasses}><option value="a4">A4</option><option value="a3">A3</option><option value="letter">Letter</option><option value="legal">Legal</option></select>
            <select value={pdfOrientation} onChange={e => setPdfOrientation(e.target.value as PdfPageOrientation)} className={selectClasses}><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select>
            <select value={pdfOverflow} onChange={e => setPdfOverflow(e.target.value as PdfTableOverflow)} className={selectClasses}><option value="shrink">Shrink</option><option value="wrap">Wrap</option></select>
            <button onClick={handleDownloadPdf} className="flex items-center px-3 py-1.5 text-sm font-medium rounded-lg shadow-md text-text-inverted hover:opacity-90" style={{ backgroundColor: currentThemeColors.brandSecondary }}>
                <DownloadIcon className="w-4 h-4 mr-1" /> PDF
            </button>
          </div>
      </div>
     
      <div className="flex flex-col flex-grow">
        <div className="flex sticky top-0 z-20" style={{ backgroundColor: currentThemeColors.bgSecondary }}>
          <div className="w-14 flex-shrink-0 border-r border-b" style={{ borderColor: currentThemeColors.borderSecondary }}></div>
          <div className="flex-grow grid" style={{ gridTemplateColumns: `repeat(${visibleDates.length}, 1fr)`}}>
            {visibleDates.map(date => {
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div key={date.toISOString()} className={`text-center py-2 border-b border-l ${isToday ? 'is-today' : ''}`} style={{ borderColor: currentThemeColors.borderSecondary }}>
                  <p className="text-xs sm:text-sm font-semibold">{date.toLocaleDateString(undefined, { weekday: 'short' })}</p>
                  <p className={`day-number text-lg sm:text-xl font-bold ${isToday ? 'text-brand-primary' : 'text-text-base-themed'}`}>{date.getDate()}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-grow overflow-y-auto" style={{ height: `${TOTAL_HOURS * PIXELS_PER_HOUR}px` }}>
          <div className="w-14 flex-shrink-0 relative">
            {hours.map(hour => (
              <div key={hour} className="relative" style={{ height: `${PIXELS_PER_HOUR}px` }}>
                <span className="absolute -top-2.5 left-2 px-1 text-xs" style={{ backgroundColor: currentThemeColors.bgSecondary, color: currentThemeColors.textMuted }}>
                  {hour % 12 === 0 ? 12 : hour % 12} {hour < 12 || hour === 24 ? 'AM' : 'PM'}
                </span>
              </div>
            ))}
          </div>
          <div className="flex-grow grid relative" style={{ gridTemplateColumns: `repeat(${visibleDates.length}, 1fr)` }}>
            {visibleDates.map((_, index) => (
              <div key={index} className="border-l" style={{ borderColor: currentThemeColors.borderSecondary }}>
                {hours.map(hour => (
                  <div key={hour} className="border-t" style={{ height: `${PIXELS_PER_HOUR}px`, borderColor: currentThemeColors.borderSecondary }}></div>
                ))}
              </div>
            ))}

            {entriesForView.map(entry => {
              const dayIndex = visibleDateStrings.indexOf(entry.date);
              if (dayIndex === -1) return null;

              const top = timeToPixels(entry.startTime);
              const height = durationToPixels(entry.startTime, entry.endTime);
              const left = (dayIndex / visibleDates.length) * 100;
              const width = (1 / visibleDates.length) * 100;

              return (
                <div
                    key={entry.id}
                    className="absolute p-2 rounded-lg shadow-sm overflow-hidden transition-all duration-200"
                    style={{
                        top: `${top}px`, height: `${height}px`, left: `${left}%`, width: `calc(${width}% - 4px)`, marginLeft: '2px',
                        backgroundColor: entry.completed ? `${currentThemeColors.income}2A` : currentThemeColors.bgAccent,
                        borderLeft: `4px solid ${entry.completed ? currentThemeColors.income : currentThemeColors.brandSecondary}`,
                        opacity: entry.completed ? 0.7 : 1
                    }}
                >
                    <div className="h-full flex flex-col justify-between">
                        <div className="flex-grow">
                            <p className={`font-semibold text-sm ${entry.completed ? 'line-through' : ''}`} style={{color: currentThemeColors.textBase}}>
                                {entry.title}
                            </p>
                            <p className="text-xs" style={{color: currentThemeColors.textMuted}}>{entry.startTime} - {entry.endTime}</p>
                            {entry.reminderDateTime && !entry.completed && (
                                <div className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full" style={{backgroundColor: `${currentThemeColors.brandSecondary}2A`}}>
                                    <ClockIcon className="w-3 h-3 flex-shrink-0" style={{color: currentThemeColors.brandSecondary}}/>
                                    <span style={{color: currentThemeColors.brandSecondary}}>
                                        {formatReminderDate(entry.reminderDateTime)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => onToggleComplete(entry.id)} className="p-1 hover:opacity-75" title={entry.completed ? 'Mark as active' : 'Mark as complete'}>{entry.completed ? <CheckCircleIcon className="w-4 h-4 text-income" /> : <CircleIcon className="w-4 h-4 text-text-muted-themed"/>}</button>
                            <button onClick={() => handleOpenModal(entry)} className="p-1 text-text-muted-themed hover:text-brand-primary"><EditIcon className="w-4 h-4" /></button>
                            <button onClick={() => setDeletingEntryId(entry.id)} className="p-1 text-text-muted-themed hover:text-expense"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <EntryModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveEntry}
          entry={entryToEdit}
          selectedDate={formatDateToYYYYMMDD(currentDate)}
        />
      )}
      <ConfirmationModal
        isOpen={!!deletingEntryId}
        onClose={() => setDeletingEntryId(null)}
        onConfirm={() => {
          if (deletingEntryId) {
            onDeleteEntry(deletingEntryId);
            setDeletingEntryId(null);
          }
        }}
        title="Delete Planner Entry"
        message="Are you sure you want to delete this planner entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

const EntryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<DayPlannerEntry, 'id' | 'accountId' | 'completed' | 'createdAt' | 'isDeleted' | 'deletedAt'>) => void;
  entry: DayPlannerEntry | null;
  selectedDate: string;
}> = ({ isOpen, onClose, onSave, entry, selectedDate }) => {
    const { currentThemeColors } = useTheme();
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(selectedDate);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [hasReminder, setHasReminder] = useState(false);
    const [reminderDateTime, setReminderDateTime] = useState('');

    useEffect(() => {
        setTitle(entry?.title || '');
        setNotes(entry?.notes || '');
        setDate(entry?.date || selectedDate);
        setStartTime(entry?.startTime || '09:00');
        setEndTime(entry?.endTime || '10:00');
        setHasReminder(!!entry?.reminderDateTime);

        let reminderForInput = '';
        if (entry?.reminderDateTime) {
            const localDate = new Date(entry.reminderDateTime);
            const year = localDate.getFullYear();
            const month = String(localDate.getMonth() + 1).padStart(2, '0');
            const day = String(localDate.getDate()).padStart(2, '0');
            const hours = String(localDate.getHours()).padStart(2, '0');
            const minutes = String(localDate.getMinutes()).padStart(2, '0');
            reminderForInput = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
        setReminderDateTime(reminderForInput);
    }, [entry, selectedDate]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && startTime && endTime && endTime > startTime) {
            onSave({ 
                title, notes, date, startTime, endTime,
                reminderDateTime: hasReminder && reminderDateTime ? new Date(reminderDateTime).toISOString() : null 
            });
        } else {
            alert("Please fill in a title and ensure the end time is after the start time.");
        }
    };

    if (!isOpen) return null;

    const inputClasses = "mt-1 block w-full px-3 py-2 bg-bg-primary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-text-base-themed dark:[color-scheme:light]";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-modal-enter" onClick={onClose}>
            <div className="w-full max-w-md p-6 rounded-xl shadow-2xl" style={{ backgroundColor: currentThemeColors.bgSecondary }} onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-semibold mb-4">{entry ? 'Edit Entry' : 'Add New Entry'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium">Title</label>
                        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium">Notes (optional)</label>
                        <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} className={inputClasses} rows={3}></textarea>
                    </div>
                     <div>
                        <label htmlFor="date" className="block text-sm font-medium">Date</label>
                        <input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClasses} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium">Start Time</label>
                            <input id="startTime" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputClasses} required />
                        </div>
                        <div>
                            <label htmlFor="endTime" className="block text-sm font-medium">End Time</label>
                            <input id="endTime" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputClasses} required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="has-reminder-checkbox" className="flex items-center space-x-2 cursor-pointer">
                            <input
                                id="has-reminder-checkbox" type="checkbox" checked={hasReminder} onChange={(e) => setHasReminder(e.target.checked)}
                                className="h-4 w-4 rounded border-border-primary focus:ring-brand-primary"
                                style={{ color: currentThemeColors.brandPrimary }}
                            />
                            <span className="text-sm font-medium">Set Reminder</span>
                        </label>
                        {hasReminder && (
                            <input
                                type="datetime-local" value={reminderDateTime} onChange={(e) => setReminderDateTime(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)} className={`${inputClasses} mt-2`}
                            />
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg" style={{backgroundColor: currentThemeColors.bgAccent}}>Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm rounded-lg text-text-inverted" style={{backgroundColor: currentThemeColors.brandPrimary}}>
                            <SaveIcon className="w-4 h-4 inline-block mr-1.5" />{entry ? 'Save Changes' : 'Add Entry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DayPlannerComponent;
