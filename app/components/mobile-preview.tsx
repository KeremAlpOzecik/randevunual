'use client';

import type { EsnafProfile } from "../../lib/esnaf";
import { useStorefrontTheme } from "./use-storefront-theme";
import StorefrontBrand from "./storefront-brand";

type MobilePreviewProps = {
  profile: EsnafProfile | null;
  isLiveDraft?: boolean;
};

export default function MobilePreview({ profile, isLiveDraft = false }: MobilePreviewProps) {
  const { useDark, accentColor, theme } = useStorefrontTheme(profile);

  if (!profile) {
    return null;
  }

  return (
    <div className="flex flex-col font-sans">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Mobil Canlı Önizleme
        </p>
        {isLiveDraft ? (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200/80">
            Kaydedilmedi
          </span>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-xl sm:p-8">
        <div className="mx-auto w-full max-w-[268px]">
          <div className={`rounded-[1.75rem] border p-[9px] ${theme.phoneBezel}`}>
            <div className={`overflow-hidden rounded-[1.25rem] border ${theme.phoneScreen}`}>
              <div className="flex justify-center pb-1 pt-3">
                <div className={`h-1 w-14 rounded-full ${theme.phoneNotch}`} aria-hidden />
              </div>
              <div className="space-y-4 px-4 pb-5 pt-1">
                <StorefrontBrand
                  profile={profile}
                  theme={theme}
                  useDark={useDark}
                  accentColor={accentColor}
                  showBookingCta
                />
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] text-slate-500">
          Müşteri sayfası bu önizleme ile aynı tema, renk ve içerikle açılır.
        </p>
      </div>
    </div>
  );
}
