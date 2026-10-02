import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;
const keys = { totals: "hinses-battlefield-2:analytics:totals", sessions: "hinses-battlefield-2:analytics:sessions", startedByDifficulty: "hinses-battlefield-2:analytics:started-by-difficulty", completedByDifficulty: "hinses-battlefield-2:analytics:completed-by-difficulty", startedByCountry: "hinses-battlefield-2:analytics:started-by-country" };
const number = (value: unknown) => Math.max(0, Number(value) || 0);

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*"); res.setHeader("Access-Control-Allow-Headers", "Content-Type"); res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  if (!redis) return res.status(200).json({ configured: false, totals: { uniqueSessions: 0, starts: 0, completions: 0, wins: 0 }, difficulties: [], countries: [], balance: [] });
  const [totals, sessions, difficulties, completions, countries, balance] = await Promise.all([redis.hgetall<Record<string, unknown>>(keys.totals), redis.scard(keys.sessions), redis.hgetall<Record<string, unknown>>(keys.startedByDifficulty), redis.hgetall<Record<string, unknown>>(keys.completedByDifficulty), redis.hgetall<Record<string, unknown>>(keys.startedByCountry), Promise.all(["easy", "normal", "hard", "extreme"].map(difficulty => redis.get(`hinses-battlefield-2:balance:v1:${difficulty}`)))]);
  const byCountry = Object.entries(countries || {}).map(([country, starts]) => ({ country, starts: number(starts) })).sort((a, b) => b.starts - a.starts || a.country.localeCompare(b.country));
  return res.status(200).json({ configured: true, totals: { uniqueSessions: number(sessions), starts: number(totals?.starts), completions: number(totals?.completions), wins: number(totals?.wins) }, difficulties: ["easy", "normal", "hard", "extreme"].map(difficulty => ({ difficulty, starts: number(difficulties?.[difficulty]), completions: number(completions?.[difficulty]) })), countries: byCountry, balance: balance.map((summary, index) => ({ difficulty:["easy", "normal", "hard", "extreme"][index], ...(summary || {}) })) });
}
