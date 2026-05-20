'use client';

import QRCode from "qrcode";
import { useCallback, useEffect, useMemo, useState } from "react";
import { publicStoreUrl } from "../../lib/site-url";

type Props = {
  businessName: string;
  slug: string;
  accentColor?: string;
  slogan?: string;
};

function buildPrintHtml(options: {
  businessName: string;
  storeUrl: string;
  qrDataUrl: string;
  accentColor: string;
  slogan?: string;
}): string {
  const { businessName, storeUrl, qrDataUrl, accentColor, slogan } = options;
  const safeName = businessName.replace(/</g, "&lt;");
  const safeSlogan = slogan?.replace(/</g, "&lt;") ?? "";
  const shortUrl = storeUrl.replace(/^https?:\/\//, "");

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>${safeName} — Randevu QR</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4; margin: 16mm; }
    body {
      font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
      color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .sheet {
      width: 100%;
      max-width: 420px;
      border: 3px solid ${accentColor};
      border-radius: 24px;
      padding: 32px 28px;
      text-align: center;
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: ${accentColor};
      margin-bottom: 12px;
    }
    h1 {
      font-size: 26px;
      font-weight: 700;
      line-height: 1.25;
      margin-bottom: 8px;
    }
    .slogan {
      font-size: 14px;
      color: #475569;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .qr-wrap {
      display: inline-block;
      padding: 16px;
      background: #fff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      margin-bottom: 20px;
    }
    .qr-wrap img {
      width: 240px;
      height: 240px;
      display: block;
    }
    .cta {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
      line-height: 1.4;
    }
    .url {
      font-size: 13px;
      color: #64748b;
      word-break: break-all;
      margin-bottom: 20px;
    }
    .footer {
      font-size: 11px;
      color: #94a3b8;
      letter-spacing: 0.08em;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="badge">Online randevu</div>
    <h1>${safeName}</h1>
    ${safeSlogan ? `<p class="slogan">${safeSlogan}</p>` : ""}
    <div class="qr-wrap">
      <img src="${qrDataUrl}" alt="Randevu QR kodu" width="240" height="240" />
    </div>
    <p class="cta">Randevu almak için<br/>QR kodu okutun</p>
    <p class="url">${shortUrl}</p>
    <p class="footer">randevunual.com.tr</p>
  </div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;
}

export default function StoreQrPrint({ businessName, slug, accentColor = "#10b981", slogan }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storeUrl = useMemo(() => {
    if (!slug) {
      return "";
    }
    return publicStoreUrl(slug);
  }, [slug]);

  useEffect(() => {
    if (!storeUrl) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    QRCode.toDataURL(storeUrl, {
      width: 512,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then((dataUrl) => {
        if (!cancelled) {
          setQrDataUrl(dataUrl);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("QR kodu oluşturulamadı.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [storeUrl]);

  const handlePrint = useCallback(() => {
    if (!qrDataUrl || !storeUrl) {
      return;
    }

    const html = buildPrintHtml({
      businessName,
      storeUrl,
      qrDataUrl,
      accentColor,
      slogan,
    });

    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) {
      setError("Yazdırma penceresi açılamadı. Tarayıcıda açılır pencerelere izin verin.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }, [qrDataUrl, storeUrl, businessName, accentColor, slogan]);

  const handleDownloadPng = useCallback(() => {
    if (!qrDataUrl) {
      return;
    }
    const anchor = document.createElement("a");
    anchor.href = qrDataUrl;
    anchor.download = `${slug}-randevu-qr.png`;
    anchor.click();
  }, [qrDataUrl, slug]);

  if (!slug) {
    return null;
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Mağaza QR Kodu</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">Camına as, müşteri okutup randevu alsın</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            QR kod mağaza sayfanıza gider. Yazdırıp dükkân camına veya kasaya asabilirsiniz.
          </p>
          <p className="mt-3 break-all text-xs text-slate-500">{storeUrl}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handlePrint}
              disabled={loading || !qrDataUrl}
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Yazdır / PDF
            </button>
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={loading || !qrDataUrl}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              PNG indir
            </button>
          </div>
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        </div>

        <div className="flex shrink-0 flex-col items-center rounded-2xl border border-slate-100 bg-slate-50 p-4">
          {loading ? (
            <div className="flex h-[200px] w-[200px] items-center justify-center text-sm text-slate-500">
              QR hazırlanıyor…
            </div>
          ) : qrDataUrl ? (
            <>
              <img
                src={qrDataUrl}
                alt={`${businessName} randevu QR kodu`}
                className="h-[200px] w-[200px] rounded-xl bg-white p-2 shadow-sm"
                width={200}
                height={200}
              />
              <p className="mt-3 max-w-[200px] text-center text-xs font-semibold leading-snug text-slate-700">
                Randevu almak için QR kodu okutun
              </p>
            </>
          ) : (
            <div className="flex h-[200px] w-[200px] items-center justify-center text-sm text-slate-500">
              QR yok
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
