/**
 * ASD&LD向け「目の動き」トレーニングWebゲーム
 * アプリケーション エントリーポイント
 */

// エンジンモジュール
import {
  CanvasScaling,
  GameLoop,
  InputRouter,
  storage,
  stateMachine,
  GameState,
  theme,
  audio
} from './engine/index.js';

// UIモジュール
import { uiManager, gameHUD } from './ui/index.js';

// ゲームモジュール（src/games/index.jsから一元管理）
import { GameList, getGameClass } from './games/index.js';

/**
 * App - アプリケーション全体を統合するメインクラス
 */
class App {
  constructor() {
    // コアシステム
    this.canvasScaling = null;
    this.gameLoop = null;
    this.inputRouter = null;

    // ゲーム管理
    this.currentGame = null;
    this.loadedGameModules = new Map();

    // Canvas要素
    this.canvas = null;
    this.ctx = null;

    // 状態
    this.isInitialized = false;

    // イベントハンドラをバインド
    this._handleStateChange = this._handleStateChange.bind(this);
    this._handleResize = this._handleResize.bind(this);
    this._handleVisibilityChange = this._handleVisibilityChange.bind(this);
    this._handleGlobalKeyDown = this._handleGlobalKeyDown.bind(this);
    this._handleBeforeUnload = this._handleBeforeUnload.bind(this);
  }

  /**
   * アプリケーションを初期化
   */
  async init() {
    if (this.isInitialized) {
      console.warn('App is already initialized');
      return;
    }

    try {
      console.log('Initializing Eye Training Game...');

      // 1. 設定を読み込み
      this._loadSettings();

      // 2. Canvas初期化
      this._setupCanvas();

      // 3. ゲームループ初期化
      this._setupGameLoop();

      // 4. 入力ハンドラ初期化
      this._setupInput();

      // 5. UI初期化
      this._setupUI();

      // 6. 状態管理リスナー設定
      this._setupStateListeners();

      // 7. グローバルイベント設定
      this._setupGlobalEvents();

      // 初期化完了
      this.isInitialized = true;

      // 初期状態を表示（HOME）
      stateMachine.forceState(GameState.HOME);

      console.log('Eye Training Game initialized successfully');

    } catch (error) {
      console.error('Failed to initialize app:', error);
      this._showError('アプリの初期化に失敗しました');
    }
  }

