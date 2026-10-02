import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {glassLevels,rotateGlassCell,glassPortsMatch,orientGlassCells,traceGlassCircuit,getGlassEarnedStars,applyGlassTurn,planGlassHint} from './glass-energy.js';
const proofs=JSON.parse(readFileSync(new URL('./glass-unused-pair.design.json',import.meta.url)));
const D=['N','E','S','W'],op=s=>D[(D.indexOf(s)+2)%4];
for(const id of [11,12])test(`visible ${id+13}: complete route enumeration and synchronized unused pipe`,()=>{
 const l=glassLevels.find(l=>l.id===id),proof=proofs.find(p=>p.id===id),[pair]=l.switches,geometric=[],legal=[];
 assert.equal(l.displayNumber,id+13);assert.equal(l.size,5);assert.equal(l.switches.length,1);assert.equal(l.stars.length,2);assert.equal(l.intro,undefined);assert.equal(l.requireClosedCircuit,true);assert.ok(l.solution.every(c=>c.length===3));assert.deepEqual(l.source,{index:10,side:'W'});assert.deepEqual(l.goal,{index:14,side:'E'});assert.equal(l.nextLevelId,id===11?12:null);
 function walk(path,mask,incoming,phases){const i=path.at(-1),exits=i===14?[[14,'E']]:[[i-5,'N'],[i+1,'E'],[i+5,'S'],[i-1,'W']].filter(([j,s])=>j>=0&&j<25&&(s==='N'||s==='S'||Math.floor(i/5)===Math.floor(j/5))&&!(mask&(1<<j)));for(const[j,out]of exits){if(out===incoming)continue;const qs=[0,1,2,3].filter(q=>glassPortsMatch(rotateGlassCell(l.solution[i],q),[i,incoming,out]));if(!qs.length)continue;const next={...phases,[i]:qs};if(i===14){geometric.push(path);if(!next[pair.index]||!next[pair.linked]||next[pair.index].some(q=>next[pair.linked].includes(q)))legal.push(path);}else walk([...path,j],mask|1<<j,op(out),next);}}
 walk([10],1<<10,'W',{});
 assert.equal(geometric.length,proof.geometricCount);assert.deepEqual(legal.map(p=>p.join()).sort(),l.variants.map(v=>v.path.join()).sort());assert.deepEqual(legal.map(p=>p.join()).sort(),proof.legalPaths.map(p=>p.join()).sort());
 assert.deepEqual([...new Set(l.variants.map(v=>v.stars))],[1,2,3]);
 for(const path of legal.filter(p=>l.stars.every(i=>p.includes(i)))){assert.ok(path.includes(pair.index));assert.ok(!path.includes(pair.linked));}
 // Both choices at the house extend all the way to a valid powered source,
 // so looking only at the outlet and its neighboring tile cannot resolve it.
 assert.deepEqual([...new Set(legal.map(p=>p.at(-2)))].sort((a,b)=>a-b),[9,19]);
 for(const p of proof.backwardChoices){assert.equal(p[0],14);assert.ok(p.length>=9);assert.ok(legal.some(q=>q.join()===[...p].reverse().join()));}
 assert.ok(legal.some(p=>p.includes(pair.linked)),'dependent is a conductive part of a real alternative');
 assert.equal(applyGlassTurn(l,l.initialRotations,pair.linked),null);
 for(const q of [1,2,3]){const turned=applyGlassTurn(l,l.initialRotations,pair.index,q);assert.equal(turned.rotations[pair.index],l.initialRotations[pair.index]+q);assert.equal(turned.rotations[pair.linked],l.initialRotations[pair.linked]+q);}
 for(const v of l.variants){let r=[...l.initialRotations];for(const i of v.actions){assert.notEqual(i,pair.linked);r=applyGlassTurn(l,r,i).rotations;}assert.deepEqual(r,v.rotations);const tr=traceGlassCircuit(orientGlassCells(l.solution,r),l);assert.ok(tr.complete);assert.deepEqual([...tr.visited],v.path);assert.equal(getGlassEarnedStars(tr,l),v.stars);assert.equal(tr.openEnds.length,0);assert.equal(tr.segments.length,tr.visited.size-1);}
 for(const t of proof.traps){assert.ok(geometric.some(p=>p.join()===t.intendedPath.join()));assert.ok(l.stars.every(i=>t.intendedPath.includes(i)));assert.ok(t.intendedPath.includes(pair.index)&&t.intendedPath.includes(pair.linked));let r=[...l.initialRotations];for(const i of t.actions)r=applyGlassTurn(l,r,i).rotations;const tr=traceGlassCircuit(orientGlassCells(l.solution,r),l);assert.equal(tr.complete,false);assert.equal(tr.reachedGoals.length,0);assert.ok(tr.visited.size>=9);assert.notEqual(t.actual,t.needed);assert.deepEqual(tr.openEnds,t.openEnds);}
 for(const start of [l.initialRotations,...l.variants.filter(v=>v.stars<3).map(v=>v.rotations)]){let r=[...start],planId=null,n=0;for(;n<30;n++){const h=planGlassHint(l,r,planId);if(h.kind==='power')break;assert.equal(h.kind,'rotate');assert.notEqual(h.control,pair.linked);const before=orientGlassCells(l.solution,r);assert.ok(h.cells.some(i=>proof.fullPaths.some(p=>p.includes(i))&&!glassPortsMatch(before[i],rotateGlassCell(before[i],h.turns))));r=applyGlassTurn(l,r,h.control,h.turns).rotations;planId=h.planId;}assert.ok(n<30);assert.equal(getGlassEarnedStars(traceGlassCircuit(orientGlassCells(l.solution,r),l),l),3);assert.equal(planGlassHint(l,r).kind,'power');}
 if(id===12)for(const star of l.stars)assert.ok(l.variants.some(v=>v.stars===2&&v.path.includes(star)));
});
