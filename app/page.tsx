"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { CSVUpload } from "@/components/features/CSVUpload";
import { UsageInsights } from "@/components/features/UsageInsights";
import { PlanRecommendations } from "@/components/features/PlanRecommendations";
import { PreferenceSelector } from "@/components/features/PreferenceSelector";
import { PlanGrid } from "@/components/features/PlanGrid";
import { PlanComparisonChart } from "@/components/features/PlanComparisonChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HourlyUsageData } from "@/lib/types/usage";
import { EnergyPlan } from "@/lib/types/plans";
import { UsageAnalysisInsights, PlanRecommendation, PlanRecommendationsResponse, UserPreference } from "@/lib/types/ai";
import { calculateUsageStatistics } from "@/lib/utils/usageStatistics";
import { rankPlansByCost, getTopRecommendations, PlanWithCost } from "@/lib/calculations/planRanking";
import { calculateMonthlyBreakdown, MonthlyCostBreakdown } from "@/lib/calculations/monthlyBreakdown";
import simplePlans from "@/data/plans/simple-plans.json";
import complexPlans from "@/data/plans/complex-plans.json";

const CACHE_KEY_PREFIX_INSIGHTS = "ai_insights_";
const CACHE_KEY_PREFIX_RECOMMENDATIONS = "ai_recommendations_";

const SAMPLE_FILES = [
  { name: "Night Owl User", file: "night-owl-user.csv", description: "High evening usage pattern" },
  { name: "Solar Home User", file: "solar-home-user.csv", description: "Low daytime, high evening (solar panels)" },
  { name: "Typical Family", file: "typical-family.csv", description: "Standard 9-5 usage pattern" },
];

