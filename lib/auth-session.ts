import {
  browserLocalPersistence,
  browserSessionPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from "firebase/auth";
import type { FirebaseApp } from "firebase/app";

export const ESNAF_LOGIN_PATH = "/giris";
export const ESNAF_DASHBOARD_PATH = "/dashboard";

let persistenceMode: "local" | "session" = "local";
let persistenceInit: Promise<void> | null = null;

export function getAuthPersistenceMode(): "local" | "session" {
  return persistenceMode;
}

/** Tarayıcı kapansa bile oturum kalsın (varsayılan esnaf davranışı) */
export function configureAuthPersistence(rememberMe: boolean): Promise<void> {
  persistenceMode = rememberMe ? "local" : "session";
  persistenceInit = null;
  return applyAuthPersistence();
}

export function applyAuthPersistence(auth?: Auth): Promise<void> {
  const instance = auth ?? getAuth();
  const mode = persistenceMode === "local" ? browserLocalPersistence : browserSessionPersistence;
  persistenceInit = setPersistence(instance, mode);
  return persistenceInit;
}

export function initAuthPersistence(app: FirebaseApp): Promise<void> {
  const auth = getAuth(app);
  if (!persistenceInit) {
    persistenceInit = setPersistence(auth, browserLocalPersistence);
  }
  return persistenceInit;
}
