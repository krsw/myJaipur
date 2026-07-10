import React, { useState } from 'react';
import type { GoodsType, PlayerState, PlayerId, BonusType } from '../types/game';

interface PlayerSectionProps {
  player: PlayerState;
  currentTurn: PlayerId;
  goodsStocks: Record<GoodsType, number[]>;
  onSell: (playerId: PlayerId, goodsType: GoodsType, count: number) => void;
  isRotatedDefault?: boolean;
}

const commodityLabels: Record<GoodsType, { label: string; colorClass: string; isLuxury: boolean }> = {
  diamonds: { label: 'ダイヤ', colorClass: 'from-red-600 to-red-800 text-white', isLuxury: true },
  gold: { label: '金', colorClass: 'from-yellow-500 to-yellow-600 text-yellow-950 font-semibold', isLuxury: true },
  silver: { label: '銀', colorClass: 'from-slate-400 to-slate-500 text-slate-950 font-semibold', isLuxury: true },
  cloth: { label: '布', colorClass: 'from-purple-600 to-purple-800 text-white', isLuxury: false },
  spice: { label: 'スパイス', colorClass: 'from-emerald-600 to-emerald-800 text-white', isLuxury: false },
  leather: { label: '革', colorClass: 'from-amber-800 to-amber-900 text-white', isLuxury: false },
};

