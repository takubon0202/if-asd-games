/**
 * Game C: よそくジャンプ（予告付き視線切り替え）
 * 次に出る位置を「うっすら予告」→0.5秒後に本表示。
 * 本表示されたらクリック/キーで反応する（準備して切り替える練習）。
 *
 * ASD&LD向け配慮：
 * - スピード勝負ではなく、準備→反応の練習
 * - タイムアップでの否定的フィードバック禁止
 * - 点滅禁止、フェードインで緩やかに表示
 */

import { Draw, Color, Easing, Random, clamp } from '../engine/utils.js';
import { theme } from '../engine/theme.js';

// 配置パターン
const PatternType = {
  HORIZONTAL: 'horizontal',     // 左右交互
  VERTICAL: 'vertical',         // 上下交互
  CENTER_CROSS: 'centerCross',  // 中央挟み（左→中央→右→中央...）
  RANDOM: 'random'              // ランダム（上級者向け）
};

// ゲーム状態
const GamePhase = {
  READY: 'ready',           // 開始前
  PREVIEW: 'preview',       // 予告表示中
  ACTIVE: 'active',         // 本表示中（反応待ち）
  FEEDBACK: 'feedback',     // フィードバック表示中
  COMPLETE: 'complete'      // ゲーム終了
};

// 3x3グリッドの位置定義
const GridPositions = {
  topLeft: { col: 0, row: 0 },
  topCenter: { col: 1, row: 0 },
  topRight: { col: 2, row: 0 },
  middleLeft: { col: 0, row: 1 },
  center: { col: 1, row: 1 },
  middleRight: { col: 2, row: 1 },
  bottomLeft: { col: 0, row: 2 },
  bottomCenter: { col: 1, row: 2 },
  bottomRight: { col: 2, row: 2 }
};

export class GameC_PredictSaccade {
  id = 'gameC';
  name = 'よそくジャンプ';
  description = 'つぎの ばしょを よそくして みよう';

  /**
   * @param {HTMLCanvasElement} canvas - キャンバス要素
   * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
   * @param {Object} settings - ゲーム設定
   */
  constructor(canvas, ctx, settings = {}) {
    this.canvas = canvas;
    this.ctx = ctx;

    // 設定
    this.settings = {
      pattern: settings.pattern || PatternType.HORIZONTAL,
      totalRounds: settings.totalRounds || 10,
      previewDuration: settings.previewDuration || 500,     // 予告表示時間（ms）
      responseDuration: settings.responseDuration || 2000,   // 反応猶予時間（ms）
      feedbackDuration: settings.feedbackDuration || 800,    // フィードバック表示時間（ms）
      markerRadius: settings.markerRadius || 40,
      enableRandom: settings.enableRandom || false,          // ランダムパターンを有効にするか
      ...settings
    };

    // ゲーム状態
    this.phase = GamePhase.READY;
    this.isPaused = false;
    this.isFinished = false;
    this.currentRound = 0;

    // main.jsのHUD連携用プロパティ
    this.elapsedTime = 0;
    this.score = 0;
    this.timeLimit = 0; // ラウンド制のため時間制限なし（HUDでは非表示）

    // 位置管理
    this.currentPosition = null;
    this.nextPosition = null;
    this.positionSequence = [];
    this.positionIndex = 0;

    // 時間管理
    this.phaseTimer = 0;
    this.markerOpacity = 0;
    this.targetOpacity = 0;

    // 結果記録
    this.results = [];
    this.responseStartTime = 0;

    // キャンバスサイズ（論理サイズ）
    this.logicalWidth = 800;
    this.logicalHeight = 600;

    // グリッド設定
    this.gridPadding = 100;
    this.gridPositions = [];

    // アニメーション用
    this.fadeProgress = 0;

    // フィードバックメッセージ
    this.feedbackMessage = '';
    this.feedbackType = 'neutral'; // 'success', 'neutral'

    this._calculateGridPositions();
  }

