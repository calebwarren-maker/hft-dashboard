'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface EquityCurveProps {
  data: { timestamp: Date; pnl: number }[];
  height?: number;
}

export function EquityCurve({ data, height = 250 }: EquityCurveProps) {
  const chartData = data.map((d) => ({
    time: d.timestamp.getTime(),
    pnl: d.pnl,
    label: d.timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  }));

  const minPnl = Math.min(...chartData.map((d) => d.pnl));
  const maxPnl = Math.max(...chartData.map((d) => d.pnl));
  const lastPnl = chartData[chartData.length - 1]?.pnl ?? 0;
  const isPositive = lastPnl >= 0;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="pnlGradientGreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="pnlGradientRed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.05)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
          tickLine={false}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          interval="preserveStartEnd"
          minTickGap={60}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`}
          domain={[minPnl - 500, maxPnl + 500]}
          width={55}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(20,20,30,0.95)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'var(--font-geist-mono)',
          }}
          labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
          formatter={(value: number) => [
            `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            'P&L',
          ]}
        />
        <Area
          type="monotone"
          dataKey="pnl"
          stroke={isPositive ? '#22c55e' : '#ef4444'}
          strokeWidth={1.5}
          fill={isPositive ? 'url(#pnlGradientGreen)' : 'url(#pnlGradientRed)'}
          dot={false}
          activeDot={{ r: 3, fill: isPositive ? '#22c55e' : '#ef4444' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
