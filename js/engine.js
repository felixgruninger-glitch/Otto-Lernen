"use strict";
/* Otto lernt – Engine v2: Zustand, Methode (Test-out → Lernkarte → Musteraufgabe → Üben mit Mix → 🥈 → verzögerter Check → 🏆 → Wiederholung),
   Fast Math, Tageswechsel Mathe/Deutsch, stiller Log, Papa-Ansicht. */

const VERSION="2.0.0";
const STORE="otto-lernen-v1";            // same key as v1 → progress carries over
const SESSION_MIN=15,SESSION_CAP=20,FAST_MATH_SEC=180,FAST_S=4,REVIEW_DAYS=[3,7,14,30,60];
const FORM={url:"https://docs.google.com/forms/d/e/1FAIpQLSeqKkP2F6H5eCPnpm5iTYPkTAdZqZsaoRN_0P-l_q0coZIP2w/formResponse",
  zeit:"entry.2074423634",sitzung:"entry.1652398039",fertigkeit:"entry.276277759",aufgabe:"entry.29870072",antwort:"entry.1407786930",richtig:"entry.1553877116",sekunden:"entry.2029597351",fehlertyp:"entry.1202747942"};
const TRACKS={M:{B:ORDER_M},D:ORDER_D};
const ALL_IDS=[...ORDER_M,...Object.values(ORDER_D).flat()];
const SUBJ_NAME={M:"Mathe",D:"Deutsch"};
const today=()=>new Date().toISOString().slice(0,10);
const tomorrow0=()=>{const d=new Date();d.setHours(24,0,0,0);return d.getTime()};

/* ---------------- state ---------------- */
const blank=()=>({st:"new",hist:[],n:0,ok:0,lvl:0,due:0,last:0,testN:0,testOk:0,errs:{},cardSeen:false,exSeen:false,adapt:0});
function freshState(){const s={v:2,created:now(),skills:{},facts:{},fmBest:0,sessions:0,stack:{M:[],D:[]},queue:[],lastSubj:null,lastDay:null,gerRot:0,gerDays:0};ALL_IDS.forEach(id=>s.skills[id]=blank());return s}
function migrate(s){
  if(!s.v||s.v<2){ // v1 → v2
    Object.keys(s.skills).forEach(id=>{const o=s.skills[id],n=Object.assign(blank(),o);
      if(o.st==="mastered"){n.st="gold";n.lvl=0;n.due=o.due||now()}n.hist=[];s.skills[id]=n});
    s.stack={M:Array.isArray(s.stack)?s.stack:[],D:[]};s.v=2;s.gerRot=0;s.gerDays=0;s.lastSubj="M";s.lastDay=null;
    Object.values(s.facts||{}).forEach(f=>{f.days=f.days||[]});
  }
  ALL_IDS.forEach(id=>{if(!s.skills[id])s.skills[id]=blank()});
  s.stack=s.stack||{M:[],D:[]};s.queue=s.queue||[];
  return s;
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
    await fetch(FORM.url,{method:"POST",mode:"no-cors",body:b});S.queue.shift();S.lastSync=now();save()}}
  catch(e){S.syncError=now();save()}flushing=false}
window.addEventListener("online",flush);

/* ---------------- skill selection ---------------- */
const isDone=id=>["silver","gold"].includes(sk(id).st);
function trackOf(id){return SK[id].subj==="M"?"B":SK[id].track}
function currentSkill(subj,track){
  const st=S.stack[subj];while(st.length&&isDone(st[st.length-1]))st.pop();
  const top=st.filter(id=>trackOf(id)===track).pop();if(top)return top;
  return TRACKS[subj][track].find(id=>!isDone(id))||null;
}
function dueList(){return ALL_IDS.filter(id=>isDone(id)&&sk(id).due<=now()).sort((a,b)=>sk(a).due-sk(b).due)}
function reopen(id){Object.assign(sk(id),{st:"learn",hist:[],cardSeen:false,exSeen:false,lvl:0})}
function toSilver(id){const s=sk(id);s.st="silver";s.due=tomorrow0();s.hist=[];logRow({fertigkeit:id+"/SILBER",aufgabe:SK[id].name,antwort:"",richtig:"1",sekunden:"",fehlertyp:""})}
function toGold(id){const s=sk(id);s.st="gold";s.lvl=0;s.due=now()+REVIEW_DAYS[0]*DAY;logRow({fertigkeit:id+"/GOLD",aufgabe:SK[id].name,antwort:"",richtig:"1",sekunden:"",fehlertyp:""})}
const ROUTE={teil_statt_ganzes:"B3",vertauscht:"B3",addiert_statt_mal:"B6",kein_teiler:"B2",paar_fehlt:"B2",nicht_groesster:"B2",mal_statt_geteilt:"B1",falsch_geteilt:"B1",
  genus:"G2",kasus:"G6",umlaut:"G3",schwach:"G4",verbstellung:"G10",satzglied:"G9",schwingen:"R4",verlaengern:"R2"};
function pushRoute(id,target){const subj=SK[id].subj;if(!isDone(target)&&sk(target).st==="new")sk(target).st="learn";else if(isDone(target))reopen(target);
  const st=S.stack[subj];if(st[st.length-1]!==id)st.push(id);st.push(target);return target}
function maybeRoute(id,err){const s=sk(id);if(!err)return null;s.errs[err]=(s.errs[err]||0)+1;const t=ROUTE[err];
  if(t&&t!==id&&SK[t]&&SK[t].subj===SK[id].subj&&s.errs[err]>=2){s.errs[err]=0;return pushRoute(id,t)}return null}
