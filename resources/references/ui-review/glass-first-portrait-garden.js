// A portrait-only garden, measured in document coordinates. No animation or turn work.
function drawMeadow(art) {
  const environment=art.parentElement;
  if(root.dataset.sceneLayout!=='portrait'){
    meadowGeometry='';delete environment.dataset.garden;
    for(const property of ['position','top','height'])environment.style.removeProperty(property);
    return false;
  }
  const frame=root.getBoundingClientRect(),W=document.documentElement.clientWidth,H=Math.max(frame.height,innerHeight);
  const local=element=>{const r=element.getBoundingClientRect();return{x:r.left,y:r.top-frame.top,width:r.width,height:r.height,right:r.right,bottom:r.bottom-frame.top};};
  const board=local(svg),source=local(sourceButton),plinth=local(root.querySelector('.source-plinth')),house=local(slots[0].element),header=local(root.querySelector('.level-header'));
  const key=[W,H,board.y,board.height,source.x,source.y,source.width,plinth.bottom,house.x,house.y,house.width].join(',');
  if(key===meadowGeometry)return true;meadowGeometry=key;
  environment.dataset.garden='first-portrait';
  Object.assign(environment.style,{position:'absolute',top:`${frame.top+scrollY}px`,height:`${H}px`});
  art.setAttribute('viewBox',`0 0 ${W} ${H}`);art.replaceChildren();
  const make=(tag,attrs={})=>node(tag,attrs),add=(parent,tag,attrs)=>{const e=make(tag,attrs);parent.append(e);return e;};
  const path=(parent,d,fill,attrs={})=>add(parent,'path',{d,fill,...attrs});
  const defs=add(art,'defs',{});
  defs.innerHTML=`
    <linearGradient id="portrait-sky" x2="0" y2="1"><stop stop-color="#0a3040"/><stop offset=".6" stop-color="#123f47"/><stop offset="1" stop-color="#174547"/></linearGradient>
    <radialGradient id="portrait-air"><stop stop-color="#3a7370" stop-opacity=".2"/><stop offset="1" stop-color="#183f49" stop-opacity="0"/></radialGradient>
    <linearGradient id="portrait-lawn" x2="0" y2="1"><stop stop-color="#315f4b"/><stop offset="1" stop-color="#173f3f"/></linearGradient>
    <linearGradient id="portrait-trail" x2="0" y2="1"><stop stop-color="#8b895f"/><stop offset="1" stop-color="#64764f"/></linearGradient>
    <g id="portrait-pine"><path d="M-3 0H4V-28L33-22 20-48 29-45 12-70 22-66 0-115-20-67-10-70-29-44-18-46-35-22-3-27Z" fill="currentColor"/><path d="M0-115 5-66 12-70 4-47 20-48 7-24 33-22 4-28V0H0Z" fill="#061f2c" opacity=".25"/></g>
    <g id="portrait-bush"><path d="M-48 0Q-63-9-52-25Q-56-43-39-42Q-36-61-21-49Q-18-73-1-60Q16-79 27-53Q47-62 46-40Q65-39 57-20Q71-4 47 0Z" fill="currentColor"/><path d="M-40 0Q-48-16-34-23Q-32-42-17-32Q-6-49 8-37Q23-51 28-30Q48-29 40-12Q53-2 36 0Z" fill="#0b3a37" opacity=".5"/></g>
    <g id="portrait-grass"><path d="M-8 0Q-15-8-16-16Q-5-12-2-2Q-4-19 3-23Q6-12 3-2Q13-15 18-15Q13-4 8 0Z" fill="currentColor"/></g>
    <g id="portrait-flower"><path d="M0 0Q-2-6 0-13" fill="none" stroke="#668354" stroke-width="2"/><g fill="#e4d7a3"><ellipse cy="-18" rx="2.5" ry="4"/><ellipse cx="5" cy="-13" rx="4" ry="2.5"/><ellipse cy="-8" rx="2.5" ry="4"/><ellipse cx="-5" cy="-13" rx="4" ry="2.5"/></g><circle cy="-13" r="2" fill="#ad9351"/></g>
    <g id="portrait-rock"><ellipse cy="2" rx="13" ry="4" fill="#0d3437" opacity=".7"/><path d="M-12 0-7-7 3-9 10-4 13 1Q0 6-12 0Z" fill="#53776b"/><path d="M-7-7 3-9 8-4-3-3Z" fill="#718b74"/></g>`;
  const upperClip=add(defs,'clipPath',{id:'portrait-upper'});add(upperClip,'rect',{width:W,height:board.y+2});
  const lowerClip=add(defs,'clipPath',{id:'portrait-lower'});add(lowerClip,'rect',{y:board.bottom-2,width:W,height:H-board.bottom+2});
  const place=(parent,id,x,y,size,color)=>add(parent,'use',{href:`#portrait-${id}`,transform:`translate(${x} ${y}) scale(${size})`,...(color?{color}:{})});
  const livingPine=(parent,x,y,size,color)=>{const group=add(parent,'g',{transform:`translate(${x} ${y}) scale(${size})`});return add(group,'use',{href:'#portrait-pine',color,'data-scenery-art':'tree'});};
  add(art,'rect',{width:W,height:H,fill:'url(#portrait-sky)'});
  add(art,'ellipse',{cx:W*.5,cy:plinth.bottom,rx:W*.68,ry:Math.max(150,plinth.bottom),fill:'url(#portrait-air)'});
  const upper=add(art,'g',{'clip-path':'url(#portrait-upper)','data-garden-region':'source'});
  const floor=plinth.bottom+2,topRoom=Math.max(40,floor-header.bottom),scale=W/492;
  // Soft clouds and receding tree lines leave the title and interactive source clear.
  for(const[x,y,size]of [[W*.035,header.bottom+topRoom*.22,Math.min(W*.22,topRoom*.7)],[W*.94,header.bottom+topRoom*.52,Math.min(W*.18,topRoom*.55)]]){
    path(upper,'M-60 8Q-75-3-61-14Q-61-30-45-30Q-38-49-18-36Q-1-42 6-25Q27-24 29-8Q51-8 57 8Z','#467480',{transform:`translate(${x} ${y}) scale(${size/100})`,opacity:'.2'});
  }
  for(let band=0;band<2;band++){
    const base=floor+12+band*10;
    path(upper,`M0 ${base-topRoom*.22}Q${W*.2} ${base-topRoom*.52} ${W*.43} ${base-topRoom*.14}T${W} ${base-topRoom*.26}V${board.y+4}H0Z`,band?'#123d45':'#103945');
    for(let i=0;i<13;i++){
      const height=topRoom*(.23+((i*7)%9)*.021+band*.07);
      place(upper,'pine',W*(i/12),base,height/115,band?'#103c42':'#0f3541');
    }
  }
  const pineHeight=Math.min(W*.41,Math.max(48,topRoom-8));
  livingPine(upper,source.x+source.width*.5-W*.235,floor,pineHeight/115,'#215748');
  place(upper,'pine',W*.87,floor+7,pineHeight*.68/115,'#194b44');
  const moonSize=Math.min(clamp(22,W*.078,48),topRoom*.48),moonY=header.bottom+Math.max(8,topRoom*.14);
  add(upper,'image',{href:root.querySelector('.moon').src,x:W*.8-moonSize/2,y:moonY,width:moonSize,height:moonSize,'data-scenery-art':'moon'});
  path(upper,`M0 ${floor+W*.047}Q${W*.24} ${floor-W*.055} ${W*.51} ${floor+1}T${W} ${floor+W*.05}V${board.y+4}H0Z`,'url(#portrait-lawn)',{'data-source-ground':true,'data-ground-y':floor});
  path(upper,`M0 ${floor+W*.072}Q${W*.32} ${floor-2} ${W*.6} ${floor+W*.04}T${W} ${floor+W*.067}V${board.y+4}H0Z`,'#285846',{opacity:'.55'});
  for(const[x,size]of [[source.x-source.width*.3,source.width*.0065],[source.right+source.width*.3,source.width*.007]])place(upper,'bush',x,floor+2,size,'#287049');
  for(const[u,v]of [[.2,8],[.29,14],[.68,10],[.75,5]])place(upper,'grass',W*u,Math.min(board.y-3,floor+v*scale),Math.min(.52,scale*.4),'#467654');

  const lower=add(art,'g',{'clip-path':'url(#portrait-lower)','data-garden-region':'house'}),base=house.bottom-1,depth=Math.max(8,H-base),hw=house.width;
  // A separate grove and lawn surround the real house; the board remains unobscured.
  for(let band=0;band<3;band++){
    const y=base+band*5,colors=['#123b45','#15464a','#1c4f46'];
    path(lower,`M0 ${y-hw*.35}Q${W*.18} ${y-hw*.8} ${W*.4} ${y-hw*.33}T${W} ${y-hw*.5}V${H}H0Z`,colors[band]);
    for(let i=0;i<13;i++){
      const size=hw*(.46+((i*7)%11)*.045+band*.07)/115;
      place(lower,i%4===1?'bush':'pine',W*i/12,y,size,colors[band]);
    }
  }
  place(lower,'pine',house.x-hw*.55,base+4,Math.min(hw*1.08,H-board.bottom)/115,'#174b42');
  livingPine(lower,house.right+hw*.78,base+1,hw*1.03/115,'#174b42');
  path(lower,`M0 ${base+hw*.09}Q${W*.25} ${base-hw*.22} ${W*.53} ${base-2}T${W} ${base+hw*.055}V${H+2}H0Z`,'url(#portrait-lawn)',{'data-house-ground':true,'data-ground-y':base});
  path(lower,`M0 ${base+depth*.23}Q${W*.25} ${base+depth*.06} ${W*.6} ${base+depth*.27}T${W} ${base+depth*.15}V${H+2}H0Z`,'#245446',{opacity:'.62'});
  const door=house.x+hw*468/640,amplitude=Math.min(W*.1,depth*.35),center=t=>({x:door+amplitude*(-.55*Math.sin(t*Math.PI*2.15)+t*.12),y:base+depth*t}),half=t=>hw*.05+Math.min(W*.06,depth*.19)*t;
  const left=[],right=[];
  for(let i=0;i<=48;i++){const t=i/48,p=center(t);left.push(`${p.x-half(t)},${p.y}`);right.push(`${p.x+half(t)},${p.y}`);}
  path(lower,`M${left.join('L')}L${right.reverse().join('L')}Z`,'url(#portrait-trail)',{'data-meadow-door':0,'data-door-x':door,'data-door-y':base});
  const stoneCount=Math.min(8,Math.floor(depth/18));
  for(let i=0;i<stoneCount;i++){
    const t=(i+.6)/stoneCount,p=center(t),rx=half(t)*.66,ry=Math.min(depth*.028,hw*.038)*(0.6+t*.6);
    add(lower,'ellipse',{cx:p.x,cy:p.y+1.4,rx:rx*1.06,ry:ry*1.1,fill:'#344f3b',opacity:'.45'});
    add(lower,'ellipse',{cx:p.x,cy:p.y,rx,ry,fill:i%2?'#a0a17a':'#91966f',transform:`rotate(${i%2?7:-6} ${p.x} ${p.y})`});
  }
  for(const[x,y,size,color]of [[house.x-hw*.20,base+5,hw*.008,'#286f4e'],[house.x-hw*.44,base+8,hw*.0048,'#205e49'],[house.right+hw*.17,base+5,hw*.0085,'#28714d'],[house.right+hw*.43,base+7,hw*.0045,'#215e46']])place(lower,'bush',x,y,size,color);
  for(let i=0;i<38;i++){
    const t=((i*29+13)%97)/100,x=((i*43+7)%101)/100*W,y=base+depth*t,p=center(t),size=Math.min(.58,scale*.4)*(0.65+t*.6);
    if(Math.abs(x-p.x)<half(t)+18*size||y<base+8&&x>house.x-10&&x<house.right+10)continue;
    place(lower,'grass',x,y,size,i%3?'#3d704e':'#285944');
  }
  if(depth>30){
    for(const[u,t]of [[.3,.24],[.72,.35],[.38,.77]]){const x=W*u,y=base+depth*t,p=center(t);if(Math.abs(x-p.x)>half(t)+15)place(lower,'flower',x,y,Math.min(.75,scale*.7,depth/85));}
    for(const[u,t,size]of [[.35,.45,.9],[.66,.39,.45],[.77,.78,.7]]){const x=W*u,y=base+depth*t,p=center(t);if(Math.abs(x-p.x)>half(t)+16)place(lower,'rock',x,y,Math.min(.9,scale*.65)*size);}
  }
  // The near leaves grow only into spare foreground, never into the board or doorway.
  if(depth>35){
    const leafHeight=Math.min(W*.23,depth*.7),leafScale=leafHeight/90;
    for(const[x,mirror]of [[W*.05,1],[W*.96,-1]]){
      const leaves=add(lower,'g',{transform:`translate(${x} ${H+14*leafScale}) scale(${leafScale*mirror} ${leafScale})`});
      for(const[i,angle]of [-66,-44,-23,-5,20,43,66].entries())path(leaves,'M0 0C-20-27-24-74-9-87C12-102 27-51 0 0Z',i%2?'#0d393d':'#0a323a',{transform:`rotate(${angle}) scale(${.8+(i%3)*.13})`});
    }
  }
  return true;
}
