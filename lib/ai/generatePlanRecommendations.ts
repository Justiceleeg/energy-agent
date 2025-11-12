import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { UsageStatistics } from "@/lib/types/usage";
import { EnergyPlan } from "@/lib/types/plans";
import { PlanCostResult } from "@/lib/types/plans";
import { PlanRecommendation, PlanRecommendationsResponse, UserPreference } from "@/lib/types/ai";
import { PlanRecommendationsResponseSchema } from "./schemas";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_RETRIES = 2;
const TIMEOUT_MS = 30000; // 30 seconds

/**
 * Plan data with cost information for AI recommendation
 */
interface PlanWithCostData {
  plan: EnergyPlan;
  cost: PlanCostResult;
}

/**
 * Generates AI-powered plan recommendations using OpenAI GPT-4o-mini
 * @param statistics Usage statistics
 * @param topPlans Top 3 plans with cost information
 * @param preference User preference (cost, flexibility, renewable)
 * @returns AI-generated recommendations for the top 3 plans
 */
export async function generatePlanRecommendations(
  statistics: UsageStatistics,
  topPlans: PlanWithCostData[],
  preference: UserPreference = "cost"
): Promise<PlanRecommendationsResponse> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  if (topPlans.length === 0) {
    throw new Error("At least one plan is required for recommendations");
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

  // Build plan details for the prompt
  const planDetails = topPlans.map((item, index) => {
    const plan = item.plan;
    const cost = item.cost;
    
    // Format pricing structure
    let pricingDescription = "";
    plan.pricing.forEach((rule) => {
      if (rule.type === "FLAT_RATE") {
        pricingDescription += `Flat rate: $${rule.pricePerKWh.toFixed(4)}/kWh. `;
      } else if (rule.type === "TIERED") {
        pricingDescription += `Tiered pricing: `;
        rule.tiers.forEach((tier, i) => {
          if (tier.maxKwh === null) {
            pricingDescription += `$${tier.ratePerKwh.toFixed(4)}/kWh for ${i === 0 ? "first" : "remaining"} usage. `;
          } else {
            pricingDescription += `$${tier.ratePerKwh.toFixed(4)}/kWh up to ${tier.maxKwh} kWh, `;
          }
        });
      } else if (rule.type === "BILL_CREDIT") {
        pricingDescription += `Bill credit: $${rule.amount.toFixed(2)} credit when usage is between ${rule.minKwh} and ${rule.maxKwh || "unlimited"} kWh. `;
      } else if (rule.type === "BASE_CHARGE") {
        pricingDescription += `Base charge: $${rule.amountPerMonth.toFixed(2)}/month. `;
      }
    });

    // Determine flexibility rating
    let flexibilityRating = "low";
    if (plan.contractLength <= 6) {
      flexibilityRating = "high";
    } else if (plan.contractLength <= 12) {
      flexibilityRating = "medium";
    }

    return `Plan ${index + 1}: ${plan.name} by ${plan.provider}
- Annual Cost: $${cost.annualCost.toFixed(2)}
- Monthly Cost: $${cost.monthlyCost.toFixed(2)}
- Pricing: ${pricingDescription.trim()}
- Base Charge: $${(plan.baseCharge || 0).toFixed(2)}/month
- Renewable Energy: ${plan.renewablePercent}%
- Contract Length: ${plan.contractLength} months (${flexibilityRating} flexibility)
- Description: ${plan.description || "No description available"}`;
  }).join("\n\n");

  // Build preference context
  const preferenceContext = {
    cost: "The user prioritizes cost savings - focus on explaining why this plan saves money based on their usage patterns.",
    flexibility: "The user prioritizes flexibility - focus on contract terms, ability to switch, and low commitment.",
    renewable: "The user prioritizes renewable energy - focus on environmental benefits and renewable percentage.",
  }[preference];

  // Build structured prompt
  const prompt = `You are an energy plan advisor. Analyze the following user's energy usage patterns and provide personalized recommendations for the top 3 energy plans.

User's Energy Usage Statistics:
- Total Annual Consumption: ${statistics.totalAnnualKWh.toFixed(1)} kWh
- Average Daily Usage: ${statistics.averageDailyKWh.toFixed(2)} kWh
- Peak Usage Hour: ${peakDate} (${statistics.peakUsageHour.kWh.toFixed(2)} kWh)
- Monthly Range: ${statistics.minMonthlyKWh.toFixed(1)} kWh - ${statistics.maxMonthlyKWh.toFixed(1)} kWh

Monthly Breakdown:
${monthlyBreakdownText}

User Preference: ${preference.charAt(0).toUpperCase() + preference.slice(1)}-optimized
${preferenceContext}

Top 3 Plans to Recommend:
${planDetails}

Please provide personalized recommendations in the following JSON structure:
{
  "recommendations": [
    {
      "planId": "plan-001",
      "explanation": "A clear, personalized explanation (2-3 sentences) of why this plan is recommended for this specific user's usage patterns. Reference specific usage characteristics (e.g., 'Your peak usage in the evening makes this plan ideal...'). Write in plain, conversational language.",
      "pros": [
        "Specific advantage 1 related to user's usage patterns",
        "Specific advantage 2 related to user's usage patterns",
        "Specific advantage 3 if applicable"
      ],
      "cons": [
        "Specific disadvantage 1 related to user's usage patterns",
        "Specific disadvantage 2 if applicable"
      ],
      "goodFor": ["badge1", "badge2"]
    }
  ]
}

Guidelines:
1. For each plan, provide a personalized explanation that references the user's specific usage patterns (peak times, seasonal trends, monthly variations)
2. Pros should highlight advantages specific to how the user consumes energy (e.g., "Great for evening usage" if peak is evening)
3. Cons should mention drawbacks relevant to the user's situation
4. "goodFor" badges should reflect usage patterns (e.g., "night owl" if peak is evening, "solar home" if low daytime usage, "high usage" if above average, "seasonal" if significant seasonal variation)
5. Focus on the user's preference (${preference}) when explaining why each plan is recommended
6. Write in plain, conversational language - avoid technical jargon
7. Make explanations specific and actionable`;

  let lastError: Error | null = null;

  // Retry logic with timeout
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let isAborted = false;

    try {
      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: PlanRecommendationsResponseSchema,
        schemaName: "PlanRecommendations",
        schemaDescription: "Personalized plan recommendations with explanations, pros, cons, and usage pattern badges",
        prompt: prompt,
        temperature: 0.7,
      });

      clearTimeout(timeoutId);

      // Ensure we have recommendations for all top plans
      if (object.recommendations.length !== topPlans.length) {
        // If we got fewer recommendations, pad with defaults
        for (let i = object.recommendations.length; i < topPlans.length; i++) {
          object.recommendations.push({
            planId: topPlans[i].plan.id,
            explanation: `This plan is recommended based on your usage patterns.`,
            pros: [],
            cons: [],
          });
        }
      }

      return {
        recommendations: object.recommendations,
        metadata: {
          model: "gpt-4o-mini",
          timestamp: new Date().toISOString(),
        },
      };
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

  throw lastError || new Error("Failed to generate plan recommendations");
}

