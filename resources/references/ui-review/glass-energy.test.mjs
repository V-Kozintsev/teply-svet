import test from 'node:test';
import './glass-unused-pair.test.mjs';
import './glass-difficulty.test.mjs';
import './glass-underground.test.mjs';
import './glass-action-sounds.test.mjs';
import './glass-fuse-burn.test.mjs';
import './glass-level-two.test.mjs';
import './glass-level-three.test.mjs';
import './glass-level-four.test.mjs';
import './glass-hatch-art.test.mjs';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {
  firstGlassLevel,
  planGlassHint,
  applyGlassTurn,
  secondGlassLevel,
  glassLevels,
  glassFlowPaths,
  glassFlowCellPath,
  getGlassEarnedStars,
  getGlassMaximumStars,
  glassPortsMatch,
  glassRelayState,
  glassOutageRemainingMs,
  glassWaveDistance,
  glassWaveTimeline,
  nextGlassHintCell,
  nextGlassLevelHint,
  orientGlassCells,
  reconcileGlassPulse,
  rotateGlassCell,
  traceGlassCircuit,
} from './glass-energy.js';

const solved = firstGlassLevel.solution;

test('the fifth board is the retained outage, with consecutive navigation and its first-time lesson', () => {
  const ordered=[...glassLevels].sort((a,b)=>a.displayNumber-b.displayNumber);
  assert.equal(ordered.some(level=>level.id===35),false);
  assert.deepEqual(ordered.map(level=>level.displayNumber),Array.from({length:25},(_,i)=>i+1));
  for(const [i,level] of ordered.entries())assert.equal(level.nextLevelId,ordered[i+1]?.id??null);
  const level=ordered[4];
  assert.equal(level.id,36);assert.equal(level.timeLimitSeconds,70);
  assert.ok(level.outage.solution);
  assert.equal(glassOutageRemainingMs(70_000,70_000),21_000);
  assert.equal(glassOutageRemainingMs(10_000,70_000),10_000);
  const html=readFileSync(new URL('./glass-level.template.html',import.meta.url),'utf8');
  assert.ok(html.includes('outageNeedsExplanation=level.id===36'));
  assert.ok(html.includes('outageTimeLimitMs=level.outage?Math.floor(timeLimitMs*.3):null'));
  const retired=readFileSync(new URL('../../../public/levels/35/index.html',import.meta.url),'utf8');
  assert.ok(retired.includes('../36/index.html'));assert.ok(!retired.includes('warm-glass-level'));
});

test('authored level timers override chapter defaults', () => {
  assert.deepEqual(Array.from({length:18},(_,i)=>glassLevels.find(level=>level.displayNumber===i+1).timeLimitSeconds),
    [25,35,45,50,70,65,70,75,95,100,115,95,85,75,100,120,140,160]);
  assert.equal(glassOutageRemainingMs(70_000,70_000),21_000);
  assert.equal(glassOutageRemainingMs(80_000,80_000),24_000);
});

// Revised levels 7–9 and 17–19 have exhaustive coverage in glass-difficulty.test.mjs.

test('visible 15 places one fixed straight pipe inside a four-route maze', () => {
  const level = glassLevels.find(candidate => candidate.displayNumber===15);
  assert.deepEqual(level.fixed, [12]);
  assert.equal(level.intro, 'fixed');
  assert.deepEqual(level.lessonCells, [12]);
  assert.deepEqual(level.solution[12], [12, 'S', 'N']);
  assert.equal(level.initialRotations[12], 0);
  assert.equal(applyGlassTurn(level, level.initialRotations, 12), null);
  assert.deepEqual(level.variants.map(variant => [variant.stars, variant.path.length, variant.actions.length]), [[1, 9, 14], [2, 15, 23], [2, 17, 26], [3, 23, 35]]);
  assert.ok(level.variants[3].path.includes(12));
  assert.ok(level.variants[3].path.includes(1) && level.variants[3].path.includes(23));
  for (const variant of level.variants) {
    assert.equal(variant.rotations[12], 0);
    assert.ok(!variant.actions.includes(12));
    assert.equal(traceGlassCircuit(orientGlassCells(level.solution, variant.rotations), level).complete, true);
  }
  const steps = { N: -5, E: 1, S: 5, W: -1 }, opposite = { N: 'S', E: 'W', S: 'N', W: 'E' };
  const routes = [];
  const canConnect = (index, entry, exit) => [0, 1, 2, 3].some(turns =>
    (!level.fixed.includes(index) || turns === 0) &&
    glassPortsMatch(rotateGlassCell(level.solution[index], turns), [index, entry, exit]));
  function walk(index, entry, visited, path) {
    if (index === level.goal.index) {
      if (canConnect(index, entry, level.goal.side)) routes.push(path);
      return;
    }
    for (const side of Object.keys(steps)) {
      const next = index + steps[side];
      if (side === entry || next < 0 || next >= 25 ||
          ((side === 'E' || side === 'W') && Math.floor(index / 5) !== Math.floor(next / 5)) ||
          visited & (1 << next) || !canConnect(index, entry, side)) continue;
      walk(next, opposite[side], visited | (1 << next), [...path, next]);
    }
  }
  walk(level.source.index, level.source.side, 1 << level.source.index, [level.source.index]);
  assert.deepEqual(routes.map(path => path.join()).sort(), level.variants.map(variant => variant.path.join()).sort());
});

