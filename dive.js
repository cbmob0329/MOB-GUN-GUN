'use strict';
const DIVE={speed:1200,windup:.16,recovery:.28,damage:{denden:28,nyoro:34},radius:125};
const diveArt={};let dive=null,diveEffects=[];
async function loadDive(){
 await Promise.all(['denden','nyoro','effects'].map(async name=>{
  const img=await loadImage(`combat/dive/${name}.png`),c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const data=g.getImageData(0,0,c.width,c.height).data;
  if(name==='nyoro'){diveArt.nyoro=isolateNyoroBodies(data,c.width,c.height);return;}
  // Actual transparent gutters: the flame tips extend below the nominal 3/4 row.
  const rows=name==='effects'?[0,318/1254,635/1254,957/1254,1]:[0,.26,.513,.737,1];
  diveArt[name]=Array.from({length:16},(_,i)=>{const cols=name==='effects'&&i>=12?[0,304/1254,606/1254,954/1254,1]:name==='effects'&&i>=4&&i<8?[0,308/1254,612/1254,952/1254,1]:[0,.25,.5,.75,1];const x0=Math.floor(cols[i%4]*c.width),x1=Math.floor(cols[i%4+1]*c.width),y0=Math.floor(rows[Math.floor(i/4)]*c.height),y1=Math.floor(rows[Math.floor(i/4)+1]*c.height);let l=x1,r=x0,t=y1,b=y0;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(data[(y*c.width+x)*4+3]>24){l=Math.min(l,x);r=Math.max(r,x+1);t=Math.min(t,y);b=Math.max(b,y+1);}if(r<=l||b<=t)throw Error(`Empty dive ${name} ${i}`);return{img,x:l,y:t,w:r-l,h:b-t};});
 }));
}
function resetDive(){dive=null;diveEffects=[];}
function startDive(){
 if(state!=='playing'||bossIntro()||player.grounded||ropeRide||dive||!['denden','nyoro'].includes(selectedCharacter)||nyoroAction||thunderLocked()||thunderBullet||skillState.charging)return;
 dive={character:selectedCharacter,age:0,landed:false,hit:new Set(),dir:player.dir};nyoroGlide=false;player.vy=0;player.knock=0;jumpRequest=0;
}
function updateDive(dt){
 for(const f of diveEffects)f.age+=dt;diveEffects=diveEffects.filter(f=>f.age<.36);
 if(!dive)return;dive.age+=dt;
 if(dive.character!==selectedCharacter||dive.age>3){dive=null;return;}
 if(dive.landed){if(dive.age>=DIVE.recovery)dive=null;return;}
 player.vx=0;player.vy=dive.age<DIVE.windup?0:DIVE.speed;
}
function landDive(){if(!dive||dive.landed)return;const a=dive;a.landed=true;a.age=0;
 for(const e of combatTargets()){if(e.death>=0||Math.abs(e.x-player.x)>DIVE.radius+e.w/2||e.y<player.y-100||e.y-e.h>player.y+20)continue;hitEnemy(e,DIVE.damage[a.character],Math.sign(e.x-player.x)||a.dir);if(a.character==='nyoro')burnEnemy(e);launchEnemy(e,(Math.sign(e.x-player.x)||a.dir)*160,-280);}
 diveEffects.push({x:player.x,y:player.y,character:a.character,age:0});burst(player.x,player.y-4,12,a.character==='nyoro'?'#ffa13b':'#8af4ff');
}
function paintDiveFrame(name,index,x,y,height,dir=1,width){const f=diveArt[name]?.[index];if(!f)return;const k=width?width/f.w:name==='effects'?height/f.h:height/((f.sourceHeight||f.img.height)*(name==='denden'?275:240)/1280);ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(x-camera,y);ctx.scale(dir,1);ctx.drawImage(f.img,f.x,f.y,f.w,f.h,-f.w*k/2,-f.h*k,f.w*k,f.h*k);ctx.restore();}
function drawDive(){if(!dive)return false;if(!dive.landed&&dive.age>=DIVE.windup)paintDiveFrame('effects',(dive.character==='nyoro'?8:0)+Math.floor(dive.age*16)%4,player.x,player.y-CONFIG.playerHeight*.65,80);const a=dive,i=a.landed?8+Math.min(7,Math.floor(a.age/DIVE.recovery*8)):a.age<DIVE.windup?Math.min(3,Math.floor(a.age/DIVE.windup*4)):4+Math.floor((a.age-DIVE.windup)*18)%4;ctx.save();if(player.inv>0&&Math.floor(player.inv*16)%2===0)ctx.globalAlpha=.4;paintDiveFrame(a.character,i,player.x,player.y,CONFIG.playerHeight,a.dir);ctx.restore();return true;}
function drawDiveEffects(){for(const f of diveEffects)paintDiveFrame('effects',(f.character==='nyoro'?12:4)+Math.min(3,Math.floor(f.age/.09)),f.x,f.y+5,80,1,240);}
window.addEventListener('DOMContentLoaded',()=>{const b=document.getElementById('dive');b.addEventListener('pointerdown',e=>{e.preventDefault();startDive();});});
window.addEventListener('keydown',e=>{if(e.target instanceof Element&&e.target.closest('input,textarea,select'))return;if(e.code==='KeyS'||e.code==='ArrowDown'){e.preventDefault();if(!e.repeat)startDive();}if(dive&&['KeyJ','Digit1','Digit2','Digit3'].includes(e.code)){e.preventDefault();e.stopImmediatePropagation();}},true);
window.addEventListener('pointerdown',e=>{if(dive&&e.target instanceof Element&&e.target.closest('.skill')){e.preventDefault();e.stopImmediatePropagation();}},true);
