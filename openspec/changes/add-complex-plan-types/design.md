## Context
The current system supports only simple flat-rate plans (20 plans). To provide a more comprehensive plan comparison, we need to support tiered pricing and bill credit plans. These are common in the energy market and can significantly impact costs for users with varying usage patterns.

## Goals / Non-Goals

### Goals
- Support tiered pricing plans (2-3 tiers) with different rates per tier
- Support bill credit plans with conditional credits based on usage thresholds
- Expand plan catalog from 20 to 50 plans (20 simple + 30 medium-complexity)
- Maintain calculation accuracy for all plan types
- Display pricing complexity clearly to users
- Enable filtering by plan complexity and other attributes

### Non-Goals
- Time-of-use (TOU) pricing (future slice)
- Seasonal pricing variations (future slice)
- Complex multi-rule combinations (future slice)
- Real-time plan data fetching (plans remain static JSON)

## Decisions

### Decision: Tiered Pricing Structure
**What**: Tiered pricing uses an array of tiers, each with a `maxKwh` (or `null` for unlimited) and `ratePerKwh`. Tiers are evaluated in order, and usage is allocated to each tier up to its maximum.

**Why**: This structure is common in energy markets and allows for clear calculation logic. The tier boundaries are inclusive (usage at exactly the tier boundary falls into that tier).

**Alternatives considered**:
- Cumulative tiers (each tier applies to all usage above threshold) - rejected because it's less intuitive
- Percentage-based tiers - rejected because it doesn't match real-world energy plan structures

**Example**:
```typescript
{
  type: "TIERED",
  tiers: [
    { maxKwh: 500, ratePerKwh: 0.10 },    // First 500 kWh at $0.10/kWh
    { maxKwh: 1000, ratePerKwh: 0.12 },   // Next 500 kWh (501-1000) at $0.12/kWh
    { maxKwh: null, ratePerKwh: 0.15 }    // All usage above 1000 kWh at $0.15/kWh
  ]
}
```

### Decision: Bill Credit Structure
**What**: Bill credits are conditional discounts applied when usage falls within a specific range. Credits are applied as negative costs (subtracted from total).

**Why**: Bill credits are a common way energy providers incentivize certain usage levels. The credit is a fixed dollar amount, not a percentage.

**Alternatives considered**:
- Percentage-based credits - rejected because fixed amounts are more common in real plans
- Multiple credit tiers - rejected for simplicity (can be added later if needed)

**Example**:
```typescript
{
  type: "BILL_CREDIT",
  amount: 25.00,      // $25 credit
  minKwh: 1000,       // Minimum 1000 kWh/month
  maxKwh: 2000        // Maximum 2000 kWh/month (null = unlimited)
}
```

### Decision: Plan Complexity Classification
**What**: Plans are classified as "simple" (flat-rate only), "medium" (tiered or bill credit), or "complex" (future: TOU, seasonal, etc.).

**Why**: Helps users understand pricing complexity and enables filtering. Classification is based on the most complex pricing rule in the plan.

**Alternatives considered**:
- No classification - rejected because users benefit from understanding complexity
- More granular classification (5+ levels) - rejected as over-engineering for current needs

### Decision: Calculation Approach
**What**: Tiered and bill credit calculations are performed monthly (not annually) to account for usage variations throughout the year.

**Why**: Monthly calculation ensures accuracy for plans where credits or tier thresholds are monthly-based. Annual totals are then summed from monthly calculations.

**Alternatives considered**:
- Annual calculation only - rejected because it doesn't accurately handle monthly thresholds
- Daily calculation - rejected as unnecessary complexity

### Decision: Plan Data Storage
**What**: Store all 50 plans in a single JSON file (`data/plans/plans.json` or extend `simple-plans.json`).

**Why**: Simpler to manage and load. All plans are static data, so no need for separate files.

**Alternatives considered**:
- Separate files for simple/medium/complex - rejected as unnecessary complexity
- Database storage - rejected because plans are static and demo doesn't need persistence

## Risks / Trade-offs

### Risk: Calculation Complexity
**Mitigation**: Implement thorough unit tests for tiered and bill credit calculations, especially edge cases (usage at tier boundaries, zero usage months).

### Risk: User Confusion with Complex Pricing
**Mitigation**: Clear visual indicators of complexity, tooltips explaining pricing structure, and simple language in plan descriptions.

### Risk: Performance with 50 Plans
**Mitigation**: Calculations are client-side JavaScript (fast), and we can implement virtual scrolling or pagination if needed. Initial implementation assumes 50 plans is manageable.

### Trade-off: Accuracy vs. Simplicity
We prioritize accuracy in calculations (monthly breakdown) over simplicity, even though it adds complexity to the calculation engine.

## Migration Plan

1. Extend types first (PricingRule union type)
2. Update calculation engine to handle new rule types
3. Add new plans to data file
4. Update UI components to display complexity
5. Add filtering functionality
6. Test with all sample CSV files

## Open Questions

- Should tiered plans show tier breakdown in the plan card, or only in tooltip? (Decision: Show in tooltip, complexity indicator on card)
- Should bill credits be shown as a separate line item in cost breakdown? (Decision: Yes, show in breakdown)
- How many tiers should we support? (Decision: 2-3 tiers for medium complexity, more in future if needed)

