import { redesignedLevels } from './glass-chapter-one.js';

const oppositeSide = { N: 'S', E: 'W', S: 'N', W: 'E' };

export function glassRelayState({ opensAt, closesAt, secondOpensAt = Infinity, secondClosesAt = -Infinity, distance, flowing, finalCharge = false, powered = false, reducedMotion = false, shuttersClearAfterFirst = false, holdOpenUntilPulseEnds = false, holdOpenThroughSecondPass = false }) {
  if (!Number.isFinite(opensAt)) return 'closed';
  if (holdOpenThroughSecondPass) {
    if (powered) return 'open';
    if (!flowing || distance < opensAt) return 'closed';
    if (!finalCharge && Number.isFinite(secondClosesAt) && distance >= secondClosesAt) return 'closed';
    return !reducedMotion && distance < opensAt + 10 ? 'unlocking' : 'open';
  }
  if (shuttersClearAfterFirst) {
    if (!flowing && !powered || distance < opensAt && !powered) return 'closed';
    if (powered || distance >= closesAt) return 'cleared';
    return !reducedMotion && distance < opensAt + 10 ? 'unlocking' : 'open';
  }
  if (powered) return 'open';
  if (!flowing || distance < opensAt) return 'closed';
  if (holdOpenUntilPulseEnds) return !reducedMotion && distance < opensAt + 10 ? 'unlocking' : 'open';
  if (finalCharge) return !reducedMotion && distance < opensAt + 10 ? 'unlocking' : 'open';
  const firstPass = distance < closesAt;
  const secondPass = distance >= secondOpensAt && distance < secondClosesAt;
  if (!firstPass && !secondPass) return 'closed';
  const openingAt = secondPass && !firstPass ? secondOpensAt : opensAt;
  return !reducedMotion && distance < openingAt + 10 ? 'unlocking' : 'open';
}

const levelTimeSeconds = Object.freeze([
  55, 60, 65, 70, 75, 80, 85, 85, 90, 95, 100, 105, 115,
  115, 115, 125, 125, 125, 125, 140, 140, 140, 140, 155, 155, 155,
]);
const firstChapterLevels = redesignedLevels.map(level => ({
  ...level,
  timeLimitSeconds: level.timeLimitSeconds ?? levelTimeSeconds[level.displayNumber - 1],
}));

export function glassOutageRemainingMs(remainingMs, fullChargeMs) {
  const remaining = Math.max(0, remainingMs);
  // A break caps a generous reserve at 30% of the starting charge.
  // It never takes more charge when the player is already below that mark.
  return Number.isFinite(fullChargeMs) && fullChargeMs > 0
    ? Math.min(remaining, fullChargeMs * .3)
    : remaining;
}

export const firstGlassLevel = firstChapterLevels[0];
export const secondGlassLevel = firstChapterLevels[1];
export const glassLevels = Object.freeze([
  ...firstChapterLevels,
].sort((a,b)=>a.id-b.id));

const glassSides = ['N', 'E', 'S', 'W'];

export function rotateGlassCell([index, ...ports], turns = 1) {
  const rotate = (side) => glassSides[(glassSides.indexOf(side) + turns + 4) % 4];
  return [index, ...ports.map(rotate)];
}

export function orientGlassCells(solution, rotations, level = null) {
  const cells = solution.map((cell) => {
    const turns = rotations[cell[0]] ?? 0;
    const oriented = rotateGlassCell(cell, turns);
    Object.defineProperty(oriented, 'turns', { value: turns, enumerable: false });
    return oriented;
  });
  return level?.sliders?.length ? positionGlassSliders(cells, level) : cells;
}

// Slider position belongs to the saved control value. Its pipe keeps its angle;
// the other rail slot is empty, including in electrical traversal and hints.
function positionGlassSliders(cells, level) {
  const positioned = cells.map(cell => {
    const copy = [...cell];
    Object.defineProperty(copy, 'turns', {value:cell.turns??0});
    return copy;
  });
  for (const slide of level.sliders ?? []) {
    const original = cells[slide.index], turns = original.turns ?? 0;
    const ports = rotateGlassCell(original, -(turns % 4)).slice(1);
    const index = ((turns % 2) + 2) % 2 ? slide.slot : slide.index;
    for (const slot of [slide.index,slide.slot]) {
      const cell = [slot,...(slot===index?ports:[])];
      Object.defineProperties(cell,{turns:{value:0},sliderApplied:{value:true}});
      positioned[slot]=cell;
    }
  }
  return positioned;
}

const glassControl = (level,index) => (level.sliders??[]).find(item=>item.index===index||item.slot===index)?.index ??
  (level.switches??[]).find(item=>item.linked===index)?.index ?? index;

export function glassPortsMatch(left, right) {
  if (!left || !right || left.length !== right.length) return false;
  return left.slice(1).every((side) => right.includes(side));
}

export function nextGlassHintCell(solution, rotations, hintRoute) {
  const current = new Map(orientGlassCells(solution, rotations).map((cell) => [cell[0], cell]));
  const authored = new Map(solution.map((cell) => [cell[0], cell]));
  const candidates = hintRoute?.map((index) => authored.get(index)) ?? solution;
  return candidates.find((cell) => cell && !glassPortsMatch(cell, current.get(cell[0])))?.[0] ?? null;
}

// Compare the authored alternatives in the current field; READY is always accepted.
// Costs are a bounded comparison of these routes, not a claim of global optimality.
export function nextGlassLevelHint(level, rotations) {
  const plan=planGlassHint(level,rotations);
  return plan.kind==='rotate'?plan.control:null;
}

export function glassLevelSignature(level) {
  const signature = [level.id, level.size, level.solution.map(cell=>cell.join('')).join('.'),
    level.initialRotations.join(''), level.stars.join(','), JSON.stringify(level.goals??[level.goal]),
    JSON.stringify(level.switches??[]), JSON.stringify(level.crossovers??[]),
    JSON.stringify(level.crossoverArrows??[]),
    JSON.stringify(level.sequentialCrossovers??[]),
    JSON.stringify(level.oneWays??[]), JSON.stringify(level.fixed??[]),
    JSON.stringify(level.hatches??[]), JSON.stringify(level.outage??null),
    Boolean(level.requireClosedCircuit), level.timeLimitSeconds].join('|');
  return level.sliders?.length ? `${signature}|sliders:${JSON.stringify(level.sliders)}` : signature;
}

// Ordinary input and the hint planner share this legal transition. Future mechanics
// must extend this transition and the full-result validator together.
export function applyGlassTurn(level, rotations, control, turns = 1) {
  const slide=(level.sliders??[]).find(item=>item.index===control||item.slot===control);
  if(slide)control=slide.index;
  if (!Number.isInteger(control) || control < 0 || control >= level.size ** 2 ||
      (level.solution.find(cell=>cell[0]===control)?.length??0) < 2 ||
      !Number.isInteger(turns) || turns < 1 || turns > 3 ||
      (level.fixed??[]).includes(control) ||
      (level.switches??[]).some(pair=>pair.linked===control)) return null;
  if(slide&&turns%2===0)return null;
  const pair=(level.switches??[]).find(pair=>pair.index===control),cells=pair?[control,pair.linked]:[control];
  const next=[...rotations];for(const cell of cells)next[cell]+=turns;
  return {control,turns,cells:slide?[slide.index,slide.slot]:cells,rotations:next,...(slide?{motion:'slide'}:{})};
}

