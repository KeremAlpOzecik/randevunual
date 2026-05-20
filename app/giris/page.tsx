'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { configureAuthPersistence, ESNAF_DASHBOARD_PATH } from "../../lib/auth-session";
import { getAuthClient } from "../../lib/firebase";
import EsnafGuestOnly from "../components/esnaf-guest-only";

export default function GirisPage() {
  return (
    <EsnafGuestOnly>
      <GirisForm />
    </EsnafGuestOnly>
  );
}

function GirisForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await configureAuthPersistence(rememberMe);
      const auth = getAuthClient();
      await signInWithEmailAndPassword(auth, email, password);
      router.replace(ESNAF_DASHBOARD_PATH);
    } catch (loginError: unknown) {
      console.error(loginError);
      const code = (loginError as { code?: string })?.code;
      if (code === "auth/configuration-not-found") {
        setError(
          "Firebase Auth yapılandırması bulunamadı. .env.local ayarlarını kontrol edin ve Firebase Auth Email/Password sağlayıcısını etkinleştirin."
        );
      } else if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
        setError("E-posta veya şifre hatalı.");
      } else if (code === "auth/wrong-password") {
        setError("Şifre yanlış. Lütfen tekrar deneyin.");
      } else {
        setError((loginError as Error)?.message || "Giriş sırasında bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 sm:py-12">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl sm:rounded-[2rem] sm:p-10">
          <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-200">
            Esnaf Girişi
          </span>
          <h1 className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Bir kez giriş yapın, oturumunuz kalsın
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            «Beni hatırla» ile tarayıcıyı kapatsanız bile tekrar şifre girmeniz gerekmez. Sadece «Çıkış Yap»
            dediğinizde oturum sonlanır.
          </p>
        </section>

        <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-700">Hemen Giriş</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Panelinize giriş yapın</h2>
          </div>

          <form onSubmit={handleLogin} className="grid gap-5">
            <label className="grid gap-2 text-sm text-slate-700">
              E-posta
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-900 focus:outline-none"
                type="email"
                autoComplete="email"
                placeholder="iletisim@isletme.com"
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-700">
              Şifre
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-900 focus:outline-none"
                type="password"
                autoComplete="current-password"
                placeholder="●●●●●●●●"
              />
            </label>

            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Beni hatırla (önerilir — tarayıcı kapanınca da oturum açık kalır)
            </label>

            {error ? <div className="rounded-3xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

            <button
              type="submit"
              className="rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              disabled={loading}
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            <p className="font-semibold text-slate-950">Kayıtlı değil misiniz?</p>
            <Link
              href="/kayit"
              className="mt-4 inline-flex rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Kayıt Ol
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
