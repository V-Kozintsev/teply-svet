// The pointer is positioned from the same measured source bounds as its paper card.
function positionFirstSourceTooltip(element,sourceButton,root){
  const source=sourceButton.getBoundingClientRect(),bounds=root.getBoundingClientRect();
  const viewport=window.visualViewport;
  const left=Math.max(bounds.left,viewport?.offsetLeft||0)+8;
  const right=Math.min(bounds.right,(viewport?.offsetLeft||0)+(viewport?.width||innerWidth))-8;
  const top=Math.max(bounds.top,viewport?.offsetTop||0)+8;
  const bottom=(viewport?.offsetTop||0)+(viewport?.height||innerHeight)-8;
  const room=right-source.right-14;
  const beside=root.dataset.sceneLayout==='portrait'&&room>=68;
  element.dataset.pointer=beside?'left':'bottom';
  element.style.width=`${beside?Math.min(230,room):Math.min(238,right-left)}px`;
  const {width,height}=element.getBoundingClientRect();
  const targetX=beside?source.right+4:source.left+source.width/2;
  const targetY=beside?source.top+source.height/2:source.top-5;
  const x=beside?targetX+10:Math.max(left,Math.min(right-width,targetX-width*.5));
  const y=beside?Math.max(top,Math.min(bottom-height,targetY-height*.5)):Math.max(top,targetY-height-10);
  element.style.left=`${x-bounds.left}px`;
  element.style.top=`${y-bounds.top}px`;
  element.style.setProperty('--source-pointer-x',`${Math.max(14,Math.min(width-14,targetX-x))-7}px`);
  element.style.setProperty('--source-pointer-y',`${Math.max(14,Math.min(height-14,targetY-y))-7}px`);
}