function adapt(id){ // 85%-rule guard: too many misses → prerequisite or re-teach
  const s=sk(id),h=s.hist.slice(-6);if(h.length<6||s.n<s.adapt+6||h.reduce((a,b)=>a+b,0)>=3)return null;
  s.adapt=s.n;const pre=(SK[id].pre||[]).find(p=>SK[p]&&sk(p).st!=="gold");
  if(pre)return {route:pushRoute(id,pre)};
  s.cardSeen=false;s.exSeen=false;return {reteach:true};
}
function mixCandidate(id){const subj=SK[id].subj,tr=trackOf(id),pool=TRACKS[subj][tr].filter(x=>x!==id&&isDone(x));return pool.length?pick(pool):null}

/* ---------------- Fast Math v2 ---------------- */
const fstate=k=>S.facts[k]||(S.facts[k]={seen:0,fast:0,m:false,wrong:0,days:[]});
function setMastered(id){return Object.keys(FACTS).filter(k=>FACTS[k].set===id).every(k=>fstate(k).m)}
function currentSet(){return SETS.find(s=>!setMastered(s.id))||null}
function setProgress(id){const ks=Object.keys(FACTS).filter(k=>FACTS[k].set===id);return [ks.filter(k=>fstate(k).m).length,ks.length]}
function nextFact(){
  if(SESS.fmRetry.length&&SESS.fmRetry[0].after<=SESS.fmCount)return SESS.fmRetry.shift().k;
  const cs=currentSet(),all=Object.keys(FACTS);
  if(!cs)return pick(all);
  const cur=all.filter(k=>FACTS[k].set===cs.id&&!fstate(k).m),active=cur.filter(k=>fstate(k).seen>0),fresh=cur.filter(k=>fstate(k).seen===0);
  while(active.length<6&&fresh.length)active.push(fresh.splice(Math.floor(Math.random()*fresh.length),1)[0]);
  const known=all.filter(k=>fstate(k).m);
  let pool=(Math.random()<0.7||!known.length)?active:known;pool=pool.filter(k=>!SESS.fmRecent.includes(k));if(!pool.length)pool=active.length?active:all;
  return pick(pool);
}
function fmStrategy(f){const q=f.q;let m;
  if(f.set==="A1"){if(m=q.match(/(\d+) \+ (\d+)/)){const a=+m[1],b=+m[2],r=10-a;return `Zur 10 ergänzen: ${a} + ${r} = 10, dann noch ${b-r} dazu → ${a+b}.`}
    if(m=q.match(/(\d+) − (\d+)/)){const c=+m[1],b=+m[2],s=c-10;return `Erst bis zur 10: ${c} − ${s} = 10, dann noch ${b-s} weg → ${c-b}.`}}
  const t=f.t;if(f.set==="A5")return `Umkehraufgabe: ${t} mal wie viel ist ${q.split(" : ")[0]}? Sag die ${t}er-Reihe.`;
  const tip={2:"Mal 2 = verdoppeln.",3:"Mal 3 = mal 2 und noch einmal dazu.",4:"Mal 4 = zweimal verdoppeln.",5:"Mal 5 = die Hälfte von mal 10.",6:"Mal 6 = mal 5 und noch einmal dazu.",7:"Mal 7 = mal 5 plus mal 2.",8:"Mal 8 = dreimal verdoppeln.",9:"Mal 9 = mal 10 und einmal wieder weg.",10:"Mal 10 = eine Null anhängen."};
  return tip[t]||"";
}

/* ---------------- speech (dictation) ---------------- */
let VOICE=null;
function initVoice(){try{const v=speechSynthesis.getVoices();VOICE=v.find(x=>/^de(-|_)DE/i.test(x.lang))||v.find(x=>/^de/i.test(x.lang))||null}catch(e){}}
try{initVoice();speechSynthesis.onvoiceschanged=initVoice}catch(e){}
const canSpeak=()=>{try{return "speechSynthesis" in window}catch(e){return false}};
function speak(t){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang="de-DE";if(VOICE)u.voice=VOICE;u.rate=0.85;speechSynthesis.speak(u)}catch(e){}}

/* ---------------- rendering helpers ---------------- */
const app=document.getElementById("app"),ov=document.getElementById("overlay");
function h(x){app.innerHTML=x;window.scrollTo(0,0)}
const elapsedMin=()=>SESS?(now()-SESS.start)/60000:0;
function sessBar(){const p=Math.min(100,elapsedMin()/SESSION_MIN*100);return `<div class="bar" aria-label="Trainingszeit"><i style="width:${p}%"></i></div>`}
let KP={};
function keypadHTML(kind){const slash=kind==="frac",comma=kind==="list";KP={val:"",allowSlash:slash,allowComma:comma};
  const ph=slash?"Bruch, z. B. 3/4":comma?"z. B. 1, 2, 3":"Deine Antwort";
  return `<div class="ansbox empty" id="ans" aria-live="polite">${ph}</div><div class="pad">${["7","8","9","⌫","4","5","6",slash?"/":comma?",":"","1","2","3","","0"].map(k=>k===""?"<span></span>":`<button type="button" data-k="${k}" class="${k==="/"||k===","?"sym":""}" aria-label="${k==="⌫"?"Löschen":k}">${k}</button>`).join("")}<button type="button" class="ok" data-k="ok" style="grid-column:span 3">Prüfen ✓</button></div>`}
