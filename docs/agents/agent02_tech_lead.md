# Agent 02: Tech Lead - アーキテクチャ設計書

## 1. 目的

ASD（自閉スペクトラム症）およびLD（学習障害）を持つ子どもたちの「目の動き」を改善するためのWebベースのトレーニングゲームを開発する。

### 1.1 技術目標
- **シンプルさ**: ビルドツール不要、HTML/CSS/JSのみで動作
- **アクセシビリティ**: 視覚的に優しく、刺激を抑えた設計
- **保守性**: 明確な責務分離と共通インターフェース
- **拡張性**: 新しいゲームを容易に追加可能

### 1.2 対象ブラウザ
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 2. フォルダ構成（詳細）

```
/
├── index.html              # エントリーポイント（単一HTML）
├── styles/
│   └── main.css            # 全体スタイル（CSS変数でテーマ対応）
├── src/
│   ├── main.js             # アプリケーション初期化・ルーティング
│   ├── engine/             # 共通ゲームエンジン
│   │   ├── canvas.js       # Canvas管理（リサイズ、DPI対応）
│   │   ├── loop.js         # ゲームループ（RAF、deltaTime計算）
│   │   ├── input.js        # 入力管理（タッチ、マウス、キーボード）
│   │   ├── audio.js        # 効果音管理（Web Audio API）
│   │   ├── storage.js      # localStorage永続化
│   │   ├── state.js        # アプリ全体の状態管理
│   │   ├── theme.js        # テーマ切り替え（ライト/ダーク/やさしい）
│   │   └── utils.js        # ユーティリティ関数群
│   ├── games/              # 各ゲーム実装
│   │   ├── gameA_rail.js           # ゲームA: レール追従
│   │   ├── gameB_readline.js       # ゲームB: 行読みトレーニング
│   │   ├── gameC_predictSaccade.js # ゲームC: 予測的サッカード
│   │   └── gameD_inhibition.js     # ゲームD: 抑制制御（任意）
│   └── ui/                 # UIコンポーネント
│       ├── home.js         # ホーム画面
│       ├── hud.js          # ゲーム中HUD（スコア、時間等）
│       ├── result.js       # 結果画面
│       ├── settings.js     # 設定画面
│       └── help.js         # ヘルプ・使い方画面
├── assets/                 # 静的リソース
│   ├── images/             # 画像ファイル
│   ├── sounds/             # 効果音ファイル
│   └── fonts/              # フォントファイル（必要に応じて）
├── docs/
│   ├── agents/             # エージェント設計書
│   │   ├── agent01_pm.md
│   │   ├── agent02_tech_lead.md
│   │   └── ...
│   └── api/                # API仕様書
└── README.md               # プロジェクト概要
```

### 2.1 各ディレクトリの責務

| ディレクトリ | 責務 |
|-------------|------|
| `src/engine/` | フレームワーク層。ゲーム固有のロジックを含まない |
| `src/games/` | 各ゲームの実装。GameControllerインターフェースを実装 |
| `src/ui/` | DOM操作によるUI。Canvasとは独立 |
| `assets/` | 静的リソース。コードからは相対パスで参照 |
| `docs/` | ドキュメント類 |

---

## 3. 共通インターフェース定義

### 3.1 GameController インターフェース

すべてのゲームは以下のインターフェースを実装する必要がある。

```javascript
/**
 * @interface GameController
 * ゲームコントローラーの共通インターフェース
 */
const GameController = {
  /**
   * ゲームID（一意の識別子）
   * @type {string}
   */
  id: 'gameA',

  /**
   * ゲーム名（表示用）
   * @type {string}
   */
  name: 'レール追従',

  /**
   * ゲームの説明
   * @type {string}
   */
  description: '動く対象を目で追いかけるトレーニング',

  /**
   * 難易度設定
   * @type {Object}
   */
  difficulty: {
    current: 1,      // 現在の難易度 (1-5)
    min: 1,
    max: 5
  },

  /**
   * ゲーム初期化
   * @param {CanvasRenderingContext2D} ctx - Canvas 2Dコンテキスト
   * @param {Object} config - 設定オブジェクト
   * @returns {void}
   */
  init(ctx, config) {},

  /**
   * ゲーム開始
   * @returns {void}
   */
  start() {},

  /**
   * ゲーム更新（毎フレーム呼び出し）
   * @param {number} deltaTime - 前フレームからの経過時間（ms）
   * @returns {void}
   */
  update(deltaTime) {},

  /**
   * ゲーム描画（毎フレーム呼び出し）
   * @param {CanvasRenderingContext2D} ctx - Canvas 2Dコンテキスト
   * @returns {void}
   */
  render(ctx) {},

  /**
   * ゲーム一時停止
   * @returns {void}
   */
  pause() {},

  /**
   * ゲーム再開
   * @returns {void}
   */
  resume() {},

  /**
   * ゲーム終了・クリーンアップ
   * @returns {void}
   */
  destroy() {},

  /**
   * 入力イベントハンドラ
   * @param {Object} inputEvent - 入力イベントオブジェクト
   * @returns {void}
   */
  handleInput(inputEvent) {},

  /**
   * 現在のスコア/結果を取得
   * @returns {GameResult}
   */
  getResult() {}
};

/**
 * @typedef {Object} GameResult
 * @property {number} score - スコア
 * @property {number} accuracy - 正確性 (0-100%)
 * @property {number} duration - プレイ時間（秒）
 * @property {Object} details - ゲーム固有の詳細データ
 */
```

