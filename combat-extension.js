'use strict';
// Pink's legacy art is a temporary visual fallback, not a completed 16-cel set.
let pinkPlayerFX=[];
if(cartoonEnabled){
 cartoonProfiles.pink={name:'モブピンク',color:'#ef93bc',displayBodyHeight:80};
 partyInfo.pink={name:'モブピンク',short:'モブピンク',line:'',color:'#ef93bc'};
 const choice=document.createElement('button');choice.dataset.character='pink';choice.textContent='モブピンク';choice.onclick=()=>selectCharacter('pink');document.querySelector('.character-options').append(choice);
 const roster=resetParty;resetParty=function(){roster();party.pink={hp:CONFIG.maxHP,regen:0,revive:0};const b=document.createElement('button');b.className='party-slot';b.dataset.party='pink';b.setAttribute('aria-label','モブピンクに切り替え');const portrait=document.createElement('canvas');portrait.width=portrait.height=100;const f=pinkFrames[0];if(f){const k=86/f.height;portrait.getContext('2d').drawImage(f,50-f.width*k/2,95-f.height*k,f.width*k,f.height*k);}const name=document.createElement('span');name.className='party-name';name.textContent='モブピンク';b.append(portrait,name,document.createElement('small'));b.onclick=()=>switchParty('pink');$('party').append(b);};
 const support=updatePink;updatePink=function(dt){if(selectedCharacter!=='pink')support(dt);};
 const supportDraw=drawPink;drawPink=function(){if(selectedCharacter==='pink'){$('pink-tap').hidden=true;$('pink-revive').hidden=true;return;}supportDraw();};
 const pinkFloor=pinkLandingHeight;pinkLandingHeight=function(...args){return selectedCharacter==='pink'?Infinity:pinkFloor(...args);};
 const command=commandPink;commandPink=function(){if(selectedCharacter!=='pink')command();};
 const cancel=cartoonCancel;cartoonCancel=function(){cancel();pinkPlayerFX=[];};
 const weak=cartoonWeak;cartoonWeak=function(){const result=weak();if(selectedCharacter==='pink'){if(cartoon.queued)cartoon.buffer=Math.max(1,cartoon.action.duration-cartoon.action.age+1);if(result&&cartoon.action?.type==='air'){cartoon.action.duration=.32;cartoon.action.timing=[.08,.24];cartoon.airLeft=Math.max(cartoon.airLeft,1.3);}if(result&&cartoon.action?.type==='light')Object.assign(cartoon.action,{duration:[0,.64,.68,.72,.82][cartoon.combo],timing:[.28,.48]});}return result;};
 const release=cartoonRelease;cartoonRelease=function(...args){const ok=release(...args);if(ok&&selectedCharacter==='pink'&&cartoon.action){const t={blow:[.60,.24,.44],launch:[.48,.18,.34],ranged:[.64,.24,.4],rush:[.72,.24,.54]}[cartoon.action.type];if(t)Object.assign(cartoon.action,{duration:t[0],timing:t.slice(1)});}return ok;};
 const shot=cartoonShot;cartoonShot=function(a,water){if(selectedCharacter!=='pink')return shot(a,water);pinkPlayerMagic(a);};
 const special=cartoonSpecial;cartoonSpecial=function(index){if(selectedCharacter!=='pink')return special(index);if(!cartoonReady()||cartoon.action||cartoon.charge||cartoon.cooldowns[index]>0)return false;cartoon.combo=0;cartoon.window=0;cartoon.cooldowns[index]=index?8:4.5;cartoonAction(index?'pinkShield':'pinkMagic',{duration:index?2.5:.64,timing:index?[.2,2.2]:[.24,.49]});return true;};
 const step=cartoonStep;cartoonStep=function(dt){const a=cartoon.action;step(dt);if(selectedCharacter==='pink'&&a?.type==='air'&&a.index===3&&cartoon.action?.type==='slam')Object.assign(cartoon.action,{duration:.36,timing:[.09,.23]});if(selectedCharacter==='pink'){if(a?.type==='light'&&!cartoon.action)cartoon.window=1;if(a?.type==='pinkMagic'&&a.age>=.24&&!a.fired){a.fired=true;pinkPlayerMagic(a);}}for(const f of pinkPlayerFX)f.age+=dt;pinkPlayerFX=pinkPlayerFX.filter(f=>f.age<.4);};
 const damage=damagePlayer;damagePlayer=function(enemy,amount){if(selectedCharacter==='pink'&&cartoon.action?.type==='pinkShield'&&cartoon.action.phase==='active'&&enemy.guardable!==false&&(enemy.x-player.x)*player.dir>=0){if(player.inv>0)return;const n=amount??CONFIG.enemies[enemy.type]?.damage??5;player.hp=Math.max(0,player.hp-Math.max(1,Math.ceil(n*.2)));player.inv=.18;player.red=.08;if(player.hp===0){cartoonCancel();partyDefeated();}return;}damage(enemy,amount);};
 const draw=drawPlayer;drawPlayer=function(){if(selectedCharacter!=='pink')return draw();const a=cartoon.action,posture=cartoonPosture();const key=a?.type==='pinkMagic'?'special1':a?.type==='pinkShield'?'special2':null;if(key&&cartoonArt['pink/'+key]){const art=cartoonArt['pink/'+key],f=cartoonFrame(art,a.age,a.duration),image=cartoonTexture(f.src);if(image){const k=80/art.bodyHeight;ctx.save();ctx.translate(player.x-camera,player.y);ctx.scale(player.dir*(art.nativeFacing||1),1);combatBlit(ctx,image,f.rect,-f.pivot[0]*k,-f.pivot[1]*k,f.rect[2]*k,f.rect[3]*k);ctx.restore();return;}}else if(!key&&!cartoon.charge&&!posture&&(!a||a.type==='light')&&cartoonArt['pink/idle']&&cartoonDrawCharacter())return;
 const age=a?.age||player.jumpAge||player.anim;const i=key==='special1'||a?.type==='ranged'?40+Math.min(7,Math.floor(age/.08)):key==='special2'||posture==='guard'||cartoon.charge?24+Math.floor(player.anim*14)%8:a?8+Math.min(7,Math.floor(age/a.duration*8)):!player.grounded?32+Math.min(7,Math.floor(player.jumpAge/.09)):Math.abs(player.vx)>1?(running?16:0)+Math.floor(player.anim*(running?14:10))%8:0;const f=pinkFrames[i];if(!f)return;const k=80/f.height;ctx.save();ctx.translate(player.x-camera,player.y);ctx.scale(player.dir,1);ctx.drawImage(f,-f.width*k*.48,-80,f.width*k,80);ctx.restore();};
 const fx=drawSkills;drawSkills=function(){fx();for(const f of pinkPlayerFX){if(selectedCharacter==='pink'&&cartoonDrawEffect('special1-magic',f.x,f.y,160,f.age,.4,f.dir))continue;const image=anomaFrames[Math.min(3,Math.floor(f.age/.1))];if(image){const h=160;ctx.drawImage(image,f.x-camera-image.width/image.height*h/2,f.y-h,image.width/image.height*h,h);}}};
 const ui=cartoonUI;cartoonUI=function(){ui();if(selectedCharacter!=='pink')return;for(let i=0;i<2;i++){const b=skillButtons[i],name=['前方魔法','盾支援'][i];b.title=name;b.setAttribute('aria-label',name);b.querySelector('small').textContent=cartoon.cooldowns[i]>0?cartoon.cooldowns[i].toFixed(1)+'s':name;const img=b.querySelector('img');if(img)img.hidden=true;}};
}
function pinkPlayerMagic(a){const f={x:player.x+a.dir*90,y:supportFloorAt(player.x+a.dir*90,player.y-50),dir:a.dir,age:0};if(!Number.isFinite(f.y))f.y=player.y;pinkPlayerFX.push(f);for(const e of combatTargets()){if(e.death>=0||Math.abs(e.x-f.x)>90+e.w/2||e.y<f.y-145||e.y-e.h>f.y+10)continue;hitEnemy(e,20,a.dir);launchEnemy(e,a.dir*140,-720,14);}}

