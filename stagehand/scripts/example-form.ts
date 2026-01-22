/**
 * Example: Fill and submit a form using natural language
 * Uses Google Gemini as the preferred LLM for browser-based AI tasks.
 *
 * Usage:
 *   cd /opt/agency-workspace/skills/stagehand && npx tsx scripts/example-form.ts
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
    // Navigate to a form page
    console.log("Navigating to form page...");
    await page.goto("https://httpbin.org/forms/post");

    // Use act() to fill form fields with natural language
    await stagehand.act({ action: "fill the customer name field with John Doe" });
    await stagehand.act({ action: "fill the telephone field with 555-1234" });
    await stagehand.act({ action: "fill the email field with john@example.com" });

    // Take screenshot before submit
    await page.screenshot({ path: "tmp/form-filled.png" });
    console.log("Form filled - screenshot saved to tmp/form-filled.png");

  } finally {
    await stagehand.close();
  }
}

main().catch(console.error);
