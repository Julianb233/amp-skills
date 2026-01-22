/**
 * Example: Extract structured data from a webpage
 * Uses Google Gemini as the preferred LLM for browser-based AI tasks.
 *
 * Usage:
 *   cd /opt/agency-workspace/skills/stagehand && npx tsx scripts/example-extract.ts <url>
 */

import { Stagehand, AISdkClient } from "@browserbasehq/stagehand";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import "dotenv/config";

const url = process.argv[2] || "https://news.ycombinator.com";

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
    console.log(`Navigating to ${url}...`);
    await page.goto(url);

    // Extract articles from Hacker News (or adapt schema for other sites)
    const data = await stagehand.extract({
      instruction: "extract the top 5 articles from the page, including title and url",
      schema: z.object({
        articles: z.array(z.object({
          title: z.string().describe("The article title"),
          url: z.string().describe("The article URL"),
        })).describe("List of articles"),
      }),
    });

    console.log("\nExtracted data:");
    console.log(JSON.stringify(data, null, 2));

  } finally {
    await stagehand.close();
  }
}

main().catch(console.error);
