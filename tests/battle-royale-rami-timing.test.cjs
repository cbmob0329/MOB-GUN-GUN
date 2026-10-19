const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const htmlPath = process.argv[2] || path.join(__dirname, '../battle-royale/index.html');
const scripts = [...fs.readFileSync(htmlPath, 'utf8').matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).filter(code => code.trim());
const c = vm.createContext({}); c.window = c;
for (const i of [0, 1, 19]) vm.runInContext(scripts[i], c);
c.moveDef = c.Arena.moveDef; c.clamp = c.Arena.clamp; c.game = null;
c.effectImage = () => {}; c.assets = {};
for (const [skin, spec] of Object.entries(c.ARENA_ASSETS.characters)) {
  c.assets[skin] = Object.fromEntries(Object.entries(spec.actions).map(([action, frames]) => [action, frames.map((src, index) => ({ src, index, naturalWidth: 320, naturalHeight: 320 }))]));
}
let drawn;
c.ctx = new Proxy({}, { get: (_, key) => key === 'drawImage' ? im => { drawn = im; } : () => {} });
vm.runInContext(scripts[21].slice(scripts[21].indexOf('function spriteAction('), scripts[21].indexOf('function effectImage(')), c);
const ms = t => Math.round(t * 10000) / 10;
function fixture(char, awakened = false, hit = false) {
  const g = new c.Arena.Game([{ char, team: 0, control: 'p1' }, { char: 'tetsu', team: 1, control: 'p2' }], { training: true, boxes: false, items: false, seed: 73 });
  g.platforms = [{ id: 0, x: 0, y: 1000, w: 2400, h: 100 }];
  for (const [i, f] of g.fighters.entries()) Object.assign(f, { x: i ? hit ? 680 : 1800 : 600, y: 1000, ground: 0, inv: 0, face: i ? -1 : 1 });
  if (awakened) g.fighters[0].ramiAwake = 12;
  return g;
}
function trace(char, awakened, hz, hit = false) {
  const g = fixture(char, awakened, hit), f = g.fighters[0], dt = 1 / hz;
  const rows = [], edges = [], windows = [], hits = [], starts = [], sent = new Set();
  let lastMove, readyAfter, count = 0;
  const damage = g.damage.bind(g);
  g.damage = (...args) => { const ok = damage(...args); if (ok) hits.push({ wallMs: ms((count + 1) * dt), simMs: ms(g.time), combo: f.move?.combo, damage: args[1] }); return ok; };
  for (count = 0; count < hz * 2.2; count++) {
    let press = count === 0;
    if (f.move && f.move.combo < 3) {
      const d = c.Arena.moveDef(f, 'melee');
      if (f.move.t >= Math.max(d.active, d.duration - .30) && !sent.has(f.move.id)) { press = true; sent.add(f.move.id); windows.push({ combo: f.move.combo, wallMs: ms(count * dt), moveMs: ms(f.move.t) }); }
    }
    if (press) edges.push(ms(count * dt));
    g.step(dt, { p1: press ? { weak: true } : {} });
    if (f.move && f.move.id !== lastMove) { lastMove = f.move.id; starts.push({ combo: f.move.combo, wallMs: ms((count + 1) * dt) }); }
    drawn = null; c.game = g; c.sprite(f);
    const d = f.move && c.Arena.moveDef(f, f.move.kind);
    rows.push({ wallMs: ms((count + 1) * dt), simMs: ms(g.time), input: press, combo: f.move?.combo || 0, moveMs: f.move ? ms(f.move.t) : null, frame: drawn?.index, src: drawn?.src, active: !!d && f.move.t >= d.active && f.move.t <= d.end, queued: !!f.move?.queued, canStart: g.canStart(f, 'weak'), coolMs: ms(f.cool.melee), hitstopMs: ms(g.hitstop) });
    if (starts.length === 3 && !f.move && g.canStart(f, 'weak') && readyAfter === undefined) readyAfter = ms((count + 1) * dt);
  }
  const summary = [1, 2, 3].map(combo => {
    const r = rows.filter(x => x.combo === combo);
    const contact = char === 'mobrami' ? [7,8,9,10,11] : Array.from(c.MobMotionV22.contactPhases[char]?.[combo - 1] || []);
    return { combo, activeMs: r.find(x => x.active)?.wallMs, visualContactMs: r.find(x => contact.includes(x.frame))?.wallMs, lastActiveMs: r.filter(x => x.active).at(-1)?.wallMs, lastVisualContactMs: r.filter(x => contact.includes(x.frame)).at(-1)?.wallMs, wrongActiveFrames: r.filter(x => x.active && !contact.includes(x.frame)).map(x => [x.wallMs,x.frame]), endMs: r.at(-1)?.wallMs };
  });
  return { char, awakened, hz, hit, edges, windows, starts, hits, readyAfterMs: readyAfter, summary, rows };
}
const traces = [];
for (const hz of [60, 120]) for (const char of ['mobrami', 'mobjessie', 'pink', 'tetsu']) traces.push(trace(char, false, hz));
traces.push(trace('mobrami', true, 60), trace('mobrami', false, 60, true));
if (process.env.MOB_TIMING_REPORT) fs.writeFileSync(process.env.MOB_TIMING_REPORT, JSON.stringify(traces, null, 2));
for (const t of traces) console.log(JSON.stringify({ ...t, rows: undefined }));
if (!process.env.MOB_TIMING_BASELINE) {
  for (const t of traces.filter(t => t.char === 'mobrami')) {
    assert.equal(t.starts.length, 3, 'Buffered three-hit chain');
    for (const combo of t.summary) assert.deepEqual(combo.wrongActiveFrames, [], 'Contact art must agree with live collision window');
    if (!t.hit) assert(t.readyAfterMs >= 1880 && t.readyAfterMs <= 1950, 'Keep existing chain duration and cooldown');
    else assert.equal(t.hits.length, 3, 'All three contacts retain their damage events');
  }
  console.log('PASS: real engine + sprite function timing at 60/120 Hz, awakened form and hitstop trace.');
}
