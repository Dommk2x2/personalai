import { useState, useEffect, Dispatch, SetStateAction, useCallback } from 'react';
import { collection, onSnapshot, doc, writeBatch, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, sanitizeData } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export function useFirestoreCollectionSync<T>(
  collectionName: string,
  localStorageKey: string,
  initialValue: T[],
  getId: (item: T) => string
): [T[], Dispatch<SetStateAction<T[]>>, boolean] {
  const [storedValue, setStoredValue] = useState<T[]>(() => {
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

    const colRef = collection(db, `users/${user.uid}/${collectionName}`);
    
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as T);
      
      // Only update if there's actual data from Firestore, or if we know it's empty
      // If it's empty in Firestore but we have local data, we might want to migrate it
      if (data.length === 0 && storedValue.length > 0) {
        // Migration logic: push local data to Firestore
        console.log(`Migrating ${storedValue.length} items to Firestore collection ${collectionName}`);
        const migrateData = async () => {
          try {
            // Firestore batch limit is 500
            const chunks = [];
            for (let i = 0; i < storedValue.length; i += 450) {
              chunks.push(storedValue.slice(i, i + 450));
            }
            
            for (const chunk of chunks) {
              const batch = writeBatch(db);
              chunk.forEach(item => {
                const docId = getId(item) || Math.random().toString(36).substring(2, 15);
                const docRef = doc(db, `users/${user.uid}/${collectionName}`, docId);
                batch.set(docRef, sanitizeData(item));
              });
              await batch.commit();
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/${collectionName}`);
          }
        };
        migrateData();
      } else {
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
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/${collectionName}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, collectionName, localStorageKey]); // Intentionally omitting storedValue to avoid infinite loops

  const setValue: Dispatch<SetStateAction<T[]>> = useCallback((value) => {
    setStoredValue((prev) => {
      const next = value instanceof Function ? value(prev) : value;
      const newValue = JSON.stringify(next);
      window.localStorage.setItem(localStorageKey, newValue);
      window.dispatchEvent(new StorageEvent('storage', {
        key: localStorageKey,
        newValue: newValue
      }));
      
      if (user) {
        // Find differences and update Firestore
        const prevMap = new Map(prev.map(item => [getId(item), item]));
        const nextMap = new Map(next.map(item => [getId(item), item]));
        
        const addedOrUpdated = next.filter(item => {
          const id = getId(item);
          const prevItem = prevMap.get(id);
          return !prevItem || JSON.stringify(prevItem) !== JSON.stringify(item);
        });
        
        const deleted = prev.filter(item => !nextMap.has(getId(item)));
        
        const syncToFirestore = async () => {
          try {
            // Process in batches if needed, but usually single updates
            for (const item of addedOrUpdated) {
              const docId = getId(item) || Math.random().toString(36).substring(2, 15);
              await setDoc(doc(db, `users/${user.uid}/${collectionName}`, docId), sanitizeData(item));
            }
            for (const item of deleted) {
              const docId = getId(item);
              if (docId) {
                await deleteDoc(doc(db, `users/${user.uid}/${collectionName}`, docId));
              }
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/${collectionName}`);
          }
        };
        
        syncToFirestore();
      }
      
      return next;
    });
  }, [user, collectionName, localStorageKey, getId]);

  return [storedValue, setValue, loading];
}
