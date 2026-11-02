"use strict";
/* Otto lernt – Basis: Hilfsfunktionen, Grafiken, Fehlertexte */
/* =====================================================================
   UTILITIES
   ===================================================================== */
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const gcd=(a,b)=>b?gcd(b,a%b):a;
const now=()=>Date.now();
const DAY=86400000;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const strip=h=>String(h).replace(/<[^>]+>/g,"").replace(/\s+/g," ").trim();
function parseFrac(s){const m=String(s).replace(/\s+/g,"").match(/^(\d+)\/(\d+)$/);return m?[+m[1],+m[2]]:null}
function parseNum(s){s=String(s).replace(/\s+/g,"").replace(",",".");return /^\d+(\.\d+)?$/.test(s)?parseFloat(s):NaN}
function parseList(s){return String(s).split(/[,;\s]+/).filter(Boolean).map(Number).filter(n=>!isNaN(n))}
const fr=(a,b)=>`${a}/${b}`;
const frHTML=(a,b)=>`<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1.05;font-family:var(--f-mono);font-weight:700;margin:0 3px"><span>${a}</span><span style="border-top:2px solid currentColor;padding:0 3px">${b}</span></span>`;

/* =====================================================================
   FIGURES (SVG)
   ===================================================================== */
const C={on:"#16a34a",off:"#24382b",line:"#0f1f14",txt:"#e8f5e9",dim:"#9ab0a2",gold:"#e0b021"};
function svgBar(n,k,opts={}){
  const W=400,H=opts.h||64,x0=10,w=(W-20)/n;let s=`<svg viewBox="0 0 ${W} ${H+(opts.label?24:0)}" role="img" aria-label="Streifen mit ${n} Teilen">`;
  for(let i=0;i<n;i++){s+=`<rect class="${opts.tap?'seg':''}" data-i="${i}" x="${x0+i*w}" y="4" width="${w-2}" height="${H-8}" rx="4" fill="${i<k?C.on:C.off}" stroke="${C.line}" stroke-width="2"/>`}
  if(opts.label)s+=`<text x="${W/2}" y="${H+18}" fill="${C.dim}" font-size="14" text-anchor="middle" font-family="Nunito,sans-serif">${opts.label}</text>`;
  return s+"</svg>";
}
function svgTwoBars(n1,k1,n2,k2){
  const W=400,H=52,w1=(W-20)/n1,w2=(W-20)/n2;let s=`<svg viewBox="0 0 ${W} ${H*2+16}" role="img" aria-label="Zwei Streifen gleicher Länge">`;
  for(let i=0;i<n1;i++)s+=`<rect x="${10+i*w1}" y="4" width="${w1-2}" height="${H-8}" rx="4" fill="${i<k1?C.on:C.off}" stroke="${C.line}" stroke-width="2"/>`;
  for(let i=0;i<n2;i++)s+=`<rect x="${10+i*w2}" y="${H+12}" width="${w2-2}" height="${H-8}" rx="4" fill="${i<k2?C.on:C.off}" stroke="${C.line}" stroke-width="2"/>`;
  return s+"</svg>";
}
function svgBalls(n,k){
  const per=Math.min(n,8),rows=Math.ceil(n/per),r=18,W=400,H=rows*48+8;const gap=(W-per*2*r)/(per+1);let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${k} von ${n} markiert">`;
  for(let i=0;i<n;i++){const row=Math.floor(i/per),col=i%per,cx=gap+r+col*(2*r+gap),cy=28+row*48;
    s+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${i<k?C.on:C.off}" stroke="${i<k?"#4ade80":"#3b5a44"}" stroke-width="2"/>`;
    if(i<k)s+=`<text x="${cx}" y="${cy+5}" fill="#fff" font-size="15" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900">✓</text>`}
  return s+"</svg>";
}
function svgGroups(total,groups){
  const per=total/groups,W=400,gw=(W-10)/groups,H=Math.ceil(per/4)*22+30;let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${total} Bälle in ${groups} Gruppen">`;
  for(let g=0;g<groups;g++){const gx=5+g*gw;s+=`<rect x="${gx+3}" y="3" width="${gw-6}" height="${H-6}" rx="10" fill="none" stroke="${C.gold}" stroke-dasharray="4 3"/>`;
    for(let i=0;i<per;i++){const cx=gx+14+(i%4)*((gw-28)/3||0),cy=20+Math.floor(i/4)*22;s+=`<circle cx="${cx}" cy="${cy}" r="8" fill="${C.on}"/>`}}
  return s+"</svg>";
}

/* =====================================================================
   ERROR FEEDBACK
   ===================================================================== */
const ERR={
  zaehlen:"Ganz knapp – genau um 1 daneben. Das passiert beim Zählen. Diese Aufgabe üben wir im Fast Math, bis du sie einfach weißt.",
  reihe_daneben:"Du bist in der Reihe um einen Schritt verrutscht. Sag die Reihe einmal laut bis zu dieser Aufgabe.",
  mal_statt_geteilt:"Du hast mal gerechnet. Hier wird aber verteilt – also geteilt.",
  minus_statt_geteilt:"Du hast abgezogen. Verteilen heißt teilen.",
  teil_statt_ganzes:"Unten (der Nenner) steht immer das GANZE – alle Teile zusammen, nicht nur der Rest.",
  gegenteil:"Du hast den anderen Teil gezählt. Lies nochmal genau, wonach gefragt ist.",
  vertauscht:"Zähler und Nenner sind vertauscht. Oben: wie viele du nimmst. Unten: wie viele es insgesamt sind.",
  nur_ein_teil:"Guter Anfang! Das ist erst EIN Teil. Jetzt noch mal den Zähler nehmen.",
  falsch_geteilt:"Erst durch den Nenner (unten) teilen, dann mal den Zähler (oben).",
  addiert_statt_mal:"Du hast addiert. Gleichwertige Brüche entstehen durch MAL – oben und unten mit derselben Zahl.",
  nur_oben:"Unten auch mal nehmen – oben UND unten mit derselben Zahl.",
  nur_unten:"Oben auch mal nehmen – oben UND unten mit derselben Zahl.",
  rand_vergessen:"Fast! 1 und die Zahl selbst sind immer auch Teiler.",
  kein_teiler:"Da ist eine Zahl dabei, durch die es nicht ohne Rest geht. Prüf mit dem Einmaleins.",
  paar_fehlt:"Es fehlt noch ein Teiler. Such in Paaren: 1 · …, 2 · …, 3 · …",
  vielfache_falsch:"Vielfache sind die Zahlen der Reihe: 1-mal, 2-mal, 3-mal … die Zahl.",
  nicht_groesster:"Das ist ein gemeinsamer Teiler – aber nicht der größte. Geht noch mehr?",
  nicht_vollstaendig:"Richtig gekürzt – aber es geht noch weiter! Kürze, bis oben und unten nichts Gemeinsames mehr haben.",
  ungleich_gekuerzt:"Oben und unten müssen durch DIESELBE Zahl geteilt werden.",
  groesserer_nenner:"Achtung: größerer Nenner = kleinere Stücke. 1/8 ist weniger als 1/4.",
  nicht_gleichnamig:"Bring beide Brüche erst auf den gleichen Nenner, dann vergleichen.",
  format:"So kann ich die Antwort nicht lesen. Schau dir das Beispiel im Eingabefeld an.",
  falsch:"Das stimmt noch nicht."
};

/* Registry shared by all content files */
const SK={};
