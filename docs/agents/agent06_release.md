# Agent 06: Release - リリース準備仕様書

## 1. 目的

README整備、GitHub Pages設定、最終動作確認を行い、プロジェクトを公開可能な状態にする。

### 基本方針
- **分かりやすさ**: 誰でも理解できるREADME
- **再現性**: 手順通りに進めればデプロイできる
- **安全性**: 注意事項を明確に記載
- **持続性**: メンテナンス情報を含める

---

## 2. やること（チェックリスト）

### 2.1 README作成

#### 必須セクション
- [ ] **プロジェクト概要**
  - [ ] アプリ名と説明
  - [ ] 対象ユーザー
  - [ ] 主な機能
- [ ] **注意事項**
  - [ ] 利用上の注意（光過敏、音声など）
  - [ ] 対象年齢
  - [ ] 免責事項
- [ ] **操作方法**
  - [ ] 基本操作（タッチ/クリック）
  - [ ] キーボードショートカット
  - [ ] 設定の変更方法
- [ ] **デプロイ手順**
  - [ ] ローカルでの実行方法
  - [ ] GitHub Pagesへのデプロイ
- [ ] **開発者向け情報**
  - [ ] ファイル構成
  - [ ] 技術スタック
  - [ ] コントリビューション方法

#### READMEテンプレート

```markdown
# めのうんどう

ASD（自閉スペクトラム症）およびLD（学習障害）を持つ子どもたちのための「目の動き」トレーニングWebアプリケーションです。

## 特徴

- 視覚的に穏やかな設計（刺激を抑えた配色・アニメーション）
- キーボード操作に完全対応
- 設定のカスタマイズ（背景色、文字サイズ、音量など）
- ビルドツール不要で動作

## 注意事項

### 利用前にお読みください

- このアプリは**光や動きに敏感な方**への配慮を行っていますが、
  体調に不安がある場合は使用を控えてください
- **音声が出ます**。設定画面で音量の調整やオフが可能です
- 長時間の連続使用は避け、適度に休憩を取ってください
- **てんかんの既往歴がある方**は、医師に相談の上ご使用ください

### 対象年齢

小学生以上を想定しています。小さなお子様が使用する場合は、保護者の方と一緒にご使用ください。

### 免責事項

このアプリケーションは教育・トレーニング目的で作成されていますが、医療行為の代替ではありません。効果には個人差があります。

## デモ

[GitHub Pages](https://username.github.io/if-asdgame/)

## 操作方法

### 基本操作

| 操作 | 方法 |
|------|------|
| 選択・決定 | タッチ / クリック / Enter / Space |
| ホームに戻る | Escapeキー |
| 次の要素へ | Tabキー |
| 前の要素へ | Shift + Tab |

### キーボードショートカット

| キー | 動作 |
|------|------|
| Tab | 次の要素にフォーカス |
| Shift + Tab | 前の要素にフォーカス |
| Enter / Space | 選択・決定 |
| Escape | ホームへ戻る |
| R | リトライ（結果画面） |

## ローカルで実行

ビルドツールは不要です。

### 方法1: 直接開く

1. リポジトリをクローン
   ```bash
   git clone https://github.com/username/if-asdgame.git
   ```

2. `index.html` をブラウザで開く

### 方法2: ローカルサーバー

```bash
# Pythonの場合
cd if-asdgame
python -m http.server 8000

