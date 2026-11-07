"use strict";
/* Otto lernt – Deutsch: Grammatik (G), Rechtschreibung (R), Wortschatz (W), Lesen (L)
   Aligned to DSM curriculum Kl. 5/6 (Thüringer Lehrplan, Deutschbuch 6). All texts are original. */

const ORDER_D={
  G:["G2","G1","G3","G4","G5","G6","G7","G8","G9","G10","G11","G12"],
  R:["R1","R2","R3","R4","R5","R6","R7","R8","R9","R10"],
  W:["W1","W2","W3","W4"],
  L:["L1","L2","L3","L4"]
};
const TRACK_NAME={G:"Grammatik",R:"Rechtschreibung",W:"Wortschatz",L:"Lesen"};

Object.assign(ERR,{
  kompositum:"Bei zusammengesetzten Nomen bestimmt immer das LETZTE Wort den Artikel: der Fußball + der Schuh → der Fußballschuh.",
  genus:"Falscher Artikel. Lern das Nomen immer mit Artikel – wie einen Namen: der Ball, die Tasche, das Tor.",
  kasus:"Der Fall stimmt nicht. Frag nach dem Satzglied: Wen oder was? → Akkusativ. Wem? → Dativ.",
  praep:"Diese Präposition verlangt einen anderen Fall. Schau auf den Spickzettel: Dativ- oder Akkusativ-Präposition?",
  wechsel:"Wo? → Dativ. Wohin? → Akkusativ. Frag zuerst, ob sich etwas bewegt.",
  schwach:"Das ist ein starkes Verb – es bildet die Vergangenheit nicht mit -te, sondern mit Vokalwechsel (laufen → lief).",
  hilfsverb:"Falsches Hilfsverb. Bewegung von A nach B → sein (ist gelaufen). Sonst meistens haben.",
  partizip:"Das Partizip stimmt nicht. Starke Verben: ge-…-en (gelaufen), schwache: ge-…-t (gespielt).",
  person:"Die Endung passt nicht zur Person. ich -e, du -st, er/sie/es -t.",
  umlaut:"Bei diesem Verb ändert sich der Vokal bei du und er: du läufst, er liest.",
  wortart:"Frag dich: Kann man einen Artikel davor setzen (Nomen)? Kann man es beugen? Wie ist es?",
  satzglied:"Mach die Umstellprobe: Was zusammen an den Satzanfang wandert, ist ein Satzglied.",
  verbstellung:"Im Nebensatz steht das gebeugte Verb ganz am Ende.",
  konjunktion:"Lies den Satz mit dieser Konjunktion laut. Passt der Sinn: Grund (weil), Gegensatz (obwohl), Zweck (damit)?",
  gross:"Großgeschrieben werden Satzanfänge und Nomen. Nomen-Test: Kann man der/die/das davorsetzen?",
  verlaengern:"Verlängere das Wort: der Hund → die Hunde. Dann hörst du, ob d oder t.",
  ableiten:"Such ein verwandtes Wort: Hände kommt von Hand → ä.",
  schwingen:"Schwing das Wort in Silben: Son-ne. Hörst du den kurzen Vokal? Dann kommt der Mitlaut doppelt.",
  merken:"Das ist ein Merkwort – es folgt keiner Regel, die man hören kann. Präg es dir ein.",
  sz:"Nach langem Vokal oder au/ei/eu: ß. Nach kurzem Vokal: ss.",
  dasdass:"Ersatzprobe: Kannst du „dieses“ oder „welches“ einsetzen? Dann das. Sonst dass.",
  nominal:"Signalwort davor (das, beim, zum, etwas, viel, nichts)? Dann ist es ein Nomen → groß.",
  komma:"Vor Nebensätzen (weil, dass, wenn, obwohl …) und zwischen Aufzählungen steht ein Komma – aber nicht vor „und“.",
  rede:"Begleitsatz vorne: Doppelpunkt. Begleitsatz hinten: Komma nach dem Anführungszeichen, Punkt fällt weg.",
  wortschatz:"Lies den Satz mit diesem Wort laut. Passt es genau?",
  lesen_info:"Die Antwort steht wörtlich im Text. Such die Stelle und lies sie nochmal.",
  lesen_schluss:"Die Antwort steht nicht wörtlich da. Welche Hinweise im Text führen dich dahin?",
  lesen_wort:"Lies den Satz davor und danach. Was würde an dieser Stelle Sinn ergeben?",
  lesen_sorte:"Achte auf Merkmale: Zeitform, Sprache (sachlich oder spannend), Aufbau, Absicht des Textes."
});

/* ---------- small helpers ---------- */
const uniq=a=>[...new Set(a)];
function mcItem(o){ // o: {prompt, right, wrong[], err, hint, sol, fig?, txt?, listen?}
  const opts=shuffle(uniq([o.right,...o.wrong.filter(w=>w!==o.right)].slice(0,o.max||4)));
  return {kind:o.listen?"listen":"mc",fam:o.fam||null,prompt:o.prompt,opts,speak:o.listen||null,passage:o.txt||null,fig:o.fig||null,
    check:i=>opts[i]===o.right,classify:i=>o.errMap&&o.errMap[opts[i]]?o.errMap[opts[i]]:(o.err||null),
    hint:o.hint,sol:o.sol,solText:o.right};
}
function tapItem(o){ // o: {prompt, tokens[], answer:Set of indices, tappable?:fn, err, hint, sol}
  return {kind:"tap",ans:o.answer,prompt:o.prompt,tokens:o.tokens,tappable:o.tappable||(t=>/[\wäöüÄÖÜß]/.test(t)),display:o.display||null,
    check:sel=>{const a=[...o.answer].sort().join(),b=[...sel].sort().join();return a===b},
    classify:()=>o.err||null,hint:o.hint,sol:o.sol,solText:[...o.answer].map(i=>o.tokens[i]).join(" ")};
}

/* =====================================================================
   LEXICON
   ===================================================================== */
const NOUNS=`der Ball|Bälle|o
der Trainer|Trainer|p
der Spieler|Spieler|p
der Torwart|Torwarte|p
der Schiedsrichter|Schiedsrichter|p
der Platz|Plätze|l
der Schuh|Schuhe|o
der Pokal|Pokale|o
der Freund|Freunde|p
der Lehrer|Lehrer|p
der Bruder|Brüder|p
der Vater|Väter|p
der Hund|Hunde|a
der Baum|Bäume|o
der Tisch|Tische|o
der Stuhl|Stühle|o
der Zug|Züge|o
der Bus|Busse|o
der Garten|Gärten|l
der Apfel|Äpfel|o
der Brief|Briefe|o
der Berg|Berge|l
der Schlüssel|Schlüssel|o
der Rucksack|Rucksäcke|o
der Koffer|Koffer|o
der Computer|Computer|o
der Bleistift|Bleistifte|o
der Kuchen|Kuchen|o
der Vogel|Vögel|a
der Schläger|Schläger|o
der Helm|Helme|o
der Teller|Teller|o
die Mannschaft|Mannschaften|o
die Tasche|Taschen|o
die Schule|Schulen|l
die Klasse|Klassen|l
die Lehrerin|Lehrerinnen|p
die Mutter|Mütter|p
die Schwester|Schwestern|p
die Stadt|Städte|l
die Straße|Straßen|l
die Tür|Türen|o
die Uhr|Uhren|o
die Hand|Hände|o
die Wand|Wände|o
die Maus|Mäuse|a
die Flasche|Flaschen|o
die Jacke|Jacken|o
die Brille|Brillen|o
die Blume|Blumen|o
die Frage|Fragen|o
die Zeitung|Zeitungen|o
die Karte|Karten|o
die Wiese|Wiesen|l
die Insel|Inseln|l
die Burg|Burgen|l
die Kuh|Kühe|a
die Bank|Bänke|o
die Lampe|Lampen|o
die Freundin|Freundinnen|p
die Banane|Banane|o
die Brücke|Brücken|l
die Trainerin|Trainerinnen|p
die Katze|Katzen|a
die Prüfung|Prüfungen|o
die Mannschaftskabine|Mannschaftskabinen|l
das Tor|Tore|o
das Spiel|Spiele|o
das Trikot|Trikots|o
das Stadion|Stadien|l
das Buch|Bücher|o
das Heft|Hefte|o
das Haus|Häuser|l
das Zimmer|Zimmer|l
das Fenster|Fenster|o
das Auto|Autos|o
das Fahrrad|Fahrräder|o
das Kind|Kinder|p
das Mädchen|Mädchen|p
das Pferd|Pferde|a
das Brot|Brote|o
das Ei|Eier|o
das Glas|Gläser|o
das Bild|Bilder|o
das Dorf|Dörfer|l
das Bett|Betten|o
das Netz|Netze|o
das Handy|Handys|o
das Wort|Wörter|o
das Lied|Lieder|o
das Schiff|Schiffe|o
das Geschenk|Geschenke|o
das Turnier|Turniere|o
das Internat|Internate|l
das Schwimmbad|Schwimmbäder|l
das Zelt|Zelte|o`.split("\n").map(l=>{const [a,pl,c]=l.split("|");const [art,...w]=a.split(" ");return {art,w:w.join(" "),pl,c}});
NOUNS.find(n=>n.w==="Banane").pl="Bananen";
const PHYS=new Set("Tisch Stuhl Baum Koffer Rucksack Computer Teller Tür Wand Lampe Bank Flasche Tasche Jacke Fenster Auto Fahrrad Bett Netz Zelt Tor Schuh Pokal Helm Schläger Heft Buch Uhr Kuchen Bus Zug".split(" "));
const KOMPOSITA=[["Fußballschuh","der Fußball","der Schuh","der"],["Torwart","das Tor","der Wart","der"],["Schlafzimmer","der Schlaf","das Zimmer","das"],["Fußballhalle","der Fußball","die Halle","die"],["Handschuh","die Hand","der Schuh","der"],["Haustür","das Haus","die Tür","die"],["Sporttasche","der Sport","die Tasche","die"],["Tennisball","das Tennis","der Ball","der"],["Wasserflasche","das Wasser","die Flasche","die"],["Schultasche","die Schule","die Tasche","die"],["Kinderzimmer","das Kind","das Zimmer","das"],["Apfelbaum","der Apfel","der Baum","der"],["Fahrradhelm","das Fahrrad","der Helm","der"],["Zugfenster","der Zug","das Fenster","das"],["Stadtplan","die Stadt","der Plan","der"],["Sportplatz","der Sport","der Platz","der"],["Tischtennis","der Tisch","das Tennis","das"],["Mannschaftsbus","die Mannschaft","der Bus","der"],["Schiedsrichterpfeife","der Schiedsrichter","die Pfeife","die"],["Spielfeld","das Spiel","das Feld","das"]];
const DEF={der:{N:"der",A:"den",D:"dem"},die:{N:"die",A:"die",D:"der"},das:{N:"das",A:"das",D:"dem"}};

const VERBS=`laufen|läufst|läuft|lief|gelaufen|ist|zum Tor
fahren|fährst|fährt|fuhr|gefahren|ist|nach Toledo
lesen|liest|liest|las|gelesen|hat|ein Buch
sehen|siehst|sieht|sah|gesehen|hat|das Spiel
geben|gibst|gibt|gab|gegeben|hat|mir den Ball
nehmen|nimmst|nimmt|nahm|genommen|hat|den Bus
essen|isst|isst|aß|gegessen|hat|eine Banane
sprechen|sprichst|spricht|sprach|gesprochen|hat|mit dem Trainer
helfen|hilfst|hilft|half|geholfen|hat|dem Torwart
werfen|wirfst|wirft|warf|geworfen|hat|den Ball weit
treffen|triffst|trifft|traf|getroffen|hat|das Tor
schlafen|schläfst|schläft|schlief|geschlafen|hat|im Internat
fallen|fällst|fällt|fiel|gefallen|ist|auf den Rasen
halten|hältst|hält|hielt|gehalten|hat|den Elfmeter
tragen|trägst|trägt|trug|getragen|hat|die Tasche
vergessen|vergisst|vergisst|vergaß|vergessen|hat|die Trinkflasche
schießen|schießt|schießt|schoss|geschossen|hat|ein Tor
spielen|spielst|spielt|spielte|gespielt|hat|Tennis
trainieren|trainierst|trainiert|trainierte|trainiert|hat|im Regen
gewinnen|gewinnst|gewinnt|gewann|gewonnen|hat|das Finale
verlieren|verlierst|verliert|verlor|verloren|hat|den Schlüssel
rennen|rennst|rennt|rannte|gerannt|ist|über den Platz
kommen|kommst|kommt|kam|gekommen|ist|zu spät
gehen|gehst|geht|ging|gegangen|ist|nach Hause
bringen|bringst|bringt|brachte|gebracht|hat|Wasser
denken|denkst|denkt|dachte|gedacht|hat|an das Spiel
finden|findest|findet|fand|gefunden|hat|den Schlüssel
rufen|rufst|ruft|rief|gerufen|hat|laut
schreiben|schreibst|schreibt|schrieb|geschrieben|hat|einen Brief
singen|singst|singt|sang|gesungen|hat|ein Lied
springen|springst|springt|sprang|gesprungen|ist|über die Pfütze
stehen|stehst|steht|stand|gestanden|hat|im Tor
sitzen|sitzt|sitzt|saß|gesessen|hat|auf der Bank
liegen|liegst|liegt|lag|gelegen|hat|im Bett
fliegen|fliegst|fliegt|flog|geflogen|ist|nach London
schwimmen|schwimmst|schwimmt|schwamm|geschwommen|ist|im See
trinken|trinkst|trinkt|trank|getrunken|hat|Wasser
beginnen|beginnst|beginnt|begann|begonnen|hat|mit dem Training
bleiben|bleibst|bleibt|blieb|geblieben|ist|zu Hause
fangen|fängst|fängt|fing|gefangen|hat|den Ball
waschen|wäschst|wäscht|wusch|gewaschen|hat|das Trikot
lachen|lachst|lacht|lachte|gelacht|hat|über den Witz
kaufen|kaufst|kauft|kaufte|gekauft|hat|neue Schuhe
machen|machst|macht|machte|gemacht|hat|die Hausaufgaben
wohnen|wohnst|wohnt|wohnte|gewohnt|hat|in Madrid
reisen|reist|reist|reiste|gereist|ist|nach Berlin
wandern|wanderst|wandert|wanderte|gewandert|ist|in den Bergen`.split("\n").map(l=>{const [inf,du,er,prt,p2,aux,ctx]=l.split("|");return {inf,du,er,prt,p2,aux,ctx}});
const stem=v=>v.inf.replace(/en$|n$/,"");
const strong=v=>v.prt!==stem(v)+"te";

/* =====================================================================
   GRAMMATIK
   ===================================================================== */
const D=(id,o)=>{SK[id]=Object.assign({subj:"D",track:id[0]},o)};