export function planGlassHint(level, rotations, retainedPlanId = null) {
  const current=orientGlassCells(level.solution,rotations,level),trace=traceGlassCircuit(current,level);
  const maximumStars=getGlassMaximumStars(level);
  if(trace.complete&&getGlassEarnedStars(trace,level)===maximumStars)return {kind:'power'};
  const candidates=level.variants?level.variants.filter(v=>v.stars===maximumStars):[{rotations:Array(level.size**2).fill(0)}];
  const plans=candidates.map((variant,number)=>{
    const target=orientGlassCells(level.solution,variant.rotations,level),result=traceGlassCircuit(target,level);
    if(!result.complete||getGlassEarnedStars(result,level)!==maximumStars)return null;
    const connected=[...result.visited],required=new Set(connected),actions=[],handled=new Set();
    for(const index of new Set([...(level.hintRoute??[]),...connected])){if(!required.has(index))continue;
      const pair=(level.switches??[]).find(pair=>pair.index===index||pair.linked===index),control=glassControl(level,index);
      if(handled.has(control))continue;handled.add(control);
      const slide=(level.sliders??[]).find(item=>item.index===control);
      if(slide){
        const turns=[0,1].find(q=>{
          const moved=q?applyGlassTurn(level,rotations,control,q)?.rotations:rotations;
          return moved&&[slide.index,slide.slot].every(cell=>glassPortsMatch(orientGlassCells(level.solution,moved,level)[cell],target[cell]));
        });
        if(turns===undefined)return null;if(turns)actions.push(applyGlassTurn(level,rotations,control,turns));continue;
      }
      const cells=pair?[pair.index,pair.linked]:[index];
      const turns=[0,1,2,3].find(q=>cells.every(cell=>{
        if(!required.has(cell))return true;
        const portsMatch=glassPortsMatch(rotateGlassCell(current[cell],q),target[cell]);
        const directional=(level.oneWays??[]).some(item=>item.index===cell)||
          (level.crossoverArrows??[]).some(item=>item.index===cell);
        const relay=(level.sequentialCrossovers??[]).some(item=>item.index===cell);
        const directionMatch=directional?((rotations[cell]+q)%4+4)%4===((variant.rotations[cell]??0)%4+4)%4:
          !relay||((rotations[cell]+q)%2+2)%2===((variant.rotations[cell]??0)%2+2)%2;
        return portsMatch&&directionMatch;
      }));
      if(turns===undefined)return null;
      if(turns)actions.push(applyGlassTurn(level,rotations,control,turns));
    }
    // All required cells, including joining side branches, must be represented.
    for(const index of connected)if(!handled.has(glassControl(level,index)))return null;
    const usefulKept=connected.filter(index=>trace.visited.has(index)&&glassPortsMatch(current[index],target[index])).length;
    return {id:`${glassLevelSignature(level)}:full:${number}`,actions,usefulKept};
  }).filter(Boolean).sort((a,b)=>a.actions.length-b.actions.length||b.usefulKept-a.usefulKept);
  const plan=plans.find(plan=>plan.id===retainedPlanId)??plans[0];
  if(!plan||!plan.actions.length)return {kind:'unavailable',reason:'Не удалось найти полный путь. Попробуй начать уровень заново.'};
  return {kind:'rotate',...plan.actions[0],planId:plan.id};
}

