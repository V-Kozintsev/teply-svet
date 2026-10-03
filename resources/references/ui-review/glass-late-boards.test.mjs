import test from 'node:test';
import assert from 'node:assert/strict';
import {glassLevels,orientGlassCells,traceGlassCircuit,applyGlassTurn,getGlassEarnedStars,planGlassHint,glassOutageRemainingMs} from './glass-energy.js';

// Independently enumerate physical pipe corridors. A shared control has one
// orientation domain, even if its two pipes are far apart. Relay order is
// checked in source-to-house order after either direction of geometric search.
const sides=['N','E','S','W'],opposite={N:'S',E:'W',S:'N',W:'E'};
const axis=side=>side==='N'||side==='S'?0:1;
const rotate=(port,q)=>sides[(sides.indexOf(port)+q+400)%4];
export function enumerateLateCorridors(level,{reverse=false,maxNodes=10000000}={}){
 const size=level.size,source=reverse?level.goal:level.source,goal=reverse?level.source:level.goal;
 const delta={N:-size,E:1,S:size,W:-1},bit=index=>1n<<BigInt(index);
 const peers=new Map((level.hatches??[]).flatMap(pair=>[[pair.a,pair.b],[pair.b,pair.a]]));
 const relays=new Map((level.sequentialCrossovers??[]).map(item=>[item.index,item]));
 const crossovers=new Set(level.crossovers??[]),fixed=new Set(level.fixed??[]);
 const pairs=new Map((level.switches??[]).flatMap(pair=>[[pair.index,pair],[pair.linked,pair]]));
 const slides=level.sliders??[],initial=level.initialRotations;
 const control=index=>pairs.get(index)?.index??index;
 const results=[];let nodes=0;
 function constrain(domains,index,allowed){
  const key=control(index),before=domains.get(key)??(fixed.has(index)?[0]:[0,1,2,3]);
  const remaining=before.filter(allowed);if(!remaining.length)return null;
  const next=new Map(domains);next.set(key,remaining);return next;
 }
 function finish(path,segments,domains,positions){
  const ordered=reverse?[...segments].reverse():segments,passes=new Set();
  for(const step of ordered){
   const relay=relays.get(step.index);if(!relay)continue;
   const expected=passes.has(step.index)?relay.then??['W','E']:relay.first??['N','S'];
   domains=constrain(domains,step.index,q=>{
    const turns=initial[step.index]+q;
    return (!relay.verticalSensorOnly||turns%2===0)&&expected.some(side=>rotate(side,turns)===step.entry);
   });
   if(!domains)return;passes.add(step.index);
  }
  const rotations=[...initial],actions=[];
  for(const [key,domain] of domains){const q=Math.min(...domain);for(const cell of pairs.has(key)?[key,pairs.get(key).linked]:[key])rotations[cell]+=q;for(let n=0;n<q;n++)actions.push(key);}
  for(const [i,position]of positions.entries()){const slide=slides[i];if(!path.includes(slide.index)&&!path.includes(slide.slot))continue;const q=(position-initial[slide.index]%2+2)%2;rotations[slide.index]+=q;if(q)actions.push(slide.index);}
  results.push({path,rotations,actions,stars:1+level.stars.filter(index=>path.includes(index)).length});
 }
 function search(positions){
  const pipes=level.solution.map(cell=>cell.slice(1)),sliderCells=new Set();
  for(const [i,slide]of slides.entries()){pipes[slide.index]=[];pipes[slide.slot]=[];pipes[positions[i]?slide.slot:slide.index]=level.solution[slide.index].slice(1);sliderCells.add(slide.index);sliderCells.add(slide.slot);}
  function walk(index,entry,used,passes,path,segments,domains){
   if(++nodes>maxNodes)throw new Error('Independent geometry search exceeded its node budget');
   const ports=pipes[index];if(!ports?.length)return;
   if(peers.has(index)){
    if(!ports.includes(entry))return;
    const peer=peers.get(index);if(used&bit(peer))return;
    const exit=pipes[peer][0];if(!exit)return;
    advance(peer,exit,used|bit(peer),passes,[...path,peer],[...segments,{index,entry,exit:null},{index:peer,entry:null,exit}],domains);return;
   }
   if(crossovers.has(index)){
    const channel=1<<axis(entry);if((passes.get(index)??0)&channel)return;
    const nextPasses=new Map(passes);nextPasses.set(index,(passes.get(index)??0)|channel);
    advance(index,opposite[entry],used,nextPasses,path,[...segments,{index,entry,exit:opposite[entry]}],domains);return;
   }
   if(ports.length!==2)throw new Error('Unexpected ordinary pipe shape at '+index);
   for(const exit of sides){
    if(exit===entry)continue;
    let nextDomains;
    if(sliderCells.has(index))nextDomains=ports.includes(entry)&&ports.includes(exit)?domains:null;
    else nextDomains=constrain(domains,index,q=>[entry,exit].every(side=>ports.some(port=>rotate(port,initial[index]+q)===side)));
    if(nextDomains)advance(index,exit,used,passes,path,[...segments,{index,entry,exit}],nextDomains);
   }
  }
  function advance(index,exit,used,passes,path,segments,domains){
   if(index===goal.index&&exit===goal.side){finish(path,segments,domains,positions);return;}
   const next=index+delta[exit];
   if(next<0||next>=size**2||axis(exit)===1&&Math.floor(index/size)!==Math.floor(next/size))return;
   if(crossovers.has(next)?(passes.get(next)??0)&(1<<axis(exit)):used&bit(next))return;
   walk(next,opposite[exit],used|bit(next),passes,[...path,next],segments,domains);
  }
  walk(source.index,source.side,bit(source.index),new Map(),[source.index],[],new Map());
 }
 for(let mask=0;mask<2**slides.length;mask++)search(slides.map((_,i)=>(mask>>i)&1));
 const unique=new Map();for(const item of results){const key=item.path.join(',');if(!unique.has(key)||unique.get(key).actions.length>item.actions.length)unique.set(key,item);}return {corridors:[...unique.values()],nodes};
}


