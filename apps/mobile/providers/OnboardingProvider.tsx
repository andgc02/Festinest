import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/providers/AuthProvider';

type OnboardingContextValue = {
  loading: boolean;
  completed: boolean;
  markComplete: () => Promise<void>;
  reset: () => Promise<void>;
};

const STORAGE_PREFIX = 'ONBOARDING_STATUS_V1';

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const storageKey = user?.uid ? `${STORAGE_PREFIX}:${user.uid}` : null;

  useEffect(() => {
    if (!storageKey) {
      setCompleted(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        setCompleted(stored === 'completed');
      } catch (error) {
        console.warn('Failed to read onboarding status', error);
        setCompleted(false);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [storageKey]);

  const markComplete = useCallback(async () => {
    if (!storageKey) {
      return;
    }
    try {
      await AsyncStorage.setItem(storageKey, 'completed');
      setCompleted(true);
    } catch (error) {
      console.warn('Failed to persist onboarding completion', error);
    }
  }, [storageKey]);

  const reset = useCallback(async () => {
    if (!storageKey) {
      return;
    }
    try {
      await AsyncStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to reset onboarding status', error);
    } finally {
      setCompleted(false);
    }
  }, [storageKey]);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      loading: Boolean(storageKey) && loading,
      completed,
      markComplete,
      reset,
    }),
    [storageKey, loading, completed, markComplete, reset],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
