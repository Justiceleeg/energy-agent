"use client";

import { useState, useMemo, useEffect } from "react";
import { Download } from "lucide-react";
import { CSVUpload } from "@/components/features/CSVUpload";
import { UsageInsights } from "@/components/features/UsageInsights";
import { PlanRecommendations } from "@/components/features/PlanRecommendations";
import { PlanGrid } from "@/components/features/PlanGrid";
import { PlanComparisonChart } from "@/components/features/PlanComparisonChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HourlyUsageData } from "@/lib/types/usage";
import { EnergyPlan } from "@/lib/types/plans";
import { UsageAnalysisInsights } from "@/lib/types/ai";
import { calculateUsageStatistics } from "@/lib/utils/usageStatistics";
import { rankPlansByCost, getTopRecommendations } from "@/lib/calculations/planRanking";
import { calculateMonthlyBreakdown, MonthlyCostBreakdown } from "@/lib/calculations/monthlyBreakdown";
import simplePlans from "@/data/plans/simple-plans.json";

const CACHE_KEY_PREFIX = "ai_insights_";

const SAMPLE_FILES = [
  { name: "Night Owl User", file: "night-owl-user.csv", description: "High evening usage pattern" },
  { name: "Solar Home User", file: "solar-home-user.csv", description: "Low daytime, high evening (solar panels)" },
  { name: "Typical Family", file: "typical-family.csv", description: "Standard 9-5 usage pattern" },
];

