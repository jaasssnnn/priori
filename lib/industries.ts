// ─── Industry type ────────────────────────────────────────────────────────────

export type Industry =
  | "fintech"
  | "banking"
  | "food_delivery"
  | "quick_commerce"
  | "ecommerce"
  | "travel"
  | "saas"
  | "healthcare"
  | "subscription"
  | "marketplace"
  | "other";

// ─── Industry configuration ───────────────────────────────────────────────────

export interface IndustryConfig {
  label: string;
  description: string;
  /** Risk dimensions applicable to this industry. */
  riskDimensions: string[];
  /** Example complaint categories for this industry. */
  exampleCategories: string[];
  /** Whether potential compliance relevance applies (fintech, banking, healthcare). */
  complianceApplicable: boolean;
  /** Short risk lens description shown in the UI. */
  riskLens: string;
}

export const INDUSTRY_CONFIGS: Record<Industry, IndustryConfig> = {
  fintech: {
    label: "Fintech",
    description: "Payments, lending, credit, and financial services",
    riskDimensions: [
      "Payments",
      "Potential compliance",
      "KYC",
      "Lending terms",
      "Fees and disclosures",
      "Account access",
      "Privacy",
      "Refunds",
      "Fraud and trust",
    ],
    exampleCategories: [
      "Payment failures",
      "KYC / account issues",
      "Cashback & rewards",
      "Transaction disputes",
      "Fees transparency",
      "Data privacy",
    ],
    complianceApplicable: true,
    riskLens: "Payments, trust, potential compliance relevance",
  },
  banking: {
    label: "Banking",
    description: "Consumer and retail banking apps",
    riskDimensions: [
      "Account access",
      "Potential compliance",
      "Fees",
      "Lending",
      "Privacy",
      "Customer support",
      "Fraud",
    ],
    exampleCategories: [
      "Account access",
      "Loan processing",
      "Fee disputes",
      "Data privacy",
      "Customer support",
    ],
    complianceApplicable: true,
    riskLens: "Account access, potential compliance, lending and fee relevance",
  },
  food_delivery: {
    label: "Food delivery",
    description: "Restaurant and meal delivery platforms",
    riskDimensions: [
      "Delivery reliability",
      "Order accuracy",
      "Food quality",
      "Refunds",
      "Pricing",
      "Customer trust",
      "Partner reliability",
    ],
    exampleCategories: [
      "Late delivery",
      "Missing items",
      "Incorrect order",
      "Food quality",
      "Refund delays",
      "Delivery partner issues",
    ],
    complianceApplicable: false,
    riskLens: "Delivery reliability, refunds, food quality, customer trust",
  },
  quick_commerce: {
    label: "Quick commerce",
    description: "10–30 minute grocery and essentials delivery",
    riskDimensions: [
      "Delivery speed",
      "Item availability",
      "Order accuracy",
      "Damaged products",
      "Refunds",
      "Customer support",
    ],
    exampleCategories: [
      "Delivery delays",
      "Out-of-stock items",
      "Wrong items",
      "Damaged products",
      "Refund delays",
    ],
    complianceApplicable: false,
    riskLens: "Fulfillment, delivery speed, inventory accuracy, refunds",
  },
  ecommerce: {
    label: "E-commerce",
    description: "Online retail and marketplace platforms",
    riskDimensions: [
      "Product quality",
      "Seller reliability",
      "Delivery",
      "Returns",
      "Refunds",
      "Pricing",
      "Payment",
      "Customer support",
      "Privacy",
    ],
    exampleCategories: [
      "Wrong item delivered",
      "Damaged product",
      "Return issues",
      "Refund delays",
      "Delivery delays",
      "Seller issues",
    ],
    complianceApplicable: false,
    riskLens: "Delivery, returns, refund and consumer-trust relevance",
  },
  travel: {
    label: "Travel",
    description: "Flight, hotel, and travel booking platforms",
    riskDimensions: [
      "Booking reliability",
      "Cancellation",
      "Refunds",
      "Schedule changes",
      "Partner / service quality",
      "Pricing transparency",
      "Customer support",
      "Account access",
    ],
    exampleCategories: [
      "Booking failures",
      "Cancellation refunds",
      "Hotel quality",
      "Schedule disruption",
      "Customer support",
    ],
    complianceApplicable: false,
    riskLens: "Booking reliability, cancellation, refund, service quality",
  },
  saas: {
    label: "SaaS",
    description: "Software-as-a-service and productivity tools",
    riskDimensions: [
      "Reliability",
      "Performance",
      "Usability",
      "Feature gaps",
      "Integrations",
      "Billing",
      "Permissions",
      "Data export",
      "Support",
    ],
    exampleCategories: [
      "Downtime / reliability",
      "Integration failures",
      "Billing issues",
      "Feature gaps",
      "Performance",
      "Data export",
    ],
    complianceApplicable: false,
    riskLens: "Reliability, usability, integrations, billing, collaboration",
  },
  healthcare: {
    label: "Healthcare",
    description: "Health, wellness, and medical service apps",
    riskDimensions: [
      "Appointment reliability",
      "Privacy",
      "Billing",
      "Service quality",
      "Access",
      "Safety-related concerns",
      "Support",
    ],
    exampleCategories: [
      "Appointment issues",
      "Privacy concerns",
      "Billing errors",
      "Service quality",
      "App reliability",
    ],
    complianceApplicable: true,
    riskLens: "Appointment reliability, privacy, billing, service quality",
  },
  subscription: {
    label: "Subscription",
    description: "Subscription-based content and service apps",
    riskDimensions: [
      "Billing",
      "Content availability",
      "Account access",
      "Cancellation",
      "Customer support",
    ],
    exampleCategories: [
      "Billing issues",
      "Content access",
      "Cancellation problems",
      "Account access",
      "Customer support",
    ],
    complianceApplicable: false,
    riskLens: "Billing, content access, cancellation and account access",
  },
  marketplace: {
    label: "Marketplace",
    description: "Multi-sided platforms connecting buyers and sellers",
    riskDimensions: [
      "Seller reliability",
      "Product quality",
      "Fulfillment",
      "Refunds",
      "Trust and safety",
      "Pricing",
    ],
    exampleCategories: [
      "Seller issues",
      "Product quality",
      "Fulfillment delays",
      "Refund issues",
      "Trust and safety",
    ],
    complianceApplicable: false,
    riskLens: "Seller reliability, product quality, fulfillment, refunds",
  },
  other: {
    label: "Other",
    description: "Other digital products and services",
    riskDimensions: [
      "Reliability",
      "Customer trust",
      "Fulfillment",
      "Billing",
      "Privacy",
    ],
    exampleCategories: [
      "Performance",
      "Customer support",
      "Billing",
      "Privacy",
      "Usability",
    ],
    complianceApplicable: false,
    riskLens: "Reliability, customer trust, operational risk",
  },
};

