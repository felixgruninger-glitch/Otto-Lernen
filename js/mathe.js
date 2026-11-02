"use strict";
/* Otto lernt – Mathematik: Fast-Math-Fakten (Spur A) und Level B1–B9 */
/* =====================================================================
   FAST MATH FACTS (Spur A)
   ===================================================================== */
function buildFacts(){
  const F={};
  for(let a=2;a<=9;a++)for(let b=2;b<=9;b++)if(a+b>10){F[`A1:${a}+${b}`]={set:"A1",q:`${a} + ${b}`,a:a+b};F[`A1:${a+b}-${b}`]={set:"A1",q:`${a+b} − ${b}`,a:a}}
  const mul=(set,tabs)=>{for(const t of tabs)for(let m=1;m<=10;m++){const swap=m%2===0;F[`${set}:${t}x${m}`]={set,q:swap?`${m} · ${t}`:`${t} · ${m}`,a:t*m,t}}};
  mul("A2",[2,5,10]);mul("A3",[3,4]);mul("A4",[6,7,8,9]);
  for(let t=2;t<=9;t++)for(let m=2;m<=10;m++)F[`A5:${t*m}:${t}`]={set:"A5",q:`${t*m} : ${t}`,a:m,t};
  return F;
}
const FACTS=buildFacts();
const SETS=[
  {id:"A1",name:"Plus/Minus über den Zehner",y:"Kl. 1–2"},
  {id:"A2",name:"Einmaleins 2, 5, 10",y:"Kl. 2"},
  {id:"A3",name:"Einmaleins 3, 4",y:"Kl. 2"},
  {id:"A4",name:"Einmaleins 6, 7, 8, 9",y:"Kl. 2–3"},
  {id:"A5",name:"Geteilt-Aufgaben",y:"Kl. 3"}
];

/* =====================================================================
   SKILLS (Spur B) — generators, cards, cheat sheets
   Each gen() returns an item:
   {kind:'num'|'frac'|'list'|'mc'|'shade', prompt, fig, opts, n,
    check(ans)->bool, classify(ans)->errKey|null, hint, sol, solText}
   ===================================================================== */
const ORDER_M=["B1","B3","B4","B5","B6","B7","B2","B8","B9"];

SK.B1={name:"Gerecht verteilen",y:"Kl. 3",pre:[],
  card:{rule:"Teilen heißt gerecht verteilen. Frag dich: Welche Zahl mal … ergibt das Ganze?",fig:()=>svgGroups(12,3),
    ex:"12 : 3 = 4 → 12 Bälle, 3 Teams, jedes bekommt 4. Probe: 3 · 4 = 12",vocab:"teilen · dividir · to divide"},
  sheet:`<p>Beim <b>Teilen</b> verteilst du etwas gerecht, so dass alle gleich viel bekommen.</p>
   <div class="ex">24 Spieler, 4 Teams → 24 : 4 = 6 Spieler pro Team<br>Probe: 4 · 6 = 24 ✓</div>
   <p>Es gibt zwei Fragen, beide sind Teilen:</p>
   <ul class="clean"><li><b>Wie viele bekommt jeder?</b> 20 Bälle auf 5 Kinder → 20 : 5 = 4</li><li><b>Wie viele Gruppen?</b> 20 Spieler, je 5 pro Team → 20 : 5 = 4 Teams</li></ul>
   <p><b>Trick:</b> Teilen ist Einmaleins rückwärts. Für 42 : 7 frag: „7 mal wie viel ist 42?“ → 6.</p>
   <p class="muted small">Typischer Fehler: mal rechnen statt teilen. Wenn das Ergebnis größer ist als das Ganze, stimmt etwas nicht.</p>`,
  gen(){const b=rnd(2,9),q=rnd(2,10),t=b*q,v=rnd(1,2);
    const prompt=v===1?`<b>${t} Bälle</b> werden gerecht auf <b>${b} Teams</b> verteilt. Wie viele Bälle bekommt jedes Team?`
                     :`<b>${t} Spieler</b> bilden Teams mit je <b>${q} Spielern</b>. Wie viele Teams gibt es?`;
    const ans=v===1?q:b,div=v===1?b:q;
    return{kind:"num",prompt,check:a=>parseNum(a)===ans,
      classify:a=>{const x=parseNum(a);if(isNaN(x))return"format";if(x===t*div)return"mal_statt_geteilt";if(x===t-div)return"minus_statt_geteilt";if(Math.abs(x-ans)===1)return"zaehlen";return null},
      hint:`Welche Zahl mal ${div} ergibt ${t}? Denk an die ${div}er-Reihe.`,
      sol:`${t} : ${div} = <b>${ans}</b>, denn ${div} · ${ans} = ${t}.`,solText:String(ans)}}
};