export default function Home() {
  const [usageData, setUsageData] = useState<HourlyUsageData[] | null>(null);
  const [statistics, setStatistics] = useState<ReturnType<typeof calculateUsageStatistics> | null>(null);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [aiInsights, setAiInsights] = useState<UsageAnalysisInsights | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const plans = simplePlans as EnergyPlan[];

  // Calculate plan costs and rankings when usage data is available
  const { rankedPlans, topRecommendations, topThreeIds } = useMemo(() => {
    if (!statistics) {
      return { rankedPlans: [], topRecommendations: [], topThreeIds: [] };
    }

    const ranked = rankPlansByCost(plans, statistics.totalAnnualKWh, statistics);
    const topThree = getTopRecommendations(plans, statistics.totalAnnualKWh, statistics);
    const topThreeIds = topThree.map((item) => item.plan.id);

    return {
      rankedPlans: ranked,
      topRecommendations: topThree,
      topThreeIds,
    };
  }, [statistics, plans]);

  // Default to top 3 recommendations when usage data is first available
  useEffect(() => {
    if (topThreeIds.length > 0 && selectedPlanIds.length === 0) {
      setSelectedPlanIds(topThreeIds);
    }
  }, [topThreeIds, selectedPlanIds.length]);

  // Calculate monthly breakdowns for selected plans when selection changes
  const monthlyBreakdowns = useMemo(() => {
    if (!usageData || !statistics || selectedPlanIds.length === 0) {
      return new Map<string, MonthlyCostBreakdown[]>();
    }

    const breakdowns = new Map<string, MonthlyCostBreakdown[]>();
    selectedPlanIds.forEach((planId) => {
      const plan = plans.find((p) => p.id === planId);
      if (plan) {
        const breakdown = calculateMonthlyBreakdown(plan, usageData, statistics);
        breakdowns.set(planId, breakdown);
      }
    });

    return breakdowns;
  }, [selectedPlanIds, usageData, statistics, plans]);

  // Get selected plans
  const selectedPlans = useMemo(() => {
    return plans.filter((plan) => selectedPlanIds.includes(plan.id));
  }, [selectedPlanIds, plans]);

  // Clear selection handler
  const handleClearSelection = () => {
    setSelectedPlanIds([]);
  };

  // Handle plan selection/deselection
  const handlePlanSelect = (planId: string) => {
    setSelectedPlanIds((current) => {
      if (current.includes(planId)) {
        // Remove plan from selection
        return current.filter((id) => id !== planId);
      } else {
        // Add plan to selection (max 3)
        if (current.length >= 3) {
          return current; // Don't add if already at max
        }
        return [...current, planId];
      }
    });
  };

  // Generate cache key from usage statistics
  const generateCacheKey = (stats: ReturnType<typeof calculateUsageStatistics>): string => {
    // Create a signature from total annual kWh and monthly breakdown
    const monthlySignature = stats.monthlyBreakdown
      .map((m) => `${m.month}:${m.totalKWh.toFixed(1)}`)
      .join(",");
    const signature = `${stats.totalAnnualKWh.toFixed(1)}_${monthlySignature}`;
    // Simple hash (for cache key, not cryptographic)
    return `${CACHE_KEY_PREFIX}${signature}`;
  };

  // Get cached insights from session storage
  const getCachedInsights = (cacheKey: string): UsageAnalysisInsights | null => {
    try {
      if (typeof window === "undefined" || !window.sessionStorage) {
        return null;
      }
      const cached = window.sessionStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached) as UsageAnalysisInsights;
      }
    } catch (error) {
      console.warn("Failed to read from session storage:", error);
    }
    return null;
  };

  // Store insights in session storage
  const setCachedInsights = (cacheKey: string, insights: UsageAnalysisInsights): void => {
    try {
      if (typeof window === "undefined" || !window.sessionStorage) {
        return;
      }
      window.sessionStorage.setItem(cacheKey, JSON.stringify(insights));
    } catch (error) {
      console.warn("Failed to write to session storage:", error);
    }
  };

  // Clear AI insights cache
  const clearAICache = (): void => {
    try {
      if (typeof window === "undefined" || !window.sessionStorage) {
        return;
      }
      // Clear all cache entries with our prefix
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key && key.startsWith(CACHE_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => window.sessionStorage.removeItem(key));
    } catch (error) {
      console.warn("Failed to clear session storage:", error);
    }
  };

  // Fetch AI insights from API
  const fetchAIInsights = async (stats: ReturnType<typeof calculateUsageStatistics>): Promise<void> => {
    setIsLoadingAI(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ statistics: stats }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const insights = (await response.json()) as UsageAnalysisInsights;
      setAiInsights(insights);

      // Cache the insights
      const cacheKey = generateCacheKey(stats);
      setCachedInsights(cacheKey, insights);
    } catch (error) {
      console.error("Failed to fetch AI insights:", error);
      // Don't set error state - just don't show AI insights
      // The page should continue to function without AI insights
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Load AI insights when statistics are available
  useEffect(() => {
    if (!statistics) {
      setAiInsights(null);
      setIsLoadingAI(false);
      return;
    }

    // Check cache first
    const cacheKey = generateCacheKey(statistics);
    const cached = getCachedInsights(cacheKey);

    if (cached) {
      setAiInsights(cached);
      setIsLoadingAI(false);
    } else {
      // Fetch from API (don't block UI)
      fetchAIInsights(statistics).catch((error) => {
        console.error("Error fetching AI insights:", error);
      });
    }
  }, [statistics]);

  const handleUploadSuccess = (data: HourlyUsageData[]) => {
    setUsageData(data);
    const stats = calculateUsageStatistics(data);
    setStatistics(stats);
    setSelectedPlanIds([]); // Reset selection when new data is uploaded
    // Clear AI cache when new CSV is uploaded
    clearAICache();
    setAiInsights(null);
    setIsLoadingAI(false);
  };

  const handleDownloadSample = (filename: string) => {
    const link = document.createElement("a");
    link.href = `/sample-csvs/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="container mx-auto px-4 py-8 md:px-8 lg:px-16 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-black dark:text-zinc-50">
            Energy Plan Recommendation Agent
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Upload your hourly energy usage data to get personalized plan recommendations
          </p>
        </div>

        {!usageData ? (
          <div className="space-y-6">
            <CSVUpload onUploadSuccess={handleUploadSuccess} />

            <Card>
              <CardHeader>
                <CardTitle>Try Sample Data</CardTitle>
                <CardDescription>
                  Download sample CSV files to test the application with different usage patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {SAMPLE_FILES.map((sample) => (
                    <div
                      key={sample.file}
                      className="flex flex-col gap-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="font-medium">{sample.name}</div>
                      <div className="text-sm text-muted-foreground">{sample.description}</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadSample(sample.file)}
                        className="mt-2"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Usage Insights</h2>
                <p className="text-muted-foreground">
                  Your energy consumption patterns and statistics
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setUsageData(null);
                  setStatistics(null);
                  setAiInsights(null);
                  setIsLoadingAI(false);
                  clearAICache();
                }}
              >
                Upload New File
              </Button>
            </div>

            {statistics && (
              <UsageInsights
                statistics={statistics}
                aiInsights={aiInsights}
                isLoadingAI={isLoadingAI}
              />
            )}

            {statistics && topRecommendations.length > 0 && (
              <div className="space-y-6">
                <PlanRecommendations
                  recommendations={topRecommendations}
                  selectedPlanIds={selectedPlanIds}
                  onPlanSelect={handlePlanSelect}
                />
                {selectedPlans.length > 0 && (
                  <PlanComparisonChart
                    selectedPlans={selectedPlans}
                    monthlyBreakdowns={monthlyBreakdowns}
                    onClearSelection={handleClearSelection}
                  />
                )}
                <PlanGrid
                  plans={rankedPlans}
                  topThreeIds={topThreeIds}
                  selectedPlanIds={selectedPlanIds}
                  onPlanSelect={handlePlanSelect}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
