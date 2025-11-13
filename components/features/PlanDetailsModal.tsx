"use client";

import { EnergyPlan, TimeOfUsePricing, SeasonalPricing } from "@/lib/types/plans";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Calendar, Clock, TrendingUp, TrendingDown, Info } from "lucide-react";

interface PlanDetailsModalProps {
  plan: EnergyPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function PlanDetailsModal({ plan, open, onOpenChange }: PlanDetailsModalProps) {
  const touRule = plan.pricing.find((rule) => rule.type === "TIME_OF_USE") as TimeOfUsePricing | undefined;
  const seasonalRules = plan.pricing.filter((rule) => rule.type === "SEASONAL") as SeasonalPricing[];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(value);
  };

  /**
   * Format hour ranges, handling midnight wraparound
   * @param hours Array of hours (0-23)
   * @returns Formatted string like "22:00-6:00" or "10pm-6am"
   */
  const formatHourRange = (hours: number[]): string => {
    if (hours.length === 24) {
      return "All hours";
    }
    if (hours.length === 1) {
      return `${hours[0]}:00`;
    }

    // Sort hours
    const sorted = [...hours].sort((a, b) => a - b);
    
    // Check if hours are continuous
    let isContinuous = true;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] !== sorted[i - 1] + 1) {
        isContinuous = false;
        break;
      }
    }

    if (isContinuous) {
      // Simple continuous range
      const endHour = (sorted[sorted.length - 1] + 1) % 24;
      return `${sorted[0]}:00-${endHour}:00`;
    }

    // Check for midnight wraparound (e.g., [22, 23, 0, 1, 2, 3, 4, 5])
    // This happens when we have hours at the end of day AND start of day
    const hasLateHours = sorted.some(h => h >= 20);
    const hasEarlyHours = sorted.some(h => h <= 5);
    
    if (hasLateHours && hasEarlyHours) {
      // Find the gap - this indicates where the range breaks
      let gapStart = -1;
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] !== sorted[i - 1] + 1) {
          gapStart = i;
          break;
        }
      }

      if (gapStart !== -1) {
        // Range wraps around midnight
        const start = sorted[gapStart]; // First hour after the gap
        const end = sorted[gapStart - 1]; // Last hour before the gap
        const endPlusOne = (end + 1) % 24;
        return `${start}:00-${endPlusOne}:00`;
      }
    }

    // For non-continuous ranges, show first-last with note
    const endHour = (sorted[sorted.length - 1] + 1) % 24;
    return `${sorted[0]}:00-${endHour}:00`;
  };

  const getTouScheduleSummary = () => {
    if (!touRule) return null;

    const schedules = touRule.schedule;
    const summaries: string[] = [];

    for (const schedule of schedules) {
      const days = schedule.days.sort((a, b) => a - b);
      
      // Format hours using the helper function
      const hourRange = formatHourRange(schedule.hours);

      // Format days
      let dayRange = "";
      if (days.length === 7) {
        dayRange = "Every day";
      } else if (days.length === 1) {
        dayRange = DAY_NAMES[days[0]];
      } else {
        dayRange = days.map((d) => DAY_NAMES[d].substring(0, 3)).join(", ");
      }

      const rate = schedule.ratePerKwh === 0 ? "FREE" : formatCurrency(schedule.ratePerKwh);
      summaries.push(`${hourRange} on ${dayRange}: ${rate}/kWh`);
    }

    return summaries;
  };

  const getBestTimesForTou = () => {
    if (!touRule) return null;

    const freePeriods = touRule.schedule.filter((s) => s.ratePerKwh === 0);
    const lowRatePeriods = touRule.schedule
      .filter((s) => s.ratePerKwh > 0)
      .sort((a, b) => a.ratePerKwh - b.ratePerKwh);

    const tips: string[] = [];

    if (freePeriods.length > 0) {
      tips.push("Best time: Use energy during FREE periods to maximize savings.");
      freePeriods.forEach((period) => {
        const days = period.days.sort((a, b) => a - b);
        const hourRange = formatHourRange(period.hours);
        const dayRange = days.length === 7 
          ? "every day" 
          : days.map((d) => DAY_NAMES[d].substring(0, 3)).join(", ");
        tips.push(`  • Free energy: ${hourRange} on ${dayRange}`);
      });
    }

    if (lowRatePeriods.length > 0 && lowRatePeriods[0].ratePerKwh > 0) {
      const lowest = lowRatePeriods[0];
      const days = lowest.days.sort((a, b) => a - b);
      const hourRange = formatHourRange(lowest.hours);
      const dayRange = days.length === 7 
        ? "every day" 
        : days.map((d) => DAY_NAMES[d].substring(0, 3)).join(", ");
      tips.push(`  • Lowest rate: ${hourRange} on ${dayRange} (${formatCurrency(lowest.ratePerKwh)}/kWh)`);
    }

    return tips;
  };

  const getSeasonalSummary = () => {
    if (seasonalRules.length === 0) return null;

    const summaries: { months: number[]; modifier: number; description: string }[] = [];

    for (const rule of seasonalRules) {
      const modifier = rule.rateModifier;
      let description = "";
      if (modifier > 1) {
        const percent = ((modifier - 1) * 100).toFixed(0);
        description = `${percent}% higher`;
      } else if (modifier < 1) {
        const percent = ((1 - modifier) * 100).toFixed(0);
        description = `${percent}% lower`;
      } else {
        description = "Same rate";
      }

      summaries.push({
        months: rule.months,
        modifier,
        description,
      });
    }

    return summaries;
  };

  const getSeasonalTips = () => {
    if (seasonalRules.length === 0) return null;

    const tips: string[] = [];
    const premiumMonths: number[] = [];
    const discountMonths: number[] = [];

    for (const rule of seasonalRules) {
      if (rule.rateModifier > 1) {
        premiumMonths.push(...rule.months);
      } else if (rule.rateModifier < 1) {
        discountMonths.push(...rule.months);
      }
    }

    if (premiumMonths.length > 0) {
      const monthNames = [...new Set(premiumMonths)]
        .sort((a, b) => a - b)
        .map((m) => MONTH_NAMES[m - 1]);
      tips.push(`Higher rates in: ${monthNames.join(", ")}`);
      tips.push("  • Consider reducing usage during these months");
      tips.push("  • Use energy-efficient appliances and practices");
    }

    if (discountMonths.length > 0) {
      const monthNames = [...new Set(discountMonths)]
        .sort((a, b) => a - b)
        .map((m) => MONTH_NAMES[m - 1]);
      tips.push(`Lower rates in: ${monthNames.join(", ")}`);
      tips.push("  • Great time for energy-intensive activities");
    }

    return tips;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>{plan.name}</DialogTitle>
          <DialogDescription>{plan.provider}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plan Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                <span>{plan.renewablePercent}% renewable energy</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{plan.contractLength} month contract</span>
              </div>
              {plan.baseCharge && plan.baseCharge > 0 && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Base charge:</span>
                  <span>${plan.baseCharge.toFixed(2)}/month</span>
                </div>
              )}
              {plan.description && (
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              )}
            </CardContent>
          </Card>

          {/* TOU Schedule */}
          {touRule && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time-of-Use Schedule
                </CardTitle>
                <CardDescription>
                  Rates vary by time of day and day of week
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {getTouScheduleSummary()?.map((summary, index) => (
                    <div key={index} className="text-sm p-2 bg-zinc-50 dark:bg-zinc-800 rounded">
                      {summary}
                    </div>
                  ))}
                </div>

                {/* Usage Optimization Tips for TOU */}
                {getBestTimesForTou() && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          Best Times to Use Energy
                        </h4>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                          {getBestTimesForTou()?.map((tip, index) => (
                            <li key={index}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Seasonal Rates */}
          {seasonalRules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Seasonal Rate Modifiers
                </CardTitle>
                <CardDescription>
                  Rates change during specific months
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {MONTH_NAMES.map((month, index) => {
                    const monthNumber = index + 1;
                    const seasonalRule = seasonalRules.find((r) => r.months.includes(monthNumber));
                    const modifier = seasonalRule?.rateModifier || 1;
                    const isPremium = modifier > 1;
                    const isDiscount = modifier < 1;

                    return (
                      <div
                        key={index}
                        className={`p-2 rounded text-center text-sm ${
                          isPremium
                            ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                            : isDiscount
                              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                              : "bg-zinc-50 dark:bg-zinc-800"
                        }`}
                      >
                        <div className="font-medium">{month.substring(0, 3)}</div>
                        {seasonalRule && (
                          <div className="text-xs mt-1 flex items-center justify-center gap-1">
                            {isPremium ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : isDiscount ? (
                              <TrendingDown className="h-3 w-3" />
                            ) : null}
                            {isPremium
                              ? `+${((modifier - 1) * 100).toFixed(0)}%`
                              : isDiscount
                                ? `-${((1 - modifier) * 100).toFixed(0)}%`
                                : "Standard"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Usage Optimization Tips for Seasonal */}
                {getSeasonalTips() && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          Seasonal Usage Tips
                        </h4>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                          {getSeasonalTips()?.map((tip, index) => (
                            <li key={index}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Other Pricing Rules */}
          {plan.pricing.some(
            (rule) =>
              rule.type !== "TIME_OF_USE" &&
              rule.type !== "SEASONAL" &&
              rule.type !== "BASE_CHARGE"
          ) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pricing Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {plan.pricing.map((rule, index) => {
                    if (rule.type === "TIME_OF_USE" || rule.type === "SEASONAL" || rule.type === "BASE_CHARGE") {
                      return null;
                    }

                    if (rule.type === "FLAT_RATE") {
                      return (
                        <div key={index}>
                          <span className="font-medium">Flat rate:</span>{" "}
                          {formatCurrency(rule.pricePerKWh)}/kWh
                        </div>
                      );
                    }

                    if (rule.type === "TIERED") {
                      return (
                        <div key={index} className="space-y-1">
                          <div className="font-medium">Tiered pricing:</div>
                          {rule.tiers.map((tier, tierIndex) => (
                            <div key={tierIndex} className="ml-4 text-xs">
                              {tier.maxKwh === null
                                ? `Above ${rule.tiers[tierIndex - 1]?.maxKwh || 0} kWh: ${formatCurrency(tier.ratePerKwh)}/kWh`
                                : `Up to ${tier.maxKwh} kWh: ${formatCurrency(tier.ratePerKwh)}/kWh`}
                            </div>
                          ))}
                        </div>
                      );
                    }

                    if (rule.type === "BILL_CREDIT") {
                      const maxText = rule.maxKwh === null ? "unlimited" : `${rule.maxKwh}`;
                      return (
                        <div key={index}>
                          <span className="font-medium">Bill credit:</span> ${rule.amount.toFixed(2)} for usage
                          between {rule.minKwh}-{maxText} kWh/month
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

