"use strict";
/* Otto lernt – Engine v2.1
   Tagesziel (bleibt offen bis erreicht) · Fehlerjäger (exakte Wiederholung von Fehlern) · "Was war los?" (Selbsterklärung)
   · Beherrschung pro Aufgabentyp · Fast Math mit Ziel statt Uhr, Strategie-Brücke, Pausen-Erkennung. */

const VERSION="2.1.0";
const STORE="otto-lernen-v1";
const CAP_MIN=15;                 // after 15 min the session ends kindly; the goal stays open for tomorrow
const GOAL={fm:20,clean:6,fjMax:5};
const FM_MAX_SEC=240,FAST_S=4,REVIEW_DAYS=[3,7,14,30,60],FJ_DAYS=[1,3];
const FORM={url:"https://docs.google.com/forms/d/e/1FAIpQLSeqKkP2F6H5eCPnpm5iTYPkTAdZqZsaoRN_0P-l_q0coZIP2w/formResponse",
  zeit:"entry.2074423634",sitzung:"entry.1652398039",fertigkeit:"entry.276277759",aufgabe:"entry.29870072",antwort:"entry.1407786930",richtig:"entry.1553877116",sekunden:"entry.2029597351",fehlertyp:"entry.1202747942"};
const TRACKS={M:{B:ORDER_M},D:ORDER_D};
const ALL_IDS=[...ORDER_M,...Object.values(ORDER_D).flat()];
const SUBJ_NAME={M:"Mathe",D:"Deutsch"};
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
const dayStart=(plus)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+plus);return d.getTime()};

/* ---------------- "Was war los?" – reasons in Otto's voice ---------------- */
const REASON={
  zaehlen:"Ich habe gezählt und mich um 1 vertan.",reihe_daneben:"Ich bin in der Einmaleins-Reihe verrutscht.",
  mal_statt_geteilt:"Ich habe mal gerechnet statt geteilt.",minus_statt_geteilt:"Ich habe minus gerechnet statt geteilt.",
  teil_statt_ganzes:"Ich habe unten nicht alle Teile gezählt.",gegenteil:"Ich habe den anderen Teil gezählt.",vertauscht:"Ich habe oben und unten vertauscht.",
  nur_ein_teil:"Ich habe nur geteilt und das Malnehmen vergessen.",falsch_geteilt:"Ich habe in der falschen Reihenfolge gerechnet.",
  addiert_statt_mal:"Ich habe plus gerechnet statt mal.",nur_oben:"Ich habe nur oben mal genommen.",nur_unten:"Ich habe nur unten mal genommen.",
  rand_vergessen:"Ich habe 1 oder die Zahl selbst vergessen.",kein_teiler:"Ich habe eine Zahl genommen, die nicht ohne Rest geht.",paar_fehlt:"Mir fehlt noch ein Teiler-Paar.",
  vielfache_falsch:"Ich habe nicht die Reihe aufgeschrieben.",nicht_groesster:"Ich habe nicht den größten gemeinsamen Teiler gefunden.",
  nicht_vollstaendig:"Ich habe nicht fertig gekürzt.",ungleich_gekuerzt:"Ich habe oben und unten durch verschiedene Zahlen geteilt.",
  groesserer_nenner:"Ich dachte, größerer Nenner heißt größerer Bruch.",nicht_gleichnamig:"Ich habe nicht auf den gleichen Nenner gebracht.",
  genus:"Ich kannte den Artikel nicht sicher.",kompositum:"Ich habe nicht auf das letzte Wort geachtet.",kasus:"Ich habe den falschen Fall erfragt.",
  praep:"Ich wusste nicht, welchen Fall die Präposition will.",wechsel:"Ich habe Wo? und Wohin? verwechselt.",schwach:"Ich habe -te angehängt, aber das Verb ist stark.",
  hilfsverb:"Ich habe haben und sein verwechselt.",partizip:"Ich habe das Partizip falsch gebildet.",person:"Ich habe die falsche Endung für die Person genommen.",
  umlaut:"Ich habe den Vokalwechsel vergessen (du läufst).",wortart:"Ich habe die Wortart verwechselt.",satzglied:"Ich habe nicht alle Wörter des Satzglieds erwischt.",
  verbstellung:"Ich habe das Verb im Nebensatz nicht ans Ende gestellt.",konjunktion:"Die Konjunktion passt nicht zum Sinn.",gross:"Ich habe ein Nomen übersehen.",
  verlaengern:"Ich habe das Wort nicht verlängert.",ableiten:"Ich habe kein verwandtes Wort gesucht.",schwingen:"Ich habe den kurzen Vokal nicht gehört.",
  merken:"Das Wort kannte ich noch nicht.",sz:"Ich habe nicht auf langen oder kurzen Vokal geachtet.",dasdass:"Ich habe die Ersatzprobe nicht gemacht.",
  nominal:"Ich habe das Signalwort übersehen.",komma:"Ich habe den Nebensatz nicht erkannt.",rede:"Ich habe die Zeichen der wörtlichen Rede verwechselt.",
  wortschatz:"Das Wort passt nicht genau.",lesen_info:"Ich habe die Stelle im Text nicht genau gelesen.",lesen_schluss:"Ich habe keine Hinweise im Text gesucht.",
  lesen_wort:"Ich habe den Satz um das Wort herum nicht gelesen.",lesen_sorte:"Ich habe nicht auf die Merkmale der Textsorte geachtet."
};
const MATH_REASONS=new Set("zaehlen reihe_daneben mal_statt_geteilt minus_statt_geteilt teil_statt_ganzes gegenteil vertauscht nur_ein_teil falsch_geteilt addiert_statt_mal nur_oben nur_unten rand_vergessen kein_teiler paar_fehlt vielfache_falsch nicht_groesster nicht_vollstaendig ungleich_gekuerzt groesserer_nenner nicht_gleichnamig".split(" "));

/* ---------------- state ---------------- */
const blank=()=>({st:"new",hist:[],n:0,ok:0,lvl:0,due:0,last:0,testN:0,testOk:0,errs:{},fam:{},cardSeen:false,exSeen:false,adapt:0});
function freshState(){const s={v:3,created:now(),skills:{},facts:{},fmBest:0,sessions:0,stack:{M:[],D:[]},queue:[],lastSubj:null,gerRot:0,gerGoals:0,goal:null,fj:{},fjCaught:0,reasonMiss:0};ALL_IDS.forEach(id=>s.skills[id]=blank());return s}
function migrate(s){
  if(!s.v||s.v<2){Object.keys(s.skills).forEach(id=>{const o=s.skills[id],n=Object.assign(blank(),o);if(o.st==="mastered"){n.st="gold";n.lvl=0;n.due=o.due||now()}n.hist=[];s.skills[id]=n});
    s.stack={M:Array.isArray(s.stack)?s.stack:[],D:[]};s.gerRot=0;s.lastSubj="M";Object.values(s.facts||{}).forEach(f=>{f.days=f.days||[]})}
  if(s.v<3){s.v=3;s.goal=null;s.fj=s.fj||{};s.fjCaught=s.fjCaught||0;s.reasonMiss=0;s.gerGoals=s.gerDays||0;Object.values(s.skills).forEach(k=>{k.fam=k.fam||{}})}
  ALL_IDS.forEach(id=>{if(!s.skills[id])s.skills[id]=blank();s.skills[id].fam=s.skills[id].fam||{}});
  s.stack=s.stack||{M:[],D:[]};s.queue=s.queue||[];s.fj=s.fj||{};return s;
}
function load(){try{const r=localStorage.getItem(STORE);if(r)return migrate(JSON.parse(r))}catch(e){}return freshState()}
function save(){try{localStorage.setItem(STORE,JSON.stringify(S))}catch(e){}}
let S=load(),SESS=null;
const sk=id=>S.skills[id];

/* ---------------- silent log ---------------- */
function logRow(r){S.queue.push({zeit:new Date().toISOString(),sitzung:SESS?SESS.id:"-",...r});if(S.queue.length>800)S.queue=S.queue.slice(-800);save();flush()}
let flushing=false;
async function flush(){if(flushing||!S.queue.length)return;flushing=true;
  try{while(S.queue.length){const r=S.queue[0],b=new URLSearchParams();
    ["zeit","sitzung","fertigkeit","aufgabe","antwort","richtig","sekunden","fehlertyp"].forEach(k=>b.append(FORM[k],r[k]==null?"":String(r[k]).slice(0,300)));
    await fetch(FORM.url,{method:"POST",mode:"no-cors",body:b});S.queue.shift();S.lastSync=now();save()}}catch(e){S.syncError=now();save()}flushing=false}
window.addEventListener("online",flush);

