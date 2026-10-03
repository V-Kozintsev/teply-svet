import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { glassHatchPairTone } from './glass-hatch-art.js';
import {
  applyGlassTurn,
  getGlassEarnedStars,
  getGlassMaximumStars,
  glassLevels,
  glassPortsMatch,
  orientGlassCells,
  planGlassHint,
  traceGlassCircuit,
} from './glass-energy.js';

const outageLevels = glassLevels.filter(level => level.outage);

function repairLevel(level) {
  if (!level.outage.solution) return level;
  return {
    ...level,
    solution: level.outage.solution,
    initialRotations: level.outage.initialRotations ?? level.initialRotations,
    hintRoute: level.outage.hintRoute ?? level.hintRoute,
    variants: level.outage.variants ?? level.variants,
    outage: undefined,
  };
}

function click(level, rotations, control) {
  const next = applyGlassTurn(level, rotations, control);
  assert.ok(next, `visible ${level.displayNumber}: cell ${control} accepts a real clockwise turn`);
  for (const fixed of level.fixed ?? []) assert.equal(next.rotations[fixed], rotations[fixed]);
  return next.rotations;
}

function replay(level, initial, actions) {
  return actions.reduce((rotations, control) => click(level, rotations, control), [...initial]);
}

function assertResult(level, rotations, stars) {
  const trace = traceGlassCircuit(orientGlassCells(level.solution, rotations, level), level);
  assert.equal(trace.complete, true, `visible ${level.displayNumber}: reaches the house`);
  assert.deepEqual(trace.openEnds, []);
  assert.equal(getGlassEarnedStars(trace, level), stars);
}

function replayHints(level, initial) {
  let rotations = [...initial], retained = null;
  const seen = new Set();
  for (let step = 0; step <= level.size ** 2; step++) {
    const hint = planGlassHint(level, rotations, retained);
    if (hint.kind === 'power') {
      assertResult(level, rotations, getGlassMaximumStars(level));
      return;
    }
    assert.equal(hint.kind, 'rotate', `visible ${level.displayNumber}: a useful hint is available`);
    assert.ok(!seen.has(JSON.stringify(rotations)), 'hints do not cycle');
    seen.add(JSON.stringify(rotations));
    assert.ok(Number.isInteger(hint.turns) && hint.turns >= 1 && hint.turns <= 3);
    const before = orientGlassCells(level.solution, rotations, level);
    rotations = replay(level, rotations, Array(hint.turns).fill(hint.control));
    assert.deepEqual(rotations, hint.rotations, 'paid hints use the same legal clockwise controls');
    const after = orientGlassCells(level.solution, rotations, level);
    assert.ok(hint.cells.some(index => !glassPortsMatch(before[index], after[index]) ||
      (level.sequentialCrossovers ?? []).some(relay => relay.index === index)), 'hint changes pipe geometry or relay orientation');
    retained = hint.planId;
  }
  assert.fail(`visible ${level.displayNumber}: hints did not complete the full-star repair`);
}

for (const level of outageLevels) {
  test(`visible ${level.displayNumber}: every initial and repair pipe retains its legal controls`, () => {
    const phases = level.outage.solution ? [level, repairLevel(level)] : [level];
    for (const phase of phases) {
      for (const [index, ...ports] of phase.solution) {
        const slide = (phase.sliders ?? []).find(slide => slide.index === index || slide.slot === index);
        const control = slide?.index ?? index;
        const locked = (!ports.length && !slide) || (phase.fixed ?? []).includes(index) ||
          (phase.switches ?? []).some(pair => pair.linked === index);
        if (locked) {
          assert.equal(applyGlassTurn(phase, phase.initialRotations, index), null);
          continue;
        }
        const initial = [...phase.initialRotations];
        let rotations = initial;
        const pair = (phase.switches ?? []).find(pair => pair.index === index);
        for (let turn = 1; turn <= 4; turn++) {
          rotations = click(phase, rotations, index);
          for (let other = 0; other < rotations.length; other++) {
            assert.equal(rotations[other], initial[other] + (other === control || other === pair?.linked ? turn : 0));
          }
        }
        const before = orientGlassCells(phase.solution, initial, phase);
        const after = orientGlassCells(phase.solution, rotations, phase);
        for (const cell of phase.solution) assert.ok(glassPortsMatch(before[cell[0]], after[cell[0]]));
      }
    }
  });

  test(`visible ${level.displayNumber}: initial routes and outage repairs finish through real turns and hints`, () => {
    replayHints(level, level.initialRotations);
    for (const variant of level.variants) {
      const solved = replay(level, level.initialRotations, variant.actions);
      assertResult(level, solved, variant.stars);
      assertResult(level, replay(level, level.initialRotations, [...variant.actions].reverse()), variant.stars);
      if (level.outage.solution) continue;
      const damage = level.outage.turns.flatMap(([index, turns]) => Array(turns).fill(index));
      const broken = replay(level, solved, damage);
      assert.equal(traceGlassCircuit(orientGlassCells(level.solution, broken, level), level).complete, false);
      const repair = level.outage.turns.flatMap(([index, turns]) => Array(4 - turns).fill(index));
      assertResult(level, replay(level, broken, repair), variant.stars);
      assertResult(level, replay(level, broken, [...repair].reverse()), variant.stars);
      replayHints(level, broken);
    }
    if (level.outage.solution) {
      const phase = repairLevel(level);
      assert.equal(traceGlassCircuit(orientGlassCells(phase.solution, phase.initialRotations, phase), phase).complete, false);
      for (const variant of phase.variants) {
        assertResult(phase, replay(phase, phase.initialRotations, variant.actions), variant.stars);
        assertResult(phase, replay(phase, phase.initialRotations, [...variant.actions].reverse()), variant.stars);
      }
      replayHints(phase, phase.initialRotations);
    }
  });
}

