# plan-data Specification

## Purpose
TBD - created by archiving change add-simple-plan-calculation. Update Purpose after archive.
## Requirements
### Requirement: Simple Flat-Rate Plan Data
The system SHALL provide a collection of energy plans for cost comparison, including simple flat-rate plans and medium-complexity plans with tiered pricing and bill credits.

#### Scenario: Plans available for calculation
- **WHEN** the application loads
- **THEN** 50 energy plans are available from plan data files
- **AND** the collection includes 20 simple flat-rate plans
- **AND** the collection includes 15 tiered pricing plans (2-3 tiers each)
- **AND** the collection includes 15 bill credit plans (conditional credits at usage thresholds)
- **AND** each plan includes provider name, plan name, pricing rules, renewable percentage, and contract length

#### Scenario: Plan variety
- **WHEN** examining the plan collection
- **THEN** plans include at least 5 different providers
- **AND** simple plans have rates ranging from 10¢ to 18¢ per kWh
- **AND** tiered plans have 2-3 tiers with varying rate structures
- **AND** bill credit plans have credits ranging from $10 to $50
- **AND** renewable percentages vary from 0% to 100%
- **AND** contract lengths include 6, 12, and 24 months

### Requirement: Plan Data Structure
The system SHALL use a consistent data structure for energy plans that supports flat-rate pricing, tiered pricing, bill credits, base charges, and plan features.

#### Scenario: Plan structure validation
- **WHEN** loading plan data
- **THEN** each plan has a unique `id`, `name`, `provider`, `pricing` (array of pricing rules), optional `baseCharge`, `renewablePercent` (0-100), and `contractLength` (months)
- **AND** the pricing structure matches the `EnergyPlan` type definition
- **AND** pricing rules can be `FLAT_RATE`, `BASE_CHARGE`, `TIERED`, or `BILL_CREDIT`

### Requirement: Tiered Pricing Plan Data
The system SHALL provide tiered pricing plans where rates vary based on usage thresholds.

#### Scenario: Tiered plan structure
- **WHEN** loading a tiered pricing plan
- **THEN** the plan includes a `TIERED` pricing rule with a `tiers` array
- **AND** each tier has a `maxKwh` (number or null for unlimited) and `ratePerKwh` (number)
- **AND** tiers are ordered from lowest to highest threshold
- **AND** the final tier can have `maxKwh: null` to indicate unlimited usage

#### Scenario: Tiered plan variety
- **WHEN** examining tiered plans
- **THEN** plans include 2-3 tiers each
- **AND** tier structures vary (some with lower first tier rates, some with higher first tier rates)
- **AND** some plans have unlimited final tiers, some have capped final tiers

### Requirement: Bill Credit Plan Data
The system SHALL provide bill credit plans where conditional credits are applied based on usage thresholds.

#### Scenario: Bill credit plan structure
- **WHEN** loading a bill credit plan
- **THEN** the plan includes a `BILL_CREDIT` pricing rule with `amount` (dollar amount), `minKwh` (minimum usage), and `maxKwh` (maximum usage or null for unlimited)
- **AND** the credit is applied when usage falls within the specified range

#### Scenario: Bill credit plan variety
- **WHEN** examining bill credit plans
- **THEN** plans include credits ranging from $10 to $50
- **AND** credit thresholds vary (some for low usage, some for high usage, some for mid-range)
- **AND** some plans have unlimited maxKwh (maxKwh: null) for credits

