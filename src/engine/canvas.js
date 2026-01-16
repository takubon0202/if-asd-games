/**
 * CanvasScaling - キャンバスのスケーリングと座標変換
 * DPR対応、リサイズ対応、高解像度ディスプレイ対応
 */

export class CanvasScaling {
  /**
   * @param {HTMLCanvasElement} canvas - 対象のcanvas要素
   * @param {Object} options - オプション
   * @param {number} options.logicalWidth - 論理幅（デフォルト: 800）
   * @param {number} options.logicalHeight - 論理高さ（デフォルト: 600）
   * @param {boolean} options.maintainAspectRatio - アスペクト比を維持するか（デフォルト: true）
   */
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.logicalWidth = options.logicalWidth || 800;
    this.logicalHeight = options.logicalHeight || 600;
    this.maintainAspectRatio = options.maintainAspectRatio !== false;

    // スケール情報
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.dpr = 1;

    // リサイズハンドラをバインド
    this._onResize = this._onResize.bind(this);

    // 初期化
    this._updateDpr();
    this.resize();

    // リサイズイベントを監視
    window.addEventListener('resize', this._onResize);
  }

  /**
   * DPR（devicePixelRatio）を更新
   */
  _updateDpr() {
    this.dpr = window.devicePixelRatio || 1;
  }

  /**
   * キャンバスのリサイズ処理
   */
  resize() {
    this._updateDpr();

    const parent = this.canvas.parentElement;
    const containerWidth = parent ? parent.clientWidth : window.innerWidth;
    const containerHeight = parent ? parent.clientHeight : window.innerHeight;

    if (this.maintainAspectRatio) {
      // アスペクト比を維持してスケーリング
      const aspectRatio = this.logicalWidth / this.logicalHeight;
      const containerAspect = containerWidth / containerHeight;

      let displayWidth, displayHeight;

      if (containerAspect > aspectRatio) {
        // コンテナが横長：高さに合わせる
        displayHeight = containerHeight;
        displayWidth = containerHeight * aspectRatio;
      } else {
        // コンテナが縦長：幅に合わせる
        displayWidth = containerWidth;
        displayHeight = containerWidth / aspectRatio;
      }

      this.scale = displayWidth / this.logicalWidth;
      this.offsetX = (containerWidth - displayWidth) / 2;
      this.offsetY = (containerHeight - displayHeight) / 2;

      // CSS上の表示サイズ
      this.canvas.style.width = `${displayWidth}px`;
      this.canvas.style.height = `${displayHeight}px`;
      this.canvas.style.marginLeft = `${this.offsetX}px`;
      this.canvas.style.marginTop = `${this.offsetY}px`;

      // 実際のピクセルサイズ（DPR対応）
      this.canvas.width = Math.round(displayWidth * this.dpr);
      this.canvas.height = Math.round(displayHeight * this.dpr);
    } else {
      // コンテナ全体に拡大
      this.scale = Math.min(
        containerWidth / this.logicalWidth,
        containerHeight / this.logicalHeight
      );
      this.offsetX = 0;
      this.offsetY = 0;

      this.canvas.style.width = `${containerWidth}px`;
      this.canvas.style.height = `${containerHeight}px`;
      this.canvas.width = Math.round(containerWidth * this.dpr);
      this.canvas.height = Math.round(containerHeight * this.dpr);
    }

    // コンテキストのスケーリング設定
    this.ctx.setTransform(this.scale * this.dpr, 0, 0, this.scale * this.dpr, 0, 0);
  }

  /**
   * リサイズイベントハンドラ
   */
  _onResize() {
    this.resize();
  }

  /**
   * 実座標（画面上の座標）から論理座標へ変換
   * @param {number} realX - 実X座標
   * @param {number} realY - 実Y座標
   * @returns {{x: number, y: number}} 論理座標
   */
  realToLogical(realX, realY) {
    return {
      x: (realX - this.offsetX) / this.scale,
      y: (realY - this.offsetY) / this.scale
    };
  }

  /**
   * 論理座標から実座標（画面上の座標）へ変換
   * @param {number} logicalX - 論理X座標
   * @param {number} logicalY - 論理Y座標
   * @returns {{x: number, y: number}} 実座標
   */
  logicalToReal(logicalX, logicalY) {
    return {
      x: logicalX * this.scale + this.offsetX,
      y: logicalY * this.scale + this.offsetY
    };
  }

  /**
   * イベントから論理座標を取得
   * @param {MouseEvent|Touch} event - マウスイベントまたはタッチ
   * @returns {{x: number, y: number}} 論理座標
   */
  getLogicalPosition(event) {
    const rect = this.canvas.getBoundingClientRect();
    const realX = event.clientX - rect.left;
    const realY = event.clientY - rect.top;

    return {
      x: realX / this.scale,
      y: realY / this.scale
    };
  }

  /**
   * 描画コンテキストを取得
   * @returns {CanvasRenderingContext2D}
   */
  getContext() {
    return this.ctx;
  }

  /**
   * 論理サイズを取得
   * @returns {{width: number, height: number}}
   */
  getLogicalSize() {
    return {
      width: this.logicalWidth,
      height: this.logicalHeight
    };
  }

  /**
   * キャンバスをクリア
   * @param {string} [color] - 背景色（省略時は透明）
   */
  clear(color) {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.ctx.restore();
  }

  /**
   * リソースの解放
   */
  destroy() {
    window.removeEventListener('resize', this._onResize);
  }
}
