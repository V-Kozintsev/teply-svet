// One board and one energy controller. Portrait rotates the board's view, never its indexed state.
function createGlassMobileScene({root,level,svg,sourceButton,energy,node,appendPipeLayers,collarSleeve}) {
  const stage=root.querySelector('.level-stage'),sourceSide=root.querySelector('.source-side'),goalSide=root.querySelector('.goal-side');
  const goals=[level.goal],slots=[{goal:level.goal,index:0,element:root.querySelector('.house[data-house="0"]')}];
  root.dataset.sceneTrial='single-house';
  const clamp=(min,v,max)=>Math.max(min,Math.min(v,max)),px=(name,v)=>root.style.setProperty(`--scene-${name}`,`${v}px`);
  let geometry='',paths=new Map(),meadowGeometry='';
  function layout(){
    const host=root.parentElement,W=host.clientWidth,H=host.clientHeight,portrait=H>W;
    root.dataset.sceneLayout=portrait?'portrait':'landscape';
    if(!portrait)return;
    const style=getComputedStyle(root),w=W-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight),h=H-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
    const header=W<500?48:60,available=h-header,compact=available<480,sw=clamp(compact?44:64,Math.min(w*.21,available*.14),100),hw=clamp(compact?76:105,Math.min(w*.42,available*.28),180);
    const gutter=10,topMin=sw*1.4+18,bottomMin=hw*.9+24;
    const size=Math.max(1,Math.min(w-2*gutter,available-topMin-bottomMin)),extra=Math.max(0,available-size-topMin-bottomMin),top=topMin+extra*.3,bottom=available-top-size,x=(w-size)/2;
    px('header',header);px('height',available);px('board-x',x);px('board-y',top);px('board-size',size);
    const sx=x+size*.09,sy=sw*.75+4+(top-topMin)*.35;
    px('source-x',sx);px('source-y',sy);px('source-size',sw);
    // Slots derive from the destination list; no extra consumers are created here.
    slots.forEach(slot=>{const width=Math.min(hw,w*.46),height=width*500/640,gx=Math.min(w-gutter-width,x+size*.53-width*.0875),gy=top+size+Math.max(12,(bottom-height)*.23);slot.element.style.setProperty('--scene-goal-x',`${gx}px`);slot.element.style.setProperty('--scene-goal-y',`${gy}px`);slot.element.style.setProperty('--scene-goal-size',`${width}px`);});
    const first=slots[0].element,gx=parseFloat(first.style.getPropertyValue('--scene-goal-x')),gy=parseFloat(first.style.getPropertyValue('--scene-goal-y'));
    px('pine-x',sx-sw*.75);px('pine-y',Math.max(-12,sy-sw*1.65));px('pine-size',sw*1.8);
    px('tree-x',gx+hw*.45);px('tree-y',gy-hw*.42);px('tree-size',hw*.75);
  }
  function rounded(points,r){const clean=points.filter((point,index)=>!index||Math.hypot(point[0]-points[index-1][0],point[1]-points[index-1][1])>.1);let d=`M${clean[0].join(',')}`;for(let i=1;i<clean.length-1;i++){const a=clean[i-1],b=clean[i],c=clean[i+1],l1=Math.hypot(b[0]-a[0],b[1]-a[1]),l2=Math.hypot(c[0]-b[0],c[1]-b[1]),n=Math.min(r,l1/2,l2/2),p=[b[0]+(a[0]-b[0])/l1*n,b[1]+(a[1]-b[1])/l1*n],q=[b[0]+(c[0]-b[0])/l2*n,b[1]+(c[1]-b[1])/l2*n];d+=`L${p.join(',')}Q${b.join(',')} ${q.join(',')}`;}return d+`L${clean.at(-1).join(',')}`;}
  function pipe(container,key,points,scale,bounds,source=false){
    let feed=container.querySelector(source?'.source-feed':`.goal-feed[data-house='${key}']`);
    if(!feed){feed=document.createElement('span');feed.className='feed goal-feed';feed.dataset.house=key;container.prepend(feed);}
    Object.assign(feed.style,{left:'0px',right:'auto',top:'0px',width:`${bounds.width}px`,height:`${bounds.height}px`});
    let art=feed.querySelector('.feed-art');if(!art){art=node('svg',{class:'feed-art','aria-hidden':'true'});feed.prepend(art);appendPipeLayers(art,'M0,0H1');art.append(node('path',{class:source?'scene-source-current':'scene-goal-current',fill:'none',stroke:'#ffd47e'}));}
    art.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
    const d=rounded(points,18*scale),widths=[27,23,20,15,1.1,6];
    [...art.children].forEach((p,i)=>{p.setAttribute('d',d);p.style.strokeWidth=String(widths[i]*scale);if(i===4)p.setAttribute('transform',`translate(${-3*scale},${-3*scale})`);});
    paths.set(source?'source':`goal-${key}`,{points:points.map(([x,y])=>[x+bounds.left,y+bounds.top]),diameter:27*scale});
    return {d,art};
  }
  function collar(container,selector,className,x,y,scale,index){let s=container.querySelector(selector);if(!s){s=node('svg',{class:className,'aria-hidden':'true',viewBox:'-5 -14.5 10 29',...(index===undefined?{}:{'data-house':index})});s.append(collarSleeve());container.append(s);}Object.assign(s.style,{left:`${x}px`,top:`${y}px`,width:`${10*scale}px`,height:`${29*scale}px`,transform:`translate(-50%,-50%)${root.dataset.sceneLayout==='portrait'?' rotate(90deg)':''}`});}
  function updateFeeds(){
    const portrait=root.dataset.sceneLayout==='portrait',board=svg.getBoundingClientRect(),a=sourceSide.getBoundingClientRect(),b=goalSide.getBoundingClientRect(),scale=board.width/(level.size*100),s=getComputedStyle(sourceButton),sw=parseFloat(s.width),sh=parseFloat(s.height),sx=parseFloat(s.left),sy=parseFloat(s.top),sourceY=board.top-a.top+(Math.floor(level.source.index/level.size)+.5)*board.height/level.size;
    const houses=slots.map(slot=>slot.element.getBoundingClientRect()),key=[portrait,board.x,board.y,board.width,a.x,a.y,a.width,a.height,b.x,b.y,b.width,b.height,sx,sy,sw,...houses.flatMap(h=>[h.x,h.y,h.width,h.height])].join(',');
    if(key===geometry)return;geometry=key;
    const plinth=root.querySelector('.source-plinth'),plLeft=Math.max(-a.left,sx-sw*.08),plRight=portrait?sx+sw*1.08:Math.min(board.left-a.left-2,sx+sw*1.08);
    Object.assign(plinth.style,{left:`${plLeft}px`,top:`${sy+sh*.485}px`,width:`${plRight-plLeft}px`,height:`${Math.max(4,sw*.09)}px`});
    const sourceX=board.left-a.left,topX=sourceX+board.width-(Math.floor(level.source.index/level.size)+.5)*board.width/level.size,topY=board.top-a.top,bendY=topY-18*scale;
    const sourcePoints=portrait?[[sx+sw*.5,sy+sw*.4],[sx+sw*.5,bendY],[topX,bendY],[topX,topY]]:[[sx+sw*.73,sourceY],[sourceX,sourceY]];
    pipe(sourceSide,0,sourcePoints,scale,a,true);collar(sourceSide,'.source-feed-collar','source-feed-collar',portrait?topX:sourceX-5*scale,portrait?topY-5*scale:sourceY,scale);
    let flow=goalSide.querySelector('.external-feed-flow');if(!flow){flow=node('svg',{class:'external-feed-flow','aria-hidden':'true'});goalSide.append(flow);}flow.setAttribute('viewBox',`0 0 ${b.width} ${b.height}`);
    const feeds=slots.map((slot,i)=>{
      const h=houses[i],startX=board.right-b.left,startY=board.top-b.top+(Math.floor(slot.goal.index/level.size)+.5)*board.height/level.size;
      const endY=portrait?h.top-b.top+h.height*.75:startY,endX=h.left-b.left+h.width*.32,bottomX=board.left-b.left+board.width-(Math.floor(slot.goal.index/level.size)+.5)*board.width/level.size,bottomY=board.bottom-b.top;
      const points=portrait?[[bottomX,bottomY],[bottomX,endY],[endX,endY]]:[[startX,startY],[endX,endY]],{d}=pipe(goalSide,i,points,scale,b);
      collar(goalSide,`.house-feed-collar[data-house='${i}']`,'house-feed-collar',portrait?bottomX:startX+5*scale,portrait?bottomY+5*scale:startY,scale,i);
      const flare=goalSide.querySelector(`.house-feed-flare[data-house='${i}']`);if(flare){Object.assign(flare.style,{left:`${h.left-b.left+h.width*.075}px`,top:`${endY}px`});flare.style.setProperty('--inlet-flare-size',`${Math.max(9,24*scale)}px`);}
      let group=flow.querySelector(`[data-goal='${slot.goal.index}']`);if(!group){group=node('g',{'data-goal':slot.goal.index});group.append(node('path',{class:'external-ready-base',fill:'none',stroke:'#ffd47e',opacity:0}));const ray=node('g',{class:'external-feed-ray',opacity:0});for(const[f,color,opacity]of [[.44,'#ffc255',.3],[.22,'#ffda87',1],[.08,'#fff2c4',.85]])ray.append(node('path',{fill:'none',stroke:color,'stroke-linecap':'round','data-width':f,opacity}));group.append(ray);flow.append(group);}
      const base=group.querySelector('.external-ready-base'),ray=group.querySelector('.external-feed-ray'),rayPaths=[...ray.children];base.setAttribute('d',d);base.setAttribute('stroke-width',6*scale);const length=base.getTotalLength()/scale;
      for(const p of rayPaths){p.setAttribute('d',d);p.setAttribute('pathLength',length);p.setAttribute('stroke-width',27*scale*Number(p.dataset.width));}
      return {goalIndex:slot.goal.index,length,base,ray,paths:rayPaths};
    });energy.setExternalFeeds(feeds);
  }
  root.sceneGuideTargets=kind=>{const selected=kind==='source'?[paths.get('source')]:[...paths.entries()].filter(([key])=>key.startsWith('goal-')).map(([,value])=>value),result=[];for(const path of selected){if(!path)continue;const r=path.diameter/2;for(let i=1;i<path.points.length;i++){const a=path.points[i-1],b=path.points[i];result.push({x:Math.min(a[0],b[0])-r,y:Math.min(a[1],b[1])-r,width:Math.abs(a[0]-b[0])+2*r,height:Math.abs(a[1]-b[1])+2*r});}}return result;};
  function tooltip(element){if(root.dataset.sceneLayout!=='portrait'){element.style.width='';return false;}const s=sourceButton.getBoundingClientRect(),r=root.getBoundingClientRect(),room=r.right-s.right-16,w=Math.min(230,Math.max(150,room));element.style.width=`${w}px`;element.style.left=`${Math.min(r.width-w-8,s.right-r.left+12)}px`;element.style.top=`${Math.max(8,s.top-r.top-element.offsetHeight*.12)}px`;return true;}
  function drawMeadow(art){
    if(root.dataset.sceneLayout!=='portrait'){meadowGeometry='';return false;}
    const bounds=stage.getBoundingClientRect(),board=svg.getBoundingClientRect(),s=sourceButton.getBoundingClientRect(),h=slots[0].element.getBoundingClientRect(),W=root.parentElement.clientWidth,H=root.parentElement.clientHeight,key=[W,H,board.y,board.width,s.x,s.y,s.width,h.x,h.y,h.width].join(',');if(key===meadowGeometry)return true;meadowGeometry=key;
    const make=(tag,attrs)=>node(tag,attrs),add=(tag,attrs)=>{const e=make(tag,attrs);art.append(e);return e;},bush=root.querySelector('.source-bush').src,pine=root.querySelector('.pine').src;
    art.setAttribute('viewBox',`0 0 ${W} ${H}`);art.replaceChildren();
    const defs=make('defs',{});defs.innerHTML='<linearGradient id="scene-soil" x2="0" y2="1"><stop stop-color="#32604d"/><stop offset="1" stop-color="#123b3e"/></linearGradient>';art.append(defs);
    const floor=s.bottom+6,base=h.bottom;
    add('path',{d:`M0 ${floor+8}Q${W*.25} ${floor-15} ${W*.52} ${floor+5}T${W} ${floor}V${H}H0Z`,fill:'url(#scene-soil)'});
    for(const [x,y,w]of [[W*.42,floor+12,W*.17],[W*.72,floor+14,W*.16],[W*.84,base-24,W*.22]])add('image',{href:pine,x,y:y-w*1.8,width:w,height:w*1.8,opacity:'.16'});
    for(let i=0;i<4;i++){const y=board.bottom+(H-board.bottom)*i/4;add('path',{d:`M0 ${y+20}Q${W*.32} ${y-25} ${W*.65} ${y+4}T${W} ${y+12}V${y+55}Q${W*.6} ${y+30} 0 ${y+50}Z`,fill:i%2?'#1b4942':'#32634f',opacity:'.52'});}
    const door=h.left+h.width*.585,depth=Math.max(24,H-base),track=add('path',{d:`M${door} ${base-2}C${door-20} ${base+depth*.25} ${W*.42} ${base+depth*.45} ${W*.57} ${H+12}`,fill:'none',stroke:'#657655','stroke-width':Math.min(22,W*.045),'stroke-linecap':'round'}),len=track.getTotalLength();
    for(const t of [.12,.4,.68,.9]){const p=track.getPointAtLength(t*len);add('ellipse',{cx:p.x,cy:p.y,rx:Math.min(12,W*.025)*(1+t*.4),ry:Math.min(4,W*.009),fill:'#a0a07b',opacity:'.7'});}
    for(const [x,y,w]of [[s.left-20,floor+6,s.width*.65],[s.right+18,floor+4,s.width*.7],[W*.18,H-8,W*.4],[h.left-22,base+5,h.width*.53],[Math.min(W-20,h.right+10),base+10,h.width*.5]])add('image',{href:bush,x:x-w/2,y:y-w*.5,width:w,height:w*.5,opacity:'.85'});
    for(let i=0;i<20;i++){const x=(i*47%97)/100*W,y=board.bottom+10+(i*29%93)/100*(H-board.bottom);if(x>h.left-10&&x<h.right+10&&y<h.bottom+8)continue;const z=clamp(3,W*.012,8);add('path',{d:`M${x} ${y}q${-z} ${-z} ${-z} ${-z*2}l${z} ${z}l${z*.4} ${-z*1.5}l${z*.4} ${z*1.7}l${z} ${-z}l${-z*.5} ${z*1.8}Z`,fill:i%2?'#426c50':'#193f3b'});}
    return true;
  }
  root.sceneGoalAnchor=()=>{if(root.dataset.sceneLayout!=='portrait')return null;const b=svg.getBoundingClientRect();return{x:b.left+b.width-(Math.floor(level.goal.index/level.size)+.5)*b.width/level.size,y:b.bottom};};
  root.sceneMeadow=drawMeadow;
  return {layout,updateFeeds,tooltip};
}
