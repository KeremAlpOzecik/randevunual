import type { EsnafProfile } from "./esnaf";

export type ThemePreference = "light" | "dark" | "system";

export function resolveIsDark(
  preference: ThemePreference | undefined,
  prefersColorSchemeDark: boolean
): boolean {
  if (preference === "dark") {
    return true;
  }
  if (preference === "light") {
    return false;
  }
  return prefersColorSchemeDark;
}

export function getAccentColor(profile: EsnafProfile | null): string {
  return profile?.primaryColor || "#10b981";
}

export type StorefrontThemeClasses = {
  pageBg: string;
  phoneBezel: string;
  phoneScreen: string;
  phoneNotch: string;
  card: string;
  cardBorder: string;
  section: string;
  label: string;
  body: string;
  title: string;
  badge: string;
  serviceItem: string;
  serviceItemDraft: string;
  bookingCard: string;
  bookingHeaderBorder: string;
  bookingSub: string;
  bookingPanel: string;
  input: string;
  dayDefault: string;
  dayDisabled: string;
  slotDefault: string;
  footerLink: string;
  loadingCard: string;
};

export function getStorefrontClasses(useDark: boolean): StorefrontThemeClasses {
  if (useDark) {
    return {
      pageBg: "min-h-screen bg-slate-950 text-slate-100",
      phoneBezel: "border-slate-600/40 bg-slate-800/80",
      phoneScreen: "border-slate-700/60 bg-slate-950 text-slate-100",
      phoneNotch: "bg-slate-600",
      card: "bg-slate-900",
      cardBorder: "border-slate-800",
      section: "bg-slate-900/80",
      label: "text-slate-500",
      body: "text-slate-300",
      title: "text-slate-100",
      badge: "bg-slate-800 text-slate-400",
      serviceItem: "bg-slate-950/60",
      serviceItemDraft: "border border-dashed border-amber-500/40 bg-slate-950/60",
      bookingCard: "border-slate-800 bg-slate-900 text-slate-100",
      bookingHeaderBorder: "border-slate-800",
      bookingSub: "text-slate-400",
      bookingPanel: "border-slate-700 bg-slate-950",
      input: "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600",
      dayDefault: "border-white/10 bg-slate-900 hover:border-white/20",
      dayDisabled: "border-white/5 bg-white/[0.02] opacity-40",
      slotDefault: "border-white/10 bg-slate-900 text-slate-200 hover:border-white/25",
      footerLink: "text-slate-600 hover:text-slate-400",
      loadingCard: "border-white/10 bg-slate-900 text-slate-400",
    };
  }

  return {
    pageBg: "min-h-screen bg-slate-50 text-slate-900",
    phoneBezel: "border-slate-200/90 bg-gradient-to-b from-slate-50 to-slate-100/80",
    phoneScreen: "border-slate-100 bg-white text-slate-900",
    phoneNotch: "bg-slate-200",
    card: "bg-white",
    cardBorder: "border-slate-200/80",
    section: "bg-slate-50",
    label: "text-slate-400",
    body: "text-slate-700",
    title: "text-slate-900",
    badge: "bg-slate-100 text-slate-500",
    serviceItem: "border border-slate-100 bg-white",
    serviceItemDraft: "border border-dashed border-amber-300 bg-amber-50/50",
    bookingCard: "border-slate-200/80 bg-white text-slate-900",
    bookingHeaderBorder: "border-slate-200",
    bookingSub: "text-slate-500",
    bookingPanel: "border-slate-200 bg-slate-50",
    input: "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400",
    dayDefault: "border-slate-200 bg-white hover:border-slate-300",
    dayDisabled: "border-slate-100 bg-slate-50 opacity-50",
    slotDefault: "border-slate-200 bg-white text-slate-800 hover:border-slate-300",
    footerLink: "text-slate-400 hover:text-slate-600",
    loadingCard: "border-slate-200 bg-white text-slate-600",
  };
}
