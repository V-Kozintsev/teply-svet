import fs from 'node:fs';
import { refineFirstEnergyWork } from './build-first-energy-work.mjs';
import { refineFirstEnergyCanvas } from './build-first-energy-canvas.mjs';
const read=name=>fs.readFileSync(new URL(name,import.meta.url),'utf8');
// Shared first-chapter refinement, based on the validated first-level composition.
export function refineFirstMobileScene(source) {
  function layout(){
    const host=root.parentElement,W=host.clientWidth,H=host.clientHeight;
    // Use the available window shape equally for touch and mouse input.
    // Extremely narrow windows retain the scrollable stack and 44px cell targets.
    const portrait=H>W||W<400;
    root.dataset.sceneLayout=portrait?'portrait':'landscape';
    if(level.size===6){
      root.style.setProperty('--scene-inlet-y',`${(Math.floor(level.source.index/level.size)+.5)*100/level.size}%`);
      root.style.setProperty('--scene-outlet-y',`${(Math.floor(level.goal.index/level.size)+.5)*100/level.size}%`);
    }
    root.dataset.sceneScroll='false';root.style.minHeight='';
    if(!portrait)return;
    const style=getComputedStyle(root),w=W-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight),h=H-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
    const header=48,gutter=W<280?2:4,room=h-header;
    // Start with the proven compact fit, including the visible pipe gaps.
    const minSource=clamp(44,w*.06,72),minHouse=clamp(64,w*.085,104),minGap=clamp(18,w*.026,28),chargeDepth=43,sourceGap=clamp(8,w*.02,14);
    let footer=8;
    const minReserve=minSource*1.28+chargeDepth+sourceGap+minHouse*434/482+minGap+footer;
    const available=Math.max(room,220+minReserve);
    if(available>room){root.dataset.sceneScroll='true';root.style.minHeight=`${available+header+H-h}px`;}
    const preferredSource=Math.max(minSource,clamp(44,available*.095,88)),preferredHouse=Math.max(minHouse,clamp(64,available*.15,132)),preferredGap=Math.max(minGap,clamp(18,available*.035,36));
    const preferredReserve=preferredSource*1.28+chargeDepth+sourceGap+preferredHouse*434/482+preferredGap+footer;
    const fraction=clamp(0,(available-(w-gutter*2)-minReserve)/Math.max(1,preferredReserve-minReserve),1);
    let sw=minSource+(preferredSource-minSource)*fraction,hw=minHouse+(preferredHouse-minHouse)*fraction;
    const gap=minGap+(preferredGap-minGap)*fraction;
    // When cells are already generous, share the height with the scenery.
    // Blend continuously and never make an existing source or house smaller.
    const balancedBoard=Math.max(220,Math.min(w-gutter*2,(available-sourceGap-gap-footer-chargeDepth)/(1+1.28*.14+434/482*.22)));
    const progress=clamp(0,(balancedBoard-420)/240,1),balance=progress*progress*(3-2*progress);
    sw+=Math.max(0,balancedBoard*.14-sw)*balance;
    hw+=Math.max(0,balancedBoard*.22-hw)*balance;
    footer+=Math.max(0,Math.min(40,balancedBoard*.04)-footer)*balance;
    const topMin=sw*1.28+chargeDepth+sourceGap,bottomMin=hw*434/482+gap+footer;
    const size=Math.max(1,Math.min(w-gutter*2,available-topMin-bottomMin)),extra=Math.max(0,available-size-topMin-bottomMin),stackY=extra*.5,top=stackY+topMin,x=(w-size)/2;
    const inletX=x+size-(Math.floor(level.source.index/level.size)+.5)*size/level.size,sx=inletX-sw*.5,sy=stackY+sw*.78;
    px('header',header);px('height',available);px('board-x',x);px('board-y',top);px('board-size',size);
    px('source-x',sx);px('source-y',sy);px('source-size',sw);
    slots.forEach(slot=>{const outletX=x+size-(Math.floor(slot.goal.index/level.size)+.5)*size/level.size;slot.element.style.setProperty('--scene-goal-x',`${outletX-hw*.5}px`);slot.element.style.setProperty('--scene-goal-y',`${top+size+gap}px`);slot.element.style.setProperty('--scene-goal-size',`${hw}px`);});
    const gx=parseFloat(slots[0].element.style.getPropertyValue('--scene-goal-x')),gy=parseFloat(slots[0].element.style.getPropertyValue('--scene-goal-y'));
    px('pine-x',sx-sw*1.4);px('pine-y',Math.max(-12,sy-sw*1.65));px('pine-size',sw*1.8);
    px('tree-x',gx+hw*.9);px('tree-y',gy-hw*.3);px('tree-size',hw*.75);
  }
  const start=source.indexOf('  function layout(){'),end=source.indexOf('  function rounded(',start);
  if(start<0||end<0)throw new Error('Missing first-level layout anchor');
  source=source.slice(0,start)+layout.toString()+'\n'+source.slice(end);
  const gardenStart=source.indexOf('  function drawMeadow(art){'),gardenEnd=source.indexOf('  root.sceneGoalAnchor=',gardenStart);
  if(gardenStart<0||gardenEnd<0)throw new Error('Missing first-level garden anchor');
  source=source.slice(0,gardenStart)+read('./glass-first-portrait-garden.js')+'\n'+source.slice(gardenEnd);
  const replace=(from,to)=>{if(!source.includes(from))throw new Error(`Missing first-level feed anchor: ${from}`);source=source.replace(from,to);};
  replace("root.dataset.sceneTrial='single-house';", "root.dataset.sceneTrial='centered-first';");
  replace('[[sx+sw*.5,sy+sw*.4],[sx+sw*.5,bendY],[topX,bendY],[topX,topY]]','[[topX,sy+sw*.4],[topX,topY]]');
  replace('endY=portrait?h.top-b.top+h.height*.75:startY,endX=h.left-b.left+h.width*.32','endY=portrait?h.top-b.top+h.height*.13:startY,endX=h.left-b.left+h.width*(portrait?.5:.32)');
  replace('[[bottomX,bottomY],[bottomX,endY],[endX,endY]]','[[bottomX,bottomY],[bottomX,endY]]');
  replace('left:`${h.left-b.left+h.width*.075}px`,top:`${endY}px`','left:`${portrait?bottomX:h.left-b.left+h.width*.075}px`,top:`${portrait?h.top-b.top+h.height*.025:endY}px`');
  return source;
}

