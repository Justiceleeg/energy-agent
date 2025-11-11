"use client";

import { useState, useMemo } from "react";
import { PlanWithCost } from "@/lib/calculations/planRanking";
import { PlanCard } from "./PlanCard";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, Leaf } from "lucide-react";

type SortOption = "cost-asc" | "cost-desc" | "renewable-desc";

interface PlanGridProps {
  plans: PlanWithCost[];
  topThreeIds: string[];
  selectedPlanIds?: string[];
  onPlanSelect?: (planId: string) => void;
}

export function PlanGrid({
  plans,
  topThreeIds,
  selectedPlanIds = [],
  onPlanSelect,
}: PlanGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>("cost-asc");

  const sortedPlans = useMemo(() => {
    const sorted = [...plans];
    switch (sortBy) {
      case "cost-asc":
        sorted.sort((a, b) => a.cost.annualCost - b.cost.annualCost);
        break;
      case "cost-desc":
        sorted.sort((a, b) => b.cost.annualCost - a.cost.annualCost);
        break;
      case "renewable-desc":
        sorted.sort((a, b) => b.plan.renewablePercent - a.plan.renewablePercent);
        break;
    }
    return sorted;
  }, [plans, sortBy]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1">All Plans</h2>
          <p className="text-muted-foreground hidden md:block">
            Compare all available energy plans
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy("cost-asc")}
            className={sortBy === "cost-asc" ? "bg-accent" : ""}
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            Cost (Low)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy("cost-desc")}
            className={sortBy === "cost-desc" ? "bg-accent" : ""}
          >
            <ArrowDown className="h-4 w-4 mr-2" />
            Cost (High)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy("renewable-desc")}
            className={sortBy === "renewable-desc" ? "bg-accent" : ""}
          >
            <Leaf className="h-4 w-4 mr-2" />
            Renewable
          </Button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedPlans.map((item) => (
          <div
            key={item.plan.id}
            className={
              topThreeIds.includes(item.plan.id)
                ? "ring-2 ring-primary/30 rounded-xl p-1"
                : ""
            }
          >
            <PlanCard
              plan={item.plan}
              cost={item.cost}
              isCheapest={topThreeIds[0] === item.plan.id}
              savings={item.savings}
              isSelected={selectedPlanIds.includes(item.plan.id)}
              onSelect={onPlanSelect}
              isSelectionDisabled={selectedPlanIds.length >= 3 && !selectedPlanIds.includes(item.plan.id)}
              selectionCount={selectedPlanIds.length}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

