## ADDED Requirements

### Requirement: Time-of-Use Schedule Display
The system SHALL display time-of-use pricing schedules in a clear, understandable format showing rates by time of day and day of week.

#### Scenario: TOU schedule in plan card
- **WHEN** viewing a TOU plan card
- **THEN** a tooltip or popover is available showing the TOU schedule
- **AND** the schedule is displayed as a readable format (e.g., "Free nights 10pm-6am, Peak 2pm-7pm weekdays: $0.15/kWh, Off-peak: $0.10/kWh")
- **AND** the complexity badge shows "Complex" for TOU plans

#### Scenario: TOU schedule in plan details modal
- **WHEN** opening the plan details modal for a TOU plan
- **THEN** a detailed TOU schedule section is displayed
- **AND** shows a rate calendar or time-of-day chart visualizing when different rates apply
- **AND** displays rate breakdown by hour and day of week in a table or grid format
- **AND** highlights peak, off-peak, and free periods with distinct colors or labels

### Requirement: Seasonal Rate Display
The system SHALL display seasonal pricing information showing which months have modified rates and the applicable rate modifiers.

#### Scenario: Seasonal rates in plan card
- **WHEN** viewing a seasonal plan card
- **THEN** a tooltip or popover is available showing seasonal rate information
- **AND** the seasonal information is displayed in readable format (e.g., "Summer premium (June-Aug): +20%, Winter discount (Dec-Feb): -10%")
- **AND** the complexity badge shows "Complex" for seasonal plans

#### Scenario: Seasonal calendar in plan details modal
- **WHEN** opening the plan details modal for a seasonal plan
- **THEN** a seasonal rate calendar section is displayed
- **AND** shows a 12-month calendar highlighting months with rate modifiers
- **AND** displays the rate modifier (e.g., "+20%", "-10%", "1.2x") for each affected month
- **AND** shows the effective rate for each month (base rate × modifier)

### Requirement: Advanced Plan Details Modal
The system SHALL provide a detailed modal component for viewing comprehensive plan information, including TOU schedules, seasonal calendars, and usage optimization tips.

#### Scenario: Plan details modal display
- **WHEN** a user clicks a "View Details" or similar button on a plan card
- **THEN** a modal opens displaying comprehensive plan information
- **AND** shows all pricing rules in detail (flat-rate, tiered, TOU, seasonal, bill credits)
- **AND** displays TOU schedule visualization for TOU plans
- **AND** displays seasonal rate calendar for seasonal plans
- **AND** shows plan features (renewable percentage, contract length, etc.)
- **AND** includes a "Close" button to dismiss the modal

#### Scenario: Usage optimization tips
- **WHEN** viewing plan details for a TOU plan
- **THEN** the modal displays "Best times to use energy" recommendations
- **AND** recommendations are based on the TOU schedule (e.g., "Shift usage to 10pm-6am for free rates")
- **AND** recommendations are displayed in plain language

#### Scenario: Plan details modal for seasonal plans
- **WHEN** viewing plan details for a seasonal plan
- **THEN** the modal displays seasonal rate breakdown
- **AND** shows which months have higher/lower rates
- **AND** provides guidance on seasonal usage patterns (e.g., "This plan is best for users with low summer usage")

### Requirement: TOU Impact on Monthly Chart
The system SHALL display time-of-use impact on monthly cost breakdowns in the comparison chart.

#### Scenario: TOU tooltip in chart
- **WHEN** hovering over a monthly data point for a TOU plan in the comparison chart
- **THEN** the tooltip displays the month name, plan name, and total cost
- **AND** shows additional information about TOU rates applied (e.g., "Peak hours: 150 kWh @ $0.15/kWh, Off-peak: 450 kWh @ $0.10/kWh")
- **AND** highlights months where TOU schedules significantly impact costs

#### Scenario: Seasonal highlighting in chart
- **WHEN** viewing the comparison chart for seasonal plans
- **THEN** months with seasonal rate modifiers are visually highlighted
- **AND** tooltips show the seasonal modifier applied (e.g., "Summer premium: +20%")
- **AND** the chart clearly shows cost variations due to seasonal pricing

## MODIFIED Requirements

### Requirement: Plan Complexity Indicators
The system SHALL display visual indicators of pricing complexity to help users understand plan structures.

#### Scenario: Complexity badge display
- **WHEN** viewing plan cards
- **THEN** each plan card displays a complexity badge (Simple, Medium, or Complex)
- **AND** the badge is visually distinct and easy to identify
- **AND** complexity is derived from pricing rules: "simple" (flat-rate only), "medium" (tiered or bill credit), "complex" (TOU or seasonal)

#### Scenario: Complexity tooltips for TOU plans
- **WHEN** viewing time-of-use plan cards
- **THEN** hovering over or clicking the complexity indicator shows TOU schedule summary
- **AND** the schedule is displayed in clear, readable format
- **AND** highlights key features (e.g., "Free nights", "Peak hours")

#### Scenario: Complexity tooltips for seasonal plans
- **WHEN** viewing seasonal plan cards
- **THEN** hovering over or clicking the complexity indicator shows seasonal rate summary
- **AND** seasonal information is displayed in clear, readable format
- **AND** highlights affected months and rate modifiers

### Requirement: All Plans Grid
The system SHALL display all available plans in a grid layout with sorting and filtering capabilities.

#### Scenario: All plans displayed
- **WHEN** viewing the all plans section
- **THEN** all 80 plans are displayed as cards in a grid layout
- **AND** the grid is scrollable or paginated for better navigation
- **AND** TOU and seasonal plans are clearly marked with complexity badges