const sortedPaths=paths=>paths.map(path=>path.join(',')).sort();
const lateLevels=[23,24,25,26].map(number=>glassLevels.find(level=>level.displayNumber===number));
function trace(level,rotations){return traceGlassCircuit(orientGlassCells(level.solution,rotations,level),level);}
function turn(level,rotations,control,count=1){
 const action=applyGlassTurn(level,rotations,control,count);
 assert.ok(action,`level ${level.displayNumber}: legal control ${control}`);
 return action.rotations;
}
function hintCompletion(level,start){
 let rotations=[...start],retained=null,clicks=0;
 for(let n=0;n<=level.size**2;n++){
  const hint=planGlassHint(level,rotations,retained);
  if(hint.kind==='power'){
   assert.equal(getGlassEarnedStars(trace(level,rotations),level),3);return {rotations,clicks};
  }
  assert.equal(hint.kind,'rotate',`level ${level.displayNumber}: full-star hint is available`);
  const immediate=turn(level,rotations,hint.control,hint.turns);
  assert.deepEqual(immediate,hint.rotations);
  for(let step=0;step<hint.turns;step++){rotations=turn(level,rotations,hint.control);clicks++;}
  assert.deepEqual(rotations,hint.rotations);retained=hint.planId;
 }
 assert.fail('hints must finish without cycling between plans');
}

test('the late chapter preserves existing identities and adds a separate final board',()=>{
 assert.ok(lateLevels.every(Boolean));
 assert.deepEqual(lateLevels.map(level=>level.id),[10,11,12,45]);
 assert.deepEqual(lateLevels.map(level=>level.nextLevelId),[11,12,45,null]);
 assert.equal(glassLevels.find(level=>level.displayNumber===22).timeLimitSeconds,160);
 assert.deepEqual(lateLevels.map(level=>level.timeLimitSeconds),[165,195,205,215]);
 for(const level of lateLevels){
  assert.equal(level.size,6);assert.equal(level.initialRotations.length,36);
  assert.equal(level.solution.length,36);assert.equal(level.stars.length,2);
  assert.equal(level.requireClosedCircuit,true);assert.equal(level.hintsEnabled,true);
  assert.ok(level.switches.length>=1);
  const owned=new Set();
  for(const pair of level.switches){
   for(const index of [pair.index,pair.linked]){
    assert.ok(!owned.has(index),'lever pairs must not overlap');owned.add(index);
    assert.ok(!level.fixed.includes(index));
    assert.ok(!level.sliders.some(slide=>slide.index===index||slide.slot===index));
   }
   assert.equal(applyGlassTurn(level,level.initialRotations,pair.linked),null);
   for(const q of [1,2,3]){
    const rotated=turn(level,level.initialRotations,pair.index,q);
    assert.equal(rotated[pair.index],level.initialRotations[pair.index]+q);
    assert.equal(rotated[pair.linked],level.initialRotations[pair.linked]+q);
   }
  }
  for(const index of level.hatches.flatMap(pair=>[pair.a,pair.b])){
   assert.ok(level.fixed.includes(index));assert.equal(level.initialRotations[index],0);
   assert.ok(['W','E'].includes(level.solution[index][1]));
   assert.equal(applyGlassTurn(level,level.initialRotations,index),null);
  }
 }
});

