import { COLORS } from "@/shared/constants/COLORS";
import useTranslation from "@/shared/hooks/useI18n";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export const EncryptionKeyStatus = React.memo(function EncryptionKeyStatus() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"checking" | "ok" | "missing">(
    "checking"
  );

  useEffect(() => {
    console.log("🔑 EncryptionKeyStatus: Checking encryption key...");
    AsyncStorage.getItem("@cadence_encryption_key")
      .then((key) => {
        console.log(
          "🔑 EncryptionKeyStatus: Key check result:",
          key ? "found" : "missing"
        );
        setStatus(key ? "ok" : "missing");
      })
      .catch((error) => {
        console.log("🔑 EncryptionKeyStatus: Error checking key:", error);
        setStatus("missing");
      });
  }, []);

  return (
    <View style={styles.container}>
      {status === "checking" && (
        <View style={styles.statusRow}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.checkingText}>
            {t("migration.encryption.checking")}
          </Text>
        </View>
      )}
      {status === "ok" && (
        <View style={styles.statusRow}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          <Text style={styles.okText}>
            {t("migration.encryption.key-found")}
          </Text>
        </View>
      )}
      {status === "missing" && (
        <View style={styles.statusRow}>
          <Ionicons name="warning" size={20} color={COLORS.warning} />
          <Text style={styles.warningText}>
            {t("migration.encryption.unable-to-decrypt")}
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkingText: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  okText: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: "500",
  },
  warningText: {
    color: COLORS.warning,
    fontSize: 14,
    fontWeight: "500",
  },
});
