'use strict';
const DRAGON=Object.freeze({hp:1680,height:200,width:108,speed:100,dashSpeed:540,contact:5,claw:6,breath:5,orb:6,stomp:8,flame:8,deathDuration:2.3,
 animations:['walk','hover','dash','attack','breath','orb','dive','flame','defeat','effects'],
 durations:{walk:1.2,hover:2.3,dash:1.35,attack:1.15,breath:2.15,orb:2.05,dive:2.1,flame:3.35}});
let selectedBoss='dragon',dragonShots=[],dragonEffects=[];
const dragonArt={};
function isolateDragonBodies(data,w,h){
 const labels=new Int32Array(w*h),queue=new Int32Array(w*h),parts=[];let id=0;
 for(let seed=0;seed<labels.length;seed++){
  if(labels[seed]||data[seed*4+3]<=24)continue;id++;let read=0,count=1,l=w,r=0,t=h,b=0;queue[0]=seed;labels[seed]=id;
  while(read<count){const p=queue[read++],x=p%w,y=Math.floor(p/w);l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);
   for(const n of [p-1,p+1,p-w,p+w])if(n>=0&&n<labels.length&&!labels[n]&&Math.abs(n%w-x)<=1&&data[n*4+3]>24){labels[n]=id;queue[count++]=n;}
  }
  if(count>1000)parts.push({id,l,r,t,b,count});
 }
 if(parts.length!==16)throw Error(`Dragon atlas: expected 16 separate silhouettes, got ${parts.length}`);
 parts.sort((a,b)=>Math.round(a.b/h*4)-Math.round(b.b/h*4)||a.l-b.l);
 return parts.map(p=>{
  const c=document.createElement('canvas');c.width=p.r-p.l+1;c.height=p.b-p.t+1;const g=c.getContext('2d'),out=g.createImageData(c.width,c.height);let footL=w,footR=0;
  for(let y=p.t;y<=p.b;y++)for(let x=p.l;x<=p.r;x++){const from=y*w+x;if(labels[from]!==p.id)continue;const to=((y-p.t)*c.width+x-p.l)*4;out.data.set(data.subarray(from*4,from*4+4),to);if(y>=p.b-8){footL=Math.min(footL,x);footR=Math.max(footR,x);}}
  g.putImageData(out,0,0);
  // Keep a shared body scale as wings open and the defeated body collapses.
  return{img:c,x:0,y:0,w:c.width,h:c.height,scale:DRAGON.height/(w/4*.8),anchorX:(footL+footR)/2-p.l,sourceId:p.id,sourceHeight:h};
 });
}

