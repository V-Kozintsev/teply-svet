// Existing moon, house and tree gestures, independent of optional companions.
function createGlassScenery(root) {
  const scenery=createSceneryReactions(root,()=>root.querySelector('[data-action="sound"]')?.getAttribute('aria-pressed')==='true');
  let visible=false,suspended=true,pageAway=false;
  function applyPause(){scenery.setPaused(!visible||suspended||pageAway||document.hidden);}
  function pause(value){suspended=value;applyPause();}
  window.addEventListener('warm-level-visible',()=>{visible=true;applyPause();});
  window.addEventListener('pagehide',()=>{pageAway=true;applyPause();});
  window.addEventListener('pageshow',()=>{pageAway=false;applyPause();});
  document.addEventListener('freeze',()=>{pageAway=true;applyPause();});
  document.addEventListener('resume',()=>{pageAway=false;applyPause();});
  function layout(){
    const portrait=root.dataset.sceneLayout==='portrait';
    scenery.layout([{kind:'house',element:root.querySelector('.house:not([hidden])')},...(portrait?[...root.parentElement.querySelectorAll('[data-scenery-art]')].sort((a,b)=>Number(b.dataset.sceneryArt==='moon')-Number(a.dataset.sceneryArt==='moon')).map(element=>({kind:element.dataset.sceneryArt,element})):[{kind:'moon',element:root.querySelector('.moon')},{kind:'tree',element:root.querySelector('.pine')},{kind:'tree',element:root.querySelector('.tree')}])], [root.querySelector('.board-wrap'),root.querySelector('.source-unit'),root.querySelector('.level-header')]);
  }
  applyPause();
  return{layout,pause};
}