test('the fifth outage introduces two movable pipes and removes two former controls', () => {
  const level = glassLevels.find(level => level.displayNumber === 5), phase = repairLevel(level);
  const added = phase.solution.filter(cell => cell.length > 1 && level.solution[cell[0]].length === 1).map(cell => cell[0]);
  const removed = phase.solution.filter(cell => cell.length === 1 && level.solution[cell[0]].length > 1).map(cell => cell[0]);
  assert.deepEqual(added, [19, 24]);
  assert.deepEqual(removed, [12, 17]);
  for (const index of added) {
    assert.equal(applyGlassTurn(level, level.initialRotations, index), null);
    const turns = replay(phase, phase.initialRotations, Array(4).fill(index));
    assert.equal(turns[index], phase.initialRotations[index] + 4);
  }
  for (const index of removed) assert.equal(applyGlassTurn(phase, phase.initialRotations, index), null);
});

test('shared page creates controls for both outage phases and updates them on repair, retry and reload', () => {
  const source = readFileSync(new URL('./glass-level.template.html', import.meta.url), 'utf8');
  const start = source.indexOf('      for(let index=0;index<level.size*level.size;index++){');
  const end = source.indexOf('      const linkedSwitches=', start);
  const controls = source.slice(start, end);
  assert.ok(start >= 0 && end > start && controls.includes('function syncTurnControls()'));
  assert.match(source, /function rebuildPipeBoard\(\)\{\s*syncTurnControls\(\);/);
  function setup(level, route) {
    const buttons = new Map(), children = [];
    const scope = {
      level, route, turnButtons: buttons, glassHatchPairTone,
      sliderCells: new Set((level.sliders ?? []).flatMap(slide => [slide.index, slide.slot])),
      hatchCells: new Map((level.hatches ?? []).flatMap((pair,index) => [[pair.a,{number:index+1}],[pair.b,{number:index+1}]])),
      fixedCells: new Set(level.fixed ?? []),
      crossoverCells: new Set(level.crossovers ?? []),
      crossoverArrowCells: new Set((level.crossoverArrows ?? []).map(item => item.index)),
      sequentialCrossoverCells: new Set((level.sequentialCrossovers ?? []).map(item => item.index)),
      oneWayCells: new Set((level.oneWays ?? []).map(item => item.index)),
      turnLayer: { append(button) { children.push(button); } },
      turnTemplate: {
        remove() {},
        content: { firstElementChild: { cloneNode() {
          return { dataset: {}, hidden: false, disabled: false, style: { setProperty() {} },
            classList: { add() {} }, setAttribute() {} };
        } } },
      },
    };
    const sync = vm.runInContext(controls + '\nsyncTurnControls', vm.createContext(scope));
    assert.equal(children.length, buttons.size, 'each cell gets one persistent control');
    return { scope, buttons, sync };
  }
  function assertControls(level, runtime) {
    for (const [index, ...ports] of level.solution) {
      const button = runtime.buttons.get(index);
      const slider = runtime.scope.sliderCells.has(index);
      if (!ports.length && !slider) {
        if (button) { assert.equal(button.hidden, true); assert.equal(button.disabled, true); }
      } else {
        assert.ok(button, `visible ${level.displayNumber}: occupied cell ${index} has a control`);
        assert.equal(button.hidden, false);
        if (runtime.scope.hatchCells.has(index)) assert.equal(button.disabled, true);
        else if (applyGlassTurn(level, level.initialRotations, index)) assert.equal(button.disabled, false);
      }
    }
  }
  for (const level of glassLevels) {
    const runtime = setup(level, level.solution);
    assertControls(level, runtime);
    if (!level.outage?.solution) continue;
    const phase = repairLevel(level), originalButtons = new Map(runtime.buttons);
    for (const current of [phase, level, phase]) {
      runtime.scope.route = current.solution;
      runtime.sync();
      assertControls(current, runtime);
      for (const [index, button] of originalButtons) assert.equal(runtime.buttons.get(index), button, 'event targets survive route changes');
    }
    assertControls(phase, setup(level, phase.solution));
  }
});
