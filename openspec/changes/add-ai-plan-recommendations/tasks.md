## 1. Implementation

### 1.1 Create AI Recommendation Types
- [x] Add `PlanRecommendation` interface to `lib/types/ai.ts`
- [x] Include fields: `planId`, `explanation`, `pros`, `cons`, `goodFor` (badges)
- [x] Add `PlanRecommendationsResponse` type for API response
- [x] Add `UserPreference` type (cost, flexibility, renewable)

### 1.2 Create AI Recommendation Function
- [x] Create `lib/ai/generatePlanRecommendations.ts`
- [x] Build structured prompt for GPT-4o-mini with usage patterns + plan details
- [x] Request explanation for top 3 plans with pros/cons
- [x] Ask for "Good for" badges based on usage patterns
- [x] Define JSON output structure matching `PlanRecommendation` interface
- [x] Implement retry logic (max 2 retries) and timeout handling (30 seconds)
- [x] Handle JSON parsing with markdown code block extraction

### 1.3 Create Recommendations API Route
- [x] Create `app/api/recommendations/route.ts`
- [x] Accept POST requests with usage data, statistics, and top 3 plans
- [x] Validate request body (check for required fields)
- [x] Call `generatePlanRecommendations()` function
- [x] Return structured recommendations as JSON
- [x] Handle rate limiting (429 status with retry-after header)
- [x] Handle timeouts (504 status)
- [x] Handle API errors (500 status with error message)
- [x] Set request timeout (35 seconds)

### 1.4 Add Preference Selection UI
- [x] Create preference selector component or add to existing UI
- [x] Add three options: Cost (default), Flexibility, Renewable
- [x] Store preference in React state
- [x] Update preference when user selects different option
- [x] Display active preference clearly

### 1.5 Update Ranking Algorithm for Preferences
- [x] Modify `rankPlansByCost()` in `lib/calculations/planRanking.ts`
- [x] Add `preference` parameter (cost, flexibility, renewable)
- [x] When preference is "cost": rank by annual cost (existing behavior)
- [x] When preference is "flexibility": rank by flexibility rating (high > medium > low), then by cost
- [x] When preference is "renewable": rank by renewable percentage (descending), then by cost
- [x] Update `getTopRecommendations()` to accept preference parameter
- [x] Ensure backward compatibility (default to "cost" if not specified)

### 1.6 Update Plan Recommendations Component
- [x] Modify `components/features/PlanRecommendations.tsx`
- [x] Remove hardcoded `RECOMMENDATION_LABELS` array
- [x] Accept AI-generated recommendations as prop
- [x] Display AI-generated explanation instead of hardcoded label
- [x] Display pros/cons lists if provided
- [x] Display "Good for" badges if provided
- [x] Handle loading state while AI recommendations are being fetched
- [x] Handle error state if AI recommendations fail (fallback to cost-based labels)

### 1.7 Implement Parallel AI Calls
- [x] Update `app/page.tsx` to call both `/api/analyze` and `/api/recommendations` in parallel
- [x] Use `Promise.all()` to execute both API calls simultaneously
- [x] Handle loading states for both calls independently
- [x] Display results as they complete (progressive disclosure)
- [x] Handle partial failures gracefully (show available results even if one fails)
- [x] Update error handling to distinguish between analysis and recommendation errors

### 1.8 Integrate Preference Selection with Recommendations
- [x] When preference changes, re-rank plans and get new top 3
- [x] Re-fetch AI recommendations with new top 3 plans
- [x] Update UI to show loading state during re-fetch
- [x] Cache recommendations per preference + usage data combination

### 1.9 Add Recommendation Caching
- [x] Check session storage for cached recommendations
- [x] Cache key based on usage data hash + preference + top 3 plan IDs
- [x] Store recommendations in session storage after successful API call
- [x] Clear cache when new CSV is uploaded or preference changes significantly
- [x] Fallback to API call if cache miss or error

## 2. Testing & Validation

- [x] Test with different usage patterns (night owl, solar, typical family)
- [x] Test with different preferences (cost, flexibility, renewable)
- [x] Verify AI explanations are personalized and relevant
- [x] Verify parallel AI calls complete successfully
- [x] Test error handling (rate limits, timeouts, API failures)
- [x] Verify caching works correctly
- [x] Test preference changes trigger re-ranking and re-fetch
- [x] Monitor API costs during testing

## 3. Deployment

- [x] Deploy to Vercel
- [x] Verify environment variables are set (OPENAI_API_KEY)
- [x] Test in production environment
- [x] Monitor API costs and response times
- [x] Verify explanations are personalized and helpful

