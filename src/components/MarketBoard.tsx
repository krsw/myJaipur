import React from 'react';
import type { GoodsType, BonusType, PlayerId } from '../types/game';
import { TokenPile } from './TokenPile';

interface MarketBoardProps {
  goodsStocks: Record<GoodsType, number[]>;
  bonusStocks: Record<BonusType, number[]>;
  currentTurn: PlayerId;
  onSwitchTurn: () => void;
  history: string[];
  onEndRoundManual: () => void;
  onResetGame: () => void;
  roundOver: boolean;
}

export const MarketBoard: React.FC<MarketBoardProps> = ({
  goodsStocks,
  bonusStocks,
  currentTurn,
  onSwitchTurn,
  history,
  onEndRoundManual,
  onResetGame,
  roundOver,
}) => {
  // Check how many piles are empty
  const emptyPilesCount = Object.values(goodsStocks).filter((pile) => pile.length === 0).length;

  return (
    <div className="flex flex-col bg-slate-900/80 border border-slate-800 rounded-3xl p-4 shadow-2xl backdrop-blur-md">
      {/* Upper row: Title, empty count info, Reset & End Round buttons */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-widest bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
            JAIPUR 市場
          </h1>
          <div className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700/80 text-slate-300">
            売切: <span className="font-extrabold text-yellow-400">{emptyPilesCount}</span> / 3
          </div>
        </div>

        {/* Turn Switcher Button */}
        <button
          onClick={onSwitchTurn}
          disabled={roundOver}
          className={`px-5 py-2 sm:px-8 sm:py-3 rounded-2xl text-xs sm:text-sm font-black tracking-widest text-white transition-all active:scale-95 duration-300 shadow-md ${
            currentTurn === 'player1'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/30 ring-2 ring-blue-500/20'
              : 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 hover:from-yellow-400 hover:to-amber-400 text-yellow-950 shadow-yellow-500/30 ring-2 ring-yellow-500/20'
          }`}
        >
          {currentTurn === 'player1' ? '👤 プレイヤー 1 手番終了 ➡' : '👤 プレイヤー 2 手番終了 ➡'}
        </button>

        <div className="flex gap-2.5">
          {/* Reset Button */}
          <button
            onClick={() => {
              if (window.confirm('ゲーム全体をリセットして最初からやり直しますか？')) {
                onResetGame();
              }
            }}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 active:scale-95 text-xs sm:text-sm text-slate-300 font-bold transition"
          >
            🔄 全リセット
          </button>

          {/* Manual Round End Button */}
          <button
            onClick={() => {
              if (window.confirm('山札が尽きた等の理由で、このラウンドを終了しますか？')) {
                onEndRoundManual();
              }
            }}
            disabled={roundOver}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-900/60 disabled:opacity-40 disabled:pointer-events-none active:scale-95 text-xs sm:text-sm text-red-300 font-black transition"
          >
            ⏹️ 手動ラウンド終了
          </button>
        </div>
      </div>

      {/* Main Board Piles */}
      <div className="grid grid-cols-12 gap-3 portrait:gap-1.5 items-stretch mb-3 portrait:mb-1.5">
        {/* Goods Piles (9 cols) */}
        <div className="col-span-9 bg-slate-950/30 border border-slate-800/50 rounded-2xl p-2 portrait:p-1 flex flex-wrap justify-center items-center gap-2 portrait:gap-1">
          {(Object.keys(goodsStocks) as GoodsType[]).map((type) => (
            <TokenPile key={type} type={type} tokens={goodsStocks[type]} />
          ))}
        </div>

        {/* Bonus Piles (3 cols) */}
        <div className="col-span-3 bg-slate-950/30 border border-slate-800/50 rounded-2xl p-2 portrait:p-1.5 flex flex-col justify-between items-center gap-1.5 portrait:gap-1">
          <div className="text-center w-full pb-0.5 border-b border-slate-800/50">
            <span className="text-[9px] portrait:text-[8px] font-bold text-slate-400">ボーナストークン</span>
          </div>

          {(['bonus3', 'bonus4', 'bonus5'] as BonusType[]).map((type) => {
            const label = type === 'bonus3' ? '3枚売' : type === 'bonus4' ? '4枚売' : '5枚売';
            const valRange = type === 'bonus3' ? '1-3点' : type === 'bonus4' ? '4-6点' : '8-10点';
            const count = bonusStocks[type].length;

            return (
              <div
                key={type}
                className="flex items-center justify-between p-1 portrait:p-0.5 bg-slate-800/30 border border-slate-700/30 rounded-lg w-full px-2 portrait:px-1"
              >
                <div className="text-left">
                  <div className="text-[10px] portrait:text-[8.5px] font-black text-slate-200 leading-tight">{label}</div>
                  <div className="text-[8px] portrait:text-[7px] text-slate-500 font-medium leading-none">{valRange}</div>
                </div>
                <div className="flex items-baseline gap-0.5 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-850">
                  <span className="text-[8px] portrait:text-[6.5px] text-slate-500">残</span>
                  <span className="text-[11px] portrait:text-[9.5px] font-black text-yellow-400">{count}</span>
                  <span className="text-[8px] portrait:text-[6.5px] text-slate-500">枚</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History Log Panel */}
      <div className="bg-slate-950/40 rounded-xl border border-slate-800/60 px-2 py-1.5 portrait:py-1">
        <div className="text-[9px] font-bold text-slate-400 tracking-wider mb-1">履歴ログ</div>
        <div className="h-10 portrait:h-6 overflow-y-auto pr-1 text-[10px] portrait:text-[8.5px] font-medium space-y-0.5 scrollbar-thin">
          {history.map((log, index) => (
            <div key={index} className="text-slate-300 flex items-start gap-1">
              <span className="text-yellow-500/80">▸</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
