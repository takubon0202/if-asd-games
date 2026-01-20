# Scripts ディレクトリ

開発補助スクリプトが含まれています。

## 概要

| スクリプト | AI | サブスク | モデル |
|-----------|-----|---------|--------|
| (Claude Code) | Anthropic | Max ($200/月) | Claude Opus 4.5 |
| codex-helper.js | OpenAI | Plus ($20/月) | GPT-5.2 Codex |
| gemini-helper.js | Google | AI Pro | Gemini 3 Pro Preview |

**APIキーや追加課金は不要です。**

---

## codex-helper.js

OpenAI **Codex CLI** と連携するヘルパースクリプトです。

### 使用方法

```bash
# ヘルパースクリプト経由
node scripts/codex-helper.js "タスク内容"
node scripts/codex-helper.js --error "エラーメッセージ"
node scripts/codex-helper.js --file src/games/gameA_rail.js "最適化"
node scripts/codex-helper.js --interactive  # 対話モード

# 直接Codex CLIを使用
codex "タスク内容"
codex  # 対話モード
```

### セットアップ

```bash
npm install -g @openai/codex
codex --login  # ChatGPT Plusでログイン
```

---

## gemini-helper.js

Google **Gemini CLI** と連携するヘルパースクリプトです。

### 使用方法

```bash
# ヘルパースクリプト経由（デフォルト: gemini-3-pro-preview）
node scripts/gemini-helper.js "タスク内容"
node scripts/gemini-helper.js --error "エラーメッセージ"
node scripts/gemini-helper.js --file src/games/gameA_rail.js "最適化"
node scripts/gemini-helper.js --interactive  # 対話モード
node scripts/gemini-helper.js --yolo "タスク"  # 自動承認モード

# 直接Gemini CLIを使用
gemini "タスク内容"
gemini -m gemini-3-pro-preview "タスク内容"  # 最新モデル
gemini -m gemini-3-flash-preview "タスク内容"  # 高速モデル
gemini -y "タスク"  # YOLO（自動承認）モード
gemini  # 対話モード
```

### 利用可能なモデル

| モデル | 説明 |
|--------|------|
| `gemini-3-pro-preview` | **最新** - 推論・コーディング特化 |
| `gemini-3-flash-preview` | 高速・低レイテンシ |
| `gemini-2.5-pro` | 安定版Pro |
| `gemini-2.5-flash` | 安定版Flash |

### Agent Skills

```bash
gemini skills list       # スキル一覧
gemini skills enable X   # スキル有効化
gemini skills disable X  # スキル無効化
```

### セットアップ

```bash
npm install -g @google/gemini-cli
gemini  # 初回起動時にGoogleログイン
```

---

## Claude Code スキルとして

```
/codex 複雑なアルゴリズムを実装
/gemini このコードをレビューして
```

---

## 3つのAI CLI環境

| 項目 | Claude Code | Codex CLI | Gemini CLI |
|------|-------------|-----------|------------|
| 提供元 | Anthropic | OpenAI | Google |
| サブスク | Max ($200/月) | Plus ($20/月) | AI Pro |
| モデル | Claude Opus 4.5 | GPT-5.2 Codex | Gemini 3 Pro Preview |
| 得意分野 | 複雑な推論・長文 | コード生成・補完 | マルチモーダル・推論 |
| Agent Skills | ✓ | ✓ | ✓ |
| 1Mトークン | - | - | ✓ |

### 使い分けガイド

| ユースケース | 推奨 |
|-------------|------|
| メイン開発・リファクタリング | Claude Code |
| コード補完・第2意見 | Codex CLI |
| マルチモーダル・別視点 | Gemini CLI |
| エラー解決 | 3つ全て試す |

---

## 参考リンク

- [Gemini Models](https://ai.google.dev/gemini-api/docs/models)
- [Gemini CLI GitHub](https://github.com/google-gemini/gemini-cli)
- [OpenAI Codex](https://openai.com/codex)
