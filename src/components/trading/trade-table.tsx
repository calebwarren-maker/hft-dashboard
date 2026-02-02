'use client';

import { Trade } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TradeTableProps {
  trades: Trade[];
  maxRows?: number;
  compact?: boolean;
}

const flowBadgeClass = {
  clean: 'bg-green-500/15 text-green-500 border-green-500/30',
  suspicious: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30',
  toxic: 'bg-red-500/15 text-red-500 border-red-500/30',
};

export function TradeTable({ trades, maxRows = 20, compact = false }: TradeTableProps) {
  const displayTrades = trades.slice(0, maxRows);

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-[11px] h-8">Time</TableHead>
            <TableHead className="text-[11px] h-8">Symbol</TableHead>
            <TableHead className="text-[11px] h-8">Side</TableHead>
            <TableHead className="text-[11px] h-8 text-right">Qty</TableHead>
            <TableHead className="text-[11px] h-8 text-right">Price</TableHead>
            <TableHead className="text-[11px] h-8 text-right">P&L</TableHead>
            {!compact && (
              <TableHead className="text-[11px] h-8">Flow</TableHead>
            )}
            {!compact && (
              <TableHead className="text-[11px] h-8 text-right">
                Toxicity
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayTrades.map((trade) => {
            const pnlColor =
              trade.pnl > 0
                ? 'text-green-500'
                : trade.pnl < 0
                ? 'text-red-500'
                : 'text-muted-foreground';
            const sideColor =
              trade.side === 'buy' ? 'text-green-500' : 'text-red-500';

            return (
              <TableRow
                key={trade.id}
                className="border-border/50 hover:bg-accent/30"
              >
                <TableCell className="font-mono-nums text-[11px] py-1.5 text-muted-foreground">
                  {trade.timestamp.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </TableCell>
                <TableCell className="text-[11px] py-1.5 font-medium">
                  {trade.symbol}
                </TableCell>
                <TableCell
                  className={`text-[11px] py-1.5 font-medium uppercase ${sideColor}`}
                >
                  {trade.side}
                </TableCell>
                <TableCell className="font-mono-nums text-[11px] py-1.5 text-right">
                  {trade.qty}
                </TableCell>
                <TableCell className="font-mono-nums text-[11px] py-1.5 text-right">
                  {trade.price.toFixed(2)}
                </TableCell>
                <TableCell
                  className={`font-mono-nums text-[11px] py-1.5 text-right font-medium ${pnlColor}`}
                >
                  {trade.pnl >= 0 ? '+' : ''}$
                  {Math.abs(trade.pnl).toFixed(2)}
                </TableCell>
                {!compact && (
                  <TableCell className="py-1.5">
                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1.5 py-0 ${flowBadgeClass[trade.flowType]}`}
                    >
                      {trade.flowType.toUpperCase()}
                    </Badge>
                  </TableCell>
                )}
                {!compact && (
                  <TableCell className="font-mono-nums text-[11px] py-1.5 text-right text-muted-foreground">
                    {(trade.toxicityScore * 100).toFixed(0)}%
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
