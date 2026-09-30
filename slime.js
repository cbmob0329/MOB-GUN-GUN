'use strict';
// Atlas rows: locomotion, recoil, collapse. Source rectangles preserve generated art.
const LIME = Object.freeze({width:58,height:50,scale:.25,deathDuration:1.05});
let limeFrames=[];
async function loadLime(){
 const img=await loadImage('enemy/lime-goggles/spritesheet.png');
 const c=document.createElement('canvas');c.width=img.width;c.height=img.height;
 const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);
 const data=g.getImageData(0,0,c.width,c.height).data;
 const xs=[0,318,632,944,1254],rows=[[70,480],[510,855],[920,1225]];
 limeFrames=rows.flatMap(([top,bottom])=>xs.slice(0,4).map((left,i)=>{
  let l=xs[i+1],t=bottom,r=left,b=top;
  for(let y=top;y<bottom;y++)for(let x=left;x<xs[i+1];x++)if(data[(y*c.width+x)*4+3]>16){l=Math.min(l,x);r=Math.max(r,x+1);t=Math.min(t,y);b=Math.max(b,y+1);}
  if(r<=l||b<=t)throw Error('Empty lime slime sprite');
  return{img,x:l,y:t,w:r-l,h:b-t};
 }));
}
function limeFrameIndex(e){return e.death>=0?8+Math.min(3,Math.floor(e.death/.17)):e.flash>0?4+Math.min(3,Math.floor((.1-e.flash)/.025)):Math.floor((e.walkAge||0)/.14)%4;}
function updateLime(e,dt){
 e.walkAge=(e.walkAge||0)+dt;
 if(Math.abs(player.x-e.x)<360)e.dir=Math.sign(player.x-e.x)||e.dir;
 if(e.x<=e.home-e.range)e.dir=1;else if(e.x>=e.home+e.range)e.dir=-1;
 const speed=CONFIG.enemies.lime.speed*(.65+.35*Math.sin(e.walkAge*11)**2);
 const next=e.x+(e.dir*speed+e.knock)*dt;
 if(Number.isFinite(groundAt(next+e.dir*40)))e.x=clamp(next,e.home-e.range-15,e.home+e.range+15);else e.dir*=-1;
 e.knock*=Math.exp(-10*dt);
 if(Math.abs(player.x-e.x)<CONFIG.playerColliderWidth/2+e.w*.42&&player.y>e.y-e.h&&player.y-CONFIG.playerColliderHeight<e.y)damagePlayer(e);
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
