import { EnergyPlan, PlanCostResult, TieredPricing, BillCreditPricing, TimeOfUsePricing, SeasonalPricing } from "@/lib/types/plans";
import { HourlyUsageData } from "@/lib/types/usage";

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
 * Calculate cost for time-of-use pricing based on hourly usage data
 * @param hourlyUsageData Array of hourly usage data
 * @param schedule TOU schedule array
 * @returns Total energy cost for TOU pricing
 */
export function calculateTimeOfUseCost(
  hourlyUsageData: HourlyUsageData[],
  schedule: TimeOfUsePricing["schedule"]
): number {
  let totalCost = 0;

  for (const entry of hourlyUsageData) {
    const hour = entry.date.getHours(); // 0-23
    const dayOfWeek = entry.date.getDay(); // 0-6 (Sunday=0)

    // Find matching schedule entry
    let matchedRate = 0;
    for (const scheduleEntry of schedule) {
      const matchesHour = scheduleEntry.hours.includes(hour);
      const matchesDay = scheduleEntry.days.includes(dayOfWeek);
      
      if (matchesHour && matchesDay) {
        matchedRate = scheduleEntry.ratePerKwh;
        break; // Use first matching schedule entry
      }
    }

    // Calculate cost for this hour
    totalCost += entry.kWh * matchedRate;
  }

  return totalCost;
}

/**
 * Calculate cost for seasonal pricing by applying modifiers to base monthly costs
 * @param monthlyCosts Array of base monthly costs (12 months)
 * @param seasonalRules Array of seasonal pricing rules
 * @returns Total annual cost with seasonal modifiers applied
 */
export function calculateSeasonalCost(
  monthlyCosts: number[],
  seasonalRules: SeasonalPricing[]
): number {
  let totalCost = 0;

  // Apply seasonal modifiers to each month
  for (let month = 0; month < 12; month++) {
    const monthNumber = month + 1; // Convert to 1-12 format
    let monthlyCost = monthlyCosts[month] || 0;

    // Apply all seasonal modifiers that match this month
    for (const rule of seasonalRules) {
      if (rule.months.includes(monthNumber)) {
        monthlyCost *= rule.rateModifier;
      }
    }

    totalCost += monthlyCost;
  }

  return totalCost;
}

/**
 * Calculate the annual cost of an energy plan based on usage data
 * @param plan The energy plan to calculate costs for
 * @param totalKWh Total annual energy consumption in kWh
 * @param monthlyKWh Optional array of monthly kWh values (12 months) - required for tiered/bill credit plans
 * @param hourlyUsageData Optional array of hourly usage data - required for TOU plans
 * @returns Plan cost result with annual cost, monthly cost, and breakdown
 */
