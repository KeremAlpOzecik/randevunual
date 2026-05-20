'use client';

import Link from "next/link";
import type { Esnaf } from "../../lib/esnaf";

type Props = {
  esnaflar: Esnaf[];
  isLoading: boolean;
  error: string | null;
};

export default function EsnafGrid({ esnaflar, isLoading, error }: Props) {
  return (
    <section id="esnaflar" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Canlı Esnaf Listesi</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">Şu anda sistemde yer alan esnaflar</h2>
        </div>
        <Link
          href="/register"
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Esnaf Ol ve Başla
        </Link>
      </div>

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">{error}</div>
      ) : isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600 shadow-sm">Yükleniyor...</div>
      ) : esnaflar.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600 shadow-sm">Henüz kayıtlı esnaf bulunamadı.</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {esnaflar.map((esnaf) => (
            <Link
              key={esnaf.slug}
              href={`/${esnaf.slug}`}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold text-slate-950">{esnaf.name}</p>
                  <p className="mt-2 text-sm text-slate-600">{esnaf.headline || esnaf.description}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-800">
                  {esnaf.cities}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
