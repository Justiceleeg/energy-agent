# plan-data Specification

## Purpose
TBD - created by archiving change add-simple-plan-calculation. Update Purpose after archive.
## Requirements
### Requirement: Simple Flat-Rate Plan Data
The system SHALL provide a collection of 20 simple flat-rate energy plans for cost comparison.

#### Scenario: Plans available for calculation
- **WHEN** the application loads
- **THEN** 20 flat-rate energy plans are available from `data/plans/simple-plans.json`
- **AND** each plan includes provider name, plan name, flat rate per kWh, optional base charge, renewable percentage, and contract length

#### Scenario: Plan variety
- **WHEN** examining the plan collection
- **THEN** plans include at least 5 different providers
- **AND** rates range from 10¢ to 18¢ per kWh
- **AND** some plans have base charges and some do not
- **AND** renewable percentages vary from 0% to 100%
- **AND** contract lengths include 6, 12, and 24 months

### Requirement: Plan Data Structure
The system SHALL use a consistent data structure for energy plans that supports flat-rate pricing, base charges, and plan features.

#### Scenario: Plan structure validation
- **WHEN** loading plan data
- **THEN** each plan has a unique `id`, `name`, `provider`, `pricing` (flat-rate), optional `baseCharge`, `renewablePercent` (0-100), and `contractLength` (months)
- **AND** the pricing structure matches the `EnergyPlan` type definition

