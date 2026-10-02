// First-level introduction: state survives layout/focus changes; progression is explicit.
export function createGlassOnboarding({root, level, gear, getTurnTarget, onFirstTurn, onChange, onNextSound}) {
  const ns='http://www.w3.org/2000/svg', make=(tag,attrs={})=>{const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));return e;};
  const overlay=document.createElement('div');overlay.className='onboarding-overlay';overlay.hidden=true;
  overlay.innerHTML='<svg class="onboarding-shade" aria-hidden="true"><defs><mask id="onboarding-cutout"><rect width="100%" height="100%" fill="white"/><g class="onboarding-holes"/></mask></defs><rect width="100%" height="100%" fill="#041c26b3" mask="url(#onboarding-cutout)"/><circle class="onboarding-port" fill="#ffd57922" stroke="#ffe2a0" stroke-width="2"/><path class="onboarding-leader" fill="none" stroke="#c3a36d" stroke-width="2" stroke-linecap="round"/></svg><section class="onboarding-card" role="dialog" aria-labelledby="onboarding-copy"><h2 id="onboarding-copy"></h2><button class="lesson-button" type="button" data-action="onboarding-next">Далее</button></section>';
  root.append(overlay);
  const card=overlay.querySelector('.onboarding-card'),copy=card.querySelector('h2'),next=card.querySelector('button'),shade=overlay.querySelector('svg'),holes=overlay.querySelector('.onboarding-holes'),port=overlay.querySelector('.onboarding-port'),leader=overlay.querySelector('.onboarding-leader');
  const texts={charge:'Запас энергии убывает. Собери цепь, пока горит хотя бы одна секция.',life:'Это предохранители — твои попытки. Если энергия закончится, сгорит один.',source:'Отсюда идёт электричество',goal:'Соедини трубы с этим входом, чтобы включить свет в доме',turn:'Нажми на трубу, чтобы повернуть её',power:'Цепь собрана! Нажми на трансформатор, чтобы подать электричество.'};
  let step='done',suspended=false;
  const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};};
  const inflate=(r,p)=>({x:r.x-p,y:r.y-p,width:r.width+p*2,height:r.height+p*2});
  const overlaps=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
  function position(){
    if(step==='done'||suspended)return;
    const W=innerWidth,H=innerHeight,board=rect(root.querySelector('.board-art')),cell=board.width/level.size;
    let targets,anchor;
    if(step==='charge'){
      const meter=rect(root.querySelector('.charge-meter'));targets=[meter];anchor={x:meter.x+meter.width/2,y:meter.y+meter.height/2};
    }else if(step==='life'){
      const meter=rect(root.querySelector('.life-meter'));targets=[meter];anchor={x:meter.x+meter.width/2,y:meter.y+meter.height/2};
    }else if(step==='source'||step==='power'){
      const source=rect(root.querySelector('.source-unit')),beacon=rect(root.querySelector('.source-unit .beacon'));
      targets=[source,beacon,rect(root.querySelector('.source-feed')),rect(root.querySelector('.source-plinth'))];anchor={x:source.x+source.width/2,y:beacon.y};
    }else if(step==='goal'){
      const house=rect(root.querySelector('.house:not([hidden])')),feed=rect(root.querySelector('.goal-feed'));
      anchor={x:board.x+board.width,y:board.y+(Math.floor(level.goal.index/level.size)+.5)*cell};
      targets=[house,feed,{x:anchor.x-cell*.15,y:anchor.y-cell*.19,width:cell*.3,height:cell*.38}];
    }else{
      const button=getTurnTarget();if(!button)return;const tile=rect(button);targets=[tile];anchor={x:tile.x+tile.width/2,y:tile.y+tile.height/2};
    }
    targets=targets.map(r=>inflate(r,3));holes.replaceChildren(...targets.map(r=>make('rect',{...r,rx:6,fill:'black'})));
    shade.setAttribute('viewBox',`0 0 ${W} ${H}`);port.style.display=step==='goal'?'':'none';port.setAttribute('cx',anchor.x);port.setAttribute('cy',anchor.y);port.setAttribute('r',Math.max(5,cell*.16));
    const protectedRects=[...targets,inflate(rect(gear),4)];
    const top=Math.min(...targets.map(r=>r.y)),bottom=Math.max(...targets.map(r=>r.y+r.height));
    let best=null;
    // Keep the asset's tail above/below its target. A short leader retains the exact port anchor.
    for(const width of [...new Set([Math.min(360,W*.34),Math.min(280,W-16),Math.min(224,W-16),Math.min(190,W-16)])]){
      card.style.width=`${Math.max(Math.min(190,W-16),width)}px`;
      for(const below of [false,true])for(const flip of [false,true]){
        card.dataset.below=String(below);const cw=card.offsetWidth,ch=card.offsetHeight,tail=flip?.087:.913;
        const x=Math.max(8,Math.min(W-cw-8,anchor.x-cw*tail));
        const y=Math.max(8,Math.min(H-ch-8,below?bottom+10:top-ch-10));
        const box={x,y,width:cw,height:ch};const conflicts=protectedRects.filter(r=>overlaps(box,r)).length;
        const tx=x+cw*tail,ty=below?y:y+ch;
        const score=conflicts*100000+(ch>H-16?100000:0)+Math.hypot(tx-anchor.x,ty-anchor.y)+(360-cw)*.1;
        if(!best||score<best.score)best={x,y,cw,ch,below,flip,tx,ty,score};
      }
    }
    card.style.width=`${best.cw}px`;card.dataset.below=String(best.below);card.style.left=`${best.x}px`;card.style.top=`${best.y}px`;card.style.setProperty('--bubble-x',best.flip?-1:1);card.style.setProperty('--bubble-y',best.below?-1:1);
    leader.setAttribute('d',`M${best.tx},${best.ty}L${anchor.x},${anchor.y}`);leader.style.display=step==='turn'?'none':'';
    overlay.dataset.targetX=String(anchor.x);overlay.dataset.targetY=String(anchor.y);
  }
  function sync(){overlay.hidden=step==='done'||suspended;root.dataset.onboardingVisible=String(!overlay.hidden);if(!overlay.hidden)position();}
  function setStep(value){
    step=value;root.dataset.onboarding=step;overlay.dataset.step=step;
    if(step!=='done'){copy.textContent=texts[step];next.hidden=step==='turn'||step==='power';}
    if(step==='turn')onFirstTurn();
    sync();onChange();
    // Each newly explained object gets an immediate invitation; resize/focus do not restart it.
    if(!overlay.hidden)for(const element of overlay.querySelectorAll('.lesson-button,.onboarding-holes'))for(const animation of element.getAnimations())animation.currentTime=0;
    if(!overlay.hidden){if(step==='turn')getTurnTarget()?.focus({preventScroll:true});else if(step==='power')root.querySelector('.source-unit')?.focus({preventScroll:true});else next.focus({preventScroll:true});root.querySelector('.screen-reader').textContent=texts[step];}
  }
  next.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();if(suspended||!['charge','life','source','goal'].includes(step))return;onNextSound();setStep(step==='charge'?'life':step==='life'?'source':step==='source'?'goal':'turn');});
  overlay.addEventListener('click',event=>{event.stopPropagation();});
  root.addEventListener('keydown',event=>{
    if(step==='done'||suspended||event.key!=='Tab')return;
    const controls=step==='turn'?[getTurnTarget(),gear]:step==='power'?[root.querySelector('.source-unit'),gear]:[next,gear];const index=controls.indexOf(document.activeElement);event.preventDefault();controls[(index+(event.shiftKey?-1:1)+controls.length)%controls.length]?.focus({preventScroll:true});
  });
  window.addEventListener('resize',position);window.visualViewport?.addEventListener('resize',position);
  return {get step(){return step;},get active(){return step!=='done';},get blocking(){return ['charge','life','source','goal'].includes(step);},reset(){setStep('done');},start(){setStep('charge');},finishTurn(){if(step==='turn')setStep('done');},showPower(){if(step==='done')setStep('power');},finishPower(){if(step==='power')setStep('done');},suspend(value){if(value===suspended)return;suspended=value;sync();},position};
}
