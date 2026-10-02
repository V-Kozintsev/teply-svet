import { isAdaptiveLevel } from './chapter-one-scope.mjs';
import fs from 'node:fs';
import { refineFirstMobileScene, refineFirstMobileRuntime } from './build-first-mobile-scene.mjs';
const read=name=>fs.readFileSync(new URL(name,import.meta.url),'utf8');
// Every playable board shares the same responsive scene and lightweight renderer.
export function withMobileScene(fragment,id){
  if(!isAdaptiveLevel(id))return fragment;
  const replace=(a,b)=>{if(!fragment.includes(a))throw new Error(`Mobile scene anchor missing: ${a.slice(0,75)}`);fragment=fragment.replace(a,b);};
  replace('  <header class="level-header">',`  <style>${read('./glass-mobile-scene.css')}</style>\n  <header class="level-header">`);
  const scene=read('./glass-mobile-scene.js');
  replace('    (async () => {',`${refineFirstMobileScene(scene)}\n    (async () => {`);
  const start=fragment.indexOf('      function positionFeedDetails(){'),end=fragment.indexOf('      const meadow=createGlassMeadow(root);',start);
  if(start<0||end<0)throw new Error('Missing exterior geometry adapter');
  fragment=fragment.slice(0,start)+`      function positionFeedDetails(){mobileScene.updateFeeds();}\n      function positionGoalConduits(){}\n      const mobileScene=createGlassMobileScene({root,level,svg,sourceButton,energy,node,appendPipeLayers,collarSleeve});\n`+fragment.slice(end);
  replace('      function positionSourceTooltip(){','      function positionSourceTooltip(){\n        if(mobileScene.tooltip(sourceTooltip))return;');
  replace("      const layoutInitialVisuals=()=>{positionSourceTooltip();positionHouseTooltip();positionStarLesson();positionOutageLesson();positionGoalConduits();positionFeedDetails();meadow.draw();onboarding?.position();};\n      window.__layoutWarmLevelVisuals=layoutInitialVisuals;\n      new ResizeObserver(layoutInitialVisuals).observe(root.querySelector('.level-stage'));",`      const resizeScene=()=>{mobileScene.layout();positionSourceTooltip();positionHouseTooltip();positionStarLesson();positionOutageLesson();positionFeedDetails();meadow.draw();onboarding?.position();};\n      window.__layoutWarmLevelVisuals=resizeScene;\n      const sceneObserver=new ResizeObserver(resizeScene);sceneObserver.observe(root.parentElement);sceneObserver.observe(root.querySelector('.level-stage'));\n      window.visualViewport?.addEventListener('resize',resizeScene);resizeScene();`);
  replace("  let lastGeometry='';", "  let lastGeometry='',lastSceneLayout='';");
  replace('  function draw(){\n',"  function draw(){\n    if(lastSceneLayout!==root.dataset.sceneLayout){lastGeometry='';lastSceneLayout=root.dataset.sceneLayout;}\n    if(root.sceneMeadow?.(art))return;\n");
  replace("targets=[source,beacon,rect(root.querySelector('.source-feed')),rect(root.querySelector('.source-plinth'))];", "targets=[source,beacon,...root.sceneGuideTargets('source'),rect(root.querySelector('.source-plinth'))];");
  replace("targets=[house,feed,{x:anchor.x-cell*.15", "targets=[house,...root.sceneGuideTargets('goal'),{x:anchor.x-cell*.15");
  replace('anchor={x:board.x+board.width,y:board.y+(Math.floor(level.goal.index/level.size)+.5)*cell};', 'anchor=root.sceneGoalAnchor()??{x:board.x+board.width,y:board.y+(Math.floor(level.goal.index/level.size)+.5)*cell};');
  replace('Math.min(190,W-16)])]', "Math.min(190,W-16),...(root.dataset.sceneLayout==='portrait'?[160]:[])])]" );
  replace('Math.max(Math.min(190,W-16),width)', "Math.max(Math.min(root.dataset.sceneLayout==='portrait'?160:190,W-16),width)");
  // Include beside-target placements; the tall exterior pipe must not force a bubble off screen.
  replace('        const box={x,y,width:cw,height:ch};',`        const beside=Math.max(...targets.filter(r=>r.y<board.y).map(r=>r.x+r.width),anchor.x)+8;\n        const positions=root.dataset.sceneLayout==='portrait'?[[x,y],...(beside+cw<W-8?[[beside,Math.max(8,anchor.y)]]:[]),[Math.min(W-cw-8,anchor.x+35),Math.max(8,anchor.y-8)],[8,Math.max(8,anchor.y-ch-14)],[Math.max(8,W-cw-8),Math.max(8,board.y+cell*.75)],[8,Math.min(H-ch-8,board.y+board.height*.45)]]:[[x,y]];\n        for(const [candidateX,candidateY] of positions){\n        const x=Math.max(8,candidateX),y=Math.max(8,Math.min(H-ch-8,candidateY));\n        const box={x,y,width:cw,height:ch};`);
  replace('if(!best||score<best.score)best={x,y,cw,ch,below,flip,tx,ty,score};','if(!best||score<best.score)best={x,y,cw,ch,below,flip,tx,ty,score};\n        }');
  // Spotlight geometry follows the displayed buttons, including the rotated board.
  replace('        const cx=board.left-bounds.left+((index%level.size)+.5)*board.width/level.size,cy=board.top-bounds.top+(Math.floor(index/level.size)+.5)*board.height/level.size,r=board.width*.4/level.size;', "        const cellPoint=cell=>{const r=turnButtons.get(cell).getBoundingClientRect();return{x:r.left-bounds.left+r.width/2,y:r.top-bounds.top+r.height/2};},point=cellPoint(index),cx=point.x,cy=point.y,r=board.width*.4/level.size;");
  replace("hole.setAttribute('cx',board.left-bounds.left+((cell%level.size)+.5)*board.width/level.size);hole.setAttribute('cy',board.top-bounds.top+(Math.floor(cell/level.size)+.5)*board.height/level.size);", "hole.setAttribute('cx',cellPoint(cell).x);hole.setAttribute('cy',cellPoint(cell).y);");
  replace('otherY=board.top-bounds.top+(Math.floor(other/level.size)+.5)*board.height/level.size;', 'otherY=cellPoint(other).y;');
  return refineFirstMobileRuntime(fragment);
}
