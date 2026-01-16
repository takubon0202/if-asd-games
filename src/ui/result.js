/**
 * Result画面 - 結果表示
 * ASD&LD向け「目の動き」トレーニングWebゲーム
 */

import { stateMachine, GameState } from '../engine/state.js';
import { storage } from '../engine/storage.js';
import { audio } from '../engine/audio.js';

export class ResultScreen {
  constructor() {
    this.container = null;
    this.isVisible = false;
    this.resultData = null;

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

    // メインコンテンツ
    const main = this._createMain();
    this.container.appendChild(main);

    // フッター（ボタン）
    const footer = this._createFooter();
    this.container.appendChild(footer);

    // スタイルを適用
    this._applyStyles();

    document.body.appendChild(this.container);
  }

  /**
   * メインコンテンツを作成
   */
  _createMain() {
    const main = document.createElement('main');
    main.className = 'result-main';

    // タイトル
    const title = document.createElement('h1');
    title.className = 'result-title';
    title.textContent = 'おわり';
    main.appendChild(title);

    // 結果コンテナ
    const resultContainer = document.createElement('div');
    resultContainer.className = 'result-container';
    resultContainer.id = 'result-container';
    main.appendChild(resultContainer);

    // メッセージ
    const message = document.createElement('p');
    message.className = 'result-message';
    message.id = 'result-message';
    message.textContent = 'おつかれさまでした';
    main.appendChild(message);

    return main;
  }

  /**
   * 結果コンテンツを更新
   */
  _updateResultContent() {
    const container = this.container.querySelector('#result-container');
    if (!container) return;

    container.innerHTML = '';

    if (!this.resultData) return;

    // 結果項目を作成
    const items = this._buildResultItems();
    items.forEach(item => {
      const row = this._createResultRow(item.label, item.value, item.highlight);
      container.appendChild(row);
    });

    // メッセージを更新
    const message = this.container.querySelector('#result-message');
    if (message) {
      message.textContent = this._getEncouragementMessage();
    }
  }

  /**
   * 結果項目を構築
   */
  _buildResultItems() {
    const items = [];
    const data = this.resultData;

    // 時間
    if (data.time !== undefined) {
      const minutes = Math.floor(data.time / 60);
      const seconds = Math.floor(data.time % 60);
      const timeStr = minutes > 0
        ? `${minutes}ふん ${seconds}びょう`
        : `${seconds}びょう`;
      items.push({ label: 'じかん', value: timeStr });
    }

    // スコア
    if (data.score !== undefined) {
      items.push({
        label: 'スコア',
        value: `${data.score}`,
        highlight: true
      });
    }

    // 正解数
    if (data.correct !== undefined) {
      items.push({ label: 'せいかい', value: `${data.correct}` });
    }

    // 失敗数
    if (data.mistakes !== undefined) {
      items.push({ label: 'まちがい', value: `${data.mistakes}` });
    }

    // 正解率
    if (data.accuracy !== undefined) {
      items.push({ label: 'せいかいりつ', value: `${Math.round(data.accuracy)}%` });
    }

    // ベストスコア比較
    if (data.score !== undefined && data.bestScore !== undefined) {
      if (data.score >= data.bestScore) {
        items.push({
          label: '',
          value: 'じこベスト！',
          highlight: true
        });
      }
    }

    return items;
  }

  /**
   * 結果行を作成
   */
  _createResultRow(label, value, highlight = false) {
    const row = document.createElement('div');
    row.className = 'result-row' + (highlight ? ' highlight' : '');

    if (label) {
      const labelSpan = document.createElement('span');
      labelSpan.className = 'result-label';
      labelSpan.textContent = label;
      row.appendChild(labelSpan);
    }

    const valueSpan = document.createElement('span');
    valueSpan.className = 'result-value' + (highlight && !label ? ' centered' : '');
    valueSpan.textContent = value;
    row.appendChild(valueSpan);

    return row;
  }

