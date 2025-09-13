import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useDialogStore from "@/shared/stores/useDialogStore";
import useI18n from "@/shared/hooks/useI18n";
import { profileStyles } from "../styles";
import { SubscriptionPlan } from "../types";
import { COLORS } from "@/shared/constants/COLORS";

interface SubscriptionPlansDialogProps {
  currentPlan?: string;
  onPlanSelected?: (plan: string) => void;
  _dialogId?: string;
}

export const SubscriptionPlansDialog: React.FC<
  SubscriptionPlansDialogProps
> = ({ currentPlan = "free", onPlanSelected, _dialogId }) => {
  const { t } = useI18n();
  const closeDialog = useDialogStore((s) => s.closeDialog);

  const plans: SubscriptionPlan[] = [
    {
      name: "Free",
      price: "$0",
    },
    {
      name: "Deep Cadence",
      price: "$5.99",
      features: [
        "Deeper insights - See trends and make adjustments",
        "More ways to personalize - Customize categories, colors, views",
        "Enhanced gamification - Exclusive challenges and features",
        "Secure backups & exports - Keep journey documented",
      ],
    },
  ];

  const handleUpgrade = () => {
    // TODO: Integrate with Clerk billing in future iteration
    // For now, just call the callback
    onPlanSelected?.("deep_cadence");

    if (_dialogId) {
      closeDialog(_dialogId);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ padding: 20 }}>
        <Text style={profileStyles.sectionTitle}>
          {t("profile.subscription-plan")}
        </Text>

        {plans.map((plan, index) => (
          <View key={plan.name} style={profileStyles.planContainer}>
            <View style={profileStyles.planHeader}>
              <Text style={profileStyles.planName}>{plan.name}</Text>
              <Text style={profileStyles.planPrice}>{plan.price}</Text>
            </View>

            {plan.name === "Deep Cadence" && (
              <>
                <Text style={profileStyles.planDescription}>
                  {t("profile.deep-cadence-description")}
                </Text>

                <View style={profileStyles.featuresList}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: COLORS.light.text,
                      marginBottom: 12,
                    }}
                  >
                    ✨ {t("profile.whats-inside")}
                  </Text>

                  {plan.features?.map((feature, featureIndex) => (
                    <View key={featureIndex} style={profileStyles.featureItem}>
                      <View style={profileStyles.featureBullet} />
                      <Text style={profileStyles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {currentPlan === "free" && (
                  <TouchableOpacity
                    style={profileStyles.upgradeButton}
                    onPress={handleUpgrade}
                  >
                    <Text style={profileStyles.upgradeButtonText}>
                      {t("profile.upgrade-now")}
                    </Text>
                  </TouchableOpacity>
                )}

                {currentPlan === "deep_cadence" && (
                  <View
                    style={{
                      backgroundColor: "#E8F5E8",
                      padding: 12,
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#2E7D32",
                        fontWeight: "600",
                        fontSize: 16,
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={16} />{" "}
                      {t("profile.current-plan")}
                    </Text>
                  </View>
                )}
              </>
            )}

            {plan.name === "Free" && currentPlan === "free" && (
              <View
                style={{
                  backgroundColor: "#E8F5E8",
                  padding: 12,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#2E7D32",
                    fontWeight: "600",
                    fontSize: 16,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={16} />{" "}
                  {t("profile.current-plan")}
                </Text>
              </View>
            )}
          </View>
        ))}

        <Text
          style={{
            textAlign: "center",
            fontSize: 14,
            color: COLORS.textIcons,
            lineHeight: 20,
            marginTop: 24,
            paddingHorizontal: 16,
          }}
        >
          {t("profile.subscription-footer")}
        </Text>
      </View>
    </ScrollView>
  );
};
