## ADDED Requirements

### Requirement: Time-of-Use Pricing Calculation
The system SHALL calculate costs for time-of-use (TOU) pricing plans by matching hourly usage data to TOU schedules and applying the appropriate rate for each hour.

#### Scenario: TOU calculation with hourly matching
- **WHEN** calculating cost for a TOU plan
- **THEN** the function accepts hourly usage data (`HourlyUsageData[]`) as input
- **AND** for each hour of usage data, the system matches the hour (0-23) and day of week (0-6, Sunday=0) to the appropriate TOU schedule entry
- **AND** the cost for each hour is calculated as `hourlyKwh × matchingRatePerKwh`
- **AND** total energy cost is the sum of costs across all hours

#### Scenario: TOU schedule matching
- **WHEN** matching an hour to a TOU schedule
- **THEN** schedule entries are evaluated in order
- **AND** the first entry where the hour is in `hours` array and day of week is in `daysOfWeek` array is used
- **AND** if no entry matches, a default rate is used (last entry in schedule or base rate if available)

#### Scenario: TOU calculation monthly
- **WHEN** calculating TOU costs
- **THEN** calculation is performed hourly (not monthly) to accurately account for time-based rates
- **AND** monthly costs are summed from hourly calculations
- **AND** annual cost is the sum of monthly costs

#### Scenario: TOU with base rate
- **WHEN** calculating cost for a TOU plan with a base `FLAT_RATE` rule
- **THEN** the base rate serves as the default rate for hours not matching any TOU schedule entry
- **AND** TOU schedule entries override the base rate for matching hours

### Requirement: Seasonal Pricing Calculation
The system SHALL calculate costs for seasonal pricing plans by applying rate modifiers to base rates based on the month of usage.

#### Scenario: Seasonal calculation with monthly modifiers
- **WHEN** calculating cost for a seasonal plan
- **THEN** the function groups hourly usage data by month (0-11, where January=0)
- **AND** for each month, the system identifies applicable `SEASONAL` rules where the month (converted to 1-12) is in the `months` array
- **AND** the base energy cost for the month is calculated using existing pricing rules (FLAT_RATE, TIERED, etc.)
- **AND** the seasonal rate modifier is applied to the base cost: `monthlyCost × rateModifier`
- **AND** total annual cost is the sum of modified monthly costs

#### Scenario: Seasonal modifier application
- **WHEN** applying seasonal modifiers
- **THEN** if multiple `SEASONAL` rules match the same month, the last matching rule's modifier is applied
- **AND** if no `SEASONAL` rule matches a month, the base rate is used without modification
- **AND** modifiers are applied after calculating base energy cost (not to individual kWh rates)

#### Scenario: Seasonal with tiered pricing
- **WHEN** calculating cost for a seasonal plan with `TIERED` base pricing
- **THEN** monthly tiered costs are calculated first
- **AND** seasonal modifiers are then applied to the monthly tiered cost total
- **AND** the modifier affects the total monthly cost, not individual tier rates

### Requirement: Combined TOU and Seasonal Calculation
The system SHALL support plans that combine both time-of-use and seasonal pricing rules.

#### Scenario: TOU with seasonal modifiers
- **WHEN** calculating cost for a plan with both `TIME_OF_USE` and `SEASONAL` rules
- **THEN** hourly TOU rates are calculated first
- **AND** hourly costs are grouped by month
- **AND** seasonal modifiers are applied to monthly TOU cost totals
- **AND** annual cost is the sum of modified monthly costs

## MODIFIED Requirements

### Requirement: Plan Cost Calculation
The system SHALL calculate the total cost for an energy plan based on user usage data, including energy charges, base charges, TDU charges, and bill credits.

#### Scenario: Function signature
- **WHEN** calling `calculatePlanCost(plan, usageData)`
- **THEN** the function accepts an `EnergyPlan` and `HourlyUsageData[]` or `UsageStatistics`
- **AND** returns a `PlanCostResult` with annualCost, monthlyCost, and cost breakdown
- **AND** handles all pricing rule types: FLAT_RATE, BASE_CHARGE, TIERED, BILL_CREDIT, TIME_OF_USE, and SEASONAL

### Requirement: Monthly Breakdown Calculation
The system SHALL calculate per-month costs for an energy plan based on monthly usage data, accounting for seasonal variations in consumption and time-of-use schedules.

#### Scenario: Monthly breakdown calculation
- **WHEN** calculating monthly breakdown for a plan
- **THEN** the function accepts an `EnergyPlan`, `HourlyUsageData[]`, and `UsageStatistics` as parameters
- **AND** groups hourly usage data by month (0-11, where January = 0)
- **AND** for TOU plans, calculates monthly costs by matching hourly data to TOU schedules
- **AND** for seasonal plans, applies seasonal modifiers to monthly base costs
- **AND** calculates plan cost for each month using monthly kWh totals and applicable pricing rules

#### Scenario: Monthly cost calculation with TOU
- **WHEN** calculating cost for a specific month with TOU pricing
- **THEN** hourly usage data for that month is matched to TOU schedule entries
- **AND** hourly costs are calculated using matching rates
- **AND** monthly cost is the sum of hourly costs for that month
- **AND** base charges and TDU charges are added to the monthly total

#### Scenario: Monthly cost calculation with seasonal
- **WHEN** calculating cost for a specific month with seasonal pricing
- **THEN** base energy cost is calculated for that month using underlying pricing rules
- **AND** applicable seasonal modifiers are identified for that month
- **AND** seasonal modifier is applied to the base monthly cost
- **AND** base charges and TDU charges are added to the modified monthly total

