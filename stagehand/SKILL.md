---
name: stagehand
description: AI-powered browser automation using Stagehand SDK with Google Gemini (preferred LLM). Use when users need intelligent web automation that adapts to dynamic elements, extracts structured data, or performs multi-step workflows. Trigger phrases include "test the UI", "extract data from page", "fill this form intelligently", "automate the checkout flow", "run UAT tests", or any request for AI-guided browser interaction.
---

# Stagehand: AI Browser Automation

Stagehand is an AI-powered browser automation framework by Browserbase. Unlike traditional selectors, it uses natural language to find elements and adapts automatically when websites change.

**Preferred LLM: Google Gemini** - This skill is configured to use `gemini-2.0-flash` as the default model for browser-based AI tasks due to its speed and multimodal capabilities.

## Quick Start

```bash
# Navigate to skill directory
cd /opt/agency-workspace/skills/stagehand

# Google Gemini is pre-configured in .env
# API key is already set up

# Run the setup (installs deps + Chromium)
./server.sh

# Run a task
npx tsx scripts/run-task.ts
```

## When to Use Stagehand vs Dev Browser

| Use Case | Stagehand | Dev Browser |
|----------|-----------|-------------|
| Dynamic/unknown layouts | ✅ AI discovers elements | ❌ Need known selectors |
| Structured data extraction | ✅ Zod schema validation | ⚠️ Manual parsing |
| Self-healing automation | ✅ Auto-adapts | ❌ Breaks on changes |
| Complex multi-step flows | ✅ Agent mode | ⚠️ Manual scripting |
| Low-level control | ⚠️ Less precise | ✅ Full Playwright |
| Speed-critical | ⚠️ AI latency | ✅ Direct selectors |

## Environment Variables

The `.env` file is pre-configured with Google Gemini (preferred):

```bash
# Google Gemini API key - PREFERRED for browser-based AI tasks
GOOGLE_API_KEY=AIzaSyCUd8UQkMytdiWKLtbZhYp-6ydQpylu1GE

# Run headless (default: false, set true for CI)
HEADLESS=false

# Optional: Anthropic API key (alternative to Gemini)
# ANTHROPIC_API_KEY=sk-ant-...

# Optional: Browserbase for cloud browser infrastructure
# BROWSERBASE_API_KEY=bb_...
# BROWSERBASE_PROJECT_ID=...
```

### Why Gemini for Browser Automation?
- **Speed**: `gemini-2.0-flash` is optimized for fast responses
- **Multimodal**: Native vision capabilities for understanding page layouts
- **Cost-effective**: Lower cost per token for high-volume automation

## Core APIs

### 1. act() - Execute Actions

Execute browser actions with natural language:

```typescript
import { Stagehand } from "@browserbasehq/stagehand";
import "dotenv/config";

const stagehand = new Stagehand({
  env: "LOCAL",  // or "BROWSERBASE"
  headless: false,
  modelName: "gemini-2.0-flash",  // Preferred LLM
  modelClientOptions: {
    apiKey: process.env.GOOGLE_API_KEY,
  },
});
await stagehand.init();

const page = stagehand.page;
await page.goto("https://example.com");

// Natural language - AI finds the right elements
await stagehand.act({ action: "click the login button" });
await stagehand.act({ action: "fill in the email field with test@example.com" });
await stagehand.act({ action: "select 'Monthly' from the billing dropdown" });
await stagehand.act({ action: "submit the form" });

await stagehand.close();
```

### 2. extract() - Structured Data Extraction

Extract data with Zod schema validation:

```typescript
import { z } from "zod";

const product = await stagehand.extract({
  instruction: "extract the main product details",
  schema: z.object({
    name: z.string().describe("Product name"),
    price: z.number().describe("Price in dollars, ignore currency"),
    inStock: z.boolean().describe("Whether item is available"),
    reviews: z.number().describe("Number of customer reviews"),
  }),
});
// { name: "Widget Pro", price: 29.99, inStock: true, reviews: 128 }
```

**Schema tips:**
- Use `.describe()` to guide extraction
- Be specific: "Price in dollars, ignore currency symbol"
- Arrays work: `z.array(productSchema)` for lists

### 3. observe() - Discover Actions

Find available actions on a page:

```typescript
const actions = await stagehand.observe();
console.log("Available actions:", actions);

// Then execute one
await stagehand.act({ action: actions[0].description });
```

### 4. agent() - Autonomous Workflows

Let AI handle complex multi-step tasks:

```typescript
const agent = stagehand.agent({
  modelName: "gemini-2.0-flash",  // Preferred LLM
  modelClientOptions: {
    apiKey: process.env.GOOGLE_API_KEY,
  },
});

const result = await agent.execute({
  instruction: "Log into the admin panel, navigate to settings, enable dark mode, and save",
});
```

