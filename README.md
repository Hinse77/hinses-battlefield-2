# Hinses Battlefield 2 — Tactical Command

An isolated next-generation branch of the TypeScript/Vite/Canvas arena game. Version 1 is intentionally untouched and can continue independently.

## What is new in 2.0

- Three combat doctrines: **Interceptor**, **Assimilator**, and **Aegis**.
- A cinematic command-deck start screen and living arena atmosphere.
- A four-stage tactical mission director, sector-marked battlefield and fair nearby-threat telegraph.
- Doctrine-specific arena signatures for Interceptor, Assimilator and Aegis.
- Distinct inner silhouettes for every organism family.
- Separate browser storage, replay codes (`HB2-*`), Redis namespaces, Hall of Fame and balance telemetry.
- Vanguard/Normal onboarding by default; Veteran and Apex remain advanced challenges.

Release candidate `2.0.0-rc.4` is playable on desktop and mobile, production-build clean, and isolated from Battlefield 1. Run `npm run test:release` for the complete automated publication gate.

## Live release

- Play: https://hinses-battlefield-2.vercel.app
- Source: https://github.com/Hinse77/hinses-battlefield-2
- Status: RC4 adds viewport rendering and radar throttling for smoother play while retaining the premium mission debrief and player-readable Deep Statistics. Battlefield 1 remains untouched.
- Shared services: the game currently uses its safe browser fallback until an Upstash database is connected to the Vercel project.

## Publish with Vercel

The project is already connected to GitHub and Vercel. Future releases only need a commit and push to `main`; Vercel then builds and publishes them automatically. The default Vite settings are build command `npm run build` and output directory `dist`.

## Local development

Run `npm install` once, then `npm run dev`.

## Arena replay codes

After a completed round, choose **Copy arena code** and send the `HB2-*` code to a friend. Version 1 codes are intentionally not accepted, preventing cross-version balance confusion.

## Shared leaderboard

The game contains Vercel serverless APIs for its leaderboard and anonymous arena activity. Connect **Upstash Redis** and redeploy to enable shared services. All Redis keys begin with `hinses-battlefield-2:` so the production data of Version 1 cannot be modified. Doctrine choice is included in anonymous balance telemetry alongside pace, end mass, combat, boss and phase signals. Without Redis, the game safely falls back to its own `hb2-*` browser records.

Every run receives a unique ID. Wins, losses, time-outs, restarts, quits, and browser closes are retained for analysis; interrupted runs are clearly marked and excluded from the completed-round win rate. Local development queues telemetry for the deployed Vercel balance endpoint and retries it later when the endpoint or Redis is temporarily unavailable.

The ten-level service-rank system accumulates difficulty-weighted points across rounds. Rank records are recognized by arena name, synchronized through the same Redis integration, and retained locally when the API is temporarily unavailable. The current military badge appears on the player orb; Battlefield Apex is paced for roughly one hundred strong Very Hard runs.

## Competitive endgame roles

On Hard and Very Hard, the endgame reacts to both time and player progress: 50% target mass raises arena attention, 75% starts the Elite recovery phase, and 90% triggers the full arena alarm. Large Elites use a mass-aware **Heavy Vector** burst, but increasingly avoid hopeless fights, retreat from superior threats, prefer worthwhile medium prey, and lose their catch-up growth once they reach the arena leaders. Cowards become survival scavengers earlier, reading multiple threats and routing toward safer food. Toxic Crazers receive a stronger particle-growth identity. Bosses defeated by another AI organism can return once through a **Boss Core** after 20 seconds; a boss defeated by the player stays down. Deep Statistics and the shared balance feed record AI boss defeats and Boss Core returns for later tuning.

The compact **Arena Radar** displays the player's approximate position, the ten strongest opponents and every active boss. Rank numbers identify top rivals, gold diamonds identify bosses, and a dashed rectangle shows the current camera area. The radar keeps a smaller layout on mobile devices.
