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

