'use strict';
const SUPPORT=Object.freeze({pinkDamage:10,pinkCooldown:1.15,assistDuration:2,bulletCooldown:10,bulletDamage:[36,48,60]});
const pinkFrames=[],dendenBulletFrames=[],thunderBurstFrames=[];
let pink=null,thunderBullet=null,thunderBulletCooldown=0,thunderBursts=[];
async function trimFrame(path){
 const img=await loadImage(path),c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const data=g.getImageData(0,0,c.width,c.height).data;let l=c.width,t=c.height,r=0,b=0;
 for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(data[(y*c.width+x)*4+3]>8){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x+1);b=Math.max(b,y+1);}
 if(r<=l||b<=t)throw Error(`Empty sprite: ${path}`);const out=document.createElement('canvas');out.width=r-l;out.height=b-t;out.getContext('2d').drawImage(img,l,t,out.width,out.height,0,0,out.width,out.height);return out;
}
async function loadSupport(){await Promise.all([
 ...Array.from({length:40},(_,i)=>trimFrame(`pink/${String(i+1).padStart(2,'0')}.png`).then(img=>pinkFrames[i]=img)),
 ...Array.from({length:8},(_,i)=>trimFrame(`denden/${String(i+33).padStart(3,'0')}.png`).then(img=>dendenBulletFrames[i]=img)),
 ...Array.from({length:4},(_,i)=>trimFrame(`skill/${String(i+33).padStart(3,'0')}.png`).then(img=>thunderBurstFrames[i]=img))
]);}
function resetSupport(){pink={x:player.x-65,y:player.y,vx:0,vy:0,dir:1,grounded:true,enabled:true,age:0,cooldown:0,attack:null,assist:0};thunderBullet=null;thunderBulletCooldown=0;thunderBursts=[];}
function supportFloorAt(x,fromY){let y=groundAt(x);for(const q of stageSurfaces())if(x>=q.x&&x<=q.x+q.w&&q.y>=fromY)y=Math.min(y,q.y);for(const r of ramps)if(x>=r.x&&x<=r.x+r.w){const h=r.y+(r.endY-r.y)*(x-r.x)/r.w;if(h>=fromY)y=Math.min(y,h);}for(const b of bridges)if(x>=b.x&&x<=b.x+b.w){const h=bridgeY(b,x);if(h>=fromY)y=Math.min(y,h);}return y;}
function castThunderBullet(){if(state!=='playing'||selectedCharacter!=='denden'||thunderBullet||thunderBulletCooldown>0||skillState.charging||thunderLocked())return;thunderBullet={age:0,x:player.x,y:player.y,dir:player.dir,next:0};thunderBulletCooldown=SUPPORT.bulletCooldown;}
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
function pinkJump(velocity){if(!pink?.enabled||pink.assist>0)return;pink.vy=velocity;pink.grounded=false;}
function activatePink(){if(state!=='playing'||!pink?.enabled||pink.assist>0)return;pink.assist=SUPPORT.assistDuration;pink.attack=null;pink.vx=0;}
function pinkLandingHeight(p,oldY){if(!pink?.enabled||pink.assist<=0||!pink.grounded||p.vy<0)return Infinity;const y=pink.y-84;return Math.abs(p.x-pink.x)<48&&oldY<=y+1&&p.y>=y?y:Infinity;}
function bounceOnPink(){player.vy=-WORLD.trampolineSpeed;player.grounded=false;player.coyote=0;player.jumpsUsed=0;player.jumpAge=0;burst(player.x,player.y,14,'#ffaddc');}
function updatePink(dt){
 if(!pink?.enabled)return;const p=pink;p.age+=dt;p.cooldown=Math.max(0,p.cooldown-dt);p.assist=Math.max(0,p.assist-dt);
 if(Math.abs(p.x-player.x)>700||p.y>H+160){p.x=player.x-player.dir*65;p.y=player.y;p.vy=0;p.grounded=player.grounded;p.attack=null;}
 const target=enemies.filter(e=>e.death<0&&Math.abs(e.x-player.x)<260&&Math.abs(e.y-p.y)<90&&!e.dropping).sort((a,b)=>Math.abs(a.x-player.x)-Math.abs(b.x-player.x))[0];
 if(p.assist<=0&&!p.attack&&p.cooldown===0&&target&&Math.abs(target.x-p.x)<95){p.attack={age:0,dir:Math.sign(target.x-p.x)||p.dir,hit:new Set()};p.cooldown=SUPPORT.pinkCooldown;}
 let goal=player.x-player.dir*65;if(target&&Math.abs(target.x-p.x)<190&&Math.abs(player.x-p.x)<180&&p.assist<=0)goal=target.x-Math.sign(target.x-p.x)*45;
 const delta=goal-p.x;p.vx=p.assist>0?0:p.attack?p.attack.dir*(p.attack.age>.12&&p.attack.age<.30?110:0):Math.abs(delta)>12?Math.sign(delta)*(Math.abs(delta)>180?440:running?CONFIG.dashSpeed:CONFIG.walkSpeed):0;
 if(p.attack)p.dir=p.attack.dir;else if(Math.abs(p.vx)>1)p.dir=Math.sign(p.vx);else p.dir=player.dir;
 if(p.assist<=0&&p.grounded&&(player.y<p.y-45||platforms.some(q=>q.solid&&q.type!=='stair'&&p.dir*(q.x+q.w/2-p.x)>0&&Math.abs(q.x+q.w/2-p.x)<q.w/2+25)))pinkJump(-CONFIG.jumpForce);
 const wasGrounded=p.grounded,oldX=p.x;let oldY=p.y;p.x=clamp(p.x+p.vx*dt,24,CONFIG.worldWidth-24);oldY=resolveStageSides(p,oldX,oldY,wasGrounded);p.vy+=CONFIG.gravity*dt;p.y+=p.vy*dt;p.grounded=false;const floor=stageLandingHeight(p,oldY,wasGrounded);
 if(p.vy>=0&&(p.y>=floor||(wasGrounded&&Math.abs(floor-oldY)<=26))){p.y=floor;p.vy=0;p.grounded=true;}
 if(p.attack){const a=p.attack;a.age+=dt;if(a.age>=.17&&a.age<.36)for(const e of enemies){if(e.death>=0||a.hit.has(e)||Math.abs(e.x-(p.x+a.dir*35))>70||Math.abs(e.y-p.y)>85)continue;a.hit.add(e);hitEnemy(e,SUPPORT.pinkDamage,a.dir);launchEnemy(e,a.dir*120,-100);}if(a.age>=.56)p.attack=null;}
}
function drawPink(){
 const button=$('pink-tap');if(!pink?.enabled){button.hidden=true;return;}const p=pink;let i=p.assist>0?24+Math.floor(p.age*14)%8:p.attack?8+Math.min(7,Math.floor(p.attack.age/.07)):!p.grounded?32+Math.min(7,Math.floor(p.age*12)%8):Math.abs(p.vx)>240?16+Math.floor(p.age*14)%8:Math.floor(p.age*10)%8;
 const img=pinkFrames[i];if(!img)return;const body=i>=24&&i<32?.85:i>=8&&i<16?.93:1,scale=76/(img.height*body),x=p.x-camera;ctx.save();ctx.translate(x,p.y);ctx.scale(p.dir,1);ctx.drawImage(img,-img.width*scale*.48,-img.height*scale,img.width*scale,img.height*scale);ctx.restore();
 if(p.assist>0){const bx=clamp(x,135,W-135),by=Math.max(115,p.y-127);rounded(bx-126,by-25,252,34,9,'#fff1e4');text('お助けするであります！',bx,by-3,17,'#693e57');ctx.fillStyle='#fff1e4';ctx.beginPath();ctx.moveTo(bx-8,by+8);ctx.lineTo(bx+8,by+8);ctx.lineTo(x,by+22);ctx.fill();}
 button.hidden=state!=='playing'||x<-60||x>W+60;button.style.left=`${(x-40)/W*100}%`;button.style.top=`${(p.y-90)/H*100}%`;
}

function drawBubbleExplosion(ex){const t=ex.age/.65;ctx.save();ctx.globalAlpha=(1-t)*.65;ctx.strokeStyle='#bbf9ff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(ex.x-camera,ex.y,ex.r*(.2+t*.8),0,Math.PI*2);ctx.stroke();for(let i=0;i<18;i++){const a=i*2.399,x=ex.x-camera+Math.cos(a)*ex.r*t*.85,y=ex.y+Math.sin(a)*ex.r*t*.7,r=(12+i%5*6)*(1-t*.3);ctx.fillStyle=['#9cefff44','#f7bfff44','#fff0a044'][i%3];ctx.strokeStyle=['#b1f5ff','#ffd5f5','#fff4ba'][i%3];ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.strokeStyle='#ffffff';ctx.beginPath();ctx.arc(x,y,r*.68,3.4,4.7);ctx.stroke();}ctx.restore();}
