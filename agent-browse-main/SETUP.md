# Setup Guide

## API Key Configuration

### 1. Create .env file

```bash
cp .env.example .env
```

### 2. Get your Anthropic API Key

Visit: https://console.anthropic.com/settings/keys

### 3. Edit .env file

Open `.env` and replace `your-api-key-here` with your actual API key:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

### 4. Verify

```bash
cat .env
```

You should see:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

## Installation

```bash
npm install
```

## Usage

### Interactive Mode
```bash
npm run claude
```

Then tell the agent what to do:
```
Go to google.com and search for "Stagehand"
```

### CLI Mode
```bash
tsx src/cli.ts navigate "https://example.com"
tsx src/cli.ts act "click the button"
tsx src/cli.ts close
```

### Single Command
```bash
npm run claude -- "Go to Hacker News and get the top post"
```

## Troubleshooting

### API Key Error
```
Error: ANTHROPIC_API_KEY not found
```

Solution: Make sure you created `.env` file and added your API key.

### Chrome Not Found
```
Error: Could not find Chrome installation
```

Solution:
- **Linux**: `sudo apt install google-chrome-stable`
- **macOS**: Download from https://www.google.com/chrome/
- **Windows**: Download from https://www.google.com/chrome/

### Refresh Profile
If you need to clear cookies/sessions:
```bash
rm -rf .chrome-profile
```

## Example: n8n Workflow Automation

```bash
npm run claude -- "Go to https://n8n-fjzd-production.up.railway.app/, login with mkilagoz@gmail.com / 6297834Nn, create a workflow with webhook and HTTP request nodes"
```

The agent will handle everything automatically!
