/**
 * Portfolio evaluation module.
 * Reads a JSON file of holdings and values them against live prices.
 *
 * Expected holdings format:
 * [
 *   { "symbol": "BTC", "amount": 0.5 },
 *   { "symbol": "ETH", "amount": 10 },
 *   ...
 * ]
 */

import { readFileSync } from 'fs';
import { fetchPrice } from './crypto-tools.js';

interface Holding {
  symbol: string;
  amount: number;
}

interface ValuedHolding extends Holding {
  price_usd: number;
  value_usd: number;
  change_24h: number;
  change_7d: number;
  allocation_pct: number;
}

interface PortfolioResult {
  success: boolean;
  total_value_usd: number;
  holdings: ValuedHolding[];
  risk_metrics: {
    largest_position_pct: number;
    largest_position_symbol: string;
    top3_concentration_pct: number;
    recommendation: string;
  };
  timestamp: string;
}

export async function evaluatePortfolio(filePath: string): Promise<PortfolioResult> {
  const raw = readFileSync(filePath, 'utf-8');
  const holdings: Holding[] = JSON.parse(raw);

  if (!Array.isArray(holdings) || holdings.length === 0) {
    throw new Error('Holdings file must be a non-empty JSON array of {symbol, amount} objects');
  }

  // Fetch all prices concurrently
  const priceResults = await Promise.all(
    holdings.map(async (h) => {
      try {
        return await fetchPrice(h.symbol.toUpperCase());
      } catch {
        return null;
      }
    }),
  );

  let totalValue = 0;
  const valued: ValuedHolding[] = [];

  for (let i = 0; i < holdings.length; i++) {
    const h = holdings[i];
    const p = priceResults[i];
    const price = p ? p.price_usd : 0;
    const value = h.amount * price;
    totalValue += value;
    valued.push({
      symbol: h.symbol.toUpperCase(),
      amount: h.amount,
      price_usd: price,
      value_usd: Math.round(value * 100) / 100,
      change_24h: p ? p.change_24h : 0,
      change_7d: p ? p.change_7d : 0,
      allocation_pct: 0, // computed below
    });
  }

  // Compute allocation percentages
  for (const v of valued) {
    v.allocation_pct = totalValue > 0 ? Math.round((v.value_usd / totalValue) * 10000) / 100 : 0;
  }

  // Sort by value descending
  valued.sort((a, b) => b.value_usd - a.value_usd);

  // Risk metrics
  const largest = valued[0];
  const top3Pct = valued
    .slice(0, 3)
    .reduce((sum, v) => sum + v.allocation_pct, 0);

  let recommendation = 'Portfolio looks well-diversified.';
  if (largest && largest.allocation_pct > 50) {
    recommendation = `High concentration risk: ${largest.symbol} is ${largest.allocation_pct}% of portfolio. Consider rebalancing.`;
  } else if (top3Pct > 80) {
    recommendation = `Top 3 positions are ${top3Pct}% of portfolio. Consider diversifying into more assets.`;
  }

  return {
    success: true,
    total_value_usd: Math.round(totalValue * 100) / 100,
    holdings: valued,
    risk_metrics: {
      largest_position_pct: largest ? largest.allocation_pct : 0,
      largest_position_symbol: largest ? largest.symbol : 'N/A',
      top3_concentration_pct: Math.round(top3Pct * 100) / 100,
      recommendation,
    },
    timestamp: new Date().toISOString(),
  };
}
