/**
 * Home画面 - ゲーム選択
 * ASD&LD向け「目の動き」トレーニングWebゲーム
 *
 * デザインガイドライン準拠版
 */

import { stateMachine, GameState } from '../engine/state.js';
import { theme } from '../engine/theme.js';
import { audio } from '../engine/audio.js';

// カラーパレット（Figmaテンプレートから抽出した色を追加）
const COLORS = {
  // 背景色
  background: '#FAFAFA',
  surface: '#FFFFFF',

  // ゲームカード背景（Figma由来のパステル + オリジナル）
  gameA: { bg: '#E8F5E9', hover: '#C8E6C9', border: '#4ECB71', text: '#537250' },  // Figma緑
  gameB: { bg: '#F3E5F5', hover: '#E1BEE7', border: '#D99BFF', text: '#73627F' },  // Figma紫
  gameC: { bg: '#FFF3E0', hover: '#FFE0B2', border: '#FFCC80', text: '#E65100' },  // オレンジ

  // アクセント
  primary: '#4ECB71',      // Figma緑（明るく元気な色）
  primaryHover: '#3DA85B',
  accent: '#D99BFF',       // Figma紫（アクセント）

  // テキスト
  text: '#37474F',         // ダークグレー（柔らかい黒）
  textSecondary: '#546E7A', // コントラスト比4.5:1以上に改善

  // フッター
  footer: '#F5F5F5',
};

// ゲーム情報（ASD/LD向け：絵文字を廃止しシンプルなテキストアイコンに変更）
const GAMES = [
  {
    id: 'gameA',
    name: 'ゲーム A',
    title: 'おいかけっこ',
    description: 'うごく まるを めで おいかける',
    icon: 'A',
    colors: COLORS.gameA
  },
  {
    id: 'gameB',
    name: 'ゲーム B',
    title: 'みつけよう',
    description: 'かくれた しるしを さがす',
    icon: 'B',
    colors: COLORS.gameB
  },
  {
    id: 'gameC',
    name: 'ゲーム C',
    title: 'じゅんばん',
    description: 'すうじを じゅんばんに おす',
    icon: 'C',
    colors: COLORS.gameC
  }
];

export class HomeScreen {
  constructor() {
    this.container = null;
    this.isVisible = false;
    this.focusedIndex = 0;

    // イベントリスナー登録状態（多重登録防止）
    this._keyListenerAttached = false;

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

    // タイトルコンテナ
    const titleContainer = document.createElement('div');
    titleContainer.className = 'header-title-container';

    // タイトル
    const title = document.createElement('h1');
    title.className = 'home-title';
    title.textContent = 'めのうんどう';
    titleContainer.appendChild(title);

    // サブタイトル
    const subtitle = document.createElement('p');
    subtitle.className = 'home-subtitle';
    subtitle.textContent = 'たのしく トレーニング';
    titleContainer.appendChild(subtitle);

    header.appendChild(titleContainer);

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
    grid.setAttribute('aria-live', 'polite');

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
    card.setAttribute('aria-describedby', `game-desc-${game.id}`);
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
    desc.id = `game-desc-${game.id}`;
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
    notice.setAttribute('aria-live', 'polite');
    notice.textContent = 'つかれたら やすんでね';
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
        background-color: ${COLORS.background};
        color: ${COLORS.text};
        display: flex;
        flex-direction: column;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: clamp(16px, 1vw + 14px, 18px);
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease;
        z-index: 100;
      }

      .home-screen.visible {
        opacity: 1;
        visibility: visible;
      }

      /* ヘッダー - グラデーション背景 */
      .home-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px 32px;
        background: linear-gradient(135deg, ${COLORS.primary} 0%, #7986CB 100%);
        color: white;
      }

      .header-title-container {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .home-title {
        font-size: clamp(28px, 3vw + 20px, 32px);
        font-weight: bold;
        margin: 0;
        color: white;
      }

      .home-subtitle {
        font-size: clamp(16px, 1vw + 14px, 18px);
        margin: 0;
        color: rgba(255, 255, 255, 0.9);
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
        background-color: rgba(255, 255, 255, 0.2);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-radius: 12px;
        font-size: clamp(16px, 1vw + 14px, 18px);
        cursor: pointer;
        transition: background-color 0.2s, border-color 0.2s, transform 0.2s;
      }

      .header-btn:hover,
      .header-btn:focus {
        background-color: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.6);
        transform: translateY(-2px);
        outline: none;
      }

