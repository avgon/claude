/**
 * Technical analysis module.
 * Computes indicators from CoinGecko historical price data.
 */

import { fetchPrice, fetchMarketChart } from './crypto-tools.js';

// ---------- indicator math ----------

function sma(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / period);
  }
  return result;
}

function ema(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(data[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

function rsi(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;

  for (let i = closes.length - period; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function macd(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
): { macd: number; signal: number; histogram: number } {
  const fastEma = ema(closes, fastPeriod);
  const slowEma = ema(closes, slowPeriod);
  const macdLine = fastEma.map((v, i) => v - slowEma[i]);
  const signalLine = ema(macdLine, signalPeriod);
  const latest = macdLine.length - 1;
  return {
    macd: macdLine[latest],
    signal: signalLine[latest],
    histogram: macdLine[latest] - signalLine[latest],
  };
}

function bollingerBands(
  closes: number[],
  period = 20,
  stdDev = 2,
): { upper: number; middle: number; lower: number; bandwidth: number } {
  if (closes.length < period) {
    const price = closes[closes.length - 1];
    return { upper: price, middle: price, lower: price, bandwidth: 0 };
  }
  const slice = closes.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((sum, val) => sum + (val - mean) ** 2, 0) / period;
  const sd = Math.sqrt(variance);
  return {
    upper: mean + stdDev * sd,
    middle: mean,
    lower: mean - stdDev * sd,
    bandwidth: ((mean + stdDev * sd - (mean - stdDev * sd)) / mean) * 100,
  };
}

function fibonacciLevels(high: number, low: number) {
  const diff = high - low;
  return {
    level_0: high,
    level_236: high - diff * 0.236,
    level_382: high - diff * 0.382,
    level_500: high - diff * 0.5,
    level_618: high - diff * 0.618,
    level_786: high - diff * 0.786,
    level_100: low,
  };
}

function supportResistance(closes: number[], period = 14) {
  const recent = closes.slice(-period);
  return {
    resistance: Math.max(...recent),
    support: Math.min(...recent),
    pivot: (Math.max(...recent) + Math.min(...recent) + recent[recent.length - 1]) / 3,
  };
}

// ---------- signal logic ----------

function deriveSignal(rsiVal: number, macdHist: number, bbPosition: number): string {
  let score = 0;
  // RSI
  if (rsiVal < 30) score += 2;
  else if (rsiVal < 40) score += 1;
  else if (rsiVal > 70) score -= 2;
  else if (rsiVal > 60) score -= 1;

  // MACD histogram
  if (macdHist > 0) score += 1;
  else score -= 1;

  // Bollinger position (0 = at lower band, 1 = at upper band)
  if (bbPosition < 0.2) score += 1;
  else if (bbPosition > 0.8) score -= 1;

  if (score >= 3) return 'STRONG BUY';
  if (score >= 1) return 'BUY';
  if (score <= -3) return 'STRONG SELL';
  if (score <= -1) return 'SELL';
  return 'NEUTRAL';
}

// ---------- public API ----------

export interface AnalysisResult {
  success: boolean;
  symbol: string;
  price: number;
  change_24h: number;
  change_7d: number;
  indicators: {
    rsi_14: number;
    macd: { macd: number; signal: number; histogram: number };
    bollinger: { upper: number; middle: number; lower: number; bandwidth: number };
    sma_20: number;
    sma_50: number;
    ema_12: number;
    ema_26: number;
    fibonacci: ReturnType<typeof fibonacciLevels>;
    support_resistance: ReturnType<typeof supportResistance>;
  };
  signal: string;
  risk_note: string;
  timestamp: string;
}

export async function technicalAnalysis(symbol: string): Promise<AnalysisResult> {
  const [priceData, chart] = await Promise.all([
    fetchPrice(symbol),
    fetchMarketChart(symbol, 90),
  ]);

  const closes = chart.prices.map((p) => p[1]);
  const high90 = Math.max(...closes);
  const low90 = Math.min(...closes);

  const rsiVal = rsi(closes, 14);
  const macdVal = macd(closes);
  const bb = bollingerBands(closes, 20, 2);
  const sma20 = sma(closes, 20);
  const sma50 = sma(closes, 50);
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const fib = fibonacciLevels(high90, low90);
  const sr = supportResistance(closes);

  const currentPrice = priceData.price_usd;
  const bbPosition =
    bb.upper !== bb.lower ? (currentPrice - bb.lower) / (bb.upper - bb.lower) : 0.5;

  const signal = deriveSignal(rsiVal, macdVal.histogram, bbPosition);

  return {
    success: true,
    symbol,
    price: currentPrice,
    change_24h: priceData.change_24h,
    change_7d: priceData.change_7d,
    indicators: {
      rsi_14: Math.round(rsiVal * 100) / 100,
      macd: {
        macd: Math.round(macdVal.macd * 100) / 100,
        signal: Math.round(macdVal.signal * 100) / 100,
        histogram: Math.round(macdVal.histogram * 100) / 100,
      },
      bollinger: {
        upper: Math.round(bb.upper * 100) / 100,
        middle: Math.round(bb.middle * 100) / 100,
        lower: Math.round(bb.lower * 100) / 100,
        bandwidth: Math.round(bb.bandwidth * 100) / 100,
      },
      sma_20: Math.round((sma20[sma20.length - 1] || 0) * 100) / 100,
      sma_50: Math.round((sma50[sma50.length - 1] || 0) * 100) / 100,
      ema_12: Math.round((ema12[ema12.length - 1] || 0) * 100) / 100,
      ema_26: Math.round((ema26[ema26.length - 1] || 0) * 100) / 100,
      fibonacci: fib,
      support_resistance: sr,
    },
    signal,
    risk_note:
      'This is algorithmic analysis, not financial advice. Always DYOR and manage risk.',
    timestamp: new Date().toISOString(),
  };
}
