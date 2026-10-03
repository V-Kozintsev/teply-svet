// One elbow geometry positions the glass, current, mask and open well together.
function hatchLayout(side, inset = 0) {
  const mirrored=side==='E'||side==='S',vertical=side==='N'||side==='S';
  const points=vertical?[[0,-50+inset],[0,-20],[0,0],[8,0],[8,18],[8,22]]:[[-50+inset,0],[-20,0],[8,0],[8,18],[8,22]];
  const orient=([x,y])=>[mirrored?-x:x,side==='S'?-y:y];
  return {mirrored,offset:orient([8,18]),points:points.map(orient)};
}
export function glassHatchPipePath(index, side, size, inset = 0, reverse = false) {
  const cx=index%size*100+50,cy=Math.floor(index/size)*100+50;
  const p=hatchLayout(side,inset).points.map(([x,y])=>[cx+x,cy+y].join(','));
  if(p.length===6)return reverse?`M${p[5]}L${p[4]}C${p[3]} ${p[2]} ${p[1]}L${p[0]}`:`M${p[0]}L${p[1]}C${p[2]} ${p[3]} ${p[4]}L${p[5]}`;
  return reverse?`M${p[4]}L${p[3]}Q${p[2]} ${p[1]}L${p[0]}`:`M${p[0]}L${p[1]}Q${p[2]} ${p[3]}L${p[4]}`;
}

export function glassHatchPairTone(number) {
  return number%2===1?{color:'#bd9aeb',face:'#614d7c',shade:'#44344f',name:'сиреневый'}:{color:'#a3d88b',face:'#4e7042',shade:'#344d30',name:'зелёный'};
}

export function createGlassHatchArt({node,index,cx,cy,side,number,symbol,colored=false}) {
  const {mirrored,offset:[offsetX,offsetY]}=hatchLayout(side),pose=`translate(${cx+offsetX} ${cy+offsetY})`;
  const tone=glassHatchPairTone(number),tint=colored?{'data-pair-color':tone.name,style:`--hatch-pair-color:${tone.color};--hatch-pair-face:${tone.face};--hatch-pair-shade:${tone.shade}`}:{ };
  // A first path also keeps the existing persistent-cell renderer's geometry gate.
  const shadow=node('path',{class:'hatch-ground-shadow',d:`M${cx+offsetX-31},${cy+offsetY+11}a31,8 0 1,0 62,0a31,8 0 1,0 -62,0`});
  const back=node('g',{class:'hatch-back',transform:pose,...tint});
  const backGlyph=node('g',{class:'hatch-glyph'}),well=node('g',{class:'hatch-scene-body'});
  well.append(node('ellipse',{class:'hatch-rim-depth',cx:0,cy:5,rx:29,ry:19}),
    node('ellipse',{class:'hatch-rim',cx:0,cy:0,rx:29,ry:19}),
    node('ellipse',{class:'hatch-well',cx:0,cy:0,rx:22,ry:13}),
    node('path',{class:'hatch-well-wall',d:'M-20,0Q0,17 20,0V6Q0,23 -20,6Z'}));
  backGlyph.append(well);back.append(backGlyph);
  const front=node('g',{class:'hatch-mark','data-cell':index,'data-pair':number,transform:pose,...tint});
  const frontGlyph=node('g',{class:'hatch-glyph'}),body=node('g',{class:'hatch-scene-body'});
  body.append(node('path',{class:'hatch-front-depth',d:'M-29,0A29,19 0 0,0 29,0V5A29,19 0 0,1 -29,5Z'}),
    node('path',{class:'hatch-front-rim',d:'M-29,0A29,19 0 0,0 29,0L22,0A22,13 0 0,1 -22,0Z'}),
    node('path',{class:'hatch-front-highlight',d:'M-25,7Q0,25 25,7'}));
  // The lid stands beside the opening instead of covering the pipe mouth.
  const lid=node('g',{class:'hatch-raised-lid','data-mirrored':String(mirrored),transform:mirrored?'translate(-3 0) scale(-.82 .82)':'translate(3 0) scale(.82)'});
  lid.append(node('rect',{class:'hatch-hinge',x:21,y:-9,width:15,height:8,rx:2}),
    node('ellipse',{class:'hatch-lid-depth',cx:36,cy:-17,rx:10,ry:27}),
    node('ellipse',{class:'hatch-lid-rim',cx:32,cy:-18,rx:10,ry:27}),
    node('ellipse',{class:'hatch-lid-face',cx:32,cy:-18,rx:6.7,ry:21}),
    node('path',{class:'hatch-lid-highlight',d:'M31,-39Q23,-23 27,-3'}));
  for(const y of [-32,-3])lid.append(node('circle',{class:'hatch-lid-bolt',cx:34,cy:y,r:1.6}));
  if(symbol)lid.append(node('path',{class:'hatch-pair-mark',d:symbol==='triangle'?'M32,-23L36,-15H28Z':'M32,-24L36,-18L32,-12L28,-18Z'}));
  body.append(lid);
  frontGlyph.append(body);front.append(frontGlyph);
  return {shadow,back,front};
}
