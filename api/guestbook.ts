import { Redis } from "@upstash/redis";

type Entry = { name: string; message: string; createdAt: string };
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;
const key = "hinses-battlefield-2:guestbook:v1";
const clean = (value: unknown, max: number) => String(value || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*"); res.setHeader("Access-Control-Allow-Headers", "Content-Type"); res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (!redis) return res.status(200).json({ configured: false, entries: [] });
  if (req.method === "GET") return res.status(200).json({ configured: true, entries: await redis.lrange<Entry>(key, 0, 39) });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  // Honeypot: normal players never see this field, uncomplicated bots usually fill it.
  if (String(req.body?.website || "").trim()) return res.status(400).json({ error: "Unable to post entry" });
  const name = clean(req.body?.name, 18), message = clean(req.body?.message, 280), sessionId = String(req.body?.sessionId || "");
  if (!name || !message || !/^[a-z0-9-]{12,96}$/i.test(sessionId)) return res.status(400).json({ error: "Name and message are required" });
  const rateKey = `hinses-battlefield-2:guestbook:cooldown:${sessionId}`;
  const allowed = await redis.set(rateKey, "1", { nx: true, ex: 45 });
  if (!allowed) return res.status(429).json({ error: "Please wait a moment before posting again." });
  const globalWindowKey = `hinses-battlefield-2:guestbook:global:${Math.floor(Date.now() / 300000)}`;
  const globalPosts = await redis.incr(globalWindowKey);
  if (globalPosts === 1) await redis.expire(globalWindowKey, 360);
  if (globalPosts > 30) return res.status(429).json({ error: "Guestbook is busy. Please try again in a few minutes." });
  const entry: Entry = { name, message, createdAt: new Date().toISOString() };
  await redis.lpush(key, entry);
  await redis.ltrim(key, 0, 99);
  return res.status(201).json({ configured: true, entry });
}
