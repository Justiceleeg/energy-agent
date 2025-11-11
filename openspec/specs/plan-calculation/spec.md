# plan-calculation Specification

## Purpose
TBD - created by archiving change add-simple-plan-calculation. Update Purpose after archive.
## Requirements
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