test('relay introduction always breaks on its first charge and leaves three turns', () => {
  const level = glassLevels.find(candidate => candidate.displayNumber===11);
  assert.equal(level.outage.breakCell, 13);
  assert.equal(level.outage.triggerAfterHalfTime, undefined);
  assert.equal(glassOutageRemainingMs(40_000, 95_000), 28_500);
  assert.equal(glassOutageRemainingMs(8_000, 95_000), 8_000);
  const solved = level.variants[0].rotations;
  let broken = [...solved];
  for (const [cell, turns] of level.outage.turns) broken = applyGlassTurn(level, broken, cell, turns).rotations;
  assert.equal(traceGlassCircuit(orientGlassCells(level.solution, broken), level).complete, false);
  for (const [cell] of level.outage.turns) broken = applyGlassTurn(level, broken, cell, 1).rotations;
  assert.equal(traceGlassCircuit(orientGlassCells(level.solution, broken), level).complete, true);
  assert.deepEqual(level.outage.turns.map(([cell]) => cell).sort((a, b) => a - b), [11, 13, 23]);
});

test('outage caps charge at thirty percent without reducing a smaller reserve', () => {
  assert.equal(glassOutageRemainingMs(60_000,100_000),30_000);
  assert.equal(glassOutageRemainingMs(30_000,100_000),30_000);
  assert.equal(glassOutageRemainingMs(29_999,100_000),29_999);
  assert.equal(glassOutageRemainingMs(10_000,100_000),10_000);
  assert.equal(glassOutageRemainingMs(0,100_000),0);
  assert.equal(glassOutageRemainingMs(40_000),40_000);
  assert.equal(glassOutageRemainingMs(70_000,80_000),24_000);
  assert.equal(glassOutageRemainingMs(40_000,200_000),40_000);
});

test('relay shutters and lamp close after a pulse passes their last channel', () => {
  const relay = { opensAt: 80, closesAt: 175, reducedMotion: false };
  assert.equal(glassRelayState({ ...relay, distance: 79, flowing: true }), 'closed');
  assert.equal(glassRelayState({ ...relay, distance: 80, flowing: true }), 'unlocking');
  assert.equal(glassRelayState({ ...relay, distance: 120, flowing: true }), 'open');
  assert.equal(glassRelayState({ ...relay, distance: 175, flowing: true }), 'closed');
  assert.equal(glassRelayState({ ...relay, distance: 120, flowing: false }), 'closed');
  assert.equal(glassRelayState({ ...relay, distance: Infinity, flowing: false }), 'closed');
  assert.equal(glassRelayState({ ...relay, secondOpensAt: 300, secondClosesAt: 450, distance: 250, flowing: true }), 'closed');
  assert.equal(glassRelayState({ ...relay, secondOpensAt: 300, secondClosesAt: 450, distance: 300, flowing: true }), 'unlocking');
  assert.equal(glassRelayState({ ...relay, secondOpensAt: 300, secondClosesAt: 450, distance: 360, flowing: true }), 'open');
  assert.equal(glassRelayState({ ...relay, secondOpensAt: 300, secondClosesAt: 450, distance: 450, flowing: true }), 'closed');
  assert.equal(glassRelayState({ ...relay, distance: 120, flowing: true, opensAt: undefined }), 'closed');
});

test('side shutters stay open across the relay detour and close after the far shutter', () => {
  const relay = { opensAt: 80, closesAt: 175, secondOpensAt: 1200, secondClosesAt: 1400,
    holdOpenThroughSecondPass: true, flowing: true };
  assert.equal(glassRelayState({ ...relay, distance: 79 }), 'closed');
  assert.equal(glassRelayState({ ...relay, distance: 80 }), 'unlocking');
  assert.equal(glassRelayState({ ...relay, distance: 250 }), 'open');
  assert.equal(glassRelayState({ ...relay, distance: 1199 }), 'open');
  assert.equal(glassRelayState({ ...relay, distance: 1300 }), 'open');
  assert.equal(glassRelayState({ ...relay, distance: 1399 }), 'open');
  assert.equal(glassRelayState({ ...relay, distance: 1400 }), 'closed');
  assert.equal(glassRelayState({ ...relay, distance: 1500 }), 'closed');
  assert.equal(glassRelayState({ ...relay, distance: 1500, finalCharge: true }), 'open');
  assert.equal(glassRelayState({ ...relay, distance: Infinity, flowing: false, powered: true }), 'open');
  assert.equal(glassRelayState({ ...relay, secondClosesAt: -Infinity, distance: 900 }), 'open');
  assert.equal(glassRelayState({ ...relay, secondClosesAt: -Infinity, distance: 900, flowing: false }), 'closed');
  assert.equal(glassRelayState({ ...relay, distance: 1300, shuttersClearAfterFirst: true }), 'open');
});

test('relay introduction keeps its side shutters open for the whole pulse', () => {
  assert.deepEqual(glassLevels.filter(level=>level.sequentialCrossovers?.some(relay=>relay.holdOpenUntilPulseEnds)).map(level=>level.displayNumber),[10]);
  const relay={opensAt:80,closesAt:175,secondOpensAt:300,secondClosesAt:450,holdOpenUntilPulseEnds:true};
  assert.equal(glassRelayState({...relay,distance:79,flowing:true}),'closed');
  assert.equal(glassRelayState({...relay,distance:80,flowing:true}),'unlocking');
  assert.equal(glassRelayState({...relay,distance:250,flowing:true}),'open');
  assert.equal(glassRelayState({...relay,distance:380,flowing:true}),'open');
  assert.equal(glassRelayState({...relay,distance:470,flowing:true}),'open');
  assert.equal(glassRelayState({...relay,distance:470,flowing:false}),'closed');
  assert.equal(glassRelayState({...relay,distance:Infinity,flowing:false,powered:true}),'open');
});

