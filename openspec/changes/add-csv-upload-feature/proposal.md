# Change: Add CSV Upload Feature

## Why
Users need to upload their hourly energy usage data (CSV format) to enable personalized plan recommendations. This is the foundational feature that enables all subsequent analysis and recommendations. Without the ability to upload and process usage data, the application cannot provide value to users.

## What Changes
- **ADDED**: CSV upload component with drag-and-drop interface
- **ADDED**: CSV parser and validator for hourly usage data (8,760 data points expected)
- **ADDED**: Usage statistics calculation (total annual kWh, average daily usage, peak usage hour, min/max monthly usage)
- **ADDED**: Usage insights display component with monthly consumption chart
- **ADDED**: Sample CSV files for testing (night-owl-user, solar-home-user, typical-family)
- **ADDED**: TypeScript types for hourly usage data, usage statistics, and basic energy plan structure
- **ADDED**: Basic UI layout with upload section and sample CSV download links

## Impact
- **Affected specs**: New capability `usage-data-processing` added
- **Affected code**: 
  - New components: `components/features/CSVUpload.tsx`, `components/features/UsageInsights.tsx`
  - New utilities: `lib/utils/csvParser.ts`, `lib/utils/usageStatistics.ts`
  - New types: `lib/types/usage.ts`, `lib/types/plans.ts`
  - Updated: `app/page.tsx` (homepage layout)
  - New data: `data/sample-csvs/*.csv` (3 sample files)

