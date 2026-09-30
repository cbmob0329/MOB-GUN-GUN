'use strict';
const NYORO_COMBO_VISUAL=Object.freeze({faceSize:35,effectSize:140,effectForward:85,effectHeight:85});
const NYORO_ORB={speed:580,size:66,radius:23,life:1.4};
let nyoroOrbs=[],nyoroOrbHits=[];const nyoroOrbArt=[];
function resetNyoroOrbs(){nyoroOrbs=[];nyoroOrbHits=[];}
function spawnNyoroOrb(a,up){
 const x=player.x+a.dir*35,y=player.y-43;
 const targets=(a.upperTargets||[]).filter(e=>e.death<0&&Math.abs(e.x-x)<650&&e.y<player.y-35);
 targets.sort((e,f)=>Math.hypot(e.x-x,e.y-y)-Math.hypot(f.x-x,f.y-y));const target=up?targets[0]:null;
 const dx=target?target.x-x:a.dir*(up?180:500),dy=target?target.y-target.h/2-y:up?-260:0,len=Math.hypot(dx,dy)||1;
 nyoroOrbs.push({x,y,vx:dx/len*NYORO_ORB.speed,vy:dy/len*NYORO_ORB.speed,target,up,dir:a.dir,age:0,life:NYORO_ORB.life,damage:up?NYORO.comboSweep:NYORO.comboBurst,owner:a});
}
function updateNyoroOrbs(dt){
 for(const f of nyoroOrbHits)f.age+=dt;nyoroOrbHits=nyoroOrbHits.filter(f=>f.age<.26);
 for(const b of nyoroOrbs){b.age+=dt;b.life-=dt;const ox=b.x,oy=b.y;
  if(b.target?.death<0&&b.age<.7){const dx=b.target.x-b.x,dy=b.target.y-b.target.h/2-b.y,d=Math.hypot(dx,dy)||1,k=1-Math.exp(-18*dt);b.vx+=(dx/d*NYORO_ORB.speed-b.vx)*k;b.vy+=(dy/d*NYORO_ORB.speed-b.vy)*k;}
  b.x+=b.vx*dt;b.y+=b.vy*dt;const r=NYORO_ORB.radius;
  const targets=combatTargets().filter(e=>e.death<0&&segmentHitsBox(ox,oy,b.x,b.y,e.x-e.w/2-r,e.y-e.h-r,e.x+e.w/2+r,e.y+r)).sort((e,f)=>Math.hypot(e.x-ox,e.y-e.h/2-oy)-Math.hypot(f.x-ox,f.y-f.h/2-oy));
  const e=targets[0];if(e){hitEnemy(e,b.damage,b.dir);burnEnemy(e);if(!b.up)launchEnemy(e,b.dir*220,-220);const phase=b.up?'sweep':'burst';b.owner.hit.set(phase,new Set([e]));b.life=0;nyoroOrbHits.push({x:b.x,y:b.y,age:0});burst(b.x,b.y,10,'#ffb841');}
 }
 nyoroOrbs=nyoroOrbs.filter(b=>b.life>0&&b.x>0&&b.x<CONFIG.worldWidth&&b.y>-600&&b.y<CONFIG.groundY+80&&Math.abs(b.x-player.x)<1100);
}
// Cached coarse-pixel fireballs, rendered at their actual projectile position.
function nyoroOrbSprite(frame){if(nyoroOrbArt[frame])return nyoroOrbArt[frame];const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');
 for(let y=0;y<32;y++)for(let x=0;x<32;x++){const d=Math.hypot(x-17,y-16),edge=12+Math.sin(y*1.9+frame)*1.5;if(d<edge){g.fillStyle=d>10?'#b62e17':d>7?'#f85a13':d>4?'#ffb62c':'#fff6a5';g.fillRect(x,y,1,1);}}
 for(let i=0;i<4;i++){g.fillStyle=i%2?'#ffb62c':'#f85a13';g.fillRect(1+(i+frame)%3,7+i*5,7,2);}nyoroOrbArt[frame]=c;return c;}
