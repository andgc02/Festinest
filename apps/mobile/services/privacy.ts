import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';

const USERS_COLLECTION = 'users';
const PRIVACY_FIELD = 'privacySettings';

export type ProfileVisibility = 'public' | 'friends' | 'private';

export type PrivacySettings = {
  profileVisibility: ProfileVisibility;
  dataSharing: boolean;
  personalizedTips: boolean;
};

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisibility: 'friends',
  dataSharing: false,
  personalizedTips: true,
};

function normalizePrivacySettings(input: unknown): PrivacySettings {
  if (!input || typeof input !== 'object') {
    return { ...DEFAULT_PRIVACY_SETTINGS };
  }
  const value = input as Record<string, unknown>;
  const profileVisibility = ['public', 'friends', 'private'].includes(String(value.profileVisibility))
    ? (value.profileVisibility as ProfileVisibility)
    : DEFAULT_PRIVACY_SETTINGS.profileVisibility;
  const dataSharing =
    typeof value.dataSharing === 'boolean' ? value.dataSharing : DEFAULT_PRIVACY_SETTINGS.dataSharing;
  const personalizedTips =
    typeof value.personalizedTips === 'boolean' ? value.personalizedTips : DEFAULT_PRIVACY_SETTINGS.personalizedTips;
  return { profileVisibility, dataSharing, personalizedTips };
}

export async function fetchPrivacySettings(userId: string): Promise<PrivacySettings> {
  try {
    const snapshot = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!snapshot.exists()) {
      return { ...DEFAULT_PRIVACY_SETTINGS };
    }
    const data = snapshot.data() ?? {};
    return normalizePrivacySettings(data[PRIVACY_FIELD]);
  } catch (error) {
    console.warn('Failed to load privacy settings', error);
    return { ...DEFAULT_PRIVACY_SETTINGS };
  }
}

export async function persistPrivacySettings(userId: string, settings: PrivacySettings): Promise<void> {
  await setDoc(
    doc(db, USERS_COLLECTION, userId),
    {
      [PRIVACY_FIELD]: settings,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

export async function requestDataExport(userId: string): Promise<string> {
  const docRef = await addDoc(collection(db, USERS_COLLECTION, userId, 'privacyRequests'), {
    type: 'export',
    requestedAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function requestDataDeletion(userId: string): Promise<string> {
  const docRef = await addDoc(collection(db, USERS_COLLECTION, userId, 'privacyRequests'), {
    type: 'delete',
    requestedAt: new Date().toISOString(),
  });
  return docRef.id;
}
