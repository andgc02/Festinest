import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'SAVED_FESTIVALS_V1';

type SavedFestivalsContextValue = {
  savedIds: Set<string>;
  toggle: (festivalId: string) => void;
  isSaved: (festivalId: string) => boolean;
  loading: boolean;
};

const SavedFestivalsContext = createContext<SavedFestivalsContextValue | undefined>(undefined);

export function SavedFestivalsProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: string[] = JSON.parse(raw);
          setSavedIds(new Set(parsed));
        }
      } catch (error) {
        console.warn('Failed to load saved festivals', error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const persist = useCallback(async (next: Set<string>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
    } catch (error) {
      console.warn('Failed to persist saved festivals', error);
    }
  }, []);

  const toggle = useCallback(
    (festivalId: string) => {
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (next.has(festivalId)) {
          next.delete(festivalId);
        } else {
          next.add(festivalId);
        }
        void persist(next);
        return next;
      });
    },
    [persist],
  );

  const isSaved = useCallback(
    (festivalId: string) => {
      return savedIds.has(festivalId);
    },
    [savedIds],
  );

  const value = useMemo<SavedFestivalsContextValue>(
    () => ({ savedIds, toggle, isSaved, loading }),
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