function drawNyoroComboFX(){
 for(const b of nyoroOrbs){ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(b.x-camera,b.y);ctx.rotate(Math.atan2(b.vy,b.vx));ctx.drawImage(nyoroOrbSprite(Math.floor(b.age*14)%4),-NYORO_ORB.size/2,-NYORO_ORB.size/2,NYORO_ORB.size,NYORO_ORB.size);ctx.restore();}
 for(const f of nyoroOrbHits){ctx.save();ctx.globalAlpha=1-f.age/.26;const size=66+f.age*150;ctx.imageSmoothingEnabled=false;ctx.drawImage(nyoroOrbSprite(2),f.x-camera-size/2,f.y-size/2,size,size);ctx.restore();}
}
// The generated atlas is not an equal-cell grid: umbrellas cross cell boundaries.
// Label opaque connected silhouettes once at load time so no neighbour can leak in.
function isolateNyoroBodies(data,w,h){
 const labels=new Int32Array(w*h),queue=new Int32Array(w*h),parts=[];let id=0;
 for(let seed=0;seed<labels.length;seed++){
  if(labels[seed]||data[seed*4+3]<=24)continue;id++;let read=0,count=1,l=w,r=0,t=h,b=0;queue[0]=seed;labels[seed]=id;
  while(read<count){const p=queue[read++],x=p%w,y=Math.floor(p/w);l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);
   for(const n of [p-1,p+1,p-w,p+w])if(n>=0&&n<labels.length&&!labels[n]&&Math.abs(n%w-x)<=1&&data[n*4+3]>24){labels[n]=id;queue[count++]=n;}
  }
  if(count>1000)parts.push({id,l,r,t,b,count});
 }
 if(parts.length!==16)throw Error(`Nyoro atlas: expected 16 separate silhouettes, got ${parts.length}`);
 parts.sort((a,b)=>Math.round(a.b/h*4)-Math.round(b.b/h*4)||a.l-b.l);
 return parts.map(p=>{
  const c=document.createElement('canvas');c.width=p.r-p.l+1;c.height=p.b-p.t+1;const g=c.getContext('2d'),out=g.createImageData(c.width,c.height);let footL=w,footR=0;
  for(let y=p.t;y<=p.b;y++)for(let x=p.l;x<=p.r;x++){const from=y*w+x;if(labels[from]!==p.id)continue;const to=((y-p.t)*c.width+x-p.l)*4;out.data.set(data.subarray(from*4,from*4+4),to);if(y>=p.b-8){footL=Math.min(footL,x);footR=Math.max(footR,x);}}
  g.putImageData(out,0,0);
  // One body scale for all poses; opening the umbrella never rescales the cat.
  const faceWidth=112*w/1254;
  return{img:c,x:0,y:0,w:c.width,h:c.height,scale:NYORO_COMBO_VISUAL.faceSize/faceWidth,faceWidth,anchorX:(footL+footR)/2-p.l,sourceId:p.id,sourceHeight:h};
 });
}
async function loadNyoroCombo(){
 await Promise.all(['body','effects'].map(async name=>{const img=await loadImage(`nyoro/combo/${name}.png`),c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const data=g.getImageData(0,0,c.width,c.height).data;
 if(name==='body'){nyoroComboArt.body=isolateNyoroBodies(data,c.width,c.height);return;}
 nyoroComboArt[name]=Array.from({length:16},(_,i)=>{const rows=name==='body'?[0,.31,.51,.75,1]:[0,.25,.5,.75,1];const l0=Math.floor(i%4*c.width/4),r0=Math.floor((i%4+1)*c.width/4),t0=Math.floor(rows[Math.floor(i/4)]*c.height),b0=Math.floor(rows[Math.floor(i/4)+1]*c.height);let l=r0,r=l0,t=b0,b=t0;for(let y=t0;y<b0;y++)for(let x=l0;x<r0;x++)if(data[(y*c.width+x)*4+3]>24){l=Math.min(l,x);r=Math.max(r,x+1);t=Math.min(t,y);b=Math.max(b,y+1);}if(r<=l||b<=t)throw Error(`Empty Nyoro combo ${name} ${i}`);return{img,x:l,y:t,w:r-l,h:b-t};});}));
}
function nyoroComboFrame(){return Math.min(15,Math.floor(nyoroAction.age/.05625));}
function drawNyoroComboBody(){const f=nyoroComboArt.body[nyoroComboFrame()];if(!f)return;const k=f.scale;ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(player.x-camera,player.y);ctx.scale(nyoroAction.dir,1);if(player.inv>0&&Math.floor(player.inv*16)%2===0)ctx.globalAlpha=.35;ctx.drawImage(f.img,f.x,f.y,f.w,f.h,-f.anchorX*k,-f.h*k,f.w*k,f.h*k);ctx.restore();}
