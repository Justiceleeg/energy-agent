import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { UsageStatistics } from "@/lib/types/usage";
import { UsageAnalysisInsights } from "@/lib/types/ai";

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

Please provide insights in the following JSON structure:
{
  "peakTimes": {
    "description": "A brief overview of when peak usage occurs (e.g., 'Your energy usage peaks in the evening hours between 6-9 PM')",
    "insights": [
      "Specific insight about peak hour patterns",
      "Specific insight about day of week patterns if relevant"
    ]
  },
  "seasonalTrends": {
    "description": "A brief overview of seasonal patterns (e.g., 'Your energy usage is highest in summer months')",
    "insights": [
      "Specific insight about summer vs winter patterns",
      "Specific insight about monthly variations"
    ]
  },
  "weekdayWeekendPatterns": {
    "description": "A brief overview of weekday vs weekend differences if significant",
    "insights": [
      "Specific insight about weekday patterns",
      "Specific insight about weekend patterns"
    ]
  },
  "recommendations": [
    {
      "title": "Short recommendation title",
      "description": "Detailed, actionable recommendation in plain language"
    }
  ]
}

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
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: prompt,
        temperature: 0.7,
        maxTokens: 2000,
        abortSignal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!text) {
        throw new Error("No response content from OpenAI API");
      }

      // Try to parse JSON, extract if wrapped in markdown code blocks
      let jsonText = text.trim();
      // Remove markdown code blocks if present
      if (jsonText.startsWith("```")) {
        const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) {
          jsonText = match[1].trim();
        }
      }

      const parsed = JSON.parse(jsonText);

      // Validate and structure the response
      const insights: UsageAnalysisInsights = {
        peakTimes: {
          description: parsed.peakTimes?.description || "No peak time analysis available",
          insights: parsed.peakTimes?.insights || [],
        },
        seasonalTrends: {
          description: parsed.seasonalTrends?.description || "No seasonal analysis available",
          insights: parsed.seasonalTrends?.insights || [],
        },
        weekdayWeekendPatterns: parsed.weekdayWeekendPatterns
          ? {
              description: parsed.weekdayWeekendPatterns.description || "",
              insights: parsed.weekdayWeekendPatterns.insights || [],
            }
          : undefined,
        recommendations: parsed.recommendations || [],
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

      // Only retry on transient errors (network errors, rate limits)
      if (
        lastError.message.includes("rate limit") ||
        lastError.message.includes("timeout") ||
        lastError.message.includes("network") ||
        lastError.message.includes("ECONNRESET") ||
        lastError.message.includes("aborted")
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

