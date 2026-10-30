import React from 'react';
import { CustomerWallet, CustomerTradeReceipt, SUPPORTED_CHAINS } from '../types/trading';
import { Wallet, TrendingUp, History, ExternalLink, ShieldCheck, Download, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface CustomerPortfolioProps {
  wallet: CustomerWallet;
  isRealMode: boolean;
  practiceCash: number;
  trades: CustomerTradeReceipt[];
  onClearHistory: () => void;
  onResetPractice: () => void;
  onConnectWallet: () => void;
}

export const CustomerPortfolio: React.FC<CustomerPortfolioProps> = ({
  wallet,
  isRealMode,
  practiceCash,
  trades,
  onClearHistory,
  onResetPractice,
  onConnectWallet
}) => {
  // Calculate total volume, win/loss, and fees paid
  const totalVolume = trades.reduce((acc, t) => acc + t.amountUsd, 0);
  const totalFeesPaid = trades.reduce((acc, t) => acc + t.feeUsd, 0);

  // Practice P/L
  const practicePnL = practiceCash - 1000;
  const practicePnLPercent = (practicePnL / 1000) * 100;

  const currentChain = wallet.chainId ? SUPPORTED_CHAINS[wallet.chainId] : null;

  return (
    <div className="space-y-6">
      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallet / Cash Status */}
        <div className="bg-[#0b0f19] border border-[#182236] p-4 rounded-2xl shadow-xl font-mono">
          <div className="flex items-center justify-between text-xs text-[#718096] mb-1">
            <span>{isRealMode ? 'Live Wallet Balance' : 'Practice Cash'}</span>
            <Wallet className="w-4 h-4 text-[#F5B31B]" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            {isRealMode ? (wallet.nativeBalance || '0.00') : `$${practiceCash.toFixed(2)}`}
          </div>
          <div className="text-[11px] text-[#8896ab] mt-1 flex items-center justify-between">
            <span>{isRealMode ? (wallet.chainName || 'EVM Network') : 'Simulated Capital'}</span>
            {!isRealMode && (
              <button
                onClick={onResetPractice}
                className="text-[#F5B31B] hover:underline"
              >
                Reset to $1K
              </button>
            )}
          </div>
        </div>

        {/* Profit / Loss */}
        <div className="bg-[#0b0f19] border border-[#182236] p-4 rounded-2xl shadow-xl font-mono">
          <div className="flex items-center justify-between text-xs text-[#718096] mb-1">
            <span>Estimated P/L</span>
            <TrendingUp className="w-4 h-4 text-[#2EE6A6]" />
          </div>
          <div className={`text-xl sm:text-2xl font-extrabold mt-1 ${
            practicePnL >= 0 ? 'text-[#2EE6A6]' : 'text-[#FF4D6A]'
          }`}>
            {practicePnL >= 0 ? '+' : ''}${practicePnL.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#8896ab] mt-1">
            {practicePnLPercent >= 0 ? '+' : ''}{practicePnLPercent.toFixed(2)}% on simulated equity
          </div>
        </div>

        {/* Total Volume */}
        <div className="bg-[#0b0f19] border border-[#182236] p-4 rounded-2xl shadow-xl font-mono">
          <div className="flex items-center justify-between text-xs text-[#718096] mb-1">
            <span>Total Trading Volume</span>
            <span className="text-xs text-[#cbd5e1] font-bold">{trades.length} trades</span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            ${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#8896ab] mt-1">
            Both Live and Practice orders
          </div>
        </div>

        {/* Total Platform Fees */}
        <div className="bg-[#0b0f19] border border-[#182236] p-4 rounded-2xl shadow-xl font-mono">
          <div className="flex items-center justify-between text-xs text-[#718096] mb-1">
            <span>Platform Fees (0.06%)</span>
            <span className="text-[10px] bg-[#2a2208] text-[#F5B31B] px-1.5 py-0.5 rounded font-bold">
              Transparent
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#F5B31B] mt-1">
            ${totalFeesPaid.toFixed(4)}
          </div>
          <div className="text-[11px] text-[#8896ab] mt-1">
            Lowest DEX standard fee
          </div>
        </div>
      </div>

      {/* Connected Customer Info Bar */}
      {isRealMode && !wallet.isConnected && (
        <div className="bg-gradient-to-r from-[#182030] to-[#0f1422] border border-[#2d3a54] p-4 rounded-2xl flex items-center justify-between flex-wrap gap-3">
          <div>
            <h4 className="text-sm font-bold text-white font-mono">Connect your Web3 Wallet for Live Customer Trading</h4>
            <p className="text-xs text-[#8896ab] font-mono mt-0.5">
              Supports MetaMask, Rabby, Coinbase Wallet, OKX, and any standard EIP-1193 EVM browser wallet.
            </p>
          </div>
          <button
            onClick={onConnectWallet}
            className="bg-[#F5B31B] hover:bg-[#e0a214] text-[#07090e] font-extrabold text-xs px-4 py-2 rounded-xl font-mono shadow"
          >
            Connect Real Wallet
          </button>
        </div>
      )}

      {/* Order & Swap Receipts Table */}
      <div className="bg-[#0b0f19] border border-[#182236] rounded-2xl p-4 sm:p-5 shadow-xl font-mono">
        <div className="flex items-center justify-between border-b border-[#182236] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#F5B31B]" />
            <h3 className="text-sm sm:text-base font-extrabold text-white">
              Customer Trade History & Receipts
            </h3>
          </div>

          {trades.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1 text-xs text-[#718096] hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {trades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#718096] border-b border-[#182236] text-[11px]">
                  <th className="py-2 px-3">Date / Time</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Pair / Chain</th>
                  <th className="py-2 px-3 text-right">Trade Value</th>
                  <th className="py-2 px-3 text-right">Tokens</th>
                  <th className="py-2 px-3 text-right">Price</th>
                  <th className="py-2 px-3 text-right">Fee (0.06%)</th>
                  <th className="py-2 px-3 text-right">Explorer Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141b29]">
                {trades.map(trade => (
                  <tr key={trade.id} className="hover:bg-[#121927] transition-colors">
                    <td className="py-2.5 px-3 text-[#8896ab]">
                      {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        trade.side === 'buy'
                          ? 'bg-[#2EE6A6]/10 text-[#2EE6A6] border border-[#2EE6A6]/30'
                          : 'bg-[#FF4D6A]/10 text-[#FF4D6A] border border-[#FF4D6A]/30'
                      }`}>
                        {trade.side.toUpperCase()}
                      </span>
                      <span className="ml-1 text-[9px] text-[#718096]">
                        {trade.mode === 'live' ? 'REAL' : 'SIM'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-white">{trade.pair}</div>
                      <div className="text-[10px] text-[#718096]">{trade.chain}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">
                      ${trade.amountUsd.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#cbd5e1]">
                      {trade.tokenAmount.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#cbd5e1]">
                      ${trade.price >= 1 ? trade.price.toFixed(2) : trade.price.toPrecision(4)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#F5B31B]">
                      ${trade.feeUsd.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {trade.explorerUrl ? (
                        <a
                          href={trade.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#2EE6A6] hover:underline"
                        >
                          <span>TX Receipt</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[#4a5568]">Simulated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-[#718096] text-xs">
            No trades executed yet. Switch to Live Trade or Practice Mode to execute your first order.
          </div>
        )}
      </div>
    </div>
  );
};
