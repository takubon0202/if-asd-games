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

    // キーボードハンドラをバインド
    this._handleKeyDown = this._handleKeyDown.bind(this);
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
    timeLabel.textContent = 'じかん';
    timeLabel.setAttribute('aria-hidden', 'true');
    timeSection.appendChild(timeLabel);

    this.timeElement = document.createElement('span');
    this.timeElement.className = 'hud-value';
    this.timeElement.setAttribute('aria-label', 'のこりじかん');
    this.timeElement.textContent = '0:00';
    timeSection.appendChild(this.timeElement);

    this.container.appendChild(timeSection);

    // 中央：一時停止ボタン
    this.pauseButton = document.createElement('button');
    this.pauseButton.className = 'hud-pause-btn';
    this.pauseButton.setAttribute('tabindex', '0');
    this.pauseButton.setAttribute('aria-label', 'いちじていし');
    this.pauseButton.textContent = '| |';
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
    scoreLabel.textContent = 'スコア';
    scoreLabel.setAttribute('aria-hidden', 'true');
    scoreSection.appendChild(scoreLabel);

    this.scoreElement = document.createElement('span');
    this.scoreElement.className = 'hud-value';
    this.scoreElement.setAttribute('aria-label', 'スコア');
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
    title.textContent = 'いちじていし';
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
   */
  _applyStyles() {
    if (document.getElementById('hud-styles')) return;

    const style = document.createElement('style');
    style.id = 'hud-styles';
    style.textContent = `
      /* HUDコンテナ */
      .game-hud {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 24px;
        background-color: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        font-family: 'Hiragino Kaku Gothic ProN', 'メイリオ', sans-serif;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease;
        z-index: 500;
      }

      .game-hud.visible {
        opacity: 1;
        visibility: visible;
      }

      /* HUDセクション */
      .hud-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 80px;
      }

      .hud-label {
        font-size: var(--font-size-small);
        color: var(--color-text-secondary);
        margin-bottom: 4px;
      }

      .hud-value {
        font-size: var(--font-size-large);
        font-weight: bold;
        color: var(--color-text);
      }

      /* 一時停止ボタン */
      .hud-pause-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 48px;
        height: 48px;
        background-color: var(--color-background);
        color: var(--color-text);
        border: 2px solid var(--color-border);
        border-radius: 50%;
        font-size: var(--font-size-base);
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.2s, border-color 0.2s;
      }

      .hud-pause-btn:hover,
      .hud-pause-btn:focus {
        background-color: var(--color-primary);
        border-color: var(--color-primary);
        color: white;
        outline: none;
      }

      .hud-pause-btn:focus {
        box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.3);
      }

      /* 一時停止オーバーレイ */
      .pause-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease;
        z-index: 600;
      }

      .pause-overlay.visible {
        opacity: 1;
        visibility: visible;
      }

      .pause-content {
        background-color: var(--color-background);
        padding: 40px;
        border-radius: 16px;
        text-align: center;
        max-width: 320px;
        width: 90%;
      }

      .pause-title {
        font-size: var(--font-size-xlarge);
        font-weight: normal;
        margin: 0 0 32px 0;
        color: var(--color-text);
      }

      .pause-buttons {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .pause-btn {
        width: 100%;
        min-height: 56px;
        padding: 16px 24px;
        font-size: var(--font-size-large);
        border-radius: 12px;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.1s;
      }

      .pause-btn:focus {
        outline: none;
        box-shadow: 0 0 0 4px rgba(74, 144, 217, 0.3);
      }

      .pause-btn:active {
        transform: scale(0.98);
      }

      .resume-btn {
        background-color: var(--color-primary);
        color: white;
        border: 2px solid var(--color-primary);
      }

      .resume-btn:hover {
        background-color: var(--color-primary-hover);
        border-color: var(--color-primary-hover);
      }

      .pause-btn.home-btn {
        background-color: var(--color-surface);
        color: var(--color-text);
        border: 2px solid var(--color-border);
      }

      .pause-btn.home-btn:hover {
        background-color: var(--color-border);
      }

      .pause-hint {
        margin: 24px 0 0 0;
        font-size: var(--font-size-small);
        color: var(--color-text-secondary);
      }

      /* レスポンシブ */
      @media (max-width: 480px) {
        .game-hud {
          padding: 8px 16px;
        }

        .hud-section {
          min-width: 60px;
        }

        .hud-label {
          font-size: 12px;
        }

        .hud-value {
          font-size: var(--font-size-base);
        }

        .hud-pause-btn {
          width: 40px;
          height: 40px;
        }
      }
    `;

    document.head.appendChild(style);
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
    stateMachine.pause();

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
    stateMachine.resume();
  }

  /**
   * ホームに戻る
   */
  _goHome() {
    this.isPaused = false;
    this.pauseOverlay.classList.remove('visible');
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
