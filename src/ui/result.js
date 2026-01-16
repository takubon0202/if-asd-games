/**
 * Result画面 - 結果表示
 * ASD&LD向け「目の動き」トレーニングWebゲーム
 * ASD/LD向けデザインガイドラインに基づくリデザイン版
 */

import { stateMachine, GameState } from '../engine/state.js';
import { storage } from '../engine/storage.js';
import { audio } from '../engine/audio.js';

export class ResultScreen {
  constructor() {
    this.container = null;
    this.isVisible = false;
    this.resultData = null;
    this.useSolidBackground = false; // ASD向け単色背景オプション

    // フォーカストラップ用
    this._focusableElements = [];
    this._firstFocusable = null;
    this._lastFocusable = null;
    this._handleFocusTrap = this._handleFocusTrap.bind(this);

    // キーボードハンドラをバインド
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }

  /**
   * 画面を作成
   */
  _createScreen() {
    this.container = document.createElement('div');
    this.container.id = 'result-screen';
    this.container.className = 'screen result-screen';
    this.container.setAttribute('role', 'dialog');
    this.container.setAttribute('aria-label', 'けっか');
    this.container.setAttribute('aria-modal', 'true');

    // 結果カード
    const card = this._createCard();
    this.container.appendChild(card);

    // スタイルを適用
    this._applyStyles();

    document.body.appendChild(this.container);
  }

  /**
   * 結果カードを作成
   */
  _createCard() {
    const card = document.createElement('div');
    card.className = 'result-card';

    // ヘッダー
    const header = this._createHeader();
    card.appendChild(header);

    // スコアバッジ
    const scoreBadge = this._createScoreBadge();
    card.appendChild(scoreBadge);

    // 励ましメッセージ
    const encouragement = document.createElement('p');
    encouragement.className = 'result-encouragement';
    encouragement.id = 'result-encouragement';
    card.appendChild(encouragement);

    // 統計情報
    const stats = this._createStats();
    card.appendChild(stats);

    // ボタン
    const buttons = this._createButtons();
    card.appendChild(buttons);

    return card;
  }

  /**
   * ヘッダーを作成
   */
  _createHeader() {
    const header = document.createElement('div');
    header.className = 'result-header';

    const title = document.createElement('h1');
    title.className = 'result-title';
    title.textContent = 'おわり! ';
    header.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.className = 'result-subtitle';
    subtitle.textContent = 'よくがんばったね';
    header.appendChild(subtitle);

    return header;
  }

  /**
   * スコアバッジを作成
   */
  _createScoreBadge() {
    const badge = document.createElement('div');
    badge.className = 'score-badge';
    badge.id = 'score-badge';

    const scoreNumber = document.createElement('span');
    scoreNumber.className = 'score-number';
    scoreNumber.id = 'score-number';
    scoreNumber.textContent = '0';
    badge.appendChild(scoreNumber);

    const scoreLabel = document.createElement('span');
    scoreLabel.className = 'score-label';
    scoreLabel.textContent = 'てん';
    badge.appendChild(scoreLabel);

    return badge;
  }

  /**
   * 統計情報を作成
   */
  _createStats() {
    const stats = document.createElement('div');
    stats.className = 'result-stats';
    stats.id = 'result-stats';

    // 時間
    const timeRow = document.createElement('div');
    timeRow.className = 'stat-row';
    timeRow.id = 'stat-time';
    stats.appendChild(timeRow);

    // 正解数
    const correctRow = document.createElement('div');
    correctRow.className = 'stat-row';
    correctRow.id = 'stat-correct';
    stats.appendChild(correctRow);

    return stats;
  }

  /**
   * ボタンを作成
   */
  _createButtons() {
    const buttons = document.createElement('div');
    buttons.className = 'result-buttons';

    // リトライボタン
    const retryBtn = document.createElement('button');
    retryBtn.className = 'result-btn retry-btn';
    retryBtn.setAttribute('tabindex', '0');
    retryBtn.setAttribute('aria-label', 'もういちど やる');
    retryBtn.textContent = 'もういちど ';
    retryBtn.addEventListener('click', () => {
      audio.play('click');
      this._retry();
    });
    buttons.appendChild(retryBtn);

    // ホームボタン
    const homeBtn = document.createElement('button');
    homeBtn.className = 'result-btn home-btn';
    homeBtn.setAttribute('tabindex', '0');
    homeBtn.setAttribute('aria-label', 'ホームに もどる');
    homeBtn.textContent = 'ホームへ ';
    homeBtn.addEventListener('click', () => {
      audio.play('click');
      this._goHome();
    });
    buttons.appendChild(homeBtn);

    return buttons;
  }

