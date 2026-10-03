import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { refineFirstEnergyWork } from './build-first-energy-work.mjs';
import { glassWaveTimeline, glassWaveDistance, reconcileGlassPulse, glassRelayState, glassTestPulseDuration } from './glass-energy.js';

// Exercise the transformed production controller, not another implementation of
// its caches. DOM doubles count native writes and geometry measurements only.
const read=name=>fs.readFileSync(new URL(name,import.meta.url),'utf8');
const separator='\n/* ENERGY_WORK_TEST_TEMPLATE */\n';
const refined=refineFirstEnergyWork(read('./glass-energy.js')+separator+read('./glass-level.template.html'));
const runtime=refined.slice(refined.indexOf('export function createGlassEnergy'),refined.indexOf(separator)).replace('export function','function');

function element(tag='g'){
 const attrs=new Map(),styleValues={},styleWrites={},attributeWrites={},classes=new Set();
 const node={tag,children:[],dataset:{},styleWrites,attributeWrites,pointCalls:[],classCalls:0,
  append(...nodes){this.children.push(...nodes);},prepend(...nodes){this.children.unshift(...nodes);},
  replaceChildren(...nodes){this.children=nodes;},
  getAttribute(name){return attrs.get(name)??null;},
  setAttribute(name,value){attrs.set(name,String(value));attributeWrites[name]=(attributeWrites[name]??0)+1;},
  removeAttribute(name){attrs.delete(name);},
  querySelectorAll(selector){return selector==='path'?this.children:[];},
  querySelector(selector){return selector==='path'?this.children[0]:null;},
  cloneNode(){const copy=element(tag);for(const [name,value]of attrs)copy.setAttribute(name,value);return copy;},
  getPointAtLength(distance){this.pointCalls.push(distance);return{x:distance,y:this.getAttribute('d').length};},
  animate(){return{cancel(){},pause(){},play(){},playState:'running'};},
 };
 node.style=new Proxy(styleValues,{get:(target,key)=>key==='setProperty'?(name,value)=>{target[name]=String(value);styleWrites[name]=(styleWrites[name]??0)+1;}:target[key]??'',set:(target,key,value)=>{target[key]=String(value);styleWrites[key]=(styleWrites[key]??0)+1;return true;}});
 node.classList={add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c),toggle(c,force){node.classCalls++;const enabled=force??!classes.has(c);if(enabled)classes.add(c);else classes.delete(c);return enabled;}};
 return node;
}

function scene({reduced=false,withRelay=false}={}){
 const wave=element(),front=element(),end=element(),base=element(),testBase=element(),beacon=element(),root=element(),source=element(),svg=element();
 wave.append(element('path'),element('path'),element('path'));
 base.append(element('path'));testBase.append(element('path'));
 const panes=element(),glows=element();for(const group of [panes,glows]){const path=element('path');path.setAttribute('d','M0 0L1 1M2 2L3 3');group.append(path);}
 root.isConnected=true;
 root.querySelector=()=>null;
 root.querySelectorAll=selector=>selector.includes('.panes,')?[panes,glows]:selector==='.sequential-crossover-mechanism'&&relay?[relay]:[];
 source.querySelector=selector=>selector==='.beacon'?beacon:null;
 const bySelector=new Map([['.test-base',testBase],['.test-particles',element('path')],['.energy-particles',element('path')],['.travel-wave',wave],['.energy-layer',base],['.arrival-mask',front],['.end-glow',end]]);
 svg.querySelector=selector=>bySelector.get(selector);
 const relay=withRelay?element():null;
 if(relay){relay.dataset.cell='8';relay.dataset.relayArt='side-slides';relay.dataset.sequenceState='closed';}
 svg.querySelectorAll=selector=>selector==='.test-base path,.energy-layer path'?[...testBase.children,...base.children]:[];
 let nextFrame=null;
 const context=vm.createContext({window:{},document:{createElementNS:(_ns,tag)=>element(tag),createElement:element},requestAnimationFrame:fn=>{nextFrame=fn;return 1;},cancelAnimationFrame:()=>{nextFrame=null;},glassWaveTimeline,glassWaveDistance,glassTestPulseDuration,reconcileGlassPulse,glassRelayState});
 const create=vm.runInContext(runtime+'\ncreateGlassEnergy;',context);
 const energy=create({root,svg,sourceButton:source,reduced:{matches:reduced},onState(){}});
 const circuit=({d='M0 0L100 0',length=100,strands=[{d,length,goalIndex:14}],collars=[],complete=true}={})=>({d,length,strands,segments:[],stars:[],collars,breakCollar:null,complete,crossoverRelays:relay?[{index:8,node:relay,firstDistance:20,unlockDistance:45,gateDistance:70,gateEndDistance:90,holdOpenUntilPulseEnds:true}]:[]});
 return{energy,circuit,wave,front,end,base,testBase,panes,glows,root,relay,tick(time){assert(nextFrame);const fn=nextFrame;nextFrame=null;fn(time);}};
}

