const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../battle-royale'),stage=require('../battle-royale/adventure-stage.js');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(s=>s.trim());
const c=vm.createContext({Image:class{},localStorage:{getItem:()=>null},$:()=>({checked:false})});c.window=c;c.MobAdventureStage=stage;
for(const i of [0,1,3,19,25])vm.runInContext(scripts[i],c);
c.clamp=c.Arena.clamp;c.moveDef=c.Arena.moveDef;
vm.runInContext(scripts[26].slice(0,scripts[26].indexOf('const adventureStyle='))+'})(window);',c);
const original=JSON.stringify(c.MOB_ADVENTURE_DATA);
const resolutions=[[1920,1080],[1366,768],[844,390],[667,375],[390,844],[360,640]];
const report=[];
for(const data of c.MOB_ADVENTURE_DATA.areas){
 const g=new c.MobAdventureEngine('mobrami',data),floor=g.platforms.filter(p=>p.ground);
 assert.equal(floor.length,1);assert.equal(floor[0].x,0);assert.equal(floor[0].w,data.width);assert.equal(floor[0].y,548);
 assert.equal(g.crates.length,2);assert.equal(g.area.gaps.length,0);
 for(const b of g.crates){assert.equal(b.w,78);assert.equal(b.h,80);assert.equal(b.y,548);assert(b.x>400&&b.x<data.width-(data.boss?1850:200));assert(g.fighters.slice(1).every(e=>Math.abs(e.x-b.x)>=200));}
 for(const p of g.platforms.filter(p=>!p.ground)){assert(p.w>=240&&p.w<=260);assert(548-p.y>=175&&548-p.y<=270);assert(p.x>=400&&p.x+p.w<data.width-200);}
 const enemies=g.fighters.slice(1).map(f=>f.x).sort((a,b)=>a-b);for(let i=1;i<enemies.length;i++)assert(enemies[i]-enemies[i-1]>=250);
 // Collision-only walk across the road, including under raised routes; no combat claims.
 const f=g.fighters[0];for(let x=40;x<data.width-40;x+=47){Object.assign(f,{x,y:547,vy:0,vx:0,ground:null});g.physics(f,1/30);assert.equal(f.y,548);assert(f.hp>0);}
 Object.assign(f,{x:140,y:1100,hp:1});g.recoverFall(f);assert.equal(f.hp,1);assert.equal(f.y,548);
 for(const [width,height]of resolutions){const v=c.arenaViewport(width,height);if(height>width){v.logicalWidth=640;v.logicalHeight=Math.round((height-210)*640/width);}for(const x of [140,data.width*.5,data.width-100]){f.x=x;f.y=548;g.camera={x:0,y:0};const cam=g.cameraFor(v.logicalWidth,v.logicalHeight,1),surface=548-cam.y;assert(Math.abs(surface/v.logicalHeight-.72)<1e-9);assert(cam.x>=0&&cam.x+v.logicalWidth<=data.width);assert(surface>f.h+80);report.push({area:data.name,width,height,viewWidth:v.logicalWidth,viewHeight:v.logicalHeight,surface,bottomDepth:v.logicalHeight-surface});}}
}
assert.equal(JSON.stringify(c.MOB_ADVENTURE_DATA),original,'Source archive must remain unchanged');
// Every fighter can reach the highest first-tier shelf with ordinary double-jump inputs.
for(const char of Object.keys(c.Arena.CHARS)){
 const g=new c.MobAdventureEngine(char,c.MOB_ADVENTURE_DATA.areas[2]);g.fighters=g.fighters.slice(0,1);
 const p=g.platforms.find(p=>!p.ground&&p.y===343),f=g.fighters[0];f.x=p.x+p.w/2;
 let second=false,landed=false;
 for(let tick=0;tick<180;tick++){const press=tick===0||(!second&&tick>2&&f.vy>=0&&f.ground===null);if(press&&tick>0)second=true;g.step(1/60,{p1:press?{jump:true}:{}});if(second&&f.ground===p.id){landed=true;break;}}
 assert(landed,`${char} cannot reach a 205px shelf`);
}
// Verify aspect ratio and bottom alignment from the actual drawing calls.
for(const damaged of [false,true]){let call;stage.crate({drawImage:(...args)=>call=args},{x:500,y:548,w:78,h:80,hp:damaged?10:36,maxHp:36},{naturalWidth:96});assert.equal(call[7]/call[3],call[8]/call[4]);assert.equal(call[6]+call[8],548);}
console.log(`PASS: 20 areas, ${report.length} viewport/position checks, continuous collision road, 2 grounded proportional crates, enemy spacing, fall survival.`);
async function render(out){
 const {createCanvas,loadImage}=require(path.resolve(path.dirname(process.execPath),'../node_modules/@napi-rs/canvas'));
 fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'stage-numerical-report.json'),JSON.stringify(report,null,2));
 const imgs={};async function image(src){return imgs[src]||(imgs[src]=await loadImage(path.join(root,src)));}
 c.assets={};for(const key of ['mobrami','tetsu']){const spec=c.ARENA_ASSETS.characters[key];c.assets[key]={};for(const a of ['idle','melee1'])c.assets[key][a]=await Promise.all(spec.actions[a].map(async src=>{const im=await image(src);im._arenaMeta=spec.frameMeta?.[src];return im;}));}
 c.effectImage=()=>{};vm.runInContext(scripts[21].slice(scripts[21].indexOf('function spriteAction('),scripts[21].indexOf('function effectImage(')),c);
 c.bg=await Promise.all([1,2,3,4,5].map(i=>image(`adventure/world${i}.webp`)));c.background=()=>{};
 const bgCode=scripts[26].slice(scripts[26].indexOf('const oldBackground=background;'),scripts[26].indexOf('const terrainArt='));vm.runInContext(bgCode,c);
 for(let world=0;world<5;world++)for(const [width,height,label]of [[960,540,'desktop'],[1039,480,'phone-landscape'],[640,1040,'phone-portrait']]){
  const data=c.MOB_ADVENTURE_DATA.areas[world*4],g=new c.MobAdventureEngine('mobrami',data),box=g.crates[0];g.fighters[0].x=box.x-190;g.fighters[0].y=548;
  const canvas=createCanvas(width,height),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;c.canvas=canvas;c.ctx=ctx;c.game=g;c.world=world;
  const cam=g.cameraFor(width,height,1);g.renderCamera=cam;c.background(cam);ctx.save();ctx.translate(-cam.x,-cam.y);
  for(const p of g.platforms)stage.platform(ctx,p,await image(`adventure/${data.biome.id}_${p.ground?'ground':'ledge'}.webp`),data.biome.id,{...cam,width,height});
  for(const b of g.crates)stage.crate(ctx,b,await image(c.ARENA_ASSETS.stage.crate));
  c.sprite(g.fighters[0]);
  const enemy=g.fighters.find(f=>f.enemyType);if(enemy){const e={...g.fighters[0],char:'tetsu',x:box.x+250,face:-1};c.sprite(e);}
  ctx.restore();fs.writeFileSync(path.join(out,`${data.biome.id}-${label}.png`),canvas.toBuffer('image/png'));
  // Check terrain in isolation: background opacity cannot conceal holes below the road.
  const soil=createCanvas(width,height),sc=soil.getContext('2d');sc.translate(-cam.x,-cam.y);
  stage.platform(sc,g.platforms[0],await image(`adventure/${data.biome.id}_ground.webp`),data.biome.id,{...cam,width,height});
  const pixels=sc.getImageData(0,height-1,width,1).data,colors=new Set();for(let x=0;x<width;x++){assert.equal(pixels[x*4+3],255);colors.add(pixels.slice(x*4,x*4+3).join(','));}assert(colors.size>30,'Bottom must contain texture, not a flat band');
 }
 console.log('Rendered 15 views with production terrain, crate, camera, background and fighter drawing.');
}
if(process.argv[2]==='--render')render(path.resolve(process.argv[3])).catch(e=>{console.error(e);process.exitCode=1;});
