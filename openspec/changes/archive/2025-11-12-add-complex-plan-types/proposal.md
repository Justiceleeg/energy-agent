# Change: Add Complex Plan Types (Tiered & Bill Credits)

## Why
Users need access to a wider variety of energy plans beyond simple flat-rate pricing. Tiered pricing plans (where rates change based on usage thresholds) and bill credit plans (where credits are applied at certain usage levels) are common in the energy market. Supporting these plan types expands the plan catalog from 20 to 50 plans and provides more realistic cost comparisons for users with varying usage patterns.

## What Changes
- **ADDED**: Tiered pricing rule type (`TIERED`) with multiple usage tiers and different rates per tier
- **ADDED**: Bill credit pricing rule type (`BILL_CREDIT`) with conditional credits based on usage thresholds
- **ADDED**: 30 new medium-complexity plans (15 tiered pricing, 15 bill credit plans) to expand catalog to 50 total plans
- **MODIFIED**: Plan calculation engine to handle TIERED and BILL_CREDIT pricing rules
- **MODIFIED**: Plan types to include TIERED and BILL_CREDIT in PricingRule union type
- **MODIFIED**: Plan cards to display pricing complexity indicators, tier breakdowns, and bill credit conditions
- **ADDED**: Plan filtering by complexity (simple, medium, complex), renewable percentage, contract length, and price range

## Impact
- **Affected specs**: `plan-data` (new plan types and expanded catalog), `plan-calculation` (new calculation logic), `plan-display` (complexity indicators and filtering)
- **Affected code**:
  - Modified types: `lib/types/plans.ts` (extend PricingRule with TIERED and BILL_CREDIT)
  - Modified utilities: `lib/calculations/planCost.ts` (add TIERED and BILL_CREDIT handlers)
  - New data: `data/plans/medium-plans.json` (30 new plans) or extend existing file
  - Modified components: `components/features/PlanCard.tsx` (complexity indicators, tier breakdown, bill credit display)
  - Modified components: `components/features/PlanGrid.tsx` (add filtering controls)
  - Updated: `app/page.tsx` (load all 50 plans, apply filters)

