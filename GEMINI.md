# プロジェクト情報

ASD/LD向けの子供用「目の動き」トレーニングWebゲーム

## 技術スタック

- Vanilla JavaScript (ES6 Modules)
- Canvas API
- 状態管理: カスタムStateMachine
- GitHub Pages でホスティング

## ディレクトリ構成

```
src/
├── engine/          # ゲームエンジン
│   ├── canvas.js    # CanvasScaling（論理座標800x600）
│   ├── input.js     # InputRouter（タッチ/マウス統合）
│   ├── state.js     # StateMachine（状態遷移管理）
│   ├── audio.js     # AudioManager（効果音）
│   ├── loop.js      # GameLoop（30fps固定）
│   └── utils.js     # Color, Draw, Random, Easing
├── games/           # ゲーム本体
│   ├── gameA_rail.js          # おいかけっこ（追従運動）
│   ├── gameB_readline.js      # ぎょうよみ（行読み）
│   └── gameC_predictSaccade.js # じゅんばん（予測的サッケード）
├── ui/              # UI画面
│   ├── home.js      # ホーム画面
│   ├── hud.js       # ゲーム中HUD
│   ├── result.js    # 結果画面
│   └── settings.js  # 設定画面
└── main.js          # エントリーポイント
```

## コーディング規約

- ES6+ 構文（import/export, class, arrow functions）
- 日本語コメント
- ASD/LD向け配慮:
  - 優しいメッセージ（ひらがな中心）
  - 視覚刺激軽減（穏やかな色、30fps）
  - フォーカストラップ（アクセシビリティ）

## 状態遷移

```
HOME → PLAYING → RESULT → HOME
         ↓↑
       PAUSED
         ↓
      SETTINGS
```

## ゲームクラス共通インターフェース

```javascript
class Game {
  init()              // 初期化
  start()             // 開始
  update(dt)          // 更新（dt=秒）
  render()            // 描画
  handleInput(event)  // 入力処理
  pause()             // 一時停止
  resume()            // 再開
  destroy()           // 破棄
  isGameFinished()    // 終了判定
  getResult()         // 結果取得
}
```

## Gemini CLI設定

### 使用モデル
- **gemini-3-pro-preview** - 最新の推論・コーディング特化モデル
- 1Mトークンコンテキストウィンドウ

### Agent Skills

このプロジェクトでは以下のスキルを使用できます：

- `search_file_content` - ファイル内容検索
- `read_file` - ファイル読み込み
- `save_memory` - メモリ保存
- `asd-game-helper` - ASD/LDゲーム開発支援（カスタム）

カスタムスキルは `.gemini/skills/` ディレクトリに追加できます。

### コマンド例

```bash
# 最新モデルで実行
gemini -m gemini-3-pro-preview "タスク内容"

# 高速モデルで実行
gemini -m gemini-3-flash-preview "タスク内容"

# 自動承認モード
gemini -y "ファイルを修正して"
```
