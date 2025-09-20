import { CdButton } from "@/shared/components/CadenceUI/CdButton";
import { CdTextInputOneLine } from "@/shared/components/CadenceUI/CdTextInputOneLine";
import { COLORS } from "@/shared/constants/COLORS";
import useTranslation from "@/shared/hooks/useI18n";
import useDialogStore from "@/shared/stores/useDialogStore";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ProfileImageService } from "../services/ProfileImageService";
import { useProfileStore } from "../stores/useProfileStore";
import { profileStyles } from "../styles";
import {
  formatTimeInput,
  formatTimeInputLive,
  getTimeValidationError,
} from "../utils";

type ExpoConfig = {
  ios?: { buildNumber?: string };
  android?: { versionCode?: string | number };
  version?: string;
};

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

  // Profile image upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const appVersion = Constants.expoConfig?.version || "Unknown";
  const expoConfig = Constants.expoConfig as ExpoConfig | undefined;
  const buildNumber =
    expoConfig?.ios?.buildNumber ||
    expoConfig?.android?.versionCode?.toString() ||
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

  const handleProfileImagePress = () => {
    if (isUploadingImage) return;

    const showImagePicker = async () => {
      try {
        setIsUploadingImage(true);

        const result = await ProfileImageService.showImagePicker();

        if (result && !result.canceled && result.assets?.[0]) {
          const imageUri = result.assets[0].uri;

          // Upload the image
          const uploadResult = await ProfileImageService.uploadImage(imageUri);

          if (uploadResult.success) {
            // Update profile store with new avatar URL
            updateProfileData({ avatarUrl: uploadResult.url });

            // Haptic feedback for success
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            Alert.alert(
              t("profile.image-upload.success"),
              t("profile.image-upload.success-message")
            );
          } else {
            Alert.alert(t("profile.image-upload.error"), uploadResult.error);
          }
        }
      } catch (error) {
        console.log("Image picker error:", error);

        // Check if it's a native module error
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (
          errorMessage?.includes("Cannot find native module") ||
          errorMessage?.includes("not available in this build")
        ) {
          Alert.alert(
            t("profile.image-upload.error"),
            "Image picker is not available in this development build. Please rebuild the app with the latest dependencies."
          );
        } else {
          Alert.alert(
            t("profile.image-upload.error"),
            t("profile.image-upload.error-message")
          );
        }
      } finally {
        setIsUploadingImage(false);
      }
    };

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            t("common.cancel"),
            t("profile.image-upload.take-photo"),
            t("profile.image-upload.choose-from-library"),
          ],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            // Take photo
            try {
              setIsUploadingImage(true);
              const result = await ProfileImageService.takePhoto();

              if (result && !result.canceled && result.assets?.[0]) {
                const imageUri = result.assets[0].uri;
                const uploadResult =
                  await ProfileImageService.uploadImage(imageUri);

                if (uploadResult.success) {
                  updateProfileData({ avatarUrl: uploadResult.url });
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                  );
                  Alert.alert(
                    t("profile.image-upload.success"),
                    t("profile.image-upload.success-message")
                  );
                } else {
                  Alert.alert(
                    t("profile.image-upload.error"),
                    uploadResult.error
                  );
                }
              }
            } catch (error) {
              console.log("Camera error:", error);

              const errorMessage =
                error instanceof Error ? error.message : String(error);
              if (
                errorMessage?.includes("Cannot find native module") ||
                errorMessage?.includes("not available in this build")
              ) {
                Alert.alert(
                  t("profile.image-upload.error"),
                  "Camera is not available in this development build. Please rebuild the app with the latest dependencies."
                );
              } else {
                Alert.alert(
                  t("profile.image-upload.error"),
                  t("profile.image-upload.error-message")
                );
              }
            } finally {
              setIsUploadingImage(false);
            }
          } else if (buttonIndex === 2) {
            // Choose from library
            showImagePicker();
          }
        }
      );
    } else {
      // For Android, show a simple alert for now
      Alert.alert(t("profile.image-upload.select-option"), "", [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("profile.image-upload.take-photo"),
          onPress: async () => {
            try {
              setIsUploadingImage(true);
              const result = await ProfileImageService.takePhoto();

              if (result && !result.canceled && result.assets?.[0]) {
                const imageUri = result.assets[0].uri;
                const uploadResult =
                  await ProfileImageService.uploadImage(imageUri);

                if (uploadResult.success) {
                  updateProfileData({ avatarUrl: uploadResult.url });
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                  );
                  Alert.alert(
                    t("profile.image-upload.success"),
                    t("profile.image-upload.success-message")
                  );
                } else {
                  Alert.alert(
                    t("profile.image-upload.error"),
                    uploadResult.error
                  );
                }
              }
            } catch (error) {
              console.log("Camera error:", error);

              const errorMessage =
                error instanceof Error ? error.message : String(error);
              if (
                errorMessage?.includes("Cannot find native module") ||
                errorMessage?.includes("not available in this build")
              ) {
                Alert.alert(
                  t("profile.image-upload.error"),
                  "Camera is not available in this development build. Please rebuild the app with the latest dependencies."
                );
              } else {
                Alert.alert(
                  t("profile.image-upload.error"),
                  t("profile.image-upload.error-message")
                );
              }
            } finally {
              setIsUploadingImage(false);
            }
          },
        },
        {
          text: t("profile.image-upload.choose-from-library"),
          onPress: showImagePicker,
        },
      ]);
    }
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
          onPress={handleProfileImagePress}
          disabled={isUploadingImage}
        >
          <View style={profileStyles.profileImageInner}>
            {user?.imageUrl || profileData.avatarUrl ? (
              <Image
                source={{ uri: user?.imageUrl || profileData.avatarUrl }}
                style={[
                  profileStyles.profileImage,
                  isUploadingImage && { opacity: 0.5 },
                ]}
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
                  isUploadingImage && { opacity: 0.5 },
                ]}
              >
                <Ionicons name="person" size={40} color={COLORS.textIcons} />
              </View>
            )}
            {isUploadingImage && (
              <View style={profileStyles.uploadingOverlay}>
                <Ionicons name="cloud-upload" size={24} color={COLORS.white} />
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={profileStyles.editPhotoButton}
          onPress={handleProfileImagePress}
          disabled={isUploadingImage}
        >
          <Text style={profileStyles.editPhotoText}>
            {isUploadingImage
              ? t("profile.uploading")
              : t("profile.edit-photo")}
          </Text>
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
          style={{ marginBottom: 10, borderColor: COLORS.textIcons }}
          textStyle={{ color: COLORS.textIcons }}
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
