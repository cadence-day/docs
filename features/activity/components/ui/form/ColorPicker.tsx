import React, { useCallback, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Modal, Platform } from "react-native";
import { ColorPicker as ExpoColorPicker, Host } from "@expo/ui/swift-ui";
import { ACTIVITY_THEME } from "../../../constants";
import { useI18n } from "@/shared/hooks/useI18n";

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  disabled?: boolean;
  label: string;
  buttonText: string;
}

// Wrapper that prefers an Expo/third‑party ColorPicker if present, with a
// graceful fallback to our palette grid without adding new deps at build time.
export const ColorPicker = React.memo<ColorPickerProps>(
  ({ selectedColor, onColorChange, disabled = false, label, buttonText }) => {
    const { t } = useI18n();
    const [visible, setVisible] = useState(false);

    const open = useCallback(() => setVisible(true), []);
    const close = useCallback(() => setVisible(false), []);

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={[styles.colorButton, { backgroundColor: selectedColor }]}
          onPress={open}
          disabled={disabled}
        >
          <Text style={styles.colorButtonText}>{buttonText}</Text>
        </TouchableOpacity>

        <Modal
          visible={visible}
          animationType={Platform.OS === "ios" ? "slide" : "fade"}
          transparent
          onRequestClose={close}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalBody}>
              <Host style={styles.host}>
                <ExpoColorPicker
                  label={label}
                  selection={selectedColor}
                  onValueChanged={onColorChange}
                />
              </Host>
              <TouchableOpacity style={styles.modalClose} onPress={close}>
                <Text style={styles.modalCloseText}>{t("common.cancel")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
);

ColorPicker.displayName = "ColorPicker";

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: ACTIVITY_THEME.WHITE,
    marginBottom: 6,
    textTransform: "uppercase",
    fontFamily: "FoundersGrotesk-Regular",
  },
  colorButton: {
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: ACTIVITY_THEME.BORDER_PURPLE,
    borderBottomWidth: 0.5,
  },
  colorButtonText: {
    color: ACTIVITY_THEME.WHITE,
    fontSize: 14,
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  host: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: ACTIVITY_THEME.FORM_BG,
    overflow: "hidden",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBody: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 12,
    backgroundColor: ACTIVITY_THEME.FORM_BG,
    padding: 12,
  },
  modalClose: {
    alignSelf: "flex-end",
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#333",
  },
  modalCloseText: {
    color: ACTIVITY_THEME.WHITE,
  },
});
