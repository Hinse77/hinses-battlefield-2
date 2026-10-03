type Metric = { count:number; mass:number; maxMass?:number; averageMass?:number };
type ArenaEntry = { type:string; name:string; mass:number; boss?:boolean };
type Round = {
  status?:"active"|"completed"|"abandoned"; victory:boolean; elapsed:number; mass:number; points:number;
  playerRank:number; targetMass:number; absorbed:number; combo:number; bosses:number; doctrine?:string;
  difficulty?:string; deathCause?:string; poison?:number; chaosDamage?:number; chaosAiDamage?:number;
  chaosDetonations?:number; duelSeconds?:number; duelRivalPeak?:number; duelRivalName?:string; duelBonus?:number;
  toxicBoltsFired?:number; toxicBoltsHitPlayer?:number; defeatedBosses?:string[];
  defeats?:Record<string,number>; abilities?:Record<string,number>; respawns?:Record<string,number>;
  phases?:Record<string,Record<string,Metric>>; top10?:ArenaEntry[];
};

const doctrineLabels:Record<string,string> = { interceptor:"Interceptor", assimilator:"Assimilator", aegis:"Aegis" };
const difficultyLabels:Record<string,string> = { easy:"Cadet", normal:"Vanguard", hard:"Veteran", extreme:"Apex" };
const typeLabels:Record<string,string> = { player:"Player", hunter:"Hunter", elite:"Elite", opportunist:"Opportunist", chaotic:"Chaotic", coward:"Coward", grazer:"Toxic Crazer", boss:"Boss" };
const typeClass = (value:string) => value.toLowerCase().replace(/[^a-z0-9-]/g, "");
const format = (value:number) => Math.round(value || 0).toLocaleString("en-US");
const escapeHtml = (value:unknown) => String(value ?? "").replace(/[&<>'"]/g, character => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[character]!));
const clamp = (value:number,min=0,max=100) => Math.max(min,Math.min(max,value));

function readRounds() {
  let history:Round[]=[];
  let live:Round|null=null;
  try { const saved=JSON.parse(localStorage.getItem("hb2-deep-stats") || "[]"); history=Array.isArray(saved) ? saved : []; } catch { history=[]; }
  try { live=JSON.parse(localStorage.getItem("hb2-live-stats") || "null"); } catch { live=null; }
  return { history, current:history[0] || live };
}

function gradeFor(round:Round) {
  const progress=clamp(round.mass/Math.max(1,round.targetMass),0,1.25);
  const pace=round.victory ? clamp((600-round.elapsed)/600,0,1) : 0;
  const score=clamp(progress*48+(round.victory?14:0)+(round.playerRank===1?10:0)+Math.min(12,Math.max(0,round.combo-1)*1.5)+Math.min(10,round.bosses*3)+pace*10);
  if (score>=92) return { mark:"S", label:"Apex command", score };
  if (score>=78) return { mark:"A", label:"Elite operation", score };
  if (score>=63) return { mark:"B", label:"Tactical success", score };
  if (score>=45) return { mark:"C", label:"Combat ready", score };
  return { mark:"D", label:"Recalibrate", score };
}

function tacticalRead(round:Round, averagePoints:number) {
  const progress=Math.round(round.mass/Math.max(1,round.targetMass)*100);
  if (round.victory && round.playerRank===1 && round.combo>=6) return "Arena control was decisive: strong growth, a clean finish and sustained combo pressure.";
  if (round.playerRank===1 && !round.victory) return "You controlled the field by mass. A faster route to the target would convert control into victory.";
  if (round.points>=averagePoints && round.combo>=4) return "This run beat your normal scoring pace. Combo discipline was the main performance driver.";
  if (round.bosses>0) return `Boss engagement paid off, but target progress stopped at ${progress}%. Protect the mass gained after major fights.`;
  return `You reached ${progress}% of the objective. Build an early food route, then switch to safe mid-sized prey before the arena escalates.`;
}

function coachTip(round:Round) {
  if ((round.poison || 0)>round.mass*.08) return "Command advice: give Toxic Crazers more space — poison erased a meaningful part of your growth.";
  if (round.playerRank>3) return "Command advice: avoid trading into the leaders early; farm particles and isolated prey until you enter the top three.";
  if (round.combo<4) return "Command advice: plan two or three nearby absorptions before committing. Short chains create safer score acceleration.";
  if (round.duelSeconds && round.duelSeconds>20) return "Command advice: the end duel lasted long enough to matter. Save Overdrive for the rival's approach, not the first contact.";
  return "Command advice: your fundamentals are sound. The next gain is pace — shorten the quiet gaps between safe absorptions.";
}

function bar(label:string,value:string,width:number,kind="") {
  return `<div class="deep-bar ${kind}"><span><b>${escapeHtml(label)}</b><i>${escapeHtml(value)}</i></span><i class="deep-bar-track"><i style="width:${clamp(width)}%"></i></i></div>`;
}

export class PremiumDebrief {
  private gameOver=document.querySelector<HTMLElement>("#game-over");
  constructor() {
    if (this.gameOver) new MutationObserver(() => { if (!this.gameOver?.hidden) requestAnimationFrame(() => this.renderDebrief()); }).observe(this.gameOver,{attributes:true,attributeFilter:["hidden"]});
    for (const selector of ["#deep-stats","#start-deep-stats"]) document.querySelector(selector)?.addEventListener("click",()=>requestAnimationFrame(()=>this.renderDeepStats()));
  }

  private renderDebrief() {
    const {current}=readRounds(), host=document.querySelector<HTMLElement>("#debrief-grade");
    if (!current || !host) return;
    const grade=gradeFor(current), doctrine=doctrineLabels[current.doctrine || ""] || "Independent", threat=difficultyLabels[current.difficulty || ""] || "Arena";
    const pace=current.victory ? `${Math.max(0,600-current.elapsed)}s reserve` : `${Math.floor(current.elapsed/60)}:${String(current.elapsed%60).padStart(2,"0")} survived`;
    host.innerHTML=`<div class="debrief-grade-mark"><b>${grade.mark}</b><i style="--grade:${grade.score}%"></i></div><div class="debrief-grade-copy"><small>MISSION ASSESSMENT · ${escapeHtml(threat)}</small><strong>${grade.label}</strong><span>${escapeHtml(doctrine)} doctrine · ${escapeHtml(pace)} · arena rank #${current.playerRank}</span></div><div class="debrief-ribbons"><span>×${current.combo}<small>COMBO</small></span><span>${current.bosses}<small>BOSSES</small></span><span>${current.absorbed}<small>ABSORBED</small></span></div>`;
    host.hidden=false;
  }

  private renderDeepStats() {
    const content=document.querySelector<HTMLElement>("#deep-stats-content");
    if (!content) return;
    const {history,current}=readRounds();
    if (!current) return;
    const completed=history.filter(round=>round.status!=="abandoned"), wins=completed.filter(round=>round.victory).length;
    const average=(key:keyof Round, source=completed) => Math.round(source.reduce((sum,round)=>sum+Number(round[key] || 0),0)/Math.max(1,source.length));
    const grade=gradeFor(current), avgPoints=average("points"), currentDoctrine=current.doctrine || "assimilator", doctrineRounds=completed.filter(round=>(round.doctrine || "assimilator")===currentDoctrine);
    const fastest=completed.filter(round=>round.victory).reduce((best,round)=>Math.min(best,round.elapsed),Infinity);
    const allDefeats:Record<string,number>={}, ends:Record<string,number>={};
    for (const round of completed) { for (const [type,count] of Object.entries(round.defeats || {})) allDefeats[type]=(allDefeats[type]||0)+Number(count||0); const cause=round.deathCause || "Arena"; ends[cause]=(ends[cause]||0)+1; }
    const careerPrey=Object.entries(allDefeats).sort((a,b)=>b[1]-a[1])[0], commonEnd=Object.entries(ends).sort((a,b)=>b[1]-a[1])[0];
    const currentPrey=Object.entries(current.defeats || {}).sort((a,b)=>b[1]-a[1])[0];
    const maxTop=Math.max(1,...(current.top10 || []).map(entry=>entry.mass));
    const ranking=(current.top10 || []).map((entry,index)=>`<li class="type-${typeClass(entry.type)}"><b>#${index+1}</b><span><strong>${escapeHtml(entry.name || typeLabels[entry.type] || entry.type)}</strong><small>${escapeHtml(typeLabels[entry.type] || entry.type)}</small></span><i class="deep-rank-track"><i style="width:${clamp(entry.mass/maxTop*100)}%"></i></i><em>${format(entry.mass)}</em></li>`).join("") || `<li><span><strong>Available after the next completed round</strong></span></li>`;
    const phaseLabels=["1:00","2:00","3:00","4:00","6:00","end"];
    const timeline=phaseLabels.filter(label=>current.phases?.[label]).map(label=>{
      const values=Object.entries(current.phases![label]).sort((a,b)=>(b[1].maxMass||b[1].mass)-(a[1].maxMass||a[1].mass)).slice(0,3), max=Math.max(1,...values.map(([,value])=>value.maxMass||value.mass));
      const rows=values.map(([type,value])=>`<div class="deep-phase-row type-${typeClass(type)}"><span>${escapeHtml(typeLabels[type] || type)}</span><i class="deep-phase-track"><i style="width:${clamp((value.maxMass||value.mass)/max*100)}%"></i></i><small>${format(value.maxMass||value.mass)}</small></div>`).join("");
      return `<div class="deep-phase"><b>${label}</b>${rows}</div>`;
    }).join("") || `<p>Phase tracking begins with the next completed round.</p>`;
    const abilityRows=Object.entries(current.abilities || {}).sort((a,b)=>b[1]-a[1]).map(([name,count])=>`${escapeHtml(name)} ×${count}`).join(" · ") || "No ability activations recorded";
    const respawnRows=Object.entries(current.respawns || {}).sort((a,b)=>b[1]-a[1]).map(([name,count])=>`${escapeHtml(name)} ×${count}`).join(" · ") || "No respawns recorded";
    const duel=current.duelSeconds ? `${current.duelSeconds}s against ${escapeHtml(current.duelRivalName || "the arena leader")} · rival peak ${format(current.duelRivalPeak || 0)} · +${format(current.duelBonus || 0)} points` : "No qualifying end duel";
    content.innerHTML=`
      <section class="deep-hero premium"><div class="deep-grade">${grade.mark}</div><div><b>${format(current.points)}</b><span>latest rank points</span><small>${escapeHtml(doctrineLabels[currentDoctrine] || currentDoctrine)} · ${escapeHtml(difficultyLabels[current.difficulty || ""] || current.difficulty || "Arena")} · rank #${current.playerRank}</small></div></section>
      <section class="deep-readable-summary"><h3>Command analysis</h3><p class="deep-verdict">${escapeHtml(tacticalRead(current,avgPoints))}</p><p class="deep-coach">${escapeHtml(coachTip(current))}</p><div class="deep-bars">${bar("Objective",`${Math.round(current.mass/Math.max(1,current.targetMass)*100)}%`,current.mass/current.targetMass*100)}${bar("Score vs career",`${format(current.points)} / ${format(avgPoints)}`,current.points/Math.max(1,avgPoints)*62,"score")}${bar("Combo chain",`×${current.combo}`,current.combo/12*100,"combo")}${bar("Time used",`${current.elapsed}s`,current.elapsed/600*100,"time")}</div></section>
      <section class="deep-grid"><div><b>${completed.length}</b><span>completed rounds</span></div><div><b>${Math.round(wins/Math.max(1,completed.length)*100)}%</b><span>win rate</span></div><div><b>${format(average("mass"))}</b><span>average mass</span></div><div><b>${format(avgPoints)}</b><span>average points</span></div><div><b>×${Math.max(1,...completed.map(round=>round.combo||1))}</b><span>best combo</span></div><div><b>${fastest===Infinity?"—":`${fastest}s`}</b><span>fastest victory</span></div></section>
      <section class="deep-insight"><h3>Doctrine performance</h3><p><b>${escapeHtml(doctrineLabels[currentDoctrine] || currentDoctrine)}:</b> ${doctrineRounds.length} rounds · ${format(average("points",doctrineRounds))} average points · ${format(average("mass",doctrineRounds))} average mass</p><p><b>Current operation:</b> ${current.victory?"Victory":"Run ended"} · ${format(current.mass)} mass · ${current.absorbed} absorptions · ${currentPrey?`${escapeHtml(typeLabels[currentPrey[0]]||currentPrey[0])} ×${currentPrey[1]}`:"no prey"}</p></section>
      <section class="deep-insight"><h3>Arena progression</h3><p class="deep-section-guide">The strongest three organism types at each recorded phase. Longer bars mean a larger individual threat.</p><div class="deep-timeline">${timeline}</div></section>
      <section class="deep-insight"><h3>Final arena top 10</h3><p class="deep-section-guide">Final order by mass. The bar shows the distance to the arena leader.</p><ol class="deep-ranking">${ranking}</ol></section>
      <section class="deep-insight"><h3>Combat ledger</h3><p><b>Damage taken:</b> ${format(current.poison || 0)} poison · ${format(current.chaosDamage || 0)} chaotic shockwave · ${current.chaosDetonations || 0} detonations</p><p><b>Boss interaction:</b> ${current.bosses} defeated · ${current.toxicBoltsHitPlayer || 0}/${current.toxicBoltsFired || 0} Toxic Master bolts hit · ${(current.defeatedBosses || []).map(escapeHtml).join(" · ") || "no boss defeated"}</p><p><b>End duel:</b> ${duel}</p></section>
      <section class="deep-insight"><h3>Career intelligence</h3><p><b>Most absorbed:</b> ${careerPrey?`${escapeHtml(typeLabels[careerPrey[0]]||careerPrey[0])} ×${careerPrey[1]}`:"no data"} · <b>Most common ending:</b> ${commonEnd?`${escapeHtml(commonEnd[0])} ×${commonEnd[1]}`:"no data"}</p><p><b>Current abilities:</b> ${abilityRows}</p><p><b>Current respawns:</b> ${respawnRows}</p></section>
      <details class="deep-data-guide"><summary>How to read these statistics</summary><p><b>Rank points</b> combine target progress, pace, victory, combos, boss fights and real end duels. <b>Arena progression</b> is the balancing view inherited from Battlefield 1: it shows which species actually survive and grow through each phase. Exact combat telemetry remains stored for future balancing.</p></details>`;
  }
}