export default function Home() {
  const [usageData, setUsageData] = useState<HourlyUsageData[] | null>(null);
  const [statistics, setStatistics] = useState<ReturnType<typeof calculateUsageStatistics> | null>(null);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [preference, setPreference] = useState<UserPreference>("cost");
  const [aiInsights, setAiInsights] = useState<UsageAnalysisInsights | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<PlanRecommendation[] | null>(null);
  // Store recommendations for all preferences
  const [allRecommendations, setAllRecommendations] = useState<Map<UserPreference, PlanRecommendation[]>>(new Map());
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [loadingPreferences, setLoadingPreferences] = useState<Set<UserPreference>>(new Set());
  // Track which statistics key we've already fetched for to prevent re-fetching
  const fetchedStatisticsKey = useRef<string | null>(null);

  // Combine all plans: 50 simple plans + 30 complex plans = 80 total
  const plans = [...(simplePlans as EnergyPlan[]), ...(complexPlans as EnergyPlan[])];

  // Calculate plan costs and rankings when usage data is available
  const { rankedPlans, topRecommendations, topThreeIds } = useMemo(() => {
    if (!statistics) {
      return { rankedPlans: [], topRecommendations: [], topThreeIds: [] };
    }

    const ranked = rankPlansByCost(plans, statistics.totalAnnualKWh, statistics, preference, usageData || undefined);
    const topThree = getTopRecommendations(plans, statistics.totalAnnualKWh, statistics, preference, usageData || undefined);
    const topThreeIds = topThree.map((item) => item.plan.id);

    return {
      rankedPlans: ranked,
      topRecommendations: topThree,
      topThreeIds,
    };
  }, [statistics, plans, preference, usageData]);

  // Calculate top recommendations for ALL preferences (for background fetching)
  // Use a stable key to prevent unnecessary re-renders
  const allTopRecommendationsKey = useMemo(() => {
    if (!statistics) return null;
    return `${statistics.totalAnnualKWh.toFixed(1)}_${statistics.monthlyBreakdown.map(m => m.totalKWh.toFixed(1)).join(',')}`;
  }, [statistics]);
  
  const allTopRecommendations = useMemo(() => {
    if (!statistics) {
      return new Map<UserPreference, PlanWithCost[]>();
    }

    const preferences: UserPreference[] = ["cost", "flexibility", "renewable"];
    const map = new Map<UserPreference, PlanWithCost[]>();

    preferences.forEach((pref) => {
      const topThree = getTopRecommendations(plans, statistics.totalAnnualKWh, statistics, pref, usageData || undefined);
      map.set(pref, topThree);
    });

    return map;
  }, [statistics, plans, usageData]);

  // Default to top 3 recommendations when usage data is first available
  // Only auto-select on initial load, not when preference changes
  const hasAutoSelectedRef = useRef(false);
  
  useEffect(() => {
    if (topThreeIds.length > 0 && selectedPlanIds.length === 0 && !hasAutoSelectedRef.current) {
      setSelectedPlanIds(topThreeIds);
      hasAutoSelectedRef.current = true;
    }
    
    // Reset the flag when data is cleared
    if (topThreeIds.length === 0) {
      hasAutoSelectedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topThreeIds]);

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
  const generateInsightsCacheKey = (stats: ReturnType<typeof calculateUsageStatistics>): string => {
    // Create a signature from total annual kWh and monthly breakdown
    const monthlySignature = stats.monthlyBreakdown
      .map((m) => `${m.month}:${m.totalKWh.toFixed(1)}`)
      .join(",");
    const signature = `${stats.totalAnnualKWh.toFixed(1)}_${monthlySignature}`;
    return `${CACHE_KEY_PREFIX_INSIGHTS}${signature}`;
  };

  // Generate cache key for recommendations (includes preference and top 3 plan IDs)
  const generateRecommendationsCacheKey = (
    stats: ReturnType<typeof calculateUsageStatistics>,
    pref: UserPreference,
    planIds: string[]
  ): string => {
    const monthlySignature = stats.monthlyBreakdown
      .map((m) => `${m.month}:${m.totalKWh.toFixed(1)}`)
      .join(",");
    const planIdsSignature = planIds.sort().join(",");
    const signature = `${stats.totalAnnualKWh.toFixed(1)}_${monthlySignature}_${pref}_${planIdsSignature}`;
    return `${CACHE_KEY_PREFIX_RECOMMENDATIONS}${signature}`;
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

  // Get cached recommendations from session storage
  const getCachedRecommendations = (cacheKey: string): PlanRecommendation[] | null => {
    try {
      if (typeof window === "undefined" || !window.sessionStorage) {
        return null;
      }
      const cached = window.sessionStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached) as PlanRecommendationsResponse;
        return data.recommendations || null;
      }
    } catch (error) {
      console.warn("Failed to read recommendations from session storage:", error);
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

  // Store recommendations in session storage
  const setCachedRecommendations = (cacheKey: string, recommendations: PlanRecommendationsResponse): void => {
    try {
      if (typeof window === "undefined" || !window.sessionStorage) {
        return;
      }
      window.sessionStorage.setItem(cacheKey, JSON.stringify(recommendations));
    } catch (error) {
      console.warn("Failed to write recommendations to session storage:", error);
    }
  };

  // Clear AI cache (both insights and recommendations)
  const clearAICache = (): void => {
    try {
      if (typeof window === "undefined" || !window.sessionStorage) {
        return;
      }
      // Clear all cache entries with our prefixes
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key && (key.startsWith(CACHE_KEY_PREFIX_INSIGHTS) || key.startsWith(CACHE_KEY_PREFIX_RECOMMENDATIONS))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => window.sessionStorage.removeItem(key));
    } catch (error) {
      console.warn("Failed to clear session storage:", error);
    }
  };

  // Fetch AI insights from API
  const fetchAIInsights = async (stats: ReturnType<typeof calculateUsageStatistics>): Promise<UsageAnalysisInsights | null> => {
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

      // Cache the insights
      const cacheKey = generateInsightsCacheKey(stats);
      setCachedInsights(cacheKey, insights);

      return insights;
    } catch (error) {
      console.error("Failed to fetch AI insights:", error);
      // Don't throw - return null to allow page to continue functioning
      return null;
    }
  };

  // Fetch AI recommendations from API
  const fetchAIRecommendations = async (
    stats: ReturnType<typeof calculateUsageStatistics>,
    topPlans: typeof topRecommendations,
    pref: UserPreference
  ): Promise<PlanRecommendation[] | null> => {
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          statistics: stats,
          plans: topPlans.map((item) => ({
            plan: item.plan,
            cost: item.cost,
          })),
          preference: pref,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = (await response.json()) as PlanRecommendationsResponse;

      // Cache the recommendations
      const planIds = topPlans.map((item) => item.plan.id);
      const cacheKey = generateRecommendationsCacheKey(stats, pref, planIds);
      setCachedRecommendations(cacheKey, data);

      return data.recommendations;
    } catch (error) {
      console.error("Failed to fetch AI recommendations:", error);
      // Don't throw - return null to allow page to continue functioning
      return null;
    }
  };

  // Load AI insights when statistics are available
  useEffect(() => {
    if (!statistics) {
      setAiInsights(null);
      setIsLoadingAI(false);
      return;
    }

    // Check cache for insights
    const insightsCacheKey = generateInsightsCacheKey(statistics);
    const cachedInsights = getCachedInsights(insightsCacheKey);

    if (cachedInsights) {
      setAiInsights(cachedInsights);
      setIsLoadingAI(false);
    } else {
      setIsLoadingAI(true);
      fetchAIInsights(statistics).then((insights) => {
        if (insights) {
          setAiInsights(insights);
        }
        setIsLoadingAI(false);
      });
    }
  }, [statistics]);

  // Pre-fetch recommendations for ALL preferences in the background
  useEffect(() => {
    if (!statistics || !allTopRecommendationsKey) {
      if (!statistics) {
        setAllRecommendations(new Map());
        setAiRecommendations(null);
        setIsLoadingRecommendations(false);
        setLoadingPreferences(new Set());
        fetchedStatisticsKey.current = null;
      }
      return;
    }

    // Skip if we've already fetched for this statistics key
    // Check this FIRST before any async operations
    if (fetchedStatisticsKey.current === allTopRecommendationsKey) {
      console.log(`[Background Fetch] Skipping - already fetched for key: ${allTopRecommendationsKey}`);
      return;
    }

    // Get fresh top recommendations for this statistics key
    const currentTopRecommendations = allTopRecommendations;
    if (currentTopRecommendations.size === 0) {
      console.log(`[Background Fetch] Skipping - no top recommendations available`);
      return;
    }

    // Mark that we're fetching for this key BEFORE starting any async operations
    // This prevents multiple simultaneous fetches
    fetchedStatisticsKey.current = allTopRecommendationsKey;
    
    console.log(`[Background Fetch] Starting fetch for statistics key: ${allTopRecommendationsKey}`);

    const preferences: UserPreference[] = ["cost", "flexibility", "renewable"];
    const fetchPromises: Promise<void>[] = [];
    const newLoadingPreferences = new Set<UserPreference>();
    
    // Read current state once at the start
    const currentAllRecommendations = allRecommendations;
    const currentLoadingPreferences = loadingPreferences;
    const newAllRecommendations = new Map(currentAllRecommendations);

    preferences.forEach((pref) => {
      // Skip if we already have recommendations for this preference
      if (newAllRecommendations.has(pref)) {
        console.log(`[Background Fetch] Skipping ${pref} - already in cache`);
        return;
      }

      const topPlans = currentTopRecommendations.get(pref);
      if (!topPlans || topPlans.length === 0) {
        return;
      }

      // Check cache first
      const planIds = topPlans.map((item) => item.plan.id).sort();
      const cacheKey = generateRecommendationsCacheKey(statistics, pref, planIds);
      const cached = getCachedRecommendations(cacheKey);

      if (cached) {
        // Use cached data
        console.log(`[Background Fetch] Using cached recommendations for ${pref}`);
        newAllRecommendations.set(pref, cached);
      } else {
        // Only fetch if not already loading
        const currentLoading = currentLoadingPreferences.has(pref);
        if (!currentLoading) {
          // Fetch in background
          newLoadingPreferences.add(pref);
          const currentKey = allTopRecommendationsKey; // Capture for closure
          console.log(`[Background Fetch] Fetching recommendations for preference: ${pref}`);
          fetchPromises.push(
            fetchAIRecommendations(statistics, topPlans, pref).then((recommendations) => {
              if (recommendations) {
                // Only update if we're still on the same statistics key
                if (fetchedStatisticsKey.current === currentKey) {
                  console.log(`[Background Fetch] Successfully fetched recommendations for ${pref}`);
                  setAllRecommendations((prev) => {
                    const next = new Map(prev);
                    next.set(pref, recommendations);
                    return next;
                  });
                } else {
                  console.log(`[Background Fetch] Ignoring recommendations for ${pref} - statistics key changed`);
                }
              }
              setLoadingPreferences((prev) => {
                const next = new Set(prev);
                next.delete(pref);
                return next;
              });
            }).catch((error) => {
              console.error(`[Background Fetch] Failed to fetch recommendations for ${pref}:`, error);
              setLoadingPreferences((prev) => {
                const next = new Set(prev);
                next.delete(pref);
                return next;
              });
            })
          );
        } else {
          console.log(`[Background Fetch] Skipping ${pref} - already loading`);
        }
      }
    });

    // Update loading state only if there are new fetches
    if (newLoadingPreferences.size > 0) {
      setLoadingPreferences((prev) => {
        const next = new Set(prev);
        newLoadingPreferences.forEach((pref) => next.add(pref));
        return next;
      });
    }
    
    // Update recommendations map with cached data
    if (newAllRecommendations.size > currentAllRecommendations.size) {
      setAllRecommendations(newAllRecommendations);
    }

    // Handle errors for background fetches
    if (fetchPromises.length > 0) {
      Promise.allSettled(fetchPromises).catch((error) => {
        console.error("Error in background recommendation fetches:", error);
      });
    }
    
    // Cleanup function to prevent updates if component unmounts or key changes
    return () => {
      // If the key changes while fetches are in progress, mark them as cancelled
      if (fetchedStatisticsKey.current !== allTopRecommendationsKey) {
        console.log(`[Background Fetch] Cleanup - cancelling fetches for old key`);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTopRecommendationsKey]);

  // Memoize plan IDs as a stable string to prevent unnecessary re-renders
  const topPlanIdsString = useMemo(() => {
    if (topRecommendations.length === 0) return '';
    return topRecommendations.map((item) => item.plan.id).sort().join(',');
  }, [topRecommendations]);

  // Track previous state to prevent infinite loops
  const prevStateRef = useRef<{
    preference: UserPreference;
    planIds: string;
    allRecsSize: number;
  }>({ preference: 'cost', planIds: '', allRecsSize: 0 });

  // Update current recommendations when preference or plan IDs change
  useEffect(() => {
    if (!statistics || topRecommendations.length === 0) {
      return;
    }

    const currentPlanIds = topPlanIdsString;
    const currentAllRecsSize = allRecommendations.size;
    const currentPreference = preference;

    // Check if anything actually changed
    const prevState = prevStateRef.current;
    if (
      prevState.preference === currentPreference &&
      prevState.planIds === currentPlanIds &&
      prevState.allRecsSize === currentAllRecsSize &&
      prevState.planIds !== ''
    ) {
      // Nothing changed, skip update
      return;
    }

    // Update ref with current state
    prevStateRef.current = {
      preference: currentPreference,
      planIds: currentPlanIds,
      allRecsSize: currentAllRecsSize,
    };

    // Get the current top plan IDs as array
    const currentPlanIdsArray = topRecommendations.map((item) => item.plan.id).sort();
    
    // Get recommendations for this preference
    const prefRecommendations = allRecommendations.get(preference);
    
    if (prefRecommendations) {
      // Filter recommendations to only include plans that are in the current top 3
      // This ensures we only show recommendations for plans that are actually displayed
      const matchingRecommendations = prefRecommendations.filter((rec) =>
        currentPlanIdsArray.includes(rec.planId)
      );
      
      // Only update if we have matching recommendations
      if (matchingRecommendations.length > 0) {
        setAiRecommendations(matchingRecommendations);
        setIsLoadingRecommendations(false);
        return;
      }
    }

    // If no matching recommendations, check if it's loading
    // Don't fetch here - the background fetch effect handles all fetching
    if (loadingPreferences.has(preference)) {
      setIsLoadingRecommendations(true);
    } else {
      // If not loading and no recommendations, they should be fetched by the background effect
      // Just set loading to false and wait for background fetch to complete
      setIsLoadingRecommendations(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preference, topPlanIdsString, allRecommendations, loadingPreferences]);

  // Handle preference change
  const handlePreferenceChange = (newPreference: UserPreference) => {
    setPreference(newPreference);
    // Recommendations are pre-fetched, so we just need to update the display
    // The useEffect will handle showing the correct recommendations
  };

  const handleUploadSuccess = (data: HourlyUsageData[]) => {
    setUsageData(data);
    const stats = calculateUsageStatistics(data);
    setStatistics(stats);
    setSelectedPlanIds([]); // Reset selection when new data is uploaded
    setPreference("cost"); // Reset preference to default
    // Clear AI cache when new CSV is uploaded
    clearAICache();
    setAiInsights(null);
    setAiRecommendations(null);
    setAllRecommendations(new Map()); // Clear all pre-fetched recommendations
    setIsLoadingAI(false);
    setIsLoadingRecommendations(false);
    setLoadingPreferences(new Set());
    fetchedStatisticsKey.current = null; // Reset fetch tracking
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
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold mb-1">Top Recommendations</h2>
                    <p className="text-muted-foreground">
                      Our top 3 energy plans based on your usage
                    </p>
                  </div>
                  <PreferenceSelector
                    preference={preference}
                    onPreferenceChange={handlePreferenceChange}
                    disabled={isLoadingRecommendations}
                  />
                </div>
                <PlanRecommendations
                  recommendations={topRecommendations}
                  aiRecommendations={aiRecommendations || undefined}
                  isLoadingAI={isLoadingRecommendations}
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
