#!/usr/bin/env tsx

/**
 * Test script for Time-of-Use (TOU) and Seasonal pricing calculations
 * 
 * Usage:
 *   pnpm tsx scripts/test-tou-seasonal-calculations.ts
 */

import { calculateTimeOfUseCost, calculateSeasonalCost, calculatePlanCost } from "../lib/calculations/planCost";
import { calculateMonthlyBreakdown } from "../lib/calculations/monthlyBreakdown";
import { EnergyPlan, TimeOfUsePricing, SeasonalPricing } from "../lib/types/plans";
import { HourlyUsageData } from "../lib/types/usage";
import complexPlans from "../data/plans/complex-plans.json";

// Helper to create hourly usage data
function createHourlyUsageData(
  startDate: Date,
  hours: number,
  usagePattern: (hour: number, dayOfWeek: number, month: number) => number
): HourlyUsageData[] {
  const data: HourlyUsageData[] = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < hours; i++) {
    const hour = currentDate.getHours();
    const dayOfWeek = currentDate.getDay();
    const month = currentDate.getMonth();
    const kWh = usagePattern(hour, dayOfWeek, month);
    
    data.push({
      date: new Date(currentDate),
      kWh,
    });
    
    // Move to next hour
    currentDate.setHours(currentDate.getHours() + 1);
  }
  
  return data;
}

// Test TOU calculations
function testTimeOfUseCalculations() {
  console.log("\n=== Testing Time-of-Use (TOU) Calculations ===\n");

  // Test 1: Free nights plan (free 10pm-6am, paid 6am-10pm)
  console.log("Test 1: Free Nights Plan (free 10pm-6am, $0.15/kWh otherwise)");
  const freeNightsSchedule: TimeOfUsePricing["schedule"] = [
    {
      hours: [22, 23, 0, 1, 2, 3, 4, 5],
      days: [0, 1, 2, 3, 4, 5, 6],
      ratePerKwh: 0.0,
    },
    {
      hours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
      days: [0, 1, 2, 3, 4, 5, 6],
      ratePerKwh: 0.15,
    },
  ];

  // Create usage data: 2 kWh during free hours, 3 kWh during paid hours
  const startDate = new Date("2024-01-01T00:00:00");
  const usageData1 = createHourlyUsageData(startDate, 24, (hour) => {
    if ([22, 23, 0, 1, 2, 3, 4, 5].includes(hour)) {
      return 2.0; // Free hours
    }
    return 3.0; // Paid hours
  });

  const cost1 = calculateTimeOfUseCost(usageData1, freeNightsSchedule);
  // Free hours: 8 hours * 2 kWh = 16 kWh * $0 = $0
  // Paid hours: 16 hours * 3 kWh = 48 kWh * $0.15 = $7.20
  const expected1 = 48 * 0.15; // $7.20
  console.log(`  Usage: 16 kWh free + 48 kWh paid = 64 kWh total`);
  console.log(`  Result: $${cost1.toFixed(2)} (Expected: $${expected1.toFixed(2)})`);
  console.log(`  ✓ ${Math.abs(cost1 - expected1) < 0.01 ? "PASS" : "FAIL"}\n`);

  // Test 2: Peak/off-peak plan
  console.log("Test 2: Peak/Off-Peak Plan (peak 2pm-7pm weekdays $0.20/kWh, off-peak $0.10/kWh)");
  const peakOffPeakSchedule: TimeOfUsePricing["schedule"] = [
    {
      hours: [14, 15, 16, 17, 18],
      days: [1, 2, 3, 4, 5], // Weekdays
      ratePerKwh: 0.20,
    },
    {
      hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 19, 20, 21, 22, 23],
      days: [1, 2, 3, 4, 5], // Weekdays
      ratePerKwh: 0.10,
    },
    {
      hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
      days: [0, 6], // Weekends
      ratePerKwh: 0.10,
    },
  ];

  // Create a full week of data
  const weekData = createHourlyUsageData(new Date("2024-01-01T00:00:00"), 168, (hour, dayOfWeek) => {
    // Monday (1) to Friday (5), peak hours
    if ([1, 2, 3, 4, 5].includes(dayOfWeek) && [14, 15, 16, 17, 18].includes(hour)) {
      return 5.0; // Peak usage
    }
    return 2.0; // Off-peak usage
  });

  const cost2 = calculateTimeOfUseCost(weekData, peakOffPeakSchedule);
  // Calculate expected: 5 weekdays * 5 peak hours * 5 kWh = 125 kWh at $0.20 = $25
  // Rest: (168 - 25) hours * 2 kWh = 286 kWh at $0.10 = $28.60
  // Total: $53.60
  const peakHours = 5 * 5; // 5 weekdays * 5 peak hours
  const peakKwh = peakHours * 5;
  const offPeakKwh = (168 - peakHours) * 2;
  const expected2 = peakKwh * 0.20 + offPeakKwh * 0.10;
  console.log(`  Usage: ${peakKwh} kWh peak + ${offPeakKwh} kWh off-peak = ${peakKwh + offPeakKwh} kWh total`);
  console.log(`  Result: $${cost2.toFixed(2)} (Expected: $${expected2.toFixed(2)})`);
  console.log(`  ✓ ${Math.abs(cost2 - expected2) < 0.01 ? "PASS" : "FAIL"}\n`);

  // Test 3: Weekend free plan
  console.log("Test 3: Weekend Free Plan (free weekends, $0.13/kWh weekdays)");
  const weekendFreeSchedule: TimeOfUsePricing["schedule"] = [
    {
      hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
      days: [0, 6], // Weekends
      ratePerKwh: 0.0,
    },
    {
      hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
      days: [1, 2, 3, 4, 5], // Weekdays
      ratePerKwh: 0.13,
    },
  ];

  const weekData2 = createHourlyUsageData(new Date("2024-01-01T00:00:00"), 168, (hour, dayOfWeek) => {
    return 3.0; // Constant usage
  });

  const cost3 = calculateTimeOfUseCost(weekData2, weekendFreeSchedule);
  // Weekends: 2 days * 24 hours = 48 hours * 3 kWh = 144 kWh * $0 = $0
  // Weekdays: 5 days * 24 hours = 120 hours * 3 kWh = 360 kWh * $0.13 = $46.80
  const weekendKwh = 2 * 24 * 3;
  const weekdayKwh = 5 * 24 * 3;
  const expected3 = weekdayKwh * 0.13;
  console.log(`  Usage: ${weekendKwh} kWh weekends (free) + ${weekdayKwh} kWh weekdays = ${weekendKwh + weekdayKwh} kWh total`);
  console.log(`  Result: $${cost3.toFixed(2)} (Expected: $${expected3.toFixed(2)})`);
  console.log(`  ✓ ${Math.abs(cost3 - expected3) < 0.01 ? "PASS" : "FAIL"}\n`);
}

