import { EnergyPlan, PlanCostResult } from "@/lib/types/plans";

/**
 * TDU (Transmission and Distribution Utility) charges
 * Fixed monthly charge + per-kWh charge
 */
const TDU_FIXED_MONTHLY = 4.50; // $4.50 per month
const TDU_PER_KWH = 0.035; // $0.035 per kWh

/**
 * Calculate the annual cost of an energy plan based on usage data
 * @param plan The energy plan to calculate costs for
 * @param totalKWh Total annual energy consumption in kWh
 * @returns Plan cost result with annual cost, monthly cost, and breakdown
 */
export function calculatePlanCost(plan: EnergyPlan, totalKWh: number): PlanCostResult {
  let energyCost = 0;
  let baseCharges = 0;

  // Calculate energy cost from pricing rules
  for (const rule of plan.pricing) {
    if (rule.type === "FLAT_RATE") {
      energyCost += rule.pricePerKWh * totalKWh;
    } else if (rule.type === "BASE_CHARGE") {
      // Base charge pricing rules are monthly, so multiply by 12 for annual
      baseCharges += rule.amountPerMonth * 12;
    }
  }

  // Add base charge if present (separate from pricing rules)
  if (plan.baseCharge) {
    baseCharges += plan.baseCharge * 12; // Convert monthly to annual
  }

  // Calculate TDU charges
  const tduCharges = TDU_FIXED_MONTHLY * 12 + TDU_PER_KWH * totalKWh;

  // Calculate total annual cost
  const annualCost = energyCost + baseCharges + tduCharges;

  // Calculate monthly average cost
  const monthlyCost = annualCost / 12;

  return {
    annualCost,
    monthlyCost,
    breakdown: {
      energyCost,
      baseCharges,
      tduCharges,
    },
  };
}

