/**
 * HUD - ゲーム中のヘッドアップディスプレイ
 * ASD&LD向け「目の動き」トレーニングWebゲーム
 */

import { stateMachine, GameState } from '../engine/state.js';
import { audio } from '../engine/audio.js';

export class GameHUD {
  constructor() {
    this.container = null;
    this.isVisible = false;
    this.isPaused = false;

    // 表示データ
    this.time = 0;
    this.score = 0;
    this.maxTime = 0;

    // 要素への参照
    this.timeElement = null;
    this.scoreElement = null;
    this.pauseButton = null;
    this.pauseOverlay = null;

    // フォーカストラップ用
    this._focusableElements = [];
    this._firstFocusable = null;
    this._lastFocusable = null;

    // キーボードハンドラをバインド
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleFocusTrap = this._handleFocusTrap.bind(this);
  }

  /**
   * HUDを作成
   */
  _createHUD() {
    // メインコンテナ
    this.container = document.createElement('div');
    this.container.id = 'game-hud';
    this.container.className = 'game-hud';
    this.container.setAttribute('role', 'status');
    this.container.setAttribute('aria-label', 'ゲームじょうほう');

    // 左側：時間表示
    const timeSection = document.createElement('div');
    timeSection.className = 'hud-section hud-time';

    const timeLabel = document.createElement('span');
    timeLabel.className = 'hud-label';
    timeLabel.textContent = '⏱️ じかん';
    timeLabel.setAttribute('aria-hidden', 'true');
    timeSection.appendChild(timeLabel);

    this.timeElement = document.createElement('span');
    this.timeElement.className = 'hud-value';
    this.timeElement.setAttribute('aria-label', 'のこりじかん');
    this.timeElement.setAttribute('aria-live', 'polite');
    this.timeElement.textContent = '0:00';
    timeSection.appendChild(this.timeElement);

    this.container.appendChild(timeSection);

    // 中央：一時停止ボタン
    this.pauseButton = document.createElement('button');
    this.pauseButton.className = 'hud-pause-btn';
    this.pauseButton.setAttribute('tabindex', '0');
    this.pauseButton.setAttribute('aria-label', 'いちじていし');
    this.pauseButton.setAttribute('aria-pressed', 'false');
    this.pauseButton.textContent = '⏸️';
    this.pauseButton.addEventListener('click', () => {
      audio.play('click');
      this._togglePause();
    });
    this.container.appendChild(this.pauseButton);

    // 右側：スコア表示
    const scoreSection = document.createElement('div');
    scoreSection.className = 'hud-section hud-score';

    const scoreLabel = document.createElement('span');
    scoreLabel.className = 'hud-label';
    scoreLabel.textContent = '⭐ スコア';
    scoreLabel.setAttribute('aria-hidden', 'true');
    scoreSection.appendChild(scoreLabel);

    this.scoreElement = document.createElement('span');
    this.scoreElement.className = 'hud-value';
    this.scoreElement.setAttribute('aria-label', 'スコア');
    this.scoreElement.setAttribute('aria-live', 'polite');
    this.scoreElement.textContent = '0';
    scoreSection.appendChild(this.scoreElement);

    this.container.appendChild(scoreSection);

    // 一時停止オーバーレイ
    this._createPauseOverlay();

    // スタイルを適用
    this._applyStyles();

    document.body.appendChild(this.container);
  }

