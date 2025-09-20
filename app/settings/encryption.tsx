import { useUser } from "@clerk/clerk-expo";
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
  const { user } = useUser();
  const { toast, showError, showSuccess, hideToast } = useToast();

  const [hasKeyOnDevice, setHasKeyOnDevice] = useState<boolean>(false);
  const [exportedKey, setExportedKey] = useState<string | null>(null);
  const [exportFingerprint, setExportFingerprint] = useState<string>("");
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [pasteValue, setPasteValue] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    checkEncryptionStatus();
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const checkEncryptionStatus = async () => {
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
      showError("Failed to check encryption status.");
    }
  };

  const handleScanQRCode = () => {
    if (hasPermission === null) {
      showError("Requesting camera permission...");
      return;
    }
    if (hasPermission === false) {
      Alert.alert(
        "Camera Permission Required",
        "Please enable camera access in your device settings to scan QR codes.",
        [{ text: "OK" }]
      );
      return;
    }
    setShowScanner(true);
  };

  const handleBarCodeScanned = async ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (scanned) return;

    setScanned(true);
    setShowScanner(false);

    try {
      // Validate the scanned data is a valid encryption key
      if (!/^[0-9a-f]{64}$/i.test(data)) {
        showError(
          "Invalid QR code. Please scan a valid encryption key QR code."
        );
        setScanned(false);
        return;
      }

      setIsLinking(true);
      const { fingerprint } = await importEncryptionKey(data);

      showSuccess(`Key imported successfully! Fingerprint: ${fingerprint}`);
      await checkEncryptionStatus();
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "ENCRYPTION_QR_IMPORT", {});
      showError("Failed to import key from QR code. Please try again.");
    } finally {
      setIsLinking(false);
      setScanned(false);
    }
  };

  const handlePasteKey = async () => {
    if (!pasteValue.trim()) {
      showError("Please enter an encryption key.");
      return;
    }

    const normalized = pasteValue.trim().toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(normalized)) {
      showError("Invalid key format. Key must be 64 hexadecimal characters.");
      return;
    }

    try {
      setIsLinking(true);
      const { fingerprint } = await importEncryptionKey(normalized);

      showSuccess(`Key imported successfully! Fingerprint: ${fingerprint}`);
      setPasteValue("");
      await checkEncryptionStatus();
    } catch (error) {
      GlobalErrorHandler.logError(
        error as Error,
        "ENCRYPTION_PASTE_IMPORT",
        {}
      );
      showError("Failed to import key. Please try again.");
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
            title: "Scan QR Code",
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
                <Text style={styles.backText}>Back</Text>
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
              Point your camera at the QR code containing the encryption key
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
          title: "Encryption",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.light.background },
          headerShadowVisible: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/(home)/profile")}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.headerBorder} />

      <View style={styles.container}>
        <ScrollView style={styles.scrollableContent}>
          {/* Device Status Section */}
          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>Device Status</Text>

            <View style={styles.statusContainer}>
              <Ionicons
                name={hasKeyOnDevice ? "shield-checkmark" : "shield-outline"}
                size={20}
                color={hasKeyOnDevice ? COLORS.primary : COLORS.textIcons}
                style={styles.statusIcon}
              />
              <Text style={styles.statusText}>
                {hasKeyOnDevice
                  ? `Encryption key present (${exportFingerprint})`
                  : "No encryption key on this device"}
              </Text>
            </View>
          </View>

          {/* Current Device QR Code and Key */}
          {hasKeyOnDevice && exportedKey && (
            <View style={profileStyles.settingsSection}>
              <Text style={profileStyles.sectionTitle}>
                Share Encryption Key
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
                Scan this QR code with your new device to import the encryption
                key.
              </Text>

              <CdTextInputOneLine
                label="Encryption Key"
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
                Import Encryption Key
              </Text>

              <View style={styles.warningContainer}>
                <Ionicons
                  name="warning-outline"
                  size={20}
                  color="#FF6B35"
                  style={styles.warningIcon}
                />
                <Text style={styles.warningText}>
                  This device doesn't have an encryption key. You need to import
                  a key from your previous device to access encrypted data.
                </Text>
              </View>

              <CdTextInputOneLine
                label="Scan QR Code"
                value="Use camera to scan QR code"
                showValueText={true}
                isButton={true}
                onPress={handleScanQRCode}
                showChevron={true}
              />

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Or paste encryption key:</Text>
                <TextInput
                  style={styles.textInput}
                  value={pasteValue}
                  onChangeText={setPasteValue}
                  placeholder="Enter 64-character encryption key"
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
                    {isLinking ? "Importing..." : "Import Key"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Fixed Info Section */}
        <View style={styles.fixedInfoSection}>
          <Text style={profileStyles.sectionTitle}>About Encryption</Text>

          <View style={styles.infoContainer}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={COLORS.primary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              Your encryption key protects sensitive data. Keep it secure and
              don't share it with others. You'll need this key to access your
              encrypted data on new devices.
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
