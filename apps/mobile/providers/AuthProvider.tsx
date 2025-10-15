import { ReactNode, createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

import { auth } from '@/lib/firebase';

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<User | null>;
  signUp: (email: string, password: string) => Promise<User | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const hasSeededAdmin = useRef(false);

  const adminEmail = process.env.EXPO_PUBLIC_ADMIN_EMAIL;
  const adminPassword = process.env.EXPO_PUBLIC_ADMIN_PASSWORD;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (hasSeededAdmin.current || user || !adminEmail || !adminPassword) {
      return;
    }

    hasSeededAdmin.current = true;

    const ensureAdminAccount = async () => {
      try {
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      } catch (error) {
        const firebaseError = error as FirebaseError;
        if (firebaseError.code === 'auth/user-not-found') {
          await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        } else if (
          firebaseError.code === 'auth/invalid-credential' ||
          firebaseError.code === 'auth/wrong-password'
        ) {
          console.warn(
            'Admin account exists but the password in EXPO_PUBLIC_ADMIN_PASSWORD does not match the Firebase user.',
          );
        } else {
          console.warn('Failed to ensure admin account is available.', firebaseError);
        }
      } finally {
        if (auth.currentUser?.email === adminEmail) {
          await firebaseSignOut(auth);
        }
      }
    };

    void ensureAdminAccount();
  }, [adminEmail, adminPassword, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      async signIn(email: string, password: string) {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        setUser(credential.user);
        return credential.user;
      },
      async signUp(email: string, password: string) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        setUser(credential.user);
        return credential.user;
      },
      async signOut() {
        await firebaseSignOut(auth);
        setUser(null);
      },
    }),
    [user, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
