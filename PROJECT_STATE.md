# Project State — Battlefield 2

- Current milestone: 2.0 Release Candidate 5 — playable, production-build clean and live at `https://hinses-battlefield-2.vercel.app`.
- Isolation: branch `battlefield-2`, separate worktree, `HB2-*` replay codes, `hb2-*` local storage and `hinses-battlefield-2:*` Redis keys.
- Implemented: three combat doctrines, cinematic command deck, four-stage mission director, luminous arena sectors, nearby-threat telegraph, doctrine-specific player effects, organism core silhouettes, full Version 1 gameplay baseline, mobile/desktop responsive layouts and schema-6 doctrine telemetry. RC5 retains the RC4 performance work and makes ambient music lifecycle-safe: it only plays during an active, visible and unpaused round.
- Verification: TypeScript production build passes; the automated release gate covers 100 layouts, 100 replay/Hall states, 100 share messages, 100 mission states, 100 threat states, the premium debrief, Deep Statistics sanitization, all six APIs, mobile baselines and Version-2 data isolation.
- Publication: separate public repository `https://github.com/Hinse77/hinses-battlefield-2`, deployed by the separate Vercel project `hinses-battlefield-2`; Version 1 remains untouched.
- Next milestone: connect a dedicated Upstash store in Vercel, collect isolated V2 telemetry and tune from real player runs without touching Version 1. Until then, shared services use the safe per-browser fallback.