async function loadDragon(){
 await Promise.all(DRAGON.animations.map(async name=>{
  const img=await loadImage(`enemy/dragon/${name}.png`),c=document.createElement('canvas');c.width=img.width;c.height=img.height;
  const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const pixels=g.getImageData(0,0,c.width,c.height).data;
  if(name!=='effects'){dragonArt[name]=isolateDragonBodies(pixels,c.width,c.height);return;}
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
  dragonArt[name]=Array.from({length:16},(_,i)=>{
   const row=Math.floor(i/4),x0=columns[row][i%4],x1=columns[row][i%4+1],y0=rows[row],y1=rows[row+1];
   let l=x1,r=x0,t=y1,b=y0;
   for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(pixels[(y*c.width+x)*4+3]>24){l=Math.min(l,x);r=Math.max(r,x+1);t=Math.min(t,y);b=Math.max(b,y+1);}
   if(r<=l||b<=t)throw Error(`Empty Dragon frame: ${name}/${i}`);
   // Separate canvases prevent sampling an adjacent frame, including at fractional scales.
   const frame=document.createElement('canvas');frame.width=r-l;frame.height=b-t;frame.getContext('2d').drawImage(img,l,t,r-l,b-t,0,0,r-l,b-t);
   let fl=r,fr=l;for(let y=b-Math.max(3,Math.floor((b-t)*.08));y<b;y++)for(let x=l;x<r;x++)if(pixels[(y*c.width+x)*4+3]>180){fl=Math.min(fl,x);fr=Math.max(fr,x);}
   return {img:frame,w:r-l,h:b-t,anchorX:fr>=fl?(fl+fr)/2-l:(r-l)/2,source:{l,r,t,b,x0,x1,y0,y1}};
  });
  for(const f of dragonArt[name])f.scale=DRAGON.height/(c.width/4*.8);
 }));
}
function resetDragon(){dragonShots=[];dragonEffects=[];}
function makeDragon(x){return{type:'dragon',x,y:548,home:x,vx:0,vy:0,dir:-1,w:DRAGON.width,h:170,hp:DRAGON.hp,maxHP:DRAGON.hp,grounded:true,death:-1,flash:0,knock:0,stun:0,action:null,think:1.4,sequence:0,walkAge:0};}
function bossName(){return bossRoom?.kind==='dragon'?'モブドラゴン':'ミラモブ';}
function dragonStart(e,type){
 e.dir=Math.sign(player.x-e.x)||e.dir;
 e.action={type,age:0,dir:e.dir,hit:false,next:0,startX:e.x,startY:e.y,targetX:clamp(player.x,bossRoom.x+180,bossRoom.right-180)};
 if(type==='dive')e.grounded=false;
}
function dragonMouth(e){return{x:e.x+e.dir*76,y:e.y-94};}
function dragonEffect(kind,x,y,size=100,dir=1){dragonEffects.push({kind,x,y,size,dir,age:0});}
function dragonBlast(x,y,r,damage){
 dragonEffect('impact',x,y,r*2);burst(x,y,18,'#ff9b3b');
 if(segmentHitsBox(player.x,player.y-32,player.x,player.y-32,x-r,y-55,x+r,y+18))damagePlayer({x},damage);
}
function dragonFireball(e,angleOffset=0,speed=340){
 const m=dragonMouth(e),a=Math.atan2(player.y-35-m.y,player.x-m.x)+angleOffset;
 dragonShots.push({x:m.x,y:m.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:23,age:0,life:3,damage:DRAGON.orb});
 dragonEffect('orb',m.x,m.y,55,e.dir);
}
function dragonCone(e,length,height,damage){
 const m=dragonMouth(e),end=m.x+e.dir*length;
 // The visible flame is a horizontal danger band, leaving room to jump above it.
 if(player.x+17>=Math.min(m.x,end)&&player.x-17<=Math.max(m.x,end)&&player.y>m.y-height/2&&player.y-65<m.y+height/2)damagePlayer({x:e.x},damage);
}
function updateDragon(e,dt){
 if(bossRoom?.state!=='fighting'||e.death>=0)return;
 e.walkAge+=dt;e.think=Math.max(0,e.think-dt);e.knock*=Math.exp(-12*dt);
 if(!e.action){
  e.dir=Math.sign(player.x-e.x)||e.dir;e.vx=Math.abs(player.x-e.x)>180?e.dir*DRAGON.speed:0;e.x+=e.vx*dt;
  e.vy+=CONFIG.gravity*dt;e.y=Math.min(548,e.y+e.vy*dt);if(e.y===548){e.vy=0;e.grounded=true;}
  if(e.think===0&&e.stun<=0){const sequence=['attack','orb','hover','dive','dash','breath','flame'];dragonStart(e,sequence[e.sequence++%sequence.length]);}
 }else{
  const a=e.action;a.age+=dt;const t=a.age;e.vx=0;
  if(a.type==='hover'){
   e.grounded=false;e.y=548-190*Math.min(1,t/.7)+Math.sin(t*5)*5;
   e.x=clamp(e.x+a.dir*38*dt,bossRoom.x+155,bossRoom.right-155);
  }else if(a.type==='dive'){
   // Rise first; lock the landing marker before the plunge so it can be dodged.
   e.grounded=false;
   if(t<.7){e.y=a.startY-(a.startY-320)*Math.min(1,t/.7);e.x=a.startX+(a.targetX-a.startX)*Math.min(1,t/.7);}
   else if(t<1.1){e.x=a.targetX;e.y=320;}
   else if(!a.landed){e.y+=1050*dt;if(e.y>=548){e.y=548;a.landed=true;dragonBlast(e.x,535,150,DRAGON.stomp);}}
   if(a.landed)e.grounded=true;
  }else{
   e.vy+=CONFIG.gravity*dt;e.y=Math.min(548,e.y+e.vy*dt);if(e.y===548){e.vy=0;e.grounded=true;}
   if(a.type==='dash'&&t>=.55&&t<1.08){e.vx=a.dir*DRAGON.dashSpeed;e.x+=e.vx*dt;}
   if(a.type==='attack'&&t>=.47&&!a.hit){a.hit=true;dragonEffect('claw',e.x+a.dir*105,e.y-62,150,a.dir);const x=e.x+a.dir*100;if(Math.abs(player.x-x)<95&&player.y>e.y-125&&player.y-65<e.y)damagePlayer(e,DRAGON.claw);}
   if(a.type==='orb')while(a.next<3&&t>=.65+a.next*.3){dragonFireball(e,(a.next-1)*.08);a.next++;}
   if(a.type==='breath'&&t>=.75&&t<1.75)dragonCone(e,330,105,DRAGON.breath);
   if(a.type==='flame'&&t>=1.65&&t<2.55){dragonCone(e,640,135,DRAGON.flame);if(a.next===0){a.next++;dragonEffect('impact',e.x,e.y-35,140);}}
  }
  if(t>=DRAGON.durations[a.type]){e.action=null;e.think=e.hp<e.maxHP*.4?.65:.95;e.vy=0;}
 }
 e.x=clamp(e.x,bossRoom.x+155,bossRoom.right-155);
 if(Math.abs(player.x-e.x)<e.w*.4+17&&player.y>e.y-e.h&&player.y-65<e.y)damagePlayer(e,DRAGON.contact);
}
function updateDragonEffects(dt){
 if(bossRoom?.boss?.type==='dragon'&&bossRoom.boss.death>=0)dragonShots=[];
 for(const s of dragonShots){
  const ox=s.x,oy=s.y;s.age+=dt;s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;
  const hit=segmentHitsBox(ox,oy,s.x,s.y,player.x-17-s.r,player.y-65-s.r,player.x+17+s.r,player.y+s.r);
  if(hit){damagePlayer({x:s.x},s.damage);s.life=0;dragonEffect('impact',s.x,s.y,100);}
  else if(s.y+s.r>=548){s.life=0;dragonEffect('impact',s.x,530,100);}
 }
 dragonShots=dragonShots.filter(s=>s.life>0&&s.x>camera-150&&s.x<camera+W+150);
 for(const f of dragonEffects)f.age+=dt;dragonEffects=dragonEffects.filter(f=>f.age<.55).slice(-45);
}
function dragonPose(e){
 if(e.death>=0)return{name:'defeat',index:Math.min(15,Math.floor(e.death/1.7*16))};
 const a=e.action;if(!a)return{name:e.y<500?'hover':'walk',index:Math.floor(e.walkAge*10)%16};
 if(a.type==='hover')return{name:'hover',index:Math.floor(a.age*10)%16};
 if(a.type==='dive')return{name:'dive',index:a.age<1.1?Math.min(7,Math.floor(a.age/1.1*8)):a.landed?Math.min(15,8+Math.floor((a.age-1.3)/.8*8)):7};
 return{name:a.type,index:Math.min(15,Math.floor(a.age/DRAGON.durations[a.type]*16))};
}
function drawDragon(e){
 const pose=dragonPose(e),f=dragonArt[pose.name]?.[Math.max(0,pose.index)];if(!f)return;
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.fillStyle='#28171350';ctx.beginPath();ctx.ellipse(e.x-camera,548,74,10,0,0,Math.PI*2);ctx.fill();
 ctx.translate(e.x-camera,e.y);ctx.scale(e.dir,1);
 if(e.flash>0)ctx.filter='brightness(1.8)';if(e.death>1.7)ctx.globalAlpha=Math.max(0,1-(e.death-1.7)/.6);
 ctx.drawImage(f.img,-f.anchorX*f.scale,-f.h*f.scale,f.w*f.scale,f.h*f.scale);ctx.restore();
}
function dragonFX(kind,index,x,y,w,h=w,dir=1){
 const row={claw:0,breath:1,orb:2,impact:3}[kind],f=dragonArt.effects?.[row*4+index%4];if(!f)return;
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(x-camera,y);ctx.scale(dir,1);ctx.drawImage(f.img,-w/2,-h/2,w,h);ctx.restore();
}
function drawDragonEffects(){
 const e=bossRoom?.boss;if(e?.type==='dragon'&&e.death<0&&e.action){
  const a=e.action,t=a.age,m=dragonMouth(e),index=Math.floor(t*12)%4;
  if(a.type==='breath'||a.type==='flame'){
   const big=a.type==='flame',windup=big?1.65:.75,end=big?2.55:1.75,length=big?640:330;
   if(t<windup){dragonFX('orb',index,m.x,m.y,25+30*t/windup);ctx.save();ctx.setLineDash([10,9]);ctx.strokeStyle='#ffbe66';ctx.lineWidth=3;ctx.strokeRect(Math.min(m.x,m.x+a.dir*length)-camera,510,length,24);ctx.restore();}
   else if(t<end)dragonFX('breath',index,m.x+a.dir*length/2,m.y,length,big?150:110,a.dir);
  }
  if(a.type==='dive'&&!a.landed){ctx.save();ctx.strokeStyle='#ffbd55';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(a.targetX-camera,540,150,10,0,0,Math.PI*2);ctx.stroke();text('↓',a.targetX-camera,511,30,'#ffde87');ctx.restore();}
  if(a.type==='dash'&&t<.55){ctx.save();ctx.strokeStyle='#ffdf89';ctx.lineWidth=4;const x=e.x-camera+a.dir*90;ctx.beginPath();ctx.moveTo(x,535);ctx.lineTo(x+a.dir*120,535);ctx.lineTo(x+a.dir*100,520);ctx.stroke();ctx.restore();}
 }
 for(const s of dragonShots)dragonFX('orb',Math.floor(s.age*12)%4,s.x,s.y,60,60,Math.sign(s.vx)||1);
 for(const f of dragonEffects)dragonFX(f.kind,Math.min(3,Math.floor(f.age/.14)),f.x,f.y,f.size,f.size,f.dir);
}
document.querySelectorAll('[data-boss]').forEach(button=>button.addEventListener('click',()=>{
 if(!['loading','ready','dead','clear','areaClear'].includes(state))return;
 selectedBoss=button.dataset.boss;document.querySelectorAll('[data-boss]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
}));