/* ---------------- seeded items: a mistake can be replayed exactly ---------------- */
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function genSeeded(id,seed){const orig=Math.random;Math.random=mulberry(seed);let it;try{it=SK[id].gen()}finally{Math.random=orig}
  it.seed=seed;it.fam=famOf(id,it);return it}
function famOf(id,it){if(it.fam)return it.fam;
  const p=strip(it.prompt.replace(/<br>[\s\S]*$/,"")).replace(/„[^“]*“/g,"…").replace(/\([^)]*\)/g,"").replace(/\d+/g,"#").split(/[?:,]/)[0];return p.split(" ").slice(0,3).join(" ")}
function genFor(id){ // prefer a question type with open mistakes (70 %)
  const fam=sk(id).fam,open=Object.keys(fam).filter(f=>fam[f]>0);let it=genSeeded(id,(Math.random()*2**31)|0);
  if(open.length&&Math.random()<0.7){const t=pick(open);for(let i=0;i<30&&it.fam!==t;i++)it=genSeeded(id,(Math.random()*2**31)|0)}
  return it}

/* ---------------- skills ---------------- */
const isDone=id=>["silver","gold"].includes(sk(id).st);
const trackOf=id=>SK[id].subj==="M"?"B":SK[id].track;
const preOk=id=>(SK[id].pre||[]).every(p=>!SK[p]||isDone(p));
function currentSkill(subj,track){
  const st=S.stack[subj];while(st.length&&isDone(st[st.length-1]))st.pop();
  const top=st.filter(id=>trackOf(id)===track).pop();if(top)return top;
  const open=TRACKS[subj][track].filter(id=>!isDone(id));
  return open.find(id=>preOk(id)||sk(id).st!=="new")||null;
}
function dueList(){return ALL_IDS.filter(id=>isDone(id)&&sk(id).due<=now()).sort((a,b)=>sk(a).due-sk(b).due)}
function reopen(id){Object.assign(sk(id),{st:"learn",hist:[],cardSeen:false,exSeen:false,lvl:0})}
function toSilver(id){const s=sk(id);s.st="silver";s.due=dayStart(1);s.hist=[];logRow({fertigkeit:id+"/SILBER",aufgabe:SK[id].name,antwort:"",richtig:"1",sekunden:"",fehlertyp:""})}
function toGold(id){const s=sk(id);s.st="gold";s.lvl=0;s.due=now()+REVIEW_DAYS[0]*86400000;logRow({fertigkeit:id+"/GOLD",aufgabe:SK[id].name,antwort:"",richtig:"1",sekunden:"",fehlertyp:""})}
const ROUTE={teil_statt_ganzes:"B3",vertauscht:"B3",addiert_statt_mal:"B6",kein_teiler:"B2",paar_fehlt:"B2",nicht_groesster:"B2",mal_statt_geteilt:"B1",falsch_geteilt:"B1",
  genus:"G2",kompositum:"G2",kasus:"G6",umlaut:"G3",schwach:"G4",verbstellung:"G10",satzglied:"G9",schwingen:"R4",verlaengern:"R2"};
function pushRoute(id,target){const subj=SK[id].subj;if(sk(target).st==="new")sk(target).st="learn";else if(isDone(target))reopen(target);
  const st=S.stack[subj];if(st[st.length-1]!==id)st.push(id);st.push(target);return target}
function maybeRoute(id,err){const s=sk(id);if(!err)return null;s.errs[err]=(s.errs[err]||0)+1;const t=ROUTE[err];
  if(t&&t!==id&&SK[t]&&SK[t].subj===SK[id].subj&&s.errs[err]>=2){s.errs[err]=0;return pushRoute(id,t)}return null}
function adapt(id){const s=sk(id),h=s.hist.slice(-6);if(h.length<6||s.n<s.adapt+6||h.reduce((a,b)=>a+b,0)>=3)return null;
  s.adapt=s.n;const pre=(SK[id].pre||[]).find(p=>SK[p]&&sk(p).st!=="gold");if(pre)return {route:pushRoute(id,pre)};s.cardSeen=false;s.exSeen=false;return {reteach:true}}
function mixCandidate(id){const subj=SK[id].subj,tr=trackOf(id),pool=TRACKS[subj][tr].filter(x=>x!==id&&isDone(x));return pool.length?pick(pool):null}
const openFams=id=>Object.keys(sk(id).fam).filter(f=>sk(id).fam[f]>0);

/* ---------------- Fehlerjäger ---------------- */
function fjAdd(id,item,err){const key=id+":"+item.seed;if(S.fj[key])Object.assign(S.fj[key],{stage:0,due:dayStart(1)});
  else S.fj[key]={id,seed:item.seed,txt:strip(item.prompt).slice(0,90),err,stage:0,due:dayStart(1),added:now()};
  const open=Object.keys(S.fj);if(open.length>60)delete S.fj[open.sort((a,b)=>S.fj[a].added-S.fj[b].added)[0]]}
const fjDue=()=>Object.keys(S.fj).filter(k=>S.fj[k].due<=now()).sort((a,b)=>S.fj[a].due-S.fj[b].due);
function fjResult(key,clean){const f=S.fj[key];if(!f)return null;
  if(clean){f.stage++;if(f.stage>=FJ_DAYS.length){delete S.fj[key];S.fjCaught++;logRow({fertigkeit:"FJ/GEFANGEN",aufgabe:f.txt,antwort:f.id,richtig:"1",sekunden:"",fehlertyp:f.err||""});return "caught"}f.due=dayStart(FJ_DAYS[f.stage]);return "step"}
  f.stage=0;f.due=dayStart(1);return "again"}

/* ---------------- Fast Math ---------------- */
const fstate=k=>S.facts[k]||(S.facts[k]={seen:0,fast:0,m:false,wrong:0,days:[]});
function setMastered(id){return Object.keys(FACTS).filter(k=>FACTS[k].set===id).every(k=>fstate(k).m)}
const activeSets=()=>SETS.filter(s=>!setMastered(s.id)).slice(0,2);  // two rows in parallel
function setProgress(id){const ks=Object.keys(FACTS).filter(k=>FACTS[k].set===id);return [ks.filter(k=>fstate(k).m).length,ks.length]}
function nextFact(){
  const due=SESS.fmRetry.find(r=>r.after<=SESS.fmCount);if(due){SESS.fmRetry=SESS.fmRetry.filter(r=>r!==due);return due.k}
  const all=Object.keys(FACTS),sets=activeSets();if(!sets.length)return pick(all);
  let active=[];sets.forEach(s=>{const cur=all.filter(k=>FACTS[k].set===s.id&&!fstate(k).m),act=cur.filter(k=>fstate(k).seen>0),fr=cur.filter(k=>fstate(k).seen===0);
    while(act.length<4&&fr.length)act.push(fr.splice(Math.floor(Math.random()*fr.length),1)[0]);active=active.concat(act)});
  const known=all.filter(k=>fstate(k).m);let pool=(Math.random()<0.75||!known.length)?active:known;
  pool=pool.filter(k=>!SESS.fmRecent.includes(k));if(!pool.length)pool=active.length?active:all;return pick(pool)}
function fmStrategy(f){const q=f.q;let m;
  if(f.set==="A1"){if(m=q.match(/(\d+) \+ (\d+)/)){const a=+m[1],b=+m[2],r=10-a;return {tip:`Zur 10 ergänzen: ${a} + ${r} = 10, dann noch ${b-r} dazu.`,steps:[[`${a} + ${r}`,10],[`10 + ${b-r}`,a+b]]}}
    if(m=q.match(/(\d+) − (\d+)/)){const c=+m[1],b=+m[2],s=c-10;return {tip:`Erst bis zur 10: ${c} − ${s} = 10, dann noch ${b-s} weg.`,steps:[[`${c} − ${s}`,10],[`10 − ${b-s}`,c-b]]}}}
  const t=f.t;if(f.set==="A5"){const n=+q.split(" : ")[0];return {tip:`Umkehraufgabe: ${t} mal wie viel ist ${n}?`,steps:[[`${t} · ${n/t}`,n]]}}
  const k=+q.replace(/[^\d ]/g," ").trim().split(/\s+/).find(x=>+x!==t)||1;
  const T={2:"Mal 2 = verdoppeln.",3:"Mal 3 = mal 2 und noch einmal dazu.",4:"Mal 4 = zweimal verdoppeln.",5:"Mal 5 = die Hälfte von mal 10.",6:"Mal 6 = mal 5 und noch einmal dazu.",7:"Mal 7 = mal 5 plus mal 2.",8:"Mal 8 = dreimal verdoppeln.",9:"Mal 9 = mal 10 und einmal wieder weg.",10:"Mal 10 = eine Null anhängen."};
  const steps=t===9?[[`10 · ${k}`,10*k],[`${10*k} − ${k}`,9*k]]:t>5&&t<9?[[`5 · ${k}`,5*k],[`${5*k} + ${t-5} · ${k}`,t*k]]:t===4?[[`2 · ${k}`,2*k],[`${2*k} + ${2*k}`,4*k]]:t===3?[[`2 · ${k}`,2*k],[`${2*k} + ${k}`,3*k]]:[];
  return {tip:T[t]||"",steps}}