export function getIndustryConfig(industry: Industry): IndustryConfig {
  return INDUSTRY_CONFIGS[industry];
}

/** Heuristic industry detection from app ID and company name. */
export function detectIndustry(appId: string, companyName: string): Industry {
  const name = companyName.toLowerCase();
  const app  = appId.toLowerCase();

  if (
    name.includes("swiggy") || name.includes("zomato") || name.includes("dunzo") ||
    app.includes("swiggy") || app.includes("zomato")
  ) return "food_delivery";

  if (
    name.includes("blinkit") || name.includes("zepto") || name.includes("instamart") ||
    app.includes("blinkit") || app.includes("grofers")
  ) return "quick_commerce";

  if (
    name.includes("flipkart") || name.includes("amazon") || name.includes("meesho") ||
    name.includes("myntra") || app.includes("flipkart") || app.includes("amazon")
  ) return "ecommerce";

  if (
    name.includes("makemytrip") || name.includes("ixigo") || name.includes("goibibo") ||
    name.includes("cleartrip") || name.includes("yatra") || app.includes("makemytrip")
  ) return "travel";

  if (
    name.includes("hdfc") || name.includes("icici") || name.includes("sbi bank") ||
    name.includes("kotak") || name.includes("axis bank")
  ) return "banking";

  if (
    name.includes("cred") || name.includes("phonepe") || name.includes("paytm") ||
    name.includes("gpay") || name.includes("razorpay") || name.includes("navi") ||
    name.includes("jupiter") || name.includes("slice") || name.includes("fi money") ||
    app.includes("dreamplug") || app.includes("phonepe") || app.includes("paytm")
  ) return "fintech";

  if (
    name.includes("notion") || name.includes("slack") || name.includes("jira") ||
    name.includes("linear") || name.includes("figma") || name.includes("asana") ||
    name.includes("trello") || name.includes("github")
  ) return "saas";

  if (
    name.includes("practo") || name.includes("healthify") || name.includes("cult.fit") ||
    name.includes("medibuddy") || name.includes("apollo") || app.includes("practo")
  ) return "healthcare";

  if (
    name.includes("netflix") || name.includes("hotstar") || name.includes("spotify") ||
    name.includes("youtube") || name.includes("prime video")
  ) return "subscription";

  return "other";
}

/** All supported industries as a sorted list for UI pickers. */
export const INDUSTRY_OPTIONS: { value: Industry; label: string }[] = (
  Object.entries(INDUSTRY_CONFIGS) as [Industry, IndustryConfig][]
).map(([value, cfg]) => ({ value, label: cfg.label }));
