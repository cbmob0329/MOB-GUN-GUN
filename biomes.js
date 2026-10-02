'use strict';
const BIOMES=[
 {id:'grass',name:'草原',route:'GREENWAY',color:'#705030',sub:['はじまりの草原','こもれびの高台','風わたる谷','古樹の奥地']},
 {id:'desert',name:'砂漠',route:'DUNE RUN',color:'#b67d44',sub:['風紋の入口','崩れる砂丘','白骨の回廊','灼熱の遺跡']},
 {id:'town',name:'田舎町',route:'OLD TOWN',color:'#94774d',sub:['路地裏の朝','屋根の上の散歩','転がる商店街','駅前の決戦']},
 {id:'neon',name:'ネオン街',route:'NEON RISE',color:'#252a49',sub:['光る交差点','空中遊園地','上昇する街','夜空のホール']},
 {id:'magma',name:'マグマ',route:'LAVA FORGE',color:'#482e30',sub:['赤熱の入口','吹き上がる岩床','溶岩の回廊','火竜の炉心']}
];
let biomeIndex=0,sandHills=[],townTires=[],biomeClock=0;
const biomeArt={},biomeBackgrounds={};let townStoneFloor=null;
async function loadBiomeAtlas(path){
 const img=await loadImage(path),c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const pixels=g.getImageData(0,0,c.width,c.height).data;
 const gutter=(axis,expected,lo,hi)=>{const extent=axis==='y'?c.height:c.width;let best=Math.round(expected),score=Infinity;
  for(let v=Math.max(1,Math.floor(expected-extent*.04));v<Math.min(extent-1,expected+extent*.04);v++){let count=0;for(let q=lo;q<hi;q++){const x=axis==='y'?q:v,y=axis==='y'?v:q;if(pixels[(y*c.width+x)*4+3]>24)count++;}const cost=count*10000+Math.abs(v-expected);if(cost<score){score=cost;best=v;}}return best;};
 const rows=path.endsWith('desert_props.png')?[0,.30,.605,.815,1].map(v=>Math.round(v*c.height)):[0,...[1,2,3].map(i=>gutter('y',i*c.height/4,0,c.width)),c.height];
 return rows.slice(0,4).flatMap((top,row)=>{const bottom=rows[row+1],cols=[0,...[1,2,3].map(i=>gutter('x',i*c.width/4,top,bottom)),c.width];return cols.slice(0,4).map((left,col)=>{
  const right=cols[col+1];let l=right,r=left,t=bottom,b=top;
  for(let y=top;y<bottom;y++)for(let x=left;x<right;x++)if(pixels[(y*c.width+x)*4+3]>24){l=Math.min(l,x);r=Math.max(r,x+1);t=Math.min(t,y);b=Math.max(b,y+1);}
  if(r<=l||b<=t)throw Error('Empty biome frame: '+path);
  const frame=document.createElement('canvas');frame.width=r-l;frame.height=b-t;frame.getContext('2d').drawImage(img,l,t,r-l,b-t,0,0,r-l,b-t);return{img:frame,w:r-l,h:b-t};
 });});
}
async function loadBiomes(){townStoneFloor=await loadImage('stage/expansion/town_stone.png');await Promise.all(BIOMES.slice(1).map(async(b,i)=>{
 const [terrain,props,bg]=await Promise.all([loadBiomeAtlas(`stage/expansion/${b.id}_terrain.png`),loadBiomeAtlas(`stage/expansion/${b.id}_props.png`),loadImage(`stage/00${i+2}.png`)]);biomeArt[b.id]={terrain,props};biomeBackgrounds[b.id]=bg;
}));}
function biomeSprite(group,frame,x,y,w,h){const f=biomeArt[BIOMES[biomeIndex].id]?.[group]?.[frame];if(!f)return;ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(f.img,x,y,w,h);ctx.restore();}
function addBiomeProp(row,x){const c={type:'crate',propKind:'biome',row,x,y:548,w:row===1?52:62,h:row===2?115:90,hp:row===2?60:36,maxHP:row===2?60:36,death:-1,flash:0,brokenAt:0};props.push(c);crates.push(c);return c;}
function buildBiomeArea(){
 sandHills=[];townTires=[];biomeClock=0;
 const b=biomeIndex,a=areaIndex,last=currentArea().boss?CONFIG.worldWidth-2000:CONFIG.worldWidth-650;
 // Each Area uses a different offset, spacing and height profile, with a safe opening.
 for(let x=1050,n=0;x<last;x+=b===4?1500:900,n++){
  if(b===1){sandHills.push({x:x-120,w:300,h:60+(n+a)%3*12,timer:-1,gone:false,age:0,spawned:false});if(n%2===0)platforms.push({x:x+190,y:410-(a%2)*25,w:190,h:30});}
  if(b===2){platforms.push({x:x-30,y:435-(n+a)%3*34,w:220,h:30});if(n%2===0)townTires.push({x:x+380,y:548,vx:-185-a*12,active:false,spent:false,angle:0});}
  if(b===3){for(let j=0;j<3;j++)platforms.push({x:x-150+j*175,y:460-j*80-(a%2)*20,w:150,h:28,motion:j===1?{axis:'y',range:45,period:4.5}:j===2?{axis:'x',range:45,period:5}:null});addCoinLine(x+235,245-(a%2)*20,3,35);}
  if(b===4){const gapX=x-80,width=300+(a%2)*40;gaps.push({x:gapX,w:width,lava:true});platforms.push({x:gapX+65,y:488,w:170,h:28,geyser:true,motion:{axis:'y',range:88,period:4.8+(n%2)}});addCoinLine(gapX+85,355,3,38);}
 }
 // Sparse props, never in a pit or under a platform's full travel envelope.
 for(let x=680,n=0;x<last;x+=1750,n++)if(!gaps.some(g=>x>g.x-140&&x<g.x+g.w+140)&&!sandHills.some(h=>x>h.x-70&&x<h.x+h.w+70)&&!platforms.some(p=>x>p.x-100&&x<p.x+p.w+100))addBiomeProp(b===4?n%2:n%3,x);
 props=props.slice(0,b===2&&a%2===0?1:2);crates=crates.filter(p=>props.includes(p));
 addActionTerraces();
 if(b===3){addStairs(650,4);addStairs(3200,5);}
 if(b===1&&a===1){platforms=platforms.filter(p=>p.x+p.w<5000);sandHills=sandHills.filter(h=>h.x+h.w<5000);props=props.filter(p=>p.x<4950);crates=crates.filter(p=>props.includes(p));}
 stitchPlatforms();
 for(const [i,p] of platforms.entries()){p.variant=i%4;if(p.motion){p.originX=p.x;p.originY=p.y;p.motionAge=a*.7;}}
 for(let x=300;x<last;x+=450)if(!gaps.some(g=>x>g.x-50&&x<g.x+g.w+50))addCoinLine(x,505,3,35);
 hintTimer=6;$('hint').hidden=false;$('hint').textContent=currentArea().name+' — '+['','砂山は乗ると崩れる！','タイヤをジャンプでかわそう','動く足場を乗り継ごう','吹上足場で溶岩を越えよう'][b];
}
function sandLanding(p,oldY,grounded){let floor=Infinity;for(const h of sandHills){if(h.gone||p.x<h.x||p.x>h.x+h.w)continue;const y=548-Math.sin((p.x-h.x)/h.w*Math.PI)*h.h;if((oldY<=y+8&&p.y>=y)||(grounded&&Math.abs(oldY-y)<15)){floor=Math.min(floor,y);if(p===player&&h.timer<0)h.timer=0;}}return floor;}
function damageBiomeProp(p,damage){if(p.death>=0)return;p.hp=Math.max(0,p.hp-damage);p.flash=.12;if(p.hp===0){p.death=0;p.brokenAt=elapsed;burst(p.x,p.y-30,16,biomeIndex===3?'#66e9ff':'#ffc578');
 if(Math.random()<.3)dorayaki.push({x:p.x,y:450,baseY:528,vy:-180,age:0});else{for(let i=0;i<3;i++)coins.push({x:p.x+(i-1)*25,y:500-Math.abs(i-1)*8,taken:false});}
}}
function updateBiome(dt){
 biomeClock+=dt;
 for(const h of sandHills){if(h.timer>=0&&!h.gone){h.timer+=dt;if(h.timer>=.72){h.gone=true;h.age=0;burst(h.x+h.w/2,530,16,'#eac388');if(!h.spawned&&Math.random()<.3){h.spawned=true;const e=randomNewEnemy(h.x+h.w/2,520);e.dropping={vy:-200};}}}if(h.gone)h.age+=dt;}
 for(const t of townTires){if(!t.active&&player.x>t.x-650)t.active=true;if(!t.active||t.spent)continue;const ox=t.x;t.x+=t.vx*dt;t.angle+=t.vx*dt/30;
  if(segmentHitsBox(ox,518,t.x,518,player.x-43,player.y-65-25,player.x+43,player.y+25))damagePlayer({x:t.x},6);if(t.x<camera-300)t.spent=true;
 }
 if(biomeIndex===4&&gaps.some(g=>player.x>g.x&&player.x<g.x+g.w)&&player.y>575){burst(player.x,566,20,'#ff782e');respawnFromFall();}
}
function drawTownStone(x,y,w,h,variant=0){const i=((Math.floor(variant)%4)+4)%4;ctx.drawImage(townStoneFloor,32+i*384,113,324,115,x,y,w,h);}
function drawBiomeGround(){const b=BIOMES[biomeIndex];ctx.fillStyle=b.color;ctx.fillRect(0,548,W,H+Math.abs(cameraY));
 const size=400;ctx.save();ctx.imageSmoothingEnabled=false;for(let x=Math.floor(camera/size)*size;x<camera+W;x+=size){const f=biomeArt[b.id].terrain[((x/size)%4+4)%4];if(biomeIndex===2)drawTownStone(x-camera,546,size+1,190,x/size);else ctx.drawImage(f.img,8,0,f.w-16,f.h,x-camera,546,size+1,190);}ctx.restore();
}
function drawBiomePlatform(p){if(!p.solid&&(p.x+p.w<camera||p.x>camera+W))return;
 if(p.solid){drawConnectedTerrace(p);return;}
 if(p.geyser){const f=12+Math.floor(biomeClock*7)%4;biomeSprite('props',f,p.x-camera,p.y-2,p.w,Math.max(60,568-p.y));return;}
 const index=4+(typeof p.variant==='number'?p.variant:0);const topOffset=biomeIndex===2?[0,0,.30,.28][index-4]:biomeIndex===3?[0,.05,.22,.28][index-4]:0;drawIslandStrip(biomeArt[BIOMES[biomeIndex].id].terrain[index],p.x-camera,p.y-2-topOffset*65,p.w,65);
}
function drawBiomeDecor(){
 for(const p of props){if(p.propKind!=='biome'||p.x<camera-200||p.x>camera+W+200)continue;const elapsedDead=elapsed-p.brokenAt;
  if(p.death>=0&&elapsedDead>1)continue;const index=p.row*4+(p.death>=0?elapsedDead<.24?2:3:p.hp<p.maxHP?1:0),f=biomeArt[BIOMES[biomeIndex].id].props[index],base=biomeArt[BIOMES[biomeIndex].id].props[p.row*4];
  const h=biomeIndex===1&&p.row!==2?150:p.h,k=h/base.h;ctx.save();if(p.flash>0)ctx.filter='brightness(1.7)';if(p.death>=0)ctx.globalAlpha=Math.max(0,1-(elapsedDead-.5)*2);ctx.fillStyle='#1b1e293e';ctx.fillRect(p.x-camera-p.w/2,p.y-2,p.w,5);biomeSprite('props',index,p.x-camera-f.w*k/2,p.y-f.h*k+3,f.w*k,f.h*k);ctx.restore();
 }
 for(const h of sandHills){if(h.gone&&h.age>.6)continue;const f=h.gone?Math.min(15,14+Math.floor(h.age*4)):h.timer>=0?13:12;
  // Clip decorative sprite to the same curved height profile used by collision.
  ctx.save();ctx.beginPath();ctx.moveTo(h.x-camera,548);for(let i=0;i<=24;i++)ctx.lineTo(h.x-camera+h.w*i/24,548-Math.sin(i/24*Math.PI)*h.h*(h.gone?Math.max(.1,1-h.age):1));ctx.lineTo(h.x+h.w-camera,548);ctx.closePath();ctx.clip();ctx.fillStyle='#dcb177';ctx.fill();biomeSprite('props',f,h.x-camera,548-h.h,h.w,h.h+4);ctx.restore();
 }
 for(const t of townTires)if(!t.spent){ctx.save();ctx.translate(t.x-camera,518);ctx.rotate(t.angle);biomeSprite('props',12+Math.floor(Math.abs(t.angle))%4,-30,-30,60,60);ctx.restore();}
 if(biomeIndex===4)for(const gap of gaps){biomeSprite('props',8+Math.floor(biomeClock*6)%4,gap.x-camera,557,gap.w,90);}
 // Small bounded ambient particles, computed without accumulating entities.
 if(biomeIndex===3||biomeIndex===4){ctx.save();for(let i=0;i<16;i++){const x=(i*113+camera*.15)%W,y=500-(biomeClock*(biomeIndex===4?35:12)+i*59)%440;ctx.fillStyle=biomeIndex===4?'#ffb23b88':'#72f5ed66';ctx.fillRect(x,y,3,3);}ctx.restore();}
}
function selectBiome(index){biomeIndex=index;areaIndex=0;areaBank={coins:0,kills:0,time:0};document.querySelectorAll('[data-biome]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.biome===index)));}
document.querySelectorAll('[data-biome]').forEach(button=>button.addEventListener('click',()=>{if(['ready','clear','dead','areaClear'].includes(state)){selectBiome(+button.dataset.biome);state='ready';document.getElementById('next-biome').hidden=true;document.getElementById('start').textContent='START RUN →';document.getElementById('modal-title').textContent=BIOMES[biomeIndex].name+'へ、出発。';document.getElementById('modal-copy').textContent='Area 1〜4 / '+BIOMES[biomeIndex].sub[0];}}));

document.getElementById('next-biome').addEventListener('click',()=>{if(state!=='clear'||biomeIndex>=BIOMES.length-1)return;selectBiome(biomeIndex+1);state='ready';reset();resume();});

function addActionTerraces(){
 const limit=currentArea().boss?CONFIG.worldWidth-2100:CONFIG.worldWidth-700;
 let added=0;
 for(let x=950;x+1080<limit;x+=1350){
  if(gaps.some(g=>x<g.x+g.w+100&&x+1080>g.x-100))continue;
  if(platforms.some(p=>p.solid&&x<p.x+p.w&&x+1080>p.x))continue;
  if(platforms.some(p=>p.y<160&&x<p.x+p.w&&x+1080>p.x))continue;
  // Remove short ledges that visually cut through this new broad route.
  platforms=platforms.filter(p=>p.motion||p.solid||p.x+p.w<x||p.x>x+1080);
  platforms.push({x,y:448,w:220,h:100,solid:true,actionRoute:true},{x:x+290,y:348,w:410,h:40,actionRoute:true},{x:x+775,y:248,w:300,h:36,actionRoute:true,motion:{axis:'y',range:22,period:6},originX:x+775,originY:248,motionAge:0});
  addCoinLine(x+325,310,7,48);addCoinLine(x+805,203,5,48);added++;
 }
 // Grass rope courses have little solid ground: a safe optional lookout at the entrance.
 if(!added){const x=300;platforms.push({x,y:448,w:210,h:100,solid:true,actionRoute:true},{x:560,y:348,w:350,h:35,actionRoute:true});addCoinLine(595,305,6,48);}
}
// Preserve illustrated end caps and extend only the inner rock/wood section into one continuous island.
function drawIslandStrip(f,x,y,w,h){
 const cap=Math.min(30,w/4),srcCap=f.w*.2;ctx.save();ctx.imageSmoothingEnabled=false;
 ctx.drawImage(f.img,0,0,srcCap,f.h,x,y,cap,h);
 ctx.drawImage(f.img,f.w-srcCap,0,srcCap,f.h,x+w-cap,y,cap,h);
 const middle=f.w-srcCap*2;
 ctx.drawImage(f.img,srcCap,0,middle,f.h,x+cap,y,w-cap*2,h);
 ctx.restore();
}
function stitchPlatforms(){
 // Join only tiny unintended gaps on a shared static ledge, never moving routes or chasms.
 const list=platforms.filter(p=>!p.solid&&!p.motion&&!p.geyser).sort((a,b)=>a.x-b.x);
 for(let i=0;i<list.length-1;i++){const a=list[i],b=list[i+1],gap=b.x-(a.x+a.w);if(Math.abs(a.y-b.y)<2&&gap>=0&&gap<=35&&!gaps.some(g=>a.x+a.w<g.x+g.w&&b.x>g.x)){a.w=b.x+b.w-a.x;platforms=platforms.filter(p=>p!==b);list.splice(i+1,1);i--;}}
}
function drawConnectedTerrace(p){
 const group=[p];let changed=true;
 while(changed){changed=false;for(const q of platforms){if(!q.solid||group.includes(q))continue;if(group.some(r=>q.x<=r.x+r.w+.5&&q.x+q.w>=r.x-.5&&q.y<=r.y+r.h&&q.y+q.h>=r.y)){group.push(q);changed=true;}}}
 // One draw for the entire joined staircase eliminates internal rectangular borders.
 const first=group.reduce((a,b)=>platforms.indexOf(a)<platforms.indexOf(b)?a:b);if(first!==p)return;
 const left=Math.min(...group.map(q=>q.x)),right=Math.max(...group.map(q=>q.x+q.w)),top=Math.min(...group.map(q=>q.y)),bottom=Math.max(...group.map(q=>q.y+q.h));
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.beginPath();for(const q of group)ctx.rect(q.x-camera,q.y-2,q.w,q.h+2);ctx.clip();ctx.fillStyle=biomeIndex?BIOMES[biomeIndex].color:'#76502e';ctx.fillRect(left-camera,top,right-left,bottom-top);
 for(let x=Math.floor(left/320)*320;x<right;x+=320){if(!biomeIndex){for(let y=Math.floor(top/80)*80;y<bottom;y+=80)ctx.drawImage(grassArt.ribbon,32,494,1472,160,x-camera,y,320,80);}else if(biomeIndex===2)drawTownStone(x-camera,top,321,Math.max(120,bottom-top),x/320);else{const f=biomeArt[BIOMES[biomeIndex].id].terrain[0];ctx.drawImage(f.img,8,Math.floor(f.h*.35),f.w-16,f.h*.65,x-camera,top,321,Math.max(120,bottom-top));}}
 for(const q of group){let spans=[[q.x,q.x+q.w]];for(const r of group){if(r===q||r.y>=q.y||r.y+r.h<q.y)continue;spans=spans.flatMap(([l,h])=>r.x>=h||r.x+r.w<=l?[[l,h]]:[[l,Math.max(l,r.x)],[Math.min(h,r.x+r.w),h]].filter(([a,b])=>b>a));}
  for(const [l,r] of spans){if(!biomeIndex)ctx.drawImage(grassArt.ribbon,32,157,1472,38,l-camera,q.y-2,r-l,19);else{ctx.fillStyle=['','#f3cf85','#d9c28b','#70e5ed','#ed9660'][biomeIndex];ctx.fillRect(l-camera,q.y-2,r-l,5);ctx.fillStyle='#201b2c55';ctx.fillRect(l-camera,q.y+8,r-l,3);}}
 }
 ctx.restore();
}
