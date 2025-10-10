import { useSubscription } from "@/features/purchases";
import { COLORS } from "@/shared/constants/COLORS";
import { useTheme } from "@/shared/hooks";
import useTranslation from "@/shared/hooks/useI18n";
import { Logger } from "@/shared/utils/errorHandler";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RevenueCatUI from "react-native-purchases-ui";

export default function SubscriptionSettings() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { subscriptionPlan, checkSubscription } = useSubscription();

  async function handlePurchaseCompleted() {
    try {
      // Refresh subscription status
      await checkSubscription();

      Alert.alert(
        t("subscription.success") || "Success!",
        t("subscription.success_message") || "Thank you for your support!",
        [
          {
            text: t("common.ok") || "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Logger.logError(error, "Failed to refresh subscription after purchase");
    }
  }

  function handleRestoreCompleted() {
    checkSubscription();
    Alert.alert(
      t("subscription.restored") || "Restored",
      t("subscription.restored_message") || "Your purchases have been restored!"
    );
  }

  function handleDismiss() {
    // Paywall was dismissed, optionally navigate back
    Logger.logDebug("Paywall dismissed", "SUBSCRIPTION_SCREEN");
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: t("profile.subscription"),
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.background.primary,
          },
          headerShadowVisible: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/(home)/profile")}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
              <Text style={styles.backText}>{t("back")}</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.headerBorder} />

      <View style={styles.container}>
        {/* Current subscription status banner */}
        {subscriptionPlan !== "free" && (
          <View style={styles.currentPlanBanner}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={COLORS.semantic.success}
            />
            <Text style={styles.currentPlanText}>
              {t("subscription.current_plan") || "Current plan"}:{" "}
              {subscriptionPlan}
            </Text>
          </View>
        )}

        {/* RevenueCat Paywall */}
        <RevenueCatUI.Paywall
          options={{}}
          onPurchaseCompleted={handlePurchaseCompleted}
          onRestoreCompleted={handleRestoreCompleted}
          onDismiss={handleDismiss}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background.primary,
  },
  headerBorder: {
    height: 1,
    backgroundColor: COLORS.white,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 16,
    marginLeft: 4,
  },
  currentPlanBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.light.background.secondary,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    gap: 8,
  },
  currentPlanText: {
    fontSize: 14,
    color: COLORS.bodyText,
    fontWeight: "500",
  },
});
