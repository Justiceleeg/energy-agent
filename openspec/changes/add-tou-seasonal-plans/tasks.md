## 1. Implementation

### 1.1 Extend Type Definitions
- [x] 1.1.1 Add `TimeOfUsePricing` interface to `lib/types/plans.ts` with `type: "TIME_OF_USE"` and `schedule` array
- [x] 1.1.2 Add `SeasonalPricing` interface to `lib/types/plans.ts` with `type: "SEASONAL"`, `months` array, and `rateModifier` number
- [x] 1.1.3 Extend `PricingRule` union type to include `TimeOfUsePricing | SeasonalPricing`
- [x] 1.1.4 Update `EnergyPlan` interface documentation to mention TOU and seasonal support

### 1.2 Create Complex Plan Data
- [x] 1.2.1 Create `data/plans/complex-plans.json` file
- [x] 1.2.2 Add 15 time-of-use plans with varied schedules:
  - [x] 5 free nights/weekends plans (e.g., free 10pm-6am, free weekends)
  - [x] 5 peak/off-peak plans (e.g., higher rates 2pm-7pm weekdays)
  - [x] 5 mixed pattern plans (e.g., free nights + peak afternoons)
- [x] 1.2.3 Add 15 seasonal plans with varied patterns:
  - [x] 5 summer premium plans (higher rates June-August)
  - [x] 5 winter premium plans (higher rates December-February)
  - [x] 5 shoulder season discount plans (lower rates in spring/fall)
- [x] 1.2.4 Ensure all plans have unique IDs, provider names, renewable percentages, and contract lengths
- [x] 1.2.5 Validate plan data structure matches type definitions

### 1.3 Extend Calculation Engine
- [x] 1.3.1 Create `calculateTimeOfUseCost()` function in `lib/calculations/planCost.ts`:
  - [x] Accepts hourly usage data and TOU schedule
  - [x] Matches each hour to appropriate schedule entry based on hour (0-23) and day of week (0-6)
  - [x] Calculates cost as sum of `hourlyKwh × matchingRatePerKwh`
  - [x] Returns total energy cost
- [x] 1.3.2 Create `calculateSeasonalCost()` function in `lib/calculations/planCost.ts`:
  - [x] Accepts monthly usage data, base pricing rules, and seasonal rules
  - [x] Calculates base monthly cost using existing pricing rules
  - [x] Applies seasonal modifiers to monthly costs
  - [x] Returns total annual cost
- [x] 1.3.3 Update `calculatePlanCost()` function to handle `TIME_OF_USE` and `SEASONAL` rules:
  - [x] Check for TOU rules and call `calculateTimeOfUseCost()` if present
  - [x] Check for seasonal rules and apply modifiers to monthly costs
  - [x] Handle plans with both TOU and seasonal rules
  - [x] Ensure TOU calculations use hourly data, not monthly aggregates
- [x] 1.3.4 Update `calculateMonthlyBreakdown()` in `lib/calculations/monthlyBreakdown.ts`:
  - [x] Handle TOU plans by matching hourly data to schedules per month
  - [x] Handle seasonal plans by applying modifiers to monthly base costs
  - [x] Handle combined TOU + seasonal plans
  - [x] Return accurate monthly cost breakdowns

### 1.4 Update Plan Complexity Classification
- [x] 1.4.1 Update `getPlanComplexity()` in `lib/utils/planComplexity.ts`:
  - [x] Check for `TIME_OF_USE` rules and return "complex" if present
  - [x] Check for `SEASONAL` rules and return "complex" if present
  - [x] Update function documentation

### 1.5 Create Plan Details Modal Component
- [x] 1.5.1 Create `components/features/PlanDetailsModal.tsx` component:
  - [x] Accepts plan data as props
  - [x] Displays all pricing rules in detail
  - [x] Shows plan features (renewable, contract length, etc.)
  - [x] Includes close button
- [x] 1.5.2 Add TOU schedule visualization to modal:
  - [x] Display rate calendar or time-of-day chart
  - [x] Show rate breakdown by hour and day of week
  - [x] Highlight peak, off-peak, and free periods
- [x] 1.5.3 Add seasonal rate calendar to modal:
  - [x] Display 12-month calendar
  - [x] Highlight months with rate modifiers
  - [x] Show effective rates for each month
- [x] 1.5.4 Add usage optimization tips:
  - [x] For TOU plans: show "best times to use energy" recommendations
  - [x] For seasonal plans: show seasonal usage pattern guidance
- [x] 1.5.5 Integrate modal into plan cards with "View Details" button

### 1.6 Update Plan Display Components
- [x] 1.6.1 Update `components/features/PlanCard.tsx`:
  - [x] Add tooltip/popover for TOU schedules showing readable format
  - [x] Add tooltip/popover for seasonal rates showing readable format
  - [x] Ensure complexity badge shows "Complex" for TOU/seasonal plans
  - [x] Add "View Details" button that opens modal