D("G2",{name:"Genus und Plural",y:"Kl. 2–5",pre:[],
  card:{rule:"Jedes Nomen hat ein Geschlecht: der, die oder das. Lern es immer mit – wie einen Teil des Namens.",
    ex:"die Mannschaft (-schaft → die) · das Mädchen (-chen → das)\nZusammengesetzt: das letzte Wort entscheidet → der Fußball + der Schuh = der Fußballschuh",vocab:"das Genus · el género · gender   |   der Plural · el plural · plural"},
  sheet:`<p>Im Spanischen gibt es zwei Geschlechter, im Deutschen drei: <b>der</b> (maskulin), <b>die</b> (feminin), <b>das</b> (neutral). Oft hilft die Endung:</p>
   <ul class="clean"><li><b>die</b>: -ung, -heit, -keit, -schaft, -ion, meist -e (die Zeitung, die Mannschaft, die Tasche)</li>
   <li><b>das</b>: -chen, -lein, -um, -ment (das Mädchen, das Stadion)</li>
   <li><b>der</b>: -er bei Personen, -ling, Tage, Monate (der Spieler, der Montag)</li></ul>
   <p><b>Plural</b> – fünf Muster: -e (Schuhe), -er (Bilder, oft mit Umlaut: Häuser), -(e)n (Taschen), -s (Trikots, Handys), ohne Endung (Spieler, Zimmer).</p>
   <div class="ex">Tipp: Im Plural ist der Artikel immer „die“: die Bälle, die Tore.</div>
   <p><b>Zusammengesetzte Nomen:</b> Das <b>letzte</b> Wort bestimmt den Artikel. <i>das Tor + der Wart → der Torwart · der Schlaf + das Zimmer → das Schlafzimmer · der Fußball + die Halle → die Fußballhalle</i></p>`,
  gen(){const n=pick(NOUNS);
    if(Math.random()<0.25){const k=pick(KOMPOSITA);return mcItem({prompt:`Welcher Artikel passt? <b>___ ${k[0]}</b> <span class="muted">(${k[1]} + ${k[2]})</span>`,right:k[3],wrong:["der","die","das"],max:3,err:"kompositum",fam:"kompositum",
      hint:"Schau auf das LETZTE Wort. Welchen Artikel hat es allein?",sol:`Das letzte Wort entscheidet: ${k[2]} → <b>${k[3]} ${k[0]}</b>`})}
    if(Math.random()<0.55)return mcItem({prompt:`Welcher Artikel passt? <b>___ ${n.w}</b>`,right:n.art,wrong:["der","die","das"],max:3,err:"genus",
      hint:"Achte auf die Endung. Weißt du es nicht sicher, sprich es dir mit Artikel vor.",sol:`<b>${n.art} ${n.w}</b> – Plural: die ${n.pl}`});
    const sg=n.w,uml=/(ai|au|ei|eu)/.test(sg)?sg+"n":sg.replace(/([aou])([^aeiouäöü]*)$/,(m,v,r)=>({a:"ä",o:"ö",u:"ü"})[v]+r)+"e",cands=[sg+"e",sg+"en",sg+"s",sg+"er",uml,sg];
    return mcItem({prompt:`Wie heißt die Mehrzahl? <b>${n.art} ${sg}</b> → die ___`,right:n.pl,wrong:shuffle(uniq(cands.filter(c=>c!==n.pl))),err:"merken",
      hint:"Sprich beide Formen laut: „ein …, zwei …“. Was klingt richtig?",sol:`${n.art} ${sg} → <b>die ${n.pl}</b>`})}
});

const WA_LABEL={Sub:"Substantiv (Nomen)",V:"Verb",Adj:"Adjektiv",Art:"Artikel",Pron:"Pronomen",Präp:"Präposition",Konj:"Konjunktion",Adv:"Adverb"};
const WA_SENT=[
"Der:Art schnelle:Adj Stürmer:Sub schießt:V das:Art Tor:Sub .",
"Morgen:Adv spielen:V wir:Pron gegen:Präp Pozuelo:Sub .",
"Nach:Präp dem:Art Training:Sub trinkt:V er:Pron ein:Art Glas:Sub Wasser:Sub .",
"Ich:Pron finde:V den:Art Ball:Sub unter:Präp dem:Art Bett:Sub .",
"Der:Art Hund:Sub bellt:V , aber:Konj die:Art Katze:Sub schläft:V .",
"Gestern:Adv war:V das:Art Wetter:Sub kalt:Adj und:Konj nass:Adj .",
"Sie:Pron liest:V ein:Art spannendes:Adj Buch:Sub .",
"Wir:Pron fahren:V mit:Präp dem:Art Bus:Sub nach:Präp Toledo:Sub .",
"Das:Art kleine:Adj Mädchen:Sub lacht:V oft:Adv .",
"Dort:Adv steht:V ein:Art alter:Adj Baum:Sub .",
"Er:Pron hilft:V ihr:Pron oft:Adv .",
"Obwohl:Konj es:Pron regnet:V , spielen:V die:Art Kinder:Sub draußen:Adv .",
"Wir:Pron warten:V seit:Präp einer:Art Stunde:Sub auf:Präp den:Art Zug:Sub .",
"Der:Art Trainer:Sub ist:V heute:Adv sehr:Adv zufrieden:Adj .",
"Otto:Sub packt:V die:Art Tasche:Sub , denn:Konj er:Pron fährt:V morgen:Adv nach:Präp London:Sub .",
"Die:Art müden:Adj Spieler:Sub sitzen:V in:Präp der:Art Kabine:Sub ."
].map(s=>s.split(" ").map(t=>{const [w,tag]=t.split(":");return {w,tag:tag||null}}));
D("G1",{name:"Wortarten (mit lateinischen Namen)",y:"Kl. 5–6",pre:[],
  card:{rule:"Substantiv = Nomen (Ding/Lebewesen, groß, mit Artikel). Verb = Tun/Geschehen. Adjektiv = Wie ist etwas? Dazu: Artikel, Pronomen, Präposition, Konjunktion, Adverb.",
    ex:"Der (Artikel) schnelle (Adjektiv) Stürmer (Substantiv) schießt (Verb).",vocab:"die Wortart · la categoría gramatical · part of speech"},
  sheet:`<ul class="clean"><li><b>Substantiv (Nomen):</b> Menschen, Tiere, Dinge, Gefühle – großgeschrieben, mit Artikel. <i>der Ball, die Freude</i></li>
   <li><b>Verb:</b> was jemand tut oder was geschieht – wird konjugiert. <i>spielen, ich spiele</i></li>
   <li><b>Adjektiv:</b> wie etwas ist – kann gesteigert werden. <i>schnell, schneller, am schnellsten</i></li>
   <li><b>Artikel:</b> der, die, das, ein, eine</li><li><b>Pronomen:</b> steht für ein Nomen. <i>ich, du, er, sie, es, wir, ihr</i></li>
   <li><b>Präposition:</b> zeigt Verhältnisse (Ort, Zeit). <i>auf, unter, mit, nach, seit</i></li>
   <li><b>Konjunktion:</b> verbindet Sätze oder Wörter. <i>und, aber, denn, weil, obwohl, dass</i></li>
   <li><b>Adverb:</b> sagt, wann, wo, wie – wird nicht gebeugt. <i>heute, dort, oft, gern</i></li></ul>
   <p class="muted small">Flektierbar (veränderbar): Substantiv, Verb, Adjektiv, Artikel, Pronomen. Nicht flektierbar: Präposition, Konjunktion, Adverb.</p>`,
  gen(){const s=pick(WA_SENT),idx=s.map((t,i)=>t.tag?i:-1).filter(i=>i>=0),k=pick(idx),tag=s[k].tag;
    const words=s.map((t,i)=>i===k?`<b><u>${t.w}</u></b>`:t.w).join(" ").replace(/ ([.,])/g,"$1");
    const others=shuffle(Object.keys(WA_LABEL).filter(x=>x!==tag)).slice(0,3);
    return mcItem({prompt:`Welche Wortart ist das unterstrichene Wort?<br><span class="sent">${words}</span>`,right:WA_LABEL[tag],wrong:others.map(o=>WA_LABEL[o]),err:"wortart",
      hint:"Probier die Tests: Artikel davor möglich? → Substantiv. Kann man es beugen (ich …, du …)? → Verb. Wie ist etwas? → Adjektiv.",
      sol:`„${s[k].w}“ ist ein <b>${WA_LABEL[tag]}</b>.`})}
});

D("G3",{name:"Verben im Präsens",y:"Kl. 2–3",pre:["G1"],
  card:{rule:"ich -e, du -st, er/sie/es -t. Viele starke Verben ändern bei du und er den Vokal: a→ä, e→i/ie.",
    ex:"laufen: du läufst, er läuft · lesen: du liest, er liest · geben: du gibst, er gibt",vocab:"konjugieren · conjugar · to conjugate"},
  sheet:`<div class="ex">spielen: ich spiele · du spielst · er spielt · wir spielen · ihr spielt · sie spielen</div>
   <p>Bei manchen Verben wechselt der Vokal – aber <b>nur bei du und er/sie/es</b>:</p>
   <ul class="clean"><li>a → ä: fahren → du fährst · laufen → du läufst · schlafen → du schläfst</li><li>e → i: geben → du gibst · helfen → du hilfst · sprechen → du sprichst</li><li>e → ie: lesen → du liest · sehen → du siehst</li></ul>
   <p class="muted small">Endet der Stamm auf -s, -ß, -z, kommt bei du nur -t: du isst, du schießt, du sitzt.</p>`,
  gen(){const v=pick(VERBS),du=Math.random()<0.5,subj=du?"Du":pick(["Marco","Lena","Er","Der Trainer"]),right=du?v.du:v.er;
    const plain=stem(v)+(du?"st":"t");
    return mcItem({prompt:`Ergänze im Präsens: <b>${subj} ___ ${v.ctx}.</b> <span class="muted">(${v.inf})</span>`,right,wrong:shuffle(uniq([plain,du?v.er:v.du,v.inf,stem(v)+"e"])),
      errMap:{[plain]:"umlaut"},err:"person",hint:du?"Die Endung bei du ist -st. Ändert sich der Vokal?":"Die Endung bei er/sie ist -t. Ändert sich der Vokal?",
      sol:`${v.inf}: du <b>${v.du}</b>, er <b>${v.er}</b> → ${subj} <b>${right}</b> ${v.ctx}.`})}
});

D("G4",{name:"Präteritum",y:"Kl. 3–5",pre:["G3"],
  card:{rule:"Die Erzählzeit. Schwache Verben: -te (spielte). Starke Verben ändern den Vokal (laufen → lief) – die muss man lernen.",
    ex:"spielen → er spielte · laufen → er lief · gehen → er ging · sein → er war",vocab:"das Präteritum · el pretérito · simple past"},
  sheet:`<p>Geschichten und Berichte stehen im <b>Präteritum</b>.</p>
   <ul class="clean"><li><b>Schwach (regelmäßig):</b> Stamm + -te: spielen → spielte, kaufen → kaufte</li><li><b>Stark (unregelmäßig):</b> neuer Vokal, keine Endung: laufen → lief, fahren → fuhr, schießen → schoss, gewinnen → gewann</li><li><b>Gemischt:</b> bringen → brachte, denken → dachte, rennen → rannte</li></ul>
   <div class="ex">Lernreihe: laufen – lief – gelaufen · fahren – fuhr – gefahren · finden – fand – gefunden</div>`,
  gen(){const v=pick(VERBS),weak=stem(v)+"te",subj=pick(["Otto","Marco","Lena","Der Trainer"]);
    return mcItem({prompt:`Ergänze im Präteritum: <b>Gestern ___ ${subj} ${v.ctx}.</b> <span class="muted">(${v.inf})</span>`,right:v.prt,
      wrong:shuffle(uniq([weak,v.er,v.p2,stem(v)+"t",v.inf]).filter(x=>x!==v.prt)),errMap:{[weak]:"schwach"},err:"merken",
      hint:strong(v)?"Das ist ein starkes Verb: Der Vokal ändert sich, es gibt kein -te.":"Das ist ein schwaches Verb: Stamm + -te.",
      sol:`${v.inf} – <b>${v.prt}</b> – ${v.p2} → Gestern ${v.prt} ${subj} ${v.ctx}.`})}
});

D("G5",{name:"Perfekt",y:"Kl. 3–5",pre:["G4"],
  card:{rule:"Perfekt = haben oder sein + Partizip II. Mit sein: Bewegung von A nach B oder Veränderung (gehen, fahren, fallen, bleiben).",
    ex:"Ich habe gespielt. · Ich bin gelaufen. · Wir sind geblieben.",vocab:"das Perfekt · el pretérito perfecto · present perfect"},
  sheet:`<p>Beim Sprechen erzählen wir meistens im <b>Perfekt</b>.</p>
   <ul class="clean"><li><b>haben</b> – die meisten Verben: hat gespielt, hat gelesen, hat gegessen</li><li><b>sein</b> – Ortswechsel oder Zustandsänderung: ist gelaufen, ist gefahren, ist gefallen, ist geblieben, ist gekommen</li></ul>
   <p><b>Partizip II:</b> schwach ge-…-t (gespielt), stark ge-…-en (gelaufen). Verben auf -ieren ohne ge-: trainiert.</p>`,
  gen(){const v=pick(VERBS),other=v.aux==="ist"?"hat":"ist",weakP=strong(v)?"ge"+stem(v)+"t":"ge"+stem(v)+"en",subj=pick(["Otto","Marco","Lena"]);
    const r=`${v.aux} … ${v.p2}`,o1=`${other} … ${v.p2}`,o2=`${v.aux} … ${weakP}`,o3=`${other} … ${weakP}`;
    return mcItem({prompt:`Setze ins Perfekt: <b>${subj} ___ ${v.ctx} ___.</b> <span class="muted">(${v.inf})</span>`,right:r,wrong:[o1,o2,o3],errMap:{[o1]:"hilfsverb",[o2]:"partizip",[o3]:"partizip"},
      hint:"Bewegt sich jemand von A nach B? Dann sein. Sonst haben.",sol:`${subj} <b>${v.aux}</b> ${v.ctx} <b>${v.p2}</b>.`})}
});

