export type TradingMode = "conservative" | "normal" | "aggressive";
export type StrategyMode = "auto" | "assisted" | "alert";
export type Decision = "auto-ready" | "watch" | "blocked" | "portfolio-review";
export type Direction = "LONG" | "SHORT" | "HOLD" | "EXIT" | "NONE";

export type RiskSettings = {
  capital: number;
  dailyLossLimitPct: number;
  softStopPct: number;
  maxLossPerTrade: number;
  mode: TradingMode;
  minPriceVolumeScore: number;
  autoTrading: boolean;
  lotLimits: Record<string, number>;
};

export type MarketSnapshot = {
  timestamp: string;
  regime: "risk-on" | "neutral" | "risk-cautious" | "risk-off" | "event-risk";
  dxy: number;
  brent: number;
  us10y: number;
  realYield10y: number;
  jgb10y: number;
  move: number;
  vix: number;
  indiaVix: number;
  giftNifty: number;
  usdinr: number;
  comexGold: number;
  comexSilver: number;
  goldSilverRatio: number;
  fiiFlowCr: number;
  diiFlowCr: number;
  niftyBreadth: number;
  eventRisk: "clear" | "caution" | "blocked";
};

export type InstrumentSnapshot = {
  symbol: string;
  label: string;
  ltp: number;
  vwap: number;
  rvol: number;
  atr: number;
  trend: "up" | "down" | "sideways";
  openingRange: string;
  priceVolumeScore: number;
  spreadScore: number;
  contract: string;
};

export type StrategySignal = {
  id: string;
  strategyId: string;
  strategyName: string;
  mode: StrategyMode;
  instrument: string;
  direction: Direction;
  action: string;
  entry: string;
  stopLoss: number | null;
  target: number | null;
  macroScore: number;
  priceVolumeScore: number;
  riskScore: number;
  executionScore: number;
  finalScore: number;
  decision: Decision;
  recommendedLots: number;
  riskAmount: number;
  weights: {
    priceVolume: number;
    macro: number;
    risk: number;
    execution: number;
  };
  reason: string;
  blockers: string[];
};

export type PortfolioHolding = {
  symbol: string;
  strategyTag: "Dhapanya" | "Dividend" | "Zanger" | "Neutral";
  qty: number;
  invested: number;
  currentValue: number;
  pnlPct: number;
  recommendation: "Add" | "Hold" | "Trim" | "Exit Watch";
  note: string;
};

export const defaultRiskSettings: RiskSettings = {
  capital: 1000000,
  dailyLossLimitPct: 5,
  softStopPct: 3,
  maxLossPerTrade: 10000,
  mode: "normal",
  minPriceVolumeScore: 60,
  autoTrading: false,
  lotLimits: {
    CRUDE: 1,
    GOLD: 1,
    SILVER: 1,
    USDINR: 50,
    NIFTY: 1,
    MIDCPNIFTY: 1,
  },
};

export const latestSnapshot: MarketSnapshot = {
  timestamp: "2026-05-04T09:30:00+05:30",
  regime: "risk-cautious",
  dxy: 98.23,
  brent: 111.78,
  us10y: 4.62,
  realYield10y: 2.18,
  jgb10y: 2.51,
  move: 70.41,
  vix: 18.2,
  indiaVix: 13.8,
  giftNifty: 24680,
  usdinr: 94.91,
  comexGold: 3450,
  comexSilver: 75.2,
  goldSilverRatio: 45.9,
  fiiFlowCr: -2100,
  diiFlowCr: 1850,
  niftyBreadth: 47,
  eventRisk: "caution",
};

