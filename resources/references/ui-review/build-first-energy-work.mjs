// First chapter only: reuse unchanged geometry and avoid writing stable values
// every animation frame. The energy clock and circuit state machine are unchanged.
export function refineFirstEnergyWork(fragment) {
  const replace=(from,to)=>{if(!fragment.includes(from))throw new Error(`Missing energy-work anchor: ${from}`);fragment=fragment.replace(from,to);};
  // Keep the original -4,-4 sprite origin. Translation preserves the same
  // position without changing the SVG image's geometry on each frame.
  const sparkPosition=/spark\.setAttribute\('x', String\(Math\.cos\(angle\) \* radius - 4\)\);\s*spark\.setAttribute\('y', String\(Math\.sin\(angle\) \* radius - 4\)\);/g;
  if([...fragment.matchAll(sparkPosition)].length!==2)throw new Error('Expected idle and charging spark positions');
  fragment=fragment.replace(sparkPosition,'spark.style.transform=`translate(${Math.cos(angle)*radius}px,${Math.sin(angle)*radius}px)`;');
  replace("  let wavePaths = [...wave.querySelectorAll('path')];",
    "  let wavePaths = [...wave.querySelectorAll('path')];\n  let waveDasharray=null;\n  let externalDasharrays=new WeakMap();");
  replace('    setExternalFeeds(feeds) { externalFeeds = feeds; paint(0); },',
    '    setExternalFeeds(feeds) { externalFeeds = feeds; externalDasharrays=new WeakMap(); paint(0); },');
  replace('    for (const path of wavePaths) {\n      path.style.strokeDasharray = `${tail} ${externalEnd() + tail + 1}`;',
    '    const dasharray=`${tail} ${externalEnd()+tail+1}`,dashChanged=waveDasharray!==dasharray;\n    waveDasharray=dasharray;\n    for (const path of wavePaths) {\n      if(dashChanged)path.style.strokeDasharray=dasharray;');
  // A rebuilt wave can have the same length but new path nodes.
  replace('      if (wavePaths.length !== flowParts.length * waveTemplates.length) {',
    '      waveDasharray=null;\n      if (wavePaths.length !== flowParts.length * waveTemplates.length) {');
  replace('      for (const path of item.paths) {\n        path.style.strokeDasharray = `${externalTail} ${item.length + externalTail + 1}`;',
    '      const dasharray=`${externalTail} ${item.length+externalTail+1}`,dashChanged=externalDasharrays.get(item)!==dasharray;\n      externalDasharrays.set(item,dasharray);\n      for (const path of item.paths) {\n        if(dashChanged)path.style.strokeDasharray=dasharray;');
  replace("      mark.node.style.filter = flash\n        ? `brightness(${1 + flash * 0.9}) drop-shadow(0 0 ${flash * 4}px #fff1bd)`\n        : '';",
    "      if(flash)mark.node.style.filter=`brightness(${1+flash*.9}) drop-shadow(0 0 ${flash*4}px #fff1bd)`;\n      else if(mark.node.style.filter)mark.node.style.filter='';");
  replace('  function lightWindows(count) {',
    "  let lastWindowCount=-1;\n  function lightWindows(count) {\n    if(count===lastWindowCount)return;\n    lastWindowCount=count;");
  replace("        path.setAttribute('d', value.d);", "        if(path.getAttribute('d')!==value.d)path.setAttribute('d',value.d);");
  replace("        frontPath.setAttribute('d', part.d);",
    "        if(frontPath.getAttribute('d')!==part.d)frontPath.setAttribute('d',part.d);");
  replace("{const path=wavePaths[index*waveTemplates.length+kind];path.setAttribute('d',part.d);path.dataset.distanceStart=String(part.start);}",
    "{const path=wavePaths[index*waveTemplates.length+kind];if(path.getAttribute('d')!==part.d)path.setAttribute('d',part.d);path.dataset.distanceStart=String(part.start);}");
  replace('  let circuit = null,','  let endpointKey=null;\n  let circuit = null,');
  replace("      const point = endPath.getPointAtLength(Math.max(0,localEndpoint-2));\n      endGlow.setAttribute('cx', point.x);\n      endGlow.setAttribute('cy', point.y);",
    "      const nextEndpointKey=endPath.getAttribute('d')+'|'+localEndpoint;\n      if(endpointKey!==nextEndpointKey){\n        endpointKey=nextEndpointKey;\n        const point=endPath.getPointAtLength(Math.max(0,localEndpoint-2));\n        endGlow.setAttribute('cx',point.x);endGlow.setAttribute('cy',point.y);\n      }");
  // Exact browser-measured lengths in logical board units, never screen pixels.
  // Bound the cache even if a future puzzle introduces more path variants.
  replace('      function render(editedCell=null){',
    "      const flowLengths=new Map();\n      function flowLength(d){\n        let length=flowLengths.get(d);\n        if(length===undefined){length=node('path',{d}).getTotalLength();if(flowLengths.size>=256)flowLengths.clear();flowLengths.set(d,length);}\n        return length;\n      }\n      function render(editedCell=null){");
  replace("inset,level.size,crossoverBridge),shape=node('path',{d:part}),size=shape.getTotalLength(),start=length;",
    'inset,level.size,crossoverBridge),size=flowLength(part),start=length;');
  replace("const partLength=node('path',{d:part}).getTotalLength()",
    'const partLength=flowLength(part)');
  return fragment;
}
