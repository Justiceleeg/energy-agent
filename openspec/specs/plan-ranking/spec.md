# plan-ranking Specification

## Purpose
TBD - created by archiving change add-simple-plan-calculation. Update Purpose after archive.
## Requirements
### Requirement: Plan Ranking by Cost
The system SHALL rank all plans by total annual cost or by user preference (cost, flexibility, renewable) to identify the most suitable options.

#### Scenario: Plans sorted by cost
- **WHEN** ranking plans for a user's usage data with preference set to "cost"
- **THEN** all plans are sorted by total annual cost in ascending order (cheapest first)
- **AND** the ranking includes all plans

#### Scenario: Plans sorted by flexibility
- **WHEN** ranking plans for a user's usage data with preference set to "flexibility"
- **THEN** plans are sorted first by flexibility rating (high > medium > low)
- **AND** plans with the same flexibility rating are sorted by total annual cost (ascending)
- **AND** the ranking includes all plans

#### Scenario: Plans sorted by renewable
- **WHEN** ranking plans for a user's usage data with preference set to "renewable"
- **THEN** plans are sorted first by renewable percentage in descending order (highest first)
- **AND** plans with the same renewable percentage are sorted by total annual cost (ascending)
- **AND** the ranking includes all plans

#### Scenario: Top 3 identification
- **WHEN** ranking plans
- **THEN** the top 3 plans based on the selected preference are identified
- **AND** these plans are marked as recommendations

#### Scenario: Savings calculation
- **WHEN** ranking plans
- **THEN** savings vs. the most expensive plan are calculated for each plan
- **AND** savings are expressed as dollar amounts and percentages

### Requirement: Recommendation Selection
The system SHALL provide a function to get the top recommended plans based on user preference.

#### Scenario: Top recommendations returned
- **WHEN** requesting top recommendations with preference "cost"
- **THEN** the function returns the top 3 cheapest plans
- **AND** each recommendation includes the plan, cost, and savings amount

#### Scenario: Top recommendations with flexibility preference
- **WHEN** requesting top recommendations with preference "flexibility"
- **THEN** the function returns the top 3 plans with highest flexibility ratings (then by cost)
- **AND** each recommendation includes the plan, cost, and savings amount

#### Scenario: Top recommendations with renewable preference
- **WHEN** requesting top recommendations with preference "renewable"
- **THEN** the function returns the top 3 plans with highest renewable percentages (then by cost)
- **AND** each recommendation includes the plan, cost, and savings amount

#### Scenario: Preference change triggers re-ranking
- **WHEN** user changes preference (cost, flexibility, renewable)
- **THEN** plans are re-ranked based on the new preference
- **AND** new top 3 recommendations are identified
- **AND** AI recommendations are re-fetched with the new top 3 plans

### Requirement: User Preference Selection
The system SHALL allow users to select a preference (cost, flexibility, renewable) that influences plan ranking and recommendations.

#### Scenario: Preference selector displayed
- **WHEN** usage data is available and costs are calculated
- **THEN** a preference selector is displayed in the recommendations section
- **AND** three options are available: Cost (default), Flexibility, Renewable
- **AND** the active preference is clearly indicated

#### Scenario: Preference selection
- **WHEN** user selects a different preference
- **THEN** the preference state is updated
- **AND** plans are re-ranked based on the new preference
- **AND** new top 3 recommendations are identified
- **AND** AI recommendations are re-fetched with the new top 3 plans

#### Scenario: Default preference
- **WHEN** usage data is first available
- **THEN** preference defaults to "cost" (cost-optimized)
- **AND** plans are ranked by cost initially

