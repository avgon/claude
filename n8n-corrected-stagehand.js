#!/usr/bin/env node

/**
 * n8n Workflow Automation with CORRECTED Stagehand API
 * Uses page.act(), page.extract(), and stagehand.agent() correctly
 */

import BrowserAgent from './src/browser-agent.js';
import dotenv from 'dotenv';

dotenv.config();

const N8N_URL = 'https://n8n-fjzd-production.up.railway.app/';
const N8N_EMAIL = 'mkilagoz@gmail.com';
const N8N_PASSWORD = '6297834Nn';

async function automateN8NWorkflow() {
  const agent = new BrowserAgent({
    headless: false,
    debugMode: true
  });

  try {
    console.log('╔════════════════════════════════════════╗');
    console.log('║  n8n Workflow Automation (CORRECTED)  ║');
    console.log('╚════════════════════════════════════════╝\n');

    // Initialize browser
    await agent.init();

    // Step 1: Navigate to n8n
    console.log('\n📍 Step 1: Navigating to n8n...');
    await agent.goto(N8N_URL);
    await agent.wait(3000);

    // Step 2: Login using act()
    console.log('\n🔐 Step 2: Logging in...');

    // Check if we're on login page or already logged in
    const currentUrl = await agent.getUrl();
    console.log(`Current URL: ${currentUrl}`);

    if (currentUrl.includes('signin')) {
      console.log('On login page, entering credentials...');

      // Use page.act() - THIS IS THE CORRECT WAY
      await agent.act(`Enter "${N8N_EMAIL}" in the email field`);
      await agent.wait(1000);

      await agent.act(`Enter "${N8N_PASSWORD}" in the password field`);
      await agent.wait(1000);

      await agent.act('Click the login button');
      await agent.wait(5000);

      console.log('✅ Login completed');
    } else {
      console.log('Already logged in or on dashboard');
    }

    // Step 3: Navigate to workflows
    console.log('\n📋 Step 3: Going to workflows...');
    const url = await agent.getUrl();

    if (!url.includes('/workflows')) {
      await agent.act('Click on Workflows in the navigation');
      await agent.wait(3000);
    }

    // Step 4: Create a new workflow using act()
    console.log('\n✨ Step 4: Creating new workflow...');
    await agent.act('Click the button to create a new workflow');
    await agent.wait(5000);

    // Step 5: Add nodes to the workflow using page.act()
    console.log('\n🎯 Step 5: Building workflow with nodes...');

    // Add Webhook trigger
    console.log('Adding Webhook trigger node...');
    await agent.act('Add a Webhook trigger node to the workflow');
    await agent.wait(3000);

    // Add HTTP Request node
    console.log('Adding HTTP Request node...');
    await agent.act('Add an HTTP Request node to the workflow');
    await agent.wait(3000);

    // Connect the nodes
    console.log('Connecting the nodes...');
    await agent.act('Connect the Webhook node to the HTTP Request node');
    await agent.wait(2000);

    // Step 6: Extract workflow details using page.extract()
    console.log('\n📊 Step 6: Extracting workflow details...');
    const workflowDetails = await agent.extract('Get the workflow name and number of nodes');
    console.log('Workflow Details:', workflowDetails);

    // Step 7: Save the workflow
    console.log('\n💾 Step 7: Saving workflow...');
    await agent.act('Click the save button to save the workflow');
    await agent.wait(2000);

    // Step 8: Take screenshot
    console.log('\n📸 Step 8: Taking screenshot...');
    await agent.screenshot('n8n-workflow-corrected.png');

    console.log('\n✅ Workflow automation completed successfully!');
    console.log('\n📋 Summary:');
    console.log('  - Used corrected page.act() API ✓');
    console.log('  - Used corrected page.extract() API ✓');
    console.log('  - Created workflow with nodes ✓');
    console.log('  - Screenshot saved ✓');

  } catch (error) {
    console.error('\n❌ Error during automation:', error);
    console.error('Stack trace:', error.stack);

    // Take error screenshot
    try {
      await agent.screenshot('n8n-error.png');
      console.log('📸 Error screenshot saved');
    } catch (screenshotError) {
      console.error('Could not save error screenshot');
    }
  } finally {
    // Keep browser open for 10 seconds to see the result
    console.log('\n⏳ Keeping browser open for 10 seconds...');
    await agent.wait(10000);

    await agent.close();
  }
}

// Run the automation
automateN8NWorkflow();
