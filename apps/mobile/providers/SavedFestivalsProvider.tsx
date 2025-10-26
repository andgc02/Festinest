import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { db } from '@/lib/firebase';
import { useAuth } from '@/providers/AuthProvider';

type SavedFestivalRecord = {
  id: string;
  nickname?: string;
  savedAt: number;
};

type SavedFestivalsContextValue = {
  savedIds: Set<string>;
  toggle: (festivalId: string) => void;
  isSaved: (festivalId: string) => boolean;
  loading: boolean;
  getNickname: (festivalId: string) => string | undefined;
  updateNickname: (festivalId: string, nickname: string) => Promise<void>;
};

const STORAGE_KEY = 'SAVED_FESTIVALS_V2';
const USERS_COLLECTION = 'users';
const FAVORITES_SUBCOLLECTION = 'favorites';

const SavedFestivalsContext = createContext<SavedFestivalsContextValue | undefined>(undefined);

function normalizeRecord(input: unknown): SavedFestivalRecord | null {
  if (!input) {
    return null;
  }

  if (typeof input === 'string') {
    return { id: input, savedAt: Date.now() };
  }

  if (typeof input !== 'object') {
    return null;
  }

  const value = input as Record<string, unknown>;
  const idValue = value.id ?? value.festivalId;
  if (typeof idValue !== 'string' || !idValue.trim()) {
    return null;
  }

  const nickname =
    typeof value.nickname === 'string' && value.nickname.trim().length ? value.nickname.trim() : undefined;
  const savedAt = typeof value.savedAt === 'number' ? value.savedAt : Date.now();

  return {
    id: idValue,
    nickname,
    savedAt,
  };
}

async function loadLocalRecords(): Promise<Record<string, SavedFestivalRecord>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    const results: Record<string, SavedFestivalRecord> = {};
    if (Array.isArray(parsed)) {
      parsed.forEach((entry) => {
        const normalized = normalizeRecord(entry);
        if (normalized) {
          results[normalized.id] = normalized;
        }
      });
      return results;
    }
    if (typeof parsed === 'object' && parsed) {
      Object.values(parsed as Record<string, unknown>).forEach((entry) => {
        const normalized = normalizeRecord(entry);
        if (normalized) {
          results[normalized.id] = normalized;
        }
      });
    }
    return results;
  } catch (error) {
    console.warn('Failed to read saved festivals from storage', error);
    return {};
  }
}

async function persistLocalRecords(records: Record<string, SavedFestivalRecord>) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Object.values(records)));
  } catch (error) {
    console.warn('Failed to persist saved festivals locally', error);
  }
}

export function SavedFestivalsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [records, setRecords] = useState<Record<string, SavedFestivalRecord>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const localRecords = await loadLocalRecords();

      if (!user) {
        setRecords(localRecords);
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDocs(collection(db, USERS_COLLECTION, user.uid, FAVORITES_SUBCOLLECTION));
        if (snapshot.empty) {
          setRecords(localRecords);
        } else {
          const remoteRecords: Record<string, SavedFestivalRecord> = {};
          snapshot.forEach((document) => {
            const data = document.data() ?? {};
            const nickname =
              typeof data.nickname === 'string' && data.nickname.trim().length ? data.nickname.trim() : undefined;
            const savedAt =
              typeof data.savedAt === 'number'
                ? data.savedAt
                : typeof data.savedAt === 'string'
                  ? Date.parse(data.savedAt)
                  : Date.now();
            remoteRecords[document.id] = {
              id: document.id,
              nickname,
              savedAt: Number.isNaN(savedAt) ? Date.now() : savedAt,
            };
          });
          setRecords(remoteRecords);
          await persistLocalRecords(remoteRecords);
        }
      } catch (error) {
        console.warn('Failed to load saved festivals from Firestore', error);
        setRecords(localRecords);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user?.uid]);

  const persistRemote = useCallback(
    async (record: SavedFestivalRecord) => {
      if (!user) {
        return;
      }
      try {
        await setDoc(
          doc(db, USERS_COLLECTION, user.uid, FAVORITES_SUBCOLLECTION, record.id),
          {
            savedAt: record.savedAt,
            nickname: record.nickname ?? null,
            updatedAt: Date.now(),
          },
          { merge: true },
        );
      } catch (error) {
        console.warn('Failed to sync saved festival remotely', error);
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
        await deleteDoc(doc(db, USERS_COLLECTION, user.uid, FAVORITES_SUBCOLLECTION, festivalId));
      } catch (error) {
        console.warn('Failed to remove saved festival remotely', error);
      }
    },
    [user],
  );

  const savedIds = useMemo(() => new Set(Object.keys(records)), [records]);

  const toggle = useCallback(
    (festivalId: string) => {
      setRecords((previous) => {
        const next = { ...previous };
        if (next[festivalId]) {
          delete next[festivalId];
          void removeRemote(festivalId);
        } else {
          const record: SavedFestivalRecord = { id: festivalId, savedAt: Date.now() };
          next[festivalId] = record;
          void persistRemote(record);
        }
        void persistLocalRecords(next);
        return next;
      });
    },
    [persistRemote, removeRemote],
  );

  const updateNickname = useCallback(
    async (festivalId: string, nickname: string) => {
      let updated: SavedFestivalRecord | null = null;
      setRecords((previous) => {
        if (!previous[festivalId]) {
          return previous;
        }
        const trimmed = nickname.trim();
        updated = {
          ...previous[festivalId],
          nickname: trimmed.length ? trimmed : undefined,
        };
        const next = {
          ...previous,
          [festivalId]: updated,
        };
        void persistLocalRecords(next);
        return next;
      });
      if (updated) {
        await persistRemote(updated);
      }
    },
    [persistRemote],
  );

  const isSaved = useCallback((festivalId: string) => savedIds.has(festivalId), [savedIds]);
  const getNickname = useCallback((festivalId: string) => records[festivalId]?.nickname, [records]);

  const value = useMemo<SavedFestivalsContextValue>(
    () => ({
      savedIds,
      toggle,
      isSaved,
      loading,
      getNickname,
      updateNickname,
    }),
    [savedIds, toggle, isSaved, loading, getNickname, updateNickname],
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


