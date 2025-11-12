#!/usr/bin/env tsx

/**
 * Test script for tiered pricing and bill credit calculations
 * 
 * Usage:
 *   pnpm tsx scripts/test-plan-calculations.ts
 */

import { calculateTieredCost, calculateBillCredit, calculatePlanCost } from "../lib/calculations/planCost";
import { EnergyPlan } from "../lib/types/plans";
import simplePlans from "../data/plans/simple-plans.json";

// Test tiered pricing calculations
function testTieredPricing() {
  console.log("\n=== Testing Tiered Pricing Calculations ===\n");

  // Test case 1: Simple 2-tier structure
  const tiers1 = [
    { maxKwh: 500, ratePerKwh: 0.10 },
    { maxKwh: null, ratePerKwh: 0.12 }
  ];

  console.log("Test 1: 2-tier structure (500 kWh at $0.10, above at $0.12)");
  console.log("Usage: 300 kWh");
  const cost1a = calculateTieredCost(300, tiers1);
  console.log(`Result: $${cost1a.toFixed(2)} (Expected: $30.00)`);
  console.log(`✓ ${cost1a === 30 ? "PASS" : "FAIL"}\n`);

  console.log("Usage: 600 kWh");
  const cost1b = calculateTieredCost(600, tiers1);
  console.log(`Result: $${cost1b.toFixed(2)} (Expected: $62.00 = $50.00 + $12.00)`);
  console.log(`✓ ${Math.abs(cost1b - 62) < 0.01 ? "PASS" : "FAIL"}\n`);

  // Test case 2: 3-tier structure
  const tiers2 = [
    { maxKwh: 500, ratePerKwh: 0.09 },
    { maxKwh: 1000, ratePerKwh: 0.11 },
    { maxKwh: null, ratePerKwh: 0.13 }
  ];

  console.log("Test 2: 3-tier structure");
  console.log("Usage: 1200 kWh");
  const cost2 = calculateTieredCost(1200, tiers2);
  // First 500: 500 * 0.09 = 45
  // Next 500 (501-1000): 500 * 0.11 = 55
  // Above 1000 (1001-1200): 200 * 0.13 = 26
  // Total: 126
  console.log(`Result: $${cost2.toFixed(2)} (Expected: $126.00)`);
  console.log(`✓ ${Math.abs(cost2 - 126) < 0.01 ? "PASS" : "FAIL"}\n`);

  // Test case 3: Edge case - usage at tier boundary
  console.log("Test 3: Usage exactly at tier boundary (500 kWh)");
  const cost3 = calculateTieredCost(500, tiers2);
  console.log(`Result: $${cost3.toFixed(2)} (Expected: $45.00)`);
  console.log(`✓ ${Math.abs(cost3 - 45) < 0.01 ? "PASS" : "FAIL"}\n`);

  // Test case 4: Zero usage
  console.log("Test 4: Zero usage");
  const cost4 = calculateTieredCost(0, tiers2);
  console.log(`Result: $${cost4.toFixed(2)} (Expected: $0.00)`);
  console.log(`✓ ${cost4 === 0 ? "PASS" : "FAIL"}\n`);
}

// Test bill credit calculations
function testBillCredits() {
  console.log("\n=== Testing Bill Credit Calculations ===\n");

  // Test case 1: Usage within credit range
  console.log("Test 1: Usage within credit range (1000 kWh, credit for 800-1500)");
  const credit1 = calculateBillCredit(1000, 25.00, 800, 1500);
  console.log(`Result: $${credit1.toFixed(2)} (Expected: $25.00)`);
  console.log(`✓ ${credit1 === 25 ? "PASS" : "FAIL"}\n`);

  // Test case 2: Usage below minimum
  console.log("Test 2: Usage below minimum (500 kWh, credit for 800-1500)");
  const credit2 = calculateBillCredit(500, 25.00, 800, 1500);
  console.log(`Result: $${credit2.toFixed(2)} (Expected: $0.00)`);
  console.log(`✓ ${credit2 === 0 ? "PASS" : "FAIL"}\n`);

  // Test case 3: Usage above maximum
  console.log("Test 3: Usage above maximum (2000 kWh, credit for 800-1500)");
  const credit3 = calculateBillCredit(2000, 25.00, 800, 1500);
  console.log(`Result: $${credit3.toFixed(2)} (Expected: $0.00)`);
  console.log(`✓ ${credit3 === 0 ? "PASS" : "FAIL"}\n`);

  // Test case 4: Usage at minimum boundary
  console.log("Test 4: Usage at minimum boundary (800 kWh, credit for 800-1500)");
  const credit4 = calculateBillCredit(800, 25.00, 800, 1500);
  console.log(`Result: $${credit4.toFixed(2)} (Expected: $25.00)`);
  console.log(`✓ ${credit4 === 25 ? "PASS" : "FAIL"}\n`);

  // Test case 5: Usage at maximum boundary
  console.log("Test 5: Usage at maximum boundary (1500 kWh, credit for 800-1500)");
  const credit5 = calculateBillCredit(1500, 25.00, 800, 1500);
  console.log(`Result: $${credit5.toFixed(2)} (Expected: $25.00)`);
  console.log(`✓ ${credit5 === 25 ? "PASS" : "FAIL"}\n`);

  // Test case 6: Unlimited maximum
  console.log("Test 6: Unlimited maximum (2000 kWh, credit for 1000+)");
  const credit6 = calculateBillCredit(2000, 30.00, 1000, null);
  console.log(`Result: $${credit6.toFixed(2)} (Expected: $30.00)`);
  console.log(`✓ ${credit6 === 30 ? "PASS" : "FAIL"}\n`);
}

