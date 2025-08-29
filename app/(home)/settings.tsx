import { useI18n } from "@/shared/hooks/useI18n";
import { StyleSheet, Text, View } from "react-native";

export default function SettingsPage() {
  const { t } = useI18n();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("settings")}</Text>
      <Text style={styles.subtitle}>{t("settings-description")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: "center" },
});
