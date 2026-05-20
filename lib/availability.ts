import type { EsnafProfile, GunlukKapaliAralik } from "./esnaf";

const SLOT_STEP_MINUTES = 30;

export const HAFTA_GUNLERI = [
  { value: 1, short: "Pzt", label: "Pazartesi" },
  { value: 2, short: "Sal", label: "Salı" },
  { value: 3, short: "Çar", label: "Çarşamba" },
  { value: 4, short: "Per", label: "Perşembe" },
  { value: 5, short: "Cum", label: "Cuma" },
  { value: 6, short: "Cmt", label: "Cumartesi" },
  { value: 0, short: "Paz", label: "Pazar" },
] as const;

export function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + (minutes || 0);
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes || 0, 0, 0);
  return combined;
}

export function isDayClosed(profile: EsnafProfile, dayOfWeek: number): boolean {
  return (profile.kapaliGunler ?? []).includes(dayOfWeek);
}

export function isSlotInBlockedRange(
  dayOfWeek: number,
  slotTime: string,
  ranges: GunlukKapaliAralik[] | undefined,
  stepMinutes = SLOT_STEP_MINUTES
): boolean {
  const slotStart = timeToMinutes(slotTime);
  const slotEnd = slotStart + stepMinutes;

  for (const range of ranges ?? []) {
    if (range.gun !== dayOfWeek) {
      continue;
    }
    const blockStart = timeToMinutes(range.baslangic);
    const blockEnd = timeToMinutes(range.bitis);
    if (slotStart < blockEnd && slotEnd > blockStart) {
      return true;
    }
  }
  return false;
}

export function generateDaySlots(profile: EsnafProfile): string[] {
  const open = profile.calismaSaatleri?.baslangic || "09:00";
  const close = profile.calismaSaatleri?.bitis || "19:00";
  const start = timeToMinutes(open);
  const end = timeToMinutes(close);
  const slots: string[] = [];

  for (let minute = start; minute < end; minute += SLOT_STEP_MINUTES) {
    slots.push(minutesToTime(minute));
  }
  return slots;
}

export function getBookedSlotKeys(bookedTimes: string[]): Set<string> {
  const keys = new Set<string>();
  for (const iso of bookedTimes) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      continue;
    }
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    keys.add(`${dateKey(date)}-${hours}:${minutes}`);
  }
  return keys;
}

export function getAvailableSlotsForDate(
  profile: EsnafProfile,
  date: Date,
  bookedTimes: string[] = []
): string[] {
  const dayOfWeek = date.getDay();
  if (isDayClosed(profile, dayOfWeek)) {
    return [];
  }

  const bookedKeys = getBookedSlotKeys(bookedTimes);
  const now = new Date();
  const isToday = isSameCalendarDay(date, now);

  return generateDaySlots(profile).filter((slot) => {
    if (isSlotInBlockedRange(dayOfWeek, slot, profile.gunlukKapaliAraliklar)) {
      return false;
    }
    if (isToday && timeToMinutes(slot) <= now.getHours() * 60 + now.getMinutes()) {
      return false;
    }
    const key = `${dateKey(date)}-${slot}`;
    if (bookedKeys.has(key)) {
      return false;
    }
    return true;
  });
}

export function getWeekDates(anchor: Date, days = 7): Date[] {
  const start = startOfDay(anchor);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export function formatWeekdayChip(date: Date, today: Date) {
  const month = date.toLocaleDateString("tr-TR", { month: "long" });
  const dayNumber = date.getDate();
  const weekday = date.toLocaleDateString("tr-TR", { weekday: "short" }).replace(".", "");
  const isToday = isSameCalendarDay(date, today);

  return {
    isToday,
    topLabel: isToday ? "BUGÜN" : date.toLocaleDateString("tr-TR", { month: "short" }).toUpperCase(),
    dayLine: `${weekday.toUpperCase()} ${dayNumber} ${month}`,
    shortLine: `${dayNumber} ${month}`,
  };
}

export function countAvailableDaysInWeek(profile: EsnafProfile, dates: Date[], bookedTimes: string[]): number {
  return dates.filter((date) => getAvailableSlotsForDate(profile, date, bookedTimes).length > 0).length;
}
