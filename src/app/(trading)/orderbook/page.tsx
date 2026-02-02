'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrderBookLadder } from '@/components/trading/order-book-ladder';
import { generateOrderBook, generateTapeEntry } from '@/lib/mock-data';
import type { OrderBook, TapeEntry } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function OrderBookPage() {
  const [esBook, setEsBook] = useState<OrderBook>(() =>
    generateOrderBook('ES')
  );
  const [nqBook, setNqBook] = useState<OrderBook>(() =>
    generateOrderBook('NQ')
  );
  const [tape, setTape] = useState<TapeEntry[]>([]);
  const [activeSymbol, setActiveSymbol] = useState<'ES' | 'NQ'>('ES');

  useEffect(() => {
    // Clear tape when switching symbols
    setTape([]);

    // Order book refresh (100ms) — only regenerate the active symbol
    const obInterval = setInterval(() => {
      if (activeSymbol === 'ES') {
        setEsBook(generateOrderBook('ES'));
      } else {
        setNqBook(generateOrderBook('NQ'));
      }
    }, 100);

    // Tape entries (50-200ms)
    const tapeInterval = setInterval(() => {
      setTape((prev) => {
        const entry = generateTapeEntry(activeSymbol);
        return [entry, ...prev.slice(0, 99)];
      });
    }, 80);

    return () => {
      clearInterval(obInterval);
      clearInterval(tapeInterval);
    };
  }, [activeSymbol]);

  const activeBook = activeSymbol === 'ES' ? esBook : nqBook;

  // Build depth chart data
  const depthData = [
    ...activeBook.bids
      .slice(0, 15)
      .reverse()
      .map((l) => ({
        price: l.price.toFixed(2),
        size: l.size,
        side: 'bid' as const,
      })),
    ...activeBook.asks.slice(0, 15).map((l) => ({
      price: l.price.toFixed(2),
      size: l.size,
      side: 'ask' as const,
    })),
  ];

  return (
    <div className="space-y-4">
      {/* Symbol selector */}
      <div className="flex items-center gap-2">
        {(['ES', 'NQ'] as const).map((sym) => (
          <button
            key={sym}
            onClick={() => setActiveSymbol(sym)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              activeSymbol === sym
                ? 'bg-blue-600 text-white'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {sym}
          </button>
        ))}
        <div className="flex items-center gap-1.5 ml-4">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 live-dot" />
          <span className="text-[10px] text-muted-foreground">
            100ms refresh
          </span>
        </div>
        <div className="ml-auto flex items-center gap-4 text-[11px]">
          <div>
            <span className="text-muted-foreground mr-1">Bid:</span>
            <span className="font-mono-nums text-green-500 font-medium">
              {activeBook.bids[0]?.price.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground mr-1">Ask:</span>
            <span className="font-mono-nums text-red-500 font-medium">
              {activeBook.asks[0]?.price.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground mr-1">Spread:</span>
            <span className="font-mono-nums text-foreground">
              {(activeBook.asks[0]?.price - activeBook.bids[0]?.price).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Order Book Ladder */}
        <Card className="lg:col-span-4 border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              {activeSymbol} Order Book
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrderBookLadder orderBook={activeBook} levels={15} />
          </CardContent>
        </Card>

        {/* Depth Chart */}
        <Card className="lg:col-span-4 border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Depth Visualization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={480}>
              <BarChart
                data={depthData}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="price"
                  type="category"
                  tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)' }}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                <Bar dataKey="size" radius={[0, 3, 3, 0]}>
                  {depthData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        entry.side === 'bid'
                          ? 'rgba(34,197,94,0.4)'
                          : 'rgba(239,68,68,0.4)'
                      }
                      stroke={
                        entry.side === 'bid'
                          ? 'rgba(34,197,94,0.6)'
                          : 'rgba(239,68,68,0.6)'
                      }
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time & Sales */}
        <Card className="lg:col-span-4 border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Time & Sales
              </CardTitle>
              <span className="text-[10px] text-muted-foreground font-mono-nums">
                {tape.length} prints
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-0 px-1 mb-1 text-[9px] text-muted-foreground/60 uppercase tracking-wider">
              <span>Time</span>
              <span className="text-right">Price</span>
              <span className="text-right">Size</span>
              <span className="text-right">Type</span>
            </div>
            <ScrollArea className="h-[460px]">
              <div className="space-y-0">
                {tape.map((entry) => {
                  const priceColor =
                    entry.side === 'buy'
                      ? 'text-green-500'
                      : 'text-red-500';
                  return (
                    <div
                      key={entry.id}
                      className="grid grid-cols-4 gap-0 px-1 py-[2px] hover:bg-accent/30"
                    >
                      <span className="font-mono-nums text-[10px] text-muted-foreground">
                        {entry.timestamp.toLocaleTimeString('en-US', {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                        .
                        {String(entry.timestamp.getMilliseconds()).padStart(
                          3,
                          '0'
                        )}
                      </span>
                      <span
                        className={`font-mono-nums text-[10px] text-right font-medium ${priceColor}`}
                      >
                        {entry.price.toFixed(2)}
                      </span>
                      <span className="font-mono-nums text-[10px] text-right text-foreground">
                        {entry.size}
                      </span>
                      <span className="text-[10px] text-right">
                        {entry.aggressor ? (
                          <Badge
                            variant="outline"
                            className={`text-[8px] px-1 py-0 ${
                              entry.side === 'buy'
                                ? 'text-green-500 border-green-500/30'
                                : 'text-red-500 border-red-500/30'
                            }`}
                          >
                            {entry.side === 'buy' ? 'LIFT' : 'HIT'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground/60 text-[9px]">
                            passive
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
