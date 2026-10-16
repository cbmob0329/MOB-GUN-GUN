## 最新検証（2026-10-15・以下の過去記録より優先）

全体は素材修復中。完成扱いにはしない。

- ラミの通常/覚醒idleと覚醒開始/終了の原画向きを補正。歩行/ダッシュ/ジャンプ/溜め/強攻撃の向きメタデータを明示し、左右操作・覚醒終了を最新ブラウザーの1,727描画記録で検証（実行エラー0）。
- 攻撃後に倒れ姿勢から起き上がるrecovery画像を自動挿入していた処理を撤去。移動モーションの時計を切替時に再開。通常ダッシュ16枚目の大きな横槍・体形変化は原画由来として残し、フレーム削除による隠蔽はしていない。
- ラミ弱4段は0.56/0.595/0.63/0.7175秒（前版より12.5%短縮）、命中0.245〜0.42秒。弱1/2は別atlasで両方16枚すべて描画確認。弱2の9〜11枚目は振上げ姿勢。
- ラミの通常攻撃画像が未読込の間は攻撃時計・命中・前進を停止。3秒でキャンセルと再入力案内へ戻す。読込復帰後の再入力と自動recovery未挿入を実エンジンで検証。
- ピンク空中追撃0.32秒（命中0.08〜0.24）、3回目後の叩き落とし0.36秒（0.09〜0.23）。地上4連/4溜め分岐/前後防御/旧6必殺命中/20面構成等の185チェック通過。ピンクの体素材は旧8枚グループの暫定表示で、専用16枚以上は待ち。
- 5世界の既存カートゥーン背景を利用。画像は反転/重ね合わせせず1枚をゆっくり移動。前景床は同じ絵から採った繰返しテクスチャへ変更。衝突床Y548。小物の一部は旧ピクセル素材のまま。
- 20面実入力検証: タイトルから19面連続クリア（6500操作上限で終了）、最終の溶岩4面は開始地点から別実行し144.943秒/750操作/HP42でクリア。双方とも実行エラー0。移動・攻撃・パーティ交代・エリア遷移はキーボード/画面ボタン、戦闘中のHP・ダメージ・位置書換なし。最終面のテスト開始設定のみbiomeIndex=4,areaIndex=3でreset。20面連続クリアとは主張しない。証跡: task/gungun-quality-repair/routes-input-results.json と route-final-input-results.json。旧自動テストの「全員覚醒」「0.4秒以内に弱終了」等は現仕様と不一致。全既存テスト通過とは主張しない。
- 今回の追加確認: root-lift312、final-assets878、画像読込回帰。final-assetsは未使用aliasも含む参照テストで、全キーの実戦使用を意味しない。

残る素材作業: ラミの体格統一・フィギュアスケート型軸回転・専用FX、デンデンの固有デザイン修復、ニョロの新しい修復素材、旧3人の通常/必殺の絵柄統一、ピンク専用動作。旧3人の固有必殺の機能は復帰しているが、必殺中は旧体素材へ切り替わる。新規の代替デザインや丸/楕円FXで完成を装っていない。

資料: Downloads/MOB-BACKGROUNDS-REFERENCE.png（1,066,386bytes）、MOB-ORIGINAL-SKILLS-REVIEW.zip（4,211,039bytes）。起動はMOB-RAMI-START.cmdまたは http://127.0.0.1:4173/ 。既に開いたタブはCtrl+F5。

---

## 最新追記：弱速度・実描画・ボス戦
- ユーザーの「もう少し速く」に合わせラミ弱4段を12.5%短縮:0.56/0.595/0.63/0.7175秒。判定も同率で0.245〜0.42秒へ。入力受付1秒は維持。ピンクの原画契約時間は従来値のまま。
- 直前のrecovery画像が次の攻撃startupを上書きする経路を修正（action中は汎用recoveryを表示しない）。
- 実時間録画＋描画フックでweak1/weak2の別atlasと全16コマ表示を確認。weak2の9〜11コマも表示。weak1は胸高直線突き、weak2は低い位置から頭上へ斬り上げ。修正後4段の各命中は約0.25秒、HP96→84→70→54→30。
- ボス実入力QA: テスト開始時のみ入口付近へ配置、以後は実時間のキーボード/パーティ選択でドラゴン・ミラモブ・シャーティーを撃破。HP・敵HP・ダメージ・勝敗は書換なし。実行エラー0。20面全ルート自然操作ではない。記録:task/gungun-quality-repair/boss-input-results.json。
- 背景は既存stage/001〜005.pngを利用可能。草原/砂漠/町/ネオン/マグマ、各4面。ネオン1774×887、それ以外1536×1024。画面1280×720、床Y548、現在背景高さ890/Y-170/0.18倍スクロール。新描き直し未実施、前景ピクセル調/左右反転でMOB文字が裏返る残件あり。

# 進行中：ピンク接続・戦闘ステージ・FX修復待ち

最新: 全体は未完成。ラミ必殺1の振付はユーザー指定のフィギュアスケート風軸回転に確定。専用原画待ち。新技の汎用円/楕円/放射線によるFX代用と準備中の輪を削除。既存技の本来の描画は保持。専用FX未読込時は代替表示しない。

- combat-extension.js: ピンク7人目の操作キャラ。旧8枚素材による暫定描画で、4種類の独立原画/16コマは未完成。盾・拳・元魔法の範囲で連撃/溜め派生/元魔法/盾支援に接続。AIピンクとの二重化を防止。覚醒なし。
- ピンク必殺1: 全体0.64秒/発生0.24秒/威力20/元魔法FX0.4秒。必殺2: 全体2.5秒/前方防御0.2〜2.2秒/被害20%切上げ、後方は通常。
- 全20エリア: 高い足場、穴、階段、ロープ、砂丘、タイヤ、跳ね床、ボス部屋追加足場を除去。元背景/配色/敵種/ボス/エリア遷移を保持。増援区間のない面に2波×3体の戦闘区間を追加。背景cartoonの新原画は未着。
- ブラウザ175チェック通過: 元必殺6種の敵命中、ピンク4段/4溜め分岐/魔法時刻/盾前後差、全20面の床・増援あり、増援終了・道開放・次面・再戦。エラー0。テストは実ゲーム関数の固定刻み実行を含み、20面の自然操作通し・全ボス撃破ではない。
- 元必殺ダメージ確認(単一高HP対象、3秒観測): Denden120/156、Nyoro130/92、Tetsu54/96。継続/燃焼/複数攻撃を含む観測値。
- ラミ寸法: 全対象bodyHeight220、表示倍率0.5固定。visible外形idle117.5〜121px、jump82.5〜113、blow81.5〜117.5、charge-hold90〜113.5。外形には武器/姿勢も含むため頭身測定そのものではない。フレーム矩形へフィットして縮小する処理ではない。原画修復待ち。
- 起動: Downloads/MOB-RAMI-START.cmd。必要時サーバーを別プロセスで非表示起動してChrome等既定ブラウザへURLを開く。127.0.0.1:4173、ユーザー起動成功確認済み。外部公開なし。
- 原画レビュー: Downloads/MOB-ORIGINAL-SKILLS-REVIEW.zip、4211039bytes。旧技コンタクトシート/代表原寸/実FX描画。

---

# 2026-10-15 品質修復：未完了・ラミ先行確認

ユーザー実プレイで発覚した問題を修復中。以下の旧統合記録は品質受け入れ完了を意味しません。

