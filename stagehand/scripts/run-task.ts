/**
 * Stagehand Task Runner
 *
 * This is a template script for running Stagehand automation tasks.
 * Uses Google Gemini as the preferred LLM for browser-based AI tasks.
 *
 * Usage:
 *   cd /opt/agency-workspace/skills/stagehand && npx tsx scripts/run-task.ts
 */

import { Stagehand, AISdkClient } from "@browserbasehq/stagehand";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import "dotenv/config";

async function main() {
  // Create Google Gemini client (preferred for browser-based tasks)
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY,
  });

  const llmClient = new AISdkClient({
    model: google("gemini-2.0-flash"),
  });

  // Initialize Stagehand with Gemini
  const stagehand = new Stagehand({
    env: process.env.BROWSERBASE_API_KEY ? "BROWSERBASE" : "LOCAL",
    headless: process.env.HEADLESS === "true",
    verbose: 1,
    enableCaching: true,
    llmClient,
  });

  await stagehand.init();

  // Get the page from the browser context (v3 API)
  const page = stagehand.context.pages()[0];

  try {
    // Example: Navigate and extract data
    console.log("Navigating to example.com...");
    await page.goto("https://example.com");

    // Use extract() for structured data extraction
    const pageInfo = await stagehand.extract({
      instruction: "extract the main heading and description from the page",
      schema: z.object({
        heading: z.string().describe("The main heading of the page"),
        description: z.string().describe("The description or summary text"),
      }),
    });

    console.log("Extracted data:", pageInfo);

    // Save screenshot for debugging
    await page.screenshot({ path: "tmp/result.png" });
    console.log("Screenshot saved to tmp/result.png");

  } catch (error) {
    console.error("Task failed:", error);
    if (page) {
      await page.screenshot({ path: "tmp/error.png" }).catch(() => {});
    }
    throw error;
  } finally {
    await stagehand.close();
  }
}

main().catch(console.error);
