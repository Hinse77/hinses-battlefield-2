# Hinses Battlefield 2.0

## Release candidate 1

- Tactical four-stage mission guidance for clearer early, mid and endgame goals.
- Distinct Interceptor, Assimilator and Aegis visual signatures in the arena.
- Luminous world boundary, named arena sectors and upgraded particle rendering.
- Responsive mission UI for desktop and mobile without changing Battlefield 1.

Battlefield 2.0 is developed in the isolated `battlefield-2` branch and worktree. The public version 1 remains on `main` and is not changed by this project.

## Product pillars

1. **Immediate clarity** — first-time players reach meaningful movement and growth within seconds.
2. **Tactical identity** — combat doctrines create distinct, readable play styles without adding complicated controls.
3. **Living arena** — organisms have visible anatomy, faction signatures, threat tells, and environmental presence.
4. **Escalating drama** — the arena reacts to player progress rather than waiting for fixed timers.
5. **Fair mastery** — danger is telegraphed, losses are explainable, and high scores reward decisive play.

## Isolation rules

- Version 1: `main`, current Vercel and itch.io releases.
- Version 2: `battlefield-2`, separate Vercel project and preview URL.
- Redis keys, local saves, analytics, ranks, leaderboards, and balance telemetry use a V2 namespace.
- No V2 deployment replaces the public V1 project until a deliberate release decision.

## Delivery phases

- **Foundation:** isolation, V2 identity, doctrine system, namespaced persistence, production build.
- **Visual vertical slice:** living arena rendering, organism silhouettes, impact language, onboarding.
- **Gameplay depth:** doctrine balance, arena events, enemy counterplay, boss encounters.
- **Validation:** automated smoke suite, device QA, external playtests, KPI review.
- **Launch candidate:** separate preview, controlled traffic, final polish, resubmission assets.
