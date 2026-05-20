This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Firebase Firestore (kurallar ve indeksler)

Geliştirme için herkese açık `allow read, write` kuralları **üretimde kullanılmamalı**. Projede hazır dosyalar:

| Dosya | Açıklama |
|-------|----------|
| `firestore.rules` | `isletmeler`: herkes okur, yalnızca sahibi (`uid`) yazar. `randevular`: herkes okur ve `pending` oluşturur; onay/red yalnızca ilgili esnaf. |
| `firestore.indexes.json` | Panel sorgusu: `randevular` → `esnafId` + `status` (bileşik indeks). |
| `firebase.json` | Deploy hedefleri |

**Console:** `firestore.rules` içeriğini Firestore → Rules’a yapıştır → Publish. İndeks: Firestore → Indexes → Composite → koleksiyon `randevular`, alanlar `esnafId` + `status` (Ascending).

**Deploy (CLI varsa):**

```bash
firebase deploy --only firestore
```

## Vercel ortam değişkenleri

Vercel → Project → **Settings → Environment Variables** — `.env.local` ile aynı `NEXT_PUBLIC_FIREBASE_*` değerlerini ekleyin. Önemli:

```env
NEXT_PUBLIC_SITE_URL=https://randevunual.com.tr
```

(veya `https://proje-adi.vercel.app` — kendi domain’iniz neyse, sonunda `/` olmasın)

Deploy sonrası **Firebase Console → Authentication → Settings → Authorized domains** listesine Vercel/domain adresinizi ekleyin.

İlk kez bileşik sorgu çalıştırıldığında Console da indeks linki verir; `firestore.indexes.json` ile önceden deploy etmek hatayı önler.

Tek alanlı sorgular (`where('uid', '==', ...)`, `where('status', '==', 'pending')`) için ek indeks gerekmez — Firestore bunları otomatik indeksler.

**Mevcut açık kuralınız** (`match /{document=**} { allow read, write; }`) test için uygundur; canlıya geçmeden `firestore.rules` ile değiştirin ve Rules Playground’da deneyin.

## Logo (isteğe bağlı — şimdilik kapalı)

Spark (ücretsiz) planda Firebase Storage bucket açılmıyor; uygulama **logo olmadan** çalışır. Müşteri sayfasında işletme adının **ilk harfi** vurgu rengiyle gösterilir.

Logo eklemek istediğinizde: Blaze plan + Storage + `.env.local` içinde `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`. Panelde logo alanı env tanımlı olunca otomatik görünür.

## Firebase Storage (ileride logo için)

1. Blaze plan + Console → **Build → Storage** → bucket.
2. `.env.local` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`.
3. **Storage → Rules** → `firebase.storage.rules` veya `firebase deploy --only storage`.

Dashboard’da slogan, renk ve saat kaydetmeden önizlemede anında görünür. Kalıcı kayıt **Değişiklikleri Kaydet** ile yapılır.
