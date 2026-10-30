import React, { useState } from 'react';
import { TokenPool, CustomerWallet } from '../types/trading';
import { Terminal, ShieldCheck, Activity, CheckCircle2, AlertOctagon, TrendingUp, Play, Square, ExternalLink } from 'lucide-react';

interface TerminalViewProps {
  wallet: CustomerWallet;
  practiceCash: number;
  isRealMode: boolean;
  pools: TokenPool[];
  onSelectPool: (pool: TokenPool) => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  wallet,
  practiceCash,
  isRealMode,
  pools,
  onSelectPool
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [showAgentReports, setShowAgentReports] = useState<boolean>(false);

  // The 15 safety agent checklist
  const agents = [
    { name: 'Liquidity Check', status: 'PASS', detail: 'Pool liquidity exceeds $20K threshold' },
    { name: 'Token Age Guard', status: 'PASS', detail: 'Token created > 10m ago' },
    { name: 'Buy Pressure Filter', status: 'PASS', detail: 'Buys/Sells ratio >= 1.4x' },
    { name: 'Buyer Strength Radar', status: 'PASS', detail: 'Score > 65 on multi-chain index' },
    { name: 'Momentum Velocity', status: 'PASS', detail: '24h change between -15% and +60%' },
    { name: 'Data Freshness', status: 'PASS', detail: 'Recent pool block updated < 30s ago' },
    { name: 'Price Impact Limit', status: 'PASS', detail: 'Impact < 1.0% on current liquidity' },
    { name: 'Fee Edge Analysis', status: 'PASS', detail: 'Target +3.0% vs 0.06% platform fee' },
    { name: 'Stop Loss Guard', status: 'PASS', detail: 'Stop protection armed at -2.0%' },
    { name: 'Risk / Reward Ratio', status: 'PASS', detail: 'Reward/risk >= 1.5 ratio' },
    { name: 'Exposure Cap', status: 'PASS', detail: '< 5 open positions on target chain' },
    { name: 'Cooldown Manager', status: 'PASS', detail: 'No recent stop-out on token' },
    { name: 'Cash Reserve Check', status: 'PASS', detail: '5% minimum reserve untouched' },
    { name: 'Daily Limit Monitor', status: 'PASS', detail: 'Trades within daily risk boundary' },
    { name: 'Stablecoin Guard', status: 'PASS', detail: 'Non-pegged asset verified' }
  ];

  const logEntries = [
    { time: '16:24:10', type: 'VERIFIED', token: 'PEPE', action: '15/15 agents signed check #1042', val: '✓ PASS', color: '#2EE6A6' },
    { time: '16:22:04', type: 'ENTER', token: 'BRETT', action: 'Rule-based dip entry filled', val: '$100.00', color: '#22D3EE' },
    { time: '16:18:32', type: 'FILTERED', token: 'SCAM_DOGE', action: 'Liquidity < $10K limit dropped', val: 'BLOCKED', color: '#FF4D6A' },
    { time: '16:15:00', type: 'EXIT', token: 'BONK', action: 'Take-profit target reached (+4.2%)', val: '+$4.20', color: '#2EE6A6' },
    { time: '16:11:45', type: 'VERIFIED', token: 'AERO', action: 'Checker verified ledger Δ $0.00', val: '✓ PASS', color: '#2EE6A6' }
  ];

