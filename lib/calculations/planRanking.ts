import { EnergyPlan, PlanCostResult } from "@/lib/types/plans";
import { UsageStatistics } from "@/lib/types/usage";
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
 * Rank plans by total annual cost (ascending - cheapest first)
 * @param plans Array of energy plans
 * @param totalKWh Total annual energy consumption in kWh
 * @param statistics Optional usage statistics (used to extract monthly breakdown for tiered/bill credit plans)
 * @returns Array of plans with costs, sorted by annual cost
 */
export function rankPlansByCost(
  plans: EnergyPlan[],
  totalKWh: number,
  statistics?: UsageStatistics
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

  // Sort by annual cost (ascending)
  plansWithCosts.sort((a, b) => a.cost.annualCost - b.cost.annualCost);

  // Find the most expensive plan
  const mostExpensive = plansWithCosts[plansWithCosts.length - 1];
  const mostExpensiveCost = mostExpensive.cost.annualCost;

  // Calculate savings vs most expensive plan
  plansWithCosts.forEach((item) => {
    item.savings = mostExpensiveCost - item.cost.annualCost;
  });

  return plansWithCosts;
}

/**
 * Get top 3 recommended plans (cheapest plans)
 * @param plans Array of energy plans
 * @param totalKWh Total annual energy consumption in kWh
 * @param statistics Optional usage statistics (used to extract monthly breakdown for tiered/bill credit plans)
 * @returns Top 3 plans with costs and savings
 */
export function getTopRecommendations(
  plans: EnergyPlan[],
  totalKWh: number,
  statistics?: UsageStatistics
): PlanWithCost[] {
  const ranked = rankPlansByCost(plans, totalKWh, statistics);
  return ranked.slice(0, 3);
}