/* ---------------- speech ---------------- */
let VOICE=null;function initVoice(){try{const v=speechSynthesis.getVoices();VOICE=v.find(x=>/^de(-|_)DE/i.test(x.lang))||v.find(x=>/^de/i.test(x.lang))||null}catch(e){}}
try{initVoice();speechSynthesis.onvoiceschanged=initVoice}catch(e){}
const canSpeak=()=>{try{return "speechSynthesis" in window}catch(e){return false}};
function speak(t){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang="de-DE";if(VOICE)u.voice=VOICE;u.rate=0.85;speechSynthesis.speak(u)}catch(e){}}

/* ---------------- rendering helpers ---------------- */
const app=document.getElementById("app"),ov=document.getElementById("overlay");
function h(x){app.innerHTML=x;window.scrollTo(0,0)}
const sessMin=()=>SESS?(now()-SESS.start)/60000:0;
function goalBar(){const g=S.goal;if(!g)return "";const fj=g.fjList.length?Math.min(1,g.fjDone/g.fjList.length):1,fm=Math.min(1,g.fm/GOAL.fm),cl=Math.min(1,g.clean/GOAL.clean);
  return `<div class="gbar" aria-label="Tagesziel"><i style="width:${((fj+fm+cl)/3*100).toFixed(0)}%"></i></div>`}
let KP={},lastKey={k:"",t:0};
function keypadHTML(kind){const slash=kind==="frac",comma=kind==="list";KP={val:"",allowSlash:slash,allowComma:comma};
  const ph=slash?"Bruch, z. B. 3/4":comma?"z. B. 1, 2, 3":"Deine Antwort";
  return `<div class="ansbox empty" id="ans" aria-live="polite">${ph}</div><div class="pad">${["7","8","9","⌫","4","5","6",slash?"/":comma?",":"","1","2","3","","0"].map(k=>k===""?"<span></span>":`<button type="button" data-k="${k}" class="${k==="/"||k===","?"sym":""}" aria-label="${k==="⌫"?"Löschen":k}">${k}</button>`).join("")}<button type="button" class="ok" data-k="ok" style="grid-column:span 3">Prüfen ✓</button></div>`}
function bindKeypad(onOk){const box=document.getElementById("ans"),ph=box.textContent;KP.onOk=onOk;
  const paint=()=>{if(!KP.val){box.className="ansbox empty";box.textContent=ph}else{box.className="ansbox";box.innerHTML=esc(KP.val)+'<span class="cursor"></span>'}};
  const press=k=>{const t=performance.now();if(k===lastKey.k&&t-lastKey.t<90)return;lastKey={k,t}; // ghost double-tap guard
    if(k==="ok"){if(KP.val.trim()){const v=KP.val.trim();KP.val="";KP.onOk(v)}return}
    if(k==="⌫")KP.val=KP.val.slice(0,-1);else if(k==="/"){if(KP.allowSlash&&KP.val&&!KP.val.includes("/"))KP.val+="/"}
    else if(k===","){if(KP.allowComma&&KP.val&&!/[, ]$/.test(KP.val))KP.val+=", "}else if(/\d/.test(k)&&KP.val.replace(/\D/g,"").length<(KP.allowComma?14:6))KP.val+=k;paint()};
  app.querySelectorAll(".pad [data-k]").forEach(b=>b.onclick=()=>press(b.dataset.k));KP.press=press;paint()}
document.addEventListener("keydown",e=>{if(!document.getElementById("ans")||!KP.press||ov.innerHTML)return;
  if(/^\d$/.test(e.key))KP.press(e.key);else if(e.key==="Backspace")KP.press("⌫");else if(e.key==="Enter")KP.press("ok");else if(e.key==="/")KP.press("/");else if(e.key===","||e.key===" ")KP.press(",");else return;e.preventDefault()});
function showSheet(id,onClose){const k=SK[id];
  ov.innerHTML=`<div class="sheet" role="dialog" aria-label="Spickzettel"><div class="in"><div class="top"><span class="eyebrow">Spickzettel · ${esc(k.y)}</span><button class="btn ghost sm" id="sx">Schließen ✕</button></div>
  <h2>${esc(k.name)}</h2><div class="vocab">${esc(k.card.vocab)}</div>${k.sheet}</div></div>`;document.getElementById("sx").onclick=()=>{ov.innerHTML="";onClose&&onClose()}}
const passageHTML=p=>p?`<details class="passage" open><summary>${esc(p.title)}</summary><div class="ptext">${esc(p.text)}</div></details>`:"";
const optHTML=o=>/^\d+\/\d+$/.test(o)?frHTML(...o.split("/")):esc(o);
function screenMsg(icon,title,text,next,btn){h(`${goalBar()}<div class="card"><p class="big">${icon}</p><h2>${esc(title)}</h2><p>${text}</p></div><button class="btn go" id="go">${btn||"Weiter"}</button>`);document.getElementById("go").onclick=next}

/* =====================================================================
   DAILY GOAL
   ===================================================================== */
function newGoal(){
  const subj=S.lastSubj==="D"?"M":"D";S.lastSubj=subj;if(subj==="D"){S.gerRot++;S.gerGoals++}
  const fj=fjDue().slice(0,GOAL.fjMax),reviews=dueList().slice(0,3);
  S.goal={id:`${today()}`,subj,created:now(),day:today(),fjList:fj,fjDone:0,warm:reviews.map(id=>({id,mode:"review"})).concat(contactItem(subj)),warmDone:0,fm:0,clean:0,pair:S.gerRot%2===1?["G","R"]:["L","W"],sub:0,mainClean:0,paper:subj==="D"&&S.gerGoals%3===0,paperDone:false,done:false,lastDay:today()};
  save();logRow({fertigkeit:"ZIEL/NEU",aufgabe:SUBJ_NAME[subj],antwort:`FJ ${fj.length} · FM ${GOAL.fm} · sauber ${GOAL.clean}`,richtig:"",sekunden:"",fehlertyp:""});
}
function contactItem(subj){const other=subj==="M"?"D":"M",done=ALL_IDS.filter(id=>SK[id].subj===other&&isDone(id));
  if(done.length)return [{id:pick(done),mode:"mix"}];const tr=other==="M"?"B":pick(["G","R"]),c=currentSkill(other,tr);return c?[{id:c,mode:"contact"}]:[]}
const goalReached=()=>{const g=S.goal;return g&&g.fjDone>=g.fjList.length&&g.fm>=GOAL.fm&&g.clean>=GOAL.clean};

/* =====================================================================
   SCREENS
   ===================================================================== */
function skillRow(id,cur,num){const s=sk(id),ic=s.st==="gold"?"🏆":s.st==="silver"?"🥈":num,of=openFams(id).length;
  const note=s.st==="learn"?`in Arbeit · ${s.hist.slice(-5).reduce((a,b)=>a+b,0)}/5${of?" · 🎯 Typ offen":""}`:s.st==="test"?"Schnelltest":s.st==="silver"?"Check morgen":s.st==="gold"&&s.due<=now()?"wiederholen":(!preOk(id)&&s.st==="new"?"kommt nach "+(SK[id].pre||[]).join(", "):"");
  return `<div class="skill ${s.st==="gold"?"m":""} ${s.st==="silver"?"s":""} ${id===cur?"cur":""}"><span class="ic">${ic}</span><span class="nm">${esc(SK[id].name)}<small>${esc(SK[id].y)}${note?" · "+note:""}</small></span></div>`}
function goalCard(){const g=S.goal;if(!g)return "";
  const row=(lbl,a,b)=>`<div class="grow"><span>${lbl}</span><span class="${a>=b?"ok":""}">${Math.min(a,b)}/${b}${a>=b?" ✓":""}</span></div><div class="bar"><i style="width:${b?Math.min(100,a/b*100):100}%"></i></div>`;
  return `<div class="card goal"><div class="top"><h3>Tagesziel · ${SUBJ_NAME[g.subj]}</h3>${g.day!==today()&&!g.done?'<span class="pill">von gestern – weiter geht\'s</span>':""}${g.done?'<span class="pill gold">geschafft ✓</span>':""}</div>
   ${g.fjList.length?row("🎯 Fehlerjäger",g.fjDone,g.fjList.length):""}${row("⚡ Fast Math (richtige Antworten)",g.fm,GOAL.fm)}${row(`✅ Richtig ohne Tipp (${SUBJ_NAME[g.subj]})`,g.clean,GOAL.clean)}
   <p class="tiny muted">Ziel geschafft = fertig für heute. Nicht geschafft? Kein Problem – morgen machst du genau hier weiter.</p></div>`}
