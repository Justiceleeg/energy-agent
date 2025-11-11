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
- **THEN** a "Select to Compare" button is available
- **AND** clicking the button adds the plan to the selection (if not already selected and fewer than 3 plans are selected)
- **AND** clicking the button removes the plan from the selection (if already selected)
- **AND** the button text changes to "Deselect" when the plan is selected
- **AND** the button is disabled when 3 plans are selected and this plan is not selected

#### Scenario: Plan card selection state
- **WHEN** a plan is selected for comparison
- **THEN** the plan card displays visual indicators of selection (border, background color, checkmark icon)
- **AND** the selection state is synchronized across all plan display components (recommendations and grid)

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

### Requirement: Plan Selection State Management
The system SHALL allow users to select up to 3 plans for comparison and manage the selection state across all plan display components.

#### Scenario: Plan selection
- **WHEN** a user clicks "Select to Compare" on a plan card
- **THEN** the plan is added to the selection if fewer than 3 plans are selected
- **AND** the selection state is updated across all plan display components
- **AND** a selection counter displays the number of selected plans (X/3)

#### Scenario: Plan deselection
- **WHEN** a user clicks "Deselect" on a selected plan card
- **THEN** the plan is removed from the selection
- **AND** the selection state is updated across all plan display components
- **AND** the selection counter is updated

#### Scenario: Maximum selection limit
- **WHEN** 3 plans are already selected
- **THEN** all non-selected plan cards have disabled "Select to Compare" buttons
- **AND** users cannot select additional plans until they deselect one

#### Scenario: Default selection
- **WHEN** usage data is first available and costs are calculated
- **THEN** the top 3 recommended plans are automatically selected by default
- **AND** the selection can be modified by the user

### Requirement: Plan Comparison Chart
The system SHALL display an interactive comparison chart showing monthly cost breakdowns for selected plans.

#### Scenario: Chart display
- **WHEN** at least one plan is selected for comparison
- **THEN** a comparison chart section appears below the plan recommendations
- **AND** the chart displays monthly costs for all selected plans (up to 3)
- **AND** each plan is represented by a different color
- **AND** the chart shows all 12 months (January through December)

#### Scenario: Chart visualization
- **WHEN** viewing the comparison chart
- **THEN** the chart uses Recharts library for rendering
- **AND** displays monthly costs as a line chart by default
- **AND** shows interactive tooltips when hovering over data points
- **AND** tooltips display plan name, month name, and cost
- **AND** includes a legend showing plan names with corresponding colors

#### Scenario: Chart controls
- **WHEN** viewing the comparison chart
- **THEN** a "Clear Selection" button is available to reset selection to empty
- **AND** a toggle button allows switching between line chart and bar chart views
- **AND** the chart header displays annual totals for each selected plan
- **AND** all controls are styled to match the existing UI design system

#### Scenario: Chart responsiveness
- **WHEN** viewing the comparison chart on mobile devices
- **THEN** the chart is responsive and adapts to smaller screen sizes
- **AND** all controls remain accessible and functional
- **AND** tooltips and legend are readable on mobile

#### Scenario: Chart updates
- **WHEN** a plan is selected or deselected
- **THEN** the chart updates immediately to reflect the new selection
- **AND** monthly breakdown calculations are performed for newly selected plans
- **AND** the chart re-renders with the updated data

