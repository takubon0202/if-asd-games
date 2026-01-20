# AI CLI統合セットアップテンプレート

このドキュメントは、任意のワークスペースで **Claude Code**, **OpenAI Codex CLI**, **Google Gemini CLI** の3つのAI CLIを統合するための設計図です。

---

## 概要

### アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                      ワークスペース                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Claude Code │  │  Codex CLI  │  │ Gemini CLI  │         │
│  │  (メイン)   │  │  (補助)     │  │  (補助)     │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         ▼                ▼                ▼                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              統合設定 (.claude/settings.json)        │   │
│  └─────────────────────────────────────────────────────┘   │
│         │                │                │                 │
│         ▼                ▼                ▼                 │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐          │
│  │ /codex    │    │ /gemini   │    │  scripts/ │          │
│  │  スキル   │    │  スキル   │    │ ヘルパー  │          │
│  └───────────┘    └───────────┘    └───────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### サブスクリプション構成

| AI | プロバイダー | サブスク | 月額 | モデル |
|----|-------------|---------|------|--------|
| Claude Code | Anthropic | Max | $200 | Claude Opus 4.5 |
| Codex CLI | OpenAI | Plus | $20 | GPT-5.2 Codex |
| Gemini CLI | Google | AI Pro | $19.99 | Gemini 3 Pro Preview |

**合計: 約$240/月（APIキー不要）**

### Gemini CLIモデル優先順位

| 優先度 | モデル | 用途 |
|--------|--------|------|
| 1 | `gemini-3-pro-preview` | **推奨・デフォルト** - 複雑なタスク、設計、分析 |
| 2 | `gemini-3-flash-preview` | **高速処理用** - 単純なタスク、素早い回答 |
| 3 | `gemini-2.5-pro` | フォールバック（Gemini 3 Proがエラー時のみ） |
| 4 | `gemini-2.5-flash` | フォールバック（Gemini 3 Flashがエラー時のみ） |

> **注意**: 2.5系は通常使用しません。Gemini 3系でエラーが発生した場合のみフォールバックとして自動使用されます。

### 自動承認モード

| CLI | 設定ファイル | 設定値 |
|-----|-------------|--------|
| Codex | `~/.codex/config.toml` | `approval_policy = "never"` |
| Gemini | `~/.gemini/settings.json` | `"yolo": true` |

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

### Claude Code への必須指示

```
CodexやGeminiを使用する際、以下のルールを必ず守ってください：

1. 使用量上限エラーが発生した場合、すぐに「上限に達しました」と報告
2. 制限が回復するまで該当CLIは使用しない
3. 代替として、上限に達していない別のCLIを提案
4. これは追加課金を防ぐための重要なルールです
```

---

## ディレクトリ構造

```
your-workspace/
├── .claude/
│   ├── commands/
│   │   ├── codex.md          # /codex スキル定義
│   │   └── gemini.md         # /gemini スキル定義
│   └── settings.json         # 統合設定
├── .gemini/
│   └── skills/
│       └── your-skill/
│           └── SKILL.md      # Geminiカスタムスキル
├── scripts/
│   ├── codex-helper.js       # Codex CLIヘルパー
│   ├── gemini-helper.js      # Gemini CLIヘルパー（フォールバック対応）
│   └── README.md             # 使用方法
├── CODEX.md                  # Codex用プロジェクト情報
└── GEMINI.md                 # Gemini用プロジェクト情報
```

---

## 設定ファイルテンプレート

### .claude/settings.json

