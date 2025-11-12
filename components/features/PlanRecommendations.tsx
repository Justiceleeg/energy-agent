"use client";

import { PlanWithCost } from "@/lib/calculations/planRanking";
import { PlanRecommendation } from "@/lib/types/ai";
import { PlanCard } from "./PlanCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PlanRecommendationsProps {
  recommendations: PlanWithCost[];
  aiRecommendations?: PlanRecommendation[];
  isLoadingAI?: boolean;
  selectedPlanIds?: string[];
  onPlanSelect?: (planId: string) => void;
}

// Fallback labels if AI recommendations are not available
const FALLBACK_LABELS = [
  "Lowest cost",
  "Best value",
  "Most renewable",
];

export function PlanRecommendations({
  recommendations,
  aiRecommendations,
  isLoadingAI = false,
  selectedPlanIds = [],
  onPlanSelect,
}: PlanRecommendationsProps) {
  if (recommendations.length === 0) {
    return null;
  }

  // Helper to get AI recommendation for a plan
  const getAIRecommendation = (planId: string): PlanRecommendation | null => {
    return aiRecommendations?.find((rec) => rec.planId === planId) || null;
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-6 md:grid-cols-3 md:auto-rows-fr">
        {recommendations.map((item, index) => {
          const aiRec = getAIRecommendation(item.plan.id);
          const hasAIRecommendation = !!aiRec;
          const showLoading = isLoadingAI && !hasAIRecommendation;

          return (
            <div key={item.plan.id} className="relative flex flex-col">
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  {showLoading ? (
                    <>
                      <CardTitle className="text-sm font-semibold text-primary">
                        Analyzing...
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Generating personalized recommendation...
                      </CardDescription>
                    </>
                  ) : hasAIRecommendation ? (
                    <>
                      <CardTitle className="text-sm font-semibold text-primary mb-2">
                        {aiRec.explanation}
                      </CardTitle>
                      {item.savings !== undefined && item.savings > 0 && (
                        <CardDescription className="text-xs mb-2">
                          Save{" "}
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(item.savings)}{" "}
                          annually
                        </CardDescription>
                      )}
                      {aiRec.goodFor && aiRec.goodFor.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {aiRec.goodFor.map((badge, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <CardTitle className="text-sm font-semibold text-primary">
                        {FALLBACK_LABELS[index] || `Recommendation ${index + 1}`}
                      </CardTitle>
                      {item.savings !== undefined && item.savings > 0 && (
                        <CardDescription className="text-xs">
                          Save{" "}
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(item.savings)}{" "}
                          annually
                        </CardDescription>
                      )}
                    </>
                  )}
                </CardHeader>
                {(hasAIRecommendation && (aiRec.pros.length > 0 || aiRec.cons.length > 0)) && (
                  <CardContent className="pt-0 pb-4">
                    {aiRec.pros.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1.5">Pros</h4>
                        <ul className="text-xs space-y-1">
                          {aiRec.pros.map((pro, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                              <span className="text-muted-foreground">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {aiRec.cons.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1.5">Cons</h4>
                        <ul className="text-xs space-y-1">
                          {aiRec.cons.map((con, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                              <span className="text-muted-foreground">{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
              <div className="mt-2 flex-1 flex flex-col">
                <PlanCard
                  plan={item.plan}
                  cost={item.cost}
                  isCheapest={index === 0}
                  savings={item.savings}
                  isSelected={selectedPlanIds.includes(item.plan.id)}
                  onSelect={onPlanSelect}
                  isSelectionDisabled={selectedPlanIds.length >= 3 && !selectedPlanIds.includes(item.plan.id)}
                  selectionCount={selectedPlanIds.length}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

