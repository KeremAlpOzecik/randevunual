'use client';

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="min-w-0 truncate text-base font-semibold tracking-tight text-slate-950 sm:text-lg"
        >
          randevunual.com.tr
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex lg:gap-8">
          <a href="#how-it-works" className="transition hover:text-slate-950">
            Nasıl Çalışır
          </a>
          <a href="#features" className="transition hover:text-slate-950">
            Özellikler
          </a>
          <a href="#faq" className="transition hover:text-slate-950">
            SSS
          </a>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/giris"
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 sm:px-4 sm:text-sm"
          >
            Giriş
          </Link>
          <Link
            href="/kayit"
            className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 sm:px-5 sm:text-sm"
          >
            <span className="sm:hidden">Kayıt</span>
            <span className="hidden sm:inline">Ücretsiz Kayıt Ol</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
