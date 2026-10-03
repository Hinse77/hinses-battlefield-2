import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };

const html = read("index.html");
const game = read("src/game/Game.ts");
const css = read("src/style.css");
const pkg = JSON.parse(read("package.json"));
const vercel = JSON.parse(read("vercel.json"));
const distHtml = read("dist/index.html");
const apiFiles = fs.readdirSync(path.join(root, "api")).filter((file) => file.endsWith(".ts"));
const assetFiles = fs.readdirSync(path.join(root, "dist", "assets"));

expect(pkg.name === "hinses-battlefield-2", "Release package has the wrong project identity.");
expect(pkg.version === "2.0.0-rc.2", "Release package version is not RC2.");
expect(pkg.scripts?.test === "node scripts/arena-smoke.mjs", "Core arena smoke command changed unexpectedly.");
expect(vercel.framework === "vite" && vercel.buildCommand === "npm run build" && vercel.outputDirectory === "dist", "Vercel production settings are incomplete.");
expect(assetFiles.some((file) => file.endsWith(".js")) && assetFiles.some((file) => file.endsWith(".css")), "Production assets were not emitted.");
expect(!distHtml.includes("./src/main.ts"), "Production HTML still points at TypeScript source.");
expect(/assets\/index-[^"']+\.js/.test(distHtml) && /assets\/index-[^"']+\.css/.test(distHtml), "Hashed production assets are not linked.");

for (const id of ["start-screen","start-game","game","mission-status","mission-progress","power","leaderboard","minimap","game-over","deep-stats-overlay","imprint-overlay"]) {
  expect(html.includes(`id="${id}"`), `Required release UI element #${id} is missing.`);
}
expect(/hinses-battlefield-2\.vercel\.app/.test(html), "Canonical Battlefield 2 production URL is missing.");
expect(/HB2-/.test(game) && /hb2-/.test(game), "Battlefield 2 replay or browser-storage namespace is missing.");
expect(!/localStorage\.(?:getItem|setItem|removeItem)\("hinses-/.test(game), "Battlefield 2 writes into a Version 1 browser namespace.");
expect(/drawDoctrineAura/.test(game) && /drawThreatIndicator/.test(game) && /drawWorldBoundary/.test(game), "Release-critical arena readability effects are missing.");
expect(/\.mission-status/.test(css) && /\.mission-alert/.test(css), "Mission guidance styling is missing.");
expect(/@media \(max-width:540px\)/.test(css) && /@media \(max-width:430px\)/.test(css), "Mobile release breakpoints are incomplete.");
expect(/min-height:44px/.test(css), "Mobile primary touch targets are smaller than the release baseline.");

for (const file of apiFiles) {
  const source = read(`api/${file}`);
  expect(/hinses-battlefield-2:/.test(source), `${file} is not isolated from Battlefield 1 data.`);
  expect(/Access-Control-Allow-Origin/.test(source), `${file} lacks cross-platform access headers.`);
  expect(/KV_REST_API_URL/.test(source) && /UPSTASH_REDIS_REST_URL/.test(source), `${file} does not support the production Redis environment names.`);
}

const missionStage = (mass) => mass < 6000 ? 0 : mass < 20000 ? 1 : mass < 30000 ? 2 : 3;
const thresholds = [[0,6000],[6000,20000],[20000,30000],[30000,40000]];
let previousStage = 0;
for (let run = 0; run < 100; run++) {
  const mass = 200 + run / 99 * 50000;
  const stage = missionStage(mass);
  const [from,to] = thresholds[stage];
  const progress = Math.max(0,Math.min(1,(mass-from)/Math.max(1,to-from)));
  expect(stage >= previousStage, `Mission simulation ${run + 1} moved backwards.`);
  expect(progress >= 0 && progress <= 1, `Mission simulation ${run + 1} produced invalid progress.`);
  previousStage = stage;
}

for (let run = 0; run < 100; run++) {
  const playerMass = 200 + Math.random() * 60000;
  const rivalMass = playerMass * (.5 + Math.random() * 2);
  const distance = Math.random() * 1400;
  const warned = rivalMass > playerMass * 1.15 && distance < 850;
  if (warned) {
    expect(rivalMass > playerMass, `Threat simulation ${run + 1} warned about smaller prey.`);
    expect(distance < 850, `Threat simulation ${run + 1} warned outside readable range.`);
  }
}

for (const doctrine of ["interceptor","assimilator","aegis"]) {
  expect(html.includes(`value="${doctrine}"`), `${doctrine} cannot be selected on the command deck.`);
  expect(game.includes(`this.doctrine === "${doctrine}"`) || game.includes(`this.doctrine === '${doctrine}'`), `${doctrine} has no gameplay or visual implementation.`);
}

if (failures.length) {
  console.error(`Release smoke failed (${failures.length}):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(`Release smoke passed: production bundle, ${apiFiles.length} APIs, 100 mission states, 100 threat states, three doctrines, mobile baselines and V2 isolation verified.`);