function fjCard(){const keys=Object.keys(S.fj),weak=Object.keys(S.facts).filter(k=>FACTS[k]&&S.facts[k].wrong>0&&!S.facts[k].m).sort((a,b)=>S.facts[b].wrong-S.facts[a].wrong).slice(0,6);
  return `<div class="card"><div class="top"><h3>🎯 Fehlerjäger</h3><span class="pill gold">${S.fjCaught} gefangen</span></div>
   <p class="small muted">Jeder Fehler ist eine Spur. Er kommt morgen wieder – zweimal richtig, dann ist er gefangen.</p>
   ${keys.length?`<div class="fjlist">${keys.slice(0,6).map(k=>{const f=S.fj[k];return `<div class="fj"><span class="dots">${FJ_DAYS.map((_,i)=>i<f.stage?"●":"○").join("")}</span><span>${esc(f.txt.slice(0,60))}${f.txt.length>60?"…":""}</span></div>`}).join("")}${keys.length>6?`<p class="tiny muted">+ ${keys.length-6} weitere</p>`:""}</div>`:'<p class="small">Gerade keine offenen Spuren. 👀</p>'}
   ${weak.length?`<p class="small"><b>Fast-Math-Spuren:</b> ${weak.map(k=>esc(FACTS[k].q)).join(" · ")}</p>`:""}</div>`}
function screenHome(){
  SESS=null;const g=S.goal,gold=ALL_IDS.filter(id=>sk(id).st==="gold").length,silver=ALL_IDS.filter(id=>sk(id).st==="silver").length;
  const doneToday=g&&g.done&&g.doneDay===today();
  const subj=g&&!g.done?g.subj:(S.lastSubj==="D"?"M":"D"),tab=S.homeTab||subj;
  let mapHTML="";
  if(tab==="M"){const cur=currentSkill("M","B");mapHTML=ORDER_M.map((id,i)=>skillRow(id,cur,i+1)).join("")}
  else mapHTML=Object.keys(ORDER_D).map(tr=>{const cur=currentSkill("D",tr);return `<h4 class="trk">${TRACK_NAME[tr]}</h4>`+ORDER_D[tr].map((id,i)=>skillRow(id,cur,i+1)).join("")}).join("");
  h(`<div class="top"><span class="eyebrow">Otto lernt</span><span class="pill gold">🏆 ${gold} · 🥈 ${silver} · 🎯 ${S.fjCaught}</span></div>
  <div><h1>Hallo Otto! ⚽</h1><p class="muted">${doneToday?"Tagesziel für heute geschafft. Stark! Morgen geht es weiter.":g&&!g.done?`Dein Tagesziel (${SUBJ_NAME[g.subj]}) wartet.`:`Heute ist <b>${SUBJ_NAME[subj]}-Tag</b>.`}</p></div>
  <button class="btn go" id="start">${doneToday?"Extra-Runde (freiwillig)":g&&!g.done?"Weitermachen":"Training starten"}</button>
  ${g&&!(g.done&&!doneToday)?goalCard():""}
  ${fjCard()}
  <div class="card"><div class="top"><h3>Fast Math</h3><span class="pill teal">Rekord: ${S.fmBest} ⚽</span></div>
    ${SETS.map(s=>{const [m,t]=setProgress(s.id);return `<div><div class="top small"><span>${esc(s.name)}</span><span class="muted">${m}/${t}</span></div><div class="bar"><i style="width:${m/t*100}%"></i></div></div>`}).join("")}</div>
  <div class="card"><div class="top"><h3>Meine Karte</h3><div class="seg2"><button class="${tab==="M"?"on":""}" data-tab="M">Mathe</button><button class="${tab==="D"?"on":""}" data-tab="D">Deutsch</button></div></div>
    <p class="tiny muted">🥈 geschafft · 🏆 gefestigt (an einem anderen Tag nochmal richtig)</p><div class="map">${mapHTML}</div></div>
  <div class="row" style="justify-content:center"><button class="linkish" id="papa">Für Papa</button></div>`);
  document.getElementById("start").onclick=()=>startSession(doneToday);document.getElementById("papa").onclick=screenPapa;
  app.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{S.homeTab=b.dataset.tab;save();screenHome()});
}

function refreshGoal(){const g=S.goal;if(!g||g.done||g.lastDay===today())return;g.lastDay=today();
  const pendingFj=g.fjList.length-g.fjDone,add=fjDue().filter(k=>!g.fjList.includes(k)).slice(0,Math.max(0,GOAL.fjMax-pendingFj));g.fjList=g.fjList.concat(add);
  const inWarm=new Set(g.warm.slice(g.warmDone).map(w=>w.id)),rv=dueList().filter(id=>!inWarm.has(id)).slice(0,3);g.warm=g.warm.concat(rv.map(id=>({id,mode:"review"})));save()}
function startSession(extra){
  if(!S.goal||(S.goal.done&&!extra))newGoal();else refreshGoal();
  S.sessions++;S.homeTab=null;save();
  SESS={id:`${today()}#${S.sessions}`,start:now(),extra:!!extra,fmCount:0,fmRetry:[],fmRetried:new Set(),fmRecent:[],fmSecs:0,fastWrong:0,itemFastWrong:0,cnt:{},lastOk:false};
  logRow({fertigkeit:"START",aufgabe:`v${VERSION} ${SUBJ_NAME[S.goal.subj]}${extra?" extra":""}`,antwort:S.goal.day!==today()?"Ziel von "+S.goal.day:"",richtig:"",sekunden:"",fehlertyp:""});
  nextStep();
}
/* the session is a sequence of open goal parts – each call picks the next one */
function nextStep(){
  const g=S.goal;
  if(!SESS.extra&&goalReached())return goalDone();
  if(sessMin()>=CAP_MIN&&SESS.lastOk)return pauseForToday();
  if(sessMin()>=CAP_MIN+3)return pauseForToday();
  if(!SESS.extra&&g.fjDone<g.fjList.length)return fjStep();
  if(!SESS.extra&&g.warmDone<g.warm.length)return warmStep();
  if(g.fm<GOAL.fm&&!SESS.fmDone&&!SESS.extra)return SESS.fmStarted?fastNext():screenFastIntro();
  if(SESS.extra&&!SESS.fmDone)return SESS.fmStarted?fastNext():screenFastIntro();
  return mainStep();
}
function fjStep(){const g=S.goal,key=g.fjList[g.fjDone];const f=S.fj[key];
  if(!f){g.fjDone++;save();return nextStep()}
  if(!SK[f.id]){delete S.fj[key];g.fjDone++;save();return nextStep()}
  const item=genSeeded(f.id,f.seed);
  runItem(f.id,"fj",item,res=>{const r=fjResult(key,res.clean);g.fjDone++;SESS.lastOk=res.ok;save();
    if(r==="caught")return screenMsg("🎯","Fehler gefangen!",`„${esc(f.txt.slice(0,70))}“ – zweimal richtig. Der kommt nicht wieder.`,nextStep);
    nextStep()})}
function warmStep(){const g=S.goal,w=g.warm[g.warmDone];if(!w||!SK[w.id]){g.warmDone++;save();return nextStep()}
  const s=sk(w.id);let mode=w.mode||"review";if(mode==="review"&&!isDone(w.id)){g.warmDone++;save();return nextStep()}
  runItem(w.id,mode,genFor(w.id),res=>{g.warmDone++;SESS.lastOk=res.ok;
    if(mode==="review"){if(s.st==="silver"){res.clean?toGold(w.id):reopen(w.id)}else if(s.st==="gold"){if(res.clean){s.lvl=Math.min(s.lvl+1,REVIEW_DAYS.length-1);s.due=now()+REVIEW_DAYS[s.lvl]*86400000}else reopen(w.id)}
      save();if(s.st==="gold"&&res.clean&&s.lvl===0)return screenMsg("🏆",`${esc(SK[w.id].name)} – gefestigt!`,"Auch an einem anderen Tag noch gewusst. Das sitzt jetzt richtig.",nextStep)}
    save();nextStep()})}

