import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { ref, onValue, set, off } from 'firebase/database';
import { db, auth } from '../src/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

function useFirebaseSync<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const dataRef = ref(db, `users/${user.uid}/${key}`);
    
    // Listen for remote changes
    console.log(`[FirebaseSync] Attaching listener for ${key} at users/${user.uid}/${key}`);
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      console.log(`[FirebaseSync] Received data for ${key}:`, data !== null && data !== undefined ? "Data exists" : "No data");
      if (data !== null && data !== undefined) {
        setStoredValue(data);
        window.localStorage.setItem(key, JSON.stringify(data));
      } else {
        // If no data in Firebase, ensure we use the initialValue
        setStoredValue(initialValue);
        window.localStorage.setItem(key, JSON.stringify(initialValue));
        
        // Optionally push local data to Firebase if it exists
        const localData = window.localStorage.getItem(key);
        if (localData) {
          console.log(`[FirebaseSync] Pushing local data for ${key} to Firebase`);
          set(dataRef, JSON.parse(localData));
        }
      }
      setLoading(false);
    }, (error) => {
      console.error(`[FirebaseSync] Error for ${key}:`, error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, key]);

  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    setStoredValue((prev) => {
      const next = value instanceof Function ? value(prev) : value;
      window.localStorage.setItem(key, JSON.stringify(next));
      
      if (user) {
        const dataRef = ref(db, `users/${user.uid}/${key}`);
        set(dataRef, next).catch(err => {
          console.error(`Firebase set error for ${key}:`, err);
        });
      }
      return next;
    });
  };

  return [storedValue, setValue, loading];
}

export default useFirebaseSync;
