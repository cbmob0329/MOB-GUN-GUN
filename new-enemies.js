'use strict';
const NEW_ENEMIES={
 tende:{name:'モブテンデビ',hp:42,damage:4,speed:58,height:58,actions:['hover','wind','defeat']},
 poison:{name:'モブポイズン',hp:78,damage:5,speed:75,height:77,actions:['walk','dash','jump','claw','orb','defeat']},
 dancer:{name:'モブダンサー',hp:66,damage:4,speed:72,height:82,actions:['walk','flip','dance','step','defeat']},
 kairo:{name:'モブカイロ',hp:84,damage:5,speed:60,height:78,actions:['walk','hop','guard','orb','defeat']},
 golem:{name:'モブマグゴーレム',hp:180,damage:7,speed:35,height:142,actions:['walk','jump','guard','punch','slam','defeat']},
 knife:{name:'モブナイフ',hp:60,damage:5,speed:64,height:78,actions:['walk','slash','bomb']},
 naga:{name:'モブナーガ',hp:72,damage:6,speed:74,height:88,actions:['walk','dash','jump']},
 mag:{name:'モブマグトカゲ',hp:96,damage:6,speed:48,height:80,actions:['walk','slash','guard','backstep']}
};
let golemPunchFrames=[];const newEnemyArt={};let newEnemyShots=[],newEnemyFX=[];
async function loadNewEnemies(){golemPunchFrames=await loadBiomeAtlas('enemy/expansion/golem_punch_effect.png');await Promise.all(Object.entries(NEW_ENEMIES).flatMap(([type,c])=>c.actions.map(async action=>{
 const img=await loadImage(`enemy/expansion/${type}_${action}.png`),canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;
 const g=canvas.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);
 const frames=(type==='poison'&&action==='defeat'||type==='kairo')?isolateCharacterBodies(img,16):c.actions.includes('defeat')?await loadBiomeAtlas(`enemy/expansion/${type}_${action}.png`):isolateDragonBodies(g.getImageData(0,0,img.width,img.height).data,img.width,img.height);
 for(const f of frames)f.scale=c.height/frames[0].h;
 newEnemyArt[type+'_'+action]=frames;
})));
 for(const [type,c] of Object.entries(NEW_ENEMIES)){if(!c.actions.includes('defeat'))continue;for(const action of c.actions){const frames=newEnemyArt[type+'_'+action];const reference=Math.max(frames[0].h,frames[1].h);for(const f of frames){f.scale=c.height/reference;f.anchorX=f.w/2;}}}
 normalizeKairo();
}
function spawnNewEnemy(type,x,y=548){if(y===548){for(const h of sandHills)if(!h.gone&&x>=h.x&&x<=h.x+h.w)y=Math.min(y,548-Math.sin((x-h.x)/h.w*Math.PI)*h.h);}const e=spawnGrassEnemy(type,x,y,170);Object.assign(e,{h:NEW_ENEMIES[type].height,w:type==='golem'?64:36,hoverY:y-108,action:null,age:0,cooldown:1+Math.random(),vy:0,grounded:true,sequence:0});return e;}
const BIOME_ENEMIES=[['lime','tende'],['miira','poison'],['knife','dancer'],['naga','kairo'],['mag','golem']];
function spawnBiomeEnemy(type,x,y=548){return NEW_ENEMIES[type]?spawnNewEnemy(type,x,y):spawnGrassEnemy(type,x,y,220);}
function randomNewEnemy(x,y=548){const pool=BIOME_ENEMIES[biomeIndex];return spawnBiomeEnemy(pool[Math.floor(Math.random()*pool.length)],x,y);}
function populateNewEnemies(){
 newEnemyShots=[];newEnemyFX=[];
 enemies=enemies.filter(e=>['dragon','miramob','sharty'].includes(e.type));
 const pool=BIOME_ENEMIES[biomeIndex],limit=Math.min(CONFIG.worldWidth-650,currentArea().boss?CONFIG.worldWidth-2000:CONFIG.worldWidth,shartyEncounter?SHARTY.left-150:Infinity),safe=[];
 for(let x=550;x<limit;x+=45)if(!gaps.some(g=>x>g.x-120&&x<g.x+g.w+120)&&!props.some(p=>Math.abs(p.x-x)<110)&&!platforms.some(p=>p.solid&&x>p.x-40&&x<p.x+p.w+40))safe.push(x);
 let n=0;for(let target=850;target<limit;target+=850){const options=safe.filter(x=>!enemies.some(e=>Math.abs(e.x-x)<430));if(!options.length)break;options.sort((a,b)=>Math.abs(a-target)-Math.abs(b-target));spawnBiomeEnemy(pool[n++%pool.length],options[0]);}

}
function newEnemyAction(e,type){const victim=enemyTarget(e);e.dir=Math.sign(victim.x-e.x)||e.dir;e.action={type,age:0,dir:e.dir,hit:false};if(['jump','flip','hop'].includes(type)){e.vy=type==='hop'?-560:e.type==='golem'?-590:e.type==='naga'?-900:-850;e.grounded=false;}}
function newEnemyExplosion(x,y){newEnemyFX.push({kind:'impact',x,y,age:0,size:125,dir:1});burst(x,y,14,'#ffb651');for(const p of hostileVictims())if(Math.hypot(p.x-x,p.y-30-y)<80)hurtAlly(p,{x},7);}
function updateNewEnemy(e,dt){const victim=enemyTarget(e);
 if(NEW_ENEMIES[e.type].actions.includes('defeat')){updateRosterEnemy(e,dt);return;}
 const c=NEW_ENEMIES[e.type],oldY=e.y,oldX=e.x;e.age+=dt;if(Math.abs(e.x-victim.x)>1100&&!e.action)return;e.cooldown=Math.max(0,e.cooldown-dt);let vx=0;
 if(e.action){const a=e.action;a.age+=dt;const t=a.age;
  if(e.type==='knife'&&a.type==='slash'){
   if(t>.3&&t<.55)vx=a.dir*300;
   if(t>=.4&&!a.hit){a.hit=true;newEnemyFX.push({kind:'claw',x:e.x+a.dir*45,y:e.y-35,age:0,size:100,dir:a.dir});if(Math.abs(victim.x-e.x-a.dir*40)<65&&Math.abs(victim.y-e.y)<80)hurtAlly(victim,e,6);}
  }
  if(a.type==='bomb'&&t>.5&&!a.hit){a.hit=true;const flight=.9,x=e.x+a.dir*22,y=e.y-55;newEnemyShots.push({kind:'bomb',x,y,vx:clamp((victim.x-x)/flight,-470,470),vy:(victim.y-28-y-.5*800*flight*flight)/flight,gravity:800,age:0,life:2.4,r:12,damage:7});}
  if(e.type==='naga'){
   if(a.type==='dash'&&t>.5&&t<.78){vx=a.dir*900;newEnemyFX.push({kind:'trail',x:e.x,y:e.y-35,age:0,size:55,dir:a.dir});}
   if(a.type==='jump')vx=a.dir*145;
  }
  if(e.type==='mag'){
   if(a.type==='backstep'&&t<.4)vx=-a.dir*250;
   if(a.type==='slash'&&t>.45&&!a.hit){a.hit=true;newEnemyShots.push({kind:'fire',x:e.x+a.dir*32,y:e.y-35,vx:a.dir*390,vy:0,gravity:0,age:0,life:.95,r:19,damage:6});}
  }
  const duration=a.type==='guard'?1.5:a.type==='jump'?1.15:a.type==='bomb'?1.2:a.type==='backstep'?.7:1;
  if(t>=duration&&(a.type!=='jump'||e.grounded)){e.action=null;e.cooldown=.7+Math.random()*.7;}
 }else if(e.stun<=0){
  const d=Math.abs(victim.x-e.x);e.dir=Math.sign(victim.x-e.x)||e.dir;
  if(d>125)vx=e.dir*c.speed;
  if(e.cooldown===0&&d<650){let type;
   if(e.type==='knife')type=d<190?'slash':'bomb';
   if(e.type==='naga')type=e.sequence++%2?'jump':'dash';
   if(e.type==='mag')type=['slash','guard','backstep'][e.sequence++%3];
   newEnemyAction(e,type);
  }
 }
 if(e.stun>0)vx=0;
 moveEnemyOnTerrain(e,vx,dt);
 hostileContact(e,c.damage);
}
function guardNewEnemy(e,damage,dir){if(['mag','kairo','golem'].includes(e.type)&&e.action?.type==='guard'&&dir===-e.action.dir){newEnemyFX.push({kind:'guard',x:e.x+e.action.dir*23,y:e.y-40,age:0,size:60,dir:e.action.dir});return Math.max(1,Math.ceil(damage*.2));}return damage;}
function updateNewEnemyProjectiles(dt){
 for(const s of newEnemyShots){const ox=s.x,oy=s.y;s.age+=dt;s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=s.gravity*dt;if(s.kind==='shock'){const floor=groundAt(s.x);if(!Number.isFinite(floor)||Math.abs(floor-s.groundY)>28)s.life=0;else s.y=floor-s.r-2;}
  const hit=hostileShotHit(ox,oy,s.x,s.y,s.r);
  if(hit||s.y+s.r>=groundAt(s.x)||s.life<=0){if(s.kind==='bomb')newEnemyExplosion(s.x,s.y);else if(hit){hurtAlly(hit,{x:s.x},s.damage);newEnemyFX.push({kind:'impact',x:s.x,y:s.y,age:0,size:65,dir:1});}s.life=0;}
 }
 newEnemyShots=newEnemyShots.filter(s=>s.life>0&&Math.abs(s.x-player.x)<1300);
 for(const f of newEnemyFX)f.age+=dt;newEnemyFX=newEnemyFX.filter(f=>f.age<(f.kind==='trail'?.18:.45)).slice(-90);
}
function drawNewEnemy(e){
 const dying=e.death>=0&&newEnemyArt[e.type+'_defeat'],a=dying?{type:'defeat',age:e.death}:e.action,name=e.type+'_'+(a?.type||(e.type==='tende'?'hover':'walk')),duration=enemyActionDuration(e,a?.type);
 const f=newEnemyArt[name]?.[a?Math.min(15,Math.floor(a.age/duration*16)):Math.floor(e.age*9)%16];if(!f)return;
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(e.x-camera,e.y-(e.death>=0?Math.sin(Math.min(1,e.death/.45)*Math.PI)*18:0));ctx.scale(e.dir,1);if(e.type==='dancer'&&e.stun>0)ctx.rotate(-.18*Math.min(1,e.stun/.3));if(e.flash>0)ctx.filter='brightness(1.8)';if(e.death>=0)ctx.globalAlpha=dying?clamp((1.3-e.death)/.35,0,1):Math.max(0,1-e.death/.6);ctx.drawImage(f.img,-f.anchorX*f.scale,-f.h*f.scale,f.w*f.scale,f.h*f.scale);ctx.restore();
 if(e.death<0){rounded(e.x-camera-59,e.y-e.h-31,118,20,4,'#152e3bea');text(NEW_ENEMIES[e.type].name,e.x-camera,e.y-e.h-17,11);rounded(e.x-camera-29,e.y-e.h-9,58,5,2,'#452b35');rounded(e.x-camera-28,e.y-e.h-8,56*e.hp/e.maxHP,3,1,'#ee665e');}
 if(a?.type==='dash'&&a.age<.5){text('!',e.x-camera,e.y-e.h-40,23,'#80f9ff');}
}
function drawNewEnemyProjectiles(){
 for(const s of newEnemyShots){if(!['fire','bomb'].includes(s.kind)){drawRosterMagic(s.kind,s.x,s.y,s.r,s.age,Math.sign(s.vx));continue;}if(s.kind==='fire'){dragonFX('claw',Math.floor(s.age*12)%4,s.x,s.y,55,65,Math.sign(s.vx));continue;}
  ctx.save();ctx.translate(s.x-camera,s.y);ctx.rotate(s.age*8);rounded(-10,-10,20,20,6,'#162330');ctx.fillStyle='#687e8a';ctx.fillRect(-5,-7,6,4);ctx.fillStyle='#ffd865';ctx.fillRect(5,-15,4,6);ctx.fillStyle='#ff7e3d';ctx.fillRect(7,-18,4,4);ctx.restore();
 }
 for(const f of newEnemyFX){if(f.kind==='magmaPunch'){const p=golemPunchFrames[Math.min(15,Math.floor(f.age/.45*16))];if(p){ctx.save();ctx.beginPath();ctx.rect(-W,-2000,W*3,(f.floor??548)+2000);ctx.clip();ctx.translate(f.x-camera,f.y);ctx.scale(f.dir,1);ctx.imageSmoothingEnabled=false;ctx.drawImage(p.img,-100,-68,200,136);ctx.restore();}continue;}if(['poisonClaw'].includes(f.kind)){ctx.save();ctx.globalAlpha=1-f.age/.45;drawRosterMagic(f.kind,f.x,f.y,f.size*.4,f.age,f.dir);ctx.restore();continue;}if(f.kind==='trail'||f.kind==='guard'){ctx.save();ctx.globalAlpha=1-f.age/.45;ctx.fillStyle=f.kind==='guard'?'#ffd979':'#76f5ff';ctx.fillRect(f.x-camera-f.dir*28,f.y-3,45*f.dir,6);ctx.restore();}else dragonFX(f.kind,Math.min(3,Math.floor(f.age*9)),f.x,f.y,f.size,f.size,f.dir);}
}
// Shared grounded navigation: probe before collision, hop onto manageable steps,
// turn away from a wall that is too tall, and keep feet on the same stage surfaces.
function moveEnemyOnTerrain(e,vx,dt){
 const oldX=e.x,oldY=e.y;e.vy??=0;e.grounded??=true;e.hopCooldown=Math.max(0,(e.hopCooldown||0)-dt);e.turnTime=Math.max(0,(e.turnTime||0)-dt);
 if(e.turnTime>0)vx=(e.avoidDir||-e.dir)*Math.max(45,Math.abs(vx));
 const dir=Math.sign(vx)||e.dir,half=e.w/2,boxes=[...grassSolidBoxes(),...platforms.filter(p=>p.solid)];
 const ahead=e.x+dir*(half+34),wall=boxes.find(b=>ahead>b.x&&ahead<b.x+b.w&&e.y>b.y+3&&e.y-e.h<b.y+b.h);
 if(e.grounded&&wall&&e.hopCooldown===0){
  const rise=e.y-wall.y;
  if(rise<=210){e.vy=-Math.sqrt(2*CONFIG.gravity*(rise+48));e.grounded=false;e.hopCooldown=.85;e.hopDir=dir;e.hopSpeed=Math.max(165,Math.abs(vx));}
  else{e.avoidDir=-dir;e.dir=-dir;e.turnTime=.85;vx=-dir*65;}
 }
 if(!e.grounded&&e.hopDir)vx=e.hopDir*Math.max(Math.abs(vx),e.hopSpeed||165);
 let next=clamp(e.x+(vx+(e.knock||0))*dt,30,CONFIG.worldWidth-40);
 if(e.grounded&&!Number.isFinite(groundAt(next+dir*(half+18)))&&!platforms.some(p=>next>p.x&&next<p.x+p.w&&Math.abs(p.y-e.y)<12)){next=oldX;e.avoidDir=-dir;e.dir=-dir;e.turnTime=.7;}
 for(const b of boxes)if(next+half>b.x&&next-half<b.x+b.w&&oldY>b.y+2&&oldY-e.h<b.y+b.h-2){
  if(oldX+half<=b.x+2)next=Math.min(next,b.x-half);else if(oldX-half>=b.x+b.w-2)next=Math.max(next,b.x+b.w+half);else if((next-oldX)*(oldX-(b.x+b.w/2))<0)next=oldX;
 }
 e.x=next;e.knock=(e.knock||0)*Math.exp(-10*dt);e.vy+=CONFIG.gravity*dt;e.y+=e.vy*dt;const floor=stageLandingHeight(e,oldY,e.grounded);e.grounded=false;
 if(e.vy>=0&&e.y>=floor){e.y=floor;e.vy=0;e.grounded=true;e.hopDir=0;}
 if(e.y>1000){e.x=e.home;e.y=548;e.vy=0;e.grounded=true;}
}
function enemyActionDuration(e,type){return ({defeat:1.3,guard:1.5,jump:1.15,flip:1.2,hop:.85,bomb:1.2,backstep:.7,claw:1.35,dance:1.6,slam:1.65,punch:1.3,wind:1.3,orb:1.4,step:.8})[type]||1;}
function rosterShot(e,kind,speed,damage,angleOffset=0){const victim=enemyTarget(e);
 if(newEnemyShots.length>=70)return;const x=e.x+e.dir*30,y=e.y-e.h*.55,angle=Math.atan2(victim.y-32-y,victim.x-x)+angleOffset;
 newEnemyShots.push({kind,x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,gravity:0,r:kind==='electric'?17:12,damage,age:0,life:kind==='electric'?4:2.7});
}
function rosterMelee(e,a,index,at,range,damage,kind){if(a.age<at||(a.mask||0)&(1<<index))return;a.mask=(a.mask||0)|(1<<index);
 newEnemyFX.push({kind,x:e.x+a.dir*range*.55,y:e.y-35,floor:e.y,age:0,size:range,dir:a.dir});
 for(const p of hostileVictims())if(Math.abs(p.x-e.x-a.dir*range*.5)<range*.65&&Math.abs(p.y-e.y)<85)hurtAlly(p,e,damage);
}
function updateRosterEnemy(e,dt){const victim=enemyTarget(e);
 const c=NEW_ENEMIES[e.type],oldX=e.x;e.age+=dt;if(Math.abs(e.x-victim.x)>1100)return;e.cooldown=Math.max(0,e.cooldown-dt);let vx=0;
 if(e.stun>0){moveEnemyOnTerrain(e,0,dt);return;}const dist=Math.abs(victim.x-e.x);if(!e.action){e.dir=Math.sign(victim.x-e.x)||e.dir;if(dist>150)vx=e.dir*c.speed;
  if(e.cooldown===0&&dist<620){const cycles={tende:['wind'],poison:dist<170?['claw','jump','claw','dash']:['dash','orb','jump'],dancer:['dance','step','flip'],kairo:['hop','orb','guard'],golem:dist<180?['punch','guard','slam','jump']:['jump','slam','guard']};const seq=cycles[e.type];newEnemyAction(e,seq[e.sequence++%seq.length]);}
 }
 if(e.action){const a=e.action;a.age+=dt;const t=a.age;
  if(['jump','flip','hop'].includes(a.type))vx=a.dir*(e.type==='golem'?95:145);
  if(a.type==='dash'&&t>.22&&t<.65)vx=a.dir*340;
  if(a.type==='step'&&t>.15&&t<.6)vx=a.dir*430;
  if(a.type==='claw'){if(t>.2&&t<1.05)vx=a.dir*65;for(let i=0;i<3;i++)rosterMelee(e,a,i,.3+i*.34,85,4,'poisonClaw');}
  if(a.type==='punch')rosterMelee(e,a,0,.65,125,8,'magmaPunch');
  if(a.type==='slam'&&t>.85&&!a.hit&&e.grounded){a.hit=true;for(const dir of [-1,1])newEnemyShots.push({kind:'shock',x:e.x+dir*34,y:e.y-16,vx:dir*260,vy:0,gravity:0,r:16,damage:7,age:0,life:1.1,groundY:e.y});burst(e.x,e.y-8,16,'#ff8d3e');}
  if(['wind','orb'].includes(a.type)&&t>(a.type==='orb'?.93:.62)&&!a.hit){a.hit=true;rosterShot(e,a.type==='wind'?'wind':e.type==='poison'?'poison':'electric',e.type==='kairo'?150:280,e.type==='kairo'?6:4);}
  if(a.type==='dance'){for(let i=0;i<3;i++)if(t>.5+i*.3&&!((a.mask||0)&(1<<i))){a.mask=(a.mask||0)|(1<<i);rosterShot(e,'note',250,4,(i-1)*.15);}}
  if(t>=enemyActionDuration(e,a.type)&&(!['jump','flip','hop'].includes(a.type)||e.grounded)){e.action=null;e.cooldown=e.type==='golem'?1.2:1+Math.random()*.7;}
 }
 if(e.stun>0)vx=0;
 if(e.type==='tende'){e.x=clamp(e.x+(vx+e.knock)*dt,40,CONFIG.worldWidth-40);e.knock*=Math.exp(-10*dt);const target=(e.hoverY??440)+Math.sin(e.age*1.7)*16;e.y+=(target-e.y)*Math.min(1,dt*2);e.grounded=false;}
 else moveEnemyOnTerrain(e,vx,dt);
 hostileContact(e,c.damage);
}
// Small pixel effects are separate from character poses and never change body scale.
function drawRosterMagic(kind,x,y,r,age,dir=1){
 ctx.save();ctx.translate(Math.round(x-camera),Math.round(y));ctx.scale(dir,1);const colors={wind:['#b5ffe2','#f2fff7'],poison:['#913be9','#d6ff82'],electric:['#934eff','#b7f8ff'],note:['#ff5eaa','#fff187'],shock:['#ff5a21','#ffe49a'],poisonClaw:['#b757ff','#f5d6ff'],magmaPunch:['#f46625','#ffe4a6']},c=colors[kind]||colors.electric;
 ctx.fillStyle=c[0];
 if(kind==='note'){ctx.fillRect(1,-r,4,r*1.5);ctx.fillRect(2,-r,r*.75,4);ctx.fillRect(-6,3,9,7);}
 else if(kind==='wind'){for(let i=0;i<3;i++){const w=r*(1-i*.2);ctx.fillRect(-w,-r+i*r*.7,w*2,3);ctx.fillRect(w-3,-r+i*r*.7-3,3,9);}}
 else if(kind==='shock'){ctx.fillRect(-r,0,r*2,r);ctx.fillRect(-r*.6,-r,r*1.2,r*1.7);ctx.fillRect(-3,-r*1.6,6,r);}
 else if(kind==='poisonClaw'){for(let i=0;i<3;i++)for(let j=0;j<6;j++)ctx.fillRect(-r/2+j*5,-r/2+i*10+j*3,8,4);}
 else{ctx.fillRect(-r+4,-r,r*2-8,r*2);ctx.fillRect(-r,-r+5,r*2,r*2-10);}
 ctx.fillStyle=c[1];if(kind!=='poisonClaw')ctx.fillRect(-r*.35,-r*.45,Math.max(4,r*.55),Math.max(3,r*.4));
 if(kind==='electric')for(let i=0;i<6;i++){const a=i*Math.PI/3+age*3;ctx.fillRect(Math.round(Math.cos(a)*(r+5)),Math.round(Math.sin(a)*(r+5)),5,5);}
 ctx.restore();
}
function normalizeKairo(){
 // Every action starts with an upright calibration pose. Keep that body scale
 // through crouches, shields and collapse; an effect is never a size reference.
 for(const action of NEW_ENEMIES.kairo.actions){const frames=newEnemyArt['kairo_'+action],standing=Math.max(frames[0].h,frames[1].h);for(const f of frames)f.scale=NEW_ENEMIES.kairo.height/(action==='walk'?f.h:standing);}
}
