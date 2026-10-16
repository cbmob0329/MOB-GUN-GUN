const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../cartoon.js'),'utf8');let count=0,position,scale,draw;
const c={CONFIG:{jumpForce:640,gravity:1800},URL,Set,Math,player:{x:500,y:240,dir:1,vx:0,vy:-200,grounded:false,jumpAge:0,anim:0,hp:100},selectedCharacter:'manny',camera:10,running:false,cartoon:{awake:0,shots:[]},cartoonArt:{},cartoonProfiles:{manny:{displayBodyHeight:80},mobdesert:{}},cartoonTiming:{desertSpin:[.16,.9]},cartoonPosture:()=>null,cartoonPrefetch(){},cartoonTexture:()=>({width:4096,height:4096}),cartoonPoseFallback:null,cartoonTextures:new Map(),cartoonTextureBytes:()=>0,cartoonTextureReserved:0,cartoonTextureBudget:64000000,cartoonTexturePeak:0,document:{createElement:()=>({getContext:()=>({clearRect(){},drawImage(){}})})},ctx:{save(){},restore(){},translate(...v){position=v;},scale(...v){scale=v;},drawImage(...v){draw=v;}}};
vm.createContext(c);
for(const [start,end]of [['function cartoonReleaseArt(','function cartoonShot('],['function cartoonRememberPose(','async function loadCartoonArt('],['function cartoonDrawCharacter(','const cartoonReducedMotion=']]){const a=source.indexOf(start);vm.runInContext(source.slice(a,source.indexOf(end,a)),c);}
const check=(a,b)=>{assert.deepEqual(a,b);count++;};
const fixture=lift=>({src:'body.webp',bodyHeight:275,releaseSocket:[.5,-.25],frames:Array.from({length:16},(_,i)=>({rect:[i*100,0,100,300],pivot:[50,280],duration:.05,...(lift===undefined?{}:{authoredRootLift:lift})}))});
for(const [id,h]of [['manny',80],['mobdesert',110]])for(const dir of [-1,1])for(const grounded of [false,true])for(const lift of [undefined,0,.5,-.25]){
 c.selectedCharacter=id;Object.assign(c.player,{dir,grounded});c.cartoon.action=null;c.cartoon.awake=0;c.cartoonPoseFallback=null;
 const art=c.cartoonNormalizeArt(fixture(lift),'https://fixture.test/');c.cartoonArt[id+'/jump']=c.cartoonArt[id+'/idle']=c.cartoonArt[id+'/special1-active']=art;
 const before=JSON.stringify(c.player),origin=JSON.stringify(c.cartoonReleaseOrigin({unique:true,specialIndex:0,dir}));
 check(c.cartoonDrawCharacter(),true);check(position,[490,240+(lift||0)*h]);check(scale,[dir,1]);check(draw[6],-280*h/275);check(JSON.stringify(c.player),before);check(JSON.stringify(c.cartoonReleaseOrigin({unique:true,specialIndex:0,dir})),origin);
 // Last-pose fallback uses the same normalized lift, independent of canvas resampling.
 check(c.cartoonPoseFallback.f.authoredRootLift,lift||0);c.cartoonTexture=()=>null;check(c.cartoonDrawCharacter(),true);check(position,[490,240+(lift||0)*h]);c.cartoonTexture=()=>({width:4096,height:4096});
}
// Unique special body phase and awakened variant use the selected frame's lift.
c.selectedCharacter='mobdesert';c.player.grounded=false;c.cartoon.awake=1;c.cartoon.action={unique:true,type:'desertSpin',specialIndex:0,phase:'active',age:.3,duration:1.4};
const v=fixture(.75);v.frames[0].authoredRootLift=0;const art=c.cartoonNormalizeArt(v,'https://fixture.test/');c.cartoonArt['mobdesert/awakened-special1-active']=art;check(c.cartoonDrawCharacter(),true);check(position,[490,322.5]);
for(const invalid of [null,'0.5',true,{},[],NaN,Infinity,-Infinity,32.001,-32.001]){assert.throws(()=>c.cartoonNormalizeArt(fixture(invalid),'https://fixture.test/'),/authoredRootLift/);count++;}
for(const valid of [-32,32])check(c.cartoonNormalizeArt(fixture(valid),'https://fixture.test/').frames[0].authoredRootLift,valid);
const absent=c.cartoonNormalizeArt(fixture(),'https://fixture.test/');check(Object.hasOwn(absent.frames[0],'authoredRootLift'),false);

// A queued/new attack must not be replaced by the preceding recovery pose.
c.selectedCharacter='manny';c.player.grounded=true;c.cartoon.awake=0;c.cartoon.recoveryAge=.2;c.cartoon.action={type:'light',index:2,age:.05,duration:.595};c.cartoonArt['manny/light2']=c.cartoonNormalizeArt(fixture(0),'https://fixture.test/');c.cartoonArt['manny/recovery']={...c.cartoonArt['manny/light2'],bodyHeight:550};check(c.cartoonDrawCharacter(),true);check(draw[6],-280*80/275);
c.cartoonArt['manny/light2'].nativeFacing=-1;c.cartoonPoseFallback=null;check(c.cartoonDrawCharacter(),true);check(scale,[-c.player.dir,1]);c.cartoonTexture=()=>null;check(c.cartoonDrawCharacter(),true);check(scale,[-c.player.dir,1]);for(const direction of [0,2,'left']){assert.throws(()=>c.cartoonNormalizeArt({...fixture(0),nativeFacing:direction},'https://fixture.test/'));count++;}
console.log(JSON.stringify({assertions:count,checks:'optional per-frame lift;80/110;left/right;ground/air;signed offset;unchanged physical state and release origin;cached pose;awakened special phase;invalid metadata rejection'}));
