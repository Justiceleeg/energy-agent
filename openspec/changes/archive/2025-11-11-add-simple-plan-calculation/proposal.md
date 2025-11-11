# Change: Add Simple Plan Calculation (Flat-Rate Only)

## Why
Users need to see cost comparisons across multiple energy plans to make informed decisions. After uploading their usage data, they should be able to view calculated costs for different plans, see recommendations, and compare options. This slice focuses on simple flat-rate plans as the foundation for more complex pricing structures in future slices.

## What Changes
- **ADDED**: 20 simple flat-rate energy plans with variety in rates (10¢-18¢/kWh), base charges, renewable percentages (0-100%), and contract lengths (6, 12, 24 months)
- **ADDED**: Plan cost calculation engine that handles FLAT_RATE and BASE_CHARGE pricing rules, calculates annual and monthly costs, and adds TDU charges
- **ADDED**: Plan ranking logic that sorts plans by total cost, identifies top 3 cheapest plans, and calculates savings
- **ADDED**: Plan display UI components including plan cards, top 3 recommendations section, and all plans grid with sorting
- **MODIFIED**: Energy plan types to support base charges and additional features (renewable percentage, contract length)

## Impact
- **Affected specs**: New capabilities `plan-data`, `plan-calculation`, `plan-ranking`, and `plan-display` added
- **Affected code**:
  - Modified types: `lib/types/plans.ts` (extend EnergyPlan with baseCharge, renewablePercent, contractLength)
  - New data: `data/plans/simple-plans.json` (20 flat-rate plans)
  - New utilities: `lib/calculations/planCost.ts` (calculatePlanCost function)
  - New utilities: `lib/calculations/planRanking.ts` (rank plans, identify top 3, calculate savings)
  - New components: `components/features/PlanCard.tsx`, `components/features/PlanRecommendations.tsx`, `components/features/PlanGrid.tsx`
  - Updated: `app/page.tsx` (add plan comparison section after usage insights)

