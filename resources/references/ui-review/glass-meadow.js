// Static vector scenery, measured from the existing house and source anchors.
// Resize redraws this decorative layer only; puzzle nodes and state are untouched.
export function createGlassMeadow(root) {
  const stage=root.querySelector('.level-stage'),ns='http://www.w3.org/2000/svg';
  const el=(tag,attrs={})=>{const e=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,String(v));return e;};
  const environment=document.createElement('div');environment.className='level-environment';environment.setAttribute('aria-hidden','true');root.before(environment);
  const art=el('svg',{class:'meadow-art','aria-hidden':'true',focusable:'false'});environment.append(art);root.dataset.meadow='true';
  const bush=root.querySelector('.source-bush').src;
  const path=(d,fill,extra={})=>{const e=el('path',{d,fill,...extra});art.append(e);return e;};
  let lastGeometry='';
  function draw(){
    const bounds=stage.getBoundingClientRect(),w=bounds.width,h=bounds.height;if(!w||!h)return;
    const viewportW=document.documentElement.clientWidth,viewportH=window.innerHeight,edgeL=Math.min(-40,-bounds.left-2),edgeR=Math.max(w+40,viewportW-bounds.left+2);
    const source=root.querySelector('.source-unit'),left=root.querySelector('.source-side').getBoundingClientRect(),right=root.querySelector('.goal-side').getBoundingClientRect();
    const houses=[...root.querySelectorAll('.house:not([hidden])')].map(e=>e.getBoundingClientRect());
    const sourceY=source.offsetTop+source.offsetHeight*.5,houseY=Math.min(...houses.map(b=>b.bottom-bounds.top)),floor=Math.min(sourceY,houseY),bottom=Math.max(h+32,viewportH-bounds.top+2);
    const geometry=[viewportW,viewportH,bounds.x,bounds.y,w,h,sourceY,...houses.flatMap(b=>[b.x,b.y,b.width,b.height])].join(',');
    if(geometry===lastGeometry)return;lastGeometry=geometry;
    art.setAttribute('viewBox',`${-bounds.left} ${-bounds.top} ${viewportW} ${viewportH}`);art.replaceChildren();
    const defs=el('defs');defs.innerHTML='<linearGradient id="meadow-soil" x2="0" y2="1"><stop stop-color="#2d5c4c"/><stop offset="1" stop-color="#123c3f"/></linearGradient><linearGradient id="meadow-track" x2="0" y2="1"><stop stop-color="#737e54"/><stop offset="1" stop-color="#4b6151"/></linearGradient><g id="meadow-tuft"><path d="M0 0Q-12-9-15-24Q-3-17 1-5Q0-23 8-33Q9-13 5-3Q13-20 26-21Q13-11 9 0Z" fill="currentColor"/><path d="M2 0Q-2-13-4-16Q4-12 5-2Q9-8 15-11L8 0Z" fill="#74966a" opacity=".24"/></g><g id="meadow-stone"><ellipse cy="2" rx="12" ry="4" fill="#102f34" opacity=".55"/><path d="M-12 0-6-6 3-7 11-2 12 1Q0 6-12 0" fill="#526e68"/><path d="m-9-1 5-4 6-1 5 3-7 2Z" fill="#71857a" opacity=".6"/></g>';
    art.append(defs);
    path(`M${edgeL} ${sourceY+40}Q${(edgeL-40)/2} ${sourceY-5} -40 ${sourceY+14}Q${w*.12} ${floor-34} ${w*.3} ${floor+12}T${w*.66} ${floor+5}Q${w*.86} ${houseY-16} ${w+40} ${houseY+12}Q${(edgeR+w+40)/2} ${houseY-5} ${edgeR} ${houseY+35}V${bottom+30}H${edgeL}Z`,'url(#meadow-soil)');
    for(let band=0;band<4;band++){const y=floor+(bottom-floor)*(band+.4)/4;path(`M${edgeL} ${y+18}Q${(edgeL-40)/2} ${y-15} -40 ${y}Q${w*.15} ${y-35} ${w*.34} ${y+7}T${w*.67} ${y+2}T${w+40} ${y-12}Q${(edgeR+w+40)/2} ${y-22} ${edgeR} ${y+8}L${edgeR} ${y+55}Q${(edgeR+w+40)/2} ${y+20} ${w+40} ${y+45}Q${w*.65} ${y+17} ${w*.4} ${y+38}T-40 ${y+24}Q${(edgeL-40)/2} ${y+45} ${edgeL} ${y+44}Z`,band%2?'#1b4942':'#32634f',{opacity:'.42'});}
    const place=(id,x,y,scale,color)=>art.append(el('use',{href:`#meadow-${id}`,transform:`translate(${x} ${y}) scale(${scale})`,...(color?{color}:{})}));
    const trailSamples=[];
    houses.forEach((house,i)=>{
      const cw=right.width,dx=house.left-bounds.left+house.width*(i===0&&houses.length===2?.49:.585),dy=house.bottom-bounds.top-1,depth=bottom-dy;
      const line=path(`M${dx} ${dy}C${dx-cw*.42} ${dy+depth*.18} ${dx+cw*.43} ${dy+depth*.29} ${dx+cw*.04} ${dy+depth*.47}S${dx-cw*.34} ${dy+depth*.76} ${dx+cw*.06} ${bottom+12}`,'none');
      const length=line.getTotalLength(),a=[],b=[];for(let j=0;j<=48;j++){const t=j/48,p=line.getPointAtLength(t*length),p0=line.getPointAtLength(Math.max(0,t*length-.5)),p1=line.getPointAtLength(Math.min(length,t*length+.5)),vx=p1.x-p0.x,vy=p1.y-p0.y,n=Math.hypot(vx,vy)||1,half=cw*(.025+.115*t);a.push(`${p.x-vy/n*half},${p.y+vx/n*half}`);b.push(`${p.x+vy/n*half},${p.y-vx/n*half}`);trailSamples.push({x:p.x,y:p.y,half});}
      path(`M${a.join('L')}L${b.reverse().join('L')}Z`,'url(#meadow-track)',{opacity:'.85','data-meadow-door':i,'data-door-x':dx,'data-door-y':dy});
      for(const t of [.15,.31,.47,.64,.82]){const p=line.getPointAtLength(t*length);place('stone',p.x,p.y,cw/240*(.42+t*.45));}
      line.remove();
    });
    // Fixed arrangements in the side corridors: no random scenery or animation timers.
    const gardenShift=root.dataset.houseEntryGap==='true'?Math.max(0,houses[0].left-right.left):0;
    const sides=[{x:left.left-bounds.left,width:left.width,top:sourceY},{x:right.left-bounds.left+gardenShift,width:right.width-gardenShift,top:houseY}];
    for(const [sideIndex,side]of sides.entries()){
      const scale=side.width/180,depth=bottom-side.top;
      const clumps=[[.08,.04,.8],[.9,.09,.9],[.25,.22,.65],[.8,.38,.7],[.07,.55,.95],[.91,.67,1.1],[.23,.91,1.05],[.74,1.02,1.1]];
      for(const [j,[u,v,size]]of clumps.entries()){const x=side.x+side.width*u,y=side.top+depth*v;if(trailSamples.some(p=>Math.abs(p.y-y)<12*scale&&Math.abs(p.x-x)<p.half+18*scale))continue;
        const image=el('image',{href:bush,x:x-side.width*size*.4,y:y-side.width*size*.37,width:side.width*size*.8,height:side.width*size*.4,opacity:'.9',style:'filter:brightness(.67) saturate(.65)'});art.append(image);
        place('tuft',x+side.width*.08,y+5*scale,scale*(.58+v*.5),j%2?'#1a4541':'#436e50');
      }
      for(let j=0;j<15;j++){const u=((j*37+sideIndex*13)%97)/100,v=((j*29+7)%101)/100,x=side.x+side.width*u,y=side.top+depth*v;if(trailSamples.some(p=>Math.abs(p.y-y)<15*scale&&Math.abs(p.x-x)<p.half+15*scale))continue;place(j%5===0?'stone':'tuft',x,y,scale*(.35+.55*v),j%3?'#17413e':'#50744e');}
    }
    // Sparse outer silhouettes use the existing bush asset; tight screens add none.
    const outer=[{start:edgeL,end:Math.min(-30,edgeL+Math.max(0,bounds.left-55)),top:sourceY},{start:w+45,end:edgeR,top:houseY}];
    for(const [sideIndex,side]of outer.entries()){
      const space=side.end-side.start,count=space<80?0:Math.min(4,Math.floor(space/125)+1);
      for(let j=0;j<count;j++){
        const t=(j+.45)/count,x=side.start+space*t,y=side.top+35+(bottom-side.top)*(.2+((j*37+sideIndex*17)%65)/100),size=Math.min(180,w*.15,space*.65);
        art.append(el('image',{href:bush,x:x-size*.5,y:y-size*.43,width:size,height:size*.5,opacity:'.28'}));
        if(space>160)place('tuft',x+size*.22,y+size*.04,Math.min(.8,w/1500),'#204840');
      }
    }
    // A few low foreground blades remain below, never over, the board frame.
    for(let j=0;j<9;j++)place('tuft',w*(j+.35)/9,h+28,w/1300,j%2?'#17413c':'#0e3037');
  }
  window.addEventListener('resize',draw);
  for(const img of root.querySelectorAll('.house>img'))if(!img.complete)img.addEventListener('load',draw,{once:true});
  return {draw};
}
