# Change: Add Plan Comparison Chart

## Why
Users need to visually compare multiple energy plans side-by-side to understand cost variations throughout the year. After viewing recommendations and all plans, users should be able to select up to 3 plans and see a monthly cost breakdown chart that helps them understand seasonal cost differences and make informed decisions.

## What Changes
- **ADDED**: Plan selection state management allowing users to select/deselect up to 3 plans for comparison
- **ADDED**: Monthly cost breakdown calculation function that computes per-month costs for selected plans (accounting for seasonal usage variations)
- **ADDED**: Interactive comparison chart component using Recharts with line/bar chart views, tooltips, and legend
- **ADDED**: Chart controls including "Clear Selection" button, legend with plan names, view toggle (line/bar), and annual totals display
- **MODIFIED**: Plan cards to show selection state, update "Select to Compare" button behavior, display selection counter (X/3), and disable selection when 3 plans are selected
- **MODIFIED**: Plan calculation to support monthly breakdown calculation (per-month costs, not just annual average)

## Impact
- **Affected specs**: `plan-display` (selection state, comparison chart, enhanced cards) and `plan-calculation` (monthly breakdown calculation)
- **Affected code**:
  - New utilities: `lib/calculations/monthlyBreakdown.ts` (calculate monthly costs per plan)
  - New components: `components/features/PlanComparisonChart.tsx` (Recharts-based comparison chart)
  - Modified components: `components/features/PlanCard.tsx` (selection state, button behavior)
  - Modified components: `components/features/PlanGrid.tsx` (selection state integration)
  - Modified components: `components/features/PlanRecommendations.tsx` (selection state integration)
  - Modified utilities: `lib/calculations/planCost.ts` (add monthly breakdown calculation)
  - Updated: `app/page.tsx` (add comparison chart section, manage selection state)

