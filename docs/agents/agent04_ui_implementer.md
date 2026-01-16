# Agent 04: UI Implementer - UI実装仕様書

## 1. 目的

Home/Settings/Help/ResultのDOM UI、およびゲーム中のHUDを実装する。ASD/LDを持つ子どもたちが安心して操作できる、穏やかで分かりやすいインターフェースを提供する。

### 基本方針
- **穏やかさ**: 刺激を抑えた配色・アニメーション
- **分かりやすさ**: 大きなボタン、明確なラベル
- **予測可能性**: 一貫したレイアウト、操作フロー
- **アクセシビリティ**: キーボード操作、フォーカス表示

---

## 2. やること（チェックリスト）

### 2.1 Home画面

#### 機能要件
- [ ] アプリタイトル表示
  - [ ] 「めのうんどう」の大きな表示
  - [ ] 読みやすいフォント
- [ ] ゲーム選択メニュー
  - [ ] 各ゲームのボタン（大きめ、44px以上）
  - [ ] ゲーム名と簡単な説明
  - [ ] 選択中のゲームが分かるフォーカス表示
- [ ] 設定ボタン
  - [ ] 「せってい」ボタン
  - [ ] アイコン + テキスト
- [ ] 注意書き表示
  - [ ] 初回のみ音声に関する注意
  - [ ] 「このアプリは おとがでます」

#### UI構成
```html
<div id="home-screen" class="screen">
  <header class="app-header">
    <h1 class="app-title">めのうんどう</h1>
  </header>

  <main class="game-select">
    <h2 class="section-title">あそびをえらぶ</h2>
    <div class="game-buttons">
      <button class="game-btn" data-game="gameA">
        <span class="game-name">レールついし</span>
        <span class="game-desc">うごくまるをめでおいかけよう</span>
      </button>
      <!-- 他のゲームボタン -->
    </div>
  </main>

  <footer class="home-footer">
    <button class="settings-btn">
      <span class="icon">⚙</span>
      <span class="label">せってい</span>
    </button>
  </footer>
</div>
```

### 2.2 Settings画面

#### 機能要件
- [ ] 速度設定
  - [ ] 「はやさ」スライダーまたはボタン
  - [ ] slow / normal の選択
- [ ] ガイド表示設定
  - [ ] 「ガイドひょうじ」ON/OFF
- [ ] 音設定
  - [ ] 「おとのおおきさ」スライダー
  - [ ] 「こうかおん」ON/OFF
- [ ] テーマ設定
  - [ ] 「はいけいのいろ」選択
  - [ ] white / cream / gray / dark
- [ ] 文字サイズ設定
  - [ ] 「もじのおおきさ」選択
  - [ ] medium / large / xlarge
- [ ] 戻るボタン
  - [ ] 「もどる」ボタン

#### UI構成
```html
<div id="settings-screen" class="screen hidden">
  <header class="screen-header">
    <h1>せってい</h1>
  </header>

  <main class="settings-content">
    <div class="setting-item">
      <label>はやさ</label>
      <div class="toggle-buttons">
        <button data-value="slow">ゆっくり</button>
        <button data-value="normal">ふつう</button>
      </div>
    </div>

    <div class="setting-item">
      <label>おとのおおきさ</label>
      <input type="range" min="0" max="100" value="50">
    </div>

    <!-- 他の設定項目 -->
  </main>

  <footer class="settings-footer">
    <button class="back-btn">もどる</button>
  </footer>
</div>
```

### 2.3 Help画面

#### 機能要件
- [ ] 短い説明文
  - [ ] 各ゲームの遊び方
  - [ ] 平易な日本語
  - [ ] 小学生低学年でも読める
- [ ] 操作方法
  - [ ] タッチ/クリック操作の説明
  - [ ] キーボード操作の説明
- [ ] 戻るボタン

#### UI構成
```html
<div id="help-screen" class="screen hidden">
  <header class="screen-header">
    <h1>つかいかた</h1>
  </header>

  <main class="help-content">
    <section class="help-section">
      <h2>あそびかた</h2>
      <p>がめんのまるをタッチしてね</p>
      <p>キーボードのスペースでもえらべるよ</p>
    </section>

    <section class="help-section">
      <h2>こまったとき</h2>
      <p>Escキーでホームにもどれるよ</p>
    </section>
  </main>

  <footer class="help-footer">
    <button class="back-btn">もどる</button>
  </footer>
</div>
```

