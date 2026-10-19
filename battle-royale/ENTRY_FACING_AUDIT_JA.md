# 起動・アサモブ・トイティラ修正と検査（2026-10-19）

## 変更結果
- index.html から battle-royale/index.html の新メイン画面へ直接移動。相対URLを使い、GitHub Pagesサブディレクトリに対応。JavaScriptではクエリとハッシュを保持。
- 旧ラン＆ガンの入口を legacy-gungun.html にバイト単位で保存し、通常画面から旧版へのリンクを除外。素材も全て保存。復元は legacy-gungun.html を index.html へコピー。
- アサモブのジャンプ上昇・頂点・下降3コマと空中／着地攻撃各1コマの誤った-1反転を1へ修正。左向き原画は個別の-1指定を維持。
- 原画から再切出しした15枚（アサモブ11枚、トイティラ4枚）と、原画で隣接姿勢が重なっていたアサモブ21/22の承認済み新規制作2枚を統合。旧画像は削除せず、新パスを参照。
- 17枚に個別pivot・bodyHeight・向き・実画像範囲を登録。sourceCell/displaySize=160を維持し、余白付き画像を160角に縮めない。アサモブ224×192、トイティラ224×224。世界上の倍率は双方1。
- ロビーの新画像はパス名に依存せずメタデータから身体倍率とFX全体の収まりを決める。足元・身体の基準を保ち、表示枠内へ調整。
- ラミ、20ステージ地形、戦闘ルール・攻撃判定・タイミングは変更なし。

## 原因
アサモブは画像ごとの向き指定が誤っていたほか、v31の分割画像に隣接セルの剣・光跡が混入。トイティラは原画の餅・光跡が元の切出し矩形を越えていた。画面中央の描画でも再現し、カメラ端だけの問題ではなかった。

## 検査結果
- 開始時 main / ebf4719、作業ツリーに既存差分なし。AGENTS.mdなし。
- 2 ZIPの指定SHA256、全17画像の個別SHA256・寸法・4px透明余白を照合。
- 全登録167コマを左右334枚として実sprite描画処理を使用して非ブラウザCanvasで描画。左右の鏡像一致と検査Canvasでの追加切断なし。
- 上昇vy=-600,-200、頂点0、下降200,600の実フレーム選択を検査。踏切の左向き原画は反転、残る右向き原画はそのまま使用。
- 17枚について実drawImageの矩形・倍率・pivotを検査。元pivotからの追加余白はアサモブ[32,16]、トイティラ[32,32]。既存トイティラ4枚のalpha>30画素はRGBAと世界上の座標が完全一致。拡大による見かけの修復ではない。
- ロビーの4サイズ×左右×17枚=136条件で実描画、表示端に不透明画素なし。勝利画面のidle描画も確認。
- 新17枚の戦闘／ロビー左右の全画像を目視。元の全固有130画像一覧、修正ジャンプ・空中攻撃・必殺の左右も目視。
- 静的検査: 28インラインJS構文、2,824画像参照、新入口、相対URL、旧版保存が合格。
- ラミ60/120Hz・覚醒・ヒットストップ、および20エリア・360画面/位置条件の既存検査が合格。

## 検査の再実行
node tests/battle-royale-static.test.cjs
node tests/battle-royale-rami-timing.test.cjs
node tests/battle-royale-adventure-stage.test.cjs
node tests/battle-royale-repaired-art.test.cjs

最後の検査は既存の @napi-rs/canvas が必要。標準探索で見つからない場合は MOB_CANVAS_MODULE に既存モジュールの絶対パスを指定。MOB_ART_REPORT に出力先を指定すれば左右のPNGとJSONを生成する。追加インストールは行っていない。

## 制限
アサモブ11・17・23の薄い外周光は元シート右端で既に切れている（端alpha最大14/7/9）。存在する原画の分離・保持までで、元シート外の光を完全復元したとは扱わない。21/22は元画素復元ではなく新規制作された姿勢。切替の印象や操作感はブラウザ・実機未確認。

## 記録・保存
repair-provenance/ に2つの素材manifest、17枚の置換情報、validation-summary.jsonを保存。原図の識別情報・各画像ハッシュ・再制作の区別を追跡可能。

最初のバックアップ: C:/Users/CB-Me/AppData/Local/Temp/MOB-GUN-GUN-backup-20261019-entry-facing/
17枚統合前バックアップ: C:/Users/CB-Me/AppData/Local/Temp/MOB-GUN-GUN-backup-20261019-before-17-repairs/
全167コマの左右描画: C:/Users/CB-Me/AppData/Local/Temp/MOB-GUN-GUN-audit-20261019/
17枚の戦闘・ロビー描画: C:/Users/CB-Me/AppData/Local/Temp/MOB-GUN-GUN-repaired-art-audit-20261019/

MOB-DENDENは無変更。Chrome等のブラウザ起動、追加課金、commit、push、公開、破壊的削除なし。
