# plan-display Specification

## Purpose
TBD - created by archiving change add-simple-plan-calculation. Update Purpose after archive.
## Requirements
### Requirement: Plan Card Display
The system SHALL display individual plan information in a card component showing key details and costs.

#### Scenario: Plan card content
- **WHEN** displaying a plan card
- **THEN** the card shows plan name and provider name
- **AND** displays annual cost prominently
- **AND** displays monthly average cost
- **AND** shows renewable percentage and contract length as key features
- **AND** displays cost differential from cheapest plan (if not the cheapest)

#### Scenario: Plan card interaction
- **WHEN** viewing a plan card
- **THEN** a "Select to Compare" button is available (placeholder for future comparison functionality)

### Requirement: Top Recommendations Section
The system SHALL display a dedicated section showing the top 3 recommended plans with explanations.

#### Scenario: Recommendations displayed
- **WHEN** usage data is available and costs are calculated
- **THEN** a "Top Recommendations" section appears
- **AND** displays the top 3 cheapest plans as cards
- **AND** each recommendation card shows why it was recommended (hardcoded explanation)
- **AND** savings amount is highlighted prominently

#### Scenario: Recommendations styling
- **WHEN** viewing recommendations
- **THEN** recommendation cards are visually distinct from regular plan cards
- **AND** the section is clearly labeled and positioned after usage insights

### Requirement: All Plans Grid
The system SHALL display all available plans in a grid layout with sorting capabilities.

#### Scenario: All plans displayed
- **WHEN** viewing the all plans section
- **THEN** all 20 plans are displayed as cards in a grid layout
- **AND** the grid is scrollable or paginated for better navigation

#### Scenario: Sorting functionality
- **WHEN** viewing the all plans grid
- **THEN** sorting controls are available
- **AND** plans can be sorted by cost (ascending/descending)
- **AND** plans can be sorted by renewable percentage

#### Scenario: Top recommendations highlighted
- **WHEN** viewing the all plans grid
- **THEN** the top 3 recommended plans are visually highlighted
- **AND** they remain highlighted regardless of sort order

### Requirement: Plan Display Integration
The system SHALL integrate plan display components into the main page flow after usage insights.

#### Scenario: Plan section appears
- **WHEN** usage data is uploaded and insights are displayed
- **THEN** a plan comparison section appears below the usage insights
- **AND** costs are calculated for all plans using the uploaded usage data
- **AND** the top recommendations section appears first
- **AND** the all plans grid appears below recommendations

#### Scenario: Loading and error states
- **WHEN** calculating plan costs
- **THEN** appropriate loading states are shown
- **AND** error states are handled gracefully if calculation fails

