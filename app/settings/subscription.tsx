import { COLORS } from "@/shared/constants/COLORS";
import { useTheme } from "@/shared/hooks";
import useTranslation from "@/shared/hooks/useI18n";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { profileStyles } from "../../features/profile/styles";

export default function SubscriptionSettings() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<
    "free" | "supporter" | "premium"
  >("free");

  function getPlanLabel(plan: typeof selectedPlan) {
    if (plan === "free") return t("plan.free") || "Free Explorer";
    if (plan === "supporter") return t("plan.supporter") || "Supporter";
    return t("plan.premium") || "Premium Supporter";
  }

  function getPlanPrice(plan: typeof selectedPlan) {
    if (plan === "free") return t("plan.free_price") || "Free";
    if (plan === "supporter") return t("plan.supporter_price") || "$4.99/mo";
    return t("plan.premium_price") || "$9.99/mo";
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
        <ScrollView style={styles.scrollableContent}>
          <View style={styles.contentPadding}>
            <Text style={styles.paywallTitle}>
              {t("subscription.choose_plan") || "Choose a plan"}
            </Text>

            {/* Plan cards */}
            <View style={styles.cardsContainer}>
              <PlanCard
                title={t("plan.free")}
                price={t("plan.free_price")}
                features={[t("plan.feature.free")]}
                recommended={false}
                onSelect={() => setSelectedPlan("free")}
                selected={selectedPlan === "free"}
              />

              <PlanCard
                title={t("plan.supporter")}
                price={t("plan.supporter_price")}
                features={[
                  t("plan.feature.all_free"),
                  t("plan.feature.community"),
                  t("plan.feature.roadmap"),
                ]}
                recommended={true}
                onSelect={() => setSelectedPlan("supporter")}
                selected={selectedPlan === "supporter"}
              />

              <PlanCard
                title={t("plan.premium")}
                price={t("plan.premium_price")}
                features={[
                  t("plan.feature.all_supporter"),
                  t("plan.feature.premium_support"),
                  t("plan.feature.beta_access"),
                ]}
                recommended={false}
                onSelect={() => setSelectedPlan("premium")}
                selected={selectedPlan === "premium"}
              />
            </View>

            {/* Purchase CTA bar (summary) */}
            <View style={styles.purchaseBar}>
              <View style={styles.purchaseInfo}>
                <Text style={styles.purchasePlanLabel}>
                  {getPlanLabel(selectedPlan)}
                </Text>
                <Text style={styles.purchasePrice}>
                  {getPlanPrice(selectedPlan)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  Alert.alert(
                    getPlanLabel(selectedPlan),
                    getPlanPrice(selectedPlan)
                  );
                }}
              >
                <Text style={styles.primaryButtonText}>
                  {selectedPlan === "free"
                    ? t("common.select") || "Select"
                    : t("continue") || "Continue"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Info Section at the bottom */}
        <View style={styles.fixedInfoSection}>
          <Text style={profileStyles.sectionTitle}>
            {t("about-subscription")}
          </Text>

          <View style={styles.infoContainer}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={COLORS.primary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>{t("subscription-info-text")}</Text>
          </View>
        </View>
      </View>
    </>
  );
}

function PlanCard({
  title,
  price,
  features,
  recommended,
  onSelect,
  selected,
}: {
  title: string;
  price: string;
  features: string[];
  recommended?: boolean;
  onSelect: () => void;
  selected?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.card, selected ? styles.cardSelected : null]}
      onPress={onSelect}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {recommended ? (
          <Text style={styles.recommendedBadge}>Recommended</Text>
        ) : null}
      </View>

      <Text style={styles.cardPrice}>{price}</Text>

      <View style={styles.featuresList}>
        {features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background.primary,
  },
  scrollableContent: {
    flex: 1,
    paddingTop: 16,
  },
  fixedInfoSection: {
    backgroundColor: COLORS.light.background.primary,
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.white,
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
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  infoIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.bodyText,
    lineHeight: 18,
  },
  contentPadding: {
    paddingBottom: 24,
  },
  paywallTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text.header,
    marginBottom: 16,
  },
  cardsContainer: {
    flexDirection: "column",
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.light.ui.border,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text.header,
  },
  recommendedBadge: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    overflow: "hidden",
  },
  cardPrice: {
    fontSize: 14,
    color: COLORS.bodyText,
    marginBottom: 8,
  },
  featuresList: {
    marginTop: 8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    color: COLORS.bodyText,
    fontSize: 13,
  },
  purchaseBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.light.ui.border,
  },
  purchaseInfo: {},
  purchasePlanLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text.header,
  },
  purchasePrice: {
    fontSize: 12,
    color: COLORS.bodyText,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: "700",
  },
});
