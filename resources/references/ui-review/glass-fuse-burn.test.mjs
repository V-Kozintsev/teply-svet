import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=name=>fs.readFileSync(new URL(name,import.meta.url),'utf8');
function setup({hidden=false,reduced=false}={}){
  const listeners={},timers=new Map();let nextId=0;
  const overlay={hidden:true,dataset:{}},meter={dataset:{}},document={hidden,
    addEventListener:(name,fn)=>{listeners[name]=fn;},defaultView:{addEventListener:(name,fn)=>{listeners[name]=fn;}}};
  const context=vm.createContext({Promise,setTimeout:(fn,ms)=>{timers.set(++nextId,{fn,ms});return nextId;},clearTimeout:id=>timers.delete(id)});
  const create=vm.runInContext(read('./glass-fuse-burn.js').replace('export ','')+'\ncreateGlassFuseBurn;',context);
  const controller=create({overlay,meter,document,reduced:{matches:reduced}});
  return {controller,overlay,meter,document,timers,listeners,finish(){[...timers.values()][0]?.fn();}};
}
test('one expiry cue is finite, cannot overlap itself and clears before the next attempt',async()=>{
  const s=setup(),first=s.controller.play();assert.equal(s.controller.play(),first);
  assert.equal(s.overlay.hidden,false);assert.equal(s.meter.dataset.burning,'true');
  assert.equal(s.timers.size,1);assert.equal([...s.timers.values()][0].ms,1350);
  s.finish();await first;assert.equal(s.overlay.hidden,true);assert.equal(s.meter.dataset.burning,undefined);assert.equal(s.timers.size,0);
  const second=s.controller.play();assert.notEqual(second,first);s.controller.reset();await second;
  assert.equal(s.overlay.hidden,true);assert.equal(s.timers.size,0);
});
test('background expiry has no cue delay and hiding or departing resolves an active cue',async()=>{
  const s=setup({hidden:true});await s.controller.play();assert.equal(s.overlay.hidden,true);assert.equal(s.timers.size,0);
  s.document.hidden=false;const first=s.controller.play();s.document.hidden=true;s.listeners.visibilitychange();await first;
  assert.equal(s.overlay.hidden,true);assert.equal(s.timers.size,0);
  s.document.hidden=false;const second=s.controller.play();s.listeners.pagehide();await second;assert.equal(s.timers.size,0);
});
test('reduced motion shows only the short stationary burnt-fuse cue',async()=>{
  const s=setup({reduced:true}),done=s.controller.play();assert.equal(s.overlay.dataset.reduced,'true');
  assert.equal([...s.timers.values()][0].ms,850);s.finish();await done;assert.equal(s.overlay.hidden,true);
});

for(const [name,source]of [
  ['shared',read('./glass-level.template.html')],
  ['first level',read('../../../public/levels/31/index.html')],
  ['relay level',read('../../../public/levels/44/index.html')],
])test(`${name}: timeout blocks the field, spends once and waits for both the burn and wallet`,async()=>{
  const events=[];let resolveBurn,resolveWallet;
  const burn=new Promise(resolve=>{resolveBurn=resolve;}),transaction=new Promise(resolve=>{resolveWallet=resolve;});
  const attempt={id:'original',rotations:[0]},retry={id:'retry',rotations:[1]},wallet={lives:4,attempts:{44:retry}};
  const scope={timerDisabled:false,timerFailed:false,currentAttempt:attempt,timerRemainingMs:1,timerDeadlineAt:100,
    level:{id:44,solution:[]},timeLimitMs:100000,glassLevelSignature:()=> 'signature',randomizedAttemptRotations:()=> [1],createHintId:()=> 'receipt',
    updateChargeHud(){events.push('hud');},energy:{reset(){events.push('closed');}},
    syncInteractiveState(){assert.equal(scope.timerFailed,true);events.push('blocked');},syncPause(){events.push('paused');},
    fuseBurn:{play(){events.push('burn');return burn;}},root:{querySelector:()=>({textContent:''})},
    hintWallet:{failTimedAttempt(...args){assert.equal(args[1],'original');events.push('spend');return transaction;}},
    acceptWallet(value,render){assert.equal(value.lives,4);assert.equal(render,false);events.push('wallet');},
    syncAttemptRoute(){events.push('retry-ready');},showTimeout(){events.push('dialog');},
  };
  const code=source.slice(source.indexOf('      async function expireChargeTimer(){'),source.indexOf('      function tickChargeTimer(){'));
  const expire=vm.runInContext(code+'\nexpireChargeTimer;',vm.createContext(scope));
  const done=expire();await expire();assert.deepEqual(events,['hud','closed','blocked','paused','burn','spend']);
  resolveWallet({wallet});await new Promise(resolve=>setImmediate(resolve));assert.equal(scope.currentAttempt.id,'retry');assert(!events.includes('dialog'));
  resolveBurn();await done;assert.equal(events.filter(e=>e==='spend').length,1);assert.equal(events.at(-1),'dialog');
  await expire();assert.equal(events.filter(e=>e==='spend').length,1);
});
