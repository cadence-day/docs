import { useI18n } from "@/shared/hooks/useI18n";
import { useUser } from "@clerk/clerk-expo";
import { StyleSheet, Text, View } from "react-native";

export default function ProfilePage() {
  const { t } = useI18n();
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("profile")}</Text>
      <Text style={styles.subtitle}>
        {user?.primaryEmailAddress?.emailAddress}
      </Text>
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
    color: "#666",
    textAlign: "center",
  },
});
