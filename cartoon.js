/* Shared combat adapter. Legacy campaign remains available with ?legacy=1. */
'use strict';
const cartoonEnabled = !new URLSearchParams(location.search).has('legacy');
const CARTOON = Object.freeze({comboWindow:.72,chargeTime:.55,awakeDuration:12,awakeCooldown:24,moveBoost:1.8,attackBoost:1.65});
const CARTOON_MOB_SLASH=Object.freeze({duration:1,start:.16,step:.18,end:.88,boundaries:[.16,.34,.52,.70,.88],damage:[12,12,12,48],forward:155,width:290,height:190,launchX:850,launchY:-660});
const cartoonProfiles={hero:{color:'#ff80cd',name:'モブラミ'},denden:{color:'#70e9ff',name:'モブデンデン'},nyoro:{color:'#ff8b46',name:'モブニョロ'},tetsu:{color:'#cf9fff',name:'モブテツ'}};
Object.assign(cartoonProfiles,{manny:{color:'#8de985',name:'モブマニー',displayBodyHeight:80},mobdesert:{color:'#c9a0ff',name:'モブデザート'}});
let cartoon,cartoonPlayer=null,cartoonCharacter=null;
const cartoonArt={},cartoonBindings=new Map();
let cartoonArtReady=Promise.resolve();
const cartoonHolds={guard:new Set(),crouch:new Set()};
function cartoonReset(){cartoon={action:null,combo:0,window:0,charge:null,air:0,airLeft:0,awake:0,awakeCooldown:0,cooldowns:[0,0],shots:[],effects:[],queued:false,buffer:0,hitStop:0,shake:0,flash:0,hits:0,hitWindow:0,uiClock:0};for(const button of cartoonBindings.values())button.classList.remove('pressed');cartoonBindings.clear();}
cartoonReset();
function cartoonActive(){return cartoonEnabled&&!!cartoonProfiles[selectedCharacter];}
function cartoonPosture(){if(!cartoonActive()||!player?.grounded||player.hp<=0||cartoon.action||cartoon.charge||dive||ropeRide)return null;return cartoonHolds.guard.size?'guard':cartoonHolds.crouch.size?'crouch':null;}
function cartoonReady(){return cartoonActive()&&state==='playing'&&player?.hp>0&&!bossIntro()&&!ropeRide&&!dive&&!cartoonPosture();}
function cartoonHold(type,source,down){if(!cartoonHolds[type])return;if(!down){cartoonHolds[type].delete(source);return;}if(cartoonActive()&&state==='playing'&&!bossIntro()&&player.hp>0)cartoonHolds[type].add(source);}
function cartoonSpeed(){return cartoon.awake>0?CARTOON.attackBoost:1;}
const cartoonTiming={light:[.065,.17],air:[.055,.17],slam:[.07,.20],launch:[.06,.19],blow:[.10,.22],rush:[.14,.46],specialRush:[.08,.47],water:[.36,.55],ranged:[.09,.16],dance:[1.28,1.28]};
Object.assign(cartoonTiming,{mannyBombs:[.35,1.1],mannyOrb:[.55,.8],desertSpin:[.16,.9],desertDragon:[.6,.95]});
function cartoonPhase(a){const [start,end]=a.timing|| (a.mobSlash?[CARTOON_MOB_SLASH.start,CARTOON_MOB_SLASH.end]:cartoonTiming[a.type]||[.07,.18]);return a.age<start?'startup':a.age<end?'active':'recovery';}
function cartoonAction(type,opts={}){cartoon.action={type,age:0,dir:player.dir,duration:.3,hit:new Set(),phase:'startup',...opts};cartoon.queued=false;cartoon.buffer=0;}
function cartoonWeak(){
 if(!cartoonReady()||cartoon.charge)return false;
 if(cartoon.action){if(['light','air','launch'].includes(cartoon.action.type)&&!(cartoon.action.type==='air'&&cartoon.action.index===3)){cartoon.queued=true;cartoon.buffer=selectedCharacter==='hero'?cartoon.action.duration-cartoon.action.age+1:.30;}return false;}
 if(!player.grounded){if(cartoon.air===0)cartoon.airLeft=1.35;if(cartoon.airLeft<=0||cartoon.air>=3)return false;cartoon.air++;cartoon.airLeft=1;player.vy=-220;cartoonAction('air',{index:cartoon.air,duration:.23});return true;}
 cartoon.combo=cartoon.window>0?cartoon.combo%4+1:1;cartoon.window=CARTOON.comboWindow;
 cartoonAction('light',{index:cartoon.combo,duration:selectedCharacter==='hero'?[0,.56,.595,.63,.7175][cartoon.combo]:cartoon.combo===4?.36:.25,...(selectedCharacter==='hero'?{timing:[.245,.42]}:{})});return true;
}
function cartoonCharge(source){if(!cartoonReady()||!player.grounded||cartoon.charge)return false;if(cartoon.action&&cartoon.action.type!=='light')return false;cartoon.charge={age:0,branch:cartoon.combo%4,source};cartoon.queued=false;return true;}
function cartoonRelease(source,cancel=false){
 const c=cartoon.charge;if(!c||c.source!==source)return false;cartoon.charge=null;
 if(cancel||!cartoonReady()){cartoon.combo=0;return false;}
 const power=.65+.35*Math.min(1,c.age/CARTOON.chargeTime),type=['blow','launch','ranged','rush'][c.branch];
 cartoon.combo=0;cartoon.window=0;cartoonAction(type,{power,duration:type==='rush'?.6:.36});
 if(type==='blow'&&selectedCharacter==='tetsu')Object.assign(cartoon.action,{mobSlash:true,duration:CARTOON_MOB_SLASH.duration,damageScale:power*(cartoon.awake>0?1.35:1),mobHits:Array.from({length:4},()=>new Set()),mobTargets:new Set(),mobLaunched:new Set()});
 if(type==='launch'){player.grounded=false;player.coyote=0;player.vy=-650;player.jumpsUsed=2;cartoon.air=0;cartoon.airLeft=1.35;}
 return true;
}
function cartoonSpecial(index){if(!cartoonReady()||cartoon.action||cartoon.charge||cartoon.cooldowns[index]>0)return false;cartoon.combo=0;cartoon.cooldowns[index]=index?10:8;if(['manny','mobdesert'].includes(selectedCharacter)){const type=(selectedCharacter==='manny'?['mannyBombs','mannyOrb']:['desertSpin','desertDragon'])[index];cartoonAction(type,{duration:index?1.3:1.4,empowered:cartoon.awake>0,specialIndex:index,unique:true});if(type==='desertSpin'){player.grounded=false;player.coyote=0;player.vy=-580;player.jumpsUsed=2;}return true;}cartoonAction(index?'water':'dance',{duration:index?1.05:1.28,empowered:cartoon.awake>0});if(index){player.grounded=false;player.coyote=0;player.vy=-800;player.jumpsUsed=2;}return true;}
function cartoonAwaken(){if(selectedCharacter!=='hero'||!cartoonReady()||cartoon.awakeCooldown>0||cartoon.awake>0)return false;cartoon.awake=CARTOON.awakeDuration;cartoon.awakeCooldown=CARTOON.awakeCooldown;return true;}
function cartoonCancel(){if(!cartoon)return;cartoon.charge=null;cartoon.action=null;cartoon.combo=0;cartoon.window=0;cartoon.air=0;cartoon.airLeft=0;cartoon.queued=false;cartoon.buffer=0;cartoon.hitStop=0;for(const button of cartoonBindings.values())button.classList.remove('pressed');cartoonBindings.clear();}
function cartoonImpact(x,y,heavy=false,dir=player.dir){
 cartoon.hitStop=Math.max(cartoon.hitStop,heavy?.075:.04);cartoon.shake=Math.max(cartoon.shake,heavy?.16:.09);cartoon.flash=heavy?.09:.035;
 cartoon.hits=cartoon.hitWindow>0?cartoon.hits+1:1;cartoon.hitWindow=1.4;
 cartoon.effects.push({kind:'impact',x,y,dir,r:heavy?65:36,life:.22,maxLife:.22});cartoon.effects=cartoon.effects.slice(-40);
}
function cartoonMove(dx){const old=player.x,oldY=player.y;player.x=clamp(old+dx,24,CONFIG.worldWidth-35);resolveStageSides(player,old,oldY,player.grounded);}
function cartoonHit(a,range,damage,launch=0){
 for(const e of combatTargets()){
  if(e.death>=0||a.hit.has(e))continue;
  const dx=(e.x-player.x)*a.dir;
  if(dx< -e.w/2-12||dx>range+e.w/2||e.y<player.y-115||e.y-e.h>player.y+30)continue;
  a.hit.add(e);hitEnemy(e,damage*(cartoon.awake>0?1.35:1)*(a.power||1),a.dir);
  cartoonImpact(e.x,e.y-e.h*.55,a.type!=='light'||a.index===4,a.dir);
  if(launch)launchEnemy(e,a.dir*(a.type==='air'?35:launch===-650?60:430),launch,launch>0?8:0);
  else if(e.type!=='crate')e.stun=Math.max(e.stun||0,.3);
 }
}
function cartoonMobPhase(age){const b=CARTOON_MOB_SLASH.boundaries;if(age<b[0]||age>=b[4])return -1;return age<b[1]?0:age<b[2]?1:age<b[3]?2:3;}
function cartoonMobSlash(a){
 const c=CARTOON_MOB_SLASH;if(a.age<c.start||a.age>=c.end)return;
 const phase=cartoonMobPhase(a.age),hit=a.mobHits[phase];
 for(const e of combatTargets()){
  if(e.death>=0||hit.has(e)||Math.abs(e.x-(player.x+a.dir*c.forward))>c.width/2+e.w/2||e.y<player.y-57-c.height/2||e.y-e.h>player.y-57+c.height/2)continue;
  hit.add(e);a.mobTargets.add(e);hitEnemy(e,Math.round(c.damage[phase]*a.damageScale),a.dir);cartoonImpact(e.x,e.y-e.h*.55,phase===3,a.dir);
  if(phase<3&&e.type!=='crate')e.stun=Math.max(e.stun||0,.28);
 }
 if(phase===3)for(const e of a.mobTargets){if(a.mobLaunched.has(e))continue;a.mobLaunched.add(e);launchEnemy(e,a.dir*c.launchX,c.launchY);}
}
function cartoonReleaseArt(a){const prefix=selectedCharacter==='hero'?'':selectedCharacter+'/',form=cartoon.awake>0?'awakened-':'',key=a.unique?'special'+(a.specialIndex+1)+'-active':a.type==='water'?'special2-active':a.type;return cartoonArt[prefix+form+key]||cartoonArt[prefix+form+a.type];}
// Special active clips include pre-release cels; release at their authored frame within the active window.
function cartoonReleaseTime(a){
 const timing=cartoonTiming[a.type];if(!timing)return 0;
 if(!a.unique&&a.type!=='water')return timing[0];
 const art=cartoonReleaseArt(a),index=art?.releaseFrame,first=art?.frameRange?.[0]||0,last=art?.frameRange?.[1]||art?.frames.length;
 if(!Number.isInteger(index)||index<first||index>=last)return timing[0];
 const offset=first?art.ends[first-1]:0,duration=art.ends[last-1]-offset,before=(index?art.ends[index-1]:0)-offset;
 return timing[0]+(timing[1]-timing[0])*before/duration;
}
function cartoonReleaseOrigin(a){const socket=cartoonReleaseArt(a)?.releaseSocket;if(!socket)return null;const h=cartoonProfiles[selectedCharacter].displayBodyHeight||110;return {x:player.x+a.dir*socket[0]*h,y:player.y+socket[1]*h};}
function cartoonReleasePose(art,a,age,duration){
 if(!a||art.releaseFrame===undefined)return cartoonFrame(art,age,duration);
 const first=art.frameRange?.[0]||0,last=art.frameRange?.[1]||art.frames.length,index=art.releaseFrame;if(index<first||index>=last)return cartoonFrame(art,age,duration);
 const event=cartoonTiming[a.type]?cartoonReleaseTime(a):undefined;if(event===undefined)return cartoonFrame(art,age,duration);const localEvent=event-(a.age-age);
 if(age<localEvent&&index>first)return cartoonFrame({...art,frameRange:[first,index],loop:false},age,Math.max(.000001,localEvent));
 return cartoonFrame({...art,frameRange:[index,last],loop:false},Math.max(0,age-localEvent),Math.max(.000001,duration-localEvent));
}
function cartoonShot(a,water=false){const origin=cartoonReleaseOrigin(a)||{x:player.x+a.dir*36,y:player.y-55};cartoon.shots.push({...(!water&&selectedCharacter==='manny'?{fx:'strong-projectile',impactFX:'strong-impact'}:{}),x:origin.x,y:origin.y,vx:a.dir*(water?650:900),vy:water?750:0,r:water?(a.empowered?135:110):26,life:1.7,age:0,damage:water?(a.empowered?80:52):30,hit:new Set(),water,dir:a.dir});}
// One complete 16-cel attack, not each special phase, owns this presentation clock.
function cartoonPresentedFrame(art,a,age){return cartoonReleasePose(art,{...a,age},age,a.duration);}
function cartoonPresentedBoundary(art,a,index){
 const release=art.releaseFrame;
 if(Number.isInteger(release)&&release>=0&&release<art.frames.length&&cartoonTiming[a.type]){
  const event=cartoonReleaseTime(a),offset=release?art.ends[release-1]:0;
  return index<release?event*art.ends[index]/offset:event+(a.duration-event)*(art.ends[index]-offset)/(art.duration-offset);
 }
 return art.ends[index]/art.duration*a.duration;
}
function cartoonPresentedAdvance(a,dt,requested){return requested;}
function cartoonStep(dt){
 if(!cartoonActive())return;
 if(player!==cartoonPlayer){cartoonReset();cartoonPlayer=player;}
 if(selectedCharacter!==cartoonCharacter){cartoonCancel();cartoon.awake=0;cartoonCharacter=selectedCharacter;}
 cartoon.awake=Math.max(0,cartoon.awake-dt);cartoon.awakeCooldown=Math.max(0,cartoon.awakeCooldown-dt);cartoon.cooldowns=cartoon.cooldowns.map(c=>Math.max(0,c-dt));
 cartoon.buffer=Math.max(0,cartoon.buffer-dt);cartoon.hitWindow=Math.max(0,cartoon.hitWindow-dt);if(!cartoon.hitWindow)cartoon.hits=0;
 for(const name of ['hurtAge','recoveryAge','awakeningStart','awakeningEnd'])cartoon[name]=Math.max(0,(cartoon[name]||0)-dt);
 if(!cartoon.charge&&!cartoon.action){cartoon.window=Math.max(0,cartoon.window-dt);if(!cartoon.window)cartoon.combo=0;}
 cartoon.airLeft=Math.max(0,cartoon.airLeft-dt);if(player.grounded){cartoon.air=0;cartoon.airLeft=0;}
 if(cartoon.charge)cartoon.charge.age+=dt;
 const a=cartoon.action;
 if(a){
  // Keep the two spin revolutions readable in both forms; rush still accelerates.
  let advance=dt*(a.type==='dance'?1:cartoonSpeed());
  advance=cartoonPresentedAdvance(a,dt,advance);
  if(cartoon.action!==a)return;
  a.age+=advance;
  a.phase=cartoonPhase(a);
  if(a.type==='dance'&&a.age>=a.duration){cartoonAction('specialRush',{duration:.65,empowered:a.empowered});}
  else {
   const speed=['pinkMagic','pinkShield'].includes(a.type)?0:['hero','pink'].includes(selectedCharacter)&&a.type==='light'?(a.phase==='recovery'?10:30):a.unique?0:a.mobSlash?(a.phase==='recovery'?10:35):a.type==='rush'?(a.phase==='active'?680:25):a.type==='specialRush'?(a.phase==='active'?(a.empowered?1050:800):20):a.type==='dance'?0:a.phase==='recovery'?15:85;
   cartoonMove(a.dir*speed*advance);
   if(a.phase==='active'&&advance>0){
    if(a.unique)cartoonUniqueSpecial(a);
    if(a.type==='light')cartoonHit(a,90,[0,12,14,16,24][a.index],a.index===4?-220:0);
    if(a.type==='air')cartoonHit(a,115,a.index===3?18:14,-220);
    if(a.type==='slam')cartoonHit(a,145,30,1050);
    if(a.type==='launch')cartoonHit(a,105,22,-650);
    if(a.type==='blow'){if(a.mobSlash)cartoonMobSlash(a);else cartoonHit(a,125,34,-350);}
    if(a.type==='rush')cartoonHit(a,155,42,-260);
    if(a.type==='specialRush')cartoonHit(a,a.empowered?190:135,a.empowered?88:60,-400);
   }
   if((a.type==='ranged'&&a.age>=(a.timing?.[0]??.09)||a.type==='water'&&a.age>=cartoonReleaseTime(a))&&!a.fired){a.fired=true;cartoonShot(a,a.type==='water');}
   if(a.age>=a.duration){if(a.type==='air'&&a.index===3){cartoonAction('slam',{duration:.32});player.vy=850;}else{const queue=cartoon.queued&&cartoon.buffer>0;cartoon.action=null;cartoon.queued=false;if(a.type==='light')cartoon.window=selectedCharacter==='hero'?1:CARTOON.comboWindow;if(queue&&!cartoon.charge)cartoonWeak();}}
  }
 }
 for(const s of cartoon.shots){
  const oldX=s.x,oldY=s.y;s.age+=dt;if(!s.delay||s.age>=s.delay){if(s.orb&&!s.rolling)s.vy+=900*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;if(s.orb&&s.y>=CONFIG.groundY-(s.floorOffset||112)){s.y=CONFIG.groundY-(s.floorOffset||112);s.vy=0;s.vx=s.dir*420;s.rolling=true;}}s.life-=dt;
  for(const e of combatTargets()){
   if(e.death>=0||s.hit.has(e)||s.delay&&s.age<s.delay)continue;
   if(Math.max(oldX,s.x)+s.r<e.x-e.w/2||Math.min(oldX,s.x)-s.r>e.x+e.w/2||Math.max(oldY,s.y)+s.r<e.y-e.h||Math.min(oldY,s.y)-s.r>e.y)continue;
   s.hit.add(e);hitEnemy(e,s.damage,s.dir);launchEnemy(e,s.dir*220,-200,0);cartoonImpact(e.x,e.y-e.h*.5,s.water,Math.sign(s.vx)||s.dir);
   if(s.impactFX){const life=s.orb?1.344:.672;cartoon.effects.push({kind:'spell-impact',fx:s.impactFX,x:s.x,y:s.y,dir:s.dir,life,maxLife:life,r:s.orb?240:88});s.life=0;break;}
  }
  if(s.water&&s.y>=CONFIG.groundY){cartoon.effects.push({kind:'splash',dir:Math.sign(s.vx)||s.dir,x:s.x,y:CONFIG.groundY,r:s.r*2,life:.35,maxLife:.35});s.life=0;}
 }
 cartoon.shots=cartoon.shots.filter(s=>s.life>0);for(const f of cartoon.effects)f.life-=dt;cartoon.effects=cartoon.effects.filter(f=>f.life>0);
}
// Transparent effect canvases are separate sprites; no character pixels are baked into them.
function cartoonEffectSprite(color){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.strokeStyle='#163b60';g.lineWidth=10;g.fillStyle=color;g.beginPath();g.ellipse(128,128,110,85,0,0,Math.PI*2);g.fill();g.stroke();g.strokeStyle='#ffffff';g.lineWidth=9;g.beginPath();g.ellipse(120,115,76,49,-.25,.2,4.2);g.stroke();return c;}
const cartoonFX={water:cartoonEffectSprite('#60dbff'),aura:cartoonEffectSprite('#ff8bd377')};
for(const [id,p] of Object.entries(cartoonProfiles))cartoonFX[id]=cartoonEffectSprite(p.color+'77');
function cartoonDrawFX(){
 if(!cartoonActive()||!player)return;
 const color=cartoonProfiles[selectedCharacter].color;
 ctx.save();
 for(const s of cartoon.shots){const dir=Math.sign(s.vx)||s.dir,orientation={mode:s.fx==='special2-orb'?'fixed':'velocity',angle:s.vx||s.vy?Math.atan2(s.vy,s.vx):undefined};cartoonDrawEffect(s.fx||(s.water?'special2-water':'ranged'),s.x,s.y,s.r*2,s.age,undefined,dir,null,orientation);}
 for(const f of cartoon.effects){ctx.globalAlpha=f.fx?1:f.life/(f.maxLife||.35);cartoonDrawEffect(f.fx||(f.kind==='impact'?(f.r>40?'hit-heavy':'hit-light'):'special2-splash'),f.x,f.y,f.r*2,(f.maxLife||.35)-f.life,f.maxLife,f.dir||1,null,{mode:f.kind==='impact'?'facing':'fixed'});}
 ctx.globalAlpha=1;
 if(cartoon.awake>0||cartoon.action?.type==='specialRush'){ctx.globalAlpha=.48+.12*Math.sin(elapsed*16);if(!cartoonDrawEffect(cartoon.action?.type==='specialRush'?'special1-aura':'awakening-aura',player.x,player.y-55,120,elapsed,undefined,cartoon.action?.type==='specialRush'?cartoon.action.dir:player.dir)){/* Dedicated sprite pending: no geometric substitute. */}ctx.globalAlpha=1;}
 if(cartoon.charge){const r=Math.min(1,cartoon.charge.age/CARTOON.chargeTime);rounded(player.x-camera-35,player.y-125,70,8,4,'#142c45');rounded(player.x-camera-34,player.y-124,68*r,6,3,color);text(['吹き飛ばし','打ち上げ','遠距離','広範囲突進'][cartoon.charge.branch],player.x-camera,player.y-136,13);}
 if(cartoon.action){const a=cartoon.action;text(a.type==='dance'?'DANCE / 無敵':a.type==='air'?`AIR ${a.index}/3`:a.type==='light'?`COMBO ${a.index}/4`:'',player.x-camera,player.y-110,15,color);}
 if(cartoon.hits>1)text(`${cartoon.hits} HIT`,clamp(player.x-camera+100,70,W-70),Math.max(140,player.y-160),22,color);
 const current=cartoon.action;
 const a=current?.clockArt?{...current,age:Math.max(0,current.presentedAge)}:current;
 if(a?.clockArt)a.phase=cartoonPhase(a);
 if(a?.mobSlash)cartoonDrawEffect('mob-slash-trail',player.x,player.y,120,a.age,a.duration,a.dir);
 if(a?.mobSlash&&cartoonMobPhase(a.age)>=0){
  const phase=cartoonMobPhase(a.age),size=phase===3?330:290;
  if(!cartoonDrawEffect('mob-slash-letters',player.x+a.dir*155,player.y-57,size,a.age-CARTOON_MOB_SLASH.boundaries[phase],.18,a.dir,['m','mo','mob','burst'][phase]))drawTetsuEffect(8,phase,player.x+a.dir*155,player.y-57,size,a.dir);
 }
 if(a&&['dance','water','specialRush'].includes(a.type)){
  ctx.fillStyle='#0b173126';ctx.fillRect(0,cameraY,W,36);ctx.fillRect(0,cameraY+H-36,W,36);
  text(a.type==='dance'?'DANCE → RUSH':a.type==='water'?'WATER BURST':'AURA RUSH',W/2,cameraY+145,18,color);
  // Startup is represented by the authored body and dedicated FX only.
 }
 if(a?.type==='specialRush'&&selectedCharacter==='hero')cartoonDrawEffect('special1-rush',player.x,player.y,220,a.age,a.duration,a.dir);
 if(cartoon.charge)cartoonDrawEffect('charge',player.x,player.y-50,110,cartoon.charge.age,undefined,player.dir);
 const strongKey=a&&({blow:'strong-blow',launch:'strong-launch',rush:'strong-rush'})[a.type];
 const dedicatedStrong=selectedCharacter==='hero'&&strongKey&&cartoonEffectArt(strongKey);
 if(dedicatedStrong&&(!a.clockArt||a.firstPresented))cartoonDrawEffect(strongKey,player.x,player.y,220,a.age,a.duration,a.dir);
 if(!dedicatedStrong&&a?.phase==='active'&&['launch','rush','specialRush'].includes(a.type))cartoonDrawEffect(a.type==='launch'?'launch':'rush-trail',player.x,player.y-45,150,a.age,a.duration,a.dir);
 if(a?.type==='slam')cartoonDrawEffect('slam',player.x,player.y-15,145,a.age,a.duration,a.dir);
 if(cartoon.awakeningStart>0)cartoonDrawEffect('awakening-burst',player.x,player.y-50,180,.4-cartoon.awakeningStart,.4,cartoon.awakeningDir||player.dir);
 if(cartoon.flash>0&&!cartoonReducedMotion){ctx.fillStyle=`rgba(255,244,208,${Math.min(.08,cartoon.flash)})`;ctx.fillRect(0,cameraY,W,H);}
 ctx.restore();
}
function cartoonUI(){
 const active=cartoonActive();if($('cartoon-strong'))$('cartoon-strong').hidden=!active;if(!active)return;
 if($('shoot').dataset.cartoon!=='1'||!$('shoot').textContent.includes('弱')){$('shoot').innerHTML='<span>J</span>弱';$('shoot').dataset.cartoon='1';}
 $('ammo').hidden=true;
 skillButtons.forEach((b,i)=>{b.hidden=i===2&&selectedCharacter!=='hero';const label=['必殺1 ダンス突進','必殺2 水エネルギー','覚醒'][i];if(b.getAttribute('aria-label')!==label)b.setAttribute('aria-label',label);const cd=i===2?cartoon.awakeCooldown:cartoon.cooldowns[i];const value=i===2?(cartoon.awake>0?'覚醒 '+cartoon.awake.toFixed(1):cd>0?cd.toFixed(1):'覚醒 E'):(cd>0?cd.toFixed(1):'必殺 '+(i+1));const small=b.querySelector('small');if(small.textContent!==value)small.textContent=value;b.classList.toggle('cooling',cd>0);b.setAttribute('aria-disabled',String(cd>0));});
 const help='A D 移動 / SPACE 跳ぶ / J 弱 / K 強HOLD / L ガード / C しゃがむ / S DIVE / 1・2 必殺 / E 覚醒';const el=document.querySelector('.keyboard-help');if(el.textContent!==help)el.textContent=help;
 const copy='弱1→強: 打ち上げ・空中弱3 / 弱2→強: 遠距離 / 弱3→強: 広範囲突進';if($('character-copy').textContent!==copy)$('character-copy').textContent=copy;
}

