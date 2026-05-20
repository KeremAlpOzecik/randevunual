'use client';

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { EsnafProfile } from "../../lib/esnaf";
import { loadEsnafBySlug } from "../../lib/load-esnaf";
import { useStorefrontTheme } from "../components/use-storefront-theme";
import StorefrontBrand from "../components/storefront-brand";
import BookingForm from "./booking-form";

function resolveSlug(raw: string | string[] | undefined): string | null {
  if (!raw) {
    return null;
  }
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = value?.trim();
  return trimmed || null;
}

export default function EsnafPage() {
  const routeParams = useParams();
  const slug = useMemo(() => resolveSlug(routeParams.esnafSlug), [routeParams.esnafSlug]);

  const [profile, setProfile] = useState<EsnafProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { useDark, accentColor, theme } = useStorefrontTheme(profile);

  useEffect(() => {
    if (!slug) {
      setError("Geçersiz mağaza adresi.");
      setIsLoading(false);
      return;
    }

    const activeSlug = slug;
    let cancelled = false;

    async function load(currentSlug: string) {
      setIsLoading(true);
      setError(null);
      try {
        const data = await loadEsnafBySlug(currentSlug);
        if (cancelled) {
          return;
        }
        if (!data) {
          setProfile(null);
          setError(`"${currentSlug}" adlı işletme bulunamadı.`);
          return;
        }
        setProfile(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("İşletme bilgileri yüklenirken bir hata oluştu.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load(activeSlug);
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <main className={`flex items-center justify-center px-6 py-16 ${theme.pageBg}`}>
        <div className={`rounded-3xl border px-8 py-6 shadow-sm ${theme.loadingCard}`}>
          Mağaza yükleniyor...
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className={`flex flex-col items-center justify-center gap-6 px-6 py-16 ${theme.pageBg}`}>
        <div className="max-w-md rounded-3xl border border-red-200 bg-red-50 px-8 py-6 text-center text-red-700">
          {error ?? "İşletme bulunamadı."}
        </div>
        <Link
          href="/"
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Ana Sayfaya Dön
        </Link>
      </main>
    );
  }

  return (
    <main className={`${theme.pageBg} px-4 py-8 sm:px-6 sm:py-10`}>
      <div className="mx-auto max-w-lg space-y-6">
        <div
          className={`overflow-hidden rounded-[1.75rem] border shadow-sm ${theme.cardBorder} ${theme.card}`}
        >
          <div className="h-1.5 w-full" style={{ backgroundColor: accentColor }} aria-hidden />
          <div className="p-6 sm:p-8">
            <StorefrontBrand
              profile={profile}
              theme={theme}
              useDark={useDark}
              accentColor={accentColor}
            />
          </div>
        </div>

        <BookingForm
          profile={profile}
          accentColor={accentColor}
          theme={theme}
          useDark={useDark}
        />

        <p className={`text-center text-xs ${theme.footerLink}`}>
          <Link href="/" className="underline-offset-2 hover:underline">
            Randevunual
          </Link>
        </p>
      </div>
    </main>
  );
}
