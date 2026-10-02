'use strict';
const SUPPORT=Object.freeze({pinkHP:50,pinkAutoRevive:10,pinkRescueTime:2,pinkRescueRange:125,pinkDamage:10,pinkCooldown:1.15,assistDuration:2,bulletCooldown:10,bulletDamage:[36,48,60]});
const pinkFrames=[],dendenBulletFrames=[],thunderBurstFrames=[],anomaFrames=[];
let anomaBursts=[],pinkDownFrames=[];
let pink=null,thunderBullet=null,thunderBulletCooldown=0,thunderBursts=[];
async function trimFrame(path){
 const img=await loadImage(path),c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const data=g.getImageData(0,0,c.width,c.height).data;let l=c.width,t=c.height,r=0,b=0;
 for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(data[(y*c.width+x)*4+3]>8){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x+1);b=Math.max(b,y+1);}
 if(r<=l||b<=t)throw Error(`Empty sprite: ${path}`);const out=document.createElement('canvas');out.width=r-l;out.height=b-t;out.getContext('2d').drawImage(img,l,t,out.width,out.height,0,0,out.width,out.height);return out;
}
async function loadSupport(){pinkDownFrames=isolateCharacterBodies(await loadImage('pink/down.png'),16);for(const f of pinkDownFrames)f.scale=76/pinkDownFrames[0].h;await Promise.all([
 ...Array.from({length:4},(_,i)=>trimFrame(`skill/${String(i+37).padStart(3,'0')}.png`).then(img=>anomaFrames[i]=img)),
 ...Array.from({length:48},(_,i)=>trimFrame(`pink/${String(i+1).padStart(2,'0')}.png`).then(img=>pinkFrames[i]=img)),
 ...Array.from({length:8},(_,i)=>trimFrame(`denden/${String(i+33).padStart(3,'0')}.png`).then(img=>dendenBulletFrames[i]=img)),
 ...Array.from({length:4},(_,i)=>trimFrame(`skill/${String(i+33).padStart(3,'0')}.png`).then(img=>thunderBurstFrames[i]=img))
]);}
function resetSupport(){$('pink-revive').hidden=true;anomaBursts=[];pink={hp:SUPPORT.pinkHP,maxHP:SUPPORT.pinkHP,downAge:0,rescue:null,x:player.x-65,y:player.y,vx:0,vy:0,dir:1,grounded:true,enabled:true,age:0,cooldown:0,attack:null,magic:null,magicCooldown:1.4,stun:0,knock:0,hurtGrace:0,assist:0,recall:0,lastTap:-Infinity,wanderDir:1,wanderClock:0};thunderBullet=null;thunderBulletCooldown=0;thunderBursts=[];}
function supportFloorAt(x,fromY){let y=groundAt(x);const roof=summonRoofY(x);if(roof>=fromY)y=Math.min(y,roof);for(const q of stageSurfaces())if(x>=q.x&&x<=q.x+q.w&&q.y>=fromY)y=Math.min(y,q.y);for(const r of ramps)if(x>=r.x&&x<=r.x+r.w){const h=r.y+(r.endY-r.y)*(x-r.x)/r.w;if(h>=fromY)y=Math.min(y,h);}for(const b of bridges)if(x>=b.x&&x<=b.x+b.w){const h=bridgeY(b,x);if(h>=fromY)y=Math.min(y,h);}return y;}
function castThunderBullet(){if(state!=='playing'||bossIntro()||selectedCharacter!=='denden'||thunderBullet||thunderBulletCooldown>0||skillState.charging||thunderLocked())return;thunderBullet={age:0,x:player.x,y:player.y,dir:player.dir,next:0};thunderBulletCooldown=SUPPORT.bulletCooldown;}
function updateThunderBullet(dt){
 thunderBulletCooldown=Math.max(0,thunderBulletCooldown-dt);
 if(thunderBullet){const a=thunderBullet;a.age+=dt;while(a.next<3&&a.age>=.24+a.next*.13){const i=a.next++,x=a.x+a.dir*[95,225,395][i],y=supportFloorAt(x,a.y-55);if(Number.isFinite(y))thunderBursts.push({x,y,age:0,size:[115,175,245][i],damage:SUPPORT.bulletDamage[i],dir:a.dir,hit:new Set()});}if(a.age>=.72)thunderBullet=null;}
 for(const b of thunderBursts){b.age+=dt;if(b.age>.22)continue;for(const e of combatTargets()){if(e.death>=0||b.hit.has(e)||Math.abs(e.x-b.x)>b.size*.48+e.w/2||e.y<b.y-b.size||e.y-e.h>b.y+10)continue;b.hit.add(e);hitEnemy(e,b.damage,b.dir);if(e.type!=='crate'){launchEnemy(e,b.dir*180,-750,17);e.electric=1.3;e.stun=1.3;}}}
 thunderBursts=thunderBursts.filter(b=>b.age<.40);
}
function drawThunderBullet(){
 const a=thunderBullet;if(a&&a.age>=.12&&a.age<.27){const t=(a.age-.12)/.15,x=a.x+a.dir*(35+t*60)-camera,y=a.y-40+t*40;ctx.save();ctx.shadowBlur=16;ctx.shadowColor='#88eaff';ctx.fillStyle='#ffe970';ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.fill();ctx.restore();}
 for(const b of thunderBursts){const f=thunderBurstFrames[Math.min(thunderBurstFrames.length-1,Math.floor(b.age/.4*thunderBurstFrames.length))];if(!f)continue;ctx.save();ctx.globalAlpha=clamp((.4-b.age)/.08,0,1);ctx.drawImage(f,b.x-camera-b.size/2,b.y-b.size*.7,b.size,b.size*.7);ctx.restore();}
}
function drawDendenBulletPose(){const a=thunderBullet;if(!a)return false;const i=Math.min(7,Math.floor(a.age/.075)),img=dendenBulletFrames[i];if(!img)return false;const scale=CONFIG.playerHeight/(img.height*[.98,.96,.92,.96,.86,.92,.99,.96][i]);ctx.save();ctx.translate(player.x-camera,player.y);ctx.scale(player.dir,1);if(player.inv>0&&Math.floor(player.inv*16)%2===0)ctx.globalAlpha=.35;ctx.drawImage(img,-img.width*scale*.45,-CONFIG.playerHeight,img.width*scale,img.height*scale);ctx.restore();return true;}
function stunNearby(){for(const e of enemies)if(e.death<0&&Math.abs(e.x-player.x)<230&&Math.abs(e.y-player.y)<150){e.stun=Math.max(e.stun||0,.18);e.attackAge=-1;e.knock=0;}}
function drawEnemyStatus(e){if(e.death>=0&&!e.launch)return;const x=e.x-camera,y=e.y-e.h/2;if(e.electric>0){ctx.strokeStyle='#b5faff';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x-25+i*20,y-28);ctx.lineTo(x-32+i*20+Math.sin(elapsed*60+i)*5,y-8);ctx.lineTo(x-18+i*20,y+6);ctx.lineTo(x-25+i*20,y+27);ctx.stroke();}}else if(e.stun>0)for(let i=0;i<3;i++)text('✦',x+Math.cos(elapsed*7+i*2.1)*22,y-e.h*.6+Math.sin(elapsed*7+i*2.1)*5,13,'#fff198');}
function hitPink(dir,strong=false,damage=5){if(!pink?.enabled||pink.hp<=0||pink.hurtGrace>0)return;pink.hp=Math.max(0,pink.hp-damage);if(pink.hp===0){downPink();return;}pink.stun=strong?1.15:.75;pink.hurtGrace=.65;pink.knock=dir*(strong?440:300);pink.vy=strong?-420:-280;pink.grounded=false;pink.attack=null;pink.magic=null;pink.assist=0;pink.hopTarget=undefined;pink.cooldown=Math.max(pink.cooldown,.9);burst(pink.x,pink.y-35,10,'#e6b2ff');}
function pinkJump(velocity){if(!pink?.enabled||pink.hp<=0||pink.stun>0||pink.assist>0)return;pink.vy=velocity;pink.grounded=false;}
function commandPink(){if(state!=='playing'||bossIntro()||!pink?.enabled||pink.stun>0)return;if(elapsed-pink.lastTap<.32){pink.lastTap=-Infinity;pink.recall=0;activatePink();}else{pink.lastTap=elapsed;pink.recall=3;pink.assist=0;pink.attack=null;pink.magic=null;}}
function activatePink(){if(state!=='playing'||bossIntro()||!pink?.enabled||pink.stun>0||pink.assist>0)return;pink.assist=SUPPORT.assistDuration;pink.attack=null;pink.magic=null;pink.vx=0;}
function pinkLandingHeight(p,oldY){if(!pink?.enabled||pink.hp<=0||pink.assist<=0||!pink.grounded||p.vy<0)return Infinity;const y=pink.y-84;return Math.abs(p.x-pink.x)<48&&oldY<=y+1&&p.y>=y?y:Infinity;}
function bounceOnPink(){player.vy=-WORLD.trampolineSpeed;player.grounded=false;player.coyote=0;player.jumpsUsed=0;player.jumpAge=0;burst(player.x,player.y,14,'#ffaddc');}
function pinkSafeFloor(x,y){
 if(crumbles.some(c=>x>=c.x&&x<=c.x+c.w&&(c.gone||(c.timer>=0&&WORLD.collapseDelay-c.timer<.22))))return Infinity;
 return supportFloorAt(x,y-25);
}
function avoidPinkHazards(dt){
 const p=pink;if(p.hopTarget!==undefined){p.vx=clamp((p.hopTarget-p.x)/dt,-400,400);if(p.grounded&&Math.abs(p.x-p.hopTarget)<2){p.hopTarget=undefined;p.vx=0;}return;}
 if(!p.grounded||Math.abs(p.vx)<1)return;
 const dir=Math.sign(p.vx),ahead=p.x+dir*(22+Math.abs(p.vx)*.10),floor=pinkSafeFloor(ahead,p.y);
 if(Number.isFinite(floor)&&floor<=p.y+55)return;
 // Jump only if there is a reachable, intact landing; otherwise wait on this bank.
 for(let d=90;d<=250;d+=16){const x=p.x+dir*d,y=pinkSafeFloor(x,p.y);if(Number.isFinite(y)&&Math.abs(y-p.y)<60&&Number.isFinite(pinkSafeFloor(x+dir*24,p.y))&&Number.isFinite(pinkSafeFloor(x-dir*24,p.y))){p.hopTarget=x;p.vx=dir*400;pinkJump(-CONFIG.jumpForce);return;}}
 p.vx=0;p.attack=null;p.wanderDir=-dir;
}
function updatePink(dt){
 if(!pink?.enabled)return;if(pink.hp<=0){updateDownPink(dt);return;}const p=pink;p.age+=dt;p.stun=Math.max(0,p.stun-dt);p.hurtGrace=Math.max(0,p.hurtGrace-dt);p.knock*=Math.exp(-3*dt);p.magicCooldown=Math.max(0,(p.magicCooldown||0)-dt);p.wanderClock=(p.wanderClock||0)-dt;if(p.wanderClock<=0){p.wanderClock=1.8;p.wanderDir=-(p.wanderDir||-1);}p.recall=Math.max(0,(p.recall||0)-dt);p.cooldown=Math.max(0,p.cooldown-dt);p.assist=Math.max(0,p.assist-dt);
 if(Math.abs(p.x-player.x)>1100||p.y>H+160){let safeX=player.x-player.dir*240;for(let d=160;d>=0;d-=20){const x=clamp(player.x-player.dir*d,24,CONFIG.worldWidth-24);if(Number.isFinite(pinkSafeFloor(x,player.y))){safeX=x;break;}}p.x=clamp(safeX,24,CONFIG.worldWidth-24);p.y=player.y;p.hopTarget=undefined;p.vy=0;p.grounded=player.grounded;p.attack=null;}
 const target=enemies.filter(e=>e.death<0&&Math.abs(e.x-player.x)<620&&Math.abs(e.y-p.y)<90&&!e.dropping).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
 if(p.stun<=0&&p.assist<=0&&p.recall<=0&&!p.magic&&!p.attack&&p.magicCooldown===0&&target&&Math.abs(target.x-p.x)<190){p.magic={age:0,dir:Math.sign(target.x-p.x)||p.dir,cast:false};p.magicCooldown=4.5;}
 if(p.stun<=0&&p.assist<=0&&p.recall<=0&&!p.magic&&!p.attack&&p.cooldown===0&&target&&Math.abs(target.x-p.x)<95){p.attack={age:0,dir:Math.sign(target.x-p.x)||p.dir,hit:new Set()};p.cooldown=SUPPORT.pinkCooldown;}
 let goal=p.recall>0?player.x-player.dir*95:Math.abs(player.x-p.x)>300?player.x-player.dir*220:player.x-player.dir*150+(p.wanderDir||1)*45;if(target&&p.recall<=0&&p.assist<=0)goal=target.x-Math.sign(target.x-p.x)*45;
 const delta=goal-p.x;p.vx=p.stun>0?p.knock:p.assist>0||p.magic?0:p.attack?p.attack.dir*(p.attack.age>.12&&p.attack.age<.30?110:0):Math.abs(delta)>12?Math.sign(delta)*(Math.abs(delta)>180?440:running?CONFIG.dashSpeed:CONFIG.walkSpeed):0;
 if(p.stun<=0)avoidPinkHazards(dt);
 if(p.magic)p.dir=p.magic.dir;else if(p.attack)p.dir=p.attack.dir;else if(Math.abs(p.vx)>1)p.dir=Math.sign(p.vx);else p.dir=player.dir;
 if(p.stun<=0&&p.assist<=0&&!p.magic&&p.grounded&&(platforms.some(q=>q.solid&&q.type!=='stair'&&p.dir*(q.x+q.w/2-p.x)>0&&Math.abs(q.x+q.w/2-p.x)<q.w/2+25)))pinkJump(-CONFIG.jumpForce);
 const wasGrounded=p.grounded,oldX=p.x;let oldY=p.y;p.x=clamp(p.x+p.vx*dt,24,CONFIG.worldWidth-24);oldY=resolveStageSides(p,oldX,oldY,wasGrounded);p.vy+=CONFIG.gravity*dt;p.y+=p.vy*dt;p.grounded=false;const floor=stageLandingHeight(p,oldY,wasGrounded);
 if(p.vy>=0&&(p.y>=floor||(wasGrounded&&Math.abs(floor-oldY)<=26))){p.y=floor;p.vy=0;p.grounded=true;if(p.hopTarget!==undefined&&Math.abs(p.x-p.hopTarget)<35)p.hopTarget=undefined;}
 if(p.magic){const a=p.magic;a.age+=dt;if(a.age>=.24&&!a.cast){a.cast=true;const x=p.x+a.dir*90,y=supportFloorAt(x,p.y-50);anomaBursts.push({x,y:Number.isFinite(y)?y:p.y,age:0,dir:a.dir,hit:new Set()});}if(a.age>=.64)p.magic=null;}
 for(const f of anomaBursts){f.age+=dt;if(f.age>.25)continue;for(const e of enemies){if(e.death>=0||f.hit.has(e)||Math.abs(e.x-f.x)>90+e.w/2||e.y<f.y-145||e.y-e.h>f.y+10)continue;f.hit.add(e);hitEnemy(e,20,f.dir);launchEnemy(e,f.dir*140,-720,14);}}
 anomaBursts=anomaBursts.filter(f=>f.age<.4);
 if(p.attack){const a=p.attack;a.age+=dt;if(a.age>=.17&&a.age<.36)for(const e of enemies){if(e.death>=0||a.hit.has(e)||Math.abs(e.x-(p.x+a.dir*35))>70||Math.abs(e.y-p.y)>85)continue;a.hit.add(e);hitEnemy(e,SUPPORT.pinkDamage,a.dir);launchEnemy(e,a.dir*120,-100);}if(a.age>=.56)p.attack=null;}
}
function drawPink(){
 for(const a of anomaBursts){const f=anomaFrames[Math.min(3,Math.floor(a.age/.1))];if(f){const h=160,w=h*f.width/f.height;ctx.drawImage(f,a.x-camera-w/2,a.y-h,w,h);}}
 const button=$('pink-tap');if(!pink?.enabled){button.hidden=true;$('pink-revive').hidden=true;return;}const p=pink;if(p.hp<=0){drawDownPink();return;}const revive=$('pink-revive');revive.hidden=true;let i=p.magic?40+Math.min(7,Math.floor(p.magic.age/.08)):p.assist>0?24+Math.floor(p.age*14)%8:p.attack?8+Math.min(7,Math.floor(p.attack.age/.07)):!p.grounded?32+Math.min(7,Math.floor(p.age*12)%8):Math.abs(p.vx)>240?16+Math.floor(p.age*14)%8:Math.floor(p.age*10)%8;
 const img=pinkFrames[i];if(!img)return;const body=i>=24&&i<32?.85:i>=8&&i<16?.93:1,scale=76/(img.height*body),x=p.x-camera;ctx.save();ctx.translate(x,p.y);ctx.scale(p.dir,1);ctx.drawImage(img,-img.width*scale*.48,-img.height*scale,img.width*scale,img.height*scale);ctx.restore();
 rounded(x-29,p.y-87,58,6,2,'#43233e');rounded(x-28,p.y-86,56*p.hp/p.maxHP,4,1,'#ff93c8');text(`PINK ${p.hp}/${p.maxHP}`,x,p.y-94,10,'#ffe1f1');
 if(p.stun>0)for(let n=0;n<3;n++)text('✦',x+Math.cos(elapsed*7+n*2.1)*25,p.y-90+Math.sin(elapsed*7+n*2.1)*5,15,'#ffeda4');
 if(p.assist>0){const bx=clamp(x,135,W-135),by=Math.max(115,p.y-127);rounded(bx-126,by-25,252,34,9,'#fff1e4');text('お助けするであります！',bx,by-3,17,'#693e57');ctx.fillStyle='#fff1e4';ctx.beginPath();ctx.moveTo(bx-8,by+8);ctx.lineTo(bx+8,by+8);ctx.lineTo(x,by+22);ctx.fill();}
 button.hidden=state!=='playing'||bossIntro()||x<-60||x>W+60;button.style.left=`${(x-40)/W*100}%`;button.style.top=`${(p.y-cameraY-90)/H*100}%`;
}

