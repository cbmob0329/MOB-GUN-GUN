'use strict';
const PARTY={switchCooldown:5,healInterval:5,reviveTime:15};
const partyInfo={
 denden:{name:'モブデンデン',short:'デンデン',line:'オイラの出番でやんす！',color:'#90edff'},
 tetsu:{name:'モブテツ',short:'モブテツ',line:'拙者の出番でござる！',color:'#d9b0ff'},
 nyoro:{name:'モブニョロ',short:'モブニョロ',line:'僕も戦うニョロ～！',color:'#ffba83'},
 miramob:{name:'ミラモブ',short:'ミラモブ',line:'ゴミを始末してやろう',color:'#da94ff'}
};
let party={},partyCooldown=0,partyEntry=null,partyPending=false;
function resetParty(){
 party={};for(const id of ['denden','tetsu','nyoro',...(adminUnlocked?['miramob']:[])])party[id]={hp:CONFIG.maxHP,regen:0,revive:0};
 party.denden.ammo=CONFIG.magazineSize;party.denden.reload=0;partyCooldown=0;partyEntry=null;partyPending=false;
 const bar=$('party');bar.replaceChildren();
 for(const id of Object.keys(party)){
  const button=document.createElement('button');button.type='button';button.className='party-slot';button.dataset.party=id;button.title=partyInfo[id].name;button.setAttribute('aria-label',partyInfo[id].name+'に切り替え');
  const portrait=document.createElement('canvas');portrait.width=100;portrait.height=100;portrait.setAttribute('aria-hidden','true');const c=portrait.getContext('2d');
  if(id==='tetsu'){const f=tetsuFrames.CS[0],k=86/f.h;c.drawImage(f.img,f.sx,f.sy,f.w,f.h,50-f.w*k/2,95-f.h*k,f.w*k,f.h*k);}else{const f=id==='denden'?sprites[24]:id==='nyoro'?nyoroFrames[1]:miraFrames[1],k=86/f.height;c.drawImage(f,50-f.width*k/2,95-f.height*k,f.width*k,f.height*k);}
  const name=document.createElement('span');name.className='party-name';name.textContent=partyInfo[id].short;const status=document.createElement('small');button.append(portrait,name,status);button.onclick=()=>switchParty(id);bar.append(button);
 }
}
function cancelPartyAction(){
 clearInput();tetsuAction=null;tetsuEffects=[];tetsuGhosts=[];comboWindow=0;cancelNyoro();miraAction=null;
 miraShots=miraShots.filter(s=>s.hostile);miraEffects=miraEffects.filter(s=>s.hostile);
 energyShots=[];explosions=[];giantThunder=null;groundBolts=[];lightning=[];thunderBullet=null;thunderBursts=[];
 skillState.charging=false;skillState.charge=0;skillState.thunderAge=10;skillState.thunderLeft=0;skillState.releaseAge=10;
}
function switchParty(id,forced=false){
 if(state!=='playing'||bossIntro()||!party[id]||party[id].hp<=0||id===selectedCharacter||(!forced&&partyCooldown>1e-8))return false;
 const old=party[selectedCharacter];if(old){old.hp=player.hp;old.regen=0;if(selectedCharacter==='denden'){old.ammo=player.ammo;old.reload=player.reload;}}
 cancelPartyAction();selectedCharacter=id;const p=player;p.hp=party[id].hp;p.knock=0;p.red=0;p.purple=0;p.inv=Math.max(p.inv,1);p.anim=0;p.vx=0;p.vy=0;p.jumpsUsed=p.grounded?0:1;
 if(id==='denden'){p.ammo=party.denden.ammo;p.reload=party.denden.reload;shootClock=0;}
 partyCooldown=PARTY.switchCooldown;partyPending=false;partyEntry={id,age:0,next:0};
 if(id==='tetsu'){p.y=Math.max(110,p.y-230);p.grounded=false;p.coyote=0;p.vy=1150;startTetsuAction('air');}
 if(id==='nyoro'){p.y=Math.max(110,p.y-130);p.grounded=false;p.coyote=0;p.jumpsUsed=2;nyoroGlide=nyoroGlideUsed=true;p.vy=55;}
 if(id==='miramob'){const a=miraStart(p,'skull');a.age=2.2;miraCooldowns[1]=Math.max(miraCooldowns[1],MIRA.cooldowns[1]);}
 burst(p.x,p.y-40,22,partyInfo[id].color);updateCharacterUI();return true;
}
function partyDefeated(){
 const member=party[selectedCharacter];if(member){member.hp=0;member.revive=PARTY.reviveTime;member.regen=0;}
 partyPending=true;
 if(!Object.values(party).some(p=>p.hp>0)){partyPending=false;state='dead';modal('全員戦闘不能……',`COIN ${collected} / 撃破 ${kills}体`,'RETRY');}
}
function resolvePartyDefeat(){if(!partyPending||state!=='playing')return;const next=Object.keys(party).find(id=>id!==selectedCharacter&&party[id].hp>0);if(next)switchParty(next,true);}
function updateParty(dt){
 if(party[selectedCharacter])party[selectedCharacter].hp=player.hp;
 partyCooldown=Math.max(0,partyCooldown-dt);
 for(const [id,m] of Object.entries(party)){
  if(id===selectedCharacter)continue;
  let rest=dt;
  if(m.hp===0){const used=Math.min(rest,m.revive);m.revive=Math.max(0,m.revive-used);rest-=used;if(m.revive>1e-8)continue;m.revive=0;m.hp=1;m.regen=0;}
  if(m.hp<CONFIG.maxHP){m.regen+=rest;while(m.regen>=PARTY.healInterval-1e-8){m.regen=Math.max(0,m.regen-PARTY.healInterval);m.hp=Math.min(CONFIG.maxHP,m.hp+1);}}else m.regen=0;
  if(id==='denden'&&m.reload>0){m.reload=Math.max(0,m.reload-dt);if(m.reload===0)m.ammo=CONFIG.magazineSize;}
 }
 if(selectedCharacter!=='tetsu')tetsuCooldowns=tetsuCooldowns.map(c=>Math.max(0,c-dt));
 if(selectedCharacter!=='denden')skillState.cooldowns=skillState.cooldowns.map(c=>Math.max(0,c-dt));
 if(partyEntry){partyEntry.age+=dt;if(partyEntry.id==='denden'&&partyEntry.age<.65&&partyEntry.age>=partyEntry.next){fire();partyEntry.next+=.2;}if(partyEntry.age>=2.7)partyEntry=null;}
}
function updatePartyHUD(){
 if(!player)return;if(party[selectedCharacter])party[selectedCharacter].hp=player.hp;
 for(const button of $('party').children){const id=button.dataset.party,m=party[id],active=id===selectedCharacter,ready=state==='playing'&&!bossIntro()&&!active&&m.hp>0&&partyCooldown<=1e-8;
  button.disabled=!ready;button.classList.toggle('ready',ready);button.classList.toggle('active',active);button.classList.toggle('down',m.hp===0);button.setAttribute('aria-pressed',String(active));
  button.querySelector('small').textContent=m.hp===0?`復活 ${Math.ceil(m.revive)}秒`:!active&&partyCooldown>1e-8?`HP ${m.hp} · ${Math.ceil(partyCooldown)}秒`:`HP ${m.hp}${active?' 出撃':''}`;
 }
}
function drawPartyEntry(){const a=partyEntry;if(!a)return;const x=clamp(player.x-camera,175,W-175),y=clamp(player.y-160,185,440),info=partyInfo[a.id];ctx.save();ctx.globalAlpha=Math.min(1,(2.7-a.age)*3);rounded(x-167,y-30,334,45,12,'#fff8eaf2');ctx.fillStyle='#fff8ea';ctx.beginPath();ctx.moveTo(x-12,y+14);ctx.lineTo(x+12,y+14);ctx.lineTo(clamp(player.x-camera,x-155,x+155),y+32);ctx.fill();text(info.line,x,y,21,'#35263f');if(a.age<.7){ctx.globalAlpha=1-a.age/.7;ctx.strokeStyle=info.color;ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(player.x-camera,player.y-2,35+a.age*140,12+a.age*28,0,0,Math.PI*2);ctx.stroke();}ctx.restore();}
