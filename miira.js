'use strict';
const MIIRA=Object.freeze({height:72,walkGroup:'wa',frameTime:.105,downFrameTime:.09,fadeTime:.5,ballDamage:3,ballGravity:950,range:430,cooldown:3.2});
const miiraFrames={};
let dirtBalls=[];
async function loadMiira(){
 await Promise.all(['at','do','wa'].map(async group=>{
  miiraFrames[group]=await Promise.all(Array.from({length:8},async(_,i)=>{
   const img=await loadImage(`enemy/miira/${group}/${String(i+1).padStart(3,'0')}.png`);
   const source=document.createElement('canvas');source.width=img.width;source.height=img.height;
   const c=source.getContext('2d',{willReadFrequently:true});c.drawImage(img,0,0);
   const pixels=c.getImageData(0,0,img.width,img.height).data;let left=img.width,top=img.height,right=0,bottom=0;
   for(let y=0;y<img.height;y++)for(let x=0;x<img.width;x++)if(pixels[(y*img.width+x)*4+3]>8){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);}
   const w=right-left,h=bottom-top;if(w<=0||h<=0)throw Error(`Empty mummy sprite: ${group}/${i+1}`);
   const trimmed=document.createElement('canvas');trimmed.width=w;trimmed.height=h;trimmed.getContext('2d').drawImage(img,left,top,w,h,0,0,w,h);
   // Down poses keep a standing-body scale: the corpse and floating soul
   // must not be stretched to the full standing height.
   const reference=group==='do'?[282,282,280,300,295,300,290,282][i]:h;
   const anchors={at:[.49,.48,.51,.40,.36,.39,.53,.49],wa:[.46,.43,.45,.45,.45,.44,.45,.45],do:[.52,.52,.5,.5,.5,.52,.53,.53]};
   return {img:trimmed,w,h,scale:MIIRA.height/reference,anchorX:w*anchors[group][i],anchorY:h};
  }));
 }));
}
function miiraDeathDuration(){return MIIRA.downFrameTime*7+MIIRA.fadeTime;}
function miiraPose(e){const group=e.death>=0?'do':e.attackAge>=0?'at':MIIRA.walkGroup;const age=e.death>=0?e.death:e.attackAge>=0?e.attackAge:(e.walkAge||0);const index=group==='do'?Math.min(7,Math.floor(age/MIIRA.downFrameTime)):e.attackAge>=0?Math.min(7,Math.floor(age/MIIRA.frameTime)):Math.floor(age/.12)%8;return miiraFrames[group]?.[index];}
function throwDirt(e){
 if(dirtBalls.length>=48)return;
 e.dir=Math.sign(player.x-e.x)||e.dir;
 const x=e.x+e.dir*28,y=e.y-47,targetX=player.x+clamp(player.vx*.15,-45,45),targetY=player.y-30;
 const flight=clamp(Math.abs(targetX-x)/470,.65,.95);
 dirtBalls.push({x,y,vx:clamp((targetX-x)/flight,-650,650),vy:(targetY-y-.5*MIIRA.ballGravity*flight*flight)/flight,r:9,life:2.2,angle:0});
 burst(x,y,3,'#ad8150');
}
function updateMiira(e,dt){
 e.attackAge??=-1;e.attackCooldown??=.8+(e.phase%7)*.15;e.walkAge??=0;
 const distance=Math.abs(player.x-e.x);e.attackCooldown=Math.max(0,e.attackCooldown-dt);
 if(e.attackAge>=0){
  const previous=e.attackAge;e.attackAge+=dt;
  if(previous<MIIRA.frameTime*3&&e.attackAge>=MIIRA.frameTime*3)throwDirt(e);
  if(e.attackAge>=MIIRA.frameTime*8){e.attackAge=-1;e.attackCooldown=MIIRA.cooldown+(e.phase%5)*.12;}
 }else if(distance>=65&&distance<=MIIRA.range&&Math.abs(player.y-e.y)<180&&e.attackCooldown===0){e.dir=Math.sign(player.x-e.x)||e.dir;e.attackAge=0;}
 else{
  if(e.x<e.home-e.range)e.dir=1;else if(e.x>e.home+e.range)e.dir=-1;
  e.x+=e.dir*CONFIG.enemies.miira.speed*dt;e.walkAge+=dt;
 }
 e.x=clamp(e.x+e.knock*dt,e.home-e.range-40,e.home+e.range+40);e.knock*=Math.exp(-10*dt);
 if(Math.abs(player.x-e.x)<CONFIG.playerColliderWidth/2+e.w*.42&&player.y>e.y-e.h&&player.y-CONFIG.playerColliderHeight<e.y)damagePlayer(e);
}
// Swept collision handles fast balls without skipping players or narrow ledges.
function segmentHitsBox(x,y,nx,ny,left,top,right,bottom){
 let entry=0,exit=1;for(const [p,d,min,max] of [[x,nx-x,left,right],[y,ny-y,top,bottom]]){
  if(Math.abs(d)<1e-8){if(p<min||p>max)return false;continue;}
  const a=(min-p)/d,b=(max-p)/d;entry=Math.max(entry,Math.min(a,b));exit=Math.min(exit,Math.max(a,b));if(entry>exit)return false;
 }return true;
}
function updateDirtBalls(dt){
 for(const b of dirtBalls){
  const x=b.x,y=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt+.5*MIIRA.ballGravity*dt*dt;b.vy+=MIIRA.ballGravity*dt;b.life-=dt;b.angle+=dt*8;
  const terrain=b.y+b.r>=CONFIG.groundY||platforms.some(p=>segmentHitsBox(x,y,b.x,b.y,p.x-b.r,p.y-b.r,p.x+p.w+b.r,p.y+p.h+b.r));
  const hit=!terrain&&segmentHitsBox(x,y,b.x,b.y,player.x-CONFIG.playerColliderWidth/2-b.r,player.y-CONFIG.playerColliderHeight-b.r,player.x+CONFIG.playerColliderWidth/2+b.r,player.y+b.r);
  if(hit)damagePlayer({type:'miira',x:b.x},MIIRA.ballDamage);
  if(terrain||hit){b.life=0;burst(b.x,Math.min(b.y,CONFIG.groundY-3),7,'#b38b58');}
 }
 dirtBalls=dirtBalls.filter(b=>b.life>0&&Math.abs(b.x-player.x)<1600);
}
function drawDirtBalls(){for(const b of dirtBalls){ctx.save();ctx.translate(b.x-camera,b.y);ctx.rotate(b.angle);ctx.fillStyle='#86603b';ctx.strokeStyle='#493321';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<9;i++){const a=i*Math.PI*2/9,r=b.r*(i%2?.88:1.08);if(i===0)ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);else ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#c39a65';ctx.fillRect(-4,-5,5,3);ctx.fillStyle='#5f422c';ctx.fillRect(2,1,3,4);ctx.restore();}}
function drawMiira(e){
 const f=miiraPose(e);if(!f)return;const x=e.x-camera;if(x<-140||x>W+140)return;
 ctx.save();const fadeStart=MIIRA.downFrameTime*7;
 if(e.death>=fadeStart){const t=clamp((e.death-fadeStart)/MIIRA.fadeTime,0,1);ctx.globalAlpha=(1-t)*(Math.floor(t*10)%2?.25:1);}
 ctx.translate(x,e.y);if(e.launch?.spin){ctx.translate(0,-e.h/2);ctx.rotate(e.launch.angle);ctx.translate(0,e.h/2);}ctx.scale(e.dir,1);
 if(e.flash>0)ctx.filter='brightness(1.7)';ctx.drawImage(f.img,-f.anchorX*f.scale,-f.anchorY*f.scale,f.w*f.scale,f.h*f.scale);ctx.restore();
 if(e.death<0){rounded(x-26,e.y-e.h-12,52,5,2,'#293b3a');rounded(x-25,e.y-e.h-11,50*e.hp/e.maxHP,3,1,'#e9b766');if(e.attackAge>=0&&e.attackAge<MIIRA.frameTime*3)text('!',x,e.y-e.h-19,19,'#ffdc79');}
}
