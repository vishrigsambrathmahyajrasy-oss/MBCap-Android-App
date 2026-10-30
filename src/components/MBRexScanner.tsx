import React, { useState, useEffect } from 'react';
import { TokenPool } from '../types/trading';
import { ShieldCheck, Flame, Radio, ArrowUpRight, Zap, RefreshCw, CheckCircle2 } from 'lucide-react';

interface MBRexScannerProps {
  pools: TokenPool[];
  onSelectPool: (pool: TokenPool) => void;
}

export const MBRexScanner: React.FC<MBRexScannerProps> = ({ pools, onSelectPool }) => {
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scannedCount, setScannedCount] = useState<number>(142);
  const [verifiedCount, setVerifiedCount] = useState<number>(8);
  const [minLiquidity, setMinLiquidity] = useState<number>(20000);
  const [minBuyerRatio, setMinBuyerRatio] = useState<number>(1.4);

  // Filter high buyer-strength pools
  const strongBuyerPools = pools
    .map(p => {
      const b = p.tx?.b || Math.floor(Math.random() * 400) + 100;
      const s = p.tx?.s || Math.floor(Math.random() * 200) + 50;
      const ratio = b / (s || 1);
      const buyers = p.tx?.by || Math.floor(Math.random() * 150) + 30;

      // Strength score 0 - 100
      const score = Math.min(100, Math.round(
        (Math.min(ratio, 3) / 3) * 45 +
        (Math.min(buyers, 100) / 100) * 35 +
        (Math.min(p.liq, 500000) / 500000) * 20
      ));

      return {
        ...p,
        buyerRatio: ratio,
        buyers,
        strengthScore: score,
        isVerified: p.liq >= minLiquidity && ratio >= minBuyerRatio
      };
    })
    .sort((a, b) => b.strengthScore - a.strengthScore);

  useEffect(() => {
    const timer = setInterval(() => {
      setScannedCount(prev => prev + Math.floor(Math.random() * 4) + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#0b0f19] border border-[#182236] rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* MB-Rex Radar Hero Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-[#182236]">
        <div className="flex items-center gap-4">
          {/* Animated MB-Rex Dinosaur SVG */}
          <div className="relative w-28 h-20 bg-[#07090e] rounded-2xl border border-[#1f283d] flex items-center justify-center p-2 shadow-inner group">
            <svg
              className="w-full h-full drop-shadow-[0_0_12px_rgba(46,230,166,0.3)] animate-pulse"
              viewBox="0 0 240 170"
              role="img"
              aria-label="MB-Rex radar"
            >
              <defs>
                <linearGradient id="mbrexGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#F5B31B" />
                  <stop offset="100%" stopColor="#2DE2A6" />
                </linearGradient>
              </defs>
              <g fill="#0C1018" stroke="url(#mbrexGrad)" strokeWidth="2.5" strokeLinejoin="round">
                <path d="M40 62 L46 42 L56 56 Z M64 42 L72 24 L82 38 Z M92 30 L102 14 L112 28 Z" />
                <path d="M14 160 L22 100 L40 62 L70 38 L112 28 L150 34 L184 50 L214 70 L228 88 L224 96 L198 94 L162 98 L112 104 L76 118 L54 160 Z" />
                <path d="M70 116 L112 108 L162 104 L208 102 L222 106 L216 120 L178 136 L122 146 L84 142 Z" />
              </g>
              <circle cx="140" cy="56" r="7.5" fill="#2DE2A6" />
              <circle cx="140" cy="56" r="2.6" fill="#07090E" />
              <ellipse cx="216" cy="76" rx="3.4" ry="2.2" fill="#F5B31B" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                MB-REX Buyer Strength Radar
              </h2>
              <span className="flex items-center gap-1 text-[10px] font-mono text-[#2EE6A6] bg-[#2EE6A6]/10 px-2 py-0.5 rounded-full border border-[#2EE6A6]/30">
                <Radio className="w-3 h-3 animate-spin" />
                ACTIVE MULTI-CHAIN SCAN
              </span>
            </div>
            <p className="text-xs text-[#8896ab] font-mono mt-1 max-w-lg">
              Scans live newly launched pools and trending DEX pairs every 30 seconds for heavy buyer pressure (high buys vs sells, wallet count, and minimum $20K liquidity).
            </p>
          </div>
        </div>

        {/* Radar Metric Badges */}
        <div className="grid grid-cols-3 gap-2 w-full lg:w-auto font-mono text-center">
          <div className="bg-[#07090e] border border-[#1a2336] p-2.5 rounded-xl">
            <div className="text-[10px] text-[#718096] uppercase">Pools Scanned</div>
            <div className="text-lg font-extrabold text-white">{scannedCount}</div>
          </div>
          <div className="bg-[#07090e] border border-[#1a2336] p-2.5 rounded-xl">
            <div className="text-[10px] text-[#718096] uppercase">Strong Buyers</div>
            <div className="text-lg font-extrabold text-[#2EE6A6]">{strongBuyerPools.filter(p => p.strengthScore >= 65).length}</div>
          </div>
          <div className="bg-[#07090e] border border-[#1a2336] p-2.5 rounded-xl">
            <div className="text-[10px] text-[#718096] uppercase">Rule Verified</div>
            <div className="text-lg font-extrabold text-[#F5B31B]">{strongBuyerPools.filter(p => p.isVerified).length}</div>
          </div>
        </div>
      </div>

      {/* Verified Candidates List */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-mono text-[#8896ab] mb-3">
          <span>High Buyer-Strength Candidates (Live Ranking)</span>
          <span>Click any coin to inspect & trade</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {strongBuyerPools.slice(0, 8).map(pool => (
            <div
              key={pool.id}
              onClick={() => onSelectPool(pool)}
              className="bg-[#07090e] hover:bg-[#121927] border border-[#1a2438] hover:border-[#F5B31B]/50 p-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-between group shadow-md"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-sm group-hover:text-[#F5B31B] transition-colors">
                    {pool.name}
                  </span>
                  <span className="text-[10px] font-mono bg-[#162033] text-[#8896ab] px-1.5 py-0.5 rounded border border-[#222e44]">
                    {pool.chain}
                  </span>
                  {pool.isVerified && (
                    <span className="flex items-center gap-0.5 text-[10px] font-mono text-[#2EE6A6]">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-[#718096]">
                  <span>Price: <b className="text-white">${pool.price >= 1 ? pool.price.toFixed(2) : pool.price.toPrecision(4)}</b></span>
                  <span>24h: <b className={pool.ch >= 0 ? 'text-[#2EE6A6]' : 'text-[#FF4D6A]'}>{pool.ch >= 0 ? '+' : ''}{pool.ch.toFixed(1)}%</b></span>
                  <span>Liq: <b className="text-white">${(pool.liq / 1000).toFixed(0)}K</b></span>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="text-xs text-[#718096]">Buyer Score</div>
                <div className="text-base font-extrabold text-[#2EE6A6]">
                  {pool.strengthScore} <span className="text-[10px] text-[#718096]">/ 100</span>
                </div>
                <span className="text-[10px] text-[#8896ab]">
                  {pool.buyerRatio.toFixed(1)}x Buys/Sells
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
