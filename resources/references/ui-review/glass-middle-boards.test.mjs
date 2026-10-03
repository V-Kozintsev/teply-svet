import test from 'node:test';
import assert from 'node:assert/strict';
test('the last two middle boards keep long legal dead ends from either inlet',()=>{
 const fixtures=[{"number":14,"ends":[{"from":"source","path":[12,6,7,13,19,25,26,27,28,29,23,22,16,15,21,20,14,8,2,3,9,10,4],"exit":"N"},{"from":"house","path":[17,23,22,16,15,21,20,14,8,2,1,0,6,7,13,19,25,26,27,28,29,35,34,33,32,31,30,24,18,12],"exit":"E"}]},{"number":15,"ends":[{"from":"source","path":[12,6,7,13,14,8,9,15,21,20,19,25,26,27,33,34,28,22,16,10,11,5,4,3,2,1,0],"exit":"N"},{"from":"house","path":[17,11,10,16,22,28,34,33,27,26,25,19,20,21,15,9,8,14,13,7,6,0,1,2,3,4,5],"exit":"N"}]}];
 const direction=(a,b)=>b-a===-6?'N':b-a===6?'S':b-a===-1?'W':'E';
 for(const {number,ends}of fixtures){
  const level=levels.find(l=>l.displayNumber===number);
  for(const {from,path,exit}of ends){
   const source=from==='source'?level.source:level.goal,goal=from==='source'?level.goal:level.source;
   assert.ok(path.length>=20);
   assert.notEqual(path[1],(from==='source'?level.hintRoute:[...level.hintRoute].reverse())[1]);
   let rotations=[...level.initialRotations];
   for(const[k,index]of path.entries()){
    const needed=[k?direction(index,path[k-1]):source.side,k===path.length-1?exit:direction(index,path[k+1])].sort().join();
    const count=[0,1,2,3].find(q=>level.solution[index].slice(1).map(p=>rotated(p,rotations[index]+q)).sort().join()===needed);
    assert.notEqual(count,undefined);
    for(let q=0;q<count;q++)rotations=turn(level,rotations,index);
   }
   const result=traceGlassCircuit(orientGlassCells(level.solution,rotations,level),{...level,source,goal});
   assert.equal(result.complete,false);assert.deepEqual([...result.visited],path);
  }
 }
 const minimum=number=>Math.min(...levels.find(l=>l.displayNumber===number).variants.map(v=>v.actions.length));
 assert.ok(minimum(14)>minimum(13));assert.ok(minimum(15)>minimum(14));
});
import {glassLevels,orientGlassCells,traceGlassCircuit,applyGlassTurn,getGlassEarnedStars,getGlassMaximumStars,planGlassHint,glassOutageRemainingMs} from './glass-energy.js';

// Search physical pipe orientations rather than the authored route catalog.
// A crossover can be visited twice, but each channel only once. Its sensing
// order is checked in source order, including when geometry is searched back
// from the house. BigInt prevents the final four cells aliasing the first four.
const sides=['N','E','S','W'],opposite={N:'S',E:'W',S:'N',W:'E'};
const axis=side=>side==='N'||side==='S'?0:1;
const rotated=(port,q)=>sides[(sides.indexOf(port)+q+400)%4];
export function enumerateMiddleCorridors(level,reverse=false){
 const size=level.size,start=reverse?level.goal:level.source,end=reverse?level.source:level.goal;
 const delta={N:-size,E:1,S:size,W:-1},bit=index=>1n<<BigInt(index);
 const fixed=new Set(level.fixed??[]),crossovers=new Set(level.crossovers??[]);
 const relays=new Map((level.sequentialCrossovers??[]).map(relay=>[relay.index,relay]));
 const results=[];let nodes=0;
 function restrict(domains,index,predicate){
  const allowed=(domains.get(index)??(fixed.has(index)?[0]:[0,1,2,3])).filter(predicate);
  if(!allowed.length)return null;
  const next=new Map(domains);next.set(index,allowed);return next;
 }
 function finish(path,segments,domains){
  const seen=new Set();
  for(const segment of reverse?[...segments].reverse():segments){
   const relay=relays.get(segment.index);if(!relay)continue;
   const expected=seen.has(segment.index)?relay.then??['W','E']:relay.first??['N','S'];
   domains=restrict(domains,segment.index,q=>{
    const turns=level.initialRotations[segment.index]+q;
    return (!relay.verticalSensorOnly||turns%2===0)&&expected.some(port=>rotated(port,turns)===segment.entry);
   });
   if(!domains)return;seen.add(segment.index);
  }
  const rotations=[...level.initialRotations],actions=[];
  for(const [index,allowed]of domains){
   const count=Math.min(...allowed);rotations[index]+=count;
   for(let turn=0;turn<count;turn++)actions.push(index);
  }
  results.push({path,rotations,actions,stars:1+level.stars.filter(index=>path.includes(index)).length});
 }
 function advance(index,exit,used,passes,path,segments,domains){
  if(index===end.index&&exit===end.side){finish(path,segments,domains);return;}
  const next=index+delta[exit];
  if(next<0||next>=size*size||axis(exit)===1&&Math.floor(index/size)!==Math.floor(next/size))return;
  if(crossovers.has(next)?(passes.get(next)??0)&(1<<axis(exit)):used&bit(next))return;
  walk(next,opposite[exit],used|bit(next),passes,[...path,next],segments,domains);
 }
 function walk(index,entry,used,passes,path,segments,domains){
  assert.ok(++nodes<10000000,'the exhaustive search stays within a bounded board');
  const ports=level.solution[index].slice(1);if(!ports.length)return;
  if(crossovers.has(index)){
   const channel=1<<axis(entry);if((passes.get(index)??0)&channel)return;
   const next=new Map(passes);next.set(index,(passes.get(index)??0)|channel);
   advance(index,opposite[entry],used,next,path,[...segments,{index,entry}],domains);return;
  }
  assert.equal(ports.length,2,'middle boards contain ordinary pipes and relays');
  for(const exit of sides){
   if(exit===entry)continue;
   const next=restrict(domains,index,q=>[entry,exit].every(side=>ports.some(port=>rotated(port,level.initialRotations[index]+q)===side)));
   if(next)advance(index,exit,used,passes,path,[...segments,{index,entry}],next);
  }
 }
 walk(start.index,start.side,bit(start.index),new Map(),[start.index],[],new Map());
 return results;
}

