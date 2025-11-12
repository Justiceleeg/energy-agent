# Change: Add Time-of-Use & Seasonal Plans

## Why
Users with varying usage patterns throughout the day (e.g., night owls, solar homes) or throughout the year (e.g., high summer AC usage) need access to time-of-use (TOU) and seasonal pricing plans. These complex plan types can offer significant savings for users who can shift their usage to off-peak times or have predictable seasonal patterns. Supporting these plan types expands the catalog from 50 to 80 plans and provides more accurate cost comparisons for users with time-sensitive or seasonal usage patterns.

## What Changes
- **ADDED**: Time-of-use pricing rule type (`TIME_OF_USE`) with schedules defining rates by hour and day of week
- **ADDED**: Seasonal pricing rule type (`SEASONAL`) with rate modifiers for specific months
- **ADDED**: 30 new complex plans (15 time-of-use plans, 15 seasonal plans) to expand catalog to 80 total plans
- **MODIFIED**: Plan calculation engine to handle `TIME_OF_USE` and `SEASONAL` pricing rules with hourly usage data matching
- **MODIFIED**: Monthly breakdown calculation to account for TOU schedules and seasonal rate variations
- **MODIFIED**: Plan display to show TOU schedules, seasonal rate calendars, and "best times to use energy" recommendations
- **ADDED**: Advanced plan details modal showing detailed pricing schedules and usage optimization tips
- **MODIFIED**: AI integration to include TOU/seasonal information in analysis and recommendations
- **MODIFIED**: Plan complexity classification to mark TOU/seasonal plans as "complex"

## Impact
- **Affected specs**: `plan-data` (new plan types and expanded catalog), `plan-calculation` (new calculation logic with hourly matching), `plan-display` (TOU/seasonal visualization), `ai-integration` (TOU/seasonal context in prompts)
- **Affected code**:
  - Modified types: `lib/types/plans.ts` (extend PricingRule with TIME_OF_USE and SEASONAL)
  - Modified utilities: `lib/calculations/planCost.ts` (add TIME_OF_USE and SEASONAL handlers)
  - Modified utilities: `lib/calculations/monthlyBreakdown.ts` (account for TOU/seasonal in monthly calculations)
  - Modified utilities: `lib/utils/planComplexity.ts` (mark TOU/seasonal as "complex")
  - New data: `data/plans/complex-plans.json` (30 new plans)
  - Modified components: `components/features/PlanCard.tsx` (TOU/seasonal indicators)
  - New components: `components/features/PlanDetailsModal.tsx` (advanced plan details)
  - Modified components: `components/features/PlanComparisonChart.tsx` (TOU/seasonal tooltips)
  - Modified AI: `lib/ai/analyzeUsagePatterns.ts` (include TOU/seasonal context)
  - Modified AI: `lib/ai/generatePlanRecommendations.ts` (include TOU/seasonal in recommendations)
  - Updated: `app/page.tsx` (load all 80 plans)

