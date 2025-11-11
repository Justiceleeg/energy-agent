#!/usr/bin/env tsx

/**
 * Test script for AI usage analysis functionality
 * 
 * Usage:
 *   tsx scripts/test-ai-analysis.ts                    # Test direct function call
 *   tsx scripts/test-ai-analysis.ts --api             # Test API route (requires server running)
 *   tsx scripts/test-ai-analysis.ts --all              # Test both
 */

import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables from .env.local if it exists
try {
  const envPath = join(process.cwd(), ".env.local");
  const envFile = readFileSync(envPath, "utf-8");
  envFile.split("\n").forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
} catch (error) {
  // .env.local doesn't exist or can't be read, that's okay
}

import { analyzeUsagePatterns } from "../lib/ai/analyzeUsagePatterns";
import { UsageStatistics } from "../lib/types/usage";
import { UsageAnalysisInsights } from "../lib/types/ai";

// Sample usage statistics for testing
const createSampleStatistics = (): UsageStatistics => {
  const now = new Date();
  const monthlyBreakdown = [
    { month: 0, monthName: "January", totalKWh: 850 },
    { month: 1, monthName: "February", totalKWh: 800 },
    { month: 2, monthName: "March", totalKWh: 900 },
    { month: 3, monthName: "April", totalKWh: 950 },
    { month: 4, monthName: "May", totalKWh: 1100 },
    { month: 5, monthName: "June", totalKWh: 1200 },
    { month: 6, monthName: "July", totalKWh: 1300 },
    { month: 7, monthName: "August", totalKWh: 1350 },
    { month: 8, monthName: "September", totalKWh: 1250 },
    { month: 9, monthName: "October", totalKWh: 1000 },
    { month: 10, monthName: "November", totalKWh: 850 },
    { month: 11, monthName: "December", totalKWh: 800 },
  ];

  return {
    totalAnnualKWh: 12000,
    averageDailyKWh: 32.88,
    peakUsageHour: {
      date: new Date(now.getFullYear(), 6, 15, 21, 0, 0), // July 15 at 9 PM
      kWh: 2.5,
    },
    minMonthlyKWh: 800,
    maxMonthlyKWh: 1350,
    monthlyBreakdown,
  };
};

// Validate insights structure
function validateInsights(insights: UsageAnalysisInsights): boolean {
  console.log("Validating insights structure...");

  // Check required fields
  if (!insights.peakTimes || !insights.seasonalTrends || !insights.recommendations || !insights.metadata) {
    console.error("❌ Missing required fields");
    return false;
  }

  // Check peakTimes
  if (!insights.peakTimes.description || !Array.isArray(insights.peakTimes.insights)) {
    console.error("❌ Invalid peakTimes structure");
    return false;
  }

  // Check seasonalTrends
  if (!insights.seasonalTrends.description || !Array.isArray(insights.seasonalTrends.insights)) {
    console.error("❌ Invalid seasonalTrends structure");
    return false;
  }

  // Check recommendations
  if (!Array.isArray(insights.recommendations)) {
    console.error("❌ Invalid recommendations structure");
    return false;
  }

  for (const rec of insights.recommendations) {
    if (!rec.title || !rec.description) {
      console.error("❌ Invalid recommendation structure");
      return false;
    }
  }

  // Check metadata
  if (!insights.metadata.model || !insights.metadata.timestamp) {
    console.error("❌ Invalid metadata structure");
    return false;
  }

  console.log("✅ Insights structure is valid");
  return true;
}

