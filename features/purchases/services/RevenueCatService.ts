import { SECRETS } from "@/shared/constants/SECRETS";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesError,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";

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
        "REVENUECAT_CONFIG",
      );
      return;
    }

    try {
      const apiKey = Platform.OS === "ios"
        ? SECRETS.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
        : SECRETS.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

      // Validate API key: must be a non-empty string and at least 20 characters (RevenueCat keys are usually longer)
      if (
        !apiKey ||
        typeof apiKey !== "string" ||
        apiKey.trim().length < 20
      ) {
        GlobalErrorHandler.logWarning(
          "RevenueCat API key is missing or invalid - skipping configuration",
          "REVENUECAT_CONFIG",
        );
        return;
      }

      if (__DEV__) {
        // Set log level to show warnings but not debug info
        Purchases.setLogLevel(LOG_LEVEL.WARN);

        // Add custom log handler to filter out expected errors
        Purchases.setLogHandler((logLevel, message) => {
          // Filter out pending payment errors - these are expected in StoreKit Testing
          if (
            message.includes("payment is pending") ||
            message.includes("PAYMENT_PENDING_ERROR") ||
            message.includes("payment is deferred")
          ) {
            // Don't log these - they're handled gracefully in our purchasePackage method
            return;
          }

          // Log other messages normally
          const prefix = "[RevenueCat]";
          switch (logLevel) {
            case LOG_LEVEL.VERBOSE:
            case LOG_LEVEL.DEBUG:
              // eslint-disable-next-line no-console
              console.debug(prefix, message);
              break;
            case LOG_LEVEL.INFO:
              // eslint-disable-next-line no-console
              console.info(prefix, message);
              break;
            case LOG_LEVEL.WARN:
              // eslint-disable-next-line no-console
              console.warn(prefix, message);
              break;
            case LOG_LEVEL.ERROR:
              // eslint-disable-next-line no-console
              console.error(prefix, message);
              break;
          }
        });
      }

      // Configure the SDK FIRST before making any other calls
      await Purchases.configure({
        apiKey,
      });

      this.isConfigured = true;
      GlobalErrorHandler.logDebug(
        "RevenueCat configured successfully",
        "REVENUECAT_CONFIG",
      );

      const CustomerInfo = await Purchases.getCustomerInfo();
      GlobalErrorHandler.logDebug(
        "Checking initial subscription status after configuration",
        "REVENUECAT_CONFIG",
        { customerInfo: JSON.stringify(CustomerInfo, null, 2) },
      );

      // Don't sync subscription status during initial configuration
      // This will be handled when login() is called with a user ID
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
      GlobalErrorHandler.logDebug(
        "Fetched RevenueCat offerings",
        "REVENUECAT_OFFERINGS",
        { offerings: JSON.stringify(offerings, null, 2) },
      );
      return offerings.current;
    } catch (error) {
      // Check if this is the expected "no products configured" or App Store Connect error
      const errorMessage = error?.toString() || "";
      if (
        errorMessage.includes("no products registered") ||
        errorMessage.includes("no packages configured") ||
        errorMessage.includes("MISSING_METADATA") ||
        errorMessage.includes("couldn't be fetched from App Store Connect") ||
        errorMessage.includes("RevenueCat.OfferingsManager.Error") ||
        errorMessage.includes("None of the products registered")
      ) {
        // This is expected in development or when products aren't approved in App Store Connect
        GlobalErrorHandler.logWarning(
          "RevenueCat products not available - this is expected in development or when products aren't approved in App Store Connect",
          "REVENUECAT_OFFERINGS",
          { errorMessage: errorMessage.substring(0, 200) }, // Log first 200 chars of error for debugging
        );
      } else {
        // Unexpected error - log as error
        GlobalErrorHandler.logError(error, "Failed to get offerings");
      }
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

      // Check if payment is pending (deferred payment like "Ask to Buy")
      const errorMessage = error?.toString() || "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userInfo = (error as any)?.userInfo || {};
      const readableErrorCode = userInfo.readable_error_code;

      if (
        readableErrorCode === "PAYMENT_PENDING_ERROR" ||
        errorMessage.includes("payment is pending")
      ) {
        // This is an expected scenario - log as warning, not error
        GlobalErrorHandler.logWarning(
          "Payment is pending approval (deferred payment)",
          "REVENUECAT_PURCHASE",
          {
            productId: pkg.product.identifier,
            errorCode: readableErrorCode,
          },
        );
        return null;
      }

      // User cancelled the purchase - don't log as error
      if (purchasesError.userCancelled) {
        GlobalErrorHandler.logDebug(
          "User cancelled the purchase",
          "REVENUECAT_PURCHASE",
          { productId: pkg.product.identifier },
        );
        return null;
      }

      // Actual error - log it
      GlobalErrorHandler.logError(error, "Purchase failed", {
        productId: pkg.product.identifier,
        errorCode: readableErrorCode,
      });
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
      const userInfo = await Purchases.getCustomerInfo();
      GlobalErrorHandler.logDebug(
        "Fetching RevenueCat customer info",
        "REVENUECAT_CUSTOMER_INFO",
        { userInfo },
      );
      return userInfo;
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to get customer info");
      return null;
    }
  }

  async getActiveEntitlements(): Promise<string[]> {
    if (!this.isConfigured) await this.configure();
    if (!this.isConfigured) return []; // Still not configured, return empty array

    try {
      const customerInfo = await this.getCustomerInfo();
      if (!customerInfo) return [];

      const activeEntitlements = Object.keys(
        customerInfo.entitlements.active || {},
      );
      return activeEntitlements;
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to get active entitlements");
      return [];
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

  /**
   * Check if RevenueCat is properly configured and has products available
   * Useful for determining whether to show purchase options in the UI
   */
  async isProductsAvailable(): Promise<boolean> {
    if (!this.isConfigured) await this.configure();
    if (!this.isConfigured) return false;

    try {
      const offering = await this.getOfferings();
      return (offering?.availablePackages?.length ?? 0) > 0;
    } catch {
      // getOfferings() already handles logging, so we just return false
      return false;
    }
  }

  private async syncSubscriptionStatus(
    customerInfo: CustomerInfo,
  ): Promise<void> {
    try {
      // Get current user ID from the stored value
      const userId = this.currentUserId;

      if (!userId) {
        // If no user ID is stored, skip syncing
        // This method should only be called after login when userId is set
        GlobalErrorHandler.logWarning(
          "No user ID available for subscription sync",
          "REVENUECAT_SYNC",
        );
        return;
      }

      // Determine subscription plan based on active entitlements
      let plan: SubscriptionPlan = "free";
      if (customerInfo.entitlements.active["premium_supporter"]) {
        plan = "premium_supporter";
      } else if (customerInfo.entitlements.active["feature_sponsor"]) {
        plan = "feature_sponsor";
      } else if (customerInfo.entitlements.active["supporter"]) {
        plan = "supporter";
      }

      // Log the subscription plan for debugging purposes
      GlobalErrorHandler.logDebug(
        `User subscription plan determined: ${plan}`,
        "REVENUECAT_SYNC",
        {
          userId,
          plan,
          entitlements: Object.keys(customerInfo.entitlements.active || {}),
        },
      );

      // Note: Profile table updates are deprecated and removed
      // Subscription status is now managed through RevenueCat directly
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to sync subscription status");
    }
  }

  addCustomerInfoUpdateListener(
    listener: (customerInfo: CustomerInfo) => void,
  ): () => void {
    if (!this.isConfigured) {
      // Return a no-op function if not configured
      // The configure() call should happen elsewhere first
      GlobalErrorHandler.logWarning(
        "RevenueCat not configured when adding listener",
        "REVENUECAT_LISTENER",
      );
      return () => {};
    }

    Purchases.addCustomerInfoUpdateListener((info: CustomerInfo) => {
      this.syncSubscriptionStatus(info);
      listener(info);
    });

    // RevenueCat doesn't provide a direct unsubscribe method for this listener
    // Return a no-op function for now
    return () => {};
  }
}

export const revenueCatService = RevenueCatService.getInstance();
