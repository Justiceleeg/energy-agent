## 1. Implementation

### 1.1 Plan Selection State Management
- [x] 1.1.1 Create selection state management in `app/page.tsx` (useState for selected plan IDs, max 3)
- [x] 1.1.2 Create `handlePlanSelect()` function to add/remove plans from selection
- [x] 1.1.3 Implement validation to prevent selecting more than 3 plans
- [x] 1.1.4 Default to top 3 recommendations when usage data is first available
- [x] 1.1.5 Pass selection state and handlers to plan display components

### 1.2 Monthly Breakdown Calculation
- [x] 1.2.1 Create `lib/calculations/monthlyBreakdown.ts` with `calculateMonthlyBreakdown()` function
- [x] 1.2.2 Accept plan, usage data (HourlyUsageData[]), and UsageStatistics as parameters
- [x] 1.2.3 Group hourly usage data by month (0-11, January = 0)
- [x] 1.2.4 Calculate monthly kWh totals for each month
- [x] 1.2.5 For each month, calculate plan cost using monthly kWh (apply pricing rules, base charges, TDU)
- [x] 1.2.6 Return array of monthly cost objects with month index, month name, totalKWh, and cost
- [x] 1.2.7 Handle edge cases (empty months, invalid data)

### 1.3 Comparison Chart Component
- [x] 1.3.1 Create `components/features/PlanComparisonChart.tsx` component
- [x] 1.3.2 Install/verify Recharts dependency (LineChart, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer)
- [x] 1.3.3 Accept selected plans and monthly breakdown data as props
- [x] 1.3.4 Build line chart displaying monthly costs for each selected plan
- [x] 1.3.5 Use different colors for each plan (3 distinct colors)
- [x] 1.3.6 Add interactive tooltips showing plan name, month, and cost
- [x] 1.3.7 Make chart responsive (mobile-friendly)
- [x] 1.3.8 Add chart header showing annual totals for selected plans

### 1.4 Chart Controls
- [x] 1.4.1 Add "Clear Selection" button to chart component
- [x] 1.4.2 Implement clear selection handler that resets selection to empty array
- [x] 1.4.3 Add legend showing plan names with corresponding colors
- [x] 1.4.4 Add toggle button to switch between line chart and bar chart views
- [x] 1.4.5 Display annual totals in chart header (sum of all monthly costs per plan)
- [x] 1.4.6 Style controls to match existing UI design system

### 1.5 Enhanced Plan Cards
- [x] 1.5.1 Update `components/features/PlanCard.tsx` to accept `isSelected` and `onSelect` props
- [x] 1.5.2 Add visual styling for selected state (border, background color, checkmark icon)
- [x] 1.5.3 Update "Select to Compare" button to toggle selection (change text to "Deselect" when selected)
- [x] 1.5.4 Disable button when 3 plans are selected and this plan is not selected
- [x] 1.5.5 Add selection counter display (X/3) in plan card or nearby UI
- [x] 1.5.6 Handle click events to add/remove plan from selection

### 1.6 Plan Grid and Recommendations Integration
- [x] 1.6.1 Update `components/features/PlanGrid.tsx` to accept selection state and handlers
- [x] 1.6.2 Pass selection props to PlanCard components
- [x] 1.6.3 Update `components/features/PlanRecommendations.tsx` to accept selection state and handlers
- [x] 1.6.4 Pass selection props to PlanCard components in recommendations
- [x] 1.6.5 Ensure selection state is synchronized across all plan display components

### 1.7 Page Integration
- [x] 1.7.1 Update `app/page.tsx` to manage selection state
- [x] 1.7.2 Calculate monthly breakdowns for selected plans when selection changes
- [x] 1.7.3 Add PlanComparisonChart component below plan recommendations section
- [x] 1.7.4 Only show chart when at least 1 plan is selected
- [x] 1.7.5 Pass selection state and handlers to all plan display components
- [x] 1.7.6 Default to top 3 recommendations on initial load

### 1.8 Testing & Validation
- [x] 1.8.1 Test plan selection/deselection with all 3 sample CSV files
- [x] 1.8.2 Verify monthly breakdown calculations match expected values
- [x] 1.8.3 Test max 3 selection limit enforcement
- [x] 1.8.4 Verify chart updates correctly when plans are selected/deselected
- [x] 1.8.5 Test chart controls (clear selection, view toggle, legend)
- [x] 1.8.6 Validate mobile responsiveness of chart and controls
- [x] 1.8.7 Test edge cases (0 plans selected, 1 plan selected, 3 plans selected)
- [x] 1.8.8 Deploy to Vercel and verify functionality

