/**
 * StateMachine - ゲーム状態管理
 * subscribe/unsubscribeパターンによる状態遷移通知
 */

// 利用可能な状態
export const GameState = {
  HOME: 'HOME',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  RESULT: 'RESULT',
  SETTINGS: 'SETTINGS',
  HELP: 'HELP'
};

// 許可される状態遷移
const VALID_TRANSITIONS = {
  [GameState.HOME]: [GameState.PLAYING, GameState.SETTINGS, GameState.HELP],
  [GameState.PLAYING]: [GameState.PAUSED, GameState.RESULT, GameState.HOME],
  [GameState.PAUSED]: [GameState.PLAYING, GameState.HOME, GameState.SETTINGS, GameState.RESULT],
  [GameState.RESULT]: [GameState.PLAYING, GameState.HOME],
  [GameState.SETTINGS]: [GameState.HOME, GameState.PAUSED],
  [GameState.HELP]: [GameState.HOME, GameState.PLAYING]
};

export class StateMachine {
  constructor() {
    this.currentState = GameState.HOME;
    this.previousState = null;
    this.currentGame = null;

    // サブスクライバー
    this.subscribers = new Set();
    this.stateSubscribers = new Map(); // 特定状態のサブスクライバー

    // 状態遷移履歴
    this.history = [];
    this.maxHistoryLength = 10;
  }

  /**
   * 現在の状態を取得
   * @returns {string}
   */
  getState() {
    return this.currentState;
  }

  /**
   * 前の状態を取得
   * @returns {string|null}
   */
  getPreviousState() {
    return this.previousState;
  }

  /**
   * 現在のゲームを取得
   * @returns {string|null}
   */
  getCurrentGame() {
    return this.currentGame;
  }

  /**
   * 現在のゲームを設定
   * @param {string} gameName - ゲーム名
   */
  setCurrentGame(gameName) {
    const oldGame = this.currentGame;
    this.currentGame = gameName;

    if (oldGame !== gameName) {
      this._notifySubscribers({
        type: 'gameChange',
        oldGame,
        newGame: gameName
      });
    }
  }

  /**
   * 状態遷移が有効かどうかをチェック
   * @param {string} from - 遷移元の状態
   * @param {string} to - 遷移先の状態
   * @returns {boolean}
   */
  canTransition(from, to) {
    const validTargets = VALID_TRANSITIONS[from];
    return validTargets && validTargets.includes(to);
  }

  /**
   * 状態を遷移
   * @param {string} newState - 新しい状態
   * @param {Object} [data] - 遷移時のデータ
   * @returns {boolean} 遷移が成功したかどうか
   */
  transition(newState, data = {}) {
    // 同じ状態への遷移は無視
    if (this.currentState === newState) {
      return false;
    }

    // 遷移の有効性をチェック
    if (!this.canTransition(this.currentState, newState)) {
      console.warn(`Invalid state transition: ${this.currentState} -> ${newState}`);
      return false;
    }

    const oldState = this.currentState;
    this.previousState = oldState;
    this.currentState = newState;

    // 履歴に追加
    this.history.push({
      from: oldState,
      to: newState,
      timestamp: Date.now(),
      data
    });

    // 履歴の長さを制限
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }

    // サブスクライバーに通知
    this._notifySubscribers({
      type: 'stateChange',
      oldState,
      newState,
      data
    });

    return true;
  }

  /**
   * 強制的に状態を設定（遷移チェックをスキップ）
   * @param {string} newState - 新しい状態
   * @param {Object} [data] - 遷移時のデータ
   */
  forceState(newState, data = {}) {
    const oldState = this.currentState;
    this.previousState = oldState;
    this.currentState = newState;

    this._notifySubscribers({
      type: 'stateChange',
      oldState,
      newState,
      data,
      forced: true
    });
  }

  /**
   * 特定の状態かどうかをチェック
   * @param {string} state - チェックする状態
   * @returns {boolean}
   */
  is(state) {
    return this.currentState === state;
  }

  /**
   * 複数の状態のいずれかかどうかをチェック
   * @param {...string} states - チェックする状態の配列
   * @returns {boolean}
   */
  isAny(...states) {
    return states.includes(this.currentState);
  }

  /**
   * サブスクライバーに通知
   * @param {Object} event - イベントオブジェクト
   */
  _notifySubscribers(event) {
    // 全体サブスクライバーに通知
    for (const callback of this.subscribers) {
      try {
        callback(event);
      } catch (error) {
        console.error('State subscriber error:', error);
      }
    }

    // 特定状態のサブスクライバーに通知
    if (event.type === 'stateChange') {
      const stateCallbacks = this.stateSubscribers.get(event.newState);
      if (stateCallbacks) {
        for (const callback of stateCallbacks) {
          try {
            callback(event);
          } catch (error) {
            console.error('State subscriber error:', error);
          }
        }
      }
    }
  }

  /**
   * 状態変更を購読
   * @param {function} callback - コールバック関数
   * @returns {function} 購読解除関数
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.unsubscribe(callback);
  }

  /**
   * 購読を解除
   * @param {function} callback - コールバック関数
   */
  unsubscribe(callback) {
    this.subscribers.delete(callback);
  }

  /**
   * 特定の状態への遷移を購読
   * @param {string} state - 購読する状態
   * @param {function} callback - コールバック関数
   * @returns {function} 購読解除関数
   */
  subscribeToState(state, callback) {
    if (!this.stateSubscribers.has(state)) {
      this.stateSubscribers.set(state, new Set());
    }
    this.stateSubscribers.get(state).add(callback);

    return () => this.unsubscribeFromState(state, callback);
  }

  /**
   * 特定の状態への購読を解除
   * @param {string} state - 状態
   * @param {function} callback - コールバック関数
   */
  unsubscribeFromState(state, callback) {
    const callbacks = this.stateSubscribers.get(state);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * ホーム画面へ遷移
   */
  goHome() {
    this.transition(GameState.HOME);
  }

  /**
   * プレイ画面へ遷移
   * @param {string} [gameName] - ゲーム名
   */
  play(gameName) {
    if (gameName) {
      this.setCurrentGame(gameName);
    }
    this.transition(GameState.PLAYING);
  }

  /**
   * 一時停止
   */
  pause() {
    this.transition(GameState.PAUSED);
  }

  /**
   * 再開
   */
  resume() {
    if (this.currentState === GameState.PAUSED) {
      this.transition(GameState.PLAYING);
    }
  }

  /**
   * 結果画面へ遷移
   * @param {Object} [resultData] - 結果データ
   */
  showResult(resultData = {}) {
    this.transition(GameState.RESULT, resultData);
  }

  /**
   * 設定画面へ遷移
   */
  openSettings() {
    this.transition(GameState.SETTINGS);
  }

  /**
   * ヘルプ画面へ遷移
   */
  openHelp() {
    this.transition(GameState.HELP);
  }

  /**
   * 前の状態に戻る
   */
  goBack() {
    if (this.previousState) {
      this.transition(this.previousState);
    }
  }

  /**
   * 状態遷移履歴を取得
   * @returns {Array}
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * リセット
   */
  reset() {
    this.currentState = GameState.HOME;
    this.previousState = null;
    this.currentGame = null;
    this.history = [];
  }
}

// シングルトンインスタンス
export const stateMachine = new StateMachine();
