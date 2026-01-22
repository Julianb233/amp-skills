import { Stagehand } from "@browserbasehq/stagehand";
import type { Page, BrowserContext } from "playwright";

export interface StagehandConfig {
  env?: "LOCAL" | "BROWSERBASE";
  headless?: boolean;
  verbose?: boolean;
  enableCaching?: boolean;
  modelName?: string;
}

let stagehandInstance: Stagehand | null = null;

/**
 * Get or create a Stagehand instance
 * Default LLM: Google Gemini (gemini-2.0-flash) - preferred for browser-based tasks
 */
export async function getStagehand(config: StagehandConfig = {}): Promise<Stagehand> {
  if (stagehandInstance) {
    return stagehandInstance;
  }

  const env = config.env ?? (process.env.BROWSERBASE_API_KEY ? "BROWSERBASE" : "LOCAL");
  const headless = config.headless ?? process.env.HEADLESS === "true";
  const verbose = config.verbose ?? process.env.STAGEHAND_VERBOSE === "true";

  // Default to Gemini (preferred for browser-based tasks)
  const modelName = config.modelName ?? "gemini-2.0-flash";
  const apiKey = process.env.GOOGLE_API_KEY || process.env.ANTHROPIC_API_KEY;

  stagehandInstance = new Stagehand({
    env,
    headless,
    verbose: verbose ? 1 : 0,
    enableCaching: config.enableCaching ?? true,
    modelName,
    modelClientOptions: {
      apiKey,
    },
  });

  await stagehandInstance.init();
  return stagehandInstance;
}

/**
 * Get the current page from Stagehand
 */
export function getPage(stagehand: Stagehand): Page {
  return stagehand.page;
}

/**
 * Get the browser context from Stagehand
 */
export function getContext(stagehand: Stagehand): BrowserContext {
  return stagehand.context;
}

/**
 * Close Stagehand and cleanup
 */
export async function closeStagehand(): Promise<void> {
  if (stagehandInstance) {
    await stagehandInstance.close();
    stagehandInstance = null;
  }
}

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page, timeout = 30000): Promise<void> {
  await page.waitForLoadState("domcontentloaded", { timeout });
  await page.waitForLoadState("networkidle", { timeout }).catch(() => {
    // Network idle timeout is acceptable, page may have long-polling connections
  });
}

export { Stagehand };