const feed=length=>({goalIndex:14,length,base:element('path'),ray:element(),paths:[element('path'),element('path')]});

test('wave dash cache initializes replacement paths when strand count changes but total length does not',()=>{
 const s=scene();s.energy.setCircuit(s.circuit());s.energy.pulseNow();
 const original=[...s.wave.children];assert(original.every(p=>p.style.strokeDasharray==='95 196'));
 const writes=original.map(p=>p.styleWrites.strokeDasharray);s.energy.pulseNow();assert.deepEqual(original.map(p=>p.styleWrites.strokeDasharray),writes);
 s.energy.setCircuit(s.circuit({strands:[{d:'M0 0L100 0',length:100,goalIndex:14},{d:'M0 0L0 100',length:100,goalIndex:24}]}));s.energy.pulseNow();
 assert.equal(s.wave.children.length,6);assert(s.wave.children.every(p=>!original.includes(p)&&p.style.strokeDasharray==='95 196'&&p.styleWrites.strokeDasharray===1));
});

test('external feed resize updates cached wave and ray lengths, including replacement feed objects',()=>{
 const s=scene(),f=feed(20);s.energy.setCircuit(s.circuit());s.energy.setExternalFeeds([f]);s.energy.pulseNow();
 assert.equal(s.wave.children[0].style.strokeDasharray,'95 216');assert.equal(f.paths[0].style.strokeDasharray,'95 116');
 const writes=f.paths[0].styleWrites.strokeDasharray;s.energy.pulseNow();assert.equal(f.paths[0].styleWrites.strokeDasharray,writes);
 f.length=60;s.energy.setExternalFeeds([f]);assert.equal(s.wave.children[0].style.strokeDasharray,'95 256');assert.equal(f.paths[0].style.strokeDasharray,'95 156');
 const replacement=feed(60);s.energy.setExternalFeeds([replacement]);assert(replacement.paths.every(p=>p.style.strokeDasharray==='95 156'));
});

test('external feed refresh initializes new path nodes even when the feed object and length are unchanged',()=>{
 const s=scene(),f=feed(20);s.energy.setCircuit(s.circuit());s.energy.setExternalFeeds([f]);s.energy.pulseNow();
 f.paths=[element('path'),element('path')];s.energy.setExternalFeeds([f]);
 assert(f.paths.every(p=>p.style.strokeDasharray==='95 116'));
});

test('window count cache preserves power and repeated resets',()=>{
 const s=scene({reduced:true});s.energy.setCircuit(s.circuit());
 const windows=[...s.panes.children,...s.glows.children];assert(windows.every(p=>!p.classList.contains('lit')));
 assert.equal(s.energy.activate(),true);assert(windows.every(p=>p.classList.contains('lit')));
 const writes=windows.map(p=>p.classCalls);s.energy.setReduced(true);assert.deepEqual(windows.map(p=>p.classCalls),writes);
 s.energy.reset();assert(windows.every(p=>!p.classList.contains('lit')));
 const resetWrites=windows.map(p=>p.classCalls);s.energy.reset();assert.deepEqual(windows.map(p=>p.classCalls),resetWrites);
 assert.equal(s.energy.activate(),true);assert(windows.every(p=>p.classList.contains('lit')));
});

test('reset closes a powered relay immediately even while paused with reduced motion',()=>{
 const s=scene({reduced:true,withRelay:true});s.energy.setCircuit(s.circuit());
 assert.equal(s.energy.activate(),true);assert.equal(s.relay.dataset.sequenceState,'open');
 s.energy.setPaused(true);s.energy.reset();
 assert.equal(s.relay.dataset.sequenceState,'closed');
 assert.equal(s.root.dataset.energyState,'READY');
 assert.equal(s.wave.style.opacity,'0');assert.equal(s.base.style.opacity,'0');
 assert.equal(s.root.dataset.relayReset,'true');
 s.energy.reset();assert.equal(s.relay.dataset.sequenceState,'closed');
 s.energy.setPaused(false);assert.equal(s.relay.dataset.sequenceState,'closed');
 assert.equal(s.energy.activate(),true);assert.equal(s.relay.dataset.sequenceState,'open');
 assert.equal(s.root.dataset.relayReset,'false');
 s.energy.setCircuit({...s.circuit({complete:false}),crossoverRelays:[]});
 assert.equal(s.relay.dataset.sequenceState,'closed');
});

