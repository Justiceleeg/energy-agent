"use client";

import { PlanWithCost } from "@/lib/calculations/planRanking";
import { PlanCard } from "./PlanCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PlanRecommendationsProps {
  recommendations: PlanWithCost[];
}

const RECOMMENDATION_LABELS = [
  "Lowest cost",
  "Best value",
  "Most renewable",
];

export function PlanRecommendations({ recommendations }: PlanRecommendationsProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Top Recommendations</h2>
        <p className="text-muted-foreground">
          Our top 3 energy plans based on your usage
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {recommendations.map((item, index) => (
          <div key={item.plan.id} className="relative">
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-primary">
                  {RECOMMENDATION_LABELS[index] || `Recommendation ${index + 1}`}
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
              </CardHeader>
            </Card>
            <div className="mt-2">
              <PlanCard
                plan={item.plan}
                cost={item.cost}
                isCheapest={index === 0}
                savings={item.savings}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

