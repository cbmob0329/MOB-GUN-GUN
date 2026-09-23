// npm install --no-save playwright, then: node tests/game.test.cjs
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'})[path.extname(file)]||'text/plain'});res.end(e?'Not found':b);});});
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
 try{for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}`);await page.waitForFunction(()=>state==='ready');await page.locator('[data-character="tetsu"]').click();
 assert.equal(await page.locator('[data-character="tetsu"]').getAttribute('aria-pressed'),'true');await page.screenshot({path:path.join(process.env.TEMP,'tetsu-title-'+mobile+'.png')});await page.locator('#start').click();
 if(mobile){await page.locator('#shoot').tap();await page.locator('#shoot').tap();}else{await page.keyboard.press('j');await page.keyboard.press('j');}await page.waitForFunction(()=>tetsuAction?.type==='combo');
 await page.evaluate(()=>{reset();pink.enabled=false;state='playing';});if(mobile){await page.locator('#jump').tap();await page.waitForTimeout(80);await page.locator('#shoot').tap();}else{await page.keyboard.press('Space');await page.waitForTimeout(80);await page.keyboard.press('j');}assert.equal(await page.evaluate(()=>tetsuAction?.type),'air');
 for(let i=0;i<3;i++){await page.evaluate(()=>{reset();pink.enabled=false;state='playing';});if(mobile)await page.locator(`[data-skill="${i}"]`).tap();else await page.keyboard.press(String(i+1));assert.equal(await page.evaluate(()=>tetsuAction?.type),['mob','dash','ultimate'][i]);}
 const result=await page.evaluate(()=>{
  const check=(v,m)=>{if(!v)throw Error(m);},step=n=>{for(let i=0;i<n;i++)tick(1/120);};
  const setup=(offset=95,hp=1000)=>{reset();pink.enabled=false;state='playing';platforms=[];player.x=500;player.inv=100;const e={...enemies[0],x:500+offset,home:500+offset,hp,maxHP:hp,type:'tank',w:62,h:65,range:1000};enemies=[e];return e;};
  let e=setup();tetsuAttack();step(18);check(e.hp===982,'normal damage');tetsuAttack();step(150);check(e.hp===954,'combo damage');check(!tetsuAction,'combo complete');
  e=setup();pointers.shoot.add(1);step(100);check(e.hp===1000,'hold must not repeat');
  e=setup(60);player.grounded=false;startTetsuAction('air');step(20);check(e.hp===970&&e.launch&&e.launch.vy<0,'air launch');check(tetsuEffects.length===1,'air impact once');
  e=setup(150);const other={...e,x:690,home:690};enemies.push(other);castTetsu(0);step(108);check(e.hp===916&&other.hp===916,'MOB total 84');check(e.launch&&other.launch,'MOB launches all');check(tetsuCooldowns[0]>5,'cooldown');
  e=setup(150,24);castTetsu(0);step(105);check(e.death>=0&&e.launch,'MOB launches early kills');
  e=setup(270);castTetsu(1);step(74);check(e.hp===946,'dash and ghost 54');check(player.x>900,'dash moves');
  e=setup(-270);player.dir=-1;castTetsu(1);check(player.dir===-1,'retain left facing');step(74);check(e.hp===946,'left dash');
  e=setup(150);castTetsu(2);step(120);check(e.hp===1000,'charge no early damage');check(tetsuPose()===tetsuFrames.PS[1]||tetsuPose()===tetsuFrames.PS[2],'alternating charge');step(18);check(e.hp===904&&e.launch.spin===19,'ultimate 96 spin');step(50);check(tetsuPose()===tetsuFrames.PS[5],'long frame 006');step(100);check(!tetsuAction,'recovery');
  e=setup(150,24);castTetsu(2);step(190);check(enemies.includes(e)&&e.launch&&e.launch.angle>0,'dead flight');step(300);check(!enemies.includes(e),'dead cleanup');
  setup();castTetsu(0);const cd=tetsuCooldowns[0];pause();step(120);check(tetsuCooldowns[0]===cd,'pause freezes');check(document.getElementById('character-select').hidden,'pause hides selector');resume();reset();check(!tetsuAction&&!tetsuEffects.length&&!tetsuGhosts.length&&tetsuCooldowns.every(x=>x===0),'reset');
  for(const [group,frames] of Object.entries(tetsuFrames))for(const f of frames){check(f.w>0&&f.h>0&&Number.isFinite(f.scale),'valid trim');if(group!=='SKILL')check(f.scale*f.h<220,'sprite size');}
  setup();castTetsu(0);step(87);return {normal:18,combo:28,air:30,mob:84,dash:54,ultimate:96};
 });
 await page.screenshot({path:path.join(process.env.TEMP,'tetsu-mob-'+mobile+'.png')});await page.evaluate(()=>{state='dead';modal('RETRY','test','RETRY');});await page.locator('[data-character="denden"]').click();await page.locator('#start').click();assert.equal(await page.evaluate(()=>selectedCharacter),'denden');assert.equal(await page.locator('[data-skill="2"] small').textContent(),'03 READY');assert.deepEqual(errors,[]);console.log(mobile?'TOUCH':'KEYBOARD',result);await context.close();
 }}finally{await browser.close();server.close();}
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});