test('visible 17 shutter responds to the sensing pass and clears before the return bridge', () => {
  const relay = { opensAt: 300, closesAt: 495, secondOpensAt: 1300, secondClosesAt: 1500,
    shuttersClearAfterFirst: true, flowing: true };
  assert.equal(glassRelayState({ ...relay, distance: 299 }), 'closed');
  assert.equal(glassRelayState({ ...relay, distance: 300 }), 'unlocking');
  assert.equal(glassRelayState({ ...relay, distance: 350 }), 'open');
  assert.equal(glassRelayState({ ...relay, distance: 495 }), 'cleared');
  assert.equal(glassRelayState({ ...relay, distance: 1350 }), 'cleared');
  assert.equal(glassRelayState({ ...relay, distance: Infinity, flowing: false, powered: true }), 'cleared');
  assert.equal(glassRelayState({ ...relay, distance: Infinity, flowing: false }), 'closed');
});

test('final charge keeps the relay open after its first pass and in the powered state', () => {
  const relay = { opensAt: 80, closesAt: 175 };
  assert.equal(glassRelayState({ ...relay, distance: 79, flowing: true, finalCharge: true }), 'closed');
  assert.equal(glassRelayState({ ...relay, distance: 80, flowing: true, finalCharge: true }), 'unlocking');
  assert.equal(glassRelayState({ ...relay, distance: 400, flowing: true, finalCharge: true }), 'open');
  assert.equal(glassRelayState({ ...relay, distance: Infinity, flowing: false, powered: true }), 'open');
  assert.equal(glassRelayState({ ...relay, distance: Infinity, flowing: false, powered: true, reducedMotion: true }), 'open');
  assert.equal(glassRelayState({ ...relay, distance: Infinity, flowing: false, powered: true, opensAt: undefined }), 'closed');
});

test('all stars are through chambers on continuous source-to-house strands with fixed ports', () => {
  for (const level of glassLevels) {
    assert.equal(level.source.index % level.size, 0);
    assert.equal(level.source.side, 'W');
    assert.equal(level.goal.index % level.size, level.size - 1);
    assert.equal(level.goal.side, 'E');
    const full = level.variants?.find(v => v.stars === getGlassMaximumStars(level));
    const paths = glassFlowPaths(full ? orientGlassCells(level.solution, full.rotations) : level.solution, level);
    assert.ok(paths.length >= ((level.goals??[level.goal]).length), `level ${level.id} strands`);
    for (const star of level.stars) {
      assert.equal(level.solution.find(([index]) => index === star).length, 3, `level ${level.id} star ${star} has two ports`);
      assert.ok(paths.some(path => path.some(([index, entry, exit], order) =>
        index === star && entry && exit && order < path.length - 1)), `level ${level.id} star leads onward`);
    }
    for (const path of paths) {
      const [last, , exit] = path.at(-1);
      if(!level.variants)assert.ok((level.goals ?? [level.goal]).some(goal => goal.index === last && goal.side === exit));
      let previousEnd;
      for (const [index, entry, exit] of path) {
        const bridge=(level.crossovers??[]).includes(index)?'horizontal':null;
        const d = glassFlowCellPath(index, entry, exit, level.stars.includes(index), 0, level.size, bridge);
        assert.ok((d.match(/M/g) ?? []).length >= 1);
        const start = d.match(/^M([^LQ]+)/)[1], end = d.slice(d.lastIndexOf('L') + 1);
        if (previousEnd && entry!==null) assert.equal(start, previousEnd, `level ${level.id} continuous joint`);
        previousEnd = end;
      }
    }
  }
});

test('crossover electricity separates its lower channel from the raised bridge', () => {
  const raisedHorizontal=glassFlowCellPath(12,'W','E',true,0,5,'horizontal');
  const lowerVertical=glassFlowCellPath(12,'N','S',true,0,5,'horizontal');
  assert.equal(raisedHorizontal,'M200,250L228,250Q250,232 272,250L300,250');
  assert.equal(lowerVertical,'M250,200L250,231M250,269L250,300');
  assert.equal((raisedHorizontal.match(/M/g)??[]).length,1);
  assert.equal((lowerVertical.match(/M/g)??[]).length,2);

  const raisedVertical=glassFlowCellPath(12,'N','S',true,0,5,'vertical');
  const lowerHorizontal=glassFlowCellPath(12,'W','E',true,0,5,'vertical');
  assert.equal(raisedVertical,'M250,200L250,228Q268,250 250,272L250,300');
  assert.equal(lowerHorizontal,'M200,250L231,250M269,250L300,250');
});

test('each sequential crossover opens its second channel only after the first pass', () => {
  for (const visible of [10,11,12]) {
    const level=glassLevels.find(item=>item.displayNumber===visible),cell=level.crossovers[0],solvedRotations=level.variants[0].rotations;
    const sequence=level.sequentialCrossovers[0];
    const solvedTrace=traceGlassCircuit(orientGlassCells(level.solution,solvedRotations),level);
    assert.equal(solvedTrace.complete,true,`visible ${visible} solved sequence`);
    assert.ok(solvedTrace.unlockedCrossovers.has(cell),`visible ${visible} relay unlocks`);
    assert.deepEqual(solvedTrace.flowPaths.flat().filter(item=>item[0]===cell),[[cell,...sequence.first],[cell,...sequence.then]]);
    const halfTurn=[...solvedRotations];halfTurn[cell]=(halfTurn[cell]+2)%4;
    assert.equal(traceGlassCircuit(orientGlassCells(level.solution,halfTurn),level).complete,true,`visible ${visible} half-turn keeps the two channels`);
    for (const turn of [1,3]) {
      const rotations=[...solvedRotations];rotations[cell]=(rotations[cell]+turn)%4;
      assert.equal(traceGlassCircuit(orientGlassCells(level.solution,rotations),level).complete,false,`visible ${visible} wrong relay angle ${turn}`);
    }
    const reversed={...level,sequentialCrossovers:[{...sequence,first:sequence.then,then:sequence.first}]};
    assert.equal(traceGlassCircuit(orientGlassCells(level.solution,solvedRotations),reversed).complete,false,`visible ${visible} bridge cannot run before relay`);
  }
});

