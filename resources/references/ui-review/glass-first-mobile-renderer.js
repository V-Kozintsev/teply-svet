// Move existing vector nodes once, before the initial render. Individual HTML rotors
// let the browser composite each pipe without repainting the complete board artwork.
// The original SVG masks and all energy paths remain in their existing controller.
function createGlassFirstPipeLayers({root,svg,pipePieces,collarPieces,surfaces,node,level}) {
  const board=svg.parentElement,rotors=new Map(),motion=new Map(),moving=new Set(),composited=[];
  const slides=new Map((level.sliders??[]).map(item=>[item.index,item])),hatchGlyphs=new Map();
  // Cancel only the browser's double-click default, never either gameplay click.
  board.addEventListener('dblclick',event=>{if(event.cancelable)event.preventDefault();});
  let reduced=false,paused=false,pausedAt=0,lightCells=new Set();
  const prepareCell=index=>{
    const previous=composited.indexOf(index);if(previous>=0)composited.splice(previous,1);
    composited.push(index);for(const layer of rotors.get(index)??[])if(layer?.classList?.contains('first-cell-rotor'))layer.dataset.composited='true';
    while(composited.length>4){const old=composited.shift();for(const layer of rotors.get(old)??[])if(layer?.classList?.contains('first-cell-rotor'))delete layer.dataset.composited;}
  };
  const write=(index,angle,settled=false)=>{
    const slide=slides.get(index),position=angle/90,dx=slide?(slide.slot%level.size-index%level.size)*position:0,dy=slide?(Math.floor(slide.slot/level.size)-Math.floor(index/level.size))*position:0;
    const transform=slide?`translate(${dx*100}%,${dy*100}%)`:`rotate(${angle}deg)`;
    const layers=rotors.get(index);
    // An unlit cell cannot contribute pixels to the light mask. Keep its mask
    // still until it can receive light; do not add mask work at the last frame.
    for(let i=0;i<layers.length;i++)if(i<2||i>2||settled||lightCells.has(index)){
      const value=slide&&i===2?`translate(${dx*100}px,${dy*100}px)`:transform;
      if(layers[i].style.transform!==value)layers[i].style.transform=value;
    }
    if(!slide)for(const glyph of hatchGlyphs.get(index)??[]){const counter=`rotate(${-angle})`;if(glyph.getAttribute('transform')!==counter)glyph.setAttribute('transform',counter);}
  };
  function settle(){
    for(const index of moving){const item=motion.get(index);item.angle=item.target;item.velocity=0;write(index,item.target);}
    moving.clear();
  }
  const floor=node('svg',{class:'first-board-floor',viewBox:svg.getAttribute('viewBox'),'aria-hidden':'true'});
  floor.append(surfaces);board.insertBefore(floor,svg);
  const planes=new Map();
  for(const kind of ['pipe','collar']){const plane=document.createElement('div');plane.className=`first-${kind}-plane`;board.insertBefore(plane,board.querySelector('.turn-layer'));planes.set(kind,plane);}
  for(const [index,pipe]of pipePieces){
    if(!pipe.firstElementChild?.getAttribute('d'))continue;
    const x=index%level.size*100,y=Math.floor(index/level.size)*100;
    const pair=[];
    for(const [kind,piece]of [['pipe',pipe],['collar',collarPieces.get(index)]]){
      const rotor=document.createElement('div');rotor.className=`first-cell-rotor first-${kind}-rotor`;rotor.dataset.cell=index;
      rotor.style.setProperty('--column',String(index%level.size));rotor.style.setProperty('--row',String(Math.floor(index/level.size)));
      const art=node('svg',{viewBox:`${x} ${y} 100 100`,'aria-hidden':'true'});
      art.append(piece);rotor.append(art);planes.get(kind).append(rotor);pair.push(rotor);
    }
    // Paint all three layers with one angle in the existing energy frame.
    // No independently retargeted CSS transitions or compositor start times.
    pair.push(svg.querySelector(`.mask-piece[data-cell="${index}"]`));
    const sockets=svg.querySelector(`.star-chamber[data-cell="${index}"] .star-sockets`);
    if(sockets){sockets.style.transformOrigin='0px 0px';sockets.style.transition='none';pair.push(sockets);}
    rotors.set(index,pair);
    const glyphs=pair.slice(0,2).map(layer=>layer.querySelector?.('.hatch-glyph')).filter(Boolean);if(glyphs.length)hatchGlyphs.set(index,glyphs);
  }
  return {turn(index,angle){
    if(!rotors.has(index))return;
    const slide=slides.has(index);if(slide)angle=((Math.round(angle/90)%2)+2)%2*90;
    const previous=motion.get(index);
    if(!previous||root.dataset.turnReady!=='true'||reduced||!slide&&angle<previous.target){
      motion.set(index,{angle,target:angle,velocity:0});moving.delete(index);write(index,angle,true);return;
    }
    if(previous.target===angle)return;
    prepareCell(index);
    const distance=angle-previous.angle;
    const requested=Number.parseFloat(root.style?.getPropertyValue('--turn-duration')||'0');
    // A short turn reads more cleanly on phone screens and leaves less time for
    // a dropped Safari frame to become visible. Repeated taps still retarget the
    // same motion instead of starting overlapping animations.
    const duration=requested>0?requested:Math.min(360,240+Math.max(0,distance-90)*.35);
    // Continue from the last displayed angle AND speed, including the 360° boundary.
    // A monotone Hermite segment settles exactly, without spring overshoot.
    motion.set(index,{angle:previous.angle,from:previous.angle,target:angle,velocity:previous.velocity,
      tangent:slide?0:Math.min(previous.velocity*duration,3*distance),duration,started:performance.now()});
    moving.add(index);
  },tick(now){
    if(paused)return;
    for(const index of moving){
      // A late browser frame must not extend the rotation's deadline. Energy
      // simulation keeps its own bounded dt; pauses shift only this start time.
      const item=motion.get(index);
      const t=Math.max(0,Math.min(1,(now-item.started)/item.duration)),distance=item.target-item.from;
      item.angle=item.from+distance*t*t*(3-2*t)+item.tangent*t*(1-t)*(1-t);
      item.velocity=(6*distance*t*(1-t)+item.tangent*(1-4*t+3*t*t))/item.duration;
      if(t===1){item.angle=item.target;item.velocity=0;moving.delete(index);}
      write(index,item.angle);
    }
  },setLightCells(indices){
    lightCells=new Set(indices);
    for(const slide of slides.values())if(lightCells.has(slide.slot))lightCells.add(slide.index);
    // The small end glow can cross a cell edge. Include neighbouring masks
    // before painting it, even when those pipes are not connected yet.
    for(const index of indices)for(const next of [index-level.size,index+level.size,index-1,index+1]){
      if(next>=0&&next<level.size*level.size&&
        (Math.abs(next-index)===level.size||Math.floor(next/level.size)===Math.floor(index/level.size)))lightCells.add(next);
    }
    for(const index of lightCells){const item=motion.get(index);if(item)write(index,item.angle);}
  },setPaused(value){
    if(value===paused)return;
    const now=performance.now();
    if(value)pausedAt=now;
    else for(const index of moving){const item=motion.get(index);item.started+=now-Math.max(pausedAt,item.started);}
    paused=value;
  },setReduced(value){reduced=value;if(value)settle();}};
}
