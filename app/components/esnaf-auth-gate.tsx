'use client';

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ESNAF_LOGIN_PATH } from "../../lib/auth-session";
import { useAuth } from "./auth-provider";

type Props = {
  children: ReactNode;
};

export default function EsnafAuthGate({ children }: Props) {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready && !user) {
      router.replace(ESNAF_LOGIN_PATH);
    }
  }, [ready, user, router]);

  if (!ready) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 text-slate-600 shadow-sm">
          Oturum kontrol ediliyor...
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
