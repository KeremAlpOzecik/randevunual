import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { initAuthPersistence } from "./auth-session";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.appId) {
  throw new Error(
    "Firebase yapılandırması eksik: .env.local dosyanızdaki NEXT_PUBLIC_FIREBASE_* ayarlarını kontrol edin."
  );
}

if (!firebaseConfig.storageBucket) {
  console.warn(
    "[Firebase] NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET tanımlı değil. Logo yükleme devre dışı kalır."
  );
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

if (typeof window !== "undefined") {
  void initAuthPersistence(app);
}

export const db = getFirestore(app);
export function getAuthClient() {
  return getAuth(app);
}
export function getStorageClient() {
  return getStorage(app);
}
