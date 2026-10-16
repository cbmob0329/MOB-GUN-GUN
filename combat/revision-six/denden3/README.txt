モブデンデン 技3・地面雷 修復runtime候補 2026-10-16

範囲: 技3サンダーバレットの新カートゥーン本体16コマ、専用銃口電気16コマ、元033〜036に基づく地面放電16コマ。実原画3本48枚です。ground-wave/thunder-burstと覚醒aliasは同じ原画を再利用し、別描画として重複計上していません。
旧画像へ戻る素材は含みません。walk/dashや他の未完成モーションを完成扱いするパックではありません。実ゲームの品質確認・新hook接続は未実施です。

読み込み: cartoon-pack-denden-special3-repair.jsonを既存packの後にmergeで読み込む。flat animations/aliases形式。指定Dendenキーだけ上書きし、他キャラや他動作を変更しない。adapterとsrc/per-frame srcはadapter相対です。画像は全て静止lossless WebP、アニメーションプレビューをruntimeへ入れない。

BODY denden/special3
- 16コマ、全体0.72秒。durationは秒、source drawReference246.9554553から固定倍率でruntime bodyHeight220へ縮小。displayBodyHeight110を想定。
- bodyHeightは固定描画参照高。現行idleの近側レンズ径との比較で決めた値であり、現行idleを独立承認済みと主張するものではない。顔・短脚モデルを維持するため、各コマ外形fitは行わない。
- 元の頬膨らませ、両手の大型円筒銃、斜め下への3回反動を保持。原画は波口・短脚を持つ新カートゥーン。
- 発射イベント0.24/0.37/0.50秒は0始まりframe6/9/12、すなわちcel7/10/13。全0.72秒を伸縮しない。序盤6枚0.04秒、次6枚0.13/3秒、最後4枚0.055秒。
- 地面hit位置は元どおりP.x+dir*95/225/395、support-floor Y。damage36/48/60、CD10秒。銃口socketをこの地面hit位置へ流用しない。

FX denden/effects/special3-muzzle
- 新接続キー。足元Pをアンカーにする。legacyの-55等を二重加算しない。
- bodyと同じ全0.72秒のactionAgeで同じframeに進行。別の短いshot clockで再起動しない。16原画内でcel7/10/13が3つの光量ピーク。
- frame.socketOffsetは足元から銃口内側中心までの正規化座標。Xは向きで反転、Y下正。displaySizeはdisplayBodyHeight正規化。pivotはtrim後frame内のruntimeピクセルで、枠外の場合も有効。
- orientationMode=facing。右向き原画を左では水平反転。左右合成確認済み、実ゲームでの接点確認はこれから。
- muzzle発光の最大長はdisplay110時約33pxを想定。原寸ソケットから合わせた確認候補で、実プレイで元の見え方と最終照合する。

FX denden/effects/ground-wave / thunder-burst
- 同じ16描画・同じ1枚のatlasを使用。全16共通viewportと同寸rectで、自然な拡大→ピーク→減衰を維持。コマ別の外形fitなし。
- cartoonDrawEffectAtSizeでcaller幅高を最優先: ground-wave140x120、thunder-burst115x80.5 /175x122.5 /245x171.5。frame.displaySizeは設定していない。
- 下辺の主放電を地面へ合わせるpivot。透明マージンの下端をgroundと誤認しない。
- ground-waveはeffectAge/.75で正規化、各コマ.75/16秒。元life.75秒/speed500維持。
- thunder-burstはeffectAge/.40で正規化、各コマ.40/16秒。元life.40秒/damage window先頭.22秒維持。
- 低fpsで全コマ表示のために技時計・キャラを止めたり寿命延長しない。通常の時間ベース間引きを許容。
- 原画masterは無変更。runtimeでは全16共通crop[76,173,440,428]で周辺のalpha1以下(最大1/255)だけを除外。切断される不透明な描線なし。内部RGBAは保持。固定viewportの表示寸法は上記callerに従う。

検証
- 3本各16固有RGBA、全48実描画。矩形内収まり、8px外側gutter、パス解決、静止WebP、lossless復号後のalpha/可視RGBA一致を確認。
- BODYは一律0.8908489174、銃口FXは一律0.5へ空間縮小。WebPはlosslessだが空間縮小には情報損失がある。原画は別保存。
- 全3ページ同時展開でも13.533MiB。ground-waveとthunder-burstは同一ページを共有。既存aura等を含む全ゲームメモリの保証ではない。
- 画像最大辺1520px、2048以内。
- 原画レンズ径の自然変動・反動の見え方は実寸再生で確認が必要。歩行の未合格素材はこのZIPに入れていない。
