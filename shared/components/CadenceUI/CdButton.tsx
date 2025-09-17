import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface CdButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "text" | "destructive";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const CdButton: React.FC<CdButtonProps> = ({
  title,
  onPress,
  variant = "outline",
  size = "medium",
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const buttonStyle = [
    localStyles.button,
    localStyles[`${variant}Button`],
    localStyles[`${size}Button`],
    fullWidth && localStyles.fullWidth,
    disabled && localStyles.disabledButton,
    style,
  ];

  const buttonTextStyle = [
    localStyles.buttonText,
    localStyles[`${variant}ButtonText`],
    localStyles[`${size}ButtonText`],
    disabled && localStyles.disabledButtonText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={buttonTextStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const localStyles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },

  // Variant styles
  outlineButton: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 0,
  },
  secondaryButton: {
    backgroundColor: "#2B2B2B",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  textButton: {
    borderWidth: 0,
    padding: 0,
  },

  // Size styles
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 100,
  },
  mediumButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 140,
  },
  largeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 160,
  },

  // Width styles
  fullWidth: {
    width: "100%",
  },

  // Disabled styles
  disabledButton: {
    opacity: 0.5,
  },

  // Text styles
  buttonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },

  // Variant text styles
  outlineButtonText: {
    color: "#FFFFFF",
  },
  primaryButtonText: {
    color: "#2B2B2B",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
  },
  textButtonText: {
    color: "#FFFFFF",
    textDecorationLine: "underline",
  },

  // Size text styles
  smallButtonText: {
    fontSize: 14,
  },
  mediumButtonText: {
    fontSize: 16,
  },
  largeButtonText: {
    fontSize: 18,
  },

  // Disabled text styles
  disabledButtonText: {
    opacity: 0.7,
  },

  // Destructive styles
  destructiveButton: {
    backgroundColor: "#FF3B30",
    borderWidth: 0,
  },
  destructiveButtonText: {
    color: "#FFFFFF",
  },
});