for(const number of [23,24,25,26]){
 test(`visible ${number}: independent forward/backward geometry certifies every physical reward route`,()=>{
  const level=glassLevels.find(level=>level.displayNumber===number);assert.ok(level);
  const forward=enumerateLateCorridors(level).corridors;
  const backward=enumerateLateCorridors(level,{reverse:true}).corridors;
  assert.ok(forward.length>0);
  assert.deepEqual(sortedPaths(backward.map(item=>[...item.path].reverse())),sortedPaths(forward.map(item=>item.path)));
  assert.deepEqual(sortedPaths(forward.map(item=>item.path)),sortedPaths(level.variants.map(item=>item.path)));
  assert.deepEqual(sortedPaths(level.paths),sortedPaths(level.variants.map(item=>item.path)));
  const full=forward.filter(item=>item.stars===3);assert.ok(full.length>0);
  assert.ok(full.every(item=>item.path.length>=33),'late full routes must engage nearly the whole field');
  assert.ok(forward.every(item=>item.path.length>=20),'no accidental short winning corridor');
  for(const item of forward){
   const powered=trace(level,item.rotations);
   assert.equal(powered.complete,true);assert.deepEqual(powered.openEnds,[]);
   assert.equal(getGlassEarnedStars(powered,level),item.stars);
   assert.deepEqual(powered.flowPaths[0].map(([index])=>index),item.path);
  }
  assert.equal(trace(level,level.initialRotations).complete,false);
  for(const variant of level.variants){
   const physical=forward.find(item=>item.path.join()===variant.path.join());
   assert.equal(variant.stars,physical.stars);
   assert.equal(variant.actions.length,physical.actions.length,'authored effort excludes redundant full turns');
   for(const actions of [variant.actions,[...variant.actions].reverse()]){
    let rotations=[...level.initialRotations];
    for(const control of actions)rotations=turn(level,rotations,control);
    assert.deepEqual(rotations,variant.rotations);
    const powered=trace(level,rotations);assert.equal(powered.complete,true);
    assert.equal(getGlassEarnedStars(powered,level),variant.stars);
   }
  }
 });
 test(`visible ${number}: full-star hints work from the initial board, alternatives and real outage`,()=>{
  const level=glassLevels.find(level=>level.displayNumber===number);assert.ok(level);
  hintCompletion(level,level.initialRotations);
  // Every lever phase and both carriage positions remain recoverable by hints;
  // the player need not reset after experimenting with the new controls.
  const special=[...level.switches.map(pair=>({index:pair.index,positions:4})),...level.sliders.map(slide=>({index:slide.index,positions:2}))];
  function exerciseSpecials(index,rotations){
   if(index===special.length){hintCompletion(level,rotations);return;}
   const item=special[index];
   for(let q=0;q<item.positions;q++)exerciseSpecials(index+1,q?turn(level,rotations,item.index,q):rotations);
  }
  exerciseSpecials(0,level.initialRotations);
  for(const variant of level.variants){
   hintCompletion(level,variant.rotations);
   if(!level.outage)continue;
   assert.ok(Number.isInteger(level.outage.breakCell),'the runtime needs a visible break location to trigger the outage');
   assert.ok(variant.path.includes(level.outage.breakCell),'every winning route reaches the actual break');
   assert.ok(!level.fixed.includes(level.outage.breakCell));
   assert.ok(level.outage.turns.some(([control])=>control===level.outage.breakCell||level.switches.some(pair=>pair.index===control&&pair.linked===level.outage.breakCell)||level.sliders.some(slide=>slide.index===control&&slide.slot===level.outage.breakCell)),'the marked break must correspond to a pipe changed by the outage');
   assert.ok(!level.outage.solution,'late outages retain the same board and control identities');
   let broken=[...variant.rotations];
   for(const [index,count]of level.outage.turns)broken=turn(level,broken,index,count);
   assert.equal(trace(level,broken).complete,false,'the outage must break every winning alternative');
   hintCompletion(level,broken);
   for(const [index,count]of [...level.outage.turns].reverse())broken=turn(level,broken,index,4-count);
   assert.equal(trace(level,broken).complete,true);assert.equal(getGlassEarnedStars(trace(level,broken),level),variant.stars);
  }
  if(level.outage){
   const fullCharge=level.timeLimitSeconds*1000;
   assert.equal(glassOutageRemainingMs(fullCharge,fullCharge),fullCharge*.3);
   assert.equal(glassOutageRemainingMs(7000,fullCharge),7000);
  }
 });
}