export function traceGlassCircuit(cells, level = firstGlassLevel) {
  if(level.sliders?.length&&!cells.some(cell=>cell.sliderApplied))cells=positionGlassSliders(cells,level);
  const records = new Map(cells.map((cell) => [cell[0], {ports:cell.slice(1),turns:Number(cell.turns??0)}]));
  const goals = level.goals ?? [level.goal], key=(index,side)=>`${index}:${side}`;
  const edges=new Map(),add=(from,to,type,bidirectional=false,mechanic=null)=>{if(!edges.has(from))edges.set(from,[]);edges.get(from).push({to,type,...(mechanic??{})});if(bidirectional)add(to,from,type,false,mechanic);};
  const rotate=(side,turns)=>glassSides[(glassSides.indexOf(side)+turns+4)%4];
  const crossovers=new Set(level.crossovers??[]),crossoverArrows=new Map((level.crossoverArrows??[]).map(item=>[item.index,item])),sequentialCrossovers=new Map((level.sequentialCrossovers??[]).map(item=>[item.index,item])),oneWays=new Map((level.oneWays??[]).map(item=>[item.index,item]));
  const hatchCells=new Set((level.hatches??[]).flatMap(pair=>[pair.a,pair.b]));
  for(const [index,{ports,turns}]of records){
    if(hatchCells.has(index))continue;
    if(crossovers.has(index)){
      const arrow=crossoverArrows.get(index),sequence=sequentialCrossovers.get(index),normalizedTurns=((turns%4)+4)%4;
      if(arrow&&normalizedTurns!==((arrow.rotation??0)%4+4)%4)continue;
      if(sequence){
        if(sequence.verticalSensorOnly&&normalizedTurns%2!==0)continue;
        const [firstFrom,firstTo]=(sequence.first??['N','S']).map(side=>rotate(side,turns));
        const [thenFrom,thenTo]=(sequence.then??['W','E']).map(side=>rotate(side,turns));
        if(ports.includes(firstFrom)&&ports.includes(firstTo))add(key(index,firstFrom),key(index,firstTo),'inside',true,{unlocks:index});
        if(ports.includes(thenFrom)&&ports.includes(thenTo))add(key(index,thenFrom),key(index,thenTo),'inside',true,{requires:index});
        continue;
      }
      const lowerFrom=rotate('N',turns),lowerTo=rotate('S',turns);
      if(ports.includes(lowerFrom)&&ports.includes(lowerTo))add(key(index,lowerFrom),key(index,lowerTo),'inside',true);
      if(arrow){const from=rotate(arrow.from??'W',turns),to=rotate(arrow.to??'E',turns);if(ports.includes(from)&&ports.includes(to))add(key(index,from),key(index,to),'inside');}
      else{const from=rotate('E',turns),to=rotate('W',turns);if(ports.includes(from)&&ports.includes(to))add(key(index,from),key(index,to),'inside',true);}
      continue;
    }
    const arrow=oneWays.get(index);
    if(arrow){const from=rotate(arrow.from,turns),to=rotate(arrow.to,turns);if(ports.includes(from)&&ports.includes(to))add(key(index,from),key(index,to),'inside');continue;}
    for(const from of ports)for(const to of ports)if(from!==to)add(key(index,from),key(index,to),'inside');
  }
  for(const pair of level.hatches??[]){const a=records.get(pair.a)?.ports[0],b=records.get(pair.b)?.ports[0];if(a&&b)add(key(pair.a,a),key(pair.b,b),'tunnel',true);}
  const step={N:[0,-1],E:[1,0],S:[0,1],W:[-1,0]};
  const external=new Map();
  for(const [index,{ports}]of records)for(const side of ports){const [dx,dy]=step[side],x=index%level.size+dx,y=Math.floor(index/level.size)+dy;
    if(x<0||x>=level.size||y<0||y>=level.size)continue;const neighbour=y*level.size+x;
    if(records.get(neighbour)?.ports.includes(oppositeSide[side])){const from=key(index,side),to=key(neighbour,oppositeSide[side]);add(from,to,'outside',true);external.set(from,to);}
  }
  const start=key(level.source.index,level.source.side),visitedNodes=new Set(),visited=new Set(),parent=new Map(),queue=[],unlockedCrossovers=new Set(),waitingEdges=new Map();
  const segments=[],segmentKeys=new Set(),children=new Map();
  if(records.get(level.source.index)?.ports.includes(level.source.side)){visitedNodes.add(start);visited.add(level.source.index);queue.push(start);parent.set(start,null);}
  while(queue.length){const from=queue.shift();for(const edge of edges.get(from)??[]){const to=edge.to;
    if(edge.requires!==undefined&&!unlockedCrossovers.has(edge.requires)){if(!waitingEdges.has(edge.requires))waitingEdges.set(edge.requires,new Set());waitingEdges.get(edge.requires).add(from);continue;}
    if(edge.type==='outside'){const [a]=from.split(':').map(Number),[b]=to.split(':').map(Number),edgeKey=[a,b].sort((x,y)=>x-y).join('-');if(!segmentKeys.has(edgeKey)){segmentKeys.add(edgeKey);segments.push({key:edgeKey,from:a,to:b,side:from.split(':')[1]});}}
    if(edge.unlocks!==undefined&&!unlockedCrossovers.has(edge.unlocks)){unlockedCrossovers.add(edge.unlocks);for(const waiting of waitingEdges.get(edge.unlocks)??[])queue.push(waiting);waitingEdges.delete(edge.unlocks);}
    if(visitedNodes.has(to))continue;visitedNodes.add(to);visited.add(Number(to.split(':')[0]));parent.set(to,{from,edge});if(!children.has(from))children.set(from,[]);children.get(from).push(to);queue.push(to);
  }}
  const reachedGoals=goals.filter(goal=>visitedNodes.has(key(goal.index,goal.side)));
  const openEnds=[];for(const nodeKey of visitedNodes){const [indexText,side]=nodeKey.split(':'),index=Number(indexText),goal=goals.some(item=>item.index===index&&item.side===side),source=index===level.source.index&&side===level.source.side;
    if(!external.has(nodeKey)&&!goal&&!source)openEnds.push({index,side});}
  const nodePath=target=>{const list=[];for(let cursor=target;cursor!==null;cursor=parent.get(cursor)?.from??null)list.push(cursor);return list.reverse();};
  const toFlowPath=nodes=>{const result=[];for(let n=1;n<nodes.length;n++){const info=parent.get(nodes[n]);if(!info||info.edge.type==='outside')continue;const [fromIndexText,fromSide]=info.from.split(':'),[toIndexText,toSide]=nodes[n].split(':'),fromIndex=Number(fromIndexText),toIndex=Number(toIndexText);
      if(info.edge.type==='inside')result.push([fromIndex,fromSide,toSide]);else result.push([fromIndex,fromSide,null],[toIndex,null,toSide]);}return result;};
  const goalKeys=reachedGoals.map(goal=>key(goal.index,goal.side));
  const leafKeys=[...visitedNodes].filter(item=>!(children.get(item)?.length));
  const terminalKeys=goalKeys.length?goalKeys:[...new Set([...openEnds.map(item=>key(item.index,item.side)),...leafKeys])];
  const flowPaths=terminalKeys.map(target=>toFlowPath(nodePath(target))).filter(path=>path.length);
  const throughCells=new Set();for(const target of goalKeys)for(const item of nodePath(target))throughCells.add(Number(item.split(':')[0]));
  const route=[...visited].map(index=>[index,...(records.get(index)?.ports??[])]);
  return {route,segments,visited,reachedGoals,throughCells,openEnds,flowPaths,unlockedCrossovers,
    complete:reachedGoals.length===goals.length&&(!level.requireClosedCircuit||(openEnds.length===0&&[...visited].every(index=>throughCells.has(index))))};
}

export function getGlassEarnedStars(trace, level = firstGlassLevel) {
  if (!trace.complete) return 0;
  if (level.completionStars) return level.completionStars;
  const visited = trace.throughCells ?? new Set();
  return Math.min(3, (level.baseStars ?? 1) + level.stars.filter((index) => visited.has(index)).length);
}

export function getGlassMaximumStars(level = firstGlassLevel) {
  if (level.completionStars) return level.completionStars;
  return Math.min(3, (level.baseStars ?? 1) + level.stars.length);
}

// Each strand starts at the transformer and contains ordered inlet/outlet pairs.
// Branches share their prefix, so a wave reaches a junction only once in time.
export function glassFlowPaths(cells, level = firstGlassLevel) {
  return traceGlassCircuit(cells,level).flowPaths;
}

export function glassFlowCellPath(index, entry, exit, throughCenter = false, inset = 0, size = 4, crossoverBridge = null) {
  const vectors = { N: [0,-1], E: [1,0], S: [0,1], W: [-1,0] };
  const c = [(index % size) * 100 + 50, Math.floor(index / size) * 100 + 50];
  const point = (side, distance) => c.map((v, k) => v + vectors[side][k] * distance);
  if(!entry&&exit)return `M${c}L${point(exit,50-inset)}`;
  const p = point(entry, 50);
  if (!exit) return `M${p}L${c}`;
  const q = point(exit, 50 - inset);
  if (crossoverBridge && oppositeSide[entry] === exit) {
    const raised = crossoverBridge === 'horizontal'
      ? entry === 'E' || entry === 'W'
      : entry === 'N' || entry === 'S';
    if (raised) {
      const apex = crossoverBridge === 'horizontal' ? [c[0], c[1] - 18] : [c[0] + 18, c[1]];
      return `M${p}L${point(entry,22)}Q${apex} ${point(exit,22)}L${q}`;
    }
    // The current disappears beneath the raised pipe and reappears on the
    // other side. Separate subpaths keep the electrical channels legible.
    return `M${p}L${point(entry,19)}M${point(exit,19)}L${q}`;
  }
  if (throughCenter) return `M${p}L${c}L${q}`;
  if (oppositeSide[entry] === exit) return `M${p}L${q}`;
  return `M${p}L${point(entry,23)}Q${c} ${point(exit,23)}L${q}`;
}

