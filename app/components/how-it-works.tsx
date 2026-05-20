'use client';

const steps = [
  {
    title: "1. Kayıt ol ve esnaf profilini ekle",
    description: "Ücretsiz kaydol, dükkan bilgilerini ve WhatsApp numaranı girerek kendi profilini hazırla.",
  },
  {
    title: "2. Müşteri randevu talep eder",
    description: "Müşteri adı, numarası ve tercih ettiği randevu zamanı ile talep gönderir.",
  },
  {
    title: "3. Onayla veya reddet",
    description: "Talepleri admin panelinden gör, onayla ya da reddet ve müşteri otomatik bilgilendirilsin.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Nasıl çalışır</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-950">3 adımda işleyen esnaf randevu akışı</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <p className="text-sm font-semibold text-emerald-700">{step.title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
