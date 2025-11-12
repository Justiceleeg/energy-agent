import { EnergyPlan } from "@/lib/types/plans";
import { HourlyUsageData, UsageStatistics } from "@/lib/types/usage";
import { calculateTieredCost, calculateBillCredit } from "./planCost";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Monthly cost breakdown for a plan
 */
export interface MonthlyCostBreakdown {
  /** Month index (0-11, where January = 0) */
  month: number;
  /** Month name (e.g., "January") */
  monthName: string;
  /** Total kWh consumption for this month */
  totalKWh: number;
  /** Total cost for this month in dollars */
  cost: number;
}

/**
 * Calculate monthly cost breakdown for an energy plan based on hourly usage data
 * @param plan The energy plan to calculate costs for
 * @param usageData Array of hourly usage data
 * @param statistics Usage statistics (optional, used for validation)
 * @returns Array of monthly cost objects with month index, month name, totalKWh, and cost
 */
export function calculateMonthlyBreakdown(
  plan: EnergyPlan,
  usageData: HourlyUsageData[],
  statistics?: UsageStatistics
): MonthlyCostBreakdown[] {
  // Handle edge cases
  if (!usageData || usageData.length === 0) {
    // Return empty months with zero cost
    return MONTH_NAMES.map((name, index) => ({
      month: index,
      monthName: name,
      totalKWh: 0,
      cost: 0,
    }));
  }

  // Group hourly usage data by month (0-11, January = 0)
  const monthlyTotals = new Map<number, number>();

  for (const entry of usageData) {
    const month = entry.date.getMonth();
    const currentTotal = monthlyTotals.get(month) || 0;
    monthlyTotals.set(month, currentTotal + entry.kWh);
  }

  // Calculate monthly costs
  const monthlyBreakdown: MonthlyCostBreakdown[] = [];

  for (let month = 0; month < 12; month++) {
    const totalKWh = monthlyTotals.get(month) || 0;
    
    // Calculate plan cost for this month using monthly kWh
    // We'll use calculatePlanCost but need to adjust for monthly calculation
    const monthlyCost = calculateMonthlyPlanCost(plan, totalKWh);

    monthlyBreakdown.push({
      month,
      monthName: MONTH_NAMES[month],
      totalKWh,
      cost: monthlyCost,
    });
  }

  return monthlyBreakdown;
}

/**
 * Calculate monthly cost for a plan based on monthly kWh consumption
 * @param plan The energy plan
 * @param monthlyKWh Total kWh consumption for the month
 * @returns Total monthly cost in dollars
 */
function calculateMonthlyPlanCost(plan: EnergyPlan, monthlyKWh: number): number {
  const TDU_FIXED_MONTHLY = 4.50; // $4.50 per month
  const TDU_PER_KWH = 0.035; // $0.035 per kWh

  let energyCost = 0;
  let baseCharges = 0;
  let billCredits = 0;

  // Calculate energy cost from pricing rules
  for (const rule of plan.pricing) {
    if (rule.type === "FLAT_RATE") {
      energyCost += rule.pricePerKWh * monthlyKWh;
    } else if (rule.type === "TIERED") {
      // Calculate tiered cost for this month
      energyCost += calculateTieredCost(monthlyKWh, rule.tiers);
    } else if (rule.type === "BILL_CREDIT") {
      // Calculate bill credit for this month
      const credit = calculateBillCredit(monthlyKWh, rule.amount, rule.minKwh, rule.maxKwh);
      billCredits += credit;
    } else if (rule.type === "BASE_CHARGE") {
      // Base charge pricing rules are monthly
      baseCharges += rule.amountPerMonth;
    }
  }

  // Add base charge if present (monthly)
  if (plan.baseCharge) {
    baseCharges += plan.baseCharge;
  }

  // Calculate TDU charges for the month
  const tduCharges = TDU_FIXED_MONTHLY + TDU_PER_KWH * monthlyKWh;

  // Calculate total monthly cost (bill credits are subtracted)
  return energyCost + baseCharges + tduCharges - billCredits;
}