```json
{
  "claude": {
    "plan": "Max",
    "price": "$200/月",
    "model": "claude-opus-4-5"
  },
  "codex": {
    "enabled": true,
    "method": "codex-cli",
    "command": "codex",
    "model": "gpt-5.2-codex",
    "subscription": "ChatGPT Plus ($20/月)",
    "approvalPolicy": "never",
    "autoInvoke": {
      "onRepeatedError": 3,
      "keywords": ["Codexで", "GPTで", "OpenAIで"]
    }
  },
  "gemini": {
    "enabled": true,
    "method": "gemini-cli",
    "command": "gemini",
    "model": "gemini-3-pro-preview",
    "subscription": "Gemini AI Pro ($19.99/月)",
    "yolo": true,
    "autoInvoke": {
      "keywords": ["Geminiで", "Googleで"]
    },
    "skills": {
      "enabled": true,
      "directory": ".gemini/skills"
    },
    "models": {
      "primary": {
        "pro": "gemini-3-pro-preview",
        "flash": "gemini-3-flash-preview"
      },
      "fallback": {
        "pro": "gemini-2.5-pro",
        "flash": "gemini-2.5-flash"
      }
    }
  },
  "projectContext": {
    "type": "{{PROJECT_TYPE}}",
    "description": "{{PROJECT_DESCRIPTION}}",
    "language": "{{LANGUAGE}}",
    "framework": "{{FRAMEWORK}}",
    "contextFiles": ["CODEX.md", "GEMINI.md"]
  },
  "autoSwitch": {
    "onError": "suggest-alternatives",
    "alternatives": ["claude", "codex", "gemini"]
  }
}
```

**置換変数:**
- `{{PROJECT_TYPE}}`: プロジェクトの種類（web-app, cli-tool, library等）
- `{{PROJECT_DESCRIPTION}}`: 簡潔な説明
- `{{LANGUAGE}}`: 主要言語（JavaScript, Python, Go等）
- `{{FRAMEWORK}}`: フレームワーク（React, Django, none等）

---

## スキル定義テンプレート

### .claude/commands/codex.md

```markdown
# Codex CLI連携スキル

OpenAI Codex CLIを使用してコード生成・エラー解決を行います。
**ChatGPT Plusサブスクリプション**に含まれており、追加費用なしで利用できます。

## 使用方法

\`\`\`
/codex タスク内容
\`\`\`

## 実行されるコマンド

$ARGUMENTS を受け取り、Codex CLIを実行します：

\`\`\`bash
codex "$ARGUMENTS"
\`\`\`

## コマンド例

\`\`\`bash
# 一般的なタスク
codex "配列をシャッフルする関数を作成"

# 対話モード
codex

# ヘルパースクリプト
node scripts/codex-helper.js --error "エラーメッセージ"
node scripts/codex-helper.js --file path/to/file.js "修正内容"
\`\`\`

## 自動発動条件

- 同じエラーが3回以上発生
- 「Codexで」「GPTで」と明示的に依頼
- Claude単体では解決困難なタスク

## セットアップ

\`\`\`bash
npm install -g @openai/codex
codex --login
\`\`\`

## 必要なもの

- **ChatGPT Plus** ($20/月)
- Node.js
```

### .claude/commands/gemini.md

```markdown
# Gemini CLI連携スキル

Google Gemini CLIを使用してコード生成・エラー解決を行います。
**Gemini AI Pro サブスクリプション**に含まれており、追加費用なしで利用できます。

## 使用方法

\`\`\`
/gemini タスク内容
\`\`\`

## 実行されるコマンド

$ARGUMENTS を受け取り、Gemini CLIを実行します：

\`\`\`bash
gemini -m gemini-3-pro-preview "$ARGUMENTS"
\`\`\`

## 利用可能なモデル

### メイン（常にこちらを使用）

| モデル | 説明 | 用途 |
|--------|------|------|
| \`gemini-3-pro-preview\` | **推奨** - 最高品質の推論・コーディング | 複雑なタスク、設計、分析 |
| \`gemini-3-flash-preview\` | **高速** - 低レイテンシ | 単純なタスク、素早い回答 |

### フォールバック（エラー時のみ）

| モデル | 説明 |
|--------|------|
| \`gemini-2.5-pro\` | Gemini 3がエラーの場合のみ使用 |
| \`gemini-2.5-flash\` | Gemini 3 Flashがエラーの場合のみ使用 |

> **注意**: 2.5系は通常使用しません。Gemini 3系でエラーが発生した場合のみフォールバックとして使用してください。

## コマンド例

\`\`\`bash
# 推奨：Gemini 3 Pro（デフォルト）
gemini "タスク内容"
gemini -m gemini-3-pro-preview "複雑なアルゴリズムを実装"

# 高速処理：Gemini 3 Flash
gemini -m gemini-3-flash-preview "簡単な質問に答えて"

# 自動承認モード（YOLO）
gemini -y "ファイルを修正して"
gemini --yolo "テストを実行"

# 対話モード
gemini
\`\`\`

## フォールバック使用例（エラー時のみ）

\`\`\`bash
# Gemini 3 Proがエラーの場合のみ
gemini -m gemini-2.5-pro "タスク内容"

# Gemini 3 Flashがエラーの場合のみ
gemini -m gemini-2.5-flash "タスク内容"
\`\`\`

## Agent Skills

\`\`\`bash
gemini skills list       # スキル一覧
gemini skills enable X   # スキル有効化
gemini skills disable X  # スキル無効化
\`\`\`

## 拡張機能

\`\`\`bash
gemini extensions list        # 拡張機能一覧
gemini extensions install X   # インストール
\`\`\`

## セットアップ

\`\`\`bash
npm install -g @google/gemini-cli
gemini  # 初回起動時にGoogleログイン
\`\`\`

## 必要なもの

- **Gemini AI Pro** サブスクリプション ($19.99/月)
- Node.js

OAuth認証のみで利用可能。APIキーは不要です。
```

