import React, { useState, useEffect } from 'react';
import type { GameState, PlayerState, PlayerId } from '../types/game';

interface GameOverModalProps {
  state: GameState;
  onUpdateCamel: (playerId: PlayerId, count: number) => void;
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

export const GameOverModal: React.FC<GameOverModalProps> = ({ state, onUpdateCamel, onNextRound, onResetGame }) => {
  if (!state.roundOver) return null;

  const [revealStage, setRevealStage] = useState(0);

  useEffect(() => {
    if (state.roundOver) {
      setRevealStage(0);
      const t1 = setTimeout(() => setRevealStage(1), 800);
      const t2 = setTimeout(() => setRevealStage(2), 1600);
      const t3 = setTimeout(() => setRevealStage(3), 2400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [state.roundOver]);

  const p1 = state.player1;
  const p2 = state.player2;
  const p1Stats = countTokens(p1);
  const p2Stats = countTokens(p2);

  const isGameWinner = state.gameWinner !== null;
  const winnerName = state.gameWinner
    ? (state.gameWinner === 'player1' ? p1.name : p2.name)
    : (state.roundWinner === 'player1' ? p1.name : state.roundWinner === 'player2' ? p2.name : '引き分け');

  // Helper to calculate score during reveal animation stages
  const getIntermediateScore = (player: PlayerState, stats: any, stage: number) => {
    let score = stats.goodsScore;
    if (stage >= 1) {
      score += player.bonusTokens.bonus3.reduce((s, v) => s + v, 0);
    }
    if (stage >= 2) {
      score += player.bonusTokens.bonus4.reduce((s, v) => s + v, 0);
    }
    if (stage >= 3) {
      score += player.bonusTokens.bonus5.reduce((s, v) => s + v, 0);
      const isOwner = state.camelOwner === player.id;
      if (isOwner) score += 5;
    }
    return score;
  };

  const getIntermediateBonusScore = (player: PlayerState, stage: number) => {
    let score = 0;
    if (stage >= 1) score += player.bonusTokens.bonus3.reduce((s, v) => s + v, 0);
    if (stage >= 2) score += player.bonusTokens.bonus4.reduce((s, v) => s + v, 0);
    if (stage >= 3) score += player.bonusTokens.bonus5.reduce((s, v) => s + v, 0);
    return score;
  };

  const isRevealedFinal = revealStage >= 3;

  const renderBonusCard = (player: PlayerState, type: 'bonus3' | 'bonus4' | 'bonus5', label: string, stageTrigger: number) => {
    const tokens = player.bonusTokens[type];
    const count = tokens.length;
    const sum = tokens.reduce((s, v) => s + v, 0);
    const isRevealed = revealStage >= stageTrigger;

    if (count === 0) {
      return (
        <div className="flex justify-between items-center text-[10px] text-slate-600 font-medium py-1.5 px-3 bg-slate-950/20 rounded-xl border border-slate-900">
          <span>✨ {label}</span>
          <span>なし</span>
        </div>
      );
    }

    return (
      <div className="relative w-full h-8 [perspective:1000px]">
        <div className={`relative w-full h-full duration-700 [transform-style:preserve-3d] ${isRevealed ? '[transform:rotateY(180deg)]' : ''}`}>
          {/* Front (Hidden - Question mark) */}
          <div className="absolute inset-0 bg-slate-800 border border-slate-700/60 rounded-xl flex justify-between items-center px-3 [backface-visibility:hidden] shadow-sm">
            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
              <span>✨</span> {label} ({count}枚)
            </span>
            <span className="font-mono text-yellow-500/80 font-black text-xs animate-pulse">❓点</span>
          </div>
          {/* Back (Revealed - Value) */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-950/50 to-amber-950/50 border border-yellow-500/40 rounded-xl flex justify-between items-center px-3 [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-md">
            <span className="text-[10px] text-yellow-400 font-black flex items-center gap-1">
              <span>✨</span> {label} ({count}枚)
            </span>
            <span className="font-mono text-yellow-400 font-black text-xs">
              +{sum}点
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-slate-900 border-2 border-yellow-500/50 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.25)] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Banner header with reveal condition */}
        <div className={`px-6 py-7 text-center text-slate-950 transition-all duration-500 ${
          isRevealedFinal 
            ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600' 
            : 'bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white'
        }`}>
          <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase opacity-85">
            {!isRevealedFinal ? '🥁 集計中 🥁' : isGameWinner ? '🏆 ゲーム終了 🏆' : '🔔 ラウンド終了 🔔'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wide mt-1 h-9 flex items-center justify-center">
            {!isRevealedFinal ? '得点を集計しています...' : isGameWinner ? `${winnerName} の総合勝利！` : `${winnerName} がラウンドを獲得！`}
          </h2>
          <div className="text-[10px] sm:text-xs font-bold tracking-wider mt-1 opacity-80 h-4 flex items-center justify-center">
            {!isRevealedFinal ? (
              <span className="animate-pulse">ボーナストークンの得点を開示しています...</span>
            ) : isGameWinner ? (
              'マハラジャ of 専属商人に選ばれました！'
            ) : state.roundWinner !== 'tie' ? (
              '優秀の証 (🪙) を1つ獲得しました！'
            ) : (
              '両者一歩も譲らない大接戦！'
            )}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            
            {/* Player 1 Col */}
            <div className="bg-slate-950/40 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-white text-center border-b border-slate-800 pb-2 mb-3">
                  {p1.name}
                </h3>
                <div className="space-y-3.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>商品トークン得点:</span>
                    <span className="font-mono font-bold text-white">{p1Stats.goodsScore}点</span>
                  </div>

                  {/* Bonus tokens with 3D Flip Card */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-850">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                      <span>ボーナストークン:</span>
                      <span className="font-mono text-yellow-400">計 {getIntermediateBonusScore(p1, revealStage)}点</span>
                    </div>
                    {renderBonusCard(p1, 'bonus3', '3枚売', 1)}
                    {renderBonusCard(p1, 'bonus4', '4枚売', 2)}
                    {renderBonusCard(p1, 'bonus5', '5枚売', 3)}
                  </div>

                  {/* Camel counter */}
                  <div className="flex flex-col gap-1.5 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 pt-1 border-t border-slate-850">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1 font-semibold">🐫 ラクダの所持数:</span>
                      <span className="font-mono font-bold text-yellow-400">
                        {revealStage < 3 ? '集計中...' : state.camelOwner === 'player1' ? '+5点 (最多)' : '0点'}
                      </span>
                    </div>
                    <div className="flex justify-end items-center gap-2 mt-0.5">
                      <button
                        onClick={() => onUpdateCamel('player1', p1.camelCount - 1)}
                        disabled={!isRevealedFinal}
                        className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:scale-90 text-slate-300 font-bold rounded-lg border border-slate-700/60 disabled:opacity-30 disabled:pointer-events-none"
                      >
                        -
                      </button>
                      <span className="font-mono font-extrabold text-white text-sm min-w-[20px] text-center">
                        {p1.camelCount}
                      </span>
                      <button
                        onClick={() => onUpdateCamel('player1', p1.camelCount + 1)}
                        disabled={!isRevealedFinal}
                        className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:scale-90 text-slate-300 font-bold rounded-lg border border-slate-700/60 disabled:opacity-30 disabled:pointer-events-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* Tiebreaker details */}
                  <div className="pt-2 border-t border-slate-850 text-[10px] text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>ボーナス枚数:</span>
                      <span className="font-mono">{p1Stats.totalBonuses}枚</span>
                    </div>
                    <div className="flex justify-between">
                      <span>商品枚数:</span>
                      <span className="font-mono">{p1Stats.totalGoods}枚</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">合計点数</div>
                <div className="text-3xl font-black text-yellow-400">
                  {getIntermediateScore(p1, p1Stats, revealStage)}
                </div>
              </div>
            </div>

            {/* Player 2 Col */}
            <div className="bg-slate-950/40 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-white text-center border-b border-slate-800 pb-2 mb-3">
                  {p2.name}
                </h3>
                <div className="space-y-3.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>商品トークン得点:</span>
                    <span className="font-mono font-bold text-white">{p2Stats.goodsScore}点</span>
                  </div>

                  {/* Bonus tokens with 3D Flip Card */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-850">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                      <span>ボーナストークン:</span>
                      <span className="font-mono text-yellow-400">計 {getIntermediateBonusScore(p2, revealStage)}点</span>
                    </div>
                    {renderBonusCard(p2, 'bonus3', '3枚売', 1)}
                    {renderBonusCard(p2, 'bonus4', '4枚売', 2)}
                    {renderBonusCard(p2, 'bonus5', '5枚売', 3)}
                  </div>

                  {/* Camel counter */}
                  <div className="flex flex-col gap-1.5 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 pt-1 border-t border-slate-850">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1 font-semibold">🐫 ラクダの所持数:</span>
                      <span className="font-mono font-bold text-yellow-400">
                        {revealStage < 3 ? '集計中...' : state.camelOwner === 'player2' ? '+5点 (最多)' : '0点'}
                      </span>
                    </div>
                    <div className="flex justify-end items-center gap-2 mt-0.5">
                      <button
                        onClick={() => onUpdateCamel('player2', p2.camelCount - 1)}
                        disabled={!isRevealedFinal}
                        className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:scale-90 text-slate-300 font-bold rounded-lg border border-slate-700/60 disabled:opacity-30 disabled:pointer-events-none"
                      >
                        -
                      </button>
                      <span className="font-mono font-extrabold text-white text-sm min-w-[20px] text-center">
                        {p2.camelCount}
                      </span>
                      <button
                        onClick={() => onUpdateCamel('player2', p2.camelCount + 1)}
                        disabled={!isRevealedFinal}
                        className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:scale-90 text-slate-300 font-bold rounded-lg border border-slate-700/60 disabled:opacity-30 disabled:pointer-events-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* Tiebreaker details */}
                  <div className="pt-2 border-t border-slate-850 text-[10px] text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>ボーナス枚数:</span>
                      <span className="font-mono">{p2Stats.totalBonuses}枚</span>
                    </div>
                    <div className="flex justify-between">
                      <span>商品枚数:</span>
                      <span className="font-mono">{p2Stats.totalGoods}枚</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">合計点数</div>
                <div className="text-3xl font-black text-yellow-400">
                  {getIntermediateScore(p2, p2Stats, revealStage)}
                </div>
              </div>
            </div>

          </div>

          {/* Tiebreaker log if scores were equal - only show when fully revealed */}
          {isRevealedFinal && p1.score === p2.score && (
            <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-2xl text-[11px] text-slate-300 animate-in fade-in duration-500">
              <span className="font-black text-yellow-400 block mb-1">⚖️ タイブレーク判定</span>
              得点が同点（{p1.score}点）のため、タイブレーク判定を行いました。<br />
              1. **ボーナストークンの獲得枚数**の多いプレイヤーが勝利（{p1.name}: {p1Stats.totalBonuses}枚 vs {p2.name}: {p2Stats.totalBonuses}枚）<br />
              2. それでも同点の場合は、**商品トークンの獲得枚数**の多いプレイヤーが勝利（{p1.name}: {p1Stats.totalGoods}枚 vs {p2.name}: {p2Stats.totalGoods}枚）
            </div>
          )}

          {/* Action buttons - hidden until reveal animation finishes to avoid skip errors */}
          {isRevealedFinal && (
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
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
          )}

        </div>
      </div>
    </div>
  );
};