/* ---- Fast Math: goal-based ---- */
function screenFastIntro(){const sets=activeSets(),g=S.goal;
  h(`${goalBar()}<div class="card"><p class="big">⚡⚽</p><h2>Fast Math – Elfmeterschießen</h2>
  <p>Ziel: <b>${SESS.extra?"so viele Tore wie du willst":`noch ${GOAL.fm-g.fm} richtige Antworten`}</b>. Jede richtige zählt. Weißt du sie <b>sofort</b>, ist es ein ⚽ Tor. Nicht raten – lieber kurz überlegen.</p>
  <p class="muted small">Gerade dran: <b>${sets.map(s=>esc(s.name)).join(" + ")||"alles gemischt"}</b> · Rekord: ${S.fmBest} Tore</p></div><button class="btn go" id="go">Anstoß</button>`);
  document.getElementById("go").onclick=()=>{SESS.fmStarted=true;SESS.fmStart=now();SESS.fmGoals=0;fastNext()}}
function fastNext(flash){
  const g=S.goal;
  if((!SESS.extra&&g.fm>=GOAL.fm)||(now()-SESS.fmStart)/1000>=FM_MAX_SEC){return fastEnd()}
  const k=nextFact();SESS.fmRecent.push(k);if(SESS.fmRecent.length>3)SESS.fmRecent.shift();
  const f=FACTS[k],st=fstate(k);
  if(st.wrong>=2&&st.bridgeDay!==today()){st.bridgeDay=today();save();return bridge(k,()=>askFact(k,flash))}
  askFact(k,flash);
}
function askFact(k,flash){const f=FACTS[k],t0=now(),g=S.goal;SESS.fmCount++;
  h(`${goalBar()}<div class="top"><span class="eyebrow">Fast Math</span><span class="pill teal">✓ ${SESS.extra?"Extra":Math.min(g.fm,GOAL.fm)+" / "+GOAL.fm}</span><span class="pill gold">⚽ ${SESS.fmGoals}</span></div>
  <div class="card"><div class="fact">${f.q} = ?</div><div class="flash ${flash?flash.c:""}">${flash?flash.t:"&nbsp;"}</div>${keypadHTML("num")}</div>`);
  bindKeypad(v=>{const secs=(now()-t0)/1000,x=parseNum(v),ok=x===f.a,st=fstate(k);st.seen++;let fl,err="";
    if(ok&&!SESS.extra)g.fm++;
    if(ok&&secs<=FAST_S){st.fast++;if(!st.days.includes(today()))st.days.push(today());if(st.fast>=2&&st.days.length>=2)st.m=true;SESS.fmGoals++;SESS.fastWrong=0;fl={c:"goal",t:"⚽ Tor!"}}
    else if(ok){st.fast=0;SESS.fastWrong=0;fl={c:"slow",t:"✓ Richtig – zählt fürs Ziel. Ein Tor wird es, wenn du es sofort weißt."};err="langsam"}
    else{st.fast=0;st.m=false;st.wrong++;err=Math.abs(x-f.a)===1?"zaehlen":(f.t&&Math.abs(x-f.a)===f.t)?"reihe_daneben":"falsch";
      SESS.fastWrong=secs<1.5?SESS.fastWrong+1:0;
      const s=fmStrategy(f);fl={c:"miss",t:`${f.q} = ${f.a}${s.tip?`<br><span class="small">💡 ${esc(s.tip)}</span>`:""}`};
      if(!SESS.fmRetried.has(k)){SESS.fmRetried.add(k);SESS.fmRetry.push({k,after:SESS.fmCount+4})}}
    save();logRow({fertigkeit:"FM/"+f.set,aufgabe:f.q.replace("·","x").replace("−","-"),antwort:v,richtig:ok?"1":"0",sekunden:secs.toFixed(1),fehlertyp:err});
    if(SESS.fastWrong>=3){SESS.fastWrong=0;logRow({fertigkeit:"FM/PAUSE",aufgabe:"3 schnelle Fehler",antwort:"",richtig:"",sekunden:"",fehlertyp:"pause"});
      return screenMsg("🧃","Kurze Pause?","Ich glaube, die Finger sind schneller als der Kopf. 😉 Trink einen Schluck Wasser, atme einmal durch. Fast Math machen wir später weiter – jetzt kommt etwas anderes.",()=>{SESS.fmDone=true;nextStep()},"Okay")}
    fastNext(fl)})}
function bridge(k,then){const f=FACTS[k],s=fmStrategy(f);if(!s.steps||!s.steps.length)return then();
  let i=0;const step=()=>{if(i>=s.steps.length)return then();const [q,a]=s.steps[i];
    h(`${goalBar()}<div class="top"><span class="eyebrow">Fast Math · Strategie</span><span class="pill teal">Brücke zu ${esc(f.q)}</span></div>
    <div class="card"><p class="small">💡 ${esc(s.tip)}</p><div class="fact">${q} = ?</div>${keypadHTML("num")}</div>`);
    bindKeypad(v=>{const ok=parseNum(v)===a;logRow({fertigkeit:"FM/BRUECKE",aufgabe:q.replace("·","x").replace("−","-")+" für "+f.q,antwort:v,richtig:ok?"1":"0",sekunden:"",fehlertyp:""});
      if(ok){i++;step()}else{h(`${goalBar()}<div class="card"><div class="fact">${q} = ${a}</div><p class="small">💡 ${esc(s.tip)}</p></div><button class="btn go" id="go">Weiter</button>`);document.getElementById("go").onclick=()=>{i++;step()}}})};
  step()}
function fastEnd(){SESS.fmDone=true;const rec=SESS.fmGoals>S.fmBest;if(rec)S.fmBest=SESS.fmGoals;save();
  logRow({fertigkeit:"FM/ENDE",aufgabe:activeSets().map(s=>s.id).join("+"),antwort:String(SESS.fmGoals),richtig:"",sekunden:((now()-SESS.fmStart)/1000).toFixed(0),fehlertyp:rec?"rekord":""});
  const g=S.goal,reached=g.fm>=GOAL.fm;
  screenMsg(rec?"🏆":"⚽",`${SESS.fmGoals} Tore${rec?" – neuer Rekord!":""}`,reached?"Fast-Math-Ziel für heute geschafft ✓":`Noch ${GOAL.fm-g.fm} richtige Antworten fürs Tagesziel – die holst du beim nächsten Mal.`,nextStep,`Weiter: ${SUBJ_NAME[g.subj]}`)}

/* ---- main block ---- */
function activeTrack(){const g=S.goal;if(g.subj==="M")return "B";
  if(g.sub===0&&g.mainClean>=3){g.sub=1;SESS.switched=true}
  let tr=g.pair[g.sub];if(!currentSkill("D",tr))tr=g.pair[1-g.sub];if(!currentSkill("D",tr))tr=["G","R","W","L"].find(x=>currentSkill("D",x))||null;return tr}
function mainStep(){
  const g=S.goal,tr=activeTrack();
  if(SESS.switched){SESS.switched=false;return screenMsg("🔄",`Jetzt: ${TRACK_NAME[tr]}`,"Halbzeit im Deutsch-Block. Weiter mit dem zweiten Teil.",nextStep)}
  const id=tr?currentSkill(g.subj,tr):null;
  if(!id)return screenMsg("🏆",`Alle ${SUBJ_NAME[g.subj]}-Level dieser Version geschafft!`,"Papa bekommt Bescheid – es kommen neue Level.",()=>{g.clean=GOAL.clean;save();nextStep()});
  const s=sk(id);
  if(s.st==="new"){s.st="test";s.testN=0;s.testOk=0;save();return screenMsg("🆕",esc(SK[id].name),`Neues Level (${esc(SK[id].y)}). Schnelltest: 3 Fragen. Alle ohne Tipp richtig → sofort 🥈. Sonst lernen wir es zusammen.`,nextStep,"Los")}
  if(s.st==="learn"&&!s.cardSeen){s.cardSeen=true;save();return screenCard(id)}
  if(s.st==="learn"&&!s.exSeen){s.exSeen=true;save();return screenExample(id)}
  const mode=s.st==="test"?"test":"learn";SESS.cnt[id]=(SESS.cnt[id]||0)+1;
  if(mode==="learn"&&SESS.cnt[id]%4===0){const m=mixCandidate(id);if(m)return runItem(m,"mix",genFor(m),res=>{if(!res.clean)sk(m).due=now();else{g.clean++;g.mainClean++}SESS.lastOk=res.ok;save();nextStep()})}
  runItem(id,mode,genFor(id),res=>afterItem(id,mode,res));
}
function screenCard(id){const k=SK[id],c=k.card;
  h(`${goalBar()}<div class="card"><span class="eyebrow">Lernkarte · ${esc(k.y)}</span><h2>${esc(k.name)}</h2>${c.fig?`<div class="fig">${c.fig()}</div>`:""}
  <p style="font-weight:700">${esc(c.rule)}</p><div class="ex">${esc(c.ex).replace(/\n/g,"<br>")}</div><div class="vocab">${esc(c.vocab)}</div></div>
  <div class="row"><button class="btn ghost" id="more">Mehr erklären 📄</button><button class="btn go" id="go">Verstanden</button></div>`);
  document.getElementById("go").onclick=nextStep;document.getElementById("more").onclick=()=>showSheet(id)}
