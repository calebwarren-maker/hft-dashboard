'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface TopbarProps {
  totalPnl: number;
}

export function Topbar({ totalPnl }: TopbarProps) {
  const [time, setTime] = useState<string>('');
  const [connected] = useState(true);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) +
          '.' +
          String(now.getMilliseconds()).padStart(3, '0')
      );
    };
    tick();
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, []);

  const pnlColor =
    totalPnl > 0 ? 'text-green-500' : totalPnl < 0 ? 'text-red-500' : 'text-muted-foreground';
  const pnlSign = totalPnl >= 0 ? '+' : '';

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-4">
        <span className="font-mono-nums text-xs text-muted-foreground">
          {time}
        </span>
        <div className="flex items-center gap-1.5">
          {connected ? (
            <Wifi className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <WifiOff className="h-3.5 w-3.5 text-red-500" />
          )}
          <span
            className={`text-xs ${
              connected ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {connected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Day P&L
        </span>
        <span className={`font-mono-nums text-lg font-bold ${pnlColor}`}>
          {pnlSign}${Math.abs(totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </header>
  );
}
