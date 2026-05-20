/**
 * Ücretsiz WhatsApp akışı: otomatik mesaj API’si yok.
 * Herkes kendi telefonundaki WhatsApp ile wa.me linklerini açar.
 */
import { getSiteOrigin } from "./site-url";

export type RandevuMessagePayload = {  id: string;
  esnafName: string;
  customerName: string;
  customerPhone: string;
  time: string;
  selectedService?: string | null;
};

function formatAppointmentTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" });
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function trackingUrl(randevuId: string, origin?: string): string {
  const base = origin ?? getSiteOrigin();
  return `${base}/randevu/${randevuId}`;
}

export function dashboardUrl(origin?: string): string {
  const base = origin ?? getSiteOrigin();
  return `${base}/dashboard`;
}

/** Müşteriye gönderilecek onay mesajı (esnaf panelden tetikler) */
export function buildCustomerApprovedMessage(randevu: RandevuMessagePayload, origin?: string): string {
  const when = formatAppointmentTime(randevu.time);
  const service = randevu.selectedService ? `\nHizmet: ${randevu.selectedService}` : "";
  return [
    `Merhaba ${randevu.customerName},`,
    `${randevu.esnafName} randevunuz onaylandı.`,
    `Tarih: ${when}${service}`,
    `Takip: ${trackingUrl(randevu.id, origin)}`,
  ].join("\n");
}

/** Müşteriye gönderilecek red mesajı (esnaf panelden tetikler) */
export function buildCustomerRejectedMessage(randevu: RandevuMessagePayload, origin?: string): string {
  const when = formatAppointmentTime(randevu.time);
  return [
    `Merhaba ${randevu.customerName},`,
    `${randevu.esnafName} maalesef ${when} için müsait değil.`,
    "Lütfen farklı bir gün/saat için tekrar randevu talebi oluşturun.",
    `Durum: ${trackingUrl(randevu.id, origin)}`,
  ].join("\n");
}

export function whatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
}

export function customerApprovedWhatsAppLink(randevu: RandevuMessagePayload, origin?: string): string {
  return whatsAppUrl(randevu.customerPhone, buildCustomerApprovedMessage(randevu, origin));
}

export function customerRejectedWhatsAppLink(randevu: RandevuMessagePayload, origin?: string): string {
  return whatsAppUrl(randevu.customerPhone, buildCustomerRejectedMessage(randevu, origin));
}

/** Müşteri → işletme: yeni talep bildirimi (müşteri kendi WhatsApp’ından gönderir) */
export function buildCustomerToEsnafMessage(
  esnafName: string,
  randevu: RandevuMessagePayload,
  origin?: string
): string {
  const when = formatAppointmentTime(randevu.time);
  const service = randevu.selectedService ? `\nHizmet: ${randevu.selectedService}` : "";
  return [
    `Merhaba ${esnafName}, online randevu talebim var.`,
    `Adım: ${randevu.customerName}`,
    `Telefonum: ${randevu.customerPhone}`,
    `İstediğim saat: ${when}${service}`,
    `Takip linki: ${trackingUrl(randevu.id, origin)}`,
    "Panelden onaylayabilir veya reddedebilirsiniz.",
  ].join("\n");
}

export function customerToEsnafWhatsAppLink(
  esnafPhone: string,
  esnafName: string,
  randevu: RandevuMessagePayload,
  origin?: string
): string {
  return whatsAppUrl(esnafPhone, buildCustomerToEsnafMessage(esnafName, randevu, origin));
}

/** Esnaf → müşteri: onay/red öncesi veya sonrası (esnaf kendi WhatsApp’ından gönderir) */
export function buildEsnafToCustomerChatMessage(
  randevu: RandevuMessagePayload,
  origin?: string
): string {
  const when = formatAppointmentTime(randevu.time);
  return [
    `Merhaba ${randevu.customerName},`,
    `${randevu.esnafName} olarak randevu talebiniz (${when}) hakkında yazıyorum.`,
    `Talep durumu: ${trackingUrl(randevu.id, origin)}`,
  ].join("\n");
}

export function esnafToCustomerWhatsAppLink(randevu: RandevuMessagePayload, origin?: string): string {
  return whatsAppUrl(randevu.customerPhone, buildEsnafToCustomerChatMessage(randevu, origin));
}
