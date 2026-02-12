import { query } from '@anthropic-ai/claude-agent-sdk';
import * as readline from 'readline';
import { SYSTEM_PROMPT } from './src/system-prompt.js';

// ANSI color codes
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
};

function banner() {
  console.log(`
${c.bold}${c.cyan}================================================================${c.reset}
${c.bold}${c.yellow}  CRYPTO AGENT${c.reset} ${c.dim}v1.0.0${c.reset}
${c.dim}  AI Architect | Crypto Trade Guru | OpenClaw Expert${c.reset}
${c.bold}${c.cyan}================================================================${c.reset}
${c.dim}  Capabilities:${c.reset}
${c.green}    [TRADE]${c.reset}    Live prices, technical analysis, trade signals
${c.green}    [ARCH]${c.reset}     DeFi protocol design, system architecture
${c.green}    [CLAW]${c.reset}     OpenClaw smart contracts, legal agreements
${c.green}    [CHAIN]${c.reset}    On-chain analytics, wallet tracking, gas
${c.dim}  Type "exit" or "quit" to end session${c.reset}
${c.bold}${c.cyan}================================================================${c.reset}
`);
}

async function main() {
  banner();

  const args = process.argv.slice(2);
  const hasInitialPrompt = args.length > 0;
  const initialPrompt = hasInitialPrompt ? args.join(' ') : null;

  if (hasInitialPrompt) {
    console.log(`${c.dim}────────────────────────────────────────${c.reset}`);
    console.log(`${c.bold}${c.cyan}You:${c.reset} ${initialPrompt}`);
    console.log(`${c.dim}────────────────────────────────────────${c.reset}\n`);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const getUserInput = (prompt = `\n${c.bold}${c.cyan}You:${c.reset} `): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, (answer) => resolve(answer));
    });
  };

  let shouldPromptUser = !hasInitialPrompt;
  let conversationActive = true;

  async function* generateMessages() {
    if (initialPrompt) {
      yield {
        type: 'user' as const,
        message: { role: 'user' as const, content: initialPrompt },
        parent_tool_use_id: null,
        session_id: 'crypto-session',
      };
    }

    while (conversationActive) {
      while (!shouldPromptUser && conversationActive) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (!conversationActive) break;

      shouldPromptUser = false;
      const userInput = await getUserInput();

      if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
        conversationActive = false;
        console.log(`\n${c.dim}Session ended. Trade wisely.${c.reset}`);
        break;
      }

      yield {
        type: 'user' as const,
        message: { role: 'user' as const, content: userInput },
        parent_tool_use_id: null,
        session_id: 'crypto-session',
      };
    }
  }

  const q = query({
    prompt: generateMessages(),
    options: {
      systemPrompt: {
        type: 'preset',
        preset: 'claude_code',
        append: SYSTEM_PROMPT,
      },
      maxTurns: 200,
      cwd: process.cwd(),
      model: 'sonnet',
      executable: 'node',
    },
  });

  for await (const message of q) {
    if (message.type === 'assistant' && message.message) {
      const textContent = message.message.content.find((block: any) => block.type === 'text');
      if (textContent && 'text' in textContent) {
        console.log(`\n${c.bold}${c.magenta}Agent:${c.reset} ${textContent.text}`);
      }

      const toolUses = message.message.content.filter((block: any) => block.type === 'tool_use');
      for (const toolUse of toolUses) {
        const name = (toolUse as any).name;
        console.log(`\n${c.blue}[TOOL]${c.reset} ${c.bold}${name}${c.reset}`);
        const input = JSON.stringify((toolUse as any).input, null, 2);
        const indented = input
          .split('\n')
          .map((line) => `  ${c.dim}${line}${c.reset}`)
          .join('\n');
        console.log(indented);
      }
    }

    if (message.type === 'user' && message.message) {
      const content = message.message.content;
      if (Array.isArray(content)) {
        const toolResults = content.filter((block: any) => block.type === 'tool_result');
        for (const result of toolResults as any[]) {
          if (result.is_error) {
            const errorText =
              typeof result.content === 'string'
                ? result.content
                : JSON.stringify(result.content);
            console.log(`\n${c.red}[ERROR]${c.reset} ${errorText}`);
            continue;
          }
          if (result.content) {
            if (typeof result.content === 'string') {
              console.log(`\n${c.green}[OK]${c.reset} ${c.dim}${result.content}${c.reset}`);
            } else if (Array.isArray(result.content)) {
              const text = result.content.find((block: any) => block.type === 'text');
              if (text) {
                console.log(`\n${c.green}[OK]${c.reset} ${c.dim}${text.text}${c.reset}`);
              }
            }
          }
        }
      }
    }

    if (message.type === 'result') {
      shouldPromptUser = true;
    }
  }

  rl.close();
  process.exit(0);
}

process.on('SIGINT', () => {
  console.log(`\n${c.dim}Interrupted. Goodbye.${c.reset}`);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(`\n${c.dim}Terminated. Goodbye.${c.reset}`);
  process.exit(0);
});

main().catch(console.error);
