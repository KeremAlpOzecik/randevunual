'use client';

import { collection, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { FormEvent, useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import type { Esnaf } from "../../lib/esnaf";

const defaultEsnaf: Esnaf = {
  slug: "",
  name: "",
  phone: "",
  cities: "",
  description: "",
  logoUrl: "",
  headline: "",
  theme: "light",
};

const themes = [
  { value: "light", label: "Açık Tema" },
  { value: "dark", label: "Koyu Tema" },
  { value: "brand", label: "Marka Rengi" },
];

export default function EsnafManager() {
  const [esnaflar, setEsnaflar] = useState<Esnaf[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [formState, setFormState] = useState<Esnaf>(defaultEsnaf);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "esnaflar"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEsnaflar(snapshot.docs.map((doc) => doc.data() as Esnaf));
    });
    return () => unsubscribe();
  }, []);

  function handleSelect(esnaf: Esnaf) {
    setSelectedSlug(esnaf.slug);
    setFormState(esnaf);
    setMessage(null);
  }

  function handleClear() {
    setSelectedSlug(null);
    setFormState(defaultEsnaf);
    setMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formState.slug || !formState.name || !formState.phone) {
      setMessage("Slug, isim ve telefon alanları zorunludur.");
      return;
    }

    try {
      await setDoc(doc(db, "esnaflar", formState.slug), {
        ...formState,
        slug: formState.slug,
      });
      setMessage("Esnaf kaydedildi.");
      setSelectedSlug(formState.slug);
    } catch (error) {
      console.error(error);
      setMessage("Esnaf kaydı sırasında bir hata oluştu.");
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Esnaf Profilleri</h2>
          <p className="mt-2 text-slate-600">Buradan slug, logo URL, tema ve açıklama bilgilerini ekleyin veya düzenleyin.</p>
        </div>
        <button
          type="button"
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          onClick={handleClear}
        >
          Yeni Esnaf Ekle
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <label className="grid gap-2 text-sm text-slate-700">
            Esnaf slug (URL kısmı)
            <input
              value={formState.slug}
              onChange={(event) => setFormState({ ...formState, slug: event.target.value.trim() })}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-slate-900 focus:outline-none"
              placeholder="ali-kitag"
              disabled={!!selectedSlug}
            />
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            Esnaf adı
            <input
              value={formState.name}
              onChange={(event) => setFormState({ ...formState, name: event.target.value })}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-slate-900 focus:outline-none"
              placeholder="Ali Kıtay"
            />
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            WhatsApp numarası
            <input
              value={formState.phone}
              onChange={(event) => setFormState({ ...formState, phone: event.target.value })}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-slate-900 focus:outline-none"
              placeholder="905321234567"
            />
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            Şehir / Hizmet bölgesi
            <input
              value={formState.cities}
              onChange={(event) => setFormState({ ...formState, cities: event.target.value })}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-slate-900 focus:outline-none"
              placeholder="İstanbul"
            />
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            Kısa başlık
            <input
              value={formState.headline}
              onChange={(event) => setFormState({ ...formState, headline: event.target.value })}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-slate-900 focus:outline-none"
              placeholder="Uzman kuaför ve saç bakımı"
            />
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            Açıklama
            <textarea
              value={formState.description}
              onChange={(event) => setFormState({ ...formState, description: event.target.value })}
              className="min-h-[120px] rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-slate-900 focus:outline-none"
              placeholder="Esnaf sayfanızda müşteriye görünen kısa açıklama"
            />
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            Logo / Kapak URL
            <input
              value={formState.logoUrl}
              onChange={(event) => setFormState({ ...formState, logoUrl: event.target.value })}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-slate-900 focus:outline-none"
              placeholder="https://..."
            />
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            Tema
            <select
              value={formState.theme}
              onChange={(event) => setFormState({ ...formState, theme: event.target.value })}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-slate-900 focus:outline-none"
            >
              {themes.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
          </label>

          <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800" type="submit">
            {selectedSlug ? "Güncelle" : "Esnaf Kaydet"}
          </button>

          {message ? <p className="text-sm text-slate-700">{message}</p> : null}
        </form>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
          <h3 className="text-xl font-semibold text-slate-950">Kayıtlı Esnaflar</h3>
          {esnaflar.length === 0 ? (
            <p className="text-sm text-slate-600">Henüz kayıtlı esnaf yok.</p>
          ) : (
            <div className="grid gap-3">
              {esnaflar.map((esnaf) => (
                <button
                  key={esnaf.slug}
                  type="button"
                  onClick={() => handleSelect(esnaf)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300"
                >
                  <p className="font-semibold text-slate-950">{esnaf.name}</p>
                  <p className="text-sm text-slate-500">/{esnaf.slug}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
