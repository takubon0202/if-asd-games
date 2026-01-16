/**
 * GameLoop - ゲームループ管理
 * requestAnimationFrame使用、フレームレート制御、pause/resume機能
 */

export class GameLoop {
  /**
   * @param {Object} options - オプション
   * @param {number} options.targetFps - 目標FPS（デフォルト: 30、刺激軽減のため）
   * @param {function} options.update - 更新コールバック (deltaTime) => void
   * @param {function} options.render - 描画コールバック () => void
   */
  constructor(options = {}) {
    this.targetFps = options.targetFps || 30;
    this.updateCallback = options.update || (() => {});
    this.renderCallback = options.render || (() => {});

    // 時間管理
    this.frameInterval = 1000 / this.targetFps;
    this.lastFrameTime = 0;
    this.deltaTime = 0;
    this.elapsedTime = 0;
    this.frameCount = 0;

    // 状態
    this.isRunning = false;
    this.isPaused = false;
    this.animationFrameId = null;

    // FPS計測用
    this.fpsUpdateInterval = 1000;
    this.lastFpsUpdate = 0;
    this.currentFps = 0;
    this.framesSinceLastFpsUpdate = 0;

    // ループ関数をバインド
    this._loop = this._loop.bind(this);
  }

  /**
   * メインループ
   * @param {number} timestamp - 現在のタイムスタンプ
   */
  _loop(timestamp) {
    if (!this.isRunning) return;

    this.animationFrameId = requestAnimationFrame(this._loop);

    // 初回フレームの初期化
    if (this.lastFrameTime === 0) {
      this.lastFrameTime = timestamp;
      this.lastFpsUpdate = timestamp;
      return;
    }

    // フレームレート制御
    const timeSinceLastFrame = timestamp - this.lastFrameTime;

    if (timeSinceLastFrame < this.frameInterval) {
      return;
    }

    // deltaTimeを計算（秒単位）
    this.deltaTime = timeSinceLastFrame / 1000;

    // 大きすぎるdeltaTimeを制限（タブ非表示からの復帰など）
    if (this.deltaTime > 0.1) {
      this.deltaTime = 0.1;
    }

    this.lastFrameTime = timestamp;
    this.frameCount++;

    // FPS計測
    this.framesSinceLastFpsUpdate++;
    if (timestamp - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      this.currentFps = Math.round(
        (this.framesSinceLastFpsUpdate * 1000) / (timestamp - this.lastFpsUpdate)
      );
      this.lastFpsUpdate = timestamp;
      this.framesSinceLastFpsUpdate = 0;
    }

    // 一時停止中でなければ更新
    if (!this.isPaused) {
      this.elapsedTime += this.deltaTime;
      this.updateCallback(this.deltaTime);
    }

    // 描画は常に実行（一時停止画面の表示など）
    this.renderCallback();
  }

  /**
   * ゲームループを開始
   */
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;
    this.lastFrameTime = 0;
    this.elapsedTime = 0;
    this.frameCount = 0;

    this.animationFrameId = requestAnimationFrame(this._loop);
  }

  /**
   * ゲームループを停止
   */
  stop() {
    this.isRunning = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
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
   * 一時停止/再開をトグル
   */
  togglePause() {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  /**
   * 目標FPSを設定
   * @param {number} fps - 目標FPS
   */
  setTargetFps(fps) {
    this.targetFps = fps;
    this.frameInterval = 1000 / fps;
  }

  /**
   * 現在のFPSを取得
   * @returns {number}
   */
  getFps() {
    return this.currentFps;
  }

  /**
   * 経過時間を取得（秒）
   * @returns {number}
   */
  getElapsedTime() {
    return this.elapsedTime;
  }

  /**
   * フレーム数を取得
   * @returns {number}
   */
  getFrameCount() {
    return this.frameCount;
  }

  /**
   * 実行中かどうか
   * @returns {boolean}
   */
  getIsRunning() {
    return this.isRunning;
  }

  /**
   * 一時停止中かどうか
   * @returns {boolean}
   */
  getIsPaused() {
    return this.isPaused;
  }

  /**
   * コールバックを設定
   * @param {function} update - 更新コールバック
   * @param {function} render - 描画コールバック
   */
  setCallbacks(update, render) {
    if (update) this.updateCallback = update;
    if (render) this.renderCallback = render;
  }

  /**
   * リソースの解放
   */
  destroy() {
    this.stop();
  }
}
