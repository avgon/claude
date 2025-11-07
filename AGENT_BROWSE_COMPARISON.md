# agent-browse Architecture Analysis

## Overview

After examining the official **browserbase/agent-browse** repository, I now understand the complete architecture. This document compares the official implementation with our custom implementation.

## Architecture Comparison

### Official agent-browse

```
┌─────────────────────────────────────────────────────┐
│  agent-browse.ts (Main Entry Point)                │
│  - Claude Agent SDK integration                     │
│  - Conversational loop using query()                │
│  - System prompt with CLI commands                  │
└──────────────┬──────────────────────────────────────┘
               │
               ├─> Bash commands called by Claude
               │
┌──────────────▼──────────────────────────────────────┐
│  src/cli.ts (CLI Tool)                              │
│  - navigate <url>                                   │
│  - act "<action>"                                   │
│  - extract "<instruction>" [schema]                 │
│  - observe "<query>"                                │
│  - screenshot                                       │
│  - close                                            │
└──────────────┬──────────────────────────────────────┘
               │
               ├─> Persistent browser state
               │   (module-level variables)
               │
┌──────────────▼──────────────────────────────────────┐
│  @browserbasehq/stagehand                           │
│  - page.act()                                       │
│  - page.extract()                                   │
│  - page.observe()                                   │
└─────────────────────────────────────────────────────┘
```

### Our Implementation

```
┌─────────────────────────────────────────────────────┐
│  .claude/skills/browser-automation/SKILL.md        │
│  - Claude Code skill definition                     │
│  - Usage documentation                              │
└──────────────┬──────────────────────────────────────┘
               │
               ├─> Direct JavaScript import
               │
┌──────────────▼──────────────────────────────────────┐
│  src/browser-agent.js (Module)                      │
│  - BrowserAgent class                               │
│  - init(), goto(), act(), extract(), observe()      │
│  - agent(), screenshot(), close()                   │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│  @browserbasehq/stagehand                           │
│  - page.act()                                       │
│  - page.extract()                                   │
│  - page.observe()                                   │
└─────────────────────────────────────────────────────┘
```

## Key Differences

| Aspect | agent-browse | Our Implementation |
|--------|-------------|-------------------|
| **Integration Method** | CLI tool + Claude Agent SDK | Direct JavaScript module |
| **Command Interface** | Bash commands (tsx src/cli.ts) | JavaScript API (import & call) |
| **Browser State** | Persistent (module variables) | Per-instance (class-based) |
| **Output Format** | JSON to stdout | JavaScript objects |
| **Screenshots** | Automatic on every action | Manual via screenshot() |
| **Chrome Profile** | Copies user profile to `.chrome-profile` | Uses default or Browserbase |
| **Claude SDK** | Uses @anthropic-ai/claude-agent-sdk | No SDK integration |
| **Multi-turn Conversations** | Yes (query() with async generator) | No (single-session usage) |

## agent-browse Core Components

### 1. agent-browse.ts (Main Entry)

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

// Creates conversational loop
const q = query({
  prompt: generateMessages(),
  options: {
    systemPrompt: {
      type: 'preset',
      preset: 'claude_code',
      append: `
        # Browser Automation via CLI
        - tsx src/cli.ts navigate <url>
        - tsx src/cli.ts act "<action>"
        - tsx src/cli.ts extract "<instruction>" '{"field": "type"}'
        ...
      `
    }
  }
});
```

**Key Features:**
- Uses Claude Agent SDK's `query()` function
- Async generator for multi-turn conversations
- System prompt tells Claude how to use CLI commands
- Pretty colored output for terminal display

### 2. src/cli.ts (CLI Tool)

```typescript
// Persistent browser state (module-level)
let stagehandInstance: Stagehand | null = null;
let currentPage: any = null;
let chromeProcess: ChildProcess | null = null;

async function initBrowser() {
  if (stagehandInstance) {
    return { stagehand: stagehandInstance, page: currentPage };
  }

  // Launch Chrome with CDP
  const cdpPort = 9222;
  chromeProcess = spawn(chromePath, [
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${tempUserDataDir}`,
    '--window-position=-9999,-9999',
  ]);

  // Connect Stagehand to CDP
  stagehandInstance = new Stagehand({
    env: "LOCAL",
    modelName: "anthropic/claude-haiku-4-5-20251001",
    localBrowserLaunchOptions: {
      cdpUrl: `http://localhost:${cdpPort}`,
    },
  });

  await stagehandInstance.init();
  currentPage = stagehandInstance.page;
  return { stagehand: stagehandInstance, page: currentPage };
}

