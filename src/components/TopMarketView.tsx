import React, { useState } from 'react';
import { Search, ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';
import { TokenPool } from '../types/trading';

interface TopMarketCoin {
  rank: number;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
}

const TOP_50_DATA: TopMarketCoin[] = [
  { rank: 1, name: 'Bitcoin', symbol: 'BTC', price: 77800, change24h: 1.8, marketCap: 1540000000000, volume24h: 38500000000 },
  { rank: 2, name: 'Ethereum', symbol: 'ETH', price: 2940, change24h: 3.4, marketCap: 354000000000, volume24h: 21200000000 },
  { rank: 3, name: 'Tether', symbol: 'USDT', price: 1.00, change24h: 0.01, marketCap: 120000000000, volume24h: 62000000000 },
  { rank: 4, name: 'BNB', symbol: 'BNB', price: 624, change24h: -0.8, marketCap: 91000000000, volume24h: 1450000000 },
  { rank: 5, name: 'Solana', symbol: 'SOL', price: 168.4, change24h: 5.2, marketCap: 79000000000, volume24h: 5600000000 },
  { rank: 6, name: 'USDC', symbol: 'USDC', price: 1.00, change24h: 0.0, marketCap: 36000000000, volume24h: 8900000000 },
  { rank: 7, name: 'XRP', symbol: 'XRP', price: 0.54, change24h: 2.1, marketCap: 30500000000, volume24h: 1120000000 },
  { rank: 8, name: 'Dogecoin', symbol: 'DOGE', price: 0.142, change24h: 7.8, marketCap: 20800000000, volume24h: 2100000000 },
  { rank: 9, name: 'Cardano', symbol: 'ADA', price: 0.354, change24h: -1.2, marketCap: 12700000000, volume24h: 420000000 },
  { rank: 10, name: 'TRON', symbol: 'TRX', price: 0.165, change24h: 0.4, marketCap: 14300000000, volume24h: 390000000 },
  { rank: 11, name: 'Avalanche', symbol: 'AVAX', price: 26.8, change24h: 3.1, marketCap: 10800000000, volume24h: 380000000 },
  { rank: 12, name: 'Shiba Inu', symbol: 'SHIB', price: 0.0000184, change24h: 4.6, marketCap: 10800000000, volume24h: 520000000 },
  { rank: 13, name: 'Chainlink', symbol: 'LINK', price: 11.2, change24h: -2.4, marketCap: 6800000000, volume24h: 310000000 },
  { rank: 14, name: 'Sui', symbol: 'SUI', price: 1.95, change24h: 8.9, marketCap: 5400000000, volume24h: 890000000 },
  { rank: 15, name: 'Pepe', symbol: 'PEPE', price: 0.00001048, change24h: 5.8, marketCap: 4400000000, volume24h: 1100000000 },
  { rank: 16, name: 'Uniswap', symbol: 'UNI', price: 8.64, change24h: -1.2, marketCap: 5200000000, volume24h: 240000000 },
  { rank: 17, name: 'Aave', symbol: 'AAVE', price: 154.2, change24h: 2.8, marketCap: 2300000000, volume24h: 180000000 },
  { rank: 18, name: 'Near Protocol', symbol: 'NEAR', price: 4.82, change24h: 1.4, marketCap: 5800000000, volume24h: 290000000 }
];

interface TopMarketViewProps {
  onFindDEXPair: (symbol: string) => void;
}

export const TopMarketView: React.FC<TopMarketViewProps> = ({ onFindDEXPair }) => {
  const [search, setSearch] = useState<string>('');

  const filtered = TOP_50_DATA.filter(
    c => c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const formatBillion = (n: number) => {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    return `$${n.toFixed(2)}`;
  };

  return (
    <div className="bg-[#0b0f19] border border-[#182236] rounded-2xl p-4 sm:p-6 shadow-xl font-mono">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#182236] pb-4 mb-4">
        <div>
          <h3 className="text-base font-extrabold text-white">Top Coins by Global Market Cap</h3>
          <p className="text-xs text-[#718096] mt-0.5">
            Click 'Find DEX Pair' on any coin to instantly load its live decentralized trading market.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096]" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search coin (BTC, ETH, SOL)..."
            className="w-full bg-[#07090e] border border-[#1a2336] text-white text-xs rounded-xl py-2 pl-9 pr-3 outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[#718096] border-b border-[#182236] text-[11px]">
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Coin</th>
              <th className="py-2.5 px-3 text-right">Price</th>
              <th className="py-2.5 px-3 text-right">24h Change</th>
              <th className="py-2.5 px-3 text-right hidden sm:table-cell">Market Cap</th>
              <th className="py-2.5 px-3 text-right hidden md:table-cell">24h Volume</th>
              <th className="py-2.5 px-3 text-right">DEX Trading</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141b29]">
            {filtered.map(coin => (
              <tr key={coin.rank} className="hover:bg-[#121927] transition-colors">
                <td className="py-3 px-3 text-[#718096] font-bold">{coin.rank}</td>
                <td className="py-3 px-3">
                  <div className="font-extrabold text-white flex items-center gap-1.5">
                    <span>{coin.name}</span>
                    <span className="text-[10px] text-[#8896ab] bg-[#162033] px-1.5 py-0.5 rounded">
                      {coin.symbol}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-bold text-white">
                  ${coin.price >= 1 ? coin.price.toLocaleString('en-US') : coin.price.toFixed(6)}
                </td>
                <td className="py-3 px-3 text-right font-bold">
                  <span className={`inline-flex items-center gap-0.5 ${coin.change24h >= 0 ? 'text-[#2EE6A6]' : 'text-[#FF4D6A]'}`}>
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(1)}%
                  </span>
                </td>
                <td className="py-3 px-3 text-right text-[#cbd5e1] hidden sm:table-cell">
                  {formatBillion(coin.marketCap)}
                </td>
                <td className="py-3 px-3 text-right text-[#cbd5e1] hidden md:table-cell">
                  {formatBillion(coin.volume24h)}
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => onFindDEXPair(coin.symbol)}
                    className="bg-[#1a2336] hover:bg-[#F5B31B] text-[#F5B31B] hover:text-[#07090e] font-extrabold px-3 py-1 rounded-lg text-xs transition-colors shadow"
                  >
                    Find DEX Pair
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
