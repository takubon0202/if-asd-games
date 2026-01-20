# Gemini CLI連携スキル

Google Gemini CLIを使用してコード生成・エラー解決を行います。
**Gemini AI Pro サブスクリプション**に含まれており、追加費用なしで利用できます。

（Claude Code / Codex CLIと同じ仕組みです）

## 使用方法

```
/gemini タスク内容
```

## 実行されるコマンド

$ARGUMENTS を受け取り、Gemini CLIを実行します：

```bash
gemini -m gemini-3-pro-preview "$ARGUMENTS"
```

## 利用可能なモデル

### メイン（常にこちらを使用）

| モデル | 説明 | 用途 |
|--------|------|------|
| `gemini-3-pro-preview` | **推奨** - 最高品質の推論・コーディング | 複雑なタスク、設計、分析 |
| `gemini-3-flash-preview` | **高速** - 低レイテンシ | 単純なタスク、素早い回答 |

### フォールバック（エラー時のみ）

| モデル | 説明 |
|--------|------|
| `gemini-2.5-pro` | Gemini 3がエラーの場合のみ使用 |
| `gemini-2.5-flash` | Gemini 3 Flashがエラーの場合のみ使用 |

> **注意**: 2.5系は通常使用しません。Gemini 3系でエラーが発生した場合のみフォールバックとして使用してください。

## コマンド例

```bash
# 推奨：Gemini 3 Pro（デフォルト）
gemini "配列をシャッフルする関数を作成"
gemini -m gemini-3-pro-preview "複雑なアルゴリズムを実装"

# 高速処理：Gemini 3 Flash
gemini -m gemini-3-flash-preview "簡単な質問に答えて"

# 自動承認モード（YOLO）
gemini -y "ファイルを修正して"
gemini --yolo "テストを実行"

# 対話モード
gemini
```

## フォールバック使用例（エラー時のみ）

```bash
# Gemini 3 Proがエラーの場合のみ
gemini -m gemini-2.5-pro "タスク内容"

# Gemini 3 Flashがエラーの場合のみ
gemini -m gemini-2.5-flash "タスク内容"
```

## Agent Skills

```bash
gemini skills list       # スキル一覧
gemini skills enable X   # スキル有効化
gemini skills disable X  # スキル無効化
```

## 拡張機能

```bash
gemini extensions list        # 拡張機能一覧
gemini extensions install X   # インストール
```

## 自動発動条件

このスキルは以下の状況で提案されます：

- 「Geminiで」と明示的に依頼
- Claude/Codexで解決困難なタスク
- 別の視点が欲しい時
- マルチモーダル処理が必要な時

## セットアップ（初回のみ）

```bash
# インストール
npm install -g @google/gemini-cli

# Googleアカウントでログイン
gemini
# 初回起動時にブラウザでログイン（OAuth認証）
```

## 必要なもの

- **Gemini AI Pro** サブスクリプション（$19.99/月）
- Node.js

OAuth認証のみで利用可能。APIキーは不要です。
