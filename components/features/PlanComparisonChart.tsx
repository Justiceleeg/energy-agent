"use client";

import { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { EnergyPlan } from "@/lib/types/plans";
import { MonthlyCostBreakdown } from "@/lib/calculations/monthlyBreakdown";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, LineChart as LineChartIcon, X } from "lucide-react";

interface PlanComparisonChartProps {
  selectedPlans: EnergyPlan[];
  monthlyBreakdowns: Map<string, MonthlyCostBreakdown[]>;
  onClearSelection: () => void;
}

// Colors for up to 3 plans
const PLAN_COLORS = ["#3b82f6", "#10b981", "#f59e0b"]; // blue, green, amber

export function PlanComparisonChart({
  selectedPlans,
  monthlyBreakdowns,
  onClearSelection,
}: PlanComparisonChartProps) {
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (selectedPlans.length === 0) {
      return [];
    }

    // Get all months (assuming all plans have the same months)
    const firstPlanId = selectedPlans[0].id;
    const firstBreakdown = monthlyBreakdowns.get(firstPlanId);
    if (!firstBreakdown) {
      return [];
    }

    // Create data points for each month
    return firstBreakdown.map((monthData) => {
      const dataPoint: Record<string, string | number> = {
        month: monthData.monthName.substring(0, 3), // Short month name (Jan, Feb, etc.)
        fullMonth: monthData.monthName,
      };

      // Add cost for each selected plan
      selectedPlans.forEach((plan) => {
        const breakdown = monthlyBreakdowns.get(plan.id);
        if (breakdown) {
          const monthCost = breakdown.find((m) => m.month === monthData.month);
          if (monthCost) {
            dataPoint[plan.name] = Math.round(monthCost.cost * 100) / 100; // Round to 2 decimals
          }
        }
      });

      return dataPoint;
    });
  }, [selectedPlans, monthlyBreakdowns]);

  // Calculate annual totals for each plan
  const annualTotals = useMemo(() => {
    const totals: Map<string, number> = new Map();

    selectedPlans.forEach((plan) => {
      const breakdown = monthlyBreakdowns.get(plan.id);
      if (breakdown) {
        const total = breakdown.reduce((sum, month) => sum + month.cost, 0);
        totals.set(plan.id, total);
      }
    });

    return totals;
  }, [selectedPlans, monthlyBreakdowns]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyPrecise = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (selectedPlans.length === 0) {
    return null;
  }

  const ChartComponent = chartType === "line" ? LineChart : BarChart;
  const DataComponent = chartType === "line" ? Line : Bar;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Plan Comparison</CardTitle>
            <CardDescription>
              Monthly cost breakdown for selected plans
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChartType(chartType === "line" ? "bar" : "line")}
              title={chartType === "line" ? "Switch to bar chart" : "Switch to line chart"}
            >
              {chartType === "line" ? (
                <BarChart3 className="h-4 w-4 mr-2" />
              ) : (
                <LineChartIcon className="h-4 w-4 mr-2" />
              )}
              {chartType === "line" ? "Bar" : "Line"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              title="Clear selection"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Selection
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Annual totals header */}
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="text-sm font-semibold mb-2">Annual Totals</div>
          <div className="grid gap-2 md:grid-cols-3">
            {selectedPlans.map((plan, index) => {
              const total = annualTotals.get(plan.id) || 0;
              return (
                <div key={plan.id} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PLAN_COLORS[index] }}
                  />
                  <span className="text-sm font-medium">{plan.name}:</span>
                  <span className="text-sm font-semibold">{formatCurrency(total)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart */}
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                label={{ value: "Month", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{ value: "Cost ($)", angle: -90, position: "insideLeft" }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrencyPrecise(value),
                  name,
                ]}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              {!isMobile && (
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={(value) => value}
                />
              )}
              {selectedPlans.map((plan, index) => (
                <DataComponent
                  key={plan.id}
                  type="monotone"
                  dataKey={plan.name}
                  stroke={PLAN_COLORS[index]}
                  fill={PLAN_COLORS[index]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name={plan.name}
                />
              ))}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

