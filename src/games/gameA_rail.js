/**
 * Game A - 視線レール追視（レールついし）
 * 画面に表示されたレール（線）に沿って移動する点を目で追うゲーム
 * ASD&LD向け「目の動き」トレーニング
 */

import { Easing, Draw, clamp, degToRad } from '../engine/index.js';
import { theme } from '../engine/theme.js';

// レールの種類
const RAIL_TYPES = {
  straight: {
    name: '直線',
    description: 'ひだりからみぎへ'
  },
  sCurve: {
    name: 'S字',
    description: 'くねくねしたせん'
  },
  circle: {
    name: '円',
    description: 'まるいせん'
  }
};

// 速度設定（settings.speedに対応）
const SPEED_MULTIPLIERS = {
  slow: 0.25,
  medium: 0.5,
  fast: 1.0
};

// 点のサイズ（fontSize設定に対応 - 大きいフォント=大きい点）
const DOT_SIZES = {
  medium: 12,
  large: 18
};

// 時間制限オプション
const TIME_LIMITS = {
  short: 30,
  medium: 60,
  unlimited: Infinity
};

/**
 * GameA_Rail - 視線レール追視ゲーム
 */
export class GameA_Rail {
  id = 'gameA';
  name = 'レールついし';
  description = 'うごく まるを めで おいかけよう';

  /**
   * コンストラクタ
   * @param {HTMLCanvasElement} canvas - キャンバス要素
   * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
   * @param {Object} settings - ゲーム設定
   */
  constructor(canvas, ctx, settings) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.settings = settings;

    // ゲーム状態
    this.isRunning = false;
    this.isPaused = false;
    this.isFinished = false;

    // 時間管理
    this.elapsedTime = 0;
    this.timeLimit = TIME_LIMITS[settings.timeLimit] || TIME_LIMITS.medium;

    // レール設定
    this.railType = settings.railType || 'straight';
    this.railPath = [];
    this.railLength = 0;

    // 点（ドット）の状態
    this.dotProgress = 0;  // 0〜1でレール上の位置
    this.dotPosition = { x: 0, y: 0 };
    this.dotSize = DOT_SIZES[settings.fontSize] || DOT_SIZES.medium;

    // 速度（1周するのにかかる秒数の基準を決め、multiplierで調整）
    const baseLoopTime = 8;  // 基準：8秒で1周
    this.speedMultiplier = SPEED_MULTIPLIERS[settings.speed] || SPEED_MULTIPLIERS.medium;
    this.loopTime = baseLoopTime / this.speedMultiplier;

    // スコア管理
    this.score = 0;
    this.checkCount = 0;
    this.successCount = 0;

    // 中間地点判定用
    this.middleZoneStart = 0.4;
    this.middleZoneEnd = 0.6;

    // ガイド表示
    this.showGuide = settings.guide !== false;

    // イージング関数（滑らかな動き用）
    this.easingFunc = Easing.linear;

