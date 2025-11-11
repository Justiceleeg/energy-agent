import { EnergyPlan, PlanCostResult } from "@/lib/types/plans";
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
 * @returns Array of plans with costs, sorted by annual cost
 */
export function rankPlansByCost(
  plans: EnergyPlan[],
  totalKWh: number
): PlanWithCost[] {
  // Calculate costs for all plans
  const plansWithCosts: PlanWithCost[] = plans.map((plan) => ({
    plan,
    cost: calculatePlanCost(plan, totalKWh),
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
 * @returns Top 3 plans with costs and savings
 */
export function getTopRecommendations(
  plans: EnergyPlan[],
  totalKWh: number
): PlanWithCost[] {
  const ranked = rankPlansByCost(plans, totalKWh);
  return ranked.slice(0, 3);
}

