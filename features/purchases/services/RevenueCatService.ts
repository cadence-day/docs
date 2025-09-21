import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  LOG_LEVEL,
  PurchasesError,
} from "react-native-purchases";
import { Platform } from "react-native";
import { SECRETS } from "@/shared/constants/SECRETS";
import { supabaseClient } from "@/shared/api/client/supabaseClient";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

export type SubscriptionPlan = "free" | "deep_cadence";

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

class RevenueCatService {
  private static instance: RevenueCatService;
  private isConfigured = false;
  private currentUserId: string | null = null;

  private constructor() {}

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  async configure(): Promise<void> {
    if (this.isConfigured) return;

    try {
      const apiKey =
        Platform.OS === "ios"
          ? SECRETS.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
          : SECRETS.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

      if (!apiKey) {
        console.warn("RevenueCat API key not configured");
        return;
      }

      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      await Purchases.configure({
        apiKey,
        appUserID: null,
        userDefaultsSuiteName: "cadence",
      });

      this.isConfigured = true;
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to configure RevenueCat");
    }
  }

  async login(userId: string): Promise<void> {
    if (!this.isConfigured) await this.configure();

    try {
      if (this.currentUserId === userId) return;

      const { customerInfo } = await Purchases.logIn(userId);
      this.currentUserId = userId;
      await this.syncSubscriptionStatus(customerInfo);
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to login to RevenueCat");
    }
  }

  async logout(): Promise<void> {
    if (!this.isConfigured) return;

    try {
      await Purchases.logOut();
      this.currentUserId = null;
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to logout from RevenueCat");
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    if (!this.isConfigured) await this.configure();

    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to get offerings");
      return null;
    }
  }

  async purchasePackage(
    pkg: PurchasesPackage,
  ): Promise<CustomerInfo | null> {
    if (!this.isConfigured) await this.configure();

    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      await this.syncSubscriptionStatus(customerInfo);
      return customerInfo;
    } catch (error) {
      const purchasesError = error as PurchasesError;
      if (!purchasesError.userCancelled) {
        GlobalErrorHandler.logError(error, "Purchase failed");
      }
      return null;
    }
  }

  async restorePurchases(): Promise<CustomerInfo | null> {
    if (!this.isConfigured) await this.configure();

    try {
      const customerInfo = await Purchases.restorePurchases();
      await this.syncSubscriptionStatus(customerInfo);
      return customerInfo;
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to restore purchases");
      return null;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    if (!this.isConfigured) await this.configure();

    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to get customer info");
      return null;
    }
  }

  async checkSubscriptionStatus(): Promise<SubscriptionPlan> {
    if (!this.isConfigured) await this.configure();

    try {
      const customerInfo = await this.getCustomerInfo();
      if (!customerInfo) return "free";

      const isActive = customerInfo.entitlements.active["premium"] !== undefined;
      return isActive ? "deep_cadence" : "free";
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to check subscription status");
      return "free";
    }
  }

  private async syncSubscriptionStatus(
    customerInfo: CustomerInfo,
  ): Promise<void> {
    try {
      // Get current user ID from the stored value or from Supabase auth
      let userId = this.currentUserId;

      if (!userId) {
        const { data: { user } } = await supabaseClient.auth.getUser();
        userId = user?.id || null;
      }

      if (!userId) return;

      const isActive = customerInfo.entitlements.active["premium"] !== undefined;
      const plan: SubscriptionPlan = isActive ? "deep_cadence" : "free";

      const { error } = await supabaseClient
        .from("profiles")
        .update({
          subscription_plan: plan === "deep_cadence" ? "PREMIUM" : "FREE",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        GlobalErrorHandler.logError(error, "Failed to sync subscription status");
      }
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to sync subscription status");
    }
  }

  addCustomerInfoUpdateListener(
    listener: (customerInfo: CustomerInfo) => void,
  ): () => void {
    if (!this.isConfigured) {
      this.configure();
    }

    Purchases.addCustomerInfoUpdateListener((info) => {
      this.syncSubscriptionStatus(info);
      listener(info);
    });

    // RevenueCat doesn't provide a direct unsubscribe method for this listener
    // Return a no-op function for now
    return () => {};
  }
}

export const revenueCatService = RevenueCatService.getInstance();