export const instruments: InstrumentSnapshot[] = [
  {
    symbol: "USDINR",
    label: "USDINR Fut",
    ltp: 94.94,
    vwap: 95.01,
    rvol: 1.6,
    atr: 0.22,
    trend: "down",
    openingRange: "94.88 - 95.08",
    priceVolumeScore: 72,
    spreadScore: 88,
    contract: "Current-month futures",
  },
  {
    symbol: "GOLD",
    label: "Gold Fut",
    ltp: 73120,
    vwap: 72980,
    rvol: 1.8,
    atr: 420,
    trend: "up",
    openingRange: "72620 - 73050",
    priceVolumeScore: 78,
    spreadScore: 82,
    contract: "Current-month futures",
  },
  {
    symbol: "SILVER",
    label: "Silver Fut",
    ltp: 91250,
    vwap: 91020,
    rvol: 1.4,
    atr: 720,
    trend: "up",
    openingRange: "90480 - 91320",
    priceVolumeScore: 64,
    spreadScore: 76,
    contract: "Current-month futures",
  },
  {
    symbol: "CRUDE",
    label: "Crude Fut",
    ltp: 9340,
    vwap: 9385,
    rvol: 1.2,
    atr: 118,
    trend: "sideways",
    openingRange: "9290 - 9418",
    priceVolumeScore: 54,
    spreadScore: 72,
    contract: "Current-month futures",
  },
  {
    symbol: "NIFTY",
    label: "Nifty Fut",
    ltp: 24590,
    vwap: 24620,
    rvol: 1.1,
    atr: 132,
    trend: "sideways",
    openingRange: "24540 - 24690",
    priceVolumeScore: 58,
    spreadScore: 84,
    contract: "Current-month futures",
  },
  {
    symbol: "MIDCPNIFTY",
    label: "MIDCPNIFTY Fut",
    ltp: 13250,
    vwap: 13210,
    rvol: 1.5,
    atr: 104,
    trend: "up",
    openingRange: "13140 - 13270",
    priceVolumeScore: 69,
    spreadScore: 78,
    contract: "Current-month futures",
  },
];

const rawSignals = [
  {
    id: "dhapanya-hedge",
    strategyId: "dhapanya",
    strategyName: "Dhapanya Strategy",
    mode: "assisted" as StrategyMode,
    instrument: "NIFTY",
    direction: "SHORT" as Direction,
    action: "Portfolio hedge watch",
    entry: "Below 24,540 with breadth under 42%",
    stopLoss: 24735,
    target: 24220,
    macroScore: 74,
    riskScore: 76,
    reason: "Brent above the equity comfort zone and JGB yield stress justify hedge readiness, but price-volume is not clean enough yet.",
  },
  {
    id: "usdinr-vulture",
    strategyId: "usdinr",
    strategyName: "USDINR Vulture",
    mode: "auto" as StrategyMode,
    instrument: "USDINR",
    direction: "SHORT" as Direction,
    action: "Sell USDINR futures",
    entry: "94.90 - 95.05",
    stopLoss: 95.18,
    target: 94.42,
    macroScore: 68,
    riskScore: 82,
    reason: "Price rejected VWAP after an overbought spike. Brent remains a caution flag, so size must be risk-capped.",
  },
  {
    id: "silver-game-gold",
    strategyId: "silver-game",
    strategyName: "Silver Game",
    mode: "auto" as StrategyMode,
    instrument: "GOLD",
    direction: "LONG" as Direction,
    action: "Buy Gold futures",
    entry: "Above 73,050 hold",
    stopLoss: 72720,
    target: 73980,
    macroScore: 78,
    riskScore: 84,
    reason: "Gold is above VWAP with stronger RVOL while real yields are not accelerating. Macro permission is supportive.",
  },
  {
    id: "dividend-vulture",
    strategyId: "dividend-circuit",
    strategyName: "Dividend + Upper Circuit",
    mode: "alert" as StrategyMode,
    instrument: "DELIVERY",
    direction: "HOLD" as Direction,
    action: "Scan delivery opportunities",
    entry: "Alert only",
    stopLoss: null,
    target: null,
    macroScore: 46,
    riskScore: 70,
    reason: "Risk governor is cautious. Fresh delivery buys should wait for deeper dividend-adjusted panic zones.",
  },
  {
    id: "zanger-momentum",
    strategyId: "zanger",
    strategyName: "Dan Zanger Opportunities",
    mode: "alert" as StrategyMode,
    instrument: "MIDCPNIFTY",
    direction: "LONG" as Direction,
    action: "Momentum alert only",
    entry: "Breakout holds with RVOL > 1.5",
    stopLoss: 13130,
    target: 13480,
    macroScore: 42,
    riskScore: 72,
    reason: "Midcap tape is resilient, but macro breadth is mixed. Alert only until breadth expands.",
  },
];