if(cartoonEnabled){
 const baseReset=reset;reset=function(){cartoonReset();baseReset();cartoonPlayer=player;cartoonCharacter=selectedCharacter;};
 const baseClear=clearInput;clearInput=function(){baseClear();cartoonCancel();};
 const baseDamage=damagePlayer;damagePlayer=function(e,n){if(cartoonActive()&&(cartoon.action?.type==='dance'||cartoon.action?.unique&&cartoon.action.specialIndex===0&&cartoon.action.phase==='startup'))return;const hp=player.hp;baseDamage(e,n);if(player.hp<hp&&cartoonActive())cartoonCancel();};
 const baseTick=tick;tick=function(dt){if(state==='playing'&&!bossIntro()){cartoonStep(dt);if(cartoonActive()&&cartoon.awake>0&&!cartoon.action&&!cartoon.charge){const direction=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);const move=direction|| (Math.abs(axis)>.35?Math.sign(axis):0);cartoonMove(move*(running?CONFIG.dashSpeed:CONFIG.walkSpeed)*(CARTOON.moveBoost-1)*dt);}}baseTick(dt);};
 const baseHUD=updateHUD;updateHUD=function(){baseHUD();cartoonUI();};
 const baseUI=updateCharacterUI;updateCharacterUI=function(){baseUI();cartoonUI();};
 const baseFX=drawSkills;drawSkills=function(){baseFX();cartoonDrawFX();};
 const baseDraw=drawPlayer;drawPlayer=function(){if(!cartoonActive())return baseDraw();ctx.save();if(cartoon.awake>0){ctx.shadowColor=cartoonProfiles[selectedCharacter].color;ctx.shadowBlur=22;}if(['hero','manny','mobdesert'].includes(selectedCharacter))cartoonDrawHero();else if(selectedCharacter==='tetsu'&&cartoon.action){const f=tetsuFrames.NA[Math.floor(cartoon.action.age*18)%tetsuFrames.NA.length];paintTetsu(f,player.x,player.y,player.dir);}else baseDraw();ctx.restore();};
 const strong=document.createElement('button');strong.id='cartoon-strong';strong.innerHTML='<span>K</span>強 HOLD';strong.setAttribute('aria-label','強攻撃 長押しして放す');document.querySelector('.buttons').prepend(strong);
 function actionFor(target){if(target.closest('#cartoon-strong'))return 'strong';if(target.closest('#shoot'))return 'weak';const b=target.closest('[data-skill]');return b?['special0','special1',selectedCharacter==='hero'?'awake':'special2'][Number(b.dataset.skill)]:null;}
 function input(action,source,release,cancel){if(action==='strong'){if(release)cartoonRelease(source,cancel);else cartoonCharge(source);}else if(!release){if(action==='weak')cartoonWeak();else if(action==='awake')cartoonAwaken();else cartoonSpecial(Number(action.slice(-1)));}}
 for(const event of ['keydown','keyup'])window.addEventListener(event,e=>{if(!cartoonActive()||e.target.closest?.('input,textarea,select'))return;const action={KeyJ:'weak',KeyK:'strong',Digit1:'special0',Digit2:'special1',Digit3:selectedCharacter==='hero'?'awake':'special2',KeyE:'awake'}[e.code];if(!action)return;e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)input(action,'keyboard',event==='keyup',false);},true);
 for(const event of ['pointerdown','pointerup','pointercancel','lostpointercapture'])document.addEventListener(event,e=>{if(!cartoonActive())return;const action=actionFor(e.target);if(!action)return;e.preventDefault();e.stopImmediatePropagation();const button=e.target.closest('button');if(event==='pointerdown'){if(!cartoonReady())return;button.setPointerCapture(e.pointerId);cartoonBindings.set(e.pointerId,button);button.classList.add('pressed');input(action,`p${e.pointerId}`,false,false);}else{cartoonBindings.delete(e.pointerId);if(![...cartoonBindings.values()].includes(button))button.classList.remove('pressed');input(action,`p${e.pointerId}`,true,event!=='pointerup');}},true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cartoonCancel();});
 window.addEventListener('blur',cartoonCancel);
}
function cartoonDrawHero(){
 if(!cartoonDrawCharacter())text(cartoonProfiles[selectedCharacter].name+' / 読み込み中',player.x-camera,player.y-45,16);
}
const cartoonTextures=new Map(),cartoonLoading=new Map(),cartoonAssetErrors=[];
const cartoonTextureBudget=64*1024*1024;
const cartoonTextureQueue=new Map(),cartoonTextureFailures=new Map();
let cartoonPoseFallback=null;
let cartoonTextureEpoch=0,cartoonTextureContext='',cartoonTextureBusy=false,cartoonTextureReserved=0,cartoonTexturePeak=0,cartoonTextureClock=0,cartoonTexturePlan='';
function cartoonTextureBytes(){return [...cartoonTextures.values()].reduce((n,t)=>n+t.bytes,cartoonPoseFallback?256*256*4:0);}
function cartoonDisposeTexture(src){const t=cartoonTextures.get(src);if(t){t.image.close?.();cartoonTextures.delete(src);}}
function cartoonTextureStats(){return {bytes:cartoonTextureBytes(),reserved:cartoonTextureReserved,peak:cartoonTexturePeak,budget:cartoonTextureBudget,cached:cartoonTextures.size,queued:cartoonTextureQueue.size,inFlight:cartoonLoading.size,failures:cartoonTextureFailures.size};}
function cartoonTextureRequest(src,priority=0){
 if(cartoonTextures.has(src)||cartoonLoading.has(src))return;
 const failed=cartoonTextureFailures.get(src);if(failed&&(failed.attempts>=3||performance.now()<failed.retryAt))return;
 const prior=cartoonTextureQueue.get(src);if(prior)prior.priority=Math.min(prior.priority,priority);else if(cartoonTextureQueue.size<24)cartoonTextureQueue.set(src,{priority,epoch:cartoonTextureEpoch});
 void cartoonTexturePump();
}
function cartoonImageSize(width,height,format){
 if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||width<1||height<1||width>4096||height>4096)throw Error('Texture dimension exceeded');
 const bytes=width*height*4;if(!Number.isSafeInteger(bytes)||bytes>cartoonTextureBudget-256*256*4)throw Error('Texture budget exceeded');return {width,height,bytes,format};
}
async function cartoonImageHeader(blob){
 if(blob.size>64*1024*1024)throw Error('Encoded atlas exceeds 64MiB');
 const read=async(start,n)=>{if(start<0||start+n>blob.size)throw Error('Truncated image header');return new DataView(await blob.slice(start,start+n).arrayBuffer());};
 const head=await read(0,12);
 if(head.getUint32(0)===0x89504e47&&head.getUint32(4)===0x0d0a1a0a){const h=await read(8,25);if(h.getUint32(0)!==13||h.getUint32(4)!==0x49484452)throw Error('Invalid PNG IHDR');return cartoonImageSize(h.getUint32(8),h.getUint32(12),'PNG');}
 if(head.getUint32(0)!==0x52494646||head.getUint32(8)!==0x57454250||head.getUint32(4,true)+8!==blob.size||(blob.size%2))throw Error('Invalid WebP RIFF');
 let offset=12,canvas=null,image=null,chunks=0;
 while(offset<blob.size){if(++chunks>1024)throw Error('Too many WebP chunks');const h=await read(offset,8),tag=h.getUint32(0),length=h.getUint32(4,true),start=offset+8,end=start+length,next=end+(length%2);if(next>blob.size)throw Error('Truncated WebP chunk');
  if(tag===0x414e494d||tag===0x414e4d46)throw Error('Animated WebP not allowed');
  if(tag===0x56503858){if(offset!==12||canvas||length!==10)throw Error('Invalid VP8X');const d=await read(start,10),flags=d.getUint8(0);if(flags&2)throw Error('Animated WebP not allowed');if(flags&0xc1||d.getUint8(1)||d.getUint8(2)||d.getUint8(3))throw Error('Invalid VP8X reserved bits');const u24=p=>d.getUint8(p)+256*d.getUint8(p+1)+65536*d.getUint8(p+2);canvas=cartoonImageSize(u24(4)+1,u24(7)+1,'WebP VP8X/VP8L');}
  if(tag===0x5650384c){if(image||length<5)throw Error('Invalid VP8L');const d=await read(start,5),bits=d.getUint32(1,true);if(d.getUint8(0)!==0x2f||bits>>>29)throw Error('Invalid VP8L signature/version');image=cartoonImageSize((bits&0x3fff)+1,((bits>>>14)&0x3fff)+1,'WebP VP8L');}
  if(tag===0x56503820||tag===0x414c5048)throw Error('Only lossless VP8L WebP atlases are supported');
  if(length%2&&(await read(end,1)).getUint8(0)!==0)throw Error('Invalid WebP padding');offset=next;
 }
 if(!image||canvas&&(canvas.width!==image.width||canvas.height!==image.height))throw Error('Missing or inconsistent WebP dimensions');return canvas||image;
}
async function cartoonTexturePump(){
 if(cartoonTextureBusy)return;cartoonTextureBusy=true;
 try{while(cartoonTextureQueue.size){
  const [src,job]=[...cartoonTextureQueue].sort((a,b)=>a[1].priority-b[1].priority)[0];cartoonTextureQueue.delete(src);const controller=new AbortController();cartoonLoading.set(src,controller);
  let decoded=null;
  try{
   const response=await fetch(src,{signal:controller.signal});if(!response.ok)throw Error('Texture HTTP '+response.status);
   const blob=await response.blob(),{width,height,bytes}=await cartoonImageHeader(blob);
   if(job.epoch!==cartoonTextureEpoch)continue;
   // Speculation never displaces an already decoded pose. Demand uses LRU.
   if(job.priority>0&&cartoonTextureBytes()+bytes>cartoonTextureBudget)continue;
   for(const [key] of [...cartoonTextures].sort((a,b)=>a[1].used-b[1].used)){if(cartoonTextureBytes()+bytes<=cartoonTextureBudget)break;cartoonDisposeTexture(key);}
   cartoonTextureReserved=bytes;cartoonTexturePeak=Math.max(cartoonTexturePeak,cartoonTextureBytes()+bytes);
   decoded=await createImageBitmap(blob);
   if(job.epoch!==cartoonTextureEpoch){decoded.close();decoded=null;continue;}
   if(decoded.width!==width||decoded.height!==height)throw Error('Decoded dimensions differ from image header');
   cartoonTextures.set(src,{image:decoded,used:++cartoonTextureClock,bytes});decoded=null;cartoonTextureFailures.delete(src);
  }catch(error){decoded?.close?.();if(job.epoch===cartoonTextureEpoch&&error.name!=='AbortError'){const attempts=(cartoonTextureFailures.get(src)?.attempts||0)+1;cartoonTextureFailures.set(src,{attempts,retryAt:performance.now()+30000});if(cartoonTextureFailures.size>128)cartoonTextureFailures.delete(cartoonTextureFailures.keys().next().value);cartoonAssetErrors.push(src+': '+error.message);if(cartoonAssetErrors.length>50)cartoonAssetErrors.shift();}}
  finally{cartoonTextureReserved=0;cartoonLoading.delete(src);}
 }}finally{cartoonTextureBusy=false;}
}
function cartoonTexture(src){const cached=cartoonTextures.get(src);if(cached){cached.used=++cartoonTextureClock;return cached.image;}cartoonTextureRequest(src);return null;}
function cartoonPrefetch(force=false){
 const context=selectedCharacter+':'+(cartoon.awake>0?'awake':'normal');
 if(context!==cartoonTextureContext){cartoonTextureContext=context;cartoonTextureEpoch++;cartoonTexturePlan='';if(cartoonPoseFallback){cartoonPoseFallback.image.width=cartoonPoseFallback.image.height=0;cartoonPoseFallback=null;}cartoonTextureQueue.clear();for(const controller of cartoonLoading.values())controller.abort();for(const src of [...cartoonTextures.keys()])cartoonDisposeTexture(src);}
 const a=cartoon.action,prefix=selectedCharacter==='hero'?'':selectedCharacter+'/',form=cartoon.awake>0?'awakened-':'',motion=cartoon.charge?'charge-hold':a?(a.type==='light'?'light'+a.index:a.type==='air'?'air'+a.index:a.unique?'special'+(a.specialIndex+1)+'-'+a.phase:a.type):'idle',plan=context+':'+motion;
 if(!force&&plan===cartoonTexturePlan)return;cartoonTexturePlan=plan;
 const extra=selectedCharacter==='manny'?(a?.type==='mannyOrb'?['manny/special2-active','manny/effects/special2-orb','manny/effects/special2-orb-blast']:a?.type==='ranged'?['manny/effects/strong-projectile','manny/effects/strong-impact']:[]):selectedCharacter==='hero'&&a?.type==='dance'?['hero/effects/'+form+'special1-spin-back','hero/effects/'+form+'special1-spin-front']:[];
 for(const name of extra){const art=cartoonArt[name];if(art)for(const src of new Set(art.frames.map(f=>f.src)))cartoonTextureRequest(src,1);}

 for(const name of [...new Set(['idle',motion,'walk','light1','light2','light3','light4','dash','jump','charge-start','charge-hold'])]){const art=cartoonArt[prefix+form+name];if(art){const frame=art.frames[art.frameRange?.[0]||0];cartoonTextureRequest(frame.src,name==='idle'||name===motion?0:1);}}
}
function cartoonRememberPose(art,f,image){
 if(cartoonPoseFallback?.frame===f)return;
 if(!cartoonPoseFallback){if(cartoonTextureBytes()+cartoonTextureReserved+256*256*4>cartoonTextureBudget)return;const canvas=document.createElement('canvas');canvas.width=canvas.height=256;cartoonPoseFallback={image:canvas};}
 const canvas=cartoonPoseFallback.image,c=canvas.getContext('2d'),k=256/Math.max(f.rect[2],f.rect[3]);c.clearRect(0,0,256,256);combatBlit(c,image,f.rect,0,0,f.rect[2]*k,f.rect[3]*k);
 Object.assign(cartoonPoseFallback,{frame:f,art:{bodyHeight:(art.bodyHeight||f.rect[3])*k,nativeFacing:art.nativeFacing||1},f:{rect:[0,0,f.rect[2]*k,f.rect[3]*k],pivot:f.pivot.map(n=>n*k),authoredRootLift:f.authoredRootLift||0}});cartoonTexturePeak=Math.max(cartoonTexturePeak,cartoonTextureBytes()+cartoonTextureReserved);
}
function cartoonTransitionPhase(previous,next,phase,map){
 const time=phase*previous.duration;let index=previous.ends.findIndex(end=>time<end);if(index<0)index=previous.frames.length-1;
 const target=map[index];return (target?next.ends[target-1]:0)/next.duration;
}
function cartoonFrame(art,age,actionDuration){
 const [first,last]=art.frameRange||[0,art.frames.length],offset=first?art.ends[first-1]:0,duration=art.ends[last-1]-offset;let time=offset+(actionDuration?Math.min(.999999,Math.max(0,age/actionDuration))*duration:art.loop?age%duration:Math.min(age,duration-.000001));
 let index=last-1;for(let i=first;i<last;i++){if(time<art.ends[i]){index=i;break;}}return art.frames[index];
}
function cartoonNormalizeArt(value,base){
 if(value.displayScale!==undefined&&(!Number.isFinite(value.displayScale)||value.displayScale<=0||value.displayScale>8))throw Error('Invalid display scale');
 if(value.nativeFacing!==undefined&&![1,-1].includes(value.nativeFacing))throw Error('Invalid nativeFacing');
 if(value.orientationMode!==undefined&&!['velocity','facing','fixed'].includes(value.orientationMode))throw Error('Invalid orientationMode');
 if(value.nativeAngleRadians!==undefined&&(!Number.isFinite(value.nativeAngleRadians)||Math.abs(value.nativeAngleRadians)>Math.PI*2))throw Error('Invalid nativeAngleRadians');
 const pair=(v,name,positive,limit)=>{if(!Array.isArray(v)||v.length!==2||[0,1].some(i=>!Number.isFinite(v[i])||(positive?v[i]<=0:false)||Math.abs(v[i])>limit))throw Error('Invalid '+name);return [...v];};
 if(value.releaseSocket!==undefined)pair(value.releaseSocket,'releaseSocket',false,32);
 if(value.releaseFrame!==undefined&&(!Number.isInteger(value.releaseFrame)||value.releaseFrame<0||value.releaseFrame>=value.frames?.length))throw Error('Invalid releaseFrame');
 if(value.socket!==undefined){if(!value.socket||typeof value.socket!=='object'||Array.isArray(value.socket))throw Error('Invalid socket');if(value.socket.offset!==undefined)pair(value.socket.offset,'socket.offset',false,4096);if(value.socket.size!==undefined&&(!Number.isFinite(value.socket.size)||value.socket.size<=0||value.socket.size>4096))throw Error('Invalid socket.size');}
 if(!Array.isArray(value.frames)||value.frames.length<16)throw Error('Every animation must have at least 16 frame entries');
 const frames=value.frames.map(f=>{if(f.authoredRootLift!==undefined&&(!Number.isFinite(f.authoredRootLift)||Math.abs(f.authoredRootLift)>32))throw Error('Invalid authoredRootLift');const rect=f.rect||[f.x,f.y,f.w,f.h],pivot=f.pivot||value.pivot;if(!Array.isArray(rect)||rect.length!==4||rect.some(n=>!Number.isFinite(n))||rect[0]<0||rect[1]<0||rect[2]<=0||rect[3]<=0||!pivot||pivot.length!==2||!pivot.every(Number.isFinite)||!Number.isFinite(f.duration)||f.duration<=0)throw Error('Invalid rect, pivot or duration');const source=f.src||value.pages?.[f.page||0]||value.src;if(!source)throw Error('Missing texture source');return {rect,pivot,...(f.authoredRootLift!==undefined?{authoredRootLift:f.authoredRootLift}:{}),duration:f.duration,src:new URL(source,base).href,...(f.displaySize!==undefined?{displaySize:pair(f.displaySize,'displaySize',true,32)}:{}),...(f.socketOffset!==undefined?{socketOffset:pair(f.socketOffset,'socketOffset',false,32)}:{})};});
 if(new Set(frames.map(f=>`${f.src}:${f.rect.join(',')}`)).size<16)throw Error('At least 16 independently addressed frames required');
 for(const range of Object.values(value.phaseRanges||{}))if(!Array.isArray(range)||range.length!==2||!range.every(Number.isInteger)||range[0]<0||range[1]>frames.length||range[0]>=range[1])throw Error('Invalid phase range');
 let duration=0;const ends=frames.map(f=>(duration+=f.duration));return {...value,frames,duration,ends};
}
async function loadCartoonArt(manifest,base=new URL('combat/cartoon-manifest.json',location.href).href){
 const entries=Object.entries(manifest.animations||manifest);let cursor=0;
 await Promise.all(Array.from({length:8},async()=>{while(cursor<entries.length){const [key,value]=entries[cursor++];
  if(!value||typeof value!=='object'||(!value.src&&!value.adapter&&!value.pages))continue;
  try{let data=value,url=base;if(value.adapter){url=new URL(value.adapter,base).href;const response=await fetch(url,{cache:'no-cache'});if(!response.ok)throw Error('Adapter HTTP '+response.status);data={...await response.json(),...value};}cartoonArt[key]=cartoonNormalizeArt(data,url);}catch(error){cartoonAssetErrors.push(`${key}: ${error.message}`);}
 }}));
 for(const [key,alias] of Object.entries(manifest.aliases||{})){
  const target=cartoonArt[typeof alias==='string'?alias:alias.clip],range=typeof alias==='string'?null:alias.range||(alias.phase&&target?.phaseRanges?.[alias.phase]);
  if(!target||range&&(!Array.isArray(range)||range.length!==2||!range.every(Number.isInteger)||range[0]<0||range[1]>target.frames.length||range[0]>=range[1])){cartoonAssetErrors.push(`${key}: invalid alias or phase range`);continue;}
  cartoonArt[key]=range?{...target,frameRange:range,loop:false}:target;
 }
 cartoonPrefetch(true);
}
function cartoonEffectArt(key){
 const form=cartoon.awake>0?'awakened-':'';
 return cartoonArt[selectedCharacter+'/effects/'+form+key]||cartoonArt['effects/'+form+key];
}
function cartoonSpinLayers(a){
 if(selectedCharacter!=='hero'||a?.type!=='dance')return null;
 const ready=key=>{const art=cartoonEffectArt(key);if(!art)return false;const f=cartoonFrame(art,a.age,1.28),image=cartoonTexture(f.src);return !!image&&combatContains(image,f.rect);};
 // Request both before choosing; never show a half-loaded pair or double the single layer.
 const back=ready('special1-spin-back'),front=ready('special1-spin-front');
 if(back&&front)return {back:'special1-spin-back',front:'special1-spin-front',age:a.age,dir:a.dir};
 return ready('special1-spin')?{front:'special1-spin',age:a.age,dir:a.dir}:null;
}
function cartoonDrawSpinLayer(plan,layer){
 if(!plan?.[layer])return;
 const height=cartoonProfiles[selectedCharacter].displayBodyHeight||110;
 // The shared pivot is anchored 45px above the foot root at a 110px body height.
 cartoonDrawEffect(plan[layer],player.x,player.y-45*height/110,220,plan.age,1.28,plan.dir);
}
function cartoonDrawCharacter(){
 cartoonPrefetch();
 let key=cartoon.charge?'charge':cartoon.action?(cartoon.action.type==='light'?`light${cartoon.action.index}`:cartoon.action.type==='air'?`air${cartoon.action.index}`:cartoon.action.type):!player.grounded?'jump':Math.abs(player.vx)>1?(running?'dash':'walk'):'idle';
 const prefix=selectedCharacter==='hero'?'':selectedCharacter+'/',form=cartoon.awake>0?'awakened-':'';
 if(cartoonPosture())key=cartoonPosture();
 let phaseKey=null,phaseAge=cartoon.action?.age??player.anim,phaseDuration=cartoon.action?.duration;
 const a=cartoon.action;
 if(cartoon.charge){phaseKey=cartoon.charge.age<.2?'charge-start':'charge-hold';phaseAge=cartoon.charge.age<.2?cartoon.charge.age:cartoon.charge.age-.2;phaseDuration=cartoon.charge.age<.2?.2:undefined;}
 else if(a?.unique){phaseKey='special'+(a.specialIndex+1)+'-'+a.phase;const t=cartoonTiming[a.type],start=a.phase==='startup'?0:a.phase==='active'?t[0]:t[1],end=a.phase==='startup'?t[0]:a.phase==='active'?t[1]:a.duration;phaseAge=a.age-start;phaseDuration=end-start;}
 else if(a&&['dance','specialRush','water'].includes(a.type)){const timing=cartoonTiming[a.type];phaseKey=a.type==='dance'?'special1-startup':a.type==='specialRush'?(a.phase==='recovery'?'special1-recovery':'special1-active'):'special2-'+a.phase;const start=a.type==='dance'||a.type==='specialRush'&&a.phase!=='recovery'?0:a.phase==='startup'?0:a.phase==='active'?timing[0]:timing[1],end=a.type==='dance'?a.duration:a.type==='specialRush'&&a.phase!=='recovery'?timing[1]:a.phase==='startup'?timing[0]:a.phase==='active'?timing[1]:a.duration;phaseAge=a.age-start;phaseDuration=Math.max(.001,end-start);}
 else if(player.hp<=0)phaseKey='death';
 else if(cartoon.hurtAge>0){phaseKey='damage';phaseAge=.24-cartoon.hurtAge;phaseDuration=.24;}
 else if(cartoon.awakeningStart>0){phaseKey='awakening-start';phaseAge=.4-cartoon.awakeningStart;phaseDuration=.4;}
 else if(cartoon.awakeningEnd>0){phaseKey='awakening-end';phaseAge=.4-cartoon.awakeningEnd;phaseDuration=.4;}
 else if(!a&&cartoon.recoveryAge>0&&player.grounded&&Math.abs(player.vx)<1&&!cartoonPosture()){phaseKey='recovery';phaseAge=.2-cartoon.recoveryAge;phaseDuration=.2;}
 if(phaseKey&&cartoonArt[prefix+form+phaseKey])key=phaseKey;else{phaseAge=a?.age??player.anim;phaseDuration=a?.duration;}
 if(a||cartoon.charge)cartoon.motionKey=null;
 if(!a&&!cartoon.charge&&(!phaseKey||phaseKey==='recovery'&&(!player.grounded||Math.abs(player.vx)>1))){
  if(cartoon.motionKey!==key){const prior=cartoon.motionKey,oldPhase=cartoon.motionPhase||0;cartoon.motionKey=key;cartoon.motionStart=player.anim;cartoon.motionDistance=0;cartoon.motionX=player.x;
   if(selectedCharacter==='manny'&&['walk','dash'].includes(prior)&&['walk','dash'].includes(key)){const map=key==='dash'?[15,0,1,1,2,3,5,7,8,8,9,10,12,13,14,15]:[1,2,4,5,5,6,6,7,8,10,11,11,12,13,14,15];const next=cartoonArt[prefix+form+key];if(next?.strideDistance)cartoon.motionDistance=cartoonTransitionPhase(cartoonArt[prefix+form+prior],next,oldPhase,map)*next.strideDistance;}}

  cartoon.motionDistance=(cartoon.motionDistance||0)+Math.abs(player.x-(cartoon.motionX??player.x));cartoon.motionX=player.x;
  if(key==='jump'){phaseAge=player.jumpAge;phaseDuration=2*CONFIG.jumpForce/CONFIG.gravity;}
  else phaseAge=player.anim-(cartoon.motionStart||0);
 }
 let art=cartoonArt[prefix+form+key];
 if(['walk','dash'].includes(key)&&art?.strideDistance){cartoon.motionPhase=((cartoon.motionDistance||0)/art.strideDistance)%1;phaseAge=cartoon.motionPhase*art.duration;phaseDuration=undefined;}
 if(a&&a.clockArt===art)phaseAge=a.visualAge;
 // Only a replacement explicitly authored as one spin cycle loops twice.
 if(a?.type==='dance'&&art?.spinCycleDuration===.64){phaseAge=a.age%.64;phaseDuration=.64;}
 let f=art&&(a&&a.clockArt===art?cartoonPresentedFrame(art,a,phaseAge):cartoonReleasePose(art,a,phaseAge,phaseDuration)),image=f&&cartoonTexture(f.src);
 if(!image&&cartoonPoseFallback){({art,f,image}=cartoonPoseFallback);}
 if(!image){const idle=cartoonArt[prefix+form+'idle'];const fallback=idle&&cartoonFrame(idle,player.anim),cached=fallback&&cartoonTextures.get(fallback.src);if(cached){art=idle;f=fallback;image=cached.image;}else if(cartoonPoseFallback){({art,f,image}=cartoonPoseFallback);}else return false;}
 if(!combatContains(image,f.rect))return false;
 if(selectedCharacter==='manny'&&(!Number.isFinite(art.bodyHeight)||art.bodyHeight<=0))return false;
 if(image!==cartoonPoseFallback?.image)cartoonRememberPose(art,f,image);
 const spin=a?.type==='dance'?cartoonSpinLayers(a):null;
 if(spin)cartoonDrawSpinLayer(spin,'back');
 const k=(cartoonProfiles[selectedCharacter].displayBodyHeight||110)/(art.bodyHeight||f.rect[3]);ctx.save();ctx.translate(player.x-camera,player.y+(f.authoredRootLift||0)*(cartoonProfiles[selectedCharacter].displayBodyHeight||110));ctx.scale(player.dir*(art.nativeFacing||1),1);combatBlit(ctx,image,f.rect,-f.pivot[0]*k,-f.pivot[1]*k,f.rect[2]*k,f.rect[3]*k);ctx.restore();
 if(spin)cartoonDrawSpinLayer(spin,'front');
 // A fallback or an unloaded atlas never acknowledges an attack pose.
 if(a&&a.clockArt===art&&image!==cartoonPoseFallback?.image){a.presentedAge=a.visualAge;a.firstPresented=true;}
 return true;
}
const cartoonReducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function cartoonDrawEffect(key,x,y,size,age,duration,dir=1,phase=null,orientation={mode:'facing'}){
 const form=cartoon.awake>0?'awakened-':'',generic=/^special1-bomb-(pink|cyan|green|orange|purple)$/.test(key)?'special1-bomb':null;let art=cartoonArt[selectedCharacter+'/effects/'+form+key]||cartoonArt['effects/'+form+key];if(!art&&generic)return cartoonDrawEffect(generic,x,y,size,age,duration,dir,phase,orientation);if(!art)return false;
 if(phase){const index=['m','mo','mob','burst'].indexOf(phase);if(index<0)return false;const range=art.phaseRanges?.[phase]||[Math.floor(index*art.frames.length/4),Math.floor((index+1)*art.frames.length/4)];art={...art,frameRange:range,loop:false};}
 const f=cartoonFrame(art,age,duration),image=cartoonTexture(f.src);if(!image)return generic?cartoonDrawEffect(generic,x,y,size,age,duration,dir,phase,orientation):false;if(!combatContains(image,f.rect))return false;
 const bodyHeight=cartoonProfiles[selectedCharacter]?.displayBodyHeight||110,offset=f.socketOffset?f.socketOffset.map(n=>n*bodyHeight):art.socket?.offset||[0,0],legacyScale=(art.socket?.size||size)/Math.max(f.rect[2],f.rect[3]),width=orientation.displaySize?.[0]??(f.displaySize?f.displaySize[0]*bodyHeight*(art.displayScale||1):f.rect[2]*legacyScale),height=orientation.displaySize?.[1]??(f.displaySize?f.displaySize[1]*bodyHeight*(art.displayScale||1):f.rect[3]*legacyScale);ctx.save();ctx.translate(x-camera+offset[0]*dir,y+offset[1]);cartoonFXOrient(art,dir,orientation);combatBlit(ctx,image,f.rect,-f.pivot[0]*width/f.rect[2],-f.pivot[1]*height/f.rect[3],width,height);ctx.restore();return true;
}
function cartoonDrawEffectAtSize(key,x,y,width,height,age,duration,dir){if(!cartoonEnabled||![width,height].every(n=>Number.isFinite(n)&&n>0&&n<=4096))return false;return cartoonDrawEffect(key,x,y,Math.max(width,height),age,duration,dir,null,{mode:'facing',displaySize:[width,height]});}
function cartoonFXOrient(art,dir,orientation){
 const mode=orientation.mode==='fixed'?'fixed':art.orientationMode||orientation.mode||'facing';
 if(mode==='velocity'&&Number.isFinite(orientation.angle))ctx.rotate(orientation.angle-(art.nativeAngleRadians||0));
 else if(mode==='facing')ctx.scale(dir,1);
}

