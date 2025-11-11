/**
 * Basic pricing rule for energy plans
 * Currently supports flat-rate only, but structured for future expansion
 */
export type PricingRule = FlatRatePricing;

/**
 * Flat-rate pricing: same price per kWh regardless of time
 */
export interface FlatRatePricing {
  type: "flat-rate";
  /** Price per kWh in dollars */
  pricePerKWh: number;
}

/**
 * Basic energy plan structure
 * Currently supports flat-rate plans only
 */
export interface EnergyPlan {
  /** Unique identifier for the plan */
  id: string;
  /** Name of the energy plan */
  name: string;
  /** Provider/company offering the plan */
  provider: string;
  /** Pricing rules for the plan */
  pricing: PricingRule;
  /** Optional description of the plan */
  description?: string;
}

