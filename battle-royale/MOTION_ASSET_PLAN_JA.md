# 追加モーション素材仕様・現状一覧（2026-10-20）

今回、新規原画の大量生成・課金はしていません。CSVは実ファイルのSHA-256で同じファイル内容を重複除外した枚数です（画素が同じでも圧縮が異なる画像は別数になり得ます）。左右反転、同一画像の再利用、時間補間は新規原画に数えていません。目標枚数は制作計画であり、実装済み枚数ではありません。

|キャラクター|不足アクション（現状の異なるファイル内容数 → 目標）|
|---|---|
|デンデン|idle 6→8、run 6→12、airAttack 6→8、landingAttack 6→8、melee1 6→8、melee2 6→8、melee3 6→8、strong 0→10、shot 5→8、special 6→12、hit 2→4、airhit 3→4、landing 1→4、getup 2→6、ko 2→6、guard 2→4、grab 1→6、hold 2→4、throw 2→8、dodge 0→6、charge 0→4、victory 0→8|
|ニョロ|idle 6→8、run 6→12、airAttack 6→8、landingAttack 6→8、melee1 6→8、melee2 6→8、melee3 6→8、strong 0→10、shot 6→8、special 6→12、hit 2→4、airhit 3→4、landing 1→4、getup 2→6、ko 2→6、guard 2→4、grab 1→6、hold 2→4、throw 2→8、dodge 0→6、charge 0→4、victory 0→8|
|テツ|idle 6→8、run 8→12、airAttack 6→8、landingAttack 6→8、melee1 6→8、melee2 6→8、melee3 6→8、strong 0→10、shot 6→8、special 6→12、hit 2→4、airhit 3→4、landing 1→4、getup 2→6、ko 2→6、guard 2→4、grab 1→6、hold 2→4、throw 2→8、dodge 0→6、charge 0→4、victory 0→8|
|マニー|idle 6→8、run 8→12、airAttack 2→8、landingAttack 2→8、melee1 6→8、melee2 6→8、melee3 6→8、strong 0→10、shot 4→8、special 4→12、hit 2→4、airhit 3→4、landing 1→4、getup 2→6、ko 2→6、guard 2→4、grab 1→6、hold 2→4、throw 2→8、dodge 0→6、charge 0→4、victory 0→8|
|スライム|idle 2→8、run 2→12、jump 2→6、airAttack 4→8、landingAttack 4→8、melee1 4→8、melee2 4→8、melee3 4→8、strong 0→10、shot 6→8、special 6→12、hit 2→4、airhit 3→4、landing 1→4、getup 2→6、ko 2→6、guard 2→4、grab 1→6、hold 2→4、throw 2→8、dodge 0→6、charge 0→4、victory 0→8|
|ミイラ|idle 2→8、run 4→12、jump 2→6、airAttack 4→8、landingAttack 4→8、melee1 4→8、melee2 4→8、melee3 4→8、strong 0→10、shot 6→8、special 6→12、hit 2→4、airhit 3→4、landing 1→4、getup 2→6、ko 2→6、guard 2→4、grab 1→6、hold 2→4、throw 2→8、dodge 0→6、charge 0→4、victory 0→8|
|ミラモブ|idle 2→8、run 2→12、jump 2→6、airAttack 4→8、landingAttack 4→8、melee1 4→8、melee2 4→8、melee3 4→8、strong 0→10、shot 6→8、special 5→12、hit 2→4、airhit 3→4、landing 1→4、getup 2→6、ko 2→6、guard 2→4、grab 1→6、hold 2→4、throw 2→8、dodge 0→6、charge 0→4、victory 0→8|
|モブピンク|strong 0→10、special 8→12、hit 2→4、airhit 3→4、landing 1→4、getup 2→6、ko 2→6、guard 1→4、grab 1→6、hold 2→4、throw 2→8、dodge 0→6、charge 0→4、victory 0→8|
|モブデザート|strong 0→10、hit 2→4、airhit 3→4、landing 1→4、getup 2→6、ko 2→6、grab 1→6、hold 2→4、throw 2→8、dodge 0→6、charge 0→4、victory 0→8|
|モブプチノン|idle 2→8、run 4→12、jump 2→6、airAttack 3→8、landingAttack 3→8、melee1 3→8、melee2 3→8、melee3 3→8、strong 3→10、shot 4→8、special 4→12、hit 2→4、airhit 3→4、landing 1→4、getup 2→6、ko 2→6、guard 2→4、grab 1→6、hold 1→4、throw 2→8、dodge 0→6、charge 2→4、victory 0→8|
|モブパティレッド|idle 2→8、run 4→12、jump 2→6、airAttack 3→8、landingAttack 3→8、melee1 3→8、melee2 3→8、melee3 3→8、strong 3→10、shot 4→8、special 4→12、hit 2→4、airhit 3→4、landing 1→4、getup 2→6、ko 2→6、guard 2→4、grab 1→6、hold 1→4、throw 2→8、dodge 0→6、charge 2→4、victory 0→8|
|モブパティブルー|idle 2→8、run 4→12、jump 2→6、airAttack 3→8、landingAttack 3→8、melee1 3→8、melee2 3→8、melee3 3→8、strong 3→10、shot 4→8、special 4→12、hit 2→4、airhit 3→4、landing 1→4、getup 2→6、ko 2→6、guard 2→4、grab 1→6、hold 1→4、throw 2→8、dodge 0→6、charge 2→4、victory 0→8|
|モブミント|idle 2→8、run 6→12、jump 2→6、airAttack 3→8、landingAttack 3→8、melee1 4→8、melee2 4→8、melee3 6→8、strong 6→10、shot 6→8、special 5→12、hit 2→4、airhit 3→4、landing 1→4、getup 2→6、ko 2→6、guard 2→4、grab 1→6、hold 1→4、throw 2→8、dodge 0→6、charge 2→4、victory 0→8|
|mobmintTransform|idle 2→8、run 3→12、jump 2→6、airAttack 3→8、landingAttack 3→8、melee1 4→8、melee2 4→8、melee3 6→8、strong 6→10、shot 6→8、special 5→12、hit 2→4、airhit 3→4、landing 1→4、getup 2→6、ko 2→6、guard 2→4、grab 1→6、hold 1→4、throw 2→8、dodge 0→6、charge 2→4、victory 0→8|
|モブ怪人|idle 5→8、run 6→12、jump 4→6、airAttack 3→8、landingAttack 4→8、melee1 4→8、melee2 4→8、melee3 4→8、strong 4→10、shot 4→8、special 7→12、hit 2→4、airhit 3→4、landing 1→4、getup 2→6、ko 2→6、guard 2→4、grab 1→6、hold 2→4、throw 2→8、dodge 2→6、victory 0→8|
|アサモブ|idle 4→8、run 5→12、jump 4→6、airAttack 3→8、landingAttack 4→8、melee1 4→8、melee2 4→8、melee3 6→8、strong 6→10、shot 4→8、special 5→12、hit 2→4、landing 1→4、getup 2→6、ko 2→6、guard 2→4、grab 1→6、hold 2→4、throw 2→8、dodge 2→6、charge 2→4、victory 0→8|
|モブガーディアン|idle 4→8、run 8→12、jump 4→6、airAttack 3→8、landingAttack 4→8、melee1 4→8、melee2 4→8、melee3 4→8、strong 4→10、shot 4→8、special 7→12、hit 2→4、airhit 3→4、landing 1→4、getup 2→6、ko 2→6、guard 2→4、grab 1→6、hold 2→4、throw 2→8、dodge 2→6、victory 0→8|
|モブリリス|idle 5→8、run 6→12、jump 4→6、airAttack 3→8、landingAttack 4→8、melee1 4→8、melee2 4→8、melee3 4→8、strong 4→10、shot 4→8、special 7→12、hit 2→4、airhit 3→4、landing 1→4、getup 2→6、ko 2→6、guard 2→4、grab 1→6、hold 2→4、throw 2→8、dodge 2→6、victory 0→8|
|モブトイティラ|idle 5→8、run 8→12、jump 4→6、airAttack 3→8、landingAttack 4→8、melee1 4→8、melee2 4→8、melee3 4→8、strong 4→10、shot 4→8、special 5→12、hit 2→4、airhit 3→4、landing 1→4、getup 2→6、ko 2→6、guard 2→4、grab 1→6、hold 2→4、throw 2→8、dodge 2→6、victory 0→8|
|モブジェシー|idle 4→8、run 8→12、jump 4→6、airAttack 3→8、landingAttack 4→8、melee1 4→8、melee2 4→8、melee3 4→8、strong 4→10、shot 4→8、special 6→12、hit 2→4、airhit 3→4、landing 1→4、getup 2→6、ko 2→6、guard 2→4、grab 1→6、hold 2→4、throw 2→8、dodge 2→6、victory 0→8|
|モブラミ|grab 1→6、hold 1→4、throw 1→8、victory 0→8|
|mobramiAwakened|grab 1→6、hold 1→4、throw 1→8、victory 0→8|

