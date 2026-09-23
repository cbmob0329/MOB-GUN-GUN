'use strict';
const giantThunderFrames=[];
let giantThunder=null,groundBolts=[];
async function loadGiantThunder(){await Promise.all([86,87,88,89].map(async(n,i)=>{giantThunderFrames[i]=await trimFrame(`skill/${n}.png`);}));}
function startGiantThunder(){const x=clamp(player.x+player.dir*210,40,CONFIG.worldWidth-40),floor=supportFloorAt(x,player.y-1);giantThunder={x,y:-400,floor:Number.isFinite(floor)?floor:548,age:0,landed:false,groundAge:0,waveClock:0,pulse:0};groundBolts=[];}
function thunderArea(x,y,r,damage,stun){for(const e of combatTargets()){if(e.death>=0||Math.abs(e.x-x)>r+e.w/2||e.y<y-360||e.y-e.h>y+20)continue;hitEnemy(e,damage,Math.sign(e.x-x)||player.dir);if(e.type!=='crate'){e.electric=Math.max(e.electric||0,stun);e.stun=Math.max(e.stun||0,e.type==='miramob'?Math.min(.25,stun):stun);e.attackAge=-1;}}}
function updateGiantThunder(dt){const g=giantThunder;if(g){g.age+=dt;
 if(!g.landed){g.y=Math.min(g.floor,g.y+1900*dt);if(g.y===g.floor){g.landed=true;thunderArea(g.x,g.floor,170,60,1.2);burst(g.x,g.floor-20,40,'#c6f9ff');}}
 else{g.groundAge+=dt;g.waveClock-=dt;g.pulse+=dt;if(g.pulse>=.4){g.pulse-=.4;thunderArea(g.x,g.floor,100,12,.35);}if(g.waveClock<=0){g.waveClock+=.18;for(const dir of [-1,1])groundBolts.push({x:g.x,y:g.floor,dir,age:0,hit:new Set()});}if(g.groundAge>=2){giantThunder=null;groundBolts=[];}}
 }
 for(const b of groundBolts){b.age+=dt;b.x+=b.dir*500*dt;const y=supportFloorAt(b.x,b.y-35);if(Number.isFinite(y))b.y=y;for(const e of combatTargets()){if(e.death>=0||b.hit.has(e)||Math.abs(e.x-b.x)>55+e.w/2||e.y<b.y-115||e.y-e.h>b.y+15)continue;b.hit.add(e);if((e.groundBoltNext||0)>elapsed)continue;e.groundBoltNext=elapsed+.35;hitEnemy(e,12,b.dir);if(e.type!=='crate'){e.electric=.45;e.stun=e.type==='miramob'?.15:.35;}}}groundBolts=groundBolts.filter(b=>b.age<.75);
}
function drawGiantThunder(){const g=giantThunder;if(g){const i=g.landed?1+Math.floor(g.groundAge*12)%3:0,f=giantThunderFrames[i];if(f){const h=360,w=h*f.width/f.height;ctx.save();ctx.shadowColor='#93f5ff';ctx.shadowBlur=22;ctx.drawImage(f,g.x-camera-w/2,g.y-h,w,h);ctx.restore();}}
 for(const b of groundBolts){const f=thunderBurstFrames[Math.floor(b.age*16)%4];if(!f)continue;ctx.save();ctx.globalAlpha=Math.min(1,(.75-b.age)*5);ctx.drawImage(f,b.x-camera-70,b.y-120,140,120);ctx.restore();}
}
