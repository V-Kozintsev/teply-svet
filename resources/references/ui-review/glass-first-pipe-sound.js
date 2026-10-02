// The first level's frequently repeated click uses one decoded buffer. Never
// seek/restart an HTMLMediaElement on the pipe input path (slow on iPhone).
function createFirstPipeSound(url,volume,additional={}){
  const extraBuffers=new Map();
  let context=null,buffer=null,gain=null,voice=null,disposed=false,interacted=false;
  const gestures=['pointerup','touchend','click','keydown'];
  function stop(){if(voice){const old=voice;voice=null;try{old.stop();}catch{}old.disconnect();}}
  const ready=(async()=>{
    try{
      const Context=globalThis.AudioContext||globalThis.webkitAudioContext;
      if(!Context)return;
      context=new Context();gain=context.createGain();gain.gain.value=volume;gain.connect(context.destination);
      // Generated levels embed the original audio: decode its bytes locally,
      // without a network request or a second media-element decoder.
      const comma=url.indexOf(',');
      if(comma<0||!url.slice(0,comma).startsWith('data:audio/')||!url.slice(0,comma).endsWith(';base64'))return;
      const bytes=Uint8Array.from(atob(url.slice(comma+1)),char=>char.charCodeAt(0)).buffer;
      const decoded=await context.decodeAudioData(bytes);
      if(!disposed)buffer=decoded;
      await Promise.all(Object.entries(additional).map(async([name,source])=>{try{const comma=source.indexOf(',');if(comma<0||!source.slice(0,comma).startsWith('data:audio/')||!source.slice(0,comma).endsWith(';base64'))return;const bytes=Uint8Array.from(atob(source.slice(comma+1)),char=>char.charCodeAt(0)).buffer,decoded=await context.decodeAudioData(bytes);if(!disposed)extraBuffers.set(name,decoded);}catch{}}));
    }catch{/* Optional audio must never block entry or the next turn. */}
  })();
  function unlock(event){
    if(gestures.includes(event?.type))interacted=true;
    if(!interacted||disposed||!context||document.hidden||context.state==='running'||context.state==='closed')return;
    // Safari may leave a non-activated resume pending. Each subsequent real
    // gesture must be allowed to retry; never lock input behind that promise.
    try{void context.resume().catch(()=>{});}catch{}
  }
  function hidden(){if(document.hidden){stop();if(context?.state==='running')void context.suspend().catch(()=>{});}else unlock();}
  function leave(event){stop();if(event.persisted){if(context?.state==='running')void context.suspend().catch(()=>{});}else dispose();}
  function dispose(){
    if(disposed)return;disposed=true;stop();buffer=null;extraBuffers.clear();
    for(const type of gestures)document.removeEventListener(type,unlock,true);
    document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',leave);window.removeEventListener('pageshow',unlock);
    if(context&&context.state!=='closed')void context.close().catch(()=>{});
  }
  for(const type of gestures)document.addEventListener(type,unlock,true);
  document.addEventListener('visibilitychange',hidden);window.addEventListener('pagehide',leave);window.addEventListener('pageshow',unlock);
  return{ready,stop,dispose,play(name){
    const selected=name?extraBuffers.get(name):buffer;
    if(disposed||document.hidden||!selected||context?.state!=='running')return;
    try{stop();const next=context.createBufferSource();next.buffer=selected;next.connect(gain);voice=next;
      next.onended=()=>{next.disconnect();if(voice===next)voice=null;};next.start();
    }catch{stop();}
  }};
}
