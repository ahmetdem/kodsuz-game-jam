// api/leaderboard.mjs
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  // asla cache'lenmesin
  res.setHeader("Cache-Control", "no-store, max-age=0");
  try {
    const q = req.query?.event;
    const event = Array.isArray(q) ? q[0] : (q || "kgj-2025");
    const key = `scores:${event}`;

    const raw = await redis.lrange(key, 0, -1);
    // DEBUG (isteğe bağlı): console.log("[leaderboard] key:", key, "count:", raw.length);

    if (!raw.length) return res.status(200).json([]);

    let items = [];
    for (const s of raw) {
      try { items.push(JSON.parse(s)); } catch {}
    }

    const byTeam = new Map();
    for (const r of items) {
      if (!byTeam.has(r.team)) byTeam.set(r.team, []);
      byTeam.get(r.team).push(r);
    }

    const avg = (arr, key) =>
      arr.reduce((sum, x) => sum + (Number(x[key]) || 0), 0) / (arr.length || 1);

    const table = Array.from(byTeam, ([team, arr]) => {
      const avgTotal = Math.round(avg(arr, "total"));
      const tie = [avg(arr,"originality"), avg(arr,"loop"), avg(arr,"theme")];
      return { team, avg: avgTotal, count: arr.length, tiebreak: tie };
    }).sort((a,b)=>{
      if (b.avg !== a.avg) return b.avg - a.avg;
      for (let i=0;i<3;i++){
        const d = b.tiebreak[i] - a.tiebreak[i];
        if (d !== 0) return d;
      }
      return 0;
    });

    return res.status(200).json(table);
  } catch (err) {
    console.error("[leaderboard] error:", err);
    // üretimde tabloyu boş döndürmek daha nazik
    return res.status(200).json([]);
  }
}