// Test Seasonal calculations
function testSeasonalCalculations() {
  console.log("\n=== Testing Seasonal Pricing Calculations ===\n");

  // Test 1: Summer premium plan
  console.log("Test 1: Summer Premium Plan (base $0.11/kWh, +50% in July-September)");
  const baseMonthlyCosts = [
    100, 100, 100, 100, 100, 100, // Jan-Jun: $100/month
    150, 150, 150, // Jul-Sep: $150/month (50% premium)
    100, 100, 100, // Oct-Dec: $100/month
  ];

  const seasonalRules: SeasonalPricing[] = [
    {
      type: "SEASONAL",
      months: [7, 8, 9], // July, August, September
      rateModifier: 1.5,
    },
  ];

  // Calculate base costs first (without modifier)
  const baseCosts = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
  const cost1 = calculateSeasonalCost(baseCosts, seasonalRules);
  const expected1 = 100 * 6 + 100 * 1.5 * 3 + 100 * 3; // $1,350
  console.log(`  Base costs: $100/month for 9 months, $150/month for 3 months`);
  console.log(`  Result: $${cost1.toFixed(2)} (Expected: $${expected1.toFixed(2)})`);
  console.log(`  ✓ ${Math.abs(cost1 - expected1) < 0.01 ? "PASS" : "FAIL"}\n`);

  // Test 2: Winter premium plan
  console.log("Test 2: Winter Premium Plan (base $0.11/kWh, +50% in December-February)");
  const seasonalRules2: SeasonalPricing[] = [
    {
      type: "SEASONAL",
      months: [12, 1, 2], // December, January, February
      rateModifier: 1.5,
    },
  ];

  const baseCosts2 = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
  const cost2 = calculateSeasonalCost(baseCosts2, seasonalRules2);
  const expected2 = 100 * 1.5 * 3 + 100 * 9; // $1,350
  console.log(`  Base costs: $100/month for 9 months, $150/month for 3 months`);
  console.log(`  Result: $${cost2.toFixed(2)} (Expected: $${expected2.toFixed(2)})`);
  console.log(`  ✓ ${Math.abs(cost2 - expected2) < 0.01 ? "PASS" : "FAIL"}\n`);

  // Test 3: Shoulder season discount
  console.log("Test 3: Shoulder Season Discount (base $0.12/kWh, -25% in March-May)");
  const seasonalRules3: SeasonalPricing[] = [
    {
      type: "SEASONAL",
      months: [3, 4, 5], // March, April, May
      rateModifier: 0.75,
    },
  ];

  const baseCosts3 = [120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120];
  const cost3 = calculateSeasonalCost(baseCosts3, seasonalRules3);
  const expected3 = 120 * 0.75 * 3 + 120 * 9; // $1,350
  console.log(`  Base costs: $120/month for 9 months, $90/month for 3 months`);
  console.log(`  Result: $${cost3.toFixed(2)} (Expected: $${expected3.toFixed(2)})`);
  console.log(`  ✓ ${Math.abs(cost3 - expected3) < 0.01 ? "PASS" : "FAIL"}\n`);
}

