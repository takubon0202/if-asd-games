/**
 * Home画面 - ゲーム選択
 * ASD&LD向け「目の動き」トレーニングWebゲーム
 */

import { stateMachine, GameState } from '../engine/state.js';
import { theme } from '../engine/theme.js';
import { audio } from '../engine/audio.js';

// ゲーム情報
const GAMES = [
  {
    id: 'gameA',
    name: 'ゲーム A',
    title: 'おいかけっこ',
    description: 'うごく まるを めで おいかける',
    icon: '○'
  },
  {
    id: 'gameB',
    name: 'ゲーム B',
    title: 'みつけよう',
    description: 'かくれた しるしを さがす',
    icon: '◎'
  },
  {
    id: 'gameC',
    name: 'ゲーム C',
    title: 'じゅんばん',
    description: 'すうじを じゅんばんに おす',
    icon: '123'
  }
];

export class HomeScreen {
  constructor() {
    this.container = null;
    this.isVisible = false;
    this.focusedIndex = 0;

    // キーボードハンドラをバインド
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }

  /**
   * 画面を作成
   */
  _createScreen() {
    // コンテナ作成
    this.container = document.createElement('div');
    this.container.id = 'home-screen';
    this.container.className = 'screen home-screen';
    this.container.setAttribute('role', 'main');
    this.container.setAttribute('aria-label', 'ホームがめん');

    // ヘッダー
    const header = this._createHeader();
    this.container.appendChild(header);

    // メインコンテンツ
    const main = this._createMain();
    this.container.appendChild(main);

    // 注意書きフッター
    const footer = this._createFooter();
    this.container.appendChild(footer);

    // スタイルを適用
    this._applyStyles();

    document.body.appendChild(this.container);
  }

  /**
   * ヘッダーを作成
   */
  _createHeader() {
    const header = document.createElement('header');
    header.className = 'home-header';

    // タイトル
    const title = document.createElement('h1');
    title.className = 'home-title';
    title.textContent = 'めの うんどう';
    header.appendChild(title);

    // ボタングループ
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'header-buttons';

    // 設定ボタン
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'header-btn settings-btn';
    settingsBtn.setAttribute('aria-label', 'せってい');
    settingsBtn.setAttribute('tabindex', '0');
    settingsBtn.innerHTML = '<span class="btn-icon">⚙</span><span class="btn-text">せってい</span>';
    settingsBtn.addEventListener('click', () => {
      audio.play('click');
      stateMachine.openSettings();
    });
    buttonGroup.appendChild(settingsBtn);

    // ヘルプボタン
    const helpBtn = document.createElement('button');
    helpBtn.className = 'header-btn help-btn';
    helpBtn.setAttribute('aria-label', 'ヘルプ');
    helpBtn.setAttribute('tabindex', '0');
    helpBtn.innerHTML = '<span class="btn-icon">？</span><span class="btn-text">ヘルプ</span>';
    helpBtn.addEventListener('click', () => {
      audio.play('click');
      stateMachine.openHelp();
    });
    buttonGroup.appendChild(helpBtn);

    header.appendChild(buttonGroup);

    return header;
  }

  /**
   * メインコンテンツを作成
   */
  _createMain() {
    const main = document.createElement('main');
    main.className = 'home-main';

    // ゲーム選択のタイトル
    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'section-title';
    sectionTitle.textContent = 'ゲームを えらんでね';
    main.appendChild(sectionTitle);

    // ゲームカードグリッド
    const grid = document.createElement('div');
    grid.className = 'game-grid';
    grid.setAttribute('role', 'list');

    GAMES.forEach((game, index) => {
      const card = this._createGameCard(game, index);
      grid.appendChild(card);
    });

    main.appendChild(grid);

    return main;
  }

  /**
   * ゲームカードを作成
   */
  _createGameCard(game, index) {
    const card = document.createElement('button');
    card.className = 'game-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${game.title}：${game.description}`);
    card.dataset.gameId = game.id;
    card.dataset.index = index;

    // アイコン
    const icon = document.createElement('div');
    icon.className = 'game-icon';
    icon.textContent = game.icon;
    icon.setAttribute('aria-hidden', 'true');
    card.appendChild(icon);

    // ゲーム名
    const name = document.createElement('div');
    name.className = 'game-name';
    name.textContent = game.title;
    card.appendChild(name);

    // 説明
    const desc = document.createElement('div');
    desc.className = 'game-desc';
    desc.textContent = game.description;
    card.appendChild(desc);

    // クリックイベント
    card.addEventListener('click', () => {
      audio.play('click');
      this._selectGame(game.id);
    });

    // フォーカスイベント
    card.addEventListener('focus', () => {
      this.focusedIndex = index;
    });

    return card;
  }

  /**
   * フッター（注意書き）を作成
   */
  _createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'home-footer';
    footer.setAttribute('role', 'contentinfo');

