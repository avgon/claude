#!/usr/bin/env node

/**
 * CLI Wrapper for Browser Agent - agent-browse compatible
 * Provides persistent browser state and JSON output for Claude Code integration
 */

import BrowserAgent from './browser-agent.js';
import { existsSync, writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Resolve paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PLUGIN_ROOT = join(__dirname, '..');

// Load environment
dotenv.config({ path: join(PLUGIN_ROOT, '.env') });

// Check for API key
if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
  console.error(JSON.stringify({
    success: false,
    error: 'OPENAI_API_KEY or ANTHROPIC_API_KEY required. Set it with: export OPENAI_API_KEY="your-key"'
  }, null, 2));
  process.exit(1);
}

// Persistent browser state (module-level)
let browserAgentInstance = null;
const STATE_FILE = join(PLUGIN_ROOT, '.browser-state.json');

/**
 * Get or create persistent browser instance
 */
async function getBrowserAgent() {
  if (browserAgentInstance) {
    return browserAgentInstance;
  }

  browserAgentInstance = new BrowserAgent({
    headless: false,
    debugMode: false
  });

  await browserAgentInstance.init();

  // Save state
  writeFileSync(STATE_FILE, JSON.stringify({
    initialized: true,
    timestamp: Date.now()
  }));

  return browserAgentInstance;
}

/**
 * Close browser and cleanup
 */
async function closeBrowser() {
  if (browserAgentInstance) {
    await browserAgentInstance.close();
    browserAgentInstance = null;
  }

  // Remove state file
  if (existsSync(STATE_FILE)) {
    unlinkSync(STATE_FILE);
  }
}

/**
 * Take screenshot
 */
async function takeScreenshot() {
  const agent = await getBrowserAgent();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = join(PLUGIN_ROOT, 'screenshots', `screenshot-${timestamp}.png`);

  // Create directory if needed
  const screenshotsDir = join(PLUGIN_ROOT, 'screenshots');
  if (!existsSync(screenshotsDir)) {
    const { mkdirSync } = await import('fs');
    mkdirSync(screenshotsDir, { recursive: true });
  }

  await agent.screenshot(screenshotPath);
  return screenshotPath;
}

/**
 * CLI Commands
 */
async function navigate(url) {
  try {
    const agent = await getBrowserAgent();
    await agent.goto(url);
    const screenshotPath = await takeScreenshot();

    return {
      success: true,
      message: `Successfully navigated to ${url}`,
      screenshot: screenshotPath,
      url: await agent.getUrl()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function act(action) {
  try {
    const agent = await getBrowserAgent();
    await agent.act(action);
    const screenshotPath = await takeScreenshot();

    return {
      success: true,
      message: `Successfully performed action: ${action}`,
      screenshot: screenshotPath
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function extract(instruction, schema = null) {
  try {
    const agent = await getBrowserAgent();
    const result = await agent.extract(instruction, schema);
    const screenshotPath = await takeScreenshot();

    return {
      success: true,
      data: result,
      message: `Successfully extracted: ${JSON.stringify(result)}`,
      screenshot: screenshotPath
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function observe(query) {
  try {
    const agent = await getBrowserAgent();
    const actions = await agent.observe(query);
    const screenshotPath = await takeScreenshot();

    return {
      success: true,
      actions: actions,
      message: `Successfully observed: ${actions}`,
      screenshot: screenshotPath
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function screenshot() {
  try {
    const screenshotPath = await takeScreenshot();

    return {
      success: true,
      screenshot: screenshotPath
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function agent(goal) {
  try {
    const agentInstance = await getBrowserAgent();
    const result = await agentInstance.agent(goal);
    const screenshotPath = await takeScreenshot();

    return {
      success: true,
      result: result,
      message: `Successfully completed goal: ${goal}`,
      screenshot: screenshotPath
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function getInfo() {
  try {
    const agentInstance = await getBrowserAgent();
    const url = await agentInstance.getUrl();
    const title = await agentInstance.getTitle();

    return {
      success: true,
      url: url,
      title: title
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Main CLI handler
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    let result;

    switch (command) {
      case 'navigate':
        if (args.length < 2) {
          throw new Error('Usage: node src/cli.js navigate <url>');
        }
        result = await navigate(args[1]);
        break;

      case 'act':
        if (args.length < 2) {
          throw new Error('Usage: node src/cli.js act "<action>"');
        }
        result = await act(args.slice(1).join(' '));
        break;

      case 'extract':
        if (args.length < 2) {
          throw new Error('Usage: node src/cli.js extract "<instruction>" [schema]');
        }
        const instruction = args[1];
        const schema = args[2] ? JSON.parse(args[2]) : null;
        result = await extract(instruction, schema);
        break;

      case 'observe':
        if (args.length < 2) {
          throw new Error('Usage: node src/cli.js observe "<query>"');
        }
        result = await observe(args.slice(1).join(' '));
        break;

      case 'screenshot':
        result = await screenshot();
        break;

      case 'agent':
        if (args.length < 2) {
          throw new Error('Usage: node src/cli.js agent "<goal>"');
        }
        result = await agent(args.slice(1).join(' '));
        break;

      case 'info':
        result = await getInfo();
        break;

      case 'close':
        await closeBrowser();
        result = { success: true, message: 'Browser closed' };
        break;

      default:
        throw new Error(`Unknown command: ${command}
Available commands:
  navigate <url>          - Navigate to a URL
  act "<action>"          - Perform natural language action
  extract "<instruction>" - Extract data from page
  observe "<query>"       - Discover elements on page
  screenshot              - Take a screenshot
  agent "<goal>"          - Execute multi-step autonomous goal
  info                    - Get current page info (URL, title)
  close                   - Close the browser`);
    }

    // Output JSON result
    console.log(JSON.stringify(result, null, 2));

    // Browser stays open between commands (unless 'close' was called)
    process.exit(0);
  } catch (error) {
    // Close browser on error
    await closeBrowser();

    console.error(JSON.stringify({
      success: false,
      error: error.message
    }, null, 2));
    process.exit(1);
  }
}

// Cleanup handlers
process.on('SIGINT', async () => {
  await closeBrowser();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeBrowser();
  process.exit(0);
});

process.on('uncaughtException', async (error) => {
  console.error(JSON.stringify({
    success: false,
    error: error.message
  }, null, 2));
  await closeBrowser();
  process.exit(1);
});

// Run main
main().catch(async (error) => {
  console.error(JSON.stringify({
    success: false,
    error: error.message
  }, null, 2));
  await closeBrowser();
  process.exit(1);
});
