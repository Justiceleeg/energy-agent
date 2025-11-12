"use client";

import { useState, useMemo, useEffect } from "react";
import { PlanWithCost } from "@/lib/calculations/planRanking";
import { PlanCard } from "./PlanCard";
import { Button } from "@/components/ui/button";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { ArrowUpDown, ArrowUp, ArrowDown, Leaf, Filter, X } from "lucide-react";
import { getPlanComplexity } from "@/lib/utils/planComplexity";

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
  const [showFilters, setShowFilters] = useState(false);
  const [complexityFilters, setComplexityFilters] = useState<Set<"simple" | "medium" | "complex">>(new Set(["simple", "medium"]));
  const [renewableRange, setRenewableRange] = useState<[number, number]>([0, 100]);
  const [contractLengthFilters, setContractLengthFilters] = useState<Set<number>>(new Set([6, 12, 24]));
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  // Calculate price range from plans
  const calculatedPriceRange = useMemo(() => {
    if (plans.length === 0) return [0, 0];
    const costs = plans.map((p) => p.cost.annualCost);
    return [Math.min(...costs), Math.max(...costs)];
  }, [plans]);

  // Initialize price range when plans change
  useEffect(() => {
    if (priceRange[0] === 0 && priceRange[1] === 0 && calculatedPriceRange[1] > 0) {
      setPriceRange([calculatedPriceRange[0], calculatedPriceRange[1]]);
    }
  }, [calculatedPriceRange, priceRange]);

  // Filter plans
  const filteredPlans = useMemo(() => {
    return plans.filter((item) => {
      const complexity = getPlanComplexity(item.plan);
      
      // Complexity filter
      if (!complexityFilters.has(complexity)) {
        return false;
      }

      // Renewable percentage filter
      if (item.plan.renewablePercent < renewableRange[0] || item.plan.renewablePercent > renewableRange[1]) {
        return false;
      }

      // Contract length filter
      if (!contractLengthFilters.has(item.plan.contractLength)) {
        return false;
      }

      // Price range filter
      if (item.cost.annualCost < priceRange[0] || item.cost.annualCost > priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [plans, complexityFilters, renewableRange, contractLengthFilters, priceRange]);

  // Sort filtered plans
  const sortedPlans = useMemo(() => {
    const sorted = [...filteredPlans];
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
  }, [filteredPlans, sortBy]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (complexityFilters.size < 2) count++;
    if (renewableRange[0] > 0 || renewableRange[1] < 100) count++;
    if (contractLengthFilters.size < 3) count++;
    if (priceRange[0] > calculatedPriceRange[0] || priceRange[1] < calculatedPriceRange[1]) count++;
    return count;
  }, [complexityFilters, renewableRange, contractLengthFilters, priceRange, calculatedPriceRange]);

  const clearFilters = () => {
    setComplexityFilters(new Set(["simple", "medium"]));
    setRenewableRange([0, 100]);
    setContractLengthFilters(new Set([6, 12, 24]));
    setPriceRange([calculatedPriceRange[0], calculatedPriceRange[1]]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">All Plans</h2>
          <p className="text-muted-foreground hidden md:block">
            {sortedPlans.length} of {plans.length} plans shown
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-accent" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
                {activeFilterCount}
              </span>
            )}
          </Button>
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
      {showFilters && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Complexity Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Complexity</label>
              <div className="space-y-2">
                {(["simple", "medium"] as const).map((complexity) => (
                  <label key={complexity} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={complexityFilters.has(complexity)}
                      onChange={(e) => {
                        const newSet = new Set(complexityFilters);
                        if (e.target.checked) {
                          newSet.add(complexity);
                        } else {
                          newSet.delete(complexity);
                        }
                        setComplexityFilters(newSet);
                      }}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{complexity}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Renewable Percentage Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Renewable
              </label>
              <DualRangeSlider
                min={0}
                max={100}
                step={1}
                value={renewableRange}
                onValueChange={(values) => setRenewableRange([values[0], values[1]])}
                label={(value) => `${value}%`}
                labelPosition="bottom"
              />
            </div>
            {/* Contract Length Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Contract Length</label>
              <div className="space-y-2">
                {[6, 12, 24].map((length) => (
                  <label key={length} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contractLengthFilters.has(length)}
                      onChange={(e) => {
                        const newSet = new Set(contractLengthFilters);
                        if (e.target.checked) {
                          newSet.add(length);
                        } else {
                          newSet.delete(length);
                        }
                        setContractLengthFilters(newSet);
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{length} months</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Price Range Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Price
              </label>
              <DualRangeSlider
                min={calculatedPriceRange[0]}
                max={calculatedPriceRange[1]}
                step={10}
                value={priceRange}
                onValueChange={(values) => setPriceRange([values[0], values[1]])}
                label={(value) => `$${Math.round(value ?? 0)}`}
                labelPosition="bottom"
              />
            </div>
          </div>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 md:auto-rows-fr">
        {sortedPlans.map((item) => (
          <PlanCard
            key={item.plan.id}
            plan={item.plan}
            cost={item.cost}
            isCheapest={topThreeIds[0] === item.plan.id}
            savings={item.savings}
            isSelected={selectedPlanIds.includes(item.plan.id)}
            onSelect={onPlanSelect}
            isSelectionDisabled={selectedPlanIds.length >= 3 && !selectedPlanIds.includes(item.plan.id)}
            selectionCount={selectedPlanIds.length}
          />
        ))}
      </div>
    </div>
  );
}

