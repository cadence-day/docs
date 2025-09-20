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
import { useAuth, useSignIn, useUser } from "@clerk/clerk-expo";
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

export default function SecuritySettings() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();
  const { signIn } = useSignIn();
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
      console.error("Error clearing stores:", error);
      // Continue with sign out even if store clearing fails
    }
  };

  const handleChangePassword = async () => {
    if (!user) {
      showError("User not found. Please sign in again.");
      return;
    }

    // Show a password change dialog with input fields
    Alert.prompt(
      "Change Password",
      "Enter your current password:",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Next",
          onPress: (currentPassword?: string) => {
            if (!currentPassword?.trim()) {
              showError("Current password is required.");
              return;
            }
            // Ask for new password
            Alert.prompt(
              "New Password",
              "Enter your new password:",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Change Password",
                  onPress: async (newPassword?: string) => {
                    if (!newPassword?.trim() || newPassword.length < 8) {
                      showError(
                        "New password must be at least 8 characters long."
                      );
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

      showSuccess("Password changed successfully!");

      Alert.alert(
        "Password Changed",
        "Your password has been changed successfully. For security reasons, you'll be signed out now.",
        [
          {
            text: "OK",
            onPress: async () => {
              try {
                // Clear all stores before signing out
                clearAllStores();

                await signOut();
                router.replace("/(auth)/sign-in");
              } catch (error) {
                console.error("Error signing out:", error);
                router.replace("/(auth)/sign-in");
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Password change error:", error);

      if (error?.errors) {
        const errorMessage =
          error.errors[0]?.message || "Failed to change password.";
        showError(errorMessage);
      } else if (error?.message) {
        showError(error.message);
      } else {
        showError("Failed to change password. Please try again.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. Are you sure you want to delete your account permanently?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Contact Support",
              "To delete your account, please contact our support team. They will help you with the account deletion process and ensure all your data is properly removed.",
              [{ text: "OK" }]
            );
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "default",
        onPress: async () => {
          try {
            // Clear all stores before signing out
            clearAllStores();

            await signOut();
            router.replace("/(auth)/sign-in");
          } catch (error) {
            console.error("Error signing out:", error);
            showError("Failed to sign out. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Security",
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
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.headerBorder} />

      <View style={styles.container}>
        <ScrollView style={styles.scrollableContent}>
          {/* Password Section */}
          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>Password</Text>

            <CdTextInputOneLine
              label="Change Password"
              value={isChangingPassword ? "Sending..." : "Send reset email"}
              showValueText={true}
              isButton={true}
              onPress={handleChangePassword}
              showChevron={true}
              editable={!isChangingPassword}
            />
          </View>

          {/* Account Management Section */}
          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>Account Management</Text>

            <CdTextInputOneLine
              label="Sign Out"
              value="Sign out of your account"
              showValueText={true}
              isButton={true}
              onPress={handleSignOut}
              showChevron={true}
            />

            <CdTextInputOneLine
              label="Delete Account"
              value="Permanently delete account"
              showValueText={true}
              isButton={true}
              onPress={handleDeleteAccount}
              showChevron={true}
            />
          </View>
        </ScrollView>

        {/* Fixed Info Section at the bottom */}
        <View style={styles.fixedInfoSection}>
          <Text style={profileStyles.sectionTitle}>Security Information</Text>

          <View style={styles.infoContainer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={COLORS.primary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              Your account security is important to us. Password changes require
              email verification for your protection. Contact support for
              account deletion requests.
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