function caseSentence(cas){
  const pick2=c=>pick(NOUNS.filter(n=>c.includes(n.c)));
  const T={
    N:[["o","___ {N} ist neu."],["p","___ {N} lacht."],["la","___ {N} ist sehr groß."]],
    A:[["oa","Ich sehe ___ {N}."],["o","Otto sucht ___ {N}."],["o","Wir brauchen ___ {N}."],["p","Wir besuchen ___ {N}."],["p","Ich frage ___ {N}."]],
    D:[["p","Otto hilft ___ {N}."],["p","Wir danken ___ {N}."],["p","Das Trikot gehört ___ {N}."],["ol","Otto wartet neben ___ {N}."],["ol","Der Ball liegt hinter ___ {N}."]]
  };
  const [c,t]=pick(T[cas]);let n;do{n=pick2(c)}while(t.includes(n.w));const art=DEF[n.art][cas];
  let s=t.replace("{N}",n.w);
  return {n,art,s,full:s.replace("___",(t.startsWith("___")?art[0].toUpperCase()+art.slice(1):art))};
}
D("G6",{name:"Die vier Fälle bestimmen",y:"Kl. 4–5",pre:["G2"],
  card:{rule:"Nominativ: Wer oder was? · Genitiv: Wessen? · Dativ: Wem? · Akkusativ: Wen oder was? Frag immer mit dem Verb.",
    ex:"Der Trainer (Wer?) gibt dem Torwart (Wem?) den Ball (Wen oder was?).",vocab:"der Fall (Kasus) · el caso · case"},
  sheet:`<table><tr><th>Fall</th><th>Frage</th><th>der</th><th>die</th><th>das</th></tr><tr><td>Nominativ</td><td>Wer/Was?</td><td>der</td><td>die</td><td>das</td></tr><tr><td>Genitiv</td><td>Wessen?</td><td>des …(e)s</td><td>der</td><td>des …(e)s</td></tr><tr><td>Dativ</td><td>Wem?</td><td>dem</td><td>der</td><td>dem</td></tr><tr><td>Akkusativ</td><td>Wen/Was?</td><td>den</td><td>die</td><td>das</td></tr></table>
   <p>So fragst du: <i>Otto hilft dem Trainer.</i> → <b>Wem</b> hilft Otto? → dem Trainer → Dativ.</p>
   <p class="muted small">Spanisch-Brücke: Akkusativ ≈ complemento directo, Dativ ≈ complemento indirecto.</p>`,
  gen(){const NAMES={N:"Nominativ",G:"Genitiv",D:"Dativ",A:"Akkusativ"},Q={N:"Wer oder was?",G:"Wessen?",D:"Wem?",A:"Wen oder was?"};
    const GEN=[["Das Trikot","des Spielers","ist rot."],["Die Pfeife","des Schiedsrichters","ist laut."],["Der Bus","der Mannschaft","fährt um acht Uhr."],["Das Ende","des Spiels","war spannend."],["Die Tür","des Hauses","ist offen."],["Der Name","des Trainers","ist Juan."],["Das Dach","des Stadions","ist neu."],["Die Farbe","der Jacke","gefällt mir."]];
    const cas=pick(["N","A","D","D","A","G"]);let sent,phrase;
    if(cas==="G"){const g=pick(GEN);phrase=g[1];sent=`${g[0]} <b><u>${g[1]}</u></b> ${g[2]}`}
    else{const x=caseSentence(cas);phrase=`${x.art} ${x.n.w}`;sent=x.full.replace(new RegExp(`(${x.art} ${x.n.w}|${x.art[0].toUpperCase()+x.art.slice(1)} ${x.n.w})`),"<b><u>$1</u></b>")}
    const askQ=Math.random()<0.35;
    if(askQ)return mcItem({prompt:`Mit welcher Frage findest du das unterstrichene Satzglied?<br><span class="sent">${sent}</span>`,right:Q[cas],wrong:Object.values(Q).filter(q=>q!==Q[cas]),err:"kasus",
      hint:"Setz das Verb in die Frage ein: Wem hilft …? Wen sucht …?",sol:`Frage: <b>${Q[cas]}</b> → ${NAMES[cas]}`});
    return mcItem({prompt:`In welchem Fall steht das unterstrichene Satzglied?<br><span class="sent">${sent}</span>`,right:NAMES[cas],wrong:Object.values(NAMES).filter(n=>n!==NAMES[cas]),err:"kasus",
      hint:"Frag mit dem Verb: Wer? Wessen? Wem? Wen?",sol:`Frage: ${Q[cas]} → <b>${NAMES[cas]}</b>`})}
});

D("G7",{name:"Artikel im Akkusativ und Dativ",y:"Kl. 5–6",pre:["G6"],
  card:{rule:"der wird zu den (Akkusativ) oder dem (Dativ). die → der im Dativ. das → dem im Dativ.",
    ex:"der Ball: Ich sehe den Ball. Ich spiele mit dem Ball.",vocab:"die Deklination · la declinación · declension"},
  sheet:`<table><tr><th></th><th>der</th><th>die</th><th>das</th></tr><tr><td>Nominativ</td><td>der</td><td>die</td><td>das</td></tr><tr><td>Akkusativ</td><td><b>den</b></td><td>die</td><td>das</td></tr><tr><td>Dativ</td><td><b>dem</b></td><td><b>der</b></td><td><b>dem</b></td></tr></table>
   <p><b>Merksatz:</b> Im Akkusativ ändert sich nur der → den. Im Dativ ändert sich alles: dem, der, dem.</p>
   <p>Typische Dativ-Verben: helfen, danken, gehören, gefallen, antworten.</p>`,
  gen(){const cas=pick(["A","D","A","D","N"]),x=caseSentence(cas),opts=["der","die","das","den","dem"];
    const right=x.art,disp=x.s.startsWith("___")?x.s:x.s;
    return mcItem({prompt:`Welcher Artikel passt? <span class="muted">(${x.n.art} ${x.n.w})</span><br><b>${disp}</b>`,right,wrong:shuffle(opts.filter(o=>o!==right)).slice(0,3),err:"kasus",
      hint:cas==="D"?"Frag: Wem …? → Dativ: dem / der / dem.":cas==="A"?"Frag: Wen oder was …? → Akkusativ: den / die / das.":"Frag: Wer oder was …? → Nominativ.",
      sol:`${({N:"Nominativ",A:"Akkusativ",D:"Dativ"})[cas]}: <b>${x.full}</b>`,max:4})}
});

D("G8",{name:"Präpositionen mit Dativ oder Akkusativ",y:"Kl. 5–6",pre:["G7"],
  card:{rule:"Immer Dativ: aus, bei, mit, nach, seit, von, zu. Immer Akkusativ: durch, für, gegen, ohne, um. Wechsel (auf, unter, neben, hinter, vor): Wo? → Dativ, Wohin? → Akkusativ.",
    ex:"mit dem Bus · für den Trainer · Der Ball liegt unter dem Tisch (Wo?) · Ich lege den Ball unter den Tisch (Wohin?)",vocab:"die Präposition · la preposición · preposition"},
  sheet:`<p><b>Dativ-Präpositionen</b> (Merkspruch): <i>aus, bei, mit, nach, seit, von, zu – mit dem Dativ fährst du gut!</i></p>
   <p><b>Akkusativ-Präpositionen:</b> <i>durch, für, gegen, ohne, um</i> (Merkwort: DOGFU)</p>
   <p><b>Wechselpräpositionen:</b> an, auf, hinter, in, neben, über, unter, vor, zwischen</p>
   <div class="ex">Wo? (keine Bewegung) → Dativ: Die Tasche liegt auf dem Stuhl.<br>Wohin? (Bewegung) → Akkusativ: Ich lege die Tasche auf den Stuhl.</div>`,
  gen(){const type=pick(["D","A","W","W"]);let n,prep,cas,s,err;
    if(type==="D"){prep=pick(["mit","bei","von","zu","aus"]);n=pick(NOUNS.filter(x=>prep==="aus"?x.c==="l":PHYS.has(x.w)));cas="D";
      s=prep==="aus"?`Otto kommt gerade aus ___ ${n.w}.`:prep==="mit"?`Was machst du mit ___ ${n.w}?`:prep==="bei"?`Ich bin heute bei ___ ${n.w}.`:prep==="von"?`Das ist ein Geschenk von ___ ${n.w}.`:`Wir gehen zu ___ ${n.w}.`;
      if(prep==="bei"||prep==="von"||prep==="zu")n=pick(NOUNS.filter(x=>x.c==="p")),s=s.replace(/___ .*?([.?])$/,`___ ${n.w}$1`);err="praep"}
    else if(type==="A"){prep=pick(["für","ohne","gegen","durch"]);n=pick(NOUNS.filter(x=>prep==="durch"?x.c==="l":prep==="gegen"?PHYS.has(x.w):prep==="für"?x.c==="p":x.c==="o"&&x.w!=="Mannschaft"));cas="A";
      s=prep==="für"?`Das Geschenk ist für ___ ${n.w}.`:prep==="ohne"?`Otto geht nie ohne ___ ${n.w} los.`:prep==="gegen"?`Der Ball prallt gegen ___ ${n.w}.`:`Wir laufen durch ___ ${n.w}.`;err="praep"}
    else{prep=pick(["auf","unter","neben","hinter","vor"]);n=pick(NOUNS.filter(x=>PHYS.has(x.w)));const wo=Math.random()<0.5;cas=wo?"D":"A";
      s=wo?`Der Ball liegt ${prep} ___ ${n.w}.`:`Otto legt den Ball ${prep} ___ ${n.w}.`;err="wechsel"}
    const right=DEF[n.art][cas];
    return mcItem({prompt:`Welcher Artikel passt? <span class="muted">(${n.art} ${n.w})</span><br><b>${s}</b>`,right,wrong:shuffle(["der","die","das","den","dem"].filter(o=>o!==right)).slice(0,3),err,
      hint:type==="W"?"Wo? (liegt, steht) → Dativ. Wohin? (legt, stellt) → Akkusativ.":`„${prep}“ steht immer mit dem ${cas==="D"?"Dativ":"Akkusativ"}.`,
      sol:`${prep} + ${cas==="D"?"Dativ":"Akkusativ"} → <b>${s.replace("___",right)}</b>`})}
});

const SG_SENT=[
"Der Trainer|S # gibt|P # dem Torwart|DO # heute|AB # einen neuen Ball|AO",
"Am Samstag|AB # gewinnt|P # unsere Mannschaft|S # das Spiel|AO",
"Otto|S # schenkt|P # seiner Schwester|DO # ein Trikot|AO",
"Die Fans|S # singen|P # im Stadion|AB # ein Lied|AO",
"Nach dem Spiel|AB # zeigt|P # der Schiedsrichter|S # dem Kapitän|DO # die Gelbe Karte|AO",
"Mein Bruder|S # leiht|P # mir|DO # sein Fahrrad|AO",
"Der Hund|S # bringt|P # dem Jungen|DO # den Ball|AO",
"Die Lehrerin|S # erklärt|P # der Klasse|DO # die Aufgabe|AO",
"Gestern|AB # kaufte|P # Marco|S # neue Fußballschuhe|AO",
"Im Internat|AB # schreibt|P # Otto|S # seiner Mutter|DO # einen Brief|AO",
"Der Torwart|S # hält|P # den Elfmeter|AO",
"Die Kinder|S # spielen|P # nach der Schule|AB # Tennis|AO",
"Papa|S # erzählt|P # den Kindern|DO # eine Geschichte|AO",
"Leider|AB # verliert|P # der Favorit|S # das Finale|AO",
"Der Kapitän|S # reicht|P # dem Gegner|DO # die Hand|AO",
"Am Abend|AB # schickt|P # Lena|S # ihrer Oma|DO # ein Foto|AO"
].map(s=>s.split(" # ").map(p=>{const [t,r]=p.split("|");return {t,r}}));
const SG_NAME={S:"Subjekt",P:"Prädikat",AO:"Akkusativobjekt",DO:"Dativobjekt"},SG_Q={S:"Wer oder was?",P:"Was tut …?",AO:"Wen oder was?",DO:"Wem?"};
D("G9",{name:"Satzglieder",y:"Kl. 5–6",pre:["G6"],
  card:{rule:"Satzglieder findest du mit der Umstellprobe. Subjekt: Wer oder was? · Prädikat: das gebeugte Verb · Akkusativobjekt: Wen oder was? · Dativobjekt: Wem?",
    ex:"Der Trainer | gibt | dem Torwart | einen Ball. → Dem Torwart | gibt | der Trainer | einen Ball.",vocab:"das Satzglied · el complemento / sintagma · sentence part"},
  sheet:`<p><b>Umstellprobe:</b> Stell den Satz um. Wörter, die immer zusammen wandern, bilden ein Satzglied.</p>
   <div class="ex">Otto | schreibt | seiner Mutter | einen Brief.<br>Einen Brief | schreibt | Otto | seiner Mutter.</div>
   <ul class="clean"><li><b>Prädikat:</b> das gebeugte Verb, im Aussagesatz an 2. Stelle</li><li><b>Subjekt:</b> Wer oder was schreibt? → Otto</li><li><b>Akkusativobjekt:</b> Wen oder was schreibt Otto? → einen Brief</li><li><b>Dativobjekt:</b> Wem schreibt Otto? → seiner Mutter</li><li><b>Adverbiale Bestimmung:</b> Wann? Wo? Wie? Warum? → im Internat, gestern</li></ul>`,
  gen(){const s=pick(SG_SENT);
    if(Math.random()<0.25){const n=s.length;return mcItem({prompt:`Wie viele Satzglieder hat dieser Satz?<br><span class="sent">${s.map(p=>p.t).join(" ")}.</span>`,right:String(n),wrong:[String(n-1),String(n+1),String(s.map(p=>p.t).join(" ").split(" ").length)],err:"satzglied",
      hint:"Stell den Satz in Gedanken um. Was bleibt zusammen?",sol:`${s.map(p=>p.t).join(" | ")} → <b>${n}</b> Satzglieder`})}
    const roles=s.map(p=>p.r).filter(r=>SG_NAME[r]),role=pick(roles);
    const tokens=[],answer=new Set();s.forEach(p=>p.t.split(" ").forEach(w=>{if(p.r===role)answer.add(tokens.length);tokens.push(w)}));tokens.push(".");
    return tapItem({prompt:`Tippe das <b>${SG_NAME[role]}</b> an (alle Wörter, die dazugehören).`,tokens,answer,err:"satzglied",
      hint:`Frag: ${SG_Q[role]} – und mach die Umstellprobe.`,sol:`${SG_NAME[role]}: <b>${s.find(p=>p.r===role).t}</b> (${SG_Q[role]})`})}
});

