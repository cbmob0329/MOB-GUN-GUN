const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),{pathToFileURL}=require('url');
const root=path.resolve(__dirname,'..'),s=fs.readFileSync(path.join(root,'cartoon.js'),'utf8');let checks=0;const check=(a,b)=>{assert.deepEqual(a,b);checks++;};
const c={URL,cartoon:{awake:0,shots:[]},selectedCharacter:'hero',player:{x:500,y:300},cartoonProfiles:{hero:{},denden:{},nyoro:{},tetsu:{},manny:{displayBodyHeight:80},mobdesert:{}},cartoonArt:{},cartoonHit(){}};vm.createContext(c);
for(const [a,b]of [['const cartoonTiming=','function cartoonPhase('],['function cartoonReleaseArt(','function cartoonStep('],['function cartoonFrame(','async function loadCartoonArt('],['function cartoonUniqueSpecial(','if(cartoonEnabled)']]){const start=s.indexOf(a);vm.runInContext(s.slice(start,s.indexOf(b,start)),c);}
const manifest=JSON.parse(fs.readFileSync(path.join(root,'combat/cartoon-manifest.json')));
for(const [key,v]of Object.entries(manifest.animations)){const file=path.resolve(root,'combat',v.adapter);c.cartoonArt[key]=c.cartoonNormalizeArt({...JSON.parse(fs.readFileSync(file)),...v},pathToFileURL(file).href);}
for(const [key,v]of Object.entries(manifest.aliases)){const target=c.cartoonArt[typeof v==='string'?v:v.clip];assert(target,key);const range=typeof v==='string'?null:v.range||(v.phase&&target.phaseRanges?.[v.phase]);c.cartoonArt[key]=range?{...target,frameRange:range,loop:false}:target;}
const contract=JSON.parse(fs.readFileSync(path.join(root,'combat/cartoon-animation-contract.json')));
for(const id of Object.keys(c.cartoonProfiles))for(const form of ['', 'awakened-'])for(const motion of contract.body){const art=c.cartoonArt[(id==='hero'?'':id+'/')+form+motion];assert(art,id+' '+form+motion);assert(art.frames.length>=16);checks++;}
const events=[];
for(const id of ["hero","manny","mobdesert"])for(const awake of [0,1]){
 c.selectedCharacter=id;c.cartoon.awake=awake;
 for(const index of (['manny','mobdesert'].includes(id)?[0,1]:[1])){
  const unique=['manny','mobdesert'].includes(id),type=unique?(id==='manny'?['mannyBombs','mannyOrb']:['desertSpin','desertDragon'])[index]:'water',a={type,unique,specialIndex:index,dir:1,empowered:!!awake},art=c.cartoonReleaseArt(a),first=art.frameRange?.[0]||0,last=art.frameRange?.[1]||art.frames.length;
  const [start,end]=({water:[.36,.55],mannyBombs:[.35,1.1],mannyOrb:[.55,.8],desertSpin:[.16,.9],desertDragon:[.6,.95]})[type],event=c.cartoonReleaseTime(a),offset=first?art.ends[first-1]:0,total=art.ends[last-1]-offset;
  check(art.releaseFrame-first,id==='hero'?1:7);
  for(let i=first;i<last;i++){const mid=((i?art.ends[i-1]:0)+art.ends[i])/2-offset,age=(end-start)*mid/total;a.age=start+age;check(c.cartoonReleasePose(art,a,age,end-start),art.frames[i]);}
  a.age=event;check(c.cartoonReleasePose(art,a,event-start,end-start),art.frames[art.releaseFrame]);
  for(const dir of [-1,1]){a.dir=dir;const origin=c.cartoonReleaseOrigin(a),h=id==='manny'?80:110;check(origin.x,500+dir*art.releaseSocket[0]*h);check(origin.y,300+art.releaseSocket[1]*h);c.cartoon.shots=[];delete a.fired;if(unique){a.age=event-1e-8;c.cartoonUniqueSpecial(a);check(c.cartoon.shots.length,0);a.age=event;c.cartoonUniqueSpecial(a);}else c.cartoonShot(a,true);assert(c.cartoon.shots.length);for(const shot of c.cartoon.shots){check(shot.x,origin.x);check(shot.y,origin.y);}}
  events.push({id,awake,index,localFrame:art.releaseFrame-first,actionTime:event});
 }
}
for(const [id,motion]of [['manny','jump'],['mobdesert','jump'],['mobdesert','special1-startup'],['mobdesert','special1-active']]){assert(c.cartoonArt[id+'/'+motion].frames.some(f=>f.authoredRootLift>0),id+' root lift');checks++;}
for(const id of ['manny','mobdesert'])for(const key of ['special1-aura','special2-water','special2-splash'])check(c.cartoonArt[id+'/effects/'+key],undefined);
console.log(JSON.stringify({checks,keys:Object.keys(c.cartoonArt).length,events}));