test('relay introduction has a new single route through both relay channels', () => {
  const level=glassLevels.find(item=>item.displayNumber===10);
  const expected=[10,15,20,21,16,11,6,1,2,3,8,13,18,23,22,17,12,7,8,9,14];
  assert.deepEqual(level.sequentialCrossovers[0].first,['N','S']);
  assert.deepEqual(level.sequentialCrossovers[0].then,['W','E']);
  assert.deepEqual(level.crossovers,[8]);
  assert.deepEqual(level.lessonCells,[8]);
  assert.deepEqual(level.variants[0].path,expected);
  assert.ok(level.variants[0].actions.length<glassLevels.find(item=>item.displayNumber===11).variants[0].actions.length);
  const sides=['N','E','S','W'],opposite={N:'S',E:'W',S:'N',W:'E'},step={N:-5,E:1,S:5,W:-1};
  const neighbour=(index,side)=>{
    const next=index+step[side];
    return next>=0&&next<25&&(side==='E'||side==='W'?Math.floor(index/5)===Math.floor(next/5):true)?next:-1;
  };
  const routes=[];
  function walk(index,entry,visited,phase,rotation,path){
    const ports=level.solution[index].slice(1),straight=ports.includes('N')&&ports.includes('S')||ports.includes('E')&&ports.includes('W');
    if(index===level.goal.index){if(entry!=='E'&&(straight?opposite[entry]==='E':opposite[entry]!=='E'))routes.push({phase,rotation,path});return;}
    const exits=index===8?(rotation===null?[0,1,2,3]:[rotation]).flatMap(turns=>{
      const from=sides[(sides.indexOf(phase===0?'N':'W')+turns)%4],to=sides[(sides.indexOf(phase===0?'S':'E')+turns)%4];
      return phase<2&&entry===from?[[to,turns]]:[];
    }):sides.filter(side=>side!==entry&&(straight?side===opposite[entry]:side!==opposite[entry])).map(side=>[side,rotation]);
    for(const [side,nextRotation] of exits){
      const next=neighbour(index,side),nextEntry=opposite[side],nextPhase=phase+(index===8?1:0);
      if(next<0||next===level.source.index&&path.length>1)continue;
      if(next===8){if(nextPhase>=2)continue;}
      else if(visited&(1<<next))continue;
      walk(next,nextEntry,visited|1<<next,nextPhase,nextRotation,[...path,next]);
    }
  }
  walk(level.source.index,level.source.side,1<<level.source.index,0,null,[level.source.index]);
  assert.deepEqual(routes,[{phase:2,rotation:0,path:expected}]);
});

test('a reachable relay unlocks on an incomplete board at every rotation',()=>{
  const sides=['N','E','S','W'],opposite={N:'S',E:'W',S:'N',W:'E'},neighbours={N:7,E:13,S:17,W:11};
  for(let turns=0;turns<4;turns++){
    for(const from of [sides[turns],opposite[sides[turns]]]){
      const sourceIndex=neighbours[from],rotations=Array(25).fill(0);rotations[12]=turns;
      const crossover=orientGlassCells([[12,'N','E','S','W']],rotations)[0];
      const level={size:5,source:{index:sourceIndex,side:from},goal:{index:14,side:'E'},stars:[],crossovers:[12],sequentialCrossovers:[{index:12,first:['N','S'],then:['W','E'],rotation:0}],requireClosedCircuit:true};
      const trace=traceGlassCircuit([[sourceIndex,from,opposite[from]],crossover],level);
      assert.equal(trace.complete,false);
      assert.ok(trace.unlockedCrossovers.has(12),`rotation ${turns}, entry ${from} activates the relay`);
      assert.ok(trace.flowPaths.some(path=>path.some(([index,entry,exit])=>index===12&&entry===from&&exit===opposite[from])));
    }
  }
});

test('visible 13 retains its short starless route and a unique star-collecting route', () => {
  const level=glassLevels.find(item=>item.displayNumber===13);
  const [full,bypass]=level.variants;
  assert.deepEqual(level.source,{index:10,side:'W'});
  assert.equal(level.stars.length,1);
  assert.equal(level.crossovers.length,1);
  assert.deepEqual(level.sequentialCrossovers[0].first,['N','S']);
  assert.deepEqual(level.sequentialCrossovers[0].then,['W','E']);
  assert.ok(full.path.length>glassLevels.find(item=>item.displayNumber===12).variants[0].path.length);
  assert.ok(full.actions.length>bypass.actions.length);
  assert.ok(bypass.path.length<full.path.length);
  assert.ok(!bypass.path.includes(level.stars[0]));
  assert.equal(bypass.path.filter(index=>index===level.crossovers[0]).length,1);
  assert.equal(full.path.filter(index=>index===level.crossovers[0]).length,2);
  for(const variant of [full,bypass]){
    const trace=traceGlassCircuit(orientGlassCells(level.solution,variant.rotations),level);
    assert.equal(trace.complete,true);
    assert.equal(getGlassEarnedStars(trace,level),variant.stars);
    assert.deepEqual(trace.flowPaths[0].map(([index])=>index),variant.path);
  }

  const sides=['N','E','S','W'],opposite={N:'S',E:'W',S:'N',W:'E'},step={N:-5,E:1,S:5,W:-1};
  const neighbour=(index,side)=>{
    const next=index+step[side];
    return next>=0&&next<25&&(side==='E'||side==='W'?Math.floor(index/5)===Math.floor(next/5):true)?next:-1;
  };
  const routes=[];
  function walk(index,entry,visited,phase,rotation,path){
    const ports=level.solution[index].slice(1),straight=ports.includes('N')&&ports.includes('S')||ports.includes('E')&&ports.includes('W');
    if(ports.length<2)return;
    if(index===level.goal.index){
      if(entry!=='E'&&(straight?opposite[entry]==='E':opposite[entry]!=='E'))routes.push({phase,rotation,path});
      return;
    }
    const exits=index===level.crossovers[0]?(rotation===null?[0,1,2,3]:[rotation]).flatMap(turns=>{
      const from=sides[(sides.indexOf(phase===0?'N':'W')+turns)%4],to=sides[(sides.indexOf(phase===0?'S':'E')+turns)%4];
      return phase<2&&entry===from?[[to,turns]]:[];
    }):sides.filter(side=>side!==entry&&(straight?side===opposite[entry]:side!==opposite[entry])).map(side=>[side,rotation]);
    for(const [side,nextRotation] of exits){
      const next=neighbour(index,side),nextEntry=opposite[side],nextPhase=phase+(index===level.crossovers[0]?1:0);
      if(next<0)continue;
      if(next===level.crossovers[0]){if(nextPhase>=2)continue;}
      else if(visited&(1<<next))continue;
      walk(next,nextEntry,visited|1<<next,nextPhase,nextRotation,[...path,next]);
    }
  }
  walk(level.source.index,level.source.side,1<<level.source.index,0,null,[level.source.index]);
  assert.equal(routes.length,2,`visible 13 has only its two intended corridors: ${JSON.stringify(routes)}`);
  assert.deepEqual(routes.filter(route=>route.path.includes(level.stars[0])).map(route=>route.path),[full.path]);
  assert.ok(routes.some(route=>route.path.join()===bypass.path.join()&&!route.path.includes(level.stars[0])));

  // The former short route through the lower-right tile cannot be restored
  // by turning the relay sideways; the transformer feed stays on row two.
  const shortcutRotations=[...full.rotations];
  shortcutRotations[level.crossovers[0]]=1;
  const shortcut=traceGlassCircuit(orientGlassCells(level.solution,shortcutRotations),level);
  assert.equal(level.solution[24].length,1);
  assert.equal(shortcut.complete,false);
});

