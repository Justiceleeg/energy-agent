import { HourlyUsageData, UsageStatistics } from "@/lib/types/usage";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Calculates usage statistics from hourly usage data
 */
export function calculateUsageStatistics(data: HourlyUsageData[]): UsageStatistics {
  if (data.length === 0) {
    throw new Error("Cannot calculate statistics from empty data");
  }
  
  // Calculate total annual kWh
  const totalAnnualKWh = data.reduce((sum, entry) => sum + entry.kWh, 0);
  
  // Calculate average daily kWh (total / 365)
  const averageDailyKWh = totalAnnualKWh / 365;
  
  // Find peak usage hour
  let peakUsageHour = data[0];
  for (const entry of data) {
    if (entry.kWh > peakUsageHour.kWh) {
      peakUsageHour = entry;
    }
  }
  
  // Calculate monthly breakdown
  const monthlyTotals = new Map<number, number>();
  
  for (const entry of data) {
    const month = entry.date.getMonth();
    const currentTotal = monthlyTotals.get(month) || 0;
    monthlyTotals.set(month, currentTotal + entry.kWh);
  }
  
  const monthlyBreakdown = Array.from(monthlyTotals.entries())
    .map(([month, totalKWh]) => ({
      month,
      monthName: MONTH_NAMES[month],
      totalKWh
    }))
    .sort((a, b) => a.month - b.month);
  
  // Find min and max monthly usage
  const monthlyValues = monthlyBreakdown.map(m => m.totalKWh);
  const minMonthlyKWh = Math.min(...monthlyValues);
  const maxMonthlyKWh = Math.max(...monthlyValues);
  
  return {
    totalAnnualKWh,
    averageDailyKWh,
    peakUsageHour: {
      date: peakUsageHour.date,
      kWh: peakUsageHour.kWh
    },
    minMonthlyKWh,
    maxMonthlyKWh,
    monthlyBreakdown
  };
}