const levels=[11,12,13,14,15].map(number=>glassLevels.find(level=>level.displayNumber===number));
const paths=routes=>routes.map(route=>(route.path??route).join(',')).sort();
const trace=(level,rotations)=>traceGlassCircuit(orientGlassCells(level.solution,rotations,level),level);
function turn(level,rotations,index,count=1){
 const result=applyGlassTurn(level,rotations,index,count);
 assert.ok(result,`visible ${level.displayNumber}: cell ${index} accepts a real turn`);return result.rotations;
}
function finishWithHints(level,start){
 let rotations=[...start],retained=null;
 for(let step=0;step<=level.size**2;step++){
  const hint=planGlassHint(level,rotations,retained);
  if(hint.kind==='power'){
   const powered=trace(level,rotations);assert.equal(powered.complete,true);
   assert.equal(getGlassEarnedStars(powered,level),getGlassMaximumStars(level));return;
  }
  assert.equal(hint.kind,'rotate','a full-star hint remains available');
  for(let count=0;count<hint.turns;count++)rotations=turn(level,rotations,hint.control);
  assert.deepEqual(rotations,hint.rotations);retained=hint.planId;
 }
 assert.fail('hints should finish without cycling between routes');
}

test('middle six-by-six boards retain stable identities, rewards and clocks',()=>{
 assert.ok(levels.every(Boolean));
 assert.deepEqual(levels.map(level=>level.id),[1,41,39,40,2]);
 assert.deepEqual(levels.map(level=>getGlassMaximumStars(level)),[1,2,2,3,3]);
 assert.deepEqual(levels.map(level=>level.timeLimitSeconds),[115,90,70,75,85]);
 assert.deepEqual(levels.map(level=>level.nextLevelId),[41,39,40,2,3]);
 for(const level of levels){
  assert.equal(level.size,6);assert.equal(level.solution.length,36);assert.equal(level.initialRotations.length,36);
  assert.equal(level.solution.filter(cell=>cell.length>1).length,36,'distractors fill the field');
  assert.equal(level.hintsEnabled,true);
  if(['stars','route'].includes(level.intro))assert.deepEqual(level.lessonCells??level.stars,level.stars,'the lesson highlights the new star cells');
  for(const index of level.fixed??[])assert.equal(applyGlassTurn(level,level.initialRotations,index),null);
 }
});

