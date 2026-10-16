'use strict';
// Load only the chosen world's enemies and selected character's legacy dependencies.
const stageJobs=new Map(),stageDone=new Set(),stageTimings=[];
function stageOnce(key,load){if(!stageJobs.has(key)){const start=performance.now();stageJobs.set(key,Promise.resolve().then(load).then(()=>{stageDone.add(key);stageTimings.push({key,ms:performance.now()-start});}).catch(error=>{stageJobs.delete(key);throw error;}));}return stageJobs.get(key);}
function stageCore(){return stageOnce('core',()=>Promise.all([loadGrass(),loadSupport(),loadImage('atk/001.png').then(i=>assets.bullet=i),loadImage('atk/002.png').then(i=>assets.lightning=i)]));}
function stageCharacter(id){return stageOnce('character:'+id,()=>{
 if(id==='denden')return Promise.all([stageOnce('dive',loadDive),loadGiantThunder(),...Array.from({length:32},(_,n)=>loadImage(`denden/${String(n+1).padStart(3,'0')}.png`).then(i=>sprites[n]=i)),...Array.from({length:32},(_,n)=>loadImage(`skill/${String(n+1).padStart(3,'0')}.png`).then(i=>skillSprites[n]=i))]);
 if(id==='nyoro')return Promise.all([loadNyoro(),stageOnce('dive',loadDive)]);
 if(id==='tetsu')return loadTetsu();if(id==='miramob')return stageOnce('mira',loadMira);
 return Promise.resolve();
});}
function stageWorld(index,area){return Promise.all([
 stageOnce('biome:'+index,()=>index===0?loadImage('stage/001.png').then(i=>assets.background=i):loadBiomes(index)),
 ...BIOME_ENEMIES[index].map(type=>stageOnce('enemy:'+type,()=>type==='lime'?loadLime():type==='miira'?loadMiira():loadNewEnemies([type]))),
 ...(index===1&&area===1?[stageOnce('sharty',loadSharty)]:[]),
 ...(area===3?[selectedBoss==='dragon'?stageOnce('dragon',loadDragon):stageOnce('mira',loadMira)]:[])
]);}
async function stagePrepare(id=selectedCharacter,index=biomeIndex,area=areaIndex){await Promise.all([stageCore(),stageCharacter(id),stageWorld(index,area)]);}
function stageWarm(){const id=selectedCharacter,index=biomeIndex;void stagePrepare(id,index,areaIndex).catch(error=>{$('load-status').textContent='準備エラー: '+error.message;});}
if(cartoonEnabled){
 const readyDraw=draw;draw=function(){if(!stageDone.has('core')||!stageDone.has('biome:'+biomeIndex)){ctx.clearRect(0,0,W,H);drawBackground();return;}readyDraw();};
 selectCharacter=function(id){if(['playing','paused'].includes(state)||combatPreparing||id==='miramob'&&!adminUnlocked)return;selectedCharacter=id;player=null;cartoonCancel();updateCharacterUI();stageWarm();void combatPrepare(id).catch(error=>{$('load-status').textContent=error.message;});};
 const biome=selectBiome;selectBiome=function(index){if(combatPreparing)return;if(!['playing','paused'].includes(state))player=null;biome(index);stageWarm();};
 $('next-biome').addEventListener('click',event=>{if(state!=='clear'||biomeIndex>=BIOMES.length-1)return;event.stopImmediatePropagation();selectBiome(biomeIndex+1);state='ready';void startGrassArea();},true);
 if(cartoonLab)selectedCharacter='hero';
 state='ready';$('start').disabled=false;$('start').textContent='START RUN →';$('load-status').textContent='キャラクターとステージを選べます。選択内容の素材を準備中';updateCharacterUI();performance.mark('selection-ready');stageWarm();
}
