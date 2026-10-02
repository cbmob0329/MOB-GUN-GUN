const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));fs.readFile(f,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':f.endsWith('.js')?'text/javascript':f.endsWith('.html')?'text/html':f.endsWith('.css')?'text/css':'image/png'});res.end(e?'missing':b);});});


(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,channel:'msedge'});try{for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>state==='ready',null,{timeout:60000});
 const result=await page.evaluate(()=>{const check=(v,m)=>{if(!v)throw Error(m);},maps=[];
 for(let b=0;b<5;b++)for(let a=0;a<4;a++){selectBiome(b);areaIndex=a;reset();state='playing';enemies=[];pink.enabled=false;check(platforms.some(p=>p.actionRoute&&p.w>=300&&p.y<=348),'wide upper route '+b+'/'+a);if(b===4){check(platforms.filter(p=>p.geyser).length<=3,'sparse geysers');check(props.every(p=>!gaps.some(g=>p.x>g.x-100&&p.x<g.x+g.w+100)),'props outside geysers');}check(props.length<=5,'sparse props');
 cameraY=-600;drawBackground();const pix=ctx.getImageData(600,719,1,1).data;check(!(pix[0]===86&&pix[1]===193&&pix[2]===223),'background fills lower edge');maps.push({b,a,props:props.length,geyser:platforms.filter(p=>p.geyser).length});
 const first=platforms.find(p=>p.actionRoute),next=platforms.find(p=>p.actionRoute&&p.x>first.x);player.x=first.x+first.w-45;player.y=first.y;player.grounded=true;axis=1;jumpRequest=CONFIG.jumpBuffer;let landed=false;for(let i=0;i<150;i++){tick(1/120);if(player.grounded&&Math.abs(player.y-next.y)<2&&player.x>=next.x){landed=true;break;}}check(landed,'reachable upper route '+b+'/'+a+' '+JSON.stringify({x:player.x,y:player.y,first,next}));
 }
 selectBiome(0);areaIndex=3;reset();state='playing';const e=makeDragon(5800);bossRoom.boss=e;bossRoom.state='fighting';enemies=[e];player.inv=100;dragonShots=[];dragonEffects=[];dragonFireball(e);check(dragonShots.length===1&&!dragonEffects.some(f=>f.kind==='orb'),'no duplicate mouth orb');
 dragonShots=[];dragonBlast(5800,535,150,0);ctx.clearRect(0,0,W,H);camera=5300;drawDragonEffects();const below=ctx.getImageData(0,549,W,171).data;for(let i=3;i<below.length;i+=4)check(below[i]===0,'impact never extends below floor');
 return {maps,upperRoutesReachable:true,backgroundCovered:true,noMouthOrb:true,groundedImpact:true};});console.log(mobile?'MOBILE':'DESKTOP',JSON.stringify(result));
 for(const b of [0,2,4]){await page.evaluate(b=>{selectBiome(b);if(b===0)areaIndex=1;reset();state='playing';player.x=b===0?3050:1400;player.y=b===0?68:548;camera=b===0?2600:900;cameraY=b===0?-337:0;player.inv=100;document.getElementById('overlay').hidden=true;draw();state='paused';},b);await page.screenshot({path:path.join(root,'tests/polish-'+b+'-'+mobile+'.png')});}
 assert.deepEqual(errors,[]);await context.close();}}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
