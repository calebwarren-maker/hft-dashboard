'use client';

import { OrderBook } from '@/lib/types';

interface OrderBookLadderProps {
  orderBook: OrderBook;
  levels?: number;
}

export function OrderBookLadder({
  orderBook,
  levels = 15,
}: OrderBookLadderProps) {
  const { bids, asks, imbalance } = orderBook;
  const displayAsks = asks.slice(0, levels).reverse();
  const displayBids = bids.slice(0, levels);

  const maxSize = Math.max(
    ...bids.map((l) => l.size),
    ...asks.map((l) => l.size)
  );

  const imbalanceColor =
    imbalance > 0.1
      ? 'text-green-500'
      : imbalance < -0.1
      ? 'text-red-500'
      : 'text-muted-foreground';

  return (
    <div className="text-[11px]">
      {/* Imbalance bar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
          Imbalance
        </span>
        <span className={`font-mono-nums font-medium ${imbalanceColor}`}>
          {imbalance > 0 ? '+' : ''}
          {(imbalance * 100).toFixed(1)}%
        </span>
      </div>

      {/* Header */}
      <div className="grid grid-cols-4 gap-0 px-1 mb-1 text-[10px] text-muted-foreground/60 uppercase tracking-wider">
        <span>Orders</span>
        <span className="text-right">Size</span>
        <span className="text-right">Price</span>
        <span className="text-right">Size</span>
      </div>

      {/* Asks (reversed so lowest ask is at bottom) */}
      {displayAsks.map((level, i) => (
        <div
          key={`ask-${i}`}
          className="grid grid-cols-4 gap-0 px-1 py-[2px] relative"
        >
          <div
            className="absolute right-0 top-0 h-full depth-bar-ask"
            style={{ width: `${(level.size / maxSize) * 50}%` }}
          />
          <span className="font-mono-nums text-muted-foreground relative z-10">
            {level.orders}
          </span>
          <span className="font-mono-nums text-right text-red-400/80 relative z-10">
            {level.size}
          </span>
          <span className="font-mono-nums text-right text-red-500 font-medium relative z-10">
            {level.price.toFixed(2)}
          </span>
          <span className="relative z-10" />
        </div>
      ))}

      {/* Spread */}
      <div className="grid grid-cols-4 gap-0 px-1 py-1 border-y border-border/50 my-0.5">
        <span />
        <span />
        <span className="text-right text-[10px] text-muted-foreground font-mono-nums">
          Spread: {(asks[0].price - bids[0].price).toFixed(2)}
        </span>
        <span />
      </div>

      {/* Bids */}
      {displayBids.map((level, i) => (
        <div
          key={`bid-${i}`}
          className="grid grid-cols-4 gap-0 px-1 py-[2px] relative"
        >
          <div
            className="absolute left-0 top-0 h-full depth-bar-bid"
            style={{ width: `${(level.size / maxSize) * 50}%` }}
          />
          <span className="font-mono-nums text-muted-foreground relative z-10">
            {level.orders}
          </span>
          <span className="relative z-10" />
          <span className="font-mono-nums text-right text-green-500 font-medium relative z-10">
            {level.price.toFixed(2)}
          </span>
          <span className="font-mono-nums text-right text-green-400/80 relative z-10">
            {level.size}
          </span>
        </div>
      ))}
    </div>
  );
}
