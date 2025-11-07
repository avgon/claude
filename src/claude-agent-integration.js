#!/usr/bin/env node

/**
 * Claude Agent SDK Integration with agent-browse
 * This provides the proper way to use browser automation with Claude
 */

import { BrowserTool } from '@browserbasehq/agent-browse';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Initialize the browser tool for Claude Agent SDK
 */
export function createBrowserTool(options = {}) {
  const config = {
    apiKey: options.apiKey || process.env.BROWSERBASE_API_KEY,
    projectId: options.projectId || process.env.BROWSERBASE_PROJECT_ID,
    ...options
  };

  return new BrowserTool(config);
}

/**
 * Example usage with Claude Agent SDK
 */
export async function exampleUsage() {
  const browserTool = createBrowserTool();

  console.log('🌐 Browser tool initialized for Claude Agent SDK');
  console.log('Use this tool in your Claude Agent SDK workflow');

  return browserTool;
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🌐 Claude Agent SDK Browser Integration                ║
║                                                           ║
║   Using @browserbasehq/agent-browse                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

This integration provides the official browser automation
tool for Claude Agent SDK.

Configuration:
  - BROWSERBASE_API_KEY: Your Browserbase API key
  - BROWSERBASE_PROJECT_ID: Your project ID

Usage in Claude Agent SDK:
  import { createBrowserTool } from './src/claude-agent-integration.js';

  const browserTool = createBrowserTool();
  // Use in your Claude Agent SDK workflow
  `);
}
