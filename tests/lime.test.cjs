// npm install --no-save playwright, then: node tests/game.test.cjs
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'})[path.extname(file)]||'text/plain'});res.end(e?'Not found':b);});});
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}`);await page.waitForFunction(()=>state==='ready');await page.locator('#start').click();
 const report=await page.evaluate(()=>{
 const check=(v,m)=>{if(!v)throw Error(m);},step=n=>{for(let i=0;i<n;i++)tick(1/120);};
 reset();state='playing';pink.enabled=false;check(limeFrames.length===12&&limeFrames.every(f=>f.w>100&&f.h>60),'12 valid atlas frames');
 const count=enemies.filter(e=>e.type==='lime').length;check(count===5,'five slime placements');const e=enemies.find(e=>e.type==='lime');enemies=[e];player.x=1200;player.inv=100;const initial=e.x;step(60);check(e.x<initial,'approach player');
 hitEnemy(e,12);check(e.hp===36&&limeFrameIndex(e)>=4&&limeFrameIndex(e)<8,'recoil and damage');step(15);check(limeFrameIndex(e)<4,'recover walk');
 player.inv=0;player.x=e.x;step(1);check(player.hp===46&&player.inv>0,'contact damage');
 hitEnemy(e,100);check(limeFrameIndex(e)===8,'death start');step(65);check(enemies.includes(e)&&limeFrameIndex(e)===11,'puddle persists');step(65);check(!enemies.includes(e),'death cleanup');
 reset();pink.enabled=false;state='playing';player.x=1250;camera=950;player.inv=100;return{frames:12,placements:count,hp:48,contactDamage:4};
 });
 await page.screenshot({path:path.join(process.env.TEMP,`lime-stage-${mobile}.png`)});assert.deepEqual(errors,[]);console.log(mobile?'MOBILE':'DESKTOP',report);await context.close();
 }}finally{await browser.close();server.close();}
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});