---

## ヘルパースクリプトテンプレート

### scripts/codex-helper.js

```javascript
#!/usr/bin/env node
/**
 * Codex Helper - OpenAI Codex CLI連携スクリプト
 *
 * 使用方法:
 *   node scripts/codex-helper.js "タスク内容"
 *   node scripts/codex-helper.js --error "エラーメッセージ"
 *   node scripts/codex-helper.js --file path/to/file.js "修正内容"
 *   node scripts/codex-helper.js --interactive
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

// ★ プロジェクト情報をここにカスタマイズ
const PROJECT_CONTEXT = `# プロジェクト情報
{{PROJECT_DESCRIPTION}}

## 技術スタック
- {{LANGUAGE}}
- {{FRAMEWORK}}

## ディレクトリ構成
{{DIRECTORY_STRUCTURE}}

## 要件
- {{CODING_REQUIREMENTS}}`;

function checkCodexInstalled() {
  try {
    execSync('codex --version', { stdio: 'pipe' });
    return true;
  } catch { return false; }
}

function readFile(filePath) {
  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath : path.join(process.cwd(), filePath);
    return fs.readFileSync(absolutePath, 'utf8');
  } catch (e) {
    console.error(`ファイル読み込みエラー: ${filePath}`);
    return null;
  }
}

function generatePrompt(task, mode = 'general', fileInfo = null) {
  let prompt = '';
  switch (mode) {
    case 'error':
      prompt = `以下のエラーを解決してください。原因を分析し、修正コードを提示してください。\n\nエラー:\n${task}`;
      break;
    case 'file':
      prompt = `以下のファイルを修正してください。\n\nファイル: ${fileInfo.name}\nタスク: ${task}\n\n現在のコード:\n\`\`\`\n${fileInfo.content}\n\`\`\``;
      break;
    default:
      prompt = task;
  }
  return prompt;
}

function runCodexInteractive() {
  console.log('Codex CLI を対話モードで起動します...\n');
  const codex = spawn('codex', [], { stdio: 'inherit', shell: true, cwd: process.cwd() });
  codex.on('close', (code) => console.log(`\nCodex CLI 終了 (code: ${code})`));
}

function runCodexWithPrompt(prompt) {
  console.log('Codex CLI を実行中...\n');
  const codex = spawn('codex', [prompt], { stdio: 'inherit', shell: true, cwd: process.cwd() });
  codex.on('close', (code) => {
    if (code !== 0) console.error(`\nCodex CLI がエラーで終了しました (code: ${code})`);
  });
}

