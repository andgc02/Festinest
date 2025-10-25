import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';

const USERS_COLLECTION = 'users';
const NOTIFICATION_FIELD = 'notificationPreferences';

export type NotificationPreferences = {
  groupActivity: boolean;
  scheduleUpdates: boolean;
  premiumAlerts: boolean;
};

export type NotificationPreferenceKey = keyof NotificationPreferences;

export type NotificationSettings = {
  preferences: NotificationPreferences;
  expoPushToken?: string;
  permissionStatus: Notifications.PermissionStatus | 'undetermined';
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  groupActivity: true,
  scheduleUpdates: true,
  premiumAlerts: false,
};

function normalizePreferences(input: unknown): NotificationPreferences {
  if (!input || typeof input !== 'object') {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }

  const values = input as Record<string, unknown>;

  return {
    groupActivity: typeof values.groupActivity === 'boolean' ? values.groupActivity : DEFAULT_NOTIFICATION_PREFERENCES.groupActivity,
    scheduleUpdates:
      typeof values.scheduleUpdates === 'boolean' ? values.scheduleUpdates : DEFAULT_NOTIFICATION_PREFERENCES.scheduleUpdates,
    premiumAlerts: typeof values.premiumAlerts === 'boolean' ? values.premiumAlerts : DEFAULT_NOTIFICATION_PREFERENCES.premiumAlerts,
  };
}

async function ensureAndroidChannelAsync() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FFFCF2',
    enableLights: true,
    enableVibrate: true,
  });
}

export async function fetchNotificationSettings(userId: string): Promise<NotificationSettings> {
  const reference = doc(db, USERS_COLLECTION, userId);
  let permissionStatus: Notifications.PermissionStatus | 'undetermined' = 'undetermined';

  try {
    const permissions = await Notifications.getPermissionsAsync();
    permissionStatus = permissions.status;
  } catch (error) {
    console.warn('Unable to read notification permissions', error);
  }

  try {
    const snapshot = await getDoc(reference);
    if (!snapshot.exists()) {
      return {
        preferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
        permissionStatus,
      };
    }

    const data = snapshot.data() ?? {};
    const expoPushToken = typeof data.expoPushToken === 'string' ? data.expoPushToken : undefined;
    const storedPreferences = normalizePreferences(data[NOTIFICATION_FIELD]);

    return {
      preferences: storedPreferences,
      expoPushToken,
      permissionStatus,
    };
  } catch (error) {
    console.warn(`Failed to fetch notification settings for ${userId}`, error);
    return {
      preferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
      permissionStatus,
    };
  }
}

export async function updateNotificationPreferences(
  userId: string,
  updates: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  const current = await fetchNotificationSettings(userId);
  const nextPreferences = {
    ...current.preferences,
    ...updates,
  };

  await setDoc(
    doc(db, USERS_COLLECTION, userId),
    {
      [NOTIFICATION_FIELD]: nextPreferences,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );

  return nextPreferences;
}

export async function persistExpoPushToken(userId: string, token: string): Promise<void> {
  await setDoc(
    doc(db, USERS_COLLECTION, userId),
    {
      expoPushToken: token,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

export async function requestPushPermissions(): Promise<{
  status: Notifications.PermissionStatus;
  token?: string;
}> {
  try {
    let permissionResponse = await Notifications.getPermissionsAsync();
    if (permissionResponse.status !== 'granted') {
      permissionResponse = await Notifications.requestPermissionsAsync();
    }

    if (permissionResponse.status !== 'granted') {
      return { status: permissionResponse.status };
    }

    await ensureAndroidChannelAsync();

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId ??
      process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

    if (!projectId) {
      console.warn('Missing Expo project ID for push token generation.');
      return { status: permissionResponse.status };
    }

    const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
    return { status: permissionResponse.status, token: pushToken.data };
  } catch (error) {
    console.warn('Unable to request push notification permissions', error);
    return { status: 'denied' };
  }
}
