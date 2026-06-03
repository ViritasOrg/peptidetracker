/**
 * Frontend logic tests — peptide tracker
 * Run: node /tmp/test_frontend.js
 */
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('/tmp/pt_live.html', 'utf8');
const rawScript = html.slice(html.indexOf('<script>') + 8, html.indexOf('</script>'));

// Patch: promote key const/let to var so they land on the context object
// Only the ones we need to inspect from outside
const patchedScript = rawScript
  .replace('const PEPTIDE_CAT=',     'var PEPTIDE_CAT=')
  .replace('const STACK_RULES=',     'var STACK_RULES=')
  .replace('const WEEKLY_DEFAULT=',  'var WEEKLY_DEFAULT=')
  .replace("const VERSION='",        "var VERSION='")
  .replace('const AGENT_URL=',       'var AGENT_URL=')
  .replace('const WEIGHTS_TOKEN=',   'var WEIGHTS_TOKEN=')
  .replace('const GOOGLE_CLIENT_ID=','var GOOGLE_CLIENT_ID=')
  .replace('let WEEKLY=',            'var WEEKLY=');

const noop = () => {};
const mockCtx2 = { scale:noop,beginPath:noop,moveTo:noop,lineTo:noop,arc:noop,fill:noop,stroke:noop,fillText:noop,closePath:noop,createLinearGradient:()=>({addColorStop:noop}),save:noop,restore:noop,fillRect:noop };
const mockEl = () => {
  const el = { style:{}, classList:{add:noop,remove:noop,contains:()=>false}, appendChild:noop, removeChild:noop, insertBefore:noop, addEventListener:noop, children:[], querySelectorAll:()=>[], querySelector:()=>mockEl(), offsetWidth:300, getContext:()=>mockCtx2 };
  Object.defineProperty(el,'innerHTML',  {get:()=>'', set:noop});
  Object.defineProperty(el,'textContent',{get:()=>'', set:noop});
  Object.defineProperty(el,'value',      {get:()=>'0',set:noop});
  Object.defineProperty(el,'className',  {get:()=>'', set:noop});
  Object.defineProperty(el,'hidden',     {get:()=>false,set:noop});
  return el;
};

const sandbox = vm.createContext({
  window:    { addEventListener:noop, removeEventListener:noop, devicePixelRatio:1, location:{reload:noop} },
  localStorage: { _s:{}, getItem(k){return this._s[k]||null;}, setItem(k,v){this._s[k]=v;}, removeItem(k){delete this._s[k];} },
  document:  { getElementById:()=>mockEl(), querySelectorAll:()=>[mockEl()], querySelector:()=>mockEl(), createElement:()=>mockEl(), body:mockEl(), head:mockEl(), createTextNode:()=>mockEl(), addEventListener:noop, hidden:false },
  fetch:     async()=>({ok:false,json:async()=>({})}),
  google:undefined, confirm:()=>false, alert:noop,
  Image:function(){}, setTimeout:noop, clearTimeout:noop, setInterval:noop, console,
});

vm.runInContext(patchedScript, sandbox);
const G = sandbox; // access script globals via context

// ── Test helpers ──────────────────────────────────────────────────────────────
let passed=0, failed=0;
function check(name, condition, detail) {
  if(condition){console.log(`  ✓ ${name}`);passed++;}
  else{console.log(`  ✗ ${name}${detail?': '+detail:''}`);failed++;}
}

// ── Peptide catalogue ─────────────────────────────────────────────────────────
console.log('\n── Peptide catalogue ──────────────────────────────────────');
check('PEPTIDE_CAT defined',               Array.isArray(G.PEPTIDE_CAT));
check('20+ entries',                       G.PEPTIDE_CAT.length>=20,             `got ${G.PEPTIDE_CAT.length}`);
check('all have id/name/dot/cg/goals',     G.PEPTIDE_CAT.every(p=>p.id&&p.name&&p.dot&&Array.isArray(p.cg)&&Array.isArray(p.goals)));
check('cjc-ipa exists',                    G.PEPTIDE_CAT.some(p=>p.id==='cjc-ipa'));
check('glow exists',                       G.PEPTIDE_CAT.some(p=>p.id==='glow'));
check('retatrutide exists',                G.PEPTIDE_CAT.some(p=>p.id==='retatrutide'));
check('tesamorelin exists',                G.PEPTIDE_CAT.some(p=>p.id==='tesamorelin'));
check('sermorelin exists',                 G.PEPTIDE_CAT.some(p=>p.id==='sermorelin'));

