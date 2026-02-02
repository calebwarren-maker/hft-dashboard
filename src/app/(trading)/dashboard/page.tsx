'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/trading/stat-card';
import { ToxicFlowGauge } from '@/components/trading/toxic-flow-gauge';
import { PositionCard } from '@/components/trading/position-card';
import { TradeTable } from '@/components/trading/trade-table';
import { EquityCurve } from '@/components/trading/equity-curve';
import { FlowClassifier } from '@/components/trading/flow-classifier';
import { MarketContextWidget } from '@/components/trading/market-context-widget';
import {
  getDashboardStats,
  getPositions,
  getTrades,
  addNewTrade,
  incrementTrade,
  generateEquityCurve,
  getFlowEvents,
  generateFlowEvent,
  incrementAvoidedTrade,
} from '@/lib/mock-data';
import type { Position, Trade, FlowEvent, DashboardStats } from '@/lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(() => getDashboardStats());
  const [positions, setPositions] = useState<Position[]>(() => getPositions());
  const [trades, setTrades] = useState<Trade[]>(() => getTrades());
  const [equityCurve] = useState(() => generateEquityCurve(7));
  const [flowEvents, setFlowEvents] = useState<FlowEvent[]>(() => getFlowEvents());

  useEffect(() => {
    let cancelled = false;

    // Fast refresh for stats and positions (every 500ms)
    const fastInterval = setInterval(() => {
      setStats(getDashboardStats());
      setPositions(getPositions());
    }, 500);

    // New trade every 8-20 seconds (random each time)
    let tradeTimeout: ReturnType<typeof setTimeout>;
    const scheduleTrade = () => {
      tradeTimeout = setTimeout(() => {
        if (cancelled) return;
        const trade = addNewTrade();
        incrementTrade(trade.pnl > 0);
        if (trade.flowType === 'toxic' && Math.random() > 0.4) {
          incrementAvoidedTrade();
        }
        setTrades(getTrades());
        scheduleTrade();
      }, 8000 + Math.random() * 12000);
    };
    scheduleTrade();

    // New flow event every 3-8 seconds (random each time)
    let flowTimeout: ReturnType<typeof setTimeout>;
    const scheduleFlow = () => {
      flowTimeout = setTimeout(() => {
        if (cancelled) return;
        generateFlowEvent();
        setFlowEvents(getFlowEvents());
        scheduleFlow();
      }, 3000 + Math.random() * 5000);
    };
    scheduleFlow();

    return () => {
      cancelled = true;
      clearInterval(fastInterval);
      clearTimeout(tradeTimeout);
      clearTimeout(flowTimeout);
    };
  }, []);

  const pnlColor = stats.totalPnl > 0 ? 'green' : stats.totalPnl < 0 ? 'red' : 'default';
  const pnlSign = stats.totalPnl >= 0 ? '+' : '';

  return (
    <div className="space-y-4">
      {/* ─── Row 1: Key Stats ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <StatCard
          label="Day P&L"
          value={`${pnlSign}$${Math.abs(stats.totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          color={pnlColor as 'green' | 'red' | 'default'}
          large
        />
        <StatCard
          label="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          subValue={`${stats.totalTrades} trades today`}
          color={stats.winRate >= 60 ? 'green' : stats.winRate >= 50 ? 'yellow' : 'red'}
        />
        <StatCard
          label="Total Trades"
          value={stats.totalTrades.toString()}
          color="blue"
        />
        <StatCard
          label="Sharpe Ratio"
          value={stats.sharpeRatio.toFixed(2)}
          color={stats.sharpeRatio >= 2 ? 'green' : 'yellow'}
        />
        <StatCard
          label="Avoided Trades"
          value={stats.avoidedTrades.toString()}
          subValue="toxic rejected"
          color="red"
        />
        <StatCard
          label="Est. Savings"
          value={`$${stats.estimatedSavings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          subValue="from flow filter"
          color="green"
        />
      </div>

      {/* ─── Row 2: Gauge + Positions + Market Context ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Toxic Flow Gauge */}
        <Card className="lg:col-span-3 border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Toxic Flow Score
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center pb-4">
            <ToxicFlowGauge score={stats.toxicFlowScore} size={170} />
          </CardContent>
        </Card>

        {/* Positions */}
        <Card className="lg:col-span-4 border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Open Positions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {positions.length > 0 ? (
              positions.map((pos) => (
                <PositionCard key={pos.symbol} position={pos} />
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                No open positions
              </div>
            )}
            <div className="flex justify-between text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/50">
              <span>Net P&L</span>
              <span
                className={`font-mono-nums font-medium ${
                  positions.reduce((s, p) => s + p.pnl, 0) >= 0
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {positions.reduce((s, p) => s + p.pnl, 0) >= 0 ? '+' : ''}$
                {Math.abs(
                  positions.reduce((s, p) => s + p.pnl, 0)
                ).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Live Market Context */}
        <div className="lg:col-span-5">
          <MarketContextWidget />
        </div>
      </div>

      {/* ─── Row 3: Equity Curve (full width) ──────────────── */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
            Equity Curve (7d)
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <EquityCurve data={equityCurve} height={180} />
        </CardContent>
      </Card>

      {/* ─── Row 4: Recent Trades + Flow Events ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Recent Trades */}
        <Card className="lg:col-span-7 border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Recent Trades
              </CardTitle>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 live-dot" />
                <span className="text-[10px] text-muted-foreground">LIVE</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TradeTable trades={trades} maxRows={10} />
          </CardContent>
        </Card>

        {/* Flow Events */}
        <Card className="lg:col-span-5 border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Flow Classification
              </CardTitle>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 live-dot" />
                <span className="text-[10px] text-muted-foreground">STREAM</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[340px]">
            <FlowClassifier events={flowEvents} maxItems={15} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
