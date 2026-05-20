function siteUrlFromEnv(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    return null;
  }
  return raw.replace(/\/$/, "");
}

/** Yayınlanan site kökü — linkler ve WhatsApp metinleri için */
export function getSiteOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const fromEnv = siteUrlFromEnv();
  if (fromEnv) {
    return fromEnv;
  }

  // Vercel önizleme / deploy (özel domain için NEXT_PUBLIC_SITE_URL şart)
  const vercelHost = process.env.VERCEL_URL?.trim();
  if (vercelHost) {
    return `https://${vercelHost}`;
  }

  return "http://localhost:3000";
}

export function publicStorePath(slug: string): string {
  return `/${slug}`;
}

export function publicStoreUrl(slug: string): string {
  return `${getSiteOrigin()}${publicStorePath(slug)}`;
}
