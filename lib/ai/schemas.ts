import { z } from "zod";
import { UsageAnalysisInsights, PlanRecommendation, PlanRecommendationsResponse } from "@/lib/types/ai";

/**
 * Zod schema for usage analysis insights
 */
export const UsageAnalysisInsightsSchema = z.object({
  peakTimes: z.object({
    description: z.string(),
    insights: z.array(z.string()),
  }),
  seasonalTrends: z.object({
    description: z.string(),
    insights: z.array(z.string()),
  }),
  weekdayWeekendPatterns: z
    .object({
      description: z.string(),
      insights: z.array(z.string()),
    })
    .optional(),
  recommendations: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ),
});

/**
 * Zod schema for plan recommendation
 */
export const PlanRecommendationSchema = z.object({
  planId: z.string(),
  explanation: z.string(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  goodFor: z.array(z.string()).optional(),
});

/**
 * Zod schema for plan recommendations response
 */
export const PlanRecommendationsResponseSchema = z.object({
  recommendations: z.array(PlanRecommendationSchema),
});


