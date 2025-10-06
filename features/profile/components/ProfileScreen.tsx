import { CdTextInputOneLine } from "@/shared/components/CadenceUI/CdTextInputOneLine";
import { COLORS } from "@/shared/constants/COLORS";
import useTranslation from "@/shared/hooks/useI18n";
import { generalStyles } from "@/shared/styles";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { GlobalErrorHandler } from "../../../shared/utils/errorHandler";
import DebugPanel from "../../debug/components/DebugPanel";
import { ProfileImageService } from "../services/ProfileImageService";
import { ProfileUpdateService } from "../services/ProfileUpdateService";
import { useProfileStore } from "../stores/useProfileStore";
import { profileStyles } from "../styles";
import {
  formatTimeInput,
  formatTimeInputLive,
  getTimeValidationError,
} from "../utils";

export const ProfileScreen: React.FC = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const router = useRouter();
  const { profileData, settings, updateProfileData, updateSettings } =
    useProfileStore();
  // Time input state for validation
  const [timeInputErrors, setTimeInputErrors] = useState<{
    wake?: string;
    sleep?: string;
  }>({});

  // Profile image upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Sync user data from Clerk on mount
  useEffect(() => {
    const syncUserData = () => {
      const userData = ProfileUpdateService.getCurrentUserData();
      if (userData) {
        updateProfileData({
          name: userData.fullName,
          email: userData.email,
          phoneNumber: userData.phone,
          avatarUrl: userData.avatarUrl,
        });
      }
    };

    if (user) {
      syncUserData();
    }
  }, [user, updateProfileData]);

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

  // Handle name update through Clerk
  const handleNameUpdate = async (newName: string) => {
    if (!newName.trim()) {
      Alert.alert(t("common.error"), t("profile.actions.update-name-error"));
      return;
    }

    try {
      const result = await ProfileUpdateService.updateName(newName);

      if (result.success) {
        // Update local store with the new name
        updateProfileData({ name: newName });
        ProfileUpdateService.showSuccessMessage(
          t("profile.actions.update-name-success")
        );
      } else {
        ProfileUpdateService.showErrorMessage(
          result.error || t("profile.actions.update-name-failed")
        );
      }
    } catch (error) {
      GlobalErrorHandler.logError("Error updating name", "NAME_UPDATE_ERROR", {
        error,
      });
      ProfileUpdateService.showErrorMessage(
        t("profile.actions.update-name-failed-retry")
      );
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
        GlobalErrorHandler.logError(
          "Image picker error",
          "IMAGE_PICKER_ERROR",
          { error }
        );

        // Check if it's a native module error
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (
          errorMessage?.includes("Cannot find native module") ||
          errorMessage?.includes("not available in this build")
        ) {
          Alert.alert(
            t("profile.image-upload.error"),
            t("profile.errors.image-picker-unavailable")
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
              GlobalErrorHandler.logError("Camera error", "CAMERA_ERROR", {
                error,
              });
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              if (
                errorMessage?.includes("Cannot find native module") ||
                errorMessage?.includes("not available in this build")
              ) {
                Alert.alert(
                  t("profile.image-upload.error"),
                  t("profile.errors.camera-unavailable")
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
              GlobalErrorHandler.logError("Camera error", "CAMERA_ERROR", {
                error,
              });

              const errorMessage =
                error instanceof Error ? error.message : String(error);
              if (
                errorMessage?.includes("Cannot find native module") ||
                errorMessage?.includes("not available in this build")
              ) {
                Alert.alert(
                  t("profile.image-upload.error"),
                  t("profile.errors.camera-unavailable")
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

  const handleSecurityPress = () => {
    router.push("/settings/security");
  };

  const handleSupportPress = () => {
    router.push("/settings/customer-support");
  };

  // Developer debug utilities (hidden in production)
  const isDev = __DEV__;

  return (
    <SafeAreaView style={generalStyles.flexContainer} edges={["bottom", "top"]}>
      <ScrollView style={generalStyles.flexContainer}>
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
                    isUploadingImage && profileStyles.uploadingImageOpacity,
                  ]}
                />
              ) : (
                <View
                  style={[
                    profileStyles.profileImage,
                    isUploadingImage && profileStyles.uploadingImageOpacity,
                  ]}
                >
                  <Ionicons name="person" size={40} color={COLORS.textIcons} />
                </View>
              )}
              {isUploadingImage && (
                <View style={profileStyles.uploadingOverlay}>
                  <Ionicons
                    name="cloud-upload"
                    size={24}
                    color={COLORS.white}
                  />
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
            onSave={handleNameUpdate}
            placeholder={t("profile.placeholders.name")}
          />

          <CdTextInputOneLine
            label={t("profile.email")}
            value={
              profileData.email ||
              user?.emailAddresses[0]?.emailAddress ||
              t("profile.fallbacks.email")
            }
            editable={false}
            placeholder={t("profile.placeholders.email")}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {(user?.phoneNumbers?.[0]?.phoneNumber ||
            profileData.phoneNumber) && (
            <CdTextInputOneLine
              label={t("profile.phone")}
              value={
                user?.phoneNumbers?.[0]?.phoneNumber ||
                profileData.phoneNumber ||
                ""
              }
              editable={false}
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
            showChevron={true}
          />

          <CdTextInputOneLine
            label={t("profile.wake-time")}
            value={settings.wakeTime}
            onSave={(input) => handleTimeSubmit("wake", input)}
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
            onSave={(input) => handleTimeSubmit("sleep", input)}
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
            onPress={() => router.push("/settings/subscription")}
            showChevron={true}
          />
        </View>

        {/* Security Section */}
        <View style={profileStyles.settingsSection}>
          <Text style={profileStyles.sectionTitle}>
            {t("profile.security")}
          </Text>

          <CdTextInputOneLine
            label={t("profile.security-settings")}
            showValueText={false}
            isButton
            onPress={handleSecurityPress}
            showChevron={true}
          />
          {/* Encryption Section */}
          <CdTextInputOneLine
            label={t("profile.actions.link-new-device")}
            showValueText={false}
            isButton={true}
            onPress={() => router.push("/settings/encryption")}
            showChevron={true}
          />

          {/* Encryption Visualization Toggle */}
          {/* <CdTextInputOneLine
          label="Encryption Visualization"
          value={isVisualizationMode ? "ON" : "OFF"}
          showValueText={true}
          isButton={true}
          onPress={() => {
            toggleVisualizationMode();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          showChevron={false}
        /> */}
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
            showChevron={true}
          />
        </View>

        {/* Data Migration Section */}
        <View style={profileStyles.settingsSection}>
          <Text style={profileStyles.sectionTitle}>{t("profile.data")}</Text>

          <CdTextInputOneLine
            label={t("profile.migrate-data")}
            showValueText={false}
            isButton
            onPress={() => router.push("/settings/migration")}
            showChevron={true}
          />
        </View>

        {/* Data Migration Section */}
        <View style={profileStyles.settingsSection}>
          <Text style={profileStyles.sectionTitle}>{t("profile.data")}</Text>

          <CdTextInputOneLine
            label={t("profile.migrate-data")}
            showValueText={false}
            isButton
            onPress={() => router.push("/settings/migration")}
            showChevron={true}
          />
        </View>

        {/* Debug Section */}
        {isDev && (
          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>Debug</Text>
            <DebugPanel />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
