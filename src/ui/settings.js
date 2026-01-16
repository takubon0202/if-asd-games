/**
 * Settings画面 - 設定
 * ASD&LD向け「目の動き」トレーニングWebゲーム
 */

import { stateMachine, GameState } from '../engine/state.js';
import { storage } from '../engine/storage.js';
import { theme, ThemeColors } from '../engine/theme.js';
import { audio } from '../engine/audio.js';

// 設定オプション定義
const SETTINGS_OPTIONS = {
  speed: {
    label: 'はやさ',
    options: [
      { value: 0.25, label: 'とてもゆっくり' },
      { value: 0.5, label: 'ゆっくり' },
      { value: 0.75, label: 'ふつう' },
      { value: 1.0, label: 'はやい' }
    ]
  },
  simultaneousCount: {
    label: 'どうじひょうじすう',
    options: [
      { value: 1, label: '1つ' },
      { value: 2, label: '2つ' },
      { value: 3, label: '3つ' }
    ]
  },
  guide: {
    label: 'ガイド',
    options: [
      { value: true, label: 'ON' },
      { value: false, label: 'OFF' }
    ]
  },
  contrast: {
    label: 'コントラスト',
    options: [
      { value: 'low', label: 'ひくい' },
      { value: 'medium', label: 'ふつう' },
      { value: 'high', label: 'たかい' }
    ]
  },
  sound: {
    label: 'おと',
    options: [
      { value: true, label: 'ON' },
      { value: false, label: 'OFF' }
    ]
  },
  fontSize: {
    label: 'もじサイズ',
    options: [
      { value: 'medium', label: 'ふつう' },
      { value: 'large', label: 'おおきい' }
    ]
  },
  theme: {
    label: 'はいけい',
    options: [
      { value: 'white', label: 'しろ' },
      { value: 'sepia', label: 'クリーム' },
      { value: 'gray', label: 'グレー' },
      { value: 'black', label: 'くろ' }
    ]
  }
};

export class SettingsScreen {
  constructor() {
    this.container = null;
    this.isVisible = false;
    this.tempSettings = {};

    // キーボードハンドラをバインド
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }

  /**
   * 画面を作成
   */
  _createScreen() {
    this.container = document.createElement('div');
    this.container.id = 'settings-screen';
    this.container.className = 'screen settings-screen';
    this.container.setAttribute('role', 'dialog');
    this.container.setAttribute('aria-label', 'せってい');
    this.container.setAttribute('aria-modal', 'true');

    // ヘッダー
    const header = this._createHeader();
    this.container.appendChild(header);

    // 設定フォーム
    const form = this._createForm();
    this.container.appendChild(form);

    // フッター（ボタン）
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
    header.className = 'settings-header';

    const title = document.createElement('h1');
    title.className = 'settings-title';
    title.textContent = 'せってい';
    header.appendChild(title);

    return header;
  }

  /**
   * 設定フォームを作成
   */
  _createForm() {
    const form = document.createElement('div');
    form.className = 'settings-form';
    form.setAttribute('role', 'form');

    // 各設定項目を作成
    Object.entries(SETTINGS_OPTIONS).forEach(([key, config]) => {
      const group = this._createSettingGroup(key, config);
      form.appendChild(group);
    });

    return form;
  }

  /**
   * 設定グループを作成
   */
  _createSettingGroup(key, config) {
    const group = document.createElement('div');
    group.className = 'setting-group';
    group.dataset.settingKey = key;

    // ラベル
    const label = document.createElement('label');
    label.className = 'setting-label';
    label.textContent = config.label;
    label.id = `label-${key}`;
    group.appendChild(label);

    // オプションボタングループ
    const optionsGroup = document.createElement('div');
    optionsGroup.className = 'setting-options';
    optionsGroup.setAttribute('role', 'radiogroup');
    optionsGroup.setAttribute('aria-labelledby', `label-${key}`);

    config.options.forEach((option, index) => {
      const btn = document.createElement('button');
      btn.className = 'setting-option';
      btn.type = 'button';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.setAttribute('tabindex', index === 0 ? '0' : '-1');
      btn.dataset.value = JSON.stringify(option.value);
      btn.textContent = option.label;

      btn.addEventListener('click', () => {
        audio.play('click');
        this._selectOption(key, option.value, optionsGroup);
      });

      optionsGroup.appendChild(btn);
    });

    group.appendChild(optionsGroup);

    return group;
  }

