# 🎭 Stagehand Browser Agent for Claude Code

AI-powered browser automation skill with enhanced capabilities for workflow automation. Integrates Stagehand, Tavily, memory management, and token optimization for efficient automation creation.

## 🌟 Features

### Browser Automation (Stagehand)
- **Natural Language Control**: Control browsers using simple instructions
- **Context-Efficient**: More efficient than native Playwright
- **Multi-Platform Support**: Works with n8n, Make, Weavy.ai
- **Four Core Primitives**:
  - `act()` - Execute actions with natural language
  - `extract()` - Pull structured data from pages
  - `observe()` - Preview available actions
  - `agent()` - Autonomous multi-step task execution

### Enhanced Integrations

#### 🔍 Tavily Search (Web Search)
- Real-time web search optimized for LLMs
- Search automation documentation
- Domain filtering for targeted searches
- Quick answers without full results

#### ⚡ Token Efficiency (Sequential)
- Count and optimize tokens
- Reduce prompt costs by 30-50%
- Split text into efficient chunks
- Estimate API costs

#### 🧠 Memory Layer (Mindbase Alternative)
- Persistent session memory
- Store workflow context
- Learn from automation experiences
- Remember user preferences

#### 🚀 Serena MCP (Session Speed)
- Semantic code retrieval
- Pre-indexing for faster responses
- Context-aware project understanding
- Runs as MCP server in background

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_key_here
```

### Basic Usage

```javascript
import BrowserAgent from './src/browser-agent.js';

const agent = new BrowserAgent();

await agent.init();
await agent.goto('https://example.com');
await agent.act('click the login button');
await agent.extract('get all product names');
await agent.close();
```

## 📚 Examples

### Creating n8n Workflows

```javascript
import BrowserAgent from './src/browser-agent.js';

const agent = new BrowserAgent();
await agent.init();
await agent.goto('https://app.n8n.cloud/');
await agent.act('create a new workflow');
await agent.act('add a webhook trigger node');
await agent.act('add an HTTP request node');
await agent.act('connect the nodes');
await agent.close();
```

### Extracting Data

```javascript
const workflows = await agent.extract('get all workflow names and their status');
console.log(workflows);
```

### Autonomous Tasks

```javascript
await agent.agent(
  'Create a workflow that triggers on webhook, fetches data from an API, and sends to another endpoint'
);
```

## 🛠️ API Reference

### `new BrowserAgent(options)`

Create a new browser agent instance.

**Options:**
- `headless` (boolean): Run browser in headless mode
- `debugMode` (boolean): Enable debug logging
- `browserbaseApiKey` (string): Browserbase API key for cloud browsers
- `browserbaseProjectId` (string): Browserbase project ID

### `agent.init()`

Initialize the browser.

### `agent.goto(url)`

Navigate to a URL.

### `agent.act(instruction, options)`

Perform an action using natural language.

**Parameters:**
- `instruction` (string): Natural language instruction
- `options` (object): Additional options

### `agent.extract(instruction, schema)`

Extract data from the page.

**Parameters:**
- `instruction` (string): What to extract
- `schema` (object): Optional Zod schema for structured extraction

### `agent.observe(instruction)`

Observe available actions on the page.

### `agent.agent(goal, options)`

Execute autonomous multi-step tasks.

**Parameters:**
- `goal` (string): The goal to achieve
- `options` (object): Additional options

### `agent.screenshot(path)`

Take a screenshot.

### `agent.close()`

Close the browser.

## 🎯 Use Cases

- **Workflow Automation**: Create and manage workflows in n8n, Make, Weavy.ai
- **Data Extraction**: Pull structured data from web applications
- **Testing**: Automate browser testing with natural language
- **Web Scraping**: Extract information from websites intelligently
- **Form Filling**: Automate form submissions and data entry

## 🔧 Advanced Configuration

### Using Browserbase Cloud Browsers

Add to your `.env`:
```
BROWSERBASE_API_KEY=your_key
BROWSERBASE_PROJECT_ID=your_project_id
```

The agent will automatically use cloud browsers when these are configured.

### Custom Options

```javascript
const agent = new BrowserAgent({
  headless: true,
  debugMode: false,
  browserbaseApiKey: 'key',
  browserbaseProjectId: 'project'
});
```

## 🎯 Complete Workflow Example

```javascript
import BrowserAgent from './src/browser-agent.js';
import TavilySearch from './src/integrations/tavily-search.js';
import TokenEfficiency from './src/integrations/token-efficiency.js';
import MemoryLayer from './src/integrations/memory-layer.js';