test('late boards increase interacting mechanics and make each lever a distant constraint',()=>{
 const effort=[];
 let previousMechanics=-1;
 for(const level of lateLevels){
  assert.ok(level);
  const mechanics=level.switches.length+level.sequentialCrossovers.length+level.hatches.length+level.sliders.length+Number(Boolean(level.outage));
  assert.ok(mechanics>=previousMechanics,`visible ${level.displayNumber}: retain the number of interacting mechanics`);
  previousMechanics=mechanics;
  const physical=enumerateLateCorridors(level).corridors;
  const uncoupled=enumerateLateCorridors({...level,switches:[]}).corridors;
  const legalPaths=new Set(physical.map(item=>item.path.join(',')));
  const blocked=uncoupled.filter(item=>!legalPaths.has(item.path.join(',')));
  assert.ok(blocked.length>0,`visible ${level.displayNumber}: levers exclude an otherwise tempting corridor`);
  assert.ok(blocked.some(item=>item.path.length>=12),'a linked trap must remain plausible beyond the opening');
  for(const pair of level.switches){
   const distance=Math.abs(pair.index%6-pair.linked%6)+Math.abs(Math.floor(pair.index/6)-Math.floor(pair.linked/6));
   assert.ok(distance>=3,'the lever affects a meaningfully distant pipe');
   const released=enumerateLateCorridors({...level,switches:level.switches.filter(item=>item!==pair)}).corridors;
   assert.ok(released.some(item=>!legalPaths.has(item.path.join(','))),'each individual lever changes the set of solvable corridors');
  }
  const full=physical.filter(item=>item.stars===3),minimum=Math.min(...full.map(item=>item.actions.length));
  for(const item of full){
   for(const relay of level.sequentialCrossovers)assert.equal(item.path.filter(index=>index===relay.index).length,2,'the full circuit uses both relay channels');
   for(const pair of level.hatches)assert.ok(item.path.includes(pair.a)&&item.path.includes(pair.b),'the full circuit traverses every underground pair');
   for(const pair of level.switches)assert.ok(item.actions.includes(pair.index),'every lever requires a real initial action on the full route');
   for(const slide of level.sliders)assert.ok(item.actions.includes(slide.index),'the full route requires moving the carriage');
   const costs=new Set();
   for(const index of new Set(item.path)){
    const ports=level.solution[index].slice(1);
    if(ports.length!==2||opposite[ports[0]]===ports[1]||level.switches.some(pair=>pair.index===index||pair.linked===index))continue;
    const clicks=item.actions.filter(control=>control===index).length;if(clicks)costs.add(clicks);
   }
   assert.ok(costs.size>=2,'ordinary elbows require a varied number of turns instead of repetitive triple clicks');
  }
  const repair=level.outage?Math.min(...full.map(item=>{
   let broken=[...item.rotations];for(const [index,count]of level.outage.turns)broken=turn(level,broken,index,count);
   return Math.min(...enumerateLateCorridors({...level,initialRotations:broken}).corridors.filter(item=>item.stars===3).map(item=>item.actions.length));
  })):0;
  effort.push({level:level.displayNumber,minimum,repair});
 }
 const previous=glassLevels.find(level=>level.displayNumber===22);
 assert.ok(effort[0].minimum>Math.min(...enumerateLateCorridors(previous).corridors.filter(item=>item.stars===3).map(item=>item.actions.length)));
 // The requested outage on 24 adds a short repair before 25 introduces two levers.
 for(let index=1;index<effort.length-1;index++)assert.ok(effort[index].minimum>=effort[index-1].minimum,'initial assembly still grows before the finale');
 assert.ok(effort[1].repair>0&&effort[1].repair<=3,'24 has a brief, recoverable repair');
 const finale=effort.at(-1);for(const earlier of effort.slice(0,-1))assert.ok(finale.minimum+finale.repair>earlier.minimum+earlier.repair,'the finale still requires the most total work');
});
