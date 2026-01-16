# 目の動きトレーニング

ASD（自閉スペクトラム症）およびLD（学習障害）のある方向けの「目の動き」トレーニングWebゲームです。

## 概要

視線の追視・切り替え・行読みといった基本的な眼球運動を、ゲーム形式で楽しく練習できるアプリケーションです。発達特性に配慮し、光過敏への対策や、失敗を責めないフィードバック設計を採用しています。

> **注意**: 本アプリケーションは支援・学習目的で開発されたものであり、医療行為や治療を目的としたものではありません。

---

## ⚠️ 重要な注意事項

以下の点を必ずお読みください。

| 項目 | 説明 |
|------|------|
| **目的** | 支援・学習目的であり、医療行為ではありません |
| **体調** | 疲れ・不快感・頭痛が出たら、すぐに中止してください |
| **光過敏** | 点滅演出は使用していません（フェードイン/アウトのみ） |
| **音声** | デフォルトではOFFです。必要に応じてONにしてください |
| **使用時間** | 1日15分程度を目安にしてください |

無理をせず、自分のペースで取り組むことが大切です。

---

## ゲーム説明

3種類のトレーニングゲームが含まれています。

### Game A: レールついし（視線レール追視）

画面に表示されたレール（線）に沿って移動する点を目で追いかけるゲームです。

- **レールの種類**: 直線 / S字カーブ / 円形
- **目的**: スムーズな追視（滑らかに目を動かす）の練習
- 中間地点でタップ/クリックすると得点になります

### Game B: ぎょうよみ（行読みガイド）

3〜5行に並んだ図形を、左から右へ順番に選んでいくゲームです。

- **目的**: 行をたどって読む動きの練習
- 現在の行がハイライト表示されます（ガイドON時）
- 間違えても優しいメッセージで正しい位置を教えてくれます

### Game C: よそくジャンプ（予告付き視線切り替え）

次に出る位置が「うっすら」表示され、0.5秒後に本表示されたらタップ/クリックで反応するゲームです。

- **パターン**: 横（左右）/ 縦（上下）/ 中央挟み
- **目的**: 予測して視線を準備する練習
- タイムアップでも否定的なフィードバックは表示しません

---

## 操作方法

### 基本操作

| キー / 操作 | 動作 |
|------------|------|
| Space / クリック / タップ | アクション（ゲーム中の反応） |
| R | リトライ（結果画面で） |
| Esc | ホームに戻る / 一時停止 |
| 矢印キー（↑↓←→） | メニュー移動 |
| Enter | 決定 |

### タッチデバイス

スマートフォンやタブレットでは、画面をタップして操作できます。

---

## 設定項目

ホーム画面の「せってい」から変更できます。

### 表示設定

| 設定 | 選択肢 |
|------|--------|
| 背景テーマ | しろ / クリーム / グレー / ダーク |
| コントラスト | ひくい / ふつう / たかい |
| 文字サイズ | ふつう / 大きい |

### ゲーム設定

| 設定 | 説明 |
|------|------|
| 速度 | ゆっくり / ふつう / はやい |
| ガイド | ON / OFF（ヒント表示の有無） |
| 音 | ON / OFF（デフォルトはOFF） |

設定は自動的にブラウザに保存され、次回アクセス時も維持されます。

---

## GitHub Pagesでの公開手順

このプロジェクトをGitHub Pagesで公開する手順です。

### 1. リポジトリを作成

1. GitHubにログインし、「New repository」をクリック
2. リポジトリ名を入力（例: `eye-training-game`）
3. 「Public」を選択
4. 「Create repository」をクリック

### 2. ファイルをアップロード

方法A: GitHub Web UI

1. 「uploading an existing file」をクリック
2. プロジェクトのすべてのファイルをドラッグ＆ドロップ
3. 「Commit changes」をクリック