SK.B3={name:"Bruch als Teil eines Ganzen",y:"Kl. 6",pre:[],
  card:{rule:"Der Nenner (unten) sagt, in wie viele gleiche Teile das Ganze geteilt ist. Der Zähler (oben) sagt, wie viele Teile du nimmst.",fig:()=>svgBar(8,3,{label:"3 von 8 Teilen sind grün → 3/8"}),
    ex:"3/8 → 3 Teile genommen, 8 Teile insgesamt",vocab:"der Zähler · el numerador · numerator   |   der Nenner · el denominador · denominator"},
  sheet:`<p>Ein <b>Bruch</b> beschreibt einen Teil von einem Ganzen.</p>
   <div class="fig">${svgBar(5,2)}</div>
   <div class="ex">Der Streifen hat 5 gleiche Teile. 2 sind grün → ${frHTML(2,5)}</div>
   <ul class="clean"><li><b>Nenner</b> (unten): in wie viele <b>gleiche</b> Teile das Ganze geteilt ist. Hier 5.</li><li><b>Zähler</b> (oben): wie viele davon gemeint sind. Hier 2.</li><li>Der Bruchstrich bedeutet „von“: 2 von 5.</li></ul>
   <p class="muted small">Typischer Fehler: unten nur die übrigen Teile zählen (2/3 statt 2/5). Unten steht immer ALLES.</p>`,
  gen(){const n=rnd(3,10),k=rnd(1,n-1),v=rnd(1,3);
    if(v===2){return{kind:"shade",n,prompt:`Tippe Teile an, bis <b>${frHTML(k,n)}</b> des Streifens grün ist.`,
      check:a=>a===k,classify:a=>a===n-k?"gegenteil":null,hint:`Der Streifen hat ${n} Teile. Du brauchst ${k} davon.`,
      sol:`${frHTML(k,n)} heißt: ${k} von ${n} Teilen. Also genau <b>${k}</b> Teile grün.`,solText:`${k} Teile`}}
    const not=v===3,a=not?n-k:k;
    return{kind:"frac",fig:svgBar(n,k),prompt:not?`Welcher Bruch des Streifens ist <b>nicht</b> grün?`:`Welcher Bruch des Streifens ist <b>grün</b>?`,
      check:x=>{const f=parseFrac(x);return!!f&&f[1]!==0&&f[0]*n===a*f[1]},
      classify:x=>{const f=parseFrac(x);if(!f)return"format";if(f[0]===a&&f[1]===n-a)return"teil_statt_ganzes";if(f[0]===n&&f[1]===a)return"vertauscht";if(f[0]===n-a&&f[1]===n)return"gegenteil";return null},
      hint:`Zähle zuerst ALLE Teile (das kommt unten hin). Dann die ${not?"nicht grünen":"grünen"} (das kommt oben hin).`,
      sol:`Insgesamt ${n} Teile, davon ${a} ${not?"nicht grün":"grün"} → ${frHTML(a,n)}`,solText:fr(a,n)}}
};

