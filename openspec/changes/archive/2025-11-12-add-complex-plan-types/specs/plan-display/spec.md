## MODIFIED Requirements

### Requirement: Plan Card Display
The system SHALL display individual plan information in a card component showing key details, costs, and pricing complexity.

#### Scenario: Plan card content
- **WHEN** displaying a plan card
- **THEN** the card shows plan name and provider name
- **AND** displays annual cost prominently
- **AND** displays monthly average cost
- **AND** shows renewable percentage and contract length as key features
- **AND** displays cost differential from cheapest plan (if not the cheapest)
- **AND** displays pricing complexity indicator badge (Simple, Medium, or Complex)

#### Scenario: Plan card interaction
- **WHEN** viewing a plan card
- **THEN** a "Select to Compare" button is available (placeholder for future comparison functionality)

#### Scenario: Plan card complexity display
- **WHEN** viewing a tiered pricing plan card
- **THEN** a tooltip or popover is available showing tier breakdown
- **AND** the tier structure is displayed in readable format (e.g., "First 500 kWh: $0.10/kWh, Next 500 kWh: $0.12/kWh, Above 1000 kWh: $0.15/kWh")

#### Scenario: Plan card bill credit display
- **WHEN** viewing a bill credit plan card
- **THEN** a tooltip or popover is available showing credit conditions
- **AND** the credit conditions are displayed in readable format (e.g., "$25 credit for usage between 1000-2000 kWh/month")

### Requirement: All Plans Grid
The system SHALL display all available plans in a grid layout with sorting and filtering capabilities.

#### Scenario: All plans displayed
- **WHEN** viewing the all plans section
- **THEN** all 50 plans are displayed as cards in a grid layout
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

## ADDED Requirements

### Requirement: Plan Filtering
The system SHALL provide filtering capabilities to help users find plans that match their preferences.

#### Scenario: Filter by complexity
- **WHEN** viewing the all plans grid
- **THEN** filtering controls are available
- **AND** users can filter by plan complexity (Simple, Medium, Complex)
- **AND** multiple complexity levels can be selected simultaneously
- **AND** the grid updates to show only plans matching selected complexity levels

#### Scenario: Filter by renewable percentage
- **WHEN** viewing the all plans grid
- **THEN** users can filter by renewable percentage
- **AND** a slider or range input allows selection of renewable percentage range (0-100%)
- **AND** the grid updates to show only plans within the selected range

#### Scenario: Filter by contract length
- **WHEN** viewing the all plans grid
- **THEN** users can filter by contract length
- **AND** checkboxes or buttons allow selection of contract lengths (6, 12, 24 months)
- **AND** multiple contract lengths can be selected simultaneously
- **AND** the grid updates to show only plans matching selected contract lengths

#### Scenario: Filter by price range
- **WHEN** viewing the all plans grid
- **THEN** users can filter by price range
- **AND** min/max sliders allow selection of annual cost range
- **AND** the grid updates to show only plans within the selected price range

#### Scenario: Multiple filters applied
- **WHEN** multiple filters are active simultaneously
- **THEN** all filters are applied together (AND logic)
- **AND** only plans matching all active filters are displayed
- **AND** filtering works correctly with sorting (filter first, then sort)

#### Scenario: Filter controls
- **WHEN** filters are active
- **THEN** active filter count is displayed or a "Clear Filters" button is available
- **AND** users can clear all filters to show all plans again

### Requirement: Plan Complexity Indicators
The system SHALL display visual indicators of pricing complexity to help users understand plan structures.

#### Scenario: Complexity badge display
- **WHEN** viewing plan cards
- **THEN** each plan card displays a complexity badge (Simple, Medium, or Complex)
- **AND** the badge is visually distinct and easy to identify
- **AND** complexity is derived from pricing rules (presence of TIERED or BILL_CREDIT indicates Medium complexity)

#### Scenario: Complexity tooltips
- **WHEN** viewing tiered pricing plans
- **THEN** hovering over or clicking the complexity indicator shows tier breakdown
- **AND** tier structure is displayed in clear, readable format

#### Scenario: Bill credit tooltips
- **WHEN** viewing bill credit plans
- **THEN** hovering over or clicking the complexity indicator shows credit conditions
- **AND** credit conditions are displayed in clear, readable format

