const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));fs.readFile(f,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':f.endsWith('.js')?'text/javascript':f.endsWith('.html')?'text/html':f.endsWith('.css')?'text/css':'image/png'});res.end(e?'missing':b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,channel:'msedge'});
try{for(const mobile of [false,true]){const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}`);await page.waitForFunction(()=>state==='ready',null,{timeout:60000});
const result=await page.evaluate(()=>{
 selectedBoss='miramob';const check=(v,m)=>{if(!v)throw Error(m);},step=n=>{for(let i=0;i<n;i++)tick(1/120);};
 areaIndex=3;selectedCharacter='nyoro';reset();state='playing';pink.enabled=false;player.inv=100;
 player.x=bossRoom.portalX;step(410);check(bossRoom.state==='fighting','real boss entry');
 const boss=bossRoom.boss;player.x=boss.x-30;castNyoro(2);step(190);check(nyoroSummon,'summon appeared');
 // Recreate expiry while the launch-immune boss is riding the roof.
 boss.x=nyoroSummon.x+120;boss.y=summonRoofY(boss.x);boss.summonRider=true;boss.vy=0;nyoroSummon.age=3.999;
 updateSummon(1/120);check(!nyoroSummon,'summon expired without exception');check(!boss.launch,'boss keeps its own movement physics');
 step(900);check(Number.isFinite(boss.y)&&boss.y<=548,'boss returns to arena floor');check(elapsed>10,'simulation continued');
 // Ordinary enemies still bounce away from the disappearing summon.
 nyoroSummon={x:player.x-120,w:240,y:300,h:248,base:548,age:4};const rider=spawnGrassEnemy('lime',player.x);rider.y=summonRoofY(rider.x);rider.summonRider=true;releaseSummon(nyoroSummon);check(rider.launch?.vy===-420&&rider.launch.floor===548,'ordinary enemy release preserved');
 for(const dir of [1,-1]){
  areaIndex=0;selectedCharacter='tetsu';reset();state='playing';pink.enabled=false;props=[];crates=[];platforms=[];enemies=[];player.x=500;player.dir=dir;
  const target={type:'tank',x:500+dir*80,y:548,home:500+dir*80,dir:-dir,hp:1000,maxHP:1000,w:62,h:65,flash:0,knock:0,death:-1,range:0,phase:0,stun:100};enemies.push(target);
  tetsuAttack();tetsuAttack();let extra=false,newPose=false;for(let i=0;i<190;i++){tick(1/120);if(tetsuAction?.hit.has('extra'))extra=true;if(tetsuFrames.FINISH.includes(tetsuPose())){newPose=true;draw();drawTetsuEffects();}}
  check(extra&&newPose,'extra strike and new sprite used '+dir);check(target.hp===926,'exactly 18+12+16+28 damage '+dir+' got '+target.hp);check(!tetsuAction,'combo recovers');
 }
 check(tetsuFrames.FINISH.length===4&&tetsuFrames.FINISH_FX.length===4,'8 new atlas frames');
 return {bossRelease:true,comboDamage:74,comboDirections:2};
});
const before=await page.evaluate(()=>elapsed);await page.waitForFunction(t=>elapsed>t+.05,before);
await page.evaluate(()=>{selectedCharacter='tetsu';reset();state='playing';pink.enabled=false;player.x=500;camera=100;player.dir=1;startTetsuAction('combo');tetsuAction.landedAt=0;tetsuAction.age=.29;document.getElementById('overlay').hidden=true;draw();drawTetsuEffects();state='paused';});
await page.screenshot({path:path.join(process.env.TEMP,`tetsu-finisher-${mobile}.png`)});
assert.deepEqual(errors,[]);console.log(mobile?'MOBILE':'DESKTOP',result);await context.close();}}
finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
