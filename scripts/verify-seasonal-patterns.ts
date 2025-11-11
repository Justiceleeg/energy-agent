import { readFileSync } from "fs";
import { join } from "path";

function verifySeasonalPatterns(filename: string) {
  const filePath = join(process.cwd(), "public", "sample-csvs", filename);
  const content = readFileSync(filePath, "utf-8");
  const lines = content.trim().split("\n").slice(1); // Skip header
  
  const monthlyTotals = new Map<number, { total: number; count: number }>();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  for (const line of lines) {
    const [dateStr, kWhStr] = line.split(",");
    const date = new Date(dateStr);
    const month = date.getMonth();
    const kWh = parseFloat(kWhStr);
    
    const stat = monthlyTotals.get(month) || { total: 0, count: 0 };
    stat.total += kWh;
    stat.count += 1;
    monthlyTotals.set(month, stat);
  }
  
  console.log("\n=== " + filename + " - Monthly Totals ===");
  const monthlyAvgs: number[] = [];
  for (let month = 0; month < 12; month++) {
    const stat = monthlyTotals.get(month);
    if (stat) {
      const avg = stat.total / stat.count;
      monthlyAvgs.push(avg);
      const msg = monthNames[month] + ": " + avg.toFixed(2) + " kWh/hr avg, " + stat.total.toFixed(0) + " kWh total";
      console.log(msg);
    }
  }
  
  // Show seasonal variation
  const overallAvg = monthlyAvgs.reduce((a, b) => a + b, 0) / monthlyAvgs.length;
  console.log("\nOverall average: " + overallAvg.toFixed(2) + " kWh/hr");
  console.log("\nSeasonal variation (relative to average):");
  for (let month = 0; month < 12; month++) {
    const stat = monthlyTotals.get(month);
    if (stat) {
      const avg = stat.total / stat.count;
      const multiplier = avg / overallAvg;
      console.log(monthNames[month] + ": " + multiplier.toFixed(2) + "x");
    }
  }
}

verifySeasonalPatterns("typical-family.csv");
verifySeasonalPatterns("night-owl-user.csv");
verifySeasonalPatterns("solar-home-user.csv");
