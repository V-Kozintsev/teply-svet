import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {glassLevels,orientGlassCells,applyGlassTurn,traceGlassCircuit,getGlassEarnedStars,planGlassHint,glassLevelSignature} from './glass-energy.js';

// Independent physical enumeration: all pipe angles, both sensing axes, remote
// hatch connections and each occupancy of a two-slot sliding carriage.
function geometricPaths(level,position=0){
 const n=level.size,D=['N','E','S','W'],op={N:'S',E:'W',S:'N',W:'E'},delta={N:-n,E:1,S:n,W:-1},axis=s=>s==='N'||s==='S'?0:1,bit=i=>1n<<BigInt(i);
 const cells=level.solution.map(c=>[...c]),cross=level.crossovers??[],fixed=[...level.fixed??[]],hatches=new Map((level.hatches??[]).flatMap(p=>[[p.a,p.b],[p.b,p.a]])),paths=[];
 for(const slide of level.sliders??[]){const ports=cells[slide.index].slice(1);cells[slide.index]=[slide.index,...(position?[]:ports)];cells[slide.slot]=[slide.slot,...(position?ports:[])];fixed.push(slide.index,slide.slot);}
 function walk(i,entry,used,passes,path){
  const ports=cells[i].slice(1),ci=cross.indexOf(i);if(!ports.length)return;let exits;
  if(ci>=0){const flag=1<<axis(entry);if(passes[ci]&flag)return;passes=[...passes];passes[ci]|=flag;exits=[op[entry]];}
  else if(hatches.has(i)){const peer=hatches.get(i);if(!ports.includes(entry)||used&bit(peer))return;used|=bit(peer);i=peer;path=[...path,peer];exits=cells[peer].slice(1);}
  else if(fixed.includes(i))exits=ports.includes(entry)?ports.filter(s=>s!==entry):[];
  else{const straight=op[ports[0]]===ports[1];exits=ports.length===2?D.filter(s=>s!==entry&&(straight?s===op[entry]:s!==op[entry])):[];}
  for(const exit of exits){if(i===level.goal.index&&exit===level.goal.side){paths.push(path);continue;}
   const j=i+delta[exit];if(j<0||j>=n*n||axis(exit)===1&&Math.floor(i/n)!==Math.floor(j/n))continue;
   if(cross.includes(j)?passes[cross.indexOf(j)]&(1<<axis(exit)):used&bit(j))continue;
   walk(j,op[exit],used|bit(j),passes,[...path,j]);
  }
 }
 walk(level.source.index,level.source.side,bit(level.source.index),cross.map(()=>0),[level.source.index]);return paths;
}

for(const number of [19,20,21,22])test(`visible ${number} certifies underground routes, rewards and legal hints`,()=>{
 const l=glassLevels.find(l=>l.displayNumber===number),full=l.variants.find(v=>v.stars===3);
 assert.equal(l.size,6);assert.equal(l.stars.length,2);assert.equal(l.hatches.length,number===21?2:1);assert.equal(l.hintsEnabled,true);
 for(const index of l.hatches.flatMap(pair=>[pair.a,pair.b])){
  assert.ok(l.fixed.includes(index));
  assert.equal(l.initialRotations[index],0);
  assert.equal(applyGlassTurn(l,l.initialRotations,index),null);
  assert.ok(l.variants.every(variant=>!variant.actions.includes(index)));
 }
 const paths=l.sliders.length?[...geometricPaths({...l,fixed:[...l.fixed]},0),...geometricPaths({...l,fixed:[...l.fixed]},1)]:geometricPaths(l);
 assert.deepEqual(paths.map(p=>p.join()).sort(),l.paths.map(p=>p.join()).sort());
 assert.equal(paths.filter(p=>l.stars.every(i=>p.includes(i))).length,1);
 assert.ok(l.hatches.every(p=>full.path.includes(p.a)&&full.path.includes(p.b)));
 if(number===19){
  assert.equal(l.timeLimitSeconds,130);
  assert.deepEqual(l.hatches,[{a:1,b:25,symbol:'diamond'}]);
  assert.equal(l.hatchArtStyle,'mockup');
  assert.deepEqual([l.solution[1][1],l.solution[25][1]],['W','E']);
  assert.ok([26,32].every(index=>l.fixed.includes(index)));
  assert.equal(full.path.length,35);assert.equal(full.actions.length,54);
  assert.equal(l.variants.filter(v=>v.stars===3).length,1);
 }
 for(const i of l.crossovers)assert.equal(full.path.filter(c=>c===i).length,2);
 if(number===20){
  assert.deepEqual(l.hatches,[{a:4,b:31,symbol:'diamond'}]);
  assert.equal(l.hatchArtStyle,'mockup');
  assert.equal(l.timeLimitSeconds,160);
  assert.deepEqual([l.solution[4][1],l.solution[31][1]],['E','W']);
  assert.equal(l.paths.length,1);assert.equal(full.path.length,35);assert.equal(full.actions.length,66);
  assert.ok(full.actions.length>glassLevels.find(other=>other.displayNumber===19).variants.at(-1).actions.length);
 }
 if(number===21)assert.ok(full.path.length>=36&&l.sequentialCrossovers.length>=3);
 for(const v of l.variants){
  let rotations=[...l.initialRotations];for(const control of v.actions){const action=applyGlassTurn(l,rotations,control);assert.ok(action);rotations=action.rotations;}
  assert.deepEqual(rotations,v.rotations);const trace=traceGlassCircuit(orientGlassCells(l.solution,rotations,l),l);
  assert.equal(trace.complete,true);assert.equal(getGlassEarnedStars(trace,l),v.stars);assert.deepEqual(trace.openEnds,[]);assert.deepEqual(trace.flowPaths[0].map(([i])=>i),v.path);
  assert.equal(traceGlassCircuit(orientGlassCells(l.solution,rotations),l).complete,true);
 }
 for(const start of [l.initialRotations,...l.variants.map(v=>v.rotations)]){
  let rotations=[...start],retained=null;
  for(let k=0;k<40;k++){const plan=planGlassHint(l,rotations,retained);if(plan.kind==='power')break;assert.equal(plan.kind,'rotate');assert.deepEqual(applyGlassTurn(l,rotations,plan.control,plan.turns).rotations,plan.rotations);rotations=plan.rotations;retained=plan.planId;assert.ok(k<39);}
  assert.equal(getGlassEarnedStars(traceGlassCircuit(orientGlassCells(l.solution,rotations,l),l),l),3);
 }
});

