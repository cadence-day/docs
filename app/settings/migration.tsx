import { backgroundLinearColors, COLORS } from "@/shared/constants/COLORS";
import useTranslation from "@/shared/hooks/useI18n";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { HIT_SLOP_10 } from "../../shared/constants/hitSlop";

// Try dynamic import to avoid bundling issues
const MigrationScreen = React.lazy(() =>
  import("@/features/migration/MigrationScreen").catch(
    () => import("../../features/migration/MigrationScreen")
  )
);

export default function MigrationRoute() {
  const { t } = useTranslation();
  return (
    <LinearGradient
      colors={[
        backgroundLinearColors.secondary.start,
        backgroundLinearColors.secondary.end,
      ]}
      style={styles.backgroundGradient}
    >
      <Stack.Screen
        options={{
          title: t("migration.title"),
          headerShown: true,
          headerShadowVisible: false,
          headerTransparent: true,
          headerTitleStyle: { color: COLORS.primary, fontSize: 18 },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/profile")}
              style={styles.backButton}
              hitSlop={HIT_SLOP_10}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
              <Text style={styles.backText}>{t("settings.back")}</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.contentContainer}>
        <MigrationScreen />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  backgroundGradient: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 16,
    marginLeft: 4,
  },
});
