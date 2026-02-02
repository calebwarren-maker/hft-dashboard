'use client';

import { Position } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface PositionCardProps {
  position: Position;
}

export function PositionCard({ position }: PositionCardProps) {
  const { symbol, qty, entryPrice, currentPrice, pnl, flowType } = position;
  const isLong = qty > 0;
  const pnlColor = pnl > 0 ? 'pnl-positive' : pnl < 0 ? 'pnl-negative' : 'pnl-zero';
  const sideColor = isLong ? 'text-green-500' : 'text-red-500';
  const flowColor =
    flowType === 'clean'
      ? 'flow-bg-clean'
      : flowType === 'suspicious'
      ? 'flow-bg-suspicious'
      : 'flow-bg-toxic';

  return (
    <div className={`rounded-md border p-3 ${flowColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">{symbol}</span>
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 ${sideColor} border-current`}
          >
            {isLong ? 'LONG' : 'SHORT'} {Math.abs(qty)}
          </Badge>
        </div>
        <span className={`font-mono-nums text-sm font-bold ${pnlColor}`}>
          {pnl >= 0 ? '+' : ''}${pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <div>
          <span className="mr-1">Entry:</span>
          <span className="font-mono-nums text-foreground">
            {entryPrice.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="mr-1">Mark:</span>
          <span className="font-mono-nums text-foreground">
            {currentPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
