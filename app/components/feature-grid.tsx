'use client';

const features = [
  {
    title: "Esnaf kontrolü her zaman sizde",
    description: "Bekleyen randevuları onaylayın veya reddedin. Müşteri sadece talep gönderir, karar size ait olur.",
  },
  {
    title: "Üye olmadan randevu",
    description: "Müşterinin arayışını basitleştirin: telefon ve isim ile hızlı rezervasyon.",
  },
  {
    title: "Kolay esnaf yönetimi",
    description: "Esnaf profillerini yönet, slug ve hizmet bilgilerini düzenle, tek ekrandan takip et.",
  },
  {
    title: "Gerçek zamanlı bildirim",
    description: "Onay ya da red durumunda müşteri WhatsApp üzerinden hızlıca bilgilendirilir.",
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Öne çıkan avantajlar</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-950">Esnaf kazansın, süreç basitleşsin</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Randevunual ile dükkanınıza dijital rezervasyon altyapısı hızlıca gelir. Hem size hem de müşterinize daha düzenli bir randevu akışı sağlar.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-950">{feature.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
