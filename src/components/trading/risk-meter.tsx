'use client';

interface RiskMeterProps {
  label: string;
  current: number;
  max: number;
  unit?: string;
  inverted?: boolean; // true means lower is worse (e.g., loss limit)
  showPercent?: boolean;
}

export function RiskMeter({
  label,
  current,
  max,
  unit = '',
  inverted = false,
  showPercent = true,
}: RiskMeterProps) {
  const ratio = Math.abs(current) / Math.abs(max);
  const pct = Math.min(ratio * 100, 100);

  let barColor = 'bg-green-500';
  if (pct > 80) barColor = 'bg-red-500';
  else if (pct > 60) barColor = 'bg-yellow-500';

  if (inverted) {
    barColor = pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-yellow-500' : 'bg-green-500';
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <span className="font-mono-nums text-[11px] text-foreground">
          {unit === '$'
            ? `$${Math.abs(current).toLocaleString()}`
            : `${current}${unit}`}{' '}
          <span className="text-muted-foreground">
            / {unit === '$' ? `$${Math.abs(max).toLocaleString()}` : `${max}${unit}`}
          </span>
          {showPercent && (
            <span className="ml-1 text-muted-foreground/60">
              ({pct.toFixed(0)}%)
            </span>
          )}
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