## Running Scripts

### Inline Scripts (Recommended for quick tasks)

```bash
cd /opt/agency-workspace/skills/stagehand && npx tsx <<'EOF'
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import "dotenv/config";

const stagehand = new Stagehand({
  env: "LOCAL",
  headless: false,
  modelName: "gemini-2.0-flash",
  modelClientOptions: { apiKey: process.env.GOOGLE_API_KEY },
});
await stagehand.init();

try {
  await stagehand.page.goto("https://example.com");

  const data = await stagehand.extract({
    instruction: "extract the page title and main heading",
    schema: z.object({
      title: z.string(),
      heading: z.string(),
    }),
  });

  console.log("Result:", data);
} finally {
  await stagehand.close();
}
EOF
```

### Using Example Scripts

```bash
cd /opt/agency-workspace/skills/stagehand

# Extract data from a page
npx tsx scripts/example-extract.ts https://news.ycombinator.com

# Fill a form with natural language
npx tsx scripts/example-form.ts

# Run an autonomous agent task
npx tsx scripts/example-agent.ts
```

## Common Patterns

### UAT Testing

```typescript
async function testCheckoutFlow() {
  const stagehand = new Stagehand({
    env: "LOCAL",
    headless: true,
    modelName: "gemini-2.0-flash",
    modelClientOptions: { apiKey: process.env.GOOGLE_API_KEY },
  });
  await stagehand.init();

  try {
    await stagehand.page.goto("https://myshop.com/products/widget");

    // Add to cart
    await stagehand.act({ action: "click Add to Cart button" });
    await stagehand.act({ action: "click View Cart or checkout" });

    // Verify cart state
    const cart = await stagehand.extract({
      instruction: "extract cart contents",
      schema: z.object({
        items: z.array(z.object({
          name: z.string(),
          quantity: z.number(),
          price: z.number(),
        })),
        total: z.number(),
      }),
    });

    if (cart.items.length > 0 && cart.total > 0) {
      console.log("✅ PASS: Checkout flow working");
      return { status: "pass", cart };
    } else {
      console.log("❌ FAIL: Cart empty or invalid");
      return { status: "fail", actual: cart };
    }
  } finally {
    await stagehand.close();
  }
}
```

### Data Scraping

```typescript
await stagehand.page.goto("https://news.ycombinator.com");

const articles = await stagehand.extract({
  instruction: "extract all articles on the front page",
  schema: z.array(z.object({
    title: z.string(),
    url: z.string(),
    points: z.number(),
    comments: z.number(),
    author: z.string(),
  })),
});
```

### Hybrid AI + Selectors

Combine AI flexibility with selector precision:

```typescript
// Use AI for dynamic elements
await stagehand.act({ action: "close any popup or modal that appears" });

// Use selectors for known, stable elements
await stagehand.page.click('[data-testid="submit-button"]');

// Use AI to verify state
const success = await stagehand.extract({
  instruction: "check if success message is displayed",
  schema: z.object({
    hasSuccess: z.boolean(),
    message: z.string().optional()
  }),
});
```

## Error Handling

```typescript
try {
  await stagehand.act({ action: "click the non-existent button" });
} catch (error) {
  console.log("Action failed:", error.message);

  // Discover alternatives
  const alternatives = await stagehand.observe();
  console.log("Available actions:", alternatives);

  // Save debug screenshot
  await stagehand.page.screenshot({ path: "tmp/error.png" });
}
```

## Performance Tips

1. **Caching**: Stagehand auto-caches discovered elements
   - First run: ~500ms (AI inference)
   - Repeat runs: ~50ms (cached selector)

2. **Batch extractions**: Extract multiple fields in one call
3. **Use headless mode** in CI: `HEADLESS=true`
4. **Combine with selectors** when you know the element

## Browserbase Cloud Browsers

For running in CI/CD or when you need:
- Scalable browser infrastructure
- Residential proxies
- Session recording
- Anti-bot features

```typescript
const stagehand = new Stagehand({
  env: "BROWSERBASE",  // Uses cloud browser
  headless: true,
});
```

Requires `BROWSERBASE_API_KEY` and `BROWSERBASE_PROJECT_ID` environment variables.

## File Structure

```
/opt/agency-workspace/skills/stagehand/
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── server.sh             # Setup script
├── .env.example          # Environment template
├── src/
│   └── client.ts         # Reusable client helpers
├── scripts/
│   ├── run-task.ts       # Main task template
│   ├── example-extract.ts # Data extraction example
│   ├── example-form.ts   # Form filling example
│   └── example-agent.ts  # Agent mode example
└── tmp/                  # Screenshots and temp files
```

## Resources

- [Stagehand Documentation](https://docs.stagehand.dev)
- [GitHub](https://github.com/browserbase/stagehand)
- [Browserbase](https://www.browserbase.com)
