## 1. Implementation

### 1.1 Type Definitions
- [ ] 1.1.1 Extend `lib/types/plans.ts` to add `TieredPricing` interface with `type: "TIERED"` and `tiers` array
- [ ] 1.1.2 Add `BillCreditPricing` interface with `type: "BILL_CREDIT"`, `amount`, `minKwh`, and `maxKwh` fields
- [ ] 1.1.3 Update `PricingRule` union type to include `TieredPricing | BillCreditPricing`
- [ ] 1.1.4 Add `complexity` field to `EnergyPlan` interface (optional, derived from pricing rules: "simple" | "medium" | "complex")
- [ ] 1.1.5 Update `PlanCostResult` breakdown to include `billCredits` field (for tracking credits separately)

### 1.2 Tiered Pricing Calculation
- [ ] 1.2.1 Create `calculateTieredCost()` helper function in `lib/calculations/planCost.ts`
- [ ] 1.2.2 Accept total kWh and tiers array as parameters
- [ ] 1.2.3 Allocate usage to each tier in order (first tier up to maxKwh, then next tier, etc.)
- [ ] 1.2.4 Calculate cost for each tier: `tierKwh × ratePerKwh`
- [ ] 1.2.5 Sum costs across all tiers
- [ ] 1.2.6 Handle edge cases: usage at tier boundaries (inclusive), zero usage, usage exceeding all tiers
- [ ] 1.2.7 Add unit tests for tiered calculation (boundary cases, multiple tiers, unlimited final tier)

### 1.3 Bill Credit Calculation
- [ ] 1.3.1 Create `calculateBillCredit()` helper function in `lib/calculations/planCost.ts`
- [ ] 1.3.2 Accept monthly kWh, credit amount, minKwh, and maxKwh as parameters
- [ ] 1.3.3 Check if usage falls within credit range (minKwh <= usage <= maxKwh or maxKwh === null)
- [ ] 1.3.4 Return negative credit amount if conditions met, otherwise return 0
- [ ] 1.3.5 Handle edge cases: usage exactly at minKwh, usage exactly at maxKwh, maxKwh === null
- [ ] 1.3.6 Add unit tests for bill credit calculation (boundary cases, no credit, unlimited max)

### 1.4 Update Calculation Engine
- [ ] 1.4.1 Update `calculatePlanCost()` in `lib/calculations/planCost.ts` to handle TIERED rule type
- [ ] 1.4.2 Call `calculateTieredCost()` for TIERED rules (calculate monthly, then sum annually)
- [ ] 1.4.3 Update `calculatePlanCost()` to handle BILL_CREDIT rule type
- [ ] 1.4.4 Call `calculateBillCredit()` for BILL_CREDIT rules (calculate monthly, then sum annually)
- [ ] 1.4.5 Track bill credits separately in cost breakdown
- [ ] 1.4.6 Ensure monthly calculation approach (calculate per month, sum for annual)
- [ ] 1.4.7 Add validation to ensure calculation handles all rule types correctly

### 1.5 Create Medium-Complexity Plans
- [ ] 1.5.1 Create 15 tiered pricing plans with 2-3 tiers each
- [ ] 1.5.2 Vary tier structures (some with lower first tier, some with higher first tier)
- [ ] 1.5.3 Include plans with unlimited final tier (maxKwh: null)
- [ ] 1.5.4 Create 15 bill credit plans with varying credit amounts ($10-$50)
- [ ] 1.5.5 Vary credit thresholds (some for low usage, some for high usage, some for mid-range)
- [ ] 1.5.6 Include plans with unlimited maxKwh (maxKwh: null) for credits
- [ ] 1.5.7 Mix renewable percentages, contract lengths, and providers across all 30 plans
- [ ] 1.5.8 Store plans in `data/plans/plans.json` (or extend existing file) - total 50 plans (20 simple + 30 medium)

### 1.6 Plan Complexity Classification
- [ ] 1.6.1 Create `getPlanComplexity()` utility function
- [ ] 1.6.2 Classify plans as "simple" (flat-rate only), "medium" (tiered or bill credit), or "complex" (future)
- [ ] 1.6.3 Derive complexity from pricing rules (check for TIERED or BILL_CREDIT presence)
- [ ] 1.6.4 Add complexity field to plan data or calculate on-the-fly

### 1.7 Update Plan Cards
- [ ] 1.7.1 Update `components/features/PlanCard.tsx` to display complexity indicator badge
- [ ] 1.7.2 Show "Simple", "Medium", or "Complex" badge on plan card
- [ ] 1.7.3 Add tooltip/popover for tiered plans showing tier breakdown
- [ ] 1.7.4 Display tier structure: "First 500 kWh: $0.10/kWh, Next 500 kWh: $0.12/kWh, Above 1000 kWh: $0.15/kWh"
- [ ] 1.7.5 Add tooltip/popover for bill credit plans showing credit conditions
- [ ] 1.7.6 Display credit conditions: "$25 credit for usage between 1000-2000 kWh/month"
- [ ] 1.7.7 Update cost breakdown to show bill credits separately (if applicable)

### 1.8 Add Plan Filtering
- [ ] 1.8.1 Update `components/features/PlanGrid.tsx` to add filtering controls
- [ ] 1.8.2 Add filter by complexity (Simple, Medium, Complex - checkboxes or dropdown)
- [ ] 1.8.3 Add filter by renewable percentage (slider or range input: 0-100%)
- [ ] 1.8.4 Add filter by contract length (checkboxes: 6, 12, 24 months)
- [ ] 1.8.5 Add filter by price range (min/max annual cost sliders)
- [ ] 1.8.6 Implement filter logic to apply all active filters simultaneously
- [ ] 1.8.7 Display active filter count or "Clear Filters" button
- [ ] 1.8.8 Ensure filtering works with sorting (filter first, then sort)

### 1.9 Update Plan Display Integration
- [ ] 1.9.1 Update `app/page.tsx` to load all 50 plans (20 simple + 30 medium)
- [ ] 1.9.2 Ensure all plans are calculated correctly with new pricing rules
- [ ] 1.9.3 Verify plan ranking still works correctly with mixed plan types
- [ ] 1.9.4 Update plan count display (show "50 plans" instead of "20 plans")

### 1.10 Testing & Validation
- [ ] 1.10.1 Add unit tests for `calculateTieredCost()` with various tier structures
- [ ] 1.10.2 Add unit tests for `calculateBillCredit()` with various credit conditions
- [ ] 1.10.3 Test tiered calculations with all 3 sample CSV files
- [ ] 1.10.4 Test bill credit calculations with all 3 sample CSV files
- [ ] 1.10.5 Verify edge cases: usage at tier boundaries, zero usage months, usage exceeding all tiers
- [ ] 1.10.6 Verify bill credits apply correctly for usage within thresholds
- [ ] 1.10.7 Test plan ranking with mixed plan types (simple, tiered, bill credit)
- [ ] 1.10.8 Test filtering functionality (complexity, renewable, contract, price range)
- [ ] 1.10.9 Verify filtering works correctly with sorting
- [ ] 1.10.10 Test mobile responsiveness of plan cards with complexity indicators
- [ ] 1.10.11 Test tooltips/popovers on mobile devices
- [ ] 1.10.12 Deploy to Vercel and verify all 50 plans calculate correctly

