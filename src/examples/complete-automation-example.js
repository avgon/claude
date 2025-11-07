#!/usr/bin/env node

/**
 * Complete Automation Example
 * Demonstrates all integrations working together
 */

import BrowserAgent from '../browser-agent.js';
import TavilySearch from '../integrations/tavily-search.js';
import TokenEfficiency from '../integrations/token-efficiency.js';
import MemoryLayer from '../integrations/memory-layer.js';

/**
 * Complete workflow automation example using all tools
 */
async function completeAutomationWorkflow() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Complete Automation Workflow                        ║
║                                                           ║
║   Browser + Search + Memory + Token Optimization         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Initialize all components
  const browser = new BrowserAgent();
  const search = new TavilySearch();
  const tokenizer = new TokenEfficiency();
  const memory = new MemoryLayer();

  try {
    // Step 1: Remember user preferences (Memory Layer)
    console.log('\n📝 Step 1: Setting up preferences...');
    await memory.rememberPreference('platform', 'n8n');
    await memory.rememberPreference('preferredNodes', ['webhook', 'http', 'code']);

    // Step 2: Search for documentation (Tavily)
    console.log('\n🔍 Step 2: Searching for documentation...');
    const docs = await search.searchAutomationDocs('n8n', 'webhook trigger setup');

    // Store findings in memory
    await memory.store('latest_docs', docs, {
      platform: 'n8n',
      topic: 'webhooks'
    });

    // Step 3: Optimize prompt for AI (Token Efficiency)
    console.log('\n⚡ Step 3: Optimizing prompt...');
    const prompt = `
      I think we should basically create a very good webhook workflow
      that just really handles the incoming data and actually processes it
      quite efficiently in my opinion.
    `;

    const optimized = tokenizer.optimizePrompt(prompt);
    console.log(`
      Original: ${optimized.originalTokens} tokens
      Optimized: ${optimized.optimizedTokens} tokens
      Savings: ${optimized.savingsPercent}%
    `);

    // Step 4: Initialize browser automation (Stagehand)
    console.log('\n🌐 Step 4: Starting browser automation...');
    await browser.init();

    // Step 5: Navigate and create workflow
    console.log('\n🎯 Step 5: Creating automation workflow...');
    await browser.goto('https://demo.n8n.io/');

    // Use optimized prompt for agent
    await browser.agent(optimized.optimized);

    // Step 6: Extract created workflow details
    console.log('\n📊 Step 6: Extracting workflow details...');
    const workflowData = await browser.extract('get the workflow name and node count');

    // Step 7: Store workflow context in memory
    console.log('\n💾 Step 7: Storing workflow context...');
    await memory.storeWorkflowContext('demo-webhook-flow', {
      platform: 'n8n',
      createdAt: Date.now(),
      nodes: workflowData,
      documentation: docs
    });

    // Step 8: Learn from the experience
    console.log('\n🧠 Step 8: Recording learnings...');
    await memory.learn('Webhook workflows require proper authentication', {
      issue: 'Security consideration',
      solution: 'Always configure webhook authentication',
      platform: 'n8n'
    });

    // Step 9: Take screenshot for reference
    console.log('\n📸 Step 9: Taking screenshot...');
    await browser.screenshot('complete-workflow.png');

    // Step 10: Show statistics
    console.log('\n📈 Step 10: Workflow Statistics');
    console.log('Memory Stats:', memory.getStats());
    console.log('Token Analysis:', tokenizer.analyzeText(prompt));

    // Step 11: Retrieve everything we learned
    console.log('\n🎓 Learnings Summary:');
    const learnings = await memory.getLearnings();
    learnings.forEach((learning, idx) => {
      console.log(`  ${idx + 1}. ${learning.value.lesson}`);
    });

    console.log('\n✅ Complete workflow automation finished successfully!');
    console.log('\n📋 Summary:');
    console.log('  - Browser automation: ✓');
    console.log('  - Web search integration: ✓');
    console.log('  - Token optimization: ✓');
    console.log('  - Memory persistence: ✓');
    console.log('  - Serena MCP (background): ✓');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

/**
 * Example: Building n8n workflow with research
 */
async function buildWorkflowWithResearch(workflowType) {
  const search = new TavilySearch();
  const browser = new BrowserAgent();
  const memory = new MemoryLayer();

  try {
    // Research first
    console.log(`🔍 Researching ${workflowType} workflows...`);
    const research = await search.search(`n8n ${workflowType} workflow best practices`);

    // Store research
    await memory.store(`research:${workflowType}`, research);

    // Build workflow with context
    await browser.init();
    await browser.goto('https://app.n8n.cloud/');

    await browser.agent(
      `Create a ${workflowType} workflow using best practices from: ${research.answer}`
    );

    // Save results
    const result = await browser.extract('get the complete workflow configuration');
    await memory.storeWorkflowContext(workflowType, result);

    console.log('✅ Workflow created with research-backed best practices');

  } finally {
    await browser.close();
  }
}

/**
 * Example: Token-efficient batch automation
 */
async function efficientBatchAutomation(tasks) {
  const tokenizer = new TokenEfficiency();
  const browser = new BrowserAgent();

  try {
    // Optimize all task descriptions
    const optimizedTasks = tasks.map(task => {
      const opt = tokenizer.optimizePrompt(task);
      console.log(`Optimized "${task.slice(0, 30)}..." - Saved ${opt.savingsPercent}%`);
      return opt.optimized;
    });

    // Calculate total savings
    const totalOriginal = tasks.reduce((sum, t) => sum + tokenizer.countTokens(t), 0);
    const totalOptimized = optimizedTasks.reduce(
      (sum, t) => sum + tokenizer.countTokens(t),
      0
    );

    console.log(`\n💰 Total token savings: ${totalOriginal - totalOptimized} tokens`);
    console.log(`   Cost savings: $${tokenizer.estimateCost(totalOriginal - totalOptimized, 0, 'gpt-4')}`);

    // Execute optimized tasks
    await browser.init();
    for (const task of optimizedTasks) {
      await browser.agent(task);
    }

  } finally {
    await browser.close();
  }
}

// Export functions
export {
  completeAutomationWorkflow,
  buildWorkflowWithResearch,
  efficientBatchAutomation
};

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  switch (command) {
    case 'complete':
      await completeAutomationWorkflow();
      break;

    case 'research':
      const workflowType = process.argv[3] || 'data-processing';
      await buildWorkflowWithResearch(workflowType);
      break;

    case 'batch':
      const tasks = process.argv.slice(3);
      if (tasks.length === 0) {
        console.log('Usage: node complete-automation-example.js batch "task1" "task2" ...');
      } else {
        await efficientBatchAutomation(tasks);
      }
      break;

    default:
      console.log(`
Usage:
  node complete-automation-example.js complete    # Run complete workflow
  node complete-automation-example.js research <type>  # Build workflow with research
  node complete-automation-example.js batch "task1" "task2"  # Batch automation
      `);
  }
}
