import React from 'react';
import type { GameState, PlayerState } from '../types/game';

interface GameOverModalProps {
  state: GameState;
  onNextRound: () => void;
  onResetGame: () => void;
}

const countTokens = (player: PlayerState) => {
  const totalGoods = Object.values(player.goodsTokens).reduce((sum, arr) => sum + arr.length, 0);
  const totalBonuses = Object.values(player.bonusTokens).reduce((sum, arr) => sum + arr.length, 0);
  const goodsScore = Object.values(player.goodsTokens).reduce((sum, arr) => sum + arr.reduce((s, v) => s + v, 0), 0);
  const bonusScore = Object.values(player.bonusTokens).reduce((sum, arr) => sum + arr.reduce((s, v) => s + v, 0), 0);

  return { totalGoods, totalBonuses, goodsScore, bonusScore };
};

export const GameOverModal: React.FC<GameOverModalProps> = ({ state, onNextRound, onResetGame }) => {
  if (!state.roundOver) return null;

  const p1 = state.player1;
  const p2 = state.player2;
  const p1Stats = countTokens(p1);
  const p2Stats = countTokens(p2);

  const isGameWinner = state.gameWinner !== null;
  const winnerName = state.gameWinner
    ? (state.gameWinner === 'player1' ? p1.name : p2.name)
    : (state.roundWinner === 'player1' ? p1.name : state.roundWinner === 'player2' ? p2.name : '引き分け');

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border-2 border-yellow-500/50 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.2)] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Banner header */}
        <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 px-6 py-8 text-center text-slate-950">
          <span className="text-sm font-black tracking-widest uppercase opacity-80">
            {isGameWinner ? '🏆 ゲーム終了 🏆' : '🔔 ラウンド終了 🔔'}
          </span>
          <h2 className="text-3xl font-extrabold tracking-wide mt-1">
            {isGameWinner ? `${winnerName} の総合勝利！` : `${winnerName} がラウンドを獲得！`}
          </h2>
          {isGameWinner ? (
            <p className="text-xs font-bold tracking-wider mt-1 opacity-75">
              マハラジャの専属商人に選ばれました！
            </p>
          ) : state.roundWinner !== 'tie' ? (
            <p className="text-xs font-bold tracking-wider mt-1 opacity-75">
              優秀の証 (🪙) を1つ獲得しました！
            </p>
          ) : (
            <p className="text-xs font-bold tracking-wider mt-1 opacity-75">
              両者一歩も譲らない大接戦！
            </p>
          )}
        </div>

        {/* Detailed Breakdown */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Player 1 Col */}
            <div className="bg-slate-950/40 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-white text-center border-b border-slate-800 pb-2 mb-3">
                  {p1.name}
                </h3>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>商品トークン得点:</span>
                    <span className="font-mono font-bold text-white">{p1Stats.goodsScore}点</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ボーナストークン得点:</span>
                    <span className="font-mono font-bold text-white">{p1Stats.bonusScore}点</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">🐫 ラクダ (最多 {p1.camelCount}頭):</span>
                    <span className="font-mono font-bold text-white">
                      {state.camelOwner === 'player1' ? '+5点' : '0点'}
                    </span>
                  </div>
                  
                  {/* Tiebreaker helper values */}
                  <div className="pt-2.5 border-t border-slate-800/60 mt-2 text-[10px] text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>ボーナストークン枚数:</span>
                      <span className="font-mono">{p1Stats.totalBonuses}枚</span>
                    </div>
                    <div className="flex justify-between">
                      <span>商品トークン枚数:</span>
                      <span className="font-mono">{p1Stats.totalGoods}枚</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">合計点数</div>
                <div className="text-3xl font-black text-yellow-400">{p1.score}</div>
              </div>
            </div>

            {/* Player 2 Col */}
            <div className="bg-slate-950/40 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-white text-center border-b border-slate-800 pb-2 mb-3">
                  {p2.name}
                </h3>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>商品トークン得点:</span>
                    <span className="font-mono font-bold text-white">{p2Stats.goodsScore}点</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ボーナストークン得点:</span>
                    <span className="font-mono font-bold text-white">{p2Stats.bonusScore}点</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">🐫 ラクダ (最多 {p2.camelCount}頭):</span>
                    <span className="font-mono font-bold text-white">
                      {state.camelOwner === 'player2' ? '+5点' : '0点'}
                    </span>
                  </div>
                  
                  {/* Tiebreaker helper values */}
                  <div className="pt-2.5 border-t border-slate-800/60 mt-2 text-[10px] text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>ボーナストークン枚数:</span>
                      <span className="font-mono">{p2Stats.totalBonuses}枚</span>
                    </div>
                    <div className="flex justify-between">
                      <span>商品トークン枚数:</span>
                      <span className="font-mono">{p2Stats.totalGoods}枚</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">合計点数</div>
                <div className="text-3xl font-black text-yellow-400">{p2.score}</div>
              </div>
            </div>
          </div>

          {/* Tiebreaker log if scores were equal */}
          {p1.score === p2.score && (
            <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-2xl text-[11px] text-slate-300">
              <span className="font-black text-yellow-400 block mb-1">⚖️ タイブレーク判定</span>
              得点が同点（{p1.score}点）のため、タイブレーク判定を行いました。<br />
              1. **ボーナストークンの獲得枚数**の多いプレイヤーが勝利（{p1.name}: {p1Stats.totalBonuses}枚 vs {p2.name}: {p2Stats.totalBonuses}枚）<br />
              2. それでも同点の場合は、**商品トークンの獲得枚数**の多いプレイヤーが勝利（{p1.name}: {p1Stats.totalGoods}枚 vs {p2.name}: {p2Stats.totalGoods}枚）
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            {isGameWinner ? (
              <button
                onClick={onResetGame}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 active:scale-98 text-slate-950 font-black tracking-widest text-sm shadow-lg shadow-yellow-500/20 transition"
              >
                🎮 新しいゲームを開始する
              </button>
            ) : (
              <>
                <button
                  onClick={onNextRound}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 active:scale-98 text-slate-950 font-black tracking-widest text-sm shadow-lg shadow-yellow-500/20 transition"
                >
                  ⏭️ 次のラウンドを開始する
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('現在のゲーム状況を完全に初期化しますか？')) {
                      onResetGame();
                    }
                  }}
                  className="px-4 py-3.5 rounded-2xl border border-slate-700 hover:bg-slate-800 active:scale-98 text-xs text-slate-300 font-bold transition"
                >
                  最初からやり直す
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
