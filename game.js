/* All units are logical canvas pixels and seconds. No external dependencies. */
'use strict';
const CONFIG = Object.freeze({
  width:1280, height:720, worldWidth:21800, groundY:548,
  walkSpeed:190, dashSpeed:340, jumpForce:640, gravity:1800,
  shootInterval:0.18, bulletSpeed:1050, bulletDamage:12, maxHP:50,
  playerHeight:88, playerColliderWidth:34, playerColliderHeight:65,
  invincibility:1.25, coyoteTime:0.10, jumpBuffer:0.13,
  enemies:{patrol:{name:'クサマル',hp:24,damage:6,speed:56,color:'#8cae4b',sprite:null},
    chase:{name:'ハシリメ',hp:36,damage:7,speed:100,color:'#db8752',sprite:null},
    tank:{name:'ゴロイワ',hp:96,damage:10,speed:30,color:'#839ab0',sprite:null}}
});
const $=id=>document.getElementById(id), canvas=$('canvas'), ctx=canvas.getContext('2d');
const W=CONFIG.width,H=CONFIG.height, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sprites=[], assets={}, keys=new Set(), pointers={shoot:new Set(),jump:new Set()};
let state='loading', player, camera=0, platforms=[],enemies=[],bullets=[],coins=[],particles=[],popups=[];
let elapsed=0, collected=0, kills=0, shootClock=0, jumpRequest=0, stickPointer=null, stickOrigin=null, axis=0, running=false, lastTime=0, accumulator=0, hintTimer=0;
const skillHandlers=[null,null,null]; // Assign a function(player) when a skill is implemented.
function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(W*d);canvas.height=Math.round(H*d);ctx.setTransform(d,0,0,d,0,0);}
window.addEventListener('resize',()=>{resize();if(innerHeight>innerWidth&&state==='playing')pause();});resize();
function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error(src));img.src=src;});}
Promise.all([loadImage('stage/001.png').then(i=>assets.background=i),loadImage('atk/001.png').then(i=>assets.bullet=i),...Array.from({length:32},(_,n)=>loadImage(`denden/${String(n+1).padStart(3,'0')}.png`).then(i=>sprites[n]=i))]).then(()=>{state='ready';$('start').disabled=false;$('start').textContent='START RUN →';$('load-status').textContent='AREA 1-1 • 草原 / 約1〜2分';reset();}).catch(e=>{$('modal-title').textContent='画像を読み込めませんでした';$('modal-copy').textContent=`${e.message} を確認してください。`;$('load-status').textContent='ページを再読み込みしてください';});
function reset(){
  player={x:140,y:CONFIG.groundY,vx:0,vy:0,dir:1,hp:CONFIG.maxHP,grounded:true,coyote:0,jumpAge:0,shotAge:10,inv:0,red:0,knock:0,anim:0};
  camera=elapsed=collected=kills=shootClock=jumpRequest=0; bullets=[];particles=[];popups=[];coins=[];platforms=[];enemies=[];clearInput();
  // A safe ground route and optional elevated coin routes; no blind lethal pits.
  for(let section=0;section<10;section++){
    const x=750+section*2000;
    platforms.push({x,y:490,w:180,h:58,solid:true},{x:x+285,y:422,w:240,h:30},{x:x+650,y:350,w:210,h:30},{x:x+1040,y:447,w:250,h:30});
    for(let j=0;j<5;j++)coins.push({x:x+310+j*43,y:382,taken:false});
    for(let j=0;j<4;j++)coins.push({x:x+665+j*50,y:310,taken:false});
    for(let j=0;j<5;j++)coins.push({x:x+1430+j*55,y:510-Math.sin(j/4*Math.PI)*95,taken:false});
  }
  [380,440,500,560].forEach(x=>coins.push({x,y:507,taken:false}));
  const addEnemy=(type,x,y=CONFIG.groundY,range=170)=>{const c=CONFIG.enemies[type];enemies.push({type,x,y,home:x,dir:-1,hp:c.hp,maxHP:c.hp,w:type==='tank'?62:46,h:type==='tank'?65:46,flash:0,knock:0,death:-1,range,phase:x%17});};
  addEnemy('patrol',1520);addEnemy('chase',2510);
  for(let s=1;s<10;s++){let x=750+s*2000;addEnemy('patrol',x+500);addEnemy(s%3===0?'tank':'chase',x+1340);if(s>=4)addEnemy('patrol',x+1710);}
  addEnemy('tank',21200);hintTimer=0;updateHUD();
}
function clearInput(){keys.clear();axis=0;running=false;stickPointer=null;stickOrigin=null;for(const group of Object.values(pointers))group.clear();$('shoot').classList.remove('pressed');$('jump').classList.remove('pressed');$('stick').style.left='';$('stick').style.top='';$('stick-knob').style.transform='';jumpRequest=0;}
function modal(title,copy,button){$('modal-title').textContent=title;$('modal-copy').textContent=copy;$('instructions').hidden=true;$('instructions').style.display='none';$('start').textContent=button;$('load-status').textContent='MOB GUN GUN • AREA 1-1';$('overlay').hidden=false;clearInput();}
function pause(){if(state!=='playing')return;state='paused';modal('ひとやすみ。','準備ができたら、冒険の続きを。','RESUME →');}
$('pause').onclick=()=>state==='paused'?resume():pause();
function resume(){if(innerHeight>innerWidth)return;state='playing';$('overlay').hidden=true;clearInput();}
$('start').onclick=()=>{if(state==='loading')return;if(state!=='paused')reset();resume();};
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('blur',()=>{pause();clearInput();});
window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','Space','KeyA','KeyD','KeyJ','KeyK','ShiftLeft','ShiftRight','Escape'].includes(e.code)){e.preventDefault();if(e.code==='Escape'&&!e.repeat){state==='paused'?resume():pause();return;}if(state!=='playing')return;keys.add(e.code);if(['Space','ArrowUp','KeyK'].includes(e.code)&&!e.repeat)jumpRequest=CONFIG.jumpBuffer;}});
window.addEventListener('keyup',e=>keys.delete(e.code));
for(const type of ['shoot','jump']){const el=$(type);el.addEventListener('pointerdown',e=>{e.preventDefault();if(state!=='playing')return;el.setPointerCapture(e.pointerId);pointers[type].add(e.pointerId);el.classList.add('pressed');if(type==='jump')jumpRequest=CONFIG.jumpBuffer;});const release=e=>{pointers[type].delete(e.pointerId);if(!pointers[type].size)el.classList.remove('pressed');};for(const event of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(event,release);}
const zone=$('stick-zone');
zone.addEventListener('pointerdown',e=>{e.preventDefault();if(state!=='playing'||stickPointer!==null)return;stickPointer=e.pointerId;zone.setPointerCapture(e.pointerId);stickOrigin={x:e.clientX,y:e.clientY};const r=zone.getBoundingClientRect(),scale=$('game').clientWidth/W;$('stick').style.left=`${e.clientX-r.left-70.4*scale}px`;$('stick').style.top=`${e.clientY-r.top-70.4*scale}px`;});
zone.addEventListener('pointermove',e=>{if(e.pointerId!==stickPointer)return;const radius=$('game').clientWidth*.044,dx=e.clientX-stickOrigin.x,dy=e.clientY-stickOrigin.y,len=Math.hypot(dx,dy),f=Math.min(1,radius/(len||1));axis=clamp(dx/radius,-1,1);$('stick-knob').style.transform=`translate(${dx*f}px,${dy*f}px)`;});
function releaseStick(e){if(e.pointerId!==stickPointer)return;stickPointer=null;axis=0;$('stick').style.left='';$('stick').style.top='';$('stick-knob').style.transform='';}
for(const e of ['pointerup','pointercancel','lostpointercapture'])zone.addEventListener(e,releaseStick);
for(const el of document.querySelectorAll('.skill'))el.onclick=()=>{if(state!=='playing')return;const handler=skillHandlers[Number(el.dataset.skill)];if(handler)handler(player);else {hintTimer=1.5;$('hint').textContent='スキルは準備中 — まずは走って、撃とう！';}};
for(const e of ['contextmenu','dragstart','selectstart','gesturestart','gesturechange','gestureend','dblclick'])document.addEventListener(e,x=>x.preventDefault(),{passive:false});
document.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
function burst(x,y,n=8,color='#ffd666'){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=45+Math.random()*180;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-35,life:.15+Math.random()*.22,max:.4,color:i%3===0?'#fffbe9':color,r:2+Math.random()*3});}}
function fire(){const p=player;bullets.push({x:p.x+p.dir*36,y:p.y-37,dir:p.dir,life:1.6});p.shotAge=0;shootClock=CONFIG.shootInterval;burst(p.x+p.dir*43,p.y-37,3);}
function damagePlayer(enemy){if(player.inv>0)return;player.hp=Math.max(0,player.hp-CONFIG.enemies[enemy.type].damage);player.inv=CONFIG.invincibility;player.red=.2;player.knock=(player.x<enemy.x?-1:1)*220;player.vy=-160;player.grounded=false;burst(player.x,player.y-35,8,'#ff7373');if(player.hp===0){state='dead';modal('もう一度、草原へ。',`COIN ${collected} / 撃破 ${kills}体`,'RETRY');}}
function tick(dt){
  if(state!=='playing')return;elapsed+=dt;const p=player;p.anim+=dt;p.shotAge+=dt;p.inv=Math.max(0,p.inv-dt);p.red=Math.max(0,p.red-dt);shootClock=Math.max(0,shootClock-dt);jumpRequest=Math.max(0,jumpRequest-dt);
  const keyboard=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);
  const a=keyboard?keyboard*(keys.has('ShiftLeft')||keys.has('ShiftRight')?1:.55):axis, magnitude=Math.abs(a);
  // Hysteresis prevents threshold chatter between walking and running.
  if(running?magnitude<.64:magnitude>.76)running=!running;
  const move=magnitude>.35?Math.sign(a):0;p.vx=move*(running?CONFIG.dashSpeed:CONFIG.walkSpeed);if(move)p.dir=move;
  if(p.grounded)p.coyote=CONFIG.coyoteTime;else p.coyote=Math.max(0,p.coyote-dt);
  if(jumpRequest>0&&p.coyote>0){p.vy=-CONFIG.jumpForce;p.grounded=false;p.coyote=0;p.jumpAge=0;jumpRequest=0;burst(p.x,p.y-4,5,'#d6e7a4');}
  if(!p.grounded)p.jumpAge+=dt;
  const oldX=p.x,oldY=p.y;p.x=clamp(p.x+(p.vx+p.knock)*dt,24,CONFIG.worldWidth-35);p.knock*=Math.exp(-9*dt);
  const half=CONFIG.playerColliderWidth/2;
  for(const platform of platforms){if(!platform.solid||oldY<=platform.y+1||p.y-CONFIG.playerColliderHeight>=platform.y+platform.h)continue;if(p.x+half>platform.x&&p.x-half<platform.x+platform.w){if(oldX+half<=platform.x)p.x=platform.x-half;else if(oldX-half>=platform.x+platform.w)p.x=platform.x+platform.w+half;}}
  p.vy+=CONFIG.gravity*dt;p.y+=p.vy*dt;p.grounded=false;
  let landing=CONFIG.groundY;for(const platform of platforms)if(p.x+half>platform.x&&p.x-half<platform.x+platform.w&&oldY<=platform.y+.5&&p.y>=platform.y&&p.vy>=0)landing=Math.min(landing,platform.y);
  if(p.y>=landing&&p.vy>=0){p.y=landing;p.vy=0;p.grounded=true;}
  if((pointers.shoot.size||keys.has('KeyJ'))&&shootClock<=0)fire();
  for(const e of enemies){e.flash=Math.max(0,e.flash-dt);if(e.death>=0){e.death+=dt;continue;}if(Math.abs(e.x-p.x)>1000)continue;const c=CONFIG.enemies[e.type];if(e.type==='chase'&&Math.abs(e.x-p.x)<470)e.dir=Math.sign(p.x-e.x)||e.dir;else if(e.x<e.home-e.range)e.dir=1;else if(e.x>e.home+e.range)e.dir=-1;e.x+=e.dir*c.speed*dt+e.knock*dt;e.knock*=Math.exp(-10*dt);e.x=clamp(e.x,e.home-e.range-80,e.home+e.range+80);if(Math.abs(p.x-e.x)<half+e.w*.42&&p.y>e.y-e.h&&p.y-CONFIG.playerColliderHeight<e.y)damagePlayer(e);}
  for(const b of bullets){const previous=b.x;b.x+=b.dir*CONFIG.bulletSpeed*dt;b.life-=dt;for(const e of enemies){if(e.death>=0||b.life<=0)continue;if(Math.max(previous,b.x)>=e.x-e.w/2&&Math.min(previous,b.x)<=e.x+e.w/2&&b.y>e.y-e.h-4&&b.y<e.y+3){e.hp=Math.max(0,e.hp-CONFIG.bulletDamage);e.flash=.1;e.knock=b.dir*110;b.life=0;burst(clamp(b.x,e.x-e.w/2,e.x+e.w/2),b.y);if(e.hp===0){e.death=0;kills++;burst(e.x,e.y-e.h/2,12);}}}}
  bullets=bullets.filter(b=>b.life>0&&b.x>camera-240&&b.x<camera+W+240);enemies=enemies.filter(e=>e.death<.6);
  for(const c of coins)if(!c.taken&&Math.abs(p.x-c.x)<half+15&&c.y>p.y-CONFIG.playerColliderHeight-12&&c.y<p.y+12){c.taken=true;collected++;popups.push({x:c.x,y:c.y,life:.6});burst(c.x,c.y,5);}
  for(const f of particles){f.life-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=400*dt;}particles=particles.filter(f=>f.life>0).slice(-250);
  for(const f of popups){f.life-=dt;f.y-=55*dt;}popups=popups.filter(f=>f.life>0);
  // Soft follow, with a dead zone. Keep more of the route visible ahead.
  const screenX=p.x-camera;let target=camera;if(screenX>W*.39)target=p.x-W*.39;else if(screenX<W*.27)target=p.x-W*.27;camera=clamp(camera+(target-camera)*(1-Math.exp(-7*dt)),0,CONFIG.worldWidth-W);
  if(hintTimer>0)hintTimer-=dt;else $('hint').textContent=p.x<650?'右へ進もう → スティックを深く倒すとダッシュ':p.x<1600?'段差はジャンプ！ 上のコインも集めよう':p.x>20400?'最後のゴロイワを突破して、GOALへ →':'草原の先へ → 移動中も空中も SHOOT';
  if(p.x>=CONFIG.worldWidth-180&&state==='playing'){state='clear';modal('AREA 1-1 CLEAR!',`COIN ${collected} / 撃破 ${kills}体 / ${Math.floor(elapsed/60)}:${String(Math.floor(elapsed%60)).padStart(2,'0')}`,'RETRY');}
  updateHUD();
}
function updateHUD(){if(!player)return;$('coins').textContent=collected;$('hp-text').textContent=`${player.hp} / ${CONFIG.maxHP}`;$('hp-fill').style.width=`${player.hp/CONFIG.maxHP*100}%`;$('progress').style.width=`${player.x/CONFIG.worldWidth*100}%`;}
function rounded(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function text(str,x,y,size,color='#fff4d6',align='center'){ctx.font=`800 ${size}px Arial, sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(str,x,y);}
function drawBackground(){ctx.fillStyle='#56c1df';ctx.fillRect(0,0,W,H);if(assets.background){const bw=1280,bh=853.33,scroll=camera*.18,first=Math.floor(scroll/bw);for(let n=first;n<=first+1;n++){ctx.save();ctx.translate(n*bw-scroll,0);if(n%2){ctx.translate(bw,0);ctx.scale(-1,1);}ctx.drawImage(assets.background,0,-170,bw,bh);ctx.restore();}}ctx.fillStyle='#a5dc811c';ctx.fillRect(0,0,W,548);}
function ground(){rounded(0,548,W,172,0,'#614f3a');rounded(0,548,W,20,0,'#375b38');rounded(0,547,W,9,0,'#a2cd57');rounded(0,562,W,5,0,'#233f35');const shift=camera%65;for(let i=-1;i<21;i++){const x=i*65-shift;ctx.fillStyle='#89704b';ctx.beginPath();ctx.moveTo(x,578);ctx.lineTo(x+25,573);ctx.lineTo(x+43,596);ctx.lineTo(x+18,601);ctx.fill();ctx.fillStyle='#413e34';ctx.fillRect(x+10,622,23,5);}const g=ctx.createLinearGradient(0,578,0,H);g.addColorStop(0,'#112b3300');g.addColorStop(1,'#102934e8');ctx.fillStyle=g;ctx.fillRect(0,578,W,142);}
function drawPlatform(p){const x=p.x-camera;if(x+p.w<0||x>W)return;rounded(x,p.y,p.w,p.h,7,'#4d5a40');rounded(x+3,p.y+9,p.w-6,p.h-9,4,'#8e7950');ctx.fillStyle='#b29a61';for(let k=10;k<p.w-20;k+=44)ctx.fillRect(x+k,p.y+17,29,5);rounded(x-4,p.y-2,p.w+8,10,4,'#7cab42');rounded(x,p.y-2,p.w,4,2,'#c0e275');}
function drawEnemy(e){const x=e.x-camera;if(x<-100||x>W+100)return;const dead=e.death>=0;ctx.save();if(dead){ctx.globalAlpha=(1-e.death/.6)*(Math.floor(e.death*25)%2?.55:1);}const hop=dead?-Math.sin(Math.min(1,e.death/.6)*Math.PI)*35:Math.sin(elapsed*7+e.phase)*2,y=e.y+hop;ctx.fillStyle='#183d3d40';ctx.beginPath();ctx.ellipse(x,e.y,e.w*.6,6,0,0,Math.PI*2);ctx.fill();const c=CONFIG.enemies[e.type];rounded(x-e.w/2,y-e.h,e.w,e.h-4,e.type==='tank'?10:18,e.flash>0?'#fffbdc':c.color);ctx.strokeStyle='#233d40';ctx.lineWidth=3;ctx.stroke();rounded(x-e.w*.35,y-8,14,9,4,'#29413c');rounded(x+e.w*.1,y-8,14,9,4,'#29413c');if(e.type==='tank'){rounded(x-e.w/2+4,y-e.h+7,e.w-8,10,3,'#bed1cd');rounded(x-8,y-e.h-9,16,12,3,'#647e87');}else{ctx.fillStyle='#41583e';ctx.beginPath();ctx.moveTo(x-7,y-e.h+2);ctx.lineTo(x-16,y-e.h-12);ctx.lineTo(x+3,y-e.h-4);ctx.lineTo(x+11,y-e.h-15);ctx.lineTo(x+13,y-e.h+3);ctx.fill();}rounded(x-e.w*.32,y-e.h+18,e.w*.64,14,6,'#19363a');ctx.fillStyle='#fff4cd';ctx.fillRect(x-10+e.dir*2,y-e.h+21,5,6);ctx.fillRect(x+4+e.dir*2,y-e.h+21,5,6);if(!dead){rounded(x-51,y-e.h-47,102,23,5,'#17363be6');text(c.name,x,y-e.h-31,13);rounded(x-32,y-e.h-19,64,6,3,'#293b3a');rounded(x-31,y-e.h-18,62*e.hp/e.maxHP,4,2,'#fa6a67');}ctx.restore();}
function drawPlayer(){const p=player;if(!p||!sprites.length)return;let frame=24;if(!p.grounded)frame=8+Math.min(7,Math.floor(p.jumpAge/.075));else if(p.shotAge<CONFIG.shootInterval)frame=24+Math.min(7,Math.floor(p.shotAge/CONFIG.shootInterval*8));else if(Math.abs(p.vx)>1)frame=(running?16:0)+Math.floor(p.anim*(running?14:10))%8;const img=sprites[frame];if(!img)return;ctx.save();ctx.fillStyle='#173b3b40';ctx.beginPath();ctx.ellipse(p.x-camera,p.y+1,29,6,0,0,Math.PI*2);ctx.fill();ctx.translate(p.x-camera,p.y);ctx.scale(p.dir,1);if(p.inv>0&&Math.floor(p.inv*16)%2===0)ctx.globalAlpha=.35;const h=CONFIG.playerHeight,w=img.width/img.height*h;ctx.drawImage(img,-w/2,-h,w,h);if(p.red>0){ctx.globalCompositeOperation='source-atop';/* Tint only the sprite through a cached silhouette. */ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.55;const tint=getTint(frame);ctx.drawImage(tint,-w/2,-h,w,h);}ctx.restore();}
const tints=new Map();function getTint(frame){if(tints.has(frame))return tints.get(frame);const img=sprites[frame],c=document.createElement('canvas');c.width=img.width;c.height=img.height;const t=c.getContext('2d');t.drawImage(img,0,0);t.globalCompositeOperation='source-in';t.fillStyle='#ff334a';t.fillRect(0,0,c.width,c.height);tints.set(frame,c);return c;}
function draw(){drawBackground();ground();if(!player)return;for(const p of platforms)drawPlatform(p);for(const c of coins){if(c.taken||c.x<camera-30||c.x>camera+W+30)continue;const x=c.x-camera,y=c.y+Math.sin(elapsed*3+c.x)*3;ctx.fillStyle='#9d6b20';ctx.beginPath();ctx.ellipse(x,y,11,14,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffdb60';ctx.beginPath();ctx.ellipse(x,y-1,8.5,11,0,0,Math.PI*2);ctx.fill();text('·',x,y+5,22,'#a76e22');}for(const e of enemies)drawEnemy(e);const gx=CONFIG.worldWidth-180-camera;if(gx<W+100){rounded(gx,300,8,248,3,'#e9e6c3');rounded(gx+8,306,140,59,4,'#183c3e');text('GOAL',gx+77,345,26,'#ffda69');rounded(gx-45,540,100,8,3,'#f5d46e');}drawPlayer();for(const b of bullets){ctx.save();ctx.translate(b.x-camera,b.y);ctx.scale(b.dir,1);ctx.drawImage(assets.bullet,-14,-6,28,12);ctx.restore();}for(const f of particles){ctx.globalAlpha=clamp(f.life/.15,0,1);ctx.fillStyle=f.color;ctx.fillRect(f.x-camera-f.r/2,f.y-f.r/2,f.r,f.r);}ctx.globalAlpha=1;for(const f of popups){ctx.globalAlpha=f.life/.6;text('+1',f.x-camera,f.y,20,'#ffe78b');}ctx.globalAlpha=1;}
function loop(time){const dt=Math.min((time-lastTime)/1000||0,.05);lastTime=time;accumulator+=dt;while(accumulator>=1/120){tick(1/120);accumulator-=1/120;}draw();requestAnimationFrame(loop);}requestAnimationFrame(loop);
