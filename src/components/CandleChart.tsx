import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickSeries, ColorType } from 'lightweight-charts';
import { TokenPool, CandleData } from '../types/trading';
import { MarketDataService } from '../services/marketData';
import { Activity, Clock, Maximize2, RefreshCw } from 'lucide-react';

interface CandleChartProps {
  currentPool: TokenPool;
  onPriceUpdate?: (price: number) => void;
}

export const CandleChart: React.FC<CandleChartProps> = ({ currentPool, onPriceUpdate }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [timeframe, setTimeframe] = useState<string>('15m');
  const [currentCandle, setCurrentCandle] = useState<CandleData | null>(null);
  const [priceChange, setPriceChange] = useState<number>(currentPool.ch);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveStream, setIsLiveStream] = useState<boolean>(false);

  // Initialize or re-create chart on container render
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Remove existing chart if any
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth || 700,
      height: 380,
      layout: {
        background: { type: ColorType.Solid, color: '#090d16' },
        textColor: '#8896ab'
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' }
      },
      rightPriceScale: {
        borderColor: '#182236',
        scaleMargins: {
          top: 0.1,
          bottom: 0.15
        }
      },
      timeScale: {
        borderColor: '#182236',
        timeVisible: true,
        secondsVisible: false
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#384869',
          width: 1,
          style: 3
        },
        horzLine: {
          color: '#384869',
          width: 1,
          style: 3
        }
      }
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#2EE6A6',
      downColor: '#FF4D6A',
      borderVisible: false,
      wickUpColor: '#2EE6A6',
      wickDownColor: '#FF4D6A'
    });

    chartInstanceRef.current = chart;
    candleSeriesRef.current = candleSeries;

    // Resize observer
    const handleResize = () => {
      if (chartContainerRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  // Fetch candles when pool or timeframe changes
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const loadData = async () => {
      try {
        const candles = await MarketDataService.fetchCandles(currentPool.symbol, timeframe);
        if (isCancelled || !candleSeriesRef.current || candles.length === 0) return;

        candleSeriesRef.current.setData(candles as any);
        chartInstanceRef.current?.timeScale().fitContent();

        const latest = candles[candles.length - 1];
        setCurrentCandle(latest);

        if (latest.close && onPriceUpdate) {
          onPriceUpdate(latest.close);
        }

        // Calculate period change
        const first = candles[0].open;
        const diff = ((latest.close - first) / first) * 100;
        setPriceChange(diff);

        setIsLoading(false);

        // Connect live stream for popular pairs if Binance WebSocket supports it
        connectWebSocket(currentPool.symbol, timeframe);
      } catch (err) {
        console.error('Error loading candles:', err);
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isCancelled = true;
      closeWebSocket();
    };
  }, [currentPool.id, currentPool.symbol, timeframe]);

  // Connect Binance WebSocket for real-time live tick
  const connectWebSocket = (symbol: string, tf: string) => {
    closeWebSocket();

    const clean = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const pair = clean.includes('USDT') ? clean.toLowerCase() : `${clean.toLowerCase()}usdt`;

    const wsUrl = `wss://stream.binance.com:9443/ws/${pair}@kline_${tf}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsLiveStream(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.k && candleSeriesRef.current) {
            const k = msg.k;
            const updatedCandle: CandleData = {
              time: Math.floor(k.t / 1000),
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: parseFloat(k.c),
              volume: parseFloat(k.v)
            };

            candleSeriesRef.current.update(updatedCandle as any);
            setCurrentCandle(updatedCandle);

            if (onPriceUpdate) {
              onPriceUpdate(updatedCandle.close);
            }
          }
        } catch (e) {
          // ignore parse errors
        }
      };

      ws.onerror = () => {
        setIsLiveStream(false);
      };

      ws.onclose = () => {
        setIsLiveStream(false);
      };
    } catch (e) {
      setIsLiveStream(false);
    }
  };

  const closeWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsLiveStream(false);
  };

  const formatPrice = (p: number) => {
    if (p >= 1) return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    return '$' + p.toPrecision(5);
  };

  return (
    <div className="bg-[#0b0f19] border border-[#182236] rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col">
      {/* Chart Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#182236] pb-3 mb-2">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                {currentPool.name}
              </h2>
              <span className="text-[10px] font-mono font-bold bg-[#172033] text-[#2EE6A6] px-2 py-0.5 rounded border border-[#23314d]">
                {currentPool.chain}
              </span>
              {isLiveStream && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-[#2EE6A6] bg-[#2EE6A6]/10 px-2 py-0.5 rounded-full border border-[#2EE6A6]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2EE6A6] animate-pulse" />
                  LIVE FEED
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1 font-mono text-xs">
              <span className="text-lg sm:text-xl font-extrabold text-white">
                {formatPrice(currentCandle ? currentCandle.close : currentPool.price)}
              </span>
              <span
                className={`font-bold flex items-center gap-0.5 ${
                  priceChange >= 0 ? 'text-[#2EE6A6]' : 'text-[#FF4D6A]'
                }`}
              >
                {priceChange >= 0 ? '+' : ''}
                {priceChange.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe Switcher & Metrics */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-[#07090e] border border-[#1a2336] p-0.5 rounded-lg text-xs font-mono">
            {['1m', '5m', '15m', '1h', '4h', '1D'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 rounded font-semibold transition-all ${
                  timeframe === tf
                    ? 'bg-[#1e2a42] text-[#F5B31B] shadow'
                    : 'text-[#718096] hover:text-white hover:bg-[#121826]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="hidden xl:flex items-center gap-3 text-xs font-mono text-[#718096] bg-[#07090e] px-3 py-1.5 rounded-lg border border-[#1a2336]">
            <div>
              <span className="text-[#4a5568]">24h Vol:</span>{' '}
              <span className="text-white font-bold">
                ${(currentPool.vol / 1000000).toFixed(2)}M
              </span>
            </div>
            <div>
              <span className="text-[#4a5568]">Liquidity:</span>{' '}
              <span className="text-white font-bold">
                ${(currentPool.liq / 1000000).toFixed(2)}M
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative w-full h-[380px] rounded-xl overflow-hidden bg-[#090d16]">
        {isLoading && (
          <div className="absolute inset-0 bg-[#090d16]/80 backdrop-blur-sm z-10 flex items-center justify-center flex-col gap-2 text-xs font-mono text-[#F5B31B]">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading live candlestick market feed...</span>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>

      {/* Candlestick HUD info bar */}
      <div className="flex items-center justify-between text-[11px] font-mono text-[#718096] mt-2 pt-2 border-t border-[#141b29] flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span>O: <b className="text-white">{currentCandle ? formatPrice(currentCandle.open) : '-'}</b></span>
          <span>H: <b className="text-white">{currentCandle ? formatPrice(currentCandle.high) : '-'}</b></span>
          <span>L: <b className="text-white">{currentCandle ? formatPrice(currentCandle.low) : '-'}</b></span>
          <span>C: <b className="text-white">{currentCandle ? formatPrice(currentCandle.close) : '-'}</b></span>
        </div>
        <div className="text-[10px] text-[#4a5568]">
          Binance Spot WebSocket + DEX Screener Real-Time Ticker
        </div>
      </div>
    </div>
  );
};