SK.B4={name:"Bruch als Anteil einer Menge",y:"Kl. 6",pre:["B3"],
  card:{rule:"Anteil = Teil durch Ganzes. Unten steht immer ALLES (alle Spiele, alle Schüsse), oben der Teil, nach dem gefragt ist.",fig:()=>svgBalls(6,4),
    ex:"4 von 6 Spielen gewonnen → 4/6 (gekürzt 2/3)",vocab:"der Anteil · la proporción · proportion / share"},
  sheet:`<p>Ein Bruch kann auch einen <b>Anteil von Dingen</b> beschreiben: Spiele, Spieler, Schüsse.</p>
   <div class="fig">${svgBalls(6,4)}</div>
   <div class="ex">6 Spiele, 4 gewonnen → Anteil der Siege = ${frHTML(4,6)}<br>verloren: 2 von 6 → ${frHTML(2,6)}</div>
   <ul class="clean"><li>Frag dich: <b>Was ist das Ganze?</b> Das kommt unten hin.</li><li><b>Welcher Teil ist gefragt?</b> Das kommt oben hin.</li><li>Gleichwertige Brüche sind auch richtig: 4/6 = 2/3.</li></ul>
   <p class="muted small">Typischer Fehler: gewonnene mit verlorenen vergleichen (4/2). Das ist kein Anteil – unten muss das Ganze stehen.</p>`,
  gen(){const n=rnd(4,12),k=rnd(1,n-1),c=rnd(1,3);
    const ctx=[[`Aravaca hat <b>${n} Spiele</b> gespielt und <b>${k}</b> davon gewonnen.`,"Welcher Anteil der Spiele wurde gewonnen?","Welcher Anteil der Spiele wurde <b>nicht</b> gewonnen?"],
      [`Marco schoss <b>${n}-mal</b> aufs Tor und traf <b>${k}-mal</b>.`,"Welcher Anteil der Schüsse war ein Tor?","Welcher Anteil der Schüsse ging <b>daneben</b>?"],
      [`Im Kader sind <b>${n} Spieler</b>, <b>${k}</b> davon sind Linksfüßer.`,"Welcher Anteil sind Linksfüßer?","Welcher Anteil sind <b>keine</b> Linksfüßer?"]][c-1];
    const inv=Math.random()<0.3,a=inv?n-k:k;
    return{kind:"frac",fig:svgBalls(n,k),prompt:`${ctx[0]} ${inv?ctx[2]:ctx[1]}`,
      check:x=>{const f=parseFrac(x);return!!f&&f[1]!==0&&f[0]*n===a*f[1]},
      classify:x=>{const f=parseFrac(x);if(!f)return"format";if(f[1]!==0&&f[0]*(n-a)===a*f[1])return"teil_statt_ganzes";if(f[1]!==0&&f[0]*n===(n-a)*f[1])return"gegenteil";if(f[0]===n&&f[1]===a)return"vertauscht";return null},
      hint:`Das Ganze sind ${n}. Das kommt nach unten. Wie viele sind gefragt? Das kommt nach oben.`,
      sol:`${a} von ${n} → ${frHTML(a,n)}${gcd(a,n)>1?` (gekürzt ${frHTML(a/gcd(a,n),n/gcd(a,n))})`:""}`,solText:fr(a,n)}}
};

