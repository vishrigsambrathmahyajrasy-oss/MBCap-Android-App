import React, { useState, useEffect } from 'react';
import { TokenPool, CustomerWallet, CustomerTradeReceipt, SUPPORTED_CHAINS } from '../types/trading';
import { WalletService } from '../services/wallet';
import { ArrowDownUp, AlertCircle, CheckCircle, ShieldCheck, Flame, ExternalLink, RefreshCw, Zap } from 'lucide-react';

interface TradePanelProps {
  currentPool: TokenPool;
  wallet: CustomerWallet;
  isRealMode: boolean;
  onTradeSuccess: (receipt: CustomerTradeReceipt) => void;
  onConnectWallet: () => void;
  practiceCash: number;
  onUpdatePracticeCash: (newCash: number) => void;
}

export const TradePanel: React.FC<TradePanelProps> = ({
  currentPool,
  wallet,
  isRealMode,
  onTradeSuccess,
  onConnectWallet,
  practiceCash,
  onUpdatePracticeCash
}) => {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amountUsd, setAmountUsd] = useState<string>('100');
  const [slippage, setSlippage] = useState<number>(1.0); // 1.0% default
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [needsApproval, setNeedsApproval] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const tokenSymbol = currentPool.symbol || currentPool.name.split('/')[0] || 'TOKEN';
  const currentPrice = currentPool.price > 0 ? currentPool.price : 1;

  // Platform fee: 0.06%
  const feeRate = 0.0006;
  const numAmountUsd = parseFloat(amountUsd) || 0;
  const feeUsd = numAmountUsd * feeRate;
  const netAmountUsd = Math.max(0, numAmountUsd - feeUsd);

  // Price impact calculation based on pool liquidity
  const liquidity = Math.max(currentPool.liq, 10000);
  const priceImpact = Math.min((numAmountUsd / liquidity) * 100, 15);

  // Estimated tokens received / sold
  const estimatedTokens = side === 'buy'
    ? (netAmountUsd / currentPrice) * (1 - priceImpact / 100)
    : (netAmountUsd / currentPrice);

  const minReceivedTokens = estimatedTokens * (1 - slippage / 100);

  // Network gas estimate in USD
  const chainConfig = wallet.chainId ? SUPPORTED_CHAINS[wallet.chainId] : SUPPORTED_CHAINS[1];
  const estGasUsd = currentPool.chain.toLowerCase().includes('base')
    ? 0.02
    : currentPool.chain.toLowerCase().includes('arbitrum')
    ? 0.08
    : currentPool.chain.toLowerCase().includes('polygon')
    ? 0.03
    : currentPool.chain.toLowerCase().includes('bnb')
    ? 0.12
    : 2.20;

  // Check ERC20 approval if customer is in Real Mode and selling token
  useEffect(() => {
    let active = true;

    async function checkTokenApproval() {
      if (!isRealMode || !wallet.isConnected || !wallet.address || side !== 'sell') {
        setNeedsApproval(false);
        return;
      }

      if (!currentPool.tokenAddress || currentPool.tokenAddress.startsWith('0xeeeee')) {
        setNeedsApproval(false);
        return;
      }

      try {
        const router = chainConfig?.routerAddress || '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
        const allowance = await WalletService.checkAllowance(
          currentPool.tokenAddress,
          wallet.address,
          router,
          wallet.chainId || 1
        );

        if (active) {
          setNeedsApproval(allowance <= 0n);
        }
      } catch (err) {
        if (active) setNeedsApproval(false);
      }
    }

    checkTokenApproval();
    return () => { active = false; };
  }, [isRealMode, wallet.isConnected, wallet.address, side, currentPool.tokenAddress, wallet.chainId]);

  // Handle Token Approval
  const handleApprove = async () => {
    if (!wallet.address || !currentPool.tokenAddress) return;

    setIsApproving(true);
    setErrorMessage(null);

    try {
      const router = chainConfig?.routerAddress || '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
      const tx = await WalletService.approveToken(
        currentPool.tokenAddress,
        router,
        wallet.address
      );
      setSuccessMessage(`Approval submitted! TX: ${tx.slice(0, 10)}...`);
      setNeedsApproval(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Token approval was rejected');
    } finally {
      setIsApproving(false);
    }
  };

  // Handle Quick Amount percentage
  const handleQuickPercent = (pct: number) => {
    if (isRealMode) {
      // In real mode, use native or token balance if available
      const maxVal = 250; // default test cap
      setAmountUsd(((maxVal * pct) / 100).toFixed(2));
    } else {
      // In practice mode, use practice cash
      const maxVal = Math.max(practiceCash, 10);
      setAmountUsd(((maxVal * pct) / 100).toFixed(2));
    }
  };

  // Execute Swap: Real or Practice
  const handleExecuteTrade = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLastTxHash(null);

    if (numAmountUsd <= 0) {
      setErrorMessage('Please enter an amount greater than 0');
      return;
    }

    if (isRealMode && !wallet.isConnected) {
      onConnectWallet();
      return;
    }

    setIsExecuting(true);

    try {
      if (isRealMode && wallet.address) {
        // --- LIVE REAL ON-CHAIN SWAP ---
        const routerAddress = chainConfig?.routerAddress || '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
        const isNativeSell = side === 'buy'; // Buying token with native ETH/BNB

        // Convert USD to native amount approximation (e.g. at $3000 ETH)
        const ethPriceApprox = 3200;
        const nativeAmount = (numAmountUsd / ethPriceApprox);
        const sellAmountWei = BigInt(Math.floor(nativeAmount * 1e18));
        const minBuyAmountWei = BigInt(Math.floor(minReceivedTokens * 1e18));

        const txHash = await WalletService.executeLiveSwap({
          fromAddress: wallet.address,
          targetRouter: routerAddress,
          sellToken: isNativeSell ? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' : currentPool.tokenAddress,
          buyToken: isNativeSell ? currentPool.tokenAddress : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          sellAmountWei: sellAmountWei > 0n ? sellAmountWei : 1000000000000000n, // ~0.001 ETH min
          minBuyAmountWei,
          isNativeSell
        });

        setLastTxHash(txHash);
        setSuccessMessage(`Live trade executed on-chain! Tx: ${txHash.slice(0, 10)}...`);

        const receipt: CustomerTradeReceipt = {
          id: `tx_${Date.now()}`,
          timestamp: Date.now(),
          txHash,
          mode: 'live',
          side,
          pair: currentPool.name,
          chain: currentPool.chain,
          amountUsd: numAmountUsd,
          tokenAmount: estimatedTokens,
          price: currentPrice,
          feeUsd,
          status: 'confirmed',
          explorerUrl: chainConfig ? `${chainConfig.blockExplorerUrls[0]}/tx/${txHash}` : undefined
        };

        onTradeSuccess(receipt);
      } else {
        // --- PRACTICE / PAPER TRADING SIMULATION ---
        if (side === 'buy' && practiceCash < numAmountUsd) {
          throw new Error(`Insufficient simulated cash. Balance: $${practiceCash.toFixed(2)}`);
        }

        // Deduct/add paper funds
        if (side === 'buy') {
          onUpdatePracticeCash(practiceCash - numAmountUsd);
        } else {
          onUpdatePracticeCash(practiceCash + numAmountUsd - feeUsd);
        }

        const simulatedTx = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        setSuccessMessage(`Practice trade filled at ${currentPrice >= 1 ? '$' + currentPrice.toFixed(2) : '$' + currentPrice.toPrecision(5)}!`);

        const receipt: CustomerTradeReceipt = {
          id: `sim_${Date.now()}`,
          timestamp: Date.now(),
          txHash: simulatedTx,
          mode: 'practice',
          side,
          pair: currentPool.name,
          chain: currentPool.chain,
          amountUsd: numAmountUsd,
          tokenAmount: estimatedTokens,
          price: currentPrice,
          feeUsd,
          status: 'confirmed'
        };

        onTradeSuccess(receipt);
      }
    } catch (err: any) {
      console.error('Trade execution failed:', err);
      setErrorMessage(err.message || 'Trade execution failed or cancelled');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="bg-[#0b0f19] border border-[#182236] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
      <div>
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-[#182236] pb-3 mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#718096] tracking-wider">
              {isRealMode ? 'Live Customer Execution' : 'Simulation Engine'}
            </span>
            <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
              <span>Trade {tokenSymbol}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                isRealMode ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}>
                {isRealMode ? 'REAL ON-CHAIN' : 'PAPER TRADING'}
              </span>
            </h3>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="text-[#718096]">Avail: </span>
            <span className="font-bold text-[#2EE6A6]">
              {isRealMode ? (wallet.nativeBalance || '0.00') : `$${practiceCash.toFixed(2)} USD`}
            </span>
          </div>
        </div>

        {/* Order Side Tabs (BUY / SELL) */}
        <div className="grid grid-cols-2 gap-2 bg-[#07090e] p-1 rounded-xl border border-[#1a2336] mb-4">
          <button
            onClick={() => setSide('buy')}
            className={`py-2 rounded-lg font-extrabold text-xs transition-all ${
              side === 'buy'
                ? 'bg-[#2EE6A6] text-[#07090e] shadow-lg shadow-[#2EE6A6]/20'
                : 'text-[#718096] hover:text-white'
            }`}
          >
            BUY {tokenSymbol}
          </button>
          <button
            onClick={() => setSide('sell')}
            className={`py-2 rounded-lg font-extrabold text-xs transition-all ${
              side === 'sell'
                ? 'bg-[#FF4D6A] text-white shadow-lg shadow-[#FF4D6A]/20'
                : 'text-[#718096] hover:text-white'
            }`}
          >
            SELL {tokenSymbol}
          </button>
        </div>

        {/* Amount Input */}
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-xs font-mono text-[#8896ab]">
            <label htmlFor="trade-amount">Amount to {side === 'buy' ? 'Spend (USD)' : 'Sell'}</label>
            <span>≈ {estimatedTokens > 0 ? estimatedTokens.toFixed(4) : '0'} {tokenSymbol}</span>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718096] font-mono font-bold">$</span>
            <input
              id="trade-amount"
              type="number"
              min="1"
              step="any"
              value={amountUsd}
              onChange={(e) => setAmountUsd(e.target.value)}
              className="w-full bg-[#07090e] border border-[#1f283d] focus:border-[#F5B31B] text-white font-mono font-bold text-base rounded-xl py-2.5 pl-8 pr-16 outline-none transition-colors"
              placeholder="0.00"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#718096] font-semibold">
              USD
            </span>
          </div>
        </div>

        {/* Quick Percent Buttons */}
        <div className="grid grid-cols-4 gap-1.5 mb-4">
          {[25, 50, 75, 100].map(pct => (
            <button
              key={pct}
              type="button"
              onClick={() => handleQuickPercent(pct)}
              className="bg-[#0e1422] hover:bg-[#162136] border border-[#1e273a] text-[11px] font-mono text-[#cbd5e1] py-1 rounded-lg transition-colors font-medium"
            >
              {pct === 100 ? 'MAX' : `${pct}%`}
            </button>
          ))}
        </div>

        {/* Slippage Selector */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-mono text-[#8896ab] mb-1">
            <span>Slippage Tolerance</span>
            <span className="text-[#F5B31B] font-bold">{slippage}%</span>
          </div>
          <div className="flex gap-2">
            {[0.1, 0.5, 1.0, 3.0].map(sl => (
              <button
                key={sl}
                type="button"
                onClick={() => setSlippage(sl)}
                className={`flex-1 py-1 text-xs font-mono rounded-lg border transition-all ${
                  slippage === sl
                    ? 'bg-[#1b253b] border-[#F5B31B] text-[#F5B31B] font-bold'
                    : 'bg-[#07090e] border-[#182236] text-[#718096] hover:text-white'
                }`}
              >
                {sl}%
              </button>
            ))}
          </div>
        </div>

        {/* Order Summary & Fee Breakdown */}
        <div className="bg-[#07090e] border border-[#161f30] rounded-xl p-3 space-y-2 text-xs font-mono mb-4">
          <div className="flex justify-between text-[#718096]">
            <span>Platform Fee (0.06%)</span>
            <span className="text-white">${feeUsd.toFixed(4)}</span>
          </div>
          <div className="flex justify-between text-[#718096]">
            <span>Est. Price Impact</span>
            <span className={priceImpact > 2 ? 'text-[#FF4D6A]' : 'text-white'}>
              {priceImpact.toFixed(3)}%
            </span>
          </div>
          <div className="flex justify-between text-[#718096]">
            <span>Network Gas (Est.)</span>
            <span className="text-white">~${estGasUsd.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[#718096] border-t border-[#141b29] pt-2">
            <span>Minimum Received</span>
            <span className="text-[#2EE6A6] font-bold">
              {minReceivedTokens.toFixed(4)} {tokenSymbol}
            </span>
          </div>
          <div className="flex justify-between text-[#718096]">
            <span>DEX Router</span>
            <span className="text-[#8896ab] truncate max-w-[160px]" title={chainConfig?.routerAddress}>
              {currentPool.source} ({chainConfig?.shortName})
            </span>
          </div>
        </div>

        {/* Token Approval Button if required */}
        {needsApproval && (
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="w-full mb-2 bg-[#F5B31B] hover:bg-[#e0a214] text-[#07090e] font-extrabold py-2.5 rounded-xl text-xs sm:text-sm font-mono flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            {isApproving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Approve {tokenSymbol} for DEX Router</span>
          </button>
        )}

        {/* Execution Button */}
        {!wallet.isConnected && isRealMode ? (
          <button
            onClick={onConnectWallet}
            className="w-full bg-gradient-to-r from-[#F5B31B] to-[#d49607] hover:from-[#f6bb33] hover:to-[#e5a40b] text-[#07090e] font-extrabold py-3 rounded-xl text-sm font-mono flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-98"
          >
            <Zap className="w-4 h-4" />
            <span>Connect Wallet to Trade</span>
          </button>
        ) : (
          <button
            onClick={handleExecuteTrade}
            disabled={isExecuting || isApproving}
            className={`w-full py-3 rounded-xl font-extrabold text-sm font-mono flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-98 ${
              side === 'buy'
                ? 'bg-[#2EE6A6] hover:bg-[#26cb93] text-[#07090e] shadow-[#2EE6A6]/20'
                : 'bg-[#FF4D6A] hover:bg-[#e63f5c] text-white shadow-[#FF4D6A]/20'
            } ${isExecuting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{isRealMode ? 'Signing On-Chain...' : 'Filling Order...'}</span>
              </>
            ) : (
              <>
                <ArrowDownUp className="w-4 h-4" />
                <span>
                  {side === 'buy' ? 'BUY' : 'SELL'} {tokenSymbol} {isRealMode ? '(LIVE ON-CHAIN)' : '(SIMULATION)'}
                </span>
              </>
            )}
          </button>
        )}

        {/* Status Messages */}
        {errorMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="font-mono">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="font-mono">
              <div>{successMessage}</div>
              {lastTxHash && chainConfig && (
                <a
                  href={`${chainConfig.blockExplorerUrls[0]}/tx/${lastTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F5B31B] underline text-[11px] inline-flex items-center gap-1 mt-1"
                >
                  View on {chainConfig.shortName} Explorer <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Safety Notice Footer */}
      <div className="mt-4 pt-3 border-t border-[#141b29] text-[11px] font-mono text-[#718096] flex items-center justify-between">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2EE6A6]" />
          <span>Non-Custodial · Direct Wallet Control</span>
        </span>
        <span className="text-[#8896ab]">Slip: {slippage}%</span>
      </div>
    </div>
  );
};
