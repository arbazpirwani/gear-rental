import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { ADMIN_EMAILS, auth, isFirebaseConfigured } from './firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutNow: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: false,
  isAdmin: false,
  signInWithGoogle: async () => {},
  signOutNow: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(isFirebaseConfigured);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const isAdmin =
    !!user?.email &&
    ADMIN_EMAILS.length > 0 &&
    ADMIN_EMAILS.includes(user.email.toLowerCase());

  async function signInWithGoogle() {
    if (!auth) throw new Error('Firebase not configured.');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function signOutNow() {
    if (!auth) return;
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signInWithGoogle, signOutNow }}>
      {children}
    </AuthContext.Provider>
  );
}
