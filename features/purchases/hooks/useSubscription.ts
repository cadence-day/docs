import { useEffect, useState } from "react";
import { revenueCatService } from "../services/RevenueCatService";
import { useProfileStore } from "@/features/profile/stores/useProfileStore";
import type { SubscriptionPlan, CustomerInfo, UseSubscriptionReturn } from "../types";

export function useSubscription(): UseSubscriptionReturn {
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>("free");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { updateSettings } = useProfileStore();

  const checkSubscription = async () => {
    try {
      setIsLoading(true);
      const plan = await revenueCatService.checkSubscriptionStatus();
      const info = await revenueCatService.getCustomerInfo();

      setSubscriptionPlan(plan);
      setCustomerInfo(info);

      updateSettings({ subscriptionPlan: plan });
    } catch (error) {
      console.error("Failed to check subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async () => {
    try {
      setIsLoading(true);
      const info = await revenueCatService.restorePurchases();
      if (info) {
        setCustomerInfo(info);
        await checkSubscription();
      }
    } catch (error) {
      console.error("Failed to restore purchases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();

    const unsubscribe = revenueCatService.addCustomerInfoUpdateListener((info) => {
      setCustomerInfo(info);
      checkSubscription();
    });

    return unsubscribe;
  }, []);

  return {
    subscriptionPlan,
    isLoading,
    customerInfo,
    checkSubscription,
    restorePurchases,
  };
}