test('every board can be solved by the same legal controls used by the hint tool', () => {
  for (const level of glassLevels) {
    let rotations = [...level.initialRotations];
    for (let turns = 0; ; turns++) {
      const hint = nextGlassLevelHint(level,rotations);
      if (hint === null) break;
      assert.ok(turns < level.size ** 2 * 3, `level ${level.id} hint must converge within one cycle per cell`);
      const next=applyGlassTurn(level,rotations,hint);
      assert.ok(next,`level ${level.id} hint is a legal control`);
      rotations=next.rotations;
    }
    const trace = traceGlassCircuit(orientGlassCells(level.solution, rotations), level);
    assert.equal(trace.complete, true, `level ${level.id} legal solution`);
    assert.equal(getGlassEarnedStars(trace, level), getGlassMaximumStars(level));
    for (const cell of level.solution) {
      let rotated = cell;
      for (let i = 0; i < 4; i++) rotated = rotateGlassCell(rotated);
      assert.deepEqual(rotated, cell, `level ${level.id} cell ${cell[0]} full cycle`);
    }
  }
});

test('dead-end stars and a loop attached to one junction do not earn stars', () => {
  const level = { size:4, source:{index:8,side:'W'},goal:{index:11,side:'E'},stars:[0,1] };
  const cells = [[8,'W','E'],[9,'W','E','N'],[10,'W','E'],[11,'W','E'],
    [5,'S','W','N'],[4,'E','N'],[0,'S','E'],[1,'W','S']];
  const loop = traceGlassCircuit(cells, level);
  assert.ok(loop.visited.has(0) && loop.visited.has(1));
  assert.equal(getGlassEarnedStars(loop, level), 1);
  const deadEnd = traceGlassCircuit([[8,'W','E'],[9,'W','E','N'],[10,'W','E'],[11,'W','E'],[5,'S']], { ...level, stars:[5] });
  assert.equal(getGlassEarnedStars(deadEnd, { ...level, stars:[5] }), 1);
});

test('the current catalog contains twenty-five solvable authored boards with stable IDs', () => {
  assert.equal(glassLevels.length, 25);
  assert.deepEqual(
    glassLevels.map((level) => level.id),
    [...Array.from({length:12},(_,index)=>index+1),...Array.from({length:14},(_,index)=>index+31).filter(id=>id!==35)],
  );
  for (const level of glassLevels) {
    assert.equal(level.solution.length, level.size**2, `level ${level.id} cell count`);
    assert.equal(new Set(level.solution.map((cell) => cell[0])).size, level.size**2, `level ${level.id} unique cells`);
    assert.ok(level.solution.every((cell) => cell.length >= 1 && cell.length <= 5));
    const full = level.variants?.find(v => v.stars === getGlassMaximumStars(level));
    const cells = full ? orientGlassCells(level.solution, full.rotations) : level.solution;
    assert.equal(traceGlassCircuit(cells, level).complete, true, 'level ' + level.id + ' solution');
    assert.equal(getGlassEarnedStars(traceGlassCircuit(cells, level), level), getGlassMaximumStars(level));
    assert.equal(
      traceGlassCircuit(orientGlassCells(level.solution, level.initialRotations), level).complete,
      false,
      `level ${level.id} must not start solved`,
    );
  }
});

test('a pulse stops at a broken 5×5 joint and extends after repair',()=>{
 const broken=solved.map(cell=>cell[0]===5?[5,'N','E']:cell);
 assert.equal(traceGlassCircuit(broken).complete,false);
 assert.deepEqual([...traceGlassCircuit(broken).visited],[10]);
 const complete=traceGlassCircuit(solved);assert.equal(complete.complete,true);
 assert.deepEqual([...complete.visited],firstGlassLevel.paths[0]);
});