// Flatten traversal geometry in all twenty campaign areas; retain biome backgrounds and bosses.
if(cartoonEnabled){
 const build=buildGrassArea;buildGrassArea=function(){build();platforms=[];gaps=[];bridges=[];ramps=[];crumbles=[];trampolines=[];ropes=[];ropeRide=null;sandHills=[];townTires=[];for(const e of enemies){e.y=CONFIG.groundY;e.dropping=null;}for(const c of coins)c.y=CONFIG.groundY-42;for(const c of crates)c.y=CONFIG.groundY;checkpoint={x:140,y:CONFIG.groundY};
  if(!arenas.length){const x=Math.round(currentArea().width*.35);arenas.push({id:'combat-'+biomeIndex+'-'+areaIndex,x,right:x+1150,state:'idle',age:0,clock:0,wave:0,waves:2,perWave:3,spawned:0});}
 };
 const boxes=grassSolidBoxes;grassSolidBoxes=function(){return cartoonEnabled?[]:boxes();};
}

if(cartoonEnabled){const resetCombatRoom=reset;reset=function(){resetCombatRoom();platforms=[];};}

if(cartoonEnabled){
 const pinkReset=reset;reset=function(){pinkReset();if(selectedCharacter==='pink')pink.enabled=false;};
 const pinkSwitch=switchParty;switchParty=function(...args){const changed=pinkSwitch(...args);if(changed)pink.enabled=selectedCharacter!=='pink'&&!cartoonLab;return changed;};
}

