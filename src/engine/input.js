/**
 * InputRouter - 入力イベントの統合管理
 * mouse/touch/keyboard統合、イベントの正規化
 */

export class InputRouter {
  /**
   * @param {HTMLElement} element - イベントを監視する要素
   * @param {Object} options - オプション
   * @param {function} options.getLogicalPosition - 座標変換関数
   */
  constructor(element, options = {}) {
    this.element = element;
    this.getLogicalPosition = options.getLogicalPosition || ((e) => ({ x: e.clientX, y: e.clientY }));

    // イベントリスナーの登録先
    this.listeners = {
      action: [],       // Space, クリック, タップ
      retry: [],        // R
      escape: [],       // Esc
      pointer: [],      // ポインター移動
      pointerDown: [],  // ポインター押下
      pointerUp: [],    // ポインター解放
      keyDown: [],      // 任意のキー押下
      keyUp: []         // 任意のキー解放
    };

    // 現在の入力状態
    this.pointerPosition = { x: 0, y: 0 };
    this.isPointerDown = false;
    this.pressedKeys = new Set();

    // イベントハンドラをバインド
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);

    // イベントリスナーを登録
    this._attachEvents();
  }

  /**
   * イベントリスナーを登録
   */
  _attachEvents() {
    // マウスイベント
    this.element.addEventListener('mousemove', this._onMouseMove);
    this.element.addEventListener('mousedown', this._onMouseDown);
    this.element.addEventListener('mouseup', this._onMouseUp);
    this.element.addEventListener('click', this._onClick);

    // タッチイベント
    this.element.addEventListener('touchstart', this._onTouchStart, { passive: false });
    this.element.addEventListener('touchmove', this._onTouchMove, { passive: false });
    this.element.addEventListener('touchend', this._onTouchEnd);

    // キーボードイベント（documentで監視）
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
  }

  /**
   * イベントリスナーを解除
   */
  _detachEvents() {
    this.element.removeEventListener('mousemove', this._onMouseMove);
    this.element.removeEventListener('mousedown', this._onMouseDown);
    this.element.removeEventListener('mouseup', this._onMouseUp);
    this.element.removeEventListener('click', this._onClick);

    this.element.removeEventListener('touchstart', this._onTouchStart);
    this.element.removeEventListener('touchmove', this._onTouchMove);
    this.element.removeEventListener('touchend', this._onTouchEnd);

    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
  }

  /**
   * 正規化されたイベントオブジェクトを作成
   * @param {string} type - イベントタイプ
   * @param {Object} data - イベントデータ
   * @returns {Object}
   */
  _createEvent(type, data = {}) {
    return {
      type,
      timestamp: performance.now(),
      position: { ...this.pointerPosition },
      ...data
    };
  }

  /**
   * リスナーを呼び出し
   * @param {string} type - イベントタイプ
   * @param {Object} event - イベントオブジェクト
   */
  _emit(type, event) {
    const listeners = this.listeners[type] || [];
    for (const listener of listeners) {
      listener(event);
    }
  }

  // マウスイベントハンドラ
  _onMouseMove(e) {
    this.pointerPosition = this.getLogicalPosition(e);
    this._emit('pointer', this._createEvent('pointer'));
  }

  _onMouseDown(e) {
    this.isPointerDown = true;
    this.pointerPosition = this.getLogicalPosition(e);
    this._emit('pointerDown', this._createEvent('pointerDown', { button: e.button }));
  }

  _onMouseUp(e) {
    this.isPointerDown = false;
    this.pointerPosition = this.getLogicalPosition(e);
    this._emit('pointerUp', this._createEvent('pointerUp', { button: e.button }));
  }

  _onClick(e) {
    this.pointerPosition = this.getLogicalPosition(e);
    this._emit('action', this._createEvent('action', { source: 'mouse' }));
  }

  // タッチイベントハンドラ
  _onTouchStart(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
      this.isPointerDown = true;
      this.pointerPosition = this.getLogicalPosition(e.touches[0]);
      this._emit('pointerDown', this._createEvent('pointerDown', { source: 'touch' }));
    }
  }

  _onTouchMove(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
      this.pointerPosition = this.getLogicalPosition(e.touches[0]);
      this._emit('pointer', this._createEvent('pointer', { source: 'touch' }));
    }
  }

  _onTouchEnd(e) {
    this.isPointerDown = false;
    this._emit('pointerUp', this._createEvent('pointerUp', { source: 'touch' }));
    this._emit('action', this._createEvent('action', { source: 'touch' }));
  }

  // キーボードイベントハンドラ
  _onKeyDown(e) {
    // 既に押されている場合はスキップ（リピート防止）
    if (this.pressedKeys.has(e.code)) return;

    this.pressedKeys.add(e.code);

    // 汎用キーダウンイベント
    this._emit('keyDown', this._createEvent('keyDown', {
      key: e.key,
      code: e.code,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey
    }));

    // 特定キーのイベント
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        this._emit('action', this._createEvent('action', { source: 'keyboard', key: 'Space' }));
        break;
      case 'KeyR':
        this._emit('retry', this._createEvent('retry'));
        break;
      case 'Escape':
        this._emit('escape', this._createEvent('escape'));
        break;
    }
  }

  _onKeyUp(e) {
    this.pressedKeys.delete(e.code);

    this._emit('keyUp', this._createEvent('keyUp', {
      key: e.key,
      code: e.code
    }));
  }

  /**
   * イベントリスナーを登録
   * @param {string} type - イベントタイプ
   * @param {function} callback - コールバック関数
   * @returns {function} 登録解除関数
   */
  on(type, callback) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);

    // 登録解除関数を返す
    return () => this.off(type, callback);
  }

  /**
   * イベントリスナーを解除
   * @param {string} type - イベントタイプ
   * @param {function} callback - コールバック関数
   */
  off(type, callback) {
    if (!this.listeners[type]) return;

    const index = this.listeners[type].indexOf(callback);
    if (index !== -1) {
      this.listeners[type].splice(index, 1);
    }
  }

  /**
   * 現在のポインター位置を取得
   * @returns {{x: number, y: number}}
   */
  getPointerPosition() {
    return { ...this.pointerPosition };
  }

  /**
   * ポインターが押下中かどうか
   * @returns {boolean}
   */
  getIsPointerDown() {
    return this.isPointerDown;
  }

  /**
   * 特定のキーが押下中かどうか
   * @param {string} code - キーコード
   * @returns {boolean}
   */
  isKeyPressed(code) {
    return this.pressedKeys.has(code);
  }

  /**
   * リソースの解放
   */
  destroy() {
    this._detachEvents();
    this.listeners = {};
    this.pressedKeys.clear();
  }
}
