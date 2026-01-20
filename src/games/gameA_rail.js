/**
 * Game A - 視線レール追視（レールついし）
 * 画面に表示されたレール（線）に沿って移動する点を目で追うゲーム
 * ASD&LD向け「目の動き」トレーニング
 */

import { Easing, Draw, clamp } from '../engine/index.js';
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

    // 論理サイズ（CanvasScalingと同じ値）
    this.logicalWidth = 800;
    this.logicalHeight = 600;

    // ゲーム状態
    this.isRunning = false;
    this.isPaused = false;
    this.isFinished = false;

    // 時間管理
    this.elapsedTime = 0;
    // timeLimit検証：文字列キー、数値直接指定、無効値に対応
    this.timeLimit = this._validateTimeLimit(settings.timeLimit);

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
   * timeLimit値を検証・正規化
   * @param {string|number|undefined} value - 設定値
   * @returns {number} 有効なtimeLimit値
   */
  _validateTimeLimit(value) {
    // 文字列キーの場合
    if (typeof value === 'string' && TIME_LIMITS[value] !== undefined) {
      return TIME_LIMITS[value];
    }
    // 数値が直接渡された場合（正の数のみ許可）
    if (typeof value === 'number' && value > 0) {
      return value;
    }
    // 無効値の場合はデフォルト（medium）
    return TIME_LIMITS.medium;
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

    // 周回処理（whileで堅牢化：dtが大きい場合でも正確に処理）
    while (this.dotProgress >= 1) {
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

    // 背景を確実にクリアして塗りつぶし
    ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);

    // レールを描画
    this._drawRail();

    // 点（ドット）を描画
    this._drawDot();

    // HUD（残り時間・スコア）を描画
    // 注意: HTML HUD（src/ui/hud.js）と重複するためコメントアウト
    // this._drawHUD();
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
    // 二重カウント防止: pointerDown（タッチ/クリック開始）のみに反応
    // action（タッチ終了/Spaceキー）は無視して重複を防ぐ
    const isPointerDownEvent =
      event.action === 'pointerDown' ||
      event.type === 'touchstart';

    // キーボード入力（Spaceキー）は別途処理
    const isSpaceKey =
      event.action === 'action' && event.key === ' ';

    if (isPointerDownEvent || isSpaceKey) {
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
    const width = this.logicalWidth;
    const height = this.logicalHeight;
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
   * シグモイド関数で真のS字カーブを生成
   * 左上から始まり、中央を通過して右下へ向かう形状
   */
  _generateSCurvePath(width, height, padding) {
    const startX = padding;
    const endX = width - padding;
    const centerY = height / 2;
    const amplitude = height * 0.25;  // 上下の振れ幅
    const segments = 200;

    // シグモイド関数でS字カーブを生成
    const sigmoid = (x) => 1 / (1 + Math.exp(-x));

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = startX + (endX - startX) * t;
      // t=0で上端、t=0.5で中央、t=1で下端となるS字カーブ
      // シグモイドの入力を-6〜+6の範囲に変換（十分な傾斜のため）
      const scaledT = (t - 0.5) * 12;
      const normalizedSigmoid = sigmoid(scaledT); // 0→1の範囲
      // 上端から下端へ変化するように反転
      const y = centerY + amplitude * (1 - 2 * normalizedSigmoid);
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

    // 2点間を補間（nullチェック追加）
    const lower = this.railPath[lowerIndex];
    const upper = this.railPath[upperIndex];

    // 安全性チェック: lower/upperがnullの場合は処理をスキップ
    if (!lower || !upper) return;

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

    // レールの線を太く（6px）し、薄い青色で描画
    // テーマのprimary色を薄くして使用
    ctx.globalAlpha = this.showGuide ? 0.4 : 0.25;
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.globalAlpha = 1.0;

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

    // ドットサイズを20%大きくする
    const enlargedSize = this.dotSize * 1.2;

    Draw.circle(ctx, this.dotPosition.x, this.dotPosition.y, enlargedSize);

    // 明るい青色で描画（テーマのprimary色を使用）
    ctx.fillStyle = colors.primary;
    ctx.fill();

    // 白い縁取りを追加（線幅3px）- テーマの背景色を使用
    ctx.strokeStyle = colors.background;
    ctx.lineWidth = 3;
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
      ctx.fillText(`のこり: ${remaining}びょう`, this.logicalWidth - 20, 20);
    }

    // 周回数表示（円の場合）
    if (this.railType === 'circle') {
      ctx.textAlign = 'center';
      ctx.fillText(`${this.lapCount + 1}しゅうめ`, this.logicalWidth / 2, 20);
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
