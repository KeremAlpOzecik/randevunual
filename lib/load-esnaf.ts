import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { EsnafProfile } from "./esnaf";

export async function loadEsnafBySlug(slug: string): Promise<EsnafProfile | null> {
  const trimmed = slug?.trim();
  if (!trimmed) {
    return null;
  }

  const snapshot = await getDoc(doc(db, "isletmeler", trimmed));
  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as EsnafProfile;
}