    const notice = document.createElement('p');
    notice.className = 'notice-text';
    notice.innerHTML =
      'つかれたら やすんでね<br>' +
      'むりを しないで たのしもう';
    footer.appendChild(notice);

    return footer;
  }

  /**
   * スタイルを適用
   */
  _applyStyles() {
    if (document.getElementById('home-screen-styles')) return;

    const style = document.createElement('style');
    style.id = 'home-screen-styles';
    style.textContent = `
      .home-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--color-background);
        color: var(--color-text);
        display: flex;
        flex-direction: column;
        font-family: 'Hiragino Kaku Gothic ProN', 'メイリオ', sans-serif;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease;
        z-index: 100;
      }

      .home-screen.visible {
        opacity: 1;
        visibility: visible;
      }

      /* ヘッダー */
      .home-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid var(--color-border);
      }

      .home-title {
        font-size: var(--font-size-xlarge);
        font-weight: normal;
        margin: 0;
        color: var(--color-text);
      }

      .header-buttons {
        display: flex;
        gap: 12px;
      }

      .header-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        min-height: 48px;
        background-color: var(--color-surface);
        color: var(--color-text);
        border: 2px solid var(--color-border);
        border-radius: 8px;
        font-size: var(--font-size-base);
        cursor: pointer;
        transition: background-color 0.2s, border-color 0.2s;
      }

      .header-btn:hover,
      .header-btn:focus {
        background-color: var(--color-primary);
        border-color: var(--color-primary);
        color: white;
        outline: none;
      }

      .header-btn:focus {
        box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.3);
      }

      .btn-icon {
        font-size: var(--font-size-large);
      }

      /* メインコンテンツ */
      .home-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        overflow-y: auto;
      }

      .section-title {
        font-size: var(--font-size-large);
        font-weight: normal;
        margin: 0 0 32px 0;
        color: var(--color-text-secondary);
      }

      /* ゲームカードグリッド */
      .game-grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 24px;
        max-width: 900px;
      }

      .game-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 240px;
        height: 200px;
        padding: 24px;
        background-color: var(--color-surface);
        border: 3px solid var(--color-border);
        border-radius: 16px;
        cursor: pointer;
        transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
      }

      .game-card:hover,
      .game-card:focus {
        transform: translateY(-4px);
        border-color: var(--color-primary);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        outline: none;
      }

      .game-card:focus {
        box-shadow: 0 0 0 4px rgba(74, 144, 217, 0.3);
      }

      .game-icon {
        font-size: 48px;
        margin-bottom: 16px;
        color: var(--color-primary);
      }

      .game-name {
        font-size: var(--font-size-large);
        font-weight: bold;
        margin-bottom: 8px;
        color: var(--color-text);
      }

      .game-desc {
        font-size: var(--font-size-base);
        color: var(--color-text-secondary);
        text-align: center;
        line-height: 1.4;
      }

      /* フッター */
      .home-footer {
        padding: 16px 24px;
        text-align: center;
        border-top: 1px solid var(--color-border);
        background-color: var(--color-surface);
      }

      .notice-text {
        font-size: var(--font-size-base);
        color: var(--color-text-secondary);
        margin: 0;
        line-height: 1.6;
      }

      /* レスポンシブ */
      @media (max-width: 768px) {
        .home-header {
          flex-direction: column;
          gap: 16px;
        }

        .game-grid {
          flex-direction: column;
          align-items: center;
        }

        .game-card {
          width: 100%;
          max-width: 300px;
        }

        .header-btn .btn-text {
          display: none;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * ゲームを選択
   */
  _selectGame(gameId) {
    stateMachine.setCurrentGame(gameId);
    stateMachine.play(gameId);
  }

  /**
   * キーボードイベントハンドラ
   */
  _handleKeyDown(event) {
    if (!this.isVisible) return;

    const cards = this.container.querySelectorAll('.game-card');
    const numCards = cards.length;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        this.focusedIndex = (this.focusedIndex + 1) % numCards;
        cards[this.focusedIndex].focus();
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        this.focusedIndex = (this.focusedIndex - 1 + numCards) % numCards;
        cards[this.focusedIndex].focus();
        break;

      case 'Enter':
      case ' ':
        // デフォルトのボタン動作に任せる
        break;
    }
  }

  /**
   * 画面を表示
   */
  show() {
    if (!this.container) {
      this._createScreen();
    }

    this.container.classList.add('visible');
    this.isVisible = true;

    // キーボードリスナーを追加
    document.addEventListener('keydown', this._handleKeyDown);

    // 最初のカードにフォーカス
    setTimeout(() => {
      const firstCard = this.container.querySelector('.game-card');
      if (firstCard) {
        firstCard.focus();
      }
    }, 100);
  }

  /**
   * 画面を非表示
   */
  hide() {
    if (this.container) {
      this.container.classList.remove('visible');
    }
    this.isVisible = false;

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
export const homeScreen = new HomeScreen();
