const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require(require.resolve('playwright',{paths:[path.resolve(path.dirname(process.execPath),'../node_modules')]}));
const out=path.join(process.env.TEMP,'gungun-six-pack-qa');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage({viewport:{width:1280,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>{window.requestAnimationFrame=cb=>(window.testRAF=cb,1);});
 await p.goto('http://127.0.0.1:4173/');await p.waitForFunction(()=>typeof combatPrepare==='function'&&state==='ready',null,{polling:100});await p.evaluate(()=>cartoonArtReady);assert.deepEqual(await p.evaluate(()=>cartoonAssetErrors),[]);
 const report=[];
 for(const id of ['hero','denden','nyoro','manny']){
  await p.evaluate(async id=>{state='ready';selectedCharacter=id;biomeIndex=0;areaIndex=0;await startGrassArea();},id);assert(await p.evaluate(()=>state==='playing'&&combatResident()));
  for(const fps of [30,60])for(const dir of [-1,1])for(const skill of (id==='hero'?[1,2]:id==='denden'?[0,1,2]:id==='nyoro'?[0,1]:[-1])){
   const r=await p.evaluate(({id,fps,dir,skill})=>{
    reset();state='playing';enemies=[];crates=[];props=[];arenas=[];pink.enabled=false;player.x=700;player.y=548;player.dir=dir;player.grounded=true;camera=150;cartoonPlayer=player;cartoonCharacter=id;
    const before=combatLoadAudit.decodes,events=[],bodyKeys=new Set(),images=[],fx=[],oldBody=revisionBody,oldFX=cartoonDrawEffect,oldFire=addFire,oldShot=cartoonShot,oldEnergy=releaseEnergy;let time=0;
    revisionBody=function(key,...args){bodyKeys.add(key);return oldBody(key,...args);};
    cartoonDrawEffect=function(key,x,y,size,age,duration,direction,...rest){fx.push({key,age,alpha:ctx.globalAlpha});return oldFX(key,x,y,size,age,duration,direction,...rest);};
    addFire=function(kind,...args){events.push({kind,time});return oldFire(kind,...args);};
    cartoonShot=function(a,water){const origin=cartoonReleaseOrigin(a);events.push({kind:'water',time,origin,feet:{x:player.x,y:player.y},release:cartoonReleaseTime(a),damage:a.empowered?80:52});return oldShot(a,water);};
    releaseEnergy=function(){const origin=energyChargeGeometry();events.push({kind:'energy',time,origin,feet:{x:player.x,y:player.y}});return oldEnergy();};
    const burstSet=new Set();let splashTime=null,endTime=null,groundAtEnd=null,ageAtEnd=null;
    if(id==='hero')cartoon.awake=skill===2?12:0;
    let accepted=id==='manny'?true:cartoonSpecial(id==='hero'?1:skill);
    for(let frame=0;frame<fps*3;frame++){
     for(let sub=0;sub<120/fps;sub++){
      time+=1/120;const had=!!cartoon.action;tick(1/120);
      if(had&&!cartoon.action&&id==='hero'&&endTime===null){endTime=time;groundAtEnd=player.grounded;ageAtEnd=player.jumpAge;}
      for(const burst of thunderBursts)if(!burstSet.has(burst)){burstSet.add(burst);events.push({kind:'burst',time,x:burst.x,size:burst.size,damage:burst.damage});}
      if(cartoon.effects.some(f=>f.kind==='splash')&&splashTime===null)splashTime=time;
     }
     draw();drawSkills();
     if([Math.floor(fps*.2),Math.floor(fps*.45),Math.floor(fps*.75),Math.floor(fps*1.1)].includes(frame)&&fps===60)images.push({time,image:canvas.toDataURL()});
    }
    // Exercise non-impact ending alpha directly; no lifetime extension.
    if(id==='nyoro'){ctx.save();ctx.globalAlpha=1-1.099/1.1;cartoonNyoroImpact({x:700,y:548,r:245,age:1.099});ctx.restore();}
    revisionBody=oldBody;cartoonDrawEffect=oldFX;addFire=oldFire;cartoonShot=oldShot;releaseEnergy=oldEnergy;
    return {id,fps,dir,skill,accepted,events,bodyKeys:[...bodyKeys],fxKeys:[...new Set(fx.map(f=>f.key))],terminalAlpha:fx.at(-1)?.alpha,splashTime,endTime,groundAtEnd,ageAtEnd,images,decodes:combatLoadAudit.decodes-before,stats:cartoonTextureStats(),rainEnded:nyoroAction===null};
   },{id,fps,dir,skill});
   assert(r.accepted,JSON.stringify({id,skill}));assert.equal(r.decodes,0);assert.equal(r.stats.failures,0);assert(r.stats.peak<=64*1024*1024);
   if(id==='hero'){const e=r.events.find(e=>e.kind==='water'),awake=skill===2,release=awake?.425339:.417154;assert(e);assert(Math.abs(e.time-release/(awake?1.65:1))<.017);assert(Math.abs(e.origin.x-e.feet.x-dir*(awake?.7879761801719158:.7871140160595552)*110)<1e-6);assert(Math.abs(r.endTime-1.05/(awake?1.65:1))<.017);if(awake)assert.equal(r.groundAtEnd,false);assert(r.splashTime>e.time);}
   if(id==='denden'){assert(r.bodyKeys.includes('denden/special'+(skill+1)));if(skill===0){const e=r.events.find(e=>e.kind==='energy');assert(e);assert(Math.abs(e.origin.x-e.feet.x-dir*.636968215899483*110)<1e-6);}if(skill===2){const ev=r.events.filter(e=>e.kind==='burst');assert.equal(ev.length,3);ev.forEach((e,i)=>{assert(Math.abs(e.time-[.24,.37,.5][i])<.017);assert.equal(e.x,700+dir*[95,225,395][i]);});}}
   if(id==='nyoro'){assert(r.bodyKeys.includes('nyoro/special'+(skill+1)));const ev=r.events.filter(e=>e.kind===(skill===0?'rain':'meteor'));assert.equal(ev.length,skill===0?5:1);assert(Math.abs(ev[0].time-(skill===0?.12:.85))<.017);assert(r.rainEnded);assert(r.terminalAlpha<.001);}
   for(const [i,im]of r.images.entries())fs.writeFileSync(path.join(out,`${id}-${skill}-${dir}-${i}.png`),Buffer.from(im.image.split(',')[1],'base64'));delete r.images;report.push(r);console.log(JSON.stringify({id,fps,dir,skill,events:r.events.length,body:r.bodyKeys,decodes:r.decodes}));
  }
 }
 const transitions=await p.evaluate(()=>{const prev=cartoonArt['manny/walk'],next=cartoonArt['manny/dash'],map=[15,0,1,1,2,3,5,7,8,8,9,10,12,13,14,15];return prev.frames.map((f,i)=>{const mid=((i?prev.ends[i-1]:0)+prev.ends[i])/2/prev.duration;return {actual:cartoonTransitionPhase(prev,next,mid,map),expected:(map[i]?next.ends[map[i]-1]:0)/next.duration};});});for(const t of transitions)assert.equal(t.actual,t.expected);
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({report,transitions,errors},null,2));console.log(JSON.stringify({passed:report.length,transitions:transitions.length,errors,out}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
