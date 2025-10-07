import { CdButton, CdText } from "@/shared/components/CadenceUI";
import { COLORS, CONTAINER, TYPOGRAPHY } from "@/shared/constants";
import { useI18n } from "@/shared/hooks/useI18n";
import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

/**
 * V2 Welcome Screen
 *
 * Explains the changes in V2 and provides information for legacy users
 * about migrating their data from V1.
 */
export default function V2WelcomeScreen() {
  const { t } = useI18n();

  const handleGoToProfile = () => {
    router.push("/profile");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <CdText variant="title" size="large" style={styles.title}>
          {t("v2-welcome.title")}
        </CdText>

        <View style={styles.section}>
          <CdText variant="title" size="medium" style={styles.sectionTitle}>
            {t("v2-welcome.whats-new")}
          </CdText>
          <CdText variant="body" size="medium" style={styles.bodyText}>
            {t("v2-welcome.new-features")}
          </CdText>
        </View>

        <View style={styles.section}>
          <CdText variant="title" size="medium" style={styles.sectionTitle}>
            {t("v2-welcome.important-changes")}
          </CdText>
          <CdText variant="body" size="medium" style={styles.bodyText}>
            {t("v2-welcome.new-account-required")}
          </CdText>
        </View>

        <View style={styles.section}>
          <CdText variant="title" size="medium" style={styles.sectionTitle}>
            {t("v2-welcome.legacy-users-title")}
          </CdText>
          <CdText variant="body" size="medium" style={styles.bodyText}>
            {t("v2-welcome.legacy-users-description")}
          </CdText>
        </View>

        <View style={styles.section}>
          <CdText variant="title" size="medium" style={styles.sectionTitle}>
            {t("v2-welcome.how-to-migrate", "How to Migrate Your Data")}
          </CdText>
          <CdText variant="body" size="medium" style={styles.bodyText}>
            1. {t("v2-welcome.step-1", "Go to your Profile screen")}
          </CdText>
          <CdText variant="body" size="medium" style={styles.bodyText}>
            2.{" "}
            {t(
              "v2-welcome.step-2",
              "Find the 'Migrate Previous Account' section"
            )}
          </CdText>
          <CdText variant="body" size="medium" style={styles.bodyText}>
            3.{" "}
            {t("v2-welcome.step-3", "Enter your old Cadence 1.0 email address")}
          </CdText>
          <CdText variant="body" size="medium" style={styles.bodyText}>
            4.{" "}
            {t(
              "v2-welcome.step-4",
              "Click 'Start Migration' to begin the process"
            )}
          </CdText>
        </View>

        <View style={styles.buttonContainer}>
          <CdButton
            title={t("v2-welcome.go-to-profile", "Go to Profile")}
            onPress={handleGoToProfile}
            variant="primary"
            size="large"
            style={styles.primaryButton}
            textStyle={styles.primaryButtonText}
          />
          <CdButton
            title={t("v2-welcome.close", "Close")}
            onPress={handleClose}
            variant="outline"
            size="large"
            style={styles.outlineButton}
            textStyle={styles.outlineButtonText}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    ...CONTAINER.padding.lg,
    paddingBottom: 48,
  },
  title: {
    ...TYPOGRAPHY.heading.h1,
    ...CONTAINER.margin.bottom.lg,
    textAlign: "center",
    color: COLORS.light.text.primary,
  },
  section: {
    ...CONTAINER.margin.bottom.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.heading.h3,
    ...CONTAINER.margin.bottom.md,
    color: COLORS.light.text.primary,
  },
  bodyText: {
    ...TYPOGRAPHY.body.medium,
    ...CONTAINER.margin.bottom.xs,
    lineHeight: 24,
    color: COLORS.light.text.secondary,
  },
  buttonContainer: {
    ...CONTAINER.margin.top["2xl"],
    ...CONTAINER.gap.md,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderWidth: 0,
  },
  primaryButtonText: {
    color: COLORS.white,
  },
  outlineButton: {
    borderColor: COLORS.primary,
    backgroundColor: "transparent",
  },
  outlineButtonText: {
    color: COLORS.primary,
  },
});