### 3.2 InputEvent インターフェース

```javascript
/**
 * @typedef {Object} InputEvent
 * @property {'touch'|'mouse'|'keyboard'} type - 入力タイプ
 * @property {'down'|'up'|'move'} action - アクション種別
 * @property {number} x - X座標（Canvas座標系）
 * @property {number} y - Y座標（Canvas座標系）
 * @property {string} [key] - キーボードの場合のキー名
 * @property {number} timestamp - タイムスタンプ
 */
```

### 3.3 Config インターフェース

```javascript
/**
 * @typedef {Object} AppConfig
 * @property {Object} canvas - Canvas設定
 * @property {number} canvas.width - Canvas幅
 * @property {number} canvas.height - Canvas高さ
 * @property {Object} audio - オーディオ設定
 * @property {boolean} audio.enabled - 音声有効/無効
 * @property {number} audio.volume - 音量 (0-1)
 * @property {Object} theme - テーマ設定
 * @property {'light'|'dark'|'gentle'} theme.current - 現在のテーマ
 * @property {Object} accessibility - アクセシビリティ設定
 * @property {boolean} accessibility.reduceMotion - モーション軽減
 * @property {number} accessibility.fontSize - フォントサイズ倍率
 */
```

---

## 4. 状態管理設計

### 4.1 アプリケーション状態

```
┌──────────────────────────────────────────────────────────────┐
│                    Application State                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│    ┌─────────┐    select     ┌─────────┐    complete         │
│    │  HOME   │ ───────────>  │ PLAYING │ ───────────┐        │
│    │         │               │         │            │        │
│    └─────────┘               └────┬────┘            │        │
│         ^                         │                 v        │
│         │                     pause               ┌──────┐   │
│         │                         │               │RESULT│   │
│         │                         v               └──┬───┘   │
│         │                    ┌─────────┐            │        │
│         │                    │ PAUSED  │            │        │
│         │                    └────┬────┘            │        │
│         │                         │ resume          │        │
│         │                         v                 │        │
│         │                    ┌─────────┐            │        │
│         │                    │ PLAYING │            │        │
│         │                    └─────────┘            │        │
│         │                                           │        │
│         └───────────────────────────────────────────┘        │
│                          back to home                        │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 状態定義

```javascript
/**
 * アプリケーション状態の定義
 */
const AppState = {
  HOME: 'HOME',           // ホーム画面
  PLAYING: 'PLAYING',     // ゲームプレイ中
  PAUSED: 'PAUSED',       // 一時停止中
  RESULT: 'RESULT',       // 結果表示
  SETTINGS: 'SETTINGS',   // 設定画面
  HELP: 'HELP'            // ヘルプ画面
};

/**
 * 状態遷移の許可マップ
 */
const stateTransitions = {
  [AppState.HOME]: [AppState.PLAYING, AppState.SETTINGS, AppState.HELP],
  [AppState.PLAYING]: [AppState.PAUSED, AppState.RESULT],
  [AppState.PAUSED]: [AppState.PLAYING, AppState.HOME],
  [AppState.RESULT]: [AppState.HOME, AppState.PLAYING], // PLAYING = リトライ
  [AppState.SETTINGS]: [AppState.HOME],
  [AppState.HELP]: [AppState.HOME]
};
```

### 4.3 StateManager クラス設計

```javascript
/**
 * 状態管理クラス
 */
class StateManager {
  constructor() {
    this._currentState = AppState.HOME;
    this._previousState = null;
    this._listeners = [];
    this._gameData = null;
  }

  /**
   * 現在の状態を取得
   * @returns {string}
   */
  get current() {
    return this._currentState;
  }

