'use strict';
// Midboss tuning is independent of the Area 4 boss and player characters.
const SHARTY=Object.freeze({height:82,hp:420,speed:105,jump:520,contact:4,melee:5,orb:6,left:5100,right:6140,trigger:5180});
const shartyArt={};
let shartyEncounter=null,shartyShots=[],shartyEffects=[];
async function loadSharty(){
 await Promise.all(['walk','attack','teleport','special','effects'].map(async name=>{
  const img=await loadImage(`enemy/sharty/${name}.png`),c=document.createElement('canvas');c.width=img.width;c.height=img.height;
  const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const pixels=g.getImageData(0,0,c.width,c.height).data;
  // Generated art can be a few pixels off the nominal grid. Split in actual
  // transparent gutters, then isolate each frame before any scaling.
  const gutter=(axis,expected,lo,hi)=>{
   const extent=axis==='y'?c.height:c.width,span=extent/4;let best=Math.round(expected),score=Infinity;
   for(let v=Math.max(1,Math.floor(expected-span*.18));v<Math.min(extent-1,expected+span*.18);v++){
    let count=0;for(let q=lo;q<hi;q++){const x=axis==='y'?q:v,y=axis==='y'?v:q;if(pixels[(y*c.width+x)*4+3]>24)count++;}
    const cost=count*10000+Math.abs(v-expected);if(cost<score){score=cost;best=v;}
   }return best;
  };
  const rows=[0,...[1,2,3].map(i=>gutter('y',i*c.height/4,0,c.width)),c.height];
  const columns=rows.slice(0,4).map((y,row)=>[0,...[1,2,3].map(i=>gutter('x',i*c.width/4,y,rows[row+1])),c.width]);
  shartyArt[name]=Array.from({length:16},(_,i)=>{
   const row=Math.floor(i/4),x0=columns[row][i%4],x1=columns[row][i%4+1],y0=rows[row],y1=rows[row+1];
   let l=x1,r=x0,t=y1,b=y0;
   for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(pixels[(y*c.width+x)*4+3]>24){l=Math.min(l,x);r=Math.max(r,x+1);t=Math.min(t,y);b=Math.max(b,y+1);}
   if(r<=l||b<=t)throw Error(`Empty Sharty frame: ${name}/${i}`);
   // Separate canvases prevent sampling an adjacent frame, including at fractional scales.
   const frame=document.createElement('canvas');frame.width=r-l;frame.height=b-t;frame.getContext('2d').drawImage(img,l,t,r-l,b-t,0,0,r-l,b-t);
   let fl=r,fr=l;for(let y=b-Math.max(3,Math.floor((b-t)*.08));y<b;y++)for(let x=l;x<r;x++)if(pixels[(y*c.width+x)*4+3]>180){fl=Math.min(fl,x);fr=Math.max(fr,x);}
   return {img:frame,w:r-l,h:b-t,anchorX:fr>=fl?(fl+fr)/2-l:(r-l)/2,source:{l,r,t,b,x0,x1,y0,y1}};
  });
  for(const f of shartyArt[name])f.scale=SHARTY.height/shartyArt[name][0].h;
 }));
}
function resetSharty(){
 shartyShots=[];shartyEffects=[];shartyEncounter=null;
 if(areaIndex!==1||biomeIndex!==1)return;
 const e=spawnGrassEnemy('sharty',5750);Object.assign(e,{w:42,h:SHARTY.height,vy:0,grounded:true,walkAge:0,action:null,cooldown:1.1,sequence:0,jumpClock:2.8});
 shartyEncounter={enemy:e,state:'waiting'};
}
function shartyFX(kind,x,y,size=80,dir=1){shartyEffects.push({kind,x,y,size,dir,age:0});}
function startShartyAction(e,type){e.action={type,age:0,dir:Math.sign(player.x-e.x)||e.dir,fired:false,moved:false};e.dir=e.action.dir;}
function shartyProjectile(e,orb=false,offset=0){
 const x=e.x+e.dir*34,y=e.y-42,angle=orb?Math.atan2(player.y-32-y,player.x-x)+offset:(e.dir>0?0:Math.PI);
 const speed=orb?310:430;
 shartyShots.push({owner:e,kind:orb?'orb':'wave',x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:orb?18:12,age:0,life:orb?2.8:.44,damage:orb?SHARTY.orb:SHARTY.melee});
 shartyFX(orb?'burst':'wave',x,y,orb?58:78,e.dir);
}
function updateSharty(e,dt){
 if(shartyEncounter?.state!=='fighting')return;
 e.walkAge+=dt;e.cooldown=Math.max(0,e.cooldown-dt);e.jumpClock-=dt;
 if(e.action){
  const a=e.action;a.age+=dt;
  if(a.type==='attack'&&!a.fired&&a.age>=.43){a.fired=true;shartyProjectile(e);}
  if(a.type==='teleport'&&!a.moved&&a.age>=.5){
   a.moved=true;shartyFX('portal',e.x,e.y-35,100);e.x=a.targetX;e.y=548;e.vy=0;e.grounded=true;shartyFX('portal',e.x,e.y-35,100);e.dir=Math.sign(player.x-e.x)||e.dir;
  }
  if(a.type==='special'){
   for(let i=0;i<3;i++)if(a.age>=.85+i*.22&&!(a.firedMask&(1<<i))){a.firedMask=(a.firedMask||0)|(1<<i);shartyProjectile(e,true,(i-1)*.13);}
  }
  const duration={attack:.95,teleport:1.1,special:1.85}[a.type];
  if(a.age>=duration){e.action=null;e.cooldown=.8;}
 }else if(e.stun<=0||!e.stun){
  const distance=Math.abs(player.x-e.x);e.dir=Math.sign(player.x-e.x)||e.dir;
  if(e.cooldown===0){
   const type=['attack','attack','teleport','special'][e.sequence%4];
   if(type!=='attack'||distance<230){startShartyAction(e,type);e.sequence++;if(type==='teleport'){e.action.targetX=clamp(player.x-e.dir*220,SHARTY.left+70,SHARTY.right-70);shartyFX('portal',e.action.targetX,510,110);}}
  }
  if(!e.action&&distance>110)e.x+=e.dir*SHARTY.speed*dt;
  if(!e.action&&e.grounded&&e.jumpClock<=0){e.vy=-SHARTY.jump;e.grounded=false;e.jumpClock=3.8;}
 }
 e.x=clamp(e.x+e.knock*dt,SHARTY.left+35,SHARTY.right-35);e.knock*=Math.exp(-10*dt);
 e.vy+=CONFIG.gravity*dt;e.y+=e.vy*dt;if(e.y>=548){e.y=548;e.vy=0;e.grounded=true;}
 if(Math.abs(player.x-e.x)<35&&player.y>e.y-e.h&&player.y-CONFIG.playerColliderHeight<e.y)damagePlayer(e,SHARTY.contact);
}
function updateShartyWorld(dt){
 const room=shartyEncounter;
 if(room){
  if(room.state==='waiting'&&player.x>=SHARTY.trigger){room.state='fighting';checkpoint={x:SHARTY.left+90,y:548};hintTimer=4;$('hint').hidden=false;$('hint').textContent='中ボス モブシャーティー — 光の予兆を見てジャンプ！';}
  if(room.state!=='cleared'&&room.enemy.death>=0){room.state='cleared';shartyShots=[];shartyFX('burst',room.enemy.x,room.enemy.y-40,110);dorayaki.push({x:room.enemy.x,y:470,baseY:528,vy:-220,age:0});hintTimer=3;$('hint').hidden=false;$('hint').textContent='モブシャーティー撃破！ 道が開いた';}
  if(room.state==='fighting')player.x=clamp(player.x,SHARTY.left+20,SHARTY.right-20);
 }
 for(const s of shartyShots){
  const ox=s.x,oy=s.y;s.age+=dt;s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;
  if(s.owner.death>=0){s.life=0;continue;}
  if(segmentHitsBox(ox,oy,s.x,s.y,player.x-17-s.r,player.y-CONFIG.playerColliderHeight-s.r,player.x+17+s.r,player.y+s.r)){
   damagePlayer({x:s.x},s.damage);s.life=0;shartyFX('burst',s.x,s.y,s.r*4);
  }else if(s.y+s.r>548){s.life=0;shartyFX('burst',s.x,535,s.r*4);}
 }
 shartyShots=shartyShots.filter(s=>s.life>0&&s.x>SHARTY.left-100&&s.x<SHARTY.right+100);
 for(const f of shartyEffects)f.age+=dt;shartyEffects=shartyEffects.filter(f=>f.age<.48).slice(-40);
}
function drawSharty(e){
 const a=e.action,name=a?.type==='special'?'special':a?.type==='teleport'?'teleport':a?.type==='attack'?'attack':'walk';
 const duration={attack:.95,teleport:1.1,special:1.85},index=a?Math.min(15,Math.floor(a.age/duration[a.type]*16)):Math.floor(e.walkAge*11)%16,f=shartyArt[name]?.[index];if(!f)return;
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.fillStyle='#183d3d40';ctx.beginPath();ctx.ellipse(e.x-camera,548,27,5,0,0,Math.PI*2);ctx.fill();
 if(e.death>=0)ctx.globalAlpha=Math.max(0,1-e.death/.6)*(Math.floor(e.death*24)%2?.4:1);
 if(a?.type==='teleport')ctx.globalAlpha*=.25+.75*Math.abs(Math.cos(a.age/1.1*Math.PI));
 if(e.flash>0)ctx.filter='brightness(2)';
 const h=f.h*f.scale,w=f.w*f.scale,hop=e.death>=0?-Math.sin(Math.min(1,e.death/.6)*Math.PI)*25:0;
 ctx.translate(e.x-camera,e.y+hop);ctx.scale(e.dir,1);ctx.drawImage(f.img,-f.anchorX*f.scale,-h,w,h);ctx.restore();
 if(e.death<0){rounded(e.x-camera-65,e.y-116,130,21,5,'#17363bea');text('モブシャーティー',e.x-camera,e.y-101,12);rounded(e.x-camera-40,e.y-94,80,6,3,'#362b37');rounded(e.x-camera-39,e.y-93,78*e.hp/e.maxHP,4,2,'#fa6a67');}
}
function paintShartyFX(kind,index,x,y,size,dir=1){
 const row={wave:0,portal:1,orb:2,burst:3}[kind],f=shartyArt.effects?.[row*4+index%4];if(!f)return;
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(x-camera,y);ctx.scale(dir,1);const s=size/Math.max(f.w,f.h);ctx.drawImage(f.img,-f.w*s/2,-f.h*s/2,f.w*s,f.h*s);ctx.restore();
}
function drawShartyEffects(){
 if(shartyEncounter?.state==='fighting')for(const x of [SHARTY.left,SHARTY.right]){
  ctx.save();ctx.globalAlpha=.45;ctx.fillStyle='#81dded';ctx.fillRect(x-camera-4,370,8,178);ctx.restore();paintShartyFX('portal',Math.floor(elapsed*8)%4,x,525,55);
 }
 const e=shartyEncounter?.enemy;if(e?.death<0&&e.action?.type==='special'&&e.action.age<.85)paintShartyFX('orb',Math.floor(e.action.age*8)%4,e.x+e.dir*35,e.y-48,20+e.action.age*35);
 for(const s of shartyShots)paintShartyFX(s.kind,Math.floor(s.age*12)%4,s.x,s.y,s.r*2.8,Math.sign(s.vx)||1);
 for(const f of shartyEffects)paintShartyFX(f.kind,Math.min(3,Math.floor(f.age/.12)),f.x,f.y,f.size,f.dir);
}
