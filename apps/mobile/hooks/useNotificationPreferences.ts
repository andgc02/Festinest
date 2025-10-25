import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';

import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  fetchNotificationSettings,
  NotificationPreferenceKey,
  NotificationPreferences,
  NotificationSettings,
  persistExpoPushToken,
  requestPushPermissions,
  updateNotificationPreferences,
} from '@/services/notifications';

type UseNotificationPreferencesOptions = {
  userId?: string;
};

type UseNotificationPreferencesResult = {
  preferences: NotificationPreferences;
  loading: boolean;
  syncing: boolean;
  permissionStatus: Notifications.PermissionStatus | 'undetermined';
  expoPushToken?: string;
  error: string | null;
  ensurePermissions: () => Promise<boolean>;
  togglePreference: (key: NotificationPreferenceKey, value: boolean) => Promise<boolean>;
};

const DEFAULT_SETTINGS: NotificationSettings = {
  preferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
  permissionStatus: 'undetermined',
};

export function useNotificationPreferences({ userId }: UseNotificationPreferencesOptions): UseNotificationPreferencesResult {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const load = async () => {
      try {
        const data = await fetchNotificationSettings(userId);
        if (isMounted) {
          setSettings(data);
          setError(null);
        }
      } catch (loadError) {
        console.warn('Unable to load notification settings', loadError);
        if (isMounted) {
          setSettings(DEFAULT_SETTINGS);
          setError('Could not load notification preferences.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const ensurePermissions = useCallback(async () => {
    if (!userId) {
      setError('Sign in to manage notification preferences.');
      return false;
    }

    const result = await requestPushPermissions();
    setSettings((previous) => ({
      ...previous,
      permissionStatus: result.status,
      expoPushToken: result.token ?? previous.expoPushToken,
    }));

    if (result.status === 'granted' && result.token) {
      try {
        await persistExpoPushToken(userId, result.token);
        setError(null);
      } catch (persistError) {
        console.warn('Unable to persist Expo push token', persistError);
        setError('We could not register this device for notifications.');
      }
      return true;
    }

    if (result.status !== 'granted') {
      setError('Enable notifications in your system settings to manage preferences.');
    }

    return false;
  }, [userId]);

  const togglePreference = useCallback(
    async (key: NotificationPreferenceKey, value: boolean) => {
      if (!userId) {
        setError('Sign in to manage notification preferences.');
        return false;
      }

      if (settings.permissionStatus !== 'granted') {
        const granted = await ensurePermissions();
        if (!granted) {
          return false;
        }
      }

      setSyncing(true);
      setSettings((previous) => ({
        ...previous,
        preferences: {
          ...previous.preferences,
          [key]: value,
        },
      }));

      try {
        const updated = await updateNotificationPreferences(userId, { [key]: value });
        setSettings((previous) => ({
          ...previous,
          preferences: updated,
        }));
        setError(null);
        return true;
      } catch (updateError) {
        console.warn('Unable to update notification preference', updateError);
        setError('Could not update that notification setting. Try again.');
        setSettings((previous) => ({
          ...previous,
          preferences: {
            ...previous.preferences,
            [key]: !value,
          },
        }));
        return false;
      } finally {
        setSyncing(false);
      }
    },
    [userId, ensurePermissions, settings.permissionStatus],
  );

  return {
    preferences: settings.preferences,
    loading,
    syncing,
    permissionStatus: settings.permissionStatus,
    expoPushToken: settings.expoPushToken,
    ensurePermissions,
    togglePreference,
    error,
  };
}
