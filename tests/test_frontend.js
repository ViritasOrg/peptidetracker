/**
 * Frontend logic tests — peptide tracker
 * Run: node /tmp/test_frontend.js
 */
const fs   = require('fs');
const vm   = require('vm');
const path = require('path');

const htmlPath = process.argv[2] || '/tmp/pt_live.html';
const html = fs.readFileSync(htmlPath, 'utf8');
const rawScript = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));

const patchedScript = rawScript
  .replace('const PEPTIDE_CAT=',      'var PEPTIDE_CAT=')
  .replace('const STACK_RULES=',      'var STACK_RULES=')
  .replace('const WEEKLY_DEFAULT=',   'var WEEKLY_DEFAULT=')
  .replace("const VERSION='",         "var VERSION='")
  .replace('const AGENT_URL=',        'var AGENT_URL=')
  .replace('const WEIGHTS_TOKEN=',    'var WEIGHTS_TOKEN=')
  .replace('const GOOGLE_CLIENT_ID=', 'var GOOGLE_CLIENT_ID=')
  .replace('const CYCLE_SUGGESTIONS=','var CYCLE_SUGGESTIONS=')
  .replace('var WIZ_TITLES=',         'var WIZ_TITLES=')
  .replace('const WIZ_TITLES=',       'var WIZ_TITLES=')
  .replace('let WEEKLY=',             'var WEEKLY=')
  .replace('let _wiz=',               'var _wiz=')
  .replace('let _userStacks=',        'var _userStacks=')
  .replace('let _activeStackIndex=',  'var _activeStackIndex=')
  .replace('let _stacksLoaded=',      'var _stacksLoaded=')
  .replace('let _userWeight=',        'var _userWeight=')
  .replace('var _wizOverlay=',        'var _wizOverlay=')
  .replace('const RECON_DB=',         'var RECON_DB=')
  .replace('let _reconStackIdx=',     'var _reconStackIdx=')
  .replace('let _reconState=',        'var _reconState=');

const noop = () => {};
const mockCtx = {scale:noop,beginPath:noop,moveTo:noop,lineTo:noop,arc:noop,fill:noop,stroke:noop,fillText:noop,closePath:noop,createLinearGradient:()=>({addColorStop:noop}),save:noop,restore:noop,fillRect:noop};
const mockEl = () => {
  const el = {style:{},classList:{add:noop,remove:noop,contains:()=>false},appendChild:noop,removeChild:noop,insertBefore:noop,addEventListener:noop,children:[],querySelectorAll:()=>[],querySelector:()=>mockEl(),offsetWidth:300,getContext:()=>mockCtx};
  Object.defineProperty(el,'innerHTML',  {get:()=>'',set:noop});
  Object.defineProperty(el,'textContent',{get:()=>'',set:noop});
  Object.defineProperty(el,'value',      {get:()=>'0',set:noop});
  Object.defineProperty(el,'className',  {get:()=>'',set:noop});
  Object.defineProperty(el,'hidden',     {get:()=>false,set:noop});
  return el;
};
const sandbox = vm.createContext({
  window:    {addEventListener:noop,removeEventListener:noop,devicePixelRatio:1,location:{reload:noop}},
  localStorage: {_s:{},getItem(k){return this._s[k]||null;},setItem(k,v){this._s[k]=v;},removeItem(k){delete this._s[k];}},
  document:  {getElementById:()=>mockEl(),querySelectorAll:()=>[mockEl()],querySelector:()=>mockEl(),createElement:()=>mockEl(),body:mockEl(),head:mockEl(),createTextNode:()=>mockEl(),addEventListener:noop,hidden:false},
  fetch:     async()=>({ok:false,json:async()=>({})}),
  google:undefined,confirm:()=>false,alert:noop,Image:function(){},setTimeout:noop,clearTimeout:noop,setInterval:noop,console,
});
vm.runInContext(patchedScript, sandbox);
const G = sandbox;

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
['ghrh-multi','cjc-tesa','glp1-multi','ghrh-ghrp-solo','gh-hgh-overlap']
  .forEach(id=>check(`rule "${id}" exists`, G.STACK_RULES.some(r=>r.id===id)));
const r1=G.checkStack([{id:'cjc-ipa',cg:['ghrh','ghrp']},{id:'tesamorelin',cg:['ghrh']}]);
check('CJC+Tesa → err: ghrh-multi',        r1.some(r=>r.level==='err'&&r.id==='ghrh-multi'));
check('CJC+Tesa → err: cjc-tesa',          r1.some(r=>r.level==='err'&&r.id==='cjc-tesa'));
check('CJC+Glow → 0 issues',               G.checkStack([{id:'cjc-ipa',cg:['ghrh','ghrp']},{id:'glow',cg:[]}]).length===0);
check('Reta+Sema → err: glp1-multi',       G.checkStack([{id:'retatrutide',cg:['glp1']},{id:'semaglutide',cg:['glp1']}]).some(r=>r.id==='glp1-multi'));
check('CJC-noDac alone → warn: ghrp-solo', G.checkStack([{id:'cjc-nodac',cg:['ghrh']}]).some(r=>r.level==='warn'&&r.id==='ghrh-ghrp-solo'));
check('CJC+HGH → warn: gh-hgh-overlap',   G.checkStack([{id:'cjc-ipa',cg:['ghrh','ghrp']},{id:'hgh',cg:['hgh']}]).some(r=>r.id==='gh-hgh-overlap'));
check('single Reta → 0 issues',            G.checkStack([{id:'retatrutide',cg:['glp1']}]).length===0);

