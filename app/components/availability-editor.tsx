'use client';

import type { EsnafProfile, GunlukKapaliAralik } from "../../lib/esnaf";
import { HAFTA_GUNLERI } from "../../lib/availability";

type Props = {
  profile: EsnafProfile;
  onChange: (next: EsnafProfile) => void;
  onDirty: () => void;
};

const timeOptions = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00",
];

export default function AvailabilityEditor({ profile, onChange, onDirty }: Props) {
  const kapaliGunler = profile.kapaliGunler ?? [];
  const araliklar = profile.gunlukKapaliAraliklar ?? [];

  function toggleClosedDay(day: number) {
    onDirty();
    const exists = kapaliGunler.includes(day);
    onChange({
      ...profile,
      kapaliGunler: exists ? kapaliGunler.filter((d) => d !== day) : [...kapaliGunler, day],
    });
  }

  function updateAralik(index: number, patch: Partial<GunlukKapaliAralik>) {
    onDirty();
    onChange({
      ...profile,
      gunlukKapaliAraliklar: araliklar.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    });
  }

  function addAralik() {
    onDirty();
    onChange({
      ...profile,
      gunlukKapaliAraliklar: [
        ...araliklar,
        { gun: 2, baslangic: "13:00", bitis: "16:00" },
      ],
    });
  }

  function removeAralik(index: number) {
    onDirty();
    onChange({
      ...profile,
      gunlukKapaliAraliklar: araliklar.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
      <div>
        <p className="text-sm font-semibold text-slate-800">Uygun günler ve kapalı saatler</p>
        <p className="mt-1 text-xs text-slate-500">
          Müşteri yalnızca açık günleri ve boş saatleri görür. Örn. Salı 13:00–16:00 kapalı.
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Kapalı günler</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {HAFTA_GUNLERI.map((gun) => {
            const closed = kapaliGunler.includes(gun.value);
            return (
              <button
                key={gun.value}
                type="button"
                onClick={() => toggleClosedDay(gun.value)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  closed
                    ? "bg-rose-100 text-rose-800 ring-1 ring-rose-200"
                    : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                }`}
              >
                {gun.short}
                {closed ? " · Kapalı" : ""}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Günlük kapalı aralıklar
          </p>
          <button
            type="button"
            onClick={addAralik}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            + Aralık ekle
          </button>
        </div>

        {araliklar.length === 0 ? (
          <p className="mt-3 text-xs text-slate-500">Henüz özel kapalı saat yok.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {araliklar.map((aralik, index) => (
              <li
                key={`${aralik.gun}-${index}`}
                className="grid gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200 sm:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <select
                  value={aralik.gun}
                  onChange={(e) => updateAralik(index, { gun: Number(e.target.value) })}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {HAFTA_GUNLERI.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
                <select
                  value={aralik.baslangic}
                  onChange={(e) => updateAralik(index, { baslangic: e.target.value })}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {timeOptions.map((t) => (
                    <option key={`b-${t}`} value={t}>
                      {t} başlangıç
                    </option>
                  ))}
                </select>
                <select
                  value={aralik.bitis}
                  onChange={(e) => updateAralik(index, { bitis: e.target.value })}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {timeOptions.map((t) => (
                    <option key={`e-${t}`} value={t}>
                      {t} bitiş
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeAralik(index)}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                >
                  Sil
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
