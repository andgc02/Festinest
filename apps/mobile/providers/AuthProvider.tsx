import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

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