// ── buildWeeklyFromProtocol ───────────────────────────────────────────────────
console.log('\n── buildWeeklyFromProtocol ────────────────────────────────');
check('function defined',                  typeof G.buildWeeklyFromProtocol==='function');
const wkly=G.buildWeeklyFromProtocol({peptides:[
  {id:'cjc-am',name:'CJC',dot:'#3cffa0',days:[0,1,2,3,4,5,6],times:['AM'],dose_am:'4',active:true},
  {id:'cjc-pm',name:'CJC',dot:'#3cffa0',days:[0,1,2,3,4,5,6],times:['PM'],dose_pm:'5',active:true},
  {id:'glow-1',name:'Glow',dot:'#3b9eff',days:[0,1,2,3,4,5,6],times:['AM'],dose_am:'2',active:true},
  {id:'reta',  name:'Reta',dot:'#e8ff3c',days:[0],             times:['AM'],dose_am:'3',active:true},
  {id:'old',   name:'Old', dot:'#888',   days:[0],             times:['AM'],             active:false},
]});
check('4 active entries (inactive excluded)', wkly.length===4,                   `got ${wkly.length}`);
check('all have id/name/dow/dot',             wkly.every(w=>w.id&&w.name&&w.dow&&w.dot));
check('cjc-am → AM',                         wkly.find(w=>w.id==='cjc-am')?.time==='AM');
check('cjc-pm → PM',                         wkly.find(w=>w.id==='cjc-pm')?.time==='PM');
check('reta → dow [0] only',                 JSON.stringify(wkly.find(w=>w.id==='reta')?.dow)==='[0]');
check('glow-1 → 7 days',                     wkly.find(w=>w.id==='glow-1')?.dow.length===7);
const split=G.buildWeeklyFromProtocol({peptides:[{id:'x',name:'X',dot:'#fff',days:[0,1,2,3,4,5,6],times:['AM','PM'],dose_am:'4',dose_pm:'5',active:true}]});
check('AM+PM → 2 rows',                       split.length===2,                  `got ${split.length}`);
check('row 0 AM, row 1 PM',                   split[0].time==='AM'&&split[1].time==='PM');
check('empty protocol → empty array',         G.buildWeeklyFromProtocol({peptides:[]}).length===0);

// ── _synthesizeProtocol ───────────────────────────────────────────────────────
console.log('\n── _synthesizeProtocol ────────────────────────────────────');
check('function defined',                   typeof G._synthesizeProtocol==='function');
const synth=G._synthesizeProtocol(G.WEEKLY_DEFAULT);
check('has peptides',                        synth.peptides.length>0,            `got ${synth.peptides.length}`);
check('marked _unsaved=true',                synth._unsaved===true);
check('no duplicate IDs',                    (()=>{const ids=synth.peptides.map(p=>p.id);return ids.length===new Set(ids).size;})());
check('each peptide has times array',        synth.peptides.every(p=>Array.isArray(p.times)));
check('each peptide has days array',         synth.peptides.every(p=>Array.isArray(p.days)));
check('synth peptides use PEPTIDE_CAT ids', synth.peptides.every(p=>G.PEPTIDE_CAT.some(c=>c.id===p.id)),
  synth.peptides.filter(p=>!G.PEPTIDE_CAT.some(c=>c.id===p.id)).map(p=>p.id).join(', '));
check('synth: reta maps to canonical id',   synth.peptides.some(p=>p.id==='retatrutide'));
check('synth: cjc maps to canonical id',    synth.peptides.some(p=>p.id==='cjc-ipa'));
check('synth: glow maps to canonical id',   synth.peptides.some(p=>p.id==='glow'));
check('synth: reta days includes Sun+Wed',  (()=>{const r=synth.peptides.find(p=>p.id==='retatrutide');return r&&r.days.includes(0)&&r.days.includes(3);})());

// ── WEEKLY_DEFAULT ────────────────────────────────────────────────────────────
console.log('\n── WEEKLY_DEFAULT ─────────────────────────────────────────');
check('defined and non-empty',              G.WEEKLY_DEFAULT?.length>0);
check('all have id/name/dow/dot',           G.WEEKLY_DEFAULT.every(w=>w.id&&w.name&&w.dow&&w.dot));
check('reta-sun on Sunday (dow 0)',         G.WEEKLY_DEFAULT.some(w=>w.id==='reta-sun'&&w.dow.includes(0)));
check('reta-wed on Wednesday (dow 3)',      G.WEEKLY_DEFAULT.some(w=>w.id==='reta-wed'&&w.dow.includes(3)));
check('cjc-am is AM, 7 days',              G.WEEKLY_DEFAULT.some(w=>w.id==='cjc-am'&&w.time==='AM'&&w.dow.length===7));
check('cjc-pm is PM, 7 days',              G.WEEKLY_DEFAULT.some(w=>w.id==='cjc-pm'&&w.time==='PM'&&w.dow.length===7));
check('glow-1 is 7 days AM',               G.WEEKLY_DEFAULT.some(w=>w.id==='glow-1'&&w.time==='AM'&&w.dow.length===7));

