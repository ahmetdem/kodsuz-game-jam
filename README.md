# Kodsuz Game Jam

Vite + React + Tailwind tabanlı bu proje, Kodsuz Game Jam etkinliği için puanlama arayüzü ve stand/poster çıktısını tek sayfada sunar. Vercel Edge fonksiyonları, Upstash Redis ile skorları saklar ve liderlik tablosu/tam oy kayıtlarını sağlar.

## Gereksinimler
- Node.js 18+
- npm (Vite komutları için)
- Upstash Redis REST URL/token ve `JURY_PASSWORD` değerleri (`.env.local` ya da Vercel ortam değişkenleri)

## Başlangıç
```bash
npm install
npm run dev
```
- Vite, `http://localhost:5173` adresinde hem Puanlandırma hem Stand Afişi sekmelerini sunar.
- API fonksiyonlarını aynı makinede denemek için `npx vercel dev` komutunu kullanın; bu, Vite dev sunucusunu ve `api/*.mjs` uç noktalarını birlikte çalıştırır.

## Scriptler
- `npm run dev`: Vite geliştirme sunucusu (hot reload).
- `npm run build`: Üretim derlemesini `dist/` klasörüne alır.
- `npm run preview`: Üretim paketini yerelde test eder.

## Proje Yapısı
- `src/main.tsx`: React uygulamasının giriş noktası.
- `src/App.tsx`: Puanlama arayüzü, stand/poster sekmesi ve rubrik mantığının tamamı.
- `src/components/ui/*`: Shadcn türevi sunum bileşenleri; yalnızca görsel katman için kullanın.
- `public/`: QR kodları ve diğer statik varlıklar (ör. sponsor logoları).
- `api/score.mjs`: Jüri oylarını kaydeder (POST, Bearer `JURY_PASSWORD`).
- `api/leaderboard.mjs`: Ortalama skorları döner (GET, `?event=` sorgu parametresi, `no-store`).
- `api/votes.mjs`: Ham oy listesini döner (GET, `?event=`).

## Puanlama Arayüzü ve Poster Özelleştirme
`src/App.tsx` dosyasındaki sabitler etkinliği kişiselleştirmek için hazırlanmıştır:
- `JAM`: Başlık, tarih, lokasyon, ödüller, program ve isteğe bağlı `qrImageUrl` bilgilerini güncelleyin.
- `RUBRIC`: Kriter başlıkları, açıklamaları ve ağırlıkları; toplam ağırlık 100 olmalı.
- `JURY_MEMBERS`, `RAW_TEAM_NAMES`: Varsayılan jüri ve takım adları.
- `EVENT_ID` ve `API_SCORE`: Skorların Redis anahtarı ve API yolu.

Poster sekmesinde "Yazdır / PDF" düğmesi, tarayıcı `@media print` kuralı ile A3'e uyumlu çıktı verir. Yeni QR görselleri için `public/drive-qr.png` veya `public/wa-qr.png` dosyalarını değiştirin; gerekiyorsa yeni sponsor görsellerini `public/` altına ekleyin ve bileşende referans verin. Tema renklerini `src/styles.css` içindeki CSS değişkenleriyle düzenleyebilirsiniz.

## API Kullanımı
`score` uç noktası yetki gerektirir:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JURY_PASSWORD" \
  -d '{"event":"kgj-2025","judge":"Demo","team":"Takım","total":88,"theme":5,"loop":5,"originality":4,"doc":4,"feas":4,"visual":3}' \
  http://localhost:3000/api/score
```
- Başarılı kayıtlar `scores:<event>` listesine (`Upstash Redis`) eklenir.
- `leaderboard` uç noktası ortalama skorları döner; eşitlik kırılımı özgünlük → oynanış döngüsü → tema sırasına göre yapılır.
- `votes` uç noktası tüm oyları jüri, zaman ve takım bilgileriyle sıralı şekilde listeler.

## Dağıtım (Vercel)
- Vercel projesini import edin ve "Framework Preset" olarak Vite'i seçin (otomatik algılanır).
- Build komutu: `npm run build`
- Çıktı klasörü: `dist`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `JURY_PASSWORD` değişkenlerini Vercel ortamına ekleyin.
- Edge fonksiyonlarının Redis'e erişebilmesi için Upstash IP erişimini açık tutun.

## Manuel QA Kontrol Listesi
- `npm run dev`
- Puanlama sekmesinde her kriteri kaydırarak toplam puanın anlık güncellendiğini doğrulayın.
- "Puanı Gönder" akışında jüri adı, takım seçimi ve Bearer token ile POST isteğinin 200 dönmesini kontrol edin (tarayıcı ağı veya `curl`).
- Stand Afişi sekmesinde içeriklerin A3 baskı önizlemesinde hizalı göründüğünü ve QR bağlantılarının doğru yönlendirdiğini test edin.
- `leaderboard` ve `votes` uç noktalarını örnek çağrılarla çalıştırıp Redis verilerinin beklenen formatta geldiğini doğrulayın.

## Güvenlik Notları
- `.env.local` dosyasını versiyon kontrolüne eklemeyin; gizli anahtarları yalnızca yerel makinenizde veya Vercel ortam değişkenlerinde tutun.
- Gerektiğinde tokenları rotasyon yapın ve dağıtım paylaşımlarında URL/token içeren ekran görüntülerini maskeleyin.