function writeProjectContext() {
  const codexMdPath = path.join(process.cwd(), 'CODEX.md');
  if (fs.existsSync(codexMdPath)) return;
  try {
    fs.writeFileSync(codexMdPath, PROJECT_CONTEXT, 'utf8');
    console.log('CODEX.md を作成しました');
  } catch (e) {}
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('Codex Helper - OpenAI Codex CLI連携\n');
    console.log('使用方法:');
    console.log('  node scripts/codex-helper.js "タスク内容"');
    console.log('  node scripts/codex-helper.js --error "エラーメッセージ"');
    console.log('  node scripts/codex-helper.js --file path/to/file.js "修正内容"');
    console.log('  node scripts/codex-helper.js --interactive\n');
    console.log('または直接: codex "タスク内容"');
    process.exit(0);
  }

  if (!checkCodexInstalled()) {
    console.error('エラー: Codex CLIがインストールされていません。');
    console.log('\nインストール: npm install -g @openai/codex');
    console.log('ログイン: codex --login');
    process.exit(1);
  }

  writeProjectContext();

  if (args[0] === '--interactive' || args[0] === '-i') {
    runCodexInteractive();
    return;
  }

  let prompt = '', mode = 'general', fileInfo = null;

  if (args[0] === '--error' || args[0] === '-e') {
    mode = 'error';
    prompt = generatePrompt(args.slice(1).join(' '), mode);
  } else if (args[0] === '--file' || args[0] === '-f') {
    mode = 'file';
    const filePath = args[1];
    const content = readFile(filePath);
    if (!content) process.exit(1);
    fileInfo = { name: path.basename(filePath), content };
    const task = args.slice(2).join(' ') || '改善してください';
    prompt = generatePrompt(task, mode, fileInfo);
  } else {
    prompt = generatePrompt(args.join(' '), mode);
  }

  runCodexWithPrompt(prompt);
}

main();
```

### scripts/gemini-helper.js

```javascript
#!/usr/bin/env node
/**
 * Gemini Helper - Google Gemini CLI連携スクリプト
 *
 * Geminiサブスクリプションに含まれるGemini CLIを使用します。
 * Claude Code / Codex CLIと同じ仕組みです。
 *
 * モデル優先順位:
 *   1. gemini-3-pro-preview（推奨・デフォルト）
 *   2. gemini-3-flash-preview（高速処理用）
 *   3. gemini-2.5-pro（フォールバック）
 *   4. gemini-2.5-flash（フォールバック）
 *
 * 使用方法:
 *   node scripts/gemini-helper.js "タスク内容"
 *   node scripts/gemini-helper.js --fast "簡単な質問"
 *   node scripts/gemini-helper.js --error "エラーメッセージ"
 *   node scripts/gemini-helper.js --file path/to/file.js "修正内容"
 *   node scripts/gemini-helper.js --interactive
 *   node scripts/gemini-helper.js --yolo "タスク"
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

// モデル設定（Gemini 3系を優先）
const MODELS = {
  // メイン（常にこちらを使用）
  PRO: 'gemini-3-pro-preview',      // 推奨・デフォルト
  FLASH: 'gemini-3-flash-preview',  // 高速処理用

  // フォールバック（エラー時のみ）
  PRO_FALLBACK: 'gemini-2.5-pro',
  FLASH_FALLBACK: 'gemini-2.5-flash'
};

// デフォルト設定
const CONFIG = {
  model: MODELS.PRO,  // デフォルトはGemini 3 Pro
  yolo: true  // デフォルトで自動承認モード
};

// ★ プロジェクト情報をここにカスタマイズ
const PROJECT_CONTEXT = `# プロジェクト情報
{{PROJECT_DESCRIPTION}}

## 技術スタック
- {{LANGUAGE}}
- {{FRAMEWORK}}

## ディレクトリ構成
{{DIRECTORY_STRUCTURE}}

## 要件
- {{CODING_REQUIREMENTS}}`;

function checkGeminiInstalled() {
  try {
    execSync('gemini --version', { stdio: 'pipe' });
    return true;
  } catch { return false; }
}

function readFile(filePath) {
  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath : path.join(process.cwd(), filePath);
    return fs.readFileSync(absolutePath, 'utf8');
  } catch (e) {
    console.error(`ファイル読み込みエラー: ${filePath}`);
    return null;
  }
}

function generatePrompt(task, mode = 'general', fileInfo = null) {
  let prompt = '';
  switch (mode) {
    case 'error':
      prompt = `以下のエラーを解決してください。原因を分析し、修正コードを提示してください。\n\nエラー:\n${task}`;
      break;
    case 'file':
      prompt = `以下のファイルを修正してください。\n\nファイル: ${fileInfo.name}\nタスク: ${task}\n\n現在のコード:\n\`\`\`javascript\n${fileInfo.content}\n\`\`\``;
      break;
    default:
      prompt = task;
  }
  return prompt;
}

/**
 * フォールバックモデルを取得
 */