  /**
   * 設定を読み込み・適用
   */
  _loadSettings() {
    try {
      const settings = storage.getSettings();

      // テーマを適用
      theme.apply({
        theme: settings.theme || 'white',
        contrast: settings.contrast || 'medium',
        fontSize: settings.fontSize || 'medium'
      });

      // オーディオ設定を適用
      audio.applyFromSettings(settings.sound || false);

      console.log('Settings loaded:', settings);

    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  /**
   * Canvasを初期化
   */
  _setupCanvas() {
    // Canvas要素を取得または作成
    this.canvas = document.getElementById('game-canvas');

    if (!this.canvas) {
      // Canvas要素が存在しない場合は作成
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'game-canvas';
      this.canvas.setAttribute('role', 'img');
      this.canvas.setAttribute('aria-label', 'ゲームキャンバス');

      // Canvas用コンテナを取得または作成
      let container = document.querySelector('.canvas-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'canvas-container';
        container.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 50;
          display: none;
        `;
        document.body.appendChild(container);
      }
      container.appendChild(this.canvas);
    }

    // CanvasScaling初期化
    this.canvasScaling = new CanvasScaling(this.canvas, {
      logicalWidth: 800,
      logicalHeight: 600,
      maintainAspectRatio: true
    });

    this.ctx = this.canvasScaling.getContext();

    console.log('Canvas initialized');
  }

  /**
   * ゲームループを初期化
   */
  _setupGameLoop() {
    this.gameLoop = new GameLoop({
      targetFps: 30,  // ASD向けに低FPS（刺激軽減）
      update: (deltaTime) => this._update(deltaTime),
      render: () => this._render()
    });

    console.log('Game loop initialized');
  }

  /**
   * 入力ハンドラを初期化
   */
  _setupInput() {
    this.inputRouter = new InputRouter(this.canvas, {
      getLogicalPosition: (e) => this.canvasScaling.getLogicalPosition(e)
    });

    // すべての入力イベントをhandleInputに統一
    // アクションイベント（Space, クリック, タップ）
    this.inputRouter.on('action', (event) => {
      if (this.currentGame && typeof this.currentGame.handleInput === 'function') {
        this.currentGame.handleInput({
          type: event.type || 'action',
          action: 'action',
          key: event.key || ' ',
          code: event.code || 'Space',
          position: event.position || null,
          timestamp: Date.now()
        });
      }
    });

    // ポインター押下（クリック/タップ）
    this.inputRouter.on('pointerDown', (event) => {
      if (this.currentGame && typeof this.currentGame.handleInput === 'function') {
        this.currentGame.handleInput({
          type: 'click',
          action: 'pointerDown',
          position: event.position || { x: 0, y: 0 },
          timestamp: Date.now()
        });
      }
    });

    // ポインター移動
    this.inputRouter.on('pointer', (event) => {
      if (this.currentGame && typeof this.currentGame.handleInput === 'function') {
        this.currentGame.handleInput({
          type: 'pointermove',
          action: 'pointer',
          position: event.position || { x: 0, y: 0 },
          timestamp: Date.now()
        });
      }
    });

    // ポインター解放
    this.inputRouter.on('pointerUp', (event) => {
      if (this.currentGame && typeof this.currentGame.handleInput === 'function') {
        this.currentGame.handleInput({
          type: 'pointerup',
          action: 'pointerUp',
          position: event.position || { x: 0, y: 0 },
          timestamp: Date.now()
        });
      }
    });

    console.log('Input router initialized');
  }

  /**
   * UIを初期化
   */
  _setupUI() {
    // UIマネージャーを初期化
    uiManager.init();

    console.log('UI initialized');
  }

  /**
   * 状態管理リスナーを設定
   */
  _setupStateListeners() {
    // 状態変更を購読
    this._stateUnsubscribe = stateMachine.subscribe(this._handleStateChange);

    console.log('State listeners initialized');
  }

  /**
   * グローバルイベントを設定
   */
  _setupGlobalEvents() {
    // ウィンドウリサイズ
    window.addEventListener('resize', this._handleResize);

    // タブ表示/非表示
    document.addEventListener('visibilitychange', this._handleVisibilityChange);

    // グローバルキーボードショートカット（バブリング段階で処理）
    document.addEventListener('keydown', this._handleGlobalKeyDown);

    // ページ離脱前に記録を保存
    window.addEventListener('beforeunload', this._handleBeforeUnload);

    console.log('Global events initialized');
  }

  /**
   * ページ離脱時のハンドラ
   */
  _handleBeforeUnload() {
    this._saveOnExit();
  }

  /**
   * 状態変更ハンドラ
   */
  async _handleStateChange(event) {
    if (event.type !== 'stateChange') return;

    const { oldState, newState, data } = event;

    console.log(`State change: ${oldState} -> ${newState}`, data);

    // Canvas表示の切り替え
    const canvasContainer = this.canvas.parentElement;

    switch (newState) {
      case GameState.PLAYING:
        // ゲーム開始
        if (canvasContainer) {
          canvasContainer.style.display = 'block';
        }
        await this._startGame(stateMachine.getCurrentGame());
        break;

      case GameState.PAUSED:
        // 一時停止
        if (this.gameLoop) {
          this.gameLoop.pause();
        }
        break;

      case GameState.RESULT:
        // 結果表示
        if (canvasContainer) {
          canvasContainer.style.display = 'none';
        }
        this._endGame();
        break;

      case GameState.HOME:
      case GameState.SETTINGS:
      case GameState.HELP:
        // 非ゲーム画面
        if (canvasContainer) {
          canvasContainer.style.display = 'none';
        }
        this._endGame();
        break;
    }

    // PAUSEDから復帰
    if (oldState === GameState.PAUSED && newState === GameState.PLAYING) {
      if (this.gameLoop) {
        this.gameLoop.resume();
      }
    }
  }

  /**
   * ゲームを開始
   * @param {string} gameId - ゲームID
   */
  async _startGame(gameId) {
    if (this.isGameLoading) {
      console.warn('Game is already loading, ignoring request');
      return;
    }

    // GameListからゲーム情報を取得
    const gameInfo = GameList.find(g => g.id === gameId);
    if (!gameId || !gameInfo) {
      console.error('Invalid game ID:', gameId);
      stateMachine.goHome();
      return;
    }

    try {
      this.isGameLoading = true;
      console.log(`Starting game: ${gameId}`);

      // 既存のゲームを終了
      if (this.currentGame) {
        this._endGame();
      }

      // ゲームモジュールをロード（未ロードの場合）
      let GameClass = this.loadedGameModules.get(gameId);

      if (!GameClass) {
        try {
          // src/games/index.jsのgetGameClass関数を使用
          GameClass = await getGameClass(gameId);
          this.loadedGameModules.set(gameId, GameClass);

          // 競合状態防止: ロード中に状態が変わっていないか確認
          if (!stateMachine.is(GameState.PLAYING)) {
            console.log('Game loading cancelled: state changed during load');
            return;
          }
        } catch (importError) {
          console.error(`Failed to load game module: ${gameId}`, importError);
          this._showError(`ゲームの読み込みに失敗しました: ${gameInfo.name}`);
          stateMachine.goHome();
          return;
        }
      }

      // キャンバスをリサイズ（コンテナが表示された後に実行）
      this.canvasScaling.resize();

      // 設定を取得
      const settings = storage.getSettings();

      // ゲームインスタンスを作成（位置指定引数で渡す）
      this.currentGame = new GameClass(this.canvas, this.ctx, settings);

      // ゲームを初期化
      if (typeof this.currentGame.init === 'function') {
        await this.currentGame.init();
      }

      // ゲームを開始
      if (typeof this.currentGame.start === 'function') {
        this.currentGame.start();
      }

      // ゲームループを開始
      this.gameLoop.start();

      // HUDを初期化
      gameHUD.reset();

      // 開始音を再生
      audio.play('start');

      console.log(`Game ${gameId} started`);

    } catch (error) {
      console.error('Failed to start game:', error);
      this._showError('ゲームの開始に失敗しました');
      stateMachine.goHome();
    } finally {
      this.isGameLoading = false;
    }
  }

  /**
   * ゲームを終了
   */
  _endGame() {
    if (this.gameLoop) {
      this.gameLoop.stop();
    }

    if (this.currentGame) {
      if (typeof this.currentGame.destroy === 'function') {
        this.currentGame.destroy();
      }
      this.currentGame = null;
    }

    console.log('Game ended');
  }

  /**
   * ゲーム完了ハンドラ
   * @param {Object} result - ゲーム結果
   */
  _onGameComplete(result) {
    console.log('Game complete:', result);

    // 結果画面に遷移
    stateMachine.showResult(result);
  }

  /**
   * 更新処理
   * @param {number} deltaTime - 経過時間（秒）
   */
  _update(deltaTime) {
    if (!stateMachine.is(GameState.PLAYING)) return;

    if (this.currentGame) {
      // ゲームを更新
      if (typeof this.currentGame.update === 'function') {
        this.currentGame.update(deltaTime);
      }

      // HUDを更新（スコアと時間）
      if (this.currentGame.score !== undefined) {
        gameHUD.updateScore(this.currentGame.score);
      }
      if (this.currentGame.elapsedTime !== undefined) {
        const remaining = (this.currentGame.timeLimit || 60) - this.currentGame.elapsedTime;
        gameHUD.updateTime(Math.max(0, Math.ceil(remaining)));
      }

      // ゲーム完了をチェック（isGameFinished()メソッドを優先使用）
      const isFinished = typeof this.currentGame.isGameFinished === 'function'
        ? this.currentGame.isGameFinished()
        : this.currentGame.isFinished;
      if (isFinished) {
        this._onGameComplete(this.currentGame.getResult ? this.currentGame.getResult() : {});
      }
    }
  }

  /**
   * 描画処理
   */
  _render() {
    // Canvasをクリア
    const bgColor = theme.getCanvasColor('background');
    this.canvasScaling.clear(bgColor);

    // ゲームの描画
    if (this.currentGame && typeof this.currentGame.render === 'function') {
      this.currentGame.render(this.ctx);
    }

    // 一時停止中の表示
    if (stateMachine.is(GameState.PAUSED)) {
      this._renderPauseOverlay();
    }
  }

  /**
   * 一時停止オーバーレイを描画
   */
  _renderPauseOverlay() {
    const { width, height } = this.canvasScaling.getLogicalSize();

    // 半透明のオーバーレイ
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, width, height);

    // テキスト（HUDで表示しているので省略可）
  }

  /**
   * リサイズハンドラ
   */
  _handleResize() {
    if (this.canvasScaling) {
      this.canvasScaling.resize();
    }

    if (this.currentGame && typeof this.currentGame.onResize === 'function') {
      this.currentGame.onResize(this.canvasScaling.getLogicalSize());
    }
  }

  /**
   * タブ表示/非表示ハンドラ
   */
  _handleVisibilityChange() {
    if (document.hidden) {
      // タブが非表示になった場合
      if (stateMachine.is(GameState.PLAYING)) {
        // ゲーム中なら一時停止
        stateMachine.pause();
        console.log('Game paused due to tab visibility');
      }
    }
    // タブが表示に戻った場合は自動再開しない（ユーザー操作に任せる）
  }

  /**
   * グローバルキーボードハンドラ
   */
  _handleGlobalKeyDown(event) {
    // 入力フォーム内では処理しない
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    // ゲーム中のグローバルショートカット
    if (stateMachine.is(GameState.PLAYING)) {
      switch (event.code) {
        case 'KeyR':
          // リトライ（ゲーム中は無効化、結果画面で有効）
          break;
      }
    }

    // 結果画面でのショートカット
    if (stateMachine.is(GameState.RESULT)) {
      switch (event.code) {
        case 'KeyR':
          // リトライ - resultScreen内で処理
          break;
      }
    }
  }

  /**
   * 終了時の保存処理
   */
  _saveOnExit() {
    try {
      // 現在のゲームが進行中なら結果を記録
      if (this.currentGame && stateMachine.is(GameState.PLAYING)) {
        const gameName = stateMachine.getCurrentGame();
        if (gameName) {
          storage.recordSession(gameName, {
            interrupted: true,
            time: this.gameLoop ? this.gameLoop.getElapsedTime() : 0
          });
        }
      }
      console.log('Session saved on exit');
    } catch (error) {
      console.error('Failed to save on exit:', error);
    }
  }

  /**
   * エラーメッセージを表示（ASD/LD配慮：優しい表現）
   * @param {string} message - エラーメッセージ
   */
  _showError(message) {
    console.error(message);

    // 既存のエラー通知を削除
    const existingError = document.querySelector('.error-notification');
    if (existingError) {
      existingError.remove();
    }

    // エラー通知要素を作成
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.setAttribute('aria-live', 'assertive');
    errorDiv.innerHTML = `
      <span class="error-icon" aria-hidden="true">⚠️</span>
      <span class="error-message">${message || 'エラーがおきました'}</span>
      <button class="error-close" aria-label="とじる">×</button>
    `;

    // スタイルを適用
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #FFF3E0;
      color: #E65100;
      padding: 16px 24px;
      border-radius: 12px;
      font-size: 16px;
      font-family: inherit;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 12px;
      border: 2px solid #FFCC80;
      max-width: 90%;
      animation: slideDown 0.3s ease-out;
    `;

    // アニメーションスタイルを追加
    if (!document.getElementById('error-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'error-notification-styles';
      style.textContent = `
        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        .error-notification .error-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #E65100;
          padding: 4px 8px;
          margin-left: 8px;
        }
        .error-notification .error-close:hover {
          opacity: 0.7;
        }
        @media (prefers-reduced-motion: reduce) {
          .error-notification { animation: none; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(errorDiv);

    // 閉じるボタンのイベント
    const closeBtn = errorDiv.querySelector('.error-close');
    closeBtn.addEventListener('click', () => errorDiv.remove());

    // 5秒後に自動で閉じる
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  }

  /**
   * アプリケーションを破棄
   */
  destroy() {
    // イベントリスナーを解除
    if (this._stateUnsubscribe) {
      this._stateUnsubscribe();
      this._stateUnsubscribe = null;
    }
    window.removeEventListener('resize', this._handleResize);
    window.removeEventListener('beforeunload', this._handleBeforeUnload);
    document.removeEventListener('visibilitychange', this._handleVisibilityChange);
    document.removeEventListener('keydown', this._handleGlobalKeyDown);

    // ゲームを終了
    this._endGame();

    // 各モジュールを破棄
    if (this.inputRouter) {
      this.inputRouter.destroy();
      this.inputRouter = null;
    }

    if (this.gameLoop) {
      this.gameLoop.destroy();
      this.gameLoop = null;
    }

    if (this.canvasScaling) {
      this.canvasScaling.destroy();
      this.canvasScaling = null;
    }

    // UIを破棄
    uiManager.destroy();

    // オーディオを破棄
    audio.destroy();

    this.isInitialized = false;

    console.log('App destroyed');
  }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App();
  await app.init(); // 非同期初期化を待機

  // デバッグ用にグローバルに公開
  if (typeof window !== 'undefined') {
    window.__eyeTrainingApp = app;
    window.__stateMachine = stateMachine;
    window.__storage = storage;
    window.__theme = theme;
    window.__audio = audio;
  }
});