function screenExample(id){const it=genFor(id);
  h(`${goalBar()}<div class="card"><span class="eyebrow">Musteraufgabe – erst anschauen</span>${passageHTML(it.passage)}${it.fig?`<div class="fig">${it.fig}</div>`:""}
  <p class="q">${it.prompt}</p>${it.kind==="tap"?tapSolutionHTML(it,new Set(it.ans)):""}<div class="fb sol"><strong>So wird's gemacht:</strong><p>${it.sol}</p></div></div>
  <button class="btn go" id="go">Jetzt du</button>`);document.getElementById("go").onclick=nextStep}
function afterItem(id,mode,res){
  const s=sk(id),g=S.goal;s.n++;if(res.ok)s.ok++;s.last=now();SESS.lastOk=res.ok;if(res.clean){g.clean++;g.mainClean++}
  if(mode==="test"){
    if(!res.clean){s.st="learn";s.hist=[];s.cardSeen=false;s.exSeen=false;save();return screenMsg("💡","Das lernen wir jetzt",`„${esc(SK[id].name)}“ schauen wir uns Schritt für Schritt an: Lernkarte, Musteraufgabe, dann du.`,nextStep)}
    s.testN++;if(s.testN>=3){toSilver(id);save();return screenSilver(id,true)}save();return nextStep()}
  s.hist.push(res.clean?1:0);if(s.hist.length>12)s.hist=s.hist.slice(-12);
  const last5=s.hist.slice(-5);
  if(s.hist.length>=5&&last5.reduce((a,b)=>a+b,0)>=4){
    if(!openFams(id).length){toSilver(id);save();return screenSilver(id,false)}
    if(!SESS.famNote){SESS.famNote=true;save();return screenMsg("🎯","Fast geschafft!",`Eine Aufgabenart in „${esc(SK[id].name)}“ ist noch offen. Die üben wir jetzt gezielt – dann gibt es 🥈.`,nextStep)}}
  if(res.routedTo){save();return screenMsg("🧭","Kurzer Umweg",`Dafür brauchst du „${esc(SK[res.routedTo].name)}“. Das trainieren wir kurz – dann geht es zurück.`,nextStep)}
  const a=adapt(id);
  if(a&&a.route){save();return screenMsg("🧭","Kurzer Umweg",`Wir festigen erst „${esc(SK[a.route].name)}“. Danach geht es mit „${esc(SK[id].name)}“ weiter.`,nextStep)}
  if(a&&a.reteach){save();return screenMsg("💡","Wir schauen es nochmal zusammen an","Das ist gerade knifflig – völlig normal bei etwas Neuem. Lernkarte und Musteraufgabe nochmal, dann geht's leichter.",nextStep)}
  save();nextStep()}
function screenSilver(id,test){const gd=ALL_IDS.filter(x=>sk(x).st==="gold").length,sv=ALL_IDS.filter(x=>sk(x).st==="silver").length;
  screenMsg("🥈",`${esc(SK[id].name)} – geschafft!`,`${test?"Im Schnelltest alles richtig – das konntest du schon!":"4 von 5 richtig, ohne Tipp – und jede Aufgabenart sitzt."} An einem anderen Tag kommt ein kurzer Check. Weißt du es dann noch, wird es 🏆.<br><span class="muted small">🏆 ${gd} · 🥈 ${sv}</span>`,nextStep)}

/* ---- tap helpers ---- */
function tapSolutionHTML(item,sel){const ans=item.ans;return `<div class="chips">${item.tokens.map((t,i)=>{if(!item.tappable(t))return `<span class="punct">${esc(t)}</span>`;
  const a=ans.has(i),s=sel.has(i),cls=a&&s?"hit":a?"miss":s?"wrongtap":"";return `<span class="chip ${cls}">${esc(a?t:(item.display||item.tokens)[i])}</span>`}).join("")}</div>
  ${sel!==ans?'<p class="tiny muted">🟩 richtig erkannt · 🟨 übersehen · 🟥 zu viel</p>':""}`}

