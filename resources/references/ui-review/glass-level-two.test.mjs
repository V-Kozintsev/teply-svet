import test from 'node:test';
import assert from 'node:assert/strict';
import {glassLevels,orientGlassCells,traceGlassCircuit,applyGlassTurn,getGlassEarnedStars} from './glass-energy.js';

const level=glassLevels.find(l=>l.displayNumber===2);
const D=['N','E','S','W'],op={N:'S',E:'W',S:'N',W:'E'},delta={N:-5,E:1,S:5,W:-1};
// Enumerate all geometrically possible orientations, independently of saved
// variants, from each end. This catches the shortcut reported by the player.
function corridors(from,to){
 const paths=[];
 function walk(i,entry,seen,path){
  const ports=level.solution[i].slice(1);if(ports.length!==2)return;
  const straight=op[ports[0]]===ports[1];
  for(const exit of D.filter(s=>s!==entry&&(straight?s===op[entry]:s!==op[entry]))){
   if(i===to.index&&exit===to.side){paths.push(path);continue;}
   const j=i+delta[exit];if(j<0||j>=25||['E','W'].includes(exit)&&Math.floor(i/5)!==Math.floor(j/5)||seen.has(j))continue;
   walk(j,op[exit],new Set([...seen,j]),[...path,j]);
  }
 }
 walk(from.index,from.side,new Set([from.index]),[from.index]);return paths;
}

test('visible two has one eleven-cell circuit from either end, with a third more authored turns',()=>{
 assert.equal(level.id,32);assert.equal(level.size,5);assert.equal(level.timeLimitSeconds,35);
 assert.equal(level.solution.filter(c=>c.length===3).length,18);
 assert.deepEqual(corridors(level.source,level.goal),level.paths);
 assert.deepEqual(corridors(level.goal,level.source),level.paths.map(p=>[...p].reverse()));
 assert.equal(level.paths.length,1);assert.equal(level.paths[0].length,11);assert.equal(level.variants[0].actions.length,12);
 for(const actions of [level.variants[0].actions,[...level.variants[0].actions].reverse()]){
  let r=[...level.initialRotations];for(const i of actions)r=applyGlassTurn(level,r,i).rotations;
  const trace=traceGlassCircuit(orientGlassCells(level.solution,r),level);
  assert.equal(trace.complete,true);assert.equal(getGlassEarnedStars(trace,level),1);assert.deepEqual(trace.openEnds,[]);
  assert.deepEqual([...trace.visited],level.paths[0]);
 }
});

test('visible two initially tempts both inlets into connected dead ends',()=>{
 const cells=orientGlassCells(level.solution,level.initialRotations);
 const fromSource=traceGlassCircuit(cells,level);
 assert.equal(fromSource.complete,false);assert.deepEqual([...fromSource.visited],[10,15,20,21,16]);
 const fromHouse=traceGlassCircuit(cells,{...level,source:level.goal,goal:level.source});
 assert.equal(fromHouse.complete,false);assert.deepEqual([...fromHouse.visited],[14,9,8,3]);
 assert.deepEqual(level.stars,[]);assert.equal(level.hintsEnabled,false);
 assert.deepEqual(level.switches??[],[]);assert.deepEqual(level.crossovers??[],[]);assert.equal(level.intro,undefined);
});
