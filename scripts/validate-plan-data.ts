#!/usr/bin/env tsx

/**
 * Validate plan data structure and ensure all plans are correctly formatted
 * 
 * Usage:
 *   pnpm tsx scripts/validate-plan-data.ts
 */

import { EnergyPlan, TimeOfUsePricing, SeasonalPricing } from "../lib/types/plans";
import simplePlans from "../data/plans/simple-plans.json";
import complexPlans from "../data/plans/complex-plans.json";

function validatePlanData() {
  console.log("=".repeat(60));
  console.log("Plan Data Validation");
  console.log("=".repeat(60));

  const allPlans = [...(simplePlans as EnergyPlan[]), ...(complexPlans as EnergyPlan[])];

  console.log(`\nTotal plans: ${allPlans.length}`);
  console.log(`  Simple plans: ${simplePlans.length}`);
  console.log(`  Complex plans: ${complexPlans.length}`);

  // Validate all plans
  const errors: string[] = [];
  const warnings: string[] = [];
  const planIds = new Set<string>();

  allPlans.forEach((plan, index) => {
    // Check for duplicate IDs
    if (planIds.has(plan.id)) {
      errors.push(`Duplicate plan ID: ${plan.id}`);
    }
    planIds.add(plan.id);

    // Validate required fields
    if (!plan.id || typeof plan.id !== "string") {
      errors.push(`Plan ${index}: Missing or invalid ID`);
    }
    if (!plan.name || typeof plan.name !== "string") {
      errors.push(`Plan ${plan.id}: Missing or invalid name`);
    }
    if (!plan.provider || typeof plan.provider !== "string") {
      errors.push(`Plan ${plan.id}: Missing or invalid provider`);
    }
    if (typeof plan.renewablePercent !== "number" || plan.renewablePercent < 0 || plan.renewablePercent > 100) {
      errors.push(`Plan ${plan.id}: Invalid renewablePercent (must be 0-100)`);
    }
    if (typeof plan.contractLength !== "number" || plan.contractLength <= 0) {
      errors.push(`Plan ${plan.id}: Invalid contractLength (must be > 0)`);
    }
    if (!Array.isArray(plan.pricing) || plan.pricing.length === 0) {
      errors.push(`Plan ${plan.id}: Missing or empty pricing array`);
    }

    // Validate pricing rules
    plan.pricing.forEach((rule, ruleIndex) => {
      if (!rule.type) {
        errors.push(`Plan ${plan.id}, rule ${ruleIndex}: Missing type`);
        return;
      }

      switch (rule.type) {
        case "FLAT_RATE":
          if (typeof rule.pricePerKWh !== "number" || rule.pricePerKWh < 0) {
            errors.push(`Plan ${plan.id}, FLAT_RATE rule: Invalid pricePerKWh`);
          }
          break;

        case "TIERED":
          if (!Array.isArray(rule.tiers) || rule.tiers.length === 0) {
            errors.push(`Plan ${plan.id}, TIERED rule: Missing or empty tiers`);
          }
          rule.tiers?.forEach((tier, tierIndex) => {
            if (typeof tier.ratePerKwh !== "number" || tier.ratePerKwh < 0) {
              errors.push(`Plan ${plan.id}, TIERED tier ${tierIndex}: Invalid ratePerKwh`);
            }
            if (tier.maxKwh !== null && (typeof tier.maxKwh !== "number" || tier.maxKwh <= 0)) {
              errors.push(`Plan ${plan.id}, TIERED tier ${tierIndex}: Invalid maxKwh`);
            }
          });
          break;

        case "BILL_CREDIT":
          if (typeof rule.amount !== "number") {
            errors.push(`Plan ${plan.id}, BILL_CREDIT rule: Invalid amount`);
          }
          if (typeof rule.minKwh !== "number" || rule.minKwh < 0) {
            errors.push(`Plan ${plan.id}, BILL_CREDIT rule: Invalid minKwh`);
          }
          if (rule.maxKwh !== null && (typeof rule.maxKwh !== "number" || rule.maxKwh < rule.minKwh)) {
            errors.push(`Plan ${plan.id}, BILL_CREDIT rule: Invalid maxKwh`);
          }
          break;

        case "TIME_OF_USE":
          const touRule = rule as TimeOfUsePricing;
          if (!Array.isArray(touRule.schedule) || touRule.schedule.length === 0) {
            errors.push(`Plan ${plan.id}, TIME_OF_USE rule: Missing or empty schedule`);
          }
          touRule.schedule?.forEach((schedule, schedIndex) => {
            if (!Array.isArray(schedule.hours) || schedule.hours.length === 0) {
              errors.push(`Plan ${plan.id}, TIME_OF_USE schedule ${schedIndex}: Missing or empty hours`);
            } else {
              schedule.hours.forEach((hour) => {
                if (typeof hour !== "number" || hour < 0 || hour > 23) {
                  errors.push(`Plan ${plan.id}, TIME_OF_USE schedule ${schedIndex}: Invalid hour ${hour}`);
                }
              });
            }
            if (!Array.isArray(schedule.days) || schedule.days.length === 0) {
              errors.push(`Plan ${plan.id}, TIME_OF_USE schedule ${schedIndex}: Missing or empty days`);
            } else {
              schedule.days.forEach((day) => {
                if (typeof day !== "number" || day < 0 || day > 6) {
                  errors.push(`Plan ${plan.id}, TIME_OF_USE schedule ${schedIndex}: Invalid day ${day}`);
                }
              });
            }
            if (typeof schedule.ratePerKwh !== "number" || schedule.ratePerKwh < 0) {
              errors.push(`Plan ${plan.id}, TIME_OF_USE schedule ${schedIndex}: Invalid ratePerKwh`);
            }
          });
          break;

        case "SEASONAL":
          const seasonalRule = rule as SeasonalPricing;
          if (!Array.isArray(seasonalRule.months) || seasonalRule.months.length === 0) {
            errors.push(`Plan ${plan.id}, SEASONAL rule: Missing or empty months`);
          } else {
            seasonalRule.months.forEach((month) => {
              if (typeof month !== "number" || month < 1 || month > 12) {
                errors.push(`Plan ${plan.id}, SEASONAL rule: Invalid month ${month}`);
              }
            });
          }
          if (typeof seasonalRule.rateModifier !== "number" || seasonalRule.rateModifier <= 0) {
            errors.push(`Plan ${plan.id}, SEASONAL rule: Invalid rateModifier`);
          }
          break;

        case "BASE_CHARGE":
          if (typeof rule.amountPerMonth !== "number" || rule.amountPerMonth < 0) {
            errors.push(`Plan ${plan.id}, BASE_CHARGE rule: Invalid amountPerMonth`);
          }
          break;

        default:
          errors.push(`Plan ${plan.id}, rule ${ruleIndex}: Unknown rule type: ${(rule as any).type}`);
      }
    });

    // Check base charge
    if (plan.baseCharge !== undefined && (typeof plan.baseCharge !== "number" || plan.baseCharge < 0)) {
      errors.push(`Plan ${plan.id}: Invalid baseCharge`);
    }
  });

  // Count plan types
  const planTypeCounts = {
    simple: 0,
    medium: 0,
    complex: 0,
  };

  allPlans.forEach((plan) => {
    const hasTou = plan.pricing.some((r) => r.type === "TIME_OF_USE");
    const hasSeasonal = plan.pricing.some((r) => r.type === "SEASONAL");
    const hasTiered = plan.pricing.some((r) => r.type === "TIERED");
    const hasBillCredit = plan.pricing.some((r) => r.type === "BILL_CREDIT");

    if (hasTou || hasSeasonal) {
      planTypeCounts.complex++;
    } else if (hasTiered || hasBillCredit) {
      planTypeCounts.medium++;
    } else {
      planTypeCounts.simple++;
    }
  });

  console.log(`\nPlan complexity breakdown:`);
  console.log(`  Simple: ${planTypeCounts.simple}`);
  console.log(`  Medium: ${planTypeCounts.medium}`);
  console.log(`  Complex: ${planTypeCounts.complex}`);

  // Count TOU and Seasonal plans
  const touPlans = allPlans.filter((p) => p.pricing.some((r) => r.type === "TIME_OF_USE"));
  const seasonalPlans = allPlans.filter((p) => p.pricing.some((r) => r.type === "SEASONAL"));
  const combinedPlans = allPlans.filter(
    (p) => p.pricing.some((r) => r.type === "TIME_OF_USE") && p.pricing.some((r) => r.type === "SEASONAL")
  );

  console.log(`\nPlan type breakdown:`);
  console.log(`  TOU plans: ${touPlans.length}`);
  console.log(`  Seasonal plans: ${seasonalPlans.length}`);
  console.log(`  Combined TOU + Seasonal: ${combinedPlans.length}`);

  // Report results
  console.log("\n" + "=".repeat(60));
  if (errors.length === 0 && warnings.length === 0) {
    console.log("✓ All plans validated successfully!");
    console.log("=".repeat(60));
    return true;
  } else {
    if (errors.length > 0) {
      console.log(`\n❌ Found ${errors.length} error(s):`);
      errors.forEach((error) => console.log(`  - ${error}`));
    }
    if (warnings.length > 0) {
      console.log(`\n⚠ Found ${warnings.length} warning(s):`);
      warnings.forEach((warning) => console.log(`  - ${warning}`));
    }
    console.log("=".repeat(60));
    return false;
  }
}

// Run validation
const isValid = validatePlanData();
process.exit(isValid ? 0 : 1);

