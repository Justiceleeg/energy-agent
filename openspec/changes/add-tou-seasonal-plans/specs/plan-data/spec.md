## ADDED Requirements

### Requirement: Time-of-Use Plan Data
The system SHALL provide time-of-use (TOU) energy plans where rates vary based on the hour of day and day of week.

#### Scenario: TOU plan structure
- **WHEN** loading a time-of-use plan
- **THEN** the plan includes a `TIME_OF_USE` pricing rule with a `schedule` array
- **AND** each schedule entry has `hours` (array of 0-23), `daysOfWeek` (array of 0-6, where 0=Sunday), and `ratePerKwh` (number)
- **AND** schedule entries are evaluated in order, with the first matching entry applied
- **AND** at least one schedule entry must match all hours and days (default rate)

#### Scenario: TOU plan variety
- **WHEN** examining time-of-use plans
- **THEN** the collection includes 15 TOU plans
- **AND** plans include free nights/weekends patterns (e.g., free 10pm-6am, free weekends)
- **AND** plans include peak/off-peak patterns (e.g., higher rates 2pm-7pm weekdays)
- **AND** plans include mixed patterns (e.g., free nights + peak afternoons)
- **AND** rates vary from 5¢ to 25¢ per kWh depending on schedule

#### Scenario: TOU plan with base rate
- **WHEN** loading a TOU plan
- **THEN** the plan may include a `FLAT_RATE` rule as a base rate
- **AND** TOU schedule entries override the base rate for matching hours/days
- **AND** if no schedule entry matches, the base rate (or default rate) is applied

### Requirement: Seasonal Plan Data
The system SHALL provide seasonal energy plans where rates vary based on the month of the year.

#### Scenario: Seasonal plan structure
- **WHEN** loading a seasonal plan
- **THEN** the plan includes a `SEASONAL` pricing rule with `months` (array of 1-12) and `rateModifier` (number multiplier)
- **AND** the rate modifier is applied to the base rate (from FLAT_RATE or other pricing rules)
- **AND** months are specified as 1-12 (January=1, December=12)
- **AND** the plan must include a base rate (FLAT_RATE or TIERED) that the modifier applies to

#### Scenario: Seasonal plan variety
- **WHEN** examining seasonal plans
- **THEN** the collection includes 15 seasonal plans
- **AND** plans include summer premium patterns (higher rates June-August)
- **AND** plans include winter premium patterns (higher rates December-February)
- **AND** plans include shoulder season discounts (lower rates in spring/fall)
- **AND** rate modifiers range from 0.8x to 1.3x the base rate

#### Scenario: Seasonal plan with multiple modifiers
- **WHEN** loading a seasonal plan
- **THEN** the plan may include multiple `SEASONAL` rules for different month groups
- **AND** each seasonal rule applies its modifier to the base rate for its specified months
- **AND** seasonal rules are evaluated in order, with later rules overriding earlier ones for overlapping months

### Requirement: Expanded Plan Catalog
The system SHALL provide 80 total energy plans, including the existing 50 plans plus 30 new complex plans.

#### Scenario: Plan catalog size
- **WHEN** the application loads
- **THEN** 80 energy plans are available from plan data files
- **AND** the collection includes 20 simple flat-rate plans
- **AND** the collection includes 15 tiered pricing plans
- **AND** the collection includes 15 bill credit plans
- **AND** the collection includes 15 time-of-use plans
- **AND** the collection includes 15 seasonal plans

#### Scenario: Plan data structure validation
- **WHEN** loading plan data
- **THEN** TOU plans have `TIME_OF_USE` pricing rules with valid schedule structures
- **AND** seasonal plans have `SEASONAL` pricing rules with valid month arrays and rate modifiers
- **AND** all plans maintain unique IDs and consistent structure
- **AND** pricing rules can be `FLAT_RATE`, `BASE_CHARGE`, `TIERED`, `BILL_CREDIT`, `TIME_OF_USE`, or `SEASONAL`

