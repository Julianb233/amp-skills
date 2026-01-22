---
name: stagehand
description: AI-powered browser automation using Stagehand SDK. Use when users need intelligent web automation that adapts to dynamic elements, extracts structured data, or performs multi-step workflows. Trigger phrases include "test the UI", "extract data from page", "fill this form intelligently", "automate the checkout flow", "run UAT tests", or any request for AI-guided browser interaction.
---

# Stagehand: AI Browser Automation

Stagehand is an AI-powered browser automation framework by Browserbase. Unlike traditional selectors, it uses natural language to find elements and adapts automatically when websites change.

## When to Use Stagehand vs Dev Browser

| Use Case | Stagehand | Dev Browser |
|----------|-----------|-------------|
| Dynamic/unknown layouts | ✅ AI discovers elements | ❌ Need known selectors |
| Structured data extraction | ✅ Zod schema validation | ⚠️ Manual parsing |
| Self-healing automation | ✅ Auto-adapts | ❌ Breaks on changes |
| Complex multi-step flows | ✅ Agent mode | ⚠️ Manual scripting |
| Low-level control | ⚠️ Less precise | ✅ Full Playwright |
| Speed-critical | ⚠️ AI latency | ✅ Direct selectors |

## Setup

```bash
npm install @anthropic-ai/stagehand zod
```

**Environment variables:**
```bash
ANTHROPIC_API_KEY=your_key  # Required for Claude-powered actions
BROWSERBASE_API_KEY=your_key # Optional: Cloud browser infrastructure
```

## Core APIs

### 1. act() - Execute Actions

Execute browser actions with natural language:

```typescript
import Stagehand from "@anthropic-ai/stagehand";

const stagehand = new Stagehand();
await stagehand.init();

const page = stagehand.context.pages()[0];
await page.goto("https://example.com");

// Natural language - AI finds the right elements
await stagehand.act("click the login button");
await stagehand.act("fill in the email field with test@example.com");
await stagehand.act("select 'Monthly' from the billing dropdown");
await stagehand.act("submit the form");
```

### 2. extract() - Structured Data Extraction

Extract data with Zod schema validation:

```typescript
import { z } from "zod";

const productSchema = z.object({
  name: z.string().describe("Product name"),
  price: z.number().describe("Price in dollars, ignore currency"),
  inStock: z.boolean().describe("Whether item is available"),
  reviews: z.number().describe("Number of customer reviews"),
});

const product = await stagehand.extract(
  "extract the main product details",
  productSchema
);
// { name: "Widget Pro", price: 29.99, inStock: true, reviews: 128 }
```

**Schema tips:**
- Use `.describe()` to guide extraction
- Be specific: "Price in dollars, ignore currency symbol"
- Arrays work: `z.array(productSchema)` for lists

### 3. observe() - Discover Actions

Find available actions on a page:

```typescript
const actions = await stagehand.observe("find all form submission buttons");
// Returns array of potential actions with descriptions

// Then execute one
await stagehand.act(actions[0]);
```

### 4. agent() - Autonomous Workflows

Let AI handle complex multi-step tasks:

```typescript
const agent = stagehand.agent({
  model: "claude-sonnet-4-20250514",
});

await agent.execute(
  "Log into the admin panel, navigate to settings, enable dark mode, and save"
);
```

## Common Patterns

### UAT Testing

```typescript
async function testCheckoutFlow() {
  const stagehand = new Stagehand({ headless: true });
  await stagehand.init();
  const page = stagehand.context.pages()[0];

  try {
    await page.goto("https://myshop.com/products/widget");

    // Add to cart
    await stagehand.act("click Add to Cart button");
    await stagehand.act("click View Cart or checkout");

    // Verify cart state
    const cart = await stagehand.extract(
      "extract cart contents",
      z.object({
        items: z.array(z.object({
          name: z.string(),
          quantity: z.number(),
          price: z.number(),
        })),
        total: z.number(),
      })
    );

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

### Form Filling

```typescript
await page.goto("https://example.com/signup");

// AI handles various field types intelligently
await stagehand.act("fill first name with John");
await stagehand.act("fill last name with Smith");
await stagehand.act("fill email with john@example.com");
await stagehand.act("select United States from country dropdown");
await stagehand.act("check the terms and conditions checkbox");
await stagehand.act("click the Submit button");
```

### Data Scraping

```typescript
await page.goto("https://news.ycombinator.com");

const articles = await stagehand.extract(
  "extract all articles on the front page",
  z.array(z.object({
    title: z.string(),
    url: z.string(),
    points: z.number(),
    comments: z.number(),
    author: z.string(),
  }))
);
```

### Hybrid AI + Selectors

Combine AI flexibility with selector precision:

```typescript
// Use AI for dynamic elements
await stagehand.act("close any popup or modal that appears");

// Use selectors for known, stable elements
await page.click('[data-testid="submit-button"]');

// Use AI to verify state
const success = await stagehand.extract(
  "check if success message is displayed",
  z.object({ hasSuccess: z.boolean(), message: z.string().optional() })
);
```

## Error Handling

```typescript
try {
  await stagehand.act("click the non-existent button");
} catch (error) {
  console.log("Action failed:", error.message);

  // Discover alternatives
  const alternatives = await stagehand.observe("find clickable elements");
  console.log("Available:", alternatives);

  // Try alternative approach
  if (alternatives.length > 0) {
    await stagehand.act(alternatives[0]);
  }
}
```

## Performance Tips

1. **Caching**: Stagehand auto-caches discovered elements
   - First run: ~500ms (AI inference)
   - Repeat runs: ~50ms (cached selector)

2. **Batch extractions**: Extract multiple fields in one call
3. **Use headless mode** in CI: `new Stagehand({ headless: true })`
4. **Combine with selectors** when you know the element

## Script Template

```typescript
// scripts/stagehand-task.ts
import Stagehand from "@anthropic-ai/stagehand";
import { z } from "zod";

async function main() {
  const stagehand = new Stagehand({
    env: "LOCAL",
    headless: process.env.CI === "true",
  });

  await stagehand.init();
  const page = stagehand.context.pages()[0];

  try {
    await page.goto("https://example.com");

    // Your automation here
    await stagehand.act("...");
    const data = await stagehand.extract("...", z.object({ /* ... */ }));

    console.log("Result:", data);
  } catch (error) {
    console.error("Failed:", error.message);
    await page.screenshot({ path: "error.png" });
    throw error;
  } finally {
    await stagehand.close();
  }
}

main();
```

Run with: `npx tsx scripts/stagehand-task.ts`

## Resources

- [Documentation](https://docs.stagehand.dev)
- [GitHub](https://github.com/browserbase/stagehand)
- [Stagehand v3 Blog](https://www.browserbase.com/blog/stagehand-v3)
