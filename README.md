# Kodsuz Game Jam (Poster + Scoring) — Vite + React + Tailwind

Bu proje, stand afişi (A3) ve roll-up banner ile basit bir puanlandırma demosu içerir.

## Kurulum
```bash
npm i
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Afiş / Roll-up
- `PosterA3` bileşeni baskı için `@media print` ile A3 sayfa boyutuna uyar.
- Roll-up oranı için `RollupBanner` bileşenini kullanın (ekran önizlemesi).
- `public/qr.svg` ve `public/sponsors/*` dosyalarını güncelleyerek afişi özelleştirebilirsiniz.

## Vercel Deploy
- Projeyi Vercel'e import edin.
- Build Command: `npm run build`
- Output Directory: `dist`
- Framework: `Vite` (otomatik algılanır).

## Özelleştirme
- `src/components/PosterA3.tsx` içindeki `JAM` sabitinden tarih/yer/ödül/takım bilgilerini düzenleyin.
- Sponsorlara `public/sponsors` klasörü ekleyin ve `JAM.sponsors` listesine yollarını yazın.
- Tema renkleri `src/styles.css` içindeki CSS değişkenleriyle ayarlanabilir.
