'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RiskMeter } from '@/components/trading/risk-meter';
import { StatCard } from '@/components/trading/stat-card';
import { getRiskMetrics, getDashboardStats } from '@/lib/mock-data';
import type { RiskMetrics } from '@/lib/types';
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

export default function RiskPage() {
  const [risk, setRisk] = useState<RiskMetrics>(() => getRiskMetrics());
  const [stats, setStats] = useState(() => getDashboardStats());
  const [circuitBreakerHistory, setCircuitBreakerHistory] = useState<
    { timestamp: Date; reason: string }[]
  >([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRisk(getRiskMetrics());
      setStats(getDashboardStats());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const dailyLossUsed = risk.dailyPnl < 0 ? Math.abs(risk.dailyPnl) : 0;
  const dailyLossLimit = Math.abs(risk.dailyLossLimit);
  const dailyLossPct = (dailyLossUsed / dailyLossLimit) * 100;

  const drawdownPct =
    (Math.abs(risk.currentDrawdown) / Math.abs(risk.maxDrawdown)) * 100;

  const exposureData = risk.exposureBySymbol.map((e) => ({
    symbol: e.symbol,
    exposure: e.exposure,
    maxExposure: e.maxExposure,
    pct: Math.round((e.exposure / e.maxExposure) * 100),
  }));

  return (
    <div className="space-y-4">
      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          label="Position Size"
          value={`${risk.currentPositionSize} / ${risk.maxPositionSize}`}
          subValue="contracts"
          color={
            risk.currentPositionSize / risk.maxPositionSize > 0.8
              ? 'red'
              : risk.currentPositionSize / risk.maxPositionSize > 0.5
              ? 'yellow'
              : 'green'
          }
        />
        <StatCard
          label="Daily P&L"
          value={`${risk.dailyPnl >= 0 ? '+' : ''}$${Math.abs(risk.dailyPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          color={risk.dailyPnl >= 0 ? 'green' : 'red'}
          large
        />
        <StatCard
          label="Daily Loss Limit"
          value={`$${dailyLossLimit.toLocaleString()}`}
          subValue={`${dailyLossPct.toFixed(0)}% used`}
          color={dailyLossPct > 80 ? 'red' : dailyLossPct > 50 ? 'yellow' : 'green'}
        />
        <StatCard
          label="Current Drawdown"
          value={`$${Math.abs(risk.currentDrawdown).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          subValue={`max: $${Math.abs(risk.maxDrawdown).toLocaleString()}`}
          color={drawdownPct > 80 ? 'red' : drawdownPct > 50 ? 'yellow' : 'green'}
        />
        <Card className="border-border bg-card">
          <CardContent className="p-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Circuit Breaker
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div
                className={`h-4 w-4 rounded-full ${
                  risk.circuitBreakerActive
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-green-500'
                }`}
              />
              <span
                className={`text-sm font-bold ${
                  risk.circuitBreakerActive ? 'text-red-500' : 'text-green-500'
                }`}
              >
                {risk.circuitBreakerActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            {risk.circuitBreakerActive && risk.circuitBreakerCountdown > 0 && (
              <div className="mt-1 font-mono-nums text-xs text-red-400">
                Resumes in {risk.circuitBreakerCountdown}s
              </div>
            )}
            {!risk.circuitBreakerActive && (
              <div className="mt-1 text-[11px] text-muted-foreground">
                All systems normal
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Risk meters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Position & Loss Gauges */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Risk Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <RiskMeter
              label="Position Size"
              current={risk.currentPositionSize}
              max={risk.maxPositionSize}
              unit=" contracts"
            />
            <RiskMeter
              label="Daily Loss Used"
              current={dailyLossUsed}
              max={dailyLossLimit}
              unit="$"
              inverted
            />
            <RiskMeter
              label="Drawdown"
              current={Math.abs(risk.currentDrawdown)}
              max={Math.abs(risk.maxDrawdown)}
              unit="$"
              inverted
            />
            <RiskMeter
              label="Toxic Flow Exposure"
              current={Math.round(stats.toxicFlowScore)}
              max={100}
              unit="%"
              inverted
            />
          </CardContent>
        </Card>

        {/* Exposure by Symbol */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Portfolio Exposure by Symbol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={exposureData}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) =>
                    `$${(v / 1000).toFixed(0)}k`
                  }
                />
                <YAxis
                  dataKey="symbol"
                  type="category"
                  tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.7)' }}
                  tickLine={false}
                  axisLine={false}
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(20,20,30,0.95)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                  formatter={(value: number) => [
                    `$${value.toLocaleString()}`,
                    'Exposure',
                  ]}
                />
                <Bar
                  dataKey="maxExposure"
                  fill="rgba(255,255,255,0.07)"
                  radius={[0, 4, 4, 0]}
                />
                <Bar dataKey="exposure" radius={[0, 4, 4, 0]}>
                  {exposureData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        entry.pct > 80
                          ? '#ef4444'
                          : entry.pct > 50
                          ? '#eab308'
                          : '#3b82f6'
                      }
                      fillOpacity={0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Detail cards */}
            <div className="space-y-3 mt-4">
              {exposureData.map((e) => (
                <div key={e.symbol} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-foreground">
                      {e.symbol}
                    </span>
                    <span className="font-mono-nums text-muted-foreground">
                      ${e.exposure.toLocaleString()} /{' '}
                      ${e.maxExposure.toLocaleString()}
                      <span className="ml-1 text-muted-foreground/60">
                        ({e.pct}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        e.pct > 80
                          ? 'bg-red-500'
                          : e.pct > 50
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(e.pct, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Rules Status */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
            Risk Rules Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              {
                rule: 'Max Position Size',
                value: `${risk.currentPositionSize}/${risk.maxPositionSize}`,
                ok: risk.currentPositionSize <= risk.maxPositionSize,
              },
              {
                rule: 'Daily Loss Limit',
                value: `$${dailyLossUsed.toFixed(0)}/$${dailyLossLimit}`,
                ok: dailyLossUsed < dailyLossLimit,
              },
              {
                rule: 'Max Drawdown',
                value: `$${Math.abs(risk.currentDrawdown).toFixed(0)}/$${Math.abs(risk.maxDrawdown)}`,
                ok: Math.abs(risk.currentDrawdown) < Math.abs(risk.maxDrawdown),
              },
              {
                rule: 'Circuit Breaker',
                value: risk.circuitBreakerActive ? 'TRIGGERED' : 'OK',
                ok: !risk.circuitBreakerActive,
              },
              {
                rule: 'Toxic Flow Threshold',
                value: `${stats.toxicFlowScore.toFixed(0)}%/80%`,
                ok: stats.toxicFlowScore < 80,
              },
              {
                rule: 'Order Rate Limit',
                value: '12/50 per sec',
                ok: true,
              },
            ].map((r) => (
              <div
                key={r.rule}
                className={`flex items-center justify-between rounded border p-2.5 ${
                  r.ok
                    ? 'border-green-500/20 bg-green-500/5'
                    : 'border-red-500/20 bg-red-500/5'
                }`}
              >
                <div>
                  <div className="text-[11px] font-medium text-foreground">
                    {r.rule}
                  </div>
                  <div className="font-mono-nums text-[10px] text-muted-foreground">
                    {r.value}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[9px] px-1.5 ${
                    r.ok
                      ? 'text-green-500 border-green-500/30'
                      : 'text-red-500 border-red-500/30'
                  }`}
                >
                  {r.ok ? 'PASS' : 'WARN'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
