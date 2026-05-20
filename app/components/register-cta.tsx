'use client';

import Link from "next/link";

export default function RegisterCTA() {
  return (
    <section id="register" className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Esnaf Kayıt</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">Dükkanınızı dijital randevuya taşıyın</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Esnaf kayıt formunu doldurup sisteminizi birkaç dakika içinde yayına alın. Müşterileriniz artık saat seçip talep gönderebilir, siz de onay/red akışı ile süreci rahatça yönetin.
          </p>
        </div>
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Esnaf için hızlı başlangıç</p>
          <p className="text-sm leading-7 text-slate-600">
            Kayıt formu ve üyelik sayfaları hazır. İstediğiniz zaman dükkan bilgilerinizi güncelleyebilir, yeni randevu akışınızı yönetebilirsiniz.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/register"
              className="rounded-full bg-emerald-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Ücretsiz Kayıt Ol
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:border-slate-300"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
