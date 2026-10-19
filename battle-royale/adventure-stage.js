/* Side-scroll staging only. Arena rules and the original run-and-gun stay separate. */
(function(root){
'use strict';
const FLOOR=548;
const palettes={grass:['#735032','#372c28'],desert:['#b0793e','#654132'],town:['#66574c','#302c35'],neon:['#26354e','#111a30'],magma:['#573632','#261b29']};
function layout(source){
 const data=JSON.parse(JSON.stringify(source)),end=data.boss?data.width-1850:data.width-400;
 data.gaps=[];data.ropes=[];data.sandHills=[];data.townTires=[];data.props=[];data.platforms=[];data.coins=[];
 // Broad encounter courts alternate with optional raised routes. The main road is continuous.
 const courts=[];
 for(let x=820,i=0;x<end;x+=1080,i++){
  courts.push(x);
  const rise=175+((i+data.area)%3)*15;
  data.platforms.push({x:x-340,y:FLOOR-rise,w:240,h:24,solid:false,type:'expedition-ledge'});
  if(i%2===1)data.platforms.push({x:x+70,y:FLOOR-rise-65,w:260,h:24,solid:false,type:'expedition-ledge'});
  for(let n=0;n<3;n++)data.coins.push({x:x-300+n*70,y:FLOOR-rise-38,taken:false});
 }
 const types=source.enemies.map(e=>e.type);data.enemies=[];
 courts.forEach((x,i)=>{for(let n=0;n<(i%3===2?2:1);n++)data.enemies.push({type:types[(i*2+n)%Math.max(1,types.length)]||'lime',x:x+150+n*270,y:FLOOR});});
 // Two squat supply boxes, outside the starting pocket and final boss court.
 data.supplyBoxes=courts.filter((_,i)=>i===1||i===4).map(x=>({x:x-100,y:FLOOR,w:78,h:80}));
 if(data.supplyBoxes.length<2&&courts.length)data.supplyBoxes.push({x:Math.min(end-200,courts.at(-1)-100),y:FLOOR,w:78,h:80});
 data.supplyBoxes=data.supplyBoxes.filter((b,i,a)=>a.findIndex(x=>x.x===b.x)===i).slice(0,2);
 data.layoutVersion='expedition-courts-v1';return data;
}
function camera(game,vw,vh,dt){
 const p=game.fighters[0];game.viewWidth=vw;
 const x=Math.max(0,Math.min(game.worldWidth-vw,p.x-vw*.36));
 // Show the road and textured earth below it; follow jumps without dropping the floor out of view.
 const base=FLOOR-vh*.72,targetY=Math.max(base-vh*.26,Math.min(base,p.y-vh*.48));
 const k=Math.min(1,dt*7);game.camera.x+=(x-game.camera.x)*k;game.camera.y+=(targetY-game.camera.y)*k;
 game.camera.x=Math.max(0,Math.min(Math.max(0,game.worldWidth-vw),game.camera.x));return game.camera;
}
function platform(ctx,p,image,biome,view){
 if(p.gone||p.box||p.x+p.w<view.x||p.x>view.x+view.width)return;
 const ground=p.ground||p.solid,colors=palettes[biome]||palettes.grass;
 if(!ground){
  if(image?.naturalWidth){
   if(biome==='grass'){const scale=.65,h=image.height*scale;ctx.save();ctx.beginPath();ctx.rect(p.x,p.y,p.w,h);ctx.clip();for(let x=p.x;x<p.x+p.w;x+=image.width*scale)ctx.drawImage(image,x,p.y,image.width*scale,h);ctx.restore();}
   else {const scale=Math.min(p.w/image.width,72/image.height),span=image.width*scale,h=image.height*scale;ctx.save();ctx.beginPath();ctx.rect(p.x,p.y,p.w,h);ctx.clip();for(let x=p.x;x<p.x+p.w;x+=span)ctx.drawImage(image,x,p.y,span,h);ctx.restore();}
  }return;
 }
 const bottom=Math.max(p.y+320,view.y+view.height+32),left=Math.max(p.x,Math.floor(view.x/128)*128-128),right=Math.min(p.x+p.w,view.x+view.width+128);
 ctx.save();ctx.beginPath();ctx.rect(p.x,p.y,p.w,bottom-p.y);ctx.clip();ctx.fillStyle=colors[0];ctx.fillRect(left,p.y,right-left,bottom-p.y);
 if(image?.naturalWidth){
  const scale=biome==='grass'?.65:1,surfaceOffset=({grass:0,desert:5,town:1,neon:3,magma:4}[biome]||0)*scale,span=image.width*scale,cap=image.height*scale-surfaceOffset,stripY=Math.floor(image.height*.45),stripH=Math.max(1,Math.floor(image.height*.42));
  const start=p.x+Math.floor((left-p.x)/span)*span;
  for(let x=start;x<right;x+=span){ctx.drawImage(image,x,p.y-surfaceOffset,span,image.height*scale);for(let y=p.y+cap;y<bottom;y+=stripH*scale)ctx.drawImage(image,0,stripY,image.width,stripH,x,y,span,stripH*scale);}
 }
 const shade=ctx.createLinearGradient(0,p.y,0,bottom);shade.addColorStop(0,'#00000000');shade.addColorStop(.6,'#08112325');shade.addColorStop(1,'#08112370');ctx.fillStyle=shade;ctx.fillRect(left,p.y,right-left,bottom-p.y);
 // Staggered seams add depth to the lower exposed stratum without a flat bottom band.
 ctx.strokeStyle=colors[1];ctx.lineWidth=2;ctx.globalAlpha=.25;
 for(let y=p.y+120;y<bottom;y+=78)for(let x=Math.floor(left/170)*170;x<right;x+=170){const shift=(Math.floor(y/78)%2)*60;ctx.beginPath();ctx.moveTo(x+shift,y);ctx.lineTo(x+shift+48,y+9);ctx.lineTo(x+shift+70,y+4);ctx.stroke();}
 ctx.restore();
}
function crate(ctx,box,image){
 if(!image?.naturalWidth)return;
 // Alpha bounds measured from the bundled 96px art. Uniform scale, feet at collision bottom.
 const damaged=box.hp<box.maxHp*.6,crop=damaged?[8,18,80,78]:[9,16,78,80],scale=box.w/78;
 const w=crop[2]*scale,h=crop[3]*scale;ctx.drawImage(image,...crop,box.x-w/2,box.y-h,w,h);
}
const api={FLOOR,layout,camera,platform,crate};root.MobAdventureStage=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
