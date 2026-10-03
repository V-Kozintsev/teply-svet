import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('./glass-first-energy-canvas.js',import.meta.url),'utf8');
function scene(){
 const contexts=[];
 const mask={tagName:'path',style:{transformOrigin:'250px 350px',transform:'translate(0px, 0px)'},getAttribute:name=>name==='d'?'M200 350L300 350':null};
 const groups=new Map(['.test-base','.energy-layer','.travel-wave','.end-glow','.arrival-mask'].map(name=>[name,{style:{opacity:name==='.test-base'?'1':'0'},children:[],parentElement:{style:{}}}]));
 groups.set('.interior-mask',{children:[mask]});
 const board={clientWidth:600,insertBefore(){}},svg={parentElement:board,viewBox:{baseVal:{width:600}},querySelector:name=>groups.get(name)};
 function context(){
  let matrix=[1,0,0,1,0,0];const stack=[],strokes=[];
  const ctx={strokes,
   save(){stack.push([...matrix]);},restore(){matrix=stack.pop();},
   setTransform(...values){matrix=values;},
   translate(x,y){const [a,b,c,d,e,f]=matrix;matrix=[a,b,c,d,e+a*x+c*y,f+b*x+d*y];},
   rotate(angle){const [a,b,c,d,e,f]=matrix,cos=Math.cos(angle),sin=Math.sin(angle);matrix=[a*cos+c*sin,b*cos+d*sin,c*cos-a*sin,d*cos-b*sin,e,f];},
   stroke(path){const [a,b,c,d,e,f]=matrix;strokes.push({d:path.d,center:[a*250+c*350+e,b*250+d*350+f]});},
   clearRect(){},setLineDash(){},drawImage(){},
  };contexts.push(ctx);return ctx;
 }
 const sandbox=vm.createContext({
  document:{createElement(){const ctx=context();return {style:{},dataset:{},setAttribute(){},getContext:()=>ctx,addEventListener(){},remove(){}};}},
  devicePixelRatio:1,Path2D:class{constructor(d){this.d=d;}},ResizeObserver:class{observe(){}disconnect(){}},
 });
 const create=vm.runInContext(source+'\ncreateFirstEnergyCanvas;',sandbox),controller=create({dataset:{}},svg);
 return {mask,controller,interior:contexts[2],groups};
}

test('both light passes use the sliding mask at its current position, including reload and return',()=>{
 const s=scene();
 assert.deepEqual(s.interior.strokes.at(-1).center,[250,350]);
 for(const pass of ['.travel-wave','.energy-layer']){
  s.groups.get('.test-base').style.opacity='0';s.groups.get(pass).style.opacity='1';
  for(const [offset,point]of [[50,[250,400]],[100,[250,450]],[0,[250,350]],[-100,[250,250]]]){
   s.mask.style.transform=`translate(0px, ${offset}px)`;s.controller.paint();
   assert.deepEqual(s.interior.strokes.at(-1).center,point,`${pass} follows the carriage`);
  }
  s.groups.get(pass).style.opacity='0';
 }
 const reloaded=scene();reloaded.mask.style.transform='translate(0px, 100px)';reloaded.controller.paint();
 assert.deepEqual(reloaded.interior.strokes.at(-1).center,[250,450]);
 const count=reloaded.interior.strokes.length;reloaded.controller.paint();assert.equal(reloaded.interior.strokes.length,count,'unchanged geometry keeps the mask cache');
});

test('ordinary rotation remains around its authored center and horizontal slides translate the mask',()=>{
 const s=scene();s.mask.style.transformOrigin='200px 350px';s.mask.style.transform='rotate(90deg)';s.controller.paint();
 assert.deepEqual(s.interior.strokes.at(-1).center,[200,400]);
 s.mask.style.transform='translate(100px, 0px)';s.controller.paint();assert.deepEqual(s.interior.strokes.at(-1).center,[350,350]);
});
