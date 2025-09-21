import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Basit parola (Authorization: Bearer <JURY_PASSWORD>)
  const auth = req.headers.authorization || "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!provided || provided !== process.env.JURY_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Body
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch {}
  }
  body ||= {};

  const required = ["event","judge","team","total","theme","loop","originality","doc","feas","visual"];
  for (const k of required) {
    if (body[k] === undefined || body[k] === null || body[k] === "") {
      res.status(400).json({ error: `Missing field: ${k}` });
      return;
    }
  }

  const record = {
    id: Math.random().toString(36).slice(2),
    ts: new Date().toISOString(),
    ua: req.headers["user-agent"],
    ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
    ...body,
  };

  await redis.lpush(`scores:${body.event}`, JSON.stringify(record));
  res.status(200).json({ ok: true });
}