  /**
   * 結果コンテンツを更新
   */
  _updateResultContent() {
    if (!this.resultData) return;

    // スコアを更新
    const scoreNumber = this.container.querySelector('#score-number');
    if (scoreNumber && this.resultData.score !== undefined) {
      scoreNumber.textContent = this.resultData.score;
    }

    // 時間を更新
    const timeRow = this.container.querySelector('#stat-time');
    if (timeRow && this.resultData.time !== undefined) {
      const seconds = Math.floor(this.resultData.time);
      timeRow.textContent = `\u23F1\uFE0F じかん: ${seconds} びょう`;
    }

    // 正解数を更新
    const correctRow = this.container.querySelector('#stat-correct');
    if (correctRow && this.resultData.correct !== undefined) {
      correctRow.textContent = `\u2705 せいかい: ${this.resultData.correct} かい`;
    }

    // 励ましメッセージを更新
    const encouragement = this.container.querySelector('#result-encouragement');
    if (encouragement) {
      encouragement.textContent = this._getEncouragementMessage();
    }
  }

  /**
   * 励ましのメッセージを取得
   */
  _getEncouragementMessage() {
    if (!this.resultData) {
      return 'つぎもがんばろう! \u2B50';
    }

    const score = this.resultData.score || 0;
    const accuracy = this.resultData.accuracy || 0;

    // スコアと正解率に基づいたメッセージ
    if (score >= 80 || accuracy >= 90) {
      return 'すごい! \u2B50\u2B50\u2B50';
    } else if (score >= 50 || accuracy >= 70) {
      return 'いいね! \u2B50\u2B50';
    } else {
      return 'つぎもがんばろう! \u2B50';
    }
  }

  /**
   * 単色背景を設定（ASD向けオプション）
   * @param {boolean} useSolid - 単色背景を使用するかどうか
   */
  setSolidBackground(useSolid) {
    this.useSolidBackground = useSolid;
    if (this.container) {
      if (useSolid) {
        this.container.classList.add('solid-background');
      } else {
        this.container.classList.remove('solid-background');
      }
    }
  }