// Reuse each world's painted panorama without mirroring or overlapping its lettering.
const combatFloors=new Map();
function combatFloor(image){
 if(combatFloors.has(image))return combatFloors.get(image);
 const c=document.createElement('canvas');c.width=560;c.height=240;const g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 // Small texture-only sample; never include signs or the large foreground rocks.
 const samples=[[.44,.68,.12,.10],[.40,.70,.18,.15],[.40,.86,.18,.10],[.12,.87,.16,.11],[.40,.78,.16,.14]],r=samples[biomeIndex];g.drawImage(image,image.width*r[0],image.height*r[1],image.width*r[2],image.height*r[3],0,0,560,240);
 g.globalCompositeOperation='destination-in';const fade=g.createLinearGradient(0,0,80,0);fade.addColorStop(0,'transparent');fade.addColorStop(1,'#fff');g.fillStyle=fade;g.fillRect(0,0,560,240);combatFloors.set(image,c);return c;
}
if(cartoonEnabled){
 drawBackground=function(){const image=biomeIndex?biomeBackgrounds[BIOMES[biomeIndex].id]:assets.background;if(!image)return;const bh=890,bw=Math.max(W,image.width/image.height*bh),progress=clamp(camera/Math.max(1,CONFIG.worldWidth-W),0,1),scroll=progress*(bw-W);ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(image,-scroll,-170,bw,bh);ctx.restore();};
 drawGrassGround=function(){const image=biomeIndex?biomeBackgrounds[BIOMES[biomeIndex].id]:assets.background;if(!image)return;const tile=combatFloor(image),period=480,first=Math.floor(camera/period)-1;ctx.save();ctx.imageSmoothingEnabled=true;for(let n=first;n<first+5;n++)ctx.drawImage(tile,n*period-camera,548,560,H-548+Math.abs(cameraY));ctx.strokeStyle=['#355c36','#826133','#524951','#161b38','#44272e'][biomeIndex];ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,548);ctx.lineTo(W,548);ctx.stroke();ctx.restore();};
 const sprite=grassSprite;grassSprite=function(group,index,x,y,w,h){const f=grassArt[group][index];if(!f)return sprite(group,index,x,y,w,h);ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(f.img,f.x,f.y,f.w,f.h,x,y,w,h);ctx.restore();};
 const biome=biomeSprite;biomeSprite=function(group,index,x,y,w,h){const f=biomeArt[BIOMES[biomeIndex].id]?.[group]?.[index];if(!f)return biome(group,index,x,y,w,h);ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(f.img,x,y,w,h);ctx.restore();};
}