// ── Stack Store state & functions ─────────────────────────────────────────────
console.log('\n── Stack Store ────────────────────────────────────────────');
check('_userStacks defined',               Array.isArray(G._userStacks));
check('_activeStackIndex defined',         typeof G._activeStackIndex==='number');
check('_stacksLoaded defined',             typeof G._stacksLoaded!=='undefined');
check('loadUserStacks defined',            typeof G.loadUserStacks==='function');
check('saveStacksToBackend defined',       typeof G.saveStacksToBackend==='function');
check('updateWEEKLY defined',              typeof G.updateWEEKLY==='function');
check('buildStackStore defined',           typeof G.buildStackStore==='function');
check('useStack defined',                  typeof G.useStack==='function');
check('deleteStack defined',               typeof G.deleteStack==='function');
check('createNewStack defined',            typeof G.createNewStack==='function');
check('editStackWithCycle defined',        typeof G.editStackWithCycle==='function');

// ── Wizard init ───────────────────────────────────────────────────────────────
console.log('\n── Wizard init & createNewStack ───────────────────────────');
G.initWizard();
check('initWizard: step=0',                G._wiz.step===0);
check('initWizard: peptides=[]',           G._wiz.peptides.length===0);
check('initWizard: goals=[]',              G._wiz.goals.length===0);
check('initWizard: cycle_length set',      G._wiz.cycle_length>0,               `got ${G._wiz.cycle_length}`);
check('initWizard: stackIndex=-1',         G._wiz.stackIndex===-1);
check('initWizard: stackName is string',   typeof G._wiz.stackName==='string'&&G._wiz.stackName.length>0);

G.createNewStack();
check('createNewStack: editMode=false',    G._wiz.editMode===false);
check('createNewStack: step=0',            G._wiz.step===0);

// ── Edit existing stack ───────────────────────────────────────────────────────
console.log('\n── Edit existing stack ────────────────────────────────────');
const testStack = {
  name:'Cutting Cycle',cycle_length:12,
  peptides:[
    {id:'cjc-am',name:'CJC',dot:'#3cffa0',days:[0,1,2,3,4,5,6],times:['AM'],dose_am:'4',active:true},
    {id:'glow-1',name:'Glow',dot:'#3b9eff',days:[0,1,2,3,4,5,6],times:['AM'],dose_am:'2',active:true},
  ],
  trt:{enabled:true,compound:'Nebido',injections:[{date:'2026-06-01',label:'Inj 1',dose:'250mg'}]}
};
G._userStacks=[testStack];G._activeStackIndex=0;
G.editStackWithCycle(0);
check('editStack: editMode=true',          G._wiz.editMode===true);
check('editStack: stackIndex=0',           G._wiz.stackIndex===0);
check('editStack: stackName loaded',       G._wiz.stackName==='Cutting Cycle');
check('editStack: cycle_length=12',        G._wiz.cycle_length===12,            `got ${G._wiz.cycle_length}`);
check('editStack: 2 peptides loaded',      G._wiz.peptides.length===2,          `got ${G._wiz.peptides.length}`);
check('editStack: TRT compound loaded',    G._wiz.trt.compound==='Nebido');
check('editStack: deep copy (no mutation)',G._userStacks[0].peptides!==G._wiz.peptides);
check('editStack: goals inferred',         Array.isArray(G._wiz.goals));

// ── Cycle length ──────────────────────────────────────────────────────────────
console.log('\n── Cycle length ───────────────────────────────────────────');
check('CYCLE_SUGGESTIONS defined',         Array.isArray(G.CYCLE_SUGGESTIONS));
check('3 presets: 8/10/12 weeks',          [8,10,12].every(v=>G.CYCLE_SUGGESTIONS.some(s=>s.value===v)));
G.initWizard();
G.wizSetCycleLength('8');  check('wizSetCycleLength("8")=8',    G._wiz.cycle_length===8,  `got ${G._wiz.cycle_length}`);
G.wizSetCycleLength('12'); check('wizSetCycleLength("12")=12',  G._wiz.cycle_length===12);
G.wizSetCycleLength(10);   check('wizSetCycleLength(10)=10',    G._wiz.cycle_length===10);
G.wizSetCycleLength('16'); check('custom cycle length 16',      G._wiz.cycle_length===16);

// ── Wizard navigation ─────────────────────────────────────────────────────────
console.log('\n── Wizard navigation ──────────────────────────────────────');
G.initWizard();
G.wizNext();check('wizNext: 0→1',    G._wiz.step===1);
G.wizNext();check('wizNext: 1→2',    G._wiz.step===2);
G.wizNext();G.wizNext();G.wizNext();
check('wizNext: stops at 5 (max)',   G._wiz.step===5);
G.wizNext();
check('wizNext: does not exceed 5',  G._wiz.step===5);
G._wiz.step=2;G.wizBack();check('wizBack: 2→1',    G._wiz.step===1);
G.wizSetStackName('My New Stack');
check('wizSetStackName updates _wiz', G._wiz.stackName==='My New Stack');

// ── updateWEEKLY from active stack ────────────────────────────────────────────
console.log('\n── updateWEEKLY ───────────────────────────────────────────');
G._userStacks=[testStack];G._activeStackIndex=0;
G.updateWEEKLY();
check('updateWEEKLY builds WEEKLY',   G.WEEKLY.length>0,                        `got ${G.WEEKLY.length}`);
check('WEEKLY contains cjc-am',       G.WEEKLY.some(w=>w.id==='cjc-am'));
check('WEEKLY contains glow-1',       G.WEEKLY.some(w=>w.id==='glow-1'));
G._userStacks=[];G.updateWEEKLY();
check('empty stacks → WEEKLY_DEFAULT',G.WEEKLY.length===G.WEEKLY_DEFAULT.length);