SK.B5={name:"Bruchteil von Größen",y:"Kl. 6",pre:["B1","B4"],
  card:{rule:"Erst durch den Nenner teilen (ein Teil), dann mal den Zähler (so viele Teile).",fig:()=>svgBar(4,3,{label:"20 Spieler in 4 Teile → je 5 · 3 Teile = 15"}),
    ex:"3/4 von 20 → 20 : 4 = 5 → 5 · 3 = 15",vocab:"der Bruchteil · la fracción de · fraction of"},
  sheet:`<p>„3/4 von 20“ heißt: Teile 20 in 4 gleiche Teile und nimm 3 davon.</p>
   <div class="ex">Schritt 1: 20 : 4 = 5 (ein Viertel)<br>Schritt 2: 5 · 3 = 15 (drei Viertel)</div>
   <ul class="clean"><li>Eine Viertelstunde: 60 min : 4 = 15 min</li><li>2/3 von 90 min: 90 : 3 = 30 → 30 · 2 = 60 min</li></ul>
   <p class="muted small">Typischer Fehler: nach Schritt 1 aufhören. 20 : 4 = 5 ist erst <b>ein</b> Viertel.</p>`,
  gen(){const opts=[[2,[1]],[3,[1,2]],[4,[1,3]],[5,[1,2,3,4]],[6,[1,5]],[8,[1,3,5,7]],[10,[1,3,7,9]]];
    const [n,ks]=pick(opts),k=pick(ks),c=rnd(1,3);let u,unit,ctx;
    if(c===2&&60%n===0){u=60/n;unit="Minuten";ctx=`Ein Training dauert <b>60 Minuten</b>. Wie viele Minuten sind <b>${frHTML(k,n)}</b> davon?`}
    else if(c===3){u=rnd(2,10);unit="€";ctx=`Ein Trikot kostet <b>${n*u} €</b>. Im Sale gibt es <b>${frHTML(k,n)}</b> des Preises zurück. Wie viel Euro sind das?`}
    else{u=rnd(2,6);unit="Spieler";ctx=`Im Verein sind <b>${n*u} Spieler</b>. <b>${frHTML(k,n)}</b> davon fahren zum Turnier. Wie viele Spieler sind das?`}
    const t=n*u,ans=u*k;
    return{kind:"num",prompt:ctx,check:a=>parseNum(a)===ans,
      classify:a=>{const x=parseNum(a);if(isNaN(x))return"format";if(k>1&&x===u)return"nur_ein_teil";if(Math.abs(x-ans)===1)return"zaehlen";if(x===t*k||x===Math.round(t/k))return"falsch_geteilt";return null},
      hint:`Schritt 1: ${t} : ${n} = ? (ein Teil). Schritt 2: mal ${k}.`,
      sol:`${t} : ${n} = ${u} → ${u} · ${k} = <b>${ans}</b> ${unit}`,solText:String(ans)}}
};

SK.B6={name:"Gleichwertige Brüche sehen",y:"Kl. 6",pre:["B3"],
  card:{rule:"Gleich viel – nur feiner geschnitten. Wird jedes Stück in 2 geteilt, verdoppeln sich Zähler UND Nenner.",fig:()=>svgTwoBars(2,1,8,4),
    ex:"1/2 = 2/4 = 4/8",vocab:"gleichwertig · equivalente · equivalent"},
  sheet:`<p>Zwei Brüche sind <b>gleichwertig</b>, wenn sie gleich viel vom Ganzen zeigen.</p>
   <div class="fig">${svgTwoBars(3,2,6,4)}</div>
   <div class="ex">Oben ${frHTML(2,3)}, unten ${frHTML(4,6)} – gleich lang grün!</div>
   <ul class="clean"><li>Jedes Stück wurde in 2 geteilt → doppelt so viele Stücke (Nenner · 2) und doppelt so viele grüne (Zähler · 2).</li><li>Es wird immer <b>mal</b> genommen, nie plus.</li></ul>
   <p class="muted small">Typischer Fehler: 1/2 = 7/8, weil man oben und unten 6 addiert. Plus verändert den Wert!</p>`,
  gen(){const b=rnd(2,6),a=rnd(1,b-1),f=rnd(2,4),N=b*f;
    if(Math.random()<0.6){return{kind:"num",fig:svgTwoBars(b,a,N,0),prompt:`Oben siehst du ${frHTML(a,b)}. Der untere Streifen hat ${N} Teile. Ergänze: ${frHTML(a,b)} = ${frHTML("?",N)}`,
      check:x=>parseNum(x)===a*f,classify:x=>{const v=parseNum(x);if(isNaN(v))return"format";if(v===a+(N-b))return"addiert_statt_mal";return null},
      hint:`Jedes Stück oben wurde in ${f} kleine Stücke geteilt. Wie viele kleine Stücke sind dann grün?`,
      sol:`${b} · ${f} = ${N}, also auch ${a} · ${f} = <b>${a*f}</b> → ${frHTML(a,b)} = ${frHTML(a*f,N)}`,solText:String(a*f)}}
    const ok=fr(a*f,b*f),o=shuffle([ok,fr(a+f,b+f),fr(a*f,b),fr(a,b*f)]).filter((v,i,s)=>s.indexOf(v)===i);
    return{kind:"mc",prompt:`Welcher Bruch ist <b>gleich viel</b> wie ${frHTML(a,b)}?`,opts:o,
      check:i=>o[i]===ok,classify:i=>{const v=o[i];if(v===fr(a+f,b+f))return"addiert_statt_mal";if(v===fr(a*f,b))return"nur_oben";if(v===fr(a,b*f))return"nur_unten";return null},
      hint:"Gleichwertig heißt: oben UND unten mit derselben Zahl mal.",sol:`${frHTML(a,b)} = ${frHTML(a*f,b*f)} (oben und unten · ${f})`,solText:ok}}
};

