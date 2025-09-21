import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  const event = (req.query?.event) || "kgj-2025";
  const raw = await redis.lrange(`scores:${event}`, 0, -1); // tüm kayıtlar
  const items = raw.map((s) => JSON.parse(s));

  const byTeam = new Map();
  for (const r of items) {
    if (!byTeam.has(r.team)) byTeam.set(r.team, []);
    byTeam.get(r.team).push(r);
  }

  function avg(arr, key) {
    return arr.reduce((sum,x)=>sum+(Number(x[key])||0),0) / (arr.length || 1);
  }

  const table = Array.from(byTeam, ([team, arr]) => {
    const avgTotal = Math.round(avg(arr, "total"));
    const tie = [avg(arr,"originality"), avg(arr,"loop"), avg(arr,"theme")];
    return { team, avg: avgTotal, count: arr.length, tiebreak: tie };
  }).sort((a,b)=>{
    if (b.avg !== a.avg) return b.avg - a.avg;
    // tiebreak: originality → loop → theme (desc)
    for (let i=0;i<3;i++){
      const d = b.tiebreak[i] - a.tiebreak[i];
      if (d !== 0) return d;
    }
    return 0;
  });

  res.status(200).json(table);
}
