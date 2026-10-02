# Architecture — Battlefield 2

## Version boundary

Battlefield 2 is developed in the `battlefield-2` branch/worktree. It never writes Version 1 state: browser persistence uses `hb2-*`, server persistence uses `hinses-battlefield-2:*`, and replay codes use `HB2-*`. Its intended deployment is a separate Vercel project.

The first 2.0 gameplay layer is the combat doctrine system. `Game` applies doctrine modifiers at the smallest relevant boundaries—movement/cooldown, food/absorption growth, and environmental damage—and stores the doctrine in schema-6 round telemetry. This keeps the baseline AI and scoring comparable while allowing doctrine-specific balancing.

- `src/game/config.ts`: central balancing settings.
- `src/game/Game.ts`: loop, input, food lifecycle, and drawing orchestration.
- `src/entities/Player.ts`: player movement and mass-to-radius logic.
- `src/entities/Organism.ts`: lightweight computer-controlled organism movement.
- `src/game/Game.ts`: additionally owns AI decisions, absorption rules, respawn queue, HUD, and game state.
- `src/rendering/Camera.ts`: smooth player-following camera and zoom.
- `src/systems/SpatialGrid.ts`: bucketed nearby-entity lookup for AI perception.
- `src/game/types.ts`: shared simple data types.
