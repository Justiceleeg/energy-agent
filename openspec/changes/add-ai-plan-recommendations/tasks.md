## 1. Implementation

### 1.1 Create AI Recommendation Types
- [ ] Add `PlanRecommendation` interface to `lib/types/ai.ts`
- [ ] Include fields: `planId`, `explanation`, `pros`, `cons`, `goodFor` (badges)
- [ ] Add `PlanRecommendationsResponse` type for API response
- [ ] Add `UserPreference` type (cost, flexibility, renewable)

### 1.2 Create AI Recommendation Function
- [ ] Create `lib/ai/generatePlanRecommendations.ts`
- [ ] Build structured prompt for GPT-4o-mini with usage patterns + plan details
- [ ] Request explanation for top 3 plans with pros/cons
- [ ] Ask for "Good for" badges based on usage patterns
- [ ] Define JSON output structure matching `PlanRecommendation` interface
- [ ] Implement retry logic (max 2 retries) and timeout handling (30 seconds)
- [ ] Handle JSON parsing with markdown code block extraction

### 1.3 Create Recommendations API Route
- [ ] Create `app/api/recommendations/route.ts`
- [ ] Accept POST requests with usage data, statistics, and top 3 plans
- [ ] Validate request body (check for required fields)
- [ ] Call `generatePlanRecommendations()` function
- [ ] Return structured recommendations as JSON
- [ ] Handle rate limiting (429 status with retry-after header)
- [ ] Handle timeouts (504 status)
- [ ] Handle API errors (500 status with error message)
- [ ] Set request timeout (35 seconds)

### 1.4 Add Preference Selection UI
- [ ] Create preference selector component or add to existing UI
- [ ] Add three options: Cost (default), Flexibility, Renewable
- [ ] Store preference in React state
- [ ] Update preference when user selects different option
- [ ] Display active preference clearly

### 1.5 Update Ranking Algorithm for Preferences
- [ ] Modify `rankPlansByCost()` in `lib/calculations/planRanking.ts`
- [ ] Add `preference` parameter (cost, flexibility, renewable)
- [ ] When preference is "cost": rank by annual cost (existing behavior)
- [ ] When preference is "flexibility": rank by flexibility rating (high > medium > low), then by cost
- [ ] When preference is "renewable": rank by renewable percentage (descending), then by cost
- [ ] Update `getTopRecommendations()` to accept preference parameter
- [ ] Ensure backward compatibility (default to "cost" if not specified)

### 1.6 Update Plan Recommendations Component
- [ ] Modify `components/features/PlanRecommendations.tsx`
- [ ] Remove hardcoded `RECOMMENDATION_LABELS` array
- [ ] Accept AI-generated recommendations as prop
- [ ] Display AI-generated explanation instead of hardcoded label
- [ ] Display pros/cons lists if provided
- [ ] Display "Good for" badges if provided
- [ ] Handle loading state while AI recommendations are being fetched
- [ ] Handle error state if AI recommendations fail (fallback to cost-based labels)

### 1.7 Implement Parallel AI Calls
- [ ] Update `app/page.tsx` to call both `/api/analyze` and `/api/recommendations` in parallel
- [ ] Use `Promise.all()` to execute both API calls simultaneously
- [ ] Handle loading states for both calls independently
- [ ] Display results as they complete (progressive disclosure)
- [ ] Handle partial failures gracefully (show available results even if one fails)
- [ ] Update error handling to distinguish between analysis and recommendation errors

### 1.8 Integrate Preference Selection with Recommendations
- [ ] When preference changes, re-rank plans and get new top 3
- [ ] Re-fetch AI recommendations with new top 3 plans
- [ ] Update UI to show loading state during re-fetch
- [ ] Cache recommendations per preference + usage data combination

### 1.9 Add Recommendation Caching
- [ ] Check session storage for cached recommendations
- [ ] Cache key based on usage data hash + preference + top 3 plan IDs
- [ ] Store recommendations in session storage after successful API call
- [ ] Clear cache when new CSV is uploaded or preference changes significantly
- [ ] Fallback to API call if cache miss or error

## 2. Testing & Validation

- [ ] Test with different usage patterns (night owl, solar, typical family)
- [ ] Test with different preferences (cost, flexibility, renewable)
- [ ] Verify AI explanations are personalized and relevant
- [ ] Verify parallel AI calls complete successfully
- [ ] Test error handling (rate limits, timeouts, API failures)
- [ ] Verify caching works correctly
- [ ] Test preference changes trigger re-ranking and re-fetch
- [ ] Monitor API costs during testing

## 3. Deployment

- [ ] Deploy to Vercel
- [ ] Verify environment variables are set (OPENAI_API_KEY)
- [ ] Test in production environment
- [ ] Monitor API costs and response times
- [ ] Verify explanations are personalized and helpful