function bindKeypad(onOk){const box=document.getElementById("ans"),ph=box.textContent;KP.onOk=onOk;
  const paint=()=>{if(!KP.val){box.className="ansbox empty";box.textContent=ph}else{box.className="ansbox";box.innerHTML=esc(KP.val)+'<span class="cursor"></span>'}};
  const press=k=>{if(k==="ok"){if(KP.val.trim())KP.onOk(KP.val.trim());return}
    if(k==="⌫")KP.val=KP.val.slice(0,-1);else if(k==="/"){if(KP.allowSlash&&KP.val&&!KP.val.includes("/"))KP.val+="/"}
    else if(k===","){if(KP.allowComma&&KP.val&&!/[, ]$/.test(KP.val))KP.val+=", "}else if(/\d/.test(k)&&KP.val.replace(/\D/g,"").length<14)KP.val+=k;paint()};
  app.querySelectorAll(".pad [data-k]").forEach(b=>b.onclick=()=>press(b.dataset.k));KP.press=press;paint()}
document.addEventListener("keydown",e=>{if(!document.getElementById("ans")||!KP.press||ov.innerHTML)return;
  if(/^\d$/.test(e.key))KP.press(e.key);else if(e.key==="Backspace")KP.press("⌫");else if(e.key==="Enter")KP.press("ok");else if(e.key==="/")KP.press("/");else if(e.key===","||e.key===" ")KP.press(",");else return;e.preventDefault()});
function showSheet(id,onClose){const k=SK[id];
  ov.innerHTML=`<div class="sheet" role="dialog" aria-label="Spickzettel"><div class="in"><div class="top"><span class="eyebrow">Spickzettel · ${esc(k.y)}</span><button class="btn ghost sm" id="sx">Schließen ✕</button></div>
  <h2>${esc(k.name)}</h2><div class="vocab">${esc(k.card.vocab)}</div>${k.sheet}</div></div>`;
  document.getElementById("sx").onclick=()=>{ov.innerHTML="";onClose&&onClose()}}
const passageHTML=p=>p?`<details class="passage" open><summary>${esc(p.title)}</summary><div class="ptext">${esc(p.text)}</div></details>`:"";
const optHTML=o=>/^\d+\/\d+$/.test(o)?frHTML(...o.split("/")):esc(o);

/* ---------------- day plan ---------------- */
function subjectToday(){
  if(S.forceSubj){const f=S.forceSubj;return f}
  if(S.lastDay===today()&&S.lastSubj)return S.lastSubj;
  return S.lastSubj==="D"?"M":"D";
}

/* =====================================================================
   SCREENS
   ===================================================================== */
function skillRow(id,cur,num){const s=sk(id),ic=s.st==="gold"?"🏆":s.st==="silver"?"🥈":num;
  const note=s.st==="learn"?`in Arbeit · ${s.hist.slice(-5).reduce((a,b)=>a+b,0)}/5`:s.st==="test"?"Schnelltest":s.st==="silver"?"Check morgen":s.st==="gold"&&s.due<=now()?"wiederholen":"";
  return `<div class="skill ${s.st==="gold"?"m":""} ${s.st==="silver"?"s":""} ${id===cur?"cur":""}"><span class="ic">${ic}</span><span class="nm">${esc(SK[id].name)}<small>${esc(SK[id].y)}${note?" · "+note:""}</small></span></div>`}
function screenHome(){
  SESS=null;const subj=subjectToday(),gold=ALL_IDS.filter(id=>sk(id).st==="gold").length,silver=ALL_IDS.filter(id=>sk(id).st==="silver").length;
  const tab=S.homeTab||subj;
  let mapHTML="";
  if(tab==="M"){const cur=currentSkill("M","B");mapHTML=ORDER_M.map((id,i)=>skillRow(id,cur,i+1)).join("")}
  else mapHTML=Object.keys(ORDER_D).map(tr=>{const cur=currentSkill("D",tr);return `<h4 class="trk">${TRACK_NAME[tr]}</h4>`+ORDER_D[tr].map((id,i)=>skillRow(id,cur,i+1)).join("")}).join("");
  const plan=subj==="M"?`Fast Math und Mathe: „${esc((SK[currentSkill("M","B")]||{name:"Wiederholen"}).name)}“`:`Fast Math und Deutsch: ${S.gerRot%2===0?"Grammatik + Rechtschreibung":"Lesen + Wortschatz"}`;
  h(`<div class="top"><span class="eyebrow">Otto lernt</span><span class="pill gold">🏆 ${gold} · 🥈 ${silver}</span></div>
  <div><h1>Hallo Otto! ⚽</h1><p class="muted">Heute ist <b>${SUBJ_NAME[subj]}-Tag</b>. 15 Minuten: Aufwärmen, ${plan}.</p></div>
  <button class="btn go" id="start">Training starten</button>
  <div class="card"><div class="top"><h3>Fast Math</h3><span class="pill teal">Rekord: ${S.fmBest} ⚽</span></div>
    ${SETS.map(s=>{const [m,t]=setProgress(s.id);return `<div><div class="top small"><span>${esc(s.name)}</span><span class="muted">${m}/${t}</span></div><div class="bar"><i style="width:${m/t*100}%"></i></div></div>`}).join("")}</div>
  <div class="card"><div class="top"><h3>Meine Karte</h3><div class="seg2"><button class="${tab==="M"?"on":""}" data-tab="M">Mathe</button><button class="${tab==="D"?"on":""}" data-tab="D">Deutsch</button></div></div>
    <p class="tiny muted">🥈 geschafft · 🏆 gefestigt (am nächsten Tag nochmal richtig)</p><div class="map">${mapHTML}</div></div>
  <div class="row" style="justify-content:center"><button class="linkish" id="papa">Für Papa</button></div>`);
  document.getElementById("start").onclick=startSession;document.getElementById("papa").onclick=screenPapa;
  app.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{S.homeTab=b.dataset.tab;save();screenHome()});
}

