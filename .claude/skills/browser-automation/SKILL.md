---
name: browser-automation
description: AI-powered browser automation using Stagehand for n8n, Make, and Weavy.ai workflows (project)
---

# Browser Automation Skill

Control web browsers using natural language instructions powered by Stagehand. Compatible with agent-browse architecture.

## When to Use This Skill

Use this skill when you need to:
- Automate browser interactions with n8n, Make, or Weavy.ai
- Create workflow automation in browser-based tools
- Extract data from web applications
- Test web interfaces
- Fill forms automatically
- Navigate and interact with websites using natural language

## Usage Methods

### Method 1: CLI Commands (Recommended for Claude Code)

Use bash commands to control the browser. The browser stays open between commands for faster operations.

**Available commands:**
```bash
node src/cli.js navigate <url>           # Navigate to a URL
node src/cli.js act "<action>"           # Perform natural language action
node src/cli.js extract "<instruction>"  # Extract data from page
node src/cli.js observe "<query>"        # Discover elements on page
node src/cli.js agent "<goal>"           # Execute multi-step autonomous goal
node src/cli.js screenshot               # Take a screenshot
node src/cli.js info                     # Get current page info
node src/cli.js close                    # Close the browser
```

All commands output JSON with success status and relevant data.

### Method 2: Direct JavaScript API

For programmatic usage and custom scripts.

## Available Capabilities

### 1. Navigate to URLs
```javascript
await agent.goto('https://example.com');
```

### 2. Perform Actions (Natural Language)
```javascript
await agent.act('click the login button');
await agent.act('enter "user@example.com" in the email field');
await agent.act('click submit');
```

### 3. Extract Data
```javascript
const data = await agent.extract('get all workflow names and their status');
```

### 4. Multi-Step Tasks (Agent Mode)
```javascript
await agent.agent('Create a webhook workflow with HTTP request nodes');
```

### 5. Take Screenshots
```javascript
await agent.screenshot('workflow-created.png');
```

## CLI Examples

### Example 1: Simple Navigation and Action
```bash
# Navigate to a website
node src/cli.js navigate "https://example.com"
# Output: { "success": true, "message": "Successfully navigated...", "screenshot": "..." }

# Perform an action
node src/cli.js act "click the login button"
# Output: { "success": true, "message": "Successfully performed action...", "screenshot": "..." }

# Take screenshot
node src/cli.js screenshot
# Output: { "success": true, "screenshot": "/path/to/screenshot.png" }

# Close browser when done
node src/cli.js close
# Output: { "success": true, "message": "Browser closed" }
```

### Example 2: Multi-Step Workflow
```bash
# Navigate to n8n
node src/cli.js navigate "https://app.n8n.cloud/"

# Login
node src/cli.js act "enter 'user@example.com' in the email field"
node src/cli.js act "enter 'password123' in the password field"
node src/cli.js act "click the login button"

# Extract workflows
node src/cli.js extract "get all workflow names and their status"
# Output: { "success": true, "data": { "workflows": [...] }, "screenshot": "..." }

# Close browser
node src/cli.js close
```

### Example 3: Using Agent for Complex Goals
```bash
# Navigate first
node src/cli.js navigate "https://app.n8n.cloud/workflows"

# Let the agent handle multi-step task
node src/cli.js agent "Create a new workflow with a webhook trigger and HTTP request node, then save it"
# The agent will autonomously complete all steps

# Close when done
node src/cli.js close
```

## JavaScript API Examples

### Example 1: Login to n8n
```javascript
import BrowserAgent from './src/browser-agent.js';

const agent = new BrowserAgent();
await agent.init();
await agent.goto('https://app.n8n.cloud/');
await agent.act('enter "user@example.com" in email field');
await agent.act('enter "password123" in password field');
await agent.act('click the login button');
await agent.wait(3000);
```

### Example 2: Create n8n Workflow
```javascript
await agent.goto('https://app.n8n.cloud/workflows');
await agent.act('click create new workflow button');
await agent.act('add a webhook trigger node');
await agent.act('add an HTTP request node');
await agent.act('connect the webhook to HTTP request');
await agent.act('save the workflow');
```

