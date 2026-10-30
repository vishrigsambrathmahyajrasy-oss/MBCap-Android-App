import React, { useState } from 'react';
import { TokenPool } from '../types/trading';
import { Bot, Play, Square, RefreshCw, Zap, ShieldAlert } from 'lucide-react';

interface AutoBotModalProps {
  currentPool: TokenPool;
  practiceCash: number;
  onBotAction: (message: string) => void;
}

interface ActiveBot {
  id: string;
  pool: TokenPool;
  buyAtOrBelow: number;
  maxTradeSize: number;
  takeProfitPct: number;
  stopLossPct: number;
  reEnterDipPct: number;
  maxCycles: number;
  currentCycle: number;
  status: 'running' | 'holding' | 'waiting' | 'stopped';
  entryPrice?: number;
}

export const AutoBotModal: React.FC<AutoBotModalProps> = ({ currentPool, practiceCash, onBotAction }) => {
  const [activeBots, setActiveBots] = useState<ActiveBot[]>([]);
  const [maxTradeSize, setMaxTradeSize] = useState<number>(200);
  const [takeProfitPct, setTakeProfitPct] = useState<number>(3.0);
  const [stopLossPct, setStopLossPct] = useState<number>(2.0);
  const [reEnterDipPct, setReEnterDipPct] = useState<number>(2.5);
  const [maxCycles, setMaxCycles] = useState<number>(5);

  const startBot = () => {
    if (activeBots.some(b => b.pool.id === currentPool.id && b.status !== 'stopped')) {
      alert(`A bot is already active on ${currentPool.name}`);
      return;
    }

    const newBot: ActiveBot = {
      id: `bot_${Date.now()}`,
      pool: currentPool,
      buyAtOrBelow: currentPool.price * 0.99,
      maxTradeSize,
      takeProfitPct,
      stopLossPct,
      reEnterDipPct,
      maxCycles,
      currentCycle: 1,
      status: 'running',
      entryPrice: currentPool.price
    };

    setActiveBots([...activeBots, newBot]);
    onBotAction(`Started auto bot on ${currentPool.name} (TP: +${takeProfitPct}%, SL: -${stopLossPct}%)`);
  };

  const stopBot = (botId: string) => {
    setActiveBots(prev => prev.filter(b => b.id !== botId));
    onBotAction(`Stopped auto bot #${botId.slice(-4)}`);
  };

  return (
    <div className="bg-[#0b0f19] border border-[#182236] rounded-2xl p-4 sm:p-6 shadow-xl font-mono">
      <div className="flex items-center justify-between border-b border-[#182236] pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#F5B31B]/10 rounded-xl text-[#F5B31B] border border-[#F5B31B]/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              Automated Trading Bot <span className="text-xs bg-[#172033] text-[#2EE6A6] px-2 py-0.5 rounded ml-2">SIMULATED</span>
            </h3>
            <p className="text-xs text-[#8896ab] mt-0.5">
              Target Pair: <b className="text-white">{currentPool.name}</b> ({currentPool.chain})
            </p>
          </div>
        </div>

        <div className="text-right text-xs">
          <span className="text-[#718096]">Active: </span>
          <span className="font-bold text-[#F5B31B]">{activeBots.length} / 5</span>
        </div>
      </div>

      {/* Bot Parameters Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-[11px] text-[#718096] mb-1">Max Trade Size (USD)</label>
          <input
            type="number"
            min="10"
            value={maxTradeSize}
            onChange={(e) => setMaxTradeSize(parseFloat(e.target.value) || 10)}
            className="w-full bg-[#07090e] border border-[#1a2336] focus:border-[#F5B31B] text-white p-2 rounded-xl text-xs outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] text-[#718096] mb-1">Take Profit (%)</label>
          <input
            type="number"
            step="0.5"
            min="0.5"
            value={takeProfitPct}
            onChange={(e) => setTakeProfitPct(parseFloat(e.target.value) || 1)}
            className="w-full bg-[#07090e] border border-[#1a2336] focus:border-[#F5B31B] text-white p-2 rounded-xl text-xs outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] text-[#718096] mb-1">Stop Loss (%)</label>
          <input
            type="number"
            step="0.5"
            min="0.5"
            value={stopLossPct}
            onChange={(e) => setStopLossPct(parseFloat(e.target.value) || 1)}
            className="w-full bg-[#07090e] border border-[#1a2336] focus:border-[#F5B31B] text-white p-2 rounded-xl text-xs outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] text-[#718096] mb-1">Re-Enter Dip (%)</label>
          <input
            type="number"
            step="0.5"
            min="0.5"
            value={reEnterDipPct}
            onChange={(e) => setReEnterDipPct(parseFloat(e.target.value) || 1)}
            className="w-full bg-[#07090e] border border-[#1a2336] focus:border-[#F5B31B] text-white p-2 rounded-xl text-xs outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] text-[#718096] mb-1">Max Cycles (0 = Infinite)</label>
          <input
            type="number"
            min="0"
            value={maxCycles}
            onChange={(e) => setMaxCycles(parseInt(e.target.value) || 0)}
            className="w-full bg-[#07090e] border border-[#1a2336] focus:border-[#F5B31B] text-white p-2 rounded-xl text-xs outline-none"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={startBot}
            className="w-full bg-[#2EE6A6] hover:bg-[#25ca91] text-[#07090e] font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Bot for {currentPool.symbol}</span>
          </button>
        </div>
      </div>

      {/* Active Bots List */}
      <div className="mt-4 pt-4 border-t border-[#182236]">
        <h4 className="text-xs text-[#8896ab] mb-2 font-bold">Active Bot Processes</h4>
        {activeBots.length > 0 ? (
          <div className="space-y-2">
            {activeBots.map(bot => (
              <div
                key={bot.id}
                className="bg-[#07090e] border border-[#1a2336] p-3 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white">{bot.pool.name}</span>
                    <span className="text-[10px] text-[#2EE6A6] bg-[#2EE6A6]/10 px-1.5 py-0.5 rounded border border-[#2EE6A6]/30">
                      Running (Cycle {bot.currentCycle})
                    </span>
                  </div>
                  <div className="text-[11px] text-[#718096] mt-0.5">
                    TP: +{bot.takeProfitPct}% | SL: -{bot.stopLossPct}% | Size: ${bot.maxTradeSize} | 0.06% fee
                  </div>
                </div>

                <button
                  onClick={() => stopBot(bot.id)}
                  className="bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-[#718096] text-xs">
            No active bots running. Configure the parameters above and click Launch.
          </div>
        )}
      </div>
    </div>
  );
};