// Initialize all components
const browser = new BrowserAgent();
const search = new TavilySearch();
const tokenizer = new TokenEfficiency();
const memory = new MemoryLayer();

// 1. Search for documentation
const docs = await search.searchAutomationDocs('n8n', 'webhook setup');

// 2. Optimize your prompt
const optimized = tokenizer.optimizePrompt(myPrompt);
console.log(`Saved ${optimized.savingsPercent}% tokens`);

// 3. Store in memory
await memory.storeWorkflowContext('my-flow', { docs, optimized });

// 4. Automate with browser
await browser.init();
await browser.goto('https://app.n8n.cloud/');
await browser.agent(optimized.optimized);

// 5. Learn from experience
await memory.learn('Always configure authentication', { platform: 'n8n' });
```

## 🔧 Integration Details

### Tavily Search
```bash
# Get API key from https://tavily.com
TAVILY_API_KEY=your_key
```

```javascript
const search = new TavilySearch();
const results = await search.search('n8n webhook tutorial');
const docs = await search.searchAutomationDocs('n8n', 'HTTP node');
```

### Token Efficiency
```javascript
const te = new TokenEfficiency();

// Count tokens
const count = te.countTokens('Hello world');

// Optimize prompt (30-50% reduction)
const opt = te.optimizePrompt('I think this is basically very good');

// Estimate costs
const cost = te.estimateCost(1000, 500, 'gpt-4');
```

### Memory Layer
```javascript
const memory = new MemoryLayer();

// Store workflow
await memory.storeWorkflowContext('api-flow', {
  platform: 'n8n',
  nodes: ['webhook', 'http']
});

// Learn
await memory.learn('Use error workflows for robustness', {
  platform: 'n8n'
});

// Remember preferences
await memory.rememberPreference('defaultPlatform', 'n8n');
```

### Serena MCP (Session Speed)

Serena runs as an MCP server. Install separately:

```bash
# Install Serena
uvx serena

# Pre-index your project for faster responses
serena index /path/to/project
```

Add to your Claude Code MCP settings:
```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": ["serena"]
    }
  }
}
```

See `src/integrations/serena-mcp.md` for details.

## 📚 Examples

Run complete examples:

```bash
# Complete workflow with all integrations
node src/examples/complete-automation-example.js complete

# Build workflow with research
node src/examples/complete-automation-example.js research data-processing

# Efficient batch automation
node src/examples/complete-automation-example.js batch "task1" "task2"
```

## 🏗️ Architecture

```
claude-stagehand-browser-skill/
├── src/
│   ├── browser-agent.js           # Main browser automation
│   ├── claude-agent-integration.js # Claude SDK integration
│   ├── integrations/
│   │   ├── tavily-search.js       # Web search
│   │   ├── token-efficiency.js    # Token optimization
│   │   ├── memory-layer.js        # Persistent memory
│   │   └── serena-mcp.md          # Serena setup guide
│   └── examples/
│       ├── automation-flows.js    # n8n, Make examples
│       └── complete-automation-example.js # All features
├── package.json
├── .env.example
└── README.md
```

## 📖 Documentation

- [Stagehand Documentation](https://docs.stagehand.dev/)
- [Browserbase](https://www.browserbase.com/)
- [Tavily API](https://docs.tavily.com/)
- [Serena GitHub](https://github.com/oraios/serena)

## 💡 Why These Integrations?

- **Serena**: 🚀 Speeds up sessions via semantic code indexing
- **Token Efficiency**: ⚡ Reduces costs by 30-50% through optimization
- **Tavily**: 🔍 LLM-optimized search for finding automation docs
- **Memory Layer**: 🧠 Persistent context across automation sessions

## 🤝 Contributing

Contributions are welcome! This is a comprehensive Claude Code skill for browser automation.

## 📝 License

MIT

## 🙏 Acknowledgments

Built with:
- [Stagehand](https://github.com/browserbase/stagehand) by Browserbase
- [agent-browse](https://github.com/browserbase/agent-browse) for Claude SDK
- [Tavily](https://www.tavily.com/) for AI search
- [Serena](https://github.com/oraios/serena) for semantic retrieval
- Supermemory for memory management