## 納品仕様

- 透明RGBAのPNG原画＋可逆WebP実装画像。独立ファイル方式を優先し、隣接セルを切り出さない。全身と全FXの外周に最低8pxの透明余白を置く。
- 身体と技FXは別レイヤー。大きい技はキャンバスを拡張し、身体の拡大率を変えない。アサモブ既存修正版は224×192、bodyHeight=100、足元pivotは動作ごとの既存値。トイティラは既存frameMetaを基準にする。全キャラの寸法を一律に変更しない。
- 各フレームに width/height、足元pivot、bodyHeight、不透明bounds、nativeFacing（+1右/-1左）をJSONで付与。左右非対称の持ち物は別原画または明記した反転規則を納品。
- idle8、run12、jump6（上昇3/下降3）、airAttack8、弱各段8、強10、遠距離8、必殺12、被弾4、空中被弾4、着地4、起上り6、KO6、ガード4、掴み6、保持4、投げ8、回避6、溜め4、勝利8を目標とする。既存ラミ16コマ攻撃は維持し、増枚のための置換は不要。
- 落下強専用は別途全20キャラに slamStart4 / slamFall4（ループ）/ slamLand8 を用意。現在は既存airAttack/landingAttackを再利用。アサモブ桃花三閃は3回の斬撃に対応する予備・接触・回復を計12コマ以上、接触時点0.24/0.42/0.62秒を指定。
- CSVのvictory=0は専用actions.victoryがない意味。現在の勝利演出に表示がないという意味ではない。既存showcaseの代替ポーズと区別する。
- 検収は全コマの不透明bounds、足元位置、左右方向、隣接セル混入、60/120Hzの接触時刻を確認する。原画受領後に取り込み・再検査が必要。

専用actionが0の行でも、現在は他actionへのフォールバックで描画する場合があります。特にデンデンの地上strongは別遠距離入力に置き換わるため、専用強原画の要否は制作時に決定します。

## 2026-10-21 表示修正時点の素材待ち

ミント通常・変身のv31技と変身移動に隣接コマ混入を確認。破損画像を削る代わりに、既存v12の全身ポーズを再利用した。アサモブ選択画像も修正済み全身コマへ差し替えた。これは新規モーションの追加や元の技の完全復元ではない。ミントのv31 motion_06〜23、変身gait_00〜05の余白付き独立フレームまたは切り出し前の原シートが必要。更新CSVは現在の代替構成を反映している。