// ── Stack rules ───────────────────────────────────────────────────────────────
console.log('\n── checkStack / STACK_RULES ───────────────────────────────');
check('STACK_RULES is array',              Array.isArray(G.STACK_RULES));
check('5 rules defined',                   G.STACK_RULES.length===5,             `got ${G.STACK_RULES.length}`);
check('checkStack defined',                typeof G.checkStack==='function');

// All 5 known rule IDs present
const ruleIds = G.STACK_RULES.map(r=>r.id);
['ghrh-multi','cjc-tesa','glp1-multi','ghrh-ghrp-solo','gh-hgh-overlap']
  .forEach(id => check(`rule "${id}" exists`, ruleIds.includes(id)));

// CJC + Tesamorelin → 2 errors
const r1 = G.checkStack([{id:'cjc-ipa',cg:['ghrh','ghrp']},{id:'tesamorelin',cg:['ghrh']}]);
check('CJC+Tesa → err: ghrh-multi',        r1.some(r=>r.level==='err'&&r.id==='ghrh-multi'));
check('CJC+Tesa → err: cjc-tesa',          r1.some(r=>r.level==='err'&&r.id==='cjc-tesa'));

// CJC + Glow → clean
check('CJC+Glow → 0 issues',               G.checkStack([{id:'cjc-ipa',cg:['ghrh','ghrp']},{id:'glow',cg:[]}]).length===0);

// Dual GLP-1
check('Reta+Sema → err: glp1-multi',       G.checkStack([{id:'retatrutide',cg:['glp1']},{id:'semaglutide',cg:['glp1']}]).some(r=>r.id==='glp1-multi'));

// CJC-noDac alone → warn
check('CJC-noDac alone → warn: ghrp-solo', G.checkStack([{id:'cjc-nodac',cg:['ghrh']}]).some(r=>r.level==='warn'&&r.id==='ghrh-ghrp-solo'));

// GH peptides + HGH → warn
check('CJC+HGH → warn: gh-hgh-overlap',   G.checkStack([{id:'cjc-ipa',cg:['ghrh','ghrp']},{id:'hgh',cg:['hgh']}]).some(r=>r.id==='gh-hgh-overlap'));

// Single peptide → clean
check('single Reta → 0 issues',            G.checkStack([{id:'retatrutide',cg:['glp1']}]).length===0);

// ── buildWeeklyFromProtocol ───────────────────────────────────────────────────
console.log('\n── buildWeeklyFromProtocol ────────────────────────────────');
check('function defined',                  typeof G.buildWeeklyFromProtocol==='function');

const wkly = G.buildWeeklyFromProtocol({peptides:[
  {id:'cjc-am', name:'CJC', dot:'#3cffa0',days:[0,1,2,3,4,5,6],times:['AM'],dose_am:'4',active:true},
  {id:'cjc-pm', name:'CJC', dot:'#3cffa0',days:[0,1,2,3,4,5,6],times:['PM'],dose_pm:'5',active:true},
  {id:'glow-1', name:'Glow',dot:'#3b9eff',days:[0,1,2,3,4,5,6],times:['AM'],dose_am:'2',active:true},
  {id:'reta',   name:'Reta',dot:'#e8ff3c',days:[0],             times:['AM'],dose_am:'3',active:true},
  {id:'old',    name:'Old', dot:'#888',   days:[0],             times:['AM'],             active:false},
]});
check('4 active entries (inactive excluded)', wkly.length===4,                   `got ${wkly.length}`);
check('all have id/name/dow/dot',             wkly.every(w=>w.id&&w.name&&w.dow&&w.dot));
check('cjc-am → AM',                         wkly.find(w=>w.id==='cjc-am')?.time==='AM');
check('cjc-pm → PM',                         wkly.find(w=>w.id==='cjc-pm')?.time==='PM');
check('reta → dow [0] only',                 JSON.stringify(wkly.find(w=>w.id==='reta')?.dow)==='[0]');
check('glow-1 → 7 days',                     wkly.find(w=>w.id==='glow-1')?.dow.length===7);

