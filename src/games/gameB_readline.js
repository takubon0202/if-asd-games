/**
 * Game B - 行読みガイド（ぎょうよみ）
 * ASD＆LD向け「目の動き」トレーニングWebゲーム
 *
 * 3〜5行のターゲット（図形）を配置し、1行ずつハイライトを表示しながら
 * 左→右へ順番にターゲットを選択していくゲーム
 */

import { Draw, Color, Random, pointInCircle } from '../engine/utils.js';
import { theme } from '../engine/theme.js';
import { audio } from '../engine/audio.js';

// 図形の種類
const SHAPE_TYPES = ['circle', 'square', 'triangle', 'diamond', 'star'];

// 図形の色（テーマと調和する穏やかな色）
const SHAPE_COLORS = [
  '#5DA5DA', // 青
  '#FAA43A', // オレンジ
  '#60BD68', // 緑
  '#F17CB0', // ピンク
  '#B276B2', // 紫
  '#DECF3F', // 黄色
  '#4D4D4D'  // グレー
];

/**
 * ターゲットクラス
 */
class Target {
  constructor(x, y, row, col, shapeType, color, radius) {
    this.x = x;
    this.y = y;
    this.row = row;
    this.col = col;
    this.shapeType = shapeType;
    this.color = color;
    this.radius = radius;
    this.completed = false;
    this.isHinted = false;

    // アニメーション用
    this.scale = 1;
    this.glowIntensity = 0;
  }

  /**
   * 点がターゲット内にあるかチェック
   */
  containsPoint(px, py) {
    // 全ての図形を円で判定（タップしやすさのため）
    return pointInCircle(px, py, this.x, this.y, this.radius * 1.2);
  }

