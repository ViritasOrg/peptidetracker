/**
 * Frontend logic tests — peptide tracker
 * Run: node /tmp/test_frontend.js
 */
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('/tmp/pt_live.html', 'utf8');
const rawScript = html.slice(html.indexOf('<script>') + 8, html.indexOf('</script>'));

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
G.wizSave().then(()=>{
  check('saved stack has cycle_length', savedProto&&savedProto.cycle_length===8,  `got ${savedProto?.cycle_length}`);
  check('saved stack has name',         savedProto&&savedProto.name==='Bulk Phase');
  check('saved stack has peptides',     savedProto&&savedProto.peptides.length===1);
  // Final summary
  console.log(`\n${'─'.repeat(59)}`);
  console.log(`  ${passed} passed  ${failed} failed  ${passed+failed} total`);
  process.exit(failed===0?0:1);
});

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
