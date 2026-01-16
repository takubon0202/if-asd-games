# Agent 03: Game Implementer - ゲーム実装仕様書

## 1. 目的

Game A/B/C（および任意のGame D）を実装する。ASD/LDを持つ子どもたちの「目の動き」を改善するためのトレーニングゲームを、アクセシビリティに配慮しながら開発する。

### 基本方針
- **刺激制御**: 視覚的に穏やかで、予測可能な動き
- **段階的難易度**: 簡単なレベルから始められる設計
- **成功体験**: 失敗を責めず、できたことを認める
- **シンプルさ**: 操作が直感的で分かりやすい

---

## 2. やること（チェックリスト）

### 2.1 Game A: 視線レール追視

レール上を移動する点をゆっくり追いかけるトレーニング。

#### 機能要件
- [ ] レール種類の実装
  - [ ] 直線レール（水平・垂直・斜め）
  - [ ] S字レール（緩やかなカーブ）
  - [ ] 円形レール（楕円含む）
- [ ] ターゲット（点）の実装
  - [ ] ゆっくりした一定速度での移動
  - [ ] 視認しやすいサイズ（20-30px）
  - [ ] 穏やかな色（パステル系）
- [ ] 難易度設定
  - [ ] 速度調整（slow/normal）
  - [ ] レール複雑さの調整
- [ ] 進行状況の表示（控えめなプログレスバー）

#### 技術仕様
```javascript
// GameA: レール追視の設定
const GAME_A_CONFIG = {
  // レールタイプ
  railTypes: ['straight', 'swave', 'circle'],

  // ターゲット設定
  target: {
    radius: 20,
    color: '#7EB5A6',  // 穏やかな緑
    speed: {
      slow: 50,    // px/s
      normal: 100  // px/s
    }
  },

  // 難易度別設定
  difficulty: {
    easy: { railType: 'straight', speed: 'slow' },
    normal: { railType: 'swave', speed: 'normal' }
  }
};
```

### 2.2 Game B: 行読みガイド

3〜5行に配置されたターゲットを、左から右の順に選択するトレーニング。

#### 機能要件
- [ ] 行の表示
  - [ ] 3〜5行の水平ライン（ガイド線）
  - [ ] 行間は十分な余白
- [ ] ターゲット配置
  - [ ] 各行に1〜3個のターゲット
  - [ ] 選択すべき順序が明確
- [ ] 選択インタラクション
  - [ ] タッチ/クリックで選択
  - [ ] 正解時: 穏やかなフィードバック
  - [ ] 次のターゲットへのヒント表示
- [ ] 難易度設定
  - [ ] 行数の調整（3〜5行）
  - [ ] ターゲット数の調整

#### 技術仕様
```javascript
// GameB: 行読みガイドの設定
const GAME_B_CONFIG = {
  // 行設定
  lines: {
    count: { min: 3, max: 5 },
    spacing: 80,  // px
    guideColor: '#E0E0E0'
  },

  // ターゲット設定
  target: {
    size: 40,
    activeColor: '#6B9BD1',    // 選択対象
    completedColor: '#A8D5A2', // 完了
    nextHintColor: '#FFE5B4'   // 次のヒント
  },

  // 難易度別設定
  difficulty: {
    easy: { lines: 3, targetsPerLine: 1 },
    normal: { lines: 4, targetsPerLine: 2 }
  }
};
```

### 2.3 Game C: 予告付き視線切り替え

薄い予告表示の後に本表示される、規則パターンの視線切り替えトレーニング。

#### 機能要件
- [ ] 予告表示
  - [ ] 薄い色で「次の位置」を予告
  - [ ] 1〜2秒の予告時間
- [ ] 本表示
  - [ ] 予告位置にターゲットが出現
  - [ ] 規則的なパターン（左右交互など）
- [ ] パターン種類
  - [ ] 左右交互
  - [ ] 上下交互
  - [ ] 四隅順番
- [ ] 選択インタラクション
  - [ ] ターゲット出現後に選択
  - [ ] 反応時間は十分に確保

#### 技術仕様
```javascript
// GameC: 予告付き視線切り替えの設定
const GAME_C_CONFIG = {
  // 予告設定
  preview: {
    duration: 1500,     // ms
    opacity: 0.3,       // 薄い表示
    color: '#D4A5A5'
  },

  // 本表示設定
  target: {
    size: 50,
    color: '#C9A7EB',
    displayDuration: 3000  // ms（十分な時間）
  },

  // パターン
  patterns: {
    leftRight: [
      { x: 0.2, y: 0.5 },
      { x: 0.8, y: 0.5 }
    ],
    upDown: [
      { x: 0.5, y: 0.2 },
      { x: 0.5, y: 0.8 }
    ],
    corners: [
      { x: 0.2, y: 0.2 },
      { x: 0.8, y: 0.2 },
      { x: 0.8, y: 0.8 },
      { x: 0.2, y: 0.8 }
    ]
  }
};
```

