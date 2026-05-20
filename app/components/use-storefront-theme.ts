'use client';

import { useEffect, useMemo, useState } from "react";
import type { EsnafProfile } from "../../lib/esnaf";
import {
  getAccentColor,
  getStorefrontClasses,
  resolveIsDark,
  type StorefrontThemeClasses,
} from "../../lib/storefront-theme";

export function useStorefrontTheme(profile: EsnafProfile | null) {
  const [prefersDark, setPrefersDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setPrefersDark(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const useDark = useMemo(
    () => resolveIsDark(profile?.themePreference, prefersDark),
    [profile?.themePreference, prefersDark]
  );

  const accentColor = getAccentColor(profile);
  const theme: StorefrontThemeClasses = useMemo(() => getStorefrontClasses(useDark), [useDark]);

  return { useDark, accentColor, theme, prefersDark };
}