function startSession(){
  const subj=subjectToday();if(S.lastDay!==today()&&subj==="D")S.gerDays++;S.lastSubj=subj;S.lastDay=today();S.forceSubj=null;S.homeTab=null;S.sessions++;
  const d=new Date();SESS={id:`${today()}#${S.sessions}`,subj,start:now(),fmCount:0,fmGoals:0,fmRetry:[],fmRecent:[],lastOk:false,cnt:{},sub:0,paperDone:false,pair:S.gerRot%2===0?["G","R"]:["L","W"]};
  if(subj==="D")S.gerRot++;save();
  logRow({fertigkeit:"START",aufgabe:"v"+VERSION+" "+SUBJ_NAME[subj],antwort:"",richtig:"",sekunden:"",fehlertyp:""});
  SESS.warm=buildWarmup(subj);
  if(SESS.warm.length)screenMsg("🔁","Aufwärmen",`${SESS.warm.length} kurze Aufgaben – Wiederholung und Checks von gestern.`,nextWarm,"Los");
  else screenFastIntro();
}
function buildWarmup(subj){
  const other=subj==="M"?"D":"M",due=dueList(),list=due.slice(0,4).map(id=>({id,mode:"review"}));
  if(!list.some(x=>SK[x.id].subj===other)){
    const otherDone=ALL_IDS.filter(id=>SK[id].subj===other&&isDone(id));
    if(otherDone.length)list.push({id:pick(otherDone),mode:"mix"});
    else{const tr=other==="M"?"B":pick(["G","R"]),c=currentSkill(other,tr);if(c)list.push({id:c,mode:"contact"})}
  }
  return list;
}
function nextWarm(){
  if(!SESS.warm.length)return screenFastIntro();
  const w=SESS.warm.shift();
  runItem(w.id,w.mode,SK[w.id].gen(),res=>{
    const s=sk(w.id);
    if(w.mode==="review"){
      if(s.st==="silver"){res.clean?toGold(w.id):reopen(w.id)}
      else if(s.st==="gold"){if(res.clean){s.lvl=Math.min(s.lvl+1,REVIEW_DAYS.length-1);s.due=now()+REVIEW_DAYS[s.lvl]*DAY}else reopen(w.id)}
      save();
      if(s.st==="gold"&&res.clean&&s.lvl===0)return screenMsg("🏆",`${SK[w.id].name} – gefestigt!`,"Auch einen Tag später noch gewusst. Das sitzt jetzt richtig.",nextWarm);
    }else if(w.mode==="mix"&&!res.clean){s.due=now()}
    save();nextWarm();
  });
}

/* ---- Fast Math ---- */
function screenFastIntro(){const cs=currentSet();
  h(`${sessBar()}<div class="card"><p class="big">⚡⚽</p><h2>Fast Math – Elfmeterschießen</h2>
  <p>3 Minuten. Jede Aufgabe, die du <b>sofort weißt</b>, ist ein Tor. Nicht zählen – wissen!</p>
  <p class="muted small">Gerade dran: <b>${cs?esc(cs.name):"alles gemischt"}</b> · Dein Rekord: ${S.fmBest} Tore</p></div><button class="btn go" id="go">Anstoß</button>`);
  document.getElementById("go").onclick=()=>{SESS.fmEnd=now()+FAST_MATH_SEC*1000;fastNext()}}
function fastNext(flash){
  if(now()>=SESS.fmEnd)return fastEnd();
  const k=nextFact();SESS.fmRecent.push(k);if(SESS.fmRecent.length>3)SESS.fmRecent.shift();
  const f=FACTS[k],t0=now();SESS.fmCount++;const left=Math.max(0,Math.ceil((SESS.fmEnd-now())/1000));
  h(`${sessBar()}<div class="top"><span class="eyebrow">Fast Math</span><span class="pill teal">⏱ ${Math.floor(left/60)}:${String(left%60).padStart(2,"0")}</span><span class="pill gold">⚽ ${SESS.fmGoals}</span></div>
  <div class="card"><div class="fact">${f.q} = ?</div><div class="flash ${flash?flash.c:""}">${flash?flash.t:"&nbsp;"}</div>${keypadHTML("num")}</div>`);
  bindKeypad(v=>{const secs=(now()-t0)/1000,x=parseNum(v),ok=x===f.a,st=fstate(k);st.seen++;let fl,err="";
    if(ok&&secs<=FAST_S){st.fast++;if(!st.days.includes(today()))st.days.push(today());if(st.fast>=2&&st.days.length>=2)st.m=true;SESS.fmGoals++;fl={c:"goal",t:"⚽ Tor!"}}
    else if(ok){st.fast=0;fl={c:"slow",t:"✓ Richtig – das nächste Mal ohne Zählen"};err="langsam"}
    else{st.fast=0;st.m=false;st.wrong++;err=Math.abs(x-f.a)===1?"zaehlen":(f.t&&Math.abs(x-f.a)===f.t)?"reihe_daneben":"falsch";const tip=fmStrategy(f);fl={c:"miss",t:`✗ ${f.q} = ${f.a}${tip?`<br><span class="small">💡 ${esc(tip)}</span>`:""}`};SESS.fmRetry.push({k,after:SESS.fmCount+3})}
    save();logRow({fertigkeit:"FM/"+f.set,aufgabe:f.q.replace("·","x").replace("−","-"),antwort:v,richtig:ok?"1":"0",sekunden:secs.toFixed(1),fehlertyp:err});fastNext(fl)})}