export const PlayerSection: React.FC<PlayerSectionProps> = ({
  player,
  currentTurn,
  goodsStocks,
  onSell,
  isRotatedDefault = false,
}) => {
  const [isRotated, setIsRotated] = useState(isRotatedDefault);
  const [saleCounts, setSaleCounts] = useState<Record<GoodsType, number>>({
    diamonds: 2,
    gold: 2,
    silver: 2,
    cloth: 1,
    spice: 1,
    leather: 1,
  });

  const handleIncrement = (type: GoodsType) => {
    setSaleCounts((prev) => {
      const current = prev[type];
      if (current >= 9) return prev;
      return { ...prev, [type]: current + 1 };
    });
  };

  const handleDecrement = (type: GoodsType) => {
    const config = commodityLabels[type];
    const min = config.isLuxury ? 2 : 1;
    setSaleCounts((prev) => {
      const current = prev[type];
      if (current <= min) return prev;
      return { ...prev, [type]: current - 1 };
    });
  };

  const triggerSell = (type: GoodsType) => {
    const count = saleCounts[type];
    onSell(player.id, type, count);
    const config = commodityLabels[type];
    setSaleCounts((prev) => ({
      ...prev,
      [type]: config.isLuxury ? 2 : 1,
    }));
  };

  const isMyTurn = player.id === currentTurn;

  return (
    <div
      id={player.id}
      className={`flex flex-col bg-slate-900/90 border rounded-2xl px-3 py-2 portrait:px-1.5 portrait:py-1 shadow-2xl transition-all duration-500 ${
        isRotated ? 'rotate-180' : ''
      } ${
        isMyTurn 
          ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)] ring-1 ring-blue-500/30' 
          : 'border-slate-800 opacity-30 pointer-events-none filter saturate-50 brightness-75'
      } h-full justify-between`}
    >
      {/* Header Info */}
      <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5 mb-1.5 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-extrabold tracking-wide text-white flex items-center gap-1.5">
            {player.name}
            {isMyTurn && (
              <span className="px-1.5 py-0.5 text-[8px] font-black tracking-normal text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-md animate-pulse">
                手番中
              </span>
            )}
          </h2>
          <button
            onClick={() => setIsRotated(!isRotated)}
            className="px-1.5 py-0.5 text-[9px] bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-400 rounded transition"
          >
            🔄 180°回転
          </button>
        </div>

        {/* Score & Seals */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1 items-center bg-slate-800/80 px-1.5 py-0.5 rounded-lg border border-slate-700/30">
            <span className="text-[10px] text-slate-400">証:</span>
            <div className="flex gap-0.5 text-yellow-400">
              {[...Array(player.sealsOfExcellence)].map((_, i) => (
                <span key={i} className="text-xs">🪙</span>
              ))}
              {player.sealsOfExcellence === 0 && <span className="text-slate-600 text-[10px]">-</span>}
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-black text-yellow-400 tracking-wider">
              {Object.values(player.goodsTokens).reduce((sum, arr) => sum + arr.reduce((s, v) => s + v, 0), 0)}{' '}
              <span className="text-[10px] font-medium text-slate-400">ルピー(商品のみ)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content (Split 9:3, changes to 10:2 in portrait mode to give wider space for cards) */}
      <div className="grid grid-cols-12 gap-2 portrait:gap-1 flex-grow min-h-0 overflow-hidden items-stretch">
        
        {/* Left Side: Goods Sale Panel */}
        <div className="col-span-9 portrait:col-span-10 flex flex-col justify-between min-h-0">
          
          {/* Goods Cards Grid (6 Commodities) */}
          <div className="grid grid-cols-6 gap-2 portrait:gap-0.5 flex-grow">
            {(Object.keys(commodityLabels) as GoodsType[]).map((type) => {
              const config = commodityLabels[type];
              const stock = goodsStocks[type].length;
              const count = saleCounts[type];
              const isLuxury = config.isLuxury;
              const isDisabled = stock === 0 || (isLuxury && count < 2);

              return (
                <div
                  key={type}
                  data-good={type}
                  className={`flex flex-col justify-between p-2 portrait:p-0.5 rounded-xl portrait:rounded-lg bg-gradient-to-br ${config.colorClass} shadow border border-white/5`}
                >
                  {/* Name and Tag */}
                  <div className="flex flex-col text-[11px] portrait:text-[8px] font-black leading-tight mb-1 portrait:mb-0.5">
                    <span>{config.label}</span>
                    <span className="opacity-75 text-[7.5px] portrait:text-[6px] font-medium">
                      {isLuxury ? '高級' : `数:${stock}`}
                    </span>
                  </div>

                  {stock === 0 ? (
                    <div className="py-4 portrait:py-2 text-center text-xs portrait:text-[8px] font-black tracking-widest opacity-60">
                      切
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5 portrait:gap-0.5 mt-1 portrait:mt-0.5 shrink-0">
                      {/* Counter with enlarged touch targets */}
                      <div className="flex justify-between items-center bg-black/20 rounded-lg portrait:rounded px-1 py-1 portrait:px-0.5 portrait:py-0.5">
                        <button
                          onClick={() => handleDecrement(type)}
                          disabled={count <= (isLuxury ? 2 : 1)}
                          data-action="decrement"
                          className="w-8 h-8 sm:w-10 sm:h-10 portrait:w-6 portrait:h-6 flex items-center justify-center font-extrabold text-white text-base portrait:text-xs hover:bg-white/10 disabled:opacity-20 rounded-md transition"
                        >
                          -
                        </button>
                        <span className="font-extrabold text-xs sm:text-sm portrait:text-[8.5px] text-center min-w-[10px]">
                          {count}
                        </span>
                        <button
                          onClick={() => handleIncrement(type)}
                          disabled={count >= 9}
                          data-action="increment"
                          className="w-8 h-8 sm:w-10 sm:h-10 portrait:w-6 portrait:h-6 flex items-center justify-center font-extrabold text-white text-base portrait:text-xs hover:bg-white/10 disabled:opacity-20 rounded-md transition"
                        >
                          +
                        </button>
                      </div>

                      {/* Sell Action */}
                      <button
                        onClick={() => triggerSell(type)}
                        disabled={isDisabled}
                        data-action="sell"
                        className="w-full py-1.5 sm:py-2.5 portrait:py-0.5 rounded bg-black/40 hover:bg-black/60 active:scale-95 text-[10px] sm:text-xs portrait:text-[8px] font-black text-white transition disabled:opacity-40"
                      >
                        売却
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Side: Acquired tokens breakdown list */}
        <div className="col-span-3 portrait:col-span-2 flex flex-col bg-slate-950/40 rounded-xl border border-slate-800/40 p-2 portrait:p-1 min-h-0 overflow-hidden justify-between">
          <div className="text-[9px] portrait:text-[8px] font-bold text-slate-400 border-b border-slate-800/60 pb-1 mb-1.5 flex justify-between shrink-0">
            <span>獲得</span>
            <span>枚/点</span>
          </div>

          <div className="flex-grow overflow-y-auto pr-0.5 space-y-1 scrollbar-thin max-h-[105px] portrait:max-h-[125px]">
            {/* Goods list */}
            {Object.entries(player.goodsTokens).map(([key, tokens]) => {
              if (tokens.length === 0) return null;
              const type = key as GoodsType;
              const label = commodityLabels[type].label;
              const sum = tokens.reduce((s, v) => s + v, 0);
              return (
                <div key={type} className="flex justify-between items-center text-[10px] portrait:text-[8px] text-slate-300">
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      type === 'diamonds' ? 'bg-red-500' : type === 'gold' ? 'bg-yellow-500' : type === 'silver' ? 'bg-slate-400' : type === 'cloth' ? 'bg-purple-500' : type === 'spice' ? 'bg-emerald-500' : 'bg-amber-800'
                    }`}></span>
                    <span className="truncate max-w-[45px] portrait:max-w-[30px]">{label}</span>
                  </div>
                  <span className="font-mono text-slate-400 text-[9px] portrait:text-[7.5px] shrink-0">
                    {tokens.length}枚({sum}点)
                  </span>
                </div>
              );
            })}

            {/* Bonus list */}
            {Object.entries(player.bonusTokens).map(([key, tokens]) => {
              if (tokens.length === 0) return null;
              const type = key as BonusType;
              const label = type === 'bonus3' ? '3枚売' : type === 'bonus4' ? '4枚売' : '5枚売';
              return (
                <div key={type} className="flex justify-between items-center text-[10px] portrait:text-[8px] text-yellow-400/90 font-medium">
                  <div className="flex items-center gap-0.5">
                    <span>✨</span>
                    <span className="truncate max-w-[45px] portrait:max-w-[30px]">{label}</span>
                  </div>
                  <span className="font-mono text-[9px] portrait:text-[7.5px]">
                    {tokens.length}枚
                  </span>
                </div>
              );
            })}

            {/* Empty state */}
            {Object.values(player.goodsTokens).every(t => t.length === 0) &&
             Object.values(player.bonusTokens).every(t => t.length === 0) && (
              <div className="h-full flex items-center justify-center text-[9px] portrait:text-[7px] text-slate-600 font-medium py-6 text-center">
                なし
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
