"use client";

import { UsageStatistics } from "@/lib/types/usage";
import { UsageAnalysisInsights } from "@/lib/types/ai";
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
import { Clock, Calendar, Lightbulb, Loader2 } from "lucide-react";

interface UsageInsightsProps {
  statistics: UsageStatistics;
  aiInsights?: UsageAnalysisInsights | null;
  isLoadingAI?: boolean;
}

export function UsageInsights({ statistics, aiInsights, isLoadingAI }: UsageInsightsProps) {
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
          <div className="w-full h-[350px] min-h-[350px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minHeight={350} minWidth={0}>
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
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Section */}
      {(aiInsights || isLoadingAI) && (
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Usage Insights</CardTitle>
            <CardDescription>
              Personalized analysis of your energy consumption patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAI ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">Analyzing your usage patterns...</span>
              </div>
            ) : aiInsights ? (
              <div className="space-y-6">
                {/* Peak Times */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Peak Usage Times</h3>
                  </div>
                  <p className="text-muted-foreground">{aiInsights.peakTimes.description}</p>
                  {aiInsights.peakTimes.insights.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                      {aiInsights.peakTimes.insights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Seasonal Trends */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Seasonal Trends</h3>
                  </div>
                  <p className="text-muted-foreground">{aiInsights.seasonalTrends.description}</p>
                  {aiInsights.seasonalTrends.insights.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                      {aiInsights.seasonalTrends.insights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Weekday/Weekend Patterns (if available) */}
                {aiInsights.weekdayWeekendPatterns && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">Weekday vs Weekend Patterns</h3>
                    </div>
                    <p className="text-muted-foreground">
                      {aiInsights.weekdayWeekendPatterns.description}
                    </p>
                    {aiInsights.weekdayWeekendPatterns.insights.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                        {aiInsights.weekdayWeekendPatterns.insights.map((insight, index) => (
                          <li key={index}>{insight}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Recommendations */}
                {aiInsights.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">Actionable Recommendations</h3>
                    </div>
                    <div className="space-y-3">
                      {aiInsights.recommendations.map((rec, index) => (
                        <Card key={index} className="bg-accent/50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{rec.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

