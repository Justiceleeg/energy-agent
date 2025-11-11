# AI Energy Plan Recommendation Agent - Architecture Document

**Project:** Arbor AI Energy Plan Recommendation Agent Demo  
**Version:** 1.0  
**Last Updated:** November 11, 2025  

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture Diagram](#architecture-diagram)
4. [Technology Stack](#technology-stack)
5. [Data Models](#data-models)
6. [Core Components](#core-components)
7. [AI Integration Strategy](#ai-integration-strategy)
8. [Calculation Engine](#calculation-engine)
9. [Data Flow](#data-flow)
10. [API Design](#api-design)
11. [Frontend Architecture](#frontend-architecture)
12. [Deployment Architecture](#deployment-architecture)
13. [Security & Privacy](#security--privacy)
14. [Performance Considerations](#performance-considerations)
15. [Error Handling](#error-handling)
16. [Future Extensibility](#future-extensibility)

---

## Executive Summary

The AI Energy Plan Recommendation Agent is a Next.js web application that helps users in deregulated energy markets find optimal electricity plans. Users upload their hourly energy usage data (CSV), and the system analyzes their consumption patterns, calculates costs across 100+ energy plans, and provides personalized recommendations using AI-generated explanations.

### Key Features
- CSV upload for hourly usage data (8,760 data points per year)
- Analysis of 100+ energy plans with varying complexity
- AI-powered usage pattern insights
- Personalized plan recommendations with explanations
- Interactive cost comparison charts
- No user authentication or data persistence (ephemeral demo)

### Core Technologies
- **Frontend:** Next.js 16 (App Router), React, TypeScript
- **UI:** shadcn/ui, Tailwind CSS, Recharts v3
- **AI:** OpenAI API (GPT-4o for parsing, GPT-4o-mini for runtime)
- **Deployment:** Vercel
- **Data Storage:** Static JSON files in repository

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js Frontend (React)                 │  │
│  │  • CSV Upload Component                              │  │
│  │  • Usage Insights Dashboard                          │  │
│  │  • Plan Comparison Interface                         │  │
│  │  • Recommendation Cards                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Next.js API Routes (Serverless)            │  │
│  │  • POST /api/analyze (Usage Pattern Analysis)        │  │
│  │  • POST /api/recommendations (Plan Explanations)     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Parallel Requests
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       OpenAI API                            │
│  • GPT-4o-mini for usage analysis                          │
│  • GPT-4o-mini for recommendation explanations             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Static Data (Git Repo)                    │
│  /data/plans/plans-structured.json (100+ plans)            │
│  /data/plans/plans-raw.json (original descriptions)        │
│  /data/sample-csvs/*.csv (sample usage data)               │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **User uploads CSV** → Frontend validates and parses
2. **Frontend calculates costs** → Pure JavaScript math (no API call)
3. **Frontend makes parallel AI requests**:
   - POST /api/analyze → Get usage insights
   - POST /api/recommendations → Get plan explanations
4. **Display results** → Show insights, plans, and comparison chart

---

## Architecture Diagram

### Component Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend Layer                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Upload     │  │   Analysis   │  │    Plans     │            │
│  │   Page       │  │   Dashboard  │  │    Grid      │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│         │                  │                  │                   │
│         └──────────────────┴──────────────────┘                   │
│                           │                                        │
│  ┌────────────────────────┴─────────────────────────────┐        │
│  │              Application State (React)                │        │
│  │  • Usage Data (hourly array)                         │        │
│  │  • Calculated Plan Costs                             │        │
│  │  • Selected Plans (for comparison)                   │        │
│  │  • AI Insights (cached)                              │        │
│  │  • Loading States                                    │        │
│  └──────────────────────────────────────────────────────┘        │
│                           │                                        │
└───────────────────────────┼────────────────────────────────────────┘
                            │
┌───────────────────────────┼────────────────────────────────────────┐
│                           │      Core Library Layer                │
├───────────────────────────┼────────────────────────────────────────┤
│                           │                                        │
│  ┌────────────────────────┴──────────────────┐                   │
│  │           Calculation Engine               │                   │
│  │  • calculatePlanCost()                    │                   │
│  │  • rankPlans()                            │                   │
│  │  • calculateMonthlyBreakdown()            │                   │
│  │  • calculateTDUCharges()                  │                   │
│  └───────────────────────────────────────────┘                   │
│                           │                                        │
│  ┌────────────────────────┴──────────────────┐                   │
│  │          Data Processing                   │                   │
│  │  • parseCSV()                             │                   │
│  │  • validateUsageData()                    │                   │
│  │  • calculateStatistics()                  │                   │
│  │  • aggregateByMonth()                     │                   │
│  └───────────────────────────────────────────┘                   │
│                           │                                        │
│  ┌────────────────────────┴──────────────────┐                   │
│  │           AI Client                        │                   │
│  │  • analyzeUsagePatterns()                 │                   │
│  │  • generateRecommendations()              │                   │
│  │  • callOpenAI()                           │                   │
│  └───────────────────────────────────────────┘                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┼────────────────────────────────────────┐
│                    API Layer (Serverless)                          │
├───────────────────────────┼────────────────────────────────────────┤
│                           │                                        │
│  POST /api/analyze        │   POST /api/recommendations           │
│  ┌───────────────────┐    │   ┌───────────────────┐               │
│  │ • Validate input  │    │   │ • Validate input  │               │
│  │ • Build prompt    │    │   │ • Build prompt    │               │
│  │ • Call OpenAI     │    │   │ • Call OpenAI     │               │
│  │ • Parse response  │    │   │ • Parse response  │               │
│  │ • Return JSON     │    │   │ • Return JSON     │               │
│  └───────────────────┘    │   └───────────────────┘               │
│                           │                                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x | React framework with App Router |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | Latest | Component library |
| Recharts | 3.x | Data visualization |
| date-fns | 2.x | Date manipulation |
| Zod | 3.x | Runtime validation |

### Backend / API
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 16.x | Serverless API endpoints |
| Vercel AI SDK | Latest | AI streaming and utilities |
| OpenAI SDK | 4.x | OpenAI API client |

### AI Models
| Model | Use Case | Cost |
|-------|----------|------|
| GPT-4o | Plan parsing (batch, one-time) | ~$0.005 per plan |
| GPT-4o-mini | Usage analysis (per session) | ~$0.001 per request |
| GPT-4o-mini | Recommendations (per session) | ~$0.001 per request |

### Development & Deployment
| Technology | Purpose |
|------------|---------|
| Git | Version control |
| GitHub | Code repository |
| Vercel | Hosting and deployment |
| ESLint | Code linting |
| Prettier | Code formatting |

---

## Data Models

### Core TypeScript Types

```typescript
// ============================================================
// USAGE DATA TYPES
// ============================================================

interface HourlyUsageData {
  timestamp: Date;
  kWh: number;
}

interface UsageStatistics {
  totalAnnualKwh: number;
  averageDailyKwh: number;
  averageMonthlyKwh: number;
  peakUsageHour: number; // 0-23
  peakUsageDay: Date;
  minMonthlyKwh: number;
  maxMonthlyKwh: number;
  monthlyBreakdown: MonthlyUsage[];
}

interface MonthlyUsage {
  month: string; // "2024-01"
  totalKwh: number;
  averageDailyKwh: number;
  peakKwh: number;
  offPeakKwh: number;
}

// ============================================================
// PLAN DATA TYPES
// ============================================================

interface EnergyPlan {
  id: string;
  provider: string;
  name: string;
  description: string; // Original text for reference
  
  // Pricing rules (evaluated in order)
  pricingRules: PricingRule[];
  
  // Metadata
  features: {
    renewablePercent: number; // 0-100
    contractMonths: number;
    earlyTerminationFee: number;
    flexibility: 'high' | 'medium' | 'low';
    predictability: 'high' | 'medium' | 'low';
  };
  
  // Source tracking
  source: 'real' | 'synthetic';
  sourceUrl?: string; // For real plans
}

type PricingRule = 
  | BasChargeRule
  | FlatRateRule
  | TieredRule
  | TimeOfUseRule
  | SeasonalRule
  | BillCreditRule;

interface BaseChargeRule {
  type: 'BASE_CHARGE';
  amountPerMonth: number;
}

interface FlatRateRule {
  type: 'FLAT_RATE';
  ratePerKwh: number;
}

interface TieredRule {
  type: 'TIERED';
  tiers: Array<{
    maxKwh: number | null; // null = infinity
    ratePerKwh: number;
  }>;
}

interface TimeOfUseRule {
  type: 'TIME_OF_USE';
  schedule: Array<{
    hours: number[]; // [0-23]
    daysOfWeek: number[]; // [0-6, 0=Sunday]
    ratePerKwh: number;
  }>;
}

interface SeasonalRule {
  type: 'SEASONAL';
  months: number[]; // [1-12]
  rateModifier: number; // Applied to base rate
}

interface BillCreditRule {
  type: 'BILL_CREDIT';
  amount: number; // Dollar amount
  minKwh: number;
  maxKwh: number | null;
}

// ============================================================
// TDU (TRANSMISSION & DISTRIBUTION UTILITY)
// ============================================================

interface TDUCharges {
  provider: string; // "Oncor", "CenterPoint", etc.
  monthlyFee: number; // Fixed monthly charge
  perKwhFee: number; // Per kWh delivery charge
}

// Standard TDU charges (fixed for demo)
const STANDARD_TDU: TDUCharges = {
  provider: "Oncor",
  monthlyFee: 4.50,
  perKwhFee: 0.035
};

// ============================================================
// CALCULATION RESULTS
// ============================================================

interface PlanCostResult {
  planId: string;
  totalAnnualCost: number;
  averageMonthlyCost: number;
  monthlyBreakdown: MonthlyCost[];
  effectiveRatePerKwh: number;
  savingsVsAverage: number;
}

interface MonthlyCost {
  month: string; // "2024-01"
  cost: number;
  kwhUsed: number;
  effectiveRate: number;
}

// ============================================================
// AI RESPONSE TYPES
// ============================================================

interface UsageInsights {
  summary: string;
  patterns: {
    peakUsageTimes: string;
    seasonalTrends: string;
    weekdayVsWeekend: string;
  };
  recommendations: string[];
  userProfile: 'night-owl' | 'solar-home' | 'typical-family' | 'high-usage' | 'low-usage';
}

interface PlanRecommendation {
  planId: string;
  reasoning: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  potentialSavings: string;
}

// ============================================================
// USER PREFERENCES
// ============================================================

interface UserPreferences {
  priority: 'cost' | 'renewable' | 'flexibility' | 'predictability';
  maxContractMonths?: number;
  minRenewablePercent?: number;
}
```

---

## Core Components

### 1. CSV Upload Component
**Location:** `/components/features/CSVUpload.tsx`

**Purpose:** Handle file upload, validation, and parsing

**Key Features:**
- Drag-and-drop interface
- File validation (CSV format, size)
- Real-time parsing progress
- Error handling with helpful messages
- Sample CSV download links

**Implementation:**
```typescript
interface CSVUploadProps {
  onUploadComplete: (data: HourlyUsageData[]) => void;
  onError: (error: string) => void;
}

export function CSVUpload({ onUploadComplete, onError }: CSVUploadProps) {
  // Drag-and-drop handlers
  // File validation
  // CSV parsing logic
  // Progress indication
}
```

### 2. Usage Dashboard Component
**Location:** `/components/features/UsageDashboard.tsx`

**Purpose:** Display usage statistics and AI insights

**Key Features:**
- Total consumption metrics
- Monthly usage chart (Recharts)
- AI-generated insights
- Peak usage indicators
- Seasonal patterns visualization

### 3. Plan Grid Component
**Location:** `/components/features/PlanGrid.tsx`

**Purpose:** Display all available plans with filtering/sorting

**Key Features:**
- Virtualized list for performance (100+ plans)
- Multi-criteria filtering
- Sorting options
- Selection for comparison
- Plan complexity indicators

### 4. Plan Card Component
**Location:** `/components/features/PlanCard.tsx`

**Purpose:** Display individual plan details

**Key Features:**
- Plan name, provider, cost
- Key features (renewable %, contract length)
- "Select to Compare" button
- Pricing structure indicator
- AI recommendation badge (for top 3)

### 5. Comparison Chart Component
**Location:** `/components/features/ComparisonChart.tsx`

**Purpose:** Interactive chart comparing selected plans

**Key Features:**
- Line/bar chart toggle
- Monthly cost breakdown
- Interactive tooltips
- Legend with plan names
- Clear selection button

### 6. Recommendation Cards Component
**Location:** `/components/features/RecommendationCards.tsx`

**Purpose:** Display top 3 recommended plans with AI explanations

**Key Features:**
- Highlighted design
- AI-generated reasoning
- Pros/cons lists
- Savings calculator
- "Good for" badges

---

## AI Integration Strategy

### Overview
AI is used strategically in two places:
1. **One-time batch processing** (Plan parsing) - GPT-4o
2. **Runtime per-user** (Usage analysis + Recommendations) - GPT-4o-mini

### Batch Processing: Plan Parsing

**Purpose:** Convert natural language plan descriptions into structured JSON

**Model:** GPT-4o (higher accuracy for complex parsing)

**Frequency:** Once during setup, then as needed when adding new plans

**Process:**
```
Input: plans-raw.json (plan descriptions)
  ↓
Node.js script calls OpenAI API for each plan
  ↓
GPT-4o extracts pricing rules, features, terms
  ↓
Validate and save to plans-structured.json
  ↓
Commit to repo (static data)
```

**Prompt Structure:**
```typescript
const planParsingPrompt = `
You are an expert at parsing electricity plan descriptions from Texas energy providers.

Given the following plan description, extract all pricing information and structure it as JSON.

PLAN DESCRIPTION:
${planDescription}

Extract the following information:
1. Provider name
2. Plan name
3. Pricing rules (identify all applicable types):
   - Base monthly charges
   - Flat rates per kWh
   - Tiered pricing (specify tiers and thresholds)
   - Time-of-use rates (specify hours and rates)
   - Seasonal variations (specify months and rates)
   - Bill credits (specify conditions and amounts)
4. Contract terms:
   - Length in months
   - Early termination fee
5. Features:
   - Renewable energy percentage
   - Flexibility rating (high/medium/low)
   - Predictability rating (high/medium/low)

Return a JSON object matching this exact structure:
{
  "provider": "string",
  "name": "string",
  "pricingRules": [...],
  "features": {...}
}

Important:
- If information is unclear or missing, use reasonable defaults
- For tiered pricing, use null for unlimited top tier
- Convert all rates to cents per kWh
- Be precise with conditions (e.g., bill credit thresholds)
`;
```

**Cost Analysis:**
- ~$0.005 per plan × 30 real plans = **$0.15 one-time cost**
- Acceptable for demo purposes

### Runtime: Usage Analysis

**Purpose:** Analyze hourly usage data and generate insights

**Model:** GPT-4o-mini (fast, cheap, good for this task)

**Frequency:** Once per user session

**API Route:** `POST /api/analyze`

**Input:**
```typescript
{
  usageData: HourlyUsageData[],  // 8,760 points (summarized)
  statistics: UsageStatistics
}
```

**Output:**
```typescript
{
  insights: UsageInsights
}
```

**Prompt Structure:**
```typescript
const usageAnalysisPrompt = `
Analyze this customer's electricity usage pattern and provide personalized insights.

USAGE SUMMARY:
- Total annual consumption: ${stats.totalAnnualKwh} kWh
- Average monthly: ${stats.averageMonthlyKwh} kWh
- Peak usage hour: ${stats.peakUsageHour}:00
- Highest usage month: ${stats.maxMonth}
- Lowest usage month: ${stats.minMonth}

HOURLY PATTERNS (sample):
${hourlyPatternSummary}

MONTHLY BREAKDOWN:
${monthlyBreakdown}

Generate insights about:
1. Peak usage times (identify patterns like "night owl", "9-5 worker", etc.)
2. Seasonal trends (summer AC, winter heating, etc.)
3. Weekday vs weekend patterns
4. Specific recommendations to save energy or optimize plan selection

Classify the user profile as one of:
- night-owl: High evening/night usage
- solar-home: Low daytime, high evening
- typical-family: Standard 9-5 pattern
- high-usage: Above average consumption
- low-usage: Below average consumption

Return a JSON object with this structure:
{
  "summary": "One paragraph overview",
  "patterns": {
    "peakUsageTimes": "...",
    "seasonalTrends": "...",
    "weekdayVsWeekend": "..."
  },
  "recommendations": ["...", "...", "..."],
  "userProfile": "night-owl"
}
`;
```

**Caching Strategy:**
- Cache response in session storage keyed by CSV content hash
- Avoid redundant API calls for same dataset
- Clear cache on new upload

### Runtime: Plan Recommendations

**Purpose:** Generate personalized explanations for top 3 recommended plans

**Model:** GPT-4o-mini

**Frequency:** Once per user session (or when preferences change)

**API Route:** `POST /api/recommendations`

**Input:**
```typescript
{
  usageInsights: UsageInsights,
  topPlans: PlanCostResult[],
  planDetails: EnergyPlan[],
  userPreferences: UserPreferences
}
```

**Output:**
```typescript
{
  recommendations: PlanRecommendation[]
}
```

**Prompt Structure:**
```typescript
const recommendationPrompt = `
Given this customer's usage profile and priorities, explain why each of these 3 plans is recommended.

CUSTOMER PROFILE:
${usageInsights.userProfile}

USAGE PATTERNS:
${JSON.stringify(usageInsights.patterns)}

USER PRIORITIES:
${userPreferences.priority}

TOP 3 PLANS:
${topPlans.map(plan => `
  Plan: ${plan.name} by ${plan.provider}
  Annual Cost: $${plan.totalAnnualCost}
  Renewable: ${plan.renewablePercent}%
  Contract: ${plan.contractMonths} months
  Pricing: ${describePricingStructure(plan)}
`).join('\n')}

For each plan, provide:
1. Why it's a good fit for this customer
2. Pros (3-4 specific benefits for their usage pattern)
3. Cons (2-3 potential drawbacks or considerations)
4. "Best for" description (one sentence)
5. Estimated savings vs. their likely current plan

Return JSON array of 3 recommendations:
[
  {
    "planId": "...",
    "reasoning": "...",
    "pros": ["...", "...", "..."],
    "cons": ["...", "..."],
    "bestFor": "...",
    "potentialSavings": "..."
  }
]
`;
```

### Parallel Execution

Both AI calls run in parallel after the user uploads CSV:

```typescript
async function analyzeAndRecommend(
  usageData: HourlyUsageData[],
  plans: PlanCostResult[]
) {
  // Execute both AI calls in parallel
  const [insights, recommendations] = await Promise.all([
    fetch('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ usageData, statistics })
    }).then(r => r.json()),
    
    fetch('/api/recommendations', {
      method: 'POST',
      body: JSON.stringify({ topPlans, planDetails, preferences })
    }).then(r => r.json())
  ]);

  return { insights, recommendations };
}
```

**Benefits:**
- Faster user experience (parallel vs sequential)
- Both complete in ~2-3 seconds total
- Independent failure handling

### Cost Analysis (Per User Session)

| Operation | Model | Cost per Request | Frequency |
|-----------|-------|------------------|-----------|
| Usage Analysis | GPT-4o-mini | ~$0.001 | Once per session |
| Recommendations | GPT-4o-mini | ~$0.001 | Once per session |
| **Total per user** | | **~$0.002** | |

**Expected Demo Usage:**
- 100 demo sessions = $0.20
- 1,000 sessions = $2.00
- Very affordable for a demo

---

## Calculation Engine

### Overview
The calculation engine is pure JavaScript with no external dependencies. All calculations happen client-side for maximum performance.

### Core Function: calculatePlanCost()

```typescript
function calculatePlanCost(
  usageData: HourlyUsageData[],
  plan: EnergyPlan,
  tduCharges: TDUCharges
): PlanCostResult {
  let totalCost = 0;
  const monthlyBreakdown: MonthlyCost[] = [];

  // Group usage by month
  const monthlyUsage = aggregateByMonth(usageData);

  // Process each month
  for (const month of monthlyUsage) {
    let monthlyCost = 0;

    // Apply each pricing rule in order
    for (const rule of plan.pricingRules) {
      monthlyCost += applyPricingRule(rule, month, plan);
    }

    // Add TDU charges
    monthlyCost += tduCharges.monthlyFee;
    monthlyCost += month.totalKwh * tduCharges.perKwhFee;

    totalCost += monthlyCost;
    monthlyBreakdown.push({
      month: month.month,
      cost: monthlyCost,
      kwhUsed: month.totalKwh,
      effectiveRate: monthlyCost / month.totalKwh
    });
  }

  return {
    planId: plan.id,
    totalAnnualCost: totalCost,
    averageMonthlyCost: totalCost / 12,
    monthlyBreakdown,
    effectiveRatePerKwh: totalCost / sum(monthlyUsage.map(m => m.totalKwh)),
    savingsVsAverage: 0 // Calculated later in ranking
  };
}
```

### Pricing Rule Handlers

Each pricing rule type has its own handler:

```typescript
function applyPricingRule(
  rule: PricingRule,
  monthData: MonthlyUsage,
  plan: EnergyPlan
): number {
  switch (rule.type) {
    case 'BASE_CHARGE':
      return rule.amountPerMonth;

    case 'FLAT_RATE':
      return monthData.totalKwh * rule.ratePerKwh;

    case 'TIERED':
      return calculateTieredCost(monthData.totalKwh, rule.tiers);

    case 'TIME_OF_USE':
      return calculateTOUCost(monthData.hourlyData, rule.schedule);

    case 'SEASONAL':
      if (rule.months.includes(getMonth(monthData.month))) {
        return monthData.totalKwh * rule.rateModifier;
      }
      return 0;

    case 'BILL_CREDIT':
      if (
        monthData.totalKwh >= rule.minKwh &&
        (rule.maxKwh === null || monthData.totalKwh <= rule.maxKwh)
      ) {
        return -rule.amount; // Credit is negative cost
      }
      return 0;

    default:
      throw new Error(`Unknown pricing rule type: ${rule}`);
  }
}
```

### Tiered Pricing Logic

```typescript
function calculateTieredCost(
  totalKwh: number,
  tiers: Array<{ maxKwh: number | null; ratePerKwh: number }>
): number {
  let cost = 0;
  let remainingKwh = totalKwh;

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    const prevMax = i > 0 ? tiers[i - 1].maxKwh || 0 : 0;
    const tierMax = tier.maxKwh === null ? Infinity : tier.maxKwh;
    const tierKwh = Math.min(remainingKwh, tierMax - prevMax);

    if (tierKwh > 0) {
      cost += tierKwh * tier.ratePerKwh;
      remainingKwh -= tierKwh;
    }

    if (remainingKwh <= 0) break;
  }

  return cost;
}
```

### Time-of-Use Logic

```typescript
function calculateTOUCost(
  hourlyData: HourlyUsageData[],
  schedule: Array<{
    hours: number[];
    daysOfWeek: number[];
    ratePerKwh: number;
  }>
): number {
  let cost = 0;

  for (const dataPoint of hourlyData) {
    const hour = dataPoint.timestamp.getHours();
    const dayOfWeek = dataPoint.timestamp.getDay();

    // Find matching schedule
    const matchingSchedule = schedule.find(s =>
      s.hours.includes(hour) && s.daysOfWeek.includes(dayOfWeek)
    );

    if (matchingSchedule) {
      cost += dataPoint.kWh * matchingSchedule.ratePerKwh;
    }
  }

  return cost;
}
```

### Ranking Algorithm

```typescript
function rankPlans(
  planResults: PlanCostResult[],
  preferences: UserPreferences,
  plans: EnergyPlan[]
): PlanCostResult[] {
  // Calculate savings vs average
  const avgCost = average(planResults.map(p => p.totalAnnualCost));
  planResults.forEach(result => {
    result.savingsVsAverage = avgCost - result.totalAnnualCost;
  });

  // Score each plan based on preferences
  const scoredPlans = planResults.map(result => {
    const plan = plans.find(p => p.id === result.planId)!;
    let score = 0;

    switch (preferences.priority) {
      case 'cost':
        // Lower cost = higher score
        score = 10000 - result.totalAnnualCost;
        break;

      case 'renewable':
        // Higher renewable % = higher score, with cost as tiebreaker
        score = plan.features.renewablePercent * 100 - result.totalAnnualCost * 0.1;
        break;

      case 'flexibility':
        // Flexibility rating + inverse of contract length
        const flexScore = {
          high: 100,
          medium: 50,
          low: 0
        }[plan.features.flexibility];
        score = flexScore - plan.features.contractMonths - result.totalAnnualCost * 0.01;
        break;

      case 'predictability':
        // Predictability rating - cost variation
        const predScore = {
          high: 100,
          medium: 50,
          low: 0
        }[plan.features.predictability];
        score = predScore - result.totalAnnualCost * 0.01;
        break;
    }

    return { ...result, score };
  });

  // Sort by score (descending)
  return scoredPlans.sort((a, b) => b.score - a.score);
}
```

---

## Data Flow

### Complete User Journey

```
1. USER ARRIVES
   ↓
   Landing page with upload interface
   ↓
2. USER UPLOADS CSV
   ↓
   [Frontend] Validate file format
   ↓
   [Frontend] Parse CSV → HourlyUsageData[]
   ↓
   [Frontend] Calculate basic statistics
   ↓
3. SHOW INITIAL INSIGHTS
   ↓
   Display usage statistics
   Display monthly chart
   ↓
4. CALCULATE ALL PLAN COSTS
   ↓
   [Frontend] Load plans-structured.json
   ↓
   [Frontend] For each plan:
     - Apply all pricing rules
     - Calculate monthly costs
     - Calculate annual total
   ↓
   [Frontend] Rank plans by user preferences
   ↓
5. PARALLEL AI CALLS
   ↓
   [API] POST /api/analyze          [API] POST /api/recommendations
   ↓                                 ↓
   [OpenAI] Analyze patterns         [OpenAI] Generate explanations
   ↓                                 ↓
   Return insights                   Return recommendations
   ↓
6. DISPLAY RESULTS
   ↓
   Update insights with AI analysis
   Show top 3 recommended plans with AI explanations
   Display all plans grid
   Show comparison chart (default: top 3)
   ↓
7. USER INTERACTION
   ↓
   User can:
   - Select different plans for comparison
   - Filter/sort plans
   - View detailed plan information
   - Change preferences (triggers re-ranking)
   ↓
8. USER LEAVES
   ↓
   All data cleared (ephemeral, no persistence)
```

### State Management

**React State Structure:**
```typescript
interface AppState {
  // Upload state
  uploadedFile: File | null;
  usageData: HourlyUsageData[] | null;
  statistics: UsageStatistics | null;

  // Plan data
  plans: EnergyPlan[];
  planResults: PlanCostResult[] | null;
  rankedPlans: PlanCostResult[] | null;

  // AI state
  insights: UsageInsights | null;
  recommendations: PlanRecommendation[] | null;
  insightsLoading: boolean;
  recommendationsLoading: boolean;

  // UI state
  selectedPlans: string[]; // Max 3 IDs
  userPreferences: UserPreferences;
  filters: PlanFilters;
  sortBy: SortOption;

  // Error state
  error: string | null;
}
```

**State Updates:**
1. File upload → Update `uploadedFile`, `usageData`, `statistics`
2. Calculate costs → Update `planResults`, `rankedPlans`
3. AI responses → Update `insights`, `recommendations`
4. User interactions → Update `selectedPlans`, `filters`, `sortBy`

---

## API Design

### POST /api/analyze

**Purpose:** Analyze usage patterns and generate insights

**Request:**
```typescript
POST /api/analyze
Content-Type: application/json

{
  "usageData": HourlyUsageData[], // Summarized (not all 8,760 points)
  "statistics": UsageStatistics
}
```

**Response:**
```typescript
200 OK
Content-Type: application/json

{
  "insights": UsageInsights
}
```

**Error Responses:**
```typescript
400 Bad Request - Invalid input data
429 Too Many Requests - Rate limit exceeded
500 Internal Server Error - OpenAI API error
```

**Implementation:**
```typescript
// app/api/analyze/route.ts
export async function POST(request: Request) {
  try {
    const { usageData, statistics } = await request.json();

    // Validate input
    if (!usageData || !statistics) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call OpenAI
    const insights = await analyzeUsagePatterns(usageData, statistics);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze usage data' },
      { status: 500 }
    );
  }
}
```

### POST /api/recommendations

**Purpose:** Generate personalized plan recommendations

**Request:**
```typescript
POST /api/recommendations
Content-Type: application/json

{
  "usageInsights": UsageInsights,
  "topPlans": PlanCostResult[],
  "planDetails": EnergyPlan[],
  "userPreferences": UserPreferences
}
```

**Response:**
```typescript
200 OK
Content-Type: application/json

{
  "recommendations": PlanRecommendation[]
}
```

**Error Responses:**
```typescript
400 Bad Request - Invalid input data
429 Too Many Requests - Rate limit exceeded
500 Internal Server Error - OpenAI API error
```

---

## Frontend Architecture

### Component Hierarchy

```
App
├── Layout
│   ├── Header
│   └── Footer
└── HomePage
    ├── HeroSection
    │   └── CSVUpload
    ├── UsageDashboard (conditional)
    │   ├── StatisticsCards
    │   ├── MonthlyChart
    │   └── AIInsights
    ├── RecommendationsSection (conditional)
    │   └── RecommendationCards (× 3)
    ├── ComparisonChart (conditional)
    └── PlansSection (conditional)
        ├── FilterBar
        ├── SortControls
        └── PlanGrid
            └── PlanCard (× 100+)
```

### Key UI Patterns

**Progressive Disclosure:**
- Start with simple upload interface
- Reveal sections as data becomes available
- Show loading states during AI processing
- Use skeleton screens for better UX

**Responsive Design:**
- Mobile-first approach
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- Charts adapt to screen size
- Plan cards stack on mobile, grid on desktop

**Accessibility:**
- Semantic HTML throughout
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- Color contrast ratios meet WCAG 2.1 AA

---

## Deployment Architecture

### Vercel Configuration

**Project Structure:**
```
vercel.json (optional, uses defaults)
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

**Environment Variables (Vercel Dashboard):**
```
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=https://arbor-energy-demo.vercel.app
```

**Build Settings:**
- Framework: Next.js
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install`
- Node.js Version: 18.x

### Deployment Process

**Automatic Deployments:**
1. Push to `main` branch → Production deployment
2. Push to feature branches → Preview deployment
3. Pull requests → Preview deployment with comments

**Manual Deployment:**
```bash
# Via Vercel CLI
vercel --prod
```

### Performance Optimization

**Static Assets:**
- All plan data stored as static JSON
- Served via Vercel CDN (global edge network)
- Automatic compression and caching

**API Routes:**
- Serverless functions (auto-scaling)
- Cold start optimization
- 10-second timeout (plenty for OpenAI calls)

**Frontend Optimization:**
- Code splitting (automatic with Next.js)
- Image optimization (Next.js Image component)
- Lazy loading for plan cards
- Virtualization for long lists

---

## Security & Privacy

### Data Privacy

**Key Principles:**
1. **No data persistence** - Everything is ephemeral
2. **No user tracking** - No analytics beyond basic Vercel metrics
3. **No authentication** - Open demo, no user accounts

**Data Handling:**
- CSV data never leaves browser except for summarized AI analysis
- Usage data sent to OpenAI is anonymized (no PII)
- No storage of user data on server
- Session storage only (cleared on browser close)

### API Security

**OpenAI API Key:**
- Stored in Vercel environment variables (encrypted)
- Never exposed to client
- Used only in server-side API routes

**Rate Limiting:**
- Vercel automatically rate limits API routes
- Additional OpenAI rate limits (tier-based)
- Graceful degradation if limits hit

**Input Validation:**
- Zod schemas for all API inputs
- CSV file size limits (10 MB max)
- Sanitization of all user inputs

### CORS & CSP

**CORS Policy:**
- API routes only accept requests from same origin
- No cross-origin requests needed

**Content Security Policy:**
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];
```

---

## Performance Considerations

### Frontend Performance

**Initial Load:**
- Target: < 3 seconds on 3G
- Lazy load non-critical components
- Prefetch critical resources
- Use Next.js Image optimization

**Runtime Performance:**
- Plan calculations: < 500ms for 100 plans
- Chart rendering: < 200ms with Recharts
- Smooth scrolling with virtualization
- Debounced filtering/sorting

**Memory Management:**
- Efficient data structures
- Clean up on component unmount
- Avoid memory leaks in event listeners
- Limit concurrent AI requests (max 2)

### Backend Performance

**API Response Times:**
- Target: < 5 seconds for AI calls
- Parallel execution of independent operations
- Caching where appropriate
- Graceful timeout handling

**Scalability:**
- Serverless auto-scaling
- No database bottlenecks (static data)
- CDN for static assets
- Edge network for global reach

### Monitoring

**Key Metrics:**
- Page load time
- Time to interactive
- API response times
- OpenAI API errors/rate limits
- User drop-off points

**Tools:**
- Vercel Analytics (built-in)
- OpenAI API dashboard
- Browser DevTools for local testing

---

## Error Handling

### Frontend Error Handling

**CSV Upload Errors:**
- Invalid format → Clear message + example
- Wrong number of rows → Helpful explanation
- Missing data → Specific row/column indication
- File too large → Size limit info

**Calculation Errors:**
- Invalid plan data → Skip plan + log warning
- Math errors → Fallback to simple calculation
- Display partial results if possible

**AI API Errors:**
- Rate limit → Retry with exponential backoff
- Timeout → Show cached/fallback content
- Network error → Retry with manual button
- Invalid response → Use default explanations

**User-Facing Error Messages:**
```typescript
// Examples of good error messages
"Oops! This file doesn't look like a valid usage CSV. Please download one of our sample files to see the expected format."

"We're having trouble analyzing your usage patterns right now. Don't worry—we've still calculated your plan costs!"

"Too many people are using the demo right now. Please try again in a minute."
```

### Backend Error Handling

**API Route Pattern:**
```typescript
export async function POST(request: Request) {
  try {
    // Validate input
    const data = await request.json();
    const validated = schema.parse(data);

    // Process request
    const result = await processData(validated);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof OpenAIError) {
      // Handle OpenAI-specific errors
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again shortly.' },
          { status: 429 }
        );
      }
    }

    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
```

### Retry Logic

**Exponential Backoff:**
```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) {
        return response;
      }

      // Only retry on rate limits or server errors
      if (response.status === 429 || response.status >= 500) {
        if (i < maxRetries - 1) {
          const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }

  throw new Error('Max retries exceeded');
}
```

---

## Future Extensibility

### Planned Enhancements

**Phase 2 Features:**
- User accounts and saved comparisons
- Email sharing of recommendations
- PDF export of analysis
- More complex plan types (demand charges, etc.)
- Real-time plan data updates
- Comparison with current bill (user uploads bill)

**Technical Improvements:**
- Server-side rendering for SEO
- Progressive Web App (PWA) support
- Offline mode with cached plans
- A/B testing framework
- Advanced analytics

**AI Enhancements:**
- Fine-tuned model for plan parsing
- Conversational UI for plan exploration
- Predictive usage modeling
- Personalized energy-saving tips

### Extensibility Points

**Adding New Plan Types:**
1. Define new `PricingRule` type
2. Implement handler in `applyPricingRule()`
3. Update AI parsing prompt
4. Add unit tests
5. Update UI to display new type

**Integrating Real-Time Data:**
1. Add API routes for external data sources
2. Implement caching layer
3. Update plan data on schedule
4. Add data freshness indicators

**Multi-Region Support:**
1. Abstract TDU charges by region
2. Add region selector
3. Maintain separate plan catalogs
4. Update AI prompts for regional context

---

## Appendix

### File Structure

```
arbor-energy-agent/
├── app/
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.ts
│   │   └── recommendations/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── features/
│   │   ├── CSVUpload.tsx
│   │   ├── UsageDashboard.tsx
│   │   ├── PlanGrid.tsx
│   │   ├── PlanCard.tsx
│   │   ├── ComparisonChart.tsx
│   │   └── RecommendationCards.tsx
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── ... (shadcn components)
├── lib/
│   ├── ai/
│   │   ├── analyze.ts
│   │   ├── recommend.ts
│   │   └── client.ts
│   ├── calculations/
│   │   ├── plan-costs.ts
│   │   ├── pricing-rules.ts
│   │   └── ranking.ts
│   ├── types/
│   │   ├── usage.ts
│   │   ├── plan.ts
│   │   └── ai.ts
│   └── utils/
│       ├── csv.ts
│       ├── date.ts
│       └── format.ts
├── data/
│   ├── plans/
│   │   ├── plans-raw.json
│   │   └── plans-structured.json
│   └── sample-csvs/
│       ├── night-owl-user.csv
│       ├── solar-home-user.csv
│       └── typical-family.csv
├── scripts/
│   └── parse-plans.ts
├── public/
│   └── ... (static assets)
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### Key Dependencies

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "typescript": "^5.0.0",
    "openai": "^4.0.0",
    "ai": "^3.0.0",
    "recharts": "^3.0.0",
    "date-fns": "^2.30.0",
    "zod": "^3.22.0",
    "tailwindcss": "^4.0.0",
    "@radix-ui/react-*": "latest"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0"
  }
}
```

### Environment Variables

```bash
# .env.local
OPENAI_API_KEY=sk-...

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Document Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-11 | Initial architecture document |

---

**End of Architecture Document**
