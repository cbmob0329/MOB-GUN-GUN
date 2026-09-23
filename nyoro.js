'use strict';
const NYORO=Object.freeze({jumpForce:790,normal:18,upper:26,ember:4,rain:24,meteor:64,burn:2,cooldowns:[8,11,16]});
const nyoroFrames={},nyoroFire=[];
let nyoroAction=null,nyoroCooldowns=[0,0,0],nyoroGlide=false,nyoroGlideUsed=false,nyoroCombo=0,nyoroFireClock=0,nyoroShots=[],nyoroFX=[],nyoroSummon=null,bombBursts=[];
async function loadNyoro(){await Promise.all([...Array.from({length:42},(_,i)=>i+1),235,236,237,238].map(async n=>{nyoroFrames[n]=await trimFrame(`nyoro/${String(n).padStart(3,'0')}.png`);}));await Promise.all(Array.from({length:5},async(_,i)=>{nyoroFire[i]=await trimFrame(`nyoro/0${i+1}.png`);}));}
function cancelNyoro(){nyoroAction=null;nyoroGlide=false;nyoroGlideUsed=false;nyoroCombo=0;nyoroShots=[];nyoroSummon=null;nyoroFX=[];}
function resetNyoro(){cancelNyoro();nyoroCooldowns=[0,0,0];nyoroFireClock=0;}
function nyoroAttack(){if(selectedCharacter!=='nyoro'||state!=='playing'||bossIntro())return;if(nyoroAction){if(nyoroAction.type==='normal')nyoroAction.queued=true;return;}nyoroGlide=false;nyoroAction={type:nyoroCombo>0?'upper':'normal',age:0,dir:player.dir,hit:new Map()};nyoroCombo=0;}
function castNyoro(i){if(state!=='playing'||bossIntro()||selectedCharacter!=='nyoro'||nyoroAction||nyoroCooldowns[i]>0)return;nyoroGlide=false;nyoroAction={type:['rain','meteor','summon'][i],age:0,dir:player.dir,hit:new Map(),spawned:0};nyoroCooldowns[i]=NYORO.cooldowns[i];}
function burnEnemy(e){if(e.type==='crate'||e.death>=0)return;e.burn=Math.max(e.burn||0,1.2);e.burnClock??=.4;}
function flameHit(x,y,r,damage,dir=1,launch=false){for(const e of combatTargets()){if(e.death>=0)continue;const dx=Math.max(0,Math.abs(e.x-x)-e.w/2),dy=Math.max(e.y-e.h-y,y-e.y,0);if(Math.hypot(dx,dy)>r)continue;hitEnemy(e,damage,dir);burnEnemy(e);if(launch)launchEnemy(e,dir*170,-820,5);}}
function addFire(kind,x,y,owner=null){
 const dir=owner?.dir||player.dir,vy=kind==='ember'?180:380,vx=kind==='ember'?0:dir*(kind==='meteor'?780:600),gravity=kind==='ember'?800:550,floor=supportFloorAt(x,player.y-10),distance=Math.max(50,(Number.isFinite(floor)?floor:CONFIG.groundY)-y),time=(-vy+Math.sqrt(vy*vy+2*gravity*distance))/gravity;
 // x is the intended landing point; start upwind so the diagonal remains aimed.
 nyoroShots.push({kind,x:x-vx*time,y,age:0,vx,vy,gravity,owner,life:4});
}
function updateNyoro(dt){
 nyoroCooldowns=nyoroCooldowns.map(c=>Math.max(0,c-dt));nyoroCombo=Math.max(0,nyoroCombo-dt);
 for(const e of enemies)if(e.burn>0&&e.death<0){e.burn-=dt;e.burnClock-=dt;if(e.burnClock<=0){e.burnClock+=.4;hitEnemy(e,NYORO.burn,Math.sign(e.x-player.x)||1);}}
 if(nyoroGlide){nyoroFireClock-=dt;if(nyoroFireClock<=0){nyoroFireClock=.28;addFire('ember',clamp(player.x+player.dir*90+(Math.random()-.5)*200,20,CONFIG.worldWidth-20),Math.min(-45,player.y-400));}}else nyoroFireClock=0;
 const a=nyoroAction;if(a){a.age+=dt;const t=a.age;
  if(a.type==='normal'||a.type==='upper'){
   if(t>=.16&&!a.struck){a.struck=true;if(a.type==='normal')tetsuHit(a,0,player.x+a.dir*65,player.y-40,150,105,NYORO.normal);else{nyoroFX.push({x:player.x,y:player.y,dir:a.dir,r:245,age:0,kind:'groundWave',hit:new Set()});}}
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
 for(const s of nyoroShots){const old=s.y,oldX=s.x;s.age+=dt;s.life-=dt;s.vy+=s.gravity*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;const radius=s.kind==='ember'?13:s.kind==='rain'?32:60;const target=combatTargets().find(e=>e.death<0&&Math.max(oldX,s.x)+radius>=e.x-e.w/2&&Math.min(oldX,s.x)-radius<=e.x+e.w/2&&s.y+radius>=e.y-e.h&&old-radius<=e.y);const floor=supportFloorAt(s.x,old-radius);
  if(target||(Number.isFinite(floor)&&s.y+radius>=floor)){s.y=target?Math.min(s.y,target.y-20):floor;const r=s.kind==='ember'?28:s.kind==='rain'?70:245;flameHit(s.x,s.y,r,s.kind==='ember'?NYORO.ember:s.kind==='rain'?NYORO.rain:NYORO.meteor,Math.sign(s.x-player.x)||1);nyoroFX.push({x:s.x,y:s.y,r,age:0,kind:s.kind==='ember'?'flame':'explosion'});burst(s.x,s.y, s.kind==='meteor'?45:10,'#ff782d');s.life=0;}
 }
 nyoroShots=nyoroShots.filter(s=>s.life>0&&s.y<H+150);for(const f of nyoroFX){f.age+=dt;if(f.kind==='groundWave'){
  const reach=Math.min(1,f.age/.30)*f.r;
  for(const e of combatTargets()){const forward=(e.x-f.x)*f.dir,ground=supportFloorAt(e.x,f.y-60);if(e.death>=0||f.hit.has(e)||forward< -25||forward>reach+e.w/2||!Number.isFinite(ground)||e.y<ground-85||e.y-e.h>ground+8)continue;f.hit.add(e);hitEnemy(e,NYORO.upper,f.dir);burnEnemy(e);launchEnemy(e,f.dir*170,-820,5);}
 }}nyoroFX=nyoroFX.filter(f=>f.age<(f.kind==='explosion'?1.1:.55));
 updateSummon(dt);
}
// The solid roof follows the house, excluding smoke and flame tips.
const SUMMON_ROOF=[[0,.85],[.18,.66],[.34,.51],[.51,.32],[.66,.50],[.82,.60],[1,.83]];
function summonRoofY(x,s=nyoroSummon){if(!s||x<s.x||x>s.x+s.w)return Infinity;const u=(x-s.x)/s.w;for(let i=1;i<SUMMON_ROOF.length;i++){const a=SUMMON_ROOF[i-1],b=SUMMON_ROOF[i];if(u<=b[0])return s.y+s.h*(a[1]+(b[1]-a[1])*(u-a[0])/(b[0]-a[0]));}return Infinity;}
function releaseSummon(s){
 for(const p of [player,pink,...enemies]){if(!p||p.death>=0||Math.abs(p.y-summonRoofY(p.x,s))>10)continue;
  if(p===player||p===pink){p.vy=-420;p.grounded=false;p.coyote=0;if(p===player){p.jumpsUsed=1;p.jumpAge=0;nyoroGlide=false;nyoroGlideUsed=false;jumpRequest=0;}}
  else{p.summonRider=false;launchEnemy(p,0,-420);p.launch.floor=s.base;}
 }
 nyoroSummon=null;
}
function updateSummon(dt){
 const s=nyoroSummon;
 if(s){const old={...s};s.age+=dt;s.h=(nyoroFrames[237].height/nyoroFrames[237].width*s.w)*Math.min(1,s.age/.5);s.y=s.base-s.h;
  for(const p of [player,pink,...enemies]){if(!p||p===pink&&!pink.enabled||p.death>=0)continue;const roof=summonRoofY(p.x,s),oldRoof=summonRoofY(p.x,old),on=Number.isFinite(roof);
   if(on&&p.y>=roof-.5&&p.y<=oldRoof+12&&(!p.launch||p.launch.vy>=0)&&(p.vy===undefined||p.vy>=0)){
    p.y=roof;p.vy=0;p.grounded=true;if(p.launch)p.launch=null;if(p===player){nyoroGlide=false;nyoroGlideUsed=false;}if(p!==player&&p!==pink)p.summonRider=true;
   }
   if(on&&p.y>roof-100&&p.y<s.base+20){if(p===player){if(selectedCharacter!=='nyoro')damagePlayer({x:p.x+1},2);}else if(p===pink)p.burn=.3;else burnEnemy(p);}
  }
  if(s.age>=4)releaseSummon(s);
 }
 for(const e of enemies){if(e.launch&&e.summonRider&&!nyoroSummon){const floor=supportFloorAt(e.x,e.y+1);e.launch.floor=Number.isFinite(floor)?floor:CONFIG.groundY;}if(e.death>=0||e.launch||e.dropping)continue;
  const roof=summonRoofY(e.x);if(e.summonRider&&Number.isFinite(roof))e.y=roof;
  else if(e.summonRider){e.terrainVy=(e.terrainVy||0)+CONFIG.gravity*dt;e.y+=e.terrainVy*dt;const floor=supportFloorAt(e.x,e.y-10);if(e.y>=floor){e.y=floor;e.summonRider=false;e.terrainVy=0;}}
 }
}
function fireSprite(i,x,y,size){const f=nyoroFire[i];if(!f)return;const k=size/Math.max(f.width,f.height);ctx.drawImage(f,x-camera-f.width*k/2,y-f.height*k/2,f.width*k,f.height*k);}
const NYORO_FACE_WIDTH={1:.32,9:.31,10:.30,11:.34,12:.23,13:.21,14:.21,15:.34,16:.32,17:.34,18:.35,19:.34,20:.36,21:.34,22:.35,23:.40};
function nyoroScale(n){const f=nyoroFrames[n];return NYORO_FACE_WIDTH[n]?26/(f.width*NYORO_FACE_WIDTH[n]):CONFIG.playerHeight/f.height;}
function drawNyoro(){const a=nyoroAction,t=a?.age||0;let n=1;if(a){n=a.type==='normal'?9+Math.min(7,Math.floor(t/.055)):a.type==='upper'?17+Math.min(6,Math.floor(t/.083)):a.type==='rain'?32+Math.floor(t*10)%2:a.type==='meteor'?34+Math.min(8,Math.floor(t/.122)):t<1?31:39;}else n=nyoroGlide?26+Math.floor(player.anim*12)%6:!player.grounded?(player.jumpAge<.12?24:25):Math.abs(player.vx)>1?1+Math.floor(player.anim*12)%8:1;
 const f=nyoroFrames[n];if(!f)return;
 // Face width is stable across crouches, umbrella swings and differently sized source sheets.
 const k=nyoroScale(n);
 ctx.save();ctx.translate(player.x-camera+(a?.type==='summon'&&t<1?Math.sin(t*95)*2:0),player.y);ctx.scale(player.dir,1);if(player.inv>0&&Math.floor(player.inv*16)%2===0)ctx.globalAlpha=.35;if(a?.type==='summon'){ctx.shadowColor='#ff3e21';ctx.shadowBlur=20+Math.sin(t*25)*8;}ctx.drawImage(f,-f.width*k*.5,-f.height*k,f.width*k,f.height*k);if(a?.type==='summon'&&t<1){ctx.globalAlpha=.25+.15*Math.sin(t*25);ctx.drawImage(getTint(f),-f.width*k*.5,-f.height*k,f.width*k,f.height*k);}ctx.restore();
}
function drawSummon(){const s=nyoroSummon;if(!s)return;const n=s.age<.5?235+Math.min(2,Math.floor(s.age/.167)):237+Math.floor(s.age*12)%2;const f=nyoroFrames[n];if(!f)return;const shake=s.age>.5?Math.sin(elapsed*38)*2:0;ctx.save();ctx.beginPath();ctx.rect(s.x-camera-5,s.y,s.w+10,s.h);ctx.clip();ctx.drawImage(f,s.x-camera+shake,s.y,s.w,s.w*f.height/f.width);ctx.restore();}
function drawNyoroEffects(){for(const s of nyoroShots){if(s.kind==='ember'){fireSprite(Math.floor(s.age*12)%3,s.x,s.y,28);continue;}const f=nyoroFire[s.kind==='rain'?3:4],size=s.kind==='rain'?92:190,k=size/Math.max(f.width,f.height);ctx.save();ctx.translate(s.x-camera,s.y);ctx.scale(s.vx>0?-1:1,1);ctx.drawImage(f,-f.width*k/2,-f.height*k/2,f.width*k,f.height*k);ctx.restore();}for(const e of enemies)if(e.burn>0&&e.death<0)fireSprite(Math.floor(elapsed*12)%3,e.x,e.y-20,35);if(pink?.burn>0){fireSprite(Math.floor(elapsed*12)%3,pink.x,pink.y-20,32);}
 for(const f of nyoroFX){ctx.save();ctx.globalAlpha=Math.max(0,1-f.age/(f.kind==='explosion'?1.1:.55));if(f.kind==='explosion'){
  const t=f.age/1.1;ctx.fillStyle='#fff3b5';ctx.beginPath();ctx.arc(f.x-camera,f.y-25,Math.max(0,1-t)*f.r*.7,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffcb54';ctx.lineWidth=7*(1-t)+1;ctx.beginPath();ctx.ellipse(f.x-camera,f.y,30+t*f.r*1.25,10+t*f.r*.24,0,0,Math.PI*2);ctx.stroke();
  for(let i=0;i<14;i++){const a=Math.PI+i*Math.PI/13,r=f.r*(.35+t);ctx.strokeStyle=i%2?'#fff5cf':'#ff7d25';ctx.lineWidth=4*(1-t)+1;ctx.beginPath();ctx.moveTo(f.x-camera+Math.cos(a)*r*.6,f.y+Math.sin(a)*r*.6);ctx.lineTo(f.x-camera+Math.cos(a)*r,f.y+Math.sin(a)*r);ctx.stroke();}
  for(let i=0;i<12;i++){const a=i*2.4;ctx.fillStyle=i%2?'#ffffff':'#eaf5ff';ctx.strokeStyle='#c8dce8';ctx.lineWidth=2;ctx.beginPath();ctx.arc(f.x-camera+Math.cos(a)*f.r*f.age,f.y-30+Math.sin(a)*f.r*f.age*.5-f.age*60,25+f.age*40,0,Math.PI*2);ctx.fill();ctx.stroke();}}else if(f.kind==='groundWave'){
  const reach=Math.min(1,f.age/.30)*f.r;
  for(let i=0;i<8;i++){const distance=reach*i/7,x=f.x+f.dir*distance,y=supportFloorAt(x,f.y-60);if(!Number.isFinite(y))continue;const img=nyoroFire[(Math.floor(f.age*16)+i)%3],w=48,h=20+Math.sin(i/7*Math.PI)*13;ctx.drawImage(img,x-camera-w/2,y-h,w,h);}
 }else if(f.kind==='aura'){for(let i=0;i<7;i++)fireSprite(Math.floor(elapsed*12+i)%3,f.x+Math.cos(i*Math.PI*2/7)*f.r*.65,f.y+Math.sin(i*Math.PI*2/7)*40,48);}else fireSprite(Math.floor(f.age*12)%3,f.x,f.y-15,f.r*1.4);ctx.restore();}
}
function explodeBomb(b){if(b.exploded)return;b.exploded=true;bombBursts.push({x:b.x,y:b.y,age:0});for(const e of combatTargets())if(e.death<0&&Math.hypot(Math.max(0,Math.abs(e.x-b.x)-e.w/2),Math.max(e.y-e.h-b.y,b.y-e.y,0))<=75){hitEnemy(e,18,b.dir);if(e.type!=='crate')e.electric=.35;}burst(b.x,b.y,18,'#a5f5ff');}
function updateBombs(dt){for(const b of bombBursts)b.age+=dt;bombBursts=bombBursts.filter(b=>b.age<.32);if(pink)pink.burn=Math.max(0,(pink.burn||0)-dt);}
function drawBombs(){for(const b of bombBursts){ctx.save();ctx.globalAlpha=1-b.age/.32;ctx.strokeStyle='#bafaff';ctx.fillStyle='#ffec8a66';ctx.lineWidth=4;ctx.beginPath();ctx.arc(b.x-camera,b.y,15+b.age/.32*60,0,Math.PI*2);ctx.fill();ctx.stroke();for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.beginPath();ctx.moveTo(b.x-camera+Math.cos(a)*20,b.y+Math.sin(a)*20);ctx.lineTo(b.x-camera+Math.cos(a+.2)*47,b.y+Math.sin(a+.2)*47);ctx.lineTo(b.x-camera+Math.cos(a)*72,b.y+Math.sin(a)*72);ctx.stroke();}ctx.restore();}}
function drawReload(){if(selectedCharacter!=='denden'||player.reload<=0)return;const x=clamp(player.x-camera,70,W-70),y=Math.max(116,player.y-CONFIG.playerHeight-30);rounded(x-64,y-22,128,34,7,'#17363bed');text(`リロード ${player.reload.toFixed(1)}s`,x,y-2,15,'#ffe58d');rounded(x-52,y+3,104*(1-player.reload/CONFIG.reloadDuration),3,1,'#ffe58d');}
