'use strict';
const WORLD=Object.freeze({heal:8,crateHP:12,collapseDelay:.5,collapseRestore:4,trampolineSpeed:1050});
let gaps=[],bridges=[],ramps=[],crumbles=[],trampolines=[],arenas=[],crates=[],dorayaki=[],worldEffects=[],checkpoint={x:140,y:548};
function resetWorld(){
 gaps=[{x:3600,w:540},{x:7600,w:540}];bridges=[{x:3580,w:580,y:548}];
 ramps=[{x:5000,w:400,y:548,endY:420}];
 crumbles=Array.from({length:6},(_,i)=>({x:7600+i*90,y:532,w:90,h:16,type:'crumble',timer:-1,gone:false,restore:0}));
 trampolines=[{x:6500,y:548,w:100,pulse:0},{x:14500,y:548,w:100,pulse:0}];
 arenas=[9500,17100].map((x,i)=>({id:i,x,right:x+1050,state:'idle',age:0,wave:0,spawned:0,waves:3,perWave:16,clock:0}));
 // Clear deliberate feature zones so generated ledges cannot hide a gap or arena.
 const zones=[[3500,4300],[4950,6000],[6400,7100],[7500,8250],...arenas.map(a=>[a.x-100,a.right+100])];
 platforms=platforms.filter(p=>!zones.some(([l,r])=>p.x+p.w>l&&p.x<r));
 platforms.push({x:5400,y:420,w:100,h:128,solid:true,type:'stair'});
 for(let i=0;i<5;i++)platforms.push({x:5500+i*80,y:444+i*24,w:80,h:104-i*24,solid:true,type:'stair'});
 platforms.push({x:6740,y:300,w:220,h:25},{x:14720,y:300,w:240,h:25});
 for(const x of [6780,6820,6860,6900,14760,14800,14840,14880,14920])coins.push({x,y:260,taken:false});
 // Move existing ground enemies out of the canyon/terrain demonstrations.
 for(const e of enemies)if(zones.slice(0,4).some(([l,r])=>e.x>l&&e.x<r)){const zone=zones.find(([l,r])=>e.x>l&&e.x<r);e.x=zone[1]+60+(e.phase%3)*55;e.home=e.x;e.range=45;}
 crates=[650,2800,4450,6100,8500,9350,10900,13900,16600,18600,20700].map(x=>({type:'crate',x,y:CONFIG.groundY,w:48,h:48,hp:WORLD.crateHP,maxHP:WORLD.crateHP,death:-1,flash:0}));
 for(const a of arenas)for(const offset of [350,700])crates.push({type:'crate',x:a.x+offset,y:CONFIG.groundY,w:48,h:48,hp:WORLD.crateHP,maxHP:WORLD.crateHP,death:-1,flash:0,arenaId:a.id});
 dorayaki=[];worldEffects=[];checkpoint={x:140,y:CONFIG.groundY};
}
function combatTargets(){return [...enemies,...crates.filter(c=>c.death<0)];}
function damageCrate(c,damage){if(c.death>=0)return;c.hp=Math.max(0,c.hp-damage);c.flash=.12;if(c.hp===0){c.death=0;burst(c.x,c.y-24,16,'#cf9b58');dorayaki.push({x:c.x,y:c.y-50,baseY:c.y-20,vy:-160,age:0});}}
function groundAt(x){return gaps.some(g=>x>g.x&&x<g.x+g.w)?Infinity:CONFIG.groundY;}
function bridgeY(b,x){return b.y+20*Math.sin(clamp((x-b.x)/b.w,0,1)*Math.PI);}
function stageSurfaces(){return [...platforms,...crumbles.filter(c=>!c.gone)];}
function arenaForPlayer(){return arenas.find(a=>a.state==='closing'||a.state==='fighting'||a.state==='opening');}
function arenaGateBoxes(){return arenas.filter(a=>!['idle','cleared'].includes(a.state)).flatMap(a=>[a.x+25,a.right-25].map(x=>({x:x-52,y:88,w:104,h:460})));}
function resolveStageSides(p,oldX,oldY,wasGrounded){
 const half=CONFIG.playerColliderWidth/2;
 for(const platform of platforms){if(!platform.solid||oldY<=platform.y+1||p.y-CONFIG.playerColliderHeight>=platform.y+platform.h)continue;
  if(p.x+half>platform.x&&p.x-half<platform.x+platform.w){
   if(platform.type==='stair'&&wasGrounded&&oldY-platform.y<=26){p.y=platform.y;oldY=platform.y;continue;}
   if(oldX+half<=platform.x)p.x=platform.x-half;else if(oldX-half>=platform.x+platform.w)p.x=platform.x+platform.w+half;
  }
 }
 if(bossLocked())p.x=clamp(p.x,bossRoom.x+96,bossRoom.right-96);
 const arena=arenaForPlayer();if(arena)p.x=clamp(p.x,arena.x+96,arena.right-96);
 return oldY;
}
function stageLandingHeight(p,oldY,wasGrounded){
 const half=CONFIG.playerColliderWidth/2;let landing=groundAt(p.x);
 for(const q of stageSurfaces())if(p.x+half>q.x&&p.x-half<q.x+q.w&&p.vy>=0&&((oldY<=q.y+.5&&p.y>=q.y)||((q.type==='stair'||q.type==='crumble')&&wasGrounded&&Math.abs(q.y-oldY)<=26)))landing=Math.min(landing,q.y);
 for(const r of ramps){if(p.x<r.x||p.x>r.x+r.w)continue;const y=r.y+(r.endY-r.y)*(p.x-r.x)/r.w;if(p.vy>=0&&((oldY<=y+8&&p.y>=y)||(wasGrounded&&Math.abs(oldY-y)<12)))landing=Math.min(landing,y);}
 for(const b of bridges){if(p.x<b.x||p.x>b.x+b.w)continue;const y=bridgeY(b,p.x);if(p.vy>=0&&((oldY<=y+2&&p.y>=y)||(wasGrounded&&Math.abs(oldY-y)<6)))landing=Math.min(landing,y);}
 const roof=summonRoofY(p.x);if(p.vy>=0&&((oldY<=roof+1&&p.y>=roof)||(wasGrounded&&Math.abs(oldY-roof)<=26)))landing=Math.min(landing,roof);
 return landing;
}
function onStageLanding(){
 const p=player;
 for(const c of crumbles)if(!c.gone&&p.x>c.x-12&&p.x<c.x+c.w+12&&Math.abs(p.y-c.y)<1&&c.timer<0)c.timer=0;
 for(const t of trampolines)if(p.x>t.x&&p.x<t.x+t.w&&Math.abs(p.y-t.y)<1){p.vy=-WORLD.trampolineSpeed;p.grounded=false;p.coyote=0;p.jumpsUsed=0;p.jumpAge=0;t.pulse=.35;burst(p.x,p.y-5,12,'#8ff5e2');}
}
function landingEffect(x,y){worldEffects.push({kind:'impact',x,y,age:0,duration:.42});burst(x,y-3,24,'#bb85ff');}
function respawnFromFall(){
 const p=player;p.hp=Math.max(1,Math.ceil(p.hp/2));p.x=checkpoint.x;p.y=checkpoint.y;p.vx=p.vy=p.knock=0;p.grounded=true;p.jumpsUsed=0;p.inv=2;p.red=0;
 cancelNyoro();miraAction=null;miraShots=[];miraEffects=[];giantThunder=null;groundBolts=[];tetsuAction=null;comboWindow=0;thunderBullet=null;skillState.charging=false;skillState.charge=0;if(pink){pink.x=p.x-p.dir*65;pink.y=p.y;pink.vy=0;pink.assist=0;pink.attack=null;pink.magic=null;pink.stun=0;pink.knock=0;pink.hurtGrace=0;}clearInput();dirtBalls=[];camera=clamp(p.x-W*.35,0,CONFIG.worldWidth-W);
 for(const c of crumbles){c.gone=false;c.timer=-1;c.restore=0;}
 worldEffects.push({kind:'respawn',x:p.x,y:p.y-35,age:0,duration:.65});hintTimer=2;$('hint').textContent='落下！ HPが半分になって安全地点へ復帰';
}
function spawnArenaEnemy(a,side,index){
 const type=index%4===3?'chase':'miira',c=CONFIG.enemies[type],x=side===0?a.x+220+(index*137)%610:side<0?a.x+120:a.right-120;
 const e={type,x,y:CONFIG.groundY,home:(a.x+a.right)/2,dir:-side,hp:c.hp,maxHP:c.hp,w:46,h:type==='miira'?MIIRA.height:46,flash:0,knock:0,death:-1,range:400,phase:a.spawned+index,arenaId:a.id,attackCooldown:.9+(index%3)*.25,attackAge:-1};if(side===0){e.y=-60-(index%3)*65;e.dropping={vy:0};e.dir=Math.sign(player.x-x)||1;}enemies.push(e);burst(x,e.y-15,12,'#cbb693');
}
function updateArenas(dt){
 for(const a of arenas){
  if(a.state==='idle'&&player.x>a.x+150&&player.x<a.right-100){a.state='closing';a.age=0;checkpoint={x:a.x+200,y:CONFIG.groundY};for(const e of enemies)if(e.death<0&&e.x>a.x&&e.x<a.right){e.arenaId=a.id;e.home=(a.x+a.right)/2;e.range=400;}hintTimer=2;$('hint').textContent='包囲された！ 敵の増援が来る';}
  if(a.state==='idle'||a.state==='cleared')continue;a.age+=dt;
  if(a.state==='closing'&&a.age>=.65){a.state='fighting';a.age=0;burst(a.x+25,548,25,'#aaa590');burst(a.right-25,548,25,'#aaa590');}
  if(a.state==='fighting'){
   a.clock-=dt;const alive=enemies.some(e=>e.arenaId===a.id&&e.death<0);
   if(a.spawned<(a.wave+1)*a.perWave&&a.clock<=0){for(const side of [-1,1,0]){if(a.spawned>=(a.wave+1)*a.perWave)break;spawnArenaEnemy(a,side,a.spawned);a.spawned++;}a.clock=.22;}
   else if(a.spawned===(a.wave+1)*a.perWave&&!alive){if(a.wave+1<a.waves){a.wave++;a.clock=1.0;}else{a.state='opening';a.age=0;hintTimer=2;$('hint').textContent='全滅達成！ 道が開いた →';}}
  }
  if(a.state==='opening'&&a.age>=.7)a.state='cleared';
 }
 // Both living and launched enemies remain reachable inside their arena.
 for(const e of enemies){
  if(e.arenaId!==undefined){const a=arenas.find(a=>a.id===e.arenaId);if(!a||a.state==='cleared')continue;e.x=clamp(e.x,a.x+112,a.right-112);e.home=clamp(e.home,a.x+100,a.right-100);if(e.launch)e.launch.floor=CONFIG.groundY;}
  else for(const a of arenas){if(['idle','cleared'].includes(a.state))continue;if(e.x>a.x-65&&e.x<a.x+65){e.x=a.x-65;e.dir=-1;}if(e.x>a.right-65&&e.x<a.right+65){e.x=a.right+65;e.dir=1;}}
 }
}
function updateWorld(dt){
 updateArenas(dt);
 for(const c of crumbles){if(c.timer>=0&&!c.gone){c.timer+=dt;if(c.timer>=WORLD.collapseDelay){c.gone=true;c.restore=WORLD.collapseRestore;burst(c.x+c.w/2,c.y,8,'#bba376');}}else if(c.gone){c.restore-=dt;if(c.restore<=0){c.gone=false;c.timer=-1;}}}
 for(const t of trampolines)t.pulse=Math.max(0,t.pulse-dt);
 for(const c of crates)c.flash=Math.max(0,c.flash-dt);
 for(const d of dorayaki){d.age+=dt;d.vy+=550*dt;d.y=Math.min(d.baseY,d.y+d.vy*dt);if(d.y===d.baseY)d.vy=0;if(player.hp<CONFIG.maxHP&&Math.abs(player.x-d.x)<35&&d.y>player.y-CONFIG.playerColliderHeight-10&&d.y<player.y+10){const healed=Math.min(WORLD.heal,CONFIG.maxHP-player.hp);player.hp+=healed;d.taken=true;worldEffects.push({kind:'heal',x:d.x,y:d.y,amount:healed,age:0,duration:.8});burst(d.x,d.y,10,'#9ced86');}}
 dorayaki=dorayaki.filter(d=>!d.taken);for(const f of worldEffects)f.age+=dt;worldEffects=worldEffects.filter(f=>f.age<f.duration);
 if(player.y>H+180){respawnFromFall();return;}
 if(player.grounded&&Math.abs(player.y-CONFIG.groundY)<.5&&!arenaForPlayer()&&!bossLocked()&&!gaps.some(g=>player.x>g.x-100&&player.x<g.x+g.w+100)&&!trampolines.some(t=>Math.abs(player.x-t.x)<140))checkpoint={x:player.x,y:player.y};
}
function drawWorld(){
 for(const g of gaps){const x=g.x-camera;rounded(x,548,g.w,172,0,'#182d38');ctx.fillStyle='#0c1c2c';ctx.fillRect(x+12,575,g.w-24,145);text('↓',x+g.w/2,675,28,'#567285');}
 for(const r of ramps){const x=r.x-camera;ctx.fillStyle='#776443';ctx.beginPath();ctx.moveTo(x,r.y);ctx.lineTo(x+r.w,r.endY);ctx.lineTo(x+r.w,548);ctx.closePath();ctx.fill();ctx.strokeStyle='#b1d46a';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x,r.y);ctx.lineTo(x+r.w,r.endY);ctx.stroke();}
 for(const b of bridges){const x=b.x-camera;ctx.strokeStyle='#bba775';ctx.lineWidth=4;for(const offset of [-55,-35]){ctx.beginPath();for(let i=0;i<=24;i++){const px=b.x+b.w*i/24,y=bridgeY(b,px)+offset;if(!i)ctx.moveTo(px-camera,y);else ctx.lineTo(px-camera,y);}ctx.stroke();}for(let i=0;i<24;i++){const px=b.x+i*b.w/24,y=bridgeY(b,px);rounded(px-camera,y,b.w/24-3,12,2,'#ae8350');if(i%2===0){ctx.beginPath();ctx.moveTo(px-camera,y-52);ctx.lineTo(px-camera,y);ctx.stroke();}}for(const px of [x,x+b.w])rounded(px-4,b.y-80,8,99,3,'#765738');}
 for(const c of crumbles){if(c.gone)continue;const shake=c.timer>=0?Math.sin(elapsed*65)*2:0;rounded(c.x-camera+shake,c.y,c.w-3,c.h,3,c.timer<0?'#b4a17d':'#e6aa62');ctx.strokeStyle='#5e5243';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(c.x-camera+25,c.y);ctx.lineTo(c.x-camera+42,c.y+8);ctx.lineTo(c.x-camera+36,c.y+16);ctx.stroke();}
 for(const t of trampolines){const x=t.x-camera,y=t.y;ctx.strokeStyle='#d9dbb3';ctx.lineWidth=4;for(let i=10;i<t.w;i+=20){ctx.beginPath();ctx.moveTo(x+i,y+17);ctx.lineTo(x+i+7,y+10);ctx.lineTo(x+i,y+4);ctx.stroke();}rounded(x,y-5+t.pulse*15,t.w,9,4,'#62e1bf');text('↑',x+t.w/2,y-22,28,'#aaffdd');}
 for(const c of crates){if(c.death>=0)continue;const x=c.x-camera;rounded(x-c.w/2,c.y-c.h,c.w,c.h,4,c.flash>0?'#fff2b3':'#bb8749');ctx.strokeStyle='#704a29';ctx.lineWidth=4;ctx.strokeRect(x-20,c.y-44,40,40);ctx.beginPath();ctx.moveTo(x-18,c.y-42);ctx.lineTo(x+18,c.y-6);ctx.moveTo(x+18,c.y-42);ctx.lineTo(x-18,c.y-6);ctx.stroke();text('焼',x,c.y-17,19,'#fff0bd');}
 for(const d of dorayaki){const x=d.x-camera,y=d.y+Math.sin(d.age*4)*3;ctx.fillStyle='#ffefac33';ctx.beginPath();ctx.arc(x,y,25,0,Math.PI*2);ctx.fill();for(const [offset,color] of [[5,'#bb7738'],[1,'#583126'],[-4,'#e9b660']]){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y+offset,17,7,0,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#ffdc89';ctx.beginPath();ctx.ellipse(x-4,y-6,6,2,0,0,Math.PI*2);ctx.fill();}
}
function drawArenaGates(){for(const a of arenas){if(a.state==='idle'||a.state==='cleared')continue;const offset=a.state==='closing'?-650*(1-clamp(a.age/.65,0,1))**2:a.state==='opening'?-650*clamp(a.age/.7,0,1):0;for(const worldX of [a.x+25,a.right-25]){const x=worldX-camera;for(let i=0;i<5;i++){const y=548-i*92+offset;ctx.fillStyle=i%2?'#6e7479':'#8b8e87';ctx.strokeStyle='#424d55';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x-45,y);ctx.lineTo(x-52,y-53);ctx.lineTo(x-21,y-96);ctx.lineTo(x+27,y-89);ctx.lineTo(x+48,y-38);ctx.lineTo(x+37,y);ctx.closePath();ctx.fill();ctx.stroke();}}if(a.state==='fighting'){const left=a.waves*a.perWave-a.spawned+enemies.filter(e=>e.arenaId===a.id&&e.death<0).length;rounded(W/2-155,140,310,40,7,'#26333be8');text(`包囲戦 ${a.wave+1} / ${a.waves}  残り ${left}体`,W/2,166,20,'#ffdd86');}}}
function drawWorldEffects(){for(const f of worldEffects){const t=f.age/f.duration,x=f.x-camera;ctx.save();ctx.globalAlpha=1-t;if(f.kind==='impact'){ctx.strokeStyle='#d9a4ff';ctx.lineWidth=5*(1-t)+1;ctx.beginPath();ctx.ellipse(x,f.y-3,25+t*115,8+t*20,0,0,Math.PI*2);ctx.stroke();for(let i=0;i<7;i++){const a=Math.PI+i*Math.PI/6;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*20,f.y);ctx.lineTo(x+Math.cos(a)*(45+t*90),f.y+Math.sin(a)*(35+t*55));ctx.stroke();}}else if(f.kind==='heal')text(`HP +${f.amount}`,x,f.y-20-t*35,22,'#b9ff9c');else{ctx.strokeStyle='#a0eaff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,f.y,20+t*55,0,Math.PI*2);ctx.stroke();}ctx.restore();}}


