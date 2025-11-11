## 1. Implementation

### 1.1 Type Definitions
- [x] 1.1.1 Create `lib/types/usage.ts` with `HourlyUsageData` and `UsageStatistics` types
- [x] 1.1.2 Create `lib/types/plans.ts` with basic `EnergyPlan` type (flat-rate only) and `PricingRule` union types

### 1.2 CSV Processing
- [x] 1.2.1 Create `lib/utils/csvParser.ts` to parse CSV files into `HourlyUsageData[]`
- [x] 1.2.2 Add CSV validation (format, row count, data integrity)
- [x] 1.2.3 Create `lib/utils/usageStatistics.ts` to calculate statistics from usage data

### 1.3 UI Components
- [x] 1.3.1 Create `components/features/CSVUpload.tsx` with drag-and-drop file upload
- [x] 1.3.2 Add file validation feedback and error handling
- [x] 1.3.3 Create `components/features/UsageInsights.tsx` to display statistics
- [x] 1.3.4 Add monthly consumption bar chart using Recharts

### 1.4 Sample Data
- [x] 1.4.1 Generate `public/sample-csvs/night-owl-user.csv` (high evening usage pattern with seasonal variation)
- [x] 1.4.2 Generate `public/sample-csvs/solar-home-user.csv` (low daytime, high evening with seasonal variation)
- [x] 1.4.3 Generate `public/sample-csvs/typical-family.csv` (standard 9-5 pattern with seasonal variation)

### 1.5 Page Layout
- [x] 1.5.1 Update `app/page.tsx` with upload section and sample CSV download links
- [x] 1.5.2 Style with shadcn components and ensure mobile responsiveness
- [x] 1.5.3 Integrate CSV upload and usage insights components

### 1.6 Testing & Validation
- [x] 1.6.1 Test CSV upload with all 3 sample files
- [x] 1.6.2 Verify statistics calculations are accurate
- [x] 1.6.3 Test error handling for invalid CSV formats
- [x] 1.6.4 Validate mobile responsiveness
- [x] 1.6.5 Deploy to Vercel and verify functionality

