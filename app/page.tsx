'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Esnaf, EsnafProfile } from "../lib/esnaf";

export default function Home() {
  const [esnaflar, setEsnaflar] = useState<Esnaf[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEsnaflar() {
      try {
        const snapshot = await getDocs(collection(db, "isletmeler"));
        const list: Esnaf[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as EsnafProfile;
          return {
            slug: data.slug || docSnap.id,
            name: data.isletmeAdi,
            phone: data.telefon,
            cities: data.adres?.split(",").pop()?.trim() || "Türkiye",
            description: data.bio || data.slogan || "",
            headline: data.slogan,
            logoUrl: data.logoUrl,
          };
        });
        list.sort((a, b) => a.name.localeCompare(b.name, "tr"));
        setEsnaflar(list);
      } catch (err) {
        console.error(err);
        setError("Esnaf listesi yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    }

    loadEsnaflar();
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 text-slate-900 sm:px-6 sm:py-8">
      <header className="sticky top-0 z-40 mb-8 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-xl sm:mb-10 sm:rounded-3xl sm:px-6 sm:py-4 lg:px-10">
        <div className="mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-lg font-semibold tracking-tight text-slate-950">randevunual</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              ESNAF İÇİN
            </span>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-slate-950">
              Özellikler
            </a>
            <a href="#how-it-works" className="transition hover:text-slate-950">
              Nasıl Çalışır
            </a>
            <a href="#esnaflar" className="transition hover:text-slate-950">
              Esnaflar
            </a>
            <a href="#faq" className="transition hover:text-slate-950">
              SSS
            </a>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/giris"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            >
              Giriş Yap
            </Link>
            <Link
              href="/kayit"
              className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Kayıt Ol
            </Link>
          </div>
        </div>
      </header>

      <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-16">
        <div className="mx-auto flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-200 backdrop-blur-sm">
              Esnaf için dijital randevu
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Telefon trafiğine son. Dükkanınız için 1 dakikada dijital randevu sisteminizi kurun.
              </h1>
              <p className="max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                Müşteri adını ve telefonunu girdikten sonra talep gönderir, siz de onay/red mekanizmasıyla süreci kontrol edersiniz. WhatsApp bilgilendirmesiyle her adım takipte.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/kayit"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600"
              >
                Hemen Başla
              </Link>
              <a
                href="#esnaflar"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Esnafları Gör
              </a>
            </div>
          </div>

          <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 text-slate-100 shadow-2xl shadow-slate-950/20 sm:p-8">
            <div className="grid gap-3 rounded-3xl bg-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Hemen kullanmaya hazır</p>
              <p className="text-lg font-semibold">Esnaf kayıt ve randevu yönetimi tek ekranda.</p>
            </div>
            <div className="grid gap-3 rounded-3xl bg-white/10 p-5 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-950/70 p-4">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-300">Esnaf kontrolü</p>
                <p className="mt-2 text-sm text-slate-200">Bekleyen talepleri onaylayın veya reddedin.</p>
              </div>
              <div className="rounded-3xl bg-slate-950/70 p-4">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-300">WhatsApp bildirim</p>
                <p className="mt-2 text-sm text-slate-200">Her isteğe hızlıca bilgilendirme gönderin.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-emerald-700">Özellikler</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">Esnafınıza uygun avantajlar</h2>
          <p className="mt-4 max-w-2xl text-slate-600">
            Müşteri ve esnaf arasındaki en hızlı randevu akışını sağlayın; gereksiz adımları kaldırın ve işlemleri tek panelden yönetin.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Esnaf kontrolü her zaman sizde",
                description: "Bekleyen randevuları onaylayın veya reddedin. Müşteri sadece talep gönderir, karar size ait olur.",
              },
              {
                title: "Üye olmadan randevu",
                description: "Müşterinin arayışını basitleştirin: telefon ve isim ile hızlı rezervasyon.",
              },
              {
                title: "Kolay esnaf yönetimi",
                description: "Esnaf profillerini yönet, slug ve hizmet bilgilerini düzenle, tek ekrandan takip et.",
              },
              {
                title: "Gerçek zamanlı bildirim",
                description: "Onay ya da red durumunda müşteri WhatsApp üzerinden hızlıca bilgilendirilir.",
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300">
                <p className="text-lg font-semibold text-slate-950">{feature.title}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Esnaf için hızlı başlangıç</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-950">Dükkanınızı dijital hale getirin</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Kayıt formunu doldurun, hizmet bilgilerinizi ekleyin ve randevu talep akışını hemen aktif edin.
            </p>
          </div>
          <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-700">Adım 1</p>
              <p className="mt-2 text-sm text-slate-600">Esnaf hesabınızı oluşturun.</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-700">Adım 2</p>
              <p className="mt-2 text-sm text-slate-600">Hizmet bilgileri ve WhatsApp numaranızı girin.</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-700">Adım 3</p>
              <p className="mt-2 text-sm text-slate-600">Randevu taleplerini onaylayın, müşteri bilgilensin.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Nasıl çalışır</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">3 adımda esnaf randevu akışı</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "1. Esnaf kaydı",
              description: "Sistem üzerinde hesap oluşturun, mağaza bilgilerinizi ve hizmet detaylarını ekleyin.",
            },
            {
              title: "2. Müşteri talebi",
              description: "Müşteri telefon ve isim ile randevu talep gönderir, bekleme listesi oluşur.",
            },
            {
              title: "3. Onay ve bildirimi",
              description: "Talebi onaylayın veya reddedin; sonuç WhatsApp üzerinden müşteriye iletilir.",
            },
          ].map((step) => (
            <div key={step.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">{step.title}</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="esnaflar" className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Aktif Esnaflar</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Sistemde kayıtlı esnaf profilleri</h2>
          </div>
          <Link
            href="/kayit"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Esnaf Kaydı Oluştur
          </Link>
        </div>

        {error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">{error}</div>
        ) : isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Yükleniyor...</div>
        ) : esnaflar.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Henüz kayıtlı esnaf bulunamadı.</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {esnaflar.map((esnaf) => (
              <Link
                key={esnaf.slug}
                href={`/${esnaf.slug}`}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
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

      <section id="faq" className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Sıkça Sorulan Sorular</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">Esnafın en çok sorduğu sorular</h2>
        </div>
        <div className="grid gap-4">
          {[
            {
              question: "Esnaf kaydı gerçekten ücretsiz mi?",
              answer: "Evet, Randevunual ile esnaf kaydınız için başlangıçta hiçbir ücret almayız. %100 ücretsiz başlayabilirsiniz.",
            },
            {
              question: "Müşteri üye olmak zorunda mı?",
              answer: "Hayır, müşteri sadece adını ve telefon numarasını girerek randevu talebi oluşturabilir.",
            },
            {
              question: "Reddetme durumunda müşteri nasıl haberdar edilir?",
              answer: "Randevu reddedildiğinde sistem otomatik olarak WhatsApp üzerinden bilgilendirme bağlantısı oluşturur.",
            },
          ].map((faq) => (
            <div key={faq.question} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <p className="font-semibold text-slate-950">{faq.question}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