const HN=[
{p:"Otto bleibt zu Hause, ___ er krank ist.",r:"weil",w:["obwohl","aber","damit"]},
{p:"Wir spielen draußen, ___ es regnet.",r:"obwohl",w:["weil","denn","damit"]},
{p:"Der Trainer sagt, ___ wir gut gespielt haben.",r:"dass",w:["das","weil","ob"]},
{p:"___ der Schiedsrichter pfiff, jubelten die Fans.",r:"Als",w:["Wenn","Ob","Damit"]},
{p:"___ es morgen schneit, fällt das Training aus.",r:"Wenn",w:["Als","Dass","Obwohl"]},
{p:"Otto trainiert jeden Tag, ___ er besser wird.",r:"damit",w:["obwohl","als","ob"]},
{p:"Ich weiß nicht, ___ der Bus heute fährt.",r:"ob",w:["dass","weil","als"]},
{p:"Lena ist müde, ___ sie hat schlecht geschlafen.",r:"denn",w:["weil","obwohl","dass"]},
{p:"Wir gewinnen, ___ wir zusammenhalten.",r:"wenn",w:["als","ob","obwohl"]},
{p:"Er lacht, ___ er verloren hat.",r:"obwohl",w:["weil","damit","ob"]}
];
const HN_ORDER=[
["Ich weiß, dass er morgen kommt.","Ich weiß, dass er kommt morgen.","Ich weiß, dass kommt er morgen."],
["Otto ist froh, weil sein Team gewonnen hat.","Otto ist froh, weil sein Team hat gewonnen.","Otto ist froh, weil hat sein Team gewonnen."],
["Wenn es regnet, spielen wir in der Halle.","Wenn es regnet, wir spielen in der Halle.","Wenn regnet es, spielen wir in der Halle."],
["Obwohl sie müde war, lief sie weiter.","Obwohl sie war müde, lief sie weiter.","Obwohl sie müde war, sie lief weiter."],
["Ich hoffe, dass du bald kommst.","Ich hoffe, dass du kommst bald.","Ich hoffe, dass kommst du bald."],
["Als der Zug ankam, stiegen alle aus.","Als der Zug ankam, alle stiegen aus.","Als kam der Zug an, stiegen alle aus."],
["Marco fragt, ob wir mitspielen.","Marco fragt, ob spielen wir mit.","Marco fragt, ob wir spielen mit."],
["Wir warten, bis der Regen aufhört.","Wir warten, bis der Regen hört auf.","Wir warten, bis hört der Regen auf."]
];
D("G10",{name:"Haupt- und Nebensatz",y:"Kl. 5–6",pre:["G9"],
  card:{rule:"Hauptsatz: Verb an 2. Stelle. Nebensatz (weil, dass, wenn, obwohl, als, ob …): gebeugtes Verb ganz am Ende. Dazwischen steht ein Komma.",
    ex:"Otto bleibt zu Hause, weil er krank ist.",vocab:"der Nebensatz · la oración subordinada · subordinate clause"},
  sheet:`<ul class="clean"><li><b>Satzreihe:</b> Hauptsatz + Hauptsatz, verbunden mit und, aber, denn, oder. <i>Lena ist müde, denn sie hat schlecht geschlafen.</i></li>
   <li><b>Satzgefüge:</b> Hauptsatz + Nebensatz. Der Nebensatz beginnt mit einer Konjunktion, das Verb steht am Ende. <i>Lena ist müde, weil sie schlecht geschlafen hat.</i></li></ul>
   <p><b>Bedeutung der Konjunktionen:</b> weil/denn = Grund · obwohl = Gegensatz · damit = Zweck · wenn = Bedingung/Zeit · als = einmalig in der Vergangenheit · ob = indirekte Ja/Nein-Frage · dass = Inhalt</p>
   <p class="muted small">Steht der Nebensatz vorne, beginnt der Hauptsatz mit dem Verb: Wenn es regnet, <b>spielen</b> wir drinnen.</p>`,
  gen(){if(Math.random()<0.55){const x=pick(HN);return mcItem({prompt:`Welche Konjunktion passt?<br><b>${x.p}</b>`,right:x.r,wrong:x.w,err:"konjunktion",
      hint:"Grund → weil/denn · Gegensatz → obwohl · Zweck → damit · einmal in der Vergangenheit → als.",sol:`<b>${x.p.replace("___",x.r)}</b>`})}
    const x=pick(HN_ORDER);return mcItem({prompt:"Welcher Satz ist richtig gebaut?",right:x[0],wrong:x.slice(1),max:3,err:"verbstellung",
      hint:"Im Nebensatz steht das gebeugte Verb ganz am Ende.",sol:`<b>${x[0]}</b>`})}
});

const MODAL={können:["kann","kannst","kann","können","könnt","können"],müssen:["muss","musst","muss","müssen","müsst","müssen"],dürfen:["darf","darfst","darf","dürfen","dürft","dürfen"],sollen:["soll","sollst","soll","sollen","sollt","sollen"],wollen:["will","willst","will","wollen","wollt","wollen"],mögen:["mag","magst","mag","mögen","mögt","mögen"]};
const PRON=["Ich","Du","Er","Wir","Ihr","Die Kinder"];
const MODAL_MEAN=[
{p:"Otto hat die Erlaubnis, länger aufzubleiben. → Otto ___ länger aufbleiben.",r:"darf",w:["muss","soll","will"]},
{p:"Es ist Pflicht: Alle tragen Schienbeinschoner. → Alle ___ Schienbeinschoner tragen.",r:"müssen",w:["dürfen","mögen","können"]},
{p:"Lena hat den Wunsch, Profi zu werden. → Lena ___ Profi werden.",r:"will",w:["muss","darf","soll"]},
{p:"Marco ist fähig, mit links zu schießen. → Marco ___ mit links schießen.",r:"kann",w:["muss","soll","darf"]},
{p:"Der Trainer sagt: „Räumt die Bälle auf!“ → Wir ___ die Bälle aufräumen.",r:"sollen",w:["dürfen","können","mögen"]},
{p:"Es ist verboten, im Internat zu rennen. → Man ___ im Internat nicht rennen.",r:"darf",w:["muss","will","mag"]},
{p:"Otto isst gern Pizza. → Otto ___ Pizza.",r:"mag",w:["muss","darf","soll"]}
];
D("G11",{name:"Modalverben",y:"Kl. 6",pre:["G3"],
  card:{rule:"können (Fähigkeit), müssen (Pflicht), dürfen (Erlaubnis), sollen (Auftrag), wollen (Wunsch), mögen (gern haben). Das zweite Verb steht im Infinitiv am Ende.",
    ex:"Ich kann gut Tennis spielen. · Du darfst heute länger aufbleiben.",vocab:"das Modalverb · el verbo modal · modal verb"},
  sheet:`<table><tr><th></th><th>können</th><th>müssen</th><th>dürfen</th><th>wollen</th></tr><tr><td>ich</td><td>kann</td><td>muss</td><td>darf</td><td>will</td></tr><tr><td>du</td><td>kannst</td><td>musst</td><td>darfst</td><td>willst</td></tr><tr><td>er/sie</td><td>kann</td><td>muss</td><td>darf</td><td>will</td></tr><tr><td>wir</td><td>können</td><td>müssen</td><td>dürfen</td><td>wollen</td></tr></table>
   <p class="muted small">Achtung: ich und er/sie/es haben die gleiche Form und <b>keine</b> Endung: ich kann, er kann.</p>
   <p>In Vorgangsbeschreibungen oft: <i>Man muss den Teig 10 Minuten rühren.</i></p>`,
  gen(){if(Math.random()<0.35){const x=pick(MODAL_MEAN);return mcItem({prompt:`Welches Modalverb passt?<br><b>${x.p}</b>`,right:x.r,wrong:x.w,err:"wortschatz",
      hint:"Fähigkeit → können · Pflicht → müssen · Erlaubnis → dürfen · Wunsch → wollen · Auftrag → sollen.",sol:`<b>${x.p.split("→")[1].replace("___",x.r).trim()}</b>`})}
    const inf=pick(Object.keys(MODAL)),i=rnd(0,5),f=MODAL[inf],right=f[i],rest=inf==="mögen"?"Fußball.":"heute Tennis spielen.";
    return mcItem({prompt:`Ergänze: <b>${PRON[i]} ___ ${rest}</b> <span class="muted">(${inf})</span>`,right,wrong:shuffle(uniq(f.filter(x=>x!==right).concat([inf]))),err:"person",
      hint:"ich und er/sie/es: gleiche Form ohne Endung. du: -st. wir/sie: wie der Infinitiv.",sol:`${inf}: <b>${PRON[i]} ${right}</b> ${rest}`})}
});

const PASSIV=[
["Der Trainer lobt den Spieler.","Der Spieler wird vom Trainer gelobt.","Der Spieler lobt den Trainer.","Der Trainer wird vom Spieler gelobt."],
["Die Fans feiern die Mannschaft.","Die Mannschaft wird von den Fans gefeiert.","Die Fans werden von der Mannschaft gefeiert.","Die Mannschaft feiert die Fans."],
["Otto wäscht das Trikot.","Das Trikot wird von Otto gewaschen.","Otto wird vom Trikot gewaschen.","Das Trikot wäscht Otto."],
["Der Schiedsrichter pfeift das Spiel an.","Das Spiel wird vom Schiedsrichter angepfiffen.","Der Schiedsrichter wird vom Spiel angepfiffen.","Das Spiel pfeift den Schiedsrichter an."],
["Mama backt den Kuchen.","Der Kuchen wird von Mama gebacken.","Mama wird vom Kuchen gebacken.","Der Kuchen backt Mama."],
["Die Lehrerin korrigiert die Hefte.","Die Hefte werden von der Lehrerin korrigiert.","Die Lehrerin wird von den Heften korrigiert.","Die Hefte korrigieren die Lehrerin."]
];
const PASSIV_ID=[
["Der Teig wird zehn Minuten gerührt.","Passiv"],["Man rührt den Teig zehn Minuten.","Aktiv"],["Das Tor wurde von Marco geschossen.","Passiv"],["Marco schoss das Tor.","Aktiv"],
["Die Tomaten werden klein geschnitten.","Passiv"],["Zuerst schneidet man die Tomaten klein.","Aktiv"],["Die Bälle werden nach dem Training eingesammelt.","Passiv"],["Der Torwart wird für seine Paraden gelobt.","Passiv"],["Die Kinder spielen im Garten.","Aktiv"]
];
D("G12",{name:"Aktiv und Passiv",y:"Kl. 6",pre:["G5"],
  card:{rule:"Aktiv: Wer tut etwas? Passiv: Was wird getan? Passiv = werden + Partizip II. In Vorgangsbeschreibungen ist das Passiv typisch.",
    ex:"Aktiv: Der Trainer lobt den Spieler. → Passiv: Der Spieler wird (vom Trainer) gelobt.",vocab:"das Passiv · la voz pasiva · passive voice"},
  sheet:`<ul class="clean"><li><b>Aktiv:</b> Der Handelnde steht im Mittelpunkt. <i>Otto wäscht das Trikot.</i></li><li><b>Passiv:</b> Die Handlung steht im Mittelpunkt. <i>Das Trikot wird gewaschen.</i></li></ul>
   <div class="ex">Umformen: Akkusativobjekt → Subjekt · werden + Partizip II · Handelnder mit „von“ (oder weglassen)</div>
   <p>Präteritum: <i>Das Trikot <b>wurde</b> gewaschen.</i></p>`,
  gen(){if(Math.random()<0.5){const x=pick(PASSIV);return mcItem({prompt:`Wie heißt der Satz im <b>Passiv</b>?<br><span class="sent">${x[0]}</span>`,right:x[1],wrong:x.slice(2),max:3,err:"falsch",
      hint:"Das Akkusativobjekt wird zum Subjekt. Dann: werden + Partizip II, der Handelnde mit „von“.",sol:`<b>${x[1]}</b>`})}
    const x=pick(PASSIV_ID);return mcItem({prompt:`Aktiv oder Passiv?<br><span class="sent">${x[0]}</span>`,right:x[1],wrong:[x[1]==="Aktiv"?"Passiv":"Aktiv"],max:2,err:"falsch",
      hint:"Steht „werden/wird/wurde“ + Partizip II im Satz? Dann Passiv.",sol:`<b>${x[1]}</b>`})}
});

/* =====================================================================
   RECHTSCHREIBUNG
   ===================================================================== */
const CAP_SENT=["Am Samstag spielt unsere Mannschaft gegen Pozuelo.","Der Trainer gibt jedem Spieler eine Flasche Wasser.","Nach der Schule fährt Otto mit dem Fahrrad nach Hause.","Im Internat gibt es ein großes Schwimmbad.","Meine Schwester liest gern spannende Bücher.","Der Hund bellt laut, wenn es klingelt.","Am Abend schauen wir das Spiel im Fernsehen.","Die Kinder bauen im Garten ein Zelt auf.","Marco schießt den Ball über das Tor.","Im Winter liegt in den Bergen viel Schnee.","Mein Vater kocht am Sonntag eine leckere Suppe.","Die Lehrerin erklärt die Aufgabe noch einmal.","Vor dem Training packt Otto seine Tasche.","In London regnet es oft im November.","Der Torwart hält den Elfmeter mit beiden Händen.","Wir essen zum Frühstück Brot mit Käse."];
D("R1",{name:"Groß- und Kleinschreibung",y:"Kl. 2–4",pre:[],
  card:{rule:"Groß: Satzanfang und Nomen. Nomen-Test: Kann man der/die/das davorsetzen? Gibt es eine Mehrzahl? Ist es ein Ding, Lebewesen, Gefühl?",
    ex:"Der Torwart hält den Elfmeter mit beiden Händen.",vocab:"großschreiben · escribir con mayúscula · capitalise"},
  sheet:`<p>Im Deutschen schreibt man <b>alle Nomen groß</b> – anders als im Spanischen und Englischen.</p>
   <ul class="clean"><li>Artikel-Probe: <i>der Elfmeter</i> ✓ → groß</li><li>Mehrzahl-Probe: <i>die Hände</i> ✓ → groß</li><li>Auch Wochentage, Monate, Länder und Namen: Samstag, November, London</li></ul>
   <p class="muted small">Adjektive (spannend, groß), Verben (spielen) und Präpositionen (mit, nach) schreibt man klein.</p>`,
  gen(){const s=pick(CAP_SENT),toks=s.replace(/([.,])/g," $1").split(" "),answer=new Set();toks.forEach((t,i)=>{if(/^[A-ZÄÖÜ]/.test(t))answer.add(i)});
    return tapItem({prompt:`Hier ist alles klein geschrieben. Tippe <b>alle Wörter</b> an, die man <b>großschreiben</b> muss. <span class="muted">(Es sind ${answer.size}.)</span>`,tokens:toks,display:toks.map(t=>t.toLowerCase()),answer,err:"gross",
      hint:"Satzanfang + jedes Nomen. Probier bei jedem Wort: der/die/das davor?",sol:`<b>${s}</b>`})}
});

const R2W=[["Hun_","d","t","die Hunde"],["Wal_","d","t","die Wälder"],["Zel_","t","d","die Zelte"],["Bil_","d","t","die Bilder"],["Kin_","d","t","die Kinder"],["Hu_","t","d","die Hüte"],["Mun_","d","t","der Mund – die Münder"],["Bro_","t","d","die Brote"],["Fel_","d","t","die Felder"],["Freun_","d","t","die Freunde"],["Gas_","t","d","die Gäste"],["Zu_","g","k","die Züge"],["We_","g","k","die Wege"],["Ta_","g","k","die Tage"],["Ber_","g","k","die Berge"],["Sie_","g","k","die Siege"],["Schran_","k","g","die Schränke"],["Ban_","k","g","die Bänke"],["Kor_","b","p","die Körbe"],["Die_","b","p","die Diebe"],["Kal_","b","p","die Kälber"],["run_","d","t","runde"],["gel_","b","p","gelbe"],["kal_","t","d","kalte"],["kran_","k","g","kranke"],["wil_","d","t","wilde"],["Stran_","d","t","die Strände"],["Flu_","g","k","die Flüge"],["Bur_","g","k","die Burgen"],["Hel_","d","t","die Helden"]];
D("R2",{name:"Verlängern: d/t, g/k, b/p",y:"Kl. 2–3",pre:["R1"],
  card:{rule:"Am Wortende klingen d und t, g und k, b und p gleich. Verlängere das Wort – dann hörst du es: der Hund → die Hunde.",
    ex:"Hund (die Hunde) · Zug (die Züge) · gelb (gelbe)",vocab:"verlängern · alargar · extend"},
  sheet:`<p><b>Strategie Verlängern</b> (FRESCH): Mach aus dem Wort eine längere Form.</p>
   <ul class="clean"><li>Nomen → Mehrzahl: der Wald → die Wälder → d</li><li>Adjektiv → mit Endung: rund → runde → d</li><li>Verb → Infinitiv: er lebt → leben → b</li></ul>`,
  gen(){const x=pick(R2W),word=x[0].replace("_",x[1]);
    return mcItem({prompt:`Welcher Buchstabe fehlt? <b>${x[0].replace("_","<u>&nbsp;?&nbsp;</u>")}</b>`,right:x[1],wrong:[x[2]],max:2,err:"verlaengern",
      hint:"Verlängere das Wort: Mehrzahl oder mit Endung.",sol:`${x[3]} → <b>${word}</b>`,listen:word})}
});

