import Link from "next/link";
import { use } from "react";
import StatusPanel from "./status-panel";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function RandevuPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-8 text-slate-900 sm:px-6 sm:py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Randevu takibi</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">Talebinizin durumu</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Onay veya red bildirimi burada anlık güncellenir.
        </p>
      </div>
      <StatusPanel id={id} />
      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </main>
  );
}
