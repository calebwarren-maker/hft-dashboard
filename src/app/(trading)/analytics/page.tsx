'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EquityCurve } from '@/components/trading/equity-curve';
import { TradeTable } from '@/components/trading/trade-table';
import {
  generateEquityCurve,
  generateTradeDistribution,
  generateHourlyHeatmap,
  getTrades,
  getBestWorstTrades,
} from '@/lib/mock-data';
import type { FlowType } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const FLOW_COLORS: Record<FlowType, string> = {
  clean: '#22c55e',
  suspicious: '#eab308',
  toxic: '#ef4444',
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState(7);

  const equityCurve = useMemo(() => generateEquityCurve(dateRange), [dateRange]);
  const distribution = useMemo(() => generateTradeDistribution(), []);
  const heatmap = useMemo(() => generateHourlyHeatmap(), []);
  const trades = useMemo(() => getTrades(), []);
  const { best, worst } = useMemo(() => getBestWorstTrades(10), []);

  // P&L by flow type
  const pnlByFlow = useMemo(() => {
    const groups: Record<FlowType, { total: number; wins: number; count: number }> = {
      clean: { total: 0, wins: 0, count: 0 },
      suspicious: { total: 0, wins: 0, count: 0 },
      toxic: { total: 0, wins: 0, count: 0 },
    };
    trades.forEach((t) => {
      groups[t.flowType].total += t.pnl;
      groups[t.flowType].count++;
      if (t.pnl > 0) groups[t.flowType].wins++;
    });
    return (['clean', 'suspicious', 'toxic'] as FlowType[]).map((ft) => ({
      flowType: ft,
      totalPnl: Math.round(groups[ft].total * 100) / 100,
      winRate:
        groups[ft].count > 0
          ? Math.round((groups[ft].wins / groups[ft].count) * 10000) / 100
          : 0,
      tradeCount: groups[ft].count,
    }));
  }, [trades]);

  // Heatmap: find min/max for color scaling
  const heatmapMin = Math.min(...heatmap.map((h) => h.pnl));
  const heatmapMax = Math.max(...heatmap.map((h) => h.pnl));

  function heatmapColor(val: number): string {
    if (val > 0) {
      const intensity = Math.min(val / heatmapMax, 1);
      return `rgba(34, 197, 94, ${0.15 + intensity * 0.6})`;
    } else {
      const intensity = Math.min(Math.abs(val) / Math.abs(heatmapMin), 1);
      return `rgba(239, 68, 68, ${0.15 + intensity * 0.6})`;
    }
  }

  const HOURS = Array.from({ length: 13 }, (_, i) => i + 7);
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  return (
    <div className="space-y-4">
      {/* Date range selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground mr-2">Period:</span>
        {[1, 3, 7, 14, 30].map((d) => (
          <button
            key={d}
            onClick={() => setDateRange(d)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              dateRange === d
                ? 'bg-blue-600 text-white'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {d}D
          </button>
        ))}
      </div>

      {/* Equity Curve */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
            Performance — Cumulative P&L ({dateRange} Day{dateRange > 1 ? 's' : ''})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EquityCurve data={equityCurve} height={280} />
        </CardContent>
      </Card>

      {/* Row 2: Distribution + P&L by Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Trade Distribution */}
        <Card className="lg:col-span-7 border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Trade Distribution (Win/Loss)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={distribution} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(20,20,30,0.95)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {distribution.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.type === 'win' ? '#22c55e' : '#ef4444'}
                      fillOpacity={0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* P&L by Flow Type */}
        <Card className="lg:col-span-5 border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              P&L by Flow Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pnlByFlow.map((f) => {
                const pnlColor =
                  f.totalPnl > 0
                    ? 'text-green-500'
                    : f.totalPnl < 0
                    ? 'text-red-500'
                    : 'text-muted-foreground';
                return (
                  <div
                    key={f.flowType}
                    className="rounded border border-border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: FLOW_COLORS[f.flowType],
                          }}
                        />
                        <span className="text-sm font-medium capitalize">
                          {f.flowType} Flow
                        </span>
                      </div>
                      <span
                        className={`font-mono-nums text-sm font-bold ${pnlColor}`}
                      >
                        {f.totalPnl >= 0 ? '+' : ''}$
                        {Math.abs(f.totalPnl).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-4 text-[11px] text-muted-foreground">
                      <span>
                        Win rate:{' '}
                        <span className="font-mono-nums text-foreground">
                          {f.winRate.toFixed(1)}%
                        </span>
                      </span>
                      <span>
                        Trades:{' '}
                        <span className="font-mono-nums text-foreground">
                          {f.tradeCount}
                        </span>
                      </span>
                    </div>
                    {/* Visual bar */}
                    <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${f.winRate}%`,
                          backgroundColor: FLOW_COLORS[f.flowType],
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Heatmap */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
            Hourly Performance Heatmap (P&L)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Hours header */}
              <div className="flex gap-0.5 mb-0.5 ml-10">
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="flex-1 text-center text-[9px] text-muted-foreground/60"
                  >
                    {h}:00
                  </div>
                ))}
              </div>
              {/* Heatmap rows */}
              {DAYS.map((day) => (
                <div key={day} className="flex gap-0.5 mb-0.5">
                  <div className="w-10 text-[10px] text-muted-foreground flex items-center">
                    {day}
                  </div>
                  {HOURS.map((hour) => {
                    const cell = heatmap.find(
                      (h) => h.day === day && h.hour === hour
                    );
                    const val = cell?.pnl ?? 0;
                    return (
                      <div
                        key={`${day}-${hour}`}
                        className="flex-1 h-8 rounded-sm flex items-center justify-center text-[9px] font-mono-nums cursor-default"
                        style={{ backgroundColor: heatmapColor(val) }}
                        title={`${day} ${hour}:00 — $${val}`}
                      >
                        {Math.abs(val) > 100 ? `$${val}` : ''}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best and Worst trades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Best 10 Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TradeTable trades={best} maxRows={10} compact />
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Worst 10 Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TradeTable trades={worst} maxRows={10} compact />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