const R3W=[["H_nde","ä","e","die Hand"],["K_lte","ä","e","kalt"],["B_ume","äu","eu","der Baum"],["M_use","äu","eu","die Maus"],["l_nger","ä","e","lang"],["St_dte","ä","e","die Stadt"],["R_der","ä","e","das Rad"],["Tr_ume","äu","eu","der Traum"],["H_user","äu","eu","das Haus"],["W_lder","ä","e","der Wald"],["B_cker","ä","e","backen"],["Spr_ng","e","ä","kein verwandtes Wort mit a"],["H_ft","e","ä","kein verwandtes Wort mit a"],["B_tt","e","ä","kein verwandtes Wort mit a"],["L_ute","eu","äu","kein verwandtes Wort mit au"],["h_ute","eu","äu","kein verwandtes Wort mit au"],["F_uer","eu","äu","kein verwandtes Wort mit au"],["Fr_unde","eu","äu","kein verwandtes Wort mit au"],["W_tter","e","ä","kein verwandtes Wort mit a"],["N_tz","e","ä","kein verwandtes Wort mit a"],["G_ste","ä","e","der Gast"],["Z_hne","ä","e","der Zahn"],["L_ufer","äu","eu","laufen"],["S_tze","ä","e","der Satz"]];
D("R3",{name:"Ableiten: ä/e und äu/eu",y:"Kl. 3",pre:["R1"],
  card:{rule:"ä und e klingen gleich, äu und eu auch. Gibt es ein verwandtes Wort mit a oder au? Dann ä oder äu.",
    ex:"Hände ← Hand · Bäume ← Baum · aber: Heft, heute (kein a/au)",vocab:"ableiten · derivar · derive"},
  sheet:`<p><b>Strategie Ableiten</b> (FRESCH): Such ein verwandtes Wort, das du sicher schreiben kannst.</p>
   <div class="ex">Kälte ← kalt → ä<br>Träume ← Traum → äu<br>Leute ← ??? → kein au → eu</div>
   <p class="muted small">Ein paar Wörter mit ä muss man sich merken: Mädchen, Bär, Käfer, Käse.</p>`,
  gen(){const x=pick(R3W),word=x[0].replace("_",x[1]);
    return mcItem({prompt:`Was fehlt? <b>${x[0].replace("_","<u>&nbsp;?&nbsp;</u>")}</b>`,right:x[1],wrong:[x[2]],max:2,err:"ableiten",
      hint:"Gibt es ein verwandtes Wort mit a oder au?",sol:`${x[3]} → <b>${word}</b>`,listen:word})}
});

const R4W=[["Sonne","Sone"],["kommen","komen"],["schwimmen","schwimen"],["Mutter","Muter"],["Teller","Teler"],["Zucker","Zuker"],["Brücke","Brüke"],["Jacke","Jake"],["Katze","Kaze"],["Hitze","Hize"],["Platz","Plaz"],["rennen","renen"],["Wasser","Waser"],["Butter","Buter"],["Zimmer","Zimer"],["Sommer","Somer"],["Decke","Deke"],["Glocke","Gloke"],["sitzen","sizen"],["packen","paken"],["Name","Namme"],["Hose","Hosse"],["Tiger","Tigger"],["Leder","Ledder"],["Rakete","Rakette"],["Kabine","Kabinne"],["Trikot","Trikkot"],["Ball","Bal"],["Netz","Nez"],["Blitz","Bliz"]];
D("R4",{name:"Schwingen: doppelte Mitlaute, ck, tz",y:"Kl. 3–4",pre:["R1"],
  card:{rule:"Schwing das Wort in Silben. Kurzer, betonter Vokal → der Mitlaut danach kommt doppelt (nn, mm, ll, tt). Statt kk schreibt man ck, statt zz schreibt man tz.",
    ex:"Son-ne · kom-men · Zu-cker · Kat-ze – aber: Na-me (langes a, einfach)",vocab:"der Doppelkonsonant · la consonante doble · double consonant"},
  sheet:`<p><b>Strategie Schwingen</b> (FRESCH): Sprich das Wort in Silben und klatsch dazu.</p>
   <ul class="clean"><li>Kurzer Vokal: <b>Son</b>-ne → nn · <b>Mut</b>-ter → tt</li><li>Langer Vokal: <b>Na</b>-me → nur ein m</li><li>ck statt kk: Zu-<b>ck</b>er, Brü-<b>ck</b>e</li><li>tz statt zz: Kat-<b>z</b>e → Ka<b>tz</b>e</li></ul>
   <p class="muted small">Bei einsilbigen Wörtern verlängern: Ball → Bälle, Platz → Plätze.</p>`,
  gen(){const x=pick(R4W);
    return mcItem({prompt:`Hör genau hin und wähle: Wie schreibt man das Wort?`,right:x[0],wrong:[x[1]],max:2,err:"schwingen",listen:x[0],
      hint:"Schwing das Wort in Silben. Ist der betonte Vokal kurz oder lang?",sol:`<b>${x[0]}</b>`})}
});

const R5W=[["Spiel","Spil","Spihl"],["Biene","Bine","Bihne"],["Zahn","Zan","Zaan"],["fahren","faren","faaren"],["Uhr","Ur","Uur"],["Boot","Bot","Boht"],["Meer","Mer","Mehr"],["Haar","Har","Hahr"],["Tier","Tir","Tihr"],["Lehrer","Lerer","Leerer"],["Schuh","Schu","Schuu"],["Zoo","Zo","Zoh"],["See","Se","Seh"],["wohnen","wonen","woonen"],["Igel","Iegel","Ihgel"],["Tiger","Tieger","Tihger"],["Krokodil","Krokodiel","Krokodihl"],["Maschine","Maschiene","Maschihne"],["ziehen","zieen","zihen"],["Stuhl","Stul","Stuul"],["Bahn","Ban","Baan"],["Fehler","Feler","Feeler"],["Saal","Sal","Sahl"]];
D("R5",{name:"Lange Vokale: ie, h, aa/ee/oo",y:"Kl. 3–4",pre:["R4"],
  card:{rule:"Langes i schreibt man meist ie (Spiel). Ein Dehnungs-h (Zahn, Uhr) und Doppelvokale (Boot, Meer, Haar) muss man sich merken.",
    ex:"Spiel · Biene · Zahn · Boot · Meer – aber: Igel, Tiger (Merkwörter)",vocab:"der lange Vokal · la vocal larga · long vowel"},
  sheet:`<ul class="clean"><li><b>ie:</b> In deutschen Wörtern wird langes i fast immer <b>ie</b> geschrieben: Spiel, Tier, viel, Brief.</li><li><b>Merkwörter mit i:</b> Igel, Tiger, Bibel, mir, dir, wir · Fremdwörter: Krokodil, Maschine, Kino</li><li><b>Dehnungs-h</b> (oft vor l, m, n, r): Zahn, Uhr, wohnen, Stuhl, fahren</li><li><b>aa, ee, oo:</b> Haar, Saal, Meer, See, Boot, Zoo</li></ul>
   <p class="muted small">Strategie Merken: Diese Wörter in Gruppen lernen und oft schreiben.</p>`,
  gen(){const x=pick(R5W);return mcItem({prompt:"Hör genau hin und wähle die richtige Schreibung.",right:x[0],wrong:x.slice(1),max:3,err:"merken",listen:x[0],
      hint:"Langes i → meist ie. Bei h und Doppelvokal: Hast du das Wort schon oft gesehen?",sol:`<b>${x[0]}</b>`})}
});

const R6W=[["Fu_","ß","der Fuß – langes u"],["Flu_","ss","der Fluss – kurzes u"],["gro_","ß","groß – langes o"],["Stra_e","ß","die Straße – langes a"],["wei_","ß","weiß – nach ei"],["Schlo_","ss","das Schloss – kurzes o"],["Ku_","ss","der Kuss – kurzes u"],["Gru_","ß","der Gruß – langes u"],["Spa_","ß","der Spaß – langes a"],["Fa_","ss","das Fass – kurzes a"],["Klo_","ß","der Kloß – langes o"],["Pa_","ss","der Pass – kurzes a"],["drau_en","ß","draußen – nach au"],["Wa_er","ss","das Wasser – kurzes a"],["Bu_","s","der Bus – s am Ende, Plural Busse"],["Hau_","s","das Haus – Häuser, man hört s"],["Gla_","s","das Glas – Gläser, man hört s"],["hei_","ß","heiß – nach ei"],["Ri_","ss","der Riss – kurzes i"],["Gra_","s","das Gras – Gräser, man hört s"],["bi_chen","ss","bisschen – kurzes i"],["er i_t","ss","er isst – kurzes i"],["du mu_t","ss","du musst – kurzes u"],["wir a_en","ß","wir aßen – langes a"],["schie_en","ß","schießen – langes ie"],["Schü_e","ss","die Schüsse – kurzes ü"],["Grö_e","ß","die Größe – langes ö"],["Me_er","ss","das Messer – kurzes e"]];
D("R6",{name:"s, ss oder ß",y:"Kl. 4–6",pre:["R4","R5"],
  card:{rule:"Nach langem Vokal oder au/ei/eu: ß (Fuß, heiß). Nach kurzem Vokal: ss (Fluss, Wasser). Hörst du beim Verlängern ein weiches s: s (Haus – Häuser).",
    ex:"Fuß · groß · draußen — Fluss · Pass · Wasser — Bus · Gras",vocab:"das Eszett · la eszett · sharp s"},
  sheet:`<div class="ex">langer Vokal / Doppellaut → ß: Spaß, Straße, weiß, schießen<br>kurzer Vokal → ss: Schloss, Kuss, Schüsse, musst<br>weiches s beim Verlängern → s: Haus → Häuser, Gras → Gräser</div>
   <p>Bei Verben kann es wechseln: schießen (lang) → schoss (kurz) · essen (kurz) → aßen (lang).</p>`,
  gen(){const x=pick(R6W),w=x[0].replace("_",x[1]);
    return mcItem({prompt:`Was fehlt: s, ss oder ß? <b>${x[0].replace("_","<u>&nbsp;?&nbsp;</u>")}</b>`,right:x[1],wrong:["s","ss","ß"].filter(c=>c!==x[1]),max:3,err:"sz",listen:w.replace(/^(er|du|wir) /,""),
      hint:"Sprich das Wort langsam: Ist der Vokal davor lang oder kurz?",sol:`${x[2]} → <b>${w}</b>`})}
});

const DASS=[["Ich hoffe, ___ wir gewinnen.","dass"],["___ Spiel war spannend.","Das"],["Er sagt, ___ er krank ist.","dass"],["Ist ___ dein Trikot?","das"],["Das Buch, ___ ich lese, ist lustig.","das"],["Weißt du, ___ morgen Training ist?","dass"],["Ich glaube, ___ der Bus gleich kommt.","dass"],["Das Tor, ___ Marco geschossen hat, war wunderschön.","das"],["Es ist wichtig, ___ du pünktlich bist.","dass"],["Kennst du ___ Lied?","das"],["Mama freut sich, ___ ich angerufen habe.","dass"],["Ich finde es toll, ___ du mitkommst.","dass"],["Hast du gesehen, ___ der Torwart den Elfmeter gehalten hat?","dass"],["Wo ist ___ Ladekabel?","das"],["Das Haus, ___ am See steht, ist alt.","das"],["Der Trainer will, ___ wir früh schlafen gehen.","dass"],["___ ist eine gute Idee!","Das"],["Er erzählt, ___ er einen Hund hat.","dass"],["Das Mädchen, ___ neben mir sitzt, heißt Lena.","das"],["Ich weiß, ___ du das schaffst.","dass"]];
D("R7",{name:"das oder dass",y:"Kl. 5–6",pre:["G10"],
  card:{rule:"Ersatzprobe: Passt „dieses“, „jenes“ oder „welches“? Dann das. Leitet das Wort einen Nebensatz ein und passt keins davon? Dann dass.",
    ex:"Das Spiel (dieses Spiel) war toll. · Ich hoffe, dass wir gewinnen.",vocab:"dass · que (conjunción) · that"},
  sheet:`<ul class="clean"><li><b>das als Artikel:</b> das Spiel → <i>dieses</i> Spiel</li><li><b>das als Relativpronomen:</b> Das Buch, das ich lese … → <i>welches</i> ich lese</li><li><b>das als Pronomen:</b> Das ist gut. → <i>Dies</i> ist gut.</li><li><b>dass als Konjunktion:</b> nach sagen, hoffen, wissen, glauben, freuen … Ich hoffe, dass … → kein Ersatz möglich</li></ul>`,
  gen(){const x=pick(DASS),right=x[1],other=right.toLowerCase()==="dass"?"das":"dass";
    return mcItem({prompt:`Was passt? <b>${x[0]}</b>`,right,wrong:[x[0].startsWith("___")?other[0].toUpperCase()+other.slice(1):other],max:2,err:"dasdass",
      hint:"Setz „dieses“ oder „welches“ ein. Passt es?",sol:`<b>${x[0].replace("___",right)}</b> ${right.toLowerCase()==="das"?"(Ersatz mit dieses/welches möglich)":"(kein Ersatz möglich → Konjunktion)"}`})}
});

const NOMI=[["Beim ","Schwimmen"," bekam er einen Krampf.",1],["Wir gehen heute ","schwimmen",".",0],["Das ","Lesen"," macht mir Spaß.",1],["Ich habe etwas ","Neues"," gelernt.",1],["Zum ","Trainieren"," braucht man gute Schuhe.",1],["Er wünscht dir alles ","Gute",".",1],["Wir müssen jetzt ","laufen",".",0],["Viel ","Schönes"," ist passiert.",1],["Das ","Laufen"," im Regen ist anstrengend.",1],["Beim ","Essen"," spricht man nicht mit vollem Mund.",1],["Sie hat nichts ","Spannendes"," erlebt.",1],["Wir spielen ","morgen"," Tennis.",0],["Das ","Rennen"," war knapp.",1],["Er kann sehr schnell ","rennen",".",0],["Ich freue mich aufs ","Wandern",".",1],["Wenig ","Gutes"," kam dabei heraus.",1],["Sie liebt das ","Malen",".",1],["Otto will heute ","malen",".",0],["Das Spiel war ","spannend",".",0],["Zum ","Lachen"," ist das nicht.",1]];
D("R8",{name:"Nominalisierung",y:"Kl. 5–6",pre:["R1"],
  card:{rule:"Verben und Adjektive werden zu Nomen, wenn ein Signalwort davorsteht: das, beim, zum, aufs, etwas, viel, nichts, wenig, alles. Dann groß!",
    ex:"Beim Schwimmen … · etwas Neues · aber: Wir gehen schwimmen.",vocab:"die Nominalisierung · la sustantivación · nominalisation"},
  sheet:`<p><b>Signalwörter</b> machen aus Verben und Adjektiven Nomen:</p>
   <ul class="clean"><li>Artikel: <i>das Laufen, ein Lachen</i></li><li>Verschmolzene Präposition + Artikel: <i>beim (bei dem) Essen, zum (zu dem) Trainieren, aufs Wandern</i></li><li>Mengenwörter: <i>etwas Neues, viel Schönes, nichts Spannendes, alles Gute</i></li></ul>
   <p class="muted small">Kein Signalwort → klein: Wir gehen schwimmen. Das war spannend.</p>`,
  gen(){const x=pick(NOMI),up=x[1][0].toUpperCase()+x[1].slice(1),lo=x[1][0].toLowerCase()+x[1].slice(1),right=x[3]?up:lo,wrong=x[3]?lo:up;
    return mcItem({prompt:`Groß oder klein?<br><b>${x[0]}___${x[2]}</b>`,right,wrong:[wrong],max:2,err:"nominal",
      hint:"Steht ein Signalwort davor (das, beim, zum, etwas, viel, nichts …)?",sol:`<b>${x[0]}${right}${x[2]}</b>`})}
});