  /**
   * 描画
   */
  draw(ctx, isNext, showHint) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);

    // 次のターゲットの場合はグローを描画
    if (isNext && showHint) {
      this._drawGlow(ctx);
    }

    // ヒント表示（間違えた後）
    if (this.isHinted) {
      this._drawHintGlow(ctx);
    }

    // 図形を描画
    this._drawShape(ctx);

    ctx.restore();
  }

  /**
   * グロー効果を描画
   */
  _drawGlow(ctx) {
    const gradient = ctx.createRadialGradient(0, 0, this.radius * 0.5, 0, 0, this.radius * 1.8);
    const colors = theme.getColors();
    gradient.addColorStop(0, Color.withAlpha(colors.primary, 0.4));
    gradient.addColorStop(0.5, Color.withAlpha(colors.primary, 0.2));
    gradient.addColorStop(1, Color.withAlpha(colors.primary, 0));

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * ヒントグロー効果を描画（優しい表示）
   */
  _drawHintGlow(ctx) {
    const intensity = 0.3 + Math.sin(performance.now() / 500) * 0.1;
    const gradient = ctx.createRadialGradient(0, 0, this.radius * 0.5, 0, 0, this.radius * 2);
    const colors = theme.getColors();
    gradient.addColorStop(0, Color.withAlpha(colors.success, intensity));
    gradient.addColorStop(0.6, Color.withAlpha(colors.success, intensity * 0.5));
    gradient.addColorStop(1, Color.withAlpha(colors.success, 0));

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 図形を描画
   */
  _drawShape(ctx) {
    const r = this.radius;
    let fillColor = this.color;

    // 完了済みは薄い色に
    if (this.completed) {
      fillColor = Color.withAlpha(this.color, 0.3);
    }

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = Color.darken(this.color, 0.2);
    ctx.lineWidth = 2;

    switch (this.shapeType) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;

      case 'square':
        ctx.beginPath();
        ctx.rect(-r * 0.8, -r * 0.8, r * 1.6, r * 1.6);
        ctx.fill();
        ctx.stroke();
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(r * 0.866, r * 0.5);
        ctx.lineTo(-r * 0.866, r * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(r * 0.7, 0);
        ctx.lineTo(0, r);
        ctx.lineTo(-r * 0.7, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'star':
        Draw.star(ctx, 0, 0, 5, r, r * 0.5);
        ctx.fill();
        ctx.stroke();
        break;
    }

    // 完了チェックマーク
    if (this.completed) {
      this._drawCheckMark(ctx);
    }
  }

  /**
   * チェックマークを描画
   */
  _drawCheckMark(ctx) {
    const colors = theme.getColors();
    ctx.strokeStyle = colors.success;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const size = this.radius * 0.5;
    ctx.beginPath();
    ctx.moveTo(-size * 0.5, 0);
    ctx.lineTo(-size * 0.1, size * 0.4);
    ctx.lineTo(size * 0.5, -size * 0.3);
    ctx.stroke();
  }
}

/**
 * Game B - 行読みガイド
 */
export class GameB_Readline {
  id = 'gameB';
  name = 'ぎょうよみ';
  description = 'じゅんばんに えらんでいこう';

  /**
   * @param {HTMLCanvasElement} canvas - キャンバス要素
   * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
   * @param {Object} settings - ゲーム設定
   */
  constructor(canvas, ctx, settings) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.settings = settings;

    // ゲーム設定
    this.rowCount = settings.difficulty === 'easy' ? 3 :
                    settings.difficulty === 'normal' ? 4 : 5;
    this.colCount = settings.difficulty === 'easy' ? 3 :
                    settings.difficulty === 'normal' ? 4 : 5;
    this.showGuide = settings.showGuide !== false;
    this.timeLimit = settings.timeLimit || 60;

    // ゲーム状態
    this.targets = [];
    this.currentRow = 0;
    this.currentCol = 0;
    this.score = 0;
    this.correctCount = 0;
    this.mistakeCount = 0;
    this.elapsedTime = 0;
    this.isRunning = false;
    this.isCompleted = false;
    this.isFinished = false;

    // メッセージ表示
    this.message = null;
    this.messageTimer = 0;

    // 論理サイズ
    this.logicalWidth = 800;
    this.logicalHeight = 600;

    // ターゲットサイズ
    this.targetRadius = 30;
  }

  /**
   * 初期化
   */
  init() {
    this._createTargets();
    this.currentRow = 0;
    this.currentCol = 0;
    this.score = 0;
    this.correctCount = 0;
    this.mistakeCount = 0;
    this.elapsedTime = 0;
    this.isRunning = false;
    this.isCompleted = false;
    this.message = null;
    this.messageTimer = 0;
  }

  /**
   * ターゲットを生成
   */
  _createTargets() {
    this.targets = [];

    // 配置エリアの計算
    const margin = 80;
    const topMargin = 100;
    const bottomMargin = 100;
    const areaWidth = this.logicalWidth - margin * 2;
    const areaHeight = this.logicalHeight - topMargin - bottomMargin;

    const colSpacing = areaWidth / (this.colCount + 1);
    const rowSpacing = areaHeight / (this.rowCount + 1);

    // 使用する図形と色をランダムに選択
    const availableShapes = Random.shuffle([...SHAPE_TYPES]);
    const availableColors = Random.shuffle([...SHAPE_COLORS]);

    for (let row = 0; row < this.rowCount; row++) {
      for (let col = 0; col < this.colCount; col++) {
        const x = margin + colSpacing * (col + 1);
        const y = topMargin + rowSpacing * (row + 1);

        // 各ターゲットに異なる図形と色を割り当て（バリエーション）
        const shapeIndex = (row * this.colCount + col) % availableShapes.length;
        const colorIndex = (row * this.colCount + col) % availableColors.length;

        const target = new Target(
          x, y, row, col,
          availableShapes[shapeIndex],
          availableColors[colorIndex],
          this.targetRadius
        );

        this.targets.push(target);
      }
    }
  }

  /**
   * ゲーム開始
   */
  start() {
    this.isRunning = true;
    audio.play('start');
  }

  /**
   * 更新処理
   * @param {number} dt - 経過時間（秒）
   */
  update(dt) {
    if (!this.isRunning || this.isCompleted) return;

    // 時間更新
    this.elapsedTime += dt;

    // 時間切れチェック
    if (this.timeLimit > 0 && this.elapsedTime >= this.timeLimit) {
      this._completeGame();
      return;
    }

    // メッセージタイマー更新
    if (this.message && this.messageTimer > 0) {
      this.messageTimer -= dt;
      if (this.messageTimer <= 0) {
        this.message = null;
        // ヒント表示をリセット
        this.targets.forEach(t => t.isHinted = false);
      }
    }

    // ターゲットのアニメーション更新
    this._updateTargetAnimations(dt);
  }

  /**
   * ターゲットアニメーションの更新
   */
  _updateTargetAnimations(dt) {
    const nextTarget = this._getNextTarget();

    this.targets.forEach(target => {
      // 次のターゲットは少し拡大
      if (target === nextTarget && this.showGuide) {
        target.scale = 1 + Math.sin(performance.now() / 300) * 0.05;
      } else {
        target.scale = 1;
      }
    });
  }

  /**
   * 次のターゲットを取得
   */
  _getNextTarget() {
    return this.targets.find(t =>
      t.row === this.currentRow && t.col === this.currentCol
    );
  }

  /**
   * 描画処理
   */
  render() {
    const ctx = this.ctx;
    const colors = theme.getColors();

    // 背景クリア
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);

    // タイトル・スコア表示
    this._renderHeader(ctx, colors);

    // 行ハイライト（ガイドON時）
    if (this.showGuide && !this.isCompleted) {
      this._renderRowHighlight(ctx, colors);
    }

    // ターゲット描画
    const nextTarget = this._getNextTarget();
    this.targets.forEach(target => {
      target.draw(ctx, target === nextTarget, this.showGuide);
    });

    // メッセージ表示
    if (this.message) {
      this._renderMessage(ctx, colors);
    }

    // 完了画面
    if (this.isCompleted) {
      this._renderCompletedOverlay(ctx, colors);
    }
  }

  /**
   * ヘッダー描画
   */
  _renderHeader(ctx, colors) {
    // タイトル
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('ぎょうよみ', this.logicalWidth / 2, 15);

    // 進捗表示
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    const total = this.rowCount * this.colCount;
    ctx.fillText(`すすみ: ${this.correctCount} / ${total}`, 20, 20);

    // 残り時間（制限時間がある場合）
    if (this.timeLimit > 0) {
      ctx.textAlign = 'right';
      const remaining = Math.max(0, this.timeLimit - this.elapsedTime);
      const minutes = Math.floor(remaining / 60);
      const seconds = Math.floor(remaining % 60);
      ctx.fillText(
        `のこり: ${minutes}:${seconds.toString().padStart(2, '0')}`,
        this.logicalWidth - 20, 20
      );
    }

    // 現在の行番号表示
    ctx.textAlign = 'center';
    ctx.fillStyle = colors.textSecondary;
    ctx.font = '14px sans-serif';
    ctx.fillText(
      `いま ${this.currentRow + 1}ぎょうめ`,
      this.logicalWidth / 2, 50
    );
  }

  /**
   * 行ハイライト描画
   */
  _renderRowHighlight(ctx, colors) {
    const margin = 80;
    const topMargin = 100;
    const bottomMargin = 100;
    const areaHeight = this.logicalHeight - topMargin - bottomMargin;
    const rowSpacing = areaHeight / (this.rowCount + 1);

    const highlightY = topMargin + rowSpacing * (this.currentRow + 1) - this.targetRadius - 15;
    const highlightHeight = this.targetRadius * 2 + 30;

    // 薄い帯を描画
    ctx.fillStyle = Color.withAlpha(colors.primary, 0.1);
    ctx.fillRect(0, highlightY, this.logicalWidth, highlightHeight);

    // 左右の矢印で現在行を示す
    ctx.fillStyle = Color.withAlpha(colors.primary, 0.5);

    // 左矢印
    ctx.beginPath();
    ctx.moveTo(15, highlightY + highlightHeight / 2);
    ctx.lineTo(35, highlightY + highlightHeight / 2 - 15);
    ctx.lineTo(35, highlightY + highlightHeight / 2 + 15);
    ctx.closePath();
    ctx.fill();

    // 右矢印
    ctx.beginPath();
    ctx.moveTo(this.logicalWidth - 15, highlightY + highlightHeight / 2);
    ctx.lineTo(this.logicalWidth - 35, highlightY + highlightHeight / 2 - 15);
    ctx.lineTo(this.logicalWidth - 35, highlightY + highlightHeight / 2 + 15);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * メッセージ描画
   */
  _renderMessage(ctx, colors) {
    // 背景
    const boxWidth = 300;
    const boxHeight = 60;
    const boxX = (this.logicalWidth - boxWidth) / 2;
    const boxY = this.logicalHeight - 120;

    ctx.fillStyle = Color.withAlpha(colors.surface, 0.95);
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2;

    Draw.roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 10);
    ctx.fill();
    ctx.stroke();

    // テキスト
    ctx.fillStyle = colors.text;
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.message, this.logicalWidth / 2, boxY + boxHeight / 2);
  }

  /**
   * 完了オーバーレイ描画
   */
  _renderCompletedOverlay(ctx, colors) {
    // 半透明オーバーレイ
    ctx.fillStyle = Color.withAlpha(colors.background, 0.8);
    ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);

    // 完了メッセージ
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('おわり!', this.logicalWidth / 2, this.logicalHeight / 2 - 40);

    ctx.font = '20px sans-serif';
    ctx.fillText(
      `せいかい: ${this.correctCount}`,
      this.logicalWidth / 2, this.logicalHeight / 2 + 10
    );

    ctx.fillStyle = colors.textSecondary;
    ctx.font = '16px sans-serif';
    ctx.fillText(
      'タップして けっかをみる',
      this.logicalWidth / 2, this.logicalHeight / 2 + 60
    );
  }

  /**
   * 入力処理
   * @param {Object} event - 入力イベント
   */
  handleInput(event) {
    if (!this.isRunning) return;

    // 完了後はisFinishedフラグで処理（main.jsで検知）
    if (this.isCompleted) {
      this.isFinished = true;
      return;
    }

    // main.jsからのイベント形式に対応
    // pointerDown または click でターゲット選択
    const isClickEvent =
      event.action === 'pointerDown' ||
      event.type === 'click' ||
      event.type === 'touchstart';

    if (!isClickEvent) return;

    const position = event.position;
    if (!position) return;

    // ターゲットクリック判定
    const clickedTarget = this.targets.find(t =>
      !t.completed && t.containsPoint(position.x, position.y)
    );

    if (clickedTarget) {
      this._handleTargetClick(clickedTarget);
    }
  }

  /**
   * ターゲットクリック処理
   */
  _handleTargetClick(target) {
    const nextTarget = this._getNextTarget();

    if (target === nextTarget) {
      // 正解
      this._onCorrect(target);
    } else if (target.row !== this.currentRow) {
      // 別の行をクリック → 優しくガイド
      this._onWrongRow(target);
    } else {
      // 同じ行だが順番が違う
      this._onWrongOrder(target);
    }
  }

  /**
   * 正解処理
   */
  _onCorrect(target) {
    target.completed = true;
    this.correctCount++;
    this.score += 10;
    audio.play('success');

    // ヒント表示をリセット
    this.targets.forEach(t => t.isHinted = false);
    this.message = null;

    // 次のターゲットへ
    this.currentCol++;
    if (this.currentCol >= this.colCount) {
      // 次の行へ
      this.currentCol = 0;
      this.currentRow++;

      // 全行完了チェック
      if (this.currentRow >= this.rowCount) {
        this._completeGame();
      }
    }
  }

  /**
   * 別の行をクリックした場合
   */
  _onWrongRow(target) {
    this.mistakeCount++;

    // 優しいメッセージ
    if (target.row > this.currentRow) {
      this.message = 'さきの ぎょうだよ。もどってみよう';
    } else {
      this.message = 'まえの ぎょうだよ。つぎへ すすもう';
    }
    this.messageTimer = 2;

    // 正しいターゲットにヒント表示
    const nextTarget = this._getNextTarget();
    if (nextTarget) {
      nextTarget.isHinted = true;
    }
  }

  /**
   * 順番が違う場合
   */
  _onWrongOrder(target) {
    this.mistakeCount++;

    // 優しいメッセージ
    this.message = 'もういちど みてみよう';
    this.messageTimer = 2;

    // 正しいターゲットにヒント表示
    const nextTarget = this._getNextTarget();
    if (nextTarget) {
      nextTarget.isHinted = true;
    }
  }

  /**
   * ゲーム完了
   */
  _completeGame() {
    this.isCompleted = true;
    this.isRunning = false;
    audio.play('complete');
  }

  /**
   * 一時停止
   */
  pause() {
    this.isRunning = false;
  }

  /**
   * 再開
   */
  resume() {
    if (!this.isCompleted) {
      this.isRunning = true;
    }
  }

  /**
   * 破棄
   */
  destroy() {
    this.targets = [];
  }

  /**
   * 結果を取得
   * @returns {Object} ゲーム結果
   */
  getResult() {
    const total = this.rowCount * this.colCount;
    const accuracy = total > 0 ? Math.round((this.correctCount / total) * 100) : 0;

    return {
      gameId: this.id,
      gameName: this.name,
      score: this.score,
      correctCount: this.correctCount,
      mistakeCount: this.mistakeCount,
      totalTargets: total,
      accuracy: accuracy,
      elapsedTime: Math.floor(this.elapsedTime),
      completed: this.isCompleted && this.currentRow >= this.rowCount,
      difficulty: this.settings.difficulty || 'normal',
      timestamp: Date.now()
    };
  }
}

export default GameB_Readline;
