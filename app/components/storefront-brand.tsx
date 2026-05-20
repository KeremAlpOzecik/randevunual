'use client';

import type { EsnafProfile } from "../../lib/esnaf";
import type { StorefrontThemeClasses } from "../../lib/storefront-theme";

type Props = {
  profile: EsnafProfile;
  theme: StorefrontThemeClasses;
  useDark: boolean;
  accentColor: string;
  showBookingCta?: boolean;
};

export default function StorefrontBrand({
  profile,
  theme,
  useDark,
  accentColor,
  showBookingCta = false,
}: Props) {
  const instagram = profile.instagram?.replace(/^@/, "");
  const initials = profile.isletmeAdi?.trim().charAt(0).toLocaleUpperCase("tr-TR") || "?";

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {profile.logoUrl ? (
            <img
              src={profile.logoUrl}
              alt={`${profile.isletmeAdi} logosu`}
              className="h-14 w-14 shrink-0 rounded-2xl border border-slate-200/80 bg-white object-contain p-2 sm:h-16 sm:w-16"
            />
          ) : (
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold sm:h-16 sm:w-16 sm:text-xl"
              style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
              aria-hidden
            >
              {initials}
            </div>
          )}
          <div className="min-w-0">
            {instagram ? (
              <p className={`text-xs font-medium ${theme.label}`}>@{instagram}</p>
            ) : null}
            <h1 className={`mt-0.5 text-xl font-semibold tracking-tight sm:text-2xl ${theme.title}`}>
              {profile.isletmeAdi}
            </h1>
          </div>
        </div>
      </div>

      {(profile.slogan || profile.bio) && (
        <div className={`rounded-2xl px-4 py-3.5 ${theme.section}`}>
          {profile.slogan ? (
            <>
              <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${theme.label}`}>
                Slogan
              </p>
              <p className={`mt-2 text-sm leading-relaxed ${theme.body}`}>{profile.slogan}</p>
            </>
          ) : null}
          {profile.bio ? (
            <div className={profile.slogan ? "mt-4" : ""}>
              <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${theme.label}`}>
                Hakkımızda
              </p>
              <p className={`mt-2 text-sm leading-relaxed ${theme.body}`}>{profile.bio}</p>
            </div>
          ) : null}
        </div>
      )}

      <div className={`rounded-2xl px-4 py-3.5 ${theme.section}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${theme.label}`}>
            Çalışma saatleri
          </p>
          <p className={`text-sm font-medium ${theme.body}`}>
            {profile.calismaSaatleri?.baslangic || "09:00"} – {profile.calismaSaatleri?.bitis || "19:00"}
          </p>
        </div>
        {profile.adres ? (
          <p className={`mt-3 text-sm leading-relaxed ${theme.body}`}>{profile.adres}</p>
        ) : null}
      </div>

      {profile.hizmetler?.length ? (
        <div className={`rounded-2xl px-4 py-3.5 ${theme.section}`}>
          <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${theme.label}`}>
            Hizmetler
          </p>
          <ul className="mt-3 space-y-2">
            {profile.hizmetler.map((item) => (
              <li
                key={item.id}
                className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 ${
                  item.id === "draft-preview" ? theme.serviceItemDraft : theme.serviceItem
                }`}
              >
                <span className={`text-sm font-semibold ${theme.title}`}>{item.ad}</span>
                <span className={`shrink-0 text-xs ${theme.label}`}>
                  {item.fiyat} · {item.sure}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {showBookingCta ? (
        <button
          type="button"
          className="w-full rounded-2xl py-3.5 text-sm font-semibold text-white shadow-sm"
          style={{ backgroundColor: accentColor }}
        >
          Randevu Talep Et
        </button>
      ) : null}
    </div>
  );
}
