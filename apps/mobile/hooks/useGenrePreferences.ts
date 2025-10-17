import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'GENRE_PREFERENCES_V1';

export function useGenrePreferences() {
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setGenres(parsed.filter((item): item is string => typeof item === 'string'));
          }
        }
      } catch (error) {
        console.warn('Failed to load genre preferences', error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const persist = useCallback(async (next: string[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn('Failed to persist genre preferences', error);
    }
  }, []);

  const toggleGenre = useCallback(
    (genre: string) => {
      setGenres((prev) => {
        const exists = prev.includes(genre);
        const next = exists ? prev.filter((item) => item !== genre) : [...prev, genre];
        void persist(next);
        return next;
      });
    },
    [persist],
  );

  return { genres, toggleGenre, loading };
}

