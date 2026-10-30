import React, { useState, useEffect } from 'react';
import { TokenPool, CustomerWallet, CustomerTradeReceipt, SUPPORTED_CHAINS } from '../types/trading';
import { WalletService } from '../services/wallet';
import { X, ExternalLink, ShieldCheck, ArrowDownUp, RefreshCw, CheckCircle2, AlertTriangle, Zap, Bot, Star } from 'lucide-react';

interface CoinDetailModalProps {
  pool: TokenPool | null;
  isOpen: boolean;
  onClose: () => void;
  wallet: CustomerWallet;
  isRealMode: boolean;
  onTradeSuccess: (receipt: CustomerTradeReceipt) => void;
  onConnectWallet: () => void;
  practiceCash: number;
  onUpdatePracticeCash: (newCash: number) => void;
  isStarred: boolean;
  onToggleStar: () => void;
}

export const CoinDetailModal: React.FC<CoinDetailModalProps> = ({
  pool,
  isOpen,
  onClose,
  wallet,
  isRealMode,
  onTradeSuccess,
  onConnectWallet,
  practiceCash,
  onUpdatePracticeCash,
  isStarred,
  onToggleStar
}) => {
  const [tab, setTab] = useState<'manual' | 'auto' | 'live'>('manual');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amountUsd, setAmountUsd] = useState<string>('100');
  const [slippage, setSlippage] = useState<number>(1.0);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [needsApproval, setNeedsApproval] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error'; txHash?: string } | null>(null);

  // Auto Bot settings inside modal
  const [botTp, setBotTp] = useState<number>(3.0);
  const [botSl, setBotSl] = useState<number>(2.0);
  const [botDip, setBotDip] = useState<number>(2.5);

  if (!isOpen || !pool) return null;

  const tokenSymbol = pool.symbol || pool.name.split('/')[0];
  const price = pool.price > 0 ? pool.price : 1;
  const numAmountUsd = parseFloat(amountUsd) || 0;
  const feeRate = 0.0006;
  const feeUsd = numAmountUsd * feeRate;
  const netAmountUsd = Math.max(0, numAmountUsd - feeUsd);
  const estimatedTokens = side === 'buy' ? netAmountUsd / price : netAmountUsd / price;
  const minReceived = estimatedTokens * (1 - slippage / 100);

  const chainConfig = pool.chainId ? SUPPORTED_CHAINS[pool.chainId] : SUPPORTED_CHAINS[1];

  const handleExecuteTrade = async () => {
    setStatusMessage(null);
    if (numAmountUsd <= 0) {
      setStatusMessage({ text: 'Please enter an amount greater than 0', type: 'error' });
      return;
    }

    if (isRealMode && !wallet.isConnected) {
      onConnectWallet();
      return;
    }

    setIsExecuting(true);

    try {
      if (isRealMode && wallet.address) {
        const routerAddress = chainConfig?.routerAddress || '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
        const isNativeSell = side === 'buy';
        const ethPriceApprox = 3200;
        const nativeAmount = (numAmountUsd / ethPriceApprox);
        const sellAmountWei = BigInt(Math.floor(nativeAmount * 1e18));

        const txHash = await WalletService.executeLiveSwap({
          fromAddress: wallet.address,
          targetRouter: routerAddress,
          sellToken: isNativeSell ? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' : pool.tokenAddress,
          buyToken: isNativeSell ? pool.tokenAddress : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          sellAmountWei: sellAmountWei > 0n ? sellAmountWei : 1000000000000000n,
          minBuyAmountWei: BigInt(Math.floor(minReceived * 1e18)),
          isNativeSell
        });

        setStatusMessage({
          text: `Live Real Swap Executed on ${pool.chain}!`,
          type: 'success',
          txHash
        });

        const receipt: CustomerTradeReceipt = {
          id: `tx_${Date.now()}`,
          timestamp: Date.now(),
          txHash,
          mode: 'live',
          side,
          pair: pool.name,
          chain: pool.chain,
          amountUsd: numAmountUsd,
          tokenAmount: estimatedTokens,
          price,
          feeUsd,
          status: 'confirmed',
          explorerUrl: chainConfig ? `${chainConfig.blockExplorerUrls[0]}/tx/${txHash}` : undefined
        };

        onTradeSuccess(receipt);
      } else {
        if (side === 'buy' && practiceCash < numAmountUsd) {
          throw new Error(`Insufficient simulated cash. Balance: $${practiceCash.toFixed(2)}`);
        }

        if (side === 'buy') {
          onUpdatePracticeCash(practiceCash - numAmountUsd);
        } else {
          onUpdatePracticeCash(practiceCash + numAmountUsd - feeUsd);
        }

        const simulatedTx = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        setStatusMessage({
          text: `Practice Order Filled at $${price >= 1 ? price.toFixed(2) : price.toPrecision(4)}!`,
          type: 'success'
        });

        const receipt: CustomerTradeReceipt = {
          id: `sim_${Date.now()}`,
          timestamp: Date.now(),
          txHash: simulatedTx,
          mode: 'practice',
          side,
          pair: pool.name,
          chain: pool.chain,
          amountUsd: numAmountUsd,
          tokenAmount: estimatedTokens,
          price,
          feeUsd,
          status: 'confirmed'
        };

        onTradeSuccess(receipt);
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Execution failed', type: 'error' });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#0b0f19] border border-[#1e273a] rounded-3xl p-5 sm:p-6 shadow-2xl font-mono text-[#e2e8f0] my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-[#718096] hover:text-white bg-[#07090e] hover:bg-[#162033] border border-[#1f283d] rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pr-10 mb-4">
          <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 font-extrabold text-center ${
            pool.ch >= 0 ? 'border-[#2EE6A6] bg-[#2EE6A6]/10 text-[#2EE6A6]' : 'border-[#FF4D6A] bg-[#FF4D6A]/10 text-[#FF4D6A]'
          }`}>
            <span className="text-xs">{tokenSymbol.slice(0, 4)}</span>
            <span className="text-[10px]">{pool.ch >= 0 ? '+' : ''}{pool.ch.toFixed(1)}%</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">{pool.name}</h2>
              <button onClick={onToggleStar} className={`p-1 ${isStarred ? 'text-[#F5B31B]' : 'text-[#718096]'}`}>
                <Star className="w-4 h-4 fill-current" />
              </button>
            </div>
            <div className="text-xs text-[#8896ab] flex items-center gap-2 mt-0.5">
              <span>{pool.chain}</span>
              <span>·</span>
              <span className="text-white font-bold">${price >= 1 ? price.toFixed(2) : price.toPrecision(5)}</span>
            </div>
          </div>
        </div>

        {/* Quick Stat Chips */}
        <div className="flex flex-wrap gap-2 text-xs mb-4">
          <span className="bg-[#07090e] border border-[#1a2336] px-2.5 py-1 rounded-full text-[#8896ab]">
            24h Vol: <b className="text-white">${(pool.vol / 1e6).toFixed(1)}M</b>
          </span>
          <span className="bg-[#07090e] border border-[#1a2336] px-2.5 py-1 rounded-full text-[#8896ab]">
            Liquidity: <b className="text-white">${(pool.liq / 1e6).toFixed(1)}M</b>
          </span>
          <span className="bg-[#2a2208] border border-[#F5B31B]/30 px-2.5 py-1 rounded-full text-[#F5B31B]">
            Fee: 0.06%
          </span>
          {pool.url && (
            <a
              href={pool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#07090e] hover:bg-[#141d2e] border border-[#1a2336] px-2.5 py-1 rounded-full text-[#2EE6A6] flex items-center gap-1"
            >
              <span>Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Trade Mode Selector (Manual / Auto Bot / Live Real Swap) */}
        <div className="grid grid-cols-3 gap-1 bg-[#07090e] p-1 rounded-xl border border-[#1a2336] mb-4 text-xs font-bold text-center">
          <button
            onClick={() => setTab('manual')}
            className={`py-2 rounded-lg transition-all ${
              tab === 'manual' ? 'bg-[#1e2a42] text-white shadow' : 'text-[#718096] hover:text-white'
            }`}
          >
            Manual Trade
          </button>
          <button
            onClick={() => setTab('auto')}
            className={`py-2 rounded-lg transition-all ${
              tab === 'auto' ? 'bg-[#1e2a42] text-white shadow' : 'text-[#718096] hover:text-white'
            }`}
          >
            Auto Bot
          </button>
          <button
            onClick={() => setTab('live')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
              tab === 'live' ? 'bg-[#F5B31B] text-[#07090e] shadow' : 'text-[#F5B31B] hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>Live Swap</span>
          </button>
        </div>

        {/* Tab 1: Manual Trade */}
        {tab === 'manual' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 bg-[#07090e] p-1 rounded-xl border border-[#182236]">
              <button
                onClick={() => setSide('buy')}
                className={`py-2 rounded-lg font-bold text-xs ${
                  side === 'buy' ? 'bg-[#2EE6A6] text-[#07090e]' : 'text-[#718096]'
                }`}
              >
                BUY {tokenSymbol}
              </button>
              <button
                onClick={() => setSide('sell')}
                className={`py-2 rounded-lg font-bold text-xs ${
                  side === 'sell' ? 'bg-[#FF4D6A] text-white' : 'text-[#718096]'
                }`}
              >
                SELL {tokenSymbol}
              </button>
            </div>

            <div>
              <label className="text-[11px] text-[#718096] mb-1 block">Trade Amount (USD)</label>
              <input
                type="number"
                min="1"
                step="any"
                value={amountUsd}
                onChange={(e) => setAmountUsd(e.target.value)}
                className="w-full bg-[#07090e] border border-[#1a2336] focus:border-[#F5B31B] text-white p-2.5 rounded-xl text-sm outline-none"
              />
            </div>

            <div className="bg-[#07090e] p-3 rounded-xl border border-[#161f30] text-xs space-y-1.5 text-[#8896ab]">
              <div className="flex justify-between">
                <span>Estimated Receive:</span>
                <span className="text-white font-bold">{estimatedTokens.toFixed(4)} {tokenSymbol}</span>
              </div>
              <div className="flex justify-between">
                <span>0.06% Platform Fee:</span>
                <span className="text-[#F5B31B]">${feeUsd.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span>Trading Mode:</span>
                <span className={isRealMode ? 'text-red-400 font-bold' : 'text-[#2EE6A6] font-bold'}>
                  {isRealMode ? 'LIVE REAL TRADING' : 'PRACTICE SIMULATION'}
                </span>
              </div>
            </div>

            <button
              onClick={handleExecuteTrade}
              disabled={isExecuting}
              className={`w-full py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98 ${
                side === 'buy' ? 'bg-[#2EE6A6] text-[#07090e]' : 'bg-[#FF4D6A] text-white'
              }`}
            >
              {isExecuting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowDownUp className="w-4 h-4" />}
              <span>{side.toUpperCase()} {tokenSymbol} {isRealMode ? '(ON-CHAIN)' : '(SIMULATED)'}</span>
            </button>
          </div>
        )}

        {/* Tab 2: Auto Bot */}
        {tab === 'auto' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-[#718096] block mb-1">Take Profit %</label>
                <input
                  type="number"
                  step="0.5"
                  value={botTp}
                  onChange={e => setBotTp(parseFloat(e.target.value) || 1)}
                  className="w-full bg-[#07090e] border border-[#1a2336] p-2 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#718096] block mb-1">Stop Loss %</label>
                <input
                  type="number"
                  step="0.5"
                  value={botSl}
                  onChange={e => setBotSl(parseFloat(e.target.value) || 1)}
                  className="w-full bg-[#07090e] border border-[#1a2336] p-2 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#718096] block mb-1">Re-Enter Dip %</label>
                <input
                  type="number"
                  step="0.5"
                  value={botDip}
                  onChange={e => setBotDip(parseFloat(e.target.value) || 1)}
                  className="w-full bg-[#07090e] border border-[#1a2336] p-2 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="bg-[#07090e] p-3 rounded-xl border border-[#161f30] text-xs text-[#8896ab] leading-relaxed">
              Bot enters position at or below current price, automatically sells when price gains <b>+{botTp}%</b>, then re-enters on a <b>{botDip}% dip</b>. Exits on a <b>-{botSl}%</b> stop-loss.
            </div>

            <button
              onClick={() => {
                setStatusMessage({
                  text: `Auto Bot launched for ${pool.name} with TP: +${botTp}%, SL: -${botSl}%!`,
                  type: 'success'
                });
              }}
              className="w-full bg-[#2EE6A6] hover:bg-[#25ca91] text-[#07090e] font-extrabold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow"
            >
              <Bot className="w-4 h-4" />
              <span>Launch Automated Bot</span>
            </button>
          </div>
        )}

        {/* Tab 3: Live Real Swap */}
        {tab === 'live' && (
          <div className="space-y-3">
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <b>REAL ON-CHAIN SWAP:</b> Executes directly on {pool.chain} through your connected Web3 wallet. Funds move on-chain.
              </div>
            </div>

            {!wallet.isConnected ? (
              <button
                onClick={onConnectWallet}
                className="w-full bg-gradient-to-r from-[#F5B31B] to-[#d49607] hover:from-[#f6bb33] hover:to-[#e5a40b] text-[#07090e] font-extrabold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <Zap className="w-4 h-4" />
                <span>Connect Real Web3 Wallet to Swap</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-[#07090e] p-3 rounded-xl border border-[#161f30] text-xs space-y-1 text-[#cbd5e1]">
                  <div className="flex justify-between">
                    <span>Connected Wallet:</span>
                    <span className="font-bold text-white">{wallet.address?.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Balance:</span>
                    <span className="font-bold text-[#2EE6A6]">{wallet.nativeBalance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DEX Router:</span>
                    <span className="text-[#8896ab] truncate max-w-[200px]">{chainConfig?.routerAddress}</span>
                  </div>
                </div>

                <button
                  onClick={handleExecuteTrade}
                  disabled={isExecuting}
                  className="w-full bg-[#2EE6A6] hover:bg-[#25ca91] text-[#07090e] font-extrabold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg"
                >
                  {isExecuting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>Sign & Execute Live Swap on {pool.chain}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Status Alert Banner */}
        {statusMessage && (
          <div className={`mt-4 p-3 rounded-xl text-xs flex items-start gap-2 font-mono ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/50 border border-red-500/40 text-red-300'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div>{statusMessage.text}</div>
              {statusMessage.txHash && chainConfig && (
                <a
                  href={`${chainConfig.blockExplorerUrls[0]}/tx/${statusMessage.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-[#F5B31B] text-[11px] inline-flex items-center gap-1 mt-1"
                >
                  View on {chainConfig.shortName} Explorer <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
