"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { User, onAuthStateChanged } from "@/lib/firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/config";
import { checkIsAdmin } from "@/lib/firebase/admin-firestore";
import { isAdminEmail } from "@/lib/admin";
import {
  StoredUser,
  saveUserToStorage,
  getUserFromStorage,
  clearUserFromStorage,
  firebaseUserToStored,
} from "@/lib/auth-storage";

interface AuthContextType {
  user: StoredUser | null;
  isAdmin: boolean;
  loading: boolean;
  configured: boolean;
  setUserFromLogin: (user: User) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  configured: false,
  setUserFromLogin: () => {},
  clearSession: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfigured();

  const resolveAdmin = useCallback(async (authUser: User) => {
    return true; // All authenticated users are admins now
  }, []);

  const setUserFromLogin = useCallback((authUser: User) => {
    const stored = firebaseUserToStored(authUser);
    saveUserToStorage(stored);
    setUser(stored);
    void resolveAdmin(authUser).then(setIsAdmin);
  }, [resolveAdmin]);

  const clearSession = useCallback(() => {
    clearUserFromStorage();
    setUser(null);
    setIsAdmin(false);
  }, []);

  useEffect(() => {
    const stored = getUserFromStorage();
    if (stored) setUser(stored);

    if (!configured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (authUser) => {
      if (authUser) {
        const storedUser = firebaseUserToStored(authUser);
        saveUserToStorage(storedUser);
        setUser(storedUser);
        const admin = await resolveAdmin(authUser);
        setIsAdmin(admin);
      } else {
        clearUserFromStorage();
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [configured, resolveAdmin]);

  return (
    <AuthContext.Provider
      value={{ user, isAdmin, loading, configured, setUserFromLogin, clearSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
