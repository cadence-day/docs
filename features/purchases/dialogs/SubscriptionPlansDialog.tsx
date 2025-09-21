import { useI18n } from "@/shared/hooks/useI18n";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PurchasesPackage } from "react-native-purchases";
import { SUBSCRIPTION_TIERS } from "../constants/products";
import { useSubscription } from "../hooks/useSubscription";
import { revenueCatService } from "../services/RevenueCatService";
import type { SubscriptionPlansDialogProps } from "../types";

export const SubscriptionPlansDialog: React.FC<
  SubscriptionPlansDialogProps
> = ({ _dialogId }) => {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] =
    useState<PurchasesPackage | null>(null);
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
          (pkg: any) => pkg.packageType === "MONTHLY"
        );
        if (monthly) setSelectedPackage(monthly);
      }
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "Failed to load subscription packages"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTierSelection = async (
    tierKey: keyof typeof SUBSCRIPTION_TIERS
  ) => {
    if (tierKey === "feature_sponsor") {
      // Handle one-time purchase
      const sponsorPackage = packages.find(
        (pkg) => pkg.identifier === "cadence_feature_sponsor_onetime"
      );
      if (sponsorPackage) {
        try {
          setIsPurchasing(true);
          const customerInfo =
            await revenueCatService.purchasePackage(sponsorPackage);
          if (customerInfo) {
            Alert.alert(
              "Welcome, Feature Sponsor!",
              "Thank you for becoming a Feature Sponsor! You'll receive an email shortly with details on how to submit your feature request and work directly with our team.",
              [{ text: "Got it!" }]
            );
          }
        } catch (error) {
          GlobalErrorHandler.logError(error, "Feature sponsor purchase failed");
        } finally {
          setIsPurchasing(false);
        }
      }
    } else {
      // Handle subscription tiers
      const monthlyPackage = packages.find(
        (pkg) =>
          pkg.identifier ===
          (tierKey === "supporter"
            ? "cadence_supporter_monthly"
            : "cadence_premium_supporter_monthly")
      );

      if (monthlyPackage) {
        try {
          setIsPurchasing(true);
          const customerInfo =
            await revenueCatService.purchasePackage(monthlyPackage);
          if (customerInfo) {
            Alert.alert(
              "Welcome to the Community!",
              `Thank you for becoming a ${SUBSCRIPTION_TIERS[tierKey].name}! You'll receive Discord access and other community perks shortly.`,
              [{ text: "Let's go!" }]
            );
          }
        } catch (error) {
          GlobalErrorHandler.logError(error, "Subscription purchase failed");
        } finally {
          setIsPurchasing(false);
        }
      }
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert(t("error"), t("please-select-subscription-plan"));
      return;
    }

    try {
      setIsPurchasing(true);
      const customerInfo =
        await revenueCatService.purchasePackage(selectedPackage);

      if (customerInfo) {
        Alert.alert(t("success"), t("subscription-activated-successfully"), [
          { text: t("ok") },
        ]);
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
      Alert.alert(t("success"), t("purchases-restored-successfully"), [
        { text: t("ok") },
      ]);
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to restore purchases");
    } finally {
      setIsPurchasing(false);
    }
  };

  const renderFeatures = (features: readonly string[]) => {
    return features.map((feature, index) => (
      <View key={index} className="flex-row items-center py-1.5">
        <Ionicons
          name="checkmark-circle"
          size={18}
          color="#10b981"
          style={{ marginRight: 10 }}
        />
        <Text className="text-gray-700 dark:text-gray-300 flex-1 text-sm">
          {feature}
        </Text>
      </View>
    ));
  };

  const renderTierCard = (
    tierKey: keyof typeof SUBSCRIPTION_TIERS,
    isPopular = false
  ) => {
    const tier = SUBSCRIPTION_TIERS[tierKey];
    const isCurrentTier = subscriptionPlan === tierKey;

    return (
      <View
        key={tierKey}
        className={`p-5 rounded-xl border-2 mb-4 ${
          isPopular
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 relative"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        }`}
      >
        {isPopular && (
          <View className="absolute -top-3 left-4">
            <Text className="bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Most Popular
            </Text>
          </View>
        )}

        {isCurrentTier && (
          <View className="absolute -top-3 right-4">
            <Text className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Current Plan
            </Text>
          </View>
        )}

        <View className="mb-3">
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            {tier.name}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {tier.tagline}
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {tier.price}
          </Text>
          {"yearlyPrice" in tier && tier.yearlyPrice && (
            <Text className="text-sm text-green-600 dark:text-green-400">
              or {tier.yearlyPrice} (Save $10)
            </Text>
          )}
        </View>

        <View className="mb-4">{renderFeatures(tier.features)}</View>

        {tierKey !== "free" && (
          <TouchableOpacity
            onPress={() => handleTierSelection(tierKey)}
            disabled={isPurchasing || isCurrentTier}
            className={`py-3 rounded-lg ${
              isCurrentTier
                ? "bg-gray-200 dark:bg-gray-700"
                : isPurchasing
                  ? "bg-gray-300 dark:bg-gray-600"
                  : isPopular
                    ? "bg-indigo-600"
                    : "bg-gray-800 dark:bg-gray-200"
            }`}
          >
            {isPurchasing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                className={`text-center font-semibold ${
                  isCurrentTier
                    ? "text-gray-500 dark:text-gray-400"
                    : isPopular
                      ? "text-white"
                      : "text-white dark:text-gray-800"
                }`}
              >
                {isCurrentTier
                  ? "Current Plan"
                  : tierKey === "feature_sponsor"
                    ? "Become a Sponsor"
                    : "Join Community"}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
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
                {t("save")}{" "}
                {Math.round(
                  (1 -
                    pkg.product.price /
                      (packages.find((p) => p.packageType === "MONTHLY")
                        ?.product.price || 1) /
                      12) *
                    100
                )}
                %
              </Text>
            )}
          </View>
          <View
            className={`w-6 h-6 rounded-full border-2 ${
              isSelected
                ? "border-primary-500 bg-primary-500"
                : "border-gray-400 dark:border-gray-600"
            }`}
          >
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
            Loading community options...
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-5">
            {/* Header */}
            <View className="mb-6 text-center">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Join the Cadence Community
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                Your contribution matters. Cadence is still growing. We're
                building with intention.
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mt-2">
                By becoming a supporter, you help us prioritize what matters,
                fix what doesn't, and reach you with features you'll actually
                want.
              </Text>
            </View>

            {/* Free Tier */}
            {renderTierCard("free")}

            {/* Supporter Tier */}
            {renderTierCard("supporter")}

            {/* Premium Supporter Tier - Most Popular */}
            {renderTierCard("premium_supporter", true)}

            {/* Feature Sponsor - Special */}
            <View className="border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-5 rounded-xl mb-4">
              <View className="flex-row items-center mb-3">
                <Ionicons
                  name="star"
                  size={24}
                  color="#f59e0b"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  Feature Sponsor
                </Text>
              </View>
              <Text className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {SUBSCRIPTION_TIERS.feature_sponsor.tagline}
              </Text>
              <Text className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-4">
                {SUBSCRIPTION_TIERS.feature_sponsor.price}
              </Text>
              <View className="mb-4">
                {renderFeatures(SUBSCRIPTION_TIERS.feature_sponsor.features)}
              </View>
              <TouchableOpacity
                onPress={() => handleTierSelection("feature_sponsor")}
                disabled={isPurchasing}
                className="bg-amber-500 py-3 rounded-lg"
              >
                <Text className="text-white text-center font-semibold">
                  {isPurchasing ? "Processing..." : "Become a Sponsor"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <TouchableOpacity
                onPress={handleRestorePurchases}
                disabled={isPurchasing}
                className="py-2 mb-3"
              >
                <Text className="text-indigo-600 dark:text-indigo-400 text-center font-medium">
                  Restore Previous Purchases
                </Text>
              </TouchableOpacity>

              <Text className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                Every supporter gets gratitude, updates, and a voice in where
                Cadence goes next. Thanks for being part of this journey.
              </Text>

              <Text className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">
                Subscriptions auto-renew. Cancel anytime. Terms apply.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};