# Node.jsの場合（npxが使える環境）
npx serve
```

ブラウザで http://localhost:8000 を開く

## GitHub Pagesでデプロイ

1. GitHubでリポジトリを作成
2. コードをプッシュ
3. Settings → Pages → Source で「main」ブランチを選択
4. 数分後に https://username.github.io/repository-name/ でアクセス可能

詳細は[デプロイガイド](#デプロイ詳細手順)を参照してください。

## ファイル構成

```
/
├── index.html              # エントリーポイント
├── styles/
│   └── main.css            # スタイルシート
├── src/
│   ├── main.js             # アプリケーション初期化
│   ├── engine/             # 共通エンジン
│   ├── games/              # ゲーム実装
│   └── ui/                 # UI実装
├── assets/                 # 静的リソース
└── docs/                   # ドキュメント
```

## 技術スタック

- HTML5 / CSS3 / ES2020+ JavaScript
- Canvas API（ゲーム描画）
- Web Audio API（効果音）
- localStorage（設定保存）

外部ライブラリは使用していません。

## ブラウザ対応

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## ライセンス

MIT License - 詳細は [LICENSE](LICENSE) を参照してください。

## コントリビューション

Issue、Pull Requestを歓迎します。

### 開発時の注意

- アクセシビリティ（特に光過敏への配慮）を最優先してください
- 新機能追加時は `docs/agents/` の仕様書を参照してください

## 作者

[Your Name]

## 謝辞

このプロジェクトは、ASD/LDを持つ子どもたちの支援を目的として開発されました。
```

### 2.2 ライセンス設定

#### MITライセンスファイル作成
- [ ] LICENSEファイルの作成
- [ ] 年号と著作者名の記入

#### LICENSEテンプレート

```
MIT License

Copyright (c) 2026 [Your Name]

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

### 2.3 GitHub Pages設定手順

#### 設定手順
- [ ] GitHubリポジトリの作成
- [ ] コードのプッシュ
- [ ] GitHub Pages有効化
- [ ] 動作確認

#### 詳細手順書

```markdown
## GitHub Pagesデプロイ詳細手順

### 1. リポジトリの準備

1. GitHubにログイン
2. 「New repository」をクリック
3. リポジトリ名を入力（例: `if-asdgame`）
4. 「Public」を選択
5. 「Create repository」をクリック

### 2. コードのプッシュ

```bash
# ローカルリポジトリの初期化（まだの場合）
git init

# リモートリポジトリの追加
git remote add origin https://github.com/username/if-asdgame.git

# ファイルの追加とコミット
git add .
git commit -m "Initial commit"

# プッシュ
git push -u origin main
```

### 3. GitHub Pagesの有効化

1. リポジトリページで「Settings」タブをクリック
2. 左メニューから「Pages」を選択
3. 「Source」セクションで:
   - Branch: `main`
   - Folder: `/ (root)`
4. 「Save」をクリック

### 4. 公開URLの確認

- 数分後に「Your site is published at ...」と表示される
- URL: `https://username.github.io/if-asdgame/`

### 5. 動作確認

1. 公開URLにアクセス
2. Home画面が表示されることを確認
3. 各ゲームが動作することを確認
4. 設定が保存されることを確認

### トラブルシューティング

#### 404エラーが出る場合
- index.htmlがリポジトリのルートにあることを確認
- GitHub Pagesの設定が正しいか確認
- 数分待ってから再度アクセス

