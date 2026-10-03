import test from 'node:test';
import assert from 'node:assert/strict';
import {glassLevels,orientGlassCells,traceGlassCircuit,applyGlassTurn,getGlassEarnedStars,planGlassHint,glassOutageRemainingMs} from './glass-energy.js';

const level=glassLevels.find(item=>item.displayNumber===21),previous=glassLevels.find(item=>item.displayNumber===20);
const directions=['N','E','S','W'],opposite={N:'S',E:'W',S:'N',W:'E'},axis=side=>side==='N'||side==='S'?0:1;

// This search uses pipe shapes and the two physical axes at each relay, not
// authored rotations, variants or the runtime circuit tracer. Each hatch mouth
// retains its fixed external port when a corridor is explored from either end.
function corridors(from,to){
 const paths=[],size=level.size,delta={N:-size,E:1,S:size,W:-1},bit=index=>1n<<BigInt(index);
 const peers=new Map(level.hatches.flatMap(pair=>[[pair.a,pair.b],[pair.b,pair.a]]));
 function walk(index,entry,used,passes,path){
  const ports=level.solution[index].slice(1),relay=level.crossovers.indexOf(index);let exits;
  if(relay>=0){
   const channel=1<<axis(entry);if(passes[relay]&channel)return;
   passes=[...passes];passes[relay]|=channel;exits=[opposite[entry]];
  }else if(peers.has(index)){
   const peer=peers.get(index);if(!ports.includes(entry)||used&bit(peer))return;
   used|=bit(peer);index=peer;path=[...path,peer];exits=level.solution[peer].slice(1);
  }else if(level.fixed.includes(index))exits=ports.includes(entry)?ports.filter(side=>side!==entry):[];
  else{
   const straight=opposite[ports[0]]===ports[1];
   exits=ports.length===2?directions.filter(side=>side!==entry&&(straight?side===opposite[entry]:side!==opposite[entry])):[];
  }
  for(const exit of exits){
   if(index===to.index&&exit===to.side){paths.push(path);continue;}
   const next=index+delta[exit];
   if(next<0||next>=size**2||axis(exit)===1&&Math.floor(index/size)!==Math.floor(next/size))continue;
   const nextRelay=level.crossovers.indexOf(next);
   if(nextRelay>=0?passes[nextRelay]&(1<<axis(exit)):used&bit(next))continue;
   walk(next,opposite[exit],used|bit(next),passes,[...path,next]);
  }
 }
 walk(from.index,from.side,bit(from.index),level.crossovers.map(()=>0),[from.index]);
 return paths;
}

const sortedPaths=paths=>paths.map(path=>path.join(',')).sort();
const trace=rotations=>traceGlassCircuit(orientGlassCells(level.solution,rotations,level),level);
function minimumTurns(start,variant){
 const target=orientGlassCells(level.solution,variant.rotations,level);let total=0;
 for(const index of new Set(variant.path)){
  const steps=[0,1,2,3].find(count=>{
   if(level.fixed.includes(index)&&count)return false;
   const angle=start[index]+count;
   const ports=level.solution[index].slice(1).map(side=>directions[(directions.indexOf(side)+angle)%4]);
   return target[index].slice(1).every(side=>ports.includes(side))&&(!level.crossovers.includes(index)||angle%2===variant.rotations[index]%2);
  });
  assert.notEqual(steps,undefined);total+=steps;
 }
 return total;
}
function turn(rotations,index,count=1){
 const action=applyGlassTurn(level,rotations,index,count);assert.ok(action,`legal turn at ${index}`);return action.rotations;
}
function finishWithHints(start){
 let rotations=[...start],retained=null,clicks=0;
 for(let count=0;count<=level.size**2;count++){
  const hint=planGlassHint(level,rotations,retained);
  if(hint.kind==='power'){
   assert.equal(getGlassEarnedStars(trace(rotations),level),3);return clicks;
  }
  assert.equal(hint.kind,'rotate');assert.ok(!level.fixed.includes(hint.control));
  assert.deepEqual(turn(rotations,hint.control,hint.turns),hint.rotations);
  for(let step=0;step<hint.turns;step++){rotations=turn(rotations,hint.control);clicks++;}
  assert.deepEqual(rotations,hint.rotations);retained=hint.planId;
 }
 assert.fail('full-star hint plan must finish within one action per pipe');
}

