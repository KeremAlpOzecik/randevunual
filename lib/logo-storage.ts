import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getStorageClient } from "./firebase";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function isFirebaseStorageConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim());
}

export function validateLogoFile(file: File): string | null {
  if (!ALLOWED_MIME.has(file.type)) {
    return "Sadece JPG, PNG, WebP veya GIF yükleyebilirsiniz.";
  }
  if (file.size > MAX_LOGO_BYTES) {
    return "Logo en fazla 2 MB olabilir.";
  }
  return null;
}

function sanitizeExtension(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
  return ext.replace(/[^a-z0-9]/g, "") || "jpg";
}

export async function uploadBusinessLogo(
  ownerUid: string,
  businessSlug: string,
  file: File
): Promise<string> {
  if (!isFirebaseStorageConfigured()) {
    throw new Error(
      "Firebase Storage yapılandırılmamış. .env.local dosyanıza NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ekleyin (ör. proje-id.appspot.com)."
    );
  }

  const validationError = validateLogoFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const storage = getStorageClient();
  const ext = sanitizeExtension(file.name);
  const objectPath = `logos/${ownerUid}/${businessSlug}/logo-${Date.now()}.${ext}`;
  const logoRef = ref(storage, objectPath);

  await uploadBytes(logoRef, file, {
    contentType: file.type,
    customMetadata: {
      businessSlug,
      uploadedBy: ownerUid,
    },
  });

  return getDownloadURL(logoRef);
}
