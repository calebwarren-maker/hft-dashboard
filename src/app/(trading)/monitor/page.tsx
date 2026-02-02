'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FlowClassifier } from '@/components/trading/flow-classifier';
import { StatCard } from '@/components/trading/stat-card';
import {
  getFlowEvents,
  generateFlowEvent,
  getDashboardStats,
  incrementAvoidedTrade,
  generateOrderBook,
} from '@/lib/mock-data';
import type { FlowEvent, DashboardStats, OrderBook } from '@/lib/types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const FLOW_COLORS = {
  clean: '#22c55e',
  suspicious: '#eab308',
  toxic: '#ef4444',
};

export default function MonitorPage() {
  const [events, setEvents] = useState<FlowEvent[]>(() => getFlowEvents());
  const [stats, setStats] = useState<DashboardStats>(() => getDashboardStats());
  const [orderBook, setOrderBook] = useState<OrderBook>(() => generateOrderBook('ES'));
  const [rejectionLog, setRejectionLog] = useState<
    { id: string; timestamp: Date; reason: string; savedAmount: number }[]
  >([]);

  useEffect(() => {
    let cancelled = false;

    // New flow events every 2-5 seconds (random each time)
    let flowTimeout: ReturnType<typeof setTimeout>;
    const scheduleFlow = () => {
      flowTimeout = setTimeout(() => {
        if (cancelled) return;
        const event = generateFlowEvent();
        setEvents(getFlowEvents());

        // Simulate trade rejection on toxic events
        if (event.flowType === 'toxic' && Math.random() > 0.3) {
          incrementAvoidedTrade();
          const saved = Math.round((200 + Math.random() * 800) * 100) / 100;
          setRejectionLog((prev) => [
            {
              id: event.id,
              timestamp: new Date(),
              reason: event.reason,
              savedAmount: saved,
            },
            ...prev.slice(0, 19),
          ]);
        }
        scheduleFlow();
      }, 2000 + Math.random() * 3000);
    };
    scheduleFlow();

    // Stats refresh every 1s
    const statsInterval = setInterval(() => {
      setStats(getDashboardStats());
    }, 1000);

    // Order book refresh every 200ms
    const obInterval = setInterval(() => {
      setOrderBook(generateOrderBook('ES'));
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(flowTimeout);
      clearInterval(statsInterval);
      clearInterval(obInterval);
    };
  }, []);

  // Calculate flow distribution
  const flowCounts = events.reduce(
    (acc, e) => {
      acc[e.flowType]++;
      return acc;
    },
    { clean: 0, suspicious: 0, toxic: 0 } as Record<string, number>
  );

  const pieData = [
    { name: 'Clean', value: flowCounts.clean, color: FLOW_COLORS.clean },
    { name: 'Suspicious', value: flowCounts.suspicious, color: FLOW_COLORS.suspicious },
    { name: 'Toxic', value: flowCounts.toxic, color: FLOW_COLORS.toxic },
  ];

  // Order book imbalance history (last 20 readings)
  const [imbalanceHistory, setImbalanceHistory] = useState<
    { time: string; imbalance: number }[]
  >([]);

  useEffect(() => {
    setImbalanceHistory((prev) => {
      const next = [
        ...prev,
        {
          time: new Date().toLocaleTimeString('en-US', {
            hour12: false,
            second: '2-digit',
            minute: '2-digit',
          }),
          imbalance: orderBook.imbalance * 100,
        },
      ];
      return next.slice(-30);
    });
  }, [orderBook]);

  return (
    <div className="space-y-4">
      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          label="Toxic Flow Score"
          value={`${stats.toxicFlowScore.toFixed(1)}%`}
          color={stats.toxicFlowScore > 60 ? 'red' : stats.toxicFlowScore > 40 ? 'yellow' : 'green'}
          large
        />
        <StatCard
          label="Trades Avoided"
          value={stats.avoidedTrades.toString()}
          subValue="toxic signals rejected"
          color="red"
        />
        <StatCard
          label="Est. Savings"
          value={`$${stats.estimatedSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          color="green"
        />
        <StatCard
          label="Clean Flow"
          value={`${((flowCounts.clean / events.length) * 100).toFixed(0)}%`}
          color="green"
        />
        <StatCard
          label="Order Book Imbalance"
          value={`${orderBook.imbalance > 0 ? '+' : ''}${(orderBook.imbalance * 100).toFixed(1)}%`}
          color={orderBook.imbalance > 0.1 ? 'green' : orderBook.imbalance < -0.1 ? 'red' : 'default'}
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Flow stream */}
        <Card className="lg:col-span-5 border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Live Flow Classification
              </CardTitle>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 live-dot" />
                <span className="text-[10px] text-muted-foreground">
                  {events.length} events
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[500px]">
            <FlowClassifier events={events} maxItems={50} />
          </CardContent>
        </Card>

        {/* Charts column */}
        <div className="lg:col-span-4 space-y-3">
          {/* Pie chart */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Flow Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value: string) => (
                      <span className="text-[11px] text-muted-foreground">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Imbalance chart */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Order Book Imbalance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={imbalanceHistory}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveEnd"
                    minTickGap={40}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }}
                    tickLine={false}
                    axisLine={false}
                    domain={[-30, 30]}
                    width={35}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(20,20,30,0.95)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar
                    dataKey="imbalance"
                    fill="#3b82f6"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Rejection log */}
        <Card className="lg:col-span-3 border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Trade Rejections
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[500px] overflow-auto">
            <div className="space-y-1.5">
              {rejectionLog.length === 0 ? (
                <div className="text-[11px] text-muted-foreground text-center py-8">
                  Monitoring for toxic flow...
                </div>
              ) : (
                rejectionLog.map((r) => (
                  <div
                    key={r.id}
                    className="rounded border border-red-500/20 bg-red-500/5 p-2"
                  >
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1.5 py-0 text-red-500 border-red-500/30"
                      >
                        REJECTED
                      </Badge>
                      <span className="font-mono-nums text-[10px] text-green-500">
                        +${r.savedAmount.toFixed(0)} saved
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground truncate">
                      {r.reason}
                    </div>
                    <div className="mt-0.5 font-mono-nums text-[9px] text-muted-foreground/60">
                      {r.timestamp.toLocaleTimeString('en-US', { hour12: false })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