### 2.4 Game D: 抑制制御（任意）

特定のターゲットのみを選択し、間違ったターゲットを避けるトレーニング。

#### 機能要件
- [ ] ターゲット種類
  - [ ] 正解ターゲット（選択すべき）
  - [ ] ディストラクター（選択しない）
- [ ] 視覚的な区別
  - [ ] 形で区別（丸 vs 四角など）
  - [ ] 色は補助的に使用
- [ ] フィードバック
  - [ ] 正解: 穏やかな成功表示
  - [ ] 間違い: 責めない表現でヒント

---

## 3. 成果物

### ファイル一覧
| ファイル | 内容 |
|---------|------|
| `src/games/gameA_rail.js` | Game A: 視線レール追視 |
| `src/games/gameB_readline.js` | Game B: 行読みガイド |
| `src/games/gameC_predictSaccade.js` | Game C: 予告付き視線切り替え |
| `src/games/gameD_inhibition.js` | Game D: 抑制制御（任意） |

### 実装構造

各ゲームファイルは以下の構造に従う:

```javascript
/**
 * @fileoverview Game X の実装
 * @module games/gameX
 */

import { BaseGameController } from '../engine/game_controller.js';

// 定数定義
const CONFIG = { /* ... */ };

// ゲームクラス
class GameX extends BaseGameController {
  constructor() {
    super('gameX', 'ゲーム名', '説明文');
  }

  // 必須メソッドの実装
  init(ctx, config) { /* ... */ }
  start() { /* ... */ }
  update(deltaTime) { /* ... */ }
  render(ctx) { /* ... */ }
  handleInput(inputEvent) { /* ... */ }
  destroy() { /* ... */ }
  getResult() { /* ... */ }
}

export { GameX };
export default GameX;
```

---

## 4. 完了条件

### 4.1 Game A: 視線レール追視

| 項目 | 条件 |
|------|------|
| レール表示 | 直線・S字・円の3種類が正しく描画される |
| ターゲット移動 | 設定速度で滑らかに移動する |
| 難易度 | easy/normalで速度とレールが変わる |
| 開始・終了 | 正常にゲームが開始・終了できる |
| 結果取得 | プレイ時間と完了率が取得できる |

### 4.2 Game B: 行読みガイド

| 項目 | 条件 |
|------|------|
| 行表示 | 3〜5行が適切な間隔で表示される |
| ターゲット配置 | 各行にターゲットが正しく配置される |
| 選択順序 | 左から右、上から下の順序で選択できる |
| フィードバック | 正解時に穏やかなフィードバックがある |
| 次のヒント | 次に選択すべきターゲットが分かる |

### 4.3 Game C: 予告付き視線切り替え

| 項目 | 条件 |
|------|------|
| 予告表示 | 薄い色で次の位置が予告される |
| 本表示 | 予告後にターゲットが明確に表示される |
| パターン | 規則的なパターンで位置が変わる |
| 選択 | ターゲット選択が正しく判定される |
| 十分な時間 | 反応するまでの時間が十分にある |

### 4.4 Game D: 抑制制御（任意）

| 項目 | 条件 |
|------|------|
| ターゲット区別 | 正解とディストラクターが視覚的に区別できる |
| 正解判定 | 正しいターゲットの選択が判定される |
| フィードバック | 責めない表現でフィードバックがある |

### 4.5 共通条件

| 項目 | 条件 |
|------|------|
| インターフェース | BaseGameControllerを正しく継承している |
| 入力対応 | タッチ・マウス・キーボードに対応 |
| 一時停止 | pause/resumeが正しく機能する |
| 設定反映 | 音量・速度などの設定が反映される |
| メモリ | destroyでリソースが解放される |

---

## 5. NG（禁止事項）

### 5.1 視覚的刺激に関するNG

| 禁止事項 | 理由 | 代替案 |
|---------|------|--------|
| ターゲットの点滅 | 光過敏・てんかんリスク | 穏やかなフェード |
| 急激な速度変化 | 追従困難、不安 | 一定速度または緩やかな加減速 |
| 派手な色使い | 視覚的刺激過多 | パステル系の穏やかな色 |
| 複雑なパーティクル | 視覚的混乱 | シンプルな図形のみ |
| 高彩度・高コントラスト | 目の疲労 | 彩度50%以下、適度なコントラスト |

### 5.2 演出に関するNG

