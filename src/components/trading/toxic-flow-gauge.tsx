'use client';

// Using canvas instead of SVG for performance
// Tried recharts gauge but re-renders were killing frame rate at 500ms ticks

import { useEffect, useRef, useState, useCallback } from 'react';

interface ToxicFlowGaugeProps {
  score: number; // 0-100
  size?: number;
}

export function ToxicFlowGauge({ score, size = 180 }: ToxicFlowGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Easter egg: rapid-click the gauge
  const handleClick = useCallback(() => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        console.log("🧪 Toxic flow detected: probably my code");
        // Reset after triggering
        setTimeout(() => setClickCount(0), 2000);
        return next;
      }
      return next;
    });

    // Reset click counter after 1.5s of no clicks
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => setClickCount(0), 1500);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 16;
    const lineWidth = 10;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Background arc
    const startAngle = 0.75 * Math.PI;
    const endAngle = 2.25 * Math.PI;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Score arc
    const scoreAngle = startAngle + (score / 100) * (endAngle - startAngle);
    const gradient = ctx.createLinearGradient(0, size, size, 0);
    if (score < 40) {
      gradient.addColorStop(0, '#22c55e');
      gradient.addColorStop(1, '#86efac');
    } else if (score < 65) {
      gradient.addColorStop(0, '#eab308');
      gradient.addColorStop(1, '#fde047');
    } else {
      gradient.addColorStop(0, '#ef4444');
      gradient.addColorStop(1, '#fca5a5');
    }

    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, scoreAngle);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Center text
    ctx.fillStyle =
      score < 40 ? '#22c55e' : score < 65 ? '#eab308' : '#ef4444';
    ctx.font = `bold ${size * 0.2}px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${score.toFixed(1)}%`, cx, cy - 4);

    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = `${size * 0.065}px 'Inter', sans-serif`;
    ctx.fillText('TOXIC FLOW', cx, cy + size * 0.16);
  }, [score, size]);

  const label =
    score < 25
      ? 'CLEAN \u2713'
      : score < 50
      ? 'ELEVATED \u26A0'
      : score < 75
      ? 'SPICY \u26A1'
      : 'NOPE \uD83D\uDD25';
  const labelColor =
    score < 25
      ? 'text-green-500'
      : score < 50
      ? 'text-yellow-500'
      : score < 75
      ? 'text-orange-500'
      : 'text-red-500';

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{ width: size, height: size, cursor: 'default' }}
        className="block"
      />
      <span className={`mt-1 text-xs font-medium tracking-wider ${labelColor}`}>
        {clickCount >= 5 ? 'Still toxic \uD83D\uDE05' : label}
      </span>
    </div>
  );
}