test('a stopped diagnostic pulse cannot carry an open relay into a new paused attempt',()=>{
 const s=scene({withRelay:true});s.energy.setCircuit(s.circuit({complete:false}));s.energy.pulseNow();
 for(const now of [0,80,160,240,320,400,480])s.tick(now);
 assert.equal(s.relay.dataset.sequenceState,'closed','entering the lower pipe cannot lift the upper shutters yet');
 for(const now of [560,640,720,800,880,960,1040])s.tick(now);
 assert.equal(s.relay.dataset.sequenceState,'open');
 s.energy.setPaused(true);
 s.energy.setCircuit({...s.circuit({d:'M0 0L0 100',complete:false}),crossoverRelays:[]});
 assert.equal(s.relay.dataset.sequenceState,'closed');assert.equal(s.wave.style.opacity,'0');
 s.energy.setPaused(false);s.tick(2000);assert.equal(s.relay.dataset.sequenceState,'closed');
 s.tick(2080);assert.equal(s.relay.dataset.sequenceState,'closed');
});

test('final charge traverses the lower relay channel before opening the upper shutters',()=>{
 const s=scene({withRelay:true});s.energy.setCircuit(s.circuit());assert.equal(s.energy.activate(),true);
 for(const now of [0,80,160,240,320])s.tick(now);
 assert.equal(s.relay.dataset.sequenceState,'closed');
 for(const now of [400,480,560,640])s.tick(now);
 assert.equal(s.relay.dataset.sequenceState,'open');
});

test('a long diagnostic pulse reaches the break without the repeat timer restarting it',()=>{
 const s=scene();s.energy.setCircuit(s.circuit({length:4000,complete:false}));s.energy.pulseNow();
 let previous=0;
 for(let now=0;now<=8000;now+=80){
  s.tick(now);const distance=95-Number(s.wave.children[0].style.strokeDashoffset);
  assert.ok(distance>=previous,'the moving front never jumps back to the transformer');previous=distance;
 }
 assert.ok(previous>=3960&&previous<=4040,'the front takes about eight seconds to cover forty cells');
 for(let now=8080;now<=8400;now+=80)s.tick(now);
 assert.equal(s.wave.style.opacity,'0','the completed pulse fades before another starts');
});

test('endpoint cache uses both exact path data and logical length, retaining coordinates through cloned fronts',()=>{
 const s=scene();s.energy.setCircuit(s.circuit());const first=s.front.children[0];assert.deepEqual(first.pointCalls,[98]);
 const dWrites=s.testBase.children[0].attributeWrites.d;s.energy.setCircuit(s.circuit());assert.deepEqual(first.pointCalls,[98]);assert.equal(s.testBase.children[0].attributeWrites.d,dWrites);
 s.energy.setCircuit(s.circuit({length:200}));assert.deepEqual(first.pointCalls,[98,198]);assert.equal(s.end.getAttribute('cx'),'198');
 const other='M0 0L0 200';s.energy.setCircuit(s.circuit({d:other,length:200}));assert.deepEqual(first.pointCalls,[98,198,198]);assert.equal(s.end.getAttribute('cy'),String(other.length));
 s.energy.setCircuit(s.circuit({d:other+'M0 0L10 0',length:200,strands:[{d:other,length:200,goalIndex:14},{d:'M0 0L10 0',length:10,goalIndex:24}]}));
 assert.notEqual(s.front.children[0],first);assert.equal(s.front.children[0].pointCalls.length,0);assert.equal(s.end.getAttribute('cx'),'198');
});

test('logical length cache preserves zero and fractional browser values and bounds retained entries to 256',()=>{
 const start=refined.indexOf('      const flowLengths=new Map();'),end=refined.indexOf('      function render(editedCell=null){',start);
 assert(start>=0&&end>start);const measurements=[];
 const context=vm.createContext({node:(_tag,{d})=>({getTotalLength(){measurements.push(d);return d==='zero'?0:Number(d)+.123456789;}})});
 const api=vm.runInContext(refined.slice(start,end)+'\n({length:flowLength,size:()=>flowLengths.size});',context);
 assert.equal(api.length('zero'),0);assert.equal(api.length('zero'),0);assert.deepEqual(measurements,['zero']);
 for(let i=0;i<255;i++){const expected=i+.123456789;assert.equal(api.length(String(i)),expected);assert.equal(api.length(String(i)),expected);assert(api.size()<=256);}
 assert.equal(api.size(),256);assert.equal(measurements.length,256);
 assert.equal(api.length('255'),255.123456789);assert(api.size()<=256);const before=measurements.length;
 assert.equal(api.length('zero'),0);assert.equal(measurements.length,before+1);assert.equal(api.length('255'),255.123456789);assert.equal(measurements.length,before+1);
});

test('stable empty collar filters are not written again, but a previous flash is cleared',()=>{
 const s=scene(),collar=element();s.energy.setCircuit(s.circuit({collars:[{node:collar,distance:50}]}));
 const initial=collar.styleWrites.filter??0;s.energy.pulseNow();s.energy.pulseNow();assert.equal(collar.styleWrites.filter??0,initial);
 collar.style.filter='brightness(2)';const flashWrites=collar.styleWrites.filter;s.energy.pulseNow();assert.equal(collar.style.filter,'');assert.equal(collar.styleWrites.filter,flashWrites+1);
 s.energy.pulseNow();assert.equal(collar.styleWrites.filter,flashWrites+1);
});
