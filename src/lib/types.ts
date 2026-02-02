export type FlowType = 'clean' | 'suspicious' | 'toxic';
export type Side = 'buy' | 'sell';

export interface Position {
  symbol: string;
  qty: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  flowType: FlowType;
}

export interface Trade {
  id: string;
  timestamp: Date;
  symbol: string;
  side: Side;
  qty: number;
  price: number;
  pnl: number;
  flowType: FlowType;
  toxicityScore: number;
}

export interface OrderBookLevel {
  price: number;
  size: number;
  orders: number;
}

export interface OrderBook {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  imbalance: number;
  timestamp: Date;
}

export interface FlowEvent {
  id: string;
  timestamp: Date;
  symbol: string;
  flowType: FlowType;
  confidence: number;
  reason: string;
  size: number;
  price: number;
  side: Side;
}

export interface RiskMetrics {
  currentPositionSize: number;
  maxPositionSize: number;
  dailyPnl: number;
  dailyLossLimit: number;
  maxDrawdown: number;
  currentDrawdown: number;
  circuitBreakerActive: boolean;
  circuitBreakerCountdown: number;
  exposureBySymbol: { symbol: string; exposure: number; maxExposure: number }[];
}

export interface PerformanceData {
  equityCurve: { timestamp: Date; pnl: number }[];
  tradeDistribution: { range: string; count: number; type: 'win' | 'loss' }[];
  pnlByFlowType: {
    flowType: FlowType;
    totalPnl: number;
    winRate: number;
    tradeCount: number;
  }[];
  hourlyPerformance: { hour: number; day: string; pnl: number }[];
}

export interface DashboardStats {
  totalPnl: number;
  winRate: number;
  totalTrades: number;
  sharpeRatio: number;
  toxicFlowScore: number;
  avoidedTrades: number;
  estimatedSavings: number;
}

export interface TapeEntry {
  id: string;
  timestamp: Date;
  price: number;
  size: number;
  side: Side;
  aggressor: boolean;
}

export interface PricePoint {
  timestamp: Date;
  price: number;
}