export function glassWaveTimeline(length, stars, travel = 850, hold = 250) {
  const stops = [...stars]
    .sort((a, b) => a.distance - b.distance)
    .map((star, index) => ({
      ...star,
      start: (star.distance / Math.max(1, length)) * travel + index * hold,
      end: (star.distance / Math.max(1, length)) * travel + (index + 1) * hold,
    }));
  return { length, travel, hold, stops, duration: travel + stops.length * hold };
}

export function glassWaveDistance(timeline, elapsed) {
  let delays = 0;
  for (const stop of timeline.stops) {
    if (elapsed < stop.start) break;
    if (elapsed <= stop.end) return stop.distance;
    delays += timeline.hold;
  }
  return Math.min(
    timeline.length,
    Math.max(0, ((elapsed - delays) / timeline.travel) * timeline.length),
  );
}

const glassTestPulseDuration = 1150;

export function reconcileGlassPulse(previous, next, editedCell, elapsed) {
  const distance = Math.min(
    previous.length,
    Math.max(0, (elapsed / glassTestPulseDuration) * previous.length),
  );
  if (previous.d === next.d && previous.complete === next.complete)
    return { status: 'unchanged', elapsed, distance };

  const edited = Array.isArray(editedCell) ? editedCell : [editedCell];
  const firstAffected = (value) => value.segments?.filter((segment) => edited.includes(segment.index))
    .sort((a, b) => a.start - b.start)[0];
  const previousSegment = firstAffected(previous), nextSegment = firstAffected(next);
  if (!previousSegment && !nextSegment) return { status: 'cancel', elapsed, distance };

  const affectedAt = Math.min(
    previousSegment?.start ?? Number.POSITIVE_INFINITY,
    nextSegment?.start ?? Number.POSITIVE_INFINITY,
  );
  if (!next.length || distance > next.length + 0.5 || affectedAt < distance - 0.5)
    return { status: 'cancel', elapsed, distance };

  return {
    status: 'continue',
    elapsed: (distance / next.length) * glassTestPulseDuration,
    distance,
  };
}

