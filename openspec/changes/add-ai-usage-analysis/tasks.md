## 1. Implementation

### 1.1 AI Type Definitions
- [x] 1.1.1 Create `lib/types/ai.ts` with `UsageAnalysisInsights` interface
- [x] 1.1.2 Define insight structure with pattern types (peak times, seasonal trends, weekday/weekend patterns)
- [x] 1.1.3 Include actionable recommendations array
- [x] 1.1.4 Add metadata fields (model used, timestamp, etc.)

### 1.2 AI Utility Functions
- [x] 1.2.1 Create `lib/ai/analyzeUsagePatterns.ts` with `analyzeUsagePatterns()` function
- [x] 1.2.2 Set up OpenAI client using Vercel AI SDK (use `ai` package, not OpenAI SDK)
- [x] 1.2.3 Read `OPENAI_API_KEY` from environment variables
- [x] 1.2.4 Implement error handling for API failures
- [x] 1.2.5 Add retry logic for transient failures (max 2 retries)
- [x] 1.2.6 Add timeout handling (10-second timeout)

### 1.3 Usage Analysis Prompt
- [x] 1.3.1 Build structured prompt for GPT-4o-mini in `analyzeUsagePatterns()` function
- [x] 1.3.2 Include usage statistics summary (total annual kWh, average daily, peak hour, monthly breakdown)
- [x] 1.3.3 Request insights on peak usage times (hour of day, day of week patterns)
- [x] 1.3.4 Request insights on seasonal trends (summer vs winter, monthly variations)
- [x] 1.3.5 Request actionable recommendations for optimizing energy usage
- [x] 1.3.6 Define expected JSON output structure in prompt
- [x] 1.3.7 Request plain language explanations (avoid technical jargon)

### 1.4 API Route for Analysis
- [x] 1.4.1 Create `app/api/analyze/route.ts` as Next.js API route handler
- [x] 1.4.2 Accept POST requests with usage data in request body
- [x] 1.4.3 Validate request body (check for required fields)
- [x] 1.4.4 Call `analyzeUsagePatterns()` function with usage data
- [x] 1.4.5 Return structured insights as JSON response
- [x] 1.4.6 Handle rate limiting errors (return 429 status with retry-after header)
- [x] 1.4.7 Handle API errors gracefully (return 500 with error message)
- [x] 1.4.8 Add request timeout (10 seconds)

### 1.5 Usage Insights Component Updates
- [x] 1.5.1 Update `components/features/UsageInsights.tsx` to accept optional `aiInsights` prop
- [x] 1.5.2 Add loading state display while AI analysis is in progress
- [x] 1.5.3 Create AI insights section with card layout
- [x] 1.5.4 Display pattern insights (peak times, seasonal trends) in readable cards
- [x] 1.5.5 Display actionable recommendations with icons
- [x] 1.5.6 Style insights to match existing UI design system
- [x] 1.5.7 Add icons for different insight types (clock for peak times, calendar for seasonal, lightbulb for recommendations)

### 1.6 Session Storage Caching
- [x] 1.6.1 Create cache key based on usage data hash (total annual kWh + monthly breakdown signature)
- [x] 1.6.2 Check session storage for cached insights before making API call
- [x] 1.6.3 Store AI insights in session storage after successful API call
- [x] 1.6.4 Clear cache when new CSV is uploaded
- [x] 1.6.5 Handle cache errors gracefully (fall back to API call)

### 1.7 Page Integration
- [x] 1.7.1 Update `app/page.tsx` to call `/api/analyze` endpoint when usage data is available
- [x] 1.7.2 Call API in parallel with other operations (don't block UI)
- [x] 1.7.3 Manage loading state for AI analysis
- [x] 1.7.4 Pass AI insights to UsageInsights component
- [x] 1.7.5 Handle API errors gracefully (show error message, don't break page)
- [x] 1.7.6 Implement cache check before API call

### 1.8 Testing & Validation
- [x] 1.8.1 Test API route with all 3 sample CSV files
- [x] 1.8.2 Verify insights are relevant and accurate for each usage pattern
- [x] 1.8.3 Test error handling (invalid API key, rate limits, timeouts)
- [x] 1.8.4 Verify caching works correctly (same data = no API call)
- [x] 1.8.5 Test cache clearing on new CSV upload
- [x] 1.8.6 Verify loading states display correctly
- [x] 1.8.7 Test mobile responsiveness of AI insights display
- [x] 1.8.8 Monitor OpenAI API usage in dashboard
- [ ] 1.8.9 Deploy to Vercel and verify functionality

