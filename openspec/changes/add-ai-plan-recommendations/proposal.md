# Change: Add AI-Generated Plan Recommendations

## Why
Currently, plan recommendations use hardcoded labels ("Lowest cost", "Best value", "Most renewable") that don't provide personalized explanations. Users need AI-generated, personalized explanations that explain why specific plans are recommended for their unique usage patterns. Additionally, users should be able to prioritize preferences (cost, flexibility, renewable energy) to get recommendations tailored to their values.

## What Changes
- Add AI-generated personalized plan explanations using OpenAI GPT-4o-mini
- Create `/api/recommendations` endpoint that generates explanations for top 3 plans
- Add preference selection UI (cost, flexibility, renewable energy) with default to cost-optimized
- Update ranking algorithm to consider user preferences when selecting top recommendations
- Replace hardcoded recommendation labels with AI-generated explanations including pros/cons
- Implement parallel AI calls for usage analysis and plan recommendations
- Add "Good for" badges (night owl, solar, etc.) based on usage patterns

## Impact
- **Affected specs:**
  - `ai-integration` - Add recommendations API route and function
  - `plan-ranking` - Add preference-based ranking logic
  - `plan-display` - Update recommendation cards to show AI explanations and preference selector
- **Affected code:**
  - `app/api/recommendations/route.ts` - New API route
  - `lib/ai/generatePlanRecommendations.ts` - New AI function
  - `lib/types/ai.ts` - Add recommendation types
  - `lib/calculations/planRanking.ts` - Add preference-based ranking
  - `components/features/PlanRecommendations.tsx` - Update to show AI explanations
  - `app/page.tsx` - Add preference state and parallel AI calls
- **Breaking changes:** None
- **New dependencies:** None (already using OpenAI SDK)


