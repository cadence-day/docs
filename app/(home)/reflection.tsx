import { useI18n } from "@/shared/hooks/useI18n";
import { StyleSheet, Text, View } from "react-native";

export default function ReflectionPage() {
  const { t } = useI18n();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("reflection")}</Text>
      <Text style={styles.subtitle}>
        {t("reflection-empty", "No reflections yet. Tap + to add one.")}
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
    textAlign: "center",
  },
});