/* ---- generic item runner ---- */
function runItem(id,mode,item,done){
  window.__lastItem=item;let attempt=1,hinted=false,t0=now(),errFirst=null,lastSel=null;
  const twoTries=mode==="learn"||mode==="test"||mode==="contact"||mode==="fj";
  const label=({review:sk(id).st==="silver"?"Check":"Wiederholung",test:`Schnelltest ${sk(id).testN+1}/3`,learn:`Üben · ${sk(id).hist.slice(-5).reduce((a,b)=>a+b,0)}/5`,mix:"Mix",contact:SUBJ_NAME[SK[id].subj]+" zwischendurch",fj:"🎯 Fehlerjäger"})[mode];
  const head=()=>`${goalBar()}<div class="top"><span class="eyebrow nocaps">${esc(SK[id].name)}</span><span class="pill">${esc(label)}</span></div>`;
  function view(fb){
    let field="";
    if(item.kind==="mc"||item.kind==="listen")field=`${item.kind==="listen"&&canSpeak()?`<button class="btn ghost sm listen" id="say">🔊 Anhören</button>`:""}<div class="opts" role="radiogroup">${item.opts.map((o,i)=>`<button class="opt" role="radio" aria-checked="false" data-o="${i}">${optHTML(o)}</button>`).join("")}</div><button class="btn go" id="okmc" disabled>Prüfen ✓</button>`;
    else if(item.kind==="tap")field=`<div class="chips">${item.tokens.map((t,i)=>item.tappable(t)?`<button class="chip" data-t="${i}">${esc((item.display||item.tokens)[i])}</button>`:`<span class="punct">${esc(t)}</span>`).join("")}</div><button class="btn go" id="oktap">Prüfen ✓</button>`;
    else if(item.kind==="shade")field=`<div class="fig" id="shade">${svgBar(item.n,0,{tap:true,h:80})}</div><p class="muted small" style="text-align:center"><span id="cnt">0</span> von ${item.n} Teilen grün</p><button class="btn go" id="okshade">Prüfen ✓</button>`;
    else field=keypadHTML(item.kind);
    h(`${head()}<div class="card">${passageHTML(item.passage)}${item.fig?`<div class="fig">${item.fig}</div>`:""}<p class="q">${item.prompt}</p>
      ${fb||""}${hinted&&!fb?`<div class="hint">💡 ${esc(item.hint)}</div>`:""}${field}
      <div class="row">${hinted?"":`<button class="btn ghost sm" id="hint">💡 Tipp</button>`}<button class="btn ghost sm" id="sheet">📄 Spickzettel</button></div></div>`);
    const hb=document.getElementById("hint");if(hb)hb.onclick=()=>{hinted=true;view(fb)};
    document.getElementById("sheet").onclick=()=>{hinted=true;showSheet(id,()=>view(fb))};
    const say=document.getElementById("say");if(say){say.onclick=()=>speak(item.speak);if(attempt===1&&!fb)setTimeout(()=>speak(item.speak),350)}
    if(item.kind==="mc"||item.kind==="listen"){let sel=null;const ok=document.getElementById("okmc");
      app.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{app.querySelectorAll("[data-o]").forEach(x=>{x.classList.remove("sel");x.setAttribute("aria-checked","false")});b.classList.add("sel");b.setAttribute("aria-checked","true");sel=+b.dataset.o;ok.disabled=false});
      ok.onclick=()=>{if(sel!==null)submit(sel,item.opts[sel])}}
    else if(item.kind==="tap"){const sel=new Set();app.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{const i=+b.dataset.t;sel.has(i)?sel.delete(i):sel.add(i);b.classList.toggle("on",sel.has(i))});
      document.getElementById("oktap").onclick=()=>{lastSel=new Set(sel);submit(sel,"getippt: "+([...sel].sort((a,b)=>a-b).map(i=>item.tokens[i]).join(" ")||"(nichts)"))}}
    else if(item.kind==="shade"){const sh=new Set();const paint=()=>{document.querySelectorAll("#shade .seg").forEach(r=>r.setAttribute("fill",sh.has(+r.dataset.i)?C.on:C.off));document.getElementById("cnt").textContent=sh.size};
      document.querySelectorAll("#shade .seg").forEach(r=>r.addEventListener("click",()=>{const i=+r.dataset.i;sh.has(i)?sh.delete(i):sh.add(i);paint()}));document.getElementById("okshade").onclick=()=>submit(sh.size,`${sh.size} Teile`)}
    else bindKeypad(v=>submit(v,v));
  }
  function submit(val,shown){
    const ok=!!item.check(val),secs=(now()-t0)/1000,err=ok?null:(item.classify(val)||"falsch");
    logRow({fertigkeit:`${id}/${mode}`,aufgabe:strip(item.prompt).slice(0,160),antwort:String(shown).slice(0,120),richtig:ok?"1":"0",sekunden:secs.toFixed(1),fehlertyp:ok?(hinted?"tipp":""):err});
    // fast wrong answers twice in a row → kind pause
    if(!ok&&secs<1.5){SESS.itemFastWrong++}else SESS.itemFastWrong=0;
    if(ok){const clean=attempt===1&&!hinted;
      if(clean)famDown(id,item.fam);
      const m=SK[id].method&&clean&&(mode==="learn"||mode==="test")&&Math.random()<0.4?SK[id].method(item):null;
      if(m)return methodCheck(m,c=>finishOk(c));return finishOk(clean)}
    if(attempt===1){famUp(id,item.fam);if(mode!=="fj")fjAdd(id,item,err)}
    if(SESS.itemFastWrong>=2){SESS.itemFastWrong=0;logRow({fertigkeit:"PAUSE",aufgabe:"2 schnelle Fehler",antwort:"",richtig:"",sekunden:"",fehlertyp:"pause"});
      return screenMsg("🧃","Kurz durchatmen","Zwei Antworten ganz schnell hintereinander – lies die Frage in Ruhe nochmal. Es zählt nur, was du wirklich weißt, nicht wie schnell du tippst.",()=>{attempt=2;hinted=true;errFirst=err;t0=now();view(`<div class="hint">💡 ${esc(item.hint)}</div>`)},"Nochmal lesen")}
    const proceed=()=>{
      if(attempt===1&&twoTries){attempt=2;hinted=true;errFirst=err;t0=now();
        return view(`<div class="fb err"><strong>Noch nicht – du schaffst das.</strong><p>${esc(ERR[err]||ERR.falsch)}</p></div><div class="hint">💡 ${esc(item.hint)}</div><p class="small muted">Versuch es nochmal.</p>`)}
      const routedTo=mode==="learn"?maybeRoute(id,errFirst||err):null;
      finish({ok:false,clean:false,routedTo},`<div class="fb sol"><strong>So geht's:</strong>${item.kind==="tap"?tapSolutionHTML(item,lastSel||new Set()):""}<p>${item.sol}</p>${ERR[err]&&err!=="falsch"?`<p class="small">${esc(ERR[err])}</p>`:""}<p class="small muted">Diese Aufgabe kommt in den 🎯 Fehlerjäger – morgen fängst du sie.</p></div>`)};
    if(attempt===1&&REASON[err])return reasonPick(err,proceed);
    proceed()}
  function reasonPick(err,then){
    const math=MATH_REASONS.has(err),pool=Object.keys(REASON).filter(k=>k!==err&&MATH_REASONS.has(k)===math);
    const others=shuffle(pool).slice(0,2).map(k=>REASON[k]),opts=shuffle([REASON[err],...others]);
    h(`${head()}<div class="card"><p class="small muted">${item.prompt.length<200?item.prompt:""}</p><h3>Was war los? 🤔</h3><p class="small">Fehler sind Spuren. Welche passt am besten?</p>
    <div class="opts">${opts.map((o,i)=>`<button class="opt" data-r="${i}">${esc(o)}</button>`).join("")}</div></div>`);
    app.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{const pickTxt=opts[+b.dataset.r],right=pickTxt===REASON[err];
      logRow({fertigkeit:`${id}/grund`,aufgabe:err,antwort:pickTxt,richtig:right?"1":"0",sekunden:"",fehlertyp:right?"":"grund_falsch"});
      if(right){S.reasonMiss=0;save();return screenMsg("🔍","Genau erkannt!","Wer seinen Fehler findet, macht ihn beim nächsten Mal nicht mehr. Probier es jetzt nochmal.",then,"Nochmal versuchen")}
      S.reasonMiss++;save();
      if(S.reasonMiss>=2){S.reasonMiss=0;save();return ruleExplain(err,then)}
      screenMsg("🔍","Fast!",`Der Grund war eher: <b>${esc(REASON[err])}</b><br><span class="small muted">Das herauszufinden ist echt nicht leicht – genau das trainieren wir.</span>`,then,"Weiter")})}
  function ruleExplain(err,then){const c=SK[id].card;
    h(`${head()}<div class="card"><p class="big">🧠</p><h2>Schauen wir uns die Regel zusammen an</h2>
    <p>Gerade war es zweimal schwer, den Grund zu finden. Das ist völlig normal – dafür ist diese Seite da.</p>
    <div class="fb sol"><strong>Darum ging es:</strong><p>${esc(REASON[err])}</p><p class="small">${esc(ERR[err]||"")}</p></div>
    <p style="font-weight:700">${esc(c.rule)}</p><div class="ex">${esc(c.ex).replace(/\n/g,"<br>")}</div></div>
    <div class="row"><button class="btn ghost" id="more">Ganzen Spickzettel ansehen 📄</button><button class="btn go" id="go">Alles klar – weiter</button></div>`);
    document.getElementById("go").onclick=then;document.getElementById("more").onclick=()=>showSheet(id)}
  function finishOk(clean){const praise=pick(["Richtig! 💪","Stark!","Genau so!","Volltreffer! ⚽","Sauber!"]);
    finish({ok:true,clean},`<div class="fb ok"><strong>${praise}</strong>${item.kind==="tap"?tapSolutionHTML(item,lastSel||new Set(item.ans)):""}<p>${item.sol}</p>${!clean?`<p class="small muted">${attempt>1?"Im zweiten Versuch geschafft – gut drangeblieben! Zählt noch nicht für 🥈.":"Mit Tipp geschafft – zählt noch nicht für 🥈."}</p>`:""}</div>`)}
  function methodCheck(m,cb){
    h(`${head()}<div class="card"><p class="q">${esc(m.q)}</p><div class="opts">${m.o.map((o,i)=>`<button class="opt" data-m="${i}">${esc(o[0])}</button>`).join("")}</div><p class="muted small">Ehrlich antworten – jeder Weg ist okay.</p></div>`);
    app.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{const o=m.o[+b.dataset.m],det=o[1]===1;
      logRow({fertigkeit:`${id}/weg`,aufgabe:m.q,antwort:o[0],richtig:det?"0":"1",sekunden:"",fehlertyp:det?"umweg":""});cb(!det)})}
  function finish(res,fbHTML){
    h(`${head()}<div class="card">${passageHTML(item.passage)}${item.fig&&item.kind!=="shade"?`<div class="fig">${item.fig}</div>`:""}<p class="q">${item.prompt}</p>${fbHTML}</div><button class="btn go" id="next">Weiter</button>`);
    const n=document.getElementById("next");n.onclick=()=>done(res);n.focus()}
  view();
}
function famUp(id,f){const m=sk(id).fam;m[f]=1}
function famDown(id,f){const m=sk(id).fam;if(m[f]>0)m[f]--}

/* ---- goal end / pause ---- */
function goalDone(){const g=S.goal;
  if(g.paper&&!g.paperDone){g.paperDone=true;save();return screenPaper(()=>goalDone())}
  g.done=true;g.doneDay=today();save();
  logRow({fertigkeit:"ZIEL/GESCHAFFT",aufgabe:SUBJ_NAME[g.subj],antwort:`${Math.round(sessMin())} min`,richtig:"1",sekunden:"",fehlertyp:g.day!==today()?"über 2 Tage":""});
  const nextSubj=g.subj==="M"?"Deutsch":"Mathe";
  h(`<div class="card"><p class="big">🏅</p><h2>Tagesziel geschafft!</h2><p>Stark gearbeitet, Otto. Für heute bist du <b>fertig</b>.</p>
  <p class="muted">Nächstes Mal: <b>${nextSubj}</b>. 🎯 ${S.fjCaught} Fehler gefangen · ⚽ Rekord ${S.fmBest}</p>
  <p class="muted small">Papa sieht deinen Fortschritt automatisch – du musst nichts schicken.</p></div><button class="btn go" id="home">Zur Übersicht</button>`);
  document.getElementById("home").onclick=screenHome}
