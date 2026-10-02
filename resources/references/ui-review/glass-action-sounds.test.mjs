import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Run the actual shared and generated pause/play functions. A playing media
// double makes synchronous cancellation visible, as it was on the first Next.
const read=name=>fs.readFileSync(new URL(name,import.meta.url),'utf8');
const runtimes=[
  ['shared',read('./glass-level.template.html')],
  ['generated first level',read('../../../public/levels/31/index.html')],
  ['generated relay lesson',read('../../../public/levels/44/index.html')],
];
function setup(source){
  const actionSounds=Object.fromEntries(['ui','hint','pipe','power','energy','victory'].map(name=>[name,{
    playing:false,plays:0,currentTime:0,pause(){this.playing=false;},play(){this.playing=true;this.plays++;return Promise.resolve();},
  }]));
  const scope={actionSounds,document:{hidden:false},soundEnabled:true,
    soundButton:{getAttribute(){return scope.soundEnabled?'true':'false';}},
    level:{switches:[]},firstPipeSound:{stop(){},play(){}},levelMusic:{volume:.063},restoreSoundtrack(){scope.levelMusic.volume=.063;},
    timerFailed:false,currentAttempt:{},overlay:{hidden:true},refillOverlay:{hidden:true},timeoutOverlay:{hidden:true},
    abandonOverlay:{hidden:true},lifeStore:{hidden:true},resultOverlay:{hidden:true},outageOpen:false,outageTransitioning:false,
    onboarding:{blocking:false,suspend(){}},lessonOpen:false,introPending:false,root:{dataset:{}},
    syncGuidanceDelay(){},syncChargeClock(){},effect:{setActive(){}},energy:{setPaused(){}},music:{setSuspended(){}},
    gardenScenery:{pause(){}},firstPipeLayers:{setReduced(){},setPaused(){}},reduced:{matches:false},
    hintAnimations:[],idleCoachAnimation:null,readyCoachAnimation:null,
  };
  const sounds=source.slice(source.indexOf('      function stopActionSounds('),source.indexOf('      async function leaveLevelWithFeedback('));
  const pause=source.slice(source.indexOf('      function syncPause(){'),source.indexOf('      function showSettings('));
  assert(sounds.includes('function playActionSound'));assert(pause.includes('stopActionSounds'));
  const runtime=vm.runInContext(sounds+'\n'+pause+'\n({playActionSound,stopActionSounds,syncPause})',vm.createContext(scope));
  return {scope,actionSounds,...runtime};
}

for(const [name,source]of runtimes){
  test(`${name}: a button click survives every first-level Next and repeated modal pauses`,()=>{
    const s=setup(source);
    for(const step of ['charge','life','source','goal']){
      s.scope.onboarding.blocking=step!=='goal';
      s.playActionSound('ui');s.syncPause();s.syncPause();
      assert.equal(s.actionSounds.ui.playing,true,`Next from ${step} was cut off`);
    }
    assert.equal(s.actionSounds.ui.plays,4);
    for(const mode of ['lesson','settings','refill','timeout','outage']){
      const q=setup(source);
      if(mode==='lesson')q.scope.lessonOpen=true;
      else if(mode==='outage')q.scope.outageOpen=true;
      else q.scope[mode==='settings'?'overlay':mode==='refill'?'refillOverlay':'timeoutOverlay'].hidden=false;
      q.playActionSound('ui');q.playActionSound('hint');q.actionSounds.energy.playing=true;q.actionSounds.victory.playing=true;
      q.syncPause();q.syncPause();
      assert.equal(q.scope.root.dataset.paused,'true');
      assert.equal(q.actionSounds.ui.playing,true);assert.equal(q.actionSounds.hint.playing,true);
      assert.equal(q.actionSounds.energy.playing,false);assert.equal(q.actionSounds.victory.playing,false);
    }
  });
  test(`${name}: mute blocks feedback and hiding or leaving stops existing feedback`,()=>{
    const s=setup(source);s.scope.soundEnabled=false;
    for(const key of ['ui','hint'])s.playActionSound(key);
    assert.equal(s.actionSounds.ui.plays,0);assert.equal(s.actionSounds.hint.plays,0);
    s.scope.soundEnabled=true;s.playActionSound('ui');s.playActionSound('hint');
    s.scope.document.hidden=true;s.syncPause();
    assert.equal(s.actionSounds.ui.playing,false);assert.equal(s.actionSounds.hint.playing,false);
    s.playActionSound('ui');assert.equal(s.actionSounds.ui.plays,1);
    s.scope.document.hidden=false;s.playActionSound('ui');s.stopActionSounds();assert.equal(s.actionSounds.ui.playing,false);
  });
}
