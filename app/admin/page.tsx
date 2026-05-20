'use client';

import Link from "next/link";
import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { getAuthClient } from "../../lib/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { FormEvent, useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import EsnafManager from "./esnaf-manager";

type Randevu = {
  id: string;
  esnafId: string;
  esnafName: string;
  customerName: string;
  customerPhone: string;
  time: string;
  status: "pending" | "confirmed" | "rejected";
};

function PendingRandevuList() {
  const [randevular, setRandevular] = useState<Randevu[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "randevular"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Randevu[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Randevu, "id">),
        }));
        setRandevular(list);
        setError(null);
      },
      (err) => {
        console.error(err);
        setError("Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.");
      }
    );

    return () => unsubscribe();
  }, []);

  async function confirmRandevu(id: string) {
    await updateDoc(doc(db, "randevular", id), { status: "confirmed" });
  }

  async function rejectRandevu(randevu: Randevu) {
    try {
      await updateDoc(doc(db, "randevular", randevu.id), { status: "rejected" });
      const text = encodeURIComponent(
        `Merhaba ${randevu.customerName}, ${randevu.esnafName} müsait değil. Lütfen yeni bir tarih için tekrar iletişime geçin.`
      );
      window.open(`https://wa.me/${randevu.customerPhone}?text=${text}`, "_blank");
    } catch (error) {
      console.error(error);
      setError("Reddetme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  }

  return (
    <div className="mt-6 grid gap-6">
      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">{error}</div>
      ) : null}

      {randevular.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-slate-600 shadow-sm">Şu anda onay bekleyen bir randevu yok.</div>
      ) : (
        randevular.map((randevu) => (
          <div key={randevu.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">Esnaf</p>
                <p className="text-lg font-semibold text-slate-950">{randevu.esnafName}</p>
                <p className="mt-2 text-sm text-slate-500">Müşteri</p>
                <p className="text-base font-medium text-slate-900">{randevu.customerName}</p>
                <p className="mt-1 text-sm text-slate-500">{new Date(randevu.time).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
              <div className="grid gap-3 sm:auto-cols-auto sm:grid-flow-col">
                <button
                  className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  onClick={() => confirmRandevu(randevu.id)}
                >
                  Onayla
                </button>
                <button
                  className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
                  onClick={() => rejectRandevu(randevu)}
                >
                  Reddet ve WhatsApp Hazırla
                </button>
              </div>
            </div>
            <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
              <p>Randevu ID: {randevu.id}</p>
              <p>WhatsApp numarası: {randevu.customerPhone}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const auth = getAuthClient();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError(null);
    setLoginLoading(true);

    try {
      const auth = getAuthClient();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
      setAuthError("Giriş yapılamadı. Email veya şifreyi kontrol edin.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleSignOut() {
    const auth = getAuthClient();
    await signOut(auth);
  }

  if (isAuthLoading) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-6 py-12 text-slate-900">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-slate-600 shadow-sm">Giriş durumu kontrol ediliyor...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto min-h-screen max-w-6xl px-6 py-12 text-slate-900">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-10 text-white shadow-xl">
            <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-950">
              Esnaf / Admin Paneli
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">Randevu taleplerinizi hızlıca yönetin</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
              Esnaf hesabınızla giriş yaptığınızda bekleyen randevuları onaylayabilir, reddedebilir ve tüm süreçleri tek ekrandan takip edebilirsiniz.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/10 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Hemen kontrol edin</p>
                <p className="mt-3 text-base font-semibold text-white">Bekleyen randevular</p>
                <p className="mt-2 text-sm text-slate-300">Talepleri hızlıca onaylayın veya reddedin.</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-300">WhatsApp bildirimleri</p>
                <p className="mt-3 text-base font-semibold text-white">Anında bilgilendirin</p>
                <p className="mt-2 text-sm text-slate-300">Müşteriye reddetme veya onay mesajı gönderin.</p>
              </div>
            </div>
          </section>

          <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-700">Giriş yap</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">Esnaf hesabınıza erişin</h2>
            </div>

            <form onSubmit={handleLogin} className="grid gap-5">
              <label className="grid gap-2 text-sm text-slate-700">
                Email
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-900 focus:outline-none"
                  type="email"
                  placeholder="admin@randevunual.com.tr"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-700">
                Şifre
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-900 focus:outline-none"
                  type="password"
                  placeholder="●●●●●●●●"
                />
              </label>
              <button
                type="submit"
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                disabled={loginLoading}
              >
                {loginLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </button>
              {authError ? <p className="text-sm text-rose-600">{authError}</p> : null}
            </form>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              <p className="font-semibold text-slate-950">Henüz kayıtlı değil misiniz?</p>
              <p className="mt-3">Üye olmak için kayıt sayfasına gidin ve esnaf hesabınızı oluşturun.</p>
              <Link href="/register" className="mt-4 inline-flex rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
                Kayıt Ol
              </Link>
            </div>
          </aside>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12 text-slate-900">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Esnaf Paneli</h1>
            <p className="mt-3 text-slate-600">Giriş yapan kullanıcı: {user.email}</p>
          </div>
          <button
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            onClick={handleSignOut}
          >
            Çıkış Yap
          </button>
        </div>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Bekleyen Randevular</h2>
          <p className="mt-3 text-sm text-slate-600">Onay bekleyen tüm talepleri aşağıdan yönetin.</p>
          <PendingRandevuList />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Esnaf Yönetimi</h2>
          <p className="mt-3 text-sm text-slate-600">Esnaf profillerinizi buradan güncelleyin.</p>
          <div className="mt-6">
            <EsnafManager />
          </div>
        </div>
      </section>
    </main>
  );
}
