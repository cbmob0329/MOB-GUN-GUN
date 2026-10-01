const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));fs.readFile(f,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':f.endsWith('.js')?'text/javascript':f.endsWith('.html')?'text/html':f.endsWith('.css')?'text/css':'image/png'});res.end(e?'missing':b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,channel:'msedge'});
try{for(const mobile of [false,true]){const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}`);await page.waitForFunction(()=>state==='ready',null,{timeout:60000});
const result=await page.evaluate(()=>{
 const check=(v,m)=>{if(!v)throw Error(m);},step=n=>{for(let i=0;i<n;i++)tick(1/120);};
 for(const name of ['walk','attack','teleport','special','effects'])check(shartyArt[name].length===16,'16 isolated frames '+name);
 areaIndex=1;reset();state='playing';pink.enabled=false;player.inv=100;
 const room=shartyEncounter,e=room.enemy;check(e.h>MIIRA.height&&e.h<MIIRA.height*1.2,'slightly bigger than mummy');
 player.x=SHARTY.trigger;step(1);check(room.state==='fighting','encounter activates');
 player.x=6300;step(1);check(player.x<=SHARTY.right-20&&state==='playing','cannot skip midboss');
 player.x=e.x-170;player.y=548;e.x=5750;startShartyAction(e,'attack');step(55);check(shartyShots.some(s=>s.kind==='wave'),'normal attack emits wave');
 player.inv=0;player.hp=50;shartyShots=[];e.action=null;e.cooldown=100;player.x=e.x-100;shartyProjectile(e);step(30);check(player.hp===45,'normal wave damages player once');
 player.inv=100;shartyShots=[];startShartyAction(e,'teleport');e.action.targetX=SHARTY.left+150;const old=e.x;step(50);check(e.x===old,'teleport windup');step(15);check(e.x!==old&&e.x>=SHARTY.left&&e.x<=SHARTY.right,'teleport arrives within arena');step(75);
 startShartyAction(e,'special');shartyShots=[];step(150);check(shartyShots.filter(s=>s.kind==='orb').length===2,'special emits sequential orbs');step(20);check(shartyShots.filter(s=>s.kind==='orb').length===3,'third orb');
 shartyShots=[];e.action=null;e.cooldown=100;e.jumpClock=0;e.grounded=true;e.y=548;step(20);check(e.y<548&&e.vy<0,'midboss jumps');step(100);check(e.y===548,'lands stably');
 // Summon release and player launch attacks must not strand the new midboss.
 launchEnemy(e,150,-420);step(130);check(!e.launch&&Number.isFinite(e.y),'launch recovers');
 startShartyAction(e,'special');step(120);hitEnemy(e,9999);step(1);check(room.state==='cleared'&&!shartyShots.length,'death opens encounter and clears dangerous shots');
 step(100);check(!enemies.includes(e),'death animation completes');player.x=CONFIG.worldWidth-179;finishGrassArea();check(state==='areaClear','goal after midboss');
 reset();check(shartyEncounter.state==='waiting'&&shartyEncounter.enemy.hp===SHARTY.hp&&!shartyShots.length,'retry fresh');
 state='playing';pink.enabled=false;player.inv=100;player.x=5500;updateShartyWorld(0);const actions=new Set();let jumped=false;
 for(let i=0;i<2400;i++){tick(1/120);const boss=shartyEncounter.enemy;if(boss.action)actions.add(boss.action.type);if(boss.y<520)jumped=true;}
 check(['attack','teleport','special'].every(x=>actions.has(x))&&jumped,'natural AI cycles all attacks and jumps');
 return {animations:4,frames:64,effects:16,normalDamage:5,teleport:true,orbCount:3,jump:true,gate:true,retry:true};
});
await page.evaluate(()=>{areaIndex=1;reset();state='playing';pink.enabled=false;player.x=5500;camera=5000;cameraY=0;shartyEncounter.state='fighting';const e=shartyEncounter.enemy;e.x=5730;startShartyAction(e,'special');e.action.age=.7;document.getElementById('overlay').hidden=true;draw();drawShartyEffects();state='paused';});
await page.screenshot({path:path.join(root,'tests',`sharty-${mobile?'mobile':'desktop'}.png`)});

if(!mobile){const atlas=await page.evaluate(()=>{
 const c=document.createElement('canvas');c.width=1024;c.height=1280;const g=c.getContext('2d');g.fillStyle='#1b2b38';g.fillRect(0,0,c.width,c.height);g.imageSmoothingEnabled=false;
 for(const [group,name] of ['walk','attack','teleport','special','effects'].entries())for(const [i,f] of shartyArt[name].entries()){
  const x=(i%8)*128,y=(group*2+Math.floor(i/8))*128,s=name==='effects'?82/Math.max(f.w,f.h):f.scale;
  g.fillStyle='#91a5b4';g.font='10px monospace';g.fillText(name+' '+(i+1),x+7,y+12);g.fillStyle='#344854';g.fillRect(x+4,y+114,120,1);
  g.drawImage(f.img,x+64-(name==='effects'?f.w/2:f.anchorX)*s,y+114-f.h*s,f.w*s,f.h*s);
 }
 return c.toDataURL().split(',')[1];});fs.writeFileSync(path.join(root,'tests/sharty-frames.png'),Buffer.from(atlas,'base64'));}
assert.deepEqual(errors,[]);console.log(mobile?'MOBILE':'DESKTOP',result);await context.close();}}
finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
