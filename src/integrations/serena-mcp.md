# Serena MCP Server Integration

## Overview
Serena is a powerful coding agent toolkit that provides semantic retrieval and editing capabilities through the Model Context Protocol (MCP).

## Purpose
**Session Speed** - Serena speeds up AI responses by pre-indexing your project and creating efficient memory files for better context understanding.

## Installation

Serena is a Python-based MCP server. Install it using:

```bash
# Using uvx (recommended)
uvx serena

# Or clone from GitHub
git clone https://github.com/oraios/serena
cd serena
pip install -e .
```

## Requirements
- Python 3.11+
- MCP-compatible AI assistant (Claude Code, Cursor, Cline, etc.)

## Configuration

Add to your MCP settings (e.g., Claude Code settings):

```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": ["serena"],
      "env": {
        "PROJECT_PATH": "/path/to/your/project"
      }
    }
  }
}
```

## Features

### 1. Pre-indexing for Speed
```bash
# Pre-index your project for faster responses
serena index /path/to/project
```

### 2. Semantic Code Retrieval
Serena creates memory files in `.serena/memories` to understand your project efficiently.

### 3. Context-Aware Editing
Provides semantic search and editing capabilities for codebases.

## Benefits for Automation

- **Faster Workflow Creation**: Quick understanding of existing automation patterns
- **Token Efficiency**: Reduces redundant context loading
- **Smart Code Navigation**: Semantic search across n8n, Make, Weavy configs

## Usage with Browser Agent

```javascript
// Serena runs as MCP server in background
// Your browser agent can work faster with pre-indexed project context

import BrowserAgent from '../browser-agent.js';

// Serena speeds up the agent by providing cached context
const agent = new BrowserAgent();
await agent.init();

// Agent benefits from Serena's pre-indexed knowledge
await agent.agent('Create a workflow based on our existing patterns');
```

## Resources

- GitHub: https://github.com/oraios/serena
- MCP Marketplace: https://playbooks.com/mcp/oraios-serena
- Documentation: Check GitHub README
