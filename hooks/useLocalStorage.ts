
import { useState, useEffect, Dispatch, SetStateAction, useCallback, useRef } from 'react';

function useLocalStorage<T,>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) { // If the key exists in localStorage
        const parsed = JSON.parse(item); // Parse the stored string
        return parsed; // Return the parsed value (could be null if T allows it and was stored as such)
      }
      return initialValue; // Key not found, return initialValue
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  // Effect to save to localStorage when storedValue changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error(`Error setting localStorage key “${key}” in useEffect:`, error);
      }
    }
  }, [key, storedValue]);

  const setValue: Dispatch<SetStateAction<T>> = useCallback((value) => {
    try {
      // Pass the value (or function) directly to setStoredValue.
      // React's useState setter handles functional updates correctly,
      // ensuring the function receives the latest state when processed from the queue.
      setStoredValue(value);
    } catch (error) {
      // This catch is unlikely to be hit for setStoredValue itself, but good practice.
      console.error(`Error invoking setStoredValue for localStorage key “${key}”:`, error);
    }
  }, [key]);
  
  const initialValueRef = useRef(initialValue);
  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  // Effect to listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          // Ensure we don't get into a loop if this tab just wrote to storage
          // and the value is already what we expect.
          if (event.newValue !== JSON.stringify(storedValue)) {
            const parsedNewValue = JSON.parse(event.newValue);
            setStoredValue(parsedNewValue);
          }
        } catch (error) {
          console.error(`Error parsing new value for localStorage key “${key}” on storage event:`, error);
        }
      } else if (event.key === key && !event.newValue) { // Item was removed or cleared
        if (storedValue !== initialValueRef.current) { 
            setStoredValue(initialValueRef.current);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, storedValue]); // Include storedValue in deps for the comparison


  return [storedValue, setValue];
}

export default useLocalStorage;
