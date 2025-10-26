import { doc, getDoc, setDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';

const USERS_COLLECTION = 'users';
const ENTITLEMENTS_SUBCOLLECTION = 'entitlements';
const PREMIUM_DOC_ID = 'premium';

export type PremiumStatusValue = 'inactive' | 'preview' | 'active';

export type PremiumEntitlement = {
  status: PremiumStatusValue;
  expiresAt?: string;
  updatedAt: string;
  activatedAt?: string;
};

const DEFAULT_ENTITLEMENT: PremiumEntitlement = {
  status: 'inactive',
  updatedAt: new Date(0).toISOString(),
};

export async function fetchPremiumEntitlement(userId: string): Promise<PremiumEntitlement> {
  try {
    const snapshot = await getDoc(doc(db, USERS_COLLECTION, userId, ENTITLEMENTS_SUBCOLLECTION, PREMIUM_DOC_ID));
    if (!snapshot.exists()) {
      return DEFAULT_ENTITLEMENT;
    }
    const data = snapshot.data() ?? {};
    const status = (typeof data.status === 'string' ? data.status : 'inactive') as PremiumStatusValue;
    const expiresAt = typeof data.expiresAt === 'string' ? data.expiresAt : undefined;
    const updatedAt = typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString();
    const activatedAt = typeof data.activatedAt === 'string' ? data.activatedAt : undefined;
    return { status, expiresAt, updatedAt, activatedAt };
  } catch (error) {
    console.warn('Failed to fetch premium entitlement', error);
    return DEFAULT_ENTITLEMENT;
  }
}

export async function activatePremiumPreview(userId: string, durationDays = 7): Promise<PremiumEntitlement> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();
  const payload: PremiumEntitlement = {
    status: 'preview',
    activatedAt: now.toISOString(),
    expiresAt,
    updatedAt: now.toISOString(),
  };

  await setDoc(
    doc(db, USERS_COLLECTION, userId, ENTITLEMENTS_SUBCOLLECTION, PREMIUM_DOC_ID),
    payload,
    { merge: true },
  );

  return payload;
}

export async function grantPremiumAccess(userId: string): Promise<PremiumEntitlement> {
  const now = new Date();
  const payload: PremiumEntitlement = {
    status: 'active',
    activatedAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  await setDoc(
    doc(db, USERS_COLLECTION, userId, ENTITLEMENTS_SUBCOLLECTION, PREMIUM_DOC_ID),
    payload,
    { merge: true },
  );

  return payload;
}
