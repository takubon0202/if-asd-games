/**
 * Help画面 - ヘルプ・説明
 * ASD&LD向け「目の動き」トレーニングWebゲーム
 */

import { stateMachine, GameState } from '../engine/state.js';
import { audio } from '../engine/audio.js';

// ヘルプコンテンツ
const HELP_CONTENT = {
  intro: {
    title: 'このゲームについて',
    text: 'めを うごかす れんしゅうの ゲームです。\nたのしみながら めの うんどうを しましょう。'
  },
  games: [
    {
      name: 'ゲーム A：おいかけっこ',
      rules: [
        'がめんを うごく まるを めで おいかけます',
        'まるが とまったら スペースキーを おします',
        'ただしい タイミングで おせたら せいこう'
      ]
    },
    {
      name: 'ゲーム B：みつけよう',
      rules: [
        'がめんの どこかに しるしが でます',
        'しるしを みつけたら スペースキーを おします',
        'できるだけ はやく みつけよう'
      ]
    },
    {
      name: 'ゲーム C：じゅんばん',
      rules: [
        'すうじが ばらばらに でます',
        '1から じゅんばんに クリックします',
        'まちがえずに さいごまで いこう'
      ]
    }
  ],
  controls: {
    title: 'そうさ ほうほう',
    items: [
      { key: 'スペースキー', action: 'アクション（おす・えらぶ）' },
      { key: 'R キー', action: 'もういちど やる（リトライ）' },
      { key: 'Esc キー', action: 'ホームに もどる' },
      { key: 'やじるしキー', action: 'せんたくを うごかす' }
    ]
  },
  notes: {
    title: 'ちゅうい',
    items: [
      'つかれたら むりせず やすみましょう',
      'めが いたくなったら すぐに やめましょう',
      'あかるい ばしょで あそびましょう',
      'ゲームは 1にち 15ふんまでが おすすめです'
    ]
  }
};

export class HelpScreen {
  constructor() {
    this.container = null;
    this.isVisible = false;

    // キーボードハンドラをバインド
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }

  /**
   * 画面を作成
   */
  _createScreen() {
    this.container = document.createElement('div');
    this.container.id = 'help-screen';
    this.container.className = 'screen help-screen';
    this.container.setAttribute('role', 'dialog');
    this.container.setAttribute('aria-label', 'ヘルプ');
    this.container.setAttribute('aria-modal', 'true');

    // ヘッダー
    const header = this._createHeader();
    this.container.appendChild(header);

    // メインコンテンツ
    const main = this._createMain();
    this.container.appendChild(main);

    // フッター
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
    header.className = 'help-header';

    const title = document.createElement('h1');
    title.className = 'help-title';
    title.textContent = 'ヘルプ';
    header.appendChild(title);

    return header;
  }

  /**
   * メインコンテンツを作成
   */
  _createMain() {
    const main = document.createElement('main');
    main.className = 'help-main';
    main.setAttribute('tabindex', '0');

    // イントロ
    const introSection = this._createSection(
      HELP_CONTENT.intro.title,
      this._createTextContent(HELP_CONTENT.intro.text)
    );
    main.appendChild(introSection);

    // ゲームルール
    const gamesSection = this._createSection(
      'ゲームの ルール',
      this._createGamesContent()
    );
    main.appendChild(gamesSection);

    // 操作方法
    const controlsSection = this._createSection(
      HELP_CONTENT.controls.title,
      this._createControlsContent()
    );
    main.appendChild(controlsSection);

    // 注意事項
    const notesSection = this._createSection(
      HELP_CONTENT.notes.title,
      this._createNotesContent()
    );
    main.appendChild(notesSection);

    return main;
  }

  /**
   * セクションを作成
   */
  _createSection(title, content) {
    const section = document.createElement('section');
    section.className = 'help-section';

    const heading = document.createElement('h2');
    heading.className = 'section-heading';
    heading.textContent = title;
    section.appendChild(heading);

    section.appendChild(content);

    return section;
  }

  /**
   * テキストコンテンツを作成
   */
  _createTextContent(text) {
    const p = document.createElement('p');
    p.className = 'help-text';
    p.innerHTML = text.replace(/\n/g, '<br>');
    return p;
  }

  /**
   * ゲームルールコンテンツを作成
   */
  _createGamesContent() {
    const container = document.createElement('div');
    container.className = 'games-content';

    HELP_CONTENT.games.forEach(game => {
      const gameBlock = document.createElement('div');
      gameBlock.className = 'game-block';

      const gameName = document.createElement('h3');
      gameName.className = 'game-name';
      gameName.textContent = game.name;
      gameBlock.appendChild(gameName);

      const rulesList = document.createElement('ul');
      rulesList.className = 'rules-list';
      game.rules.forEach(rule => {
        const li = document.createElement('li');
        li.textContent = rule;
        rulesList.appendChild(li);
      });
      gameBlock.appendChild(rulesList);

      container.appendChild(gameBlock);
    });

    return container;
  }

