// npm install --no-save playwright, then: node tests/game.test.cjs
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'})[path.extname(file)]||'text/plain'});res.end(e?'Not found':b);});});
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
 try{for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}`);await page.waitForFunction(()=>state==='ready');await page.locator('#start').click();
  const results=await page.evaluate(()=>{
   const check=(v,m)=>{if(!v)throw Error(m);},step=n=>{for(let i=0;i<n;i++)tick(1/120);};
   const setup=(character='denden')=>{selectedCharacter=character;reset();state='playing';enemies=[];updateCharacterUI();};
   setup();keys.add('KeyJ');let shots=0,lastAge=10,reloads=0;for(let i=0;i<175;i++){tick(1/120);if(player.shotAge<lastAge)shots++;lastAge=player.shotAge;}check(shots===8&&player.ammo===0&&player.reload>0,'eight rounds then reload');keys.clear();const reload=player.reload;pause();step(120);check(player.reload===reload,'pause reload');resume();step(60);check(player.ammo===8&&player.reload===0,'automatic .5 second reload while released');check(CONFIG.shootInterval===.2,'slightly slower cadence');
   setup('tetsu');platforms=[];player.x=500;player.y=300;player.grounded=false;startTetsuAction('air');step(10);check(player.vy>=1150,'fast downward attack');step(30);check(player.grounded&&worldEffects.some(f=>f.kind==='impact'),'landing burst');step(60);check(!tetsuAction,'dive ends after landing');
   setup('tetsu');platforms=[];player.x=500;const e={type:'tank',x:585,y:548,home:585,dir:-1,hp:1000,maxHP:1000,w:62,h:65,flash:0,knock:0,death:-1,range:1000,phase:0};enemies=[e];player.inv=10;startTetsuAction('combo');step(40);check(e.hp===988,'combo first hit 12');check(player.x>515&&player.x<540,'combo moves forward');step(100);check(e.hp===972&&e.launch===null,'combo final hit 16 and recovery');
   setup();player.x=3560;player.y=548;keys.add('KeyD');keys.add('ShiftLeft');step(220);check(player.x>4140&&player.hp===50,'cross suspension bridge');
   setup();player.x=4980;keys.add('KeyD');keys.add('ShiftLeft');let high=548;for(let i=0;i<350;i++){tick(1/120);high=Math.min(high,player.y);}check(high<=421&&player.x>5900&&player.grounded&&player.hp===50,'slope and stairs without jumping');keys.delete('KeyD');keys.add('KeyA');step(360);check(player.x<5000&&player.grounded&&player.hp===50,'stairs and slope in reverse');
   setup();player.x=6540;step(1);check(player.vy===-WORLD.trampolineSpeed&&!player.grounded,'trampoline launch');step(60);check(player.y<260,'trampoline height');
   setup();player.x=7630;player.y=532;player.grounded=true;step(62);check(crumbles[0].gone,'floor collapses');step(100);check(player.hp===25&&player.x===140&&player.grounded,'fall halves HP and respawns');player.hp=1;player.y=950;tick(1/120);check(player.hp===1&&state==='playing','fall at one HP remains playable');
   setup();player.x=7560;keys.add('KeyD');keys.add('ShiftLeft');step(230);check(player.x>8140&&player.hp===50,'crumble can be crossed');
   setup();player.x=600;player.hp=40;keys.add('KeyJ');step(30);keys.clear();check(crates[0].death===0&&dorayaki.length===1,'bullet breaks crate, single drop');player.x=650;step(100);check(player.hp===48&&dorayaki.length===0,'dorayaki heals 8 once');
   setup('tetsu');player.x=585;player.hp=48;startTetsuAction('normal');step(45);check(crates[0].death===0,'melee breaks crate');player.x=650;step(100);check(player.hp===50,'healing capped at max');
   setup();const a=arenas[0];player.x=a.x+200;step(1);check(a.state==='closing','arena entrance triggers');keys.add('KeyA');keys.add('ShiftLeft');step(90);check(player.x>=a.x+65&&a.spawned>0,'left gate blocks and spawns');keys.clear();player.x=a.right-66;keys.add('KeyD');step(40);check(player.x<=a.right-65&&a.state==='fighting','right gate blocks');keys.clear();
   const frozen=a.age;pause();step(80);check(a.age===frozen,'arena pauses');resume();player.inv=100;const sides=new Set();for(let i=0;i<1800&&a.state!=='cleared';i++){for(const enemy of enemies){if(enemy.arenaId===a.id){sides.add(enemy.dir);hitEnemy(enemy,1000);}}tick(1/120);}check(a.state==='cleared'&&a.spawned===24&&sides.size===2,'three waves from both sides then unlock');player.x=a.right-70;keys.add('KeyD');step(90);check(player.x>a.right,'exit after all waves');
   setup();check(arenas.every(a=>a.state==='idle')&&crumbles.every(c=>!c.gone)&&crates.every(c=>c.death<0)&&!dorayaki.length,'retry resets stage');
   return {ammo:8,reload:.5,shotInterval:.2,combo:'12 + 16',heal:8,waves:3,arenaEnemies:24};
  });console.log(mobile?'MOBILE':'DESKTOP',results);
  // Exercise the actual held keyboard/touch input through a full magazine.
  if(mobile){const cd=await context.newCDPSession(page),box=await page.locator('#shoot').boundingBox();await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:box.x+box.width/2,y:box.y+box.height/2,radiusX:5,radiusY:5,force:1}]});await page.waitForFunction(()=>player.reload>0);assert.equal(await page.evaluate(()=>player.ammo),0);await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  else{await page.keyboard.down('KeyJ');await page.waitForFunction(()=>player.reload>0);assert.equal(await page.evaluate(()=>player.ammo),0);await page.keyboard.up('KeyJ');}
  await page.waitForFunction(()=>player.reload===0&&player.ammo===8);
  if(!mobile){for(const [name,x] of [['bridge',3500],['slope',4900],['trampoline',6420],['crumble',7500],['arena',9750]]){await page.evaluate(x=>{reset();state='playing';player.x=x;player.inv=100;camera=x-300;for(let i=0;i<100;i++)tick(1/120);},x);await page.screenshot({path:path.join(process.env.TEMP,`world-${name}.png`)});}}
  assert.deepEqual(errors,[]);await context.close();
 }}finally{await browser.close();server.close();}
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