// ── New stack saved includes cycle_length ─────────────────────────────────────
console.log('\n── wizSave includes cycle_length ──────────────────────────');
G.initWizard();
G.wizSetCycleLength(8);
G.wizSetStackName('Bulk Phase');
G._wiz.peptides=[{id:'cjc-am',name:'CJC',dot:'#3cffa0',days:[0,1,2,3,4,5,6],times:['AM'],dose_am:'4',active:true}];
G._userStacks=[];
// Mock saveStacksToBackend to capture what gets saved
let savedProto=null;
G.saveStacksToBackend=async function(){savedProto=G._userStacks[0];return true;};
G.wizSave().then(async ()=>{
  check('saved stack has cycle_length', savedProto&&savedProto.cycle_length===8,  `got ${savedProto?.cycle_length}`);
  check('saved stack has name',         savedProto&&savedProto.name==='Bulk Phase');
  check('saved stack has peptides',     savedProto&&savedProto.peptides.length===1);

  // ── Check state stability: loadUserStacks must not remap p.id ────────────────
  console.log('\n── Check state stability (id remapping regression) ──────────');
  // Simulate a stack saved before PR#10 with WEEKLY_DEFAULT-style ids
  const oldStyleStack={
    name:'My Stack',
    peptides:[
      {id:'reta-sun',name:'Retatrutide',dot:'#e8ff3c',days:[0,3],times:['AM'],dose_am:'3',unit_am:'mg'},
      {id:'cjc-am',  name:'CJC-1295 / IPA',dot:'#3cffa0',days:[0,1,2,3,4,5,6],times:['AM'],dose_am:'4',unit_am:'IU'},
      {id:'glow-1',  name:'GLOW Stack',dot:'#3b9eff',days:[0,1,2,3,4,5,6],times:['AM'],dose_am:'0.2',unit_am:'IU'},
    ]
  };
  G.fetch=async()=>({ok:true,json:async()=>({stacks:[JSON.parse(JSON.stringify(oldStyleStack))],active_index:0})});
  await G.loadUserStacks();
  const lp=G._userStacks[0].peptides;
  check('loadUserStacks: reta-sun id not remapped', lp[0].id==='reta-sun',  `got "${lp[0].id}" (would break check state)`);
  check('loadUserStacks: cjc-am id not remapped',   lp[1].id==='cjc-am',   `got "${lp[1].id}" (would break check state)`);
  check('loadUserStacks: glow-1 id not remapped',   lp[2].id==='glow-1',   `got "${lp[2].id}" (would break check state)`);
  check('loadUserStacks: glow-1 unit_am IU→ml',     lp[2].unit_am==='ml',  `got "${lp[2].unit_am}" (unit migration broken)`);
  const wklyChk=G.buildWeeklyFromProtocol(G._userStacks[0]);
  const wklyIds=wklyChk.map(w=>w.id);
  check('WEEKLY: reta-sun id preserved',            wklyIds.includes('reta-sun'),       `ids: ${wklyIds.join(', ')}`);
  check('WEEKLY: cjc-am id preserved',              wklyIds.includes('cjc-am'),         `ids: ${wklyIds.join(', ')}`);
  check('WEEKLY: glow-1 id preserved',              wklyIds.includes('glow-1'),         `ids: ${wklyIds.join(', ')}`);
  check('WEEKLY: no retatrutide (check state safe)',!wklyIds.includes('retatrutide'),   `retatrutide appeared — stored check state would not match`);

  // Final summary
  console.log(`\n${'─'.repeat(59)}`);
  console.log(`  ${passed} passed  ${failed} failed  ${passed+failed} total`);
  process.exit(failed===0?0:1);
});

// ── Blend vial PEPTIDE_CAT defaults ──────────────────────────────────────────
console.log('\n── Blend vial PEPTIDE_CAT defaults ────────────────────────');
const glowCat  = G.PEPTIDE_CAT.find(p=>p.id==='glow');
const klowCat  = G.PEPTIDE_CAT.find(p=>p.id==='klow');
const bpcTbCat = G.PEPTIDE_CAT.find(p=>p.id==='bpc-tb');
check('glow default unit is ml',    glowCat?.dflt?.unitAm==='ml',  `got "${glowCat?.dflt?.unitAm}"`);
check('glow default dose is 0.2',   parseFloat(glowCat?.dflt?.doseAm)===0.2, `got "${glowCat?.dflt?.doseAm}"`);
check('klow default unit is ml',    klowCat?.dflt?.unitAm==='ml',  `got "${klowCat?.dflt?.unitAm}"`);
check('klow default dose is 0.2',   parseFloat(klowCat?.dflt?.doseAm)===0.2, `got "${klowCat?.dflt?.doseAm}"`);
check('bpc-tb default unit is mg',  bpcTbCat?.dflt?.unitAm==='mg', `got "${bpcTbCat?.dflt?.unitAm}"`);
check('bpc-tb default dose is 1',   parseFloat(bpcTbCat?.dflt?.doseAm)===1.0, `got "${bpcTbCat?.dflt?.doseAm}"`);