const KOMMA=[
["Otto blieb zu Hause, weil er krank war.","Otto blieb zu Hause weil er krank war.","Otto blieb, zu Hause weil er krank war.","Nebensatz mit weil"],
["Ich brauche Trikot, Schuhe und Stutzen.","Ich brauche Trikot, Schuhe, und Stutzen.","Ich brauche Trikot Schuhe, und Stutzen.","Aufzählung – kein Komma vor und"],
["Als der Schiedsrichter pfiff, jubelten die Fans.","Als der Schiedsrichter pfiff jubelten die Fans.","Als der Schiedsrichter, pfiff jubelten die Fans.","Nebensatz vorne – Komma danach"],
["Wir spielen draußen, obwohl es regnet.","Wir spielen draußen obwohl, es regnet.","Wir spielen, draußen obwohl es regnet.","Nebensatz mit obwohl"],
["Ich weiß, dass du gewinnen willst.","Ich weiß dass, du gewinnen willst.","Ich weiß dass du gewinnen willst.","Nebensatz mit dass"],
["Marco, Lucas und Otto spielen im Sturm.","Marco Lucas, und Otto spielen im Sturm.","Marco, Lucas, und Otto spielen im Sturm.","Aufzählung"],
["Der Ball, den Otto geschossen hat, war drin.","Der Ball den Otto geschossen hat, war drin.","Der Ball, den Otto geschossen hat war drin.","Relativsatz – vorne und hinten ein Komma"],
["Wenn es morgen schneit, fällt das Training aus.","Wenn es morgen schneit fällt das Training aus.","Wenn es morgen, schneit fällt das Training aus.","Nebensatz vorne"],
["Ich trainiere viel, denn ich will gewinnen.","Ich trainiere viel denn, ich will gewinnen.","Ich trainiere, viel denn ich will gewinnen.","Komma vor denn"],
["Papa, kommst du heute zum Spiel?","Papa kommst du heute zum Spiel?","Papa kommst du, heute zum Spiel?","Anrede"],
["Ja, ich komme mit.","Ja ich komme mit.","Ja ich, komme mit.","Ja/Nein am Satzanfang"],
["Sie lachte, sang und tanzte den ganzen Abend.","Sie lachte, sang, und tanzte den ganzen Abend.","Sie lachte sang und tanzte den ganzen Abend.","Aufzählung"],
["Nachdem wir gegessen hatten, gingen wir spazieren.","Nachdem wir gegessen hatten gingen wir spazieren.","Nachdem wir, gegessen hatten gingen wir spazieren.","Nebensatz vorne"],
["Es war kalt, aber wir spielten weiter.","Es war kalt aber, wir spielten weiter.","Es war, kalt aber wir spielten weiter.","Komma vor aber"],
["Lena fragt, ob wir mitkommen.","Lena fragt ob, wir mitkommen.","Lena fragt ob wir mitkommen.","Nebensatz mit ob"]
];
D("R9",{name:"Komma",y:"Kl. 5–6",pre:["G10"],
  card:{rule:"Komma zwischen Haupt- und Nebensatz (weil, dass, wenn, obwohl, als, ob …), in Aufzählungen (aber nicht vor und/oder), vor aber/denn, nach Anrede und Ja/Nein.",
    ex:"Otto blieb zu Hause, weil er krank war. · Trikot, Schuhe und Stutzen",vocab:"das Komma · la coma · comma"},
  sheet:`<ul class="clean"><li><b>Nebensatz:</b> Er wird immer mit Komma abgetrennt – egal ob vorne, hinten oder in der Mitte.</li><li><b>Aufzählung:</b> Trikot, Schuhe und Stutzen – kein Komma vor „und“.</li><li><b>aber, sondern, denn:</b> davor Komma.</li><li><b>Anrede/Ausruf:</b> Papa, kommst du? · Ja, gern.</li></ul>
   <p class="muted small">Pausen beim Sprechen sind kein sicherer Hinweis. Such das Verb am Ende – dann weißt du, wo der Nebensatz aufhört.</p>`,
  gen(){const x=pick(KOMMA);return mcItem({prompt:"Welcher Satz hat die Kommas richtig?",right:x[0],wrong:x.slice(1,3),max:3,err:"komma",
      hint:"Wo beginnt ein Nebensatz? Gibt es eine Aufzählung?",sol:`<b>${x[0]}</b> (${x[3]})`})}
});

const REDE_Q=[["Lauft schneller","!"],["Komm her","."],["Kommst du mit","?"],["Tor","!"],["Ich habe Hunger","."],["Wann beginnt das Spiel","?"],["Gib mir den Ball","!"],["Das war knapp","."]];
const REDE_S=["der Trainer","Otto","Lena","die Fans"];
D("R10",{name:"Wörtliche Rede",y:"Kl. 4–5",pre:["R9"],
  card:{rule:"Begleitsatz vorne: Doppelpunkt, dann „…“. Begleitsatz hinten: „…“, Komma, Begleitsatz – der Punkt der Rede fällt weg, ? und ! bleiben.",
    ex:"Der Trainer ruft: „Lauft schneller!“ · „Komm her“, sagt Otto. · „Kommst du mit?“, fragt Lena.",vocab:"die wörtliche Rede · el estilo directo · direct speech"},
  sheet:`<div class="ex">Vorne: Otto sagt: „Ich habe Hunger.“<br>Hinten: „Ich habe Hunger“, sagt Otto.<br>Frage hinten: „Kommst du mit?“, fragt Lena.</div>
   <p>Die deutschen Anführungszeichen: unten „ und oben “.</p>`,
  gen(){const [q,p]=pick(REDE_Q),sp=pick(REDE_S),pl=sp==="die Fans",verb=({"?":pl?"fragen":"fragt","!":pl?"rufen":"ruft",".":pl?"sagen":"sagt"})[p],s=[sp],Sp=sp[0].toUpperCase()+sp.slice(1),front=Math.random()<0.5;
    let right,wrong;
    if(front){right=`${Sp} ${verb}: „${q}${p}“`;wrong=[`${Sp} ${verb} „${q}${p}“`,`${Sp} ${verb}: ${q}${p}`,`${Sp} ${verb}, „${q}${p}“`]}
    else{const tail=p==="."?"":p;right=`„${q}${tail}“, ${verb} ${s[0]}.`;wrong=[`„${q}${p==="."?".":p}“ ${verb} ${s[0]}.`,`„${q}${tail}“ ${verb} ${s[0]}.`,`„${q}${tail},“ ${verb} ${s[0]}.`]}
    return mcItem({prompt:"Welche wörtliche Rede ist richtig gesetzt?",right,wrong:uniq(wrong).filter(w=>w!==right),max:3,err:"rede",
      hint:front?"Begleitsatz vorne → Doppelpunkt vor der Rede.":"Begleitsatz hinten → nach dem Schlusszeichen ein Komma. Ein Punkt in der Rede fällt weg.",sol:`<b>${right}</b>`})}
});

/* =====================================================================
   WORTSCHATZ
   ===================================================================== */
const BANK_HINT={W1:"Such den gemeinsamen Wortstamm. Bei Nachsilben: Sprich das Wort laut – was klingt richtig?",W2:"Lies den Satz mit jedem Wort. Welches beschreibt die Situation am genauesten?",W3:"Synonym = gleiche Bedeutung · Gegenteil = das Gegenstück · Oberbegriff = die Gruppe, zu der alle gehören.",W4:"Stell dir die Situation bildlich vor. Was ist eigentlich gemeint?"};
const bank=(id,name,y,pre,card,sheet,items,err)=>D(id,{name,y,pre,card,sheet,gen(){const x=pick(items),komp=/ \+ /.test(x[0]);return mcItem({prompt:x[0],right:x[1],wrong:x.slice(2,5),err:komp?"kompositum":err,fam:komp?"kompositum":(id==="W1"||id==="W3"?undefined:id),hint:komp?"Das LETZTE Wort bestimmt den Artikel.":BANK_HINT[id],sol:komp?`Das letzte Wort entscheidet → <b>${x[1]}</b>`:`<b>${x[1]}</b>`})}});
bank("W1","Wortbausteine und Wortfamilien","Kl. 5–6",["G2"],
  {rule:"Wörter bestehen aus Bausteinen: Vorsilbe (Präfix) + Stamm + Nachsilbe (Suffix). Wörter mit gleichem Stamm bilden eine Wortfamilie.",ex:"ver-spät-ung · Fahrer, Abfahrt, Fahrrad → Familie „fahren“",vocab:"der Wortstamm · la raíz · stem"},
  `<div class="ex">un + freund + lich → unfreundlich<br>Vorsilben: ver-, be-, ent-, un-, ab-, an-<br>Nachsilben: -ung, -heit, -keit, -schaft (Nomen) · -lich, -ig, -bar, -los (Adjektive)</div>
   <p>Bei zusammengesetzten Nomen bestimmt das <b>letzte</b> Wort den Artikel: der Fußball + der Schuh → <b>der</b> Fußballschuh · das Tor + der Wart → <b>der</b> Torwart.</p>`,
  [["Welches Wort gehört <b>nicht</b> zur Wortfamilie „fahren“?","Farbe","Fahrer","Abfahrt","Fahrrad"],
   ["Welches Wort gehört <b>nicht</b> zur Wortfamilie „spielen“?","Spiegel","Spieler","Spielplatz","verspielt"],
   ["Welches Wort gehört <b>nicht</b> zur Wortfamilie „schreiben“?","Schrei","Schrift","Schreibtisch","beschreiben"],
   ["Welches Wort gehört <b>nicht</b> zur Wortfamilie „laufen“?","Laub","Läufer","Wettlauf","Anlauf"],
   ["Welches Wort gehört <b>nicht</b> zur Wortfamilie „sehen“?","See","Fernseher","Sehtest","Aussicht"],
   ["Welches Wort gehört <b>nicht</b> zur Wortfamilie „bauen“?","Bauch","Baustelle","Gebäude","Bauer"],
   ["Mach aus „frei“ ein Nomen.","Freiheit","Freikeit","Freiung","Freischaft"],
   ["Mach aus „möglich“ ein Nomen.","Möglichkeit","Möglichheit","Möglichung","Möglichnis"],
   ["Mach aus „ordnen“ ein Nomen.","Ordnung","Ordnheit","Ordnkeit","Ordnschaft"],
   ["Mach aus „Freund“ ein Adjektiv.","freundlich","freundig","freundisch","freundbar"],
   ["Mach aus „Sonne“ ein Adjektiv.","sonnig","sonnlich","sonnisch","sonnbar"],
   ["Was man lesen kann, ist …","lesbar","leslich","lesig","lesisch"],
   ["Welche Nachsilbe passt? die Gesund___","heit","keit","ung","schaft"],
   ["Welche Nachsilbe passt? die Mann___ (das Team)","schaft","heit","keit","ung"],
   ["Welche Nachsilbe passt? die Sauber___","keit","heit","ung","schaft"],
   ["Welche Nachsilbe passt? die Erfahr___","ung","heit","keit","schaft"],
   ["Was ist der Wortstamm von „Verspätung“?","spät","Verspät","ung","Ver"],
   ["Was ist der Wortstamm von „unfreundlich“?","Freund","unfreund","lich","un"],
   ["Welches Wort hat eine Vorsilbe (Präfix)?","verlieren","Liebe","lieben","lieb"],
   ["der Fußball + der Schuh = …","der Fußballschuh","die Fußballschuh","das Fußballschuh","der Schuhfußball"],
   ["das Tor + der Wart = …","der Torwart","das Torwart","die Torwart","das Wartetor"],
   ["die Hand + der Schuh = …","der Handschuh","die Handschuh","das Handschuh","der Schuhhand"],
   ["der Schlaf + das Zimmer = …","das Schlafzimmer","der Schlafzimmer","die Schlafzimmer","das Zimmerschlaf"]],"falsch");
bank("W2","Wortfelder und treffende Verben","Kl. 5–6",[],
  {rule:"Statt immer sagen, gehen, machen: das genaue Wort nehmen. Das macht Texte lebendig – in Erzählungen ein Muss.",ex:"sagen → flüstern, rufen, brüllen, murmeln, antworten · gehen → schlendern, rennen, schleichen, humpeln",vocab:"das Wortfeld · el campo semántico · word field"},
  `<p><b>Wortfeld „sagen“:</b> flüstern (leise), rufen, brüllen (sehr laut), murmeln (undeutlich), fragen, antworten, erzählen, erklären, behaupten, befehlen</p>
   <p><b>Wortfeld „gehen“:</b> schlendern (langsam, gemütlich), rennen, sprinten (sehr schnell), schleichen (leise), humpeln (verletzt), hüpfen, stolpern, stapfen</p>
   <p><b>Wortfeld „sehen“:</b> blicken, starren (lange), spähen (heimlich), beobachten, entdecken</p>`,
  [["Sie ___ mir leise ein Geheimnis ins Ohr. <span class='muted'>(sagt)</span>","flüstert","brüllt","schreit","ruft"],
   ["Der Trainer ___ über den ganzen Platz: „Zurück!“ <span class='muted'>(sagt sehr laut)</span>","brüllt","flüstert","murmelt","erzählt"],
   ["Opa ___ uns eine lange Geschichte. <span class='muted'>(sagt)</span>","erzählt","flüstert","antwortet","befiehlt"],
   ["„Wo ist mein Schlüssel?“, ___ Mama.","fragt","antwortet","erzählt","behauptet"],
   ["„Im Schrank“, ___ Otto.","antwortet","fragt","befiehlt","flüstert"],
   ["Er ___ undeutlich vor sich hin. <span class='muted'>(spricht)</span>","murmelt","ruft","brüllt","erklärt"],
   ["Am Sonntag ___ wir gemütlich durch den Park. <span class='muted'>(gehen langsam)</span>","schlendern","sprinten","rennen","hetzen"],
   ["Der Dieb ___ leise durch das dunkle Haus.","schleicht","stampft","rennt","hüpft"],
   ["Der Stürmer ___ mit dem Ball zum Tor. <span class='muted'>(läuft sehr schnell)</span>","sprintet","schlendert","schleicht","humpelt"],
   ["Nach der Verletzung ___ er vom Platz.","humpelt","sprintet","hüpft","schlendert"],
   ["Das Kind ___ fröhlich auf einem Bein.","hüpft","schleicht","humpelt","stolpert"],
   ["Wir ___ einen Kuchen. <span class='muted'>(machen)</span>","backen","kochen","braten","bauen"],
   ["Otto ___ seine Hausaufgaben. <span class='muted'>(macht)</span>","erledigt","bastelt","baut","kocht"],
   ["Er ___ heimlich durch das Schlüsselloch. <span class='muted'>(sieht)</span>","späht","starrt","gähnt","glänzt"],
   ["Die Fans ___ gebannt auf die Anzeigetafel. <span class='muted'>(sehen lange)</span>","starren","blinzeln","nicken","gähnen"],
   ["Das Spiel war wirklich ___. <span class='muted'>(sehr gut)</span>","großartig","schlimm","langweilig","gleich"]],"wortschatz");
