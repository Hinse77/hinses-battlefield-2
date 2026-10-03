import "./style.css";
import { Game } from "./game/Game";
import { CelebrationFireworks } from "./ui/CelebrationFireworks";
import { PremiumDebrief } from "./ui/PremiumDebrief";

new Game(document.querySelector<HTMLCanvasElement>("#game")!);
new CelebrationFireworks(document.querySelector<HTMLElement>("#fireworks")!);
new PremiumDebrief();

// Local-only visual fixture: keeps premium result screens testable without weakening the live game.
if (["localhost","127.0.0.1"].includes(location.hostname) && new URLSearchParams(location.search).has("debrief-preview")) {
  const preview = { schemaVersion:6,runId:"visual-preview",status:"completed",at:new Date().toISOString(),difficulty:"extreme",doctrine:"assimilator",arenaCode:"HB2-V-PREVIEW",victory:true,elapsed:247,mass:42840,points:28640,playerRank:1,targetMass:40000,absorbed:38,combo:8,bosses:2,defeatedBosses:["Titan Vex","Toxic Master"],bossAiDefeats:{},bossCoreReturns:{},poison:620,toxicBoltsFired:7,toxicBoltsHitPlayer:2,chaosDamage:940,chaosAiDamage:3100,chaosDetonations:4,duelSeconds:29,duelRivalPeak:39500,duelRivalName:"Elite Vega",duelBonus:1100,deathCause:"Victory",phases:{"1:00":{player:{count:1,mass:3400,maxMass:3400},hunter:{count:52,mass:82000,maxMass:4200},elite:{count:30,mass:47000,maxMass:3500}},"3:00":{player:{count:1,mass:24600,maxMass:24600},hunter:{count:48,mass:192000,maxMass:12200},elite:{count:34,mass:151000,maxMass:14800}},end:{player:{count:1,mass:42840,maxMass:42840},elite:{count:31,mass:176000,maxMass:39500},hunter:{count:45,mass:205000,maxMass:22100}}},defeats:{hunter:9,elite:7,opportunist:8,chaotic:6,coward:5,grazer:3},peaks:{hunter:22100,elite:39500,opportunist:9400,chaotic:12800,coward:6100,grazer:7800},top10:[{type:"player",name:"Commander Hinse",mass:42840,boss:false},{type:"elite",name:"Elite Vega",mass:39500,boss:false},{type:"hunter",name:"Hunter Luna",mass:22100,boss:false},{type:"chaotic",name:"Chaotic Pip",mass:12800,boss:false},{type:"opportunist",name:"Opportunist Cleo",mass:9400,boss:false},{type:"grazer",name:"Toxic Crazer Ivy",mass:7800,boss:false},{type:"coward",name:"Coward Sora",mass:6100,boss:false}],abilities:{bloodrush:14,vectorBurst:9,ambush:6,chaosLeap:5},respawns:{hunter:18,elite:11,opportunist:8,chaotic:7,coward:6,grazer:5} };
  localStorage.setItem("hb2-deep-stats",JSON.stringify([preview]));
  document.querySelector<HTMLElement>("#start-screen")!.hidden=true;
  document.querySelector<HTMLElement>("#end-kicker")!.textContent="ARENA MASTER";
  document.querySelector<HTMLElement>("#end-title")!.textContent="You conquered the arena";
  document.querySelector<HTMLElement>("#final-mass")!.textContent="42,840 mass · Rank points 28,640 · #1";
  document.querySelector<HTMLElement>("#round-summary")!.innerHTML='<div><b>42,840</b><span>mass reached</span></div><div><b>38</b><span>organisms absorbed</span></div><div><b>12,400</b><span>best absorption</span></div><div><b>28,640</b><span>rank points</span></div><section class="summary-strip score-breakdown"><h3>Score breakdown</h3><div><span class="score-chip target"><i>◉</i><b>+12,000</b><small>Target</small></span><span class="score-chip fast"><i>↯</i><b>+3,840</b><small>Fast</small></span><span class="score-chip victory"><i>★</i><b>+3,000</b><small>Victory</small></span><span class="score-chip combo"><i>×</i><b>+2,100</b><small>Combo</small></span><span class="score-chip boss"><i>♛</i><b>+5,000</b><small>Boss</small></span><span class="score-chip duel"><i>⚔</i><b>+1,100</b><small>End duel</small></span></div></section><p class="service-progress"><b>✦ Orbital Lieutenant</b><span>+44,800 service points</span></p>';
  document.querySelector<HTMLElement>("#fireworks")!.hidden=false;
  document.querySelector<HTMLElement>("#game-over")!.hidden=false;
  if (new URLSearchParams(location.search).has("deep-stats")) requestAnimationFrame(()=>document.querySelector<HTMLButtonElement>("#deep-stats")?.click());
}

const settingsToggle = document.querySelector<HTMLButtonElement>("#settings-toggle")!;
const pauseButton = document.querySelector<HTMLButtonElement>("#pause-round")!;
settingsToggle.addEventListener("click", () => requestAnimationFrame(() => pauseButton.click()));
