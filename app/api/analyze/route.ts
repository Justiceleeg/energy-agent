import { NextRequest, NextResponse } from "next/server";
import { analyzeUsagePatterns } from "@/lib/ai/analyzeUsagePatterns";
import { UsageStatistics } from "@/lib/types/usage";

const TIMEOUT_MS = 35000; // 35 seconds (AI analysis can take 10-30 seconds, add buffer)

export async function POST(request: NextRequest) {
  try {
    // Set timeout for the entire request
    const timeoutPromise = new Promise<NextResponse>((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), TIMEOUT_MS);
    });

    const requestPromise = (async () => {
      // Parse and validate request body
      let body;
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

      const statistics = body.statistics as UsageStatistics;

      // Validate statistics structure
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

      // Call AI analysis function
      try {
        const insights = await analyzeUsagePatterns(normalizedStatistics);
        return NextResponse.json(insights, { status: 200 });
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
        console.error("AI analysis error:", error);
        return NextResponse.json(
          { error: "Failed to analyze usage patterns. Please try again." },
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
    console.error("Unexpected error in /api/analyze:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