if(cartoonEnabled){
 const combatTick=tick;tick=function(dt){
  if(cartoonActive()&&state==='playing'){
   cartoon.shake=Math.max(0,cartoon.shake-dt);cartoon.flash=Math.max(0,cartoon.flash-dt);
   if(cartoon.hitStop>0){cartoon.hitStop=Math.max(0,cartoon.hitStop-dt);return;}
  }
  if(cartoonActive()&&['hero','pink'].includes(selectedCharacter)){
   const moving=Math.abs(axis)>.35||['KeyA','KeyD','ArrowLeft','ArrowRight'].some(k=>keys.has(k));
   if(moving||jumpRequest>0){
    cartoon.combo=0;cartoon.window=0;cartoon.queued=false;cartoon.buffer=0;
    if(cartoon.action?.type==='light'&&cartoon.action.phase==='recovery'){cartoon.action=null;cartoon.recoveryAge=0;}
   }
  }
  const locked=cartoonActive()&&(cartoon.action||cartoon.charge||cartoonPosture()),oldAxis=axis,held=[];
  if(locked){for(const key of ['KeyA','KeyD','ArrowLeft','ArrowRight'])if(keys.delete(key))held.push(key);axis=0;jumpRequest=0;}
  try{combatTick(dt);}finally{if(locked&&state==='playing'){axis=oldAxis;for(const key of held)keys.add(key);}}
 };
 const oldImage=playerImage;playerImage=function(){if(cartoonActive()&&selectedCharacter==='denden'){if(cartoon.charge)return skillSprites[Math.floor(player.anim*12)%8];if(cartoon.action)return sprites[24+Math.floor(cartoon.action.age*24)%8];}return oldImage();};
 const oldNyoroDraw=drawNyoro;drawNyoro=function(){const prior=nyoroAction;if(cartoonActive()&&cartoon.action){const a=cartoon.action;nyoroAction={type:a.type==='launch'?'upper':a.type==='water'?'meteor':'normal',age:a.age,dir:a.dir};}try{oldNyoroDraw();}finally{nyoroAction=prior;}};
 const hero=document.createElement('button');hero.dataset.character='hero';hero.textContent='モブラミ';hero.setAttribute('aria-pressed','false');hero.onclick=()=>selectCharacter('hero');document.querySelector('.character-options').prepend(hero);
 partyInfo.hero={name:'モブラミ',short:'モブラミ',line:'',color:'#ff80cd'};
 const baseParty=resetParty;resetParty=function(){baseParty();party.hero={hp:CONFIG.maxHP,regen:0,revive:0};const b=document.createElement('button');b.className='party-slot';b.dataset.party='hero';b.innerHTML='<img src="combat/portraits/hero.png" width="100" height="100" alt=""><span class="party-name">モブラミ</span><small></small>';b.onclick=()=>switchParty('hero');$('party').prepend(b);};
 cartoonArtReady=fetch('combat/cartoon-manifest.json?v=20261016-nyoro-move-1',{cache:'no-cache'}).then(r=>r.json()).then(loadCartoonArt);
}
// Keep world and combat sprites aligned during a small, opt-out camera impulse.
function cartoonCameraImpulse(fn,refresh=false){return function(...args){if(!cartoonActive()||cartoonReducedMotion||cartoon.shake<=0)return fn(...args);if(refresh)cartoon.cameraOffset=Math.sin(performance.now()*.07)*Math.min(4,cartoon.shake*25);const old=camera;camera+=cartoon.cameraOffset||0;try{return fn(...args);}finally{camera=old;}};}
if(cartoonEnabled){
 draw=cartoonCameraImpulse(draw,true);drawSkills=cartoonCameraImpulse(drawSkills);
 const oldDamage=damagePlayer;damagePlayer=function(...args){const hp=player.hp;oldDamage(...args);if(cartoonActive()&&player.hp<hp)cartoon.hurtAge=.24;};
 const oldAwaken=cartoonAwaken;cartoonAwaken=function(){const result=oldAwaken();if(result){cartoon.awakeningStart=.4;cartoon.awakeningDir=player.dir;}return result;};
 const oldStep=cartoonStep;cartoonStep=function(dt){const awake=cartoon.awake;oldStep(dt);if(awake>0&&cartoon.awake===0)cartoon.awakeningEnd=.4;};
 const legacyDraw=drawPlayer;drawPlayer=function(){if(cartoonActive()&&selectedCharacter!=='hero'&&cartoonDrawCharacter())return;legacyDraw();};
 const legacySkillHUD=updateSkillHUD;updateSkillHUD=function(){if(cartoonActive())cartoonUI();else legacySkillHUD();};
 const style=document.createElement('style');style.textContent=`
 #cartoon-strong{touch-action:none} .buttons{gap:clamp(5px,1vw,16px)}
 .actions button{touch-action:none} .actions button.pressed{filter:brightness(1.35);transform:scale(.95)}
 @media(max-width:920px){.actions .buttons button{min-width:44px;min-height:44px}.actions .skill{min-width:44px;min-height:44px}#dive{min-width:44px;min-height:44px}}
 `;document.head.append(style);
}
if(cartoonEnabled){
 const previousReset=cartoonReset;cartoonReset=function(){for(const set of Object.values(cartoonHolds))set.clear();previousReset();};
 const previousCancel=cartoonCancel;cartoonCancel=function(){for(const set of Object.values(cartoonHolds))set.clear();previousCancel();};
 const previousDamage=damagePlayer;damagePlayer=function(enemy,amount){
  const posture=cartoonPosture();
  if(posture==='crouch'&&Number.isFinite(enemy.y)&&Number.isFinite(enemy.h)&&enemy.y<player.y-38)return;
  if(posture==='guard'&&enemy.guardable!==false&&CONFIG.enemies[enemy.type]&&Number.isFinite(enemy.x)&&(enemy.x-player.x)*player.dir>=0){
   if(player.inv>0)return;const damage=amount??CONFIG.enemies[enemy.type].damage;player.hp=Math.max(0,player.hp-Math.max(1,Math.ceil(damage*.2)));player.inv=.18;player.red=.08;cartoon.hitStop=.025;
   cartoon.effects.push({kind:'impact',dir:player.dir,x:player.x+player.dir*27,y:player.y-40,r:24,life:.18,maxLife:.18});if(player.hp===0){cartoonCancel();partyDefeated();}return;
  }
  previousDamage(enemy,amount);
 };
 const oldHostileShot=hostileShotHit;hostileShotHit=function(x,y,nx,ny,r){if(!cartoonActive())return oldHostileShot(x,y,nx,ny,r);return hostileVictims().find(p=>segmentHitsBox(x,y,nx,ny,p.x-17-r,p.y-(p===pink?70:cartoonPosture()==='crouch'?38:65)-r,p.x+17+r,p.y+r));};
 const oldMiraOverlap=miraOverlap;miraOverlap=function(e,x,y,r,hostile){if(hostile&&e===player&&cartoonPosture()==='crouch')return Math.hypot(Math.max(0,Math.abs(e.x-x)-CONFIG.playerColliderWidth/2),Math.max(e.y-38-y,y-e.y,0))<=r;return oldMiraOverlap(e,x,y,r,hostile);};
 for(const event of ['keydown','keyup'])window.addEventListener(event,e=>{if(!cartoonActive()||e.target.closest?.('input,textarea,select'))return;const kind={KeyL:'guard',KeyC:'crouch'}[e.code];if(!kind)return;e.preventDefault();e.stopImmediatePropagation();cartoonHold(kind,'keyboard:'+e.code,event==='keydown');},true);
 const defense=document.createElement('div');defense.className='cartoon-defense';defense.innerHTML='<button id="cartoon-guard" aria-label="ガード L 長押し">GUARD<small>L HOLD</small></button><button id="cartoon-crouch" aria-label="しゃがみ C 長押し">DUCK<small>C HOLD</small></button>';document.querySelector('.actions').append(defense);
 for(const event of ['pointerdown','pointerup','pointercancel','lostpointercapture'])document.addEventListener(event,e=>{const button=e.target.closest('.cartoon-defense button');if(!button||!cartoonActive())return;e.preventDefault();e.stopImmediatePropagation();const kind=button.id==='cartoon-guard'?'guard':'crouch';if(event==='pointerdown'){if(state!=='playing'||bossIntro())return;button.setPointerCapture(e.pointerId);cartoonBindings.set(e.pointerId,button);cartoonHold(kind,'pointer:'+e.pointerId,true);button.classList.add('pressed');}else{cartoonBindings.delete(e.pointerId);cartoonHold(kind,'pointer:'+e.pointerId,false);if(![...cartoonBindings.values()].includes(button))button.classList.remove('pressed');}},true);
 const oldUI=cartoonUI;cartoonUI=function(){oldUI();defense.hidden=!cartoonActive();if(cartoonActive()){const el=document.querySelector('.keyboard-help');const value='A D 移動 / SPACE 跳ぶ / J 弱 / K 強HOLD / L ガード / C しゃがむ / S DIVE / 1・2 必殺 / E 覚醒';if(el.textContent!==value)el.textContent=value;for(const kind of ['guard','crouch'])$('cartoon-'+kind).setAttribute('aria-pressed',String(cartoonPosture()===kind));}};
 const oldDrawPlayer=drawPlayer;drawPlayer=function(){const posture=cartoonPosture();if(!posture)return oldDrawPlayer();ctx.save();if(!cartoonDrawCharacter()){if(posture==='crouch'){ctx.translate(player.x-camera,player.y);ctx.scale(1,.7);ctx.translate(-player.x+camera,-player.y);}oldDrawPlayer();}ctx.restore();if(posture==='guard'){ctx.save();ctx.strokeStyle='#9beaff';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(player.x-camera+player.dir*31,player.y-40,12,34,0,0,Math.PI*2);ctx.stroke();ctx.restore();}};
 const postureStyle=document.createElement('style');postureStyle.textContent='.cartoon-defense{position:absolute;right:25cqw;bottom:9cqw;display:flex;gap:6px}.cartoon-defense[hidden]{display:none}.cartoon-defense button{width:52px;height:48px;border:2px solid #9bcad6;border-radius:12px;background:#163c4eed;font-size:10px;font-weight:800;display:flex;flex-direction:column;align-items:center;justify-content:center}.cartoon-defense small{font-size:8px}.cartoon-defense button[aria-pressed="true"]{background:#357a91}';document.head.append(postureStyle);
}
if(cartoonEnabled){
 const beforeMobDraw=drawPlayer;drawPlayer=function(){if(cartoonActive()&&selectedCharacter==='tetsu'&&cartoon.action?.mobSlash){if(cartoonDrawCharacter())return;const frame=tetsuFrames.CS[Math.min(7,Math.floor(cartoon.action.age/.125))];paintTetsu(frame,player.x,player.y,cartoon.action.dir,player.inv>0&&Math.floor(player.inv*16)%2===0?.35:1);return;}beforeMobDraw();};
}