export function calculatePlanCost(
  plan: EnergyPlan,
  totalKWh: number,
  monthlyKWh?: number[],
  hourlyUsageData?: HourlyUsageData[]
): PlanCostResult {
  let energyCost = 0;
  let baseCharges = 0;
  let billCredits = 0;

  // Check if plan requires TOU calculation
  const hasTimeOfUse = plan.pricing.some((rule) => rule.type === "TIME_OF_USE");
  const hasSeasonal = plan.pricing.some((rule) => rule.type === "SEASONAL");
  
  // Check if plan requires monthly calculation (has tiered or bill credit rules)
  const needsMonthlyCalculation =
    plan.pricing.some((rule) => rule.type === "TIERED" || rule.type === "BILL_CREDIT");

  // Handle TOU pricing (requires hourly data)
  if (hasTimeOfUse && hourlyUsageData) {
    const touRule = plan.pricing.find((rule) => rule.type === "TIME_OF_USE") as TimeOfUsePricing | undefined;
    if (touRule) {
      // Calculate TOU cost from hourly data
      energyCost = calculateTimeOfUseCost(hourlyUsageData, touRule.schedule);
      
      // If seasonal modifiers are present, apply them to monthly TOU costs
      if (hasSeasonal) {
        const seasonalRules = plan.pricing.filter((rule) => rule.type === "SEASONAL") as SeasonalPricing[];
        if (seasonalRules.length > 0 && monthlyKWh) {
          // Group hourly TOU costs by month
          const monthlyTouCosts: number[] = new Array(12).fill(0);
          
          for (const entry of hourlyUsageData) {
            const month = entry.date.getMonth(); // 0-11
            const hour = entry.date.getHours(); // 0-23
            const dayOfWeek = entry.date.getDay(); // 0-6
            
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
            
            monthlyTouCosts[month] += entry.kWh * matchedRate;
          }
          
          // Apply seasonal modifiers to monthly TOU costs
          energyCost = calculateSeasonalCost(monthlyTouCosts, seasonalRules);
        }
      }
    }
  } else if (needsMonthlyCalculation && monthlyKWh) {
    // Calculate monthly costs and sum for annual total
    for (let month = 0; month < 12; month++) {
      const monthKWh = monthlyKWh[month] || 0;

      // Calculate energy cost from pricing rules for this month
      // Skip TOU rules (handled separately) and seasonal rules (applied after)
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
        // Skip TIME_OF_USE (handled separately) and SEASONAL (applied after)
      }
    }
    
    // Apply seasonal modifiers to monthly costs if present
    if (hasSeasonal && monthlyKWh) {
      const seasonalRules = plan.pricing.filter((rule) => rule.type === "SEASONAL") as SeasonalPricing[];
      if (seasonalRules.length > 0) {
        // Calculate base monthly costs first
        const monthlyCosts: number[] = [];
        for (let month = 0; month < 12; month++) {
          const monthKWh = monthlyKWh[month] || 0;
          let monthCost = 0;
          
          // Calculate base cost for this month (excluding seasonal rules)
          for (const rule of plan.pricing) {
            if (rule.type === "FLAT_RATE") {
              monthCost += rule.pricePerKWh * monthKWh;
            } else if (rule.type === "TIERED") {
              monthCost += calculateTieredCost(monthKWh, rule.tiers);
            }
            // Skip SEASONAL (applied after), TIME_OF_USE (handled separately), BILL_CREDIT (handled separately)
          }
          
          monthlyCosts.push(monthCost);
        }
        
        // Apply seasonal modifiers
        energyCost = calculateSeasonalCost(monthlyCosts, seasonalRules);
      }
    }
  } else {
    // Annual calculation for simple plans (flat-rate only, or TOU without hourly data)
    // Note: TOU plans without hourly data will fall back to this, which is incorrect
    // but we can't calculate TOU without hourly data
    for (const rule of plan.pricing) {
      if (rule.type === "FLAT_RATE") {
        energyCost += rule.pricePerKWh * totalKWh;
      } else if (rule.type === "BASE_CHARGE") {
        // Base charge pricing rules are monthly, so multiply by 12 for annual
        baseCharges += rule.amountPerMonth * 12;
      }
      // Note: TIERED, BILL_CREDIT, TIME_OF_USE, and SEASONAL require special handling
      // If required data is not provided, these plans will have incorrect calculations
    }
    
    // Apply seasonal modifiers to annual cost if present (and no monthly calculation)
    if (hasSeasonal && !needsMonthlyCalculation) {
      const seasonalRules = plan.pricing.filter((rule) => rule.type === "SEASONAL") as SeasonalPricing[];
      if (seasonalRules.length > 0) {
        // For annual calculation, we need monthly breakdown to apply seasonal modifiers
        // If monthlyKWh is not provided, we'll estimate by dividing totalKWh by 12
        // This is less accurate but better than nothing
        const estimatedMonthlyKWh = totalKWh / 12;
        const monthlyCosts: number[] = [];
        
        for (let month = 0; month < 12; month++) {
          let monthCost = 0;
          for (const rule of plan.pricing) {
            if (rule.type === "FLAT_RATE") {
              monthCost += rule.pricePerKWh * estimatedMonthlyKWh;
            }
          }
          monthlyCosts.push(monthCost);
        }
        
        energyCost = calculateSeasonalCost(monthlyCosts, seasonalRules);
      }
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