- [ ] 1.6.2 Update `components/features/PlanComparisonChart.tsx`:
  - [ ] Enhance tooltips to show TOU rate breakdown for monthly data points
  - [ ] Highlight months with seasonal modifiers in chart
  - [ ] Show seasonal modifier information in tooltips
- [x] 1.6.3 Update `components/features/PlanGrid.tsx`:
  - [x] Ensure all 80 plans are displayed (including new TOU/seasonal plans)
  - [x] Verify filtering by complexity works with "Complex" plans

### 1.7 Update AI Integration
- [x] 1.7.1 Update `lib/ai/analyzeUsagePatterns.ts`:
  - [x] Include TOU plan recommendations in insights if usage patterns align
  - [x] Include seasonal plan recommendations if usage shows seasonal variation
  - [x] Update prompt to mention TOU/seasonal plan types
- [x] 1.7.2 Update `lib/ai/generatePlanRecommendations.ts`:
  - [x] Include TOU schedule details in prompt for TOU plans
  - [x] Include seasonal rate modifiers in prompt for seasonal plans
  - [x] Update prompt to generate TOU/seasonal-specific explanations
  - [x] Include guidance on shifting usage for TOU plans
  - [x] Include seasonal usage pattern guidance for seasonal plans
- [x] 1.7.3 Update AI schemas in `lib/ai/schemas.ts` if needed to support TOU/seasonal context

### 1.8 Update Main Application
- [x] 1.8.1 Update `app/page.tsx` to load all 80 plans (existing 50 + new 30)
- [x] 1.8.2 Verify plan data loading includes complex-plans.json
- [x] 1.8.3 Test that all plan types calculate correctly

## 2. Validation

### 2.1 Calculation Testing
- [x] 2.1.1 Test TOU calculation with sample hourly data:
  - [x] Verify free nights plans calculate correctly for night usage
  - [x] Verify peak/off-peak plans apply correct rates
  - [x] Verify mixed pattern plans match hours correctly
- [x] 2.1.2 Test seasonal calculation with sample monthly data:
  - [x] Verify summer premium plans apply modifiers correctly
  - [x] Verify winter premium plans apply modifiers correctly
  - [x] Verify shoulder season discounts work correctly
- [x] 2.1.3 Test combined TOU + seasonal plans:
  - [x] Verify TOU rates are calculated first
  - [x] Verify seasonal modifiers are applied to monthly TOU totals
- [x] 2.1.4 Test monthly breakdown with TOU/seasonal plans:
  - [x] Verify monthly costs are accurate
  - [x] Verify seasonal modifiers are applied per month

### 2.2 UI Testing
- [ ] 2.2.1 Test plan details modal:
  - [ ] Verify TOU schedule visualization displays correctly
  - [ ] Verify seasonal calendar displays correctly
  - [ ] Verify usage optimization tips appear
- [ ] 2.2.2 Test plan cards:
  - [ ] Verify TOU tooltips show readable schedules
  - [ ] Verify seasonal tooltips show readable rate info
  - [ ] Verify complexity badges show "Complex"
- [ ] 2.2.3 Test comparison chart:
  - [ ] Verify TOU tooltips show rate breakdowns
  - [ ] Verify seasonal highlighting works
- [ ] 2.2.4 Test with sample CSV files:
  - [ ] Test night-owl-user.csv with free nights TOU plans
  - [ ] Test solar-home-user.csv with peak/off-peak TOU plans
  - [ ] Test typical-family.csv with seasonal plans

### 2.3 AI Testing
- [x] 2.3.1 Test AI analysis includes TOU/seasonal recommendations
- [x] 2.3.2 Test AI recommendations include TOU/seasonal-specific explanations
- [x] 2.3.3 Verify AI prompts include TOU/seasonal context correctly

## 3. Deployment

### 3.1 Pre-Deployment
- [x] 3.1.1 Run `openspec validate add-tou-seasonal-plans --strict` and fix any issues
- [x] 3.1.2 Verify all 80 plans load and calculate correctly
- [x] 3.1.3 Build passes successfully (TypeScript compilation and linting)
- [x] 3.1.4 Test with all sample CSV files (requires running app)
- [x] 3.1.5 Verify AI recommendations work with TOU/seasonal plans (requires API calls)

### 3.2 Deployment
- [ ] 3.2.1 Deploy to Vercel
- [ ] 3.2.2 Test TOU calculations with sample CSVs in production
- [ ] 3.2.3 Verify night-owl user gets appropriate TOU recommendations
- [ ] 3.2.4 Test seasonal calculations in production
- [ ] 3.2.5 Monitor API costs for AI calls

### 3.3 Post-Deployment
- [ ] 3.3.1 Verify TOU and seasonal plans calculate correctly
- [ ] 3.3.2 Verify plans are recommended appropriately based on usage patterns
- [ ] 3.3.3 Verify plan details modal displays correctly
- [ ] 3.3.4 Verify monthly chart shows TOU/seasonal impact

