# Change: Setup Project Foundation

## Why
The project needs a solid foundation with all necessary tooling, dependencies, and infrastructure before building features. This establishes the development environment, project structure, and deployment pipeline that all subsequent slices will depend on.

## What Changes
- Install and configure core dependencies (shadcn/ui, Recharts, Vercel AI SDK)
- Set up environment variable configuration
- Create project directory structure for features, components, and utilities
- Configure Vercel deployment with environment variables
- Establish initial deployment pipeline

**Note:** Vercel AI SDK provides direct OpenAI integration for runtime API routes. OpenAI SDK will be added later (slice 8) for batch processing scripts only.

## Impact
- Affected specs: New capability `project-foundation`
- Affected code: 
  - `package.json` - New dependencies
  - `.env.local` and `.env.example` - Environment configuration
  - Project directory structure - New folders for components, lib, data
  - Vercel configuration - Deployment setup

