#!/usr/bin/env node
/**
 * Crypto Agent CLI - Market data, analysis, and OpenClaw templates.
 *
 * Commands:
 *   price <symbol>            Fetch live spot price
 *   top <count>               Top coins by market cap
 *   analyze <symbol>          Technical analysis summary
 *   gas                       Ethereum gas prices
 *   portfolio <file>          Portfolio valuation
 *   openclaw <template>       Generate OpenClaw contract template
 */

import { fetchPrice, fetchTopCoins, fetchGas } from './crypto-tools.js';
import { technicalAnalysis } from './analysis.js';
import { evaluatePortfolio } from './portfolio.js';
import { generateTemplate } from './openclaw.js';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    printUsage();
    process.exit(1);
  }

  try {
    let result: unknown;

    switch (command) {
      case 'price': {
        if (!args[1]) throw new Error('Usage: price <symbol>  (e.g. price BTC)');
        result = await fetchPrice(args[1].toUpperCase());
        break;
      }

      case 'top': {
        const count = parseInt(args[1] || '10', 10);
        result = await fetchTopCoins(count);
        break;
      }

      case 'analyze': {
        if (!args[1]) throw new Error('Usage: analyze <symbol>  (e.g. analyze ETH)');
        result = await technicalAnalysis(args[1].toUpperCase());
        break;
      }

      case 'gas': {
        result = await fetchGas();
        break;
      }

      case 'portfolio': {
        if (!args[1]) throw new Error('Usage: portfolio <path-to-json>');
        result = await evaluatePortfolio(args[1]);
        break;
      }

      case 'openclaw': {
        if (!args[1]) throw new Error('Usage: openclaw <template-type> [--params \'{"key":"value"}\']');
        const templateType = args[1];
        let params: Record<string, string> = {};
        const paramsIdx = args.indexOf('--params');
        if (paramsIdx !== -1 && args[paramsIdx + 1]) {
          params = JSON.parse(args[paramsIdx + 1]);
        }
        result = generateTemplate(templateType, params);
        break;
      }

      default:
        throw new Error(`Unknown command: ${command}\nRun without arguments for usage.`);
    }

    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(
      JSON.stringify(
        { success: false, error: err instanceof Error ? err.message : String(err) },
        null,
        2,
      ),
    );
    process.exit(1);
  }
}

function printUsage() {
  console.log(`
Crypto Agent CLI

Commands:
  price <symbol>                  Live spot price (e.g. BTC, ETH, SOL)
  top [count]                     Top coins by market cap (default 10)
  analyze <symbol>                Technical analysis summary
  gas                             Ethereum gas prices
  portfolio <file.json>           Portfolio valuation
  openclaw <type> [--params '{}'] Generate OpenClaw contract template
    Types: vesting, saft, dao-charter, service-agreement, escrow
`);
}

main().catch(console.error);
