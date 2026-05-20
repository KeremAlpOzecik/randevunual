'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { arrayUnion, collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { FormEvent, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { db, getAuthClient } from "../../lib/firebase";
import { ESNAF_LOGIN_PATH } from "../../lib/auth-session";
import { useAuth } from "../components/auth-provider";
import EsnafAuthGate from "../components/esnaf-auth-gate";
import { publicStorePath, publicStoreUrl } from "../../lib/site-url";
import {
  customerApprovedWhatsAppLink,
  customerRejectedWhatsAppLink,
  esnafToCustomerWhatsAppLink,
  trackingUrl,
} from "../../lib/randevu-whatsapp";
import { isFirebaseStorageConfigured, uploadBusinessLogo, validateLogoFile } from "../../lib/logo-storage";
import type { EsnafProfile, Hizmet } from "../../lib/esnaf";
import { motion, AnimatePresence } from "framer-motion";
import MobilePreview from "../components/mobile-preview";
import CopyToast from "../components/copy-toast";
import AvailabilityEditor from "../components/availability-editor";

type Randevu = {
  id: string;
  esnafId: string;
  esnafName: string;
  customerName: string;
  customerPhone: string;
  time: string;
  status: "pending" | "confirmed" | "rejected";
  selectedService?: string | null;
};

const timeOptions = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
];

const colorPalette = [
  "#10b981",
  "#7c3aed",
  "#0ea5e9",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#d946ef",
];

export default function DashboardPage() {
  return (
    <EsnafAuthGate>
      <DashboardPageContent />
    </EsnafAuthGate>
  );
}

function DashboardPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<EsnafProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [pendingRandevular, setPendingRandevular] = useState<Randevu[]>([]);
  const [selectedTab, setSelectedTab] = useState<"requests" | "profile">("profile");
  const [address, setAddress] = useState("");
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("19:00");
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedPublished, setCopiedPublished] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | undefined>(undefined);
  const [processingRandevuId, setProcessingRandevuId] = useState<string | null>(null);
  const [lastCustomerNotify, setLastCustomerNotify] = useState<{
    randevu: Randevu;
    type: "confirmed" | "rejected";
  } | null>(null);
  const initialRequestsTabSet = useRef(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const formDirtyRef = useRef(false);
  const hydratedSlugRef = useRef<string | null>(null);

  function markFormDirty() {
    formDirtyRef.current = true;
    setFormDirty(true);
  }

  function clearPendingLogo() {
    setLogoPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setPendingLogoFile(null);
  }

  useEffect(() => {
    if (!user) {
      return;
    }

    const q = query(collection(db, "isletmeler"), where("uid", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setProfile(null);
          setProfileLoading(false);
          return;
        }

        const data = snapshot.docs[0].data() as EsnafProfile;
        const isNewBusiness = hydratedSlugRef.current !== data.slug;

        if (isNewBusiness || !formDirtyRef.current) {
          setProfile(data);
          setAddress(data.adres || "");
          setOpenTime(data.calismaSaatleri?.baslangic || "09:00");
          setCloseTime(data.calismaSaatleri?.bitis || "19:00");
          clearPendingLogo();
          if (isNewBusiness) {
            formDirtyRef.current = false;
            setFormDirty(false);
          }
          hydratedSlugRef.current = data.slug;
        } else {
          setProfile((prev) =>
            prev
              ? {
                  ...prev,
                  hizmetler: data.hizmetler ?? [],
                  logoUrl: data.logoUrl ?? prev.logoUrl,
                }
              : data
          );
        }
        setProfileLoading(false);
      },
      (error) => {
        console.error(error);
        setProfile(null);
        setProfileLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!profile || !profile.slug) {
      setPendingRandevular([]);
      return;
    }

    const q = query(
      collection(db, "randevular"),
      where("esnafId", "==", profile.slug),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Randevu[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Omit<Randevu, "id">;
          return { id: docSnap.id, ...data };
        });
        setPendingRandevular(list);
        if (list.length > 0 && !initialRequestsTabSet.current) {
          setSelectedTab("requests");
          initialRequestsTabSet.current = true;
        }
      },
      (error) => {
        console.error(error);
        setPendingRandevular([]);
      }
    );

    return () => unsubscribe();
  }, [profile]);

  useEffect(() => {
    return () => {
      setLogoPreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
    };
  }, []);

  async function handleSignOut() {
    const auth = getAuthClient();
    await signOut(auth);
    router.push(ESNAF_LOGIN_PATH);
  }

  function handleLogoSelect(event: ChangeEvent<HTMLInputElement>) {
    if (!isFirebaseStorageConfigured()) {
      return;
    }

    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const validationError = validateLogoFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setPendingLogoFile(file);
    setLogoPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return URL.createObjectURL(file);
    });
    markFormDirty();
    setErrorMessage(null);
    setInfoMessage("Logo önizlemede. Kalıcı olması için «Değişiklikleri Kaydet»e basın.");
  }

  async function handleConfirm(randevu: Randevu) {
    setProcessingRandevuId(randevu.id);
    setErrorMessage(null);
    try {
      const randevuDoc = doc(db, "randevular", randevu.id);
      await updateDoc(randevuDoc, { status: "confirmed" });
      setLastCustomerNotify({ randevu, type: "confirmed" });
      setInfoMessage("Randevu onaylandı. Müşteriye WhatsApp mesajı göndermek için aşağıdaki butonu kullanın.");
    } catch (error) {
      console.error(error);
      setErrorMessage("Onaylama sırasında bir hata oluştu.");
    } finally {
      setProcessingRandevuId(null);
    }
  }

  async function handleReject(randevu: Randevu) {
    setProcessingRandevuId(randevu.id);
    setErrorMessage(null);
    try {
      const randevuDoc = doc(db, "randevular", randevu.id);
      await updateDoc(randevuDoc, { status: "rejected" });
      setLastCustomerNotify({ randevu, type: "rejected" });
      setInfoMessage("Randevu reddedildi. Müşteriye bilgi vermek için WhatsApp butonunu kullanın.");
    } catch (error) {
      console.error(error);
      setErrorMessage("Reddetme sırasında bir hata oluştu.");
    } finally {
      setProcessingRandevuId(null);
    }
  }

  async function handleProfileSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile || !user) {
      return;
    }

    try {
      setErrorMessage(null);
      setIsSaving(true);
      setInfoMessage("Kaydediliyor...");

      let logoUrl = profile.logoUrl;
      if (pendingLogoFile) {
        logoUrl = await uploadBusinessLogo(user.uid, profile.slug, pendingLogoFile);
        clearPendingLogo();
      }

      const profileRef = doc(db, "isletmeler", profile.slug);
      await updateDoc(profileRef, {
        adres: address,
        calismaSaatleri: {
          baslangic: openTime,
          bitis: closeTime,
        },
        slogan: profile.slogan || "",
        themePreference: profile.themePreference || "system",
        primaryColor: profile.primaryColor || "#10b981",
        instagram: profile.instagram || "",
        bio: profile.bio || "",
        logoUrl: logoUrl || "",
        kapaliGunler: profile.kapaliGunler ?? [],
        gunlukKapaliAraliklar: profile.gunlukKapaliAraliklar ?? [],
      });
      setProfile({
        ...profile,
        adres: address,
        logoUrl,
        calismaSaatleri: {
          baslangic: openTime,
          bitis: closeTime,
        },
        kapaliGunler: profile.kapaliGunler ?? [],
        gunlukKapaliAraliklar: profile.gunlukKapaliAraliklar ?? [],
      });
      formDirtyRef.current = false;
      setFormDirty(false);
      setInfoMessage("Tüm değişiklikler kaydedildi. Canlı sayfada yayında.");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Profil güncellenirken bir hata oluştu.";
      setErrorMessage(message);
      setInfoMessage(null);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCopyPublishedLink() {
    const url = profile?.slug ? publicStoreUrl(profile.slug) : window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedPublished(true);
      setInfoMessage("Yayınlanan link panoya kopyalandı.");
      setToastMessage("Yayınlanan link panoya kopyalandı.");
      setToastVisible(true);
    } catch (err) {
      console.error(err);
      setErrorMessage("Link kopyalanamadı.");
    }
  }

  async function handleAddService() {
    if (!profile) {
      return;
    }

    if (!serviceName || !servicePrice || !serviceDuration) {
      setErrorMessage("Lütfen hizmet adı, fiyat ve süre alanlarını doldurun.");
      return;
    }

    try {
      setErrorMessage(null);
      setInfoMessage("Hizmet ekleniyor...");
      const profileRef = doc(db, "isletmeler", profile.slug);
      const newService: Hizmet = {
        id: `${Date.now()}`,
        ad: serviceName,
        fiyat: servicePrice,
        sure: serviceDuration,
      };
      await updateDoc(profileRef, {
        hizmetler: arrayUnion(newService),
      });
      setServiceName("");
      setServicePrice("");
      setServiceDuration("");
      setInfoMessage("Hizmet başarıyla eklendi.");
    } catch (error) {
      console.error(error);
      setErrorMessage("Hizmet eklenirken bir hata oluştu.");
    }
  }

  async function handleRemoveService(itemId: string) {
    if (!profile) {
      return;
    }

    try {
      setErrorMessage(null);
      setInfoMessage("Hizmet kaldırılıyor...");
      const filtered = profile.hizmetler?.filter((item) => item.id !== itemId) ?? [];
      const profileRef = doc(db, "isletmeler", profile.slug);
      await updateDoc(profileRef, { hizmetler: filtered });
      setInfoMessage("Hizmet kaldırıldı.");
    } catch (error) {
      console.error(error);
      setErrorMessage("Hizmet silinirken bir hata oluştu.");
    }
  }

  const dashboardTitle = useMemo(() => {
    return profile?.isletmeAdi || "Esnaf Dashboard";
  }, [profile]);

  const previewProfile = useMemo((): EsnafProfile | null => {
    if (!profile) {
      return null;
    }

    const hizmetler = [...(profile.hizmetler ?? [])];
    if (serviceName.trim()) {
      hizmetler.unshift({
        id: "draft-preview",
        ad: serviceName.trim(),
        fiyat: servicePrice.trim() || "Fiyat",
        sure: serviceDuration.trim() || "Süre",
      });
    }

    return {
      ...profile,
      logoUrl: isFirebaseStorageConfigured()
        ? (logoPreviewUrl ?? profile.logoUrl)
        : profile.logoUrl,
      adres: address,
      calismaSaatleri: {
        baslangic: openTime,
        bitis: closeTime,
      },
      kapaliGunler: profile.kapaliGunler ?? [],
      gunlukKapaliAraliklar: profile.gunlukKapaliAraliklar ?? [],
      hizmetler,
    };
  }, [profile, logoPreviewUrl, address, openTime, closeTime, serviceName, servicePrice, serviceDuration]);

  const logoUploadEnabled = isFirebaseStorageConfigured();
  const displayLogoUrl = logoUploadEnabled
    ? (logoPreviewUrl ?? profile?.logoUrl)
    : profile?.logoUrl;
  const isPreviewDraft =
    formDirty
    || (logoUploadEnabled && !!pendingLogoFile)
    || !!serviceName.trim();

  const currentAccent = previewProfile?.primaryColor || "#10b981";

  if (!user || profileLoading) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-10 text-slate-900 sm:px-6 sm:py-12">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-slate-600 shadow-sm">Yükleniyor...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 text-slate-900 sm:px-6 sm:py-10">
      <div className="rounded-2xl bg-white p-5 shadow-sm sm:rounded-[2rem] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-700">İşletme Yönetim Merkezi</p>
            <h1 className="mt-3 text-2xl font-semibold text-slate-950 sm:text-3xl">{dashboardTitle}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Markanızı öne çıkaran düzenleyici, talep yönetimi ve canlı önizleme bir arada.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href={profile?.slug ? publicStorePath(profile.slug) : "/"}
              target="_blank"
                className="inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] sm:w-auto"
                style={{ backgroundColor: currentAccent }}
            >
              Canlı Sayfayı Aç
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:bg-slate-800 sm:w-auto"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6 lg:gap-12">
        <div className="flex w-full items-center gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm sm:w-auto">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bekleyen Talepler</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">{pendingRandevular.length}</p>
          </div>
          <p className="text-sm text-slate-500">Canlı güncelleniyor</p>
        </div>

        <div
          className="flex w-full flex-col gap-3 rounded-2xl px-5 py-4 shadow-sm sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
          style={{ backgroundColor: currentAccent }}
        >
          <a
            href={profile?.slug ? publicStorePath(profile.slug) : "/"}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-white"
          >
            Mağaza Sayfası
          </a>
          <span className="break-all text-xs text-white/85 sm:max-w-[200px]">
            {profile?.slug ? publicStoreUrl(profile.slug).replace(/^https?:\/\//, "") : "—"}
          </span>
          <button
            type="button"
            onClick={handleCopyPublishedLink}
            className="inline-flex w-full items-center justify-center rounded-full bg-white/15 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/25 sm:w-auto"
          >
            {copiedPublished ? "Kopyalandı" : "Kopyala"}
          </button>
        </div>
      </div>
      <CopyToast visible={toastVisible} message={toastMessage} onClose={() => setToastVisible(false)} />

      {pendingRandevular.length > 0 ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
          <p className="font-semibold text-amber-900">
            {pendingRandevular.length} bekleyen randevu talebi var
          </p>
          <p className="mt-1 text-sm text-amber-800">
            Ücretli mesaj API’si yok: önce panelden onay/red, sonra kendi WhatsApp’ınızdan müşteriye yazın.
          </p>
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] xl:gap-8">
        <div className="min-w-0 space-y-6 sm:space-y-8">
          <div className="rounded-2xl bg-slate-950 p-5 text-slate-50 shadow-sm sm:rounded-[2rem] sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Marka Yönetimi</p>
                <h2 className="mt-3 text-3xl font-semibold">Prestijli bir marka kontrol paneli</h2>
              </div>
              <div className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">Tema + Renk + Slogan</div>
            </div>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-300">
              Müşteri sayfanızı Apple/Linear estetiğiyle uyumlu hale getirin. Sol taraftaki düzenleyici değiştikçe önizleme canlı olarak yenilenir.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm sm:rounded-[2rem] sm:p-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-700">Sekmeler</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">Kontrol Paneli</h3>
              </div>
              <div className="flex w-full gap-2 overflow-x-auto pb-1 sm:w-auto sm:overflow-visible sm:pb-0">
                <button
                  type="button"
                  onClick={() => setSelectedTab("requests")}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-all sm:px-5 ${
                    selectedTab === "requests"
                      ? "bg-black text-white shadow-sm"
                      : "text-gray-500 hover:text-slate-700"
                  }`}
                >
                  Randevu Talepleri
                  {pendingRandevular.length > 0 ? (
                    <span className="inline-flex min-w-[1.25rem] justify-center rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-950">
                      {pendingRandevular.length}
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTab("profile")}
                  className={`shrink-0 rounded-full px-4 py-3 text-sm font-semibold transition-all sm:px-5 ${
                    selectedTab === "profile"
                      ? "bg-black text-white shadow-sm"
                      : "text-gray-500 hover:text-slate-700"
                  }`}
                >
                  Mağaza Ayarları
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {selectedTab === "requests" ? (
                <motion.div
                  key="requests"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <strong className="text-slate-800">WhatsApp nasıl çalışır?</strong> Sistem mesaj atmaz;
                    siz ve müşteri kendi telefonunuzdan ücretsiz{" "}
                    <code className="rounded bg-white px-1 text-xs">wa.me</code> linkleriyle yazışırsınız.
                    Önce buradan onay/red kaydedin, sonra müşteriye mesaj butonunu kullanın.
                  </div>

                  {lastCustomerNotify ? (
                    <div
                      className={`rounded-[1.75rem] border p-5 shadow-sm ${
                        lastCustomerNotify.type === "confirmed"
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-rose-200 bg-rose-50"
                      }`}
                    >
                      <p className="font-semibold text-slate-950">
                        {lastCustomerNotify.type === "confirmed"
                          ? "Onay kaydedildi — müşteriye mesaj gönderin"
                          : "Red kaydedildi — müşteriye mesaj gönderin"}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {lastCustomerNotify.randevu.customerName} ·{" "}
                        {new Date(lastCustomerNotify.randevu.time).toLocaleString("tr-TR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <a
                          href={
                            lastCustomerNotify.type === "confirmed"
                              ? customerApprovedWhatsAppLink(
                                  lastCustomerNotify.randevu,
                                  typeof window !== "undefined" ? window.location.origin : undefined
                                )
                              : customerRejectedWhatsAppLink(
                                  lastCustomerNotify.randevu,
                                  typeof window !== "undefined" ? window.location.origin : undefined
                                )
                          }
                          target="_blank"
                          rel="noreferrer"
                          className={`inline-flex rounded-2xl px-4 py-3 text-sm font-semibold text-white ${
                            lastCustomerNotify.type === "confirmed"
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-rose-600 hover:bg-rose-700"
                          }`}
                        >
                          Kendi WhatsApp’ından müşteriye gönder
                        </a>
                        <a
                          href={trackingUrl(
                            lastCustomerNotify.randevu.id,
                            typeof window !== "undefined" ? window.location.origin : undefined
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800"
                        >
                          Takip linkini aç
                        </a>
                        <button
                          type="button"
                          onClick={() => setLastCustomerNotify(null)}
                          className="inline-flex rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-white/60"
                        >
                          Kapat
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {pendingRandevular.length === 0 ? (
                    <div className="rounded-[1.75rem] bg-slate-50 p-5 text-slate-600 shadow-sm sm:p-8">
                      Şu anda onay bekleyen bir talep yok. Yeni talep gelince burada görünür.
                    </div>
                  ) : (
                    pendingRandevular.map((randevu) => (
                      <div
                        key={randevu.id}
                        className="rounded-[1.75rem] border border-amber-100 bg-slate-50 p-4 shadow-sm sm:p-6"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                            Onay bekliyor
                          </span>
                        </div>
                        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-sm text-slate-500">Müşteri</p>
                            <p className="mt-1 text-xl font-semibold text-slate-950">{randevu.customerName}</p>
                            <p className="mt-2 text-sm text-slate-600">
                              {new Date(randevu.time).toLocaleString("tr-TR", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">Tel: {randevu.customerPhone}</p>
                            {randevu.selectedService ? (
                              <p className="mt-1 text-sm text-slate-500">Hizmet: {randevu.selectedService}</p>
                            ) : null}
                            <a
                              href={trackingUrl(
                                randevu.id,
                                typeof window !== "undefined" ? window.location.origin : undefined
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-block text-xs font-medium text-slate-500 underline-offset-2 hover:underline"
                            >
                              Müşteri takip linki
                            </a>
                          </div>
                          <div className="grid w-full gap-2 sm:w-auto sm:min-w-[240px]">
                            <button
                              type="button"
                              disabled={processingRandevuId === randevu.id}
                              className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                              onClick={() => handleConfirm(randevu)}
                            >
                              {processingRandevuId === randevu.id ? "Kaydediliyor..." : "Onayla"}
                            </button>
                            <button
                              type="button"
                              disabled={processingRandevuId === randevu.id}
                              className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                              onClick={() => handleReject(randevu)}
                            >
                              Reddet
                            </button>
                            <a
                              href={esnafToCustomerWhatsAppLink(
                                randevu,
                                typeof window !== "undefined" ? window.location.origin : undefined
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-800 hover:bg-slate-100"
                            >
                              Müşteriye WhatsApp yaz
                            </a>
                          </div>
                        </div>
                        <p className="mt-4 text-xs text-slate-500">
                          Onay/red panelde kayıt olur; müşteriye haber wa.me ile sizin telefonunuzdan gider (API ücreti yok).
                        </p>
                      </div>
                    ))
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-8"
                >
                  <form onSubmit={handleProfileSave} className="space-y-8 rounded-[1.75rem] bg-slate-50 p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                      <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Marka Kimliği</p>
                        <p className="mt-3 text-sm text-slate-700">
                          {logoUploadEnabled
                            ? "Logo, slogan, tema ve vurgu rengini buradan yönetin."
                            : "Slogan, tema ve vurgu rengini buradan yönetin. (Logo şimdilik kapalı.)"}
                        </p>

                        <div className="mt-6 space-y-6">
                          {logoUploadEnabled ? (
                            <div className="grid gap-5 sm:grid-cols-[112px_1fr] sm:items-start">
                              <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                                {displayLogoUrl ? (
                                  <img src={displayLogoUrl} alt="Mağaza Logosu" className="h-full w-full object-contain p-2" />
                                ) : (
                                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Logo</span>
                                )}
                                {logoPreviewUrl ? (
                                  <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-800">
                                    Önizleme
                                  </span>
                                ) : null}
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700">Logo Yükleme</label>
                                <p className="mt-1 text-xs text-slate-500">
                                  PNG veya JPG, en fazla 2 MB. Önizleme anında; kayıt «Değişiklikleri Kaydet» ile yapılır.
                                  {pendingLogoFile ? (
                                    <span className="mt-1 block font-medium text-amber-700">
                                      Yeni logo henüz kaydedilmedi.
                                    </span>
                                  ) : null}
                                </p>
                                <input
                                  id="logo-upload"
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,image/gif"
                                  onChange={handleLogoSelect}
                                  disabled={isSaving}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="logo-upload"
                                  className={`mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-200/80 ${
                                    isSaving ? "pointer-events-none opacity-60" : "cursor-pointer"
                                  }`}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                  </svg>
                                  Görsel seç
                                </label>
                              </div>
                            </div>
                          ) : null}

                          <div>
                            <label className="block text-sm font-semibold text-slate-700">Slogan</label>
                            <input
                              value={profile?.slogan || ""}
                              onChange={(event) => {
                                markFormDirty();
                                setProfile(profile ? { ...profile, slogan: event.target.value } : profile);
                              }}
                              className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                              placeholder="Dükkanın ruhunu yansıtan bir cümle"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700">Tema Tercihi</label>
                            <div className="mt-3 flex flex-wrap gap-3">
                              {[
                                { value: "light", label: "Açık" },
                                { value: "dark", label: "Koyu" },
                                { value: "system", label: "Sistem" },
                              ].map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    markFormDirty();
                                    setProfile(profile ? { ...profile, themePreference: option.value as "light" | "dark" | "system" } : profile);
                                  }}
                                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                                    profile?.themePreference === option.value
                                      ? "bg-slate-950 text-white shadow-sm"
                                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                  }`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700">Vurgu Rengi</label>
                            <div className="mt-4 grid max-w-xs grid-cols-6 gap-3">
                              {colorPalette.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => {
                                    markFormDirty();
                                    setProfile(profile ? { ...profile, primaryColor: color } : profile);
                                  }}
                                  aria-label={`Renk ${color}`}
                                  className={`aspect-square w-full max-w-[2.25rem] justify-self-center rounded-full shadow-md transition-all ${
                                    profile?.primaryColor === color
                                      ? "ring-2 ring-offset-2 ring-slate-900 scale-110"
                                      : "hover:scale-105 hover:shadow-lg"
                                  }`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6 rounded-[1.5rem] bg-white p-6 shadow-sm">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700">Hakkımızda / Bio</label>
                          <textarea
                            value={profile?.bio || ""}
                            onChange={(event) => {
                              markFormDirty();
                              setProfile(profile ? { ...profile, bio: event.target.value } : profile);
                            }}
                            className="mt-3 min-h-[200px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-900 focus:border-slate-900 focus:outline-none"
                            placeholder="Kısa bir tanıtım metni yazın"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700">Instagram Kullanıcı Adı</label>
                          <input
                            value={profile?.instagram || ""}
                            onChange={(event) => {
                              markFormDirty();
                              setProfile(profile ? { ...profile, instagram: event.target.value } : profile);
                            }}
                            className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                            placeholder="ornekhesap"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 rounded-[1.5rem] bg-white p-6 shadow-sm">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700">Dükkan Adresi</label>
                          <textarea
                            value={address}
                            onChange={(event) => {
                              markFormDirty();
                              setAddress(event.target.value);
                            }}
                            className="mt-3 min-h-[180px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-900 focus:border-slate-900 focus:outline-none"
                            placeholder="Cadde, semt, şehir"
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="block text-sm font-semibold text-slate-700">
                            Açılış Saati
                            <select
                              value={openTime}
                              onChange={(event) => {
                                markFormDirty();
                                setOpenTime(event.target.value);
                              }}
                              className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                            >
                              {timeOptions.map((time) => (
                                <option key={`open-${time}`} value={time}>{time}</option>
                              ))}
                            </select>
                          </label>
                          <label className="block text-sm font-semibold text-slate-700">
                            Kapanış Saati
                            <select
                              value={closeTime}
                              onChange={(event) => {
                                markFormDirty();
                                setCloseTime(event.target.value);
                              }}
                              className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                            >
                              {timeOptions.map((time) => (
                                <option key={`close-${time}`} value={time}>{time}</option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </div>

                      {profile ? (
                        <AvailabilityEditor
                          profile={profile}
                          onChange={(next) => setProfile(next)}
                          onDirty={markFormDirty}
                        />
                      ) : null}

                      <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-500">
                          {isPreviewDraft
                            ? "Kaydedilmemiş değişiklikler var. Sayfadan ayrılmadan önce kaydedin."
                            : "Tüm alanlar kayıtlı."}
                        </p>
                        <button
                          type="submit"
                          disabled={isSaving || !isPreviewDraft}
                          className="rounded-3xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="rounded-[1.75rem] bg-slate-50 p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-emerald-700">Hizmetler</p>
                  <p className="mt-2 text-sm text-slate-600">Yeni hizmet ekleyin, fiyat ve süre bilgisiyle ön plana çıkın.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddService}
                  className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-emerald-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Hizmet Ekle
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Hizmet Adı
                  <input
                    value={serviceName}
                    onChange={(event) => setServiceName(event.target.value)}
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                    placeholder="Saç Kesim"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Fiyat
                  <input
                    value={servicePrice}
                    onChange={(event) => setServicePrice(event.target.value)}
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                    placeholder="200 TL"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Süre
                  <input
                    value={serviceDuration}
                    onChange={(event) => setServiceDuration(event.target.value)}
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                    placeholder="30 dk"
                  />
                </label>
              </div>
            </div>

            {profile?.hizmetler?.length ? (
              <div className="rounded-[1.75rem] bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-950">Mevcut Hizmetler</p>
                <div className="mt-4 grid gap-3">
                  {profile.hizmetler.map((item) => (
                    <div key={item.id} className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between transition-all hover:-translate-y-0.5 hover:shadow-md">
                      <div>
                        <p className="font-semibold text-slate-950">{item.ad}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.fiyat} · {item.sure}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(item.id)}
                        className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:bg-rose-700"
                      >
                        Sil
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {infoMessage ? <div className="rounded-[1.75rem] bg-emerald-50 p-4 text-sm text-emerald-700">{infoMessage}</div> : null}
            {errorMessage ? <div className="rounded-[1.75rem] bg-rose-50 p-4 text-sm text-rose-700">{errorMessage}</div> : null}
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm xl:sticky xl:top-10 xl:max-w-none xl:self-start">
          <MobilePreview profile={previewProfile} isLiveDraft={isPreviewDraft} />
        </div>
      </div>
    </main>
  );
}