// New characters use shared controls and independent, provisional spell projectiles.
function cartoonUniqueSpecial(a){
 const origin=cartoonReleaseOrigin(a);
 const emit=(fx,x,y,vx,vy,r,damage,color,delay=0)=>cartoon.shots.push({fx,x:origin?origin.x:x,y:origin?origin.y:y,vx,vy,r,damage:damage*(a.empowered?1.35:1),color,delay,age:0,life:2.4,hit:new Set(),dir:a.dir});
 if(a.type==='desertSpin')cartoonHit(a,145,a.empowered?48:34,-300);
 if(a.fired||a.age<cartoonReleaseTime(a))return;a.fired=true;const x=player.x,y=player.y-55;
 if(a.type==='mannyBombs'){const n=a.empowered?8:5;for(let i=0;i<n;i++)emit('special1-bomb-'+['pink','cyan','green','orange','purple'][i%5],x+a.dir*(35+i*17),y-20-Math.sin(i/(n-1)*Math.PI)*55,a.dir*(240+i*30),65,18,12,['#ff83bb','#78edff','#8de985','#ffaa55','#bd89ff'][i%5],.12*i);}
 // Preserve the approved overhead socket; arc down, then skim at the visible orb's lower edge.
 if(a.type==='mannyOrb'){emit('special2-orb',x+a.dir*70,y-20,a.dir*160,120,94,70,'#c76cff');Object.assign(cartoon.shots.at(-1),{orb:true,floorOffset:180,r:170,impactFX:'special2-orb-blast'});}
 if(a.type==='desertSpin'){for(let i=0;i<(a.empowered?7:4);i++)emit('special1-fish',x+a.dir*40,y,a.dir*(380+i*25),90+i*35,22,10,'#b588ff');}
 if(a.type==='desertDragon')emit('special2-dragon',x+a.dir*85,y-10,a.dir*470,0,a.empowered?105:80,82,'#a877d9');
}
if(cartoonEnabled){
 for(const id of ['manny','mobdesert']){partyInfo[id]={name:cartoonProfiles[id].name,short:cartoonProfiles[id].name,line:'',color:cartoonProfiles[id].color};const b=document.createElement('button');b.dataset.character=id;b.textContent=cartoonProfiles[id].name;b.onclick=()=>selectCharacter(id);document.querySelector('.character-options').append(b);}
 const oldParty=resetParty;resetParty=function(){oldParty();for(const id of ['manny','mobdesert']){party[id]={hp:CONFIG.maxHP,regen:0,revive:0};const b=document.createElement('button');b.className='party-slot';b.dataset.party=id;b.title=partyInfo[id].name;b.setAttribute('aria-label',partyInfo[id].name+'に切り替え');const label=document.createElement('span');label.className='party-name';label.textContent=partyInfo[id].name;const portrait=document.createElement('img');portrait.src='combat/portraits/'+id+'.png';portrait.width=portrait.height=100;portrait.alt='';b.append(portrait,label,document.createElement('small'));b.onclick=()=>switchParty(id);$('party').append(b);}};
 const previousCancelNew=cartoonCancel;cartoonCancel=function(){previousCancelNew();cartoon.shots=cartoon.shots.filter(s=>!s.fx);};
 const oldNewUI=cartoonUI;cartoonUI=function(){oldNewUI();if(!['manny','mobdesert'].includes(selectedCharacter))return;const names=selectedCharacter==='manny'?['浮遊ボム群','巨大エネルギー球']:['回転斬り・魚群','紫煙の龍'];skillButtons.forEach((b,i)=>{if(i<2){b.title=names[i];b.setAttribute('aria-label',names[i]);if(cartoon.cooldowns[i]<=0)b.querySelector('small').textContent=names[i];const img=b.querySelector('img');if(img)img.hidden=true;}});};
 const sharedNewUI=updateCharacterUI;updateCharacterUI=function(){for(const b of skillButtons){const img=b.querySelector('img');if(img)img.hidden=false;}sharedNewUI();};
 const layout=document.createElement('style');layout.textContent='#party{max-width:52%;overflow-x:auto;flex-wrap:nowrap}.party-slot{flex-shrink:0}';document.head.append(layout);
}

