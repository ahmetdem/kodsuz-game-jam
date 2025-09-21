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
          <h1 className="text-2xl font-bold tracking-tight">{JAM.title} – Puanlandırma Rehberi</h1>
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

function StandPoster() {
  return (
    <div className="mx-auto max-w-4xl p-6 print:p-0">
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-8 text-white shadow-2xl">
        <div className="absolute -right-24 -top-24 h-64 w-64 rotate-12 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 h-64 w-64 -rotate-6 rounded-full bg-white/10 blur-2xl" />

        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8" />
          <h2 className="text-3xl font-black tracking-tight">{JAM.title}</h2>
        </div>

        <p className="mt-2 text-lg/6 text-white/90">Kod yok, fikir çok! {JAM.host}'de 1 günde oyun tasarım belgeni (OTB) hazırla.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card className="bg-white/10 text-white backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ödüller</CardTitle>
              <CardDescription className="text-white/80">Toplam {formatTL(JAM.prizes.reduce((a,b)=>a+b.amount,0))}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {JAM.prizes.map((p) => (
                <div key={p.place} className="flex items-center justify-between">
                  <span className="opacity-90">{p.place}. Ödül</span>
                  <span className="font-semibold">{formatTL(p.amount)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/10 text-white backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Zaman / Yer</CardTitle>
              <CardDescription className="text-white/80">{JAM.date}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {JAM.timeline.map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="opacity-90">{t.label}</span>
                  <span className="font-semibold">{t.time}</span>
                </div>
              ))}
              <div className="pt-2 text-xs opacity-80">{JAM.location}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 text-white backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Katılım</CardTitle>
              <CardDescription className="text-white/80">{JAM.teamSize}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><Clock className="h-4 w-4"/> 16:00 sonrası ön eleme + jüri</div>
              <div className="flex items-center gap-2"><Users className="h-4 w-4"/> 1–3 kişi takımlar</div>
              <div className="flex items-center gap-2"><FileText className="h-4 w-4"/> Teslim: PDF – OTB</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm/6">
            <div className="font-semibold">Kısaca</div>
            <div className="opacity-90">Tema açıklanır → 5 saat üretim → Ön eleme (30 dk) → Jüri (1,5 saat)</div>
          </div>

          <div className="flex items-center gap-3">
            {JAM.qrImageUrl ? (
              <img src={JAM.qrImageUrl} alt="Kayıt QR" className="h-24 w-24 rounded bg-white p-2" />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded bg-white/20 text-xs">QR</div>
            )}
            <Button variant="secondary" onClick={() => window.print()} className="font-semibold">
              Yazdır / PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JamScoringAndStand() {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <Tabs defaultValue="score">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="score">Puanlandırma</TabsTrigger>
            <TabsTrigger value="poster">Stand Afişi</TabsTrigger>
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

        <TabsContent value="poster">
          <StandPoster />
        </TabsContent>
      </Tabs>
    </div>
  );
}