SK.B7={name:"Erweitern",y:"Kl. 6",pre:["B6"],
  card:{rule:"Erweitern: Zähler UND Nenner mit derselben Zahl mal nehmen. Der Wert bleibt gleich.",fig:()=>svgTwoBars(3,2,12,8),
    ex:"2/3 erweitert mit 4 → 8/12",vocab:"erweitern · amplificar · to expand"},
  sheet:`<p><b>Erweitern</b> heißt: oben und unten mit derselben Zahl malnehmen.</p>
   <div class="ex">${frHTML(3,5)} mit 4 erweitern → ${frHTML("3·4","5·4")} = ${frHTML(12,20)}</div>
   <ul class="clean"><li>Wozu? Um Brüche auf den <b>gleichen Nenner</b> zu bringen – zum Vergleichen und Addieren.</li><li>Fehlende Zahl finden: ${frHTML(3,4)} = ${frHTML("?",20)} → 4 · <b>5</b> = 20, also 3 · 5 = 15.</li></ul>
   <p class="muted small">Typische Fehler: nur oben oder nur unten malnehmen – oder plus statt mal.</p>`,
  gen(){const b=rnd(2,9),a=rnd(1,b-1),f=rnd(2,6),v=rnd(1,3);
    if(v===1)return{kind:"frac",prompt:`Erweitere ${frHTML(a,b)} mit <b>${f}</b>.`,
      check:x=>{const p=parseFrac(x);return!!p&&p[0]===a*f&&p[1]===b*f},
      classify:x=>{const p=parseFrac(x);if(!p)return"format";if(p[0]===a*f&&p[1]===b)return"nur_oben";if(p[0]===a&&p[1]===b*f)return"nur_unten";if(p[0]===a+f&&p[1]===b+f)return"addiert_statt_mal";return null},
      hint:`Oben: ${a} · ${f}. Unten: ${b} · ${f}.`,sol:`${frHTML(a+"·"+f,b+"·"+f)} = ${frHTML(a*f,b*f)}`,solText:fr(a*f,b*f)};
    if(v===2)return{kind:"num",prompt:`Ergänze: ${frHTML(a,b)} = ${frHTML("?",b*f)}`,
      check:x=>parseNum(x)===a*f,classify:x=>{const n=parseNum(x);if(isNaN(n))return"format";if(n===a+b*f-b)return"addiert_statt_mal";if(Math.abs(n-a*f)===1)return"zaehlen";return null},
      hint:`Mit welcher Zahl wurde ${b} mal genommen, um ${b*f} zu bekommen? Nimm ${a} mit derselben Zahl mal.`,
      sol:`${b} · ${f} = ${b*f}, also ${a} · ${f} = <b>${a*f}</b>`,solText:String(a*f)};
    return{kind:"num",prompt:`Ergänze: ${frHTML(a,b)} = ${frHTML(a*f,"?")}`,
      check:x=>parseNum(x)===b*f,classify:x=>{const n=parseNum(x);if(isNaN(n))return"format";if(n===b+a*f-a)return"addiert_statt_mal";return null},
      hint:`${a} mal welche Zahl ergibt ${a*f}? Nimm ${b} mit derselben Zahl mal.`,
      sol:`${a} · ${f} = ${a*f}, also ${b} · ${f} = <b>${b*f}</b>`,solText:String(b*f)}}
};