export const portfolioHoldings: PortfolioHolding[] = [
  {
    symbol: "CYIENTDLM",
    strategyTag: "Dhapanya",
    qty: 120,
    invested: 81240,
    currentValue: 93600,
    pnlPct: 15.2,
    recommendation: "Hold",
    note: "Order-book theme intact; trim only if market breadth breaks.",
  },
  {
    symbol: "PARAS",
    strategyTag: "Zanger",
    qty: 70,
    invested: 74760,
    currentValue: 79030,
    pnlPct: 5.7,
    recommendation: "Add",
    note: "Needs RVOL confirmation above pivot. Do not chase beyond 5%.",
  },
  {
    symbol: "SANOFI",
    strategyTag: "Dividend",
    qty: 8,
    invested: 69000,
    currentValue: 66480,
    pnlPct: -3.7,
    recommendation: "Exit Watch",
    note: "Dividend gap fill has not started; monitor floor before adding.",
  },
  {
    symbol: "BEML",
    strategyTag: "Zanger",
    qty: 25,
    invested: 102500,
    currentValue: 111750,
    pnlPct: 9.0,
    recommendation: "Trim",
    note: "Close to first scale-out band; protect half of unrealized gains.",
  },
];

export const performance = {
  account: {
    todayPnl: 18400,
    monthPnl: 72600,
    realizedPnl: 128900,
    openPnl: 22350,
    trades: 42,
    winRate: 57,
    profitFactor: 1.72,
    maxDrawdown: -38400,
  },
  strategies: [
    { name: "USDINR Vulture", signals: 18, trades: 7, skipped: 11, winRate: 57, pnl: 18400 },
    { name: "Silver Game", signals: 15, trades: 5, skipped: 10, winRate: 60, pnl: 26200 },
    { name: "Dhapanya Strategy", signals: 22, trades: 1, skipped: 21, winRate: 100, pnl: 9800 },
    { name: "Dividend + Upper Circuit", signals: 11, trades: 0, skipped: 11, winRate: 0, pnl: 0 },
    { name: "Dan Zanger Opportunities", signals: 30, trades: 0, skipped: 30, winRate: 0, pnl: 0 },
  ],
};

export function evaluateStrategies(settings: RiskSettings): StrategySignal[] {
  return rawSignals.map((signal) => {
    const instrument = instruments.find((item) => item.symbol === signal.instrument);
    const priceVolumeScore = instrument?.priceVolumeScore ?? 0;
    const executionScore = instrument?.spreadScore ?? 65;
    const weights = getDynamicWeights(signal.strategyId, signal.instrument, latestSnapshot.regime, settings.mode);
    const finalScore = Math.round(
      priceVolumeScore * weights.priceVolume +
        signal.macroScore * weights.macro +
        signal.riskScore * weights.risk +
        executionScore * weights.execution,
    );
    const riskAmount = estimateRisk(signal.instrument, signal.stopLoss, instrument?.ltp ?? 0, settings);
    const recommendedLots = getRecommendedLots(signal.instrument, riskAmount, settings);
    const blockers = getBlockers(signal.mode, finalScore, priceVolumeScore, executionScore, recommendedLots, settings);
    const decision = getDecision(signal.mode, finalScore, blockers);

    return {
      ...signal,
      priceVolumeScore,
      executionScore,
      finalScore,
      weights: toPercent(weights),
      recommendedLots,
      riskAmount: Math.round(Math.min(riskAmount, settings.maxLossPerTrade)),
      blockers,
      decision,
    };
  });
}

export function getDailyLossLimit(settings: RiskSettings) {
  return Math.round(settings.capital * (settings.dailyLossLimitPct / 100));
}

