import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { UsageStatistics } from "@/lib/types/usage";
import { EnergyPlan, TimeOfUsePricing, SeasonalPricing } from "@/lib/types/plans";
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
    const touRule = plan.pricing.find((rule) => rule.type === "TIME_OF_USE") as TimeOfUsePricing | undefined;
    const seasonalRules = plan.pricing.filter((rule) => rule.type === "SEASONAL") as SeasonalPricing[];

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
      } else if (rule.type === "TIME_OF_USE") {
        // TOU pricing details
        const freePeriods = touRule?.schedule.filter((s) => s.ratePerKwh === 0) || [];
        const paidPeriods = touRule?.schedule.filter((s) => s.ratePerKwh > 0) || [];
        if (freePeriods.length > 0) {
          pricingDescription += `Time-of-use: FREE energy during certain hours. `;
        }
        if (paidPeriods.length > 0) {
          const rates = paidPeriods.map((p) => p.ratePerKwh);
          const minRate = Math.min(...rates);
          const maxRate = Math.max(...rates);
          pricingDescription += `Time-of-use rates: $${minRate.toFixed(4)}-$${maxRate.toFixed(4)}/kWh depending on time of day and day of week. `;
        }
      } else if (rule.type === "SEASONAL") {
        // Seasonal pricing details (will be added after base pricing)
      }
    });

    // Add seasonal modifier information
    if (seasonalRules.length > 0) {
      pricingDescription += `Seasonal pricing: `;
      seasonalRules.forEach((rule) => {
        const monthNames = rule.months
          .sort((a, b) => a - b)
          .map((m) => {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return months[m - 1];
          })
          .join(", ");
        if (rule.rateModifier > 1) {
          const percent = ((rule.rateModifier - 1) * 100).toFixed(0);
          pricingDescription += `${percent}% higher in ${monthNames}. `;
        } else if (rule.rateModifier < 1) {
          const percent = ((1 - rule.rateModifier) * 100).toFixed(0);
          pricingDescription += `${percent}% lower in ${monthNames}. `;
        }
      });
    }

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
2. For time-of-use (TOU) plans: Explain how the user's peak usage times align (or don't align) with the plan's schedule. Mention specific times (e.g., "Your peak usage at 6pm aligns with this plan's off-peak rates")
3. For seasonal plans: Explain how the user's seasonal usage patterns align (or don't align) with the plan's rate modifiers. Reference specific months (e.g., "Your high summer usage makes this plan expensive")
4. Pros should highlight advantages specific to how the user consumes energy (e.g., "Great for evening usage" if peak is evening, "Free nights match your usage" for TOU plans)
5. Cons should mention drawbacks relevant to the user's situation (e.g., "Peak rates during your high-usage hours" for TOU plans, "Higher rates in months you use most" for seasonal plans)
6. "goodFor" badges should reflect usage patterns (e.g., "night owl" if peak is evening, "solar home" if low daytime usage, "high usage" if above average, "seasonal" if significant seasonal variation, "TOU-friendly" if usage aligns with TOU schedules)
7. Focus on the user's preference (${preference}) when explaining why each plan is recommended
8. Write in plain, conversational language - avoid technical jargon
9. Make explanations specific and actionable
10. For TOU plans, include guidance on shifting usage to lower-cost periods if applicable`;

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

