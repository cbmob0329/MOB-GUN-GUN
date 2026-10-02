'use strict';
const NEW_ENEMIES={
 knife:{name:'モブナイフ',hp:60,damage:5,speed:64,height:78,actions:['walk','slash','bomb']},
 naga:{name:'モブナーガ',hp:72,damage:6,speed:74,height:88,actions:['walk','dash','jump']},
 mag:{name:'モブマグトカゲ',hp:96,damage:6,speed:48,height:80,actions:['walk','slash','guard','backstep']}
};
const newEnemyArt={};let newEnemyShots=[],newEnemyFX=[];
async function loadNewEnemies(){await Promise.all(Object.entries(NEW_ENEMIES).flatMap(([type,c])=>c.actions.map(async action=>{
 const img=await loadImage(`enemy/expansion/${type}_${action}.png`),canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;
 const g=canvas.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);
 const frames=isolateDragonBodies(g.getImageData(0,0,img.width,img.height).data,img.width,img.height);
 for(const f of frames)f.scale=c.height/frames[0].h;
 newEnemyArt[type+'_'+action]=frames;
})));}
function spawnNewEnemy(type,x,y=548){if(y===548){for(const h of sandHills)if(!h.gone&&x>=h.x&&x<=h.x+h.w)y=Math.min(y,548-Math.sin((x-h.x)/h.w*Math.PI)*h.h);}const e=spawnGrassEnemy(type,x,y,170);Object.assign(e,{h:NEW_ENEMIES[type].height,w:36,action:null,age:0,cooldown:1+Math.random(),vy:0,grounded:true,sequence:0});return e;}
function randomNewEnemy(x,y=548){return spawnNewEnemy(['knife','naga','mag'][Math.floor(Math.random()*3)],x,y);}
function populateNewEnemies(){
 newEnemyShots=[];newEnemyFX=[];
 const pool=['knife','naga','mag'].sort(()=>Math.random()-.5),limit=Math.min(CONFIG.worldWidth-650,currentArea().boss?CONFIG.worldWidth-2000:CONFIG.worldWidth,shartyEncounter?SHARTY.left-150:Infinity),safe=[];
 for(let x=550;x<limit;x+=45)if(!gaps.some(g=>x>g.x-120&&x<g.x+g.w+120)&&!props.some(p=>Math.abs(p.x-x)<110)&&!platforms.some(p=>p.solid&&x>p.x-40&&x<p.x+p.w+40))safe.push(x);
 let n=0;for(let target=850;target<limit;target+=850){const options=safe.filter(x=>!enemies.some(e=>NEW_ENEMIES[e.type]&&Math.abs(e.x-x)<430));if(!options.length)break;options.sort((a,b)=>Math.abs(a-target)-Math.abs(b-target));spawnNewEnemy(pool[n++%3],options[0]);}

}
function newEnemyAction(e,type){e.dir=Math.sign(player.x-e.x)||e.dir;e.action={type,age:0,dir:e.dir,hit:false};if(type==='jump'){e.vy=-900;e.grounded=false;}}
function newEnemyExplosion(x,y){newEnemyFX.push({kind:'impact',x,y,age:0,size:125,dir:1});burst(x,y,14,'#ffb651');if(Math.hypot(player.x-x,player.y-30-y)<80)damagePlayer({x},7);}
function updateNewEnemy(e,dt){
 const c=NEW_ENEMIES[e.type],oldY=e.y,oldX=e.x;e.age+=dt;if(Math.abs(e.x-player.x)>1100&&!e.action)return;e.cooldown=Math.max(0,e.cooldown-dt);let vx=0;
 if(e.action){const a=e.action;a.age+=dt;const t=a.age;
  if(e.type==='knife'&&a.type==='slash'){
   if(t>.3&&t<.55)vx=a.dir*300;
   if(t>=.4&&!a.hit){a.hit=true;newEnemyFX.push({kind:'claw',x:e.x+a.dir*45,y:e.y-35,age:0,size:100,dir:a.dir});if(Math.abs(player.x-e.x-a.dir*40)<65&&Math.abs(player.y-e.y)<80)damagePlayer(e,6);}
  }
  if(a.type==='bomb'&&t>.5&&!a.hit){a.hit=true;const flight=.9,x=e.x+a.dir*22,y=e.y-55;newEnemyShots.push({kind:'bomb',x,y,vx:clamp((player.x-x)/flight,-470,470),vy:(player.y-28-y-.5*800*flight*flight)/flight,gravity:800,age:0,life:2.4,r:12,damage:7});}
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
  const d=Math.abs(player.x-e.x);e.dir=Math.sign(player.x-e.x)||e.dir;
  if(d>125)vx=e.dir*c.speed;
  if(e.cooldown===0&&d<650){let type;
   if(e.type==='knife')type=d<190?'slash':'bomb';
   if(e.type==='naga')type=e.sequence++%2?'jump':'dash';
   if(e.type==='mag')type=['slash','guard','backstep'][e.sequence++%3];
   newEnemyAction(e,type);
  }
 }
 if(e.stun>0)vx=0;
 e.x=clamp(e.x+(vx+e.knock)*dt,30,CONFIG.worldWidth-40);e.knock*=Math.exp(-10*dt);
 if(e.grounded&&groundAt(e.x)===Infinity)e.x=oldX;
 for(const b of grassSolidBoxes())if(e.x+e.w/2>b.x&&e.x-e.w/2<b.x+b.w&&e.y>b.y){e.x=oldX;break;}
 e.vy+=CONFIG.gravity*dt;e.y+=e.vy*dt;const floor=stageLandingHeight(e,oldY,e.grounded);e.grounded=false;
 if(e.vy>=0&&e.y>=floor){e.y=floor;e.vy=0;e.grounded=true;}
 if(e.y>1000){e.x=e.home;e.y=548;e.vy=0;}
 if(segmentHitsBox(oldX,e.y-35,e.x,e.y-35,player.x-33,player.y-65,player.x+33,player.y))damagePlayer(e,c.damage);
}
function guardNewEnemy(e,damage,dir){if(e.type==='mag'&&e.action?.type==='guard'&&dir===-e.action.dir){newEnemyFX.push({kind:'guard',x:e.x+e.action.dir*23,y:e.y-40,age:0,size:60,dir:e.action.dir});return Math.max(1,Math.ceil(damage*.2));}return damage;}
function updateNewEnemyProjectiles(dt){
 for(const s of newEnemyShots){const ox=s.x,oy=s.y;s.age+=dt;s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=s.gravity*dt;
  const hit=segmentHitsBox(ox,oy,s.x,s.y,player.x-17-s.r,player.y-65-s.r,player.x+17+s.r,player.y+s.r);
  if(hit||s.y+s.r>=groundAt(s.x)||s.life<=0){if(s.kind==='bomb')newEnemyExplosion(s.x,s.y);else if(hit){damagePlayer({x:s.x},s.damage);newEnemyFX.push({kind:'impact',x:s.x,y:s.y,age:0,size:65,dir:1});}s.life=0;}
 }
 newEnemyShots=newEnemyShots.filter(s=>s.life>0&&Math.abs(s.x-player.x)<1300);
 for(const f of newEnemyFX)f.age+=dt;newEnemyFX=newEnemyFX.filter(f=>f.age<(f.kind==='trail'?.18:.45)).slice(-90);
}
function drawNewEnemy(e){
 const a=e.action,name=e.type+'_'+(a?.type||'walk'),duration=a?.type==='guard'?1.5:a?.type==='jump'?1.15:a?.type==='bomb'?1.2:a?.type==='backstep'?.7:1;
 const f=newEnemyArt[name]?.[a?Math.min(15,Math.floor(a.age/duration*16)):Math.floor(e.age*9)%16];if(!f)return;
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(e.x-camera,e.y-(e.death>=0?Math.sin(Math.min(1,e.death/.6)*Math.PI)*24:0));ctx.scale(e.dir,1);if(e.flash>0)ctx.filter='brightness(1.8)';if(e.death>=0)ctx.globalAlpha=Math.max(0,1-e.death/.6)*(Math.floor(e.death*25)%2?.55:1);ctx.drawImage(f.img,-f.anchorX*f.scale,-f.h*f.scale,f.w*f.scale,f.h*f.scale);ctx.restore();
 if(e.death<0){rounded(e.x-camera-59,e.y-e.h-31,118,20,4,'#152e3bea');text(NEW_ENEMIES[e.type].name,e.x-camera,e.y-e.h-17,11);rounded(e.x-camera-29,e.y-e.h-9,58,5,2,'#452b35');rounded(e.x-camera-28,e.y-e.h-8,56*e.hp/e.maxHP,3,1,'#ee665e');}
 if(a?.type==='dash'&&a.age<.5){text('!',e.x-camera,e.y-e.h-40,23,'#80f9ff');}
}
function drawNewEnemyProjectiles(){
 for(const s of newEnemyShots){if(s.kind==='fire'){dragonFX('claw',Math.floor(s.age*12)%4,s.x,s.y,55,65,Math.sign(s.vx));continue;}
  ctx.save();ctx.translate(s.x-camera,s.y);ctx.rotate(s.age*8);rounded(-10,-10,20,20,6,'#162330');ctx.fillStyle='#687e8a';ctx.fillRect(-5,-7,6,4);ctx.fillStyle='#ffd865';ctx.fillRect(5,-15,4,6);ctx.fillStyle='#ff7e3d';ctx.fillRect(7,-18,4,4);ctx.restore();
 }
 for(const f of newEnemyFX){if(f.kind==='trail'||f.kind==='guard'){ctx.save();ctx.globalAlpha=1-f.age/.45;ctx.fillStyle=f.kind==='guard'?'#ffd979':'#76f5ff';ctx.fillRect(f.x-camera-f.dir*28,f.y-3,45*f.dir,6);ctx.restore();}else dragonFX(f.kind,Math.min(3,Math.floor(f.age*9)),f.x,f.y,f.size,f.size,f.dir);}
}
