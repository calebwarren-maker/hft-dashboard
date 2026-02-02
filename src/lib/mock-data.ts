import {
  Position,
  Trade,
  OrderBook,
  OrderBookLevel,
  FlowEvent,
  FlowType,
  Side,
  DashboardStats,
  RiskMetrics,
  TapeEntry,
  PricePoint,
} from './types';

// ─── Helpers ──────────────────────────────────────────────────────
let tradeCounter = 1000;
let flowEventCounter = 5000;
let tapeCounter = 9000;

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Symbols ──────────────────────────────────────────────────────
const SYMBOLS = ['ES', 'NQ'] as const;
const ES_MID = 5525;
const NQ_MID = 19800;
const ES_TICK = 0.25;
const NQ_TICK = 0.25;

function midPrice(symbol: string): number {
  return symbol === 'ES' ? ES_MID : NQ_MID;
}

function tickSize(symbol: string): number {
  return symbol === 'ES' ? ES_TICK : NQ_TICK;
}

function pointValue(symbol: string): number {
  return symbol === 'ES' ? 50 : 20; // $50 per ES point, $20 per NQ point
}

// ─── Positions ────────────────────────────────────────────────────
let currentPositions: Position[] = [
  {
    symbol: 'ES',
    qty: 2,
    entryPrice: 5522.75,
    currentPrice: 5524.50,
    pnl: 175.00,
    flowType: 'clean',
  },
  {
    symbol: 'NQ',
    qty: -1,
    entryPrice: 19825.00,
    currentPrice: 19812.50,
    pnl: 250.00,
    flowType: 'suspicious',
  },
];

export function getPositions(): Position[] {
  return currentPositions.map((pos) => {
    const drift = rand(-2, 2) * tickSize(pos.symbol);
    const newPrice =
      Math.round((pos.currentPrice + drift) / tickSize(pos.symbol)) *
      tickSize(pos.symbol);
    const pnl =
      (newPrice - pos.entryPrice) * pos.qty * pointValue(pos.symbol);
    return { ...pos, currentPrice: newPrice, pnl: Math.round(pnl * 100) / 100 };
  });
}

// ─── Trades ───────────────────────────────────────────────────────
const tradeHistory: Trade[] = [];

function generateFlowType(): FlowType {
  const r = Math.random();
  if (r < 0.55) return 'clean';
  if (r < 0.85) return 'suspicious';
  return 'toxic';
}

function generateTrade(): Trade {
  const symbol = pick([...SYMBOLS]);
  const mid = midPrice(symbol);
  const price =
    Math.round((mid + rand(-10, 10)) / tickSize(symbol)) * tickSize(symbol);
  const flowType = generateFlowType();
  const side: Side = Math.random() > 0.5 ? 'buy' : 'sell';
  const qty = randInt(1, 5);
  const pnlMultiplier =
    flowType === 'clean' ? rand(0.4, 1.5) : flowType === 'suspicious' ? rand(-0.8, 0.6) : rand(-1.5, -0.1);
  const pnl = Math.round(pnlMultiplier * qty * pointValue(symbol) * rand(0.5, 3) * 100) / 100;

  const trade: Trade = {
    id: `T${++tradeCounter}`,
    timestamp: new Date(),
    symbol,
    side,
    qty,
    price,
    pnl,
    flowType,
    toxicityScore:
      flowType === 'clean'
        ? rand(0.05, 0.3)
        : flowType === 'suspicious'
        ? rand(0.3, 0.65)
        : rand(0.65, 0.98),
  };

  tradeHistory.unshift(trade);
  if (tradeHistory.length > 200) tradeHistory.pop();

  return trade;
}

// seed initial trades
for (let i = 0; i < 50; i++) {
  const t = generateTrade();
  t.timestamp = new Date(Date.now() - (50 - i) * 60000);
}

export function getTrades(): Trade[] {
  return [...tradeHistory];
}

export function addNewTrade(): Trade {
  return generateTrade();
}

// ─── Order Book ───────────────────────────────────────────────────
export function generateOrderBook(symbol: string = 'ES'): OrderBook {
  const mid = midPrice(symbol);
  const tick = tickSize(symbol);
  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];

  for (let i = 0; i < 20; i++) {
    const bidPrice = Math.round((mid - (i + 1) * tick) * 100) / 100;
    const askPrice = Math.round((mid + (i + 1) * tick) * 100) / 100;

    const distFactor = 1 + i * 0.15;
    bids.push({
      price: bidPrice,
      size: randInt(Math.floor(5 * distFactor), Math.floor(80 * distFactor)),
      orders: randInt(2, 30 + i * 2),
    });
    asks.push({
      price: askPrice,
      size: randInt(Math.floor(5 * distFactor), Math.floor(80 * distFactor)),
      orders: randInt(2, 30 + i * 2),
    });
  }

  const totalBidSize = bids.reduce((s, l) => s + l.size, 0);
  const totalAskSize = asks.reduce((s, l) => s + l.size, 0);
  const imbalance =
    Math.round(
      ((totalBidSize - totalAskSize) / (totalBidSize + totalAskSize)) * 1000
    ) / 1000;

  return { symbol, bids, asks, imbalance, timestamp: new Date() };
}

