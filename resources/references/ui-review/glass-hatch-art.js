// Both straight and mockup elbows share their artwork, mask and current path.
const hatchTurns = { W: 0, N: 1, E: 2, S: 3 };
export function glassHatchPipePath(index, side, size, inset = 0, reverse = false, style = '') {
  const cx=index%size*100+50,cy=Math.floor(index/size)*100+50,q=hatchTurns[side];
  const point=([x,y])=>{for(let i=0;i<q;i++)[x,y]=[-y,x];return [cx+x,cy+y].join(',');};
  if(style==='mockup'){
    const p=[[-50+inset,0],[-20,0],[8,0],[8,18],[8,22]].map(([x,y])=>side==='E'?[cx-x,cy+y].join(','):point([x,y]));
    return reverse?`M${p[4]}L${p[3]}Q${p[2]} ${p[1]}L${p[0]}`:`M${p[0]}L${p[1]}Q${p[2]} ${p[3]}L${p[4]}`;
  }
  const p=[[-50+inset,0],[0,0]].map(point);
  return reverse?`M${p[1]}L${p[0]}`:`M${p[0]}L${p[1]}`;
}

export function createGlassHatchArt({node,index,cx,cy,side,number,symbol,style}) {
  const mockup=style==='mockup',mirrored=mockup&&side==='E',offsetX=mockup?(mirrored?-8:8):0,offsetY=mockup?18:0,pose=`translate(${cx+offsetX} ${cy+offsetY})`;
  // A first path also keeps the existing persistent-cell renderer's geometry gate.
  const shadow=node('path',{class:'hatch-ground-shadow',d:`M${cx+offsetX-31},${cy+offsetY+11}a31,8 0 1,0 62,0a31,8 0 1,0 -62,0`});
  const back=node('g',{class:'hatch-back',transform:pose});
  const backGlyph=node('g',{class:'hatch-glyph'}),well=node('g',{class:'hatch-scene-body'});
  well.append(node('ellipse',{class:'hatch-rim-depth',cx:0,cy:5,rx:29,ry:19}),
    node('ellipse',{class:'hatch-rim',cx:0,cy:0,rx:29,ry:19}),
    node('ellipse',{class:'hatch-well',cx:0,cy:0,rx:22,ry:13}),
    node('path',{class:'hatch-well-wall',d:'M-20,0Q0,17 20,0V6Q0,23 -20,6Z'}));
  backGlyph.append(well);back.append(backGlyph);
  const front=node('g',{class:'hatch-mark','data-cell':index,'data-pair':number,transform:pose});
  const frontGlyph=node('g',{class:'hatch-glyph'}),body=node('g',{class:'hatch-scene-body'});
  body.append(node('path',{class:'hatch-front-depth',d:'M-29,0A29,19 0 0,0 29,0V5A29,19 0 0,1 -29,5Z'}),
    node('path',{class:'hatch-front-rim',d:'M-29,0A29,19 0 0,0 29,0L22,0A22,13 0 0,1 -22,0Z'}),
    node('path',{class:'hatch-front-highlight',d:'M-25,7Q0,25 25,7'}));
  // The lid stands beside the opening instead of covering the pipe mouth.
  const lid=node('g',{class:'hatch-raised-lid',...(mockup?{transform:mirrored?'translate(-7 0) scale(-.82 .82)':'translate(7 0) scale(.82)'}:{})});
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
