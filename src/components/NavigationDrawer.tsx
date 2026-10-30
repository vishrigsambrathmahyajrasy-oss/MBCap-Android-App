import React from 'react';
import { 
  X, Terminal, LayoutDashboard, TrendingUp, ArrowDownUp, CircleDot, Star, 
  Sparkles, Bot, Repeat, History, Image, DollarSign, Wallet, QrCode, 
  User, Settings, RefreshCw, Mail, Search, Compass, ShieldAlert, LogOut 
} from 'lucide-react';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  onSelectView: (view: string) => void;
  onConnectWallet: () => void;
  onOpenInstall: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeView,
  onSelectView,
  onConnectWallet,
  onOpenInstall
}) => {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'terminal', label: 'Terminal', icon: Terminal, color: '#F5B31B' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'topmarket', label: 'Market (Top 50)', icon: TrendingUp },
    { id: 'trade', label: 'DEX Pairs & Live Trade', icon: ArrowDownUp },
    { id: 'bubbles', label: 'Bubbles (Top 10)', icon: CircleDot },
    { id: 'watchlist', label: 'Watchlist', icon: Star },
    { id: 'mbrex', label: 'New Launches & MB-Rex', icon: Sparkles },
    { id: 'autopilot', label: 'Autopilot', icon: Bot },
    { id: 'autobot', label: 'Auto Buy / Auto Sell', icon: Repeat },
    { id: 'portfolio', label: 'Trade History & Portfolio', icon: History },
    { id: 'nfts', label: 'NFTs', icon: Image },
    { id: 'fees', label: 'Chain-wise Fees', icon: DollarSign },
    { id: 'mywallet', label: 'My Wallet Address', icon: Wallet },
    { id: 'qrscan', label: 'QR Scan Wallet', icon: QrCode },
    { id: 'profile', label: 'Customer Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'explorer', label: 'Chain Explorer', icon: Compass },
    { id: 'disclaimer', label: 'Disclaimer & Safety', icon: ShieldAlert }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-mono text-[#e2e8f0]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside className="absolute inset-y-0 left-0 max-w-xs w-full bg-[#0a0d16] border-r border-[#1a2336] p-4 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#182030] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F5B31B] to-[#2EE6A6] p-[2px]">
                <div className="w-full h-full bg-[#07090e] rounded-[6px] flex items-center justify-center font-extrabold text-xs text-[#F5B31B]">
                  MB
                </div>
              </div>
              <span className="font-extrabold text-white text-base">MBCap Pro</span>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#718096] hover:text-white hover:bg-[#151c2d]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="space-y-0.5 text-xs">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors font-medium ${
                    isActive
                      ? 'bg-[#1b253b] text-[#F5B31B] font-bold border border-[#2d3a54]'
                      : 'text-[#8896ab] hover:text-white hover:bg-[#121927]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" style={{ color: item.color }} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Install APK CTA */}
          <div className="pt-3">
            <button
              onClick={() => {
                onOpenInstall();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-[#2EE6A6]/20 to-[#1cb883]/20 hover:from-[#2EE6A6]/30 hover:to-[#1cb883]/30 border border-[#2EE6A6]/40 text-[#2EE6A6] font-bold p-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <span>📱 Install Android App / APK</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-[#182030] text-[11px] text-[#718096]">
          <div className="flex justify-between items-center mb-1">
            <span>MBCap Terminal</span>
            <span className="text-[#2EE6A6] font-bold">v1.2 Live</span>
          </div>
          <div>0.06% lowest standard fee</div>
        </div>
      </aside>
    </div>
  );
};
