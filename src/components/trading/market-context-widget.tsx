'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPriceSeries, tickPriceSeries } from '@/lib/mock-data';
import type { PricePoint } from '@/lib/types';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
} from 'recharts';

interface MarketContextWidgetProps {
  defaultSymbol?: 'ES' | 'NQ';
}

export function MarketContextWidget({
  defaultSymbol = 'ES',
}: MarketContextWidgetProps) {
  const [symbol, setSymbol] = useState<'ES' | 'NQ'>(defaultSymbol);
  const [series, setSeries] = useState<PricePoint[]>(() =>
    getPriceSeries(symbol)
  );

  useEffect(() => {
    // Reset to current series on symbol change
    setSeries(getPriceSeries(symbol));

    const interval = setInterval(() => {
      setSeries(tickPriceSeries(symbol));
    }, 1000);

    return () => clearInterval(interval);
  }, [symbol]);

  // Derived metrics
  const current = series[series.length - 1]?.price ?? 0;
  const open = series[0]?.price ?? current;
  const change = Math.round((current - open) * 100) / 100;
  const changePct =
    open !== 0 ? Math.round((change / open) * 10000) / 100 : 0;
  const high = Math.max(...series.map((p) => p.price));
  const low = Math.min(...series.map((p) => p.price));
  const isUp = change >= 0;

  const chartData = series.map((p) => ({
    t: p.timestamp.getTime(),
    price: p.price,
  }));

  const domainMin = low - 2;
  const domainMax = high + 2;

  return (
    <Card className="border-border bg-card card-flush">
      <CardHeader className="pb-1 pt-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
            Market Pulse &middot; {symbol}
          </CardTitle>
          <div className="flex items-center gap-1">
            {(['ES', 'NQ'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSymbol(s)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  symbol === s
                    ? 'bg-brand text-white'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-0">
        {/* Metrics row */}
        <div className="flex items-baseline gap-4 mb-2 flex-wrap">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono-nums text-lg font-bold text-foreground">
              {current.toFixed(2)}
            </span>
            <span
              className={`font-mono-nums text-xs font-medium ${
                isUp ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {isUp ? '+' : ''}{change.toFixed(2)} ({changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%)
            </span>
          </div>
          <div className="flex items-baseline gap-3 text-[11px] text-muted-foreground">
            <span>
              H:{' '}
              <span className="font-mono-nums text-foreground">
                {high.toFixed(2)}
              </span>
            </span>
            <span>
              L:{' '}
              <span className="font-mono-nums text-foreground">
                {low.toFixed(2)}
              </span>
            </span>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="ctxGradientUp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="ctxGradientDown"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={[domainMin, domainMax]} hide />
            <Area
              type="monotone"
              dataKey="price"
              stroke={isUp ? '#22c55e' : '#ef4444'}
              strokeWidth={1.5}
              fill={isUp ? 'url(#ctxGradientUp)' : 'url(#ctxGradientDown)'}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