// Test combined TOU + Seasonal plans
function testCombinedTouSeasonal() {
  console.log("\n=== Testing Combined TOU + Seasonal Plans ===\n");

  const plans = complexPlans as EnergyPlan[];
  
  // Find a plan with both TOU and seasonal (if any)
  // For now, test with a simulated plan
  console.log("Test: Combined TOU + Seasonal Calculation");
  
  // Create a TOU plan with seasonal modifier
  const testPlan: EnergyPlan = {
    id: "test-combined",
    name: "Test Combined Plan",
    provider: "Test Provider",
    pricing: [
      {
        type: "TIME_OF_USE",
        schedule: [
          {
            hours: [22, 23, 0, 1, 2, 3, 4, 5],
            days: [0, 1, 2, 3, 4, 5, 6],
            ratePerKwh: 0.0,
          },
          {
            hours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
            days: [0, 1, 2, 3, 4, 5, 6],
            ratePerKwh: 0.15,
          },
        ],
      } as TimeOfUsePricing,
      {
        type: "SEASONAL",
        months: [6, 7, 8], // July, August, September
        rateModifier: 1.5,
      } as SeasonalPricing,
    ],
    baseCharge: 0,
    renewablePercent: 50,
    contractLength: 12,
  };

  // Create hourly data for a full year
  const startDate = new Date("2024-01-01T00:00:00");
  const hourlyData = createHourlyUsageData(startDate, 8760, (hour, dayOfWeek, month) => {
    // Free hours: 2 kWh, paid hours: 3 kWh
    if ([22, 23, 0, 1, 2, 3, 4, 5].includes(hour)) {
      return 2.0;
    }
    return 3.0;
  });

  // Calculate monthly kWh for seasonal modifier
  const monthlyKWh: number[] = new Array(12).fill(0);
  hourlyData.forEach((entry) => {
    const month = entry.date.getMonth();
    monthlyKWh[month] += entry.kWh;
  });

  const result = calculatePlanCost(testPlan, monthlyKWh.reduce((a, b) => a + b, 0), monthlyKWh, hourlyData);
  
  console.log(`  Plan: ${testPlan.name}`);
  console.log(`  Annual cost: $${result.annualCost.toFixed(2)}`);
  console.log(`  Monthly average: $${result.monthlyCost.toFixed(2)}`);
  console.log(`  Energy cost: $${result.breakdown.energyCost.toFixed(2)}`);
  console.log(`  ✓ Calculation completed (TOU + Seasonal combined)\n`);
}

