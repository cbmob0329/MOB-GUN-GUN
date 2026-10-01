モブドラゴン / 草原 Area 4 大型ボス

全画像は4×4・16コマ、透過PNG。
walk.png 歩行 / hover.png 浮遊 / dash.png ダッシュ
attack.png 通常攻撃 / breath.png 火を吹く / orb.png 火炎球体を吐く
dive.png 落下攻撃 / flame.png ドラゴンフレイム / defeat.png やられ
effects.png 上から爪撃・火炎放射・火炎球・落下衝撃、各4コマ。

組み込み image_gen で制作。参照: MOB-QUEST/boss/09.png
プロンプト全文: prompts.json
実装・調整値: ../../dragon.js
キャラクターは画像全体で連結した16体を識別し、隣のコマを混入させず切り出す。
翼や倒れ姿によるサイズ変動を防ぐため、全動作を共通の縮尺で表示。
通常表示高 約200、最大HP 1680。各攻撃の予兆・ダメージ・速度はDRAGON設定を参照。

開始画面でAREA 4 BOSSを選択（初期値モブドラゴン）。ミラモブ戦も保持。
PC/スマホ横画面エミュレーション: tests/dragon.test.cjs
キャンペーン進行: tests/campaign.test.cjs