  /**
   * 状態を変更
   * @param {string} newState - 新しい状態
   * @param {Object} [data] - 状態に関連するデータ
   * @returns {boolean} - 遷移成功/失敗
   */
  transition(newState, data = null) {
    if (!this._canTransition(newState)) {
      console.warn(`Invalid transition: ${this._currentState} -> ${newState}`);
      return false;
    }

    this._previousState = this._currentState;
    this._currentState = newState;
    this._gameData = data;

    this._notifyListeners();
    return true;
  }

  /**
   * 状態変更リスナーを登録
   * @param {Function} callback
   */
  subscribe(callback) {
    this._listeners.push(callback);
  }

  /**
   * 状態変更リスナーを解除
   * @param {Function} callback
   */
  unsubscribe(callback) {
    this._listeners = this._listeners.filter(l => l !== callback);
  }

  // Private methods
  _canTransition(newState) {
    const allowed = stateTransitions[this._currentState];
    return allowed && allowed.includes(newState);
  }

  _notifyListeners() {
    this._listeners.forEach(callback => {
      callback({
        current: this._currentState,
        previous: this._previousState,
        data: this._gameData
      });
    });
  }
}
```

---

## 5. GameController の共通インターフェース

### 5.1 ベースGameControllerクラス

```javascript
/**
 * ゲームコントローラーの基底クラス
 * 全てのゲームはこのクラスを継承する
 */
class BaseGameController {
  constructor(id, name, description) {
    this.id = id;
    this.name = name;
    this.description = description;

    this.ctx = null;
    this.config = null;
    this.isRunning = false;
    this.isPaused = false;

    this.difficulty = {
      current: 1,
      min: 1,
      max: 5
    };

    this.score = 0;
    this.startTime = 0;
    this.elapsedTime = 0;
  }

  /**
   * 初期化（必須オーバーライド）
   */
  init(ctx, config) {
    this.ctx = ctx;
    this.config = config;
    this.reset();
  }

  /**
   * ゲーム状態のリセット
   */
  reset() {
    this.score = 0;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.isRunning = false;
    this.isPaused = false;
  }

  /**
   * ゲーム開始
   */
  start() {
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = performance.now();
  }

  /**
   * 更新処理（サブクラスでオーバーライド）
   */
  update(deltaTime) {
    if (!this.isRunning || this.isPaused) return;
    this.elapsedTime += deltaTime;
  }

  /**
   * 描画処理（サブクラスでオーバーライド）
   */
  render(ctx) {
    // サブクラスで実装
  }

  /**
   * 一時停止
   */
  pause() {
    if (this.isRunning) {
      this.isPaused = true;
    }
  }

  /**
   * 再開
   */
  resume() {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
    }
  }

  /**
   * 終了・クリーンアップ
   */
  destroy() {
    this.isRunning = false;
    this.isPaused = false;
    this.ctx = null;
    this.config = null;
  }

  /**
   * 入力処理（サブクラスでオーバーライド）
   */
  handleInput(inputEvent) {
    // サブクラスで実装
  }

  /**
   * 結果取得
   */
  getResult() {
    return {
      gameId: this.id,
      gameName: this.name,
      score: this.score,
      duration: Math.floor(this.elapsedTime / 1000),
      difficulty: this.difficulty.current,
      timestamp: Date.now(),
      details: this._getDetailedResult()
    };
  }

  /**
   * 詳細結果（サブクラスでオーバーライド）
   */
  _getDetailedResult() {
    return {};
  }

  /**
   * 難易度設定
   */
  setDifficulty(level) {
    this.difficulty.current = Math.max(
      this.difficulty.min,
      Math.min(this.difficulty.max, level)
    );
  }
}
```

### 5.2 ゲーム実装例（GameA: レール追従）

```javascript
/**
 * GameA: レール追従
 * 動くターゲットを目で追いかけるトレーニング
 */
class GameARail extends BaseGameController {
  constructor() {
    super('gameA', 'レール追従', '動くターゲットを目で追いかけよう');

    // ゲーム固有のプロパティ
    this.target = { x: 0, y: 0, radius: 20 };
    this.path = [];
    this.pathIndex = 0;
    this.trackingAccuracy = [];
  }

  init(ctx, config) {
    super.init(ctx, config);
    this._generatePath();
  }

  _generatePath() {
    // 難易度に応じたパス生成
    const complexity = this.difficulty.current;
    // ... パス生成ロジック
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (!this.isRunning || this.isPaused) return;

    // ターゲット位置更新
    // ... ターゲット移動ロジック
  }