test('the sliding pipe moves between empty rail slots without rotating, and reverses from either button',()=>{
 const l=glassLevels.find(l=>l.displayNumber===22),slide=l.sliders[0],r=[...l.variants.at(-1).rotations];
 assert.equal(r[slide.index]%2,1);const moved=orientGlassCells(l.solution,r,l);
 assert.deepEqual(moved[slide.index],[slide.index]);assert.deepEqual(moved[slide.slot],[slide.slot,...l.solution[slide.index].slice(1)]);
 const back=applyGlassTurn(l,r,slide.slot);assert.equal(back.motion,'slide');assert.deepEqual(back.cells,[slide.index,slide.slot]);
 assert.deepEqual(orientGlassCells(l.solution,back.rotations,l)[slide.index],l.solution[slide.index]);
 assert.equal(traceGlassCircuit(orientGlassCells(l.solution,back.rotations,l),l).complete,false);
 assert.equal(applyGlassTurn(l,r,slide.index,2),null);
 const many=[...r];many[slide.index]=9;assert.deepEqual(orientGlassCells(l.solution,many,l)[slide.slot],moved[slide.slot]);
 assert.ok(glassLevelSignature(l).endsWith(`sliders:${JSON.stringify(l.sliders)}`));
 assert.equal(glassLevelSignature(glassLevels.find(l=>l.displayNumber===18)).includes('sliders:'),false);
});

test('visible 21 outage has six physical changes and thirteen legal repair turns',()=>{
 const l=glassLevels.find(l=>l.displayNumber===21);assert.equal(l.outage.turns.length,6);
 for(const [i,q]of l.outage.turns){const full=l.variants.at(-1).rotations,before=orientGlassCells(l.solution,full,l)[i],after=orientGlassCells(l.solution,applyGlassTurn(l,full,i,q).rotations,l)[i];assert.ok(l.crossovers.includes(i)&&q%2||before.slice(1).some(p=>!after.includes(p)));}
 for(const v of l.variants){let r=[...v.rotations];for(const [i,q]of l.outage.turns)r=applyGlassTurn(l,r,i,q).rotations;assert.equal(traceGlassCircuit(orientGlassCells(l.solution,r,l),l).complete,false);
  let clicks=0;for(const [i,q]of l.outage.turns){clicks+=4-q;r=applyGlassTurn(l,r,i,4-q).rotations;}assert.equal(clicks,13);assert.equal(getGlassEarnedStars(traceGlassCircuit(orientGlassCells(l.solution,r,l),l),l),v.stars);
 }
});

test('introductions spotlight the new controls and use short button-only lessons',()=>{
 const intro=glassLevels.find(l=>l.displayNumber===19),slider=glassLevels.find(l=>l.displayNumber===22);
 assert.equal(intro.intro,'tunnel');assert.deepEqual(intro.lessonCells,[intro.hatches[0].a,intro.hatches[0].b]);assert.equal(slider.intro,'slider');assert.deepEqual(slider.lessonCells,[slider.sliders[0].index,slider.sliders[0].slot]);
 assert.equal(glassLevels.find(l=>l.displayNumber===20).intro,null);assert.equal(glassLevels.find(l=>l.displayNumber===21).intro,null);
 const html=readFileSync(new URL('./glass-level.template.html',import.meta.url),'utf8');assert.ok(html.includes("[data-kind='slider']"));assert.ok(html.includes('Труба уходит в люк. Ток выходит из парного.'));assert.ok(html.includes("level.hatchArtStyle==='mockup'?'v2':'v1'"));assert.ok(html.includes('Нажми на трубу — она сдвинется по рельсам.'));assert.ok(html.includes('button.disabled=true;button.tabIndex=-1'));assert.ok(!html.includes('Повернуть подземный люк'));assert.ok(html.includes('d+=order&&entry?'));
});
