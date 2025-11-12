# Design: Time-of-Use & Seasonal Plans

## Context
The system currently supports simple flat-rate plans and medium-complexity plans (tiered pricing, bill credits). Users with time-sensitive usage patterns (night owls, solar homes) or seasonal variations (high summer AC usage) would benefit from time-of-use (TOU) and seasonal pricing plans. These plans require matching hourly usage data to pricing schedules and calculating costs based on when energy is consumed, not just how much.

## Goals / Non-Goals

### Goals
- Support time-of-use pricing with schedules defined by hours (0-23) and days of week (0-6)
- Support seasonal pricing with rate modifiers for specific months (1-12)
- Calculate costs accurately by matching hourly usage data to TOU schedules
- Display TOU schedules and seasonal calendars in an understandable format
- Provide AI recommendations that consider TOU/seasonal suitability
- Expand plan catalog from 50 to 80 plans

### Non-Goals
- Real-time rate changes (rates are fixed per plan)
- Multiple TOU schedules per plan (one schedule per plan)
- Custom user-defined TOU schedules (schedules are plan-defined)
- Daylight saving time adjustments (assume standard time zones)
- Historical rate tracking (rates are current only)

## Decisions

### Decision: TOU Schedule Structure
**What**: TOU schedules use an array of schedule entries, each defining hours, days of week, and rate.
**Why**: Flexible enough to support common patterns (free nights, peak/off-peak, weekend rates) while remaining simple to calculate.
**Alternatives considered**:
- Separate peak/off-peak fields: Less flexible for complex schedules
- Hour-by-hour rate array: Too verbose and hard to maintain
- Rule-based DSL: Over-engineered for current needs

### Decision: Seasonal Rate Modifiers
**What**: Seasonal pricing uses a rate modifier (multiplier) applied to a base rate, with months specified as 1-12.
**Why**: Allows seasonal plans to build on existing flat-rate or tiered structures, keeping calculation logic simpler.
**Alternatives considered**:
- Separate seasonal rates: More flexible but requires base rate definition
- Month-by-month rate array: More verbose, similar flexibility
- Date range-based: More complex, not needed for monthly granularity

### Decision: Hourly Usage Data Matching
**What**: TOU calculations match each hour of usage data to the appropriate schedule entry based on hour (0-23) and day of week (0-6, Sunday=0).
**Why**: Accurate cost calculation requires knowing when energy was consumed, not just how much.
**Alternatives considered**:
- Average hourly patterns: Less accurate, doesn't account for daily variations
- Monthly aggregation: Too coarse for TOU schedules that vary by hour
- Real-time matching: Not applicable for historical usage data

### Decision: Complexity Classification
**What**: Plans with TIME_OF_USE or SEASONAL rules are classified as "complex".
**Why**: These plans require more sophisticated calculation and are harder for users to understand, warranting a distinct complexity level.
**Alternatives considered**:
- Keep as "medium": Doesn't distinguish from tiered/bill credit plans
- New "advanced" level: Unnecessary, "complex" is sufficient

### Decision: Plan Details Modal
**What**: Create a dedicated modal component for advanced plan details showing TOU schedules, seasonal calendars, and usage optimization tips.
**Why**: TOU/seasonal information is too detailed for plan cards but important for user decision-making.
**Alternatives considered**:
- Expand plan card tooltips: Too much information, poor UX
- Separate page: Overkill, modal is sufficient
- Inline expansion: Clutters the grid view

## Risks / Trade-offs

### Risk: Calculation Performance
**Risk**: Matching 8,760 hourly data points to TOU schedules could be slow.
**Mitigation**: Calculations run client-side but are performed once per plan. Use efficient array lookups and avoid nested loops where possible. Consider memoization if performance becomes an issue.

### Risk: TOU Schedule Complexity
**Risk**: Users may find TOU schedules confusing or hard to understand.
**Mitigation**: Provide clear visualizations (rate calendars, time-of-day charts) and AI-generated explanations that translate schedules into plain language.

### Risk: Seasonal Rate Application
**Risk**: Seasonal modifiers need to work correctly with other pricing rules (flat-rate, tiered).
**Mitigation**: Apply seasonal modifiers after calculating base energy cost, ensuring they work with any underlying pricing structure.

### Trade-off: Accuracy vs. Simplicity
**Trade-off**: Full hourly matching is more accurate but more complex than monthly aggregation.
**Decision**: Prioritize accuracy for TOU plans since they're specifically designed for time-sensitive usage patterns.

## Migration Plan

1. **Add new pricing rule types** to `PricingRule` union type
2. **Extend calculation functions** to handle new rule types
3. **Add new plan data** with TOU/seasonal plans
4. **Update complexity classification** to mark new plans as "complex"
5. **Add UI components** for displaying TOU/seasonal information
6. **Update AI prompts** to include TOU/seasonal context
7. **Test with sample CSVs** to verify calculations

No breaking changes - existing plans and calculations remain unchanged.

## Open Questions

- Should TOU schedules support holidays or special days? (Defer to future if needed)
- Should seasonal plans support partial month modifiers? (No - monthly granularity is sufficient)
- How should we handle plans with both TOU and seasonal rules? (Support both, apply seasonal to TOU rates)