test('all cells support rotation without changing their authored positions', () => {
  for (const level of [firstGlassLevel, secondGlassLevel]) {
    for (const cell of level.solution) {
      const rotated = rotateGlassCell(cell, 1);
      assert.equal(rotated[0], cell[0]);
      assert.deepEqual(rotateGlassCell(rotated, 3), cell);
    }
  }
});

test('all redesigned score variants are attainable with legal actions on fixed pieces',()=>{
 for(const level of glassLevels.filter(l=>l.variants))for(const v of level.variants){
  const rotations=[...level.initialRotations];
  for(const i of v.actions){assert.ok(!(level.switches??[]).some(s=>s.linked===i));rotations[i]++;const pair=(level.switches??[]).find(s=>s.index===i);if(pair)rotations[pair.linked]++;}
  const trace=traceGlassCircuit(orientGlassCells(level.solution,rotations),level);
  assert.ok(trace.complete);assert.equal(getGlassEarnedStars(trace,level),v.stars);
  if(v.stars===getGlassMaximumStars(level))assert.equal(nextGlassLevelHint(level,rotations),null);else assert.notEqual(nextGlassLevelHint(level,rotations),null);
  for(const path of v.paths??(v.path?[v.path]:[]))assert.ok(path.every(i=>trace.throughCells.has(i)));
 }
});

test('new starts have no wins in the first three legal actions',()=>{
 for(const level of glassLevels.slice(0,7)){
  const controls=level.solution.map(c=>c[0]).filter(i=>!(level.switches??[]).some(s=>s.linked===i));
  function visit(rotations,depth,start){assert.equal(traceGlassCircuit(orientGlassCells(level.solution,rotations),level).complete,false,`level ${level.id} depth ${depth}`);if(depth===3)return;
   for(let n=start;n<controls.length;n++){const i=controls[n],next=[...rotations];next[i]++;const pair=(level.switches??[]).find(s=>s.index===i);if(pair)next[pair.linked]++;visit(next,depth+1,n);}}
  visit(level.initialRotations,0,0);
 }
});

test('route-aware hints converge and never ask for the dependent switch tile',()=>{
 for(const level of glassLevels){const rotations=[...level.initialRotations];for(let n=0;n<100;n++){const i=nextGlassLevelHint(level,rotations);if(i===null)break;assert.ok(!(level.switches??[]).some(s=>s.linked===i));rotations[i]++;const pair=(level.switches??[]).find(s=>s.index===i);if(pair)rotations[pair.linked]++;assert.ok(n<99);}
 assert.ok(traceGlassCircuit(orientGlassCells(level.solution,rotations),level).complete,`level ${level.id}`);}
});

test('the first seven use ordinary controls and retain reproducible downstream traps',()=>{
 for(const l of glassLevels.slice(0,7))assert.deepEqual(l.switches??[],[]);
 const proofs=JSON.parse(readFileSync(new URL('./glass-chapter-one.design.json',import.meta.url)));
 const side=(a,b)=>b===a-5?'N':b===a+5?'S':b===a+1?'E':'W',op={N:'S',S:'N',E:'W',W:'E'};
 for(const c of proofs.traps.filter(c=>c.id<=2)){const l=glassLevels[c.id-1],cells=orientGlassCells(l.solution,c.rotations),trace=traceGlassCircuit(cells,l);
  assert.equal(trace.complete,false);assert.equal(trace.reachedGoals.length,c.reachedGoals??1);assert.ok(trace.openEnds.length>0);assert.equal(getGlassEarnedStars(trace,l),0);assert.ok(c.path.length>=6);
  assert.ok(cells[10].includes('W'));
  for(let k=1;k<c.path.length;k++){const a=c.path[k-1],b=c.path[k];assert.equal(Math.abs(a%5-b%5)+Math.abs(Math.floor(a/5)-Math.floor(b/5)),1);const s=side(a,b);assert.ok(cells[a].includes(s)&&cells[b].includes(op[s]));}
  assert.ok(!cells[c.conflict.index].includes(c.conflict.side));
 }
 for(const c of proofs.sharedNodes.filter(c=>c.id<=2)){const l=glassLevels[c.id-1],needs=[];
  for(const v of [l.variants[0],l.variants[2]]){for(const path of v.paths??[v.path]){const k=path.indexOf(c.index);if(k<0)continue;assert.ok(k>0&&k<path.length-1);needs.push(side(c.index,path[k-1]),side(c.index,path[k+1]));}assert.equal(getGlassEarnedStars(traceGlassCircuit(orientGlassCells(l.solution,v.rotations),l),l),v.stars);}
  // No single orientation can serve both documented approaches at this shared node.
  assert.ok(new Set(needs).size>l.solution[c.index].length-1);
 }
});

test('first tutorial teaches a corner and leaves four turns across other pipes',()=>{
 const l=firstGlassLevel,r=[...l.initialRotations],plan=planGlassHint(l,r);assert.equal(l.timeLimitSeconds,25);assert.equal(l.paths[0].length,9);assert.equal(plan.kind,'rotate');assert.equal(plan.turns,2);assert.equal(l.hintTutorial,false);
 r[plan.control]++;assert.equal(traceGlassCircuit(orientGlassCells(l.solution,r),l).complete,false);
 r[plan.control]++;assert.equal(traceGlassCircuit(orientGlassCells(l.solution,r),l).complete,false);
 const remaining=l.variants[0].actions.slice(2);assert.equal(remaining.length,4);assert.equal(new Set(remaining).size,3);
 for(const [position,control] of remaining.entries()){r[control]++;assert.equal(traceGlassCircuit(orientGlassCells(l.solution,r),l).complete,position===remaining.length-1);}
 assert.deepEqual(glassLevels.filter(l=>l.hintTutorial).map(l=>l.id),[43]);
});