// ─── Dashboard Stats ──────────────────────────────────────────────
let statAccumulator = {
  totalPnl: 4250.0,
  totalTrades: 47,
  wins: 31,
  avoidedTrades: 18,
  estimatedSavings: 12400.0,
  toxicFlowBase: 38,
};

// Cache the last computed stats so multiple callers get the same snapshot
let cachedStats: DashboardStats | null = null;
let lastStatsTick = 0;

export function getDashboardStats(): DashboardStats {
  const now = Date.now();
  // Only mutate accumulator at most once per 400ms
  if (cachedStats && now - lastStatsTick < 400) {
    return cachedStats;
  }
  lastStatsTick = now;

  statAccumulator.totalPnl += rand(-50, 80);
  statAccumulator.totalPnl = Math.round(statAccumulator.totalPnl * 100) / 100;

  const toxicSpike = Math.random() < 0.05; // 5% chance of spike
  const toxicFlowScore = toxicSpike
    ? rand(70, 92)
    : statAccumulator.toxicFlowBase + rand(-8, 8);

  cachedStats = {
    totalPnl: statAccumulator.totalPnl,
    winRate:
      Math.round(
        (statAccumulator.wins / statAccumulator.totalTrades) * 10000
      ) / 100,
    totalTrades: statAccumulator.totalTrades,
    sharpeRatio: Math.round(rand(1.8, 3.2) * 100) / 100,
    toxicFlowScore: Math.round(Math.max(0, Math.min(100, toxicFlowScore)) * 10) / 10,
    avoidedTrades: statAccumulator.avoidedTrades,
    estimatedSavings: statAccumulator.estimatedSavings,
  };
  return cachedStats;
}

export function incrementTrade(won: boolean): void {
  statAccumulator.totalTrades++;
  if (won) statAccumulator.wins++;
}

export function incrementAvoidedTrade(): void {
  statAccumulator.avoidedTrades++;
  statAccumulator.estimatedSavings += rand(200, 800);
  statAccumulator.estimatedSavings =
    Math.round(statAccumulator.estimatedSavings * 100) / 100;
}

// ─── Flow Events ──────────────────────────────────────────────────
const flowReasons: Record<FlowType, string[]> = {
  clean: [
    'Normal retail order flow',
    'Consistent with market making',
    'Low latency correlation',
    'Regular limit order placement',
    'Passive queue joining',
  ],
  suspicious: [
    'Unusual order size for time of day',
    'Correlated with news event timing',
    'Rapid order modification pattern',
    'Possible momentum ignition',
    'Layering pattern detected',
  ],
  toxic: [
    'Latency arbitrage signature detected',
    'Informed flow pre-announcement',
    'Spoofing pattern confirmed',
    'Adversarial HFT counter-signal',
    'Dark pool print leak exploitation',
    'Cross-venue statistical arb',
  ],
};

const flowHistory: FlowEvent[] = [];

export function generateFlowEvent(): FlowEvent {
  const flowType = generateFlowType();
  const symbol = pick([...SYMBOLS]);
  const mid = midPrice(symbol);

  const event: FlowEvent = {
    id: `F${++flowEventCounter}`,
    timestamp: new Date(),
    symbol,
    flowType,
    confidence: flowType === 'clean' ? rand(0.7, 0.98) : flowType === 'suspicious' ? rand(0.45, 0.75) : rand(0.75, 0.99),
    reason: pick(flowReasons[flowType]),
    size: randInt(1, 50) * (symbol === 'ES' ? 1 : 1),
    price: Math.round((mid + rand(-5, 5)) / tickSize(symbol)) * tickSize(symbol),
    side: Math.random() > 0.5 ? 'buy' : 'sell',
  };

  flowHistory.unshift(event);
  if (flowHistory.length > 100) flowHistory.pop();

  return event;
}

// Seed initial flow events
for (let i = 0; i < 30; i++) {
  const e = generateFlowEvent();
  e.timestamp = new Date(Date.now() - (30 - i) * 30000);
}

export function getFlowEvents(): FlowEvent[] {
  return [...flowHistory];
}

// ─── Risk Metrics ─────────────────────────────────────────────────
export function getRiskMetrics(): RiskMetrics {
  const dailyPnl = statAccumulator.totalPnl;
  return {
    currentPositionSize: currentPositions.reduce(
      (s, p) => s + Math.abs(p.qty),
      0
    ),
    maxPositionSize: 10,
    dailyPnl,
    dailyLossLimit: -5000,
    maxDrawdown: -2800,
    currentDrawdown: dailyPnl < 0 ? dailyPnl : rand(-400, 0),
    circuitBreakerActive: false,
    circuitBreakerCountdown: 0,
    exposureBySymbol: [
      {
        symbol: 'ES',
        exposure: Math.abs(currentPositions.find((p) => p.symbol === 'ES')?.qty ?? 0) * 5525 * 50,
        maxExposure: 5 * 5525 * 50,
      },
      {
        symbol: 'NQ',
        exposure: Math.abs(currentPositions.find((p) => p.symbol === 'NQ')?.qty ?? 0) * 19800 * 20,
        maxExposure: 3 * 19800 * 20,
      },
    ],
  };
}