  /**
   * 励ましのメッセージを取得
   */
  _getEncouragementMessage() {
    const messages = [
      'おつかれさまでした',
      'よく がんばりました',
      'すばらしい！',
      'また やってみてね'
    ];

    // 結果に応じたメッセージ
    if (this.resultData) {
      if (this.resultData.score >= this.resultData.bestScore) {
        return 'あたらしい きろく！すごい！';
      }
      if (this.resultData.accuracy >= 90) {
        return 'とても じょうず！';
      }
      if (this.resultData.accuracy >= 70) {
        return 'よく がんばりました';
      }
    }

    // ランダムに選択
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * フッターを作成
   */
  _createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'result-footer';

    // リトライボタン（大きく）
    const retryBtn = document.createElement('button');
    retryBtn.className = 'result-btn retry-btn';
    retryBtn.setAttribute('tabindex', '0');
    retryBtn.setAttribute('aria-label', 'もういちど やる（Rキー）');
    retryBtn.innerHTML = '<span class="btn-main">もういちど</span><span class="btn-hint">R</span>';
    retryBtn.addEventListener('click', () => {
      audio.play('click');
      this._retry();
    });
    footer.appendChild(retryBtn);

    // ホームボタン
    const homeBtn = document.createElement('button');
    homeBtn.className = 'result-btn home-btn';
    homeBtn.setAttribute('tabindex', '0');
    homeBtn.setAttribute('aria-label', 'ホームに もどる（Escキー）');
    homeBtn.innerHTML = '<span class="btn-main">ホームへ</span><span class="btn-hint">Esc</span>';
    homeBtn.addEventListener('click', () => {
      audio.play('click');
      this._goHome();
    });
    footer.appendChild(homeBtn);

    return footer;
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
        background-color: var(--color-background);
        color: var(--color-text);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-family: 'Hiragino Kaku Gothic ProN', 'メイリオ', sans-serif;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease;
        z-index: 300;
      }

      .result-screen.visible {
        opacity: 1;
        visibility: visible;
      }

      /* メインコンテンツ */
      .result-main {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32px;
        text-align: center;
      }

      .result-title {
        font-size: var(--font-size-xxlarge);
        font-weight: normal;
        margin: 0 0 32px 0;
        color: var(--color-text);
      }

      /* 結果コンテナ */
      .result-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 280px;
        margin-bottom: 24px;
      }

      .result-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        background-color: var(--color-surface);
        border-radius: 12px;
        border: 1px solid var(--color-border);
      }

      .result-row.highlight {
        background-color: var(--color-primary);
        border-color: var(--color-primary);
      }

      .result-row.highlight .result-label,
      .result-row.highlight .result-value {
        color: white;
      }

      .result-label {
        font-size: var(--font-size-base);
        color: var(--color-text-secondary);
      }

      .result-value {
        font-size: var(--font-size-large);
        font-weight: bold;
        color: var(--color-text);
      }

      .result-value.centered {
        text-align: center;
        width: 100%;
      }

      .result-message {
        font-size: var(--font-size-large);
        color: var(--color-text-secondary);
        margin: 0;
        padding: 16px;
      }

      /* フッター */
      .result-footer {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 24px;
        width: 100%;
        max-width: 320px;
      }

      .result-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
        width: 100%;
        min-height: 64px;
        padding: 20px 32px;
        font-size: var(--font-size-large);
        border-radius: 16px;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.1s;
      }

      .result-btn:focus {
        outline: none;
        box-shadow: 0 0 0 4px rgba(74, 144, 217, 0.3);
      }

      .result-btn:active {
        transform: scale(0.98);
      }

      .btn-main {
        font-weight: bold;
      }

      .btn-hint {
        font-size: var(--font-size-small);
        opacity: 0.7;
        padding: 4px 8px;
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
      }

      /* リトライボタン（大きく強調） */
      .retry-btn {
        background-color: var(--color-primary);
        color: white;
        border: 3px solid var(--color-primary);
        min-height: 80px;
        font-size: var(--font-size-xlarge);
      }

      .retry-btn:hover {
        background-color: var(--color-primary-hover);
        border-color: var(--color-primary-hover);
      }

      .retry-btn .btn-hint {
        background-color: rgba(255, 255, 255, 0.2);
      }

      /* ホームボタン */
      .home-btn {
        background-color: var(--color-surface);
        color: var(--color-text);
        border: 2px solid var(--color-border);
      }

      .home-btn:hover {
        background-color: var(--color-border);
      }

      /* レスポンシブ */
      @media (max-width: 480px) {
        .result-main {
          padding: 24px 16px;
        }

        .result-container {
          min-width: 100%;
          width: 100%;
          padding: 0 16px;
          box-sizing: border-box;
        }

        .result-footer {
          padding: 16px;
        }
      }
    `;

    document.head.appendChild(style);
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

    // 結果コンテンツを更新
    this._updateResultContent();

    this.container.classList.add('visible');
    this.isVisible = true;

    // キーボードリスナーを追加
    document.addEventListener('keydown', this._handleKeyDown);

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
