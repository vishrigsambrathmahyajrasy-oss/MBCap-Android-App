import React, { useState } from 'react';
import { X, Wallet, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInWallet: () => void;
  onContinueGuest: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSignInWallet,
  onContinueGuest
}) => {
  const [hasAgreed, setHasAgreed] = useState<boolean>(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150 font-mono text-[#e2e8f0]">
      <div className="relative w-full max-w-md bg-[#0b0f19] border border-[#1e273a] rounded-3xl p-6 sm:p-7 shadow-2xl text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-[#718096] hover:text-white bg-[#07090e] hover:bg-[#162033] border border-[#1f283d] rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Logo Badge */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#F5B31B] to-[#2EE6A6] p-[2px] shadow-xl shadow-[#F5B31B]/15">
          <div className="w-full h-full bg-[#07090e] rounded-[14px] flex items-center justify-center font-extrabold text-xl text-[#F5B31B]">
            MB
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
          Sign in to MBCap
        </h2>

        <p className="text-xs text-[#8896ab] leading-relaxed mb-5 max-w-sm mx-auto">
          No password required. Connect your Web3 wallet to execute real live on-chain swaps, or enter instant practice mode to trade with simulated capital.
        </p>

        {/* Disclaimer Checkbox */}
        <label className="flex items-start gap-2.5 text-left text-xs text-[#718096] bg-[#07090e] p-3 rounded-xl border border-[#182236] cursor-pointer mb-5">
          <input
            type="checkbox"
            checked={hasAgreed}
            onChange={(e) => setHasAgreed(e.target.checked)}
            className="mt-0.5 rounded border-[#2d3a54] text-[#F5B31B] focus:ring-0 cursor-pointer"
          />
          <span>
            I understand that cryptocurrency trading involves financial risk, and MBCap provides non-custodial tools with a 0.06% transparent fee.
          </span>
        </label>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              onSignInWallet();
              onClose();
            }}
            disabled={!hasAgreed}
            className="w-full bg-gradient-to-r from-[#F5B31B] to-[#d49607] hover:from-[#f6bb33] hover:to-[#e5a40b] disabled:opacity-40 text-[#07090e] font-extrabold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#F5B31B]/15 transition-all transform active:scale-98"
          >
            <Wallet className="w-4 h-4" />
            <span>Sign In with Web3 Wallet</span>
          </button>

          <button
            onClick={() => {
              onContinueGuest();
              onClose();
            }}
            disabled={!hasAgreed}
            className="w-full bg-[#162033] hover:bg-[#1d2b45] disabled:opacity-40 text-white border border-[#273858] font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <span>Launch Terminal (Instant Access & Practice)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-[11px] text-[#4a5568] mt-4">
          Non-custodial · Works with MetaMask, Rabby, Coinbase, Trust Wallet
        </div>
      </div>
    </div>
  );
};
