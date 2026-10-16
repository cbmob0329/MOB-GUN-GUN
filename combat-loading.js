'use strict';
// Resident, bounded character textures. Source art and world-space geometry stay unchanged.
const COMBAT_BUILD='20261016-nyoro-move-1';
const combatImageInfo=new WeakMap(),combatLoadAudit={decodes:0,evictions:0,maxConcurrent:0,decodeMs:[],preparations:[]};
let combatCatalog={},combatPlan=null,combatWorkers=0,combatPreparing=null;
function combatBlit(context,image,rect,...destination){const info=combatImageInfo.get(image);context.drawImage(image,...rect.map((n,i)=>n*(i%2?(info?.sy||1):(info?.sx||1))),...destination);}
function combatContains(image,rect){const info=combatImageInfo.get(image);return rect[0]+rect[2]<=(info?.width||image.width)&&rect[1]+rect[3]<=(info?.height||image.height);}
function combatSources(id){return [...new Set(Object.entries(cartoonArt).filter(([key])=>key.startsWith('effects/')||(id==='hero'?(!key.includes('/')||key.startsWith('hero/')):key.startsWith(id+'/'))).flatMap(([,art])=>art.frames.map(f=>f.src)))];}
const combatCatalogReady=fetch('combat/texture-catalog.json?v='+COMBAT_BUILD,{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Texture catalog '+r.status);return r.json();}).then(data=>{combatCatalog=data;});
function combatSetPlan(id){
 if(combatPlan?.id===id)return combatPlan;
 const sources=combatSources(id);if(!sources.length)return null;
 let raw=0;for(const src of sources){const size=combatCatalog[new URL(src).pathname.replace(/^\//,'')];if(!size)throw Error('Missing texture size: '+new URL(src).pathname);raw+=size.width*size.height*4;}
 const scale=Math.min(1,Math.sqrt(60*1024*1024/raw));
 cartoonTextureEpoch++;cartoonTextureQueue.clear();for(const controller of cartoonLoading.values())controller.abort();for(const src of [...cartoonTextures.keys()])cartoonDisposeTexture(src);
 if(cartoonPoseFallback){cartoonPoseFallback.image.width=cartoonPoseFallback.image.height=0;cartoonPoseFallback=null;}
 cartoonTextureContext=id;cartoonTexturePlan='resident:'+id;combatPlan={id,sources:new Set(sources),scale,raw,epoch:cartoonTextureEpoch};
 return combatPlan;
}
cartoonTextureStats=function(){return {bytes:cartoonTextureBytes(),reserved:cartoonTextureReserved,peak:cartoonTexturePeak,budget:cartoonTextureBudget,cached:cartoonTextures.size,queued:cartoonTextureQueue.size,inFlight:cartoonLoading.size,failures:cartoonTextureFailures.size,character:combatPlan?.id,scale:combatPlan?.scale,ready:combatResident(),...combatLoadAudit};};
function combatResident(id=selectedCharacter){return combatPlan?.id===id&&[...combatPlan.sources].every(src=>cartoonTextures.has(src));}
cartoonTextureRequest=function(src,priority=0){
 if(!combatPlan?.sources.has(src)||cartoonTextures.has(src)||cartoonLoading.has(src)||cartoonTextureQueue.has(src))return;
 const failed=cartoonTextureFailures.get(src);if(failed&&(failed.attempts>=3||performance.now()<failed.retryAt))return;
 cartoonTextureQueue.set(src,{priority,epoch:cartoonTextureEpoch,scale:combatPlan.scale});void cartoonTexturePump();
};
cartoonTexturePump=async function(){
 if(combatWorkers>=2)return;combatWorkers++;combatLoadAudit.maxConcurrent=Math.max(combatLoadAudit.maxConcurrent,combatWorkers);
 try{while(cartoonTextureQueue.size){
  const [src,job]=[...cartoonTextureQueue].sort((a,b)=>a[1].priority-b[1].priority)[0];cartoonTextureQueue.delete(src);const controller=new AbortController();cartoonLoading.set(src,controller);let image=null,reserved=0;
  try{
   const response=await fetch(src,{signal:controller.signal});if(!response.ok)throw Error('Texture HTTP '+response.status);
   const blob=await response.blob(),header=await cartoonImageHeader(blob);if(job.epoch!==cartoonTextureEpoch)continue;
   const width=Math.max(1,Math.floor(header.width*job.scale)),height=Math.max(1,Math.floor(header.height*job.scale)),bytes=width*height*4;
   if(cartoonTextureBytes()+cartoonTextureReserved+bytes>cartoonTextureBudget)throw Error('Resident texture plan exceeds budget');reserved=bytes;
   cartoonTextureReserved+=reserved;cartoonTexturePeak=Math.max(cartoonTexturePeak,cartoonTextureBytes()+cartoonTextureReserved);
   const started=performance.now();image=await createImageBitmap(blob,{resizeWidth:width,resizeHeight:height,resizeQuality:'high'});
   combatLoadAudit.decodeMs.push(performance.now()-started);if(combatLoadAudit.decodeMs.length>500)combatLoadAudit.decodeMs.shift();combatLoadAudit.decodes++;
   if(job.epoch!==cartoonTextureEpoch){image.close();image=null;continue;}
   combatImageInfo.set(image,{width:header.width,height:header.height,sx:width/header.width,sy:height/header.height});
   cartoonTextures.set(src,{image,used:++cartoonTextureClock,bytes:reserved});image=null;cartoonTextureFailures.delete(src);
  }catch(error){image?.close?.();if(job.epoch===cartoonTextureEpoch&&error.name!=='AbortError'){const attempts=(cartoonTextureFailures.get(src)?.attempts||0)+1;cartoonTextureFailures.set(src,{attempts,retryAt:performance.now()+30000});cartoonAssetErrors.push(src+': '+error.message);}}
  finally{cartoonTextureReserved-=reserved;cartoonLoading.delete(src);}
  // Yield between atlas decodes; rendering and selection input remain responsive.
  await new Promise(resolve=>setTimeout(resolve,0));
 }}finally{combatWorkers--;}
};
cartoonPrefetch=function(){if(combatPreparing||!Object.keys(combatCatalog).length||!cartoonArt.idle)return;let plan;try{plan=combatSetPlan(selectedCharacter);}catch(error){cartoon.assetNotice=error.message;return;}if(plan)for(const src of plan.sources)cartoonTextureRequest(src,1);};
async function combatPrepare(id=selectedCharacter){
 await Promise.all([combatCatalogReady,cartoonArtReady,typeof stageCharacter==='function'?stageCharacter(id):Promise.resolve()]);
 const plan=combatSetPlan(id);if(!plan)return;const started=performance.now();
 for(const src of plan.sources)cartoonTextureRequest(src,0);
 while(!combatResident(id)){
  if(combatPlan!==plan)throw Error('Character selection changed');
  const failed=[...plan.sources].find(src=>cartoonTextureFailures.has(src));if(failed)throw Error('画像を読み込めません。再読み込みしてください。');
  if(performance.now()-started>120000)throw Error('画像の準備がタイムアウトしました。');
  $('load-status').textContent=`素材を準備中 ${cartoonTextures.size}/${plan.sources.size} — ${COMBAT_BUILD}`;
  await new Promise(resolve=>setTimeout(resolve,20));
 }
 combatLoadAudit.preparations.push({id,ms:performance.now()-started,pages:plan.sources.size,bytes:cartoonTextureBytes(),scale:plan.scale});
}

// Temporary old model families use one neutral-source calibration, never per-cel bbox fitting.
// These fixes do not turn mixed old/new character designs into approved replacement art.
if(cartoonEnabled){
 const oldNyoroScale=nyoroScale;nyoroScale=function(n){return cartoonActive()?110/nyoroFrames[1].height:oldNyoroScale(n);};
 const legacyBody=drawPlayerBody;drawPlayerBody=function(){
  if(selectedCharacter!=='denden'||!cartoonOriginalSkill())return legacyBody();
  const image=thunderBullet?dendenBulletFrames[Math.min(7,Math.floor(thunderBullet.age/.075))]:playerImage();if(!image)return;
  const reference=thunderBullet?dendenBulletFrames[0]:skillState.charging||skillState.releaseAge<.48?skillSprites[0]:sprites[24],scale=110/reference.height;
  ctx.save();ctx.translate(player.x-camera,player.y);ctx.scale(player.dir,1);if(player.inv>0&&Math.floor(player.inv*16)%2===0)ctx.globalAlpha=.35;ctx.drawImage(image,-image.width*scale*.5,-image.height*scale,image.width*scale,image.height*scale);ctx.restore();
 };
 const ui=cartoonUI;cartoonUI=function(){ui();if(['denden','nyoro','tetsu'].includes(selectedCharacter))document.querySelector('.keyboard-help').textContent='A D 移動 / SPACE ジャンプ / J 弱・空中攻撃 / K 強HOLD / L ガード / C しゃがみ / 1・2・3 固有技';};
}
// Simulation time and displayed pose use the same action age. Never wait for 16 draw acknowledgements.
cartoonPresentedAdvance=function(a,dt,requested){return requested;};
if(cartoonEnabled){
 const select=selectCharacter;selectCharacter=function(id){select(id);if(selectedCharacter===id&&state!=='playing'&&state!=='paused')void combatPrepare(id).catch(error=>{$('load-status').textContent=error.message;});};
 const start=startGrassArea;startGrassArea=async function(){if(combatPreparing||state==='loading')return;if(state==='paused'&&combatResident())return start();
  const id=cartoonLab?'hero':selectedCharacter;$('start').disabled=true;$('load-status').textContent='ステージと選択キャラクターの素材を準備中…';combatPreparing=(async()=>{await stagePrepare(id,biomeIndex,state==='areaClear'?areaIndex+1:state==='clear'?0:areaIndex);await combatPrepare(id);})();
  try{await combatPreparing;combatPreparing=null;start();}catch(error){$('load-status').textContent=error.message;}finally{combatPreparing=null;$('start').disabled=false;}
 };$('start').onclick=startGrassArea;
 const readyResume=resume;resume=function(){if(!combatPreparing)readyResume();};
 const swap=switchParty;switchParty=function(id,forced=false){if((!cartoonProfiles[id]&&typeof stageDone!=='undefined'&&stageDone.has('character:'+id))||combatResident(id))return swap(id,forced);if(state!=='playing'||combatPreparing||!party[id]||party[id].hp<=0||(!forced&&partyCooldown>1e-8))return false;
  // Preparation belongs to the party-selection screen, never to a half-started attack.
  state='paused';clearInput();$('overlay').hidden=false;$('character-select').hidden=true;$('modal-title').textContent='キャラクターの準備';$('modal-copy').textContent='技の素材をまとめて読み込んでいます';$('start').disabled=true;
  combatPreparing=combatPrepare(id);combatPreparing.then(()=>{combatPreparing=null;state='playing';$('overlay').hidden=true;swap(id,forced);}).catch(error=>{$('load-status').textContent=error.message;}).finally(()=>{combatPreparing=null;$('start').disabled=false;});return false;
 };
 const build=document.createElement('small');build.id='combat-build';build.textContent=COMBAT_BUILD;build.style.cssText='position:absolute;bottom:3px;left:12px;font:10px monospace;color:#fff9;pointer-events:none';document.querySelector('main').append(build);
 void Promise.all([combatCatalogReady,cartoonArtReady]).then(()=>combatPrepare(cartoonLab?'hero':selectedCharacter)).catch(error=>{$('load-status').textContent=error.message;});
}
