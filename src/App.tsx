import React, { useMemo, useState } from "react";
import { Trophy, Users, Clock, FileText, CheckCircle2, Scale } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

/**
 * Kodsuz Game Jam – Scoring Guide + Stand Poster (Single-file React)
 * -----------------------------------------------------------------
 * ⬇️ Nasıl kullanılır?
 * - Bu dosyayı bir React/Next.js projesinde sayfa ya da bileşen olarak ekleyin.
 * - Varsayılan export, iki sekmeli bir arayüzdür: "Puanlandırma" ve "Stand Afişi".
 * - Üstteki JAM sabitlerini kendi etkinlik bilgilerinize göre düzenleyin.
 * - Stand Afişi sekmesindeki "Yazdır / PDF" butonu ile baskıya uygun çıktıyı alabilirsiniz.
 *
 * Tasarım notları:
 * - Tailwind + shadcn/ui + lucide-react kullanır.
 * - Puanlandırma demoda 0–5 ölçeğinde sürgülerle anlık toplam puan hesaplanır (100 üzerinden).
 */

const JAM = {
  title: "Kodsuz Game Jam",
  host: "AYBÜ",
  date: "25 Eylül 2025",
  location: "Ayvı Binası, Çok Amaçlı Salon", // dilediğiniz gibi güncelleyin
  teamSize: "Bireysel veya 2–3 kişilik takımlar",
  prizes: [
    { place: 1, amount: 10000 },
    { place: 2, amount: 6000 },
    { place: 3, amount: 4000 },
  ],
  timeline: [
    { time: "11:00 – 16:00", label: "Jam Çalışması (OTB hazırlığı)", icon: <FileText className="w-4 h-4" /> },
    { time: "16:00 – 16:30", label: "Ön Eleme (biçimsel kontrol)", icon: <CheckCircle2 className="w-4 h-4" /> },
    { time: "16:30 – 18:00", label: "Jüri Değerlendirmesi (1 saat 30 dk)", icon: <Scale className="w-4 h-4" /> },
  ],
  qrImageUrl: "", // varsa afiş için QR görsel URL'i ekleyin
};


const WHATSAPP_LINK = "https://chat.whatsapp.com/ElWX5O1UZ2lAZ0U4QEBVPu"; // kendi davet linkin
const DRIVE_LINK = "https://drive.google.com/drive/folders/17DvykxxFIy55eh-tV9RM--Tw5LZ9izUV?usp=drive_link";



// 100 puanlık rubrik – ağırlıklar toplamı 100 olmalı
const RUBRIC = [
  {
    key: "theme",
    title: "Tema Uyumu",
    weight: 15,
    desc:
      "Belgenin belirlenen temayı ne kadar merkez aldığı ve oyun fikrine tutarlı şekilde yansıttığı.",
    anchors: [
      "0: Tema ile alakasız veya çelişkili",
      "1: Yüzeysel temas",
      "2: Kısmen entegre",
      "3: Tutarlı fakat sıradan",
      "4: Güçlü ve belirgin",
      "5: Temayı yaratıcı şekilde çekirdek döngüye işlemiş",
    ],
  },
  {
    key: "loop",
    title: "Oynanış Döngüsü & Mekanikler",
    weight: 25,
    desc:
      "Çekirdek oynanış döngüsünün netliği, mekaniklerin birbiriyle ilişkisi ve akışın anlaşılır sunumu.",
    anchors: [
      "0: Döngü tarif edilmemiş",
      "1: Belirsiz/dağınık",
      "2: Kısmen tarifli",
      "3: Net ama sıradan",
      "4: Net ve iyi dengelenmiş",
      "5: Örneklerle çok net, akıcı ve ilgi çekici",
    ],
  },
  {
    key: "originality",
    title: "Özgünlük & Yaratıcılık",
    weight: 20,
    desc:
      "Fikirde yeni yaklaşım, beklenmedik kombinasyonlar, risk alma ve ayırt edici unsurlar.",
    anchors: [
      "0: Klon/çeşitleme",
      "1: Az farklı",
      "2: Bazı özgün öğeler",
      "3: Tanıdık ama tatmin edici",
      "4: Dikkat çekici özgünlük",
      "5: Yüksek yaratıcılık, benzersiz USP",
    ],
  },
  {
    key: "doc",
    title: "Belge Kalitesi & Anlaşılabilirlik",
    weight: 20,
    desc:
      "OTB yapısı, bölüm başlıkları, görsel-diyagram desteği, yazım-dil ve akıcılık.",
    anchors: [
      "0: Kaotik/eksik",
      "1: Zayıf yapı",
      "2: Temel yapı var",
      "3: Düzenli ve okunabilir",
      "4: Çok iyi yapılandırılmış",
      "5: Yayın kalitesinde, örnekli ve akıcı",
    ],
  },
  {
    key: "feas",
    title: "Uygulanabilirlik & Risk Analizi",
    weight: 10,
    desc:
      "Kapsam gerçekçiliği, MVP tanımı, risklerin ve mitigasyonların belirtilmesi.",
    anchors: [
      "0: Gerçekçi değil",
      "1: Büyük riskler ele alınmamış",
      "2: Sınırlı analiz",
      "3: Temel MVP/roadmap var",
      "4: İyi derecede gerçekçi ve planlı",
      "5: Dengeli kapsam + net risk yönetimi",
    ],
  },
  {
    key: "visual",
    title: "Görsel Anlatım & Sunum",
    weight: 10,
    desc:
      "Moodboard/eskiz/şema ile fikrin anlaşılmasına katkı; telif/atıf duyarlılığı.",
    anchors: [
      "0: Görsel destek yok",
      "1: Yetersiz veya karışık",
      "2: Asgari destek",
      "3: Yeterli ve anlaşılır",
      "4: Güçlü destek, tutarlı stil",
      "5: Örnek niteliğinde, temiz ve telif duyarlı",
    ],
  },
] as const;

