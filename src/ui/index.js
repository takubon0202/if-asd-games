/**
 * ASD&LD向け「目の動き」トレーニングWebゲーム
 * UIモジュール
 */

// 各画面のエクスポート
export { HomeScreen, homeScreen } from './home.js';
export { SettingsScreen, settingsScreen } from './settings.js';
export { HelpScreen, helpScreen } from './help.js';
export { ResultScreen, resultScreen } from './result.js';
export { GameHUD, gameHUD } from './hud.js';

/**
 * UIマネージャー - 画面遷移を管理
 */
import { stateMachine, GameState } from '../engine/state.js';
import { homeScreen } from './home.js';
import { settingsScreen } from './settings.js';
import { helpScreen } from './help.js';
import { resultScreen } from './result.js';
import { gameHUD } from './hud.js';

class UIManager {
  constructor() {
    this.initialized = false;
    this.unsubscribe = null;
  }

  /**
   * UIマネージャーを初期化
   */
  init() {
    if (this.initialized) return;

    // 状態変更を購読
    this.unsubscribe = stateMachine.subscribe((event) => {
      if (event.type === 'stateChange') {
        this._handleStateChange(event.oldState, event.newState, event.data);
      }
    });

    this.initialized = true;
  }

  /**
   * 状態変更をハンドル
   */
  _handleStateChange(oldState, newState, data) {
    // 古い画面を非表示
    this._hideScreen(oldState);

    // 新しい画面を表示
    this._showScreen(newState, data);
  }

  /**
   * 画面を非表示
   */
  _hideScreen(state) {
    switch (state) {
      case GameState.HOME:
        homeScreen.hide();
        break;
      case GameState.SETTINGS:
        settingsScreen.hide();
        break;
      case GameState.HELP:
        helpScreen.hide();
        break;
      case GameState.RESULT:
        resultScreen.hide();
        break;
      case GameState.PLAYING:
        gameHUD.hide();
        break;
      case GameState.PAUSED:
        // HUDは維持
        break;
    }
  }

  /**
   * 画面を表示
   */
  _showScreen(state, data) {
    switch (state) {
      case GameState.HOME:
        homeScreen.show();
        break;
      case GameState.SETTINGS:
        settingsScreen.show();
        break;
      case GameState.HELP:
        helpScreen.show();
        break;
      case GameState.RESULT:
        resultScreen.show(data);
        break;
      case GameState.PLAYING:
        gameHUD.show();
        break;
      case GameState.PAUSED:
        // HUDは維持
        break;
    }
  }

  /**
   * 全画面を非表示
   */
  hideAll() {
    homeScreen.hide();
    settingsScreen.hide();
    helpScreen.hide();
    resultScreen.hide();
    gameHUD.hide();
  }

  /**
   * 破棄
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    homeScreen.destroy();
    settingsScreen.destroy();
    helpScreen.destroy();
    resultScreen.destroy();
    gameHUD.destroy();

    this.initialized = false;
  }
}

// シングルトンインスタンス
export const uiManager = new UIManager();
