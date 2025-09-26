import { importEncryptionKey } from "@/shared/api/encryption/core";
import { CdButton, CdText, CdTextInput } from "@/shared/components/CadenceUI";
import { COLORS } from "@/shared/constants/COLORS";
import useDialogStore from "@/shared/stores/useDialogStore";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CdDialogHeaderProps } from "../../../shared/components/CadenceUI/CdDialogHeader";
import { styles } from "../styles";

export type EncryptionLinkDialogHandle = {
  confirm: () => void;
};

export type EncryptionLinkDialogProps = {
  _dialogId?: string; // injected by DialogHost
  headerProps?: CdDialogHeaderProps;
  onConfirm?: () => void;
};

export const EncryptionLinkDialog = forwardRef<
  EncryptionLinkDialogHandle,
  EncryptionLinkDialogProps
>(({ _dialogId, onConfirm }, ref) => {
  const dialogStore = useDialogStore();

  const closeSelf = () => {
    if (_dialogId) dialogStore.closeDialog(_dialogId);
  };

  const [pasteValue, setPasteValue] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isScanning, setIsScanning] = useState(true);

  // Input mode state: 'camera' or 'text'
  const [inputMode, setInputMode] = useState<"camera" | "text">("camera");

  const validateKey = (val: string): string | null => {
    const normalized = (val || "").trim().toLowerCase();
    if (normalized.length === 0) return "Key required";
    if (!/^[0-9a-f]+$/.test(normalized)) return "Only 0-9 and a-f allowed";
    if (normalized.length !== 64) return "Key must be 64 chars";
    return null;
  };

  const onLinkPress = async (keyValue?: string) => {
    try {
      setSubmitting(true);
      const keyToUse = keyValue || pasteValue;
      const error = validateKey(keyToUse);
      setPasteError(error);
      if (error) return;
      const { fingerprint } = await importEncryptionKey(keyToUse);
      setSuccessMessage(
        `Key imported (fp=${fingerprint}). You can now access encrypted data.`
      );

      // Call onConfirm to notify the context (e.g., parent can close dialog or navigate)
      onConfirm?.();

      // After confirming, refresh all stores to ensure app state is up to date
      const { refreshAllStoresFromCore } = await import(
        "@/shared/api/encryption/core"
      );
      await refreshAllStoresFromCore();

      setTimeout(() => closeSelf(), 900);
    } catch (err) {
      GlobalErrorHandler.logError(err as Error, "ENCRYPTION_LINK_IMPORT", {});
      setPasteError("Failed to save key. Try again.");
      setIsScanning(true); // Re-enable scanning on error
    } finally {
      setSubmitting(false);
    }
  };

  // Handler for header right action (Link Device)
  const handleHeaderRightAction = async () => {
    await onLinkPress();
  };

  useImperativeHandle(ref, () => ({
    confirm: handleHeaderRightAction, // Use the same handler for imperative calls
  }));

  // Success state for "key is set" screen
  if (successMessage) {
    return (
      <View style={[styles.container, localStyles.successContainer]}>
        <View style={localStyles.successCircle}>
          <Ionicons name="checkmark" size={48} color="#fff" />
        </View>
        <Text style={localStyles.successText}>Your key is set</Text>
        <Text style={localStyles.successSubText}>{successMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <CdText variant="body" size="medium" style={localStyles.bannerText}>
          Encrypted data detected. Import your existing key to read it on this
          device.
        </CdText>
      </View>

      <View style={styles.section}>
        <CdText variant="body" size="medium" style={styles.helpText}>
          Link My Device (New Device). Scan your QR code provided in
          Profile/Security/Link New Device or paste the key below.
        </CdText>

        {inputMode === "camera" ? (
          <>
            <View style={localStyles.inlineScannerWrapper}>
              {permission?.granted ? (
                <>
                  <CameraView
                    style={localStyles.inlineScanner}
                    facing="back"
                    barcodeScannerSettings={{
                      barcodeTypes: ["qr"],
                    }}
                    onBarcodeScanned={({ data }) => {
                      if (!isScanning) return;

                      try {
                        setIsScanning(false); // Prevent multiple scans
                        const match = (data || "").match(/([0-9a-f]{64})/i);
                        const key = match ? match[1] : (data?.trim() ?? "");
                        // Auto-submit the key without filling text input
                        onLinkPress(key);
                      } catch {
                        setIsScanning(true); // Re-enable scanning on error
                      }
                    }}
                  />
                </>
              ) : (
                <View style={localStyles.scannerMessage}>
                  <Text>Camera permission is required to scan QR codes.</Text>
                  <Pressable
                    onPress={async () => {
                      const result = await requestPermission();
                      if (!result.granted) {
                        setInputMode("text");
                      } else {
                        setIsScanning(true); // Re-enable scanning when permission is granted
                      }
                    }}
                    style={localStyles.closeButton}
                  >
                    <Text style={localStyles.closeButtonText}>
                      Request Permission
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setInputMode("text");
                      setIsScanning(true); // Reset scanning when switching modes
                    }}
                    style={localStyles.secondaryButton}
                  >
                    <Text style={localStyles.closeButtonText}>
                      Paste Key Instead
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
            <CdButton
              title="Paste Key Instead"
              onPress={() => {
                setInputMode("text");
                setIsScanning(true); // Reset scanning when switching modes
              }}
              variant="secondary"
            />
          </>
        ) : (
          <>
            <CdButton
              title="Scan QR Instead"
              onPress={() => {
                setInputMode("camera");
                setIsScanning(true); // Reset scanning when switching modes
              }}
              variant="secondary"
            />
            <CdTextInput
              label="Encryption Key"
              value={pasteValue}
              onChangeText={(t) => {
                setPasteValue(t);
                if (pasteError) setPasteError(null);
              }}
              isPassword
              letterSpacing={1}
              autoCapitalize="none"
              autoCorrect={false}
              error={pasteError}
            />
          </>
        )}
      </View>
    </View>
  );
});

const localStyles = StyleSheet.create({
  closeButtonText: { color: "#fff" },
  qrSquare: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginVertical: 8,
  },
  qrText: { color: "#fff", fontWeight: "600" },
  inlineScannerWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
    position: "relative",
  },
  inlineScanner: {
    width: 220,
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  inlineScannerClose: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 16,
    padding: 4,
    zIndex: 2,
  },
  scannerMessage: { flex: 1, alignItems: "center", justifyContent: "center" },
  closeButton: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
  },
  secondaryButton: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
  },
  scannerClose: { position: "absolute", top: 24, right: 16 },
  // Success state styles
  successContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1db954",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  successSubText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 24,
    marginTop: 4,
  },
  bannerText: { color: COLORS.white },
});

export default EncryptionLinkDialog;
