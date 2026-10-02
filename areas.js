'use strict';
const AREAS=Object.freeze([
 {name:'草原 Area 1',subtitle:'はじまりの草原',width:5600,boss:false},
 {name:'草原 Area 2',subtitle:'こもれびの高台',width:6400,boss:false},
 {name:'草原 Area 3',subtitle:'風わたる谷',width:6500,boss:false},
 {name:'草原 Area 4',subtitle:'古樹の奥地',width:6800,boss:true}
]);
const GRASS={rockHP:36,treeHP:48,rollingDamage:8,rollingSpeed:205,ropeLength:560,ropeReach:78};
let areaIndex=0,cameraY=0,areaBank={coins:0,kills:0,time:0},props=[],ropes=[],ropeRide=null,ropeRegrab=0;
const grassArt={props:[],terrain:[],ribbon:null};
function currentArea(){return biomeIndex===0?AREAS[areaIndex]:{...AREAS[areaIndex],name:BIOMES[biomeIndex].name+' Area '+(areaIndex+1),subtitle:BIOMES[biomeIndex].sub[areaIndex],width:5200+areaIndex*400};}
function updateAreaLabels(){document.querySelector('.area strong').textContent=currentArea().name;document.querySelector('.route>span').textContent=`${BIOMES[biomeIndex].route} / 0${areaIndex+1}`;}
async function loadGrassAtlas(path,rows){
 const img=await loadImage(path),c=document.createElement('canvas');c.width=img.width;c.height=img.height;
 const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const pixels=g.getImageData(0,0,c.width,c.height).data;
 return rows.slice(0,-1).flatMap((start,row)=>Array.from({length:4},(_,col)=>{
  const left=Math.floor(col*c.width/4),right=Math.floor((col+1)*c.width/4),top=Math.floor(start*c.height),bottom=Math.floor(rows[row+1]*c.height);
  let l=right,r=left,t=bottom,b=top;
  for(let y=top;y<bottom;y++)for(let x=left;x<right;x++)if(pixels[(y*c.width+x)*4+3]>12){l=Math.min(l,x);r=Math.max(r,x+1);t=Math.min(t,y);b=Math.max(b,y+1);}
  if(r<=l||b<=t)throw Error(`Empty grassland frame ${row*4+col}`);
  return{img,x:l,y:t,w:r-l,h:b-t};
 }));
}
async function loadGrass(){[grassArt.props,grassArt.terrain,grassArt.ribbon]=await Promise.all([
 loadGrassAtlas('stage/grassland/props.png',[0,.259,.510,.767,1]),
 loadGrassAtlas('stage/grassland/terrain.png',[0,.35,.565,.94]),loadImage('stage/grassland/ribbons.png')]);}