// Test monthly breakdown with TOU/seasonal
function testMonthlyBreakdown() {
  console.log("\n=== Testing Monthly Breakdown with TOU/Seasonal ===\n");

  const plans = complexPlans as EnergyPlan[];
  
  // Test with a TOU plan
  const touPlan = plans.find((p) => 
    p.pricing.some((r) => r.type === "TIME_OF_USE")
  ) as EnergyPlan | undefined;

  if (touPlan) {
    console.log(`Testing monthly breakdown for: ${touPlan.name}`);
    
    // Create a month of hourly data (January 2024)
    const startDate = new Date("2024-01-01T00:00:00");
    const januaryData = createHourlyUsageData(startDate, 744, (hour) => {
      // Vary usage by hour
      if ([22, 23, 0, 1, 2, 3, 4, 5].includes(hour)) {
        return 2.0; // Night usage
      }
      return 3.0; // Day usage
    });

    const breakdown = calculateMonthlyBreakdown(touPlan, januaryData);
    
    console.log(`  January breakdown:`);
    console.log(`    Total kWh: ${breakdown[0].totalKWh.toFixed(1)}`);
    console.log(`    Cost: $${breakdown[0].cost.toFixed(2)}`);
    console.log(`  ✓ Monthly breakdown calculated\n`);
  }

  // Test with a seasonal plan
  const seasonalPlan = plans.find((p) => 
    p.pricing.some((r) => r.type === "SEASONAL") && 
    !p.pricing.some((r) => r.type === "TIME_OF_USE")
  ) as EnergyPlan | undefined;

  if (seasonalPlan) {
    console.log(`Testing monthly breakdown for: ${seasonalPlan.name}`);
    
    // Create a full year of hourly data
    const startDate = new Date("2024-01-01T00:00:00");
    const yearData = createHourlyUsageData(startDate, 8760, () => 2.5); // Constant usage

    const breakdown = calculateMonthlyBreakdown(seasonalPlan, yearData);
    
    console.log(`  Monthly breakdown (first 3 months):`);
    breakdown.slice(0, 3).forEach((month) => {
      console.log(`    ${month.monthName}: ${month.totalKWh.toFixed(1)} kWh, $${month.cost.toFixed(2)}`);
    });
    console.log(`  ✓ Monthly breakdown calculated\n`);
  }
}

// Test with actual complex plans
function testComplexPlans() {
  console.log("\n=== Testing with Actual Complex Plans ===\n");

  const plans = complexPlans as EnergyPlan[];
  
  console.log(`Found ${plans.length} complex plans\n`);

  // Test a few TOU plans
  const touPlans = plans.filter((p) => 
    p.pricing.some((r) => r.type === "TIME_OF_USE")
  ).slice(0, 3);

  touPlans.forEach((plan) => {
    console.log(`Testing TOU plan: ${plan.name} (${plan.id})`);
    
    // Create sample hourly data (one week)
    const startDate = new Date("2024-01-01T00:00:00");
    const weekData = createHourlyUsageData(startDate, 168, () => 2.5);
    
    const monthlyKWh = [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500];
    const totalKWh = monthlyKWh.reduce((a, b) => a + b, 0);
    
    const result = calculatePlanCost(plan, totalKWh, monthlyKWh, weekData);
    console.log(`  Annual cost: $${result.annualCost.toFixed(2)}`);
    console.log(`  ✓ Calculation completed\n`);
  });

  // Test a few seasonal plans
  const seasonalPlans = plans.filter((p) => 
    p.pricing.some((r) => r.type === "SEASONAL") &&
    !p.pricing.some((r) => r.type === "TIME_OF_USE")
  ).slice(0, 3);

  seasonalPlans.forEach((plan) => {
    console.log(`Testing seasonal plan: ${plan.name} (${plan.id})`);
    
    const monthlyKWh = [600, 600, 600, 600, 600, 600, 800, 800, 800, 600, 600, 600];
    const totalKWh = monthlyKWh.reduce((a, b) => a + b, 0);
    
    const result = calculatePlanCost(plan, totalKWh, monthlyKWh);
    console.log(`  Annual cost: $${result.annualCost.toFixed(2)}`);
    console.log(`  ✓ Calculation completed\n`);
  });
}

// Main test runner
function main() {
  console.log("=".repeat(60));
  console.log("TOU & Seasonal Calculation Test Suite");
  console.log("=".repeat(60));

  try {
    testTimeOfUseCalculations();
    testSeasonalCalculations();
    testCombinedTouSeasonal();
    testMonthlyBreakdown();
    testComplexPlans();

    console.log("=".repeat(60));
    console.log("All tests completed!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ Test failed with error:", error);
    if (error instanceof Error) {
      console.error("Stack:", error.stack);
    }
    process.exit(1);
  }
}

main();