### 2.4 Result画面

#### 機能要件
- [ ] 静かな結果表示
  - [ ] 「おつかれさま！」メッセージ
  - [ ] プレイ結果（控えめに表示）
  - [ ] 派手な演出なし
- [ ] リトライボタン
  - [ ] 「もういちど」ボタン
- [ ] ホームへ戻るボタン
  - [ ] 「さいしょへ」ボタン

#### UI構成
```html
<div id="result-screen" class="screen hidden">
  <header class="result-header">
    <h1>おつかれさま！</h1>
  </header>

  <main class="result-content">
    <div class="result-message">
      <p>よくできたね</p>
    </div>

    <div class="result-stats">
      <p class="stat-item">じかん: <span id="result-time">0</span>びょう</p>
    </div>
  </main>

  <footer class="result-footer">
    <button class="retry-btn">もういちど</button>
    <button class="home-btn">さいしょへ</button>
  </footer>
</div>
```

### 2.5 HUD（ゲーム中の最小UI）

#### 機能要件
- [ ] 最小限の情報表示
  - [ ] 一時停止ボタン（控えめ）
  - [ ] 進行状況（必要な場合のみ、小さく）
- [ ] 非侵入的デザイン
  - [ ] ゲームプレイを邪魔しない
  - [ ] 画面端に配置

#### UI構成
```html
<div id="game-hud" class="hud hidden">
  <button class="hud-pause-btn" aria-label="いちじていし">
    <span class="pause-icon">⏸</span>
  </button>

  <div class="hud-progress">
    <div class="progress-bar">
      <div class="progress-fill"></div>
    </div>
  </div>
</div>
```

---

## 3. 成果物

### ファイル一覧
| ファイル | 内容 |
|---------|------|
| `src/ui/home.js` | Home画面のロジック |
| `src/ui/settings.js` | Settings画面のロジック |
| `src/ui/help.js` | Help画面のロジック |
| `src/ui/result.js` | Result画面のロジック |
| `src/ui/hud.js` | ゲーム中HUDのロジック |
| `styles/main.css` | 全体スタイルシート |

### 実装構造

各UIファイルは以下の構造に従う:

```javascript
/**
 * @fileoverview UI画面名 の実装
 * @module ui/screen_name
 */

// UI管理クラス
class ScreenNameUI {
  constructor(container) {
    this.container = container;
    this.elements = {};
  }

  // 初期化
  init() {
    this._createElements();
    this._bindEvents();
  }

  // 表示
  show() {
    this.container.classList.remove('hidden');
    this._setFocus();
  }

  // 非表示
  hide() {
    this.container.classList.add('hidden');
  }

  // DOM要素作成
  _createElements() { /* ... */ }

  // イベントバインド
  _bindEvents() { /* ... */ }

  // フォーカス設定
  _setFocus() { /* ... */ }

  // クリーンアップ
  destroy() { /* ... */ }
}

export { ScreenNameUI };
export default ScreenNameUI;
```

---

## 4. 完了条件

### 4.1 Home画面

| 項目 | 条件 |
|------|------|
| 表示 | タイトルとゲーム選択ボタンが表示される |
| ゲーム選択 | 各ゲームボタンをクリック/タッチで選択できる |
| 設定遷移 | 設定ボタンで設定画面に遷移できる |
| キーボード | Tab/Enter/矢印キーで操作できる |
| フォーカス | 選択中のボタンが明確に分かる |

### 4.2 Settings画面

| 項目 | 条件 |
|------|------|
| 設定表示 | 全設定項目が表示される |
| 設定変更 | 各設定を変更できる |
| 設定保存 | 変更がlocalStorageに保存される |
| 即時反映 | テーマ・文字サイズが即座に反映される |
| 戻る | 戻るボタンでホームに戻れる |

### 4.3 Help画面

| 項目 | 条件 |
|------|------|
| 表示 | 説明文が読みやすく表示される |
| 文言 | 小学生低学年でも理解できる |
| 戻る | 戻るボタンでホームに戻れる |

### 4.4 Result画面

