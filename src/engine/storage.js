/**
 * Storage - ローカルストレージ管理
 * バージョニング対応、初期値のマージ
 */

// 現在のデータバージョン
const STORAGE_VERSION = 1;

// ストレージのキー
const STORAGE_KEY = 'asd_eye_training_game';

// デフォルト設定
const DEFAULT_SETTINGS = {
  speed: 'medium',      // slow / medium / fast
  guide: true,          // ガイド表示
  sound: false,         // サウンド（デフォルトOFF）
  theme: 'white',       // white / black / sepia / gray
  fontSize: 'medium',   // medium / large
  contrast: 'medium'    // low / medium / high
};

// デフォルト記録
const DEFAULT_RECORDS = {
  consecutiveDays: 0,       // 連続利用日数
  totalSessions: 0,         // 総セッション数
  lastPlayedGame: null,     // 最後にプレイしたゲーム
  lastPlayedDate: null,     // 最後にプレイした日付
  gameRecords: {}           // 各ゲームの記録
};

export class Storage {
  constructor() {
    this.data = this._load();
  }

  /**
   * ストレージからデータを読み込み
   * @returns {Object}
   */
  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        // 初期データを作成
        return this._createInitialData();
      }

      const parsed = JSON.parse(raw);

      // バージョンチェックとマイグレーション
      if (parsed.version !== STORAGE_VERSION) {
        return this._migrate(parsed);
      }

      // デフォルト値とマージ（新しいプロパティが追加された場合に対応）
      return this._mergeWithDefaults(parsed);

    } catch (error) {
      console.warn('Storage load error:', error);
      return this._createInitialData();
    }
  }

  /**
   * 初期データを作成
   * @returns {Object}
   */
  _createInitialData() {
    return {
      version: STORAGE_VERSION,
      settings: { ...DEFAULT_SETTINGS },
      records: { ...DEFAULT_RECORDS }
    };
  }

  /**
   * デフォルト値とマージ
   * @param {Object} data - 既存のデータ
   * @returns {Object}
   */
  _mergeWithDefaults(data) {
    return {
      version: STORAGE_VERSION,
      settings: { ...DEFAULT_SETTINGS, ...data.settings },
      records: { ...DEFAULT_RECORDS, ...data.records }
    };
  }

  /**
   * データのマイグレーション
   * @param {Object} oldData - 古いバージョンのデータ
   * @returns {Object}
   */
  _migrate(oldData) {
    // 現在はv1のみなので、単純にマージ
    const newData = this._mergeWithDefaults(oldData);
    newData.version = STORAGE_VERSION;
    this._save(newData);
    return newData;
  }

  /**
   * ストレージにデータを保存
   * @param {Object} data - 保存するデータ
   */
  _save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Storage save error:', error);
    }
  }

  /**
   * 設定を取得
   * @param {string} [key] - 設定キー（省略時は全設定）
   * @returns {*}
   */
  getSettings(key) {
    if (key) {
      return this.data.settings[key];
    }
    return { ...this.data.settings };
  }

  /**
   * 設定を更新
   * @param {string|Object} keyOrSettings - 設定キーまたは設定オブジェクト
   * @param {*} [value] - 値（keyが文字列の場合）
   */
  setSettings(keyOrSettings, value) {
    if (typeof keyOrSettings === 'string') {
      this.data.settings[keyOrSettings] = value;
    } else {
      Object.assign(this.data.settings, keyOrSettings);
    }
    this._save(this.data);
  }

  /**
   * 記録を取得
   * @param {string} [key] - 記録キー（省略時は全記録）
   * @returns {*}
   */
  getRecords(key) {
    if (key) {
      return this.data.records[key];
    }
    return { ...this.data.records };
  }

  /**
   * 記録を更新
   * @param {string|Object} keyOrRecords - 記録キーまたは記録オブジェクト
   * @param {*} [value] - 値（keyが文字列の場合）
   */
  setRecords(keyOrRecords, value) {
    if (typeof keyOrRecords === 'string') {
      this.data.records[keyOrRecords] = value;
    } else {
      Object.assign(this.data.records, keyOrRecords);
    }
    this._save(this.data);
  }

  /**
   * ゲームセッションを記録
   * @param {string} gameName - ゲーム名
   * @param {Object} [gameData] - ゲーム固有のデータ
   */
  recordSession(gameName, gameData = {}) {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = this.data.records.lastPlayedDate;

    // 連続日数の計算
    if (lastDate) {
      const lastDateObj = new Date(lastDate);
      const todayObj = new Date(today);
      const diffDays = Math.floor((todayObj - lastDateObj) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // 連続している
        this.data.records.consecutiveDays++;
      } else if (diffDays > 1) {
        // 途切れた
        this.data.records.consecutiveDays = 1;
      }
      // diffDays === 0 の場合は何もしない（同じ日）
    } else {
      // 初回プレイ
      this.data.records.consecutiveDays = 1;
    }

    // セッション数を増加
    this.data.records.totalSessions++;
    this.data.records.lastPlayedGame = gameName;
    this.data.records.lastPlayedDate = today;

    // ゲーム固有の記録
    if (!this.data.records.gameRecords[gameName]) {
      this.data.records.gameRecords[gameName] = {
        playCount: 0,
        bestScore: null,
        lastScore: null
      };
    }

    const gameRecord = this.data.records.gameRecords[gameName];
    gameRecord.playCount++;

    if (gameData.score !== undefined) {
      gameRecord.lastScore = gameData.score;
      if (gameRecord.bestScore === null || gameData.score > gameRecord.bestScore) {
        gameRecord.bestScore = gameData.score;
      }
    }

    Object.assign(gameRecord, gameData);

    this._save(this.data);
  }

  /**
   * ゲーム記録を取得
   * @param {string} gameName - ゲーム名
   * @returns {Object|null}
   */
  getGameRecord(gameName) {
    return this.data.records.gameRecords[gameName] || null;
  }

  /**
   * 全データをリセット
   */
  reset() {
    this.data = this._createInitialData();
    this._save(this.data);
  }

  /**
   * 設定のみリセット
   */
  resetSettings() {
    this.data.settings = { ...DEFAULT_SETTINGS };
    this._save(this.data);
  }

  /**
   * 記録のみリセット
   */
  resetRecords() {
    this.data.records = { ...DEFAULT_RECORDS };
    this._save(this.data);
  }

  /**
   * データをエクスポート
   * @returns {string} JSON文字列
   */
  export() {
    return JSON.stringify(this.data, null, 2);
  }

  /**
   * データをインポート
   * @param {string} jsonString - JSON文字列
   * @returns {boolean} 成功したかどうか
   */
  import(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      this.data = this._mergeWithDefaults(imported);
      this._save(this.data);
      return true;
    } catch (error) {
      console.error('Import error:', error);
      return false;
    }
  }
}

// シングルトンインスタンス
export const storage = new Storage();
