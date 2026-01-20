# Codex CLI連携スキル

OpenAI Codex CLIを使用してコード生成・エラー解決を行います。
**ChatGPT Plusサブスクリプション**に含まれており、追加費用なしで利用できます。

（Claude CodeがMaxサブスクで動くのと同じ仕組みです）

## 使用方法

```
/codex タスク内容
```

## 実行されるコマンド

$ARGUMENTS を受け取り、Codex CLIを**非対話モード**で実行します：

```bash
codex exec "$ARGUMENTS"
```

> **非対話モード（`codex exec`）を使用する理由:**
> - Claude Codeからの自動呼び出しに最適（対話入力が不要）
> - 結果を出力して終了するので、バックグラウンド実行に適している
> - 入力待ちでハングアップしない

## コマンド例

```bash
# 非対話モード（推奨 - Claude Code連携用）
codex exec "配列をシャッフルする関数を作成"
codex exec "このエラーを修正: TypeError: Cannot read property 'x'"

# ヘルパースクリプト経由（非対話モード）
node scripts/codex-helper.js "タスク内容"
node scripts/codex-helper.js --error "エラーメッセージ"
node scripts/codex-helper.js --file src/games/gameA_rail.js "最適化"

# 対話モード（手動実行時のみ）
codex
```

## 自動発動条件

このスキルは以下の状況で提案されます：

- 同じエラーが3回以上発生
- 「複雑なアルゴリズム」「最適化」「リファクタリング」キーワード
- 「Codexで」「GPTで」と明示的に依頼
- Claude単体では解決困難なタスク

## セットアップ（初回のみ）

```bash
# インストール
npm install -g @openai/codex

# ChatGPT Plusアカウントでログイン
codex --login
```

## 必要なもの

- **ChatGPT Plus** サブスクリプション（$20/月）
- Node.js

APIキーや追加課金は不要です。
