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
const SUBMIT_FORM_LINK = "https://forms.gle/iWEmbchks4xkVWqX7";

// 100 puanlık rubrik – ağırlıklar toplamı 100 olmalı
const RUBRIC = [
  {
    key: "theme",
    title: "Tema Uyumu",
    weight: 15,
    desc:
      "Tema ipuçlarının oyun fikrinin çekirdeğine, anlatı tonuna ve mekaniklere ne kadar işlendiği burada ölçülür.",
    anchors: [
      "0: Tema ile bağlantı yok ya da çelişiyor",
      "1: Tema yalnızca isim/dekor düzeyinde",
      "2: Temaya referans var ama çekirdeğe oturmuyor",
      "3: Tema çekirdek fikirde tutarlı fakat sıradan",
      "4: Tema mekanik ve anlatıya doğal şekilde yayılmış",
      "5: Tema yaratıcı biçimde döngüye işlemiş, deneyimi yönlendiriyor",
    ],
  },
  {
    key: "loop",
    title: "Oynanış Döngüsü & Mekanikler",
    weight: 25,
    desc:
      "Çekirdek oynanış döngüsü adımları, mekanikler arası ilişki ve oyuncuya verilen geri bildirimlerin anlatımı değerlendirilir.",
    anchors: [
      "0: Döngü tanımlanmamış veya çelişkili",
      "1: Adımlar belirsiz, mekanikler kopuk",
      "2: Ana adımlar var ama ilişki eksik",
      "3: Döngü net, akış anlaşılır",
      "4: Döngü iyi dengelenmiş, örnek senaryo içeriyor",
      "5: Örnekler ve referanslarla destekli, akıcı ve ilgi çekici",
    ],
  },
  {
    key: "originality",
    title: "Özgünlük & Yaratıcılık",
    weight: 20,
    desc:
      "Yeni yaklaşım, beklenmedik kombinasyonlar, alınan yaratıcı riskler ve ayırt edici satış noktaları burada puanlanır.",
    anchors: [
      "0: Bilinen bir fikrin kopyası",
      "1: Ufak kozmetik farklılıklar",
      "2: Bazı özgün öğeler denenmiş",
      "3: Tanıdık ama tatmin edici yeni dokunuşlar",
      "4: Dikkat çekici özgünlük, belirgin ayrışma",
      "5: Yüksek yaratıcılık, net ve benzersiz değer önerisi",
    ],
  },
  {
    key: "doc",
    title: "Belge Kalitesi & Anlaşılabilirlik",
    weight: 20,
    desc:
      "OTB'nin metin yapısı, başlıklandırma, kaynak gösterimi ve dil akıcılığı çoğunlukla bu kriterde değerlendirilir.",
    anchors: [
      "0: Kaotik ya da kritik başlıklar eksik",
      "1: Bölüm sıralaması zayıf, dil bozuk",
      "2: Temel bölümler var fakat anlatımda kopukluklar bulunuyor",
      "3: Mantıklı akış, okunabilir dil",
      "4: Çok iyi yapılandırılmış, kaynaklı ve tutarlı",
      "5: Yayın kalitesinde, referanslanan, akıcı anlatım",
    ],
  },
  {
    key: "feas",
    title: "Uygulanabilirlik & Risk Analizi",
    weight: 10,
    desc:
      "Proje kapsamının gerçekçiliği, MVP/kısa vadeli plan ve risklerin nasıl yönetileceği bu kriterde incelenir.",
    anchors: [
      "0: Plan gerçekçi değil, riskler yok sayılmış",
      "1: Büyük riskler tanımlı ama çözüm yok",
      "2: Sınırlı analiz, kabaca MVP tarifi",
      "3: Temel MVP ve basit roadmap mevcut",
      "4: Gerçekçi kapsam, riskler için aksiyonlar var",
      "5: Dengeli kapsam, kaynak planı ve net risk mitigasyonları",
    ],
  },
  {
    key: "visual",
    title: "Görsel Anlatım & Sunum",
    weight: 10,
    desc:
      "Moodboard, wireframe, kullanıcı akışı gibi görsellerle fikri destekleme ve telif/atıf duyarlılığı burada puanlanır.",
    anchors: [
      "0: Görsel destek yok veya yanıltıcı",
      "1: Görseller yetersiz, karışık ya da kaynaksız",
      "2: Asgari şema ya da moodboard var",
      "3: Temel görseller anlaşılır biçimde fikirle eşleşiyor",
      "4: Güçlü ve tutarlı görsel dil, gerekli atıflar mevcut",
      "5: Örnek teşkil eden storyboard/UI/wireframe seti, telif duyarlılığı yüksek",
    ],
  },
] as const;

