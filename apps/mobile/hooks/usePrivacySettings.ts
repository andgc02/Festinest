import { useCallback, useEffect, useState } from 'react';

import {
  DEFAULT_PRIVACY_SETTINGS,
  PrivacySettings,
  fetchPrivacySettings,
  persistPrivacySettings,
  requestDataDeletion,
  requestDataExport,
} from '@/services/privacy';

export function usePrivacySettings(userId?: string) {
  const [settings, setSettings] = useState<PrivacySettings>({ ...DEFAULT_PRIVACY_SETTINGS });
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!userId) {
      setSettings({ ...DEFAULT_PRIVACY_SETTINGS });
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const remote = await fetchPrivacySettings(userId);
        setSettings(remote);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [userId]);

  const updateSetting = useCallback(
    async <Key extends keyof PrivacySettings>(key: Key, value: PrivacySettings[Key]) => {
      if (!userId) {
        return;
      }
      let nextState: PrivacySettings | null = null;
      setSettings((prev) => {
        nextState = { ...prev, [key]: value };
        return nextState;
      });
      if (nextState) {
        try {
          await persistPrivacySettings(userId, nextState);
        } catch (err) {
          setError((err as Error).message);
        }
      }
    },
    [userId],
  );

  const exportData = useCallback(async () => {
    if (!userId) {
      throw new Error('Missing user id for data export');
    }
    setRequesting(true);
    try {
      return await requestDataExport(userId);
    } finally {
      setRequesting(false);
    }
  }, [userId]);

  const deleteData = useCallback(async () => {
    if (!userId) {
      throw new Error('Missing user id for privacy request');
    }
    setRequesting(true);
    try {
      return await requestDataDeletion(userId);
    } finally {
      setRequesting(false);
    }
  }, [userId]);

  return { settings, loading, error, updateSetting, exportData, deleteData, requesting };
}