function fastEnd(){const rec=SESS.fmGoals>S.fmBest;if(rec)S.fmBest=SESS.fmGoals;save();const cs=currentSet(),[m,t]=cs?setProgress(cs.id):[0,0];
  logRow({fertigkeit:"FM/ENDE",aufgabe:cs?cs.id:"",antwort:String(SESS.fmGoals),richtig:"",sekunden:String(FAST_MATH_SEC),fehlertyp:rec?"rekord":""});
  h(`${sessBar()}<div class="card"><p class="big">${rec?"🏆":"⚽"}</p><h2>${SESS.fmGoals} Tore${rec?" – neuer Rekord!":""}</h2>
  ${cs?`<p class="muted">${esc(cs.name)}: ${m} von ${t} sitzen (an zwei verschiedenen Tagen sofort gewusst).</p>`:"<p>Alle Reihen sitzen. Stark!</p>"}</div>
  <button class="btn go" id="go">Weiter: ${SUBJ_NAME[SESS.subj]}</button>`);
  document.getElementById("go").onclick=()=>{SESS.mainStart=now();mainLoop()}}

/* ---- Main block ---- */
function activeTrack(){if(SESS.subj==="M")return "B";
  const t0=(now()-SESS.mainStart)/60000;
  if(SESS.sub===0&&t0>=4.5&&SESS.lastOk){SESS.sub=1;SESS.switched=true}
  let tr=SESS.pair[SESS.sub];if(!currentSkill("D",tr))tr=SESS.pair[1-SESS.sub];if(!currentSkill("D",tr))tr=["G","R","W","L"].find(x=>currentSkill("D",x))||null;return tr}
function mainLoop(){
  const t=elapsedMin();
  if(t>=SESSION_CAP||(t>=SESSION_MIN&&SESS.lastOk))return finishSession();
  const tr=activeTrack();
  if(SESS.switched){SESS.switched=false;return screenMsg("🔄",`Jetzt: ${TRACK_NAME[tr]}`,"Halbzeit im Deutsch-Block. Weiter mit dem zweiten Teil.",mainLoop)}
  const id=tr?currentSkill(SESS.subj,tr):null;
  if(!id)return finishSession(true);
  const s=sk(id);
  if(s.st==="new"){s.st="test";s.testN=0;s.testOk=0;save();return screenMsg("🆕",SK[id].name,`Neues Level (${SK[id].y}). Schnelltest: 3 Fragen. Alle ohne Tipp richtig → sofort 🥈. Sonst lernen wir es zusammen.`,mainLoop,"Los")}
  if(s.st==="learn"&&!s.cardSeen){s.cardSeen=true;save();return screenCard(id)}
  if(s.st==="learn"&&!s.exSeen){s.exSeen=true;save();return screenExample(id)}
  const mode=s.st==="test"?"test":"learn";
  SESS.cnt[id]=(SESS.cnt[id]||0)+1;
  if(mode==="learn"&&SESS.cnt[id]%4===0){const m=mixCandidate(id);if(m)return runItem(m,"mix",SK[m].gen(),res=>{if(!res.clean)sk(m).due=now();SESS.lastOk=res.ok;save();mainLoop()})}
  runItem(id,mode,SK[id].gen(),res=>afterItem(id,mode,res));
}
function screenCard(id){const k=SK[id],c=k.card;
  h(`${sessBar()}<div class="card"><span class="eyebrow">Lernkarte · ${esc(k.y)}</span><h2>${esc(k.name)}</h2>${c.fig?`<div class="fig">${c.fig()}</div>`:""}
  <p style="font-weight:700">${esc(c.rule)}</p><div class="ex">${esc(c.ex).replace(/\n/g,"<br>")}</div><div class="vocab">${esc(c.vocab)}</div></div>
  <div class="row"><button class="btn ghost" id="more">Mehr erklären 📄</button><button class="btn go" id="go">Verstanden</button></div>`);
  document.getElementById("go").onclick=mainLoop;document.getElementById("more").onclick=()=>showSheet(id)}
function screenExample(id){const it=SK[id].gen();
  let ans="";if(it.kind==="mc"||it.kind==="listen")ans=it.solText;else if(it.kind==="tap")ans=it.solText;
  h(`${sessBar()}<div class="card"><span class="eyebrow">Musteraufgabe – erst anschauen</span>${passageHTML(it.passage)}${it.fig?`<div class="fig">${it.fig}</div>`:""}
  <p class="q">${it.prompt}</p>${it.kind==="tap"?`<p class="sent">${(it.display||it.tokens).join(" ").replace(/ ([.,])/g,"$1")}</p>`:""}
  <div class="fb sol"><strong>So wird's gemacht:</strong><p>${it.sol}</p></div></div>
  <button class="btn go" id="go">Jetzt du</button>`);document.getElementById("go").onclick=mainLoop}