export function createGlassEnergy({ root, svg, sourceButton, reduced, onState, onAccepted = () => {}, onDischarge = () => {} }) {
  const $ = (selector) => svg.querySelector(selector);
  const testBase = $('.test-base'),
    testParticles = $('.test-particles');
  const wave = $('.travel-wave');
  let wavePaths = [...wave.querySelectorAll('path')];
  const waveTemplates = wavePaths.map((path) => path.cloneNode(false));
  const base = $('.energy-layer'),
    front = $('.arrival-mask'),
    endGlow = $('.end-glow');
  const beacon = sourceButton.querySelector('.beacon');
  const ns = 'http://www.w3.org/2000/svg';
  const starNodes = new Map(
    [...svg.querySelectorAll('.star-chamber')].map((chamber) => [
      Number(chamber.dataset.cell),
      {
        chamber,
        gem: chamber.querySelector('.star-gem'),
        ring: chamber.querySelector('.star-charge-ring'),
        burst: chamber.querySelector('.star-burst-ring'),
        sparks: [...chamber.querySelectorAll('.star-charge-spark')],
        angle: 0,
        mode: 'idle',
        touchedAt: -Infinity,
        chargeAt: -Infinity,
        alignAt: -Infinity,
        from: 0,
        to: 0,
      },
    ]),
  );
  // Pipe mechanisms live beside the current SVG in the playable tile layer.
  // Include unreachable relays so a new route cannot retain their old state.
  const crossoverRelayNodes = [...root.querySelectorAll('.sequential-crossover-mechanism')];
  // Split every active house into its five window shapes, without changing the artwork.
  const windowGroups = [
    ...root.querySelectorAll('.house:not([hidden]) .panes,.house:not([hidden]) .window-glow'),
  ];
  for (const group of windowGroups) {
    const shapes = group
      .querySelector('path')
      .getAttribute('d')
      .match(/M[^M]+/g);
    group.replaceChildren(
      ...shapes.map((d) => {
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', d);
        return path;
      }),
    );
  }
  const windows = windowGroups.filter((_, index) => index % 2 === 0).flatMap((group) => [...group.children]),
    glows = windowGroups.filter((_, index) => index % 2 === 1).flatMap((group) => [...group.children]);
  const destinationCelebrations = [...root.querySelectorAll('.house:not([hidden])')].map((destination) => {
    const outline = document.createElementNS(ns, 'g');
    {
      outline.setAttribute('class', 'waiting-window-outline');
      outline.setAttribute('aria-hidden', 'true');
      outline.append(...[...destination.querySelector('.panes').children].map(path => path.cloneNode(false)));
      destination.querySelector('svg').append(outline);
    }
    const inletFlare = document.createElement('span');
    inletFlare.className = 'house-feed-flare';
    inletFlare.dataset.house = destination.dataset.house;
    inletFlare.setAttribute('aria-hidden', 'true');
    destination.parentElement.append(inletFlare);
    const effect = document.createElement('span');
    effect.className = 'house-celebration';
    effect.setAttribute('aria-hidden', 'true');
    const ring = document.createElement('span');
    ring.className = 'house-ground-halo';
    destination.prepend(ring);
    const positions = [[-2, 35], [10, 14], [79, 13], [99, 34], [103, 65], [69, 2]];
    const sparks = positions.map(([x, y]) => {
      const spark = document.createElement('span');
      spark.className = 'house-gold-spark';
      spark.style.left = `${x}%`;
      spark.style.top = `${y}%`;
      effect.append(spark);
      return spark;
    });
    destination.append(effect);
    return { effect, sparks, ring, inletFlare, outline };
  });
  let externalFeeds = [];
  const externalEnd = () => Math.max(circuit?.length ?? 0, ...externalFeeds.map(feed => (circuit?.strands?.find(strand => strand.goalIndex === feed.goalIndex)?.length ?? 0) + feed.length));
  let circuit = null,
    phase = 'INCOMPLETE',
    run = null,
    pulse = null,
    nextPulse = 350;
  let clock = 0,
    lastFrame = null,
    frameId = null,
    paused = false,
    reducedMotion = reduced.matches,
    readyAt = 0,
    poweredAt = 0;
  let pressAnimation = null,
    soundOn = true,
    audio = null,
    notes = new Set();
  const clamp = (value) => Math.max(0, Math.min(1, value));
  const fade = (age, duration) => clamp(1 - age / duration);
  function stopNotes() {
    for (const note of notes) {
      try {
        note.stop();
      } catch {}
    }
    notes.clear();
  }
  function unlockAudio() {
    if (!soundOn) return;
    try {
      audio ??= new (window.AudioContext || window.webkitAudioContext)();
      audio.resume().catch(() => {});
    } catch {}
  }
  function chime(order, last) {
    if (!soundOn || paused || !audio || audio.state !== 'running') return;
    // Quiet C–E–G bell phrase; there is no electrical buzz or background-pulse audio.
    const tones = [[order === 0 ? 523.25 : 659.25, 0]];
    if (last) tones.push([783.99, 0.12]);
    for (const [frequency, delay] of tones) {
      const oscillator = audio.createOscillator(),
        gain = audio.createGain(),
        at = audio.currentTime + delay;
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.025, at + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.38);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      notes.add(oscillator);
      oscillator.onended = () => {
        notes.delete(oscillator);
        oscillator.disconnect();
        gain.disconnect();
      };
      oscillator.start(at);
      oscillator.stop(at + 0.4);
    }
  }
  function setStarMode(star, mode) {
    if (star.mode === mode) return;
    star.mode = mode;
    star.chamber.dataset.state = mode;
    star.chamber.setAttribute(
      'aria-label',
      mode === 'charged'
        ? 'Звезда заряжена'
        : mode === 'charging'
          ? 'Звезда накапливает заряд'
          : 'Звезда ожидает запуска',
    );
  }
  function setPhase(value) {
    const previous = phase;
    phase = value;
    if (value === 'READY' && previous !== 'READY') readyAt = clock;
    if (value === 'POWERED' && previous !== 'POWERED') poweredAt = clock;
    root.dataset.energyState = value;
    root.dataset.powered = String(value === 'POWERED');
    root.dataset.complete = String(value === 'POWERED');
    sourceButton.setAttribute('aria-pressed', String(value === 'POWERED'));
    sourceButton.setAttribute('aria-disabled', String(value === 'ACTIVATING' || value === 'POWERED' || value === 'OUTAGE'));
    sourceButton.setAttribute(
      'aria-label',
      value === 'POWERED'
        ? 'Трансформатор: уровень завершён'
        : value === 'ACTIVATING'
          ? 'Трансформатор: подача питания'
          : value === 'OUTAGE'
            ? 'Трансформатор: аварийный обрыв'
          : 'Трансформатор: подать питание',
    );
    if (value === 'INCOMPLETE' || value === 'READY') {
      sourceButton.setAttribute('aria-describedby', 'glass-source-tooltip');
    } else {
      sourceButton.removeAttribute('aria-describedby');
    }
    onState(value);
  }
  function lightWindows(count) {
    windows.forEach((path, index) => {
      path.classList.toggle('lit', index < count);
      glows[index].classList.toggle('lit', index < count);
    });
    root.dataset.windowsLit = String(count);
  }
  function hideWave() {
    wave.style.opacity = '0';
    endGlow.style.opacity = '0';
  }
  function resetStars() {
    for (const star of starNodes.values()) {
      setStarMode(star, 'idle');
      star.touchedAt = -Infinity;
      star.chargeAt = -Infinity;
      star.alignAt = -Infinity;
      star.ring.style.opacity = '0';
      star.burst.style.opacity = '0';
      star.sparks.forEach((spark) => (spark.style.opacity = '0'));
      star.gem.style.transform = `rotate(${star.angle}deg)`;
    }
  }
  function setCrossoverRelays(distance = -Infinity) {
    const active = new Set((circuit?.crossoverRelays ?? []).map(relay => relay.index));
    for (const node of crossoverRelayNodes) {
      if (!active.has(Number(node.dataset.cell)) && node.dataset.sequenceState !== 'closed') node.dataset.sequenceState = 'closed';
    }
    for (const relay of circuit?.crossoverRelays ?? []) {
      if (!relay.node) continue;
      // The relay reacts as the transformer charge enters its sensing channel.
      // Waiting for unlockDistance made the shutter look inert during the pass.
      const opensAt = relay.firstDistance;
      const secondOpensAt = Number.isFinite(relay.gateDistance) ? Math.max(opensAt + 95, relay.gateDistance - 95) : Infinity;
      const clearsAt = (relay.unlockDistance ?? opensAt) + 95;
      const state = glassRelayState({ opensAt, closesAt: relay.shuttersClearAfterFirst ? clearsAt : opensAt + 95,
        secondOpensAt, secondClosesAt: (relay.gateEndDistance ?? -Infinity) + 95, distance,
        flowing: !!(pulse || run), finalCharge: !!run?.valid, powered: phase === 'POWERED', reducedMotion,
        shuttersClearAfterFirst: !!relay.shuttersClearAfterFirst, holdOpenUntilPulseEnds: !!relay.holdOpenUntilPulseEnds,
        holdOpenThroughSecondPass: relay.node.dataset.relayArt === 'side-slides' });
      if (state !== 'closed' && root.dataset.relayReset === 'true') root.dataset.relayReset = 'false';
      if (relay.node.dataset.sequenceState !== state) relay.node.dataset.sequenceState = state;
    }
  }
  function reset() {
    run = null;
    pulse = null;
    hideWave();
    base.style.opacity = '0';
    lightWindows(0);
    resetStars();
    // An attempt boundary must close the shutters even if the old phase was
    // POWERED or the animation is paused before its next paint.
    if (crossoverRelayNodes.length) root.dataset.relayReset = 'true';
    for (const node of crossoverRelayNodes) node.dataset.sequenceState = 'closed';
    stopNotes();
    pressAnimation?.cancel();
    pressAnimation = null;
    root.classList.remove('celebrate');
    root.dataset.outageBurst = 'false';
    root.style.setProperty('--feed-strength', '0');
    root.style.setProperty('--goal-strength', '0');
    circuit?.collars.forEach((mark) => {
      mark.flashAt = mark.softFlashAt = -Infinity;
      mark.node.style.filter = '';
    });
    for (const feed of externalFeeds) {
      feed.ray.style.opacity = '0';
      feed.ray.dataset.distance = '-1';
      feed.base.style.opacity = '0';
    }
    setPhase(circuit?.complete ? 'READY' : 'INCOMPLETE');
    nextPulse = clock + 160;
    testBase.style.opacity = circuit?.complete ? '.3' : '0';
  }
  function displayWave(distance, strength, tail) {
    wave.style.opacity = String(strength);
    for (const path of wavePaths) {
      path.style.strokeDasharray = `${tail} ${externalEnd() + tail + 1}`;
      path.style.strokeDashoffset = String(tail - (distance - Number(path.dataset.distanceStart ?? 0)));
    }
    wave.dataset.distance = distance.toFixed(2);
  }
  function displayArrival(distance) {
    for (const path of front.children) {
      const start = Number(path.dataset.distanceStart ?? 0),
        length = Number(path.dataset.distanceLength ?? 0),
        visible = Math.max(0, Math.min(length, distance - start));
      path.style.strokeDasharray = `${length} ${length + 1}`;
      path.style.strokeDashoffset = String(length - visible);
    }
  }
  function touchStars(distance, touched) {
    for (const mark of circuit.stars)
      if (!touched.has(mark.index) && distance >= mark.distance) {
        touched.add(mark.index);
        const star = starNodes.get(mark.index);
        if (star && star.mode !== 'charged') {
          star.touchedAt = clock;
          setStarMode(star, 'touched');
        }
      }
  }
  function startTestPulse(highlightBreak = false) {
    if (reducedMotion || !circuit?.length || phase === 'ACTIVATING' || phase === 'POWERED' || phase === 'OUTAGE') return;
    pulse = { start: clock, touched: new Set(), highlightBreak, breakFlashed: false };
    nextPulse = clock + 2600;
    wake();
  }
  function emitDischarge() {
    if (!run || run.dischargeHandled) return;
    run.dischargeHandled = true;
    if (soundOn && !paused) onDischarge();
  }
  function beginActivation() {
    if (paused || !circuit?.length || phase === 'ACTIVATING' || phase === 'POWERED' || phase === 'OUTAGE') return false;
    unlockAudio();
    pulse = null;
    hideWave();
    stopNotes();
    const outageDistance = circuit.complete && Number.isFinite(circuit.outageDistance)
      ? Math.max(1, Math.min(circuit.length, circuit.outageDistance))
      : null;
    const timeline = glassWaveTimeline(outageDistance ?? circuit.length, outageDistance === null && circuit.complete ? circuit.stars : []);
    run = {
      start: clock + 130,
      valid: circuit.complete && outageDistance === null,
      outage: outageDistance !== null,
      timeline,
      houseArrival: timeline.duration + (circuit.complete && outageDistance === null ? (externalEnd() - circuit.length) / circuit.length * timeline.travel : 0),
      feedLengths: new Map(externalFeeds.map(feed => [feed.goalIndex, feed.length])),
      touched: new Set(),
      fired: new Set(),
      dischargeHandled: false,
    };
    onAccepted();
    base.style.opacity = circuit.complete ? '1' : '0';
    displayArrival(0);
    circuit.collars.forEach((mark) => (mark.flashAt = -Infinity));
    setPhase('ACTIVATING');
    if (reducedMotion) {
      emitDischarge();
      if (outageDistance !== null) {
        root.dataset.outageBurst = 'true';
        setPhase('OUTAGE');
      } else if (circuit.complete) {
        for (const mark of circuit.stars) {
          const star = starNodes.get(mark.index);
          star.angle = 0;
          star.gem.style.transform = 'rotate(0)';
          setStarMode(star, 'charged');
        }
        displayArrival(circuit.length);
        base.style.opacity = '1';
        lightWindows(windows.length);
        root.style.setProperty('--goal-strength', '1');
        setPhase('POWERED');
      } else setPhase('INCOMPLETE');
      run = null;
      paint(0);
      return true;
    }
    pressAnimation = sourceButton.animate(
      circuit.complete
        ? [
            { transform: 'translateY(-50%) rotate(0deg) scale(1)' },
            {
              transform: 'translateY(-45%) rotate(-3deg) scale(1.09,.84)',
              offset: 0.18,
            },
            {
              transform: 'translateY(-64%) rotate(4.5deg) scale(.91,1.12)',
              offset: 0.38,
            },
            {
              transform: 'translateY(-54%) rotate(-3deg) scale(1.04,.96)',
              offset: 0.58,
            },
            {
              transform: 'translateY(-48%) rotate(1.5deg) scale(.97,1.04)',
              offset: 0.78,
            },
            { transform: 'translateY(-50%) rotate(0deg) scale(1)' },
          ]
        : [
            { transform: 'translateY(-50%) scale(1)' },
            { transform: 'translateY(-50%) scale(.94)', offset: 0.42 },
            { transform: 'translateY(-50%) scale(1)' },
          ],
      circuit.complete
        ? { duration: 520, easing: 'cubic-bezier(.2,.82,.25,1)' }
        : { duration: 130, easing: 'ease-out' },
    );
    wake();
    return true;
  }
  function paintStars(dt) {
    const litRoute = circuit?.complete && ['READY', 'ACTIVATING', 'POWERED'].includes(phase);
    for (const [cell, star] of starNodes) {
      const bright = litRoute && circuit.stars.some((mark) => mark.index === cell);
      const ready = bright && phase === 'READY';
      if (star.chamber.dataset.ready !== String(ready)) star.chamber.dataset.ready = String(ready);
      if (star.chamber.dataset.bright !== String(bright)) star.chamber.dataset.bright = String(bright);
      let scale = 1,
        brightness = 0.82;
      if (star.mode === 'idle' || star.mode === 'touched') {
        if (!reducedMotion) star.angle = (star.angle + dt * 0.03) % 360;
        const touch = fade(clock - star.touchedAt, 300);
        brightness += touch * 0.55;
        if (star.mode === 'touched' && touch === 0) setStarMode(star, 'idle');
      } else if (star.mode === 'charging') {
        // Settle onto the nearest upright point of the five-point star; no extra spinning turn.
        const align = clamp((clock - star.alignAt) / 370);
        star.angle = star.from + (star.to - star.from) * (1 - Math.pow(1 - align, 3));
        const charge = clamp((clock - star.chargeAt) / 250);
        if (clock >= star.chargeAt) {
          scale = 1 + 0.15 * Math.sin(charge * Math.PI);
          brightness = 1.15;
          star.ring.style.opacity = String(1 - 0.3 * charge);
          star.ring.style.strokeDashoffset = String(-charge * 100);
          star.burst.setAttribute('r', String(28 + 14 * charge));
          star.burst.style.opacity = String(0.65 * (1 - charge));
          star.sparks.forEach((spark, index) => {
            const angle = (index * Math.PI * 2) / 5 - Math.PI / 2,
              radius = 26 + charge * 20;
            spark.setAttribute('x', String(Math.cos(angle) * radius - 4));
            spark.setAttribute('y', String(Math.sin(angle) * radius - 4));
            spark.style.opacity = String(Math.sin(charge * Math.PI) * 0.9);
          });
        }
      } else {
        brightness = reducedMotion ? 1.08 : 1.08 + 0.07 * Math.sin(clock / 1500);
      }
      if (bright) {
        brightness = reducedMotion ? 1.7 : 1.7 + 0.08 * Math.sin(clock / 650);
        scale = Math.max(scale, reducedMotion ? 1.04 : 1.04 + 0.025 * Math.sin(clock / 650));
      }
      star.gem.style.transform = `rotate(${star.angle}deg) scale(${scale})`;
      star.gem.style.filter = bright
        ? `brightness(${brightness}) drop-shadow(0 1px 1px #80521f) drop-shadow(0 0 8px #ffe49b) drop-shadow(0 0 15px #ffc34b)`
        : `brightness(${brightness}) drop-shadow(0 1px 1px #80521f) drop-shadow(0 0 ${star.mode === 'charged' ? 5 : 2}px #ffd166)`;
      if (star.mode !== 'charging') {
        star.ring.style.opacity = '0';
        star.burst.style.opacity = '0';
        star.sparks.forEach((spark, index) => {
          if (!bright || reducedMotion) { spark.style.opacity = '0'; return; }
          const progress = ((clock - readyAt + index * 270 + cell * 37) % 1350) / 1350;
          const angle = index * Math.PI * 2 / star.sparks.length - Math.PI / 2;
          const radius = 26 + 19 * progress;
          spark.setAttribute('x', String(Math.cos(angle) * radius - 4));
          spark.setAttribute('y', String(Math.sin(angle) * radius - 4));
          spark.style.opacity = String(Math.sin(progress * Math.PI) * .95);
        });
      }
    }
  }
  function paint(dt) {
    if (!circuit) return;
    const isReady = phase === 'READY',
      isPowered = phase === 'POWERED';
    testBase.style.opacity = isReady ? '.3' : '0';
    testParticles.style.strokeDashoffset = String((-clock * 0.008) % 32);
    $('.energy-particles').style.strokeDashoffset = String((-clock * 0.018) % 32);
    let feed = isReady ? 0.3 : isPowered ? 1 : 0;
    let externalDistance = null, externalStrength = 0, externalTail = 95, strongFeed = false, relayDistance = isPowered ? Infinity : -Infinity;
    let beaconPower = isPowered ? 1 : isReady ? 0.35 : 0;
    if (isReady && !reducedMotion) {
      const cycle = (clock - readyAt + 2600) % 2600;
      beaconPower =
        0.15 + 0.65 * Math.max(0, 1 - Math.abs(cycle - 180) / 100, 1 - Math.abs(cycle - 430) / 100);
    }
    if (!run && !isPowered && !reducedMotion && clock >= nextPulse) {
      startTestPulse(false);
    }
    if (pulse) {
      const elapsed = clock - pulse.start,
        progress = clamp(elapsed / glassTestPulseDuration),
        distance = elapsed / glassTestPulseDuration * circuit.length,
        duration = glassTestPulseDuration * (circuit.complete ? externalEnd() / circuit.length : 1);
      externalDistance = distance;
      relayDistance = distance;
      externalStrength = 0.32 * (elapsed < duration ? 1 : fade(elapsed - duration, 250));
      displayWave(
        distance,
        externalStrength,
        95,
      );
      touchStars(distance, pulse.touched);
      if (
        pulse.highlightBreak &&
        !pulse.breakFlashed &&
        circuit.breakCollar &&
        progress >= 0.98
      ) {
        pulse.breakFlashed = true;
        circuit.breakCollar.softFlashAt = clock;
      }
      feed = Math.max(feed, 0.32 * fade(elapsed, 280));
      if (!circuit.complete && elapsed >= glassTestPulseDuration - 50)
        endGlow.style.opacity = String(
          0.3 * fade(elapsed - glassTestPulseDuration, 250),
        );
      if (elapsed >= duration + 250) {
        pulse = null;
        hideWave();
      }
    }
    if (run) {
      const elapsed = clock - run.start,
        distance = glassWaveDistance(run.timeline, elapsed) + (run.valid ? Math.max(0, elapsed - run.timeline.duration) / run.timeline.travel * circuit.length : 0);
      externalDistance = distance;externalTail = 110;strongFeed = run.valid;
      relayDistance = distance;
      externalStrength = elapsed < run.houseArrival ? 1 : fade(elapsed - run.houseArrival, 180);
      beaconPower = elapsed < 100 ? 1.7 : 0.85;
      feed = 1;
      if (elapsed >= 0) {
        emitDischarge();
        displayWave(
          distance,
          externalStrength,
          110,
        );
        if (run.valid || run.outage) displayArrival(distance);
        else touchStars(distance, run.touched);
        for (const mark of circuit.collars)
          if (!run.fired.has(mark) && distance >= mark.distance) {
            run.fired.add(mark);
            mark.flashAt = clock;
          }
      }
      if (run.outage) {
        const burstAge=elapsed-run.timeline.duration;
        if(burstAge>=0){
          if(root.dataset.outageBurst!=='true')root.dataset.outageBurst='true';
          endGlow.style.opacity=String(.82*fade(Math.max(0,burstAge-160),360));
          if(burstAge>=520){run=null;hideWave();setPhase('OUTAGE');}
        }
      } else if (run.valid) {
        for (const [index, stop] of run.timeline.stops.entries()) {
          const star = starNodes.get(stop.index);
          if (elapsed >= stop.start - 120 && star.mode !== 'charging' && star.mode !== 'charged') {
            star.from = star.angle;
            star.to = Math.round(star.angle / 72) * 72;
            star.alignAt = run.start + stop.start - 120;
            star.chargeAt = run.start + stop.start;
            setStarMode(star, 'charging');
          }
          if (elapsed >= stop.end && star.mode !== 'charged') {
            star.angle = star.to;
            setStarMode(star, 'charged');
            chime(index, index === run.timeline.stops.length - 1);
          }
        }
        if (elapsed >= run.houseArrival) {
          hideWave();
          base.style.opacity = '1';
          lightWindows(
            Math.min(windows.length, 1 + Math.floor((elapsed - run.houseArrival) / 100)),
          );
          root.style.setProperty('--goal-strength', '1');
          if (elapsed >= run.houseArrival + (windows.length - 1) * 100) {
            run = null;
            setPhase('POWERED');
            root.classList.add('celebrate');
          }
        }
      } else if (elapsed >= run.timeline.duration) {
        endGlow.style.opacity = String(0.55 * fade(elapsed - run.timeline.duration, 220));
        if (elapsed >= run.timeline.duration + 220) {
          run = null;
          hideWave();
          setPhase('INCOMPLETE');
          nextPulse = clock + 1500;
        }
      }
    }
    root.style.setProperty('--feed-strength', String(feed));
    setCrossoverRelays(relayDistance);
    for (const item of externalFeeds) {
      const strand = circuit.strands?.find(strand => strand.goalIndex === item.goalIndex);
      const active = circuit.complete && !!strand;
      const logicalLength = run?.feedLengths.get(item.goalIndex) ?? item.length;
      const distance = externalDistance === null || !strand ? -Infinity : (externalDistance - strand.length) * item.length / Math.max(.001,logicalLength);
      item.base.style.opacity = active && phase === 'READY' ? '.22' : active && phase === 'ACTIVATING' && strongFeed && distance >= item.length ? '1' : '0';
      const visible = active && !reducedMotion && distance >= 0 && distance < item.length + externalTail && phase !== 'POWERED';
      item.ray.style.opacity = visible ? String(externalStrength) : '0';
      item.ray.dataset.distance = Number.isFinite(distance) ? distance.toFixed(2) : '-1';
      for (const path of item.paths) {
        path.style.strokeDasharray = `${externalTail} ${item.length + externalTail + 1}`;
        path.style.strokeDashoffset = String(externalTail - (Number.isFinite(distance) ? distance : 0));
      }
    }
    beacon.style.filter = beaconPower
      ? `brightness(${0.75 + beaconPower * 0.6}) drop-shadow(0 0 ${beaconPower * 7}px #ffe6a2)`
      : 'grayscale(1) brightness(.48)';
    for (const mark of circuit.collars) {
      const activationFlash = fade(clock - (mark.flashAt ?? -Infinity), 160),
        breakFlash = fade(clock - (mark.softFlashAt ?? -Infinity), 420),
        flash = Math.max(activationFlash, breakFlash * 0.62);
      mark.node.style.filter = flash
        ? `brightness(${1 + flash * 0.9}) drop-shadow(0 0 ${flash * 4}px #fff1bd)`
        : '';
    }
    paintStars(dt);
    for (const { effect, sparks, ring, inletFlare, outline } of destinationCelebrations) {
      if (outline) outline.style.opacity = phase === 'READY' ? String(reducedMotion ? .4 : .6 * (.5 - .5 * Math.cos((clock - readyAt) * Math.PI * 2 / 1000))) : '0';
      const visible = phase === 'POWERED';
      effect.style.opacity = visible ? '1' : '0';
      ring.style.opacity = visible ? '1' : '0';
      inletFlare.style.opacity = visible ? String(reducedMotion ? .95 : .87 + .13 * Math.sin((clock - poweredAt) / 430)) : '0';
      inletFlare.style.transform = `translate(-50%,-50%) scale(${reducedMotion ? 1 : 1 + .06 * Math.sin((clock - poweredAt) / 430)})`;
      sparks.forEach((spark, index) => {
        const progress = ((clock - poweredAt + index * 290 + 180) % 1800) / 1800;
        spark.style.opacity = !visible || reducedMotion ? '0' : String(Math.sin(progress * Math.PI) * .95);
        spark.style.transform = `translateY(${-progress * 9}px) scale(${.65 + Math.sin(progress * Math.PI) * .5})`;
      });
    }
  }
  function frame(now) {
    frameId = null;
    if (paused || reducedMotion) return;
    if (!root.isConnected) {
      stopNotes();
      audio?.close().catch(() => {});
      return;
    }
    const dt = lastFrame === null ? 0 : Math.min(80, now - lastFrame);
    lastFrame = now;
    clock += dt;
    paint(dt);
    frameId = requestAnimationFrame(frame);
  }
  function wake() {
    if (!paused && !reducedMotion && frameId === null) {
      lastFrame = null;
      frameId = requestAnimationFrame(frame);
    }
  }
  return {
    setExternalFeeds(feeds) { externalFeeds = feeds; paint(0); },
    setCircuit(value, { editedCell = null } = {}) {
      const previousCircuit = circuit,
        activePulse = pulse,
        pulseUpdate =
          previousCircuit && activePulse && editedCell !== null
            ? reconcileGlassPulse(
                previousCircuit,
                value,
                editedCell,
                clock - activePulse.start,
              )
            : null,
        routeChanged =
          !previousCircuit ||
          previousCircuit.d !== value.d ||
          previousCircuit.complete !== value.complete;
      if (previousCircuit) {
        for (const nextMark of value.collars) {
          const previousMark = previousCircuit.collars.find((mark) => mark.node === nextMark.node);
          if (previousMark) {
            nextMark.flashAt = previousMark.flashAt;
            nextMark.softFlashAt = previousMark.softFlashAt;
          }
        }
        previousCircuit.collars.forEach((mark) => (mark.node.style.filter = ''));
      }
      circuit = value;
      for (const path of svg.querySelectorAll('.test-base path,.energy-layer path'))
        path.setAttribute('d', value.d);
      const strands = value.strands ?? [value], flowParts = strands.flatMap(strand => strand.parts?.length ? strand.parts : [{d:strand.d,start:0,length:strand.length}]);
      if (wavePaths.length !== flowParts.length * waveTemplates.length) {
        wave.replaceChildren(...flowParts.flatMap(() => waveTemplates.map((path) => path.cloneNode(false))));
        wavePaths = [...wave.querySelectorAll('path')];
      }
      if (front.children.length !== flowParts.length)
        front.replaceChildren(...flowParts.map(() => document.createElementNS(ns, 'path')));
      flowParts.forEach((part, index) => {
        const frontPath=front.children[index];
        frontPath.setAttribute('d', part.d);
        frontPath.dataset.distanceStart=String(part.start);
        frontPath.dataset.distanceLength=String(part.length);
        for (let kind = 0; kind < waveTemplates.length; kind++)
          {const path=wavePaths[index*waveTemplates.length+kind];path.setAttribute('d',part.d);path.dataset.distanceStart=String(part.start);}
      });
      const longest = strands.findIndex((strand) => strand.length === value.length);
      const longestParts=strands[Math.max(0,longest)]?.parts??[],endpointDistance=Number.isFinite(value.outageDistance)?value.outageDistance:value.length,endpointPart=longestParts.find(part=>endpointDistance<=part.start+part.length)??longestParts.at(-1),endPath=endpointPart?front.children[flowParts.indexOf(endpointPart)]:front.children[Math.max(0,longest)],localEndpoint=endpointPart?Math.max(0,Math.min(endpointPart.length,endpointDistance-endpointPart.start)):endpointDistance;
      const point = endPath.getPointAtLength(Math.max(0,localEndpoint-2));
      endGlow.setAttribute('cx', point.x);
      endGlow.setAttribute('cy', point.y);
      if (editedCell === null || !previousCircuit || run || phase === 'POWERED') {
        reset();
      } else {
        setPhase(circuit.complete ? 'READY' : 'INCOMPLETE');
        if (activePulse && pulseUpdate) {
          if (pulseUpdate.status === 'cancel') {
            pulse = null;
            hideWave();
            nextPulse = clock + 2600;
          } else if (pulseUpdate.status === 'continue') {
            activePulse.start = clock - pulseUpdate.elapsed;
            activePulse.highlightBreak = true;
            activePulse.breakFlashed = false;
          }
        } else if (routeChanged) {
          startTestPulse(true);
        }
      }
      paint(0);
      wake();
    },
    activate: beginActivation,
    pulseNow(highlightBreak = true) {
      startTestPulse(highlightBreak);
      paint(0);
    },
    reset,
    setPaused(value) {
      paused = value;
      if (paused) {
        if (run) run.dischargeHandled = true;
        cancelAnimationFrame(frameId);
        frameId = null;
        lastFrame = null;
        stopNotes();
        pressAnimation?.pause();
      } else {
        if (pressAnimation && pressAnimation.playState === 'paused') pressAnimation.play();
        wake();
      }
    },
    setReduced(value) {
      reducedMotion = value;
      if (value) {
        emitDischarge();
        cancelAnimationFrame(frameId);
        frameId = null;
        lastFrame = null;
        pulse = null;
        hideWave();
        pressAnimation?.cancel();
        stopNotes();
        if (run?.outage) {
          root.dataset.outageBurst = 'true';
          setPhase('OUTAGE');
        } else if (phase === 'POWERED' || run?.valid) {
          for (const mark of circuit.stars) {
            const star = starNodes.get(mark.index);
            star.angle = Math.round(star.angle / 72) * 72;
            setStarMode(star, 'charged');
          }
          displayArrival(circuit.length);
          base.style.opacity = '1';
          lightWindows(windows.length);
          root.style.setProperty('--goal-strength', '1');
          setPhase('POWERED');
        } else if (run) setPhase(circuit.complete ? 'READY' : 'INCOMPLETE');
        run = null;
        paint(0);
      } else wake();
    },
    setSound(value) {
      soundOn = value;
      if (!value) { if (run) run.dischargeHandled = true; stopNotes(); }
    },
  };
}
