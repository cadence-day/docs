import { useI18n } from "@/shared/hooks/useI18n";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfilePage() {
  const { t } = useI18n();
  const { user } = useUser();
  const router = useRouter();

  const navigateToSentryTest = () => {
    router.push("/sentry-test");
  };

  const navigateToSettings = () => {
    router.push("/settings");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("profile")}</Text>
      <Text style={styles.subtitle}>
        {user?.primaryEmailAddress?.emailAddress}
      </Text>

      {/* App Navigation */}
      <TouchableOpacity
        style={styles.navigationButton}
        onPress={navigateToSettings}
      >
        <Text style={styles.navigationButtonText}>{t("settings")}</Text>
      </TouchableOpacity>

      {/* Development/Debug Links */}
      <View style={styles.debugSection}>
        <Text style={styles.debugTitle}>{t("development-tools")}</Text>
        <TouchableOpacity
          style={styles.debugButton}
          onPress={navigateToSentryTest}
        >
          <Text style={styles.debugButtonText}>
            {t("test-sentry-integration")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.debugButton}
          onPress={() => router.push("/(utils)/not-found")}
        >
          <Text style={styles.debugButtonText}>🚫 Test Not Found Page</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  navigationButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
    width: "100%",
  },
  navigationButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  debugSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    width: "100%",
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 10,
    textAlign: "center",
  },
  debugButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
  },
  debugButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