function pauseForToday(){const g=S.goal;
  logRow({fertigkeit:"ENDE",aufgabe:`${Math.round(sessMin())} min`,antwort:`FJ ${g.fjDone}/${g.fjList.length} FM ${g.fm}/${GOAL.fm} sauber ${g.clean}/${GOAL.clean}`,richtig:"",sekunden:"",fehlertyp:"ziel offen"});
  h(`<div class="card"><p class="big">🙌</p><h2>Für heute reicht's!</h2><p>Du hast ${Math.round(sessMin())} Minuten trainiert. Dein Tagesziel ist noch nicht ganz voll – <b>morgen machst du genau hier weiter</b>.</p>
  ${goalCard()}</div><button class="btn go" id="home">Zur Übersicht</button>`);document.getElementById("home").onclick=screenHome}
function screenPaper(then){const p=paperTask();
  h(`${goalBar()}<div class="card"><span class="eyebrow">Papier-Aufgabe</span><h2>${esc(p.title)}</h2><p class="small"><b>Regel:</b> ${esc(p.rule)}</p>
  <p class="small">Nimm ein Blatt. Schreib die Nummern <b>1 bis ${p.sol.length}</b> untereinander und daneben jeweils das <b>vollständige Wort</b>. Steht etwas in Klammern, ist das dein Hinweis.</p>
  <div class="paper">${p.html}</div></div><button class="btn go" id="go">Fertig geschrieben – Lösung zeigen</button><button class="btn ghost" id="skip">Heute überspringen</button>`);
  document.getElementById("skip").onclick=()=>{logRow({fertigkeit:"PAPIER",aufgabe:p.title,antwort:"übersprungen",richtig:"",sekunden:"",fehlertyp:""});then()};
  document.getElementById("go").onclick=()=>{
    h(`<div class="card"><h2>Vergleiche mit deinem Blatt</h2><p class="small">Tippe jede Nummer an, die du <b>richtig</b> hast.</p>
    <div class="map">${p.full.map((w,i)=>`<button class="chip wide" data-p="${i}"><b>(${i+1})</b> ${esc(w)}</button>`).join("")}</div></div><button class="btn go" id="save">Speichern</button>`);
    const ok=new Set();app.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{const i=+b.dataset.p;ok.has(i)?ok.delete(i):ok.add(i);b.classList.toggle("on",ok.has(i))});
    document.getElementById("save").onclick=()=>{const wrong=p.full.map((w,i)=>ok.has(i)?null:`(${i+1}) ${w}`).filter(Boolean);
      logRow({fertigkeit:"PAPIER",aufgabe:`${p.title} – ${p.rule}`,antwort:`${ok.size}/${p.sol.length}`,richtig:ok.size===p.sol.length?"1":"0",sekunden:"",fehlertyp:wrong.join("; ")});
      screenMsg(ok.size>=p.sol.length-1?"📝":"✍️",`${ok.size} von ${p.sol.length} richtig`,wrong.length?`Schau dir diese nochmal an: ${esc(wrong.join(", "))}.`:"Alles richtig – auf Papier und mit der Hand. Stark!",then)}}}

/* ---- Papa view ---- */
function screenPapa(){
  const L={new:"neu",test:"Schnelltest",learn:"in Arbeit",silver:"🥈 geschafft",gold:"🏆 gefestigt"},g=S.goal;
  const rows=ids=>ids.map(id=>{const s=sk(id),of=openFams(id);return `<tr><td>${id}</td><td>${esc(SK[id].name)}</td><td>${L[s.st]||s.st}</td><td>${s.n?Math.round(s.ok/s.n*100)+"% ("+s.n+")":"–"}</td><td>${isDone(id)?new Date(s.due).toLocaleDateString("de-DE"):s.st==="learn"?s.hist.slice(-5).join(""):""}${of.length?`<br><span class="tiny">offen: ${esc(of.join(" | "))}</span>`:""}</td></tr>`}).join("");
  const tbl=(t,ids)=>`<h4 class="trk">${t}</h4><div class="tblwrap"><table><thead><tr><th>ID</th><th>Level</th><th>Status</th><th>Treffer</th><th>Fällig / letzte 5</th></tr></thead><tbody>${rows(ids)}</tbody></table></div>`;
  const fj=Object.keys(S.fj).map(k=>S.fj[k]);
  h(`<div class="top"><span class="eyebrow">Für Papa</span><button class="btn ghost sm" id="back">← Zurück</button></div>
  <div class="card"><h3>Tagesziel</h3>${g?`<p class="small">${SUBJ_NAME[g.subj]} · angelegt ${g.day} · ${g.done?"geschafft "+(g.doneDay||""):"offen"} · Fehlerjäger ${g.fjDone}/${g.fjList.length} · Fast Math ${g.fm}/${GOAL.fm} · sauber ${g.clean}/${GOAL.clean}</p>`:"<p class='small'>Noch kein Ziel angelegt.</p>"}
   <button class="btn ghost sm" id="flip">Nächstes Ziel: ${SUBJ_NAME[S.lastSubj==="D"?"D":"M"]} statt ${SUBJ_NAME[S.lastSubj==="D"?"M":"D"]}</button></div>
  <div class="card"><h3>🎯 Fehlerjäger (${fj.length} offen · ${S.fjCaught} gefangen)</h3><div class="tblwrap"><table><thead><tr><th>Level</th><th>Aufgabe</th><th>Fehlertyp</th><th>Stufe</th></tr></thead><tbody>${fj.map(f=>`<tr><td>${f.id}</td><td>${esc(f.txt.slice(0,70))}</td><td>${esc(f.err||"")}</td><td>${f.stage}/${FJ_DAYS.length}</td></tr>`).join("")}</tbody></table></div></div>
  <div class="card"><h3>Mathe</h3>${tbl("Level",ORDER_M)}</div>
  <div class="card"><h3>Deutsch</h3>${Object.keys(ORDER_D).map(tr=>tbl(TRACK_NAME[tr],ORDER_D[tr])).join("")}</div>
  <div class="card"><h3>Fast Math</h3>${SETS.map(s=>{const [m,t]=setProgress(s.id);return `<p class="small">${s.id} ${esc(s.name)}: <b>${m}/${t}</b></p>`}).join("")}<p class="small muted">Rekord ${S.fmBest} Tore · ${S.sessions} Sitzungen</p></div>
  <div class="card"><h3>Synchronisierung</h3><p class="small">Wartend: <b>${S.queue.length}</b> Zeilen · zuletzt gesendet: ${S.lastSync?new Date(S.lastSync).toLocaleString("de-DE"):"noch nie"}${S.syncError?` · letzter Fehler: ${new Date(S.syncError).toLocaleString("de-DE")}`:""}</p><button class="btn ghost sm" id="sync">Jetzt senden</button></div>
  <div class="card"><h3>Sicherung</h3><p class="small muted">Code kopieren und aufheben. Auf einem neuen Gerät hier einfügen und „Wiederherstellen“ tippen.</p>
   <textarea id="code" aria-label="Sicherungscode"></textarea><div class="row"><button class="btn ghost sm" id="exp">Code erzeugen</button><button class="btn ghost sm" id="imp">Wiederherstellen</button></div><p class="small" id="msg"></p></div>
  <p class="tiny muted" style="text-align:center">Version ${VERSION}</p>`);
  document.getElementById("back").onclick=screenHome;
  document.getElementById("flip").onclick=()=>{if(S.goal&&!S.goal.done){S.goal.subj=S.goal.subj==="M"?"D":"M";S.lastSubj=S.goal.subj}else S.lastSubj=S.lastSubj==="D"?"M":"D";save();screenPapa()};
  document.getElementById("sync").onclick=()=>flush().then(screenPapa);
  document.getElementById("exp").onclick=()=>{document.getElementById("code").value=btoa(unescape(encodeURIComponent(JSON.stringify({...S,queue:[]}))));document.getElementById("msg").textContent="Code erzeugt – kopieren und aufheben."};
  document.getElementById("imp").onclick=()=>{const m=document.getElementById("msg"),b=document.getElementById("imp");
    try{const o=JSON.parse(decodeURIComponent(escape(atob(document.getElementById("code").value.trim()))));if(!o.skills)throw 0;
      if(!b.dataset.sure){b.dataset.sure="1";b.textContent="Sicher? Ersetzt den aktuellen Stand";return}S=migrate(o);S.queue=[];save();m.textContent="Wiederhergestellt ✓";setTimeout(screenHome,700)}catch(e){m.textContent="Der Code ist ungültig."}};
}

/* ---- boot ---- */
window.__otto={S:()=>S,SK,FACTS,ALL_IDS,ORDER_D,ORDER_M,paperTask,TEXTE,genSeeded,REASON};
screenHome();flush();
