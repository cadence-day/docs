import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { PurchasesPackage } from "react-native-purchases";
import { Ionicons } from "@expo/vector-icons";
import { revenueCatService } from "../services/RevenueCatService";
import { SUBSCRIPTION_FEATURES } from "../constants/products";
import { useSubscription } from "../hooks/useSubscription";
import { useI18n } from "@/shared/hooks/useI18n";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

interface SubscriptionPlansDialogProps {
  _dialogId?: string;
}

export const SubscriptionPlansDialog: React.FC<SubscriptionPlansDialogProps> = ({ _dialogId }) => {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { subscriptionPlan, restorePurchases } = useSubscription();
  const { t } = useI18n();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setIsLoading(true);
      const offering = await revenueCatService.getOfferings();
      if (offering?.availablePackages) {
        setPackages(offering.availablePackages);
        const monthly = offering.availablePackages.find(
          (pkg) => pkg.packageType === "MONTHLY"
        );
        if (monthly) setSelectedPackage(monthly);
      }
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to load subscription packages");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert(
        t("error"),
        t("please-select-subscription-plan")
      );
      return;
    }

    try {
      setIsPurchasing(true);
      const customerInfo = await revenueCatService.purchasePackage(selectedPackage);

      if (customerInfo) {
        Alert.alert(
          t("success"),
          t("subscription-activated-successfully"),
          [{ text: t("ok") }]
        );
      }
    } catch (error) {
      GlobalErrorHandler.logError(error, "Purchase failed");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setIsPurchasing(true);
      await restorePurchases();
      Alert.alert(
        t("success"),
        t("purchases-restored-successfully"),
        [{ text: t("ok") }]
      );
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to restore purchases");
    } finally {
      setIsPurchasing(false);
    }
  };

  const renderFeatures = (features: readonly string[]) => {
    return features.map((feature, index) => (
      <View
        key={index}
        className="flex-row items-center py-2"
      >
        <Ionicons
          name="checkmark-circle"
          size={20}
          color="#10b981"
          style={{ marginRight: 8 }}
        />
        <Text className="text-gray-700 dark:text-gray-300 flex-1">
          {feature}
        </Text>
      </View>
    ));
  };

  const renderPackageOption = (pkg: PurchasesPackage) => {
    const isSelected = selectedPackage?.identifier === pkg.identifier;
    const isMonthly = pkg.packageType === "MONTHLY";

    return (
      <TouchableOpacity
        key={pkg.identifier}
        onPress={() => setSelectedPackage(pkg)}
        className={`p-4 rounded-lg border-2 mb-3 ${
          isSelected
            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
            : "border-gray-200 dark:border-gray-700"
        }`}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              {isMonthly ? t("monthly") : t("yearly")}
            </Text>
            <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">
              {pkg.product.priceString}
            </Text>
            {!isMonthly && pkg.product.introPrice && (
              <Text className="text-sm text-green-600 dark:text-green-400 mt-1">
                {t("save")} {Math.round((1 - (pkg.product.price / (packages.find(p => p.packageType === "MONTHLY")?.product.price || 1) / 12)) * 100)}%
              </Text>
            )}
          </View>
          <View className={`w-6 h-6 rounded-full border-2 ${
            isSelected
              ? "border-primary-500 bg-primary-500"
              : "border-gray-400 dark:border-gray-600"
          }`}>
            {isSelected && (
              <Ionicons
                name="checkmark"
                size={16}
                color="white"
                style={{ marginLeft: 2, marginTop: 1 }}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {isLoading ? (
        <View className="py-20 items-center">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="mt-4 text-gray-600 dark:text-gray-400">
            {t("loading-plans")}
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          <View className="p-4">
            {subscriptionPlan === "deep_cadence" && (
              <View className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
                <Text className="text-green-800 dark:text-green-200 text-center">
                  {t("already-subscribed-premium")}
                </Text>
              </View>
            )}

            <Text className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {SUBSCRIPTION_FEATURES.deep_cadence.name}
            </Text>

            <View className="mb-6">
              {renderFeatures(SUBSCRIPTION_FEATURES.deep_cadence.features)}
            </View>

            {packages.length > 0 && (
              <>
                <Text className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  {t("select-billing-period")}
                </Text>
                {packages.map(renderPackageOption)}
              </>
            )}

            <TouchableOpacity
              onPress={handlePurchase}
              disabled={isPurchasing || !selectedPackage}
              className={`py-4 rounded-lg mt-4 ${
                isPurchasing || !selectedPackage
                  ? "bg-gray-300 dark:bg-gray-700"
                  : "bg-primary-600"
              }`}
            >
              {isPurchasing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-semibold text-lg">
                  {subscriptionPlan === "deep_cadence"
                    ? t("change-plan")
                    : t("start-free-trial")}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRestorePurchases}
              disabled={isPurchasing}
              className="py-3 mt-3"
            >
              <Text className="text-primary-600 dark:text-primary-400 text-center">
                {t("restore-purchases")}
              </Text>
            </TouchableOpacity>

            <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              {t("subscription-terms")}
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};