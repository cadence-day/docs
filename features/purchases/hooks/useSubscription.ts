import { useProfileStore } from "@/features/profile/stores/useProfileStore";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { useCallback, useEffect, useState } from "react";
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
  const { updateSettings } = useProfileStore();

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
      GlobalErrorHandler.logError(error, "Failed to check subscription status");
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
      GlobalErrorHandler.logError(error, "Failed to restore purchases");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeSubscription = async () => {
      // Wait a bit to ensure RevenueCat configuration has had time to complete
      // from the app initialization
      await new Promise((resolve) => setTimeout(resolve, 100));
      await checkSubscription();

      try {
        // Only add listener if RevenueCat is properly configured
        await revenueCatService.configure();
        const unsubscribe = revenueCatService.addCustomerInfoUpdateListener(
          (info) => {
            setCustomerInfo(info);
            checkSubscription();
          },
        );

        return unsubscribe;
      } catch (error) {
        GlobalErrorHandler.logError(error, "Failed to add RevenueCat listener");
        return () => {}; // Return no-op function on error
      }
    };

    initializeSubscription();
  }, [checkSubscription]);

  return {
    subscriptionPlan,
    isLoading,
    customerInfo,
    activeEntitlements,
    checkSubscription,
    restorePurchases,
  };
}
