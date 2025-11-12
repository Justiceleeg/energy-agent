## MODIFIED Requirements

### Requirement: AI Usage Pattern Analysis
The system SHALL use OpenAI API (GPT-4o-mini) to analyze usage data and generate personalized insights about energy consumption patterns.

#### Scenario: AI insights generation
- **WHEN** OpenAI API successfully processes the usage data
- **THEN** the system receives structured insights in JSON format
- **AND** insights include peak usage time patterns (hour of day, day of week)
- **AND** insights include seasonal trends (summer vs winter, monthly variations)
- **AND** insights include actionable recommendations for optimizing energy usage
- **AND** insights include recommendations for time-of-use plans if usage patterns align (e.g., "Your peak usage is at night, making TOU plans with free nights ideal")
- **AND** insights include recommendations for seasonal plans if usage patterns show significant seasonal variation
- **AND** all insights are written in plain language (no technical jargon)

### Requirement: AI Plan Recommendations
The system SHALL use OpenAI API (GPT-4o-mini) to generate personalized plan recommendations with explanations, pros/cons, and usage pattern badges.

#### Scenario: AI recommendation request
- **WHEN** top 3 plans are identified and usage data is available
- **THEN** the system calls OpenAI API to generate personalized plan recommendations
- **AND** the API request includes usage statistics summary, top 3 plan details (name, cost, features, pricing structure including TOU/seasonal information), and user preference (cost, flexibility, renewable)
- **AND** for TOU plans, the request includes TOU schedule details (peak/off-peak times, rates)
- **AND** for seasonal plans, the request includes seasonal rate modifiers and affected months
- **AND** the request uses GPT-4o-mini model for cost-effective recommendations

#### Scenario: AI recommendation generation
- **WHEN** OpenAI API successfully processes the recommendation request
- **THEN** the system receives structured recommendations in JSON format
- **AND** each recommendation includes a personalized explanation of why the plan is recommended for the user's specific usage patterns
- **AND** for TOU plans, explanations reference time-of-use alignment (e.g., "This plan's free nights match your peak evening usage")
- **AND** for seasonal plans, explanations reference seasonal usage patterns (e.g., "This plan's summer premium aligns with your low summer usage")
- **AND** each recommendation includes pros (advantages) and cons (disadvantages) specific to the user's situation
- **AND** each recommendation includes "Good for" badges (e.g., "night owl", "solar home", "high usage", "seasonal") based on usage patterns
- **AND** recommendations for TOU plans include guidance on shifting usage to optimize costs
- **AND** recommendations for seasonal plans include guidance on seasonal usage patterns
- **AND** all explanations are written in plain language (no technical jargon)

