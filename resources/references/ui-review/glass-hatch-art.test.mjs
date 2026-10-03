import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {glassHatchPipePath,createGlassHatchArt} from './glass-hatch-art.js';
import {glassLevels} from './glass-energy.js';
test('every hatch bends from its authored edge into the same well in either flow direction',()=>{
 const sides=['W','N','E','S'],edge=[[200,250],[250,200],[300,250],[250,300]],ends=[[258,272],[258,272],[242,272],[242,228]];
 for(const [q,side] of sides.entries()){
  const forward=glassHatchPipePath(14,side,6),reverse=glassHatchPipePath(14,side,6,0,true);
  assert.ok(forward.startsWith(`M${edge[q].join(',')}L`));
  assert.ok(forward.endsWith(`L${ends[q].join(',')}`));
  assert.ok(reverse.startsWith(`M${ends[q].join(',')}L`));
  assert.ok(reverse.endsWith(`L${edge[q].join(',')}`));
  assert.match(forward,/[QC]/);assert.match(reverse,/[QC]/);
  assert.ok(glassHatchPipePath(14,side,6,6).endsWith(`L${ends[q].join(',')}`));
 }
 const template=readFileSync(new URL('./glass-level.template.html',import.meta.url),'utf8');
 assert.ok(template.includes('hatchCells.has(index)?glassHatchPipePath'));
 assert.ok(template.includes('hatchCells.has(index)?glassHatchPipePath(index,entry||exit'));
 assert.ok(template.includes("if(hatchArt)collarPiece.append(hatchArt.front)"));
 assert.ok(!template.includes('style:level.hatchArtStyle'));
 assert.ok(!template.includes('!entry,level.hatchArtStyle'));
});

test('all underground boards share aligned open mouths including the north-facing second pair',()=>{
 const node=(tag,attrs)=>({tag,attrs,children:[],append(...children){this.children.push(...children);}});
 for(const level of glassLevels.filter(l=>l.hatches?.length))for(const pair of level.hatches)for(const index of [pair.a,pair.b]){
  const side=level.solution[index][1],cx=index%level.size*100+50,cy=Math.floor(index/level.size)*100+50;
  const art=createGlassHatchArt({node,index,cx,cy,side,number:1,symbol:level.hatches.length>1?pair.symbol:null});
  const [x,y]=art.back.attrs.transform.match(/-?\d+/g).map(Number);
  assert.equal(art.front.attrs.transform,art.back.attrs.transform);
  assert.ok(glassHatchPipePath(index,side,level.size).endsWith(`L${x},${y+(side==='S'?-4:4)}`));
  const lid=art.front.children[0].children[0].children.find(n=>n.attrs.class==='hatch-raised-lid');
  assert.ok(lid.attrs.transform.includes('.82'));
  assert.equal(lid.attrs['data-mirrored'],String(side==='E'||side==='S'));
  assert.equal(lid.children.some(n=>n.attrs.class==='hatch-pair-mark'),level.hatches.length>1);
 }
 assert.equal(glassHatchPipePath(30,'N',6),'M50,500L50,530C50,550 58,550 58,568L58,572');
});
test('the open well sits beneath the glass; only double pairs have lid marks',()=>{
 const node=(tag,attrs)=>({tag,attrs,children:[],append(...children){this.children.push(...children);}});
 for(const [number,symbol] of [[1,null],[2,'triangle']]){
  const art=createGlassHatchArt({node,index:14,cx:250,cy:250,side:'W',number,symbol});
  assert.equal(art.shadow.tag,'path');assert.ok(art.shadow.attrs.d);
  assert.ok(art.back.children[0].children[0].children.some(n=>n.attrs.class==='hatch-well'));
  const body=art.front.children[0].children[0],lid=body.children.find(n=>n.attrs.class==='hatch-raised-lid');
  assert.ok(lid.children.some(n=>n.attrs.class==='hatch-lid-face'));
  assert.equal(lid.children.some(n=>n.attrs.class==='hatch-pair-mark'),!!symbol);
  assert.equal(body.children.some(n=>n.attrs.class==='hatch-label'),false);
  assert.equal(art.front.attrs['data-pair'],number);
 }
});
test('level-19 mockup pipe bends into its offset open well in both flow directions',()=>{
 const node=(tag,attrs)=>({tag,attrs,children:[],append(...children){this.children.push(...children);}});
 const art=createGlassHatchArt({node,index:1,cx:150,cy:50,side:'W',number:1,style:'mockup'});
 assert.equal(glassHatchPipePath(1,'W',6,0,false,'mockup'),'M100,50L130,50Q158,50 158,68L158,72');
 assert.equal(glassHatchPipePath(1,'W',6,0,true,'mockup'),'M158,72L158,68Q158,50 130,50L100,50');
 assert.equal(glassHatchPipePath(25,'E',6,0,false,'mockup'),'M200,450L170,450Q142,450 142,468L142,472');
 assert.equal(glassHatchPipePath(25,'E',6,0,true,'mockup'),'M142,472L142,468Q142,450 170,450L200,450');
 assert.equal(art.back.attrs.transform,'translate(158 68)');
 assert.equal(art.front.attrs.transform,'translate(158 68)');
 const body=art.front.children[0].children[0];
 assert.equal(body.children[0].attrs.class,'hatch-front-depth');
 assert.equal(body.children.some(n=>n.attrs.class==='hatch-label'),false);
 assert.ok(body.children.find(n=>n.attrs.class==='hatch-raised-lid').attrs.transform.includes('scale(.82)'));
 const exit=createGlassHatchArt({node,index:25,cx:150,cy:450,side:'E',number:1,style:'mockup'});
 assert.equal(exit.front.attrs.transform,'translate(142 468)');
 assert.equal(exit.front.children[0].children[0].children.find(n=>n.attrs.class==='hatch-raised-lid').attrs.transform,'translate(-3 0) scale(-.82 .82)');
});
