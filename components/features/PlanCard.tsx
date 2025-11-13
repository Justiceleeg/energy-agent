"use client";

import { useState } from "react";
import { EnergyPlan, PlanCostResult, TimeOfUsePricing, SeasonalPricing } from "@/lib/types/plans";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Leaf, Calendar, Info, Eye } from "lucide-react";
import { getPlanComplexity, getComplexityLabel } from "@/lib/utils/planComplexity";
import { PlanDetailsModal } from "./PlanDetailsModal";

interface PlanCardProps {
  plan: EnergyPlan;
  cost: PlanCostResult;
  isCheapest?: boolean;
  savings?: number;
  isSelected?: boolean;
  onSelect?: (planId: string) => void;
  isSelectionDisabled?: boolean;
  selectionCount?: number;
}

export function PlanCard({
  plan,
  cost,
  isCheapest = false,
  savings,
  isSelected = false,
  onSelect,
  isSelectionDisabled = false,
  selectionCount,
}: PlanCardProps) {
  const [showDetails, setShowDetails] = useState(false);

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

  const handleSelect = () => {
    if (onSelect) {
      onSelect(plan.id);
    }
  };

  const complexity = getPlanComplexity(plan);
  const complexityLabel = getComplexityLabel(complexity);

  // Get tooltip text for tiered, bill credit, TOU, or seasonal plans
  const getTooltipText = (): string | null => {
    const tieredRule = plan.pricing.find((rule) => rule.type === "TIERED");
    const billCreditRule = plan.pricing.find((rule) => rule.type === "BILL_CREDIT");
    const touRule = plan.pricing.find((rule) => rule.type === "TIME_OF_USE") as TimeOfUsePricing | undefined;
    const seasonalRules = plan.pricing.filter((rule) => rule.type === "SEASONAL") as SeasonalPricing[];

    if (touRule) {
      // Show TOU schedule summary
      const freePeriods = touRule.schedule.filter((s) => s.ratePerKwh === 0);
      const paidPeriods = touRule.schedule.filter((s) => s.ratePerKwh > 0);
      const summaries: string[] = [];
      
      if (freePeriods.length > 0) {
        summaries.push("Free energy periods available");
      }
      if (paidPeriods.length > 0) {
        const lowestRate = Math.min(...paidPeriods.map((p) => p.ratePerKwh));
        const highestRate = Math.max(...paidPeriods.map((p) => p.ratePerKwh));
        summaries.push(`Rates: ${(lowestRate * 100).toFixed(2)}¢-${(highestRate * 100).toFixed(2)}¢/kWh`);
      }
      
      return `Time-of-Use Pricing:\n${summaries.join("\n")}\n\nClick "View Details" for full schedule.`;
    }

    if (seasonalRules.length > 0) {
      const summaries: string[] = [];
      for (const rule of seasonalRules) {
        const monthNames = rule.months
          .sort((a, b) => a - b)
          .map((m) => {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return months[m - 1];
          })
          .join(", ");
        
        if (rule.rateModifier > 1) {
          const percent = ((rule.rateModifier - 1) * 100).toFixed(0);
          summaries.push(`${monthNames}: +${percent}% higher`);
        } else if (rule.rateModifier < 1) {
          const percent = ((1 - rule.rateModifier) * 100).toFixed(0);
          summaries.push(`${monthNames}: -${percent}% lower`);
        }
      }
      return `Seasonal Pricing:\n${summaries.join("\n")}\n\nClick "View Details" for full calendar.`;
    }

    if (tieredRule && tieredRule.type === "TIERED") {
      const tierDescriptions = tieredRule.tiers.map((tier, index) => {
        if (tier.maxKwh === null) {
          return `Above ${tieredRule.tiers[index - 1]?.maxKwh || 0} kWh: ${tier.ratePerKwh.toFixed(2)}¢/kWh`;
        }
        const prevMax = index === 0 ? 0 : tieredRule.tiers[index - 1]?.maxKwh || 0;
        if (index === 0) {
          return `First ${tier.maxKwh} kWh: ${tier.ratePerKwh.toFixed(2)}¢/kWh`;
        }
        return `Next ${tier.maxKwh - prevMax} kWh (${prevMax + 1}-${tier.maxKwh}): ${tier.ratePerKwh.toFixed(2)}¢/kWh`;
      });
      return `Tiered Pricing:\n${tierDescriptions.join("\n")}`;
    }

    if (billCreditRule && billCreditRule.type === "BILL_CREDIT") {
      const maxText = billCreditRule.maxKwh === null ? "unlimited" : `${billCreditRule.maxKwh}`;
      return `Bill Credit: $${billCreditRule.amount.toFixed(2)} credit for usage between ${billCreditRule.minKwh}-${maxText} kWh/month`;
    }

    // For medium complexity plans without tooltip text, show generic message
    if (complexity === "medium") {
      return "This plan uses tiered pricing or bill credits. Hover over the info icon for details.";
    }

    // For complex plans (TOU/seasonal), show generic message
    if (complexity === "complex") {
      return "This plan uses time-of-use or seasonal pricing. Click 'View Details' for full information.";
    }

    return null;
  };

  const tooltipText = getTooltipText();
  const hasComplexPricing = complexity === "complex";

  return (
    <Card
      className={
        isSelected
          ? "border-primary border-2 bg-primary/5"
          : isCheapest
            ? "border-primary border-2"
            : ""
      }
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl mb-1">
              {plan.name}
            </CardTitle>
            <CardDescription className="text-sm">{plan.provider}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            {isCheapest && (
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                Best Value
              </span>
            )}
            <div className="flex items-center gap-1">
              <TooltipProvider delayDuration={300}>
                {tooltipText ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded cursor-help ${
                          complexity === "simple"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            : complexity === "medium"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                              : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                        }`}
                      >
                        {complexityLabel}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="whitespace-pre-line text-sm max-w-xs">
                        {tooltipText}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      complexity === "simple"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : complexity === "medium"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                    }`}
                  >
                    {complexityLabel}
                  </span>
                )}
                {tooltipText && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="whitespace-pre-line text-sm max-w-xs">
                        {tooltipText}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
            </div>
            {selectionCount !== undefined && (
              <span className="text-xs text-muted-foreground">
                {selectionCount}/3 selected
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-3xl font-bold mb-1">{formatCurrency(cost.annualCost)}</div>
          <CardDescription>Annual cost</CardDescription>
        </div>
        <div>
          <div className="text-lg font-semibold">{formatCurrencyPrecise(cost.monthlyCost)}</div>
          <CardDescription>Monthly average</CardDescription>
        </div>
        {savings !== undefined && savings > 0 && !isCheapest && (
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">
            Save {formatCurrency(savings)} vs most expensive
          </div>
        )}
        {cost.breakdown.billCredits > 0 && (
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">
            Bill credits: {formatCurrency(cost.breakdown.billCredits)}/year
          </div>
        )}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Leaf className="h-4 w-4 text-green-600" />
            <span>{plan.renewablePercent}% renewable</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{plan.contractLength} months</span>
          </div>
        </div>
        {plan.description && (
          <CardDescription className="text-xs">{plan.description}</CardDescription>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {hasComplexPricing && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setShowDetails(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        )}
        <Button
          variant={isSelected ? "default" : "outline"}
          className="w-full"
          onClick={handleSelect}
          disabled={isSelectionDisabled && !isSelected}
        >
          {isSelected ? "Deselect" : "Select to Compare"}
        </Button>
      </CardFooter>
      <PlanDetailsModal
        plan={plan}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </Card>
  );
}

