'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  color?: 'default' | 'green' | 'red' | 'yellow' | 'blue';
  large?: boolean;
}

const colorMap = {
  default: 'text-foreground',
  green: 'text-green-500',
  red: 'text-red-500',
  yellow: 'text-yellow-500',
  blue: 'text-blue-400',
};

export function StatCard({ label, value, subValue, color = 'default', large }: StatCardProps) {
  return (
    <Card className="border-border bg-card card-flat">
      <CardContent className="p-3">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div
          className={cn(
            'font-mono-nums font-bold mt-1',
            colorMap[color],
            large ? 'text-2xl' : 'text-lg'
          )}
        >
          {value}
        </div>
        {subValue && (
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {subValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
