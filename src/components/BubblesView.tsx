import React from 'react';
import { TokenPool } from '../types/trading';
import { ArrowUpRight, ArrowDownRight, CircleDot } from 'lucide-react';

interface BubblesViewProps {
  pools: TokenPool[];
  onSelectPool: (pool: TokenPool) => void;
}

export const BubblesView: React.FC<BubblesViewProps> = ({ pools, onSelectPool }) => {
  // Take top 10 by volume
  const topPools = [...pools].sort((a, b) => b.vol - a.vol).slice(0, 10);
  const maxVol = topPools[0]?.vol || 1000000;

  return (
    <div className="bg-[#0b0f19] border border-[#182236] rounded-2xl p-4 sm:p-6 shadow-xl font-mono">
      <div className="flex items-center justify-between border-b border-[#182236] pb-4 mb-4">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <CircleDot className="w-5 h-5 text-[#F5B31B]" />
            <span>Top 10 Volume Market Bubbles</span>
          </h3>
          <p className="text-xs text-[#718096] mt-0.5">
            Bubble size represents 24h trading volume. Green is up, red is down. Tap any bubble to trade.
          </p>
        </div>
      </div>

      {/* Floating Bubbles Canvas */}
      <div className="relative min-h-[420px] bg-[#07090e] border border-[#1a2336] rounded-2xl p-4 flex flex-wrap items-center justify-center gap-6 overflow-hidden">
        {topPools.map((pool, idx) => {
          // Scale size between 80px and 150px based on volume
          const ratio = Math.max(0.4, Math.sqrt(pool.vol / maxVol));
          const size = Math.round(75 + ratio * 75);
          const isUp = pool.ch >= 0;

          return (
            <button
              key={pool.id}
              onClick={() => onSelectPool(pool)}
              style={{ width: `${size}px`, height: `${size}px` }}
              className={`rounded-full border-2 flex flex-col items-center justify-center p-2 text-center transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-xl hover:z-10 ${
                isUp
                  ? 'border-[#2EE6A6] bg-[#2EE6A6]/15 hover:bg-[#2EE6A6]/25 text-[#2EE6A6]'
                  : 'border-[#FF4D6A] bg-[#FF4D6A]/15 hover:bg-[#FF4D6A]/25 text-[#FF4D6A]'
              }`}
            >
              <b className="text-white text-xs sm:text-sm font-extrabold truncate max-w-full">
                {pool.symbol || pool.name.split('/')[0]}
              </b>
              <span className="text-[10px] font-bold mt-0.5 flex items-center">
                {isUp ? '+' : ''}{pool.ch.toFixed(1)}%
              </span>
              <span className="text-[9px] text-[#cbd5e1] opacity-75">
                ${(pool.vol / 1e6).toFixed(1)}M
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
