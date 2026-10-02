// One finite cue per expired attempt. The wallet remains responsible for spending it.
export function createGlassFuseBurn({overlay,meter,document,reduced}){
  let pending=null,resolvePending=null,timer=null;
  function reset(){
    if(timer!==null)clearTimeout(timer);timer=null;
    overlay.hidden=true;delete meter.dataset.burning;
    const resolve=resolvePending;pending=null;resolvePending=null;resolve?.();
  }
  function play(){
    if(pending)return pending;
    if(document.hidden)return Promise.resolve();
    overlay.dataset.reduced=String(reduced.matches);overlay.hidden=false;meter.dataset.burning='true';
    pending=new Promise(resolve=>{resolvePending=resolve;});
    timer=setTimeout(reset,reduced.matches?850:1350);
    return pending;
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
  document.defaultView?.addEventListener('pagehide',reset);
  return {play,reset};
}
