'use strict';
const BIOMES=[
 {id:'grass',name:'草原',route:'GREENWAY',color:'#705030',sub:['はじまりの草原','こもれびの高台','風わたる谷','古樹の奥地']},
 {id:'desert',name:'砂漠',route:'DUNE RUN',color:'#b67d44',sub:['風紋の入口','崩れる砂丘','白骨の回廊','灼熱の遺跡']},
 {id:'town',name:'田舎町',route:'OLD TOWN',color:'#6c6355',sub:['路地裏の朝','屋根の上の散歩','転がる商店街','駅前の決戦']},
 {id:'neon',name:'ネオン街',route:'NEON RISE',color:'#252a49',sub:['光る交差点','空中遊園地','上昇する街','夜空のホール']},
 {id:'magma',name:'マグマ',route:'LAVA FORGE',color:'#482e30',sub:['赤熱の入口','吹き上がる岩床','溶岩の回廊','火竜の炉心']}
];
let biomeIndex=0,sandHills=[],townTires=[],biomeClock=0;
const biomeArt={},biomeBackgrounds={};
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
async function loadBiomes(){await Promise.all(BIOMES.slice(1).map(async(b,i)=>{
 const [terrain,props,bg]=await Promise.all([loadBiomeAtlas(`stage/expansion/${b.id}_terrain.png`),loadBiomeAtlas(`stage/expansion/${b.id}_props.png`),loadImage(`stage/00${i+2}.png`)]);biomeArt[b.id]={terrain,props};biomeBackgrounds[b.id]=bg;
}));}
function biomeSprite(group,frame,x,y,w,h){const f=biomeArt[BIOMES[biomeIndex].id]?.[group]?.[frame];if(!f)return;ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(f.img,x,y,w,h);ctx.restore();}
function addBiomeProp(row,x){const c={type:'crate',propKind:'biome',row,x,y:548,w:row===1?52:62,h:row===2?115:90,hp:row===2?60:36,maxHP:row===2?60:36,death:-1,flash:0,brokenAt:0};props.push(c);crates.push(c);return c;}
function buildBiomeArea(){
 sandHills=[];townTires=[];biomeClock=0;
 const b=biomeIndex,a=areaIndex,last=currentArea().boss?CONFIG.worldWidth-2000:CONFIG.worldWidth-650;
 // Each Area uses a different offset, spacing and height profile, with a safe opening.
 for(let x=1050,n=0;x<last;x+=620,n++){
  if(b===1){sandHills.push({x:x-120,w:300,h:60+(n+a)%3*12,timer:-1,gone:false,age:0,spawned:false});if(n%2===0)platforms.push({x:x+190,y:410-(a%2)*25,w:190,h:30});}
  if(b===2){platforms.push({x:x-30,y:435-(n+a)%3*34,w:220,h:30});if(n%2===0)townTires.push({x:x+380,y:548,vx:-185-a*12,active:false,spent:false,angle:0});}
  if(b===3){for(let j=0;j<3;j++)platforms.push({x:x-150+j*175,y:460-j*80-(a%2)*20,w:150,h:28,motion:j===1?{axis:'y',range:45,period:4.5}:j===2?{axis:'x',range:45,period:5}:null});addCoinLine(x+235,245-(a%2)*20,3,35);}
  if(b===4){const gapX=x-80,width=300+(a%2)*40;gaps.push({x:gapX,w:width,lava:true});platforms.push({x:gapX+65,y:488,w:170,h:28,geyser:true,motion:{axis:'y',range:88,period:4.8+(n%2)}});addCoinLine(gapX+85,355,3,38);}
 }
 for(let x=620,n=0;x<last;x+=680,n++){if(gaps.some(g=>x>g.x-100&&x<g.x+g.w+100))x+=220;if(!sandHills.some(h=>x>h.x-50&&x<h.x+h.w+50))addBiomeProp(b===4?n%2:n%3,x);}
 if(b===1){addBiomeProp(0,590);addBiomeProp(1,790);addBiomeProp(2,last-190);}
 if(b===3){addStairs(650,4);addStairs(3200,5);}
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
function drawBiomeGround(){const b=BIOMES[biomeIndex];ctx.fillStyle=b.color;ctx.fillRect(0,548,W,H+Math.abs(cameraY));
 const size=400;ctx.save();ctx.imageSmoothingEnabled=false;for(let x=Math.floor(camera/size)*size;x<camera+W;x+=size){const f=biomeArt[b.id].terrain[((x/size)%4+4)%4];ctx.drawImage(f.img,8,0,f.w-16,f.h,x-camera,546,size+1,190);}ctx.restore();
}
function drawBiomePlatform(p){if(p.x+p.w<camera||p.x>camera+W)return;
 if(p.solid){const f=biomeArt[BIOMES[biomeIndex].id].terrain[0];ctx.save();ctx.imageSmoothingEnabled=false;ctx.beginPath();ctx.rect(p.x-camera,p.y,p.w,p.h);ctx.clip();ctx.fillStyle=BIOMES[biomeIndex].color;ctx.fill();ctx.drawImage(f.img,8,0,f.w-16,f.h,p.x-camera,p.y,p.w,Math.max(100,p.h));ctx.restore();return;}
 const index=4+(typeof p.variant==='number'?p.variant:0);const topOffset=biomeIndex===2?[0,0,.30,.28][index-4]:biomeIndex===3?[0,.05,.22,.28][index-4]:0;biomeSprite('terrain',index,p.x-camera,p.y-2-topOffset*65,p.w,65);
 if(p.geyser){const f=12+Math.floor(biomeClock*7)%4;biomeSprite('props',f,p.x-camera+p.w*.3,p.y+20,p.w*.4,Math.max(30,565-p.y));}
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
