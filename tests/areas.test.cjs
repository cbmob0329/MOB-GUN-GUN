// npm install --no-save playwright, then: node tests/game.test.cjs
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'})[path.extname(file)]||'text/plain'});res.end(e?'Not found':b);});});
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}`);await page.waitForFunction(()=>state==='ready',null,{timeout:60000});await page.locator('#start').click();
 const report=await page.evaluate(()=>{
 const check=(v,m)=>{if(!v)throw Error(m);},step=n=>{for(let i=0;i<n;i++)tick(1/120);};
 check(grassArt.props.length===16&&grassArt.terrain.length===12,'all generated sprites loaded');
 for(let i=0;i<4;i++){areaIndex=i;reset();check(CONFIG.worldWidth===AREAS[i].width,'area width');check(!!bossRoom===(i===3),'boss only area4');check(props.some(p=>p.propKind==='tree'),'tree each area');}
 areaIndex=0;reset();state='playing';pink.enabled=false;enemies=[];const rock=props.find(p=>p.propKind==='rock');player.x=rock.x-150;axis=1;step(100);check(player.x<=rock.x-rock.w/2-CONFIG.playerColliderWidth/2+.1,'rock blocks movement');axis=0;keys.add('KeyJ');step(110);keys.clear();check(rock.death===0&&!grassSolidBoxes().some(b=>b.prop===rock),'bullets destroy obstacle');
 const trees=props.filter(p=>p.propKind==='tree'),random=Math.random;while(trees.length<2)trees.push(addGrassProp('tree',1800+trees.length*100));try{Math.random=()=>.1;hitEnemy(trees[0],100);check(enemies.some(e=>e.fromTree&&e.dropping.vy<0),'tree ejects enemy');Math.random=()=>.9;hitEnemy(trees[1],100);check(dorayaki.length===1&&dorayaki[0].vy<0,'tree ejects item');hitEnemy(trees[1],100);check(dorayaki.length===1,'drop once');}finally{Math.random=random;}
 check(!props.some(p=>p.propKind==='puddle'),'puddles removed');
 const roller=props.find(p=>p.propKind==='rolling')||addGrassProp('rolling',4290);player.x=roller.x-120;player.hp=50;player.inv=0;step(90);check(player.hp===42&&roller.x<4290,'rolling contact damage');
 areaIndex=1;reset();state='playing';pink.enabled=false;enemies=[];player.x=1760;axis=1;step(440);check(player.y<=92&&cameraY< -200,'climb and vertical camera');
 areaIndex=2;reset();state='playing';pink.enabled=false;enemies=[];const rope=ropes[0];player.x=rope.gapX-260;axis=1;let grabbed=false,released=false;for(let i=0;i<700;i++){if(!grabbed&&player.grounded)jumpRequest=CONFIG.jumpBuffer;if(ropeRide){grabbed=true;if(ropeRide.angle>.6&&ropeRide.velocity>0){jumpRequest=CONFIG.jumpBuffer;released=true;}}tick(1/120);if(released&&player.grounded)break;}check(grabbed&&released&&player.x>rope.gapX+rope.gapWidth&&player.grounded,'rope crossing '+JSON.stringify({grabbed,released,x:player.x,y:player.y}));
 player.y=1000;updateWorld(1/120);check(player.y===548&&!ropeRide&&Number.isFinite(player.x),'fall recovery');
  for(const character of ['denden','tetsu'])for(let second=12;second<110;second+=6){areaIndex=2;selectedCharacter=character;reset();state='playing';pink.enabled=false;enemies=[];props=[];crates=[];const gap=gaps[0];ropes=[];player.x=gap.x-5;axis=1;jumpRequest=CONFIG.jumpBuffer;let crossed=false;for(let i=0;i<260;i++){if(i===second)jumpRequest=CONFIG.jumpBuffer;tick(1/120);if(player.x>=gap.x+gap.w){crossed=true;break;}}check(!crossed,'double jump cannot bypass rope '+character+' '+second);}selectedCharacter='denden';
 areaIndex=0;areaBank={coins:0,kills:0,time:0};reset();state='playing';collected=7;player.x=CONFIG.worldWidth-179;finishGrassArea();check(state==='areaClear','area1 exit');startGrassArea();check(areaIndex===1&&collected===7&&state==='playing','next area carries coins');
 for(let i=1;i<3;i++){if(shartyEncounter){hitEnemy(shartyEncounter.enemy,9999);updateShartyWorld(1/120);}player.x=CONFIG.worldWidth-179;finishGrassArea();startGrassArea();}check(areaIndex===3&&bossRoom,'progress to area4');player.x=CONFIG.worldWidth-179;finishGrassArea();check(state==='playing','boss gates final goal');bossRoom.state='cleared';finishGrassArea();check(state==='clear','final clear');startGrassArea();check(areaIndex===0&&collected===0,'campaign retry');
 return{areas:4,props:16,terrain:12,ropeCrossing:true,treeDrops:true,bossOnlyArea4:true};
 });console.log(mobile?'MOBILE':'DESKTOP',report);
 for(const i of [0,1,2,3]){await page.evaluate(i=>{areaIndex=i;reset();state='playing';pink.enabled=false;player.inv=100;if(i===0){player.x=1500;camera=1000;}if(i===1){player.x=2900;player.y=68;camera=2500;cameraY=-337;}if(i===2){player.x=1460;camera=1120;}if(i===3){player.x=4800;camera=4450;}draw();state='paused';},i);await page.screenshot({path:path.join(process.env.TEMP,`grass-area${i+1}-${mobile}.png`)});}
 if(mobile){await page.evaluate(()=>{areaIndex=2;reset();state='playing';pink.enabled=false;ropeRide=ropes[0];const end=ropeEnd(ropeRide);player.x=end.x;player.y=end.y+46;player.grounded=false;});await page.locator('#jump').tap();await page.waitForFunction(()=>!ropeRide&&ropeRegrab>0&&player.vy<0);}
 assert.deepEqual(errors,[]);await context.close();
 }}finally{await browser.close();server.close();}
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});