function afterItem(id,mode,res){
  const s=sk(id);s.n++;if(res.ok)s.ok++;s.last=now();SESS.lastOk=res.ok;
  if(mode==="test"){
    if(!res.clean){s.st="learn";s.hist=[];s.cardSeen=false;s.exSeen=false;save();return screenMsg("💡","Das lernen wir jetzt",`„${SK[id].name}“ schauen wir uns Schritt für Schritt an: Lernkarte, Musteraufgabe, dann du.`,mainLoop)}
    s.testN++;if(s.testN>=3){toSilver(id);save();return screenSilver(id,true)}save();return mainLoop();
  }
  s.hist.push(res.clean?1:0);if(s.hist.length>12)s.hist=s.hist.slice(-12);
  const last5=s.hist.slice(-5);
  if(s.hist.length>=5&&last5.reduce((a,b)=>a+b,0)>=4){toSilver(id);save();return screenSilver(id,false)}
  if(res.routedTo){save();return screenMsg("🧭","Kurzer Umweg",`Dafür brauchst du „${SK[res.routedTo].name}“. Das trainieren wir kurz – dann geht es zurück.`,mainLoop)}
  const a=adapt(id);
  if(a&&a.route){save();return screenMsg("🧭","Kurzer Umweg",`Wir festigen erst „${SK[a.route].name}“. Danach geht es mit „${SK[id].name}“ weiter.`,mainLoop)}
  if(a&&a.reteach){save();return screenMsg("💡","Nochmal von vorn erklärt","Das ist gerade schwer – kein Problem. Wir schauen uns Lernkarte und Musteraufgabe nochmal an.",mainLoop)}
  save();mainLoop();
}
function screenSilver(id,test){const g=ALL_IDS.filter(x=>sk(x).st==="gold").length,sv=ALL_IDS.filter(x=>sk(x).st==="silver").length;
  h(`${sessBar()}<div class="card"><p class="big">🥈</p><h2>${esc(SK[id].name)} – geschafft!</h2>
  <p>${test?"Im Schnelltest alles richtig – das konntest du schon!":"4 von 5 richtig, ohne Tipp."} Morgen kommt ein kurzer Check. Weißt du es dann noch, wird es 🏆.</p>
  <p class="muted small">🏆 ${g} · 🥈 ${sv}</p></div><button class="btn go" id="go">Weiter</button>`);document.getElementById("go").onclick=mainLoop}
function screenMsg(icon,title,text,next,btn){h(`${sessBar()}<div class="card"><p class="big">${icon}</p><h2>${esc(title)}</h2><p>${esc(text)}</p></div><button class="btn go" id="go">${btn||"Weiter"}</button>`);document.getElementById("go").onclick=next}

/* ---- generic item runner ---- */
function runItem(id,mode,item,done){
  let attempt=1,hinted=false,t0=now(),errFirst=null;
  const twoTries=mode==="learn"||mode==="test"||mode==="contact";
  const label=({review:sk(id).st==="silver"?"Check von gestern":"Wiederholung",test:`Schnelltest ${sk(id).testN+1}/3`,learn:`Üben · ${sk(id).hist.slice(-5).reduce((a,b)=>a+b,0)}/5`,mix:"Mix",contact:SUBJ_NAME[SK[id].subj]+" zwischendurch"})[mode];
  const head=()=>`${sessBar()}<div class="top"><span class="eyebrow nocaps">${esc(SK[id].name)}</span><span class="pill">${esc(label)}</span></div>`;
  window.__lastItem=item;
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
    const say=document.getElementById("say");if(say)say.onclick=()=>speak(item.speak);
    if(item.kind==="mc"||item.kind==="listen"){let sel=null;const ok=document.getElementById("okmc");
      app.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{app.querySelectorAll("[data-o]").forEach(x=>{x.classList.remove("sel");x.setAttribute("aria-checked","false")});b.classList.add("sel");b.setAttribute("aria-checked","true");sel=+b.dataset.o;ok.disabled=false});
      ok.onclick=()=>{if(sel!==null)submit(sel,item.opts[sel])}}
    else if(item.kind==="tap"){const sel=new Set();app.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{const i=+b.dataset.t;sel.has(i)?sel.delete(i):sel.add(i);b.classList.toggle("on",sel.has(i))});
      document.getElementById("oktap").onclick=()=>submit(sel,[...sel].sort((a,b)=>a-b).map(i=>item.tokens[i]).join(" ")||"(nichts)")}
    else if(item.kind==="shade"){const sh=new Set();const paint=()=>{document.querySelectorAll("#shade .seg").forEach(r=>r.setAttribute("fill",sh.has(+r.dataset.i)?C.on:C.off));document.getElementById("cnt").textContent=sh.size};
      document.querySelectorAll("#shade .seg").forEach(r=>r.addEventListener("click",()=>{const i=+r.dataset.i;sh.has(i)?sh.delete(i):sh.add(i);paint()}));document.getElementById("okshade").onclick=()=>submit(sh.size,`${sh.size} Teile`)}
    else bindKeypad(v=>submit(v,v));
  }
  function submit(val,shown){
    const ok=!!item.check(val),secs=((now()-t0)/1000).toFixed(1),err=ok?null:(item.classify(val)||"falsch");
    logRow({fertigkeit:`${id}/${mode}`,aufgabe:strip(item.prompt).slice(0,160),antwort:String(shown),richtig:ok?"1":"0",sekunden:secs,fehlertyp:ok?(hinted?"tipp":""):err});
    if(ok){let clean=attempt===1&&!hinted;
      const m=SK[id].method&&clean&&(mode==="learn"||mode==="test")&&Math.random()<0.4?SK[id].method(item):null;
      if(m)return methodCheck(m,clean=>finishOk(clean));
      return finishOk(clean);
    }
    if(attempt===1&&twoTries){attempt=2;hinted=true;errFirst=err;t0=now();
      return view(`<div class="fb err"><strong>Noch nicht.</strong><p>${esc(ERR[err]||ERR.falsch)}</p></div><div class="hint">💡 ${esc(item.hint)}</div><p class="small muted">Versuch es nochmal.</p>`)}
    const routedTo=mode==="learn"?maybeRoute(id,errFirst||err):null;
    finish({ok:false,clean:false,routedTo},`<div class="fb sol"><strong>So geht's:</strong><p>${item.sol}</p>${mode!=="review"&&ERR[err]&&err!=="falsch"?`<p class="small">${esc(ERR[err])}</p>`:""}<p class="small muted">Jetzt kennst du den Weg – gleich kommt eine ähnliche Aufgabe.</p></div>`);
  }
  function finishOk(clean,detour){const praise=pick(["Richtig! 💪","Stark!","Genau so!","Volltreffer! ⚽","Sauber!"]);
    finish({ok:true,clean},`<div class="fb ok"><strong>${praise}</strong><p>${item.sol}</p>${!clean?`<p class="small muted">${attempt>1?"Im zweiten Versuch geschafft – zählt noch nicht für 🥈. Gleich kommt eine ähnliche Aufgabe.":"Mit Tipp oder Umweg geschafft – zählt noch nicht für 🥈."}</p>`:""}</div>`)}
  function methodCheck(m,cb){
    h(`${head()}<div class="card"><p class="q">${esc(m.q)}</p><div class="opts">${m.o.map((o,i)=>`<button class="opt" data-m="${i}">${esc(o[0])}</button>`).join("")}</div><p class="muted small">Ehrlich antworten – jeder Weg ist okay.</p></div>`);
    app.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{const o=m.o[+b.dataset.m],det=o[1]===1;
      logRow({fertigkeit:`${id}/weg`,aufgabe:m.q,antwort:o[0],richtig:det?"0":"1",sekunden:"",fehlertyp:det?"umweg":""});cb(!det)})}
  function finish(res,fbHTML){
    h(`${head()}<div class="card">${passageHTML(item.passage)}${item.fig&&item.kind!=="shade"?`<div class="fig">${item.fig}</div>`:""}<p class="q">${item.prompt}</p>${fbHTML}</div><button class="btn go" id="next">Weiter</button>`);
    const n=document.getElementById("next");n.onclick=()=>done(res);n.focus()}
  view();
}

