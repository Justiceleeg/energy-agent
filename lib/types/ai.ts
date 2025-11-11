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