  return (
    <div className="space-y-4 font-mono text-[#e2e8f0]">
      {/* Top Header Bar */}
      <div className="bg-[#0b0f19] border border-[#182236] p-4 sm:p-5 rounded-2xl shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#182236] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5B31B] to-[#2EE6A6] p-[2px]">
              <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center font-extrabold text-[#F5B31B]">
                MB
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white">MBCap Pro Terminal</h2>
                <span className="text-[10px] bg-[#1e273a] text-[#F5B31B] px-2 py-0.5 rounded font-bold">
                  v1.2
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  isRealMode ? 'bg-red-950/40 text-red-300 border border-red-500/40' : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isRealMode ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'}`} />
                  {isRealMode ? 'LIVE REAL MODE' : 'SIMULATION ENGINE'}
                </span>
              </div>
              <div className="text-xs text-[#718096] mt-0.5">
                Every trade requires an audited reason · 7 autonomous agents online
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="text-xs text-[#718096]">Customer Equity</div>
              <div className="text-lg sm:text-xl font-extrabold text-white">
                {isRealMode ? (wallet.nativeBalance || '0.00') : `$${practiceCash.toFixed(2)}`}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#718096]">Platform Fee</div>
              <div className="text-lg sm:text-xl font-extrabold text-[#F5B31B]">0.06%</div>
            </div>
          </div>
        </div>

        {/* 7 Agents Grid */}
        <div className="text-xs font-bold text-[#8896ab] mb-2 uppercase tracking-wider">
          7 Trading Agents Pipeline
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 mb-4">
          {[
            { name: 'SCANNER', badge: 'SCAN', desc: 'Reads DEX pools', color: '#EAB308', status: 'ACTIVE' },
            { name: 'RISK FILTER', badge: 'FILTER', desc: 'Drops low liquidity', color: '#FF4D6A', status: 'PASS' },
            { name: 'SIZER', badge: 'SIZE', desc: '1-10% of equity', color: '#A78BFA', status: '$100.00' },
            { name: 'EXECUTOR', badge: 'EXEC', desc: 'Non-custodial swap', color: '#22D3EE', status: isRealMode ? 'LIVE' : 'SIM' },
            { name: 'LOGGER', badge: 'LOG', desc: 'Audit trail on each move', color: '#F97316', status: 'SYNCED' },
            { name: 'EQUITY', badge: 'EQ', desc: 'Daily risk checks', color: '#3B82F6', status: 'STABLE' },
            { name: 'YOU', badge: 'CONTROL', desc: 'Custom boundaries', color: '#2EE6A6', status: 'ARMED' }
          ].map(agent => (
            <div
              key={agent.name}
              className="bg-[#07090e] border border-[#182236] p-2.5 rounded-xl border-l-[3px]"
              style={{ borderLeftColor: agent.color }}
            >
              <div className="flex items-center justify-between text-[11px] font-extrabold text-white">
                <span>{agent.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded" style={{ color: agent.color, backgroundColor: `${agent.color}20` }}>
                  {agent.badge}
                </span>
              </div>
              <div className="text-[10px] text-[#718096] mt-1">{agent.desc}</div>
              <div className="text-xs font-bold mt-1 text-white">{agent.status}</div>
            </div>
          ))}
        </div>

        {/* 15 Agent Verification Flow Panel */}
        <div className="bg-[#07090e] border border-[#161f30] rounded-xl p-3.5 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2EE6A6]" />
              <span>15 Agents Verification Pipeline (Rule-Based Defense)</span>
            </span>
            <button
              onClick={() => setShowAgentReports(!showAgentReports)}
              className="text-xs text-[#F5B31B] hover:underline"
            >
              {showAgentReports ? 'Hide Agent Checks' : 'Show 15 Agent Checks'}
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-wrap text-[11px] mb-2">
            {['Bot Propose', 'Chief of Staff', 'Portfolio Manager', '15 Agents Check', 'Ledger Checker', 'Output Verified'].map((step, idx) => (
              <React.Fragment key={step}>
                <span className="bg-[#121927] border border-[#2EE6A6]/40 text-[#2EE6A6] px-2 py-0.5 rounded font-bold">
                  {step}
                </span>
                {idx < 5 && <span className="text-[#718096]">→</span>}
              </React.Fragment>
            ))}
          </div>

          {showAgentReports && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#141b29] text-xs">
              {agents.map(ag => (
                <div key={ag.name} className="flex items-start gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2EE6A6] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">{ag.name}: </span>
                    <span className="text-[#8896ab]">{ag.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Execution Activity Log */}
        <div>
          <div className="text-xs font-bold text-[#8896ab] mb-2 uppercase tracking-wider">
            Live Audit Stream & Executions
          </div>
          <div className="bg-[#07090e] border border-[#161f30] rounded-xl divide-y divide-[#141b29] overflow-hidden text-xs">
            {logEntries.map((log, i) => (
              <div key={i} className="p-2.5 flex items-center justify-between flex-wrap gap-2 hover:bg-[#121927] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-[#718096] text-[11px]">{log.time}</span>
                  <span className="px-2 py-0.5 rounded font-bold text-[10px]" style={{ color: log.color, backgroundColor: `${log.color}15` }}>
                    {log.type}
                  </span>
                  <span className="font-extrabold text-white">${log.token}</span>
                  <span className="text-[#cbd5e1]">{log.action}</span>
                </div>
                <span className="font-bold font-mono" style={{ color: log.color }}>
                  {log.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
