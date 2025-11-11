# Project Context

## Purpose
The AI Energy Plan Recommendation Agent is a Next.js web application that helps users in deregulated energy markets (specifically Texas) find optimal electricity plans. Users upload their hourly energy usage data (CSV format with 8,760 data points per year), and the system:

- Analyzes consumption patterns using AI
- Calculates costs across 100+ energy plans with varying complexity
- Provides personalized recommendations with AI-generated explanations
- Displays interactive cost comparison charts

This is an ephemeral demo application with no user authentication or data persistence.

## Tech Stack
- **Framework:** Next.js 16.0.1 (App Router)
- **UI Library:** React 19.2.0
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 4.x
- **Component Library:** shadcn/ui
- **Data Visualization:** Recharts 3.x
- **AI Integration:** OpenAI API (GPT-4o-mini for runtime, GPT-4o for batch parsing)
- **Deployment:** Vercel
- **Package Manager:** pnpm
- **Linting:** ESLint with Next.js config

## Project Conventions

### Code Style
- **TypeScript:** Strict mode enabled, prefer explicit types over `any`
- **Naming:** 
  - Components: PascalCase (e.g., `CSVUpload.tsx`)
  - Functions/variables: camelCase (e.g., `calculatePlanCost`)
  - Types/interfaces: PascalCase (e.g., `EnergyPlan`, `UsageStatistics`)
  - Constants: UPPER_SNAKE_CASE (e.g., `STANDARD_TDU`)
- **File Organization:**
  - Feature components in `/components/features/`
  - UI components in `/components/ui/` (shadcn)
  - Business logic in `/lib/` (calculations, AI, utils, types)
  - API routes in `/app/api/`
  - Static data in `/data/`
- **Formatting:** ESLint with Next.js config, no Prettier (rely on ESLint formatting)
- **Imports:** Use `@/*` path alias for absolute imports

### Architecture Patterns
- **App Router:** Next.js 16 App Router with server components by default
- **Client-Side Calculations:** All plan cost calculations happen client-side for performance
- **Parallel AI Calls:** Usage analysis and recommendations run in parallel via `Promise.all()`
- **Progressive Disclosure:** UI reveals sections as data becomes available
- **Ephemeral State:** All state managed in React, no persistence layer
- **Static Data:** Energy plans stored as JSON files in repository, loaded at runtime
- **Component Structure:** Feature-based organization with clear separation of concerns
- **Type Safety:** Comprehensive TypeScript types for all data structures (see ARCHITECTURE.md)

### Testing Strategy
- **Current Status:** No formal testing framework set up yet
- **Future:** Unit tests for calculation engine, integration tests for API routes
- **Manual Testing:** Test with sample CSV files provided in `/data/sample-csvs/`

### Git Workflow
- **Branching:** Feature branches from `main`
- **Commits:** Descriptive commit messages
- **Deployment:** 
  - `main` branch → Production deployment on Vercel
  - Feature branches → Preview deployments
- **No commits/pushes unless explicitly requested** (per user rules)

## Domain Context
- **Energy Plans:** Electricity plans with complex pricing structures including:
  - Base monthly charges
  - Flat rates per kWh
  - Tiered pricing (different rates for usage tiers)
  - Time-of-use rates (different rates by hour/day)
  - Seasonal variations
  - Bill credits (discounts based on usage thresholds)
- **TDU (Transmission & Distribution Utility):** Fixed charges for delivery (separate from energy supplier charges)
  - Standard TDU: Oncor with $4.50/month + $0.035/kWh
- **Usage Patterns:** 
  - User profiles: night-owl, solar-home, typical-family, high-usage, low-usage
  - Peak usage times, seasonal trends, weekday vs weekend patterns
- **Plan Features:**
  - Renewable energy percentage (0-100%)
  - Contract length in months
  - Early termination fees
  - Flexibility rating (high/medium/low)
  - Predictability rating (high/medium/low)
- **Calculation Engine:** Pure JavaScript, evaluates pricing rules in order, calculates monthly and annual costs

## Important Constraints
- **No Data Persistence:** All user data is ephemeral, cleared when browser session ends
- **No Authentication:** Open demo, no user accounts or login required
- **No User Tracking:** Minimal analytics (only basic Vercel metrics)
- **File Size Limits:** CSV files limited to 10 MB max
- **API Rate Limits:** Subject to OpenAI API rate limits and Vercel function limits
- **Static Plan Data:** Energy plans are stored as static JSON, not dynamically fetched
- **Single Region:** Currently designed for Texas deregulated market (Oncor TDU)
- **Demo Purpose:** This is a demonstration application, not a production service

## External Dependencies
- **OpenAI API:** 
  - Used for usage pattern analysis and plan recommendations
  - API key stored in Vercel environment variables
  - Models: GPT-4o-mini (runtime), GPT-4o (batch plan parsing)
  - Cost: ~$0.002 per user session
- **Vercel:**
  - Hosting and deployment platform
  - Serverless API routes
  - Edge network for global CDN
  - Automatic deployments from Git
- **No Database:** All data is static (JSON files) or ephemeral (in-memory React state)
