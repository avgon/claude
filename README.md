# 🎭 Stagehand Browser Agent for Claude Code

AI-powered browser automation skill that enables Claude Code to interface with browsers using natural language instructions through Stagehand framework.

## 🌟 Features

- **Natural Language Control**: Control browsers using simple instructions
- **Context-Efficient**: More efficient than native Playwright by using natural language
- **Multi-Platform Support**: Works with n8n, Make, Weavy.ai, and other automation platforms
- **Four Core Primitives**:
  - `act()` - Execute actions with natural language
  - `extract()` - Pull structured data from pages
  - `observe()` - Preview available actions
  - `agent()` - Autonomous multi-step task execution

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

## 📖 Documentation

- [Stagehand Documentation](https://docs.stagehand.dev/)
- [Browserbase](https://www.browserbase.com/)

## 🤝 Contributing

Contributions are welcome! This is a Claude Code skill for browser automation.

## 📝 License

MIT

## 🙏 Acknowledgments

Built with [Stagehand](https://github.com/browserbase/stagehand) by Browserbase.