function grassSprite(group,index,x,y,w,h){const f=grassArt[group][index];if(!f)return;ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(f.img,f.x,f.y,f.w,f.h,Math.round(x),Math.round(y),w,h);ctx.restore();}
function spawnGrassEnemy(type,x,y=CONFIG.groundY,range=100){const c=CONFIG.enemies[type];const e={type,x,y,home:x,dir:-1,hp:c.hp,maxHP:c.hp,w:type==='lime'?LIME.width:type==='tank'?62:46,h:type==='miira'?MIIRA.height:type==='lime'?LIME.height:type==='tank'?65:46,flash:0,knock:0,death:-1,range,phase:x%17};enemies.push(e);return e;}
function addGrassProp(kind,x){const destructible=kind==='rock'||kind==='tree',hp=kind==='rock'?GRASS.rockHP:GRASS.treeHP;
 const p={type:'crate',propKind:kind,x,y:548,w:kind==='tree'?64:76,h:kind==='tree'?150:92,hp,maxHP:hp,death:-1,flash:0,shake:0,active:false,spent:false,angle:0,vy:0};
 props.push(p);if(destructible)crates.push(p);return p;
}
function addCoinLine(x,y,n=5,spacing=44){for(let i=0;i<n;i++)coins.push({x:x+i*spacing,y,taken:false});}
function addStairs(x,count=12,y=548){for(let i=0;i<count;i++)platforms.push({x:x+i*58,y:y-(i+1)*24,w:58,h:(i+1)*24,solid:true,type:'stair'});}
function addSwing(gapX,width=820){width=Math.max(820,width);gaps.push({x:gapX,w:width});ropes.push({x:gapX+width/2,y:40,length:GRASS.ropeLength,angle:-.95,velocity:0,phase:0,gapX,gapWidth:width});addCoinLine(gapX+100,310,5,50);}
function buildGrassArea(){
 platforms=[];coins=[];enemies=[];gaps=[];bridges=[];ramps=[];crumbles=[];trampolines=[];arenas=[];crates=[];dorayaki=[];worldEffects=[];props=[];ropes=[];ropeRide=null;ropeRegrab=0;cameraY=0;
 checkpoint={x:140,y:548};sandHills=[];townTires=[];if(biomeIndex>0){buildBiomeArea();updateAreaLabels();return;}
 if(areaIndex===0){
  platforms.push({x:780,y:490,w:180,h:58,solid:true},{x:1100,y:416,w:240,h:28});addStairs(2350,8);platforms.push({x:2814,y:356,w:350,h:30});
  for(const x of [650,2060,3980])addGrassProp('rock',x);
  for(const x of [1580,3380,4590])addGrassProp('tree',x);

  addGrassProp('rolling',4290);
  for(const [type,x] of [['lime',1300],['patrol',1920],['lime',3200],['miira',4200],['chase',4880]])spawnGrassEnemy(type,x);
  addCoinLine(1130,378);addCoinLine(2840,316,7);addCoinLine(5030,506);
 }else if(areaIndex===1){
  addGrassProp('tree',740);addGrassProp('rock',1240);
  // A long visible ascent and an elevated route across the canyon.
  addStairs(1800,20);platforms.push({x:2960,y:68,w:380,h:36});gaps.push({x:2960,w:1380});
  platforms.push({x:3400,y:116,w:260,h:32},{x:3740,y:212,w:260,h:32},{x:4070,y:332,w:270,h:32});
  addCoinLine(2990,30,7);addCoinLine(3440,76);addCoinLine(3780,172);addCoinLine(4110,292);
  addGrassProp('tree',4660); // Open ground for Sharty's midboss encounter.
  for(const [type,x] of [['lime',920],['miira',1470],['lime',4530],['chase',4900]])spawnGrassEnemy(type,x);
 }else if(areaIndex===2){
  addSwing(1460);addSwing(3260,460);addSwing(4900,440);
  for(const x of [680,2660,4320,5900])addGrassProp('tree',x);for(const x of [1030,4050])addGrassProp('rock',x);
  addGrassProp('rolling',2760);
  for(const [type,x] of [['lime',880],['miira',2360],['lime',3960],['chase',5760]])spawnGrassEnemy(type,x,548,65);
  for(const r of ropes){addCoinLine(r.gapX-230,415,3);}
 }else{
  addGrassProp('tree',650);addGrassProp('rock',1170);addGrassProp('rolling',1660);
  addStairs(1900,10);platforms.push({x:2480,y:308,w:240,h:30});addCoinLine(2510,268);
  addSwing(3030);addGrassProp('tree',3860);addGrassProp('rock',4220);
  for(const [type,x] of [['lime',820],['chase',1350],['miira',2770],['tank',3980],['miira',4660]])spawnGrassEnemy(type,x,548,60);
 }
 // Gentle moving platforms are introduced over safe ground before the high route.
 if(areaIndex===0){platforms.push({x:3550,y:415,w:190,h:28,variant:'wood',motion:{axis:'y',range:60,period:5}});}
 if(areaIndex===1){platforms.push({x:1450,y:405,w:190,h:28,variant:'crystal',motion:{axis:'y',range:75,period:6}});const ferry=platforms.find(p=>p.x===3400);ferry.motion={axis:'x',range:45,period:5};ferry.variant='wood';}
 if(areaIndex===3)platforms.push({x:800,y:370,w:180,h:28,variant:'crystal',motion:{axis:'x',range:110,period:6}});
 for(const [i,p] of platforms.entries()){p.variant??=['moss','wood','crystal'][i%3];if(p.motion){p.originX=p.x;p.originY=p.y;p.motionAge=0;}}
 // Keep enlarged chasms free of ground props and grounded enemies.
 props=props.filter(p=>!gaps.some(g=>p.x>g.x-50&&p.x<g.x+g.w+50));crates=crates.filter(c=>props.includes(c));
 for(const e of enemies){const gap=gaps.find(g=>e.x>g.x-60&&e.x<g.x+g.w+60);if(gap){e.x=gap.x+gap.w+150;e.home=e.x;e.range=65;}}
 for(let x=260;x<currentArea().width-700;x+=600)if(!gaps.some(g=>x>=g.x-100&&x<=g.x+g.w+100)&&!platforms.some(p=>x>=p.x-40&&x<=p.x+p.w+40))addCoinLine(x,505,3);
 hintTimer=5;$('hint').hidden=false;$('hint').textContent=`${currentArea().name} — ${currentArea().subtitle}`;
 updateAreaLabels();
}
function updateMovingPlatforms(dt){
 for(const p of platforms){if(!p.motion)continue;const ox=p.x,oy=p.y;
  const riders=[player,pink].filter(a=>a&&a.grounded&&Math.abs(a.y-oy)<1&&a.x>ox-10&&a.x<ox+p.w+10);
  p.motionAge+=dt;const offset=Math.sin(p.motionAge*Math.PI*2/p.motion.period)*p.motion.range;p.x=p.originX+(p.motion.axis==='x'?offset:0);p.y=p.originY+(p.motion.axis==='y'?offset:0);
  for(const a of riders){a.x+=p.x-ox;a.y+=p.y-oy;}
 }
}
function damageGrassProp(p,damage){if(p.propKind==='biome'){damageBiomeProp(p,damage);return;}if(p.death>=0)return;p.hp=Math.max(0,p.hp-damage);p.flash=.12;p.shake=.3;
 if(p.hp>0)return;p.death=0;p.brokenAt=elapsed;burst(p.x,p.y-40,18,p.propKind==='tree'?'#99c546':'#bbb7bb');
 if(p.propKind==='tree'){
  if(Math.random()<.5){const e=spawnGrassEnemy('lime',p.x,390,130);e.dropping={vy:-230};e.fromTree=true;}
  else dorayaki.push({x:p.x,y:p.y-125,baseY:p.y-20,vy:-290,age:0});
 }
}
function grassSolidBoxes(){return props.filter(p=>p.death<0&&(p.propKind==='rock'||p.propKind==='tree'||p.propKind==='biome')).map(p=>({x:p.x-p.w/2,y:p.y-p.h,w:p.w,h:p.h,solid:true,prop:p}));}
function ropeEnd(r){return{x:r.x+Math.sin(r.angle)*r.length,y:r.y+Math.cos(r.angle)*r.length};}
function updateRopePlayer(dt,input){
 ropeRegrab=Math.max(0,ropeRegrab-dt);
 for(const r of ropes)if(r!==ropeRide){r.phase+=dt;r.angle=.95*Math.sin(r.phase*.55-Math.PI/2);}
 if(!ropeRide&&ropeRegrab===0&&!player.grounded&&!bossIntro()){
  ropeRide=ropes.find(r=>{const end=ropeEnd(r);return Math.hypot(player.x-end.x,player.y-46-end.y)<GRASS.ropeReach;})||null;
  if(ropeRide){if(tetsuAction&&['air','combo'].includes(tetsuAction.type)){tetsuAction=null;comboWindow=0;}ropeRide.velocity=(Math.sign(input)||player.dir)*1.1;player.knock=0;nyoroGlide=false;hintTimer=3;$('hint').hidden=false;$('hint').textContent='左右でスイング → JUMPで飛び離す';}
 }
 if(!ropeRide)return false;const r=ropeRide;
 if(jumpRequest>0){const end=ropeEnd(r),direction=Math.sign(r.velocity)||player.dir;player.x=end.x;player.y=end.y+46;player.vy=-590;player.knock=direction*220;player.dir=direction;player.grounded=false;player.jumpsUsed=1;player.jumpAge=0;player.coyote=0;jumpRequest=0;ropeRide=null;ropeRegrab=.65;return false;}
 r.velocity+=(-2.7*Math.sin(r.angle)+input*3.7)*dt;r.velocity=clamp(r.velocity,-2.2,2.2);r.angle+=r.velocity*dt;
 if(Math.abs(r.angle)>1.08){r.angle=clamp(r.angle,-1.08,1.08);r.velocity*=-.3;}
 const end=ropeEnd(r);player.x=end.x;player.y=end.y+46;player.vx=Math.cos(r.angle)*r.length*r.velocity;player.vy=-Math.sin(r.angle)*r.length*r.velocity;player.grounded=false;player.coyote=0;player.jumpsUsed=1;return true;
}
function updateGrass(dt){
 for(const p of props){p.flash=Math.max(0,p.flash-dt);p.shake=Math.max(0,p.shake-dt);
  if(p.propKind==='rolling'&&!p.spent){
   if(!p.active&&player.x>p.x-780&&player.x<p.x+100){p.active=true;hintTimer=2;$('hint').hidden=false;$('hint').textContent='岩が来る！ ジャンプで飛び越えよう';}
   if(p.active){const oldX=p.x;p.x-=GRASS.rollingSpeed*dt;p.angle-=dt*4;p.vy+=CONFIG.gravity*dt;p.y+=p.vy*dt;if(p.y>=groundAt(p.x)){p.y=groundAt(p.x);p.vy=0;}
    if(segmentHitsBox(oldX,p.y-42,p.x,p.y-42,player.x-50,player.y-CONFIG.playerColliderHeight-35,player.x+50,player.y+35))damagePlayer({x:p.x},GRASS.rollingDamage);
    if(p.x<camera-250||p.y>1000)p.spent=true;
   }
  }

 }
 if(ropeRide&&player.y>H+180){ropeRide=null;ropeRegrab=.65;}
 cameraY+=(Math.min(ropeRide?200:0,player.y-405)-cameraY)*(1-Math.exp(-5*dt));if(bossIntro()||bossLocked())cameraY=0;
 const nearest=ropes.find(r=>Math.abs(player.x-r.gapX)<350);if(nearest&&!ropeRide&&hintTimer<=0){hintTimer=.2;$('hint').hidden=false;$('hint').textContent='ジャンプしてロープへ → つかんだら左右＋JUMP';}
}
function finishGrassArea(){if(shartyEncounter&&shartyEncounter.state!=='cleared')return;if(state!=='playing'||player.x<CONFIG.worldWidth-180||arenaForPlayer()||(currentArea().boss&&bossRoom?.state!=='cleared'))return;
 ropeRide=null;state=areaIndex===3?'clear':'areaClear';modal(`${currentArea().name} CLEAR!`,`COIN ${collected} / 撃破 ${kills}体`,areaIndex===3?'RETRY AREA 1':`NEXT → AREA ${areaIndex+2}`);
}
function startGrassArea(){if(state==='loading')return;if(state==='paused'){resume();return;}
 if(state==='areaClear'){areaBank={coins:collected,kills,time:elapsed};areaIndex++;}
 else if(state==='clear'){areaIndex=0;areaBank={coins:0,kills:0,time:0};}
 reset();resume();
}
function restoreGrassStats(){collected=areaBank.coins;kills=areaBank.kills;elapsed=areaBank.time;}
// Continuous world-aligned ribbons, clipped to the actual solid outline.
function soilRibbon(worldX,y,w,h,ledge=false){
 const img=grassArt.ribbon;if(!img)return;const x=worldX-camera;
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.beginPath();ctx.rect(x,y-3,w,h+3);ctx.clip();ctx.fillStyle='#76502e';ctx.fillRect(x,y,w,h);
 const span=736,left=Math.floor(worldX/span)*span;
 for(let px=left;px<worldX+w;px+=span){
  for(let py=Math.floor(y/80)*80;py<y+h;py+=80)ctx.drawImage(img,32,494,1472,160,px-camera,py,span,80);
  ctx.drawImage(img,32,ledge?763:157,1472,ledge?105:225,px-camera,y-3,span,ledge?Math.max(36,h+3):112.5);
 }
 ctx.restore();
}
function drawGrassGround(){if(biomeIndex>0){drawBiomeGround();return;}soilRibbon(camera,548,W,H+Math.abs(cameraY));}
// Render once on a coarse pixel grid: a grassy island with a tapered stone belly.
// The flat grass lip is the exact walking surface; roots below are decoration.
const islandArt=new Map();
function grassIsland(width,variant='moss'){
 const key=width+variant;if(islandArt.has(key))return islandArt.get(key);
 const c=document.createElement('canvas'),s=3;c.width=Math.ceil(width/s);c.height=30;
 const g=c.getContext('2d'),w=c.width;
 const poly=(points,color)=>{g.fillStyle=color;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();};
 poly([[0,2],[w,2],[w,9],[w-4,9],[w-4,14],[w-11,14],[w-11,18],[w-22,18],[w-22,21],[w*.54,21],[w*.54,24],[w*.3,24],[w*.3,20],[12,20],[12,16],[5,16],[5,11],[0,11]],'#293b39');
 poly([[2,6],[w-2,6],[w-2,10],[w-7,10],[w-7,14],[w-16,14],[w-16,18],[w*.54,18],[w*.54,21],[w*.32,21],[w*.32,18],[14,18],[14,14],[7,14],[7,10],[2,10]],'#64756b');
 poly([[3,7],[w*.37,7],[w*.3,12],[w*.35,18],[15,16],[8,12]],'#a6ac83');
 poly([[w*.4,7],[w-5,7],[w-10,12],[w*.63,15],[w*.54,19],[w*.44,17]],'#87967a');
 poly([[w*.35,9],[w*.4,9],[w*.47,16],[w*.44,20],[w*.41,15]],'#42564d');
 poly([[1,2],[w-1,2],[w-1,6],[w-7,6],[w-7,8],[w-12,8],[w-12,6],[w*.58,6],[w*.58,9],[w*.52,9],[w*.52,6],[9,6],[9,8],[3,8],[3,6],[1,6]],'#39743d');
 g.fillStyle='#78b942';g.fillRect(1,1,w-2,4);g.fillStyle='#c1e666';g.fillRect(2,1,w-4,1);
 for(let x=5;x<w-4;x+=13){g.fillStyle='#9ed34d';g.fillRect(x,0,3,2);g.fillStyle='#4f913e';g.fillRect(x+4,4,4,2);}
 for(const x of [Math.floor(w*.21),Math.floor(w*.78)]){g.fillStyle='#385e39';g.fillRect(x,16,1,10);g.fillRect(x-2,21,2,2);g.fillRect(x+1,24,2,2);g.fillStyle='#79a745';g.fillRect(x-3,20,2,2);g.fillRect(x+2,23,2,2);}
 if(variant==='wood'){g.fillStyle='#49372c';g.fillRect(1,7,w-2,7);g.fillStyle='#aa7946';g.fillRect(2,7,w-4,4);g.fillStyle='#e0b267';g.fillRect(3,7,w-6,1);for(let x=7;x<w-4;x+=14){g.fillStyle='#4a3629';g.fillRect(x,7,1,6);g.fillStyle='#d8d4a1';g.fillRect(x+3,9,1,1);}}
 if(variant==='crystal'){for(const x of [12,Math.floor(w*.52),w-14]){poly([[x-3,14],[x+3,14],[x+4,21],[x,28],[x-4,21]],'#294b67');poly([[x-2,15],[x+2,15],[x+2,21],[x,25]],'#68c9c8');g.fillStyle='#c4fbde';g.fillRect(x-1,16,1,5);}}
 islandArt.set(key,c);return c;
}
function drawGrassPlatform(p){if(biomeIndex>0){drawBiomePlatform(p);return;}if(p.x+p.w<camera||p.x>camera+W)return;if(p.solid){soilRibbon(p.x,p.y,p.w,p.h);return;}ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(grassIsland(p.w,p.variant),Math.round(p.x-camera),p.y-3,p.w,90);if(p.motion){ctx.fillStyle='#f8edb2';const x=Math.round(p.x-camera+p.w/2);ctx.fillRect(x-8,p.y+27,16,3);if(p.motion.axis==='y')ctx.fillRect(x-1,p.y+21,3,15);}ctx.restore();}
function drawSwingRope(r){
 const end=ropeEnd(r),segment=grassArt.terrain[9],handle=grassArt.terrain[10];
 grassSprite('terrain',8,r.x-camera-54,r.y-38,64,86);
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(r.x-camera,r.y);ctx.rotate(-r.angle);
 // One uninterrupted braid, overlapped into the knot. Crop only the handhold,
 // not the long, thinner rope already included in the original handhold frame.
 ctx.drawImage(segment.img,segment.x,segment.y+20,segment.w,segment.h-40,-5,0,10,r.length+5);
 const sy=handle.y+handle.h*.73,sh=handle.h*.27,hw=48,hh=sh/handle.w*hw;
 ctx.drawImage(handle.img,handle.x,sy,handle.w,sh,-hw/2,r.length-hh*.65,hw,hh);
 ctx.restore();text('JUMP',end.x-camera,end.y+75,14,'#fff5c5');
}function drawGrassProps(){if(biomeIndex>0){drawBiomeDecor();return;}
 for(const p of props){if(p.spent||p.x<camera-250||p.x>camera+W+250)continue;const kind=p.propKind,x=p.x-camera;
  // Contact shadow and grass overlap anchor the irregular sprite bottoms to the floor.
  if(Number.isFinite(groundAt(p.x))&&Math.abs(p.y-groundAt(p.x))<2){ctx.fillStyle='#20392166';ctx.fillRect(Math.round(x-(kind==='tree'?28:37)),p.y-1,kind==='tree'?56:74,5);ctx.fillRect(Math.round(x-22),p.y-3,44,8);}
  ctx.save();if(p.flash>0)ctx.filter='brightness(1.7)';
  if(kind==='rolling'){ctx.translate(x,p.y-38);ctx.rotate(p.angle);grassSprite('props',Math.floor(Math.abs(p.angle)*2)%4,-42,-42,84,84);}
  else if(kind==='rock'){const frame=p.death>=0?(elapsed-p.brokenAt<.18?6:7):p.hp<p.maxHP?5:4;const height=frame===7?43:95;grassSprite('props',frame,x-46,p.y-height+10,92,height);}
  else if(kind==='tree'){const frame=p.death>=0?11:8,f=grassArt.props[frame],scale=180/grassArt.props[8].h;ctx.translate(x+Math.sin(elapsed*35)*p.shake*4,p.y+10);if(p.death<0)ctx.transform(1,0,Math.sin(elapsed*.9+p.x)*.012,1,0,0);grassSprite('props',frame,-f.w*scale/2,-f.h*scale,f.w*scale,f.h*scale);}
  ctx.restore();
  if(kind!=='rolling'){for(const dx of [-24,-12,15,27]){ctx.fillStyle='#4c852f';ctx.fillRect(Math.round(x+dx),p.y+2,6,5);ctx.fillStyle='#8ab944';ctx.fillRect(Math.round(x+dx+2),p.y,3,4);}}
  if(p.death<0&&(kind==='rock'||kind==='tree')&&p.hp<p.maxHP){rounded(x-28,p.y-p.h-12,56,5,2,'#203331');rounded(x-27,p.y-p.h-11,54*p.hp/p.maxHP,3,1,'#f1bd70');}
 }
 for(const r of ropes)drawSwingRope(r);
}
