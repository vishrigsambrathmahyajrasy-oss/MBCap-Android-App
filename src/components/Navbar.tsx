import React, { useState } from 'react';
import { CustomerWallet, SUPPORTED_CHAINS } from '../types/trading';
import { Wallet, Globe, Shield, Sparkles, ChevronDown, CheckCircle2, AlertTriangle, ExternalLink, Power, HelpCircle, Smartphone } from 'lucide-react';

interface NavbarProps {
  wallet: CustomerWallet;
  isRealMode: boolean;
  onToggleMode: () => void;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onSwitchChain: (chainId: number) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenDrawer: () => void;
  onOpenLogin: () => void;
  onOpenGuide: () => void;
  onOpenInstall: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  wallet,
  isRealMode,
  onToggleMode,
  onConnectWallet,
  onDisconnectWallet,
  onSwitchChain,
  activeTab,
  onSelectTab,
  onOpenDrawer,
  onOpenLogin,
  onOpenGuide,
  onOpenInstall
}) => {
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);

  const shortenAddress = (addr: string) => {
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  };

  const currentChain = wallet.chainId ? SUPPORTED_CHAINS[wallet.chainId] : null;

  return (
    <header className="sticky top-0 z-40 bg-[#07090e]/90 backdrop-blur-md border-b border-[#182030] px-3 sm:px-6 py-2.5">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3 flex-wrap">
        {/* Brand / Logo + Hamburger Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenDrawer}
            className="p-2 bg-[#0d121c] hover:bg-[#162033] border border-[#1b2436] rounded-xl text-white transition-colors"
            aria-label="Open Navigation Menu"
            title="Open Menu"
          >
            <span className="text-base font-bold">☰</span>
          </button>

          <div 
            onClick={() => onSelectTab('trade')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F5B31B] to-[#2EE6A6] p-[2px] shadow-lg shadow-[#F5B31B]/10">
              <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center font-extrabold text-sm tracking-tighter text-[#F5B31B]">
                MB
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 font-extrabold text-lg sm:text-xl tracking-tight leading-none text-white">
                <span className="text-[#F5B31B]">M</span>
                <span className="text-[#A0AEC0]">B</span>
                <span className="bg-[#1f293d] text-[#e2e8f0] text-xs px-1.5 py-0.5 rounded font-mono ml-0.5">Cap</span>
              </div>
              <div className="text-[10px] text-[#718096] font-mono tracking-wider">LIVE DEX TERMINAL</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 ml-4 bg-[#0d121c] p-1 rounded-lg border border-[#1b2436]">
            {[
              { id: 'trade', label: 'Live Trade' },
              { id: 'markets', label: 'Markets' },
              { id: 'mbrex', label: 'MB-Rex Radar' },
              { id: 'autobot', label: 'Auto Bots' },
              { id: 'portfolio', label: 'Customer Portfolio' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#1b253b] text-white shadow-sm border border-[#2d3a54]'
                    : 'text-[#8795ad] hover:text-white hover:bg-[#121927]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right side controls: Mode, Fee, Network, Wallet */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Trading Mode Switcher */}
          <button
            onClick={onToggleMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
              isRealMode
                ? 'bg-red-950/40 border-red-500/50 text-red-300 hover:bg-red-950/60 shadow-lg shadow-red-500/10'
                : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-950/60 shadow-lg shadow-emerald-500/10'
            }`}
            title="Click to switch between Live Real Swaps and Practice Simulation"
          >
            <span className={`w-2 h-2 rounded-full animate-pulse ${isRealMode ? 'bg-red-500' : 'bg-emerald-400'}`} />
            <span>{isRealMode ? 'LIVE REAL TRADING' : 'PRACTICE MODE ($1K)'}</span>
          </button>

          {/* Quick Guide Button */}
          <button
            onClick={onOpenGuide}
            className="hidden sm:flex items-center gap-1 bg-[#151c2d] hover:bg-[#1e2a44] border border-[#23314d] text-[#F5B31B] text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors"
            title="Step-by-step instructions to start real live trading"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How to Start</span>
          </button>

          {/* Install APK / App Button */}
          <button
            onClick={onOpenInstall}
            className="flex items-center gap-1.5 bg-[#0e1626] hover:bg-[#18233a] border border-[#2EE6A6]/40 text-[#2EE6A6] text-xs font-extrabold px-2.5 py-1.5 rounded-lg transition-all shadow-sm hover:shadow-[#2EE6A6]/10"
            title="Install MBCap APK / Android App"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Install APK</span>
          </button>

          {/* Platform fee badge */}
          <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-[#F5B31B] bg-[#2a2208] border border-[#F5B31B]/30 px-2.5 py-1 rounded-full font-bold">
            <Sparkles className="w-3 h-3" />
            <span>Fee: 0.06% buy + 0.06% sell</span>
          </div>

          {/* Network Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNetworkMenu(!showNetworkMenu)}
              className="flex items-center gap-1.5 bg-[#0f1420] border border-[#1e273a] hover:border-[#2d3a54] text-xs font-medium px-2.5 py-1.5 rounded-lg text-white transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#F5B31B]" />
              <span className="hidden sm:inline font-mono">
                {currentChain ? currentChain.shortName : 'Select Chain'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#718096]" />
            </button>

            {showNetworkMenu && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-[#0c101a] border border-[#1f283d] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowNetworkMenu(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-mono text-[#718096] uppercase tracking-wider border-b border-[#182030] mb-1">
                  Supported DEX Networks
                </div>
                {Object.values(SUPPORTED_CHAINS).map(chain => (
                  <button
                    key={chain.id}
                    onClick={() => onSwitchChain(chain.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-[#161e30] transition-colors ${
                      wallet.chainId === chain.id ? 'bg-[#161e30] text-[#F5B31B] font-bold' : 'text-[#cbd5e1]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: chain.color }} 
                      />
                      <span>{chain.name}</span>
                    </div>
                    {wallet.chainId === chain.id && <CheckCircle2 className="w-3.5 h-3.5 text-[#2EE6A6]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wallet Connect / Account Overview */}
          {wallet.isConnected && wallet.address ? (
            <div className="relative">
              <button
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                className="flex items-center gap-2 bg-[#121929] hover:bg-[#182238] border border-[#23314d] px-3 py-1.5 rounded-xl text-xs font-mono text-white transition-all shadow-md"
              >
                <span className="w-2 h-2 rounded-full bg-[#2EE6A6]" />
                <span className="font-bold">{shortenAddress(wallet.address)}</span>
                <span className="hidden md:inline text-[#2EE6A6] font-semibold border-l border-[#222e44] pl-2">
                  {wallet.nativeBalance}
                </span>
                <ChevronDown className="w-3 h-3 text-[#718096]" />
              </button>

              {showWalletMenu && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-[#0c101a] border border-[#1f283d] rounded-xl shadow-2xl p-3 z-50 text-xs"
                  onClick={() => setShowWalletMenu(false)}
                >
                  <div className="flex items-center justify-between border-b border-[#182030] pb-2 mb-2">
                    <span className="text-[#8896ab] font-mono">Connected Customer</span>
                    <span className="text-[10px] bg-[#162136] text-[#2EE6A6] px-1.5 py-0.5 rounded font-mono">
                      {wallet.chainName}
                    </span>
                  </div>
                  <div className="font-mono text-white break-all bg-[#07090e] p-2 rounded border border-[#182030] mb-2 text-[11px]">
                    {wallet.address}
                  </div>
                  <div className="flex justify-between items-center py-1 font-mono text-[#cbd5e1]">
                    <span className="text-[#718096]">Balance:</span>
                    <span className="font-bold text-[#2EE6A6]">{wallet.nativeBalance}</span>
                  </div>
                  <div className="flex gap-2 mt-3 pt-2 border-t border-[#182030]">
                    <button
                      onClick={onDisconnectWallet}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/40 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      <Power className="w-3 h-3" />
                      Disconnect
                    </button>
                    <a
                      href={currentChain ? `${currentChain.blockExplorerUrls[0]}/address/${wallet.address}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-1.5 rounded-lg bg-[#162136] hover:bg-[#1d2b47] text-white border border-[#253658]"
                      title="View on Explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              className="flex items-center gap-2 bg-gradient-to-r from-[#F5B31B] to-[#d49607] hover:from-[#f6bb33] hover:to-[#e5a40b] text-[#07090e] font-extrabold text-xs sm:text-sm px-3.5 py-1.5 rounded-xl shadow-lg shadow-[#F5B31B]/15 transition-all transform active:scale-95"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden items-center justify-around gap-1 pt-2 mt-2 border-t border-[#141b29] text-[11px]">
        {[
          { id: 'trade', label: 'Trade' },
          { id: 'markets', label: 'Markets' },
          { id: 'mbrex', label: 'MB-Rex' },
          { id: 'autobot', label: 'Auto' },
          { id: 'portfolio', label: 'Portfolio' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`px-2 py-1 rounded font-medium ${
              activeTab === tab.id ? 'bg-[#1b253b] text-[#F5B31B]' : 'text-[#718096]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