// Test full plan calculations with tiered/bill credit plans
function testPlanCalculations() {
  console.log("\n=== Testing Full Plan Calculations ===\n");

  const plans = simplePlans as EnergyPlan[];

  // Find a tiered plan
  const tieredPlan = plans.find((p) => 
    p.pricing.some((r) => r.type === "TIERED")
  );

  if (tieredPlan) {
    console.log(`Testing tiered plan: ${tieredPlan.name} (${tieredPlan.id})`);
    
    // Test with monthly breakdown
    const monthlyKWh = [400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950];
    const totalKWh = monthlyKWh.reduce((sum, val) => sum + val, 0);

    console.log(`Total annual usage: ${totalKWh} kWh`);
    console.log(`Monthly breakdown: ${monthlyKWh.join(", ")} kWh`);

    const result = calculatePlanCost(tieredPlan, totalKWh, monthlyKWh);
    console.log(`Annual cost: $${result.annualCost.toFixed(2)}`);
    console.log(`Monthly average: $${result.monthlyCost.toFixed(2)}`);
    console.log(`Energy cost: $${result.breakdown.energyCost.toFixed(2)}`);
    console.log(`TDU charges: $${result.breakdown.tduCharges.toFixed(2)}`);
    console.log(`Bill credits: $${result.breakdown.billCredits.toFixed(2)}`);
    console.log("✓ Calculation completed\n");
  } else {
    console.log("⚠ No tiered plan found in data\n");
  }

  // Find a bill credit plan
  const billCreditPlan = plans.find((p) => 
    p.pricing.some((r) => r.type === "BILL_CREDIT")
  );

  if (billCreditPlan) {
    console.log(`Testing bill credit plan: ${billCreditPlan.name} (${billCreditPlan.id})`);
    
    // Test with monthly breakdown where some months qualify for credit
    const monthlyKWh = [600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700];
    const totalKWh = monthlyKWh.reduce((sum, val) => sum + val, 0);

    console.log(`Total annual usage: ${totalKWh} kWh`);
    console.log(`Monthly breakdown: ${monthlyKWh.join(", ")} kWh`);

    const result = calculatePlanCost(billCreditPlan, totalKWh, monthlyKWh);
    console.log(`Annual cost: $${result.annualCost.toFixed(2)}`);
    console.log(`Monthly average: $${result.monthlyCost.toFixed(2)}`);
    console.log(`Energy cost: $${result.breakdown.energyCost.toFixed(2)}`);
    console.log(`TDU charges: $${result.breakdown.tduCharges.toFixed(2)}`);
    console.log(`Bill credits: $${result.breakdown.billCredits.toFixed(2)}`);
    console.log("✓ Calculation completed\n");
  } else {
    console.log("⚠ No bill credit plan found in data\n");
  }
}

// Test with sample CSV data patterns
function testWithSamplePatterns() {
  console.log("\n=== Testing with Sample Usage Patterns ===\n");

  const plans = simplePlans as EnergyPlan[];

  // Pattern 1: Low usage (typical for small household)
  const lowUsageMonthly = [300, 320, 350, 380, 400, 450, 500, 480, 420, 380, 350, 330];
  const lowUsageTotal = lowUsageMonthly.reduce((sum, val) => sum + val, 0);

  // Pattern 2: Medium usage (typical family)
  const mediumUsageMonthly = [600, 650, 700, 750, 800, 900, 1000, 950, 850, 750, 700, 650];
  const mediumUsageTotal = mediumUsageMonthly.reduce((sum, val) => sum + val, 0);

  // Pattern 3: High usage (large household)
  const highUsageMonthly = [1200, 1300, 1400, 1500, 1600, 1800, 2000, 1900, 1700, 1500, 1400, 1300];
  const highUsageTotal = highUsageMonthly.reduce((sum, val) => sum + val, 0);

  const tieredPlan = plans.find((p) => 
    p.pricing.some((r) => r.type === "TIERED")
  );

  if (tieredPlan) {
    console.log(`Testing ${tieredPlan.name} with different usage patterns:\n`);

    [lowUsageMonthly, mediumUsageMonthly, highUsageMonthly].forEach((pattern, index) => {
      const total = pattern.reduce((sum, val) => sum + val, 0);
      const patternName = ["Low", "Medium", "High"][index];
      console.log(`${patternName} usage pattern (${total} kWh/year):`);
      const result = calculatePlanCost(tieredPlan, total, pattern);
      console.log(`  Annual cost: $${result.annualCost.toFixed(2)}`);
      console.log(`  Monthly average: $${result.monthlyCost.toFixed(2)}`);
      console.log(`  Energy cost: $${result.breakdown.energyCost.toFixed(2)}`);
      console.log("");
    });
  }
}

// Main test runner
function main() {
  console.log("=".repeat(60));
  console.log("Plan Calculation Test Suite");
  console.log("=".repeat(60));

  try {
    testTieredPricing();
    testBillCredits();
    testPlanCalculations();
    testWithSamplePatterns();

    console.log("=".repeat(60));
    console.log("All tests completed!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ Test failed with error:", error);
    process.exit(1);
  }
}

main();

