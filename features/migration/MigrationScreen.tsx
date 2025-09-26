import { CdTextInput } from "@/shared/components";
import { CdButton } from "@/shared/components/CadenceUI/CdButton";
import { COLORS } from "@/shared/constants/COLORS";
import useTranslation from "@/shared/hooks/useI18n";
import useActivitiesStore from "@/shared/stores/resources/useActivitiesStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlobalErrorHandler } from "../../shared/utils";
import {
  fetchV1ActivitiesWithDetails,
  fetchV2ActivitiesWithDetails,
  type V1Activity,
  type V2Activity,
} from "./api/migration";
import { EncryptionKeyStatus } from "./components/EncryptionKeyStatus";
import { MigrationCarousel } from "./components/MigrationCarousel";
import { useMigration } from "./hooks/useMigration";

export default function MigrationScreen() {
  const { t } = useTranslation();
  const activitiesStore = useActivitiesStore();
  const {
    sourceActivities,
    targetActivities,
    initializeMigration,
    migrateActivities,
    progress,
    errors,
    logs,
    isLoading,
  } = useMigration();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [v1Activities, setV1Activities] = useState<V1Activity[]>([]);
  const [v2Activities, setV2Activities] = useState<V2Activity[]>([]);
  const [showCarousel, setShowCarousel] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  const loadActivitiesWithDetails = useCallback(async () => {
    try {
      setIsLoadingActivities(true);

      const [v1Data, v2Data] = await Promise.all([
        fetchV1ActivitiesWithDetails(),
        fetchV2ActivitiesWithDetails(activitiesStore),
      ]);

      setV1Activities(v1Data);
      setV2Activities(v2Data);
    } catch (error) {
      GlobalErrorHandler.logError(error, "MIGRATION_SERVICE");
    } finally {
      setIsLoadingActivities(false);
    }
  }, []); // Remove activitiesStore from dependencies to prevent infinite loop

  useEffect(() => {
    if (isConnected) {
      loadActivitiesWithDetails();
    }
  }, [isConnected]); // Only depend on isConnected, not loadActivitiesWithDetails

  const handleConnect = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t("common.error"), t("migration.auth.fields-required"));
      return;
    }

    try {
      await initializeMigration(email, password);
      setIsConnected(true);
    } catch {
      Alert.alert(t("common.error"), t("migration.auth.failed"));
    }
  };

  const handleStartMigration = () => {
    if (v1Activities.length === 0) {
      Alert.alert(t("common.error"), "No activities found to migrate");
      return;
    }
    setShowCarousel(true);
  };

  const handleMigrationComplete = async (
    mappings: import("./components/MigrationCarousel").ActivityMapping[]
  ) => {
    try {
      // Convert carousel mappings to the format expected by migrate functions
      const convertedMappings = mappings.map((mapping) => ({
        sourceId: mapping.v1ActivityId,
        targetId: mapping.v2ActivityId || undefined,
        createNew: mapping.action === "create_new",
        newActivityData: mapping.updatedActivity
          ? {
              name: mapping.updatedActivity.name,
              color: mapping.updatedActivity.color,
            }
          : undefined,
      }));

      // Perform the migration with converted mappings
      await migrateActivities(convertedMappings);
      setShowCarousel(false);
    } catch (error) {
      GlobalErrorHandler.logError(error, "MIGRATION_SERVICE");
    }
  };

  const handleCancelMigration = () => {
    setShowCarousel(false);
  };

  // Early return for carousel view
  if (showCarousel) {
    return (
      <SafeAreaView style={styles.container}>
        <MigrationCarousel
          v1Activities={v1Activities}
          v2Activities={v2Activities}
          onMigrationComplete={handleMigrationComplete}
          onCancel={handleCancelMigration}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {!isConnected ? (
        <View style={styles.authSection}>
          <Text style={styles.subtitle}>{t("migration.auth.subtitle")}</Text>

          <CdTextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t("migration.auth.email-placeholder")}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CdTextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t("migration.auth.password-placeholder")}
            secureTextEntry
          />

          <CdButton
            title={t("migration.auth.connect")}
            onPress={handleConnect}
            style={styles.connectButton}
            disabled={isLoading}
          />
        </View>
      ) : (
        <>
          {/* Main Migration Section */}
          <View style={styles.migrationSection}>
            <Text style={styles.sectionTitle}>Activities</Text>

            <View style={styles.overviewCard}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>
                  {!isLoadingActivities
                    ? `We found ${v1Activities.length} old activities`
                    : "Loading..."}
                </Text>
              </View>

              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>
                  {!isLoadingActivities
                    ? `Currently, you have ${v2Activities.length} new activities`
                    : "Loading..."}
                </Text>
              </View>
            </View>

            <CdButton
              title="Start"
              onPress={handleStartMigration}
              style={styles.startMigrationButton}
              disabled={
                isLoading || isLoadingActivities || v1Activities.length === 0
              }
            />
          </View>
          {/* Progress Section */}
          {(progress.activities > 0 ||
            progress.timeslices > 0 ||
            progress.notes > 0 ||
            progress.states > 0) && (
            <View style={styles.progressSection}>
              <Text style={styles.sectionTitle}>
                {t("migration.progress.title")}
              </Text>

              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>
                  {t("migration.progress.activities")}
                </Text>
                <Text style={styles.progressValue}>{progress.activities}</Text>
              </View>

              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>
                  {t("migration.progress.timeslices")}
                </Text>
                <Text style={styles.progressValue}>{progress.timeslices}</Text>
              </View>

              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>
                  {t("migration.progress.notes")}
                </Text>
                <Text style={styles.progressValue}>{progress.notes}</Text>
              </View>

              {/* Show encryption status when notes are being processed or have been processed */}
              {(progress.notes > 0 ||
                (isLoading &&
                  logs.some(
                    (log) => log.includes("Step 3/4") || log.includes("notes")
                  ))) && (
                <View style={styles.encryptionStatusContainer}>
                  <EncryptionKeyStatus />
                </View>
              )}

              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>
                  {t("migration.progress.states")}
                </Text>
                <Text style={styles.progressValue}>{progress.states}</Text>
              </View>
            </View>
          )}
          {/* Errors and Logs */}
          {errors.length > 0 && (
            <View style={styles.errorSection}>
              <Text style={styles.sectionTitle}>
                {t("migration.errors.title")}
              </Text>
              {errors.map((error, index) => (
                <View key={index} style={styles.errorItem}>
                  <Ionicons name="warning" size={16} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ))}
            </View>
          )}
          {/* {logs.length > 0 && (
            <View style={styles.logsSection}>
              <Text style={styles.sectionTitle}>
                {t("migration.logs.title")}
              </Text>
              <ScrollView style={styles.logsContainer} nestedScrollEnabled>
                {logs.map((log, index) => (
                  <Text key={index} style={styles.logItem}>
                    {log}
                  </Text>
                ))}
              </ScrollView>
            </View>
          )} */}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    padding: 24,
  },
  authSection: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.bodyText,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  connectButton: {
    marginTop: 24,
  },
  migrationSection: {
    padding: 20,
    marginBottom: 20,
  },
  overviewCard: {
    marginBottom: 16,
  },
  overviewItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  overviewLabel: {
    fontSize: 14,
    color: COLORS.bodyText,
    fontWeight: "500",
  },
  startMigrationButton: {
    backgroundColor: COLORS.primary,
    marginTop: 50,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    alignItems: "center",
    color: "#ffffff",
    marginBottom: 8,
  },
  progressSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
  },
  progressItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
  },
  progressLabel: {
    fontSize: 14,
    color: COLORS.bodyText,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text?.header ?? COLORS.light.text,
  },
  errorSection: {
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
  },
  errorItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    flex: 1,
  },
  encryptionStatusContainer: {
    marginVertical: 8,
  },
});