async function act(action: string) {
  const { page } = await initBrowser();
  await page.act(action);
  const screenshotPath = await takeScreenshot(page, PLUGIN_ROOT);
  return {
    success: true,
    message: `Successfully performed action: ${action}`,
    screenshot: screenshotPath
  };
}
```

**Key Features:**
- Browser persists between CLI invocations
- Uses CDP to connect to existing Chrome
- Always takes screenshot after actions
- Outputs JSON to stdout
- Browser stays open until explicit `close` command

### 3. src/browser-utils.ts

```typescript
export function prepareChromeProfile(pluginRoot: string) {
  const sourceUserDataDir = getChromeUserDataDir();
  const tempUserDataDir = join(pluginRoot, '.chrome-profile');

  // Copy user's Chrome profile (first run only)
  if (!existsSync(tempUserDataDir)) {
    cpSync(sourceDefaultProfile, destDefaultProfile, { recursive: true });
  }
}

export async function takeScreenshot(page: Page, pluginRoot: string) {
  // Use CDP to capture screenshot
  const client = await context.newCDPSession(page);
  const screenshotResult = await client.send('Page.captureScreenshot', {
    format: 'png',
    quality: 100,
  });

  // Resize if > 2000x2000
  if (width > 2000 || height > 2000) {
    finalBuffer = await sharp(buffer).resize(2000, 2000, {
      fit: 'inside'
    }).toBuffer();
  }

  return screenshotPath;
}
```

**Key Features:**
- Copies Chrome profile for session persistence
- Resizes screenshots to max 2000x2000
- Uses CDP for direct screenshot capture
- Stores screenshots in `agent/browser_screenshots/`

## Why CLI Approach?

The CLI-based approach has several advantages for Claude Code integration:

### 1. **Stateless Tool Calls**
Each bash command is independent, but browser state persists. Claude can call commands multiple times without managing browser lifecycle.

### 2. **Better Error Handling**
JSON output makes it easy for Claude to detect success/failure:
```json
{
  "success": true,
  "message": "Successfully performed action",
  "screenshot": "/path/to/screenshot.png"
}
```

### 3. **Screenshot Integration**
Every action automatically includes a screenshot, giving Claude visual feedback.

### 4. **Session Persistence**
Browser stays open between commands, making it much faster than reinitializing each time.

### 5. **Chrome Profile Copying**
Using user's actual Chrome profile means:
- All cookies and sessions are available
- Login states persist
- Preferences are maintained

## Our Implementation Advantages

While different from agent-browse, our implementation has benefits:

### 1. **Direct API Access**
No CLI overhead - direct JavaScript function calls.

### 2. **Programmatic Control**
Better for scripting and automation workflows:
```javascript
const agent = new BrowserAgent();
await agent.init();
for (const url of urls) {
  await agent.goto(url);
  const data = await agent.extract('get all links');
  results.push(data);
}
await agent.close();
```

### 3. **Flexible Architecture**
Can be used as:
- Direct module import
- CLI tool (can add wrapper)
- Claude Code skill
- Standalone script

### 4. **Enhanced Integrations**
Includes additional features:
- Token efficiency (gpt-tokenizer)
- Memory layer (future)
- Tavily search (future)
- Multiple automation examples

## Recommended Hybrid Approach

We can combine both approaches:

```
┌─────────────────────────────────────────────────────┐
│  CLI Wrapper (tsx cli.ts)                          │
│  - For Claude Code integration                      │
│  - JSON output                                      │
│  - Persistent browser                               │
└──────────────┬──────────────────────────────────────┘
               │
               ├─> Calls
               │
┌──────────────▼──────────────────────────────────────┐
│  src/browser-agent.js                               │
│  - Core automation logic                            │
│  - For programmatic usage                           │
│  - Direct API                                       │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│  @browserbasehq/stagehand                           │
└─────────────────────────────────────────────────────┘
```

## Implementation Recommendations

### 1. Create CLI Wrapper (High Priority)
Add `src/cli.js` similar to agent-browse:
- Commands: navigate, act, extract, observe, screenshot, close
- JSON output format
- Persistent browser state
- Automatic screenshots

### 2. Add Claude Agent SDK Integration (Medium Priority)
Create optional `agent-browse.js` entry point:
- Multi-turn conversations
- Colored terminal output
- Interactive mode

### 3. Chrome Profile Management (Medium Priority)
Add `prepareChromeProfile()`:
- Copy user's Chrome profile
- Store in `.chrome-profile/`
- Enable session persistence

### 4. Screenshot Enhancement (Low Priority)
Improve screenshot handling:
- Automatic capture after actions
- Image resizing with sharp
- Store in organized directory

## Conclusion

**agent-browse** uses a CLI-based architecture optimized for Claude Agent SDK integration with:
- Persistent browser state
- JSON output format
- Automatic screenshots
- Chrome profile copying

**Our implementation** uses a direct module approach optimized for:
- Programmatic control
- Scripting automation
- Flexible usage patterns

**Best path forward**: Create a CLI wrapper that uses our existing browser-agent.js as the core, giving us both approaches:
- CLI for Claude Code integration
- Module for programmatic usage

This gives us the best of both worlds while maintaining code reusability.
