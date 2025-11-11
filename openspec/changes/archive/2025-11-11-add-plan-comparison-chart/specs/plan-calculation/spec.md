## MODIFIED Requirements

### Requirement: Plan Cost Calculation
The system SHALL calculate the total cost for an energy plan based on user usage data, including energy charges, base charges, and TDU charges.

#### Scenario: Flat-rate calculation
- **WHEN** calculating cost for a flat-rate plan
- **THEN** the energy cost is calculated as `pricePerKWh × totalAnnualKwh`
- **AND** the result is returned in dollars

#### Scenario: Base charge calculation
- **WHEN** calculating cost for a plan with a base charge
- **THEN** the base charge is calculated as `baseCharge × 12` for annual cost
- **AND** the base charge is included in the total cost

#### Scenario: TDU charges included
- **WHEN** calculating total plan cost
- **THEN** TDU charges are added: `($4.50 × 12) + ($0.035 × totalAnnualKwh)` for annual cost
- **AND** TDU charges are included in both annual and monthly cost calculations

#### Scenario: Monthly cost calculation
- **WHEN** calculating monthly average cost
- **THEN** the monthly cost is calculated as `annualCost / 12`
- **AND** the result includes all charges (energy, base, TDU) divided by 12

#### Scenario: Cost breakdown provided
- **WHEN** calculating plan cost
- **THEN** the result includes a breakdown showing energy cost, base charges, TDU charges, and total cost
- **AND** the breakdown is available for both annual and monthly periods

### Requirement: Calculation Function Interface
The system SHALL provide a `calculatePlanCost()` function that accepts a plan and usage data and returns cost results.

#### Scenario: Function signature
- **WHEN** calling `calculatePlanCost(plan, usageData)`
- **THEN** the function accepts an `EnergyPlan` and `HourlyUsageData[]` or `UsageStatistics`
- **AND** returns a `PlanCostResult` with annualCost, monthlyCost, and cost breakdown

## ADDED Requirements

### Requirement: Monthly Breakdown Calculation
The system SHALL calculate per-month costs for an energy plan based on monthly usage data, accounting for seasonal variations in consumption.

#### Scenario: Monthly breakdown calculation
- **WHEN** calculating monthly breakdown for a plan
- **THEN** the function accepts an `EnergyPlan`, `HourlyUsageData[]`, and `UsageStatistics` as parameters
- **AND** groups hourly usage data by month (0-11, where January = 0)
- **AND** calculates total kWh consumption for each month
- **AND** calculates plan cost for each month using monthly kWh totals

#### Scenario: Monthly cost calculation
- **WHEN** calculating cost for a specific month
- **THEN** energy cost is calculated using the plan's pricing rules applied to that month's kWh
- **AND** base charges are calculated as `baseCharge` (monthly) for that month
- **AND** TDU charges are calculated as `$4.50 + ($0.035 × monthlyKwh)` for that month
- **AND** the total monthly cost includes all charges (energy, base, TDU)

#### Scenario: Monthly breakdown result
- **WHEN** calculating monthly breakdown
- **THEN** the function returns an array of monthly cost objects
- **AND** each object contains month index (0-11), month name (string), total kWh for that month, and total cost for that month
- **AND** the array contains 12 entries (one for each month)
- **AND** months with zero usage still have entries with zero cost

#### Scenario: Monthly breakdown function interface
- **WHEN** calling `calculateMonthlyBreakdown(plan, usageData, statistics)`
- **THEN** the function accepts an `EnergyPlan`, `HourlyUsageData[]`, and `UsageStatistics`
- **AND** returns an array of monthly cost objects with month index, month name, totalKWh, and cost
- **AND** handles edge cases (empty months, invalid data) gracefully

