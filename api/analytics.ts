import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;
const difficulties = new Set(["easy", "normal", "hard", "extreme"]);
const keys = { totals: "hinses-battlefield-2:analytics:totals", sessions: "hinses-battlefield-2:analytics:sessions", startedByDifficulty: "hinses-battlefield-2:analytics:started-by-difficulty", completedByDifficulty: "hinses-battlefield-2:analytics:completed-by-difficulty", startedByCountry: "hinses-battlefield-2:analytics:started-by-country" };
const integer = (value: unknown) => Math.max(0, Number(value) || 0);

async function stats() {
  const [totals, sessions, startedByDifficulty, completedByDifficulty, startedByCountry] = await Promise.all([redis!.hgetall<Record<string, unknown>>(keys.totals), redis!.scard(keys.sessions), redis!.hgetall<Record<string, unknown>>(keys.startedByDifficulty), redis!.hgetall<Record<string, unknown>>(keys.completedByDifficulty), redis!.hgetall<Record<string, unknown>>(keys.startedByCountry)]);
  const countries = Object.entries(startedByCountry || {}).map(([country, starts]) => ({ country, starts: integer(starts) })).sort((a, b) => b.starts - a.starts || a.country.localeCompare(b.country)).slice(0, 5);
  return { configured: true, totals: { uniqueSessions: integer(sessions), starts: integer(totals?.starts), completions: integer(totals?.completions), wins: integer(totals?.wins) }, byDifficulty: Object.fromEntries([...difficulties].map(difficulty => [difficulty, { starts: integer(startedByDifficulty?.[difficulty]), completions: integer(completedByDifficulty?.[difficulty]) }])), countries };
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*"); res.setHeader("Access-Control-Allow-Headers", "Content-Type"); res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (!redis) return res.status(200).json({ configured: false });
  if (req.method === "GET") return res.status(200).json(await stats());
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const event = String(req.body?.event || ""), difficulty = String(req.body?.difficulty || ""), sessionId = String(req.body?.sessionId || "");
  if ((event !== "start" && event !== "complete") || !difficulties.has(difficulty) || !/^[a-z0-9-]{12,96}$/i.test(sessionId)) return res.status(400).json({ error: "Invalid analytics event" });
  const headerCountry = String(req.headers?.["x-vercel-ip-country"] || "").toUpperCase();
  const country = /^[A-Z]{2}$/.test(headerCountry) ? headerCountry : "Unknown";
  if (event === "start") await Promise.all([redis.sadd(keys.sessions, sessionId), redis.hincrby(keys.totals, "starts", 1), redis.hincrby(keys.startedByDifficulty, difficulty, 1), redis.hincrby(keys.startedByCountry, country, 1)]);
  else { const writes: Array<Promise<unknown>> = [redis.hincrby(keys.totals, "completions", 1), redis.hincrby(keys.completedByDifficulty, difficulty, 1)]; if (req.body?.won === true) writes.push(redis.hincrby(keys.totals, "wins", 1)); await Promise.all(writes); }
  return res.status(200).json(await stats());
}
