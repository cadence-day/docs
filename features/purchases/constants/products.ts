export const PRODUCT_IDS = {
  SUPPORTER_MONTHLY: "cadence_supporter_monthly",
  SUPPORTER_YEARLY: "cadence_supporter_yearly",
  PREMIUM_SUPPORTER_MONTHLY: "cadence_premium_supporter_monthly",
  FEATURE_SPONSOR_ONETIME: "cadence_feature_sponsor_onetime",
} as const;

export const ENTITLEMENT_IDS = {
  SUPPORTER: "supporter",
  PREMIUM_SUPPORTER: "premium_supporter",
  FEATURE_SPONSOR: "feature_sponsor",
} as const;

export const SUBSCRIPTION_TIERS = {
  free: {
    name: "Free Explorer",
    tagline: "Discover your daily rhythm",
    price: "Free",
    features: [
      "Track time in 30-minute intervals",
      "Add quick notes and mood tags",
      "Basic daily visualizations",
      "Community forum access",
    ],
    limits: {
      maxTimeSlices: 48, // Full day tracking
      aiInsights: false,
      exportData: false,
      betaAccess: false,
    },
  },
  supporter: {
    name: "Supporter",
    tagline: "Support Cadence. Shape its future.",
    price: "$4.99/month",
    yearlyPrice: "$50/year",
    features: [
      "Everything in Free",
      "Discord community access",
      "See features being considered",
      "Input & discussion on roadmap",
      "Early look at in-development features",
      "Supporter badge in community",
    ],
    limits: {
      maxTimeSlices: -1,
      aiInsights: true,
      exportData: false,
      betaAccess: false,
    },
  },
  premium_supporter: {
    name: "Premium Supporter",
    tagline: "Join us in building Cadence—your time-tracker with meaning.",
    price: "$9.99/month",
    features: [
      "Everything in Supporter",
      "Beta/TestFlight access",
      "Priority notice of updates",
      "Full roadmap visibility",
      "Feature prioritization influence",
      "Direct feedback channel",
      "Data export capabilities",
    ],
    limits: {
      maxTimeSlices: -1,
      aiInsights: true,
      exportData: true,
      betaAccess: true,
    },
  },
  feature_sponsor: {
    name: "Feature Sponsor",
    tagline: "Support, influence, and be a part of Cadence's journey.",
    price: "$50 one-time",
    features: [
      "Suggest one feature or integration",
      "Direct engagement on implementation",
      "Feature gets prioritized/built",
      "Permanent sponsor recognition",
      "Lifetime supporter community access",
    ],
    limits: {
      maxTimeSlices: -1,
      aiInsights: true,
      exportData: true,
      betaAccess: true,
    },
  },
} as const;