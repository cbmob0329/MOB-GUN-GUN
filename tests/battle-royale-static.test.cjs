// No browser or third-party dependencies. Run: node tests/battle-royale-static.test.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = process.argv[2] || path.resolve(__dirname, '../battle-royale');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).filter(code => code.trim());
assert.equal(scripts.length, 28);
scripts.forEach((code, i) => new vm.Script(code, { filename: `inline-${i}.js` }));
new vm.Script(fs.readFileSync(path.join(root, 'adventure-stage.js'), 'utf8'), { filename: 'adventure-stage.js' });
const context = vm.createContext({});
context.window = context;
// Evaluate only the engine and serialized data, never DOM/game-loop code.
for (const i of [0, 1, 25]) vm.runInContext(scripts[i], context, { timeout: 5000 });
assert.equal(Object.keys(context.Arena.CHARS).length, 20);
assert.equal(context.Arena.BOXES.count, 2);
assert.deepEqual(Array.from(context.Arena.BOXES.centers), [200, 2200]);
assert.equal(context.Arena.NORMALS.mobrami[0].active, 0.16);
const files = new Set();
function walk(dir, prefix = '') {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const relative = prefix + item.name;
    if (item.isDirectory()) walk(path.join(dir, item.name), relative + '/');
    else files.add(relative);
  }
}
walk(root);
assert.equal(new Set([...files].map(p => p.toLowerCase())).size, files.size, 'Case-colliding paths');
const required = new Set();
function inspect(value) {
  if (typeof value === 'string' && /^(assets|adventure)\//.test(value) && /\.(webp|png|jpg|jpeg|json|wav|mp3|ogg)$/.test(value)) required.add(value);
  else if (Array.isArray(value)) value.forEach(inspect);
  else if (value && typeof value === 'object') Object.values(value).forEach(inspect);
}
inspect(context.ARENA_ASSETS);
inspect(context.MOB_ADVENTURE_DATA);
// Include literal paths elsewhere; exclude old metadata dictionary keys, which aren't loaded.
for (const m of html.matchAll(/["']((?:assets|adventure)\/[^"'\n]+\.(?:webp|png|jpg|json|mp3|ogg|wav))["'](?!\s*:)/g)) required.add(m[1]);
const missing = [...required].filter(p => !files.has(p));
assert.deepEqual(missing, [], 'Missing or incorrectly cased assets');
assert(!/<(?:script|link)\b[^>]*(?:src|href)=["'](?:https?:)?\/\//i.test(html), 'External script/style dependency');
assert(!/\b(?:fetch\s*\(|XMLHttpRequest|WebSocket|import\s*\()/.test(html), 'Network API requires review');
for (const match of html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
  const ref = match[1];
  if (ref.startsWith('#') || ref.includes('${') || /^(data:|https?:)/.test(ref)) continue;
  assert(!ref.startsWith('/'), `Root-relative URL: ${ref}`);
  assert(fs.existsSync(path.resolve(root, ref.split(/[?#]/)[0])), `Missing HTML reference: ${ref}`);
}
assert(!html.includes('href="../index.html"'), 'Legacy return must be absent from normal navigation');
const original = fs.readFileSync(path.join(root, '../index.html'), 'utf8');
assert(original.includes('location.replace("battle-royale/index.html" + location.search + location.hash)'), 'Direct relative entry');
assert(fs.existsSync(path.join(root, '../legacy-gungun.html')), 'Recoverable legacy entry');
// These authored poses face right already; mirroring them made rightward jumps face left.
for (const name of ['locomotion_11','locomotion_12','locomotion_13','context_11','context_12']) {
  assert.equal(context.ARENA_ASSETS.characters.asamob.nativeFacingByFrame['assets/asamob/v18/'+name+'.webp'], 1);
}
assert.equal(context.ARENA_ASSETS.characters.asamob.nativeFacingByFrame['assets/asamob/v18/locomotion_10.webp'], -1, 'Keep left-facing takeoff normalization');
for (const base of ['https://example.test/', 'https://example.test/MOB-GUN-GUN/']) {
  const target = new URL('battle-royale/index.html', base+'index.html');
  assert.equal(target.pathname, new URL(base).pathname+'battle-royale/index.html');
}
console.log(`PASS: ${scripts.length} scripts parse; 20 fighters; v31e boxes/Rami timing; ${required.size} exact-case asset references; relative navigation; no external runtime APIs.`);
