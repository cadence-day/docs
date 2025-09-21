import { profileStyles } from "@/features/profile/styles";
import { CdTextInputOneLine } from "@/shared/components/CadenceUI/CdTextInputOneLine";
import { COLORS } from "@/shared/constants/COLORS";
import useTranslation from "@/shared/hooks/useI18n";
import { useDialogStore } from "@/shared/stores";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Stack, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ExpoConfig = {
  ios?: { buildNumber?: string };
  android?: { versionCode?: string | number };
  version?: string;
};

export default function CustomerSupportSettings() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useUser();

  const appVersion =
    Constants.expoConfig?.version || t("settings.support.version-unknown");
  const expoConfig = Constants.expoConfig as ExpoConfig | undefined;
  const buildNumber =
    expoConfig?.ios?.buildNumber ||
    expoConfig?.android?.versionCode?.toString() ||
    t("settings.support.version-unknown");

  const handleEmailSupport = () => {
    const subject = encodeURIComponent(t("cadence-day-support-request"));
    const body = encodeURIComponent(
      t("hi-cadence-day-support-team-pl")
        .replace("{0}", appVersion)
        .replace("{1}", buildNumber)
        .replace("{2}", user?.id || "Unknown")
        .replace("{3}", user?.emailAddresses?.[0]?.emailAddress || "Unknown")
        .replace(
          "{4}",
          Constants.platform?.web
            ? "Web"
            : Constants.platform?.ios
              ? "iOS"
              : Constants.platform?.android
                ? "Android"
                : "Unknown"
        )
    );

    const emailUrl = `mailto:dev@cadence.day?subject=${subject}&body=${body}`;

    Linking.openURL(emailUrl).catch(() => {
      Alert.alert(
        t("email-not-available"),
        t("unable-to-open-email-app-pleas")
      );
    });
  };

  const handleFAQ = () => {
    const faqUrl = "https://cadence.day/faq";
    Linking.openURL(faqUrl).catch(() => {
      Alert.alert(
        t("unable-to-open-link"),
        t("please-visit-https-cadence-day")
      );
    });
  };

  const handleFeatureRequest = () => {
    router.push("/settings/feature-request");
  };

  const handleBugReport = () => {
    router.push("/settings/bug-report");
  };

  const handlePrivacyPolicy = async () => {
    await WebBrowser.openBrowserAsync("https://app.cadence.day/legal/privacy", {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  };

  const handleTermsOfService = async () => {
    await WebBrowser.openBrowserAsync("https://app.cadence.day/legal/terms", {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  };

  const handleOpenOnboarding = () => {
    useDialogStore.getState().openDialog({
      type: "onboarding",
      position: "dock",
      props: {
        headerProps: {
          title: t("onboarding.title"),
        },
        height: 85,
      },
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t("profile.customer-support"),
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
          {/* Get Help Section */}
          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>{t("get-help")}</Text>

            <CdTextInputOneLine
              label={t("email-support")}
              value={t("t-contact-our-support-team")}
              showValueText={true}
              isButton={true}
              onPress={handleEmailSupport}
              showChevron={true}
            />

            <CdTextInputOneLine
              label="FAQ"
              value={t("frequently-asked-questions")}
              showValueText={true}
              isButton={true}
              onPress={handleFAQ}
              showChevron={true}
            />

            <CdTextInputOneLine
              label={t("onboarding.view-again")}
              value={t("onboarding.missed-intro")}
              showValueText={true}
              isButton={true}
              onPress={handleOpenOnboarding}
              showChevron={true}
            />
          </View>

          {/* Feedback Section */}
          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>{t("feedback")}</Text>

            <CdTextInputOneLine
              label={t("feature-request")}
              value={t("submit-feature-suggestions")}
              showValueText={true}
              isButton={true}
              onPress={handleFeatureRequest}
              showChevron={true}
            />

            <CdTextInputOneLine
              label={t("report-bug")}
              value={t("submit-bug-reports")}
              showValueText={true}
              isButton={true}
              onPress={handleBugReport}
              showChevron={true}
            />
          </View>

          {/* App Information */}
          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>t('app-information')</Text>

            <CdTextInputOneLine
              label={t("profile.app-version")}
              value={`${appVersion} (${buildNumber})`}
              editable={false}
              allowCopy={true}
            />

            <CdTextInputOneLine
              label={t("profile.user-id")}
              value={user?.id || "Unknown"}
              editable={false}
              allowCopy={true}
            />
          </View>

          {/* Legal Section */}
          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>{t("legal")}</Text>

            <CdTextInputOneLine
              label={t("privacy-policy")}
              value={t("view-our-privacy-policy")}
              showValueText={true}
              isButton={true}
              onPress={handlePrivacyPolicy}
              showChevron={true}
            />

            <CdTextInputOneLine
              label={t("terms-of-service")}
              value={t("view-terms-of-service")}
              showValueText={true}
              isButton={true}
              onPress={handleTermsOfService}
              showChevron={true}
            />
          </View>
        </ScrollView>

        {/* Fixed Info Section */}
        <View style={styles.fixedInfoSection}>
          <Text style={profileStyles.sectionTitle}>
            {t("support-information")}
          </Text>

          <View style={styles.infoContainer}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={COLORS.primary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              {t("were-here-to-help-our-support")}
            </Text>
          </View>
        </View>
      </View>
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