const JURY_MEMBERS = [
  "Mehmet Ulvi Şimşek",
  "Ahmet Yusuf Demir",
  "Can Karabulut",
  "Muhammet Berk Ünsal",
  "Efe Acer",
] as const;

const TEAM_NAMES: readonly string[] = [
  // "Takım Alpha",
  // "Takım Beta",
]; // Jam günü kesinleşen takım adlarıyla güncelleyin

const EVENT_ID = "kgj-2025"; // etkinlik kodu
const API_SCORE = "/api/score"; // vercel function yolu

function calcTotal(scores: Record<RubricKey, number>) {
  let sum = 0;
  for (const r of RUBRIC) sum += ((scores[r.key] ?? 0) / 5) * r.weight;
  return Math.round(sum);
}

type RubricKey = (typeof RUBRIC)[number]["key"];


function pad(n: number) { return n.toString().padStart(2, '0') }
function msToHMS(ms: number) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}
function useNow(tickMs = 1000) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), tickMs);
    return () => clearInterval(t);
  }, [tickMs]);
  return now;
}

function formatTL(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 0 }) + " TL";
}

function ScoreScale() {
  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg sm:text-xl">Değerlendirme Ölçeği (0–5)</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Jüri her kriter için 0–5 puan verir; sistem ağırlığa göre otomatik 100 puana ölçekler.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 text-sm">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl border p-2 sm:p-3 min-w-0">
            <div className="text-xs text-muted-foreground">Seviye</div>
            <div className="text-xl sm:text-2xl font-semibold">{i}</div>
            <div className="mt-1 text-xs break-words">
              Beklenen: {RUBRIC[0].anchors[i]}
            </div>
          </div>
        ))}
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

const DEADLINES = {
  submitISO: "2025-09-25T16:00:00+03:00",
  juryEndISO: "2025-09-25T18:00:00+03:00",
};

function DeadlineBar() {
  const now = useNow(1000);
  const submit = new Date(DEADLINES.submitISO).getTime();
  const juryEnd = new Date(DEADLINES.juryEndISO).getTime();

  const toSubmit = submit - now;
  const toJuryEnd = juryEnd - now;

  return (
    <div className="mt-3 grid gap-3 md:grid-cols-2">
      <div className="rounded-xl border bg-white p-4">
        <div className="text-xs text-gray-500">Son Teslime Kalan</div>
        <div className="mt-1 text-2xl font-bold">{msToHMS(toSubmit)}</div>
      </div>
      <div className="rounded-xl border bg-white p-4">
        <div className="text-xs text-gray-500">Jüri Bitişine Kalan</div>
        <div className="mt-1 text-2xl font-bold">{msToHMS(toJuryEnd)}</div>
      </div>
    </div>
  );
}

function ThemeRevealCard() {
  // Saat 11:00'de açıklanacak
  const revealAtISO = "2025-09-25T11:00:00+03:00";
  const now = Date.now();
  const revealAt = new Date(revealAtISO).getTime();

  const autoRevealed = now >= revealAt;
  const revealed = autoRevealed;

  const THEME = "İklim"; // Etkinlik günü değiştirilir

  return (
    <Card>
      <CardHeader>
        <CardTitle>TEMA</CardTitle>
        <CardDescription>
          Tema açıklanma saati:{" "}
          {revealAtISO.replace("T", " ").replace("+03:00", " (GMT+3)")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <div
          className={`text-2xl font-bold ${revealed ? "" : "blur-md select-none"
            }`}
        >
          {THEME}
        </div>
      </CardContent>
    </Card>
  );
}

function sanitize(s: string) {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // aksan temizle
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}

function FilenameHelper() {
  const [team, setTeam] = React.useState("");
  const [game, setGame] = React.useState("");
  const [showToast, setShowToast] = React.useState(false);

  const filename = `${sanitize(team)}_${sanitize(game)}.pdf`;

  function handleCopy() {
    navigator.clipboard.writeText(filename).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    });
  }

  return (
    <div>
      <div className="rounded-lg border bg-white p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>Takım Adı</Label>
            <Input value={team} onChange={e => setTeam(e.target.value)} placeholder="FireTeam" />
          </div>
          <div>
            <Label>Oyun Adı</Label>
            <Input value={game} onChange={e => setGame(e.target.value)} placeholder="SpaceRunner" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-600 break-all">
            Önerilen: <code className="font-medium">{filename}</code>
          </div>
          <Button variant="secondary" onClick={handleCopy}>
            Kopyala
          </Button>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div
          className="fixed top-6 right-6 z-50 rounded-lg bg-green-600 px-4 py-2 text-white shadow-lg
               transform transition-all duration-500 ease-out
               animate-in slide-in-from-top-4 fade-in zoom-in-95
               data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-4 
               data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
        >
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
            </div>
            <span>Kopyalandı</span>
          </div>
        </div>
      )}
    </div>
  );
}

