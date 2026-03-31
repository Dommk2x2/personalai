import { useFirestoreDocumentSync } from './useFirestoreDocumentSync';
import { LOCAL_STORAGE_PROFILE_PICTURE_KEY, LOCAL_STORAGE_LOCK_SCREEN_PICTURE_KEY } from '../constants';

export function useProfilePicture(username: string, type: 'general' | 'lockscreen' = 'general') {
  const baseKey = type === 'lockscreen' ? LOCAL_STORAGE_LOCK_SCREEN_PICTURE_KEY : LOCAL_STORAGE_PROFILE_PICTURE_KEY;
  const storageKey = `${baseKey}_${username}`;
  return useFirestoreDocumentSync<string | null>(`settings/profilePicture_${username}_${type}`, storageKey, null);
}
