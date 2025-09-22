// Purchases feature types

// Re-export CustomerInfo from react-native-purchases for convenience
export type { CustomerInfo } from "react-native-purchases";

export type SubscriptionPlan = "free" | "supporter" | "premium_supporter" | "feature_sponsor";

export interface Product {
  identifier: string;
  priceString: string;
  title: string;
  description: string;
  introPrice?: {
    priceString: string;
    periodUnit: string;
    periodNumberOfUnits: number;
  };
}

export interface UseSubscriptionReturn {
  subscriptionPlan: SubscriptionPlan;
  isLoading: boolean;
  customerInfo: import("react-native-purchases").CustomerInfo | null;
  activeEntitlements: string[];
  checkSubscription: () => Promise<void>;
  restorePurchases: () => Promise<void>;
}

export interface SubscriptionPlansDialogProps {
  _dialogId?: string;
}

export interface SubscriptionTier {
  name: string;
  tagline: string;
  price: string;
  yearlyPrice?: string;
  features: readonly string[];
  limits: {
    maxTimeSlices: number;
    aiInsights: boolean;
    exportData: boolean;
    betaAccess: boolean;
  };
}