#### CSSやJSが読み込まれない場合
- パスが相対パスになっているか確認
- 大文字小文字が正しいか確認
```

### 2.4 最終動作確認

#### デプロイ後チェックリスト
- [ ] URLにアクセスできる
- [ ] Home画面が表示される
- [ ] 各ゲームが開始・終了できる
- [ ] 設定が保存・復元される
- [ ] モバイルブラウザで動作する
- [ ] キーボード操作ができる
- [ ] コンソールにエラーがない

---

## 3. 成果物

### ファイル一覧
| ファイル | 内容 |
|---------|------|
| `README.md` | プロジェクト説明、使い方、デプロイ手順 |
| `LICENSE` | MITライセンス |

### 確認資料
| 資料 | 内容 |
|------|------|
| デプロイ確認チェックリスト | 公開後の動作確認結果 |
| 公開URL | GitHub PagesのURL |

---

## 4. 完了条件

### 4.1 README

| 項目 | 条件 |
|------|------|
| 概要 | プロジェクトの目的と対象が明確 |
| 注意事項 | 光過敏・音声に関する注意が記載 |
| 操作方法 | 基本操作とキーボード操作が記載 |
| デプロイ手順 | 手順通りにデプロイできる |
| ライセンス | MIT Licenseが明記 |

### 4.2 ライセンス

| 項目 | 条件 |
|------|------|
| ファイル | LICENSEファイルが存在 |
| 内容 | MIT License全文が記載 |
| 著作者 | 年号と著作者名が正しい |

### 4.3 GitHub Pages

| 項目 | 条件 |
|------|------|
| 有効化 | GitHub Pagesが有効になっている |
| アクセス | 公開URLでアクセスできる |
| 表示 | Home画面が正しく表示される |
| 機能 | 全機能が動作する |

### 4.4 最終動作確認

| 項目 | 条件 |
|------|------|
| PC Chrome | 全機能動作確認済み |
| PC Firefox | 全機能動作確認済み |
| PC Safari | 全機能動作確認済み |
| モバイル | タッチ操作で動作確認済み |
| エラー | コンソールエラーなし |

---

## 5. NG（禁止事項）

### 5.1 READMEに関するNG

| 禁止事項 | 理由 | 対応 |
|---------|------|------|
| 注意事項の省略 | 安全性の問題 | 必ず光過敏・音声の注意を記載 |
| 曖昧な手順 | 再現不能 | 具体的なコマンドを記載 |
| 古い情報 | 混乱の原因 | 最新状態に更新 |
| 専門用語の多用 | 理解困難 | 平易な表現に |

### 5.2 ライセンスに関するNG

| 禁止事項 | 理由 | 対応 |
|---------|------|------|
| ライセンス未記載 | 法的問題 | 必ずLICENSEファイルを作成 |
| 曖昧なライセンス | 利用者の混乱 | MIT等明確なライセンスを選択 |
| 著作者情報の省略 | 権利の曖昧さ | 必ず著作者名を記載 |

### 5.3 デプロイに関するNG

| 禁止事項 | 理由 | 対応 |
|---------|------|------|
| 動作未確認でのリリース | 品質問題 | 必ず動作確認を実施 |
| エラー放置でのリリース | ユーザー体験低下 | エラー修正後にリリース |
| 手順未検証の公開 | 再現不能 | 手順を実際に試す |

### 5.4 公開に関するNG

| 禁止事項 | 理由 | 対応 |
|---------|------|------|
| 個人情報の含有 | プライバシー問題 | 公開前に確認 |
| APIキーの公開 | セキュリティ問題 | 環境変数等で管理 |
| 未完成機能の公開 | 混乱の原因 | 完成後に公開 |

---

## 6. リリースチェックリスト

### 6.1 公開前チェック

- [ ] README.mdが作成されている
- [ ] LICENSEファイルが作成されている
- [ ] すべてのファイルがコミットされている
- [ ] コンソールにエラーがない
- [ ] 全機能の動作確認が完了
- [ ] アクセシビリティ確認が完了

### 6.2 デプロイ時チェック

- [ ] mainブランチにプッシュ完了
- [ ] GitHub Pages設定完了
- [ ] 公開URLでアクセス可能

### 6.3 公開後チェック

- [ ] 公開URLで全機能が動作
- [ ] モバイルブラウザで動作確認
- [ ] README内のリンクが有効
- [ ] スクリーンショット（あれば）が表示される

---

## 7. メンテナンス情報

### 7.1 更新時の手順

```markdown
## 更新手順

1. ローカルで変更を実施
2. 動作確認を実施
3. git add / commit / push
4. GitHub Pagesが自動更新（数分）
5. 公開サイトで動作確認
```

### 7.2 バージョン管理

```markdown
## バージョン命名規則

- v1.0.0: 初回リリース
- v1.0.x: バグ修正
- v1.x.0: 機能追加
- v2.0.0: 大規模変更
```

### 7.3 問い合わせ対応

```markdown
## Issue対応

1. Issueの内容を確認
2. 再現手順で再現を試みる
3. 修正または回答
4. Issueをクローズ
```

---

*このドキュメントはAgent 06: Releaseによって作成されました*
*最終更新: 2026-01-16*