  /**
   * 一時停止オーバーレイを作成
   */
  _createPauseOverlay() {
    this.pauseOverlay = document.createElement('div');
    this.pauseOverlay.id = 'pause-overlay';
    this.pauseOverlay.className = 'pause-overlay';
    this.pauseOverlay.setAttribute('role', 'dialog');
    this.pauseOverlay.setAttribute('aria-label', 'いちじていし');
    this.pauseOverlay.setAttribute('aria-modal', 'true');

    const content = document.createElement('div');
    content.className = 'pause-content';

    const title = document.createElement('h2');
    title.className = 'pause-title';
    title.textContent = 'いちじていし ⏸️';
    content.appendChild(title);

    const buttons = document.createElement('div');
    buttons.className = 'pause-buttons';

    // 再開ボタン
    const resumeBtn = document.createElement('button');
    resumeBtn.className = 'pause-btn resume-btn';
    resumeBtn.setAttribute('tabindex', '0');
    resumeBtn.textContent = 'つづける';
    resumeBtn.addEventListener('click', () => {
      audio.play('click');
      this._resume();
    });
    buttons.appendChild(resumeBtn);

    // ホームに戻るボタン
    const homeBtn = document.createElement('button');
    homeBtn.className = 'pause-btn home-btn';
    homeBtn.setAttribute('tabindex', '0');
    homeBtn.textContent = 'やめる';
    homeBtn.addEventListener('click', () => {
      audio.play('click');
      this._goHome();
    });
    buttons.appendChild(homeBtn);

    content.appendChild(buttons);

    // キーヒント
    const hint = document.createElement('p');
    hint.className = 'pause-hint';
    hint.textContent = 'Escキー：やめる　スペース：つづける';
    content.appendChild(hint);

    this.pauseOverlay.appendChild(content);
    document.body.appendChild(this.pauseOverlay);
  }

