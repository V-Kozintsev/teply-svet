import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('./glass-first-mobile-renderer.js',import.meta.url),'utf8');
function scene({star=false,duration=0,slider=false}={}){
  let now=0,maskWrites=0;
  const elements=[];
  const node=()=>{const e={style:{setProperty(){}},dataset:{},append(){},firstElementChild:{getAttribute:()=> 'M0 50L100 50'}};elements.push(e);return e;};
  const sockets=star?node():null;const mask=node();let maskTransform='';Object.defineProperty(mask.style,'transform',{get:()=>maskTransform,set:v=>{maskTransform=v;maskWrites++}});
  const svg={parentElement:{insertBefore(){},querySelector(){},addEventListener(){}},getAttribute:()=> '0 0 500 500',querySelector:selector=>selector.includes('star-chamber')?sockets:mask};
  const context=vm.createContext({document:{createElement:node},performance:{now:()=>now}});
  const create=vm.runInContext(source+'\ncreateGlassFirstPipeLayers;',context);
  const controller=create({root:{dataset:{turnReady:'true'},style:{getPropertyValue:()=>String(duration)}},svg,pipePieces:new Map([[0,node()]]),collarPieces:new Map([[0,node()]]),surfaces:node(),node,level:{size:5,...(slider?{sliders:[{index:0,slot:5}]}:{})}});
  const rotor=()=>elements.find(e=>e.className==='first-cell-rotor first-pipe-rotor');
  controller.turn(0,0);
  return {controller,mask,sockets,transform:()=>rotor().style.transform,angle:()=>Number(rotor().style.transform.match(/rotate\(([-\d.]+)/)[1]),setTime:t=>now=t,tick:t=>{now=t;controller.tick(t)},writes:()=>maskWrites};
}

test('a frame missed near the end does not extend the real rotation deadline',()=>{
  const s=scene();s.controller.turn(0,90);s.tick(160);assert(s.angle()>0&&s.angle()<90);
  s.tick(300);assert.equal(s.angle(),90);
});
test('disconnected masks do not gain work in the final frame; lighting synchronizes them',()=>{
  const s=scene();s.controller.setLightCells([]);const writes=s.writes();s.controller.turn(0,90);
  for(const t of [16,80,160,240,360])s.tick(t);
  assert.equal(s.angle(),90);assert.equal(s.writes(),writes);
  s.controller.setLightCells([0]);assert.equal(s.mask.style.transform,'rotate(90deg)');
});
test('pause excludes background time, including a turn requested during pause',()=>{
  const s=scene();s.controller.turn(0,90);s.tick(100);const angle=s.angle();s.controller.setPaused(true);
  s.tick(2000);assert.equal(s.angle(),angle);s.controller.setPaused(false);s.tick(2260);assert.equal(s.angle(),90);
  s.controller.setPaused(true);s.setTime(2400);s.controller.turn(0,180);s.setTime(4000);s.controller.setPaused(false);
  s.tick(4000);assert.equal(s.angle(),90);s.tick(4240);assert.equal(s.angle(),180);
});
test('rapid retarget preserves the displayed position and continues clockwise',()=>{
  const s=scene();s.controller.setLightCells([0]);s.controller.turn(0,90);s.tick(120);const angle=s.angle();
  s.controller.turn(0,180);assert.equal(s.angle(),angle);let previous=angle;
  for(let t=130;t<=700;t+=10){s.tick(t);assert(s.angle()>=previous);previous=s.angle();assert.equal(s.mask.style.transform,`rotate(${s.angle()}deg)`);}
  assert.equal(s.angle(),180);
});
test('rollback and reduced motion settle without resurrecting an old rotation',()=>{
  const s=scene();s.controller.setLightCells([0]);s.controller.turn(0,90);s.tick(120);s.controller.turn(0,0);s.tick(500);assert.equal(s.angle(),0);
  s.controller.turn(0,90);s.controller.setReduced(true);assert.equal(s.angle(),90);s.tick(1000);assert.equal(s.angle(),90);
});

test('star sockets follow the pipe for the full paid-hint duration',()=>{const s=scene({star:true,duration:1460});s.controller.turn(0,180);s.tick(360);assert(s.angle()>0&&s.angle()<180);assert.equal(s.sockets.style.transform,`rotate(${s.angle()}deg)`);s.tick(1460);assert.equal(s.angle(),180);assert.equal(s.sockets.style.transform,'rotate(180deg)');});

test('a slider uses the shared paused motion clock in both directions and moves its current mask',()=>{
 const s=scene({slider:true});s.controller.setLightCells([5]);s.controller.turn(0,90);s.tick(120);assert.match(s.transform(),/^translate\(0%,50%\)$/);assert.equal(s.mask.style.transform,'translate(0px,50px)');
 s.controller.setPaused(true);s.tick(2000);assert.equal(s.transform(),'translate(0%,50%)');s.controller.setPaused(false);s.tick(2120);assert.equal(s.transform(),'translate(0%,100%)');
 s.controller.turn(0,180);s.tick(2240);assert.equal(s.transform(),'translate(0%,50%)');s.tick(2480);assert.equal(s.transform(),'translate(0%,0%)');assert.equal(s.mask.style.transform,'translate(0px,0px)');
 s.controller.turn(0,810);s.controller.setReduced(true);assert.equal(s.transform(),'translate(0%,100%)');s.tick(3000);assert.equal(s.transform(),'translate(0%,100%)');
});
