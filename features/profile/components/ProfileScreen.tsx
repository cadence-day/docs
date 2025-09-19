import { CdButton } from "@/shared/components/CadenceUI/CdButton";
import { CdTextInputOneLine } from "@/shared/components/CadenceUI/CdTextInputOneLine";
import { COLORS } from "@/shared/constants/COLORS";
import useTranslation from "@/shared/hooks/useI18n";
import useDialogStore from "@/shared/stores/useDialogStore";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { DateTimePicker, Host } from "@expo/ui/swift-ui";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
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
  const router = useRouter();
  const openDialog = useDialogStore((s) => s.openDialog);
  const { profileData, settings, updateProfileData, updateSettings } =
    useProfileStore();

  // Time picker state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState<"wake" | "sleep">(
    "wake"
  );
  const [selectedDate, setSelectedDate] = useState(new Date());

  const appVersion = Constants.expoConfig?.version || "Unknown";
  const buildNumber =
    // @ts-ignore - optional
    (Constants.expoConfig as any)?.ios?.buildNumber ||
    // @ts-ignore - optional
    (Constants.expoConfig as any)?.android?.versionCode ||
    "Unknown";

  // Helper function to convert time string to Date object
  const timeStringToDate = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  };

  // Helper function to convert Date object to time string with 30-minute rounding
  const dateToTimeString = (date: Date): string => {
    let hours = date.getHours();
    let minutes = date.getMinutes();

    // Round to nearest 30 minutes
    minutes = Math.round(minutes / 30) * 30;

    // Handle minute overflow
    if (minutes >= 60) {
      minutes = 0;
      hours = (hours + 1) % 24;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const handleTimePress = (type: "wake" | "sleep") => {
    const currentTime =
      type === "wake" ? settings.wakeTime : settings.sleepTime;
    setSelectedDate(timeStringToDate(currentTime));
    setTimePickerMode(type);
    setShowTimePicker(true);
  };

  // Handle date selection from Expo UI DateTimePicker
  const handleDateSelected = (date: Date) => {
    const timeString = dateToTimeString(date);

    if (timePickerMode === "wake") {
      updateSettings({ wakeTime: timeString });
    } else {
      updateSettings({ sleepTime: timeString });
    }

    setSelectedDate(date);
    setShowTimePicker(false);
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

        <TouchableOpacity style={profileStyles.editPhotoButton}>
          <Text style={profileStyles.editPhotoText}>
            {t("profile.edit-photo")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Information */}
      <View style={profileStyles.formSection}>
        <CdTextInputOneLine
          label={t("profile.name")}
          value={profileData.name || user?.fullName || "Your Name"}
          onSubmit={(newName) => {
            updateProfileData({ name: newName });
          }}
          placeholder="Enter your name"
        />

        <CdTextInputOneLine
          label={t("profile.email")}
          value={
            profileData.email ||
            user?.emailAddresses[0]?.emailAddress ||
            "email@example.com"
          }
          onSubmit={(newEmail) => {
            updateProfileData({ email: newEmail });
          }}
          placeholder="Enter your email"
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
            placeholder="Enter your phone number"
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
          isButton
          onPress={() => handleTimePress("wake")}
        />

        <CdTextInputOneLine
          label={t("profile.sleep-time")}
          value={settings.sleepTime}
          isButton
          onPress={() => handleTimePress("sleep")}
        />

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
        <Text style={profileStyles.sectionTitle}>{t("profile.support")}</Text>

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
          value={user?.id || "Unknown"}
          editable={false}
        />

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
          style={{ marginBottom: 10, borderColor: "#OOO" }}
          textStyle={{ color: "#OOO" }}
        />
        <CdButton
          title={t("profile.delete-account")}
          onPress={handleDeleteAccount}
          variant="destructive"
        />
      </View>

      {/* Expo UI Time Picker */}
      {showTimePicker && (
        <View style={timePickerStyles.pickerOverlay}>
          <View style={timePickerStyles.pickerContainer}>
            <View style={timePickerStyles.pickerHeader}>
              <TouchableOpacity
                onPress={() => setShowTimePicker(false)}
                style={timePickerStyles.pickerButton}
              >
                <Text style={timePickerStyles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={timePickerStyles.pickerTitle}>
                Set {timePickerMode === "wake" ? "Wake" : "Sleep"} Time
              </Text>
              <View style={timePickerStyles.pickerButton} />
            </View>
            <Host matchContents>
              <DateTimePicker
                onDateSelected={handleDateSelected}
                displayedComponents="hourAndMinute"
                initialDate={selectedDate.toISOString()}
                variant="wheel"
              />
            </Host>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

// Time picker styles
const timePickerStyles = StyleSheet.create({
  pickerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34, // Account for safe area
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  pickerButton: {
    minWidth: 60,
  },
  pickerCancelText: {
    fontSize: 16,
    color: COLORS.textIcons,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.light.text,
  },
});

export default ProfileScreen;
