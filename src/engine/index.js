/**
 * ASD&LD向け「目の動き」トレーニングWebゲーム
 * 共通エンジンモジュール
 */

// Canvas管理
export { CanvasScaling } from './canvas.js';

// ゲームループ
export { GameLoop } from './loop.js';

// 入力管理
export { InputRouter } from './input.js';

// ストレージ
export { Storage, storage } from './storage.js';

// 状態管理
export { StateMachine, GameState, stateMachine } from './state.js';

// テーマ
export { Theme, ThemeColors, ContrastLevels, FontSizes, theme, applyTheme } from './theme.js';

// オーディオ
export { GentleAudio, audio } from './audio.js';

// ユーティリティ
export {
  Easing,
  Random,
  Color,
  TimeFormat,
  Draw,
  clamp,
  distance,
  lerp,
  degToRad,
  radToDeg,
  sleep,
  pointInRect,
  pointInCircle,
  debounce,
  throttle
} from './utils.js';
