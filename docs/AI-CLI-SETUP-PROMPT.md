# AI CLI統合セットアッププロンプト

以下のプロンプトをClaude Codeに投げることで、新しいワークスペースにCodex CLI / Gemini CLI統合をセットアップできます。

---

## 基本プロンプト

```
このワークスペースに以下のAI CLI統合をセットアップしてください：

1. **OpenAI Codex CLI** (/codex スキル)
   - ChatGPT Plus サブスクリプションで使用
   - モデル: gpt-5.2-codex

2. **Google Gemini CLI** (/gemini スキル)
   - Gemini AI Pro サブスクリプションで使用
   - モデル優先順位:
     - gemini-3-pro-preview（推奨・デフォルト）
     - gemini-3-flash-preview（高速処理用）
     - gemini-2.5-pro（フォールバック）
     - gemini-2.5-flash（フォールバック）

必要なファイル:
- .claude/settings.json（統合設定）
- .claude/commands/codex.md（/codex スキル定義）
- .claude/commands/gemini.md（/gemini スキル定義）
- scripts/codex-helper.js（Codexヘルパースクリプト）
- scripts/gemini-helper.js（Geminiヘルパースクリプト + フォールバック対応）
- CODEX.md（Codex用プロジェクト情報）
- GEMINI.md（Gemini用プロジェクト情報）

プロジェクト情報:
- 種類: {{PROJECT_TYPE}}
- 説明: {{PROJECT_DESCRIPTION}}
- 言語: {{LANGUAGE}}
- フレームワーク: {{FRAMEWORK}}

設定後、全てのCLIの動作確認も行ってください。
```

---

## プロジェクト別プロンプト例

### Webアプリ（React）

```
このReactプロジェクトにAI CLI統合をセットアップしてください：

1. OpenAI Codex CLI (/codex スキル) - ChatGPT Plus使用
2. Google Gemini CLI (/gemini スキル) - Gemini AI Pro使用
   - Gemini 3系を優先、2.5はフォールバックのみ

プロジェクト情報:
- 種類: web-app
- 説明: Reactベースのダッシュボードアプリ
- 言語: TypeScript
- フレームワーク: React + Vite

必要なファイル全て作成し、動作確認まで行ってください。
Geminiカスタムスキルとして「react-helper」も作成してください。
```

### Python API

```
このPython APIプロジェクトにAI CLI統合をセットアップしてください：

1. OpenAI Codex CLI (/codex スキル) - ChatGPT Plus使用
2. Google Gemini CLI (/gemini スキル) - Gemini AI Pro使用
   - Gemini 3系を優先、2.5はフォールバックのみ

プロジェクト情報:
- 種類: api-server
- 説明: FastAPIベースのREST API
- 言語: Python 3.11
- フレームワーク: FastAPI + SQLAlchemy

コーディング規約:
- PEP8準拠
- 型ヒント必須
- docstring必須

必要なファイル全て作成し、動作確認まで行ってください。
```

### CLI ツール（Go）

```
このGo CLIツールプロジェクトにAI CLI統合をセットアップしてください：

1. OpenAI Codex CLI (/codex スキル) - ChatGPT Plus使用
2. Google Gemini CLI (/gemini スキル) - Gemini AI Pro使用
   - Gemini 3系を優先、2.5はフォールバックのみ

プロジェクト情報:
- 種類: cli-tool
- 説明: ファイル管理CLIツール
- 言語: Go 1.21
- フレームワーク: Cobra

コーディング規約:
- gofmt必須
- golint準拠
- テストカバレッジ80%以上

必要なファイル全て作成し、動作確認まで行ってください。
```

---

## 追加カスタマイズプロンプト

### Geminiカスタムスキル追加

```
Gemini CLIに以下のカスタムスキルを追加してください：

スキル名: {{SKILL_NAME}}
説明: {{SKILL_DESCRIPTION}}
機能:
1. {{FUNCTION_1}}
2. {{FUNCTION_2}}

.gemini/skills/{{SKILL_NAME}}/SKILL.md を作成してください。
```

### 自動発動キーワード追加

```
AI CLI設定に以下の自動発動キーワードを追加してください：

Codex: 「{{KEYWORD_1}}」「{{KEYWORD_2}}」
Gemini: 「{{KEYWORD_3}}」「{{KEYWORD_4}}」

.claude/settings.json を更新してください。
```

### モデル変更

```
Gemini CLIのデフォルトモデルを以下に変更してください：

現在: gemini-3-pro-preview
変更後: gemini-3-flash-preview（高速処理優先）

関連ファイルを全て更新してください。
```

---

## 動作確認プロンプト

