'use strict';
// Atlas rows: locomotion, recoil, collapse. Source rectangles preserve generated art.
const LIME = Object.freeze({width:58,height:50,scale:.25,deathDuration:1.05,walkFrameSeconds:.30});
let limeFrames=[];
async function loadLime(){
 const img=await loadImage('enemy/lime-goggles/spritesheet.png');
 limeFrames=isolateCharacterBodies(img,12);
}
function limeFrameIndex(e){return e.death>=0?8+Math.min(3,Math.floor(e.death/.17)):e.flash>0?4+Math.min(3,Math.floor((.1-e.flash)/.025)):[0,1,2,3,2,1][Math.floor((e.walkAge||0)/LIME.walkFrameSeconds)%6];}
function updateLime(e,dt){
 const target=enemyTarget(e);e.walkAge=(e.walkAge||0)+dt;
 if(Math.abs(target.x-e.x)<360)e.dir=Math.sign(target.x-e.x)||e.dir;
 if(e.x<=e.home-e.range)e.dir=1;else if(e.x>=e.home+e.range)e.dir=-1;
 const speed=CONFIG.enemies.lime.speed*(.65+.35*Math.sin(e.walkAge*Math.PI/1.8)**2);
 moveEnemyOnTerrain(e,e.dir*speed,dt);
 hostileContact(e,CONFIG.enemies.lime.damage);
}
function drawLime(e){
 const x=e.x-camera;if(x<-160||x>W+160)return;
 const f=limeFrames[limeFrameIndex(e)];if(!f)return;
 ctx.save();ctx.imageSmoothingEnabled=false;
 if(e.death>.68)ctx.globalAlpha=clamp((LIME.deathDuration-e.death)/.37,0,1);
 ctx.translate(x,e.y);
 if(e.launch?.spin){ctx.translate(0,-e.h/2);ctx.rotate(e.launch.angle);ctx.translate(0,e.h/2);}
 ctx.scale(e.dir,1);if(e.flash>0)ctx.filter='brightness(1.6)';
 ctx.drawImage(f.img,f.x,f.y,f.w,f.h,-f.w*LIME.scale/2,-f.h*LIME.scale,f.w*LIME.scale,f.h*LIME.scale);ctx.restore();
 if(e.death<0){const top=e.y-Math.max(e.h,f.h*LIME.scale);rounded(x-56,top-39,112,22,5,'#17363be6');text(CONFIG.enemies.lime.name,x,top-23,12);rounded(x-32,top-15,64,6,3,'#293b3a');rounded(x-31,top-14,62*e.hp/e.maxHP,4,2,'#fa6a67');}
}
