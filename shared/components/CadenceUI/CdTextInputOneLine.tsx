import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useState } from "react";
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
  buttonIcon?: keyof typeof Ionicons.glyphMap;
  showValueText?: boolean; // New prop to control text visibility
  allowCopy?: boolean; // New prop to enable copy functionality
  showChevron?: boolean; // New prop to control chevron icon visibility
}

export const CdTextInputOneLine: React.FC<CdTextInputOneLineProps> = ({
  label,
  value = "", // Default to empty string
  onChangeText,
  onSave,
  isButton = false,
  onPress,
  buttonIcon,
  editable = true,
  showValueText = true, // Default to showing text
  allowCopy = false, // Default to no copy functionality
  showChevron = false, // Default to no chevron icon
  ...textInputProps
}) => {
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
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
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
});
