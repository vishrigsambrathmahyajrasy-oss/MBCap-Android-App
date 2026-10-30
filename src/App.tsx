import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { NavigationDrawer } from './components/NavigationDrawer';
import { CandleChart } from './components/CandleChart';
import { TradePanel } from './components/TradePanel';
import { MarketTable } from './components/MarketTable';
import { MBRexScanner } from './components/MBRexScanner';
import { CustomerPortfolio } from './components/CustomerPortfolio';
import { AutoBotModal } from './components/AutoBotModal';
import { CoinDetailModal } from './components/CoinDetailModal';
import { BubblesView } from './components/BubblesView';
import { TopMarketView } from './components/TopMarketView';
import { TerminalView } from './components/TerminalView';
import { DashboardView } from './components/DashboardView';
import { LoginModal } from './components/LoginModal';
import { RealTradingGuideModal } from './components/RealTradingGuideModal';
import { InstallAppModal } from './components/InstallAppModal';
import { NFTsView, ChainFeesView, WalletAddressView, DisclaimerView } from './components/StaticViews';
import { TokenPool, CustomerWallet, CustomerTradeReceipt, SUPPORTED_CHAINS } from './types/trading';
import { MarketDataService, INITIAL_POOLS } from './services/marketData';
import { WalletService } from './services/wallet';
import { BarChart3, Zap, ShieldCheck } from 'lucide-react';

