// npm install --no-save playwright, then: node tests/game.test.cjs
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'})[path.extname(file)]||'text/plain'});res.end(e?'Not found':b);});});
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
 try{for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}`);await page.waitForFunction(()=>state==='ready');await page.locator('[data-character="tetsu"]').click();await page.locator('#start').click();
  const report=await page.evaluate(()=>{
   const check=(v,m)=>{if(!v)throw Error(m);},step=n=>{for(let i=0;i<n;i++)tick(1/120);};
   const setup=()=>{reset();state='playing';platforms=[];coins=[];player.x=500;const e=enemies.find(e=>e.type==='miira');enemies=[e];Object.assign(e,{x:750,home:750,attackCooldown:0,attackAge:-1});return e;};
   reset();check(enemies.filter(e=>e.type==='miira').length===60,'60 mummies');check(enemies.length===87,'87 total enemies');
   let e=setup();step(1);check(e.attackAge===0,'windup');step(37);check(!dirtBalls.length,'no early ball');step(1);check(dirtBalls.length===1&&miiraPose(e)===miiraFrames.at[3],'release at 004');const ball=dirtBalls[0],startY=ball.y;step(18);check(ball.y<startY&&ball.vy<0,'ball rises');step(60);check(player.hp===47,'ball hit damage 3');check(!dirtBalls.includes(ball),'ball removed on hit');step(120);check(!dirtBalls.length,'throw cooldown');
   e=setup();e.attackCooldown=10;step(24);check(e.x<750&&miiraFrames.wa.includes(miiraPose(e)),'walk uses wa');
   e=setup();hitEnemy(e,24);step(75);check(miiraPose(e)===miiraFrames.do[6]&&enemies.includes(e),'down 007');step(1);check(miiraPose(e)===miiraFrames.do[7],'final 008');step(58);check(enemies.includes(e),'008 visible almost half second');step(3);check(!enemies.includes(e),'008 cleanup after fade');check(!dirtBalls.length,'dead cannot throw');
   e=setup();e.attackAge=.2;launchEnemy(e,220,-190);check(e.attackAge===-1,'launch interrupts throw');hitEnemy(e,24);step(12);check(e.launch&&e.death===0,'freeze down while flying');step(30);check(!e.launch&&e.death>0,'down starts after landing');
   setup();enemies=[];dirtBalls=[{x:480,y:515,vx:300,vy:0,r:9,life:1,angle:0},{x:480,y:515,vx:300,vy:0,r:9,life:1,angle:0}];step(1);check(player.hp===47,'invulnerability prevents stacked balls');
   setup();enemies=[];platforms=[{x:580,y:420,w:30,h:128,solid:true}];dirtBalls=[{x:620,y:490,vx:-600,vy:0,r:9,life:1,angle:0}];step(12);check(dirtBalls.length===0&&player.hp===50,'wall blocks ball');
   setup();enemies=[];dirtBalls=[{x:600,y:450,vx:10,vy:-100,r:9,life:1,angle:0}];pause();step(50);check(dirtBalls[0].y===450,'pause freezes projectile');resume();reset();check(!dirtBalls.length,'reset clears balls');
   e=setup();e.x=e.home=585;e.hp=e.maxHP=1000;e.attackCooldown=100;player.inv=100;startTetsuAction('combo');let maxLift=0,landed=false;for(let i=0;i<130;i++){step(1);maxLift=Math.max(maxLift,CONFIG.groundY-player.y);if(tetsuAction?.landedAt!==undefined){landed=true;check(player.grounded&&tetsuPose()===tetsuFrames.HS[5],'006 on landing');}if(!landed)check(e.hp===(tetsuAction?.age>=.22?988:1000),'mid hit before landing');}check(maxLift>10&&maxLift<30,'small physical float');check(landed&&!tetsuAction&&e.hp===972,'landing slash hits once for 28');check(e.x>585&&e.x<720,'small knockback');
   e=setup();platforms=[{x:400,y:420,w:350,h:25}];player.y=420;e.y=420;e.x=e.home=585;e.hp=e.maxHP=1000;e.attackCooldown=100;startTetsuAction('combo');step(130);check(player.y===420&&player.grounded&&e.hp===972,'landing slash on platform');
   setup();enemies=[];const original=drawTetsuEffect,seen=[];drawTetsuEffect=(first,index)=>seen.push(first+index);castTetsu(1);for(let i=0;i<80;i++){step(1);drawTetsuEffects();}drawTetsuEffect=original;check(JSON.stringify([...new Set(seen)])==='[4,5,6,7]','dash uses only 05-08');
   for(const frames of Object.values(miiraFrames))for(const f of frames)check(f.w===f.img.width&&f.h===f.img.height&&f.w>0&&f.h>0,'trimmed render cache');
   reset();state='playing';player.x=1500;camera=1100;player.inv=100;step(25);return {mummies:60,total:87,ballDamage:3,floatHeight:maxLift,comboDamage:28};
  });
  await page.screenshot({path:path.join(process.env.TEMP,`miira-stage-${mobile}.png`)});
  if(!mobile){
   // Capture synchronously inside evaluate: the game render loop remains active.
   const png=await page.evaluate(()=>{camera=0;ctx.fillStyle='#526271';ctx.fillRect(0,0,W,H);for(let i=0;i<6;i++){paintTetsu(tetsuFrames.HS[i],90+i*185,170,1);text(`HS 00${i+1}`,90+i*185,205,20);}for(let i=0;i<8;i++){drawMiira({x:75+i*155,y:355,dir:1,h:72,hp:24,maxHP:24,flash:0,death:-1,attackAge:i*MIIRA.frameTime+.001});text(`AT 00${i+1}`,75+i*155,390,18);drawMiira({x:75+i*155,y:570,dir:1,h:72,flash:0,death:i*MIIRA.downFrameTime+.001});text(`DO 00${i+1}`,75+i*155,610,18);}return canvas.toDataURL().split(',')[1];});fs.writeFileSync(path.join(process.env.TEMP,'miira-poses.png'),Buffer.from(png,'base64'));
  }
  assert.deepEqual(errors,[]);console.log(mobile?'MOBILE':'DESKTOP',report);await context.close();
 }}finally{await browser.close();server.close();}
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