// Test direct function call
async function testDirectFunction() {
  console.log("\n" + "=".repeat(60));
  console.log("Testing Direct Function Call");
  console.log("=".repeat(60));

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY environment variable is not set");
    console.log("   Set it with: export OPENAI_API_KEY='your-key-here'");
    return false;
  }

  const statistics = createSampleStatistics();
  console.log("\n📊 Sample Statistics:");
  console.log(`   Total Annual: ${statistics.totalAnnualKWh.toFixed(1)} kWh`);
  console.log(`   Average Daily: ${statistics.averageDailyKWh.toFixed(2)} kWh`);
  console.log(`   Peak Hour: ${statistics.peakUsageHour.kWh.toFixed(2)} kWh at ${statistics.peakUsageHour.date.toLocaleString()}`);
  console.log(`   Monthly Range: ${statistics.minMonthlyKWh} - ${statistics.maxMonthlyKWh} kWh`);

  try {
    console.log("\n🤖 Calling analyzeUsagePatterns()...");
    const startTime = Date.now();
    const insights = await analyzeUsagePatterns(statistics);
    const duration = Date.now() - startTime;

    console.log(`✅ Analysis completed in ${duration}ms\n`);

    // Validate structure
    if (!validateInsights(insights)) {
      return false;
    }

    // Display insights
    console.log("\n📋 AI Insights:");
    console.log("\n⏰ Peak Usage Times:");
    console.log(`   ${insights.peakTimes.description}`);
    insights.peakTimes.insights.forEach((insight) => {
      console.log(`   • ${insight}`);
    });

    console.log("\n📅 Seasonal Trends:");
    console.log(`   ${insights.seasonalTrends.description}`);
    insights.seasonalTrends.insights.forEach((insight) => {
      console.log(`   • ${insight}`);
    });

    if (insights.weekdayWeekendPatterns) {
      console.log("\n📆 Weekday/Weekend Patterns:");
      console.log(`   ${insights.weekdayWeekendPatterns.description}`);
      insights.weekdayWeekendPatterns.insights.forEach((insight) => {
        console.log(`   • ${insight}`);
      });
    }

    console.log("\n💡 Recommendations:");
    insights.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec.title}`);
      console.log(`      ${rec.description}`);
    });

    console.log("\n📊 Metadata:");
    console.log(`   Model: ${insights.metadata.model}`);
    console.log(`   Timestamp: ${insights.metadata.timestamp}`);

    return true;
  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : String(error));
    return false;
  }
}

// Test API route
async function testAPIRoute() {
  console.log("\n" + "=".repeat(60));
  console.log("Testing API Route");
  console.log("=".repeat(60));

  const baseUrl = process.env.TEST_API_URL || "http://localhost:3001";
  const apiUrl = `${baseUrl}/api/analyze`;

  console.log(`\n🌐 Testing API: ${apiUrl}`);

  const statistics = createSampleStatistics();

  try {
    console.log("\n📤 Sending POST request...");
    const startTime = Date.now();
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ statistics }),
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ API Error (${response.status}):`, data.error || data);
      return false;
    }

    console.log(`✅ API call completed in ${duration}ms\n`);

    // Validate structure
    const insights = data as UsageAnalysisInsights;
    if (!validateInsights(insights)) {
      return false;
    }

    // Display insights summary
    console.log("\n📋 AI Insights Summary:");
    console.log(`   Peak Times: ${insights.peakTimes.description.substring(0, 60)}...`);
    console.log(`   Seasonal Trends: ${insights.seasonalTrends.description.substring(0, 60)}...`);
    console.log(`   Recommendations: ${insights.recommendations.length} items`);
    console.log(`   Model: ${insights.metadata.model}`);

    return true;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.error("\n❌ Connection error: Is the server running?");
      console.log("   Start the server with: pnpm dev");
    } else {
      console.error("\n❌ Error:", error instanceof Error ? error.message : String(error));
    }
    return false;
  }
}

// Test error handling
async function testErrorHandling() {
  console.log("\n" + "=".repeat(60));
  console.log("Testing Error Handling");
  console.log("=".repeat(60));

  // Test with invalid statistics
  console.log("\n🧪 Test 1: Invalid statistics structure");
  try {
    const invalidStats = { invalid: "data" } as unknown as UsageStatistics;
    await analyzeUsagePatterns(invalidStats);
    console.error("❌ Should have thrown an error");
    return false;
  } catch (error) {
    console.log("✅ Correctly handled invalid statistics");
  }

  // Test with missing API key (if we can simulate it)
  console.log("\n🧪 Test 2: Missing API key");
  const originalKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    const stats = createSampleStatistics();
    await analyzeUsagePatterns(stats);
    console.error("❌ Should have thrown an error for missing API key");
    return false;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("OPENAI_API_KEY")) {
      console.log("✅ Correctly handled missing API key");
    } else {
      console.log(`⚠️  Unexpected error: ${errorMessage}`);
    }
  } finally {
    if (originalKey) {
      process.env.OPENAI_API_KEY = originalKey;
    }
  }

  return true;
}

// Main test runner
async function main() {
  const args = process.argv.slice(2);
  const testAll = args.includes("--all");
  const testAPI = args.includes("--api");
  const testDirect = args.includes("--direct") || (!testAPI && !testAll);

  console.log("🧪 AI Usage Analysis Test Suite");
  console.log("=".repeat(60));

  let allPassed = true;

  if (testDirect || testAll) {
    const passed = await testDirectFunction();
    allPassed = allPassed && passed;
  }

  if (testAPI || testAll) {
    const passed = await testAPIRoute();
    allPassed = allPassed && passed;
  }

  if (testAll) {
    const passed = await testErrorHandling();
    allPassed = allPassed && passed;
  }

  console.log("\n" + "=".repeat(60));
  if (allPassed) {
    console.log("✅ All tests passed!");
    process.exit(0);
  } else {
    console.log("❌ Some tests failed");
    process.exit(1);
  }
}

// Run tests
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

