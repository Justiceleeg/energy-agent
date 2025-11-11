# AI Energy Plan Recommendation Agent - Task List

**Project:** Arbor AI Energy Plan Recommendation Agent Demo  
**Approach:** Iterative vertical slices with early deployment  
**Tech Stack:** Next.js 16, Vercel AI SDK, OpenAI API, shadcn/ui, Recharts v3  

---

## Overview

This task list is organized into deployable vertical slices. Each slice delivers a working feature that can be deployed and validated before moving to the next slice. The goal is to start simple and progressively add complexity while maintaining a functional demo at every stage.

**Related Documentation:** For detailed technical architecture, data models, API design, and implementation patterns, see [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## 🎯 Slice 0: Project Setup & Foundation ✅
**Goal:** Bootstrap the project with all necessary tooling and infrastructure  
**Deploy Target:** Initial deployment with "Hello World"  
**Status:** Completed

### Tasks

- [x] **0.1 Initialize Next.js Project**
  - Create Next.js 16 app with App Router
  - Configure TypeScript
  - Set up project structure
  - Initialize git repository

- [x] **0.2 Install Core Dependencies**
  - Install shadcn/ui and configure
  - Install Recharts for visualizations
  - Install Vercel AI SDK (provides OpenAI integration for runtime API routes)
  - Install additional utilities (date-fns, zod for validation)
  - Note: OpenAI SDK will be installed in slice 8 for batch processing scripts only

- [x] **0.3 Configure Environment**
  - Create `.env.local` with OpenAI API key
  - Add `.env.example` template
  - Configure environment variables for Vercel deployment

- [x] **0.4 Set Up Project Structure**
  ```
  /app
    /api
      /analyze
      /recommendations
    /upload
    page.tsx
  /components
    /ui (shadcn components)
    /features
  /lib
    /types
    /utils
    /ai
    /calculations
  /data
    /plans
      plans-raw.json
      plans-structured.json
    /sample-csvs (moved to public/sample-csvs)
  ```

- [x] **0.5 Deploy to Vercel**
  - Connect GitHub repository to Vercel
  - Configure environment variables in Vercel
  - Deploy and verify basic functionality
  - Set up preview deployments

**Definition of Done:** Project deployed to Vercel with working homepage ✅

---

## 🎯 Slice 1: CSV Upload & Basic Usage Display ✅
**Goal:** User can upload CSV and see basic usage statistics  
**Deploy Target:** Working upload feature with insights  
**Status:** Completed

### Tasks

- [x] **1.1 Create TypeScript Types**
  - Define `HourlyUsageData` type
  - Define `UsageStatistics` type
  - Define basic `EnergyPlan` type (flat-rate only)
  - Define `PricingRule` union types

- [x] **1.2 Build CSV Upload Component**
  - Create drag-and-drop file upload with shadcn
  - Validate CSV format (8760 rows expected)
  - Parse CSV into hourly usage data
  - Display upload progress/status
  - Handle errors gracefully

- [x] **1.3 Create CSV Parser & Validator**
  - Parse CSV into structured data
  - Validate data integrity (dates, numeric values)
  - Calculate basic statistics:
    - Total annual kWh
    - Average daily usage
    - Peak usage hour
    - Min/max monthly usage

- [x] **1.4 Create Usage Insights Component**
  - Display total annual consumption
  - Show average monthly breakdown
  - Display peak usage patterns
  - Create simple bar chart of monthly usage (Recharts)
  - Added smart Y-axis formatting with seasonal-aware precision

- [x] **1.5 Create Mock Data**
  - Generate 3 sample CSV files:
    - `night-owl-user.csv` (high evening usage with seasonal variation)
    - `solar-home-user.csv` (low daytime, high evening with seasonal variation)
    - `typical-family.csv` (standard 9-5 pattern with seasonal variation)
  - Add download links for sample CSVs
  - Files generated with realistic seasonal patterns based on real usage data

- [x] **1.6 Build Basic UI Layout**
  - Create homepage with upload section
  - Add sample CSV download links
  - Style with shadcn components
  - Make responsive for mobile

- [x] **1.7 Deploy & Test**
  - Build passes successfully
  - Test with all 3 sample CSVs
  - Verify statistics are accurate
  - Validate mobile responsiveness
  - Ready for Vercel deployment

**Definition of Done:** User can upload CSV, see usage statistics, and view monthly consumption chart ✅

---

## 🎯 Slice 2: Simple Plan Calculation (Flat-Rate Only) ✅
**Goal:** Calculate and display costs for 20 simple flat-rate plans  
**Deploy Target:** Working cost comparison with flat-rate plans  
**Status:** Completed

### Tasks

- [x] **2.1 Create 20 Simple Plans**
  - Generate 20 flat-rate plans (JSON)
  - Include variety of providers
  - Rates ranging from 10¢ to 18¢ per kWh
  - Some with base charges, some without
  - Varying renewable percentages (0-100%)
  - Different contract lengths (6, 12, 24 months)

- [x] **2.2 Build Plan Calculation Engine**
  - Create `calculatePlanCost()` function
  - Handle FLAT_RATE pricing rule
  - Handle BASE_CHARGE pricing rule
  - Calculate annual total cost
  - Calculate monthly average cost
  - Add TDU charges (fixed at $4.50/month + $0.035/kWh)

- [x] **2.3 Build Plan Ranking Logic**
  - Rank all plans by total cost
  - Identify top 3 cheapest plans
  - Calculate savings vs. most expensive
  - Apply basic preference filters (cost-focused for now)

- [x] **2.4 Create Plan Card Component**
  - Display plan name and provider
  - Show annual and monthly cost
  - Display key features (renewable %, contract length)
  - Show cost differential from cheapest
  - Add "Select to Compare" button

- [x] **2.5 Create Top 3 Recommendations Section**
  - Display 3 recommended plans as cards
  - Show why each was recommended (hardcoded explanations)
  - Highlight savings amount
  - Make cards visually distinct from others

- [x] **2.6 Create All Plans Grid**
  - Display all 20 plans as cards
  - Make scrollable/paginated
  - Add basic sorting (by cost, renewable %)
  - Highlight top 3 recommendations

- [x] **2.7 Deploy & Test**
  - Deploy to Vercel
  - Test calculations with sample CSVs
  - Verify ranking is correct
  - Validate all plans display properly

**Definition of Done:** User sees calculated costs for 20 plans, with top 3 clearly recommended ✅

---

## 🎯 Slice 3: Plan Comparison Chart
**Goal:** Allow users to compare up to 3 plans with monthly breakdown  
**Deploy Target:** Interactive comparison chart

### Tasks

- [ ] **3.1 Build Plan Selection State Management**
  - Create state for selected plans (max 3)
  - Allow users to select/deselect plans
  - Default to top 3 recommendations
  - Validate max 3 selection

- [ ] **3.2 Calculate Monthly Breakdown**
  - Create function to calculate cost per month
  - Account for seasonal variations in usage
  - Store monthly data for charting

- [ ] **3.3 Create Comparison Chart Component**
  - Build line chart with Recharts
  - Display monthly costs for selected plans
  - Different color per plan
  - Interactive tooltips
  - Responsive design

- [ ] **3.4 Add Chart Controls**
  - "Clear Selection" button
  - Legend with plan names
  - Toggle between line/bar chart views
  - Show annual totals in chart header

- [ ] **3.5 Enhance Plan Cards**
  - Add "Selected" state styling
  - Update "Select to Compare" button behavior
  - Show counter of selected plans (X/3)
  - Disable selection when 3 are selected

- [ ] **3.6 Deploy & Test**
  - Deploy to Vercel
  - Test selection/deselection
  - Verify chart updates correctly
  - Test on mobile devices

**Definition of Done:** User can select any 3 plans and see monthly cost comparison chart

---

## 🎯 Slice 4: AI Integration - Usage Pattern Analysis
**Goal:** Use OpenAI to generate personalized usage insights  
**Deploy Target:** AI-powered usage analysis

### Tasks

- [ ] **4.1 Create AI Utility Functions**
  - Set up OpenAI client with API key
  - Create `analyzeUsagePatterns()` function
  - Implement error handling and retries
  - Add loading states

- [ ] **4.2 Build Usage Analysis Prompt**
  - Create structured prompt for GPT-4o-mini
  - Include hourly usage data summary
  - Request insights on patterns (peak times, seasonal trends)
  - Ask for actionable recommendations
  - Define expected JSON output structure

- [ ] **4.3 Create API Route for Analysis**
  - Create `/api/analyze` endpoint
  - Accept usage data as input
  - Call OpenAI API (parallel with other operations)
  - Return structured insights
  - Handle rate limiting

- [ ] **4.4 Update Usage Insights Component**
  - Display AI-generated insights
  - Show loading state while AI processes
  - Format insights in readable cards
  - Add icons for different insight types

- [ ] **4.5 Implement Caching**
  - Cache AI responses in session storage
  - Avoid redundant API calls for same data
  - Clear cache on new CSV upload

- [ ] **4.6 Deploy & Test**
  - Deploy to Vercel
  - Test with all 3 sample CSVs
  - Verify insights are relevant
  - Monitor OpenAI API usage

**Definition of Done:** User sees AI-generated insights about their usage patterns

---

## 🎯 Slice 5: Complex Plan Types (Tiered & Bill Credits)
**Goal:** Support tiered pricing and conditional bill credits  
**Deploy Target:** Medium complexity plans working

### Tasks

- [ ] **5.1 Create 30 Medium-Complexity Plans**
  - 15 tiered pricing plans (2-3 tiers)
  - 15 bill credit plans (conditional credits at usage thresholds)
  - Mix with flat-rate plans (total 50 plans now)
  - Store in `plans-structured.json`

- [ ] **5.2 Extend Calculation Engine**
  - Implement `TIERED` pricing rule handler
  - Implement `BILL_CREDIT` pricing rule handler
  - Handle edge cases (usage at tier boundaries)
  - Validate calculations with test cases

- [ ] **5.3 Update Plan Cards**
  - Display pricing complexity indicator
  - Show tier breakdown for tiered plans
  - Display bill credit conditions
  - Add tooltips explaining pricing structure

- [ ] **5.4 Add Plan Filtering**
  - Filter by plan complexity (simple, medium, complex)
  - Filter by renewable percentage
  - Filter by contract length
  - Filter by price range

- [ ] **5.5 Update Tests**
  - Add unit tests for TIERED calculations
  - Add unit tests for BILL_CREDIT calculations
  - Test with sample CSVs
  - Validate ranking still works correctly

- [ ] **5.6 Deploy & Test**
  - Deploy to Vercel
  - Test tiered plan calculations
  - Test bill credit conditions
  - Verify filtering works

**Definition of Done:** 50 plans (including tiered and bill credit) calculate correctly

---

## 🎯 Slice 6: AI Integration - Plan Recommendations
**Goal:** Use OpenAI to generate personalized plan explanations  
**Deploy Target:** AI-powered recommendation explanations

### Tasks

- [ ] **6.1 Create Recommendation Prompt**
  - Build structured prompt for GPT-4o-mini
  - Include usage patterns + plan details
  - Request explanation for top 3 plans
  - Ask for pros/cons for user's specific situation
  - Define JSON output structure

- [ ] **6.2 Create API Route for Recommendations**
  - Create `/api/recommendations` endpoint
  - Accept usage data + top 3 plans
  - Call OpenAI API (parallel with analysis)
  - Return structured recommendations
  - Handle rate limiting

- [ ] **6.3 Update Recommendation Cards**
  - Replace hardcoded explanations with AI-generated
  - Display personalized pros/cons
  - Show why plan is recommended for user
  - Add "Good for" badges (night owl, solar, etc.)

- [ ] **6.4 Add Preference Selection**
  - Create preference selector (cost, flexibility, renewable)
  - Update ranking algorithm based on preferences
  - Re-generate AI recommendations with preferences
  - Default to cost-optimized

- [ ] **6.5 Implement Parallel AI Calls**
  - Call both analysis and recommendations in parallel
  - Handle loading states for both
  - Display results as they complete
  - Handle partial failures gracefully

- [ ] **6.6 Deploy & Test**
  - Deploy to Vercel
  - Test with different preferences
  - Verify explanations are personalized
  - Monitor API costs

**Definition of Done:** Top 3 plans have AI-generated, personalized explanations

---

## 🎯 Slice 7: Time-of-Use & Seasonal Plans
**Goal:** Support time-of-use and seasonal pricing  
**Deploy Target:** Complex plan types working

### Tasks

- [ ] **7.1 Create 30 Complex Plans**
  - 15 time-of-use plans (free nights/weekends, peak/off-peak)
  - 15 seasonal plans (summer/winter rates)
  - Mix with existing plans (total 80 plans now)

- [ ] **7.2 Extend Calculation Engine**
  - Implement `TIME_OF_USE` pricing rule handler
  - Implement `SEASONAL` pricing rule handler
  - Match hourly data to time-of-use schedules
  - Account for daylight saving time if needed
  - Calculate monthly costs with TOU/seasonal variations

- [ ] **7.3 Update Monthly Chart**
  - Show TOU impact on monthly costs
  - Highlight months with seasonal pricing
  - Add tooltip showing rate applied

- [ ] **7.4 Create Advanced Plan Details Modal**
  - Show detailed pricing schedule
  - Display time-of-use rate calendar
  - Show seasonal rate breakdown
  - Calculate "best times to use energy"

- [ ] **7.5 Update AI Prompts**
  - Include TOU/seasonal info in analysis
  - Recommend times to shift usage
  - Explain TOU plan suitability

- [ ] **7.6 Deploy & Test**
  - Deploy to Vercel
  - Test TOU calculations with sample CSVs
  - Verify night-owl user gets appropriate TOU recommendations
  - Test seasonal calculations

**Definition of Done:** TOU and seasonal plans calculate correctly and are recommended appropriately

---

## 🎯 Slice 8: Real Plan Integration & Batch Processing
**Goal:** Integrate 20-30 real scraped plans and set up batch processing  
**Deploy Target:** Real-world plans with AI parsing

### Tasks

- [ ] **8.1 Scrape Real Plans**
  - Manually collect 20-30 plan descriptions from Texas providers
  - Focus on variety (different complexity levels)
  - Save as `plans-raw.json` with original text descriptions
  - Include EFL data if available

- [ ] **8.2 Create Plan Parsing Prompt**
  - Build structured prompt for GPT-4o
  - Include plan description text
  - Request extraction of pricing rules
  - Define output schema matching `EnergyPlan` type
  - Handle ambiguous descriptions

- [ ] **8.3 Build Batch Processing Script**
  - Install OpenAI SDK (for batch processing script - not needed for runtime API routes)
  - Create Node.js script to process all raw plans
  - Call OpenAI API for each plan (GPT-4o) using OpenAI SDK
  - Parse responses into structured format
  - Validate parsed data
  - Handle errors and retries
  - Save to `plans-structured.json`

- [ ] **8.4 Merge Real + Synthetic Plans**
  - Combine 20-30 real plans with 80 synthetic
  - Total: 100-110 plans
  - Validate all calculate correctly
  - Update plan IDs and metadata

- [ ] **8.5 Add Plan Provenance**
  - Tag plans as "real" vs "synthetic"
  - Add source attribution for real plans
  - Display in UI (optional badge)

- [ ] **8.6 Test & Validate**
  - Run calculations on all real plans
  - Verify AI parsing is accurate
  - Manually validate 5-10 real plans
  - Test recommendations with real plans

- [ ] **8.7 Deploy & Test**
  - Deploy to Vercel
  - Verify 100+ plans work smoothly
  - Test performance with large dataset
  - Monitor any issues

**Definition of Done:** 100+ plans including real-world examples all calculate and display correctly

---

## 🎯 Slice 9: UI Polish & Advanced Features
**Goal:** Add final polish, accessibility, and nice-to-have features  
**Deploy Target:** Production-ready demo

### Tasks

- [ ] **9.1 Enhance Visualizations**
  - Add usage heatmap (hour of day × day of week)
  - Create annual usage trend chart
  - Add cost comparison bar chart
  - Improve chart styling and colors

- [ ] **9.2 Add Plan Comparison Table**
  - Side-by-side feature comparison
  - Highlight differences between selected plans
  - Include all key metrics in table format
  - Make table scrollable/responsive

- [ ] **9.3 Implement Advanced Filtering**
  - Multi-select filters
  - Price range slider
  - Renewable percentage slider
  - Contract length options
  - Plan type (fixed, variable, TOU)

- [ ] **9.4 Add Sorting Options**
  - Sort by cost (ascending/descending)
  - Sort by renewable percentage
  - Sort by contract length
  - Sort by flexibility score

- [ ] **9.5 Create Info Modals**
  - Explain how calculations work
  - Glossary of terms (kWh, TDU, EFL, etc.)
  - FAQ section
  - Data privacy notice

- [ ] **9.6 Accessibility Improvements**
  - Add ARIA labels to all interactive elements
  - Ensure keyboard navigation works
  - Test with screen readers
  - Improve color contrast ratios
  - Add focus indicators

- [ ] **9.7 Performance Optimization**
  - Lazy load plan cards
  - Virtualize long lists
  - Optimize chart rendering
  - Compress large data files
  - Add loading skeletons

- [ ] **9.8 Error Handling & Edge Cases**
  - Improve error messages
  - Handle invalid CSV formats gracefully
  - Add retry logic for failed AI calls
  - Handle API rate limits
  - Add fallback content

- [ ] **9.9 Mobile Optimization**
  - Optimize layout for small screens
  - Make charts responsive
  - Improve touch interactions
  - Test on multiple devices

- [ ] **9.10 Deploy & Final Testing**
  - Deploy to Vercel
  - Conduct full user flow testing
  - Test on multiple browsers
  - Test on mobile devices
  - Fix any bugs found

**Definition of Done:** Demo is polished, accessible, and production-ready

---

## 🎯 Slice 10: Documentation & Demo Refinement
**Goal:** Complete documentation and prepare for showcase  
**Deploy Target:** Final demo with documentation

### Tasks

- [ ] **10.1 Create README**
  - Project overview
  - Tech stack description
  - Setup instructions
  - Environment variables guide
  - Deployment instructions

- [ ] **10.2 Add Code Documentation**
  - JSDoc comments for key functions
  - Explain calculation logic
  - Document AI prompts
  - Comment complex algorithms

- [ ] **10.3 Create User Guide**
  - How to use the demo
  - Sample CSV information
  - Understanding recommendations
  - Reading the comparison chart

- [ ] **10.4 Add Demo Landing Page**
  - Explain what the demo does
  - Show sample results
  - Link to GitHub repo
  - Add contact information

- [ ] **10.5 Performance Testing**
  - Load test with multiple concurrent users
  - Monitor OpenAI API usage
  - Check Vercel bandwidth limits
  - Optimize if needed

- [ ] **10.6 Create Demo Video (Optional)**
  - Screen recording of user flow
  - Narration explaining features
  - Upload to YouTube/Loom
  - Embed on landing page

- [ ] **10.7 Final Polish**
  - Fix any remaining UI issues
  - Improve copy/microcopy
  - Add helpful tooltips
  - Final design tweaks

- [ ] **10.8 Deploy Final Version**
  - Deploy to Vercel production
  - Set up custom domain (optional)
  - Verify all features work
  - Share with stakeholders

**Definition of Done:** Demo is documented, tested, and ready to showcase

---

## Additional Notes

### Deployment Strategy
- Deploy after each slice is complete
- Use Vercel preview deployments for testing
- Promote to production only after validation
- Keep main branch always deployable

### Testing Approach
- Manual testing after each slice
- Unit tests for calculation engine
- Integration tests for API routes
- E2E tests for critical user flows (optional)

### AI Cost Management
- Monitor OpenAI API usage in dashboard
- Set spending limits
- Cache AI responses when possible
- Use mini model for runtime operations

### Data Management
- All plan data stored as static JSON in repo
- No database needed for demo
- User data kept in memory only (ephemeral)
- No data persistence between sessions

### Success Metrics
- Demo loads in < 3 seconds
- CSV processing takes < 2 seconds
- AI responses in < 5 seconds
- Works on mobile devices
- All calculations are accurate
