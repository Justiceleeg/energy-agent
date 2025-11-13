import { EnergyPlan, TimeOfUsePricing, SeasonalPricing } from "@/lib/types/plans";
import { HourlyUsageData, UsageStatistics } from "@/lib/types/usage";
import { calculateTieredCost, calculateBillCredit, calculateTimeOfUseCost } from "./planCost";

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

  // Check if plan has TOU or seasonal pricing
  const hasTimeOfUse = plan.pricing.some((rule) => rule.type === "TIME_OF_USE");
  const hasSeasonal = plan.pricing.some((rule) => rule.type === "SEASONAL");

  // Calculate monthly costs
  const monthlyBreakdown: MonthlyCostBreakdown[] = [];

  // For TOU plans, calculate costs from hourly data per month
  if (hasTimeOfUse) {
    const touRule = plan.pricing.find((rule) => rule.type === "TIME_OF_USE") as TimeOfUsePricing | undefined;
    
    if (touRule) {
      // Group hourly usage by month and calculate TOU costs
      const monthlyTouCosts = new Map<number, number>();
      
      for (const entry of usageData) {
        const month = entry.date.getMonth();
        const hour = entry.date.getHours();
        const dayOfWeek = entry.date.getDay();
        
        // Find matching schedule entry
        let matchedRate = 0;
        for (const scheduleEntry of touRule.schedule) {
          const matchesHour = scheduleEntry.hours.includes(hour);
          const matchesDay = scheduleEntry.days.includes(dayOfWeek);
          
          if (matchesHour && matchesDay) {
            matchedRate = scheduleEntry.ratePerKwh;
            break;
          }
        }
        
        const currentCost = monthlyTouCosts.get(month) || 0;
        monthlyTouCosts.set(month, currentCost + entry.kWh * matchedRate);
      }
      
      // Build monthly breakdown with TOU costs
      for (let month = 0; month < 12; month++) {
        const totalKWh = monthlyTotals.get(month) || 0;
        let energyCost = monthlyTouCosts.get(month) || 0;
        
        // Apply seasonal modifiers if present
        if (hasSeasonal) {
          const seasonalRules = plan.pricing.filter((rule) => rule.type === "SEASONAL") as SeasonalPricing[];
          const monthNumber = month + 1; // Convert to 1-12 format
          
          for (const rule of seasonalRules) {
            if (rule.months.includes(monthNumber)) {
              energyCost *= rule.rateModifier;
            }
          }
        }
        
        // Add base charges and TDU
        const monthlyCost = calculateMonthlyPlanCostWithEnergy(plan, totalKWh, energyCost);
        
        monthlyBreakdown.push({
          month,
          monthName: MONTH_NAMES[month],
          totalKWh,
          cost: monthlyCost,
        });
      }
    } else {
      // Fallback if TOU rule not found
      for (let month = 0; month < 12; month++) {
        const totalKWh = monthlyTotals.get(month) || 0;
        const monthlyCost = calculateMonthlyPlanCost(plan, totalKWh);
        
        monthlyBreakdown.push({
          month,
          monthName: MONTH_NAMES[month],
          totalKWh,
          cost: monthlyCost,
        });
      }
    }
  } else {
    // For non-TOU plans, calculate monthly costs normally
    for (let month = 0; month < 12; month++) {
      const totalKWh = monthlyTotals.get(month) || 0;
      let monthlyCost = calculateMonthlyPlanCost(plan, totalKWh);
      
      // Apply seasonal modifiers if present
      if (hasSeasonal) {
        const seasonalRules = plan.pricing.filter((rule) => rule.type === "SEASONAL") as SeasonalPricing[];
        const monthNumber = month + 1; // Convert to 1-12 format
        
        // Extract base energy cost (before TDU and base charges)
        const TDU_FIXED_MONTHLY = 4.50;
        const TDU_PER_KWH = 0.035;
        const tduCharges = TDU_FIXED_MONTHLY + TDU_PER_KWH * totalKWh;
        
        // Calculate base energy cost
        let baseEnergyCost = 0;
        for (const rule of plan.pricing) {
          if (rule.type === "FLAT_RATE") {
            baseEnergyCost += rule.pricePerKWh * totalKWh;
          } else if (rule.type === "TIERED") {
            baseEnergyCost += calculateTieredCost(totalKWh, rule.tiers);
          }
        }
        
        // Apply seasonal modifiers to base energy cost
        for (const rule of seasonalRules) {
          if (rule.months.includes(monthNumber)) {
            baseEnergyCost *= rule.rateModifier;
          }
        }
        
        // Recalculate total monthly cost with seasonal modifier
        let baseCharges = 0;
        let billCredits = 0;
        
        for (const rule of plan.pricing) {
          if (rule.type === "BASE_CHARGE") {
            baseCharges += rule.amountPerMonth;
          } else if (rule.type === "BILL_CREDIT") {
            const credit = calculateBillCredit(totalKWh, rule.amount, rule.minKwh, rule.maxKwh);
            billCredits += credit;
          }
        }
        
        if (plan.baseCharge) {
          baseCharges += plan.baseCharge;
        }
        
        monthlyCost = baseEnergyCost + baseCharges + tduCharges - billCredits;
      }
      
      monthlyBreakdown.push({
        month,
        monthName: MONTH_NAMES[month],
        totalKWh,
        cost: monthlyCost,
      });
    }
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

/**
 * Calculate monthly cost for a plan with pre-calculated energy cost (for TOU plans)
 * @param plan The energy plan
 * @param monthlyKWh Total kWh consumption for the month (for TDU calculation)
 * @param energyCost Pre-calculated energy cost (e.g., from TOU)
 * @returns Total monthly cost in dollars
 */
function calculateMonthlyPlanCostWithEnergy(plan: EnergyPlan, monthlyKWh: number, energyCost: number): number {
  const TDU_FIXED_MONTHLY = 4.50; // $4.50 per month
  const TDU_PER_KWH = 0.035; // $0.035 per kWh

  let baseCharges = 0;
  let billCredits = 0;

  // Calculate base charges and bill credits
  for (const rule of plan.pricing) {
    if (rule.type === "BASE_CHARGE") {
      baseCharges += rule.amountPerMonth;
    } else if (rule.type === "BILL_CREDIT") {
      const credit = calculateBillCredit(monthlyKWh, rule.amount, rule.minKwh, rule.maxKwh);
      billCredits += credit;
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