/* ---- end, paper task ---- */
function finishSession(allDone){
  if(SESS.subj==="D"&&S.gerDays%3===0&&!SESS.paperDone){SESS.paperDone=true;return screenPaper()}
  screenEnd(allDone);
}
function screenPaper(){const p=paperTask();
  h(`${sessBar()}<div class="card"><span class="eyebrow">Papier-Aufgabe</span><h2>${esc(p.title)}</h2><p class="small"><b>Regel:</b> ${esc(p.rule)}</p>
  <p class="small">Nimm ein Blatt. Schreib die Nummern <b>1 bis ${p.sol.length}</b> untereinander und daneben jeweils das <b>vollständige Wort</b>. Steht etwas in Klammern, ist das dein Hinweis.</p>
  <div class="paper">${p.html}</div></div><button class="btn go" id="go">Fertig geschrieben – Lösung zeigen</button><button class="btn ghost" id="skip">Heute überspringen</button>`);
  document.getElementById("skip").onclick=()=>{logRow({fertigkeit:"PAPIER",aufgabe:p.title,antwort:"übersprungen",richtig:"",sekunden:"",fehlertyp:""});screenEnd()};
  document.getElementById("go").onclick=()=>{
    h(`<div class="card"><h2>Vergleiche mit deinem Blatt</h2><p class="small">Tippe jede Nummer an, die du <b>richtig</b> hast.</p>
    <div class="map">${p.full.map((w,i)=>`<button class="chip wide" data-p="${i}"><b>(${i+1})</b> ${esc(w)}</button>`).join("")}</div></div><button class="btn go" id="save">Speichern</button>`);
    const ok=new Set();app.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{const i=+b.dataset.p;ok.has(i)?ok.delete(i):ok.add(i);b.classList.toggle("on",ok.has(i))});
    document.getElementById("save").onclick=()=>{const wrong=p.full.map((w,i)=>ok.has(i)?null:`(${i+1}) ${w}`).filter(Boolean);
      logRow({fertigkeit:"PAPIER",aufgabe:`${p.title} – ${p.rule}`,antwort:`${ok.size}/${p.sol.length}`,richtig:ok.size===p.sol.length?"1":"0",sekunden:"",fehlertyp:wrong.join("; ")});
      screenMsg(ok.size>=p.sol.length-1?"📝":"✍️",`${ok.size} von ${p.sol.length} richtig`,wrong.length?`Schau dir diese nochmal an: ${wrong.join(", ")}.`:"Alles richtig – auf Papier und mit der Hand. Stark!",()=>screenEnd())}}}
function screenEnd(allDone){
  const t=Math.round(elapsedMin()),g=ALL_IDS.filter(x=>sk(x).st==="gold").length,sv=ALL_IDS.filter(x=>sk(x).st==="silver").length;
  logRow({fertigkeit:"ENDE",aufgabe:`${t} min ${SUBJ_NAME[SESS.subj]}`,antwort:`Gold ${g} Silber ${sv}`,richtig:"",sekunden:String(t*60),fehlertyp:""});
  const nextSubj=SESS.subj==="M"?"Deutsch":"Mathe";
  h(`<div class="card"><p class="big">${allDone?"🏆🏆🏆":"🙌"}</p><h2>${allDone?`Alle ${SUBJ_NAME[SESS.subj]}-Level dieser Version geschafft!`:"Training für heute fertig!"}</h2>
  <p>${t} Minuten. ${SESS.fmGoals} Tore im Fast Math. 🏆 ${g} · 🥈 ${sv}</p><p class="muted">Morgen ist <b>${nextSubj}-Tag</b>.</p>
  <p class="muted small">Papa sieht deinen Fortschritt automatisch – du musst nichts schicken.</p></div><button class="btn go" id="home">Zur Übersicht</button>`);
  document.getElementById("home").onclick=screenHome}

