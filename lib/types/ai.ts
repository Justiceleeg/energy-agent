/**
 * AI-generated insights about energy usage patterns
 */
export interface UsageAnalysisInsights {
  /** Peak usage time patterns (hour of day, day of week) */
  peakTimes: {
    /** Description of peak usage times in plain language */
    description: string;
    /** Specific insights about when peak usage occurs */
    insights: string[];
  };
  /** Seasonal trends and variations */
  seasonalTrends: {
    /** Description of seasonal patterns in plain language */
    description: string;
    /** Specific insights about seasonal variations */
    insights: string[];
  };
  /** Weekday vs weekend patterns */
  weekdayWeekendPatterns?: {
    /** Description of weekday/weekend differences */
    description: string;
    /** Specific insights about weekday/weekend patterns */
    insights: string[];
  };
  /** Actionable recommendations for optimizing energy usage */
  recommendations: {
    /** Recommendation title */
    title: string;
    /** Detailed recommendation description */
    description: string;
  }[];
  /** Metadata about the analysis */
  metadata: {
    /** Model used for analysis */
    model: string;
    /** Timestamp when analysis was generated */
    timestamp: string;
  };
}

/**
 * User preference for plan ranking
 */
export type UserPreference = "cost" | "flexibility" | "renewable";

/**
 * AI-generated plan recommendation with personalized explanation
 */
export interface PlanRecommendation {
  /** Plan ID this recommendation is for */
  planId: string;
  /** Personalized explanation of why this plan is recommended */
  explanation: string;
  /** List of advantages specific to the user's usage patterns */
  pros: string[];
  /** List of disadvantages specific to the user's usage patterns */
  cons: string[];
  /** "Good for" badges based on usage patterns (e.g., "night owl", "solar home") */
  goodFor?: string[];
}

/**
 * API response for plan recommendations
 */
export interface PlanRecommendationsResponse {
  /** Array of recommendations for top 3 plans */
  recommendations: PlanRecommendation[];
  /** Metadata about the recommendations */
  metadata: {
    /** Model used for recommendations */
    model: string;
    /** Timestamp when recommendations were generated */
    timestamp: string;
  };
}

