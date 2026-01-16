/**
 * ASD&LD向け「目の動き」トレーニングWebゲーム
 * ゲームモジュール集約
 */

// Game A: 視線レール追視
export { GameA_Rail } from './gameA_rail.js';

// Game B: 行読みガイド
export { GameB_Readline } from './gameB_readline.js';

// Game C: 予告付き視線切り替え
export { GameC_PredictSaccade, PatternType, GamePhase } from './gameC_predictSaccade.js';

// ゲーム一覧（追加時にここに登録）
export const GameList = [
  {
    id: 'gameA',
    name: 'レールついし',
    description: 'うごく まるを めで おいかけよう',
    module: () => import('./gameA_rail.js').then(m => m.GameA_Rail)
  },
  {
    id: 'gameB',
    name: 'ぎょうよみ',
    description: 'じゅんばんに えらんでいこう',
    module: () => import('./gameB_readline.js').then(m => m.GameB_Readline)
  },
  {
    id: 'gameC',
    name: 'よそくジャンプ',
    description: 'つぎの ばしょを よそくして みよう',
    module: () => import('./gameC_predictSaccade.js').then(m => m.GameC_PredictSaccade)
  }
];

/**
 * ゲームIDからゲームクラスを取得
 * @param {string} gameId - ゲームID
 * @returns {Promise<Class>} ゲームクラス
 */
export async function getGameClass(gameId) {
  const gameInfo = GameList.find(g => g.id === gameId);
  if (!gameInfo) {
    throw new Error(`Game not found: ${gameId}`);
  }
  return await gameInfo.module();
}