  /**
   * スタイルを適用
   * ASD/LD向けデザインガイドラインに基づく
   */
  _applyStyles() {
    if (document.getElementById('hud-styles')) return;

    const style = document.createElement('style');
    style.id = 'hud-styles';
    style.textContent = `
      /* HUDコンテナ - 半透明白背景、ソフトな影 */
      .game-hud {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        background-color: rgba(255, 255, 255, 0.95);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        font-family: 'Hiragino Kaku Gothic ProN', 'メイリオ', sans-serif;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease-out;
        z-index: 500;
      }

      .game-hud.visible {
        opacity: 1;
        visibility: visible;
      }

      /* HUDセクション - 時間・スコア共通 */
      .hud-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 8px 16px;
        border-radius: 12px;
        min-width: 100px;
      }

      /* 時間セクション - ソフトな青背景 */
      .hud-time {
        background-color: #E3F2FD;
      }

      /* スコアセクション - ソフトなオレンジ背景 */
      .hud-score {
        background-color: #FFF3E0;
      }

      .hud-label {
        font-size: 16px;
        color: #555555;
        margin-bottom: 4px;
        font-weight: 500;
      }

      .hud-value {
        font-size: clamp(24px, 3vw, 32px);
        font-weight: bold;
        color: #333333;
      }

      /* 一時停止ボタン - 円形、インディゴ背景 */
      .hud-pause-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 56px;
        height: 56px;
        background-color: #5C6BC0;
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
      }

      .hud-pause-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(92, 107, 192, 0.4);
      }

      .hud-pause-btn:focus {
        outline: none;
        box-shadow: 0 0 0 4px rgba(92, 107, 192, 0.3);
      }

      .hud-pause-btn:active {
        transform: scale(1.05);
      }

      /* 一時停止オーバーレイ */
      .pause-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease-out;
        z-index: 600;
      }

      .pause-overlay.visible {
        opacity: 1;
        visibility: visible;
      }

      /* 一時停止ダイアログ */
      .pause-content {
        background-color: #FFFFFF;
        padding: 40px;
        border-radius: 24px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        text-align: center;
        max-width: 360px;
        width: 90%;
      }

      .pause-title {
        font-size: 32px;
        font-weight: bold;
        margin: 0 0 32px 0;
        color: #333333;
      }

      .pause-buttons {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .pause-btn {
        width: 100%;
        height: 56px;
        padding: 0 24px;
        font-size: 18px;
        font-weight: bold;
        border-radius: 16px;
        cursor: pointer;
        transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
      }

      .pause-btn:focus {
        outline: none;
      }

      .pause-btn:active {
        transform: scale(0.98);
      }

      /* つづけるボタン - 緑背景 */
      .resume-btn {
        background-color: #4CAF50;
        color: white;
        border: none;
      }

      .resume-btn:hover {
        background-color: #43A047;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
      }

      .resume-btn:focus {
        box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.3);
      }

      /* やめるボタン - グレー背景 */
      .pause-btn.home-btn {
        background-color: #F5F5F5;
        color: #666666;
        border: none;
      }

      .pause-btn.home-btn:hover {
        background-color: #EEEEEE;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .pause-btn.home-btn:focus {
        box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.1);
      }

      .pause-hint {
        margin: 24px 0 0 0;
        font-size: 16px;
        color: #666666;
      }

      /* レスポンシブ - モバイル */
      @media (max-width: 480px) {
        .game-hud {
          padding: 12px 16px;
        }

        .hud-section {
          min-width: 80px;
          padding: 6px 12px;
        }

        .hud-label {
          font-size: 14px;
        }

        .hud-value {
          font-size: 22px;
        }

        .hud-pause-btn {
          width: 48px;
          height: 48px;
          font-size: 20px;
        }

        .pause-content {
          padding: 32px 24px;
        }

        .pause-title {
          font-size: 26px;
        }

        .pause-btn {
          height: 52px;
          font-size: 16px;
        }
      }

      /* レスポンシブ - タブレット */
      @media (min-width: 768px) and (max-width: 1023px) {
        .game-hud {
          padding: 16px 24px;
        }

        .hud-value {
          font-size: 28px;
        }
      }

      /* レスポンシブ - 大画面 */
      @media (min-width: 1200px) {
        .game-hud {
          padding: 20px 40px;
        }

        .hud-section {
          min-width: 160px;
        }

        .hud-value {
          font-size: 36px;
        }
      }

      /* アクセシビリティ - モーション軽減 */
      @media (prefers-reduced-motion: reduce) {
        .game-hud,
        .hud-button,
        .pause-dialog {
          transition: none !important;
          animation: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * フォーカストラップのハンドラ
   */
  _handleFocusTrap(event) {
    if (!this.isPaused || event.key !== 'Tab') return;

    // フォーカス可能な要素を取得
    this._updateFocusableElements();

    if (this._focusableElements.length === 0) return;

    if (event.shiftKey) {
      // Shift+Tab: 最初の要素にいる場合、最後の要素へ
      if (document.activeElement === this._firstFocusable) {
        event.preventDefault();
        this._lastFocusable.focus();
      }
    } else {
      // Tab: 最後の要素にいる場合、最初の要素へ
      if (document.activeElement === this._lastFocusable) {
        event.preventDefault();
        this._firstFocusable.focus();
      }
    }
  }

  /**
   * フォーカス可能な要素を更新
   */
  _updateFocusableElements() {
    if (!this.pauseOverlay) return;

    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];

    this._focusableElements = Array.from(
      this.pauseOverlay.querySelectorAll(focusableSelectors.join(', '))
    ).filter(el => el.offsetParent !== null);

    this._firstFocusable = this._focusableElements[0];
    this._lastFocusable = this._focusableElements[this._focusableElements.length - 1];
  }

  /**
   * 一時停止をトグル
   */
  _togglePause() {
    if (this.isPaused) {
      this._resume();
    } else {
      this._pause();
    }
  }

  /**
   * 一時停止
   */
  _pause() {
    this.isPaused = true;
    this.pauseOverlay.classList.add('visible');
    this.pauseButton.setAttribute('aria-pressed', 'true');
    stateMachine.pause();

    // フォーカストラップを有効化
    document.addEventListener('keydown', this._handleFocusTrap);

    // 再開ボタンにフォーカス
    setTimeout(() => {
      const resumeBtn = this.pauseOverlay.querySelector('.resume-btn');
      if (resumeBtn) {
        resumeBtn.focus();
      }
    }, 100);
  }

  /**
   * 再開
   */
  _resume() {
    this.isPaused = false;
    this.pauseOverlay.classList.remove('visible');
    this.pauseButton.setAttribute('aria-pressed', 'false');
    stateMachine.resume();

    // フォーカストラップを無効化
    document.removeEventListener('keydown', this._handleFocusTrap);

    // 一時停止ボタンにフォーカスを戻す
    if (this.pauseButton) {
      this.pauseButton.focus();
    }
  }

  /**
   * ホームに戻る
   */
  _goHome() {
    this.isPaused = false;
    this.pauseOverlay.classList.remove('visible');
    this.pauseButton.setAttribute('aria-pressed', 'false');

    // フォーカストラップを無効化
    document.removeEventListener('keydown', this._handleFocusTrap);

    stateMachine.goHome();
  }

  /**
   * 時間を更新
   */
  updateTime(seconds) {
    this.time = seconds;
    if (this.timeElement) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      this.timeElement.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  }

  /**
   * 残り時間を更新（カウントダウン用）
   */
  updateRemainingTime(seconds) {
    this.updateTime(seconds);
  }

  /**
   * スコアを更新
   */
  updateScore(score) {
    this.score = score;
    if (this.scoreElement) {
      this.scoreElement.textContent = score.toString();
    }
  }

  /**
   * スコアを加算
   */
  addScore(points) {
    this.updateScore(this.score + points);
  }

  /**
   * キーボードイベントハンドラ
   */
  _handleKeyDown(event) {
    if (!this.isVisible) return;

    // 一時停止中の処理
    if (this.isPaused) {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          audio.play('click');
          this._goHome();
          break;

        case ' ':
          event.preventDefault();
          audio.play('click');
          this._resume();
          break;
      }
      return;
    }

    // ゲーム中の処理
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        audio.play('click');
        this._pause();
        break;

      case 'p':
      case 'P':
        event.preventDefault();
        audio.play('click');
        this._togglePause();
        break;
    }
  }

  /**
   * HUDを表示
   */
  show() {
    if (!this.container) {
      this._createHUD();
    }

    // 値をリセット
    this.time = 0;
    this.score = 0;
    this.isPaused = false;
    this.updateTime(0);
    this.updateScore(0);

    this.container.classList.add('visible');
    this.isVisible = true;

    // キーボードリスナーを追加
    document.addEventListener('keydown', this._handleKeyDown);
  }

  /**
   * HUDを非表示
   */
  hide() {
    if (this.container) {
      this.container.classList.remove('visible');
    }
    if (this.pauseOverlay) {
      this.pauseOverlay.classList.remove('visible');
    }
    this.isVisible = false;
    this.isPaused = false;

    // キーボードリスナーを削除
    document.removeEventListener('keydown', this._handleKeyDown);
    document.removeEventListener('keydown', this._handleFocusTrap);
  }

  /**
   * HUDの値をリセット
   */
  reset() {
    this.time = 0;
    this.score = 0;
    this.isPaused = false;
    if (this.timeElement) {
      this.updateTime(0);
    }
    if (this.scoreElement) {
      this.updateScore(0);
    }
    if (this.pauseOverlay) {
      this.pauseOverlay.classList.remove('visible');
    }
    if (this.pauseButton) {
      this.pauseButton.setAttribute('aria-pressed', 'false');
    }
  }

  /**
   * 表示状態を取得
   */
  isShown() {
    return this.isVisible;
  }

  /**
   * 一時停止状態を取得
   */
  isPausedState() {
    return this.isPaused;
  }

  /**
   * 現在の時間を取得
   */
  getTime() {
    return this.time;
  }

  /**
   * 現在のスコアを取得
   */
  getScore() {
    return this.score;
  }

  /**
   * 破棄
   */
  destroy() {
    this.hide();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    if (this.pauseOverlay && this.pauseOverlay.parentNode) {
      this.pauseOverlay.parentNode.removeChild(this.pauseOverlay);
    }
    this.container = null;
    this.pauseOverlay = null;
    this.timeElement = null;
    this.scoreElement = null;
    this.pauseButton = null;
  }
}

// シングルトンインスタンス
export const gameHUD = new GameHUD();
