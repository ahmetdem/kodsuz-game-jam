import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  try {
    const q = req.query?.event;
    const event = Array.isArray(q) ? q[0] : (q || "kgj-2025");
    const key = `scores:${event}`;

    const raw = await redis.lrange(key, 0, -1);
    if (!raw.length) {
      res.status(200).json([]);
      return;
    }

    const votes = [];

    for (const item of raw) {
      try {
        const parsed = typeof item === "object" && item !== null ? item : JSON.parse(item);
        if (!parsed) continue;

        const {
          id,
          ts,
          judge,
          team,
          total,
          theme,
          loop,
          originality,
          doc,
          feas,
          visual,
        } = parsed;

        votes.push({
          id,
          ts,
          judge,
          team,
          total,
          theme,
          loop,
          originality,
          doc,
          feas,
          visual,
        });
      } catch (error) {
        console.warn("[votes] failed to parse record", error);
      }
    }

    votes.sort((a, b) => {
      const judgeCmp = String(a.judge || "").localeCompare(String(b.judge || ""), "tr");
      if (judgeCmp !== 0) return judgeCmp;
      const dateCmp = String(a.ts || "").localeCompare(String(b.ts || ""));
      if (dateCmp !== 0) return dateCmp;
      return String(a.team || "").localeCompare(String(b.team || ""), "tr");
    });

    res.status(200).json(votes);
  } catch (error) {
    console.error("[votes] error", error);
    res.status(200).json([]);
  }
}
