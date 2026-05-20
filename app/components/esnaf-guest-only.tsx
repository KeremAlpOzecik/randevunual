'use client';

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ESNAF_DASHBOARD_PATH } from "../../lib/auth-session";
import { useAuth } from "./auth-provider";

type Props = {
  children: ReactNode;
};

/** Giriş/kayıt sayfaları: zaten oturum varsa panele yönlendir */
export default function EsnafGuestOnly({ children }: Props) {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready && user) {
      router.replace(ESNAF_DASHBOARD_PATH);
    }
  }, [ready, user, router]);

  if (!ready) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 text-slate-600 shadow-sm">
          Yükleniyor...
        </div>
      </main>
    );
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
}