// ── reconCalc ml unit ─────────────────────────────────────────────────────────
console.log('\n── reconCalc: ml dose unit ─────────────────────────────────');
// 0.2ml dose → ml=0.2, iu=20 (identity: ml input passes straight through)
const rcMl1=G.reconCalc('0.2','ml',70,2,'mg');
check('reconCalc ml: 0.2ml → ml=0.2',    rcMl1&&rcMl1.ml===0.2,  `got ${rcMl1?.ml}`);
check('reconCalc ml: 0.2ml → iu=20',     rcMl1&&rcMl1.iu===20,   `got ${rcMl1?.iu}`);
// 0.5ml dose on klow-type (80mg/2ml=40mg/ml) → 50 IU
const rcMl2=G.reconCalc('0.5','ml',80,2,'mg');
check('reconCalc ml: 0.5ml → ml=0.5',    rcMl2&&rcMl2.ml===0.5,  `got ${rcMl2?.ml}`);
check('reconCalc ml: 0.5ml → iu=50',     rcMl2&&rcMl2.iu===50,   `got ${rcMl2?.iu}`);

// ── reconDoseRow: ml unit and volume warnings ─────────────────────────────────
console.log('\n── reconDoseRow: ml unit & warnings ───────────────────────');
const rowMl  = G.reconDoseRow('AM','0.2','ml',70,2,'mg');
check('reconDoseRow ml: shows 20 IU',           rowMl.includes('20 IU'),         `snippet: ${rowMl.slice(0,150)}`);
check('reconDoseRow ml: no redundant arrow',    !rowMl.includes('→'),            'found arrow → in ml-input row');
check('reconDoseRow ml: no tiny-vol warning',   !rowMl.includes('Very small'),   'spurious tiny warning');
// 1.5mg at 35mg/ml = 0.0429ml < 0.05 → tiny volume warning
const rowTiny = G.reconDoseRow('AM','1.5','mg',70,2,'mg');
check('reconDoseRow: tiny vol < 0.05ml warns',  rowTiny.includes('Very small volume'), `snippet: ${rowTiny.slice(0,200)}`);
// Large volume (3ml at 2.5mg/ml)
const rowLarge= G.reconDoseRow('AM','3','ml',5,2,'mg');
check('reconDoseRow: large vol > 1ml warns',    rowLarge.includes('Large injection volume'), `snippet: ${rowLarge.slice(0,200)}`);

// ── buildReconCard HTML rendering ─────────────────────────────────────────────
console.log('\n── buildReconCard HTML rendering ───────────────────────────');
G._reconStackIdx=0; G._reconState={};

// Glow: 0.2ml at 70mg/2ml=35mg/ml → 0.2ml → 20 IU
const glowP  ={id:'glow',       name:'Glow Stack',        dose_am:'0.2',unit_am:'ml',dose_pm:'',unit_pm:'ml'};
const glowH  =G.buildReconCard(glowP,0);
check('buildReconCard glow: shows 20 IU',       glowH.includes('20 IU'),         `snippet: ${glowH.slice(0,200)}`);
check('buildReconCard glow: no redundant →',    !glowH.includes('>→<'),          'found >→< in glow card');

// Klow: 0.2ml at 80mg/2ml=40mg/ml → 20 IU
G._reconState={};
const klowP  ={id:'klow',       name:'Klow Stack',        dose_am:'0.2',unit_am:'ml',dose_pm:'',unit_pm:'ml'};
const klowH  =G.buildReconCard(klowP,1);
check('buildReconCard klow: shows 20 IU',       klowH.includes('20 IU'),         `snippet: ${klowH.slice(0,200)}`);

// BPC-TB: 1mg at 10mg/2ml=5mg/ml → 0.2ml → 20 IU
G._reconState={};
const bpcTbP ={id:'bpc-tb',     name:'BPC+TB Blend',      dose_am:'1', unit_am:'mg',dose_pm:'',unit_pm:'mg'};
const bpcTbH =G.buildReconCard(bpcTbP,2);
check('buildReconCard bpc-tb: shows 20 IU',     bpcTbH.includes('20 IU'),        `snippet: ${bpcTbH.slice(0,200)}`);

// Retatrutide: 3mg at 10mg/1ml=10mg/ml → 0.3ml → 30 IU
G._reconState={};
const retaP  ={id:'retatrutide',name:'Retatrutide',        dose_am:'3', unit_am:'mg',dose_pm:'',unit_pm:'mg'};
const retaH  =G.buildReconCard(retaP,3);
check('buildReconCard retatrutide: shows 30 IU', retaH.includes('30 IU'),        `snippet: ${retaH.slice(0,200)}`);

// Tirzepatide: 5mg at 10mg/1ml=10mg/ml → 0.5ml → 50 IU
G._reconState={};
const tirzP  ={id:'tirzepatide',name:'Tirzepatide',        dose_am:'5', unit_am:'mg',dose_pm:'',unit_pm:'mg'};
const tirzH  =G.buildReconCard(tirzP,4);
check('buildReconCard tirzepatide: shows 50 IU', tirzH.includes('50 IU'),        `snippet: ${tirzH.slice(0,200)}`);

// Semaglutide: 0.5mg at 5mg/2ml=2.5mg/ml → 0.2ml → 20 IU
G._reconState={};
const semaP  ={id:'semaglutide',name:'Semaglutide',        dose_am:'0.5',unit_am:'mg',dose_pm:'',unit_pm:'mg'};
const semaH  =G.buildReconCard(semaP,5);
check('buildReconCard semaglutide: shows 20 IU', semaH.includes('20 IU'),        `snippet: ${semaH.slice(0,200)}`);

