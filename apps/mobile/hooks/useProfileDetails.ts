import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export type ProfileDetails = {
  displayName: string;
  homeBase: string;
  avatarUri?: string;
};

const STORAGE_KEY = 'PROFILE_DETAILS_V1';
const DEFAULT_PROFILE: ProfileDetails = {
  displayName: 'Festival Fan',
  homeBase: '',
  avatarUri: undefined,
};

function parseStoredProfile(raw: unknown): ProfileDetails {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_PROFILE;
  }

  const value = raw as Record<string, unknown>;
  const displayName =
    typeof value.displayName === 'string' && value.displayName.trim().length
      ? value.displayName.trim()
      : DEFAULT_PROFILE.displayName;
  const homeBase =
    typeof value.homeBase === 'string' && value.homeBase.trim().length ? value.homeBase.trim() : DEFAULT_PROFILE.homeBase;

  const avatarUri =
    typeof value.avatarUri === 'string' && value.avatarUri.trim().length ? value.avatarUri.trim() : undefined;

  return { displayName, homeBase, avatarUri };
}

export function useProfileDetails() {
  const [profile, setProfile] = useState<ProfileDetails>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setProfile(parseStoredProfile(parsed));
        }
      } catch (error) {
        console.warn('Failed to load profile details', error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const persist = useCallback(async (value: ProfileDetails) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to persist profile details', error);
    }
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<ProfileDetails>) => {
      let nextProfile: ProfileDetails = DEFAULT_PROFILE;
      setProfile((previous) => {
        nextProfile = { ...previous, ...updates };
        return nextProfile;
      });
      await persist(nextProfile);
    },
    [persist],
  );

  return { profile, updateProfile, loading };
}
