export const PRODUCT_IDS = {
  MONTHLY_PREMIUM: "cadence_premium_monthly",
  YEARLY_PREMIUM: "cadence_premium_yearly",
} as const;

export const ENTITLEMENT_IDS = {
  PREMIUM: "premium",
} as const;

export const SUBSCRIPTION_FEATURES = {
  free: {
    name: "Free",
    features: [
      "Basic daily reminders",
      "5 habit tracking",
      "Basic statistics",
      "Community support",
    ],
    limits: {
      maxHabits: 5,
      maxReminders: 3,
    },
  },
  deep_cadence: {
    name: "Deep Cadence Premium",
    features: [
      "Unlimited habit tracking",
      "Advanced analytics & insights",
      "Custom reminder schedules",
      "Priority support",
      "Export data to CSV",
      "Theme customization",
      "Backup & sync across devices",
      "No ads",
    ],
    limits: {
      maxHabits: -1,
      maxReminders: -1,
    },
  },
} as const;