| 項目 | 条件 |
|------|------|
| 表示 | ゲーム終了後に表示される |
| 結果 | プレイ結果が控えめに表示される |
| リトライ | もう一度同じゲームを開始できる |
| ホーム | ホーム画面に戻れる |

### 4.5 HUD

| 項目 | 条件 |
|------|------|
| 表示 | ゲーム中のみ表示される |
| 一時停止 | 一時停止ボタンが機能する |
| 非侵入 | ゲームプレイを邪魔しない |

### 4.6 共通条件

| 項目 | 条件 |
|------|------|
| レスポンシブ | 様々な画面サイズに対応 |
| タッチ対応 | タッチ操作が正常に機能 |
| キーボード対応 | キーボードのみで全操作可能 |
| フォーカス表示 | フォーカス中の要素が明確 |
| 画面遷移 | 遷移が0.3秒以上かけてフェード |

---

## 5. NG（禁止事項）

### 5.1 視覚的演出に関するNG

| 禁止事項 | 理由 | 代替案 |
|---------|------|--------|
| 点滅するボタン | 光過敏、注意散漫 | 静的な表示、穏やかなホバー効果 |
| 派手なホバーエフェクト | 視覚的刺激過多 | 背景色の微妙な変化 |
| スライドイン/バウンス | 予測困難、不安 | フェードイン（0.3秒以上） |
| パーティクル背景 | 集中妨害 | 単色または静的なグラデーション |
| 高彩度の配色 | 目の疲労 | パステル系、低彩度 |

### 5.2 レイアウトに関するNG

| 禁止事項 | 理由 | 代替案 |
|---------|------|--------|
| 小さすぎるボタン（44px未満） | 操作困難 | 最小44px x 44px |
| 密集したUI要素 | 誤タップ、混乱 | 十分な余白（16px以上） |
| 深いメニュー階層 | 迷子になる | フラット構造（2階層以内） |
| 自動スクロール | 制御不能感 | ユーザー操作のみ |
| ポップアップ/モーダル多用 | 驚愕、混乱 | インライン表示 |

### 5.3 テキスト・文言に関するNG

| 禁止事項 | 理由 | 代替案 |
|---------|------|--------|
| 難しい漢字 | 読めない | ひらがな主体 |
| 長い説明文 | 読む負担 | 短く簡潔に |
| 否定的な表現 | 自己否定感 | 励ましの表現 |
| 専門用語 | 理解困難 | 平易な言葉 |
| 時間制限の強調 | プレッシャー | 控えめまたは非表示 |

### 5.4 音声に関するNG

| 禁止事項 | 理由 | 代替案 |
|---------|------|--------|
| ボタン押下時の大きな音 | 聴覚過敏 | 小さく短い音（オプション） |
| 画面遷移時の効果音 | 予測困難 | 無音または非常に控えめ |
| 自動再生BGM | 聴覚過敏、集中妨害 | ユーザーが明示的にONにする |

### 5.5 アニメーション・トランジションに関するNG

| 禁止事項 | 理由 | 代替案 |
|---------|------|--------|
| 急な画面切り替え | 驚愕反応 | 0.3〜0.5秒のフェード |
| 速いアニメーション（0.2秒未満） | 追従困難 | 0.3秒以上 |
| 複数要素の同時アニメーション | 視覚的混乱 | 順次または単一 |
| ループするアニメーション | 集中妨害 | 静的表示 |

### 5.6 CSS実装例

```css
/* NG: 急な切り替え */
.screen {
  display: none;
}
.screen.active {
  display: block;
}

/* OK: フェードによる切り替え */
.screen {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.4s ease, visibility 0.4s;
}
.screen.active {
  opacity: 1;
  visibility: visible;
}

/* NG: 派手なホバー効果 */
.btn:hover {
  transform: scale(1.2);
  box-shadow: 0 0 20px gold;
}

/* OK: 穏やかなホバー効果 */
.btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* NG: 小さいボタン */
.btn {
  padding: 5px 10px;
  font-size: 12px;
}

/* OK: 十分な大きさのボタン */
.btn {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
  font-size: 18px;
}

/* NG: 点滅効果 */
@keyframes blink {
  50% { opacity: 0; }
}
.highlight {
  animation: blink 0.5s infinite;
}

/* OK: 穏やかなパルス（必要な場合のみ） */
@keyframes gentle-pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}
.highlight {
  animation: gentle-pulse 2s ease-in-out;
}
```

