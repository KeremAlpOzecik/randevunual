'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FormEvent, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { configureAuthPersistence, ESNAF_DASHBOARD_PATH } from "../../lib/auth-session";
import { db, getAuthClient } from "../../lib/firebase";
import type { CalismaSaatleri } from "../../lib/esnaf";
import EsnafGuestOnly from "../components/esnaf-guest-only";

const defaultHour: CalismaSaatleri = { baslangic: "09:00", bitis: "19:00" };
const timeOptions = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function KayitPage() {
  return (
    <EsnafGuestOnly>
      <KayitForm />
    </EsnafGuestOnly>
  );
}

function KayitForm() {
  const router = useRouter();
  const [isletmeAdi, setIsletmeAdi] = useState("");
  const [esnafAdSoyad, setEsnafAdSoyad] = useState("");
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [telefon, setTelefon] = useState("");
  const [calismaSaatleri, setCalismaSaatleri] = useState<CalismaSaatleri>(defaultHour);
  const [adres, setAdres] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ensureUniqueSlug(baseSlug: string) {
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const snapshot = await getDoc(doc(db, "isletmeler", slug));
      if (!snapshot.exists()) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isletmeAdi || !esnafAdSoyad || !eposta || !sifre || !telefon) {
      setError("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    setLoading(true);

    try {
      await configureAuthPersistence(true);
      const auth = getAuthClient();
      const credential = await createUserWithEmailAndPassword(auth, eposta, sifre);
      const user = credential.user;
      const baseSlug = slugify(isletmeAdi);
      const slug = await ensureUniqueSlug(baseSlug || `isletme-${Date.now()}`);

      await setDoc(doc(db, "isletmeler", slug), {
        uid: user.uid,
        isletmeAdi,
        esnafAdSoyad,
        eposta,
        telefon,
        slug,
        calismaSaatleri,
        adres,
        hizmetler: [],
        kapaliGunler: [],
        gunlukKapaliAraliklar: [],
        createdAt: serverTimestamp(),
      });

      router.replace(ESNAF_DASHBOARD_PATH);
    } catch (createError: any) {
      console.error(createError);
      if (createError?.code === "auth/configuration-not-found") {
        setError(
          "Firebase Auth yapılandırması bulunamadı. .env.local ayarlarını kontrol edin ve Firebase Auth Email/Password sağlayıcısını etkinleştirin."
        );
      } else if (createError?.code === "auth/email-already-in-use") {
        setError("Bu e-posta zaten kullanılıyor. Lütfen farklı bir e-posta deneyin.");
      } else if (createError?.code === "auth/invalid-email") {
        setError("Lütfen geçerli bir e-posta adresi girin.");
      } else {
        setError(createError?.message || "Kayıt sırasında bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 sm:py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:rounded-[2rem] sm:p-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.28em] text-emerald-700">Esnaf Kayıt</p>
          <h1 className="mt-4 text-2xl font-semibold text-slate-950 sm:text-3xl lg:text-4xl">Dükkanınızı dijital randevu sistemine taşıyın</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            İşletme adınızı, iletişim bilgilerinizi ve WhatsApp numaranızı girin. Kayıt sonrası profiliniz otomatik olarak oluşturulacak ve dashboard'unuza yönlendirileceksiniz.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-slate-700">
              İşletme Adı
              <input
                value={isletmeAdi}
                onChange={(event) => setIsletmeAdi(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-900 focus:outline-none"
                placeholder="Ahmet Berber"
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-700">
              Esnaf Ad Soyad
              <input
                value={esnafAdSoyad}
                onChange={(event) => setEsnafAdSoyad(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-900 focus:outline-none"
                placeholder="Ahmet Yıldız"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-slate-700">
              E-posta
              <input
                value={eposta}
                onChange={(event) => setEposta(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-900 focus:outline-none"
                type="email"
                placeholder="iletisim@isletme.com"
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-700">
              Şifre
              <input
                value={sifre}
                onChange={(event) => setSifre(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-900 focus:outline-none"
                type="password"
                placeholder="●●●●●●●●"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-slate-700">
              Telefon Numarası
              <input
                value={telefon}
                onChange={(event) => setTelefon(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-900 focus:outline-none"
                placeholder="905321234567"
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-700">
              Adres (isteğe bağlı)
              <input
                value={adres}
                onChange={(event) => setAdres(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-900 focus:outline-none"
                placeholder="Cadde No, İlçe, Şehir"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-slate-700">
              Çalışma Başlangıcı
              <select
                value={calismaSaatleri.baslangic}
                onChange={(event) => setCalismaSaatleri({ ...calismaSaatleri, baslangic: event.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-900 focus:outline-none"
              >
                {timeOptions.map((time) => (
                  <option key={`start-${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm text-slate-700">
              Çalışma Bitişi
              <select
                value={calismaSaatleri.bitis}
                onChange={(event) => setCalismaSaatleri({ ...calismaSaatleri, bitis: event.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-900 focus:outline-none"
              >
                {timeOptions.map((time) => (
                  <option key={`end-${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? <div className="rounded-3xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

          <button
            type="submit"
            className="rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            disabled={loading}
          >
            {loading ? "Kaydediliyor..." : "Kayıt Ol ve Dashboard'a Git"}
          </button>
        </form>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          <p className="font-semibold text-slate-950">Not:</p>
          <p className="mt-2">Kayıt işleminiz tamamlandığında kullanıcı hesabınız oluşturulacak ve dashboard sayfanıza yönlendirileceksiniz.</p>
        </div>

        <div className="mt-6 text-sm text-slate-600">
          Zaten hesabınız var mı?{' '}
          <Link href="/giris" className="font-semibold text-emerald-700 hover:text-emerald-900">
            Giriş Yap
          </Link>
        </div>
      </div>
    </main>
  );
}
