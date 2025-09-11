import { Ionicons } from "@expo/vector-icons";
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

interface CdTextInputOneLineProps extends Omit<TextInputProps, "onChangeText"> {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  onSubmit?: (text: string) => void;
  isButton?: boolean;
  onPress?: () => void;
  buttonIcon?: keyof typeof Ionicons.glyphMap;
}

export const CdTextInputOneLine: React.FC<CdTextInputOneLineProps> = ({
  label,
  value,
  onChangeText,
  onSubmit,
  isButton = false,
  onPress,
  buttonIcon,
  editable = true,
  ...textInputProps
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handlePress = () => {
    if (isButton && onPress) {
      onPress();
    } else if (editable) {
      setIsEditing(true);
      setTempValue(value);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(tempValue);
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
      disabled={isEditing}
    >
      <View style={styles.content}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>

        <View style={styles.rightSection}>
          {isEditing ? (
            <View style={styles.editingContainer}>
              <TextInput
                style={styles.input}
                value={tempValue}
                onChangeText={setTempValue}
                autoFocus
                onBlur={handleCancel}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                {...textInputProps}
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.displayContainer}>
              <Text
                style={[styles.value, isButton && styles.buttonValue]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {value}
              </Text>
              {(editable || isButton) && (
                <Ionicons
                  name={buttonIcon || (isButton ? "chevron-forward" : "pencil")}
                  size={16}
                  color={COLORS.textIcons}
                  style={styles.icon}
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
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text.header,
    flex: 1,
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
    fontSize: 16,
    color: COLORS.text.header,
    marginRight: 8,
  },
  buttonValue: {
    color: COLORS.primary,
    fontWeight: "500",
  },
  icon: {
    opacity: 0.6,
  },
  editingContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.header,
    textAlign: "right",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingVertical: 4,
    marginRight: 8,
  },
  submitButton: {
    padding: 4,
  },
});