---

## 6. スタイル設計

### 6.1 CSS変数（テーマ対応）

```css
:root {
  /* 基本カラー */
  --bg-color: #FFFFFF;
  --text-color: #333333;
  --text-secondary: #666666;

  /* アクセントカラー（穏やか） */
  --primary-color: #7EB5A6;
  --secondary-color: #A8C5D9;

  /* UI要素 */
  --btn-bg: #F5F5F5;
  --btn-hover: #EBEBEB;
  --btn-active: #E0E0E0;

  /* フォーカス */
  --focus-color: #4A90D9;
  --focus-width: 3px;

  /* フォントサイズ */
  --font-size-base: 22px;
  --font-size-large: 28px;
  --font-size-xlarge: 34px;

  /* トランジション */
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;

  /* スペーシング */
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}

/* テーマ: クリーム */
[data-theme="cream"] {
  --bg-color: #FFF8E7;
}

/* テーマ: グレー */
[data-theme="gray"] {
  --bg-color: #E8E8E8;
}

/* テーマ: ダーク */
[data-theme="dark"] {
  --bg-color: #2D2D2D;
  --text-color: #F0F0F0;
  --text-secondary: #CCCCCC;
  --btn-bg: #3D3D3D;
  --btn-hover: #4D4D4D;
}

/* 文字サイズ: medium */
[data-font-size="medium"] {
  --font-size-base: 18px;
  --font-size-large: 24px;
}

/* 文字サイズ: xlarge */
[data-font-size="xlarge"] {
  --font-size-base: 26px;
  --font-size-large: 34px;
}
```

### 6.2 ボタンスタイル

```css
.btn {
  min-height: 44px;
  min-width: 44px;
  padding: var(--spacing-md) var(--spacing-lg);

  font-size: var(--font-size-base);
  font-family: inherit;
  color: var(--text-color);

  background-color: var(--btn-bg);
  border: 2px solid transparent;
  border-radius: 8px;

  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.btn:hover {
  background-color: var(--btn-hover);
}

.btn:active {
  background-color: var(--btn-active);
}

.btn:focus {
  outline: var(--focus-width) solid var(--focus-color);
  outline-offset: 2px;
}

.btn:focus:not(:focus-visible) {
  outline: none;
}

.btn:focus-visible {
  outline: var(--focus-width) solid var(--focus-color);
  outline-offset: 2px;
}
```

### 6.3 画面遷移

```css
.screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  opacity: 0;
  visibility: hidden;
  transition:
    opacity var(--transition-slow),
    visibility var(--transition-slow);
}

.screen.active {
  opacity: 1;
  visibility: visible;
}
```

---

## 7. アクセシビリティ要件

### 7.1 キーボード操作

| キー | 動作 |
|------|------|
| Tab | 次のフォーカス可能な要素へ |
| Shift + Tab | 前のフォーカス可能な要素へ |
| Enter / Space | ボタン押下 |
| Escape | ホームへ戻る / キャンセル |
| 矢印キー | リスト内の移動 |

### 7.2 フォーカス管理

```javascript
// 画面表示時に最初の要素にフォーカス
function setInitialFocus(screen) {
  const firstFocusable = screen.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (firstFocusable) {
    firstFocusable.focus();
  }
}

// フォーカストラップ（モーダル用）
function trapFocus(container) {
  const focusables = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  container.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
```

### 7.3 ARIA属性

```html
<!-- ボタン -->
<button aria-label="せってい">
  <span class="icon" aria-hidden="true">⚙</span>
</button>

<!-- 画面 -->
<div id="home-screen" role="main" aria-label="ホーム画面">

<!-- 進行状況 -->
<div role="progressbar"
     aria-valuenow="50"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-label="しんちょくじょうきょう">
</div>

<!-- 設定スライダー -->
<input type="range"
       aria-label="おとのおおきさ"
       aria-valuetext="50パーセント">
```

---

*このドキュメントはAgent 04: UI Implementerによって作成されました*
*最終更新: 2026-01-16*