方法B: Git コマンド

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ユーザー名/リポジトリ名.git
git push -u origin main
```

### 3. GitHub Pagesを有効化

1. リポジトリの「Settings」タブをクリック
2. 左メニューから「Pages」を選択
3. 「Source」で「Deploy from a branch」を選択
4. Branch で「main」を選択し、フォルダは「/ (root)」を選択
5. 「Save」をクリック

### 4. 公開URLを確認

数分待つと、以下の形式でアクセスできるようになります。

```
https://ユーザー名.github.io/リポジトリ名/
```

---

## ファイル構成

```
if-asdgame/
├── index.html              # メインHTMLファイル
├── styles/
│   └── main.css            # スタイルシート
├── src/
│   ├── main.js             # エントリーポイント
│   ├── engine/             # ゲームエンジン
│   │   ├── index.js        # エンジンエクスポート
│   │   ├── canvas.js       # Canvas管理
│   │   ├── loop.js         # ゲームループ
│   │   ├── input.js        # 入力処理
│   │   ├── state.js        # 状態管理
│   │   ├── storage.js      # ローカルストレージ
│   │   ├── theme.js        # テーマ管理
│   │   ├── audio.js        # 音声管理
│   │   └── utils.js        # ユーティリティ関数
│   ├── games/              # ゲームモジュール
│   │   ├── index.js        # ゲームエクスポート
│   │   ├── gameA_rail.js   # Game A: 視線レール追視
│   │   ├── gameB_readline.js # Game B: 行読みガイド
│   │   └── gameC_predictSaccade.js # Game C: 予告付き視線切り替え
│   └── ui/                 # UI コンポーネント
│       ├── index.js        # UIエクスポート
│       ├── home.js         # ホーム画面
│       ├── settings.js     # 設定画面
│       ├── help.js         # ヘルプ画面
│       ├── result.js       # 結果画面
│       └── hud.js          # ヘッドアップディスプレイ
└── docs/                   # ドキュメント
    └── agents/             # 開発エージェント仕様書
```

---

## 技術スタック

- **HTML5** / **CSS3** / **JavaScript (ES Modules)**
- **Canvas API** - ゲーム描画
- **localStorage** - 設定・スコアの保存
- 外部ライブラリ不使用（依存関係なし）

### 対応ブラウザ

- Chrome / Edge（推奨）
- Firefox
- Safari

### 必要環境

- ES Modules対応ブラウザ
- JavaScript有効

---

## ライセンス

MIT License

```
Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 開発者向け: 手動テスト手順

### ローカル実行

ES Modulesを使用しているため、ローカルサーバーが必要です。

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .
```

ブラウザで `http://localhost:8080` にアクセスします。

### 動作確認チェックリスト

#### 共通項目

- [ ] ホーム画面が正常に表示される
- [ ] 「せってい」画面で各設定が変更できる
- [ ] 設定がブラウザ再起動後も保持されている
- [ ] 「あそびかた」画面が表示される
- [ ] 各テーマ（しろ/クリーム/グレー/ダーク）が正しく適用される
- [ ] Escキーでホームに戻れる

#### Game A: レールついし

- [ ] ゲームが開始できる
- [ ] 点がレールに沿って滑らかに移動する
- [ ] 直線 / S字 / 円の各レールが正しく描画される
- [ ] Space / クリック / タップで中間地点判定が動作する
- [ ] スコアと残り時間が表示される
- [ ] 時間切れでゲームが終了し、結果画面が表示される
- [ ] 一時停止が機能する

#### Game B: ぎょうよみ

- [ ] ターゲット（図形）が3〜5行に配置される
- [ ] 現在の行がハイライトされる（ガイドON時）
- [ ] 正しい順番（左→右）でタップすると正解になる
- [ ] 間違えると優しいメッセージが表示される
- [ ] 正しいターゲットにヒントが表示される
- [ ] 全ターゲット完了で結果画面が表示される

#### Game C: よそくジャンプ

- [ ] 予告（薄い円）が表示される
- [ ] 0.5秒後に本表示（濃い円）になる
- [ ] 本表示中にタップ/Spaceで「いいね！」が表示される
- [ ] タイムアップ時も否定的でないメッセージが表示される
- [ ] 全ラウンド終了で結果画面が表示される
- [ ] 横/縦/中央挟みのパターンが正しく動作する

#### 結果画面

- [ ] スコア・正解数が正しく表示される
- [ ] 「もういちど」でゲームをリトライできる
- [ ] 「ホームにもどる」でホーム画面に戻れる
- [ ] Rキーでリトライできる

#### アクセシビリティ

- [ ] キーボードのみで全操作が可能
- [ ] 文字サイズ「大きい」で読みやすくなる
- [ ] 低コントラスト設定が適用される
- [ ] 点滅やフラッシュが発生しない

---

## お問い合わせ

バグ報告や機能要望は、GitHubのIssueでお知らせください。
