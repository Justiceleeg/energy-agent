"use client";

import { UsageStatistics } from "@/lib/types/usage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface UsageInsightsProps {
  statistics: UsageStatistics;
}

export function UsageInsights({ statistics }: UsageInsightsProps) {
  const formatKWh = (value: number) => {
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh`;
  };

  const formatDate = (date: Date) => {
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  // Calculate Y-axis domain and formatter based on data range
  const monthlyValues = statistics.monthlyBreakdown.map((m) => m.totalKWh);
  const minValue = Math.min(...monthlyValues);
  const maxValue = Math.max(...monthlyValues);
  const range = maxValue - minValue;
  
  // Determine appropriate Y-axis formatter based on data range
  const formatYAxisTick = (value: number): string => {
    // Round to nearest integer for display
    const rounded = Math.round(value);
    
    if (rounded >= 1000) {
      // For values >= 1000, show in thousands with 1 decimal if needed
      const thousands = rounded / 1000;
      if (thousands % 1 === 0) {
        return `${thousands.toFixed(0)}k`;
      }
      return `${thousands.toFixed(1)}k`;
    } else {
      // For values < 1000, show actual number
      return rounded.toLocaleString();
    }
  };

  // Set domain with some padding (10% above max, 10% below min, but at least 0)
  // Use "nice" numbers for better tick spacing
  const padding = range * 0.1;
  let domainMin = Math.max(0, minValue - padding);
  let domainMax = maxValue + padding;
  
  // Round domain to nice numbers for better tick spacing
  const roundToNice = (value: number, roundUp: boolean): number => {
    const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
    const normalized = value / magnitude;
    let nice: number;
    
    if (normalized <= 1) nice = 1;
    else if (normalized <= 2) nice = 2;
    else if (normalized <= 5) nice = 5;
    else nice = 10;
    
    const result = nice * magnitude;
    return roundUp ? Math.ceil(value / result) * result : Math.floor(value / result) * result;
  };
  
  domainMin = roundToNice(domainMin, false);
  domainMax = roundToNice(domainMax, true);

  return (
    <div className="space-y-6">
      {/* Key Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Annual Consumption</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {formatKWh(statistics.totalAnnualKWh)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Daily Usage</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {formatKWh(statistics.averageDailyKWh)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Peak Usage Hour</CardDescription>
            <CardTitle className="text-lg font-semibold">
              {formatKWh(statistics.peakUsageHour.kWh)}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {formatDate(statistics.peakUsageHour.date)}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monthly Range</CardDescription>
            <CardTitle className="text-lg font-semibold">
              {formatKWh(statistics.minMonthlyKWh)} - {formatKWh(statistics.maxMonthlyKWh)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Monthly Consumption Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Consumption Breakdown</CardTitle>
          <CardDescription>
            Total energy consumption by month throughout the year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={statistics.monthlyBreakdown}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="monthName"
                tick={{ fill: "currentColor" }}
                className="text-xs"
              />
              <YAxis
                domain={[domainMin, domainMax]}
                tick={{ fill: "currentColor" }}
                className="text-xs"
                tickFormatter={formatYAxisTick}
                tickCount={6}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [formatKWh(value), "Consumption"]}
              />
              <Bar
                dataKey="totalKWh"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