function getFallbackModel(currentModel) {
  if (currentModel === MODELS.PRO) {
    return MODELS.PRO_FALLBACK;
  }
  if (currentModel === MODELS.FLASH) {
    return MODELS.FLASH_FALLBACK;
  }
  return null;
}

function runGeminiInteractive(model) {
  console.log('Gemini CLI を対話モードで起動します...');
  console.log(`モデル: ${model}`);
  console.log('終了するには Ctrl+C または /exit を入力\n');

  const args = ['-m', model];
  const gemini = spawn('gemini', args, {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  gemini.on('close', (code) => {
    console.log(`\nGemini CLI 終了 (code: ${code})`);
  });
}

/**
 * Gemini CLIを実行（プロンプト指定、フォールバック対応）
 */
function runGeminiWithPrompt(prompt, model, yolo = false, isRetry = false) {
  if (!isRetry) {
    console.log('Gemini CLI を実行中...');
  } else {
    console.log('\nフォールバックモデルで再試行...');
  }
  console.log(`モデル: ${model}`);
  if (yolo) console.log('モード: YOLO（自動承認）');
  console.log('');

  const args = ['-m', model];
  if (yolo) args.push('-y');
  args.push(prompt);

  const gemini = spawn('gemini', args, {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  gemini.on('close', (code) => {
    if (code !== 0) {
      // エラー時にフォールバックを試行
      const fallbackModel = getFallbackModel(model);
      if (fallbackModel && !isRetry) {
        console.error(`\n${model} でエラーが発生しました (code: ${code})`);
        console.log(`フォールバック: ${fallbackModel} を使用します...`);
        runGeminiWithPrompt(prompt, fallbackModel, yolo, true);
      } else {
        console.error(`\nGemini CLI がエラーで終了しました (code: ${code})`);
      }
    }
  });
}

function writeProjectContext() {
  const geminiMdPath = path.join(process.cwd(), 'GEMINI.md');
  if (fs.existsSync(geminiMdPath)) return;
  try {
    fs.writeFileSync(geminiMdPath, PROJECT_CONTEXT, 'utf8');
    console.log('GEMINI.md を作成しました（プロジェクト情報）');
  } catch (e) {}
}

async function main() {
  const args = process.argv.slice(2);

  // ヘルプ表示
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('Gemini Helper - Google Gemini CLI連携');
    console.log('');
    console.log('Geminiサブスクリプションに含まれるGemini CLIを使用します。');
    console.log('');
    console.log('モデル優先順位:');
    console.log(`  1. ${MODELS.PRO} (推奨・デフォルト)`);
    console.log(`  2. ${MODELS.FLASH} (高速処理用)`);
    console.log(`  3. ${MODELS.PRO_FALLBACK} (フォールバック)`);
    console.log(`  4. ${MODELS.FLASH_FALLBACK} (フォールバック)`);
    console.log('');
    console.log('使用方法:');
    console.log('  node scripts/gemini-helper.js "タスク内容"        # Gemini 3 Pro');
    console.log('  node scripts/gemini-helper.js --fast "質問"       # Gemini 3 Flash');
    console.log('  node scripts/gemini-helper.js --error "エラー"    # エラー解決');
    console.log('  node scripts/gemini-helper.js --file X.js "修正"  # ファイル修正');
    console.log('  node scripts/gemini-helper.js --interactive       # 対話モード');
    console.log('  node scripts/gemini-helper.js --yolo "タスク"     # 自動承認');
    console.log('');
    console.log('または直接Gemini CLIを使用:');
    console.log(`  gemini -m ${MODELS.PRO} "タスク"`);
    console.log(`  gemini -m ${MODELS.FLASH} "簡単な質問"`);
    console.log('  gemini                          # 対話モード');
    console.log('');
    console.log('セットアップ:');
    console.log('  npm install -g @google/gemini-cli');
    console.log('  gemini  # 初回起動時にGoogleログイン');
    process.exit(0);
  }

  // Gemini CLIの存在確認
  if (!checkGeminiInstalled()) {
    console.error('エラー: Gemini CLIがインストールされていません。');
    console.log('');
    console.log('インストール方法:');
    console.log('  npm install -g @google/gemini-cli');
    console.log('');
    console.log('ログイン:');
    console.log('  gemini  # 初回起動時にブラウザでGoogleログイン');
    process.exit(1);
  }

  // GEMINI.md を作成
  writeProjectContext();

  let model = CONFIG.model;  // デフォルト: gemini-3-pro-preview
  let yolo = CONFIG.yolo;

  // 引数解析
  let prompt = '';
  let mode = 'general';
  let fileInfo = null;
  let i = 0;

  while (i < args.length) {
    const arg = args[i];

    // モデル指定
    if (arg === '--model' || arg === '-m') {
      model = args[i + 1];
      i += 2;
      continue;
    }

    // 高速モード（Gemini 3 Flash）
    if (arg === '--fast' || arg === '-f') {
      model = MODELS.FLASH;
      i++;
      continue;
    }

    // YOLOモード
    if (arg === '--yolo' || arg === '-y') {
      yolo = true;
      i++;
      continue;
    }

    // 対話モード
    if (arg === '--interactive' || arg === '-i') {
      runGeminiInteractive(model);
      return;
    }

    // エラー解決モード
    if (arg === '--error' || arg === '-e') {
      mode = 'error';
      prompt = args.slice(i + 1).join(' ');
      break;
    }

    // ファイル修正モード
    if (arg === '--file') {
      mode = 'file';
      const filePath = args[i + 1];
      const content = readFile(filePath);
      if (!content) {
        process.exit(1);
      }
      fileInfo = { name: path.basename(filePath), content };
      const task = args.slice(i + 2).join(' ') || '改善してください';
      prompt = generatePrompt(task, mode, fileInfo);
      break;
    }

    // 通常のプロンプト
    prompt = args.slice(i).join(' ');
    break;
  }

  if (!prompt) {
    console.error('プロンプトが指定されていません。');
    process.exit(1);
  }

  // プロンプト生成（エラーモードの場合）
  if (mode === 'error') {
    prompt = generatePrompt(prompt, mode);
  }

  // Gemini実行（フォールバック対応）
  runGeminiWithPrompt(prompt, model, yolo);
}

main();
```

---

## プロジェクト情報ファイルテンプレート

### CODEX.md / GEMINI.md

```markdown
# プロジェクト情報

{{PROJECT_DESCRIPTION}}

## 技術スタック

- {{LANGUAGE}}
- {{FRAMEWORK}}
- {{OTHER_TECH}}

## ディレクトリ構成

\`\`\`
{{DIRECTORY_STRUCTURE}}
\`\`\`

## コーディング規約

- {{CODING_STYLE}}
- {{NAMING_CONVENTION}}
- {{COMMENT_LANGUAGE}}

## 主要機能

1. {{FEATURE_1}}
2. {{FEATURE_2}}
3. {{FEATURE_3}}

## CLI設定

### 使用モデル
- Codex: gpt-5.2-codex
- Gemini: gemini-3-pro-preview（推奨）/ gemini-3-flash-preview（高速）

### コマンド例

\`\`\`bash
codex "タスク内容"
gemini -m gemini-3-pro-preview "タスク内容"
gemini -m gemini-3-flash-preview "簡単な質問"
\`\`\`
```

---

## Geminiカスタムスキルテンプレート

### .gemini/skills/your-skill/SKILL.md

```markdown
---
name: your-skill-name
description: スキルの説明
---

# スキル名

このスキルは{{SKILL_PURPOSE}}を支援します。

## 機能

1. **機能1**: {{FUNCTION_1_DESC}}
2. **機能2**: {{FUNCTION_2_DESC}}
3. **機能3**: {{FUNCTION_3_DESC}}

## 使用例

\`\`\`
{{USAGE_EXAMPLE}}
\`\`\`

## チェックポイント

### カテゴリ1
- [ ] チェック項目1
- [ ] チェック項目2

### カテゴリ2
- [ ] チェック項目3
- [ ] チェック項目4
```

---

## セットアップ手順

### 1. 前提条件

```bash
# Node.js がインストールされていること
node --version

# 各CLIをインストール
npm install -g @openai/codex
npm install -g @google/gemini-cli
```

### 2. ログイン

```bash
# Codex CLI（ChatGPT Plusアカウント）
codex --login

# Gemini CLI（Googleアカウント）
gemini
# 初回起動時にブラウザでログイン
```

### 3. ワークスペース設定

```bash
# ディレクトリ作成
mkdir -p .claude/commands
mkdir -p .gemini/skills/your-skill
mkdir -p scripts

# ファイル作成（上記テンプレートを使用）
# - .claude/settings.json
# - .claude/commands/codex.md
# - .claude/commands/gemini.md
# - scripts/codex-helper.js
# - scripts/gemini-helper.js
# - CODEX.md
# - GEMINI.md
```

### 4. 動作確認

```bash
# Codex CLI
codex "Hello World"

# Gemini CLI（Gemini 3系を使用）
gemini -m gemini-3-pro-preview "Hello World"
gemini -m gemini-3-flash-preview "Hello World"

# ヘルパースクリプト
node scripts/codex-helper.js "テスト"
node scripts/gemini-helper.js "テスト"
node scripts/gemini-helper.js --fast "テスト"
```

---

## カスタマイズガイド

### プロジェクト固有の設定

1. **settings.json**: `projectContext` セクションを編集
2. **CODEX.md / GEMINI.md**: プロジェクト情報を記載
3. **ヘルパースクリプト**: `PROJECT_CONTEXT` 変数を編集

### 言語別テンプレート

| 言語 | framework例 | 特記事項 |
|------|------------|---------|
| JavaScript | React, Vue, Node.js | ES6+構文推奨 |
| Python | Django, FastAPI, Flask | PEP8準拠 |
| Go | Gin, Echo | gofmt必須 |
| Rust | Actix, Rocket | cargo fmt推奨 |
| TypeScript | Next.js, NestJS | strict mode |

### 自動発動キーワードのカスタマイズ

```json
"autoInvoke": {
  "keywords": ["Codexで", "GPTで", "OpenAIで", "{{CUSTOM_KEYWORD}}"]
}
```

---

## トラブルシューティング

### Codex CLI

| エラー | 解決方法 |
|--------|---------|
| `codex: command not found` | `npm install -g @openai/codex` |
| `Not logged in` | `codex --login` |
| `Rate limit exceeded` | 少し待ってから再試行 |

### Gemini CLI

| エラー | 解決方法 |
|--------|---------|
| `gemini: command not found` | `npm install -g @google/gemini-cli` |
| `ModelNotFoundError` | モデル名を確認（`gemini-3-pro-preview`等） |
| `No skills discovered` | SKILL.mdのfrontmatterを確認 |
| Gemini 3でエラー | 自動フォールバックで2.5に切り替わる |

---

## 参考リンク

- [OpenAI Codex CLI](https://github.com/openai/codex)
- [Google Gemini CLI](https://github.com/google-gemini/gemini-cli)
- [Gemini Models](https://ai.google.dev/gemini-api/docs/models)
- [Claude Code](https://claude.ai/claude-code)

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-01 | 初版作成 |
| 2025-01 | Gemini 3 Pro Preview対応 |
| 2026-01 | Gemini 3優先・2.5フォールバック対応に更新 |
| 2026-01 | 自動承認モード（Codex: never, Gemini: yolo）をデフォルトに設定 |
| 2026-01 | 使用量上限警告セクション追加（追加課金防止）|
