#!/usr/bin/env node
/**
 * Codex Helper - OpenAI Codex CLI連携スクリプト
 *
 * ChatGPT Plusサブスクリプションに含まれるCodex CLIを使用します。
 * Claude CodeがMaxサブスクで動くのと同じ仕組みです。
 *
 * 使用方法:
 *   node scripts/codex-helper.js "タスク内容"
 *   node scripts/codex-helper.js --error "エラーメッセージ"
 *   node scripts/codex-helper.js --file path/to/file.js "修正内容"
 *   node scripts/codex-helper.js --interactive  # 対話モード
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

// プロジェクト情報（Codexへのコンテキスト）
const PROJECT_CONTEXT = `# プロジェクト情報
ASD/LD向けの子供用「目の動き」トレーニングWebゲーム

## 技術スタック
- Vanilla JavaScript (ES6 Modules)
- Canvas API
- 状態管理: カスタムStateMachine

## ディレクトリ構成
- src/engine/ - ゲームエンジン（canvas, input, state, audio, utils）
- src/games/ - ゲーム本体（gameA_rail, gameB_readline, gameC_predictSaccade）
- src/ui/ - UI画面（home, hud, result, settings）
- src/main.js - エントリーポイント

## 要件
- ES6+構文
- ASD/LD向け配慮（優しいメッセージ、視覚刺激軽減）
- 日本語コメント`;

/**
 * Codex CLIがインストールされているか確認
 */
function checkCodexInstalled() {
  try {
    execSync('codex --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * ファイルの内容を読み込む
 */
function readFile(filePath) {
  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);
    return fs.readFileSync(absolutePath, 'utf8');
  } catch (e) {
    console.error(`ファイル読み込みエラー: ${filePath}`);
    return null;
  }
}

/**
 * プロンプトを生成
 */
function generatePrompt(task, mode = 'general', fileInfo = null) {
  let prompt = '';

  switch (mode) {
    case 'error':
      prompt = `以下のエラーを解決してください。原因を分析し、修正コードを提示してください。

エラー:
${task}`;
      break;

    case 'file':
      prompt = `以下のファイルを修正してください。

ファイル: ${fileInfo.name}
タスク: ${task}

現在のコード:
\`\`\`javascript
${fileInfo.content}
\`\`\``;
      break;

    default:
      prompt = task;
  }

  return prompt;
}

/**
 * Codex CLIを実行（対話モード）
 */
function runCodexInteractive() {
  console.log('Codex CLI を対話モードで起動します...');
  console.log('終了するには Ctrl+C または /exit を入力\n');

  const codex = spawn('codex', [], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  codex.on('close', (code) => {
    console.log(`\nCodex CLI 終了 (code: ${code})`);
  });
}

/**
 * Codex CLIを実行（プロンプト指定）
 */
function runCodexWithPrompt(prompt) {
  console.log('Codex CLI を実行中...\n');

  // Codexにプロンプトを渡して実行
  const codex = spawn('codex', [prompt], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  codex.on('close', (code) => {
    if (code !== 0) {
      console.error(`\nCodex CLI がエラーで終了しました (code: ${code})`);
    }
  });
}

/**
 * CODEX.md にプロジェクト情報を書き出す
 */
function writeProjectContext() {
  const codexMdPath = path.join(process.cwd(), 'CODEX.md');

  // 既に存在する場合はスキップ
  if (fs.existsSync(codexMdPath)) {
    return;
  }

  try {
    fs.writeFileSync(codexMdPath, PROJECT_CONTEXT, 'utf8');
    console.log('CODEX.md を作成しました（プロジェクト情報）');
  } catch (e) {
    // 書き込み失敗は無視
  }
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);

  // ヘルプ表示
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('Codex Helper - OpenAI Codex CLI連携');
    console.log('');
    console.log('ChatGPT Plusサブスクリプションに含まれるCodex CLIを使用します。');
    console.log('');
    console.log('使用方法:');
    console.log('  node scripts/codex-helper.js "タスク内容"');
    console.log('  node scripts/codex-helper.js --error "エラーメッセージ"');
    console.log('  node scripts/codex-helper.js --file path/to/file.js "修正内容"');
    console.log('  node scripts/codex-helper.js --interactive  # 対話モード');
    console.log('');
    console.log('または直接Codex CLIを使用:');
    console.log('  codex "タスク内容"');
    console.log('  codex              # 対話モード');
    console.log('');
    console.log('セットアップ:');
    console.log('  npm install -g @openai/codex');
    console.log('  codex --login      # ChatGPT Plusでログイン');
    process.exit(0);
  }

  // Codex CLIの存在確認
  if (!checkCodexInstalled()) {
    console.error('エラー: Codex CLIがインストールされていません。');
    console.log('');
    console.log('インストール方法:');
    console.log('  npm install -g @openai/codex');
    console.log('');
    console.log('ログイン:');
    console.log('  codex --login');
    process.exit(1);
  }

  // CODEX.md を作成（プロジェクト情報）
  writeProjectContext();

  // 対話モード
  if (args[0] === '--interactive' || args[0] === '-i') {
    runCodexInteractive();
    return;
  }

  // プロンプト生成
  let prompt = '';
  let mode = 'general';
  let fileInfo = null;

  if (args[0] === '--error' || args[0] === '-e') {
    mode = 'error';
    prompt = generatePrompt(args.slice(1).join(' '), mode);
  } else if (args[0] === '--file' || args[0] === '-f') {
    mode = 'file';
    const filePath = args[1];
    const content = readFile(filePath);
    if (!content) {
      process.exit(1);
    }
    fileInfo = { name: path.basename(filePath), content };
    const task = args.slice(2).join(' ') || '改善してください';
    prompt = generatePrompt(task, mode, fileInfo);
  } else {
    prompt = generatePrompt(args.join(' '), mode);
  }

  // Codex実行
  runCodexWithPrompt(prompt);
}

main();
