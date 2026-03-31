import { useState, useEffect, Dispatch, SetStateAction, useCallback } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, sanitizeData } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export function useFirestoreDocumentSync<T>(
  documentPath: string,
  localStorageKey: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(localStorageKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
      else setLoading(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, `users/${user.uid}/${documentPath}`);
    
    const unsubscribe = onSnapshot(docRef, async (snapshot) => {
      if (!snapshot.exists()) {
        // Migration logic
        const localData = window.localStorage.getItem(localStorageKey);
        try {
          if (localData) {
            console.log(`Migrating local data to Firestore document ${documentPath}`);
            await setDoc(docRef, sanitizeData({ value: JSON.parse(localData) }));
          } else {
            await setDoc(docRef, sanitizeData({ value: initialValue }));
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/${documentPath}`);
        }
      } else {
        const data = snapshot.data().value as T;
        setStoredValue(data);
        const newValue = JSON.stringify(data);
        window.localStorage.setItem(localStorageKey, newValue);
        window.dispatchEvent(new StorageEvent('storage', {
          key: localStorageKey,
          newValue: newValue
        }));
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/${documentPath}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, documentPath, localStorageKey]); // Intentionally omitting initialValue

  const setValue: Dispatch<SetStateAction<T>> = useCallback((value) => {
    setStoredValue((prev) => {
      const next = value instanceof Function ? value(prev) : value;
      const newValue = JSON.stringify(next);
      window.localStorage.setItem(localStorageKey, newValue);
      window.dispatchEvent(new StorageEvent('storage', {
        key: localStorageKey,
        newValue: newValue
      }));
      
      if (user) {
        const syncToFirestore = async () => {
          try {
            await setDoc(doc(db, `users/${user.uid}/${documentPath}`), sanitizeData({ value: next }));
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/${documentPath}`);
          }
        };
        syncToFirestore();
      }
      
      return next;
    });
  }, [user, documentPath, localStorageKey]);

  return [storedValue, setValue, loading];
}