  render(ctx) {
    // パス描画
    // ターゲット描画
    // ... 描画ロジック
  }

  handleInput(inputEvent) {
    if (inputEvent.action === 'move') {
      // 視線追跡の精度計算
      // ... 入力処理ロジック
    }
  }

  _getDetailedResult() {
    return {
      pathComplexity: this.difficulty.current,
      averageAccuracy: this._calculateAverageAccuracy(),
      trackingData: this.trackingAccuracy
    };
  }

  _calculateAverageAccuracy() {
    if (this.trackingAccuracy.length === 0) return 0;
    const sum = this.trackingAccuracy.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.trackingAccuracy.length);
  }
}
```

---

## 6. 実装手順

### Phase 1: 基盤構築（優先度: 最高）

1. **ファイル構造の作成**
   - ディレクトリ構造を作成
   - 空のファイルを配置

2. **index.html の作成**
   - 基本HTML構造
   - Canvas要素の配置
   - モジュール読み込み

3. **styles/main.css の作成**
   - CSS変数によるテーマ定義
   - レスポンシブレイアウト
   - アクセシビリティ対応スタイル

4. **engine/ の実装**
   - `canvas.js`: Canvas初期化、リサイズ対応
   - `loop.js`: ゲームループ実装
   - `state.js`: StateManager実装
   - `utils.js`: ユーティリティ関数

### Phase 2: UI実装（優先度: 高）

5. **ui/ の実装**
   - `home.js`: ホーム画面
   - `hud.js`: ゲーム中HUD
   - `result.js`: 結果画面
   - `settings.js`: 設定画面

6. **engine/ 追加実装**
   - `input.js`: 入力管理
   - `audio.js`: 効果音管理
   - `storage.js`: 永続化
   - `theme.js`: テーマ切り替え

### Phase 3: ゲーム実装（優先度: 中）

7. **GameA: レール追従**
   - 基本実装
   - 難易度調整
   - テスト

8. **GameB: 行読みトレーニング**
   - 基本実装
   - 難易度調整
   - テスト

9. **GameC: 予測的サッカード**
   - 基本実装
   - 難易度調整
   - テスト

### Phase 4: 仕上げ（優先度: 低）

10. **統合テスト**
    - 全画面遷移テスト
    - 全ゲームプレイテスト
    - パフォーマンス確認

11. **アクセシビリティ確認**
    - キーボード操作確認
    - スクリーンリーダー対応
    - 色覚対応確認

12. **GameD: 抑制制御（任意）**
    - 基本実装
    - テスト

---

## 7. コーディング規約

### 7.1 全般

- **言語**: ES2020+ (ES Modules使用)
- **インデント**: スペース2つ
- **セミコロン**: 必須
- **クォート**: シングルクォート優先
- **コメント**: JSDoc形式

### 7.2 命名規則

| 種類 | 規則 | 例 |
|------|------|-----|
| クラス | PascalCase | `GameController` |
| 関数/メソッド | camelCase | `handleInput` |
| 定数 | UPPER_SNAKE_CASE | `MAX_SCORE` |
| 変数 | camelCase | `playerScore` |
| プライベート | _prefix | `_internalState` |
| ファイル名 | snake_case | `game_controller.js` |
| CSS変数 | --kebab-case | `--primary-color` |

### 7.3 ファイル構造

```javascript
// ファイルの構造テンプレート
/**
 * @fileoverview ファイルの説明
 * @module モジュール名
 */

// 1. インポート
import { something } from './module.js';

// 2. 定数
const CONSTANT_VALUE = 100;

// 3. クラス/関数定義
class MyClass {
  // ...
}