test('a disconnected source or a wrong board exit cannot report readiness', () => {
  assert.equal(
    traceGlassCircuit(solved.map((cell) => (cell[0] === 10 ? [10, 'N', 'S'] : cell))).route.length,
    0,
  );
  assert.equal(
    traceGlassCircuit(solved.map((cell) => (cell[0] === 14 ? [14, 'S', 'N'] : cell))).complete,
    false,
  );
});

test('each star holds the wave for 250ms, in distance order, without counting as travel time', () => {
  const timeline = glassWaveTimeline(1600, [
    { index: 15, distance: 1450 },
    { index: 0, distance: 650 },
  ]);
  assert.deepEqual(
    timeline.stops.map((stop) => stop.index),
    [0, 15],
  );
  assert.equal(timeline.duration, 1350);
  for (const stop of timeline.stops) {
    assert.equal(stop.end - stop.start, 250);
    assert.equal(glassWaveDistance(timeline, stop.start), stop.distance);
    assert.equal(glassWaveDistance(timeline, stop.start + 125), stop.distance);
    assert.equal(glassWaveDistance(timeline, stop.end), stop.distance);
    assert.ok(glassWaveDistance(timeline, stop.end + 1) > stop.distance);
  }
  let previous = 0;
  for (let time = -130; time < timeline.duration + 500; time += 10) {
    const distance = glassWaveDistance(timeline, time);
    assert.ok(distance >= previous && distance <= 1600);
    previous = distance;
  }
  assert.equal(previous, 1600);
});

test('an early diagnostic click travels without charging stops', () => {
  const timeline = glassWaveTimeline(770, []);
  assert.equal(timeline.duration, 850);
  assert.equal(glassWaveDistance(timeline, 425), 385);
  assert.equal(glassWaveDistance(timeline, 900), 770);
});

test('turning a disconnected cell does not restart a test pulse', () => {
  const circuit = {
    d: 'same-route',
    length: 800,
    complete: false,
    segments: [
      { index: 8, start: 0, end: 100 },
      { index: 12, start: 100, end: 200 },
    ],
  };
  const result = reconcileGlassPulse(circuit, circuit, 3, 620);
  assert.equal(result.status, 'unchanged');
  assert.equal(result.elapsed, 620);
  assert.ok(result.distance > 0);
});

test('extending the route ahead keeps the wave at the same visual distance', () => {
  const previous = {
      d: 'short-route',
      length: 600,
      complete: false,
      segments: [{ index: 2, start: 500, end: 600 }],
    },
    next = {
      d: 'long-route',
      length: 900,
      complete: false,
      segments: [{ index: 2, start: 500, end: 600 }],
    },
    result = reconcileGlassPulse(previous, next, 2, 575);
  assert.equal(result.status, 'continue');
  assert.equal(result.distance, 300);
  assert.equal(result.elapsed, 383.3333333333333);
});

test('changing a segment behind the wave cancels it without restarting', () => {
  const previous = {
      d: 'old-route',
      length: 800,
      complete: false,
      segments: [{ index: 12, start: 100, end: 200 }],
    },
    next = {
      d: 'new-route',
      length: 300,
      complete: false,
      segments: [],
    };
  assert.equal(reconcileGlassPulse(previous, next, 12, 700).status, 'cancel');
});

test('every certified five-by-five circuit has useful closed branches and ignores isolated fillers',()=>{
 for(const l of glassLevels.slice(0,7))for(const v of l.variants){const cells=orientGlassCells(l.solution,v.rotations),trace=traceGlassCircuit(cells,l);assert.ok(trace.complete);assert.deepEqual(trace.openEnds,[]);assert.equal(trace.visited.size,trace.throughCells.size);
 for(let i=0;i<25;i++)if(!trace.visited.has(i)){const turned=cells.map(c=>c[0]===i?rotateGlassCell(c):c);assert.ok(traceGlassCircuit(turned,l).complete);}
 }
});

for(const level of glassLevels)test(`automatic hints level ${level.id}: full result and useful legal controls`,()=>{let rotations=[...level.initialRotations],planId=null;const seen=new Set();let count=0;
 while(count++<50){const before=JSON.stringify(rotations),plan=planGlassHint(level,rotations,planId);assert.ok(!seen.has(before),'no cycles');seen.add(before);if(plan.kind==='power')break;assert.equal(plan.kind,'rotate');assert.ok(plan.turns>=1&&plan.turns<=3);if(planId)assert.equal(plan.planId,planId);planId=plan.planId;assert.deepEqual(applyGlassTurn(level,rotations,plan.control,plan.turns).rotations,plan.rotations);rotations=plan.rotations;}
 assert.ok(count<50);const trace=traceGlassCircuit(orientGlassCells(level.solution,rotations),level);assert.ok(trace.complete);assert.equal(getGlassEarnedStars(trace,level),getGlassMaximumStars(level));
 if(level.variants)for(const partial of level.variants.filter(v=>v.stars<getGlassMaximumStars(level))){const plan=planGlassHint(level,partial.rotations);assert.equal(plan.kind,'rotate');}
});
test('automatic turns reject dependent controls and do not pay for straight-pipe symmetry',()=>{
 for(const level of glassLevels){for(const pair of level.switches??[])assert.equal(applyGlassTurn(level,level.initialRotations,pair.linked),null);}
 const level=glassLevels[1],r=[...level.variants.at(-1).rotations],i=level.solution.find(c=>['NS','SN','EW','WE'].includes(c.slice(1).join('')))[0];r[i]+=2;assert.equal(planGlassHint(level,r).kind,'power');
});

// Visible 20–23 are exhaustively covered by glass-underground.test.mjs.