SK.B2={name:"Teiler und Vielfache",y:"Kl. 5",pre:["B1"],
  card:{rule:"Teiler: Zahlen, durch die es ohne Rest geht – finde sie in Paaren. Vielfache: die Zahlen der Einmaleins-Reihe.",fig:null,
    ex:"Teiler von 12: 1·12, 2·6, 3·4 → 1, 2, 3, 4, 6, 12\nVielfache von 6: 6, 12, 18, 24, 30",vocab:"der Teiler · el divisor · factor   |   das Vielfache · el múltiplo · multiple"},
  sheet:`<p><b>Teiler</b> einer Zahl sind alle Zahlen, durch die sie <b>ohne Rest</b> teilbar ist.</p>
   <div class="ex">Teiler von 18 in Paaren:<br>1 · 18<br>2 · 9<br>3 · 6<br>→ 1, 2, 3, 6, 9, 18</div>
   <ul class="clean"><li>1 und die Zahl selbst sind <b>immer</b> Teiler.</li><li>Suche von 1 aufwärts, bis sich die Paare treffen.</li></ul>
   <p><b>Vielfache</b> einer Zahl sind die Zahlen ihrer Reihe: Vielfache von 7 → 7, 14, 21, 28, 35 …</p>
   <p class="muted small">Schreib mehrere Zahlen mit Komma: 1, 2, 3</p>`,
  gen(){const v=rnd(1,3);
    if(v===1){const N=pick([6,8,10,12,15,16,18,20,24,28,30,36]),ds=[];for(let d=1;d<=N;d++)if(N%d===0)ds.push(d);
      return{kind:"list",prompt:`Schreibe <b>alle Teiler von ${N}</b> auf (mit Komma getrennt).`,
        check:x=>{const l=[...new Set(parseList(x))].sort((p,q)=>p-q);return l.join()===ds.join()},
        classify:x=>{const l=[...new Set(parseList(x))];if(!l.length)return"format";if(l.some(d=>N%d!==0))return"kein_teiler";if(!l.includes(1)||!l.includes(N))return"rand_vergessen";return"paar_fehlt"},
        hint:`Such in Paaren: 1 · ${N}, 2 · …, 3 · … Hör auf, wenn sich die Paare treffen.`,sol:`Teiler von ${N}: <b>${ds.join(", ")}</b>`,solText:ds.join(", ")}}
    if(v===2){const m=rnd(3,9),vs=[1,2,3,4,5].map(i=>i*m);
      return{kind:"list",prompt:`Schreibe die <b>ersten 5 Vielfachen von ${m}</b> auf (mit Komma).`,
        check:x=>parseList(x).join()===vs.join(),classify:x=>{const l=parseList(x);if(!l.length)return"format";if(l.some((n,i)=>vs[i]!==undefined&&Math.abs(n-vs[i])===1))return"zaehlen";return"vielfache_falsch"},
        hint:`Das ist die ${m}er-Reihe: ${m}, ${2*m}, …`,sol:`<b>${vs.join(", ")}</b>`,solText:vs.join(", ")}}
    const d=rnd(2,9),yes=Math.random()<0.5,N=yes?d*rnd(3,12):d*rnd(3,11)+rnd(1,d-1);
    return{kind:"mc",prompt:`Ist <b>${N}</b> durch <b>${d}</b> teilbar?`,opts:["Ja","Nein"],
      check:i=>(i===0)===yes,classify:()=>null,hint:`Geht ${N} : ${d} ohne Rest auf? Such in der ${d}er-Reihe.`,
      sol:yes?`Ja: ${d} · ${N/d} = ${N}`:`Nein: ${N} : ${d} = ${Math.floor(N/d)} Rest ${N%d}`,solText:yes?"Ja":"Nein"}}
};

