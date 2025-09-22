import { useI18n } from "@/shared/hooks/useI18n";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
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
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { subscriptionPlan, restorePurchases, activeEntitlements } =
    useSubscription();
  const { t } = useI18n();

  const DISCORD_INVITE_URL = "https://discord.gg/cadence-community";

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setIsLoading(true);

      // Ensure RevenueCat is configured before making calls
      await revenueCatService.configure();

      const offering = await revenueCatService.getOfferings();
      if (offering?.availablePackages) {
        setPackages(offering.availablePackages);
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
              [
                {
                  text: "Join Discord Community",
                  onPress: () => Linking.openURL(DISCORD_INVITE_URL),
                },
                { text: "Got it!" },
              ]
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
              `Thank you for becoming a ${SUBSCRIPTION_TIERS[tierKey].name}! Join our Discord community to connect with other members and get exclusive updates.`,
              [
                {
                  text: "Join Discord",
                  onPress: () => Linking.openURL(DISCORD_INVITE_URL),
                },
                { text: "Let's go!" },
              ]
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

  const getTierBadgeStyle = (tierKey: keyof typeof SUBSCRIPTION_TIERS) => {
    if (tierKey === "supporter") return styles.tierTypeBadgeSupporter;
    if (tierKey === "premium_supporter") return styles.tierTypeBadgePremium;
    return styles.tierTypeBadgeSponsor;
  };

  const getTierBadgeTextStyle = (tierKey: keyof typeof SUBSCRIPTION_TIERS) => {
    if (tierKey === "supporter") return styles.tierTypeBadgeTextSupporter;
    if (tierKey === "premium_supporter") return styles.tierTypeBadgeTextPremium;
    return styles.tierTypeBadgeTextSponsor;
  };

  const getTierButtonStyle = (
    isCurrentTier: boolean,
    isPurchasing: boolean,
    isPopular: boolean,
    tierKey: keyof typeof SUBSCRIPTION_TIERS
  ) => {
    if (isCurrentTier) return styles.tierButtonCurrent;
    if (isPurchasing) return styles.tierButtonDisabled;
    if (isPopular) return styles.tierButtonPopular;
    if (tierKey === "feature_sponsor") return styles.tierButtonSponsor;
    return styles.tierButtonDefault;
  };

  const getTierButtonTextStyle = (
    isCurrentTier: boolean,
    isPopular: boolean,
    tierKey: keyof typeof SUBSCRIPTION_TIERS
  ) => {
    if (isCurrentTier) return styles.tierButtonTextCurrent;
    if (isPopular || tierKey === "feature_sponsor")
      return styles.tierButtonTextActive;
    return styles.tierButtonTextDefault;
  };

  const getTierButtonText = (
    isCurrentTier: boolean,
    tierKey: keyof typeof SUBSCRIPTION_TIERS
  ) => {
    if (isCurrentTier) return "Your Current Plan";
    if (tierKey === "feature_sponsor") return "Become a Sponsor";
    return "Upgrade Now";
  };

  const renderFeatures = (
    features: readonly string[],
    isHighlighted = false
  ) => {
    return features.map((feature, index) => (
      <View key={index} style={styles.featureRow}>
        <View
          style={[
            styles.checkmarkContainer,
            isHighlighted
              ? styles.checkmarkHighlighted
              : styles.checkmarkDefault,
          ]}
        >
          <Ionicons
            name="checkmark"
            size={14}
            color={isHighlighted ? "#6366f1" : "#10b981"}
          />
        </View>
        <Text
          style={[
            styles.featureText,
            isHighlighted
              ? styles.featureTextHighlighted
              : styles.featureTextDefault,
          ]}
        >
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
    const hasEntitlement = activeEntitlements.includes(tierKey);

    // Determine card style based on state
    let cardStyle = styles.tierCard;
    if (isPopular) {
      cardStyle = { ...styles.tierCard, ...styles.tierCardPopular };
    } else if (isCurrentTier) {
      cardStyle = { ...styles.tierCard, ...styles.tierCardCurrent };
    } else {
      cardStyle = { ...styles.tierCard, ...styles.tierCardDefault };
    }

    return (
      <View key={tierKey} style={cardStyle}>
        {isPopular && (
          <View style={styles.badgeContainer}>
            <View style={styles.popularBadge}>
              <Ionicons
                name="star"
                size={12}
                color="white"
                style={styles.badgeIcon}
              />
              <Text style={styles.badgeText}>MOST POPULAR</Text>
            </View>
          </View>
        )}

        {isCurrentTier && (
          <View style={[styles.badgeContainer, styles.badgeContainerRight]}>
            <View style={styles.currentBadge}>
              <Ionicons
                name="checkmark-circle"
                size={12}
                color="white"
                style={styles.badgeIcon}
              />
              <Text style={styles.badgeText}>YOUR PLAN</Text>
            </View>
          </View>
        )}

        <View style={styles.tierContent}>
          <View style={styles.tierHeader}>
            <Text style={styles.tierName}>{tier.name}</Text>
            {tierKey !== "free" && (
              <View style={[styles.tierTypeBadge, getTierBadgeStyle(tierKey)]}>
                <Text
                  style={[
                    styles.tierTypeBadgeText,
                    getTierBadgeTextStyle(tierKey),
                  ]}
                >
                  {tierKey === "feature_sponsor" ? "ONE-TIME" : "MONTHLY"}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.tierTagline}>{tier.tagline}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.tierPrice}>{tier.price}</Text>
            {"yearlyPrice" in tier && tier.yearlyPrice && (
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>Save 17% yearly</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.featuresContainer}>
          {tierKey !== "free" && (
            <View style={styles.featuresHeader}>
              <Text style={styles.featuresHeaderText}>Key Benefits</Text>
            </View>
          )}
          {renderFeatures(tier.features, isPopular)}
        </View>

        {tierKey !== "free" && (
          <TouchableOpacity
            onPress={() => handleTierSelection(tierKey)}
            disabled={isPurchasing || isCurrentTier}
            style={[
              styles.tierButton,
              getTierButtonStyle(
                isCurrentTier,
                isPurchasing,
                isPopular,
                tierKey
              ),
            ]}
          >
            {isPurchasing ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                {!isCurrentTier && (
                  <Ionicons
                    name={tierKey === "feature_sponsor" ? "rocket" : "people"}
                    size={18}
                    color={
                      isPopular || tierKey === "feature_sponsor"
                        ? "white"
                        : "#111827"
                    }
                    style={styles.buttonIcon}
                  />
                )}
                <Text
                  style={[
                    styles.tierButtonText,
                    getTierButtonTextStyle(isCurrentTier, isPopular, tierKey),
                  ]}
                >
                  {getTierButtonText(isCurrentTier, tierKey)}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {isCurrentTier && hasEntitlement && tierKey !== "free" && (
          <TouchableOpacity
            onPress={() => Linking.openURL(DISCORD_INVITE_URL)}
            style={styles.discordButton}
          >
            <Ionicons
              name="logo-discord"
              size={20}
              color="#6366f1"
              style={styles.buttonIcon}
            />
            <Text style={styles.discordButtonText}>
              Access Discord Community
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading community options...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Join the Cadence Community</Text>
              <Text style={styles.headerSubtitle}>
                Your contribution matters. Cadence is still growing. We're
                building with intention.
              </Text>
              <Text style={styles.headerSubtitle}>
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
            <View style={styles.sponsorCard}>
              <View style={styles.badgeContainer}>
                <View style={styles.exclusiveBadge}>
                  <Ionicons
                    name="trophy"
                    size={12}
                    color="white"
                    style={styles.badgeIcon}
                  />
                  <Text style={styles.badgeText}>EXCLUSIVE</Text>
                </View>
              </View>

              <View style={styles.sponsorHeader}>
                <View style={styles.sponsorTitleRow}>
                  <View style={styles.sponsorIconContainer}>
                    <Ionicons name="star" size={20} color="#f59e0b" />
                  </View>
                  <Text style={styles.sponsorTitle}>Feature Sponsor</Text>
                </View>
                <View style={styles.sponsorBadge}>
                  <Text style={styles.sponsorBadgeText}>ONE-TIME</Text>
                </View>
              </View>
              <Text style={styles.sponsorTagline}>
                {SUBSCRIPTION_TIERS.feature_sponsor.tagline}
              </Text>
              <View style={styles.sponsorPriceContainer}>
                <Text style={styles.sponsorPrice}>
                  {SUBSCRIPTION_TIERS.feature_sponsor.price}
                </Text>
                <Text style={styles.sponsorPriceSubtext}>Lifetime access</Text>
              </View>
              <View style={styles.sponsorFeaturesContainer}>
                <View style={styles.sponsorFeaturesHeader}>
                  <Text style={styles.sponsorFeaturesHeaderText}>
                    What You Get
                  </Text>
                </View>
                {renderFeatures(
                  SUBSCRIPTION_TIERS.feature_sponsor.features,
                  true
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleTierSelection("feature_sponsor")}
                disabled={
                  isPurchasing || subscriptionPlan === "feature_sponsor"
                }
                style={[
                  styles.sponsorButton,
                  subscriptionPlan === "feature_sponsor"
                    ? styles.sponsorButtonCurrent
                    : styles.sponsorButtonActive,
                ]}
              >
                {isPurchasing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    {subscriptionPlan !== "feature_sponsor" && (
                      <Ionicons
                        name="rocket"
                        size={18}
                        color="white"
                        style={styles.buttonIcon}
                      />
                    )}
                    <Text style={styles.sponsorButtonText}>
                      {subscriptionPlan === "feature_sponsor"
                        ? "You're a Sponsor!"
                        : "Become a Sponsor"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {subscriptionPlan === "feature_sponsor" &&
                activeEntitlements.includes("feature_sponsor") && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(DISCORD_INVITE_URL)}
                    style={styles.sponsorDiscordButton}
                  >
                    <Ionicons
                      name="logo-discord"
                      size={20}
                      color="#f59e0b"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.sponsorDiscordButtonText}>
                      Access Discord Community
                    </Text>
                  </TouchableOpacity>
                )}
            </View>

            {/* Show Discord Access for Any Active Subscribers */}
            {subscriptionPlan !== "free" && activeEntitlements.length > 0 && (
              <View style={styles.communityAccessCard}>
                <View style={styles.communityAccessContent}>
                  <View style={styles.communityAccessTextContainer}>
                    <Text style={styles.communityAccessTitle}>
                      🎉 Welcome to the Community!
                    </Text>
                    <Text style={styles.communityAccessSubtitle}>
                      Access exclusive Discord channels and connect with other
                      members.
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(DISCORD_INVITE_URL)}
                    style={styles.communityAccessButton}
                  >
                    <Text style={styles.communityAccessButtonText}>
                      Join Discord
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={handleRestorePurchases}
                disabled={isPurchasing}
                style={styles.restoreButton}
              >
                <Text style={styles.restoreButtonText}>
                  Restore Previous Purchases
                </Text>
              </TouchableOpacity>

              <Text style={styles.footerText}>
                Every supporter gets gratitude, updates, and a voice in where
                Cadence goes next. Thanks for being part of this journey.
              </Text>

              <Text style={styles.footerSubtext}>
                Subscriptions auto-renew. Cancel anytime. Terms apply.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#6B7280",
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    textAlign: "center",
    marginTop: 8,
  },

  // Feature list styles
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  checkmarkContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkmarkHighlighted: {
    backgroundColor: "#E0E7FF",
  },
  checkmarkDefault: {
    backgroundColor: "#F0FDF4",
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  featureTextHighlighted: {
    color: "#1F2937",
    fontWeight: "500",
  },
  featureTextDefault: {
    color: "#374151",
  },

  // Tier card styles
  tierCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  tierCardPopular: {
    borderWidth: 2,
    borderColor: "#6366F1",
    backgroundColor: "#F8FAFF",
  },
  tierCardCurrent: {
    borderWidth: 2,
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  tierCardDefault: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },

  // Badge styles
  badgeContainer: {
    position: "absolute",
    top: -12,
    left: 16,
    zIndex: 10,
  },
  badgeContainerRight: {
    left: undefined,
    right: 16,
  },
  popularBadge: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  currentBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  exclusiveBadge: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  badgeIcon: {
    marginRight: 4,
  },

  // Tier content styles
  tierContent: {
    marginBottom: 16,
  },
  tierHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  tierName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  tierTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tierTypeBadgeSupporter: {
    backgroundColor: "#DBEAFE",
  },
  tierTypeBadgePremium: {
    backgroundColor: "#EDE9FE",
  },
  tierTypeBadgeSponsor: {
    backgroundColor: "#FEF3C7",
  },
  tierTypeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  tierTypeBadgeTextSupporter: {
    color: "#1D4ED8",
  },
  tierTypeBadgeTextPremium: {
    color: "#7C3AED",
  },
  tierTypeBadgeTextSponsor: {
    color: "#D97706",
  },
  tierTagline: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  tierPrice: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#6366F1",
  },
  saveBadge: {
    marginLeft: 12,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#065F46",
  },

  // Features section
  featuresContainer: {
    marginBottom: 20,
  },
  featuresHeader: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  featuresHeaderText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },

  // Button styles
  tierButton: {
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tierButtonCurrent: {
    backgroundColor: "#F3F4F6",
  },
  tierButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },
  tierButtonPopular: {
    backgroundColor: "#6366F1",
  },
  tierButtonSponsor: {
    backgroundColor: "#F59E0B",
  },
  tierButtonDefault: {
    backgroundColor: "#1F2937",
  },
  tierButtonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  tierButtonTextCurrent: {
    color: "#6B7280",
  },
  tierButtonTextActive: {
    color: "white",
  },
  tierButtonTextDefault: {
    color: "white",
  },
  buttonIcon: {
    marginRight: 8,
  },

  // Discord button
  discordButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#E0E7FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  discordButtonText: {
    color: "#6366F1",
    fontWeight: "600",
  },

  // Sponsor card styles
  sponsorCard: {
    borderWidth: 2,
    borderColor: "#FBBF24",
    backgroundColor: "#FFFBEB",
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  sponsorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sponsorTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sponsorIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sponsorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  sponsorBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sponsorBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#D97706",
  },
  sponsorTagline: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 20,
  },
  sponsorPriceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  sponsorPrice: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#D97706",
  },
  sponsorPriceSubtext: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6B7280",
  },
  sponsorFeaturesContainer: {
    marginBottom: 20,
  },
  sponsorFeaturesHeader: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#FED7AA",
  },
  sponsorFeaturesHeaderText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#D97706",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sponsorButton: {
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  sponsorButtonCurrent: {
    backgroundColor: "#F3F4F6",
  },
  sponsorButtonActive: {
    backgroundColor: "#F59E0B",
  },
  sponsorButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  sponsorDiscordButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  sponsorDiscordButtonText: {
    color: "#D97706",
    fontWeight: "600",
  },

  // Community access card
  communityAccessCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
  },
  communityAccessContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  communityAccessTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  communityAccessTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  communityAccessSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  communityAccessButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  communityAccessButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  // Footer styles
  footer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  restoreButton: {
    paddingVertical: 8,
    marginBottom: 12,
  },
  restoreButtonText: {
    color: "#6366F1",
    textAlign: "center",
    fontWeight: "500",
  },
  footerText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
  footerSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 12,
  },
});