test('visible 21 has horizontal fixed mouths and a uniquely tangled full route from both ends',()=>{
 assert.equal(level.id,8);assert.equal(level.timeLimitSeconds,200);assert.equal(level.size,6);
 assert.equal(level.stars.length,2);assert.equal(level.hintsEnabled,true);
 assert.equal(level.hatches.length,2);assert.equal(level.sequentialCrossovers.length,3);
 assert.deepEqual(new Set(level.hatches.map(pair=>pair.symbol)),new Set(['diamond','triangle']));
 for(const index of level.hatches.flatMap(pair=>[pair.a,pair.b])){
  assert.equal(level.solution[index].length,2);assert.ok(['W','E'].includes(level.solution[index][1]));
  assert.ok(level.fixed.includes(index));assert.equal(level.initialRotations[index],0);
  assert.equal(applyGlassTurn(level,level.initialRotations,index),null);
  assert.ok(level.variants.every(variant=>!variant.actions.includes(index)));
 }
 const forward=corridors(level.source,level.goal),backward=corridors(level.goal,level.source);
 assert.deepEqual(sortedPaths(forward),sortedPaths(level.paths));
 assert.deepEqual(sortedPaths(backward),sortedPaths(forward.map(path=>[...path].reverse())));
 assert.deepEqual(forward.map(path=>path.length).sort((a,b)=>a-b),[24,30,33,39]);
 assert.deepEqual(level.variants.map(variant=>variant.stars),[1,2,2,3]);
 assert.deepEqual(level.fixed.filter(index=>!level.hatches.some(pair=>pair.a===index||pair.b===index)),[1,26]);
 const fullPaths=forward.filter(path=>level.stars.every(index=>path.includes(index)));
 assert.equal(fullPaths.length,1);
 const full=level.variants.find(variant=>variant.stars===3),previousFull=previous.variants.find(variant=>variant.stars===3);
 assert.deepEqual(full.path,fullPaths[0]);assert.ok(full.path.length>previousFull.path.length);
 assert.equal(full.path.length,39);assert.equal(new Set(full.path).size,36);assert.equal(full.actions.length,64);
 assert.ok(forward.some(path=>!level.stars.every(index=>path.includes(index))), 'a plausible shorter route still gives fewer stars');
 for(const variant of level.variants)assert.equal(variant.stars,1+level.stars.filter(index=>variant.path.includes(index)).length);
 assert.ok(level.hatches.every(pair=>full.path.includes(pair.a)&&full.path.includes(pair.b)));
 for(const index of level.crossovers)assert.equal(full.path.filter(cell=>cell===index).length,2);
 // Count minimal clockwise movements independently so redundant revolutions
 // cannot make the difficulty comparison pass.
 const necessaryTurns=minimumTurns(level.initialRotations,full);
 assert.equal(necessaryTurns,full.actions.length);
 let broken=[...full.rotations];
 for(const [index,count] of level.outage.turns)broken=turn(broken,index,count);
 // Straights and relay sensors can recover after fewer turns than a complete
 // inverse rotation, so use the smaller physical repair cost for comparison.
 assert.equal(minimumTurns(broken,full),9);
 assert.ok(necessaryTurns+minimumTurns(broken,full)>previousFull.actions.length);
});

test('visible 21 legally completes every reward route when assembled from either end',()=>{
 for(const variant of level.variants){
  for(const actions of [variant.actions,[...variant.actions].reverse()]){
   let rotations=[...level.initialRotations];
   for(const index of actions)rotations=turn(rotations,index);
   assert.deepEqual(rotations,variant.rotations);
   const powered=trace(rotations);
   assert.equal(powered.complete,true);assert.deepEqual(powered.openEnds,[]);
   assert.deepEqual(powered.flowPaths[0].map(([index])=>index),variant.path);
   assert.equal(getGlassEarnedStars(powered,level),variant.stars);
  }
  finishWithHints(variant.rotations);
 }
 finishWithHints(level.initialRotations);
});

test('visible 21 retains six real outage changes, thirteen repair turns and working repair hints',()=>{
 assert.equal(level.outage.turns.length,6);
 assert.equal(glassOutageRemainingMs(200000,level.timeLimitSeconds*1000,level.outage.bonusSeconds),60000);
 assert.equal(glassOutageRemainingMs(17000,level.timeLimitSeconds*1000,level.outage.bonusSeconds),17000);
 for(const variant of level.variants){
  let rotations=[...variant.rotations];
  for(const [index,count] of level.outage.turns){
   const before=orientGlassCells(level.solution,rotations,level)[index];
   rotations=turn(rotations,index,count);
   const after=orientGlassCells(level.solution,rotations,level)[index];
   assert.ok(level.crossovers.includes(index)&&count%2||before.slice(1).some(side=>!after.includes(side)),`outage changes pipe ${index}`);
  }
  assert.equal(trace(rotations).complete,false);
  const hintClicks=finishWithHints(rotations);if(variant.stars===3)assert.equal(hintClicks,9);
  const broken=[...rotations];
  for(const changes of [level.outage.turns,[...level.outage.turns].reverse()]){
   rotations=[...broken];let clicks=0;
   for(const [index,count] of changes)for(let step=0;step<4-count;step++){rotations=turn(rotations,index);clicks++;}
   assert.equal(clicks,13);assert.equal(trace(rotations).complete,true);
   assert.equal(getGlassEarnedStars(trace(rotations),level),variant.stars);
  }
 }
});
