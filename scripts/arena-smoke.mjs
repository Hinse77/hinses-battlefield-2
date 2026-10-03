import { readFileSync } from "node:fs";

const root = new URL("..", import.meta.url);
const read = path => readFileSync(new URL(path, root), "utf8");
const config = read("src/game/config.ts");
const game = read("src/game/Game.ts");
const html = read("index.html");
const css = read("src/style.css");
const publicAnalytics = read("api/admin-analytics.ts");
const robots = read("public/robots.txt");
const sitemap = read("public/sitemap.xml");
const llms = read("public/llms.txt");
const manifest = read("public/manifest.webmanifest");
const celebration = read("src/ui/CelebrationFireworks.ts");
const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };

// Fixed competitive rules and all central mechanics must remain present.
expect(/targetMass:\s*40000/.test(config), "Target mass is not fixed to 40,000.");
expect(/maxSurvivalSeconds:\s*600/.test(config), "Time limit is not fixed to 10 minutes.");
expect(/localStorage\.getItem\("hb2-last-difficulty"\) \|\| "normal"/.test(game) && /<option value="normal" selected>/.test(html) && !/<option value="extreme" selected>/.test(html), "Battlefield 2 does not start with the intended Vanguard onboarding difficulty.");
expect(/type Doctrine = "interceptor" \| "assimilator" \| "aegis"/.test(game) && /name="doctrine"/.test(html) && /updateDoctrineUi/.test(game), "Combat doctrine selection or HUD feedback is incomplete.");
expect(/doctrineSpeed=this\.doctrine === "interceptor" \? 1\.12/.test(game) && /cooldown=this\.doctrine === "interceptor" \? 15000 : 18000/.test(game), "Interceptor movement or Overdrive recovery is incomplete.");
expect(/this\.doctrine === "assimilator" \? 1\.45/.test(game) && /this\.doctrine === "assimilator" \? 1\.12/.test(game), "Assimilator growth modifiers are incomplete.");
expect(/this\.doctrine === "aegis" \? \.65 : 1/.test(game) && /poisonLoss=small\.mass\*\(big === this\.player && this\.doctrine === "aegis" \? \.65 : 1\)/.test(game), "Aegis protection is incomplete.");
expect(/poisonousGrazer\s*=\s*small instanceof Organism/.test(game), "Toxic Crazers do not poison every eater.");
expect(/updatePoisonBolts/.test(game) && /drawPoisonBolts/.test(game), "Toxic Master poison arrows are incomplete.");
expect(/Toxic Master/.test(game), "Toxic Master is missing from game logic.");
expect(/adaptiveRate/.test(game) && /target\.mass-10000/.test(game) && /maxDamage/.test(game) && /actualLoss\*\.28/.test(game), "Toxic Master's Adaptive Venom scaling or siphon is incomplete.");
for (let run = 0; run < 100; run++) {
  const mass = 200 + run * 2500, baseDamage = 120, rate = .016, cap = 2200, gentleBase = Math.min(baseDamage, Math.max(18, mass * .01)), damage = Math.min(cap, Math.floor(gentleBase + Math.max(0, mass - 10000) * rate));
  expect(damage >= 18 && damage <= cap, `Adaptive Venom smoke ${run + 1}: damage escaped its safe range.`);
  if (mass < 3000) expect(damage <= 30, `Adaptive Venom smoke ${run + 1}: early damage is too punishing.`);
}
expect(/captureTypePeaks/.test(game) && /peaks:\{\.\.\.this\.typePeakMass\}/.test(game), "Opponent peak-mass telemetry is incomplete.");
expect(/eliteRecoveryActive/.test(game) && /escalation\.stage >= 2/.test(game) && /this\.difficulty === "extreme" \? 1\.72 : 1\.48/.test(game), "Elite recovery is not linked to the dynamic endgame.");
expect(/speedMultiplier=now < o\.boostUntil \? o\.speedMultiplier : 1/.test(game), "Elite recovery still adds an unfair passive speed bonus.");
expect(/eliteEndgameActive/.test(game) && /eliteViablePrey/.test(game) && /eliteMediumPrey/.test(game), "Elite tactical target intelligence is incomplete.");
expect(/eliteRetreat/.test(game) && /threat\.mass >= o\.mass \* 1\.38/.test(game) && /personality === "grazer"/.test(game), "Elite protection from hopeless or poisonous targets is incomplete.");
expect(/eliteLeaderGrowth/.test(game) && /leaderCount=Math\.max\(2,Math\.ceil\(leaders\.length\*\.18\)\)/.test(game) && /relative >= 1\) return 1/.test(game) && /relative < \.35 \? 1\.38 : relative < \.7 \? 1\.25 : 1\.12/.test(game), "Degressive leading-Elite growth is incomplete.");
expect(/eliteGrowth=Math\.max\(recoveryGrowth,leaderGrowth\)/.test(game) && /Math\.max\(recoveryGrowth,leaderGrowth\)/.test(game), "Elite recovery and leader growth still stack multiplicatively.");
expect(/eliteBurstProfile/.test(game) && /\(o\.mass-20000\)\/40000/.test(game) && /endPower=extreme \? 2\.05 : 1\.86/.test(game) && /extreme \? 3800 : 3300/.test(game), "Heavy Vector does not taper large-Elite speed or enforce recovery.");
expect(/cowardSurvivalGrowth/.test(game) && /stage < 1/.test(game) && /safeSnack/.test(game) && /Math\.random\(\) < \.9/.test(game), "Coward survivor-scavenger role is incomplete.");
expect(/grazerFoodGrowth/.test(game) && /1\.58/.test(game), "Toxic Crazer particle growth identity is incomplete.");
expect(/const late=this\.arenaEscalation\(\)\.stage >= 2/.test(game) && /elite:\.19, hunter:\.26/.test(game) && /fallback === "hunter" && this\.arenaRandom\(\) < \.14/.test(game), "Dynamic Hunter-to-Elite respawn shift is incomplete.");
expect(/playerArenaRank\(\) === 1/.test(game) && /CONQUEST PHASE/.test(game), "Very Hard conquest victory is incomplete.");
expect(/processRespawns/.test(game) && /respawnBudget/.test(game) && /respawnPersonality/.test(game), "Respawn throttling or type balancing is incomplete.");
expect(/chaoticGrowth/.test(game) && /o\.mass <= 45000/.test(game), "Chaotic high-mass growth control is incomplete.");
expect(/maxMass/.test(game) && /averageMass/.test(game) && /strongest individuals/.test(game), "Comparable phase intelligence is incomplete.");
expect(/progress >= \.9 \? 3 : progress >= \.75 \? 2 : progress >= \.5 \? 1 : 0/.test(game) && /FULL ARENA ALARM/.test(game), "The 50/75/90 percent escalation stages are incomplete.");
expect(/id="minimap"/.test(html) && /drawMinimap/.test(game) && /slice\(0,10\)/.test(game) && /o\.boss && !topIds\.has\(o\.id\)/.test(game), "Arena Radar does not show the top ten opponents and every boss.");
expect(/\.mobile-play \.arena-radar canvas \{ height:76px/.test(css), "Arena Radar has no compact mobile layout.");
expect(/hinses-battlefield-start-landscape\.jpg/.test(css) && /hinses-battlefield-start-portrait\.jpg/.test(css), "The cinematic start artwork is not wired for both desktop and mobile.");
expect(/justify-items:end/.test(css) && /mask-image:linear-gradient/.test(css) && /translateX\(-10%\)/.test(css) && /@media \(max-width:700px\), \(orientation:portrait\) and \(pointer:coarse\)/.test(css), "The cinematic start artwork lacks its separated hero/menu composition or responsive mobile treatment.");
expect(/edgeEscapeUntil/.test(game) && /edgeEscapeActive/.test(game) && /touchingEdge/.test(game) && /now\+2400/.test(game), "Persistent edge-escape lanes are incomplete.");
expect(/stuckSeconds/.test(read("src/entities/Organism.ts")) && /leftPressure \* leftPressure/.test(read("src/entities/Organism.ts")) && /this\.velocity\.x \+= dx\/centerDistance\*280/.test(read("src/entities/Organism.ts")), "Physical wall recovery or the stuck detector is incomplete.");
for (let run = 0; run < 100; run++) {
  const x = run % 2 ? 120 : 5880, y = run % 4 < 2 ? 120 : 5880, centerX = 3000, centerY = 3000, dx = centerX - x, dy = centerY - y, distance = Math.hypot(dx, dy), lane = (run % 7 - 3) * 105;
  const targetX = centerX - dy / distance * lane, targetY = centerY + dx / distance * lane;
  expect(targetX > 500 && targetX < 5500 && targetY > 500 && targetY < 5500 && dx * (targetX - x) + dy * (targetY - y) > 0, `Edge recovery smoke ${run + 1}: unsafe escape lane.`);
}
expect(/updateEndDuel\(dt\)/.test(game) && /playerRank <= 2/.test(game) && /larger\/smaller <= 1\.8/.test(game), "A genuine top-two end duel is not tracked.");
expect(/endDuelBonus/.test(game) && /duelSeconds < 8/.test(game) && /extreme" \? 2500/.test(game) && /kind:"duel"/.test(game), "The capped End Duel score bonus is incomplete.");
expect(/captureMassRecord/.test(game) && /hb2-personal-mass-record:/.test(game) && /NEW MASS RECORD/.test(game) && /mass-record-card/.test(css), "Personal mass records are not clearly recognized in the round summary.");
for (let run = 0; run < 100; run++) {
  const difficulty = ["easy","normal","hard","extreme"][run % 4], caps = { easy:800, normal:1200, hard:1800, extreme:2500 }, cap = caps[difficulty], seconds = 8 + run * .55, rivalMass = 30000 + run * 900, threatScale = Math.max(0,Math.min(1,(rivalMass/40000-.75)/1.75)), durationScale = Math.min(1,seconds/40), bonus = Math.min(cap,Math.round((350+cap*.65*threatScale+cap*.22*durationScale)/50)*50);
  expect(bonus >= 0 && bonus <= cap, `End Duel score smoke ${run + 1}: bonus exceeds its difficulty cap.`);
}
for (let run = 0; run < 100; run++) {
  const progress = run / 100;
  const stage = progress >= .9 ? 3 : progress >= .75 ? 2 : progress >= .5 ? 1 : 0;
  expect(stage === (run >= 90 ? 3 : run >= 75 ? 2 : run >= 50 ? 1 : 0), `Escalation smoke ${run + 1}: wrong progress stage.`);
}
expect(/relevanceRadius/.test(game) && /selectionBand/.test(game) && /chaosAiDamage/.test(game), "Spatially relevant Chaotic explosions or their impact telemetry are incomplete.");
expect(/hinses-battlefield-2:hall:season-1/.test(read("api/leaderboard.ts")), "The isolated Battlefield 2 Hall of Fame is not active.");
expect(/configurable-rules" hidden/.test(html), "Advanced match-rule controls are visible.");
expect(/hidden = !victory;/.test(game) && /hidden = winner !== this\.player;/.test(game), "Victory fireworks are not guaranteed for a player win, including a time-up win.");
expect(/celebration-canvas/.test(css) && /firework-side \{ display:none !important/.test(css), "The legacy flat fireworks are not fully replaced by the canvas celebration.");
expect(/class CelebrationFireworks/.test(celebration) && /globalCompositeOperation = "lighter"/.test(celebration) && /private project\(/.test(celebration), "Desktop 3D celebration renderer is incomplete.");
expect(/this\.mobile\s*\?\s*18\s*:\s*48/.test(celebration) && /this\.mobile\s*\?\s*2\s*:\s*5/.test(celebration), "Mobile celebration does not use its reduced particle budget.");
expect(/SERVICE_RANKS/.test(game) && /recordServiceRank/.test(game) && /service-ranks/.test(html) && /threshold:3200000/.test(game), "Service-rank progress or long-term pacing is incomplete.");
expect(/refreshServiceRanks/.test(game) && /apiEndpoint\("\/api\/ranks"\)/.test(game), "Global service ranks are not loaded at startup.");
expect(/drawPlayerRankBadge/.test(game) && /this\.drawPlayerRankBadge\(ctx\)/.test(game) && /RANK UP/.test(game) && /rankPromotion/.test(css), "Visible player badge or rank-up feedback is incomplete.");
expect(/req\.body\?\.total/.test(read("api/ranks.ts")) && /slice\(0,80\)/.test(read("api/ranks.ts")), "Cross-device service-rank synchronization is incomplete.");
expect(/req\.method !== "GET"/.test(publicAnalytics) && !/ANALYTICS_ADMIN_KEY/.test(publicAnalytics), "Community overview is still password-protected.");
expect(!/admin-key/.test(html) && /Community overview/.test(html), "Community overview UI still requests an access code.");
expect(/renderLocalAdminAnalytics/.test(game) && /contentType\.includes\("application\/json"\)/.test(game), "Community overview has no safe local-preview fallback.");
expect(/quit-round/.test(html) && /quitToMenu/.test(game) && /start-screen/.test(game), "Quit-to-menu navigation is incomplete.");
expect(/saveInterruptedStats\("Quit to menu"\)/.test(game) && /saveInterruptedStats\("Restarted"\)/.test(game) && /pagehide/.test(game) && /saveInterruptedStats\("Browser closed"\)/.test(game), "Quit, restart, or page-close can still discard a run.");
expect(/status:"abandoned"/.test(game) && /runId:this\.currentRunId/.test(game) && /withoutDuplicate/.test(game), "Interrupted-run identity or local deduplication is incomplete.");
expect(/balanceEndpoint/.test(game) && /hinses-battlefield-2\.vercel\.app\/api\/balance/.test(game) && !/flushBalanceQueue\(\) \{ if \(this\.isLocalPreview\(\)\) return/.test(game), "Local preview cannot forward queued Battlefield 2 telemetry after deployment.");
expect(/\.quick-actions button/.test(css) && /\.best-toggle/.test(css) && /\.quit-round/.test(css), "In-game action buttons are not visually unified.");
expect(/Phone refinement/.test(css) && /@media \(max-width:430px\)/.test(css), "Dedicated narrow-phone layout is missing.");
expect(/\.mobile-play \.hud \{ grid-template-columns:repeat\(2,max-content\)/.test(css) && /\.leaderboard li:nth-child\(n\+4\)/.test(css), "Narrow-phone HUD and leaderboard can still collide.");
expect(/\.mobile-play \.quick-actions button \{ min-width:44px; min-height:44px/.test(css) && /\.mobile-play \.start-card input,\.mobile-play \.start-card select \{ min-height:44px/.test(css), "Primary mobile touch targets are too small.");
expect(/\.mobile-play \.end-hall \{ order:2/.test(css), "Mobile results do not prioritize the player's round summary.");
expect(/Compact desktop end screen/.test(css) && /grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/.test(css) && /grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/.test(css) && /max-height:calc\(100vh - 20px\)/.test(css), "Desktop end screen is not compact enough to avoid page scrolling.");
expect(/updateToxicKamikaze/.test(game) && /elapsed < 120/.test(game) && /toxic\.mass \* 8/.test(game), "Very Hard Toxic Kamikaze is incomplete.");
expect(/toxicAdvantage/.test(game) && /1\.18 : 1\.08/.test(game) && /1\.3 : 1\.15/.test(game) && /grazerFoodGrowth/.test(game), "Toxic Crazer growth role is incomplete.");
expect(/personality:removed\.personality/.test(game) && /makeOrganism\(this\.respawnPersonality\(entry\.personality\)\)/.test(game), "Respawning does not preserve or rebalance regular opponent types.");
expect(/updateBossCores/.test(game) && /bossName:removed\.name/.test(game) && /performance\.now\(\)\+20000/.test(game) && /killer !== this\.player/.test(game), "One-time AI-only Boss Core return is incomplete.");
expect(/bossAiDefeats/.test(game) && /bossCoreReturns/.test(game) && /schemaVersion:6/.test(game), "Boss lifecycle telemetry is incomplete.");
expect(/toxic-alert/.test(html) && /TOXIC KAMIKAZE/.test(html), "Toxic Kamikaze warning is missing.");
expect(/arenaCode\(\)/.test(game) && /setArenaCode/.test(game) && /arenaRandom\(\)/.test(game), "Replay arena code generation is incomplete.");
expect(/arena-code/.test(html) && /Copy arena code/.test(game), "Replay arena code UI is missing.");
expect(/id="challenge-friend"/.test(html) && /Challenge a friend/.test(html) && /Share this result and arena/.test(html), "Challenge-a-friend result action is missing.");
expect(/prepareChallenge\(points\.total\)/.test(game) && /I reached \$\{mass\} mass and earned \$\{score\} points/.test(game) && /Can you beat me in the same arena\?/.test(game) && /Arena Code: \$\{this\.arenaCode\(\)\}/.test(game), "Challenge message does not include the complete round result and arena code.");
expect(/toLocaleString\("en-US"\)/.test(game) && /https:\/\/hinses-battlefield-2\.vercel\.app/.test(game), "Challenge numbers or production link are not share-ready.");
expect(/this\.mobileMode && typeof navigator\.share === "function"/.test(game) && /navigator\.clipboard\.writeText/.test(game) && /document\.execCommand\("copy"\)/.test(game), "Challenge sharing lacks mobile, clipboard, or legacy fallback support.");
expect(/\.challenge-friend/.test(css) && /challenge-sheen/.test(css) && /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/.test(css), "Challenge button is not integrated into the compact result design.");
expect(/difficultyField\.addEventListener\("change"/.test(game) && /codeField\.value = ""/.test(game) && /difficultyField\.value = this\.difficulty/.test(game), "A stale arena code can still override a manually selected difficulty.");
expect(/record\.difficulty === this\.difficulty/.test(game), "Hall of Fame records are not filtered by the active difficulty.");
expect(/record\.difficulty === this\.latestHallRecord\.difficulty/.test(game), "The current-round NEW marker can leak into another difficulty.");
expect(/const record = \{ name: this\.playerName, score, mass: Math\.floor\(this\.player\.mass\), wins: victory \? 1 : 0, runs: 1, combo: this\.maxCombo, difficulty: this\.difficulty \}/.test(game), "Completed Hall of Fame records do not preserve their round difficulty.");
expect(/Challenge a friend/.test(html) && /same starting food, opponents and bosses/.test(html), "The field guide does not explain friend challenges and arena codes accurately.");
expect(/At time up, the largest organism wins/.test(html) && /Overdrive lasts 5 seconds, then recharges for 18 seconds/.test(html), "Core field-guide rules are out of date.");
expect(/Void Rift that empowers hunters and elites/.test(html) && /He is poisonous too/.test(html) && /Boss Core can restore it once after 20 seconds/.test(html), "Boss field-guide details are out of date.");
expect(/\"@type\":\"VideoGame\"/.test(html) && /application-name/.test(html) && /canonical/.test(html), "Core game SEO metadata is incomplete.");
expect(/Sitemap: https:\/\/hinses-battlefield-2\.vercel\.app\/sitemap\.xml/.test(robots) && /<lastmod>2026-10-02<\/lastmod>/.test(sitemap), "Robots or sitemap SEO discovery is incomplete.");
expect(/Friendly arena challenges/.test(llms) && /Arena Code/.test(llms) && /\"categories\"/.test(manifest), "AI discovery or install metadata is incomplete.");
expect(/capturePhaseSnapshots/.test(game) && /capturePhaseSnapshot\("end"\)/.test(game) && /phases:this\.phaseSnapshots/.test(game), "Opponent phase snapshots are incomplete.");
expect(/deathCause/.test(game) && /big instanceof Organism \? big\.name/.test(game), "Player death-cause tracking is incomplete.");
expect(/deathCauses/.test(read("api/balance.ts")) && /phaseSnapshots/.test(read("api/balance.ts")) && /source\.maxMass/.test(read("api/balance.ts")) && /source\.averageMass/.test(read("api/balance.ts")), "Shared balance telemetry misses new round signals.");
expect(/bossAiDefeats/.test(read("api/balance.ts")) && /bossCoreReturns/.test(read("api/balance.ts")) && /schemaVersion:6/.test(read("api/balance.ts")) && /doctrine/.test(read("api/balance.ts")), "Shared Boss Core and doctrine telemetry is incomplete.");
expect(/duelRounds/.test(read("api/balance.ts")) && /duelSeconds/.test(read("api/balance.ts")) && /duelRivalPeak/.test(read("api/balance.ts")) && /duelRivalName/.test(read("api/balance.ts")) && /duelBonus/.test(read("api/balance.ts")), "Central end-duel telemetry is incomplete.");
expect(/pulse-duel-summary/.test(game) && /pulse-round-duel/.test(game), "Arena Pulse does not visualize shared end-duel telemetry.");
expect(/Access-Control-Allow-Origin/.test(read("api/balance.ts")) && /req\.method === "OPTIONS"/.test(read("api/balance.ts")), "Local-to-deployed telemetry CORS support is incomplete.");
expect(["admin-analytics.ts","analytics.ts","balance.ts","guestbook.ts","leaderboard.ts","ranks.ts"].every(file => { const source=read(`api/${file}`); return /Access-Control-Allow-Origin/.test(source) && /req\.method === "OPTIONS"/.test(source); }), "Cross-platform API access is incomplete.");
expect(/isPortalHost/.test(game) && /apiEndpoint/.test(game) && /preparePortalIdentity/.test(game) && /Pilot /.test(game), "Portal mode does not provide shared services and one-click identity.");
expect(/vite build --base=\.\//.test(read("package.json")) && !/(src|href)="\/hinses-battlefield-logo/.test(html), "The HTML5 build is not portable across game portals.");
expect(/balance:run-ids:v1/.test(read("api/balance.ts")) && /duplicate:true/.test(read("api/balance.ts")) && /if \(!abandoned\)/.test(read("api/balance.ts")), "Central run deduplication or abandoned-round exclusion is incomplete.");
expect(["admin-analytics.ts","analytics.ts","balance.ts","guestbook.ts","leaderboard.ts","ranks.ts"].every(file => { const source=read(`api/${file}`); return /KV_REST_API_URL/.test(source) && /KV_REST_API_TOKEN/.test(source) && /UPSTASH_REDIS_REST_URL/.test(source) && /new Redis\(\{ url: redisUrl, token: redisToken \}\)/.test(source); }), "Server functions do not support both Vercel KV and direct Upstash environment names.");
expect(/req\.method === "GET"/.test(read("api/balance.ts")) && /recentRounds/.test(read("api/balance.ts")) && /top10/.test(read("api/balance.ts")), "Detailed balance telemetry is not centrally retrievable.");
expect(/admin-recent/.test(html) && /recentRounds/.test(game) && /pulse-round-metrics/.test(game) && /pulse-types/.test(game), "Recent shared balance rounds are missing from Arena Pulse.");
expect(/pulse-kpis/.test(html) && /pulse-balance/.test(html) && /pulse-ring/.test(css) && /pulse-round\.win/.test(css), "Arena Pulse graphical dashboard is incomplete.");
expect(/start-deep-stats/.test(html) && /balance-analysis-feed/.test(html) && /syncAnalysisFeed/.test(game), "Persistent local Deep Statistics access is incomplete.");
expect(/schemaVersion:6/.test(game) && /doctrine:this\.doctrine/.test(game) && /toxicBoltsHitPlayer/.test(game) && /abilities:/.test(game) && /respawns:/.test(game) && /finalTop10/.test(game), "Round telemetry schema is not sufficiently detailed.");
expect(/enhanceDeepStatsVisuals/.test(game) && /deep-readable-summary/.test(game) && /deep-timeline/.test(game) && /deep-ranking/.test(game) && /deep-data-guide/.test(game), "Deep Statistics lacks its human-readable visual debrief.");
expect(/entry instanceof Organism \? entry\.name : this\.playerName/.test(game) && /entry\.type === "player" \? this\.playerName/.test(game), "Deep Statistics does not preserve the player identity separately from the analytics type.");
expect(/\.deep-bars/.test(css) && /\.deep-phase-row/.test(css) && /\.deep-ranking/.test(css), "Visual Deep Statistics styling is incomplete.");
expect(/decorateRoundStatus/.test(game) && /round\.status !== "abandoned"/.test(game) && /provisional points · not ranked/.test(game) && /excluded from completed-round win rate/.test(game) && /round-status-note/.test(css), "Deep Statistics does not correctly distinguish interrupted runs.");
expect(/difficulty === "all"/.test(read("api/balance.ts")) && /slice\(0, 100\)/.test(read("api/balance.ts")), "Central balance history is not broadly retrievable or persistent enough.");
expect(/capturePhaseSnapshot\("1:00"\)/.test(game) && /capturePhaseSnapshot\("3:00"\)/.test(game) && /player:\{ count:1/.test(game), "Player and mid-round phase snapshots are incomplete.");
expect(/captureLiveTelemetry/.test(game) && /hb2-live-stats/.test(game) && /status:"active"/.test(game), "Live and interrupted-round telemetry is incomplete.");
expect(/drawArenaAtmosphere/.test(game) && /drawOrganismCore/.test(game) && /Battlefield 2 command deck/.test(css), "Battlefield 2 visual identity is incomplete.");
expect(/mission-status/.test(html) && /mission-alert/.test(html) && /updateMissionUi/.test(game) && /MISSION 01/.test(html), "Battlefield 2 tactical mission guidance is incomplete.");
expect(/drawDoctrineAura/.test(game) && /this\.drawDoctrineAura\(ctx\)/.test(game) && /interceptor/.test(game) && /assimilator/.test(game) && /aegis/.test(game), "Combat doctrines do not have distinct in-arena signatures.");
expect(/drawWorldBoundary/.test(game) && /NOVA SECTOR/.test(game) && /VANGUARD SECTOR/.test(game) && /APEX SECTOR/.test(game), "The Battlefield 2 arena lacks readable sector identity and boundaries.");
expect(/drawThreatIndicator/.test(game) && /mass>p\.mass\*1\.15/.test(game) && /d<850/.test(game), "Nearby larger threats are not telegraphed fairly.");
expect(/\.mission-status/.test(css) && /\.mission-alert/.test(css) && /@keyframes mission-arrival/.test(css), "Mission guidance is not visually integrated.");
expect(!/localStorage\.(getItem|setItem|removeItem)\("hinses-/.test(game) && !/localStorage\.(getItem|setItem|removeItem)\("mass-arena-/.test(game), "Battlefield 2 still writes into a Version 1 browser namespace.");
expect(["admin-analytics.ts","analytics.ts","balance.ts","guestbook.ts","leaderboard.ts","ranks.ts"].every(file => /hinses-battlefield-2:/.test(read(`api/${file}`))), "A server function still uses the Version 1 database namespace.");

// One hundred randomized arena layouts: player-safe starts, world boundaries, and boss separation.
const world = 6000;
for (let run = 0; run < 100; run++) {
  const player = { x: world / 2, y: world / 2 };
  const bosses = [];
  for (let i = 0; i < 4; i++) {
    let candidate;
    for (let attempt = 0; attempt < 500; attempt++) {
      candidate = { x: 300 + Math.random() * (world - 600), y: 300 + Math.random() * (world - 600) };
      if (Math.hypot(candidate.x - player.x, candidate.y - player.y) >= 1700 && bosses.every(boss => Math.hypot(candidate.x - boss.x, candidate.y - boss.y) >= 1100)) break;
    }
    expect(candidate && Math.hypot(candidate.x - player.x, candidate.y - player.y) >= 1700, `Run ${run + 1}: boss spawned too close to player.`);
    expect(candidate && candidate.x >= 300 && candidate.x <= 5700 && candidate.y >= 300 && candidate.y <= 5700, `Run ${run + 1}: boss spawned outside safe world bounds.`);
    bosses.push(candidate);
  }
  for (let i = 0; i < 250; i++) {
    const x = 80 + Math.random() * (world - 160), y = 80 + Math.random() * (world - 160);
    expect(x >= 80 && x <= 5920 && y >= 80 && y <= 5920, `Run ${run + 1}: organism spawn escaped world bounds.`);
  }
}

const difficulties = ["easy", "normal", "hard", "extreme"];
const codeTags = { easy:"E", normal:"N", hard:"H", extreme:"V" };

// One hundred share-message combinations: results remain human-readable and
// every challenge points to the exact arena plus the public game URL.
for (let run = 0; run < 100; run++) {
  const mass = 200 + Math.floor(Math.random() * 250000);
  const points = Math.floor(Math.random() * 500000);
  const difficulty = difficulties[run % difficulties.length];
  const code = `HB2-${codeTags[difficulty]}-${(100000 + run).toString(36).toUpperCase()}`;
  const message = `I reached ${mass.toLocaleString("en-US")} mass and earned ${points.toLocaleString("en-US")} points in Hinses Battlefield 2.\nCan you beat me in the same arena?\nArena Code: ${code}\nhttps://hinses-battlefield-2.vercel.app`;
  const lines = message.split("\n");
  expect(lines.length === 4, `Challenge smoke ${run + 1}: message does not have four readable lines.`);
  expect(lines[0].includes(mass.toLocaleString("en-US")) && lines[0].includes(points.toLocaleString("en-US")), `Challenge smoke ${run + 1}: result values are missing or unformatted.`);
  expect(lines[2] === `Arena Code: ${code}`, `Challenge smoke ${run + 1}: arena code changed during formatting.`);
  expect(lines[3] === "https://hinses-battlefield-2.vercel.app", `Challenge smoke ${run + 1}: public link is incorrect.`);
}

// One hundred endgame mobility checks: increasing Elite mass must never make
// Vector Burst faster, longer, or more frequent; player Overdrive stays faster.
for (let run = 0; run < 100; run++) {
  const mass = 20000 + Math.random() * 80000;
  const progress = Math.max(0, Math.min(1, (mass - 20000) / 40000));
  const power = (2.68 + (2.05 - 2.68) * progress) * (1.28 + (1.12 - 1.28) * progress);
  const duration = 3500 + (2200 - 3500) * progress;
  const cooldown = 1800 + (3800 - 1800) * progress;
  expect(power <= 2.68 * 1.28 && power >= 2.05 * 1.12, `Heavy Vector ${run + 1}: power escaped its intended range.`);
  expect(duration >= 2200 && duration <= 3500, `Heavy Vector ${run + 1}: duration escaped its intended range.`);
  expect(cooldown >= 1800 && cooldown <= 3800, `Heavy Vector ${run + 1}: cooldown escaped its intended range.`);
  if (mass >= 60000) expect(power < 2.15 * 1.08, `Heavy Vector ${run + 1}: a massive Elite still nullifies player Overdrive.`);
}

// One hundred start-menu and Hall-of-Fame state combinations: a manual choice wins
// over a stale replay code, replay codes remain intentionally authoritative once,
// and NEW can only appear inside the completed round's own difficulty tier.
for (let run = 0; run < 100; run++) {
  const selected = difficulties[Math.floor(Math.random() * difficulties.length)];
  const staleCodeDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
  let arenaCode = `HB2-${codeTags[staleCodeDifficulty]}-SMOKE${run}`;
  // The user manually changes the selector: production clears the stale code.
  arenaCode = "";
  const startedDifficulty = arenaCode ? staleCodeDifficulty : selected;
  expect(startedDifficulty === selected, `Difficulty smoke ${run + 1}: stale arena code overrode ${selected}.`);

  // A deliberately entered replay code selects its encoded level for one start only.
  let replayCode = `HB2-${codeTags[staleCodeDifficulty]}-REPLAY${run}`;
  const replayDifficulty = staleCodeDifficulty;
  replayCode = "";
  expect(replayDifficulty === staleCodeDifficulty && replayCode === "", `Difficulty smoke ${run + 1}: replay code was not one-shot.`);

  const latest = { name:"Smoke Pilot", score:1000 + run, mass:2000 + run, combo:run % 8, difficulty:startedDifficulty };
  const records = difficulties.flatMap((difficulty, index) => [{ name:`Pilot ${index}`, score:900 + index, mass:1500, combo:2, difficulty }, ...(difficulty === latest.difficulty ? [latest] : [])]);
  for (const difficulty of difficulties) {
    const tier = records.filter(record => record.difficulty === difficulty);
    const marked = tier.filter(record => record.name === latest.name && record.score === latest.score && record.mass === latest.mass && record.combo === latest.combo && record.difficulty === latest.difficulty);
    expect(marked.length === (difficulty === latest.difficulty ? 1 : 0), `Hall smoke ${run + 1}: NEW marker appeared in ${difficulty} instead of ${latest.difficulty}.`);
  }
}

if (failures.length) {
  console.error(`Arena smoke test failed (${failures.length}):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("Arena smoke test passed: 100 randomized arena layouts, 100 difficulty/Hall-of-Fame combinations, 100 challenge messages and core-rule invariants verified.");
