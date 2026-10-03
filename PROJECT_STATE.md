# Project State — Battlefield 2

- Current milestone: 2.0 Release Candidate 2 — playable and production-build clean.
- Isolation: branch `battlefield-2`, separate worktree, `HB2-*` replay codes, `hb2-*` local storage and `hinses-battlefield-2:*` Redis keys.
- Implemented: three combat doctrines, cinematic command deck, four-stage mission director, luminous arena sectors, nearby-threat telegraph, doctrine-specific player effects, organism core silhouettes, full Version 1 gameplay baseline, mobile/desktop responsive layouts and schema-6 doctrine telemetry.
- Verification: TypeScript production build passes; the automated release gate covers 100 layouts, 100 replay/Hall states, 100 share messages, 100 mission states, 100 threat states, all six APIs, mobile baselines and Version-2 data isolation.
- Next milestone: publish the separate GitHub/Vercel project, collect isolated V2 telemetry and tune from real player runs without touching Version 1.
