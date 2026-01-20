# Codex CLI連携スキル

OpenAI Codex CLIを使用してコード生成・エラー解決を行います。
**ChatGPT Plusサブスクリプション**に含まれており、追加費用なしで利用できます。

（Claude CodeがMaxサブスクで動くのと同じ仕組みです）

## 使用方法

```
/codex タスク内容
```

## 実行されるコマンド

$ARGUMENTS を受け取り、Codex CLIを実行します：

```bash
codex "$ARGUMENTS"
```

## コマンド例

```bash
# 一般的なタスク
codex "配列をシャッフルする関数を作成"

# エラー解決
node scripts/codex-helper.js --error "TypeError: Cannot read property 'x'"

# ファイル修正
node scripts/codex-helper.js --file src/games/gameA_rail.js "最適化"

# 対話モード
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