// Ipamorelin: 200mcg at 5mg/2ml=2.5mg/ml → 0.08ml → 8 IU
G._reconState={};
const ipaP   ={id:'ipamorelin', name:'Ipamorelin',         dose_am:'200',unit_am:'mcg',dose_pm:'',unit_pm:'mcg'};
const ipaH   =G.buildReconCard(ipaP,6);
check('buildReconCard ipamorelin: shows 8 IU',   ipaH.includes('8 IU'),          `snippet: ${ipaH.slice(0,200)}`);

// HGH: 1 IU at 10IU/1ml → 0.1ml → 10 IU
G._reconState={};
const hghP   ={id:'hgh',        name:'HGH',                dose_am:'1',  unit_am:'IU',dose_pm:'',unit_pm:'IU'};
const hghH   =G.buildReconCard(hghP,7);
check('buildReconCard hgh: shows 10 IU',         hghH.includes('10 IU'),         `snippet: ${hghH.slice(0,200)}`);

// Synthesized-stack IDs (WEEKLY_DEFAULT style) must resolve correctly
console.log('\n── buildReconCard: synthesized-stack (WEEKLY_DEFAULT) IDs ──');
// 'reta-sun' is the id _synthesizeProtocol used to create before this fix
G._reconState={};
const retaSynP ={id:'reta-sun', name:'Retatrutide',   dose_am:'3',  unit_am:'mg',dose_pm:'',unit_pm:'mg'};
const retaSynH =G.buildReconCard(retaSynP,0);
check('buildReconCard reta-sun: resolves to 10mg/ml',  retaSynH.includes('10 mg/ml'),  `snippet: ${retaSynH.slice(0,300)}`);
check('buildReconCard reta-sun: shows 30 IU',          retaSynH.includes('30 IU'),     `snippet: ${retaSynH.slice(0,300)}`);

G._reconState={};
const cjcAmSynP={id:'cjc-am',  name:'CJC-1295 / IPA', dose_am:'400',unit_am:'mcg',dose_pm:'',unit_pm:'mcg'};
const cjcAmSynH=G.buildReconCard(cjcAmSynP,1);
check('buildReconCard cjc-am: resolves to cjc-ipa db',cjcAmSynH.includes('5 mg/ml'),  `snippet: ${cjcAmSynH.slice(0,300)}`);
check('buildReconCard cjc-am: shows 8 IU',            cjcAmSynH.includes('8 IU'),     `snippet: ${cjcAmSynH.slice(0,300)}`);

G._reconState={};
const glow1SynP={id:'glow-1',  name:'GLOW Stack',     dose_am:'0.2',unit_am:'ml', dose_pm:'',unit_pm:'ml'};
const glow1SynH=G.buildReconCard(glow1SynP,2);
check('buildReconCard glow-1: resolves to 35mg/ml',   glow1SynH.includes('35 mg/ml'), `snippet: ${glow1SynH.slice(0,300)}`);
check('buildReconCard glow-1: shows 20 IU',           glow1SynH.includes('20 IU'),    `snippet: ${glow1SynH.slice(0,300)}`);

