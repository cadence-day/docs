import { useProfileStore } from "@/features/profile/stores/useProfileStore";
import { Logger } from "@/shared/utils/errorHandler";
import { useCallback, useEffect, useRef, useState } from "react";
import { revenueCatService } from "../services/RevenueCatService";
import type {
  CustomerInfo,
  SubscriptionPlan,
  UseSubscriptionReturn,
} from "../types";

export function useSubscription(): UseSubscriptionReturn {
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>(
    "free",
  );
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [activeEntitlements, setActiveEntitlements] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const updateSettings = useProfileStore((state) => state.updateSettings);
  const isInitialized = useRef(false);

  const checkSubscription = useCallback(async () => {
    try {
      setIsLoading(true);

      // Ensure RevenueCat is configured before making calls
      await revenueCatService.configure();

      const plan = await revenueCatService.checkSubscriptionStatus();
      const info = await revenueCatService.getCustomerInfo();
      const entitlements = await revenueCatService.getActiveEntitlements();

      setSubscriptionPlan(plan);
      setCustomerInfo(info);
      setActiveEntitlements(entitlements);

      updateSettings({ subscriptionPlan: plan });
    } catch (error) {
      Logger.logError(error, "Failed to check subscription status");
      // Set to free plan and empty entitlements on error to prevent blocking UI
      setSubscriptionPlan("free");
      setActiveEntitlements([]);
    } finally {
      setIsLoading(false);
    }
  }, [updateSettings]);

  const restorePurchases = async () => {
    try {
      setIsLoading(true);

      // Ensure RevenueCat is configured before making calls
      await revenueCatService.configure();

      const info = await revenueCatService.restorePurchases();
      if (info) {
        setCustomerInfo(info);
        await checkSubscription();
      }
    } catch (error) {
      Logger.logError(error, "Failed to restore purchases");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only initialize once
    if (isInitialized.current) return;
    isInitialized.current = true;

    let unsubscribe: (() => void) | null = null;

    const initializeSubscription = async () => {
      // Wait a bit to ensure RevenueCat configuration has had time to complete
      // from the app initialization
      await new Promise((resolve) => setTimeout(resolve, 100));
      await checkSubscription();

      try {
        // Only add listener if RevenueCat is properly configured
        await revenueCatService.configure();
        unsubscribe = revenueCatService.addCustomerInfoUpdateListener(
          (info) => {
            Logger.logDebug(
              "CustomerInfo updated via listener",
              "REVENUECAT_TEST",
              { info },
            );
            setCustomerInfo(info);
            // Don't call checkSubscription here to avoid loops
            // Just update the local state directly
            let plan: SubscriptionPlan = "free";
            if (info.entitlements.active["premium_supporter"]) {
              plan = "premium_supporter";
            } else if (info.entitlements.active["feature_sponsor"]) {
              plan = "feature_sponsor";
            } else if (info.entitlements.active["supporter"]) {
              plan = "supporter";
            }
            setSubscriptionPlan(plan);
            setActiveEntitlements(
              Object.keys(info.entitlements.active || {}),
            );
            updateSettings({ subscriptionPlan: plan });
          },
        );
      } catch (error) {
        Logger.logError(error, "Failed to add RevenueCat listener");
      }
    };

    initializeSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  return {
    subscriptionPlan,
    isLoading,
    customerInfo,
    activeEntitlements,
    checkSubscription,
    restorePurchases,
  };
}
