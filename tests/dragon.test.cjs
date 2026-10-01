const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));fs.readFile(f,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':f.endsWith('.js')?'text/javascript':f.endsWith('.html')?'text/html':f.endsWith('.css')?'text/css':'image/png'});res.end(e?'missing':b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,channel:'msedge'});
try{for(const mobile of [false,true]){const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}`);await page.waitForFunction(()=>state==='ready',null,{timeout:60000});
await page.locator('[data-boss="miramob"]').click();assert.equal(await page.evaluate(()=>selectedBoss),'miramob');await page.locator('[data-boss="dragon"]').click();
await page.screenshot({path:path.join(root,`tests/dragon-title-${mobile}.png`)});
const result=await page.evaluate(()=>{
 const check=(v,m)=>{if(!v)throw Error(m);},step=n=>{for(let i=0;i<n;i++)tick(1/120);};
 check(DRAGON.animations.every(n=>dragonArt[n].length===16),'all ten 16-frame sheets');
 areaIndex=3;selectedBoss='dragon';selectedCharacter='denden';reset();state='playing';pink.enabled=false;player.inv=100;
 player.x=bossRoom.portalX;step(410);check(bossRoom.state==='fighting'&&bossRoom.boss.type==='dragon','real dragon entry');
 const e=bossRoom.boss;check(e.h>CONFIG.playerHeight*1.8,'large collider');
 const setup=()=>{dragonShots=[];dragonEffects=[];e.x=6000;e.y=548;e.vy=0;e.grounded=true;e.action=null;e.think=100;e.stun=0;player.x=5750;player.y=548;player.vy=0;player.knock=0;player.inv=100;player.hp=50;player.grounded=true;keys.clear();axis=0;};
 setup();e.think=100;const ox=e.x;step(60);check(e.x<ox,'walk moves');
 setup();dragonStart(e,'hover');step(100);check(e.y<390&&dragonPose(e).name==='hover','hover rises');
 setup();dragonStart(e,'dash');const x=e.x;step(60);check(e.x===x,'dash telegraph holds');step(40);check(e.x<x-80,'dash rush');
 setup();player.x=e.x-150;player.inv=0;dragonStart(e,'attack');step(62);check(player.hp===50-DRAGON.claw&&dragonEffects.some(f=>f.kind==='claw'),'normal hit and effect');
 setup();player.inv=0;dragonStart(e,'breath');step(85);check(player.hp===50,'breath warning is safe');step(12);check(player.hp===50-DRAGON.breath,'breath damages in visible band');
 setup();player.inv=0;player.y=300;dragonCone(e,330,105,DRAGON.breath);check(player.hp===50,'jump above breath avoids it');
 setup();dragonStart(e,'orb');step(157);check(e.action.next===3&&dragonShots.length>0,'three fireballs emitted');
 setup();player.inv=0;dragonShots.push({x:player.x-80,y:515,vx:1000,vy:0,r:23,age:0,life:1,damage:6});step(10);check(player.hp===44&&!dragonShots.length,'swept projectile hit');
 setup();dragonStart(e,'dive');const target=e.action.targetX;player.x+=300;step(175);check(e.action.landed&&e.x===target&&e.y===548,'dive keeps telegraphed target and lands');check(dragonEffects.some(f=>f.kind==='impact'),'stomp effect');
 setup();player.inv=0;dragonStart(e,'flame');step(190);check(player.hp===50,'ultimate windup safe');step(15);check(player.hp===42,'ultimate damage');
 setup();dragonStart(e,'orb');step(90);const age=e.action.age;state='paused';step(200);check(e.action.age===age,'pause freezes boss and effects');state='playing';
 // Summon roof expiry must use the large boss's own physics, without .launch assumptions.
 setup();nyoroSummon={x:e.x-120,w:240,y:300,h:248,base:548,age:4};e.y=summonRoofY(e.x);e.summonRider=true;releaseSummon(nyoroSummon);nyoroSummon=null;step(160);check(Number.isFinite(e.y)&&e.y===548&&!e.launch,'summon release recovers');
 launchEnemy(e,500,-500);check(!e.launch,'large boss cannot be thrown off arena');
 setup();e.think=0;e.sequence=0;const seen=new Set();for(let i=0;i<3600;i++){tick(1/120);if(e.action)seen.add(e.action.type);}check(['attack','hover','dive','dash','breath','orb','flame'].every(n=>seen.has(n)),'natural AI uses all seven actions');
 setup();player.x=CONFIG.worldWidth-179;finishGrassArea();check(state==='playing','boss gates clear');player.x=5750;dragonFireball(e);hitEnemy(e,99999);step(1);check(bossRoom.state==='opening'&&!dragonShots.length,'death removes hostile projectiles');step(100);check(enemies.includes(e)&&dragonPose(e).name==='defeat','defeat sequence remains visible');step(190);check(!enemies.includes(e)&&bossRoom.state==='cleared','full defeat then gate opens');
 player.x=CONFIG.worldWidth-179;finishGrassArea();check(state==='clear','dragon clear');startGrassArea();check(areaIndex===0&&!dragonShots.length&&!bossRoom,'retry clean');
 return {bodyFrames:144,effectFrames:16,actions:[...seen],telegraphs:true,hits:true,summon:true,defeat:true,retry:true};
});
for(const pose of ['breath','hover','defeat']){
 await page.evaluate(pose=>{areaIndex=3;reset();state='playing';pink.enabled=false;const e=makeDragon(5980);bossRoom.state='fighting';bossRoom.boss=e;enemies=[e];camera=bossRoom.camera;cameraY=0;player.x=5500;player.inv=10;dragonStart(e,pose==='defeat'?'attack':pose);if(pose==='defeat')e.death=1.4;else e.action.age=pose==='breath'?1.1:.9;if(pose==='hover')e.y=365;document.getElementById('overlay').hidden=true;draw();drawDragonEffects();drawBossRoom();state='paused';},pose);
 await page.screenshot({path:path.join(root,`tests/dragon-${pose}-${mobile}.png`)});
}
if(!mobile){const data=await page.evaluate(()=>{
 const c=document.createElement('canvas');c.width=1280;c.height=3200;const g=c.getContext('2d');g.fillStyle='#25343d';g.fillRect(0,0,c.width,c.height);g.imageSmoothingEnabled=false;
 for(const [group,name] of DRAGON.animations.entries())for(const [i,f] of dragonArt[name].entries()){
  const x=(i%8)*160,y=(group*2+Math.floor(i/8))*160,s=name==='effects'?120/Math.max(f.w,f.h):f.scale*.53;
  g.fillStyle='#bdc8ce';g.font='11px monospace';g.fillText(name+' '+(i+1),x+5,y+14);g.fillStyle='#63717a';g.fillRect(x+5,y+151,150,1);g.drawImage(f.img,x+90-(name==='effects'?f.w/2:f.anchorX)*s,y+150-f.h*s,f.w*s,f.h*s);
 }return c.toDataURL().split(',')[1];});fs.writeFileSync(path.join(root,'tests/dragon-frames.png'),Buffer.from(data,'base64'));}
assert.deepEqual(errors,[]);console.log(mobile?'MOBILE':'DESKTOP',result);await context.close();}}
finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
