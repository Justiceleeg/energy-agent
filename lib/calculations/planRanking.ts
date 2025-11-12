import { EnergyPlan, PlanCostResult } from "@/lib/types/plans";
import { UsageStatistics } from "@/lib/types/usage";
import { UserPreference } from "@/lib/types/ai";
import { calculatePlanCost } from "./planCost";

/**
 * Plan with calculated cost for ranking
 */
export interface PlanWithCost {
  plan: EnergyPlan;
  cost: PlanCostResult;
  savings?: number; // Savings vs most expensive plan
}

/**
 * Get flexibility rating based on contract length
 * @param contractLength Contract length in months
 * @returns Flexibility rating: "high" (≤6 months), "medium" (7-12 months), "low" (>12 months)
 */
function getFlexibilityRating(contractLength: number): "high" | "medium" | "low" {
  if (contractLength <= 6) {
    return "high";
  } else if (contractLength <= 12) {
    return "medium";
  } else {
    return "low";
  }
}

/**
 * Get flexibility score for sorting (higher = more flexible)
 * @param rating Flexibility rating
 * @returns Numeric score: high=3, medium=2, low=1
 */
function getFlexibilityScore(rating: "high" | "medium" | "low"): number {
  return rating === "high" ? 3 : rating === "medium" ? 2 : 1;
}

/**
 * Rank plans by total annual cost or by user preference (cost, flexibility, renewable)
 * @param plans Array of energy plans
 * @param totalKWh Total annual energy consumption in kWh
 * @param statistics Optional usage statistics (used to extract monthly breakdown for tiered/bill credit plans)
 * @param preference User preference: "cost" (default), "flexibility", or "renewable"
 * @returns Array of plans with costs, sorted by preference
 */
export function rankPlansByCost(
  plans: EnergyPlan[],
  totalKWh: number,
  statistics?: UsageStatistics,
  preference: UserPreference = "cost"
): PlanWithCost[] {
  // Extract monthly kWh breakdown if statistics are provided
  const monthlyKWh = statistics?.monthlyBreakdown
    ? statistics.monthlyBreakdown.map((m) => m.totalKWh)
    : undefined;

  // Calculate costs for all plans
  const plansWithCosts: PlanWithCost[] = plans.map((plan) => ({
    plan,
    cost: calculatePlanCost(plan, totalKWh, monthlyKWh),
  }));

  // Sort based on preference
  if (preference === "cost") {
    // Sort by annual cost (ascending - cheapest first)
    plansWithCosts.sort((a, b) => a.cost.annualCost - b.cost.annualCost);
  } else if (preference === "flexibility") {
    // For flexibility, use a weighted score that balances flexibility and cost
    // This ensures we show truly flexible plans, not just the cheapest plans that happen to be flexible
    const maxCost = Math.max(...plansWithCosts.map(p => p.cost.annualCost));
    const minCost = Math.min(...plansWithCosts.map(p => p.cost.annualCost));
    const costRange = maxCost - minCost || 1; // Avoid division by zero
    
    plansWithCosts.sort((a, b) => {
      const aFlexibility = getFlexibilityRating(a.plan.contractLength);
      const bFlexibility = getFlexibilityRating(b.plan.contractLength);
      const aFlexScore = getFlexibilityScore(aFlexibility);
      const bFlexScore = getFlexibilityScore(bFlexibility);
      
      // Normalize cost to 0-1 range (0 = cheapest, 1 = most expensive)
      const aCostNormalized = (a.cost.annualCost - minCost) / costRange;
      const bCostNormalized = (b.cost.annualCost - minCost) / costRange;
      
      // Weighted score: 70% flexibility, 30% cost (inverted - lower cost is better)
      // Higher score = better for flexibility preference
      const aScore = (aFlexScore * 0.7) + ((1 - aCostNormalized) * 0.3);
      const bScore = (bFlexScore * 0.7) + ((1 - bCostNormalized) * 0.3);
      
      // Sort by combined score (descending)
      return bScore - aScore;
    });
  } else if (preference === "renewable") {
    // Sort by renewable percentage (descending - highest first), then by cost
    plansWithCosts.sort((a, b) => {
      // First sort by renewable percentage (descending)
      if (a.plan.renewablePercent !== b.plan.renewablePercent) {
        return b.plan.renewablePercent - a.plan.renewablePercent;
      }
      
      // Then sort by cost (ascending)
      return a.cost.annualCost - b.cost.annualCost;
    });
  }

  // Find the most expensive plan (for savings calculation)
  const mostExpensive = plansWithCosts.reduce((max, current) => 
    current.cost.annualCost > max.cost.annualCost ? current : max
  );
  const mostExpensiveCost = mostExpensive.cost.annualCost;

  // Calculate savings vs most expensive plan
  plansWithCosts.forEach((item) => {
    item.savings = mostExpensiveCost - item.cost.annualCost;
  });

  return plansWithCosts;
}

/**
 * Get top 3 recommended plans based on user preference
 * @param plans Array of energy plans
 * @param totalKWh Total annual energy consumption in kWh
 * @param statistics Optional usage statistics (used to extract monthly breakdown for tiered/bill credit plans)
 * @param preference User preference: "cost" (default), "flexibility", or "renewable"
 * @returns Top 3 plans with costs and savings
 */
export function getTopRecommendations(
  plans: EnergyPlan[],
  totalKWh: number,
  statistics?: UsageStatistics,
  preference: UserPreference = "cost"
): PlanWithCost[] {
  const ranked = rankPlansByCost(plans, totalKWh, statistics, preference);
  return ranked.slice(0, 3);
}

