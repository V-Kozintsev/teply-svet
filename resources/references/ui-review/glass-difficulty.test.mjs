import test from 'node:test';
import assert from 'node:assert/strict';
import {glassLevels,orientGlassCells,traceGlassCircuit,applyGlassTurn,getGlassEarnedStars,planGlassHint} from './glass-energy.js';

// Enumerate every geometric corridor, including either sensing axis at each
// rotatable relay. BigInt keeps cells 32–35 distinct on six-by-six fields.
function corridors(level){
 const n=level.size,D=['N','E','S','W'],op={N:'S',E:'W',S:'N',W:'E'},delta={N:-n,E:1,S:n,W:-1},axis=s=>s==='N'||s==='S'?0:1;
 const crosses=level.crossovers??[],fixed=level.fixed??[],bit=i=>1n<<BigInt(i),paths=[];
 function walk(index,entry,used,passes,path){
  const ci=crosses.indexOf(index),ports=level.solution[index].slice(1);let exits;
  if(ci>=0){const channel=1<<axis(entry);if(passes[ci]&channel)return;passes=[...passes];passes[ci]|=channel;exits=[op[entry]];}
  else if(fixed.includes(index))exits=ports.includes(entry)?ports.filter(side=>side!==entry):[];
  else{const straight=op[ports[0]]===ports[1];exits=ports.length===2?D.filter(side=>side!==entry&&(straight?side===op[entry]:side!==op[entry])):[];}
  for(const exit of exits){
   if(index===level.goal.index&&exit===level.goal.side){paths.push(path);continue;}
   const next=index+delta[exit];if(next<0||next>=n*n||axis(exit)===1&&Math.floor(index/n)!==Math.floor(next/n))continue;
   if(crosses.includes(next)?passes[crosses.indexOf(next)]&(1<<axis(exit)):used&bit(next))continue;
   walk(next,op[exit],used|bit(next),passes,[...path,next]);
  }
 }
 walk(level.source.index,level.source.side,bit(level.source.index),crosses.map(()=>0),[level.source.index]);return paths;
}

for(const [number,length,clicks,timer]of [[6,21,35,65],[7,23,40,70],[8,23,42,75]])test(`visible ${number} has one dense corridor and no shorter geometric shortcut`,()=>{
 const l=glassLevels.find(l=>l.displayNumber===number);
 assert.equal(l.size,5);assert.equal(l.solution.filter(c=>c.length===3).length,25);assert.deepEqual(l.stars,[]);assert.equal(l.hintsEnabled,false);assert.equal(l.timeLimitSeconds,timer);
 assert.deepEqual(corridors(l),l.paths);assert.equal(l.paths.length,1);assert.equal(l.paths[0].length,length);assert.equal(l.variants[0].actions.length,clicks);
 if(number===8){const post={...l,...l.outage};assert.deepEqual(corridors(post),[post.hintRoute]);assert.equal(post.hintRoute.length,21);assert.equal(post.variants[0].actions.length,10);assert.notDeepEqual(post.hintRoute,l.hintRoute);assert.equal(traceGlassCircuit(orientGlassCells(post.solution,post.initialRotations),post).complete,false);}
});

test('visible 9 is a larger unique maze with deep false approaches from both ends',()=>{
 const l=glassLevels.find(level=>level.displayNumber===9),eight=glassLevels.find(level=>level.displayNumber===8);
 assert.equal(l.id,43);assert.equal(l.size,6);assert.equal(l.timeLimitSeconds,95);
 assert.equal(l.solution.filter(cell=>cell.length===3).length,36);
 assert.deepEqual(l.stars,[]);assert.equal(l.outage,undefined);
 assert.deepEqual(corridors(l),l.paths);assert.equal(l.paths.length,1);assert.equal(l.hintRoute.length,34);
 const variant=l.variants[0];assert.equal(variant.actions.length,58);
 assert.ok(variant.actions.length>eight.variants[0].actions.length+eight.outage.variants[0].actions.length);
 const initial=orientGlassCells(l.solution,l.initialRotations);
 function connectedApproach(index,entry){
  const sides={N:-6,E:1,S:6,W:-1},op={N:'S',E:'W',S:'N',W:'E'},path=[],seen=new Set();
  while(!seen.has(index)){
   const ports=initial[index].slice(1);if(!ports.includes(entry))break;
   seen.add(index);path.push(index);
   const exit=ports.find(side=>side!==entry),next=index+sides[exit];
   if(next<0||next>=36||(exit==='E'||exit==='W')&&Math.floor(index/6)!==Math.floor(next/6)||!initial[next].slice(1).includes(op[exit]))break;
   index=next;entry=op[exit];
  }
  return path;
 }
 assert.deepEqual(connectedApproach(l.source.index,l.source.side),[12,18,19,20,21,27,28,34,35]);
 assert.deepEqual(connectedApproach(l.goal.index,l.goal.side),[17,11,10,9,15,16,22,23]);
 let rotations=[...l.initialRotations];for(const cell of variant.actions)rotations=applyGlassTurn(l,rotations,cell).rotations;
 assert.deepEqual(rotations,variant.rotations);
 const powered=traceGlassCircuit(orientGlassCells(l.solution,rotations),l);
 assert.equal(powered.complete,true);assert.deepEqual(powered.openEnds,[]);assert.equal(getGlassEarnedStars(powered,l),1);
});