for(const number of [11,12,13,14,15]){
 test(`visible ${number}: independent geometry from either end certifies all reward routes and real turns`,()=>{
  const level=levels.find(item=>item.displayNumber===number);
  const forward=enumerateMiddleCorridors(level),backward=enumerateMiddleCorridors(level,true);
  assert.ok(forward.length>0);
  assert.deepEqual(paths(backward.map(item=>[...item.path].reverse())),paths(forward));
  assert.deepEqual(paths(forward),paths(level.variants));assert.deepEqual(paths(forward),paths(level.paths));
  const maximum=getGlassMaximumStars(level),full=forward.filter(item=>item.stars===maximum);
  assert.equal(full.length,1,'exactly one physical route reaches every star');
  assert.ok(full[0].path.length>=30,'the full reward engages most of the enlarged field');
  assert.equal(trace(level,level.initialRotations).complete,false);
  const initial=orientGlassCells(level.solution,level.initialRotations,level);
  for(const start of [level.source,level.goal]){
   let index=start.index,entry=start.side;const seen=new Set(),delta={N:-6,E:1,S:6,W:-1};
   while(!seen.has(index)){
    const ports=initial[index].slice(1);if(ports.length!==2||!ports.includes(entry))break;
    seen.add(index);const exit=ports.find(port=>port!==entry),next=index+delta[exit];
    if(next<0||next>=36||axis(exit)===1&&Math.floor(index/6)!==Math.floor(next/6))break;
    index=next;entry=opposite[exit];
   }
   assert.ok(seen.size>=(number<14?5:2),'either starting end connects before its false approach needs more turns');
  }
  for(const item of forward){
   const powered=trace(level,item.rotations);assert.equal(powered.complete,true);
   assert.deepEqual(powered.openEnds,[]);assert.equal(getGlassEarnedStars(powered,level),item.stars);
   assert.deepEqual(powered.flowPaths[0].map(([index])=>index),item.path);
   const variant=level.variants.find(candidate=>candidate.path.join()===item.path.join());
   assert.equal(variant.stars,item.stars);assert.equal(variant.actions.length,item.actions.length,'the authored route uses minimum clockwise turns');
   for(const actions of [variant.actions,[...variant.actions].reverse()]){
    let rotations=[...level.initialRotations];for(const index of actions)rotations=turn(level,rotations,index);
    assert.deepEqual(rotations,variant.rotations);assert.equal(trace(level,rotations).complete,true);
    assert.equal(getGlassEarnedStars(trace(level,rotations),level),variant.stars);
   }
  }
  for(const relay of level.sequentialCrossovers??[]){
   assert.equal(full[0].path.filter(index=>index===relay.index).length,2,'full route uses both channels in order');
   const wrong=[...full[0].rotations];wrong[relay.index]++;
   assert.equal(trace(level,wrong).complete,false,'the sensing channel cannot be replaced by the raised channel');
  }
 });
 test(`visible ${number}: hints reach every star from partial work, reward alternatives and outage`,()=>{
  const level=levels.find(item=>item.displayNumber===number);
  finishWithHints(level,level.initialRotations);
  let partial=[...level.initialRotations];
  for(const index of level.solution.map(cell=>cell[0]).filter(index=>!(level.fixed??[]).includes(index)))partial=turn(level,partial,index,(index%3)+1);
  finishWithHints(level,partial);
  for(const variant of level.variants){
   finishWithHints(level,variant.rotations);
   if(!level.outage)continue;
   assert.ok(variant.path.includes(level.outage.breakCell));assert.equal(level.outage.triggerAfterHalfTime,undefined);
   assert.ok(!level.outage.solution,'this repair retains the board and its controls');
   let broken=[...variant.rotations];
   for(const [index,count]of level.outage.turns)broken=turn(level,broken,index,count);
   assert.equal(trace(level,broken).complete,false,'every winning route is interrupted');
   finishWithHints(level,broken);
   for(const [index,count]of [...level.outage.turns].reverse())broken=turn(level,broken,index,4-count);
   assert.equal(trace(level,broken).complete,true);assert.equal(getGlassEarnedStars(trace(level,broken),level),variant.stars);
   for(const remaining of [0,1,7000,level.timeLimitSeconds*300,level.timeLimitSeconds*1000])assert.equal(glassOutageRemainingMs(remaining,level.timeLimitSeconds*1000),Math.min(remaining,level.timeLimitSeconds*300));
  }
 });
}

test('successive middle boards increase the minimum work for their complete reward',()=>{
 let previous=0,previousLength=0;
 for(const level of levels){
  const full=enumerateMiddleCorridors(level).filter(item=>item.stars===getGlassMaximumStars(level));
  const minimum=Math.min(...full.map(item=>item.actions.length));
  assert.ok(minimum>previous,`visible ${level.displayNumber}: ${minimum} turns exceeds the previous ${previous}`);
  assert.ok(full[0].path.length>=previousLength,'the full route never shrinks on the next board');
  previousLength=full[0].path.length;
  previous=minimum;
  const costs=new Set(full[0].actions.map(index=>full[0].actions.filter(control=>control===index).length));
  assert.ok(costs.size>=2,'the puzzle should not rely on uniformly repetitive rotations');
 }
 assert.ok(previous>=60,'the fifteenth board requires substantial planning across the larger field');
});
