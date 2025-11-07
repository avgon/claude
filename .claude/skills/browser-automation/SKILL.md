---
name: browser-automation
description: AI-powered browser automation using Stagehand for n8n, Make, and Weavy.ai workflows
---

# Browser Automation Skill

Control web browsers using natural language instructions powered by Stagehand.

## When to Use This Skill

Use this skill when you need to:
- Automate browser interactions with n8n, Make, or Weavy.ai
- Create workflow automation in browser-based tools
- Extract data from web applications
- Test web interfaces
- Fill forms automatically
- Navigate and interact with websites using natural language

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

## Examples

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
