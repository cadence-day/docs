import useTranslation from "@/shared/hooks/useI18n";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import HIT_SLOP_10 from "../../shared/constants/hitSlop";

export default function NotFoundPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleGoHome = () => {
    router.replace("/(home)");
  };

  return (
    <LinearGradient
      colors={["#2B2B2B", "#151414"]}
      locations={[0, 0.6]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{t("page-not-found")}</Text>
        <Text style={styles.message}>
          {t("sorry-the-page-you-are-looking")}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleGoHome}
          hitSlop={HIT_SLOP_10}
        >
          <Text style={styles.buttonText}>{t("go-back")}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "400",
    color: "white",
    textAlign: "center",
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#6646EC",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    minWidth: 180,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
