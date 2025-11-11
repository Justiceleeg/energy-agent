## ADDED Requirements

### Requirement: Plan Ranking by Cost
The system SHALL rank all plans by total annual cost to identify the most cost-effective options.

#### Scenario: Plans sorted by cost
- **WHEN** ranking plans for a user's usage data
- **THEN** all plans are sorted by total annual cost in ascending order (cheapest first)
- **AND** the ranking includes all 20 plans

#### Scenario: Top 3 identification
- **WHEN** ranking plans
- **THEN** the top 3 cheapest plans are identified
- **AND** these plans are marked as recommendations

#### Scenario: Savings calculation
- **WHEN** ranking plans
- **THEN** savings vs. the most expensive plan are calculated for each plan
- **AND** savings are expressed as dollar amounts and percentages

### Requirement: Recommendation Selection
The system SHALL provide a function to get the top recommended plans with explanations.

#### Scenario: Top recommendations returned
- **WHEN** requesting top recommendations
- **THEN** the function returns the top 3 cheapest plans
- **AND** each recommendation includes the plan, cost, savings amount, and a hardcoded explanation (e.g., "Lowest cost", "Best value", "Most renewable")

