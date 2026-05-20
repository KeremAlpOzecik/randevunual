'use client';

const faqs = [
  {
    question: "Esnaf kaydı gerçekten ücretsiz mi?",
    answer: "Evet, Randevunual ile esnaf kaydınız için başlangıçta hiçbir ücret almayız. %100 ücretsiz başlayabilirsiniz.",
  },
  {
    question: "Müşteri üye olmak zorunda mı?",
    answer: "Hayır, müşteri sadece adını ve telefon numarasını girerek randevu talebi oluşturabilir.",
  },
  {
    question: "Reddetme durumunda müşteri nasıl haberdar edilir?",
    answer: "Randevu reddedildiğinde sistem otomatik olarak WhatsApp üzerinden bilgilendirme bağlantısı oluşturur.",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Sıkça Sorulan Sorular</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-950">Esnafların aklındaki sorulara net cevaplar</h2>
      </div>
      <div className="grid gap-4">
        {faqs.map((faq) => (
          <div key={faq.question} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="font-semibold text-slate-950">{faq.question}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