```
以下のAI CLIの動作確認を行ってください：

1. Codex CLI（非対話モード）
   - codex --version
   - codex exec "1+1は？"

2. Gemini CLI
   - gemini --version
   - gemini -m gemini-3-pro-preview "1+1は？"
   - gemini -m gemini-3-flash-preview "1+1は？"
   - gemini skills list

3. ヘルパースクリプト
   - node scripts/codex-helper.js --help
   - node scripts/gemini-helper.js --help

結果をまとめて報告してください。
```

---

## トラブルシューティングプロンプト

```
{{CLI_NAME}} CLI でエラーが発生しています：

エラーメッセージ:
{{ERROR_MESSAGE}}

原因を調査し、解決策を提示してください。
必要であれば設定ファイルを修正してください。
```

---

## 一括セットアップスクリプト

以下のスクリプトを実行すると、基本的なセットアップが自動化されます：

```bash
#!/bin/bash
# AI CLI統合セットアップスクリプト

# ディレクトリ作成
mkdir -p .claude/commands
mkdir -p .gemini/skills
mkdir -p scripts
mkdir -p docs

# CLI インストール確認
echo "=== CLI インストール確認 ==="
codex --version || echo "Codex CLI未インストール: npm install -g @openai/codex"
gemini --version || echo "Gemini CLI未インストール: npm install -g @google/gemini-cli"

echo ""
echo "=== セットアップ完了 ==="
echo "Claude Codeに上記プロンプトを投げて設定ファイルを作成してください"
```

---

## 自動承認モード設定

デフォルトで自動承認モード（確認なしで実行）を有効にします：

### Codex CLI

```bash
# ~/.codex/config.toml
model = "gpt-5.2-codex"
approval_policy = "never"
```

### Gemini CLI

```bash
# ~/.gemini/settings.json
{
  "approvalMode": "yolo",
  "yolo": true
}

# または、gemini-helper.js の CONFIG を編集
const CONFIG = {
  model: MODELS.PRO,
  yolo: true  // デフォルトで自動承認
};
```

### 使用例

```bash
# Codex（非対話モード - Claude Code連携用）
codex exec "タスク内容"

# Gemini（ヘルパー経由で自動承認）
node scripts/gemini-helper.js "タスク内容"

# Gemini（直接コマンドで明示的にyolo）
gemini --yolo "タスク内容"
```

> **注意**: Codex CLIは `codex exec` コマンドで非対話モードを使用します。
> 通常の `codex "..."` は対話モードとなり、入力待ちが発生するためClaude Code連携には適しません。

---

## ⚠️ 使用量上限に関する重要な注意

**サブスクリプションの使用量上限に達した場合の対応:**

1. **上限検知時**: CodexまたはGeminiが使用量上限に達した場合、即座にユーザーに通知
2. **使用停止**: 制限が回復するまで該当CLIの使用を停止
3. **理由**: 上限を超えて使用すると追加課金が発生する可能性があるため

### 上限エラーの例

```
# Codex
Rate limit exceeded. Please try again later.

# Gemini
Quota exceeded for the day. Please wait until tomorrow.
```

### Claude Code への指示

```
CodexやGeminiを使用する際、以下のルールを守ってください：

1. 使用量上限エラーが発生した場合、すぐに「上限に達しました」と報告
2. 制限が回復するまで該当CLIは使用しない
3. 代替として、上限に達していない別のCLIを提案
4. これは追加課金を防ぐための重要なルールです
```

---

## まとめ

| 項目 | Claude Code | Codex CLI | Gemini CLI |
|------|-------------|-----------|------------|
| 提供元 | Anthropic | OpenAI | Google |
| サブスク | Max ($200/月) | Plus ($20/月) | AI Pro ($19.99/月) |
| モデル | Claude Opus 4.5 | GPT-5.2 Codex | Gemini 3 Pro Preview |
| スキル | /codex, /gemini | codex コマンド | gemini コマンド |
| 得意分野 | 複雑な推論 | コード生成 | マルチモーダル |
| 自動承認 | - | approval: never | yolo: true |

**合計コスト: 約$240/月（全てAPIキー不要）**

### Gemini CLIモデル優先順位

| 優先度 | モデル | 用途 |
|--------|--------|------|
| 1 | `gemini-3-pro-preview` | 推奨・デフォルト |
| 2 | `gemini-3-flash-preview` | 高速処理用 |
| 3 | `gemini-2.5-pro` | フォールバック（エラー時のみ） |
| 4 | `gemini-2.5-flash` | フォールバック（エラー時のみ） |

> **注意**: 2.5系は通常使用しません。Gemini 3系でエラーが発生した場合のみフォールバックとして使用されます。
