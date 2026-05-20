'use client';

import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { FormEvent, useEffect, useMemo, useState, type CSSProperties } from "react";
import { db } from "../../lib/firebase";
import type { EsnafProfile } from "../../lib/esnaf";
import type { StorefrontThemeClasses } from "../../lib/storefront-theme";
import {
  combineDateAndTime,
  countAvailableDaysInWeek,
  formatWeekdayChip,
  getAvailableSlotsForDate,
  getWeekDates,
  startOfDay,
} from "../../lib/availability";
import CopyToast from "../components/copy-toast";
import { customerToEsnafWhatsAppLink, type RandevuMessagePayload } from "../../lib/randevu-whatsapp";

type Props = {
  profile: EsnafProfile;
  accentColor: string;
  theme: StorefrontThemeClasses;
  useDark: boolean;
};

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

function selectedSurfaceStyle(accentColor: string, active: boolean): CSSProperties | undefined {
  if (!active) {
    return undefined;
  }
  return {
    borderColor: accentColor,
    backgroundColor: `${accentColor}18`,
    boxShadow: `0 0 0 1px ${accentColor}55`,
  };
}

export default function BookingForm({ profile, accentColor, theme, useDark }: Props) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | undefined>(undefined);

  const today = useMemo(() => startOfDay(new Date()), []);
  const weekStart = useMemo(() => {
    const anchor = new Date(today);
    anchor.setDate(today.getDate() + weekOffset * 7);
    return anchor;
  }, [today, weekOffset]);

  const weekDates = useMemo(() => getWeekDates(weekStart, 7), [weekStart]);

  const nowLabel = useMemo(
    () =>
      new Date().toLocaleString("tr-TR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  const navBtnClass = `rounded-lg border px-3 py-1.5 text-xs transition ${theme.bookingPanel} ${theme.body} disabled:opacity-40`;

  useEffect(() => {
    let cancelled = false;

    async function loadBookings() {
      setLoadingBookings(true);
      try {
        const q = query(collection(db, "randevular"), where("esnafId", "==", profile.slug));
        const snapshot = await getDocs(q);
        if (cancelled) {
          return;
        }
        const times = snapshot.docs
          .map((docSnap) => docSnap.data())
          .filter((data) => data.status === "pending" || data.status === "confirmed")
          .map((data) => String(data.time));
        setBookedTimes(times);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setLoadingBookings(false);
        }
      }
    }

    loadBookings();
    return () => {
      cancelled = true;
    };
  }, [profile.slug]);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const date of weekDates) {
      map.set(date.toISOString(), getAvailableSlotsForDate(profile, date, bookedTimes));
    }
    return map;
  }, [weekDates, profile, bookedTimes]);

  const openDaysCount = useMemo(
    () => countAvailableDaysInWeek(profile, weekDates, bookedTimes),
    [profile, weekDates, bookedTimes]
  );

  const activeSlots = selectedDate ? slotsByDate.get(selectedDate.toISOString()) ?? [] : [];

  useEffect(() => {
    if (!selectedDate) {
      const firstOpen = weekDates.find((date) => (slotsByDate.get(date.toISOString()) ?? []).length > 0);
      if (firstOpen) {
        setSelectedDate(firstOpen);
      }
    }
  }, [weekDates, slotsByDate, selectedDate]);

  useEffect(() => {
    if (selectedDate && selectedSlot && !activeSlots.includes(selectedSlot)) {
      setSelectedSlot(activeSlots[0] ?? null);
    }
  }, [selectedDate, selectedSlot, activeSlots]);

  const appointmentISO =
    selectedDate && selectedSlot ? combineDateAndTime(selectedDate, selectedSlot).toISOString() : "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const phone = normalizePhone(customerPhone);

    if (!customerName.trim() || !phone || !appointmentISO) {
      setMessage("Lütfen tarih, saat, ad ve telefon bilgilerini doldurun.");
      return;
    }

    if (phone.length < 10) {
      setMessage("Geçerli bir WhatsApp numarası girin (ör. 905XXXXXXXXX).");
      return;
    }

    setStatus("saving");
    setMessage(null);

    try {
      const docRef = await addDoc(collection(db, "randevular"), {
        esnafId: profile.slug,
        esnafName: profile.isletmeAdi,
        customerName: customerName.trim(),
        customerPhone: phone,
        time: appointmentISO,
        selectedService: selectedService || null,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setRecordId(docRef.id);
      setBookedTimes((prev) => [...prev, appointmentISO]);
      setStatus("success");
      setMessage(
        "Talebiniz kaydedildi. İşletme panelden onaylayacak; isterseniz aşağıdan kendi WhatsApp'ınızla işletmeye de yazabilirsiniz."
      );
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Randevu kaydı sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  }

  async function handleCopyTrackingLink() {
    if (!recordId) {
      return;
    }
    const url = `${window.location.origin}/randevu/${recordId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setToastMessage("Takip linki panoya kopyalandı.");
      setToastVisible(true);
    } catch (err) {
      console.error(err);
      setMessage("Link kopyalanamadı.");
    }
  }

  const cardShell = `overflow-hidden rounded-[1.75rem] border shadow-sm ${theme.bookingCard}`;

  if (status === "success" && recordId) {
    const notifyPayload: RandevuMessagePayload = {
      id: recordId,
      esnafName: profile.isletmeAdi,
      customerName: customerName.trim(),
      customerPhone: normalizePhone(customerPhone),
      time: appointmentISO,
      selectedService: selectedService || null,
    };
    const esnafWhatsAppHref = customerToEsnafWhatsAppLink(
      profile.telefon,
      profile.isletmeAdi,
      notifyPayload,
      typeof window !== "undefined" ? window.location.origin : undefined
    );

    return (
      <div className={cardShell}>
        <div className={`border-b px-6 py-5 ${theme.bookingHeaderBorder}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: accentColor }}>
            Talep alındı
          </p>
          <h2 className={`mt-2 text-2xl font-semibold ${theme.title}`}>Randevunuz oluşturuldu</h2>
        </div>
        <div className="space-y-3 p-6">
          <div
            className={`rounded-2xl border px-4 py-4 ${
              useDark ? "border-amber-500/25 bg-amber-500/10" : "border-amber-200 bg-amber-50"
            }`}
          >
            <p className={`text-sm font-semibold ${useDark ? "text-amber-100" : "text-amber-900"}`}>
              Onay bekleniyor
            </p>
            <p className={`mt-2 text-sm leading-relaxed ${useDark ? "text-amber-200/90" : "text-amber-800"}`}>
              {message}
            </p>
          </div>
          <a
            href={`/randevu/${recordId}`}
            className="flex w-full justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold text-white"
            style={{ backgroundColor: accentColor }}
          >
            Randevu Durumunu Gör
          </a>
          <a
            href={esnafWhatsAppHref}
            target="_blank"
            rel="noreferrer"
            className={`flex w-full justify-center rounded-2xl border px-5 py-3.5 text-sm font-semibold ${
              useDark
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            İşletmeye WhatsApp yaz (isteğe bağlı)
          </a>
          <button
            type="button"
            onClick={handleCopyTrackingLink}
            className={`flex w-full justify-center rounded-2xl border px-5 py-3 text-sm ${theme.bookingPanel} ${theme.body}`}
          >
            {copied ? "Kopyalandı" : "Takip Linkini Kopyala"}
          </button>
        </div>
        <CopyToast visible={toastVisible} message={toastMessage} onClose={() => setToastVisible(false)} />
      </div>
    );
  }

  return (
    <div className={cardShell}>
      <div
        className={`flex flex-col gap-4 border-b px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6 ${theme.bookingHeaderBorder}`}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: accentColor }}>
            {profile.isletmeAdi}
          </p>
          <h2 className={`mt-2 text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl ${theme.title}`}>Randevu Al</h2>
          <p className={`mt-2 max-w-md text-sm ${theme.bookingSub}`}>
            Uygun gün ve saati seçin, adınızı ve telefonunuzu girin.
          </p>
        </div>
        <div className={`shrink-0 rounded-2xl border px-4 py-3 text-right ${theme.bookingPanel}`}>
          <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${theme.label}`}>Şu an</p>
          <p className={`mt-1 text-sm font-medium capitalize ${theme.body}`}>{nowLabel}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${theme.label}`}>
            Uygun günler · {openDaysCount} gün
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={weekOffset === 0}
              onClick={() => setWeekOffset((v) => Math.max(0, v - 1))}
              className={navBtnClass}
            >
              ← Önceki
            </button>
            <button type="button" onClick={() => setWeekOffset((v) => v + 1)} className={navBtnClass}>
              Sonraki →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {weekDates.map((date) => {
            const slots = slotsByDate.get(date.toISOString()) ?? [];
            const disabled = slots.length === 0;
            const selected = selectedDate ? date.toDateString() === selectedDate.toDateString() : false;
            const chip = formatWeekdayChip(date, today);

            return (
              <button
                key={date.toISOString()}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setSelectedDate(date);
                  setSelectedSlot(slots[0] ?? null);
                }}
                style={selectedSurfaceStyle(accentColor, selected && !disabled)}
                className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                  disabled ? theme.dayDisabled : selected ? "" : theme.dayDefault
                }`}
              >
                <p
                  className={`text-[10px] font-bold uppercase tracking-wide ${
                    chip.isToday ? "" : theme.label
                  }`}
                  style={chip.isToday ? { color: accentColor } : undefined}
                >
                  {chip.topLabel}
                </p>
                <p className={`mt-1 text-xs font-semibold leading-snug ${theme.title}`}>{chip.dayLine}</p>
                <p className={`mt-1 text-[10px] ${theme.label}`}>
                  {disabled ? "Kapalı" : `${slots.length} saat`}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${theme.label}`}>Uygun saatler</p>
          {loadingBookings ? (
            <p className={`mt-4 text-sm ${theme.bookingSub}`}>Saatler yükleniyor...</p>
          ) : activeSlots.length === 0 ? (
            <p
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                useDark ? "border-amber-500/20 bg-amber-500/10 text-amber-200" : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              Bu gün için uygun saat yok. Başka bir gün seçin veya sonraki haftaya geçin.
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {activeSlots.map((slot) => {
                const picked = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    style={selectedSurfaceStyle(accentColor, picked)}
                    className={`rounded-2xl border px-4 py-3.5 text-sm font-semibold transition ${
                      picked ? "" : theme.slotDefault
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className={`mt-8 grid gap-4 border-t pt-6 sm:grid-cols-2 ${theme.bookingHeaderBorder}`}>
          {profile.hizmetler?.length ? (
            <label className={`grid gap-2 text-sm sm:col-span-2 ${theme.bookingSub}`}>
              Hizmet (isteğe bağlı)
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className={`rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2 ${theme.input}`}
                style={{ outlineColor: accentColor }}
              >
                <option value="">Seçiniz</option>
                {profile.hizmetler.map((item) => (
                  <option key={item.id} value={item.ad}>
                    {item.ad} — {item.fiyat}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className={`grid gap-2 text-sm ${theme.bookingSub}`}>
            Ad Soyad
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={`rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2 ${theme.input}`}
              placeholder="Adınız Soyadınız"
              autoComplete="name"
            />
          </label>

          <label className={`grid gap-2 text-sm ${theme.bookingSub}`}>
            WhatsApp
            <input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className={`rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2 ${theme.input}`}
              placeholder="905XXXXXXXXX"
              inputMode="tel"
              autoComplete="tel"
            />
          </label>
        </div>

        {message ? (
          <p
            className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
              status === "error"
                ? useDark
                  ? "bg-red-500/15 text-red-200"
                  : "bg-red-50 text-red-700"
                : useDark
                  ? "bg-white/5 text-slate-300"
                  : "bg-slate-100 text-slate-700"
            }`}
          >
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === "saving" || !selectedSlot || !selectedDate}
          className="mt-6 flex w-full justify-center rounded-2xl px-5 py-4 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: accentColor }}
        >
          {status === "saving" ? "Gönderiliyor..." : "Randevu Talebini Gönder"}
        </button>
      </form>
    </div>
  );
}