// Avoid animating invisible decoration while the player is rotating a pipe.
// The shared adaptive build applies this lightweight runtime to both chapters.
export function refineFirstMobileRuntime(fragment) {
  const replace=(from,to)=>{if(!fragment.includes(from))throw new Error(`Missing first-level runtime anchor: ${from}`);fragment=fragment.replace(from,to);};
  // Physical iPhone comparison isolates this board-wide Gaussian blur under
  // the moving pipe masks. Approximate its warm falloff with ordinary strokes;
  // the existing energy paths still own geometry, dash timing and clipping.
  replace('.energy-halo { stroke:#ffb83b; stroke-width:12; filter:url(#glass-energy-blur); opacity:.78; }',
    '.energy-halo { stroke:#ffb83b; stroke-width:18; opacity:.12; }\n    #warm-glass-level .energy-halo.halo-middle { stroke-width:14; opacity:.27; }\n    #warm-glass-level .energy-halo.halo-inner { stroke-width:10; opacity:.38; }');
  replace('.end-glow { fill:#ffe1a0; filter:url(#glass-energy-blur); opacity:0; }',
    '.end-glow { fill:url(#glass-end-glow); opacity:0; }');
  replace('<filter id="glass-energy-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>',
    '<radialGradient id="glass-end-glow"><stop stop-color="#ffe1a0" stop-opacity=".95"/><stop offset=".35" stop-color="#ffe1a0" stop-opacity=".85"/><stop offset=".6" stop-color="#ffe1a0" stop-opacity=".42"/><stop offset=".82" stop-color="#ffe1a0" stop-opacity=".1"/><stop offset="1" stop-color="#ffe1a0" stop-opacity="0"/></radialGradient>');
  const halo='<path class="energy-halo"/>';
  if(fragment.split(halo).length!==4)throw new Error('Expected three board energy halo templates');
  fragment=fragment.replaceAll(halo,halo+'<path class="energy-halo halo-middle"/><path class="energy-halo halo-inner"/>');
  replace('<circle class="end-glow" r="7"/>','<circle class="end-glow" r="13"/>');
  replace("      item.ray.dataset.distance = Number.isFinite(distance) ? distance.toFixed(2) : '-1';", "      if (!visible) continue;\n      item.ray.dataset.distance = Number.isFinite(distance) ? distance.toFixed(2) : '-1';");
  replace('      inletFlare.style.transform =', '      if (!visible) continue;\n      inletFlare.style.transform =');
  replace('    testParticles.style.strokeDashoffset = String((-clock * 0.008) % 32);', '    if (isReady) testParticles.style.strokeDashoffset = String((-clock * 0.008) % 32);');
  replace("    $('.energy-particles').style.strokeDashoffset = String((-clock * 0.018) % 32);", "    if (run || isPowered) $('.energy-particles').style.strokeDashoffset = String((-clock * 0.018) % 32);");
  replace('        cells.forEach(([index,...ports])=>{', '        cells.forEach(([index,...ports])=>{\n          if(editedCell!==null&&!(Array.isArray(editedCell)?editedCell.includes(index):editedCell===index))return;');
  replace('  <header class="level-header">',`  <style>${read('./glass-first-mobile.css')}</style>\n  <header class="level-header">`);
  replace('    (async () => {',`${read('./glass-first-mobile-renderer.js')}\n    (async () => {`);
  replace('    (async () => {',`${read('./glass-first-pipe-sound.js')}\n    (async () => {`);
  replace("      Object.assign(actionSounds.pipe,{preload:'auto',volume:1});", "      Object.assign(actionSounds.pipe,{preload:'none',volume:1});\n      const firstPipeSound=createFirstPipeSound(actionSounds.pipe.src,1.5,level.switches?.length?{power:actionSounds.power.src}:{});");
  replace("        const audio=actionSounds[name];", "        if(name==='pipe'||name==='power'&&level.switches?.length){firstPipeSound.play(name==='pipe'?undefined:'power');return;}\n        const audio=actionSounds[name];");
  replace('      function stopActionSounds(keepFeedback=false){', '      function stopActionSounds(keepFeedback=false){\n        firstPipeSound.stop();');
  replace("        for(const [name,audio]of Object.entries(actionSounds)){if(keepFeedback&&(name==='ui'||name==='hint'))continue;audio.pause();audio.currentTime=0;}", "        for(const [name,audio]of Object.entries(actionSounds)){if(name==='pipe'||name==='power'&&level.switches?.length||keepFeedback&&(name==='ui'||name==='hint'))continue;audio.pause();audio.currentTime=0;}");
  replace('      function savePreferences(){', "      function savePreferences(){\n        if(soundButton.getAttribute('aria-pressed')!=='true')firstPipeSound.stop();");
  replace('    (async () => {',`${read('./glass-first-source-tooltip.js')}\n    (async () => {`);
  const tooltipStart=fragment.indexOf('      function positionSourceTooltip(){'),tooltipEnd=fragment.indexOf('      function positionFeedDetails(){',tooltipStart);
  if(tooltipStart<0||tooltipEnd<0)throw new Error('Missing first-level tooltip anchor');
  fragment=fragment.slice(0,tooltipStart)+'      function positionSourceTooltip(){positionFirstSourceTooltip(sourceTooltip,sourceButton,root);}\n'+fragment.slice(tooltipEnd);
  replace("sourceButton.setAttribute('aria-describedby',sourceTooltip.id);", "sourceButton.setAttribute('aria-describedby',sourceTooltip.id);let sourceTooltipFrame=0;new ResizeObserver(()=>{cancelAnimationFrame(sourceTooltipFrame);sourceTooltipFrame=requestAnimationFrame(positionSourceTooltip);}).observe(sourceTooltip);");
  replace("      const sourceTooltip=document.createElement('span');", "      const firstPipeLayers=createGlassFirstPipeLayers({root,svg,pipePieces,collarPieces,surfaces,node,level});\n      const sourceTooltip=document.createElement('span');");
  replace('          pipePiece.style.transform=`rotate(${angle}deg)`;collarPiece.style.transform=`rotate(${angle}deg)`;', '          firstPipeLayers.turn(index,angle);');
  replace("          if(starSockets){starSockets.style.transformOrigin='0px 0px';starSockets.style.transform=`rotate(${angle}deg)`;}", '          // Star sockets share the pipe motion clock.');
  replace('          maskPieces.get(index).style.transform=`rotate(${angle}deg)`;', '          // The first-level renderer owns the mask angle along with both HTML layers.');
  replace('        energy.setCircuit({d:circuitPath,', '        firstPipeLayers.setLightCells(segments.map(segment=>segment.index));\n        energy.setCircuit({d:circuitPath,');
  // Preview a free manual action, including both linked cells. The wallet, circuit, rewards and
  // input lock stay authoritative until the existing transaction completes.
  replace('        try{const expected=currentAttempt;const response=await hintWallet.mutate(', '        const visualTurn=applyGlassTurn(level,state.rotations,index);const visualCells=visualTurn?state.rotations.flatMap((angle,cell)=>angle!==visualTurn.rotations[cell]?[cell]:[]):[];for(const cell of visualCells)firstPipeLayers.turn(cell,visualTurn.rotations[cell]*90);\n        try{const expected=currentAttempt;const response=await hintWallet.mutate(');
  replace("        if(response.result!=='applied'){state.rotations=[...currentAttempt.rotations];render();return;}", "        if(response.result!=='applied'){for(const cell of visualCells)firstPipeLayers.turn(cell,currentAttempt.rotations[cell]*90);state.rotations=[...currentAttempt.rotations];render();return;}");
  replace("        }catch{walletError=true;root.querySelector('.screen-reader').textContent='Не удалось сохранить ход. Попробуй ещё раз.';}", "        }catch{for(const cell of visualCells)firstPipeLayers.turn(cell,state.rotations[cell]*90);walletError=true;root.querySelector('.screen-reader').textContent='Не удалось сохранить ход. Попробуй ещё раз.';}");
  // A pulse or phase change can call wake() from inside paint(). Keep that call
  // from queuing a second frame or resetting the running clock mid-animation.
  replace('  function frame(now) {', '  let firstFrameRunning=false;\n  function frame(now) {');
  replace('    clock += dt;', '    clock += dt;firstFrameRunning=true;\n    try {root.tickFirstPipeLayers?.(now);');
  replace('    paint(dt);\n    frameId = requestAnimationFrame(frame);', '    paint(dt);\n    } finally {firstFrameRunning=false;}\n    if (!paused && !reducedMotion && frameId === null) frameId = requestAnimationFrame(frame);');
  replace('    if (!paused && !reducedMotion && frameId === null) {', '    if (!paused && !reducedMotion && frameId === null && !firstFrameRunning) {');
  replace("        if (activePulse && pulseUpdate) {\n          if (pulseUpdate.status === 'cancel') {\n            pulse = null;\n            hideWave();\n            nextPulse = clock + 2600;\n          } else if (pulseUpdate.status === 'continue') {\n            activePulse.start = clock - pulseUpdate.elapsed;\n            activePulse.highlightBreak = true;\n            activePulse.breakFlashed = false;\n          }\n        } else if (routeChanged) {\n          startTestPulse(true);\n        }", "        // A test wave belongs to the old pipe geometry. End it cleanly and\n        // start a fresh pass after the physical turn has settled.\n        pulse=null;hideWave();nextPulse=clock+460;");
  replace("      const sourceTooltip=document.createElement('span');", "      root.tickFirstPipeLayers=now=>firstPipeLayers.tick(now);\n      const sourceTooltip=document.createElement('span');");
  replace('root.dataset.paused=String(pause);', 'root.dataset.paused=String(pause);firstPipeLayers.setReduced(reduced.matches);firstPipeLayers.setPaused(pause);');
  replace('collars.querySelector(`[data-cell=', 'root.querySelector(`.collar-piece [data-cell=');
  replace('  const $ = (selector) => svg.querySelector(selector);', "  const $ = (selector) => svg.querySelector(selector);\n  const firstSourceFeed=root.querySelector('.source-feed');\n  let firstFeedStrength=null;");
  fragment=fragment.replaceAll("root.style.setProperty('--feed-strength',", "firstSourceFeed.style.setProperty('--feed-strength',");
  replace("    firstSourceFeed.style.setProperty('--feed-strength', String(feed));", "    if(firstFeedStrength!==feed){firstFeedStrength=feed;firstSourceFeed.style.setProperty('--feed-strength', String(feed));}");
  replace("    firstSourceFeed.style.setProperty('--feed-strength', '0');", "    firstFeedStrength=0;firstSourceFeed.style.setProperty('--feed-strength', '0');");
  replace("    const W=innerWidth,H=innerHeight,board=rect(root.querySelector('.board-art'))", "    if(root.dataset.sceneScroll==='true'){const target=step==='source'?root.querySelector('.source-unit'):step==='goal'?root.querySelector('.house:not([hidden])'):getTurnTarget();const r=target?.getBoundingClientRect();if(r&&(r.top<60||r.bottom>innerHeight-8))target.scrollIntoView({block:'center',behavior:'instant'});}\n    const W=innerWidth,H=innerHeight,board=rect(root.querySelector('.board-art'))");
  replace('      function showReadyCoach(immediate=false){', "      function showReadyCoach(immediate=false){\n        if(immediate&&root.dataset.sceneScroll==='true')sourceButton.scrollIntoView({block:'center',behavior:'instant'});");
  replace("      window.visualViewport?.addEventListener('resize',resizeScene);resizeScene();", "      window.visualViewport?.addEventListener('resize',resizeScene);\n      window.addEventListener('scroll',()=>{mobileScene.updateFeeds();onboarding?.position();},{passive:true});resizeScene();");
  return refineFirstEnergyCanvas(refineFirstEnergyWork(fragment));
}
