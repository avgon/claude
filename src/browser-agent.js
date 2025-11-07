#!/usr/bin/env node

/**
 * Stagehand Browser Automation Agent for Claude Code
 * Enables natural language browser automation for workflow creation
 */

import { Stagehand } from '@browserbasehq/stagehand';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

class BrowserAgent {
  constructor(options = {}) {
    this.options = {
      headless: process.env.HEADLESS === 'true',
      debugMode: process.env.DEBUG_MODE === 'true',
      browserbaseApiKey: process.env.BROWSERBASE_API_KEY,
      browserbaseProjectId: process.env.BROWSERBASE_PROJECT_ID,
      ...options
    };

    this.stagehand = null;
    this.page = null;
    this.context = null;
  }

  /**
   * Initialize the Stagehand browser
   */
  async init() {
    try {
      console.log('🚀 Initializing Stagehand browser...');

      const config = {
        env: 'LOCAL', // or 'BROWSERBASE' for cloud browsers
        headless: this.options.headless,
        logger: (message) => {
          if (this.options.debugMode) {
            console.log(`[Stagehand] ${message}`);
          }
        },
        enableCaching: true,
      };

      // Use Browserbase if API keys are provided
      if (this.options.browserbaseApiKey && this.options.browserbaseProjectId) {
        config.env = 'BROWSERBASE';
        config.browserbaseApiKey = this.options.browserbaseApiKey;
        config.browserbaseProjectId = this.options.browserbaseProjectId;
        console.log('☁️  Using Browserbase cloud browser');
      }

      this.stagehand = new Stagehand(config);
      await this.stagehand.init();
      this.page = this.stagehand.page;
      this.context = this.stagehand.context;

      console.log('✅ Browser initialized successfully');
      return this;
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error.message);
      throw error;
    }
  }

  /**
   * Navigate to a URL
   */
  async goto(url) {
    try {
      console.log(`🌐 Navigating to: ${url}`);
      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
      console.log('✅ Navigation complete');
      return this;
    } catch (error) {
      console.error('❌ Navigation failed:', error.message);
      throw error;
    }
  }

  /**
   * Perform an action using natural language
   * @param {string} instruction - Natural language instruction
   * @param {Object} options - Additional options
   */
  async act(instruction, options = {}) {
    try {
      console.log(`🎬 Acting: "${instruction}"`);

      const result = await this.page.act(instruction, options);

      console.log('✅ Action completed');
      return result;
    } catch (error) {
      console.error('❌ Action failed:', error.message);
      throw error;
    }
  }

  /**
   * Extract data from the page using natural language
   * @param {string} instruction - What to extract
   * @param {Object} schema - Optional Zod schema for structured extraction
   */
  async extract(instruction, schema = null) {
    try {
      console.log(`📊 Extracting: "${instruction}"`);

      const options = { instruction };
      if (schema) {
        options.schema = schema;
      }

      const result = await this.page.extract(options);

      console.log('✅ Extraction complete');
      return result;
    } catch (error) {
      console.error('❌ Extraction failed:', error.message);
      throw error;
    }
  }

  /**
   * Observe available actions on the page
   * @param {string} instruction - Optional instruction to filter observations
   */
  async observe(instruction = null) {
    try {
      console.log('👀 Observing page...');

      const result = instruction
        ? await this.page.observe(instruction)
        : await this.page.observe();

      console.log('✅ Observation complete');
      return result;
    } catch (error) {
      console.error('❌ Observation failed:', error.message);
      throw error;
    }
  }

  /**
   * Execute autonomous multi-step tasks
   * @param {string} goal - The goal to achieve
   * @param {Object} options - Additional options like provider and model
   */
  async agent(goal, options = {}) {
    try {
      console.log(`🤖 Agent executing: "${goal}"`);

      // Create agent with specified provider/model or defaults
      const agentInstance = this.stagehand.agent({
        provider: options.provider || "openai",
        model: options.model || "gpt-4o",
        ...options
      });

      // Execute the goal
      const result = await agentInstance.execute(goal);

      console.log('✅ Agent task completed');
      return result;
    } catch (error) {
      console.error('❌ Agent task failed:', error.message);
      throw error;
    }
  }

  /**
   * Take a screenshot
   * @param {string} path - Path to save screenshot
   */
  async screenshot(path = null) {
    try {
      const screenshotPath = path || `screenshot-${Date.now()}.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 Screenshot saved: ${screenshotPath}`);
      return screenshotPath;
    } catch (error) {
      console.error('❌ Screenshot failed:', error.message);
      throw error;
    }
  }

  /**
   * Wait for a specified time
   * @param {number} ms - Milliseconds to wait
   */
  async wait(ms) {
    console.log(`⏳ Waiting ${ms}ms...`);
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get the current page title
   */
  async getTitle() {
    return await this.page.title();
  }

  /**
   * Get the current URL
   */
  async getUrl() {
    return this.page.url();
  }

  /**
   * Close the browser
   */
  async close() {
    try {
      console.log('🔒 Closing browser...');
      await this.stagehand.close();
      console.log('✅ Browser closed');
    } catch (error) {
      console.error('❌ Failed to close browser:', error.message);
      throw error;
    }
  }
}

// Export for use as a module
export default BrowserAgent;

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new BrowserAgent();

  process.on('SIGINT', async () => {
    console.log('\n\n👋 Shutting down gracefully...');
    await agent.close();
    process.exit(0);
  });

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎭 Stagehand Browser Agent for Claude Code              ║
║                                                           ║
║   AI-powered browser automation with natural language    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

Usage: import BrowserAgent from './src/browser-agent.js'

Example:
  const agent = new BrowserAgent();
  await agent.init();
  await agent.goto('https://example.com');
  await agent.act('click the login button');
  await agent.extract('get all product names');
  await agent.close();
  `);
}
