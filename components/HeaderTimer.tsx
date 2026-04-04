
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useTimer } from '../contexts/TimerContext';
import { ClockIcon, PlayIcon, PauseIcon, ArrowPathIcon, XIcon, PlusIcon, CheckCircleIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, CogIcon, SaveIcon } from './Icons';
import { hexToRgba } from '../utils/colorUtils';
import { useFirestoreDocumentSync } from '../hooks/useFirestoreDocumentSync';
import { LOCAL_STORAGE_TIMER_TITLE_KEY, LOCAL_STORAGE_TIMER_BG_COLOR_KEY, LOCAL_STORAGE_TIMER_RUNNING_COLOR_KEY } from '../constants';

interface HeaderTimerProps {
    useDigitalFont: boolean;
}

const HeaderTimer: React.FC<HeaderTimerProps> = ({ useDigitalFont }) => {
    const { currentThemeColors } = useTheme();
    const { timeLeft, isRunning, timerTitle, isFinished, setTimeLeft, setIsRunning, setIsFinished, setTimerTitle } = useTimer();
    const [isOpen, setIsOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [minuteInput, setMinuteInput] = useState<string>('5');
    const [secondInput, setSecondInput] = useState<string>('0');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    // Persistent Customization State
    const { data: timerBgColor, setData: setTimerBgColor } = useFirestoreDocumentSync<string>('settings/timerBgColor', LOCAL_STORAGE_TIMER_BG_COLOR_KEY, '');
    const { data: timerRunningColor, setData: setTimerRunningColor } = useFirestoreDocumentSync<string>('settings/timerRunningColor', LOCAL_STORAGE_TIMER_RUNNING_COLOR_KEY, '#22c55e');

    const popoverRef = useRef<HTMLDivElement>(null);

    const formatTime = (totalSeconds: number): string => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const stopTimer = useCallback(() => {
        setIsRunning(false);
    }, [setIsRunning]);

    const startTimer = useCallback(() => {
        setIsFinished(false);
        if (timeLeft <= 0) {
            const mins = parseInt(minuteInput, 10) || 0;
            const secs = parseInt(secondInput, 10) || 0;
            const total = mins * 60 + secs;
            if (total <= 0) return;
            setTimeLeft(total);
        }
        setIsRunning(true);
    }, [timeLeft, minuteInput, secondInput, setTimeLeft, setIsRunning, setIsFinished]);

    const resetTimer = useCallback(() => {
        stopTimer();
        setTimeLeft(0);
        setIsFinished(false);
    }, [stopTimer, setTimeLeft, setIsFinished]);

    const addExtraTime = (seconds: number) => {
        setTimeLeft(prev => prev + seconds);
        if (isFinished) {
            setIsFinished(false);
            setIsRunning(true);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsSettingsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const setPreset = (mins: number) => {
        stopTimer();
        setIsFinished(false);
        setTimeLeft(mins * 60);
        setMinuteInput(String(mins));
        setSecondInput('0');
        setIsRunning(true);
    };

    const timerFontClass = useDigitalFont ? 'font-digital-7' : 'font-sans';

    // Alert Style Logic
    const getAlertStyle = () => {
        if (isFinished) return { backgroundColor: '#ef4444', color: '#ffffff', glow: 'rgba(239, 68, 68, 0.4)' };
        if (!isRunning || timeLeft === 0) {
            return { 
                backgroundColor: timerBgColor || currentThemeColors.bgPrimary, 
                color: currentThemeColors.brandPrimary, 
                glow: 'transparent' 
            };
        }
        if (timeLeft <= 5) return { backgroundColor: '#ef4444', color: '#ffffff', glow: 'rgba(239, 68, 68, 0.4)' }; // Red alert
        if (timeLeft <= 15) return { backgroundColor: '#eab308', color: '#000000', glow: 'rgba(234, 179, 8, 0.4)' }; // Yellow alert
        // Standard running state
        return { 
            backgroundColor: timerRunningColor || '#22c55e', 
            color: '#ffffff', 
            glow: hexToRgba(timerRunningColor || '#22c55e', 0.4) 
        }; 
    };

    const alertClass = (isRunning && timeLeft > 0 && timeLeft <= 10) ? 'animate-blink' : '';

    const popoverBg = timerBgColor || currentThemeColors.bgSecondary;

    return (
        <div className="relative inline-block" ref={popoverRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-lg transition-all flex items-center gap-1.5 ${alertClass} ${isFinished ? 'animate-bounce' : ''}`}
                style={{ 
                    color: (timeLeft > 0 || isFinished) ? (getAlertStyle().color || currentThemeColors.brandPrimary) : currentThemeColors.textMuted,
                    backgroundColor: (timeLeft > 0 || isFinished) ? (getAlertStyle().backgroundColor || hexToRgba(currentThemeColors.brandPrimary, 0.1)) : 'transparent'
                }}
                title="Timer utility"
            >
                <ClockIcon className={`w-6 h-6 ${(isRunning && timeLeft > 10) || isFinished ? 'animate-pulse' : ''}`} />
                {(timeLeft > 0 || isFinished) && (
                    <span className={`text-xs font-black tracking-tighter ${timerFontClass}`}>
                        {isFinished ? '00:00' : formatTime(timeLeft)}
                    </span>
                )}
            </button>

            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-72 p-4 rounded-2xl shadow-2xl z-[100] animate-modal-enter border overflow-hidden"
                    style={{ backgroundColor: popoverBg, borderColor: currentThemeColors.borderPrimary }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-brand-primary" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted-themed truncate max-w-[120px]">{timerTitle}</h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
                                className={`p-1.5 rounded-lg transition-colors ${isSettingsOpen ? 'text-brand-primary bg-bg-primary-themed' : 'text-text-muted-themed hover:text-brand-primary'}`}
                                title="Timer settings"
                            >
                                <CogIcon className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => { setIsFullscreen(true); setIsOpen(false); }} 
                                className="p-1.5 rounded-lg text-text-muted-themed hover:text-brand-primary hover:bg-bg-primary-themed"
                                title="Fullscreen mode"
                            >
                                <ArrowsPointingOutIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-1 text-text-muted-themed hover:text-expense transition-colors"><XIcon className="w-4 h-4"/></button>
                        </div>
                    </div>

                    {isSettingsOpen ? (
                        <div className="space-y-4 py-2 animate-fade-in overflow-y-auto no-scrollbar max-h-[300px]">
                            <div>
                                <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">Custom Title</label>
                                <input 
                                    type="text" 
                                    value={timerTitle} 
                                    onChange={(e) => setTimerTitle(e.target.value)}
                                    className="w-full px-3 py-2 text-xs font-bold bg-bg-primary-themed border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-base-themed"
                                    placeholder="e.g. Focus Time"
                                />
                            </div>
                            <div>
                                <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">Idle Background (Base)</label>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-border-secondary flex-shrink-0">
                                        <input 
                                            type="color" 
                                            value={timerBgColor || '#ffffff'} 
                                            onChange={(e) => setTimerBgColor(e.target.value)}
                                            className="absolute inset-[-4px] w-[200%] h-[200%] cursor-pointer"
                                        />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={timerBgColor} 
                                        onChange={(e) => setTimerBgColor(e.target.value)}
                                        className="flex-grow px-3 py-2 text-[10px] font-mono bg-bg-primary-themed border border-border-secondary rounded-lg text-text-base-themed"
                                        placeholder="HEX Color (Optional)"
                                    />
                                    <button 
                                        onClick={() => setTimerBgColor('')}
                                        className="p-2 text-xs font-black uppercase text-expense hover:bg-expense/10 rounded-lg"
                                        title="Reset color"
                                    >
                                        <ArrowPathIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">Running Background (Active)</label>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-border-secondary flex-shrink-0">
                                        <input 
                                            type="color" 
                                            value={timerRunningColor || '#22c55e'} 
                                            onChange={(e) => setTimerRunningColor(e.target.value)}
                                            className="absolute inset-[-4px] w-[200%] h-[200%] cursor-pointer"
                                        />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={timerRunningColor} 
                                        onChange={(e) => setTimerRunningColor(e.target.value)}
                                        className="flex-grow px-3 py-2 text-[10px] font-mono bg-bg-primary-themed border border-border-secondary rounded-lg text-text-base-themed"
                                        placeholder="HEX Color (Default: #22c55e)"
                                    />
                                    <button 
                                        onClick={() => setTimerRunningColor('#22c55e')}
                                        className="p-2 text-xs font-black uppercase text-expense hover:bg-expense/10 rounded-lg"
                                        title="Reset color"
                                    >
                                        <ArrowPathIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsSettingsOpen(false)}
                                className="w-full py-2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm active:scale-95 transition-all"
                            >
                                <CheckCircleIcon className="w-3.5 h-3.5 inline mr-1" /> Close Settings
                            </button>
                        </div>
                    ) : (
                        <>
                            <div 
                                className={`text-center mb-6 py-2 rounded-xl border border-border-secondary transition-colors duration-300 ${alertClass}`}
                                style={isRunning && timeLeft > 0 ? getAlertStyle() : (isFinished ? { backgroundColor: '#ef4444', color: '#fff' } : { backgroundColor: timerBgColor || currentThemeColors.bgPrimary })}
                            >
                                <p className={`text-5xl font-black leading-none ${timerFontClass} ${(!isRunning && !isFinished || timeLeft === 0 && !isFinished) ? 'text-brand-primary' : ''}`}>
                                    {isFinished ? '00:00' : formatTime(timeLeft || (parseInt(minuteInput, 10) || 0) * 60 + (parseInt(secondInput, 10) || 0))}
                                </p>
                                <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-2 ${isRunning && timeLeft > 0 || isFinished ? 'opacity-90' : 'text-slate-400'}`}>
                                    {isFinished ? 'TIME IS UP!' : (timeLeft <= 10 && timeLeft > 0 && isRunning ? 'CRITICAL ALERT' : (isRunning ? 'ACTIVE SESSION' : 'Time Remaining'))}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex-1">
                                    <label className="text-[8px] font-black uppercase text-slate-400 block mb-1 ml-1">Mins</label>
                                    <input 
                                        type="number" 
                                        value={minuteInput}
                                        onChange={(e) => setMinuteInput(e.target.value)}
                                        className="w-full px-3 py-2 text-sm font-black bg-bg-primary-themed border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-base-themed"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                                <span className="text-sm font-black text-slate-300 mt-5">:</span>
                                <div className="flex-1">
                                    <label className="text-[8px] font-black uppercase text-slate-400 block mb-1 ml-1">Secs</label>
                                    <input 
                                        type="number" 
                                        value={secondInput}
                                        onChange={(e) => setSecondInput(e.target.value)}
                                        className="w-full px-3 py-2 text-sm font-black bg-bg-primary-themed border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-base-themed"
                                        placeholder="0"
                                        min="0"
                                        max="59"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-[8px] font-black uppercase text-slate-400 mb-2 ml-1">Presets</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[1, 5, 15, 25].map(m => (
                                            <button 
                                                key={m} 
                                                onClick={() => setPreset(m)}
                                                className="py-1.5 text-[9px] font-black rounded-lg border border-border-secondary hover:bg-brand-primary hover:text-white transition-all bg-bg-primary-themed text-text-base-themed"
                                            >
                                                {m}m
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {(timeLeft > 0 || isFinished) && (
                                    <div>
                                        <p className="text-[8px] font-black uppercase text-slate-400 mb-2 ml-1">Add Extra Time</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { l: '+30s', v: 30 },
                                                { l: '+1m', v: 60 },
                                                { l: '+5m', v: 300 }
                                            ].map(extra => (
                                                <button 
                                                    key={extra.l}
                                                    onClick={() => addExtraTime(extra.v)}
                                                    className="py-1.5 text-[9px] font-black rounded-lg border border-brand-secondary/30 text-brand-secondary hover:bg-brand-secondary hover:text-white transition-all flex items-center justify-center gap-1 bg-brand-secondary/5"
                                                >
                                                    <PlusIcon className="w-2.5 h-2.5" /> {extra.l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 mt-6">
                                {!isRunning ? (
                                    <button 
                                        onClick={startTimer}
                                        className="flex-1 py-3 rounded-xl bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 active:scale-95 transition-transform"
                                    >
                                        <PlayIcon className="w-4 h-4" /> {isFinished ? 'Restart' : 'Start'}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={stopTimer}
                                        className="flex-1 py-3 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 transition-transform"
                                    >
                                        <PauseIcon className="w-4 h-4" /> Pause
                                    </button>
                                )}
                                <button 
                                    onClick={resetTimer}
                                    className="p-3 rounded-xl bg-bg-primary-themed text-text-muted-themed border border-border-secondary hover:text-brand-primary transition-all active:scale-95"
                                    title="Reset"
                                >
                                    <ArrowPathIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Immersive Fullscreen Overlay */}
            {isFullscreen && (
                <div 
                    className="fixed inset-0 z-[300] flex flex-col items-center justify-center transition-colors duration-1000 ease-in-out p-6 sm:p-8 text-white text-center"
                    style={{ backgroundColor: isFinished ? '#7f1d1d' : (getAlertStyle().backgroundColor || timerBgColor || '#111827') }}
                >
                    {/* Top Controls - Safely positioned for mobile notches */}
                    <div className="absolute top-4 sm:top-8 right-4 sm:right-8">
                        <button 
                            onClick={() => setIsFullscreen(false)}
                            className="p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md border border-white/20 shadow-xl"
                            title="Exit fullscreen"
                        >
                            <ArrowsPointingInIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="w-full max-w-4xl animate-fade-in flex flex-col items-center">
                        <div className="mb-8 sm:mb-12 inline-flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                            <ClockIcon className={`w-4 h-4 sm:w-6 sm:h-6 ${isRunning ? 'animate-spin' : ''}`} />
                            <span className="text-[10px] sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-70">
                                {isFinished ? 'Finished' : (isRunning ? timerTitle : 'Paused')}
                            </span>
                        </div>

                        <div className="relative w-full flex justify-center">
                            <p 
                                className={`text-[25vw] sm:text-[20rem] font-black leading-none tracking-tighter ${timerFontClass} transition-all duration-500 ${isRunning ? 'scale-100' : 'scale-95 opacity-70'}`}
                                style={{ 
                                    textShadow: `0 0 40px ${getAlertStyle().glow || 'rgba(255,255,255,0.1)'}`,
                                    fontFeatureSettings: '"tnum" 1',
                                    maxWidth: '100%' 
                                }}
                            >
                                {isFinished ? '00:00' : formatTime(timeLeft)}
                            </p>
                        </div>

                        <h2 className="text-sm sm:text-3xl font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-4 sm:mt-8 mb-10 sm:mb-16 opacity-80 px-4">
                            {isFinished ? "Session has ended" : (isRunning ? `Concentration task active` : 'System ready')}
                        </h2>

                        {/* Control Deck */}
                        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 w-full max-w-[280px] sm:max-w-none">
                            {!isRunning ? (
                                <button 
                                    onClick={startTimer}
                                    className="px-8 sm:px-12 py-4 sm:py-6 rounded-2xl sm:rounded-3xl bg-white text-black text-base sm:text-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 sm:gap-4 shadow-2xl hover:scale-105 transition-transform"
                                >
                                    <PlayIcon className="w-6 h-6 sm:w-8 sm:h-8" /> {isFinished ? 'Restart' : 'Resume'}
                                </button>
                            ) : (
                                <button 
                                    onClick={stopTimer}
                                    className="px-8 sm:px-12 py-4 sm:py-6 rounded-2xl sm:rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 text-white text-base sm:text-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 sm:gap-4 hover:bg-white/20 transition-all"
                                >
                                    <PauseIcon className="w-6 h-6 sm:w-8 sm:h-8" /> Pause
                                </button>
                            )}
                            
                            <div className="flex gap-4 w-full sm:w-auto">
                                <button 
                                    onClick={resetTimer}
                                    className="flex-1 sm:flex-initial p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:bg-white/20 transition-all flex items-center justify-center"
                                    title="Reset"
                                >
                                    <ArrowPathIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                                </button>

                                {!isFinished && (
                                    <button 
                                        onClick={() => addExtraTime(60)}
                                        className="flex-1 sm:flex-initial px-6 sm:px-10 py-4 sm:py-6 rounded-2xl sm:rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 text-white text-sm sm:text-lg font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                                    >
                                        +1 Min
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Minimal Progress Indicator */}
                    <div className="absolute bottom-0 left-0 h-1 sm:h-2 bg-white/20 transition-all duration-1000" style={{ width: `${(timeLeft / ((parseInt(minuteInput, 10)*60) + parseInt(secondInput, 10))) * 100}%` }}></div>
                </div>
            )}

            {/* Global Completion Popup (Standard Mode) */}
            {isFinished && !isFullscreen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div 
                        className="bg-white dark:bg-slate-900 w-full max-w-sm p-8 rounded-3xl shadow-2xl border-4 border-rose-500 animate-modal-enter text-center"
                    >
                        <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-500/30">
                            <ClockIcon className="w-10 h-10 text-white animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">Time's Up!</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-bold mb-8">{timerTitle} session has completed successfully.</p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => { setIsFinished(false); setIsOpen(true); }}
                                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                            >
                                Set New Timer
                            </button>
                            <button 
                                onClick={() => setIsFinished(false)}
                                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-colors"
                            >
                                Dismiss Alert
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeaderTimer;
