import {
  exportEncryptionKey,
  hasEncryptionKey,
  importEncryptionKey,
} from "@/shared/api/encryption/core";
import {
  CdButton,
  CdDialog,
  CdText,
  CdTextInput,
} from "@/shared/components/CadenceUI";
import { COLORS } from "@/shared/constants/COLORS";
import useDialogStore from "@/shared/stores/useDialogStore";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import React, { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { CdDialogHeaderProps } from "../../../shared/components/CadenceUI/CdDialogHeader";
import { styles } from "../styles";

type Props = {
  _dialogId?: string; // injected by DialogHost
  visible?: boolean;
  height?: number;
  maxHeight?: number;
  enableDragging?: boolean;
  headerProps?: CdDialogHeaderProps;
};

const EncryptionLinkDialog: React.FC<Props> = ({
  _dialogId,
  visible = true,
  height = 80,
  maxHeight = 100,
  enableDragging = true,
  headerProps,
}) => {
  const closeSelf = () => {
    if (_dialogId) useDialogStore.getState().closeDialog(_dialogId);
  };

  const [pasteValue, setPasteValue] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasKeyOnThisDevice, setHasKeyOnThisDevice] = useState<boolean>(false);
  const [exportedKey, setExportedKey] = useState<string | null>(null);
  const [exportFingerprint, setExportFingerprint] = useState<string>("");
  const [exportSource, setExportSource] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const hasKey = await hasEncryptionKey();
        setHasKeyOnThisDevice(hasKey);
        if (hasKey) {
          const { key, fingerprint, source } = await exportEncryptionKey();
          setExportedKey(key);
          setExportFingerprint(fingerprint);
          setExportSource(source);
        } else {
          setExportedKey(null);
          setExportFingerprint("");
          setExportSource("");
        }
      } catch (err) {
        GlobalErrorHandler.logError(
          err as Error,
          "ENCRYPTION_LINK_DIALOG_INIT",
          {}
        );
      }
    })();
  }, []);

  const validateKey = (val: string): string | null => {
    const normalized = (val || "").trim().toLowerCase();
    if (normalized.length === 0) return "Key required";
    if (!/^[0-9a-f]+$/.test(normalized)) return "Only 0-9 and a-f allowed";
    if (normalized.length !== 64) return "Key must be 64 chars";
    return null;
  };

  const onLinkPress = async () => {
    try {
      setSubmitting(true);
      const error = validateKey(pasteValue);
      setPasteError(error);
      if (error) return;
      const { fingerprint } = await importEncryptionKey(pasteValue);
      setSuccessMessage(
        `Key imported (fp=${fingerprint}). You can now access encrypted data.`
      );
      // Close after a short delay for user feedback
      setTimeout(() => closeSelf(), 900);
    } catch (err) {
      GlobalErrorHandler.logError(err as Error, "ENCRYPTION_LINK_IMPORT", {});
      setPasteError("Failed to save key. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const Title = useMemo(
    () => headerProps?.title ?? "Link This Device",
    [headerProps]
  );

  return (
    <CdDialog
      id={_dialogId}
      visible={!!visible}
      onClose={closeSelf}
      height={height}
      maxHeight={maxHeight}
      enableDragging={enableDragging}
      headerProps={{ title: Title }}
    >
      <View style={styles.container}>
        <View style={styles.banner}>
          <CdText variant="body" size="medium" style={{ color: COLORS.white }}>
            Encrypted data detected. Import your existing key to read it on this
            device.
          </CdText>
        </View>

        <View style={styles.section}>
          <CdText variant="body" size="medium" style={styles.sectionTitle}>
            Paste Key (Target Device)
          </CdText>
          <CdText variant="body" size="small" style={styles.helpText}>
            Paste your 64‑character key below. Treat it like a password.
          </CdText>
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
          <CdButton
            title={submitting ? "Linking…" : "Link Device"}
            onPress={onLinkPress}
            variant="primary"
            disabled={submitting}
            fullWidth
          />
          {successMessage ? (
            <Text style={styles.success}>{successMessage}</Text>
          ) : null}
        </View>

        <View style={styles.separator} />

        <View style={styles.section}>
          <CdText variant="body" size="medium" style={styles.sectionTitle}>
            Show My Key (Source Device)
          </CdText>
          {hasKeyOnThisDevice && exportedKey ? (
            <>
              <CdText variant="body" size="small" style={styles.helpText}>
                Use this key on your new device. Fingerprint:{" "}
                {exportFingerprint}
                {exportSource ? ` • source: ${exportSource}` : ""}
              </CdText>
              <View style={styles.keyBox}>
                <Text selectable style={styles.keyText}>
                  {exportedKey}
                </Text>
              </View>
              <CdText variant="body" size="small" style={styles.warning}>
                Warning: Anyone with this key can read your encrypted data. Do
                not share it.
              </CdText>
            </>
          ) : (
            <CdText variant="body" size="small" style={styles.helpText}>
              No key stored on this device yet.
            </CdText>
          )}
        </View>
      </View>
    </CdDialog>
  );
};

export default EncryptionLinkDialog;
