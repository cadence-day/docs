import { profileStyles } from "@/features/profile/styles";
import { CdTextInputOneLine } from "@/shared/components/CadenceUI/CdTextInputOneLine";
import { COLORS } from "@/shared/constants/COLORS";
import useTranslation from "@/shared/hooks/useI18n";
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

  const appVersion = Constants.expoConfig?.version || "Unknown";
  const expoConfig = Constants.expoConfig as ExpoConfig | undefined;
  const buildNumber =
    expoConfig?.ios?.buildNumber ||
    expoConfig?.android?.versionCode?.toString() ||
    "Unknown";

  const handleEmailSupport = () => {
    const subject = encodeURIComponent("Cadence.day Support Request");
    const body = encodeURIComponent(
      `Hi Cadence.day Support Team,

Please describe your issue or question below:

[Your message here]

---
App Version: ${appVersion} (${buildNumber})
User ID: ${user?.id || "Unknown"}
User Email: ${user?.emailAddresses[0]?.emailAddress || "Unknown"}
Device: ${Constants.platform?.ios ? "iOS" : "Android"}
`
    );

    const emailUrl = `mailto:dev@cadence.day?subject=${subject}&body=${body}`;

    Linking.openURL(emailUrl).catch(() => {
      Alert.alert(
        "Email Not Available",
        "Unable to open email app. Please send your support request to: dev@cadence.day"
      );
    });
  };

  const handleFAQ = () => {
    const faqUrl = "https://cadence.day/faq";
    Linking.openURL(faqUrl).catch(() => {
      Alert.alert(
        "Unable to Open Link",
        "Please visit https://cadence.day/faq in your browser"
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
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.headerBorder} />

      <View style={styles.container}>
        <ScrollView style={styles.scrollableContent}>
          {/* Get Help Section */}
          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>Get Help</Text>

            <CdTextInputOneLine
              label="Email Support"
              value="Contact our support team"
              showValueText={true}
              isButton={true}
              onPress={handleEmailSupport}
              showChevron={true}
            />

            <CdTextInputOneLine
              label="FAQ"
              value="Frequently asked questions"
              showValueText={true}
              isButton={true}
              onPress={handleFAQ}
              showChevron={true}
            />
          </View>

          {/* Feedback Section */}
          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>Feedback</Text>

            <CdTextInputOneLine
              label="Feature Request"
              value="Submit feature suggestions"
              showValueText={true}
              isButton={true}
              onPress={handleFeatureRequest}
              showChevron={true}
            />

            <CdTextInputOneLine
              label="Report Bug"
              value="Submit bug reports"
              showValueText={true}
              isButton={true}
              onPress={handleBugReport}
              showChevron={true}
            />
          </View>

          {/* App Information */}
          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>App Information</Text>

            <CdTextInputOneLine
              label="App Version"
              value={`${appVersion} (${buildNumber})`}
              editable={false}
              allowCopy={true}
            />

            <CdTextInputOneLine
              label="User ID"
              value={user?.id || "Unknown"}
              editable={false}
              allowCopy={true}
            />
          </View>

          {/* Legal Section */}
          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>Legal</Text>

            <CdTextInputOneLine
              label="Privacy Policy"
              value="View our privacy policy"
              showValueText={true}
              isButton={true}
              onPress={handlePrivacyPolicy}
              showChevron={true}
            />

            <CdTextInputOneLine
              label="Terms of Service"
              value="View terms of service"
              showValueText={true}
              isButton={true}
              onPress={handleTermsOfService}
              showChevron={true}
            />
          </View>
        </ScrollView>

        {/* Fixed Info Section */}
        <View style={styles.fixedInfoSection}>
          <Text style={profileStyles.sectionTitle}>Support Information</Text>

          <View style={styles.infoContainer}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={COLORS.primary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              We're here to help! Our support team typically responds within 24
              hours. For urgent issues, please include as much detail as
              possible in your message.
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
