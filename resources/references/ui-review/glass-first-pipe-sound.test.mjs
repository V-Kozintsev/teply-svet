import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const code=fs.readFileSync(new URL('./glass-first-pipe-sound.js',import.meta.url),'utf8');
function setup({unsupported=false,fail=false,pendingResume=false,additional={}}={}){
  const document=new EventTarget(),window=new EventTarget();document.hidden=false;
  const sources=[],contexts=[];let decodes=0,resumes=0;
  class Context{
    constructor(){this.state='suspended';this.destination={};contexts.push(this)}
    createGain(){return{gain:{value:0},connect(){}}}
    async decodeAudioData(){decodes++;if(fail)throw new Error('decode');return {duration:.1}}
    resume(){resumes++;if(pendingResume&&resumes===1)return new Promise(()=>{});this.state='running';return Promise.resolve()}async suspend(){this.state='suspended'}async close(){this.state='closed'}
    createBufferSource(){const source={connect(){},disconnect(){},start(){this.started=true},stop(){this.stopped=true}};sources.push(source);return source;}
  }
  const scope=vm.createContext({document,window,Uint8Array,atob,AudioContext:unsupported?undefined:Context});
  const sound=vm.runInContext(code+'\ncreateFirstPipeSound',scope)('data:audio/wav;base64,AAAA',.12,additional);
  return{sound,document,window,sources,contexts,decodes:()=>decodes,resumes:()=>resumes};
}
test('one decoded buffer supports repeated clicks without restarting media elements',async()=>{
  const s=setup();await s.sound.ready;s.document.dispatchEvent(new Event('pointerup'));await Promise.resolve();
  for(let i=0;i<30;i++)s.sound.play();
  assert.equal(s.decodes(),1);assert.equal(s.contexts.length,1);assert.equal(s.sources.length,30);
  assert(s.sources.every(v=>v.started&&v.buffer===s.sources[0].buffer));assert(s.sources.slice(0,-1).every(v=>v.stopped));
  s.sound.stop();assert(s.sources.at(-1).stopped);s.sound.dispose();
});
test('background stops audio; foreground and keyboard activation recover it',async()=>{
  const s=setup();await s.sound.ready;s.document.dispatchEvent(new Event('keydown'));await Promise.resolve();s.sound.play();
  s.document.hidden=true;s.document.dispatchEvent(new Event('visibilitychange'));assert(s.sources[0].stopped);s.sound.play();assert.equal(s.sources.length,1);
  await Promise.resolve();s.document.hidden=false;s.document.dispatchEvent(new Event('visibilitychange'));await Promise.resolve();s.sound.play();assert.equal(s.sources.length,2);
  s.sound.dispose();s.document.dispatchEvent(new Event('pointerup'));s.sound.play();assert.equal(s.sources.length,2);assert.equal(s.contexts[0].state,'closed');
});
test('a delayed end event cannot discard the newer click',async()=>{
  const s=setup();await s.sound.ready;s.document.dispatchEvent(new Event('pointerup'));await Promise.resolve();s.sound.play();s.sound.play();s.sources[0].onended();s.sound.stop();assert(s.sources[1].stopped);s.sound.dispose();
});
test('unavailable or failed audio stays optional and never falls back to slow playback',async()=>{
  for(const options of [{unsupported:true},{fail:true}]){const s=setup(options);await s.sound.ready;s.document.dispatchEvent(new Event('pointerup'));await Promise.resolve();s.sound.play();assert.equal(s.sources.length,0);s.sound.dispose();}
});
test('initial pageshow cannot strand a resume; a later gesture retries a pending one',async()=>{
  const s=setup({pendingResume:true});await s.sound.ready;s.window.dispatchEvent(new Event('pageshow'));assert.equal(s.resumes(),0);
  s.document.dispatchEvent(new Event('pointerup'));assert.equal(s.resumes(),1);s.sound.play();assert.equal(s.sources.length,0);
  s.document.dispatchEvent(new Event('touchend'));assert.equal(s.resumes(),2);s.sound.play();assert.equal(s.sources.length,1);s.sound.dispose();
});

test('linked-switch sound shares the context and uses its own decoded clip',async()=>{const s=setup({additional:{power:'data:audio/wav;base64,AAAA'}});await s.sound.ready;s.document.dispatchEvent(new Event('pointerup'));s.sound.play();const pipe=s.sources[0].buffer;s.sound.play('power');assert.equal(s.contexts.length,1);assert.equal(s.decodes(),2);assert.notEqual(s.sources[1].buffer,pipe);assert(s.sources[0].stopped);s.sound.dispose();});
