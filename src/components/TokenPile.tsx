import React from 'react';
import type { GoodsType } from '../types/game';

interface TokenPileProps {
  type: GoodsType;
  tokens: number[];
}

const commodityConfig: Record<GoodsType, { label: string; bg: string; text: string; glow: string; border: string }> = {
  diamonds: { label: 'ダイヤ', bg: 'bg-red-600', text: 'text-red-100', glow: 'glow-diamonds', border: 'border-red-500' },
  gold: { label: '金', bg: 'bg-yellow-500', text: 'text-yellow-950 font-bold', glow: 'glow-gold', border: 'border-yellow-400' },
  silver: { label: '銀', bg: 'bg-slate-400', text: 'text-slate-950 font-semibold', glow: 'glow-silver', border: 'border-slate-300' },
  cloth: { label: '布', bg: 'bg-purple-600', text: 'text-purple-100', glow: '', border: 'border-purple-500' },
  spice: { label: 'スパイス', bg: 'bg-emerald-600', text: 'text-emerald-100', glow: '', border: 'border-emerald-500' },
  leather: { label: '革', bg: 'bg-amber-800', text: 'text-amber-100', glow: '', border: 'border-amber-700' },
};

export const TokenPile: React.FC<TokenPileProps> = ({ type, tokens }) => {
  const config = commodityConfig[type];
  const count = tokens.length;
  const topValue = count > 0 ? tokens[0] : null;

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-slate-800/40 rounded-xl border border-slate-700/50 backdrop-blur-sm w-24 sm:w-28">
      <span className="text-xs text-slate-400 mb-1">{config.label}</span>
      
      <div className="relative h-20 w-16 sm:w-20 flex items-center justify-center">
        {count === 0 ? (
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-xs font-bold">
            Empty
          </div>
        ) : (
          // Stacked visual effect using absolute divs
          [...Array(Math.min(5, count))].map((_, index) => {
            const offset = index * 4;
            const isTop = index === 0;
            return (
              <div
                key={index}
                className={`absolute w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 ${config.border} ${config.bg} ${
                  isTop ? `${config.glow} z-10` : 'opacity-70'
                } flex items-center justify-center transition-all duration-300`}
                style={{
                  transform: `translateY(${offset}px) scale(${1 - index * 0.05})`,
                  zIndex: 10 - index,
                }}
              >
                {isTop && (
                  <div className={`text-base sm:text-lg font-extrabold flex flex-col items-center justify-center ${config.text}`}>
                    <span>{topValue}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-2 text-xs font-medium text-slate-300">
        残り <span className="font-bold text-sm text-white">{count}</span> 枚
      </div>
    </div>
  );
};
