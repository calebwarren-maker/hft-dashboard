'use client';

import { FlowEvent } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FlowClassifierProps {
  events: FlowEvent[];
  maxItems?: number;
}

const flowColors = {
  clean: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  suspicious: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' },
  toxic: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
};

export function FlowClassifier({ events, maxItems = 30 }: FlowClassifierProps) {
  const display = events.slice(0, maxItems);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 pr-3">
        {display.map((event) => {
          const colors = flowColors[event.flowType];
          return (
            <div
              key={event.id}
              className={`flex items-start gap-2 rounded border p-2 ${colors.bg} ${colors.border}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[9px] px-1.5 py-0 ${colors.text} border-current`}
                  >
                    {event.flowType.toUpperCase()}
                  </Badge>
                  <span className="text-[11px] font-medium text-foreground">
                    {event.symbol}
                  </span>
                  <span
                    className={`text-[11px] ${
                      event.side === 'buy' ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {event.side.toUpperCase()} {event.size}
                  </span>
                  <span className="font-mono-nums text-[11px] text-muted-foreground">
                    @{event.price.toFixed(2)}
                  </span>
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground truncate">
                  {event.reason}
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="font-mono-nums text-[10px] text-muted-foreground">
                  {event.timestamp.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
                <span
                  className={`font-mono-nums text-[10px] ${colors.text}`}
                >
                  {(event.confidence * 100).toFixed(0)}% conf
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
