import { useProfileStore } from "@/features/profile/stores/useProfileStore";
import { profileStyles } from "@/features/profile/styles";
import { CdTextInputOneLine } from "@/shared/components/CadenceUI/CdTextInputOneLine";
import Toast from "@/shared/components/Toast";
import { COLORS } from "@/shared/constants/COLORS";
import { useToast } from "@/shared/hooks";
import useTranslation from "@/shared/hooks/useI18n";
import {
  useActivitiesStore,
  useActivityCategoriesStore,
  useDialogStore,
  useNotesStore,
  useSelectionStore,
  useStatesStore,
  useTimeslicesStore,
} from "@/shared/stores";
import { useAuth, useUser } from "@clerk/clerk-expo";
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
import { GlobalErrorHandler } from "../../shared/utils/errorHandler";

export default function SecuritySettings() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();
  const { toast, showError, showSuccess, hideToast } = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Store reset functions
  const resetProfileStore = useProfileStore((state) => state.reset);
  const resetActivitiesStore = useActivitiesStore((state) => state.reset);
  const resetActivityCategoriesStore = useActivityCategoriesStore(
    (state) => state.reset
  );
  const resetNotesStore = useNotesStore((state) => state.reset);
  const resetStatesStore = useStatesStore((state) => state.reset);
  const resetTimeslicesStore = useTimeslicesStore((state) => state.reset);
  const resetDialogStore = useDialogStore((state) => state.closeAll);
  const resetSelectionStore = useSelectionStore((state) => state.reset);

  // Function to clear all stores
  const clearAllStores = () => {
    try {
      resetProfileStore();
      resetActivitiesStore();
      resetActivityCategoriesStore();
      resetNotesStore();
      resetStatesStore();
      resetTimeslicesStore();
      resetDialogStore();
      resetSelectionStore();
    } catch (error) {
      GlobalErrorHandler.logError(
        "Error clearing stores",
        "CLEAR_STORES_ERROR",
        { error }
      );
    }
  };

  const handleChangePassword = async () => {
    if (!user) {
      showError(t("user-not-found-please-sign-in"));
      return;
    }

    // Show a password change dialog with input fields
    Alert.prompt(
      t("change-password"),
      t("enter-your-current-password"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("next"),
          onPress: (currentPassword?: string) => {
            if (!currentPassword?.trim()) {
              showError(t("current-password-is-required"));
              return;
            }
            // Ask for new password
            Alert.prompt(
              t("new-password"),
              t("enter-your-new-password"),
              [
                {
                  text: t("common.cancel"),
                  style: "cancel",
                },
                {
                  text: t("change-password"),
                  onPress: async (newPassword?: string) => {
                    if (!newPassword?.trim() || newPassword.length < 8) {
                      showError(t("new-password-must-be-at-least"));
                      return;
                    }
                    await performPasswordChange(currentPassword, newPassword);
                  },
                },
              ],
              "secure-text"
            );
          },
        },
      ],
      "secure-text"
    );
  };

  const performPasswordChange = async (
    currentPassword: string,
    newPassword: string
  ) => {
    setIsChangingPassword(true);

    try {
      // Use Clerk's updatePassword method for authenticated users
      await user?.updatePassword({
        currentPassword,
        newPassword,
      });

      showSuccess(t("password-changed-successfully"));

      Alert.alert(t("password-changed"), t("your-password-has-been-changed"), [
        {
          text: "OK",
          onPress: async () => {
            try {
              // Clear all stores before signing out
              clearAllStores();

              await signOut();
              router.replace("/(auth)/sign-in");
            } catch (error) {
              GlobalErrorHandler.logError(
                "Error signing out",
                "SIGN_OUT_ERROR",
                { error }
              );
              router.replace("/(auth)/sign-in");
            }
          },
        },
      ]);
    } catch {
      const error = "Failed to change password";
      GlobalErrorHandler.logError(
        "Password change error",
        "PASSWORD_CHANGE_ERROR",
        { error }
      );
      showError(error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t("profile.delete-account"),
      t("this-action-cannot-be-undone-a"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("delete"),
          style: "destructive",
          onPress: () => {
            Alert.alert(
              t("settings.support.contact"),
              t("to-delete-your-account-please"),
              [{ text: "OK" }]
            );
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert(t("sign-out"), t("are-you-sure-you-want-to-sign"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("sign-out"),
        style: "default",
        onPress: async () => {
          try {
            // Clear all stores before signing out
            clearAllStores();

            await signOut();
            router.replace("/(auth)/sign-in");
          } catch (error) {
            GlobalErrorHandler.logError("Error signing out", "SIGN_OUT_ERROR", {
              error,
            });
            showError(t("failed-to-sign-out-please-try"));
          }
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t("profile.security"),
          headerShown: true,
          headerStyle: {
            backgroundColor: COLORS.light.background,
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
          {/* Password Section */}
          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>
              {t("sign-in.password")}
            </Text>

            <CdTextInputOneLine
              label={t("change-password")}
              value={isChangingPassword ? t("sending") : t("send-reset-email")}
              showValueText={true}
              isButton={true}
              onPress={handleChangePassword}
              showChevron={true}
              editable={!isChangingPassword}
            />
          </View>

          {/* Account Management Section */}
          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>
              {t("account-management")}
            </Text>

            <CdTextInputOneLine
              label={t("sign-out")}
              value={t("sign-out-of-your-account")}
              showValueText={true}
              isButton={true}
              onPress={handleSignOut}
              showChevron={true}
            />

            <CdTextInputOneLine
              label={t("profile.delete-account")}
              value={t("permanently-delete-account")}
              showValueText={true}
              isButton={true}
              onPress={handleDeleteAccount}
              showChevron={true}
            />
          </View>
        </ScrollView>

        {/* Fixed Info Section at the bottom */}
        <View style={styles.fixedInfoSection}>
          <Text style={profileStyles.sectionTitle}>
            {t("security-information")}
          </Text>

          <View style={styles.infoContainer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={COLORS.primary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              {t("your-account-security-is-impor")}
            </Text>
          </View>
        </View>
      </View>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onHide={hideToast}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  scrollableContent: {
    flex: 1,
    paddingTop: 16,
  },
  fixedInfoSection: {
    backgroundColor: COLORS.light.background,
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
});
