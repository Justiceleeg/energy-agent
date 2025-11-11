## 1. Implementation

### 1.1 AI Type Definitions
- [ ] 1.1.1 Create `lib/types/ai.ts` with `UsageAnalysisInsights` interface
- [ ] 1.1.2 Define insight structure with pattern types (peak times, seasonal trends, weekday/weekend patterns)
- [ ] 1.1.3 Include actionable recommendations array
- [ ] 1.1.4 Add metadata fields (model used, timestamp, etc.)

### 1.2 AI Utility Functions
- [ ] 1.2.1 Create `lib/ai/analyzeUsagePatterns.ts` with `analyzeUsagePatterns()` function
- [ ] 1.2.2 Set up OpenAI client using Vercel AI SDK (use `ai` package, not OpenAI SDK)
- [ ] 1.2.3 Read `OPENAI_API_KEY` from environment variables
- [ ] 1.2.4 Implement error handling for API failures
- [ ] 1.2.5 Add retry logic for transient failures (max 2 retries)
- [ ] 1.2.6 Add timeout handling (10-second timeout)

### 1.3 Usage Analysis Prompt
- [ ] 1.3.1 Build structured prompt for GPT-4o-mini in `analyzeUsagePatterns()` function
- [ ] 1.3.2 Include usage statistics summary (total annual kWh, average daily, peak hour, monthly breakdown)
- [ ] 1.3.3 Request insights on peak usage times (hour of day, day of week patterns)
- [ ] 1.3.4 Request insights on seasonal trends (summer vs winter, monthly variations)
- [ ] 1.3.5 Request actionable recommendations for optimizing energy usage
- [ ] 1.3.6 Define expected JSON output structure in prompt
- [ ] 1.3.7 Request plain language explanations (avoid technical jargon)

### 1.4 API Route for Analysis
- [ ] 1.4.1 Create `app/api/analyze/route.ts` as Next.js API route handler
- [ ] 1.4.2 Accept POST requests with usage data in request body
- [ ] 1.4.3 Validate request body (check for required fields)
- [ ] 1.4.4 Call `analyzeUsagePatterns()` function with usage data
- [ ] 1.4.5 Return structured insights as JSON response
- [ ] 1.4.6 Handle rate limiting errors (return 429 status with retry-after header)
- [ ] 1.4.7 Handle API errors gracefully (return 500 with error message)
- [ ] 1.4.8 Add request timeout (10 seconds)

### 1.5 Usage Insights Component Updates
- [ ] 1.5.1 Update `components/features/UsageInsights.tsx` to accept optional `aiInsights` prop
- [ ] 1.5.2 Add loading state display while AI analysis is in progress
- [ ] 1.5.3 Create AI insights section with card layout
- [ ] 1.5.4 Display pattern insights (peak times, seasonal trends) in readable cards
- [ ] 1.5.5 Display actionable recommendations with icons
- [ ] 1.5.6 Style insights to match existing UI design system
- [ ] 1.5.7 Add icons for different insight types (clock for peak times, calendar for seasonal, lightbulb for recommendations)

### 1.6 Session Storage Caching
- [ ] 1.6.1 Create cache key based on usage data hash (total annual kWh + monthly breakdown signature)
- [ ] 1.6.2 Check session storage for cached insights before making API call
- [ ] 1.6.3 Store AI insights in session storage after successful API call
- [ ] 1.6.4 Clear cache when new CSV is uploaded
- [ ] 1.6.5 Handle cache errors gracefully (fall back to API call)

### 1.7 Page Integration
- [ ] 1.7.1 Update `app/page.tsx` to call `/api/analyze` endpoint when usage data is available
- [ ] 1.7.2 Call API in parallel with other operations (don't block UI)
- [ ] 1.7.3 Manage loading state for AI analysis
- [ ] 1.7.4 Pass AI insights to UsageInsights component
- [ ] 1.7.5 Handle API errors gracefully (show error message, don't break page)
- [ ] 1.7.6 Implement cache check before API call

### 1.8 Testing & Validation
- [ ] 1.8.1 Test API route with all 3 sample CSV files
- [ ] 1.8.2 Verify insights are relevant and accurate for each usage pattern
- [ ] 1.8.3 Test error handling (invalid API key, rate limits, timeouts)
- [ ] 1.8.4 Verify caching works correctly (same data = no API call)
- [ ] 1.8.5 Test cache clearing on new CSV upload
- [ ] 1.8.6 Verify loading states display correctly
- [ ] 1.8.7 Test mobile responsiveness of AI insights display
- [ ] 1.8.8 Monitor OpenAI API usage in dashboard
- [ ] 1.8.9 Deploy to Vercel and verify functionality

