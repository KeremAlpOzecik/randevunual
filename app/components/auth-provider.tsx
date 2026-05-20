'use client';

import { onAuthStateChanged, type User } from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getAuthClient } from "../../lib/firebase";
import { applyAuthPersistence } from "../../lib/auth-session";

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    applyAuthPersistence(getAuthClient())
      .then(() => {
        const auth = getAuthClient();
        unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setReady(true);
        });
      })
      .catch((error) => {
        console.error("[Auth] Oturum başlatılamadı:", error);
        setReady(true);
      });

    return () => {
      unsubscribe?.();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      isAuthenticated: Boolean(user),
    }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth yalnızca AuthProvider içinde kullanılabilir.");
  }
  return context;
}

export function useAuthOptional() {
  return useContext(AuthContext);
}
