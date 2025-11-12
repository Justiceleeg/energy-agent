import { NextRequest, NextResponse } from "next/server";
import { generatePlanRecommendations } from "@/lib/ai/generatePlanRecommendations";
import { UsageStatistics } from "@/lib/types/usage";
import { EnergyPlan, PlanCostResult } from "@/lib/types/plans";
import { UserPreference } from "@/lib/types/ai";

const TIMEOUT_MS = 35000; // 35 seconds

/**
 * Request body for recommendations API
 */
interface RecommendationsRequest {
  statistics: UsageStatistics;
  plans: Array<{
    plan: EnergyPlan;
    cost: PlanCostResult;
  }>;
  preference?: UserPreference;
}

export async function POST(request: NextRequest) {
  try {
    // Set timeout for the entire request
    const timeoutPromise = new Promise<NextResponse>((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), TIMEOUT_MS);
    });

    const requestPromise = (async () => {
      // Parse and validate request body
      let body: RecommendationsRequest;
      try {
        body = await request.json();
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid JSON in request body" },
          { status: 400 }
        );
      }

      // Validate required fields
      if (!body.statistics) {
        return NextResponse.json(
          { error: "Missing required field: statistics" },
          { status: 400 }
        );
      }

      if (!body.plans || !Array.isArray(body.plans) || body.plans.length === 0) {
        return NextResponse.json(
          { error: "Missing or invalid required field: plans (must be a non-empty array)" },
          { status: 400 }
        );
      }

      // Validate statistics structure
      const statistics = body.statistics as UsageStatistics;
      if (
        typeof statistics.totalAnnualKWh !== "number" ||
        typeof statistics.averageDailyKWh !== "number" ||
        !statistics.peakUsageHour ||
        !statistics.monthlyBreakdown ||
        !Array.isArray(statistics.monthlyBreakdown)
      ) {
        return NextResponse.json(
          { error: "Invalid statistics structure" },
          { status: 400 }
        );
      }

      // Validate plans structure
      if (body.plans.length > 3) {
        return NextResponse.json(
          { error: "Maximum 3 plans allowed for recommendations" },
          { status: 400 }
        );
      }

      // Validate preference
      const preference: UserPreference = body.preference || "cost";
      if (!["cost", "flexibility", "renewable"].includes(preference)) {
        return NextResponse.json(
          { error: "Invalid preference. Must be 'cost', 'flexibility', or 'renewable'" },
          { status: 400 }
        );
      }

      // Convert date strings back to Date objects (JSON serialization converts dates to strings)
      const normalizedStatistics: UsageStatistics = {
        ...statistics,
        peakUsageHour: {
          ...statistics.peakUsageHour,
          date: statistics.peakUsageHour.date instanceof Date
            ? statistics.peakUsageHour.date
            : new Date(statistics.peakUsageHour.date),
        },
      };

      // Call AI recommendation function
      try {
        const recommendations = await generatePlanRecommendations(
          normalizedStatistics,
          body.plans,
          preference
        );
        return NextResponse.json(recommendations, { status: 200 });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Handle rate limiting errors
        if (errorMessage.includes("rate limit")) {
          return NextResponse.json(
            { error: "Rate limit exceeded. Please try again later." },
            {
              status: 429,
              headers: {
                "Retry-After": "60", // Suggest retry after 60 seconds
              },
            }
          );
        }

        // Handle timeout errors
        if (errorMessage.includes("timeout") || errorMessage.includes("aborted")) {
          return NextResponse.json(
            { error: "Request timeout. Please try again." },
            { status: 504 }
          );
        }

        // Handle other API errors
        console.error("AI recommendations error:", error);
        return NextResponse.json(
          { error: "Failed to generate plan recommendations. Please try again." },
          { status: 500 }
        );
      }
    })();

    // Race between request and timeout
    return await Promise.race([requestPromise, timeoutPromise]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Handle timeout
    if (errorMessage.includes("timeout")) {
      return NextResponse.json(
        { error: "Request timeout. Please try again." },
        { status: 504 }
      );
    }

    // Handle unexpected errors
    console.error("Unexpected error in /api/recommendations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