test('legacy level 10 has an ambiguous interior pair and certified star routes',()=>{
 const proofs=JSON.parse(readFileSync(new URL('./glass-block-10-12.design.json',import.meta.url))),dirs=['N','E','S','W'],op=s=>dirs[(dirs.indexOf(s)+2)%4];
 // IDs 11/12 now have independent exhaustive coverage in glass-unused-pair.test.mjs.
 for(const id of [10]){const l=glassLevels[id-1],proof=proofs.find(p=>p.id===id),geometric=[],legal=[];assert.equal(l.size,5);assert.equal(l.routeStyle,'corridor');assert.equal(l.requireClosedCircuit,true);assert.ok(l.solution.every(c=>c.length===3));assert.deepEqual(l.source,{index:10,side:'W'});assert.deepEqual(l.goal,{index:14,side:'E'});
 function walk(path,mask,incoming,phases){const i=path.at(-1),exits=i===14?[[14,'E']]:[[i-5,'N'],[i+1,'E'],[i+5,'S'],[i-1,'W']].filter(([j,s])=>j>=0&&j<25&&(s==='N'||s==='S'||Math.floor(i/5)===Math.floor(j/5))&&!(mask&(1<<j)));for(const[j,out]of exits){if(out===incoming)continue;const qs=[0,1,2,3].filter(q=>glassPortsMatch(rotateGlassCell(l.solution[i],q),[i,incoming,out]));if(!qs.length)continue;const next={...phases,[i]:qs};if(i===14){geometric.push(path);if(l.switches.every(p=>!next[p.index]||!next[p.linked]||next[p.index].some(q=>next[p.linked].includes(q))))legal.push(path);}else walk([...path,j],mask|1<<j,op(out),next);}}
 walk([10],1<<10,'W',{});assert.equal(geometric.length,proof.geometricCount);assert.deepEqual(legal.map(p=>p.join()).sort(),proof.legalPaths.map(p=>p.join()).sort());assert.deepEqual(legal.map(p=>p.join()).sort(),l.variants.map(v=>v.path.join()).sort());
 for(const v of l.variants){let r=[...l.initialRotations];for(const i of v.actions)r=applyGlassTurn(l,r,i).rotations;assert.deepEqual(r,v.rotations);const trace=traceGlassCircuit(orientGlassCells(l.solution,r),l);assert.ok(trace.complete);assert.equal(getGlassEarnedStars(trace,l),v.stars);assert.deepEqual([...trace.visited],v.path);assert.equal(trace.segments.length,trace.visited.size-1);assert.deepEqual(trace.openEnds,[]);}
 let r=[...l.initialRotations];for(const i of proof.trap.actions)r=applyGlassTurn(l,r,i).rotations;const trap=traceGlassCircuit(orientGlassCells(l.solution,r),l);assert.equal(trap.complete,false);assert.equal(trap.reachedGoals.length,0);assert.deepEqual(trap.openEnds,proof.trap.openEnds);
 const pair=l.switches[0];assert.equal(l.switches.length,1);assert.equal(l.intro,undefined);for(const i of [pair.index,pair.linked])assert.ok([6,7,8,11,12,13,16,17,18].includes(i));assert.equal(applyGlassTurn(l,l.initialRotations,pair.linked),null);
 for(const t of proof.traps){let r=[...l.initialRotations];for(const i of t.actions)r=applyGlassTurn(l,r,i).rotations;const trace=traceGlassCircuit(orientGlassCells(l.solution,r),l);assert.equal(trace.complete,false);assert.equal(trace.reachedGoals.length,0);assert.ok(trace.visited.size>=9);}
 assert.ok(proof.rebuild.every(v=>v.changedCommonCells.length>=4));
 if(id===10)assert.ok(new Set(proof.traps.map(t=>t.rotations[pair.index])).size>=2);
 }
});

test('opening levels have short unbranched routes with controlled distractors and noninteractive empty tiles',()=>{
 for(const [id,count] of [[31,9],[32,18],[33,25],[34,25],[36,23],[37,25]]){
  const l=glassLevels.find(l=>l.id===id);assert.equal(l.solution.filter(c=>c.length>1).length,count);
  assert.deepEqual(l.stars,[]);assert.deepEqual(l.switches??[],[]);
  const empty=l.solution.find(c=>c.length===1);
  if(empty)assert.equal(applyGlassTurn(l,l.initialRotations,empty[0]),null);
  let r=[...l.initialRotations];for(const i of l.variants[0].actions)r=applyGlassTurn(l,r,i).rotations;
  const tr=traceGlassCircuit(orientGlassCells(l.solution,r),l);assert.ok(tr.complete);assert.equal(tr.visited.size,l.paths[0].length);assert.deepEqual(tr.openEnds,[]);assert.equal(tr.segments.length,l.paths[0].length-1);assert.equal(getGlassEarnedStars(tr,l),getGlassMaximumStars(l));
 }
 assert.deepEqual(glassLevels.filter(l=>l.tutorial).map(l=>l.id),[31]);
 assert.equal(firstGlassLevel.nextLevelId,32);assert.equal(secondGlassLevel.nextLevelId,33);
 assert.equal(getGlassEarnedStars(traceGlassCircuit(glassLevels[0].solution,glassLevels[0]),glassLevels[0]),getGlassMaximumStars(glassLevels[0]));
});

test('current opening introduces stars only after the first eleven levels',()=>{
 const opening=glassLevels.filter(level=>level.displayNumber<=11).sort((a,b)=>a.displayNumber-b.displayNumber);
 assert.equal(opening.length,11);
 assert.deepEqual(opening.map(level=>level.displayNumber),Array.from({length:11},(_,index)=>index+1));
 assert.ok(opening.every(level=>level.stars.length===0&&getGlassMaximumStars(level)===1));
 assert.deepEqual(glassLevels.filter(level=>level.displayNumber<=14).sort((a,b)=>a.displayNumber-b.displayNumber).slice(11).map(level=>level.stars.length),[1,1,2]);
 assert.equal(glassLevels.find(level=>level.displayNumber===12).intro,'stars');
 assert.equal(glassLevels.find(level=>level.displayNumber===14).intro,'route');
});
