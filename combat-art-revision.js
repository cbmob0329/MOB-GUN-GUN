'use strict';
// Scoped six-pack art integration. Original skill simulation remains authoritative.
function revisionBody(key,age,duration,dir=player.dir,range=null){
 const art=cartoonArt[key];if(!art)return false;const f=cartoonFrame(range?{...art,frameRange:range,loop:false}:art,age,duration),im=cartoonTexture(f.src);
 if(!im)return true;const k=110/art.bodyHeight;ctx.save();ctx.translate(player.x-camera,player.y);ctx.scale(dir*(art.nativeFacing||1),1);combatBlit(ctx,im,f.rect,-f.pivot[0]*k,-f.pivot[1]*k,f.rect[2]*k,f.rect[3]*k);ctx.restore();return true;
}
function cartoonThunderArt(g){return cartoonActive()&&cartoonDrawEffect(g.landed?'special2-ground':'special2-fall',g.x,g.y,360,g.landed?g.groundAge:g.age,undefined,player.dir);}
function cartoonNyoroProjectile(s){return cartoonActive()&&cartoonDrawEffect(s.kind==='rain'?'special1-rain':'special2-meteor',s.x,s.y,s.kind==='rain'?92:190,s.age,undefined,s.vx>0?-1:1);}
function cartoonNyoroImpact(f){return cartoonActive()&&cartoonDrawEffect(f.r===245?'special2-impact':'special1-impact',f.x,f.y,35,f.age,f.r===245?1.1:undefined,1);}
function cartoonNyoroFlame(f){return cartoonActive()&&cartoonDrawEffect('special2-flame',f.x,f.y-15,63,f.age,undefined,1);}
if(cartoonEnabled){
 const priorBody=drawPlayer;drawPlayer=function(){
  if(selectedCharacter==='denden'){
   if(thunderBullet&&revisionBody('denden/special3',thunderBullet.age,.72,thunderBullet.dir))return;
   if((skillState.charging||skillState.releaseAge<.48)&&revisionBody('denden/special1',skillState.charging?skillState.charge:.25+skillState.releaseAge))return;
   if(thunderLocked()&&revisionBody('denden/special2',skillState.thunderAge,2))return;
  }
  if(selectedCharacter==='nyoro'&&nyoroAction&&['rain','meteor'].includes(nyoroAction.type)&&revisionBody('nyoro/special'+(nyoroAction.type==='rain'?1:2),nyoroAction.age,nyoroAction.type==='rain'?undefined:1.1,nyoroAction.dir))return;
  priorBody();
 };
 const geometry=energyChargeGeometry;energyChargeGeometry=function(){
  const art=cartoonArt['denden/special1'];if(selectedCharacter!=='denden'||!art)return geometry();
  const charging=skillState.charging&&skillState.charge<CONFIG.skills.trick.maxCharge;
  const f=cartoonFrame(art,skillState.charge),i=Math.min(5,art.frames.indexOf(f)),socket=charging?art.chargeSockets[i]:art.releaseSocket;
  return {x:player.x+player.dir*socket[0]*110,y:player.y+socket[1]*110,r:geometry().r};
 };
 const energy=drawEnergy;drawEnergy=function(x,y,r,age){const art=cartoonEffectArt('special1-energy');if(selectedCharacter==='denden'&&art){const height=r*2,width=height*art.displayWidthAt110/art.displayHeightAt110;if(cartoonDrawEffectAtSize('special1-energy',x,y,width,height,age,undefined,player.dir))return;}energy(x,y,r,age);};
 const impact=drawBubbleExplosion;drawBubbleExplosion=function(ex){if(selectedCharacter==='denden'&&cartoonEffectArt('special1-impact')){ctx.save();ctx.globalAlpha*=Math.max(0,.65*(1-ex.age/.65));const drawn=cartoonDrawEffect('special1-impact',ex.x,ex.y,520,ex.age,.65,1);ctx.restore();if(drawn)return;}impact(ex);};
 const fire=fireSprite;fireSprite=function(i,x,y,size){if(selectedCharacter==='nyoro'&&[32,35].includes(size)&&cartoonEffectArt('special1-impact')){if(cartoonDrawEffect('special1-impact',x,y,size,elapsed,undefined,1))return;}fire(i,x,y,size);};
}

// Physics owns lift-off and contact. Only the pose windows depend on these states.
if(cartoonEnabled){
 const nyoroMoveTick=tick;tick=function(dt){const actor=player,grounded=player?.grounded,active=state==='playing'&&selectedCharacter==='nyoro'&&!(cartoon.hitStop>0);nyoroMoveTick(dt);if(!active||player!==actor)return;
  if(!player.grounded)cartoon.nyoroLandingAge=-1;
  else if(!grounded)cartoon.nyoroLandingAge=0;
  else if(cartoon.nyoroLandingAge>=0)cartoon.nyoroLandingAge+=dt;
  if(cartoon.action||cartoon.charge||nyoroAction||Math.abs(player.vx)>1)cartoon.nyoroLandingAge=-1;
 };
 const nyoroMoveDraw=drawPlayer;drawPlayer=function(){
  if(selectedCharacter==='nyoro'&&player.hp>0&&!cartoon.action&&!cartoon.charge&&!cartoonOriginalSkill()&&!cartoonPosture()&&!dive&&!ropeRide&&!(cartoon.hurtAge>0)){
   const art=cartoonArt['nyoro/jump'];
   if(art&&!player.grounded&&revisionBody('nyoro/jump',player.jumpAge,2*NYORO.jumpForce/CONFIG.gravity,player.dir,[3,11]))return;
   const landingDuration=art?art.duration-art.ends[10]:0;
   if(art&&player.grounded&&cartoon.nyoroLandingAge>=0&&cartoon.nyoroLandingAge<landingDuration&&revisionBody('nyoro/jump',cartoon.nyoroLandingAge,landingDuration,player.dir,[11,16]))return;
  }
  nyoroMoveDraw();
 };
}
