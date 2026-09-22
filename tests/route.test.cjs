// npm install --no-save playwright, then: node tests/game.test.cjs
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'})[path.extname(file)]||'text/plain'});res.end(e?'Not found':b);});});
async function main(){await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});try{
 const page=await browser.newPage({viewport:{width:1280,height:720}});await page.goto(`http://127.0.0.1:${server.address().port}`);await page.waitForFunction(()=>state==='ready');
 for(const character of ['denden','tetsu']){
 const result=await page.evaluate(character=>{
  selectedCharacter=character;reset();state='playing';updateCharacterUI();let frames=0;
  for(;frames<120*360&&state==='playing';frames++){
   const arena=arenaForPlayer(),targets=combatTargets().filter(e=>e.death<0&&(arena?e.arenaId===arena.id:e.x>=player.x-40)&&Math.abs(e.x-player.x)<850).sort((a,b)=>Math.abs(a.x-player.x)-Math.abs(b.x-player.x));const target=targets[0],distance=target?Math.abs(target.x-player.x):Infinity,dir=target?Math.sign(target.x-player.x)||player.dir:1;
   keys.clear();axis=arena?(target?dir*(distance>170?1:.55):0):1;
   if(character==='denden'){
    keys.add('KeyJ');if(target&&distance<260&&player.grounded)axis=player.dir===dir?0:dir*.55;if(target&&distance<700){if(skillState.cooldowns[1]===0&&(arena||targets.length>=3))castThunder();if(skillState.cooldowns[0]===0&&!skillState.charging)beginCharge('route');if(skillState.charging&&skillState.charge>.35)endCharge('route',true);}
   }else if(target&&!tetsuAction){
    if(distance<260&&tetsuCooldowns[0]===0)castTetsu(0);
    else if(distance<400&&tetsuCooldowns[1]===0)castTetsu(1);
    else if(distance<250&&tetsuCooldowns[2]===0&&targets.length>2)castTetsu(2);
    else if(distance<125)tetsuAttack();
   }else if(tetsuAction?.type==='normal')tetsuAttack();
   const obstacle=platforms.some(q=>q.solid&&q.type!=='stair'&&q.x-player.x>0&&q.x-player.x<110);
   if(player.grounded&&obstacle&&!tetsuAction)jumpRequest=CONFIG.jumpBuffer;
   tick(1/120);
  }
  return {character,state,x:player.x,hp:player.hp,seconds:elapsed,kills,arenas:arenas.map(a=>({state:a.state,spawned:a.spawned})),frames};
 },character);console.log(result);assert.equal(result.state,'clear');assert(result.arenas.every(a=>a.state==='cleared'&&a.spawned===24));
 }
 }finally{await browser.close();server.close();}}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