// ─── Tape (Time & Sales) ─────────────────────────────────────────
export function generateTapeEntry(symbol: string = 'ES'): TapeEntry {
  const mid = midPrice(symbol);
  const tick = tickSize(symbol);
  const side: Side = Math.random() > 0.5 ? 'buy' : 'sell';
  const price =
    Math.round((mid + rand(-3, 3)) / tick) * tick;

  return {
    id: `TS${++tapeCounter}`,
    timestamp: new Date(),
    price,
    size: randInt(1, 25),
    side,
    aggressor: Math.random() > 0.3,
  };
}

// ─── Equity Curve ─────────────────────────────────────────────────
export function generateEquityCurve(days: number = 7): { timestamp: Date; pnl: number }[] {
  const points: { timestamp: Date; pnl: number }[] = [];
  let cumPnl = 0;
  const now = Date.now();
  const startTime = now - days * 24 * 60 * 60 * 1000;
  const pointsPerDay = 78; // ~5min intervals during 6.5h trading day

  for (let d = 0; d < days; d++) {
    const dayStart = startTime + d * 24 * 60 * 60 * 1000 + 9.5 * 60 * 60 * 1000;
    for (let p = 0; p < pointsPerDay; p++) {
      const ts = dayStart + p * 5 * 60 * 1000;
      cumPnl += rand(-150, 200);
      cumPnl = Math.round(cumPnl * 100) / 100;
      points.push({ timestamp: new Date(ts), pnl: cumPnl });
    }
  }

  return points;
}

// ─── Trade Distribution ───────────────────────────────────────────
export function generateTradeDistribution(): {
  range: string;
  count: number;
  type: 'win' | 'loss';
}[] {
  return [
    { range: '-2000+', count: randInt(1, 3), type: 'loss' },
    { range: '-1500', count: randInt(2, 5), type: 'loss' },
    { range: '-1000', count: randInt(3, 8), type: 'loss' },
    { range: '-500', count: randInt(5, 12), type: 'loss' },
    { range: '-250', count: randInt(4, 10), type: 'loss' },
    { range: '+250', count: randInt(8, 18), type: 'win' },
    { range: '+500', count: randInt(10, 22), type: 'win' },
    { range: '+1000', count: randInt(6, 14), type: 'win' },
    { range: '+1500', count: randInt(3, 7), type: 'win' },
    { range: '+2000+', count: randInt(1, 4), type: 'win' },
  ];
}

// ─── Hourly Heatmap ───────────────────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7am-7pm

export function generateHourlyHeatmap(): {
  hour: number;
  day: string;
  pnl: number;
}[] {
  const data: { hour: number; day: string; pnl: number }[] = [];
  for (const day of DAYS) {
    for (const hour of HOURS) {
      // Morning and close tend to be better
      const timeBias =
        hour <= 10 || hour >= 15 ? rand(100, 500) : rand(-200, 300);
      data.push({
        hour,
        day,
        pnl: Math.round(timeBias),
      });
    }
  }
  return data;
}

// ─── Price Series (Market Context) ────────────────────────────────
const priceSeries: Record<string, PricePoint[]> = {};

function snapToTick(price: number, tick: number): number {
  return Math.round(price / tick) * tick;
}

function seedPriceSeries(symbol: string): PricePoint[] {
  const mid = midPrice(symbol);
  const tick = tickSize(symbol);
  let price = snapToTick(mid + rand(-10, 10), tick);
  const points: PricePoint[] = [];
  const now = Date.now();

  for (let i = 29; i >= 0; i--) {
    // Realistic 1-min bar: ~0.25-0.75 point drift, mean-reverting
    price = snapToTick(price + rand(-0.75, 0.75), tick);
    points.push({ timestamp: new Date(now - i * 60000), price });
  }
  return points;
}

export function getPriceSeries(symbol: string): PricePoint[] {
  if (!priceSeries[symbol]) {
    priceSeries[symbol] = seedPriceSeries(symbol);
  }
  return [...priceSeries[symbol]];
}

export function tickPriceSeries(symbol: string): PricePoint[] {
  if (!priceSeries[symbol]) {
    priceSeries[symbol] = seedPriceSeries(symbol);
  }
  const series = priceSeries[symbol];
  const last = series[series.length - 1];
  const tick = tickSize(symbol);
  const next: PricePoint = {
    timestamp: new Date(),
    price: snapToTick(last.price + rand(-0.75, 0.75), tick),
  };
  series.push(next);
  if (series.length > 30) series.shift();
  return [...series];
}

// ─── Best/Worst Trades ────────────────────────────────────────────
export function getBestWorstTrades(count: number = 10): {
  best: Trade[];
  worst: Trade[];
} {
  const sorted = [...tradeHistory].sort((a, b) => b.pnl - a.pnl);
  return {
    best: sorted.slice(0, count),
    worst: sorted.slice(-count).reverse(),
  };
}
