'use strict';
const NYORO=Object.freeze({jumpForce:790,normal:18,upper:26,ember:4,rain:24,meteor:64,burn:2,cooldowns:[8,11,16]});
const nyoroFrames={},nyoroFire=[];
let nyoroAction=null,nyoroCooldowns=[0,0,0],nyoroGlide=false,nyoroCombo=0,nyoroFireClock=0,nyoroShots=[],nyoroFX=[],nyoroSummon=null,bombBursts=[];
async function loadNyoro(){await Promise.all([...Array.from({length:42},(_,i)=>i+1),235,236,237,238].map(async n=>{nyoroFrames[n]=await trimFrame(`nyoro/${String(n).padStart(3,'0')}.png`);}));await Promise.all(Array.from({length:5},async(_,i)=>{nyoroFire[i]=await trimFrame(`nyoro/0${i+1}.png`);}));}
function cancelNyoro(){nyoroAction=null;nyoroGlide=false;nyoroCombo=0;nyoroShots=[];nyoroSummon=null;nyoroFX=[];}
function resetNyoro(){cancelNyoro();nyoroCooldowns=[0,0,0];nyoroFireClock=0;}
function nyoroAttack(){if(selectedCharacter!=='nyoro'||state!=='playing')return;if(nyoroAction){if(nyoroAction.type==='normal')nyoroAction.queued=true;return;}nyoroGlide=false;nyoroAction={type:nyoroCombo>0?'upper':'normal',age:0,dir:player.dir,hit:new Map()};nyoroCombo=0;}
function castNyoro(i){if(state!=='playing'||selectedCharacter!=='nyoro'||nyoroAction||nyoroCooldowns[i]>0)return;nyoroGlide=false;nyoroAction={type:['rain','meteor','summon'][i],age:0,dir:player.dir,hit:new Map(),spawned:0};nyoroCooldowns[i]=NYORO.cooldowns[i];}
function burnEnemy(e){if(e.type==='crate'||e.death>=0)return;e.burn=Math.max(e.burn||0,1.2);e.burnClock??=.4;}
function flameHit(x,y,r,damage,dir=1,launch=false){for(const e of combatTargets()){if(e.death>=0)continue;const dx=Math.max(0,Math.abs(e.x-x)-e.w/2),dy=Math.max(e.y-e.h-y,y-e.y,0);if(Math.hypot(dx,dy)>r)continue;hitEnemy(e,damage,dir);burnEnemy(e);if(launch)launchEnemy(e,dir*170,-820,5);}}
function addFire(kind,x,y,owner=null){nyoroShots.push({kind,x,y,age:0,vy:kind==='ember'?140:570,owner,life:4});}
function updateNyoro(dt){
 nyoroCooldowns=nyoroCooldowns.map(c=>Math.max(0,c-dt));nyoroCombo=Math.max(0,nyoroCombo-dt);
 for(const e of enemies)if(e.burn>0&&e.death<0){e.burn-=dt;e.burnClock-=dt;if(e.burnClock<=0){e.burnClock+=.4;hitEnemy(e,NYORO.burn,Math.sign(e.x-player.x)||1);}}
 if(nyoroGlide){nyoroFireClock-=dt;if(nyoroFireClock<=0){nyoroFireClock=.28;addFire('ember',player.x,player.y-8);}}else nyoroFireClock=0;
 const a=nyoroAction;if(a){a.age+=dt;const t=a.age;
  if(a.type==='normal'||a.type==='upper'){
   if(t>=.16&&!a.struck){a.struck=true;if(a.type==='normal')tetsuHit(a,0,player.x+a.dir*65,player.y-40,150,105,NYORO.normal);else{flameHit(player.x+a.dir*35,player.y-45,115,NYORO.upper,a.dir,true);nyoroFX.push({x:player.x,y:player.y-40,r:120,age:0,kind:'aura'});}}
   if(t>=(a.type==='normal'?.44:.58)){nyoroAction=null;if(a.type==='normal'){nyoroCombo=.28;if(a.queued)nyoroAttack();}}
  }else if(a.type==='rain'){
   while(a.spawned<5&&t>=.12+a.spawned*.20){a.spawned++;const targets=enemies.filter(e=>e.death<0&&Math.abs(e.x-player.x)<420);const target=targets.length?targets[Math.floor(Math.random()*targets.length)]:null;addFire('rain',clamp(target?target.x+(Math.random()-.5)*70:player.x+(Math.random()-.5)*800,30,CONFIG.worldWidth-30),Math.min(-80,player.y-620),a);}
   if(a.spawned===5&&!nyoroShots.some(s=>s.owner===a))nyoroAction=null;
  }else if(a.type==='meteor'){
   while(a.spawned<5&&t>=.12+a.spawned*.12){const x=player.x+a.dir*(70+a.spawned*65);a.spawned++;const floor=supportFloorAt(x,player.y-90),y=Number.isFinite(floor)?floor-25:player.y-25;flameHit(x,y,45,8,a.dir);nyoroFX.push({x,y,r:45,age:0,kind:'flame'});}
   if(t>=.85&&!a.dropped){a.dropped=true;addFire('meteor',clamp(player.x+a.dir*300,40,CONFIG.worldWidth-40),Math.min(-100,player.y-700),a);}
   if(t>=1.1)nyoroAction=null;
  }else if(a.type==='summon'){
   if(t>=1&&!a.created){a.created=true;flameHit(player.x,player.y-35,185,26,a.dir);const base=supportFloorAt(player.x,player.y-1);nyoroSummon={x:clamp(player.x-120,0,CONFIG.worldWidth-240),w:240,y:Number.isFinite(base)?base:CONFIG.groundY,base:Number.isFinite(base)?base:CONFIG.groundY,h:0,age:0,type:'summon'};nyoroFX.push({x:player.x,y:player.y-40,r:170,age:0,kind:'aura'});}
   if(t>=1.55)nyoroAction=null;
  }
 }
 for(const s of nyoroShots){const old=s.y;s.age+=dt;s.life-=dt;s.vy+=800*dt;s.y+=s.vy*dt;const radius=s.kind==='ember'?13:s.kind==='rain'?32:60;const target=combatTargets().find(e=>e.death<0&&Math.abs(e.x-s.x)<e.w/2+radius&&s.y+radius>=e.y-e.h&&old-radius<=e.y);const floor=supportFloorAt(s.x,old-radius);
  if(target||(Number.isFinite(floor)&&s.y+radius>=floor)){s.y=target?Math.min(s.y,target.y-20):floor;const r=s.kind==='ember'?28:s.kind==='rain'?70:245;flameHit(s.x,s.y,r,s.kind==='ember'?NYORO.ember:s.kind==='rain'?NYORO.rain:NYORO.meteor,Math.sign(s.x-player.x)||1);nyoroFX.push({x:s.x,y:s.y,r,age:0,kind:s.kind==='meteor'?'explosion':'flame'});burst(s.x,s.y, s.kind==='meteor'?45:10,'#ff782d');s.life=0;}
 }
 nyoroShots=nyoroShots.filter(s=>s.life>0&&s.y<H+150);for(const f of nyoroFX)f.age+=dt;nyoroFX=nyoroFX.filter(f=>f.age<(f.kind==='explosion'?1.1:.55));
 updateSummon(dt);
}
function updateSummon(dt){
 const s=nyoroSummon;
 if(s){const old=s.y;s.age+=dt;s.h=(nyoroFrames[237].height/nyoroFrames[237].width*s.w)*Math.min(1,s.age/.5);s.y=s.base-s.h;
  for(const p of [player,pink,...enemies]){if(!p||p===pink&&!pink.enabled||p.death>=0)continue;const on=p.x>s.x-12&&p.x<s.x+s.w+12;if(on&&p.y>=s.y-.5&&p.y<=old+8&&(!p.launch||p.launch.vy>=0)){p.y=s.y;p.vy=0;p.grounded=true;if(p.launch)p.launch=null;if(p===player)nyoroGlide=false;if(p!==player&&p!==pink)p.summonRider=true;}
   if(on&&p.y>s.y-100&&p.y<s.base+20){if(p===player){if(selectedCharacter!=='nyoro')damagePlayer({x:p.x+1},2);}else if(p===pink)p.burn=.3;else burnEnemy(p);}
  }
  if(s.age>=3.5)nyoroSummon=null;
 }
 // Enemies ordinarily walk on a fixed floor; summoned terrain adds a real landing and fall.
 for(const e of enemies){if(e.launch&&e.summonRider&&!nyoroSummon){const floor=supportFloorAt(e.x,e.y+1);e.launch.floor=Number.isFinite(floor)?floor:CONFIG.groundY;}if(e.death>=0||e.launch||e.dropping)continue;if(nyoroSummon&&e.summonRider&&e.x>=s.x&&e.x<=s.x+s.w)e.y=s.y;else if(e.summonRider){e.terrainVy=(e.terrainVy||0)+CONFIG.gravity*dt;e.y+=e.terrainVy*dt;const floor=supportFloorAt(e.x,e.y-10);if(e.y>=floor){e.y=floor;e.summonRider=false;e.terrainVy=0;}}}
}
function fireSprite(i,x,y,size){const f=nyoroFire[i];if(!f)return;const k=size/Math.max(f.width,f.height);ctx.drawImage(f,x-camera-f.width*k/2,y-f.height*k/2,f.width*k,f.height*k);}
function drawNyoro(){const a=nyoroAction,t=a?.age||0;let n=1;if(a){n=a.type==='normal'?9+Math.min(7,Math.floor(t/.055)):a.type==='upper'?17+Math.min(6,Math.floor(t/.083)):a.type==='rain'?32+Math.floor(t*10)%2:a.type==='meteor'?34+Math.min(8,Math.floor(t/.122)):t<1?31:39;}else n=nyoroGlide?26+Math.floor(player.anim*12)%6:!player.grounded?(player.jumpAge<.12?24:25):Math.abs(player.vx)>1?1+Math.floor(player.anim*12)%8:1;
 const f=nyoroFrames[n];if(!f)return;
 // Preserve the body size when the umbrella is held sideways or a slash extends the frame.
 const bodyFraction=({12:.77,13:.75,14:.75,17:.74,18:.70,19:.72,20:.86,21:.88,22:.90,23:.91})[n]||1;
 const k=CONFIG.playerHeight/(f.height*bodyFraction);ctx.save();ctx.translate(player.x-camera+(a?.type==='summon'&&t<1?Math.sin(t*95)*2:0),player.y);ctx.scale(player.dir,1);if(player.inv>0&&Math.floor(player.inv*16)%2===0)ctx.globalAlpha=.35;if(a?.type==='summon'){ctx.shadowColor='#ff3e21';ctx.shadowBlur=20+Math.sin(t*25)*8;}ctx.drawImage(f,-f.width*k*.5,-f.height*k,f.width*k,f.height*k);if(a?.type==='summon'&&t<1){ctx.globalAlpha=.25+.15*Math.sin(t*25);ctx.drawImage(getTint(f),-f.width*k*.5,-f.height*k,f.width*k,f.height*k);}ctx.restore();
}
function drawSummon(){const s=nyoroSummon;if(!s)return;const n=s.age<.5?235+Math.min(2,Math.floor(s.age/.167)):237+Math.floor(s.age*12)%2;const f=nyoroFrames[n];if(!f)return;const shake=s.age>.5?Math.sin(elapsed*38)*2:0;ctx.save();ctx.beginPath();ctx.rect(s.x-camera-5,s.y,s.w+10,s.h);ctx.clip();ctx.drawImage(f,s.x-camera+shake,s.y,s.w,s.w*f.height/f.width);ctx.restore();ctx.strokeStyle='#ffdf75';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(s.x-camera+12,s.y);ctx.lineTo(s.x-camera+s.w-12,s.y);ctx.stroke();}
function drawNyoroEffects(){for(const s of nyoroShots)fireSprite(s.kind==='ember'?Math.floor(s.age*12)%3:s.kind==='rain'?3:4,s.x,s.y,s.kind==='ember'?28:s.kind==='rain'?92:190);for(const e of enemies)if(e.burn>0&&e.death<0)fireSprite(Math.floor(elapsed*12)%3,e.x,e.y-20,35);if(pink?.burn>0){fireSprite(Math.floor(elapsed*12)%3,pink.x,pink.y-20,32);}
 for(const f of nyoroFX){ctx.save();ctx.globalAlpha=Math.max(0,1-f.age/(f.kind==='explosion'?1.1:.55));if(f.kind==='explosion'){for(let i=0;i<12;i++){const a=i*2.4;ctx.fillStyle=i%2?'#504840':'#ffb346';ctx.beginPath();ctx.arc(f.x-camera+Math.cos(a)*f.r*f.age,f.y-30+Math.sin(a)*f.r*f.age*.5-f.age*60,25+f.age*40,0,Math.PI*2);ctx.fill();}}else if(f.kind==='aura'){for(let i=0;i<7;i++)fireSprite(Math.floor(elapsed*12+i)%3,f.x+Math.cos(i*Math.PI*2/7)*f.r*.65,f.y+Math.sin(i*Math.PI*2/7)*40,48);}else fireSprite(Math.floor(f.age*12)%3,f.x,f.y-15,f.r*1.4);ctx.restore();}
}
function explodeBomb(b){if(b.exploded)return;b.exploded=true;bombBursts.push({x:b.x,y:b.y,age:0});for(const e of combatTargets())if(e.death<0&&Math.hypot(Math.max(0,Math.abs(e.x-b.x)-e.w/2),Math.max(e.y-e.h-b.y,b.y-e.y,0))<=75){hitEnemy(e,18,b.dir);if(e.type!=='crate')e.electric=.35;}burst(b.x,b.y,18,'#a5f5ff');}
function updateBombs(dt){for(const b of bombBursts)b.age+=dt;bombBursts=bombBursts.filter(b=>b.age<.32);if(pink)pink.burn=Math.max(0,(pink.burn||0)-dt);}
function drawBombs(){for(const b of bombBursts){ctx.save();ctx.globalAlpha=1-b.age/.32;ctx.strokeStyle='#bafaff';ctx.fillStyle='#ffec8a66';ctx.lineWidth=4;ctx.beginPath();ctx.arc(b.x-camera,b.y,15+b.age/.32*60,0,Math.PI*2);ctx.fill();ctx.stroke();for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.beginPath();ctx.moveTo(b.x-camera+Math.cos(a)*20,b.y+Math.sin(a)*20);ctx.lineTo(b.x-camera+Math.cos(a+.2)*47,b.y+Math.sin(a+.2)*47);ctx.lineTo(b.x-camera+Math.cos(a)*72,b.y+Math.sin(a)*72);ctx.stroke();}ctx.restore();}}
function drawReload(){if(selectedCharacter!=='denden'||player.reload<=0)return;const x=clamp(player.x-camera,70,W-70),y=Math.max(116,player.y-CONFIG.playerHeight-30);rounded(x-64,y-22,128,34,7,'#17363bed');text(`リロード ${player.reload.toFixed(1)}s`,x,y-2,15,'#ffe58d');rounded(x-52,y+3,104*(1-player.reload/CONFIG.reloadDuration),3,1,'#ffe58d');}
