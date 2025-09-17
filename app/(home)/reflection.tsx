import { backgroundLinearColors } from "@/shared/constants/COLORS";
import { DIALOG_HEIGHT_PLACEHOLDER } from "@/shared/constants/VIEWPORT";
import { useI18n } from "@/shared/hooks/useI18n";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function ReflectionPage() {
  const { t } = useI18n();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          backgroundLinearColors.primary.end,
          backgroundLinearColors.primary.end,
        ]}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.headerContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.titleText}>{t("reflection")}</Text>
          </View>
        </SafeAreaView>

        <View style={styles.contentContainer}>
          <Text style={styles.subtitle}>
            {t("reflection-empty", "No reflections yet. Tap + to add one.")}
          </Text>
        </View>

        {/* Spacer to ensure there's room below the content */}
        <View style={{ height: DIALOG_HEIGHT_PLACEHOLDER }} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    margin: 12,
  },
  titleText: {
    fontSize: 24,
    color: "#222",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#444",
  },
});