// Opt-in Rami review room. Campaign stage data is retained.
const cartoonLab=new URLSearchParams(location.search).has('combat-lab');
if(cartoonEnabled&&cartoonLab){
 const originalReset=reset;reset=function(){selectedCharacter='hero';areaIndex=0;biomeIndex=0;originalReset();platforms=[];props=[];ropes=[];gaps=[];bridges=[];ramps=[];crumbles=[];trampolines=[];arenas=[];crates=[];coins=[];enemies=[];pink.enabled=false;player.x=300;player.y=CONFIG.groundY;for(const x of [520,850,1200])spawnGrassEnemy('tank',x);};
 finishGrassArea=function(){};
 const restart=document.createElement('button');restart.textContent='RAMI TEST / 再戦';restart.style.cssText='position:absolute;top:95px;left:16px;z-index:20';restart.onclick=()=>startGrassArea();document.querySelector('main').append(restart);
 const background=drawBackground;drawBackground=function(){background();rounded(20,cameraY+140,510,56,10,'#17363be6');text('RAMI TEST — 原画修復待ち / 操作確認',35,cameraY+164,18,'#fff','left');text('J 弱 / SHIFT+D 走る / SPACE 跳ぶ / 1 ダンス',35,cameraY+184,14,'#fff','left');};
}