| 禁止事項 | 理由 | 代替案 |
|---------|------|--------|
| 正解時の派手なエフェクト | 刺激過多 | 穏やかな色変化、小さなアイコン |
| 失敗時の赤い強調 | 不安・自己否定感 | 灰色または薄い色でのヒント表示 |
| 効果音の連続再生 | 聴覚過敏への配慮 | 控えめな単発音 |
| 時間制限のカウントダウン表示 | プレッシャー | 非表示または控えめな表示 |

### 5.3 ゲームプレイに関するNG

| 禁止事項 | 理由 | 代替案 |
|---------|------|--------|
| 速すぎるターゲット移動 | 追従不能、挫折感 | 十分にゆっくりした速度 |
| 短すぎる反応時間 | 焦り、失敗体験 | 3秒以上の猶予 |
| 突然の難易度上昇 | 混乱、挫折 | 段階的な難易度変化 |
| 複雑すぎるルール | 認知負荷 | 1つのシンプルなルール |
| 自動進行 | 準備不足での失敗 | ユーザーの開始操作を待つ |

### 5.4 コード実装に関するNG

```javascript
// NG: 急激な速度変化
this.speed = Math.random() * 200; // 危険！

// OK: 一定速度
this.speed = CONFIG.target.speed.slow;

// NG: 点滅効果
this.opacity = Math.sin(Date.now() * 0.01) > 0 ? 1 : 0; // 危険！

// OK: 穏やかなパルス
this.opacity = 0.7 + Math.sin(Date.now() * 0.001) * 0.1;

// NG: 失敗時の強調
ctx.fillStyle = '#FF0000'; // 危険！
ctx.fillText('まちがい！', x, y);

// OK: 穏やかなヒント
ctx.fillStyle = '#888888';
ctx.fillText('こっちをさがしてね', x, y);

// NG: 短い反応時間
const REACTION_TIME = 500; // 危険！

// OK: 十分な反応時間
const REACTION_TIME = 3000;
```

---

## 6. 各ゲームの詳細設計

### 6.1 Game A: 視線レール追視

#### 状態遷移
```
INIT → READY → RUNNING → COMPLETED
              ↓      ↑
            PAUSED ─┘
```

#### レール生成アルゴリズム
```javascript
// 直線レールの生成
function generateStraightRail(canvas) {
  const startX = canvas.width * 0.1;
  const endX = canvas.width * 0.9;
  const y = canvas.height * 0.5;
  return [
    { x: startX, y: y },
    { x: endX, y: y }
  ];
}

// S字レールの生成（ベジェ曲線）
function generateSwaveRail(canvas, points = 50) {
  // 制御点を使った滑らかなカーブ
}

// 円形レールの生成
function generateCircleRail(canvas, points = 60) {
  const centerX = canvas.width * 0.5;
  const centerY = canvas.height * 0.5;
  const radius = Math.min(canvas.width, canvas.height) * 0.3;
  // 円周上の点を生成
}
```

### 6.2 Game B: 行読みガイド

#### ターゲット配置ロジック
```javascript
function placeTargets(lineCount, targetsPerLine, canvasWidth) {
  const targets = [];
  for (let line = 0; line < lineCount; line++) {
    for (let i = 0; i < targetsPerLine; i++) {
      targets.push({
        line: line,
        x: calculateXPosition(i, targetsPerLine, canvasWidth),
        y: calculateYPosition(line, lineCount),
        order: line * targetsPerLine + i,
        selected: false
      });
    }
  }
  return targets;
}
```

### 6.3 Game C: 予告付き視線切り替え

#### タイミングシーケンス
```
[予告表示 1.5s] → [本表示 3s] → [次の予告表示 1.5s] → ...
```

#### パターン実装
```javascript
function getNextPosition(pattern, currentIndex) {
  const positions = PATTERNS[pattern];
  return positions[currentIndex % positions.length];
}
```

---

## 7. テスト観点

### 各ゲーム共通
- [ ] 正常に開始・終了できる
- [ ] pause/resumeが機能する
- [ ] 設定変更が反映される
- [ ] 結果が正しく取得できる
- [ ] メモリリークがない

### Game A 固有
- [ ] 各レールタイプが正しく描画される
- [ ] ターゲットがレール上を移動する
- [ ] 速度設定が反映される

### Game B 固有
- [ ] 行とターゲットが正しく配置される
- [ ] 順序通りに選択できる
- [ ] 間違った順序での選択がヒントになる

### Game C 固有
- [ ] 予告が適切なタイミングで表示される
- [ ] 本表示が予告位置に出現する
- [ ] パターンが規則的に変化する

---

*このドキュメントはAgent 03: Game Implementerによって作成されました*
*最終更新: 2026-01-16*
