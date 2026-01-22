/**
 * Example: Use Stagehand's agent mode for autonomous multi-step workflows
 * Uses Google Gemini as the preferred LLM for browser-based AI tasks.
 *
 * Usage:
 *   cd /opt/agency-workspace/skills/stagehand && npx tsx scripts/example-agent.ts
 */

import { Stagehand, AISdkClient } from "@browserbasehq/stagehand";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import "dotenv/config";

async function main() {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY,
  });

  const llmClient = new AISdkClient({
    model: google("gemini-2.0-flash"),
  });

  const stagehand = new Stagehand({
    env: process.env.BROWSERBASE_API_KEY ? "BROWSERBASE" : "LOCAL",
    headless: process.env.HEADLESS === "true",
    verbose: 1,
    llmClient,
  });

  await stagehand.init();
  const page = stagehand.context.pages()[0];

  try {
    // Navigate first
    await page.goto("https://news.ycombinator.com");

    // Create an agent for autonomous browsing
    const agent = stagehand.agent({
      modelName: "gemini-2.0-flash",
      modelClientOptions: {
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY,
      },
    });

    // Execute a multi-step task
    const result = await agent.execute({
      instruction: "Click on the first article link and tell me its title",
    });

    console.log("Agent result:", result);

    // Save screenshot of final state
    await page.screenshot({ path: "tmp/agent-result.png" });
    console.log("Screenshot saved to tmp/agent-result.png");

  } finally {
    await stagehand.close();
  }
}

main().catch(console.error);