SK.B8={name:"ggT und Kürzen",y:"Kl. 6",pre:["B2","B7"],
  card:{rule:"Kürzen: Zähler UND Nenner durch dieselbe Zahl teilen. Am schnellsten mit dem größten gemeinsamen Teiler (ggT).",fig:()=>svgTwoBars(6,4,3,2),
    ex:"12/18 → ggT(12, 18) = 6 → 12:6 / 18:6 = 2/3",vocab:"kürzen · simplificar · to simplify   |   ggT · m.c.d. · GCD"},
  sheet:`<p><b>Kürzen</b> ist das Gegenteil von Erweitern: oben und unten durch dieselbe Zahl teilen. Der Wert bleibt gleich.</p>
   <div class="ex">${frHTML(12,18)} → beide durch 6 → ${frHTML(2,3)}</div>
   <p><b>ggT</b> = größter gemeinsamer Teiler.</p>
   <div class="ex">Teiler von 12: 1, 2, 3, 4, <b>6</b>, 12<br>Teiler von 18: 1, 2, 3, <b>6</b>, 9, 18<br>→ ggT = 6</div>
   <ul class="clean"><li>Du kannst auch in Schritten kürzen: 12/18 → :2 → 6/9 → :3 → 2/3.</li><li><b>Fertig</b> ist es erst, wenn oben und unten keinen gemeinsamen Teiler (außer 1) mehr haben.</li></ul>
   <p class="muted small">Typischer Fehler: oben und unten durch verschiedene Zahlen teilen (5/20 → 1/10). Das ändert den Wert!</p>`,
  gen(){const pairs=[[1,2],[1,3],[2,3],[1,4],[3,4],[2,5],[3,5],[1,6],[5,6],[3,7],[3,8],[5,8]];const [p,q]=pick(pairs),g=rnd(2,9),A=g*p,B=g*q,v=rnd(1,3);
    if(v===1)return{kind:"num",prompt:`Was ist der <b>größte gemeinsame Teiler</b> (ggT) von ${A} und ${B}?`,
      check:x=>parseNum(x)===g,classify:x=>{const n=parseNum(x);if(isNaN(n))return"format";if(A%n===0&&B%n===0&&n<g)return"nicht_groesster";if(A%n!==0||B%n!==0)return"kein_teiler";return null},
      hint:`Schreib die Teiler von ${A} und von ${B} auf. Welcher ist in beiden Listen der größte?`,sol:`ggT(${A}, ${B}) = <b>${g}</b>, denn ${A} = ${g}·${p} und ${B} = ${g}·${q}`,solText:String(g)};
    if(v===2)return{kind:"frac",prompt:`Kürze ${frHTML(A,B)} <b>so weit wie möglich</b>.`,
      check:x=>{const f=parseFrac(x);return!!f&&f[0]===p&&f[1]===q},
      classify:x=>{const f=parseFrac(x);if(!f)return"format";if(f[1]&&f[0]*B===A*f[1])return"nicht_vollstaendig";const d1=f[0]?A/f[0]:0,d2=f[1]?B/f[1]:0;if(Number.isInteger(d1)&&Number.isInteger(d2)&&d1!==d2)return"ungleich_gekuerzt";return null},
      hint:`Such den ggT von ${A} und ${B} und teile oben und unten dadurch.`,sol:`ggT = ${g} → ${frHTML(A+":"+g,B+":"+g)} = ${frHTML(p,q)}`,solText:fr(p,q)};
    const d=pick([2,3,4,5].filter(k=>A%k===0&&B%k===0))||g;
    return{kind:"frac",prompt:`Kürze ${frHTML(A,B)} durch <b>${d}</b>.`,
      check:x=>{const f=parseFrac(x);return!!f&&f[0]===A/d&&f[1]===B/d},
      classify:x=>{const f=parseFrac(x);if(!f)return"format";if(f[0]===A/d&&f[1]===B)return"nur_oben";if(f[0]===A&&f[1]===B/d)return"nur_unten";if(f[1]&&f[0]*B===A*f[1])return"nicht_vollstaendig";return"ungleich_gekuerzt"},
      hint:`Oben: ${A} : ${d}. Unten: ${B} : ${d}.`,sol:`${frHTML(A+":"+d,B+":"+d)} = ${frHTML(A/d,B/d)}`,solText:fr(A/d,B/d)}}
};

