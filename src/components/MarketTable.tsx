import React, { useState } from 'react';
import { TokenPool } from '../types/trading';
import { Search, Star, ArrowUpRight, ArrowDownRight, Flame, ExternalLink, RefreshCw } from 'lucide-react';

interface MarketTableProps {
  pools: TokenPool[];
  selectedPoolId: string;
  onSelectPool: (pool: TokenPool) => void;
  onSearch: (query: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
  watchlist: Record<string, boolean>;
  onToggleWatchlist: (poolId: string) => void;
}

export const MarketTable: React.FC<MarketTableProps> = ({
  pools,
  selectedPoolId,
  onSelectPool,
  onSearch,
  isLoading,
  onRefresh,
  watchlist,
  onToggleWatchlist
}) => {
  const [selectedChain, setSelectedChain] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<'vol' | 'liq' | 'ch' | 'price'>('vol');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const chains = ['All', 'Ethereum', 'Base', 'Solana', 'BNB Chain', 'Arbitrum', 'Polygon', 'Avalanche'];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearch(val);
  };

  const handleSort = (field: 'vol' | 'liq' | 'ch' | 'price') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredPools = pools
    .filter(p => {
      const matchesChain = selectedChain === 'All' || p.chain.toLowerCase() === selectedChain.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tokenAddress.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesChain && matchesSearch;
    })
    .sort((a, b) => {
      const valA = a[sortField] || 0;
      const valB = b[sortField] || 0;
      return sortDirection === 'desc' ? valB - valA : valA - valB;
    });

  const formatUsd = (num: number) => {
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPrice = (p: number) => {
    if (p >= 1) return `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    return `$${p.toPrecision(4)}`;
  };

  return (
    <div className="bg-[#0b0f19] border border-[#182236] rounded-2xl p-4 sm:p-5 shadow-xl">
      {/* Search & Chain Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096]" />
          <input
            type="search"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search coin, ticker (PEPE, BRETT, WIF) or 0x contract..."
            className="w-full bg-[#07090e] border border-[#1f283d] focus:border-[#F5B31B] text-white font-mono text-xs sm:text-sm rounded-xl py-2 pl-10 pr-4 outline-none transition-colors placeholder:text-[#4a5568]"
          />
        </div>

        {/* Chain Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {chains.map(chain => (
            <button
              key={chain}
              onClick={() => setSelectedChain(chain)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-all ${
                selectedChain === chain
                  ? 'bg-[#1b253b] text-[#F5B31B] border border-[#2d3a54] shadow-sm'
                  : 'bg-[#07090e] text-[#718096] border border-[#182236] hover:text-white'
              }`}
            >
              {chain}
            </button>
          ))}
          <button
            onClick={onRefresh}
            className="p-1.5 bg-[#07090e] border border-[#182236] hover:border-[#2d3a54] text-[#8896ab] hover:text-white rounded-lg transition-colors ml-auto"
            title="Refresh Live DEX Pools"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#F5B31B]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="text-[#718096] border-b border-[#182236] select-none text-[11px]">
              <th className="py-2.5 px-3">Pair / Asset</th>
              <th
                onClick={() => handleSort('price')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
              >
                Price USD {sortField === 'price' && (sortDirection === 'desc' ? '↓' : '↑')}
              </th>
              <th
                onClick={() => handleSort('ch')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
              >
                24h Change {sortField === 'ch' && (sortDirection === 'desc' ? '↓' : '↑')}
              </th>
              <th
                onClick={() => handleSort('vol')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white hidden sm:table-cell"
              >
                24h Volume {sortField === 'vol' && (sortDirection === 'desc' ? '↓' : '↑')}
              </th>
              <th
                onClick={() => handleSort('liq')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white hidden md:table-cell"
              >
                Liquidity {sortField === 'liq' && (sortDirection === 'desc' ? '↓' : '↑')}
              </th>
              <th className="py-2.5 px-3 text-right">Trade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141b29]">
            {filteredPools.length > 0 ? (
              filteredPools.map(pool => {
                const isSelected = pool.id === selectedPoolId;
                const isWatched = !!watchlist[pool.id];

                return (
                  <tr
                    key={pool.id}
                    onClick={() => onSelectPool(pool)}
                    className={`cursor-pointer transition-colors hover:bg-[#121927] ${
                      isSelected ? 'bg-[#141d2e] border-l-2 border-[#F5B31B]' : ''
                    }`}
                  >
                    {/* Pair & Chain */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWatchlist(pool.id);
                          }}
                          className={`p-1 rounded hover:bg-[#1f2a3f] transition-colors ${
                            isWatched ? 'text-[#F5B31B]' : 'text-[#4a5568]'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>

                        <div>
                          <div className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-1.5">
                            <span>{pool.name}</span>
                            <span className="text-[10px] font-mono text-[#8896ab] bg-[#162033] px-1.5 py-0.5 rounded border border-[#23314d]">
                              {pool.chain}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#718096] truncate max-w-[180px]">
                            {pool.tokenAddress ? pool.tokenAddress.slice(0, 8) + '...' + pool.tokenAddress.slice(-6) : pool.source}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-3 text-right font-bold text-white">
                      {formatPrice(pool.price)}
                    </td>

                    {/* 24h Change */}
                    <td className="py-3 px-3 text-right font-bold">
                      <span
                        className={`inline-flex items-center gap-0.5 ${
                          pool.ch >= 0 ? 'text-[#2EE6A6]' : 'text-[#FF4D6A]'
                        }`}
                      >
                        {pool.ch >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {pool.ch >= 0 ? '+' : ''}{pool.ch.toFixed(2)}%
                      </span>
                    </td>

                    {/* Volume */}
                    <td className="py-3 px-3 text-right text-[#cbd5e1] hidden sm:table-cell">
                      {formatUsd(pool.vol)}
                    </td>

                    {/* Liquidity */}
                    <td className="py-3 px-3 text-right text-[#cbd5e1] hidden md:table-cell">
                      {formatUsd(pool.liq)}
                    </td>

                    {/* Action button */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPool(pool);
                        }}
                        className="bg-[#1a2336] hover:bg-[#2EE6A6] text-[#2EE6A6] hover:text-[#07090e] font-extrabold px-3 py-1 rounded-lg text-xs transition-colors shadow"
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#718096]">
                  No pools found matching your search. Try another ticker or contract address.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
