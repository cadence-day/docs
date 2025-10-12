import { useLegacyEncryptionKeySync } from "@/features/migration/hooks/useLegacyEncryptionKeySync";
import { CdButton, CdText, CdTextInput } from "@/shared/components/CadenceUI";
import Toast from "@/shared/components/Toast";
import { COLORS, CONTAINER, TYPOGRAPHY } from "@/shared/constants";
import { useToast } from "@/shared/hooks";
import { useI18n } from "@/shared/hooks/useI18n";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

/**
 * Legacy Migration Section Component
 *
 * Allows users with Cadence 1.0 accounts to migrate their data
 * by entering their legacy email address.
 */
export const LegacyMigrationSection: React.FC = () => {
  const { t } = useI18n();
  const router = useRouter();
  const [legacyEmail, setLegacyEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { syncEncryptionKey, isLoading } = useLegacyEncryptionKeySync();
  const { toast, showError, showSuccess, hideToast } = useToast();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleMigrate = async () => {
    // Validate email
    if (!legacyEmail.trim()) {
      showError(
        t(
          "migration.error-email-required",
          "Please enter your legacy email address"
        )
      );
      return;
    }

    if (!validateEmail(legacyEmail)) {
      showError(
        t("migration.error-invalid-email", "Please enter a valid email address")
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Sync the encryption key with the legacy email
      await syncEncryptionKey(legacyEmail.trim().toLowerCase());

      // Haptic feedback for success
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Show success message
      showSuccess(
        t(
          "migration.success",
          "Migration setup complete! Your legacy encryption key has been saved."
        )
      );

      // Navigate to the migration screen to continue the process
      setTimeout(() => {
        router.push("/settings/migration");
      }, 1500);
    } catch (error) {
      // Haptic feedback for error
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes("No legacy encryption key found")) {
        Alert.alert(
          t("migration.no-legacy-data-title", "No Legacy Data Found"),
          t(
            "migration.no-legacy-data-message",
            "No legacy encryption key was found on this device. This may mean:\n\n" +
              "• This device was not used for Cadence 1.0\n" +
              "• The app data was cleared\n" +
              "• You're already using Cadence 2.0\n\n" +
              "If you had data in Cadence 1.0, please try from the device you used with version 1.0."
          ),
          [{ text: t("common.ok", "OK") }]
        );
      } else {
        showError(
          t(
            "migration.error-failed",
            "Failed to start migration. Please try again."
          )
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLearnMore = () => {
    router.push("/settings/v2-welcome");
  };

  return (
    <View style={styles.container}>
      <CdText variant="body" size="medium" style={styles.description}>
        {t(
          "migration.description",
          "If you previously used Cadence 1.0, enter your old email address to begin migrating your data to your new account."
        )}
      </CdText>

      <CdTextInput
        placeholder={t(
          "migration.legacy-email-placeholder",
          "Enter your legacy email address"
        )}
        value={legacyEmail}
        onChangeText={setLegacyEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isSubmitting && !isLoading}
        style={styles.input}
      />

      <CdButton
        title={
          isSubmitting || isLoading
            ? t("migration.starting", "Starting Migration...")
            : t("migration.start-migration", "Start Migration")
        }
        onPress={handleMigrate}
        variant="primary"
        size="large"
        disabled={isSubmitting || isLoading}
        style={styles.primaryButton}
        textStyle={styles.primaryButtonText}
      />

      <CdButton
        title={t("migration.learn-more", "Learn More About V2")}
        onPress={handleLearnMore}
        variant="outline"
        size="medium"
        disabled={isSubmitting || isLoading}
        style={styles.outlineButton}
        textStyle={styles.outlineButtonText}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onHide={hideToast}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...CONTAINER.padding.horizontal.lg,
  },
  description: {
    ...TYPOGRAPHY.body.medium,
    marginBottom: 12,
    marginTop: 4,
    color: COLORS.light.text.secondary,
  },
  input: {
    color: COLORS.black,
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    borderWidth: 0,
  },
  primaryButtonText: {
    color: COLORS.white,
  },
  outlineButton: {
    marginTop: 12,
    borderColor: COLORS.primary,
    backgroundColor: "transparent",
  },
  outlineButtonText: {
    color: COLORS.primary,
  },
});