// Restore original skills, including their original body/FX clocks, until replacement art matches them.
function cartoonOriginalSkill(){return selectedCharacter==='tetsu'&&!!tetsuAction||selectedCharacter==='nyoro'&&!!nyoroAction||selectedCharacter==='denden'&&(skillState.charging||skillState.releaseAge<.48||thunderLocked()||!!thunderBullet);}
if(cartoonEnabled){
 const ready=cartoonReady;cartoonReady=function(){return ready()&&!cartoonOriginalSkill();};
 const special=cartoonSpecial;cartoonSpecial=function(index){
  if(!['denden','nyoro','tetsu'].includes(selectedCharacter))return index<2?special(index):false;
  if(!cartoonReady()||cartoon.action||cartoon.charge||index<0||index>2)return false;
  cartoon.combo=0;cartoon.window=0;
  if(selectedCharacter==='denden'){if((index===2?thunderBulletCooldown:skillState.cooldowns[index])>0)return false;if(index===0)beginCharge('cartoon');else if(index===1)castThunder();else castThunderBullet();}
  else if(selectedCharacter==='nyoro'){if(nyoroCooldowns[index]>0)return false;castNyoro(index);}
  else {const mapped=index===2?0:index+1;if(tetsuCooldowns[mapped]>0)return false;castTetsu(mapped);}
  return true;
 };
 const body=drawPlayer;drawPlayer=function(){if(cartoonActive()&&cartoonOriginalSkill()){drawPlayerBody();return;}body();};
 const ui=cartoonUI;cartoonUI=function(){ui();if(!cartoonActive())return;
  const config={denden:{names:['トリック・ザ・デンデン','サンダーボルト'],cd:skillState.cooldowns},nyoro:{names:['ヒノフルカヨウ','炎列・大隕石'],cd:nyoroCooldowns},tetsu:{names:['モブテツ一閃','超吹き飛ばし'],cd:tetsuCooldowns.slice(1)}}[selectedCharacter];
  if(!config)return;skillButtons.forEach((b,i)=>{if(i>1){b.hidden=false;const label=selectedCharacter==='denden'?'デンデン・サンダー・バレット':selectedCharacter==='nyoro'?'炎の城':'MOB斬り',cd=selectedCharacter==='denden'?thunderBulletCooldown:selectedCharacter==='nyoro'?nyoroCooldowns[2]:tetsuCooldowns[0];b.title=label;b.setAttribute('aria-label',label);b.querySelector('small').textContent=cd>0?cd.toFixed(1)+'s':label;b.classList.toggle('cooling',cd>0);return;}b.title=config.names[i];b.setAttribute('aria-label',config.names[i]);b.querySelector('small').textContent=config.cd[i]>0?config.cd[i].toFixed(1)+'s':config.names[i];b.classList.toggle('cooling',config.cd[i]>0);b.setAttribute('aria-disabled',String(config.cd[i]>0||cartoonOriginalSkill()));});
 };
}
