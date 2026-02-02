'use client';

import { useEffect, useRef } from 'react';

interface ToxicFlowGaugeProps {
  score: number; // 0-100
  size?: number;
}

export function ToxicFlowGauge({ score, size = 180 }: ToxicFlowGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    score < 40 ? 'LOW RISK' : score < 65 ? 'ELEVATED' : 'HIGH RISK';
  const labelColor =
    score < 40 ? 'text-green-500' : score < 65 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="block"
      />
      <span className={`mt-1 text-xs font-medium tracking-wider ${labelColor}`}>
        {label}
      </span>
    </div>
  );
}
