/**
 * Pricing rule for energy plans
 * Supports flat-rate, base charges, tiered pricing, and bill credits
 */
export type PricingRule =
  | FlatRatePricing
  | BaseChargePricing
  | TieredPricing
  | BillCreditPricing;

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
 * Energy plan structure
 * Supports flat-rate, tiered pricing, and bill credit plans
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
  /** Pricing complexity: "simple" (flat-rate only), "medium" (tiered or bill credit), "complex" (future: TOU, seasonal) */
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

