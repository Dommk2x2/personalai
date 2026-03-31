import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { LOCAL_STORAGE_TIMER_TITLE_KEY } from '../constants';
import { showNotification, requestNotificationPermission } from '../utils/notificationUtils';

interface TimerContextType {
  timeLeft: number;
  isRunning: boolean;
  timerTitle: string;
  isFinished: boolean;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFinished: React.Dispatch<React.SetStateAction<boolean>>;
  setTimerTitle: (title: string) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timerTitle, setTimerTitle] = useLocalStorage<string>(LOCAL_STORAGE_TIMER_TITLE_KEY, 'Utility Timer');
  const intervalRef = useRef<number | null>(null);

  // Request notification permission
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      if (!endTime) {
        setEndTime(Date.now() + timeLeft * 1000);
        showNotification('Timer Started', `${timerTitle} is now running.`);
      }

      intervalRef.current = window.setInterval(() => {
        if (endTime) {
          const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
          setTimeLeft(remaining);

          if (remaining <= 0) {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
            setIsRunning(false);
            setIsFinished(true);
            setEndTime(null);
            showNotification('Timer Finished', `${timerTitle} has completed!`);
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      if (!isRunning) setEndTime(null);
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, endTime, timerTitle]);

  return (
    <TimerContext.Provider value={{ timeLeft, isRunning, timerTitle, isFinished, setTimeLeft, setIsRunning, setIsFinished, setTimerTitle }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) throw new Error('useTimer must be used within a TimerProvider');
  return context;
};
