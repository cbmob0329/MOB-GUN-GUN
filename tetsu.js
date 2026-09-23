'use strict';
// Damage is per enemy and per animation phase, never per render frame.
const TETSU = Object.freeze({normal:18,combo:28,comboMid:12,comboFinal:16,air:30,mob:[12,12,12,48],dash:36,afterimage:18,ultimate:96,cooldowns:[6,9,14]});
const tetsuFrames={};
let selectedCharacter='denden',tetsuAction=null,tetsuEffects=[],tetsuGhosts=[],tetsuCooldowns=[0,0,0],comboWindow=0;
// [body top, feet, body centre X] in the alpha-trimmed frame. Sword arcs,
// detached particles and speed trails must not shrink the character.
const tetsuBody={
 CS:[[0,1,.31],[.23,1,.39],[0,.78,.32],[.27,1,.34],[0,.93,.34],[.13,.96,.43],[0,.97,.29],[0,1,.32]],
 WK:Array.from({length:7},()=>[0,1,.39]),
 NA:[[0,1,.37],[.18,1,.54],[0,1,.32],[0,.98,.31],[0,1,.32],[0,1,.38]],
 HS:[[0,1,.36],[0,.89,.42],[.03,1,.66],[.24,.85,.48],[0,.93,.62],[.10,.92,.43]],
 HSP:[[0,1,.33],[0,1,.68],[0,1,.69],[0,1,.72],[0,1,.72],[0,1,.72],[.1,1,.68],[0,1,.62]],
 JS:[[0,1,.35],[0,1,.34],[0,.83,.36],[.05,1,.68],[.25,1,.65],[.30,.88,.39],[.49,1,.34],[0,.98,.34]],
 PS:[[0,1,.33],[.12,1,.37],[.12,1,.37],[.08,.95,.47],[.12,1,.33],[.20,1,.32],[.22,1,.56],[0,1,.60]]
};
async function loadTetsu(){
 await Promise.all(Object.entries({CS:8,WK:7,HSP:8,NA:6,HS:6,JS:8,PS:8,SKILL:16}).map(async([group,count])=>{
  tetsuFrames[group]=await Promise.all(Array.from({length:count},async(_,i)=>{
   const img=await loadImage(`tetsu/${group}/${String(i+1).padStart(group==='SKILL'?2:3,'0')}.png`);
   const surface=document.createElement('canvas');surface.width=img.width;surface.height=img.height;
   const c=surface.getContext('2d',{willReadFrequently:true});c.drawImage(img,0,0);
   const pixels=c.getImageData(0,0,img.width,img.height).data;let left=img.width,top=img.height,right=0,bottom=0;
   for(let y=0;y<img.height;y++)for(let x=0;x<img.width;x++)if(pixels[(y*img.width+x)*4+3]>8){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);}
   const w=right-left,h=bottom-top;if(!w||!h)throw Error(`Empty sprite: ${group}/${i+1}`);
   const body=tetsuBody[group]?.[i]||[0,1,.5];
   return {img,sx:left,sy:top,w,h,scale:CONFIG.playerHeight/(h*(body[1]-body[0])),anchorX:w*body[2],anchorY:h*body[1]};
  }));
 }));
}
function resetTetsu(){tetsuAction=null;tetsuEffects=[];tetsuGhosts=[];tetsuCooldowns=[0,0,0];comboWindow=0;}
function selectCharacter(character){
 if(state==='playing'||state==='paused'||state==='loading')return;
 if(character==='miramob'&&!adminUnlocked)return;
 selectedCharacter=character;reset();updateCharacterUI();
}
function updateCharacterUI(){
 const isTetsu=selectedCharacter==='tetsu',isNyoro=selectedCharacter==='nyoro';
 for(const b of document.querySelectorAll('[data-character]'))b.setAttribute('aria-pressed',String(b.dataset.character===selectedCharacter));
 $('shoot').innerHTML=(isTetsu||isNyoro)?'<span>⚔</span>ATK':'<span>⌖</span>SHOOT';
 document.querySelector('.keyboard-help').textContent=isTetsu?'A D 移動 / SHIFT ダッシュ / SPACE ジャンプ / J 攻撃・2回で連撃 / 1・2・3 スキル':'A D 移動 / SHIFT ダッシュ / SPACE ジャンプ / J 射撃 / 1 自動溜め撃ち / 2 雷 / 3 雷弾 / R 支援';
 const names=isTetsu?['MOB斬り','モブテツ一閃','スキル3・超吹き飛ばし']:['トリック・ザ・デンデン：ワンタップ','サンダーボルト','デンデン・サンダー・バレット'];
 skillButtons.forEach((b,i)=>{b.hidden=false;b.title=names[i];b.setAttribute('aria-label',names[i]);b.style.opacity='1';b.innerHTML=`<img src="${isTetsu?'tetsu/SKILL/'+['12','08','16'][i]+'.png':['skill/017.png','skill/86.png','skill/035.png'][i]}" alt=""><small></small>`;});
 $('character-copy').textContent=isTetsu?'モブテツ｜ATK 2回で連撃・空中ATKで茄子落とし。1：MOB斬り / 2：一閃 / 3：超吹き飛ばし':'デンデン｜8発で自動リロード（1秒・最後は雷ボム）。1：自動溜め撃ち / 2：落雷 / 3：雷弾';
 document.querySelector('#instructions span:last-child').innerHTML=isTetsu?'JUMP ＋ ATK<br><b>空中でモブテツ流茄子落とし</b>':'JUMP ＋ SHOOT<br><b>走りながら、空中でも撃てる</b>';
 if(isNyoro){const names=['ヒノフルカヨウ','炎列・大隕石','炎の召喚'];skillButtons.forEach((b,i)=>{b.hidden=false;b.title=names[i];b.setAttribute('aria-label',names[i]);b.innerHTML=`<img src="nyoro/${['04','05','237'][i]}.png" alt=""><small></small>`;});$('character-copy').textContent='モブニョロ｜ATK 2回で炎アッパー。空中で再ジャンプすると滑空＆火の雨。1：ヒノフルカヨウ / 2：大隕石 / 3：炎の足場';document.querySelector('.keyboard-help').textContent='A D 移動 / SHIFT ダッシュ / SPACE ジャンプ・再入力で滑空 / J 連撃 / 1・2・3 スキル / R 集合・2回で支援';document.querySelector('#instructions span:last-child').innerHTML='JUMP → JUMP<br><b>滑空しながら小さな炎を落とす</b>';}
 if(selectedCharacter==='miramob'){$('shoot').innerHTML='<span>⚔</span>ATK';const names=['ゆらゆら四連斬','髑髏大爆発'];skillButtons.forEach((b,i)=>{b.hidden=i===2;if(i<2){b.title=names[i];b.setAttribute('aria-label',names[i]);b.innerHTML=`<img src="enemy/miramob/${i===0?'38':'43'}.png" alt=""><small></small>`;}});document.querySelector('#instructions span:last-child').innerHTML='ATK ＋ SKILL<br><b>紫の爪斬りと髑髏の魔法</b>';$('character-copy').textContent='ミラモブ｜管理者プレイ。ATK：紫の爪斬り / 1：四連斬 / 2：溜めて髑髏大爆発';document.querySelector('.keyboard-help').textContent='A D 移動 / SHIFT ダッシュ / SPACE ジャンプ / J 爪斬り / 1 四連斬 / 2 髑髏大爆発';}
 updateHUD();
}
function startTetsuAction(type){tetsuAction={type,age:0,dir:player.dir,hit:new Map(),queued:false,ghostClock:0};comboWindow=0;if(type==='ultimate')stunNearby();}
function tetsuGravity(){return tetsuAction?.type==='combo'&&tetsuAction.lifted&&tetsuAction.age<.48?600:CONFIG.gravity;}
function onTetsuLanding(){const a=tetsuAction;if(a?.type==='air'&&a.landedAt===undefined){a.landedAt=a.age;landingEffect(player.x,player.y);}}
function tetsuAttack(){
 if(selectedCharacter!=='tetsu'||state!=='playing'||bossIntro())return;
 if(tetsuAction){if(tetsuAction.type==='normal')tetsuAction.queued=true;return;}
 startTetsuAction(!player.grounded?'air':comboWindow>0?'combo':'normal');
}
function castTetsu(index){
 if(state!=='playing'||bossIntro()||tetsuAction||tetsuCooldowns[index]>0)return;
 startTetsuAction(['mob','dash','ultimate'][index]);tetsuCooldowns[index]=TETSU.cooldowns[index];
}
function launchEnemy(e,vx,vy,spin=0){if(e.type==='crate')return;if(e.type==='miramob'){e.stun=Math.max(e.stun||0,.18);e.x+=Math.sign(vx)*8;return;}const floor=e.dropping?CONFIG.groundY:e.launch?.floor??e.y;e.dropping=null;e.launch={vx,vy,spin,angle:0,floor};e.knock=0;if(e.type==='miira'){e.attackAge=-1;e.attackCooldown=MIIRA.cooldown;}}
function tetsuHit(a,phase,x,y,w,h,damage,launch){
 if(!a.hit.has(phase))a.hit.set(phase,new Set());const hit=a.hit.get(phase);
 for(const e of combatTargets()){if(e.death>=0||hit.has(e)||Math.abs(e.x-x)>w/2+e.w/2||e.y<y-h/2||e.y-e.h>y+h/2)continue;
  hit.add(e);hitEnemy(e,damage,a.dir);if(launch)launchEnemy(e,a.dir*launch[0],launch[1],launch[2]||0);
  if(a.type==='air'&&e.type!=='crate')tetsuEffects.push({x:e.x,y:e.y-e.h/2,age:0,first:0,count:4,duration:.4,size:150,dir:a.dir});
 }
}
function updateTetsu(dt){
 tetsuCooldowns=tetsuCooldowns.map(cd=>Math.max(0,cd-dt));comboWindow=Math.max(0,comboWindow-dt);
 for(const fx of tetsuEffects)fx.age+=dt;tetsuEffects=tetsuEffects.filter(f=>f.age<f.duration);
 for(const g of tetsuGhosts)g.life-=dt;tetsuGhosts=tetsuGhosts.filter(g=>g.life>0);
 const a=tetsuAction;if(!a)return;a.age+=dt*(a.type==='combo'?1.3:1);const p=player,t=a.age,x=p.x+a.dir*72,y=p.y-42;
 if(a.type==='normal'&&t>=.08&&t<.24)tetsuHit(a,0,x,y,130,95,TETSU.normal);
 if(a.type==='combo'){
  if(t>=.16&&!a.lifted){a.lifted=true;p.vy=-150;p.grounded=false;p.coyote=0;}
  if(t>=.22&&t<.42)tetsuHit(a,'mid',x,y,160,105,TETSU.comboMid);
  if(a.lifted&&p.grounded&&a.landedAt===undefined){a.landedAt=t;burst(p.x+a.dir*35,p.y-3,10,'#bfe8ff');}
  if(a.landedAt!==undefined&&t-a.landedAt<.16)tetsuHit(a,'final',x,y,170,110,TETSU.comboFinal,[220,-190]);
 }
 if(a.type==='air'&&t>=.06){if(p.grounded)onTetsuLanding();tetsuHit(a,0,p.x+a.dir*25,p.y-20,a.landedAt===undefined?150:230,145,TETSU.air,[180,-650]);}
 if(a.type==='mob'&&t>=.16&&t<.88){const phase=Math.min(3,Math.floor((t-.16)/.18));tetsuHit(a,phase,p.x+a.dir*155,y-15,290,190,TETSU.mob[phase],phase===3?[850,-660]:null);if(phase===3&&!a.finisher){a.finisher=true;for(const targets of a.hit.values())for(const e of targets)launchEnemy(e,a.dir*850,-660);}}
 if(a.type==='dash'&&t>=.08&&t<.56){
  tetsuHit(a,'body',p.x+a.dir*30,y,130,120,TETSU.dash,[400,-230]);
  tetsuHit(a,'ghost',p.x+a.dir*100,y,130,130,TETSU.afterimage);
  a.ghostClock-=dt;if(a.ghostClock<=0){a.ghostClock=.045;tetsuGhosts.push({x:p.x+a.dir*85,y:p.y,dir:a.dir,frame:tetsuPose(),life:.18});}
 }
 if(a.type==='ultimate'&&t<1.1)stunNearby();
 if(a.type==='ultimate'&&t>=1.1&&t<1.78)tetsuHit(a,0,p.x+a.dir*140,y,320,220,TETSU.ultimate,[1050,-1150,19]);
 const duration={normal:.30,combo:a.landedAt===undefined?Infinity:a.landedAt+.20,air:a.landedAt===undefined?Infinity:a.landedAt+.22,mob:1.0,dash:.72,ultimate:2.12}[a.type];
 if(t>=duration){tetsuAction=null;if(a.type==='normal'){if(a.queued)startTetsuAction('combo');else comboWindow=.22;}}
}
function tetsuPose(){
 const a=tetsuAction;let group='CS',i=0;
 if(a){const t=a.age;group={normal:'NA',combo:'HS',air:'JS',mob:'CS',dash:'HSP',ultimate:'PS'}[a.type];
  if(a.type==='ultimate')i=t<.1?0:t<1.1?1+Math.floor((t-.1)/.05)%2:t<1.26?3:t<1.42?4:t<1.82?5:t<1.97?6:7;
  else if(a.type==='air')i=a.landedAt!==undefined?(t-a.landedAt<.1?6:7):t<.06?3:t<.12?4:5;
  else if(a.type==='combo')i=a.landedAt!==undefined?5:t<.10?0:t<.20?1:t<.28?2:t<.42?3:4;
  else i=Math.min(tetsuFrames[group].length-1,Math.floor(t/({normal:.05,combo:.0834,mob:.125,dash:.09}[a.type])));
 }else if(!player.grounded){group='JS';i=player.jumpAge<.1?0:player.vy<0?1:2;}
 else if(Math.abs(player.vx)>1){group=running?'HSP':'WK';i=running?1+Math.floor(player.anim*14)%3:Math.floor(player.anim*10)%7;}
 return tetsuFrames[group]?.[i];
}
function paintTetsu(frame,x,y,dir,alpha=1){if(!frame)return;const f=frame;ctx.save();ctx.translate(x-camera,y);ctx.scale(dir,1);ctx.globalAlpha*=alpha;ctx.drawImage(f.img,f.sx,f.sy,f.w,f.h,-f.anchorX*f.scale,-f.anchorY*f.scale,f.w*f.scale,f.h*f.scale);ctx.restore();}
function drawTetsu(){
 for(const g of tetsuGhosts)paintTetsu(g.frame,g.x,g.y,g.dir,g.life/.18*.4);
 ctx.save();if(player.inv>0&&Math.floor(player.inv*16)%2===0)ctx.globalAlpha=.35;
 if(tetsuAction?.type==='air'){ctx.filter='sepia(.2) hue-rotate(235deg) saturate(1.5)';ctx.shadowColor='#ba72ff';ctx.shadowBlur=12;}
 if(player.red>0)ctx.filter='sepia(1) saturate(5) hue-rotate(315deg)';
 paintTetsu(tetsuPose(),player.x,player.y,player.dir);ctx.restore();
}
function drawTetsuEffect(first,index,x,y,size,dir){const f=tetsuFrames.SKILL?.[first+index];if(!f)return;const scale=size/Math.max(f.w,f.h);ctx.save();ctx.translate(x-camera,y);ctx.scale(dir,1);ctx.drawImage(f.img,f.sx,f.sy,f.w,f.h,-f.w*scale/2,-f.h*scale/2,f.w*scale,f.h*scale);ctx.restore();}
function drawTetsuEffects(){
 for(const f of tetsuEffects)drawTetsuEffect(f.first,Math.min(f.count-1,Math.floor(f.age/f.duration*f.count)),f.x,f.y,f.size,f.dir);
 const a=tetsuAction;if(!a)return;const t=a.age,p=player;
 if(a.type==='mob'&&t>=.16&&t<.88){const i=Math.min(3,Math.floor((t-.16)/.18));drawTetsuEffect(8,i,p.x+a.dir*155,p.y-57,i===3?330:290,a.dir);}
 if(a.type==='dash'&&t>=.08&&t<.64)drawTetsuEffect(4,Math.min(3,Math.floor((t-.08)/.14)),p.x+a.dir*100,p.y-45,220,a.dir);
 if(a.type==='ultimate'&&t>=1.1&&t<1.9)drawTetsuEffect(12,Math.min(3,Math.floor((t-1.1)/.2)),p.x+a.dir*140,p.y-60,340,a.dir);
}
