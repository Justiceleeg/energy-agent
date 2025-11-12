import { EnergyPlan, PricingRule } from "@/lib/types/plans";

/**
 * Determine the complexity of an energy plan based on its pricing rules
 * @param plan The energy plan to classify
 * @returns "simple" (flat-rate only), "medium" (tiered or bill credit), or "complex" (future: TOU, seasonal)
 */
export function getPlanComplexity(plan: EnergyPlan): "simple" | "medium" | "complex" {
  // If complexity is already set, return it
  if (plan.complexity) {
    return plan.complexity;
  }

  // Check for complex pricing rules (future: TOU, seasonal, etc.)
  // For now, we don't have any complex rules, so this will always return "medium" or "simple"
  const hasComplexRules = plan.pricing.some((rule) => {
    // Future: check for TOU, seasonal, etc.
    return false;
  });

  if (hasComplexRules) {
    return "complex";
  }

  // Check for medium complexity rules (tiered or bill credit)
  const hasMediumRules = plan.pricing.some(
    (rule) => rule.type === "TIERED" || rule.type === "BILL_CREDIT"
  );

  if (hasMediumRules) {
    return "medium";
  }

  // Default to simple (flat-rate only)
  return "simple";
}

/**
 * Get a human-readable label for plan complexity
 * @param complexity The complexity level
 * @returns Human-readable label
 */
export function getComplexityLabel(
  complexity: "simple" | "medium" | "complex"
): string {
  switch (complexity) {
    case "simple":
      return "Simple";
    case "medium":
      return "Medium";
    case "complex":
      return "Complex";
    default:
      return "Unknown";
  }
}

