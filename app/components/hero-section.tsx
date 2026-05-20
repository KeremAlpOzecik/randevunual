'use client';

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-16 text-white shadow-xl sm:px-12 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm uppercase tracking-[0.28em] text-slate-300">Esnaf için dijital randevu</p>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
          Telefon trafiğine son. Dükkanınız için 1 dakikada dijital randevu sisteminizi kurun.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
          Müşteri yalnızca adı ve numarası ile randevu seçer. Esnaf kontrol eder: onayla veya reddet. Her adımda WhatsApp bilgilendirmesiyle hızlı ve güvenilir süreç.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <a
            href="#register"
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600"
          >
            Hemen Ücretsiz Başla
          </a>
          <a
            href="#esnaflar"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Sistemi İncele / Esnafları Gör
          </a>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-white/10 p-5 text-sm text-slate-100 shadow-sm backdrop-blur-sm">
            <p className="font-semibold text-white">Hızlı kurulum</p>
            <p className="mt-2 text-slate-300">Kurulumda teknik bilgi gerekmez, birkaç dakikada hazır.</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-5 text-sm text-slate-100 shadow-sm backdrop-blur-sm">
            <p className="font-semibold text-white">WhatsApp entegrasyonu</p>
            <p className="mt-2 text-slate-300">Talep reddedildiğinde veya onaylandığında müşteri otomatik bilgilendirilir.</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-5 text-sm text-slate-100 shadow-sm backdrop-blur-sm">
            <p className="font-semibold text-white">Ücretsiz başlangıç</p>
            <p className="mt-2 text-slate-300">%100 ücretsiz başlayın, esnaf panelinizi hemen kullanın.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