### Example 3: Extract Workflow Data
```javascript
const workflows = await agent.extract({
  instruction: 'get all workflow names, status, and last execution time',
  schema: z.object({
    workflows: z.array(z.object({
      name: z.string(),
      status: z.string(),
      lastRun: z.string().optional()
    }))
  })
});
```

## Instructions for Using This Skill

1. **Initialize the Agent**
   - Import BrowserAgent from `./src/browser-agent.js`
   - Create instance: `const agent = new BrowserAgent()`
   - Initialize: `await agent.init()`

2. **Navigate to Target**
   - Use `await agent.goto(url)` to navigate
   - Wait for page load: `await agent.wait(milliseconds)`

3. **Interact with Page**
   - Use natural language with `act()`: "click X", "enter Y in Z field", "select option from dropdown"
   - Be specific about element descriptions
   - Wait between actions if needed

4. **Extract Information**
   - Use `extract()` with clear instructions
   - Optionally provide Zod schema for structured data
   - Data will be returned as JavaScript object

5. **Complex Automation**
   - Use `agent()` method for multi-step goals
   - Provide clear, specific goal description
   - The agent will autonomously complete the task

6. **Cleanup**
   - Always call `await agent.close()` when done
   - Use try/finally blocks for reliable cleanup

## Environment Variables

Create a `.env` file with:
```bash
# Required for AI features
OPENAI_API_KEY=your_openai_key

# Optional: Browserbase cloud browsers
BROWSERBASE_API_KEY=your_key
BROWSERBASE_PROJECT_ID=your_project_id

# Optional: Browser settings
HEADLESS=false
DEBUG_MODE=true
```

## Integration with Enhanced Features

### Token Efficiency
```javascript
import TokenEfficiency from './src/integrations/token-efficiency.js';
const tokenizer = new TokenEfficiency();
const optimized = tokenizer.optimizePrompt(myPrompt);
```

### Memory Layer
```javascript
import MemoryLayer from './src/integrations/memory-layer.js';
const memory = new MemoryLayer();
await memory.storeWorkflowContext('my-flow', workflowData);
```

### Tavily Search
```javascript
import TavilySearch from './src/integrations/tavily-search.js';
const search = new TavilySearch();
const docs = await search.searchAutomationDocs('n8n', 'webhook setup');
```

## Common Patterns

### Pattern: Login Flow
```javascript
await agent.goto(loginUrl);
await agent.act(`enter "${email}" in email field`);
await agent.act(`enter "${password}" in password field`);
await agent.act('click login button');
await agent.wait(3000); // Wait for redirect
```

### Pattern: Form Filling
```javascript
await agent.act('click the new item button');
await agent.wait(1000);
await agent.act('enter "Item Name" in the name field');
await agent.act('select "Category" from dropdown');
await agent.act('click save');
```

### Pattern: Data Collection
```javascript
const data = await agent.extract('get all items with their names, prices, and availability');
await memory.store('collected-data', data);
```

## Troubleshooting

### Issue: "act is not a function"
- **Solution**: Ensure you're using the latest browser-agent.js with corrected API
- Methods are called on `page` object: `await this.page.act()`

### Issue: Actions not executing
- **Solution**: Add wait times between actions
- Check if element descriptions are specific enough
- Use `observe()` to see available actions

### Issue: Extract returns empty data
- **Solution**: Be more specific in instruction
- Ensure page is fully loaded
- Provide schema for structured extraction

## Best Practices

1. **Be Specific**: Use detailed element descriptions ("blue submit button" not "button")
2. **Wait Strategically**: Add waits after navigation and major actions
3. **Error Handling**: Wrap automation in try/catch blocks
4. **Screenshots**: Take screenshots at key steps for debugging
5. **Progressive Steps**: Break complex tasks into smaller act() calls
6. **Memory Usage**: Store important workflow context for future sessions

## Related Tools

- **Stagehand**: https://docs.stagehand.dev/
- **Browserbase**: https://www.browserbase.com/
- **n8n Documentation**: https://docs.n8n.io/
- **Make Documentation**: https://www.make.com/en/help
