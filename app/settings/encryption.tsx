import { Ionicons } from "@expo/vector-icons";
import { Camera, CameraView } from "expo-camera";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

import { profileStyles } from "@/features/profile/styles";
import {
  exportEncryptionKey,
  hasEncryptionKey,
  importEncryptionKey,
} from "@/shared/api/encryption/core";
import { CdTextInputOneLine } from "@/shared/components/CadenceUI/CdTextInputOneLine";
import Toast from "@/shared/components/Toast";
import { COLORS } from "@/shared/constants/COLORS";
import { useToast } from "@/shared/hooks";
import useTranslation from "@/shared/hooks/useI18n";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

export default function EncryptionSettings() {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast, showError, showSuccess, hideToast } = useToast();

  const [hasKeyOnDevice, setHasKeyOnDevice] = useState<boolean>(false);
  const [exportedKey, setExportedKey] = useState<string | null>(null);
  const [exportFingerprint, setExportFingerprint] = useState<string>("");
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [pasteValue, setPasteValue] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [scanned, setScanned] = useState(false);

  const requestCameraPermission = React.useCallback(async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
  }, []);

  const checkEncryptionStatus = React.useCallback(async () => {
    try {
      const hasKey = await hasEncryptionKey();
      setHasKeyOnDevice(hasKey);

      if (hasKey) {
        const { key, fingerprint } = await exportEncryptionKey();
        setExportedKey(key);
        setExportFingerprint(fingerprint);
      } else {
        setExportedKey(null);
        setExportFingerprint("");
      }
    } catch (error) {
      GlobalErrorHandler.logError(
        error as Error,
        "ENCRYPTION_SETTINGS_INIT",
        {}
      );
      showError(t("failed-to-check-encryption-sta"));
    }
  }, [showError, t]);

  useEffect(() => {
    checkEncryptionStatus();
    requestCameraPermission();
  }, [checkEncryptionStatus, requestCameraPermission]);

  const handleScanQRCode = () => {
    if (hasPermission === null) {
      showError(t("requesting-camera-permission"));
      return;
    }
    if (hasPermission === false) {
      Alert.alert(
        t("camera-permission-required"),
        t("please-enable-camera-access-in"),
        [{ text: "OK" }]
      );
      return;
    }
    setShowScanner(true);
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);
    setShowScanner(false);

    try {
      // Validate the scanned data is a valid encryption key
      if (!/^[0-9a-f]{64}$/i.test(data)) {
        showError(t("invalid-qr-code-please-scan-a"));
        setScanned(false);
        return;
      }

      setIsLinking(true);

      showSuccess(t("key-imported-successfully-fing"));
      await checkEncryptionStatus();
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "ENCRYPTION_QR_IMPORT", {});
      showError(t("failed-to-import-key-from-qr-c"));
    } finally {
      setIsLinking(false);
      setScanned(false);
    }
  };

  const handlePasteKey = async () => {
    if (!pasteValue.trim()) {
      showError(t("please-enter-an-encryption-key"));
      return;
    }

    const normalized = pasteValue.trim().toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(normalized)) {
      showError(t("invalid-key-format-key-must-be"));
      return;
    }

    try {
      setIsLinking(true);
      const { fingerprint } = await importEncryptionKey(normalized);

      showSuccess(
        t("key-imported-successfully-fing").replace("{0}", fingerprint)
      );
      setPasteValue("");
      await checkEncryptionStatus();
    } catch (error) {
      GlobalErrorHandler.logError(
        error as Error,
        "ENCRYPTION_PASTE_IMPORT",
        {}
      );
      showError(t("failed-to-import-key-please-tr"));
    } finally {
      setIsLinking(false);
    }
  };

  const screenWidth = Dimensions.get("window").width;
  const qrSize = Math.min(screenWidth - 80, 200);

  if (showScanner) {
    return (
      <>
        <Stack.Screen
          options={{
            title: t("scan-qr-code"),
            headerShown: true,
            headerStyle: { backgroundColor: COLORS.light.background },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => setShowScanner(false)}
                style={styles.backButton}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={COLORS.primary}
                />
                <Text style={styles.backText}>{t("back")}</Text>
              </TouchableOpacity>
            ),
          }}
        />

        <View style={styles.scannerContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />
          <View style={styles.scannerOverlay}>
            <Text style={styles.scannerText}>
              {t("point-your-camera-at-the-qr-co")}
            </Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: t("encryption"),
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.light.background },
          headerShadowVisible: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/(home)/profile")}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
              <Text style={styles.backText}>{t("back")}</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.headerBorder} />

      <View style={styles.container}>
        <ScrollView style={styles.scrollableContent}>
          {/* Device Status Section */}
          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>{t("device-status")}</Text>

            <View style={styles.statusContainer}>
              <Ionicons
                name={hasKeyOnDevice ? "shield-checkmark" : "shield-outline"}
                size={20}
                color={hasKeyOnDevice ? COLORS.primary : COLORS.textIcons}
                style={styles.statusIcon}
              />
              <Text style={styles.statusText}>
                {hasKeyOnDevice
                  ? t("encryption-key-present-exportf").replace(
                      "{0}",
                      exportFingerprint
                    )
                  : t("no-encryption-key-on-this-devi")}
              </Text>
            </View>
          </View>

          {/* Current Device QR Code and Key */}
          {hasKeyOnDevice && exportedKey && (
            <View style={profileStyles.settingsSection}>
              <Text style={profileStyles.sectionTitle}>
                {t("share-encryption-key")}
              </Text>

              <View style={styles.qrContainer}>
                <QRCode
                  value={exportedKey}
                  size={qrSize}
                  backgroundColor="white"
                  color="black"
                />
              </View>

              <Text style={styles.qrInstructions}>
                {t("scan-this-qr-code-with-your-ne")}
              </Text>

              <CdTextInputOneLine
                label={t("encryption-key")}
                value={exportedKey}
                editable={false}
                allowCopy={true}
              />
            </View>
          )}

          {/* Import Key Section */}
          {!hasKeyOnDevice && (
            <View style={profileStyles.settingsSection}>
              <Text style={profileStyles.sectionTitle}>
                {t("import-encryption-key")}
              </Text>

              <View style={styles.warningContainer}>
                <Ionicons
                  name="warning-outline"
                  size={20}
                  color="#FF6B35"
                  style={styles.warningIcon}
                />
                <Text style={styles.warningText}>
                  {t("this-device-doesnt-have-an-enc")}
                </Text>
              </View>

              <CdTextInputOneLine
                label={t("scan-qr-code")}
                value={t("use-camera-to-scan-qr-code")}
                showValueText={true}
                isButton={true}
                onPress={handleScanQRCode}
                showChevron={true}
              />

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  {t("or-paste-encryption-key")}
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={pasteValue}
                  onChangeText={setPasteValue}
                  placeholder={t("enter-64-character-encryption")}
                  placeholderTextColor={COLORS.textIcons}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={true}
                  multiline={false}
                />
                <TouchableOpacity
                  style={[
                    styles.importButton,
                    (!pasteValue.trim() || isLinking) &&
                      styles.importButtonDisabled,
                  ]}
                  onPress={handlePasteKey}
                  disabled={isLinking || !pasteValue.trim()}
                >
                  <Text
                    style={[
                      styles.importButtonText,
                      (!pasteValue.trim() || isLinking) &&
                        styles.importButtonTextDisabled,
                    ]}
                  >
                    {isLinking ? t("importing") : t("import-key")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Fixed Info Section */}
        <View style={styles.fixedInfoSection}>
          <Text style={profileStyles.sectionTitle}>
            {t("about-encryption")}
          </Text>

          <View style={styles.infoContainer}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={COLORS.primary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              {t("your-encryption-key-protects-s")}
            </Text>
          </View>
        </View>
      </View>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onHide={hideToast}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  scrollableContent: {
    flex: 1,
    paddingTop: 16,
  },
  fixedInfoSection: {
    backgroundColor: COLORS.light.background,
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.white,
  },
  headerBorder: {
    height: 1,
    backgroundColor: COLORS.white,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 16,
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginHorizontal: 24,
  },
  statusIcon: {
    marginRight: 12,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.bodyText,
  },
  inputContainer: {
    marginHorizontal: 24,
    marginVertical: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.bodyText,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.separatorline.light,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.bodyText,
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
  importButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  importButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  importButtonTextDisabled: {
    opacity: 0.5,
  },
  importButtonDisabled: {
    opacity: 0.5,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF3E6",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 24,
    marginVertical: 8,
  },
  warningIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: "#B85C00",
    lineHeight: 18,
  },
  qrContainer: {
    alignItems: "center",
    paddingVertical: 20,
    marginHorizontal: 24,
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  qrInstructions: {
    fontSize: 12,
    color: COLORS.bodyText,
    textAlign: "center",
    marginHorizontal: 24,
    marginVertical: 8,
  },
  scannerContainer: {
    flex: 1,
  },
  scannerOverlay: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 16,
    borderRadius: 8,
  },
  scannerText: {
    color: COLORS.white,
    textAlign: "center",
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  infoIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.bodyText,
    lineHeight: 18,
  },
});
