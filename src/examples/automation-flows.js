#!/usr/bin/env node

/**
 * Example automation flows for n8n, Make, Weavy.ai
 * Demonstrates how to use Stagehand to automate workflow creation
 */

import BrowserAgent from '../browser-agent.js';

/**
 * Example: Automate n8n workflow creation
 */
async function createN8NWorkflow() {
  const agent = new BrowserAgent();

  try {
    await agent.init();

    // Navigate to n8n
    await agent.goto('https://app.n8n.cloud/');

    // Login (if needed)
    await agent.act('click on the login button if visible');
    await agent.wait(2000);

    // Create new workflow
    await agent.act('click on the create new workflow button');
    await agent.wait(2000);

    // Add nodes
    await agent.act('add a webhook trigger node');
    await agent.wait(1000);

    await agent.act('add an HTTP request node');
    await agent.wait(1000);

    await agent.act('connect the webhook to the HTTP request node');

    // Configure nodes using natural language
    await agent.act('configure the HTTP request to POST to https://api.example.com/data');

    // Save workflow
    await agent.act('save the workflow with name "API Integration Flow"');

    console.log('✅ n8n workflow created successfully!');

    await agent.screenshot('n8n-workflow.png');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await agent.close();
  }
}

/**
 * Example: Automate Make (Integromat) scenario creation
 */
async function createMakeScenario() {
  const agent = new BrowserAgent();

  try {
    await agent.init();

    await agent.goto('https://www.make.com/');

    // Create scenario
    await agent.act('click on create new scenario');
    await agent.wait(2000);

    // Add modules
    await agent.act('add a webhook module');
    await agent.wait(1000);

    await agent.act('add a HTTP module');
    await agent.wait(1000);

    // Configure
    await agent.act('connect the modules');
    await agent.act('set the HTTP method to POST');

    console.log('✅ Make scenario created successfully!');

    await agent.screenshot('make-scenario.png');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await agent.close();
  }
}

/**
 * Example: Extract workflow information
 */
async function extractWorkflowData() {
  const agent = new BrowserAgent();

  try {
    await agent.init();

    await agent.goto('https://app.n8n.cloud/workflows');

    // Extract all workflow names
    const workflows = await agent.extract('get all workflow names and their status');

    console.log('📊 Workflows found:', workflows);

    return workflows;

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await agent.close();
  }
}

/**
 * Example: Autonomous agent for complex tasks
 */
async function autonomousWorkflowSetup() {
  const agent = new BrowserAgent();

  try {
    await agent.init();

    await agent.goto('https://app.n8n.cloud/');

    // Use agent for multi-step autonomous task
    await agent.agent(
      'Create a new workflow that triggers on webhook, fetches data from an API, ' +
      'transforms the data, and sends it to another endpoint. Name it "Data Pipeline".'
    );

    console.log('✅ Autonomous workflow setup completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await agent.close();
  }
}

/**
 * Example: Observe available actions
 */
async function observeWorkflowInterface() {
  const agent = new BrowserAgent();

  try {
    await agent.init();

    await agent.goto('https://app.n8n.cloud/workflows');

    // Observe what actions are available
    const observations = await agent.observe('what can I do on this page?');

    console.log('👀 Available actions:', observations);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await agent.close();
  }
}

// Export functions
export {
  createN8NWorkflow,
  createMakeScenario,
  extractWorkflowData,
  autonomousWorkflowSetup,
  observeWorkflowInterface
};

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🔄 Automation Flow Examples                            ║
║                                                           ║
║   Example automations for n8n, Make, and Weavy.ai        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

Available examples:
  1. createN8NWorkflow()
  2. createMakeScenario()
  3. extractWorkflowData()
  4. autonomousWorkflowSetup()
  5. observeWorkflowInterface()

Run with: node src/examples/automation-flows.js
  `);
}