bank("W3","Synonyme, Gegenteile, Ober- und Unterbegriffe","Kl. 6",[],
  {rule:"Synonym = gleiche Bedeutung (beginnen – anfangen). Antonym = Gegenteil (laut – leise). Oberbegriff fasst zusammen (Obst), Unterbegriffe sind Beispiele (Apfel, Birne).",ex:"Torwart = Torhüter · gewinnen ↔ verlieren · Werkzeug: Hammer, Säge",vocab:"das Synonym · el sinónimo · synonym"},
  `<ul class="clean"><li><b>Synonyme:</b> klug – schlau, beginnen – anfangen, Treffer – Tor</li><li><b>Antonyme:</b> mutig – feige, voll – leer, Sieg – Niederlage</li><li><b>Oberbegriff → Unterbegriffe:</b> Verkehrsmittel → Bus, Zug, Straßenbahn</li></ul>`,
  [["Was ist das Gegenteil von „mutig“?","feige","stark","tapfer","laut"],["Was ist das Gegenteil von „gewinnen“?","verlieren","siegen","spielen","treffen"],["Was ist das Gegenteil von „voll“?","leer","schwer","ganz","voller"],
   ["Was ist das Gegenteil von „früh“?","spät","morgens","bald","schnell"],["Was ist das Gegenteil von „einsteigen“?","aussteigen","absteigen","umsteigen","besteigen"],["Was ist das Gegenteil von „Sieg“?","Niederlage","Pokal","Unentschieden","Finale"],
   ["Was ist das Gegenteil von „Angriff“?","Verteidigung","Stürmer","Tor","Konter"],["Was ist das Gegenteil von „ehrlich“?","unehrlich","ehrgeizig","freundlich","sicher"],
   ["Welches Wort bedeutet dasselbe wie „beginnen“?","anfangen","aufhören","enden","warten"],["Welches Wort bedeutet dasselbe wie „Torwart“?","Torhüter","Stürmer","Verteidiger","Linienrichter"],["Welches Wort bedeutet dasselbe wie „klug“?","schlau","dumm","müde","schnell"],
   ["Welches Wort bedeutet dasselbe wie „Angst“?","Furcht","Mut","Freude","Wut"],["Welches Wort bedeutet dasselbe wie „rasch“?","schnell","langsam","leise","ruhig"],
   ["Oberbegriff für Apfel, Birne, Kirsche?","Obst","Gemüse","Baum","Saft"],["Oberbegriff für Hammer, Säge, Zange?","Werkzeug","Möbel","Spielzeug","Garten"],["Oberbegriff für Fußball, Tennis, Schwimmen?","Sportarten","Spiele","Hobbys im Haus","Bälle"],
   ["Oberbegriff für Hund, Katze, Hamster?","Haustiere","Wildtiere","Vögel","Insekten"],["Oberbegriff für Bus, Zug, Straßenbahn?","Verkehrsmittel","Fahrräder","Straßen","Bahnhöfe"],["Oberbegriff für Trikot, Hose, Jacke?","Kleidung","Schuhe","Stoffe","Sport"],
   ["Welches Wort ist ein Unterbegriff von „Möbel“?","Schrank","Haus","Fenster","Teller"],["Welches Wort ist ein Unterbegriff von „Gemüse“?","Karotte","Kirsche","Banane","Apfel"]],"wortschatz");
bank("W4","Redewendungen und feste Verbindungen","Kl. 6",[],
  {rule:"Redewendungen meinen etwas anderes, als die Wörter sagen. Manche Nomen und Verben gehören fest zusammen: eine Entscheidung treffen, eine Frage stellen.",ex:"Daumen drücken = Glück wünschen · eine Frage stellen (nicht machen)",vocab:"die Redewendung · la expresión idiomática · idiom"},
  `<ul class="clean"><li><b>Tomaten auf den Augen haben:</b> etwas Offensichtliches nicht sehen</li><li><b>Schwein haben:</b> Glück haben</li><li><b>die Nase voll haben:</b> genug haben</li><li><b>am Ball bleiben:</b> dranbleiben</li></ul>
   <p><b>Feste Verbindungen:</b> eine Entscheidung treffen · eine Frage stellen · Rücksicht nehmen · Abschied nehmen · einen Fehler machen · einen Elfmeter schießen</p>
   <p class="muted small">Im Spanischen heißt es „tomar una decisión“ – im Deutschen aber „treffen“, nicht „nehmen“.</p>`,
  [["Was bedeutet „Tomaten auf den Augen haben“?","etwas Offensichtliches nicht sehen","sehr müde sein","gern Gemüse essen","rote Augen haben"],["Was bedeutet „jemandem die Daumen drücken“?","jemandem Glück wünschen","jemanden ärgern","etwas zählen","sich wehtun"],
   ["Was bedeutet „die Nase voll haben“?","genug von etwas haben","erkältet sein","sehr neugierig sein","viel gegessen haben"],["Was bedeutet „ins Fettnäpfchen treten“?","etwas Peinliches sagen oder tun","in eine Pfütze treten","zu viel essen","sehr schnell laufen"],
   ["Was bedeutet „jemandem einen Bären aufbinden“?","jemandem etwas Unwahres erzählen","jemandem ein Geschenk machen","jemandem helfen","jemanden festhalten"],["Was bedeutet „Schwein haben“?","Glück haben","schmutzig sein","ein Haustier haben","unfreundlich sein"],
   ["Was bedeutet „etwas auf die lange Bank schieben“?","etwas aufschieben","etwas verstecken","umziehen","Möbel rücken"],["Was bedeutet „auf dem Holzweg sein“?","sich irren","im Wald wandern","Holz hacken","den kürzesten Weg nehmen"],
   ["Was bedeutet „ein Eigentor schießen“ im Alltag?","sich selbst schaden","besonders gut sein","gewinnen","schummeln"],["Was bedeutet „am Ball bleiben“?","an einer Sache dranbleiben","immer Fußball spielen","den Ball festhalten","stehen bleiben"],
   ["Was bedeutet „Hals- und Beinbruch!“?","Viel Glück!","Pass auf, du fällst!","Gute Besserung!","Ich bin verletzt."],
   ["eine Entscheidung ___","treffen","machen","geben","nehmen"],["eine Frage ___","stellen","legen","machen","setzen"],["Rücksicht ___","nehmen","geben","machen","treffen"],
   ["Abschied ___","nehmen","geben","machen","stellen"],["einen Elfmeter ___","schießen","werfen","stellen","legen"],["einen Fehler ___","machen","treffen","stellen","nehmen"],["eine Pause ___","machen","treffen","stellen","legen"]],"wortschatz");

/* =====================================================================
   LESEN – original texts in DSM text types. q: [type, question, right, w1, w2, w3]
   ===================================================================== */
