import { CdButton } from "@/shared/components/CadenceUI/CdButton";
import { CdTextInputOneLine } from "@/shared/components/CadenceUI/CdTextInputOneLine";
import { COLORS } from "@/shared/constants/COLORS";
import useTranslation from "@/shared/hooks/useI18n";
import useDialogStore from "@/shared/stores/useDialogStore";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Link } from "expo-router";
import React from "react";
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

export const ProfileScreen: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const openDialog = useDialogStore((s) => s.openDialog);
  const { profileData, settings, updateProfileData, updateSettings } =
    useProfileStore();

  const appVersion = Constants.expoConfig?.version || "Unknown";
  const buildNumber =
    // @ts-ignore - optional
    (Constants.expoConfig as any)?.ios?.buildNumber ||
    // @ts-ignore - optional
    (Constants.expoConfig as any)?.android?.versionCode ||
    "Unknown";

  const handleTimePress = (type: "wake" | "sleep") => {
    openDialog({
      type: "time-picker",
      props: {
        mode: type,
        currentTime: type === "wake" ? settings.wakeTime : settings.sleepTime,
        onTimeChange: (time: string) => {
          updateSettings({
            [type === "wake" ? "wakeTime" : "sleepTime"]: time,
          });
        },
        height: 70,
        headerProps: {
          title:
            type === "wake"
              ? t("profile.set-wake-time")
              : t("profile.set-sleep-time"),
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

  const handleNotificationsPress = () => {
    // TODO: Navigate to notifications screen in future iteration
    console.log("Notifications pressed - to be implemented");
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
        </TouchableOpacity>

        <TouchableOpacity style={profileStyles.editPhotoButton}>
          <Text style={profileStyles.editPhotoText}>
            {t("profile.edit-photo")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Information */}
      <View style={profileStyles.formSection}>
        <View style={profileStyles.fieldRow}>
          <Text style={profileStyles.fieldLabel}>{t("profile.name")}</Text>
          <Text style={profileStyles.fieldValue}>
            {user?.fullName || profileData.name || "Your Name"}
          </Text>
        </View>

        <View style={profileStyles.fieldRow}>
          <Text style={profileStyles.fieldLabel}>{t("profile.email")}</Text>
          <Text style={profileStyles.fieldValue}>
            {user?.emailAddresses[0]?.emailAddress ||
              profileData.email ||
              "email@example.com"}
          </Text>
        </View>

        {(user?.phoneNumbers?.[0]?.phoneNumber || profileData.phoneNumber) && (
          <View style={profileStyles.fieldRow}>
            <Text style={profileStyles.fieldLabel}>{t("profile.phone")}</Text>
            <Text style={profileStyles.fieldValue}>
              {user?.phoneNumbers?.[0]?.phoneNumber || profileData.phoneNumber}
            </Text>
          </View>
        )}
      </View>

      {/* Settings Section */}
      <View style={profileStyles.settingsSection}>
        <TouchableOpacity
          style={profileStyles.settingRow}
          onPress={handleNotificationsPress}
        >
          <Text style={profileStyles.settingLabel}>
            {t("profile.notifications")}
          </Text>
          <View style={profileStyles.settingValue}>
            <Ionicons
              name="chevron-forward"
              size={16}
              style={profileStyles.chevronIcon}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={profileStyles.settingRow}
          onPress={() => handleTimePress("wake")}
        >
          <Text style={profileStyles.settingLabel}>
            {t("profile.wake-time")}
          </Text>
          <View style={profileStyles.settingValue}>
            <Text style={profileStyles.settingValueText}>
              {settings.wakeTime}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              style={profileStyles.chevronIcon}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={profileStyles.settingRow}
          onPress={() => handleTimePress("sleep")}
        >
          <Text style={profileStyles.settingLabel}>
            {t("profile.sleep-time")}
          </Text>
          <View style={profileStyles.settingValue}>
            <Text style={profileStyles.settingValueText}>
              {settings.sleepTime}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              style={profileStyles.chevronIcon}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={profileStyles.settingRow}
          onPress={handleSubscriptionPress}
        >
          <Text style={profileStyles.settingLabel}>
            {t("profile.subscription")}
          </Text>
          <View style={profileStyles.settingValue}>
            <Text style={profileStyles.settingValueText}>
              {settings.subscriptionPlan === "free"
                ? t("profile.free")
                : t("profile.deep-cadence")}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              style={profileStyles.chevronIcon}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Security Section */}
      <View style={profileStyles.settingsSection}>
        <Text style={profileStyles.sectionTitle}>{t("profile.security")}</Text>

        <CdTextInputOneLine
          label={t("profile.security-settings")}
          value={t("profile.changePasswordLabel")}
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
        <Text style={profileStyles.sectionTitle}>{t("profile.support")}</Text>

        <TouchableOpacity
          style={profileStyles.settingRow}
          onPress={handleSupportPress}
        >
          <Text style={profileStyles.settingLabel}>
            {t("profile.customer-support")}
          </Text>
          <View style={profileStyles.settingValue}>
            <Ionicons
              name="chevron-forward"
              size={16}
              style={profileStyles.chevronIcon}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* App Information */}
      <View style={profileStyles.appInfoSection}>
        <Text style={profileStyles.sectionTitle}>{t("profile.app-info")}</Text>

        <View style={profileStyles.appInfoRow}>
          <Text style={profileStyles.appInfoLabel}>
            {t("profile.app-version")}
          </Text>
          <Text style={profileStyles.appInfoValue}>
            {appVersion} ({buildNumber})
          </Text>
        </View>

        <View style={profileStyles.appInfoRow}>
          <Text style={profileStyles.appInfoLabel}>{t("profile.user-id")}</Text>
          <Text style={profileStyles.appInfoValue}>
            {user?.id || "Unknown"}
          </Text>
        </View>
        <Link href="/(utils)/debug">
          <Text style={{ color: "blue", textAlign: "center", padding: 10 }}>
            Debug Screen
          </Text>
        </Link>
      </View>

      {/* Logout and Delete Account */}
      <View style={profileStyles.actionsSection}>
        <CdButton
          title={t("profile.logout")}
          onPress={handleLogout}
          variant="outline"
          style={{ marginBottom: 10 }}
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
