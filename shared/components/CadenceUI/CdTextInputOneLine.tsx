import useTranslation from "@/shared/hooks/useI18n";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants/COLORS";
import { GlobalErrorHandler } from "../../utils/errorHandler";

interface CdTextInputOneLineProps extends Omit<TextInputProps, "onChangeText"> {
  label: string;
  value?: string; // Made optional to allow no text
  onChangeText?: (text: string) => void;
  onSave?: (text: string) => void;
  isButton?: boolean;
  onPress?: () => void;
  showValueText?: boolean; // New prop to control text visibility
  allowCopy?: boolean; // New prop to enable copy functionality
  showChevron?: boolean; // New prop to control chevron icon visibility
  // Optional indicator to explicitly control helper text shown below the border.
  // If not provided, fallback behavior: show copy indicator when `allowCopy` is true,
  // otherwise show edit indicator when `editable` is true.
  indicatorMode?: "copy" | "edit" | "none";
}

export const CdTextInputOneLine: React.FC<CdTextInputOneLineProps> = ({
  label,
  value = "", // Default to empty string
  onChangeText,
  onSave,
  isButton = false,
  onPress,
  editable = true,
  showValueText = true, // Default to showing text
  allowCopy = false, // Default to no copy functionality
  showChevron = false, // Default to no chevron icon
  indicatorMode,
  ...textInputProps
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [showCopiedFeedback, setShowCopiedFeedback] = useState(false);

  const handlePress = () => {
    if (isButton && onPress) {
      onPress();
    } else if (editable) {
      setIsEditing(true);
      setTempValue(value);
    }
  };

  const handleLongPress = async () => {
    if (allowCopy && value && !isEditing) {
      try {
        await Clipboard.setStringAsync(value);
        setShowCopiedFeedback(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Hide feedback after 1.5 seconds
        setTimeout(() => {
          setShowCopiedFeedback(false);
        }, 1500);
      } catch (error) {
        GlobalErrorHandler.logWarning(
          "Failed to copy to clipboard",
          "CLIPBOARD_COPY_ERROR",
          { error }
        );
      }
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(tempValue);
    } else if (onChangeText) {
      onChangeText(tempValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        onLongPress={handleLongPress}
        disabled={isEditing}
      >
        <View style={styles.content}>
          <Text style={styles.label}>{label}</Text>

          <View style={styles.rightSection}>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={tempValue}
                onChangeText={setTempValue}
                autoFocus
                onBlur={handleCancel}
                returnKeyType="done"
                onSubmitEditing={handleSave}
                {...textInputProps}
              />
            ) : (
              <View style={styles.displayContainer}>
                {showValueText && value && (
                  <Text
                    style={[
                      styles.value,
                      isButton && styles.buttonValue,
                      showCopiedFeedback && styles.copiedValue,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {showCopiedFeedback ? "Copied" : value}
                  </Text>
                )}
                {showChevron && (
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={COLORS.textIcons}
                    style={styles.buttonIcon}
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Indicator helper text below the border line */}
      {useMemo(() => {
        let mode: "copy" | "edit" | "none" = "none";
        if (indicatorMode) {
          mode = indicatorMode;
        } else if (allowCopy) {
          mode = "copy";
        } else if (editable) {
          mode = "edit";
        }

        if (mode === "none") return null;
        if (isEditing) return null;

        if (isButton && !showValueText) return null;

        const text =
          mode === "copy" ? t("long-press-to-copy") : t("press-to-edit");

        return (
          <Text style={styles.indicator} accessibilityRole="text">
            {text}
          </Text>
        );
      }, [
        indicatorMode,
        allowCopy,
        editable,
        isEditing,
        isButton,
        showValueText,
        t,
      ])}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    marginBottom: 0,
  },
  outerContainer: {
    marginBottom: 8,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: COLORS.text.header,
    flex: 1,
    minWidth: 60,
  },
  rightSection: {
    flex: 2,
    alignItems: "flex-end",
  },
  displayContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  value: {
    fontSize: 14,
    color: COLORS.text.header,
  },
  buttonValue: {
    color: COLORS.primary,
    fontWeight: "500",
  },
  copiedValue: {
    color: COLORS.primary,
    fontWeight: "600",
    opacity: 0.8,
  },
  buttonIcon: {
    opacity: 0.6,
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.header,
    textAlign: "right",
    paddingVertical: 4,
  },
  indicator: {
    fontSize: 10,
    color: COLORS.placeholderText,
    alignSelf: "flex-end",
    marginTop: 4,
    opacity: 0.9,
  },
});