export function getSoftStop(settings: RiskSettings) {
  return Math.round(settings.capital * (settings.softStopPct / 100));
}

function getDynamicWeights(strategyId: string, instrument: string, regime: MarketSnapshot["regime"], mode: TradingMode) {
  let weights = {
    priceVolume: 0.6,
    macro: 0.2,
    risk: 0.15,
    execution: 0.05,
  };

  if (strategyId === "zanger" || strategyId === "dividend-circuit") {
    weights = { priceVolume: 0.75, macro: 0.05, risk: 0.15, execution: 0.05 };
  }

  if (instrument === "USDINR" || instrument === "NIFTY") {
    weights = { priceVolume: 0.5, macro: 0.3, risk: 0.15, execution: 0.05 };
  }

  if (instrument === "GOLD" || instrument === "SILVER") {
    weights = { priceVolume: 0.55, macro: 0.3, risk: 0.1, execution: 0.05 };
  }

  if (regime === "event-risk" || regime === "risk-off") {
    weights.macro += 0.05;
    weights.risk += 0.05;
    weights.priceVolume -= 0.1;
  }

  if (mode === "aggressive") {
    weights.priceVolume += 0.05;
    weights.risk -= 0.05;
  }

  if (mode === "conservative") {
    weights.risk += 0.05;
    weights.execution += 0.05;
    weights.priceVolume -= 0.1;
  }

  return weights;
}

function toPercent(weights: ReturnType<typeof getDynamicWeights>) {
  return {
    priceVolume: Math.round(weights.priceVolume * 100),
    macro: Math.round(weights.macro * 100),
    risk: Math.round(weights.risk * 100),
    execution: Math.round(weights.execution * 100),
  };
}

function estimateRisk(symbol: string, stopLoss: number | null, ltp: number, settings: RiskSettings) {
  if (!stopLoss || !ltp) return 0;
  const pointRisk = Math.abs(ltp - stopLoss);
  const lotSize: Record<string, number> = {
    USDINR: 1000,
    GOLD: 1,
    SILVER: 30,
    CRUDE: 100,
    NIFTY: 75,
    MIDCPNIFTY: 120,
  };
  const perLotRisk = pointRisk * (lotSize[symbol] ?? 1);
  return perLotRisk * (settings.lotLimits[symbol] ?? 1);
}

function getRecommendedLots(symbol: string, riskAtMaxLots: number, settings: RiskSettings) {
  const maxLots = settings.lotLimits[symbol] ?? 0;
  if (!maxLots || riskAtMaxLots <= settings.maxLossPerTrade) return maxLots;
  const riskPerLot = riskAtMaxLots / maxLots;
  return Math.max(0, Math.floor(settings.maxLossPerTrade / riskPerLot));
}

function getBlockers(
  mode: StrategyMode,
  finalScore: number,
  priceVolumeScore: number,
  executionScore: number,
  recommendedLots: number,
  settings: RiskSettings,
) {
  const blockers: string[] = [];
  if (mode === "auto" && !settings.autoTrading) blockers.push("auto trading is off");
  if (priceVolumeScore < settings.minPriceVolumeScore) blockers.push("price-volume score below threshold");
  if (executionScore < 65) blockers.push("execution quality too weak");
  if (mode === "auto" && recommendedLots < 1) blockers.push("no lots allowed by risk engine");
  if (latestSnapshot.eventRisk === "blocked") blockers.push("event risk blocked");
  if (finalScore < getTradeThreshold(settings.mode)) blockers.push("final score below trade threshold");
  return blockers;
}

function getDecision(mode: StrategyMode, finalScore: number, blockers: string[]): Decision {
  if (mode === "alert") return "portfolio-review";
  if (blockers.length) return "blocked";
  if (mode === "assisted") return "watch";
  return finalScore >= 75 ? "auto-ready" : "watch";
}

function getTradeThreshold(mode: TradingMode) {
  if (mode === "conservative") return 80;
  if (mode === "aggressive") return 70;
  return 75;
}