- 退避: HEAD 1b99565、作業開始時差分なし。コード/manifestは task/gungun-quality-repair/*.before。元ZIP/原画は変更なし。
- 確認区間: 通常のローカル起動URLに ?combat-lab=1 を付ける。ラミ開始、平坦な床、雑魚3体、RAMI TEST / 再戦。通常キャンペーンの地形は保持。
- 修正: nativeFacingをclip単位で解釈（確認済みラミidle=-1,dash/jump=+1）。未監査のwalk/攻撃/覚醒は元設定のまま。原画ごとの顔/頭身差は補正していない。
- ジャンプ描画はplayer.jumpAgeに変更。移動/ジャンプ中の汎用recovery上書きを除外。歩行/走行開始時に絵の時計を再始動。
- ラミ弱4段は通常0.64/0.68/0.72/0.82秒。判定0.28–0.48秒、前進30px/s・硬直10px/s。攻撃画像未読込中は時計/判定停止。攻撃中先行入力1回、終了後受付1秒。移動/ジャンプで段数を0に戻す。後隙は移動/ジャンプで中断可能。
- 覚醒入力/ボタンはラミのみ。ダンス画像全体を回す疑似動作を削除。振付自体は原画修復待ち。
- 元必殺: 導入前760634aでDendenの溜め弾/巨大雷、Nyoro雨/隕石、Tetsu HSP/PSを確認。まだ共通技からの復元未実施。MOB斬りの強単体は保持。
- 未完了: ラミ体格/振付原画統一、残り全clip方向監査、元必殺復元、全員の遅い攻撃調整、新2人魔法同期、マニー追加原画、ピンク操作可能化、全ステージ平坦化/背景変更。今回これらの完了は主張しない。
- 旧ブラウザ一括テストの0.4秒攻撃終了/全員覚醒という期待は新仕様と不一致。全機能回帰済みではない。今回の実入力確認と既存素材契約テストを分けて報告する。

---

# Cartoon combat integration (2026-10-15)

## Orb and party portrait follow-up (2026-10-15)

Manny orb keeps its exact release socket, frame7, fixed FX orientation and80px body. It now starts at vx=direction*160,vy=120, accelerates down at900px/s², and skims at groundY-112 with vx=direction*420. Lifetime remains2.4s. Collision radius94 is inside the roughly112px visible orb radius and shares the exact FX center; normal/awakened visual scale is identical, with the existing1.35x awakened damage retained. The previous high-horizontal-only limitation below is superseded. No remote collision extension or socket shift.

Hero/Manny/Desert party slots now use100x100 transparent portraits cropped from approved normal idle frame1. No redrawing or atlas changes; the existing86px portrait fit, party status overlays and down-state grayscale apply. These three small HUD images do not enter the combat atlas LRU.

New tests/cartoon-orb.test.cjs:16 real-engine collision cases,24px-tall target at distances35/80/350/700, both directions and both forms; each target takes exactly one hit. All3 portrait images decode. Existing combat desktop/mobile377 assertions each pass without the former tall-target workaround. Final-assets878/root-lift303/FX113 also pass. Physical mobile/Safari remain untested.

Source pose review (frame numbers below are1-based within each phase):
- Denden special1-active8→9 and11→12: frames9–11 have narrower hood/head and changed forward pistol placement; fixed bodyHeight220 throughout. Not a pivot/scale jump.
- Nyoro special1 startup16→active1 and active16→recovery1: canopy/head/body mass changes at joins; active11–12 extend legs. Family bodyHeight194 across all3 phases.
- Nyoro special2 startup16→active1: canopy/face mass changes. Recovery8→9 (complete48-cel sequence40→41): strong crouch-to-rise rebound. Family bodyHeight175 across all3 phases, preserving approved family scale rather than the obsolete active-only203 annotation.
- Tetsu special1-active7–10: uneven stride/leg spacing with fixed bodyHeight220 and foot baseline.
All remain source-drawing variations; no evidence supports changing per-frame pivot or fit scale to repair them. Existing authoredRootLift correction covers Manny jump and Desert jump/special1 while leaving release sockets unchanged. Diagnostic20-frame comparison is in the task gungun-finish/body-review.png.


## Final 18-ZIP asset integration (2026-10-15)

This section supersedes older pending-art notes below. All 18 delivered ZIP sizes and SHA-256 hashes matched the supplied delivery manifest. Only the final existing3 seven parts, Rami runtime16-v2 five parts, and new-two six parts were installed under combat/runtime-final. Their originals remain unchanged. The combined cartoon-manifest.json resolves 282 source entries and 289 aliases (571 keys), with 279 static lossless WebP atlases, at most 4096px. Every full source sequence has at least 16 independently addressed frames. Awakened body drawings for existing3 and newtwo intentionally reuse normal cels; Rami has separate awakened sequences.

Rami special2-active is the supplied [16,24) phase of its full 32-cel sequence. The combined manifest uses the complete adapter plus frameRange [16,24) and absolute releaseFrame19, equivalent to exposed phase frame3. No old 4/8-frame artwork or old seven-part Rami set was added.

Special projectile release now occurs at its authored releaseFrame within the active window, weighted by frame durations. This preserves pre-release cels that previously skipped when the event fired at active start. Ranged attacks retain their fixed event time. Socket coordinates are unchanged; authoredRootLift applies only to body drawing. New-two generic water/aura/splash aliases were not added.

Validation: 38 PIECE tests separately passed after six artReady flags changed; GUN final-assets metadata/frame/socket tests878, root-lift303, release59, FX113, MOB timing90; browser combat desktop/mobile377 each; polish25 per each of3 viewports; all runtime key textures decoded without page/asset errors and6598 body frame/alias draw samples rendered. Real physics release events16 cover both directions for all six characters, plus new-two special1. Managed texture peak67108864 bytes (64MiB), initial atlas requests2; the separate LRU disposal/retry regression passed. Browser screenshots and JSON reports are in the task gungun-final-assets folder. These cache figures are not total browser/GPU process memory.

Known limits: Manny orb follows the approved overhead center and horizontal trajectory; short grounded enemies may pass underneath, so its collision test uses a tall target on its path. No trajectory or socket was silently changed. Existing source review flags (Denden leg/hood changes, Nyoro phase proportions, Tetsu stride and posture variation) remain; no repainting or per-frame rescaling was used to hide them. New-character party portrait slots still have text without dedicated portrait art; legacy party portraits/skill icons remain. Physical mobile hardware and Safari were not tested. No push, publication or deployment.


## Tetsu standalone strong: MOB slash revision

Only tetsu/blow (strong held and released without a preceding weak) now uses the original four-stage MOB slash. Weak1/2/3 charged branches and weak4 remain unchanged. Action duration is 1.0 action seconds, with startup 0-.16, four active windows .16-.34 / .34-.52 / .52-.70 / .70-.88, then recovery to 1.0. Modest forward movement is about 32 logical pixels per normal action excluding hitstop. Original hitbox is 290x190 centered 155 pixels forward and 57 above the feet; final launch is vx=direction*850, vy=-660. Original boss/crate launch rules remain.

Charge caps at .55 seconds: per-stage damage is round([12,12,12,48] * (.65+.35*chargeFraction) * awakeningMultiplier). Totals are 55 uncharged, 70 at .275 s, 84 fully charged, and 113 fully charged while awakened (1.35x). Damage multiplier snapshots at release. Each enemy can take damage once per stage. Final launch also catches previously hit victims that escaped the box, without extra remote damage. Interruption discards remaining stages.

New body hooks: tetsu/blow and tetsu/awakened-blow. Separate transparent FX hooks now use tetsu/effects/mob-slash-trail (body-side purple blade trail) and tetsu/effects/mob-slash-letters (forward M -> MO -> MOB -> burst); awakened variants prefix awakened- to each effect name. The superseded combined mob-slash key is no longer consumed. Trail runs over the 1.0-second body action, anchored at the feet. Letters are anchored at [direction*155,-57] from the feet and phase-locked to the four .18-second hit windows; burst starts at .70 with the final hit/launch. Each layer needs 16+ frames and stays separate from generic hit-heavy. Provide letters phaseRanges m/mo/mob/burst (16-frame default [0,4]/[4,8]/[8,12]/[12,16]). Per-frame pivot is in source pixels; optional clip socket:{offset:[x,y],size:N} uses logical game pixels relative to the layer anchor, with horizontal offset mirrored by facing. See the JSON contract for sizes. Each new normal/awakened source requires at least 16 independently addressed frames; no final artwork has arrived. Existing CS001-008 body and SKILL09-12 FX are provisional fallbacks, not final cartoon assets or text replacements.

MOB revision verification: tests/cartoon.test.cjs passed desktop 1280x720 and mobile-emulated 844x390, each with 280 state + 3 browser assertions (566 total). Includes all four characters/weak4/charged branches; MOB four charge levels, per-phase single-hit limits, final launch, left facing, damage/pause/party/retry interruption, awakened damage snapshot, escaped victims and late entrants. Party-entry projectiles are cleared only in the interruption fixture to isolate cancellation. Final-art pixels and physical mobile hardware remain unverified. Polish regression also passed all three viewports (75 logic assertions plus input/layout checks); current raw data is tests/cartoon-mob-polish-results.json. Other local browser tests ran concurrently, so new timing samples are diagnostic only. Performance measurements below retain their earlier source hash.

## Current revision: 16+ frames, combat response and held defense

This section supersedes the initial integration notes below. New hero's formal name is **モブラミ (Mob Rami)**. All four characters' normal/awakened motions and separate FX require at least 16 independently addressed frames per source clip. No new assets have been received, installed or visually verified. The earlier six ZIPs are not accepted final art. Legacy pixel sprites, the Rami text placeholder and procedural effects remain provisional.

- Ground attacks now have explicit startup, active hitbox and recovery windows. Each target is hit once per attack; startup/recovery cannot damage. A single weak input buffers for 0.30 s and expires; ground combo grace is 0.72 s after recovery.
- Confirmed hits freeze simulation for 40 ms (light) or 75 ms (heavy); guard impact freezes for 25 ms. Input still reaches the buffer while stopped. Camera impulses are capped at 4 logical pixels. Small hit flashes and camera motion respect reduced-motion preference.
- Launcher and aerial hits retain nearby targets. **air1 → air2 → air3 → automatic separate slam**; air3 no longer doubles as the slam. No fourth aerial weak input is buffered. Natural pursuit tests do not reposition the target between aerial strikes.
- Special 1: invincible dance (startup) → aura rush (active) → recovery. Special 2: jump/aim → diagonal energy release → descent/landing. Optional phase aliases share one full source animation. Combat damage/release timing is owned by the game, not image metadata.
- **L / GUARD HOLD**: stationary forward guard, 80% damage reduction with at least 1 chip damage. Back attacks and untyped environmental hazards bypass guard. **C / DUCK HOLD**: stationary crouch, 38px hurtbox for common enemy projectiles and enemy contact; low shots still hit. This does not add crawling through terrain. Guard takes precedence when both are held. Both suspend attacks and jumping while active, and clear on release/cancel/pause/retry/party switch. Existing **S / Down / DIVE** remains unchanged.
- Existing A/D, stick, Space/jump, J/weak, K/strong-hold-release, 1/2 specials, E/3 awakening remain. New defensive buttons are independently captured touch inputs. Awakening remains 12 s, move 1.8x, attack clock 1.65x, melee damage 1.35x and 24 s cooldown.

### Asset contract

See `combat/cartoon-animation-contract.json` for current body and effect keys. `charge-release` is not a separate required state: releasing transitions directly into the chosen branch. Body motion `guard` and `crouch` are now connected.

Use `{animations:{key:{adapter:"relative.json"}},aliases:{...}}` in `combat/cartoon-manifest.json`, or put complete clip objects in animations. Each clip has `src` or `pages`, `frames` (16+), optional `bodyHeight`, `loop` and `phaseRanges`. Each frame has `rect:[x,y,w,h]`, `pivot:[x,y]`, `duration` in seconds and optional `src` or `page`. Sources in an adapter resolve relative to that JSON. Nonlooping animations clamp at the last frame; action playback maps over the action duration. Multiple pages preserve frame order.

Example phase mapping: `phaseRanges:{startup:[0,5],active:[5,12],recovery:[12,16]}`. Ranges are zero-based and end-exclusive. `aliases:{"special1-active":{clip:"special1",phase:"active"},"dance":"special1-startup"}` reuses full-clip frame data/texture URLs instead of manufacturing extra frames. Define alias dependencies before aliases referring to them. Frame-address validation does not prove unique drawings: final pixels still need inspection.

Textures are loaded on demand, with a maximum dimension of 4096 and an LRU budget of 64 MiB for **new adapter textures only**. Legacy image memory is not included. Effects are capped at 40. Real final-atlas memory, loading hitches and mobile thermals are unverified.

### Current verification

`tests/cartoon.test.cjs` passed desktop/mobile with **168 state assertions + 3 browser assertions per viewport = 342 assertions**. It covers four characters, four ground stages, charge branches/release, natural aerial pursuit and separate slam, input interruption, awakening and reset. `tests/cartoon-polish.test.cjs` adds phases, hitstop, input TTL, 32-frame/two-page addressing, alias ranges, guard/crouch, actual CDP touch down/up/cancel and simultaneous stick+attack, button size/overlap checks and frame-time sampling. Final measured results are recorded after the latest run. Screenshots use original assets, not the pending new artwork.

The original party test fixture failure was reproduced with Git HEAD's original index.html, then corrected only in the fixture. Roster assertions now account for Rami. Full campaign completion, all boss interactions, final art appearance and physical Android/iOS/Safari testing remain outstanding. This is not a claim of parity with a modern commercial mobile game.

Final polish run passed 25 logic assertions per viewport (75 total) plus input and layout assertions at 1280x720, 844x390 and 667x375. All 9 action controls are in bounds and nonoverlapping; phone-sized controls are at least 44px in both dimensions. CDP touch events exercised weak, held strong/release/cancel, simultaneous stick+attack, held guard/crouch and cancellation. Desktop L/C keys and pause clearing held states also passed. Existing party tests passed both desktop and mobile after the final defense changes.

Local headless Edge measurements, 180 sampled frames per viewport after 30 warmup frames, original pixel sprites + 24 stunned high-HP enemies + provisional FX, desktop DPR1 / mobile emulation DPR2:

| Viewport | Update + draw p50 | Update + draw p95 | RAF interval p95 | Frames >20ms |
|---|---:|---:|---:|---:|
|1280x720|2.3ms|2.9ms|13.4ms|1/180|
|844x390|2.3ms|5.9ms|13.5ms|0/180|
|667x375|2.3ms|6.7ms|13.5ms|0/180|

Measured JS touch-handler dispatch-to-action time was 0–0.8ms across two weak touches per viewport. This is not device input-to-photon latency. CPU samples include the wrapped tick/draw/drawSkills functions, not all browser/GPU/compositor cost. These runs had **zero new atlas bytes loaded** and do not represent final animation streaming, enemy AI load or physical mobile hardware. One desktop scheduling interval exceeded 20ms; 60fps is a target, not a guarantee. Raw viewport measurements are in `tests/cartoon-polish-results.json`.

## Initial integration and transfer diagnosis (historical)

Open index.html through a local HTTP server. The new adapter loads by default; append `?legacy=1` for the original combat. No package dependencies are added to the game. Tests require Node, Playwright and Microsoft Edge: `node tests/cartoon.test.cjs`.

## Controls and implemented behavior

- A/D or stick: move; Space/jump: existing jump; J/weak: four ground strikes. Only one follow-up input buffers during a strike; holding J does not auto-repeat.
- K/strong: hold and release. The branch is captured at press: zero weak = knockback, one = launch and self-jump, two = ranged energy, three = advancing wide strike. Holding never auto-releases; pointer cancellation, pause, damage and switching cancel it. Charge reaches full strength at 0.55 s; shorter holds scale damage from 65% to 100%.
- Launcher enables three aerial weak strikes within 1.35 s; the third slams the enemy down. Grounding resets the aerial chain. Bosses retain the existing anti-launch rules.
- 1 = invincible dance then aura rush (8 s cooldown). Invincibility covers the dance only. 2 = jump and diagonal downward energy (10 s cooldown).
- E/3 = awakening for 12 s, 24 s shared cooldown from activation; movement 1.8x, action clock 1.65x, melee damage 1.35x. Empowered rush base damage 88 (normal 60), range 190 (135), speed 1050 (800). Empowered downward energy damage 80 (52), radius 90 (64). Existing character aura colors: Denden cyan, Nyoro orange, Tetsu violet, hero pink. Switching cancels awakening but retains shared cooldowns. Reset clears all combat state.
- Each strike advances. Existing enemies, hit/death handling, terrain, campaign, party health and support remain connected. Legacy entrance attacks remain.

## Asset status and connection

The existing three designs and weapons are retained with their original pixel sprites. These are NOT completed cartoon redraws. Hero has an explicit text placeholder, never a guessed design. All hero manifest sources are null until approved images can be obtained. Existing characters currently use their original appearances with aura during awakening; dedicated awakened bodies are pending.

`combat/cartoon-manifest.json` supports `idle`, `walk`, `light1`..`light4`, `charge`, `launch`, `air1`..`air3`, `ranged`, `rush`, `blow`, `dance`, `specialRush`, `water`, `awakened`, and `awakened-*` overrides. A regular sheet uses `{src,columns,rows,frames,fps,bodyHeight,foot:[x,y]}`. An irregular sheet uses `{src,frames:[{rect:[x,y,w,h],duration,pivot:[x,y]}],pivot,bodyHeight}`; duration is seconds and rect/pivot/bodyHeight are source pixels. Atlas metadata does not drive game damage, movement or hit timing. Those are owned by the combat state machine. Transparent water/aura effects are separate offscreen canvas sprites, with no body pixels baked in; final artist effects are pending.

Approved hero IDs: normal `libfile_697b0bca28648191805f850b59bd8dd3`, walk `libfile_3a9ec912d2488191b17ea1cdada6dc18`, awakened05 `libfile_3f42dd78f75081919a9ebd9280fa0348`. Official Library transfer helper downloaded bytes but failed final materialization on Windows with `AttributeError: module 'os' has no attribute 'setxattr'`. No unsupported transfer workaround was used and these images were not integrated or visually verified.

Reference ZIP for parent artwork: `libfile_c19148749e548191b4a2421b185d4717`, `character-reference.zip`, 1,331,207 bytes. Contains six representative PNGs and movement/weapon mapping. Upload succeeded; local Library extended attributes could not be applied for the same Windows helper incompatibility.

## Validation

`tests/cartoon.test.cjs`: desktop 1280x720 and mobile 844x390, all four character logic paths, four ground stages, four charge release branches, no auto release, aerial cap/slam, cancellation, dance immunity, water projectile, awakening expiry and speed, input spam, switch interruption/cooldown, damage interruption, pause and retry. Real rendered screenshots were inspected at both sizes. This is browser emulation, not a physical phone/Safari test.

Existing `combat-regression.test.cjs` passed desktop/mobile before changes and again after integration in legacy mode. The original `party.test.cjs` expected exactly three members: its roster and all-members-defeated assertions now include the hero only in cartoon mode. Its pre-existing null `bossRoom.state` fixture failure was reproduced using the unmodified Git HEAD index.html (adapter never loaded), at the same evaluation line 14. The test now explicitly sets up and restores the cinematic fixture; production boss code was not changed. The rest of the full campaign suite has not been run. Full playthrough balance, all bosses, final cartoon animation quality and approved hero/awakened artwork remain unverified.

New combat test exact count: 144 state assertions plus 3 browser assertions for each of two viewports = 294 executed assertions, not 294 separately isolated test cases. Four character logic paths run per viewport. Screenshots are desktop/mobile emulation.

Final passing matrix: cartoon.test.cjs default desktop/mobile (2 runs); combat-regression.test.cjs legacy desktop/mobile (2 runs); party.test.cjs default desktop/mobile and legacy desktop/mobile (4 runs). Three test scripts, four configurations, eight successful viewport runs. The baseline failure reproduction is separate and intentionally failed at the original bossRoom fixture.

## Materialization diagnosis

Current Library SKILL.md and references/materialization.md were reread. They document transfer then xattr application/verification then atomic installation; no Windows fallback is documented. The failing stack is at xattr application, after reaching materialize, before successful final installation. The target directory `C:\Users\CB-Me\Documents\Codex\2026-10-15\task\hero-assets` contains zero files including hidden files. Therefore there is no final image whose byte count or decodability can be verified. Expected remote sizes (not measured local sizes) were 1,408,402 bytes for normal-v7.png and 28,793,429 bytes for walk-16-keyframes.png. Library image read returned asset pointers and captions, not inspectable pixel content; it was not treated as visual verification or a byte-transfer workaround.

The unmodified helper failed identically for normal and walk:

```text
Traceback (most recent call last):
  File "C:\Users\CB-Me\Documents\Codex\2026-10-15\task\library_file_transfer.py", line 303, in <module>
    raise SystemExit(main(sys.argv[1:]))
                     ^^^^^^^^^^^^^^^^^^
  File "C:\Users\CB-Me\Documents\Codex\2026-10-15\task\library_file_transfer.py", line 282, in main
    materializer.materialize(
  File "C:\Users\CB-Me\Documents\Codex\2026-10-15\task\library_file_transfer.py", line 226, in materialize
    self.apply_xattrs(
  File "C:\Users\CB-Me\Documents\Codex\2026-10-15\task\library_file_transfer.py", line 246, in apply_xattrs
    xattr.apply(path)
  File "C:\Users\CB-Me\Documents\Codex\2026-10-15\task\library_file_transfer.py", line 64, in apply
    os.setxattr(path, self.name, encoded_value)
    ^^^^^^^^^^^
AttributeError: module 'os' has no attribute 'setxattr'
```

Missing condition: a supported Windows transfer path that preserves and verifies the returned Library xattrs and library_file_id, or approved local source files supplied directly to this environment. No helper checks were removed, no storage URLs were guessed, and no metadata-free download was installed.

No push, publication or commit was performed. The working tree was clean at task start; no concurrent edits were observed. Existing index.html bytes were preserved except one script tag.

## Six-character extension

Added manny and mobdesert (desert already names a biome). Existing four and legacy roster remain; new slots extend party HP/revive handling. No save storage/schema or stage files changed. Both use shared four lights/charge branches/air/guard/crouch/awakening. Manny requires source bodyHeight excluding hat (measured 275px), mapped to a per-character displayBodyHeight of 80 logical px. Other characters retain 110px; Desert source bodyHeight is 350px. Source measurements remain unchanged when tuning display size. No approved sprites yet: labeled placeholders and colored projectile circles are temporary.

Specials: Manny floating bombs (5x12, awakened 8x16.2) and a red-blue energy orb (70, awakened 94.5). Desert jump spin (34, awakened 48 before shared awakening multiplier) plus fish (4x10, awakened 7x13.5), and smoke dragon (82, awakened 110.7). Awakening increases orb radius72->94 and dragon80->105. Cooldowns8/10s, special1 startup invincible; no extra dance for these character-specific specials. These are initial gameplay values, not final art. New projectiles cancel on interruption/party switch. All body and FX sources require16+ frames; see contract.

Six-character verification: cartoon.test.cjs passed 374 state assertions + 3 browser assertions per desktop/mobile viewport (754 total), including all six common combos and branch attacks, individual new specials hitting enemies, enhanced projectile counts and cancellation. party.test.cjs passed desktop/mobile six-member HP, switching, revival, defeat and admin roster checks. cartoon-unit.test.cjs passed bodyHeight scaling/required metadata for Manny plus MOB layer regressions. Browser screenshots at 1280x720 and 844x390 confirm provisional displays and six-slot HUD. New art, hat silhouette/pixel registration and physical mobile remain unverified. Earlier four-character timing samples are historical, not six-character performance results.

Manny visual size calibration: runtime profile displayBodyHeight=80 overrides the shared 110px default. Unit checks use source275/display80 for Manny and source350/display110 for Desert. No new image retrieval or final-pixel validation was performed for this change.

Latest user calibration: Manny display body height reduced from 90 to 80px; source bodyHeight remains275. All other characters retain110px. Desert previous light1/weak1 is rejected for arm anatomy and must not be connected as final art. Corrected16-frame shoulders/elbows/wrists/grip remains pending; no assets were retrieved or connected.

## Mobile atlas memory revision

New PNG/lossless-WebP atlases use one decoder at a time and a64MiB RGBA accounting limit. PNG/WebP dimensions are inspected before decoding; capacity is reserved first. The limit includes cached width*height*4, current decode reservation, and a256x256 (0.25MiB) retained pose. Demand loads evict least recently used ImageBitmaps with close(); speculative loads never evict resident images. Selection/form changes abort pending fetches, invalidate late decodes and close all previous bitmaps/pose canvases. Metadata/URLs may remain, decoded images do not accumulate across six characters.

Only selected character/form idle and current motion load at high priority; movement and light1-4, jump and charge first pages are speculative. Later pages/FX load on demand. A decoded idle or small retained same-context pose is rendered while loading; before any asset loads the existing provisional placeholder remains. No input wait is introduced. Failures use30s backoff with3 attempts per record; maps/diagnostics are capped128/50. Static PNG or lossless WebP (VP8L / VP8X+VP8L) is required; unsupported/oversized/malformed images safely fall back.

Compact arbitrary rect/pivot addressing is already supported. Runtime bodyHeight must scale together with pixels/pivots; original/master measurements remain metadata and display heights80/110 remain logical game units. Parent-reported compact exporter examples3.75-7.27MiB are not inspected final assets. Cache tests use browser-generated solid-color PNG fixtures, not final art. This is RGBA ownership accounting, not process RAM, decoder scratch, compressed blobs, browser/GPU copies, old game images or device thermals.

Cache verification passed in headless Edge with generated PNG fixtures: uniform2656x1992 at21,163,008 bytes each retained3 at63,489,024 bytes (60.55MiB); compact960x1984 at7,618,560 bytes each retained8 at60,948,480 bytes (58.13MiB). Observed tracked peak63,489,024 stayed below67,108,864 budget. Six-character/form switches returned tracked cache/reservation to0;21 tracked obsolete ImageBitmaps closed. Tests also cover LRU order, no speculative eviction, stale decode disposal, nonblank retained canvas, failure backoff and settled loading map. Evidence: tests/cartoon-cache-results.json with code hash. Full six-character combat tests still pass754 assertions across desktop/mobile emulation; unit scale/MOB/fallback tests pass. Final compact art, real network hitches and physical device memory/thermals remain unverified.

## Static lossless WebP validation

Added pre-decode RIFF/VP8L/VP8X parsing following https://developers.google.com/speed/webp/docs/riff_container and https://developers.google.com/speed/webp/docs/webp_lossless_bitstream_specification . Requires exact RIFF length, bounded chunk sizes/padding, valid signatures/version/reserved bits and matching extended-canvas/bitstream dimensions. Animation flag plus ANIM/ANMF chunks are rejected even if animation flags are missing. Lossy VP8 is explicitly unsupported, not passed to an unrestricted decoder. Dimension limits are checked before RGBA multiplication; safe integer and budget checks remain. Encoded atlas cap64MiB, chunk count cap1024. Browser decoded dimensions are rechecked.

Headless Edge tests used Pillow-generated transparent lossless WebP, both simple VP8L and real VP8X with EXIF metadata. Cache/LRU/6-character switching/form release/late-decode/retained-pose checks passed.21 deliberately invalid inputs (truncated headers, bogus RIFF/chunk sizes, padding/version, huge dimensions, budget overflow, inconsistent dimensions, duplicates, animation flag/ANIM/ANMF and lossy VP8) were rejected before createImageBitmap: zero decoder calls for those cases. Compact fixtures retained8 at58.13MiB; tracked peak60.55MiB, under64MiB. Final cache/reservation0; failure records in test output are intentional invalid fixtures. PNG cache and body/MOB unit regressions also passed. These are synthetic WebP assets, not final artwork or physical-phone measurements.

## Per-frame compact FX layout (correction and implementation)

Earlier wording about frame pivots plus socket offsets/display sizes was imprecise: before this revision only pivot was per-frame; socket.offset and socket.size were clip-level, and normalized frames discarded other fields. Per-frame displaySize and socketOffset are implemented only in this revision.

Each optional displaySize:[w,h] is in multiples of selected character displayBodyHeight (Manny80, others110). Values must be finite, positive and<=32. Optional socketOffset:[x,y] uses the same units relative to the existing FX call anchor; values must be finite with abs<=32. X mirrors with facing; Y stays unchanged, down positive. Each property overrides independently. Absent properties retain clip socket.size/offset in legacy logical pixels. Null or malformed values reject the clip instead of silently falling back. Legacy socket.size is now checked as finite0<size<=4096 and offsets finite abs<=4096.

Pivot remains runtime-pixel coordinates relative to the trimmed rect, including outside-rect coordinates. Width/height scale pivot independently; exporter must preserve the rect aspect ratio in displaySize to avoid stretching. Trimmed width/height ratios should scale with removed pixels; do not reuse untrimmed full-canvas display proportions. New fields apply to FX only and survive multipage normalization and shared phase aliases.

cartoon-fx.test.cjs passed64 geometry/schema assertions covering frame priority, independent legacy fallbacks,80/110 sizing, both facings, Y invariance, outside pivot, aspect ratio, trim-invariant pixel scale, pages, invalid shapes/NaN/infinity/negative or excessive sizes. Existing MOB/body/fallback units and syntax checks passed. These are mocked-canvas coordinate checks, not final artwork/device visual inspection.

## FX direction and independent bomb tracks

Fixed the former generic dir=+1 bindings. Impacts retain event direction; melee/rush/launch/slam and MOB layers use action direction, charge/ongoing aura use current facing, awakening burst snapshots activation facing. Moving projectiles use velocity angle and horizontal velocity sign (stored direction if vx=0). Ground splash and Manny orb force fixed orientation.

Clip orientationMode accepts velocity/facing/fixed; omitted uses binding default. nativeAngleRadians defaults0, finite abs<=2PI, +X right/+Y down, positive clockwise. Velocity rotates by atan2(vy,vx)-nativeAngleRadians with NO mirror. Facing mirrors X only; fixed does neither. Socket translation remains world-facing: anchor+[dir*offsetX,offsetY], then image rotation/mirror about pivot. Thus sockets do not rotate with velocity. Zero-speed velocity mode does not rotate. Native angle is ignored in facing/fixed. Native metadata is not applied to procedural placeholders, whose native direction is already right; their velocity direction is applied once.

Confirmed exporter metadata: hero water PI/2, denden water PI/4, nyoro/tetsu water PI/2; ranged and Desert fish0. Desert dragon native angle must come from actual measured artwork. Caller anchors remain unchanged; exporter bottom-center compensation must not be duplicated in bindings.

Manny bombs now spawn independent special1-bomb-pink/cyan/green/orange/purple tracks in that order modulo5. Normal5 uses each once, awakened8 repeats first3. Missing/loading color source falls back to same-form generic special1-bomb; existing character/shared lookup remains. No image recoloring, no complete bomb-group sprite per projectile.

FX mocked-canvas tests passed113 total assertions: both down-diagonal velocities with native0/PI4/PI2, no double mirror, reverse rush, fixed splash/orb, event direction, metadata validation, frame sizing/socket/trim cases,5/8 variant order and missing/loading/awakened generic fallback. Existing body/MOB/fallback unit tests pass. Final image angles and pixel alignment still require integration of supplied art.

## MOB boundary and release socket integration

MOB letters already used phase-local playback from actionAge-.16. Replaced floor division with shared explicit .16/.34/.52/.70/.88 boundaries to avoid rounding at exact.70. Letters start frames0/4/8/12 at these first four boundaries, finish15 before.88 and hide from.88. Body/trail remain0..1s. Boundary tests pass90 assertions.

Body clip releaseSocket:[x,y] changes actual projectile coordinates, including collision origins, to event-time player feet+[action.dir*x*displayBodyHeight,y*displayBodyHeight]. Optional finite values abs<=32; missing metadata retains old offsets/formations. Lookup uses current character/form ranged, special2-active for water, special1-active/special2-active for unique specials, then raw action-type clip if phase clip absent. Multiple projectiles share the provided origin, while velocities/delays remain. FX socketOffset should be0,0 to avoid visual-only displacement.

Optional releaseFrame is a zero-based source index. Body animation is piecewise mapped so this frame starts at the game-owned release timestamp (.09 ranged,.36 water,.35 bombs,.55 orb,.16 spin/fish,.6 dragon). Phase aliases only synchronize when their range contains that frame. Sheet cell numbering must be converted explicitly by exporter. Event timing itself is unchanged. Final source-frame/pixel match remains unverified until images arrive.

Release unit tests pass58 assertions: facing, airborne event position, Manny80/others110, source frame8/5 boundary, awakened resolution,8 shared-origin projectiles, absent metadata fallback and invalid values. FX113 and existing body/MOB/fallback unit regressions pass.

Denden downcast precise export socket supersedes .72/.08: [182/248,24/248] = [0.7338709677419355,0.0967741935483871]. Source virtualRoot[250,420], muzzle[432,444] +/-4px, bodyHeight248. This virtual root maps to worldP; do not substitute visible airborne feet or ground. Ranged remains[180/231,-124/231]. Contract example and release test updated; no final art metadata installed.

## Confirmed Denden source numbering and ZIP intake

Exporter confirmed sheet cells are one-based. Denden ranged cell8 is releaseFrame7; downcast cell5 is releaseFrame4. This supersedes earlier8/5 examples. Contract examples/tests corrected; no final assets or production release metadata are installed yet.

ZIP intake plan: user saves all7 ZIPs unchanged under combat/. First inventory names/sizes/SHA256 and inspect archive members without executing anything. Reject rooted/traversal/symlink entries, collisions and excessive unpacked sizes. Extract into fresh dedicated combat/imports/<pack-id>/ directories, never over combat/dive or existing assets. Keep original ZIPs. Inspect included manifests/adapters and approved status; resolve URLs relative to their original JSON locations, validate16+ addresses, PNG/static lossless WebP dimensions, source frames, pivots/bodyHeight, FX sizing/orientation and releaseSocket/7/4. Do not treat old rejected assets as approved.

Back up the current root manifest and snapshot its hash before a surgical merge of denden/, nyoro/, tetsu/ keys only. Preserve hero/Manny/Desert and unrelated keys. Current loader reads only combat/cartoon-manifest.json automatically; saving ZIPs alone does not load them. Imported flat entries can reference adapters under imports/; source URLs in adapters remain adapter-relative. Direct inline clip source/pages/frame.src must be rebased to root-manifest-relative paths, or resolved through packURL in explicit loadCartoonArt calls. Topological alias order required. Reject unexpected concurrent manifest edits rather than overwrite them.

Then run metadata validation and automated combat/FX/release/cache tests against actual supplied art, serve local HTTP, inspect desktop/mobile-emulated selection, left/right motions, event-frame muzzle alignment, MOB phase boundaries and cache usage. Report visual defects separately from code/test passes. Rollback restores saved manifest only; isolated import directories and source ZIPs stay recoverable. No publish/push. Exact extraction/merge awaits archive contents and filenames.


2026-10-15 ラミ先行検証結果: tests/cartoon-rami-review.test.cjs は実時間のキーボード入力で移動/走行/跳躍/4連撃/移動・跳躍リセットを確認。弱4段HP96→84→70→54→30、各初回命中時action.age約0.283秒、Y最小436.92（床548）、ブラウザエラー0。連撃検証時のみ対象を静止/配置。Canvas録画はtask/gungun-quality-repair/rami-play.webm。root-lift303、release59、FX関連282、final-assets878チェック通過。旧全体仕様テスト、通常キャンペーン通し、全溜め派生/覚醒終了/全キャラ再戦は今回未再検証。


## 元必殺の接続復元（追加）
Denden必殺1/2はbeginCharge/castThunder、NyoroはcastNyoro(0/1)、TetsuはcastTetsu(1/2)へ再接続。MOB斬りは強単体に保持。元身体・FX・時計で再生する暫定復元であり、旧8枚素材を16枚達成とは数えない。元技中は共通弱/強/別必殺を排他、非ラミ覚醒不可。HUD名称とCDも元技に対応。
実ブラウザで6技の発生、旧身体とFX描画、弱入力排他、非ラミ覚醒拒否、パーティ中断解除を確認。エラー0。動的敵への全技命中/通常キャンペーンの総合回帰は未確認。
現在のユーザー確認URL: http://127.0.0.1:4173/?combat-lab=1 。サーバー再起動: node "C:\Users\CB-Me\Documents\Codex\2026-10-15\task\gungun-quality-repair\serve.cjs"。127.0.0.1限定。

## スピン同期追記
- startupは通常/覚醒とも1.28秒、突進素材0.47秒、recovery0.18秒。覚醒の1.65倍速はstartup以外に適用。新16枚スピンのadapterに spinCycleDuration:0.64 を付けた場合だけ2周表示する準備を追加。現在の旧startup素材は2周として扱わず、完成扱いにしない。
- 実ブラウザー計測: startup通常1.2745秒/覚醒1.2766秒（観測誤差含む）。実行エラー0。root-lift312通過。
- 実描画到達数: 通常blow15/16,launch16/16,rush16/16。覚醒blow12/16,launch13/16,rush16/16。時計とRAFが非同期なため、時間だけの調整では全枚数を保証できない。
- 修正案（未適用）: 単発16枚動作は実時間最低0.32秒。加えて直前フレームの実描画確認後に次フレームへ進み、最終フレーム表示前に終了しない。命中/前進/FXは同じ制限済み時計に従わせる。30fps以下は完走時間が延びる。被弾/移動キャンセルは意図的中断として完走率の分母から分ける。短いspecial recoveryも同じ問題があるため強攻撃だけの局所修正では不十分。
- マニー新FX64枚25.47MiBは未受領。64MiBの共通LRU管理に統合し、旧FXのmanifest参照・予約・bitmapを退役させてから新FXを要求する方針。今回のラミ計測ピーク63.86MiBであり、新FXをそのまま追加常駐は不可。新パックと360px orb/480px爆発は未接続・未検証。
## 16コマ描画時計：実装・回帰結果
- 短い攻撃（light/air/slam/launch/blow/rush/ranged）のうち、モーション全体が独立16枚の素材に最低実時間0.32秒と描画確認を適用。フェーズ別の16枚強制はしない。旧素材による暫定表示やテツの独自4段強攻撃はこの対象外。
- 描画予定時刻を画像が実描画した時点で確認し、次のシミュレーションtickでその時刻まで命中と前進を進める。FXは実描画済み時刻を使用。fallbackは確認に数えない。rangedのreleaseFrameによる前後の時間配分にも対応。
- 実ブラウザーのゲームloopとcanvasを制御した60fps/30fps、通常/覚醒、弱4段と4溜め分岐の計32ケースで全16/16枚。先行入力で4段完走。終端コマ待ち状態からの移動/ジャンプ/被弾中断12ケースでaction/段数/先行入力を解除。30fps相当の画像未読込では命中0、前進0、age0。実行エラー0。
- tests/cartoon-presentation-clock.test.cjs を追加。記録は task/gungun-quality-repair/presentation-clock-results.json。root-lift312も通過。物理端末の30Hzディスプレイ試験ではなく、ブラウザーのRAF時計を制御した回帰。
- スピン16枚2周、出口4枚0.08秒にはこの16枚保証を強制しない。出口素材の接続はパック待ち。
- マニーv2 ZIPは2026-10-15の今回確認時点でDownloadsに未存在。別経路への取得は行っていない。

スピンFX二層契約案（未接続）: effects/special1-spin-back, effects/special1-spin-front、単層互換effects/special1-spin。覚醒は各キーのspecial1前にawakened-。各16枚、duration0.04秒、loop:true、同一pivot基準/原画サイズ。足元rootを原点、displaySizeは原画幅/220と高さ/220、必要時socketOffsetを使用。両層とも同じaction.age%0.64。背面→本体→前面の順。両層がdecode済みの時だけ二層を使い、そうでなければ単層を1回だけ描画。現在のdrawEffectを流用できるが前後の描画順ラッパーは未接続。全16枚と出口4枚を同じ20枚atlasに置き、bodyのframeRangeで分ける構成も可能。
## FX作者同期修正・描画接続済み（新画像は未到着）
- 上記のFX 0.64秒ループ案は撤回。スピン本体のみ16枚×0.04秒×2周。FXは16枚×0.08秒を1回、共通action.age、全体1.28秒。両層の中心は足元からY=-45px（本体110px時）、pivot共通。socketOffsetはこの中心からの追加補正となるため、-45pxを二重指定しない。
- effects/special1-spin-back/frontの両画像が描画可能な時だけ、背面→本体→前面。同時刻・同方向・同座標。片方未読込なら互換effects/special1-spinを前面へ1回だけ、互換もなければ表示なし。通常/覚醒に対応。
- effects/strong-blow、strong-launch、strong-rushは技開始から終了まで、player.x/player.y（足元）に追従し、本体の実描画確認時刻と同期。hit-heavyへの割当はしていない。専用キーがあれば旧launch/rush-trailは重複表示しない。通常の命中フィードバックは別処理として維持。
- 新画像未到着のため現在のゲームでは新FXは表示されない。実装ロジック検証156チェック、既存描画補正312チェック通過。新画像の顔への重なり・実見た目・新メモリピークは素材到着後に確認。

## 2026-10-16 再接続後の統合結果（過去の未反映記録より優先）
実行環境は復旧。権限上の拒否/保留/結果不明なし。公開・push・commitは実行していない。作業中に外部更新でHEADがa2795f5 upへ進み、統合ファイルがコミット済みになったことを観測。巻き戻していない。
611キー読込エラー0。ラミ/マニー歩行・魔法を保持し、マニーdash、ピンク基本8、テツ元必殺2技とFX、ニョロidle/walk候補を部分置換。未完成REVIEW必殺は未導入。
マニー歩行99px/周期、dash160px/周期を移動距離に同期。walk/dashは同じ脚の位相対応表で接続。ピンクwalk64px/周期、ニョロwalk100px/周期へ仮調整し左右再生を再確認。移動速度自体は変更していない。
接地診断: 最下端alpha画素のYはマニーwalk -0.73〜-0.36px、ニョロwalk -0.44〜+0.06px、ピンクwalk -1〜0px。関節追跡ではない。横滑りは未解決で、マニーwalk2→3の接地点候補が+3.09px戻るため一定速度だけでは吸収できない。帽子dash4→5/13→14、下降14→15、walk6→7/11→12/16→1を原画と合わせて継続評価。全身fitや旧絵への差戻しで隠していない。
実ブラウザー連続キー操作: ピンク弱4段それぞれ16/16、ラミ通常/覚醒×左右でstartup16枚2周（wrap1回）から突進・終了、テツHSP/PS左右命中54/96と終了。テツ新背面オーラ0.1〜1.1、前面眼光0.1〜1.97、新斬撃/残像を既存戦闘時計へ接続。
巨大orbの接地代入に旧112pxが残っていた不具合を修正し180pxへ統一。高さ24px敵×距離35/80/350/700×左右×通常/強化=16ケースで一度だけ命中。
回帰: 攻撃32ケースの60/30fps全16/16と中断12ケース、画像遅延時hit0/move0/age0、root-lift312、二層FX156、素材参照878通過。現行キャッシュpeak 63.57813MiB/64MiB、失敗0。既存全テストを網羅したという意味ではない。
実行中Downloads/file/receivedへのリクエスト0件。HTML/JSにもDownloads実行参照なし。下記7ZIPは必要素材をcombat以下へコピー済みで、実行時には不要。候補の再調整/復元用バックアップとして保管は推奨するが、Downloadsに置き続ける必要はない。ファイル削除はしていない。MOB-RAMI-START.cmdはZIPと別の起動用ファイルとして保持。参照先のtask/gungun-quality-repair/start-rami.ps1とserve.cjsも保持。
- MOB-RAMI-REPAIR-20261015-runtime.zip | 13877138bytes | SHA256 5258dfa76a9af907b72f24729e9e93482aa80f00ec605f8ff948f6a298a9b05c
- MOB-MANNY-MAGIC-FX-REVISION-20261015-v2.zip | 8753450bytes | SHA256 dbec35cc0f9eeaf8db1c444681a567007dc7c17655c45b036645462287da64b6
- MOB-MANNY-WALK-REVISION-20261015-v1.zip | 6464087bytes | SHA256 cb6b12a1a4469a318b8bc968488675b27be84c7fc6b0b37af8bf46e1483ab1b6
- MOB-MANNY-DASH-REVISION-20261015-v1.zip | 6163718bytes | SHA256 18a2e75aa4f340d7319f9f758c2d55f9cbbf000045d304bf95ad97fbfb2d4065
- MOB-PINK-PLAYABLE-16-runtime-base8.zip | 1544725bytes | SHA256 89745c54247f70224783f1c8e64e31706c9bc50f609284d2c6857a789b809418
- MOB-TETSU-original-specials-16-runtime.zip | 5027333bytes | SHA256 6b67d1a9b3ad4724c3dc63242b62a6d9fc34f3207077cebd6d0b9125a23fd138
- MOB-NYORO-approved-model-idle-walk-CANDIDATE.zip | 12300492bytes | SHA256 8020448c65d411799c82e6c10d1f1e995e75980d69d99c250b03cba23a6b6d67
最初の4ZIPは受領済み期待SHA256と一致。後半3ZIPは受領ファイルのSHA256を採取。テツ同梱チェックサム15件、ニョロ24件も一致。
元FX資料: Downloads/MOB-ORIGINAL-FX-MEASUREMENTS-20261016.zip、3944852bytes、SHA256 0981d4fca08b75063deff03eafcabf4ecbd0d29df03461424854c9233e2d8709。元PNGは無改変、測定JSON同梱。
デンデン033/034/035/036 raw=116x70/287x167/324x208/231x62、trim=114x68/285x165/322x207/229x60。地上波drawImageは140x120、左上(x-70,y-120)、底辺中央(x,y)基準。旧3連波にも115x80.5、175x122.5、245x171.5で使用。
デンデンenergy017〜024は中心基準、高116、幅順137.75/127.74/131.95/121.47/117.69/126.48/122.12/122.91。溜め36→116高、発射0.25秒、現行root+(dir*48,-47)。新socket候補は未反映。雷86〜89は底辺中央、高360、幅231.51/267.69/272.08/308.50。
ニョロ01〜03 raw=80x99/209x210/254x226、trim=78x97/207x208/253x224。小炎は中心基準・最大辺28（22.52x28/27.87x28/28x24.79）、燃焼は最大辺35、隕石前炎は最大辺63でイベント点からY-15。04雨=92x79.75、05隕石=190x166、どちらも弾の中心基準。原画像04=338x293、05=285x249。着弾リング/破片/雲と電気泡爆発は旧コード描画で元スプライトなし。
未完成: デンデン/ニョロ必殺の新素材、ピンク強・必殺・被弾等、移動候補の完全な接地滑り解消と原画最終受入。旧絵表示の残存は完成扱いにしない。
証跡: task/gungun-quality-repair/resume-qa-results.json、resume-poses.json、movement-final-results.json、sole-trajectories.json、saved-zip-audit.json。

## 2026-10-16 実プレイ不具合の修正（resident-1）

基点 HEAD a2795f5。既存の未コミット CARTOON-COMBAT.md と tests/cartoon-resume-assets.test.cjs を保持。push/公開なし。画面左下のビルド表示は 20261016-resident-1。ローカル配信は127.0.0.1:4173。ユーザー自身の開いているタブは接続ツールの初期化エラーで確認できず、「古い版が原因」とは断定していない。検証ブラウザーはservice worker登録0。

確定原因と変更:
- 64MiBキャッシュにラミ337.625MiB/71ページ、マニー324.181MiB/49ページ等をオンデマンドで出し入れ。従来のラミ・マニー12技切替約11秒でデコード43回/退避41回。未読の16コマ攻撃は描画承認まで時計と移動を止めていた。
- combat-loading.js はキャラの全ページ（ラミは通常＋覚醒）を開始前に準備。原画を変更せず、均一縮小デコードして世界座標・pivot・キャラ比率を保持。常駐分目標60MiB、同時ロード上限2、メタデータ同時取得上限8。表示解像度はラミ0.422倍、マニー0.430倍、他は0.483～1倍。これはGPU/ブラウザー全メモリではなく管理対象キャッシュの上限。原解像度のまま全ページを64MiBに常駐させることはできない。
- 16枚全部の描画を待つ時計を廃止。アクション時刻で描画と当たり判定を進め、低fpsでコマが飛んでも入力を停止しない。キャラ切替の準備は一時停止した選択画面で完了させる。
- 普通のジャンプから弱を入力するとairLeft=0で拒否されていた。初回空中攻撃を許可し、3回上限・3段目の叩き落とし・着地リセットを維持。
- デンデンのスキル3本体は残っていたが、共通UIが非表示、Digit3が覚醒へ横取り。デンデン3=サンダーバレットを復旧。ニョロ3=炎の城、テツ3=MOB斬りも復旧。覚醒Eはラミのみ。
- ニョロの旧アトラスはモーションごとにbodyHeight164～212等とばらついていた。基本基準220へ統一。旧dashのみ元モデルの拡大された頭部を合わせる固定基準330（暫定、全16コマ同じ倍率）。新idle/walk=220を維持。旧必殺は旧ニュートラル1番を固定基準とし、毎コマbbox fitしない。
- デンデン旧必殺の88px基準を通常110pxに合わせ、旧素材の系列ごとにニュートラル1枚から固定倍率を使用。新しいデザインとの一致は未達。
- ラミ水必殺の専用透過FXは幅71.06/高83.98px指定で体より小さかった。既存水流・飛沫の表示を4倍（最初の水流284.24×335.92px）にし、通常半径110/覚醒135、速度(+/-650,750)を使用。円の代用品は追加していない。既存元PNG/WebPは不変。

検証:
- tests/cartoon-resident-play.test.cjs: 7キャラ、実キー左右移動→idle、SPACE→J、既存3キャラのDigit3、各攻撃表示。戦闘中の追加デコード0、追加LongTask0、失敗0、最大63,072,652bytes=60.1517MiB（64MiB以内）。全7キャラの左右比較画像を目視。
- tests/cartoon-presentation-clock.test.cjs: 新しい実時間時計の15/30/60fps×通常/覚醒×4分岐24ケース、地上4連撃、空中3回→slam、4回目拒否、着地リセット、被弾中断、追加デコード0。
- tests/cartoon-unit.test.cjs と cartoon-final-assets.test.cjs: 効果の位相/左右ソケット、878契約チェック、611キーを確認。
- 実パーティ交代hero→manny→nyoroと被撃破からdendenへの自動交代、ラミ2番の斜め下水流を確認。初回起動15.385秒、キャラ準備1.051～2.181秒（このPC、ローカルサーバー）。起動時の既存全素材処理には長いメインスレッドタスクが残る。

原画待ち（完成扱いしない）:
- デンデンwalk/dash全16コマ: 脚が長いのは原画の形状。短い胴・短い脚へ描き直し、足裏pivot/左右の支持脚を保持。技1/2/3の本体は旧絵が残る。新モデルでチャージ/放出、雷詠唱、3連雷弾の全動作が必要。元の雷/エネルギー発動時刻と範囲を保持する。
- ニョロ: 新モデルはidle/walkのみ。他のdash/jump/light1-4/charge/4強分岐/air1-3/slam/guard/crouch/damage/death/recoveryと固有3技は旧モデル。固定基準を直しても顔・胴・傘・脚のモデル差は解消しない。承認モデル、原画基準220、足裏pivot、傘を含めたbboxで身長を合わせない条件で差し替えが必要。
- ラミ必殺2の意図は跳躍→斜め下への巨大水エネルギー→着水飛沫。現素材はruntime-final/hero/combat/hero/adapters/special2.jsonとmobrami-fx-special2-water-16 / special2-splash-16。最新hero-revisionは必殺1中心で、必殺2の改訂本体は未提供。新規は本体の跳躍予備/空中溜め/武器から放出/反動着地を短胴短脚の承認モデルで描く。body220/display110、両足の基準pivot、通常/覚醒各版。水流は身体を含まない透過16コマ、下向きnativeAngle=PI/2、実表示約280×336以上の太い水柱、噴出元pivotと武器socketを明記。着水飛沫は別透過16コマ・接地点pivot。発射は通常約0.417秒/覚醒用素材約0.425秒のアクション時刻。現在は既存FXの縮小指定を修正した段階で、原画の最終品質承認ではない。

既存の三国無双型入力体系は変更していない。今後は初回の旧素材一括ロードと原画統一を続ける。ユーザーの実タブ、スマホ実機、全20ステージの長時間再走は今回未検証。

## 2026-10-16 段階ロード staged-2 と原画引渡し契約

ビルド: 20261016-staged-2。HEAD a2795f5を維持。game-staging.jsが初回の全素材一括読込を置き換える（legacy=1では従来一括読込を維持）。coreは草原共通物と支援ピンク、選択キャラは必要な旧動作を含めて準備、世界はその背景/小物/2種類の敵のみ、ボスはArea4、シャーティーは砂漠Area2だけ。選択画面は画像全体の準備前から操作可能。開始・世界遷移・交代は必要素材が揃ってから進み、戦闘中に準備を隠さない。素材準備中のESC/再開も制限。未準備世界への切替中にdrawが旧シーンを新しいbiomeArtで描こうとする不具合を回帰で発見し、描画ガードを追加した。

ローカル冷起動2回平均（保存した修正前ファイルを検証ブラウザーへ配信、同じゲーム/操作/PC。ネットワークや端末で変動）:
選択操作可能: 13.803秒 -> 2.344秒。
ナビゲーション開始から戦闘準備完了: 15.835秒 -> 4.059秒。
ラミ交代: 2.367秒 -> 2.196秒。
テツ交代: 1.572秒 -> 2.298秒。
ニョロ交代: 1.672秒 -> 3.382秒。
起動+この3交代の合計: 21.446秒 -> 11.935秒。未選択の旧ボディ読込を交代画面へ移す分、テツ/ニョロの交代準備は増加したが、合計でも短縮。初回戦闘までのLongTaskは71～87件 ->6～7件、最大230～275ms ->128～160ms。これらはキャッシュ管理分64MiBとブラウザー全メモリを同一視していない。

検証: 全20エリアで必要背景/敵/ボスを準備して描画、ミラモブ別ボス、次世界への遷移、通常交代3種、自動交代、戦闘中追加デコードなし、pageerror0。878アセット契約チェック、FX位相/左右ソケット、地面波140x120と雷弾3サイズのcaller指定優先を確認。計測JSONとテスト画像は一時作業フォルダーに保存。

Library引渡し:
- 現行デンデン: libfile_28e251ce9f5c819194cb9149669c48da / file_000000005fc48230a35335a6c45f5db7 / MOB-DENDEN-CURRENT-REFERENCE-20261016.zip /10,699,958bytes。現行idle/walk/dashのatlas+adapter、旧denden025、スキル3旧033～040、skill033～036と86～89、SHA256一覧。元画像無改変。現行idleを参照用に同梱したが、独立した承認済み立ち絵は見つからず、承認済みとは記載していない。
- マニー接地監査: libfile_8999183cc3fc81919498a732eb73ec1c / file_00000000431881fd905aab5d08214c63 / MOB-MANNY-GAIT-AUDIT-20261016.zip /3,437bytes。manny-gait-contact-audit.csv + manny-gait-audit-notes.txt。下端alpha測定は足の個体IDを保証しないため、曖昧なコマの注記を必ず読む。

ラミ必殺2（現行値、新原画の承認仕様ではない）:
- 通常/覚醒32コマ、startup[0,16)、active[16,24)、recovery[24,32)。技時計0～.36/.36～.55/.55～1.05秒。発射global index19（20枚目=active4枚目）。通常発射.4171544715秒、覚醒.4253393665秒。覚醒攻撃時計1.65倍なので実時間.2577814343秒、全体.6363636364秒。通常全体1.05秒。
- 発動時vy=-800、重力1800、足元rootが跳躍に従って動く。通常socket=[.1705882353,-.1882352941]×110、覚醒=[.3323529412,-.3088235294]×110。世界座標は通常(x+dir*18.76470588,y-20.70588235)、覚醒(x+dir*36.55882353,y-33.97058824)。左右はdir=+1/-1。新原画の武器口が変わる場合は原画側から新socketを明示し、統合時に合わせる。
- 速度(vx,vy)=(dir*650,750)、寿命1.7秒または地面到達まで。敵ごとに1回、通常52/覚醒80ダメージ、半径110/135。衝突後も水流は地面まで進む。着水時の飛沫は.35秒の表示、追加範囲ダメージなし。水必殺自体の無敵はなし（踊りとは別）。
- 既存の水流は下向き原画nativeAngle=PI/2を速度角に回転。現表示幅284.24～344.08、高310.08～345.44px。着水飛沫幅597.5～652.5、高537.5～632.5px、地面pivot。通常/覚醒で同じ水流/飛沫原画・表示寸法、違いは本体姿/攻撃速度/ダメージ/判定径。円の代用品なし。
- body基準220/display110、足元pivotは各コマadapterが正本。先頭pivot通常(115.17647,253.58824)、覚醒(95.17647,239.58824)。元ゲームでこのruntime以外のラミ固有水技原画は発見していない。残す要素は跳躍、斜め下へ武器から放出、巨大水流、独立した着水飛沫、短胴短脚と固有武器。承認モデルで腰をひねって押し出す新本体、水流と飛沫は独立透過画像。旧runtimeを完成扱いしない。

デンデン/ニョロの本体基準:
- デンデン16コマ案は全てbodyHeight220/display110、右向き原画をdirで反転、足元は各コマpivot。idle/walk/dash先頭pivotは(106.489796,221.142857)/(135.333333,215)/(164.290749,220.048458)。この16コマ案も脚長等の未承認問題あり。
- デンデン固有技1～3は旧本体描画。通常旧原画基準sprites025高さ294→110、技1系skill001高さ304→110、技3trim済033高さ981→110の固定倍率。各画像下中央を足元rootに置く（毎コマbbox fitなし）。技3の8コマは.075秒ずつ、最後を.72秒まで保持。
- ニョロ新idle/walkは220→110、先頭pivot(122.336727,208.215313)/(143.668810,202.870096)。旧基本モーションも220、旧dashだけ暫定330→110（先頭pivot183.971831,313.408451）。旧必殺原画はneutral001のtrim高359を固定基準に110/359、下中央pivot。旧モデルを新モデルとみなさない。
- 共通16コマスロット一覧: idle,walk,dash,jump,light1～4,air1～3,slam,charge-start,charge-hold,blow,launch,ranged,rush,guard,crouch,damage,death,recovery,awakening-start/end,special1-startup/active/recovery,special2-startup/active/recovery。ニョロはidle/walkだけ新モデル候補、それ以外は未承認旧モデル。固有技描画はこのspecialスロットより旧技ルートが優先される。ニョロ技1は旧032/033、技2は旧034～042、技3は旧031→039等。デンデン/ニョロの覚醒スロットは共通schema用で、現操作の覚醒はラミだけ。

デンデン技3・放電hook:
- 技3発射.24/.37/.50秒。足元rootからdir*95/225/395の地面位置。バースト寿命.40秒、攻撃判定最初.22秒、ダメージ36/48/60、CD10秒。表示115x80.5/175x122.5/245x171.5、下中央pivot。
- groundBoltsは別用途で140x120、16fps、寿命.75秒、水平500px/s、下中央pivot。元033～036は水色/青輪郭の地面ジグザグ放電+黄色小火花。86～89の黄色縦雷と混同しない。
- cartoonDrawEffectAtSize(key,x,y,w,h,age,duration,dir)がcallerのw/hをart.displaySizeより優先。denden/effects/ground-wave と denden/effects/thunder-burst を別aliasにできる。原画は共通でもよい。pivotを下中央・socketOffset=[0,0]にする。新texture追加時はtexture-catalog.jsonにも実寸を登録し、開始前常駐プランへ入れる。現在は新wave未受領のため旧FXへフォールバックしている。

## 2026-10-16: seven saved runtime packs (20261016-sevenpacks-1)

Integrated locally from user-saved Downloads ZIPs; no Library transfer workaround, commits, push or publication. Pre-integration JS/HTML/docs/manifest/catalog are retained at C:/Users/CB-Me/Documents/Codex/2026-10-15/task/gungun-quality-repair/before-six-packs. Existing uncommitted changes are retained.

- Rami water v3: normal/awake sixteen-cell full bodies and range aliases, leading-front water and separate splash. The supplied three-cell active files are represented as [6,9) windows of full bodies; the sixteen-cell validation guard is unchanged. Release clocks .417154/.425339, normalized muzzle sockets, physics650/750, damage52/80, radii110/135, origin-based ground contact and .35s splash retained. No jump enlargement or landing wait.
- Denden: short-leg walk and newly saved short-leg dash, plus original skills1/2 and skill3 bodies/FX. Charge sockets follow body frames0–5, release uses the dedicated socket once. Energy charge sizing36–116 is caller-controlled; impact .65s fade retained. Lightning height360/aspect preserved with original falling/contact clocks. Skill3 retains .24/.37/.50, .72s duration, original positions and damage; muzzle uses the whole body clock.
- Nyoro: rain/meteor bodies, projectiles, flame and illustrated impact. Rain body loops until its own five shots expire; meteor .85s and impact1.1s unchanged. Dedicated impact uses caller terminal alpha. Ordinary actions other than existing idle/walk remain older model work; not declared complete.
- Manny: body80, speeds190/340, distance cycles99/160. New gait metadata explicitly maps to engine strideDistance and loop:true. Both transition directions select the old cell using cumulative durations and enter the mapped new cell at its cumulative start. No root correction or per-frame size fitting.
- All imported string nativeFacing values are mapped to the engine numeric convention in the merged manifest; source adapters stay unchanged. Alias chains are flattened to canonical full clips so loading is independent of alias ordering. Selected-character resident loading and bounded decoder remain in place.

Validation: 32 special/render cases at30/60fps and both directions; 16 actual gait cases (both characters, directions, rates, walk/dash); 6 actual enemy-impact cases; 24 shared-combat timing cases; 8 skill3 clock cases; 712 metadata/phase checks; 20 campaign areas plus boss/next-world/voluntary and forced-party transitions. Seven-character real-time input regression passed. No asset/page errors or combat-time decodes in these runs. Peak tracked character texture storage approximately60.14MiB of64MiB budget; this is not total browser/GPU/legacy-stage memory. Selected atlas sources are uniformly downsampled at decode, retaining world-space dimensions.

Visual inspection: rendered left/right short-leg dash preserves both guns, short legs and alternating foreground/background legs; walk/idle/skills retain fixed scale. Manny60fps sampled all16 cells;30fps dash naturally sampled15 in the2s window without slowing the game. Residual anatomical foot-slip is not certified zero. Giant lightning and splash deliberately exceed body dimensions; some overlap and softened enlarged FX from the bounded texture tier remain visible. Nyoro ordinary light/dash model differences remain.

Evidence: %TEMP%/gungun-six-pack-qa (timing, screenshots), %TEMP%/gungun-seven-pack-qa (gait and actual enemy impacts), %TEMP%/gungun-staged-qa, %TEMP%/gungun-resident-qa. Automated tests use Edge; the user's already-open browser tab and physical phone have not been inspected.

## 2026-10-16 Nyoro dash/jump addition (20261016-nyoro-move-1)

User-saved MOB-NYORO-shortleg-dash-jump16-RUNTIME-CANDIDATE.zip verified:1701502bytes, SHA256185b243d18e453bc377cb67e67794be8651beb8cf38a13df9d99ef08ebc94981. Only nyoro/dash and nyoro/jump plus their shared awakened aliases changed. Prior seven-pack files backed up under gungun-quality-repair/before-nyoro-move. Fixed draw reference220/display110; no per-frame fit or root edits. Dash .56s and speed340 retained.

Existing generic jump rendering stretched the full track over flight, which would display the new landing poses while airborne. Added a Nyoro-only visual selector: airborne [3,11), actual contact starts [11,16) for its authored .24s, movement/attack interrupts landing presentation. Preparation[0,3) is preserved in the source but not forced ahead of the immediate physics jump. Physics force790, gravity1800, floor collision and control response unchanged. Lower landings hold the last air pose if needed; no mid-air landing pose or flight extension.

Passed16 jump cases:30/60fps x both directions x source/destination floor combinations548/548,548/400,400/548,400/400. Actual platform collision used. Same-height flight remains approx.878s. Passed8 Nyoro gait cases at190/340 with all16 cells sampled; natural source leg alternation, both hands, umbrella and short legs inspected in rendered captures. Continuous display reference is stable against idle/walk; crouch/landing silhouette compression remains authored. Exact foot-slip zero is not claimed. Current weak attacks and other unprovided motions remain old art.

Evidence:%TEMP%/gungun-nyoro-move-qa/results.json and jump screenshots; %TEMP%/gungun-seven-pack-qa/nyoro-dash-1.png and nyoro-dash--1.png. No battle-time asset decodes or page errors observed. Existing actual-phone limitation remains.
