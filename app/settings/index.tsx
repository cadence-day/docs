import { CdTextInputOneLine } from "@/shared/components/CadenceUI/CdTextInputOneLine";
import { useI18n } from "@/shared/hooks/useI18n";
import useDialogStore from "@/shared/stores/useDialogStore";
import { useErrorHandler } from "@/shared/utils/errorHandler";
import { useUser } from "@clerk/clerk-expo";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsPage() {
  const { logDebug } = useErrorHandler();
  const { user } = useUser();
  const { t } = useI18n();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [healthDataAccess, setHealthDataAccess] = useState(false);
  const router = useRouter();
  const openDialog = useDialogStore((s) => s.openDialog);

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    Alert.alert(
      t("settings.notifications.title"),
      `${t("settings.notifications.title")} ${!notificationsEnabled ? t("settings.notifications.enabled") : t("settings.notifications.disabled")}`
    );
  };

  const toggleHealthData = () => {
    setHealthDataAccess(!healthDataAccess);
    Alert.alert(
      t("settings.alerts.health-data-title"),
      `${t("settings.health-data.access")} ${!healthDataAccess ? t("settings.notifications.enabled") : t("settings.notifications.disabled")}`
    );
  };

  const contactSupport = () => {
    const email = "support@cadenceapp.com";
    const subject = t("settings.support.support-subject");
    const body = `${t("settings.support.user-id")}: ${user?.id}\n${t("settings.support.app-version")}: ${Constants.expoConfig?.version}\n\n${t("settings.support.support-body-prefix")}`;

    Linking.openURL(
      `mailto:${email}?subject=${subject}&body=${encodeURIComponent(body)}`
    );
  };

  const openAppInformation = () => {
    Alert.alert(
      t("settings.alerts.app-info-title"),
      `Version: ${Constants.expoConfig?.version || t("settings.support.version-unknown")}\nBuild: ${Constants.expoConfig?.extra?.buildNumber || t("settings.support.version-unknown")}\nPlatform: ${Constants.platform?.ios ? "iOS" : "Android"}`,
      [{ text: t("common.ok") }]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t("settings.title"),
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ paddingHorizontal: 12 }}
            >
              <Text style={{ color: "#007bff", fontSize: 16 }}>{t("settings.back")}</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container}>
        {/* Notifications Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.notifications.title")}</Text>

          <CdTextInputOneLine
            label={t("settings.notifications.push")}
            value={notificationsEnabled ? t("settings.notifications.enabled") : t("settings.notifications.disabled")}
            isButton={true}
            onPress={toggleNotifications}
            buttonIcon={
              notificationsEnabled ? "notifications" : "notifications-off"
            }
          />

          <CdTextInputOneLine
            label={t("settings.notifications.email")}
            value={t("settings.notifications.configure-email")}
            isButton={true}
            onPress={() =>
              Alert.alert(
                t("settings.notifications.coming-soon"),
                t("settings.notifications.email-coming-soon")
              )
            }
            buttonIcon="mail"
          />
        </View>

        {/* Health & Data Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.health-data.title")}</Text>

          <CdTextInputOneLine
            label={t("settings.health-data.access")}
            value={healthDataAccess ? t("settings.notifications.enabled") : t("settings.notifications.disabled")}
            isButton={true}
            onPress={toggleHealthData}
            buttonIcon={healthDataAccess ? "fitness" : "fitness-outline"}
          />

          <CdTextInputOneLine
            label={t("settings.health-data.export")}
            value={t("settings.health-data.export-value")}
            isButton={true}
            onPress={() =>
              Alert.alert(
                t("settings.health-data.coming-soon"),
                t("settings.health-data.export-coming-soon")
              )
            }
            buttonIcon="download"
          />

          <CdTextInputOneLine
            label={t("settings.health-data.privacy")}
            value={t("settings.health-data.privacy-value")}
            isButton={true}
            onPress={() =>
              Alert.alert(
                t("settings.health-data.coming-soon"),
                t("settings.health-data.privacy-coming-soon")
              )
            }
            buttonIcon="shield-checkmark"
          />
        </View>

        {/* Security & Encryption */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.security.title")}</Text>

          <CdTextInputOneLine
            label={t("settings.security.link-device")}
            value={t("settings.security.link-device-value")}
            isButton={true}
            onPress={() => {
              openDialog({
                type: "encryption-link",
                props: {
                  height: 80,
                  enableDragging: true,
                  headerProps: { title: t("settings.security.link-device-title") },
                },
                position: "dock",
                viewSpecific: "index",
              });
              // Navigate to Today so the dialog host can render it immediately
              try {
                // router.replace expects a strongly typed route; cast to any to keep existing runtime behavior
                router.replace("/(home)/index" as unknown as any);
              } catch {}
            }}
            buttonIcon="key"
          />
        </View>

        {/* Support & Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.support.title")}</Text>

          <CdTextInputOneLine
            label={t("settings.support.contact")}
            value={t("settings.support.contact-value")}
            isButton={true}
            onPress={contactSupport}
            buttonIcon="help-circle"
          />

          <CdTextInputOneLine
            label={t("settings.support.app-info")}
            value={t("settings.support.app-info-value")}
            isButton={true}
            onPress={openAppInformation}
            buttonIcon="information-circle"
          />

          <CdTextInputOneLine
            label={t("settings.support.user-id")}
            value={user?.id || t("settings.support.user-id-fallback")}
            editable={false}
          />

          <CdTextInputOneLine
            label={t("settings.support.app-version")}
            value={Constants.expoConfig?.version || t("settings.support.version-unknown")}
            editable={false}
          />
        </View>

        {/* Development Tools (if in dev mode) */}
        {__DEV__ && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("settings.development.title")}</Text>

            <CdTextInputOneLine
              label={t("settings.development.test-error")}
              value={t("settings.development.test-sentry")}
              isButton={true}
              onPress={() => router.push("/sentry-test")}
              buttonIcon="bug"
            />
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  section: {
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  bottomPadding: {
    height: 40,
  },
});