  /**
   * スタイルを適用
   */
  _applyStyles() {
    if (document.getElementById('result-screen-styles')) return;

    const style = document.createElement('style');
    style.id = 'result-screen-styles';
    style.textContent = `
      .result-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(180deg, #E8F5E9 0%, #FFFFFF 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 32px;
        box-sizing: border-box;
        font-family: 'Hiragino Kaku Gothic ProN', '\u30E1\u30A4\u30EA\u30AA', sans-serif;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease;
        z-index: 300;
      }

      /* ASD向け単色背景オプション */
      .result-screen.solid-background {
        background: #F5F5F5;
      }

      .result-screen.visible {
        opacity: 1;
        visibility: visible;
      }

      /* 結果カード */
      .result-card {
        background: #FFFFFF;
        border-radius: 24px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        padding: 40px;
        max-width: 400px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      /* ヘッダー */
      .result-header {
        margin-bottom: 24px;
      }

      .result-title {
        font-size: clamp(28px, 5vw, 40px);
        font-weight: bold;
        margin: 0 0 8px 0;
        color: #333333;
      }

      .result-subtitle {
        font-size: clamp(18px, 3vw, 24px);
        margin: 0;
        color: #555555;
      }

      /* スコアバッジ */
      .score-badge {
        width: 120px;
        height: 120px;
        background: #5C6BC0;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-bottom: 16px;
      }

      .score-number {
        font-size: clamp(40px, 8vw, 64px);
        font-weight: bold;
        color: #FFFFFF;
        line-height: 1;
      }

      .score-label {
        font-size: 18px;
        color: #FFFFFF;
        margin-top: 4px;
      }

      /* 励ましメッセージ */
      .result-encouragement {
        font-size: clamp(16px, 2.5vw, 20px);
        color: #5C6BC0;
        margin: 8px 0 24px 0;
        font-weight: bold;
      }

      /* 統計情報 */
      .result-stats {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 32px;
        width: 100%;
      }

      .stat-row {
        font-size: 20px;
        color: #333333;
        text-align: center;
      }

      /* ボタン */
      .result-buttons {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
      }

      .result-btn {
        width: 100%;
        min-height: 56px;
        font-size: 20px;
        font-weight: bold;
        border: none;
        border-radius: 16px;
        cursor: pointer;
        transition: transform 0.1s, opacity 0.2s;
        font-family: inherit;
      }

      .result-btn:focus {
        outline: none;
        box-shadow: 0 0 0 4px rgba(92, 107, 192, 0.3);
      }

      .result-btn:active {
        transform: scale(0.98);
      }

      /* リトライボタン */
      .retry-btn {
        background: #4CAF50;
        color: #FFFFFF;
        min-height: 60px;
      }

      .retry-btn:hover {
        opacity: 0.9;
      }

      /* ホームボタン - コントラスト改善 */
      .home-btn {
        background: #F5F5F5;
        color: #424242;
        min-height: 56px;
      }

      .home-btn:hover {
        background: #EEEEEE;
      }

      /* タブレット対応（768px以上でボタン横並び） */
      @media (min-width: 768px) {
        .result-buttons {
          flex-direction: row;
          justify-content: center;
        }

        .result-btn {
          min-width: 180px;
          width: auto;
        }
      }

      /* 大画面対応（1200px以上） */
      @media (min-width: 1200px) {
        .result-card {
          max-width: 600px;
          padding: 48px;
        }

        .score-badge {
          width: 160px;
          height: 160px;
        }

        .score-number {
          font-size: 64px;
        }

        .score-label {
          font-size: 22px;
        }
      }

      /* レスポンシブ（モバイル） */
      @media (max-width: 480px) {
        .result-screen {
          padding: 16px;
        }

        .result-card {
          padding: 32px 24px;
        }

        .score-badge {
          width: 100px;
          height: 100px;
        }

        .score-label {
          font-size: 16px;
        }

        .stat-row {
          font-size: 18px;
        }

        .result-btn {
          font-size: 18px;
        }
      }

      /* prefers-reduced-motion対応 */
      @media (prefers-reduced-motion: reduce) {
        .result-screen,
        .result-card,
        .result-btn {
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
  _handleFocusTrap(e) {
    if (e.key !== 'Tab') return;

    if (!this._firstFocusable || !this._lastFocusable) return;

    if (e.shiftKey) {
      if (document.activeElement === this._firstFocusable) {
        e.preventDefault();
        this._lastFocusable.focus();
      }
    } else {
      if (document.activeElement === this._lastFocusable) {
        e.preventDefault();
        this._firstFocusable.focus();
      }
    }
  }

  /**
   * フォーカス可能な要素を更新
   */
  _updateFocusableElements() {
    if (!this.container) return;

    const focusableSelectors = 'button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    this._focusableElements = Array.from(this.container.querySelectorAll(focusableSelectors));

    if (this._focusableElements.length > 0) {
      this._firstFocusable = this._focusableElements[0];
      this._lastFocusable = this._focusableElements[this._focusableElements.length - 1];
    }
  }

  /**
   * リトライ
   */
  _retry() {
    const currentGame = stateMachine.getCurrentGame();
    if (currentGame) {
      stateMachine.play(currentGame);
    } else {
      stateMachine.goHome();
    }
  }

  /**
   * ホームに戻る
   */
  _goHome() {
    stateMachine.goHome();
  }

  /**
   * キーボードイベントハンドラ
   */
  _handleKeyDown(event) {
    if (!this.isVisible) return;

    switch (event.key) {
      case 'r':
      case 'R':
        event.preventDefault();
        audio.play('click');
        this._retry();
        break;

      case 'Escape':
        event.preventDefault();
        audio.play('click');
        this._goHome();
        break;

      case 'Enter':
      case ' ':
        // フォーカスされたボタンのデフォルト動作に任せる
        break;
    }
  }

  /**
   * 結果データを設定
   */
  setResult(data) {
    this.resultData = data;

    // 記録を保存
    const gameName = stateMachine.getCurrentGame();
    if (gameName && data) {
      storage.recordSession(gameName, {
        score: data.score,
        time: data.time,
        accuracy: data.accuracy
      });

      // ベストスコアを取得して結果データに追加
      const gameRecord = storage.getGameRecord(gameName);
      if (gameRecord) {
        this.resultData.bestScore = gameRecord.bestScore;
      }
    }
  }

  /**
   * 画面を表示
   */
  show(data) {
    if (!this.container) {
      this._createScreen();
    }

    // 結果データを設定
    if (data) {
      this.setResult(data);
    }

    // 単色背景の設定を反映
    if (this.useSolidBackground) {
      this.container.classList.add('solid-background');
    }

    // 結果コンテンツを更新
    this._updateResultContent();

    this.container.classList.add('visible');
    this.isVisible = true;

    // キーボードリスナーを追加
    document.addEventListener('keydown', this._handleKeyDown);

    // フォーカストラップを有効化
    this._updateFocusableElements();
    document.addEventListener('keydown', this._handleFocusTrap);

    // リトライボタンにフォーカス
    setTimeout(() => {
      const retryBtn = this.container.querySelector('.retry-btn');
      if (retryBtn) {
        retryBtn.focus();
      }
    }, 100);

    // 完了音を再生
    audio.play('complete');
  }

  /**
   * 画面を非表示
   */
  hide() {
    if (this.container) {
      this.container.classList.remove('visible');
    }
    this.isVisible = false;
    this.resultData = null;

    // キーボードリスナーを削除
    document.removeEventListener('keydown', this._handleKeyDown);

    // フォーカストラップを無効化
    document.removeEventListener('keydown', this._handleFocusTrap);
  }

  /**
   * 表示状態を取得
   */
  isShown() {
    return this.isVisible;
  }

  /**
   * 破棄
   */
  destroy() {
    this.hide();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
  }
}

// シングルトンインスタンス
export const resultScreen = new ResultScreen();
