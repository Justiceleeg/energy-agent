"use client";

import { EnergyPlan, PlanCostResult } from "@/lib/types/plans";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Calendar, Check } from "lucide-react";

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
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl mb-1 flex items-center gap-2">
              {plan.name}
              {isSelected && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </CardTitle>
            <CardDescription className="text-sm">{plan.provider}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            {isCheapest && (
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                Best Value
              </span>
            )}
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
      <CardFooter>
        <Button
          variant={isSelected ? "default" : "outline"}
          className="w-full"
          onClick={handleSelect}
          disabled={isSelectionDisabled && !isSelected}
        >
          {isSelected ? "Deselect" : "Select to Compare"}
        </Button>
      </CardFooter>
    </Card>
  );
}