SK.B9={name:"Brüche vergleichen",y:"Kl. 6",pre:["B7"],
  card:{rule:"Gleicher Nenner: größerer Zähler gewinnt. Gleicher Zähler: KLEINERER Nenner gewinnt (größere Stücke). Sonst: erst auf gleichen Nenner bringen.",fig:()=>svgTwoBars(4,1,8,1),
    ex:"1/4 > 1/8   ·   3/5 und 2/3 → 9/15 < 10/15",vocab:"vergleichen · comparar · to compare"},
  sheet:`<p>Drei Fälle:</p>
   <ul class="clean"><li><b>Gleicher Nenner:</b> ${frHTML(3,7)} < ${frHTML(5,7)} – mehr gleich große Stücke.</li>
   <li><b>Gleicher Zähler:</b> ${frHTML(2,5)} > ${frHTML(2,9)} – Fünftel sind größer als Neuntel.</li>
   <li><b>Beides verschieden:</b> auf gleichen Nenner erweitern.</li></ul>
   <div class="ex">3/5 oder 2/3?<br>3/5 = 9/15 · 2/3 = 10/15<br>→ 2/3 ist größer</div>
   <p class="muted small">Typischer Fehler: denken, 1/8 sei größer als 1/4, weil 8 > 4. Mehr Stücke heißt kleinere Stücke!</p>`,
  gen(){const v=rnd(1,3);let a,b,c,d;
    if(v===1){b=rnd(3,12);a=rnd(1,b-1);do{c=rnd(1,b-1)}while(c===a);d=b}
    else if(v===2){a=rnd(1,5);b=rnd(a+1,12);do{d=rnd(a+1,12)}while(d===b);c=a}
    else{do{b=rnd(2,9);d=rnd(2,9)}while(b===d);a=rnd(1,b-1);c=rnd(1,d-1);if(Math.random()<0.15){const f=rnd(2,3);c=a*f;d=b*f}}
    const L=a*d,R=c*b,o=[fr(a,b),fr(c,d),"Beide sind gleich groß"],ans=L>R?0:L<R?1:2;
    return{kind:"mc",prompt:`Welcher Bruch ist <b>größer</b>?`,opts:o,check:i=>i===ans,
      classify:i=>{if(v===2&&i!==2&&((i===0&&b>d)||(i===1&&d>b)))return"groesserer_nenner";if(v===3)return"nicht_gleichnamig";return null},
      hint:v===1?"Gleicher Nenner – vergleiche die Zähler.":v===2?"Gleicher Zähler – welche Stücke sind größer: "+b+"tel oder "+d+"tel?":`Bring beide auf den Nenner ${b*d/gcd(b,d)}.`,
      sol:`${frHTML(a,b)} = ${frHTML(a*d/gcd(b,d),b*d/gcd(b,d))} und ${frHTML(c,d)} = ${frHTML(c*b/gcd(b,d),b*d/gcd(b,d))} → ${ans===2?"gleich groß":`<b>${o[ans]}</b> ist größer`}`,solText:o[ans]}}
};

/* v2: subject/track tags and "Wie hast du gerechnet?" method checks (Otto's known detours) */
ORDER_M.forEach(id=>{SK[id].subj="M";SK[id].track="B"});
SK.B1.method=it=>({q:"Wie hast du es herausgefunden?",o:[["Einmaleins rückwärts: Welche Zahl mal … ergibt das Ganze?",0],["Ich wusste es auswendig",0],["Hochgezählt oder mit den Fingern",1],["Geraten",1]]});
SK.B5.method=it=>({q:"Wie hast du gerechnet?",o:[["Erst durch den Nenner geteilt, dann mal den Zähler",0],["Erst mal den Zähler, dann durch den Nenner",0],["Ausprobiert, bis es gepasst hat",1],["Geraten",1]]});
SK.B8.method=it=>/Kürze/.test(it.prompt)?{q:"Wie hast du gekürzt?",o:[["Mit dem ggT in einem Schritt",0],["In kleinen Schritten, oben und unten immer durch dieselbe Zahl",0],["Ausprobiert, bis es kleiner wurde",1],["Geraten",1]]}:null;
SK.B9.method=it=>({q:"Wie hast du verglichen?",o:[["Auf den gleichen Nenner gebracht oder Zähler/Nenner-Regel benutzt",0],["Mir die Stücke vorgestellt",0],["Größere Zahlen = größerer Bruch",1],["Geraten",1]]});