const TEXTE=[
{t:"Aravaca dreht das Spiel",sorte:"Sportbericht",text:`Am Samstag empfing die U12 von Aravaca den Tabellenführer aus Pozuelo. Schon in der fünften Minute gingen die Gäste nach einem Eckball mit 0:1 in Führung. Aravaca wirkte nervös und verlor viele Zweikämpfe. Nach der Pause stellte Trainer Juan auf ein 4-3-3 um. In der 52. Minute köpfte Marco nach einer Flanke von Lucas zum 1:1 ein. Zehn Minuten vor dem Ende lief Otto allein auf den Torwart zu und schob den Ball flach ins linke Eck. Pozuelo drängte bis zum Schluss, doch Torwart Pablo hielt den Sieg fest. Durch das 2:1 rückt Aravaca bis auf einen Punkt an Pozuelo heran.`,
 q:[["L1","Wer schoss das 1:1?","Marco","Lucas","Otto","Pablo"],["L2","Wie stand es zur Halbzeit?","0:1","1:1","2:1","0:0"],["L2","Warum stellte der Trainer wohl um?","Weil seine Mannschaft in der ersten Hälfte schlecht spielte","Weil ein Spieler verletzt war","Weil es zu regnen begann","Weil Pozuelo ein Tor geschossen hatte, das nicht zählte"],
  ["L3","Was bedeutet „drängte“ in diesem Text?","griff immer wieder an","schob einen Spieler weg","wartete ab","beschwerte sich"],["L4","Woran erkennst du, dass dies ein Sportbericht ist?","Er nennt sachlich Ergebnis, Zeitpunkte und Torschützen im Präteritum","Er erzählt von Gefühlen und Gedanken eines Spielers","Er erklärt Schritt für Schritt, wie man ein Tor schießt","Er reimt sich"]]},
{t:"Unfall vor der Schule",sorte:"Unfallbericht",text:`Am Dienstag, dem 14. Oktober, kam es gegen 7.45 Uhr vor der Grundschule in der Lindenstraße zu einem Unfall. Ein zehnjähriger Junge überquerte die Straße zwischen zwei parkenden Autos. Ein Radfahrer, der in Richtung Bahnhof fuhr, konnte nicht mehr rechtzeitig bremsen. Er streifte den Jungen am Bein. Der Junge stürzte und schürfte sich das Knie auf. Eine Lehrerin leistete Erste Hilfe und rief die Eltern an. Der Radfahrer blieb unverletzt. Die Polizei weist darauf hin, die Straße nur am Zebrastreifen zu überqueren.`,
 q:[["L1","Um wie viel Uhr geschah der Unfall?","gegen 7.45 Uhr","gegen 8.45 Uhr","am Nachmittag","um 14 Uhr"],["L1","Wer leistete Erste Hilfe?","eine Lehrerin","der Radfahrer","die Polizei","die Eltern"],["L2","Was war die Hauptursache des Unfalls?","Der Junge ging zwischen parkenden Autos über die Straße","Der Radfahrer fuhr zu schnell","Es war dunkel","Die Ampel war kaputt"],
  ["L3","Was bedeutet „streifte“ hier?","berührte kurz im Vorbeifahren","überfuhr","beschimpfte","fotografierte"],["L4","Welche W-Frage beantwortet dieser Bericht NICHT?","Was dachte der Junge dabei?","Wann geschah es?","Wo geschah es?","Was geschah?"]]},
{t:"So pumpst du einen Fußball auf",sorte:"Vorgangsbeschreibung",text:`Für einen gut aufgepumpten Ball brauchst du eine Ballpumpe und eine Ballnadel. Zuerst wird die Nadel ein wenig angefeuchtet, damit sie leichter in das Ventil gleitet. Dann steckst du die Nadel vorsichtig und gerade in das Ventil des Balls. Nun wird die Pumpe auf die Nadel geschraubt. Pumpe jetzt mit gleichmäßigen Bewegungen. Prüfe zwischendurch mit dem Daumen, ob der Ball fest genug ist. Er sollte nachgeben, aber nicht weich sein. Zum Schluss ziehst du die Nadel schnell heraus, damit keine Luft entweicht.`,
 q:[["L1","Was macht man als Erstes?","die Nadel anfeuchten","die Pumpe aufschrauben","den Ball prüfen","die Nadel herausziehen"],["L1","Womit prüft man, ob der Ball fest genug ist?","mit dem Daumen","mit der Nadel","mit einer Waage","mit dem Fuß"],["L2","Warum soll man die Nadel am Ende schnell herausziehen?","Damit keine Luft entweicht","Damit die Nadel nicht bricht","Weil sie heiß ist","Damit der Ball weicher wird"],
  ["L3","Was bedeutet „entweicht“?","herausströmt","hineinkommt","laut wird","kalt wird"],["L4","Welche Merkmale hat diese Vorgangsbeschreibung?","Präsens, richtige Reihenfolge, Wörter wie zuerst, dann, zum Schluss","Präteritum und spannende Wendepunkte","Reime und Strophen","Eine Moral am Ende"]]},
{t:"Der Weg zur Sporthalle",sorte:"Wegbeschreibung",text:`Wenn du aus dem Haupteingang des Internats kommst, gehst du nach links bis zum großen Brunnen. Dort biegst du rechts in den Kastanienweg ein. Folge dem Weg etwa zweihundert Meter, bis du an der Bibliothek vorbeikommst. Direkt hinter der Bibliothek überquerst du den kleinen Parkplatz. Die Sporthalle ist das flache, rote Gebäude auf der linken Seite. Der Eingang liegt gegenüber den Fahrradständern.`,
 q:[["L1","Wo biegt man rechts ab?","am großen Brunnen","an der Bibliothek","am Parkplatz","an den Fahrradständern"],["L1","Welche Farbe hat die Sporthalle?","rot","weiß","grau","grün"],["L2","Was liegt auf dem Weg zwischen Brunnen und Parkplatz?","die Bibliothek","die Sporthalle","der Haupteingang","die Fahrradständer"],
  ["L3","Was bedeutet „gegenüber“?","auf der anderen Seite","direkt daneben","weit weg","darüber"],["L4","Was ist für eine Wegbeschreibung besonders wichtig?","Genaue Richtungen und Orientierungspunkte in der richtigen Reihenfolge","Eine spannende Handlung","Wörtliche Rede","Ein überraschendes Ende"]]},
{t:"Der Elfmeter, der um die Welt flog",sorte:"Lügengeschichte",text:`Ihr glaubt mir nicht? Dann hört gut zu. Im Finale gegen Pozuelo bekam ich einen Elfmeter. Ich nahm drei Schritte Anlauf und schoss so fest, dass der Ball durch das Netz, über das Stadiondach und weiter hinaus aufs Meer flog. Zwei Tage später landete er in Australien, mitten in einem Känguru-Beutel. Das Känguru hüpfte damit zum Flughafen, nahm den nächsten Flug nach Madrid und legte mir den Ball pünktlich zum Abendessen auf den Teller. Der Schiedsrichter zählte das Tor natürlich doppelt. Und wer das nicht glaubt, kann das Känguru fragen.`,
 q:[["L1","Wo landete der Ball zuerst?","in einem Känguru-Beutel in Australien","im Netz","auf dem Stadiondach","auf dem Teller"],["L2","Warum kann diese Geschichte nicht wahr sein?","Ein Ball kann nicht bis nach Australien fliegen, und Kängurus fliegen nicht Flugzeug","Elfmeter gibt es nur bei Profis","Finale gegen Pozuelo gab es nie","Der Erzähler ist zu jung"],
  ["L3","Was bedeutet „pünktlich“?","genau zur richtigen Zeit","sehr spät","mit großer Kraft","ganz leise"],["L4","Woran erkennst du eine Lügengeschichte?","Unmögliches wird erzählt, als wäre es wahr – oft in der Ich-Form und übertrieben","Sie gibt Tipps, wie man etwas macht","Sie berichtet sachlich über ein echtes Ereignis","Sie endet mit einer Lehre über Tiere"],["L2","Was will der Erzähler mit dem letzten Satz erreichen?","Er tut so, als gäbe es einen Beweis – das ist witzig","Er will, dass man wirklich ein Känguru fragt","Er gibt zu, dass er lügt","Er beschwert sich über den Schiedsrichter"]]},
{t:"Die Sage vom Riesen am Fluss",sorte:"Sage",text:`Vor langer Zeit lebte in den Bergen über dem Tal ein Riese namens Grimbart. Jeden Frühling schleuderte er Felsbrocken in den Fluss, sodass das Wasser über die Ufer trat und die Felder der Bauern überschwemmte. Eines Tages stieg der junge Hirte Konrad zu ihm hinauf. Er forderte den Riesen zu einem Wettkampf heraus: Wer einen Stein weiter werfen könne, solle das Tal beherrschen. Grimbart lachte und warf seinen Felsen bis zum Horizont. Konrad aber nahm einen Vogel aus der Tasche und warf ihn in die Luft – der flog davon und kam nie zurück. Beschämt verließ der Riese das Land. Noch heute zeigen die Leute im Tal den großen Felsen am Flussufer, den Grimbart zurückgelassen haben soll.`,
 q:[["L1","Was tat der Riese jeden Frühling?","Er warf Felsbrocken in den Fluss","Er stahl die Schafe","Er trank den Fluss leer","Er baute eine Burg"],["L2","Wie gewann Konrad den Wettkampf?","Mit einer List: Ein Vogel fliegt weiter als jeder Stein","Er war stärker als der Riese","Der Riese stolperte","Die Bauern halfen ihm"],
  ["L3","Was bedeutet „beschämt“?","peinlich berührt, weil er verloren hatte","sehr wütend","glücklich","müde"],["L4","Woran erkennst du, dass dies eine Sage ist?","Sie erzählt von einem wirklichen Ort und einem Gegenstand, der noch heute zu sehen sein soll","Sie beginnt mit „Es war einmal“ und hat eine Moral","Sie ist ein sachlicher Bericht","Sie ist in Strophen geschrieben"]]},
{t:"Der Fuchs und der Rabe",sorte:"Fabel",text:`Ein Rabe saß mit einem Stück Käse im Schnabel auf einem Ast. Ein hungriger Fuchs kam vorbei und sah den Käse. „Lieber Rabe“, rief er, „was für prächtige Federn du hast! Wenn deine Stimme nur halb so schön ist wie dein Gefieder, bist du der König aller Vögel.“ Der Rabe fühlte sich geschmeichelt. Er öffnete den Schnabel, um zu singen – und der Käse fiel hinunter. Der Fuchs schnappte ihn und lief davon. „Merke dir“, rief er noch, „wer jedem Schmeichler glaubt, bezahlt dafür.“`,
 q:[["L1","Was hatte der Rabe im Schnabel?","ein Stück Käse","einen Wurm","eine Nuss","Brot"],["L2","Warum lobte der Fuchs den Raben?","Er wollte den Käse bekommen","Er fand den Raben wirklich schön","Er wollte singen lernen","Er hatte Angst vor dem Raben"],
  ["L3","Was bedeutet „geschmeichelt“?","sich durch Lob geehrt fühlen","sich ärgern","sich fürchten","sich langweilen"],["L4","Woran erkennst du eine Fabel?","Tiere handeln wie Menschen, und am Ende steht eine Lehre","Sie berichtet über einen Unfall","Sie beschreibt einen Weg","Sie spielt an einem echten Ort mit Beweis"],["L2","Welche Lehre passt?","Glaub nicht jedem, der dir schmeichelt","Teile immer dein Essen","Raben singen schlecht","Füchse sind dumm"]]},
{t:"Abendtraining",sorte:"Gedicht",text:`Das Flutlicht summt, der Rasen glänzt,
der Ball springt hell im Kreise,
wir laufen, bis die Lunge brennt,
der Trainer pfeift ganz leise.

Dann wird es still, die Bänke leer,
der Nebel kriecht ins Netz,
und irgendwo, ganz weit von hier,
schläft Madrid schon jetzt.`,
 q:[["L1","Was summt?","das Flutlicht","der Trainer","der Nebel","der Ball"],["L4","Wie viele Strophen hat das Gedicht?","zwei","eine","vier","acht"],["L4","Welches Reimschema hat die erste Strophe (glänzt/brennt sind ein unreiner Reim)?","Kreuzreim (abab)","Paarreim (aabb)","umarmender Reim (abba)","kein Reim"],
  ["L3","„Der Nebel kriecht ins Netz“ – was ist damit gemeint?","Der Nebel zieht langsam heran, als würde er kriechen","Ein Tier kriecht ins Tor","Das Netz ist kaputt","Es regnet stark"],["L2","Welche Stimmung hat die zweite Strophe?","ruhig und ein bisschen sehnsüchtig","wütend","fröhlich und laut","gruselig und gefährlich"]]},
{t:"Wie Pinguine warm bleiben",sorte:"Sachtext",text:`Kaiserpinguine leben in der Antarktis, wo die Temperatur im Winter unter minus 40 Grad fallen kann. Trotzdem brüten sie gerade in dieser Zeit. Gegen die Kälte helfen ihnen eine dicke Fettschicht und mehrere Lagen dicht gepackter Federn. Bei Sturm drängen sich Hunderte Tiere eng zusammen. Dabei wechseln sie ständig die Plätze: Wer außen friert, schiebt sich langsam nach innen, wo es bis zu 20 Grad warm werden kann. So bekommt jeder einmal einen warmen Platz. Forscher nennen dieses Verhalten „Huddling“.`,
 q:[["L1","Wo leben Kaiserpinguine?","in der Antarktis","in der Arktis","in Afrika","im Regenwald"],["L1","Wie warm kann es innen in der Gruppe werden?","bis zu 20 Grad","bis zu 40 Grad","minus 40 Grad","0 Grad"],["L2","Warum wechseln die Pinguine die Plätze?","Damit alle abwechselnd innen warm werden","Weil sie spielen wollen","Weil sie Futter suchen","Weil der Sturm sie wegschiebt"],
  ["L3","Was bedeutet „brüten“?","Eier warm halten, bis die Jungen schlüpfen","schlafen","schwimmen","fressen"],["L4","Was ist das Ziel dieses Textes?","sachlich über ein Tier informieren","unterhalten mit einer erfundenen Geschichte","eine Lehre vermitteln","zum Kauf überreden"]]},
{t:"Die erste Nacht im Internat",sorte:"Erzählung",text:`Als Otto die Tür zu Zimmer 14 öffnete, saßen dort schon drei Jungen auf ihren Betten. Einer davon, ein großer Junge mit Locken, sah kurz auf und schaute dann wieder auf sein Buch. Otto stellte seinen Koffer ab und wusste nicht, was er sagen sollte. Am Abend lag er lange wach. Das Fenster war zu groß, das Bett zu fremd, und Madrid war so weit weg. Plötzlich flüsterte jemand aus der Dunkelheit: „Spielst du Fußball?“ Es war der Junge mit den Locken. „Ja“, flüsterte Otto zurück. „Gut“, sagte der andere, „wir brauchen morgen noch einen Linksfuß.“ Otto lächelte in sein Kissen. Zum ersten Mal an diesem Tag fühlte er sich nicht allein.`,
 q:[["L1","In welchem Zimmer wohnt Otto?","Zimmer 14","Zimmer 4","Zimmer 41","Das steht nicht im Text"],["L2","Wie fühlte sich Otto am Abend zuerst?","einsam und fremd","fröhlich","wütend","gelangweilt"],["L2","Warum fühlte sich Otto am Ende nicht mehr allein?","Weil ihn jemand ansprach und zum Mitspielen einlud","Weil seine Eltern anriefen","Weil er ein gutes Buch las","Weil das Licht anging"],
  ["L3","„Otto lächelte in sein Kissen“ – was zeigt das?","Er freut sich still","Er weint","Er schläft schon","Er ist wütend"],["L4","Was ist typisch für diese Erzählung?","Sie erzählt im Präteritum von Gefühlen, mit Wendepunkt und wörtlicher Rede","Sie nennt sachlich Ort, Zeit und Ursache eines Unfalls","Sie erklärt einen Vorgang","Sie hat eine Moral wie eine Fabel"]]}
];
const LNAME={L1:"Informationen finden",L2:"Schlussfolgern",L3:"Wortbedeutung aus dem Zusammenhang",L4:"Textsorte und Merkmale"};
const LERR={L1:"lesen_info",L2:"lesen_schluss",L3:"lesen_wort",L4:"lesen_sorte"};
const LCARD={
  L1:{rule:"Lies die Frage zuerst. Such im Text die Stelle mit den Schlüsselwörtern und lies sie genau.",ex:"Frage: Wer schoss das 1:1? → Such „1:1“ im Text.",vocab:"die Information · la información · information"},
  L2:{rule:"Die Antwort steht nicht wörtlich da. Sammle Hinweise im Text und zieh einen Schluss: Was folgt daraus?",ex:"„Aravaca wirkte nervös“ + „Trainer stellte um“ → er war mit der ersten Halbzeit unzufrieden.",vocab:"schlussfolgern · deducir · infer"},
  L3:{rule:"Unbekanntes Wort? Lies den Satz davor und danach. Ersetze das Wort durch deine Vermutung – passt der Sinn?",ex:"„Pozuelo drängte bis zum Schluss“ → griff immer wieder an.",vocab:"der Kontext · el contexto · context"},
  L4:{rule:"Bericht: sachlich, W-Fragen, Präteritum. Beschreibung: Präsens, Reihenfolge. Erzählung/Lügengeschichte: spannend, Gefühle. Fabel: Tiere, Lehre. Sage: echter Ort, Beweis. Gedicht: Verse, Strophen, Reim.",ex:"Tiere sprechen + Lehre am Ende → Fabel",vocab:"die Textsorte · el tipo de texto · text type"}
};
Object.keys(LNAME).forEach((id,i)=>D(id,{name:LNAME[id],y:["Kl. 4","Kl. 5–6","Kl. 5–6","Kl. 6"][i],pre:i?["L1"]:[],card:LCARD[id],
  sheet:`<p>${LCARD[id].rule}</p><p><b>Lesestrategie in 3 Schritten:</b></p><ul class="clean"><li>1. Überschrift und erste Sätze lesen: Worum geht es? Welche Textsorte?</li><li>2. Fragen lesen – dann gezielt im Text suchen.</li><li>3. Bei Schlussfolgerungen: Welche Stelle stützt deine Antwort?</li></ul>
   <p class="muted small">Textsorten in Klasse 6 (DSM): Beschreibung, Lügen- und Schelmengeschichte, Sport- und Unfallbericht, Sage, Fabel, Gedicht.</p>`,
  gen(){const pool=[];TEXTE.forEach((tx,ti)=>tx.q.forEach((q,qi)=>{if(q[0]===id)pool.push([ti,qi])}));const [ti,qi]=pick(pool),tx=TEXTE[ti],q=tx.q[qi];
    return mcItem({prompt:q[1],right:q[2],wrong:q.slice(3),err:LERR[id],fam:id,txt:{title:tx.t,sorte:tx.sorte,text:tx.text},
      hint:ERR[LERR[id]],sol:`<b>${q[2]}</b>`})}
}));

/* =====================================================================
   PAPIER-LÜCKENTEXTE (written on paper, self-checked; logged, not mastery)
   ===================================================================== */
const PAPER=[
{t:"Das Finale",rule:"Präteritum (Erzählzeit)",text:"Am Sonntag {1|fuhr} (fahren) unsere Mannschaft zum Finale. Der Trainer {2|gab} (geben) uns letzte Tipps. Nach zehn Minuten {3|schoss} (schießen) Marco das erste Tor. Kurz vor der Pause {4|fiel} (fallen) ich im Strafraum hin. Der Schiedsrichter {5|pfiff} (pfeifen) Elfmeter. Ich {6|lief} (laufen) an und {7|traf} (treffen) ins linke Eck. Am Ende {8|gewannen} (gewinnen) wir 2:0."},
{t:"Ein Brief nach Hause",rule:"das oder dass",text:"Liebe Mama, ich hoffe, {1|dass} es dir gut geht. {2|Das} Essen im Internat ist besser, als ich dachte. Gestern hat mir der Trainer gesagt, {3|dass} ich am Samstag spielen darf. {4|Das} Trikot, {5|das} du mir geschickt hast, passt genau. Ich glaube, {6|dass} wir gewinnen. Weißt du, {7|dass} Lucas auch aus Spanien kommt? {8|Das} ist toll!"},
{t:"Im Schwimmbad",rule:"s, ss oder ß (schreib das ganze Wort ab)",text:"Im Schwimmbad war das Wa{1|ss}er kalt. Der Spa{2|ß} begann, als Lucas einen großen Wa{3|ss}erball brachte. Wir a{4|ß}en danach Pommes drau{5|ß}en auf der Wie{6|s}e. Auf dem Heimweg mu{7|ss}ten wir uns beeilen, weil der Bu{8|s} um sechs fuhr."},
{t:"Vor dem Spiel",rule:"Großschreibung und Nominalisierung (schreib die Wörter richtig ab)",text:"Beim {1|Aufwärmen} (aufwärmen) hören wir laute Musik. Das {2|Dehnen} (dehnen) ist wichtig, sagt der Trainer. Dann {3|laufen} (laufen) wir zwei Runden. Zum {4|Schluss} (schluss) üben wir das {5|Schießen} (schießen). Ich wünsche allen viel {6|Glück} (glück) und etwas {7|Gutes} (gutes) für das Spiel. Wir wollen heute {8|gewinnen} (gewinnen)!"},
{t:"Ein Tag im Internat",rule:"Artikel im Akkusativ und Dativ",text:"Am Morgen suche ich {1|den} (der) Schlüssel. Ich finde ihn unter {2|dem} (das) Bett. Dann gebe ich {3|dem} (der) Lehrer mein Heft. In der Pause spiele ich mit {4|dem} (der) Ball. Nach {5|der} (die) Schule helfe ich {6|der} (die) Köchin. Abends lege ich {7|das} (das) Trikot auf {8|den} (der) Stuhl."},
{t:"Die Wegbeschreibung",rule:"Präpositionen und Fälle",text:"Geh aus {1|dem} (das) Haus und dann durch {2|den} (der) Park. Bei {3|der} (die) Brücke biegst du links ab. Das Stadion liegt neben {4|dem} (der) Bahnhof. Geh nie ohne {5|den} (der) Schlüssel los. Mit {6|dem} (das) Fahrrad brauchst du fünf Minuten. Stell es vor {7|das} (das) Tor. Ich warte auf {8|dem} (der) Platz."}
];
function paperTask(){const p=pick(PAPER),sol=[];let html=esc(p.text).replace(/\{(\d+)\|([^}]+)\}/g,(m,n,w)=>{sol[+n]=w;return `<b class="gap">(${n})${w.length<=2?"__":" ______"}</b>`});
  const full=sol.slice(1).map((w,i)=>{const t=p.text.replace(/\{(\d+)\|([^}]+)\}/g,(m,n,x)=>+n===i+1?`⟦${x}⟧`:x),m=t.match(/([A-Za-zÄÖÜäöüß]*)⟦(.+?)⟧([A-Za-zÄÖÜäöüß]*)/);return m?m[1]+m[2]+m[3]:w});
  return {kind:"paper",title:p.t,rule:p.rule,html,sol:sol.slice(1),full}}
