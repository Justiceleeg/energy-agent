# Change: Add AI Integration - Usage Pattern Analysis

## Why
Users need personalized insights about their energy usage patterns to understand their consumption behavior and make informed decisions. While basic statistics are helpful, AI-generated analysis can identify patterns, trends, and actionable recommendations that help users optimize their energy usage and select better plans. This feature adds intelligent analysis using OpenAI's GPT-4o-mini model to provide contextual insights about usage patterns.

## What Changes
- **ADDED**: AI integration capability with OpenAI API (GPT-4o-mini) for usage pattern analysis
- **ADDED**: AI utility functions in `lib/ai/` for calling OpenAI API with structured prompts
- **ADDED**: `/api/analyze` API route that accepts usage data and returns AI-generated insights
- **ADDED**: Structured prompt engineering for usage analysis with JSON output format
- **ADDED**: AI-generated insights display in UsageInsights component with loading states
- **ADDED**: Session storage caching to avoid redundant API calls for the same usage data
- **MODIFIED**: Usage Insights component to display AI-generated insights alongside basic statistics

## Impact
- **Affected specs**: New capability `ai-integration` added, `usage-data-processing` modified to include AI insights
- **Affected code**:
  - New utilities: `lib/ai/analyzeUsagePatterns.ts` (AI analysis function)
  - New API route: `app/api/analyze/route.ts` (Next.js API endpoint)
  - New types: `lib/types/ai.ts` (AI insight types)
  - Modified components: `components/features/UsageInsights.tsx` (add AI insights section)
  - Updated: `app/page.tsx` (call AI analysis API, manage loading states, handle caching)