  /**
   * 操作方法コンテンツを作成
   */
  _createControlsContent() {
    const table = document.createElement('div');
    table.className = 'controls-table';
    table.setAttribute('role', 'list');

    HELP_CONTENT.controls.items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'control-row';
      row.setAttribute('role', 'listitem');

      const key = document.createElement('span');
      key.className = 'control-key';
      key.textContent = item.key;
      row.appendChild(key);

      const action = document.createElement('span');
      action.className = 'control-action';
      action.textContent = item.action;
      row.appendChild(action);

      table.appendChild(row);
    });

    return table;
  }

  /**
   * 注意事項コンテンツを作成
   */
  _createNotesContent() {
    const list = document.createElement('ul');
    list.className = 'notes-list';

    HELP_CONTENT.notes.items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    });

    return list;
  }

  /**
   * フッターを作成
   */
  _createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'help-footer';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'help-btn close-btn';
    closeBtn.setAttribute('tabindex', '0');
    closeBtn.textContent = 'とじる';
    closeBtn.addEventListener('click', () => {
      audio.play('click');
      this._close();
    });
    footer.appendChild(closeBtn);

    return footer;
  }

  /**
   * スタイルを適用
   */
  _applyStyles() {
    if (document.getElementById('help-screen-styles')) return;

    const style = document.createElement('style');
    style.id = 'help-screen-styles';
    style.textContent = `
      .help-screen {
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
        z-index: 200;
      }

      .help-screen.visible {
        opacity: 1;
        visibility: visible;
      }

      /* ヘッダー */
      .help-header {
        padding: 20px 24px;
        border-bottom: 1px solid var(--color-border);
        text-align: center;
      }

      .help-title {
        font-size: var(--font-size-xlarge);
        font-weight: normal;
        margin: 0;
        color: var(--color-text);
      }

      /* メインコンテンツ */
      .help-main {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
        max-width: 700px;
        margin: 0 auto;
        width: 100%;
        box-sizing: border-box;
      }

      .help-main:focus {
        outline: none;
      }

      .help-section {
        margin-bottom: 32px;
      }

      .section-heading {
        font-size: var(--font-size-large);
        font-weight: bold;
        margin: 0 0 16px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid var(--color-primary);
        color: var(--color-text);
      }

      .help-text {
        font-size: var(--font-size-base);
        line-height: 1.8;
        margin: 0;
        color: var(--color-text);
      }

      /* ゲームルール */
      .games-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .game-block {
        background-color: var(--color-surface);
        padding: 16px;
        border-radius: 8px;
        border: 1px solid var(--color-border);
      }

      .game-block .game-name {
        font-size: var(--font-size-base);
        font-weight: bold;
        margin: 0 0 12px 0;
        color: var(--color-primary);
      }

      .rules-list {
        margin: 0;
        padding-left: 24px;
        font-size: var(--font-size-base);
        line-height: 1.8;
      }

      .rules-list li {
        margin-bottom: 4px;
      }

      /* 操作方法 */
      .controls-table {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .control-row {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 16px;
        background-color: var(--color-surface);
        border-radius: 8px;
        border: 1px solid var(--color-border);
      }

      .control-key {
        display: inline-block;
        min-width: 140px;
        padding: 8px 12px;
        background-color: var(--color-background);
        border: 2px solid var(--color-border);
        border-radius: 6px;
        font-size: var(--font-size-base);
        font-weight: bold;
        text-align: center;
        color: var(--color-text);
      }

      .control-action {
        font-size: var(--font-size-base);
        color: var(--color-text);
      }

      /* 注意事項 */
      .notes-list {
        margin: 0;
        padding-left: 24px;
        font-size: var(--font-size-base);
        line-height: 1.8;
      }

      .notes-list li {
        margin-bottom: 8px;
        color: var(--color-text-secondary);
      }

      /* フッター */
      .help-footer {
        display: flex;
        justify-content: center;
        padding: 24px;
        border-top: 1px solid var(--color-border);
        background-color: var(--color-surface);
      }

      .help-btn {
        min-width: 160px;
        min-height: 56px;
        padding: 16px 32px;
        font-size: var(--font-size-large);
        border-radius: 12px;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.1s;
      }

      .help-btn:focus {
        outline: none;
        box-shadow: 0 0 0 4px rgba(74, 144, 217, 0.3);
      }

      .help-btn:active {
        transform: scale(0.98);
      }

      .close-btn {
        background-color: var(--color-primary);
        color: white;
        border: 2px solid var(--color-primary);
      }

      .close-btn:hover {
        background-color: var(--color-primary-hover);
        border-color: var(--color-primary-hover);
      }

      /* レスポンシブ */
      @media (max-width: 480px) {
        .control-row {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .control-key {
          min-width: auto;
          width: 100%;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * 画面を閉じる
   */
  _close() {
    stateMachine.goHome();
  }

  /**
   * キーボードイベントハンドラ
   */
  _handleKeyDown(event) {
    if (!this.isVisible) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        audio.play('click');
        this._close();
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

    // メインコンテンツにフォーカス（スクロール可能にする）
    setTimeout(() => {
      const main = this.container.querySelector('.help-main');
      if (main) {
        main.focus();
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
export const helpScreen = new HelpScreen();
