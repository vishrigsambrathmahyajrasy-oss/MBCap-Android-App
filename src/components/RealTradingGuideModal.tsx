import React from 'react';
import { X, Wallet, Globe, ArrowRight, ShieldCheck, CheckCircle2, Zap, HelpCircle } from 'lucide-react';

interface RealTradingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectWallet: () => void;
  isConnected: boolean;
}

export const RealTradingGuideModal: React.FC<RealTradingGuideModalProps> = ({
  isOpen,
  onClose,
  onConnectWallet,
  isConnected
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: 1,
      title: 'Get a Web3 EVM Wallet',
      desc: 'Install a non-custodial wallet browser extension or mobile app (MetaMask, Rabby, Coinbase Wallet, OKX Wallet, or Trust Wallet).',
      tip: 'You keep 100% control of your private keys; MBCap never touches your funds.'
    },
    {
      num: 2,
      title: 'Deposit Gas Funds (ETH or BNB)',
      desc: 'Ensure your wallet has a small amount of native gas coins to pay blockchain network gas.',
      tip: 'Recommendation: Base, Arbitrum, or Polygon offer ultra-low gas fees (~$0.02 to $0.08 per swap).'
    },
    {
      num: 3,
      title: 'Connect Wallet & Select Network',
      desc: 'Click "Connect Wallet" at the top right, approve the connection in your wallet, and choose your network (Base, Ethereum, BNB Chain, etc.).',
      tip: 'Toggle the mode at the top to "🔴 LIVE REAL TRADING".'
    },
    {
      num: 4,
      title: 'Execute Your Real Swap',
      desc: 'Pick any token (e.g. PEPE, BRETT, WIF), enter the USD amount, and click "BUY" or "SELL". Your wallet popup will ask for your confirmation.',
      tip: 'If selling an ERC-20 token, click "Approve Token" once first, then sign the swap.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150 font-mono text-[#e2e8f0]">
      <div className="relative w-full max-w-xl bg-[#0b0f19] border border-[#1e273a] rounded-3xl p-6 sm:p-7 shadow-2xl my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-[#718096] hover:text-white bg-[#07090e] hover:bg-[#162033] border border-[#1f283d] rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F5B31B] to-[#2EE6A6] p-[2px] shadow-lg">
            <div className="w-full h-full bg-[#07090e] rounded-[14px] flex items-center justify-center font-extrabold text-[#F5B31B]">
              <Zap className="w-6 h-6 fill-current" />
            </div>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              How Customers Start Real Trading
            </h2>
            <div className="text-xs text-[#8896ab]">
              Complete 4-step checklist for live on-chain DEX swaps
            </div>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3 mb-6">
          {steps.map(s => (
            <div
              key={s.num}
              className="bg-[#07090e] border border-[#1a2336] p-3.5 rounded-2xl flex items-start gap-3.5 transition-colors hover:border-[#2d3a54]"
            >
              <div className="w-7 h-7 rounded-full bg-[#1b253b] text-[#F5B31B] border border-[#F5B31B]/40 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {s.num}
              </div>
              <div className="space-y-1 flex-1">
                <div className="text-sm font-extrabold text-white">{s.title}</div>
                <div className="text-xs text-[#cbd5e1] leading-relaxed">{s.desc}</div>
                <div className="text-[11px] text-[#2EE6A6] bg-[#2EE6A6]/10 px-2 py-0.5 rounded border border-[#2EE6A6]/20 inline-block font-mono">
                  💡 {s.tip}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Action */}
        <div className="flex items-center gap-3">
          {!isConnected ? (
            <button
              onClick={() => {
                onConnectWallet();
                onClose();
              }}
              className="flex-1 bg-gradient-to-r from-[#F5B31B] to-[#d49607] hover:from-[#f6bb33] hover:to-[#e5a40b] text-[#07090e] font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#F5B31B]/15 transition-all transform active:scale-98"
            >
              <Wallet className="w-4 h-4" />
              <span>Step 1 & 3: Connect Web3 Wallet Now</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 bg-[#2EE6A6] hover:bg-[#25ca91] text-[#07090e] font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Wallet Connected! Start Trading Now</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-3 bg-[#162033] hover:bg-[#1d2b45] text-white border border-[#273858] font-bold rounded-xl text-xs transition-colors"
          >
            Got it
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#718096] border-t border-[#182030] pt-3 mt-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2EE6A6]" />
            <span>Non-custodial, direct DEX liquidity</span>
          </span>
          <span className="text-[#F5B31B]">0.06% transparent fee</span>
        </div>
      </div>
    </div>
  );
};
