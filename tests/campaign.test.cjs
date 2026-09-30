// npm install --no-save playwright, then: node tests/game.test.cjs
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'})[path.extname(file)]||'text/plain'});res.end(e?'Not found':b);});});
async function main(){await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,channel:'msedge'});try{
const page=await browser.newPage({viewport:{width:1280,height:720}});await page.goto(`http://127.0.0.1:${server.address().port}`);await page.waitForFunction(()=>state==='ready',null,{timeout:60000});
const result=await page.evaluate(()=>{
 let seed=127;const random=Math.random;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 areaIndex=0;areaBank={coins:0,kills:0,time:0};selectedCharacter='denden';reset();state='playing';const reached=[1];let grabs=0,lastRide=false,falls=0,prevX=0;
 try{for(let frame=0;frame<120*420;frame++){
 if(state==='areaClear'){startGrassArea();reached.push(areaIndex+1);prevX=0;}
 if(state!=='playing')break;
 keys.clear();axis=1;
 const riding=!!ropeRide,nearRope=ropes.some(r=>player.x>r.gapX-400&&player.x<r.gapX+r.gapWidth+100);
 if(riding&&!lastRide)grabs++;lastRide=riding;
 const target=combatTargets().filter(e=>e.death<0&&Math.abs(e.y-player.y)<130&&(bossLocked()||e.x>player.x-30)&&Math.abs(e.x-player.x)<800).sort((a,b)=>Math.abs(a.x-player.x)-Math.abs(b.x-player.x))[0];
 if(target&&!nearRope){const d=Math.abs(target.x-player.x),dir=Math.sign(target.x-player.x)||1;axis=dir;if(d<170&&player.grounded)axis=player.dir===dir?0:dir*.55;if(selectedCharacter==='tetsu'){if(!tetsuAction){if(d<250&&tetsuCooldowns[0]===0)castTetsu(0);else if(d<400&&tetsuCooldowns[1]===0)castTetsu(1);else if(d<250&&tetsuCooldowns[2]===0)castTetsu(2);else if(d<135)tetsuAttack();}else if(tetsuAction.type==='normal')tetsuAttack();}else if(selectedCharacter==='nyoro'){if(!nyoroAction){if(d<600&&nyoroCooldowns[0]===0)castNyoro(0);else if(d<500&&nyoroCooldowns[1]===0)castNyoro(1);else if(d<135)nyoroAttack();}else if(nyoroAction.type==='normal')nyoroAttack();}else keys.add('KeyJ');if(d<650&&selectedCharacter==='denden'){if(skillState.cooldowns[0]===0)beginCharge('route');if(skillState.cooldowns[1]===0&&bossLocked())castThunder();if(thunderBulletCooldown===0)castThunderBullet();}}
 if(bossLocked()&&!target)axis=0;
 if(ropeRide){axis=1;if(ropeRide.angle>.58&&ropeRide.velocity>0)jumpRequest=CONFIG.jumpBuffer;}
 else{
 const rope=ropes.find(r=>player.x>r.gapX-265&&player.x<r.gapX);if(rope&&player.grounded)jumpRequest=CONFIG.jumpBuffer;
 const obstacle=platforms.some(p=>p.solid&&p.type!=='stair'&&p.x-player.x>0&&p.x-player.x<100);
 const ledge=platforms.find(p=>Math.abs(p.y-player.y)<2&&player.x>=p.x&&player.x<=p.x+p.w&&p.x+p.w-player.x<85&&groundAt(p.x+p.w+60)===Infinity);
 const rolling=props.some(p=>p.propKind==='rolling'&&p.active&&!p.spent&&p.x>player.x&&p.x-player.x<140);
 if(player.grounded&&(obstacle||ledge||rolling))jumpRequest=CONFIG.jumpBuffer;
 }
 tick(1/120);if(prevX-player.x>700&&!bossIntro())falls++;prevX=player.x;
 }
 return{state,area:areaIndex+1,x:player.x,y:player.y,hp:player.hp,seconds:elapsed,kills,reached,grabs,falls,boss:bossRoom?.state,rope:ropeRide?.angle,character:selectedCharacter,action:tetsuAction?.type};
 }finally{Math.random=random;}
});console.log(result);await page.screenshot({path:path.join(process.env.TEMP,'grass-campaign.png')});assert.equal(result.state,'clear');assert.deepEqual(result.reached,[1,2,3,4]);assert(result.grabs>=4);
}finally{await browser.close();server.close();}}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});