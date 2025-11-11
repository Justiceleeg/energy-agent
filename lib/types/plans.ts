/**
 * Basic pricing rule for energy plans
 * Currently supports flat-rate only, but structured for future expansion
 */
export type PricingRule = FlatRatePricing | BaseChargePricing;

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
  pricing: PricingRule[];
  /** Optional base charge per month in dollars */
  baseCharge?: number;
  /** Renewable energy percentage (0-100) */
  renewablePercent: number;
  /** Contract length in months */
  contractLength: number;
  /** Optional description of the plan */
  description?: string;
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
  };
}

