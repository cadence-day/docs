import { CdButton } from "@/shared/components/CadenceUI/CdButton";
import { CdTextInputOneLine } from "@/shared/components/CadenceUI/CdTextInputOneLine";
import { COLORS } from "@/shared/constants/COLORS";
import useTranslation from "@/shared/hooks/useI18n";
import useDialogStore from "@/shared/stores/useDialogStore";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useProfileStore } from "../stores/useProfileStore";
import { profileStyles } from "../styles";
import {
  formatTimeInput,
  formatTimeInputLive,
  getTimeValidationError,
} from "../utils";

export const ProfileScreen: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const openDialog = useDialogStore((s) => s.openDialog);
  const { profileData, settings, updateProfileData, updateSettings } =
    useProfileStore();

  // Time input state for validation
  const [timeInputErrors, setTimeInputErrors] = useState<{
    wake?: string;
    sleep?: string;
  }>({});

  const appVersion = Constants.expoConfig?.version || "Unknown";
  const buildNumber =
    // @ts-ignore - optional
    (Constants.expoConfig as any)?.ios?.buildNumber ||
    // @ts-ignore - optional
    (Constants.expoConfig as any)?.android?.versionCode ||
    "Unknown";

  // Handle time input submission with validation
  const handleTimeSubmit = (type: "wake" | "sleep", input: string) => {
    const formattedTime = formatTimeInput(input);

    if (!formattedTime) {
      const errorMessage = getTimeValidationError(input, type, t);
      setTimeInputErrors((prev) => ({
        ...prev,
        [type]: errorMessage,
      }));
      return;
    }

    // Clear any existing errors
    setTimeInputErrors((prev) => ({
      ...prev,
      [type]: undefined,
    }));

    // Save to settings store
    if (type === "wake") {
      updateSettings({ wakeTime: formattedTime });
    } else {
      updateSettings({ sleepTime: formattedTime });
    }
  };

  // Handle real-time time input formatting
  const handleTimeChange = (type: "wake" | "sleep", input: string) => {
    const formatted = formatTimeInputLive(input);

    // Update the settings store immediately with the formatted input
    if (type === "wake") {
      updateSettings({ wakeTime: formatted });
    } else {
      updateSettings({ sleepTime: formatted });
    }

    // Clear errors when user starts typing again
    if (timeInputErrors[type]) {
      setTimeInputErrors((prev) => ({
        ...prev,
        [type]: undefined,
      }));
    }

    return formatted;
  };

  const handleNotificationsPress = () => {
    router.push("/settings/notifications");
  };

  const handleSubscriptionPress = () => {
    openDialog({
      type: "subscription-plans",
      props: {
        currentPlan: settings.subscriptionPlan,
        onPlanSelected: (plan: string) => {
          updateSettings({ subscriptionPlan: plan as any });
        },
        height: 80,
        headerProps: {
          title: t("profile.subscription-plan"),
          onLeftAction: () => {
            // Close the dialog when back button is pressed
            useDialogStore.getState().closeAll();
          },
        },
      },
      position: "dock",
      viewSpecific: "profile",
    });
  };

  const handleSecurityPress = () => {
    // TODO: Navigate to security screen in future iteration
    console.log("Security pressed - to be implemented");
  };

  const handleSupportPress = () => {
    openDialog({
      type: "customer-support",
      props: {
        userId: user?.id,
        userEmail: user?.emailAddresses[0]?.emailAddress,
        appVersion,
        buildNumber,
        height: 70,
        headerProps: {
          title: t("profile.customer-support"),
          onLeftAction: () => {
            // Close the dialog when back button is pressed
            useDialogStore.getState().closeAll();
          },
        },
      },
      position: "dock",
      viewSpecific: "profile",
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // The user will be redirected to the sign-in screen automatically
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Logout Failed", "Could not log out. Please try again.");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is irreversible.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await user?.delete();
              await signOut();
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert(
                "Delete Failed",
                "Could not delete account. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={profileStyles.container}>
      {/* Profile Header */}
      <View style={profileStyles.profileHeader}>
        <TouchableOpacity
          style={profileStyles.profileImageContainer}
          activeOpacity={0.8}
        >
          <View style={profileStyles.profileImageInner}>
            {user?.imageUrl || profileData.avatarUrl ? (
              <Image
                source={{ uri: user?.imageUrl || profileData.avatarUrl }}
                style={profileStyles.profileImage}
              />
            ) : (
              <View
                style={[
                  profileStyles.profileImage,
                  {
                    backgroundColor: "#F0F0F0",
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Ionicons name="person" size={40} color={COLORS.textIcons} />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Profile Information */}
      <View style={profileStyles.formSection}>
        <CdTextInputOneLine
          label={t("profile.name")}
          value={
            profileData.name || user?.fullName || t("profile.fallbacks.name")
          }
          onSubmit={(newName) => {
            updateProfileData({ name: newName });
          }}
          placeholder={t("profile.placeholders.name")}
        />

        <CdTextInputOneLine
          label={t("profile.email")}
          value={
            profileData.email ||
            user?.emailAddresses[0]?.emailAddress ||
            t("profile.fallbacks.email")
          }
          onSubmit={(newEmail) => {
            updateProfileData({ email: newEmail });
          }}
          placeholder={t("profile.placeholders.email")}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {(user?.phoneNumbers?.[0]?.phoneNumber || profileData.phoneNumber) && (
          <CdTextInputOneLine
            label={t("profile.phone")}
            value={
              user?.phoneNumbers?.[0]?.phoneNumber ||
              profileData.phoneNumber ||
              ""
            }
            onSubmit={(newPhone) => {
              updateProfileData({ phoneNumber: newPhone });
            }}
            placeholder={t("profile.placeholders.phone")}
            keyboardType="phone-pad"
          />
        )}
      </View>

      {/* Settings Section */}
      <View style={profileStyles.settingsSection}>
        <CdTextInputOneLine
          label={t("profile.notifications")}
          showValueText={false}
          isButton
          onPress={handleNotificationsPress}
        />

        <CdTextInputOneLine
          label={t("profile.wake-time")}
          value={settings.wakeTime}
          onSubmit={(input) => handleTimeSubmit("wake", input)}
          onChangeText={(input) => handleTimeChange("wake", input)}
          placeholder={t("profile.placeholders.wake-time")}
          keyboardType="numeric"
        />
        {timeInputErrors.wake && (
          <Text style={profileStyles.errorText}>{timeInputErrors.wake}</Text>
        )}

        <CdTextInputOneLine
          label={t("profile.sleep-time")}
          value={settings.sleepTime}
          onSubmit={(input) => handleTimeSubmit("sleep", input)}
          onChangeText={(input) => handleTimeChange("sleep", input)}
          placeholder={t("profile.placeholders.sleep-time")}
          keyboardType="numeric"
        />
        {timeInputErrors.sleep && (
          <Text style={profileStyles.errorText}>{timeInputErrors.sleep}</Text>
        )}

        <CdTextInputOneLine
          label={t("profile.subscription")}
          value={
            settings.subscriptionPlan === "free"
              ? t("profile.free")
              : t("profile.deep-cadence")
          }
          isButton
          onPress={handleSubscriptionPress}
        />
      </View>

      {/* Security Section */}
      <View style={profileStyles.settingsSection}>
        <Text style={profileStyles.sectionTitle}>{t("profile.security")}</Text>

        <CdTextInputOneLine
          label={t("profile.security-settings")}
          showValueText={false}
          isButton
          onPress={() =>
            openDialog({
              type: "change-password",
              props: {
                headerProps: {
                  onLeftAction: () => {
                    // Close the dialog when back button is pressed
                    useDialogStore.getState().closeAll();
                  },
                },
              },
              position: "dock",
              viewSpecific: "profile",
            })
          }
        />
      </View>

      {/* Support Section */}
      <View style={profileStyles.settingsSection}>
        <Text style={profileStyles.sectionTitle}>
          {t("profile.customer-support")}
        </Text>

        <CdTextInputOneLine
          label={t("profile.customer-support")}
          showValueText={false}
          isButton
          onPress={handleSupportPress}
        />
      </View>

      {/* App Information */}
      <View style={profileStyles.appInfoSection}>
        <Text style={profileStyles.sectionTitle}>{t("profile.app-info")}</Text>

        <CdTextInputOneLine
          label={t("profile.app-version")}
          value={`${appVersion} (${buildNumber})`}
          editable={false}
        />

        <CdTextInputOneLine
          label={t("profile.user-id")}
          value={user?.id || t("profile.fallbacks.user-id")}
          editable={false}
        />
      </View>

      {/* Logout and Delete Account */}
      <View style={profileStyles.actionsSection}>
        <CdButton
          title={t("profile.logout")}
          onPress={handleLogout}
          variant="outline"
          style={{ marginBottom: 10, borderColor: "#000" }}
          textStyle={{ color: "#000" }}
        />
        <CdButton
          title={t("profile.delete-account")}
          onPress={handleDeleteAccount}
          variant="destructive"
        />
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