const split = G.buildWeeklyFromProtocol({peptides:[{id:'x',name:'X',dot:'#fff',days:[0,1,2,3,4,5,6],times:['AM','PM'],dose_am:'4',dose_pm:'5',active:true}]});
check('AM+PM → 2 rows',                       split.length===2,                  `got ${split.length}`);
check('row 0 AM, row 1 PM',                   split[0].time==='AM'&&split[1].time==='PM');
check('empty protocol → empty array',         G.buildWeeklyFromProtocol({peptides:[]}).length===0);

// ── _synthesizeProtocol ───────────────────────────────────────────────────────
console.log('\n── _synthesizeProtocol ────────────────────────────────────');
check('function defined',                   typeof G._synthesizeProtocol==='function');
const synth = G._synthesizeProtocol(G.WEEKLY_DEFAULT);
check('returns peptides',                    synth.peptides.length>0,            `got ${synth.peptides.length}`);
check('marked _unsaved=true',                synth._unsaved===true);
check('no duplicate IDs',                    (()=>{const ids=synth.peptides.map(p=>p.id);return ids.length===new Set(ids).size;})());
check('each peptide has times array',        synth.peptides.every(p=>Array.isArray(p.times)));
check('each peptide has days array',         synth.peptides.every(p=>Array.isArray(p.days)));

// ── WEEKLY_DEFAULT ────────────────────────────────────────────────────────────
console.log('\n── WEEKLY_DEFAULT ─────────────────────────────────────────');
check('defined and non-empty',              Array.isArray(G.WEEKLY_DEFAULT)&&G.WEEKLY_DEFAULT.length>0);
check('all have id/name/dow/dot',           G.WEEKLY_DEFAULT.every(w=>w.id&&w.name&&w.dow&&w.dot));
check('reta-sun on Sunday (dow 0)',         G.WEEKLY_DEFAULT.some(w=>w.id==='reta-sun'&&w.dow.includes(0)));
check('reta-wed on Wednesday (dow 3)',      G.WEEKLY_DEFAULT.some(w=>w.id==='reta-wed'&&w.dow.includes(3)));
check('cjc-am is AM, 7 days',              G.WEEKLY_DEFAULT.some(w=>w.id==='cjc-am'&&w.time==='AM'&&w.dow.length===7));
check('cjc-pm is PM, 7 days',              G.WEEKLY_DEFAULT.some(w=>w.id==='cjc-pm'&&w.time==='PM'&&w.dow.length===7));
check('glow-1 is 7 days AM',               G.WEEKLY_DEFAULT.some(w=>w.id==='glow-1'&&w.time==='AM'&&w.dow.length===7));

// ── Meta ──────────────────────────────────────────────────────────────────────
console.log('\n── Meta ───────────────────────────────────────────────────');
check('VERSION defined',                    typeof G.VERSION==='string');
check('VERSION is x.xx (no suffix)',        /^\d+\.\d+$/.test(G.VERSION),        `got "${G.VERSION}"`);
check('AGENT_URL is https',                 G.AGENT_URL?.startsWith('https://'));
check('WEIGHTS_TOKEN defined',              G.WEIGHTS_TOKEN?.length>0);
check('WEEKLY is var/let (dynamic)',        rawScript.includes('let WEEKLY=')||rawScript.includes('var WEEKLY='));
check('WEEKLY_DEFAULT is const/var',        rawScript.includes('const WEEKLY_DEFAULT=')||rawScript.includes('var WEEKLY_DEFAULT='));

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(59)}`);
console.log(`  ${passed} passed  ${failed} failed  ${passed+failed} total`);

if(failed>0) console.log('\n  ⚠ Run again after hard-refreshing the app to ensure latest build.');
process.exit(failed===0?0:1);