// ── Meta ──────────────────────────────────────────────────────────────────────
console.log('\n── Meta ───────────────────────────────────────────────────');
check('VERSION defined',                    typeof G.VERSION==='string');
check('VERSION is x.xx (no suffix)',        /^\d+\.\d+$/.test(G.VERSION),        `got "${G.VERSION}"`);
check('AGENT_URL is https',                 G.AGENT_URL?.startsWith('https://'));
check('WEIGHTS_TOKEN defined',              G.WEIGHTS_TOKEN?.length>0);
check('no duplicate functions',             (()=>{const fs=rawScript.match(/(?:async )?function (\w+)\s*\(/g)||[];const names=fs.map(s=>s.replace(/async |function |\s*\(/g,''));return names.every((n,i)=>names.indexOf(n)===i);})());

// ── RECON_DB ──────────────────────────────────────────────────────────────────
console.log('\n── RECON_DB & reconCalc ───────────────────────────────────');
check('RECON_DB defined',                   typeof G.RECON_DB==='object'&&G.RECON_DB!==null);
check('20+ entries in RECON_DB',            Object.keys(G.RECON_DB||{}).length>=20,  `got ${Object.keys(G.RECON_DB||{}).length}`);
check('all PEPTIDE_CAT ids in RECON_DB',    G.PEPTIDE_CAT.every(p=>G.RECON_DB[p.id]),
  G.PEPTIDE_CAT.filter(p=>!G.RECON_DB[p.id]).map(p=>p.id).join(', '));
check('each entry has vials array',         Object.values(G.RECON_DB).every(e=>Array.isArray(e.vials)&&e.vials.length>0));
check('each entry has water array',         Object.values(G.RECON_DB).every(e=>Array.isArray(e.water)&&e.water.length>0));
check('hgh unit=IU',                        G.RECON_DB['hgh']?.unit==='IU');
check('hcg unit=IU',                        G.RECON_DB['hcg']?.unit==='IU');
check('semax nasal=true',                   G.RECON_DB['semax']?.nasal===true);
check('reconCalc defined',                  typeof G.reconCalc==='function');
// mcg dose on mg vial: 200mcg, 5mg/2ml → 2.5mg/ml → 0.08ml, 8 IU
const rc1=G.reconCalc('200','mcg',5,2,'mg');
check('200mcg/5mg@2ml → 0.08ml',           rc1&&rc1.ml===0.08,                     `got ${rc1?.ml}`);
check('200mcg/5mg@2ml → 8 IU',             rc1&&rc1.iu===8,                        `got ${rc1?.iu}`);
// mg dose on mg vial: 3mg, 5mg/1ml → 5mg/ml → 0.6ml, 60 IU
const rc2=G.reconCalc('3','mg',5,1,'mg');
check('3mg/5mg@1ml → 0.6ml',               rc2&&rc2.ml===0.6,                      `got ${rc2?.ml}`);
check('3mg/5mg@1ml → 60 IU',               rc2&&rc2.iu===60,                       `got ${rc2?.iu}`);
// IU pen dose on mg vial: 4 IU, 5mg/2ml → 0.04ml, 4 IU, 100mcg equiv
const rc3=G.reconCalc('4','IU',5,2,'mg');
check('4 IU pen/5mg@2ml → 0.04ml',         rc3&&rc3.ml===0.04,                     `got ${rc3?.ml}`);
check('4 IU pen/5mg@2ml → 100mcg equiv',   rc3&&rc3.mcgEquiv===100,                `got ${rc3?.mcgEquiv}`);
// IU/IU (HGH): 1 IU, 10IU/1ml → 0.1ml, 10 IU
const rc4=G.reconCalc('1','IU',10,1,'IU');
check('1 IU/10IU@1ml → 0.1ml',             rc4&&rc4.ml===0.1,                      `got ${rc4?.ml}`);
check('1 IU/10IU@1ml → 10 IU',             rc4&&rc4.iu===10,                       `got ${rc4?.iu}`);
// null cases
check('reconCalc null on empty dose',       G.reconCalc('','mg',5,2,'mg')===null);
check('reconCalc null on zero dose',        G.reconCalc('0','mg',5,2,'mg')===null);
// Recon functions defined
['renderRecon','selectReconStack','setReconState','buildReconCard','buildReconGuide','reconDoseRow']
  .forEach(fn=>check(fn+' defined', typeof G[fn]==='function'));

// ── RECON_DB defaults & clinical doses ────────────────────────────────────────
console.log('\n── RECON_DB defaults & clinical doses ─────────────────────');
const RDB=G.RECON_DB||{};
check('all entries have defaultVi',         Object.values(RDB).every(e=>e.defaultVi!=null),
  Object.entries(RDB).filter(([,e])=>e.defaultVi==null).map(([k])=>k).join(', '));
check('all entries have defaultWi',         Object.values(RDB).every(e=>e.defaultWi!=null),
  Object.entries(RDB).filter(([,e])=>e.defaultWi==null).map(([k])=>k).join(', '));
check('all defaultVi valid index',          Object.values(RDB).every(e=>e.defaultVi<e.vials.length),
  Object.entries(RDB).filter(([,e])=>e.defaultVi>=e.vials.length).map(([k])=>k).join(', '));
check('all defaultWi valid index',          Object.values(RDB).every(e=>e.defaultWi<e.water.length),
  Object.entries(RDB).filter(([,e])=>e.defaultWi>=e.water.length).map(([k])=>k).join(', '));

function defVial(id){const e=RDB[id];return e.vials[e.defaultVi];}
function defWater(id){const e=RDB[id];return e.water[e.defaultWi];}

// retatrutide: defaultVi=1→10mg, defaultWi=1→1ml → 10mg/ml → 3mg = 0.3ml = 30 IU
const rcReta=G.reconCalc('3','mg',defVial('retatrutide'),defWater('retatrutide'),'mg');
check('retatrutide default: 3mg → 0.3ml',  rcReta&&rcReta.ml===0.3,   `got ${rcReta?.ml}`);
check('retatrutide default: 3mg → 30 IU',  rcReta&&rcReta.iu===30,    `got ${rcReta?.iu}`);

// tirzepatide: defaultVi=1→10mg, defaultWi=1→1ml → 10mg/ml → 5mg = 0.5ml = 50 IU
const rcTirz=G.reconCalc('5','mg',defVial('tirzepatide'),defWater('tirzepatide'),'mg');
check('tirzepatide default: 5mg → 0.5ml',  rcTirz&&rcTirz.ml===0.5,   `got ${rcTirz?.ml}`);
check('tirzepatide default: 5mg → 50 IU',  rcTirz&&rcTirz.iu===50,    `got ${rcTirz?.iu}`);

// semaglutide: defaultVi=1→5mg, defaultWi=1→2ml → 2.5mg/ml → 0.5mg = 0.2ml = 20 IU
const rcSema=G.reconCalc('0.5','mg',defVial('semaglutide'),defWater('semaglutide'),'mg');
check('semaglutide default: 0.5mg → 0.2ml',rcSema&&rcSema.ml===0.2,   `got ${rcSema?.ml}`);
check('semaglutide default: 0.5mg → 20 IU',rcSema&&rcSema.iu===20,    `got ${rcSema?.iu}`);

// hgh (IU vial): defaultVi=1→10IU, defaultWi=0→1ml → 10IU/ml → 1IU = 0.1ml = 10 IU
const rcHgh=G.reconCalc('1','IU',defVial('hgh'),defWater('hgh'),'IU');
check('hgh default: 1 IU → 0.1ml',         rcHgh&&rcHgh.ml===0.1,    `got ${rcHgh?.ml}`);
check('hgh default: 1 IU → 10 IU',         rcHgh&&rcHgh.iu===10,     `got ${rcHgh?.iu}`);

// hcg (IU vial): defaultVi=0→5000IU, defaultWi=0→1ml → 5000IU/ml → 500IU = 0.1ml = 10 IU
const rcHcg=G.reconCalc('500','IU',defVial('hcg'),defWater('hcg'),'IU');
check('hcg default: 500 IU → 0.1ml',       rcHcg&&rcHcg.ml===0.1,    `got ${rcHcg?.ml}`);
check('hcg default: 500 IU → 10 IU',       rcHcg&&rcHcg.iu===10,     `got ${rcHcg?.iu}`);

// ipamorelin: defaultVi=1→5mg, defaultWi=1→2ml → 2.5mg/ml → 200mcg = 0.08ml = 8 IU
const rcIpa=G.reconCalc('200','mcg',defVial('ipamorelin'),defWater('ipamorelin'),'mg');
check('ipamorelin default: 200mcg → 0.08ml',rcIpa&&rcIpa.ml===0.08,  `got ${rcIpa?.ml}`);
check('ipamorelin default: 200mcg → 8 IU', rcIpa&&rcIpa.iu===8,      `got ${rcIpa?.iu}`);

// bpc157: defaultVi=0→5mg, defaultWi=1→2ml → 2.5mg/ml → 250mcg = 0.1ml = 10 IU
const rcBpc=G.reconCalc('250','mcg',defVial('bpc157'),defWater('bpc157'),'mg');
check('bpc157 default: 250mcg → 0.1ml',    rcBpc&&rcBpc.ml===0.1,    `got ${rcBpc?.ml}`);
check('bpc157 default: 250mcg → 10 IU',    rcBpc&&rcBpc.iu===10,     `got ${rcBpc?.iu}`);

// cjc-ipa: combo 10mg/2ml=5mg/ml total; each component 2.5mg/ml → 400mcg blend=200mcg each=0.08ml=8 IU
const rcCjc=G.reconCalc('400','mcg',defVial('cjc-ipa'),defWater('cjc-ipa'),'mg');
check('cjc-ipa default: 400mcg blend → 0.08ml',rcCjc&&rcCjc.ml===0.08, `got ${rcCjc?.ml}`);
check('cjc-ipa default: 400mcg blend → 8 IU',  rcCjc&&rcCjc.iu===8,    `got ${rcCjc?.iu}`);

// ── Price list validation ─────────────────────────────────────────────────────
console.log('\n── Price list: RECON_DB vials match pricelist.csv ─────────');
const plPath = path.join(__dirname, 'pricelist.csv');
// Map RECON_DB key → product name(s) in pricelist.csv (partial match on column 1)
const PRICELIST_MAP = {
  'cjc-ipa':    ['CJC1295(without DAC)5mg+IPA 5mg'],
  'cjc-nodac':  ['CJC-1295 Without DAC'],
  'ipamorelin': ['Ipamorelin'],
  'sermorelin': ['Sermorelin'],
  'tesamorelin':['Tesamorelin'],
  'hgh':        ['HGH'],
  'glow':       ['Glow(TB500 10mg + BPC-157 10mg + GHK-CU 50mg)'],
  'klow':       ['Klow(TB500 10mg + BPC-157 10mg + GHK-CU 50mg + KPV 10mg)'],
  'bpc-tb':     ['BPC 5mg + TB 5mg','BPC 10mg + TB 10mg'],
  'bpc157':     ['BPC 157'],
  'tb500':      ['TB500'],
  'ghkcu':      ['GHK-CU'],
  'retatrutide':['Retatrutide'],
  'tirzepatide':['Tirzepatide'],
  'semaglutide':['Semaglutide'],
  'aod9604':    ['AOD9604'],
  'semax':      ['Semax'],
  'selank':     ['Selank'],
  'epitalon':   ['Epitalon'],
  'motsc':      ['MOTS-C'],
  'nad':        ['NAD+'],
  'hcg':        ['HCG'],
};
check('pricelist.csv exists',               fs.existsSync(plPath));
if(fs.existsSync(plPath)){
  // Parse CSV: track current product name across continuation rows
  const plLines=fs.readFileSync(plPath,'utf8').split('\n');
  const plSizes={}; // productName → Set of numeric sizes
  let curProd='';
  for(const line of plLines){
    const cols=line.split(';');
    const name=(cols[1]||'').trim();
    const mg=(cols[2]||'').trim();
    if(name)curProd=name;
    if(curProd&&mg){
      const m=mg.match(/^(\d+(?:\.\d+)?)(mg|iu|ml)/i);
      if(m){
        if(!plSizes[curProd])plSizes[curProd]=new Set();
        plSizes[curProd].add(parseFloat(m[1]));
      }
    }
  }
  // For each RECON_DB key, verify every vial size appears in the price list
  for(const [dbKey,plNames] of Object.entries(PRICELIST_MAP)){
    const entry=RDB[dbKey];
    if(!entry){check(`${dbKey}: in RECON_DB`,false,'missing');continue;}
    // Merge available sizes from all matching product names
    const available=new Set();
    for(const pn of plNames)(plSizes[pn]||new Set()).forEach(s=>available.add(s));
    check(`${dbKey}: pricelist found`,available.size>0,`no rows for "${plNames.join('","')}"`);
    const bad=entry.vials.filter(v=>!available.has(v));
    check(`${dbKey}: all vials in pricelist`,bad.length===0,
      bad.length?`vials [${bad.join(',')}] not in pricelist (available: ${[...available].join(',')})`:'');
  }
}