for(const [number,length,shortest,fullClicks,timer]of [[16,32,22,68,120],[17,36,20,67,140],[18,38,24,66,160]])test(`visible ${number} certifies every six-by-six relay route and its repair`,()=>{
 const l=glassLevels.find(l=>l.displayNumber===number),routes=corridors(l),full=l.variants.find(v=>v.stars===3);
 assert.equal(l.size,6);assert.equal(l.solution.length,36);assert.equal(l.stars.length,2);assert.equal(l.fixed.length,1);assert.equal(l.crossovers.length,number===18?2:1);assert.equal(l.hintsEnabled,true);assert.equal(l.timeLimitSeconds,timer);
 assert.deepEqual(routes.map(p=>p.join()).sort(),l.paths.map(p=>p.join()).sort());assert.equal(Math.min(...routes.map(p=>p.length)),shortest);
 if(number===18){const opening=traceGlassCircuit(orientGlassCells(l.solution,l.initialRotations),l);assert.equal(opening.complete,false);assert.deepEqual(opening.flowPaths[0].map(([index])=>index),[12,13,14,15,9,10,16]);}
 assert.equal(routes.filter(p=>l.stars.every(i=>p.includes(i))).length,1);assert.equal(full.path.length,length);assert.equal(full.actions.length,fullClicks);
 assert.ok(l.fixed.every(i=>full.path.includes(i)));assert.equal(applyGlassTurn(l,l.initialRotations,l.fixed[0]),null);
 assert.deepEqual([...new Set(l.variants.map(v=>v.stars))],[1,2,3]);
 for(const v of l.variants){
  let r=[...l.initialRotations];for(const i of v.actions)r=applyGlassTurn(l,r,i).rotations;
  assert.deepEqual(r,v.rotations);const tr=traceGlassCircuit(orientGlassCells(l.solution,r),l);
  assert.equal(tr.complete,true);assert.equal(getGlassEarnedStars(tr,l),v.stars);assert.deepEqual(tr.openEnds,[]);assert.deepEqual(tr.flowPaths[0].map(([i])=>i),v.path);
  if(l.outage){for(const [i,q]of l.outage.turns)r=applyGlassTurn(l,r,i,q).rotations;assert.equal(traceGlassCircuit(orientGlassCells(l.solution,r),l).complete,false);
   for(const [i,q]of l.outage.turns)r=applyGlassTurn(l,r,i,4-q).rotations;
   assert.equal(getGlassEarnedStars(traceGlassCircuit(orientGlassCells(l.solution,r),l),l),v.stars);
  }
  let retained=null;for(let n=0;n<40;n++){const h=planGlassHint(l,r,retained);if(h.kind==='power')break;assert.equal(h.kind,'rotate');r=h.rotations;retained=h.planId;assert.ok(n<39);}
  assert.equal(getGlassEarnedStars(traceGlassCircuit(orientGlassCells(l.solution,r),l),l),3);
 }
 for(const index of l.crossovers){assert.equal(full.path.filter(i=>i===index).length,2);const wrong=[...full.rotations];wrong[index]++;assert.equal(traceGlassCircuit(orientGlassCells(l.solution,wrong),l).complete,false);}
 for(let mask=0;mask<2**l.crossovers.length;mask++){const r=[...full.rotations];l.crossovers.forEach((i,k)=>r[i]+=mask&(1<<k)?2:0);assert.equal(getGlassEarnedStars(traceGlassCircuit(orientGlassCells(l.solution,r),l),l),3);}
});
