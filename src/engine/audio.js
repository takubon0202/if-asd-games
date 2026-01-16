/**
 * GentleAudio - 穏やかな音声管理
 * ON/OFF切替、デフォルトOFF、短い音のみ
 */

export class GentleAudio {
  constructor() {
    this.enabled = false;  // デフォルトOFF
    this.volume = 0.3;     // 音量は小さく固定
    this.audioContext = null;
    this.sounds = new Map();

    // Web Audio APIの初期化は遅延させる（ユーザー操作後）
    this.initialized = false;
  }

  /**
   * AudioContextを初期化
   */
  _initContext() {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.audioContext.destination);
      this.initialized = true;

      // プリセットサウンドを登録
      this._registerPresetSounds();
    } catch (error) {
      console.warn('AudioContext initialization failed:', error);
    }
  }

  /**
   * プリセットサウンドを登録
   */
  _registerPresetSounds() {
    // 成功音（短いピンポン）
    this.registerSound('success', () => this._createTone(880, 0.1, 'sine'));

    // クリック音
    this.registerSound('click', () => this._createTone(600, 0.05, 'sine'));

    // 失敗音（低い音）
    this.registerSound('error', () => this._createTone(220, 0.15, 'triangle'));

    // スタート音
    this.registerSound('start', () => this._createTone(440, 0.1, 'sine'));

    // 完了音（2音）
    this.registerSound('complete', () => {
      this._createTone(523, 0.1, 'sine');  // C5
      setTimeout(() => this._createTone(659, 0.15, 'sine'), 100);  // E5
    });

    // ティック音（カウントダウン用）
    this.registerSound('tick', () => this._createTone(1000, 0.03, 'square'));
  }

  /**
   * トーンを生成して再生
   * @param {number} frequency - 周波数（Hz）
   * @param {number} duration - 持続時間（秒）
   * @param {string} type - 波形タイプ
   */
  _createTone(frequency, duration, type = 'sine') {
    if (!this.audioContext || !this.enabled) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.value = frequency;

      // エンベロープ（フェードアウト）
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0.5, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (error) {
      console.warn('Tone creation failed:', error);
    }
  }

  /**
   * サウンドを登録
   * @param {string} name - サウンド名
   * @param {function} generator - サウンド生成関数
   */
  registerSound(name, generator) {
    this.sounds.set(name, generator);
  }

  /**
   * サウンドを再生
   * @param {string} name - サウンド名
   */
  play(name) {
    if (!this.enabled) return;

    // 初回再生時にコンテキストを初期化
    if (!this.initialized) {
      this._initContext();
    }

    // AudioContextがsuspended状態の場合はresumeする
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const generator = this.sounds.get(name);
    if (generator) {
      generator();
    }
  }

  /**
   * 音声を有効化
   */
  enable() {
    this.enabled = true;

    // 有効化時にコンテキストを初期化
    if (!this.initialized) {
      this._initContext();
    }
  }

  /**
   * 音声を無効化
   */
  disable() {
    this.enabled = false;
  }

  /**
   * 有効/無効をトグル
   * @returns {boolean} 新しい状態
   */
  toggle() {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.enabled;
  }

  /**
   * 音量を設定
   * @param {number} value - 音量（0.0〜1.0）
   */
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));

    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  /**
   * 音量を取得
   * @returns {number}
   */
  getVolume() {
    return this.volume;
  }

  /**
   * 有効かどうかを取得
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * 設定から音声状態を適用
   * @param {boolean} soundEnabled - 音声ON/OFF
   */
  applyFromSettings(soundEnabled) {
    if (soundEnabled) {
      this.enable();
    } else {
      this.disable();
    }
  }

  /**
   * リソースの解放
   */
  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.sounds.clear();
    this.initialized = false;
  }
}

// シングルトンインスタンス
export const audio = new GentleAudio();
