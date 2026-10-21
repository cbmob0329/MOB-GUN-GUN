/* Bounded, deduplicated image loading. No network API or browser dependency in planning. */
(function(root){'use strict';
function unique(xs){return [...new Set(xs.filter(Boolean))]}
function characterKeys(ids){return unique(ids.flatMap(id=>id==='mobrami'?[id,'mobramiAwakened']:id==='mobmint'?[id,'mobmintTransform']:[id]))}
function characterPaths(manifest,ids){return unique(characterKeys(ids).flatMap(id=>Object.values(manifest.characters[id]?.actions||{}).flat()))}
function startupPaths(manifest){return unique([...Object.values(manifest.characters).map(c=>c.actions.idle?.[0]),...Object.entries(manifest.stage||{}).filter(([k])=>/^(ui|mode|story)|^(title|brandLogo)$/.test(k)).map(([,p])=>p)])}
function create({ImageClass=root.Image,concurrency=8,timeout=15000,resolveSource=p=>p,onProgress=()=>{}}={}){
 const entries=new Map(),queue=[];let running=0,peak=0,requested=0,loaded=0;
 function register(path,metadata={}){let e=entries.get(path);if(!e){e={path,image:new ImageClass(),state:'idle'};entries.set(path,e);e.image._assetPath=path;}Object.assign(e.image,metadata);return e.image;}
 function pump(){while(running<concurrency&&queue.length){const e=queue.shift();running++;peak=Math.max(peak,running);e.state='loading';requested++;const started=Date.now();let done=false;const finish=error=>{if(done)return;done=true;clearTimeout(timer);e.image.onload=e.image.onerror=null;running--;e.ms=Date.now()-started;e.state=error?'error':'loaded';if(!error)loaded++;error?e.reject(error):e.resolve(e.image);onProgress({requested,loaded,running,peak,path:e.path,error:!!error});pump();};const timer=setTimeout(()=>finish(Error('画像の読み込みがタイムアウトしました: '+e.path)),timeout);e.image.onload=()=>finish(e.image.naturalWidth?null:Error('画像が空です: '+e.path));e.image.onerror=()=>finish(Error('画像を読み込めません: '+e.path));try{e.image.src=resolveSource(e.path)}catch(error){finish(error)}}}
 function one(path){register(path);const e=entries.get(path);if(e.state==='loaded')return Promise.resolve(e.image);if(e.state==='queued'||e.state==='loading')return e.promise;e.state='queued';e.promise=new Promise((resolve,reject)=>{e.resolve=resolve;e.reject=reject});queue.push(e);pump();return e.promise;}
 async function load(paths,progress=()=>{}){paths=unique(paths);const pending=paths.filter(p=>entries.get(p)?.state!=='loaded');let completed=paths.length-pending.length;progress(completed,paths.length);const results=await Promise.allSettled(pending.map(p=>one(p).then(value=>{progress(++completed,paths.length);return value},error=>{progress(completed,paths.length);throw error})));const failed=results.filter(r=>r.status==='rejected');if(failed.length){const error=Error(failed.length+'枚の画像を読み込めませんでした。再試行してください。\n'+failed.slice(0,3).map(r=>r.reason?.message||String(r.reason)).join('\n'));error.failures=failed.map(r=>r.reason?.message||String(r.reason));throw error;}return paths.map(p=>entries.get(p).image)}
 function plan(paths){paths=unique(paths);const cached=paths.filter(p=>entries.get(p)?.state==='loaded').length;return {total:paths.length,cached,pending:paths.length-cached};}
 return {register,load,plan,stats:()=>({requested,loaded,running,peak,registered:entries.size}),entries};
}
const api={create,unique,characterPaths,characterKeys,startupPaths};if(typeof module!=='undefined')module.exports=api;else root.MobAssetLoader=api;
})(typeof window!=='undefined'?window:globalThis);
