import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { db } from '@/lib/firebase';
import { useAuth } from '@/providers/AuthProvider';

const STORAGE_KEY = 'SAVED_FESTIVALS_V1';
const COLLECTION_ROOT = 'userSavedFestivals';

type SavedFestivalsContextValue = {
  savedIds: Set<string>;
  toggle: (festivalId: string) => void;
  isSaved: (festivalId: string) => boolean;
  loading: boolean;
};

const SavedFestivalsContext = createContext<SavedFestivalsContextValue | undefined>(undefined);

async function loadLocalIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch (error) {
    console.warn('Failed to read saved festivals from storage', error);
    return [];
  }
}

async function persistLocalIds(ids: Set<string>) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch (error) {
    console.warn('Failed to persist saved festivals locally', error);
  }
}

export function SavedFestivalsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const localIds = new Set(await loadLocalIds());

      if (!user) {
        setSavedIds(localIds);
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDocs(collection(db, COLLECTION_ROOT, user.uid, 'festivals'));
        const remoteIds = new Set(snapshot.docs.map((document) => document.id));
        if (remoteIds.size > 0) {
          setSavedIds(remoteIds);
          await persistLocalIds(remoteIds);
        } else {
          setSavedIds(localIds);
        }
      } catch (error) {
        console.warn('Failed to load saved festivals from Firestore', error);
        setSavedIds(localIds);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user?.uid]);

  const addRemote = useCallback(
    async (festivalId: string) => {
      if (!user) {
        return;
      }
      try {
        await setDoc(
          doc(db, COLLECTION_ROOT, user.uid, 'festivals', festivalId),
          { savedAt: Date.now() },
          { merge: true },
        );
      } catch (error) {
        console.warn('Failed to add saved festival remotely', error);
      }
    },
    [user],
  );

  const removeRemote = useCallback(
    async (festivalId: string) => {
      if (!user) {
        return;
      }
      try {
        await deleteDoc(doc(db, COLLECTION_ROOT, user.uid, 'festivals', festivalId));
      } catch (error) {
        console.warn('Failed to remove saved festival remotely', error);
      }
    },
    [user],
  );

  const toggle = useCallback(
    (festivalId: string) => {
      setSavedIds((prev) => {
        const next = new Set(prev);
        const exists = next.has(festivalId);
        if (exists) {
          next.delete(festivalId);
          void removeRemote(festivalId);
        } else {
          next.add(festivalId);
          void addRemote(festivalId);
        }
        void persistLocalIds(next);
        return next;
      });
    },
    [addRemote, removeRemote],
  );

  const isSaved = useCallback((festivalId: string) => savedIds.has(festivalId), [savedIds]);

  const value = useMemo<SavedFestivalsContextValue>(
    () => ({
      savedIds,
      toggle,
      isSaved,
      loading,
    }),
    [savedIds, toggle, isSaved, loading],
  );

  return <SavedFestivalsContext.Provider value={value}>{children}</SavedFestivalsContext.Provider>;
}

export function useSavedFestivals() {
  const context = useContext(SavedFestivalsContext);
  if (!context) {
    throw new Error('useSavedFestivals must be used within a SavedFestivalsProvider');
  }
  return context;
}


