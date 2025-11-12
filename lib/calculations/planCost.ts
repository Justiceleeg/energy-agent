import { EnergyPlan, PlanCostResult, TieredPricing, BillCreditPricing } from "@/lib/types/plans";

/**
 * TDU (Transmission and Distribution Utility) charges
 * Fixed monthly charge + per-kWh charge
 */
const TDU_FIXED_MONTHLY = 4.50; // $4.50 per month
const TDU_PER_KWH = 0.035; // $0.035 per kWh

/**
 * Calculate cost for tiered pricing based on usage
 * @param totalKWh Total kWh consumption
 * @param tiers Array of tiers ordered from lowest to highest threshold
 * @returns Total cost for the tiered pricing
 */
export function calculateTieredCost(
  totalKWh: number,
  tiers: TieredPricing["tiers"]
): number {
  if (totalKWh <= 0) {
    return 0;
  }

  let remainingKWh = totalKWh;
  let totalCost = 0;
  let previousMaxKwh = 0;

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    const currentMaxKwh = tier.maxKwh;

    if (currentMaxKwh === null) {
      // Final tier with unlimited max - allocate all remaining usage
      totalCost += remainingKWh * tier.ratePerKwh;
      break;
    } else {
      // Calculate how much usage falls in this tier
      // Tier boundaries are inclusive: previousMaxKwh < usage <= currentMaxKwh
      const tierStart = previousMaxKwh;
      const tierEnd = currentMaxKwh;
      const tierKwh = Math.min(remainingKWh, tierEnd - tierStart);

      if (tierKwh > 0) {
        totalCost += tierKwh * tier.ratePerKwh;
        remainingKWh -= tierKwh;
      }

      // Update previous max for next tier
      previousMaxKwh = currentMaxKwh;

      // If no remaining usage, we're done
      if (remainingKWh <= 0) {
        break;
      }
    }
  }

  return totalCost;
}

/**
 * Calculate bill credit based on usage thresholds
 * @param monthlyKWh Monthly kWh consumption
 * @param amount Credit amount in dollars
 * @param minKwh Minimum kWh required for credit (inclusive)
 * @param maxKwh Maximum kWh for credit (inclusive, null for unlimited)
 * @returns Credit amount if conditions met, otherwise 0
 */
export function calculateBillCredit(
  monthlyKWh: number,
  amount: number,
  minKwh: number,
  maxKwh: number | null
): number {
  // Check if usage falls within credit range (inclusive boundaries)
  if (monthlyKWh >= minKwh) {
    if (maxKwh === null || monthlyKWh <= maxKwh) {
      return amount; // Return positive amount (will be subtracted from total)
    }
  }
  return 0;
}

/**
 * Calculate the annual cost of an energy plan based on usage data
 * @param plan The energy plan to calculate costs for
 * @param totalKWh Total annual energy consumption in kWh
 * @param monthlyKWh Optional array of monthly kWh values (12 months) - required for tiered/bill credit plans
 * @returns Plan cost result with annual cost, monthly cost, and breakdown
 */
export function calculatePlanCost(
  plan: EnergyPlan,
  totalKWh: number,
  monthlyKWh?: number[]
): PlanCostResult {
  let energyCost = 0;
  let baseCharges = 0;
  let billCredits = 0;

  // Check if plan requires monthly calculation (has tiered or bill credit rules)
  const needsMonthlyCalculation =
    plan.pricing.some((rule) => rule.type === "TIERED" || rule.type === "BILL_CREDIT");

  if (needsMonthlyCalculation && monthlyKWh) {
    // Calculate monthly costs and sum for annual total
    for (let month = 0; month < 12; month++) {
      const monthKWh = monthlyKWh[month] || 0;

      // Calculate energy cost from pricing rules for this month
      for (const rule of plan.pricing) {
        if (rule.type === "FLAT_RATE") {
          energyCost += rule.pricePerKWh * monthKWh;
        } else if (rule.type === "TIERED") {
          // Calculate tiered cost for this month
          energyCost += calculateTieredCost(monthKWh, rule.tiers);
        } else if (rule.type === "BILL_CREDIT") {
          // Calculate bill credit for this month
          const credit = calculateBillCredit(monthKWh, rule.amount, rule.minKwh, rule.maxKwh);
          billCredits += credit;
        } else if (rule.type === "BASE_CHARGE") {
          // Base charge is monthly, will be added once per month
          baseCharges += rule.amountPerMonth;
        }
      }
    }
  } else {
    // Annual calculation for simple plans (flat-rate only)
    for (const rule of plan.pricing) {
      if (rule.type === "FLAT_RATE") {
        energyCost += rule.pricePerKWh * totalKWh;
      } else if (rule.type === "BASE_CHARGE") {
        // Base charge pricing rules are monthly, so multiply by 12 for annual
        baseCharges += rule.amountPerMonth * 12;
      }
      // Note: TIERED and BILL_CREDIT require monthly calculation, so they're skipped here
      // If monthlyKWh is not provided, these plans will have incorrect calculations
    }
  }

  // Add base charge if present (separate from pricing rules)
  if (plan.baseCharge) {
    if (needsMonthlyCalculation) {
      baseCharges += plan.baseCharge * 12; // 12 months
    } else {
      baseCharges += plan.baseCharge * 12; // Convert monthly to annual
    }
  }

  // Calculate TDU charges
  const tduCharges = TDU_FIXED_MONTHLY * 12 + TDU_PER_KWH * totalKWh;

  // Calculate total annual cost (bill credits are subtracted)
  const annualCost = energyCost + baseCharges + tduCharges - billCredits;

  // Calculate monthly average cost
  const monthlyCost = annualCost / 12;

  return {
    annualCost,
    monthlyCost,
    breakdown: {
      energyCost,
      baseCharges,
      tduCharges,
      billCredits,
    },
  };
}

