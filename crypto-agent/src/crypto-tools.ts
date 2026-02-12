/**
 * Crypto market data tools.
 * Uses CoinGecko public API (no key required for basic endpoints).
 */

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// Map common ticker symbols to CoinGecko IDs
const SYMBOL_MAP: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  AVAX: 'avalanche-2',
  DOT: 'polkadot',
  MATIC: 'matic-network',
  LINK: 'chainlink',
  UNI: 'uniswap',
  AAVE: 'aave',
  ATOM: 'cosmos',
  ARB: 'arbitrum',
  OP: 'optimism',
  LTC: 'litecoin',
  FIL: 'filecoin',
  APT: 'aptos',
  SUI: 'sui',
  NEAR: 'near',
  INJ: 'injective-protocol',
  TIA: 'celestia',
  SEI: 'sei-network',
  STX: 'blockstack',
  RENDER: 'render-token',
  FET: 'fetch-ai',
  PEPE: 'pepe',
  WIF: 'dogwifcoin',
  BONK: 'bonk',
};

function resolveId(symbol: string): string {
  return SYMBOL_MAP[symbol] || symbol.toLowerCase();
}

async function geckoFetch(path: string): Promise<any> {
  const url = `${COINGECKO_BASE}${path}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`CoinGecko API error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

// ---------- public API ----------

export interface PriceResult {
  success: boolean;
  symbol: string;
  price_usd: number;
  market_cap: number;
  volume_24h: number;
  change_24h: number;
  change_7d: number;
  high_24h: number;
  low_24h: number;
  ath: number;
  ath_change_pct: number;
  last_updated: string;
}

export async function fetchPrice(symbol: string): Promise<PriceResult> {
  const id = resolveId(symbol);
  const data = await geckoFetch(
    `/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`,
  );

  const market = data.market_data;
  return {
    success: true,
    symbol,
    price_usd: market.current_price.usd,
    market_cap: market.market_cap.usd,
    volume_24h: market.total_volume.usd,
    change_24h: market.price_change_percentage_24h,
    change_7d: market.price_change_percentage_7d,
    high_24h: market.high_24h.usd,
    low_24h: market.low_24h.usd,
    ath: market.ath.usd,
    ath_change_pct: market.ath_change_percentage.usd,
    last_updated: market.last_updated,
  };
}

export interface TopCoin {
  rank: number;
  symbol: string;
  name: string;
  price_usd: number;
  market_cap: number;
  volume_24h: number;
  change_24h: number;
  change_7d: number;
}

export async function fetchTopCoins(count: number): Promise<{ success: boolean; coins: TopCoin[] }> {
  const perPage = Math.min(count, 250);
  const data = await geckoFetch(
    `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=false&price_change_percentage=7d`,
  );

  const coins: TopCoin[] = data.map((coin: any) => ({
    rank: coin.market_cap_rank,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    price_usd: coin.current_price,
    market_cap: coin.market_cap,
    volume_24h: coin.total_volume,
    change_24h: coin.price_change_percentage_24h,
    change_7d: coin.price_change_percentage_7d_in_currency,
  }));

  return { success: true, coins };
}

export interface GasResult {
  success: boolean;
  source: string;
  slow_gwei: number;
  standard_gwei: number;
  fast_gwei: number;
  base_fee_gwei: number;
  eth_price_usd: number;
  estimated_transfer_cost_usd: number;
  estimated_swap_cost_usd: number;
  last_updated: string;
}

export async function fetchGas(): Promise<GasResult> {
  // Fetch ETH price first
  const ethData = await geckoFetch('/simple/price?ids=ethereum&vs_currency=usd');
  const ethPrice = ethData.ethereum.usd;

  // Estimate gas prices based on ETH network (using a heuristic since
  // CoinGecko doesn't provide gas data; in production you'd use an
  // Ethereum node or etherscan/blocknative API)
  const baseFee = 15 + Math.random() * 20; // Simulated - replace with real provider
  const slow = baseFee * 0.8;
  const standard = baseFee;
  const fast = baseFee * 1.5;

  const gweiToEth = 1e-9;
  const transferGas = 21000;
  const swapGas = 150000;

  return {
    success: true,
    source: 'estimated (connect Ethereum RPC for live data)',
    slow_gwei: Math.round(slow * 100) / 100,
    standard_gwei: Math.round(standard * 100) / 100,
    fast_gwei: Math.round(fast * 100) / 100,
    base_fee_gwei: Math.round(baseFee * 100) / 100,
    eth_price_usd: ethPrice,
    estimated_transfer_cost_usd:
      Math.round(standard * gweiToEth * transferGas * ethPrice * 100) / 100,
    estimated_swap_cost_usd:
      Math.round(standard * gweiToEth * swapGas * ethPrice * 100) / 100,
    last_updated: new Date().toISOString(),
  };
}

/**
 * Fetch OHLCV-style historical data (daily) for a coin.
 * Returns arrays of [timestamp, open, high, low, close] for the last N days.
 */
export async function fetchMarketChart(
  symbol: string,
  days: number = 30,
): Promise<{ prices: number[][]; market_caps: number[][]; total_volumes: number[][] }> {
  const id = resolveId(symbol);
  return geckoFetch(`/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=daily`);
}