if(cartoonEnabled){
 const status=document.createElement('div');status.id='combat-art-status';status.style.cssText='position:absolute;left:16px;top:132px;z-index:10;max-width:70%;padding:5px 9px;border-radius:6px;background:#17363be6;color:#fff3ca;font-size:12px;pointer-events:none';document.querySelector('main').append(status);
 const statusUI=cartoonUI;cartoonUI=function(){statusUI();status.hidden=!cartoonActive()||state!=='playing';status.textContent=cartoon.assetNotice|| (selectedCharacter==='hero'?'ラミ新素材統合：表示・接続を確認中':selectedCharacter==='pink'?'ピンク基本8候補：強・必殺などは旧素材':['denden','nyoro','tetsu'].includes(selectedCharacter)?'素材調整中：通常と必殺の外見は未統一':selectedCharacter==='manny'?'マニー歩行・ダッシュ候補：接地を確認中':'素材調整中：移動・魔法の修復待ち');};
}

// Candidate Tetsu replacement preserves the original combat simulation and event times.
function cartoonTetsuReplacement(){return selectedCharacter==='tetsu'&&['dash','ultimate'].includes(tetsuAction?.type)&&cartoonArt['tetsu/'+(tetsuAction.type==='dash'?'special1':'special2')];}
function cartoonTetsuBody(art,age,x,y,dir,alpha=1){const f=cartoonFrame(art,age),im=cartoonTexture(f.src);if(!im)return false;const k=110/art.bodyHeight;ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x-camera,y);ctx.scale(dir*(art.nativeFacing||1),1);combatBlit(ctx,im,f.rect,-f.pivot[0]*k,-f.pivot[1]*k,f.rect[2]*k,f.rect[3]*k);ctx.restore();return true;}
if(cartoonEnabled){
 const priorDraw=drawPlayer;drawPlayer=function(){const art=cartoonTetsuReplacement();if(!art)return priorDraw();const a=tetsuAction,t=a.age;
 if(a.type==='ultimate'&&t>=.1&&t<1.1)cartoonDrawEffect('special2-charge-aura',player.x,player.y,110,t-.1,1,a.dir);
 if(a.type==='dash')for(const g of tetsuGhosts){ctx.save();ctx.filter='sepia(.5) hue-rotate(235deg)';cartoonTetsuBody(art,Math.max(0,t-(.18-g.life)),g.x,g.y,g.dir,g.life/.18*.4);ctx.restore();}
 cartoonTetsuBody(art,t,player.x,player.y,a.dir);
 if(a.type==='ultimate'&&t>=.1&&t<1.97)cartoonDrawEffect('special2-charge-eye',player.x,player.y,110,t-.1,1.87,a.dir);
 };
 const priorFX=drawTetsuEffects;drawTetsuEffects=function(){if(!cartoonTetsuReplacement())return priorFX();const a=tetsuAction,t=a.age;if(a.type==='dash'&&t>=.08&&t<.64)cartoonDrawEffect('special1-slash',player.x+a.dir*100,player.y-45,220,t-.08,.56,a.dir);if(a.type==='ultimate'&&t>=1.1&&t<1.9)cartoonDrawEffect('special2-blast',player.x+a.dir*140,player.y-60,340,t-1.1,.8,a.dir);};
 // Do not start the old-body skill while the replacement is loading.
 const priorSpecial=cartoonSpecial;cartoonSpecial=function(index){if(selectedCharacter==='tetsu'&&index<2){cartoonPrefetch();const keys=['tetsu/special'+(index+1),...(index?['tetsu/effects/special2-charge-aura','tetsu/effects/special2-charge-eye','tetsu/effects/special2-blast']:['tetsu/effects/special1-slash'])];let ready=true;for(const key of keys){const art=cartoonArt[key];if(!art)continue;for(const src of new Set(art.frames.map(f=>f.src)))if(!cartoonTexture(src))ready=false;}if(!ready){cartoon.assetNotice='必殺素材を読込中です。読込後に再入力してください';return false;}cartoon.assetNotice='';}return priorSpecial(index);};
}