function HeaderStrip() {
  return (
    <div className="rounded-2xl border bg-gradient-to-br from-indigo-50 to-purple-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{JAM.title} – Etkinlik Rehberi</h1>
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

function JuryPanel() {
  const [token, setToken] = React.useState<string | null>(() => sessionStorage.getItem("juryToken"));
  const [pwd, setPwd] = React.useState("");
  const [judge, setJudge] = React.useState<string>(JURY_MEMBERS[0]);
  const [teamSelection, setTeamSelection] = React.useState<string>("");
  const [customTeam, setCustomTeam] = React.useState("");

  const [scores, setScores] = React.useState<Record<RubricKey, number>>({
    theme: 3, loop: 3, originality: 3, doc: 3, feas: 3, visual: 3,
  });
  const total = calcTotal(scores);

  const resolvedTeam = TEAM_NAMES.length === 0
    ? customTeam
    : teamSelection === "__custom__"
      ? customTeam
      : teamSelection;

  async function submit() {
    if (!token) return alert("Önce parolayla giriş yapın.");
    if (!judge.trim() || !resolvedTeam.trim()) return alert("Jüri ve Takım alanları zorunlu.");
    const payload: any = { event: EVENT_ID, judge, team: resolvedTeam.trim(), total };
    for (const r of RUBRIC) payload[r.key] = scores[r.key] ?? 0;

    const res = await fetch(API_SCORE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 200) {
      alert("Kaydedildi ✅");
    } else if (res.status === 401) {
      alert("Parola hatalı veya yetkisiz ❌");
    } else {
      const j = await res.json().catch(() => ({}));
      alert("Hata: " + (j.error || res.statusText));
    }
  }

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Jüri Girişi</CardTitle>
          <CardDescription>Bu panel yalnızca jüri içindir.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>Parola</Label>
            <Input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Jüri parolası" />
          </div>
          <div className="flex items-end gap-2">
            <Button
              onClick={() => {
                if (!pwd.trim()) return;
                sessionStorage.setItem("juryToken", pwd.trim());
                setToken(pwd.trim());
              }}
            >
              Giriş Yap
            </Button>
            <Button variant="secondary" onClick={() => { sessionStorage.removeItem("juryToken"); setToken(null); }}>
              Temizle
            </Button>
          </div>
          <div className="col-span-full text-xs text-muted-foreground">
            Not: Asıl doğrulama sunucudadır. Yanlış parola ile gönderim reddedilir.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jüri Puanlama</CardTitle>
        <CardDescription>Parola doğrulandı. Puanları girip gönderin.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <div>
              <Label> Jüri Üyesi</Label>
            </div>
            <select
              value={judge}
              onChange={(e) => setJudge(e.target.value)}
              className="w-56 rounded-lg border px-3 py-2 text-sm bg-white"
            >
              {JURY_MEMBERS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Takım</Label>
            {TEAM_NAMES.length > 0 ? (
              <>
                <select
                  value={teamSelection || ""}
                  onChange={(e) => {
                    setTeamSelection(e.target.value);
                    if (e.target.value !== "__custom__") {
                      setCustomTeam("");
                    }
                  }}
                  className="w-56 rounded-lg border px-3 py-2 text-sm bg-white"
                >
                  <option value="" disabled>
                    Takım seçin
                  </option>
                  {TEAM_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                  <option value="__custom__">Diğer / Yeni Takım</option>
                </select>
                {teamSelection === "__custom__" && (
                  <Input
                    value={customTeam}
                    onChange={(e) => setCustomTeam(e.target.value)}
                    placeholder="Takım adını yazın"
                    className="w-56"
                  />
                )}
              </>
            ) : (
              <Input
                value={customTeam}
                onChange={(e) => setCustomTeam(e.target.value)}
                placeholder="Takım adını yazın"
                className="w-56"
              />
            )}
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs text-muted-foreground">Toplam (0–100)</div>
            <div className="text-3xl font-bold">{total}</div>
            <Progress value={total} className="mt-1 h-2" />
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
                type="range" min={0} max={5} step={1}
                value={scores[r.key] ?? 0}
                onChange={(e) => setScores(s => ({ ...s, [r.key]: Number(e.target.value) }))}
                className="w-full"
              />
              <div className="mt-2 text-xs text-muted-foreground">
                İpucu: {r.anchors[scores[r.key] ?? 0]}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={() => {
            sessionStorage.removeItem("juryToken"); setToken(null);
          }}>
            Çıkış Yap
          </Button>
          <Button onClick={submit}>Puanları Gönder</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Leaderboard({ active }: { active: boolean }) {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch("/api/leaderboard?event=kgj-2025", { cache: "no-store" });
      const j = await r.json();
      setData(Array.isArray(j) ? j : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (active) {
      load();
    }
  }, [active, load]);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>Takım başına jüri ortalamaları</CardDescription>
        </div>
        <Button variant="secondary" onClick={load} disabled={loading}>
          {loading ? "Yükleniyor..." : "Yenile"}
        </Button>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-sm text-muted-foreground">Henüz puan yok.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2">Sıra</th>
                <th className="py-2">Takım</th>
                <th className="py-2">Ortalama</th>
                <th className="py-2">Jüri</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, i: number) => (
                <tr key={row.team} className="border-t">
                  <td className="py-2">{i + 1}</td>
                  <td className="py-2 font-medium">{row.team}</td>
                  <td className="py-2">{row.avg}</td>
                  <td className="py-2">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
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
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <TabsList className="bg-muted/60 flex overflow-x-auto gap-2 scrollbar-none">
            <TabsTrigger value="score">Rehber</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="submit">Teslim</TabsTrigger>
            <TabsTrigger value="jury">Jüri</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 shrink-0">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-muted-foreground text-wrap">
              Ödüller: {JAM.prizes.map((p) => `${p.place}. ${formatTL(p.amount)}`).join(" • ")}
            </span>
          </div>
        </div>

        <TabsContent value="score" className="space-y-6">
          <HeaderStrip />
          <DeadlineBar />
          <ThemeRevealCard />
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
                Oyun tasarım belgenizi (OTB) Google Form üzerinden yükleyin. Son teslim: <strong>16:00</strong>
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
                      alt="Google Form QR Kod"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground text-center">
                    QR kodu telefonunuzla taratarak formu açın
                  </p>
                </div>

                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Teslim Formu</Label>
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <code className="text-xs break-all text-muted-foreground">
                        {SUBMIT_FORM_LINK}
                      </code>
                    </div>
                  </div>

                  <a href={SUBMIT_FORM_LINK} target="_blank" rel="noreferrer" className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <FileText className="mr-2 h-4 w-4" />
                      Teslim Formunu Aç
                    </Button>
                  </a>

                  <div className="space-y-3">
                    <div className="rounded-lg border bg-green-50/50 p-3">
                      <h4 className="text-sm font-medium text-green-800 mb-2">📄 Dosya Formatı</h4>
                      <ul className="text-xs text-green-700 space-y-1">
                        <li>• Format: <strong>PDF</strong></li>
                        <li>• Adlandırma: <code>TakımAdı_OyunAdı.pdf</code></li>
                        <li>• Örnek: <code>FireTeam_SpaceRunner.pdf</code></li>
                        <li>• Formu doldururken Google hesabınızla giriş yapmanız gerekiyor</li>
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

                    <div className="rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">
                      Gönderimi tamamladıktan sonra düzenleme yapılamaz; değişiklik gerekirse <strong>yeni bir form gönderimi</strong> oluşturun.
                    </div>

                    <FilenameHelper />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <HeaderStrip />
          <Leaderboard active={activeTab === "leaderboard"} />
        </TabsContent>

        <TabsContent value="jury" className="space-y-6">
          <HeaderStrip />
          <JuryPanel />
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