export default function App() {
  // Navigation / View State
  const [activeView, setActiveView] = useState<string>('trade');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isInstallOpen, setIsInstallOpen] = useState<boolean>(false);

  // Customer Trading Mode: Live Real Swaps vs Practice Simulation
  const [isRealMode, setIsRealMode] = useState<boolean>(() => {
    return localStorage.getItem('mbcap_real_mode') === 'true';
  });

  // Pools and Selected Asset
  const [pools, setPools] = useState<TokenPool[]>(INITIAL_POOLS);
  const [selectedPool, setSelectedPool] = useState<TokenPool>(INITIAL_POOLS[0]);
  const [inspectPool, setInspectPool] = useState<TokenPool | null>(null);
  const [isLoadingPools, setIsLoadingPools] = useState<boolean>(false);

  // Watchlist & Starred
  const [watchlist, setWatchlist] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('mbcap_watchlist') || '{}');
    } catch {
      return {};
    }
  });

  // Customer Wallet State
  const [wallet, setWallet] = useState<CustomerWallet>({
    address: null,
    chainId: null,
    chainName: 'Unknown',
    nativeBalance: '0.00',
    tokenBalance: '0.00',
    isConnected: false,
    isReal: false
  });

  // Customer Practice Account Cash & History
  const [practiceCash, setPracticeCash] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('mbcap_practice_cash');
      return saved ? parseFloat(saved) : 1000.00;
    } catch {
      return 1000.00;
    }
  });

  const [trades, setTrades] = useState<CustomerTradeReceipt[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('mbcap_trades') || '[]');
    } catch {
      return [];
    }
  });

  // Toast Notification Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Persist settings
  useEffect(() => {
    localStorage.setItem('mbcap_real_mode', String(isRealMode));
  }, [isRealMode]);

  useEffect(() => {
    localStorage.setItem('mbcap_practice_cash', practiceCash.toString());
  }, [practiceCash]);

  useEffect(() => {
    localStorage.setItem('mbcap_trades', JSON.stringify(trades));
  }, [trades]);

  useEffect(() => {
    localStorage.setItem('mbcap_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Load trending pools from DEX Screener / GeckoTerminal
  const loadPools = async () => {
    setIsLoadingPools(true);
    try {
      const live = await MarketDataService.fetchTrendingPools();
      if (live && live.length > 0) {
        setPools(live);
        const match = live.find(p => p.id === selectedPool.id || p.name === selectedPool.name);
        if (match) setSelectedPool(match);
      }
    } catch (err) {
      console.warn('Using baseline pools', err);
    } finally {
      setIsLoadingPools(false);
    }
  };

  useEffect(() => {
    loadPools();
  }, []);

  // Web3 Wallet event listeners (MetaMask, Rabby, Coinbase)
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          WalletService.connectWallet()
            .then(w => {
              setWallet(w);
              showToast(`Wallet connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
            })
            .catch(() => {});
        } else {
          setWallet({
            address: null,
            chainId: null,
            chainName: 'Unknown',
            nativeBalance: '0.00',
            tokenBalance: '0.00',
            isConnected: false,
            isReal: false
          });
          showToast('Wallet disconnected');
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        const id = parseInt(chainIdHex, 16);
        const chainConfig = SUPPORTED_CHAINS[id];
        setWallet(prev => ({
          ...prev,
          chainId: id,
          chainName: chainConfig ? chainConfig.shortName : `Chain #${id}`
        }));
        showToast(`Switched network to ${chainConfig ? chainConfig.name : `Chain #${id}`}`);
      };

      ethereum.on?.('accountsChanged', handleAccountsChanged);
      ethereum.on?.('chainChanged', handleChainChanged);

      return () => {
        ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
        ethereum.removeListener?.('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Connect Wallet
  const handleConnectWallet = async () => {
    try {
      const w = await WalletService.connectWallet();
      setWallet(w);
      showToast(`Connected ${w.address?.slice(0, 6)}... on ${w.chainName}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to connect wallet');
    }
  };

  const handleDisconnectWallet = () => {
    setWallet({
      address: null,
      chainId: null,
      chainName: 'Unknown',
      nativeBalance: '0.00',
      tokenBalance: '0.00',
      isConnected: false,
      isReal: false
    });
    showToast('Wallet disconnected');
  };

  // Switch Chain
  const handleSwitchChain = async (chainId: number) => {
    if (wallet.isConnected) {
      const ok = await WalletService.switchNetwork(chainId);
      if (ok) {
        const chainConfig = SUPPORTED_CHAINS[chainId];
        setWallet(prev => ({
          ...prev,
          chainId,
          chainName: chainConfig?.shortName || `Chain ${chainId}`
        }));
      }
    } else {
      const chainConfig = SUPPORTED_CHAINS[chainId];
      setWallet(prev => ({
        ...prev,
        chainId,
        chainName: chainConfig?.shortName || `Chain ${chainId}`
      }));
    }
  };

  // Toggle Mode
  const handleToggleMode = () => {
    const nextMode = !isRealMode;
    setIsRealMode(nextMode);
    if (nextMode) {
      showToast('⚠️ Switched to LIVE REAL TRADING (Orders execute on-chain via Web3 wallet)');
    } else {
      showToast('Switched to PRACTICE MODE (Simulated funds, no real money moves)');
    }
  };

  // Trade Success Action
  const handleTradeSuccess = (receipt: CustomerTradeReceipt) => {
    setTrades(prev => [receipt, ...prev]);
    showToast(`${receipt.side.toUpperCase()} order filled: $${receipt.amountUsd.toFixed(2)} of ${receipt.pair}`);
  };

  // Watchlist Toggle
  const handleToggleWatchlist = (poolId: string) => {
    setWatchlist(prev => {
      const updated = { ...prev };
      if (updated[poolId]) delete updated[poolId];
      else updated[poolId] = true;
      return updated;
    });
  };

  // Search Action
  const handleSearch = async (query: string) => {
    const results = await MarketDataService.searchPools(query);
    setPools(results);
  };

  // When a coin is clicked, select it for chart/panel and open detail modal
  const handleSelectAndInspect = (pool: TokenPool) => {
    setSelectedPool(pool);
    setInspectPool(pool);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-[#e2e8f0] flex flex-col font-mono selection:bg-[#F5B31B] selection:text-[#07090e]">
      {/* Top Navigation Bar */}
      <Navbar
        wallet={wallet}
        isRealMode={isRealMode}
        onToggleMode={handleToggleMode}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        onSwitchChain={handleSwitchChain}
        activeTab={activeView}
        onSelectTab={setActiveView}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenInstall={() => setIsInstallOpen(true)}
      />

      {/* Slide-out Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeView={activeView}
        onSelectView={setActiveView}
        onConnectWallet={handleConnectWallet}
        onOpenInstall={() => setIsInstallOpen(true)}
      />

      {/* Real Customer Trading Guide Modal */}
      <RealTradingGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onConnectWallet={handleConnectWallet}
        isConnected={wallet.isConnected}
      />

      {/* Android APK / App Install Modal */}
      <InstallAppModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />

      {/* Coin Detail & Swapper Modal */}
      <CoinDetailModal
        pool={inspectPool}
        isOpen={!!inspectPool}
        onClose={() => setInspectPool(null)}
        wallet={wallet}
        isRealMode={isRealMode}
        onTradeSuccess={handleTradeSuccess}
        onConnectWallet={handleConnectWallet}
        practiceCash={practiceCash}
        onUpdatePracticeCash={setPracticeCash}
        isStarred={inspectPool ? !!watchlist[inspectPool.id] : false}
        onToggleStar={() => {
          if (inspectPool) handleToggleWatchlist(inspectPool.id);
        }}
      />

      {/* Sign In / Welcome Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSignInWallet={handleConnectWallet}
        onContinueGuest={() => {
          setIsRealMode(false);
          showToast('Trading terminal ready in Practice Mode');
        }}
      />

      {/* Mode Alert Banner if in Real Mode */}
      {isRealMode && (
        <div className="bg-red-950/70 border-b border-red-600/40 text-red-200 px-4 py-2 text-xs font-mono flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
            <span>
              <b>LIVE REAL TRADING ACTIVATED:</b> All orders will prompt your connected Web3 wallet (MetaMask/Rabby) and execute on-chain using real crypto funds. Verify token address & slippage before signing.
            </span>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-[#F5B31B] underline hover:text-white shrink-0 ml-2"
            >
              How it works?
            </button>
          </div>
          <button
            onClick={() => setIsRealMode(false)}
            className="text-[11px] underline hover:text-white shrink-0 ml-2"
          >
            Switch to Practice
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-3 sm:p-5 space-y-4">
        {/* VIEW 1: Live Trade & DEX Pairs (Primary Terminal) */}
        {activeView === 'trade' && (
          <div className="space-y-4">
            {/* Top row: Candlestick Chart (2/3) + Trade Panel (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              <div className="lg:col-span-8">
                <CandleChart
                  currentPool={selectedPool}
                  onPriceUpdate={(price) => {
                    setSelectedPool(prev => ({ ...prev, price }));
                  }}
                />
              </div>

              <div className="lg:col-span-4">
                <TradePanel
                  currentPool={selectedPool}
                  wallet={wallet}
                  isRealMode={isRealMode}
                  onTradeSuccess={handleTradeSuccess}
                  onConnectWallet={handleConnectWallet}
                  practiceCash={practiceCash}
                  onUpdatePracticeCash={setPracticeCash}
                />
              </div>
            </div>

            {/* Bottom row: Live Market DEX Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#F5B31B]" />
                  <span>Trending DEX Pairs & Universal Market Search</span>
                </h3>
                <span className="text-xs text-[#718096]">
                  Click any pair to trade live
                </span>
              </div>
              <MarketTable
                pools={pools}
                selectedPoolId={selectedPool.id}
                onSelectPool={handleSelectAndInspect}
                onSearch={handleSearch}
                isLoading={isLoadingPools}
                onRefresh={loadPools}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: Terminal (7 Agents & Live Flow) */}
        {activeView === 'terminal' && (
          <TerminalView
            wallet={wallet}
            practiceCash={practiceCash}
            isRealMode={isRealMode}
            pools={pools}
            onSelectPool={handleSelectAndInspect}
          />
        )}

        {/* VIEW 3: Dashboard */}
        {activeView === 'dashboard' && (
          <DashboardView
            wallet={wallet}
            practiceCash={practiceCash}
            isRealMode={isRealMode}
            pools={pools}
            trades={trades}
            onSelectPool={handleSelectAndInspect}
            onNavigate={setActiveView}
            onConnectWallet={handleConnectWallet}
          />
        )}

        {/* VIEW 4: Market (Top 50 Crypto Market Cap) */}
        {activeView === 'topmarket' && (
          <TopMarketView
            onFindDEXPair={(symbol) => {
              handleSearch(symbol);
              setActiveView('trade');
              showToast(`Filtered DEX pools for ${symbol}`);
            }}
          />
        )}

        {/* VIEW 5: Bubbles (Top 10 Volume) */}
        {activeView === 'bubbles' && (
          <BubblesView
            pools={pools}
            onSelectPool={handleSelectAndInspect}
          />
        )}

        {/* VIEW 6: Watchlist */}
        {activeView === 'watchlist' && (
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-white">Your Starred Watchlist</h3>
            <MarketTable
              pools={pools.filter(p => !!watchlist[p.id])}
              selectedPoolId={selectedPool.id}
              onSelectPool={handleSelectAndInspect}
              onSearch={handleSearch}
              isLoading={isLoadingPools}
              onRefresh={loadPools}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          </div>
        )}

        {/* VIEW 7: MB-Rex Radar & New Launches */}
        {activeView === 'mbrex' && (
          <MBRexScanner
            pools={pools}
            onSelectPool={(p) => {
              handleSelectAndInspect(p);
              showToast(`Loaded ${p.name} from MB-Rex Radar into Trade Panel`);
            }}
          />
        )}

        {/* VIEW 8: Auto Bots / Autopilot */}
        {(activeView === 'autobot' || activeView === 'autopilot') && (
          <AutoBotModal
            currentPool={selectedPool}
            practiceCash={practiceCash}
            onBotAction={showToast}
          />
        )}

        {/* VIEW 9: Portfolio & Receipts History */}
        {activeView === 'portfolio' && (
          <CustomerPortfolio
            wallet={wallet}
            isRealMode={isRealMode}
            practiceCash={practiceCash}
            trades={trades}
            onClearHistory={() => {
              setTrades([]);
              showToast('Trade history cleared');
            }}
            onResetPractice={() => {
              setPracticeCash(1000.00);
              showToast('Practice cash reset to $1,000.00');
            }}
            onConnectWallet={handleConnectWallet}
          />
        )}

        {/* VIEW 10: NFTs */}
        {activeView === 'nfts' && <NFTsView />}

        {/* VIEW 11: Chain-Wise Fees */}
        {activeView === 'fees' && <ChainFeesView />}

        {/* VIEW 12: My Wallet Address */}
        {activeView === 'mywallet' && (
          <WalletAddressView wallet={wallet} onConnectWallet={handleConnectWallet} />
        )}

        {/* VIEW 13: Disclaimer & Safety */}
        {activeView === 'disclaimer' && <DisclaimerView />}
      </main>

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-[#162136] text-white border border-[#2EE6A6]/40 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-mono flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Zap className="w-3.5 h-3.5 text-[#F5B31B] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#141b29] py-4 px-6 text-center text-xs font-mono text-[#718096]">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#F5B31B]">MBCap Live Terminal</span>
            <span>·</span>
            <span>0.06% transparent fee</span>
            <span>·</span>
            <span className="text-[#2EE6A6]">Non-Custodial Web3 Trading</span>
          </div>
          <div className="text-[11px] text-[#4a5568]">
            Ethereum · Base · Solana · BNB Chain · Arbitrum · Polygon · Avalanche · Optimism
          </div>
        </div>
      </footer>
    </div>
  );
}