      .header-btn:focus {
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.4);
      }

      .btn-icon {
        font-size: clamp(18px, 1vw + 16px, 20px);
      }

      /* メインコンテンツ */
      .home-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px;
        overflow-y: auto;
      }

      .section-title {
        font-size: clamp(20px, 2vw + 16px, 24px);
        font-weight: bold;
        margin: 0 0 32px 0;
        color: ${COLORS.text};
      }

      /* ゲームカードグリッド */
      .game-grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 32px;
        max-width: 1100px;
      }

      .game-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 300px;
        height: 240px;
        padding: 24px;
        background-color: ${COLORS.surface};
        border: 3px solid transparent;
        border-radius: 24px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
      }

      .game-card:hover,
      .game-card:focus {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
        outline: none;
      }

      .game-card:focus {
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15), 0 0 0 4px rgba(92, 107, 192, 0.3);
      }

      /* Game A - おいかけっこ (水色) */
      .game-card[data-game-id="gameA"] {
        background-color: ${COLORS.gameA.bg};
        border-color: ${COLORS.gameA.border};
      }
      .game-card[data-game-id="gameA"]:hover,
      .game-card[data-game-id="gameA"]:focus {
        background-color: ${COLORS.gameA.hover};
      }
      .game-card[data-game-id="gameA"] .game-desc {
        color: ${COLORS.gameA.text};
      }

      /* Game B - みつけよう (緑) */
      .game-card[data-game-id="gameB"] {
        background-color: ${COLORS.gameB.bg};
        border-color: ${COLORS.gameB.border};
      }
      .game-card[data-game-id="gameB"]:hover,
      .game-card[data-game-id="gameB"]:focus {
        background-color: ${COLORS.gameB.hover};
      }
      .game-card[data-game-id="gameB"] .game-desc {
        color: ${COLORS.gameB.text};
      }

      /* Game C - じゅんばん (オレンジ) */
      .game-card[data-game-id="gameC"] {
        background-color: ${COLORS.gameC.bg};
        border-color: ${COLORS.gameC.border};
      }
      .game-card[data-game-id="gameC"]:hover,
      .game-card[data-game-id="gameC"]:focus {
        background-color: ${COLORS.gameC.hover};
      }
      .game-card[data-game-id="gameC"] .game-desc {
        color: ${COLORS.gameC.text};
      }

      .game-icon {
        font-size: clamp(48px, 4vw + 40px, 64px);
        margin-bottom: 16px;
        line-height: 1;
      }

      .game-name {
        font-size: clamp(20px, 2vw + 16px, 24px);
        font-weight: bold;
        margin-bottom: 8px;
        color: ${COLORS.text};
        text-align: center;
      }

      .game-desc {
        font-size: clamp(16px, 1vw + 14px, 18px);
        color: ${COLORS.textSecondary};
        text-align: center;
        line-height: 1.4;
      }

      /* フッター - 角丸上部 */
      .home-footer {
        padding: 20px 24px;
        text-align: center;
        background-color: ${COLORS.footer};
        border-radius: 24px 24px 0 0;
      }

      .notice-text {
        font-size: clamp(16px, 1vw + 14px, 18px);
        color: ${COLORS.textSecondary};
        margin: 0;
        line-height: 1.6;
      }

      /* prefers-reduced-motion対応 */
      @media (prefers-reduced-motion: reduce) {
        .home-screen {
          transition: none !important;
        }

        .game-card,
        .header-btn {
          transition: none !important;
          transform: none !important;
        }

        .game-card:hover,
        .game-card:focus,
        .header-btn:hover,
        .header-btn:focus {
          transform: none !important;
        }
      }

      /* 大画面 (1200px以上) */
      @media (min-width: 1200px) {
        .game-grid {
          max-width: 1400px;
        }

        .game-card {
          width: 340px;
          height: 280px;
        }

        .home-title {
          font-size: 40px;
        }
      }

      /* デスクトップ (1024px以下) */
      @media (max-width: 1024px) {
        .game-grid {
          gap: 24px;
        }

        .game-card {
          width: 280px;
          height: 220px;
        }
      }

      /* タブレット (768px以下) */
      @media (max-width: 768px) {
        .home-header {
          flex-direction: column;
          gap: 16px;
          padding: 20px 24px;
          text-align: center;
        }

        .home-title {
          font-size: clamp(24px, 4vw + 16px, 28px);
        }

        .home-subtitle {
          font-size: clamp(16px, 1vw + 14px, 18px);
        }

        .game-grid {
          flex-direction: column;
          align-items: center;
        }

        .game-card {
          width: 100%;
          max-width: 320px;
          height: 220px;
        }

        .game-icon {
          font-size: clamp(48px, 4vw + 40px, 56px);
        }

        .game-name {
          font-size: clamp(20px, 2vw + 16px, 22px);
        }

        .game-desc {
          font-size: clamp(16px, 1vw + 14px, 18px);
        }

        .header-btn .btn-text {
          display: none;
        }

        .section-title {
          font-size: clamp(18px, 2vw + 14px, 20px);
        }
      }

      /* モバイル (480px以下) */
      @media (max-width: 480px) {
        .home-main {
          padding: 24px 16px;
        }

        .game-card {
          max-width: 100%;
          height: 200px;
          padding: 20px;
        }

        .game-icon {
          font-size: clamp(40px, 4vw + 32px, 48px);
          margin-bottom: 12px;
        }

        .game-name {
          font-size: clamp(18px, 2vw + 14px, 20px);
        }

        .game-desc {
          font-size: 16px;
        }

        .notice-text {
          font-size: 16px;
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

    // キーボードリスナーを追加（多重登録防止）
    if (!this._keyListenerAttached) {
      document.addEventListener('keydown', this._handleKeyDown);
      this._keyListenerAttached = true;
    }

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
    if (this._keyListenerAttached) {
      document.removeEventListener('keydown', this._handleKeyDown);
      this._keyListenerAttached = false;
    }
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
