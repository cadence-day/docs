import { supabaseClient } from "@/shared/api/client/supabaseClient";
import { SECRETS } from "@/shared/constants/SECRETS";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { Platform } from "react-native";

// Conditional import for RevenueCat to handle Expo Go compatibility
let Purchases: any = null;
let LOG_LEVEL: any = null;

// Type definitions for when RevenueCat is available
type CustomerInfo = any;
type PurchasesError = any;
type PurchasesOffering = any;
type PurchasesPackage = any;

try {
  const RevenueCatModule = require("react-native-purchases");
  Purchases = RevenueCatModule.default;
  LOG_LEVEL = RevenueCatModule.LOG_LEVEL;
} catch (error) {
  GlobalErrorHandler.logWarning(
    "RevenueCat not available - running in Expo Go or web",
    "REVENUECAT_IMPORT",
    { error }
  );
}

import type { SubscriptionPlan } from "../types";

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

    // Check if RevenueCat is available (not in Expo Go)
    if (!Purchases) {
      GlobalErrorHandler.logWarning(
        "RevenueCat not available - skipping configuration",
        "REVENUECAT_CONFIG"
      );
      return;
    }

    try {
      const apiKey = Platform.OS === "ios"
        ? SECRETS.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
        : SECRETS.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

      if (
        !apiKey || apiKey === "your_ios_api_key_here" ||
        apiKey === "your_android_api_key_here"
      ) {
        console.warn(
          "RevenueCat API key not configured - skipping initialization",
        );
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
      console.log("RevenueCat configured successfully");
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to configure RevenueCat");
    }
  }

  async login(userId: string): Promise<void> {
    if (!this.isConfigured) await this.configure();
    if (!this.isConfigured) return; // Still not configured, skip

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
    if (!this.isConfigured) return null; // Still not configured, return null

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
    if (!this.isConfigured) return null; // Still not configured, return null

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
    if (!this.isConfigured) return null; // Still not configured, return null

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
    if (!this.isConfigured) return null; // Still not configured, return null

    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to get customer info");
      return null;
    }
  }

  async checkSubscriptionStatus(): Promise<SubscriptionPlan> {
    if (!this.isConfigured) await this.configure();
    if (!this.isConfigured) return "free"; // Still not configured, return free

    try {
      const customerInfo = await this.getCustomerInfo();
      if (!customerInfo) return "free";

      // Check entitlements in order of priority
      if (customerInfo.entitlements.active["premium_supporter"]) {
        return "premium_supporter";
      }
      if (customerInfo.entitlements.active["feature_sponsor"]) {
        return "feature_sponsor";
      }
      if (customerInfo.entitlements.active["supporter"]) {
        return "supporter";
      }

      return "free";
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

      // Determine subscription plan based on active entitlements
      let plan: SubscriptionPlan = "free";
      if (customerInfo.entitlements.active["premium_supporter"]) {
        plan = "premium_supporter";
      } else if (customerInfo.entitlements.active["feature_sponsor"]) {
        plan = "feature_sponsor";
      } else if (customerInfo.entitlements.active["supporter"]) {
        plan = "supporter";
      }

      // Map to database enum values (using existing enum for now)
      let dbPlan: "FREE" | "PREMIUM" | "ENTERPRISE";
      switch (plan) {
        case "premium_supporter":
        case "feature_sponsor":
          dbPlan = "PREMIUM";
          break;
        case "supporter":
          dbPlan = "ENTERPRISE"; // Temporarily using ENTERPRISE for supporter tier
          break;
        default:
          dbPlan = "FREE";
      }

      const { error } = await supabaseClient
        .from("profiles")
        .update({
          subscription_plan: dbPlan,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        GlobalErrorHandler.logError(
          error,
          "Failed to sync subscription status",
        );
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
      if (!this.isConfigured) {
        // Return a no-op function if not configured
        return () => {};
      }
    }

    Purchases.addCustomerInfoUpdateListener((info: any) => {
      this.syncSubscriptionStatus(info);
      listener(info);
    });

    // RevenueCat doesn't provide a direct unsubscribe method for this listener
    // Return a no-op function for now
    return () => {};
  }
}

export const revenueCatService = RevenueCatService.getInstance();
