import { Redis } from "@upstash/redis";

type Record = { name: string; score: number; mass: number; wins: number; runs: number; combo: number; difficulty: string };
const allowed = new Set(["easy", "normal", "hard", "extreme"]);
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;
// A new season starts with the Toxic Master release. Older score keys are intentionally retired.
const keyFor = (difficulty: string) => `hinses-battlefield-2:hall:season-1:${difficulty}`;
const clean = (value: unknown, max: number) => Math.max(0, Math.min(max, Number(value) || 0));

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*"); res.setHeader("Access-Control-Allow-Headers", "Content-Type"); res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  const difficulty = String(req.method === "GET" ? req.query?.difficulty : req.body?.difficulty || "normal");
  if (!allowed.has(difficulty)) return res.status(400).json({ error: "Unknown difficulty" });
  if (!redis) return res.status(200).json({ configured: false, records: [] });
  const current = (await redis.get<Record[]>(keyFor(difficulty))) || [];
  if (req.method === "GET") return res.status(200).json({ configured: true, records: current });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const name = String(req.body?.name || "").replace(/[^a-z0-9 _-]/gi, "").trim().slice(0, 14);
  if (!name) return res.status(400).json({ error: "Name required" });
  const incoming: Record = { name, difficulty, score: clean(req.body?.score, 500000), mass: clean(req.body?.mass, 200000), wins: clean(req.body?.wins, 10000), runs: clean(req.body?.runs, 10000), combo: clean(req.body?.combo, 1000) };
  // A Hall of Fame is a history of great runs, not one rolling value per name.
  // Repeated names are intentional: every completed arena can earn its own place.
  current.push(incoming);
  current.sort((a, b) => b.score - a.score || b.mass - a.mass);
  const records = current.slice(0, 100);
  await redis.set(keyFor(difficulty), records);
  return res.status(200).json({ configured: true, records });
}