function drawBubbleExplosion(ex){const t=ex.age/.65;ctx.save();ctx.globalAlpha=(1-t)*.65;ctx.strokeStyle='#bbf9ff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(ex.x-camera,ex.y,ex.r*(.2+t*.8),0,Math.PI*2);ctx.stroke();for(let i=0;i<18;i++){const a=i*2.399,x=ex.x-camera+Math.cos(a)*ex.r*t*.85,y=ex.y+Math.sin(a)*ex.r*t*.7,r=(12+i%5*6)*(1-t*.3);ctx.fillStyle=['#9cefff44','#f7bfff44','#fff0a044'][i%3];ctx.strokeStyle=['#b1f5ff','#ffd5f5','#fff4ba'][i%3];ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.strokeStyle='#ffffff';ctx.beginPath();ctx.arc(x,y,r*.68,3.4,4.7);ctx.stroke();}ctx.restore();}
// Connected silhouettes, sorted into rows: unlike rectangular trims, a frame can
// never retain a fragment of an adjacent character, even on irregular sheets.
function isolateCharacterBodies(img,count){
 const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const data=g.getImageData(0,0,c.width,c.height).data,w=c.width,h=c.height,labels=new Int32Array(w*h),queue=new Int32Array(w*h),parts=[];let id=0;
 for(let seed=0;seed<labels.length;seed++){if(labels[seed]||data[seed*4+3]<40)continue;id++;let n=1,read=0,l=w,r=0,t=h,b=0;queue[0]=seed;labels[seed]=id;
 while(read<n){const p=queue[read++],x=p%w,y=Math.floor(p/w);l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);for(const v of [p-1,p+1,p-w,p+w])if(v>=0&&v<labels.length&&!labels[v]&&Math.abs(v%w-x)<=1&&data[v*4+3]>=40){labels[v]=id;queue[n++]=v;}}
 if(n>300)parts.push({id,n,l,r,t,b});}
 const bodies=parts.sort((a,b)=>b.n-a.n).slice(0,count).sort((a,b)=>(a.t+a.b)-(b.t+b.b));if(bodies.length!==count)throw Error('Missing character silhouettes: '+img.src);
 const ordered=[];for(let i=0;i<count;i+=4)ordered.push(...bodies.slice(i,i+4).sort((a,b)=>a.l-b.l));
 return ordered.map(p=>{const f=document.createElement('canvas');f.width=p.r-p.l+1;f.height=p.b-p.t+1;const fg=f.getContext('2d'),out=fg.createImageData(f.width,f.height);for(let y=p.t;y<=p.b;y++)for(let x=p.l;x<=p.r;x++){const from=y*w+x;if(labels[from]===p.id)out.data.set(data.subarray(from*4,from*4+4),((y-p.t)*f.width+x-p.l)*4);}fg.putImageData(out,0,0);return{img:f,x:0,y:0,w:f.width,h:f.height,anchorX:f.width/2,sourceId:p.id};});
}
function hostileVictims(){return [player,...(pink?.enabled&&pink.hp>0?[pink]:[])];}
function enemyTarget(e){const victims=hostileVictims();return victims.reduce((a,b)=>Math.hypot(b.x-e.x,(b.y-e.y)*.7)<Math.hypot(a.x-e.x,(a.y-e.y)*.7)?b:a);}
function hurtAlly(target,source,damage){if(target===pink)hitPink(Math.sign(pink.x-source.x)||1,false,damage);else damagePlayer(source,damage);}
function hostileShotHit(x,y,nx,ny,r){return hostileVictims().find(p=>segmentHitsBox(x,y,nx,ny,p.x-17-r,p.y-(p===pink?70:65)-r,p.x+17+r,p.y+r));}
function hostileContact(e,damage){for(const p of hostileVictims())if(Math.abs(p.x-e.x)<e.w*.42+17&&p.y>e.y-e.h&&p.y-65<e.y)hurtAlly(p,e,damage);}
function downPink(){const p=pink;p.downAge=0;p.rescue=null;p.attack=null;p.magic=null;p.assist=0;p.recall=0;p.vx=0;p.knock=0;p.stun=0;p.vy=0;anomaBursts=[];}
function revivePink(){const p=pink;p.hp=p.maxHP;p.downAge=0;p.rescue=null;p.hurtGrace=2;p.stun=0;p.vy=0;p.knock=0;p.cooldown=1;p.magicCooldown=1.5;burst(p.x,p.y-28,14,'#ffb6de');$('pink-revive').hidden=true;}
function canRescuePink(){return pink?.enabled&&pink.hp<=0&&Math.abs(player.x-pink.x)<=SUPPORT.pinkRescueRange&&Math.abs(player.y-pink.y)<90&&state==='playing'&&!bossIntro();}
function beginPinkRescue(){if(canRescuePink()&&pink.rescue===null)pink.rescue={age:0};}
function updateDownPink(dt){const p=pink;p.downAge+=dt;const oldY=p.y;p.vy+=CONFIG.gravity*dt;p.y+=p.vy*dt;const floor=stageLandingHeight(p,oldY,false);if(p.y>=floor){p.y=floor;p.vy=0;p.grounded=true;}
 if(p.y>950){p.x=checkpoint.x;p.y=checkpoint.y;p.vy=0;}
 if(p.rescue){if(!canRescuePink())p.rescue=null;else{p.rescue.age+=dt;if(p.rescue.age>=SUPPORT.pinkRescueTime){revivePink();return;}}}
 if(p.downAge>=SUPPORT.pinkAutoRevive)revivePink();
}
function drawDownPink(){const p=pink,f=pinkDownFrames[Math.min(15,Math.floor(p.downAge/.065))],x=p.x-camera;ctx.save();ctx.translate(x,p.y);ctx.scale(p.dir,1);ctx.imageSmoothingEnabled=false;if(f)ctx.drawImage(f.img,-f.w*f.scale/2,-f.h*f.scale,f.w*f.scale,f.h*f.scale);ctx.restore();text(`気絶 ${Math.ceil(Math.max(0,10-p.downAge))}s`,x,p.y-58,13,'#ffd0ea');$('pink-tap').hidden=true;const button=$('pink-revive');button.hidden=!canRescuePink()||x<0||x>W;button.style.left=`${x/W*100}%`;button.style.top=`${(p.y-cameraY-65)/H*100}%`;button.textContent=p.rescue?`復活中 ${Math.max(0,2-p.rescue.age).toFixed(1)}秒`:'復活（2秒）';button.disabled=!!p.rescue;}
document.getElementById('pink-revive').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();beginPinkRescue();});

document.getElementById('pink-revive').addEventListener('click',beginPinkRescue);
