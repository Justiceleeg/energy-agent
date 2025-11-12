import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { UsageStatistics } from "@/lib/types/usage";
import { UsageAnalysisInsights } from "@/lib/types/ai";
import { UsageAnalysisInsightsSchema } from "./schemas";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_RETRIES = 2;
const TIMEOUT_MS = 30000; // 30 seconds (GPT-4o-mini can take 10-20 seconds for complex prompts)

/**
 * Analyzes usage patterns using OpenAI GPT-4o-mini
 * @param statistics Usage statistics to analyze
 * @returns AI-generated insights about usage patterns
 */
export async function analyzeUsagePatterns(
  statistics: UsageStatistics
): Promise<UsageAnalysisInsights> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  // Build usage statistics summary for the prompt
  const monthlyBreakdownText = statistics.monthlyBreakdown
    .map((m) => `${m.monthName}: ${m.totalKWh.toFixed(1)} kWh`)
    .join("\n");

  const peakHour = statistics.peakUsageHour.date.getHours();
  const peakDate = statistics.peakUsageHour.date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  // Build structured prompt
  const prompt = `You are an energy usage analyst. Analyze the following energy consumption data and provide insights in plain language (avoid technical jargon).

Usage Statistics Summary:
- Total Annual Consumption: ${statistics.totalAnnualKWh.toFixed(1)} kWh
- Average Daily Usage: ${statistics.averageDailyKWh.toFixed(2)} kWh
- Peak Usage Hour: ${peakDate} (${statistics.peakUsageHour.kWh.toFixed(2)} kWh)
- Monthly Range: ${statistics.minMonthlyKWh.toFixed(1)} kWh - ${statistics.maxMonthlyKWh.toFixed(1)} kWh

Monthly Breakdown:
${monthlyBreakdownText}

Focus on:
1. Peak usage times: Identify patterns in hour of day and day of week
2. Seasonal trends: Compare summer vs winter, identify monthly variations
3. Weekday/weekend patterns: Note any significant differences
4. Actionable recommendations: Provide 3-5 specific, practical suggestions for optimizing energy usage

Write all insights in plain, conversational language that a homeowner can understand. Avoid technical jargon.`;

  let lastError: Error | null = null;

  // Retry logic with timeout
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let isAborted = false;

    try {
      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: UsageAnalysisInsightsSchema,
        schemaName: "UsageAnalysisInsights",
        schemaDescription: "Energy usage analysis insights with peak times, seasonal trends, and recommendations",
        prompt: prompt,
        temperature: 0.7,
      });

      clearTimeout(timeoutId);

      // Structure the response with metadata
      const insights: UsageAnalysisInsights = {
        ...object,
        metadata: {
          model: "gpt-4o-mini",
          timestamp: new Date().toISOString(),
        },
      };

      return insights;
    } catch (error) {
      clearTimeout(timeoutId);
      isAborted = controller.signal.aborted;
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on abort (timeout) or if it's the last attempt
      if (isAborted) {
        lastError = new Error(`Request timeout after ${TIMEOUT_MS / 1000} seconds`);
        break;
      }
      
      if (attempt === MAX_RETRIES) {
        break;
      }

      // Retry on transient errors (network errors, rate limits) and validation errors
      // Validation errors might be due to incomplete responses or schema mismatches
      if (
        lastError.message.includes("rate limit") ||
        lastError.message.includes("timeout") ||
        lastError.message.includes("network") ||
        lastError.message.includes("ECONNRESET") ||
        lastError.message.includes("aborted") ||
        lastError.message.includes("NoObjectGenerated") ||
        lastError.message.includes("validation")
      ) {
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }

      // Don't retry on other errors
      break;
    }
  }

  throw lastError || new Error("Failed to analyze usage patterns");
}

