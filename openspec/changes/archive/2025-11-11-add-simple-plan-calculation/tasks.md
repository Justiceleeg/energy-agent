## 1. Implementation

### 1.1 Type Definitions
- [x] 1.1.1 Extend `lib/types/plans.ts` to add `baseCharge?: number` to EnergyPlan
- [x] 1.1.2 Add `renewablePercent: number` (0-100) to EnergyPlan features
- [x] 1.1.3 Add `contractLength: number` (months) to EnergyPlan features
- [x] 1.1.4 Create `PlanCostResult` type with annualCost, monthlyCost, and breakdown fields

### 1.2 Plan Data
- [x] 1.2.1 Create `data/plans/simple-plans.json` with 20 flat-rate plans
- [x] 1.2.2 Include variety of providers (at least 5 different providers)
- [x] 1.2.3 Set rates ranging from 10¢ to 18¢ per kWh
- [x] 1.2.4 Include plans with base charges (some with, some without)
- [x] 1.2.5 Vary renewable percentages from 0% to 100%
- [x] 1.2.6 Include contract lengths of 6, 12, and 24 months

### 1.3 Plan Calculation Engine
- [x] 1.3.1 Create `lib/calculations/planCost.ts` with `calculatePlanCost()` function
- [x] 1.3.2 Implement FLAT_RATE pricing rule calculation (pricePerKWh × totalKwh)
- [x] 1.3.3 Implement BASE_CHARGE pricing rule calculation (amountPerMonth × 12 for annual)
- [x] 1.3.4 Calculate annual total cost (sum of all pricing rules)
- [x] 1.3.5 Calculate monthly average cost (annualCost / 12)
- [x] 1.3.6 Add TDU charges (fixed $4.50/month + $0.035/kWh) to annual and monthly costs
- [x] 1.3.7 Return cost breakdown with energy cost, base charges, and TDU charges

### 1.4 Plan Ranking Logic
- [x] 1.4.1 Create `lib/calculations/planRanking.ts` with `rankPlansByCost()` function
- [x] 1.4.2 Sort all plans by total annual cost (ascending)
- [x] 1.4.3 Identify top 3 cheapest plans
- [x] 1.4.4 Calculate savings vs. most expensive plan for each plan
- [x] 1.4.5 Create `getTopRecommendations()` function that returns top 3 plans with savings

### 1.5 Plan Card Component
- [x] 1.5.1 Create `components/features/PlanCard.tsx` component
- [x] 1.5.2 Display plan name and provider
- [x] 1.5.3 Show annual cost prominently
- [x] 1.5.4 Show monthly average cost
- [x] 1.5.5 Display renewable percentage and contract length
- [x] 1.5.6 Show cost differential from cheapest plan (if not cheapest)
- [x] 1.5.7 Add "Select to Compare" button (placeholder for future functionality)

### 1.6 Plan Recommendations Section
- [x] 1.6.1 Create `components/features/PlanRecommendations.tsx` component
- [x] 1.6.2 Display top 3 recommended plans as cards
- [x] 1.6.3 Show hardcoded recommendation explanations (e.g., "Lowest cost", "Best value", "Most renewable")
- [x] 1.6.4 Highlight savings amount prominently
- [x] 1.6.5 Style cards to be visually distinct from regular plan cards

### 1.7 All Plans Grid
- [x] 1.7.1 Create `components/features/PlanGrid.tsx` component
- [x] 1.7.2 Display all 20 plans as cards in a grid layout
- [x] 1.7.3 Make grid scrollable/paginated
- [x] 1.7.4 Add sorting controls (by cost ascending/descending, by renewable %)
- [x] 1.7.5 Highlight top 3 recommendations visually

### 1.8 Page Integration
- [x] 1.8.1 Update `app/page.tsx` to load simple plans data
- [x] 1.8.2 Calculate costs for all plans when usage data is available
- [x] 1.8.3 Display plan recommendations section after usage insights
- [x] 1.8.4 Display all plans grid below recommendations
- [x] 1.8.5 Ensure proper loading states and error handling

### 1.9 Testing & Validation
- [x] 1.9.1 Test cost calculations with all 3 sample CSV files
- [x] 1.9.2 Verify TDU charges are correctly added
- [x] 1.9.3 Verify plan ranking produces correct top 3
- [x] 1.9.4 Test sorting functionality in plan grid
- [x] 1.9.5 Validate mobile responsiveness of plan cards and grid
- [x] 1.9.6 Deploy to Vercel and verify functionality

