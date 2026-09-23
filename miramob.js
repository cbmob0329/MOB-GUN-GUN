'use strict';
const MIRA=Object.freeze({hp:1320,playerHeight:110,bossHeight:144,jumpForce:800,explosionRadius:330,normal:24,blade:18,core:16,explosion:140,shard:14,cooldowns:[7,13],bossNormal:6,bossBlade:5,bossCore:3,bossExplosion:12,bossShard:4});
const miraFrames={};
let adminUnlocked=false,miraAction=null,miraCooldowns=[0,0],miraShots=[],miraEffects=[],bossRoom=null;
async function loadMira(){await Promise.all(Array.from({length:43},async(_,i)=>{const n=i+1;miraFrames[n]=await trimFrame(`enemy/miramob/${n<=25?String(n).padStart(3,'0'):n}.png`);}));}
function resetMira(){miraAction=null;miraCooldowns=[0,0];miraShots=[];miraEffects=[];
 bossRoom={x:20150,right:21430,state:'idle',portalX:20070,age:0,spawnClock:5,spawned:0,boss:null,camera:20150};
 platforms=platforms.filter(p=>p.x+p.w<bossRoom.portalX-140);platforms.push({x:20430,y:410,w:175,h:24,bossPlatform:true},{x:20970,y:355,w:175,h:24,bossPlatform:true});
 let relocated=0;for(const e of enemies)if(e.x>=bossRoom.x-100){e.x=bossRoom.x-250-(relocated++%6)*95;e.home=e.x;e.range=40;}crates=crates.filter(e=>e.x<bossRoom.x-100);coins=coins.filter(c=>c.x<bossRoom.x-100);
 crates.push({type:'crate',x:20000,y:548,w:48,h:48,hp:12,maxHP:12,death:-1,flash:0});
}
function bossIntro(){return bossRoom&&['warping','closing'].includes(bossRoom.state);}
function dropBossDorayaki(e){if(!e.bossAdd||bossRoom?.state!=='fighting'||Math.random()>=.4)return;dorayaki.push({x:e.x,y:Math.min(510,e.y-e.h/2),baseY:528,vy:-160,age:0});}
function clearBossEntryAttacks(){clearInput();cancelNyoro();tetsuAction=null;tetsuEffects=[];tetsuGhosts=[];comboWindow=0;anomaBursts=[];miraAction=null;miraShots=[];miraEffects=[];bullets=[];energyShots=[];explosions=[];lightning=[];dirtBalls=[];bombBursts=[];thunderBullet=null;thunderBursts=[];giantThunder=null;groundBolts=[];skillState.charging=false;skillState.charge=0;skillState.thunderLeft=0;skillState.thunderAge=10;skillState.releaseAge=10;particles=[];}
function bossLocked(){return bossRoom&&['closing','fighting','opening'].includes(bossRoom.state);}
function miraStart(actor,type){const a={type,age:0,dir:actor.dir,hit:new Set(),next:0};if(actor===player)miraAction=a;else actor.action=a;return a;}
function miraAttack(){if(state==='playing'&&!bossIntro()&&selectedCharacter==='miramob'&&!miraAction)miraStart(player,'normal');}
function castMira(i){if(state!=='playing'||bossIntro()||selectedCharacter!=='miramob'||miraAction||i>1||miraCooldowns[i]>0)return;miraStart(player,i===0?'blades':'skull');miraCooldowns[i]=MIRA.cooldowns[i];}
function miraSpecial(a){return !!a&&a.type!=='normal';}
function miraVictims(hostile){return hostile?[player,...(pink?.enabled&&bossRoom?.state==='fighting'?[pink]:[])]:combatTargets();}
function miraDamage(target,damage,dir,hostile,launch=false){
 if(hostile&&target===pink){hitPink(dir,launch);return;}
 if(hostile){const hp=player.hp;damagePlayer({x:player.x-dir*50},damage);if(player.hp<hp){player.purple=.45;if(launch){player.vx=dir*100;player.knock=dir*160;player.vy=-200;}}}
 else{hitEnemy(target,damage,dir);target.purple=.45;if(launch)launchEnemy(target,dir*180,-180);}
}
function miraOverlap(e,x,y,r,hostile){const w=e===pink?38:hostile?CONFIG.playerColliderWidth:e.w,h=e===pink?76:hostile?CONFIG.playerColliderHeight:e.h;return Math.hypot(Math.max(0,Math.abs(e.x-x)-w/2),Math.max(e.y-h-y,y-e.y,0))<=r;}
function updateMiraAction(actor,a,dt,hostile){a.age+=dt;const t=a.age,dir=a.dir;
 if(a.type==='normal'&&t>=.12&&t<.29){for(const e of miraVictims(hostile)){if(e.death>=0||a.hit.has(e)||!miraOverlap(e,actor.x+dir*85,actor.y-45,85,hostile))continue;a.hit.add(e);miraDamage(e,hostile?MIRA.bossNormal:MIRA.normal,dir,hostile);miraEffects.push({kind:'claw',x:e.x,y:e.y-40,age:0,dir});}}
 if(a.type==='blades'){while(a.next<4&&t>=.18+a.next*.14){const n=a.next++;miraShots.push({kind:'blade',x:actor.x+dir*55,y:actor.y-48,baseY:actor.y-48,vx:dir*(hostile?310:450),age:0,life:3,phase:n*1.7,hostile,dir,hit:new Set()});}}
 if(a.type==='skull'&&t>=2.2&&!a.released){a.released=true;miraShots.push({kind:'core',x:actor.x+dir*78,y:actor.y-65,vx:dir*135,age:0,life:1,hostile,dir,hit:new Set()});}
 return t>=(a.type==='normal'?.4:a.type==='blades'?.9:2.55);
}
function hitSkullBlast(f){const radius=130+Math.min(1,f.age/.20)*(MIRA.explosionRadius-130);
 for(const e of miraVictims(f.hostile)){if(e.death>=0||f.hit.has(e)||!miraOverlap(e,f.x,f.y,radius,f.hostile))continue;f.hit.add(e);miraDamage(e,f.hostile?MIRA.bossExplosion:MIRA.explosion,Math.sign(e.x-f.x)||f.dir,f.hostile,true);if(!f.hostile&&e.type!=='crate')launchEnemy(e,(Math.sign(e.x-f.x)||f.dir)*400,-420,5);}
}
function explodeSkull(s){const f={kind:'skull',x:s.x,y:s.y,age:0,dir:s.dir,hostile:s.hostile,hit:new Set()};miraEffects.push(f);hitSkullBlast(f);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;miraShots.push({kind:'shard',x:s.x,y:s.y,vx:Math.cos(a)*440,vy:Math.sin(a)*440,age:0,life:1.05,hostile:s.hostile,dir:Math.cos(a)>=0?1:-1,hit:new Set()});}burst(s.x,s.y,45,'#d994ff');
}
function updateMira(dt){
 miraCooldowns=miraCooldowns.map(c=>Math.max(0,c-dt));player.purple=Math.max(0,(player.purple||0)-dt);for(const e of enemies)e.purple=Math.max(0,(e.purple||0)-dt);
 if(miraAction&&updateMiraAction(player,miraAction,dt,false))miraAction=null;
 for(const s of [...miraShots]){s.age+=dt;s.life-=dt;s.x+=s.vx*dt;if(s.kind==='blade')s.y=s.baseY+Math.sin(s.age*9+s.phase)*18;else if(s.kind==='shard')s.y+=s.vy*dt;
  const r=s.kind==='core'?75:s.kind==='blade'?23:19;
  for(const e of miraVictims(s.hostile)){if(e.death>=0||s.hit.has(e)||!miraOverlap(e,s.x,s.y,r,s.hostile))continue;s.hit.add(e);const damage=s.kind==='core'?(s.hostile?MIRA.bossCore:MIRA.core):s.kind==='blade'?(s.hostile?MIRA.bossBlade:MIRA.blade):(s.hostile?MIRA.bossShard:MIRA.shard);miraDamage(e,damage,s.dir,s.hostile,s.kind==='blade');if(s.kind==='blade'){miraEffects.push({kind:'slash',x:e.x,y:e.y-40,age:0,dir:s.dir});s.life=0;break;}}
  if(s.kind==='core'&&s.age>=1-1e-8&&!s.exploded){s.exploded=true;explodeSkull(s);}
 }
 miraShots=miraShots.filter(s=>s.life>0&&s.x>0&&s.x<CONFIG.worldWidth);for(const f of miraEffects){f.age+=dt;if(f.kind==='skull'&&f.age<=.4)hitSkullBlast(f);}miraEffects=miraEffects.filter(f=>f.age<(f.kind==='skull'?1.15:.4));
}
function miraBossTarget(e){return pink?.enabled&&pink.stun<=0&&Math.abs(pink.x-e.x)<190&&Math.abs(player.x-e.x)>180?pink:player;}
function moveMiraBoss(e,dt){
 const oldY=e.y,wasGrounded=e.grounded;e.flightClock=Math.max(0,(e.flightClock??3)-dt);
 if(e.stun>0){e.airMode=null;e.vy=(e.vy||0)+CONFIG.gravity*dt;}
 else if(e.airMode==='hover'){e.airAge+=dt;e.vy=0;e.y=e.hoverY+Math.sin(e.airAge*7)*7;if(e.airAge>=.7){e.airMode='glide';e.airAge=0;}}
 else if(e.airMode==='glide'){e.airAge+=dt;e.vy=85;if(e.airAge>=1.1)e.airMode='fall';}
 else{e.vy=(e.vy||0)+CONFIG.gravity*dt;if(e.airMode==='rise'&&e.vy>=-50){e.airMode='hover';e.airAge=0;e.hoverY=e.y;e.vy=0;}}
 e.y+=e.vy*dt;e.grounded=false;const floor=stageLandingHeight(e,oldY,wasGrounded);if(e.y>=floor&&e.vy>=0&&e.airMode!=='hover'){e.y=floor;e.vy=0;e.grounded=true;e.airMode=null;}
 if(e.stun<=0&&e.grounded&&!e.action&&e.flightClock===0){e.vy=-MIRA.jumpForce;e.grounded=false;e.airMode='rise';e.airAge=0;e.flightClock=5.5;}
 if(e.stun<=0&&(e.airMode==='glide'||e.airMode==='rise')){const target=miraBossTarget(e);e.vx=(Math.sign(target.x-e.x)||e.dir)*(e.airMode==='glide'?180:90);e.x=clamp(e.x+e.vx*dt,bossRoom.x+105,bossRoom.right-105);}
}
function updateMiraBoss(e,dt){
 if(!bossRoom||bossRoom.state!=='fighting'||e.death>=0)return;
 moveMiraBoss(e,dt);if(e.stun>0)return;
 e.think=Math.max(0,(e.think||0)-dt);e.skillCD=e.skillCD.map(c=>Math.max(0,c-dt));
 if(e.action){if(updateMiraAction(e,e.action,dt,true)){e.action=null;e.think=.8;}return;}
 const target=miraBossTarget(e),dx=target.x-e.x;e.dir=Math.sign(dx)||e.dir;
 if(e.think===0){if(e.skillCD[1]===0){miraStart(e,'skull');e.skillCD[1]=12;return;}if(e.skillCD[0]===0&&Math.abs(dx)<800){miraStart(e,'blades');e.skillCD[0]=6.5;return;}if(Math.abs(dx)<170&&Math.abs(target.y-e.y)<130){miraStart(e,'normal');return;}}
 if(!e.airMode){e.vx=e.dir*(Math.abs(dx)>370?240:95);if(Math.abs(dx)<100)e.vx=0;e.x=clamp(e.x+e.vx*dt,bossRoom.x+105,bossRoom.right-105);}
}
function updateBossRoom(dt){const b=bossRoom;if(!b)return;
 if(b.state==='idle'){
  player.x=Math.min(player.x,b.portalX+45);
  if(Math.abs(player.x-b.portalX)<48&&player.y>280){b.state='warping';b.age=0;clearBossEntryAttacks();player.vx=player.vy=player.knock=0;hintTimer=0;$('hint').hidden=true;}return;
 }
 if(b.state==='cleared')return;b.age+=dt;
 if(b.state==='warping'){
  if(b.age<.85)return;
  b.state='closing';b.age=0;camera=b.camera;checkpoint={x:b.x+180,y:548};Object.assign(player,{x:b.x+230,y:548,vx:0,vy:0,knock:0,dir:1,grounded:true,jumpsUsed:0});
  if(pink)Object.assign(pink,{x:b.x+160,y:548,vx:0,vy:0,grounded:true,attack:null,magic:null,stun:0,knock:0,hurtGrace:0,hopTarget:undefined,assist:0,recall:0});
  const e={type:'miramob',x:b.right-280,y:548,vx:0,vy:0,grounded:true,dir:-1,hp:MIRA.hp,maxHP:MIRA.hp,w:80,h:MIRA.bossHeight,flightClock:3,airMode:null,home:b.right-280,range:1000,death:-1,flash:0,knock:0,phase:0,think:1.1,skillCD:[2.5,6],action:null};b.boss=e;enemies.push(e);
 }
 if(b.state==='closing'&&b.age>=2.4){b.state='fighting';b.age=0;clearBossEntryAttacks();player.inv=Math.max(player.inv,1);}
 if(b.state==='fighting'){
  b.spawnClock-=dt;if(b.spawnClock<=0&&b.boss.death<0){b.spawnClock=5+Math.random()*4;if(enemies.filter(e=>e.bossAdd&&e.death<0).length<3){const x=b.x+200+Math.random()*(b.right-b.x-400);enemies.push({type:'miira',bossAdd:true,x,y:-90,home:x,dir:-1,hp:24,maxHP:24,w:46,h:MIIRA.height,flash:0,knock:0,death:-1,range:220,phase:b.spawned++,dropping:{vy:0},attackCooldown:2,attackAge:-1});}}
  if(b.boss.death>=0){b.state='opening';b.age=0;b.boss.action=null;miraShots=miraShots.filter(s=>!s.hostile);miraEffects=miraEffects.filter(f=>!f.hostile);for(const e of enemies)if(e.bossAdd&&e.death<0)hitEnemy(e,e.hp);}
 }
 if(b.state==='opening'&&b.age>=1){b.state='cleared';hintTimer=2;$('hint').textContent='ミラモブ撃破！ ゴールへ →';}
 if(bossLocked()){camera=b.camera;player.x=clamp(player.x,b.x+96,b.right-96);if(pink)pink.x=clamp(pink.x,b.x+100,b.right-100);for(const e of enemies)if(e===b.boss||e.bossAdd){e.x=clamp(e.x,b.x+100,b.right-100);if(e.launch)e.launch.floor=548;}}
}
function miraPose(actor,a){if(a){if(a.type==='normal')return 9+Math.min(7,Math.floor(a.age/.05));if(a.type==='blades')return 25+Math.min(7,Math.floor(a.age/.1125));return a.age<.12?33:a.age<2.2?34+Math.floor(a.age*14)%3:37;}return Math.abs(actor.vx||0)>200?17+Math.floor(elapsed*14)%8:Math.abs(actor.vx||0)>1?1+Math.floor(elapsed*10)%8:1;}
function paintMira(actor,a,height){const n=miraPose(actor,a),f=miraFrames[n];if(!f)return;const k=height/(f.height*(n===37?.83:1));ctx.save();ctx.translate(actor.x-camera,actor.y);ctx.scale(actor.dir,1);if(actor.flash>0||actor.purple>0&&Math.floor(elapsed*18)%2)ctx.filter='brightness(1.5) sepia(.4) hue-rotate(220deg)';if(actor===player&&actor.inv>0&&Math.floor(elapsed*16)%2)ctx.globalAlpha=.4;if(actor.death>=0)ctx.globalAlpha=Math.max(0,1-actor.death/.6);ctx.drawImage(f,-f.width*k*.5,-f.height*k,f.width*k,f.height*k);ctx.restore();}
function miraImage(n,x,y,size,dir=1){const f=miraFrames[n];if(!f)return;const k=size/Math.max(f.width,f.height);ctx.save();ctx.translate(x-camera,y);ctx.scale(dir,1);ctx.drawImage(f,-f.width*k/2,-f.height*k/2,f.width*k,f.height*k);ctx.restore();}
function drawSkullBlast(f){const t=f.age/1.15,x=f.x-camera,y=f.y,r=130+Math.min(1,f.age/.2)*200;
 ctx.save();ctx.globalAlpha=Math.max(0,1-t);ctx.fillStyle='#fbe6ff';ctx.shadowColor='#ba4aff';ctx.shadowBlur=25;ctx.beginPath();ctx.arc(x,y,Math.max(10,130*(1-t)),0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
 ctx.strokeStyle='#e1a3ff';ctx.lineWidth=8*(1-t)+1;ctx.beginPath();ctx.ellipse(x,y+40,r,50+t*65,0,0,Math.PI*2);ctx.stroke();
 for(let i=0;i<14;i++){const a=i*2.399,spread=45+t*240,px=x+Math.cos(a)*spread,py=y+Math.sin(a)*spread*.62-t*90;ctx.fillStyle=i%2?'#e8d9f4':'#b99bcf';ctx.strokeStyle='#755093';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px,py,20+t*45,0,Math.PI*2);ctx.fill();ctx.stroke();}
 for(let i=0;i<11;i++){const a=Math.PI+i*Math.PI/10,px=x+Math.cos(a)*r*.75,py=y+Math.sin(a)*r*.55,h=75*(1-t)+35;ctx.fillStyle=i%2?'#b32bff':'#7c16c6';ctx.beginPath();ctx.moveTo(px-22,py+30);ctx.quadraticCurveTo(px-35,py-20,px+8,py-h);ctx.quadraticCurveTo(px+2,py-15,px+26,py-40);ctx.quadraticCurveTo(px+48,py+25,px-22,py+30);ctx.fill();ctx.fillStyle='#f7baff';ctx.beginPath();ctx.ellipse(px+4,py+8,10,25,0,0,Math.PI*2);ctx.fill();}
 ctx.globalAlpha=Math.max(0,1-f.age/.55);miraImage(43,f.x,f.y,170+f.age*210);ctx.restore();
}
function drawMiraEffects(){
 for(const f of miraEffects){if(f.kind==='skull'){drawSkullBlast(f);}else if(f.kind==='slash')miraImage(39+Math.min(3,Math.floor(f.age*10)),f.x,f.y,160,f.dir);else{ctx.save();ctx.strokeStyle='#e19bff';ctx.shadowColor='#ab40ff';ctx.shadowBlur=14;ctx.lineWidth=5;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(f.x-camera-40+i*20,f.y-35);ctx.quadraticCurveTo(f.x-camera+25+i*10,f.y,f.x-camera-10+i*20,f.y+40);ctx.stroke();}ctx.restore();}}
 for(const s of miraShots)miraImage(s.kind==='blade'?38:43,s.x,s.y,s.kind==='core'?160:s.kind==='blade'?62:38,s.dir);
 for(const actor of [player,bossRoom?.boss]){if(!actor)continue;const a=actor===player?miraAction:actor.action;if(a?.type==='skull'&&a.age<2.2){const t=Math.min(1,a.age/2.2);miraImage(43,actor.x+a.dir*(42+t*35)+Math.sin(elapsed*35)*3,actor.y-65+Math.sin(elapsed*29)*3,25+t*140);}}
}
function drawBossAtmosphere(){const b=bossRoom;if(!b||b.state==='cleared')return;
 if(b.state==='idle'||b.state==='warping'){
  const x=b.portalX-camera,y=425;if(x<-100||x>W+100)return;ctx.save();ctx.shadowColor='#ae59ff';ctx.shadowBlur=28;
  const glow=ctx.createRadialGradient(x,y,10,x,y,145);glow.addColorStop(0,'#110f30');glow.addColorStop(.65,'#5c259dcc');glow.addColorStop(1,'#bd79ff00');ctx.fillStyle=glow;ctx.beginPath();ctx.ellipse(x,y,70,125,0,0,Math.PI*2);ctx.fill();
  for(let i=0;i<5;i++){ctx.strokeStyle=i%2?'#e2bcff':'#9962f5';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y,40+i*6,86+i*9,Math.sin(elapsed*2+i)*.08,elapsed*(i%2?1:-1)+i,elapsed*(i%2?1:-1)+i+4.6);ctx.stroke();}
  for(let i=0;i<16;i++){const a=elapsed*1.5+i*Math.PI/8;ctx.fillStyle='#edd6ff';ctx.beginPath();ctx.arc(x+Math.cos(a)*78,y+Math.sin(a)*130,2+i%3,0,Math.PI*2);ctx.fill();}
  ctx.shadowBlur=0;rounded(x-117,262,234,37,10,'#241435ed');text('ミラモブへのワープ',x,287,20,'#efcfff');text('ホールに入るとボス戦',x,578,17,'#efcfff');ctx.restore();return;
 }
 ctx.save();ctx.fillStyle='#25103c44';ctx.fillRect(0,0,W,548);const shade=ctx.createLinearGradient(0,0,0,548);shade.addColorStop(0,'#251035b0');shade.addColorStop(1,'#66397e00');ctx.fillStyle=shade;ctx.fillRect(0,0,W,548);
 for(let i=0;i<22;i++){const x=(i*137+Math.sin(elapsed+i)*15)%W,y=548-(elapsed*24+i*73)%500;ctx.fillStyle='#deafff55';ctx.beginPath();ctx.arc(x,y,2+i%3,0,Math.PI*2);ctx.fill();}ctx.restore();
}
function drawBossRoom(){const b=bossRoom;if(!b||['idle','cleared'].includes(b.state))return;
 if(b.state==='warping'){const t=Math.min(1,b.age/.85);ctx.save();ctx.fillStyle=`rgba(28,8,48,${t})`;ctx.fillRect(0,0,W,H);ctx.strokeStyle=`rgba(226,186,255,${1-t})`;ctx.lineWidth=5;for(let i=0;i<20;i++){const a=i*Math.PI/10+elapsed;ctx.beginPath();ctx.moveTo(W/2+Math.cos(a)*80*(1-t),H/2+Math.sin(a)*80*(1-t));ctx.lineTo(W/2+Math.cos(a)*850,H/2+Math.sin(a)*600);ctx.stroke();}ctx.restore();return;}
 const offset=b.state==='closing'?-600*(1-Math.min(1,b.age/.75))**2:b.state==='opening'?-650*Math.min(1,b.age):0;
 for(const wx of [b.x+32,b.right-32]){const x=wx-camera;for(let i=0;i<5;i++){const y=548-i*100+offset;ctx.fillStyle=i%2?'#726d80':'#97919e';ctx.strokeStyle='#38344a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x-42,y);ctx.lineTo(x-51,y-63);ctx.lineTo(x-17,y-104);ctx.lineTo(x+35,y-89);ctx.lineTo(x+48,y-21);ctx.closePath();ctx.fill();ctx.stroke();}}
 const e=b.boss;if(!e)return;rounded(W/2-245,112,490,44,8,'#21152dec');text('BOSS ミラモブ',W/2,131,17,'#efd3ff');rounded(W/2-225,140,450,8,4,'#52445d');rounded(W/2-225,140,450*Math.max(0,e.hp)/e.maxHP,8,4,'#c968fa');
 if(b.state==='closing'){
  const t=b.age;ctx.save();ctx.fillStyle=`rgba(27,8,45,${Math.max(0,1-t/.45)})`;ctx.fillRect(0,0,W,H);
  const impact=Math.max(0,1-Math.abs(t-.8)/.35);ctx.fillStyle=`rgba(233,195,255,${impact*.24})`;ctx.fillRect(0,0,W,H);
  if(t>=.75&&t<1.6){const d=(t-.75)/.85;for(const wx of [b.x+32,b.right-32])for(let i=0;i<8;i++){ctx.fillStyle=`rgba(199,181,213,${1-d})`;ctx.beginPath();ctx.arc(wx-camera+Math.cos(i*2)*d*145,535-Math.sin(i)*d*55,14+d*35,0,Math.PI*2);ctx.fill();}}
  ctx.globalAlpha=Math.min(1,t*3,Math.max(0,(2.4-t)*3));rounded(0,0,W,18,0,'#130b20');rounded(0,H-18,W,18,0,'#130b20');rounded(W/2-270,197,540,113,12,'#21122aeb');text('BOSS ENCOUNTER',W/2,233,22,'#dfacff');text('ミラモブ',W/2,284,43,'#fff0ff');
  const radius=80+t*55;ctx.strokeStyle='#d090ff';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(e.x-camera,544,radius,18+t*8,0,0,Math.PI*2);ctx.stroke();ctx.restore();
 }
}
