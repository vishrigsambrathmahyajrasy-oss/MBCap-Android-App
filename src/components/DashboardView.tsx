import React from 'react';
import { TokenPool, CustomerWallet, CustomerTradeReceipt } from '../types/trading';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, Zap, BarChart2, Shield } from 'lucide-react';

interface DashboardViewProps {
  wallet: CustomerWallet;
  practiceCash: number;
  isRealMode: boolean;
  pools: TokenPool[];
  trades: CustomerTradeReceipt[];
  onSelectPool: (pool: TokenPool) => void;
  onNavigate: (view: string) => void;
  onConnectWallet: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  wallet,
  practiceCash,
  isRealMode,
  pools,
  trades,
  onSelectPool,
  onNavigate,
  onConnectWallet
}) => {
  // Sort gainers and losers
  const gainers = [...pools].sort((a, b) => b.ch - a.ch).slice(0, 4);
  const losers = [...pools].sort((a, b) => a.ch - b.ch).slice(0, 4);

  return (
    <div className="space-y-5 font-mono text-[#e2e8f0]">
      {/* Top Welcome / Portfolio Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0b0f19] border border-[#182236] p-4 rounded-2xl shadow-xl">
          <div className="text-xs text-[#718096]">Connected Customer</div>
          <div className="text-base font-extrabold text-white mt-1 truncate">
            {wallet.isConnected && wallet.address ? wallet.address.slice(0, 10) + '...' : 'Guest Trader'}
          </div>
          <div className="text-[11px] text-[#2EE6A6] mt-1 font-bold">
            {wallet.isConnected ? `${wallet.chainName} Connected` : 'Practice Session'}
          </div>
        </div>

        <div className="bg-[#0b0f19] border border-[#182236] p-4 rounded-2xl shadow-xl">
          <div className="text-xs text-[#718096]">Active Trading Mode</div>
          <div className={`text-base font-extrabold mt-1 ${isRealMode ? 'text-red-400' : 'text-[#2EE6A6]'}`}>
            {isRealMode ? 'LIVE REAL SWAPS' : 'PRACTICE ($1,000)'}
          </div>
          <div className="text-[11px] text-[#8896ab] mt-1">
            {isRealMode ? 'Direct Web3 on-chain execution' : 'Simulated execution'}
          </div>
        </div>

        <div className="bg-[#0b0f19] border border-[#182236] p-4 rounded-2xl shadow-xl">
          <div className="text-xs text-[#718096]">Trading Balance</div>
          <div className="text-xl font-extrabold text-white mt-1">
            {isRealMode ? (wallet.nativeBalance || '0.00') : `$${practiceCash.toFixed(2)}`}
          </div>
          <div className="text-[11px] text-[#F5B31B] mt-1 font-bold">
            0.06% transparent fee
          </div>
        </div>

        <div className="bg-[#0b0f19] border border-[#182236] p-4 rounded-2xl shadow-xl">
          <div className="text-xs text-[#718096]">Executed Trades</div>
          <div className="text-xl font-extrabold text-white mt-1">
            {trades.length}
          </div>
          <div className="text-[11px] text-[#8896ab] mt-1">
            Across multi-chain DEX pools
          </div>
        </div>
      </div>

      {/* Gainers & Losers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Gainers */}
        <div className="bg-[#0b0f19] border border-[#182236] p-4 sm:p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between border-b border-[#182236] pb-3 mb-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#2EE6A6]" />
              <span>Top Gainers (24h)</span>
            </h3>
            <span className="text-xs text-[#718096]">DEX trending</span>
          </div>

          <div className="space-y-2">
            {gainers.map(pool => (
              <div
                key={pool.id}
                onClick={() => onSelectPool(pool)}
                className="bg-[#07090e] hover:bg-[#121927] border border-[#1a2336] p-2.5 rounded-xl cursor-pointer flex items-center justify-between transition-colors text-xs"
              >
                <div>
                  <span className="font-extrabold text-white">{pool.name}</span>
                  <span className="text-[10px] text-[#8896ab] ml-2">{pool.chain}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">${pool.price >= 1 ? pool.price.toFixed(2) : pool.price.toPrecision(4)}</div>
                  <div className="text-[#2EE6A6] font-bold text-[11px]">+{pool.ch.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers / Dips */}
        <div className="bg-[#0b0f19] border border-[#182236] p-4 sm:p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between border-b border-[#182236] pb-3 mb-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <ArrowDownRight className="w-4 h-4 text-[#FF4D6A]" />
              <span>Top Pullbacks / Buy The Dip</span>
            </h3>
            <span className="text-xs text-[#718096]">Opportunity radar</span>
          </div>

          <div className="space-y-2">
            {losers.map(pool => (
              <div
                key={pool.id}
                onClick={() => onSelectPool(pool)}
                className="bg-[#07090e] hover:bg-[#121927] border border-[#1a2336] p-2.5 rounded-xl cursor-pointer flex items-center justify-between transition-colors text-xs"
              >
                <div>
                  <span className="font-extrabold text-white">{pool.name}</span>
                  <span className="text-[10px] text-[#8896ab] ml-2">{pool.chain}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">${pool.price >= 1 ? pool.price.toFixed(2) : pool.price.toPrecision(4)}</div>
                  <div className="text-[#FF4D6A] font-bold text-[11px]">{pool.ch.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Launchpad Buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={() => onNavigate('trade')}
          className="bg-[#F5B31B] hover:bg-[#e0a214] text-[#07090e] font-extrabold text-xs px-4 py-2.5 rounded-xl shadow transition-colors"
        >
          Open Live Swapper
        </button>
        <button
          onClick={() => onNavigate('topmarket')}
          className="bg-[#162033] hover:bg-[#1d2b45] text-white border border-[#263758] font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
        >
          Top 50 Crypto Market
        </button>
        <button
          onClick={() => onNavigate('mbrex')}
          className="bg-[#162033] hover:bg-[#1d2b45] text-[#2EE6A6] border border-[#263758] font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
        >
          MB-Rex Radar
        </button>
        <button
          onClick={() => onNavigate('portfolio')}
          className="bg-[#162033] hover:bg-[#1d2b45] text-white border border-[#263758] font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
        >
          Customer Trade Receipts
        </button>
      </div>
    </div>
  );
};
