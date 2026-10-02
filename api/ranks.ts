import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;
const key = "hinses-battlefield-2:service-ranks:v1";
const factors: Record<string, number> = { easy:.7, normal:1, hard:1.25, extreme:1.6 };
const clean = (value: unknown, max: number) => Math.max(0, Math.min(max, Number(value) || 0));

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*"); res.setHeader("Access-Control-Allow-Headers", "Content-Type"); res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (!redis) return res.status(200).json({ configured:false, records:[] });
  const records = (await redis.get<any[]>(key)) || [];
  if (req.method === "GET") return res.status(200).json({ configured:true, records:records.sort((a,b) => b.total - a.total).slice(0,80) });
  if (req.method !== "POST") return res.status(405).json({ error:"Method not allowed" });
  const name = String(req.body?.name || "").replace(/[^a-z0-9 _-]/gi, "").trim().slice(0,14);
  const difficulty = String(req.body?.difficulty || "");
  if (!name || !(difficulty in factors)) return res.status(400).json({ error:"Invalid rank record" });
  const gained = Math.round(clean(req.body?.points, 50000) * factors[difficulty]);
  const id = name.toLowerCase();
  const record = records.find(item => item.id === id) || { id, name, total:0, games:0, wins:0, bestRound:0 };
  record.name = name; record.total += gained; record.games++; record.wins += req.body?.victory === true ? 1 : 0; record.bestRound = Math.max(record.bestRound, gained);
  record.total = Math.max(record.total, clean(req.body?.total, 20000000)); record.games = Math.max(record.games, clean(req.body?.games, 10000)); record.wins = Math.max(record.wins, clean(req.body?.wins, 10000)); record.bestRound = Math.max(record.bestRound, clean(req.body?.bestRound, 100000));
  if (!records.includes(record)) records.push(record);
  records.sort((a,b) => b.total - a.total || b.bestRound - a.bestRound); records.splice(80);
  await redis.set(key, records);
  return res.status(200).json({ configured:true, records:records.slice(0,80), current:record, gained });
}