  /**
   * オプションを選択
   */
  _selectOption(key, value, optionsGroup) {
    // 一時設定を更新
    this.tempSettings[key] = value;

    // UIを更新
    const buttons = optionsGroup.querySelectorAll('.setting-option');
    buttons.forEach(btn => {
      const btnValue = JSON.parse(btn.dataset.value);
      const isSelected = btnValue === value;
      btn.classList.toggle('selected', isSelected);
      btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      btn.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    // テーマプレビュー
    if (key === 'theme' || key === 'contrast' || key === 'fontSize') {
      theme.apply({
        theme: this.tempSettings.theme,
        contrast: this.tempSettings.contrast,
        fontSize: this.tempSettings.fontSize
      });
    }

    // 音のプレビュー
    if (key === 'sound') {
      audio.applyFromSettings(value);
    }
  }

  /**
   * フッターを作成
   */
  _createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'settings-footer';

    // キャンセルボタン
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'settings-btn cancel-btn';
    cancelBtn.setAttribute('tabindex', '0');
    cancelBtn.textContent = 'もどる';
    cancelBtn.addEventListener('click', () => {
      audio.play('click');
      this._cancel();
    });
    footer.appendChild(cancelBtn);

    // 保存ボタン
    const saveBtn = document.createElement('button');
    saveBtn.className = 'settings-btn save-btn';
    saveBtn.setAttribute('tabindex', '0');
    saveBtn.textContent = 'ほぞん';
    saveBtn.addEventListener('click', () => {
      audio.play('success');
      this._save();
    });
    footer.appendChild(saveBtn);

    return footer;
  }

  /**
   * スタイルを適用
   */
  _applyStyles() {
    if (document.getElementById('settings-screen-styles')) return;

    const style = document.createElement('style');
    style.id = 'settings-screen-styles';
    style.textContent = `
      .settings-screen {
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

      .settings-screen.visible {
        opacity: 1;
        visibility: visible;
      }

      /* ヘッダー */
      .settings-header {
        padding: 20px 24px;
        border-bottom: 1px solid var(--color-border);
        text-align: center;
      }

      .settings-title {
        font-size: var(--font-size-xlarge);
        font-weight: normal;
        margin: 0;
        color: var(--color-text);
      }

      /* フォーム */
      .settings-form {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
        max-width: 600px;
        margin: 0 auto;
        width: 100%;
        box-sizing: border-box;
      }

      .setting-group {
        margin-bottom: 24px;
        padding-bottom: 24px;
        border-bottom: 1px solid var(--color-border);
      }

      .setting-group:last-child {
        border-bottom: none;
      }

      .setting-label {
        display: block;
        font-size: var(--font-size-large);
        margin-bottom: 12px;
        color: var(--color-text);
      }

      .setting-options {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .setting-option {
        flex: 1;
        min-width: 100px;
        min-height: 48px;
        padding: 12px 16px;
        background-color: var(--color-surface);
        color: var(--color-text);
        border: 2px solid var(--color-border);
        border-radius: 8px;
        font-size: var(--font-size-base);
        cursor: pointer;
        transition: background-color 0.2s, border-color 0.2s;
      }

      .setting-option:hover {
        border-color: var(--color-primary);
      }

      .setting-option:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.3);
      }

      .setting-option.selected {
        background-color: var(--color-primary);
        border-color: var(--color-primary);
        color: white;
      }

      /* フッター */
      .settings-footer {
        display: flex;
        justify-content: center;
        gap: 24px;
        padding: 24px;
        border-top: 1px solid var(--color-border);
        background-color: var(--color-surface);
      }

      .settings-btn {
        min-width: 140px;
        min-height: 56px;
        padding: 16px 32px;
        font-size: var(--font-size-large);
        border-radius: 12px;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.1s;
      }

      .settings-btn:focus {
        outline: none;
        box-shadow: 0 0 0 4px rgba(74, 144, 217, 0.3);
      }

      .settings-btn:active {
        transform: scale(0.98);
      }

      .cancel-btn {
        background-color: var(--color-surface);
        color: var(--color-text);
        border: 2px solid var(--color-border);
      }

      .cancel-btn:hover {
        background-color: var(--color-border);
      }

      .save-btn {
        background-color: var(--color-primary);
        color: white;
        border: 2px solid var(--color-primary);
      }

      .save-btn:hover {
        background-color: var(--color-primary-hover);
        border-color: var(--color-primary-hover);
      }

      /* レスポンシブ */
      @media (max-width: 480px) {
        .setting-options {
          flex-direction: column;
        }

        .setting-option {
          width: 100%;
        }

        .settings-footer {
          flex-direction: column;
          gap: 12px;
        }

        .settings-btn {
          width: 100%;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * 現在の設定をUIに反映
   */
  _loadCurrentSettings() {
    const settings = storage.getSettings();

    // speedの変換（古い形式からの互換性）
    let speed = settings.speed;
    if (typeof speed === 'string') {
      const speedMap = { slow: 0.5, medium: 0.75, fast: 1.0 };
      speed = speedMap[speed] || 0.75;
    }

    this.tempSettings = {
      speed: speed,
      simultaneousCount: settings.simultaneousCount || 1,
      guide: settings.guide !== false,
      contrast: settings.contrast || 'medium',
      sound: settings.sound || false,
      fontSize: settings.fontSize || 'medium',
      theme: settings.theme || 'white'
    };

    // UIを更新
    Object.entries(this.tempSettings).forEach(([key, value]) => {
      const group = this.container.querySelector(`[data-setting-key="${key}"]`);
      if (group) {
        const optionsGroup = group.querySelector('.setting-options');
        const buttons = optionsGroup.querySelectorAll('.setting-option');
        buttons.forEach(btn => {
          const btnValue = JSON.parse(btn.dataset.value);
          const isSelected = btnValue === value;
          btn.classList.toggle('selected', isSelected);
          btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
          btn.setAttribute('tabindex', isSelected ? '0' : '-1');
        });
      }
    });
  }

  /**
   * 設定を保存
   */
  _save() {
    // localStorageに保存
    storage.setSettings(this.tempSettings);

    // テーマを適用
    theme.apply({
      theme: this.tempSettings.theme,
      contrast: this.tempSettings.contrast,
      fontSize: this.tempSettings.fontSize
    });

    // 音声設定を適用
    audio.applyFromSettings(this.tempSettings.sound);

    // ホームに戻る
    stateMachine.goHome();
  }

  /**
   * キャンセル
   */
  _cancel() {
    // 元の設定に戻す
    const settings = storage.getSettings();
    theme.apply({
      theme: settings.theme || 'white',
      contrast: settings.contrast || 'medium',
      fontSize: settings.fontSize || 'medium'
    });
    audio.applyFromSettings(settings.sound || false);

    // ホームに戻る
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
        this._cancel();
        break;

      case 'Enter':
        if (event.target.classList.contains('save-btn')) {
          // 保存ボタンのデフォルト動作に任せる
        }
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

    // 現在の設定を読み込み
    this._loadCurrentSettings();

    this.container.classList.add('visible');
    this.isVisible = true;

    // キーボードリスナーを追加
    document.addEventListener('keydown', this._handleKeyDown);

    // 最初の設定項目にフォーカス
    setTimeout(() => {
      const firstOption = this.container.querySelector('.setting-option.selected, .setting-option');
      if (firstOption) {
        firstOption.focus();
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
export const settingsScreen = new SettingsScreen();