// 4. エクスポート
export { MyClass };
export default MyClass;
```

### 7.4 Canvas描画規約

```javascript
// Canvas描画のベストプラクティス
function render(ctx) {
  // 1. 状態保存
  ctx.save();

  // 2. 描画処理
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // 3. 状態復元
  ctx.restore();
}
```

### 7.5 エラーハンドリング

```javascript
// エラーハンドリングの例
try {
  riskyOperation();
} catch (error) {
  console.error('[ModuleName] Error:', error.message);
  // ユーザーに優しいフォールバック
  showFriendlyError();
}
```

---

## 8. 完了条件

### 8.1 機能要件

- [ ] ホーム画面が表示される
- [ ] 各ゲームが選択・プレイできる
- [ ] 一時停止・再開が機能する
- [ ] 結果画面が表示される
- [ ] 設定が保存・読み込みできる
- [ ] テーマ切り替えが機能する

### 8.2 技術要件

- [ ] ビルドツール不要で動作する
- [ ] 外部ライブラリを使用していない
- [ ] ES Modulesで構成されている
- [ ] devicePixelRatio対応が完了
- [ ] requestAnimationFrameでループが動作
- [ ] Canvas + DOM UIの分離が完了

### 8.3 品質要件

- [ ] 全画面でエラーが発生しない
- [ ] タッチ・マウス両対応
- [ ] 60fps維持（通常端末）
- [ ] メモリリークがない
- [ ] 状態遷移が正しく機能

### 8.4 アクセシビリティ要件

- [ ] キーボードのみで操作可能
- [ ] フォントサイズ変更対応
- [ ] コントラスト比が十分
- [ ] 点滅・激しいアニメーションがない

---

## 9. NG（禁止事項）

### 9.1 視覚的刺激

| 禁止事項 | 理由 | 代替案 |
|---------|------|--------|
| 激しい点滅 | 光過敏、発作リスク | フェードイン/アウト |
| 急激な色変化 | 視覚ストレス | 緩やかなグラデーション |
| 高コントラストのストロボ | 目の疲労、発作リスク | 穏やかな輝度変化 |
| 速すぎるアニメーション | 追従困難、不安増加 | ゆっくりした動き |
| 複雑すぎるパターン | 視覚的混乱 | シンプルな図形 |

### 9.2 音声・聴覚

| 禁止事項 | 理由 | 代替案 |
|---------|------|--------|
| 突然の大音量 | 聴覚過敏への配慮 | フェードイン |
| 高周波数の音 | 不快感、聴覚過敏 | 穏やかな中〜低音 |
| 複数音の同時再生 | 認知負荷増加 | 単一音源 |
| BGMの強制 | 集中妨害 | オプション化 |

### 9.3 UI/UX

| 禁止事項 | 理由 | 代替案 |
|---------|------|--------|
| 時間制限の過度な強調 | 不安・プレッシャー | 控えめな表示 |
| 失敗の強調表示 | 自己効力感の低下 | 励ましメッセージ |
| 複雑なメニュー構造 | 認知負荷 | フラット構造 |
| 小さすぎるタッチターゲット | 操作困難 | 最小44px |
| 自動進行（待機なし） | 準備不足での開始 | ユーザー開始 |

### 9.4 コード品質

| 禁止事項 | 理由 |
|---------|------|
| 外部ライブラリ使用 | 依存性、メンテナンス性 |
| ビルドツール必須 | 環境構築の複雑化 |
| グローバル変数汚染 | 予期せぬ副作用 |
| 同期的な重い処理 | UIブロッキング |
| console.logの残存 | 本番環境での不要出力 |

### 9.5 具体的な実装NG例

```javascript
// NG: 点滅効果
function flashEffect() {
  element.style.opacity = Math.random(); // 危険！
}

// OK: 緩やかなフェード
function fadeEffect(progress) {
  element.style.opacity = Math.sin(progress * Math.PI * 0.5);
}

// NG: 急激な色変化
function changeColor() {
  ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`; // 危険！
}

// OK: 穏やかな色変化
function changeColorSmooth(hue) {
  const safeHue = (hue + 0.5) % 360;
  ctx.fillStyle = `hsl(${safeHue}, 50%, 70%)`; // 彩度・明度を抑える
}

// NG: 急な音再生
audio.volume = 1.0;
audio.play(); // 危険！

// OK: フェードイン
audio.volume = 0;
audio.play();
fadeInVolume(audio, 0.5, 500); // 500msかけて0.5まで
```

---

## 付録: 各エンジンモジュールの責務

### canvas.js
- Canvas要素の取得・初期化
- devicePixelRatio対応
- リサイズ処理
- クリア処理

### loop.js
- requestAnimationFrameによるループ
- deltaTime計算
- FPS制限（オプション）
- ループの開始・停止

### input.js
- タッチイベント処理
- マウスイベント処理
- キーボードイベント処理
- 座標変換（DOM→Canvas）

### audio.js
- Web Audio API管理
- 効果音のロード・再生
- 音量制御
- ミュート切り替え

### storage.js
- localStorage操作
- 設定の保存・読み込み
- スコア履歴の管理
- データバージョン管理

### state.js
- 状態管理（StateManager）
- 状態遷移の検証
- イベント通知

### theme.js
- テーマ切り替え
- CSS変数の動的変更
- システム設定との連携

### utils.js
- 数学ユーティリティ
- DOM操作ヘルパー
- 型チェック
- デバッグ用関数

---

*このドキュメントはAgent 02: Tech Leadによって作成されました*
*最終更新: 2026-01-16*