    // 周回カウント
    this.lapCount = 0;
    this.maxLaps = this.timeLimit === Infinity ? Infinity : Math.ceil(this.timeLimit / this.loopTime);
  }

  /**
   * 初期化
   */
  init() {
    // レールパスを生成
    this._generateRailPath();

    // 点を開始位置に配置
    this.dotProgress = 0;
    this._updateDotPosition();

    // 状態リセット
    this.score = 0;
    this.checkCount = 0;
    this.successCount = 0;
    this.elapsedTime = 0;
    this.lapCount = 0;
    this.isFinished = false;
  }

  /**
   * ゲーム開始
   */
  start() {
    this.isRunning = true;
    this.isPaused = false;
  }

  /**
   * 更新処理
   * @param {number} dt - デルタタイム（秒）
   */
  update(dt) {
    if (!this.isRunning || this.isPaused || this.isFinished) {
      return;
    }

    // 経過時間を更新
    this.elapsedTime += dt;

    // 時間制限チェック
    if (this.timeLimit !== Infinity && this.elapsedTime >= this.timeLimit) {
      this.isFinished = true;
      return;
    }

    // 点の進行度を更新
    const progressDelta = dt / this.loopTime;
    this.dotProgress += progressDelta;

    // 周回処理
    if (this.dotProgress >= 1) {
      this.dotProgress -= 1;
      this.lapCount++;

      // 円以外のレールでは端到達で方向反転の代わりに再スタート
      if (this.railType !== 'circle' && this.maxLaps !== Infinity && this.lapCount >= this.maxLaps) {
        this.isFinished = true;
        return;
      }
    }

    // 点の位置を更新
    this._updateDotPosition();
  }

  /**
   * 描画処理
   */
  render() {
    const ctx = this.ctx;
    const colors = theme.getColors();

    // 背景を塗りつぶし
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // レールを描画
    this._drawRail();

    // 点（ドット）を描画
    this._drawDot();

    // HUD（残り時間・スコア）を描画
    this._drawHUD();
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
   * クリーンアップ
   */
  destroy() {
    this.isRunning = false;
    this.isPaused = false;
  }

  /**
   * 入力処理
   * @param {Object} event - 入力イベント
   */
  handleInput(event) {
    if (!this.isRunning || this.isPaused || this.isFinished) {
      return;
    }

    // main.jsからのイベント形式に対応
    // action: 'action' または 'pointerDown' でアクション判定
    const isActionEvent =
      event.action === 'action' ||
      event.action === 'pointerDown' ||
      event.type === 'click' ||
      event.type === 'touchstart' ||
      (event.type === 'keydown' && event.key === ' ');

    if (isActionEvent) {
      this._checkMiddleZone();
    }
  }

  /**
   * 結果取得
   * @returns {Object} ゲーム結果
   */
  getResult() {
    return {
      gameId: this.id,
      gameName: this.name,
      score: this.score,
      checkCount: this.checkCount,
      successCount: this.successCount,
      accuracy: this.checkCount > 0 ? Math.round((this.successCount / this.checkCount) * 100) : 0,
      lapCount: this.lapCount,
      elapsedTime: Math.floor(this.elapsedTime),
      railType: this.railType,
      railTypeName: RAIL_TYPES[this.railType].name,
      speed: this.settings.speed,
      finished: this.isFinished
    };
  }

  /**
   * レールパスを生成（内部メソッド）
   */
  _generateRailPath() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const padding = 60;

    this.railPath = [];

    switch (this.railType) {
      case 'straight':
        this._generateStraightPath(width, height, padding);
        break;
      case 'sCurve':
        this._generateSCurvePath(width, height, padding);
        break;
      case 'circle':
        this._generateCirclePath(width, height, padding);
        break;
      default:
        this._generateStraightPath(width, height, padding);
    }

    // レール全長を計算
    this._calculateRailLength();
  }

  /**
   * 直線レールパス生成
   */
  _generateStraightPath(width, height, padding) {
    const y = height / 2;
    const startX = padding;
    const endX = width - padding;
    const segments = 100;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      this.railPath.push({
        x: startX + (endX - startX) * t,
        y: y
      });
    }
  }

  /**
   * S字カーブレールパス生成
   */
  _generateSCurvePath(width, height, padding) {
    const startX = padding;
    const endX = width - padding;
    const centerY = height / 2;
    const amplitude = height * 0.25;  // 上下の振れ幅
    const segments = 200;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = startX + (endX - startX) * t;
      // S字カーブ：sin関数を使用
      const y = centerY + Math.sin(t * Math.PI * 2) * amplitude;
      this.railPath.push({ x, y });
    }
  }

  /**
   * 円形レールパス生成
   */
  _generateCirclePath(width, height, padding) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - padding;
    const segments = 200;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2 - Math.PI / 2;  // 上から開始
      this.railPath.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    }
  }

  /**
   * レール全長を計算
   */
  _calculateRailLength() {
    this.railLength = 0;
    for (let i = 1; i < this.railPath.length; i++) {
      const dx = this.railPath[i].x - this.railPath[i - 1].x;
      const dy = this.railPath[i].y - this.railPath[i - 1].y;
      this.railLength += Math.sqrt(dx * dx + dy * dy);
    }
  }

  /**
   * 点の位置を更新
   */
  _updateDotPosition() {
    if (this.railPath.length === 0) return;

    // 進行度に応じてレールパス上の位置を取得
    const progress = clamp(this.dotProgress, 0, 0.9999);
    const index = progress * (this.railPath.length - 1);
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.min(lowerIndex + 1, this.railPath.length - 1);
    const fraction = index - lowerIndex;

    // 2点間を補間
    const lower = this.railPath[lowerIndex];
    const upper = this.railPath[upperIndex];

    this.dotPosition = {
      x: lower.x + (upper.x - lower.x) * fraction,
      y: lower.y + (upper.y - lower.y) * fraction
    };
  }

  /**
   * レールを描画
   */
  _drawRail() {
    const ctx = this.ctx;
    const colors = theme.getColors();

    if (this.railPath.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(this.railPath[0].x, this.railPath[0].y);

    for (let i = 1; i < this.railPath.length; i++) {
      ctx.lineTo(this.railPath[i].x, this.railPath[i].y);
    }

    // ガイド表示に応じて線の濃さを変更
    ctx.strokeStyle = this.showGuide
      ? colors.textSecondary
      : colors.border;
    ctx.lineWidth = this.showGuide ? 4 : 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 中間地点のゾーンを薄く表示（ガイドONの場合）
    if (this.showGuide) {
      this._drawMiddleZone();
    }
  }

  /**
   * 中間地点ゾーンを描画
   */
  _drawMiddleZone() {
    const ctx = this.ctx;
    const colors = theme.getColors();

    const startIndex = Math.floor(this.middleZoneStart * (this.railPath.length - 1));
    const endIndex = Math.floor(this.middleZoneEnd * (this.railPath.length - 1));

    ctx.beginPath();
    ctx.moveTo(this.railPath[startIndex].x, this.railPath[startIndex].y);

    for (let i = startIndex + 1; i <= endIndex; i++) {
      ctx.lineTo(this.railPath[i].x, this.railPath[i].y);
    }

    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  }

  /**
   * 点（ドット）を描画
   */
  _drawDot() {
    const ctx = this.ctx;
    const colors = theme.getColors();

    Draw.circle(ctx, this.dotPosition.x, this.dotPosition.y, this.dotSize);
    ctx.fillStyle = colors.primary;
    ctx.fill();

    // 点の周りに薄い縁取り
    ctx.strokeStyle = colors.text;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /**
   * HUD（ヘッドアップディスプレイ）を描画
   */
  _drawHUD() {
    const ctx = this.ctx;
    const colors = theme.getColors();
    const fontSize = this.settings.fontSize === 'large' ? 24 : 18;

    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = colors.text;

    // スコア表示
    ctx.fillText(`スコア: ${this.score}`, 20, 20);

    // 残り時間表示（制限がある場合）
    if (this.timeLimit !== Infinity) {
      const remaining = Math.max(0, Math.ceil(this.timeLimit - this.elapsedTime));
      ctx.textAlign = 'right';
      ctx.fillText(`のこり: ${remaining}びょう`, this.canvas.width - 20, 20);
    }

    // 周回数表示（円の場合）
    if (this.railType === 'circle') {
      ctx.textAlign = 'center';
      ctx.fillText(`${this.lapCount + 1}しゅうめ`, this.canvas.width / 2, 20);
    }
  }

  /**
   * 中間地点チェック
   */
  _checkMiddleZone() {
    this.checkCount++;

    // 点が中間地点ゾーン内にいるかチェック
    const isInMiddleZone =
      this.dotProgress >= this.middleZoneStart &&
      this.dotProgress <= this.middleZoneEnd;

    if (isInMiddleZone) {
      this.score++;
      this.successCount++;
    }
  }

  /**
   * レールの種類を変更
   * @param {string} railType - レールの種類
   */
  setRailType(railType) {
    if (RAIL_TYPES[railType]) {
      this.railType = railType;
      this._generateRailPath();
      this.dotProgress = 0;
      this._updateDotPosition();
    }
  }

  /**
   * 利用可能なレールの種類を取得
   * @returns {Object}
   */
  static getRailTypes() {
    return RAIL_TYPES;
  }

  /**
   * ゲームが終了したかどうか
   * @returns {boolean}
   */
  isGameFinished() {
    return this.isFinished;
  }
}

// デフォルトエクスポート
export default GameA_Rail;