  /**
   * 3x3グリッドの各位置の座標を計算
   */
  _calculateGridPositions() {
    const usableWidth = this.logicalWidth - this.gridPadding * 2;
    const usableHeight = this.logicalHeight - this.gridPadding * 2;

    // 3x3グリッドなので3で割る（修正: 2→3）
    const GRID_COLS = 3;
    const GRID_ROWS = 3;
    const cellWidth = usableWidth / GRID_COLS;
    const cellHeight = usableHeight / GRID_ROWS;

    this.gridPositions = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        this.gridPositions.push({
          // セルの中央に配置（+0.5を追加）
          x: this.gridPadding + (col + 0.5) * cellWidth,
          y: this.gridPadding + (row + 0.5) * cellHeight,
          col,
          row,
          name: this._getPositionName(col, row)
        });
      }
    }
  }

  /**
   * 位置の名前を取得
   */
  _getPositionName(col, row) {
    const names = [
      ['topLeft', 'topCenter', 'topRight'],
      ['middleLeft', 'center', 'middleRight'],
      ['bottomLeft', 'bottomCenter', 'bottomRight']
    ];
    return names[row][col];
  }

  /**
   * グリッドインデックスから座標を取得
   */
  _getGridPosition(index) {
    return this.gridPositions[index];
  }

  /**
   * パターンに基づいて位置シーケンスを生成
   */
  _generateSequence() {
    const pattern = this.settings.pattern;
    const rounds = this.settings.totalRounds;
    const sequence = [];

    switch (pattern) {
      case PatternType.HORIZONTAL:
        // 左右交互（中央行を使用）
        for (let i = 0; i < rounds; i++) {
          sequence.push(i % 2 === 0 ? 3 : 5); // middleLeft(3) と middleRight(5)
        }
        break;

      case PatternType.VERTICAL:
        // 上下交互（中央列を使用）
        for (let i = 0; i < rounds; i++) {
          sequence.push(i % 2 === 0 ? 1 : 7); // topCenter(1) と bottomCenter(7)
        }
        break;

      case PatternType.CENTER_CROSS:
        // 中央挟み（左→中央→右→中央...）
        const crossPattern = [3, 4, 5, 4]; // middleLeft, center, middleRight, center
        for (let i = 0; i < rounds; i++) {
          sequence.push(crossPattern[i % 4]);
        }
        break;

      case PatternType.RANDOM:
        // ランダム（ただし連続で同じ位置にならないように）
        let lastPos = -1;
        for (let i = 0; i < rounds; i++) {
          let newPos;
          do {
            newPos = Random.int(0, 8);
          } while (newPos === lastPos);
          sequence.push(newPos);
          lastPos = newPos;
        }
        break;

      default:
        // デフォルトは左右交互
        for (let i = 0; i < rounds; i++) {
          sequence.push(i % 2 === 0 ? 3 : 5);
        }
    }

    return sequence;
  }

  /**
   * 初期化
   */
  init() {
    this.phase = GamePhase.READY;
    this.currentRound = 0;
    this.results = [];
    this.phaseTimer = 0;
    this.markerOpacity = 0;
    this.fadeProgress = 0;

    // HUD連携用プロパティをリセット
    this.elapsedTime = 0;
    this.score = 0;

    // シーケンス生成
    this.positionSequence = this._generateSequence();
    this.positionIndex = 0;

    // 最初の位置を設定
    this.currentPosition = null;
    this.nextPosition = this._getGridPosition(this.positionSequence[0]);
  }

  /**
   * ゲーム開始
   * 注意: init()はmain.jsから事前に呼び出されるため、ここでは呼ばない
   */
  start() {
    this._startPreviewPhase();
  }

  /**
   * 予告フェーズを開始
   */
  _startPreviewPhase() {
    this.phase = GamePhase.PREVIEW;
    this.phaseTimer = 0;
    this.markerOpacity = 0;
    this.targetOpacity = 0.3; // 予告は薄く表示
    this.fadeProgress = 0;

    // 次の位置を設定
    if (this.positionIndex < this.positionSequence.length) {
      this.nextPosition = this._getGridPosition(this.positionSequence[this.positionIndex]);
    }
  }

  /**
   * 本表示フェーズを開始
   */
  _startActivePhase() {
    this.phase = GamePhase.ACTIVE;
    this.phaseTimer = 0;
    this.targetOpacity = 1.0; // 本表示は濃く
    this.fadeProgress = 0;
    this.responseStartTime = performance.now();

    // 現在位置を更新
    this.currentPosition = this.nextPosition;
  }

  /**
   * フィードバックフェーズを開始
   */
  _startFeedbackPhase(success, responseTime = null) {
    this.phase = GamePhase.FEEDBACK;
    this.phaseTimer = 0;
    this.fadeProgress = 0;

    if (success) {
      this.feedbackMessage = 'いいね！';
      this.feedbackType = 'success';

      // 結果を記録
      this.results.push({
        round: this.currentRound + 1,
        success: true,
        responseTime: responseTime,
        position: this.currentPosition.name
      });
    } else {
      // タイムアップでも否定的でないメッセージ
      this.feedbackMessage = 'ゆっくりでいいよ';
      this.feedbackType = 'neutral';

      this.results.push({
        round: this.currentRound + 1,
        success: false,
        responseTime: null,
        position: this.currentPosition.name
      });
    }

    this.currentRound++;
  }

  /**
   * 次のラウンドへ進む
   */
  _advanceToNextRound() {
    this.positionIndex++;

    if (this.positionIndex >= this.positionSequence.length) {
      // ゲーム終了
      this.phase = GamePhase.COMPLETE;
      this.isFinished = true;
    } else {
      // 次のラウンド開始
      this._startPreviewPhase();
    }
  }

  /**
   * 更新処理
   * @param {number} dt - 経過時間（秒）
   */
  update(dt) {
    if (this.isPaused || this.phase === GamePhase.COMPLETE || this.phase === GamePhase.READY) {
      return;
    }

    // HUD連携用の経過時間を更新
    this.elapsedTime += dt;
    // スコアは成功数を反映
    this.score = this.results.filter(r => r.success).length;

    const dtMs = dt * 1000;
    this.phaseTimer += dtMs;

    switch (this.phase) {
      case GamePhase.PREVIEW:
        // 予告表示中：フェードイン
        this.fadeProgress = clamp(this.phaseTimer / 300, 0, 1);
        this.markerOpacity = Easing.easeOutQuad(this.fadeProgress) * this.targetOpacity;

        // 予告時間が経過したら本表示へ
        if (this.phaseTimer >= this.settings.previewDuration) {
          this._startActivePhase();
        }
        break;

      case GamePhase.ACTIVE:
        // 本表示中：フェードイン
        this.fadeProgress = clamp(this.phaseTimer / 200, 0, 1);
        this.markerOpacity = 0.3 + Easing.easeOutQuad(this.fadeProgress) * 0.7;

        // 反応猶予時間を超えたらタイムアップ
        if (this.phaseTimer >= this.settings.responseDuration) {
          this._startFeedbackPhase(false);
        }
        break;

      case GamePhase.FEEDBACK:
        // フィードバック表示中
        this.fadeProgress = clamp(this.phaseTimer / this.settings.feedbackDuration, 0, 1);

        // フィードバック時間が経過したら次へ
        if (this.phaseTimer >= this.settings.feedbackDuration) {
          this._advanceToNextRound();
        }
        break;
    }
  }

  /**
   * 描画処理
   */
  render() {
    const ctx = this.ctx;
    const colors = theme.getColors();

    // 背景を確実にクリアして塗りつぶし
    ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);

    // グリッドガイド（薄く表示）
    this._renderGridGuide(ctx, colors);

    // マーカー描画
    if (this.phase === GamePhase.PREVIEW || this.phase === GamePhase.ACTIVE) {
      this._renderMarker(ctx, colors);
    }

    // フィードバック表示
    if (this.phase === GamePhase.FEEDBACK) {
      this._renderFeedback(ctx, colors);
    }

    // ラウンド情報
    this._renderRoundInfo(ctx, colors);

    // 説明テキスト
    this._renderInstructions(ctx, colors);
  }

  /**
   * グリッドガイドを描画
   */
  _renderGridGuide(ctx, colors) {
    ctx.save();

    // 各グリッド位置に薄い円を描画
    for (const pos of this.gridPositions) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, this.settings.markerRadius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = Color.withAlpha(colors.border, 0.2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * マーカーを描画
   */
  _renderMarker(ctx, colors) {
    if (!this.nextPosition && !this.currentPosition) return;

    const pos = this.phase === GamePhase.PREVIEW ? this.nextPosition : this.currentPosition;
    if (!pos) return;

    ctx.save();

    const radius = this.settings.markerRadius;
    const isPreview = this.phase === GamePhase.PREVIEW;

    // メインの円
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);

    if (isPreview) {
      // 予告：薄い円
      ctx.fillStyle = Color.withAlpha(colors.primary, this.markerOpacity);
      ctx.fill();

      // 破線の枠
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = Color.withAlpha(colors.primary, this.markerOpacity * 1.5);
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      // 本表示：濃い円
      ctx.fillStyle = Color.withAlpha(colors.primary, this.markerOpacity);
      ctx.fill();

      // しっかりした枠
      ctx.setLineDash([]);
      ctx.strokeStyle = Color.withAlpha(colors.text, this.markerOpacity);
      ctx.lineWidth = 3;
      ctx.stroke();

      // 中心に小さな円（視線の目標点）
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = Color.withAlpha(colors.background, this.markerOpacity);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * フィードバックを描画
   */
  _renderFeedback(ctx, colors) {
    ctx.save();

    // フェードアウト効果
    const fadeOut = 1 - Easing.easeInQuad(Math.max(0, (this.fadeProgress - 0.7) / 0.3));
    const alpha = fadeOut;

    // メッセージ
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (this.feedbackType === 'success') {
      ctx.fillStyle = Color.withAlpha(colors.success, alpha);
    } else {
      ctx.fillStyle = Color.withAlpha(colors.textSecondary, alpha);
    }

    ctx.fillText(this.feedbackMessage, this.logicalWidth / 2, this.logicalHeight / 2);

    ctx.restore();
  }

  /**
   * ラウンド情報を描画
   */
  _renderRoundInfo(ctx, colors) {
    ctx.save();

    // 進捗表示
    const progress = `${Math.min(this.currentRound + 1, this.settings.totalRounds)} / ${this.settings.totalRounds}`;

    ctx.font = '18px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillStyle = colors.textSecondary;
    ctx.fillText(progress, this.logicalWidth - 20, 20);

    // 正解数
    const successCount = this.results.filter(r => r.success).length;
    ctx.textAlign = 'left';
    ctx.fillText(`できた: ${successCount}`, 20, 20);

    ctx.restore();
  }

  /**
   * 説明テキストを描画
   */
  _renderInstructions(ctx, colors) {
    ctx.save();

    let instruction = '';

    switch (this.phase) {
      case GamePhase.READY:
        instruction = 'スタートをおしてね';
        break;
      case GamePhase.PREVIEW:
        instruction = 'つぎの ばしょを みてね...';
        break;
      case GamePhase.ACTIVE:
        instruction = 'いまだ！クリック または スペースキー';
        break;
      case GamePhase.COMPLETE:
        instruction = 'おわり！よくがんばったね';
        break;
    }

    if (instruction) {
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = colors.text;
      ctx.fillText(instruction, this.logicalWidth / 2, this.logicalHeight - 30);
    }

    ctx.restore();
  }

  /**
   * 一時停止
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * 再開
   */
  resume() {
    this.isPaused = false;
  }

  /**
   * 破棄
   */
  destroy() {
    this.phase = GamePhase.READY;
    this.results = [];
  }

  /**
   * 入力処理
   * @param {Object} event - 入力イベント
   */
  handleInput(event) {
    // ゲーム終了中やポーズ中は無視
    if (this.isPaused || this.phase === GamePhase.COMPLETE) {
      return;
    }

    // main.jsからのイベント形式に対応
    // action: 'action' または 'pointerDown' でアクション判定
    const isActionEvent =
      event.action === 'action' ||
      event.action === 'pointerDown' ||
      event.type === 'click' ||
      event.type === 'touchstart' ||
      (event.code === 'Space' || event.code === 'Enter');

    if (isActionEvent) {
      if (this.phase === GamePhase.ACTIVE) {
        // 本表示中に反応
        const responseTime = performance.now() - this.responseStartTime;
        this._startFeedbackPhase(true, responseTime);
      } else if (this.phase === GamePhase.PREVIEW) {
        // 予告中の反応は無視（急かさない）
        // 何もしない
      }
    }
  }

  /**
   * ゲームが終了したかどうか
   * @returns {boolean}
   */
  isGameFinished() {
    return this.isFinished;
  }

  /**
   * 結果を取得
   * @returns {Object} ゲーム結果
   */
  getResult() {
    const successCount = this.results.filter(r => r.success).length;
    const totalCount = this.results.length;

    // 反応時間の統計（成功したもののみ）
    const successResults = this.results.filter(r => r.success && r.responseTime);
    const avgResponseTime = successResults.length > 0
      ? successResults.reduce((sum, r) => sum + r.responseTime, 0) / successResults.length
      : null;

    return {
      gameId: this.id,
      gameName: this.name,
      pattern: this.settings.pattern,
      totalRounds: this.settings.totalRounds,
      successCount,
      totalCount,
      successRate: totalCount > 0 ? (successCount / totalCount) * 100 : 0,
      avgResponseTime: avgResponseTime ? Math.round(avgResponseTime) : null,
      details: this.results,
      completedAt: new Date().toISOString()
    };
  }

  /**
   * パターン選択肢を取得（設定UI用）
   */
  static getPatternOptions(enableRandom = false) {
    const options = [
      { id: PatternType.HORIZONTAL, name: 'よこ（ひだり・みぎ）' },
      { id: PatternType.VERTICAL, name: 'たて（うえ・した）' },
      { id: PatternType.CENTER_CROSS, name: 'まんなか（ひだり→まんなか→みぎ）' }
    ];

    if (enableRandom) {
      options.push({ id: PatternType.RANDOM, name: 'ランダム（むずかしい）' });
    }

    return options;
  }
}

// パターンタイプのエクスポート
export { PatternType, GamePhase };
