import { writeFileSync } from "fs";
import { join } from "path";

// Seasonal multipliers based on real usage data analysis
// Multipliers relative to average (1.0 = average month)
// Based on analysis: Apr=1.01, May=0.99, Jun=1.03, Jul=1.13, Aug=1.15, Sep=1.11, Oct=1.07, Nov=0.51
// Estimated for missing months based on typical Texas patterns
const SEASONAL_MULTIPLIERS: number[] = [
  0.85, // Jan - winter, lower usage
  0.80, // Feb - winter, lower usage
  0.90, // Mar - spring, moderate
  1.01, // Apr - spring (from real data)
  0.99, // May - spring (from real data)
  1.03, // Jun - early summer (from real data)
  1.13, // Jul - peak summer (from real data)
  1.15, // Aug - peak summer (from real data)
  1.11, // Sep - late summer (from real data)
  1.07, // Oct - fall (from real data)
  0.85, // Nov - fall/winter (partial data showed 0.51, but likely incomplete - using conservative estimate)
  0.80, // Dec - winter, lower usage
];

// Hourly pattern multipliers based on real usage data
// Peak at 21:00 (2.32x), high afternoon/evening, low overnight
const HOURLY_PATTERN: number[] = [
  0.80, // 00:00 - 0.50 avg
  0.72, // 01:00 - 0.45 avg
  0.83, // 02:00 - 0.52 avg
  0.80, // 03:00 - 0.50 avg
  0.61, // 04:00 - 0.38 avg
  0.54, // 05:00 - 0.34 avg
  0.51, // 06:00 - 0.32 avg
  0.58, // 07:00 - 0.36 avg
  0.93, // 08:00 - 0.58 avg
  0.66, // 09:00 - 0.41 avg
  0.56, // 10:00 - 0.35 avg
  0.61, // 11:00 - 0.38 avg
  0.77, // 12:00 - 0.48 avg
  1.25, // 13:00 - 0.78 avg
  1.46, // 14:00 - 0.91 avg
  1.22, // 15:00 - 0.76 avg
  1.07, // 16:00 - 0.67 avg
  1.06, // 17:00 - 0.66 avg
  1.01, // 18:00 - 0.63 avg
  1.26, // 19:00 - 0.79 avg
  1.33, // 20:00 - 0.83 avg
  3.71, // 21:00 - 2.32 avg (PEAK)
  1.90, // 22:00 - 1.19 avg
  0.99, // 23:00 - 0.62 avg
];

// Base hourly usage (normalized to 1.0 average)
const BASE_HOURLY_AVG = 0.64; // Average from real data

// Generate date for each hour of the year (2024, a leap year)
function generateDates(): Date[] {
  const dates: Date[] = [];
  const startDate = new Date(2024, 0, 1, 0, 0, 0); // Jan 1, 2024, 00:00
  
  for (let i = 0; i < 8760; i++) {
    const date = new Date(startDate);
    date.setHours(date.getHours() + i);
    dates.push(date);
  }
  
  return dates;
}

// Night owl user: high evening usage (6 PM - 2 AM), scaled up from typical
function generateNightOwlUsage(date: Date): number {
  const hour = date.getHours();
  const baseUsage = 0.8; // Higher base for night owl
  
  // Boost evening/night hours (6 PM - 2 AM)
  let hourMultiplier = 1.0;
  if (hour >= 18 || hour < 2) {
    hourMultiplier = 1.8; // Much higher in evening/night
  } else if (hour >= 12 && hour < 18) {
    hourMultiplier = 0.9; // Lower in afternoon
  } else {
    hourMultiplier = 0.7; // Lower in morning
  }
  
  const seasonalMultiplier = SEASONAL_MULTIPLIERS[date.getMonth()];
  const variance = 0.2;
  const randomFactor = 1 + (Math.random() - 0.5) * variance * 2;
  
  return baseUsage * seasonalMultiplier * hourMultiplier * randomFactor;
}

// Solar home user: low daytime (solar panels), high evening
function generateSolarHomeUsage(date: Date): number {
  const hour = date.getHours();
  const month = date.getMonth();
  const baseUsage = 0.5;
  
  // Low usage during day (solar panels generating power) - 8 AM - 6 PM
  let hourMultiplier = 1.0;
  if (hour >= 8 && hour < 18) {
    // Even lower in summer months (more sun)
    const solarFactor = month >= 4 && month <= 8 ? 0.25 : 0.4;
    hourMultiplier = solarFactor;
  } else {
    // High usage in evening/night - 6 PM - 8 AM
    hourMultiplier = 1.5;
  }
  
  const seasonalMultiplier = SEASONAL_MULTIPLIERS[month];
  const variance = 0.18;
  const randomFactor = 1 + (Math.random() - 0.5) * variance * 2;
  
  return baseUsage * seasonalMultiplier * hourMultiplier * randomFactor;
}

// Typical family: standard 9-5 pattern with realistic hourly and seasonal patterns
function generateTypicalFamilyUsage(date: Date): number {
  const hour = date.getHours();
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const baseUsage = BASE_HOURLY_AVG;
  
  // Use realistic hourly pattern with weekend adjustments
  let hourMultiplier = HOURLY_PATTERN[hour];
  
  // Weekend adjustments: higher daytime usage on weekends
  if (isWeekend && hour >= 9 && hour < 17) {
    hourMultiplier *= 1.3; // 30% higher on weekends during day
  }
  
  const seasonalMultiplier = SEASONAL_MULTIPLIERS[date.getMonth()];
  const variance = 0.15;
  const randomFactor = 1 + (Math.random() - 0.5) * variance * 2;
  
  return baseUsage * seasonalMultiplier * hourMultiplier * randomFactor;
}

function generateCSV(
  filename: string,
  usageGenerator: (date: Date) => number
) {
  const dates = generateDates();
  const lines = ["date,kWh"];
  
  for (const date of dates) {
    const usage = usageGenerator(date);
    const dateStr = date.toISOString();
    lines.push(`${dateStr},${usage.toFixed(2)}`);
  }
  
  const csvContent = lines.join("\n");
  const filePath = join(process.cwd(), "public", "sample-csvs", filename);
  writeFileSync(filePath, csvContent, "utf-8");
  console.log(`Generated ${filename} with ${dates.length} rows`);
}

// Generate all sample files
generateCSV("night-owl-user.csv", generateNightOwlUsage);
generateCSV("solar-home-user.csv", generateSolarHomeUsage);
generateCSV("typical-family.csv", generateTypicalFamilyUsage);

console.log("All sample CSV files generated successfully!");