type RubricKey = (typeof RUBRIC)[number]["key"];

function formatTL(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 0 }) + " TL";
}

function ScoreScale() {
  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle>Değerlendirme Ölçeği (0–5)</CardTitle>
        <CardDescription>
          Jüri her kriter için 0–5 puan verir; sistem ağırlığa göre otomatik 100 puana ölçekler.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="grid grid-cols-5 gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">Seviye</div>
              <div className="text-2xl font-semibold">{i}</div>
              <div className="mt-1 text-xs">Beklenen: {RUBRIC[0].anchors[i]}</div>
            </div>
          ))}
          <div className="rounded-xl border p-3">
            <div className="text-xs text-muted-foreground">Seviye</div>
            <div className="text-2xl font-semibold">5</div>
            <div className="mt-1 text-xs">Beklenen: {RUBRIC[0].anchors[5]}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RubricTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>100 Puanlık Rubrik</CardTitle>
        <CardDescription>
          Ağırlıklar toplamı 100. Jüri, her kriteri bağımsız puanlayıp ortalaması alınır.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-2 pr-3">Kriter</th>
              <th className="py-2 pr-3">Ağırlık</th>
              <th className="py-2 pr-3">Açıklama</th>
              <th className="py-2">Seviye İpuçları (0→5)</th>
            </tr>
          </thead>
          <tbody>
            {RUBRIC.map((r) => (
              <tr key={r.key} className="border-t">
                <td className="py-3 pr-3 font-medium">{r.title}</td>
                <td className="py-3 pr-3"><Badge variant="secondary">{r.weight}</Badge></td>
                <td className="py-3 pr-3 max-w-[28rem]">{r.desc}</td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1">
                    {r.anchors.map((a, i) => (
                      <span key={i} className="rounded bg-muted px-2 py-1 text-xs">{a}</span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function LiveScoringDemo() {
  const [scores, setScores] = useState<Record<RubricKey, number>>({
    theme: 3,
    loop: 3,
    originality: 3,
    doc: 3,
    feas: 3,
    visual: 3,
  });
  const [anon, setAnon] = useState(true);

  const total = useMemo(() => {
    let sum = 0;
    for (const r of RUBRIC) {
      const s = scores[r.key] ?? 0; // 0–5
      sum += (s / 5) * r.weight;
    }
    return Math.round(sum);
  }, [scores]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Canlı Puanlama (Demo)</CardTitle>
        <CardDescription>
          Jüri görünümü için örnek. Her kriteri 0–5 arası seçin, toplam puan otomatik hesaplanır.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Switch id="anon" checked={anon} onCheckedChange={setAnon} />
            <Label htmlFor="anon" className="cursor-pointer">Anonim değerlendirme</Label>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Toplam Puan (0–100)</div>
            <div className="text-3xl font-bold">{total}</div>
            <Progress value={total} className="mt-2 h-2" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {RUBRIC.map((r) => (
            <div key={r.key} className="rounded-xl border p-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">Ağırlık: {r.weight}</div>
                </div>
                <Badge variant="outline">0–5</Badge>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={1}
                value={scores[r.key] ?? 0}
                onChange={(e) => setScores((s) => ({ ...s, [r.key]: Number(e.target.value) }))}
                className="w-full"
              />
              <div className="mt-2 text-xs text-muted-foreground">İpucu: {r.anchors[scores[r.key] ?? 0]}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-3 rounded-xl border p-4 md:grid-cols-2">
          <div className="text-sm">
            <div className="font-medium">Eşitlik Bozma Sırası</div>
            <ul className="mt-2 list-disc pl-5 text-muted-foreground">
              <li>Özgünlük & Yaratıcılık</li>
              <li>Oynanış Döngüsü & Mekanikler</li>
              <li>Tema Uyumu</li>
            </ul>
          </div>
          <div className="text-sm">
            <div className="font-medium">Ön Eleme (16:00–16:30)</div>
            <ul className="mt-2 list-disc pl-5 text-muted-foreground">
              <li>Dosya formatı: PDF, adlandırma: <code>TakımAdı_OyunAdı.pdf</code></li>
              <li>Temel bütünlük: Kapak, logline, döngü, görsel/şema, MVP–risk</li>
              <li>Telif/atıf ve etik beyanlarının bulunması</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HeaderStrip() {
  return (
    <div className="rounded-2xl border bg-gradient-to-br from-indigo-50 to-purple-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{JAM.title} – Rehber</h1>
          <p className="text-sm text-muted-foreground">
            {JAM.teamSize} • Ödüller: {JAM.prizes.map((p) => `${p.place}. ${formatTL(p.amount)}`).join(" • ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          <span className="text-sm text-muted-foreground">Takımlar: 1–3 kişi</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        {JAM.timeline.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2 rounded-full border bg-white/60 px-3 py-1">
            {t.icon}
            <span className="font-medium">{t.time}</span>
            <span className="text-muted-foreground">{t.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function JamScoringAndStand() {
  const [activeTab, setActiveTab] = useState("score");

  const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516" />
    </svg>
  );

  return (
    <div className="mx-auto max-w-6xl p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="score">Puanlandırma</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="submit">Teslim</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-muted-foreground">
              Ödüller: {JAM.prizes.map((p) => `${p.place}. ${formatTL(p.amount)}`).join(" • ")}
            </span>
          </div>
        </div>

        <TabsContent value="score" className="space-y-6">
          <HeaderStrip />
          <RubricTable />
          <ScoreScale />
          <LiveScoringDemo />
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-6">
          <HeaderStrip />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                WhatsApp Grubu
              </CardTitle>
              <CardDescription>
                Duyurular, sorular ve etkinlik güncellemeleri için gruba katılın.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* QR Kod */}
                <div className="flex flex-col items-center justify-center rounded-xl border bg-gradient-to-br from-green-50 to-emerald-50 p-6">
                  <div className="h-48 w-48 rounded-xl bg-white p-4 shadow-sm">
                    <img
                      src="/wa-qr.png"
                      alt="WhatsApp QR Kod"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground text-center">
                    QR kodu telefonunuzla taratın
                  </p>
                </div>

                {/* Link ve Buton */}
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Direkt Link</Label>
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <code className="text-sm break-all text-muted-foreground">
                        {WHATSAPP_LINK}
                      </code>
                    </div>
                  </div>

                  <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="w-full">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Users className="mr-2 h-4 w-4" />
                      WhatsApp Grubuna Katıl
                    </Button>
                  </a>

                  <div className="rounded-lg border bg-blue-50/50 p-3">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>İpucu:</strong> Grupta sessiz mod açık tutarak sadece önemli duyuruları alabilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submit" className="space-y-6">
          <HeaderStrip />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Proje Teslimi
              </CardTitle>
              <CardDescription>
                Oyun tasarım belgenizi (OTB) buradan teslim edin. Son teslim: <strong>16:00</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Önemli Hatırlatma</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Son teslim saati <strong>16:00</strong>'dır. Geç teslimler kabul edilmeyecektir.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col items-center justify-center rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                  <div className="h-48 w-48 rounded-xl bg-white p-4 shadow-sm">
                    <img
                      src="/drive-qr.png"
                      alt="Google Drive QR Kod"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground text-center">
                    QR kodu telefonunuzla taratın
                  </p>
                </div>

                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Drive Klasör Linki</Label>
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <code className="text-xs break-all text-muted-foreground">
                        {DRIVE_LINK}
                      </code>
                    </div>
                  </div>

                  <a href={DRIVE_LINK} target="_blank" rel="noreferrer" className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <FileText className="mr-2 h-4 w-4" />
                      Drive Klasörünü Aç
                    </Button>
                  </a>

                  <div className="space-y-3">
                    <div className="rounded-lg border bg-green-50/50 p-3">
                      <h4 className="text-sm font-medium text-green-800 mb-2">📄 Dosya Formatı</h4>
                      <ul className="text-xs text-green-700 space-y-1">
                        <li>• Format: <strong>PDF</strong></li>
                        <li>• Adlandırma: <code>TakımAdı_OyunAdı.pdf</code></li>
                        <li>• Örnek: <code>FireTeam_SpaceRunner.pdf</code></li>
                      </ul>
                    </div>

                    <div className="rounded-lg border bg-orange-50/50 p-3">
                      <h4 className="text-sm font-medium text-orange-800 mb-2">📋 Kontrol Listesi</h4>
                      <ul className="text-xs text-orange-700 space-y-1">
                        <li>• Kapak sayfası ve oyun logosu</li>
                        <li>• Çekirdek oynanış döngüsü açıklaması</li>
                        <li>• Görsel/şema/moodboard</li>
                        <li>• MVP tanımı ve risk analizi</li>
                        <li>• Telif ve etik beyanları</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Floating WhatsApp Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => {
              console.log("Button clicked, switching to whatsapp");
              setActiveTab("whatsapp");
            }}
            className="h-14 w-14 rounded-full bg-green-500 shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-200"
            title="WhatsApp Grubuna Git"
          >
            <WhatsAppIcon />
          </Button>
        </div>
      </Tabs>
    </div>
  );
}