/* ---- Papa view ---- */
function screenPapa(){
  const L={new:"neu",test:"Schnelltest",learn:"in Arbeit",silver:"🥈 geschafft",gold:"🏆 gefestigt"};
  const rows=ids=>ids.map(id=>{const s=sk(id);return `<tr><td>${id}</td><td>${esc(SK[id].name)}</td><td>${L[s.st]||s.st}</td><td>${s.n?Math.round(s.ok/s.n*100)+"% ("+s.n+")":"–"}</td><td>${isDone(id)?new Date(s.due).toLocaleDateString("de-DE"):s.st==="learn"?s.hist.slice(-5).join(""):""}</td></tr>`}).join("");
  const tbl=(t,ids)=>`<h4 class="trk">${t}</h4><div class="tblwrap"><table><thead><tr><th>ID</th><th>Level</th><th>Status</th><th>Treffer</th><th>Fällig / letzte 5</th></tr></thead><tbody>${rows(ids)}</tbody></table></div>`;
  const slow=Object.keys(S.facts).filter(k=>FACTS[k]&&!S.facts[k].m&&S.facts[k].seen>=2).sort((a,b)=>S.facts[b].wrong-S.facts[a].wrong).slice(0,12).map(k=>FACTS[k].q);
  h(`<div class="top"><span class="eyebrow">Für Papa</span><button class="btn ghost sm" id="back">← Zurück</button></div>
  <div class="card"><h3>Plan</h3><p class="small">Nächste Sitzung: <b>${SUBJ_NAME[subjectToday()]}</b> · ${S.sessions} Sitzungen bisher · Deutsch-Tage: ${S.gerDays}</p>
   <button class="btn ghost sm" id="flip">Nächste Sitzung: stattdessen ${SUBJ_NAME[subjectToday()==="M"?"D":"M"]}</button></div>
  <div class="card"><h3>Mathe</h3>${tbl("Level",ORDER_M)}</div>
  <div class="card"><h3>Deutsch</h3>${Object.keys(ORDER_D).map(tr=>tbl(TRACK_NAME[tr],ORDER_D[tr])).join("")}</div>
  <div class="card"><h3>Fast Math</h3>${SETS.map(s=>{const [m,t]=setProgress(s.id);return `<p class="small">${s.id} ${esc(s.name)}: <b>${m}/${t}</b></p>`}).join("")}
   <p class="small">Noch nicht abgerufen (meist falsch): ${slow.length?slow.map(esc).join(" · "):"–"}</p><p class="small muted">Rekord ${S.fmBest} Tore</p></div>
  <div class="card"><h3>Synchronisierung</h3><p class="small">Wartend: <b>${S.queue.length}</b> Zeilen · zuletzt gesendet: ${S.lastSync?new Date(S.lastSync).toLocaleString("de-DE"):"noch nie"}${S.syncError?` · letzter Fehler: ${new Date(S.syncError).toLocaleString("de-DE")}`:""}</p>
   <p class="small muted">Wenn „Wartend“ wächst, blockiert das Netz (z. B. Schulfilter) docs.google.com.</p><button class="btn ghost sm" id="sync">Jetzt senden</button></div>
  <div class="card"><h3>Sicherung</h3><p class="small muted">Code kopieren und aufheben. Auf einem neuen Gerät hier einfügen und „Wiederherstellen“ tippen.</p>
   <textarea id="code" aria-label="Sicherungscode"></textarea><div class="row"><button class="btn ghost sm" id="exp">Code erzeugen</button><button class="btn ghost sm" id="imp">Wiederherstellen</button></div><p class="small" id="msg"></p></div>
  <p class="tiny muted" style="text-align:center">Version ${VERSION}</p>`);
  document.getElementById("back").onclick=screenHome;
  document.getElementById("flip").onclick=()=>{S.forceSubj=subjectToday()==="M"?"D":"M";save();screenPapa()};
  document.getElementById("sync").onclick=()=>flush().then(screenPapa);
  document.getElementById("exp").onclick=()=>{document.getElementById("code").value=btoa(unescape(encodeURIComponent(JSON.stringify({...S,queue:[]}))));document.getElementById("msg").textContent="Code erzeugt – kopieren und aufheben."};
  document.getElementById("imp").onclick=()=>{const m=document.getElementById("msg"),b=document.getElementById("imp");
    try{const o=JSON.parse(decodeURIComponent(escape(atob(document.getElementById("code").value.trim()))));if(!o.skills)throw 0;
      if(!b.dataset.sure){b.dataset.sure="1";b.textContent="Sicher? Ersetzt den aktuellen Stand";return}S=migrate(o);S.queue=[];save();m.textContent="Wiederhergestellt ✓";setTimeout(screenHome,700)}catch(e){m.textContent="Der Code ist ungültig."}};
}

/* ---- boot ---- */
window.__otto={S:()=>S,SK,FACTS,ALL_IDS,ORDER_D,ORDER_M,paperTask,TEXTE};
screenHome();flush();
