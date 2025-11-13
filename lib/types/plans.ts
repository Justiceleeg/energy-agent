/**
 * Pricing rule for energy plans
 * Supports flat-rate, base charges, tiered pricing, bill credits, time-of-use, and seasonal pricing
 */
export type PricingRule =
  | FlatRatePricing
  | BaseChargePricing
  | TieredPricing
  | BillCreditPricing
  | TimeOfUsePricing
  | SeasonalPricing;

/**
 * Flat-rate pricing: same price per kWh regardless of time
 */
export interface FlatRatePricing {
  type: "FLAT_RATE";
  /** Price per kWh in dollars */
  pricePerKWh: number;
}

/**
 * Base charge: fixed monthly charge
 */
export interface BaseChargePricing {
  type: "BASE_CHARGE";
  /** Amount per month in dollars */
  amountPerMonth: number;
}

/**
 * Tiered pricing: different rates based on usage thresholds
 */
export interface TieredPricing {
  type: "TIERED";
  /** Array of tiers, ordered from lowest to highest threshold */
  tiers: {
    /** Maximum kWh for this tier (null for unlimited) */
    maxKwh: number | null;
    /** Rate per kWh in dollars for this tier */
    ratePerKwh: number;
  }[];
}

/**
 * Bill credit: conditional credit applied based on usage thresholds
 */
export interface BillCreditPricing {
  type: "BILL_CREDIT";
  /** Credit amount in dollars (applied as negative cost) */
  amount: number;
  /** Minimum kWh required for credit (inclusive) */
  minKwh: number;
  /** Maximum kWh for credit (inclusive, null for unlimited) */
  maxKwh: number | null;
}

/**
 * Time-of-use pricing: different rates based on hour of day and day of week
 */
export interface TimeOfUsePricing {
  type: "TIME_OF_USE";
  /** Array of schedule entries defining rates by time period */
  schedule: {
    /** Hours of day (0-23) - array of hour numbers */
    hours: number[];
    /** Days of week (0-6, where 0=Sunday, 1=Monday, ..., 6=Saturday) - array of day numbers */
    days: number[];
    /** Rate per kWh in dollars for this schedule period */
    ratePerKwh: number;
  }[];
}

/**
 * Seasonal pricing: rate modifiers applied to base rates for specific months
 */
export interface SeasonalPricing {
  type: "SEASONAL";
  /** Months (1-12, where 1=January, 2=February, ..., 12=December) - array of month numbers */
  months: number[];
  /** Rate modifier (multiplier) applied to base energy cost for these months */
  rateModifier: number;
}

/**
 * Energy plan structure
 * Supports flat-rate, tiered pricing, bill credit plans, time-of-use, and seasonal pricing
 */
export interface EnergyPlan {
  /** Unique identifier for the plan */
  id: string;
  /** Name of the energy plan */
  name: string;
  /** Provider/company offering the plan */
  provider: string;
  /** Pricing rules for the plan */
  pricing: PricingRule[];
  /** Optional base charge per month in dollars */
  baseCharge?: number;
  /** Renewable energy percentage (0-100) */
  renewablePercent: number;
  /** Contract length in months */
  contractLength: number;
  /** Optional description of the plan */
  description?: string;
  /** Pricing complexity: "simple" (flat-rate only), "medium" (tiered or bill credit), "complex" (TOU, seasonal) */
  complexity?: "simple" | "medium" | "complex";
}

/**
 * Result of plan cost calculation
 */
export interface PlanCostResult {
  /** Total annual cost in dollars */
  annualCost: number;
  /** Average monthly cost in dollars */
  monthlyCost: number;
  /** Cost breakdown by component */
  breakdown: {
    /** Energy cost (from pricing rules) */
    energyCost: number;
    /** Base charges (if any) */
    baseCharges: number;
    /** TDU (Transmission and Distribution Utility) charges */
    tduCharges: number;
    /** Bill credits (if any, negative value) */
    billCredits: number;
  };
}

