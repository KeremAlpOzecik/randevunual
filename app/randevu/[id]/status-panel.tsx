'use client';

import { doc, DocumentData, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";

type Props = {
  id: string;
};

type Randevu = {
  esnafName: string;
  customerName: string;
  time: string;
  status: "pending" | "confirmed" | "rejected";
  customerPhone?: string;
};

export default function StatusPanel({ id }: Props) {
  const [randevu, setRandevu] = useState<Randevu | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const docRef = doc(db, "randevular", id);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (!snapshot.exists()) {
        setError("Randevu bulunamadı. Lütfen bilgileri kontrol edin.");
        setRandevu(null);
        return;
      }

      const data = snapshot.data() as DocumentData;
      setRandevu({
        esnafName: data.esnafName,
        customerName: data.customerName,
        time: data.time,
        status: data.status,
        customerPhone: data.customerPhone,
      });
      setError(null);
    });

    return () => unsubscribe();
  }, [id]);

  if (error) {
    return (
      <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm sm:mt-8 sm:rounded-3xl sm:p-8">
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  if (!randevu) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-600 shadow-sm sm:mt-8 sm:rounded-3xl sm:p-8">
        <p>Randevu yükleniyor...</p>
      </div>
    );
  }

  const statusLabel =
    randevu.status === "pending"
      ? "Onay Bekliyor"
      : randevu.status === "confirmed"
      ? "Randevunuz Onaylandı"
      : "Reddedildi";

  const statusClass =
    randevu.status === "pending"
      ? "bg-amber-50 border-amber-200 text-amber-800"
      : randevu.status === "confirmed"
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : "bg-rose-50 border-rose-200 text-rose-800";

  return (
    <div className={`mt-6 rounded-2xl border p-5 shadow-sm sm:mt-8 sm:rounded-3xl sm:p-8 ${statusClass} border-current`}>
      <div className="grid gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em]">Randevu Durumu</p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{statusLabel}</h2>
        </div>
        <div className="grid gap-2 rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Esnaf</p>
          <p className="text-lg font-semibold text-slate-900">{randevu.esnafName}</p>
          <p className="text-sm text-slate-500">Müşteri</p>
          <p className="text-lg font-semibold text-slate-900">{randevu.customerName}</p>
          <p className="text-sm text-slate-500">Randevu Tarihi</p>
          <p className="text-lg font-semibold text-slate-900">{new Date(randevu.time).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })}</p>
        </div>
        {randevu.status === "pending" ? (
          <div className="rounded-3xl bg-white p-6 text-slate-700 shadow-sm">
            <p className="font-semibold text-slate-900">İşletme henüz yanıtlamadı</p>
            <p className="mt-2 text-sm leading-relaxed">
              Talebiniz kayıtlı. İşletme panelden onayladığında veya reddettiğinde bu sayfa güncellenir.
              İsterseniz işletmeye kendi WhatsApp’ınızdan da yazabilirsiniz — sistem otomatik mesaj atmaz.
            </p>
          </div>
        ) : null}
        {randevu.status === "confirmed" ? (
          <div className="rounded-3xl bg-white p-6 text-slate-700 shadow-sm">
            <p className="font-semibold text-slate-900">Randevunuz onaylandı</p>
            <p className="mt-2 text-sm">İşletme gerekirse WhatsApp üzerinden size ayrıca yazabilir.</p>
          </div>
        ) : null}
        {randevu.status === "rejected" ? (
          <div className="rounded-3xl bg-white p-6 text-slate-700 shadow-sm">
            <p className="font-semibold text-slate-900">Randevu uygun değil</p>
            <p className="mt-2 text-sm">Farklı bir gün veya saat için işletmenin sayfasından yeni talep oluşturabilirsiniz.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
