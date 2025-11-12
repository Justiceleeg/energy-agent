# ai-integration Specification

## Purpose
TBD - created by archiving change add-ai-usage-analysis. Update Purpose after archive.
## Requirements
### Requirement: AI Usage Pattern Analysis
The system SHALL use OpenAI API (GPT-4o-mini) to analyze usage data and generate personalized insights about energy consumption patterns.

#### Scenario: AI analysis request
- **WHEN** usage data is available and statistics are calculated
- **THEN** the system calls OpenAI API to analyze usage patterns
- **AND** the API request includes usage statistics summary (total annual kWh, average daily, peak hour, monthly breakdown)
- **AND** the request uses GPT-4o-mini model for cost-effective analysis

#### Scenario: AI insights generation
- **WHEN** OpenAI API successfully processes the usage data
- **THEN** the system receives structured insights in JSON format
- **AND** insights include peak usage time patterns (hour of day, day of week)
- **AND** insights include seasonal trends (summer vs winter, monthly variations)
- **AND** insights include actionable recommendations for optimizing energy usage
- **AND** all insights are written in plain language (no technical jargon)

#### Scenario: AI analysis error handling
- **WHEN** OpenAI API call fails (network error, rate limit, timeout)
- **THEN** the system handles the error gracefully
- **AND** displays an appropriate error message to the user
- **AND** the page continues to function without AI insights
- **AND** retry logic is implemented for transient failures (max 2 retries)

### Requirement: AI Analysis API Route
The system SHALL provide an API route `/api/analyze` that accepts usage data and returns AI-generated insights.

#### Scenario: API route request
- **WHEN** a POST request is made to `/api/analyze` with usage data
- **THEN** the route validates the request body (checks for required fields)
- **AND** calls the AI analysis function with usage data
- **AND** returns structured insights as JSON response

#### Scenario: API route error handling
- **WHEN** the API route encounters an error
- **THEN** rate limiting errors return 429 status with retry-after header
- **AND** API errors return 500 status with error message
- **AND** request timeouts are handled (10-second timeout)

### Requirement: AI Insights Caching
The system SHALL cache AI-generated insights in session storage to avoid redundant API calls.

#### Scenario: Cache check
- **WHEN** usage data is available for analysis
- **THEN** the system checks session storage for cached insights
- **AND** cache key is based on usage data hash (total annual kWh + monthly breakdown signature)
- **AND** if cached insights exist, they are used instead of making an API call

#### Scenario: Cache storage
- **WHEN** AI insights are successfully generated
- **THEN** the insights are stored in session storage with the cache key
- **AND** the cache persists for the browser session

#### Scenario: Cache clearing
- **WHEN** a new CSV file is uploaded
- **THEN** the AI insights cache is cleared
- **AND** new analysis is performed for the new usage data

#### Scenario: Cache error handling
- **WHEN** session storage operations fail
- **THEN** the system falls back to making an API call
- **AND** errors are handled gracefully without breaking the page

### Requirement: AI Plan Recommendations
The system SHALL use OpenAI API (GPT-4o-mini) to generate personalized plan recommendations with explanations, pros/cons, and usage pattern badges.

#### Scenario: AI recommendation request
- **WHEN** top 3 plans are identified and usage data is available
- **THEN** the system calls OpenAI API to generate personalized plan recommendations
- **AND** the API request includes usage statistics summary, top 3 plan details (name, cost, features, pricing structure), and user preference (cost, flexibility, renewable)
- **AND** the request uses GPT-4o-mini model for cost-effective recommendations

#### Scenario: AI recommendation generation
- **WHEN** OpenAI API successfully processes the recommendation request
- **THEN** the system receives structured recommendations in JSON format
- **AND** each recommendation includes a personalized explanation of why the plan is recommended for the user's specific usage patterns
- **AND** each recommendation includes pros (advantages) and cons (disadvantages) specific to the user's situation
- **AND** each recommendation includes "Good for" badges (e.g., "night owl", "solar home", "high usage") based on usage patterns
- **AND** all explanations are written in plain language (no technical jargon)

#### Scenario: AI recommendation error handling
- **WHEN** OpenAI API call fails (network error, rate limit, timeout)
- **THEN** the system handles the error gracefully
- **AND** displays an appropriate error message to the user
- **AND** the page continues to function with fallback to cost-based labels
- **AND** retry logic is implemented for transient failures (max 2 retries)

### Requirement: AI Recommendations API Route
The system SHALL provide an API route `/api/recommendations` that accepts usage data, statistics, and top 3 plans and returns AI-generated recommendations.

#### Scenario: API route request
- **WHEN** a POST request is made to `/api/recommendations` with usage data, statistics, and top 3 plans
- **THEN** the route validates the request body (checks for required fields: statistics, plans array)
- **AND** calls the AI recommendation function with usage data, statistics, plans, and user preference
- **AND** returns structured recommendations as JSON response

#### Scenario: API route error handling
- **WHEN** the API route encounters an error
- **THEN** rate limiting errors return 429 status with retry-after header
- **AND** API errors return 500 status with error message
- **AND** request timeouts are handled (35-second timeout)

### Requirement: Parallel AI Calls
The system SHALL call both usage analysis and plan recommendations APIs in parallel to improve performance.

#### Scenario: Parallel execution
- **WHEN** usage data is available and statistics are calculated
- **THEN** the system calls both `/api/analyze` and `/api/recommendations` in parallel using `Promise.all()`
- **AND** both API calls execute simultaneously
- **AND** results are displayed as they complete (progressive disclosure)

#### Scenario: Partial failure handling
- **WHEN** one AI API call fails but the other succeeds
- **THEN** the system displays available results (analysis or recommendations)
- **AND** displays appropriate error message for the failed call
- **AND** the page continues to function with partial results

### Requirement: AI Recommendations Caching
The system SHALL cache AI-generated recommendations in session storage to avoid redundant API calls.

#### Scenario: Cache check
- **WHEN** top 3 plans are identified and usage data is available
- **THEN** the system checks session storage for cached recommendations
- **AND** cache key is based on usage data hash + user preference + top 3 plan IDs
- **AND** if cached recommendations exist, they are used instead of making an API call

#### Scenario: Cache storage
- **WHEN** AI recommendations are successfully generated
- **THEN** the recommendations are stored in session storage with the cache key
- **AND** the cache persists for the browser session

#### Scenario: Cache clearing
- **WHEN** a new CSV file is uploaded or user preference changes
- **THEN** the AI recommendations cache is cleared
- **AND** new recommendations are fetched for the new usage data or preference

#### Scenario: Cache error handling
- **WHEN** session storage operations fail
- **THEN** the system falls back to making an API call
- **AND** errors are handled gracefully without breaking the page

